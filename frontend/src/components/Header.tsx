"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { useCart } from "@/components/cart/CartContext";
import { useStore } from "@/components/store/StoreContext";
import { NAV_LINKS, WHATSAPP_DEFAULT_MESSAGE } from "@/lib/data";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pendingHashRef = useRef<string | null>(null);
  const { count, setOpen: setCartOpen } = useCart();
  const store = useStore();

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 14);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const whatsappUrl = buildWhatsAppUrl(
    store.contact_phone,
    WHATSAPP_DEFAULT_MESSAGE,
  );

  function onMobileNavClick(
    event: MouseEvent<HTMLAnchorElement>,
    href: string,
  ) {
    // El menú móvil mide distinto antes y después de plegarse. Si dejamos que
    // el navegador haga el salto mientras se anima, el destino queda movido.
    event.preventDefault();
    pendingHashRef.current = href;
    setOpen(false);
  }

  function onMobileMenuExitComplete() {
    const href = pendingHashRef.current;
    if (!href) return;
    pendingHashRef.current = null;
    document.querySelector(href)?.scrollIntoView({ block: "start" });
    window.history.replaceState(null, "", href);
  }

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? "border-white/10 bg-chocolate/95 shadow-[0_14px_40px_-24px_rgba(0,0,0,0.6)] backdrop-blur-xl"
          : "border-transparent bg-chocolate/45 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 lg:px-8">
        <a
          href="#inicio"
          className="group flex items-center gap-2.5"
          aria-label={`${store.business_name} — inicio`}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amarillo text-chocolate shadow-[0_10px_24px_-10px_rgba(242,208,107,0.8)] transition-transform duration-300 group-hover:rotate-6 group-hover:scale-105">
            <BrandMark />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-xl uppercase tracking-[0.06em] text-cream sm:text-2xl">
              {store.business_name}
            </span>
            <span className="mt-0.5 font-sans text-[7px] font-semibold uppercase tracking-[0.26em] text-amarillo/75 sm:text-[8px]">
              fruta + chocolate
            </span>
          </span>
        </a>

        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Principal"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="group relative rounded-full px-3 py-2 font-sans text-[11px] font-semibold uppercase tracking-[0.1em] text-cream/70 transition-colors hover:text-amarillo"
            >
              {link.label}
              <span className="absolute inset-x-3 -bottom-0.5 h-px scale-x-0 bg-amarillo transition-transform duration-300 group-hover:scale-x-100" />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="hidden h-10 w-10 items-center justify-center rounded-full border border-white/15 text-cream/75 transition-colors hover:border-whatsapp hover:bg-whatsapp hover:text-white sm:flex"
            aria-label="Escribir por WhatsApp"
          >
            <WhatsAppIcon />
          </a>

          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-cream/80 transition-colors hover:border-amarillo hover:text-amarillo"
            aria-label={`Abrir carrito (${count} productos)`}
            onClick={() => setCartOpen(true)}
          >
            <CartIcon />
            <AnimatePresence>
              {count > 0 ? (
                <motion.span
                  key={count}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amarillo px-1 font-sans text-[10px] font-bold text-chocolate ring-2 ring-chocolate"
                >
                  {count}
                </motion.span>
              ) : null}
            </AnimatePresence>
          </button>

          <div className="hidden md:block">
            <a href="#menu" className="btn-primary !px-5 !py-2.5 !text-[10px]">
              Pedir ahora
            </a>
          </div>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-cream lg:hidden"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((current) => !current)}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      <AnimatePresence onExitComplete={onMobileMenuExitComplete}>
        {open ? (
          <motion.nav
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-white/10 bg-chocolate/95 backdrop-blur-xl lg:hidden"
            aria-label="Móvil"
          >
            <ul className="mx-auto max-w-7xl space-y-1 px-5 py-4">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="flex items-center justify-between rounded-xl px-3 py-3 font-sans text-sm font-medium text-cream/85 transition-colors hover:bg-white/5 hover:text-amarillo"
                    onClick={(event) => onMobileNavClick(event, link.href)}
                  >
                    {link.label}
                    <span aria-hidden className="text-amarillo/60">
                      ↗
                    </span>
                  </a>
                </li>
              ))}
              <li className="pt-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-whatsapp w-full"
                  onClick={() => setOpen(false)}
                >
                  <WhatsAppIcon />
                  Pedir por WhatsApp
                </a>
              </li>
            </ul>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

function BrandMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 32 32" fill="none" aria-hidden>
      <path
        d="M16 28c7-4.5 11-10 11-15.5C27 8 23.5 5 19.5 5c-1.5 0-2.9.5-3.5 1.4C15.4 5.5 14 5 12.5 5 8.5 5 5 8 5 12.5 5 18 9 23.5 16 28Z"
        fill="currentColor"
      />
      <path
        d="M16 6c-1-3-3.2-4.5-6-4 1.2 2.6 3.1 4 6 4Zm0 0c1-3 3.2-4.5 6-4-1.2 2.6-3.1 4-6 4Z"
        fill="#4c1e0d"
      />
      <circle cx="12.5" cy="15" r="1" fill="#fff9f5" opacity="0.8" />
      <circle cx="19.5" cy="18" r="1" fill="#fff9f5" opacity="0.8" />
      <circle cx="16" cy="22" r="1" fill="#fff9f5" opacity="0.8" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12.04 2C6.6 2 2.18 6.42 2.18 11.86c0 1.74.45 3.44 1.32 4.94L2 22l5.35-1.4a9.9 9.9 0 0 0 4.69 1.2h.01c5.43 0 9.85-4.42 9.85-9.86A9.8 9.8 0 0 0 12.04 2Zm0 17.94h-.01a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.17.83.85-3.1-.2-.31a8.18 8.18 0 0 1-1.26-4.38c0-4.52 3.68-8.2 8.21-8.2 2.19 0 4.25.86 5.8 2.41a8.15 8.15 0 0 1 2.4 5.8c0 4.52-3.68 8.2-8.2 8.2Zm4.5-6.14c-.25-.12-1.46-.72-1.69-.8-.23-.09-.4-.13-.56.12-.17.25-.65.8-.8.96-.14.17-.29.19-.54.07-.25-.13-1.04-.38-1.98-1.22-.73-.65-1.23-1.46-1.37-1.71-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.86.84-.86 2.05 0 1.21.88 2.38 1 2.54.12.17 1.73 2.64 4.2 3.7.59.25 1.05.4 1.4.51.59.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.18.2-.58.2-1.07.14-1.18-.06-.1-.23-.16-.48-.28Z" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 5h2l1.5 11h11L20 8H7"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9.5" cy="19.5" r="1.25" fill="currentColor" />
      <circle cx="16.5" cy="19.5" r="1.25" fill="currentColor" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}
