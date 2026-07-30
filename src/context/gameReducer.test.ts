import { describe, expect, it } from "vitest";
import {
  createInitialState,
  gameReducer,
  type GameContextState,
} from "@/context/gameReducer";
import { MAX_PLAYERS } from "@/lib/players";
import { TEST_CATEGORY, makePlayers } from "@/lib/test-fixtures";

function setupState(
  names: string[],
  overrides: Partial<GameContextState> = {}
): GameContextState {
  return {
    ...createInitialState(),
    players: makePlayers(...names),
    nextPlayerId: names.length + 1,
    selectedCategories: [TEST_CATEGORY],
    ...overrides,
  };
}

function startedState(names: string[], impostorCount = 1): GameContextState {
  const state = setupState(names, { impostorCount });
  const started = gameReducer(state, { type: "START_GAME" });
  expect(started.gameState).not.toBeNull();
  return started;
}

function impostorIdsOf(state: GameContextState): string[] {
  return Object.entries(state.gameState!.playerRoles)
    .filter(([, role]) => role === "impostor")
    .map(([id]) => id);
}

describe("gestión de jugadores", () => {
  it("añade un jugador con el nombre indicado", () => {
    const next = gameReducer(createInitialState(), {
      type: "ADD_PLAYER",
      name: "Ana",
    });
    expect(next.players).toHaveLength(4);
    expect(next.players[3].name).toBe("Ana");
  });

  it("asigna ids únicos a cada jugador nuevo", () => {
    let state = createInitialState();
    state = gameReducer(state, { type: "ADD_PLAYER" });
    state = gameReducer(state, { type: "ADD_PLAYER" });
    const ids = state.players.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("no supera el máximo de jugadores", () => {
    let state = createInitialState();
    for (let i = 0; i < 30; i++) {
      state = gameReducer(state, { type: "ADD_PLAYER" });
    }
    expect(state.players).toHaveLength(MAX_PLAYERS);
  });

  it("elimina por id, no por posición", () => {
    const state = setupState(["Ana", "Bea", "Caro"]);
    const next = gameReducer(state, { type: "REMOVE_PLAYER", id: "p2" });
    expect(next.players.map((p) => p.name)).toEqual(["Ana", "Caro"]);
  });

  it("no deja bajar de 2 jugadores", () => {
    const state = setupState(["Ana", "Bea"]);
    const next = gameReducer(state, { type: "REMOVE_PLAYER", id: "p1" });
    expect(next.players).toHaveLength(2);
  });

  it("actualiza el nombre por id", () => {
    const state = setupState(["Ana", "Bea", "Caro"]);
    const next = gameReducer(state, {
      type: "UPDATE_PLAYER",
      id: "p2",
      name: "Beatriz",
    });
    expect(next.players[1].name).toBe("Beatriz");
  });
});

describe("número de impostores", () => {
  it("recorta el valor al rango permitido", () => {
    const state = setupState(["Ana", "Bea", "Caro", "Dani"]);
    expect(
      gameReducer(state, { type: "SET_IMPOSTOR_COUNT", count: 99 })
        .impostorCount
    ).toBe(2);
    expect(
      gameReducer(state, { type: "SET_IMPOSTOR_COUNT", count: 0 }).impostorCount
    ).toBe(1);
  });

  it("se reajusta al eliminar jugadores", () => {
    const state = setupState(["Ana", "Bea", "Caro", "Dani", "Eva"], {
      impostorCount: 3,
    });
    const next = gameReducer(state, { type: "REMOVE_PLAYER", id: "p5" });
    expect(next.impostorCount).toBe(2);
  });

  // Antes el contador quedaba desfasado al vaciar un nombre y el botón de
  // empezar se deshabilitaba sin explicación alguna.
  it("se reajusta al borrar el nombre de un jugador", () => {
    const state = setupState(["Ana", "Bea", "Caro", "Dani", "Eva"], {
      impostorCount: 3,
    });
    const next = gameReducer(state, { type: "UPDATE_PLAYER", id: "p5", name: "" });
    expect(next.impostorCount).toBe(2);
  });
});

describe("inicio de partida", () => {
  it("pasa a la fase de reparto con estado de juego", () => {
    const state = startedState(["Ana", "Bea", "Caro"]);
    expect(state.phase).toBe("passing");
    expect(state.gameState!.shuffledOrder).toHaveLength(3);
  });

  it("no arranca sin categorías seleccionadas", () => {
    const state = setupState(["Ana", "Bea", "Caro"], {
      selectedCategories: [],
    });
    const next = gameReducer(state, { type: "START_GAME" });
    expect(next.phase).toBe("setup");
    expect(next.gameState).toBeNull();
  });

  it("no arranca con demasiados impostores", () => {
    const state = setupState(["Ana", "Bea", "Caro"], { impostorCount: 2 });
    expect(gameReducer(state, { type: "START_GAME" }).gameState).toBeNull();
  });
});

describe("paso del teléfono", () => {
  it("revela solo al jugador indicado", () => {
    const state = startedState(["Ana", "Bea", "Caro"]);
    const first = state.gameState!.shuffledOrder[0];
    const next = gameReducer(state, { type: "REVEAL_ROLE", playerId: first.id });
    expect(next.phase).toBe("revealing");
    expect(next.gameState!.revealedPlayers.has(first.id)).toBe(true);
    expect(next.gameState!.revealedPlayers.size).toBe(1);
  });

  // Bug crítico: con dos "Juan" el segundo veía su carta ya destapada.
  it("no arrastra el revelado entre jugadores homónimos", () => {
    const state = startedState(["Juan", "Juan", "Ana"]);
    const [first, second] = state.gameState!.shuffledOrder;
    const revealed = gameReducer(state, {
      type: "REVEAL_ROLE",
      playerId: first.id,
    });
    expect(revealed.gameState!.revealedPlayers.has(second.id)).toBe(false);
  });

  it("hace el flip antes de avanzar para no delatar al siguiente", () => {
    const state = startedState(["Ana", "Bea", "Caro"]);
    const first = state.gameState!.shuffledOrder[0];
    const revealed = gameReducer(state, {
      type: "REVEAL_ROLE",
      playerId: first.id,
    });
    const hidden = gameReducer(revealed, { type: "HIDE_ROLE" });

    expect(hidden.phase).toBe("passing");
    expect(hidden.gameState!.flippingToNextIndex).toBe(1);
    expect(hidden.gameState!.currentPlayerIndex).toBe(0);

    const advanced = gameReducer(hidden, { type: "COMPLETE_FLIP_TO_NEXT" });
    expect(advanced.gameState!.currentPlayerIndex).toBe(1);
    expect(advanced.gameState!.flippingToNextIndex).toBeNull();
  });

  it("pasa a jugar cuando el último jugador oculta su carta", () => {
    let state = startedState(["Ana", "Bea", "Caro"]);
    for (let i = 0; i < 3; i++) {
      const current =
        state.gameState!.shuffledOrder[state.gameState!.currentPlayerIndex];
      state = gameReducer(state, { type: "REVEAL_ROLE", playerId: current.id });
      state = gameReducer(state, { type: "HIDE_ROLE" });
      if (state.gameState?.flippingToNextIndex !== null) {
        state = gameReducer(state, { type: "COMPLETE_FLIP_TO_NEXT" });
      }
    }
    expect(state.phase).toBe("discussing");
  });
});

describe("repetir y terminar", () => {
  it("reparte de nuevo evitando a los impostores anteriores", () => {
    const state = startedState(["Ana", "Bea", "Caro", "Dani", "Eva"]);
    const previous = impostorIdsOf(state);
    const next = gameReducer(state, { type: "RESTART_GAME" });
    for (const id of impostorIdsOf(next)) {
      expect(previous).not.toContain(id);
    }
  });

  // Jugando de verdad: 5 amigos que repiten partida una y otra vez.
  it("reparte el rol de impostor por turnos a lo largo de la noche", () => {
    const names = ["Ana", "Bea", "Caro", "Dani", "Eva"];
    let state = startedState(names);
    const rounds = [impostorIdsOf(state)];

    for (let i = 0; i < 19; i++) {
      state = gameReducer(state, { type: "RESTART_GAME" });
      rounds.push(impostorIdsOf(state));
    }

    // Primera vuelta: cinco personas distintas, nadie repite.
    expect(new Set(rounds.slice(0, 5).flat()).size).toBe(5);

    // Nunca dos rondas seguidas la misma persona.
    for (let i = 1; i < rounds.length; i++) {
      expect(rounds[i].filter((id) => rounds[i - 1].includes(id))).toEqual([]);
    }

    // Al final del reparto todos han sido impostor casi las mismas veces.
    const times = state.players.map(
      (player) => state.impostorHistory.counts[player.id] ?? 0
    );
    expect(Math.max(...times) - Math.min(...times)).toBeLessThanOrEqual(1);
  });

  it("sigue rotando aunque se vuelva al menú entre partidas", () => {
    let state = startedState(["Ana", "Bea", "Caro", "Dani"]);
    const first = impostorIdsOf(state);

    state = gameReducer(state, { type: "FINISH_GAME" });
    state = gameReducer(state, { type: "START_GAME" });

    expect(impostorIdsOf(state)).not.toEqual(first);
    expect(state.impostorHistory.round).toBe(2);
  });

  it("vuelve a mostrar las cartas desde el principio sin revelados", () => {
    const state = startedState(["Ana", "Bea", "Caro"]);
    const first = state.gameState!.shuffledOrder[0];
    const revealed = gameReducer(state, {
      type: "REVEAL_ROLE",
      playerId: first.id,
    });
    const restarted = gameReducer(revealed, { type: "RESTART_CARD_VIEW" });

    expect(restarted.phase).toBe("passing");
    expect(restarted.gameState!.currentPlayerIndex).toBe(0);
    expect(restarted.gameState!.revealedPlayers.size).toBe(0);
  });

  it("al terminar conserva la configuración pero borra la partida", () => {
    const state = startedState(["Ana", "Bea", "Caro"]);
    const finished = gameReducer(state, { type: "FINISH_GAME" });
    expect(finished.phase).toBe("setup");
    expect(finished.gameState).toBeNull();
    expect(finished.players).toHaveLength(3);
    expect(finished.selectedCategories).toHaveLength(1);
  });
});

describe("categorías y ajustes", () => {
  it("añade y quita una categoría", () => {
    const state = createInitialState();
    const selected = gameReducer(state, {
      type: "TOGGLE_CATEGORY",
      category: TEST_CATEGORY,
    });
    expect(selected.selectedCategories).toHaveLength(1);
    const cleared = gameReducer(selected, {
      type: "TOGGLE_CATEGORY",
      category: TEST_CATEGORY,
    });
    expect(cleared.selectedCategories).toHaveLength(0);
  });

  it("cambia idioma y conmuta visibilidad y pistas", () => {
    let state = createInitialState();
    state = gameReducer(state, { type: "SET_LOCALE", locale: "en" });
    expect(state.locale).toBe("en");

    state = gameReducer(state, { type: "TOGGLE_CATEGORY_VISIBILITY" });
    expect(state.categoryVisibility).toBe(false);

    state = gameReducer(state, { type: "TOGGLE_HINTS" });
    expect(state.hintsEnabled).toBe(false);
  });

  it("muestra y limpia la repetición de carta", () => {
    const state = startedState(["Ana", "Bea", "Caro"]);
    const shown = gameReducer(state, {
      type: "SHOW_CARD_FOR_PLAYER",
      playerId: "p1",
    });
    expect(shown.repeatCardForPlayerId).toBe("p1");
    expect(gameReducer(shown, { type: "CLEAR_REPEAT_CARD" }).repeatCardForPlayerId).toBeNull();
  });

  it("pasa a la fase de revelación final", () => {
    const state = startedState(["Ana", "Bea", "Caro"]);
    expect(gameReducer(state, { type: "REVEAL_AND_FINISH" }).phase).toBe("ended");
  });
});

describe("restauración de una partida guardada", () => {
  it("recupera fase y estado de juego", () => {
    const saved = startedState(["Ana", "Bea", "Caro"]);
    const restored = gameReducer(createInitialState(), {
      type: "RESTORE",
      snapshot: {
        players: saved.players,
        nextPlayerId: saved.nextPlayerId,
        selectedCategories: saved.selectedCategories,
        impostorCount: saved.impostorCount,
        phase: saved.phase,
        gameState: saved.gameState,
        categoryVisibility: saved.categoryVisibility,
        hintsEnabled: saved.hintsEnabled,
        impostorHistory: saved.impostorHistory,
        settings: saved.settings,
        nightBoard: saved.nightBoard,
        ballots: saved.ballots,
        voteAccusedId: saved.voteAccusedId,
        lastWordPlayerId: saved.lastWordPlayerId,
        civiliansWon: saved.civiliansWon,
      },
    });

    expect(restored.phase).toBe("passing");
    expect(restored.gameState!.secretWord).toBe(saved.gameState!.secretWord);
    expect(restored.players).toEqual(saved.players);
    expect(restored.impostorHistory).toEqual(saved.impostorHistory);
  });
});
