"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useCatalog } from "@/components/store/CatalogContext";

export type CartProduct = {
  id: number;
  name: string;
  price: number;
};

export type CartLine = CartProduct & { quantity: number };

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  open: boolean;
  setOpen: (open: boolean) => void;
  add: (product: CartProduct) => void;
  setQuantity: (id: number, quantity: number) => void;
  remove: (id: number) => void;
  clear: () => void;
};

const STORAGE_KEY = "fruti-cart-v1";
const EMPTY: CartLine[] = [];
const CartContext = createContext<CartContextValue | null>(null);

/**
 * El carrito vive en localStorage: es un almacén externo, así que se lee con
 * `useSyncExternalStore`. Durante el render en el servidor y la hidratación
 * se usa el snapshot vacío, y el navegador toma el valor guardado en cuanto
 * monta. Así no hay diferencias entre el HTML del servidor y el del cliente.
 */
let cachedRaw: string | null = null;
let cachedLines: CartLine[] = EMPTY;
const listeners = new Set<() => void>();

function parseCart(raw: string | null): CartLine[] {
  if (!raw) return EMPTY;
  try {
    const parsed = JSON.parse(raw) as CartLine[];
    if (!Array.isArray(parsed)) return EMPTY;
    const lines = parsed.filter(
      (line) =>
        line &&
        typeof line.id === "number" &&
        typeof line.quantity === "number" &&
        line.quantity > 0,
    );
    return lines.length > 0 ? lines : EMPTY;
  } catch {
    return EMPTY;
  }
}

function getSnapshot(): CartLine[] {
  if (typeof window === "undefined") return EMPTY;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedLines = parseCart(raw);
  }
  return cachedLines;
}

function getServerSnapshot(): CartLine[] {
  return EMPTY;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function persist(next: CartLine[]) {
  cachedLines = next;
  cachedRaw = JSON.stringify(next);
  window.localStorage.setItem(STORAGE_KEY, cachedRaw);
  listeners.forEach((listener) => listener());
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { priceOf } = useCatalog();
  const lines = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [open, setOpen] = useState(false);

  const add = useCallback(
    (product: CartProduct) => {
      const current = getSnapshot();
      const found = current.find((line) => line.id === product.id);
      const next = found
        ? current.map((line) =>
            line.id === product.id
              ? { ...line, quantity: Math.min(20, line.quantity + 1) }
              : line,
          )
        : [...current, { ...product, quantity: 1 }];
      persist(next);
      setOpen(true);
    },
    [],
  );

  const setQuantity = useCallback((id: number, quantity: number) => {
    const current = getSnapshot();
    const next =
      quantity < 1
        ? current.filter((line) => line.id !== id)
        : current.map((line) =>
            line.id === id ? { ...line, quantity: Math.min(20, quantity) } : line,
          );
    persist(next);
  }, []);

  const remove = useCallback((id: number) => {
    persist(getSnapshot().filter((line) => line.id !== id));
  }, []);

  const clear = useCallback(() => persist(EMPTY), []);

  /**
   * El precio guardado en el navegador es solo una copia para pintar rápido:
   * el total real se recalcula con el catálogo vigente del servidor, que es
   * la fuente de verdad. Así el cliente nunca ve un precio desactualizado.
   */
  const pricedLines = useMemo(
    () => lines.map((line) => ({ ...line, price: priceOf(line.id) ?? line.price })),
    [lines, priceOf],
  );

  const value = useMemo(
    () => ({
      lines: pricedLines,
      count: pricedLines.reduce((sum, line) => sum + line.quantity, 0),
      subtotal: pricedLines.reduce((sum, line) => sum + line.price * line.quantity, 0),
      open,
      setOpen,
      add,
      setQuantity,
      remove,
      clear,
    }),
    [add, clear, pricedLines, open, remove, setQuantity],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart debe usarse dentro de CartProvider");
  }
  return ctx;
}
