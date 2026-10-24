export const NAV_LINKS = [
  { href: "#inicio", label: "Inicio" },
  { href: "#menu", label: "Menú" },
  { href: "#especiales", label: "Especiales" },
  { href: "#nosotros", label: "Nosotros" },
  { href: "#contacto", label: "Contacto" },
] as const;

export const PRODUCTS = [
  {
    id: 1,
    name: "Bowl Fresa & Chocolate",
    description: "Fresas frescas bañadas en chocolate artesanal.",
    price: 45,
    imageSlot: "bowl-fresa-chocolate",
  },
  {
    id: 2,
    name: "Brocheta Tropical",
    description: "Piña, fresa y uva con toque de chocolate.",
    price: 35,
    imageSlot: "brocheta-tropical",
  },
  {
    id: 3,
    name: "Mix Crocante",
    description: "Fruta de temporada con cobertura crocante.",
    price: 40,
    imageSlot: "mix-crocante",
  },
  {
    id: 4,
    name: "Delicia Premium",
    description: "El match perfecto: fruta fresca + chocolate real.",
    price: 55,
    imageSlot: "delicia-premium",
  },
] as const;

export const FEATURES = [
  { label: "Fruta fresca", icon: "fruit" },
  { label: "Chocolate real", icon: "chocolate" },
  { label: "Hecho al momento", icon: "craft" },
] as const;

export const STATS = [
  { value: "100%", label: "Fruta natural" },
  { value: "12+", label: "Combinaciones" },
  { value: "5k+", label: "Antojos servidos" },
] as const;

export const TESTIMONIALS = [
  {
    id: 1,
    name: "Camila R.",
    role: "Estudiante",
    quote:
      "Fruta fresca + chocolate real = match perfecto. Mi pausa dulce favorita de la semana.",
  },
  {
    id: 2,
    name: "Diego M.",
    role: "Foodie",
    quote:
      "Lo mejor de la feria —y de mi día— en un solo bowl. Crocante, fresco e irresistible.",
  },
  {
    id: 3,
    name: "Valeria S.",
    role: "Millennial",
    quote:
      "Un antojo de fruta, una dosis de felicidad. Siempre pido el bowl premium.",
  },
] as const;

export { API_BASE } from "@/lib/api";
