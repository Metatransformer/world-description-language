// A Sunscar agave: a rosette of thick, blue-grey, spine-tipped leaves, the outer ones bowed to the sand,
// the inner ones upright. params.seed shapes it; params.bloom raises a tall stalk of yellow flower heads.
import { G, rng } from "../lib/geo.js";
const LEAF = "cdn/texture-agave-leaf-blue-green-waxy.png", STALK = "cdn/texture-weathered-grey-dead-wood.png";
function leaf(g, ang, elev, L, W, segs, R) {
  const dx = Math.cos(ang), dz = Math.sin(ang), sx = -dz, sz = dx, ce = Math.cos(elev), se = Math.sin(elev);
  const sp = (t) => { const d = L * t, bend = 0.35 * L * t * t * ce; return [dx * d * ce, d * se - bend, dz * d * ce]; };
  const rows = [];
  for (let k = 0; k <= segs; k++) {
    const t = k / segs, p = sp(t), w = W * Math.min(1, 0.55 + t * 2) * (1 - t) ** 0.8 + 0.004, th = w * 0.45;
    rows.push({ l: [p[0] + sx * w, p[1], p[2] + sz * w], r: [p[0] - sx * w, p[1], p[2] - sz * w], m: [p[0] - dx * th * se * 0.3, p[1] + th * ce * 0.25, p[2] - dz * th * se * 0.3], b: [p[0], p[1] - th * 0.6, p[2]] });
  }
  for (let k = 0; k < segs; k++) {
    const a = rows[k], c = rows[k + 1];
    g.quad(a.l, c.l, c.m, a.m); g.quad(a.m, c.m, c.r, a.r);
    g.quad(a.r, c.r, c.b, a.b); g.quad(a.b, c.b, c.l, a.l);
  }
  return sp(1);
}
export function geometry(ctx) {
  const g = new G(ctx), lod = ctx.lod || 1, R = rng(11000 + (ctx.params.seed ?? 1) * 29);
  const n = [0, 22, 16, 11, 8, 6][lod], segs = lod <= 2 ? 5 : lod <= 3 ? 3 : 2, tips = [];
  ctx.smooth(); ctx.albedo(LEAF);
  for (let i = 0; i < n; i++) {
    const f = i / n, ring = 1 - f;                     // outer first
    const elev = (12 + 62 * f + (R() - 0.5) * 10) * Math.PI / 180, L = (0.55 + 0.6 * ring) * (0.85 + R() * 0.3);
    ctx.color(`oklch(${(0.8 + 0.1 * f + R() * 0.04).toFixed(3)} ${(0.045 + 0.02 * R()).toFixed(3)} ${(165 + R() * 25).toFixed(1)})`);
    tips.push(leaf(g, i * 2.39996 + R() * 0.2, elev, L, 0.07 + 0.04 * ring, segs, R));
  }
  if (lod <= 2) { ctx.albedo(null); ctx.color("oklch(0.3 0.04 50)"); for (const t of tips) g.tube([[t[0], t[1] - 0.01, t[2], 0.007], [t[0] * 1.06, t[1] + 0.05, t[2] * 1.06, 0.001]], 3); }
  if (ctx.params.bloom) {
    ctx.albedo(STALK); ctx.color("oklch(0.85 0.04 90)");
    const H = 3.6 + R() * 1.4, bend = (R() - 0.5) * 0.5;
    g.tube([[0, 0.2, 0, 0.07], [bend * 0.3, H * 0.5, 0, 0.05], [bend, H, 0, 0.02]], lod <= 2 ? 6 : 4);
    ctx.albedo(null);
    const heads = lod <= 2 ? 7 : 3;
    for (let k = 0; k < heads; k++) {
      const y = H * (0.6 + 0.4 * k / heads), b = bend * ((y / H) ** 2), a = k * 2.4, s = 0.35 * (1 - k / heads) + 0.12;
      const e = [b + Math.cos(a) * s, y + 0.15, Math.sin(a) * s];
      ctx.color("oklch(0.6 0.05 110)"); g.tube([[b, y, 0, 0.015], [...e, 0.008]], 3);
      ctx.color("oklch(0.82 0.15 92)"); for (const t of g.blob(e, [0.13, 0.08, 0.13], lod <= 1 ? 1 : 0, 0.4, 3, k)) g.tri(t[0], t[1], t[2]);
    }
  }
  ctx.albedo(null); ctx.color(null); ctx.flat();
}
