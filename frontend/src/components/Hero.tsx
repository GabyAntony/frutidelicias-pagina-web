import { FEATURES } from "@/lib/data";
import { ImagePlaceholder } from "./ImagePlaceholder";

export function Hero() {
  return (
    <section
      id="inicio"
      className="relative overflow-hidden bg-gradient-to-br from-chocolate via-rojo to-chocolate"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(242,208,107,0.15), transparent 40%), radial-gradient(circle at 80% 70%, rgba(242,138,128,0.12), transparent 45%)",
        }}
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
        <div className="animate-fade-up">
          <p className="mb-4 font-sans text-xs font-medium tracking-[0.2em] text-amarillo uppercase">
            Fruta fresca · Chocolate real
          </p>
          <h1 className="font-display text-5xl leading-none tracking-wide text-cream sm:text-6xl lg:text-7xl">
            Tu pausa dulce acaba de ponerse irresistible
          </h1>
          <p className="mt-5 max-w-md font-sans text-base leading-relaxed text-cream/75 sm:text-lg">
            Frescura natural, chocolate artesanal y momentos llenos de sabor.
            El antojo perfecto para cualquier momento del día.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#menu" className="btn-primary">
              Pedir ahora
            </a>
            <a href="#nosotros" className="btn-secondary">
              Nuestra historia
            </a>
          </div>

          <ul className="mt-10 flex flex-wrap gap-6 border-t border-white/10 pt-8">
            {FEATURES.map((feature) => (
              <li
                key={feature.label}
                className="flex items-center gap-2 font-sans text-sm text-cream/80"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amarillo/15 text-amarillo">
                  <FeatureDot />
                </span>
                {feature.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto w-full max-w-md animate-fade-up-delay lg:max-w-none">
          <div className="relative">
            <ImagePlaceholder
              label="Producto hero"
              slot="hero-bowl"
              aspect="circle"
              className="w-full shadow-2xl shadow-black/40"
            />
            <div className="absolute -bottom-2 -left-2 flex h-24 w-24 items-center justify-center rounded-full border-2 border-amarillo/60 bg-chocolate sm:h-28 sm:w-28">
              <p className="px-2 text-center font-display text-[10px] leading-tight tracking-wider text-amarillo uppercase sm:text-xs">
                Est. 2024
                <br />
                Fruti Delicias
                <br />
                Antojo real
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureDot() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="7" cy="7" r="2" fill="currentColor" />
    </svg>
  );
}
