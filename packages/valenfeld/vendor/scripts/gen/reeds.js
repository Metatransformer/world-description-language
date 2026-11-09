// A clump of river reeds and cattails: tall tapered blades leaning out, a few brown cattail heads.
// params.seed varies the clump; params.cat (0..1) how many stalks carry a head.
import { G, rng } from "../lib/geo.js";
export function geometry(ctx) {
  const g = new G(ctx), R = rng(7100 + (ctx.params.seed ?? 1) * 13), cat = ctx.params.cat ?? 0.35;
  const lod = ctx.lod || 1, n = lod >= 4 ? 4 : lod >= 3 ? 8 : 14;
  for (let i = 0; i < n; i++) {
    const x = (R() - 0.5) * 0.7, z = (R() - 0.5) * 0.7, h = 1.1 + R() * 0.9;
    const lean = 0.08 + R() * 0.25, a = R() * 6.283, tx = x + Math.cos(a) * lean, tz = z + Math.sin(a) * lean;
    const w = 0.018 + R() * 0.014, mx = x + (tx - x) * 0.4, mz = z + (tz - z) * 0.4, my = h * 0.55;
    ctx.color(`oklch(${0.48 + R() * 0.12} ${0.07 + R() * 0.04} ${115 + R() * 25})`);
    // two crossed tapered blades, both faces
    for (const [dx, dz] of [[w, 0], [0, w]]) {
      g.tri([x - dx, 0, z - dz], [x + dx, 0, z + dz], [mx + dx * 0.6, my, mz + dz * 0.6]);
      g.tri([x - dx, 0, z - dz], [mx + dx * 0.6, my, mz + dz * 0.6], [mx - dx * 0.6, my, mz - dz * 0.6]);
      g.tri([mx - dx * 0.6, my, mz - dz * 0.6], [mx + dx * 0.6, my, mz + dz * 0.6], [tx, h, tz]);
      g.tri([x + dx, 0, z + dz], [x - dx, 0, z - dz], [mx + dx * 0.6, my, mz + dz * 0.6]);
      g.tri([mx + dx * 0.6, my, mz + dz * 0.6], [x - dx, 0, z - dz], [mx - dx * 0.6, my, mz - dz * 0.6]);
      g.tri([mx + dx * 0.6, my, mz + dz * 0.6], [mx - dx * 0.6, my, mz - dz * 0.6], [tx, h, tz]);
    }
    if (R() < cat && lod < 4) {
      // cattail head: a brown four-sided spindle just under the tip
      const hx = x + (tx - x) * 0.85, hz = z + (tz - z) * 0.85, hy = h * 0.85, r = 0.03, L = 0.16;
      ctx.color(`oklch(0.34 0.06 ${45 + R() * 15})`);
      const ring = [[r, 0], [0, r], [-r, 0], [0, -r]];
      for (let k = 0; k < 4; k++) {
        const [ax, az] = ring[k], [bx, bz] = ring[(k + 1) % 4];
        g.tri([hx, hy - L * 0.6, hz], [hx + bx, hy, hz + bz], [hx + ax, hy, hz + az]);
        g.tri([hx, hy + L * 0.6, hz], [hx + ax, hy, hz + az], [hx + bx, hy, hz + bz]);
      }
    }
  }
  ctx.color(null);
}
