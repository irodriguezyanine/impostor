"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";
import { useGame } from "@/context/GameContext";
import { useTranslations } from "@/hooks/useTranslations";

export function PlayerInputList() {
  const { players, addPlayer, removePlayer, updatePlayer } = useGame();
  const t = useTranslations();

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-slate-100">{t.players}</h2>
      <div className="flex flex-col gap-2">
        <AnimatePresence mode="popLayout">
          {players.map((player, index) => (
            <motion.div
              key={index}
              layout
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex gap-2 items-center"
            >
              <input
                type="text"
                value={player}
                onChange={(e) => updatePlayer(index, e.target.value)}
                placeholder={`${t.playerPlaceholder} ${index + 1}`}
                className="flex-1 px-4 py-3 bg-surface-light rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface"
                maxLength={30}
              />
              <button
                type="button"
                onClick={() => removePlayer(index)}
                disabled={players.length <= 2}
                className="p-3 rounded-xl bg-red-900/50 text-red-400 hover:bg-red-800/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label={t.removePlayer}
              >
                <X size={20} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <button
        type="button"
        onClick={() => addPlayer()}
        disabled={players.length >= 20}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-surface-light text-slate-300 hover:bg-slate-500/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
      >
        <Plus size={20} />
        {t.addPlayer}
      </button>
    </div>
  );
}
