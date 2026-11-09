// The wayside signpost: a weathered oak post on a stone-wedged foot, two arrow boards (west high, east
// low), an iron cap. The words ride the boards as vector children.
import { G, TEX, mossyRock } from "../lib/geo.js";
function arrow(g, dir, y, len) {
  const t = 0.05, h = 0.32, x0 = dir * 0.08, x1 = dir * (len - 0.2), x2 = dir * len;
  const F = [[x0, y - h / 2], [x1, y - h / 2], [x2, y], [x1, y + h / 2], [x0, y + h / 2]];
  for (const z of [-t / 2, t / 2]) { const s = (z > 0) === (dir > 0); for (let i = 1; i < 4; i++) { const A = [F[0][0], F[0][1], z], B = [F[i][0], F[i][1], z], C = [F[i + 1][0], F[i + 1][1], z]; s ? g.tri(A, B, C) : g.tri(A, C, B); } }
  for (let i = 0; i < 5; i++) { const a = F[i], b = F[(i + 1) % 5]; g.quad([a[0], a[1], -t / 2], [b[0], b[1], -t / 2], [b[0], b[1], t / 2], [a[0], a[1], t / 2]); }
}
export function geometry(ctx) {
  const g = new G(ctx);
  for (let i = 0; i < 5; i++) { const a = i * 1.3; mossyRock(g, [Math.cos(a) * 0.3, 0.05, Math.sin(a) * 0.3], [0.22, 0.16, 0.2], 1, i, { rock: TEX.rock, moss: TEX.moss }); }
  ctx.albedo(TEX.oak); ctx.color("oklch(0.9 0.03 65)");
  g.box(0, 1.3, 0, 0.16, 2.9, 0.16);
  arrow(g, -1, 2.35, 1.5); arrow(g, 1, 1.9, 1.5);
  ctx.albedo(TEX.iron); ctx.color("oklch(0.85 0 0)");
  g.box(0, 2.78, 0, 0.2, 0.06, 0.2); g.box(0, 2.35, 0, 0.18, 0.06, 0.18); g.box(0, 1.9, 0, 0.18, 0.06, 0.18);
  ctx.albedo(null); ctx.color(null);
}
export function collider() { return { kind: "box", width: 0.2, height: 2.8, depth: 0.2 }; }
