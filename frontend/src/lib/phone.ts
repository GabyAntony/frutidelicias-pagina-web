/**
 * Normalización de celular colombiano (+57).
 *
 * Mantiene exactamente las mismas reglas que `backend/app/phone.py` para que
 * el cliente no vea un número como válido en el formulario y luego rechazado
 * por el servidor (o al revés).
 */
export function normalizeCoPhone(raw: string): string | null {
  if (!raw) return null;

  let digits = String(raw).replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);

  // +57 3xx xxx xxxx (12 dígitos)
  if (digits.startsWith("57") && digits.length === 12 && digits[2] === "3") {
    return digits;
  }
  // 3xx xxx xxxx (10 dígitos)
  if (digits.length === 10 && digits.startsWith("3")) {
    return `57${digits}`;
  }
  // 03xx xxx xxxx (11 dígitos)
  if (digits.length === 11 && digits.startsWith("03")) {
    return `57${digits.slice(1)}`;
  }

  return null;
}

export function looksLikeCoMobile(value: string): boolean {
  return normalizeCoPhone(value) !== null;
}
