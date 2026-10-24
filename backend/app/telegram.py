import logging

import httpx

from app.catalog import format_cop
from app.config import get_settings
from app.models import Order
from app.timeutils import bogota_str

logger = logging.getLogger("fruti.telegram")

STATUS_LABELS = {
    "nuevo": "Nuevo",
    "en_preparacion": "En preparación",
    "listo_para_recoger": "Listo para recoger",
    "entregado": "Entregado",
    "cancelado": "Cancelado",
}

TELEGRAM_TIMEOUT_SECONDS = 5.0


def build_order_message(order: Order, items: list[dict]) -> str:
    lines = [
        "🛍️ NUEVO PEDIDO",
        f"- Número de pedido: {order.public_id}",
        f"- Nombre del cliente: {order.customer_name}",
        f"- Teléfono: +{order.customer_phone}",
        "- Productos y cantidades:",
    ]
    for item in items:
        lines.append(
            f"  · {item['name']} x{item['quantity']} ({format_cop(item['line_total'])})"
        )
    created = bogota_str(order.created_at)
    lines.extend(
        [
            f"- Total: {format_cop(order.total)}",
            f"- Fecha y hora: {created} (hora de Bogotá)",
            f"- Estado del pedido: {STATUS_LABELS.get(order.status, order.status)}",
        ]
    )
    return "\n".join(lines)


def _post_message(url: str, payload: dict) -> tuple[bool, str]:
    """Envia el mensaje a Telegram. Nunca lanza excepciones.

    Se separa en su propia función para poder simularla en las pruebas sin
    tocar la red.
    """
    try:
        with httpx.Client(timeout=TELEGRAM_TIMEOUT_SECONDS) as client:
            response = client.post(url, json=payload)
    except httpx.HTTPError:
        logger.error("No se pudo contactar Telegram.")
        return False, "Telegram no disponible"

    if response.status_code >= 400:
        logger.error("Telegram rechazó la notificación (HTTP %s).", response.status_code)
        return False, "Telegram no disponible"

    return True, ""


def notify_new_order(order: Order, items: list[dict]) -> tuple[bool, str]:
    """Envía la alerta al dueño. Devuelve (enviado, error).

    Nunca incluye el token ni el chat id en los logs.
    """
    settings = get_settings()
    token = settings.telegram_bot_token.strip()
    chat_id = settings.telegram_chat_id.strip()
    if not token or not chat_id:
        logger.warning("Telegram no configurado; el pedido se guardó sin notificación.")
        return False, "Telegram no configurado"

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": build_order_message(order, items),
        "disable_web_page_preview": True,
    }

    return _post_message(url, payload)
