/**
 * Votación secreta pass-and-play: cada jugador elige a un sospechoso.
 */
export type Ballot = {
  voterId: string;
  accusedId: string;
};

export type VoteTally = {
  accusedId: string;
  votes: number;
};

export type VoteResult =
  | { kind: "majority"; accusedId: string; tallies: VoteTally[] }
  | { kind: "tie"; tiedIds: string[]; tallies: VoteTally[] }
  | { kind: "none"; tallies: VoteTally[] };

export function tallyVotes(ballots: readonly Ballot[]): VoteTally[] {
  const counts = new Map<string, number>();
  for (const ballot of ballots) {
    counts.set(ballot.accusedId, (counts.get(ballot.accusedId) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([accusedId, votes]) => ({ accusedId, votes }))
    .sort((a, b) => b.votes - a.votes);
}

export function resolveVotes(ballots: readonly Ballot[]): VoteResult {
  const tallies = tallyVotes(ballots);
  if (tallies.length === 0) return { kind: "none", tallies };

  const top = tallies[0].votes;
  const leaders = tallies.filter((t) => t.votes === top);
  if (leaders.length === 1) {
    return { kind: "majority", accusedId: leaders[0].accusedId, tallies };
  }
  return {
    kind: "tie",
    tiedIds: leaders.map((l) => l.accusedId),
    tallies,
  };
}

export function isCorrectAccusation(
  accusedId: string,
  impostorIds: readonly string[]
): boolean {
  return impostorIds.includes(accusedId);
}

export function detectorIdsFromBallots(
  ballots: readonly Ballot[],
  impostorIds: readonly string[]
): string[] {
  const impostors = new Set(impostorIds);
  return ballots
    .filter((b) => impostors.has(b.accusedId) && !impostors.has(b.voterId))
    .map((b) => b.voterId);
}
