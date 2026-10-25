// Preise aus TiffCore (Betreiber-Bereich → Pakete): dieselben Zahlen wie in der App (Gianni, 25.10.2026).
// Rückfall: /preise.json, dann die Zahlen im HTML.
(() => {
  "use strict";
  const felder = document.querySelectorAll("[data-preis], [data-normal], [data-aktion-bis]");
  if (!felder.length) return;
  const chf = (n) => (Number.isInteger(n) ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "'") : n.toFixed(2));
  const datum = (iso) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("de-CH", { day: "numeric", month: "long", year: "numeric" });
  const laden = (url) => fetch(url, { cache: "no-cache" }).then((r) => (r.ok ? r.json() : Promise.reject()));
  const anwenden = (p) => {
    if (!p || typeof p !== "object") return;
    document.querySelectorAll("[data-preis]").forEach((el) => {
      const e = p[el.dataset.preis];
      const n = typeof e === "number" ? e : e && e.preis;
      if (typeof n === "number" && n >= 0) el.textContent = chf(n);
    });
    document.querySelectorAll("[data-normal]").forEach((el) => {
      const e = p[el.dataset.normal];
      const zeile = el.closest("[data-normal-zeile]") || el;
      if (e && typeof e.normal === "number") { el.textContent = chf(e.normal); zeile.hidden = false; } else zeile.hidden = true;
    });
    const bis = typeof p.aktionBis === "string" ? p.aktionBis : null;
    document.querySelectorAll("[data-aktion-bis]").forEach((el) => { if (bis) el.textContent = datum(bis); });
    document.querySelectorAll("[data-aktion]").forEach((el) => { el.hidden = !bis; });
    const gratis = p.schulung && p.schulung.gratis;
    document.querySelectorAll("[data-schulung-gratis]").forEach((el) => { el.hidden = !gratis; });
  };
  laden("https://app.tiffcore.ch/api/preise").catch(() => laden("/preise.json")).then(anwenden).catch(() => {});
})();
