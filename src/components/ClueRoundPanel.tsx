"use client";

import React, { useMemo, useState } from "react";
import { Lightbulb, ChevronRight, Check } from "lucide-react";

type PlayerRef = { id: string; name: string };

type ClueRoundPanelProps = {
  players: PlayerRef[];
  clues: Record<string, string>;
  onSetClue: (playerId: string, clue: string) => void;
  onFinish: () => void;
};

export function ClueRoundPanel({
  players,
  clues,
  onSetClue,
  onFinish,
}: ClueRoundPanelProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [draft, setDraft] = useState("");

  const filledCount = useMemo(
    () => players.filter((p) => (clues[p.id] ?? "").trim().length > 0).length,
    [players, clues]
  );
  const allFilled = players.length > 0 && filledCount === players.length;
  const current = players[activeIndex] ?? null;

  const submitCurrent = () => {
    if (!current) return;
    const value = draft.trim();
    if (!value) return;
    onSetClue(current.id, value);
    setDraft("");
    if (activeIndex < players.length - 1) {
      setActiveIndex(activeIndex + 1);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto rounded-2xl bg-surface border border-white/10 p-6 space-y-5 shadow-card">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-slate-300 text-sm font-medium">
          <Lightbulb size={18} className="text-primary" aria-hidden="true" />
          Ronda de pistas
        </div>
        <span className="text-sm text-slate-400 tabular-nums">
          {filledCount}/{players.length}
        </span>
      </div>

      <p className="text-slate-400 text-sm">
        Pasa el teléfono. Cada jugador escribe una pista sin decir la palabra.
      </p>

      {current && (
        <div className="space-y-3">
          <p className="text-center text-xl font-bold text-slate-100">
            {current.name}
          </p>
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submitCurrent();
              }
            }}
            placeholder="Tu pista…"
            maxLength={80}
            className="w-full rounded-xl bg-surface-light border border-white/10 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[44px]"
            autoFocus
          />
          <button
            type="button"
            onClick={submitCurrent}
            disabled={!draft.trim()}
            className="w-full py-3 px-4 rounded-xl bg-primary text-gray-900 font-bold flex items-center justify-center gap-2 min-h-[48px] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Guardar pista
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
      )}

      <ul className="space-y-2 max-h-40 overflow-y-auto">
        {players.map((p, i) => {
          const filled = (clues[p.id] ?? "").trim().length > 0;
          return (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => {
                  setActiveIndex(i);
                  setDraft(clues[p.id] ?? "");
                }}
                className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-sm border min-h-[40px] ${
                  i === activeIndex
                    ? "border-primary/40 bg-primary/10 text-slate-100"
                    : "border-white/5 bg-surface-light/50 text-slate-300"
                }`}
              >
                <span>{p.name}</span>
                {filled ? (
                  <Check size={16} className="text-primary" aria-hidden="true" />
                ) : (
                  <span className="text-slate-500">—</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={onFinish}
          disabled={!allFilled}
          className="w-full py-3 px-4 rounded-xl bg-primary text-gray-900 font-bold min-h-[48px] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continuar
        </button>
        <button
          type="button"
          onClick={onFinish}
          className="w-full py-2 text-sm text-slate-400 hover:text-slate-200"
        >
          Saltar pistas
        </button>
      </div>
    </div>
  );
}
