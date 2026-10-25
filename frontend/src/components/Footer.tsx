"use client";

import { FormEvent, useState } from "react";
import { useStore } from "@/components/store/StoreContext";
import { API_BASE } from "@/lib/api";
import { NAV_LINKS, WHATSAPP_DEFAULT_MESSAGE } from "@/lib/data";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export function Footer() {
  const store = useStore();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");
  const whatsappUrl = buildWhatsAppUrl(
    store.contact_phone,
    WHATSAPP_DEFAULT_MESSAGE,
  );

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch(`${API_BASE}/newsletter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error("Error al suscribirse");

      const data = await res.json();
      setStatus("ok");
      setMessage(data.message ?? "¡Suscripción lista!");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("No pudimos suscribirte. ¿El backend está corriendo?");
    }
  }

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-chocolate">
      <div className="pointer-events-none absolute inset-0 cocoa-texture" aria-hidden />
      <div
        className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-rojo/30 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-5 pb-8 pt-16 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.2fr_0.7fr_0.9fr_1.1fr] lg:gap-12">
          <div>
            <a
              href="#inicio"
              className="inline-flex items-center gap-2.5 font-display text-2xl uppercase tracking-wide text-cream transition-colors hover:text-amarillo"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amarillo text-chocolate">
                <BrandMark />
              </span>
              {store.business_name}
            </a>
            <p className="mt-4 max-w-xs font-sans text-sm leading-relaxed text-cream/55">
              Frescura natural, chocolate irresistible y momentos que sí valen
              la pena. Tu pausa dulce, hecha al momento.
            </p>
            <p className="mt-4 font-display text-lg uppercase tracking-[0.12em] text-amarillo/70">
              Fruta real. Chocolate real. Antojo real.
            </p>
            <div className="mt-5 flex gap-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-cream/70 transition-colors hover:border-whatsapp hover:bg-whatsapp hover:text-white"
                aria-label="WhatsApp"
              >
                <WhatsAppIcon />
              </a>
              {store.contact_phone ? (
                <a
                  href={`tel:${store.contact_phone}`}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-cream/70 transition-colors hover:border-amarillo hover:text-amarillo"
                  aria-label="Llamar al local"
                >
                  <PhoneIcon />
                </a>
              ) : null}
            </div>
          </div>

          <div>
            <h3 className="font-display text-lg uppercase tracking-wide text-amarillo">
              Explora
            </h3>
            <ul className="mt-4 space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="font-sans text-sm text-cream/60 transition-colors hover:text-amarillo"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-lg uppercase tracking-wide text-amarillo">
              Contacto
            </h3>
            <ul className="mt-4 space-y-3 font-sans text-sm text-cream/60">
              <li className="flex gap-2">
                <span className="text-amarillo/70" aria-hidden>
                  ◈
                </span>
                {store.address}
              </li>
              <li>
                {store.contact_phone ? (
                  <a
                    href={`tel:${store.contact_phone}`}
                    className="transition-colors hover:text-amarillo"
                  >
                    {store.contact_phone}
                  </a>
                ) : (
                  <span className="text-cream/40">Teléfono por confirmar</span>
                )}
              </li>
              <li>{store.pickup_hours}</li>
              <li>{store.payment_methods}</li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-lg uppercase tracking-wide text-amarillo">
              Antojos en tu inbox
            </h3>
            <p className="mt-3 font-sans text-sm leading-relaxed text-cream/55">
              Lanzamientos, combos y esos antojos que no sabías que necesitabas.
            </p>
            <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-2">
              <label htmlFor="newsletter-email" className="sr-only">
                Correo electrónico
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="field-input"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="btn-primary w-full !py-3 !text-[10px]"
              >
                {status === "loading" ? "Enviando…" : "Quiero antojos"}
              </button>
              {message ? (
                <p
                  className={`font-sans text-xs ${
                    status === "ok" ? "text-amarillo" : "text-coral"
                  }`}
                  role="status"
                >
                  {message}
                </p>
              ) : null}
            </form>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
          <p className="font-sans text-[10px] text-cream/35">
            © 2026 {store.business_name}. Todos los derechos reservados.
          </p>
          <p className="font-sans text-[10px] text-cream/30">
            Hecho con fruta real y cero aburrimiento. 🍓
          </p>
          <div className="flex gap-4 font-sans text-[10px] text-cream/35">
            <a href="#" className="transition-colors hover:text-cream/70">
              Privacidad
            </a>
            <a href="#" className="transition-colors hover:text-cream/70">
              Términos
            </a>
          </div>
        </div>
      </div>

      <div className="pointer-events-none relative overflow-hidden">
        <p className="translate-y-[22%] text-center font-display text-[18vw] leading-none tracking-tight text-white/[0.035]">
          FRUTI DELICIAS
        </p>
      </div>
    </footer>
  );
}

function BrandMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 32 32" fill="none" aria-hidden>
      <path
        d="M16 28c7-4.5 11-10 11-15.5C27 8 23.5 5 19.5 5c-1.5 0-2.9.5-3.5 1.4C15.4 5.5 14 5 12.5 5 8.5 5 5 8 5 12.5 5 18 9 23.5 16 28Z"
        fill="currentColor"
      />
      <path
        d="M16 6c-1-3-3.2-4.5-6-4 1.2 2.6 3.1 4 6 4Zm0 0c1-3 3.2-4.5 6-4-1.2 2.6-3.1 4-6 4Z"
        fill="#4c1e0d"
      />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12.04 2C6.6 2 2.18 6.42 2.18 11.86c0 1.74.45 3.44 1.32 4.94L2 22l5.35-1.4a9.9 9.9 0 0 0 4.69 1.2h.01c5.43 0 9.85-4.42 9.85-9.86A9.8 9.8 0 0 0 12.04 2Zm0 17.94h-.01a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.17.83.85-3.1-.2-.31a8.18 8.18 0 0 1-1.26-4.38c0-4.52 3.68-8.2 8.21-8.2 2.19 0 4.25.86 5.8 2.41a8.15 8.15 0 0 1 2.4 5.8c0 4.52-3.68 8.2-8.2 8.2Z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6.5 3.5h2l1.2 4-2 1.5a12 12 0 0 0 5.3 5.3l1.5-2 4 1.2v2c0 1.1-.9 2-2 2A15.5 15.5 0 0 1 4.5 5.5c0-1.1.9-2 2-2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
