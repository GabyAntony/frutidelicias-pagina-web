import { WHATSAPP_DEFAULT_MESSAGE } from "@/lib/data";

/**
 * Número público de la marca (el que aparece en las piezas gráficas).
 * Si el panel de administración tiene un teléfono válido distinto, ese manda.
 */
export const BRAND_WHATSAPP = "573207186351";

/** El valor de ejemplo del backend no debe usarse para conversión. */
const PLACEHOLDER_PHONE = "573000000000";

export function normalizePhone(raw?: string): string {
  const digits = (raw ?? "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("57") && digits.length >= 12) return digits;
  if (digits.length === 10 && digits.startsWith("3")) return `57${digits}`;
  return digits;
}

export function resolveWhatsAppPhone(raw?: string): string {
  const normalized = normalizePhone(raw);
  if (!normalized || normalized === PLACEHOLDER_PHONE) {
    return BRAND_WHATSAPP;
  }
  return normalized;
}

export function buildWhatsAppUrl(
  phone: string | undefined,
  message: string = WHATSAPP_DEFAULT_MESSAGE,
): string {
  return `https://wa.me/${resolveWhatsAppPhone(phone)}?text=${encodeURIComponent(message)}`;
}

export function buildProductMessage(name: string, priceLabel: string): string {
  return [
    "¡Hola Fruti Delicias! 🍓🍫",
    `Quiero pedir: ${name} (${priceLabel}).`,
    "¿Me confirman disponibilidad para recoger? ✨",
  ].join("\n");
}
