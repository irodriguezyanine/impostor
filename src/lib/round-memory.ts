import type { ImpostorHistory } from "@/lib/impostor-rotation";

const WORDS_KEY = "impostor:recent-words";
const CATS_KEY = "impostor:recent-categories";
const MAX_RECENT = 30;

function loadList(key: string): string[] {
  try {
    if (typeof window === "undefined") return [];
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === "string")
      : [];
  } catch {
    return [];
  }
}

function saveList(key: string, values: string[]): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(values.slice(0, MAX_RECENT)));
  } catch {
    /* ignore */
  }
}

export function getRecentWords(): string[] {
  return loadList(WORDS_KEY);
}

export function getRecentCategories(): string[] {
  return loadList(CATS_KEY);
}

export function rememberRound(word: string, categoryId: string): void {
  saveList(WORDS_KEY, [word, ...getRecentWords().filter((w) => w !== word)]);
  saveList(CATS_KEY, [
    categoryId,
    ...getRecentCategories().filter((c) => c !== categoryId),
  ]);
}

/** Filtra palabras ya usadas en la sesión/noche cuando hay alternativas. */
export function preferFreshWord(
  words: readonly string[],
  recent: readonly string[]
): string[] {
  const fresh = words.filter((w) => !recent.includes(w));
  return fresh.length > 0 ? fresh : [...words];
}

export function preferFreshCategory<T extends { id: string }>(
  categories: readonly T[],
  recent: readonly string[],
  avoidLast = true
): T[] {
  if (categories.length <= 1) return [...categories];
  let pool = [...categories];
  if (avoidLast && recent[0]) {
    const withoutLast = pool.filter((c) => c.id !== recent[0]);
    if (withoutLast.length > 0) pool = withoutLast;
  }
  return pool;
}

export type ImpostorHistoryView = {
  playerId: string;
  times: number;
  lastRound: number;
};

export function historyView(
  history: ImpostorHistory,
  playerIds: readonly string[]
): ImpostorHistoryView[] {
  return playerIds
    .map((playerId) => ({
      playerId,
      times: history.counts[playerId] ?? 0,
      lastRound: history.lastRound[playerId] ?? 0,
    }))
    .sort((a, b) => b.times - a.times || a.lastRound - b.lastRound);
}

/** Semilla compartible para reproducir el mismo deal (debug / “misma ronda”). */
export function makeRoundSeed(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function seededFromString(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
