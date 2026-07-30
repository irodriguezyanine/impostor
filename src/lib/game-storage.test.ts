import { afterEach, describe, expect, it, vi } from "vitest";
import {
  GAME_STORAGE_KEY,
  clearPersistedGame,
  decodePersistedGame,
  encodePersistedGame,
  loadPersistedGame,
  savePersistedGame,
} from "@/lib/game-storage";
import { dealRoles } from "@/lib/game-logic";
import {
  createImpostorHistory,
  recordImpostors,
} from "@/lib/impostor-rotation";
import { DEFAULT_SETTINGS } from "@/lib/game-settings";
import { createNightBoard } from "@/lib/scoring";
import { TEST_CATEGORY, makePlayers, seededRandom } from "@/lib/test-fixtures";

function buildSnapshot() {
  const players = makePlayers("Ana", "Bea", "Caro");
  const gameState = dealRoles({
    players,
    selectedCategories: [TEST_CATEGORY],
    impostorCount: 1,
    random: seededRandom(21),
  })!;
  return {
    players,
    selectedCategoryIds: [TEST_CATEGORY.id],
    impostorCount: 1,
    phase: "passing" as const,
    categoryVisibility: true,
    hintsEnabled: true,
    nextPlayerId: 4,
    gameState,
    impostorHistory: recordImpostors(createImpostorHistory(), ["p2"]),
    settings: DEFAULT_SETTINGS,
    nightBoard: createNightBoard(players),
    ballots: [],
    voteAccusedId: null,
    lastWordPlayerId: null,
    civiliansWon: null,
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("persistencia de la partida", () => {
  it("sobrevive a un ciclo completo de guardado y carga", () => {
    const snapshot = buildSnapshot();
    const restored = decodePersistedGame(encodePersistedGame(snapshot));

    expect(restored).not.toBeNull();
    expect(restored!.players).toEqual(snapshot.players);
    expect(restored!.phase).toBe("passing");
    expect(restored!.gameState!.secretWord).toBe(snapshot.gameState.secretWord);
    expect(restored!.gameState!.playerRoles).toEqual(
      snapshot.gameState.playerRoles
    );
  });

  it("reconstruye revealedPlayers como Set", () => {
    const snapshot = buildSnapshot();
    snapshot.gameState.revealedPlayers.add("p1");
    const restored = decodePersistedGame(encodePersistedGame(snapshot))!;
    expect(restored.gameState!.revealedPlayers).toBeInstanceOf(Set);
    expect(restored.gameState!.revealedPlayers.has("p1")).toBe(true);
  });

  it("conserva el turno de impostores para que siga rotando tras recargar", () => {
    const snapshot = buildSnapshot();
    const restored = decodePersistedGame(encodePersistedGame(snapshot))!;
    expect(restored.impostorHistory).toEqual(snapshot.impostorHistory);
  });

  it("rechaza datos corruptos en lugar de romper la app", () => {
    expect(decodePersistedGame("no-es-json")).toBeNull();
    expect(decodePersistedGame("{}")).toBeNull();
    expect(decodePersistedGame(JSON.stringify({ version: 1 }))).toBeNull();
    expect(decodePersistedGame(null)).toBeNull();
  });

  it("repone un turno vacío si el historial guardado está corrupto", () => {
    const raw = JSON.parse(encodePersistedGame(buildSnapshot()));
    raw.impostorHistory = { counts: "roto", lastRound: null, round: -3 };
    const restored = decodePersistedGame(JSON.stringify(raw))!;
    expect(restored.impostorHistory).toEqual(createImpostorHistory());
  });

  it("descarta instantáneas de una versión anterior", () => {
    const raw = JSON.parse(encodePersistedGame(buildSnapshot()));
    raw.version = 0;
    expect(decodePersistedGame(JSON.stringify(raw))).toBeNull();
  });

  it("no persiste wordHints de las categorías, solo sus ids", () => {
    const encoded = encodePersistedGame(buildSnapshot());
    const raw = JSON.parse(encoded);
    expect(raw.selectedCategoryIds).toEqual([TEST_CATEGORY.id]);
    expect(raw.selectedCategories).toBeUndefined();
    expect(encoded).not.toContain("wordHints");
  });

  it("usa nextPlayerId de reserva si falta en el JSON", () => {
    const raw = JSON.parse(encodePersistedGame(buildSnapshot()));
    delete raw.nextPlayerId;
    const restored = decodePersistedGame(JSON.stringify(raw))!;
    expect(restored.nextPlayerId).toBe(4);
  });

  it("guarda y carga a través de sessionStorage", () => {
    const store = new Map<string, string>();
    vi.stubGlobal("window", {
      sessionStorage: {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => {
          store.set(key, value);
        },
        removeItem: (key: string) => {
          store.delete(key);
        },
      },
    });

    savePersistedGame(buildSnapshot());
    expect(store.has(GAME_STORAGE_KEY)).toBe(true);

    const loaded = loadPersistedGame();
    expect(loaded?.players).toHaveLength(3);

    clearPersistedGame();
    expect(loadPersistedGame()).toBeNull();
  });

  it("no explota si sessionStorage está bloqueado", () => {
    vi.stubGlobal("window", {
      sessionStorage: {
        getItem: () => {
          throw new Error("blocked");
        },
        setItem: () => {
          throw new Error("blocked");
        },
        removeItem: () => {
          throw new Error("blocked");
        },
      },
    });

    expect(() => savePersistedGame(buildSnapshot())).not.toThrow();
    expect(loadPersistedGame()).toBeNull();
    expect(() => clearPersistedGame()).not.toThrow();
  });
});
