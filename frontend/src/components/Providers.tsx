"use client";

import { MotionConfig } from "motion/react";
import { CartProvider } from "@/components/cart/CartContext";
import { CatalogProvider } from "@/components/store/CatalogContext";
import { StoreProvider } from "@/components/store/StoreContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <CatalogProvider>
        <StoreProvider>
          <CartProvider>{children}</CartProvider>
        </StoreProvider>
      </CatalogProvider>
    </MotionConfig>
  );
}
