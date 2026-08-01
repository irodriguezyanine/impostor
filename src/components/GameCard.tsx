"use client";

import React, { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
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

  const shellClass =
    "relative w-full h-[420px] rounded-3xl bg-surface shadow-card border border-white/10 p-8 flex flex-col justify-center overflow-hidden";

  return (
    <div className="w-full max-w-md mx-auto">
      <div className={shellClass}>
        {!isRevealed ? (
          <div className="text-center space-y-6">
            <p className="text-slate-200 text-lg">
              {t.passTo}{" "}
              <span className="font-bold text-slate-100">{playerName}</span>
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onReveal();
              }}
              className="w-full py-4 px-6 rounded-2xl bg-primary text-gray-900 font-bold text-lg flex items-center justify-center gap-2 touch-manipulation select-none cursor-pointer active:scale-[0.98] transition-transform min-h-[52px]"
            >
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
          <div className="flex flex-col justify-between h-full text-center">
            <div className="min-h-[100px] flex flex-col justify-center">
              {role === "civilian" ? (
                <>
                  <p className="text-slate-200 text-base">{t.civilianReveal}</p>
                  <motion.p
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: prefersReducedMotion ? 0 : 0.1 }}
                    className="text-2xl font-bold text-slate-100 break-words mt-2"
                  >
                    {secretWord}
                  </motion.p>
                </>
              ) : isMrWhite ? (
                <>
                  <div className="flex justify-center">
                    <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center">
                      <UserX size={40} className="text-slate-200" aria-hidden />
                    </div>
                  </div>
                  <p className="text-lg font-bold text-slate-100 mt-2">
                    Mr. White
                  </p>
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
                  <p className="text-lg font-bold text-red-300 mt-2">
                    {t.impostorReveal}
                  </p>
                  <p className="text-slate-300 text-sm">
                    {t.impostorDescription}
                  </p>
                  {closeWord ? (
                    <p className="text-amber-200 text-sm mt-2">
                      Palabra cercana:{" "}
                      <span className="font-bold">{closeWord}</span>
                    </p>
                  ) : null}
                </>
              )}
            </div>

            <div className="min-h-[52px] flex flex-col justify-center py-1">
              {isImpostor && showCategories && categoryNames.length > 0 ? (
                <CategoryChips
                  categoryNames={categoryNames}
                  singleLabel={t.categoryLabel}
                  pluralLabel={t.categoriesLabel}
                />
              ) : null}
            </div>

            <div className="min-h-[72px] flex flex-col justify-center">
              {isImpostor && hintsEnabled !== false ? (
                <div className="pt-2 px-4 py-3 rounded-xl bg-amber-500/20 border-2 border-amber-500/40">
                  <p className="text-amber-300 text-xs font-semibold mb-1 uppercase tracking-wider">
                    {t.impostorHintLabel}
                  </p>
                  <p className="text-amber-50 font-bold text-lg leading-tight">
                    {secretWordHint || categoryNames?.[0] || t.categoryLabel}
                  </p>
                </div>
              ) : null}
            </div>

            <div className="space-y-2 flex-shrink-0">
              <button
                type="button"
                onClick={onCover}
                className="w-full py-4 px-6 rounded-2xl bg-primary text-gray-900 font-bold flex items-center justify-center gap-2 min-h-[52px] active:scale-[0.98] transition-transform"
              >
                <EyeOff size={20} aria-hidden />
                {t.hideReady}
              </button>
              <button
                type="button"
                onClick={onHide}
                className="w-full py-3 px-6 rounded-2xl bg-surface-light text-slate-100 font-bold border border-white/10 flex items-center justify-center gap-2 min-h-[48px] active:scale-[0.98] transition-transform"
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
