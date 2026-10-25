"use client";

import { FormEvent, useState } from "react";
import { useStore } from "@/components/store/StoreContext";
import { API_BASE, NAV_LINKS } from "@/lib/data";

export function Footer() {
  const store = useStore();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

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
    <footer id="contacto" className="border-t border-white/8 bg-chocolate">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <p className="font-display text-2xl tracking-wide text-cream">
            {store.business_name}
          </p>
          <p className="mt-3 font-sans text-sm leading-relaxed text-cream/60">
            Frescura natural, chocolate irresistible y momentos llenos de sabor.
          </p>
          <div className="mt-5 flex gap-3">
            {["Ig", "Fb", "Tk", "X"].map((label) => (
              <span
                key={label}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 font-sans text-xs text-cream/70"
                aria-hidden
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-display text-lg tracking-wide text-amarillo">
            Enlaces
          </h3>
          <ul className="mt-4 space-y-2">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="font-sans text-sm text-cream/70 transition-colors hover:text-amarillo"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-lg tracking-wide text-amarillo">
            Contacto
          </h3>
          <ul className="mt-4 space-y-3 font-sans text-sm text-cream/70">
            <li>{store.address}</li>
            <li>
              <a href={`tel:${store.contact_phone}`} className="hover:text-amarillo">
                {store.contact_phone || "Teléfono por confirmar"}
              </a>
            </li>
            <li>{store.pickup_hours}</li>
            <li>{store.payment_methods}</li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-lg tracking-wide text-amarillo">
            Newsletter
          </h3>
          <p className="mt-3 font-sans text-sm text-cream/60">
            Antojos, lanzamientos y combos especiales en tu inbox.
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
              className="rounded-lg border border-white/15 bg-rojo/30 px-3 py-2.5 font-sans text-sm text-cream placeholder:text-cream/40 outline-none focus:border-amarillo"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="btn-primary w-full disabled:opacity-60"
            >
              {status === "loading" ? "Enviando…" : "Suscribirme"}
            </button>
            {message && (
              <p
                className={`font-sans text-xs ${
                  status === "ok" ? "text-amarillo" : "text-coral"
                }`}
                role="status"
              >
                {message}
              </p>
            )}
          </form>
        </div>
      </div>

      <div className="border-t border-white/8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-5 font-sans text-xs text-cream/45 sm:flex-row lg:px-8">
          <p>© 2026 Fruti Delicias. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-cream/70">
              Privacidad
            </a>
            <a href="#" className="hover:text-cream/70">
              Términos
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
