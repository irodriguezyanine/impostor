"use client";

import { useEffect } from "react";

/** Registra el service worker y recarga una vez cuando hay versión nueva. */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const reloadOnce = (cacheName: string) => {
      const key = `impostor:sw:${cacheName}`;
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
      window.location.reload();
    };

    const onMessage = (event: MessageEvent) => {
      if (event.data?.type !== "IMPOSTOR_SW_UPDATED") return;
      reloadOnce(String(event.data.cache ?? "updated"));
    };

    navigator.serviceWorker.addEventListener("message", onMessage);

    let cancelled = false;
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        if (cancelled) return;
        void reg.update();
      })
      .catch(() => {
        /* SW opcional */
      });

    return () => {
      cancelled = true;
      navigator.serviceWorker.removeEventListener("message", onMessage);
    };
  }, []);

  return null;
}
