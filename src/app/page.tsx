"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PlayerInputList } from "@/components/PlayerInputList";
import { CategorySelector } from "@/components/CategorySelector";
import { LanguageSelector } from "@/components/LanguageSelector";
import { HowToPlay } from "@/components/HowToPlay";
import { SeoContent } from "@/components/SeoContent";
import { GameSettingsPanel } from "@/components/GameSettingsPanel";
import { OnboardingTutorial } from "@/components/OnboardingTutorial";
import { ChangelogModal } from "@/components/ChangelogModal";
import { ImpostorHistoryBadge } from "@/components/ImpostorHistoryBadge";
import { useGame } from "@/context/GameContext";
import { useTranslations } from "@/hooks/useTranslations";
import { validateSetup, type SetupIssue } from "@/lib/game-logic";
import {
  estimateDurationMinutes,
  isUnbalancedImpostorSetup,
  suggestImpostorCount,
} from "@/lib/game-settings";
import { getMaxImpostors, getValidPlayers } from "@/lib/players";
import { historyView } from "@/lib/round-memory";
import { track } from "@/lib/product-stubs";
import { Minus, Plus } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const {
    players,
    selectedCategories,
    impostorCount,
    setImpostorCount,
    startGame,
    settings,
    patchSettings,
    showOnboarding,
    dismissOnboarding,
    impostorHistory,
  } = useGame();
  const t = useTranslations();

  const validPlayers = getValidPlayers(players);
  const setupIssue = validateSetup({
    players,
    selectedCategories,
    impostorCount,
  });
  const canStart = setupIssue === null;

  const issueMessages: Record<SetupIssue, string> = {
    "not-enough-players": t.needMorePlayers,
    "no-category": t.needCategory,
    "too-many-impostors": t.tooManyImpostors,
  };

  const unbalanced = isUnbalancedImpostorSetup(
    validPlayers.length,
    impostorCount
  );
  const suggested = suggestImpostorCount(validPlayers.length);
  const duration = estimateDurationMinutes(
    validPlayers.length || 3,
    settings.discussSeconds
  );

  const hist = useMemo(
    () =>
      historyView(
        impostorHistory,
        validPlayers.map((p) => p.id)
      ).map((h) => ({
        ...h,
        name: validPlayers.find((p) => p.id === h.playerId)?.name ?? h.playerId,
      })),
    [impostorHistory, validPlayers]
  );

  const handleStart = () => {
    if (!canStart) return;
    track({ name: "setup_start" });
    startGame();
    router.push("/game");
  };

  const maxImpostors = getMaxImpostors(validPlayers.length);

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <OnboardingTutorial open={showOnboarding} onClose={dismissOnboarding} />
      <div className="absolute inset-0 bg-gradient-mesh" aria-hidden />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(163,230,53,0.08)_0%,transparent_50%)]"
        aria-hidden
      />

      <div className="flex-1 overflow-y-auto min-h-0 relative z-0">
        <div className="max-w-lg mx-auto px-5 pt-20 pb-8 safe-top">
          <header className="mb-10 mt-6">
            <div className="flex items-center justify-between gap-4 mb-2">
              <h1 className="text-3xl md:text-4xl font-black tracking-tight title-gradient drop-shadow-sm">
                {t.appTitle}
              </h1>
              <LanguageSelector />
            </div>
            <p className="text-slate-400 text-sm mt-1">{t.appTagline}</p>
            <p className="text-slate-500 text-xs mt-2">
              Estimado: ~{duration} min · Modo {settings.mode}
            </p>
            <div className="mt-3">
              <ChangelogModal />
            </div>
          </header>

          <motion.main
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="space-y-6"
          >
            {hist.some((h) => h.times > 0) ? (
              <ImpostorHistoryBadge history={hist} />
            ) : null}

            <div className="bg-surface/95 rounded-2xl shadow-card border border-white/10 p-6 backdrop-blur-sm">
              <PlayerInputList />
            </div>

            <div className="bg-surface/95 rounded-2xl shadow-card border border-white/10 p-6 backdrop-blur-sm">
              <h2 className="text-lg font-semibold text-slate-100 mb-2">
                {t.impostorCount}
              </h2>
              <p className="text-sm text-slate-400 mb-2">
                {t.impostorCountDescription}
              </p>
              <p className="text-xs text-primary mb-4">
                Sugerido para {validPlayers.length || "?"} jugadores:{" "}
                <button
                  type="button"
                  className="underline font-semibold"
                  onClick={() => setImpostorCount(suggested)}
                >
                  {suggested}
                </button>
              </p>
              {unbalanced ? (
                <p className="text-sm text-amber-300 mb-3" role="status">
                  Con 4 jugadores y 2 impostores el reparto se vuelve
                  predecible. Mejor 1 impostor.
                </p>
              ) : null}
              <div className="flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setImpostorCount(Math.max(1, impostorCount - 1))
                  }
                  disabled={impostorCount <= 1}
                  className="p-3 rounded-xl bg-surface-light hover:bg-slate-500/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-slate-200 min-h-[44px]"
                >
                  <Minus size={24} />
                </button>
                <span className="text-2xl font-bold text-primary min-w-[3rem] text-center">
                  {impostorCount}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setImpostorCount(
                      Math.min(maxImpostors, impostorCount + 1)
                    )
                  }
                  disabled={impostorCount >= maxImpostors}
                  className="p-3 rounded-xl bg-surface-light hover:bg-slate-500/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-slate-200 min-h-[44px]"
                >
                  <Plus size={24} />
                </button>
              </div>
            </div>

            <GameSettingsPanel settings={settings} onChange={patchSettings} />

            <div className="bg-surface/95 rounded-2xl shadow-card border border-white/10 p-6 backdrop-blur-sm">
              <CategorySelector />
            </div>

            <HowToPlay />
            <SeoContent />
          </motion.main>
          <div className="h-28" />
        </div>
      </div>

      <aside
        className="hidden md:flex fixed right-6 bottom-40 z-20 flex-col items-end gap-1.5 opacity-25 hover:opacity-45 transition-opacity duration-300 select-none"
        aria-label="Créditos"
      >
        <a
          href="https://www.imaginatuweb.cl"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-slate-500 hover:text-slate-400"
        >
          Página creada por Imaginatuweb.cl
        </a>
      </aside>

      <div className="flex-shrink-0 py-6 px-5 flex flex-col items-center gap-4 bg-background/90 backdrop-blur-md border-t border-white/15 safe-bottom relative z-10 min-h-[120px]">
        <div className="w-full max-w-lg flex flex-col items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleStart}
            disabled={!canStart}
            aria-describedby={setupIssue ? "start-game-hint" : undefined}
            className={`
              w-full py-4 rounded-2xl font-bold text-lg
              transition-all duration-200
              ${
                canStart
                  ? "bg-primary text-gray-900 shadow-glow hover:shadow-glow-lg"
                  : "bg-surface-light text-slate-400 cursor-not-allowed"
              }
            `}
          >
            {t.startGame}
          </motion.button>
          <p
            id="start-game-hint"
            role="status"
            aria-live="polite"
            className="text-sm text-amber-300 text-center min-h-[1.25rem]"
          >
            {setupIssue ? issueMessages[setupIssue] : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
