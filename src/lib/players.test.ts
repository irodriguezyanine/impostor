import { describe, expect, it } from "vitest";
import {
  clampImpostorCount,
  getDuplicateNameIds,
  getMaxImpostors,
  getValidPlayers,
} from "@/lib/players";
import { makePlayers } from "@/lib/test-fixtures";

describe("getValidPlayers", () => {
  it("descarta nombres vacíos o solo con espacios", () => {
    const valid = getValidPlayers(makePlayers("Ana", "", "  ", "Bea"));
    expect(valid.map((p) => p.name)).toEqual(["Ana", "Bea"]);
  });
});

describe("getMaxImpostors", () => {
  it("deja siempre al menos 2 civiles", () => {
    expect(getMaxImpostors(3)).toBe(1);
    expect(getMaxImpostors(5)).toBe(3);
    expect(getMaxImpostors(10)).toBe(8);
  });

  it("nunca baja de 1 aunque haya muy pocos jugadores", () => {
    expect(getMaxImpostors(0)).toBe(1);
    expect(getMaxImpostors(2)).toBe(1);
  });
});

describe("clampImpostorCount", () => {
  it("recorta hacia arriba y hacia abajo", () => {
    expect(clampImpostorCount(9, 5)).toBe(3);
    expect(clampImpostorCount(0, 5)).toBe(1);
    expect(clampImpostorCount(2, 5)).toBe(2);
  });
});

describe("getDuplicateNameIds", () => {
  it("detecta nombres repetidos ignorando mayúsculas y espacios", () => {
    const players = makePlayers("Juan", " juan ", "Ana");
    expect(getDuplicateNameIds(players)).toEqual(new Set(["p1", "p2"]));
  });

  it("no marca nada cuando todos los nombres son distintos", () => {
    expect(getDuplicateNameIds(makePlayers("Ana", "Bea", "Caro")).size).toBe(0);
  });

  it("ignora los nombres vacíos", () => {
    expect(getDuplicateNameIds(makePlayers("", "", "Ana")).size).toBe(0);
  });
});
