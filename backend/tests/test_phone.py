import pytest

from app.phone import normalize_co_phone


def test_local_mobile():
    assert normalize_co_phone("300 123 4567") == "573001234567"


def test_plus_prefix():
    assert normalize_co_phone("+57 3001234567") == "573001234567"


def test_rejects_invalid():
    with pytest.raises(ValueError):
        normalize_co_phone("123")
    with pytest.raises(ValueError):
        normalize_co_phone("6011234567")
