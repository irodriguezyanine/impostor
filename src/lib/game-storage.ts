import type { GamePhase, GameState, PlayerRole } from "@/lib/game-logic";
import type { Player } from "@/lib/players";

export const PERSISTED_GAME_VERSION = 1;
export const GAME_STORAGE_KEY = "impostor:game";

/**
 * Lo que guardamos entre recargas. Las categorías se referencian por id: sus
 * palabras viven en el bundle y ocuparían de más en sessionStorage.
 */
export type GameSnapshot = {
  players: Player[];
  nextPlayerId: number;
  selectedCategoryIds: string[];
  impostorCount: number;
  phase: GamePhase;
  categoryVisibility: boolean;
  hintsEnabled: boolean;
  gameState: GameState | null;
};

const PHASES: GamePhase[] = [
  "setup",
  "passing",
  "revealing",
  "playing",
  "ended",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPlayer(value: unknown): value is Player {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string"
  );
}

function parsePlayers(value: unknown): Player[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  if (!value.every(isPlayer)) return null;
  return value.map((player) => ({ id: player.id, name: player.name }));
}

function parseGameState(value: unknown): GameState | null {
  if (!isRecord(value)) return null;

  const shuffledOrder = parsePlayers(value.shuffledOrder);
  if (!shuffledOrder) return null;
  if (typeof value.secretWord !== "string") return null;
  if (typeof value.categoryId !== "string") return null;
  if (typeof value.currentPlayerIndex !== "number") return null;
  if (typeof value.firstPlayerId !== "string") return null;
  if (!isRecord(value.playerRoles) || !isRecord(value.impostorHints)) {
    return null;
  }
  if (!Array.isArray(value.revealedPlayers)) return null;

  const flipping = value.flippingToNextIndex;
  if (flipping !== null && typeof flipping !== "number") return null;

  return {
    secretWord: value.secretWord,
    categoryId: value.categoryId,
    impostorHints: value.impostorHints as Record<string, string>,
    playerRoles: value.playerRoles as Record<string, PlayerRole>,
    shuffledOrder,
    currentPlayerIndex: value.currentPlayerIndex,
    firstPlayerId: value.firstPlayerId,
    revealedPlayers: new Set(value.revealedPlayers.filter(
      (id): id is string => typeof id === "string"
    )),
    flippingToNextIndex: flipping,
  };
}

export function encodePersistedGame(snapshot: GameSnapshot): string {
  return JSON.stringify({
    version: PERSISTED_GAME_VERSION,
    players: snapshot.players,
    nextPlayerId: snapshot.nextPlayerId,
    selectedCategoryIds: snapshot.selectedCategoryIds,
    impostorCount: snapshot.impostorCount,
    phase: snapshot.phase,
    categoryVisibility: snapshot.categoryVisibility,
    hintsEnabled: snapshot.hintsEnabled,
    gameState: snapshot.gameState
      ? {
          ...snapshot.gameState,
          revealedPlayers: Array.from(snapshot.gameState.revealedPlayers),
        }
      : null,
  });
}

export function decodePersistedGame(
  raw: string | null | undefined
): GameSnapshot | null {
  if (!raw) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (!isRecord(parsed)) return null;
  if (parsed.version !== PERSISTED_GAME_VERSION) return null;

  const players = parsePlayers(parsed.players);
  if (!players) return null;

  const phase = parsed.phase;
  if (typeof phase !== "string" || !PHASES.includes(phase as GamePhase)) {
    return null;
  }

  const categoryIds = Array.isArray(parsed.selectedCategoryIds)
    ? parsed.selectedCategoryIds.filter(
        (id): id is string => typeof id === "string"
      )
    : [];

  return {
    players,
    nextPlayerId:
      typeof parsed.nextPlayerId === "number"
        ? parsed.nextPlayerId
        : players.length + 1,
    selectedCategoryIds: categoryIds,
    impostorCount:
      typeof parsed.impostorCount === "number" ? parsed.impostorCount : 1,
    phase: phase as GamePhase,
    categoryVisibility: parsed.categoryVisibility !== false,
    hintsEnabled: parsed.hintsEnabled !== false,
    gameState: parsed.gameState === null ? null : parseGameState(parsed.gameState),
  };
}

/** Acceso a sessionStorage tolerante a fallos (modo privado, cuotas, SSR). */
function getSessionStorage(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function loadPersistedGame(): GameSnapshot | null {
  const storage = getSessionStorage();
  if (!storage) return null;
  try {
    return decodePersistedGame(storage.getItem(GAME_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function savePersistedGame(snapshot: GameSnapshot): void {
  const storage = getSessionStorage();
  if (!storage) return;
  try {
    storage.setItem(GAME_STORAGE_KEY, encodePersistedGame(snapshot));
  } catch {
    /* sessionStorage lleno o bloqueado: la partida sigue en memoria */
  }
}

export function clearPersistedGame(): void {
  const storage = getSessionStorage();
  if (!storage) return;
  try {
    storage.removeItem(GAME_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
