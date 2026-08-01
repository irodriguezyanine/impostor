import { describe, expect, it } from "vitest";
import { resolveVotes, detectorIdsFromBallots } from "@/lib/voting";
import {
  applyRoundOutcome,
  createNightBoard,
  leaderboard,
} from "@/lib/scoring";
import { makePlayers } from "@/lib/test-fixtures";
import {
  suggestImpostorCount,
  isUnbalancedImpostorSetup,
  estimateDurationMinutes,
  DEFAULT_SETTINGS,
  applyModeDefaults,
} from "@/lib/game-settings";

describe("votación", () => {
  it("detecta mayoría", () => {
    const result = resolveVotes([
      { voterId: "a", accusedId: "x" },
      { voterId: "b", accusedId: "x" },
      { voterId: "c", accusedId: "y" },
    ]);
    expect(result.kind).toBe("majority");
    if (result.kind === "majority") expect(result.accusedId).toBe("x");
  });

  it("detecta empate", () => {
    const result = resolveVotes([
      { voterId: "a", accusedId: "x" },
      { voterId: "b", accusedId: "y" },
    ]);
    expect(result.kind).toBe("tie");
  });

  it("marca detectores", () => {
    expect(
      detectorIdsFromBallots(
        [
          { voterId: "a", accusedId: "imp" },
          { voterId: "imp", accusedId: "a" },
        ],
        ["imp"]
      )
    ).toEqual(["a"]);
  });
});

describe("puntuación", () => {
  it("suma puntos a civiles si ganan", () => {
    const players = makePlayers("Ana", "Bea", "Caro");
    let board = createNightBoard(players);
    board = applyRoundOutcome(board, players, {
      civiliansWon: true,
      impostorIds: ["p3"],
      correctlyAccusedIds: ["p3"],
      detectorIds: ["p1"],
    });
    expect(board.scores.p1.points).toBeGreaterThan(board.scores.p3.points);
    expect(leaderboard(board)[0].playerId).toBe("p1");
  });
});

describe("settings helpers", () => {
  it("sugiere impostores según tamaño", () => {
    expect(suggestImpostorCount(4)).toBe(1);
    expect(suggestImpostorCount(7)).toBe(2);
    expect(isUnbalancedImpostorSetup(4, 2)).toBe(true);
    expect(estimateDurationMinutes(6, 120)).toBeGreaterThan(3);
  });

  it("deja la votación apagada por defecto y en todos los modos", () => {
    expect(DEFAULT_SETTINGS.enableVoting).toBe(false);
    expect(applyModeDefaults(DEFAULT_SETTINGS, "classic").enableVoting).toBe(
      false
    );
    expect(applyModeDefaults(DEFAULT_SETTINGS, "mrWhite").enableVoting).toBe(
      false
    );
  });
});
