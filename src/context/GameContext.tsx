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
import { CATEGORIES } from "@/data/categories";
import { LOCALES, type Locale } from "@/lib/i18n";

export type GamePhase = "setup" | "passing" | "revealing" | "playing";

export type PlayerRole = "civilian" | "impostor";

export type GameState = {
  secretWord: string;
  playerRoles: Record<string, PlayerRole>;
  shuffledOrder: string[];
  currentPlayerIndex: number;
  firstPlayer: string;
  revealedPlayers: Set<string>;
};

type GameContextState = {
  players: string[];
  selectedCategory: Category | null;
  impostorCount: 1 | 2 | 3;
  phase: GamePhase;
  gameState: GameState | null;
  locale: Locale;
};

type GameContextValue = GameContextState & {
  addPlayer: (name?: string) => void;
  removePlayer: (index: number) => void;
  updatePlayer: (index: number, name: string) => void;
  setSelectedCategory: (category: Category | null) => void;
  setImpostorCount: (count: 1 | 2 | 3) => void;
  setLocale: (locale: Locale) => void;
  startGame: () => void;
  nextPlayer: () => void;
  revealRole: (playerName: string) => void;
  hideRole: () => void;
  finishGame: () => void;
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
  selectedCategory: null,
  impostorCount: 1,
  phase: "setup",
  gameState: null,
  locale: "es",
};

type Action =
  | { type: "ADD_PLAYER"; name?: string }
  | { type: "REMOVE_PLAYER"; index: number }
  | { type: "UPDATE_PLAYER"; index: number; name: string }
  | { type: "SET_CATEGORY"; category: Category | null }
  | { type: "SET_IMPOSTOR_COUNT"; count: 1 | 2 | 3 }
  | { type: "SET_LOCALE"; locale: Locale }
  | { type: "START_GAME" }
  | { type: "NEXT_PLAYER" }
  | { type: "REVEAL_ROLE"; playerName: string }
  | { type: "HIDE_ROLE" }
  | { type: "FINISH_GAME" };

function gameReducer(state: GameContextState, action: Action): GameContextState {
  switch (action.type) {
    case "ADD_PLAYER":
      if (state.players.length >= 20) return state;
      return { ...state, players: [...state.players, ""] };

    case "REMOVE_PLAYER":
      if (state.players.length <= 2) return state;
      return {
        ...state,
        players: state.players.filter((_, i) => i !== action.index),
      };

    case "UPDATE_PLAYER":
      return {
        ...state,
        players: state.players.map((p, i) =>
          i === action.index ? action.name : p
        ),
      };

    case "SET_CATEGORY":
      return { ...state, selectedCategory: action.category };

    case "SET_IMPOSTOR_COUNT":
      return { ...state, impostorCount: action.count };

    case "SET_LOCALE":
      return { ...state, locale: action.locale };

    case "START_GAME": {
      const validPlayers = state.players.filter((p) => p.trim() !== "");
      if (validPlayers.length < 3 || !state.selectedCategory) return state;
      if (validPlayers.length - state.impostorCount < 2) return state;

      const category = CATEGORIES.find(
        (c) => c.id === state.selectedCategory!.id
      ) ?? state.selectedCategory;
      const words = category.words;
      if (words.length === 0) return state;

      const secretWord = getRandomElement(words);
      const shuffledOrder = shuffleArray(validPlayers);

      const impostorIndices = new Set<number>();
      while (impostorIndices.size < state.impostorCount) {
        impostorIndices.add(
          Math.floor(Math.random() * shuffledOrder.length)
        );
      }

      const playerRoles: Record<string, PlayerRole> = {};
      shuffledOrder.forEach((name, idx) => {
        playerRoles[name] = impostorIndices.has(idx) ? "impostor" : "civilian";
      });

      const firstPlayer = getRandomElement(shuffledOrder);

      return {
        ...state,
        phase: "passing",
        gameState: {
          secretWord,
          playerRoles,
          shuffledOrder,
          currentPlayerIndex: 0,
          firstPlayer,
          revealedPlayers: new Set(),
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
      return {
        ...state,
        phase: "passing",
        gameState: {
          ...state.gameState,
          currentPlayerIndex: nextIndex,
        },
      };
    }

    case "FINISH_GAME":
      return {
        ...initialState,
        locale: state.locale,
      };

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

  const setSelectedCategory = useCallback((category: Category | null) => {
    dispatch({ type: "SET_CATEGORY", category });
  }, []);

  const setImpostorCount = useCallback((count: 1 | 2 | 3) => {
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

  const finishGame = useCallback(() => {
    dispatch({ type: "FINISH_GAME" });
  }, []);

  const value: GameContextValue = {
    ...state,
    addPlayer,
    removePlayer,
    updatePlayer,
    setSelectedCategory,
    setImpostorCount,
    setLocale,
    startGame,
    nextPlayer,
    revealRole,
    hideRole,
    finishGame,
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
