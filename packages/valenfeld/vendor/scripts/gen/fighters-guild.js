
import { banner_fightersGuild } from "../lib/pieces/banner.js";   // shared banner piece, drawn in this building's palette// The Fighters Guild hall: a long timber-and-fieldstone mead-hall, local origin = centre of the footprint on the ground.
// Long axis X (16 m), door in the south wall (+Z) under a gabled porch with the guild's shield sign; sparring ring in the east yard.
const TX = {
  stone: "cdn/texture-fieldstone-wall-mossy.png",
  oak: "cdn/texture-dark-oak-planks-weathered.png",
  plaster: "cdn/texture-limewash-plaster.png",
  slate: "cdn/texture-slate-roof-tiles-mossy.png",
  iron: "cdn/texture-wrought-iron.png",
  cloth: "cdn/texture-rust-red-wool-cloth.png",
  sand: "cdn/texture-packed-sand-dirt-ground.png",
  cobble: "cdn/texture-cobblestone-path-mossy.png",
  floor: "cdn/texture-oak-floorboards-worn.png",
};
const OAK = "oklch(0.93 0.02 70)", WHITE = "oklch(1 0 0)", OCHRE = "#c9a45a", RUST = "#a8452e";
const K = 5.2 / 6, NK = Math.sqrt(1 + K * K); // main roof pitch
const V = (x, y, z) => ({ x, y, z });
const add = (a, b) => V(a.x + b.x, a.y + b.y, a.z + b.z);
const sub = (a, b) => V(a.x - b.x, a.y - b.y, a.z - b.z);
const mul = (a, s) => V(a.x * s, a.y * s, a.z * s);
const crs = (a, b) => V(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);
const nrm = (a) => { const l = Math.hypot(a.x, a.y, a.z) || 1; return mul(a, 1 / l); };
const X = V(1, 0, 0), Y = V(0, 1, 0), Z = V(0, 0, 1);
const Q = (c, a, b, d, e) => c.quad(a.x, a.y, a.z, b.x, b.y, b.z, d.x, d.y, d.z, e.x, e.y, e.z);
const T = (c, a, b, d) => c.tri(a.x, a.y, a.z, b.x, b.y, b.z, d.x, d.y, d.z);
function obox(c, ctr, U, Vv, hu, hv, hw) {
  U = nrm(U); Vv = nrm(Vv); const W = nrm(crs(U, Vv));
  const p = (a, b, d) => add(add(add(ctr, mul(U, a * hu)), mul(Vv, b * hv)), mul(W, d * hw));
  Q(c, p(-1, -1, 1), p(1, -1, 1), p(1, 1, 1), p(-1, 1, 1));
  Q(c, p(1, -1, -1), p(-1, -1, -1), p(-1, 1, -1), p(1, 1, -1));
  Q(c, p(1, -1, 1), p(1, -1, -1), p(1, 1, -1), p(1, 1, 1));
  Q(c, p(-1, -1, -1), p(-1, -1, 1), p(-1, 1, 1), p(-1, 1, -1));
  Q(c, p(-1, 1, 1), p(1, 1, 1), p(1, 1, -1), p(-1, 1, -1));
  Q(c, p(-1, -1, -1), p(1, -1, -1), p(1, -1, 1), p(-1, -1, 1));
}
const box = (c, x0, y0, z0, x1, y1, z1) => obox(c, V((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2), X, Y, Math.abs(x1 - x0) / 2, Math.abs(y1 - y0) / 2, Math.abs(z1 - z0) / 2);
function beam(c, a, b, w, h, up = Y) {
  const D = nrm(sub(b, a)), L = Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z);
  let s = crs(up, D); if (Math.hypot(s.x, s.y, s.z) < 1e-4) s = crs(X, D); s = nrm(s);
  obox(c, mul(add(a, b), 0.5), s, crs(D, s), w / 2, h / 2, L / 2);
}
function cyl(c, a, b, r, n = 8, r2 = r, caps = true) {
  const D = nrm(sub(b, a)); const s = nrm(crs(D, Math.abs(D.y) < 0.9 ? Y : X)); const t = crs(D, s);
  const o = (i) => { const q = (i / n) * Math.PI * 2; return add(mul(s, Math.cos(q)), mul(t, Math.sin(q))); };
  c.smooth();
  for (let i = 0; i < n; i++) { const o0 = o(i), o1 = o(i + 1); Q(c, add(a, mul(o0, r)), add(a, mul(o1, r)), add(b, mul(o1, r2)), add(b, mul(o0, r2))); }
  c.flat();
  if (caps) for (let i = 0; i < n; i++) { const o0 = o(i), o1 = o(i + 1); T(c, b, add(b, mul(o0, r2)), add(b, mul(o1, r2))); T(c, a, add(a, mul(o1, r)), add(a, mul(o0, r))); }
}
function ext(c, O, U, Vv, pts, d) {
  U = nrm(U); Vv = nrm(Vv); const W = nrm(crs(U, Vv)); const n = pts.length;
  let ar = 0; for (let i = 0; i < n; i++) { const a = pts[i], b = pts[(i + 1) % n]; ar += a[0] * b[1] - b[0] * a[1]; }
  if (ar < 0) pts = [...pts].reverse();
  const P = (p, k) => add(add(add(O, mul(U, p[0])), mul(Vv, p[1])), mul(W, k));
  let cx = 0, cy = 0; for (const p of pts) { cx += p[0]; cy += p[1]; } const cc = [cx / n, cy / n];
  for (let i = 0; i < n; i++) { const a = pts[i], b = pts[(i + 1) % n]; T(c, P(cc, d), P(a, d), P(b, d)); T(c, P(cc, 0), P(b, 0), P(a, 0)); Q(c, P(a, 0), P(b, 0), P(b, d), P(a, d)); }
}
function lathe(c, cx, cz, prof, n) {
  c.smooth();
  for (let j = 0; j < prof.length - 1; j++) for (let i = 0; i < n; i++) {
    const p = (k, jj) => { const q = (k / n) * Math.PI * 2; return V(cx + Math.cos(q) * prof[jj][0], prof[jj][1], cz + Math.sin(q) * prof[jj][0]); };
    Q(c, p(i, j), p(i, j + 1), p(i + 1, j + 1), p(i + 1, j));
  }
  c.flat();
}
function wallX(c, x0, x1, y0, y1, z0, z1, holes) {
  const cuts = new Set([x0, x1]);
  for (const h of holes) for (const e of [h[0], h[1]]) if (e > x0 && e < x1) cuts.add(e);
  const cs = [...cuts].sort((a, b) => a - b);
  for (let i = 0; i < cs.length - 1; i++) {
    const a = cs[i], b = cs[i + 1], m = (a + b) / 2, h = holes.find((h) => m > h[0] && m < h[1]);
    if (!h) { box(c, a, y0, z0, b, y1, z1); continue; }
    if (h[2] > y0) box(c, a, y0, z0, b, Math.min(h[2], y1), z1);
    if (h[3] < y1) box(c, a, Math.max(h[3], y0), z0, b, y1, z1);
  }
}
const paint = (c, tex, col = WHITE) => { c.albedo(tex); c.color(col); };
const metal = (c, on) => { c.metalness(on ? 0.7 : null); c.roughness(on ? 0.4 : null); };

// ---- weapons ----
function sword(c, P, D, Wd, bl) {
  const Tn = nrm(crs(D, Wd));
  paint(c, TX.iron, "oklch(0.95 0.01 240)"); metal(c, true);
  obox(c, add(P, mul(D, bl / 2)), Wd, Tn, 0.034, 0.008, bl / 2);
  const tp = add(P, mul(D, bl)); T(c, add(tp, mul(Wd, 0.034)), add(tp, mul(Wd, -0.034)), add(P, mul(D, bl + 0.11)));
  obox(c, P, Wd, Tn, 0.14, 0.02, 0.022);
  obox(c, add(P, mul(D, -0.25)), Wd, Tn, 0.035, 0.035, 0.03);
  metal(c, false); paint(c, null, "oklch(0.32 0.05 45)");
  cyl(c, P, add(P, mul(D, -0.22)), 0.018, 6);
}
function axe(c, P, D, H) {
  const Tn = nrm(crs(D, H));
  paint(c, TX.oak, OAK); cyl(c, P, add(P, mul(D, 0.85)), 0.024, 6);
  paint(c, TX.iron, "oklch(0.9 0.01 240)"); metal(c, true);
  obox(c, add(add(P, mul(D, 0.1)), mul(H, 0.08)), H, D, 0.09, 0.06, 0.018);
  obox(c, add(add(P, mul(D, 0.1)), mul(H, 0.19)), H, D, 0.03, 0.14, 0.008);
  metal(c, false);
}
function spear(c, a, b, side) {
  paint(c, TX.oak, OAK); cyl(c, a, b, 0.022, 6);
  const D = nrm(sub(b, a)); const s2 = nrm(crs(D, side));
  paint(c, TX.iron, "oklch(0.92 0.01 240)"); metal(c, true);
  const mid = add(b, mul(D, 0.1)), tip = add(b, mul(D, 0.36));
  for (const s of [side, s2]) Q(c, b, add(mid, mul(s, 0.05)), tip, add(mid, mul(s, -0.05)));
  metal(c, false);
}
function roundShield(c, ctr, N, r, face, rim) {
  paint(c, null, face); cyl(c, ctr, add(ctr, mul(N, 0.05)), r, 16);
  paint(c, TX.iron, rim); metal(c, true);
  cyl(c, add(ctr, mul(N, 0.01)), add(ctr, mul(N, 0.065)), r + 0.02, 16, r + 0.02, false);
  cyl(c, add(ctr, mul(N, 0.05)), add(ctr, mul(N, 0.11)), 0.08, 10, 0.05);
  metal(c, false);
}
// ---- cloth ----

// ---- the hall ----
const WIN = { 1: [-4.4, 4.4], [-1]: [-6.8, 6.8] };
const POSTS = [-8, -5.6, -3.2, -0.95, 0.95, 3.2, 5.6, 8];
function gablePts() { return [[-6, 3.6], [6, 3.6], [6, 3.9], [0, 9.1], [-6, 3.9]]; }
function roofSlab(c, s, off, half, hx = 8.6, h0 = 0, h1 = 6.7) {
  const Nn = nrm(V(0, 1, s * K)); const hm = (h0 + h1) / 2;
  const ctr = add(V(0, 8.92 - hm * K, s * hm), mul(Nn, off));
  obox(c, ctr, V(s, 0, 0), Nn, hx, half, ((h1 - h0) * NK) / 2);
}
function porchSlab(c, s, off, half) {
  const Nn = nrm(V(s, 1, 0)); const ctr = add(V(s * 1.0, 3.7, (5.9 + 8.45) / 2), mul(Nn, off));
  obox(c, ctr, V(0, 0, -s), Nn, (8.45 - 5.9) / 2, half, Math.SQRT2);
}
const RING = { x: 11.7, z: -1, h: 2.5 };

export function geometry(ctx) {
  const L = ctx.lod;
  // ground pieces: floor, threshold, porch flags, cobble walk, sparring sand
  paint(ctx, TX.floor, "oklch(0.95 0.02 70)"); box(ctx, -7.5, 0, -5.45, 7.5, 0.12, 5.45);
  paint(ctx, TX.stone); box(ctx, -0.8, 0, 5.35, 0.8, 0.12, 6.15); box(ctx, -1.95, 0, 6.1, 1.95, 0.1, 8.45);
  if (L <= 3) { paint(ctx, TX.cobble); box(ctx, -1.1, 0, 8.45, 1.1, 0.05, 13.0); paint(ctx, TX.sand); box(ctx, RING.x - 2.9, 0, RING.z - 2.9, RING.x + 2.9, 0.04, RING.z + 2.9); }

  if (L >= 4) { // outline: walls as blocks, gables, roof, porch
    paint(ctx, TX.stone); box(ctx, -8.1, 0, -6.1, 8.1, 0.9, 6.1);
    paint(ctx, TX.plaster); box(ctx, -7.9, 0.9, -5.9, 7.9, 3.6, 5.9);
    for (const s of [1, -1]) { ext(ctx, V(s * 7.5, 0, 0), V(0, 0, -s), Y, gablePts(), 0.4); paint(ctx, TX.slate); roofSlab(ctx, s, 0.24, 0.09); paint(ctx, TX.plaster); }
    paint(ctx, TX.slate); for (const s of [1, -1]) porchSlab(ctx, s, 0.14, 0.07);
    paint(ctx, TX.oak, OAK); box(ctx, -1.72, 0.1, 7.88, 1.72, 3.15, 8.12);
    ctx.albedo(null); ctx.color(null); return;
  }

  // --- footing: lichen fieldstone, door gap in the south ---
  paint(ctx, TX.stone);
  for (const s of [1, -1]) {
    if (s === 1) { box(ctx, -8.1, 0, 5.35, -0.8, 0.9, 6.1); box(ctx, 0.8, 0, 5.35, 8.1, 0.9, 6.1); }
    else box(ctx, -8.1, 0, -6.1, 8.1, 0.9, -5.35);
    box(ctx, s * 7.35, 0, -6.1, s * 8.1, 0.9, 6.1);
    if (L <= 2) {
      paint(ctx, TX.stone, "oklch(0.9 0.01 90)");
      if (s === 1) { box(ctx, -8.16, 0.88, 5.3, -0.95, 0.98, 6.16); box(ctx, 0.95, 0.88, 5.3, 8.16, 0.98, 6.16); }
      else box(ctx, -8.16, 0.88, -6.16, 8.16, 0.98, -5.3);
      box(ctx, s * 7.3, 0.88, -6.16, s * 8.16, 0.98, 6.16);
      paint(ctx, TX.stone);
    }
  }
  // --- plaster panels ---
  paint(ctx, TX.plaster, "oklch(0.97 0.01 90)");
  for (const s of [1, -1]) {
    const holes = WIN[s].map((x) => [x - 0.45, x + 0.45, 1.5, 2.5]);
    if (s === 1) holes.push([-0.8, 0.8, 0, 2.6]);
    wallX(ctx, -7.9, 7.9, 0.9, 3.4, s * 5.5, s * 5.9, holes);
    box(ctx, s * 7.5, 0.9, -5.9, s * 7.9, 3.4, 5.9);
    ext(ctx, V(s * 7.5, 0, 0), V(0, 0, -s), Y, gablePts(), 0.4);
  }
  // --- oak frame ---
  paint(ctx, TX.oak, OAK);
  for (const s of [1, -1]) {
    const z0 = s * 5.45, z1 = s * 5.95;
    box(ctx, -8, 3.4, z0, 8, 3.6, z1); // top plate
    if (s === 1) { box(ctx, -8, 0.9, z0, -0.95, 1.1, z1); box(ctx, 0.95, 0.9, z0, 8, 1.1, z1); } else box(ctx, -8, 0.9, z0, 8, 1.1, z1);
    for (const x of POSTS) { const door = s === 1 && Math.abs(x) < 1; const hw = Math.abs(x) === 8 ? 0.22 : 0.15; box(ctx, x - hw, door ? 0.12 : 0.9, z0, x + hw, 3.4, z1); }
    if (s === 1) box(ctx, -0.95, 2.6, 5.42, 0.95, 2.86, 5.98); // door lintel
    // gable frame
    const x0 = s * 7.45, x1 = s * 7.95;
    box(ctx, x0, 3.4, -6, x1, 3.6, 6); box(ctx, x0, 0.9, -6, x1, 1.1, 6);
    for (const z of [-3, 0, 3]) box(ctx, x0, 0.9, z - 0.15, x1, 3.4, z + 0.15);
    for (const z of [-3, 3]) box(ctx, s * 7.88, 3.6, z - 0.12, s * 7.98, 3.9 + 3 * K - 0.05, z + 0.12);
    box(ctx, s * 7.88, 3.6, -0.13, s * 7.98, 9.0, 0.13);
    box(ctx, s * 7.88, 5.9, -3.45, s * 7.98, 6.1, 3.45);
    // windows: frame, glass, mullions, shutters
    for (const wx of WIN[s]) {
      paint(ctx, TX.oak, OAK);
      box(ctx, wx - 0.56, 1.38, s * 5.4, wx + 0.56, 1.5, s * 6.02);
      box(ctx, wx - 0.56, 2.5, s * 5.42, wx + 0.56, 2.64, s * 5.98);
      box(ctx, wx - 0.56, 1.5, s * 5.45, wx - 0.45, 2.5, s * 5.95); box(ctx, wx + 0.45, 1.5, s * 5.45, wx + 0.56, 2.5, s * 5.95);
      ctx.albedo(null); ctx.color("oklch(0.42 0.04 80)", 0.5); ctx.roughness(0.1);
      box(ctx, wx - 0.45, 1.5, s * 5.68, wx + 0.45, 2.5, s * 5.72); ctx.roughness(null);
      if (L <= 2) {
        paint(ctx, TX.iron, "oklch(0.7 0.01 240)");
        box(ctx, wx - 0.02, 1.5, s * 5.66, wx + 0.02, 2.5, s * 5.74); box(ctx, wx - 0.45, 1.98, s * 5.66, wx + 0.45, 2.02, s * 5.74);
        paint(ctx, TX.oak, "oklch(0.9 0.03 60)");
        box(ctx, wx - 1.02, 1.5, s * 5.95, wx - 0.58, 2.5, s * 6.0); box(ctx, wx + 0.58, 1.5, s * 5.95, wx + 1.02, 2.5, s * 6.0);
      }
    }
    paint(ctx, TX.oak, OAK);
    if (L <= 1) { // braces on the outer face
      if (s === 1) for (const m of [1, -1]) beam(ctx, V(m * 7.8, 1.15, 5.93), V(m * 5.8, 3.35, 5.93), 0.16, 0.08, V(0, 0, 1));
      else for (const m of [1, -1]) beam(ctx, V(m * 1.15, 1.15, -5.93), V(m * 3.0, 3.35, -5.93), 0.16, 0.08, V(0, 0, 1));
      for (const m of [1, -1]) beam(ctx, V(s * 7.97, 1.15, m * 5.75), V(s * 7.97, 3.35, m * 3.2), 0.16, 0.08, X);
      for (const m of [1, -1]) beam(ctx, V(s * 7.93, 3.7, m * 2.9), V(s * 7.93, 5.9, m * 0.2), 0.14, 0.08, X);
    }
  }
  // --- roof: oak decking under, mossy slate over, shingle lips, ridge cap ---
  for (const s of [1, -1]) {
    paint(ctx, TX.oak, "oklch(0.9 0.02 70)"); roofSlab(ctx, s, 0.13, 0.02);
    paint(ctx, TX.slate); roofSlab(ctx, s, 0.24, 0.09);
    if (L <= 1) {
      const Nn = nrm(V(0, 1, s * K)), D = nrm(V(0, -K, s));
      for (let d = 0.5; d < 6.7 * NK; d += 0.42) { const p = add(add(V(0, 8.92, 0), mul(D, d)), mul(Nn, 0.355)); obox(ctx, p, V(s, 0, 0), Nn, 8.6, 0.025, 0.07); }
    }
  }
  paint(ctx, TX.slate, "oklch(0.9 0.01 200)"); box(ctx, -8.7, 9.2, -0.22, 8.7, 9.45, 0.22);
  // smoke louver over the hearth
  paint(ctx, TX.oak, OAK); box(ctx, -1.2, 9.3, -0.45, 1.2, 9.8, 0.45);
  paint(ctx, TX.slate); box(ctx, -1.35, 9.8, -0.62, 1.35, 9.94, 0.62);
  // --- exposed structure inside ---
  paint(ctx, TX.oak, OAK);
  box(ctx, -8.3, 8.55, -0.13, 8.3, 8.85, 0.13); // ridge beam
  for (const x of [-5.6, -3.2, 3.2, 5.6]) {
    box(ctx, x - 0.15, 3.6, -5.95, x + 0.15, 3.92, 5.95);
    box(ctx, x - 0.12, 3.92, -0.12, x + 0.12, 8.55, 0.12);
    if (L <= 2) for (const m of [1, -1]) beam(ctx, V(x, 4.8, m * 0.1), V(x, 8.92 - 3 * K - 0.12, m * 3), 0.16, 0.16, X);
  }
  if (L <= 2) {
    const step = L <= 1 ? 0.8 : 1.6;
    for (const s of [1, -1]) { const Nn = nrm(V(0, 1, s * K)); for (let x = -8.4; x <= 8.41; x += step) beam(ctx, V(x, 8.92 + 0.05 * K, -s * 0.05), V(x, 8.92 - 6.6 * K, s * 6.6), 0.14, 0.22, Nn); }
  }
  // --- long hearth ---
  paint(ctx, TX.stone, "oklch(0.92 0.01 80)");
  box(ctx, -2.3, 0.12, -0.75, 2.3, 0.42, -0.45); box(ctx, -2.3, 0.12, 0.45, 2.3, 0.42, 0.75);
  box(ctx, -2.3, 0.12, -0.45, -2.0, 0.42, 0.45); box(ctx, 2.0, 0.12, -0.45, 2.3, 0.42, 0.45);
  paint(ctx, null, "oklch(0.24 0.01 50)"); box(ctx, -2.0, 0.12, -0.45, 2.0, 0.18, 0.45);
  ctx.emissive("oklch(0.55 0.17 45)"); paint(ctx, null, "oklch(0.3 0.05 40)"); box(ctx, -1.75, 0.18, -0.33, 1.75, 0.2, 0.33); ctx.emissive(null);
  paint(ctx, TX.oak, "oklch(0.5 0.02 50)");
  cyl(ctx, V(-1.6, 0.28, -0.15), V(1.5, 0.27, -0.12), 0.1, 8); cyl(ctx, V(-1.4, 0.28, 0.17), V(1.7, 0.26, 0.13), 0.1, 8);
  cyl(ctx, V(-0.9, 0.44, 0.0), V(0.9, 0.42, 0.04), 0.085, 8);
  if (L <= 1) {
    paint(ctx, TX.iron, "oklch(0.6 0.01 240)"); metal(ctx, true);
    for (const m of [1, -1]) cyl(ctx, V(m * 2.15, 0.42, 0), V(m * 2.15, 1.0, 0), 0.03, 6);
    cyl(ctx, V(-2.25, 0.98, 0), V(2.25, 0.98, 0), 0.022, 6); metal(ctx, false);
  }
  // --- walls inside: racks, shields, banners, benches, candles ---
  if (L <= 2) {
    paint(ctx, TX.oak, OAK);
    for (const m of [-1, 1]) box(ctx, m * 1.6, 1.95, -5.45, m * 3.6, 2.1, -5.33);
    for (const x of [-3.3, -2.6, -1.9, 3.25]) sword(ctx, V(x, 1.88, -5.28), V(0, -1, 0), X, 0.82);
    for (const x of [1.95, 2.6]) axe(ctx, V(x, 2.15, -5.28), V(0, -1, 0), X);
    // west gable: axes, shields, crossed spears
    paint(ctx, TX.oak, OAK); box(ctx, -7.45, 1.35, -1.8, -7.33, 1.5, 1.8);
    spear(ctx, V(-7.4, 1.6, -1.05), V(-7.4, 3.3, 1.0), X); spear(ctx, V(-7.4, 1.6, 1.05), V(-7.4, 3.3, -1.0), X);
    [-1.4, -0.5, 0.5, 1.4].forEach((z, i) => axe(ctx, V(-7.28, 1.62, z), V(0, -1, 0), V(0, 0, i % 2 ? 1 : -1)));
    [[-2.4, RUST, OCHRE], [0, OCHRE, RUST], [2.4, RUST, OCHRE]].forEach(([z, f, r]) => roundShield(ctx, V(-7.44, 2.45, z), X, 0.38, f, "oklch(0.85 0.01 240)"));
    // east gable: spear rack and a shield above
    paint(ctx, TX.oak, OAK);
    box(ctx, 7.1, 0.12, -2.1, 7.45, 0.32, 2.1); box(ctx, 7.3, 1.7, -2.1, 7.45, 1.82, 2.1);
    for (const m of [-1, 1]) box(ctx, 7.32, 0.12, m * 2.1 - 0.05, 7.45, 1.82, m * 2.1 + 0.05);
    for (let z = -1.8; z <= 1.81; z += 0.6) spear(ctx, V(7.22, 0.22, z), V(7.36, 2.7, z), Z);
    roundShield(ctx, V(7.44, 3.0, 0), V(-1, 0, 0), 0.42, RUST, "oklch(0.85 0.01 240)");
    // benches along the north wall
    paint(ctx, TX.oak, OAK);
    for (const m of [-1, 1]) {
      box(ctx, m * 4.2, 0.42, -5.3, m * 7.2, 0.5, -4.85);
      for (const x of [4.4, 7.0]) box(ctx, m * x - 0.06, 0.12, -5.25, m * x + 0.06, 0.42, -4.9);
    }
    // candle sconces flanking Brannoc's banner
    for (const m of [-1, 1]) {
      paint(ctx, TX.iron, "oklch(0.6 0.01 240)"); box(ctx, m * 0.9 - 0.06, 1.9, -5.45, m * 0.9 + 0.06, 2.1, -5.4); box(ctx, m * 0.9 - 0.07, 1.98, -5.42, m * 0.9 + 0.07, 2.0, -5.26);
      paint(ctx, null, "oklch(0.93 0.03 90)"); cyl(ctx, V(m * 0.9, 2.0, -5.34), V(m * 0.9, 2.16, -5.34), 0.025, 6);
      ctx.emissive("oklch(0.9 0.16 70)"); paint(ctx, null, "oklch(0.95 0.1 80)");
      const fp = V(m * 0.9, 2.17, -5.34); Q(ctx, add(fp, V(-0.015, 0.02, 0)), add(fp, V(0, 0, 0)), add(fp, V(0.015, 0.02, 0)), add(fp, V(0, 0.07, 0))); Q(ctx, add(fp, V(0, 0.02, -0.015)), add(fp, V(0, 0, 0)), add(fp, V(0, 0.02, 0.015)), add(fp, V(0, 0.07, 0)));
      ctx.emissive(null);
    }
  }
  banner(ctx, V(0, 3.25, -5.36), Z, X, 1.1, 2.1, 0.02);
  for (const x of [-3.2, 3.2]) for (const z of [-2.6, 2.6]) banner(ctx, V(x, 3.57, z), X, Z, 0.7, 1.0, 0.03, false);
  for (const m of [-1, 1]) {
    banner(ctx, V(m * 2.6, 3.2, 6.1), Z, X, 0.75, 1.7, 0.03);
    paint(ctx, TX.iron, "oklch(0.7 0.01 240)"); box(ctx, m * 2.6 - 0.03, 3.2, 5.95, m * 2.6 + 0.03, 3.26, 6.15);
  }
  // --- porch ---
  paint(ctx, TX.stone); for (const m of [-1, 1]) box(ctx, m * 1.6 - 0.2, 0.1, 7.8, m * 1.6 + 0.2, 0.22, 8.2);
  paint(ctx, TX.oak, OAK);
  for (const m of [-1, 1]) { box(ctx, m * 1.6 - 0.12, 0.22, 7.88, m * 1.6 + 0.12, 2.95, 8.12); box(ctx, m * 1.6 - 0.1, 2.95, 5.95, m * 1.6 + 0.1, 3.15, 8.15); }
  box(ctx, -1.85, 2.95, 7.85, 1.85, 3.15, 8.15);
  if (L <= 2) for (const m of [-1, 1]) { beam(ctx, V(m * 1.6, 2.35, 8.0), V(m * 0.95, 3.0, 8.0), 0.12, 0.12, Z); beam(ctx, V(m * 1.6, 2.35, 8.0), V(m * 1.6, 3.0, 7.35), 0.12, 0.12, X); }
  paint(ctx, TX.plaster, "oklch(0.97 0.01 90)"); ext(ctx, V(0, 0, 7.92), X, Y, [[-1.75, 3.15], [1.75, 3.15], [0, 4.72]], 0.12);
  paint(ctx, TX.oak, "oklch(0.88 0.02 70)"); for (const s of [1, -1]) porchSlab(ctx, s, 0.08, 0.02);
  paint(ctx, TX.slate); for (const s of [1, -1]) porchSlab(ctx, s, 0.17, 0.07);
  paint(ctx, TX.slate, "oklch(0.9 0.01 200)"); box(ctx, -0.18, 4.82, 5.9, 0.18, 5.0, 8.55);
  // the sign: crossed swords behind a heater shield
  sword(ctx, V(-0.5, 3.24, 8.17), nrm(V(0.62, 1, 0)), nrm(V(1, -0.62, 0)), 1.0);
  sword(ctx, V(0.5, 3.24, 8.19), nrm(V(-0.62, 1, 0)), nrm(V(1, 0.62, 0)), 1.0);
  const sh = [[-0.36, 0.32], [0.36, 0.32], [0.36, 0.0], [0.25, -0.28], [0, -0.45], [-0.25, -0.28], [-0.36, 0.0]];
  paint(ctx, TX.iron, "oklch(0.8 0.01 240)"); metal(ctx, true); ext(ctx, V(0, 3.66, 8.21), X, Y, sh, 0.05); metal(ctx, false);
  paint(ctx, null, RUST); ext(ctx, V(0, 3.66, 8.26), X, Y, sh.map(([u, v]) => [u * 0.86, v * 0.86 - 0.01]), 0.015);
  paint(ctx, null, OCHRE); ext(ctx, V(0, 3.66, 8.275), X, Y, [[-0.26, -0.02], [0, 0.18], [0.26, -0.02], [0.26, -0.13], [0, 0.07], [-0.26, -0.13]].slice(0, 3).concat([[0.2, -0.1], [0, 0.07], [-0.2, -0.1]]), 0.01);
  if (L <= 2) for (const m of [-1, 1]) { // porch lanterns
    paint(ctx, TX.iron, "oklch(0.55 0.01 240)"); box(ctx, m * 1.6 - 0.02, 2.62, 7.6, m * 1.6 + 0.02, 2.66, 7.88); box(ctx, m * 1.6 - 0.1, 2.3, 7.4, m * 1.6 + 0.1, 2.34, 7.6); box(ctx, m * 1.6 - 0.11, 2.5, 7.39, m * 1.6 + 0.11, 2.56, 7.61);
    ctx.emissive("oklch(0.85 0.14 70)"); paint(ctx, null, "oklch(0.95 0.08 80)"); box(ctx, m * 1.6 - 0.08, 2.34, 7.42, m * 1.6 + 0.08, 2.5, 7.58); ctx.emissive(null);
  }
  // --- sparring ring: posts, sagging ropes (open on the south), practice barrel ---
  const rp = [];
  for (const [ix, iz] of [[-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1], [1, 0], [1, 1]]) rp.push(V(RING.x + ix * RING.h, 0, RING.z + iz * RING.h));
  paint(ctx, TX.oak, OAK); for (const p of rp) { cyl(ctx, p, add(p, V(0, 1.35, 0)), 0.09, 8); paint(ctx, TX.iron, "oklch(0.6 0.01 240)"); cyl(ctx, add(p, V(0, 1.35, 0)), add(p, V(0, 1.42, 0)), 0.1, 8); paint(ctx, TX.oak, OAK); }
  paint(ctx, null, "oklch(0.72 0.06 80)");
  for (let i = 0; i < rp.length - 1; i++) for (const hy of [0.62, 1.1]) {
    const a = add(rp[i], V(0, hy, 0)), b = add(rp[i + 1], V(0, hy, 0)), segs = L <= 1 ? 4 : 2; let prev = a;
    for (let k = 1; k <= segs; k++) { const t = k / segs; const p = add(add(a, mul(sub(b, a), t)), V(0, -0.1 * 4 * t * (1 - t), 0)); cyl(ctx, prev, p, 0.022, 5, 0.022, false); prev = p; }
  }
  if (L <= 2) {
    const bx = RING.x + 3.3, bz = RING.z + 2.2;
    paint(ctx, TX.oak, OAK); lathe(ctx, bx, bz, [[0.28, 0], [0.33, 0.25], [0.35, 0.45], [0.33, 0.65], [0.28, 0.85]], 12);
    paint(ctx, TX.iron, "oklch(0.6 0.01 240)"); for (const y of [0.15, 0.7]) cyl(ctx, V(bx, y, bz), V(bx, y + 0.05, bz), 0.335, 12, 0.335, false);
    paint(ctx, TX.oak, "oklch(0.95 0.04 80)"); for (const [dx, dz, lx, lz] of [[0.1, 0, 0.2, 0.1], [-0.12, 0.05, -0.25, 0.05], [0, -0.12, 0.05, -0.28]]) beam(ctx, V(bx + dx, 0.2, bz + dz), V(bx + lx, 1.35, bz + lz), 0.05, 0.03);
  }
  ctx.albedo(null); ctx.color(null);
}

export function collider(ctx) {
  // walls (door gap), gables, floor, porch, hearth, roof, posts
  box(ctx, -8.1, 0, 5.35, -0.8, 3.6, 6.1); box(ctx, 0.8, 0, 5.35, 8.1, 3.6, 6.1); box(ctx, -0.8, 2.6, 5.35, 0.8, 3.6, 6.1);
  box(ctx, -8.1, 0, -6.1, 8.1, 3.6, -5.35);
  for (const s of [1, -1]) { box(ctx, s * 7.35, 0, -6.1, s * 8.1, 3.6, 6.1); ext(ctx, V(s * 7.5, 0, 0), V(0, 0, -s), Y, gablePts(), 0.4); roofSlab(ctx, s, 0.2, 0.13); porchSlab(ctx, s, 0.14, 0.07); }
  box(ctx, -7.5, 0, -5.45, 7.5, 0.12, 5.45); box(ctx, -0.8, 0, 5.35, 0.8, 0.12, 6.15); box(ctx, -1.95, 0, 6.1, 1.95, 0.1, 8.45);
  box(ctx, -2.3, 0, -0.75, 2.3, 0.6, 0.75);
  for (const x of [-5.6, -3.2, 3.2, 5.6]) box(ctx, x - 0.15, 3.6, -5.95, x + 0.15, 3.92, 5.95);
  for (const m of [-1, 1]) { box(ctx, m * 1.6 - 0.14, 0, 7.86, m * 1.6 + 0.14, 3.15, 8.14); box(ctx, m * 4.2, 0, -5.3, m * 7.2, 0.5, -4.85); }
  box(ctx, 7.1, 0, -2.1, 7.45, 1.82, 2.1);
  for (const [ix, iz] of [[-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1], [1, 0], [1, 1]]) { const x = RING.x + ix * RING.h, z = RING.z + iz * RING.h; box(ctx, x - 0.1, 0, z - 0.1, x + 0.1, 1.42, z + 0.1); }
  box(ctx, RING.x + 3.3 - 0.35, 0, RING.z + 2.2 - 0.35, RING.x + 3.3 + 0.35, 0.85, RING.z + 2.2 + 0.35);
}
const banner = banner_fightersGuild({ OCHRE, Q, TX, WHITE, Y, add, cyl, metal, mul, paint });
