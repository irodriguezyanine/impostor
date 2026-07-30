"use client";

import React, { useState } from "react";
import { Flag } from "lucide-react";
import { reportContent } from "@/lib/product-stubs";

type ReportWordButtonProps = {
  word: string;
  categoryId: string;
};

const REASONS = [
  { id: "offensive", label: "Ofensiva" },
  { id: "typo", label: "Error ortográfico" },
  { id: "wrong-category", label: "Categoría incorrecta" },
  { id: "other", label: "Otro" },
] as const;

export function ReportWordButton({
  word,
  categoryId,
}: ReportWordButtonProps) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);

  const handleReport = (reason: string) => {
    reportContent({ word, categoryId, reason });
    setDone(true);
    setOpen(false);
    window.setTimeout(() => setDone(false), 2000);
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 py-1 px-2 rounded-lg min-h-[36px]"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Flag size={14} aria-hidden="true" />
        {done ? "Reportada" : "Reportar palabra"}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute z-20 bottom-full left-0 mb-1 w-48 rounded-xl bg-surface border border-white/15 shadow-modal p-1"
        >
          <p className="px-2 py-1.5 text-[11px] text-slate-500 truncate">
            «{word}»
          </p>
          {REASONS.map((r) => (
            <button
              key={r.id}
              type="button"
              role="menuitem"
              onClick={() => handleReport(r.id)}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-white/10 min-h-[40px]"
            >
              {r.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
