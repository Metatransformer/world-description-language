// Valenfeld trees (Nov 4 rebuild): a flared bark trunk, a few limbs, and a crown of painted spray cards packed into
// lobes so it reads as one soft volume: dark in its heart, lit at the rim. Conifers are drooping tiers of boughs.
// Lean by design (Nov 4, for 60 fps): ~200-300 triangles near, crossed cards from lod 3 (~30). Built once per
// species x seed x level and shared by every copy, never rebuilt per frame.
import { CARD, BARK, rng } from "./treekit.js";
export const SPECIES = {
  oak:   { card: CARD.oak,    bark: BARK.oak,   base: 0.2,  spread: 1.05, lobes: 6, trunk: 0.034, dome: 1, hue: 128, chroma: 0.03, h: [12, 5], clump: 1 },
  birch: { card: CARD.birch,  bark: BARK.birch, base: 0.3,  spread: 0.55, lobes: 5,  trunk: 0.018, hue: 118, chroma: 0.035, h: [13, 5], barkTint: "oklch(0.97 0.006 90)" },
  hedge: { card: CARD.oakSpray,    bark: BARK.oak,   base: 0.05, spread: 1.15, lobes: 4,  trunk: 0.03, dome: 1, hue: 125, chroma: 0.035, h: [1.7, 0.7], cardK: 0.42 },
  bramble: { card: CARD.oakSpray, bark: BARK.oak, base: 0.02, spread: 1.45, lobes: 5, trunk: 0.02, dome: 1, hue: 142, chroma: 0.03, h: [0.9, 0.5], cardK: 0.36 },
  juniper: { card: CARD.spruce, bark: BARK.pine, base: 0.03, spread: 0.85, lobes: 4, trunk: 0.025, dome: 1, hue: 168, chroma: 0.028, h: [1.2, 0.9], cardK: 0.4 },
  pine:  { card: CARD.spruce, bark: BARK.pine,  base: 0.22, spread: 0.42, trunk: 0.024, pow: 0.75, droop: 0.35, hue: 150, chroma: 0.03, h: [16, 8] },
};
const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
const unit = (a) => add([0, 0, 0], a, 1 / (Math.hypot(...a) || 1));
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

export function tree(ctx, kind, opts = {}) {
  const sp = SPECIES[kind] ?? SPECIES.oak, lod = Math.min(5, Math.max(1, ctx.lod || 1));
  const R = rng((kind.length * 977 + (ctx.params.seed ?? 1) * 131) | 0);
  const H = sp.h[0] + R() * sp.h[1], r0 = H * sp.trunk, yb = H * sp.base, W = (H * sp.spread) / 2;
  const c = [0, (yb + H) / 2, 0], r = [W, (H - yb) / 2, W];
  const hue = (opts.hue ?? sp.hue) + R() * 14 - 7, chroma = opts.chroma ?? sp.chroma;
  ctx.roughness?.(1); ctx.metalness?.(0);
  const uvs = [], normals = [];
  const quad = (P, N, U) => [[0, 1, 2], [0, 2, 3]].forEach((t) => { ctx.tri(...t.flatMap((k) => P[k])); t.forEach((k) => (normals.push(...N[k]), uvs.push(...U[k]))); });
  const tube = (path, rad, sides = 6) => path.slice(1).forEach((b, i) => {
    const a = path[i], ax = unit(add(b, a, -1)), s = unit(cross(ax, [0, 1, 0.01])), o = cross(ax, s);
    const d = (k, t = (k * 6.2832) / sides) => add(add([0, 0, 0], s, Math.cos(t)), o, Math.sin(t));
    for (let k = 0; k < sides; k++) {
      const d0 = d(k), d1 = d(k + 1), u0 = k / sides, u1 = (k + 1) / sides, v0 = a[1] / 1.5, v1 = b[1] / 1.5;
      quad([add(a, d1, rad[i]), add(b, d1, rad[i + 1]), add(b, d0, rad[i + 1]), add(a, d0, rad[i])], [d1, d1, d0, d0], [[u1, v0], [u1, v1], [u0, v1], [u0, v0]]);
    }
  });
  const cn = (p) => unit([(p[0] - c[0]) / r[0], (p[1] - c[1]) / r[1] + 0.35, (p[2] - c[2]) / r[2]]);
  const card = (p, up, face, w, h) => {
    const m = cn(p), x = unit(cross(up, face)), a = add(p, x, -w / 2), b = add(p, x, w / 2), f = cross(x, up);
    const P = f[0] * m[0] + f[1] * m[1] + f[2] * m[2] >= 0 ? [a, b, add(b, up, h), add(a, up, h)] : [b, a, add(a, up, h), add(b, up, h)];
    quad(P, P.map(cn), [[0, 0], [1, 0], [1, 1], [0, 1]]);
  };
  const tint = (dl) => ctx.color(`oklch(${Math.min(1, 0.97 + dl)} ${chroma} ${hue})`);
  const sides = lod <= 1 ? 5 : 4;
  ctx.albedo(sp.bark); ctx.color(sp.barkTint ?? "oklch(0.9 0.012 60)");
  const size = (1.6 + lod * 0.55) * Math.max(1, Math.sqrt(W / 8)) * (sp.cardK ?? 1);
  if (sp.droop) {
    tube([[0, -0.3, 0], [0, H / 2, 0], [0, H, 0]], [r0 * 1.5, r0 * 0.7, r0 * 0.1], sides);
    ctx.albedo(sp.card);
    const tiers = lod >= 3 ? 0 : Math.max(3, Math.round((H - yb) / [0, 2.4, 3.4][lod]));
    for (let i = 0; i < tiers; i++) {
      const t = i / tiers, rim = W * (1 - t) ** sp.pow + 0.35, per = Math.max(4, Math.ceil((4.4 * rim) / size));
      for (let j = 0; j < per; j++) {
        const a = ((j + R() * 0.6) / per) * 6.2832 + t * 3, out = unit([Math.cos(a), -sp.droop * (0.5 + R()), Math.sin(a)]), reach = rim * (0.8 + R() * 0.4);
        for (let k = 0, s = Math.min(size, reach); k < reach; k += s * 0.8) {
          const foot = add([0, yb + (H - yb) * t, 0], out, k);
          tint(-0.32 + 0.22 * t + (k / reach) * 0.1 + R() * 0.06);
          card(foot, out, unit(add([0, 1, 0], out, 0.25)), s, s * 1.1);
        }
      }
    }
    if (lod >= 3) { tint(-0.2); for (const k of [0, 1.05, 2.1]) card([0, yb, 0], [0, 1, 0], [Math.cos(k), 0, Math.sin(k)], W * 1.6, H - yb); }
    return { uvs, normals };
  }
  const top = [R() - 0.5, c[1] + r[1] * 0.2, R() - 0.5];
  tube([[0, -0.3, 0], [0, yb, 0], top], [1.8, 0.9, 0.4].map((k) => k * r0), sides);
  if (lod >= 3) { ctx.albedo(sp.card); tint(-0.2); for (const k of [0, 1.05, 2.1]) card([0, yb, 0], [0, 1, 0], [Math.cos(k), 0, Math.sin(k)], W * 2, H - yb); return { uvs, normals }; }
  const n = lod >= 4 ? Math.ceil(sp.lobes / 2) : sp.lobes, lw = W * 0.45, lv = r[1] * 0.5;
  const lobes = [[0, H - lv, 0, 1], [0, c[1] - lv * 0.4, 0, 1.45]];
  for (let i = 1; i < n; i++) {
    const a = i * 2.4 + R() * 0.5, y = 1 - (i / (n - 1)) * 2, ring = (W - lw) * (sp.dome && y < 0 ? 1 : Math.sqrt(Math.max(0, 1 - y * y)));
    const L = [Math.cos(a) * ring, c[1] + y * (r[1] - lv), Math.sin(a) * ring, 0.85 + R() * 0.3], t = R();
    const from = [0, yb * 0.95 + (c[1] - yb) * t * 0.6, 0], to = add(from, add(L, from, -1), 0.85);
    if (lod <= 2 && y < 0.9) tube([from, [to[0] * 0.45, to[1] - 0.2, to[2] * 0.45], to], [r0 * (0.6 - 0.25 * t), r0 * 0.35, r0 * 0.12], 3);
    lobes.push(L);
  }
  ctx.albedo(sp.card);
  for (const L of lobes) {
    const w = lw * L[3], v = lv * L[3], cards = sp.clump ? Math.max(4, Math.ceil((0.8 / lod) * w * v)) : Math.max(3, Math.ceil((1.5 / lod) * w * v));
    for (let j = 0; j < cards; j++) {
      const d = unit([R() * 2 - 1, R() * 2 - 1, R() * 2 - 1]), up = unit(add(d, [0, 1.5, 0])), s = size * (0.75 + R() * 0.5), q = 0.15 + 0.6 * Math.sqrt(R());   // pulled into the lobe: a clump, not cards strewn
      tint(-0.38 + 0.3 * q + Math.max(0, d[1]) * 0.06 + R() * 0.05);
      card(add(add(L, [d[0] * w, d[1] * v, d[2] * w], q), up, -s / 2), up, [d[0] + R() - 0.5, R() * 0.5, d[2] + R() - 0.5], s, s);
    }
  }
  return { uvs, normals };
}
