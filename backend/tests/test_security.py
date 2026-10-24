"""Pruebas de seguridad: sesión del panel, CSRF, honeypot y límites."""

import json
from base64 import b64encode
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from itsdangerous import TimestampSigner

from app.config import get_settings
from app.db import Base, engine
from main import app

get_settings.cache_clear()
Base.metadata.create_all(bind=engine)

client = TestClient(app)

ADMIN_HEADERS = {"X-Requested-With": "FrutiAdmin"}
SECRET_KEY = "test-secret-key-not-for-production"


def order_payload(**overrides):
    payload = {
        "name": "Cliente Prueba",
        "whatsapp": "3001234567",
        "whatsapp_consent": True,
        "items": [{"product_id": 1, "quantity": 1}],
    }
    payload.update(overrides)
    return payload


def place_order(**overrides):
    return client.post(
        "/api/orders",
        headers={"Idempotency-Key": str(uuid4())},
        json=order_payload(**overrides),
    )


def forged_admin_cookie(secret: str) -> str:
    """Reproduce el formato exacto de la cookie de sesión de Starlette."""
    signer = TimestampSigner(secret)
    data = b64encode(json.dumps({"role": "admin"}).encode("utf-8"))
    return signer.sign(data).decode("utf-8")


# --------------------------------------------------------------------------
# Sesión del panel
# --------------------------------------------------------------------------

ADMIN_ENDPOINTS = [
    ("GET", "/api/admin/orders", None),
    ("GET", "/api/admin/orders/FD-0001", None),
    ("PATCH", "/api/admin/orders/FD-0001/status", {"status": "en_preparacion"}),
    ("PATCH", "/api/admin/orders/FD-0001/payment", {"payment_status": "pagado"}),
    (
        "PUT",
        "/api/admin/settings",
        {
            "business_name": "Fruti Delicias",
            "address": "Calle 1 # 2-3",
            "pickup_hours": "Vie–Dom · 11:00–20:00",
            "contact_phone": "3000000000",
            "payment_methods": "Efectivo y Nequi al recoger",
        },
    ),
]


@pytest.mark.parametrize("method,path,body", ADMIN_ENDPOINTS)
def test_admin_endpoints_require_session(method, path, body):
    client.cookies.clear()
    response = client.request(method, path, json=body)
    assert response.status_code in (401, 503)


@pytest.mark.parametrize("secret", ["dev-only-change-me", "", "otro-secreto"])
def test_known_or_weak_secret_cannot_forge_admin_session(secret):
    """Una cookie firmada con una clave conocida NO puede abrir el panel."""
    client.cookies.clear()
    client.cookies.set("fd_session", forged_admin_cookie(secret))
    response = client.get("/api/admin/orders")
    assert response.status_code in (401, 503)
    client.cookies.clear()


def test_cookie_signed_with_the_real_secret_is_accepted():
    """Contraprueba: el formato de la cookie es correcto y solo el secreto cuenta."""
    client.cookies.clear()
    client.cookies.set("fd_session", forged_admin_cookie(SECRET_KEY))
    response = client.get("/api/admin/orders")
    assert response.status_code == 200
    client.cookies.clear()


def test_login_uses_the_configured_credentials():
    client.cookies.clear()
    wrong = client.post(
        "/api/admin/login",
        headers=ADMIN_HEADERS,
        json={"username": "admin", "password": "incorrecta"},
    )
    assert wrong.status_code == 401

    right = client.post(
        "/api/admin/login",
        headers=ADMIN_HEADERS,
        json={"username": "admin", "password": "test-pass-123"},
    )
    assert right.status_code == 200
    client.cookies.clear()


def test_logout_requires_the_csrf_header():
    client.cookies.clear()
    client.post(
        "/api/admin/login",
        headers=ADMIN_HEADERS,
        json={"username": "admin", "password": "test-pass-123"},
    )
    without_header = client.post("/api/admin/logout")
    assert without_header.status_code == 403

    with_header = client.post("/api/admin/logout", headers=ADMIN_HEADERS)
    assert with_header.status_code == 200
    client.cookies.clear()


def test_admin_mutations_require_the_csrf_header():
    client.cookies.clear()
    client.post(
        "/api/admin/login",
        headers=ADMIN_HEADERS,
        json={"username": "admin", "password": "test-pass-123"},
    )
    created = place_order()
    public_id = created.json()["public_id"]

    without_header = client.patch(
        f"/api/admin/orders/{public_id}/status",
        json={"status": "en_preparacion"},
    )
    assert without_header.status_code == 403
    client.cookies.clear()


# --------------------------------------------------------------------------
# CSRF y honeypot
# --------------------------------------------------------------------------

def test_honeypot_rejects_bots():
    response = place_order(website="http://spam.example.com")
    assert response.status_code == 400
    assert "rechazada" in response.json()["detail"].lower()


def test_public_order_data_is_not_exposed():
    """No existe un endpoint público para consultar pedidos de otros."""
    for path in ("/api/orders", "/api/orders/FD-0001"):
        response = client.get(path)
        assert response.status_code in (404, 405)


# --------------------------------------------------------------------------
# Límites de solicitudes
# --------------------------------------------------------------------------

def test_rate_limit_per_phone():
    phone = "3010000001"
    for _ in range(5):
        response = place_order(whatsapp=phone)
        assert response.status_code == 200

    blocked = place_order(whatsapp=phone)
    assert blocked.status_code == 429
    assert "demasiadas" in blocked.json()["detail"].lower()


def test_rate_limit_does_not_block_other_phones():
    place_order(whatsapp="3010000002")
    response = place_order(whatsapp="3010000003")
    assert response.status_code == 200


def test_client_ip_uses_the_last_forwarded_value():
    """El cliente no puede saltarse el límite falseando X-Forwarded-For."""
    from app.rate_limit import client_ip

    class FakeClient:
        host = "127.0.0.1"

    class FakeRequest:
        client = FakeClient()

        def __init__(self, headers):
            self.headers = headers

    request = FakeRequest({"x-forwarded-for": "9.9.9.9, 8.8.8.8"})
    assert client_ip(request) == "8.8.8.8"


def test_client_ip_falls_back_to_the_peer():
    from app.rate_limit import client_ip

    class FakeClient:
        host = "203.0.113.9"

    class FakeRequest:
        client = FakeClient()
        headers = {}

    assert client_ip(FakeRequest()) == "203.0.113.9"


# --------------------------------------------------------------------------
# Configuración de orígenes (CORS)
# --------------------------------------------------------------------------

def test_invalid_frontend_origins_are_rejected():
    """Un origen mal escrito deja el panel sin acceso: se falla al arrancar."""
    from app.config import Settings

    with pytest.raises(ValueError):
        Settings(frontend_origins="mi-app.replit.app").origin_list()


def test_empty_frontend_origins_are_rejected():
    from app.config import Settings

    with pytest.raises(ValueError):
        Settings(frontend_origins="  ,  ").origin_list()


def test_valid_frontend_origins_are_normalized():
    from app.config import Settings

    origins = Settings(
        frontend_origins="https://mi-app.replit.app/, http://localhost:3000"
    ).origin_list()
    assert origins == ["https://mi-app.replit.app", "http://localhost:3000"]
