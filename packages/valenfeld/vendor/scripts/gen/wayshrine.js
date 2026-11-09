// THE WAYFARER'S SHRINE: a roadside cairn-pillar with a slate-roofed niche, a small carved wooden saint
// (barefoot, his boots long stolen), candle stubs and a coin bowl; beside it, Old Corvin's lean-to of poles
// and stitched canvas over a bedroll, and a log he sits on. Origin = ground at the shrine; it faces -Z.
import { kit } from "./barrow-kit.js";
const TX0 = { stone: "cdn/texture-fieldstone-wall-mossy.png", slate: "cdn/texture-slate-roof-tiles-mossy.png", oak: "cdn/texture-dark-oak-planks-weathered.png", log: "cdn/texture-pine-bark-rough.png", canvas: "cdn/texture-canvas-weathered.png", iron: "cdn/texture-wrought-iron.png" };
// params.style: valley (default) | desert (sandstone, clay cap, driftwood) | coastal (granite, tarred cap and saint)
const TXS = { desert: { stone: "cdn/texture-sandstone-blocks-weathered.png", slate: "cdn/texture-sun-baked-clay-roof-tiles.png", oak: "cdn/texture-sun-bleached-grey-driftwood-planks.png", log: "cdn/texture-sun-bleached-grey-driftwood-planks.png" }, coastal: { stone: "cdn/texture-salt-weathered-grey-granite-blocks.png", slate: "cdn/texture-tarred-black-weatherboard-planks.png" } };
let TX;
function build(ctx, col) {
  TX = { ...TX0, ...(TXS[ctx.params?.style] ?? {}) };
  const K = kit(ctx, col);
  // ---- the pillar: a stepped fieldstone base, the niche, a gabled slate cap
  K.paint(TX.stone, "oklch(0.88 0.012 90)");
  K.bbox(-0.75, -0.3, -0.6, 0.75, 0.35, 0.6, 0.04);
  K.bbox(-0.5, 0.35, -0.4, 0.5, 1.0, 0.4, 0.03);
  K.box(-0.5, 1.0, 0.05, 0.5, 1.75, 0.4); K.box(-0.5, 1.0, -0.4, -0.38, 1.75, 0.05); K.box(0.38, 1.0, -0.4, 0.5, 1.75, 0.05);
  K.bbox(-0.55, 1.75, -0.45, 0.55, 1.85, 0.45, 0.02);
  if (col) return;
  K.paint(TX.slate, "oklch(0.85 0.02 240)");
  K.quad([-0.65, 1.83, -0.55], [0, 2.2, -0.55], [0, 2.2, 0.55], [-0.65, 1.83, 0.55], [0, 1.9, 0]);
  K.quad([0.65, 1.83, -0.55], [0, 2.2, -0.55], [0, 2.2, 0.55], [0.65, 1.83, 0.55], [0, 1.9, 0]);
  // the saint: a whittled figure, robe, round head, bare feet
  K.paint(TX.oak, "oklch(0.92 0.05 70)", 0.8);
  K.seg([0, 1.04, 0.15], [0, 1.42, 0.15], 0.1, 0.06, 8, true);
  K.rock(0, 1.5, 0.15, 0.065, 0.075, 0.065, 8, 6, 0.04);
  K.seg([-0.08, 1.3, 0.15], [0.05, 1.22, 0.06], 0.02, 0.018, 5); // a hand held out
  // candles and drippings, a copper bowl with no coins in it
  for (const [x, z, h] of [[-0.3, -0.28, 0.12], [-0.18, -0.3, 0.07], [0.26, -0.26, 0.1], [0.34, -0.12, 0.05]]) {
    K.paint(null, "oklch(0.92 0.03 90)", 0.6); K.cyl(x, 1.0, z, 0.025, 0.025, h, 6);
    K.paint(null, "oklch(0.86 0.03 85)", 0.7); K.cyl(x, 1.0, z, 0.045, 0.03, 0.02, 6);
  }
  K.paint(TX.iron, "oklch(0.62 0.08 50)", 0.4, 0.8); K.seg([0, 0.36, -0.42], [0, 0.44, -0.42], 0.06, 0.13, 10, true);
  // a few stones left by walkers on the base, a ribbon tied to a stake
  K.paint(TX.stone, "oklch(0.8 0.01 90)"); for (let k = 0; k < 7; k++) K.rock(-0.6 + ctx.random() * 1.2, 0.38, -0.55 + ctx.random() * 0.2, 0.06, 0.04, 0.05, 5, 3, 0.3);
  K.paint(TX.log, "oklch(0.75 0.03 60)"); K.seg([0.95, -0.2, -0.3], [0.97, 1.2, -0.32], 0.03, 0.025, 5);
  K.paint(null, "oklch(0.52 0.16 28)", 0.9); K.quad([0.97, 1.12, -0.32], [1.02, 1.1, -0.32], [1.12, 0.7, -0.42], [1.07, 0.72, -0.42]);
  // ---- Corvin's lean-to, three metres off: poles, a ridge, canvas sagging between, a bedroll under it
  K.at(() => {
    K.paint(TX.log, "oklch(0.8 0.03 60)");
    for (const x of [-1.1, 1.1]) K.seg([x, -0.1, -0.8], [x, 1.7, 0.2], 0.05, 0.04, 6);
    K.seg([-1.3, 1.65, 0.15], [1.3, 1.65, 0.15], 0.05, 0.05, 6);
    K.paint(TX.canvas, "oklch(0.88 0.03 80)", 0.95);
    for (let i = 0; i < 4; i++) { const x0 = -1.2 + i * 0.6, x1 = x0 + 0.6, s = 0.12; K.quad([x0, 1.66, 0.12], [x1, 1.66, 0.12], [x1, 0.85 - (i % 2 ? s : 0), 1.0], [x0, 0.85 - (i % 2 ? 0 : s), 1.0]); K.quad([x0, 0.85 - (i % 2 ? 0 : s), 1.0], [x1, 0.85 - (i % 2 ? s : 0), 1.0], [x1, 0.02, 1.7], [x0, 0.02, 1.7]); }
    K.paint(null, "oklch(0.42 0.06 40)", 1); K.seg([-0.7, 0.1, 0.95], [0.8, 0.1, 0.95], 0.13, 0.13, 8, true);
    K.paint(TX.log, "oklch(0.7 0.03 55)"); K.seg([-0.9, 0.2, -1.4], [0.9, 0.22, -1.6], 0.2, 0.18, 9, true);
  }, 3.2, 0, 0.8, -25);
}
export function geometry(ctx) { build(ctx, false); }
export function collider(ctx) { build(ctx, true); }
