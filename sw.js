/* ============================================================================
   Service Worker — Mentes Brillantes (PWA)
   Estrategia: red primero con respaldo en caché (siempre fresco al desplegar,
   y funciona sin internet con la última versión vista).
   OJO: NO intercepta peticiones a otros dominios (Firebase/Auth/Fonts pasan directo).
   ============================================================================ */
const CACHE = "gemb-v2-story";
const SHELL = [
  "/",
  "/index.html",
  "/styles.css",
  "/story.css",
  "/app.js",
  "/story.js",
  "/content.js",
  "/manifest.json",
  "/assets/logo-160.webp",
  "/assets/logo-640.webp",
  "/assets/brilliant-world.webp",
  "/assets/icon-192.png",
  "/assets/story/story-cover.webp"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  const url = new URL(req.url);
  // Solo GET del propio sitio; Firebase/Google pasan directo sin tocar
  if (req.method !== "GET" || url.origin !== self.location.origin) return;

  e.respondWith(
    fetch(req)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      })
      .catch(() =>
        caches.match(req).then(hit => hit || (req.mode === "navigate" ? caches.match("/") : Promise.reject(new Error("offline"))))
      )
  );
});
