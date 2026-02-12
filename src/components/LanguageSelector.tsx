"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe } from "lucide-react";
import { useGame } from "@/context/GameContext";
import { LOCALES, LOCALE_NAMES } from "@/lib/i18n";

export function LanguageSelector() {
  const { locale, setLocale } = useGame();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
      >
        <Globe size={18} />
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
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 py-2 w-40 bg-white rounded-2xl shadow-lg border border-gray-100 z-20"
            >
              {LOCALES.map((loc) => (
                <li key={loc}>
                  <button
                    type="button"
                    onClick={() => {
                      setLocale(loc);
                      setIsOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 rounded-xl mx-1 ${
                      locale === loc ? "font-semibold text-primary" : ""
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
