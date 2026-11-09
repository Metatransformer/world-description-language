// A Sunscar dead tree: a sun-silvered, twisting trunk that forks and forks again into bare, reaching
// limbs. params.seed shapes it.
import { G, rng } from "../lib/geo.js";
const WOOD = "cdn/texture-weathered-grey-dead-wood.png";
function limb(g, R, p, dir, len, rad, depth, lod) {
  const n = [dir[0] + (R() - 0.5) * 0.5, dir[1] + 0.15, dir[2] + (R() - 0.5) * 0.5], l = Math.hypot(...n), d = n.map((v) => v / l);
  const m = [p[0] + d[0] * len * 0.5 + (R() - 0.5) * 0.3, p[1] + d[1] * len * 0.5, p[2] + d[2] * len * 0.5 + (R() - 0.5) * 0.3];
  const e = [p[0] + d[0] * len, p[1] + d[1] * len, p[2] + d[2] * len];
  g.tube([[...p, rad], [...m, rad * 0.75], [...e, rad * 0.45]], depth === 0 ? (lod <= 2 ? 8 : 5) : lod <= 2 ? 5 : 3);
  if (depth >= (lod <= 1 ? 3 : lod <= 3 ? 2 : 1)) return;
  const kids = depth === 0 ? 3 : 2;
  for (let i = 0; i < kids; i++) { const a = R() * 6.28, sp = 0.6 + R() * 0.4; limb(g, R, e, [d[0] * 0.6 + Math.cos(a) * sp, d[1] * 0.7, d[2] * 0.6 + Math.sin(a) * sp], len * (0.55 + R() * 0.2), rad * 0.5, depth + 1, lod); }
}
export function geometry(ctx) {
  ctx.roughness?.(1); ctx.metalness?.(0); // matte: bark and stone never shine
  const g = new G(ctx), lod = ctx.lod || 1, R = rng(17000 + (ctx.params.seed ?? 1) * 19);
  ctx.smooth(); ctx.albedo(WOOD); ctx.color("oklch(0.9 0.02 65)");
  limb(g, R, [0, -0.4, 0], [0, 1, 0], 2.6 + R() * 1.4, 0.26, 0, lod);
  ctx.albedo(null); ctx.color(null); ctx.flat();
}
export function collider() { return { kind: "cylinder", radiusTop: 0.15, radiusBottom: 0.25, height: 3, center: [0, 1.5, 0] }; }
