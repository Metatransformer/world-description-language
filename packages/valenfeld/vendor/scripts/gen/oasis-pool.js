// THE OASIS POOL: a raised sandstone basin (coping blocks round a battered rim) set in a ring of worn
// flagstone paving, a fountain spout at the north, reeds and lily pads; the water is its own row (a water
// material) at y = 0.42. params: r (inner radius), plaza (paving radius). Origin at the centre, ground y 0.
import { TX, paint, flatc, HX, BX, LA, quad } from "../lib/desert-kit.js";
const P = (a, r, y) => [Math.cos(a) * r, y, Math.sin(a) * r];
function rim(c, r, n, gap = 0) { for (let i = 0; i < n; i++) { const a0 = i / n * 6.2832 + gap, a1 = (i + 1) / n * 6.2832 - gap;
  HX(c, [P(a0, r, 0), P(a1, r, 0), P(a1, r + 0.75, -0.2), P(a0, r + 0.75, -0.2), P(a0, r, 0.55), P(a1, r, 0.55), P(a1, r + 0.65, 0.55), P(a0, r + 0.65, 0.55)]); } }
export function geometry(c) {
  const p = c.params, D = c.lod, r = p.r ?? 7, pl = p.plaza ?? 17, n = D <= 2 ? 40 : D <= 3 ? 28 : 14;
  if (D >= 5) { paint(c, TX.flag, "oklch(0.95 0.02 70)"); LA(c, 0, 0, 0, [[pl, 0.02], [r + 0.6, 0.05], [r + 0.6, 0.6], [r, 0.6], [r, 0.3]], 12, false); return; }
  // paving: an irregular-edged ring of flags
  paint(c, TX.flag, "oklch(0.95 0.02 70)"); const m = D <= 2 ? 64 : 24;
  for (let i = 0; i < m; i++) { const a0 = i / m * 6.2832, a1 = (i + 1) / m * 6.2832, e0 = pl + 1.2 * c.noise2d(Math.cos(a0) * 3, Math.sin(a0) * 3), e1 = pl + 1.2 * c.noise2d(Math.cos(a1) * 3, Math.sin(a1) * 3);
    quad(c, P(a0, r + 0.7, 0.04), P(a0, e0, 0.04), P(a1, e1, 0.04), P(a1, r + 0.7, 0.04)); }
  // basin floor, dark under the water
  flatc(c, "oklch(0.3 0.04 195)"); for (let i = 0; i < n; i++) { const a0 = i / n * 6.2832, a1 = (i + 1) / n * 6.2832; c.tri(0, 0.05, 0, ...P(a1, r + 0.05, 0.05), ...P(a0, r + 0.05, 0.05)); }
  paint(c, TX.sand, "oklch(0.93 0.02 70)"); rim(c, r, n);
  if (D <= 2) { paint(c, TX.sand, "oklch(0.96 0.015 75)"); const k = 32; // coping blocks
    for (let i = 0; i < k; i++) { const a0 = i / k * 6.2832 + 0.006, a1 = (i + 1) / k * 6.2832 - 0.006;
      HX(c, [P(a0, r - 0.12, 0.55), P(a1, r - 0.12, 0.55), P(a1, r + 0.8, 0.55), P(a0, r + 0.8, 0.55), P(a0, r - 0.12, 0.72), P(a1, r - 0.12, 0.72), P(a1, r + 0.8, 0.72), P(a0, r + 0.8, 0.72)]); }
    // the spout: a pillar on the north coping, a lion-mouth basin spilling into the pool
    paint(c, TX.sand, "oklch(0.92 0.02 65)"); BX(c, -0.45, 0, -r - 1.35, 0.45, 2.0, -r - 0.55);
    LA(c, 0, 2.0, -r - 0.95, [[0.6, 0], [0.62, 0.1], [0.4, 0.22], [0, 0.5]], 10, false);
    paint(c, TX.tile, "oklch(0.97 0.01 80)"); BX(c, -0.35, 1.0, -r - 0.57, 0.35, 1.7, -r - 0.53);
    flatc(c, "oklch(0.55 0.05 80)"); BX(c, -0.08, 1.15, -r - 0.53, 0.08, 1.25, -r - 0.2);
    // reeds and lily pads
    for (let j = 0; j < 6; j++) { const a = j * 1.05 + 0.4, cx = Math.cos(a) * (r - 0.6), cz = Math.sin(a) * (r - 0.6);
      for (let b = 0; b < 9; b++) { const ba = c.random() * 6.28, hgt = 0.9 + c.random() * 0.8, lx = cx + Math.cos(ba) * 0.25, lz = cz + Math.sin(ba) * 0.25, tx = lx + Math.cos(ba) * 0.3, tz = lz + Math.sin(ba) * 0.3;
        flatc(c, `oklch(${(0.5 + c.random() * 0.12).toFixed(2)} 0.1 ${(115 + c.random() * 20).toFixed(0)})`); c.tri(lx - 0.03, 0.05, lz, lx + 0.03, 0.05, lz, tx, hgt, tz); } }
    for (let j = 0; j < 9; j++) { const a = j * 0.73 + 2, rr = 2 + (j * 1.7) % (r - 2.6), cx = Math.cos(a) * rr, cz = Math.sin(a) * rr, s = 0.25 + (j % 3) * 0.08;
      flatc(c, "oklch(0.5 0.1 140)"); for (let q = 0; q < 7; q++) { const b0 = q / 8 * 6.283, b1 = (q + 1) / 8 * 6.283; c.tri(cx, 0.45, cz, cx + Math.cos(b1) * s, 0.45, cz + Math.sin(b1) * s, cx + Math.cos(b0) * s, 0.45, cz + Math.sin(b0) * s); }
      if (j % 3 === 0) { flatc(c, "oklch(0.88 0.06 350)"); LA(c, cx + 0.05, 0.45, cz, [[0.08, 0], [0.06, 0.08], [0, 0.1]], 6, false); } }
  }
}
export function collider(c) { const r = c.params.r ?? 7; rim(c, r, 20); BX(c, -0.45, 0, -r - 1.35, 0.45, 2.0, -r - 0.55); }
