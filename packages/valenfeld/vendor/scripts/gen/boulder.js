// The continent's loose stone, one generator per ground: params.kind "alpine" (granite with snow lying
// on its top faces), "red" (layered Sunscar sandstone, wind-scoured, no moss), "beach" (dark sea-worn
// stone with a pale salt crust above the tide). params.seed shapes it.
import { G, mossyRock } from "../lib/geo.js";
const K = {
  alpine: { rock: "cdn/texture-granite-rock-lichen.png", moss: "cdn/texture-fresh-snow-powder.png", mossAt: 0.5, rockTint: "oklch(0.88 0.01 240)", mossTint: "oklch(0.98 0.008 240)", r: [1.3, 1.0, 1.1], amp: 0.3, freq: 0.9 },
  red: { rock: "cdn/texture-red-sandstone-rock-layered.png", moss: null, rockTint: "oklch(0.93 0.02 50)", r: [1.4, 0.8, 1.15], amp: 0.22, freq: 0.7 },
  beach: { rock: "cdn/texture-dark-basalt-rock-wet.png", moss: "cdn/texture-granite-rock-lichen.png", mossAt: 0.75, rockTint: "oklch(0.85 0.01 220)", mossTint: "oklch(0.95 0.02 90)", r: [1.2, 0.75, 1.0], amp: 0.32, freq: 1.1 },
};
export function geometry(ctx) {
  ctx.roughness?.(1); ctx.metalness?.(0); // matte: bark and stone never shine
  const g = new G(ctx), lod = ctx.lod || 1, s = ctx.params.seed ?? 1, k = K[ctx.params.kind] ?? K.alpine;
  mossyRock(g, [0, k.r[1] * -0.08, 0], k.r, lod <= 1 ? 3 : lod <= 3 ? 2 : 1, s, { rock: k.rock, moss: k.moss, mossAt: k.mossAt, rockTint: k.rockTint, mossTint: k.mossTint, amp: k.amp, freq: k.freq });
}
export function collider(ctx) { const k = K[ctx.params.kind] ?? K.alpine; return { kind: "sphere", radius: k.r[1] * 0.95, center: [0, k.r[1] * 0.17, 0] }; }
