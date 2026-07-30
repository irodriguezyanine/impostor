"use client";

import React from "react";
import { Settings } from "lucide-react";
import type {
  Difficulty,
  DiscussSeconds,
  GameModeId,
  GameSettings,
} from "@/lib/game-settings";
import { applyModeDefaults } from "@/lib/game-settings";

type GameSettingsPanelProps = {
  settings: GameSettings;
  onChange: (patch: Partial<GameSettings>) => void;
};

const MODE_OPTIONS: { id: GameModeId; label: string }[] = [
  { id: "classic", label: "Clásico" },
  { id: "blitz", label: "Blitz" },
  { id: "kids", label: "Kids" },
  { id: "mrWhite", label: "Mr. White" },
  { id: "closeWord", label: "Palabra cercana" },
  { id: "falseHint", label: "Pista falsa" },
];

const DIFFICULTY_OPTIONS: { id: Difficulty; label: string }[] = [
  { id: "easy", label: "Fácil" },
  { id: "medium", label: "Media" },
  { id: "hard", label: "Difícil" },
];

const DISCUSS_OPTIONS: { value: DiscussSeconds; label: string }[] = [
  { value: 0, label: "Sin timer" },
  { value: 30, label: "30 s" },
  { value: 60, label: "60 s" },
  { value: 90, label: "90 s" },
  { value: 120, label: "2 min" },
  { value: 180, label: "3 min" },
];

const THEME_OPTIONS: { id: GameSettings["theme"]; label: string }[] = [
  { id: "dark", label: "Oscuro" },
  { id: "light", label: "Claro" },
  { id: "high-contrast", label: "Alto contraste" },
];

type ToggleKey = keyof Pick<
  GameSettings,
  | "enableTurnOrder"
  | "enableWrittenClues"
  | "enableVoting"
  | "enableLastWord"
  | "enableScoring"
  | "soundEnabled"
  | "hapticsEnabled"
  | "antiPeekCover"
  | "holdToPass"
>;

const TOGGLES: { key: ToggleKey; label: string }[] = [
  { key: "enableTurnOrder", label: "Orden de turnos" },
  { key: "enableWrittenClues", label: "Pistas escritas" },
  { key: "enableVoting", label: "Votación" },
  { key: "enableLastWord", label: "Última palabra" },
  { key: "enableScoring", label: "Puntuación" },
  { key: "soundEnabled", label: "Sonido" },
  { key: "hapticsEnabled", label: "Vibración" },
  { key: "antiPeekCover", label: "Anti-mirones" },
  { key: "holdToPass", label: "Mantener para pasar" },
];

function SelectField<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { id?: T; value?: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
        {label}
      </span>
      <select
        value={String(value)}
        onChange={(e) => {
          const raw = e.target.value;
          const num = Number(raw);
          onChange((Number.isNaN(num) ? raw : num) as T);
        }}
        className="w-full rounded-xl bg-surface-light border border-white/10 px-3 py-2.5 text-slate-100 text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary/40"
      >
        {options.map((opt) => {
          const v = opt.id ?? opt.value!;
          return (
            <option key={String(v)} value={String(v)}>
              {opt.label}
            </option>
          );
        })}
      </select>
    </label>
  );
}

export function GameSettingsPanel({
  settings,
  onChange,
}: GameSettingsPanelProps) {
  const handleMode = (mode: GameModeId) => {
    const next = applyModeDefaults(settings, mode);
    onChange(next);
  };

  return (
    <div className="w-full rounded-2xl bg-surface border border-white/10 p-5 space-y-5 shadow-card">
      <div className="flex items-center gap-2 text-slate-200 font-semibold">
        <Settings size={18} className="text-primary" aria-hidden="true" />
        Ajustes de partida
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Modo"
          value={settings.mode}
          options={MODE_OPTIONS}
          onChange={(v) => handleMode(v as GameModeId)}
        />
        <SelectField
          label="Dificultad"
          value={settings.difficulty}
          options={DIFFICULTY_OPTIONS}
          onChange={(v) => onChange({ difficulty: v as Difficulty })}
        />
        <SelectField
          label="Tiempo de discusión"
          value={settings.discussSeconds}
          options={DISCUSS_OPTIONS}
          onChange={(v) =>
            onChange({ discussSeconds: v as DiscussSeconds })
          }
        />
        <SelectField
          label="Tema"
          value={settings.theme}
          options={THEME_OPTIONS}
          onChange={(v) =>
            onChange({ theme: v as GameSettings["theme"] })
          }
        />
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
          Opciones
        </p>
        <ul className="space-y-1">
          {TOGGLES.map(({ key, label }) => (
            <li key={key}>
              <label className="flex items-center justify-between gap-3 rounded-xl bg-surface-light/50 border border-white/5 px-3 py-2.5 cursor-pointer min-h-[44px]">
                <span className="text-sm text-slate-200">{label}</span>
                <input
                  type="checkbox"
                  checked={settings[key]}
                  onChange={(e) => onChange({ [key]: e.target.checked })}
                  className="h-5 w-5 rounded accent-primary"
                />
              </label>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
