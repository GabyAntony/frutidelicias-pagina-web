"use client";

import { useStore } from "@/components/store/StoreContext";
import { WHATSAPP_DEFAULT_MESSAGE } from "@/lib/data";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { Reveal } from "./ui/Reveal";

export function VisitCta() {
  const store = useStore();
  const whatsappUrl = buildWhatsAppUrl(
    store.contact_phone,
    WHATSAPP_DEFAULT_MESSAGE,
  );

  return (
    <section
      id="contacto"
      className="relative overflow-hidden bg-cream px-5 py-16 lg:px-8 lg:py-24"
    >
      <div className="relative mx-auto max-w-6xl">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-rojo via-rojo to-chocolate px-6 py-10 shadow-warm sm:px-10 sm:py-14 lg:px-14">
            <div className="pointer-events-none absolute inset-0 cocoa-texture" aria-hidden />
            <div
              className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-amarillo/15 blur-3xl"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-coral/20 blur-3xl"
              aria-hidden
            />

            <div className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <p className="eyebrow text-amarillo">¿Nos vemos en la feria?</p>
                <h2 className="mt-4 font-display text-4xl uppercase leading-[0.9] tracking-wide text-cream sm:text-5xl lg:text-6xl">
                  Tu próximo antojo{" "}
                  <span className="text-amarillo">te está esperando</span>
                </h2>
                <p className="mt-4 max-w-lg font-sans text-sm leading-relaxed text-cream/70 sm:text-base">
                  Pásate por el local, pide por WhatsApp o arma tu match y
                  recógelo listo. El único riesgo es volver por otro.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-whatsapp"
                  >
                    <WhatsAppIcon />
                    Pedir por WhatsApp
                  </a>
                  <a href="#menu" className="btn-secondary">
                    Ver el menú
                  </a>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-white/15 bg-white/10 p-5 backdrop-blur-md sm:p-6">
                <p className="font-display text-2xl uppercase tracking-wide text-amarillo">
                  Encuéntranos
                </p>
                <dl className="mt-4 space-y-4 font-sans text-sm text-cream/80">
                  <InfoRow label="Dirección" value={store.address} icon="pin" />
                  <InfoRow label="Horario" value={store.pickup_hours} icon="clock" />
                  <InfoRow
                    label="Pagos"
                    value={store.payment_methods}
                    icon="card"
                  />
                  {store.contact_phone ? (
                    <InfoRow
                      label="WhatsApp"
                      value={store.contact_phone}
                      icon="phone"
                    />
                  ) : null}
                </dl>
                <p className="mt-5 border-t border-white/10 pt-4 font-sans text-[10px] leading-relaxed text-cream/45">
                  Pedidos para recoger. Te avisamos por WhatsApp cuando tu
                  antojo esté listo.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amarillo/15 text-amarillo">
        <InfoIcon icon={icon} />
      </span>
      <div>
        <dt className="font-sans text-[9px] font-bold uppercase tracking-[0.16em] text-cream/45">
          {label}
        </dt>
        <dd className="mt-0.5">{value}</dd>
      </div>
    </div>
  );
}

function InfoIcon({ icon }: { icon: string }) {
  if (icon === "clock") {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7" />
        <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }
  if (icon === "card") {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="3" y="5.5" width="18" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
        <path d="M3 10h18" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }
  if (icon === "phone") {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12.04 2C6.6 2 2.18 6.42 2.18 11.86c0 1.74.45 3.44 1.32 4.94L2 22l5.35-1.4a9.9 9.9 0 0 0 4.69 1.2h.01c5.43 0 9.85-4.42 9.85-9.86A9.8 9.8 0 0 0 12.04 2Z" />
      </svg>
    );
  }
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21c5-5.2 7.5-9 7.5-12a7.5 7.5 0 1 0-15 0c0 3 2.5 6.8 7.5 12Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12.04 2C6.6 2 2.18 6.42 2.18 11.86c0 1.74.45 3.44 1.32 4.94L2 22l5.35-1.4a9.9 9.9 0 0 0 4.69 1.2h.01c5.43 0 9.85-4.42 9.85-9.86A9.8 9.8 0 0 0 12.04 2Zm0 17.94h-.01a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.17.83.85-3.1-.2-.31a8.18 8.18 0 0 1-1.26-4.38c0-4.52 3.68-8.2 8.21-8.2 2.19 0 4.25.86 5.8 2.41a8.15 8.15 0 0 1 2.4 5.8c0 4.52-3.68 8.2-8.2 8.2Zm4.5-6.14c-.25-.12-1.46-.72-1.69-.8-.23-.09-.4-.13-.56.12-.17.25-.65.8-.8.96-.14.17-.29.19-.54.07-.25-.13-1.04-.38-1.98-1.22-.73-.65-1.23-1.46-1.37-1.71-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.86.84-.86 2.05 0 1.21.88 2.38 1 2.54.12.17 1.73 2.64 4.2 3.7.59.25 1.05.4 1.4.51.59.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.18.2-.58.2-1.07.14-1.18-.06-.1-.23-.16-.48-.28Z" />
    </svg>
  );
}
