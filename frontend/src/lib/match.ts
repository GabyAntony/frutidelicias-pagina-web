import { formatCop } from "@/lib/api";

export const MATCH_BASE_PRICE = 45;

export const MATCH_FRUITS = [
  {
    id: "fresa",
    label: "Fresa",
    emoji: "🍓",
    color: "#e33d4f",
    soft: "#ffd9dd",
    note: "La reina del antojo",
  },
  {
    id: "pina",
    label: "Piña",
    emoji: "🍍",
    color: "#f2c94c",
    soft: "#fff0b8",
    note: "Dulce y tropical",
  },
  {
    id: "banano",
    label: "Banano",
    emoji: "🍌",
    color: "#f5d76e",
    soft: "#fff5c7",
    note: "Suave y cremoso",
  },
  {
    id: "uva",
    label: "Uva",
    emoji: "🍇",
    color: "#8e5bb5",
    soft: "#eadcff",
    note: "Explosión jugosa",
  },
  {
    id: "mixto",
    label: "Mixto",
    emoji: "🌈",
    color: "#f28a80",
    soft: "#ffe3df",
    note: "Un poco de todo",
  },
] as const;

export const MATCH_CHOCOLATES = [
  {
    id: "oscuro",
    label: "Oscuro 70%",
    emoji: "🍫",
    color: "#3d1b0e",
    note: "Intenso, real y crujiente",
    extra: 0,
  },
  {
    id: "leche",
    label: "Con leche",
    emoji: "🥛",
    color: "#7b4326",
    note: "Dulce, sedoso, adictivo",
    extra: 0,
  },
  {
    id: "blanco",
    label: "Blanco artesanal",
    emoji: "🤍",
    color: "#f3dfc2",
    note: "Suave con toque de vainilla",
    extra: 5,
  },
] as const;

export const MATCH_TOPPINGS = [
  {
    id: "almendras",
    label: "Almendras",
    emoji: "🌰",
    note: "Crunch tostado",
    extra: 5,
  },
  {
    id: "coco",
    label: "Coco rallado",
    emoji: "🥥",
    note: "Toque tropical",
    extra: 3,
  },
  {
    id: "chispas",
    label: "Chispas",
    emoji: "✨",
    note: "Más chocolate, obvio",
    extra: 4,
  },
] as const;

export type MatchFruitId = (typeof MATCH_FRUITS)[number]["id"];
export type MatchChocolateId = (typeof MATCH_CHOCOLATES)[number]["id"];
export type MatchToppingId = (typeof MATCH_TOPPINGS)[number]["id"];

export type MatchState = {
  fruit: MatchFruitId;
  chocolate: MatchChocolateId;
  toppings: MatchToppingId[];
};

export const DEFAULT_MATCH: MatchState = {
  fruit: "fresa",
  chocolate: "oscuro",
  toppings: ["almendras"],
};

export function matchPrice(state: MatchState): number {
  const chocolate = MATCH_CHOCOLATES.find((item) => item.id === state.chocolate);
  const toppings = MATCH_TOPPINGS.filter((item) =>
    state.toppings.includes(item.id),
  );
  return (
    MATCH_BASE_PRICE +
    (chocolate?.extra ?? 0) +
    toppings.reduce((sum, item) => sum + item.extra, 0)
  );
}

export function fruitById(id: MatchFruitId) {
  return MATCH_FRUITS.find((item) => item.id === id) ?? MATCH_FRUITS[0];
}

export function chocolateById(id: MatchChocolateId) {
  return (
    MATCH_CHOCOLATES.find((item) => item.id === id) ?? MATCH_CHOCOLATES[0]
  );
}

export function toppingById(id: MatchToppingId) {
  return MATCH_TOPPINGS.find((item) => item.id === id);
}

export function randomMatch(): MatchState {
  const fruits = MATCH_FRUITS.map((item) => item.id);
  const chocolates = MATCH_CHOCOLATES.map((item) => item.id);
  const toppings = MATCH_TOPPINGS.map((item) => item.id).filter(
    () => Math.random() > 0.35,
  );

  return {
    fruit: fruits[Math.floor(Math.random() * fruits.length)] ?? "fresa",
    chocolate:
      chocolates[Math.floor(Math.random() * chocolates.length)] ?? "oscuro",
    toppings: toppings.length > 0 ? toppings : ["chispas"],
  };
}

export function buildMatchMessage(state: MatchState): string {
  const fruit = fruitById(state.fruit);
  const chocolate = chocolateById(state.chocolate);
  const toppings = state.toppings
    .map((id) => toppingById(id)?.label)
    .filter(Boolean)
    .join(", ");

  return [
    "¡Hola Fruti Delicias! 🍓🍫",
    "Quiero pedir este Match Perfecto:",
    `• Fruta: ${fruit.label}`,
    `• Chocolate: ${chocolate.label}`,
    `• Toppings: ${toppings || "sin toppings"}`,
    `• Total: ${formatCop(matchPrice(state))}`,
    "¿Me confirman disponibilidad? ✨",
  ].join("\n");
}
