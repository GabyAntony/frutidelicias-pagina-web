"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import heroBowl from "@/assets/images/hero-bowl.webp";
import { useStore } from "@/components/store/StoreContext";
import { FEATURES, MARQUEE_ITEMS, WHATSAPP_DEFAULT_MESSAGE } from "@/lib/data";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { FloatingFruitLayer } from "./ui/FloatingFruit";

export function Hero() {
  const reduce = useReducedMotion();
  const store = useStore();
  const { scrollY } = useScroll();
  const visualY = useTransform(scrollY, [0, 700], [0, 80]);
  const whatsappUrl = buildWhatsAppUrl(
    store.contact_phone,
    WHATSAPP_DEFAULT_MESSAGE,
  );

  return (
    <section
      id="inicio"
      className="relative isolate overflow-hidden bg-gradient-to-br from-chocolate via-rojo to-[#2b0f08]"
    >
      <div className="absolute inset-0 cocoa-texture" aria-hidden />
      <div
        className="absolute -left-24 top-4 h-80 w-80 rounded-full bg-rojo/70 mesh-blob"
        aria-hidden
      />
      <div
        className="absolute -right-24 top-1/3 h-[28rem] w-[28rem] rounded-full bg-coral/20 mesh-blob"
        style={{ animationDelay: "-6s" }}
        aria-hidden
      />
      <div
        className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-amarillo/10 mesh-blob"
        style={{ animationDelay: "-12s" }}
        aria-hidden
      />
      <FloatingFruitLayer className="hidden opacity-90 lg:block" />

      <div className="relative mx-auto grid min-h-[calc(100svh-4.5rem)] max-w-7xl items-center gap-12 px-5 pb-20 pt-12 sm:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:px-8 lg:pb-28 lg:pt-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reduce ? 0 : 0.8,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative z-10 max-w-2xl"
        >
          <p className="eyebrow text-amarillo">
            Fruta fresca · Chocolate real · Hecho al momento
          </p>

          <h1 className="mt-5 font-display text-[clamp(3.4rem,9vw,7rem)] uppercase leading-[0.84] tracking-tight text-cream">
            Fruta fresca{" "}
            <span className="text-coral" aria-hidden>
              +
            </span>{" "}
            chocolate real
            <span className="mt-2 block text-gradient-pineapple">
              = Match perfecto
            </span>
          </h1>

          <p className="mt-6 max-w-lg font-sans text-base leading-relaxed text-cream/75 sm:text-lg">
            Frescura por fuera, chocolate por todas partes. Tu pausa dulce del
            día acaba de ponerse crujiente. 🍓🍫
          </p>

          <div className="mt-8 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center lg:flex-col lg:items-stretch xl:flex-row xl:items-center">
            <a
              href="#menu"
              className="btn-primary animate-pulse-glow w-full sm:w-auto lg:w-full xl:w-auto"
              data-cursor
              data-cursor-label="¡Antójate!"
            >
              ¡Pedir mi antojo ahora! 🍓🍫
            </a>
            <a
              href="#match"
              className="btn-secondary w-full sm:w-auto lg:w-full xl:w-auto"
            >
              Crea tu match perfecto
            </a>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 font-sans text-xs font-medium text-cream/60 underline decoration-cream/20 underline-offset-4 transition-colors hover:text-amarillo"
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-whatsapp" />
            ¿Ya sabes qué quieres? Pídelo por WhatsApp
            <span aria-hidden>↗</span>
          </a>

          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/10 pt-7">
            {FEATURES.map((feature) => (
              <li
                key={feature.label}
                className="flex items-center gap-2 font-sans text-xs font-medium text-cream/75 sm:text-sm"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-amarillo/25 bg-amarillo/10 text-amarillo">
                  <FeatureIcon icon={feature.icon} />
                </span>
                {feature.label}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          style={{ y: reduce ? 0 : visualY }}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: reduce ? 0 : 0.9,
            delay: reduce ? 0 : 0.15,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative z-10 mx-auto w-full max-w-[30rem] lg:max-w-[34rem]"
        >
          <div className="absolute -inset-5 rounded-full border border-dashed border-amarillo/25 animate-spin-slow sm:-inset-7" />
          <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-amarillo/25 via-coral/10 to-transparent blur-2xl" />

          <div className="relative aspect-square overflow-hidden rounded-full border-2 border-amarillo/30 shadow-[0_35px_90px_-30px_rgba(0,0,0,0.75)]">
            <Image
              src={heroBowl}
              alt="Bowl de fruta fresca bañado en chocolate artesanal de Fruti Delicias"
              fill
              priority
              placeholder="blur"
              sizes="(min-width: 1024px) 34rem, 90vw"
              className="image-warm object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-chocolate via-chocolate/5 to-transparent" />
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 50% 38%, transparent 38%, rgba(43,15,8,0.52) 100%)",
              }}
            />
          </div>

          <motion.div
            animate={reduce ? undefined : { y: [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-2 -left-2 rounded-2xl border border-white/15 bg-chocolate/80 p-3 shadow-warm backdrop-blur-xl sm:-left-6 sm:p-4"
          >
            <p className="font-display text-3xl leading-none text-amarillo sm:text-4xl">
              100%
            </p>
            <p className="mt-1 font-sans text-[9px] font-semibold uppercase tracking-[0.18em] text-cream/65">
              fruta natural
            </p>
          </motion.div>

          <motion.div
            animate={reduce ? undefined : { rotate: [-3, 3, -3] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-1 top-6 rounded-full border border-chocolate/10 bg-cream px-3 py-2 text-center shadow-cocoa sm:-right-4 sm:px-4 sm:py-3"
          >
            <p className="font-display text-lg leading-none tracking-wide text-rojo sm:text-xl">
              Hecho
            </p>
            <p className="font-display text-lg leading-none tracking-wide text-rojo sm:text-xl">
              al momento
            </p>
          </motion.div>

          <div className="absolute bottom-[18%] right-0 hidden rounded-2xl border border-white/15 bg-white/10 px-3 py-2 backdrop-blur-md sm:block">
            <p className="font-sans text-[9px] font-semibold uppercase tracking-[0.16em] text-cream/60">
              Chocolate
            </p>
            <p className="font-sans text-sm font-bold text-amarillo">70% real</p>
          </div>
        </motion.div>
      </div>

      <div className="relative border-y border-white/10 bg-chocolate py-3">
        <div className="flex w-max animate-marquee items-center gap-8 whitespace-nowrap">
          {[0, 1].map((copy) => (
            <div
              key={copy}
              className="flex items-center gap-8"
              aria-hidden={copy === 1}
            >
              {MARQUEE_ITEMS.map((item) => (
                <span
                  key={`${copy}-${item}`}
                  className="flex items-center gap-8 font-display text-sm uppercase tracking-[0.22em] text-cream/55 sm:text-base"
                >
                  {item}
                  <span className="text-amarillo" aria-hidden>
                    ✦
                  </span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureIcon({ icon }: { icon: string }) {
  if (icon === "chocolate") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect
          x="4"
          y="3"
          width="16"
          height="18"
          rx="3"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path d="M4 9h16M4 15h16M10 3v18M15 3v18" stroke="currentColor" strokeWidth="1.1" />
      </svg>
    );
  }
  if (icon === "craft") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21c5-3.2 8-7.1 8-11a5 5 0 0 0-8-4 5 5 0 0 0-8 4c0 3.9 3 7.8 8 11Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M12 7v7M9.5 10.5h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
