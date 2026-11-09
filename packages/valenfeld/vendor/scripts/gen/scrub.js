// Sunscar scrub: a knee-high tangle of grey, wind-twisted twigs rising from one root crown, tufted with
// dusty olive leaf clumps at the tips. params.seed shapes it; params.dry: a dead, leafless one.
import { G, rng } from "../lib/geo.js";
const TWIG = "cdn/texture-weathered-grey-dead-wood.png", LEAF = "cdn/texture-dry-olive-scrub-leaves.png";
export function geometry(ctx) {
  const g = new G(ctx), lod = ctx.lod || 1, R = rng(9000 + (ctx.params.seed ?? 1) * 17), dry = !!ctx.params.dry;
  const nb = [0, 13, 9, 6, 4, 3][lod], tips = [];
  ctx.smooth(); ctx.albedo(TWIG); ctx.color("oklch(0.88 0.02 60)");
  for (let b = 0; b < nb; b++) {
    const a = (b / nb) * 6.283 + R() * 0.6, out = 0.35 + R() * 0.5, h = 0.5 + R() * 0.55, tw = (R() - 0.5) * 0.8;
    const p0 = [Math.cos(a) * 0.04, -0.05, Math.sin(a) * 0.04];
    const p1 = [Math.cos(a + tw * 0.5) * out * 0.45, h * 0.5, Math.sin(a + tw * 0.5) * out * 0.45];
    const p2 = [Math.cos(a + tw) * out, h, Math.sin(a + tw) * out];
    g.tube([[...p0, 0.035], [...p1, 0.02], [...p2, 0.006]], lod <= 2 ? 4 : 3);
    tips.push(p2);
    if (lod <= 2) { const s = 0.5 + R() * 0.2, q = [p1[0] + (R() - 0.5) * 0.4, p1[1] + 0.2 + R() * 0.2, p1[2] + (R() - 0.5) * 0.4]; g.tube([[p0[0] + (p1[0] - p0[0]) * s, p0[1] + (p1[1] - p0[1]) * s, p0[2] + (p1[2] - p0[2]) * s, 0.012], [...q, 0.004]], 3); tips.push(q); }
  }
  if (!dry) {
    ctx.albedo(LEAF);
    const det = 0;
    for (let i = 0; i < tips.length; i++) {
      if (lod >= 4 && i % 2) continue;
      const t = tips[i], r = 0.12 + R() * 0.12;
      ctx.color(`oklch(${(0.8 + R() * 0.1).toFixed(3)} 0.05 ${(95 + R() * 30).toFixed(1)})`);
      for (const f of g.blob([t[0], t[1] - r * 0.3, t[2]], [r * 1.3, r, r * 1.3], det, 0.45, 2.3, i)) g.tri(f[0], f[1], f[2]);
    }
  }
  ctx.albedo(null); ctx.color(null); ctx.flat();
}
