"use client";

import { useCart } from "@/components/cart/CartContext";
import { useCatalog } from "@/components/store/CatalogContext";
import { formatCop } from "@/lib/api";
import { ImagePlaceholder } from "./ImagePlaceholder";

export function SignatureCollection() {
  const { add } = useCart();
  const { products } = useCatalog();

  return (
    <section id="menu" className="bg-chocolate px-5 py-20 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-xl text-center">
          <p className="font-sans text-xs font-medium tracking-[0.2em] text-coral uppercase">
            Favoritos de la casa
          </p>
          <h2 className="mt-3 font-display text-4xl tracking-wide text-cream sm:text-5xl">
            Colección signature
          </h2>
          <p className="mt-3 font-sans text-sm text-cream/65 sm:text-base">
            Combinaciones artesanales listas para recoger en el local. Agrega al
            carrito y paga al recoger, en efectivo o Nequi.
          </p>
        </div>

        <div
          id="especiales"
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {products.map((product) => (
            <article
              key={product.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-white/8 bg-rojo/30 transition-transform duration-300 hover:-translate-y-1"
            >
              <ImagePlaceholder
                label={product.name}
                slot={product.image_slot}
                aspect="square"
                className="rounded-none border-0 border-b border-white/8"
              />
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-display text-xl tracking-wide text-amarillo">
                  {product.name}
                </h3>
                <p className="mt-2 flex-1 font-sans text-sm leading-relaxed text-cream/60">
                  {product.description}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-sans text-lg font-semibold text-cream">
                    {formatCop(product.price)}
                  </span>
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-amarillo text-chocolate transition-colors hover:bg-coral"
                    aria-label={`Agregar ${product.name}`}
                    onClick={() =>
                      add({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                      })
                    }
                  >
                    <PlusIcon />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 text-center">
          <a href="#contacto" className="btn-secondary">
            Ver menú completo
          </a>
        </div>
      </div>
    </section>
  );
}

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M9 3v12M3 9h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
