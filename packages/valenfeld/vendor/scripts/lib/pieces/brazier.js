// PIECES: brazier. Every brazier the hand-built generators drew, lifted verbatim into one library so any building,
// interior or kit case can draw any of them. brazier_<home> is the one that home drew; STYLES maps a style name to it.
import { IR, IRONC, LA, SEG, TORUS, glow, paint } from "../buildkit.js";

export function brazier_harbourprop(c, D) {
  paint(c, IR, IRONC); for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI * 2; SEG(c, [Math.cos(a) * 0.5, 0, Math.sin(a) * 0.5], [Math.cos(a) * 0.28, 0.85, Math.sin(a) * 0.28], 0.05, 0.05); }
  LA(c, 0, 0, 0, [[0.1, 0.78], [0.38, 0.88], [0.5, 1.1], [0.53, 1.14]], D <= 2 ? 14 : 7, true);
  if (D <= 2) TORUS(c, 0, 0.45, 0, 0.36, 0.022, 12, 3);
  glow(c, "#ff9a4a", [2.6, 0.9, 0.2]); LA(c, 0, 1.08, 0, [[0.47, 0], [0.3, 0.07], [0.01, 0.1]], D <= 2 ? 10 : 6, true);
}
export const STYLES = { "harbourprop": brazier_harbourprop };

export function brazier_crownHall(pal) {
  const { BX, F, IR, IRONC, paint } = pal;
  return function brazier(c, x, z) { paint(c, IR, IRONC); BX(c, x - 0.05, F, z - 0.05, x + 0.05, F + 1, z + 0.05); BX(c, x - 0.35, F + 1, z - 0.35, x + 0.35, F + 1.25, z + 0.35); c.albedo(null); c.color("oklch(0.85 0.15 60)"); c.emissive(4, 1.8, 0.4); BX(c, x - 0.26, F + 1.25, z - 0.26, x + 0.26, F + 1.32, z + 0.26); c.emissive(null); }
}

// TRIPOD: the iron tripod brazier the dungeon mouths share: three splayed legs, a flared bowl, a rim, a bed of coals.
// Every number is a knob with the frostfang mouth's values as defaults; the barrow and the grotto pass their own.
export const TRIPOD = { box: [0.45, 1.15], phase: 0.5, leg: [0.5, 0.24, 0, 0.92, 0.035, 0.028], bowl: [0.84, 1.15, 0.26, 0.5, 12], rim: [1.13, 1.17, 0.52],
  coal: { color: "#2a120a", glow: null, n: 7, spread: 0.5, y: 1.15, size: [0.1, 0.06, 0.09] } };
export function tripodBrazier(K, ctx, col, x, y, z, o = {}, paint = null) {
  const T = { ...TRIPOD, ...o, coal: { ...TRIPOD.coal, ...(o.coal ?? {}) } }, [L0, L1, ly0, ly1, w0, w1] = T.leg, C = T.coal;
  if (col) { K.box(x - T.box[0], y, z - T.box[0], x + T.box[0], y + T.box[1], z + T.box[0]); return; }
  paint?.();
  for (let k = 0; k < 3; k++) { const a = (k / 3) * 6.283 + T.phase; K.seg([x + Math.cos(a) * L0, y + ly0, z + Math.sin(a) * L0], [x + Math.cos(a) * L1, y + ly1, z + Math.sin(a) * L1], w0, w1, 5); }
  K.seg([x, y + T.bowl[0], z], [x, y + T.bowl[1], z], T.bowl[2], T.bowl[3], T.bowl[4], true);
  K.seg([x, y + T.rim[0], z], [x, y + T.rim[1], z], T.rim[2], T.rim[2], T.bowl[4]);
  K.paint(null, C.color, 1); if (C.glow) ctx.emissive(C.glow);
  for (let k = 0; k < C.n; k++) K.rock(x + (ctx.random() - 0.5) * C.spread, y + C.y, z + (ctx.random() - 0.5) * C.spread, C.size[0], C.size[1], C.size[2], 5, 3, 0.3);
  if (C.glow) ctx.emissive(null);
}
// the cold iron brazier at the barrow's door
export const TRIPOD_BARROW = { box: [0.4, 1.1], phase: 0, leg: [0.42, 0.22, -0.1, 0.9, 0.03, 0.025], bowl: [0.82, 1.12, 0.24, 0.46, 10], rim: [1.1, 1.14, 0.47],
  coal: { color: "#1c1a19", n: 6, spread: 0.4, y: 1.12, size: [0.09, 0.05, 0.08] } };
export function brazier_frostfangMouth(pal) {
  const { TX } = pal;
  return (K, ctx, col, x, y, z) => tripodBrazier(K, ctx, col, x, y, z, { coal: { glow: "#ff5a14" } }, () => K.paint(TX.iron, "oklch(0.9 0.01 60)", 0.55, 0.7));
}

Object.assign(STYLES, { "crown-hall": brazier_crownHall, "frostfang-mouth": brazier_frostfangMouth, tripod: tripodBrazier });
