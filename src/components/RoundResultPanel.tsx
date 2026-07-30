"use client";

import React from "react";
import { Trophy, Skull, Home, RefreshCw, Info } from "lucide-react";

type RoundResultPanelProps = {
  civiliansWon: boolean | null;
  accusedName: string | null;
  impostorNames: string[];
  secretWord: string;
  onRevealDetails: () => void;
  onNextRound: () => void;
  onHome: () => void;
};

export function RoundResultPanel({
  civiliansWon,
  accusedName,
  impostorNames,
  secretWord,
  onRevealDetails,
  onNextRound,
  onHome,
}: RoundResultPanelProps) {
  const impostorsLabel =
    impostorNames.length > 0 ? impostorNames.join(", ") : "—";

  return (
    <div className="w-full max-w-md mx-auto rounded-2xl bg-surface border border-white/10 p-6 space-y-6 shadow-card text-center">
      {civiliansWon === true ? (
        <div className="space-y-3">
          <Trophy size={40} className="mx-auto text-primary" aria-hidden="true" />
          <h2 className="text-2xl font-bold text-slate-100">
            ¡Ganan los civiles!
          </h2>
          <p className="text-slate-400 text-sm">
            {accusedName
              ? `Acusaron a ${accusedName} y acertaron.`
              : "Los civiles descubrieron al impostor."}
          </p>
        </div>
      ) : civiliansWon === false ? (
        <div className="space-y-3">
          <Skull size={40} className="mx-auto text-rose-400" aria-hidden="true" />
          <h2 className="text-2xl font-bold text-slate-100">
            ¡Ganan los impostores!
          </h2>
          <p className="text-slate-400 text-sm">
            {accusedName
              ? `Acusaron a ${accusedName}, pero no era.`
              : "Los impostores se salieron con la suya."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <Info size={40} className="mx-auto text-slate-300" aria-hidden="true" />
          <h2 className="text-2xl font-bold text-slate-100">Fin de ronda</h2>
          <p className="text-slate-400 text-sm">Revelación sin votación.</p>
        </div>
      )}

      <div className="rounded-xl bg-surface-light border border-white/10 p-4 space-y-2 text-left">
        <p className="text-sm text-slate-400">
          Palabra secreta:{" "}
          <span className="font-bold text-primary">{secretWord}</span>
        </p>
        <p className="text-sm text-slate-400">
          Impostor{impostorNames.length === 1 ? "" : "es"}:{" "}
          <span className="font-semibold text-slate-100">{impostorsLabel}</span>
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={onRevealDetails}
          className="w-full py-3 px-4 rounded-xl bg-surface-light border border-white/10 text-slate-100 font-semibold min-h-[44px] hover:bg-slate-500/40"
        >
          Ver detalles
        </button>
        <button
          type="button"
          onClick={onNextRound}
          className="w-full py-3 px-4 rounded-xl bg-primary text-gray-900 font-bold flex items-center justify-center gap-2 min-h-[48px]"
        >
          <RefreshCw size={18} aria-hidden="true" />
          Siguiente ronda
        </button>
        <button
          type="button"
          onClick={onHome}
          className="w-full py-3 px-4 rounded-xl text-slate-400 hover:text-slate-200 font-medium flex items-center justify-center gap-2 min-h-[44px]"
        >
          <Home size={18} aria-hidden="true" />
          Ir al inicio
        </button>
      </div>
    </div>
  );
}
