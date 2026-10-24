/**
 * Startseite von endlab.de (Worker „endlab-start“) – www leitet auf die Hauptdomain.
 *
 * Ziel (siehe docs/plan.md): eine installierbare App „EndLab“, darin alle Projekte unter eigenen Pfaden
 * (endlab.de/spieltisch/…) – ein Speicher, ein Profil. Die Projekte laufen als eigene Worker über spezifischere
 * Routen (endlab.de/spieltisch*), diese Startseite bekommt ihre Pfade nie zu sehen.
 */

/**
 * Installierbar, seit der Spieltisch unter endlab.de/spieltisch läuft (Schritt E3): eine App, ein Speicher für alle Projekte.
 */
import { DATEIEN } from "./dateien.js";

export const INSTALL = true;

/** Projekte auf der Startseite (Pfade unter endlab.de – dieselbe App) */
export const PROJECTS = [
  { href: "/spieltisch/", icon: "🎲", name: "Spieltisch", text: "Würfel-, Karten- und Partyspiele für den Abend mit Freunden – direkt im Browser." },
];

/** Eigene Dateien (aus public/, per scripts/dateien.mjs in den Code gelegt – kein Datei-Upload nötig) */
export const FILES = ["/manifest.webmanifest", "/sw.js", "/app.js", "/icons/icon-192.png", "/icons/icon-512.png", "/icons/maskable-512.png", "/icons/apple-touch-icon.png"];

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

export function page(install = INSTALL) {
  const cards = PROJECTS.map((p) => `
  <a class="card" href="${esc(p.href)}">
    <div class="icon" aria-hidden="true">${p.icon}</div>
    <div><strong>${esc(p.name)}</strong><small>${esc(p.text)}</small></div>
    <span class="arrow" aria-hidden="true">›</span>
  </a>`).join("");
  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>EndLab</title>
<meta name="description" content="Kleine Projekte von EndLab">
<meta name="theme-color" content="#f6f1e7">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%23e8573c'/%3E%3Ctext x='16' y='22' font-size='18' font-family='sans-serif' font-weight='700' fill='white' text-anchor='middle'%3EE%3C/text%3E%3C/svg%3E">
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">${install ? `
<link rel="manifest" href="/manifest.webmanifest">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="EndLab">` : ""}
<style>
  :root { --bg:#f6f1e7; --card:#fffdf8; --ink:#2b2621; --muted:#7a7066; --accent:#e8573c; --line:#e6dccb; }
  @media (prefers-color-scheme: dark) { :root { --bg:#1d1a17; --card:#26221e; --ink:#f1ebe2; --muted:#a79c90; --line:#3a342d; } }
  * { box-sizing:border-box; }
  body { margin:0; min-height:100dvh; display:flex; flex-direction:column; align-items:center; justify-content:center;
         padding:24px 16px calc(24px + env(safe-area-inset-bottom)); background:var(--bg); color:var(--ink);
         font:16px/1.5 system-ui, -apple-system, "Segoe UI", sans-serif; }
  main { width:100%; max-width:420px; display:grid; gap:12px; }
  h1 { font-size:2.2rem; margin:0 0 4px; letter-spacing:-.02em; }
  h1 span { color:var(--accent); }
  p.lead { margin:0 0 16px; color:var(--muted); }
  a.card { display:flex; gap:16px; align-items:center; padding:18px; border-radius:18px; text-decoration:none; color:inherit;
           background:var(--card); border:1px solid var(--line); box-shadow:0 2px 0 var(--line); transition:transform .15s; }
  a.card:hover, a.card:focus-visible { transform:translateY(-2px); }
  a.card:focus-visible, button:focus-visible { outline:3px solid var(--accent); outline-offset:2px; }
  .icon { flex:none; width:52px; height:52px; border-radius:14px; background:var(--accent); color:#fff;
          display:grid; place-items:center; font-size:28px; }
  .card strong { display:block; font-size:1.15rem; }
  .card small { color:var(--muted); font-size:.95rem; }
  .arrow { margin-left:auto; color:var(--muted); font-size:1.4rem; }
  .install { margin-top:12px; padding:14px 16px; border-radius:16px; border:1px dashed var(--line); color:var(--muted); font-size:.95rem; }
  .install[hidden], .install button[hidden] { display:none; }
  .install button { display:block; width:100%; min-height:44px; margin-top:8px; border:0; border-radius:12px; background:var(--accent);
                    color:#fff; font:600 1rem system-ui, sans-serif; cursor:pointer; }
  footer { margin-top:32px; color:var(--muted); font-size:.85rem; }
  @media (prefers-reduced-motion: reduce) { a.card { transition:none; } }
</style>
</head>
<body>
<main>
  <h1>End<span>Lab</span></h1>
  <p class="lead">Kleine Projekte, mit Freude gebaut.</p>${cards}${install ? `
  <section class="install" id="install" hidden aria-label="Als App installieren">
    <span id="install-text">Als App auf dem Handy: alle Projekte an einem Ort, eure Daten bleiben beisammen.</span>
    <button type="button" id="install-button" hidden>EndLab installieren</button>
  </section>` : ""}
</main>
<footer>endlab.de</footer>${install ? `
<script src="/app.js" defer></script>` : ""}
</body>
</html>`;
}

/** Sicherheits-Kopfzeilen für die Startseite: keine fremden Skripte, kein Einbetten */
export const PAGE_HEADERS = {
  "content-type": "text/html; charset=utf-8",
  "cache-control": "public, max-age=300",
  "content-security-policy": "default-src 'self'; img-src 'self' data:; style-src 'unsafe-inline'; script-src 'self'; manifest-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === "www.endlab.de") {
      url.hostname = "endlab.de";
      return Response.redirect(url.toString(), 301);
    }
    if (request.method !== "GET" && request.method !== "HEAD") return new Response("Nicht erlaubt.", { status: 405, headers: { allow: "GET, HEAD" } });
    if (url.pathname === "/") return new Response(request.method === "HEAD" ? null : page(), { headers: PAGE_HEADERS });
    const file = FILES.includes(url.pathname) ? DATEIEN[url.pathname] : undefined;
    if (file) {
      const headers = new Headers({ "content-type": file.type, "x-content-type-options": "nosniff",
        // Der Service Worker muss bei jedem Besuch frisch geprüft werden (sonst hängen Geräte an einer alten Fassung)
        "cache-control": url.pathname === "/sw.js" ? "no-cache" : "public, max-age=3600" });
      return new Response(request.method === "HEAD" ? null : Uint8Array.from(atob(file.b64), (c) => c.charCodeAt(0)), { headers });
    }
    return Response.redirect("https://endlab.de/", 302);
  },
};
