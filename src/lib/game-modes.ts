import type { Category } from "@/data/categories";
import type { Difficulty, GameModeId } from "@/lib/game-settings";
import type { Player } from "@/lib/players";
import { pickRandom, shuffleArray, type RandomFn } from "@/lib/shuffle";

export type ExtendedRole = "civilian" | "impostor" | "mrWhite";

/** Palabra cercana para el impostor (modo closeWord). */
const CLOSE_FALLBACKS: Record<string, string[]> = {
  default: ["Algo parecido", "Casi lo mismo", "Del mismo mundo"],
};

/**
 * Elige la fuerza de la pista según dificultad.
 * easy = pista más específica (índice 0 tras shuffle controlado),
 * hard = sin pista o categoría genérica.
 */
export function pickHintForDifficulty(
  hints: readonly string[],
  categoryName: string,
  difficulty: Difficulty,
  random: RandomFn = Math.random
): string | null {
  if (difficulty === "hard") return null;
  if (hints.length === 0) return categoryName;
  const ordered = shuffleArray([...hints], random);
  if (difficulty === "easy") return ordered[0] ?? categoryName;
  return ordered[Math.min(1, ordered.length - 1)] ?? categoryName;
}

export function pickFalseHint(
  category: Category,
  secretWord: string,
  random: RandomFn = Math.random
): string {
  const otherWords = category.words.filter((w) => w !== secretWord);
  const decoy = pickRandom(otherWords, random);
  if (decoy) {
    const hints = category.wordHints?.[decoy];
    if (Array.isArray(hints) && hints[0]) return hints[0];
    return decoy;
  }
  return category.name;
}

export function pickCloseWord(
  category: Category,
  secretWord: string,
  random: RandomFn = Math.random
): string {
  const others = category.words.filter((w) => w !== secretWord);
  return pickRandom(others, random) ?? CLOSE_FALLBACKS.default[0];
}

/**
 * En modo Mr. White: 1 jugador no sabe ni la palabra ni es impostor clásico.
 * Cuenta como civil para el mínimo de civiles, pero pierde si no adivina.
 */
export function assignMrWhite(
  players: readonly Player[],
  impostorIds: readonly string[],
  random: RandomFn = Math.random
): string | null {
  const pool = players.filter((p) => !impostorIds.includes(p.id));
  if (pool.length === 0) return null;
  return pickRandom(pool, random)?.id ?? null;
}

export function modeNeedsMrWhite(mode: GameModeId): boolean {
  return mode === "mrWhite";
}

export function modeUsesFalseHints(mode: GameModeId): boolean {
  return mode === "falseHint";
}

export function modeUsesCloseWord(mode: GameModeId): boolean {
  return mode === "closeWord";
}

export function filterCategoriesForKids(
  categories: readonly Category[],
  kidsMode: boolean
): Category[] {
  if (!kidsMode) return [...categories];
  const blocked = new Set(["reggaeton", "famosos-chilenos"]);
  return categories.filter((c) => !blocked.has(c.id));
}
