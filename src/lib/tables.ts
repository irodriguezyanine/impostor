import type { Player } from "@/lib/players";

export type SavedTable = {
  id: string;
  name: string;
  players: Player[];
  categoryIds: string[];
  impostorCount: number;
  updatedAt: number;
};

export type TableTemplate = {
  id: string;
  name: string;
  description: string;
  playerSlots: number;
  categoryTags: string[];
  impostorCount: number;
};

export const TABLE_TEMPLATES: TableTemplate[] = [
  {
    id: "fiesta-6",
    name: "Fiesta 6",
    description: "Ideal para juntadas: 1 impostor, categorías mixtas",
    playerSlots: 6,
    categoryTags: ["chile", "universal", "deporte"],
    impostorCount: 1,
  },
  {
    id: "pareja-amigos",
    name: "Pareja + amigos",
    description: "4–5 jugadores, ritmo suave",
    playerSlots: 4,
    categoryTags: ["universal"],
    impostorCount: 1,
  },
  {
    id: "oficina",
    name: "Oficina / icebreaker",
    description: "Sin packs adultos, categorías suaves",
    playerSlots: 8,
    categoryTags: ["oficina", "universal"],
    impostorCount: 2,
  },
  {
    id: "futboleros",
    name: "Mesa futbolera",
    description: "Clubes, mundiales y cracks",
    playerSlots: 6,
    categoryTags: ["deporte", "futbol"],
    impostorCount: 1,
  },
];

const TABLES_KEY = "impostor:saved-tables";
const NAMES_KEY = "impostor:frequent-names";

export function loadSavedTables(): SavedTable[] {
  try {
    if (typeof window === "undefined") return [];
    const raw = window.localStorage.getItem(TABLES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveTable(table: SavedTable): SavedTable[] {
  const tables = loadSavedTables().filter((t) => t.id !== table.id);
  const next = [table, ...tables].slice(0, 20);
  try {
    window.localStorage.setItem(TABLES_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
}

export function deleteSavedTable(id: string): SavedTable[] {
  const next = loadSavedTables().filter((t) => t.id !== id);
  try {
    window.localStorage.setItem(TABLES_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
}

export function parsePlayersFromText(text: string): string[] {
  return text
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 20);
}

export function loadFrequentNames(): string[] {
  try {
    if (typeof window === "undefined") return [];
    const raw = window.localStorage.getItem(NAMES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((n) => typeof n === "string") : [];
  } catch {
    return [];
  }
}

export function rememberNames(names: readonly string[]): void {
  const prev = loadFrequentNames();
  const merged = Array.from(
    new Set([...names.map((n) => n.trim()).filter(Boolean), ...prev])
  ).slice(0, 40);
  try {
    window.localStorage.setItem(NAMES_KEY, JSON.stringify(merged));
  } catch {
    /* ignore */
  }
}
