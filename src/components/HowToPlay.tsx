"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, X } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";

function formatContent(text: string) {
  return text.split("\n\n").map((paragraph, i) => {
    const parts = paragraph.split(/(\*\*[^*]+\*\*)/g);
    return (
      <p key={i} className="mb-4 last:mb-0">
        {parts.map((part, j) =>
          part.startsWith("**") && part.endsWith("**") ? (
            <strong key={j} className="font-semibold text-slate-100">
              {part.slice(2, -2)}
            </strong>
          ) : (
            <span key={j}>{part}</span>
          )
        )}
      </p>
    );
  });
}

export function HowToPlay() {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
        aria-label={t.howToPlayTitle}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-surface-light border border-white/10 hover:border-white/20 text-slate-300 hover:text-slate-100 transition-all font-medium"
      >
        <BookOpen size={20} />
        {t.howToPlayTitle}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              aria-hidden="true"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="how-to-play-title"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-lg md:w-full md:max-h-[85vh] z-50 flex flex-col bg-surface rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
                <h2
                  id="how-to-play-title"
                  className="text-lg font-semibold text-slate-100 flex items-center gap-2"
                >
                  <BookOpen size={22} className="text-primary" />
                  {t.howToPlayTitle}
                </h2>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label={t.close}
                  className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-slate-100 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-5">
                <div className="text-slate-400 text-[15px] leading-relaxed">
                  {formatContent(t.howToPlayContent)}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
