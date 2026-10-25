"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/components/cart/CartContext";
import { useStore } from "@/components/store/StoreContext";
import { apiFetch, formatCop, newIdempotencyKey } from "@/lib/api";
import { looksLikeCoMobile } from "@/lib/phone";

type Step = "cart" | "form" | "summary" | "success" | "error";

export function CartDrawer() {
  const { lines, subtotal, open, setOpen, setQuantity, remove, clear } = useCart();
  const store = useStore();
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
  const cartSignature = lines.map((line) => `${line.id}x${line.quantity}`).join("|");

  useEffect(() => {
    idempotencyKeyRef.current = null;
  }, [cartSignature]);

  const close = useCallback(() => {
    setOpen(false);
    // Al cerrar el carrito se reinicia el flujo, para no dejar en pantalla el
    // número de un pedido anterior al reabrirlo.
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
  }, [setOpen]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80]">
      <button
        type="button"
        className="absolute inset-0 bg-black/55"
        aria-label="Cerrar carrito"
        onClick={close}
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-chocolate shadow-2xl">
        <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="font-display text-2xl tracking-wide text-cream">{title}</h2>
          <button
            type="button"
            onClick={close}
            className="text-cream/70 hover:text-amarillo"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {step === "cart" && (
            <CartList
              lines={lines}
              subtotal={subtotal}
              setQuantity={setQuantity}
              remove={remove}
            />
          )}

          {step === "form" && (
            <form id="checkout-form" onSubmit={goToSummary} className="space-y-4">
              <p className="font-sans text-sm text-cream/70">
                Recogida en {store.address}. Pago al recoger: {store.payment_methods}.
                Horario: {store.pickup_hours}.
              </p>
              <Field label="Nombre" htmlFor="order-name">
                <input
                  id="order-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="field-input"
                  autoComplete="name"
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
                  className="field-input min-h-24"
                  maxLength={500}
                />
              </Field>
              <label className="flex items-start gap-3 font-sans text-sm text-cream/80">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1"
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
              <p className="font-sans text-sm text-cream/75">
                {name} · {whatsapp}
              </p>
              <ul className="space-y-2">
                {lines.map((line) => (
                  <li key={line.id} className="flex justify-between font-sans text-sm text-cream">
                    <span>
                      {line.name} × {line.quantity}
                    </span>
                    <span>{formatCop(line.price * line.quantity)}</span>
                  </li>
                ))}
              </ul>
              {notes ? (
                <p className="font-sans text-sm text-cream/60">Notas: {notes}</p>
              ) : null}
              <p className="font-display text-2xl text-amarillo">Total: {formatCop(subtotal)}</p>
              <p className="font-sans text-xs text-cream/55">
                El total definitivo se confirma en el servidor al guardar el pedido.
                Pagas al recoger, en efectivo o Nequi. No hay pago en línea.
              </p>
            </div>
          )}

          {step === "success" && (
            <div className="space-y-3">
              <p className="font-display text-3xl text-amarillo">{publicId}</p>
              <p className="font-sans text-sm leading-relaxed text-cream/80">{serverMessage}</p>
              {serverTotal !== null ? (
                <p className="font-sans text-sm text-cream">Total: {formatCop(serverTotal)}</p>
              ) : null}
              {serverTotal !== null && sentTotal !== null && serverTotal !== sentTotal ? (
                <p className="font-sans text-xs text-coral">
                  El total se ajustó a {formatCop(serverTotal)} según el catálogo vigente.
                </p>
              ) : null}
              <p className="font-sans text-xs text-cream/55">
                Estado: pendiente de preparación. Te contactaremos por WhatsApp para la recogida.
              </p>
            </div>
          )}

          {step === "error" && (
            <div className="space-y-3">
              <p className="font-sans text-sm text-coral">{serverMessage}</p>
              <p className="font-sans text-xs text-cream/55">
                Tu carrito sigue intacto. Puedes reintentar sin que se cree un pedido duplicado.
              </p>
            </div>
          )}

          {errors.length > 0 && step === "form" && (
            <ul className="mt-4 space-y-1" role="alert">
              {errors.map((err) => (
                <li key={err} className="font-sans text-sm text-coral">
                  {err}
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className="border-t border-white/10 p-5">
          {step === "cart" && (
            <button
              type="button"
              className="btn-primary w-full"
              disabled={lines.length === 0}
              onClick={goToForm}
            >
              Continuar
            </button>
          )}
          {step === "form" && (
            <div className="flex gap-3">
              <button type="button" className="btn-secondary flex-1" onClick={() => setStep("cart")}>
                Atrás
              </button>
              <button type="submit" form="checkout-form" className="btn-primary flex-1">
                Ver resumen
              </button>
            </div>
          )}
          {step === "summary" && (
            <div className="flex gap-3">
              <button type="button" className="btn-secondary flex-1" onClick={() => setStep("form")}>
                Atrás
              </button>
              <button
                type="button"
                className="btn-primary flex-1 disabled:opacity-60"
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
                className="btn-secondary flex-1 disabled:opacity-60"
                onClick={confirmOrder}
                disabled={sending}
              >
                {sending ? "Reintentando…" : "Reintentar"}
              </button>
              <button type="button" className="btn-primary flex-1" onClick={close}>
                Cerrar
              </button>
            </div>
          )}
        </footer>
      </aside>
    </div>
  );
}

function CartList({
  lines,
  subtotal,
  setQuantity,
  remove,
}: {
  lines: { id: number; name: string; price: number; quantity: number }[];
  subtotal: number;
  setQuantity: (id: number, quantity: number) => void;
  remove: (id: number) => void;
}) {
  if (lines.length === 0) {
    return (
      <p className="font-sans text-sm text-cream/70">
        Tu carrito está vacío. Agrega un antojo desde el menú.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {lines.map((line) => (
        <div key={line.id} className="rounded-xl border border-white/10 bg-rojo/25 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-display text-lg text-amarillo">{line.name}</p>
              <p className="font-sans text-sm text-cream/70">{formatCop(line.price)} c/u</p>
            </div>
            <button
              type="button"
              className="font-sans text-xs text-coral hover:underline"
              onClick={() => remove(line.id)}
            >
              Eliminar
            </button>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="h-8 w-8 rounded-full bg-amarillo text-chocolate"
                onClick={() => setQuantity(line.id, line.quantity - 1)}
                aria-label="Quitar uno"
              >
                −
              </button>
              <span className="w-6 text-center font-sans text-sm">{line.quantity}</span>
              <button
                type="button"
                className="h-8 w-8 rounded-full bg-amarillo text-chocolate"
                onClick={() => setQuantity(line.id, line.quantity + 1)}
                aria-label="Agregar uno"
              >
                +
              </button>
            </div>
            <span className="font-sans text-sm font-semibold">
              {formatCop(line.price * line.quantity)}
            </span>
          </div>
        </div>
      ))}
      <div className="flex justify-between border-t border-white/10 pt-4 font-sans">
        <span className="text-cream/70">Subtotal</span>
        <span className="font-semibold text-cream">{formatCop(subtotal)}</span>
      </div>
      <p className="font-display text-xl text-amarillo">Total: {formatCop(subtotal)}</p>
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
      <span className="mb-1 block font-sans text-xs tracking-wide text-amarillo uppercase">
        {label}
      </span>
      {children}
    </label>
  );
}
