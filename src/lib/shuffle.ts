/** Fuente de aleatoriedad inyectable para poder escribir tests deterministas. */
export type RandomFn = () => number;

/** Fisher-Yates. Devuelve una copia; nunca muta el array recibido. */
export function shuffleArray<T>(
  array: readonly T[],
  random: RandomFn = Math.random
): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function pickRandom<T>(
  array: readonly T[],
  random: RandomFn = Math.random
): T | undefined {
  if (array.length === 0) return undefined;
  return array[Math.floor(random() * array.length)];
}
