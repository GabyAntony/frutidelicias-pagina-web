"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { useStore } from "@/components/store/StoreContext";
import { WHATSAPP_DEFAULT_MESSAGE } from "@/lib/data";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export function WhatsAppFloat() {
  const store = useStore();
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 320);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const href = buildWhatsAppUrl(store.contact_phone, WHATSAPP_DEFAULT_MESSAGE);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduce ? undefined : { opacity: 0, y: 16, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="fixed bottom-5 right-4 z-[60] sm:bottom-7 sm:right-7"
        >
          <motion.a
            href={href}
            target="_blank"
            rel="noreferrer"
            whileHover={reduce ? undefined : { scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            className="group flex items-center gap-3 rounded-full border border-white/20 bg-whatsapp px-4 py-3 text-white shadow-[0_22px_50px_-16px_rgba(0,0,0,0.6)] transition-shadow hover:shadow-[0_26px_60px_-14px_rgba(31,170,89,0.75)] sm:pr-5"
            aria-label="Escribir a Fruti Delicias por WhatsApp"
          >
            <span className="relative flex h-8 w-8 shrink-0 items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-white/15 animate-pulse-green" />
              <WhatsAppIcon />
            </span>
            <span className="hidden flex-col text-left sm:flex">
              <span className="font-sans text-[9px] font-semibold uppercase tracking-[0.18em] text-white/75">
                ¿Se te antojó algo dulce?
              </span>
              <span className="font-sans text-xs font-bold tracking-wide">
                Pídelo por WhatsApp 🍓
              </span>
            </span>
            <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full bg-amarillo ring-2 ring-chocolate sm:hidden" />
          </motion.a>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className="relative z-10"
    >
      <path d="M12.04 2C6.6 2 2.18 6.42 2.18 11.86c0 1.74.45 3.44 1.32 4.94L2 22l5.35-1.4a9.9 9.9 0 0 0 4.69 1.2h.01c5.43 0 9.85-4.42 9.85-9.86A9.8 9.8 0 0 0 12.04 2Zm0 17.94h-.01a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.17.83.85-3.1-.2-.31a8.18 8.18 0 0 1-1.26-4.38c0-4.52 3.68-8.2 8.21-8.2 2.19 0 4.25.86 5.8 2.41a8.15 8.15 0 0 1 2.4 5.8c0 4.52-3.68 8.2-8.2 8.2Zm4.5-6.14c-.25-.12-1.46-.72-1.69-.8-.23-.09-.4-.13-.56.12-.17.25-.65.8-.8.96-.14.17-.29.19-.54.07-.25-.13-1.04-.38-1.98-1.22-.73-.65-1.23-1.46-1.37-1.71-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.86.84-.86 2.05 0 1.21.88 2.38 1 2.54.12.17 1.73 2.64 4.2 3.7.59.25 1.05.4 1.4.51.59.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.18.2-.58.2-1.07.14-1.18-.06-.1-.23-.16-.48-.28Z" />
    </svg>
  );
}
