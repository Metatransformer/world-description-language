// A town-gate banner: a hanging wool cloth with soft vertical folds, a swallowtail hem, two trim bands and a
// lozenge device, on both faces. Hangs from its top edge (y = h) down to its feet; spans z, hangs flat in x.
// params: w, h, field, trim, device (colours). #art-critic Nov 4: replaces the flat colour-box banners on every gate.
import { G } from "../lib/geo.js";
const CANVAS = "cdn/texture-canvas-weathered.png";
export function geometry(ctx) {
  const p = ctx.params ?? {}, W = p.w ?? 1.3, H = p.h ?? 3.4, lod = ctx.lod || 1, g = new G(ctx);
  const nz = lod <= 2 ? 8 : lod <= 3 ? 4 : 2, ny = lod <= 2 ? 10 : lod <= 3 ? 4 : 2, notch = Math.min(0.45, H * 0.13);
  // fold displacement: deeper toward the hem, a few vertical folds across the width
  const off = (z, y) => (lod <= 3 ? Math.sin((z / W + 0.5) * Math.PI * 3.2 + 0.6) * 0.055 * (0.35 + 0.65 * (1 - y / H)) : 0);
  const hem = (z) => notch * (1 - Math.abs(z) / (W / 2)); // swallowtail: the centre rides up
  const P = (z, v, s, lift = 0) => { const y0 = hem(z), y = y0 + (H - y0) * v; return [off(z, y) + s * (0.012 + lift), y, z]; };
  const sheet = (v0, v1, s, lift, cols = nz, rows = ny) => {
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
      const za = -W / 2 + W * i / cols, zb = -W / 2 + W * (i + 1) / cols, va = v0 + (v1 - v0) * j / rows, vb = v0 + (v1 - v0) * (j + 1) / rows;
      const a = P(za, va, s, lift), b = P(zb, va, s, lift), c = P(zb, vb, s, lift), d = P(za, vb, s, lift);
      if (s > 0) g.quad(a, b, c, d); else g.quad(a, d, c, b);
    }
  };
  ctx.roughness?.(0.95); ctx.metalness?.(0);
  ctx.albedo(CANVAS);
  for (const s of [1, -1]) {
    ctx.color(p.field ?? "#c9a45a"); sheet(0, 1, s, 0);
    if (lod <= 3) {
      ctx.color(p.trim ?? "#2f3d52");
      sheet(0.9, 0.95, s, 0.004, nz, 1); sheet(0.06, 0.1, s, 0.004, nz, 1);
      // the lozenge device, a diamond riding the folds
      ctx.color(p.device ?? p.trim ?? "#2f3d52");
      const cy = H * 0.52, r = Math.min(W, H) * 0.24;
      const D = (z, y) => [off(z, y) + s * 0.02, y, z];
      const top = D(0, cy + r), rt = D(r * 0.75, cy), bot = D(0, cy - r), lf = D(-r * 0.75, cy), mid = D(0, cy);
      for (const [a, b] of [[top, rt], [rt, bot], [bot, lf], [lf, top]]) s > 0 ? g.tri(mid, a, b) : g.tri(mid, b, a);
    }
  }
  // the iron rod it hangs from
  ctx.albedo(null); ctx.color("oklch(0.32 0.01 250)"); ctx.metalness?.(0.7); ctx.roughness?.(0.5);
  g.box(0, H + 0.03, 0, 0.07, 0.07, W + 0.2);
  ctx.color(null); ctx.metalness?.(null); ctx.roughness?.(null);
}
