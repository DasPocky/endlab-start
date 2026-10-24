/**
 * Service Worker der EndLab-Startseite (Scope „/“).
 * Er speichert nur die Startseite und ihre Dateien für unterwegs. Alles unter einem Projektpfad
 * (z. B. /spieltisch/…) lässt er unberührt: kein respondWith, der Browser lädt normal – Projekte haben ihren
 * eigenen Service Worker mit engerem Scope, der für ihre Seiten Vorrang hat.
 */
const CACHE = "endlab-start-v1";
const OWN = ["/", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png", "/icons/maskable-512.png", "/icons/apple-touch-icon.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(OWN)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith("endlab-start-") && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  // Nur eigene Dateien der Startseite – nie Projektpfade, nie fremde Adressen, nie etwas außer GET
  if (e.request.method !== "GET" || url.origin !== self.location.origin || !OWN.includes(url.pathname)) return;
  // Erst das Netz (immer aktuell), ohne Netz der Speicher
  e.respondWith(fetch(e.request).then((res) => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); }
    return res;
  }).catch(() => caches.match(e.request).then((hit) => hit ?? Response.error())));
});
