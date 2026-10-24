"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/CartContext";
import { useStore } from "@/components/store/StoreContext";
import { NAV_LINKS } from "@/lib/data";

export function Header() {
  const [open, setOpen] = useState(false);
  const { count, setOpen: setCartOpen } = useCart();
  const store = useStore();

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-chocolate/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
        <a
          href="#inicio"
          className="font-display text-2xl tracking-wide text-cream transition-colors hover:text-amarillo"
        >
          {store.business_name}
        </a>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Principal">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-sans text-sm text-cream/80 transition-colors hover:text-amarillo"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button
            type="button"
            className="hidden text-cream/80 transition-colors hover:text-amarillo md:inline-flex"
            aria-label="Buscar"
          >
            <SearchIcon />
          </button>
          <button
            type="button"
            className="relative text-cream/80 transition-colors hover:text-amarillo"
            aria-label="Abrir carrito"
            onClick={() => setCartOpen(true)}
          >
            <CartIcon />
            <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amarillo px-1 font-sans text-[10px] font-semibold text-chocolate">
              {count}
            </span>
          </button>
          <button
            type="button"
            className="hidden text-cream/80 transition-colors hover:text-amarillo md:inline-flex"
            aria-label="Cuenta"
          >
            <UserIcon />
          </button>
          <button
            type="button"
            className="text-cream md:hidden"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          className="border-t border-white/5 px-5 py-4 md:hidden"
          aria-label="Móvil"
        >
          <ul className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="block font-sans text-sm text-cream/90 hover:text-amarillo"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.75" />
      <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
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

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M5 19c1.5-3.5 4-5 7-5s5.5 1.5 7 5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}
