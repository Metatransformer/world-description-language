// WHEELBROOK CROSSING (#229): params.part "bridge" = a 7 m plank footbridge over the millrace (span on local X,
// stone abutments, oak stringers, worn planks, post-and-rail sides); "stones" = a stepping-stone ford, flat
// lichen-spotted slabs along local X. Origin = ground at the crossing centre.
import { kit } from "./barrow-kit.js";
const OAK = "cdn/texture-dark-oak-planks-weathered.png", STONE = "cdn/texture-fieldstone-wall-lichen.png";
function bridge(ctx, K, col) {
  const L = 3.5, W = 0.75, top = 0.75;
  K.paint(STONE, "oklch(0.78 0.015 85)");
  for (const s of [-1, 1]) K.bbox(s * L - 0.7, -0.6, -W - 0.3, s * L + 0.7, top - 0.12, W + 0.3, 0.06);
  K.paint(OAK, "oklch(0.58 0.035 55)");
  for (const z of [-W + 0.15, W - 0.15]) K.box(-L, top - 0.32, z - 0.09, L, top - 0.12, z + 0.09);
  const n = col ? 1 : 22;
  if (col) { K.box(-L - 0.7, top - 0.12, -W, L + 0.7, top, W); return; }
  for (let i = 0; i < n; i++) {
    const x0 = -L + (i * 2 * L) / n, x1 = x0 + (2 * L) / n - 0.03, sag = 0.02 * (ctx.random() - 0.5);
    K.paint(OAK, `oklch(${0.6 + ctx.random() * 0.1} 0.035 ${50 + ctx.random() * 12})`);
    K.box(x0, top - 0.12 + sag, -W, x1, top + sag, W);
  }
  K.paint(OAK, "oklch(0.52 0.03 55)");
  for (const z of [-W, W]) {
    for (const x of [-L, -L / 3, L / 3, L]) K.box(x - 0.06, top, z - 0.06, x + 0.06, top + 1.0, z + 0.06);
    K.seg([-L, top + 0.95, z], [L, top + 0.95, z], 0.05, 0.05, 5);
    K.seg([-L, top + 0.5, z], [L, top + 0.5, z], 0.035, 0.035, 5);
  }
  K.paint(STONE, "oklch(0.68 0.05 135)");
  for (let k = 0; k < 8; k++) { const s = k < 4 ? -1 : 1; K.rock(s * (L + 0.4 + ctx.random() * 0.8), -0.1, (ctx.random() - 0.5) * 2.6, 0.3 + ctx.random() * 0.25, 0.22, 0.3, 6, 4, 0.3); }
}
function stones(ctx, K, col) {
  const n = 7;
  for (let i = 0; i < n; i++) {
    const x = -2.7 + i * 0.9 + (ctx.random() - 0.5) * 0.15, z = (ctx.random() - 0.5) * 0.35;
    K.paint(STONE, `oklch(${0.7 + ctx.random() * 0.08} ${0.015 + ctx.random() * 0.03} ${90 + ctx.random() * 45})`);
    if (col) K.box(x - 0.35, -0.5, z - 0.35, x + 0.35, 0.28, z + 0.35);
    else K.rock(x, 0.02, z, 0.38 + ctx.random() * 0.08, 0.26, 0.34 + ctx.random() * 0.08, 7, 4, 0.12);
  }
}
function build(ctx, col) {
  const K = kit(ctx, col);
  if ((ctx.params?.part ?? "bridge") === "stones") stones(ctx, K, col); else bridge(ctx, K, col);
}
export function geometry(ctx) { build(ctx, false); }
export function collider(ctx) { build(ctx, true); }
