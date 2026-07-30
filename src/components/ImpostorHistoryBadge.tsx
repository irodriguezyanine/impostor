"use client";

import React from "react";
import { UserX } from "lucide-react";

type HistoryView = {
  playerId: string;
  name: string;
  times: number;
};

type ImpostorHistoryBadgeProps = {
  history: HistoryView[];
};

export function ImpostorHistoryBadge({ history }: ImpostorHistoryBadgeProps) {
  const withTurns = history.filter((h) => h.times > 0);
  if (withTurns.length === 0) return null;

  const text = withTurns
    .map((h) => `${h.name} ${h.times}`)
    .join(" · ");

  return (
    <div
      className="inline-flex items-center gap-2 max-w-full rounded-full bg-surface-light/80 border border-white/10 px-3 py-1.5 text-xs text-slate-300"
      title={`Turnos impostor: ${text}`}
    >
      <UserX size={14} className="text-primary shrink-0" aria-hidden="true" />
      <span className="truncate">
        <span className="text-slate-500">Turnos impostor:</span> {text}
      </span>
    </div>
  );
}
