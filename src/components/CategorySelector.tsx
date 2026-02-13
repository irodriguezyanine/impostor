"use client";

import React from "react";
import { motion } from "framer-motion";
import type { Category } from "@/data/categories";
import { CATEGORIES } from "@/data/categories";
import { useGame } from "@/context/GameContext";
import { useTranslations } from "@/hooks/useTranslations";

function getCategoryDisplayName(
  category: Category,
  t: ReturnType<typeof useTranslations>
): string {
  return t.categories[category.id] ?? category.name;
}

export function CategorySelector() {
  const { selectedCategories, toggleCategory } = useGame();
  const t = useTranslations();

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-100">
        {t.categorySelection}
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map((category) => {
          const isSelected = selectedCategories.some((c) => c.id === category.id);
          const displayName = getCategoryDisplayName(category, t);

          return (
            <motion.button
              key={category.id}
              type="button"
              onClick={() => toggleCategory(category)}
              whileTap={{ scale: 0.98 }}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl
                transition-all duration-200 text-left
                border
                ${
                  isSelected
                    ? "bg-primary border-primary-dark shadow-glow text-gray-900"
                    : "bg-surface-light border-white/10 hover:border-white/20 text-slate-200"
                }
              `}
            >
              <span className="text-2xl flex-shrink-0">{category.icon}</span>
              <span
                className={`text-sm font-medium truncate ${
                  isSelected ? "text-gray-900" : "text-slate-200"
                }`}
              >
                {displayName}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
