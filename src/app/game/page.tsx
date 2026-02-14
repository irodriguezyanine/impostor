"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { GameCard } from "@/components/GameCard";
import { useGame } from "@/context/GameContext";
import { useTranslations } from "@/hooks/useTranslations";
import { Play, ChevronDown, X } from "lucide-react";
import { CATEGORIES, getHintsForWord } from "@/data/categories";

export default function GamePage() {
  const router = useRouter();
  const {
    phase,
    gameState,
    selectedCategories,
    categoryVisibility,
    hintsEnabled,
    repeatCardForPlayer,
    finishGame,
    revealAndFinish,
    restartGame,
    revealRole,
    hideRole,
    completeFlipToNext,
    showCardForPlayer,
    clearRepeatCard,
  } = useGame();
  const t = useTranslations();
  const [showPlayerPicker, setShowPlayerPicker] = useState(false);
  const [repeatCardRevealed, setRepeatCardRevealed] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const playerPickerRef = useRef<HTMLDivElement>(null);

  const confirmExit = useCallback(() => {
    finishGame();
    setShowExitConfirm(false);
    router.push("/");
  }, [finishGame, router]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        showPlayerPicker &&
        playerPickerRef.current &&
        !playerPickerRef.current.contains(e.target as Node)
      ) {
        setShowPlayerPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showPlayerPicker]);

  useEffect(() => {
    if (phase === "setup") {
      router.replace("/");
    }
  }, [phase, router]);

  // Advertencia al refrescar o cerrar pestaña
  useEffect(() => {
    if (!gameState) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [gameState]);

  // Advertencia al pulsar "atrás" del navegador: revertir navegación y mostrar diálogo
  useEffect(() => {
    if (!gameState) return;
    history.pushState({ fromGame: true }, "", window.location.href);
    const handlePopState = () => {
      history.pushState({ fromGame: true }, "", window.location.href);
      setShowExitConfirm(true);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [gameState]);

  const impostors = gameState
    ? Object.entries(gameState.playerRoles)
        .filter(([, role]) => role === "impostor")
        .map(([name]) => name)
    : [];

  /** Obtiene la pista para un jugador impostor. Fallback si no está en impostorHints. */
  const getHintForPlayer = useCallback(
    (playerName: string): string | null => {
      if (!gameState || gameState.playerRoles[playerName] !== "impostor")
        return null;
      const hint = gameState.impostorHints?.[playerName];
      if (hint) return hint;
      const cat = CATEGORIES.find((c) => c.id === gameState.categoryId);
      if (cat) {
        const hints = getHintsForWord(cat, gameState.secretWord);
        return hints[0] ?? cat.name;
      }
      return null;
    },
    [gameState]
  );

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

  const {
    shuffledOrder,
    currentPlayerIndex,
    firstPlayer,
    revealedPlayers,
    flippingToNextIndex,
  } = gameState;
  const currentPlayer = shuffledOrder[currentPlayerIndex];
  const nextPlayer =
    flippingToNextIndex !== null
      ? shuffledOrder[flippingToNextIndex]
      : currentPlayer;
  const currentRole = currentPlayer
    ? gameState.playerRoles[currentPlayer]
    : "civilian";
  // Durante el flip mostramos el frente (para no revelar el rol del siguiente) pero el reverso sigue mostrando el jugador actual
  const isRevealed =
    flippingToNextIndex !== null
      ? false
      : currentPlayer
        ? revealedPlayers.has(currentPlayer)
        : false;

  const handleReveal = () => {
    if (repeatCardForPlayer) {
      setRepeatCardRevealed(true);
    } else if (currentPlayer) {
      revealRole(currentPlayer);
    }
  };

  const handleHide = () => {
    if (repeatCardForPlayer) {
      clearRepeatCard();
      setRepeatCardRevealed(false);
    } else {
      hideRole();
    }
  };

  const playersInGame = gameState ? gameState.shuffledOrder : [];

  return (
    <div className="min-h-screen bg-background pb-8 safe-bottom relative">
      <div className="absolute inset-0 bg-gradient-mesh" aria-hidden />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(163,230,53,0.06)_0%,transparent_50%)]" aria-hidden />
      <div className="relative z-10 max-w-lg mx-auto px-4 pt-6 safe-top">
        <AnimatePresence mode="wait">
          {repeatCardForPlayer ? (
            <motion.div
              key="repeat-card"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pt-8 relative"
            >
              <button
                type="button"
                onClick={() => {
                  clearRepeatCard();
                  setRepeatCardRevealed(false);
                }}
                className="absolute top-0 right-0 text-slate-500 hover:text-slate-400 text-sm font-medium transition-colors py-1 px-2 -mr-1"
              >
                {t.finishShort}
              </button>
              <GameCard
                playerName={repeatCardForPlayer}
                isRevealed={repeatCardRevealed}
                role={
                  gameState.playerRoles[repeatCardForPlayer] ?? "civilian"
                }
                secretWord={gameState.secretWord}
                categoryNames={selectedCategories.map(
                  (c) => t.categories[c.id] ?? c.name
                )}
                showCategories={categoryVisibility}
                hintsEnabled={hintsEnabled}
                secretWordHint={getHintForPlayer(repeatCardForPlayer)}
                onReveal={handleReveal}
                onHide={handleHide}
              />
            </motion.div>
          ) : phase === "passing" || phase === "revealing" ? (
            <motion.div
              key="pass-reveal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pt-8 relative"
            >
              <button
                type="button"
                onClick={() => setShowExitConfirm(true)}
                className="absolute top-0 right-0 text-slate-500 hover:text-slate-400 text-sm font-medium transition-colors py-1 px-2 -mr-1"
              >
                {t.finishShort}
              </button>
              <GameCard
                playerName={nextPlayer}
                isRevealed={isRevealed}
                role={currentRole}
                secretWord={gameState.secretWord}
                categoryNames={selectedCategories.map(
                  (c) => t.categories[c.id] ?? c.name
                )}
                showCategories={categoryVisibility}
                hintsEnabled={hintsEnabled}
                secretWordHint={
                  nextPlayer ? getHintForPlayer(nextPlayer) : null
                }
                onReveal={handleReveal}
                onHide={handleHide}
                onFlipComplete={
                  flippingToNextIndex !== null ? completeFlipToNext : undefined
                }
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
              <div className="bg-surface rounded-2xl shadow-card border border-white/10 p-8 space-y-6">
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
                onClick={() => setShowExitConfirm(true)}
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
              <div className="bg-surface rounded-2xl shadow-card border border-white/10 p-8 text-center">
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

              <div className="space-y-3">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={revealAndFinish}
                  className="w-full py-4 rounded-2xl bg-primary text-gray-900 font-bold flex items-center justify-center gap-2 text-center"
                >
                  {t.revealWordAndImpostor}
                </motion.button>
                <div className="relative" ref={playerPickerRef}>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowPlayerPicker(!showPlayerPicker)}
                    className="w-full py-4 rounded-2xl bg-surface-light hover:bg-slate-500/50 text-slate-200 font-bold flex items-center justify-center gap-2 text-center border border-white/10"
                  >
                    {t.repeatCardView}
                    <ChevronDown
                      size={20}
                      className={`transition-transform ${
                        showPlayerPicker ? "rotate-180" : ""
                      }`}
                    />
                  </motion.button>
                  {showPlayerPicker && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute top-full left-0 right-0 mt-2 rounded-xl bg-surface border border-white/10 shadow-card overflow-hidden z-20"
                    >
                      <div className="p-3 border-b border-white/10">
                        <p className="text-sm font-medium text-slate-200">
                          {t.whoForgotCard}
                        </p>
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {playersInGame.map((name) => (
                          <button
                            key={name}
                            type="button"
                            onClick={() => {
                              showCardForPlayer(name);
                              setShowPlayerPicker(false);
                            }}
                            className="w-full px-4 py-3 text-left text-slate-200 hover:bg-white/10 transition-colors border-b border-white/5 last:border-0"
                          >
                            {name}
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPlayerPicker(false)}
                        className="w-full px-4 py-3 text-slate-500 hover:bg-white/5 text-sm flex items-center justify-center gap-2"
                      >
                        <X size={16} />
                        {t.close}
                      </button>
                    </motion.div>
                  )}
                </div>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={restartGame}
                  className="w-full py-4 rounded-2xl bg-surface-light hover:bg-slate-500/50 text-slate-200 font-bold flex items-center justify-center gap-2 text-center border border-white/10"
                >
                  {t.repeatGame}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowExitConfirm(true)}
                  className="w-full py-4 rounded-2xl bg-surface-light hover:bg-slate-500/50 text-slate-200 font-bold flex items-center justify-center gap-2 text-center border border-white/10"
                >
                  {t.finishGameGoHome}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de confirmación al salir */}
        <AnimatePresence>
          {showExitConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowExitConfirm(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-surface rounded-2xl shadow-card border border-white/15 p-6 max-w-sm w-full"
              >
                <p className="text-lg font-semibold text-slate-100 text-center mb-6">
                  {t.exitConfirmTitle}
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowExitConfirm(false)}
                    className="flex-1 py-3 rounded-xl bg-surface-light hover:bg-slate-500/50 text-slate-200 font-bold transition-colors"
                  >
                    {t.exitConfirmNo}
                  </button>
                  <button
                    type="button"
                    onClick={confirmExit}
                    className="flex-1 py-3 rounded-xl bg-primary text-gray-900 font-bold transition-colors hover:opacity-90"
                  >
                    {t.exitConfirmYes}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
