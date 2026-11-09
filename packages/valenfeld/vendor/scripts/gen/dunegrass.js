// Saltmarch marram: one tuft of stiff, pale, arching blades, the kind that holds a dune together. A
// scatter template (or a decoration layer's item): each blade a three-segment strip bowing outward,
// drawn both sides, straw at the tip and sea-green at the root. params.seed shapes the tuft.
import { rng } from "../lib/geo.js";
export function geometry(ctx) {
  const lod = ctx.lod || 1, R = rng(13000 + (ctx.params.seed ?? 1) * 7);
  const n = [0, 14, 10, 7, 5, 4][lod], segs = lod <= 2 ? 3 : 2;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * 6.283 + R() * 0.8, h = 0.55 + R() * 0.45, out = 0.15 + R() * 0.35, w = 0.022 + R() * 0.012;
    const dx = Math.cos(a), dz = Math.sin(a), sx = -dz, sz = dx, r0 = R() * 0.08;
    const P = (t) => [dx * (r0 + out * t * t), h * Math.sin(t * 1.35) / Math.sin(1.35), dz * (r0 + out * t * t)];
    const straw = R() < 0.35;
    for (let k = 0; k < segs; k++) {
      const t0 = k / segs, t1 = (k + 1) / segs, p0 = P(t0), p1 = P(t1), w0 = w * (1 - t0 * 0.9), w1 = w * (1 - t1 * 0.9);
      ctx.color(straw ? `oklch(${(0.74 + 0.08 * t0).toFixed(3)} 0.06 88)` : `oklch(${(0.6 + 0.16 * t0).toFixed(3)} ${(0.07 - 0.03 * t0).toFixed(3)} ${(125 - 30 * t0).toFixed(1)})`);
      ctx.quad(p0[0] + sx * w0, p0[1], p0[2] + sz * w0, p0[0] - sx * w0, p0[1], p0[2] - sz * w0, p1[0] - sx * w1, p1[1], p1[2] - sz * w1, p1[0] + sx * w1, p1[1], p1[2] + sz * w1);
    }
  }
  ctx.color(null);
}
