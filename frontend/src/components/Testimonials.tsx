import { TESTIMONIALS } from "@/lib/data";
import { ImagePlaceholder } from "./ImagePlaceholder";

export function Testimonials() {
  return (
    <section className="bg-chocolate px-5 py-20 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="font-sans text-xs font-medium tracking-[0.2em] text-coral uppercase">
              Voces dulces
            </p>
            <h2 className="mt-3 font-display text-4xl tracking-wide text-cream sm:text-5xl">
              Experiencias inolvidables
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((n) => (
                <ImagePlaceholder
                  key={n}
                  label=""
                  slot={`avatar-${n}`}
                  aspect="circle"
                  className="h-10 w-10 border-2 border-chocolate"
                />
              ))}
            </div>
            <p className="font-sans text-sm text-cream/70">
              <span className="font-semibold text-amarillo">4.9</span> · 2,500+
              antojos felices
            </p>
          </div>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((item) => (
            <blockquote
              key={item.id}
              className="flex flex-col rounded-2xl border border-white/8 bg-rojo/25 p-6"
            >
              <div className="flex items-center gap-3">
                <ImagePlaceholder
                  label={item.name}
                  slot={`testimonial-${item.id}`}
                  aspect="circle"
                  className="h-12 w-12 shrink-0"
                />
                <div>
                  <Stars />
                  <cite className="not-italic">
                    <span className="block font-sans text-sm font-medium text-cream">
                      {item.name}
                    </span>
                    <span className="font-sans text-xs text-amarillo">
                      {item.role}
                    </span>
                  </cite>
                </div>
              </div>
              <p className="mt-4 flex-1 font-sans text-sm leading-relaxed text-cream/75">
                “{item.quote}”
              </p>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stars() {
  return (
    <div className="mb-1 flex gap-0.5 text-amarillo" aria-label="5 estrellas">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
          <path d="M6 0.8l1.4 3.2 3.5.3-2.7 2.3.8 3.4L6 8.2 2.9 10l.8-3.4L1 4.3l3.5-.3L6 .8z" />
        </svg>
      ))}
    </div>
  );
}
