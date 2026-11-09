
import { shelf_magesGuild } from "../lib/pieces/shelf.js";   // shared shelf piece, drawn in this building's palette
import { table_magesGuild } from "../lib/pieces/table.js";   // shared table piece, drawn in this building's palette
import { bench_magesGuild } from "../lib/pieces/bench.js";   // shared bench piece, drawn in this building's palette// The Mages Guild tower of Valenfeld: a round fieldstone tower, three storeys under a flared slate cone
// with a glowing blue crystal finial. Ground hall: bookshelves on the curved walls, a reading table, an
// alchemy bench, an arcane circle hovering over the flagstones, a stair spiralling up the east wall to
// the second-floor balcony. Door in the south (+z). Angles θ are degrees from +z toward +x.
const D = Math.PI / 180;
const N = 40, STEP = 9;                     // wall segments, 9° each
const RI = 5.2, RO = 6.0, H = 9.2;          // inner / outer radius, wall height
const DOOR = [39, 0], DOOR_H = 2.8;         // two segments, θ -9..9 → 1.63 m clear inside
const BAL = { y: 4.0, th: 0.25, r0: 2.8, a0: 108, a1: 418 }; // balcony ring, open over the stairwell (58..108)
const CEIL = 7.2;
const STAIR = { a0: 22, da: 4.3, n: 20, rise: 0.2, r0: 3.9, r1: RI + 0.02 };
const ROWS = [
  { segs: [14, 25, 35], y0: 1.4, y1: 2.9, glow: false },
  { segs: [4, 14, 25, 35], y0: 5.0, y1: 6.5, glow: false },
  { segs: [2, 10, 29, 37], y0: 7.6, y1: 8.4, glow: true },
];
export const SHELVES = [180, 202, 250, 272, 294, 340];
export const TABLE = { a: 240, r: 3.0 };
export const BENCH = { a: 145, r: 4.55 };
export const CANDLES = [[-0.78, 0.15, 0.22], [0.62, 0.18, 0.16], [0.76, 0.02, 0.11]]; // table frame: t, n, height
const TX = {
  stone: "cdn/texture-fieldstone-wall-mossy.png",
  plaster: "cdn/texture-limewash-plaster.png",
  oak: "cdn/texture-dark-oak-planks-weathered.png",
  slate: "cdn/texture-slate-roof-tiles-mossy.png",
  iron: "cdn/texture-wrought-iron.png",
  flag: "cdn/texture-worn-flagstone-floor.png",
};
const BOOKS = ["#6e2a1e", "#7a5a2a", "#3c5238", "#2a3650", "#4a3a2a", "#5a2430", "#8a7448", "#3b3a36"];

const P = (r, a, y) => [r * Math.sin(a * D), y, r * Math.cos(a * D)];
const nrm = (a) => [Math.sin(a * D), 0, Math.cos(a * D)];
const tan = (a) => [Math.cos(a * D), 0, -Math.sin(a * D)];
const add = (p, v, s = 1) => [p[0] + v[0] * s, p[1] + v[1] * s, p[2] + v[2] * s];
const neg = (v) => [-v[0], -v[1], -v[2]];
const UP = [0, 1, 0], DN = [0, -1, 0];

function Q(ctx, a, b, c, d, n) {
  const pts = [a, b, c, d]; let nx = 0, ny = 0, nz = 0;
  for (let i = 0; i < 4; i++) { const p = pts[i], q = pts[(i + 1) % 4];
    nx += (p[1] - q[1]) * (p[2] + q[2]); ny += (p[2] - q[2]) * (p[0] + q[0]); nz += (p[0] - q[0]) * (p[1] + q[1]); }
  if (nx * n[0] + ny * n[1] + nz * n[2] >= 0) ctx.quad(...a, ...b, ...c, ...d); else ctx.quad(...a, ...d, ...c, ...b);
}
function T(ctx, a, b, c, n) {
  const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
  const cr = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
  if (cr[0] * n[0] + cr[1] * n[1] + cr[2] * n[2] >= 0) ctx.tri(...a, ...b, ...c); else ctx.tri(...a, ...c, ...b);
}
function mat(ctx, tex, color = "oklch(0.96 0.01 90)", rough = 0.85) {
  ctx.albedo(tex ?? null); ctx.color(color); ctx.emissive(null); ctx.roughness(rough); ctx.metalness(0);
}
// box: c = bottom centre, ux / uz unit horizontal axes, w along ux, d along uz
function box(ctx, c, ux, uz, w, h, d, noBottom) {
  const k = (sx, sy, sz) => [c[0] + ux[0] * sx * w / 2 + uz[0] * sz * d / 2, c[1] + sy * h, c[2] + ux[2] * sx * w / 2 + uz[2] * sz * d / 2];
  Q(ctx, k(-1, 1, -1), k(1, 1, -1), k(1, 1, 1), k(-1, 1, 1), UP);
  if (!noBottom) Q(ctx, k(-1, 0, -1), k(1, 0, -1), k(1, 0, 1), k(-1, 0, 1), DN);
  Q(ctx, k(1, 0, -1), k(1, 0, 1), k(1, 1, 1), k(1, 1, -1), ux);
  Q(ctx, k(-1, 0, -1), k(-1, 0, 1), k(-1, 1, 1), k(-1, 1, -1), neg(ux));
  Q(ctx, k(-1, 0, 1), k(1, 0, 1), k(1, 1, 1), k(-1, 1, 1), uz);
  Q(ctx, k(-1, 0, -1), k(1, 0, -1), k(1, 1, -1), k(-1, 1, -1), neg(uz));
}
const frame = (a, r) => ({ c: P(r, a, 0), t: tan(a), n: nrm(a) });
const at = (f, tx, nz, y) => [f.c[0] + f.t[0] * tx + f.n[0] * nz, y, f.c[2] + f.t[2] * tx + f.n[2] * nz];
// ring sector solid
function sector(ctx, r0, r1, a0, a1, y0, y1, f, step = 9) {
  const n = Math.max(1, Math.ceil((a1 - a0) / step));
  for (let k = 0; k < n; k++) {
    const aa = a0 + (a1 - a0) * k / n, ab = a0 + (a1 - a0) * (k + 1) / n, m = (aa + ab) / 2;
    if (f.top) Q(ctx, P(r0, aa, y1), P(r1, aa, y1), P(r1, ab, y1), P(r0, ab, y1), UP);
    if (f.bottom) Q(ctx, P(r0, aa, y0), P(r1, aa, y0), P(r1, ab, y0), P(r0, ab, y0), DN);
    if (f.outer) Q(ctx, P(r1, aa, y0), P(r1, ab, y0), P(r1, ab, y1), P(r1, aa, y1), nrm(m));
    if (f.inner && r0 > 0) Q(ctx, P(r0, aa, y0), P(r0, ab, y0), P(r0, ab, y1), P(r0, aa, y1), neg(nrm(m)));
  }
  if (f.ends) {
    Q(ctx, P(r0, a0, y0), P(r1, a0, y0), P(r1, a0, y1), P(r0, a0, y1), neg(tan(a0)));
    Q(ctx, P(r0, a1, y0), P(r1, a1, y0), P(r1, a1, y1), P(r0, a1, y1), tan(a1));
  }
}
// lathe: profile [[r, y]...] bottom to top, outward winding by construction
function lathe(ctx, c, prof, sides = 10) {
  ctx.smooth();
  for (let s = 0; s < sides; s++) {
    const a = s * 360 / sides, b = (s + 1) * 360 / sides;
    for (let j = 0; j < prof.length - 1; j++) {
      const [r0, y0] = prof[j], [r1, y1] = prof[j + 1];
      const A = add(c, P(r0, a, y0)), B = add(c, P(r0, b, y0)), C = add(c, P(r1, b, y1)), Dd = add(c, P(r1, a, y1));
      ctx.quad(...A, ...B, ...C, ...Dd);
    }
  }
  ctx.flat();
}
function holes(i, mode) {
  const h = [];
  if (DOOR.includes(i)) h.push([0, DOOR_H, null]);
  if (mode === "full") for (const row of ROWS) if (row.segs.includes(i)) h.push([row.y0, row.y1, row]);
  return h.sort((a, b) => a[0] - b[0]);
}
const inHole = (hs, y) => hs.some((h) => y > h[0] && y < h[1]);

function walls(ctx, mode) {
  const col = mode === "collider";
  for (let i = 0; i < N; i++) {
    const a0 = i * STEP, a1 = (i + 1) * STEP, m = (a0 + a1) / 2, hs = holes(i, mode);
    const ys = [0, H, ...hs.flatMap((h) => [h[0], h[1]])].sort((a, b) => a - b);
    for (let k = 0; k < ys.length - 1; k++) {
      const y0 = ys[k], y1 = ys[k + 1]; if (y1 - y0 < 1e-4 || inHole(hs, (y0 + y1) / 2)) continue;
      if (!col) { mat(ctx, TX.stone); ctx.smooth(); }
      Q(ctx, P(RO, a0, y0), P(RO, a1, y0), P(RO, a1, y1), P(RO, a0, y1), nrm(m));
      if (!col) mat(ctx, TX.plaster, "oklch(0.95 0.015 85)", 0.9);
      Q(ctx, P(RI, a0, y0), P(RI, a1, y0), P(RI, a1, y1), P(RI, a0, y1), neg(nrm(m)));
      if (!col) ctx.flat();
    }
    if (!col) mat(ctx, TX.stone);
    for (const h of hs) {
      if (h[0] > 0) Q(ctx, P(RI, a0, h[0]), P(RO, a0, h[0]), P(RO, a1, h[0]), P(RI, a1, h[0]), UP);
      Q(ctx, P(RI, a0, h[1]), P(RO, a0, h[1]), P(RO, a1, h[1]), P(RI, a1, h[1]), DN);
      if (!col && h[2]) { // glass
        const rg = (RI + RO) / 2 + 0.1;
        if (h[2].glow) { ctx.albedo(null); ctx.color("oklch(0.75 0.08 70)"); ctx.emissive(1.6, 0.85, 0.32); }
        else { ctx.albedo(null); ctx.color("oklch(0.72 0.03 230)", 0.42); ctx.roughness(0.08); }
        Q(ctx, P(rg, a0, h[0]), P(rg, a1, h[0]), P(rg, a1, h[1]), P(rg, a0, h[1]), nrm(m));
        mat(ctx, TX.iron, "oklch(0.92 0 0)", 0.6);
        const yb = (h[0] + h[1]) / 2;
        Q(ctx, P(rg + 0.02, a0, yb - 0.025), P(rg + 0.02, a1, yb - 0.025), P(rg + 0.02, a1, yb + 0.025), P(rg + 0.02, a0, yb + 0.025), nrm(m));
        Q(ctx, P(rg + 0.02, m - 0.25, h[0]), P(rg + 0.02, m + 0.25, h[0]), P(rg + 0.02, m + 0.25, h[1]), P(rg + 0.02, m - 0.25, h[1]), nrm(m));
        mat(ctx, TX.stone);
        const f = frame(m, RO); box(ctx, add(at(f, 0, 0.08, h[0] - 0.1), [0, 0, 0]), f.t, f.n, 1.15, 0.12, 0.3); // sill
      }
    }
    if (!col) mat(ctx, TX.stone);
    Q(ctx, P(RI, a0, H), P(RO, a0, H), P(RO, a1, H), P(RI, a1, H), UP);
  }
  // jambs: at each boundary, the y spans where exactly one side is open
  for (let b = 0; b < N; b++) {
    const L = holes((b + N - 1) % N, mode), R = holes(b, mode), a = b * STEP;
    const ys = [0, H, ...L.flatMap((h) => [h[0], h[1]]), ...R.flatMap((h) => [h[0], h[1]])].sort((x, y) => x - y);
    for (let k = 0; k < ys.length - 1; k++) {
      const y0 = ys[k], y1 = ys[k + 1], mid = (y0 + y1) / 2; if (y1 - y0 < 1e-4) continue;
      const hl = inHole(L, mid), hr = inHole(R, mid); if (hl === hr) continue;
      Q(ctx, P(RI, a, y0), P(RO, a, y0), P(RO, a, y1), P(RI, a, y1), hr ? tan(a) : neg(tan(a)));
    }
  }
}

function stairs(ctx, col) {
  const s = STAIR;
  for (let k = 0; k < s.n; k++) {
    const a0 = s.a0 + k * s.da, a1 = a0 + s.da, y1 = (k + 1) * s.rise;
    if (!col) mat(ctx, TX.stone, "oklch(0.93 0.01 80)");
    sector(ctx, s.r0, s.r1, a0, a1, 0, y1, { top: 1, inner: 1 }, s.da);
    Q(ctx, P(s.r0, a0, k * s.rise), P(s.r1, a0, k * s.rise), P(s.r1, a0, y1), P(s.r0, a0, y1), neg(tan(a0)));
    if (k === s.n - 1) Q(ctx, P(s.r0, a1, 0), P(s.r1, a1, 0), P(s.r1, a1, y1), P(s.r0, a1, y1), tan(a1));
    // the riser below the previous step's top for the side under the stair (the solid shows from the hall)
    if (k > 0) Q(ctx, P(s.r0, a0, 0), P(s.r1, a0, 0), P(s.r1, a0, k * s.rise), P(s.r0, a0, k * s.rise), neg(tan(a0)));
    if (!col) { mat(ctx, TX.oak, "oklch(0.93 0.02 70)"); sector(ctx, s.r0 - 0.03, s.r1, a0 - 0.15, a1, y1 - 0.01, y1 + 0.04, { top: 1, inner: 1, ends: 1 }, s.da); }
  }
}

function balcony(ctx, col) {
  const b = BAL;
  if (!col) mat(ctx, TX.oak, "oklch(0.94 0.02 70)");
  sector(ctx, b.r0, RI + 0.02, b.a0, b.a1, b.y - b.th, b.y, { top: 1, bottom: 1, inner: 1, ends: 1 }, 6);
  // rail along the open edge, and across the stairwell's start
  sector(ctx, b.r0, b.r0 + 0.1, b.a0, b.a1, b.y + 0.95, b.y + 1.05, { top: 1, bottom: !col, inner: 1, outer: 1, ends: 1 }, 6);
  if (col) sector(ctx, b.r0, b.r0 + 0.02, b.a0, b.a1, b.y, b.y + 1.0, { inner: 1, outer: 1 }, 6);
  const f = frame(58, (b.r0 + RI) / 2);
  box(ctx, at(f, -0.05, 0, b.y + 0.95), f.n, f.t, RI - b.r0, 0.1, 0.1);
  if (col) box(ctx, at(f, -0.05, 0, b.y), f.n, f.t, RI - b.r0, 1.0, 0.04);
  else {
    for (let a = b.a0 + 3; a < b.a1; a += 10) { const g = frame(a, b.r0 + 0.05); box(ctx, at(g, 0, 0, b.y), g.t, g.n, 0.06, 0.95, 0.06, true); }
    for (let r = b.r0 + 0.3; r < RI; r += 0.5) { const g = frame(58, r); box(ctx, at(g, -0.05, 0, b.y), g.t, g.n, 0.06, 0.95, 0.06, true); }
  }
}

function furnitureColliders(ctx) {
  for (const a of SHELVES) { const f = frame(a, RI - 0.21); box(ctx, f.c, f.t, f.n, 1.5, 2.6, 0.44); }
  let f = frame(TABLE.a, TABLE.r); box(ctx, f.c, f.t, f.n, 2.0, 0.86, 0.95);
  f = frame(BENCH.a, BENCH.r); box(ctx, f.c, f.t, f.n, 2.2, 0.95, 0.75);
}


function candle(ctx, p, h, lod) {
  mat(ctx, TX.iron, "oklch(0.9 0 0)", 0.5); ctx.metalness(0.6);
  lathe(ctx, p, [[0, 0], [0.07, 0], [0.075, 0.012], [0.03, 0.02], [0.028, 0.035], [0, 0.036]], 8);
  mat(ctx, null, "oklch(0.9 0.04 85)", 0.6);
  lathe(ctx, add(p, [0, 0.03, 0]), [[0.022, 0], [0.022, h - 0.01], [0.016, h], [0, h]], 8);
}
function flameTip(ctx, p, s = 0.03) {
  ctx.albedo(null); ctx.color("oklch(0.95 0.08 80)"); ctx.emissive(3.2, 1.7, 0.5);
  const top = add(p, [0, s * 2.2, 0]);
  for (const d of [[1, 0, 0], [0, 0, 1]]) {
    const l = add(p, d, -s * 0.6), r = add(p, d, s * 0.6), m = add(p, [0, s * 0.7, 0]);
    const nn = [d[2], 0, -d[0]];
    T(ctx, p, r, m, nn); T(ctx, p, m, l, nn); T(ctx, m, r, top, nn); T(ctx, m, top, l, nn);
    T(ctx, p, r, m, neg(nn)); T(ctx, p, m, l, neg(nn)); T(ctx, m, r, top, neg(nn)); T(ctx, m, top, l, neg(nn));
  }
  ctx.emissive(null);
}



function arcaneCircle(ctx) {
  const cz = 0.3, y = 0.11;
  ctx.albedo(null); ctx.color("oklch(0.35 0.08 250)"); ctx.roughness(0.4); ctx.emissive(0.45, 1.15, 3.2);
  const ring = (r0, r1, n = 48) => { for (let k = 0; k < n; k++) { const a = k * 360 / n, b = (k + 1) * 360 / n;
    Q(ctx, add(P(r0, a, y), [0, 0, cz]), add(P(r1, a, y), [0, 0, cz]), add(P(r1, b, y), [0, 0, cz]), add(P(r0, b, y), [0, 0, cz]), UP); } };
  const strip = (p, q, w) => { const dx = q[0] - p[0], dz = q[2] - p[2], l = Math.hypot(dx, dz), ox = -dz / l * w / 2, oz = dx / l * w / 2;
    Q(ctx, [p[0] + ox, y, p[2] + oz + cz], [q[0] + ox, y, q[2] + oz + cz], [q[0] - ox, y, q[2] - oz + cz], [p[0] - ox, y, p[2] - oz + cz], UP); };
  ring(1.46, 1.52); ring(1.22, 1.25); ring(0.52, 0.55, 32);
  for (const off of [0, 60]) for (let k = 0; k < 3; k++) strip(P(1.22, off + k * 120, 0), P(1.22, off + (k + 1) * 120, 0), 0.035);
  for (let k = 0; k < 36; k++) { const a = k * 10 + 5; strip(P(1.29, a, 0), P(k % 3 === 0 ? 1.43 : 1.36, a, 0), k % 3 === 0 ? 0.045 : 0.025); }
  ctx.emissive(0.25, 0.6, 1.7); ring(0.2, 0.24, 24);
  ctx.emissive(null);
}

function chandelier(ctx) {
  const yr = 5.45;
  mat(ctx, TX.iron, "oklch(0.88 0 0)", 0.5); ctx.metalness(0.6);
  sector(ctx, 0.78, 0.88, 0, 360, yr, yr + 0.07, { top: 1, bottom: 1, inner: 1, outer: 1 }, 15);
  for (const a of [0, 120, 240]) { const p = P(0.83, a, yr + 0.07); box(ctx, p, [1, 0, 0], [0, 0, 1], 0.025, CEIL - yr - 0.07, 0.025, true); }
  for (let k = 0; k < 8; k++) { const p = P(0.83, k * 45 + 22, yr + 0.07); candle(ctx, p, 0.12, 1); flameTip(ctx, add(p, [0, 0.16, 0]), 0.025); }
}

function roof(ctx, lod) {
  const prof = [[6.95, 8.92], [6.9, 9.0], [5.9, 9.55], [4.4, 10.7], [2.6, 12.2], [1.0, 13.4], [0.18, 13.95]];
  mat(ctx, TX.slate, "oklch(0.95 0.01 230)", 0.8);
  const n = lod >= 4 ? 20 : 40;
  ctx.smooth();
  for (let k = 0; k < n; k++) {
    const a = k * 360 / n, b = (k + 1) * 360 / n;
    for (let j = 0; j < prof.length - 1; j++) {
      const [r0, y0] = prof[j], [r1, y1] = prof[j + 1];
      ctx.quad(...P(r0, a, y0), ...P(r0, b, y0), ...P(r1, b, y1), ...P(r1, a, y1));
    }
  }
  ctx.flat();
  mat(ctx, TX.oak, "oklch(0.9 0.02 60)");
  sector(ctx, RO - 0.05, 6.95, 0, 360, 8.92, 8.92, { bottom: 1 }, 360 / n);
}

function finial(ctx, lod) {
  mat(ctx, TX.iron, "oklch(0.9 0 0)", 0.45); ctx.metalness(0.7);
  lathe(ctx, [0, 13.85, 0], [[0, 0], [0.3, 0], [0.3, 0.08], [0.14, 0.14], [0.12, 0.42], [0.22, 0.5], [0.2, 0.56], [0, 0.56]], 12);
  // the crystal: a hexagonal bipyramid
  ctx.albedo(null); ctx.color("oklch(0.85 0.09 225)"); ctx.roughness(0.1); ctx.metalness(0); ctx.emissive(0.55, 1.6, 3.6);
  const lo = [0, 14.35, 0], hi = [0, 16.0, 0], ym = 14.85;
  for (let k = 0; k < 6; k++) {
    const a = k * 60 + 30, b = a + 60, pa = P(0.34, a, ym), pb = P(0.34, b, ym), m = nrm((a + b) / 2);
    T(ctx, pa, pb, hi, [m[0], 0.4, m[2]]); T(ctx, pa, pb, lo, [m[0], -0.6, m[2]]);
  }
  if (lod <= 2) for (const [a, r, y, s] of [[40, 0.55, 14.6, 0.09], [160, 0.5, 14.9, 0.07], [280, 0.6, 14.4, 0.08]]) {
    const c = P(r, a, y), t = add(c, [0, s * 2.5, 0]), bt = add(c, [0, -s * 1.5, 0]);
    for (let k = 0; k < 4; k++) { const pa = add(c, P(s, k * 90, 0)), pb = add(c, P(s, k * 90 + 90, 0)), m = nrm(k * 90 + 45);
      T(ctx, pa, pb, t, [m[0], 0.3, m[2]]); T(ctx, pa, pb, bt, [m[0], -0.3, m[2]]); }
  }
  ctx.emissive(null);
}

function exterior(ctx, lod) {
  mat(ctx, TX.stone, "oklch(0.9 0.01 90)");
  sector(ctx, RO - 0.05, 6.4, 12, 348, 0, 0.45, { top: 1, outer: 1, ends: 1 });
  sector(ctx, RO - 0.05, 6.32, 0, 360, 8.55, 8.92, { top: 1, bottom: 1, outer: 1 });
  if (lod <= 3) sector(ctx, RO - 0.05, 6.1, 0, 360, 4.0, 4.16, { top: 1, bottom: 1, outer: 1 });
  if (lod <= 2) for (let i = 0; i < N; i++) { const f = frame(i * STEP + 4.5, 6.12); box(ctx, at(f, 0, 0, 8.25), f.t, f.n, 0.24, 0.3, 0.26); }
  // door surround and threshold
  for (const s of [-1, 1]) { const f = frame(s * 10.9, RO); box(ctx, f.c, f.t, f.n, 0.34, 2.95, 0.42); }
  let f = frame(0, RO);
  box(ctx, at(f, 0, 0, 2.8), f.t, f.n, 2.4, 0.5, 0.44);
  box(ctx, at(f, 0, 0.04, 2.95), f.t, f.n, 0.34, 0.5, 0.52);
  f = frame(0, 6.55); box(ctx, f.c, f.t, f.n, 2.3, 0.12, 1.0);
  if (lod > 3) return;
  // banners of the guild either side of the door
  for (const s of [-1, 1]) {
    const g = frame(s * 21, RO + 0.14);
    mat(ctx, TX.iron, "oklch(0.88 0 0)", 0.5); ctx.metalness(0.6);
    box(ctx, at(g, 0, 0, 3.55), g.t, g.n, 1.0, 0.04, 0.04);
    for (const x of [-0.45, 0.45]) box(ctx, at(g, x, -0.08, 3.55), g.t, g.n, 0.03, 0.03, 0.2);
    ctx.albedo(null); ctx.color("#2f3d52"); ctx.roughness(0.95); ctx.metalness(0);
    const k = (x, y) => add(at(g, x, 0.02, y), [0, 0, 0]);
    Q(ctx, k(-0.42, 2.0), k(0.42, 2.0), k(0.42, 3.53), k(-0.42, 3.53), g.n);
    Q(ctx, k(-0.42, 2.0), k(0.42, 2.0), k(0.42, 3.53), k(-0.42, 3.53), neg(g.n));
    T(ctx, k(-0.42, 2.0), k(0.42, 2.0), k(0, 1.72), g.n); T(ctx, k(-0.42, 2.0), k(0.42, 2.0), k(0, 1.72), neg(g.n));
    ctx.color("#c9a45a"); ctx.emissive(0.12, 0.08, 0.02);
    const c = add(at(g, 0, 0.035, 2.85), [0, 0, 0]);
    for (let j = 0; j < 16; j++) {
      const ra = j % 2 ? 0.09 : 0.26, rb = j % 2 ? 0.26 : 0.09, a = j * 22.5 * D, b = (j + 1) * 22.5 * D;
      const pa = add(add(c, g.t, Math.sin(a) * ra), [0, Math.cos(a) * ra, 0]), pb = add(add(c, g.t, Math.sin(b) * rb), [0, Math.cos(b) * rb, 0]);
      T(ctx, c, pa, pb, g.n);
    }
    ctx.color("#a8452e"); ctx.emissive(null);
    for (const y of [2.12, 3.42]) Q(ctx, k(-0.42, y), k(0.42, y), k(0.42, y + 0.05), k(-0.42, y + 0.05), g.n);
    // door lantern
    const l = frame(s * 14.5, RO + 0.22);
    mat(ctx, TX.iron, "oklch(0.88 0 0)", 0.5); ctx.metalness(0.6);
    box(ctx, at(l, 0, -0.12, 2.92), l.t, l.n, 0.04, 0.04, 0.3);
    box(ctx, at(l, 0, 0, 2.55), l.t, l.n, 0.24, 0.04, 0.24); box(ctx, at(l, 0, 0, 2.89), l.t, l.n, 0.26, 0.05, 0.26);
    for (const [x, z] of [[-0.1, -0.1], [0.1, -0.1], [-0.1, 0.1], [0.1, 0.1]]) box(ctx, at(l, x, z, 2.59), l.t, l.n, 0.025, 0.3, 0.025, true);
    ctx.albedo(null); ctx.color("oklch(0.9 0.08 80)"); ctx.emissive(2.6, 1.3, 0.4); ctx.metalness(0);
    box(ctx, at(l, 0, 0, 2.6), l.t, l.n, 0.17, 0.28, 0.17, true);
    ctx.emissive(null);
  }
}

function interior(ctx, lod) {
  mat(ctx, TX.flag, "oklch(0.93 0.01 80)", 0.9);
  sector(ctx, 0, RI + 0.02, 0, 360, 0.06, 0.06, { top: 1 }, 9);
  // the door's threshold within the wall
  sector(ctx, RI, RO + 0.02, -9, 9, 0.06, 0.06, { top: 1 }, 9);
  mat(ctx, TX.oak, "oklch(0.88 0.02 60)");
  sector(ctx, 0, RI + 0.02, 0, 360, CEIL, CEIL, { bottom: 1 }, 9);
  if (lod > 2) return;
  stairs(ctx, false);
  balcony(ctx, false);
  mat(ctx, TX.oak, "oklch(0.86 0.02 55)");
  for (let k = 0; k < 8; k++) { const a = k * 45 + 22.5, f = frame(a, (RI + 0.6) / 2); box(ctx, at(f, 0, 0, CEIL - 0.24), f.n, f.t, RI - 0.6, 0.24, 0.2); }
  lathe(ctx, [0, CEIL - 0.3, 0], [[0, 0], [0.5, 0], [0.6, 0.3], [0, 0.3]], 12);
  if (lod <= 1) for (let a = BAL.a0 + 8; a < BAL.a1 - 4; a += 24) { // brackets under the balcony
    const f = frame(a, RI - 0.3);
    box(ctx, at(f, 0, 0, BAL.y - BAL.th - 0.5), f.t, f.n, 0.16, 0.5, 0.6, false);
  }
  // open oak door leaves swung in against the jambs (params.closed: a door object closes the doorway instead)
  if (!ctx.params?.closed) for (const s of [-1, 1]) {
    const hinge = [s * 0.82, 0.06, RI - 0.05];
    mat(ctx, TX.oak, "oklch(0.86 0.03 50)");
    box(ctx, add(hinge, [s * 0.05, 0, -0.42]), [1, 0, 0], [0, 0, 1], 0.07, 2.7, 0.82);
    if (lod <= 1) { mat(ctx, TX.iron, "oklch(0.85 0 0)", 0.5); ctx.metalness(0.6);
      for (const y of [0.35, 1.3, 2.3]) box(ctx, add(hinge, [s * 0.01, y, -0.42]), [1, 0, 0], [0, 0, 1], 0.09, 0.07, 0.8, true); }
  }
  for (const a of SHELVES) shelf(ctx, a, lod);
  table(ctx, lod);
  bench(ctx, lod);
  arcaneCircle(ctx);
  chandelier(ctx);
  // balcony lectern and shelf upstairs
  if (lod <= 1) { shelf2(ctx); }
}
function shelf2(ctx) { // a low bookcase on the balcony, by the far wall
  for (const a of [190, 260]) {
    const f = frame(a, RI - 0.21);
    mat(ctx, TX.oak, "oklch(0.9 0.02 60)");
    box(ctx, at(f, 0, 0, BAL.y), f.t, f.n, 1.4, 1.3, 0.42);
    ctx.albedo(null); ctx.roughness(0.85);
    let x = -0.62;
    while (x < 0.6) { const bw = 0.04 + ctx.random() * 0.04, bh = 0.22 + ctx.random() * 0.14; ctx.color(BOOKS[(ctx.random() * BOOKS.length) | 0]);
      box(ctx, at(f, x + bw / 2, -0.02, BAL.y + 1.3), f.t, f.n, bw, bh, 0.22); x += bw + 0.005; }
  }
}

export function geometry(ctx) {
  const L = ctx.lod;
  walls(ctx, L >= 5 ? "hull" : "full");
  roof(ctx, L);
  finial(ctx, L);
  if (L <= 4) { exterior(ctx, L); interior(ctx, L); }
  ctx.albedo(null); ctx.emissive(null);
}

export function collider(ctx) {
  walls(ctx, "collider");
  sector(ctx, 0, RI + 0.02, 0, 360, 0, 0.06, { top: 1 }, 18);
  sector(ctx, RO - 0.05, 6.4, 12, 348, 0, 0.45, { top: 1, outer: 1, ends: 1 }, 18);
  let f = frame(0, 6.55); box(ctx, f.c, f.t, f.n, 2.3, 0.12, 1.0);
  for (const s of [-1, 1]) { const g = frame(s * 10.9, RO); box(ctx, g.c, g.t, g.n, 0.34, 2.95, 0.42); }
  stairs(ctx, true);
  balcony(ctx, true);
  sector(ctx, 0, RI + 0.02, 0, 360, CEIL, CEIL, { bottom: 1, top: 1 }, 18);
  furnitureColliders(ctx);
  if (!ctx.params?.closed) for (const s of [-1, 1]) box(ctx, [s * 0.87, 0.06, RI - 0.47], [1, 0, 0], [0, 0, 1], 0.07, 2.7, 0.82);
}
const bench = bench_magesGuild({ BENCH, P, TX, add, at, box, candle, flameTip, frame, lathe, mat });
const table = table_magesGuild({ CANDLES, Q, TABLE, TX, UP, add, at, box, candle, frame, lathe, mat });
const shelf = shelf_magesGuild({ BOOKS, RI, TX, at, box, frame, mat });
