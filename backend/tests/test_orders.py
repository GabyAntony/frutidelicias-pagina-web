from unittest.mock import patch
from uuid import uuid4

from fastapi.testclient import TestClient

from app.config import get_settings
from app.db import Base, engine
from main import app

get_settings.cache_clear()
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

client = TestClient(app)


def auth_headers():
    return {"X-Requested-With": "FrutiAdmin"}


def login():
    response = client.post(
        "/api/admin/login",
        headers=auth_headers(),
        json={"username": "admin", "password": "test-pass-123"},
    )
    assert response.status_code == 200


def test_server_calculates_total_and_ignores_client_prices():
    key = str(uuid4())
    response = client.post(
        "/api/orders",
        headers={"Idempotency-Key": key},
        json={
            "name": "Camila Ruiz",
            "whatsapp": "3001234567",
            "whatsapp_consent": True,
            "notes": "Sin maní",
            "items": [{"product_id": 1, "quantity": 2, "price": 1}],
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["public_id"].startswith("FD-")
    assert data["total"] == 90
    assert data["status"] == "nuevo"
    assert data["created"] is True


def test_idempotent_retry_does_not_duplicate():
    key = str(uuid4())
    payload = {
        "name": "Diego Mesa",
        "whatsapp": "+57 3015556677",
        "whatsapp_consent": True,
        "items": [{"product_id": 2, "quantity": 1}],
    }
    first = client.post("/api/orders", headers={"Idempotency-Key": key}, json=payload)
    second = client.post("/api/orders", headers={"Idempotency-Key": key}, json=payload)
    assert first.status_code == 200
    assert second.status_code == 200
    assert first.json()["public_id"] == second.json()["public_id"]
    assert second.json()["created"] is False


def test_validation_errors():
    response = client.post(
        "/api/orders",
        headers={"Idempotency-Key": str(uuid4())},
        json={
            "name": "A",
            "whatsapp": "123",
            "whatsapp_consent": False,
            "items": [],
        },
    )
    assert response.status_code == 422


def test_telegram_failure_still_saves_order():
    key = str(uuid4())
    with patch("app.orders.notify_new_order", return_value=(False, "Telegram no disponible")):
        response = client.post(
            "/api/orders",
            headers={"Idempotency-Key": key},
            json={
                "name": "Valeria Soto",
                "whatsapp": "3101112233",
                "whatsapp_consent": True,
                "items": [{"product_id": 4, "quantity": 1}],
            },
        )
    assert response.status_code == 200
    assert response.json()["telegram_notified"] is False
    public_id = response.json()["public_id"]

    login()
    listed = client.get("/api/admin/orders")
    assert listed.status_code == 200
    assert any(item["public_id"] == public_id for item in listed.json())


def test_admin_auth_required_and_whatsapp_link():
    client.cookies.clear()
    unauth = client.get("/api/admin/orders")
    assert unauth.status_code == 401

    login()
    key = str(uuid4())
    created = client.post(
        "/api/orders",
        headers={"Idempotency-Key": key},
        json={
            "name": "Ana Pérez",
            "whatsapp": "3124445566",
            "whatsapp_consent": True,
            "items": [{"product_id": 3, "quantity": 1}],
        },
    )
    public_id = created.json()["public_id"]

    preparing = client.patch(
        f"/api/admin/orders/{public_id}/status",
        headers=auth_headers(),
        json={"status": "en_preparacion"},
    )
    assert preparing.status_code == 200

    ready = client.patch(
        f"/api/admin/orders/{public_id}/status",
        headers=auth_headers(),
        json={"status": "listo_para_recoger"},
    )
    assert ready.status_code == 200
    url = ready.json()["whatsapp_url"]
    assert url.startswith("https://wa.me/573124445566?text=")
    from urllib.parse import unquote

    decoded = unquote(url)
    assert "Ana Pérez" in decoded
    assert "listo para recoger" in decoded
    assert "$40 COP" in decoded or "$40" in decoded

    paid = client.patch(
        f"/api/admin/orders/{public_id}/payment",
        headers=auth_headers(),
        json={"payment_status": "pagado"},
    )
    assert paid.json()["payment_status"] == "pagado"
