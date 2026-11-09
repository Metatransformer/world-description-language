// The Wreckers' Kirkyard, outside Aurenmar's east wall (concept: art-aur-wreckers-kirkyard).
// A drystone-walled yard on the salt-mud: a driftwood lychgate with a slate roof on the -Z side,
// slate headstones for the wreckers on the west half, ship-timber and oar markers for their
// victims on the east, a cairned mass-grave mound with a rusted anchor at the back, a sexton's
// lantern post by the path. Local frame: gate at -Z, yard 26 x 20 m.
import { G, rng, TEX, mossyRock } from "../lib/geo.js";
const W = 13, D = 10, GAP = 1.7, WH = 1.15, WT = 0.7;          // half sizes, gate half-gap, wall height, thickness (my picks)
const MOUND = [0, 6.2], LANTERN = [2.6, -6.4];
function wallRuns() { // [x0,z0,x1,z1]
  return [[-W, -D, -GAP, -D], [GAP, -D, W, -D], [-W, D, W, D], [-W, -D, -W, D], [W, -D, W, D]];
}
export function geometry(ctx) {
  const g = new G(ctx), lod = ctx.lod || 1, R = rng(4417);
  if (lod >= 5) { // far: walls, gate roof and mound as plain hulls
    ctx.color("oklch(0.58 0.01 90)");
    for (const [x0, z0, x1, z1] of wallRuns()) { const ax = Math.abs(x1 - x0) > 0.1, L = Math.hypot(x1 - x0, z1 - z0); g.box((x0 + x1) / 2, WH / 2, (z0 + z1) / 2, ax ? L : WT, WH, ax ? WT : L); }
    ctx.color("oklch(0.4 0.01 250)"); g.box(0, 3, -D, 3.6, 1.2, 3); ctx.color("oklch(0.5 0.03 130)"); g.box(MOUND[0], 0.5, MOUND[1], 5.6, 1, 3.8);
    ctx.color(null); return;
  }
  // the walls: fieldstone courses, capped with mossy coping stones up close
  ctx.albedo(TEX.fieldstone); ctx.color("oklch(0.9 0.01 90)");
  for (const [x0, z0, x1, z1] of wallRuns()) {
    const L = Math.hypot(x1 - x0, z1 - z0), cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, alongX = Math.abs(x1 - x0) > 0.1;
    const n = Math.max(1, Math.round(L / 2.2));
    for (let i = 0; i < n; i++) { // stepped sections so the top line wanders
      const t = (i + 0.5) / n, h = WH * (0.88 + R() * 0.2), seg = L / n + 0.05;
      const x = alongX ? x0 + (x1 - x0) * t : cx, z = alongX ? cz : z0 + (z1 - z0) * t;
      g.box(x, h / 2 - 0.15, z, alongX ? seg : WT, h + 0.3, alongX ? WT : seg);
    }
  }
  ctx.albedo(null); ctx.color(null);
  if (lod <= 2) for (const [x0, z0, x1, z1] of wallRuns()) {
    const L = Math.hypot(x1 - x0, z1 - z0), n = Math.round(L / (lod <= 1 ? 0.75 : 1.6));
    for (let i = 0; i < n; i++) { const t = (i + 0.5) / n, k = 0.32 + R() * 0.12;
      mossyRock(g, [x0 + (x1 - x0) * t, WH + 0.02, z0 + (z1 - z0) * t], [k * 1.2, k * 0.55, k], lod <= 1 ? 1 : 0, 300 + i + x0 * 3 + z0 * 7, { rock: TEX.rock, moss: TEX.moss, mossAt: 0.3, floor: -0.7 }); }
  }
  // gate piers
  ctx.albedo(TEX.fieldstone); ctx.color("oklch(0.88 0.01 90)");
  for (const s of [-1, 1]) g.box(s * (GAP + 0.1), 0.75, -D, 0.9, 1.7, 0.95);
  // the lychgate: four grey driftwood posts, tie beams, braces, a slate gable
  ctx.albedo(TEX.oak); ctx.color("oklch(0.93 0.008 80)");
  const PX = 1.45, PZ = 1.1, PH = 2.6;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.box(sx * PX, PH / 2, -D + sz * PZ, 0.2, PH, 0.2);
  for (const sz of [-1, 1]) g.box(0, PH + 0.08, -D + sz * PZ, PX * 2 + 0.5, 0.18, 0.22);  // wall plates
  for (const sx of [-1, 1]) g.box(sx * PX, PH + 0.08, -D, 0.2, 0.18, PZ * 2 + 0.3);      // tie beams
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.at({ m: [1, 0, 0, 0, 0.7071, -0.7071 * sz, 0, 0.7071 * sz, 0.7071], t: [sx * PX, PH - 0.35, -D + sz * (PZ - 0.32)] }, () => g.box(0, 0, 0, 0.12, 0.7, 0.12)); // knee braces
  g.box(0, PH + 1.15, -D, 0.16, 2.2, 0.16);  // king post
  // a timber cross on the ridge
  g.box(0, PH + 2.55, -D - PZ - 0.35, 0.1, 0.8, 0.1); g.box(0, PH + 2.65, -D - PZ - 0.35, 0.45, 0.09, 0.1);
  // slate roof, two pitches along x, ridge over the path
  ctx.albedo(TEX.slate); ctx.color("oklch(0.85 0.01 250)");
  const RW = PX + 0.55, RL = PZ + 0.5, rise = 1.25, y0 = PH + 0.2, th = 0.1;
  for (const sx of [-1, 1]) {
    const a = [0, y0 + rise, -D - RL], b = [sx * RW, y0, -D - RL], c = [sx * RW, y0, -D + RL], d = [0, y0 + rise, -D + RL];
    if (sx > 0) { g.quad(a, d, c, b); g.quad([a[0], a[1] - th, a[2]], [b[0], b[1] - th, b[2]], [c[0], c[1] - th, c[2]], [d[0], d[1] - th, d[2]]); }
    else { g.quad(a, b, c, d); g.quad([a[0], a[1] - th, a[2]], [d[0], d[1] - th, d[2]], [c[0], c[1] - th, c[2]], [b[0], b[1] - th, b[2]]); }
    g.quad(b, c, [c[0], c[1] - th, c[2]], [b[0], b[1] - th, b[2]]);
  }
  ctx.albedo(TEX.oak); ctx.color("oklch(0.93 0.008 80)");
  for (const sz of [-1, 1]) { const z = -D + sz * RL; // gable boards
    if (sz < 0) g.tri([-RW + 0.15, y0, z + 0.02], [0, y0 + rise - 0.1, z + 0.02], [RW - 0.15, y0, z + 0.02]); else g.tri([RW - 0.15, y0, z - 0.02], [0, y0 + rise - 0.1, z - 0.02], [-RW + 0.15, y0, z - 0.02]); }
  // the leaning gate leaf, swung open and stuck in the mud
  g.at({ m: [0.2588, 0, 0.9659, 0, 1, 0, -0.9659, 0, 0.2588], t: [PX - 0.1, 0, -D + 0.25] }, () => { for (let k = 0; k < 5; k++) g.box(0, 0.62, -0.1 - k * 0.24, 0.07, 1.15 + (k % 2) * 0.08, 0.2); g.box(0.05, 0.35, -0.58, 0.06, 0.12, 1.2); g.box(0.05, 0.95, -0.58, 0.06, 0.12, 1.2); });
  // the path of worn flags, gate to mound
  ctx.albedo(TEX.flag); ctx.color("oklch(0.82 0.015 80)");
  for (let z = -D + 0.4; z < MOUND[1] - 3; z += 0.9 + R() * 0.2) { const w = 0.7 + R() * 0.35, x = Math.sin(z * 0.4) * 0.35 + (R() - 0.5) * 0.2; g.box(x, 0.03, z, w, 0.1, 0.62 + R() * 0.2); }
  // the wreckers: slate headstones, west half, rows that drifted
  ctx.albedo(TEX.slate); ctx.color("oklch(0.74 0.012 250)");
  const rows = lod <= 2 ? 4 : 2;
  for (let r = 0; r < rows; r++) for (let i = 0; i < 5; i++) {
    const x = -2.8 - i * 1.9 - R() * 0.4, z = -6.5 + r * 3.4 + R() * 0.6, h = 0.7 + R() * 0.6, w = 0.45 + R() * 0.2;
    const lean = (R() - 0.5) * 0.35, yaw = (R() - 0.5) * 0.3, cy = Math.cos(yaw), sy = Math.sin(yaw), cl = Math.cos(lean), sl = Math.sin(lean);
    g.at({ m: [cy, 0, sy, sy * sl, cl, -cy * sl, -sy * cl, sl, cy * cl], t: [x, -0.25, z] }, () => {
      g.box(0, h / 2, 0, w, h, 0.09);
      if (lod <= 2) { g.box(0, h + 0.05, 0, w * 0.7, 0.1, 0.09); g.box(0, h + 0.12, 0, w * 0.35, 0.06, 0.09); } // rounded shoulder
    });
  }
  // the drowned: ship planks and oars driven upright, east half, lashed with rope
  ctx.albedo(TEX.oak); ctx.color("oklch(0.9 0.012 70)");
  const n = lod <= 2 ? 16 : 8;
  for (let i = 0; i < n; i++) {
    const col = i % 5, row = Math.floor(i / 5), x = 2.8 + col * 1.9 + R() * 0.5, z = -6.2 + row * 3.6 + R() * 0.7, lean = (R() - 0.5) * 0.3;
    const cl = Math.cos(lean), sl = Math.sin(lean), h = 1.0 + R() * 0.7;
    g.at({ m: [cl, -sl, 0, sl, cl, 0, 0, 0, 1], t: [x, -0.3, z] }, () => {
      if (i % 3 === 1) { // an oar: loom then blade
        g.box(0, (h + 0.3) / 2, 0, 0.08, h + 0.3, 0.08); g.box(0, h * 0.25, 0, 0.26, h * 0.5, 0.05);
      } else { g.box(0, h / 2, 0, 0.32, h, 0.08); g.box(0, h * 0.68, 0.0, 0.62, 0.1, 0.09); } // a plank with a nailed crossbar
      if (lod <= 1) { ctx.albedo(TEX.canvas); ctx.color("oklch(0.78 0.03 75)"); g.box(0, h * 0.4, 0, 0.36, 0.06, 0.12); ctx.albedo(TEX.oak); ctx.color("oklch(0.9 0.012 70)"); }
    });
  }
  // the mass grave: a long cairn of beach stones, the anchor driven into its crown
  mossyRock(g, [MOUND[0], 0.1, MOUND[1]], [3.2, 1.15, 2.2], lod <= 2 ? 2 : 1, 77, { rock: TEX.rock, moss: TEX.moss, mossAt: 0.62, amp: 0.12, floor: -0.1 });
  if (lod <= 2) for (let i = 0; i < (lod <= 1 ? 22 : 10); i++) { const a = R() * 6.283, r = R(), k = 0.2 + R() * 0.18;
    const x = MOUND[0] + Math.cos(a) * r * 2.8, z = MOUND[1] + Math.sin(a) * r * 1.9, y = 1.2 * Math.sqrt(Math.max(0, 1 - r * r)) - 0.05;
    mossyRock(g, [x, y, z], [k * 1.2, k * 0.7, k], 0, 500 + i, { rock: TEX.rock, moss: TEX.moss, mossAt: 0.5, floor: -0.6 }); }
  ctx.albedo(TEX.iron); ctx.color("oklch(0.62 0.07 45)"); // rust
  const ax = MOUND[0], az = MOUND[1], ay = 1.0;
  g.at({ m: [0.9848, -0.1736, 0, 0.1736, 0.9848, 0, 0, 0, 1], t: [ax, ay, az] }, () => {
    g.tube([[0, -0.4, 0, 0.09], [0, 2.1, 0, 0.08]], 8, { capA: true, capB: true });                  // shank
    g.box(0, 1.85, 0, 0.12, 0.12, 1.5);                                                              // stock
    g.tube([[0, 2.25, 0, 0.05], [0, 2.4, 0.12, 0.05], [0, 2.55, 0, 0.05], [0, 2.4, -0.12, 0.05], [0, 2.25, 0, 0.05]], 6); // ring
    const arm = []; for (let k = 0; k <= 8; k++) { const a = -1.15 + k * 0.2875; arm.push([Math.sin(a) * 0.85, 0.75 - Math.cos(a) * 0.85 + 0.0, 0, 0.075]); }
    g.tube(arm, 7, { capA: true, capB: true });                                                      // the crown arms
    for (const s of [-1, 1]) g.at({ m: [Math.cos(s * 0.5), -Math.sin(s * 0.5), 0, Math.sin(s * 0.5), Math.cos(s * 0.5), 0, 0, 0, 1], t: [s * 0.78, 0.3, 0] }, () => g.box(0, 0, 0, 0.28, 0.22, 0.08)); // flukes
  });
  // the sexton's lantern post
  ctx.albedo(TEX.oak); ctx.color("oklch(0.9 0.012 70)");
  const [lx, lz] = LANTERN;
  g.box(lx, 1.45, lz, 0.18, 2.9, 0.18); g.box(lx - 0.35, 2.78, lz, 0.85, 0.12, 0.12);
  g.at({ m: [0.7071, -0.7071, 0, 0.7071, 0.7071, 0, 0, 0, 1], t: [lx - 0.18, 2.5, lz] }, () => g.box(0, 0, 0, 0.08, 0.5, 0.08));
  ctx.albedo(TEX.iron); ctx.color("oklch(0.5 0.01 60)");
  const hx = lx - 0.65;
  g.box(hx, 2.6, lz, 0.02, 0.18, 0.02); g.box(hx, 2.48, lz, 0.26, 0.04, 0.26); g.box(hx, 2.2, lz, 0.24, 0.05, 0.24);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.box(hx + sx * 0.11, 2.34, lz + sz * 0.11, 0.03, 0.26, 0.03);
  ctx.color("oklch(0.95 0.12 75)"); ctx.emissive?.("oklch(0.85 0.15 70)", 3); g.box(hx, 2.34, lz, 0.17, 0.2, 0.17); ctx.emissive?.(null);
  // drift: kelp and wrack along the wall's foot, a gull-picked crab or two
  if (lod <= 1) { ctx.albedo(null); ctx.color("oklch(0.38 0.05 120)");
    for (let i = 0; i < 26; i++) { const side = i % 4, t = R() * 2 - 1, x = side < 2 ? t * (W - 0.8) : (side === 2 ? -1 : 1) * (W - 0.7), z = side < 2 ? (side === 0 ? D - 0.7 : -D + 0.7) : t * (D - 0.8);
      if (Math.abs(x) < GAP + 0.6 && z < 0) continue; g.box(x, 0.02, z, 0.5 + R() * 0.5, 0.04, 0.12 + R() * 0.1); } }
  ctx.albedo(null); ctx.color(null);
}
export function collider() {
  const out = [];
  for (const [x0, z0, x1, z1] of wallRuns()) { const alongX = Math.abs(x1 - x0) > 0.1, L = Math.hypot(x1 - x0, z1 - z0);
    out.push({ kind: "box", width: alongX ? L : WT, height: WH + 0.4, depth: alongX ? WT : L, center: [(x0 + x1) / 2, (WH + 0.4) / 2 - 0.15, (z0 + z1) / 2] }); }
  for (const s of [-1, 1]) { out.push({ kind: "box", width: 0.9, height: 1.7, depth: 0.95, center: [s * (GAP + 0.1), 0.75, -D] }); out.push({ kind: "box", width: 0.3, height: 2.7, depth: 2.4, center: [s * 1.45, 1.35, -D] }); }
  out.push({ kind: "box", width: 5.6, height: 1.2, depth: 3.8, center: [MOUND[0], 0.5, MOUND[1]] });
  out.push({ kind: "box", width: 0.3, height: 2.9, depth: 0.3, center: [LANTERN[0], 1.45, LANTERN[1]] });
  return out;
}
