export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "/backend";

export function formatCop(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Zona horaria del local (Colombia). Las fechas llegan del servidor en UTC con
 * "Z" explícito y se muestran siempre en hora de Bogotá.
 */
export const STORE_TIME_ZONE = "America/Bogota";

export function formatStoreDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: STORE_TIME_ZONE,
  }).format(date);
}

export type StoreInfo = {
  business_name: string;
  address: string;
  pickup_hours: string;
  contact_phone: string;
  payment_methods: string;
};

export type CatalogProduct = {
  id: number;
  name: string;
  description: string;
  price: number;
  image_slot: string;
};

/**
 * Clave de idempotencia para evitar pedidos duplicados.
 *
 * `crypto.randomUUID` solo existe en contextos seguros (https o localhost).
 * En la feria el cliente puede abrir la página por IP en http, así que
 * tenemos un respaldo con getRandomValues.
 */
export function newIdempotencyKey(): string {
  const cryptoApi: Crypto | undefined =
    typeof crypto !== "undefined" ? crypto : undefined;

  if (typeof cryptoApi?.randomUUID === "function") {
    return cryptoApi.randomUUID();
  }

  const bytes = new Uint8Array(16);
  if (typeof cryptoApi?.getRandomValues === "function") {
    cryptoApi.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  // Version 4 + variante RFC 4122
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join("-");
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });
  return response;
}
