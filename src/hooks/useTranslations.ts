"use client";

import { useGame } from "@/context/GameContext";
import { TRANSLATIONS, type Translations } from "@/lib/i18n";

export function useTranslations(): Translations {
  const { locale } = useGame();
  return TRANSLATIONS[locale];
}
