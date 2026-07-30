import type { Player } from "@/lib/players";

export type NightScore = {
  playerId: string;
  points: number;
  civilianWins: number;
  impostorWins: number;
  detections: number;
};

export type NightBoard = {
  scores: Record<string, NightScore>;
  roundsPlayed: number;
};

export function createNightBoard(players: readonly Player[]): NightBoard {
  const scores: Record<string, NightScore> = {};
  for (const player of players) {
    scores[player.id] = {
      playerId: player.id,
      points: 0,
      civilianWins: 0,
      impostorWins: 0,
      detections: 0,
    };
  }
  return { scores, roundsPlayed: 0 };
}

export type RoundOutcome = {
  /** true si los civiles ganaron (pillaron a un impostor). */
  civiliansWon: boolean;
  impostorIds: readonly string[];
  /** Ids votados / acusados correctamente. */
  correctlyAccusedIds: readonly string[];
  /** Quién votó a un impostor real. */
  detectorIds: readonly string[];
};

const CIVILIAN_WIN = 2;
const IMPOSTOR_WIN = 3;
const DETECTOR_BONUS = 1;

export function applyRoundOutcome(
  board: NightBoard,
  players: readonly Player[],
  outcome: RoundOutcome
): NightBoard {
  const scores: Record<string, NightScore> = {};
  for (const player of players) {
    const prev = board.scores[player.id] ?? {
      playerId: player.id,
      points: 0,
      civilianWins: 0,
      impostorWins: 0,
      detections: 0,
    };
    scores[player.id] = { ...prev };
  }

  const impostorSet = new Set(outcome.impostorIds);
  for (const player of players) {
    const row = scores[player.id];
    if (!row) continue;
    if (outcome.civiliansWon) {
      if (!impostorSet.has(player.id)) {
        scores[player.id] = {
          ...row,
          points: row.points + CIVILIAN_WIN,
          civilianWins: row.civilianWins + 1,
        };
      }
    } else if (impostorSet.has(player.id)) {
      scores[player.id] = {
        ...row,
        points: row.points + IMPOSTOR_WIN,
        impostorWins: row.impostorWins + 1,
      };
    }
  }

  for (const id of outcome.detectorIds) {
    const row = scores[id];
    if (!row || impostorSet.has(id)) continue;
    scores[id] = {
      ...row,
      points: row.points + DETECTOR_BONUS,
      detections: row.detections + 1,
    };
  }

  return { scores, roundsPlayed: board.roundsPlayed + 1 };
}

export function leaderboard(board: NightBoard): NightScore[] {
  return Object.values(board.scores).sort((a, b) => b.points - a.points);
}
