// The Ridgeback overlook: a flat lichen-stone ledge jutting out from the ridge (front −Z, the view side),
// a low dry-stone parapet round its lip with a gap at the back where the path steps on, a weathered oak bench
// facing the view, and rock buttresses under the slab so it reads as the ridge's own bone. Origin = path end, ground.
import { G, TEX, mossyRock } from "../lib/geo.js";
const W = 6, D = 5, T = 0.7, OAK = "cdn/texture-dark-weathered-oak-planks.png";
export function geometry(ctx) {
  ctx.roughness?.(1); ctx.metalness?.(0);
  const g = new G(ctx), lod = ctx.lod || 1, det = lod <= 1 ? 3 : lod <= 3 ? 2 : 1;
  // the slab and the rocks it grows from
  mossyRock(g, [0, -0.2, -D / 2], [W / 2 + 0.4, T, D / 2 + 0.3], det, 11, { rock: TEX.rock, moss: TEX.moss, amp: 0.12, floor: -0.9 });
  mossyRock(g, [-1.6, -1.8, -D + 1.2], [1.6, 1.9, 1.4], det, 12, { rock: TEX.rock, moss: TEX.moss });
  mossyRock(g, [1.8, -2.2, -D + 1.6], [1.4, 2.2, 1.3], det, 13, { rock: TEX.rock, moss: TEX.moss });
  if (lod <= 3) mossyRock(g, [0.2, -3, -D + 0.6], [1.8, 2.4, 1.2], det, 14, { rock: TEX.rock, moss: TEX.moss });
  // parapet: front lip and the two sides, open at the back (z≈0)
  ctx.albedo(TEX.rock); ctx.color("oklch(0.8 0.015 90)");
  const wall = (x0, z0, x1, z1) => {
    const L = Math.hypot(x1 - x0, z1 - z0), per = Math.max(2, Math.round(L / (lod >= 3 ? 1.2 : 0.55))), rows = lod >= 3 ? 1 : 2;
    for (let r = 0; r < rows; r++) for (let i = 0; i < per; i++) {
      const t = (i + (r % 2) * 0.5 + 0.25) / per; if (t > 1) continue;
      g.tris(g.blob([x0 + (x1 - x0) * t, T * 0.45 + (r + 0.5) * 0.3, z0 + (z1 - z0) * t], [L / per * 0.6, 0.2, 0.28], 0, 0.2, 1.5, r * 17 + i + x0 * 5 + z0));
    }
  };
  const y = T * 0.45, F = -D + 0.35, S = W / 2 - 0.3;
  wall(-S, F, S, F); wall(-S, F, -S, -1.2); wall(S, F, S, -1.2);
  // bench facing the view
  ctx.albedo(OAK); ctx.color("oklch(0.58 0.035 65)");
  g.box(0, y + 0.45, -2.2, 1.8, 0.07, 0.4);
  g.box(0, y + 0.85, -1.98, 1.8, 0.24, 0.05);
  for (const x of [-0.75, 0.75]) { g.box(x, y + 0.22, -2.3, 0.1, 0.45, 0.1); g.box(x, y + 0.42, -2.0, 0.1, 0.85, 0.1); }
  ctx.albedo(null); ctx.color(null);
}
export function collider() { return [
  { kind: "box", width: W, height: 1.2, depth: D, center: [0, T * 0.45 - 0.6, -D / 2] },
  { kind: "box", width: W - 0.4, height: 0.9, depth: 0.5, center: [0, T * 0.45 + 0.45, -D + 0.35] },
  { kind: "box", width: 0.5, height: 0.9, depth: D - 1.4, center: [-W / 2 + 0.3, T * 0.45 + 0.45, -D / 2 - 0.5] },
  { kind: "box", width: 0.5, height: 0.9, depth: D - 1.4, center: [W / 2 - 0.3, T * 0.45 + 0.45, -D / 2 - 0.5] },
]; }
