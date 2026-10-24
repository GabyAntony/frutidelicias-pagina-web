from typing import Any

# Source of truth for prices. The browser must never override these values.
PRODUCTS: list[dict[str, Any]] = [
    {
        "id": 1,
        "name": "Bowl Fresa & Chocolate",
        "description": "Fresas frescas bañadas en chocolate artesanal.",
        "price": 45,
        "image_slot": "bowl-fresa-chocolate",
    },
    {
        "id": 2,
        "name": "Brocheta Tropical",
        "description": "Piña, fresa y uva con toque de chocolate.",
        "price": 35,
        "image_slot": "brocheta-tropical",
    },
    {
        "id": 3,
        "name": "Mix Crocante",
        "description": "Fruta de temporada con cobertura crocante.",
        "price": 40,
        "image_slot": "mix-crocante",
    },
    {
        "id": 4,
        "name": "Delicia Premium",
        "description": "El match perfecto: fruta fresca + chocolate real.",
        "price": 55,
        "image_slot": "delicia-premium",
    },
]

PRODUCTS_BY_ID = {item["id"]: item for item in PRODUCTS}

DEFAULT_SETTINGS = {
    "business_name": "Fruti Delicias",
    "address": "Local Fruti Delicias — actualiza la dirección en el panel",
    "pickup_hours": "Vie–Dom · 11:00–20:00",
    "contact_phone": "3000000000",
    "payment_methods": "Efectivo y Nequi al recoger",
}


def get_product(product_id: int) -> dict[str, Any] | None:
    return PRODUCTS_BY_ID.get(product_id)


def format_cop(amount: int) -> str:
    formatted = f"{int(amount):,}".replace(",", ".")
    return f"${formatted} COP"
