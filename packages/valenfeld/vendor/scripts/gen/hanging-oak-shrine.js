// The Hanging Oak's wayside shrine (#230): the pilgrims' cairn, a split-log bench facing north to Highbridge,
// two lantern posts on the road side, ribbons tied to their crossbars. Origin = the oak's foot; the oak itself is oak.js.
import { G, TEX, mossyRock, rng } from "../lib/geo.js";
const RIBBON = ["oklch(0.55 0.16 28)", "oklch(0.78 0.12 85)", "oklch(0.88 0.02 90)", "oklch(0.5 0.1 250)", "oklch(0.55 0.12 140)"];
function ribbon(g, ctx, x, y, z, len, sway, col) {
  ctx.color(col);
  const w = 0.05, a = [x - w, y, z], b = [x + w, y, z], c = [x + w + sway, y - len, z + sway * 0.4], d = [x - w + sway, y - len, z + sway * 0.4];
  g.quad(a, b, c, d); g.quad(b, a, d, c);
}
function post(g, ctx, x, z, R) {
  ctx.albedo(TEX.oak); ctx.color("oklch(0.9 0.03 65)");
  g.box(x, 1.4, z, 0.16, 2.8, 0.16);
  g.box(x + 0.35, 2.65, z, 0.8, 0.1, 0.1); // crossbar
  ctx.albedo(TEX.iron); ctx.color("oklch(0.8 0 0)");
  g.box(x + 0.62, 2.48, z, 0.02, 0.24, 0.02); // hook
  g.box(x + 0.62, 2.3, z, 0.24, 0.04, 0.24); g.box(x + 0.62, 2.0, z, 0.26, 0.04, 0.26); // lantern cap + base
  for (const [dx, dz] of [[-0.11, -0.11], [0.11, -0.11], [0.11, 0.11], [-0.11, 0.11]]) g.box(x + 0.62 + dx, 2.15, z + dz, 0.025, 0.28, 0.025);
  ctx.albedo(null); ctx.color("oklch(0.92 0.13 75)"); ctx.emissive?.("oklch(0.85 0.16 70)", 2.5);
  g.box(x + 0.62, 2.15, z, 0.17, 0.24, 0.17); // the lit glass
  ctx.emissive?.(null);
  for (let i = 0; i < 4; i++) ribbon(g, ctx, x + 0.02 + i * 0.13, 2.6, z + 0.06, 0.5 + R() * 0.5, (R() - 0.5) * 0.25, RIBBON[Math.floor(R() * RIBBON.length)]);
  ctx.albedo(TEX.rock); ctx.color("oklch(0.93 0.01 90)");
  for (let i = 0; i < 3; i++) { const a = i * 2.1; mossyRock(g, [x + Math.cos(a) * 0.22, 0.04, z + Math.sin(a) * 0.22], [0.16, 0.12, 0.15], 1, 30 + i + x * 3, { rock: TEX.rock, moss: TEX.moss }); }
}
export function geometry(ctx) {
  const g = new G(ctx), R = rng(230);
  // the cairn: a ring of big stones, smaller ones piled to a point, one more from every traveller
  let n = 0;
  ctx.albedo(TEX.rock); ctx.color("oklch(0.9 0.01 90)");
  g.tris(g.blob([3.6, 0.0, 2.4], [1.05, 1.25, 1.05], 2, 0.3, 1.4, 7, 0).filter((t) => (t[0][1] + t[1][1] + t[2][1]) / 3 > -0.05)); // the heap's core, a cone of rubble
  if (ctx.lod >= 3) { post(g, ctx, -5.5, 5.5, R); post(g, ctx, 5.0, 7.5, R); ctx.albedo(null); ctx.color(null); return; }
  for (const [ring, r, y, s] of [[9, 1.05, 0.12, 0.32]])
    for (let i = 0; i < ring; i++) { const a = (i / ring) * 6.283 + ring; mossyRock(g, [3.6 + Math.cos(a) * r, y, 2.4 + Math.sin(a) * r], [s * (0.9 + R() * 0.4), s * 0.75, s], 1, 100 + n++, { rock: TEX.rock, moss: TEX.moss, mossAt: 0.75 }); }
  // loose offering stones round its foot
  for (let i = 0; i < 10; i++) { const a = R() * 6.283, r = 1.3 + R() * 0.6; mossyRock(g, [3.6 + Math.cos(a) * r, 0.02, 2.4 + Math.sin(a) * r], [0.09, 0.06, 0.08], 1, 200 + i, { rock: TEX.rock, moss: TEX.moss }); }
  // the bench: two stone feet, a split log seat, looking north to the city
  for (const x of [-1.0, 1.0]) mossyRock(g, [-2.5 + x, 0.18, -4.2], [0.26, 0.24, 0.22], 1, 300 + x * 5, { rock: TEX.rock, moss: TEX.moss });
  ctx.albedo(TEX.log); ctx.color("oklch(0.9 0.03 65)");
  g.tube([[-4.0, 0.47, -4.2, 0.2], [-2.5, 0.49, -4.2, 0.21], [-1.0, 0.47, -4.2, 0.19]], 10, { capA: true, capB: true });
  ctx.albedo(TEX.oak); g.box(-2.5, 0.68, -4.2, 3.0, 0.06, 0.34); // the flat split face
  // lantern posts by the road
  post(g, ctx, -5.5, 5.5, R); post(g, ctx, 5.0, 7.5, R);
  ctx.albedo(null); ctx.color(null);
}
export function collider() { return { kind: "cylinder", radiusTop: 0.4, radiusBottom: 1.1, height: 1.3, center: [3.6, 0.65, 2.4] }; }
