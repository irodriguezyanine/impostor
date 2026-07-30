import type { Category } from "@/data/categories";
import { getHintsForWord } from "@/data/categories";
import {
  createImpostorHistory,
  selectImpostors,
  type ImpostorHistory,
} from "@/lib/impostor-rotation";
import {
  MIN_CIVILIANS,
  MIN_PLAYERS,
  getValidPlayers,
  type Player,
} from "@/lib/players";
import { pickRandom, shuffleArray, type RandomFn } from "@/lib/shuffle";

export type PlayerRole = "civilian" | "impostor";

export type GamePhase = "setup" | "passing" | "revealing" | "playing" | "ended";

export type GameState = {
  secretWord: string;
  categoryId: string;
  /** playerId -> pista. Cada impostor recibe una distinta de las 3 disponibles. */
  impostorHints: Record<string, string>;
  /** playerId -> rol. */
  playerRoles: Record<string, PlayerRole>;
  /** Instantánea ordenada de los jugadores de esta partida. */
  shuffledOrder: Player[];
  currentPlayerIndex: number;
  firstPlayerId: string;
  /** Ids de quienes ya vieron su carta. */
  revealedPlayers: Set<string>;
  flippingToNextIndex: number | null;
};

export type SetupIssue =
  | "not-enough-players"
  | "no-category"
  | "too-many-impostors";

export type SetupInput = {
  players: readonly Player[];
  selectedCategories: readonly Category[];
  impostorCount: number;
};

export function validateSetup({
  players,
  selectedCategories,
  impostorCount,
}: SetupInput): SetupIssue | null {
  const validPlayers = getValidPlayers(players);
  if (validPlayers.length < MIN_PLAYERS) return "not-enough-players";
  if (selectedCategories.length === 0) return "no-category";
  if (validPlayers.length - impostorCount < MIN_CIVILIANS) {
    return "too-many-impostors";
  }
  return null;
}

export type DealRolesInput = SetupInput & {
  /** Reparto previo de impostores, para turnarse de forma equitativa. */
  history?: ImpostorHistory;
  random?: RandomFn;
};

/**
 * Reparte una partida completa. Devuelve `null` cuando la configuración no es
 * jugable, para que quien llama decida cómo avisar al usuario.
 */
export function dealRoles({
  players,
  selectedCategories,
  impostorCount,
  history = createImpostorHistory(),
  random = Math.random,
}: DealRolesInput): GameState | null {
  if (validateSetup({ players, selectedCategories, impostorCount }) !== null) {
    return null;
  }

  const category = pickRandom(selectedCategories, random);
  if (!category) return null;

  const secretWord = pickRandom(category.words, random);
  if (!secretWord) return null;

  const validPlayers = getValidPlayers(players);
  const hints = shuffleArray(getHintsForWord(category, secretWord), random);
  const shuffledOrder = shuffleArray(validPlayers, random);

  const impostors = selectImpostors({
    players: validPlayers,
    impostorCount,
    history,
    random,
  });

  const playerRoles: Record<string, PlayerRole> = {};
  for (const player of validPlayers) {
    playerRoles[player.id] = "civilian";
  }

  const impostorHints: Record<string, string> = {};
  impostors.forEach((player, index) => {
    playerRoles[player.id] = "impostor";
    impostorHints[player.id] = hints[index % hints.length] ?? category.name;
  });

  const firstPlayer = pickRandom(shuffledOrder, random) ?? shuffledOrder[0];

  return {
    secretWord,
    categoryId: category.id,
    impostorHints,
    playerRoles,
    shuffledOrder,
    currentPlayerIndex: 0,
    firstPlayerId: firstPlayer.id,
    revealedPlayers: new Set<string>(),
    flippingToNextIndex: null,
  };
}

export function getImpostorIds(gameState: GameState): string[] {
  return Object.entries(gameState.playerRoles)
    .filter(([, role]) => role === "impostor")
    .map(([id]) => id);
}
