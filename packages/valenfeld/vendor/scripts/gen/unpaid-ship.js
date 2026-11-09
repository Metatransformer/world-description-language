// The Unpaid Ship (concept: art-aur-unpaid-ship). A whole merchant cog the crew hauled up onto the
// heath above the sea and left there on its rollers, propped on timber shores, the owners' debt
// daubed on its side (the lettering is a vector child on the placement). Weathered tarred planking
// with a rust-red boot-top, sterncastle, standing mast with a rotten furled sail and its stays,
// a pennant, a ladder down to the crew's camp: canvas lean-to, fire ring, crates and kegs.
// Local frame: bow toward -Z, keel 0.7 m above the feet, port side -X, the lettered side +X.
import { G, rng, TEX, mossyRock } from "../lib/geo.js";
const L = 18, B = 5.6, D = 3.3, K = 0.7;                                     // length, beam, depth, keel height (my picks)
const TAR = "oklch(0.9 0.02 60)", BOOT = "oklch(0.8 0.1 38)", SAIL = "oklch(0.62 0.09 40)", CANVAS = "oklch(0.82 0.02 85)";
const halfW = (t) => (B / 2) * Math.pow(Math.max(0, Math.sin(Math.PI * Math.min(1, 0.05 + t * 0.93))), 0.6);
const sheer = (t) => D * (1 + 0.32 * Math.pow(Math.abs(t - 0.5) * 2, 2.2));
function P(t, k) { // hull point: t 0 bow .. 1 stern, k 0 port gunwale .. 0.5 keel .. 1 starboard gunwale
  const a = (k * 2 - 1) * Math.PI / 2, w = halfW(t) * (t > 0.92 ? 0.82 : 1);
  return [w * Math.sin(a), K + sheer(t) * (1 - Math.pow(Math.cos(a), 0.8) * 0.94), -L / 2 + t * L - (t < 0.12 ? (0.12 - t) * 6 * (1 - Math.abs(k * 2 - 1)) * 0 : 0)];
}
function at(g, m, t, f) { g.at({ m, t }, f); }
const rotY = (a) => [Math.cos(a), 0, Math.sin(a), 0, 1, 0, -Math.sin(a), 0, Math.cos(a)];
const rotZ = (a) => [Math.cos(a), -Math.sin(a), 0, Math.sin(a), Math.cos(a), 0, 0, 0, 1];
export function geometry(ctx) {
  const g = new G(ctx), lod = ctx.lod || 1, R = rng(4411);
  if (lod >= 5) { ctx.color("oklch(0.4 0.02 60)"); g.box(0, K + D / 2, 0, B * 0.85, D, L * 0.9); g.box(0, 7, -1, 0.4, 12, 0.4); ctx.color(null); return; }
  const NT = lod <= 1 ? 28 : lod <= 2 ? 18 : 10, NK = lod <= 1 ? 14 : lod <= 2 ? 10 : 6;
  // the hull skin: tarred strakes above, rust-red boot-top below the old waterline
  ctx.albedo("cdn/texture-weathered-tarred-ship-planks.png"); ctx.smooth();
  for (let i = 0; i < NT; i++) for (let j = 0; j < NK; j++) {
    const t0 = i / NT, t1 = (i + 1) / NT, k0 = j / NK, k1 = (j + 1) / NK;
    const low = Math.abs((k0 + k1) - 1) < 0.62;
    ctx.color(low ? BOOT : TAR);
    g.quad(P(t0, k0), P(t1, k0), P(t1, k1), P(t0, k1));
  }
  // close the bow and stern: the stem and a flat transom
  ctx.flat(); ctx.albedo(TEX.oak); ctx.color("oklch(0.6 0.02 60)");
  for (let j = 0; j < NK; j++) { const a = P(1, j / NK), b = P(1, (j + 1) / NK), c = [0, K + sheer(1), L / 2]; g.quad(a, b, [b[0], c[1], b[2]], [a[0], c[1], a[2]]); }
  g.tube([[0, K, -L / 2 + 0.2, 0.18], [0, K + D * 0.8, -L / 2 - 0.5, 0.17], [0, K + sheer(0) + 1.2, -L / 2 - 0.9, 0.16]], 6, { capA: true, capB: true });
  g.box(0, K + 0.1, 0, 0.36, 0.3, L - 0.6);                                             // keel
  // the deck and the gunwale rail
  ctx.albedo(TEX.planks || TEX.oak); ctx.color("oklch(0.78 0.02 70)");
  for (let i = 0; i < NT; i++) { const t0 = i / NT, t1 = (i + 1) / NT, y0 = K + sheer(t0) - 0.25, y1 = K + sheer(t1) - 0.25, w0 = halfW(t0) * 0.98, w1 = halfW(t1) * 0.98;
    g.quad([-w0, y0, -L / 2 + t0 * L], [w0, y0, -L / 2 + t0 * L], [w1, y1, -L / 2 + t1 * L], [-w1, y1, -L / 2 + t1 * L]); }
  ctx.albedo(TEX.oak); ctx.color("oklch(0.55 0.02 60)");
  for (const k of [0, 1]) { const pts = []; for (let i = 0; i <= 16; i++) { const p = P(i / 16, k); pts.push([p[0], p[1] + 0.08, p[2], 0.1]); } g.tube(pts, 5, { capA: true, capB: true }); }
  // sterncastle with a railed top
  const zs = L / 2 - 2.2, ys = K + sheer(0.88) - 0.25;
  ctx.color("oklch(0.62 0.02 60)"); g.box(0, ys + 1.0, zs, B * 0.72, 2.0, 3.6);
  ctx.color("oklch(0.5 0.02 60)"); g.box(0, ys + 2.05, zs, B * 0.78, 0.12, 3.9);
  if (lod <= 2) { for (let i = 0; i <= 8; i++) for (const s of [-1, 1]) g.box(s * B * 0.37, ys + 2.4, zs - 1.9 + i * 0.475, 0.08, 0.6, 0.08);
    for (const s of [-1, 1]) g.box(s * B * 0.37, ys + 2.72, zs, 0.1, 0.08, 3.9); g.box(0, ys + 2.72, zs + 1.92, B * 0.74, 0.08, 0.1);
    ctx.color("oklch(0.3 0.02 60)"); g.box(0, ys + 0.9, zs - 1.81, 0.9, 1.7, 0.04); }                         // the cabin door, dark
  // mast, yard, rotten furled sail, stays
  const mz = -1.2, mb = K + sheer(0.43) - 0.25, mt = mb + 11.5;
  ctx.smooth(); ctx.color("oklch(0.6 0.03 60)");
  g.tube([[0, mb, mz, 0.24], [0, mt, mz, 0.15]], lod <= 1 ? 8 : 5, { capB: true });
  g.tube([[-4.4, mt - 2.3, mz + 0.3, 0.12], [0, mt - 2.1, mz + 0.3, 0.15], [4.4, mt - 2.3, mz + 0.3, 0.12]], 5, { capA: true, capB: true });
  ctx.albedo(TEX.canvas || null); ctx.color(SAIL);
  const sail = []; for (let i = 0; i <= 10; i++) { const x = -4.1 + i * 0.82; sail.push([x, mt - 2.55 - (i % 3 === 1 ? 0.35 : 0) - Math.sin(i * 1.3) * 0.12, mz + 0.35, 0.28 + (i % 2) * 0.08]); }
  g.tube(sail, 6, { capA: true, capB: true });
  if (lod <= 2) for (let i = 0; i < 5; i++) { const x = -3.4 + i * 1.7 + (R() - 0.5) * 0.4, h = 0.6 + R() * 1.4; g.box(x, mt - 2.8 - h / 2, mz + 0.36, 0.35, h, 0.03); } // rags hanging
  ctx.flat(); ctx.albedo(null); ctx.color("oklch(0.45 0.03 70)");
  if (lod <= 3) { const top = [0, mt - 0.3, mz];
    for (const end of [[0, K + sheer(0) + 1.1, -L / 2 - 0.8], [0, ys + 2.1, zs + 1.6], [B / 2, K + sheer(0.43), mz + 1.2], [-B / 2, K + sheer(0.43), mz + 1.2], [B / 2, K + sheer(0.5), mz + 3], [-B / 2, K + sheer(0.5), mz + 3]])
      g.tube([[...top, 0.035], [...end, 0.035]], 3); }
  // pennant on the sterncastle
  ctx.color("oklch(0.5 0.02 60)"); g.box(-B * 0.3, ys + 4.2, zs + 1.4, 0.08, 4.2, 0.08);
  ctx.color("oklch(0.55 0.12 38)"); g.box(-B * 0.3 - 0.55, ys + 5.6, zs + 1.4, 1.0, 0.7, 0.02);
  // timber shores, four a side, feet on pads
  ctx.albedo(TEX.oak); ctx.color("oklch(0.6 0.02 60)");
  for (const s of [-1, 1]) for (const t of [0.2, 0.4, 0.62, 0.82]) {
    const p = P(t, s > 0 ? 0.82 : 0.18), foot = [s * (halfW(t) + 1.7), -0.6, p[2]];
    const dx = p[0] - foot[0], dy = p[1] - foot[1], len = Math.hypot(dx, dy), ang = Math.atan2(dx, dy);
    at(g, rotZ(-ang), [(p[0] + foot[0]) / 2, (p[1] + foot[1]) / 2, p[2]], () => g.box(0, 0, 0, 0.26, len, 0.26));
    g.box(foot[0], 0.05, foot[2], 0.9, 0.3, 0.6);
  }
  // log rollers under the keel, the hauling ropes slack on the heath
  ctx.albedo(TEX.bark || TEX.oak); ctx.color("oklch(0.75 0.03 60)"); ctx.smooth();
  for (let i = 0; i < 6; i++) { const z = -L / 2 + 2 + i * 2.7; g.tube([[-1.4, 0.35, z, 0.35], [1.4, 0.35, z, 0.35]], lod <= 1 ? 9 : 6, { capA: true, capB: true }); }
  ctx.albedo(null); ctx.color("oklch(0.6 0.05 75)");
  if (lod <= 2) for (const s of [-1, 1]) g.tube([[s * 0.4, K + sheer(0) + 0.9, -L / 2 - 0.6, 0.05], [s * 1.6, 0.1, -L / 2 - 4, 0.05], [s * 2.6, 0.08, -L / 2 - 9, 0.05]], 4);
  ctx.flat();
  // the ladder up the lettered side
  ctx.albedo(TEX.oak); ctx.color("oklch(0.62 0.02 60)");
  { const top = P(0.62, 0.98), x0 = top[0] + 1.3; const dx = top[0] - x0, dy = top[1], len = Math.hypot(dx, dy), ang = Math.atan2(dx, dy);
    at(g, rotZ(-ang), [(top[0] + x0) / 2, top[1] / 2, top[2]], () => { for (const s of [-0.28, 0.28]) g.box(0, 0, s, 0.08, len, 0.08); for (let r = 0; r < len / 0.32; r++) g.box(0, -len / 2 + 0.2 + r * 0.32, 0, 0.06, 0.05, 0.6); }); }
  // the crew's camp, starboard of the bow: lean-to, fire ring, crates and kegs
  at(g, rotY(0.5), [7.5, 0, -6], () => {
    ctx.albedo(TEX.oak); ctx.color("oklch(0.6 0.02 60)");
    for (const x of [-1.4, 1.4]) g.box(x, 0.85, 0.8, 0.1, 1.7, 0.1);
    g.box(0, 1.7, 0.8, 3.0, 0.1, 0.1);
    ctx.albedo(TEX.canvas || null); ctx.color(CANVAS);
    at(g, [1, 0, 0, 0, 0.8, 0.6, 0, -0.6, 0.8], [0, 0.85, -0.25], () => g.box(0, 0, 0, 3.1, 0.03, 2.8));
    ctx.albedo(TEX.oak); ctx.color("oklch(0.7 0.03 70)");
    g.box(-0.8, 0.3, 0, 0.6, 0.6, 0.6); g.box(2.3, 0.35, 1.2, 0.7, 0.7, 0.7);
    for (const [x, z] of [[1.1, -0.4], [2.9, 0.1]]) g.tube([[x, 0, z, 0.28], [x, 0.4, z, 0.33], [x, 0.8, z, 0.28]], 8, { capA: true, capB: true });
    ctx.albedo(null);
    for (let i = 0; i < 9; i++) { const a = i / 9 * 6.283; ctx.color("oklch(0.55 0.01 80)"); g.box(Math.cos(a) * 0.7, 0.1, 2.6 + Math.sin(a) * 0.7, 0.28, 0.2, 0.22); }
    ctx.color("oklch(0.2 0.005 60)"); g.box(0, 0.04, 2.6, 1.0, 0.06, 1.0);
    ctx.color("oklch(0.35 0.02 60)"); for (let i = 0; i < 3; i++) at(g, rotY(i * 1.1), [0, 0.12, 2.6], () => g.box(0, 0, 0, 0.1, 0.1, 0.9));
  });
  // heath stones about the hull
  if (lod <= 3) for (let i = 0; i < (lod <= 1 ? 7 : 3); i++) { const a = R() * 6.283, r = 7 + R() * 6, k = 0.4 + R() * 0.5;
    mossyRock(g, [Math.cos(a) * r, 0, Math.sin(a) * r * 1.3], [k * 1.4, k * 0.7, k], 0, 800 + i, { rock: TEX.rock, moss: TEX.moss, mossAt: 0.6, floor: -0.6 }); }
  ctx.albedo(null); ctx.color(null);
}
export function collider() {
  return [
    { kind: "box", width: B * 0.85, height: D, depth: L * 0.92, center: [0, K + D / 2, 0] },
    { kind: "box", width: B * 0.72, height: 2.0, depth: 3.6, center: [0, K + D * 1.1 + 0.75, L / 2 - 2.2] },
    { kind: "box", width: 3.2, height: 1.8, depth: 2.8, center: [7.5, 0.9, -6], rotation: { yaw: 28.6 } },
  ];
}
