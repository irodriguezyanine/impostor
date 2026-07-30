"use client";

import React, { useMemo } from "react";
import { Medal } from "lucide-react";

type ScoreRow = {
  playerId: string;
  name: string;
  points: number;
  civilianWins: number;
  impostorWins: number;
  detections: number;
};

type NightScoreboardProps = {
  rows: ScoreRow[];
};

export function NightScoreboard({ rows }: NightScoreboardProps) {
  const ranked = useMemo(
    () =>
      [...rows].sort(
        (a, b) =>
          b.points - a.points ||
          b.detections - a.detections ||
          a.name.localeCompare(b.name, "es")
      ),
    [rows]
  );

  if (ranked.length === 0) {
    return (
      <div className="rounded-2xl bg-surface border border-white/10 p-4 text-center text-slate-400 text-sm">
        Sin puntuaciones aún
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl bg-surface border border-white/10 p-4 shadow-card">
      <div className="flex items-center gap-2 mb-3 text-sm font-medium text-slate-300">
        <Medal size={16} className="text-primary" aria-hidden="true" />
        Marcador de la noche
      </div>
      <ol className="space-y-1.5">
        {ranked.map((row, index) => (
          <li
            key={row.playerId}
            className="flex items-center gap-3 rounded-xl bg-surface-light/60 border border-white/5 px-3 py-2"
          >
            <span
              className={`w-6 text-center text-sm font-bold tabular-nums ${
                index === 0 ? "text-primary" : "text-slate-500"
              }`}
            >
              {index + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-100 truncate text-sm">
                {row.name}
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                C {row.civilianWins} · I {row.impostorWins} · Det{" "}
                {row.detections}
              </p>
            </div>
            <span className="text-sm font-bold text-primary tabular-nums">
              {row.points}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
