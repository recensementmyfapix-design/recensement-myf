// Fonctionnement hors connexion : l'application, l'imagerie et les bibliothèques restent disponibles sur le terrain
const CACHE = "zai-myf-v3";
const CORE = ["./", "./index.html", "./config.js", "./sat17.jpg", "./sat15.jpg", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./fonts/LiberationSans-Regular.ttf", "./fonts/LiberationSans-Bold.ttf", "./fonts/LiberationSans-Italic.ttf"];
self.addEventListener("install", (e) => e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())));
self.addEventListener("activate", (e) => e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", (e) => {
  const req = e.request, u = new URL(req.url);
  if (req.method !== "GET" || /script\.google|googleusercontent|arcgisonline/.test(u.hostname)) return;
  const fresh = req.mode === "navigate" || u.pathname.endsWith("config.js");
  if (fresh) { // réseau d'abord pour recevoir les mises à jour, cache si hors ligne
    e.respondWith(fetch(req).then((r) => { const c = r.clone(); caches.open(CACHE).then((k) => k.put(req, c)); return r; }).catch(() => caches.match(req).then((r) => r || caches.match("./index.html"))));
    return;
  }
  e.respondWith(caches.match(req).then((r) => r || fetch(req).then((res) => { if (res.ok || res.type === "opaque") { const c = res.clone(); caches.open(CACHE).then((k) => k.put(req, c)); } return res; })));
});
