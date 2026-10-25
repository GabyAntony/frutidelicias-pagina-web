from app.db import make_engine, normalize_database_url


def test_normalize_database_url_accepts_provider_urls():
    assert (
        normalize_database_url("postgres://u:p@host:5432/db")
        == "postgresql+psycopg://u:p@host:5432/db"
    )
    assert (
        normalize_database_url("postgresql://u:p@host:5432/db")
        == "postgresql+psycopg://u:p@host:5432/db"
    )
    assert (
        normalize_database_url("postgresql+psycopg://u:p@host:5432/db")
        == "postgresql+psycopg://u:p@host:5432/db"
    )
    assert (
        normalize_database_url("sqlite:///./data/fruti.db")
        == "sqlite:///./data/fruti.db"
    )


def test_make_engine_uses_psycopg_for_postgres_urls():
    # create_engine no abre conexión: solo comprobamos que el dialecto y el
    # driver elegidos sean los correctos.
    engine = make_engine("postgresql://u:p@localhost:5432/fruti")
    try:
        assert engine.dialect.name == "postgresql"
        assert engine.dialect.driver == "psycopg"
    finally:
        engine.dispose()
