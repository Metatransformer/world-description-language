// CROWFOOT MINE MOUTH: a timbered adit cut into a rock-and-turf knoll, ore rails running out of it to a
// tipped cart and a spoil heap, a hoist frame with its sheave wheel beside the mouth, webs creeping out of
// the dark. Built facing -x then turned so the mouth faces the object's -Z. Origin = ground at the portal.
import { kit } from "./barrow-kit.js";
import { moundDome, moundFacade, moundHeight } from "../lib/pieces/mound.js";
const R = 8.5, H = 6, CX = 5.2, FX = -0.7; // knoll radius, height, centre (into the hill), facade plane
const MOUND = { R, H, exp: 0.7, CX, FX, nt: (lod, col) => (col ? 24 : lod <= 2 ? 48 : 24), ns: (lod, col) => (col ? 5 : lod <= 2 ? 10 : 6), noise: [0.3, 0.45, 7], skirt: [2, -1.4] };
const hd = moundHeight(MOUND);
const TX = {
  turf: "cdn/texture-grass-turf-wild-mossy.png", rock: "cdn/texture-granite-rock-lichen.png", oak: "cdn/texture-dark-oak-planks-weathered.png",
  log: "cdn/texture-pine-bark-rough.png", iron: "cdn/texture-wrought-iron.png", gravel: "cdn/texture-gravel-path-grey.png",
};
function build(ctx, col) {
  const K = kit(ctx, col), lod = col ? 4 : ctx.lod;
  // ---- the knoll: a dome clipped by the facade plane, rock breaking through the turf
  K.paint(TX.turf, "oklch(0.92 0.03 125)", 0.95);
  moundDome(K, ctx, col, lod, MOUND);
  // ---- the rock face around the mouth, its top following the knoll, the adit cut through
  K.paint(TX.rock, "oklch(0.9 0.01 90)", 0.95);
  moundFacade(K, col, MOUND, { z: [-6.4, 6.39], step: col ? 0.9 : 0.45, rise: 0.15, door: [1.75, 3.6], base: -0.8, back: 0.9, front: 0.2 });
  if (!col && lod <= 3) for (let k = 0; k < 30; k++) {
    const z = -6 + ctx.random() * 12; if (Math.abs(z) < 2.3) continue;
    const top = hd(Math.hypot(FX - CX, z)); K.rock(FX - 0.85, 0.2 + ctx.random() * Math.max(0.3, top - 0.6), z, 0.35 + ctx.random() * 0.4, 0.25 + ctx.random() * 0.3, 0.3 + ctx.random() * 0.4, 7, 5, 0.3);
  }
  if (!col) for (let k = 0; k < (lod <= 2 ? 10 : 4); k++) { const a = ctx.random() * 6.283, r = 2 + ctx.random() * 5; K.rock(CX + Math.cos(a) * r, hd(r) - 0.1, Math.sin(a) * r, 0.6 + ctx.random() * 0.6, 0.4 + ctx.random() * 0.4, 0.5 + ctx.random() * 0.6, 8, 5, 0.3); }
  // ---- the adit: gravel floor, plank lagging behind squared timber sets, a black throat at the back
  K.paint(TX.gravel, "oklch(0.8 0.01 80)");
  K.box(FX - 1.6, -0.3, -1.7, 5, 0.03, 1.7);
  K.paint(TX.oak, "oklch(0.7 0.03 60)", 0.9);
  K.box(FX - 0.6, 0, 1.55, 5, 3.3, 1.75); K.box(FX - 0.6, 0, -1.75, 5, 3.3, -1.55); K.box(FX - 0.6, 3.25, -1.75, 5, 3.45, 1.75);
  K.paint(null, "#050404", 1); K.box(4.6, 0, -1.6, 4.8, 3.3, 1.6);
  K.paint(TX.log, "oklch(0.82 0.03 60)", 0.9);
  for (let x = FX - 0.5; x < 4.6; x += 1.3) {
    if (col && x > FX) continue;
    const w = x < FX ? 0.17 : 0.12;
    K.bbox(x - w, 0, 1.25, x + w, 3.25, 1.55); K.bbox(x - w, 0, -1.55, x + w, 3.25, -1.25);
    K.bbox(x - w, 3.0, -1.7, x + w, 3.3, 1.7);
  }
  if (!col) { // the outer set: a heavy cap overhanging, two braces, a board with a carved crow's foot
    K.bbox(FX - 0.75, 3.3, -2.3, FX - 0.25, 3.7, 2.3, 0.04);
    K.seg([FX - 0.5, 2.0, -1.55], [FX - 0.5, 3.35, -2.1], 0.07, 0.07, 6); K.seg([FX - 0.5, 2.0, 1.55], [FX - 0.5, 3.35, 2.1], 0.07, 0.07, 6);
    K.paint(TX.oak, "oklch(0.85 0.04 65)"); K.bbox(FX - 0.85, 3.75, -0.7, FX - 0.75, 4.3, 0.7, 0.02);
    K.paint(null, "#1a1512", 1);
    for (const [dz, dy] of [[0, 0.16], [-0.16, 0.12], [0.16, 0.12]]) K.seg([FX - 0.87, 3.88, 0], [FX - 0.87, 3.88 + dy, dz], 0.025, 0.02, 4);
    K.seg([FX - 0.87, 3.82, 0], [FX - 0.87, 3.88, 0], 0.025, 0.025, 4);
    // webs spilling out of the dark
    for (const [x, s] of [[3.9, 1.0], [2.6, 0.7], [1.2, 0.5]]) { K.web([x, 3.24, 1.54], [0, -1, 0], [0, 0, -1], s); K.web([x + 0.4, 3.24, -1.54], [0, -1, 0], [0, 0, 1], s * 0.9); }
    K.web([FX - 0.4, 3.24, 1.5], [0, -1, 0], [0, 0, -1], 0.45);
  }
  // ---- ore rails out of the mouth: two iron bars on sleepers, curving to a tipped cart
  if (!col) {
    K.paint(TX.log, "oklch(0.6 0.02 60)", 0.95);
    for (let x = 4.4; x > -9.5; x -= 0.6) K.box(x - 0.09, 0.0, -0.75, x + 0.09, 0.08, 0.75);
    K.paint(TX.iron, "oklch(0.7 0.01 60)", 0.5, 0.8);
    for (const z of [-0.5, 0.5]) K.box(-9.5, 0.08, z - 0.035, 4.4, 0.15, z + 0.035);
  }
  K.at(() => { // the cart, jumped the rails, tipped on its side, ore spilled
    K.paint(TX.oak, "oklch(0.72 0.04 55)", 0.9);
    K.bbox(-0.7, 0.25, -0.5, 0.7, 1.05, 0.5);
    if (col) return;
    K.paint(TX.iron, "oklch(0.6 0.01 60)", 0.5, 0.8);
    for (const x of [-0.6, 0.6]) K.box(x - 0.04, 0.24, -0.53, x + 0.04, 1.07, 0.53);
    for (const x of [-0.45, 0.45]) for (const z of [-0.55, 0.55]) K.seg([x, 0.22, z], [x, 0.22, z + Math.sign(z) * 0.08], 0.22, 0.22, 10, true);
  }, -6.2, 0, 1.3, 25, 0, 0);
  if (!col) { K.paint(TX.rock, "oklch(0.55 0.02 250)", 0.7, 0.2); for (let k = 0; k < 14; k++) K.rock(-6.6 + ctx.random() * 1.4, 0.08, 2.2 + ctx.random() * 1.3, 0.12 + ctx.random() * 0.1, 0.09, 0.12, 6, 4, 0.3); }
  // ---- the spoil heap, grey tailings slumped against the knoll
  K.paint(TX.gravel, "oklch(0.72 0.01 80)", 1);
  if (col) K.box(-5.2, -0.3, -7.2, -1.6, 1.6, -3.6);
  else { if (lod <= 2) ctx.smooth(); K.rock(-3.4, -0.2, -5.4, 2.2, 1.9, 2.0, 12, 7, 0.12); ctx.flat(); K.paint(TX.rock, "oklch(0.8 0.01 90)"); for (let k = 0; k < 9; k++) K.rock(-3.4 + (ctx.random() - 0.5) * 4, 0.1, -5.4 + (ctx.random() - 0.5) * 4, 0.2, 0.15, 0.2, 6, 4, 0.3); }
  // ---- the hoist frame: four raking legs, cross braces, a spoked sheave wheel up top
  K.paint(TX.log, "oklch(0.78 0.03 60)", 0.9);
  const hx = -2.8, hz = 4.6, top = 6.6;
  const legs = [[-1.4, -1.4], [1.4, -1.4], [1.4, 1.4], [-1.4, 1.4]];
  for (const [dx, dz] of legs) K.seg([hx + dx, -0.3, hz + dz], [hx + dx * 0.3, top, hz + dz * 0.3], 0.13, 0.11, col ? 4 : 7, true);
  if (!col) {
    for (const yy of [2.2, 4.4]) { const f = 1 - (yy / top) * 0.7; for (let i = 0; i < 4; i++) { const [ax, az] = legs[i], [bx, bz] = legs[(i + 1) % 4]; K.seg([hx + ax * f, yy, hz + az * f], [hx + bx * f, yy, hz + bz * f], 0.07, 0.07, 5); } }
    K.bbox(hx - 0.6, top, hz - 0.6, hx + 0.6, top + 0.18, hz + 0.6);
    K.paint(TX.iron, "oklch(0.55 0.01 60)", 0.6, 0.7);
    const W = [hx, top + 0.95, hz], n = 12;
    for (let k = 0; k < n; k++) { const a = (k / n) * 6.283, b = ((k + 1) / n) * 6.283; K.seg([W[0] + Math.cos(a) * 0.75, W[1] + Math.sin(a) * 0.75, W[2]], [W[0] + Math.cos(b) * 0.75, W[1] + Math.sin(b) * 0.75, W[2]], 0.05, 0.05, 5); if (k % 2 === 0) K.seg(W, [W[0] + Math.cos(a) * 0.72, W[1] + Math.sin(a) * 0.72, W[2]], 0.025, 0.025, 4); }
    K.seg([W[0], W[1], W[2] - 0.15], [W[0], W[1], W[2] + 0.15], 0.08, 0.08, 6, true);
    K.paint(null, "#2a2622", 1); K.seg([hx - 0.75, W[1], hz], [hx - 0.75, 0.3, hz], 0.015, 0.015, 4);
    // a dropped pick and a split lamp-oil cask by the mouth
    K.paint(TX.log, "oklch(0.8 0.04 60)"); K.seg([-1.8, 0.05, -2.2], [-2.9, 0.05, -2.6], 0.03, 0.03, 5);
    K.paint(TX.iron, "oklch(0.5 0.01 60)", 0.5, 0.8); K.seg([-2.9, 0.05, -2.95], [-2.9, 0.12, -2.25], 0.035, 0.02, 5);
    K.paint(TX.oak, "oklch(0.7 0.05 60)"); K.at(() => K.cyl(0, 0, 0, 0.3, 0.34, 0.75, 10), -2.2, 0.32, 2.9, 0, 90, 0);
  }
}
export function geometry(ctx) { const K0 = kit(ctx, false); K0.at(() => build(ctx, false), 0, 0, 0, -90); }
export function collider(ctx) { const K0 = kit(ctx, true); K0.at(() => build(ctx, true), 0, 0, 0, -90); }
