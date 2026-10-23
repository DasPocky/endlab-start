# EndLab – Startseite

Startseite von **https://endlab.de** (Cloudflare Worker `endlab-start`). Ziel: eine installierbare App „EndLab“, darin alle Projekte unter eigenen Pfaden (`endlab.de/spieltisch/…`) – ein Speicher, ein Profil, auch wenn weitere Projekte dazukommen.

- `src/index.js` – Startseite, www → endlab.de, Sicherheits-Kopfzeilen, eigene Dateien
- `public/` – Manifest, Service Worker (fasst Projektpfade nie an), Installationshinweis, Icons
- `test/` – `npm test` (Node, ohne Abhängigkeiten)
- `docs/plan.md` – Gesamtplan; Bewertung und Reihenfolge stehen im Spieltisch-Repo unter `docs/endlab.md`

## Stand

| Schritt | Stand |
| --- | --- |
| Startseite mit Kachel je Projekt | ✅ |
| Manifest, Icons, Service Worker, Installationshinweis (iPhone: Teilen → „Zum Home-Bildschirm“, Android: Knopf) | ✅ gebaut, **aus** (`INSTALL = false`) |
| Installierbar schalten | ⏳ erst wenn der Spieltisch unter `endlab.de/spieltisch` läuft (E3) – sonst lägen seine Daten außerhalb der App |
| Route `endlab.de/*` statt eigener Domain | ⏳ mit E3 (`wrangler.jsonc`) |

## Prüfen und ausliefern

```
npm install
npm run check   # Tests + wrangler deploy --dry-run
npm run deploy  # nur nach Freigabe
```

`wrangler.jsonc` bildet ab, wie der Worker heute hängt (eigene Domains `endlab.de`, `www.endlab.de`), damit ein Deploy nichts abhängt.
