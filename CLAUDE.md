# Hinweise für Claude

Startseite von endlab.de (eigener Worker). Überblick: `README.md`, Plan: `docs/plan.md`, Bewertung und Reihenfolge im Spieltisch-Repo `docs/endlab.md`.

- Immer auf **Deutsch**, per **du**, kurz und direkt.
- **Vor jedem Push und Deploy fragen**, vorher Bilder im Handy-Format zeigen.
- Kein Scrollen auf dem Handy, keine Markennamen, Papierschnitt-Farben wie der Spieltisch.
- Der Service Worker darf **nichts** unter Projektpfaden (`/spieltisch/…` usw.) abfangen oder speichern.
- Unter `endlab.de` liegen nur eigene, geprüfte Projekte: alle teilen denselben Browserspeicher. Keine fremden Skripte (CSP).
- Vor dem Commit: `npm test`.
