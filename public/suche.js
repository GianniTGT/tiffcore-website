// Suche über alle Seiten: Lupe in der Kopfzeile (oder Taste «/» bzw. Strg+K).
// Liest die eigenen Seiten, keine fremden Server, kein Cookie. Ohne Skript gibt es keine Lupe.
(() => {
  "use strict";
  const knopf = document.querySelector(".suche-knopf");
  if (!knopf) return;
  const SEITEN = ["/", "/impressum.html", "/datenschutz.html"];
  // Text eines Blocks mit Leerzeichen zwischen den Elementen (textContent klebt sonst «59» und «pro Monat» zusammen)
  const textVon = (el) => { const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); const teile = []; while (w.nextNode()) teile.push(w.currentNode.nodeValue); return teile.join(" ").replace(/\s+/g, " ").trim(); };
  const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  let geladen = null;
  const laden = () => geladen || (geladen = sammeln());

  const sammeln = async () => {
    const eintraege = [];
    for (const pfad of SEITEN) {
      try {
        const html = await (await fetch(pfad)).text();
        const doc = new DOMParser().parseFromString(html, "text/html");
        doc.querySelectorAll("main h1, main h2, main h3, main summary").forEach((h) => {
          const block = h.closest("details, .karte, .preis-karte, .reihe > div, section, main") || h.parentElement;
          const anker = h.closest("[id]");
          const text = textVon(block);
          eintraege.push({ titel: h.textContent.replace(/\s+/g, " ").trim(), text, url: pfad + (anker && anker.id !== "inhalt" ? "#" + anker.id : ""), such: norm(text) });
        });
      } catch { /* Seite nicht erreichbar: weiter mit den anderen */ }
    }
    return eintraege;
  };

  const box = document.createElement("div");
  box.className = "suche";
  box.hidden = true;
  box.innerHTML = '<div class="suche-fenster" role="dialog" aria-modal="true" aria-label="Suche"><label class="suche-feld"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg><input type="search" placeholder="Suchen, z. B. QR-Rechnung" aria-label="Suchbegriff" autocomplete="off"></label><ul class="suche-treffer"></ul><p class="suche-tipp">Esc schliesst · Enter öffnet den ersten Treffer</p></div>';
  document.body.appendChild(box);
  const feld = box.querySelector("input"), liste = box.querySelector(".suche-treffer");

  let lauf = 0;
  const zeige = async () => {
    const meiner = ++lauf;
    const woerter = norm(feld.value).split(/\s+/).filter(Boolean);
    const alle = await laden();
    if (meiner !== lauf) return; // inzwischen weitergetippt
    liste.innerHTML = "";
    if (!woerter.length) return;
    const gesehen = new Set();
    const treffer = alle.filter((e) => woerter.every((w) => e.such.includes(w) || norm(e.titel).includes(w)) && !gesehen.has(e.titel) && gesehen.add(e.titel)).slice(0, 7);
    if (!treffer.length) { liste.innerHTML = '<li class="leer">Nichts gefunden. Schreiben Sie uns, wir helfen gern.</li>'; return; }
    for (const t of treffer) {
      const li = document.createElement("li"), a = document.createElement("a"), b = document.createElement("b"), s = document.createElement("span");
      a.href = t.url; b.textContent = t.titel;
      const i = norm(t.text).indexOf(woerter[0]);
      s.textContent = (i > 40 ? "… " : "") + t.text.slice(Math.max(0, i - 40), Math.max(0, i - 40) + 120) + " …";
      a.append(b, s); li.append(a); liste.append(li);
      a.addEventListener("click", schliessen);
    }
  };
  const oeffnen = () => { box.hidden = false; document.documentElement.classList.add("suche-offen"); feld.focus(); laden(); };
  function schliessen() { box.hidden = true; document.documentElement.classList.remove("suche-offen"); }

  knopf.addEventListener("click", oeffnen);
  feld.addEventListener("input", zeige);
  feld.addEventListener("keydown", (e) => { if (e.key === "Enter") { const a = liste.querySelector("a"); if (a) { a.click(); location.href = a.href; } } });
  box.addEventListener("click", (e) => { if (e.target === box) schliessen(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !box.hidden) schliessen();
    else if (box.hidden && ((e.key === "/" && !/input|textarea/i.test(document.activeElement.tagName)) || (e.key === "k" && (e.ctrlKey || e.metaKey)))) { e.preventDefault(); oeffnen(); }
  });
})();
