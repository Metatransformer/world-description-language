// The Silent Clearing (woodcutters-clearing): one script, params.part picks.
//  camp: the stump ring, felled-trunk stacks on cross-logs, the sawpit with its two-man saw, the foreman's table
//        and ledger, the cold pit's tipped pot, the slashed and collapsed tent, the broken cart half-loaded.
//        Local frame: origin the clearing centre, +x east (toward the lair), -x west (the trail in).
//  lair: the Stump-Father's mark: a torn-open giant hollow stump on a root-mound, bone-white roots arching out,
//        the camp's missing axes driven into the mound. Its open mouth faces -x (west, the camp).
import { G, X, rng, TEX } from "../lib/geo.js";
const PALE = "oklch(0.86 0.06 78)", RING = "oklch(0.7 0.07 65)", BONE = "oklch(0.93 0.02 95)", EARTH = "oklch(0.36 0.03 60)";
// where camp pieces stand (local x, z, keep-out radius): stumps keep off them
export const SPOTS = { fire: [-3, 1, 2.2], table: [-8, -3, 2], tentA: [-6, -9, 2.6], tentB: [2, -10.5, 2.6], tentC: [-9.5, 7.5, 3], rack: [5, -6.5, 1.8],
  sawpit: [6, 7, 3.6], stackA: [-1, 12.5, 4], stackB: [10.5, -11, 3.6], cart: [-14.5, 3.5, 3], strong: [-5.5, -11.6, 1.2], ledger: [-9.6, -4.4, 1], trail: [-20, 0, 3.5], lair: [16, 0, 7], crates: [-7.3, -6.3, 1.6], crate2: [8.6, -3.6, 1.2] };
function stumpSpots() {
  const R = rng(4242), out = [];
  for (let i = 0; out.length < 26 && i < 400; i++) {
    const a = i * 2.39996 + R() * 0.4, r = 6 + R() * 12.5, x = Math.cos(a) * r, z = Math.sin(a) * r * 0.9;
    if (Object.values(SPOTS).some(([sx, sz, k]) => Math.hypot(x - sx, z - sz) < k + 0.8)) continue;
    if (out.some((s) => Math.hypot(x - s[0], z - s[1]) < 2.2)) continue;
    out.push([x, z, 0.28 + R() * 0.22, 0.25 + R() * 0.75, R(), out.length]);
  }
  return out;
}
export const STUMPS = stumpSpots();
function axe(g, ctx, len = 0.85, rust = false) {   // head at origin biting -y, haft rising along +y-ish
  ctx.flat(); ctx.albedo(TEX.iron); ctx.color(rust ? "oklch(0.62 0.07 45)" : "oklch(0.85 0.01 250)");
  g.box(0, 0.02, 0.06, 0.03, 0.14, 0.2);
  g.box(0, -0.05, -0.02, 0.012, 0.08, 0.22);
  ctx.smooth(); ctx.albedo(TEX.oak); ctx.color("oklch(0.9 0.04 70)");
  g.tube([[0, 0.02, 0.14, 0.022], [0, 0.04 + len * 0.3, 0.14 + len * 0.95, 0.019]], 6, { capB: true });
}
function stump(g, ctx, s, lod) {
  const [x, z, r, h, k, i] = s, seg = lod <= 1 ? 12 : lod <= 2 ? 9 : 6;
  g.at(X([x, 0, z], k * 360), () => {
    ctx.smooth(); ctx.albedo(TEX.bark); ctx.color("oklch(0.85 0.02 60)");
    g.tube([[0, -0.25, 0, r * 1.15], [0, 0.12, 0, r * 1.06], [0, h, 0, r]], seg, { rough: (th) => 1 + 0.07 * Math.sin(th * 5 + i) });
    if (lod <= 2) for (let j = 0; j < 5; j++) { const a = j / 5 * 6.283 + k * 3, c = Math.cos(a), n = Math.sin(a);
      g.tube([[c * r * 0.7, Math.min(h, 0.3), n * r * 0.7, r * 0.34], [c * r * 1.35, 0.04, n * r * 1.35, r * 0.2], [c * r * 2.0, -0.1, n * r * 2.0, r * 0.08]], 6, { capB: true }); }
    // the fresh cut: pale wood, a ring, the hinge sliver left where the tree broke away
    ctx.flat(); ctx.albedo(null);
    const top = h + 0.002;
    for (let j = 0; j < seg; j++) { const a0 = j / seg * 6.283, a1 = (j + 1) / seg * 6.283;
      ctx.color(PALE); g.tri([0, top, 0], [Math.cos(a1) * r * 0.97, top, Math.sin(a1) * r * 0.97], [Math.cos(a0) * r * 0.97, top, Math.sin(a0) * r * 0.97]);
      if (lod <= 1) { ctx.color(RING); const q = 0.5, w = 0.56; g.quad([Math.cos(a0) * r * w, top + 0.002, Math.sin(a0) * r * w], [Math.cos(a0) * r * q, top + 0.002, Math.sin(a0) * r * q], [Math.cos(a1) * r * q, top + 0.002, Math.sin(a1) * r * q], [Math.cos(a1) * r * w, top + 0.002, Math.sin(a1) * r * w]); } }
    ctx.color("oklch(0.76 0.06 72)"); g.box(0, top + 0.05, -r * 0.55, r * 1.1, 0.1, 0.06);
    if (i % 4 === 1) g.at(X([r * 0.2, top + 0.02, 0], 70, 0, 18), () => axe(g, ctx, 0.85, i % 8 === 1));   // an axe still bitten in
  });
}
function log(g, ctx, a, b, r, lod) {   // a felled trunk lying a→b, cut ends pale
  const seg = lod <= 1 ? 12 : 8;
  ctx.smooth(); ctx.albedo(TEX.log); ctx.color("oklch(0.88 0.02 60)");
  g.tube([[...a, r], [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2, r * 0.94], [...b, r * 0.86]], seg, { rough: (th) => 1 + 0.05 * Math.sin(th * 7) });
  ctx.flat(); ctx.albedo(null); ctx.color(PALE);
  const cap = (p, q, rr) => { const d = [p[0] - q[0], p[1] - q[1], p[2] - q[2]], L = Math.hypot(...d), t = d.map((v) => v / L), u = Math.abs(t[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
    const n1 = [u[1] * t[2] - u[2] * t[1], u[2] * t[0] - u[0] * t[2], u[0] * t[1] - u[1] * t[0]], l1 = Math.hypot(...n1), n = n1.map((v) => v / l1), m = [t[1] * n[2] - t[2] * n[1], t[2] * n[0] - t[0] * n[2], t[0] * n[1] - t[1] * n[0]];
    const P = (th) => [p[0] + t[0] * 0.003 + (Math.cos(th) * n[0] + Math.sin(th) * m[0]) * rr * 0.97, p[1] + t[1] * 0.003 + (Math.cos(th) * n[1] + Math.sin(th) * m[1]) * rr * 0.97, p[2] + t[2] * 0.003 + (Math.cos(th) * n[2] + Math.sin(th) * m[2]) * rr * 0.97];
    for (let j = 0; j < seg; j++) { const A = P(j / seg * 6.283), B = P((j + 1) / seg * 6.283); g.tri([p[0] + t[0] * 0.003, p[1] + t[1] * 0.003, p[2] + t[2] * 0.003], A, B); g.tri([p[0] + t[0] * 0.003, p[1] + t[1] * 0.003, p[2] + t[2] * 0.003], B, A); } };
  cap(a, b, r); cap(b, a, r * 0.86);
}
function stack(g, ctx, cx, cz, yaw, n, lod) {   // two cross-logs, trunks stacked on them in a pyramid
  g.at(X([cx, 0, cz], yaw), () => {
    for (const x of [-2, 2]) log(g, ctx, [x, 0.12, -1.3], [x, 0.12, 1.3], 0.18, lod);
    let row = 0, k = 0;
    for (let left = n; left > 0; row++) { const m = Math.min(left, 4 - row); if (m <= 0) break;
      for (let j = 0; j < m; j++) { const z = (j - (m - 1) / 2) * 0.62, y = 0.3 + 0.3 + row * 0.54; log(g, ctx, [-3.1 + (k % 3) * 0.15, y, z], [3.2 - (k % 2) * 0.3, y, z], 0.3 - (k % 3) * 0.02, lod); k++; }
      left -= m; }
    ctx.smooth(); ctx.albedo(TEX.log); ctx.color("oklch(0.88 0.02 60)");   // chocks
    for (const s of [-1, 1]) g.tube([[s * 2, 0.2, 1.45, 0.07], [s * 2, 0.75, 1.42, 0.06]], 5, { capB: true });
  });
}
function sawpit(g, ctx, cx, cz, lod) {
  g.at(X([cx, 0, cz], 8), () => {
    ctx.flat(); ctx.albedo(null); ctx.color("oklch(0.14 0.01 50)");   // the pit's mouth, dark
    g.quad([-2.2, 0.03, -0.65], [-2.2, 0.03, 0.65], [2.2, 0.03, 0.65], [2.2, 0.03, -0.65]);
    ctx.albedo(TEX.oak); ctx.color("oklch(0.78 0.03 60)");   // timber lining, rails and the spoil heaps
    for (const z of [-0.8, 0.8]) g.box(0, 0.12, z, 4.8, 0.24, 0.3);
    for (const x of [-2.35, 2.35]) g.box(x, 0.12, 0, 0.3, 0.24, 1.9);
    for (const x of [-1.4, 1.4]) g.box(x, 0.33, 0, 0.22, 0.18, 2.2);   // the cross-bearers the log rides on
    ctx.color(EARTH); ctx.albedo(TEX.moss);
    for (const [x, z, s] of [[-1, 1.8, 1], [1.4, 1.9, 0.8], [0.2, -1.9, 0.9]]) g.tris(g.blob([x, -0.1, z], [1.1 * s, 0.45 * s, 0.6 * s], 1, 0.3, 1.2, x * 3, -0.1));
    log(g, ctx, [-2.9, 0.7, 0], [2.9, 0.7, 0], 0.3, lod);
    ctx.flat(); ctx.albedo(TEX.iron); ctx.color("oklch(0.8 0.01 240)");   // the two-man saw, left standing in the kerf
    g.box(0.6, 0.62, 0, 0.012, 1.3, 0.16);
    if (lod <= 2) for (let j = 0; j < 14; j++) g.box(0.6, -0.05 + j * 0.09, 0.09, 0.01, 0.05, 0.03);
    ctx.smooth(); ctx.albedo(TEX.oak); ctx.color("oklch(0.9 0.04 70)");
    g.tube([[0.6, 1.3, -0.18, 0.025], [0.6, 1.3, 0.18, 0.025]], 6, { capA: true, capB: true });
    g.tube([[0.6, -0.08, -0.18, 0.025], [0.6, -0.08, 0.18, 0.025]], 6, { capA: true, capB: true });
    ctx.flat(); ctx.albedo(null); ctx.color(PALE);   // sawdust under the cut
    g.tris(g.blob([0.6, 0.02, 0.15], [0.45, 0.07, 0.35], 1, 0.2, 2, 3, 0));
  });
}
function table(g, ctx, cx, cz, lod) {
  g.at(X([cx, 0, cz], -15), () => {
    ctx.flat(); ctx.albedo(TEX.oak); ctx.color("oklch(0.82 0.03 60)");
    for (let j = 0; j < 4; j++) g.box(0, 0.86, -0.36 + j * 0.24, 1.9, 0.05, 0.23);
    for (const x of [-0.75, 0.75]) { g.box(x, 0.42, -0.25, 0.08, 0.84, 0.08); g.box(x, 0.42, 0.25, 0.08, 0.84, 0.08); g.box(x, 0.2, 0, 0.06, 0.06, 0.5); }
    g.box(0, 0.2, 0, 1.5, 0.06, 0.06);
    g.at(X([1.25, 0.22, 0.6], 30, 0, 88), () => { g.box(0, 0, 0, 0.42, 0.04, 0.42); for (const s of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) g.box(s[0] * 0.17, -0.22, s[1] * 0.17, 0.05, 0.44, 0.05); });   // the stool, knocked over
    ctx.albedo(null);   // the ledger, open, pages stirred; ink pot spilled
    ctx.color("oklch(0.4 0.06 35)"); g.box(-0.2, 0.895, 0.02, 0.62, 0.02, 0.42);
    ctx.color("oklch(0.92 0.03 85)"); g.at(X([-0.36, 0.91, 0.02], 0, 0, 4), () => g.box(0, 0, 0, 0.28, 0.025, 0.39)); g.at(X([-0.05, 0.91, 0.02], 0, 0, -4), () => g.box(0, 0, 0, 0.28, 0.025, 0.39));
    if (lod <= 1) { ctx.color("oklch(0.3 0.02 260)"); for (let j = 0; j < 7; j++) g.box(-0.36, 0.925, -0.12 + j * 0.04, 0.2, 0.002, 0.006); }
    ctx.color("oklch(0.2 0.02 260)"); g.at(X([0.35, 0.92, 0.1], 0, 90, 0), () => g.box(0, 0, 0, 0.07, 0.1, 0.07));
    g.quad([0.36, 0.889, 0.1], [0.36, 0.889, 0.32], [0.62, 0.889, 0.3], [0.55, 0.889, 0.06]);
    ctx.color("oklch(0.95 0.02 85)"); g.at(X([0.05, 0.004, 0.9], 40), () => g.box(0, 0, 0, 0.22, 0.004, 0.3));   // a torn page in the grass
  });
}
function pot(g, ctx, cx, cz) {   // the tipped pot, its last meal spilled cold
  g.at(X([cx, 0.2, cz], 35, 0, 80), () => { ctx.smooth(); ctx.albedo(TEX.iron); ctx.color("oklch(0.55 0.01 50)");
    g.tube([[0, -0.2, 0, 0.0], [0, -0.17, 0, 0.17], [0, 0.0, 0, 0.22], [0, 0.17, 0, 0.19], [0, 0.18, 0, 0.17], [0, 0.04, 0, 0.16]], 12); });
  ctx.flat(); ctx.albedo(null); ctx.color("oklch(0.3 0.04 60)");
  g.tris(g.blob([cx + 0.45, -0.02, cz + 0.3], [0.55, 0.04, 0.35], 1, 0.25, 2, 7, -0.01));
}
function slashedTent(g, ctx, cx, cz, lod) {   // poles snapped, canvas fallen, three long rents clawed through it
  g.at(X([cx, 0, cz], 205), () => {
    ctx.smooth(); ctx.albedo(TEX.log); ctx.color("oklch(0.9 0.02 60)");
    g.tube([[-1.6, -0.2, -1.4, 0.06], [-1.6, 1.0, -1.4, 0.05]], 6, { capB: true });
    g.tube([[-1.6, 1.0, -1.4, 0.05], [-1.2, 0.08, -2.4, 0.045]], 6, { capB: true });   // the snapped top, hanging
    g.tube([[1.7, 0.06, -1.9, 0.06], [1.6, 0.1, 0.6, 0.06]], 6, { capA: true, capB: true });   // the other pole flat in the grass
    g.tube([[-1.8, 0.95, -1.3, 0.055], [1.9, 0.1, -1.0, 0.05]], 6, { capA: true, capB: true });   // the ridge, fallen across
    ctx.flat(); ctx.albedo(TEX.canvas);
    const W = 3.6, D = 3.2, cols = lod <= 2 ? 10 : 4, rows = lod <= 2 ? 8 : 3, P = [];
    for (let r = 0; r <= rows; r++) { const t = r / rows, row = []; for (let c = 0; c <= cols; c++) { const u = c / cols, x = -W / 2 + W * u, ridge = Math.max(0, 0.95 * (1 - u) * (1 - t * 1.4)); row.push([x, 0.04 + ridge + 0.08 * Math.sin(u * 9 + t * 5) ** 2, -D / 2 + D * t]); } P.push(row); }
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      if (lod <= 2 && r >= 2 && r <= 6 && [2, 5, 7].some((k) => c === k + Math.floor((r - 2) / 3))) continue;   // the rents
      ctx.color((r * 3 + c * 5) % 7 === 0 ? "oklch(0.8 0.05 65)" : "oklch(0.92 0.025 85)"); g.quad(P[r][c], P[r][c + 1], P[r + 1][c + 1], P[r + 1][c]); }
    if (lod <= 2) { ctx.color("oklch(0.88 0.03 80)"); for (const [x, z] of [[-0.4, 0.2], [0.6, 0.5], [1.2, -0.2]]) g.at(X([x, 0.05, z], 20, 0, 10), () => g.quad([0, 0, 0], [0.25, 0, 0], [0.32, 0.02, 0.6], [0.05, 0.03, 0.75])); }
    ctx.albedo(null); ctx.color("oklch(0.45 0.06 40)"); g.at(X([0.6, 0.06, 1.9], 80), () => g.tube([[0, 0.12, -0.6, 0.12], [0, 0.12, 0.6, 0.12]], 8, { capA: true, capB: true }));   // a bedroll dragged half out
  });
}
function brokenCart(g, ctx, cx, cz, lod) {   // a hand-wheel cart down on its broken side, logs half-loaded and slid
  g.at(X([cx, 0, cz], 72), () => {
    g.at(X([0, 0.62, 0], 0, 0, -11), () => {
      ctx.flat(); ctx.albedo(TEX.oak); ctx.color("oklch(0.8 0.03 60)");
      g.box(0, 0, 0, 1.5, 0.08, 2.6);
      for (const x of [-0.72, 0.72]) g.box(x, 0.25, 0, 0.07, 0.45, 2.6);
      for (const z of [-1.27, 1.27]) g.box(0, 0.25, z, 1.5, 0.45, 0.07);
      g.box(-0.4, -0.06, -2.1, 0.08, 0.08, 1.6); g.box(0.4, -0.06, -2.1, 0.08, 0.08, 1.6);   // shafts
      for (const z of [-0.4, 0.4]) log(g, ctx, [-0.3 + z * 0.2, 0.33, -1.6], [-0.3, 0.33, 1.5], 0.24, lod);
      log(g, ctx, [0.35, 0.33, -1.4], [0.35, 0.33, 1.6], 0.22, lod);
      ctx.smooth(); ctx.albedo(TEX.oak); ctx.color("oklch(0.75 0.03 60)");
      g.tube([[0.82, -0.12, 0, 0.42], [0.92, -0.12, 0, 0.42]], 14, { capA: true, capB: true });   // the sound wheel
    });
    ctx.smooth(); ctx.albedo(TEX.oak); ctx.color("oklch(0.72 0.03 60)");   // the broken wheel, rim cracked, lying by it
    g.at(X([-1.3, 0.06, 0.6], 0, 0, 90), () => { for (let j = 0; j < 10; j++) { if (j === 3) continue; const a0 = j / 10 * 6.283, a1 = (j + 1) / 10 * 6.283; g.tube([[0, Math.cos(a0) * 0.42, Math.sin(a0) * 0.42, 0.04], [0, Math.cos(a1) * 0.42, Math.sin(a1) * 0.42, 0.04]], 5); }
      for (let j = 0; j < 6; j++) { if (j === 2) continue; const a = j / 6 * 6.283; g.tube([[0, 0, 0, 0.03], [0, Math.cos(a) * 0.4, Math.sin(a) * 0.4, 0.025]], 4); } });
    log(g, ctx, [-1.6, 0.2, -1.2], [-0.4, 0.2, 1.9], 0.22, lod);   // the log that slid off
  });
}
function camp(g, ctx) {
  const lod = ctx.lod || 1, S = SPOTS;
  for (const s of STUMPS) stump(g, ctx, s, lod);
  if (lod >= 4) return;
  stack(g, ctx, S.stackA[0], S.stackA[1], 6, 9, lod); stack(g, ctx, S.stackB[0], S.stackB[1], -24, 6, lod);
  sawpit(g, ctx, S.sawpit[0], S.sawpit[1], lod); table(g, ctx, S.table[0], S.table[1], lod);
  pot(g, ctx, S.fire[0] + 1.25, S.fire[1] + 0.7); slashedTent(g, ctx, S.tentC[0], S.tentC[1], lod); brokenCart(g, ctx, S.cart[0], S.cart[1], lod);
  if (lod <= 2) { ctx.flat(); ctx.albedo(null);   // wood chips round every cut, a dropped axe on the trail side
    const R = rng(77); for (const s of STUMPS) for (let j = 0; j < 5; j++) { ctx.color(j % 2 ? PALE : "oklch(0.74 0.05 70)"); const a = R() * 6.283, r = s[2] * 1.6 + R() * 1.1; g.at(X([s[0] + Math.cos(a) * r, 0.015, s[1] + Math.sin(a) * r], R() * 180), () => g.box(0, 0, 0, 0.09, 0.025, 0.05)); }
    g.at(X([-12.5, 0.06, -1.5], 140, 0, 88), () => axe(g, ctx, 0.85, true)); }
}
function lair(g, ctx) {
  const lod = ctx.lod || 1, R = rng(913), seg = lod <= 1 ? 10 : 6;
  ctx.flat(); ctx.albedo(TEX.moss); ctx.color("oklch(0.62 0.04 80)");   // the heaved root-mound: torn turf and black earth, open to the west
  for (let j = 0; j < 9; j++) { const a = j / 9 * 6.283 + 0.35; if (Math.abs(Math.atan2(Math.sin(a), Math.cos(a)) - Math.PI) < 0.5 || Math.abs(Math.atan2(Math.sin(a), Math.cos(a)) + Math.PI) < 0.5) continue;
    g.tris(g.blob([Math.cos(a) * 3.6, -0.35, Math.sin(a) * 3.6], [2.0, 1.15, 1.6], lod <= 2 ? 2 : 1, 0.35, 0.9, j, -0.3)); }
  ctx.albedo(null); ctx.color("oklch(0.12 0.01 40)"); g.tris(g.blob([0, -0.4, 0], [2.6, 0.5, 2.6], 1, 0.15, 1, 4, -0.38));   // the black hole it rose from
  ctx.smooth(); ctx.albedo(TEX.bark); ctx.color("oklch(0.62 0.02 50)");   // the giant stump, split and burst open, staves leaning out like a broken cage
  const staves = lod <= 2 ? 15 : 8;
  for (let j = 0; j < staves; j++) { const a = j / staves * 6.283; const w = Math.atan2(Math.sin(a), Math.cos(a)); if (Math.abs(Math.abs(w) - Math.PI) < 0.55) continue;
    const h = 2.4 + R() * 3.4, c = Math.cos(a), n = Math.sin(a), lean = 0.35 + R() * 0.5;
    g.tube([[c * 2.3, -0.3, n * 2.3, 0.42], [c * (2.5 + lean * 0.5), h * 0.5, n * (2.5 + lean * 0.5), 0.34], [c * (2.6 + lean), h, n * (2.6 + lean), 0.06]], seg, { capB: true, rough: (th) => 0.75 + 0.3 * Math.abs(Math.sin(th * 1.5)) }); }
  ctx.color(BONE); ctx.albedo(null);   // bone-white roots, arched up out of the ground and back down, a few crawling west at the camp
  const roots = lod <= 2 ? 16 : 7;
  for (let j = 0; j < roots; j++) { const a = j / roots * 6.283 + R() * 0.3, c = Math.cos(a), n = Math.sin(a), far = 6 + R() * 4, up = 1 + R() * 1.6;
    g.tube([[c * 2.2, 0.4, n * 2.2, 0.2], [c * 3.4, up + 0.4, n * 3.4, 0.16], [c * (far - 1.8), up * 0.6, n * (far - 1.8), 0.11], [c * far, -0.15, n * far, 0.05]], lod <= 1 ? 7 : 5); }
  for (let j = 0; j < 4; j++) { const z = -3 + j * 2 + R(), len = 9 + R() * 6;   // the crawlers toward the stumps
    g.tube([[-2.6, 0.1, z * 0.6, 0.16], [-5, 0.2, z, 0.12], [-8, 0.0, z * 1.3 + R(), 0.09], [-2.6 - len, -0.1, z * 1.5, 0.03]], 5); }
  if (lod <= 2) for (let j = 0; j < 9; j++) { const a = 2.2 + j * 0.5 + R() * 0.2;   // the missing axes, driven haft-first into the mound
    g.at(X([Math.cos(a) * (3.4 + R()), 0.5 + R() * 0.4, Math.sin(a) * (3.4 + R())], R() * 360, 180 + (R() - 0.5) * 50, (R() - 0.5) * 40), () => axe(g, ctx, 0.85, j % 3 === 0)); }
  ctx.flat(); ctx.color("oklch(0.9 0.02 90)");   // the crew's bones at the rim
  if (lod <= 2) for (let j = 0; j < 7; j++) { const a = 2.6 + j * 0.25; g.at(X([Math.cos(a) * 2.9, 0.12, Math.sin(a) * 2.9], R() * 180), () => g.tube([[-0.22, 0, 0, 0.025], [0.22, 0, 0, 0.022]], 5, { capA: true, capB: true })); }
}
const PARTS = { camp, lair };
export function geometry(ctx) { const g = new G(ctx); PARTS[ctx.params.part ?? "camp"](g, ctx); ctx.albedo(null); ctx.color(null); ctx.flat(); }
export function collider(ctx) {
  const part = ctx.params.part ?? "camp";
  if (part === "lair") { const out = []; for (let j = 0; j < 10; j++) { const a = j / 10 * 6.283; if (Math.abs(Math.abs(Math.atan2(Math.sin(a), Math.cos(a))) - Math.PI) < 0.6) continue;
    out.push({ kind: "box", width: 1.1, height: 4, depth: 1.6, center: [Math.cos(a) * 2.7, 2, Math.sin(a) * 2.7], rotation: { yaw: -a * 57.3 } }); } return out; }
  const S = SPOTS, out = STUMPS.map(([x, z, r, h]) => ({ kind: "cylinder", radiusTop: r, radiusBottom: r * 1.1, height: h + 0.25, center: [x, (h - 0.25) / 2, z] }));
  out.push({ kind: "box", width: 6.4, height: 1.8, depth: 2.9, center: [S.stackA[0], 0.9, S.stackA[1]], rotation: { yaw: 6 } });
  out.push({ kind: "box", width: 6.4, height: 1.4, depth: 2.9, center: [S.stackB[0], 0.7, S.stackB[1]], rotation: { yaw: -24 } });
  out.push({ kind: "box", width: 5.8, height: 1.0, depth: 1.9, center: [S.sawpit[0], 0.5, S.sawpit[1]], rotation: { yaw: 8 } });
  out.push({ kind: "box", width: 1.9, height: 0.9, depth: 0.95, center: [S.table[0], 0.45, S.table[1]], rotation: { yaw: -15 } });
  out.push({ kind: "box", width: 1.7, height: 1.2, depth: 2.8, center: [S.cart[0], 0.6, S.cart[1]], rotation: { yaw: 72 } });
  return out;
}
