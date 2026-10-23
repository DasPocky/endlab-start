import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import worker, { FILES, INSTALL, page, PROJECTS } from "../src/index.js";

/** Dateien wie die Bindung ASSETS: aus public/ */
const env = {
  ASSETS: {
    async fetch(req) {
      const path = new URL(req.url).pathname;
      try { return new Response(await readFile(new URL(`../public${path}`, import.meta.url)), { headers: { "cache-control": "public, max-age=3600" } }); }
      catch { return new Response("fehlt", { status: 404 }); }
    },
  },
};
const get = (url, init) => worker.fetch(new Request(url, init), env);

test("www leitet dauerhaft auf endlab.de, Pfad bleibt", async () => {
  const res = await get("https://www.endlab.de/spieltisch/r/ABCDE?x=1");
  assert.equal(res.status, 301);
  assert.equal(res.headers.get("location"), "https://endlab.de/spieltisch/r/ABCDE?x=1");
});

test("Startseite: Projekte, Sicherheits-Kopfzeilen, keine fremden Skripte", async () => {
  const res = await get("https://endlab.de/");
  assert.equal(res.status, 200);
  const html = await res.text();
  for (const p of PROJECTS) assert.ok(html.includes(p.name));
  assert.match(res.headers.get("content-security-policy"), /script-src 'self'/);
  assert.match(res.headers.get("content-security-policy"), /frame-ancestors 'none'/);
  assert.equal(res.headers.get("x-content-type-options"), "nosniff");
  assert.ok(!/<script(?![^>]*src="\/app\.js")/.test(html), "nur das eigene Skript");
});

test("Installierbar erst mit dem Schalter: vorher weder Manifest noch Hinweis", () => {
  assert.equal(INSTALL, false);
  assert.ok(!page(false).includes("manifest.webmanifest"));
  assert.ok(!page(false).includes("EndLab installieren"));
  const on = page(true);
  assert.ok(on.includes('<link rel="manifest" href="/manifest.webmanifest">'));
  assert.ok(on.includes("EndLab installieren"));
  assert.ok(on.includes('src="/app.js"'));
});

test("Eigene Dateien kommen aus public/, der Service Worker ohne Zwischenspeicher", async () => {
  for (const f of FILES) assert.equal((await get(`https://endlab.de${f}`)).status, 200, f);
  assert.equal((await get("https://endlab.de/sw.js")).headers.get("cache-control"), "no-cache");
});

test("Manifest: eine App für alles unter endlab.de", async () => {
  const m = JSON.parse(await readFile(new URL("../public/manifest.webmanifest", import.meta.url), "utf8"));
  assert.equal(m.id, "/");
  assert.equal(m.scope, "/");
  assert.equal(m.start_url, "/");
  assert.equal(m.display, "standalone");
  assert.ok(m.icons.some((i) => i.purpose === "maskable" && i.sizes === "512x512"));
  for (const i of m.icons) assert.equal((await get(`https://endlab.de${i.src}`)).status, 200, i.src);
});

test("Service Worker fasst Projektpfade, fremde Adressen und POST nicht an", async () => {
  const code = await readFile(new URL("../public/sw.js", import.meta.url), "utf8");
  const listeners = {};
  const self = { location: { origin: "https://endlab.de" }, addEventListener: (t, fn) => { listeners[t] = fn; } };
  vm.runInNewContext(code, { self, URL, caches: { match: async () => undefined, open: async () => ({ put: async () => {} }) }, fetch: () => Promise.reject(new Error("offline")), Response });
  const handled = (url, method = "GET") => {
    let used = false;
    listeners.fetch({ request: { url, method }, respondWith: (p) => { used = true; void Promise.resolve(p).catch(() => {}); } });
    return used;
  };
  assert.equal(handled("https://endlab.de/"), true);
  assert.equal(handled("https://endlab.de/icons/icon-192.png"), true);
  for (const url of ["https://endlab.de/spieltisch/", "https://endlab.de/spieltisch/api/rooms", "https://endlab.de/anderes-projekt/x", "https://spieltisch.endlab.de/"]) assert.equal(handled(url), false, url);
  assert.equal(handled("https://endlab.de/", "POST"), false);
});

test("Unbekannte Pfade gehen zur Startseite, nur GET/HEAD", async () => {
  const res = await get("https://endlab.de/gibtsnicht");
  assert.equal(res.status, 302);
  assert.equal(res.headers.get("location"), "https://endlab.de/");
  assert.equal((await get("https://endlab.de/", { method: "POST" })).status, 405);
});
