// The Footprint Tax House: House Thalor's ruined beach toll hut on the Gullhaven shore (concept: art-footprint-tax-house).
// A 6 x 4.5 m fieldstone hut, its slate roof half fallen in, a striped toll pole across the beach path,
// the tariff board painted with rows of footprints and the coins each step cost, an iron coin box,
// driftwood and a line of fresh bare footprints that walk straight past without paying.
// Local frame: hut door on the -Z face (toward the sea); the beach path runs along X.
import { G, rng, TEX, mossyRock } from "../lib/geo.js";
const HW = 3, HD = 2.25, T = 0.5, WH = 2.6;                        // my picks
const yawM = (a) => [Math.cos(a), 0, Math.sin(a), 0, 1, 0, -Math.sin(a), 0, Math.cos(a)];
const WALLS = [ // x0,z0,x1,z1, openings [t0,t1,sill,lintel], top height fn
  [-HW, -HD, HW, -HD, [[0.4, 0.62, 0, 2.0]], (t) => WH - (t > 0.7 ? (t - 0.7) * 3 : 0)],
  [-HW, HD, HW, HD, [], (t) => WH - (t > 0.6 ? (t - 0.6) * 2.2 : 0)],
  [-HW, -HD, -HW, HD, [[0.35, 0.6, 1.0, 1.8]], () => WH],
  [HW, -HD, HW, HD, [[0.2, 0.45, 1.0, 1.7]], (t) => 1.4 + 0.6 * Math.sin(t * 7)],
];
export function geometry(ctx) {
  const g = new G(ctx), lod = ctx.lod || 1, R = rng(4417);
  if (lod >= 5) { ctx.color("oklch(0.55 0.012 80)"); g.box(0, WH / 2, 0, HW * 2, WH, HD * 2); ctx.color(null); return; }
  const step = lod <= 1 ? 0.5 : lod <= 3 ? 1 : 2;
  for (const [x0, z0, x1, z1, open, top] of WALLS) {
    const L = Math.hypot(x1 - x0, z1 - z0), n = Math.max(2, Math.round(L / step)), ax = Math.abs(x1 - x0) > 0.1;
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n, h = top(t) + (R() - 0.5) * 0.25, x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t, seg = L / n + 0.02;
      const hole = open.find(([a, b]) => t > a && t < b);
      const spans = hole ? [[-0.3, hole[2]], [Math.min(h, hole[3]), h]] : [[-0.3, h]];
      ctx.albedo(TEX.fieldstone); ctx.color("oklch(0.88 0.015 95)");
      for (const [y0, y1] of spans) if (y1 - y0 > 0.05) g.box(x, (y0 + y1) / 2, z, ax ? seg : T, y1 - y0, ax ? T : seg);
    }
  }
  // the west gable, still whole to the ridge
  ctx.albedo(TEX.fieldstone); ctx.color("oklch(0.85 0.015 95)");
  for (const s of [-1, 1]) { const x = -HW + s * T / 2; g.tri([x, WH, -HD], [x, WH, HD], [x, 4.1, 0]); g.tri([x, WH, HD], [x, WH, -HD], [x, 4.1, 0]); }
  g.box(-HW, 3.3, 0, T, 0.01, 0.01);
  // door frame and lintel, silvered oak
  ctx.albedo(TEX.oak); ctx.color("oklch(0.75 0.01 80)");
  const d0 = -HW + 0.4 * HW * 2, d1 = -HW + 0.62 * HW * 2;
  g.box(d0 + 0.08, 1.0, -HD, 0.16, 2.0, T + 0.06); g.box(d1 - 0.08, 1.0, -HD, 0.16, 2.0, T + 0.06); g.box((d0 + d1) / 2, 2.08, -HD, d1 - d0 + 0.4, 0.18, T + 0.1);
  // the back roof slope, half its slates still on, mossy; ridge beam snapped at its middle
  ctx.albedo(TEX.slate); ctx.color("oklch(0.8 0.03 130)");
  const run = Math.hypot(HD + 0.4, 4.1 - WH + 0.2), pit = Math.atan2(4.1 - WH + 0.2, HD + 0.4);
  g.at({ m: [1, 0, 0, 0, Math.cos(pit), Math.sin(pit), 0, -Math.sin(pit), Math.cos(pit)], t: [-1.3, (4.1 + WH - 0.2) / 2, (HD + 0.4) / 2] }, () => g.box(0, 0, 0, 3.9, 0.12, run));
  ctx.albedo(TEX.oak); ctx.color("oklch(0.45 0.02 60)");
  g.box(-2.0, 4.12, 0, 2.2, 0.2, 0.2);
  g.at({ m: [0.85, -0.53, 0, 0.53, 0.85, 0, 0, 0, 1], t: [0.6, 3.2, 0] }, () => g.box(0, 0, 0, 2.6, 0.18, 0.18)); // the broken half, sagging
  // fallen front rafters leaning in through the gap
  for (const [x, z, yaw, p] of [[-0.6, -0.8, 0.2, 0.7], [0.7, -0.3, -0.25, 0.8], [1.9, 0.6, 0.1, 0.55], [-1.6, -1.2, -0.1, 0.9]]) {
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(p), sp = Math.sin(p);
    g.at({ m: [cy, -sy * sp, sy * cp, 0, cp, sp, -sy, -cy * sp, cy * cp], t: [x, 1.3, z] }, () => g.box(0, 0, 0, 0.14, 0.14, 3.2));
  }
  // slate and rubble heaped inside
  if (lod <= 3) for (let i = 0; i < (lod <= 1 ? 14 : 6); i++) { const k = 0.22 + R() * 0.3;
    mossyRock(g, [(R() - 0.5) * (HW * 2 - 1.2), 0.0, (R() - 0.5) * (HD * 2 - 1.0)], [k * 1.4, k * 0.5, k], R() * 3, 500 + i, { rock: TEX.rock, moss: TEX.moss, floor: -0.4 }); }
  // the toll gate across the beach path: two posts, a counterweighted pole striped red and white
  const GX = 6.5;
  ctx.albedo(TEX.oak); ctx.color("oklch(0.72 0.02 110)");
  g.box(GX, 0.75, 2.4, 0.34, 1.9, 0.34); g.box(GX, 0.55, -3.4, 0.28, 1.4, 0.28);
  g.box(GX + 0.3, 0.4, -2.9, 0.12, 1.1, 0.12);                                     // the brace
  ctx.albedo(TEX.iron); ctx.color("oklch(0.45 0.06 45)"); g.box(GX, 1.35, 2.4, 0.42, 0.2, 0.42);  // the hinge strap, rusted
  const segs = 8, z0 = 2.9, z1 = -3.6, sl = (z0 - z1) / segs;
  for (let i = 0; i < segs; i++) { ctx.albedo(TEX.oak); ctx.color(i % 2 ? "oklch(0.86 0.01 90)" : "oklch(0.48 0.13 28)");
    g.box(GX, 1.3 - i * 0.02, z0 - (i + 0.5) * sl, 0.18, 0.18, sl + 0.01); }
  ctx.albedo(TEX.rock); ctx.color("oklch(0.6 0.01 80)"); g.box(GX, 1.3, 3.3, 0.4, 0.4, 0.5);    // counterweight stone
  // the tariff board: rows of painted bare feet, and the coins each row of steps cost
  const BX = 8.0, BZ = -4.4;
  g.at({ m: yawM(-0.35), t: [BX, 0, BZ] }, () => {
    ctx.albedo(TEX.oak); ctx.color("oklch(0.58 0.03 60)");
    g.box(0, 1.35, 0, 1.0, 2.7, 0.14);
    if (lod <= 2) {
      ctx.albedo(null); ctx.color("oklch(0.93 0.01 90)");
      for (let r = 0; r < 4; r++) { const y = 2.35 - r * 0.42;
        for (let f = 0; f <= r; f++) { const fx = -0.38 + f * 0.11; g.box(fx, y, -0.075, 0.06, 0.14, 0.01); g.box(fx, y + 0.1, -0.075, 0.05, 0.04, 0.01); }
        g.box(0.08, y, -0.075, 0.1, 0.02, 0.01);
        ctx.color("oklch(0.6 0.12 50)");
        for (let c = 0; c < r + 1; c++) g.box(0.24 + (c % 3) * 0.09, y + 0.06 - Math.floor(c / 3) * 0.09, -0.075, 0.07, 0.07, 0.01);
        ctx.color("oklch(0.93 0.01 90)"); }
      ctx.color("oklch(0.48 0.13 28)"); g.box(0, 2.6, -0.075, 0.8, 0.06, 0.01);
    }
    // the iron coin box, slot on top, padlock hanging open
    ctx.albedo(TEX.iron); ctx.color("oklch(0.42 0.07 45)");
    g.box(0, 0.75, -0.3, 0.6, 0.5, 0.42); g.box(0, 1.01, -0.3, 0.64, 0.04, 0.46);
    ctx.color("oklch(0.2 0.01 60)"); g.box(0, 1.035, -0.3, 0.3, 0.01, 0.04);
    ctx.color("oklch(0.5 0.06 70)"); g.box(0.12, 0.6, -0.52, 0.1, 0.12, 0.03);
    ctx.albedo(TEX.oak); ctx.color("oklch(0.58 0.03 60)"); g.box(0, 0.25, -0.3, 0.2, 0.5, 0.2);
  });
  // driftwood logs washed up along the hut's seaward side
  ctx.albedo(TEX.log); ctx.color("oklch(0.82 0.01 80)");
  for (const [x, z, a, L, r] of [[-5.2, -3.6, 0.3, 4.2, 0.22], [-3.6, -4.6, -0.2, 3.0, 0.17], [2.8, -5.8, 1.1, 2.4, 0.15], [-7.0, -1.0, 1.4, 3.4, 0.2]]) {
    g.at({ m: yawM(a), t: [x, r * 0.8, z] }, () => g.tube([[-L / 2, 0, 0, r], [0, 0.02, 0, r * 1.1], [L / 2, 0, 0, r * 0.7]].map(([px, py, pz, pr]) => [px, py, pz, pr]).map(([px, py, pz, pr]) => [0, py, px, pr]).map(([a1, b1, c1, d1]) => [c1, b1, a1, d1]), 7, { capA: true, capB: true }));
  }
  // a line of bare footprints walking straight past the gate, end of the pole, never paying
  if (lod <= 2) { ctx.albedo(null); ctx.color("oklch(0.42 0.04 75)");
    for (let i = 0; i < 26; i++) { const x = -12 + i * 0.85, z = -5.0 + Math.sin(i * 0.35) * 0.5 + (i % 2 ? 0.16 : -0.16);
      g.box(x, 0.02, z, 0.26, 0.02, 0.11); g.box(x + 0.15, 0.02, z, 0.05, 0.02, 0.09); } }
  // shore stones, wrack-dark
  if (lod <= 3) for (let i = 0; i < (lod <= 1 ? 10 : 4); i++) { const k = 0.3 + R() * 0.5;
    mossyRock(g, [-10 + R() * 22, 0, -7 - R() * 4], [k * 1.3, k * 0.6, k], R() * 3, 700 + i, { rock: TEX.rock, moss: null, rockTint: "oklch(0.45 0.02 90)", floor: -0.4 }); }
  ctx.albedo(null); ctx.color(null);
}
export function collider() {
  const out = [];
  for (const [x0, z0, x1, z1, open] of WALLS) {
    const ax = Math.abs(x1 - x0) > 0.1, L = Math.hypot(x1 - x0, z1 - z0), door = z0 === -HD && z1 === -HD ? open[0] : null;
    for (const [a, b] of door ? [[0, door[0]], [door[1], 1]] : [[0, 1]]) { const t = (a + b) / 2, len = (b - a) * L;
      out.push({ kind: "box", width: ax ? len : T, height: 2.4, depth: ax ? T : len, center: [x0 + (x1 - x0) * t, 1.2, z0 + (z1 - z0) * t] }); }
  }
  out.push({ kind: "box", width: 0.34, height: 1.9, depth: 0.34, center: [6.5, 0.95, 2.4] });
  out.push({ kind: "box", width: 0.28, height: 1.4, depth: 0.28, center: [6.5, 0.7, -3.4] });
  out.push({ kind: "box", width: 1.0, height: 2.7, depth: 0.6, center: [8.0, 1.35, -4.5] });
  return out;
}
