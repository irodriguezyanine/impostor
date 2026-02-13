"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { GameCard } from "@/components/GameCard";
import { useGame } from "@/context/GameContext";
import { useTranslations } from "@/hooks/useTranslations";
import { Play } from "lucide-react";

export default function GamePage() {
  const router = useRouter();
  const {
    phase,
    gameState,
    finishGame,
    revealAndFinish,
    revealRole,
    hideRole,
  } = useGame();
  const t = useTranslations();

  useEffect(() => {
    if (phase === "setup") {
      router.replace("/");
    }
  }, [phase, router]);

  const impostors = gameState
    ? Object.entries(gameState.playerRoles)
        .filter(([, role]) => role === "impostor")
        .map(([name]) => name)
    : [];

  if (!gameState) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-slate-400"
        >
          {t.loading}
        </motion.div>
      </div>
    );
  }

  const { shuffledOrder, currentPlayerIndex, firstPlayer, revealedPlayers } =
    gameState;
  const currentPlayer = shuffledOrder[currentPlayerIndex];
  const currentRole = currentPlayer
    ? gameState.playerRoles[currentPlayer]
    : "civilian";
  const isRevealed = currentPlayer
    ? revealedPlayers.has(currentPlayer)
    : false;

  const handleReveal = () => {
    if (currentPlayer) revealRole(currentPlayer);
  };

  const handleHide = () => {
    hideRole();
  };

  return (
    <div className="min-h-screen bg-background pb-8 safe-bottom relative">
      <div className="absolute inset-0 bg-gradient-mesh" aria-hidden />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(163,230,53,0.06)_0%,transparent_50%)]" aria-hidden />
      <div className="relative z-10 max-w-lg mx-auto px-4 pt-6 safe-top">
        <AnimatePresence mode="wait">
          {phase === "passing" || phase === "revealing" ? (
            <motion.div
              key="pass-reveal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pt-8"
            >
              <GameCard
                playerName={currentPlayer}
                isRevealed={isRevealed}
                role={currentRole}
                secretWord={gameState.secretWord}
                onReveal={handleReveal}
                onHide={handleHide}
              />
            </motion.div>
          ) : phase === "ended" ? (
            <motion.div
              key="ended"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6 pt-8"
            >
              <div className="bg-surface rounded-2xl shadow-xl border border-white/5 p-8 space-y-6">
                <h2 className="text-xl font-bold text-slate-100 text-center">
                  {t.theSecretWordWas}
                </h2>
                <p className="text-3xl font-bold text-primary text-center break-words">
                  {gameState.secretWord}
                </p>
                <div className="border-t border-white/10 pt-6">
                  <h2 className="text-lg font-semibold text-red-400 mb-3 text-center">
                    {t.impostorsWere}
                  </h2>
                  <div className="flex flex-wrap justify-center gap-2">
                    {impostors.map((name) => (
                      <span
                        key={name}
                        className="px-4 py-2 rounded-xl bg-red-900/50 text-red-300 font-bold"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  finishGame();
                  router.push("/");
                }}
                className="w-full py-4 rounded-2xl bg-primary text-gray-900 font-bold flex items-center justify-center gap-2"
              >
                {t.backToHome}
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="playing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6 pt-8"
            >
              <div className="bg-surface rounded-2xl shadow-xl border border-white/5 p-8 text-center">
                <h2 className="text-lg font-semibold text-slate-300 mb-2">
                  {t.gameInProgress}
                </h2>
                <p className="text-sm text-slate-400 mb-4">
                  {t.firstPlayer}
                </p>
                <div className="flex items-center justify-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
                    <Play size={28} className="text-gray-900" />
                  </div>
                  <span className="text-2xl font-bold text-slate-100">
                    {firstPlayer}
                  </span>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={revealAndFinish}
                className="w-full py-4 rounded-2xl bg-primary text-gray-900 font-bold flex items-center justify-center gap-2 text-center"
              >
                {t.finishAndReveal}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
