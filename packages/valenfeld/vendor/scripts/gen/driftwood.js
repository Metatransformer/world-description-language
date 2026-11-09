// Saltmarch driftwood: a sea-bleached, silver trunk half sunk in the sand, a splayed root plate at one
// end and snapped branch stubs along it. params.seed shapes it.
import { G, rng } from "../lib/geo.js";
const WOOD = "cdn/texture-bleached-driftwood-grain.png";
export function geometry(ctx) {
  const g = new G(ctx), lod = ctx.lod || 1, R = rng(15000 + (ctx.params.seed ?? 1) * 23);
  const L = 2.4 + R() * 2.4, r = 0.13 + R() * 0.1, nk = lod <= 2 ? 7 : 3, path = [], ph = R() * 6;
  for (let k = 0; k <= nk; k++) { const f = k / nk; path.push([-L / 2 + L * f, r * 0.55 + Math.sin(f * 3 + ph) * 0.08, Math.sin(f * 2.2 + ph) * 0.25, r * (1.15 - 0.6 * f) + (k === 0 ? r * 0.35 : 0)]); }
  ctx.smooth(); ctx.albedo(WOOD); ctx.color("oklch(0.93 0.015 70)");
  g.tube(path, lod <= 2 ? 8 : 5, { capB: true, rough: lod <= 2 ? (th, k) => 1 + 0.12 * Math.sin(th * 3 + k) : null });
  if (lod <= 3) {
    const base = path[0], nr = lod <= 2 ? 6 : 3;
    for (let i = 0; i < nr; i++) {
      const a = (i / nr) * 6.283 + R() * 0.5, len = 0.5 + R() * 0.6, cy = Math.cos(a), sy = Math.sin(a);
      g.tube([[base[0], base[1] + sy * r * 0.5, base[2] + cy * r * 0.5, r * 0.35], [base[0] - 0.2, base[1] + sy * len * 0.6, base[2] + cy * len * 0.6, r * 0.18], [base[0] - 0.15 - R() * 0.3, base[1] + sy * len, base[2] + cy * len, 0.012]], 4);
    }
    const ns = lod <= 2 ? 3 : 1;
    for (let i = 0; i < ns; i++) { const p = path[2 + i], a = R() * 3 - 1.5; g.tube([[p[0], p[1], p[2], r * 0.35], [p[0] + 0.25, p[1] + Math.cos(a) * 0.5, p[2] + Math.sin(a) * 0.5, r * 0.12]], 4, { capB: true }); }
  }
  ctx.albedo(null); ctx.color(null); ctx.flat();
}
export function collider() { return { kind: "box", width: 4, height: 0.4, depth: 0.6, center: [0, 0.2, 0] }; }
