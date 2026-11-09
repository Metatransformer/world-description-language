// PIECES: sconce. Each sconce a hand-built generator drew, kept verbatim as a palette factory: sconce_<home>(pal) hands back
// that home's sconce drawing in whatever colours, textures and helpers pal carries. The home passes its own (it draws as
// it always did); a kit case or another building passes its palette to draw the same shape its way.
export function sconce_magesHall(pal) {
  const { IR, IRONC, LA, RB, WAX, gb, glow, gp, m } = pal;
  return function sconce(c, g) { m(c, IR, IRONC, 0.5, 0.5); gb(c, g, -0.08, 2.0, 0, 0.08, 2.3, 0.04); gb(c, g, -0.02, 2.1, 0, 0.02, 2.14, 0.22); LA(c, ...gp(g, 0, 0, 0.24).map((v, i) => i === 1 ? 2.12 : v), [[0.07, 0], [0.07, 0.02], [0, 0.02]], 6);
  const p = gp(g, 0, 2.14, 0.24); m(c, null, WAX, 0.7); LA(c, p[0], p[1], p[2], [[0.03, 0], [0.03, 0.12], [0, 0.13]], 6); glow(c, "oklch(0.95 0.08 80)", [3.2, 1.7, 0.5]); RB(c, p[0], p[1] + 0.18, p[2], 0.025, 0.05, 0.025); }
}

export function sconce_valenfeldKeepHall(pal) {
  const { IR, IRONC, LA, SEG, candle, paint } = pal;
  return function sconce(c, x, y, z, ax, s) {          // iron bracket + candle on a wall facing ±ax
  paint(c, IR, IRONC); const p = ax === "x" ? [x, y, z] : [x, y, z], q = ax === "x" ? [x + s * 0.25, y, z] : [x, y, z + s * 0.25];
  SEG(c, p, q, 0.03); LA(c, q[0], y, q[2], [[0.06, 0], [0.08, 0.04]], 6, true); candle(c, q[0], y + 0.04, q[2], 0.2);
}
}

export const STYLES = { "mages-hall": sconce_magesHall, "valenfeld-keep-hall": sconce_valenfeldKeepHall };
