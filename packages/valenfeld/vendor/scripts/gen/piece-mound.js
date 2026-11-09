// THE MOUND alone, for the Codex bench: the shared hill-with-a-door piece (scripts/lib/pieces/mound.js) that the
// barrow and Crowfoot mine mouths draw. params.look: barrow (default) | crowfoot; R, H, exp, door override the look.
import { kit } from "./barrow-kit.js";
import { moundDome, moundFacade } from "../lib/pieces/mound.js";
const LOOKS = {
  barrow: { m: { R: 8, H: 6.6, exp: 0.75, CX: 0, FX: -5.5, noise: [0.35, 0.25, 3], skirt: [1.8, -1.2] }, f: { z: [-5.8, 5.79], rise: 0.12, door: [1.3, 3.05], base: -0.6, back: 0.8, front: 0.15 },
    turf: ["cdn/texture-grass-turf-wild-mossy.png", "oklch(0.93 0.03 130)"], wall: ["cdn/texture-dry-stone-wall-slate.png", "oklch(0.92 0.01 80)"] },
  crowfoot: { m: { R: 8.5, H: 6, exp: 0.7, CX: 5.2, FX: -0.7, noise: [0.3, 0.45, 7], skirt: [2, -1.4] }, f: { z: [-6.4, 6.39], rise: 0.15, door: [1.75, 3.6], base: -0.8, back: 0.9, front: 0.2 },
    turf: ["cdn/texture-grass-turf-wild-mossy.png", "oklch(0.92 0.03 125)"], wall: ["cdn/texture-granite-rock-lichen.png", "oklch(0.9 0.01 90)"] },
};
function draw(ctx, col) {
  const P = ctx.params ?? {}, L = LOOKS[P.look] ?? LOOKS.barrow, K = kit(ctx, col), lod = col ? 4 : ctx.lod ?? 1;
  const m = { ...L.m, ...(P.R ? { R: P.R } : {}), ...(P.H ? { H: P.H } : {}), ...(P.exp ? { exp: P.exp } : {}), nt: (l, c) => (c ? 24 : l <= 2 ? 48 : 24), ns: (l, c) => (c ? 5 : l <= 2 ? 10 : 6) };
  const half = Math.sqrt(Math.max(1, m.R * m.R - (m.FX - m.CX) * (m.FX - m.CX)));
  const f = { ...L.f, ...(P.R ? { z: [-half, half - 0.01] } : {}), step: col ? 0.8 : 0.4, ...(P.door ? { door: [P.door, L.f.door[1]] } : {}) };
  K.paint(L.turf[0], L.turf[1], 0.95); moundDome(K, ctx, col, lod, m);
  K.paint(L.wall[0], L.wall[1]); moundFacade(K, col, m, f);
}
export function geometry(ctx) { draw(ctx, false); }
export function collider(ctx) { draw(ctx, true); }
