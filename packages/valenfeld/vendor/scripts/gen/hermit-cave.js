// The hermit's cave mouth on Ridgeback: a lichen outcrop with a dark arched mouth (front −Z), a stained hide
// hung across it on a pole, a gallows post with a lantern hook, a split-log woodpile, a chopping stump with
// its axe, and a ring of hearth stones. Origin = ground at the mouth; the mouth is dressing, not a door.
import { G, TEX, mossyRock } from "../lib/geo.js";
const OAK = "cdn/texture-dark-weathered-oak-planks.png";
export function geometry(ctx) {
  ctx.roughness?.(1); ctx.metalness?.(0);
  const g = new G(ctx), lod = ctx.lod || 1, det = lod <= 1 ? 3 : lod <= 3 ? 2 : 1;
  // the outcrop: a big mass behind, two cheeks framing the mouth, a lintel stone
  mossyRock(g, [0, 0.6, 3.2], [5.2, 4.2, 3.4], det, 21, { rock: TEX.rock, moss: TEX.moss, mossAt: 0.65 });
  mossyRock(g, [-2.4, 0.2, 0.6], [1.5, 2.3, 1.6], det, 22, { rock: TEX.rock, moss: TEX.moss });
  mossyRock(g, [2.5, 0.1, 0.7], [1.6, 2.1, 1.7], det, 23, { rock: TEX.rock, moss: TEX.moss });
  mossyRock(g, [0, 2.6, 0.7], [2.4, 0.7, 1.4], det, 24, { rock: TEX.rock, moss: TEX.moss });
  // the dark of the mouth
  ctx.albedo(null); ctx.color("oklch(0.08 0.01 60)");
  g.quad([-1.1, 0, 0.9], [1.1, 0, 0.9], [1.0, 2.2, 0.9], [-1.0, 2.2, 0.9]);
  // hide curtain on a pole, slightly drawn back
  ctx.color("oklch(0.42 0.07 45)");
  const n = lod >= 3 ? 2 : 6;
  for (let i = 0; i < n; i++) { const a = -1.0 + 1.5 * i / n, b = -1.0 + 1.5 * (i + 1) / n, w = i % 2 ? 0.06 : -0.04; g.quad([a, 0.15, 0.55 + w], [b, 0.15, 0.55 - w], [b, 2.1, 0.6], [a, 2.1, 0.6]); g.quad([b, 0.15, 0.55 - w], [a, 0.15, 0.55 + w], [a, 2.1, 0.6], [b, 2.1, 0.6]); }
  ctx.albedo(OAK); ctx.color("oklch(0.5 0.04 60)");
  g.box(0, 2.15, 0.6, 2.6, 0.08, 0.08);
  // gallows post with lantern
  g.box(1.6, 1.1, -0.6, 0.14, 2.2, 0.14); g.box(1.35, 2.1, -0.6, 0.6, 0.1, 0.1);
  ctx.albedo(null); ctx.color("oklch(0.25 0.01 60)"); g.box(1.12, 1.82, -0.6, 0.18, 0.26, 0.18);
  ctx.color("oklch(0.92 0.14 80)"); ctx.emissive?.("oklch(0.85 0.16 70)", 2.5); g.box(1.12, 1.82, -0.6, 0.13, 0.18, 0.13); ctx.emissive?.(null);
  // woodpile against the right cheek
  ctx.albedo(OAK); ctx.color("oklch(0.62 0.06 70)");
  if (lod <= 3) for (let r = 0; r < 3; r++) for (let i = 0; i < 4 - r; i++) g.tube([[1.0 + i * 0.24 + r * 0.12, 0.12 + r * 0.21, -1.2, 0.11], [1.0 + i * 0.24 + r * 0.12, 0.12 + r * 0.21, -0.3, 0.11]], 6);
  // chopping stump and axe
  g.tube([[-1.7, 0, -1.2, 0.3], [-1.7, 0.5, -1.2, 0.28]], 8);
  ctx.color("oklch(0.45 0.04 60)"); g.tube([[-1.7, 0.5, -1.2, 0.025], [-1.4, 1.1, -1.35, 0.025]], 5);
  ctx.albedo(null); ctx.color("oklch(0.4 0.01 250)"); g.box(-1.68, 0.56, -1.21, 0.04, 0.18, 0.22);
  // hearth ring with charcoal
  ctx.albedo(TEX.rock); ctx.color("oklch(0.75 0.01 90)");
  for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283; g.tris(g.blob([-0.2 + Math.cos(a) * 0.55, 0.06, -2.2 + Math.sin(a) * 0.55], [0.18, 0.12, 0.16], 0, 0.2, 2, 40 + i)); }
  ctx.albedo(null); ctx.color("oklch(0.15 0.01 40)"); g.tris(g.blob([-0.2, 0, -2.2], [0.38, 0.06, 0.38], 1, 0.2, 2, 50, 0));
  ctx.albedo(null); ctx.color(null);
}
export function collider() { return [
  { kind: "box", width: 10, height: 5, depth: 5, center: [0, 2.5, 3.6] },
  { kind: "box", width: 2.4, height: 3.5, depth: 2.6, center: [-2.4, 1.7, 0.6] },
  { kind: "box", width: 2.6, height: 3.4, depth: 2.6, center: [2.5, 1.7, 0.7] },
]; }
