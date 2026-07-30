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
import {
  loadSettings,
  saveSettings,
  type GameSettings,
} from "@/lib/game-settings";
import { LOCALES, type Locale } from "@/lib/i18n";
import { loadCustomCategories } from "@/lib/custom-categories";
import { track } from "@/lib/product-stubs";

export type { GamePhase, GameState, PlayerRole } from "@/lib/game-logic";
export type { Player } from "@/lib/players";

type GameContextValue = GameContextState & {
  isHydrated: boolean;
  allCategories: Category[];
  addPlayer: (name?: string) => void;
  removePlayer: (id: string) => void;
  updatePlayer: (id: string, name: string) => void;
  setPlayersFromNames: (names: string[]) => void;
  toggleCategory: (category: Category) => void;
  setCategories: (categories: Category[]) => void;
  setImpostorCount: (count: number) => void;
  setLocale: (locale: Locale) => void;
  toggleCategoryVisibility: () => void;
  toggleHints: () => void;
  patchSettings: (patch: Partial<GameSettings>) => void;
  startGame: () => void;
  revealRole: (playerId: string) => void;
  hideRole: () => void;
  completeFlipToNext: () => void;
  beginDiscussion: () => void;
  nextSpeaker: () => void;
  setWrittenClue: (playerId: string, clue: string) => void;
  finishClueRound: () => void;
  beginVoting: () => void;
  castVote: (voterId: string, accusedId: string) => void;
  resolveVotes: () => void;
  finishLastWord: () => void;
  skipToReveal: () => void;
  revealAndFinish: () => void;
  finishGame: () => void;
  restartCardView: () => void;
  restartGame: () => void;
  showCardForPlayer: (playerId: string) => void;
  clearRepeatCard: () => void;
  dismissOnboarding: () => void;
  refreshCustomCategories: () => void;
};

const LOCALE_STORAGE_KEY = "imposter-locale";
const ONBOARDING_KEY = "impostor:onboarding-done";

function getStoredLocale(): Locale | null {
  try {
    if (typeof window === "undefined") return null;
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored && (LOCALES as readonly string[]).includes(stored)) {
      return stored as Locale;
    }
  } catch {
    /* ignore */
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
  const custom = loadCustomCategories();
  const all = [...CATEGORIES, ...custom];
  return ids
    .map((id) => all.find((category) => category.id === id))
    .filter((category): category is Category => Boolean(category));
}

function applyTheme(theme: GameSettings["theme"]): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.classList.toggle("light-theme", theme === "light");
  root.classList.toggle("high-contrast", theme === "high-contrast");
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState);
  const [isHydrated, setIsHydrated] = useState(false);
  const [customTick, setCustomTick] = useState(0);
  const hasHydrated = useRef(false);

  useEffect(() => {
    if (hasHydrated.current) return;
    hasHydrated.current = true;

    const settings = loadSettings();
    dispatch({ type: "PATCH_SETTINGS", patch: settings });
    applyTheme(settings.theme);

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
          impostorHistory: snapshot.impostorHistory,
          settings: snapshot.settings,
          nightBoard: snapshot.nightBoard,
          ballots: snapshot.ballots,
          voteAccusedId: snapshot.voteAccusedId,
          lastWordPlayerId: snapshot.lastWordPlayerId,
          civiliansWon: snapshot.civiliansWon,
        },
      });
      applyTheme(snapshot.settings.theme);
    }

    const storedLocale = getStoredLocale();
    if (storedLocale) {
      dispatch({ type: "SET_LOCALE", locale: storedLocale });
    }

    try {
      if (window.localStorage.getItem(ONBOARDING_KEY) === "1") {
        dispatch({ type: "DISMISS_ONBOARDING" });
      }
    } catch {
      /* ignore */
    }

    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    saveSettings(state.settings);
    applyTheme(state.settings.theme);
  }, [isHydrated, state.settings]);

  useEffect(() => {
    if (!isHydrated) return;

    if (state.phase === "setup" || !state.gameState) {
      clearPersistedGame();
      return;
    }

    savePersistedGame({
      players: state.players,
      nextPlayerId: state.nextPlayerId,
      selectedCategoryIds: state.selectedCategories.map((c) => c.id),
      impostorCount: state.impostorCount,
      phase: state.phase,
      categoryVisibility: state.categoryVisibility,
      hintsEnabled: state.hintsEnabled,
      gameState: state.gameState,
      impostorHistory: state.impostorHistory,
      settings: state.settings,
      nightBoard: state.nightBoard,
      ballots: state.ballots,
      voteAccusedId: state.voteAccusedId,
      lastWordPlayerId: state.lastWordPlayerId,
      civiliansWon: state.civiliansWon,
    });
  }, [isHydrated, state]);

  const addPlayer = useCallback((name?: string) => {
    dispatch({ type: "ADD_PLAYER", name });
  }, []);
  const removePlayer = useCallback((id: string) => {
    dispatch({ type: "REMOVE_PLAYER", id });
  }, []);
  const updatePlayer = useCallback((id: string, name: string) => {
    dispatch({ type: "UPDATE_PLAYER", id, name });
  }, []);
  const setPlayersFromNames = useCallback((names: string[]) => {
    dispatch({ type: "SET_PLAYERS_FROM_NAMES", names });
  }, []);
  const toggleCategory = useCallback((category: Category) => {
    dispatch({ type: "TOGGLE_CATEGORY", category });
  }, []);
  const setCategories = useCallback((categories: Category[]) => {
    dispatch({ type: "SET_CATEGORIES", categories });
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
  const patchSettings = useCallback((patch: Partial<GameSettings>) => {
    dispatch({ type: "PATCH_SETTINGS", patch });
  }, []);
  const startGame = useCallback(() => {
    track({
      name: "game_start",
      players: state.players.filter((p) => p.name.trim()).length,
      mode: state.settings.mode,
    });
    dispatch({ type: "START_GAME" });
  }, [state.players, state.settings.mode]);
  const revealRole = useCallback((playerId: string) => {
    dispatch({ type: "REVEAL_ROLE", playerId });
  }, []);
  const hideRole = useCallback(() => {
    dispatch({ type: "HIDE_ROLE" });
  }, []);
  const completeFlipToNext = useCallback(() => {
    dispatch({ type: "COMPLETE_FLIP_TO_NEXT" });
  }, []);
  const beginDiscussion = useCallback(() => {
    dispatch({ type: "BEGIN_DISCUSSION" });
  }, []);
  const nextSpeaker = useCallback(() => {
    dispatch({ type: "NEXT_SPEAKER" });
  }, []);
  const setWrittenClue = useCallback((playerId: string, clue: string) => {
    dispatch({ type: "SET_WRITTEN_CLUE", playerId, clue });
  }, []);
  const finishClueRound = useCallback(() => {
    dispatch({ type: "FINISH_CLUE_ROUND" });
  }, []);
  const beginVoting = useCallback(() => {
    dispatch({ type: "BEGIN_VOTING" });
  }, []);
  const castVote = useCallback((voterId: string, accusedId: string) => {
    dispatch({ type: "CAST_VOTE", voterId, accusedId });
  }, []);
  const resolveVotes = useCallback(() => {
    dispatch({ type: "RESOLVE_VOTES" });
  }, []);
  const finishLastWord = useCallback(() => {
    dispatch({ type: "FINISH_LAST_WORD" });
  }, []);
  const skipToReveal = useCallback(() => {
    dispatch({ type: "SKIP_TO_REVEAL" });
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
  const dismissOnboarding = useCallback(() => {
    try {
      window.localStorage.setItem(ONBOARDING_KEY, "1");
    } catch {
      /* ignore */
    }
    dispatch({ type: "DISMISS_ONBOARDING" });
  }, []);
  const refreshCustomCategories = useCallback(() => {
    setCustomTick((n) => n + 1);
  }, []);

  const allCategories = useMemo(() => {
    void customTick;
    return [...CATEGORIES, ...loadCustomCategories()];
  }, [customTick]);

  const value = useMemo<GameContextValue>(
    () => ({
      ...state,
      isHydrated,
      allCategories,
      addPlayer,
      removePlayer,
      updatePlayer,
      setPlayersFromNames,
      toggleCategory,
      setCategories,
      setImpostorCount,
      setLocale,
      toggleCategoryVisibility,
      toggleHints,
      patchSettings,
      startGame,
      revealRole,
      hideRole,
      completeFlipToNext,
      beginDiscussion,
      nextSpeaker,
      setWrittenClue,
      finishClueRound,
      beginVoting,
      castVote,
      resolveVotes,
      finishLastWord,
      skipToReveal,
      revealAndFinish,
      finishGame,
      restartCardView,
      restartGame,
      showCardForPlayer,
      clearRepeatCard,
      dismissOnboarding,
      refreshCustomCategories,
    }),
    [
      state,
      isHydrated,
      allCategories,
      addPlayer,
      removePlayer,
      updatePlayer,
      setPlayersFromNames,
      toggleCategory,
      setCategories,
      setImpostorCount,
      setLocale,
      toggleCategoryVisibility,
      toggleHints,
      patchSettings,
      startGame,
      revealRole,
      hideRole,
      completeFlipToNext,
      beginDiscussion,
      nextSpeaker,
      setWrittenClue,
      finishClueRound,
      beginVoting,
      castVote,
      resolveVotes,
      finishLastWord,
      skipToReveal,
      revealAndFinish,
      finishGame,
      restartCardView,
      restartGame,
      showCardForPlayer,
      clearRepeatCard,
      dismissOnboarding,
      refreshCustomCategories,
    ]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
