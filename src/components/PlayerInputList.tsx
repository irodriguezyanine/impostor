"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Plus, X } from "lucide-react";
import { useGame } from "@/context/GameContext";
import { useTranslations } from "@/hooks/useTranslations";
import { MAX_NAME_LENGTH, MAX_PLAYERS, getDuplicateNameIds } from "@/lib/players";

export function PlayerInputList() {
  const { players, addPlayer, removePlayer, updatePlayer } = useGame();
  const t = useTranslations();
  const duplicateIds = React.useMemo(
    () => getDuplicateNameIds(players),
    [players]
  );

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-slate-100">{t.players}</h2>
      <div className="flex flex-col gap-2">
        <AnimatePresence mode="popLayout">
          {players.map((player, index) => {
            const isDuplicate = duplicateIds.has(player.id);
            const label = `${t.playerPlaceholder} ${index + 1}`;
            const warningId = `player-warning-${player.id}`;

            return (
              <motion.div
                key={player.id}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-1"
              >
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={player.name}
                    onChange={(e) => updatePlayer(player.id, e.target.value)}
                    placeholder={label}
                    aria-label={label}
                    aria-describedby={isDuplicate ? warningId : undefined}
                    autoComplete="off"
                    className={`flex-1 px-4 py-3 bg-surface-light rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface border transition-colors ${
                      isDuplicate
                        ? "border-amber-500/60"
                        : "border-white/5 focus:border-primary/30"
                    }`}
                    maxLength={MAX_NAME_LENGTH}
                  />
                  <button
                    type="button"
                    onClick={() => removePlayer(player.id)}
                    disabled={players.length <= 2}
                    className="p-3 rounded-xl bg-red-900/50 text-red-300 hover:bg-red-800/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                    aria-label={`${t.removePlayer}: ${player.name || label}`}
                  >
                    <X size={20} aria-hidden="true" />
                  </button>
                </div>
                {isDuplicate && (
                  <p
                    id={warningId}
                    className="flex items-center gap-1.5 text-xs text-amber-300 pl-1"
                  >
                    <AlertCircle size={13} aria-hidden="true" />
                    {t.duplicateNameWarning}
                  </p>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      <button
        type="button"
        onClick={() => addPlayer()}
        disabled={players.length >= MAX_PLAYERS}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-surface-light text-slate-300 hover:bg-slate-500/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium min-h-[44px]"
      >
        <Plus size={20} aria-hidden="true" />
        {t.addPlayer}
      </button>
    </div>
  );
}
