// A shepherd's lean-to on the downs: a dry-stone back wall and gable ends, four smoke-dark oak posts,
// a single-pitch roof of turf on poles sloping to the back, hay heaped inside, a crook against the post.
// Open front faces −Z. 4.4 m wide, 3 m deep.
import { G, rng, TEX } from "../lib/geo.js";
const W = 4.4, D = 3.0, HF = 2.3, HB = 1.35, OAK = "cdn/texture-dark-weathered-oak-planks.png";
export function geometry(ctx) {
  const g = new G(ctx), lod = ctx.lod || 1, R = rng(4410);
  // stone walls: back + two sides, rows of rough stones
  ctx.albedo(TEX.rock); ctx.color("oklch(0.82 0.015 90)");
  const wall = (x0, z0, x1, z1, h0, h1) => {
    const L = Math.hypot(x1 - x0, z1 - z0), rows = lod >= 3 ? 2 : 4, per = Math.max(2, Math.round(L / (lod >= 3 ? 1.1 : 0.55)));
    for (let r = 0; r < rows; r++) for (let i = 0; i < per; i++) {
      const t = (i + (r % 2) * 0.5 + 0.25) / per; if (t > 1) continue;
      const hh = h0 + (h1 - h0) * t, y = (r + 0.5) * hh / rows; if (y > hh) continue;
      const x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t, sz = L / per * 0.62;
      g.tris(g.blob([x, y, z], [sz, hh / rows * 0.58, 0.3], 0, 0.2, 1.5, r * 31 + i + x0 * 3));
    }
  };
  wall(-W / 2, D / 2, W / 2, D / 2, HB, HB);
  if (lod <= 4) { wall(-W / 2, -D / 2 + 0.4, -W / 2, D / 2, HF - 0.6, HB); wall(W / 2, -D / 2 + 0.4, W / 2, D / 2, HF - 0.6, HB); }
  // posts and roof beams
  ctx.albedo(OAK); ctx.color("oklch(0.55 0.04 60)");
  for (const x of [-W / 2 + 0.15, -W / 6, W / 6, W / 2 - 0.15]) g.box(x, HF / 2, -D / 2, 0.16, HF, 0.16);
  g.box(0, HF + 0.08, -D / 2, W + 0.6, 0.16, 0.18);
  const sl = Math.atan2(HF - HB, D), RL = Math.hypot(HF - HB, D) + 0.6;
  if (lod <= 3) for (const x of [-W / 2, -W / 4, 0, W / 4, W / 2]) g.at({ m: rotX(sl), t: [x, (HF + HB) / 2 + 0.12, 0] }, () => g.box(0, 0, 0, 0.11, 0.11, RL));
  // turf roof slab, slight sag, moss texture
  ctx.albedo(TEX.moss); ctx.color("oklch(0.72 0.07 125)");
  const n = lod >= 3 ? 1 : 4, y0 = HF + 0.28, y1 = HB + 0.22, z0 = -D / 2 - 0.35, z1 = D / 2 + 0.3, x0 = -W / 2 - 0.35, x1 = W / 2 + 0.35;
  for (let i = 0; i < n; i++) {
    const a = x0 + (x1 - x0) * i / n, b = x0 + (x1 - x0) * (i + 1) / n, sa = Math.sin(Math.PI * i / n) * 0.08, sb = Math.sin(Math.PI * (i + 1) / n) * 0.08;
    g.quad([a, y0 - sa, z0], [b, y0 - sb, z0], [b, y1 - sb, z1], [a, y1 - sa, z1]); // top
    g.quad([a, y0 - sa - 0.22, z0], [a, y1 - sa - 0.22, z1], [b, y1 - sb - 0.22, z1], [b, y0 - sb - 0.22, z0]); // underside
    g.quad([a, y0 - sa - 0.22, z0], [b, y0 - sb - 0.22, z0], [b, y0 - sb, z0], [a, y0 - sa, z0]);
  }
  for (const [x, s] of [[x0, -1], [x1, 1]]) { const A = [x, y0, z0], B = [x, y1, z1], C = [x, y1 - 0.22, z1], E = [x, y0 - 0.22, z0]; s > 0 ? g.quad(A, B, C, E) : g.quad(A, E, C, B); }
  // hay heap and a crook
  ctx.albedo(null); ctx.color("oklch(0.78 0.11 88)");
  g.tris(g.blob([0.6, 0, 0.6], [1.2, 0.55, 0.8], 1, 0.3, 2, 7, 0));
  ctx.color("oklch(0.45 0.05 60)");
  g.tube([[-W / 6 + 0.12, 0, -D / 2 - 0.1, 0.025], [-W / 6 + 0.2, 1.5, -D / 2 - 0.12, 0.022], [-W / 6 + 0.32, 1.68, -D / 2 - 0.12, 0.02], [-W / 6 + 0.36, 1.55, -D / 2 - 0.12, 0.018]], 5);
  ctx.albedo(null); ctx.color(null);
}
function rotX(a) { const c = Math.cos(a), s = Math.sin(a); return [1, 0, 0, 0, c, -s, 0, s, c]; }
export function collider() { return [
  { kind: "box", width: W + 0.6, height: HB, depth: 0.6, center: [0, HB / 2, D / 2] },
  { kind: "box", width: 0.6, height: HF - 0.4, depth: D, center: [-W / 2, (HF - 0.4) / 2, 0] },
  { kind: "box", width: 0.6, height: HF - 0.4, depth: D, center: [W / 2, (HF - 0.4) / 2, 0] },
]; }
