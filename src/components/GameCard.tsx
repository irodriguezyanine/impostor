"use client";

import React, { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { Eye, EyeOff, UserX } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";

type GameCardProps = {
  playerName: string;
  isRevealed: boolean;
  role: "civilian" | "impostor" | "mrWhite";
  /** Modo palabra cercana: el impostor ve esto en vez de la secreta. */
  closeWord?: string | null;
  secretWord?: string;
  categoryNames?: string[];
  showCategories?: boolean;
  hintsEnabled?: boolean;
  secretWordHint?: string | null;
  onReveal: () => void;
  /** Oculta la palabra/rol sin pasar al siguiente jugador. */
  onCover: () => void;
  onHide: () => void;
  onFlipComplete?: () => void;
};

function CategoryChips({
  categoryNames,
  singleLabel,
  pluralLabel,
}: {
  categoryNames: string[];
  singleLabel: string;
  pluralLabel: string;
}) {
  if (categoryNames.length === 0) return null;
  return (
    <div className="space-y-1">
      <p className="text-slate-400 text-xs font-medium">
        {categoryNames.length === 1 ? singleLabel : pluralLabel}
      </p>
      <div className="flex flex-wrap justify-center gap-1.5">
        {categoryNames.map((name) => (
          <span
            key={name}
            className="px-2.5 py-1 rounded-lg bg-surface-light border border-white/10 text-slate-200 text-xs font-medium"
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}

const primaryBtnClass =
  "w-full py-4 px-6 rounded-2xl bg-primary text-gray-900 font-bold text-lg flex items-center justify-center gap-2 touch-manipulation select-none cursor-pointer active:scale-[0.98] transition-transform min-h-[52px]";

export function GameCard({
  playerName,
  isRevealed,
  role,
  closeWord = null,
  secretWord = "",
  categoryNames = [],
  showCategories = true,
  hintsEnabled = false,
  secretWordHint = null,
  onReveal,
  onCover,
  onHide,
  onFlipComplete,
}: GameCardProps) {
  const t = useTranslations();
  const prefersReducedMotion = useReducedMotion();
  const isImpostor = role === "impostor";
  const isMrWhite = role === "mrWhite";
  const prevRevealed = useRef(isRevealed);

  // Al pasar al siguiente, la carta vuelve a tapada y avisamos cuando listo.
  useEffect(() => {
    const wasRevealed = prevRevealed.current;
    prevRevealed.current = isRevealed;
    if (!wasRevealed || isRevealed || !onFlipComplete) return;
    const id = window.setTimeout(
      () => onFlipComplete(),
      prefersReducedMotion ? 0 : 180
    );
    return () => window.clearTimeout(id);
  }, [isRevealed, onFlipComplete, prefersReducedMotion]);

  const toggleReveal = () => {
    if (isRevealed) onCover();
    else onReveal();
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative w-full min-h-[420px] rounded-3xl bg-surface shadow-card border border-white/10 p-8 flex flex-col">
        {!isRevealed ? (
          <div className="flex flex-1 flex-col justify-center text-center space-y-6">
            <p className="text-slate-200 text-lg">
              {t.passTo}{" "}
              <span className="font-bold text-slate-100">{playerName}</span>
            </p>
            <button type="button" onClick={toggleReveal} className={primaryBtnClass}>
              <Eye size={24} aria-hidden />
              {t.revealRole}
            </button>
            <div className="pt-2">
              {showCategories && categoryNames.length > 0 ? (
                <CategoryChips
                  categoryNames={categoryNames}
                  singleLabel={t.categoryLabel}
                  pluralLabel={t.categoriesLabel}
                />
              ) : (
                <p className="text-slate-400 text-sm">{t.categorySecretLabel}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col justify-between text-center gap-4">
            <div className="flex flex-col justify-center gap-2 pt-2">
              {role === "civilian" ? (
                <>
                  <p className="text-slate-200 text-base">{t.civilianReveal}</p>
                  <p className="text-2xl font-bold text-slate-100 break-words">
                    {secretWord}
                  </p>
                </>
              ) : isMrWhite ? (
                <>
                  <div className="flex justify-center">
                    <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center">
                      <UserX size={40} className="text-slate-200" aria-hidden />
                    </div>
                  </div>
                  <p className="text-lg font-bold text-slate-100">Mr. White</p>
                  <p className="text-slate-300 text-sm">
                    No conoces la palabra. Escucha y trata de mezclarte. Si te
                    descubren, puedes ganar adivinándola.
                  </p>
                </>
              ) : (
                <>
                  <div className="flex justify-center">
                    <div className="w-20 h-20 rounded-full bg-red-900/50 flex items-center justify-center">
                      <UserX size={40} className="text-red-300" aria-hidden />
                    </div>
                  </div>
                  <p className="text-lg font-bold text-red-300">
                    {t.impostorReveal}
                  </p>
                  <p className="text-slate-300 text-sm">
                    {t.impostorDescription}
                  </p>
                  {closeWord ? (
                    <p className="text-amber-200 text-sm">
                      Palabra cercana:{" "}
                      <span className="font-bold">{closeWord}</span>
                    </p>
                  ) : null}
                </>
              )}
            </div>

            {isImpostor && showCategories && categoryNames.length > 0 ? (
              <CategoryChips
                categoryNames={categoryNames}
                singleLabel={t.categoryLabel}
                pluralLabel={t.categoriesLabel}
              />
            ) : null}

            {isImpostor && hintsEnabled !== false ? (
              <div className="px-4 py-3 rounded-xl bg-amber-500/20 border-2 border-amber-500/40">
                <p className="text-amber-300 text-xs font-semibold mb-1 uppercase tracking-wider">
                  {t.impostorHintLabel}
                </p>
                <p className="text-amber-50 font-bold text-lg leading-tight">
                  {secretWordHint || categoryNames[0] || t.categoryLabel}
                </p>
              </div>
            ) : null}

            <div className="space-y-2 mt-auto">
              {/* Mismo botón primario: VER MI ROL ↔ OCULTAR */}
              <button
                type="button"
                onClick={toggleReveal}
                className={primaryBtnClass}
              >
                <EyeOff size={24} aria-hidden />
                {t.hideReady}
              </button>
              <button
                type="button"
                onClick={onHide}
                className="w-full py-3 px-6 rounded-2xl bg-surface-light text-slate-100 font-bold border border-white/10 min-h-[48px] active:scale-[0.98] transition-transform"
              >
                {t.passToNextPlayer}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
