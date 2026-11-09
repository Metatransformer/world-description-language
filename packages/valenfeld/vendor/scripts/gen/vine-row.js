// A vineyard row: oak posts every 2.5 m strung with two wires, gnarled vine trunks between them trained up
// and along the wire, leafy clumps and purple-black grape bunches. Runs along +X from the origin; params.len (m), params.seed.
import { G, rng } from "../lib/geo.js";
const OAK = "cdn/texture-dark-weathered-oak-planks.png";
export function geometry(ctx) {
  ctx.roughness?.(1); ctx.metalness?.(0);
  const g = new G(ctx), lod = ctx.lod || 1, L = ctx.params.len ?? 12, R = rng(4400 + (ctx.params.seed ?? 1) * 31);
  const posts = Math.max(2, Math.round(L / 2.5) + 1), step = L / (posts - 1);
  ctx.albedo(OAK); ctx.color("oklch(0.5 0.03 60)");
  for (let i = 0; i < posts; i++) g.box(i * step, 0.75, 0, 0.09, 1.5 + (i === 0 || i === posts - 1 ? 0.15 : 0), 0.09);
  ctx.albedo(null); ctx.color("oklch(0.4 0.01 60)");
  if (lod <= 3) for (const y of [0.9, 1.35]) g.box(L / 2, y, 0, L, 0.015, 0.015);
  for (let i = 0; i < posts - 1; i++) {
    const x = i * step + step / 2;
    if (lod <= 3) { ctx.color("oklch(0.38 0.03 50)"); g.tube([[x, 0, 0, 0.05], [x + (R() - 0.5) * 0.15, 0.5, 0.03, 0.04], [x, 0.9, 0, 0.035]], 5); }
    const n = lod <= 1 ? 4 : lod <= 3 ? 2 : 1;
    for (let k = 0; k < n; k++) {
      const cx = i * step + (k + 0.5) * (step / n);
      ctx.color(`oklch(${0.44 + R() * 0.1} 0.11 ${120 + R() * 20})`);
      g.tris(g.blob([cx, 1.1 + R() * 0.25, (R() - 0.5) * 0.15], [step / n * 0.7, 0.35, 0.3], lod <= 1 ? 1 : 0, 0.3, 2, i * 7 + k));
      if (lod <= 2 && R() > 0.35) { ctx.color("oklch(0.3 0.09 320)"); g.tris(g.blob([cx + (R() - 0.5) * 0.4, 0.82, (R() > 0.5 ? 0.18 : -0.18)], [0.07, 0.12, 0.07], 0, 0.2, 3, i * 11 + k)); }
    }
  }
  ctx.color(null);
}
export function collider(ctx) { const L = ctx.params.len ?? 12; return [{ kind: "box", width: L, height: 1.5, depth: 0.3, center: [L / 2, 0.75, 0] }]; }
