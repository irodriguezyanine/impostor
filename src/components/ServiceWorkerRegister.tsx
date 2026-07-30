"use client";

import { useEffect } from "react";

/** Registra el service worker para PWA offline. */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* SW opcional */
    });
  }, []);
  return null;
}
