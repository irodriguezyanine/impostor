import type { Player } from "@/lib/players";
import { shuffleArray, type RandomFn } from "@/lib/shuffle";

/**
 * Reparto del rol de impostor por turnos.
 *
 * Regla: siempre entra antes quien menos veces ha sido impostor, así nadie
 * repite hasta que le haya tocado a todo el grupo. Entre los que llevan el
 * mismo número de veces, entra antes el que hace más rondas que no le toca.
 * Además se descarta a los impostores de la ronda anterior siempre que queden
 * candidatos suficientes, para que no haya rachas seguidas.
 */
export type ImpostorHistory = {
  /** playerId -> veces que ha sido impostor. */
  counts: Record<string, number>;
  /** playerId -> ronda en la que fue impostor por última vez (0 = nunca). */
  lastRound: Record<string, number>;
  /** Rondas repartidas hasta ahora. */
  round: number;
};

export function createImpostorHistory(): ImpostorHistory {
  return { counts: {}, lastRound: {}, round: 0 };
}

export type SelectImpostorsInput = {
  players: readonly Player[];
  impostorCount: number;
  history: ImpostorHistory;
  random?: RandomFn;
};

export function selectImpostors({
  players,
  impostorCount,
  history,
  random = Math.random,
}: SelectImpostorsInput): Player[] {
  if (impostorCount <= 0 || players.length === 0) return [];

  const wasImpostorLastRound = (player: Player) =>
    history.round > 0 && history.lastRound[player.id] === history.round;

  const rested = players.filter((player) => !wasImpostorLastRound(player));
  const pool = rested.length >= impostorCount ? rested : players;

  // Se baraja antes de ordenar para que los empates se resuelvan al azar:
  // Array.prototype.sort es estable, así que respeta este orden aleatorio.
  const candidates = shuffleArray(pool, random);

  const sorted = [...candidates].sort((a, b) => {
    const countDiff =
      (history.counts[a.id] ?? 0) - (history.counts[b.id] ?? 0);
    if (countDiff !== 0) return countDiff;
    return (history.lastRound[a.id] ?? 0) - (history.lastRound[b.id] ?? 0);
  });

  return sorted.slice(0, impostorCount);
}

export function recordImpostors(
  history: ImpostorHistory,
  impostorIds: readonly string[]
): ImpostorHistory {
  const round = history.round + 1;
  const counts = { ...history.counts };
  const lastRound = { ...history.lastRound };

  for (const id of impostorIds) {
    counts[id] = (counts[id] ?? 0) + 1;
    lastRound[id] = round;
  }

  return { counts, lastRound, round };
}
