export const NAV_LINKS = [
  { href: "#inicio", label: "Inicio" },
  { href: "#menu", label: "Menú" },
  { href: "#match", label: "Crea tu Match" },
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

export const PILLARS = [
  {
    number: "01",
    title: "Fruta Natural",
    description: "Siempre fresca, seleccionada de la mejor cosecha.",
    detail: "Cortada del día, nunca de ayer.",
    icon: "fruit",
  },
  {
    number: "02",
    title: "Chocolate Artesanal",
    description: "Chocolate real de verdad, denso y crujiente.",
    detail: "Baño generoso, crujido inevitable.",
    icon: "chocolate",
  },
  {
    number: "03",
    title: "El Antojo Perfecto",
    description: "La dosis de felicidad que tu día necesita en un solo bowl.",
    detail: "Ese break que sí vale la pena.",
    icon: "spark",
  },
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
    role: "Estudiante · fiel al bowl",
    quote:
      "Fruta fresca + chocolate real = match perfecto. Mi pausa dulce favorita de la semana.",
  },
  {
    id: 2,
    name: "Diego M.",
    role: "Foodie de la feria",
    quote:
      "Lo mejor de la feria —y de mi día— en un solo bowl. Crocante, fresco e irresistible.",
  },
  {
    id: 3,
    name: "Valeria S.",
    role: "Millennial con antojo",
    quote:
      "Un antojo de fruta, una dosis de felicidad. Siempre pido el bowl premium.",
  },
] as const;

export const MARQUEE_ITEMS = [
  "100% fruta natural",
  "chocolate real",
  "hecho al momento",
  "antojo asegurado",
  "dulce por todas partes",
] as const;

export const WHATSAPP_DEFAULT_MESSAGE =
  "¡Hola Fruti Delicias! 🍓🍫 Vi su página y se me antojó un match perfecto. ¿Me ayudan a pedir?";
