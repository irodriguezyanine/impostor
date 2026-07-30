import type { Category } from "@/data/categories";

export type CustomCategory = Category & {
  custom: true;
  tags?: string[];
  adult?: boolean;
  kidsSafe?: boolean;
};

const CUSTOM_KEY = "impostor:custom-categories";

export function loadCustomCategories(): CustomCategory[] {
  try {
    if (typeof window === "undefined") return [];
    const raw = window.localStorage.getItem(CUSTOM_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isCustomCategory);
  } catch {
    return [];
  }
}

function isCustomCategory(value: unknown): value is CustomCategory {
  if (!value || typeof value !== "object") return false;
  const c = value as Record<string, unknown>;
  return (
    typeof c.id === "string" &&
    typeof c.name === "string" &&
    Array.isArray(c.words) &&
    c.custom === true
  );
}

export function saveCustomCategory(category: CustomCategory): CustomCategory[] {
  const all = loadCustomCategories().filter((c) => c.id !== category.id);
  const next = [category, ...all].slice(0, 50);
  try {
    window.localStorage.setItem(CUSTOM_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
}

export function deleteCustomCategory(id: string): CustomCategory[] {
  const next = loadCustomCategories().filter((c) => c.id !== id);
  try {
    window.localStorage.setItem(CUSTOM_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
}

export function exportCategoriesJson(categories: readonly Category[]): string {
  return JSON.stringify(categories, null, 2);
}

export function importCategoriesFromJson(raw: string): CustomCategory[] {
  const parsed = JSON.parse(raw) as unknown;
  const list = Array.isArray(parsed) ? parsed : [parsed];
  const now = Date.now();
  return list.map((item, index) => {
    const rec = item as Record<string, unknown>;
    const words = Array.isArray(rec.words)
      ? rec.words.filter((w): w is string => typeof w === "string")
      : [];
    const name = typeof rec.name === "string" ? rec.name : `Pack ${index + 1}`;
    return {
      id: `custom-${now}-${index}`,
      name,
      icon: typeof rec.icon === "string" ? rec.icon : "📦",
      words,
      wordHints: (rec.wordHints as Category["wordHints"]) ?? {},
      custom: true as const,
      tags: Array.isArray(rec.tags)
        ? rec.tags.filter((t): t is string => typeof t === "string")
        : ["custom"],
    };
  });
}

export function createEmptyCustomCategory(name: string): CustomCategory {
  return {
    id: `custom-${Date.now()}`,
    name: name.trim() || "Mi categoría",
    icon: "✨",
    words: [],
    wordHints: {},
    custom: true,
    tags: ["custom"],
    kidsSafe: true,
  };
}
