// A SUNSCAR DOMED HALL (Qasreth's Mages Guild): a square sandstone hall on a plinth, a tall pointed-arch
// portal (pishtaq) framed in blue tile, an open doorway you walk through, four corner turrets with little
// tiled domes, a drum and a turquoise-tiled dome with brass ribs and finial. Inside: tiled floor, a rug,
// a glowing scrying basin, book shelves. params: w (square side), h (wall height). Front is -z.
import { TX, TINT, paint, flatc, glow, HX, BX, LA, CY, CB, ARCHFILL, archY, quad } from "../lib/desert-kit.js";
const ST = "oklch(0.96 0.02 70)", ST2 = "oklch(0.92 0.02 65)", BRASS = "oklch(0.78 0.11 85)", TEAL = "oklch(0.5 0.075 215)";
const DOME = [[4.75, 0], [4.8, 0.6], [4.65, 1.6], [4.15, 2.7], [3.35, 3.6], [2.25, 4.4], [1.15, 4.95], [0.35, 5.25], [0, 5.35]];
export function geometry(c) {
  const p = c.params, D = c.lod, w = p.w ?? 14, h = p.h ?? 6.5, hw = w / 2, t = 0.8, fl = 0.5, dw = 1.0, sp = 3.2, ap = 4.1, PH = h + 1.6;
  const n = D <= 2 ? 28 : D <= 3 ? 18 : D <= 4 ? 12 : 8;
  if (D >= 5) { paint(c, TX.sand, TINT.stone); BX(c, -hw, -0.3, -hw, hw, h + 0.6, hw); paint(c, TX.tile, "oklch(0.97 0.02 220)"); LA(c, 0, h + 0.6, 0, [[hw * 0.62, 0], [hw * 0.6, hw * 0.35], [hw * 0.35, hw * 0.65], [0, hw * 0.8]], 8, false); return; }
  // plinth, the portal's apron and a step
  paint(c, TX.sand, ST2); BX(c, -hw - 0.4, -0.6, -hw - 0.4, hw + 0.4, fl, hw + 0.4); BX(c, -3.3, -0.6, -hw - 0.9, 3.3, fl, -hw - 0.4); BX(c, -2.4, -0.4, -hw - 1.55, 2.4, 0.25, -hw - 0.9);
  // walls, the front split round the arched doorway
  paint(c, TX.sand, ST);
  BX(c, -hw, fl, hw - t, hw, h, hw); BX(c, -hw, fl, -hw, -hw + t, h, hw - t); BX(c, hw - t, fl, -hw, hw, h, hw - t);
  BX(c, -hw + t, fl, -hw, -dw, h, -hw + t); BX(c, dw, fl, -hw, hw - t, h, -hw + t);
  ARCHFILL(c, dw, sp + fl, ap + fl, h, -hw, -hw + t, D <= 2 ? 12 : 4);
  // the portal: piers, a pointed niche, a crenellated top
  BX(c, -3.1, fl, -hw - 0.7, -1.7, PH, -hw); BX(c, 1.7, fl, -hw - 0.7, 3.1, PH, -hw);
  ARCHFILL(c, 1.7, 4.6, 6.1, PH, -hw - 0.7, -hw, D <= 2 ? 14 : 5);
  // roof slab and parapet
  BX(c, -hw - 0.05, h, -hw - 0.05, hw + 0.05, h + 0.35, hw + 0.05);
  if (D <= 3) { for (let i = 0; i < 4; i++) { const yaw = i * 90; const s = hw + 0.05;
    for (let x = -s + 0.6; x < s - 0.5; x += 1.25) { const P = (u, v) => i === 0 ? [u, v] : i === 1 ? [v, -u] : i === 2 ? [-u, -v] : [-v, u];
      const [a0, b0] = P(x - 0.3, -s), [a1, b1] = P(x + 0.3, -s + 0.35); BX(c, Math.min(a0, a1), h + 0.35, Math.min(b0, b1), Math.max(a0, a1), h + 0.95, Math.max(b0, b1)); } }
    for (let x = -2.9; x < 2.9; x += 0.9) BX(c, x, PH, -hw - 0.7, x + 0.5, PH + 0.5, -hw - 0.35); }
  if (D <= 2) {
    // tile: portal frame, tympanum over the door, a band under the parapet
    paint(c, TX.tile, TINT.white);
    BX(c, -2.0, fl + 0.3, -hw - 0.74, -1.72, PH - 0.3, -hw - 0.68); BX(c, 1.72, fl + 0.3, -hw - 0.74, 2.0, PH - 0.3, -hw - 0.68); BX(c, -2.0, PH - 0.55, -hw - 0.74, 2.0, PH - 0.3, -hw - 0.68);
    BX(c, -0.95, ap + fl + 0.15, -hw - 0.04, 0.95, 5.5, -hw);
    for (const s of [-1, 1]) { BX(c, -hw - 0.04, h - 0.6, -hw - 0.04, hw + 0.04, h - 0.35, -hw + 0.0); }
    BX(c, -hw - 0.04, h - 0.6, hw, hw + 0.04, h - 0.35, hw + 0.04); BX(c, -hw - 0.04, h - 0.6, -hw, -hw, h - 0.35, hw); BX(c, hw, h - 0.6, -hw, hw + 0.04, h - 0.35, hw);
    // brass-studded teal door leaves swung open against the inside of the front wall
    flatc(c, TEAL); for (const s of [-1, 1]) BX(c, s * dw - (s > 0 ? 0 : 0.1) + (s > 0 ? 0 : 0), fl, -hw + t, s * dw + (s > 0 ? 0.1 : 0), fl + sp + 0.3, -hw + t + 0.98);
    // tall lattice windows, lamplit, two to a side and one at the back
    for (const [sx, z] of [[-1, -3], [-1, 3], [1, -3], [1, 3], [0, 0]]) {
      const yaw = sx < 0 ? 90 : sx > 0 ? -90 : 180;
      const at = (u, y, v) => sx < 0 ? [-hw - v, y, -u + z] : sx > 0 ? [hw + v, y, u + z] : [-u, y, hw + v];
      const box = (u0, y0, v0, u1, y1, v1) => { const A = at(u0, y0, v0), B = at(u1, y1, v1); BX(c, Math.min(A[0], B[0]), y0, Math.min(A[2], B[2]), Math.max(A[0], B[0]), y1, Math.max(A[2], B[2])); };
      glow(c, "#2a2016", [0.6, 0.36, 0.12]); box(-0.45, 2.0, -0.02, 0.45, 4.0, 0.03);
      for (let i = 0; i < 6; i++) { const u = -0.45 + 0.9 * i / 6, a = archY(u, 0.45, 4.0, 4.6), b = archY(u + 0.15, 0.45, 4.0, 4.6); box(u, 4.0, -0.02, u + 0.15, (a + b) / 2, 0.03); }
      paint(c, TX.oak, "oklch(0.82 0.03 55)"); for (let i = 1; i < 4; i++) box(-0.45 + 0.9 * i / 4 - 0.02, 2.0, 0.03, -0.45 + 0.9 * i / 4 + 0.02, 4.0, 0.07);
      for (let i = 1; i < 6; i++) box(-0.45, 2.0 + 2 * i / 6 - 0.02, 0.03, 0.45, 2.0 + 2 * i / 6 + 0.02, 0.07);
      paint(c, TX.tile, TINT.white); box(-0.62, 1.8, -0.02, 0.62, 2.0, 0.08);
    }
  }
  // corner turrets with small tiled domes
  if (D <= 3) for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const x = sx * (hw + 0.05), z = sz * (hw + 0.05);
    paint(c, TX.sand, ST2); CY(c, x, -0.6, z, 0.85, h + 2.1, D <= 2 ? 12 : 8); if (D <= 2) { paint(c, TX.tile, TINT.white); LA(c, x, h + 1.2, z, [[0.88, 0], [0.88, 0.3]], 12, false); }
    paint(c, TX.tile, TINT.white); LA(c, x, h + 1.5, z, [[0.95, 0], [0.92, 0.3], [0.65, 0.75], [0.28, 1.05], [0, 1.3]], D <= 2 ? 12 : 8, false);
    if (D <= 2) { flatc(c, BRASS); c.metalness(0.7); LA(c, x, h + 2.75, z, [[0.06, 0], [0.09, 0.15], [0.02, 0.45], [0, 0.5]], 6, false); c.metalness(null); } }
  // drum, dome, ribs, finial
  const yd = h + 0.35, yD = yd + 1.7;
  paint(c, TX.sand, ST); LA(c, 0, yd, 0, [[4.6, 0], [4.6, 1.7]], n, false); if (D <= 4) LA(c, 0, yd + 1.7, 0, [[4.6, 0], [4.85, 0.0]], n, false);
  if (D <= 2) { paint(c, TX.tile, TINT.white); LA(c, 0, yd + 1.25, 0, [[4.63, 0], [4.63, 0.35]], n, false);
    flatc(c, "#1d1a22"); for (let i = 0; i < 12; i++) { const a = (i + 0.5) / 12 * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a), r = 4.63, hwid = 0.28;
      quad(c, [ca * r - sa * hwid, yd + 0.3, sa * r + ca * hwid], [ca * r + sa * hwid, yd + 0.3, sa * r - ca * hwid], [ca * r + sa * hwid, yd + 1.05, sa * r - ca * hwid], [ca * r - sa * hwid, yd + 1.05, sa * r + ca * hwid]); } }
  paint(c, TX.tile, TINT.white); LA(c, 0, yD, 0, D <= 4 ? DOME : [DOME[0], DOME[3], DOME[6], DOME[8]], n, false);
  if (D <= 1) { flatc(c, BRASS); c.metalness(0.6); const R = 16, d = 0.035;
    for (let k = 0; k < R; k++) { const a = k / R * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a);
      for (let i = 0; i < DOME.length - 2; i++) { const [r0, h0] = DOME[i], [r1, h1] = DOME[i + 1], o = 0.04;
        quad(c, [ca * (r0 + o) - sa * d, yD + h0, sa * (r0 + o) + ca * d], [ca * (r0 + o) + sa * d, yD + h0, sa * (r0 + o) - ca * d], [ca * (r1 + o) + sa * d, yD + h1, sa * (r1 + o) - ca * d], [ca * (r1 + o) - sa * d, yD + h1, sa * (r1 + o) + ca * d]); } }
    c.metalness(null); }
  if (D <= 3) { flatc(c, BRASS); c.metalness(0.7); LA(c, 0, yD + 5.3, 0, [[0.3, 0], [0.35, 0.2], [0.12, 0.45], [0.22, 0.7], [0.06, 0.95], [0, 1.6]], 10, false); c.metalness(null); }
  // inside
  if (D <= 2) { const ix = hw - t;
    paint(c, TX.flag, "oklch(0.95 0.02 75)"); BX(c, -ix, fl, -ix, ix, fl + 0.02, ix);
    paint(c, TX.red, TINT.cloth); BX(c, -2.2, fl + 0.02, -3.5, 2.2, fl + 0.04, 2.5);
    paint(c, TX.sand, ST); LA(c, 0, fl, 0, [[0.55, 0], [0.5, 0.15], [0.25, 0.3], [0.22, 0.75], [0.7, 0.95], [0.8, 1.05]], 16, true);
    glow(c, "#2a5a7a", [0.2, 0.75, 1.2]); LA(c, 0, fl + 1.0, 0, [[0.72, 0], [0, 0.0]], 16, true);
    paint(c, TX.oak, "oklch(0.86 0.03 60)"); const books = ["#7a2e22", "#2f3d52", "#4f6b4a", "#7a6a55", "#c9a45a"];
    for (const x0 of [-5.4, -1.6, 2.2]) { BX(c, x0, fl, ix - 0.5, x0 + 3.2, fl + 2.6, ix - 0.45); for (const y of [0, 0.8, 1.6, 2.5]) BX(c, x0, fl + y, ix - 0.5, x0 + 3.2, fl + y + 0.06, ix);
      for (const y of [0.06, 0.86, 1.66]) for (let x = x0 + 0.08; x < x0 + 3.1; x += 0.11) { flatc(c, books[Math.floor(c.random() * books.length)]); BX(c, x, fl + y, ix - 0.4, x + 0.08, fl + y + 0.5 + c.random() * 0.18, ix - 0.08); }
      paint(c, TX.oak, "oklch(0.86 0.03 60)"); }
    for (const sz of [-1, 1]) { BX(c, -ix, fl, sz * 2.5 - 0.6, -ix + 0.8, fl + 0.85, sz * 2.5 + 0.6); }
  }
}
export function collider(c) {
  const p = c.params, w = p.w ?? 14, h = p.h ?? 6.5, hw = w / 2, t = 0.8, fl = 0.5, dw = 1.0, sp = 3.2, PH = h + 1.6, L = CB();
  L(-hw - 0.4, -0.6, -hw - 0.4, hw + 0.4, fl, hw + 0.4); L(-3.3, -0.6, -hw - 0.9, 3.3, fl, -hw - 0.4); L(-2.4, -0.4, -hw - 1.55, 2.4, 0.25, -hw - 0.9);
  L(-hw, fl, hw - t, hw, h, hw); L(-hw, fl, -hw, -hw + t, h, hw - t); L(hw - t, fl, -hw, hw, h, hw - t);
  L(-hw + t, fl, -hw, -dw, h, -hw + t); L(dw, fl, -hw, hw - t, h, -hw + t); L(-dw, fl + sp, -hw, dw, h, -hw + t);
  L(-3.1, fl, -hw - 0.7, -1.7, PH, -hw); L(1.7, fl, -hw - 0.7, 3.1, PH, -hw); L(-1.7, fl + 4.6, -hw - 0.7, 1.7, PH, -hw);
  L(-hw, h, -hw, hw, h + 0.35, hw); L(-0.85, fl, -0.85, 0.85, fl + 1.05, 0.85);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) L(sx * (hw + 0.05) - 0.8, -0.6, sz * (hw + 0.05) - 0.8, sx * (hw + 0.05) + 0.8, h + 2.1, sz * (hw + 0.05) + 0.8);
  L.list.push({ kind: "cylinder", radiusTop: 2.5, radiusBottom: 4.7, height: 6.5, center: [0, h + 0.35 + 3.25, 0] });
  return L.list;
}
