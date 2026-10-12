# TiffCore Werbeseite

Die Webseite auf **https://tiffcore.ch**: Werbeseite mit Login-Knopf, Impressum und Datenschutz.
Ein Produkt der Tiff Software Solutions, Bern. Die App selbst (TiffCore, `app.tiffcore.ch`) liegt in einem anderen Repo: `GianniTGT/Handwerk`.

Die Seite besteht aus festen Dateien, ohne Baukasten, ohne Cookies und ohne Dateien von fremden Anbietern. Einziges Skript ist `public/punkte.js` (das Logo aus leuchtenden Punkten im Kopfbereich), und es kommt von der Seite selbst: Die Sicherheitsrichtlinie erlaubt nur eigene Dateien, kein Skript im HTML.

## Aufbau

| Pfad | Inhalt |
|---|---|
| `public/` | Alles, was im Internet erscheint (Startseite, Impressum, Datenschutz, Gestaltung, Logo) |
| `scripts/vorschau.mjs` | Kleine Vorschau auf dem eigenen Rechner |
| `.claude/launch.json` | Startet die Vorschau in der Claude-App |

Nur der Ordner `public/` wird ausgeliefert. `README.md`, `scripts/` und `.git` bleiben ausserhalb und sind aus dem Internet nicht erreichbar.

## Ansehen und ändern

```bash
node scripts/vorschau.mjs
```

Dann `http://localhost:4010` öffnen. Es gibt nichts zu installieren.

## Regeln für Änderungen

- **Keine Skripte, keine Schriften und keine Bilder von fremden Servern einbauen.** Die Sicherheitsrichtlinie (CSP) im Webserver erlaubt nur Dateien von der Seite selbst. Ein fremdes Skript würde einfach nicht laufen.
- **Keine `style="…"`-Angaben in den HTML-Dateien.** Auch sie blockiert die Richtlinie. Gestaltung gehört in `public/style.css`.
- Inhalte über die App nur behaupten, wenn sie in der App wirklich vorhanden sind.
- «bexio» oder andere Konkurrenznamen kommen auf der Seite nicht vor.
- Impressum und Datenschutz sind aus dem Impressum der Firmenseite abgeleitet und nicht juristisch geprüft.

## Auf den Server bringen

Der Webserver (Caddy) auf dem vServer liefert den Ordner `/opt/tiffcore-website/public` aus. Das ist eine Kopie dieses Repos.
Eine Änderung geht so live (auf dem Server als root, dauert Sekunden, ohne Neubau der App):

```bash
git -C /opt/tiffcore-website pull --ff-only
```

Die einmalige Einrichtung (Kopie anlegen, Adresse einschalten) macht das Skript `deploy/webseite-einschalten.sh` aus dem Repo `GianniTGT/Handwerk`.
Vorher müssen im DNS Editor von hosttech die Einträge von `tiffcore.ch` und `www.tiffcore.ch` auf den Server zeigen (A-Eintrag auf `185.178.195.35`, kein AAAA-Eintrag). Der Eintrag `mail.tiffcore.ch` darf nicht angefasst werden.

## Preise ändern

Die Preise stehen in `public/preise.json` (basis, plus, pro, website). Auf GitHub die Datei öffnen, auf den Stift klicken,
die Zahl ändern, «Commit changes» drücken. Nach spätestens 5 Minuten steht der neue Preis auf tiffcore.ch.
