"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useMemo, useState } from "react";
import { useCatalog } from "@/components/store/CatalogContext";
import { useStore } from "@/components/store/StoreContext";
import { formatCop } from "@/lib/api";
import {
  MENU_CATEGORIES,
  categoryCounts,
  productMeta,
  type MenuCategory,
} from "@/lib/menu";
import { MATCH_BASE_PRICE } from "@/lib/match";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { ProductCard } from "./ui/ProductCard";
import { ProductVisual } from "./ui/ProductVisual";
import { Reveal } from "./ui/Reveal";
import { SectionHeading } from "./ui/SectionHeading";

export function ProductMenu() {
  const { products } = useCatalog();
  const store = useStore();
  const reduce = useReducedMotion();
  const [active, setActive] = useState<MenuCategory>("todos");

  const counts = useMemo(() => categoryCounts(products), [products]);

  const filtered = useMemo(() => {
    if (active === "todos" || active === "combos") return products;
    return products.filter(
      (product) => productMeta(product.image_slot).category === active,
    );
  }, [active, products]);

  const showGrid = filtered.length > 0 && active !== "combos";
  const whatsappUrl = buildWhatsAppUrl(
    store.contact_phone,
    "¡Hola Fruti Delicias! 🍓🍫 Quiero armar un combo a mi gusto. ¿Me ayudan?",
  );

  return (
    <section
      id="menu"
      className="relative overflow-hidden bg-chocolate px-5 py-20 lg:px-8 lg:py-28"
    >
      <div className="pointer-events-none absolute inset-0 cocoa-texture" aria-hidden />
      <div
        className="pointer-events-none absolute -right-32 top-20 h-96 w-96 rounded-full bg-rojo/40 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
            <SectionHeading
              eyebrow="El menú de tus antojos"
              title={
                <>
                  ¿Qué se te antoja{" "}
                  <span className="text-amarillo">hoy?</span>
                </>
              }
              description="Lo mejor de la feria —y de tu día— en un solo bowl. Elige tu favorito, agrégalo y recógelo listo."
            />

            <div className="flex shrink-0 flex-wrap items-center gap-3">
              <span className="glass rounded-full px-4 py-2 font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-cream/75">
                Pago al recoger
              </span>
              <span className="rounded-full border border-amarillo/30 bg-amarillo/10 px-4 py-2 font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-amarillo">
                Hecho al momento
              </span>
            </div>
          </div>
        </Reveal>

        <div className="mt-10 flex flex-wrap gap-2">
          {MENU_CATEGORIES.map((category) => {
            const isActive = active === category.id;
            const count =
              category.id === "todos"
                ? products.length
                : category.id === "combos"
                  ? "∞"
                  : counts[category.id] ?? 0;

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setActive(category.id)}
                aria-pressed={isActive}
                className={`relative shrink-0 rounded-full border px-4 py-2.5 font-sans text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors sm:text-[11px] ${
                  isActive
                    ? "border-amarillo text-chocolate"
                    : "border-white/15 text-cream/65 hover:border-amarillo/50 hover:text-cream"
                }`}
              >
                {isActive ? (
                  <motion.span
                    layoutId="menu-filter-pill"
                    className="absolute inset-0 rounded-full bg-amarillo"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                ) : null}
                <span className="relative z-10 flex items-center gap-1.5">
                  <span aria-hidden>{category.icon}</span>
                  {category.label}
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[9px] ${
                      isActive
                        ? "bg-chocolate/15 text-chocolate"
                        : "bg-white/10 text-cream/55"
                    }`}
                  >
                    {count}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 min-h-[22rem]">
          <AnimatePresence mode="popLayout">
            {showGrid ? (
              <motion.div
                key={active}
                layout
                className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
              >
                {filtered.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={index}
                  />
                ))}
              </motion.div>
            ) : null}
          </AnimatePresence>

          {!showGrid ? (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduce ? 0 : 0.3 }}
              className="rounded-[1.75rem] border border-dashed border-amarillo/25 bg-rojo/15 px-6 py-12 text-center"
            >
              <p className="font-display text-3xl uppercase tracking-wide text-amarillo">
                {active === "combos"
                  ? "Los combos se arman a tu gusto"
                  : "Muy pronto más antojos"}
              </p>
              <p className="mx-auto mt-3 max-w-md font-sans text-sm text-cream/65">
                {active === "combos"
                  ? "Elige fruta, chocolate y toppings. Nosotros lo bañamos y te lo mandamos por WhatsApp."
                  : "Estamos preparando más delicias para esta categoría."}
              </p>
            </motion.div>
          ) : null}
        </div>

        <Reveal delay={0.1}>
          <div className="relative mt-8 overflow-hidden rounded-[2rem] border border-amarillo/20 bg-gradient-to-br from-rojo via-rojo/80 to-chocolate p-6 shadow-warm sm:p-8 lg:p-10">
            <div
              className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-coral/20 blur-3xl"
              aria-hidden
            />
            <div className="relative grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-amarillo/30 bg-amarillo/10 px-3 py-1.5 font-sans text-[10px] font-bold uppercase tracking-[0.18em] text-amarillo">
                  <span aria-hidden>💞</span> Combo Match
                </span>
                <h3 className="mt-4 font-display text-4xl uppercase leading-none tracking-wide text-cream sm:text-5xl">
                  Arma el combo que{" "}
                  <span className="text-amarillo">nadie más tiene</span>
                </h3>
                <p className="mt-3 max-w-lg font-sans text-sm leading-relaxed text-cream/70">
                  Tu fruta favorita + tu chocolate + tus toppings. Un match
                  hecho 100% a tu medida, listo para pedir por WhatsApp.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href="#match"
                    className="btn-primary"
                    data-cursor
                    data-cursor-label="¡Crear!"
                  >
                    Crear mi combo 🍓
                  </a>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary"
                  >
                    Pedir por WhatsApp
                  </a>
                </div>
              </div>

              <div className="relative mx-auto w-full max-w-xs">
                <div className="absolute inset-6 rounded-full bg-amarillo/20 blur-2xl" />
                <ProductVisual
                  slot="delicia-premium"
                  alt="Combo personalizado de fruta con chocolate"
                  className="aspect-square w-full rounded-full border border-amarillo/30 shadow-[0_30px_70px_-25px_rgba(0,0,0,0.8)]"
                  sizes="(min-width: 1024px) 20rem, 70vw"
                  imageClassName="scale-105"
                  interactive={false}
                />
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full border border-white/15 bg-chocolate/85 px-4 py-2 backdrop-blur-md">
                  <p className="font-sans text-[9px] font-semibold uppercase tracking-[0.16em] text-cream/60">
                    Desde
                  </p>
                  <p className="font-display text-xl leading-none text-amarillo">
                    {formatCop(MATCH_BASE_PRICE)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 font-sans text-[11px] text-cream/45 sm:flex-row">
          <p>Recogida en {store.address}</p>
          <p>{store.pickup_hours} · {store.payment_methods}</p>
        </div>
      </div>
    </section>
  );
}
