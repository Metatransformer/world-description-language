// A mossy fieldstone boulder, half sunk: lichen rock on its flanks, moss on what faces the sky.
import { G, TEX, mossyRock } from "../lib/geo.js";
export function geometry(ctx) {
  ctx.roughness?.(1); ctx.metalness?.(0); // matte: bark and stone never shine
  const g = new G(ctx), lod = ctx.lod || 1, s = ctx.params.seed ?? 1;
  mossyRock(g, [0, -0.08, 0], [1.25, 0.95, 1.0], lod <= 1 ? 3 : lod <= 3 ? 2 : 1, s, { rock: TEX.rock, moss: TEX.moss });
}
export function collider() { return { kind: "sphere", radius: 0.95, center: [0, -0.1, 0] }; }
