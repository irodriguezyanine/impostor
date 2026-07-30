"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Category } from "@/data/categories";
import { CATEGORIES } from "@/data/categories";
import {
  createInitialState,
  gameReducer,
  type GameContextState,
} from "@/context/gameReducer";
import {
  clearPersistedGame,
  loadPersistedGame,
  savePersistedGame,
} from "@/lib/game-storage";
import { LOCALES, type Locale } from "@/lib/i18n";

export type { GamePhase, GameState, PlayerRole } from "@/lib/game-logic";
export type { Player } from "@/lib/players";

type GameContextValue = GameContextState & {
  /** `false` hasta que se lee sessionStorage; evita redirigir una partida en curso. */
  isHydrated: boolean;
  addPlayer: (name?: string) => void;
  removePlayer: (id: string) => void;
  updatePlayer: (id: string, name: string) => void;
  toggleCategory: (category: Category) => void;
  setImpostorCount: (count: number) => void;
  setLocale: (locale: Locale) => void;
  toggleCategoryVisibility: () => void;
  toggleHints: () => void;
  startGame: () => void;
  revealRole: (playerId: string) => void;
  hideRole: () => void;
  completeFlipToNext: () => void;
  revealAndFinish: () => void;
  finishGame: () => void;
  restartCardView: () => void;
  restartGame: () => void;
  showCardForPlayer: (playerId: string) => void;
  clearRepeatCard: () => void;
};

const LOCALE_STORAGE_KEY = "imposter-locale";

function getStoredLocale(): Locale | null {
  try {
    if (typeof window === "undefined") return null;
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored && (LOCALES as readonly string[]).includes(stored)) {
      return stored as Locale;
    }
  } catch {
    /* localStorage bloqueado: se usa el idioma por defecto */
  }
  return null;
}

function storeLocale(locale: Locale): void {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    /* ignore */
  }
}

function findCategories(ids: readonly string[]): Category[] {
  return ids
    .map((id) => CATEGORIES.find((category) => category.id === id))
    .filter((category): category is Category => Boolean(category));
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState);
  const [isHydrated, setIsHydrated] = useState(false);
  const hasHydrated = useRef(false);

  // Rehidratación tras montar (no en render) para no romper el HTML del servidor.
  useEffect(() => {
    if (hasHydrated.current) return;
    hasHydrated.current = true;

    const snapshot = loadPersistedGame();
    if (snapshot) {
      dispatch({
        type: "RESTORE",
        snapshot: {
          players: snapshot.players,
          nextPlayerId: snapshot.nextPlayerId,
          selectedCategories: findCategories(snapshot.selectedCategoryIds),
          impostorCount: snapshot.impostorCount,
          phase: snapshot.phase,
          gameState: snapshot.gameState,
          categoryVisibility: snapshot.categoryVisibility,
          hintsEnabled: snapshot.hintsEnabled,
        },
      });
    }

    const storedLocale = getStoredLocale();
    if (storedLocale) {
      dispatch({ type: "SET_LOCALE", locale: storedLocale });
    }

    setIsHydrated(true);
  }, []);

  // Una partida en curso sobrevive a recargas accidentales.
  useEffect(() => {
    if (!isHydrated) return;

    if (state.phase === "setup" || !state.gameState) {
      clearPersistedGame();
      return;
    }

    savePersistedGame({
      players: state.players,
      nextPlayerId: state.nextPlayerId,
      selectedCategoryIds: state.selectedCategories.map(
        (category) => category.id
      ),
      impostorCount: state.impostorCount,
      phase: state.phase,
      categoryVisibility: state.categoryVisibility,
      hintsEnabled: state.hintsEnabled,
      gameState: state.gameState,
    });
  }, [
    isHydrated,
    state.phase,
    state.gameState,
    state.players,
    state.nextPlayerId,
    state.selectedCategories,
    state.impostorCount,
    state.categoryVisibility,
    state.hintsEnabled,
  ]);

  const addPlayer = useCallback((name?: string) => {
    dispatch({ type: "ADD_PLAYER", name });
  }, []);

  const removePlayer = useCallback((id: string) => {
    dispatch({ type: "REMOVE_PLAYER", id });
  }, []);

  const updatePlayer = useCallback((id: string, name: string) => {
    dispatch({ type: "UPDATE_PLAYER", id, name });
  }, []);

  const toggleCategory = useCallback((category: Category) => {
    dispatch({ type: "TOGGLE_CATEGORY", category });
  }, []);

  const setImpostorCount = useCallback((count: number) => {
    dispatch({ type: "SET_IMPOSTOR_COUNT", count });
  }, []);

  const setLocale = useCallback((locale: Locale) => {
    dispatch({ type: "SET_LOCALE", locale });
    storeLocale(locale);
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

  const revealRole = useCallback((playerId: string) => {
    dispatch({ type: "REVEAL_ROLE", playerId });
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

  const showCardForPlayer = useCallback((playerId: string) => {
    dispatch({ type: "SHOW_CARD_FOR_PLAYER", playerId });
  }, []);

  const clearRepeatCard = useCallback(() => {
    dispatch({ type: "CLEAR_REPEAT_CARD" });
  }, []);

  const value = useMemo<GameContextValue>(
    () => ({
      ...state,
      isHydrated,
      addPlayer,
      removePlayer,
      updatePlayer,
      toggleCategory,
      setImpostorCount,
      setLocale,
      toggleCategoryVisibility,
      toggleHints,
      startGame,
      revealRole,
      hideRole,
      completeFlipToNext,
      revealAndFinish,
      finishGame,
      restartCardView,
      restartGame,
      showCardForPlayer,
      clearRepeatCard,
    }),
    [
      state,
      isHydrated,
      addPlayer,
      removePlayer,
      updatePlayer,
      toggleCategory,
      setImpostorCount,
      setLocale,
      toggleCategoryVisibility,
      toggleHints,
      startGame,
      revealRole,
      hideRole,
      completeFlipToNext,
      revealAndFinish,
      finishGame,
      restartCardView,
      restartGame,
      showCardForPlayer,
      clearRepeatCard,
    ]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
