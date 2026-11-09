// PIECES: candle. Every candle the hand-built generators drew, lifted verbatim into one library so any building,
// interior or kit case can draw any of them. candle_<home> is the one that home drew; STYLES maps a style name to it.
import { BX, LA, flatc, glow } from "../buildkit.js";

export function candle_valenfeldKeepFloors(c, x, y, z, h = 0.2) { flatc(c, "oklch(0.92 0.03 90)"); BX(c, x - 0.03, y, z - 0.03, x + 0.03, y + h, z + 0.03);
  c.color("oklch(0.9 0.12 80)"); c.emissive(5, 2.6, 0.8); BX(c, x - 0.015, y + h, z - 0.015, x + 0.015, y + h + 0.06, z + 0.015); c.emissive(null); }
export function candle_valenfeldKeepHall(c, x, y, z, h = 0.16) { flatc(c, "oklch(0.9 0.03 85)"); LA(c, x, y, z, [[0.025, 0], [0.025, h]], 6, true); glow(c, "#ffcf6a", [3.2, 1.9, 0.6]); LA(c, x, y + h, z, [[0.012, 0], [0.018, 0.03], [0, 0.07]], 5, true); }
export const STYLES = { "valenfeld-keep-floors": candle_valenfeldKeepFloors, "valenfeld-keep-hall": candle_valenfeldKeepHall };

export function candle_innHall(pal) {
  const { CY, IR, IRONC, LA, RB, glow, paint } = pal;
  return function candle(c, x, y, z, h = 0.1) { paint(c, IR, IRONC); LA(c, x, y, z, [[0.05, 0], [0.05, 0.012]], 8, true);
  glow(c, "#efe3c8", [0.06, 0.05, 0.03]); CY(c, x, y + 0.012, z, 0.022, h, 6); glow(c, "#ffcf80", [2.4, 1.3, 0.45]); RB(c, x, y + h + 0.04, z, 0.018, 0.045, 0.018); }
}

Object.assign(STYLES, { "inn-hall": candle_innHall });
