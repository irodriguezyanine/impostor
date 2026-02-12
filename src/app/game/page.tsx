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
    revealRole,
    hideRole,
  } = useGame();
  const t = useTranslations();

  useEffect(() => {
    if (phase === "setup") {
      router.replace("/");
    }
  }, [phase, router]);

  if (!gameState) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-gray-500"
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
    <div className="min-h-screen bg-background pb-8 safe-bottom">
      <div className="max-w-lg mx-auto px-4 pt-6 safe-top">
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
          ) : (
            <motion.div
              key="playing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6 pt-8"
            >
              <div className="bg-white rounded-3xl shadow-sm p-8 text-center">
                <h2 className="text-lg font-semibold text-gray-600 mb-2">
                  {t.gameInProgress}
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  {t.firstPlayer}
                </p>
                <div className="flex items-center justify-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
                    <Play size={28} className="text-gray-900" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    {firstPlayer}
                  </span>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  finishGame();
                  router.push("/");
                }}
                className="w-full py-4 rounded-2xl bg-gray-200 text-gray-800 font-bold flex items-center justify-center gap-2"
              >
                {t.finishGame}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
