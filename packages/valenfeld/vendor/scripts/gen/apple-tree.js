// An orchard apple tree, pruned low: a short leaning trunk forking into 3-4 limbs, a round open crown of
// leaf clumps, red-gold apples hung through it and a few windfalls in the grass. ~4 m tall. params.seed.
import { G, rng } from "../lib/geo.js";
const BARK = "cdn/texture-dark-weathered-oak-planks.png";
export function geometry(ctx) {
  ctx.roughness?.(1); ctx.metalness?.(0);
  const g = new G(ctx), lod = ctx.lod || 1, R = rng(7100 + (ctx.params.seed ?? 1) * 37);
  const lean = [(R() - 0.5) * 0.5, (R() - 0.5) * 0.5], top = [lean[0], 1.3, lean[1]];
  ctx.albedo(BARK); ctx.color("oklch(0.48 0.03 55)");
  g.tube([[0, -0.1, 0, 0.17], [lean[0] * 0.5, 0.7, lean[1] * 0.5, 0.14], [...top, 0.12]], 7);
  const limbs = 3 + (R() > 0.5 ? 1 : 0), tips = [];
  for (let i = 0; i < limbs; i++) {
    const a = (i / limbs) * 6.283 + R() * 0.8, r = 1.1 + R() * 0.5, tip = [top[0] + Math.cos(a) * r, 2.3 + R() * 0.7, top[2] + Math.sin(a) * r];
    tips.push(tip);
    if (lod <= 3) g.tube([[...top, 0.1], [(top[0] + tip[0]) / 2, (top[1] + tip[1]) / 2 + 0.2, (top[2] + tip[2]) / 2, 0.07], [...tip, 0.04]], 5);
  }
  // crown: leaf clumps
  ctx.albedo(null);
  const clumps = lod >= 4 ? 1 : lod >= 3 ? 3 : 7;
  if (clumps === 1) { ctx.color("oklch(0.5 0.1 135)"); g.tris(g.blob([top[0], 2.9, top[2]], [2, 1.3, 2], 1, 0.2, 1.2, 3)); }
  else for (let i = 0; i < clumps; i++) {
    const t = tips[i % tips.length], c = [t[0] + (R() - 0.5) * 0.9, t[1] + 0.3 + R() * 0.5, t[2] + (R() - 0.5) * 0.9];
    ctx.color(`oklch(${0.46 + R() * 0.1} 0.11 ${128 + R() * 14})`);
    g.tris(g.blob(c, [0.9 + R() * 0.4, 0.7 + R() * 0.3, 0.9 + R() * 0.4], lod <= 1 ? 2 : 1, 0.3, 1.6, i * 13 + 5));
  }
  // apples
  if (lod <= 2) for (let i = 0; i < 16; i++) {
    const t = tips[i % tips.length], a = R() * 6.283, rr = 0.7 + R() * 0.4;
    ctx.color(R() > 0.3 ? "oklch(0.55 0.17 28)" : "oklch(0.75 0.14 90)");
    g.tris(g.blob([t[0] + Math.cos(a) * rr, t[1] + (R() - 0.3) * 0.8, t[2] + Math.sin(a) * rr], [0.07, 0.07, 0.07], 0, 0.05, 1, i));
  }
  if (lod <= 2) for (let i = 0; i < 4; i++) { ctx.color("oklch(0.5 0.15 30)"); g.tris(g.blob([(R() - 0.5) * 2.5, 0.03, (R() - 0.5) * 2.5], [0.07, 0.06, 0.07], 0, 0.05, 1, 90 + i)); }
  ctx.color(null);
}
export function collider() { return [{ kind: "cylinder", radiusTop: 0.15, radiusBottom: 0.2, height: 1.4, center: [0, 0.7, 0] }]; }
