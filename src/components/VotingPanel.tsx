"use client";

import React, { useMemo, useState } from "react";
import { Vote, User, ArrowLeft } from "lucide-react";

type PlayerRef = { id: string; name: string };
type Ballot = { voterId: string; accusedId: string };

type VotingPanelProps = {
  players: PlayerRef[];
  ballots: Ballot[];
  onCast: (voterId: string, accusedId: string) => void;
  onResolve: () => void;
};

export function VotingPanel({
  players,
  ballots,
  onCast,
  onResolve,
}: VotingPanelProps) {
  const [voterId, setVoterId] = useState<string | null>(null);

  const votedIds = useMemo(
    () => new Set(ballots.map((b) => b.voterId)),
    [ballots]
  );
  const pending = players.filter((p) => !votedIds.has(p.id));
  const allVoted = players.length > 0 && pending.length === 0;

  const voter = voterId ? players.find((p) => p.id === voterId) : null;
  const accuseOptions = players.filter((p) => p.id !== voterId);

  const handleAccuse = (accusedId: string) => {
    if (!voterId) return;
    onCast(voterId, accusedId);
    setVoterId(null);
  };

  return (
    <div className="w-full max-w-md mx-auto rounded-2xl bg-surface border border-white/10 p-6 space-y-5 shadow-card">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-slate-300 text-sm font-medium">
          <Vote size={18} className="text-primary" aria-hidden="true" />
          Votación secreta
        </div>
        <span className="text-sm font-semibold text-primary tabular-nums">
          {votedIds.size}/{players.length} votaron
        </span>
      </div>

      {!voter ? (
        <>
          <p className="text-slate-400 text-sm text-center">
            Elige quién vota (pasa el teléfono sin mirar)
          </p>
          <ul className="space-y-2">
            {players.map((p) => {
              const done = votedIds.has(p.id);
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    disabled={done}
                    onClick={() => setVoterId(p.id)}
                    className="w-full flex items-center gap-3 rounded-xl bg-surface-light border border-white/10 px-4 py-3 text-left disabled:opacity-40 min-h-[48px] hover:border-primary/30"
                  >
                    <User size={18} className="text-slate-400" aria-hidden="true" />
                    <span className="flex-1 font-medium text-slate-100">
                      {p.name}
                    </span>
                    {done && (
                      <span className="text-xs text-primary font-semibold">
                        Listo
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setVoterId(null)}
            className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Volver
          </button>
          <p className="text-center">
            <span className="text-slate-400 text-sm">Vota </span>
            <span className="text-xl font-bold text-slate-100">
              {voter?.name}
            </span>
          </p>
          <p className="text-slate-400 text-sm text-center">
            ¿Quién es el impostor?
          </p>
          <ul className="space-y-2">
            {accuseOptions.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => handleAccuse(p.id)}
                  className="w-full rounded-xl bg-surface-light border border-white/10 px-4 py-3 text-slate-100 font-semibold min-h-[48px] hover:border-primary/40 hover:bg-primary/10"
                >
                  {p.name}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      <button
        type="button"
        onClick={onResolve}
        disabled={!allVoted}
        className="w-full py-3 px-4 rounded-xl bg-primary text-gray-900 font-bold min-h-[48px] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Resolver votos
      </button>
    </div>
  );
}
