// PIECES: lamp post. Highbridge's street lamps are one stack, plinth → shaft → arm → lantern → cap, in each
// district's iron and stone. lampPost(c, K, look, o): K = the caller's buildkit verbs { paint, flatc, glow, BX, LA, SEG, PIPE }
// (drawn on whatever c the caller draws on), o = { h, lod, heads: { name: (c, x, y, z, ...) => … }, light: [color, rgb] }.
// A look is the district's recipe; the Codex swaps looks, heights and lantern light across districts.
import { IR, IRONC, FS } from "../buildkit.js";
const ASH = "cdn/texture-ashlar-cream-limestone-two-courses-big-dressed-blocks-thin-pale-mortar-subtle-weathering.png";
const CREAM2 = "oklch(0.93 0.014 240)", IRC = "oklch(0.45 0.01 60)", GOLD = "oklch(0.78 0.14 85)";
const SPAN_LIGHT = ["oklch(0.9 0.12 75)", [5, 2.8, 1]];
const GUILD_LIGHT = ["oklch(0.9 0.1 75)", [3.2, 1.7, 0.6]];
export const LAMP_LOOKS = {
  // the arcade's: a squat iron foot, a slim lathed post, an arm out to a hanging lantern (3.6 m)
  arcade(c, K, o) { const { BX, LA } = K; K.flatc(c, o.iron ?? "oklch(0.42 0.01 60)"); BX(c, -0.22, 0, -0.22, 0.22, 0.3, 0.22);
    LA(c, 0, 0.3, 0, [[0.09, 0], [0.07, 0.4], [0.055, 3.0], [0.09, 3.1]], 8, true);
    BX(c, -0.03, 3.05, -0.03, 0.55, 3.12, 0.03); o.heads.lantern(c, 0.5, 3.05, 0); },
  // the castle's: the lantern at the origin, the post hanging below it to the ground, a gilt finial over
  castle(c, K, o) { const h = o.h ?? 3.4; K.paint(c, IR, IRONC); K.LA(c, 0, -h, 0, [[0.22, 0], [0.22, 0.3], [0.08, 0.5], [0.06, h - 0.5], [0.1, h - 0.4]], 8, true); o.heads.lantern(c, 0, -0.25, 0); o.heads.finial(c, 0, 0.25, 0, 0.35); },
  // the guild quarter's: a stepped stone plinth, a tall iron shaft, four spokes holding a glowing lantern and its cap (4.5 m)
  guildhall(c, K, o) { const { paint, glow, BX, LA, SEG } = K, L = o.light ?? GUILD_LIGHT;
    if ((o.lod ?? 1) >= 4) { paint(c, IR, IRONC); BX(c, -0.08, 0, -0.08, 0.08, 3.5, 0.08); glow(c, ...L); BX(c, -0.22, 3.55, -0.22, 0.22, 4.15, 0.22); c.emissive(null); return; }
    paint(c, FS, "oklch(0.58 0.02 60)"); BX(c, -0.32, 0, -0.32, 0.32, 0.22, 0.32); BX(c, -0.24, 0.22, -0.24, 0.24, 0.6, 0.24); paint(c, IR, IRONC); LA(c, 0, 0.6, 0, [[0.11, 0], [0.08, 0.4], [0.07, 3.3], [0.12, 3.45], [0.001, 3.5]], 8, true);
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2; SEG(c, [Math.cos(a) * 0.05, 3.5, Math.sin(a) * 0.05], [Math.cos(a) * 0.25, 3.62, Math.sin(a) * 0.25], 0.04); }
    glow(c, ...L); LA(c, 0, 3.62, 0, [[0.2, 0], [0.25, 0.4], [0.2, 0.62]], 6, true); c.emissive(null);
    paint(c, IR, IRONC); LA(c, 0, 4.22, 0, [[0.32, 0], [0.001, 0.32]], 6, true); },
  // the walls': a cream ashlar drum foot, a tapering iron pipe, an arm and a hung lantern, a gilt spike on top
  wall(c, K, o) { const h = o.h ?? 3.4; K.paint(c, ASH, CREAM2); K.LA(c, 0, -0.2, 0, [[0.32, 0], [0.32, 0.5], [0.2, 0.6]], 8); K.paint(c, IR, IRC); K.PIPE(c, [0, 0.5, 0], [0, h, 0], 0.08, 0.06, 6);
    K.SEG(c, [0, h - 0.1, 0], [0.55, h - 0.1, 0], 0.06); o.heads.lantern(c, 0.55, h - 0.75, 0, 0.9); K.flatc(c, GOLD); K.LA(c, 0, h, 0, [[0.1, 0], [0.001, 0.25]], 6); },
  // the span head's: a lathed iron column straight to a glowing box lantern, a spike cap and a drip plate (4.6 m); o.at = [x, y, z] places it
  span(c, K, o) { const { paint, glow, BX, LA, SEG } = K, [x, y0, z] = o.at ?? [0, 0, 0], L = o.light ?? SPAN_LIGHT;
    paint(c, IR, IRONC); LA(c, x, y0 + 0.06, z, [[0.3, 0], [0.22, 0.4], [0.1, 0.6], [0.08, 4.0]], 8, true); SEG(c, [x, y0 + 3.9, z], [x, y0 + 3.9, z + 0.01], 0.3);
    glow(c, ...L); BX(c, x - 0.2, y0 + 4.0, z - 0.2, x + 0.2, y0 + 4.6, z + 0.2); paint(c, IR, IRONC); LA(c, x, y0 + 4.6, z, [[0.32, 0], [0.01, 0.35]], 4, true, "y", false); BX(c, x - 0.25, y0 + 3.95, z - 0.25, x + 0.25, y0 + 4.0, z + 0.25); },
};
export function lampPost(c, K, look, o = {}) { (LAMP_LOOKS[look] ?? LAMP_LOOKS.guildhall)(c, K, o); }
