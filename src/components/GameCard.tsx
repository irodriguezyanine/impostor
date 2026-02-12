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
  onReveal: () => void;
  onHide: () => void;
};

export function GameCard({
  playerName,
  isRevealed,
  role,
  secretWord = "",
  onReveal,
  onHide,
}: GameCardProps) {
  const t = useTranslations();

  return (
    <div className="w-full max-w-md mx-auto perspective-1000">
      <motion.div
        className="relative w-full min-h-[320px] preserve-3d"
        initial={false}
        animate={{ rotateY: isRevealed ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
      >
        {/* Frente: Pásale a X */}
        <motion.div
          className="absolute inset-0 w-full h-full backface-hidden rounded-3xl bg-white shadow-sm p-8 flex flex-col justify-center"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="text-center space-y-6">
            <p className="text-gray-600 text-lg">
              {t.passTo}{" "}
              <span className="font-bold text-gray-900">{playerName}</span>
            </p>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={onReveal}
              className="w-full py-4 px-6 rounded-2xl bg-primary text-gray-900 font-bold text-lg flex items-center justify-center gap-2"
            >
              <Eye size={24} />
              {t.revealRole}
            </motion.button>
          </div>
        </motion.div>

        {/* Reverso: Rol revelado */}
        <motion.div
          className="absolute inset-0 w-full h-full backface-hidden rounded-3xl bg-white shadow-sm p-8 flex flex-col justify-center"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="text-center space-y-6">
            {role === "civilian" ? (
              <>
                <p className="text-gray-600 text-base">{t.civilianReveal}</p>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-bold text-gray-900 break-words"
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
                  <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                    <UserX size={40} className="text-red-600" />
                  </div>
                </motion.div>
                <p className="text-lg font-bold text-red-600">
                  {t.impostorReveal}
                </p>
                <p className="text-gray-600">{t.impostorDescription}</p>
              </>
            )}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={onHide}
              className="w-full py-4 px-6 rounded-2xl bg-gray-200 text-gray-800 font-bold flex items-center justify-center gap-2"
            >
              <EyeOff size={20} />
              {t.hideReady}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
