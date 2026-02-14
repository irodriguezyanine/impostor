"use client";

import React from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, UserX } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";

type GameCardProps = {
  playerName: string;
  isRevealed: boolean;
  role: "civilian" | "impostor";
  secretWord?: string;
  categoryNames?: string[];
  showCategories?: boolean;
  hintsEnabled?: boolean;
  onReveal: () => void;
  onHide: () => void;
  onFlipComplete?: () => void;
};

export function GameCard({
  playerName,
  isRevealed,
  role,
  secretWord = "",
  categoryNames = [],
  showCategories = true,
  hintsEnabled = false,
  onReveal,
  onHide,
  onFlipComplete,
}: GameCardProps) {
  const t = useTranslations();

  return (
    <div className="w-full max-w-md mx-auto perspective-1000">
      <motion.div
        className="relative w-full min-h-[320px] preserve-3d"
        initial={false}
        animate={{ rotateY: isRevealed ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        onAnimationComplete={() => {
          if (!isRevealed && onFlipComplete) onFlipComplete();
        }}
      >
        {/* Frente: Pásale a X */}
        <motion.div
          className="absolute inset-0 w-full h-full backface-hidden rounded-3xl bg-surface shadow-card border border-white/10 p-8 flex flex-col justify-center"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="text-center space-y-6">
            <p className="text-slate-300 text-lg">
              {t.passTo}{" "}
              <span className="font-bold text-slate-100">{playerName}</span>
            </p>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={onReveal}
              className="w-full py-4 px-6 rounded-2xl bg-primary text-gray-900 font-bold text-lg flex items-center justify-center gap-2"
            >
              <Eye size={24} />
              {t.revealRole}
            </motion.button>
            <div className="pt-2">
              {showCategories && categoryNames.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-slate-500 text-xs font-medium">
                    {categoryNames.length === 1
                      ? t.categoryLabel
                      : t.categoriesLabel}
                  </p>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {categoryNames.map((name) => (
                      <span
                        key={name}
                        className="px-2.5 py-1 rounded-lg bg-surface-light border border-white/10 text-slate-300 text-xs font-medium"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 text-sm">
                  {t.categorySecretLabel}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Reverso: Rol revelado */}
        <motion.div
          className="absolute inset-0 w-full h-full backface-hidden rounded-3xl bg-surface shadow-card border border-white/10 p-8 flex flex-col justify-center"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="text-center space-y-6">
            {role === "civilian" ? (
              <>
                <p className="text-slate-300 text-base">{t.civilianReveal}</p>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-bold text-slate-100 break-words"
                >
                  {secretWord}
                </motion.p>
              </>
            ) : (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                  className="flex justify-center"
                >
                  <div className="w-20 h-20 rounded-full bg-red-900/50 flex items-center justify-center">
                    <UserX size={40} className="text-red-400" />
                  </div>
                </motion.div>
                <p className="text-lg font-bold text-red-400">
                  {t.impostorReveal}
                </p>
                <p className="text-slate-400">{t.impostorDescription}</p>
                {hintsEnabled && categoryNames.length > 0 && (
                  <div className="pt-2 space-y-1">
                    <p className="text-amber-400/90 text-sm font-medium">
                      {t.impostorHintLabel}
                    </p>
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {categoryNames.map((name) => (
                        <span
                          key={name}
                          className="px-2.5 py-1 rounded-lg bg-amber-900/30 border border-amber-500/30 text-amber-200/90 text-xs font-medium"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={onHide}
              className="w-full py-4 px-6 rounded-2xl bg-primary text-gray-900 font-bold flex items-center justify-center gap-2"
            >
              <EyeOff size={20} />
              {t.passToNextPlayer}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
