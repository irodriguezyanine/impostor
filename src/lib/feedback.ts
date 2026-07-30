/**
 * Feedback sensorial opcional (sonido / haptic).
 * Mute por defecto; nunca bloquea el juego si falla.
 */

export function vibrate(pattern: number | number[] = 12): void {
  try {
    if (typeof navigator === "undefined") return;
    if (!navigator.vibrate) return;
    navigator.vibrate(pattern);
  } catch {
    /* ignore */
  }
}

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  try {
    if (typeof window === "undefined") return null;
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return null;
    if (!audioCtx) audioCtx = new Ctx();
    return audioCtx;
  } catch {
    return null;
  }
}

/** Beep corto; volume bajo. */
export function playBeep(
  enabled: boolean,
  freq = 520,
  durationMs = 80
): void {
  if (!enabled) return;
  const ctx = getCtx();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freq;
    gain.gain.value = 0.04;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    window.setTimeout(() => {
      osc.stop();
    }, durationMs);
  } catch {
    /* ignore */
  }
}

export function feedbackReveal(sound: boolean, haptics: boolean): void {
  if (haptics) vibrate([10, 30, 10]);
  playBeep(sound, 440, 60);
}

export function feedbackPass(sound: boolean, haptics: boolean): void {
  if (haptics) vibrate(8);
  playBeep(sound, 360, 40);
}

export function feedbackVote(sound: boolean, haptics: boolean): void {
  if (haptics) vibrate([20, 40, 20]);
  playBeep(sound, 600, 100);
}

export function feedbackWin(sound: boolean, haptics: boolean): void {
  if (haptics) vibrate([10, 20, 10, 20, 30]);
  playBeep(sound, 720, 120);
}
