"use client";

import React, { useEffect, useState } from "react";
import { FolderPlus, Trash2 } from "lucide-react";
import {
  createEmptyCustomCategory,
  deleteCustomCategory,
  loadCustomCategories,
  saveCustomCategory,
  type CustomCategory,
} from "@/lib/custom-categories";

type CustomCategoryEditorProps = {
  onCategoriesChange?: (categories: CustomCategory[]) => void;
};

function parseWords(raw: string): string[] {
  return raw
    .split(/[\n,;]+/)
    .map((w) => w.trim())
    .filter(Boolean)
    .slice(0, 200);
}

export function CustomCategoryEditor({
  onCategoriesChange,
}: CustomCategoryEditorProps) {
  const [list, setList] = useState<CustomCategory[]>([]);
  const [name, setName] = useState("");
  const [wordsText, setWordsText] = useState("");

  useEffect(() => {
    setList(loadCustomCategories());
  }, []);

  const notify = (next: CustomCategory[]) => {
    setList(next);
    onCategoriesChange?.(next);
  };

  const handleSave = () => {
    const words = parseWords(wordsText);
    if (!name.trim() || words.length === 0) return;
    const base = createEmptyCustomCategory(name);
    const category: CustomCategory = { ...base, words };
    notify(saveCustomCategory(category));
    setName("");
    setWordsText("");
  };

  const handleDelete = (id: string) => {
    notify(deleteCustomCategory(id));
  };

  return (
    <div className="w-full rounded-2xl bg-surface border border-white/10 p-5 space-y-4 shadow-card">
      <div className="flex items-center gap-2 text-slate-200 font-semibold">
        <FolderPlus size={18} className="text-primary" aria-hidden="true" />
        Categorías personalizadas
      </div>

      <div className="space-y-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre de la categoría"
          maxLength={60}
          className="w-full rounded-xl bg-surface-light border border-white/10 px-3 py-2.5 text-slate-100 text-sm placeholder:text-slate-500 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <textarea
          value={wordsText}
          onChange={(e) => setWordsText(e.target.value)}
          placeholder="Palabras separadas por coma o salto de línea"
          rows={4}
          className="w-full rounded-xl bg-surface-light border border-white/10 px-3 py-2.5 text-slate-100 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y"
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={!name.trim() || parseWords(wordsText).length === 0}
          className="w-full py-3 rounded-xl bg-primary text-gray-900 font-bold min-h-[48px] disabled:opacity-40"
        >
          Guardar categoría
        </button>
      </div>

      {list.length > 0 && (
        <ul className="space-y-2">
          {list.map((cat) => (
            <li
              key={cat.id}
              className="flex items-center gap-2 rounded-xl bg-surface-light border border-white/5 px-3 py-2"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-100 truncate">
                  {cat.icon} {cat.name}
                </p>
                <p className="text-[11px] text-slate-500">
                  {cat.words.length} palabras
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(cat.id)}
                aria-label={`Eliminar ${cat.name}`}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 min-w-[40px] min-h-[40px] flex items-center justify-center"
              >
                <Trash2 size={16} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
