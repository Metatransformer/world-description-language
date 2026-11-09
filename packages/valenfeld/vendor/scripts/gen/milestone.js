// A roadside milestone: a round-headed fieldstone slab, leaning a little, its face to −Z.
import { G, TEX } from "../lib/geo.js";
export function geometry(ctx) {
  const g = new G(ctx), W = 0.5, T = 0.22, H = 0.9, n = 8;
  ctx.albedo(TEX.rock); ctx.color("oklch(0.93 0.01 80)");
  const O = [[-W / 2, -0.4], [W / 2, -0.4]]; for (let i = 0; i <= n; i++) { const a = Math.PI * i / n; O.push([Math.cos(a) * W / 2, H + Math.sin(a) * W / 2]); }
  const pts = [O[0], O[1], ...O.slice(2)];
  for (const z of [-T / 2, T / 2]) for (let i = 1; i < pts.length - 1; i++) { const A = [...pts[0], z], B = [...pts[i], z], C = [...pts[i + 1], z]; const a = [A[0], A[1], z], b = [B[0], B[1], z], c = [C[0], C[1], z]; z > 0 ? g.tri(a, b, c) : g.tri(a, c, b); }
  for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; g.quad([a[0], a[1], T / 2], [b[0], b[1], T / 2], [b[0], b[1], -T / 2], [a[0], a[1], -T / 2]); }
  ctx.albedo(null); ctx.color(null);
}
export function collider() { return { kind: "box", width: 0.5, height: 1.15, depth: 0.22 }; }
