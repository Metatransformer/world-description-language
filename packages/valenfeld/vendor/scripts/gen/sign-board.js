// The town-name board that hangs on a signpost: a weathered oak plank. Size and tint from kits.yml (sign-board);
// the words are the template's ui, reading the placement's state.label.
import { G, TEX } from "../lib/geo.js";
import KITS from "../lib/data/kits.json";
const DEF = KITS.sets.base["sign-board"].params;
export function geometry(ctx) {
  const p = { ...DEF, ...(ctx.params ?? {}) }, g = new G(ctx);
  ctx.albedo(p.tex ?? TEX.oak); ctx.color(p.tint ?? "oklch(0.9 0.02 70)");
  g.box(0, p.h / 2, 0, p.w, p.h, p.d);
  ctx.albedo(null); ctx.color(null);
}
