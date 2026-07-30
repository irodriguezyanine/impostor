import type { Category } from "@/data/categories";
import { getHintsForWord } from "@/data/categories";
import {
  assignMrWhite,
  modeNeedsMrWhite,
  modeUsesCloseWord,
  modeUsesFalseHints,
  pickCloseWord,
  pickFalseHint,
  pickHintForDifficulty,
} from "@/lib/game-modes";
import type { Difficulty, GameModeId, GameSettings } from "@/lib/game-settings";
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
import {
  getRecentCategories,
  getRecentWords,
  preferFreshCategory,
  preferFreshWord,
} from "@/lib/round-memory";
import { pickRandom, shuffleArray, type RandomFn } from "@/lib/shuffle";

export type PlayerRole = "civilian" | "impostor" | "mrWhite";

export type GamePhase =
  | "setup"
  | "passing"
  | "revealing"
  | "discussing"
  | "clueRound"
  | "voting"
  | "lastWord"
  | "result"
  | "ended";

export type GameState = {
  secretWord: string;
  categoryId: string;
  impostorHints: Record<string, string>;
  /** Modo closeWord: palabra parecida que ve el impostor. */
  closeWords: Record<string, string>;
  playerRoles: Record<string, PlayerRole>;
  shuffledOrder: Player[];
  /** Orden de habla (puede diferir del shuffle de cartas). */
  speakOrder: Player[];
  speakIndex: number;
  currentPlayerIndex: number;
  firstPlayerId: string;
  revealedPlayers: Set<string>;
  flippingToNextIndex: number | null;
  mode: GameModeId;
  difficulty: Difficulty;
  roundSeed: string;
  /** Pistas escritas playerId -> texto. */
  writtenClues: Record<string, string>;
  discussEndsAt: number | null;
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
  history?: ImpostorHistory;
  settings?: Pick<
    GameSettings,
    | "mode"
    | "difficulty"
    | "volunteerImpostorIds"
    | "blockedImpostorIds"
    | "kidsMode"
  >;
  roundSeed?: string;
  random?: RandomFn;
  recentWords?: readonly string[];
  recentCategoryIds?: readonly string[];
};

function withVolunteers(
  selected: Player[],
  players: readonly Player[],
  impostorCount: number,
  volunteers: readonly string[],
  blocked: readonly string[],
  random: RandomFn
): Player[] {
  const blockedSet = new Set(blocked);
  const volunteerPlayers = players.filter(
    (p) => volunteers.includes(p.id) && !blockedSet.has(p.id)
  );
  const forced = volunteerPlayers.slice(0, impostorCount);
  if (forced.length >= impostorCount) return forced.slice(0, impostorCount);

  const need = impostorCount - forced.length;
  const forcedIds = new Set(forced.map((p) => p.id));
  const rest = selected.filter(
    (p) => !forcedIds.has(p.id) && !blockedSet.has(p.id)
  );
  const fill = rest.length >= need
    ? rest.slice(0, need)
    : [
        ...rest,
        ...players.filter(
          (p) => !forcedIds.has(p.id) && !rest.some((r) => r.id === p.id)
        ),
      ].slice(0, need);
  return shuffleArray([...forced, ...fill], random).slice(0, impostorCount);
}

/**
 * Reparte una partida completa. Devuelve `null` cuando la configuración no es
 * jugable, para que quien llama decida cómo avisar al usuario.
 */
export function dealRoles({
  players,
  selectedCategories,
  impostorCount,
  history = createImpostorHistory(),
  settings,
  roundSeed = Math.random().toString(36).slice(2, 10),
  random = Math.random,
  recentWords = typeof window !== "undefined" ? getRecentWords() : [],
  recentCategoryIds =
    typeof window !== "undefined" ? getRecentCategories() : [],
}: DealRolesInput): GameState | null {
  if (validateSetup({ players, selectedCategories, impostorCount }) !== null) {
    return null;
  }

  const mode = settings?.mode ?? "classic";
  const difficulty = settings?.difficulty ?? "medium";

  const categoryPool = preferFreshCategory(
    selectedCategories,
    recentCategoryIds
  );
  const category = pickRandom(categoryPool, random);
  if (!category) return null;

  const wordPool = preferFreshWord(category.words, recentWords);
  const secretWord = pickRandom(wordPool, random);
  if (!secretWord) return null;

  const validPlayers = getValidPlayers(players);
  const hints = shuffleArray(getHintsForWord(category, secretWord), random);
  const shuffledOrder = shuffleArray(validPlayers, random);
  const speakOrder = shuffleArray(validPlayers, random);

  let selected = selectImpostors({
    players: validPlayers.filter(
      (p) => !(settings?.blockedImpostorIds ?? []).includes(p.id)
    ),
    impostorCount,
    history,
    random,
  });

  if (selected.length < impostorCount) {
    selected = selectImpostors({
      players: validPlayers,
      impostorCount,
      history,
      random,
    });
  }

  selected = withVolunteers(
    selected,
    validPlayers,
    impostorCount,
    settings?.volunteerImpostorIds ?? [],
    settings?.blockedImpostorIds ?? [],
    random
  );

  const playerRoles: Record<string, PlayerRole> = {};
  for (const player of validPlayers) {
    playerRoles[player.id] = "civilian";
  }

  const impostorHints: Record<string, string> = {};
  const closeWords: Record<string, string> = {};

  selected.forEach((player, index) => {
    playerRoles[player.id] = "impostor";
    if (modeUsesFalseHints(mode)) {
      impostorHints[player.id] = pickFalseHint(category, secretWord, random);
    } else if (modeUsesCloseWord(mode)) {
      closeWords[player.id] = pickCloseWord(category, secretWord, random);
      impostorHints[player.id] =
        pickHintForDifficulty(hints, category.name, difficulty, random) ??
        category.name;
    } else {
      const hint = pickHintForDifficulty(
        [hints[index % hints.length] ?? category.name, ...hints],
        category.name,
        difficulty,
        random
      );
      if (hint) impostorHints[player.id] = hint;
    }
  });

  if (modeNeedsMrWhite(mode)) {
    const mrWhiteId = assignMrWhite(
      validPlayers,
      selected.map((p) => p.id),
      random
    );
    if (mrWhiteId) playerRoles[mrWhiteId] = "mrWhite";
  }

  const firstPlayer = speakOrder[0] ?? shuffledOrder[0];

  return {
    secretWord,
    categoryId: category.id,
    impostorHints,
    closeWords,
    playerRoles,
    shuffledOrder,
    speakOrder,
    speakIndex: 0,
    currentPlayerIndex: 0,
    firstPlayerId: firstPlayer.id,
    revealedPlayers: new Set<string>(),
    flippingToNextIndex: null,
    mode,
    difficulty,
    roundSeed,
    writtenClues: {},
    discussEndsAt: null,
  };
}

export function getImpostorIds(gameState: GameState): string[] {
  return Object.entries(gameState.playerRoles)
    .filter(([, role]) => role === "impostor")
    .map(([id]) => id);
}

export function getMrWhiteId(gameState: GameState): string | null {
  const entry = Object.entries(gameState.playerRoles).find(
    ([, role]) => role === "mrWhite"
  );
  return entry?.[0] ?? null;
}

/** Fase a la que se pasa cuando todos vieron su carta. */
export function phaseAfterReveal(
  settings: Pick<
    GameSettings,
    "enableWrittenClues" | "enableTurnOrder" | "enableVoting"
  >
): GamePhase {
  if (settings.enableWrittenClues) return "clueRound";
  return "discussing";
}
