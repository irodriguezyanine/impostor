/**
 * Un jugador se identifica por `id`, nunca por su nombre: dos amigos pueden
 * llamarse igual y aun así necesitan roles, pistas y cartas independientes.
 */
export type Player = {
  id: string;
  name: string;
};

export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 20;
export const MIN_CIVILIANS = 2;
export const MAX_NAME_LENGTH = 30;

export function createPlayer(id: string, name = ""): Player {
  return { id, name };
}

export function getValidPlayers(players: readonly Player[]): Player[] {
  return players.filter((player) => player.name.trim() !== "");
}

export function getMaxImpostors(validPlayerCount: number): number {
  return Math.max(1, validPlayerCount - MIN_CIVILIANS);
}

export function clampImpostorCount(
  count: number,
  validPlayerCount: number
): number {
  const max = getMaxImpostors(validPlayerCount);
  return Math.min(Math.max(1, count), max);
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

/**
 * Ids de los jugadores cuyo nombre coincide con el de otro. El juego funciona
 * igual, pero conviene avisarlos para que no se confundan al pasar el teléfono.
 */
export function getDuplicateNameIds(players: readonly Player[]): Set<string> {
  const byName = new Map<string, string[]>();
  for (const player of players) {
    const key = normalizeName(player.name);
    if (key === "") continue;
    byName.set(key, [...(byName.get(key) ?? []), player.id]);
  }

  const duplicates = new Set<string>();
  for (const ids of Array.from(byName.values())) {
    if (ids.length > 1) {
      for (const id of ids) duplicates.add(id);
    }
  }
  return duplicates;
}
