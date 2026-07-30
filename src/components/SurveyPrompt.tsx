"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";
import { track } from "@/lib/product-stubs";

type SurveyPromptProps = {
  open?: boolean;
  onClose?: () => void;
  onDismiss?: () => void;
};

export function SurveyPrompt({ open = true, onClose, onDismiss }: SurveyPromptProps) {
  const [sent, setSent] = useState(false);
  const dismiss = onClose ?? onDismiss;

  if (!open) return null;

  const handleRate = (rating: 1 | 2 | 3 | 4 | 5) => {
    track({ name: "survey", rating });
    setSent(true);
    window.setTimeout(() => dismiss?.(), 1200);
  };

  if (sent) {
    return (
      <div className="rounded-2xl bg-surface border border-white/10 p-4 text-center text-sm text-slate-300">
        ¡Gracias por tu opinión!
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-surface border border-white/10 p-4 space-y-3 shadow-card">
      <p className="text-sm font-medium text-slate-200 text-center">
        ¿Qué tal la partida?
      </p>
      <div className="flex justify-center gap-1">
        {([1, 2, 3, 4, 5] as const).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => handleRate(n)}
            aria-label={`${n} estrellas`}
            className="p-2 rounded-lg text-slate-500 hover:text-primary transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <Star size={22} aria-hidden="true" />
          </button>
        ))}
      </div>
      {dismiss && (
        <button
          type="button"
          onClick={dismiss}
          className="w-full text-xs text-slate-500 hover:text-slate-300 py-1"
        >
          Ahora no
        </button>
      )}
    </div>
  );
}
