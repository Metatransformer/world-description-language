// A fallen log: a bowed, barked trunk lying along X with raw broken ends, branch stubs and moss on its back.
import { G, rng, TEX, mossyRock } from "../lib/geo.js";
export function geometry(ctx) {
  ctx.roughness?.(1); ctx.metalness?.(0); // matte: bark and stone never shine
  const g = new G(ctx), lod = ctx.lod || 1, R = rng(4000 + (ctx.params.seed ?? 1) * 17), L = ctx.params.len ?? 5, r0 = ctx.params.r ?? 0.34;
  const n = lod <= 2 ? 6 : 3, path = [], bow = (R() - 0.5) * 0.5;
  for (let k = 0; k <= n; k++) { const f = k / n; path.push([-L / 2 + L * f, r0 * 0.9 + Math.sin(f * Math.PI) * 0.04, Math.sin(f * Math.PI) * bow, r0 * (1 - 0.25 * f)]); }
  ctx.smooth(); ctx.albedo(TEX.log); ctx.color("oklch(0.92 0.02 60)");
  g.tube(path, lod <= 2 ? 10 : 6, { rough: lod <= 1 ? (th, k) => 1 + 0.05 * Math.sin(th * 7 + k) : null });
  if (lod <= 2) for (let i = 0; i < 3; i++) { const f = 0.2 + R() * 0.6, p = path[Math.round(f * n)], a = R() * 3.14; g.tube([[p[0], p[1] + Math.cos(a) * p[3] * 0.8, p[2] + Math.sin(a) * p[3] * 0.8, 0.07], [p[0] + 0.1, p[1] + Math.cos(a) * (p[3] + 0.45), p[2] + Math.sin(a) * (p[3] + 0.45), 0.03]], 5, { capB: true }); }
  ctx.flat(); ctx.albedo(null); ctx.color("oklch(0.62 0.07 70)");
  for (const [k, sgn] of [[0, -1], [n, 1]]) { const p = path[k], seg = 10; for (let i = 0; i < seg; i++) { const a0 = (i / seg) * 6.283, a1 = ((i + 1) / seg) * 6.283, j = 0.05 * Math.sin(i * 2.7); const A = [p[0] + sgn * j, p[1] + Math.cos(a0) * p[3], p[2] + Math.sin(a0) * p[3]], B = [p[0] + sgn * j, p[1] + Math.cos(a1) * p[3], p[2] + Math.sin(a1) * p[3]]; const C = [p[0] + sgn * 0.08, p[1], p[2]]; if (sgn > 0) g.tri(C, A, B); else g.tri(C, B, A); } }
  if (lod <= 2) for (let i = 0; i < 3; i++) { const p = path[1 + Math.floor(R() * (n - 1))]; mossyRock(g, [p[0] + (R() - 0.5) * 0.6, p[1] + p[3] * 0.82, p[2]], [0.45 + R() * 0.3, 0.1, 0.3], 1, i + 5, { rock: TEX.moss, rockTint: "oklch(0.9 0.05 130)", amp: 0.3 }); }
  ctx.color(null);
}
export function collider(ctx) { const L = ctx.params.len ?? 5, r = ctx.params.r ?? 0.34; return { kind: "box", width: L, height: r * 2, depth: r * 2.2, center: [0, r, 0] }; }
