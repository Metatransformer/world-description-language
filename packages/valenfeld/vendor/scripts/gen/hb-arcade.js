// HIGHBRIDGE MARKET ARCADES: Royal cream-ashlar arcades under River Trade upper storeys. params.kind:
//   range: L m long arcade, front (plaza side) on local -Z at z=-D, back line at z=0 where the shops' fronts stand.
//          Round arches on columns, a paved walkway under, a jettied teal-board storey with lit windows, terracotta roof,
//          Annvyr banners (gold lion on crimson), hanging lanterns. p: L, D (5), bay (3.8), H1 (5), H2 (3.2), seed, ends ("both"|"w"|"e"|"none")
//   stall: market stall 3 x 2 m, striped awning (p.hue), counter of goods (p.goods: fruit|cloth|pots|bread|flowers), front -Z
//   cart:  flower cart; crates: a stack of crates and barrels; lamp: iron lamp post 3.4 m (the row carries the light)
import { BX, HX, RB, LA, ROOF, TORUS, paint, flatc, glow } from "../lib/buildkit.js";
import { gableWedgeX } from "../lib/pieces/roof.js";
import { lampPost } from "../lib/pieces/lamppost.js";   // shared lamp post, the arcade look
const T = { ash: "cdn/texture-ashlar-cream-limestone-two-courses-big-dressed-blocks-thin-pale-mortar-subtle-weathering.png", teal: "cdn/texture-teal-painted-weatherboard-planks.png",
  tile: "cdn/texture-terracotta-roof-tiles-weathered.png", cloth: "cdn/texture-faded-red-cloth-weave.png", flag: "cdn/texture-flagstone-floor-worn.png",
  tar: "cdn/texture-tarred-black-roof-planks.png", oak: "cdn/texture-dark-oak-planks-weathered.png", iron: "cdn/texture-wrought-iron.png", canvas: "cdn/texture-canvas-weathered.png" };
const C = { ash: "oklch(0.94 0.05 78)", ash2: "oklch(0.9 0.055 72)", teal: "oklch(0.93 0.03 195)", tile: "oklch(0.9 0.04 45)", tar: "oklch(0.9 0.01 60)",
  crimson: "oklch(0.45 0.17 25)", gold: "oklch(0.8 0.14 85)", copper: "oklch(0.62 0.09 170)", iron: "oklch(0.3 0.01 250)", oak: "oklch(0.93 0.02 70)",
  shutter: "oklch(0.6 0.12 60)", glass: "oklch(0.85 0.1 70)" };
const WARM = [2.2, 1.25, 0.5], DIM = [0.9, 0.5, 0.2];
function rng(s) { let a = (s | 0) || 1; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
// a quad wound to face n
function Q(c, a, b, d, e, n) { const u = sub(b, a), v = sub(d, a), x = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
  if (x[0] * n[0] + x[1] * n[1] + x[2] * n[2] < 0) c.quad(...e, ...d, ...b, ...a); else c.quad(...a, ...b, ...d, ...e); }
// a round arch opening u0..u1 springing at ys, walled up to yt, through thickness wf..wb; M(u, y, w) maps to local xyz
function ARCH(c, M, u0, u1, wf, wb, ys, yt, seg) { const cx = (u0 + u1) / 2, r = (u1 - u0) / 2;
  const nF = sub(M(0, 0, wf), M(0, 0, wb)), nB = sub(M(0, 0, wb), M(0, 0, wf));
  for (let k = 0; k < seg; k++) { const a0 = Math.PI * (1 - k / seg), a1 = Math.PI * (1 - (k + 1) / seg);
    const x0 = cx + r * Math.cos(a0), y0 = ys + r * Math.sin(a0), x1 = cx + r * Math.cos(a1), y1 = ys + r * Math.sin(a1);
    Q(c, M(x0, y0, wf), M(x1, y1, wf), M(x1, yt, wf), M(x0, yt, wf), nF);
    Q(c, M(x0, y0, wb), M(x1, y1, wb), M(x1, yt, wb), M(x0, yt, wb), nB);
    const xm = (x0 + x1) / 2, ym = (y0 + y1) / 2;
    Q(c, M(x0, y0, wf), M(x1, y1, wf), M(x1, y1, wb), M(x0, y0, wb), sub(M(cx, ys, wf), M(xm, ym, wf))); } }
// the moulded ring proud of the face (archivolt), with a keystone
function RING(c, M, u0, u1, w, ys, seg, out) { const cx = (u0 + u1) / 2, r = (u1 - u0) / 2, R = r + 0.32, n = sub(M(0, 0, w + out), M(0, 0, w));
  for (let k = 0; k < seg; k++) { const a0 = Math.PI * (1 - k / seg), a1 = Math.PI * (1 - (k + 1) / seg);
    const p = (rr, a, ww) => M(cx + rr * Math.cos(a), ys + rr * Math.sin(a), ww);
    Q(c, p(r, a0, w + out), p(r, a1, w + out), p(R, a1, w + out), p(R, a0, w + out), n);
    Q(c, p(R, a0, w), p(R, a1, w), p(R, a1, w + out), p(R, a0, w + out), sub(p(R, (a0 + a1) / 2, w), M(cx, ys, w))); }
  const k0 = M(cx - 0.2, ys + r - 0.05, w), k1 = M(cx + 0.2, ys + R + 0.12, w + out * 1.6);
  BX(c, k0[0], k0[1], k0[2], k1[0], k1[1], k1[2]); }
const GABLE = gableWedgeX;   // shared gable (lib/pieces/roof.js)
// a crimson Annvyr banner on the plane z (facing -z), top y, gold lion's head (a maned star) and swallowtail
function BANNER(c, x, z, yTop, h, lod) { const w = 0.95, y0 = yTop - h;
  flatc(c, C.iron); BX(c, x - 0.6, yTop, z - 0.12, x + 0.6, yTop + 0.06, z - 0.04);
  paint(c, T.cloth, C.crimson); BX(c, x - w / 2, y0, z - 0.06, x + w / 2, yTop, z - 0.03);
  c.tri(x - w / 2, y0, z - 0.045, x, y0, z - 0.045, x - w / 2, y0 - 0.45, z - 0.045); c.tri(x, y0, z - 0.045, x + w / 2, y0, z - 0.045, x + w / 2, y0 - 0.45, z - 0.045);
  c.tri(x, y0, z - 0.045, x - w / 2, y0 - 0.45, z - 0.045, x - w / 2, y0, z - 0.045); c.tri(x + w / 2, y0 - 0.45, z - 0.045, x, y0, z - 0.045, x + w / 2, y0, z - 0.045);
  flatc(c, C.gold); BX(c, x - w / 2, yTop - 0.12, z - 0.07, x + w / 2, yTop - 0.06, z - 0.06); BX(c, x - w / 2, y0 + 0.06, z - 0.07, x + w / 2, y0 + 0.12, z - 0.06);
  if (lod > 2) return;
  const cy = yTop - h * 0.42, zf = z - 0.075, n = 14;
  for (let k = 0; k < n; k++) { const a0 = k / n * Math.PI * 2, a1 = (k + 1) / n * Math.PI * 2, am = (a0 + a1) / 2, r = 0.2, R = 0.33;
    c.tri(x, cy, zf, x + R * Math.cos(am), cy + R * Math.sin(am), zf, x + r * Math.cos(a0), cy + r * Math.sin(a0), zf);
    c.tri(x, cy, zf, x + r * Math.cos(a1), cy + r * Math.sin(a1), zf, x + R * Math.cos(am), cy + R * Math.sin(am), zf); }
  flatc(c, "oklch(0.88 0.12 90)"); BX(c, x - 0.13, cy - 0.17, zf - 0.01, x + 0.13, cy + 0.12, zf - 0.005);
  flatc(c, C.crimson); BX(c, x - 0.09, cy + 0.02, zf - 0.02, x - 0.04, cy + 0.06, zf - 0.01); BX(c, x + 0.04, cy + 0.02, zf - 0.02, x + 0.09, cy + 0.06, zf - 0.01);
  BX(c, x - 0.05, cy - 0.12, zf - 0.02, x + 0.05, cy - 0.08, zf - 0.01);
  flatc(c, C.gold); for (const dx of [-0.16, 0, 0.16]) { c.tri(x + dx - 0.07, cy + 0.36, zf, x + dx + 0.07, cy + 0.36, zf, x + dx, cy + 0.52, zf); } BX(c, x - 0.24, cy + 0.33, zf, x + 0.24, cy + 0.38, zf - 0.005); }
function LANTERN(c, x, y, z) { flatc(c, C.iron); BX(c, x - 0.015, y, z - 0.015, x + 0.015, y + 0.55, z + 0.015);
  BX(c, x - 0.17, y - 0.04, z - 0.17, x + 0.17, y, z + 0.17); BX(c, x - 0.15, y - 0.5, z - 0.15, x + 0.15, y - 0.44, z + 0.15);
  for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) BX(c, x + a * 0.15 - 0.015, y - 0.44, z + b * 0.15 - 0.015, x + a * 0.15 + 0.015, y - 0.04, z + b * 0.15 + 0.015);
  glow(c, "oklch(0.9 0.12 75)", WARM); BX(c, x - 0.12, y - 0.42, z - 0.12, x + 0.12, y - 0.06, z + 0.12); c.emissive(null); }

const K = {
  range(c, p, lod) {
    const L = p.L ?? 24, D = p.D ?? 5, H1 = p.H1 ?? 5, H2 = p.H2 ?? 3.2, rnd = rng(p.seed ?? 7);
    const nb = Math.max(2, Math.round(L / (p.bay ?? 3.8))), B = L / nb, cw = 0.72, r = (B - cw) / 2, ys = H1 - r - 0.55;
    const zf = -D, zb = -D + 0.6, yb = H1 + 0.4, yt = yb + H2, zw = -D - 0.35, zbk = -0.25, x0 = -L / 2, x1 = L / 2;
    const ends = p.ends ?? "both", endW = ends === "both" || ends === "w", endE = ends === "both" || ends === "e";
    const seg = lod <= 1 ? 12 : lod <= 3 ? 6 : 3;
    const MF = (u, y, w) => [u, y, w];
    // walkway paving on a foundation course that meets lower ground
    paint(c, T.ash, C.ash2); BX(c, x0 - 0.2, -1.4, zw - 0.1, x1 + 0.2, 0.0, 0);
    paint(c, T.flag, "oklch(0.88 0.03 70)"); BX(c, x0 - 0.2, 0, zf - 0.2, x1 + 0.2, 0.15, 0);
    if (lod >= 5) { paint(c, T.ash, C.ash); BX(c, x0, 0.15, zf, x1, yt, zbk); paint(c, T.tile, C.tile); ROOF(c, x0 - 0.5, x1 + 0.5, zw - 0.7, zbk + 0.4, yt, yt + 2.8, 0.15); return; }
    // columns
    for (let i = 0; i <= nb; i++) { const x = x0 + i * B, zc = (zf + zb) / 2, endCol = (i === 0 && endW) || (i === nb && endE);
      paint(c, T.ash, C.ash2); BX(c, x - 0.42, 0.15, zc - 0.42, x + 0.42, 0.55, zc + 0.42);
      paint(c, T.ash, C.ash);
      if (endCol) BX(c, x - 0.45, 0.55, zf, x + 0.45, ys, zb); // square end piers
      else if (lod <= 2) LA(c, x, 0.55, zc, [[0.33, 0], [0.33, 0.12], [0.26, 0.26], [0.24, ys - 0.85], [0.27, ys - 0.75], [0.34, ys - 0.62], [0.36, ys - 0.55]], 14, true);
      else BX(c, x - 0.27, 0.55, zc - 0.27, x + 0.27, ys - 0.55, zc + 0.27);
      paint(c, T.ash, C.ash2); BX(c, x - 0.44, ys - 0.12, zf - 0.04, x + 0.44, ys, zb + 0.04);
      paint(c, T.ash, C.ash); BX(c, x - cw / 2, ys, zf, x + cw / 2, H1, zb);
      // back pilaster carrying the upper storey
      if (lod <= 3) { paint(c, T.ash, C.ash2); BX(c, x - 0.3, 0.15, zbk - 0.5, x + 0.3, H1, zbk); } }
    // arches across the front
    paint(c, T.ash, C.ash);
    for (let i = 0; i < nb; i++) { const a = x0 + i * B + cw / 2, b = x0 + (i + 1) * B - cw / 2;
      ARCH(c, MF, a, b, zf, zb, ys, H1, seg);
      if (lod <= 2) { paint(c, T.ash, C.ash2); RING(c, MF, a, b, zf, ys, seg, -0.06); paint(c, T.ash, C.ash); } }
    // side arches at open ends: walk in from the street
    for (const [on, x] of [[endW, x0], [endE, x1]]) if (on) { const MS = (u, y, w) => [x + w, y, u];
      paint(c, T.ash, C.ash); ARCH(c, MS, zb + 0.15, zbk - 0.5, -0.45, 0.45, Math.max(ys, H1 - (zbk - 0.5 - zb - 0.15) / 2 - 0.5), H1, seg); BX(c, x - 0.45, 0.15, zbk - 0.5, x + 0.45, H1, zbk); }
    // cornice over the arches and the floor of the upper storey; copper band
    paint(c, T.ash, C.ash2); BX(c, x0 - 0.3, H1, zw - 0.15, x1 + 0.3, yb, zbk);
    flatc(c, C.copper); BX(c, x0 - 0.32, yb - 0.12, zw - 0.2, x1 + 0.32, yb - 0.02, zw - 0.12);
    // ceiling of the walkway: oak beams on the cornice
    if (lod <= 2) { paint(c, T.oak, C.oak); BX(c, x0, H1 - 0.04, zb, x1, H1, zbk - 0.5);
      for (let i = 0; i <= nb * 2; i++) { const x = x0 + i * B / 2; BX(c, x - 0.11, H1 - 0.3, zb, x + 0.11, H1 - 0.04, zbk - 0.5); }
      for (let i = 0; i < nb; i++) LANTERN(c, x0 + (i + 0.5) * B, H1 - 0.3, (zb + zbk - 0.5) / 2); }
    // upper storey: jettied teal board wall with windows between tar posts
    const ws = 1.0, wh = 1.35, sill = yb + 0.85;
    for (let i = 0; i < nb; i++) { const xa = x0 + i * B, xbb = xa + B, cx = (xa + xbb) / 2;
      paint(c, T.teal, C.teal);
      BX(c, xa, yb, zw, xbb, sill, zw + 0.2); BX(c, xa, sill + wh, zw, xbb, yt, zw + 0.2);
      BX(c, xa, sill, zw, cx - ws / 2, sill + wh, zw + 0.2); BX(c, cx + ws / 2, sill, zw, xbb, sill + wh, zw + 0.2);
      const lit = rnd() < 0.72; if (lit) glow(c, C.glass, rnd() < 0.3 ? DIM : WARM); else flatc(c, "oklch(0.25 0.03 230)");
      BX(c, cx - ws / 2, sill, zw + 0.12, cx + ws / 2, sill + wh, zw + 0.16); c.emissive(null);
      if (lod <= 2) { paint(c, T.tar, C.tar); BX(c, cx - ws / 2 - 0.1, sill - 0.1, zw - 0.08, cx + ws / 2 + 0.1, sill, zw + 0.05);
        BX(c, cx - ws / 2 - 0.08, sill + wh, zw - 0.06, cx + ws / 2 + 0.08, sill + wh + 0.1, zw + 0.05);
        BX(c, cx - 0.03, sill, zw + 0.08, cx + 0.03, sill + wh, zw + 0.12); BX(c, cx - ws / 2, sill + wh * 0.5 - 0.03, zw + 0.08, cx + ws / 2, sill + wh * 0.5 + 0.03, zw + 0.12);
        flatc(c, C.shutter); for (const s of [-1, 1]) BX(c, cx + s * (ws / 2 + 0.06), sill, zw - 0.06, cx + s * (ws / 2 + 0.06 + ws / 2), sill + wh, zw - 0.02);
        if (rnd() < 0.5) { paint(c, T.oak, C.oak); BX(c, cx - ws / 2 - 0.05, sill - 0.32, zw - 0.32, cx + ws / 2 + 0.05, sill - 0.1, zw - 0.02);
          for (let f = 0; f < 5; f++) { flatc(c, ["oklch(0.6 0.2 25)", "oklch(0.85 0.15 95)", "oklch(0.7 0.15 330)", "oklch(0.55 0.13 140)"][Math.floor(rnd() * 4)]); const fx = cx - ws / 2 + 0.12 + f * (ws - 0.14) / 4;
            BX(c, fx - 0.08, sill - 0.12, zw - 0.27, fx + 0.08, sill + 0.06, zw - 0.08); } } } }
    if (lod <= 2) { paint(c, T.tar, C.tar); for (let i = 0; i <= nb; i++) { const x = x0 + i * B; BX(c, x - 0.12, yb, zw - 0.06, x + 0.12, yt, zw + 0.02); }
      BX(c, x0, yt - 0.18, zw - 0.06, x1, yt, zw + 0.02); BX(c, x0, yb, zw - 0.06, x1, yb + 0.16, zw + 0.02);
      paint(c, T.ash, C.ash2); for (let i = 0; i <= nb; i++) { const x = x0 + i * B; HX(c, [[x - 0.2, H1 - 0.5, zf], [x + 0.2, H1 - 0.5, zf], [x + 0.2, H1 - 0.5, zf + 0.1], [x - 0.2, H1 - 0.5, zf + 0.1], [x - 0.2, H1, zw - 0.15], [x + 0.2, H1, zw - 0.15], [x + 0.2, H1, zf + 0.1], [x - 0.2, H1, zf + 0.1]]); } }
    paint(c, T.teal, C.teal); BX(c, x0, yb, zbk - 0.2, x1, yt, zbk);
    for (const x of [x0, x1]) BX(c, x - 0.1, yb, zw, x + 0.1, yt, zbk);
    // roof: terracotta, gables, ridge, a chimney
    const rise = (zbk + 0.4 - (zw - 0.7)) / 2 * (p.pitch ?? 0.95);
    paint(c, T.teal, C.teal); for (const x of [x0, x1]) GABLE(c, x, zw, zbk, yt, yt + rise * 0.86, 0.1);
    paint(c, T.tile, C.tile); ROOF(c, x0 - 0.5, x1 + 0.5, zw - 0.7, zbk + 0.4, yt, yt + rise, 0.16);
    if (lod <= 3) { paint(c, T.tile, "oklch(0.8 0.06 40)"); const zm = (zw - 0.7 + zbk + 0.4) / 2; RB(c, 0, yt + rise + 0.2, zm, L + 1.0, 0.22, 0.34);
      paint(c, T.ash, C.ash2); const chx = x0 + B * (1 + Math.floor(rnd() * (nb - 1))); BX(c, chx - 0.45, yt, zm + 0.2, chx + 0.45, yt + rise + 1.4, zm + 1.0);
      flatc(c, "oklch(0.55 0.1 40)"); BX(c, chx - 0.55, yt + rise + 1.4, zm + 0.1, chx + 0.55, yt + rise + 1.55, zm + 1.1); }
    // banners on every third pier and on the ends
    for (let i = 0; i <= nb; i++) if (i === 0 || i === nb || i % 3 === 0) BANNER(c, x0 + i * B, zw, yt - 0.25, 2.3, lod);
  },
  stall(c, p, lod) { const rnd = rng(p.seed ?? 3), hue = p.hue ?? 25, W = 3, Dp = 2;
    paint(c, T.oak, C.oak);
    for (const [x, z] of [[-W / 2, -Dp / 2], [W / 2, -Dp / 2], [-W / 2, Dp / 2], [W / 2, Dp / 2]]) BX(c, x - 0.07, 0, z - 0.07, x + 0.07, z < 0 ? 2.5 : 2.9, z + 0.07);
    BX(c, -W / 2 + 0.05, 0.85, -Dp / 2, W / 2 - 0.05, 0.95, -Dp / 2 + 0.8); BX(c, -W / 2 + 0.05, 0, -Dp / 2 + 0.05, W / 2 - 0.05, 0.85, -Dp / 2 + 0.12);
    // striped awning sloping to the front
    const n = lod <= 2 ? 8 : 2; for (let i = 0; i < n; i++) { const xa = -W / 2 - 0.2 + i * (W + 0.4) / n, xb = xa + (W + 0.4) / n;
      paint(c, T.canvas, i % 2 ? "oklch(0.95 0.02 90)" : `oklch(0.6 0.16 ${hue})`);
      HX(c, [[xa, 2.4, -Dp / 2 - 0.45], [xb, 2.4, -Dp / 2 - 0.45], [xb, 2.95, Dp / 2 + 0.1], [xa, 2.95, Dp / 2 + 0.1], [xa, 2.45, -Dp / 2 - 0.45], [xb, 2.45, -Dp / 2 - 0.45], [xb, 3.0, Dp / 2 + 0.1], [xa, 3.0, Dp / 2 + 0.1]]);
      if (lod <= 2) BX(c, xa, 2.12, -Dp / 2 - 0.47, xb, 2.4, -Dp / 2 - 0.43); }
    if (lod > 3) return;
    const goods = p.goods ?? "fruit", pal = { fruit: ["oklch(0.6 0.2 30)", "oklch(0.8 0.16 90)", "oklch(0.6 0.15 140)"], cloth: ["oklch(0.5 0.15 260)", "oklch(0.55 0.17 20)", "oklch(0.8 0.1 90)"],
      pots: ["oklch(0.6 0.12 45)", "oklch(0.5 0.08 60)", "oklch(0.7 0.06 80)"], bread: ["oklch(0.72 0.1 70)", "oklch(0.6 0.1 55)", "oklch(0.82 0.07 85)"], flowers: ["oklch(0.65 0.2 0)", "oklch(0.85 0.15 95)", "oklch(0.6 0.18 300)"] }[goods] ?? ["oklch(0.6 0.1 60)"];
    for (let i = 0; i < 4; i++) { const x = -W / 2 + 0.45 + i * 0.7; paint(c, T.oak, "oklch(0.75 0.04 70)"); BX(c, x - 0.3, 0.95, -Dp / 2 + 0.1, x + 0.3, 1.1, -Dp / 2 + 0.7);
      flatc(c, pal[i % pal.length]);
      if (goods === "cloth") BX(c, x - 0.26, 1.1, -Dp / 2 + 0.15, x + 0.26, 1.3, -Dp / 2 + 0.65);
      else if (goods === "pots") LA(c, x, 1.1, -Dp / 2 + 0.4, [[0.1, 0], [0.2, 0.12], [0.16, 0.3], [0.08, 0.38], [0.1, 0.42]], 10, true);
      else for (let k = 0; k < (lod <= 1 ? 6 : 2); k++) { const r = goods === "bread" ? 0.11 : 0.07; LA(c, x - 0.18 + (k % 3) * 0.18, 1.1, -Dp / 2 + 0.28 + Math.floor(k / 3) * 0.24, [[0.001, 0], [r, r * 0.4], [r, r], [0.001, r * 1.5]], 7, false); } }
    paint(c, T.oak, C.oak); for (let i = 0; i < 2; i++) BX(c, -W / 2 + 0.2 + i * 1.6, 0, Dp / 2 - 0.7, -W / 2 + 0.8 + i * 1.6 + rnd() * 0.3, 0.55, Dp / 2 - 0.1); },
  cart(c, p, lod) { paint(c, T.oak, C.oak); BX(c, -0.9, 0.55, -0.6, 0.9, 0.65, 0.6);
    for (const z of [-0.6, 0.6]) BX(c, -0.9, 0.65, z - 0.04, 0.9, 1.0, z + 0.04); for (const x of [-0.9, 0.9]) BX(c, x - 0.04, 0.65, -0.6, x + 0.04, 1.0, 0.6);
    BX(c, 0.9, 0.6, -0.35, 2.0, 0.66, -0.29); BX(c, 0.9, 0.6, 0.29, 2.0, 0.66, 0.35); BX(c, -0.8, 0, -0.05, -0.7, 0.55, 0.05);
    paint(c, T.oak, "oklch(0.6 0.05 60)"); for (const z of [-0.68, 0.68]) TORUS(c, 0.2, 0.42, z, 0.4, 0.05, lod <= 2 ? 14 : 8, 4, "z");
    if (lod > 3) return; const rnd = rng(p.seed ?? 5), pal = ["oklch(0.62 0.21 15)", "oklch(0.88 0.16 95)", "oklch(0.65 0.18 320)", "oklch(0.95 0.02 90)", "oklch(0.6 0.2 40)"];
    flatc(c, "oklch(0.45 0.1 140)"); BX(c, -0.85, 1.0, -0.55, 0.85, 1.1, 0.55);
    for (let i = 0; i < (lod <= 1 ? 26 : 10); i++) { flatc(c, pal[Math.floor(rnd() * pal.length)]); const x = -0.75 + rnd() * 1.5, z = -0.45 + rnd() * 0.9, y = 1.1 + rnd() * 0.15;
      LA(c, x, y, z, [[0.001, 0], [0.09, 0.05], [0.07, 0.11], [0.001, 0.13]], 6, false); } },
  crates(c, p, lod) { const rnd = rng(p.seed ?? 9); paint(c, T.oak, "oklch(0.85 0.04 70)");
    BX(c, -0.9, 0, -0.45, 0, 0.8, 0.35); BX(c, 0.05, 0, -0.4, 0.85, 0.7, 0.3); BX(c, -0.6, 0.8, -0.35, 0.1, 1.45, 0.3);
    if (lod <= 2) { paint(c, T.tar, C.tar); for (const [a, b, h] of [[-0.9, 0, 0.8], [0.05, 0.85, 0.7]]) { BX(c, a - 0.01, h * 0.45, -0.46, b + 0.01, h * 0.55, -0.44); } }
    paint(c, T.oak, C.oak); LA(c, 1.4, 0, 0.1 + rnd() * 0.2, [[0.3, 0], [0.36, 0.45], [0.3, 0.9]], 12, true);
    flatc(c, C.iron); TORUS(c, 1.4, 0.2, 0.2, 0.32, 0.02, 12, 3, "y"); TORUS(c, 1.4, 0.7, 0.2, 0.32, 0.02, 12, 3, "y"); },
  lamp(c, p, lod) { lampPost(c, LK, "arcade", { iron: C.iron, heads: lampHeads }); }
};
export function geometry(c) { const p = c.params ?? {}; (K[p.kind] ?? K.range)(c, p, c.lod ?? 1); c.albedo(null); c.color(null); c.emissive(null); }
export function collider(c) { const p = c.params ?? {}, k = p.kind ?? "range";
  const box = (x0, y0, z0, x1, y1, z1) => ({ kind: "box", width: Math.abs(x1 - x0), height: Math.abs(y1 - y0), depth: Math.abs(z1 - z0), center: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2] });
  if (k === "stall") return [box(-1.5, 0, -1, 1.5, 1.0, -0.2), box(-1.6, 2.4, -1.45, 1.6, 3.0, 1.1)];
  if (k === "cart") return [box(-0.95, 0, -0.75, 1.0, 1.2, 0.75)];
  if (k === "crates") return [box(-0.9, 0, -0.45, 1.75, 1.45, 0.5)];
  if (k === "lamp") return [box(-0.12, 0, -0.12, 0.12, 3.1, 0.12)];
  const L = p.L ?? 24, D = p.D ?? 5, H1 = p.H1 ?? 5, H2 = p.H2 ?? 3.2, nb = Math.max(2, Math.round(L / (p.bay ?? 3.8))), B = L / nb, r = (B - 0.72) / 2, ys = H1 - r - 0.55;
  const zf = -D, zb = -D + 0.6, x0 = -L / 2, x1 = L / 2, yb = H1 + 0.4, yt = yb + H2, ends = p.ends ?? "both", out = [];
  out.push(box(x0 - 0.2, -1.4, zf - 0.2, x1 + 0.2, 0.15, 0));
  for (let i = 0; i <= nb; i++) { const x = x0 + i * B; out.push(box(x - 0.42, 0.15, zf, x + 0.42, H1, zb)); }
  out.push(box(x0, ys + r, zf, x1, H1, zb));
  for (const [on, x] of [[ends === "both" || ends === "w", x0], [ends === "both" || ends === "e", x1]]) if (on) out.push(box(x - 0.45, 0.15, -0.75, x + 0.45, H1, -0.25));
  out.push(box(x0 - 0.3, H1, -D - 0.5, x1 + 0.3, yt, -0.25));
  out.push(box(x0, yt, -D - 0.5, x1, yt + 2.2, -0.25));
  return out; }

const LK = { paint, flatc, glow, BX, LA };
export const lampHeads = { lantern: LANTERN };
