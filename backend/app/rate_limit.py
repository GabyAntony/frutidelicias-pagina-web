import ipaddress
import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request, status

# Ventana máxima que se conserva por clave (1 hora) para no crecer sin límite.
MAX_WINDOW_SECONDS = 3600


class SlidingWindowLimiter:
    """Limitador de solicitudes en ventana deslizante, en memoria del proceso."""

    def __init__(self) -> None:
        self._hits: dict[str, deque[float]] = defaultdict(deque)
        self._last_sweep = 0.0

    def _sweep(self, now: float) -> None:
        """Elimina claves cuya ventana ya expiró para no filtrar memoria."""
        if now - self._last_sweep < 300:
            return
        self._last_sweep = now
        expired = []
        for key, bucket in self._hits.items():
            while bucket and bucket[0] < now - MAX_WINDOW_SECONDS:
                bucket.popleft()
            if not bucket:
                expired.append(key)
        for key in expired:
            self._hits.pop(key, None)

    def hit(self, key: str, limit: int, window_seconds: int) -> None:
        now = time.time()
        self._sweep(now)
        bucket = self._hits[key]
        cutoff = now - window_seconds
        while bucket and bucket[0] < cutoff:
            bucket.popleft()
        if len(bucket) >= limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Demasiadas solicitudes. Espera un momento e inténtalo de nuevo.",
            )
        bucket.append(now)

    def reset(self) -> None:
        self._hits.clear()
        self._last_sweep = 0.0


limiter = SlidingWindowLimiter()


def _is_private(host: str) -> bool:
    try:
        ip = ipaddress.ip_address(host)
    except ValueError:
        return False
    return ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved


def client_ip(request: Request) -> str:
    """IP real del cliente para aplicar límites.

    Usamos el ÚLTIMO valor de `X-Forwarded-For`: es el que añade el proxy más
    cercano (el de Replit) y por tanto el único que el cliente no puede
    falsificar, porque solo puede anteponer valores a la izquierda.
    """
    forwarded = request.headers.get("x-forwarded-for")
    peer = request.client.host if request.client else ""

    if forwarded:
        candidate = forwarded.split(",")[-1].strip()
        if candidate and not _is_private(candidate):
            return candidate

    if peer and not _is_private(peer):
        return peer

    if forwarded:
        candidate = forwarded.split(",")[-1].strip()
        if candidate:
            return candidate

    return peer or "unknown"
