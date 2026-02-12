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
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-800">
        {t.categorySelection}
      </h2>
      <div className="flex flex-wrap gap-3">
        {CATEGORIES.map((category) => {
          const isSelected = selectedCategories.some((c) => c.id === category.id);
          const displayName = getCategoryDisplayName(category, t);

          return (
            <motion.button
              key={category.id}
              type="button"
              onClick={() => toggleCategory(category)}
              whileTap={{ scale: 0.97 }}
              className={`
                flex-shrink-0 flex flex-col items-center gap-2 p-4 min-w-[100px] rounded-2xl
                border-2 transition-all duration-200
                ${
                  isSelected
                    ? "bg-primary border-4 border-lime-600 shadow-md"
                    : "bg-white border-2 border-gray-200 hover:border-gray-300 shadow-sm"
                }
              `}
            >
              <span className="text-3xl">{category.icon}</span>
              <span
                className={`text-sm font-medium text-center ${
                  isSelected ? "text-gray-900" : "text-gray-700"
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
