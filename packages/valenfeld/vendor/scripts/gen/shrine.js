// A wayside shrine: a fieldstone pier with a carved niche under a little slate roof, an offering
// ledge with a candle stub (the flame is an fx on the shrine's child), a sprig of dried flowers.
import { G, TEX } from "../lib/geo.js";
// params.style: valley (default) | desert (sandstone, clay tiles) | coastal (granite, tarred boards)
const STY = { valley: { stone: TEX.fieldstone, roof: TEX.slate }, desert: { stone: "cdn/texture-sandstone-blocks-weathered.png", roof: "cdn/texture-sun-baked-clay-roof-tiles.png" }, coastal: { stone: "cdn/texture-salt-weathered-grey-granite-blocks.png", roof: "cdn/texture-tarred-black-weatherboard-planks.png" } };
export function geometry(ctx) {
  const S = STY[ctx.params?.style] ?? STY.valley;
  const g = new G(ctx);
  ctx.albedo(S.stone); ctx.color("oklch(0.93 0.01 80)");
  g.box(0, 0.15, 0, 1.2, 0.3, 1.0);
  g.box(0, 0.3 + 0.45, 0.1, 0.8, 0.9, 0.6);
  g.box(-0.34, 1.45, 0.1, 0.12, 0.5, 0.6); g.box(0.34, 1.45, 0.1, 0.12, 0.5, 0.6); g.box(0, 1.45, 0.34, 0.8, 0.5, 0.12);
  g.box(0, 1.25, -0.35, 1.0, 0.07, 0.4); // offering ledge
  g.box(0, 1.73, 0.1, 0.9, 0.06, 0.7);
  ctx.albedo(S.roof); ctx.color("oklch(0.9 0.02 240)");
  const r = [[-0.6, 1.76, -0.35], [0.6, 1.76, -0.35], [0.6, 1.76, 0.55], [-0.6, 1.76, 0.55]], top = [[-0.6, 2.1, 0.1], [0.6, 2.1, 0.1]];
  g.quad(r[0], top[0], top[1], r[1]); g.quad(r[2], top[1], top[0], r[3]); g.tri(r[3], top[0], r[0]); g.tri(r[1], top[1], r[2]);
  ctx.albedo(null); ctx.color("oklch(0.75 0.12 85)"); // a little brass sun disc in the niche
  for (let i = 0; i < 10; i++) { const a0 = i / 10 * 6.283, a1 = (i + 1) / 10 * 6.283; g.tri([0, 1.5, 0.27], [Math.cos(a1) * 0.13, 1.5 + Math.sin(a1) * 0.13, 0.27], [Math.cos(a0) * 0.13, 1.5 + Math.sin(a0) * 0.13, 0.27]); }
  ctx.smooth(); ctx.color("oklch(0.93 0.03 90)");
  g.tube([[0.1, 1.28, -0.4, 0.035], [0.1, 1.42, -0.4, 0.035], [0.1, 1.42, -0.4, 0.0]], 8, { capA: true });
  ctx.color("oklch(0.6 0.1 60)"); g.tube([[0.1, 1.42, -0.4, 0.003], [0.1, 1.45, -0.4, 0.003]], 3);
  ctx.color("oklch(0.6 0.1 30)"); for (let i = 0; i < 4; i++) g.tube([[-0.25, 1.29, -0.4, 0.008], [-0.3 + i * 0.04, 1.5, -0.45 - i * 0.02, 0.005]], 3);
  ctx.color(null); ctx.flat();
}
export function collider() { return { kind: "box", width: 1.2, height: 1.8, depth: 1.0 }; }
