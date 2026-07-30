"use client";

import React, { useEffect, useState } from "react";
import { Mic } from "lucide-react";

type LastWordPanelProps = {
  playerName: string;
  seconds?: number;
  onDone: () => void;
};

export function LastWordPanel({
  playerName,
  seconds = 20,
  onDone,
}: LastWordPanelProps) {
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    setLeft(seconds);
  }, [seconds, playerName]);

  useEffect(() => {
    if (left <= 0) return;
    const id = window.setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [left]);

  const canContinue = left <= 0;

  return (
    <div className="w-full max-w-md mx-auto rounded-2xl bg-surface border border-white/10 p-6 space-y-6 shadow-card text-center">
      <div className="flex items-center justify-center gap-2 text-slate-300 text-sm font-medium">
        <Mic size={18} className="text-primary" aria-hidden="true" />
        Última palabra
      </div>

      <div className="space-y-2">
        <p className="text-slate-400 text-sm">Defensa de</p>
        <p className="text-3xl font-bold text-slate-100">{playerName}</p>
      </div>

      <div
        className={`text-5xl font-bold tabular-nums ${
          left <= 5 ? "text-amber-400" : "text-primary"
        }`}
        aria-live="polite"
      >
        {Math.max(0, left)}s
      </div>

      <p className="text-slate-400 text-sm">
        {canContinue
          ? "Tiempo cumplido. Continúen cuando estén listos."
          : "Explica por qué no eres el impostor…"}
      </p>

      <button
        type="button"
        onClick={onDone}
        disabled={!canContinue}
        className="w-full py-3 px-4 rounded-xl bg-primary text-gray-900 font-bold min-h-[48px] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Continuar
      </button>
    </div>
  );
}
