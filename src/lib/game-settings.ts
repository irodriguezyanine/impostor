/**
 * Ajustes de partida y de la app. Todo vive en el cliente;
 * lo que necesita servidor queda marcado como stub.
 */
export type GameModeId =
  | "classic"
  | "blitz"
  | "kids"
  | "mrWhite"
  | "closeWord"
  | "falseHint";

export type Difficulty = "easy" | "medium" | "hard";

export type DiscussSeconds = 30 | 60 | 90 | 120 | 180 | 0;

export type GameSettings = {
  mode: GameModeId;
  difficulty: Difficulty;
  /** 0 = sin timer. */
  discussSeconds: DiscussSeconds;
  /** Segundos por hablante; 0 = libre. */
  turnSeconds: number;
  enableTurnOrder: boolean;
  enableWrittenClues: boolean;
  enableVoting: boolean;
  enableLastWord: boolean;
  enableScoring: boolean;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  autoHideCardSeconds: number;
  holdToPass: boolean;
  antiPeekCover: boolean;
  theme: "dark" | "light" | "high-contrast";
  kidsMode: boolean;
  /** Quién pide ser impostor (ids). */
  volunteerImpostorIds: string[];
  /** Quién no puede ser impostor esta ronda. */
  blockedImpostorIds: string[];
};

export const DEFAULT_SETTINGS: GameSettings = {
  mode: "classic",
  difficulty: "medium",
  discussSeconds: 120,
  turnSeconds: 20,
  enableTurnOrder: true,
  enableWrittenClues: false,
  enableVoting: false,
  enableLastWord: true,
  enableScoring: true,
  soundEnabled: false,
  hapticsEnabled: true,
  autoHideCardSeconds: 15,
  holdToPass: false,
  antiPeekCover: true,
  theme: "dark",
  kidsMode: false,
  volunteerImpostorIds: [],
  blockedImpostorIds: [],
};

export const SETTINGS_STORAGE_KEY = "impostor:settings";

export function suggestImpostorCount(playerCount: number): number {
  if (playerCount < 3) return 1;
  if (playerCount <= 5) return 1;
  if (playerCount <= 8) return 2;
  if (playerCount <= 12) return 3;
  return Math.min(4, Math.max(1, Math.floor(playerCount / 4)));
}

/** Con 4 jugadores y 2 impostores el reparto se vuelve predecible. */
export function isUnbalancedImpostorSetup(
  playerCount: number,
  impostorCount: number
): boolean {
  return playerCount === 4 && impostorCount === 2;
}

export function estimateDurationMinutes(
  playerCount: number,
  discussSeconds: number,
  rounds = 1
): number {
  const deal = Math.ceil(playerCount * 0.4);
  const discuss = Math.max(1, Math.round(discussSeconds / 60));
  const vote = 2;
  return Math.max(3, (deal + discuss + vote) * rounds);
}

export function applyModeDefaults(
  settings: GameSettings,
  mode: GameModeId
): GameSettings {
  const base = { ...settings, mode };
  switch (mode) {
    case "blitz":
      return {
        ...base,
        discussSeconds: 60,
        turnSeconds: 10,
        enableWrittenClues: false,
        enableLastWord: false,
      };
    case "kids":
      return {
        ...base,
        kidsMode: true,
        difficulty: "easy",
        discussSeconds: 90,
        enableWrittenClues: false,
      };
    case "falseHint":
      return { ...base, difficulty: "hard" };
    case "mrWhite":
      return base;
    case "closeWord":
      return { ...base, difficulty: "medium" };
    default:
      return base;
  }
}

export function loadSettings(): GameSettings {
  try {
    if (typeof window === "undefined") return DEFAULT_SETTINGS;
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<GameSettings>;
    // La votación se retiró del flujo final; se fuerza apagada también en
    // ajustes guardados antes del cambio.
    return { ...DEFAULT_SETTINGS, ...parsed, enableVoting: false };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: GameSettings): void {
  try {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    /* ignore */
  }
}
