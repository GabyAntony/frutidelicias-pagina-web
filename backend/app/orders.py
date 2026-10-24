import json
import logging
from datetime import datetime, timezone
from urllib.parse import quote
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.catalog import DEFAULT_SETTINGS, format_cop, get_product
from app.models import Order, StoreSettings
from app.phone import normalize_co_phone
from app.schemas import ALLOWED_TRANSITIONS, OrderCreate
from app.telegram import notify_new_order

logger = logging.getLogger("fruti.orders")


def ensure_settings(db: Session) -> StoreSettings:
    row = db.get(StoreSettings, 1)
    if row:
        return row
    row = StoreSettings(id=1, **DEFAULT_SETTINGS)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def parse_idempotency_key(raw: str | None) -> str:
    if not raw:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Falta la clave de idempotencia del pedido.",
        )
    try:
        return str(UUID(raw))
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La clave de idempotencia no es válida.",
        ) from exc


def priced_items(payload: OrderCreate) -> tuple[list[dict], int]:
    """Calcula líneas y total usando el catálogo del servidor.

    Los precios que envía el navegador se ignoran por completo.
    """
    merged: dict[int, int] = {}
    for item in payload.items:
        merged[item.product_id] = merged.get(item.product_id, 0) + item.quantity

    if sum(merged.values()) > 40:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El pedido supera la cantidad máxima permitida.",
        )

    lines: list[dict] = []
    total = 0
    for product_id, quantity in merged.items():
        product = get_product(product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uno de los productos ya no está disponible.",
            )
        unit = int(product["price"])
        line_total = unit * quantity
        total += line_total
        lines.append(
            {
                "product_id": product_id,
                "name": product["name"],
                "quantity": quantity,
                "unit_price": unit,
                "line_total": line_total,
            }
        )
    return lines, total


def public_id_for(order_id: int) -> str:
    return f"FD-{order_id:04d}"


def create_order(db: Session, payload: OrderCreate, idempotency_key: str) -> tuple[Order, list[dict], bool]:
    """Guarda el pedido. El precio y el total se calculan aquí, en el servidor.

    Devuelve (pedido, líneas, creado). Si la clave de idempotencia ya existía
    devuelve el pedido original sin crear uno nuevo.
    """
    if payload.website.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Solicitud rechazada.")

    existing = db.scalar(select(Order).where(Order.idempotency_key == idempotency_key))
    if existing:
        return existing, json.loads(existing.items_json), False

    try:
        phone = normalize_co_phone(payload.whatsapp)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    lines, total = priced_items(payload)
    order = Order(
        public_id=f"TMP-{idempotency_key}",
        customer_name=payload.name,
        customer_phone=phone,
        notes=payload.notes,
        items_json=json.dumps(lines, ensure_ascii=False),
        total=total,
        status="nuevo",
        payment_status="pendiente",
        idempotency_key=idempotency_key,
        whatsapp_consent=payload.whatsapp_consent,
        created_at=datetime.now(timezone.utc),
    )
    db.add(order)
    try:
        db.flush()
        order.public_id = public_id_for(order.id)
        db.commit()
    except IntegrityError:
        db.rollback()
        existing = db.scalar(select(Order).where(Order.idempotency_key == idempotency_key))
        if existing:
            return existing, json.loads(existing.items_json), False
        raise
    db.refresh(order)

    return order, lines, True


def deliver_telegram_notification(order_id: int) -> None:
    """Envía la alerta de Telegram fuera del ciclo de la petición.

    Se ejecuta como tarea en segundo plano: si Telegram está caído o lento, el
    cliente no espera. El pedido ya está confirmado en la base de datos antes
    de llamar a esta función, así que un fallo nunca lo pierde.
    """
    from app.db import SessionLocal

    db = SessionLocal()
    try:
        order = db.get(Order, order_id)
        if not order:
            return
        items = json.loads(order.items_json)
        sent, error = notify_new_order(order, items)
        order.telegram_notified = sent
        order.telegram_error = error[:240] if error else ""
        db.commit()
    except Exception:
        logger.exception("Falló la notificación de Telegram del pedido %s.", order_id)
        try:
            db.rollback()
        except Exception:
            pass
    finally:
        db.close()


def items_summary(items: list[dict]) -> str:
    return ", ".join(f"{item['name']} x{item['quantity']}" for item in items)


def whatsapp_url(order: Order, settings: StoreSettings, items: list[dict]) -> str | None:
    if order.status != "listo_para_recoger":
        return None
    message = (
        f"¡Hola, {order.customer_name}! 👋💚 Tu pedido #{order.public_id} de "
        f"{settings.business_name} ya está listo para recoger.\n\n"
        f"📦 Pedido: {items_summary(items)}\n"
        f"💰 Total a pagar: {format_cop(order.total)}\n"
        f"📍 Dirección: {settings.address}\n\n"
        "Puedes pagar al recoger tu pedido, en efectivo o por Nequi.\n\n"
        "¡Te esperamos! Gracias por apoyar nuestro emprendimiento 💚"
    )
    return f"https://wa.me/{order.customer_phone}?text={quote(message)}"


def serialize_order(order: Order, settings: StoreSettings, include_admin: bool = False) -> dict:
    from app.timeutils import utc_iso

    items = json.loads(order.items_json)
    data = {
        "id": order.id,
        "public_id": order.public_id,
        "created_at": utc_iso(order.created_at),
        "customer_name": order.customer_name,
        "customer_phone": f"+{order.customer_phone}",
        "notes": order.notes,
        "items": items,
        "total": order.total,
        "total_label": format_cop(order.total),
        "status": order.status,
        "payment_status": order.payment_status,
        "whatsapp_url": whatsapp_url(order, settings, items) if include_admin else None,
    }
    if include_admin:
        data["telegram_notified"] = order.telegram_notified
        data["telegram_error"] = "La notificación no se envió" if order.telegram_error else ""
    return data


def update_status(db: Session, order: Order, new_status: str) -> Order:
    allowed = ALLOWED_TRANSITIONS.get(order.status, set())
    if new_status not in allowed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ese cambio de estado no está permitido para este pedido.",
        )
    order.status = new_status
    db.commit()
    db.refresh(order)
    return order


def update_payment(db: Session, order: Order, payment_status: str) -> Order:
    if order.status == "cancelado" and payment_status == "pagado":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes marcar como pagado un pedido cancelado.",
        )
    order.payment_status = payment_status
    db.commit()
    db.refresh(order)
    return order
