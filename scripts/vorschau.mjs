// Vorschau der Werbeseite (Ordner public) auf http://localhost:4010 – nur zum Anschauen, ohne Docker und ohne Datenbank.
// Aufruf: node scripts/vorschau.mjs
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const WURZEL = join(fileURLToPath(new URL("..", import.meta.url)), "public");
const PORT = Number(process.env.PORT) || 4010;
const TYPEN = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".svg": "image/svg+xml", ".txt": "text/plain; charset=utf-8", ".png": "image/png" };

createServer(async (req, res) => {
  const pfad = decodeURIComponent((req.url ?? "/").split("?")[0]);
  const datei = normalize(join(WURZEL, pfad === "/" ? "index.html" : pfad));
  if (!datei.startsWith(WURZEL)) { res.writeHead(403).end(); return; }
  try {
    const inhalt = await readFile(datei);
    res.writeHead(200, { "Content-Type": TYPEN[extname(datei)] ?? "application/octet-stream" }).end(inhalt);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("Nicht gefunden");
  }
}).listen(PORT, () => console.log(`Werbeseite: http://localhost:${PORT}`));
