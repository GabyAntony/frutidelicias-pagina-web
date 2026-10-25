import type { StaticImageData } from "next/image";
import bowlFresa from "@/assets/images/product-bowl-fresa.webp";
import brochetaTropical from "@/assets/images/product-brocheta-tropical.webp";
import deliciaPremium from "@/assets/images/product-delicia-premium.webp";
import mixCrocante from "@/assets/images/product-mix-crocante.webp";

export const MENU_CATEGORIES = [
  { id: "todos", label: "Todos", icon: "✦" },
  { id: "pinchos", label: "Pinchos", icon: "🍢" },
  { id: "bowls", label: "Bowls", icon: "🥣" },
  { id: "cajitas", label: "Cajitas de Regalo", icon: "🎁" },
  { id: "combos", label: "Combos", icon: "💞" },
] as const;

export type MenuCategory = (typeof MENU_CATEGORIES)[number]["id"];
export type ProductCategory = Exclude<MenuCategory, "todos">;
export type ProductAccent = "amarillo" | "coral";

export type ProductMeta = {
  category: ProductCategory;
  badge: string;
  tagline: string;
  accent: ProductAccent;
};

export const PRODUCT_META: Record<string, ProductMeta> = {
  "bowl-fresa-chocolate": {
    category: "bowls",
    badge: "100% Natural",
    tagline: "Fresa + chocolate: el clásico que nunca falla.",
    accent: "coral",
  },
  "brocheta-tropical": {
    category: "pinchos",
    badge: "Favorito",
    tagline: "Piña, fresa y uva con un baño de chocolate real.",
    accent: "amarillo",
  },
  "mix-crocante": {
    category: "bowls",
    badge: "Crocante",
    tagline: "Fruta de temporada con el crunch de la casa.",
    accent: "amarillo",
  },
  "delicia-premium": {
    category: "cajitas",
    badge: "Para regalar",
    tagline: "El match premium que tu antojo se merece.",
    accent: "coral",
  },
};

export const PRODUCT_IMAGES: Record<string, StaticImageData> = {
  "bowl-fresa-chocolate": bowlFresa,
  "brocheta-tropical": brochetaTropical,
  "mix-crocante": mixCrocante,
  "delicia-premium": deliciaPremium,
};

const FALLBACK_META: ProductMeta = {
  category: "bowls",
  badge: "100% Natural",
  tagline: "Frescura por fuera, chocolate por todas partes.",
  accent: "amarillo",
};

export function productMeta(slot: string): ProductMeta {
  return PRODUCT_META[slot] ?? FALLBACK_META;
}

export function productImage(slot: string): StaticImageData | undefined {
  return PRODUCT_IMAGES[slot];
}

export function categoryCounts(products: { image_slot: string }[]) {
  return products.reduce<Record<string, number>>((acc, product) => {
    const category = productMeta(product.image_slot).category;
    acc[category] = (acc[category] ?? 0) + 1;
    return acc;
  }, {});
}
