import { existsSync } from "node:fs";
import { join } from "node:path";
import { CATEGORIES, getHintsForWord } from "../src/data/categories";
import { LOCALES, TRANSLATIONS } from "../src/lib/i18n";

const problems: string[] = [];
const warn = (msg: string) => problems.push(msg);

const seenIds = new Set<string>();
for (const cat of CATEGORIES) {
  if (seenIds.has(cat.id)) warn(`DUPLICATE CATEGORY ID: ${cat.id}`);
  seenIds.add(cat.id);

  if (cat.words.length < 10) warn(`FEW WORDS (${cat.words.length}): ${cat.id}`);

  const seenWords = new Set<string>();
  for (const w of cat.words) {
    const key = w.trim().toLowerCase();
    if (seenWords.has(key)) warn(`DUPLICATE WORD in ${cat.id}: "${w}"`);
    seenWords.add(key);
    if (w !== w.trim()) warn(`WHITESPACE in ${cat.id}: "${w}"`);
  }

  const missingHints = cat.words.filter((w) => {
    const raw = cat.wordHints?.[w];
    return !raw || (Array.isArray(raw) && raw.filter(Boolean).length < 3);
  });
  if (missingHints.length > 0) {
    warn(
      `HINTS INCOMPLETE ${cat.id}: ${missingHints.length}/${cat.words.length} words fall back to category name`
    );
  }

  const orphanHints = Object.keys(cat.wordHints ?? {}).filter(
    (k) => !cat.words.includes(k)
  );
  if (orphanHints.length > 0) {
    warn(`ORPHAN HINTS ${cat.id}: ${orphanHints.length} (e.g. "${orphanHints[0]}")`);
  }

  for (const w of cat.words) {
    const hints = getHintsForWord(cat, w);
    if (hints.length !== 3) warn(`HINTS NOT 3 for ${cat.id} / ${w}`);
    if (hints.some((h) => !h)) warn(`EMPTY HINT for ${cat.id} / ${w}`);
    const dupHint = hints.find((h) => h.trim().toLowerCase() === w.trim().toLowerCase());
    if (dupHint) warn(`HINT REVEALS WORD in ${cat.id}: "${w}"`);
  }

  if (cat.iconImage) {
    const p = join(process.cwd(), "public", cat.iconImage.replace(/^\//, ""));
    if (!existsSync(p)) warn(`MISSING ICON FILE ${cat.id}: ${cat.iconImage}`);
  }
}

for (const locale of LOCALES) {
  const t = TRANSLATIONS[locale];
  if (!t) {
    warn(`MISSING TRANSLATIONS for locale ${locale}`);
    continue;
  }
  const missing = CATEGORIES.filter((c) => !t.categories?.[c.id]).map((c) => c.id);
  if (missing.length > 0) {
    warn(`MISSING CATEGORY NAMES [${locale}]: ${missing.length} -> ${missing.join(", ")}`);
  }
}

const baseKeys = Object.keys(TRANSLATIONS.es).sort();
for (const locale of LOCALES) {
  const keys = Object.keys(TRANSLATIONS[locale]).sort();
  const missing = baseKeys.filter((k) => !keys.includes(k));
  if (missing.length > 0) warn(`MISSING KEYS [${locale}]: ${missing.join(", ")}`);
}

console.log(`Categories: ${CATEGORIES.length}`);
console.log(`Total words: ${CATEGORIES.reduce((n, c) => n + c.words.length, 0)}`);
console.log(`Problems: ${problems.length}`);
for (const p of problems) console.log(`  - ${p}`);
