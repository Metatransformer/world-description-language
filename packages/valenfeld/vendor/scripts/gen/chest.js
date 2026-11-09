// An old iron-banded oak chest with a barrel lid, a hasp and a ring handle at each end.
import { G, TEX } from "../lib/geo.js";
export function geometry(ctx) {
  const g = new G(ctx), W = 0.95, D = 0.58, H = 0.48;
  ctx.albedo(TEX.oak); ctx.color("oklch(0.9 0.04 60)");
  g.box(0, H / 2, 0, W, H, D);
  const n = 8, lid = [];
  for (let i = 0; i <= n; i++) { const a = Math.PI * i / n; lid.push([Math.cos(a) * D / 2, H + Math.sin(a) * 0.2]); }
  for (let i = 0; i < n; i++) { const [z0, y0] = lid[i], [z1, y1] = lid[i + 1]; g.quad([-W / 2, y0, z0], [-W / 2, y1, z1], [W / 2, y1, z1], [W / 2, y0, z0]); g.tri([-W / 2, H, 0], [-W / 2, y1, z1], [-W / 2, y0, z0]); g.tri([W / 2, H, 0], [W / 2, y0, z0], [W / 2, y1, z1]); }
  ctx.albedo(TEX.iron); ctx.color("oklch(0.88 0 0)");
  for (const x of [-W / 2 + 0.1, 0, W / 2 - 0.1]) { g.box(x, H / 2, 0, 0.06, H + 0.01, D + 0.02); for (let i = 0; i < n; i++) { const [z0, y0] = lid[i], [z1, y1] = lid[i + 1]; g.quad([x - 0.03, y0 + 0.01, z0 * 1.02], [x - 0.03, y1 + 0.01, z1 * 1.02], [x + 0.03, y1 + 0.01, z1 * 1.02], [x + 0.03, y0 + 0.01, z0 * 1.02]); } }
  g.box(0, H - 0.04, -D / 2 - 0.02, 0.1, 0.16, 0.03);
  ctx.smooth(); for (const s of [-1, 1]) g.tube([[s * (W / 2 + 0.03), H * 0.6, -0.08, 0.012], [s * (W / 2 + 0.05), H * 0.45, 0, 0.012], [s * (W / 2 + 0.03), H * 0.6, 0.08, 0.012]], 4);
  ctx.albedo(null); ctx.color(null); ctx.flat();
}
export function collider() { return { kind: "box", width: 0.95, height: 0.68, depth: 0.58 }; }
