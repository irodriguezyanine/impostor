import type { GamePhase, GameState, PlayerRole } from "@/lib/game-logic";
import {
  createImpostorHistory,
  type ImpostorHistory,
} from "@/lib/impostor-rotation";
import {
  DEFAULT_SETTINGS,
  type GameSettings,
} from "@/lib/game-settings";
import type { Player } from "@/lib/players";
import { createNightBoard, type NightBoard } from "@/lib/scoring";
import type { Ballot } from "@/lib/voting";

export const PERSISTED_GAME_VERSION = 3;
export const GAME_STORAGE_KEY = "impostor:game";

export type GameSnapshot = {
  players: Player[];
  nextPlayerId: number;
  selectedCategoryIds: string[];
  impostorCount: number;
  phase: GamePhase;
  categoryVisibility: boolean;
  hintsEnabled: boolean;
  gameState: GameState | null;
  impostorHistory: ImpostorHistory;
  settings: GameSettings;
  nightBoard: NightBoard;
  ballots: Ballot[];
  voteAccusedId: string | null;
  lastWordPlayerId: string | null;
  civiliansWon: boolean | null;
};

const PHASES: GamePhase[] = [
  "setup",
  "passing",
  "revealing",
  "discussing",
  "clueRound",
  "voting",
  "lastWord",
  "result",
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

function parseCounters(value: unknown): Record<string, number> {
  if (!isRecord(value)) return {};
  const result: Record<string, number> = {};
  for (const [id, count] of Object.entries(value)) {
    if (typeof count === "number" && Number.isFinite(count) && count >= 0) {
      result[id] = count;
    }
  }
  return result;
}

function parseImpostorHistory(value: unknown): ImpostorHistory {
  if (!isRecord(value)) return createImpostorHistory();
  const round = value.round;
  return {
    counts: parseCounters(value.counts),
    lastRound: parseCounters(value.lastRound),
    round: typeof round === "number" && round >= 0 ? round : 0,
  };
}

function parseSettings(value: unknown): GameSettings {
  if (!isRecord(value)) return DEFAULT_SETTINGS;
  return { ...DEFAULT_SETTINGS, ...(value as Partial<GameSettings>) };
}

function parseNightBoard(value: unknown, players: Player[]): NightBoard {
  if (!isRecord(value)) return createNightBoard(players);
  return {
    scores: isRecord(value.scores)
      ? (value.scores as NightBoard["scores"])
      : createNightBoard(players).scores,
    roundsPlayed:
      typeof value.roundsPlayed === "number" ? value.roundsPlayed : 0,
  };
}

function parseBallots(value: unknown): Ballot[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (b): b is Ballot =>
      isRecord(b) &&
      typeof b.voterId === "string" &&
      typeof b.accusedId === "string"
  );
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

  const speakOrder = parsePlayers(value.speakOrder) ?? shuffledOrder;

  return {
    secretWord: value.secretWord,
    categoryId: value.categoryId,
    impostorHints: value.impostorHints as Record<string, string>,
    closeWords: isRecord(value.closeWords)
      ? (value.closeWords as Record<string, string>)
      : {},
    playerRoles: value.playerRoles as Record<string, PlayerRole>,
    shuffledOrder,
    speakOrder,
    speakIndex: typeof value.speakIndex === "number" ? value.speakIndex : 0,
    currentPlayerIndex: value.currentPlayerIndex,
    firstPlayerId: value.firstPlayerId,
    revealedPlayers: new Set(
      value.revealedPlayers.filter((id): id is string => typeof id === "string")
    ),
    flippingToNextIndex: flipping,
    mode: typeof value.mode === "string" ? (value.mode as GameState["mode"]) : "classic",
    difficulty:
      typeof value.difficulty === "string"
        ? (value.difficulty as GameState["difficulty"])
        : "medium",
    roundSeed: typeof value.roundSeed === "string" ? value.roundSeed : "",
    writtenClues: isRecord(value.writtenClues)
      ? (value.writtenClues as Record<string, string>)
      : {},
    discussEndsAt:
      typeof value.discussEndsAt === "number" || value.discussEndsAt === null
        ? (value.discussEndsAt as number | null)
        : null,
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
    impostorHistory: snapshot.impostorHistory,
    settings: snapshot.settings,
    nightBoard: snapshot.nightBoard,
    ballots: snapshot.ballots,
    voteAccusedId: snapshot.voteAccusedId,
    lastWordPlayerId: snapshot.lastWordPlayerId,
    civiliansWon: snapshot.civiliansWon,
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

  // Compat: "playing" de versiones viejas no aplica (version gate).
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
    impostorHistory: parseImpostorHistory(parsed.impostorHistory),
    settings: parseSettings(parsed.settings),
    nightBoard: parseNightBoard(parsed.nightBoard, players),
    ballots: parseBallots(parsed.ballots),
    voteAccusedId:
      typeof parsed.voteAccusedId === "string" ? parsed.voteAccusedId : null,
    lastWordPlayerId:
      typeof parsed.lastWordPlayerId === "string"
        ? parsed.lastWordPlayerId
        : null,
    civiliansWon:
      typeof parsed.civiliansWon === "boolean" ? parsed.civiliansWon : null,
    gameState:
      parsed.gameState === null ? null : parseGameState(parsed.gameState),
  };
}

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
    /* sessionStorage lleno o bloqueado */
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
