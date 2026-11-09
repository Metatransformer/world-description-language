// The Excise House: Aurenmar's burned customs post on the shore (concept: art-aur-excise-house).
// A roofless fieldstone shell, 9 x 6 m, its walls burned and broken to ragged heights, one gable
// still standing; charred rafters fallen in, rubble and ash on the floor, a toppled tariff board
// with the scales on it, a burnt cart, scorched barrels and ledger pages blown across the sand.
// Local frame: door on the -Z face.
import { G, rng, TEX, mossyRock } from "../lib/geo.js";
const HW = 4.5, HD = 3, T = 0.6;                                   // half width, half depth, wall thickness (my picks)
const CHAR = "oklch(0.32 0.01 60)", SOOT = "oklch(0.62 0.01 70)";
// height of the broken wall at a point along its run (0..1): a gable peak on the west end, ragged elsewhere
function wallTop(face, t, n) {
  if (face === "W") return 3.2 + 2.2 * (1 - Math.abs(t - 0.5) * 2);           // the standing gable
  const base = face === "S" ? 2.6 : face === "N" ? 1.9 : 1.3;
  const fall = face === "S" ? 1 - 0.55 * t : face === "N" ? 0.7 + 0.5 * Math.sin(t * 5) : 1 - 0.6 * t;
  return Math.max(0.5, base * fall + n * 0.5);
}
const FACES = [ // name, x0,z0 → x1,z1, openings [t0,t1,sill,lintel]
  ["S", -HW, -HD, HW, -HD, [[0.44, 0.6, 0, 2.2], [0.12, 0.24, 1.0, 1.9], [0.76, 0.86, 1.0, 1.9]]],
  ["N", -HW, HD, HW, HD, [[0.3, 0.42, 1.0, 1.9]]],
  ["W", -HW, -HD, -HW, HD, [[0.4, 0.6, 1.1, 2.0]]],
  ["E", HW, -HD, HW, HD, []],
];
export function geometry(ctx) {
  const g = new G(ctx), lod = ctx.lod || 1, R = rng(7311);
  if (lod >= 5) { ctx.color("oklch(0.5 0.012 80)");
    g.box(0, 1, -HD, HW * 2, 2, T); g.box(0, 0.8, HD, HW * 2, 1.6, T); g.box(-HW, 2.2, 0, T, 4.4, HD * 2); g.box(HW, 0.6, 0, T, 1.2, HD * 2); ctx.color(null); return; }
  const step = lod <= 1 ? 0.45 : lod <= 3 ? 0.9 : 1.8;
  // walls: columns of fieldstone, scorched dark toward their broken tops
  for (const [face, x0, z0, x1, z1, open] of FACES) {
    const L = Math.hypot(x1 - x0, z1 - z0), n = Math.max(2, Math.round(L / step)), ax = Math.abs(x1 - x0) > 0.1;
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n, top = wallTop(face, t, R() - 0.5), seg = L / n + 0.02;
      const x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t;
      const hole = open.find(([a, b]) => t > a && t < b);
      const spans = hole ? [[-0.2, hole[2]], [Math.min(top, hole[3]), top]] : [[-0.2, top]];
      for (const [y0, y1] of spans) {
        if (y1 - y0 < 0.05) continue;
        const ys = y1 - y0 > 1.4 ? y1 - 0.9 : y1;                             // a sooted band at the top
        ctx.albedo(TEX.fieldstone); ctx.color("oklch(0.9 0.012 80)");
        g.box(x, (y0 + ys) / 2, z, ax ? seg : T, ys - y0, ax ? T : seg);
        if (ys < y1) { ctx.color(SOOT); g.box(x, (ys + y1) / 2, z, ax ? seg : T, y1 - ys, ax ? T : seg); }
      }
      if (hole && hole[2] > 0 && lod <= 2) { ctx.albedo(TEX.flag); ctx.color("oklch(0.8 0.01 80)"); g.box(x, hole[2] + 0.04, z, ax ? seg : T + 0.12, 0.08, ax ? T + 0.12 : seg); } // sills
    }
  }
  // the door frame: charred oak jambs and lintel, a chalked mark on the east jamb
  ctx.albedo(TEX.oak); ctx.color(CHAR);
  const dx0 = -HW + 0.44 * HW * 2, dx1 = -HW + 0.6 * HW * 2;
  g.box(dx0 + 0.08, 1.1, -HD, 0.16, 2.2, T + 0.06); g.box(dx1 - 0.08, 1.1, -HD, 0.16, 2.2, T + 0.06); g.box((dx0 + dx1) / 2, 2.3, -HD, dx1 - dx0 + 0.5, 0.22, T + 0.1);
  if (lod <= 2) { ctx.albedo(null); ctx.color("oklch(0.95 0.01 90)"); ctx.emissive?.("oklch(0.6 0 0)", 0.15);
    g.box(dx1 + 0.22, 1.5, -HD - T / 2 - 0.01, 0.04, 0.5, 0.01); g.box(dx1 + 0.22, 1.6, -HD - T / 2 - 0.01, 0.3, 0.04, 0.01); g.box(dx1 + 0.22, 1.42, -HD - T / 2 - 0.01, 0.22, 0.04, 0.01); ctx.emissive?.(null); }
  // fallen rafters: charred beams lying from the wall tops into the ash
  ctx.albedo(TEX.oak); ctx.color(CHAR);
  const beams = [[-3.6, 4.6, -2.2, 0.2, 0.2, 0.55], [-1.5, 2.9, 1.8, 0.15, -0.35, 0.62], [1.2, 1.9, -1.0, 0.1, 0.5, 0.48], [2.8, 1.2, 1.4, 0.1, 1.2, 0.3], [-2.4, 3.6, 0.6, 0.15, 0.1, 0.5]];
  for (const [x, y, z, , yaw, pitch] of beams) {
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    g.at({ m: [cy, -sy * sp, sy * cp, 0, cp, sp, -sy, -cy * sp, cy * cp], t: [x, y * 0.5, z] }, () => g.box(0, 0, 0, 0.24, 0.26, 4.6));
  }
  // rubble and ash inside
  if (lod <= 3) for (let i = 0; i < (lod <= 1 ? 18 : 8); i++) { const k = 0.25 + R() * 0.35;
    mossyRock(g, [(R() - 0.5) * (HW * 2 - 1.6), 0.05, (R() - 0.5) * (HD * 2 - 1.4)], [k * 1.4, k * 0.6, k], 0, 900 + i, { rock: TEX.rock, moss: null, rockTint: "oklch(0.55 0.01 70)", floor: -0.4 }); }
  ctx.albedo(null); ctx.color("oklch(0.24 0.005 60)"); g.box(0, 0.02, 0, HW * 2 - T, 0.06, HD * 2 - T); // ash floor
  // the tariff board, fallen over on its posts, the scales painted on it
  g.at({ m: [0.94, 0, 0.342, 0, 1, 0, -0.342, 0, 0.94], t: [3.4, 0, -6.2] }, () => {
    ctx.albedo(TEX.oak); ctx.color("oklch(0.85 0.01 120)");
    g.at({ m: [1, 0, 0, 0, 0.57, -0.82, 0, 0.82, 0.57], t: [0, 0.05, 0] }, () => {
      for (const s of [-1, 1]) g.box(s * 1.05, 0.8, 0, 0.16, 1.6, 0.16);
      ctx.color("oklch(0.62 0.12 35)"); g.box(0, 0.95, 0, 1.95, 0.85, 0.06);
      if (lod <= 2) { ctx.albedo(null); ctx.color("oklch(0.78 0.12 85)"); g.box(0, 0.95, -0.04, 0.05, 0.6, 0.01); g.box(0, 1.2, -0.04, 0.8, 0.05, 0.01);
        for (const s of [-1, 1]) g.box(s * 0.36, 0.95, -0.04, 0.26, 0.04, 0.01); }
    });
  });
  // the burnt cart, tipped on a broken wheel
  ctx.albedo(TEX.oak); ctx.color(CHAR);
  g.at({ m: [0.906, -0.423, 0, 0.423, 0.906, 0, 0, 0, 1], t: [-6.4, 0.55, -3.8] }, () => {
    g.box(0, 0.2, 0, 1.4, 0.1, 2.6); for (const s of [-1, 1]) g.box(s * 0.68, 0.45, 0, 0.08, 0.5, 2.6); g.box(0, 0.45, 1.27, 1.4, 0.5, 0.08);
    for (const s of [-1, 1]) g.box(s * 0.25, 0.1, -2.1, 0.08, 0.08, 1.8);                    // shafts
    g.tube(Array.from({ length: 13 }, (_, k) => { const a = k / 12 * 6.283; return [0.82, -0.05 + Math.cos(a) * 0.55, 0.3 + Math.sin(a) * 0.55, 0.05]; }), 6); // the standing wheel
  });
  // scorched barrels, one on its side
  ctx.albedo(TEX.oak); ctx.color("oklch(0.55 0.02 60)");
  for (const [x, z, lie] of [[-4.6, -5.0, 1], [-3.7, -5.6, 0], [5.6, -1.2, 0]]) {
    const ring = (r, y) => [0, y, 0, r];
    const path = [ring(0.3, 0), ring(0.36, 0.42), ring(0.3, 0.85)];
    if (lie) g.at({ m: [1, 0, 0, 0, 0, -1, 0, 1, 0], t: [x, 0.33, z - 0.4] }, () => g.tube(path, 10, { capA: true, capB: true }));
    else g.at({ m: [1, 0, 0, 0, 1, 0, 0, 0, 1], t: [x, 0, z] }, () => g.tube(path, 10, { capA: true, capB: true }));
  }
  // ledger pages in the sand
  if (lod <= 1) { ctx.albedo(null); ctx.color("oklch(0.9 0.02 85)");
    for (let i = 0; i < 14; i++) { const a = R() * 6.283, r = 3.6 + R() * 4; g.at({ m: [Math.cos(a), 0, Math.sin(a), 0, 1, 0, -Math.sin(a), 0, Math.cos(a)], t: [Math.cos(a) * r * 1.2, 0.03, -HD - 1 - Math.abs(Math.sin(a)) * r * 0.6] }, () => g.box(0, 0, 0, 0.22, 0.01, 0.3)); } }
  ctx.albedo(null); ctx.color(null);
}
export function collider() {
  const out = [];
  for (const [face, x0, z0, x1, z1, open] of FACES) {
    const ax = Math.abs(x1 - x0) > 0.1, L = Math.hypot(x1 - x0, z1 - z0);
    const door = face === "S" ? open[0] : null, cuts = door ? [[0, door[0]], [door[1], 1]] : [[0, 1]];
    for (const [a, b] of cuts) { const t = (a + b) / 2, len = (b - a) * L, h = face === "W" ? 4.5 : 2.2;
      out.push({ kind: "box", width: ax ? len : T, height: h, depth: ax ? T : len, center: [x0 + (x1 - x0) * t, h / 2, z0 + (z1 - z0) * t] }); }
  }
  out.push({ kind: "box", width: 1.6, height: 1.3, depth: 2.8, center: [-6.4, 0.65, -3.8], rotation: { yaw: 0 } });
  return out;
}
