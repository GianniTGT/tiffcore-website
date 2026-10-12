// Preise aus preise.json: Wer die Preise ändern will, ändert nur diese Datei (auf GitHub, Stift-Symbol).
// Die Zahlen im HTML sind nur der Rückfall, falls die Datei einmal nicht geladen wird.
(() => {
  "use strict";
  const felder = document.querySelectorAll("[data-preis]");
  if (!felder.length) return;
  const chf = (n) => Number.isInteger(n) ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "'") : n.toFixed(2);
  fetch("/preise.json", { cache: "no-cache" })
    .then((r) => (r.ok ? r.json() : null))
    .then((preise) => {
      if (!preise) return;
      felder.forEach((el) => { const n = preise[el.dataset.preis]; if (typeof n === "number" && n >= 0) el.textContent = chf(n); });
    })
    .catch(() => {});
})();
