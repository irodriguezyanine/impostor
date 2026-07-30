"use client";

import React, { useEffect, useState } from "react";
import { MessageCircle, SkipForward, Vote, Eye } from "lucide-react";

type Speaker = { id: string; name: string };

type DiscussionPanelProps = {
  speakers: Speaker[];
  speakIndex: number;
  endsAt: number | null;
  turnSeconds: number;
  enableTurnOrder: boolean;
  onNextSpeaker: () => void;
  onStartVoting: () => void;
  onSkipReveal: () => void;
};

function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function DiscussionPanel({
  speakers,
  speakIndex,
  endsAt,
  turnSeconds,
  enableTurnOrder,
  onNextSpeaker,
  onStartVoting,
  onSkipReveal,
}: DiscussionPanelProps) {
  const [now, setNow] = useState(() => Date.now());
  const [turnStartedAt, setTurnStartedAt] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    setTurnStartedAt(Date.now());
  }, [speakIndex]);

  const current = speakers[speakIndex] ?? speakers[0];
  const discussLeft = endsAt != null ? endsAt - now : null;
  const turnLeft =
    enableTurnOrder && turnSeconds > 0
      ? turnSeconds * 1000 - (now - turnStartedAt)
      : null;

  return (
    <div className="w-full max-w-md mx-auto rounded-2xl bg-surface border border-white/10 p-6 space-y-6 shadow-card">
      <div className="flex items-center gap-2 text-slate-300 text-sm font-medium">
        <MessageCircle size={18} className="text-primary" aria-hidden="true" />
        Discusión
      </div>

      {enableTurnOrder && current ? (
        <div className="text-center space-y-2">
          <p className="text-slate-400 text-sm">Habla ahora</p>
          <p className="text-3xl sm:text-4xl font-bold text-slate-100 tracking-tight">
            {current.name}
          </p>
          <p className="text-slate-500 text-sm">
            {speakIndex + 1} / {speakers.length}
          </p>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-2xl font-bold text-slate-100">Debate libre</p>
          <p className="text-slate-400 text-sm mt-1">
            Hablen hasta que estén listos para votar
          </p>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-4">
        {discussLeft != null && (
          <div className="rounded-xl bg-surface-light border border-white/10 px-4 py-3 text-center min-w-[100px]">
            <p className="text-xs text-slate-400 uppercase tracking-wide">
              Tiempo
            </p>
            <p
              className={`text-2xl font-bold tabular-nums ${
                discussLeft <= 10_000 ? "text-amber-400" : "text-primary"
              }`}
            >
              {formatCountdown(discussLeft)}
            </p>
          </div>
        )}
        {turnLeft != null && (
          <div className="rounded-xl bg-surface-light border border-white/10 px-4 py-3 text-center min-w-[100px]">
            <p className="text-xs text-slate-400 uppercase tracking-wide">
              Turno
            </p>
            <p
              className={`text-2xl font-bold tabular-nums ${
                turnLeft <= 5_000 ? "text-amber-400" : "text-slate-100"
              }`}
            >
              {formatCountdown(turnLeft)}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {enableTurnOrder && (
          <button
            type="button"
            onClick={onNextSpeaker}
            className="w-full py-3 px-4 rounded-xl bg-surface-light hover:bg-slate-500/40 text-slate-100 font-semibold border border-white/10 flex items-center justify-center gap-2 min-h-[44px]"
          >
            <SkipForward size={18} aria-hidden="true" />
            Siguiente hablante
          </button>
        )}
        <button
          type="button"
          onClick={onStartVoting}
          className="w-full py-3 px-4 rounded-xl bg-primary text-gray-900 font-bold flex items-center justify-center gap-2 min-h-[48px] hover:shadow-glow transition-all"
        >
          <Vote size={18} aria-hidden="true" />
          Ir a votación
        </button>
        <button
          type="button"
          onClick={onSkipReveal}
          className="w-full py-3 px-4 rounded-xl text-slate-400 hover:text-slate-200 font-medium flex items-center justify-center gap-2 min-h-[44px]"
        >
          <Eye size={18} aria-hidden="true" />
          Revelar sin votar
        </button>
      </div>
    </div>
  );
}
