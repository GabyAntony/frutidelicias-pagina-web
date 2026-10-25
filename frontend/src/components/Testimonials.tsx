import { TESTIMONIALS } from "@/lib/data";
import { Reveal } from "./ui/Reveal";
import { SectionHeading } from "./ui/SectionHeading";

export function Testimonials() {
  return (
    <section className="relative overflow-hidden bg-cream-deep px-5 py-20 lg:px-8 lg:py-28">
      <div
        className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-coral/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-amarillo/35 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
            <SectionHeading
              eyebrow="Voces dulces"
              title={
                <>
                  El antojo que{" "}
                  <span className="text-rojo">se repite</span>
                </>
              }
              description="No lo decimos nosotros. Lo dicen quienes ya hicieron de Fruti Delicias su pausa favorita."
              tone="dark"
            />

            <div className="flex items-center gap-3 rounded-full border border-chocolate/10 bg-white/60 px-4 py-3 shadow-[0_16px_35px_-28px_rgba(76,30,13,0.5)]">
              <div className="flex -space-x-2">
                {TESTIMONIALS.map((item) => (
                  <span
                    key={item.id}
                    className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-cream-deep bg-gradient-to-br from-rojo to-chocolate font-display text-sm text-amarillo"
                    aria-hidden
                  >
                    {item.name.charAt(0)}
                  </span>
                ))}
              </div>
              <div>
                <p className="font-sans text-sm font-bold text-chocolate">
                  4.9 <span className="text-amarillo">★★★★★</span>
                </p>
                <p className="font-sans text-[10px] text-chocolate/50">
                  2,500+ antojos felices
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((item, index) => (
            <Reveal key={item.id} delay={index * 0.08}>
              <blockquote className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-chocolate/10 bg-white/65 p-6 shadow-[0_20px_45px_-32px_rgba(76,30,13,0.5)] transition-all duration-300 hover:-translate-y-2 hover:bg-white hover:shadow-[0_30px_60px_-30px_rgba(76,30,13,0.45)] sm:p-7">
                <span
                  className="pointer-events-none absolute -right-2 -top-8 font-display text-[7rem] leading-none text-rojo/[0.06]"
                  aria-hidden
                >
                  ”
                </span>

                <div className="flex items-center gap-1 text-amarillo" aria-label="5 estrellas">
                  {Array.from({ length: 5 }).map((_, star) => (
                    <Star key={star} />
                  ))}
                </div>

                <p className="relative mt-4 flex-1 font-sans text-sm leading-relaxed text-chocolate/75">
                  “{item.quote}”
                </p>

                <footer className="relative mt-6 flex items-center gap-3 border-t border-chocolate/10 pt-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-rojo to-chocolate font-display text-lg text-amarillo">
                    {item.name.charAt(0)}
                  </span>
                  <div>
                    <cite className="block font-sans text-sm font-bold not-italic text-chocolate">
                      {item.name}
                    </cite>
                    <span className="font-sans text-[10px] font-medium uppercase tracking-[0.1em] text-rojo/60">
                      {item.role}
                    </span>
                  </div>
                </footer>
              </blockquote>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Star() {
  return (
    <svg width="13" height="13" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
      <path d="M6 0.8l1.4 3.2 3.5.3-2.7 2.3.8 3.4L6 8.2 2.9 10l.8-3.4L1 4.3l3.5-.3L6 .8z" />
    </svg>
  );
}
