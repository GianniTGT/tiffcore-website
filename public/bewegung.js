// Bewegung: Inhalte gleiten beim Scrollen herein, Knöpfe geben beim Klick eine Lichtwelle,
// Karten kippen leicht mit der Maus. Wer am Gerät «weniger Bewegung» gewählt hat, sieht alles ruhig.
(() => {
  "use strict";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // 1. Hereingleiten
  const ziele = document.querySelectorAll(".sec-kopf, .karte, .reihe > div, .pillen span, .preis-karte, .fragen details, .zeig-rahmen, .kette li, .stuetze, .schluss-karte");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((eintraege) => {
      eintraege.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("da"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    ziele.forEach((el) => {
      const geschwister = el.parentElement ? [...el.parentElement.children].indexOf(el) : 0;
      el.style.setProperty("--v", Math.min(geschwister, 6) * 70 + "ms");
      el.classList.add("auf");
      io.observe(el);
    });
  }

  // 2. Lichtwelle beim Klick auf einen Knopf
  document.addEventListener("pointerdown", (e) => {
    const k = e.target.closest(".btn");
    if (!k) return;
    const r = k.getBoundingClientRect(), w = document.createElement("span");
    w.className = "welle";
    w.style.setProperty("--x", e.clientX - r.left + "px");
    w.style.setProperty("--y", e.clientY - r.top + "px");
    k.appendChild(w);
    setTimeout(() => w.remove(), 700);
  });

  // 3. Karten kippen mit der Maus (nur mit Maus, nicht am Handy)
  if (window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".karte, .preis-karte, .zeig-rahmen, .rahmen-bild, .stuetze").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        const stark = el.classList.contains("zeig-rahmen") ? 3 : 6;
        el.style.setProperty("--kipp", `perspective(900px) rotateX(${(-y * stark).toFixed(2)}deg) rotateY(${(x * stark).toFixed(2)}deg) translateY(-4px)`);
      });
      el.addEventListener("pointerleave", () => el.style.removeProperty("--kipp"));
    });
  }
})();
