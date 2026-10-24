from datetime import datetime, timedelta, timezone
from functools import lru_cache
from zoneinfo import ZoneInfo

BOGOTA_TZ_NAME = "America/Bogota"

# Colombia no aplica horario de verano desde 1992: UTC-5 todo el año.
# Es el respaldo si el sistema no tiene la base de datos de zonas horarias.
FALLBACK_BOGOTA = timezone(timedelta(hours=-5), BOGOTA_TZ_NAME)


@lru_cache(maxsize=1)
def bogota_tz():
    try:
        return ZoneInfo(BOGOTA_TZ_NAME)
    except Exception:  # pragma: no cover - depende del sistema anfitrión
        return FALLBACK_BOGOTA


def as_utc(value: datetime) -> datetime:
    """Normaliza a UTC. Las fechas sin zona se guardan en UTC."""
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def utc_iso(value: datetime) -> str:
    """ISO 8601 con 'Z' explícito (UTC). El navegador lo interpreta bien."""
    return as_utc(value).isoformat().replace("+00:00", "Z")


def bogota_str(value: datetime, fmt: str = "%Y-%m-%d %H:%M") -> str:
    """Fecha y hora en hora de Colombia (UTC-5)."""
    return as_utc(value).astimezone(bogota_tz()).strftime(fmt)
