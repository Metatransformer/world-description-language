// SUNSCAR PROPS, one generator by params.kind: "stall" (a market stall: plank counter, four poles, a
// gabled striped awning, pots, crates, hanging goods; params.awn red|ochre, goods pots|cloth|fruit),
// "wagon" (a covered caravan wagon), "jetty" (timber jetty, params.len seaward, params.land landward,
// deck at params.deck; origin at the stand on the jetty, ground = sea level 0), "boat" (a single-mast
// fishing boat, bow -z), "shed" (a driftwood fisherman's shed with a closed door, front -z),
// "lamppost" (an iron-armed lantern post). Front is -z.
import { TX, TINT, paint, flatc, glow, HX, BX, RB, LA, CY, CB, AWN, POT, CRATE, quad, tri } from "../lib/desert-kit.js";
import { lantern_sunscarProp } from "../lib/pieces/lantern.js";   // shared lantern piece, drawn in this building's palette
const WOOD = "oklch(0.9 0.025 65)", DRIFT = "oklch(0.95 0.015 70)";
function wheel(c, x, y, z, r, D) {
  paint(c, TX.oak, WOOD); const n = D <= 2 ? 14 : 8;
  for (let i = 0; i < n; i++) { const a0 = i / n * 6.283, a1 = (i + 1) / n * 6.283, P = (a, rr, dx) => [x + dx, y + Math.sin(a) * rr, z + Math.cos(a) * rr];
    HX(c, [P(a0, r - 0.09, -0.06), P(a1, r - 0.09, -0.06), P(a1, r, -0.06), P(a0, r, -0.06), P(a0, r - 0.09, 0.06), P(a1, r - 0.09, 0.06), P(a1, r, 0.06), P(a0, r, 0.06)].map((q, k) => q)); }
  if (D <= 2) { paint(c, TX.iron, TINT.iron); LA(c, x - 0.07, y, z, [[r + 0.012, 0], [r + 0.012, 0.14]], n, false, "x");
    paint(c, TX.oak, WOOD); LA(c, x - 0.1, y, z, [[0.1, 0], [0.12, 0.2]], 8, true, "x");
    for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283; RB(c, x, y + Math.sin(a) * r / 2, z + Math.cos(a) * r / 2, 0.05, 0.05, r - 0.1, 0, -a * 180 / Math.PI + 90 - 90); } }
}
const K = {
  stall(c, p, D) {
    const A = p.awn === "ochre" ? TX.ochre : TX.red, B = A === TX.red ? TX.ochre : TX.red, w = 3.2, d = 2.0;
    paint(c, TX.oak, WOOD); BX(c, -w / 2, 0, -d / 2, w / 2, 0.95, -d / 2 + 0.5); paint(c, TX.oak, "oklch(0.8 0.03 60)"); BX(c, -w / 2 - 0.05, 0.95, -d / 2 - 0.05, w / 2 + 0.05, 1.02, -d / 2 + 0.55);
    BX(c, -w / 2, 0, d / 2 - 0.45, w / 2, 0.7, d / 2);
    paint(c, TX.oak, WOOD); for (const x of [-w / 2, w / 2]) for (const z of [-d / 2, d / 2]) CY(c, x, 0, z, 0.06, z < 0 ? 2.25 : 2.6, D <= 2 ? 6 : 4);
    if (D <= 3) { // gabled awning: two cloth pitches, striped, hanging over the front
      const n = D <= 2 ? 7 : 2, y0 = 2.25, yr = 2.85, zr = 0.1;
      for (let i = 0; i < n; i++) { const xa = -w / 2 - 0.25 + (w + 0.5) * i / n, xb = -w / 2 - 0.25 + (w + 0.5) * (i + 1) / n; paint(c, D <= 2 && i % 2 ? B : A, TINT.cloth);
        quad(c, [xa, y0 - 0.1, -d / 2 - 0.45], [xb, y0 - 0.1, -d / 2 - 0.45], [xb, yr, zr], [xa, yr, zr]); quad(c, [xb, yr, zr], [xb, y0 + 0.2, d / 2 + 0.25], [xa, y0 + 0.2, d / 2 + 0.25], [xa, yr, zr]);
        quad(c, [xb, y0 - 0.1, -d / 2 - 0.45], [xa, y0 - 0.1, -d / 2 - 0.45], [xa, yr, zr], [xb, yr, zr]); quad(c, [xa, yr, zr], [xa, y0 + 0.2, d / 2 + 0.25], [xb, y0 + 0.2, d / 2 + 0.25], [xb, yr, zr]);
        if (D <= 2) { tri(c, [xa, y0 - 0.1, -d / 2 - 0.46], [xb, y0 - 0.1, -d / 2 - 0.46], [(xa + xb) / 2, y0 - 0.38, -d / 2 - 0.47]); tri(c, [xb, y0 - 0.1, -d / 2 - 0.46], [xa, y0 - 0.1, -d / 2 - 0.46], [(xa + xb) / 2, y0 - 0.38, -d / 2 - 0.47]); } }
      paint(c, TX.oak, WOOD); LA(c, -w / 2 - 0.3, yr, zr, [[0.05, 0], [0.05, w + 0.6]], 6, true, "x"); }
    else { paint(c, A, TINT.cloth); BX(c, -w / 2 - 0.2, 2.25, -d / 2 - 0.4, w / 2 + 0.2, 2.8, d / 2 + 0.2); }
    // wares
    const g = p.goods ?? "pots";
    if (g === "pots") { for (let i = 0; i < 5; i++) POT(c, -1.25 + i * 0.6, 1.02, -d / 2 + 0.27, 0.32 + (i % 2) * 0.12, D, i % 3 ? "oklch(0.93 0.03 50)" : "oklch(0.8 0.04 60)");
      POT(c, -1.9, 0, -d / 2 - 0.3, 0.75, D); POT(c, -2.35, 0, -d / 2 + 0.1, 0.55, D, "oklch(0.85 0.04 55)"); }
    if (g === "cloth") { const cols = [TX.red, TX.ochre, TX.canvas, TX.red]; for (let i = 0; i < 4; i++) { paint(c, cols[i], i === 2 ? "oklch(0.75 0.06 215)" : TINT.cloth); BX(c, -1.4 + i * 0.7, 1.02, -d / 2 + 0.05, -0.85 + i * 0.7, 1.12 + (i % 2) * 0.1, -d / 2 + 0.48); }
      if (D <= 2) for (let i = 0; i < 3; i++) { paint(c, cols[i], TINT.cloth); quad(c, [-1.2 + i * 1.1, 2.2, -d / 2 - 0.02], [-0.6 + i * 1.1, 2.2, -d / 2 - 0.02], [-0.6 + i * 1.1, 1.3, -d / 2 - 0.02], [-1.2 + i * 1.1, 1.3, -d / 2 - 0.02]); quad(c, [-0.6 + i * 1.1, 2.2, -d / 2 - 0.02], [-1.2 + i * 1.1, 2.2, -d / 2 - 0.02], [-1.2 + i * 1.1, 1.3, -d / 2 - 0.02], [-0.6 + i * 1.1, 1.3, -d / 2 - 0.02]); }
      CRATE(c, 2.1, 0, -0.5, 0.6, D); }
    if (g === "fruit") { for (let i = 0; i < 4; i++) { paint(c, TX.canvas, WOOD); LA(c, -1.2 + i * 0.8, 1.02, -d / 2 + 0.27, [[0.18, 0], [0.3, 0.18], [0.0, 0.18]], 10, false);
      flatc(c, ["oklch(0.55 0.15 45)", "oklch(0.72 0.17 70)", "oklch(0.5 0.14 25)", "oklch(0.65 0.14 120)"][i]); LA(c, -1.2 + i * 0.8, 1.15, -d / 2 + 0.27, [[0.27, 0], [0.2, 0.12], [0, 0.18]], 10, false); }
      if (D <= 2) { flatc(c, "oklch(0.6 0.12 70)"); for (let i = 0; i < 3; i++) LA(c, -1 + i, 1.65, -d / 2 + 0.05, [[0, 0], [0.14, 0.12], [0.1, 0.38], [0, 0.42]], 7, false); }
      CRATE(c, -2.1, 0, -0.4, 0.65, D); CRATE(c, -2.1, 0.65, -0.4, 0.5, D); }
    CRATE(c, 1.0, 0, d / 2 + 0.45, 0.7, D); CRATE(c, 1.75, 0, d / 2 + 0.5, 0.55, D);
  },
  wagon(c, p, D) { // bed 2.0 x 4.4, wheels 1.1 m, canvas tilt on hoops, shafts forward (-z)
    const hw = 1.0, L = 2.2, yb = 0.95;
    paint(c, TX.oak, WOOD); BX(c, -hw, yb, -L, hw, yb + 0.12, L);
    for (const s of [-1, 1]) BX(c, s * hw - (s > 0 ? 0.08 : 0), yb + 0.12, -L, s * hw + (s < 0 ? 0.08 : 0), yb + 0.62, L);
    BX(c, -hw, yb + 0.12, L - 0.08, hw, yb + 0.62, L); BX(c, -hw, yb + 0.12, -L, hw, yb + 0.5, -L + 0.08);
    BX(c, -hw + 0.1, yb + 0.12, -L - 0.5, hw - 0.1, yb + 0.55, -L + 0.2); // driver's box
    paint(c, TX.oak, "oklch(0.8 0.03 60)"); BX(c, -0.8, yb - 0.25, -L + 0.4, 0.8, yb, -L + 0.6); BX(c, -0.8, yb - 0.25, L - 0.7, 0.8, yb, L - 0.5);
    for (const s of [-1, 1]) RB(c, s * 0.55, yb - 0.25, -L - 1.6, 0.09, 0.09, 2.6, 0, -5, 0);
    for (const s of [-1, 1]) { wheel(c, s * 1.12, 0.62, -L + 0.5, 0.62, D); wheel(c, s * 1.12, 0.62, L - 0.6, 0.62, D); }
    // canvas tilt: a half-cylinder on hoops, the back end open-puckered
    const n = D <= 2 ? 12 : 6, y0 = yb + 0.55, R = hw + 0.05, zs = D <= 2 ? 6 : 2;
    for (let j = 0; j < zs; j++) { const za = -L + 0.15 + (2 * L - 0.3) * j / zs, zb = -L + 0.15 + (2 * L - 0.3) * (j + 1) / zs; paint(c, TX.canvas, "oklch(0.97 0.02 80)");
      for (let i = 0; i < n; i++) { const a0 = i / n * Math.PI, a1 = (i + 1) / n * Math.PI, P = (a, z, s = 1) => [Math.cos(a) * R * s, y0 + Math.sin(a) * R * 1.25 * s + 0.0, z];
        quad(c, P(a0, za), P(a1, za), P(a1, zb), P(a0, zb)); quad(c, P(a1, za, 0.995), P(a0, za, 0.995), P(a0, zb, 0.995), P(a1, zb, 0.995)); } }
    if (D <= 2) { paint(c, TX.oak, "oklch(0.75 0.03 55)"); for (let j = 0; j <= zs; j += 2) { const z = -L + 0.15 + (2 * L - 0.3) * j / zs;
        for (let i = 0; i < n; i++) { const a0 = i / n * Math.PI, a1 = (i + 1) / n * Math.PI, P = (a, s) => [Math.cos(a) * R * s, y0 + Math.sin(a) * R * 1.25 * s, z]; HX(c, [P(a0, 1.0), P(a1, 1.0), P(a1, 1.03), P(a0, 1.03), [...P(a0, 1.0).slice(0, 2), z + 0.07], [...P(a1, 1.0).slice(0, 2), z + 0.07], [...P(a1, 1.03).slice(0, 2), z + 0.07], [...P(a0, 1.03).slice(0, 2), z + 0.07]]); } }
      paint(c, TX.red, TINT.cloth); for (const s of [-1, 1]) BX(c, s * (R + 0.01) - 0.01, y0 + 0.05, -1.6, s * (R + 0.01) + 0.01, y0 + 0.3, 1.6);
      lantern(c, 0.7, yb + 1.7, -L - 0.25, D); paint(c, TX.iron, TINT.iron); BX(c, 0.66, yb + 0.5, -L - 0.29, 0.74, yb + 1.75, -L - 0.21); BX(c, 0.66, yb + 1.7, -L - 0.29, 0.74, yb + 1.75, -L - 0.2);
      POT(c, -0.5, yb + 0.12, L - 0.5, 0.6, D); CRATE(c, 0.4, yb + 0.12, L - 0.55, 0.6, D); paint(c, TX.canvas, "oklch(0.85 0.04 70)"); LA(c, -0.6, yb + 0.12, L - 0.5, [[0, 0], [0.3, 0.05], [0.33, 0.35], [0.2, 0.55], [0, 0.6]], 8, false); }
  },
  jetty(c, p, D) { // deck from z = -land (shore) to z = +len (sea), x ±1.4, posts every 3 m
    const land = p.land ?? 25, len = p.len ?? 32, dk = p.deck ?? 1.3, hw = 1.4;
    paint(c, TX.drift, DRIFT);
    if (D <= 2) { for (let z = -land; z < len; z += 0.32) { const j = (Math.round(z / 0.32) * 7919) % 13 / 13; RB(c, (j - 0.5) * 0.06, dk - 0.06, z + 0.15, 2 * hw + (j - 0.5) * 0.12, 0.08, 0.29, (j - 0.5) * 1.2, 0, 0); } }
    else BX(c, -hw, dk - 0.12, -land, hw, dk, len);
    paint(c, TX.oak, "oklch(0.75 0.03 60)"); for (const s of [-1, 1]) BX(c, s * hw - 0.1, dk - 0.42, -land, s * hw + 0.1, dk - 0.1, len);
    const ps = D <= 2 ? 3 : 6;
    for (let z = -land + 0.5; z <= len; z += ps) for (const s of [-1, 1]) { paint(c, TX.oak, "oklch(0.7 0.03 55)"); CY(c, s * (hw + 0.12), -9, z, 0.16, 9 + dk + (z > len - 4 || Math.abs(z) < 0.6 ? 1.0 : 0.15), D <= 2 ? 8 : 5);
      if (D <= 2) { flatc(c, "oklch(0.42 0.05 150)"); LA(c, s * (hw + 0.12), -0.35, z, [[0.175, 0], [0.175, 0.45]], 8, false); } } // weed line at the tide
    if (D <= 2) { paint(c, TX.oak, "oklch(0.7 0.03 55)"); for (const s of [-1, 1]) for (let z = len - 12; z <= len; z += 0.8) { if (z > len - 1) break; }
      paint(c, TX.drift, DRIFT); for (const s of [-1, 1]) BX(c, s * hw - 0.06, dk + 0.85, len - 10, s * hw + 0.06, dk + 0.97, len + 0.1); // rail at the head
      for (const s of [-1, 1]) for (let z = len - 10; z <= len; z += 2.5) CY(c, s * hw, dk, z, 0.06, 0.95, 6);
      // shore steps down to the sand
      for (let i = 0; i < 4; i++) BX(c, -hw, dk - 0.25 * (i + 1) - 0.08, -land - 0.32 * (i + 1), hw, dk - 0.25 * (i + 1), -land - 0.32 * i);
      // bollards, coiled rope, a net pile and a crate at the head
      for (const s of [-1, 1]) { paint(c, TX.iron, TINT.iron); LA(c, s * (hw - 0.3), dk, len - 1.4, [[0.14, 0], [0.11, 0.3], [0.18, 0.38], [0, 0.42]], 8, true); }
      paint(c, TX.canvas, "oklch(0.8 0.05 75)"); LA(c, 0.7, dk, len - 3, [[0.12, 0], [0.38, 0], [0.38, 0.12], [0.12, 0.12], [0.12, 0]], 12, false);
      flatc(c, "oklch(0.45 0.04 120)"); LA(c, -0.8, dk, 3, [[0.55, 0], [0.45, 0.2], [0, 0.28]], 10, false); CRATE(c, -0.85, dk, len - 4.5, 0.55, D); POT(c, 0.9, dk, 2.5, 0.6, D); }
  },
  boat(c, p, D) { // single-mast dhow-ish fishing boat, 9 m, bow -z, waterline y 0
    const L = 4.6, n = D <= 2 ? 12 : 6, sec = (t) => { const z = -L + 2 * L * t, w = 1.35 * Math.pow(Math.sin(Math.PI * Math.min(1, 0.08 + t * 0.95)), 0.7), sh = 1.0 + 0.5 * Math.pow(Math.abs(t - 0.45) * 2, 2) + (t < 0.15 ? (0.15 - t) * 3 : 0); return { z, w, sh, k: -0.65 }; };
    const pts = (s, side) => { const r = []; for (let i = 0; i <= 4; i++) { const u = i / 4; r.push([side * s.w * Math.sin(u * Math.PI / 2), s.k + (s.sh - s.k) * (1 - Math.cos(u * Math.PI / 2)), s.z]); } return r; };
    for (const side of [-1, 1]) for (let j = 0; j < n; j++) { const A = pts(sec(j / n), side), B = pts(sec((j + 1) / n), side);
      for (let i = 0; i < 4; i++) { paint(c, TX.drift, i === 3 ? "oklch(0.6 0.08 215)" : i < 2 ? "oklch(0.5 0.05 40)" : DRIFT); if (side > 0) { quad(c, A[i], B[i], B[i + 1], A[i + 1]); quad(c, A[i + 1], B[i + 1], B[i], A[i]); } else { quad(c, A[i + 1], B[i + 1], B[i], A[i]); quad(c, A[i], B[i], B[i + 1], A[i + 1]); } } }
    paint(c, TX.drift, "oklch(0.85 0.02 65)"); for (let j = 0; j < n; j++) { const a = sec(j / n), b = sec((j + 1) / n), y = 0.15; quad(c, [-a.w * 0.9, y, a.z], [a.w * 0.9, y, a.z], [b.w * 0.9, y, b.z], [-b.w * 0.9, y, b.z]); }
    paint(c, TX.oak, WOOD); BX(c, -1.2, 0.5, -0.6, 1.2, 0.62, -0.35); BX(c, -1.25, 0.5, 2.0, 1.25, 0.62, 2.25); BX(c, -0.06, 0.6, L - 0.2, 0.06, 1.7, L + 0.25); // thwarts, sternpost
    // mast, yard and a furled lateen sail, a reefed bundle along the yard
    paint(c, TX.oak, WOOD); CY(c, 0, 0.15, -0.9, 0.11, 7.5, D <= 2 ? 8 : 5);
    RB(c, 0, 6.4, -0.9, 0.09, 0.09, 8.5, 0, 22, 0);
    paint(c, TX.canvas, "oklch(0.95 0.02 75)"); RB(c, 0, 6.15, -0.75, 0.32, 0.36, 6.8, 0, 22, 0);
    if (D <= 2) { paint(c, TX.red, TINT.cloth); for (let k = -2; k <= 2; k++) RB(c, 0, 6.15 + Math.sin(22 * Math.PI / 180) * k * 1.2, -0.75 - Math.cos(22 * Math.PI / 180) * k * 1.2, 0.36, 0.4, 0.12, 0, 22, 0);
      flatc(c, "oklch(0.7 0.04 80)"); for (const [x, z] of [[-1.2, -0.9], [1.2, -0.9], [0, -L - 0.2], [0, L]]) { const a = [0, 7.4, -0.9], b = [x, 0.9, z], d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], l = Math.hypot(...d);
          RB(c, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2, 0.02, l, 0.02, Math.atan2(d[0], d[2]) * 180 / Math.PI, -Math.atan2(Math.hypot(d[0], d[2]), d[1]) * 180 / Math.PI, 0); }
      lantern(c, 0, 1.55, L + 0.25, D); POT(c, 0.6, 0.15, 1.0, 0.55, D); CRATE(c, -0.6, 0.15, 1.1, 0.5, D);
      flatc(c, "oklch(0.45 0.04 120)"); LA(c, 0.3, 0.15, -2.2, [[0.5, 0], [0.4, 0.2], [0, 0.26]], 8, false); }
  },
  shed(c, p, D) { // 3.6 x 3.0, lean-to, closed plank door front, front -z
    const hw = 1.8, hd = 1.5, hf = 2.6, hb = 2.1;
    paint(c, TX.sand, "oklch(0.88 0.02 65)"); BX(c, -hw - 0.15, -0.4, -hd - 0.15, hw + 0.15, 0.15, hd + 0.15);
    paint(c, TX.drift, DRIFT); const yAt = (z) => hf + (hb - hf) * (z + hd) / (2 * hd), t = 0.1;
    BX(c, -hw, 0.15, hd - t, hw, hb, hd); for (const s of [-1, 1]) { const x0 = s < 0 ? -hw : hw - t, x1 = x0 + t; HX(c, [[x0, 0.15, -hd], [x1, 0.15, -hd], [x1, 0.15, hd], [x0, 0.15, hd], [x0, hf, -hd], [x1, hf, -hd], [x1, hb, hd], [x0, hb, hd]]); }
    BX(c, -hw, 0.15, -hd, -0.5, hf, -hd + t); BX(c, 0.5, 0.15, -hd, hw, hf, -hd + t); BX(c, -0.5, 2.15, -hd, 0.5, hf, -hd + t);
    paint(c, TX.oak, "oklch(0.6 0.06 215)"); BX(c, -0.5, 0.15, -hd + 0.02, 0.5, 2.15, -hd + 0.08); paint(c, TX.iron, TINT.iron); for (const y of [0.5, 1.75]) BX(c, -0.48, y, -hd - 0.01, 0.4, y + 0.08, -hd + 0.02); BX(c, 0.3, 1.0, -hd - 0.04, 0.38, 1.2, -hd);
    if (D <= 2) { paint(c, TX.oak, "oklch(0.7 0.03 55)"); for (const [x, z] of [[-hw, -hd], [hw, -hd], [-hw, hd], [hw, hd]]) BX(c, x - 0.08, 0.15, z - 0.08, x + 0.08, yAt(z) + 0.05, z + 0.08);
      for (const x of [-hw + 0.7, hw - 0.7]) BX(c, x - 0.03, 0.15, -hd - 0.03, x + 0.03, hf, -hd + 0.0); }
    // reed-thatch roof slab and a palm-frond fringe
    paint(c, TX.canvas, "oklch(0.78 0.06 80)"); HX(c, [[-hw - 0.35, hf, -hd - 0.5], [hw + 0.35, hf, -hd - 0.5], [hw + 0.35, hb - 0.1, hd + 0.35], [-hw - 0.35, hb - 0.1, hd + 0.35], [-hw - 0.35, hf + 0.2, -hd - 0.5], [hw + 0.35, hf + 0.2, -hd - 0.5], [hw + 0.35, hb + 0.1, hd + 0.35], [-hw - 0.35, hb + 0.1, hd + 0.35]]);
    if (D <= 2) { flatc(c, "oklch(0.62 0.07 85)"); for (let x = -hw - 0.35; x < hw + 0.3; x += 0.25) { tri(c, [x, hf, -hd - 0.5], [x + 0.25, hf, -hd - 0.5], [x + 0.12, hf - 0.3, -hd - 0.55]); tri(c, [x + 0.25, hf, -hd - 0.5], [x, hf, -hd - 0.5], [x + 0.12, hf - 0.3, -hd - 0.55]); }
      // a net drying on a frame at the side, oars, a barrel, a fish rack
      paint(c, TX.oak, WOOD); for (const z of [-1.2, 1.2]) CY(c, hw + 1.3, 0, z, 0.05, 1.9, 6); LA(c, hw + 1.3, 1.85, -1.3, [[0.04, 0], [0.04, 2.6]], 6, true, "z");
      flatc(c, "oklch(0.5 0.04 110)"); quad(c, [hw + 1.28, 1.85, -1.2], [hw + 1.28, 1.85, 1.2], [hw + 1.28, 0.5, 1.0], [hw + 1.28, 0.45, -1.0]); quad(c, [hw + 1.32, 1.85, 1.2], [hw + 1.32, 1.85, -1.2], [hw + 1.32, 0.45, -1.0], [hw + 1.32, 0.5, 1.0]);
      paint(c, TX.oak, WOOD); for (const k of [0, 1]) RB(c, -hw - 0.15, 1.1, -0.6 + k * 0.4, 0.06, 2.3, 0.12, 0, 0, -12 + k * 4);
      POT(c, -hw - 0.6, 0, 0.6, 0.7, D); CRATE(c, -0.9, 0.15, -hd - 0.7, 0.55, D);
      lantern(c, 0.85, 2.45, -hd - 0.4, D); paint(c, TX.iron, TINT.iron); BX(c, 0.81, 2.4, -hd - 0.44, 0.89, 2.48, -hd); }
  },
  brazier(c, p, D) { // an iron fire bowl on three legs, glowing coals; the flame is the row's fx
    paint(c, TX.iron, TINT.iron); for (let i = 0; i < 3; i++) { const a = i / 3 * 6.283; RB(c, Math.cos(a) * 0.32, 0.5, Math.sin(a) * 0.32, 0.06, 1.05, 0.06, -a * 180 / Math.PI, 0, 14); }
    LA(c, 0, 0.85, 0, [[0.12, 0], [0.42, 0.12], [0.55, 0.32], [0.58, 0.36], [0.5, 0.36], [0.4, 0.18], [0.0, 0.14]], D <= 2 ? 16 : 8, false);
    glow(c, "#3a1a08", [2.8, 0.9, 0.25]); LA(c, 0, 1.12, 0, [[0.5, 0], [0.3, 0.06], [0, 0.1]], D <= 2 ? 12 : 6, false);
    if (D <= 2) { paint(c, TX.sand, "oklch(0.9 0.02 65)"); LA(c, 0, 0, 0, [[0.62, 0], [0.62, 0.12], [0.5, 0.16], [0, 0.16]], 12, false); }
  },
  lamppost(c, p, D) {
    paint(c, TX.oak, WOOD); BX(c, -0.09, 0, -0.09, 0.09, 2.9, 0.09); if (D <= 2) { BX(c, -0.16, 0, -0.16, 0.16, 0.3, 0.16); paint(c, TX.oak, "oklch(0.75 0.03 55)"); RB(c, 0, 2.55, -0.25, 0.06, 0.06, 0.6, 0, -40, 0); }
    paint(c, TX.iron, TINT.iron); BX(c, -0.03, 2.82, -0.75, 0.03, 2.88, 0.05); lantern(c, 0, 2.82, -0.7, D);
  },
};
export function geometry(c) { const p = c.params; (K[p.kind] ?? K.lamppost)(c, p, c.lod); }
export function collider(c) {
  const p = c.params, L = CB();
  if (p.kind === "stall") { L(-1.6, 0, -1.0, 1.6, 1.02, -0.45); L(-1.6, 0, 0.55, 1.6, 0.7, 1.0); }
  else if (p.kind === "wagon") { L(-1.25, 0, -2.4, 1.25, 2.9, 2.2); }
  else if (p.kind === "jetty") { const land = p.land ?? 25, len = p.len ?? 32, dk = p.deck ?? 1.3; L(-1.4, dk - 0.4, -land, 1.4, dk, len);
    for (let i = 0; i < 4; i++) L(-1.4, dk - 0.25 * (i + 1) - 0.3, -land - 0.32 * (i + 1), 1.4, dk - 0.25 * (i + 1), -land - 0.32 * i);
    for (const s of [-1, 1]) L(s * 1.4 - 0.08, dk, len - 10, s * 1.4 + 0.08, dk + 1.0, len + 0.1); }
  else if (p.kind === "boat") { L(-1.3, -0.6, -4.4, 1.3, 0.15, 4.4); for (const s of [-1, 1]) L(s * 1.3 - (s > 0 ? 0.15 : 0), 0.15, -3.6, s * 1.3 + (s < 0 ? 0.15 : 0), 1.1, 3.8); L(-0.12, 0.15, -1.02, 0.12, 7.6, -0.78); }
  else if (p.kind === "brazier") { L(-0.55, 0, -0.55, 0.55, 1.2, 0.55); }
  else if (p.kind === "shed") { L(-1.95, -0.4, -1.65, 1.95, 2.8, 1.65); }
  else L(-0.12, 0, -0.12, 0.12, 2.9, 0.12);
  return L.list;
}
const lantern = lantern_sunscarProp({ BX, LA, TINT, TX, glow, paint });
