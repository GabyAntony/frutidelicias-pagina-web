import { PILLARS } from "@/lib/data";
import { Reveal } from "./ui/Reveal";
import { SectionHeading } from "./ui/SectionHeading";

export function BrandPillars() {
  return (
    <section className="relative overflow-hidden bg-cream px-5 py-20 lg:px-8 lg:py-28">
      <div
        className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-coral/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-amarillo/30 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl">
        <Reveal>
          <SectionHeading
            eyebrow="Los 3 pilares de la marca"
            title={
              <>
                Así se construye un{" "}
                <span className="text-rojo">antojo perfecto</span>
              </>
            }
            description="Frescura, chocolate y felicidad. Sin atajos, sin sabores fake, sin excusas."
            tone="dark"
            align="center"
          />
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-3 lg:gap-6">
          {PILLARS.map((pillar, index) => (
            <Reveal key={pillar.title} delay={index * 0.08}>
              <article className="group relative h-full overflow-hidden rounded-[1.75rem] border border-chocolate/10 bg-white/65 p-6 shadow-[0_18px_45px_-28px_rgba(76,30,13,0.35)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:scale-[1.015] hover:border-rojo/20 hover:shadow-[0_28px_60px_-24px_rgba(76,30,13,0.42)] sm:p-7">
                <span
                  className="pointer-events-none absolute -right-3 -top-6 font-display text-[7rem] leading-none text-chocolate/[0.055] transition-colors duration-300 group-hover:text-rojo/[0.08]"
                  aria-hidden
                >
                  {pillar.number}
                </span>

                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rojo to-chocolate text-amarillo shadow-cocoa transition-transform duration-300 group-hover:rotate-3 group-hover:scale-105">
                  <PillarIcon icon={pillar.icon} />
                </div>

                <h3 className="relative mt-6 font-display text-3xl uppercase tracking-wide text-chocolate">
                  {pillar.title}
                </h3>
                <p className="relative mt-3 font-sans text-sm leading-relaxed text-chocolate/70">
                  {pillar.description}
                </p>
                <p className="relative mt-4 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-rojo/80">
                  {pillar.detail}
                </p>

                <div className="relative mt-6 h-1 w-12 rounded-full bg-amarillo transition-all duration-300 group-hover:w-24 group-hover:bg-coral" />
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <p className="mt-12 text-center font-display text-2xl uppercase tracking-[0.12em] text-chocolate/35 sm:text-3xl">
            Frescura por fuera,{" "}
            <span className="text-rojo/60">chocolate por todas partes.</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function PillarIcon({ icon }: { icon: string }) {
  if (icon === "chocolate") {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect
          x="4"
          y="3"
          width="16"
          height="18"
          rx="3"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        <path
          d="M4 9h16M4 15h16M10 3v18M15 3v18"
          stroke="currentColor"
          strokeWidth="1.05"
          opacity="0.8"
        />
      </svg>
    );
  }
  if (icon === "spark") {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 2.5 14.1 9l6.4 2.1-6.4 2.1L12 19.6l-2.1-6.4L3.5 11l6.4-2L12 2.5Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M19 3v4M17 5h4"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21c5-3.2 8-7.1 8-11a5 5 0 0 0-8-4 5 5 0 0 0-8 4c0 3.9 3 7.8 8 11Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M12 7v7M9.5 10.5h5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}
