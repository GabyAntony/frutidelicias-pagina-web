"use client";

import Image from "next/image";
import storyBowl from "@/assets/images/story-bowl.webp";
import storyFeria from "@/assets/images/story-feria.webp";
import { useStore } from "@/components/store/StoreContext";
import { STATS, WHATSAPP_DEFAULT_MESSAGE } from "@/lib/data";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { Reveal } from "./ui/Reveal";
import { SectionHeading } from "./ui/SectionHeading";

export function OurStory() {
  const store = useStore();
  const whatsappUrl = buildWhatsAppUrl(
    store.contact_phone,
    WHATSAPP_DEFAULT_MESSAGE,
  );

  return (
    <section
      id="nosotros"
      className="relative overflow-hidden bg-rojo px-5 py-20 lg:px-8 lg:py-28"
    >
      <div className="pointer-events-none absolute inset-0 cocoa-texture" aria-hidden />
      <div
        className="pointer-events-none absolute -left-32 bottom-0 h-96 w-96 rounded-full bg-amarillo/10 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
        <Reveal>
          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-white/10 shadow-warm">
              <Image
                src={storyFeria}
                alt="Bowl de fruta fresca con chocolate de Fruti Delicias"
                fill
                placeholder="blur"
                sizes="(min-width: 1024px) 42vw, 92vw"
                className="image-warm object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-chocolate/80 via-transparent to-rojo/20" />
            </div>

            <div className="absolute -bottom-8 -right-2 w-40 overflow-hidden rounded-[1.5rem] border-4 border-rojo shadow-warm sm:-right-6 sm:w-52">
              <div className="relative aspect-[4/5]">
                <Image
                  src={storyBowl}
                  alt="Detalle de fruta bañada en chocolate artesanal"
                  fill
                  placeholder="blur"
                  sizes="(min-width: 640px) 13rem, 10rem"
                  className="image-warm object-cover"
                />
              </div>
            </div>

            <div className="absolute -left-2 top-6 rotate-[-4deg] rounded-full border border-amarillo/40 bg-chocolate/85 px-4 py-2 backdrop-blur-md sm:-left-6">
              <p className="font-display text-lg leading-none tracking-wide text-amarillo">
                Hecho a mano
              </p>
              <p className="font-sans text-[8px] font-semibold uppercase tracking-[0.18em] text-cream/55">
                con fruta del día
              </p>
            </div>
          </div>
        </Reveal>

        <div>
          <Reveal>
            <SectionHeading
              eyebrow="Nuestra historia"
              title={
                <>
                  Nacimos para{" "}
                  <span className="text-amarillo">endulzar tu día</span>
                </>
              }
              description="Un día decidimos unir dos cosas que ya eran perfectas por separado: la fruta más fresca de la cosecha y el chocolate más real que encontramos. El resto es historia (y antojo)."
            />
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-6 space-y-4 font-sans text-sm leading-relaxed text-cream/70 sm:text-base">
              <p>
                No somos una frutería. No somos una chocolatería. Somos ese
                lugar al que vuelves cuando necesitas una pausa dulce que
                también se sienta fresca. Sin culpa, sin complicaciones, sin
                sabores artificiales.
              </p>
              <p>
                Cada bowl y cada brocheta se prepara al momento, con una
                generosidad que se nota en el primer bocado. Porque el antojo
                perfecto no se raciona.
              </p>
            </div>

            <blockquote className="mt-7 border-l-2 border-amarillo/60 pl-4">
              <p className="font-display text-2xl uppercase leading-tight tracking-wide text-cream sm:text-3xl">
                “Frescura por fuera, chocolate por todas partes.”
              </p>
              <cite className="mt-2 block font-sans text-[10px] font-semibold uppercase not-italic tracking-[0.18em] text-amarillo/80">
                — Fruti Delicias
              </cite>
            </blockquote>

            <dl className="mt-9 grid grid-cols-3 gap-3 border-t border-white/10 pt-7">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <dt className="font-display text-3xl leading-none text-amarillo sm:text-4xl">
                    {stat.value}
                  </dt>
                  <dd className="mt-1.5 font-sans text-[10px] leading-tight text-cream/55 sm:text-xs">
                    {stat.label}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#menu" className="btn-primary">
                Ver el menú
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary"
              >
                Escríbenos
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
