import sqlite3
from collections.abc import Generator
from pathlib import Path

from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import get_settings


class Base(DeclarativeBase):
    pass


def _sqlite_path(url: str) -> Path | None:
    prefix = "sqlite:///"
    if not url.startswith(prefix):
        return None
    raw = url[len(prefix) :]
    if raw == ":memory:":
        return None
    return Path(raw)


def normalize_database_url(url: str) -> str:
    """Acepta las URLs que suelen dar los proveedores de Postgres.

    SQLAlchemy interpreta `postgresql://` con psycopg2, pero el driver que
    instalamos es psycopg 3. Normalizamos para que una URL copiada de Neon,
    Vercel o Render funcione sin editarla a mano.
    """
    value = url.strip()
    if value.startswith("postgres://"):
        return "postgresql+psycopg://" + value[len("postgres://") :]
    if value.startswith("postgresql://"):
        return "postgresql+psycopg://" + value[len("postgresql://") :]
    return value


@event.listens_for(Engine, "connect")
def _set_sqlite_pragma(dbapi_connection, connection_record):  # noqa: ARG001
    # El listener está registrado en Engine (todas las conexiones), pero los
    # PRAGMA solo son válidos en SQLite. Así el mismo código sirve para una
    # base externa (Postgres, por ejemplo) en Vercel.
    if not isinstance(dbapi_connection, sqlite3.Connection):
        return
    cursor = dbapi_connection.cursor()
    try:
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.execute("PRAGMA journal_mode=WAL")
    finally:
        cursor.close()


def make_engine(url: str | None = None):
    database_url = normalize_database_url(url or get_settings().database_url)
    db_path = _sqlite_path(database_url)
    if db_path:
        db_path.parent.mkdir(parents=True, exist_ok=True)

    connect_args = {}
    engine_kwargs = {"future": True}
    if database_url.startswith("sqlite"):
        connect_args["check_same_thread"] = False
    else:
        # Conexiones sanas en funciones serverless: descarta conexiones viejas
        # y comprueba que sigan vivas antes de usarlas.
        engine_kwargs["pool_pre_ping"] = True
        engine_kwargs["pool_recycle"] = 300

    return create_engine(
        database_url,
        connect_args=connect_args,
        **engine_kwargs,
    )


engine = make_engine()
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
