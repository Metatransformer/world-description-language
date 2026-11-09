// A clump of meadow wildflowers: thin stems, a few leaves, star heads in the clump's colour
// (params.hue; params.l lightness), for the glades by the road.
import { G, rng } from "../lib/geo.js";
export function geometry(ctx) {
  const g = new G(ctx), R = rng(6000 + (ctx.params.seed ?? 1) * 11), hue = ctx.params.hue ?? 300, L = ctx.params.l ?? 0.7;
  const n = (ctx.lod || 1) >= 4 ? 2 : (ctx.lod || 1) >= 3 ? 4 : 7;
  for (let i = 0; i < n; i++) {
    const x = (R() - 0.5) * 0.5, z = (R() - 0.5) * 0.5, h = 0.25 + R() * 0.3, bx = x + (R() - 0.5) * 0.1, bz = z + (R() - 0.5) * 0.1;
    ctx.color("oklch(0.5 0.1 135)");
    g.tri([x - 0.006, 0, z], [x + 0.006, 0, z], [bx, h, bz]); g.tri([x, 0, z - 0.006], [x, 0, z + 0.006], [bx, h, bz]);
    g.tri([x, 0.05, z], [x + 0.08, 0.12, z + 0.02], [x + 0.02, 0.16, z]);
    ctx.color(`oklch(${L} 0.17 ${hue + (R() - 0.5) * 20})`);
    const r = 0.035 + R() * 0.02;
    for (let p = 0; p < 5; p++) { const a = p / 5 * 6.283 + i, b = a + 0.5; g.tri([bx, h, bz], [bx + Math.cos(a) * r, h + 0.005, bz + Math.sin(a) * r], [bx + Math.cos(b) * r * 0.5, h, bz + Math.sin(b) * r * 0.5]); g.tri([bx, h, bz], [bx + Math.cos(b) * r * 0.5, h, bz + Math.sin(b) * r * 0.5], [bx + Math.cos(a) * r, h + 0.005, bz + Math.sin(a) * r]); }
    ctx.color("oklch(0.85 0.15 90)"); g.tri([bx - 0.01, h + 0.01, bz], [bx + 0.01, h + 0.01, bz - 0.01], [bx, h + 0.01, bz + 0.012]);
  }
  ctx.color(null);
}
