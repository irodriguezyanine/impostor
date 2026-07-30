import { describe, expect, it } from "vitest";
import { dealRoles, validateSetup } from "@/lib/game-logic";
import {
  OTHER_CATEGORY,
  TEST_CATEGORY,
  makePlayers,
  seededRandom,
} from "@/lib/test-fixtures";

const categories = [TEST_CATEGORY];

function countImpostors(roles: Record<string, string>): number {
  return Object.values(roles).filter((r) => r === "impostor").length;
}

describe("validateSetup", () => {
  it("acepta una configuración válida", () => {
    expect(
      validateSetup({
        players: makePlayers("Ana", "Bea", "Caro"),
        selectedCategories: categories,
        impostorCount: 1,
      })
    ).toBeNull();
  });

  it("rechaza menos de 3 jugadores con nombre", () => {
    expect(
      validateSetup({
        players: makePlayers("Ana", "Bea", "   "),
        selectedCategories: categories,
        impostorCount: 1,
      })
    ).toBe("not-enough-players");
  });

  it("rechaza cuando no hay categorías seleccionadas", () => {
    expect(
      validateSetup({
        players: makePlayers("Ana", "Bea", "Caro"),
        selectedCategories: [],
        impostorCount: 1,
      })
    ).toBe("no-category");
  });

  it("rechaza cuando quedarían menos de 2 civiles", () => {
    expect(
      validateSetup({
        players: makePlayers("Ana", "Bea", "Caro"),
        selectedCategories: categories,
        impostorCount: 2,
      })
    ).toBe("too-many-impostors");
  });
});

describe("dealRoles", () => {
  it("asigna exactamente el número de impostores pedido", () => {
    const state = dealRoles({
      players: makePlayers("Ana", "Bea", "Caro", "Dani", "Eva"),
      selectedCategories: categories,
      impostorCount: 2,
      random: seededRandom(7),
    });
    expect(state).not.toBeNull();
    expect(countImpostors(state!.playerRoles)).toBe(2);
  });

  it("da un rol a cada jugador exactamente una vez", () => {
    const players = makePlayers("Ana", "Bea", "Caro", "Dani");
    const state = dealRoles({
      players,
      selectedCategories: categories,
      impostorCount: 1,
      random: seededRandom(3),
    })!;
    expect(Object.keys(state.playerRoles).sort()).toEqual(
      players.map((p) => p.id).sort()
    );
    expect(state.shuffledOrder).toHaveLength(players.length);
  });

  // Bug crítico: los roles se indexaban por nombre, así que dos jugadores
  // homónimos compartían rol, pista y estado de "ya revelado".
  it("trata a dos jugadores con el mismo nombre como jugadores distintos", () => {
    const players = makePlayers("Juan", "Juan", "Ana");
    const state = dealRoles({
      players,
      selectedCategories: categories,
      impostorCount: 1,
      random: seededRandom(11),
    })!;

    expect(Object.keys(state.playerRoles)).toHaveLength(3);
    expect(countImpostors(state.playerRoles)).toBe(1);
    expect(state.playerRoles.p1).toBeDefined();
    expect(state.playerRoles.p2).toBeDefined();
  });

  it("entrega una pista a cada impostor y a ningún civil", () => {
    const state = dealRoles({
      players: makePlayers("Ana", "Bea", "Caro", "Dani", "Eva"),
      selectedCategories: categories,
      impostorCount: 2,
      random: seededRandom(5),
    })!;
    const impostorIds = Object.entries(state.playerRoles)
      .filter(([, role]) => role === "impostor")
      .map(([id]) => id);

    expect(Object.keys(state.impostorHints).sort()).toEqual(impostorIds.sort());
    for (const id of impostorIds) {
      expect(state.impostorHints[id]).toBeTruthy();
    }
  });

  it("elige una palabra secreta que pertenece a la categoría sorteada", () => {
    const state = dealRoles({
      players: makePlayers("Ana", "Bea", "Caro"),
      selectedCategories: [TEST_CATEGORY, OTHER_CATEGORY],
      impostorCount: 1,
      random: seededRandom(2),
    })!;
    const allWords = [...TEST_CATEGORY.words, ...OTHER_CATEGORY.words];
    expect(allWords).toContain(state.secretWord);

    const chosen = [TEST_CATEGORY, OTHER_CATEGORY].find(
      (c) => c.id === state.categoryId
    )!;
    expect(chosen.words).toContain(state.secretWord);
  });

  it("empieza en el primer jugador, sin revelados ni flip pendiente", () => {
    const state = dealRoles({
      players: makePlayers("Ana", "Bea", "Caro"),
      selectedCategories: categories,
      impostorCount: 1,
      random: seededRandom(1),
    })!;
    expect(state.currentPlayerIndex).toBe(0);
    expect(state.revealedPlayers.size).toBe(0);
    expect(state.flippingToNextIndex).toBeNull();
    expect(state.shuffledOrder.map((p) => p.id)).toContain(state.firstPlayerId);
  });

  it("ignora a los jugadores sin nombre", () => {
    const state = dealRoles({
      players: makePlayers("Ana", "", "Bea", "   ", "Caro"),
      selectedCategories: categories,
      impostorCount: 1,
      random: seededRandom(4),
    })!;
    expect(state.shuffledOrder).toHaveLength(3);
    expect(state.shuffledOrder.every((p) => p.name.trim() !== "")).toBe(true);
  });

  it("evita repetir a los impostores de la ronda anterior", () => {
    const players = makePlayers("Ana", "Bea", "Caro", "Dani", "Eva");
    for (let seed = 1; seed <= 25; seed++) {
      const state = dealRoles({
        players,
        selectedCategories: categories,
        impostorCount: 1,
        previousImpostorIds: ["p1"],
        random: seededRandom(seed),
      })!;
      expect(state.playerRoles.p1).toBe("civilian");
    }
  });

  it("permite repetir impostores si no hay candidatos suficientes", () => {
    const players = makePlayers("Ana", "Bea", "Caro");
    const state = dealRoles({
      players,
      selectedCategories: categories,
      impostorCount: 1,
      previousImpostorIds: ["p1", "p2", "p3"],
      random: seededRandom(9),
    })!;
    expect(countImpostors(state.playerRoles)).toBe(1);
  });

  it("devuelve null cuando la configuración no es válida", () => {
    expect(
      dealRoles({
        players: makePlayers("Ana", "Bea"),
        selectedCategories: categories,
        impostorCount: 1,
      })
    ).toBeNull();

    expect(
      dealRoles({
        players: makePlayers("Ana", "Bea", "Caro"),
        selectedCategories: [],
        impostorCount: 1,
      })
    ).toBeNull();
  });

  it("devuelve null si la categoría no tiene palabras", () => {
    expect(
      dealRoles({
        players: makePlayers("Ana", "Bea", "Caro"),
        selectedCategories: [{ ...TEST_CATEGORY, words: [], wordHints: {} }],
        impostorCount: 1,
      })
    ).toBeNull();
  });
});
