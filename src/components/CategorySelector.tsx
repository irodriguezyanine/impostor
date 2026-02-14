"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lightbulb, LightbulbOff } from "lucide-react";
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
  const {
    selectedCategories,
    toggleCategory,
    categoryVisibility,
    toggleCategoryVisibility,
    hintsEnabled,
    toggleHints,
  } = useGame();
  const t = useTranslations();
  const [tooltipCategory, setTooltipCategory] = useState<string | null>(null);
  const tooltipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCategoryClick = useCallback(
    (category: Category) => {
      if (tooltipTimerRef.current) {
        clearTimeout(tooltipTimerRef.current);
      }
      toggleCategory(category);
      setTooltipCategory(category.id);
      tooltipTimerRef.current = setTimeout(() => {
        setTooltipCategory(null);
        tooltipTimerRef.current = null;
      }, 2500);
    },
    [toggleCategory]
  );

  useEffect(
    () => () => {
      if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
    },
    []
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold text-slate-100 flex-1">
          {t.categorySelection}
        </h2>
        <motion.button
          type="button"
          onClick={toggleCategoryVisibility}
          whileTap={{ scale: 0.95 }}
          title={categoryVisibility ? t.hideCategory : t.showCategory}
          className={`p-2 rounded-lg transition-colors ${
            categoryVisibility
              ? "text-primary hover:bg-primary/20"
              : "text-slate-500 hover:bg-slate-500/20 hover:text-slate-400"
          }`}
        >
          {categoryVisibility ? (
            <Eye size={22} strokeWidth={2} />
          ) : (
            <EyeOff size={22} />
          )}
        </motion.button>
        <motion.button
          type="button"
          onClick={toggleHints}
          whileTap={{ scale: 0.95 }}
          title={hintsEnabled ? t.disableHints : t.enableHints}
          className={`p-2 rounded-lg transition-colors ${
            hintsEnabled
              ? "text-primary hover:bg-primary/20"
              : "text-slate-500 hover:bg-slate-500/20 hover:text-slate-400"
          }`}
        >
          {hintsEnabled ? (
            <Lightbulb size={22} strokeWidth={2} />
          ) : (
            <LightbulbOff size={22} />
          )}
        </motion.button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map((category) => {
          const isSelected = selectedCategories.some((c) => c.id === category.id);
          const displayName = getCategoryDisplayName(category, t);
          const showTooltipTap = tooltipCategory === category.id;

          return (
            <div key={category.id} className="group relative">
              <motion.button
                type="button"
                onClick={() => handleCategoryClick(category)}
                whileTap={{ scale: 0.98 }}
                title={displayName}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl
                  transition-all duration-200 text-left
                  border
                  ${
                    isSelected
                      ? "bg-primary border-primary-dark shadow-glow text-gray-900 ring-2 ring-primary/30"
                      : "bg-surface-light border-white/10 hover:border-white/20 hover:shadow-sm text-slate-200"
                  }
                `}
              >
                {category.iconImage ? (
                  <img
                    src={category.iconImage}
                    alt=""
                    className="w-8 h-8 object-contain flex-shrink-0 rounded"
                  />
                ) : (
                  <span className="text-2xl flex-shrink-0">{category.icon}</span>
                )}
                <span
                  className={`text-sm font-medium truncate ${
                    isSelected ? "text-gray-900" : "text-slate-200"
                  }`}
                >
                  {displayName}
                </span>
              </motion.button>
              <div
                role="tooltip"
                className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg pointer-events-none whitespace-nowrap z-50 shadow-card border border-white/10 transition-opacity duration-200 ${
                  showTooltipTap
                    ? "opacity-100 visible"
                    : "opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible"
                }`}
              >
                {displayName}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
