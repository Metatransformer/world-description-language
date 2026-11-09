// Marsh edge kit: one object dresses a whole bank. params.pts = [[x, y, z, yaw], ...] local to the feet (sampled on the ground by the placer),
// each point gets two or three reed clumps with cattails (a flat mud shelf was tried Nov 4 and read as a floating slab: dropped).
// critic Nov 4 (Hollowmere r4): the moat read as a dark ring with hard grass lips. Reusable for any moat, pond or slow river bank.
import { G, rng } from "../lib/geo.js";
export function geometry(ctx) {
  const g = new G(ctx), P = ctx.params, pts = P.pts ?? [], mud = P.mud ?? 1, lod = ctx.lod || 1;
  const blades = lod >= 5 ? 2 : lod >= 4 ? 4 : lod >= 3 ? 7 : 12;
  pts.forEach(([px, py, pz, yaw = 0], i) => {
    const R = rng(9100 + i * 31 + (ctx.seed ?? 0)), ca = Math.cos(yaw * Math.PI / 180), sa = Math.sin(yaw * Math.PI / 180);
    // reed clump with a few cattails
    const cl = 2 + Math.floor(R() * 2);
    for (let q = 0; q < cl; q++) { const ox = px + (R() - 0.5) * 1.6 * ca, oz = pz + (R() - 0.5) * 1.6 * sa;
      for (let b = 0; b < blades; b++) {
        const x = ox + (R() - 0.5) * 0.6, z = oz + (R() - 0.5) * 0.6, h = 0.9 + R() * 1.0, lean = 0.08 + R() * 0.3, a = R() * 6.283;
        const tx = x + Math.cos(a) * lean, tz = z + Math.sin(a) * lean, w = 0.02 + R() * 0.015, mx = x + (tx - x) * 0.4, mz = z + (tz - z) * 0.4, my = py + h * 0.55;
        ctx.color(`oklch(${0.46 + R() * 0.14} ${0.06 + R() * 0.04} ${100 + R() * 35})`);
        for (const [dx, dz] of [[w, 0], [0, w]]) {
          const A = [x - dx, py, z - dz], B = [x + dx, py, z + dz], C = [mx + dx * 0.6, my, mz + dz * 0.6], D = [mx - dx * 0.6, my, mz - dz * 0.6], T = [tx, py + h, tz];
          g.tri(A, B, C); g.tri(A, C, D); g.tri(D, C, T); g.tri(B, A, C); g.tri(C, A, D); g.tri(C, D, T);
        }
        if (lod < 3 && R() < 0.3) { const hx = x + (tx - x) * 0.85, hz = z + (tz - z) * 0.85, hy = py + h * 0.85, r = 0.03, Lh = 0.16, ring = [[r, 0], [0, r], [-r, 0], [0, -r]];
          ctx.color(`oklch(0.34 0.06 ${45 + R() * 15})`);
          for (let k = 0; k < 4; k++) { const [ax, az] = ring[k], [bx, bz] = ring[(k + 1) % 4]; g.tri([hx, hy - Lh * 0.6, hz], [hx + bx, hy, hz + bz], [hx + ax, hy, hz + az]); g.tri([hx, hy + Lh * 0.6, hz], [hx + ax, hy, hz + az], [hx + bx, hy, hz + bz]); } }
      } }
  });
  ctx.color(null);
}
