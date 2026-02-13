"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, ChevronDown } from "lucide-react";
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

  return (
    <div className="bg-surface rounded-2xl shadow-xl shadow-black/20 border border-white/5 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="how-to-play-content"
        id="how-to-play-trigger"
        className="w-full flex items-center justify-between gap-3 px-6 py-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        <span className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/20 text-primary">
            <BookOpen size={20} />
          </div>
          <h2 className="text-lg font-semibold text-slate-100">
            {t.howToPlayTitle}
          </h2>
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-slate-400"
        >
          <ChevronDown size={24} />
        </motion.span>
      </button>
      <motion.div
        id="how-to-play-content"
        role="region"
        aria-labelledby="how-to-play-trigger"
        aria-hidden={!isOpen}
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <div className="px-6 pb-6 pt-2 border-t border-white/5">
          <div className="text-slate-400 text-[15px] leading-relaxed">
            {formatContent(t.howToPlayContent)}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
