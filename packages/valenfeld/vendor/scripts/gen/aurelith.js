// UNIVERSITY OF AURELITH, the upper grounds around the old campus quad: three terraces on battered retaining walls,
// the great library with its clock tower, two lecture halls, a chapter house, the copper-domed observatory, the bell
// tower, a cloister walk and the dormitory ranges on the lower east terrace. Mostly scenery: halls are shut; the stairs
// climb. Layout: scripts/lib/data/aurelith.yml. Art sheet: art.yml arch-aurelith (stone ivory, Aurelith blue,
// academic gold, copper green, mossy slate).
import A from "../lib/data/aurelith.json";
import { paint, flatc, glow, BX, RB, LA, CY, ROOF, CB } from "../lib/buildkit.js";
const ASH = "cdn/texture-pale-limestone-ashlar-blocks.png", FIELD = "cdn/texture-fieldstone-wall-mossy.png", FLAG = "cdn/texture-flagstone-floor-worn.png";
const SLATE = "cdn/texture-slate-roof-tiles-mossy.png", COPPER = "cdn/texture-verdigris-copper-roof-sheets.png", PLAS = "cdn/texture-limewash-plaster.png";
const OAK = "cdn/texture-dark-oak-planks-weathered.png", IRON = "cdn/texture-wrought-iron.png";
const IVORY = "oklch(0.93 0.025 85)", STONEC = "oklch(0.86 0.02 80)", SLATEC = "oklch(0.78 0.03 255)", COPC = "oklch(0.9 0.04 170)", OAKC = "oklch(0.8 0.03 60)";
const BLUE = "#2f3d52", GOLD = "#c9a45a", WIN = [2.4, 1.5, 0.6];
const tri2 = (c, a, b, d) => { c.tri(...a, ...b, ...d); c.tri(...a, ...d, ...b); };

function terraceSolid(f, t) { const [x0, x1, z0, z1] = t.box; f(x0, A.bottom, z0, x1, t.y, z1); }
// the parapet's four runs, cut open where a stair arrives (t.gaps: { side: n|s|w|e, a, b } along that side): a closed lip walled every flight off (creator ticket #117)
function parapets(t) {
  const [x0, x1, z0, z1] = t.box, out = [], sides = { n: [x0, x1, z0, z0 + 0.5, "x"], s: [x0, x1, z1 - 0.5, z1, "x"], w: [x0, x0 + 0.5, z0, z1, "z"], e: [x1 - 0.5, x1, z0, z1, "z"] };
  for (const [k, [a, b, c, d, ax]] of Object.entries(sides)) {
    let runs = ax === "x" ? [[a, b]] : [[c, d]];
    for (const g of (t.gaps ?? []).filter((g) => g.side === k)) runs = runs.flatMap(([u, v]) => [[u, Math.min(v, g.a)], [Math.max(u, g.b), v]]).filter(([u, v]) => v - u > 0.05);
    for (const [u, v] of runs) out.push(ax === "x" ? [u, v, c, d] : [a, b, u, v]);
  }
  return out;
}
function terrace(c, t, L) {
  const [x0, x1, z0, z1] = t.box, y = t.y, B = A.bottom;
  paint(c, FIELD, STONEC); BX(c, x0, B, z0, x1, y - 0.3, z1);
  paint(c, FLAG, "oklch(0.9 0.015 80)"); BX(c, x0, y - 0.3, z0, x1, y, z1);
  paint(c, ASH, IVORY);   // a plinth course, a string course and a parapet with copings
  BX(c, x0 - 0.6, y - 1.0, z0 - 0.6, x1 + 0.6, y - 0.6, z1 + 0.6);
  for (const [a, b, cc, d] of parapets(t)) { BX(c, a, y, cc, b, y + 1.0, d); BX(c, a - 0.1, y + 1.0, cc - 0.1, b + 0.1, y + 1.15, d + 0.1); }
  if (L <= 3) { paint(c, FIELD, "oklch(0.8 0.02 80)");   // buttresses down the faces
    for (let x = x0 + 6; x < x1 - 3; x += 9) for (const z of [z0, z1]) { const s = z === z0 ? -1 : 1; BX(c, x - 0.9, B, z, x + 0.9, y - 2.5, z + s * 1.6); RB(c, x, y - 2.2, z + s * 0.8, 1.8, 1.0, 1.7, 0, s * 30, 0); }
    for (let z = z0 + 6; z < z1 - 3; z += 9) for (const x of [x0, x1]) { const s = x === x0 ? -1 : 1; BX(c, x, B, z - 0.9, x + s * 1.6, y - 2.5, z + 0.9); } }
}
function lancet(c, axis, at, u, y0, h, face, L) {   // one tall pointed window: lit glass, an ivory frame, the point a turned stone
  const w = 0.75, d = 0.12;
  const box = (u0, y0_, u1, y1, o0, o1) => axis === "x" ? BX(c, u0, y0_, face + o0, u1, y1, face + o1) : BX(c, face + o0, y0_, u0, face + o1, y1, u1);
  const s = Math.sign(face - at) || 1;
  paint(c, ASH, IVORY); box(u - w - 0.2, y0 - 0.25, u + w + 0.2, y0, 0, s * 0.35);
  glow(c, "oklch(0.85 0.1 75)", WIN); box(u - w, y0, u + w, y0 + h, 0, s * (d + 0.02));
  if (L <= 2) { flatc(c, "#1d1a16"); box(u - 0.05, y0, u + 0.05, y0 + h, s * (d + 0.02), s * (d + 0.05)); for (let k = 1; k < 4; k++) box(u - w, y0 + h * k / 4, u + w, y0 + h * k / 4 + 0.06, s * (d + 0.02), s * (d + 0.05)); }
  paint(c, ASH, IVORY); const cx = axis === "x" ? u : face + s * 0.08, cz = axis === "x" ? face + s * 0.08 : u;
  RB(c, cx, y0 + h, cz, axis === "x" ? w * 1.45 : 0.3, w * 1.45, axis === "x" ? 0.3 : w * 1.45, 0, axis === "x" ? 0 : 45, axis === "x" ? 45 : 0);
}
function gable(c, x0, x1, z0, z1, ye, rise, axis) {   // a pitched slate roof, ridge along axis, eaves out 0.6, with stone gable ends
  const o = 0.6;
  paint(c, SLATE, SLATEC);
  if (axis === "x") ROOF(c, x0 - o, x1 + o, z0 - o, z1 + o, ye - 0.4, ye + rise, 0.3);
  else { const xm = (x0 + x1) / 2, X0 = x0 - o, X1 = x1 + o, Z0 = z0 - o, Z1 = z1 + o, a = ye - 0.4, r = ye + rise, t = 0.3;
    BX; c.quad(X0, a + t, Z0, xm, r + t, Z0, xm, r + t, Z1, X0, a + t, Z1); c.quad(X0, a, Z1, xm, r, Z1, xm, r, Z0, X0, a, Z0);
    c.quad(xm, r + t, Z0, X1, a + t, Z0, X1, a + t, Z1, xm, r + t, Z1); c.quad(xm, r, Z1, X1, a, Z1, X1, a, Z0, xm, r, Z0);
    c.quad(X0, a, Z0, xm, r, Z0, xm, r + t, Z0, X0, a + t, Z0); c.quad(xm, r, Z0, X1, a, Z0, X1, a + t, Z0, xm, r + t, Z0);
    c.quad(X0, a + t, Z1, xm, r + t, Z1, xm, r, Z1, X0, a, Z1); c.quad(xm, r + t, Z1, X1, a + t, Z1, X1, a, Z1, xm, r, Z1); }
  paint(c, ASH, IVORY);
  if (axis === "x") { const zm = (z0 + z1) / 2; for (const x of [x0, x1]) tri2(c, [x, ye, z0], [x, ye, z1], [x, ye + rise, zm]); }
  else { const xm = (x0 + x1) / 2; for (const z of [z0, z1]) tri2(c, [x0, ye, z], [x1, ye, z], [xm, ye + rise, z]); }
}
function hall(c, H, L) {
  const [x0, x1, z0, z1] = H.box, y = H.y, top = y + H.h;
  paint(c, ASH, IVORY); BX(c, x0, y, z0, x1, top, z1);
  paint(c, FIELD, STONEC); BX(c, x0 - 0.3, y, z0 - 0.3, x1 + 0.3, y + 1.2, z1 + 0.3);
  paint(c, ASH, "oklch(0.96 0.02 85)"); BX(c, x0 - 0.35, top - 0.5, z0 - 0.35, x1 + 0.35, top, z1 + 0.35);
  gable(c, x0, x1, z0, z1, top, H.rise, H.axis);
  const long = H.axis === "x" ? [x0, x1] : [z0, z1], faces = H.axis === "x" ? [z0, z1] : [x0, x1], n = H.win, wh = Math.min(5.5, H.h - 3.5);
  for (const f of faces) for (let i = 0; i < n; i++) { const u = long[0] + (long[1] - long[0]) * (i + 0.5) / n;
    lancet(c, H.axis, H.axis === "x" ? (z0 + z1) / 2 : (x0 + x1) / 2, u, y + 2.0, wh, f + (f === faces[0] ? -0.01 : 0.01), L);
    if (L <= 3 && i < n - 1) { const ub = long[0] + (long[1] - long[0]) * (i + 1) / n, s = f === faces[0] ? -1 : 1; paint(c, ASH, IVORY);   // buttresses with pinnacles
      if (H.axis === "x") { BX(c, ub - 0.45, y, f, ub + 0.45, top - 1.2, f + s * 1.2); LA(c, ub, top - 1.2, f + s * 0.6, [[0.4, 0], [0.4, 0.8], [0, 2.4]], 4, true); }
      else { BX(c, f, y, ub - 0.45, f + s * 1.2, top - 1.2, ub + 0.45); LA(c, f + s * 0.6, top - 1.2, ub, [[0.4, 0], [0.4, 0.8], [0, 2.4]], 4, true); } } }
  // the great door on the end that faces the quad (north, -z) or the long north face
  const dx = H.axis === "x" ? (x0 + x1) / 2 : (x0 + x1) / 2, dz = z0;
  paint(c, ASH, IVORY); BX(c, dx - 2.2, y, dz - 0.6, dx + 2.2, y + 5.2, dz); RB(c, dx, y + 5.2, dz - 0.3, 3.1, 3.1, 0.6, 0, 0, 45);
  paint(c, OAK, OAKC); BX(c, dx - 1.4, y, dz - 0.65, dx + 1.4, y + 4.0, dz - 0.6);
  paint(c, IRON, "oklch(0.6 0.01 250)"); BX(c, dx - 1.4, y + 1.2, dz - 0.7, dx + 1.4, y + 1.3, dz - 0.64); BX(c, dx - 1.4, y + 2.9, dz - 0.7, dx + 1.4, y + 3.0, dz - 0.64);
  if (H.axis === "z" && L <= 2) { const xm = (x0 + x1) / 2; lancet(c, "x", (z0 + z1) / 2, xm, top + 0.3, H.rise * 0.55, z0 - 0.01, L); }   // rose-ish gable light
  if (H.id === "library" && L <= 3) for (const x of [x0 + 3, x1 - 3]) { paint(c, ASH, IVORY); CY(c, x, top, z0 + 1, 0.9, H.rise + 3, 8); paint(c, SLATE, SLATEC); LA(c, x, top + H.rise + 3, z0 + 1, [[1.1, 0], [0, 4]], 8, true); }
}
function dorm(c, D, L) {
  const [x0, x1, z0, z1] = D.box, y = D.y, h = D.h, axis = (x1 - x0) >= (z1 - z0) ? "x" : "z";
  paint(c, FIELD, STONEC); BX(c, x0, y, z0, x1, y + 3.4, z1);
  paint(c, PLAS, "oklch(0.95 0.02 85)"); BX(c, x0 - 0.35, y + 3.4, z0 - 0.35, x1 + 0.35, y + h, z1 + 0.35);
  if (L <= 3) { paint(c, OAK, OAKC);   // the oak frame over the plaster
    BX(c, x0 - 0.45, y + 3.3, z0 - 0.45, x1 + 0.45, y + 3.55, z1 + 0.45); BX(c, x0 - 0.45, y + h - 0.25, z0 - 0.45, x1 + 0.45, y + h, z1 + 0.45);
    const L0 = axis === "x" ? x0 : z0, L1 = axis === "x" ? x1 : z1;
    for (let u = L0; u <= L1 + 0.01; u += 3) for (const f of axis === "x" ? [z0 - 0.4, z1 + 0.4] : [x0 - 0.4, x1 + 0.4]) axis === "x" ? BX(c, u - 0.15, y + 3.4, f - 0.06, u + 0.15, y + h, f + 0.06) : BX(c, f - 0.06, y + 3.4, u - 0.15, f + 0.06, y + h, u + 0.15); }
  gable(c, x0 - 0.35, x1 + 0.35, z0 - 0.35, z1 + 0.35, y + h, D.rise, axis);
  const L0 = axis === "x" ? x0 : z0, L1 = axis === "x" ? x1 : z1, faces = axis === "x" ? [z0 - 0.36, z1 + 0.36] : [x0 - 0.36, x1 + 0.36];
  for (const f of faces) for (let u = L0 + 1.5; u < L1 - 1; u += 3) for (const wy of [y + 1.4, y + 4.6, y + 7.4].filter((v) => v < y + h - 1.4)) {
    const lit = ((u * 7 + wy * 3) | 0) % 3 !== 0;
    if (lit) glow(c, "oklch(0.85 0.1 75)", WIN); else flatc(c, "#1c2230");
    axis === "x" ? BX(c, u - 0.5, wy, f - 0.08, u + 0.5, wy + 1.3, f + 0.08) : BX(c, f - 0.08, wy, u - 0.5, f + 0.08, wy + 1.3, u + 0.5); }
  if (L <= 3) for (let u = L0 + 5; u < L1 - 3; u += 10) { const cx = axis === "x" ? u : (x0 + x1) / 2 + 1, cz = axis === "x" ? (z0 + z1) / 2 + 1 : u;   // chimneys
    paint(c, FIELD, STONEC); BX(c, cx - 0.6, y + h, cz - 0.6, cx + 0.6, y + h + D.rise + 2.2, cz + 0.6); paint(c, ASH, IVORY); BX(c, cx - 0.75, y + h + D.rise + 2.2, cz - 0.75, cx + 0.75, y + h + D.rise + 2.5, cz + 0.75); }
  if (L <= 2) for (let u = L0 + 3.5; u < L1 - 2; u += 6) for (const s of [-1, 1]) {   // dormers
    const mid = axis === "x" ? (z0 + z1) / 2 : (x0 + x1) / 2, half = (axis === "x" ? z1 - z0 : x1 - x0) / 2, f = mid + s * half * 0.55, yb = y + h + D.rise * 0.3;
    paint(c, PLAS, "oklch(0.95 0.02 85)"); axis === "x" ? BX(c, u - 0.9, yb - 0.6, f - 0.9, u + 0.9, yb + 1.4, f + 0.9) : BX(c, f - 0.9, yb - 0.6, u - 0.9, f + 0.9, yb + 1.4, u + 0.9);
    glow(c, "oklch(0.85 0.1 75)", WIN); axis === "x" ? BX(c, u - 0.45, yb, f + s * 0.9, u + 0.45, yb + 1.0, f + s * 0.96) : BX(c, f + s * 0.9, yb, u - 0.45, f + s * 0.96, yb + 1.0, u + 0.45);
    paint(c, SLATE, SLATEC); axis === "x" ? ROOF(c, u - 1.1, u + 1.1, f - 1.1, f + 1.1, yb + 1.3, yb + 2.2, 0.2) : (RB(c, f, yb + 1.75, u - 0.55, 2.3, 0.2, 1.3, 0, 40, 0), RB(c, f, yb + 1.75, u + 0.55, 2.3, 0.2, 1.3, 0, -40, 0)); }
}
function clock(c, K, L) {
  const [cx, cz] = K.at, y = K.y, w = K.w / 2, h = K.h, top = y + h;
  paint(c, ASH, IVORY); BX(c, cx - w, y, cz - w, cx + w, top, cz + w);
  paint(c, FIELD, STONEC); BX(c, cx - w - 0.4, y, cz - w - 0.4, cx + w + 0.4, y + 2, cz + w + 0.4);
  paint(c, ASH, "oklch(0.96 0.02 85)"); for (const yy of [y + 10, y + 20, top - 0.6]) BX(c, cx - w - 0.3, yy, cz - w - 0.3, cx + w + 0.3, yy + 0.6, cz + w + 0.3);
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { paint(c, ASH, IVORY); BX(c, cx + sx * w - 0.7, y, cz + sz * w - 0.7, cx + sx * w + 0.7, top + 1.2, cz + sz * w + 0.7); LA(c, cx + sx * w, top + 1.2, cz + sz * w, [[0.8, 0], [0, 3.6]], 6, true); }
  paint(c, SLATE, SLATEC); LA(c, cx, top, cz, [[w * 1.05, 0], [w * 0.9, 1], [0, 11]], 4, true, "y", false);
  paint(c, IRON, "oklch(0.75 0.08 85)"); CY(c, cx, top + 11, cz, 0.06, 2.4, 4);
  // four clock faces: ivory dial, gold ring, iron hands; the door below, two blue banners with the gold sun
  for (const [nx, nz] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) { const fx = cx + nx * (w + 0.02), fz = cz + nz * (w + 0.02), fy = y + 24.5, ax = nz !== 0 ? "z" : "x";
    flatc(c, GOLD); LA(c, fx, fy, fz, [[2.3, 0], [2.3, nz + nx ? 0.18 * (nz || nx) : 0.18]], 20, true, ax);
    flatc(c, "oklch(0.95 0.02 90)"); LA(c, fx + nx * 0.19, fy, fz + nz * 0.19, [[1.95, 0], [1.95, 0.05 * (nz || nx)]], 20, true, ax);
    if (L <= 3) { flatc(c, "#1d1a16"); const hx = fx + nx * 0.27, hz = fz + nz * 0.27; nz ? (RB(c, hx, fy + 0.6, hz, 0.14, 1.3, 0.05, 0, 0, 20), RB(c, hx, fy + 0.3, hz, 0.12, 0.9, 0.05, 0, 0, -70)) : (RB(c, hx, fy + 0.6, hz, 0.05, 1.3, 0.14, 0, 20, 0), RB(c, hx, fy + 0.3, hz, 0.05, 0.9, 0.12, 0, -70, 0)); }
    if (nz === -1 && L <= 3) for (let k = 0; k < 3; k++) lancet(c, "x", cz, cx, y + 12 + k * 0.01, 6, fz - 0.01, L);
  }
  paint(c, OAK, OAKC); BX(c, cx - 1.3, y, cz - w - 0.08, cx + 1.3, y + 4, cz - w);
  paint(c, ASH, IVORY); RB(c, cx, y + 4.1, cz - w - 0.2, 2.6, 2.6, 0.4, 0, 0, 45);
  if (L <= 3) for (const sx of [-1, 1]) { flatc(c, BLUE); BX(c, cx + sx * 2.6 - 0.8, y + 3, cz - w - 0.08, cx + sx * 2.6 + 0.8, y + 9, cz - w - 0.03);
    flatc(c, GOLD); LA(c, cx + sx * 2.6, y + 7, cz - w - 0.09, [[0.5, 0], [0.5, -0.02]], 10, true, "z"); BX(c, cx + sx * 2.6 - 0.85, y + 8.8, cz - w - 0.12, cx + sx * 2.6 + 0.85, y + 9.0, cz - w - 0.02); }
}
function bell(c, K, L) {
  const [cx, cz] = K.at, y = K.y, w = K.w / 2, h = K.h, b0 = y + h - 7;
  paint(c, ASH, IVORY); BX(c, cx - w, y, cz - w, cx + w, b0, cz + w);
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) BX(c, cx + sx * w - (sx > 0 ? 1 : 0), b0, cz + sz * w - (sz > 0 ? 1 : 0), cx + sx * w + (sx < 0 ? 1 : 0), y + h, cz + sz * w + (sz < 0 ? 1 : 0));
  BX(c, cx - w - 0.3, b0, cz - w - 0.3, cx + w + 0.3, b0 + 0.5, cz + w + 0.3); BX(c, cx - w - 0.3, y + h, cz - w - 0.3, cx + w + 0.3, y + h + 0.6, cz + w + 0.3);
  flatc(c, "oklch(0.62 0.1 70)"); LA(c, cx, b0 + 2.2, cz, [[0.15, 3.0], [0.9, 2.6], [1.2, 1.0], [1.6, 0], [1.4, 0]], 12, true);
  paint(c, SLATE, SLATEC); LA(c, cx, y + h + 0.6, cz, [[w * 1.15, 0], [0, 10]], 8, true, "y", false);
  paint(c, IRON, "oklch(0.75 0.08 85)"); CY(c, cx, y + h + 10.6, cz, 0.06, 2, 4);
  if (L <= 3) for (let k = 0; k < 3; k++) lancet(c, "x", cz, cx, y + 4 + k * 6, 3.2, cz - w - 0.01, L);
}
function observatory(c, O, L) {
  const [cx, cz] = O.at, y = O.y, r = O.r, d = O.drum, n = L <= 2 ? 32 : 16;
  paint(c, FIELD, STONEC); LA(c, cx, y, cz, [[r + 1.2, 0], [r + 1.2, 1.5], [r, 1.6]], n, true);
  paint(c, ASH, IVORY); LA(c, cx, y, cz, [[r, 0], [r, d]], n, true);
  paint(c, ASH, "oklch(0.96 0.02 85)"); LA(c, cx, y + d, cz, [[r + 0.6, 0], [r + 0.6, 0.7]], n, true);
  if (L <= 3) for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, px = cx + Math.cos(a) * (r + 0.4), pz = cz + Math.sin(a) * (r + 0.4);   // pilasters and lit round-headed windows
    paint(c, ASH, IVORY); RB(c, px, y + d / 2, pz, 0.9, d, 0.8, -a * 180 / Math.PI + 90);
    const b = a + Math.PI / 12, wx = cx + Math.cos(b) * (r + 0.05), wz = cz + Math.sin(b) * (r + 0.05);
    glow(c, "oklch(0.85 0.1 75)", WIN); RB(c, wx, y + d * 0.55, wz, 1.1, 3.6, 0.2, -b * 180 / Math.PI + 90); }
  paint(c, COPPER, COPC); const prof = []; for (let k = 0; k <= 8; k++) { const t = k / 8 * Math.PI / 2; prof.push([(r + 0.3) * Math.cos(t), (r + 0.3) * Math.sin(t) * 0.9]); }
  LA(c, cx, y + d + 0.7, cz, prof, n, false);
  if (L <= 3) { flatc(c, "#141a22"); RB(c, cx, y + d + 0.7 + r * 0.55, cz - r * 0.5, 1.6, r * 1.2, 0.3, 0, -48, 0);   // the telescope slit
    paint(c, IRON, "oklch(0.55 0.01 250)"); PIPE_T(c, cx, y + d + 4, cz - r * 0.55); }
  paint(c, ASH, IVORY); LA(c, cx, y + d + 0.7 + (r + 0.3) * 0.9, cz, [[1.4, 0], [1.4, 1.8]], 8, true);
  paint(c, COPPER, COPC); LA(c, cx, y + d + 2.5 + (r + 0.3) * 0.9, cz, [[1.7, 0], [0, 1.6]], 8, true);
  paint(c, IRON, "oklch(0.75 0.08 85)"); CY(c, cx, y + d + 4.1 + (r + 0.3) * 0.9, cz, 0.05, 1.6, 4);
}
function PIPE_T(c, x, y, z) { RB(c, x, y + 2.2, z - 1.6, 0.7, 0.7, 5.5, 0, -32, 0); }
function cloister(c, K, L) {
  const [x0, x1, z0, z1] = K.box, y = K.y, h = K.h;
  paint(c, ASH, IVORY); BX(c, x1 - 1, y, z0, x1, y + h + 1, z1);   // its back wall
  paint(c, SLATE, SLATEC); RB(c, (x0 + x1) / 2 + 0.5, y + h + 1.1, (z0 + z1) / 2, x1 - x0 + 1.4, 0.25, z1 - z0 + 0.8, 0, 0, -14);
  paint(c, ASH, IVORY); BX(c, x0 - 0.3, y + h - 0.6, z0, x0 + 0.5, y + h, z1);
  for (let z = z0 + 0.5; z <= z1 - 0.4; z += 3) { LA(c, x0, y, z, [[0.45, 0], [0.32, 0.4], [0.32, h - 1.0], [0.5, h - 0.6]], 8, true);
    if (z + 3 <= z1 && L <= 2) { const zm = z + 1.5; for (let k = 0; k < 5; k++) { const a = Math.PI * (k + 0.5) / 5, zz = zm - Math.cos(a) * 1.2, yy = y + h - 1.6 + Math.sin(a) * 0.9; BX(c, x0 - 0.3, yy, zz - 0.3, x0 + 0.3, y + h - 0.6, zz + 0.3); } } }
}
function stair(c, S, f) {   // a solid flight: each tread a stone box from the flight's foot up
  const [ax, az] = S.from, [bx, bz] = S.to, n = Math.round((S.y1 - S.y0) / 0.25), alongX = Math.abs(bx - ax) > Math.abs(bz - az), w = S.w / 2;
  for (let i = 0; i < n; i++) { const t0 = i / n, t1 = (i + 1) / n, top = S.y0 + (i + 1) * 0.25;
    if (alongX) { const u0 = ax + (bx - ax) * t0, u1 = ax + (bx - ax) * t1; f(Math.min(u0, u1), A.bottom, az - w, Math.max(u0, u1), top, az + w); }
    else { const u0 = az + (bz - az) * t0, u1 = az + (bz - az) * t1; f(ax - w, A.bottom, Math.min(u0, u1), ax + w, top, Math.max(u0, u1)); } }
  const lx = alongX ? bx : ax, lz = alongX ? az : bz;   // a landing at the head
  f(lx - w - (alongX ? 0 : 0), A.bottom, lz - w, lx + w, S.y1, lz + w);
  if (S.land) { const [a, b, cc, d] = S.land; f(a, A.bottom, b, cc, S.y1, d); }   // the head landing carried across to the terrace edge
}
function stairDress(c, S, L) {
  paint(c, ASH, IVORY); const f = (x0, y0, z0, x1, y1, z1) => BX(c, x0, Math.max(y0, S.y0 - 20), z0, x1, y1, z1); stair(c, S, f);
  const [ax, az] = S.from, [bx, bz] = S.to, alongX = Math.abs(bx - ax) > Math.abs(bz - az), w = S.w / 2;
  paint(c, FIELD, STONEC);   // stepped balustrade walls either side
  for (const s of [-1, 1]) { const n = 8; for (let i = 0; i < n; i++) { const t0 = i / n, t1 = (i + 1) / n, yt = S.y0 + (S.y1 - S.y0) * t1 + 1.0;
    alongX ? BX(c, ax + (bx - ax) * t0, A.bottom, az + s * w, ax + (bx - ax) * t1, yt, az + s * (w + 0.5)) : BX(c, ax + s * w, A.bottom, az + (bz - az) * t0, ax + s * (w + 0.5), yt, az + (bz - az) * t1); } }
}
function cypress(c, x, z, y, L) { const k = Math.abs(Math.sin(x * 12.9 + z * 78.2)), h = 7 + k * 4;
  flatc(c, "oklch(0.34 0.06 150)"); LA(c, x, y, z, [[0.2, 0], [0.9, 1.0], [1.15, h * 0.4], [0.8, h * 0.8], [0, h]], L <= 2 ? 8 : 5, true);
  flatc(c, "oklch(0.3 0.03 60)"); CY(c, x, y - 0.2, z, 0.18, 1.0, 5); }
const groundY = (x, z) => { for (const t of A.terraces) { const [x0, x1, z0, z1] = t.box; if (x >= x0 && x <= x1 && z >= z0 && z <= z1) return t.y; } return 0; };
function lamps(c, L) { if (L > 3) return; for (const t of A.terraces) { const [x0, x1, z0, z1] = t.box;
  for (let x = x0 + 4; x < x1 - 2; x += 12) for (const z of [z0 + 0.25]) { paint(c, IRON, "oklch(0.6 0.01 250)"); CY(c, x, t.y + 1.0, z, 0.07, 1.6, 5); glow(c, "oklch(0.95 0.06 85)", [3, 1.9, 0.8]); BX(c, x - 0.16, t.y + 2.6, z - 0.16, x + 0.16, t.y + 3.0, z + 0.16); } } }
export function geometry(c) {
  const L = c.lod;
  for (const t of A.terraces) terrace(c, t, L);
  for (const S of A.stairs) stairDress(c, S, L);
  for (const H of A.halls) hall(c, H, L);
  for (const D of A.dorms) dorm(c, D, L);
  clock(c, A.clock, L); bell(c, A.bell, L); observatory(c, A.observatory, L); if (L <= 3) cloister(c, A.cloister, L);
  if (L <= 3) for (const [x, z] of A.cypress) cypress(c, x, z, groundY(x, z), L);
  lamps(c, L);
  c.albedo(null); c.emissive(null);
}
export function collider(c) {
  const Lb = CB();
  for (const t of A.terraces) { terraceSolid(Lb, t); const [x0, x1, z0, z1] = t.box, y = t.y; for (const [a, b, cc, d] of parapets(t)) Lb(a, y, cc, b, y + 1, d); }
  for (const S of A.stairs) stair(null, S, Lb);
  for (const H of A.halls) { const [x0, x1, z0, z1] = H.box; Lb(x0, H.y, z0, x1, H.y + H.h + H.rise * 0.6, z1); }
  for (const D of A.dorms) { const [x0, x1, z0, z1] = D.box; Lb(x0 - 0.35, D.y, z0 - 0.35, x1 + 0.35, D.y + D.h + D.rise * 0.6, z1 + 0.35); }
  { const [cx, cz] = A.clock.at, w = A.clock.w / 2 + 0.7; Lb(cx - w, A.clock.y, cz - w, cx + w, A.clock.y + A.clock.h, cz + w); }
  { const [cx, cz] = A.bell.at, w = A.bell.w / 2; Lb(cx - w, A.bell.y, cz - w, cx + w, A.bell.y + A.bell.h, cz + w); }
  { const [cx, cz] = A.observatory.at, r = A.observatory.r + 1.2; Lb(cx - r * 0.75, A.observatory.y, cz - r * 0.75, cx + r * 0.75, A.observatory.y + A.observatory.drum + 8, cz + r * 0.75); }
  { const [x0, x1, z0, z1] = A.cloister.box; Lb(x1 - 1, A.cloister.y, z0, x1, A.cloister.y + A.cloister.h + 1, z1); }
  return Lb.list;
}
