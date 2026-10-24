import re

PHONE_DIGITS = re.compile(r"\D+")


def normalize_co_phone(raw: str) -> str:
    """Return international digits for Colombia (+57) without the plus sign."""
    if not raw or not str(raw).strip():
        raise ValueError("El número de WhatsApp es obligatorio.")

    digits = PHONE_DIGITS.sub("", str(raw))
    if digits.startswith("00"):
        digits = digits[2:]

    if digits.startswith("57") and len(digits) == 12 and digits[2] == "3":
        return digits

    if len(digits) == 10 and digits.startswith("3"):
        return f"57{digits}"

    if len(digits) == 11 and digits.startswith("03"):
        return f"57{digits[1:]}"

    raise ValueError(
        "Ingresa un celular colombiano válido (10 dígitos que empiecen por 3, o con +57)."
    )


def phone_is_valid(raw: str) -> bool:
    try:
        normalize_co_phone(raw)
        return True
    except ValueError:
        return False
