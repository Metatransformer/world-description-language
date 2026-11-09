// A knee-high heather clump for the downs: a dark woody mound bristling with flower spikes.
// params.hue (default 320 purple; ~35 = rust bracken), params.seed shapes it.
import { G, rng } from "../lib/geo.js";
export function geometry(ctx) {
  const g = new G(ctx), lod = ctx.lod || 1, R = rng(7100 + (ctx.params.seed ?? 1) * 13), hue = ctx.params.hue ?? 320;
  ctx.color("oklch(0.34 0.04 120)");
  g.tris(g.blob([0, 0, 0], [0.55, 0.28, 0.5], lod >= 3 ? 0 : 1, 0.3, 1.4, ctx.params.seed ?? 1, -0.02));
  const n = [0, 110, 60, 30, 14, 6][lod] ?? 6;
  for (let i = 0; i < n; i++) {
    const a = R() * 6.283, d = Math.sqrt(R()) * 0.55, x = Math.cos(a) * d, z = Math.sin(a) * d;
    const base = 0.24 * (1 - (d / 0.6) ** 2), h = base + 0.06 + R() * 0.09, lean = (R() - 0.5) * 0.1, w = 0.025 + R() * 0.02;
    ctx.color(`oklch(${0.38 + R() * 0.12} ${0.08 + R() * 0.04} ${hue + (R() - 0.5) * 24})`);
    const yaw = R() * 3.14, cx = Math.cos(yaw) * w, cz = Math.sin(yaw) * w, top = [x + lean, h, z + lean];
    g.tri([x - cx, base, z - cz], [x + cx, base, z + cz], top); g.tri([x + cx, base, z + cz], [x - cx, base, z - cz], top);
    g.tri([x + cz, base, z - cx], [x - cz, base, z + cx], top); g.tri([x - cz, base, z + cx], [x + cz, base, z - cx], top);
  }
  ctx.color(null);
}
