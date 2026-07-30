"use client";

import React, { useEffect, useState } from "react";
import { Bookmark, Download, Trash2, LayoutTemplate } from "lucide-react";
import type { Player } from "@/lib/players";
import {
  TABLE_TEMPLATES,
  deleteSavedTable,
  loadSavedTables,
  parsePlayersFromText,
  saveTable,
  type SavedTable,
} from "@/lib/tables";

type SavedTablesPanelProps = {
  players: Player[];
  categoryIds: string[];
  impostorCount: number;
  onLoad: (table: SavedTable) => void;
  onImportNames: (names: string[]) => void;
};

export function SavedTablesPanel({
  players,
  categoryIds,
  impostorCount,
  onLoad,
  onImportNames,
}: SavedTablesPanelProps) {
  const [saved, setSaved] = useState<SavedTable[]>([]);
  const [tableName, setTableName] = useState("");
  const [importText, setImportText] = useState("");

  useEffect(() => {
    setSaved(loadSavedTables());
  }, []);

  const handleSave = () => {
    const name = tableName.trim() || `Mesa ${new Date().toLocaleDateString("es")}`;
    const table: SavedTable = {
      id: `table-${Date.now()}`,
      name,
      players: players.map((p) => ({ ...p })),
      categoryIds: [...categoryIds],
      impostorCount,
      updatedAt: Date.now(),
    };
    setSaved(saveTable(table));
    setTableName("");
  };

  const handleDelete = (id: string) => {
    setSaved(deleteSavedTable(id));
  };

  const handleImport = () => {
    const names = parsePlayersFromText(importText);
    if (names.length === 0) return;
    onImportNames(names);
    setImportText("");
  };

  return (
    <div className="w-full rounded-2xl bg-surface border border-white/10 p-5 space-y-5 shadow-card">
      <div className="flex items-center gap-2 text-slate-200 font-semibold">
        <Bookmark size={18} className="text-primary" aria-hidden="true" />
        Mesas guardadas
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={tableName}
          onChange={(e) => setTableName(e.target.value)}
          placeholder="Nombre de la mesa"
          className="flex-1 rounded-xl bg-surface-light border border-white/10 px-3 py-2.5 text-slate-100 text-sm placeholder:text-slate-500 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={players.filter((p) => p.name.trim()).length < 3}
          className="px-4 rounded-xl bg-primary text-gray-900 font-bold text-sm min-h-[44px] disabled:opacity-40"
        >
          Guardar
        </button>
      </div>

      {saved.length > 0 && (
        <ul className="space-y-2">
          {saved.map((t) => (
            <li
              key={t.id}
              className="flex items-center gap-2 rounded-xl bg-surface-light border border-white/5 px-3 py-2"
            >
              <button
                type="button"
                onClick={() => onLoad(t)}
                className="flex-1 text-left min-w-0"
              >
                <p className="font-medium text-slate-100 text-sm truncate">
                  {t.name}
                </p>
                <p className="text-[11px] text-slate-500">
                  {t.players.length} jugadores · {t.impostorCount} impostor
                  {t.impostorCount === 1 ? "" : "es"}
                </p>
              </button>
              <button
                type="button"
                onClick={() => handleDelete(t.id)}
                aria-label={`Eliminar ${t.name}`}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 min-w-[40px] min-h-[40px] flex items-center justify-center"
              >
                <Trash2 size={16} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <LayoutTemplate size={16} aria-hidden="true" />
          Plantillas
        </div>
        <ul className="grid gap-2 sm:grid-cols-2">
          {TABLE_TEMPLATES.map((tpl) => (
            <li key={tpl.id}>
              <button
                type="button"
                onClick={() =>
                  onLoad({
                    id: `tpl-${tpl.id}-${Date.now()}`,
                    name: tpl.name,
                    players: Array.from({ length: tpl.playerSlots }, (_, i) => ({
                      id: `p-${i}`,
                      name: "",
                    })),
                    categoryIds: [...tpl.categoryTags],
                    impostorCount: tpl.impostorCount,
                    updatedAt: Date.now(),
                  })
                }
                className="w-full text-left rounded-xl border border-white/10 bg-surface-light/50 px-3 py-2.5 hover:border-primary/30 min-h-[56px]"
              >
                <p className="text-sm font-semibold text-slate-100">
                  {tpl.name}
                </p>
                <p className="text-[11px] text-slate-500 line-clamp-2">
                  {tpl.description}
                </p>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-slate-400 flex items-center gap-2">
          <Download size={16} aria-hidden="true" />
          Importar nombres
        </label>
        <textarea
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder="Ana, Bea, Carlos… o uno por línea"
          rows={3}
          className="w-full rounded-xl bg-surface-light border border-white/10 px-3 py-2.5 text-slate-100 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y"
        />
        <button
          type="button"
          onClick={handleImport}
          disabled={!importText.trim()}
          className="w-full py-2.5 rounded-xl bg-surface-light border border-white/10 text-slate-100 font-semibold text-sm min-h-[44px] disabled:opacity-40"
        >
          Cargar nombres
        </button>
      </div>
    </div>
  );
}
