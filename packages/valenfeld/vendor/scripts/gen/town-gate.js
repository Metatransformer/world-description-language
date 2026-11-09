// A Valenfeld gatehouse: two drum towers flanking an arched passage (the road runs along local z), a raised
// iron portcullis in the arch, oak leaves standing open on the inner face, a crenellated bridge-block over the
// passage with the Annvyr banner on its outer (−z) face, and iron torch brackets either side of the arch.
// params: { w: passage width (7), r: tower radius (3.4), h: tower height (12) }
import { paint, flatc, LA, RB, BX, CY, FS, SL, IR, OAK, STONE, IRONC, WOOD } from "../lib/buildkit.js";
const STONE2 = "oklch(0.82 0.015 80)", STONE3 = "oklch(0.66 0.02 75)", SLATE = "oklch(0.62 0.03 140)";
export function geometry(c) {
  const p = c.params ?? {}, w = p.w ?? 7, r = p.r ?? 3.4, h = p.h ?? 12, L = c.lod ?? 1, n = L <= 2 ? 20 : 12, hw = w / 2, d = 3.4;
  const tx = hw + r - 0.6, top = h - 3.2, archY = 4.6;
  for (const sx of [-1, 1]) {   // the drums
    const x = sx * tx;
    paint(c, FS, STONE3); LA(c, x, -3, 0, [[r + 0.7, 0], [r + 0.55, 3.6], [r + 0.15, 4.4]], n, true, "y", false);
    paint(c, FS, STONE); LA(c, x, -3, 0, [[r, 0], [r, h + 3]], n, false, "y", false);
    paint(c, FS, STONE2); LA(c, x, h - 0.6, 0, [[r, 0], [r + 0.55, 0.7], [r + 0.55, 1.6]], n, true, "y", false);
    LA(c, x, h * 0.55, 0, [[r + 0.16, 0], [r + 0.16, 0.3]], n, true, "y", false);
    for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; RB(c, x + Math.cos(a) * (r + 0.3), h + 1.55, Math.sin(a) * (r + 0.3), 0.9, 0.9, 0.5, -a * 180 / Math.PI + 90); }
    paint(c, SL, SLATE); LA(c, x, h + 1.2, 0, [[r + 0.85, 0], [r * 0.55, r * 0.75], [0.06, r * 1.8]], n, true, "y", false);
    paint(c, IR, IRONC); CY(c, x, h + 1.1 + r * 1.8, 0, 0.05, 1.6, 6);
    flatc(c, "#7a2a22"); RB(c, x + 0.45, h + 1.2 + r * 1.8 + 1.2, 0, 0.8, 0.4, 0.03);
    if (L <= 2) for (const sz of [-1, 1]) { flatc(c, "#15120f"); RB(c, x + sx * 0.8, h * 0.4, sz * (r - 0.05), 0.12, 1.4, 0.2); }
  }
  // art-critic kit fix: a tower door stands IN its drum. params.doorways = [{ sx, a, y, R }]: drum side, angle (deg, local xz about the drum),
  // the leaf's base (local y) and radius; a stone backing fills drum-to-leaf, jambs, lintel and a threshold step frame it, sunk below for slopes.
  for (const dw of p.doorways ?? []) {
    const cx = dw.sx * tx, ca = Math.cos(dw.a * Math.PI / 180), sa = Math.sin(dw.a * Math.PI / 180), yaw = 90 - dw.a, y = dw.y, R = dw.R ?? r + 0.95;
    const at = (Rc, off, yc, wd, ht, dp) => RB(c, cx + ca * Rc - sa * off, yc, sa * Rc + ca * off, wd, ht, dp, yaw);
    paint(c, FS, STONE3); at((r - 0.4 + R - 0.07) / 2, 0, y + 1.0, 2.4, 4.2, R - 0.07 - (r - 0.4));
    paint(c, FS, STONE2);
    for (const s of [-1, 1]) at((r - 0.2 + R + 0.22) / 2, s * 0.94, y + 0.95, 0.36, 3.1, R + 0.22 - (r - 0.2));
    at((r - 0.2 + R + 0.22) / 2, 0, y + 2.7, 2.24, 0.5, R + 0.22 - (r - 0.2));
    at((r - 0.2 + R + 0.32) / 2, 0, y + 3.05, 2.5, 0.2, R + 0.32 - (r - 0.2));
    paint(c, FS, STONE3); at(R + 0.18, 0, y - 0.13, 2.0, 0.38, 0.5);
  }
  // the block over the passage, its underside an arch stepped in 12 slices
  paint(c, FS, STONE); BX(c, -tx, top - 0.01, -d / 2, tx, top + 1.0, d / 2);
  const S = 12; for (let i = 0; i < S; i++) { const x0 = -hw + w * i / S, x1 = -hw + w * (i + 1) / S, xm = (x0 + x1) / 2;
    const y = archY + 1.4 * Math.sqrt(Math.max(0, 1 - (xm / hw) ** 2)); BX(c, x0, y, -d / 2, x1, top, d / 2); }
  paint(c, FS, STONE2); BX(c, -tx, top + 1.0, -d / 2 - 0.15, tx, top + 1.3, d / 2 + 0.15);
  for (let x = -tx + 0.6; x + 0.9 <= tx - 0.6; x += 1.7) for (const sz of [-1, 1]) BX(c, x, top + 1.3, sz * d / 2 - 0.25, x + 0.9, top + 2.3, sz * d / 2 + (sz > 0 ? 0.15 : -0.15) * -1 + sz * 0.15);
  paint(c, FS, STONE3); for (const sz of [-1, 1]) { const z = sz * d / 2; BX(c, -hw - 0.35, archY + 1.4, z - 0.12 * sz, hw + 0.35, archY + 1.9, z + 0.12 * sz); }   // voussoir band
  // raised portcullis, its teeth hanging just under the arch
  paint(c, IR, IRONC); for (let x = -hw + 0.4; x < hw - 0.2; x += 0.55) BX(c, x - 0.05, archY + 0.3, -0.06, x + 0.05, top, 0.06);
  for (let y = archY + 0.6; y < top; y += 0.6) BX(c, -hw, y - 0.04, -0.08, hw, y + 0.04, 0.08);
  // oak leaves open against the inner face (+z)
  paint(c, OAK, WOOD); for (const sx of [-1, 1]) BX(c, sx * (hw - 0.02), 0, d / 2 + 0.05, sx * (hw - 0.14), archY + 0.6, d / 2 + hw * 0.92);
  paint(c, IR, IRONC); for (const sx of [-1, 1]) for (const y of [0.9, archY - 0.4]) BX(c, sx * (hw - 0.15), y, d / 2 + 0.2, sx * (hw - 0.19), y + 0.12, d / 2 + hw * 0.85);
  // banner on the outer face, gold band
  flatc(c, "#7a2a22"); BX(c, -0.9, top - 2.6, -d / 2 - 0.08, 0.9, top + 0.8, -d / 2 - 0.02);
  flatc(c, "#c9a45a"); BX(c, -0.9, top + 0.4, -d / 2 - 0.1, 0.9, top + 0.55, -d / 2 - 0.08); BX(c, -0.14, top - 2.2, -d / 2 - 0.1, 0.14, top + 0.1, -d / 2 - 0.08);
  // torch brackets both faces
  for (const sz of [-1, 1]) for (const sx of [-1, 1]) { const x = sx * (hw + 0.7), z = sz * (d / 2 + 0.2);
    paint(c, IR, IRONC); RB(c, x, 3.2, z, 0.08, 0.6, 0.08); RB(c, x, 3.5, z + sz * 0.15, 0.06, 0.06, 0.4);
    paint(c, OAK, WOOD); CY(c, x, 3.4, z + sz * 0.3, 0.04, 0.3, 6); flatc(c, "#2b2016"); CY(c, x, 3.68, z + sz * 0.3, 0.055, 0.12, 6); }
}
