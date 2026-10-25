"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { apiFetch, type StoreInfo } from "@/lib/api";

const fallback: StoreInfo = {
  business_name: "Fruti Delicias",
  address: "Local Fruti Delicias",
  pickup_hours: "Vie–Dom · 11:00–20:00",
  contact_phone: "",
  payment_methods: "Efectivo y Nequi al recoger",
};

const StoreContext = createContext<StoreInfo>(fallback);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<StoreInfo>(fallback);

  useEffect(() => {
    let cancelled = false;
    apiFetch("/store")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) setStore(data);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore() {
  return useContext(StoreContext);
}
