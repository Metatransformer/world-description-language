// THE TRIPOD BRAZIER alone, for the Codex bench: the shared piece (scripts/lib/pieces/brazier.js tripodBrazier)
// that the barrow, frostfang and grotto mouths draw. params.look: frostfang (default) | barrow | grotto; params.glow: an ember colour.
import { kit } from "./barrow-kit.js";
import { tripodBrazier, TRIPOD_BARROW } from "../lib/pieces/brazier.js";
const IRON = "cdn/texture-wrought-iron.png";
const LOOKS = {
  frostfang: { o: { coal: { glow: "#ff5a14" } }, paint: ["oklch(0.9 0.01 60)", 0.55, 0.7] },
  barrow: { o: TRIPOD_BARROW, paint: ["oklch(0.9 0.01 60)", 0.6, 0.7] },
  grotto: { o: {}, paint: ["oklch(0.85 0.01 60)", 0.5, 0.7] },
};
function draw(ctx, col) {
  const P = ctx.params ?? {}, L = LOOKS[P.look] ?? LOOKS.frostfang, K = kit(ctx, col);
  const o = P.glow ? { ...L.o, coal: { ...(L.o.coal ?? {}), glow: P.glow } } : L.o;
  tripodBrazier(K, ctx, col, 0, 0, 0, o, () => K.paint(IRON, ...L.paint));
}
export function geometry(ctx) { draw(ctx, false); }
export function collider(ctx) { draw(ctx, true); }
