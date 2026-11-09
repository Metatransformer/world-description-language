// A ground accent patch (~1.2 m): a few low cushions hugging the ground under a clump, never a carpet.
// params.kind: moss (green cushions) | mud (dark wet ovals) | duff (needle/leaf litter) | dirt (bare earth) | scree (small stones).
// params.seed shapes it. A few dozen faces; lod 4+ keeps 2 cushions.
import { G, rng } from "../lib/geo.js";
const LOOK = {
  moss: { col: ["oklch(0.36 0.06 145)", "oklch(0.31 0.05 140)", "oklch(0.41 0.065 135)"], h: 0.07, r: [0.18, 0.4] },
  mud: { col: ["oklch(0.28 0.03 60)", "oklch(0.24 0.025 55)"], h: 0.015, r: [0.25, 0.5] },
  duff: { col: ["oklch(0.36 0.05 55)", "oklch(0.42 0.06 65)", "oklch(0.3 0.04 50)"], h: 0.02, r: [0.2, 0.42] },
  dirt: { col: ["oklch(0.4 0.04 65)", "oklch(0.46 0.045 70)"], h: 0.012, r: [0.25, 0.5] },
  scree: { col: ["oklch(0.55 0.01 240)", "oklch(0.47 0.012 230)", "oklch(0.62 0.01 90)"], h: 0.09, r: [0.07, 0.16] },
};
export function geometry(ctx) {
  const g = new G(ctx), lod = ctx.lod || 1, R = rng(9100 + (ctx.params.seed ?? 1) * 17), L = LOOK[ctx.params.kind] ?? LOOK.moss;
  const n = ctx.params.kind === "scree" ? (lod >= 4 ? 3 : 7) : lod >= 4 ? 2 : 4, seg = lod >= 4 ? 5 : 7;
  for (let i = 0; i < n; i++) {
    const cx = (R() - 0.5) * 1.0, cz = (R() - 0.5) * 1.0, r = L.r[0] + R() * (L.r[1] - L.r[0]), h = L.h * (0.6 + R() * 0.8), sq = 0.6 + R() * 0.5;
    const ring = [];
    for (let s = 0; s < seg; s++) { const a = (s / seg) * 6.2832, k = r * (0.75 + R() * 0.4); ring.push([cx + Math.cos(a) * k, -0.02, cz + Math.sin(a) * k * sq]); }
    const top = [cx, h, cz];
    ctx.color(L.col[Math.floor(R() * L.col.length)]);
    for (let s = 0; s < seg; s++) { const a = ring[s], b = ring[(s + 1) % seg]; g.tri(top, b, a); }
  }
  ctx.color(null);
}
