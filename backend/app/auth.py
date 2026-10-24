import secrets
from collections.abc import Callable

from fastapi import HTTPException, Request, status

from app.config import get_settings

SESSION_ROLE_KEY = "role"

PANEL_NOT_CONFIGURED = (
    "El panel no está configurado. Define SECRET_KEY, ADMIN_USERNAME y "
    "ADMIN_PASSWORD en los Secrets de Replit."
)


def admin_configured() -> bool:
    """El panel solo opera si hay clave de firma y credenciales de acceso."""
    settings = get_settings()
    return bool(
        settings.secret_key.strip()
        and settings.admin_username.strip()
        and settings.admin_password.strip()
    )


def is_admin(request: Request) -> bool:
    return request.session.get(SESSION_ROLE_KEY) == "admin"


def require_admin(request: Request) -> None:
    if not admin_configured():
        # Sin SECRET_KEY no se puede validar la firma de la cookie, así que
        # el panel queda inaccesible en vez de accepts cookies falsificadas.
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=PANEL_NOT_CONFIGURED,
        )
    if not is_admin(request):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inicia sesión para acceder al panel.",
        )


def authenticate(username: str, password: str) -> bool:
    settings = get_settings()
    if not admin_configured():
        return False
    user_ok = secrets.compare_digest(username, settings.admin_username)
    pass_ok = secrets.compare_digest(password, settings.admin_password)
    return user_ok and pass_ok


def login_admin(request: Request) -> None:
    request.session.clear()
    request.session[SESSION_ROLE_KEY] = "admin"


def logout_admin(request: Request) -> None:
    request.session.clear()


def csrf_ok(request: Request) -> bool:
    """CSRF básico: las peticiones que modifican datos deben enviar
    `X-Requested-With`. Un navegador de otro origen no puede añadir cabeceras
    personalizadas sin que el servidor las autorice en CORS."""
    return request.headers.get("x-requested-with") == "FrutiAdmin"


def require_csrf(request: Request) -> None:
    if request.method in {"POST", "PATCH", "PUT", "DELETE"} and not csrf_ok(request):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solicitud no autorizada.",
        )


def require_admin_mutation(request: Request) -> None:
    require_admin(request)
    require_csrf(request)


def admin_guard() -> Callable[[Request], None]:
    return require_admin
