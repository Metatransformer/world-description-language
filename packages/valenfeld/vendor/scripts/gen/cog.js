// A two-masted COG moored at Gullhaven: origin at the waterline amidships, bow toward -x, 19 m long,
// 5.8 m beam. Tarred clinker hull with oak upper strakes and wales, raised fore- and aftcastles,
// sails furled on their yards, shrouds and stays, a stern lantern, and a gangplank out over its -z side
// to a quay at local y 2.5. Deck at y 1.55.
import { paint, flatc, glow, BX, RB, LA, HX, SEG, PIPE, ROPE, LOFT, CB, OAK, IR, CANVAS, WOOD, IRONC } from "../lib/buildkit.js";
const L = 19, HB = 2.9, TARC = "oklch(0.55 0.03 55)";
const B = (t) => HB * Math.sqrt(Math.max(0, 1 - Math.pow(Math.abs(t), t < 0 ? 2.2 : 3.5)));
const H = (t) => 2.1 + 1.1 * t * t, K = (t) => -1.5 * (1 - 0.35 * t * t);
const S = (t, u) => [t * L / 2, H(t) + (K(t) - H(t)) * u, Math.max(0.12, B(t) * (1 - Math.pow(u, 2.4)))];
const tAt = (x) => x / (L / 2);
function band(c, ts, u0, u1, m) { for (const s of [-1, 1]) { const rows = ts.map((t) => { const r = []; for (let k = 0; k <= m; k++) { const [x, y, w] = S(t, u0 + (u1 - u0) * k / m); r.push([x, y, s * w]); } return r; }); LOFT(c, rows); } }
export function geometry(c) {
  const D = c.lod, N = D <= 2 ? 22 : D <= 3 ? 12 : 6, ts = []; for (let i = 0; i <= N; i++) ts.push(-1 + 2 * i / N);
  paint(c, OAK, WOOD); band(c, ts, 0, 0.3, D <= 3 ? 2 : 1);
  paint(c, OAK, TARC); band(c, ts, 0.3, 1, D <= 2 ? 4 : D <= 3 ? 2 : 1);
  paint(c, OAK, "oklch(0.75 0.02 55)"); SEG(c, [-9.4, -1.0, 0], [-10.0, 3.9, 0], 0.28, 0.3); SEG(c, [9.4, -1.0, 0], [9.6, 4.6, 0], 0.3, 0.3);
  SEG(c, [-9.4, -0.95, 0], [9.4, -0.95, 0], 0.25, 0.25);
  // deck
  paint(c, OAK, "oklch(0.88 0.02 70)"); { const dts = ts.filter((t) => Math.abs(t) < 0.9);
    for (let i = 0; i < dts.length - 1; i++) { const a = dts[i], b = dts[i + 1], ya = 1.55, wa = B(a) * 0.96, wb = B(b) * 0.96;
      c.quad(a * L / 2, ya, -wa, a * L / 2, ya, wa, b * L / 2, ya, wb, b * L / 2, ya, -wb); } }
  if (D <= 2) { paint(c, OAK, "oklch(0.6 0.03 50)"); for (const s of [-1, 1]) for (const u of [0.06, 0.24]) { const pts = ts.filter((t) => Math.abs(t) < 0.94).map((t) => { const [x, y, w] = S(t, u); return [x, y, s * (w + 0.05)]; });
    for (let i = 0; i < pts.length - 1; i++) SEG(c, pts[i], pts[i + 1], 0.12, 0.14); } }
  // castles
  paint(c, OAK, WOOD);
  HX(c, [[4.6, 1.5, -2.6], [8.7, 1.5, -1.9], [8.7, 1.5, 1.9], [4.6, 1.5, 2.6], [4.6, 4.4, -2.6], [8.7, 4.4, -1.9], [8.7, 4.4, 1.9], [4.6, 4.4, 2.6]]);
  HX(c, [[-9.1, 1.6, -1.1], [-6.0, 1.6, -2.25], [-6.0, 1.6, 2.25], [-9.1, 1.6, 1.1], [-9.1, 4.1, -1.1], [-6.0, 4.1, -2.25], [-6.0, 4.1, 2.25], [-9.1, 4.1, 1.1]]);
  if (D <= 3) { paint(c, OAK, "oklch(0.78 0.03 55)");
    const rail = (pts, y0) => { for (let i = 0; i < pts.length - 1; i++) { const [a, b] = [pts[i], pts[i + 1]]; SEG(c, [a[0], y0 + 0.85, a[1]], [b[0], y0 + 0.85, b[1]], 0.14, 0.12);
      if (D <= 2) { const n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.7)); for (let k = 0; k <= n; k++) { const x = a[0] + (b[0] - a[0]) * k / n, z = a[1] + (b[1] - a[1]) * k / n; BX(c, x - 0.06, y0, z - 0.06, x + 0.06, y0 + 0.85, z + 0.06); } } } };
    rail([[4.6, -2.55], [8.65, -1.85], [8.65, 1.85], [4.6, 2.55]], 4.4); rail([[-6.05, -2.2], [-9.05, -1.05], [-9.05, 1.05], [-6.05, 2.2]], 4.1);
    glow(c, "#ffcf90", [1.4, 0.8, 0.3]); for (const z of [-1.2, 1.2]) BX(c, 4.55, 2.6, z - 0.3, 4.62, 3.3, z + 0.3); }
  // masts, top, yards, furled sails, bowsprit, rudder
  paint(c, OAK, "oklch(0.85 0.03 70)");
  PIPE(c, [-0.5, 1.4, 0], [-0.5, 17.2, 0], 0.24, 0.13, D <= 2 ? 9 : 6); PIPE(c, [-5.8, 1.9, 0], [-6.1, 12.6, 0], 0.17, 0.1, D <= 2 ? 8 : 5);
  PIPE(c, [-9.4, 3.4, 0], [-14.0, 5.0, 0], 0.17, 0.08, 6);
  PIPE(c, [-0.5, 14.5, -4.8], [-0.5, 14.5, 4.8], 0.1, 0.1, 6); PIPE(c, [-6.05, 10.8, -3.4], [-6.05, 10.8, 3.4], 0.08, 0.08, 6);
  LA(c, -0.5, 13.0, 0, [[0.85, 0], [1.0, 0.75]], D <= 2 ? 12 : 7, true);
  RB(c, 9.85, 0.8, 0, 0.6, 3.8, 0.22); if (D <= 2) SEG(c, [9.9, 2.9, 0], [7.8, 3.3, 0], 0.1, 0.1);
  paint(c, CANVAS, "oklch(0.93 0.025 85)"); PIPE(c, [-0.5, 14.2, -4.3], [-0.5, 14.2, 4.3], 0.32, 0.32, 8); PIPE(c, [-6.05, 10.52, -3.0], [-6.05, 10.52, 3.0], 0.26, 0.26, 8);
  if (D <= 2) { paint(c, CANVAS, "oklch(0.88 0.03 80)"); for (const z of [-3.2, -1.6, 0, 1.6, 3.2]) PIPE(c, [-0.5, 14.2, z - 0.05], [-0.5, 14.2, z + 0.05], 0.35, 0.35, 8); }
  // rigging
  if (D <= 3) { flatc(c, "oklch(0.38 0.03 60)"); const r = 0.03;
    const xs = D <= 2 ? [-1.8, -0.9, 0, 0.9] : [-1.4, 0.4];
    for (const s of [-1, 1]) { for (const x of xs) { const t = tAt(x); PIPE(c, [-0.5, 13.0, s * 0.2], [x, H(t), s * B(t)], r, r, 3, false); }
      for (const x of (D <= 2 ? [-6.6, -5.7, -4.8] : [-5.7])) { const t = tAt(x); PIPE(c, [-6.0, 10.4, s * 0.15], [x, H(t), s * B(t)], r, r, 3, false); } }
    PIPE(c, [-0.5, 16.8, 0], [-6.08, 11.6, 0], r, r, 3, false); PIPE(c, [-6.1, 12.3, 0], [-13.8, 4.95, 0], r, r, 3, false); PIPE(c, [-0.5, 16.8, 0], [8.6, 5.3, 0], r, r, 3, false);
    flatc(c, "oklch(0.55 0.15 32)"); c.tri(-0.5, 17.15, 0, -0.5, 16.75, 0, 1.6, 16.98, 0.25); }
  // stern lantern, gangplank
  paint(c, IR, IRONC); BX(c, 9.4, 4.4, -0.05, 9.5, 5.2, 0.05); BX(c, 9.25, 4.95, -0.2, 9.65, 5.0, 0.2); glow(c, "#ffd9a0", [1.8, 1.0, 0.4]); BX(c, 9.3, 4.6, -0.15, 9.6, 4.95, 0.15);
  paint(c, OAK, "oklch(0.86 0.02 70)"); SEG(c, [0.8, 1.62, -2.4], [0.8, 2.55, -4.9], 0.75, 0.08);
  if (D <= 2) for (let k = 1; k < 7; k++) { const f = k / 7; BX(c, 0.45, 1.66 + 0.93 * f, -2.4 - 2.5 * f - 0.03, 1.15, 1.7 + 0.93 * f, -2.4 - 2.5 * f + 0.03); }
  if (D <= 2) { flatc(c, "oklch(0.62 0.05 75)"); ROPE(c, [-8.6, 3.6, -1.0], [-8.4, 2.5, -6.2], 0.4, 0.035, 5); ROPE(c, [8.3, 3.8, -1.2], [8.6, 2.5, -6.0], 0.4, 0.035, 5); }
}
export function collider(c) { const b = CB();
  b(-8.5, -1.2, -2.5, 8.5, 1.55, 2.5); b(4.6, 1.55, -2.4, 8.6, 4.4, 2.4); b(-9.1, 1.55, -1.8, -6.0, 4.1, 1.8);
  b(-8, 1.55, 2.5, 8, 2.3, 2.85); b(-8, 1.55, -2.85, 0.3, 2.3, -2.5); b(1.3, 1.55, -2.85, 8, 2.3, -2.5);
  for (let k = 0; k < 5; k++) { const f = (k + 1) / 5, z = -2.4 - 2.5 * k / 5; b(0.42, 0.9, z - 0.5, 1.18, 1.62 + 0.93 * f, z); }
  return b.list; }
