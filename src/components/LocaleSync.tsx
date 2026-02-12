"use client";

import { useEffect } from "react";
import { useGame } from "@/context/GameContext";
import type { Locale } from "@/lib/i18n";

const LOCALE_TO_HTML: Record<Locale, string> = {
  es: "es",
  en: "en",
  pt: "pt",
  it: "it",
  fr: "fr",
};

export function LocaleSync() {
  const { locale } = useGame();

  useEffect(() => {
    const htmlLang = LOCALE_TO_HTML[locale] ?? "es";
    document.documentElement.lang = htmlLang;
  }, [locale]);

  return null;
}
