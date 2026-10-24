import { STATS } from "@/lib/data";
import { ImagePlaceholder } from "./ImagePlaceholder";

export function OurStory() {
  return (
    <section id="nosotros" className="bg-rojo/40 px-5 py-20 lg:px-8">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="font-sans text-xs font-medium tracking-[0.2em] text-amarillo uppercase">
            Nuestra historia
          </p>
          <h2 className="mt-3 font-display text-4xl tracking-wide text-cream sm:text-5xl">
            Pasión en cada bocado
          </h2>
          <p className="mt-5 font-sans text-base leading-relaxed text-cream/75">
            Nacimos de una idea simple: unir la frescura de la fruta natural con
            el placer del chocolate. Cada bowl y brocheta se prepara al momento
            para que sientas ese antojo fresco, crocante e irresistible.
          </p>
          <p className="mt-4 font-sans text-base leading-relaxed text-cream/75">
            Somos cercanos, divertidos y siempre listos para ser ese amigo que
            te invita a disfrutar un gusto dulce en cualquier momento del día.
          </p>
          <p className="mt-6 font-display text-2xl tracking-wide text-coral">
            — Fruti Delicias
          </p>

          <dl className="mt-10 flex flex-wrap gap-8 border-t border-white/10 pt-8 sm:gap-12">
            {STATS.map((stat, i) => (
              <div
                key={stat.label}
                className={`pr-8 sm:pr-12 ${
                  i < STATS.length - 1 ? "border-r border-white/15" : ""
                }`}
              >
                <dt className="font-display text-3xl tracking-wide text-amarillo">
                  {stat.value}
                </dt>
                <dd className="mt-1 font-sans text-sm text-cream/60">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <ImagePlaceholder
            label="Preparación"
            slot="story-main"
            aspect="portrait"
            className="col-span-2 row-span-2 min-h-[280px] rounded-2xl sm:col-span-1 sm:row-span-2"
          />
          <ImagePlaceholder
            label="Producto"
            slot="story-product"
            aspect="square"
            className="rounded-2xl"
          />
          <ImagePlaceholder
            label="Ambiente"
            slot="story-ambiente"
            aspect="square"
            className="rounded-2xl"
          />
        </div>
      </div>
    </section>
  );
}
