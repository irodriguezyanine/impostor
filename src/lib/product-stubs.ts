/**
 * Stubs y utilidades para features que necesitan backend o terceros.
 * La UI puede llamarlos; hoy hacen lo máximo posible en el cliente.
 */

export type AnalyticsEvent =
  | { name: "setup_start" }
  | { name: "game_start"; players: number; mode: string }
  | { name: "vote_complete"; civiliansWon: boolean }
  | { name: "survey"; rating: 1 | 2 | 3 | 4 | 5 }
  | { name: "report_content"; word: string; reason: string };

const QUEUE_KEY = "impostor:analytics-queue";

export function track(event: AnalyticsEvent): void {
  try {
    if (typeof window === "undefined") return;
    const queue = JSON.parse(
      window.localStorage.getItem(QUEUE_KEY) ?? "[]"
    ) as unknown[];
    queue.push({ ...event, at: Date.now() });
    window.localStorage.setItem(
      QUEUE_KEY,
      JSON.stringify(queue.slice(-200))
    );
    // Hook para Plausible/Umami cuando exista:
    // window.plausible?.(event.name, { props: event })
  } catch {
    /* ignore */
  }
}

export type ReportPayload = {
  word: string;
  categoryId: string;
  reason: string;
  note?: string;
};

const REPORTS_KEY = "impostor:content-reports";

export function reportContent(payload: ReportPayload): void {
  try {
    const prev = JSON.parse(
      window.localStorage.getItem(REPORTS_KEY) ?? "[]"
    ) as unknown[];
    prev.push({ ...payload, at: Date.now() });
    window.localStorage.setItem(REPORTS_KEY, JSON.stringify(prev.slice(-100)));
    track({
      name: "report_content",
      word: payload.word,
      reason: payload.reason,
    });
  } catch {
    /* ignore */
  }
}

export const CHANGELOG = [
  {
    version: "1.2.0",
    date: "2026-07-30",
    items: [
      "Timer y turnos de habla",
      "Marcador de la noche y modos (Blitz, Mr. White, pista falsa…)",
      "Nuevas categorías y PWA offline",
      "Rotación equitativa de impostores",
    ],
  },
  {
    version: "1.1.0",
    date: "2026-07-30",
    items: [
      "IDs de jugador, persistencia de partida, accesibilidad",
      "Auditoría de pistas y tests",
    ],
  },
] as const;
