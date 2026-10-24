"""Pruebas de la notificación de Telegram: formato, envío y fallos."""

from contextlib import contextmanager
from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import patch
from uuid import uuid4

from fastapi.testclient import TestClient

from app.config import get_settings
from app.db import Base, engine, SessionLocal
from app.models import Order
from app.telegram import build_order_message
from main import app

get_settings.cache_clear()
Base.metadata.create_all(bind=engine)

client = TestClient(app)

FAKE_TOKEN = "123456:FAKE-BOT-TOKEN"
FAKE_CHAT_ID = "-1001234567890"
FAKE_SETTINGS = SimpleNamespace(
    telegram_bot_token=FAKE_TOKEN,
    telegram_chat_id=FAKE_CHAT_ID,
)


@contextmanager
def telegram_configured():
    """Simula que el bot está configurado, sin tocar la red."""
    with patch("app.telegram.get_settings", return_value=FAKE_SETTINGS):
        yield


ITEMS = [
    {
        "product_id": 1,
        "name": "Bowl Fresa & Chocolate",
        "quantity": 2,
        "unit_price": 45,
        "line_total": 90,
    },
    {
        "product_id": 4,
        "name": "Delicia Premium",
        "quantity": 1,
        "unit_price": 55,
        "line_total": 55,
    },
]


def make_order(**overrides) -> Order:
    data = {
        "id": 1,
        "public_id": "FD-0001",
        "created_at": datetime(2026, 1, 15, 18, 30, tzinfo=timezone.utc),
        "customer_name": "Ana Pérez",
        "customer_phone": "573124445566",
        "total": 145,
        "status": "nuevo",
    }
    data.update(overrides)
    return Order(**data)


def test_message_matches_the_expected_format():
    message = build_order_message(make_order(), ITEMS)

    assert message == (
        "🛍️ NUEVO PEDIDO\n"
        "- Número de pedido: FD-0001\n"
        "- Nombre del cliente: Ana Pérez\n"
        "- Teléfono: +573124445566\n"
        "- Productos y cantidades:\n"
        "  · Bowl Fresa & Chocolate x2 ($90 COP)\n"
        "  · Delicia Premium x1 ($55 COP)\n"
        "- Total: $145 COP\n"
        "- Fecha y hora: 2026-01-15 13:30 (hora de Bogotá)\n"
        "- Estado del pedido: Nuevo"
    )


def test_message_uses_bogota_time_not_utc():
    """18:30 UTC son las 13:30 en Colombia (UTC-5)."""
    message = build_order_message(make_order(), ITEMS)
    assert "2026-01-15 13:30" in message
    assert "18:30" not in message


def test_message_shows_the_status_label():
    message = build_order_message(make_order(status="en_preparacion"), ITEMS)
    assert "Estado del pedido: En preparación" in message


def test_message_never_contains_the_bot_token():
    message = build_order_message(make_order(), ITEMS)
    assert FAKE_TOKEN not in message


def test_successful_notification_marks_the_order_as_notified():
    key = str(uuid4())
    with telegram_configured(), patch(
        "app.telegram._post_message", return_value=(True, "")
    ) as sender:
        response = client.post(
            "/api/orders",
            headers={"Idempotency-Key": key},
            json={
                "name": "Camila Ruiz",
                "whatsapp": "3001234567",
                "whatsapp_consent": True,
                "items": [{"product_id": 1, "quantity": 2}],
            },
        )
    assert response.status_code == 200
    public_id = response.json()["public_id"]
    sender.assert_called_once()

    db = SessionLocal()
    try:
        order = db.query(Order).filter(Order.public_id == public_id).one()
        assert order.telegram_notified is True
        assert order.telegram_error == ""
    finally:
        db.close()


def test_token_is_only_used_server_side():
    """El token viaja en la URL de la API de Telegram, nunca en la respuesta."""
    key = str(uuid4())
    with telegram_configured(), patch(
        "app.telegram._post_message", return_value=(True, "")
    ) as sender:
        response = client.post(
            "/api/orders",
            headers={"Idempotency-Key": key},
            json={
                "name": "Camila Ruiz",
                "whatsapp": "3001234567",
                "whatsapp_consent": True,
                "items": [{"product_id": 1, "quantity": 1}],
            },
        )

    assert response.status_code == 200
    assert FAKE_TOKEN not in response.text
    # El token solo aparece en la URL que llama al backend.
    sent_url = sender.call_args.args[0]
    assert sent_url == f"https://api.telegram.org/bot{FAKE_TOKEN}/sendMessage"
    sent_payload = sender.call_args.args[1]
    assert sent_payload["chat_id"] == FAKE_CHAT_ID
    assert "🛍️ NUEVO PEDIDO" in sent_payload["text"]


def test_failed_notification_keeps_the_order_saved():
    key = str(uuid4())
    with telegram_configured(), patch(
        "app.telegram._post_message", return_value=(False, "Telegram no disponible")
    ):
        response = client.post(
            "/api/orders",
            headers={"Idempotency-Key": key},
            json={
                "name": "Diego Mesa",
                "whatsapp": "3015556677",
                "whatsapp_consent": True,
                "items": [{"product_id": 2, "quantity": 1}],
            },
        )
    assert response.status_code == 200
    public_id = response.json()["public_id"]

    db = SessionLocal()
    try:
        order = db.query(Order).filter(Order.public_id == public_id).one()
        assert order.telegram_notified is False
        assert order.telegram_error
        assert order.total == 35
    finally:
        db.close()


def test_notification_does_not_break_the_order_when_telegram_raises():
    """Una excepción inesperada en Telegram no puede perder el pedido."""
    key = str(uuid4())
    with telegram_configured(), patch(
        "app.telegram._post_message", side_effect=RuntimeError("fallo raro")
    ):
        response = client.post(
            "/api/orders",
            headers={"Idempotency-Key": key},
            json={
                "name": "Valeria Soto",
                "whatsapp": "3101112233",
                "whatsapp_consent": True,
                "items": [{"product_id": 3, "quantity": 1}],
            },
        )
    assert response.status_code == 200
    public_id = response.json()["public_id"]

    db = SessionLocal()
    try:
        order = db.query(Order).filter(Order.public_id == public_id).one()
        assert order is not None
        assert order.total == 40
    finally:
        db.close()


def test_missing_credentials_do_not_send_anything():
    from app.telegram import notify_new_order

    with patch("app.telegram._post_message") as sender:
        sent, error = notify_new_order(make_order(), ITEMS)
    assert sent is False
    assert "no configurado" in error.lower()
    sender.assert_not_called()
