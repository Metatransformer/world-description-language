// PIECES: rack. Each rack a hand-built generator drew, kept verbatim as a palette factory: rack_<home>(pal) hands back
// that home's rack drawing in whatever colours, textures and helpers pal carries. The home passes its own (it draws as
// it always did); a kit case or another building passes its palette to draw the same shape its way.
export function rack_crownHall(pal) {
  const { BX, F, IR, OAK, WOOD, paint } = pal;
  return function rack(c, x, z, s) { paint(c, OAK, WOOD); BX(c, x - 1, F, z, x + 1, F + 0.1, z + s * 0.4); BX(c, x - 1, F + 1.5, z, x + 1, F + 1.6, z + s * 0.12); paint(c, IR, "oklch(0.85 0.01 250)"); for (let i = 0; i < 6; i++) { const xx = x - 0.8 + i * 0.32; BX(c, xx - 0.03, F + 0.1, z + s * 0.1, xx + 0.03, F + 1.7 + (i % 2) * 0.3, z + s * 0.16); } }
}

export function rack_keepNorthRange(pal) {
  const { BX, IR, OAK, SEG, WOOD, WOOD2, paint } = pal;
  return function rack(c, x, z, dir) { paint(c, OAK, WOOD2); BX(c, x - 1.2, 0, z - 0.15, x + 1.2, 0.1, z + 0.15); BX(c, x - 1.2, 1.5, z - 0.15, x + 1.2, 1.6, z + 0.15); for (const s of [-1.2, 1.1]) BX(c, x + s, 0, z - 0.15, x + s + 0.1, 1.9, z + 0.15);
  paint(c, IR, "oklch(0.75 0.01 250)"); for (let i = 0; i < 6; i++) { const px = x - 0.95 + i * 0.38; if (i % 2) { SEG(c, [px, 0.1, z], [px, 2.4, z + dir * 0.05], 0.025); BX(c, px - 0.06, 2.3, z - 0.02, px + 0.06, 2.55, z + 0.02); } else { BX(c, px - 0.035, 0.1, z - 0.012, px + 0.035, 1.35, z + 0.012); paint(c, OAK, WOOD); BX(c, px - 0.12, 1.33, z - 0.03, px + 0.12, 1.38, z + 0.03); paint(c, IR, "oklch(0.75 0.01 250)"); } } }
}

export function rack_valenfeldKeepHall(pal) {
  const { BX, IR, IRONC, LA, OAK, PIPE, RB, WOOD, WOOD2, paint } = pal;
  return function rack(c, x, z, len, s) {                        // weapon rack against a wall at z, facing s (±1 along z)
  paint(c, OAK, WOOD); BX(c, x - len / 2, 0, z, x + len / 2, 0.12, z + s * 0.45);
  BX(c, x - len / 2, 1.5, z, x + len / 2, 1.62, z + s * 0.12); BX(c, x - len / 2, 0.55, z + s * 0.25, x + len / 2, 0.62, z + s * 0.36);
  for (const e of [-1, 1]) BX(c, x + e * len / 2 - 0.08 * (e + 1) / 2, 0, z, x + e * len / 2 - 0.08 * (e - 1) / 2 * -1 + 0.0, 1.62, z + s * 0.12);
  paint(c, OAK, WOOD2); for (let i = 0; i < 4; i++) { const xx = x - len / 2 + 0.3 + i * (len - 0.6) / 3;     // spears
    PIPE(c, [xx, 0.12, z + s * 0.3], [xx, 2.25, z + s * 0.08], 0.022, 0.022, 5); paint(c, IR, IRONC); LA(c, xx, 2.2, z + s * 0.075, [[0.04, 0], [0, 0.22]], 4, true); paint(c, OAK, WOOD2); }
  paint(c, IR, IRONC); for (let i = 0; i < 3; i++) { const xx = x - len / 2 + 0.45 + i * (len - 0.9) / 2;     // swords leaning
    RB(c, xx + 0.12, 0.62, z + s * 0.32, 0.05, 0.95, 0.012, 0, 0, -8); paint(c, OAK, WOOD); RB(c, xx + 0.19, 1.15, z + s * 0.32, 0.26, 0.04, 0.05, 0, 0, -8); paint(c, IR, IRONC); }
}
}

export const STYLES = { "crown-hall": rack_crownHall, "keep-north-range": rack_keepNorthRange, "valenfeld-keep-hall": rack_valenfeldKeepHall };
