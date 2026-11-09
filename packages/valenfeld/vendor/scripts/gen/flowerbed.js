// A town flowerbed in one piece (perf #844: was a box and 18 spheres, 19 objects a bed): a dark soil bed
// in an oak plank kerb, leafy clumps along it and a head of blooms on each, colours cycling cream, red, gold, violet.
// params: length (m, along x), seed. Feet at the bed's centre, y = 0 the soil's base.
import { G, TEX } from "../lib/geo.js";
const BLOOMS = ["oklch(0.85 0.05 90)", "oklch(0.65 0.2 25)", "oklch(0.8 0.15 85)", "oklch(0.6 0.18 320)"];
export function geometry(ctx) {
  const g = new G(ctx), L = ctx.params.length ?? 4.6, D = 0.7, seed = ctx.params.seed ?? 1;
  ctx.flat();
  ctx.color("oklch(0.3 0.04 50)"); g.box(0, 0.01, 0, L - 0.1, 0.12, D - 0.1);   // soil, mounded a touch
  ctx.albedo(TEX.oak); ctx.color("oklch(0.62 0.05 60)");
  for (const s of [-1, 1]) { g.box(0, 0.06, s * (D / 2 - 0.03), L, 0.16, 0.06); g.box(s * (L / 2 - 0.03), 0.06, 0, 0.06, 0.16, D - 0.12); }
  ctx.albedo(null);
  const lod = ctx.lod ?? 1;
  if (lod >= 4) { ctx.color("oklch(0.47 0.1 135)"); g.box(0, 0.12, 0, L - 0.3, 0.14, 0.4); ctx.color(null); return; }   // far: a green strip in its kerb
  const n = Math.round(L / 0.25);
  for (let i = 0; i <= n - 1; i++) {
    const x = -L / 2 + 0.3 + i * ((L - 0.6) / (n - 1)), r = ctx.random(), z = (r - 0.5) * 0.22;
    if (i % 2) {   // leafy clump
      ctx.color(`oklch(${0.44 + r * 0.1} 0.1 ${130 + r * 20})`);
      g.tris(g.blob([x, 0.1, z], [0.2, 0.15, 0.18], 1, 0.3, 1.4, seed * 13 + i, 0.08));
    } else {   // a bloom head: a few cupped petal quads round a heart
      const c = BLOOMS[(i / 2) % BLOOMS.length], y = 0.2 + r * 0.06;
      ctx.color("oklch(0.45 0.1 135)"); g.tris(g.blob([x, 0.1, z], [0.16, 0.12, 0.15], 1, 0.3, 1.4, seed * 7 + i, 0.08));
      ctx.color(c);
      for (let k = 0; k < (lod >= 3 ? 1 : 3); k++) {
        const ox = x + Math.cos(k * 2.1 + r * 6) * 0.08, oz = z + Math.sin(k * 2.1 + r * 6) * 0.08, oy = y + k * 0.015;
        for (let p = 0; p < 5; p++) { const a0 = p * 1.2566, a1 = a0 + 1.2566, ri = 0.015, ro = 0.075;
          g.quad([ox + Math.cos(a0) * ri, oy, oz + Math.sin(a0) * ri], [ox + Math.cos(a0) * ro, oy + 0.03, oz + Math.sin(a0) * ro], [ox + Math.cos(a1) * ro, oy + 0.03, oz + Math.sin(a1) * ro], [ox + Math.cos(a1) * ri, oy, oz + Math.sin(a1) * ri]); }
        ctx.color("oklch(0.75 0.15 80)"); g.box(ox, oy + 0.015, oz, 0.03, 0.02, 0.03); ctx.color(c);
      }
    }
  }
  ctx.color(null);
}
