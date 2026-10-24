import os
from pathlib import Path

import pytest

TEST_DB = Path(__file__).resolve().parent / "test.db"
os.environ["DATABASE_URL"] = f"sqlite:///{TEST_DB}"
os.environ["SECRET_KEY"] = "test-secret-key-not-for-production"
os.environ["ADMIN_USERNAME"] = "admin"
os.environ["ADMIN_PASSWORD"] = "test-pass-123"
os.environ["FRONTEND_ORIGINS"] = "http://testserver"
os.environ["TELEGRAM_BOT_TOKEN"] = ""
os.environ["TELEGRAM_CHAT_ID"] = ""

if TEST_DB.exists():
    TEST_DB.unlink()


@pytest.fixture(autouse=True)
def reset_rate_limiter():
    """Cada test arranca con los contadores de solicitudes en cero."""
    from app.rate_limit import limiter

    limiter.reset()
    yield
    limiter.reset()
