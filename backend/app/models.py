from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class StoreSettings(Base):
    __tablename__ = "store_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    business_name: Mapped[str] = mapped_column(String(120))
    address: Mapped[str] = mapped_column(String(240))
    pickup_hours: Mapped[str] = mapped_column(String(120))
    contact_phone: Mapped[str] = mapped_column(String(32))
    payment_methods: Mapped[str] = mapped_column(String(160))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class Order(Base):
    __tablename__ = "orders"
    __table_args__ = (UniqueConstraint("idempotency_key", name="uq_orders_idempotency"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    public_id: Mapped[str] = mapped_column(String(24), unique=True, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, index=True
    )
    customer_name: Mapped[str] = mapped_column(String(80))
    customer_phone: Mapped[str] = mapped_column(String(16))
    notes: Mapped[str] = mapped_column(Text, default="")
    items_json: Mapped[str] = mapped_column(Text)
    total: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(32), default="nuevo", index=True)
    payment_status: Mapped[str] = mapped_column(String(16), default="pendiente")
    idempotency_key: Mapped[str] = mapped_column(String(80), index=True)
    whatsapp_consent: Mapped[bool] = mapped_column(Boolean, default=False)
    telegram_notified: Mapped[bool] = mapped_column(Boolean, default=False)
    telegram_error: Mapped[str] = mapped_column(String(240), default="")
