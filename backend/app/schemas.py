from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator

ORDER_STATUSES = (
    "nuevo",
    "en_preparacion",
    "listo_para_recoger",
    "entregado",
    "cancelado",
)
PAYMENT_STATUSES = ("pendiente", "pagado")
ALLOWED_TRANSITIONS = {
    "nuevo": {"en_preparacion", "cancelado"},
    "en_preparacion": {"listo_para_recoger", "cancelado"},
    "listo_para_recoger": {"entregado", "cancelado"},
    "entregado": set(),
    "cancelado": set(),
}


class CartItemIn(BaseModel):
    product_id: int = Field(ge=1)
    quantity: int = Field(ge=1, le=20)


class OrderCreate(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    whatsapp: str = Field(min_length=7, max_length=32)
    items: list[CartItemIn] = Field(min_length=1, max_length=20)
    notes: str = Field(default="", max_length=500)
    whatsapp_consent: bool
    website: str = Field(default="", max_length=120)

    @field_validator("name")
    @classmethod
    def clean_name(cls, value: str) -> str:
        cleaned = " ".join(value.split())
        if len(cleaned) < 2:
            raise ValueError("El nombre es obligatorio.")
        return cleaned

    @field_validator("notes")
    @classmethod
    def clean_notes(cls, value: str) -> str:
        return value.strip()

    @field_validator("whatsapp_consent")
    @classmethod
    def require_consent(cls, value: bool) -> bool:
        if not value:
            raise ValueError(
                "Debes autorizar el uso de tu WhatsApp para gestionar el pedido y avisarte cuando esté listo."
            )
        return value


class NewsletterRequest(BaseModel):
    email: str = Field(min_length=5, max_length=160)


class ContactRequest(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: str = Field(min_length=5, max_length=160)
    message: str = Field(min_length=5, max_length=1000)


class LoginRequest(BaseModel):
    username: str = Field(min_length=1, max_length=80)
    password: str = Field(min_length=1, max_length=200)


class OrderStatusUpdate(BaseModel):
    status: Literal[
        "en_preparacion",
        "listo_para_recoger",
        "entregado",
        "cancelado",
    ]


class PaymentStatusUpdate(BaseModel):
    payment_status: Literal["pagado", "pendiente"]


class SettingsUpdate(BaseModel):
    business_name: str = Field(min_length=2, max_length=120)
    address: str = Field(min_length=4, max_length=240)
    pickup_hours: str = Field(min_length=2, max_length=120)
    contact_phone: str = Field(min_length=7, max_length=32)
    payment_methods: str = Field(min_length=3, max_length=160)


class PublicSettings(BaseModel):
    business_name: str
    address: str
    pickup_hours: str
    contact_phone: str
    payment_methods: str


class OrderPublic(BaseModel):
    public_id: str
    created_at: datetime
    status: str
    payment_status: str
    total: int
    items: list[dict]
    customer_name: str
    message: str
    telegram_notified: bool | None = None
