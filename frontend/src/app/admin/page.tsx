"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch, formatCop, formatStoreDate, type StoreInfo } from "@/lib/api";

type OrderItem = {
  name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
};

type Order = {
  public_id: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  notes: string;
  items: OrderItem[];
  total: number;
  total_label: string;
  status: string;
  payment_status: string;
  whatsapp_url: string | null;
  telegram_notified?: boolean;
  telegram_error?: string;
};

const STATUS_LABEL: Record<string, string> = {
  nuevo: "Nuevo",
  en_preparacion: "En preparación",
  listo_para_recoger: "Listo para recoger",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

const NEXT_ACTIONS: Record<string, { status: string; label: string }[]> = {
  nuevo: [
    { status: "en_preparacion", label: "En preparación" },
    { status: "cancelado", label: "Cancelar" },
  ],
  en_preparacion: [
    { status: "listo_para_recoger", label: "Listo para recoger" },
    { status: "cancelado", label: "Cancelar" },
  ],
  listo_para_recoger: [
    { status: "entregado", label: "Entregado" },
    { status: "cancelado", label: "Cancelar" },
  ],
  entregado: [],
  cancelado: [],
};

const adminHeaders = {
  "Content-Type": "application/json",
  "X-Requested-With": "FrutiAdmin",
};

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<Order | null>(null);
  const [settings, setSettings] = useState<StoreInfo | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const applyOrders = useCallback((data: Order[]) => {
    setOrders(data);
    setSelected((current) =>
      current
        ? data.find((item) => item.public_id === current.public_id) ?? data[0] ?? null
        : data[0] ?? null,
    );
  }, []);

  /** Consulta los pedidos sin tocar el estado (se usa desde los efectos). */
  const fetchOrders = useCallback(async (status: string) => {
    const query = status ? `?status_filter=${encodeURIComponent(status)}` : "";
    const res = await apiFetch(`/api/admin/orders${query}`);
    if (!res.ok) {
      return { ok: false as const, unauthorized: res.status === 401, orders: [] as Order[] };
    }
    return {
      ok: true as const,
      unauthorized: false,
      orders: (await res.json()) as Order[],
    };
  }, []);

  /** Consulta los datos del local sin tocar el estado. */
  const fetchStore = useCallback(async () => {
    const res = await apiFetch("/api/store");
    if (!res.ok) return null;
    return (await res.json()) as StoreInfo;
  }, []);

  const loadOrders = useCallback(
    async (status = filter) => {
      const result = await fetchOrders(status);
      if (result.unauthorized) {
        setAuthed(false);
        return;
      }
      if (result.ok) applyOrders(result.orders);
    },
    [filter, fetchOrders, applyOrders],
  );

  useEffect(() => {
    let cancelled = false;
    apiFetch("/api/admin/me")
      .then((res) => {
        if (!cancelled) setAuthed(res.ok);
      })
      .catch(() => {
        if (!cancelled) setAuthed(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!authed) return;
    let cancelled = false;
    Promise.all([fetchOrders(filter), fetchStore()])
      .then(([ordersResult, storeInfo]) => {
        if (cancelled) return;
        if (ordersResult.unauthorized) {
          setAuthed(false);
          return;
        }
        if (ordersResult.ok) applyOrders(ordersResult.orders);
        if (storeInfo) setSettings(storeInfo);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [authed, filter, fetchOrders, fetchStore, applyOrders]);

  async function onLogin(e: FormEvent) {
    e.preventDefault();
    setLoginError("");
    const res = await apiFetch("/api/admin/login", {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      setLoginError(data?.detail ?? "No se pudo iniciar sesión.");
      return;
    }
    setPassword("");
    setAuthed(true);
  }

  async function onLogout() {
    await apiFetch("/api/admin/logout", {
      method: "POST",
      headers: adminHeaders,
    });
    setAuthed(false);
    setOrders([]);
    setSelected(null);
  }

  async function changeStatus(publicId: string, status: string) {
    setError("");
    const res = await apiFetch(`/api/admin/orders/${publicId}/status`, {
      method: "PATCH",
      headers: adminHeaders,
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setNotice("Estado actualizado.");
      await loadOrders();
      return;
    }
    const data = await res.json().catch(() => null);
    setError(data?.detail ?? "No se pudo actualizar el estado.");
  }

  async function markPaid(publicId: string) {
    setError("");
    const res = await apiFetch(`/api/admin/orders/${publicId}/payment`, {
      method: "PATCH",
      headers: adminHeaders,
      body: JSON.stringify({ payment_status: "pagado" }),
    });
    if (res.ok) {
      setNotice("Pago marcado como pagado.");
      await loadOrders();
      return;
    }
    const data = await res.json().catch(() => null);
    setError(data?.detail ?? "No se pudo actualizar el pago.");
  }

  async function saveSettings(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);
    const payload = {
      business_name: String(form.get("business_name") ?? ""),
      address: String(form.get("address") ?? ""),
      pickup_hours: String(form.get("pickup_hours") ?? ""),
      contact_phone: String(form.get("contact_phone") ?? ""),
      payment_methods: String(form.get("payment_methods") ?? ""),
    };
    const res = await apiFetch("/api/admin/settings", {
      method: "PUT",
      headers: adminHeaders,
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setSettings(await res.json());
      setNotice("Datos del local actualizados.");
      return;
    }
    const data = await res.json().catch(() => null);
    setError(data?.detail ?? "No se pudieron guardar los datos del local.");
  }

  const filteredLabel = useMemo(
    () => (filter ? STATUS_LABEL[filter] : "Todos"),
    [filter],
  );

  if (authed === null) {
    return <p className="p-8 font-sans text-cream">Cargando…</p>;
  }

  if (!authed) {
    return (
      <main className="mx-auto flex min-h-full max-w-md flex-col justify-center px-5 py-16">
        <h1 className="font-display text-4xl text-amarillo">Panel Fruti Delicias</h1>
        <p className="mt-2 font-sans text-sm text-cream/70">
          Acceso privado para gestionar pedidos.
        </p>
        <form onSubmit={onLogin} className="mt-8 space-y-4">
          <label className="block font-sans text-sm">
            Usuario
            <input
              className="field-input mt-1"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </label>
          <label className="block font-sans text-sm">
            Contraseña
            <input
              type="password"
              className="field-input mt-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          {loginError ? <p className="text-sm text-coral">{loginError}</p> : null}
          <button type="submit" className="btn-primary w-full">
            Entrar
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-8 lg:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-sans text-xs tracking-[0.2em] text-coral uppercase">
            Administración
          </p>
          <h1 className="font-display text-4xl text-cream">Pedidos</h1>
        </div>
        <button type="button" className="btn-secondary" onClick={onLogout}>
          Cerrar sesión
        </button>
      </header>

      {notice ? (
        <p className="mt-4 font-sans text-sm text-amarillo" role="status">
          {notice}
        </p>
      ) : null}

      {error ? (
        <p className="mt-4 font-sans text-sm text-coral" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-2">
        <FilterChip label="Todos" active={!filter} onClick={() => setFilter("")} />
        {Object.entries(STATUS_LABEL).map(([value, label]) => (
          <FilterChip
            key={value}
            label={label}
            active={filter === value}
            onClick={() => setFilter(value)}
          />
        ))}
      </div>
      <p className="mt-2 font-sans text-xs text-cream/50">Vista: {filteredLabel}</p>

      <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <ul className="space-y-3">
          {orders.length === 0 ? (
            <li className="rounded-xl border border-white/10 p-4 text-sm text-cream/70">
              No hay pedidos en este filtro.
            </li>
          ) : (
            orders.map((order) => (
              <li key={order.public_id}>
                <button
                  type="button"
                  onClick={() => setSelected(order)}
                  className={`w-full rounded-xl border p-4 text-left ${
                    selected?.public_id === order.public_id
                      ? "border-amarillo bg-rojo/40"
                      : "border-white/10 bg-rojo/20"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-display text-xl text-amarillo">
                      {order.public_id}
                    </span>
                    <span className="font-sans text-xs uppercase tracking-wide text-cream/70">
                      {STATUS_LABEL[order.status]}
                    </span>
                  </div>
                  <p className="mt-1 font-sans text-sm text-cream">
                    {order.customer_name} · {formatCop(order.total)}
                  </p>
                </button>
              </li>
            ))
          )}
        </ul>

        {selected ? (
          <article className="rounded-2xl border border-white/10 bg-rojo/20 p-5">
            <h2 className="font-display text-3xl text-amarillo">{selected.public_id}</h2>
            <p className="mt-1 font-sans text-sm text-cream/70">
              {formatStoreDate(selected.created_at)} · hora de Bogotá
            </p>
            <dl className="mt-4 space-y-2 font-sans text-sm">
              <div>
                <dt className="text-cream/50">Cliente</dt>
                <dd>{selected.customer_name}</dd>
              </div>
              <div>
                <dt className="text-cream/50">WhatsApp</dt>
                <dd>{selected.customer_phone}</dd>
              </div>
              <div>
                <dt className="text-cream/50">Estado</dt>
                <dd>
                  {STATUS_LABEL[selected.status]} · Pago {selected.payment_status}
                </dd>
              </div>
            </dl>
            <ul className="mt-4 space-y-1 font-sans text-sm">
              {selected.items.map((item) => (
                <li key={item.name}>
                  {item.name} × {item.quantity} · {formatCop(item.line_total)}
                </li>
              ))}
            </ul>
            {selected.notes ? (
              <p className="mt-3 font-sans text-sm text-cream/70">Notas: {selected.notes}</p>
            ) : null}
            <p className="mt-4 font-display text-2xl text-cream">
              {selected.total_label || formatCop(selected.total)}
            </p>
            {selected.telegram_error ? (
              <p className="mt-2 font-sans text-xs text-coral">
                El pedido está guardado. Telegram no envió la alerta.
              </p>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-2">
              {NEXT_ACTIONS[selected.status]?.map((action) => (
                <button
                  key={action.status}
                  type="button"
                  className={action.status === "cancelado" ? "btn-secondary" : "btn-primary"}
                  onClick={() => changeStatus(selected.public_id, action.status)}
                >
                  {action.label}
                </button>
              ))}
              {selected.payment_status !== "pagado" && selected.status !== "cancelado" ? (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => markPaid(selected.public_id)}
                >
                  Marcar pagado
                </button>
              ) : null}
            </div>

            {selected.status === "listo_para_recoger" && selected.whatsapp_url ? (
              <div className="mt-5 rounded-xl border border-amarillo/30 p-4">
                <a
                  href={selected.whatsapp_url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary"
                >
                  Abrir WhatsApp
                </a>
                <p className="mt-3 font-sans text-xs text-cream/60">
                  Se abre WhatsApp con el mensaje listo. Revísalo y pulsa Enviar ahí.
                  Abrir el chat no equivale a enviarlo.
                </p>
              </div>
            ) : null}
          </article>
        ) : null}
      </section>

      {settings ? (
        <section className="mt-12 rounded-2xl border border-white/10 p-5">
          <h2 className="font-display text-3xl text-amarillo">Datos del local</h2>
          <p className="mt-1 font-sans text-sm text-cream/60">
            Estos textos se usan en la página, el checkout y el mensaje de WhatsApp.
          </p>
          <form onSubmit={saveSettings} className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="font-sans text-sm">
              Nombre del emprendimiento
              <input
                name="business_name"
                className="field-input mt-1"
                defaultValue={settings.business_name}
                required
              />
            </label>
            <label className="font-sans text-sm">
              Teléfono de contacto
              <input
                name="contact_phone"
                className="field-input mt-1"
                defaultValue={settings.contact_phone}
                required
              />
            </label>
            <label className="font-sans text-sm sm:col-span-2">
              Dirección del local
              <input
                name="address"
                className="field-input mt-1"
                defaultValue={settings.address}
                required
              />
            </label>
            <label className="font-sans text-sm">
              Horario de recogida
              <input
                name="pickup_hours"
                className="field-input mt-1"
                defaultValue={settings.pickup_hours}
                required
              />
            </label>
            <label className="font-sans text-sm">
              Métodos de pago
              <input
                name="payment_methods"
                className="field-input mt-1"
                defaultValue={settings.payment_methods}
                required
              />
            </label>
            <div className="sm:col-span-2">
              <button type="submit" className="btn-primary">
                Guardar local
              </button>
            </div>
          </form>
        </section>
      ) : null}
    </main>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 font-sans text-xs uppercase tracking-wide ${
        active ? "bg-amarillo text-chocolate" : "border border-white/15 text-cream/80"
      }`}
    >
      {label}
    </button>
  );
}
