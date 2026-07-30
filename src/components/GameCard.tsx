"use client";

import React from "react";
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
  onHide: () => void;
  onFlipComplete?: () => void;
};

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
  onHide,
  onFlipComplete,
}: GameCardProps) {
  const t = useTranslations();
  const prefersReducedMotion = useReducedMotion();
  const cardHeight = "h-[420px]";
  const isImpostor = role === "impostor";
  const isMrWhite = role === "mrWhite";

  return (
    <div className="w-full max-w-md mx-auto perspective-1000">
      <motion.div
        className={`relative w-full ${cardHeight} preserve-3d`}
        initial={false}
        animate={{ rotateY: isRevealed ? 180 : 0 }}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { type: "spring", stiffness: 200, damping: 25 }
        }
        onAnimationComplete={() => {
          if (!isRevealed && onFlipComplete) onFlipComplete();
        }}
      >
        {/* Frente */}
        <div
          className="absolute inset-0 w-full backface-hidden rounded-3xl bg-surface shadow-card border border-white/10 p-8 flex flex-col justify-center"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
          aria-hidden={isRevealed}
          inert={isRevealed ? true : undefined}
        >
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
              onPointerDown={(e) => {
                e.stopPropagation();
              }}
              className="w-full py-4 px-6 rounded-2xl bg-primary text-gray-900 font-bold text-lg flex items-center justify-center gap-2 touch-manipulation select-none cursor-pointer active:scale-[0.98] transition-transform min-h-[52px] relative z-10"
            >
              <Eye size={24} aria-hidden />
              {t.revealRole}
            </button>
            <div className="pt-2">
              {showCategories && categoryNames.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-slate-400 text-xs font-medium">
                    {categoryNames.length === 1
                      ? t.categoryLabel
                      : t.categoriesLabel}
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
              ) : (
                <p className="text-slate-400 text-sm">{t.categorySecretLabel}</p>
              )}
            </div>
          </div>
        </div>

        {/* Reverso */}
        <div
          className="absolute inset-0 w-full backface-hidden rounded-3xl bg-surface shadow-card border border-white/10 p-8 flex flex-col justify-center overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
          aria-hidden={!isRevealed}
          inert={!isRevealed ? true : undefined}
        >
          <div className="flex flex-col justify-between h-full text-center">
            <div className="min-h-[100px] flex flex-col justify-center">
              {role === "civilian" ? (
                <>
                  <p className="text-slate-200 text-base">{t.civilianReveal}</p>
                  <motion.p
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: prefersReducedMotion ? 0 : 0.2 }}
                    className="text-2xl font-bold text-slate-100 break-words mt-2"
                  >
                    {secretWord}
                  </motion.p>
                </>
              ) : isMrWhite ? (
                <>
                  <motion.div
                    initial={prefersReducedMotion ? false : { scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex justify-center"
                  >
                    <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center">
                      <UserX size={40} className="text-slate-200" aria-hidden />
                    </div>
                  </motion.div>
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
                  <motion.div
                    initial={prefersReducedMotion ? false : { scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={
                      prefersReducedMotion
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 200, delay: 0.1 }
                    }
                    className="flex justify-center"
                  >
                    <div className="w-20 h-20 rounded-full bg-red-900/50 flex items-center justify-center">
                      <UserX size={40} className="text-red-300" aria-hidden />
                    </div>
                  </motion.div>
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
              {isImpostor &&
              showCategories &&
              categoryNames.length > 0 ? (
                <div className="space-y-1">
                  <p className="text-slate-400 text-xs font-medium">
                    {categoryNames.length === 1
                      ? t.categoryLabel
                      : t.categoriesLabel}
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

            <motion.button
              whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
              onClick={onHide}
              className="w-full py-4 px-6 rounded-2xl bg-primary text-gray-900 font-bold flex items-center justify-center gap-2 flex-shrink-0 min-h-[52px]"
            >
              <EyeOff size={20} aria-hidden />
              {t.passToNextPlayer}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
