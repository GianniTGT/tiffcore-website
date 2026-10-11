// Das TiffCore-Logo aus leuchtenden Punkten: Rand, T und Schwung sammeln sich aus verstreuten Punkten,
// drehen sich leicht im Raum und folgen dem Zeiger. Reines Canvas, keine Bibliothek, keine fremden Dateien.
(() => {
  "use strict";
  const canvas = document.getElementById("punkte");
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext("2d");
  const ruhig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const schmal = window.matchMedia("(max-width: 700px)").matches;
  const dichte = schmal ? 0.55 : 1;

  // Immer dieselbe Form: Zufall mit festem Startwert
  let samen = 11;
  const zufall = () => (samen = (samen * 16807) % 2147483647) / 2147483647;
  const klemme = (v, a, b) => Math.min(b, Math.max(a, v));

  // Leuchtpunkt vorab als kleines Bild (Kern weiss, Hof in der Farbe)
  const sprite = (rgb) => {
    const s = 48, c = document.createElement("canvas");
    c.width = c.height = s;
    const g = c.getContext("2d"), r = s / 2;
    const v = g.createRadialGradient(r, r, 0, r, r, r);
    v.addColorStop(0, "rgba(255,255,255,1)");
    v.addColorStop(0.16, `rgba(${rgb},1)`);
    v.addColorStop(0.42, `rgba(${rgb},0.32)`);
    v.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = v;
    g.fillRect(0, 0, s, s);
    return c;
  };
  const FARBEN = [sprite("240,200,113"), sprite("95,227,160"), sprite("47,191,116"), sprite("255,255,255"), sprite("120,200,255")];
  const GOLD = 0, MINT = 1, GRUEN = 2, WEISS = 3, EIS = 4;

  // Ebenen: 0 Rand, 1 T, 2 Schwung, 3 Staub
  const punkte = [];
  const neu = (x, y, z, farbe, gr, ebene, u, delay) => {
    punkte.push({
      x: x - 256, y: y - 256, z,
      sx: (zufall() - 0.5) * 2400, sy: (zufall() - 0.5) * 1700, sz: (zufall() - 0.15) * 1500,
      f: farbe, g: gr, e: ebene, u, d: delay, ph: zufall() * 6.2832,
    });
  };

  // Punkt auf einem Rechteck mit runden Ecken (u von 0 bis 1 einmal rundherum)
  const rundRechteck = (x0, y0, x1, y1, r, u) => {
    const w = x1 - x0 - 2 * r, h = y1 - y0 - 2 * r, a = (Math.PI * r) / 2;
    const L = 2 * w + 2 * h + 4 * a;
    let d = u * L, t;
    if (d < w) return [x0 + r + d, y0];
    d -= w; if (d < a) { t = d / r; return [x1 - r + Math.sin(t) * r, y0 + r - Math.cos(t) * r]; }
    d -= a; if (d < h) return [x1, y0 + r + d];
    d -= h; if (d < a) { t = d / r; return [x1 - r + Math.cos(t) * r, y1 - r + Math.sin(t) * r]; }
    d -= a; if (d < w) return [x1 - r - d, y1];
    d -= w; if (d < a) { t = d / r; return [x0 + r - Math.sin(t) * r, y1 - r + Math.cos(t) * r]; }
    d -= a; if (d < h) return [x0, y1 - r - d];
    d -= h; t = d / r; return [x0 + r - Math.cos(t) * r, y0 + r - Math.sin(t) * r];
  };

  // 1. Rand: drei Linien ineinander, leicht wellig, nicht ganz gerade
  [[0, 700, 1.7], [1, 400, 1.25], [2, 230, 1.0]].forEach(([k, n, gr]) => {
    const einzug = 6 + k * 24, radius = 100 - einzug * 0.55;
    const n2 = Math.round(n * dichte);
    for (let i = 0; i < n2; i++) {
      const u = i / n2;
      const [x, y] = rundRechteck(einzug, einzug, 512 - einzug, 512 - einzug, radius, u);
      const wx = Math.sin(u * 37 + k * 1.7) * 3.2 + Math.sin(u * 91 + k) * 1.6 + (zufall() - 0.5) * 3;
      const wy = Math.cos(u * 29 + k * 2.3) * 3.2 + Math.cos(u * 83 + k) * 1.6 + (zufall() - 0.5) * 3;
      neu(x + wx, y + wy, -k * 16 + (zufall() - 0.5) * 6, zufall() < 0.18 ? MINT : GOLD, gr, 0, u, u * 0.9);
    }
  });

  // 2. T: Fläche aus Punkten (obere Leiste und Stamm) plus hellere Kante
  const leiste = [80, 72, 432, 181], stamm = [201, 72, 311, 440];
  const flaeche = (leiste[2] - leiste[0]) * (leiste[3] - leiste[1]), flaeche2 = (stamm[2] - stamm[0]) * (stamm[3] - stamm[1]);
  const nFlaeche = Math.round(1150 * dichte);
  for (let i = 0; i < nFlaeche; i++) {
    const r = zufall() * (flaeche + flaeche2) < flaeche ? leiste : stamm;
    const x = r[0] + zufall() * (r[2] - r[0]), y = r[1] + zufall() * (r[3] - r[1]);
    const c = zufall();
    neu(x, y, (zufall() - 0.5) * 14, c < 0.5 ? GRUEN : c < 0.88 ? MINT : GOLD, 0.8 + zufall() * 0.7, 1, 0, 0.5 + zufall() * 0.9);
  }
  const ecken = [[80, 72], [432, 72], [432, 181], [311, 181], [311, 440], [201, 440], [201, 181], [80, 181]];
  const kantenLaenge = ecken.map((e, i) => { const f = ecken[(i + 1) % ecken.length]; return Math.hypot(f[0] - e[0], f[1] - e[1]); });
  const umfang = kantenLaenge.reduce((a, b) => a + b, 0);
  const nKante = Math.round(520 * dichte);
  for (let i = 0; i < nKante; i++) {
    let d = (i / nKante) * umfang, k = 0;
    while (d > kantenLaenge[k]) { d -= kantenLaenge[k]; k++; }
    const a = ecken[k], b = ecken[(k + 1) % ecken.length], t = d / kantenLaenge[k];
    neu(a[0] + (b[0] - a[0]) * t + (zufall() - 0.5) * 2.5, a[1] + (b[1] - a[1]) * t + (zufall() - 0.5) * 2.5, 6, MINT, 1.5, 1, i / nKante, 0.5 + zufall() * 0.9);
  }

  // 3. Schwung im T (das weisse Hakenstück des Logos)
  const nHaken = Math.round(240 * dichte), l1 = 71, l2 = (Math.PI / 2) * 65, l3 = 209.5, lg = l1 + l2 + l3;
  for (let i = 0; i < nHaken; i++) {
    const u = i / nHaken;
    let d = u * lg, x, y;
    if (d < l1) { x = 119 + d; y = 125.5; }
    else if (d < l1 + l2) { const t = (d - l1) / 65; x = 190 + Math.sin(t) * 65; y = 190.5 - Math.cos(t) * 65; }
    else { x = 255; y = 190.5 + (d - l1 - l2); }
    const q = (zufall() - 0.5) * 15;
    neu(x + (y === 125.5 ? 0 : q), y + (y === 125.5 ? q : 0) + (x === 255 ? 0 : 0), 14, zufall() < 0.25 ? GOLD : WEISS, 0.95 + zufall() * 0.45, 2, u, 1.3 + u * 0.8);
  }

  // 4. Staub im Raum für die Tiefe
  const nStaub = Math.round(190 * dichte);
  for (let i = 0; i < nStaub; i++) {
    const p = { x: (zufall() - 0.5) * 1100, y: (zufall() - 0.5) * 900, z: (zufall() - 0.5) * 760 };
    neu(p.x + 256, p.y + 256, p.z, [GOLD, MINT, EIS, WEISS][Math.floor(zufall() * 4)], 0.5 + zufall() * 0.7, 3, zufall(), 0.4 + zufall() * 1.6);
    const q = punkte[punkte.length - 1]; q.sx = q.x; q.sy = q.y; q.sz = q.z; // Staub wird nur eingeblendet
  }

  // Grösse und Zeiger
  let breite = 0, hoehe = 0, dpr = 1, sichtbar = true, zielX = 0, zielY = 0, mx = 0, my = 0;
  const messen = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    breite = canvas.clientWidth; hoehe = canvas.clientHeight;
    canvas.width = Math.round(breite * dpr); canvas.height = Math.round(hoehe * dpr);
  };
  window.addEventListener("pointermove", (e) => { zielX = (e.clientX / innerWidth - 0.5) * 2; zielY = (e.clientY / innerHeight - 0.5) * 2; }, { passive: true });

  const F = 1150;
  let ueberspringe = 1;
  const zeichne = (t) => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, breite, hoehe);
    ctx.globalCompositeOperation = "lighter";
    mx += (zielX - mx) * 0.05; my += (zielY - my) * 0.05;
    const gier = ruhig ? 0.34 : Math.sin(t * 0.45) * 0.4 + mx * 0.5;
    const nick = ruhig ? -0.08 : Math.sin(t * 0.33 + 1) * 0.12 - my * 0.28;
    const cg = Math.cos(gier), sg = Math.sin(gier), cn = Math.cos(nick), sn = Math.sin(nick);
    const mass = Math.min(breite, hoehe) / 640, mitteX = breite / 2, mitteY = hoehe / 2;
    for (let i = 0; i < punkte.length; i++) {
      const p = punkte[i];
      if (ueberspringe > 1 && p.e !== 2 && i % ueberspringe) continue;
      let k = ruhig ? 1 : klemme((t - p.d) / 1.7, 0, 1);
      k = 1 - Math.pow(1 - k, 3);
      if (k <= 0.004) continue;
      const wk = p.e === 3 ? 7 : 1.7;
      let x = p.sx + (p.x - p.sx) * k + Math.sin(t * 0.9 + p.ph) * wk;
      let y = p.sy + (p.y - p.sy) * k + Math.cos(t * 0.8 + p.ph * 1.3) * wk;
      let z = p.sz + (p.z - p.sz) * k + Math.sin(t * 0.7 + p.ph * 2) * wk * 0.8;
      if (p.e === 3) { x += Math.sin(t * 0.12 + p.ph) * 22; y += Math.cos(t * 0.1 + p.ph) * 18; }
      const x1 = x * cg + z * sg, z1 = -x * sg + z * cg;
      const y1 = y * cn - z1 * sn, z2 = y * sn + z1 * cn;
      const s = F / (F + z2);
      const px = mitteX + x1 * s * mass, py = mitteY + y1 * s * mass;
      // Lichtstreifen: läuft um den Rand und von oben nach unten durchs T
      let welle = 0;
      if (p.e === 0) welle = 0.6 * Math.pow(Math.max(0, Math.sin(p.u * 12.566 - t * 1.5)), 9);
      else if (p.e === 1) welle = 0.7 * Math.pow(Math.max(0, Math.sin((p.y + 256) * 0.013 - t * 2.1)), 12);
      else if (p.e === 2) welle = 0.45 * Math.pow(Math.max(0, Math.sin(p.u * 6.283 * 1.5 - t * 2.6)), 6);
      const basis = p.e === 0 ? 0.74 : p.e === 1 ? 0.6 : p.e === 2 ? 0.7 : 0.34;
      const flimmer = 0.68 + 0.32 * Math.sin(t * (1.4 + (p.ph % 2)) + p.ph * 3);
      const a = klemme(basis * flimmer + welle, 0, 1) * (p.e === 3 ? k : Math.min(1, k * 1.6));
      const d = p.g * mass * s * 9 * (1 + welle * 0.55);
      if (d < 0.8) continue;
      ctx.globalAlpha = a;
      ctx.drawImage(FARBEN[p.f], px - d / 2, py - d / 2, d, d);
    }
    ctx.globalAlpha = 1;
  };

  const start = performance.now();
  let letzte = 0, summe = 0, anzahl = 0;
  const schleife = (jetzt) => {
    if (sichtbar) {
      zeichne((jetzt - start) / 1000);
      // Zu langsam (unter etwa 28 Bilder pro Sekunde)? Dann jeden zweiten, dritten Punkt weglassen.
      if (letzte && jetzt - start > 3500) { summe += jetzt - letzte; anzahl++; }
      if (anzahl === 50) { if (summe / anzahl > 36 && ueberspringe < 4) ueberspringe++; summe = 0; anzahl = 0; }
    }
    letzte = jetzt;
    requestAnimationFrame(schleife);
  };
  messen();
  if (ruhig) {
    zeichne(99);
    window.addEventListener("resize", () => { messen(); zeichne(99); });
  } else {
    window.addEventListener("resize", messen);
    if ("IntersectionObserver" in window) new IntersectionObserver((e) => { sichtbar = e[0].isIntersecting; }).observe(canvas);
    requestAnimationFrame(schleife);
  }
  // Für die Prüfung in der Vorschau: Anzahl der Punkte
  canvas.dataset.punkte = String(punkte.length);
})();
