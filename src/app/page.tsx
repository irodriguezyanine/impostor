"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PlayerInputList } from "@/components/PlayerInputList";
import { CategorySelector } from "@/components/CategorySelector";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useGame } from "@/context/GameContext";
import { useTranslations } from "@/hooks/useTranslations";
import { Minus, Plus } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const {
    players,
    selectedCategory,
    impostorCount,
    setImpostorCount,
    startGame,
  } = useGame();
  const t = useTranslations();

  const validPlayers = players.filter((p) => p.trim() !== "");
  const canStart =
    validPlayers.length >= 3 &&
    selectedCategory &&
    validPlayers.length - impostorCount >= 2;

  const handleStart = () => {
    if (!canStart) return;
    startGame();
    router.push("/game");
  };

  const maxImpostors = Math.max(1, Math.min(3, validPlayers.length - 2));

  return (
    <div className="min-h-screen bg-background pb-32 safe-bottom">
      <div className="max-w-lg mx-auto px-4 pt-6 safe-top">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{t.appTitle}</h1>
          <LanguageSelector />
        </header>

        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          <div className="bg-white rounded-3xl shadow-sm p-6">
            <PlayerInputList />
          </div>

          <div className="bg-white rounded-3xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {t.impostorCount}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {t.impostorCountDescription}
            </p>
            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() =>
                  setImpostorCount(Math.max(1, impostorCount - 1) as 1 | 2 | 3)
                }
                disabled={impostorCount <= 1}
                className="p-3 rounded-2xl bg-gray-200 hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Minus size={24} />
              </button>
              <span className="text-2xl font-bold text-gray-900 min-w-[3rem] text-center">
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
                className="p-3 rounded-2xl bg-gray-200 hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Plus size={24} />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm p-6">
            <CategorySelector />
          </div>
        </motion.main>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm safe-bottom">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleStart}
          disabled={!canStart}
          className={`
            w-full max-w-lg mx-auto block py-4 rounded-2xl font-bold text-lg
            transition-all duration-200
            ${
              canStart
                ? "bg-primary text-gray-900 shadow-md hover:shadow-lg"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }
          `}
        >
          {t.startGame}
        </motion.button>
      </div>
    </div>
  );
}
