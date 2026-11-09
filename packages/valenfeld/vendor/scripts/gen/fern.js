// A woodland fern: arching fronds from one crown, each a spine with paired leaflets shrinking to the tip.
import { G, rng } from "../lib/geo.js";
export function geometry(ctx) {
  const g = new G(ctx), lod = ctx.lod || 1, R = rng(3000 + (ctx.params.seed ?? 1) * 13);
  const nf = lod <= 1 ? 9 : lod <= 2 ? 7 : 5, nl = lod <= 1 ? 10 : lod <= 2 ? 7 : 4;
  for (let i = 0; i < nf; i++) {
    const a = (i / nf) * 6.283 + R() * 0.5, len = 0.75 + R() * 0.45, dx = Math.cos(a), dz = Math.sin(a), sx = -dz, sz = dx;
    const sp = (t) => { const d = len * t; return [dx * d, len * (0.95 * Math.sin(t * 2.0) - 0.75 * t * t), dz * d]; };
    ctx.color(`oklch(${(0.48 + R() * 0.12).toFixed(3)} 0.11 ${(128 + R() * 14).toFixed(1)})`);
    for (let k = 0; k < nl; k++) {
      const t0 = 0.12 + 0.88 * (k / nl), t1 = 0.12 + 0.88 * ((k + 1) / nl), p0 = sp(t0), p1 = sp(t1), lf = 0.2 * (1 - t0) + 0.03;
      const mid = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2 - lf * 0.25, (p0[2] + p1[2]) / 2];
      g.tri(p0, [mid[0] + sx * lf, mid[1], mid[2] + sz * lf], p1);
      g.tri(p0, p1, [mid[0] - sx * lf, mid[1], mid[2] - sz * lf]);
    }
    const b = sp(0.12);
    g.tri([0, 0, 0], [b[0] + sx * 0.012, b[1], b[2] + sz * 0.012], [b[0] - sx * 0.012, b[1], b[2] - sz * 0.012]);
  }
  ctx.color(null);
}
