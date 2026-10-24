# Plan: EndLab – alle Projekte unter endlab.de, eine App, ein Speicher

Auftrag für den Agenten, der am Spieltisch-Repo arbeitet. Bitte selbst einordnen, wann und in welchen Schritten das passiert. Vor jedem Push fragen (siehe `CLAUDE.md`).

## Ziel

- **Eine Adresse:** `endlab.de`. Darunter liegt jedes Projekt unter einem eigenen Pfad, z. B. `endlab.de/spieltisch/`. Weitere Projekte kommen später dazu.
- **Eine installierbare App „EndLab“** (PWA, also als App installierbare Webseite) für iPhone und Android. Sie startet auf der EndLab-Startseite, und von dort geht es ohne die App zu verlassen in die Projekte.
- **Ein Speicher, ein Konto:** Der Browser trennt Speicher (`localStorage`, Cookies, Cache) strikt nach Adresse. Auf dem iPhone hat zusätzlich jede installierte Web-App ihren eigenen Speicher. Ein gemeinsames Konto über mehrere Adressen oder mehrere installierte Apps geht deshalb nicht. Es geht nur mit einer Adresse und einer App.
- Jedes Projekt bleibt ein **eigener Worker** mit eigenem Code, Deploy und Daten. Gemeinsam sind nur die Adresse und der Browserspeicher.

## Stand heute (schon erledigt)

- Die Zone `endlab.de` liegt bei Cloudflare: DNSSEC an, SSL „Full (strict)“, HTTPS erzwungen, TLS ab 1.2.
- `spieltisch.endlab.de` ist als eigene Domain am Worker `spieltisch` eingerichtet. Commit `762593b` auf `origin/claude/clever-ptolemy-xtkrsj` trägt das in `wrangler.jsonc`, README, `release.mjs` und `stimme/erzeugen.py` nach. **Noch nicht auf main.** Wenn dieser Plan umgesetzt wird, ist der Commit nur ein Zwischenschritt. Die Adresse wird dann `endlab.de/spieltisch`, und `spieltisch.endlab.de` leitet nur noch um.
- `endlab.de` und `www.endlab.de` zeigen eine kleine Startseite. Sie läuft als eigener Worker `endlab-start` und liegt in **keinem** Repo. Den Quelltext hat der Nutzer bzw. die andere Sitzung.
- Live wird bisher `spieltisch.bjoern-ef9.workers.dev` genutzt. Dort liegen die Profile der Leute im Browser.

## Zielaufbau

| Pfad | Worker | Hinweis |
|---|---|---|
| `endlab.de/` | `endlab-start` (Hub) | Startseite mit allen Projekten, Manifest der EndLab-App, kleiner Service Worker |
| `endlab.de/spieltisch/…` | `spieltisch` | komplette App, `/spieltisch/api/…`, WebSockets |
| `endlab.de/<projekt>/…` | eigener Worker | später |
| `www.endlab.de` | `endlab-start` | 301 nach `endlab.de` |
| `spieltisch.endlab.de`, `spieltisch.bjoern-ef9.workers.dev` | `spieltisch` | Umzugsseite (siehe Schritt 4), Vorschauen je Zweig bleiben auf workers.dev |

Cloudflare verteilt per **Zonen-Route** nach Pfad: `endlab.de/spieltisch*` → `spieltisch`. Eigene Domains („Custom Domains“) können nicht nach Pfad trennen. Prüfen, ob der Hub als Custom Domain auf `endlab.de` neben der Route funktioniert und welche Regel Vorrang hat. Sonst den Hub ebenfalls als Route `endlab.de/*` mit eigenem DNS-Eintrag (AAAA `100::`, über Cloudflare geleitet) einrichten. Die spezifischere Route gewinnt.

## Schritt 1 – Hub als EndLab-App

- Den Hub in ein eigenes Repo `endlab-start` legen (der Nutzer legt es an) oder vorerst als Unterordner. Bitte mit dem Nutzer klären.
- Manifest `/manifest.webmanifest`: `id: "/"`, `scope: "/"`, `start_url: "/"`, `display: standalone`, Name „EndLab“, eigene Icons (192, 512, maskable), Farben passend zum Papierschnitt-Look.
- Service Worker `/sw.js` mit Scope `/`. Er darf **nichts unter `/spieltisch/` und keinem anderen Projektpfad** abfangen oder zwischenspeichern. Projekte registrieren eigene Service Worker mit engerem Scope, die für ihre Seiten Vorrang haben.
- Installationshinweis wie bei Spieltisch (iPhone: Teilen → „Zum Home-Bildschirm“).
- Startseite: Kachel je Projekt, gleiche Gestaltungsregeln wie Spieltisch (kein Scrollen auf dem Handy, keine Markennamen).
- Später möglich: Kurzlinks `endlab.de/r/CODE` → `endlab.de/spieltisch/r/CODE`.

## Schritt 2 – Spieltisch unter `/spieltisch/` lauffähig machen

Umfang heute: etwa 64 `/api/`-Aufrufe im Client, etwa 37 `navigate("/…")`, Routen in `src/hooks/useRoute.ts`, Worker-Pfade in `worker/index.ts`, `public/sw.js`, `public/manifest.webmanifest`, `index.html` und einige feste Dateipfade (Icons, Stimme, Assets).

Vorschlag:
- **Ein zentraler Basispfad** im Client (`import.meta.env.BASE_URL` bzw. Vite `base: "/spieltisch/"`). Helfer wie `apiUrl("/api/…")` und `appPath("/r/CODE")` statt fester Pfade. `useRoute.parse` schneidet den Basispfad vor dem Vergleich ab, `navigate` setzt ihn davor.
- **Worker:** Am Anfang von `fetch` ein vorangestelltes `/spieltisch` abschneiden, damit die restliche Logik unverändert bleibt. Für die Übergangszeit und die Tests beide Formen annehmen, mit und ohne Präfix. Statische Dateien entweder per `run_worker_first` und Umschreiben an `env.ASSETS` weiterreichen oder gleich unter `dist/client/spieltisch/` bauen. Was mit dem Vite-Cloudflare-Plugin sauberer geht, selbst entscheiden.
- **WebSockets, Realtime/Anrufe, R2-Dateien, Stimme** (`stimme/…`) und Admin (`/spieltisch/admin`) mitziehen.
- **Service Worker** nach `/spieltisch/sw.js` mit Scope `/spieltisch/`, Cache-Name bleibt eindeutig. `precache.json` und `__precache-lists` mit Basispfad.
- **Manifest:** Spieltisch soll **nicht** mehr als eigene App installierbar sein. Seiten unter `/spieltisch/` verweisen auf das EndLab-Manifest (`/manifest.webmanifest`). `InstallHint` wirbt für die EndLab-App. Begründung: Eine zweite installierte App wäre auf dem iPhone wieder ein eigener Speicher, also ein zweites Konto.
- **Geteilte Links** (Raum-Links, Gruppen-Links, Übertragungs-Code, QR-Codes, Großer Tisch) enthalten den Basispfad.
- **Tests:** Playwright `baseURL` bzw. die Pfade anpassen. Den Dev-Server mit Basispfad starten oder den Worker beide Formen annehmen lassen.
- `scripts/release.mjs` (`LIVE_URL`) und `scripts/stimme/erzeugen.py` (`SITE_URL`) auf `https://endlab.de/spieltisch` umstellen, ebenso README und `docs/betrieb.md` (Abschnitt „Adressen“).
- `wrangler.jsonc`: Route `{ "pattern": "endlab.de/spieltisch*", "zone_name": "endlab.de" }` statt Custom Domain. `workers_dev: true` und `preview_urls: true` bleiben, weil die Vorschauen und der Umzug sie brauchen.

## Schritt 3 – Gemeinsames Konto (später, optional)

Das Spieltisch-Profil (Profil-ID und Geräteschlüssel, `ProfileStore`) wird zum „EndLab-Konto“. Dafür in `localStorage` neutrale Schlüssel (`endlab:…`) für Konto-Daten nutzen, die alle Projekte lesen. Projekt-eigene Einstellungen behalten ihren Präfix (`spieltisch:…`). Nicht für den ersten Umzug nötig, aber die Schlüssel beim Umbau gleich so anlegen.

## Schritt 4 – Umzug ohne Kontoverlust

Alte Adressen (`spieltisch.bjoern-ef9.workers.dev`, `spieltisch.endlab.de`) laufen auf demselben Worker und denselben Daten. Ein reiner 301 würde den Browserspeicher zurücklassen. Deshalb:
- Auf den alten Adressen lädt die App wie bisher. Hat das Gerät ein Profil, holt sie automatisch einen Übertragungs-Code (gibt es schon: `/api/profile/:id/transfer` und `/profil/uebernehmen/:code`) und springt auf `https://endlab.de/spieltisch/profil/uebernehmen/CODE?weiter=<Pfad>`. Ohne Profil springt sie direkt auf `https://endlab.de/spieltisch/<Pfad>`. Name und wichtige Einstellungen am besten mitgeben. Raum-Tokens offener Räume nach Möglichkeit ebenfalls, sonst tritt man per PIN neu bei.
- Installierte alte Spieltisch-Apps: einen kurzen Hinweis zeigen, dass die EndLab-App neu installiert werden soll. Unter iOS öffnet der Sprung die neue Adresse in einem Fenster innerhalb der alten App.
- Nichts darf hängen bleiben: Klappt die Übertragung nicht, trotzdem weiterleiten und auf der neuen Seite „Profil per Code übernehmen“ anbieten.
- Erst wenn der Umzug live und erprobt ist, die alten Adressen in Ruhe lassen. **Nicht abschalten**, weil Vorschauen und alte Links sie brauchen.

## Cloudflare-Seite

Der API-Token der anderen Sitzung (`claude-agent`) darf Zone, DNS, SSL, Zone Settings, Workers Routes und Workers Scripts bearbeiten. Routen und den Hub-Deploy kann also jede Sitzung mit diesem Token übernehmen. Die Route kann auch einfach über `wrangler.jsonc` beim Deploy entstehen.

## Reihenfolge-Vorschlag

1. Hub-Repo und EndLab-Manifest (unabhängig, sofort möglich).
2. Spieltisch mit Basispfad. Erst als Vorschau, mit Bildern im Handy-Format und Durchspielen (`CLAUDE.md`).
3. Route `endlab.de/spieltisch*` aktivieren und Hub-Kachel verlinken.
4. Umzugslogik auf den alten Adressen live schalten, danach „Was ist neu?“-Eintrag.
5. Später: gemeinsames Konto für weitere Projekte.
