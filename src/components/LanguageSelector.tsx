"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe } from "lucide-react";
import { useGame } from "@/context/GameContext";
import { LOCALES, LOCALE_NAMES } from "@/lib/i18n";

export function LanguageSelector() {
  const { locale, setLocale } = useGame();
  const [isOpen, setIsOpen] = useState(false);
  const listId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-label={LOCALE_NAMES[locale]}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-light text-slate-100 hover:bg-slate-500/50 transition-all border border-white/10 hover:border-white/15 shadow-sm min-h-[44px]"
      >
        <Globe size={18} aria-hidden="true" />
        <span className="text-sm font-medium">{LOCALE_NAMES[locale]}</span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
            <motion.ul
              id={listId}
              role="listbox"
              aria-label={LOCALE_NAMES[locale]}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 py-2 w-40 bg-surface rounded-xl shadow-card border border-white/10 z-20"
            >
              {LOCALES.map((loc) => (
                <li key={loc} role="none">
                  <button
                    type="button"
                    role="option"
                    aria-selected={locale === loc}
                    onClick={() => {
                      setLocale(loc);
                      setIsOpen(false);
                      buttonRef.current?.focus();
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-surface-light rounded-lg mx-1 transition-colors min-h-[44px] ${
                      locale === loc
                        ? "font-semibold text-primary"
                        : "text-slate-100"
                    }`}
                  >
                    {LOCALE_NAMES[loc]}
                  </button>
                </li>
              ))}
            </motion.ul>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
