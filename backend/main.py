import logging
import secrets
from contextlib import asynccontextmanager

from fastapi import BackgroundTasks, Depends, FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import EmailStr, TypeAdapter
from sqlalchemy import select
from sqlalchemy.orm import Session
from starlette.middleware.sessions import SessionMiddleware

from app.auth import (
    admin_configured,
    authenticate,
    is_admin,
    login_admin,
    logout_admin,
    require_admin,
    require_admin_mutation,
    require_csrf,
)
from app.catalog import PRODUCTS
from app.config import get_settings
from app.db import Base, engine, get_db
from app.models import Order, StoreSettings
from app.orders import (
    create_order,
    deliver_telegram_notification,
    ensure_settings,
    parse_idempotency_key,
    serialize_order,
    update_payment,
    update_status,
)
from app.phone import normalize_co_phone
from app.rate_limit import client_ip, limiter
from app.schemas import (
    ContactRequest,
    LoginRequest,
    NewsletterRequest,
    OrderCreate,
    OrderStatusUpdate,
    PaymentStatusUpdate,
    SettingsUpdate,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("fruti")
email_adapter = TypeAdapter(EmailStr)

# Límites de pedidos. En una feria todos los clientes comparten la misma IP
# (misma WiFi), así que el límite por IP es amplio y el que protege de verdad
# es el del teléfono.
ORDER_LIMIT_PER_IP = 60
ORDER_LIMIT_PER_PHONE = 5
RATE_WINDOW_SECONDS = 3600


@asynccontextmanager
async def lifespan(_app: FastAPI):
    Base.metadata.create_all(bind=engine)
    from app.db import SessionLocal

    db = SessionLocal()
    try:
        ensure_settings(db)
    finally:
        db.close()
    yield


settings = get_settings()

session_secret = settings.secret_key.strip()
if not session_secret:
    # Sin SECRET_KEY no se puede validar la firma de las cookies, así que se usa
    # una clave aleatoria por proceso: las cookies falsificadas dejan de servir
    # y el panel queda deshabilitado hasta que se defina el secreto.
    session_secret = secrets.token_urlsafe(32)
    logger.warning(
        "SECRET_KEY no está configurada. El panel de administración quedará "
        "deshabilitado hasta que la definas en los Secrets de Replit."
    )
elif not admin_configured():
    logger.warning(
        "Faltan ADMIN_USERNAME o ADMIN_PASSWORD. El panel no permitirá iniciar sesión."
    )

try:
    allowed_origins = settings.origin_list()
except ValueError as exc:
    logger.error("Configuración inválida de FRONTEND_ORIGINS: %s", exc)
    raise

app = FastAPI(
    title="Fruti Delicias API",
    description="Backend para la landing y el sistema de pedidos de Fruti Delicias",
    version="1.2.0",
    lifespan=lifespan,
)

app.add_middleware(
    SessionMiddleware,
    secret_key=session_secret,
    session_cookie="fd_session",
    same_site=settings.cookie_samesite,
    https_only=settings.cookie_secure,
    max_age=60 * 60 * 12,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "PUT", "OPTIONS"],
    allow_headers=["Content-Type", "Idempotency-Key", "X-Requested-With"],
)


@app.get("/api/health")
def health():
    return {"status": "ok", "brand": "Fruti Delicias"}


@app.get("/api/products")
def get_products():
    return PRODUCTS


@app.get("/api/store")
def get_store(db: Session = Depends(get_db)):
    row = ensure_settings(db)
    return {
        "business_name": row.business_name,
        "address": row.address,
        "pickup_hours": row.pickup_hours,
        "contact_phone": row.contact_phone,
        "payment_methods": row.payment_methods,
    }


@app.post("/api/newsletter")
def subscribe_newsletter(payload: NewsletterRequest):
    try:
        email_adapter.validate_python(payload.email)
    except Exception as exc:
        raise HTTPException(status_code=422, detail="Correo no válido.") from exc
    return {
        "success": True,
        "message": "¡Listo! Pronto te llegarán antojos dulces.",
        "email": payload.email,
    }


@app.post("/api/contact")
def contact(payload: ContactRequest):
    return {
        "success": True,
        "message": "Gracias por escribirnos. Te respondemos pronto.",
        "name": payload.name,
    }


@app.post("/api/orders")
def place_order(
    request: Request,
    payload: OrderCreate,
    background: BackgroundTasks,
    db: Session = Depends(get_db),
):
    limiter.hit(
        f"order:ip:{client_ip(request)}",
        limit=ORDER_LIMIT_PER_IP,
        window_seconds=RATE_WINDOW_SECONDS,
    )
    try:
        phone_key = normalize_co_phone(payload.whatsapp)
    except ValueError:
        phone_key = "telefono-invalido"
    limiter.hit(
        f"order:tel:{phone_key}",
        limit=ORDER_LIMIT_PER_PHONE,
        window_seconds=RATE_WINDOW_SECONDS,
    )

    key = parse_idempotency_key(request.headers.get("idempotency-key"))
    order, lines, created = create_order(db, payload, key)

    if created:
        # El pedido ya está confirmado en la base de datos. La alerta de
        # Telegram se manda en segundo plano: si Telegram falla o está lento,
        # el pedido sigue guardado y se puede ver en el panel.
        background.add_task(deliver_telegram_notification, order.id)

    message = (
        f"Recibimos tu pedido {order.public_id}. Está pendiente de preparación. "
        "Te escribiremos por WhatsApp cuando esté listo para recoger."
    )
    return {
        "ok": True,
        "created": created,
        "public_id": order.public_id,
        "status": order.status,
        "payment_status": order.payment_status,
        "total": order.total,
        "items": lines,
        "message": message,
        "telegram_notified": order.telegram_notified,
    }


@app.post("/api/admin/login")
def admin_login(request: Request, payload: LoginRequest):
    require_csrf(request)
    limiter.hit(f"login:{client_ip(request)}", limit=8, window_seconds=900)
    if not admin_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="El panel no está configurado. Define SECRET_KEY, ADMIN_USERNAME y ADMIN_PASSWORD.",
        )
    if not authenticate(payload.username, payload.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos.",
        )
    login_admin(request)
    return {"ok": True}


@app.post("/api/admin/logout")
def admin_logout(request: Request):
    require_admin(request)
    require_csrf(request)
    logout_admin(request)
    return {"ok": True}


@app.get("/api/admin/me")
def admin_me(request: Request):
    if not is_admin(request):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No autenticado.")
    return {"ok": True, "username": get_settings().admin_username}


@app.get("/api/admin/orders")
def list_orders(request: Request, status_filter: str | None = None, db: Session = Depends(get_db)):
    require_admin(request)
    store = ensure_settings(db)
    stmt = select(Order).order_by(Order.created_at.desc())
    if status_filter:
        stmt = stmt.where(Order.status == status_filter)
    orders = db.scalars(stmt).all()
    return [serialize_order(order, store, include_admin=True) for order in orders]


@app.get("/api/admin/orders/{public_id}")
def get_order(public_id: str, request: Request, db: Session = Depends(get_db)):
    require_admin(request)
    order = db.scalar(select(Order).where(Order.public_id == public_id))
    if not order:
        raise HTTPException(status_code=404, detail="Pedido no encontrado.")
    return serialize_order(order, ensure_settings(db), include_admin=True)


@app.patch("/api/admin/orders/{public_id}/status")
def patch_status(
    public_id: str,
    payload: OrderStatusUpdate,
    request: Request,
    db: Session = Depends(get_db),
):
    require_admin_mutation(request)
    order = db.scalar(select(Order).where(Order.public_id == public_id))
    if not order:
        raise HTTPException(status_code=404, detail="Pedido no encontrado.")
    order = update_status(db, order, payload.status)
    return serialize_order(order, ensure_settings(db), include_admin=True)


@app.patch("/api/admin/orders/{public_id}/payment")
def patch_payment(
    public_id: str,
    payload: PaymentStatusUpdate,
    request: Request,
    db: Session = Depends(get_db),
):
    require_admin_mutation(request)
    order = db.scalar(select(Order).where(Order.public_id == public_id))
    if not order:
        raise HTTPException(status_code=404, detail="Pedido no encontrado.")
    order = update_payment(db, order, payload.payment_status)
    return serialize_order(order, ensure_settings(db), include_admin=True)


@app.put("/api/admin/settings")
def put_settings(payload: SettingsUpdate, request: Request, db: Session = Depends(get_db)):
    require_admin_mutation(request)
    row = ensure_settings(db)
    row.business_name = payload.business_name.strip()
    row.address = payload.address.strip()
    row.pickup_hours = payload.pickup_hours.strip()
    row.contact_phone = payload.contact_phone.strip()
    row.payment_methods = payload.payment_methods.strip()
    db.commit()
    db.refresh(row)
    return {
        "business_name": row.business_name,
        "address": row.address,
        "pickup_hours": row.pickup_hours,
        "contact_phone": row.contact_phone,
        "payment_methods": row.payment_methods,
    }
