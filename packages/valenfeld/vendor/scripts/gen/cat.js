// A small cat sitting upright, tail curled round its front paws, facing -Z. params.col = fur, params.eye = eye glow.
import { G } from "../lib/geo.js";
export function geometry(ctx) {
  const g = new G(ctx), P = ctx.params ?? {}, fur = P.col ?? "oklch(0.16 0.01 280)", eye = P.eye ?? "oklch(0.85 0.17 120)";
  const ell = (c, r, d = 2) => g.tris(g.blob(c, r, d, 0.04, 1.4, 3));
  ctx.color(fur); ctx.roughness(0.9); ctx.smooth();
  ell([0, 0.085, 0.03], [0.085, 0.085, 0.1], ctx.lod > 2 ? 1 : 2);          // haunches
  ell([0, 0.17, -0.02], [0.06, 0.085, 0.06], ctx.lod > 2 ? 1 : 2);          // chest, upright
  ell([0, 0.27, -0.045], [0.055, 0.05, 0.052], ctx.lod > 2 ? 1 : 2);        // head
  if (ctx.lod <= 3) {
    ell([0, 0.255, -0.09], [0.026, 0.02, 0.022], 1);                         // muzzle
    for (const s of [-1, 1]) {
      g.tube([[s * 0.03, 0.02, -0.06, 0.016], [s * 0.032, 0.11, -0.05, 0.018], [s * 0.03, 0.18, -0.03, 0.02]], 6, { capA: true });   // forelegs
      ell([s * 0.03, 0.012, -0.07], [0.018, 0.012, 0.025], 1);              // paws
      ell([s * 0.07, 0.03, -0.01], [0.03, 0.03, 0.06], 1);                  // folded hind feet
    }
    const t = []; for (let i = 0; i <= 10; i++) { const a = -0.3 + i * 0.27; t.push([Math.sin(a) * 0.1, 0.02 + (i > 7 ? (i - 7) * 0.012 : 0), 0.06 - Math.cos(a) * 0.1 + 0.04, 0.016 - i * 0.0008]); }
    g.tube(t, 6, { capB: true });                                           // tail round the paws
  }
  ctx.flat();
  for (const s of [-1, 1]) {                                                // ears
    const b = [s * 0.04, 0.3, -0.045];
    g.tri([b[0] - s * 0.022, b[1], b[2] + 0.012], [s * 0.05, 0.355, -0.05], [b[0] + s * 0.016, b[1] - 0.01, b[2] - 0.012]);
    g.tri([b[0] - s * 0.022, b[1], b[2] + 0.012], [b[0] + s * 0.016, b[1] - 0.01, b[2] - 0.012], [s * 0.05, 0.355, -0.05]);
  }
  ctx.color(eye); ctx.emissive(eye); ctx.roughness(0.2);
  for (const s of [-1, 1]) g.tris(g.blob([s * 0.022, 0.282, -0.088], [0.011, 0.009, 0.006], 1, 0, 1, 0));
  ctx.emissive(null); ctx.color("oklch(0.3 0.04 10)");
  g.tris(g.blob([0, 0.266, -0.111], [0.006, 0.004, 0.004], 1, 0, 1, 0));    // nose
  ctx.color(null); ctx.roughness(null);
}
export function collider() { return { kind: "box", width: 0.2, height: 0.34, depth: 0.28, center: [0, 0.17, 0] }; }
