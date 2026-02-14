"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { Category } from "@/data/categories";
import { CATEGORIES, getHintsForWord } from "@/data/categories";
import { LOCALES, type Locale } from "@/lib/i18n";

export type GamePhase = "setup" | "passing" | "revealing" | "playing" | "ended";

export type PlayerRole = "civilian" | "impostor";

export type GameState = {
  secretWord: string;
  /** Pista asignada por impostor (cada uno recibe una distinta de las 3 disponibles) */
  impostorHints: Record<string, string>;
  playerRoles: Record<string, PlayerRole>;
  shuffledOrder: string[];
  currentPlayerIndex: number;
  firstPlayer: string;
  revealedPlayers: Set<string>;
  flippingToNextIndex: number | null;
};

type GameContextState = {
  players: string[];
  selectedCategories: Category[];
  impostorCount: number;
  phase: GamePhase;
  gameState: GameState | null;
  locale: Locale;
  categoryVisibility: boolean;
  hintsEnabled: boolean; // Si está activo, los impostores ven la categoría como pista
  repeatCardForPlayer: string | null;
};

type GameContextValue = GameContextState & {
  addPlayer: (name?: string) => void;
  removePlayer: (index: number) => void;
  updatePlayer: (index: number, name: string) => void;
  toggleCategory: (category: Category) => void;
  setImpostorCount: (count: number) => void;
  setLocale: (locale: Locale) => void;
  toggleCategoryVisibility: () => void;
  toggleHints: () => void;
  startGame: () => void;
  nextPlayer: () => void;
  revealRole: (playerName: string) => void;
  hideRole: () => void;
  completeFlipToNext: () => void;
  revealAndFinish: () => void;
  finishGame: () => void;
  restartCardView: () => void;
  restartGame: () => void;
  showCardForPlayer: (playerName: string) => void;
  clearRepeatCard: () => void;
};

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

const STORAGE_KEY = "imposter-locale";

function getStoredLocale(): Locale | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && (LOCALES as readonly string[]).includes(stored)) {
      return stored as Locale;
    }
  } catch {
    /* ignore */
  }
  return null;
}

const initialState: GameContextState = {
  players: ["", "", ""],
  selectedCategories: [],
  impostorCount: 1,
  phase: "setup",
  gameState: null,
  locale: "es",
  categoryVisibility: true,
  hintsEnabled: false,
  repeatCardForPlayer: null,
};

type Action =
  | { type: "ADD_PLAYER"; name?: string }
  | { type: "REMOVE_PLAYER"; index: number }
  | { type: "UPDATE_PLAYER"; index: number; name: string }
  | { type: "TOGGLE_CATEGORY"; category: Category }
  | { type: "SET_IMPOSTOR_COUNT"; count: number }
  | { type: "SET_LOCALE"; locale: Locale }
  | { type: "TOGGLE_CATEGORY_VISIBILITY" }
  | { type: "TOGGLE_HINTS" }
  | { type: "START_GAME" }
  | { type: "NEXT_PLAYER" }
  | { type: "REVEAL_ROLE"; playerName: string }
  | { type: "HIDE_ROLE" }
  | { type: "REVEAL_AND_FINISH" }
  | { type: "FINISH_GAME" }
  | { type: "RESTART_CARD_VIEW" }
  | { type: "RESTART_GAME" }
  | { type: "COMPLETE_FLIP_TO_NEXT" }
  | { type: "SHOW_CARD_FOR_PLAYER"; playerName: string }
  | { type: "CLEAR_REPEAT_CARD" };

function gameReducer(state: GameContextState, action: Action): GameContextState {
  switch (action.type) {
    case "ADD_PLAYER":
      if (state.players.length >= 20) return state;
      return { ...state, players: [...state.players, ""] };

    case "REMOVE_PLAYER": {
      if (state.players.length <= 2) return state;
      const newPlayers = state.players.filter((_, i) => i !== action.index);
      const newMaxImpostors = Math.max(1, newPlayers.length - 2);
      const newImpostorCount = Math.min(
        state.impostorCount,
        newMaxImpostors
      );
      return {
        ...state,
        players: newPlayers,
        impostorCount: newImpostorCount,
      };
    }

    case "UPDATE_PLAYER":
      return {
        ...state,
        players: state.players.map((p, i) =>
          i === action.index ? action.name : p
        ),
      };

    case "TOGGLE_CATEGORY": {
      const exists = state.selectedCategories.some((c) => c.id === action.category.id);
      return {
        ...state,
        selectedCategories: exists
          ? state.selectedCategories.filter((c) => c.id !== action.category.id)
          : [...state.selectedCategories, action.category],
      };
    }

    case "SET_IMPOSTOR_COUNT":
      return { ...state, impostorCount: action.count };

    case "SET_LOCALE":
      return { ...state, locale: action.locale };

    case "TOGGLE_CATEGORY_VISIBILITY":
      return { ...state, categoryVisibility: !state.categoryVisibility };

    case "TOGGLE_HINTS":
      return { ...state, hintsEnabled: !state.hintsEnabled };

    case "START_GAME": {
      const validPlayers = state.players.filter((p) => p.trim() !== "");
      if (validPlayers.length < 3 || state.selectedCategories.length === 0) return state;
      if (validPlayers.length - state.impostorCount < 2) return state;

      const category = getRandomElement(state.selectedCategories);
      const cat = CATEGORIES.find((c) => c.id === category.id) ?? category;
      const words = cat.words;
      if (words.length === 0) return state;

      const secretWord = getRandomElement(words);
      const hints = shuffleArray(getHintsForWord(cat, secretWord));
      const shuffledOrder = shuffleArray(validPlayers);

      const impostorIndices = new Set<number>();
      while (impostorIndices.size < state.impostorCount) {
        impostorIndices.add(
          Math.floor(Math.random() * shuffledOrder.length)
        );
      }

      const playerRoles: Record<string, PlayerRole> = {};
      const impostorHints: Record<string, string> = {};
      const impostorNames = shuffledOrder
        .map((name, idx) => (impostorIndices.has(idx) ? name : null))
        .filter(Boolean) as string[];
      impostorNames.forEach((name, i) => {
        playerRoles[name] = "impostor";
        impostorHints[name] = hints[i % hints.length];
      });
      shuffledOrder.forEach((name) => {
        if (playerRoles[name] !== "impostor") playerRoles[name] = "civilian";
      });

      const firstPlayer = getRandomElement(shuffledOrder);

      return {
        ...state,
        phase: "passing",
        gameState: {
          secretWord,
          impostorHints,
          playerRoles,
          shuffledOrder,
          currentPlayerIndex: 0,
          firstPlayer,
          revealedPlayers: new Set(),
          flippingToNextIndex: null,
        },
      };
    }

    case "NEXT_PLAYER": {
      if (!state.gameState) return state;
      const { shuffledOrder, currentPlayerIndex } = state.gameState;
      const nextIndex = currentPlayerIndex + 1;
      if (nextIndex >= shuffledOrder.length) {
        return { ...state, phase: "playing" };
      }
      return {
        ...state,
        phase: "passing",
        gameState: {
          ...state.gameState,
          currentPlayerIndex: nextIndex,
        },
      };
    }

    case "REVEAL_ROLE": {
      if (!state.gameState) return state;
      const revealed = new Set(state.gameState.revealedPlayers);
      revealed.add(action.playerName);
      return {
        ...state,
        phase: "revealing",
        gameState: {
          ...state.gameState,
          revealedPlayers: revealed,
        },
      };
    }

    case "HIDE_ROLE": {
      if (!state.gameState) return state;
      const { shuffledOrder, currentPlayerIndex } = state.gameState;
      const nextIndex = currentPlayerIndex + 1;
      if (nextIndex >= shuffledOrder.length) {
        return { ...state, phase: "playing" };
      }
      // No avanzar aún: primero flip, luego COMPLETE_FLIP_TO_NEXT evita que se vea el rol del siguiente
      return {
        ...state,
        phase: "passing",
        gameState: {
          ...state.gameState,
          flippingToNextIndex: nextIndex,
        },
      };
    }

    case "COMPLETE_FLIP_TO_NEXT": {
      if (!state.gameState || state.gameState.flippingToNextIndex === null)
        return state;
      const nextIndex = state.gameState.flippingToNextIndex;
      return {
        ...state,
        gameState: {
          ...state.gameState,
          currentPlayerIndex: nextIndex,
          flippingToNextIndex: null,
        },
      };
    }

    case "REVEAL_AND_FINISH":
      return { ...state, phase: "ended" };

    case "SHOW_CARD_FOR_PLAYER":
      return { ...state, repeatCardForPlayer: action.playerName };

    case "CLEAR_REPEAT_CARD":
      return { ...state, repeatCardForPlayer: null };

    case "FINISH_GAME":
      // Volver a setup manteniendo jugadores, categorías e impostores para jugar de nuevo rápido
      return {
        ...state,
        phase: "setup",
        gameState: null,
      };

    case "RESTART_CARD_VIEW": {
      if (!state.gameState) return state;
      return {
        ...state,
        phase: "passing",
        gameState: {
          ...state.gameState,
          currentPlayerIndex: 0,
          revealedPlayers: new Set(),
          flippingToNextIndex: null,
        },
      };
    }

    case "RESTART_GAME": {
      const validPlayers = state.players.filter((p) => p.trim() !== "");
      if (validPlayers.length < 3 || state.selectedCategories.length === 0)
        return state;
      if (validPlayers.length - state.impostorCount < 2) return state;

      const category = getRandomElement(state.selectedCategories);
      const cat = CATEGORIES.find((c) => c.id === category.id) ?? category;
      const words = cat.words;
      if (words.length === 0) return state;

      const secretWord = getRandomElement(words);
      const hints = shuffleArray(getHintsForWord(cat, secretWord));
      const shuffledOrder = shuffleArray(validPlayers);

      const impostorIndices = new Set<number>();
      while (impostorIndices.size < state.impostorCount) {
        impostorIndices.add(
          Math.floor(Math.random() * shuffledOrder.length)
        );
      }

      const playerRoles: Record<string, PlayerRole> = {};
      const impostorHints: Record<string, string> = {};
      const impostorNames = shuffledOrder
        .map((name, idx) => (impostorIndices.has(idx) ? name : null))
        .filter(Boolean) as string[];
      impostorNames.forEach((name, i) => {
        playerRoles[name] = "impostor";
        impostorHints[name] = hints[i % hints.length];
      });
      shuffledOrder.forEach((name) => {
        if (playerRoles[name] !== "impostor") playerRoles[name] = "civilian";
      });

      const firstPlayer = getRandomElement(shuffledOrder);

      return {
        ...state,
        phase: "passing",
        gameState: {
          secretWord,
          impostorHints,
          playerRoles,
          shuffledOrder,
          currentPlayerIndex: 0,
          firstPlayer,
          revealedPlayers: new Set(),
          flippingToNextIndex: null,
        },
      };
    }

    default:
      return state;
  }
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  useEffect(() => {
    const stored = getStoredLocale();
    if (stored && stored !== state.locale) {
      dispatch({ type: "SET_LOCALE", locale: stored });
    }
  }, []);

  const addPlayer = useCallback((name?: string) => {
    dispatch({ type: "ADD_PLAYER", name });
  }, []);

  const removePlayer = useCallback((index: number) => {
    dispatch({ type: "REMOVE_PLAYER", index });
  }, []);

  const updatePlayer = useCallback((index: number, name: string) => {
    dispatch({ type: "UPDATE_PLAYER", index, name });
  }, []);

  const toggleCategory = useCallback((category: Category) => {
    dispatch({ type: "TOGGLE_CATEGORY", category });
  }, []);

  const setImpostorCount = useCallback((count: number) => {
    dispatch({ type: "SET_IMPOSTOR_COUNT", count });
  }, []);

  const setLocale = useCallback((locale: Locale) => {
    dispatch({ type: "SET_LOCALE", locale });
    try {
      localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleCategoryVisibility = useCallback(() => {
    dispatch({ type: "TOGGLE_CATEGORY_VISIBILITY" });
  }, []);

  const toggleHints = useCallback(() => {
    dispatch({ type: "TOGGLE_HINTS" });
  }, []);

  const startGame = useCallback(() => {
    dispatch({ type: "START_GAME" });
  }, []);

  const nextPlayer = useCallback(() => {
    dispatch({ type: "NEXT_PLAYER" });
  }, []);

  const revealRole = useCallback((playerName: string) => {
    dispatch({ type: "REVEAL_ROLE", playerName });
  }, []);

  const hideRole = useCallback(() => {
    dispatch({ type: "HIDE_ROLE" });
  }, []);

  const completeFlipToNext = useCallback(() => {
    dispatch({ type: "COMPLETE_FLIP_TO_NEXT" });
  }, []);

  const revealAndFinish = useCallback(() => {
    dispatch({ type: "REVEAL_AND_FINISH" });
  }, []);

  const finishGame = useCallback(() => {
    dispatch({ type: "FINISH_GAME" });
  }, []);

  const restartCardView = useCallback(() => {
    dispatch({ type: "RESTART_CARD_VIEW" });
  }, []);

  const restartGame = useCallback(() => {
    dispatch({ type: "RESTART_GAME" });
  }, []);

  const showCardForPlayer = useCallback((playerName: string) => {
    dispatch({ type: "SHOW_CARD_FOR_PLAYER", playerName });
  }, []);

  const clearRepeatCard = useCallback(() => {
    dispatch({ type: "CLEAR_REPEAT_CARD" });
  }, []);

  const value: GameContextValue = {
    ...state,
    addPlayer,
    removePlayer,
    updatePlayer,
    toggleCategory,
    setImpostorCount,
    setLocale,
    toggleCategoryVisibility,
    toggleHints,
    startGame,
    nextPlayer,
    revealRole,
    hideRole,
    completeFlipToNext,
    revealAndFinish,
    finishGame,
    restartCardView,
    restartGame,
    showCardForPlayer,
    clearRepeatCard,
  };

  return (
    <GameContext.Provider value={value}>{children}</GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
