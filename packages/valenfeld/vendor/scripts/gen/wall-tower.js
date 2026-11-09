// A round drum tower for Valenfeld's curtain wall: battered fieldstone footing, a moss line, a string course,
// a corbelled machicolation band, crenellated parapet, a mossy slate cone roof with an iron finial and a red pennant.
// params: { r: radius (3.2), h: wall-walk height (10), roof: true, seed }
import { paint, flatc, LA, RB, CY, FS, SL, IR, STONE, IRONC } from "../lib/buildkit.js";
const STONE2 = "oklch(0.82 0.015 80)", STONE3 = "oklch(0.66 0.02 75)", MOSS = "oklch(0.6 0.05 125)", SLATE = "oklch(0.62 0.03 140)";
export function geometry(c) {
  const p = c.params ?? {}, r = p.r ?? 3.2, h = p.h ?? 10, L = c.lod ?? 1, n = L <= 2 ? 20 : 12, s = p.seed ?? 1;
  paint(c, FS, STONE3); LA(c, 0, -3, 0, [[r + 0.7, 0], [r + 0.55, 3.6], [r + 0.15, 4.4]], n, true, "y", false);
  paint(c, FS, STONE); LA(c, 0, -3, 0, [[r, 0], [r, h + 3]], n, false, "y", false);
  if (L <= 2) { paint(c, FS, MOSS); LA(c, 0, 1.4, 0, [[r + 0.18, 0], [r + 0.02, 1.1]], n, false, "y", false); }
  paint(c, FS, STONE2); LA(c, 0, h * 0.55, 0, [[r + 0.16, 0], [r + 0.16, 0.3]], n, true, "y", false);
  LA(c, 0, h - 0.6, 0, [[r, 0], [r + 0.55, 0.7], [r + 0.55, 1.6]], n, true, "y", false);   // corbel band and parapet wall
  if (L <= 2) for (let k = 0; k < 4; k++) { const a = (k / 4 + (s % 7) / 28) * 360;   // arrow slits
    const ar = a * Math.PI / 180; flatc(c, "#15120f"); RB(c, Math.cos(ar) * (r + 0.01), h * 0.35, Math.sin(ar) * (r + 0.01), 0.12, 1.4, 0.1, -a + 90); }
  paint(c, FS, STONE2); const m = L <= 2 ? 10 : 6;
  for (let k = 0; k < m; k++) { const a = k / m * Math.PI * 2; RB(c, Math.cos(a) * (r + 0.3), h + 1.55, Math.sin(a) * (r + 0.3), 0.9, 0.9, 0.5, -a * 180 / Math.PI + 90); }
  if (p.roof !== false) {
    paint(c, SL, SLATE); LA(c, 0, h + 1.2, 0, [[r + 0.85, 0], [r * 0.55, r * 0.75], [0.06, r * 1.75]], n, true, "y", false);
    paint(c, IR, IRONC); CY(c, 0, h + 1.2 + r * 1.75 - 0.1, 0, 0.05, 1.6, 6);
    flatc(c, "#7a2a22"); RB(c, 0.45, h + 1.2 + r * 1.75 + 1.2, 0, 0.8, 0.4, 0.03);
  }
}
