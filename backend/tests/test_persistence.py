"""Pruebas de persistencia, precios en el servidor y estados del pedido."""

import os
from uuid import uuid4

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.config import get_settings
from app.db import Base, engine, make_engine
from app.models import Order
from main import app

get_settings.cache_clear()
Base.metadata.create_all(bind=engine)

client = TestClient(app)

ADMIN_HEADERS = {"X-Requested-With": "FrutiAdmin"}


def place_order(**overrides):
    payload = {
        "name": "Cliente Persistencia",
        "whatsapp": "3001234567",
        "whatsapp_consent": True,
        "items": [{"product_id": 1, "quantity": 1}],
    }
    payload.update(overrides)
    return client.post(
        "/api/orders",
        headers={"Idempotency-Key": str(uuid4())},
        json=payload,
    )


def login():
    response = client.post(
        "/api/admin/login",
        headers=ADMIN_HEADERS,
        json={"username": "admin", "password": "test-pass-123"},
    )
    assert response.status_code == 200


# --------------------------------------------------------------------------
# Persistencia
# --------------------------------------------------------------------------

def test_order_survives_a_restart():
    """El pedido queda en el archivo de base de datos, no en memoria."""
    created = place_order()
    public_id = created.json()["public_id"]
    total = created.json()["total"]

    # Simula un reinicio: motor nuevo sobre el mismo archivo.
    restarted_engine = make_engine(os.environ["DATABASE_URL"])
    Base.metadata.create_all(bind=restarted_engine)
    try:
        with Session(restarted_engine) as db:
            order = db.query(Order).filter(Order.public_id == public_id).one()
            assert order is not None
            assert order.total == total
            assert order.customer_name == "Cliente Persistencia"
            assert order.customer_phone == "573001234567"
            assert order.status == "nuevo"
            assert order.payment_status == "pendiente"
    finally:
        restarted_engine.dispose()


def test_created_at_is_returned_as_explicit_utc():
    """La fecha se serializa en UTC con 'Z' para que el navegador no la descuadre."""
    created = place_order()
    public_id = created.json()["public_id"]

    login()
    detail = client.get(f"/api/admin/orders/{public_id}")
    created_at = detail.json()["created_at"]
    assert created_at.endswith("Z")
    assert "+00:00" not in created_at
    client.cookies.clear()


def test_whatsapp_consent_is_stored():
    response = place_order()
    public_id = response.json()["public_id"]
    with Session(engine) as db:
        order = db.query(Order).filter(Order.public_id == public_id).one()
        assert order.whatsapp_consent is True


# --------------------------------------------------------------------------
# Precios calculados en el servidor
# --------------------------------------------------------------------------

def test_browser_cannot_override_the_price():
    response = place_order(
        items=[
            {"product_id": 1, "quantity": 2, "price": 1},
            {"product_id": 4, "quantity": 1, "unit_price": 0, "line_total": 0},
        ]
    )
    data = response.json()
    assert data["total"] == 145
    assert [line["unit_price"] for line in data["items"]] == [45, 55]


def test_unknown_product_is_rejected():
    response = place_order(items=[{"product_id": 999, "quantity": 1}])
    assert response.status_code == 400


def test_duplicate_items_are_merged():
    response = place_order(
        items=[
            {"product_id": 1, "quantity": 1},
            {"product_id": 1, "quantity": 2},
        ]
    )
    data = response.json()
    assert len(data["items"]) == 1
    assert data["items"][0]["quantity"] == 3
    assert data["total"] == 135


def test_too_many_units_are_rejected():
    """El pedido completo no puede pasar de 40 unidades."""
    response = place_order(
        items=[
            {"product_id": 1, "quantity": 20},
            {"product_id": 2, "quantity": 20},
            {"product_id": 3, "quantity": 1},
        ]
    )
    assert response.status_code == 400
    assert "cantidad máxima" in response.json()["detail"].lower()


def test_idempotent_retry_returns_the_same_order():
    key = str(uuid4())
    payload = {
        "name": "Diego Mesa",
        "whatsapp": "3015556677",
        "whatsapp_consent": True,
        "items": [{"product_id": 2, "quantity": 1}],
    }
    first = client.post("/api/orders", headers={"Idempotency-Key": key}, json=payload)
    second = client.post("/api/orders", headers={"Idempotency-Key": key}, json=payload)

    assert first.status_code == 200
    assert second.status_code == 200
    assert first.json()["public_id"] == second.json()["public_id"]
    assert first.json()["created"] is True
    assert second.json()["created"] is False

    with Session(engine) as db:
        count = db.query(Order).filter(Order.idempotency_key == key).count()
        assert count == 1


def test_missing_idempotency_key_is_rejected():
    response = client.post(
        "/api/orders",
        json={
            "name": "Sin Clave",
            "whatsapp": "3001234567",
            "whatsapp_consent": True,
            "items": [{"product_id": 1, "quantity": 1}],
        },
    )
    assert response.status_code == 400


# --------------------------------------------------------------------------
# Estados del pedido
# --------------------------------------------------------------------------

def test_status_transitions_follow_the_allowed_flow():
    created = place_order()
    public_id = created.json()["public_id"]

    login()

    invalid = client.patch(
        f"/api/admin/orders/{public_id}/status",
        headers=ADMIN_HEADERS,
        json={"status": "listo_para_recoger"},
    )
    assert invalid.status_code == 400

    for status in ("en_preparacion", "listo_para_recoger", "entregado"):
        response = client.patch(
            f"/api/admin/orders/{public_id}/status",
            headers=ADMIN_HEADERS,
            json={"status": status},
        )
        assert response.status_code == 200
        assert response.json()["status"] == status

    client.cookies.clear()


def test_cancelled_order_cannot_be_marked_as_paid():
    created = place_order()
    public_id = created.json()["public_id"]

    login()
    client.patch(
        f"/api/admin/orders/{public_id}/status",
        headers=ADMIN_HEADERS,
        json={"status": "cancelado"},
    )
    response = client.patch(
        f"/api/admin/orders/{public_id}/payment",
        headers=ADMIN_HEADERS,
        json={"payment_status": "pagado"},
    )
    assert response.status_code == 400
    client.cookies.clear()


def test_payment_status_can_be_updated():
    created = place_order()
    public_id = created.json()["public_id"]

    login()
    response = client.patch(
        f"/api/admin/orders/{public_id}/payment",
        headers=ADMIN_HEADERS,
        json={"payment_status": "pagado"},
    )
    assert response.status_code == 200
    assert response.json()["payment_status"] == "pagado"
    client.cookies.clear()


def test_admin_can_filter_by_status():
    created = place_order()
    public_id = created.json()["public_id"]

    login()
    client.patch(
        f"/api/admin/orders/{public_id}/status",
        headers=ADMIN_HEADERS,
        json={"status": "en_preparacion"},
    )

    listed = client.get("/api/admin/orders?status_filter=en_preparacion")
    assert listed.status_code == 200
    assert any(item["public_id"] == public_id for item in listed.json())

    other = client.get("/api/admin/orders?status_filter=entregado")
    assert all(item["public_id"] != public_id for item in other.json())
    client.cookies.clear()


def test_store_settings_are_saved_and_read_back():
    login()
    payload = {
        "business_name": "Fruti Delicias Test",
        "address": "Carrera 10 # 20-30",
        "pickup_hours": "Sáb–Dom · 10:00–18:00",
        "contact_phone": "3001234567",
        "payment_methods": "Efectivo y Nequi al recoger",
    }
    response = client.put("/api/admin/settings", headers=ADMIN_HEADERS, json=payload)
    assert response.status_code == 200
    assert response.json()["business_name"] == "Fruti Delicias Test"

    public = client.get("/api/store")
    assert public.json()["address"] == "Carrera 10 # 20-30"
    client.cookies.clear()


def test_whatsapp_link_only_appears_when_the_order_is_ready():
    created = place_order()
    public_id = created.json()["public_id"]

    login()
    not_ready = client.get(f"/api/admin/orders/{public_id}")
    assert not_ready.json()["whatsapp_url"] is None

    client.patch(
        f"/api/admin/orders/{public_id}/status",
        headers=ADMIN_HEADERS,
        json={"status": "en_preparacion"},
    )
    client.patch(
        f"/api/admin/orders/{public_id}/status",
        headers=ADMIN_HEADERS,
        json={"status": "listo_para_recoger"},
    )
    ready = client.get(f"/api/admin/orders/{public_id}")
    assert ready.json()["whatsapp_url"].startswith("https://wa.me/573001234567?text=")
    client.cookies.clear()
