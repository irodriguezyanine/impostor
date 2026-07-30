import type { Category } from "@/data/categories";
import type { Player } from "@/lib/players";

export function makePlayers(...names: string[]): Player[] {
  return names.map((name, i) => ({ id: `p${i + 1}`, name }));
}

export const TEST_CATEGORY: Category = {
  id: "test-cat",
  name: "Categoría de prueba",
  icon: "🧪",
  words: ["Alfa", "Beta", "Gamma"],
  wordHints: {
    Alfa: ["pista-a1", "pista-a2", "pista-a3"],
    Beta: ["pista-b1", "pista-b2", "pista-b3"],
    Gamma: ["pista-g1", "pista-g2", "pista-g3"],
  },
};

export const OTHER_CATEGORY: Category = {
  id: "other-cat",
  name: "Otra categoría",
  icon: "🎯",
  words: ["Delta"],
  wordHints: { Delta: ["pista-d1", "pista-d2", "pista-d3"] },
};

/** Generador pseudoaleatorio determinista para tests reproducibles. */
export function seededRandom(seed = 1): () => number {
  let value = seed;
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
}
