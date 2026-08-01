/* Offline shell for Impostor Chile PWA.
 * Network-first: nunca servir HTML/JS viejo (evita el botón espejado en caché).
 */
const CACHE = "impostor-v6";
const PRECACHE = ["/manifest.json", "/logo.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
      .then(() =>
        self.clients.matchAll({ type: "window" }).then((clients) => {
          for (const client of clients) {
            client.postMessage({ type: "IMPOSTOR_SW_UPDATED", cache: CACHE });
          }
        })
      )
  );
});

function shouldBypassCache(request, url) {
  if (request.mode === "navigate") return true;
  if (request.destination === "document") return true;
  if (url.pathname.startsWith("/_next/")) return true;
  if (url.pathname.endsWith(".js") || url.pathname.endsWith(".css")) return true;
  if (url.pathname === "/sw.js") return true;
  return false;
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (shouldBypassCache(req, url)) {
    event.respondWith(
      fetch(req)
        .then((res) => res)
        .catch(() => caches.match(req))
    );
    return;
  }

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req))
  );
});
