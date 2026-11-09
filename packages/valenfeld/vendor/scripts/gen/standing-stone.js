// A lone standing stone: a tall leaning fieldstone slab, lichen and moss creeping up from the
// north side, a ring of fallen chips and a low packing-stone collar at its foot.
// params.seed shapes it; params.h its height (m, default 4.2).
import { G, rng, TEX, mossyRock } from "../lib/geo.js";
export function geometry(ctx) {
  const g = new G(ctx), lod = ctx.lod || 1, s = ctx.params.seed ?? 1, R = rng(9100 + s * 7), H = ctx.params.h ?? 4.2;
  const det = lod <= 1 ? 2 : lod <= 3 ? 1 : 0;
  // the slab: two stacked blocks, the upper narrower and leaning, so it tapers like a worked menhir
  mossyRock(g, [0, H * 0.4, 0], [0.8, H * 0.6, 0.48], det, s * 10 + 1, { rock: TEX.rock, moss: TEX.moss, mossAt: 0.45, amp: 0.16, floor: -2 / 3 }); // cuts the slab flat at its foot (y 0), wide at the base
  if (lod <= 3) {
    // packing stones round the foot
    const n = lod <= 1 ? 7 : 4;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * 6.283 + R() * 0.5, r = 1.3 + R() * 0.5, k = 0.22 + R() * 0.2;
      mossyRock(g, [Math.cos(a) * r, k * 0.4, Math.sin(a) * r], [k * 1.3, k, k * 1.1], 0, s * 10 + 20 + i, { rock: TEX.rock, moss: TEX.moss, mossAt: 0.2, floor: -0.6 });
    }
  }
  ctx.albedo?.(null); ctx.color(null);
}
export function collider() { return { kind: "box", width: 2.4, height: 4.2, depth: 1.4, center: [0, 2.1, 0] }; }
