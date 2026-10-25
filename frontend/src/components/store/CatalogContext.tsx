"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { apiFetch, type CatalogProduct } from "@/lib/api";
import { PRODUCTS as FALLBACK_PRODUCTS } from "@/lib/data";

/**
 * Catálogo de productos.
 *
 * El servidor es la fuente de verdad de los precios: por eso lo consultamos
 * en `/api/products`. La lista estática solo se usa como respaldo para el
 * primer pintado (y si el API no está disponible), nunca como precio final.
 */
const FALLBACK: CatalogProduct[] = FALLBACK_PRODUCTS.map((product) => ({
  id: product.id,
  name: product.name,
  description: product.description,
  price: product.price,
  image_slot: product.imageSlot,
}));

type CatalogContextValue = {
  products: CatalogProduct[];
  /** Precio vigente del producto, o null si ya no existe en el catálogo. */
  priceOf: (id: number) => number | null;
  productOf: (id: number) => CatalogProduct | null;
  loading: boolean;
};

const CatalogContext = createContext<CatalogContextValue>({
  products: FALLBACK,
  priceOf: () => null,
  productOf: () => null,
  loading: true,
});

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<CatalogProduct[]>(FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    apiFetch("/products")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data as CatalogProduct[]);
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<CatalogContextValue>(() => {
    const byId = new Map(products.map((product) => [product.id, product]));
    return {
      products,
      loading,
      priceOf: (id: number) => byId.get(id)?.price ?? null,
      productOf: (id: number) => byId.get(id) ?? null,
    };
  }, [products, loading]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  return useContext(CatalogContext);
}
