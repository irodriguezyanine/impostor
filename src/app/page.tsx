"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PlayerInputList } from "@/components/PlayerInputList";
import { CategorySelector } from "@/components/CategorySelector";
import { LanguageSelector } from "@/components/LanguageSelector";
import { HowToPlay } from "@/components/HowToPlay";
import { useGame } from "@/context/GameContext";
import { useTranslations } from "@/hooks/useTranslations";
import { Minus, Plus } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const {
    players,
    selectedCategories,
    impostorCount,
    setImpostorCount,
    startGame,
  } = useGame();
  const t = useTranslations();

  const validPlayers = players.filter((p) => p.trim() !== "");
  const canStart =
    validPlayers.length >= 3 &&
    selectedCategories.length > 0 &&
    validPlayers.length - impostorCount >= 2;

  const handleStart = () => {
    if (!canStart) return;
    startGame();
    router.push("/game");
  };

  const maxImpostors = Math.max(1, Math.min(3, validPlayers.length - 2));

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Fondo con gradiente y patrones sutiles */}
      <div className="absolute inset-0 bg-gradient-mesh" aria-hidden />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(163,230,53,0.08)_0%,transparent_50%)]" aria-hidden />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(30,41,59,0.6)_0%,transparent_50%)]" aria-hidden />

      <div className="flex-1 overflow-y-auto min-h-0 relative z-0">
        <div className="max-w-lg mx-auto px-5 pt-20 pb-8 safe-top">
          {/* Header con más espacio */}
          <header className="mb-10 mt-6">
            <div className="flex items-center justify-between gap-4 mb-2">
              <h1 className="text-3xl md:text-4xl font-black tracking-tight title-gradient drop-shadow-sm">
                {t.appTitle}
              </h1>
              <LanguageSelector />
            </div>
            <p className="text-slate-400 text-sm mt-1">
              {t.appTagline}
            </p>
          </header>

          <motion.main
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="space-y-6"
          >
            <div className="bg-surface/95 rounded-2xl shadow-card border border-white/10 p-6 backdrop-blur-sm transition-shadow duration-200 hover:shadow-card-hover">
              <PlayerInputList />
            </div>

            <div className="bg-surface/95 rounded-2xl shadow-card border border-white/10 p-6 backdrop-blur-sm transition-shadow duration-200 hover:shadow-card-hover">
              <h2 className="text-lg font-semibold text-slate-100 mb-4">
                {t.impostorCount}
              </h2>
              <p className="text-sm text-slate-400 mb-4">
                {t.impostorCountDescription}
              </p>
              <div className="flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setImpostorCount(Math.max(1, impostorCount - 1) as 1 | 2 | 3)
                  }
                  disabled={impostorCount <= 1}
                  className="p-3 rounded-xl bg-surface-light hover:bg-slate-500/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-slate-200"
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
                      Math.min(maxImpostors, impostorCount + 1) as 1 | 2 | 3
                    )
                  }
                  disabled={impostorCount >= maxImpostors}
                  className="p-3 rounded-xl bg-surface-light hover:bg-slate-500/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-slate-200"
                >
                  <Plus size={24} />
                </button>
              </div>
            </div>

            <div className="bg-surface/95 rounded-2xl shadow-card border border-white/10 p-6 backdrop-blur-sm transition-shadow duration-200 hover:shadow-card-hover">
              <CategorySelector />
            </div>

            {/* Botón ¿Cómo jugar? debajo de categorías */}
            <HowToPlay />
          </motion.main>
          <div className="h-28" />
        </div>
      </div>

      {/* Marca de agua y enlace crear categoría - sutiles, no interfieren */}
      <div
        className="fixed right-3 bottom-36 md:right-6 md:bottom-40 z-20 flex flex-col items-end gap-1.5 opacity-25 hover:opacity-45 transition-opacity duration-300 select-none"
        aria-label="Créditos y crear categoría"
      >
        <a
          href="https://www.imaginatuweb.cl"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] md:text-xs text-slate-500 hover:text-slate-400 transition-colors leading-tight"
        >
          Página creada por Imaginatuweb.cl
        </a>
        <a
          href="https://wa.me/56976488856?text=Quiero%20crear%20mi%20categoria%20por%20%2420.000"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] md:text-xs text-slate-500 hover:text-slate-400 transition-colors leading-tight"
        >
          Crea tu categoria acá
        </a>
      </div>

      <div className="flex-shrink-0 py-8 px-5 flex items-center justify-center bg-background/90 backdrop-blur-md border-t border-white/15 shadow-[0_-4px_24px_rgba(0,0,0,0.15)] safe-bottom relative z-10 min-h-[120px]">
        <div className="w-full max-w-lg flex justify-center">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleStart}
            disabled={!canStart}
            className={`
              w-full py-4 rounded-2xl font-bold text-lg
              transition-all duration-200
              ${
                canStart
                  ? "bg-primary text-gray-900 shadow-glow hover:shadow-glow-lg"
                  : "bg-surface-light text-slate-500 cursor-not-allowed"
              }
            `}
          >
            {t.startGame}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
