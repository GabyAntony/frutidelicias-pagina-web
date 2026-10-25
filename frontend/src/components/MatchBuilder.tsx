"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useId, useState } from "react";
import { useStore } from "@/components/store/StoreContext";
import { formatCop } from "@/lib/api";
import {
  DEFAULT_MATCH,
  MATCH_BASE_PRICE,
  MATCH_CHOCOLATES,
  MATCH_FRUITS,
  MATCH_TOPPINGS,
  buildMatchMessage,
  chocolateById,
  fruitById,
  matchPrice,
  randomMatch,
  type MatchChocolateId,
  type MatchFruitId,
  type MatchState,
  type MatchToppingId,
} from "@/lib/match";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { FloatingFruitLayer } from "./ui/FloatingFruit";
import { Reveal } from "./ui/Reveal";
import { SectionHeading } from "./ui/SectionHeading";

const STEPS = [
  {
    label: "Fruta",
    title: "Elige tu fruta",
    description: "La base de todo. Fresca, jugosa y recién cortada.",
  },
  {
    label: "Chocolate",
    title: "Elige tu chocolate",
    description: "El baño que lo cambia todo. Denso, real, sin vergüenza.",
  },
  {
    label: "Toppings",
    title: "Agrega tus toppings",
    description: "El crunch final. Puedes elegir los que quieras.",
  },
] as const;

export function MatchBuilder() {
  const store = useStore();
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [match, setMatch] = useState<MatchState>(DEFAULT_MATCH);

  const total = matchPrice(match);
  const whatsappUrl = buildWhatsAppUrl(
    store.contact_phone,
    buildMatchMessage(match),
  );
  const chocolate = chocolateById(match.chocolate);
  const fruit = fruitById(match.fruit);

  function toggleTopping(id: MatchToppingId) {
    setMatch((current) => ({
      ...current,
      toppings: current.toppings.includes(id)
        ? current.toppings.filter((item) => item !== id)
        : [...current.toppings, id],
    }));
  }

  function surpriseMe() {
    setMatch(randomMatch());
    setStep(2);
  }

  return (
    <section
      id="match"
      className="relative overflow-hidden bg-cream px-5 py-20 lg:px-8 lg:py-28"
    >
      <div
        className="pointer-events-none absolute -left-32 top-24 h-96 w-96 rounded-full bg-amarillo/25 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-coral/20 blur-3xl"
        aria-hidden
      />
      <FloatingFruitLayer variant="soft" className="hidden lg:block" />

      <div className="relative mx-auto max-w-7xl">
        <Reveal>
          <SectionHeading
            eyebrow="Crea tu match perfecto"
            title={
              <>
                Tú eliges. Nosotros lo{" "}
                <span className="text-rojo">bañamos en chocolate.</span>
              </>
            }
            description="Un mini configurador para el antojo más personalizado de la feria. Fruta + chocolate + toppings = tu felicidad."
            tone="dark"
            align="center"
          />
        </Reveal>

        <div className="mt-12 grid items-start gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:gap-8">
          <Reveal>
            <div className="rounded-[2rem] border border-chocolate/10 bg-white/60 p-5 shadow-[0_30px_70px_-40px_rgba(76,30,13,0.45)] backdrop-blur-sm sm:p-7">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-rojo">
                    Paso {step + 1} de 3
                  </p>
                  <h3 className="mt-1 font-display text-3xl uppercase tracking-wide text-chocolate sm:text-4xl">
                    {STEPS[step].title}
                  </h3>
                </div>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-rojo/10 font-display text-2xl text-rojo">
                  {step + 1}
                </span>
              </div>

              <div className="mt-4 flex gap-1.5">
                {STEPS.map((item, index) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setStep(index)}
                    className="group flex-1 text-left"
                    aria-label={`Ir al paso ${index + 1}: ${item.label}`}
                  >
                    <span className="block h-1.5 overflow-hidden rounded-full bg-chocolate/10">
                      <motion.span
                        className="block h-full rounded-full bg-amarillo"
                        animate={{
                          width: index <= step ? "100%" : "0%",
                        }}
                        transition={{ duration: reduce ? 0 : 0.35 }}
                      />
                    </span>
                    <span
                      className={`mt-2 hidden font-sans text-[9px] font-bold uppercase tracking-[0.14em] sm:block ${
                        index <= step ? "text-rojo" : "text-chocolate/35"
                      }`}
                    >
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>

              <p className="mt-4 font-sans text-xs leading-relaxed text-chocolate/55">
                {STEPS[step].description}
              </p>

              <div className="mt-5 min-h-[15rem]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={reduce ? undefined : { opacity: 0, x: -18 }}
                    transition={{
                      duration: reduce ? 0 : 0.3,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    {step === 0 ? (
                      <div
                        className="grid grid-cols-2 gap-2.5 sm:grid-cols-3"
                        role="group"
                        aria-label="Elige tu fruta"
                      >
                        {MATCH_FRUITS.map((item) => {
                          const selected = match.fruit === item.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              aria-pressed={selected}
                              onClick={() =>
                                setMatch((current) => ({
                                  ...current,
                                  fruit: item.id as MatchFruitId,
                                }))
                              }
                              className={`group relative rounded-2xl border p-3 text-left transition-all duration-200 ${
                                selected
                                  ? "border-rojo bg-white shadow-[0_16px_35px_-22px_rgba(115,13,13,0.55)]"
                                  : "border-chocolate/10 bg-white/50 hover:-translate-y-0.5 hover:border-rojo/30 hover:bg-white"
                              }`}
                            >
                              <span
                                className="flex h-9 w-9 items-center justify-center rounded-xl text-lg"
                                style={{ backgroundColor: item.soft }}
                                aria-hidden
                              >
                                {item.emoji}
                              </span>
                              <span className="mt-2 block font-sans text-xs font-bold text-chocolate">
                                {item.label}
                              </span>
                              <span className="mt-0.5 block font-sans text-[9px] leading-tight text-chocolate/50">
                                {item.note}
                              </span>
                              {selected ? (
                                <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-rojo text-[10px] text-cream">
                                  ✓
                                </span>
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    ) : null}

                    {step === 1 ? (
                      <div
                        className="grid gap-2.5 sm:grid-cols-3"
                        role="group"
                        aria-label="Elige tu chocolate"
                      >
                        {MATCH_CHOCOLATES.map((item) => {
                          const selected = match.chocolate === item.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              aria-pressed={selected}
                              onClick={() =>
                                setMatch((current) => ({
                                  ...current,
                                  chocolate: item.id as MatchChocolateId,
                                }))
                              }
                              className={`group relative rounded-2xl border p-3 text-left transition-all duration-200 ${
                                selected
                                  ? "border-rojo bg-white shadow-[0_16px_35px_-22px_rgba(115,13,13,0.55)]"
                                  : "border-chocolate/10 bg-white/50 hover:-translate-y-0.5 hover:border-rojo/30 hover:bg-white"
                              }`}
                            >
                              <span
                                className="block h-10 w-10 rounded-full border border-chocolate/10 shadow-inner"
                                style={{ backgroundColor: item.color }}
                                aria-hidden
                              />
                              <span className="mt-2 block font-sans text-xs font-bold text-chocolate">
                                {item.label}
                              </span>
                              <span className="mt-0.5 block font-sans text-[9px] leading-tight text-chocolate/50">
                                {item.note}
                              </span>
                              <span className="mt-2 block font-sans text-[9px] font-semibold uppercase tracking-[0.12em] text-rojo/70">
                                {item.extra > 0
                                  ? `+ ${formatCop(item.extra)}`
                                  : "Incluido"}
                              </span>
                              {selected ? (
                                <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-rojo text-[10px] text-cream">
                                  ✓
                                </span>
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    ) : null}

                    {step === 2 ? (
                      <div
                        className="grid gap-2.5 sm:grid-cols-3"
                        role="group"
                        aria-label="Agrega tus toppings"
                      >
                        {MATCH_TOPPINGS.map((item) => {
                          const selected = match.toppings.includes(item.id);
                          return (
                            <button
                              key={item.id}
                              type="button"
                              aria-pressed={selected}
                              onClick={() => toggleTopping(item.id as MatchToppingId)}
                              className={`group relative rounded-2xl border p-3 text-left transition-all duration-200 ${
                                selected
                                  ? "border-rojo bg-white shadow-[0_16px_35px_-22px_rgba(115,13,13,0.55)]"
                                  : "border-chocolate/10 bg-white/50 hover:-translate-y-0.5 hover:border-rojo/30 hover:bg-white"
                              }`}
                            >
                              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cream-deep text-lg">
                                {item.emoji}
                              </span>
                              <span className="mt-2 block font-sans text-xs font-bold text-chocolate">
                                {item.label}
                              </span>
                              <span className="mt-0.5 block font-sans text-[9px] leading-tight text-chocolate/50">
                                {item.note}
                              </span>
                              <span className="mt-2 block font-sans text-[9px] font-semibold uppercase tracking-[0.12em] text-rojo/70">
                                + {formatCop(item.extra)}
                              </span>
                              {selected ? (
                                <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-rojo text-[10px] text-cream">
                                  ✓
                                </span>
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    ) : null}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-chocolate/10 pt-5">
                <button
                  type="button"
                  onClick={() => setStep((current) => Math.max(0, current - 1))}
                  disabled={step === 0}
                  className="rounded-full border border-chocolate/15 px-4 py-2.5 font-sans text-[10px] font-bold uppercase tracking-[0.14em] text-chocolate/60 transition-colors hover:border-rojo/30 hover:text-rojo disabled:cursor-not-allowed disabled:opacity-35"
                >
                  ← Atrás
                </button>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={surpriseMe}
                    className="rounded-full border border-rojo/20 px-4 py-2.5 font-sans text-[10px] font-bold uppercase tracking-[0.14em] text-rojo transition-colors hover:bg-rojo/5"
                  >
                    Sorpréndeme ✨
                  </button>
                  {step < 2 ? (
                    <button
                      type="button"
                      onClick={() =>
                        setStep((current) => Math.min(2, current + 1))
                      }
                      className="btn-dark !px-5 !py-2.5 !text-[10px]"
                    >
                      Siguiente →
                    </button>
                  ) : (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-whatsapp !px-5 !py-2.5 !text-[10px]"
                    >
                      Enviar a WhatsApp
                    </a>
                  )}
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="lg:sticky lg:top-24">
              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-rojo via-rojo to-chocolate p-5 shadow-warm sm:p-7">
                <div
                  className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-amarillo/15 blur-3xl"
                  aria-hidden
                />

                <div className="relative flex items-center justify-between gap-3">
                  <div>
                    <p className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-amarillo">
                      Tu match
                    </p>
                    <p className="mt-1 font-display text-2xl uppercase tracking-wide text-cream">
                      {fruit.label} + {chocolate.label}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={surpriseMe}
                    className="rounded-full border border-white/20 px-3 py-2 font-sans text-[9px] font-bold uppercase tracking-[0.12em] text-cream/70 transition-colors hover:border-amarillo hover:text-amarillo"
                  >
                    Otra idea ✨
                  </button>
                </div>

                <div className="relative mt-3">
                  <MatchBowlPreview match={match} />
                </div>

                <div className="relative mt-2 space-y-2 border-t border-white/10 pt-4 font-sans text-xs">
                  <PriceRow label="Bowl base" value={formatCop(MATCH_BASE_PRICE)} />
                  {chocolate.extra > 0 ? (
                    <PriceRow
                      label={chocolate.label}
                      value={`+ ${formatCop(chocolate.extra)}`}
                    />
                  ) : null}
                  {match.toppings.map((id) => {
                    const topping = MATCH_TOPPINGS.find((item) => item.id === id);
                    return topping ? (
                      <PriceRow
                        key={topping.id}
                        label={topping.label}
                        value={`+ ${formatCop(topping.extra)}`}
                      />
                    ) : null;
                  })}
                  <div className="flex items-center justify-between border-t border-white/10 pt-3">
                    <span className="font-sans text-[10px] font-bold uppercase tracking-[0.16em] text-cream/60">
                      Total
                    </span>
                    <span className="font-display text-3xl leading-none text-amarillo">
                      {formatCop(total)}
                    </span>
                  </div>
                </div>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-whatsapp mt-4 w-full !px-5 !text-[10px] sm:!px-[1.85rem] sm:!text-[0.78rem]"
                  data-cursor
                  data-cursor-label="¡Enviar!"
                >
                  <WhatsAppIcon />
                  Enviar este match a WhatsApp
                </a>
                <p className="relative mt-2 text-center font-sans text-[9px] text-cream/45">
                  Te confirmamos disponibilidad y recogida por chat.
                </p>
              </div>

              <p className="mt-3 text-center font-sans text-[10px] text-chocolate/45">
                Vista previa ilustrativa. El antojo real es todavía más rico.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function PriceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-cream/65">
      <span>{label}</span>
      <span className="font-semibold text-cream">{value}</span>
    </div>
  );
}

function MatchBowlPreview({ match }: { match: MatchState }) {
  const uid = useId().replace(/:/g, "");
  const bowlId = `${uid}-match-bowl`;
  const fruit = fruitById(match.fruit);
  const chocolate = chocolateById(match.chocolate);
  const palette =
    match.fruit === "mixto"
      ? ["#e33d4f", "#f2c94c", "#f5d76e", "#8e5bb5"]
      : [fruit.color];

  const pieces = [
    { cx: 104, cy: 108, r: 15 },
    { cx: 137, cy: 96, r: 17 },
    { cx: 172, cy: 100, r: 16 },
    { cx: 205, cy: 110, r: 15 },
    { cx: 121, cy: 128, r: 14 },
    { cx: 158, cy: 122, r: 18 },
    { cx: 193, cy: 132, r: 14 },
    { cx: 176, cy: 88, r: 12 },
    { cx: 116, cy: 86, r: 12 },
  ];

  return (
    <svg
      viewBox="0 0 320 270"
      className="mx-auto h-auto w-full max-w-[21rem] drop-shadow-[0_25px_30px_rgba(0,0,0,0.35)]"
      role="img"
      aria-label={`Vista previa de bowl con ${fruit.label} y chocolate ${chocolate.label}`}
    >
      <defs>
        <linearGradient id={bowlId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f7e6cf" />
          <stop offset="55%" stopColor="#e8c9a4" />
          <stop offset="100%" stopColor="#c99a6b" />
        </linearGradient>
      </defs>

      <ellipse cx="160" cy="242" rx="104" ry="16" fill="#2b0f08" opacity="0.35" />

      <path
        d="M65 118c0 78 30 120 95 120s95-42 95-120Z"
        fill={`url(#${bowlId})`}
      />
      <ellipse cx="160" cy="118" rx="97" ry="34" fill="#f3d9b8" />
      <ellipse cx="160" cy="114" rx="88" ry="27" fill={fruit.soft} />

      {pieces.map((piece, index) => (
        <g key={`${piece.cx}-${piece.cy}`}>
          <circle
            cx={piece.cx}
            cy={piece.cy}
            r={piece.r}
            fill={palette[index % palette.length]}
          />
          <circle
            cx={piece.cx - piece.r * 0.25}
            cy={piece.cy - piece.r * 0.3}
            r={piece.r * 0.28}
            fill="#fff"
            opacity="0.26"
          />
        </g>
      ))}

      <path
        d="M80 112c14 10 26-3 40 5 13 8 26-5 39 3 14 8 28-4 42 3 15 8 27-5 39 2"
        fill="none"
        stroke={chocolate.color}
        strokeWidth="9"
        strokeLinecap="round"
        opacity="0.95"
      />
      <path
        d="M93 104c10 7 19-2 29 4 11 7 22-4 33 2 12 7 23-3 35 3 12 7 23-2 34 3"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.22"
      />

      {match.toppings.includes("almendras") ? (
        <g fill="#d8a46c">
          <ellipse cx="105" cy="92" rx="6" ry="3.5" transform="rotate(-24 105 92)" />
          <ellipse cx="158" cy="82" rx="6" ry="3.5" transform="rotate(12 158 82)" />
          <ellipse cx="208" cy="96" rx="6" ry="3.5" transform="rotate(-12 208 96)" />
          <ellipse cx="188" cy="112" rx="5" ry="3" transform="rotate(22 188 112)" />
        </g>
      ) : null}

      {match.toppings.includes("coco") ? (
        <g fill="#fffaf0" opacity="0.9">
          <rect x="118" y="104" width="11" height="4" rx="2" transform="rotate(-16 118 104)" />
          <rect x="145" y="112" width="12" height="4" rx="2" transform="rotate(18 145 112)" />
          <rect x="178" y="96" width="10" height="4" rx="2" transform="rotate(-8 178 96)" />
          <rect x="198" y="120" width="11" height="4" rx="2" transform="rotate(14 198 120)" />
        </g>
      ) : null}

      {match.toppings.includes("chispas") ? (
        <g fill={chocolate.color}>
          <circle cx="128" cy="90" r="3.4" />
          <circle cx="168" cy="108" r="3.1" />
          <circle cx="196" cy="86" r="3.6" />
          <circle cx="144" cy="126" r="3" />
          <circle cx="212" cy="112" r="2.8" />
        </g>
      ) : null}

      <path
        d="M96 86c4-10 10-14 18-16-2 9-7 15-18 16Z"
        fill="#4c9a4f"
        opacity="0.9"
      />
      <path
        d="M104 92c-2-8 0-14 5-19 3 8 2 14-5 19Z"
        fill="#8cd47a"
      />

      <path
        d="M65 118c0 78 30 120 95 120s95-42 95-120"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.2"
        opacity="0.22"
      />
      <rect x="92" y="168" width="136" height="3" rx="1.5" fill="#ffffff" opacity="0.12" />
      <text
        x="160"
        y="202"
        textAnchor="middle"
        fontFamily="Bebas Neue, Impact, sans-serif"
        fontSize="22"
        letterSpacing="1"
        fill="#730d0d"
      >
        FRUTI DELICIAS
      </text>
      <text
        x="160"
        y="216"
        textAnchor="middle"
        fontFamily="Poppins, sans-serif"
        fontSize="7"
        letterSpacing="2"
        fill="#730d0d"
        opacity="0.6"
      >
        TU MATCH, TU ANTOJO
      </text>
      <ellipse cx="160" cy="118" rx="97" ry="34" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.2" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12.04 2C6.6 2 2.18 6.42 2.18 11.86c0 1.74.45 3.44 1.32 4.94L2 22l5.35-1.4a9.9 9.9 0 0 0 4.69 1.2h.01c5.43 0 9.85-4.42 9.85-9.86A9.8 9.8 0 0 0 12.04 2Zm0 17.94h-.01a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.17.83.85-3.1-.2-.31a8.18 8.18 0 0 1-1.26-4.38c0-4.52 3.68-8.2 8.21-8.2 2.19 0 4.25.86 5.8 2.41a8.15 8.15 0 0 1 2.4 5.8c0 4.52-3.68 8.2-8.2 8.2Zm4.5-6.14c-.25-.12-1.46-.72-1.69-.8-.23-.09-.4-.13-.56.12-.17.25-.65.8-.8.96-.14.17-.29.19-.54.07-.25-.13-1.04-.38-1.98-1.22-.73-.65-1.23-1.46-1.37-1.71-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.86.84-.86 2.05 0 1.21.88 2.38 1 2.54.12.17 1.73 2.64 4.2 3.7.59.25 1.05.4 1.4.51.59.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.18.2-.58.2-1.07.14-1.18-.06-.1-.23-.16-.48-.28Z" />
    </svg>
  );
}
