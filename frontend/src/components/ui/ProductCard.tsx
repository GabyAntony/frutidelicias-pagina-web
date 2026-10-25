"use client";

import { motion } from "motion/react";
import type { CatalogProduct } from "@/lib/api";
import { formatCop } from "@/lib/api";
import { useCart } from "@/components/cart/CartContext";
import { useStore } from "@/components/store/StoreContext";
import { productMeta } from "@/lib/menu";
import { buildProductMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { ProductVisual } from "./ProductVisual";

export function ProductCard({
  product,
  index = 0,
}: {
  product: CatalogProduct;
  index?: number;
}) {
  const { add } = useCart();
  const store = useStore();
  const meta = productMeta(product.image_slot);
  const badgeClass =
    meta.accent === "coral"
      ? "bg-coral text-chocolate"
      : "bg-amarillo text-chocolate";

  const whatsappUrl = buildWhatsAppUrl(
    store.contact_phone,
    buildProductMessage(product.name, formatCop(product.price)),
  );

  function addToCart() {
    add({
      id: product.id,
      name: product.name,
      price: product.price,
    });
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -8 }}
      className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-b from-rojo/45 to-chocolate shadow-cocoa"
    >
      <button
        type="button"
        onClick={addToCart}
        className="block w-full text-left"
        aria-label={`Agregar ${product.name} al carrito`}
      >
        <ProductVisual
          slot={product.image_slot}
          alt={product.name}
          className="aspect-[4/5] w-full"
          imageClassName="group-hover:scale-110"
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 92vw"
        />
      </button>

      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(115deg, transparent 38%, rgba(255,249,245,0.16) 50%, transparent 62%)",
          }}
        />
      </div>

      <div className="pointer-events-none absolute left-4 top-4 flex flex-col items-start gap-2">
        <span
          className={`rounded-full px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-[0.16em] shadow-lg ${badgeClass}`}
        >
          {meta.badge}
        </span>
        <span className="rounded-full border border-white/20 bg-chocolate/45 px-3 py-1 font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-cream/85 backdrop-blur-md">
          {categoryLabel(meta.category)}
        </span>
      </div>

      <div className="pointer-events-none absolute right-4 top-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 sm:translate-y-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-xl backdrop-blur-md">
          <span aria-hidden>🍫</span>
        </span>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-chocolate via-chocolate/95 to-transparent px-5 pb-5 pt-20">
        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-amarillo/90">
          {meta.tagline}
        </p>
        <h3 className="mt-2 font-display text-[1.65rem] leading-none tracking-wide text-cream">
          {product.name}
        </h3>
        <p className="mt-2 line-clamp-2 font-sans text-xs leading-relaxed text-cream/65">
          {product.description}
        </p>

        <div className="pointer-events-none mt-4 flex items-center justify-between gap-3">
          <span className="font-sans text-xl font-bold text-cream">
            {formatCop(product.price)}
          </span>
          <div className="pointer-events-auto flex items-center gap-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-cream transition-colors hover:border-whatsapp hover:bg-whatsapp"
              aria-label={`Pedir ${product.name} por WhatsApp`}
            >
              <WhatsAppIcon />
            </a>
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              className="flex h-11 items-center gap-2 rounded-full bg-amarillo px-4 font-sans text-[11px] font-bold uppercase tracking-[0.12em] text-chocolate shadow-[0_12px_30px_-12px_rgba(242,208,107,0.9)] transition-colors hover:bg-coral"
              onClick={addToCart}
              aria-label={`Agregar ${product.name} al carrito`}
            >
              <PlusIcon />
              Agregar
            </motion.button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function categoryLabel(category: string) {
  if (category === "pinchos") return "Pincho";
  if (category === "cajitas") return "Cajita regalo";
  if (category === "combos") return "Combo";
  return "Bowl";
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M7 2v10M2 7h10"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12.04 2C6.6 2 2.18 6.42 2.18 11.86c0 1.74.45 3.44 1.32 4.94L2 22l5.35-1.4a9.9 9.9 0 0 0 4.69 1.2h.01c5.43 0 9.85-4.42 9.85-9.86A9.8 9.8 0 0 0 12.04 2Zm0 17.94h-.01a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.17.83.85-3.1-.2-.31a8.18 8.18 0 0 1-1.26-4.38c0-4.52 3.68-8.2 8.21-8.2 2.19 0 4.25.86 5.8 2.41a8.15 8.15 0 0 1 2.4 5.8c0 4.52-3.68 8.2-8.2 8.2Zm4.5-6.14c-.25-.12-1.46-.72-1.69-.8-.23-.09-.4-.13-.56.12-.17.25-.65.8-.8.96-.14.17-.29.19-.54.07-.25-.13-1.04-.38-1.98-1.22-.73-.65-1.23-1.46-1.37-1.71-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.86.84-.86 2.05 0 1.21.88 2.38 1 2.54.12.17 1.73 2.64 4.2 3.7.59.25 1.05.4 1.4.51.59.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.18.2-.58.2-1.07.14-1.18-.06-.1-.23-.16-.48-.28Z" />
    </svg>
  );
}
