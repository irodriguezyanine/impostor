"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { GameCard } from "@/components/GameCard";
import { ExitConfirmModal } from "@/components/ExitConfirmModal";
import { DiscussionPanel } from "@/components/DiscussionPanel";
import { ClueRoundPanel } from "@/components/ClueRoundPanel";
import { VotingPanel } from "@/components/VotingPanel";
import { LastWordPanel } from "@/components/LastWordPanel";
import { RoundResultPanel } from "@/components/RoundResultPanel";
import { NightScoreboard } from "@/components/NightScoreboard";
import { ImpostorHistoryBadge } from "@/components/ImpostorHistoryBadge";
import { ReportWordButton } from "@/components/ReportWordButton";
import { SurveyPrompt } from "@/components/SurveyPrompt";
import { useGame } from "@/context/GameContext";
import { useTranslations } from "@/hooks/useTranslations";
import { ChevronDown, X } from "lucide-react";
import { CATEGORIES, getHintsForWord } from "@/data/categories";
import type { Player } from "@/lib/players";
import { historyView } from "@/lib/round-memory";
import { feedbackPass, feedbackReveal, feedbackVote, feedbackWin } from "@/lib/feedback";
import { leaderboard } from "@/lib/scoring";

export default function GamePage() {
  const router = useRouter();
  const {
    phase,
    gameState,
    selectedCategories,
    categoryVisibility,
    hintsEnabled,
    repeatCardForPlayerId,
    isHydrated,
    settings,
    ballots,
    voteAccusedId,
    lastWordPlayerId,
    civiliansWon,
    nightBoard,
    impostorHistory,
    players,
    finishGame,
    revealAndFinish,
    restartGame,
    revealRole,
    coverRole,
    hideRole,
    completeFlipToNext,
    showCardForPlayer,
    clearRepeatCard,
    nextSpeaker,
    beginVoting,
    skipToReveal,
    setWrittenClue,
    finishClueRound,
    castVote,
    resolveVotes,
    finishLastWord,
  } = useGame();
  const t = useTranslations();
  const [showPlayerPicker, setShowPlayerPicker] = useState(false);
  const [repeatCardRevealed, setRepeatCardRevealed] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);
  const playerPickerRef = useRef<HTMLDivElement>(null);
  const historyGuardInstalled = useRef(false);

  const confirmExit = useCallback(() => {
    finishGame();
    router.push("/");
  }, [finishGame, router]);

  const handleRequestExit = useCallback(() => {
    setShowExitModal(true);
  }, []);

  const handleConfirmExit = useCallback(() => {
    setShowExitModal(false);
    setShowSurvey(true);
    confirmExit();
  }, [confirmExit]);

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
    if (!isHydrated) return;
    if (phase === "setup" || !gameState) {
      router.replace("/");
    }
  }, [isHydrated, phase, gameState, router]);

  useEffect(() => {
    if (!isHydrated || !gameState || historyGuardInstalled.current) return;
    historyGuardInstalled.current = true;

    const marker = { fromGame: true };
    history.pushState(marker, "", window.location.href);

    const handlePopState = () => {
      history.pushState(marker, "", window.location.href);
      setShowExitModal(true);
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      historyGuardInstalled.current = false;
    };
  }, [isHydrated, gameState]);

  useEffect(() => {
    if (phase === "result") {
      feedbackWin(settings.soundEnabled, settings.hapticsEnabled);
    }
  }, [phase, settings.soundEnabled, settings.hapticsEnabled]);

  const getHintForPlayer = useCallback(
    (playerId: string): string | null => {
      if (!gameState || gameState.playerRoles[playerId] !== "impostor") {
        return null;
      }
      const hint = gameState.impostorHints?.[playerId];
      if (hint) return hint;

      let cat = CATEGORIES.find((c) => c.id === gameState.categoryId);
      if (!cat) {
        cat = CATEGORIES.find((c) => c.words.includes(gameState.secretWord));
      }
      if (cat) {
        const hints = getHintsForWord(cat, gameState.secretWord);
        return hints[0] ?? cat.name;
      }
      return null;
    },
    [gameState]
  );

  if (!isHydrated || !gameState) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-slate-300"
          role="status"
          aria-live="polite"
        >
          {t.loading}
        </motion.div>
      </div>
    );
  }

  const {
    shuffledOrder,
    currentPlayerIndex,
    firstPlayerId,
    revealedPlayers,
    flippingToNextIndex,
    speakOrder,
    speakIndex,
    discussEndsAt,
  } = gameState;

  const currentPlayer: Player | undefined = shuffledOrder[currentPlayerIndex];
  const nextPlayer: Player | undefined =
    flippingToNextIndex !== null
      ? shuffledOrder[flippingToNextIndex]
      : currentPlayer;

  const repeatPlayer = repeatCardForPlayerId
    ? shuffledOrder.find((player) => player.id === repeatCardForPlayerId)
    : undefined;

  const currentRole = currentPlayer
    ? gameState.playerRoles[currentPlayer.id]
    : "civilian";

  const isRevealed =
    flippingToNextIndex !== null
      ? false
      : currentPlayer
        ? revealedPlayers.has(currentPlayer.id)
        : false;

  const firstPlayerName =
    shuffledOrder.find((player) => player.id === firstPlayerId)?.name ?? "";

  const impostors = shuffledOrder.filter(
    (player) => gameState.playerRoles[player.id] === "impostor"
  );

  const categoryNames = selectedCategories.map(
    (c) => t.categories[c.id] ?? c.name
  );

  const handleReveal = () => {
    feedbackReveal(settings.soundEnabled, settings.hapticsEnabled);
    if (repeatPlayer) {
      setRepeatCardRevealed(true);
    } else if (currentPlayer) {
      revealRole(currentPlayer.id);
    }
  };

  const handleCover = () => {
    if (repeatPlayer) {
      setRepeatCardRevealed(false);
    } else {
      coverRole();
    }
  };

  const handleHide = () => {
    feedbackPass(settings.soundEnabled, settings.hapticsEnabled);
    if (repeatPlayer) {
      clearRepeatCard();
      setRepeatCardRevealed(false);
    } else {
      hideRole();
    }
  };

  const nameOf = (id: string | null) =>
    id
      ? shuffledOrder.find((p) => p.id === id)?.name ??
        players.find((p) => p.id === id)?.name ??
        null
      : null;

  const scoreRows = leaderboard(nightBoard).map((row) => ({
    ...row,
    name: nameOf(row.playerId) ?? row.playerId,
  }));

  const hist = historyView(
    impostorHistory,
    shuffledOrder.map((p) => p.id)
  ).map((h) => ({
    ...h,
    name: nameOf(h.playerId) ?? h.playerId,
  }));

  const liveStatus = repeatPlayer
    ? `${t.passTo} ${repeatPlayer.name}`
    : phase === "ended" || phase === "result"
      ? `${t.theSecretWordWas} ${gameState.secretWord}`
      : phase === "discussing"
        ? `${t.firstPlayer} ${firstPlayerName}`
        : nextPlayer
          ? `${t.passTo} ${nextPlayer.name}`
          : "";

  const cardFor = (player: Player, revealed: boolean) => (
    <GameCard
      playerName={player.name}
      isRevealed={revealed}
      role={gameState.playerRoles[player.id] ?? "civilian"}
      secretWord={gameState.secretWord}
      closeWord={gameState.closeWords?.[player.id] ?? null}
      categoryNames={categoryNames}
      showCategories={categoryVisibility}
      hintsEnabled={hintsEnabled}
      secretWordHint={getHintForPlayer(player.id)}
      onReveal={handleReveal}
      onCover={handleCover}
      onHide={handleHide}
    />
  );

  return (
    <>
      <ExitConfirmModal
        isOpen={showExitModal}
        title={t.exitConfirmTitle}
        confirmLabel={t.exitConfirmYes}
        cancelLabel={t.exitConfirmNo}
        onConfirm={handleConfirmExit}
        onCancel={() => setShowExitModal(false)}
      />
      <SurveyPrompt open={showSurvey} onClose={() => setShowSurvey(false)} />
      <div className="min-h-screen bg-background pb-8 safe-bottom relative">
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {liveStatus}
        </div>
        <div className="absolute inset-0 bg-gradient-mesh" aria-hidden />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(163,230,53,0.06)_0%,transparent_50%)]"
          aria-hidden
        />
        <div className="relative z-10 max-w-lg mx-auto px-4 pt-6 safe-top space-y-4">
          <ImpostorHistoryBadge history={hist} />
          <AnimatePresence mode="wait">
            {repeatPlayer ? (
              <motion.div
                key="repeat-card"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pt-4 relative min-h-[452px]"
              >
                <button
                  type="button"
                  onClick={() => {
                    clearRepeatCard();
                    setRepeatCardRevealed(false);
                  }}
                  className="absolute top-0 right-0 text-slate-400 hover:text-slate-200 text-sm font-medium transition-colors py-2 px-3 -mr-1 min-h-[44px]"
                >
                  {t.finishShort}
                </button>
                {cardFor(repeatPlayer, repeatCardRevealed)}
              </motion.div>
            ) : phase === "passing" || phase === "revealing" ? (
              <motion.div
                key="pass-reveal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pt-4 relative min-h-[452px]"
              >
                <button
                  type="button"
                  onClick={handleRequestExit}
                  className="absolute top-0 right-0 text-slate-400 hover:text-slate-200 text-sm font-medium transition-colors py-2 px-3 -mr-1 min-h-[44px] z-10"
                >
                  {t.finishShort}
                </button>
                {settings.antiPeekCover &&
                phase === "passing" &&
                !isRevealed ? (
                  <p className="text-center text-xs text-slate-400 mb-2">
                    Pasa el teléfono sin mirar · tapa la pantalla
                  </p>
                ) : null}
                <GameCard
                  playerName={nextPlayer?.name ?? ""}
                  isRevealed={isRevealed}
                  role={currentRole}
                  secretWord={gameState.secretWord}
                  closeWord={
                    currentPlayer
                      ? gameState.closeWords?.[currentPlayer.id] ?? null
                      : null
                  }
                  categoryNames={categoryNames}
                  showCategories={categoryVisibility}
                  hintsEnabled={hintsEnabled}
                  secretWordHint={
                    currentPlayer
                      ? getHintForPlayer(currentPlayer.id)
                      : null
                  }
                  onReveal={handleReveal}
                  onCover={handleCover}
                  onHide={handleHide}
                  onFlipComplete={
                    flippingToNextIndex !== null
                      ? completeFlipToNext
                      : undefined
                  }
                />
                <div className="mt-3 flex justify-center">
                  <ReportWordButton
                    word={gameState.secretWord}
                    categoryId={gameState.categoryId}
                  />
                </div>
              </motion.div>
            ) : phase === "clueRound" ? (
              <motion.div key="clues" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <ClueRoundPanel
                  players={shuffledOrder}
                  clues={gameState.writtenClues}
                  onSetClue={setWrittenClue}
                  onFinish={finishClueRound}
                />
              </motion.div>
            ) : phase === "discussing" ? (
              <motion.div
                key="discuss"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <DiscussionPanel
                  speakers={speakOrder}
                  speakIndex={speakIndex}
                  endsAt={discussEndsAt}
                  turnSeconds={settings.turnSeconds}
                  enableTurnOrder={settings.enableTurnOrder}
                  onNextSpeaker={nextSpeaker}
                  onStartVoting={() => {
                    feedbackVote(settings.soundEnabled, settings.hapticsEnabled);
                    beginVoting();
                  }}
                  onSkipReveal={skipToReveal}
                />
                <div className="relative" ref={playerPickerRef}>
                  <button
                    type="button"
                    onClick={() => setShowPlayerPicker(!showPlayerPicker)}
                    className="w-full py-3 rounded-xl bg-surface-light text-slate-100 border border-white/10 min-h-[44px] flex items-center justify-center gap-2"
                  >
                    {t.repeatCardView}
                    <ChevronDown size={18} aria-hidden />
                  </button>
                  {showPlayerPicker && (
                    <div
                      role="listbox"
                      className="absolute top-full left-0 right-0 mt-2 rounded-xl bg-surface border border-white/10 z-20 overflow-hidden"
                    >
                      {shuffledOrder.map((player) => (
                        <button
                          key={player.id}
                          type="button"
                          role="option"
                          aria-selected={false}
                          onClick={() => {
                            showCardForPlayer(player.id);
                            setShowPlayerPicker(false);
                            setRepeatCardRevealed(false);
                          }}
                          className="w-full px-4 py-3 text-left text-slate-100 hover:bg-white/10 min-h-[44px]"
                        >
                          {player.name}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setShowPlayerPicker(false)}
                        className="w-full px-4 py-3 text-slate-300 flex items-center justify-center gap-2"
                      >
                        <X size={16} aria-hidden />
                        {t.close}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : phase === "voting" ? (
              <motion.div key="vote" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <VotingPanel
                  players={shuffledOrder}
                  ballots={ballots}
                  onCast={castVote}
                  onResolve={() => {
                    feedbackVote(settings.soundEnabled, settings.hapticsEnabled);
                    resolveVotes();
                  }}
                />
              </motion.div>
            ) : phase === "lastWord" ? (
              <motion.div key="last" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <LastWordPanel
                  playerName={nameOf(lastWordPlayerId) ?? "Acusado"}
                  onDone={finishLastWord}
                />
              </motion.div>
            ) : phase === "result" ? (
              <motion.div
                key="result"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <RoundResultPanel
                  civiliansWon={civiliansWon}
                  accusedName={nameOf(voteAccusedId)}
                  impostorNames={impostors.map((p) => p.name)}
                  secretWord={gameState.secretWord}
                  onRevealDetails={revealAndFinish}
                  onNextRound={restartGame}
                  onHome={handleRequestExit}
                />
                {settings.enableScoring ? (
                  <NightScoreboard rows={scoreRows} />
                ) : null}
              </motion.div>
            ) : phase === "ended" ? (
              <motion.div
                key="ended"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 pt-4"
              >
                <div className="bg-surface rounded-2xl shadow-card border border-white/10 p-8 space-y-6">
                  <h2 className="text-xl font-bold text-slate-100 text-center">
                    {t.theSecretWordWas}
                  </h2>
                  <p className="text-3xl font-bold text-primary text-center break-words">
                    {gameState.secretWord}
                  </p>
                  <div className="border-t border-white/10 pt-6">
                    <h2 className="text-lg font-semibold text-red-300 mb-3 text-center">
                      {t.impostorsWere}
                    </h2>
                    <div className="flex flex-wrap justify-center gap-2">
                      {impostors.map((player) => (
                        <span
                          key={player.id}
                          className="px-4 py-2 rounded-xl bg-red-900/50 text-red-200 font-bold"
                        >
                          {player.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-center text-xs text-slate-400">
                    Semilla: {gameState.roundSeed}
                  </p>
                </div>
                {settings.enableScoring ? (
                  <NightScoreboard rows={scoreRows} />
                ) : null}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={restartGame}
                  className="w-full py-4 rounded-2xl bg-primary text-gray-900 font-bold min-h-[52px]"
                >
                  {t.repeatGame}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRequestExit}
                  className="w-full py-4 rounded-2xl bg-surface-light text-slate-100 font-bold border border-white/10 min-h-[52px]"
                >
                  {t.backToHome}
                </motion.button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
