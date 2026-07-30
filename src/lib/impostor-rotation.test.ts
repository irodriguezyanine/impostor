import { describe, expect, it } from "vitest";
import {
  createImpostorHistory,
  recordImpostors,
  selectImpostors,
  type ImpostorHistory,
} from "@/lib/impostor-rotation";
import type { Player } from "@/lib/players";
import { makePlayers, seededRandom } from "@/lib/test-fixtures";

type RoundLog = {
  picks: string[][];
  history: ImpostorHistory;
};

function playRounds(
  players: Player[],
  impostorCount: number,
  rounds: number,
  seed = 1
): RoundLog {
  const random = seededRandom(seed);
  let history = createImpostorHistory();
  const picks: string[][] = [];

  for (let round = 0; round < rounds; round++) {
    const chosen = selectImpostors({
      players,
      impostorCount,
      history,
      random,
    });
    const ids = chosen.map((player) => player.id);
    picks.push(ids);
    history = recordImpostors(history, ids);
  }

  return { picks, history };
}

function countsOf(history: ImpostorHistory, players: Player[]): number[] {
  return players.map((player) => history.counts[player.id] ?? 0);
}

const SEEDS = [1, 2, 3, 7, 13, 42, 99, 1234];

describe("primera vuelta", () => {
  // "Puede ser que NUNCA se repita el mismo impostor en la primera ronda?"
  it("con 5 jugadores y 1 impostor, las 5 primeras rondas son 5 personas distintas", () => {
    const players = makePlayers("Ana", "Bea", "Caro", "Dani", "Eva");
    for (const seed of SEEDS) {
      const { picks } = playRounds(players, 1, 5, seed);
      const chosen = picks.flat();
      expect(new Set(chosen).size).toBe(5);
    }
  });

  it("nadie repite hasta que todos hayan sido impostor al menos una vez", () => {
    const players = makePlayers("Ana", "Bea", "Caro", "Dani", "Eva", "Fran");
    for (const seed of SEEDS) {
      const { picks } = playRounds(players, 2, 3, seed);
      const chosen = picks.flat();
      expect(new Set(chosen).size).toBe(chosen.length);
    }
  });

  it("con el mínimo de 3 jugadores rota entre los tres", () => {
    const players = makePlayers("Ana", "Bea", "Caro");
    for (const seed of SEEDS) {
      const { picks } = playRounds(players, 1, 3, seed);
      expect(new Set(picks.flat()).size).toBe(3);
    }
  });
});

describe("reparto equilibrado a largo plazo", () => {
  // "todos los participantes les debe tocar de forma equilibrada y equitativa"
  it("tras 30 rondas la diferencia entre el que más y el que menos es como mucho 1", () => {
    const players = makePlayers("Ana", "Bea", "Caro", "Dani", "Eva");
    for (const seed of SEEDS) {
      const { history } = playRounds(players, 1, 30, seed);
      const counts = countsOf(history, players);
      expect(Math.max(...counts) - Math.min(...counts)).toBeLessThanOrEqual(1);
    }
  });

  it("también equilibra con 2 impostores por ronda", () => {
    const players = makePlayers("Ana", "Bea", "Caro", "Dani", "Eva", "Fran");
    for (const seed of SEEDS) {
      const { history } = playRounds(players, 2, 24, seed);
      const counts = countsOf(history, players);
      expect(Math.max(...counts) - Math.min(...counts)).toBeLessThanOrEqual(1);
    }
  });

  // "si a un jugador le toca 3 veces ser impostor mientras otros ninguna, está pésimo"
  it("nadie llega a 3 veces mientras alguien siga con 0", () => {
    const players = makePlayers("Ana", "Bea", "Caro", "Dani", "Eva");
    for (const seed of SEEDS) {
      const { history } = playRounds(players, 1, 12, seed);
      const counts = countsOf(history, players);
      if (Math.min(...counts) === 0) {
        expect(Math.max(...counts)).toBeLessThan(3);
      }
    }
  });
});

describe("nada de rachas seguidas", () => {
  // "si a 2 jugadores les toca 4 turnos seguidos entre los dos, está mal"
  it("nunca repite impostor en dos rondas consecutivas", () => {
    const players = makePlayers("Ana", "Bea", "Caro", "Dani", "Eva");
    for (const seed of SEEDS) {
      const { picks } = playRounds(players, 1, 25, seed);
      for (let i = 1; i < picks.length; i++) {
        const overlap = picks[i].filter((id) => picks[i - 1].includes(id));
        expect(overlap).toEqual([]);
      }
    }
  });

  it("tampoco encadena a la misma pareja de impostores", () => {
    const players = makePlayers("Ana", "Bea", "Caro", "Dani", "Eva", "Fran");
    for (const seed of SEEDS) {
      const { picks } = playRounds(players, 2, 20, seed);
      for (let i = 1; i < picks.length; i++) {
        const overlap = picks[i].filter((id) => picks[i - 1].includes(id));
        expect(overlap).toEqual([]);
      }
    }
  });

  it("ningún jugador es impostor 3 veces en 4 rondas seguidas", () => {
    const players = makePlayers("Ana", "Bea", "Caro", "Dani", "Eva");
    for (const seed of SEEDS) {
      const { picks } = playRounds(players, 1, 25, seed);
      for (let i = 3; i < picks.length; i++) {
        const window = picks.slice(i - 3, i + 1).flat();
        for (const player of players) {
          const times = window.filter((id) => id === player.id).length;
          expect(times).toBeLessThanOrEqual(1);
        }
      }
    }
  });
});

describe("cambios en el grupo", () => {
  it("un jugador que se suma tarde no acapara el rol", () => {
    const players = makePlayers("Ana", "Bea", "Caro", "Dani");
    const random = seededRandom(5);
    let history = createImpostorHistory();

    for (let round = 0; round < 8; round++) {
      const chosen = selectImpostors({
        players,
        impostorCount: 1,
        history,
        random,
      });
      history = recordImpostors(
        history,
        chosen.map((player) => player.id)
      );
    }

    const withNewcomer = [...players, { id: "p9", name: "Nico" }];
    const picks: string[][] = [];
    for (let round = 0; round < 6; round++) {
      const chosen = selectImpostors({
        players: withNewcomer,
        impostorCount: 1,
        history,
        random,
      });
      const ids = chosen.map((player) => player.id);
      picks.push(ids);
      history = recordImpostors(history, ids);
    }

    for (let i = 1; i < picks.length; i++) {
      expect(picks[i].filter((id) => picks[i - 1].includes(id))).toEqual([]);
    }
    const newcomerTimes = picks.flat().filter((id) => id === "p9").length;
    expect(newcomerTimes).toBeLessThanOrEqual(3);
  });

  it("ignora el historial de jugadores que ya no están", () => {
    const players = makePlayers("Ana", "Bea", "Caro");
    const history = recordImpostors(createImpostorHistory(), ["p99"]);
    const chosen = selectImpostors({
      players,
      impostorCount: 1,
      history,
      random: seededRandom(3),
    });
    expect(players.map((p) => p.id)).toContain(chosen[0].id);
  });
});

describe("registro del historial", () => {
  it("suma una vez por ronda y avanza el contador de rondas", () => {
    let history = createImpostorHistory();
    expect(history.round).toBe(0);

    history = recordImpostors(history, ["p1"]);
    history = recordImpostors(history, ["p2"]);

    expect(history.round).toBe(2);
    expect(history.counts.p1).toBe(1);
    expect(history.counts.p2).toBe(1);
    expect(history.lastRound.p2).toBe(2);
  });

  it("no muta el historial recibido", () => {
    const history = createImpostorHistory();
    recordImpostors(history, ["p1"]);
    expect(history.round).toBe(0);
    expect(history.counts.p1).toBeUndefined();
  });

  it("devuelve tantos impostores como se piden", () => {
    const players = makePlayers("Ana", "Bea", "Caro", "Dani", "Eva");
    const chosen = selectImpostors({
      players,
      impostorCount: 3,
      history: createImpostorHistory(),
      random: seededRandom(8),
    });
    expect(chosen).toHaveLength(3);
    expect(new Set(chosen.map((p) => p.id)).size).toBe(3);
  });
});
