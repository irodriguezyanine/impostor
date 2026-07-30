import type { Category } from "@/data/categories";
import {
  dealRoles,
  getImpostorIds,
  phaseAfterReveal,
  type GamePhase,
  type GameState,
} from "@/lib/game-logic";
import {
  DEFAULT_SETTINGS,
  type GameSettings,
} from "@/lib/game-settings";
import {
  createImpostorHistory,
  recordImpostors,
  type ImpostorHistory,
} from "@/lib/impostor-rotation";
import {
  MAX_PLAYERS,
  clampImpostorCount,
  createPlayer,
  getValidPlayers,
  type Player,
} from "@/lib/players";
import type { Locale } from "@/lib/i18n";
import { rememberRound } from "@/lib/round-memory";
import {
  applyRoundOutcome,
  createNightBoard,
  type NightBoard,
} from "@/lib/scoring";
import {
  detectorIdsFromBallots,
  isCorrectAccusation,
  resolveVotes,
  type Ballot,
} from "@/lib/voting";

export type GameContextState = {
  players: Player[];
  nextPlayerId: number;
  selectedCategories: Category[];
  impostorCount: number;
  phase: GamePhase;
  gameState: GameState | null;
  locale: Locale;
  categoryVisibility: boolean;
  hintsEnabled: boolean;
  repeatCardForPlayerId: string | null;
  impostorHistory: ImpostorHistory;
  settings: GameSettings;
  nightBoard: NightBoard;
  ballots: Ballot[];
  voteAccusedId: string | null;
  lastWordPlayerId: string | null;
  civiliansWon: boolean | null;
  showOnboarding: boolean;
};

export type RestoreSnapshot = {
  players: Player[];
  nextPlayerId: number;
  selectedCategories: Category[];
  impostorCount: number;
  phase: GamePhase;
  gameState: GameState | null;
  categoryVisibility: boolean;
  hintsEnabled: boolean;
  impostorHistory: ImpostorHistory;
  settings: GameSettings;
  nightBoard: NightBoard;
  ballots: Ballot[];
  voteAccusedId: string | null;
  lastWordPlayerId: string | null;
  civiliansWon: boolean | null;
};

export type Action =
  | { type: "ADD_PLAYER"; name?: string }
  | { type: "REMOVE_PLAYER"; id: string }
  | { type: "UPDATE_PLAYER"; id: string; name: string }
  | { type: "TOGGLE_CATEGORY"; category: Category }
  | { type: "SET_IMPOSTOR_COUNT"; count: number }
  | { type: "SET_LOCALE"; locale: Locale }
  | { type: "TOGGLE_CATEGORY_VISIBILITY" }
  | { type: "TOGGLE_HINTS" }
  | { type: "PATCH_SETTINGS"; patch: Partial<GameSettings> }
  | { type: "START_GAME" }
  | { type: "REVEAL_ROLE"; playerId: string }
  | { type: "HIDE_ROLE" }
  | { type: "COMPLETE_FLIP_TO_NEXT" }
  | { type: "BEGIN_DISCUSSION" }
  | { type: "NEXT_SPEAKER" }
  | { type: "SET_WRITTEN_CLUE"; playerId: string; clue: string }
  | { type: "FINISH_CLUE_ROUND" }
  | { type: "BEGIN_VOTING" }
  | { type: "CAST_VOTE"; voterId: string; accusedId: string }
  | { type: "RESOLVE_VOTES" }
  | { type: "FINISH_LAST_WORD" }
  | { type: "SKIP_TO_REVEAL" }
  | { type: "REVEAL_AND_FINISH" }
  | { type: "FINISH_GAME" }
  | { type: "RESTART_CARD_VIEW" }
  | { type: "RESTART_GAME" }
  | { type: "SHOW_CARD_FOR_PLAYER"; playerId: string }
  | { type: "CLEAR_REPEAT_CARD" }
  | { type: "DISMISS_ONBOARDING" }
  | { type: "RESTORE"; snapshot: RestoreSnapshot };

export function createInitialState(): GameContextState {
  const players = [
    createPlayer("p1"),
    createPlayer("p2"),
    createPlayer("p3"),
  ];
  return {
    players,
    nextPlayerId: 4,
    selectedCategories: [],
    impostorCount: 1,
    phase: "setup",
    gameState: null,
    locale: "es",
    categoryVisibility: true,
    hintsEnabled: true,
    repeatCardForPlayerId: null,
    impostorHistory: createImpostorHistory(),
    settings: DEFAULT_SETTINGS,
    nightBoard: createNightBoard(players),
    ballots: [],
    voteAccusedId: null,
    lastWordPlayerId: null,
    civiliansWon: null,
    showOnboarding: true,
  };
}

function withClampedImpostors(state: GameContextState): GameContextState {
  const validCount = getValidPlayers(state.players).length;
  const impostorCount = clampImpostorCount(state.impostorCount, validCount);
  return impostorCount === state.impostorCount
    ? state
    : { ...state, impostorCount };
}

function startRound(state: GameContextState): GameContextState {
  const effectiveHints =
    state.settings.difficulty === "hard" ? false : state.hintsEnabled;

  const gameState = dealRoles({
    players: state.players,
    selectedCategories: state.selectedCategories,
    impostorCount: state.impostorCount,
    history: state.impostorHistory,
    settings: state.settings,
  });
  if (!gameState) return state;

  if (typeof window !== "undefined") {
    rememberRound(gameState.secretWord, gameState.categoryId);
  }

  const discussEndsAt =
    state.settings.discussSeconds > 0
      ? Date.now() + state.settings.discussSeconds * 1000
      : null;

  return {
    ...state,
    phase: "passing",
    gameState: {
      ...gameState,
      discussEndsAt,
    },
    impostorHistory: recordImpostors(
      state.impostorHistory,
      getImpostorIds(gameState)
    ),
    hintsEnabled: effectiveHints || state.hintsEnabled,
    repeatCardForPlayerId: null,
    ballots: [],
    voteAccusedId: null,
    lastWordPlayerId: null,
    civiliansWon: null,
  };
}

function recordScore(
  state: GameContextState,
  civiliansWon: boolean,
  accusedId: string | null
): NightBoard {
  if (!state.gameState || !state.settings.enableScoring) {
    return state.nightBoard;
  }
  const impostorIds = getImpostorIds(state.gameState);
  const correctlyAccusedIds =
    accusedId && isCorrectAccusation(accusedId, impostorIds)
      ? [accusedId]
      : [];
  return applyRoundOutcome(state.nightBoard, getValidPlayers(state.players), {
    civiliansWon,
    impostorIds,
    correctlyAccusedIds,
    detectorIds: detectorIdsFromBallots(state.ballots, impostorIds),
  });
}

export function gameReducer(
  state: GameContextState,
  action: Action
): GameContextState {
  switch (action.type) {
    case "ADD_PLAYER": {
      if (state.players.length >= MAX_PLAYERS) return state;
      const players = [
        ...state.players,
        createPlayer(`p${state.nextPlayerId}`, action.name ?? ""),
      ];
      return {
        ...state,
        players,
        nextPlayerId: state.nextPlayerId + 1,
        nightBoard: createNightBoard(players),
      };
    }

    case "REMOVE_PLAYER": {
      if (state.players.length <= 2) return state;
      const players = state.players.filter((player) => player.id !== action.id);
      if (players.length === state.players.length) return state;
      return withClampedImpostors({
        ...state,
        players,
        nightBoard: createNightBoard(players),
      });
    }

    case "UPDATE_PLAYER": {
      const players = state.players.map((player) =>
        player.id === action.id ? { ...player, name: action.name } : player
      );
      return withClampedImpostors({ ...state, players });
    }

    case "TOGGLE_CATEGORY": {
      const isSelected = state.selectedCategories.some(
        (category) => category.id === action.category.id
      );
      return {
        ...state,
        selectedCategories: isSelected
          ? state.selectedCategories.filter(
              (category) => category.id !== action.category.id
            )
          : [...state.selectedCategories, action.category],
      };
    }

    case "SET_IMPOSTOR_COUNT": {
      const validCount = getValidPlayers(state.players).length;
      return {
        ...state,
        impostorCount: clampImpostorCount(action.count, validCount),
      };
    }

    case "SET_LOCALE":
      return { ...state, locale: action.locale };

    case "TOGGLE_CATEGORY_VISIBILITY":
      return { ...state, categoryVisibility: !state.categoryVisibility };

    case "TOGGLE_HINTS":
      return { ...state, hintsEnabled: !state.hintsEnabled };

    case "PATCH_SETTINGS":
      return {
        ...state,
        settings: { ...state.settings, ...action.patch },
      };

    case "START_GAME":
    case "RESTART_GAME":
      return startRound(state);

    case "REVEAL_ROLE": {
      if (!state.gameState) return state;
      const revealedPlayers = new Set(state.gameState.revealedPlayers);
      revealedPlayers.add(action.playerId);
      return {
        ...state,
        phase: "revealing",
        gameState: { ...state.gameState, revealedPlayers },
      };
    }

    case "HIDE_ROLE": {
      if (!state.gameState) return state;
      const { shuffledOrder, currentPlayerIndex } = state.gameState;
      const nextIndex = currentPlayerIndex + 1;
      if (nextIndex >= shuffledOrder.length) {
        const nextPhase = phaseAfterReveal(state.settings);
        return { ...state, phase: nextPhase };
      }
      return {
        ...state,
        phase: "passing",
        gameState: { ...state.gameState, flippingToNextIndex: nextIndex },
      };
    }

    case "COMPLETE_FLIP_TO_NEXT": {
      if (!state.gameState || state.gameState.flippingToNextIndex === null) {
        return state;
      }
      return {
        ...state,
        gameState: {
          ...state.gameState,
          currentPlayerIndex: state.gameState.flippingToNextIndex,
          flippingToNextIndex: null,
        },
      };
    }

    case "BEGIN_DISCUSSION":
      return { ...state, phase: "discussing" };

    case "NEXT_SPEAKER": {
      if (!state.gameState) return state;
      const next = state.gameState.speakIndex + 1;
      if (next >= state.gameState.speakOrder.length) {
        return {
          ...state,
          phase: state.settings.enableVoting ? "voting" : "ended",
          gameState: { ...state.gameState, speakIndex: 0 },
        };
      }
      return {
        ...state,
        gameState: { ...state.gameState, speakIndex: next },
      };
    }

    case "SET_WRITTEN_CLUE": {
      if (!state.gameState) return state;
      return {
        ...state,
        gameState: {
          ...state.gameState,
          writtenClues: {
            ...state.gameState.writtenClues,
            [action.playerId]: action.clue,
          },
        },
      };
    }

    case "FINISH_CLUE_ROUND":
      return { ...state, phase: "discussing" };

    case "BEGIN_VOTING":
      return { ...state, phase: "voting", ballots: [] };

    case "CAST_VOTE": {
      const ballots = [
        ...state.ballots.filter((b) => b.voterId !== action.voterId),
        { voterId: action.voterId, accusedId: action.accusedId },
      ];
      return { ...state, ballots };
    }

    case "RESOLVE_VOTES": {
      if (!state.gameState) return state;
      const result = resolveVotes(state.ballots);
      const impostorIds = getImpostorIds(state.gameState);

      if (result.kind === "tie" || result.kind === "none") {
        return {
          ...state,
          phase: "result",
          voteAccusedId: null,
          civiliansWon: false,
          nightBoard: recordScore(state, false, null),
        };
      }

      const accusedId = result.accusedId;
      const hit = isCorrectAccusation(accusedId, impostorIds);

      if (hit && state.settings.enableLastWord) {
        return {
          ...state,
          phase: "lastWord",
          voteAccusedId: accusedId,
          lastWordPlayerId: accusedId,
          civiliansWon: true,
        };
      }

      return {
        ...state,
        phase: "result",
        voteAccusedId: accusedId,
        civiliansWon: hit,
        nightBoard: recordScore(state, hit, accusedId),
      };
    }

    case "FINISH_LAST_WORD": {
      const civiliansWon = state.civiliansWon ?? true;
      return {
        ...state,
        phase: "result",
        nightBoard: recordScore(state, civiliansWon, state.voteAccusedId),
      };
    }

    case "SKIP_TO_REVEAL":
      return {
        ...state,
        phase: "ended",
        nightBoard: recordScore(state, false, null),
        civiliansWon: false,
      };

    case "REVEAL_AND_FINISH":
      return {
        ...state,
        phase: "ended",
        nightBoard:
          state.civiliansWon === null
            ? recordScore(state, false, null)
            : state.nightBoard,
      };

    case "SHOW_CARD_FOR_PLAYER":
      return { ...state, repeatCardForPlayerId: action.playerId };

    case "CLEAR_REPEAT_CARD":
      return { ...state, repeatCardForPlayerId: null };

    case "FINISH_GAME":
      return {
        ...state,
        phase: "setup",
        gameState: null,
        repeatCardForPlayerId: null,
        ballots: [],
        voteAccusedId: null,
        lastWordPlayerId: null,
        civiliansWon: null,
      };

    case "RESTART_CARD_VIEW": {
      if (!state.gameState) return state;
      return {
        ...state,
        phase: "passing",
        gameState: {
          ...state.gameState,
          currentPlayerIndex: 0,
          revealedPlayers: new Set<string>(),
          flippingToNextIndex: null,
        },
      };
    }

    case "DISMISS_ONBOARDING":
      return { ...state, showOnboarding: false };

    case "RESTORE":
      return {
        ...state,
        ...action.snapshot,
        repeatCardForPlayerId: null,
        showOnboarding: false,
      };

    default:
      return state;
  }
}
