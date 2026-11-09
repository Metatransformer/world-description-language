// The Vael road toll hut: a small fieldstone hut with oak framing and a slate roof, a shuttered window and
// lantern on the road side (+X), a striped barrier pole on a pivot post across the road (pole lies along −X,
// raised a little so walkers duck under nothing: it sits at 1.0 m, the road beside it stays open), a
// banner post with House Annvyr's red-and-gold tree, a barrel and a coin box. Hut 3 × 3 m. Origin = ground, hut centre.
import { G, TEX } from "../lib/geo.js";
const OAK = "cdn/texture-dark-weathered-oak-planks.png", SLATE = "cdn/texture-mossy-slate-roof-tiles.png";
const W = 3, D = 3, H = 2.4;
export function geometry(ctx) {
  ctx.roughness?.(1); ctx.metalness?.(0);
  const g = new G(ctx), lod = ctx.lod || 1;
  // stone walls
  ctx.albedo(TEX.rock); ctx.color("oklch(0.84 0.015 85)");
  g.box(0, H / 2, D / 2 - 0.15, W, H, 0.3); g.box(0, H / 2, -D / 2 + 0.15, W, H, 0.3);
  g.box(-W / 2 + 0.15, H / 2, 0, 0.3, H, D - 0.6);
  g.box(W / 2 - 0.15, 0.45, 0, 0.3, 0.9, D - 0.6); g.box(W / 2 - 0.15, H - 0.3, 0, 0.3, 0.6, D - 0.6);
  g.box(W / 2 - 0.15, 1.35, -0.85, 0.3, 0.9, 0.7); g.box(W / 2 - 0.15, 1.35, 0.85, 0.3, 0.9, 0.7);
  // gables
  for (const z of [D / 2 - 0.15, -D / 2 + 0.15]) g.tris([[[-W / 2, H, z], [W / 2, H, z], [0, H + 1.2, z]], [[-W / 2, H, z], [0, H + 1.2, z], [W / 2, H, z]]]);
  // oak frame and window hatch (open counter on the road side)
  ctx.albedo(OAK); ctx.color("oklch(0.5 0.04 60)");
  for (const [x, z] of [[-W / 2, -D / 2], [W / 2, -D / 2], [-W / 2, D / 2], [W / 2, D / 2]]) g.box(x, H / 2, z, 0.2, H + 0.05, 0.2);
  g.box(W / 2 + 0.05, 0.92, 0, 0.45, 0.07, 1.1); // counter
  g.box(W / 2 + 0.35, 1.95, 0, 0.06, 0.08, 1.2); // hatch prop
  g.box(-0.2, H / 2 - 0.1, -D / 2 - 0.02, 0.9, H - 0.4, 0.06); // door on −Z
  // slate roof
  ctx.albedo(SLATE); ctx.color("oklch(0.62 0.02 250)");
  const o = 0.35, e = 0.3;
  g.quad([-W / 2 - o, H - e * 0.6, -D / 2 - e], [-W / 2 - o, H - e * 0.6, D / 2 + e], [0, H + 1.28, D / 2 + e], [0, H + 1.28, -D / 2 - e]);
  g.quad([W / 2 + o, H - e * 0.6, D / 2 + e], [W / 2 + o, H - e * 0.6, -D / 2 - e], [0, H + 1.28, -D / 2 - e], [0, H + 1.28, D / 2 + e]);
  g.quad([-W / 2 - o, H - e * 0.6 - 0.08, D / 2 + e], [-W / 2 - o, H - e * 0.6 - 0.08, -D / 2 - e], [0, H + 1.2, -D / 2 - e], [0, H + 1.2, D / 2 + e]);
  g.quad([W / 2 + o, H - e * 0.6 - 0.08, -D / 2 - e], [W / 2 + o, H - e * 0.6 - 0.08, D / 2 + e], [0, H + 1.2, D / 2 + e], [0, H + 1.2, -D / 2 - e]);
  // chimney
  ctx.albedo(TEX.rock); ctx.color("oklch(0.75 0.015 85)"); g.box(-0.9, H + 1.1, 0.8, 0.45, 1.4, 0.45);
  // barrier: pivot post at the hut's road corner, pole raised to 30° so the road stays open
  ctx.albedo(OAK); ctx.color("oklch(0.45 0.04 60)");
  g.box(W / 2 + 0.9, 0.6, -D / 2 - 0.3, 0.3, 1.2, 0.3);
  const L = 5.5, a = 0.52, c = Math.cos(a), s = Math.sin(a), X0 = W / 2 + 0.9, Y0 = 1.15, Z0 = -D / 2 - 0.3;
  const n = lod >= 3 ? 2 : 8;
  for (let i = 0; i < n; i++) {
    const t0 = i / n, t1 = (i + 1) / n;
    ctx.albedo(null); ctx.color(i % 2 ? "oklch(0.92 0.01 90)" : "oklch(0.5 0.15 30)");
    g.tube([[X0 + c * L * t0, Y0 + s * L * t0, Z0, 0.07], [X0 + c * L * t1, Y0 + s * L * t1, Z0, 0.07]], 6);
  }
  ctx.albedo(null); ctx.color("oklch(0.3 0.01 60)"); g.box(X0 - 0.5, Y0 - 0.1, Z0, 0.5, 0.3, 0.3); // counterweight
  // banner post
  ctx.albedo(OAK); ctx.color("oklch(0.45 0.04 60)");
  g.box(W / 2 + 0.6, 1.8, D / 2 + 0.6, 0.14, 3.6, 0.14); g.box(W / 2 + 0.95, 3.45, D / 2 + 0.6, 0.8, 0.1, 0.1);
  ctx.albedo(null); ctx.color("oklch(0.45 0.13 30)");
  g.quad([W / 2 + 0.62, 3.4, D / 2 + 0.6], [W / 2 + 1.3, 3.4, D / 2 + 0.6], [W / 2 + 1.3, 2.2, D / 2 + 0.6], [W / 2 + 0.62, 2.2, D / 2 + 0.6]);
  g.quad([W / 2 + 1.3, 3.4, D / 2 + 0.6], [W / 2 + 0.62, 3.4, D / 2 + 0.6], [W / 2 + 0.62, 2.2, D / 2 + 0.6], [W / 2 + 1.3, 2.2, D / 2 + 0.6]);
  ctx.color("oklch(0.78 0.13 85)"); g.box(W / 2 + 0.96, 2.85, D / 2 + 0.6, 0.06, 0.6, 0.04); g.box(W / 2 + 0.96, 2.95, D / 2 + 0.6, 0.35, 0.05, 0.04);
  // lantern over the counter
  ctx.color("oklch(0.25 0.01 60)"); g.box(W / 2 + 0.25, 2.15, 0.7, 0.18, 0.26, 0.18);
  ctx.color("oklch(0.92 0.14 80)"); ctx.emissive?.("oklch(0.85 0.16 70)", 2.5); g.box(W / 2 + 0.25, 2.15, 0.7, 0.13, 0.18, 0.13); ctx.emissive?.(null);
  // barrel and coin box
  if (lod <= 3) {
    ctx.albedo(OAK); ctx.color("oklch(0.55 0.05 60)"); g.tube([[W / 2 + 0.5, 0, D / 2 - 0.4, 0.3], [W / 2 + 0.5, 0.45, D / 2 - 0.4, 0.34], [W / 2 + 0.5, 0.9, D / 2 - 0.4, 0.3]], 10);
    ctx.albedo(null); ctx.color("oklch(0.35 0.02 60)"); g.box(W / 2 + 0.15, 1.02, -0.3, 0.3, 0.18, 0.22);
  }
  ctx.albedo(null); ctx.color(null);
}
export function collider() { return [
  { kind: "box", width: W, height: H, depth: D, center: [0, H / 2, 0] },
  { kind: "box", width: 0.3, height: 1.2, depth: 0.3, center: [W / 2 + 0.9, 0.6, -D / 2 - 0.3] },
  { kind: "box", width: 0.15, height: 3.6, depth: 0.15, center: [W / 2 + 0.6, 1.8, D / 2 + 0.6] },
]; }
