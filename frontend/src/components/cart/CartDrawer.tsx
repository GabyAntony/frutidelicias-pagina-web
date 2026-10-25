"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCart } from "@/components/cart/CartContext";
import { useStore } from "@/components/store/StoreContext";
import { apiFetch, formatCop, newIdempotencyKey } from "@/lib/api";
import { looksLikeCoMobile } from "@/lib/phone";

type Step = "cart" | "form" | "summary" | "success" | "error";

export function CartDrawer() {
  const { lines, subtotal, open, setOpen, setQuantity, remove, clear } = useCart();
  const store = useStore();
  const reduce = useReducedMotion();
  const [step, setStep] = useState<Step>("cart");
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [notes, setNotes] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [publicId, setPublicId] = useState("");
  const [serverTotal, setServerTotal] = useState<number | null>(null);
  const [sentTotal, setSentTotal] = useState<number | null>(null);
  const [serverMessage, setServerMessage] = useState("");

  /**
   * Clave de idempotencia estable.
   *
   * Se genera una sola vez por contenido del carrito y se reutiliza en los
   * reintentos: si la respuesta se pierde por un corte de red, reenviar el
   * pedido devuelve el mismo número en vez de crear un pedido duplicado.
   * Si el carrito cambia, la clave cambia para poder pedir algo distinto.
   */
  const idempotencyKeyRef = useRef<string | null>(null);
  const drawerRef = useRef<HTMLElement | null>(null);
  const cartSignature = lines.map((line) => `${line.id}x${line.quantity}`).join("|");

  useEffect(() => {
    idempotencyKeyRef.current = null;
  }, [cartSignature]);

  const resetFlow = useCallback(() => {
    // Se reinicia al terminar la animación de salida, para que el drawer no
    // muestre un carrito vacío mientras se desliza fuera de pantalla.
    setStep("cart");
    setName("");
    setWhatsapp("");
    setNotes("");
    setConsent(false);
    setWebsite("");
    setPublicId("");
    setServerTotal(null);
    setSentTotal(null);
    setServerMessage("");
    setErrors([]);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        close();
        return;
      }
      if (event.key !== "Tab") return;

      // Mantiene el foco dentro del drawer mientras está abierto.
      const focusables = drawerRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables || focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    // Evita que la página de fondo se desplace detrás del carrito.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const title = useMemo(() => {
    if (step === "form") return "Tus datos";
    if (step === "summary") return "Revisa tu pedido";
    if (step === "success") return "Pedido recibido";
    if (step === "error") return "No se guardó el pedido";
    return "Tu carrito";
  }, [step]);

  function validateForm(): string[] {
    const next: string[] = [];
    if (name.trim().length < 2) next.push("Escribe tu nombre completo.");
    if (!looksLikeCoMobile(whatsapp)) {
      next.push("Ingresa un celular colombiano válido (10 dígitos, inicia en 3, o con +57).");
    }
    if (!consent) {
      next.push("Debes autorizar el uso de tu WhatsApp para avisarte sobre la recogida.");
    }
    if (lines.length === 0) next.push("Agrega al menos un producto.");
    return next;
  }

  function goToForm() {
    if (lines.length === 0) return;
    setErrors([]);
    setStep("form");
  }

  function goToSummary(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Campo trampa: los robots que llenan todos los campos quedan registrados.
    const formData = new FormData(e.currentTarget);
    setWebsite(String(formData.get("website") ?? ""));
    const next = validateForm();
    setErrors(next);
    if (next.length === 0) setStep("summary");
  }

  async function confirmOrder() {
    const next = validateForm();
    setErrors(next);
    if (next.length) {
      setStep("form");
      return;
    }
    setSending(true);
    const totalBeforeSend = subtotal;
    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current = newIdempotencyKey();
    }
    try {
      const response = await apiFetch("/orders", {
        method: "POST",
        headers: { "Idempotency-Key": idempotencyKeyRef.current },
        body: JSON.stringify({
          name: name.trim(),
          whatsapp,
          notes: notes.trim(),
          whatsapp_consent: consent,
          website,
          items: lines.map((line) => ({
            product_id: line.id,
            quantity: line.quantity,
          })),
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.public_id) {
        setStep("error");
        setServerMessage(
          data?.detail
            ? String(Array.isArray(data.detail) ? "Revisa los datos del formulario." : data.detail)
            : "No pudimos guardar tu pedido. Inténtalo de nuevo.",
        );
        return;
      }
      setPublicId(data.public_id);
      setServerTotal(data.total);
      setSentTotal(totalBeforeSend);
      setServerMessage(data.message);
      clear();
      setStep("success");
    } catch {
      setStep("error");
      setServerMessage("No hay conexión con el servidor. El pedido no se confirmó.");
    } finally {
      setSending(false);
    }
  }

  const stepIndex =
    step === "cart" ? 0 : step === "form" ? 1 : step === "summary" ? 2 : 3;

  return (
    <AnimatePresence onExitComplete={resetFlow}>
      {open ? (
        <div className="fixed inset-0 z-[80]">
          <motion.button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
            aria-label="Cerrar carrito"
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.aside
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={reduce ? false : { x: "100%" }}
            animate={{ x: 0 }}
            exit={reduce ? undefined : { x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-gradient-to-b from-chocolate via-chocolate to-[#2b0f08] shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <p className="font-sans text-[9px] font-bold uppercase tracking-[0.2em] text-amarillo">
                  Fruti Delicias
                </p>
                <h2 className="mt-0.5 font-display text-2xl uppercase tracking-wide text-cream">
                  {title}
                </h2>
              </div>
              <button
                type="button"
                onClick={close}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-cream/70 transition-colors hover:border-amarillo hover:text-amarillo"
                aria-label="Cerrar"
                autoFocus
              >
                ✕
              </button>
            </header>

            <div className="flex gap-1.5 px-5 pt-3">
              {["Carrito", "Datos", "Resumen"].map((label, index) => (
                <div key={label} className="flex-1">
                  <div
                    className={`h-1 rounded-full transition-colors ${
                      index <= stepIndex ? "bg-amarillo" : "bg-white/10"
                    }`}
                  />
                  <p
                    className={`mt-1.5 font-sans text-[8px] font-semibold uppercase tracking-[0.12em] ${
                      index <= stepIndex ? "text-amarillo/80" : "text-cream/30"
                    }`}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {step === "cart" && (
                <CartList
                  lines={lines}
                  subtotal={subtotal}
                  setQuantity={setQuantity}
                  remove={remove}
                  onClose={close}
                />
              )}

              {step === "form" && (
                <form id="checkout-form" onSubmit={goToSummary} className="space-y-4">
                  <div className="rounded-xl border border-amarillo/20 bg-amarillo/5 p-3">
                    <p className="font-sans text-xs leading-relaxed text-cream/70">
                      Recogida en <span className="text-cream">{store.address}</span>.
                      Pago al recoger: {store.payment_methods}. Horario: {store.pickup_hours}.
                    </p>
                  </div>
                  <Field label="Nombre" htmlFor="order-name">
                    <input
                      id="order-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="field-input"
                      autoComplete="name"
                      placeholder="Tu nombre"
                      required
                    />
                  </Field>
                  <Field label="WhatsApp" htmlFor="order-whatsapp">
                    <input
                      id="order-whatsapp"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="field-input"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="300 123 4567"
                      required
                    />
                  </Field>
                  <Field label="Observaciones (opcional)" htmlFor="order-notes">
                    <textarea
                      id="order-notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="field-input min-h-24 resize-none"
                      maxLength={500}
                      placeholder="Sin coco, más chocolate, sorpréndeme…"
                    />
                  </Field>
                  <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3 font-sans text-xs leading-relaxed text-cream/75">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-0.5 accent-[var(--amarillo)]"
                    />
                    Autorizo el uso de mi número de WhatsApp solo para gestionar este pedido
                    y avisarme cuando esté listo para recoger.
                  </label>
                  <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    className="pointer-events-none absolute -left-[9999px] h-px w-px opacity-0"
                  />
                </form>
              )}

              {step === "summary" && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-white/10 bg-rojo/20 p-4">
                    <p className="font-sans text-[9px] font-bold uppercase tracking-[0.16em] text-amarillo">
                      Tus datos
                    </p>
                    <p className="mt-1 font-sans text-sm text-cream">
                      {name} · {whatsapp}
                    </p>
                  </div>
                  <ul className="space-y-2">
                    {lines.map((line) => (
                      <li key={line.id} className="flex justify-between gap-3 font-sans text-sm text-cream">
                        <span className="text-cream/75">
                          {line.name} <span className="text-cream/40">× {line.quantity}</span>
                        </span>
                        <span className="font-semibold">{formatCop(line.price * line.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                  {notes ? (
                    <p className="rounded-lg bg-white/5 p-3 font-sans text-xs text-cream/60">
                      Notas: {notes}
                    </p>
                  ) : null}
                  <div className="flex items-center justify-between border-t border-white/10 pt-4">
                    <span className="font-sans text-[10px] font-bold uppercase tracking-[0.16em] text-cream/55">
                      Total
                    </span>
                    <span className="font-display text-3xl text-amarillo">
                      {formatCop(subtotal)}
                    </span>
                  </div>
                  <p className="font-sans text-[10px] leading-relaxed text-cream/45">
                    El total definitivo se confirma en el servidor al guardar el pedido.
                    Pagas al recoger, en efectivo o Nequi. No hay pago en línea.
                  </p>
                </div>
              )}

              {step === "success" && (
                <div className="space-y-4 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amarillo/15 text-3xl">
                    🍓
                  </div>
                  <p className="font-sans text-[10px] font-bold uppercase tracking-[0.18em] text-amarillo">
                    Pedido recibido
                  </p>
                  <p className="font-display text-4xl text-amarillo">{publicId}</p>
                  <p className="font-sans text-sm leading-relaxed text-cream/75">{serverMessage}</p>
                  {serverTotal !== null ? (
                    <p className="font-sans text-sm text-cream">Total: {formatCop(serverTotal)}</p>
                  ) : null}
                  {serverTotal !== null && sentTotal !== null && serverTotal !== sentTotal ? (
                    <p className="font-sans text-xs text-coral">
                      El total se ajustó a {formatCop(serverTotal)} según el catálogo vigente.
                    </p>
                  ) : null}
                  <p className="font-sans text-xs text-cream/50">
                    Estado: pendiente de preparación. Te contactaremos por WhatsApp
                    para la recogida.
                  </p>
                </div>
              )}

              {step === "error" && (
                <div className="space-y-3 rounded-xl border border-coral/30 bg-coral/10 p-4">
                  <p className="font-display text-2xl uppercase tracking-wide text-coral">
                    Casi, pero no
                  </p>
                  <p className="font-sans text-sm text-coral">{serverMessage}</p>
                  <p className="font-sans text-xs text-cream/50">
                    Tu carrito sigue intacto. Puedes reintentar sin que se cree un pedido duplicado.
                  </p>
                </div>
              )}

              {errors.length > 0 && step === "form" && (
                <ul className="mt-4 space-y-1 rounded-xl border border-coral/30 bg-coral/10 p-3" role="alert">
                  {errors.map((err) => (
                    <li key={err} className="font-sans text-xs text-coral">
                      • {err}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <footer className="border-t border-white/10 bg-chocolate/60 p-5 backdrop-blur">
              {step === "cart" && (
                <button
                  type="button"
                  className="btn-primary w-full"
                  disabled={lines.length === 0}
                  onClick={goToForm}
                >
                  Continuar con el pedido
                </button>
              )}
              {step === "form" && (
                <div className="flex gap-3">
                  <button type="button" className="btn-secondary flex-1 !px-4" onClick={() => setStep("cart")}>
                    Atrás
                  </button>
                  <button type="submit" form="checkout-form" className="btn-primary flex-1 !px-4">
                    Ver resumen
                  </button>
                </div>
              )}
              {step === "summary" && (
                <div className="flex gap-3">
                  <button type="button" className="btn-secondary flex-1 !px-4" onClick={() => setStep("form")}>
                    Atrás
                  </button>
                  <button
                    type="button"
                    className="btn-primary flex-1 !px-4 disabled:opacity-60"
                    onClick={confirmOrder}
                    disabled={sending}
                  >
                    {sending ? "Guardando…" : "Confirmar pedido"}
                  </button>
                </div>
              )}
              {step === "success" && (
                <button type="button" className="btn-primary w-full" onClick={close}>
                  Cerrar
                </button>
              )}
              {step === "error" && (
                <div className="flex gap-3">
                  <button
                    type="button"
                    className="btn-secondary flex-1 !px-4 disabled:opacity-60"
                    onClick={confirmOrder}
                    disabled={sending}
                  >
                    {sending ? "Reintentando…" : "Reintentar"}
                  </button>
                  <button type="button" className="btn-primary flex-1 !px-4" onClick={close}>
                    Cerrar
                  </button>
                </div>
              )}
            </footer>
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

function CartList({
  lines,
  subtotal,
  setQuantity,
  remove,
  onClose,
}: {
  lines: { id: number; name: string; price: number; quantity: number }[];
  subtotal: number;
  setQuantity: (id: number, quantity: number) => void;
  remove: (id: number) => void;
  onClose: () => void;
}) {
  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-amarillo/25 bg-rojo/15 px-6 py-12 text-center">
        <span className="text-4xl" aria-hidden>
          🍓
        </span>
        <p className="mt-4 font-display text-2xl uppercase tracking-wide text-amarillo">
          Tu carrito está vacío
        </p>
        <p className="mt-2 max-w-xs font-sans text-sm leading-relaxed text-cream/60">
          Tu antojo te está esperando. Elige un bowl, una brocheta o arma tu
          match perfecto.
        </p>
        <a href="#menu" className="btn-primary mt-5 !px-6 !py-3" onClick={onClose}>
          Explorar el menú
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {lines.map((line) => (
        <div
          key={line.id}
          className="rounded-2xl border border-white/10 bg-white/5 p-4 transition-colors hover:border-amarillo/25"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-display text-lg uppercase tracking-wide text-amarillo">
                {line.name}
              </p>
              <p className="font-sans text-xs text-cream/55">
                {formatCop(line.price)} c/u
              </p>
            </div>
            <button
              type="button"
              className="rounded-full border border-transparent px-2 py-1 font-sans text-[10px] font-semibold uppercase tracking-[0.1em] text-coral transition-colors hover:border-coral/30 hover:bg-coral/10"
              onClick={() => remove(line.id)}
            >
              Eliminar
            </button>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-cream transition-colors hover:border-amarillo hover:text-amarillo disabled:opacity-30"
                onClick={() => setQuantity(line.id, line.quantity - 1)}
                aria-label="Quitar uno"
              >
                −
              </button>
              <span className="w-8 text-center font-sans text-sm font-semibold">
                {line.quantity}
              </span>
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-amarillo text-chocolate transition-colors hover:bg-coral"
                onClick={() => setQuantity(line.id, line.quantity + 1)}
                aria-label="Agregar uno"
              >
                +
              </button>
            </div>
            <span className="font-sans text-base font-bold text-cream">
              {formatCop(line.price * line.quantity)}
            </span>
          </div>
        </div>
      ))}

      <div className="rounded-2xl border border-amarillo/20 bg-amarillo/5 p-4">
        <div className="flex justify-between font-sans text-xs text-cream/60">
          <span>Subtotal</span>
          <span>{formatCop(subtotal)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-3">
          <span className="font-sans text-[10px] font-bold uppercase tracking-[0.16em] text-cream/60">
            Total
          </span>
          <span className="font-display text-3xl leading-none text-amarillo">
            {formatCop(subtotal)}
          </span>
        </div>
        <p className="mt-2 font-sans text-[10px] text-cream/40">
          Pago al recoger · Efectivo o Nequi
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="mb-1.5 block font-sans text-[9px] font-bold uppercase tracking-[0.16em] text-amarillo/80">
        {label}
      </span>
      {children}
    </label>
  );
}
