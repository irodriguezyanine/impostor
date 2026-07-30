import type { Category } from "@/data/categories";
import {
  dealRoles,
  getImpostorIds,
  type GamePhase,
  type GameState,
} from "@/lib/game-logic";
import {
  MAX_PLAYERS,
  clampImpostorCount,
  createPlayer,
  getValidPlayers,
  type Player,
} from "@/lib/players";
import type { Locale } from "@/lib/i18n";

export type GameContextState = {
  players: Player[];
  /** Contador incremental: ids deterministas y estables entre servidor y cliente. */
  nextPlayerId: number;
  selectedCategories: Category[];
  impostorCount: number;
  phase: GamePhase;
  gameState: GameState | null;
  locale: Locale;
  categoryVisibility: boolean;
  hintsEnabled: boolean;
  repeatCardForPlayerId: string | null;
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
  | { type: "START_GAME" }
  | { type: "REVEAL_ROLE"; playerId: string }
  | { type: "HIDE_ROLE" }
  | { type: "COMPLETE_FLIP_TO_NEXT" }
  | { type: "REVEAL_AND_FINISH" }
  | { type: "FINISH_GAME" }
  | { type: "RESTART_CARD_VIEW" }
  | { type: "RESTART_GAME" }
  | { type: "SHOW_CARD_FOR_PLAYER"; playerId: string }
  | { type: "CLEAR_REPEAT_CARD" }
  | { type: "RESTORE"; snapshot: RestoreSnapshot };

export function createInitialState(): GameContextState {
  return {
    players: [createPlayer("p1"), createPlayer("p2"), createPlayer("p3")],
    nextPlayerId: 4,
    selectedCategories: [],
    impostorCount: 1,
    phase: "setup",
    gameState: null,
    locale: "es",
    categoryVisibility: true,
    hintsEnabled: true,
    repeatCardForPlayerId: null,
  };
}

/** Mantiene el número de impostores dentro del rango que permiten los nombres actuales. */
function withClampedImpostors(state: GameContextState): GameContextState {
  const validCount = getValidPlayers(state.players).length;
  const impostorCount = clampImpostorCount(state.impostorCount, validCount);
  return impostorCount === state.impostorCount
    ? state
    : { ...state, impostorCount };
}

function startRound(
  state: GameContextState,
  previousImpostorIds: readonly string[]
): GameContextState {
  const gameState = dealRoles({
    players: state.players,
    selectedCategories: state.selectedCategories,
    impostorCount: state.impostorCount,
    previousImpostorIds,
  });
  if (!gameState) return state;

  return {
    ...state,
    phase: "passing",
    gameState,
    repeatCardForPlayerId: null,
  };
}

export function gameReducer(
  state: GameContextState,
  action: Action
): GameContextState {
  switch (action.type) {
    case "ADD_PLAYER": {
      if (state.players.length >= MAX_PLAYERS) return state;
      return {
        ...state,
        players: [
          ...state.players,
          createPlayer(`p${state.nextPlayerId}`, action.name ?? ""),
        ],
        nextPlayerId: state.nextPlayerId + 1,
      };
    }

    case "REMOVE_PLAYER": {
      if (state.players.length <= 2) return state;
      const players = state.players.filter((player) => player.id !== action.id);
      if (players.length === state.players.length) return state;
      return withClampedImpostors({ ...state, players });
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

    case "START_GAME":
      return startRound(state, []);

    case "RESTART_GAME":
      return startRound(
        state,
        state.gameState ? getImpostorIds(state.gameState) : []
      );

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
        return { ...state, phase: "playing" };
      }
      // Primero se voltea la carta; COMPLETE_FLIP_TO_NEXT avanza al siguiente
      // jugador cuando ya no se ve el reverso, para no delatar su rol.
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

    case "REVEAL_AND_FINISH":
      return { ...state, phase: "ended" };

    case "SHOW_CARD_FOR_PLAYER":
      return { ...state, repeatCardForPlayerId: action.playerId };

    case "CLEAR_REPEAT_CARD":
      return { ...state, repeatCardForPlayerId: null };

    case "FINISH_GAME":
      // Conserva jugadores, categorías e impostores para volver a jugar rápido.
      return {
        ...state,
        phase: "setup",
        gameState: null,
        repeatCardForPlayerId: null,
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

    case "RESTORE":
      return { ...state, ...action.snapshot, repeatCardForPlayerId: null };

    default:
      return state;
  }
}
