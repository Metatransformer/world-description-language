// A wolf den: a heap of lichened boulders leaning together over a dark hollow whose mouth faces −Z,
// trampled earth at the mouth and gnawed bones strewn about it.
import { G, rng, TEX, mossyRock, bone } from "../lib/geo.js";
const ROCKS = [[-2.4, 0.9, 0.6, 2.0, 1.7, 1.8], [2.3, 0.8, 0.4, 1.9, 1.6, 1.9], [0, 1.75, 0.9, 2.3, 1.15, 1.9], [0.3, 0.9, 2.6, 2.8, 1.9, 1.7], [-3.6, 0.4, -1.0, 1.0, 0.7, 0.9], [3.4, 0.3, -1.3, 0.9, 0.6, 0.8]];
export function geometry(ctx) {
  const g = new G(ctx), lod = ctx.lod || 1, R = rng(ctx.params.seed ?? 3);
  ROCKS.forEach((r, i) => mossyRock(g, [r[0], r[1], r[2]], [r[3], r[4], r[5]], lod <= 1 ? 2 : lod <= 3 ? 1 : 0, i + (ctx.params.seed ?? 3) * 10, { rock: TEX.rock, moss: TEX.moss, mossAt: 0.6, floor: i === 2 ? -1 : (-0.35 - r[1]) / r[4] }));
  ctx.albedo(null); ctx.color("oklch(0.1 0.01 60)");
  g.quad([-0.9, 0.02, 0.2], [0.9, 0.02, 0.2], [0.8, 1.35, 0.15], [-0.8, 1.35, 0.15]); // the hollow's dark throat
  ctx.color("oklch(0.4 0.04 60)");
  for (const t of g.blob([0, -0.02, -1.6], [2.4, 0.06, 1.8], 1, 0.3, 1.5, 9, -0.1)) g.tri(t[0], t[1], t[2]);
  if (lod <= 3) {
    ctx.smooth(); ctx.color("oklch(0.88 0.03 85)");
    for (let i = 0; i < (lod <= 1 ? 12 : 6); i++) { const x = (R() - 0.5) * 4, z = -0.8 - R() * 2.6, a = R() * 6.28, l = 0.25 + R() * 0.35; bone(g, [x, 0.04, z], [x + Math.cos(a) * l, 0.04, z + Math.sin(a) * l], 0.022 + R() * 0.012); }
    // a ribcage arc and a skull
    for (let i = 0; i < 5; i++) { const z = -2.3 + i * 0.12; g.tube([[1.2, 0.03, z, 0.012], [1.35, 0.2, z, 0.014], [1.55, 0.25, z, 0.014], [1.7, 0.08, z, 0.012]], 4); }
    for (const t of g.blob([-1.3, 0.1, -2.0], [0.13, 0.1, 0.2], 1, 0.15, 2, 5, -0.5)) g.tri(t[0], t[1], t[2]);
    ctx.flat();
  }
  ctx.color(null);
}
export function collider() { return ROCKS.map((r) => ({ kind: "sphere", radius: Math.min(r[3], r[4], r[5]) * 0.95, center: [r[0], r[1], r[2]] })); }
