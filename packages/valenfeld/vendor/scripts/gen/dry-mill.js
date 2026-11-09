// The Dry Mill (the-dry-mill): a two-storey fieldstone watermill split open by the Barrow Winter,
// its waterwheel seized over the dry ravine, everything rimed in hoarfrost. params.part:
//   mill     the mill shell (roofless half, charred joists, mossy slate on the north pitch), the stone
//            wheel-race on the ravine lip, the cracked wheel, the dry millrace, the barrow-king's throne,
//            a hoarfrost skirt draped on the ground (samples ctx.groundY: one mesh for this one object)
//   cottage  the miller's cottage: broken walls, chimney still standing, fallen rafters
//   millstone  params.split: true = the split stone leaning on its half; else a flat runner on its bed
//   graves   the family plot: kerb stones and four leaning markers
//   sacks    a heap of grain sacks gone black
// Local frame: -Z is the mill's front (door), +Z the ravine side, +X upstream along the ravine.
import { G, X, rng, TEX } from "../lib/geo.js";
const RIME = "oklch(0.95 0.03 225)", RIME_DIM = "oklch(0.86 0.03 230)", CHAR = "oklch(0.62 0.015 250)", SLATE = "oklch(0.9 0.03 210)";
const FROST = "cdn/texture-hoarfrost-frozen-grass.png", SACK = "cdn/texture-blackened-burlap-sack.png";
const MILL = { x0: -5.5, x1: 5.5, z0: -4, z1: 4, t: 0.7 };
const WHEEL = { x: 0.6, y: 3.0, z: 4.95, r: 3.4, w: 1.0 };

// a ragged wall along X or Z, columns of stone with a broken top; holes: [[u0, u1, y0, y1]] in wall metres
function wall(g, ctx, ax, fixed, u0, u1, t, top, holes = [], sink = 0.4, seed = 1) {
  const R = rng(seed * 31 + 7), n = Math.max(1, Math.round((u1 - u0) / 0.9)), cw = (u1 - u0) / n;
  for (let i = 0; i < n; i++) {
    const ua = u0 + i * cw, ub = ua + cw, um = (ua + ub) / 2, h = top(um, R);
    const base = ctx.groundY ? Math.min(0, ax === "x" ? ctx.groundY(um, fixed) : ctx.groundY(fixed, um)) - sink : -sink;
    let spans = [[base, h]];
    for (const [h0, h1, y0, y1] of holes) if (um > h0 && um < h1) spans = spans.flatMap(([a, b]) => (y1 <= a || y0 >= b) ? [[a, b]] : [[a, y0], [y1, b]].filter(([p, q]) => q - p > 0.05));
    for (const [a, b] of spans) {
      const jog = (R() - 0.5) * 0.06;
      if (ax === "x") g.box(um, (a + b) / 2, fixed + jog, cw + 0.02, b - a, t);
      else g.box(fixed + jog, (a + b) / 2, um, t, b - a, cw + 0.02);
    }
    // a capstone lip where the wall still stands to its course
    if (h > 1.2 && R() < 0.5) { if (ax === "x") g.box(um, h + 0.09, fixed, cw * 0.9, 0.18, t + 0.1); else g.box(fixed, h + 0.09, um, t + 0.1, 0.18, cw * 0.9); }
  }
}
function rubble(g, ctx, cx, cz, r, n, seed, lod) {
  const R = rng(seed);
  for (let i = 0; i < n; i++) {
    const a = R() * 6.283, d = Math.sqrt(R()) * r, x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d, s = 0.18 + R() * 0.3;
    const y = ctx.groundY ? ctx.groundY(x, z) : 0;
    g.tris(g.blob([x, y + s * 0.3, z], [s * 1.3, s * 0.7, s], lod >= 3 ? 0 : 1, 0.25, 1.4, seed + i));
  }
}
function icicles(g, x0, x1, y, z, n, R) {
  for (let i = 0; i < n; i++) {
    const x = x0 + (x1 - x0) * R(), l = 0.15 + R() * 0.45, w = 0.03 + R() * 0.03, tip = [x, y - l, z];
    const a = [x - w, y, z - w], b = [x + w, y, z - w], c = [x + w, y, z + w], d = [x - w, y, z + w];
    g.tri(a, b, tip); g.tri(b, c, tip); g.tri(c, d, tip); g.tri(d, a, tip);
  }
}
function wheel(g, ctx, lod) {
  const { x, y, z, r, w } = WHEEL, R = rng(911), seg = lod <= 2 ? 28 : 16, gap = [0.62, 0.78]; // a broken arc of rim
  ctx.albedo(TEX.oak); ctx.color(CHAR);
  for (const side of [-1, 1]) {
    const zz = z + side * (w / 2 - 0.06);
    for (let i = 0; i < seg; i++) {
      const f0 = i / seg, f1 = (i + 1) / seg; if (f0 >= gap[0] && f1 <= gap[1] && side > 0) continue;
      const a0 = f0 * 6.283, a1 = f1 * 6.283, rr = r - 0.2;
      g.at(X([x + Math.cos((a0 + a1) / 2) * rr, y + Math.sin((a0 + a1) / 2) * rr, zz], 0, 0, ((a0 + a1) / 2) * 57.3 + 90), () => g.box(0, 0, 0, 2 * rr * Math.sin((a1 - a0) / 2) + 0.04, 0.32, 0.14));
    }
    for (let k = 0; k < 8; k++) { if (side > 0 && k === 5) continue; const a = k * 0.785 + 0.2;
      g.at(X([x + Math.cos(a) * (r - 0.25) / 2, y + Math.sin(a) * (r - 0.25) / 2, zz], 0, 0, a * 57.3), () => g.box(0, 0, 0, r - 0.25, 0.16, 0.12)); }
  }
  // a cracked spoke hanging loose from the broken side
  g.at(X([x + 1.6, y - 1.9, z + w / 2], 0, 0, -62), () => g.box(0, 0, 0, 1.8, 0.15, 0.12));
  // paddles across the rims, some gone
  const np = lod <= 2 ? 24 : 12;
  for (let i = 0; i < np; i++) { const f = i / np; if (R() < 0.18 || (f > gap[0] - 0.02 && f < gap[1])) continue; const a = f * 6.283;
    g.at(X([x + Math.cos(a) * (r - 0.12), y + Math.sin(a) * (r - 0.12), z], 0, 0, a * 57.3), () => g.box(0, 0, 0, 0.5, 0.06, w - 0.05)); }
  // the axle through the wall and its iron hub
  ctx.color("oklch(0.5 0.015 250)"); g.tube([[x, y, MILL.z1 - 0.9, 0.22], [x, y, z + w / 2 + 1.25, 0.22]], lod <= 2 ? 10 : 6, { capA: true, capB: true });
  ctx.albedo(TEX.iron); ctx.color("oklch(0.75 0.02 230)"); g.tube([[x, y, z - 0.3, 0.42], [x, y, z + 0.3, 0.42]], lod <= 2 ? 10 : 6, { capA: true, capB: true });
  if (lod <= 2) { ctx.albedo(null); ctx.color("oklch(0.97 0.03 220)"); icicles(g, x - r * 0.7, x + r * 0.7, y - r * 0.55, z + w / 2, 14, R); icicles(g, x - 2, x + 2, y + 0.1, z - w / 2, 8, R); }
}
function race(g, ctx, lod) {
  // the wheel-race: a stone trough on piers along the ravine lip, the axle's outer bearing pier, and the dry millrace running upstream
  ctx.albedo(TEX.fieldstone); ctx.color(RIME);
  const fz = WHEEL.z, yb = WHEEL.y - WHEEL.r - 0.45;
  for (let xx = -3.5; xx < 14; xx += 1.5) {
    const gy = ctx.groundY(xx + 0.75, fz), top = Math.max(gy + 0.15, yb + Math.max(0, xx - 4) * 0.08);
    g.box(xx + 0.75, top - 0.15, fz, 1.52, 0.3, 2.0);                 // trough floor
    for (const s of [-1, 1]) g.box(xx + 0.75, top + 0.3, fz + s * 0.9, 1.52, 0.6, 0.25); // trough walls
    if (gy < top - 0.4 && Math.round(xx * 2) % 3 === 0) g.box(xx + 0.75, (gy - 0.5 + top - 0.3) / 2, fz, 0.9, top - 0.3 - gy + 0.5, 1.6); // a pier down to the ground
  }
  // outer bearing pier, from the ravine slope up to the axle
  const pz = WHEEL.z + WHEEL.w / 2 + 0.9, gp = ctx.groundY(WHEEL.x, pz);
  g.box(WHEEL.x, (gp - 0.6 + WHEEL.y + 0.3) / 2, pz, 1.4, WHEEL.y + 0.9 - gp, 1.2);
  g.box(WHEEL.x, WHEEL.y + 0.42, pz, 1.6, 0.24, 1.4);
  ctx.albedo(TEX.flag); ctx.color(RIME_DIM); // the dry millrace head: a sunk stone channel across the yard, upstream
  for (let xx = 14; xx < 22; xx += 1.2) { const gy = ctx.groundY(xx + 0.6, fz - 1.4); g.box(xx + 0.6, gy - 0.05, fz - 1.4, 1.22, 0.1, 1.4); for (const s of [-1, 1]) g.box(xx + 0.6, gy + 0.12, fz - 1.4 + s * 0.85, 1.22, 0.44, 0.3); }
  for (let xx = 13.2; xx < 14.6; xx += 0.6) { const gy = ctx.groundY(xx, fz - 0.7); g.box(xx, gy + 0.05, fz - 0.7, 0.62, 0.3, 1.6); }
}
function mill(g, ctx, lod) {
  const M = MILL, R = rng(4242);
  ctx.albedo(TEX.fieldstone); ctx.color(RIME);
  // ragged tops: the west gable stands whole, the east end is broken down to one storey
  const frontTop = (x, R) => (x < -1.5 ? 7.4 : x < 1.5 ? 7.4 - (x + 1.5) * 1.1 : 3.6 + Math.sin(x * 3.1) * 0.5) + R() * 0.35;
  const backTop = (x, R) => (x < 0 ? 7.4 : 7.4 - x * 0.75) + R() * 0.3;
  wall(g, ctx, "x", M.z0 + M.t / 2, M.x0, M.x1, M.t, frontTop, [[-3.3, -1.9, -9, 2.5], [1.0, 2.1, 1.1, 2.3], [-4.6, -3.7, 4.1, 5.2], [-1.0, 0.1, 4.1, 5.2]], 0.4, 1);
  wall(g, ctx, "x", M.z1 - M.t / 2, M.x0, M.x1, M.t, backTop, [[-3.6, -2.5, 1.1, 2.3], [2.2, 3.2, 4.1, 5.2]], 1.6, 2); // deep footing on the lip
  // gable ends: west climbs to the ridge at 9.4, east ruined
  wall(g, ctx, "z", M.x0 + M.t / 2, M.z0, M.z1, M.t, (z) => 7.4 + Math.max(0, 2.0 - Math.abs(z) * 0.5), [[-1.2, 0.0, 4.4, 5.6]], 0.6, 3);
  wall(g, ctx, "z", M.x1 - M.t / 2, M.z0, M.z1, M.t, (z, R) => 2.2 + (z + 4) * 0.45 + R() * 0.6, [], 0.6, 4);
  // quoins and a door lintel and sill
  ctx.albedo(TEX.rock); ctx.color("oklch(0.9 0.02 230)");
  for (const [qx, qz] of [[M.x0, M.z0], [M.x0, M.z1], [M.x1, M.z1]]) for (let y = 0; y < (qx < 0 ? 7.2 : 4.6); y += 0.55) { const o = (Math.round(y / 0.55) % 2) * 0.2; g.box(qx + (qx < 0 ? 0.32 + o : -0.32 - o), y + 0.25, qz + (qz < 0 ? 0.32 : -0.32), 0.82, 0.48, 0.82); }
  g.box(-2.6, 2.62, M.z0 + 0.35, 2.0, 0.26, 0.85); g.box(1.55, 2.42, M.z0 + 0.35, 1.5, 0.2, 0.85); g.box(1.55, 1.04, M.z0 + 0.25, 1.4, 0.12, 0.95);
  // a ground-floor of worn flags, frost in the joints
  ctx.albedo(TEX.flag); ctx.color(RIME_DIM); g.box(0, 0.04, 0, M.x1 - M.x0 - 1.2, 0.12, M.z1 - M.z0 - 1.2);
  // smoke-black oak: first-floor joists, some fallen, a corner of floorboards still in place
  ctx.albedo(TEX.oak); ctx.color(CHAR);
  for (let x = -4.6; x <= 4.7; x += 1.15) {
    const broken = x > 0.8 && x < 3.2;
    if (broken) g.at(X([x, 1.7, -1.1], 0, -38, 6), () => g.box(0, 0, 0, 0.26, 0.3, 5.8)); // dropped at one end, its foot on the flags
    else if (x < 4.5) g.box(x, 3.65, 0, 0.26, 0.3, M.z1 - M.z0 - 0.3);
  }
  for (let z = -3.2; z <= 3.3; z += 0.36) if (z > -0.6) g.box(-3.2, 3.86, z, 4.4, 0.06, 0.34); // the upper floor still holds over the west end
  for (const [px, pz] of [[-1.2, -1.5], [-1.2, 1.5]]) g.box(px, 1.85, pz, 0.32, 3.7, 0.32); // posts
  g.box(-1.2, 3.55, 0, 0.36, 0.3, 7.0); // summer beam
  // the roof: ridge and rafters stand over the west half; the south pitch has fallen in
  const ridge = 9.4, eave = 7.5, half = 4.6;
  g.box(-2.6, ridge, 0, 6.2, 0.28, 0.28);
  for (let x = -5.2; x <= 0.4; x += 0.9) {
    const pitch = Math.atan2(ridge - eave, half) * 57.3, L = Math.hypot(half, ridge - eave) + 0.6;
    g.at(X([x, (ridge + eave) / 2, -half / 2], 0, pitch, 0), () => g.box(0, 0, 0, 0.16, 0.2, L));
    if (x < -3.5 || R() < 0.4) g.at(X([x, (ridge + eave) / 2, half / 2], 0, -pitch, 0), () => g.box(0, 0, 0, 0.16, 0.2, L * (x < -3.5 ? 1 : 0.4 + R() * 0.3)));
  }
  // a fallen rafter leaning into the hall from the broken side
  g.at(X([2.6, 2.6, 0.6], 25, 0, 48), () => g.box(0, 0, 0, 5.8, 0.2, 0.18));
  ctx.albedo(TEX.slate); ctx.color(SLATE); // mossy slate on what's left of the north pitch, a ragged lower edge
  const pitch = Math.atan2(ridge - eave, half) * 57.3, Ls = Math.hypot(half, ridge - eave) + 0.5;
  g.at(X([-2.75, (ridge + eave) / 2 + 0.18, -half / 2], 0, pitch, 0), () => { g.box(0, 0, 0, 5.8, 0.08, Ls); for (let i = 0; i < (lod <= 2 ? 9 : 4); i++) g.box(-2.6 + i * 0.65, 0.07, Ls / 2 - 0.25 - R() * 0.6, 0.6, 0.05, 0.5); });
  g.at(X([-4.6, (ridge + eave) / 2 + 0.18, half / 2], 0, -pitch, 0), () => g.box(0, 0, 0, 1.6, 0.08, Ls));
  // slates and stones heaped where the south pitch came down
  rubble(g, ctx, 2.8, 1.4, 1.6, lod <= 2 ? 14 : 6, 77, lod);
  for (let i = 0; i < (lod <= 2 ? 16 : 6); i++) g.at(X([1.5 + R() * 3, 0.15 + R() * 0.25, -1 + R() * 3.5], R() * 360, (R() - 0.5) * 40, (R() - 0.5) * 30), () => g.box(0, 0, 0, 0.5, 0.04, 0.3));
  // the barrow-king's seat: an upright millstone for a back, a seat of barrow-stones, stone arms
  const tx = 2.4, tz = 2.55;
  ctx.albedo(TEX.rock); ctx.color("oklch(0.88 0.02 240)");
  g.tube([[tx, 1.25, tz + 0.12, 1.15], [tx, 1.25, tz + 0.52, 1.15]], lod <= 2 ? 24 : 12, { capA: true, capB: true }); // its axis along Z: the stone stands on edge
  ctx.color("oklch(0.6 0.02 240)"); g.tube([[tx, 1.25, tz + 0.05, 0.22], [tx, 1.25, tz + 0.6, 0.22]], 8, { capA: true });
  ctx.color("oklch(0.84 0.02 240)");
  g.tris(g.blob([tx, 0.25, tz - 0.45], [0.75, 0.32, 0.6], lod >= 3 ? 0 : 1, 0.15, 1.3, 3));
  g.tris(g.blob([tx, 0.62, tz - 0.4], [0.62, 0.12, 0.5], lod >= 3 ? 0 : 1, 0.1, 1.3, 4));
  for (const s of [-1, 1]) { g.tris(g.blob([tx + s * 0.95, 0.45, tz - 0.35], [0.28, 0.45, 0.42], lod >= 3 ? 0 : 1, 0.2, 1.4, 5 + s)); g.tris(g.blob([tx + s * 0.95, 1.0, tz - 0.4], [0.32, 0.12, 0.48], 0, 0.15, 1.4, 7 + s)); }
  // a dais of flat barrow-slabs
  ctx.albedo(TEX.flag); ctx.color("oklch(0.8 0.02 240)"); g.box(tx, 0.12, tz - 0.3, 3.2, 0.16, 2.0); g.box(tx, 0.06, tz - 1.5, 2.4, 0.14, 0.6);
  wheel(g, ctx, lod);
  race(g, ctx, lod);
}
function skirt(g, ctx) {
  // hoarfrost draped on the ground round the mill: a ragged patch, its edge broken by noise
  ctx.albedo(FROST); ctx.color("oklch(0.98 0.02 220)");
  const lod = ctx.lod || 1, S = lod >= 3 ? 1.6 : 0.8, Rr = 14, F = 4, N = Math.ceil((Rr + F) / S), H = {}, R = rng(4242);
  const hy = (i, j) => (H[i + "," + j] ??= ctx.groundY(i * S, j * S) + 0.05);
  for (let i = -N; i < N; i++) for (let j = -N; j < N + 2; j++) {
    const cx = (i + 0.5) * S, cz = (j + 0.5) * S, d = Math.hypot(cx, cz * 1.15) + ctx.noise3d(cx * 0.21, 0, cz * 0.21) * 4.5;
    const keep = d < Rr ? 1 : 1 - (d - Rr) / F; // the fringe thins to flecks out into the grass
    if (keep <= 0 || R() > keep + ctx.noise3d(cx * 0.9, 3, cz * 0.9) * 0.35) continue;
    if (cx > MILL.x0 + 0.6 && cx < MILL.x1 - 0.6 && cz > MILL.z0 + 0.6 && cz < MILL.z1 - 0.6) continue;
    const hs = [hy(i, j), hy(i, j + 1), hy(i + 1, j + 1), hy(i + 1, j)];
    if (Math.max(...hs) - Math.min(...hs) > 0.35 * S) continue; // frost lies on the flat, never hangs down the cliff
    const p = (a, b) => [a * S, hy(a, b), b * S];
    g.quad(p(i, j), p(i, j + 1), p(i + 1, j + 1), p(i + 1, j));
  }
}
function cottage(g, ctx, lod) {
  const R = rng(5150), x0 = -3.6, x1 = 3.6, z0 = -2.8, z1 = 2.8, t = 0.55;
  ctx.albedo(TEX.fieldstone); ctx.color(RIME);
  wall(g, ctx, "x", z0 + t / 2, x0, x1, t, (x, R) => 1.2 + Math.abs(Math.sin(x * 0.9)) * 1.6 + R() * 0.5, [[-0.6, 0.6, -9, 2.2]], 0.4, 11);
  wall(g, ctx, "x", z1 - t / 2, x0, x1, t, (x, R) => 2.6 - (x + 3.6) * 0.18 + R() * 0.5, [[0.8, 1.7, 0.9, 1.9]], 0.4, 12);
  wall(g, ctx, "z", x0 + t / 2, z0, z1, t, (z) => 2.8 + Math.max(0, 1.4 - Math.abs(z) * 0.5), [], 0.4, 13);
  wall(g, ctx, "z", x1 - t / 2, z0, z1, t, (z, R) => 0.8 + R() * 0.9, [], 0.4, 14);
  ctx.albedo(TEX.rock); ctx.color("oklch(0.88 0.02 230)"); // the chimney stack on the west gable, standing whole
  g.box(x0 - 0.15, 2.6, 0, 1.2, 5.6, 1.4); g.box(x0 - 0.15, 5.5, 0, 1.4, 0.22, 1.6); g.box(x0 + 0.5, 0.7, 0, 0.5, 1.4, 1.5);
  ctx.color("oklch(0.4 0.01 250)"); g.box(x0 + 0.76, 0.6, 0, 0.04, 0.9, 0.9); // the hearth mouth, sooted
  ctx.albedo(TEX.oak); ctx.color(CHAR);
  g.box(-2.0, 2.95, 0, 3.4, 0.22, 0.22); // a stub of ridge still bedded in the gable
  for (let i = 0; i < (lod <= 2 ? 6 : 3); i++) g.at(X([-1.5 + R() * 4, 0.5 + R() * 0.6, -1.6 + R() * 3.2], R() * 180, (R() - 0.5) * 30, R() * 25 - 12), () => g.box(0, 0, 0, 0.16, 0.2, 2.6 + R() * 1.4));
  g.at(X([1.2, 1.3, -0.6], 30, 32, 0), () => g.box(0, 0, 0, 0.18, 0.22, 3.6));
  ctx.albedo(TEX.flag); ctx.color(RIME_DIM); g.box(0, 0.03, 0, x1 - x0 - 1, 0.08, z1 - z0 - 1);
  rubble(g, ctx, 2.2, -0.4, 1.4, lod <= 2 ? 10 : 4, 99, lod);
  ctx.albedo(TEX.slate); ctx.color(SLATE); for (let i = 0; i < (lod <= 2 ? 10 : 4); i++) g.at(X([R() * 5 - 2.5, 0.12 + R() * 0.2, R() * 3.6 - 1.8], R() * 360, (R() - 0.5) * 30, (R() - 0.5) * 30), () => g.box(0, 0, 0, 0.5, 0.04, 0.3));
}
function millstone(g, ctx, lod) {
  ctx.albedo(TEX.rock); ctx.color("oklch(0.9 0.02 235)");
  const seg = lod <= 2 ? 26 : 12;
  if (ctx.params.split) {
    // a split runner: two halves, one on its back, one leaning up on its edge
    const halfDisc = (y0, y1, r, a0) => { const n = seg >> 1; for (let i = 0; i < n; i++) { const a = a0 + Math.PI * i / n, b = a0 + Math.PI * (i + 1) / n, P = (t, y) => [Math.cos(t) * r, y, Math.sin(t) * r]; g.quad(P(a, y0), P(a, y1), P(b, y1), P(b, y0)); g.tri([0, y1, 0], P(b, y1), P(a, y1)); g.tri([0, y0, 0], P(a, y0), P(b, y0)); }
      g.quad([Math.cos(a0) * r, y0, Math.sin(a0) * r], [Math.cos(a0 + Math.PI) * r, y0, Math.sin(a0 + Math.PI) * r], [Math.cos(a0 + Math.PI) * r, y1, Math.sin(a0 + Math.PI) * r], [Math.cos(a0) * r, y1, Math.sin(a0) * r]); };
    g.at(X([0, 0, 0.15], 0, 0, 0), () => halfDisc(0, 0.32, 0.95, 0));
    g.at(X([0.1, 0, -0.35], 0, 68, 0), () => halfDisc(0, 0.32, 0.95, Math.PI));
  } else {
    g.tube([[0, 0, 0, 1.0], [0, 0.34, 0, 1.0]], seg, { capB: true });
    ctx.color("oklch(0.55 0.015 240)"); g.tube([[0, 0.3, 0, 0.16], [0, 0.42, 0, 0.16]], 8, { capB: true });
    ctx.albedo(TEX.iron); ctx.color("oklch(0.6 0.02 240)"); g.tube([[0, 0.3, 0, 0.06], [0, 0.85, 0, 0.06]], 6, { capB: true });
  }
}
function graves(g, ctx, lod) {
  const R = rng(4004);
  ctx.albedo(TEX.rock); ctx.color("oklch(0.88 0.02 230)");
  for (let i = 0; i < 16; i++) { const a = i / 16 * 6.283, x = Math.cos(a) * 3.0, z = Math.sin(a) * 2.0, y = ctx.groundY ? 0 : 0; g.tris(g.blob([x, y + 0.08, z], [0.28, 0.16, 0.22], 0, 0.25, 1.4, 40 + i)); }
  for (let k = 0; k < 4; k++) {
    const x = -1.95 + k * 1.3, lean = (R() - 0.5) * 30, roll = (R() - 0.5) * 22, h = k === 3 ? 0.65 : 0.95 + R() * 0.25; // the last is the child's
    ctx.albedo(TEX.rock); ctx.color("oklch(0.86 0.02 230)");
    g.at(X([x, -0.2, -0.5], (R() - 0.5) * 14, lean, roll), () => { g.box(0, h / 2, 0, 0.5, h, 0.14); g.tris(g.blob([0, h, 0], [0.25, 0.13, 0.07], 0, 0.05, 1, k)); });
    ctx.albedo(FROST); ctx.color("oklch(0.95 0.02 220)"); g.box(x, 0.06, 0.45, 0.8, 0.16, 1.6); // the low mound
  }
}
function sacks(g, ctx, lod) {
  const R = rng(616 + (ctx.params.seed ?? 1));
  ctx.albedo(SACK); ctx.color("oklch(0.8 0.01 250)");
  const n = ctx.params.n ?? 5;
  for (let i = 0; i < n; i++) { const top = i >= 3, x = top ? (i - 3.5) * 0.5 : (i - 1) * 0.62, y = top ? 0.62 : 0.28, z = (R() - 0.5) * 0.3;
    g.tris(g.blob([x, y, z], [0.33, 0.3, 0.26], lod >= 3 ? 1 : 2, 0.12, 1.2, i + 3)); }
  ctx.albedo(null); ctx.color("oklch(0.22 0.01 60)"); // spilled grain, black with rot
  for (let i = 0; i < 6; i++) g.tris(g.blob([0.9 + R() * 0.5, 0.02, (R() - 0.5) * 0.8], [0.25, 0.05, 0.2], 0, 0.3, 1.5, 70 + i));
}
export function geometry(ctx) {
  ctx.roughness?.(1); ctx.metalness?.(0);
  const g = new G(ctx), lod = ctx.lod || 1, part = ctx.params.part ?? "mill";
  if (part === "mill") { mill(g, ctx, lod); skirt(g, ctx); }
  else if (part === "cottage") cottage(g, ctx, lod);
  else if (part === "millstone") millstone(g, ctx, lod);
  else if (part === "graves") graves(g, ctx, lod);
  else if (part === "sacks") sacks(g, ctx, lod);
  ctx.albedo(null); ctx.color(null); ctx.flat();
}
export function collider(ctx) {
  const part = ctx.params.part ?? "mill", M = MILL;
  if (part === "mill") return [
    { kind: "box", width: 2.2, height: 7, depth: 0.7, center: [-4.4, 3.5, M.z0 + 0.35] },   // front wall, west of the door
    { kind: "box", width: 7.2, height: 4, depth: 0.7, center: [1.9, 2, M.z0 + 0.35] },      // front wall, east of the door
    { kind: "box", width: 11, height: 7, depth: 0.7, center: [0, 3.5, M.z1 - 0.35] },
    { kind: "box", width: 0.7, height: 9, depth: 8, center: [M.x0 + 0.35, 4.5, 0] },
    { kind: "box", width: 0.7, height: 3, depth: 8, center: [M.x1 - 0.35, 1.5, 0] },
    { kind: "box", width: 3.0, height: 2.3, depth: 1.2, center: [2.4, 1.15, 2.6] },          // the throne
    { kind: "box", width: 18, height: 1.2, depth: 2.2, center: [5.2, WHEEL.y - WHEEL.r - 0.2, WHEEL.z] }, // the race
    { kind: "box", width: 6.8, height: 6.8, depth: 1.2, center: [WHEEL.x, WHEEL.y, WHEEL.z] },
  ];
  if (part === "cottage") return [
    { kind: "box", width: 3.0, height: 2.4, depth: 0.55, center: [-2.1, 1.2, -2.5] }, { kind: "box", width: 3.0, height: 2.4, depth: 0.55, center: [2.1, 1.2, -2.5] },
    { kind: "box", width: 7.2, height: 2.6, depth: 0.55, center: [0, 1.3, 2.5] }, { kind: "box", width: 1.2, height: 5.6, depth: 5.6, center: [-3.5, 2.8, 0] },
    { kind: "box", width: 0.55, height: 1.4, depth: 5.6, center: [3.3, 0.7, 0] }];
  if (part === "millstone") return ctx.params.split ? { kind: "box", width: 1.9, height: 0.9, depth: 1.4, center: [0, 0.45, 0] } : { kind: "cylinder", radiusTop: 1, radiusBottom: 1, height: 0.4, center: [0, 0.2, 0] };
  if (part === "graves") return [];
  return { kind: "box", width: 1.8, height: 0.8, depth: 0.8, center: [0, 0.4, 0] };
}
