// THE BARROW MOUTH: a grass burial mound built into the north-east hill, its dry-stone passage front
// facing west (-x) with two standing stones and a lintel, a stone-lined passage holding the portal,
// a ring of leaning standing stones, a cairn, bones and two iron braziers. Origin = ground at the mound's centre.
import { kit } from "./barrow-kit.js";
import { moundDome, moundFacade, moundHeight } from "../lib/pieces/mound.js";
import { tripodBrazier, TRIPOD_BARROW } from "../lib/pieces/brazier.js";
const R = 8, H = 6.6, FX = -5.5; // mound radius, height, the facade plane
const MOUND = { R, H, exp: 0.75, CX: 0, FX, nt: (lod, col) => (col ? 24 : lod <= 2 ? 56 : lod <= 3 ? 32 : 16), ns: (lod, col) => (col ? 5 : lod <= 2 ? 11 : 6), noise: [0.35, 0.25, 3], skirt: [1.8, -1.2] };
const hd = moundHeight(MOUND);
const TX = {
  turf: "cdn/texture-grass-turf-wild-mossy.png", dry: "cdn/texture-dry-stone-wall-slate.png", stone: "cdn/texture-fieldstone-wall-mossy.png",
  flag: "cdn/texture-worn-flagstone-floor-dungeon.png", monolith: "cdn/texture-lichen-covered-granite.png", iron: "cdn/texture-wrought-iron.png",
};
function build(ctx, col) {
  const K = kit(ctx, col), lod = col ? 4 : ctx.lod, P = ctx.params || {};
  // ---- the mound: a dome clipped by the facade plane, skirted down into the hill
  K.paint(TX.turf, "oklch(0.93 0.03 130)", 0.95);
  moundDome(K, ctx, col, lod, MOUND);
  // ---- the dry-stone facade, its top following the mound's edge, the door cut through
  K.paint(TX.dry, "oklch(0.92 0.01 80)");
  moundFacade(K, col, MOUND, { z: [-5.8, 5.79], step: col ? 0.8 : 0.4, rise: 0.12, door: [1.3, 3.05], base: -0.6, back: 0.8, front: 0.15 });
  if (!col && lod <= 2) { // proud stones in the coursing
    for (let k = 0; k < 26; k++) { const z = -5 + ctx.random() * 10; if (Math.abs(z) < 2.6) continue; const top = hd(Math.hypot(FX, z)); const y = ctx.random() * (top - 0.4) + 0.2; K.rock(FX - 0.8, y, z, 0.12, 0.08 + ctx.random() * 0.05, 0.22 + ctx.random() * 0.12, 6, 4, 0.2); }
  }
  // ---- the two standing stones and the lintel
  K.paint(TX.monolith, "oklch(0.9 0.01 120)", 0.95);
  K.rock(FX - 0.55, 1.75, -1.95, 0.55, 1.95, 0.48, 9, 7, 0.08);
  K.rock(FX - 0.55, 1.75, 1.95, 0.55, 1.95, 0.48, 9, 7, 0.08);
  K.rock(FX - 0.6, 3.6, 0, 0.62, 0.5, 3.1, 10, 6, 0.07);
  // ---- the passage: flagged floor, stone walls and roof, back wall; the portal stands at x = -4
  K.paint(TX.flag, "oklch(0.9 0.01 80)");
  K.box(FX - 1.4, -0.3, -1.3, -1.8, 0.05, 1.3);
  K.paint(TX.stone, "oklch(0.9 0.01 90)");
  K.box(FX + 0.1, 0, 1.25, -1.8, 3.1, 1.9); K.box(FX + 0.1, 0, -1.9, -1.8, 3.1, -1.25);
  K.box(FX, 3.05, -1.9, -1.8, 3.5, 1.9); K.box(-2.2, 0, -1.3, -1.8, 3.1, 1.3);
  // ---- the ring of leaning standing stones (ground heights read at placement, params.ring)
  const ring = P.ring || [];
  K.paint(TX.monolith, "oklch(0.9 0.01 120)", 0.95);
  ring.forEach(([x, g, z, ht, yaw, lean], i) => {
    if (col) { K.box(x - 0.45, g - 0.6, z - 0.45, x + 0.45, g + ht * 0.9, z + 0.45); return; }
    K.at(() => K.rock(0, ht * 0.5 - 0.4, 0, 0.5, ht * 0.55, 0.32, 8, 6, 0.1), x, g, z, yaw, lean, (i % 3 - 1) * 4);
  });
  // ---- the old cairn
  const cn = P.cairn || [-10, 0, 8.5];
  K.paint(TX.stone, "oklch(0.88 0.01 90)");
  if (col) K.box(cn[0] - 1.2, cn[1] - 0.2, cn[2] - 1.2, cn[0] + 1.2, cn[1] + 1.3, cn[2] + 1.2);
  else { const n = lod <= 2 ? 34 : 14; for (let k = 0; k < n; k++) { const f = k / n, a = ctx.random() * 6.283, rr = (1 - f) * 1.3 * Math.sqrt(ctx.random()); K.rock(cn[0] + Math.cos(a) * rr, cn[1] + f * 1.7, cn[2] + Math.sin(a) * rr, 0.28, 0.2, 0.25, 6, 4, 0.25); } }
  // ---- two cold iron braziers flanking the approach
  for (const z of [-3.4, 3.4]) tripodBrazier(K, ctx, col, -8.2, 0, z, TRIPOD_BARROW, () => K.paint(TX.iron, "oklch(0.9 0.01 60)", 0.6, 0.7));
  // ---- bones before the door, and a few fallen stones
  if (!col && lod <= 3) {
    K.at(() => K.skeleton(true), -7.2, 0.02, -1.6, 70);
    K.at(() => K.skeleton(false), -6.9, 0.02, 2.6, -150, 0, 4);
    K.paint(TX.stone, "oklch(0.88 0.01 90)");
    for (let k = 0; k < 7; k++) K.rock(-7 - ctx.random() * 4, 0.05, (ctx.random() - 0.5) * 12, 0.3, 0.16, 0.24, 6, 4, 0.25);
  }
}
export function geometry(ctx) { build(ctx, false); }
export function collider(ctx) { build(ctx, true); }
