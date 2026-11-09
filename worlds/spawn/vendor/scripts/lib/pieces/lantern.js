// PIECES: lantern. Each lantern a hand-built generator drew, kept verbatim as a palette factory: lantern_<home>(pal) hands back
// that home's lantern drawing in whatever colours, textures and helpers pal carries. The home passes its own (it draws as
// it always did); a kit case or another building passes its palette to draw the same shape its way.
export function lantern_hbOldquarter(pal) {
  const { BX, IR, IRONC, LA, WARM, glow, paint } = pal;
  return function lantern(c, x, y, z, D) { paint(c, IR, IRONC); BX(c, x - 0.16, y, z - 0.16, x + 0.16, y + 0.06, z + 0.16); if (D <= 2) LA(c, x, y + 0.46, z, [[0.2, 0], [0.05, 0.22], [0, 0.24]], 6);
  glow(c, "oklch(0.9 0.1 75)", WARM); BX(c, x - 0.12, y + 0.06, z - 0.12, x + 0.12, y + 0.46, z + 0.12); }
}

export function lantern_hbWall(pal) {
  const { BX, IR, IRC, LA, WARM, glow, paint } = pal;
  return function lantern(W, x, y, z, s = 1) { paint(W, IR, IRC); BX(W, x - 0.2 * s, y - 0.05 * s, z - 0.2 * s, x + 0.2 * s, y, z + 0.2 * s); LA(W, x, y + 0.5 * s, z, [[0.26 * s, 0], [0.04 * s, 0.22 * s]], 4, true, "y", false);
  glow(W, "oklch(0.9 0.12 75)", WARM); BX(W, x - 0.15 * s, y, z - 0.15 * s, x + 0.15 * s, y + 0.5 * s, z + 0.15 * s); }
}

export function lantern_innHall(pal) {
  const { BX, IR, IRONC, LA, glow, paint } = pal;
  return function lantern(c, x, y, z, D, drop = 0) {   // hangs on a chain from y down `drop`, cage below
  paint(c, IR, IRONC); if (drop > 0) BX(c, x - 0.012, y - drop, z - 0.012, x + 0.012, y, z + 0.012);
  const t = y - drop; BX(c, x - 0.13, t - 0.42, z - 0.13, x + 0.13, t - 0.38, z + 0.13); BX(c, x - 0.14, t - 0.1, z - 0.14, x + 0.14, t - 0.06, z + 0.14); LA(c, x, t - 0.06, z, [[0.15, 0], [0.03, 0.06]], 4, true);
  if (D <= 2) for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) BX(c, x + a * 0.12 - 0.012, t - 0.38, z + b * 0.12 - 0.012, x + a * 0.12 + 0.012, t - 0.1, z + b * 0.12 + 0.012);
  glow(c, "#ffd9a0", [1.8, 1.0, 0.4]); BX(c, x - 0.1, t - 0.38, z - 0.1, x + 0.1, t - 0.1, z + 0.1); }
}

export function lantern_sunscarProp(pal) {
  const { BX, LA, TINT, TX, glow, paint } = pal;
  return function lantern(c, x, y, z, D) { // hangs from (x, y, z)
  paint(c, TX.iron, TINT.iron); if (D <= 2) BX(c, x - 0.015, y - 0.12, z - 0.015, x + 0.015, y, z + 0.015);
  LA(c, x, y - 0.22, z, [[0.17, 0], [0.04, 0.12]], 4, false); BX(c, x - 0.15, y - 0.62, z - 0.15, x + 0.15, y - 0.57, z + 0.15);
  if (D <= 2) for (const [a, b] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) BX(c, x + a * 0.13 - 0.015, y - 0.6, z + b * 0.13 - 0.015, x + a * 0.13 + 0.015, y - 0.22, z + b * 0.13 + 0.015);
  glow(c, "#5a3a18", [2.6, 1.4, 0.45]); BX(c, x - 0.11, y - 0.57, z - 0.11, x + 0.11, y - 0.24, z + 0.11);
}
}

export const STYLES = { "hb-oldquarter": lantern_hbOldquarter, "hb-wall": lantern_hbWall, "inn-hall": lantern_innHall, "sunscar-prop": lantern_sunscarProp };
