// HIGHBRIDGE GUILD ROW: the three great guild halls and their street. params.kind:
//   fighters  (30 x 20 m royal ashlar hall, crimson trim, two corner towers with lead cones; inside a sand training ring, racks, dummies, braziers)
//   mages     (pale stone hall, violet lancets, a slender octagonal tower to 40 m with a floating orb; inside shelves, enchanting table)
//   explorers (teal boards in a tarred frame on a stone plinth, terracotta roof, copper lantern skylight; inside map tables, globe, crates, airship model)
//   street    (params.w x params.d paving with kerbs)   statue (fountain basin with a bronze champion)   lamp (iron street lamp, lantern at 3.9 m)
// Halls: door 2.5 x 4 m on local -Z, centred at origin, floor at y 0.3, gallery deck at 5.5 m reached by a stair on +x.
import { paint, flatc, glow, HX, BX, RB, LA, CY, ROOF, SEG, PIPE, TORUS, ROPE, LOFT, OAK, IR, FLAG, FS, IRONC, WOOD, STONE, TOWERROOF } from "../lib/buildkit.js";
import { roofZ, gableWedgeX, gableWedgeZ } from "../lib/pieces/roof.js";
import { lancetZ, lancetX, roseX } from "../lib/pieces/window.js";
import { lampPost } from "../lib/pieces/lamppost.js";   // shared lamp post, the guild-quarter look
const ASH = "cdn/texture-ashlar-cream-limestone-two-courses-big-dressed-blocks-thin-pale-mortar-subtle-weathering.png", LEAD = "cdn/texture-blue-grey-lead-slate-roof-tiles.png", TEAL = "cdn/texture-teal-painted-weatherboard-planks.png";
const TERRA = "cdn/texture-terracotta-roof-tiles-weathered.png", COPPER = "cdn/texture-verdigris-copper-roof-sheets.png", TARP = "cdn/texture-tarred-planks-black.png";
const CLOTH = "cdn/texture-faded-red-cloth-weave.png", SAND = "cdn/texture-raked-sand-arena-floor.png", MAP = "cdn/texture-old-parchment-map.png", VSL = "cdn/texture-slate-roof-tiles-mossy.png";
const W = 15, D = 10, F = 0.3, T = 0.8, GY = 5.5;               // half width, half depth, floor, wall thickness, gallery deck
const WARM = [1.8, 0.95, 0.35], VIO = [1.1, 0.55, 2.4], FIRE = [4, 1.7, 0.45];
const STY = {
  fighters: { wall: ASH, wt: "oklch(0.94 0.05 78)", trim: "oklch(0.55 0.15 27)", roof: LEAD, rt: "oklch(0.86 0.03 245)", band: "oklch(0.78 0.13 80)", H: 10, pitch: 34, cloth: "oklch(0.62 0.16 27)", glass: WARM },
  mages: { wall: ASH, wt: "oklch(0.95 0.012 270)", trim: "oklch(0.5 0.1 300)", roof: VSL, rt: "oklch(0.72 0.05 290)", band: "oklch(0.78 0.11 85)", H: 11, pitch: 40, cloth: "oklch(0.5 0.13 300)", glass: VIO },
  explorers: { wall: TEAL, wt: "oklch(0.93 0.03 195)", trim: "oklch(0.3 0.02 60)", roof: TERRA, rt: "oklch(0.9 0.04 45)", band: "oklch(0.7 0.09 165)", H: 10, pitch: 36, cloth: "oklch(0.55 0.09 195)", glass: WARM },
};
// a sloped slab between (za, ya) and (zb, yb) along x, za < zb
function SLAB(c, x0, x1, za, ya, zb, yb, t) { HX(c, [[x0, ya, za], [x1, ya, za], [x1, yb, zb], [x0, yb, zb], [x0, ya + t, za], [x1, ya + t, za], [x1, yb + t, zb], [x0, yb + t, zb]]); }
const GABLEX = gableWedgeX;   // shared roof pieces (lib/pieces/roof.js)
const GABLEZ = gableWedgeZ;
const ROOFZ = roofZ;
// a glowing lancet through a wall that runs along x at plane z (both faces lit), with a stone surround on the outer side so = sign of outward
const LANCETZ = (c, x, z, so, y0, h, w, em, col) => lancetZ(c, x, z, so, y0, h, w, em, col, T);   // shared window piece (lib/pieces/window.js)
const LANCETX = (c, x, z, so, y0, h, w, em, col) => lancetX(c, x, z, so, y0, h, w, em, col, T);
// a hanging banner, its face on -z (sz = -1) or +z, top centre at (x, y, z): cloth, gold border, swallowtail, emblem
function BANNER(c, x, y, z, sz, cloth, emblem, w = 1.7, h = 4.6) { const z0 = z - 0.03, z1 = z + 0.03, f = z + sz * 0.05;
  paint(c, IR, IRONC); PIPE(c, [x - w / 2 - 0.25, y + 0.05, z], [x + w / 2 + 0.25, y + 0.05, z], 0.04, 0.04, 6); for (const s of [-1, 1]) LA(c, x + s * (w / 2 + 0.3), y + 0.05 - 0.07, z, [[0.001, 0], [0.08, 0.07], [0.001, 0.14]], 6, false);
  paint(c, CLOTH, cloth); BX(c, x - w / 2, y - h + 0.6, z0, x + w / 2, y, z1);
  for (const s of [-1, 1]) HX(c, [[x + s * w / 2 - (s > 0 ? w / 2 : 0), y - h, z0], [x + (s > 0 ? w / 2 : 0), y - h + 0.6, z0], [x + (s > 0 ? w / 2 : 0), y - h + 0.6, z1], [x + s * w / 2 - (s > 0 ? w / 2 : 0), y - h, z1],
    [x - (s > 0 ? 0 : w / 2), y - h + 0.6, z0], [x + (s > 0 ? w / 2 : 0), y - h + 0.6, z0], [x + (s > 0 ? w / 2 : 0), y - h + 0.6, z1], [x - (s > 0 ? 0 : w / 2), y - h + 0.6, z1]].map((p) => p));
  flatc(c, "oklch(0.8 0.14 82)"); const zb0 = Math.min(z, f), zb1 = Math.max(z, f);
  BX(c, x - w / 2, y - 0.16, zb0, x + w / 2, y - 0.05, zb1); for (const s of [-1, 1]) BX(c, x + s * w / 2 - 0.07, y - h + 0.6, zb0, x + s * w / 2 + 0.01 * s, y - 0.05, zb1);
  const ey = y - h * 0.45;
  if (emblem === "swords") { flatc(c, "oklch(0.9 0.01 250)"); for (const s of [-1, 1]) RB(c, x, ey, f, 0.12, 2.0, 0.03, 0, 0, s * 35);
    flatc(c, "oklch(0.8 0.14 82)"); for (const s of [-1, 1]) { const a = s * 35 * Math.PI / 180; RB(c, x + Math.sin(a) * 0.8, ey - Math.cos(a) * 0.8, f + sz * 0.02, 0.5, 0.08, 0.04, 0, 0, s * 35); RB(c, x + Math.sin(a) * 1.0, ey - Math.cos(a) * 1.0, f + sz * 0.02, 0.07, 0.32, 0.04, 0, 0, s * 35); } }
  else if (emblem === "star") { flatc(c, "oklch(0.86 0.13 85)"); RB(c, x, ey, f, 0.9, 0.9, 0.03, 0, 0, 0); RB(c, x, ey, f, 0.9, 0.9, 0.03, 0, 0, 45); glow(c, "oklch(0.85 0.1 300)", VIO); RB(c, x, ey, f + sz * 0.02, 0.36, 0.36, 0.03, 0, 0, 45); }
  else { flatc(c, "oklch(0.86 0.13 85)"); RB(c, x, ey, f, 0.22, 1.5, 0.03, 0, 0, 0); RB(c, x, ey, f, 1.5, 0.22, 0.03, 0, 0, 0); RB(c, x, ey, f, 0.16, 0.9, 0.03, 0, 0, 45); RB(c, x, ey, f, 0.16, 0.9, 0.03, 0, 0, -45);
    flatc(c, "oklch(0.55 0.09 195)"); TORUS(c, x, ey, f + sz * 0.02, 0.5, 0.04, 16, 4, "z"); }
  c.emissive(null); }
function BRAZIER(c, x, z, lod) { paint(c, IR, IRONC); for (let k = 0; k < 3; k++) { const a = k / 3 * Math.PI * 2; SEG(c, [x + Math.cos(a) * 0.45, F, z + Math.sin(a) * 0.45], [x + Math.cos(a) * 0.2, F + 1.0, z + Math.sin(a) * 0.2], 0.06); }
  LA(c, x, F + 0.95, z, [[0.2, 0], [0.55, 0.3], [0.6, 0.42], [0.001, 0.42]], 10, false);
  glow(c, "oklch(0.8 0.15 55)", FIRE); LA(c, x, F + 1.3, z, [[0.45, 0], [0.25, 0.25], [0.001, 0.32]], 8, false); c.emissive(null); }
// ---------------- the shared hall ----------------
function hall(c, p, k, lod) { const S = STY[k], H = S.H, tp = Math.tan(S.pitch * Math.PI / 180), RH = H + D * tp, full = lod <= 1, mid = lod <= 3, inner = lod <= 2;
  // plinth, floor, steps
  paint(c, FS, "oklch(0.78 0.02 80)"); BX(c, -W - 0.4, -0.7, -D - 0.4, W + 0.4, F, D + 0.4);
  for (let i = 0; i < 2; i++) BX(c, -3.2 + i * 0.3, -0.7, -D - 1.3 + i * 0.45, 3.2 - i * 0.3, F - 0.15 - (1 - i) * 0.15 + 0.15 * i - 0.15 * i, -D - 0.4);
  if (inner) { paint(c, FLAG, "oklch(0.92 0.02 80)"); BX(c, -W + T, F, -D + T, W - T, F + 0.02, D - T); }
  // walls (front with the door hole)
  const dw = 1.25, dh = F + 4;
  paint(c, S.wall, S.wt);
  BX(c, -W, F, -D, -dw, H, -D + T); BX(c, dw, F, -D, W, H, -D + T); BX(c, -dw, dh, -D, dw, H, -D + T);
  BX(c, -W, F, D - T, W, H, D); BX(c, -W, F, -D + T, -W + T, H, D - T); BX(c, W - T, F, -D + T, W, H, D - T);
  // gables at x ends
  GABLEX(c, -W + T / 2, -D, D, H, RH, T / 2); GABLEX(c, W - T / 2, -D, D, H, RH, T / 2);
  // front pediment over the door: a cross-gable
  const px = 5.5, pr = H + px * 1.0;
  GABLEZ(c, -D + T / 2, -px, px, H, pr, T / 2);
  if (k === "explorers") { // tarred frame on teal boards, stone ground course
    paint(c, FS, "oklch(0.8 0.02 80)"); BX(c, -W - 0.05, F, -D - 0.05, -dw, 2.2, -D + 0.3); BX(c, dw, F, -D - 0.05, W + 0.05, 2.2, -D + 0.3);
    BX(c, -W - 0.05, F, D - 0.3, W + 0.05, 2.2, D + 0.05); for (const s of [-1, 1]) BX(c, s * W - 0.3 * (s > 0 ? 1 : 0) - (s < 0 ? 0.05 : -0.05) * 0, F, -D, s * W + (s > 0 ? 0.05 : -0.05), 2.2, D);
    if (mid) { paint(c, TARP, S.trim); const post = (x0, z0, x1, z1) => BX(c, x0, F, z0, x1, H, z1);
      for (const x of [-W, -10, -5, 5, 10, W]) { post(x - 0.2, -D - 0.12, x + 0.2, -D + 0.1); post(x - 0.2, D - 0.1, x + 0.2, D + 0.12); }
      for (const z of [-D, -5, 0, 5, D]) for (const s of [-1, 1]) post(s * W - 0.12, z - 0.2, s * W + 0.12, z + 0.2);
      for (const y of [2.2, 6.2]) { BX(c, -W - 0.12, y, -D - 0.12, W + 0.12, y + 0.3, -D + 0.05); BX(c, -W - 0.12, y, D - 0.05, W + 0.12, y + 0.3, D + 0.12); for (const s of [-1, 1]) BX(c, s * W - 0.12, y, -D, s * W + 0.12, y + 0.3, D); }
      for (const x0 of [-W, -10, 5, 10]) if (full) { SEG(c, [x0, 2.5, -D - 0.08], [x0 + 5, 6.2, -D - 0.08], 0.22, 0.18); SEG(c, [x0, 2.5, D + 0.08], [x0 + 5, 6.2, D + 0.08], 0.22, 0.18); } }
  } else { // ashlar: corner quoins, pilasters, a coloured band
    paint(c, S.wall, "oklch(0.88 0.02 80)"); if (mid) for (const x of [-W, -10, -5, 5, 10, W]) { BX(c, x - 0.45, F, -D - 0.25, x + 0.45, H - 0.4, -D); BX(c, x - 0.45, F, D, x + 0.45, H - 0.4, D + 0.25); }
    if (mid) for (const z of [-5, 0, 5]) for (const s of [-1, 1]) BX(c, s * W, F, z - 0.45, s * (W + 0.25), H - 0.4, z + 0.45);
    BX(c, -W - 0.3, F, -D - 0.3, W + 0.3, 1.3, -D + 0.1); BX(c, -W - 0.3, F, D - 0.1, W + 0.3, 1.3, D + 0.3); for (const s of [-1, 1]) BX(c, s * W - 0.1 * s, F, -D, s * (W + 0.3), 1.3, D);
  }
  // cornice band under the eaves
  flatc(c, S.band); BX(c, -W - 0.3, H - 0.55, -D - 0.3, W + 0.3, H - 0.15, -D); BX(c, -W - 0.3, H - 0.55, D, W + 0.3, H - 0.15, D + 0.3); for (const s of [-1, 1]) BX(c, s * W, H - 0.55, -D, s * (W + 0.3), H - 0.15, D);
  if (k === "explorers") { paint(c, COPPER, "oklch(0.9 0.03 170)"); BX(c, -W - 0.35, H - 0.2, -D - 0.35, W + 0.35, H, -D); BX(c, -W - 0.35, H - 0.2, D, W + 0.35, H, D + 0.35); }
  // roof (explorers leaves a skylight hole at the ridge for its lantern)
  const ov = 0.9, ye = H - ov * tp, t = 0.35, zr = 0;
  paint(c, S.roof, S.rt);
  if (k === "explorers") { const hx = 3, hz = 2.5, yh = RH - hz * tp;
    for (const [a, b] of [[-W - ov, -hx], [hx, W + ov]]) ROOF(c, a, b, -D - ov, D + ov, ye, RH, t);
    SLAB(c, -hx, hx, -D - ov, ye, -hz, yh, t); SLAB(c, -hx, hx, hz, yh, D + ov, ye, t); }
  else ROOF(c, -W - ov, W + ov, -D - ov, D + ov, ye, RH, t);
  ROOFZ(c, -px - 0.7, px + 0.7, -D - 1.2, -D + 6.5, H - 0.7, pr + 0.1, t);
  paint(c, IR, IRONC); if (mid) BX(c, -W - ov, RH + t, -0.08, W + ov, RH + t + 0.3, 0.08);
  // timber ceiling under the roof
  if (inner) { paint(c, OAK, WOOD); if (k === "explorers") { const hx = 3, hz = 2.5, yh = RH - hz * tp - 0.4;
      for (const [a, b] of [[-W + T, -hx], [hx, W - T]]) { SLAB(c, a, b, -D + T, H - 0.4 + (T) * tp, 0, RH - 0.4, 0.08); SLAB(c, a, b, 0, RH - 0.4, D - T, H - 0.4 + T * tp, 0.08); }
      SLAB(c, -hx, hx, -D + T, H - 0.4 + T * tp, -hz, yh, 0.08); SLAB(c, -hx, hx, hz, yh, D - T, H - 0.4 + T * tp, 0.08); }
    else { SLAB(c, -W + T, W - T, -D + T, H - 0.4 + T * tp, 0, RH - 0.4, 0.08); SLAB(c, -W + T, W - T, 0, RH - 0.4, D - T, H - 0.4 + T * tp, 0.08); }
    for (const x of [-10, -5, 0, 5, 10]) { BX(c, x - 0.22, H - 0.5, -D + T, x + 0.22, H - 0.1, D - T); SEG(c, [x, H - 0.3, -D + 2], [x, RH - 0.6, 0], 0.2, 0.2); SEG(c, [x, H - 0.3, D - 2], [x, RH - 0.6, 0], 0.2, 0.2); } }
  // windows: lancets on the long walls, a big one in the pediment
  const wc = k === "mages" ? "oklch(0.6 0.12 300)" : "oklch(0.72 0.1 70)";
  if (mid) { for (const x of [-12.5, -7.5, 7.5, 12.5]) { LANCETZ(c, x, -D + T / 2, -1, 2.0, 2.6, 1.1, S.glass, wc); LANCETZ(c, x, -D + T / 2, -1, 6.6, 1.8, 1.1, S.glass, wc); LANCETZ(c, x, D - T / 2, 1, 6.6, 1.8, 1.1, S.glass, wc); }
    for (const z of [-5, 0, 5]) for (const s of [-1, 1]) if (!(k === "mages" && s > 0 && z === 5)) LANCETX(c, s * (W - T / 2), z + 2.5 * (z === 5 ? -1 : 1) * 0 + (z === 0 ? 2.5 : 0), s, 6.6, 1.8, 1.0, S.glass, wc);
    LANCETZ(c, 0, -D + T / 2, -1, H + 0.6, 2.2, 1.6, S.glass, wc); }
  // the door: a stone arch surround, open oak leaves swung in, a lamp each side
  paint(c, k === "explorers" ? FS : S.wall, "oklch(0.86 0.02 80)");
  for (const s of [-1, 1]) BX(c, s * dw, F, -D - 0.35, s * (dw + 0.6), dh, -D + 0.02);
  if (mid) for (let i = 0; i <= 6; i++) { const a = Math.PI * i / 6, r = dw + 0.3; RB(c, -Math.cos(a) * r, dh + Math.sin(a) * r * 0.7, -D - 0.17, 0.62, 0.6, 0.36, 0, 0, -(90 - i * 30) * 0.9); }
  else BX(c, -dw - 0.6, dh, -D - 0.35, dw + 0.6, dh + 1.1, -D + 0.02);
  if (mid) { paint(c, OAK, "oklch(0.62 0.12 30)"); for (const s of [-1, 1]) RB(c, s * (dw - 0.06), F + 2, -D + T + 0.62, 0.1, 4, 1.24, s * 90 + s * 0); }
  if (mid) for (const s of [-1, 1]) { paint(c, IR, IRONC); BX(c, s * 2.45 - 0.05, 3.0, -D - 0.5, s * 2.45 + 0.05, 3.1, -D); glow(c, "oklch(0.88 0.1 75)", WARM.map((v) => v * 1.6)); BX(c, s * 2.45 - 0.14, 2.45, -D - 0.62, s * 2.45 + 0.14, 2.95, -D - 0.36); c.emissive(null); }
  // the name board: carved oak, gold frame (letters are the sign row's vector)
  paint(c, OAK, "oklch(0.55 0.06 50)"); BX(c, -5.9, 5.85, -D - 0.25, 5.9, 7.45, -D); flatc(c, "oklch(0.78 0.13 80)");
  BX(c, -6.05, 5.7, -D - 0.3, 6.05, 5.85, -D); BX(c, -6.05, 7.45, -D - 0.3, 6.05, 7.6, -D); for (const s of [-1, 1]) BX(c, s * 5.9, 5.7, -D - 0.3, s * 6.05, 7.6, -D);
  // banners each side of the door
  const emb = k === "fighters" ? "swords" : k === "mages" ? "star" : "compass";
  if (mid) for (const s of [-1, 1]) BANNER(c, s * 10, 8.9, -D - 0.45, -1, S.cloth, emb, 1.6, 5.2);
  // chimney through the back slope over the hearth
  paint(c, k === "explorers" ? FS : S.wall, "oklch(0.85 0.02 80)"); BX(c, -8, F, D - T - 1.0, -4, 3.6, D - T); BX(c, -7.2, 3.6, D - T - 0.8, -4.8, RH + 0.5, D - 0.1);
  if (inner) { glow(c, "oklch(0.15 0.02 40)", [0, 0, 0]); c.emissive(null); flatc(c, "oklch(0.12 0.01 40)"); BX(c, -7.2, F + 0.05, D - T - 1.05, -4.8, 2.0, D - T - 0.95);
    glow(c, "oklch(0.8 0.15 55)", FIRE); for (let i = 0; i < 4; i++) RB(c, -6 + (i - 1.5) * 0.4, F + 0.35, D - T - 0.6, 0.18, 0.6 - (i % 2) * 0.2, 0.18, i * 20, 0, 10 - i * 7); c.emissive(null);
    paint(c, IR, IRONC); for (const x of [-6.7, -5.3]) SEG(c, [x, F, D - T - 0.9], [x, F + 0.3, D - T - 0.5], 0.06); }
  if (!inner) return { H, RH, tp };
  // columns carrying the gallery and the roof ties
  const colT = k === "explorers" ? OAK : S.wall;
  for (const x of [-9, -3, 3, 9]) for (const z of [-4, 4]) { if (Math.abs(x) === 3 && z === -4) continue;
    if (k === "explorers") { paint(c, OAK, WOOD); BX(c, x - 0.3, F, z - 0.3, x + 0.3, H - 0.5, z + 0.3); paint(c, COPPER, "oklch(0.9 0.03 170)"); BX(c, x - 0.38, F, z - 0.38, x + 0.38, F + 0.5, z + 0.38); }
    else { paint(c, colT, "oklch(0.92 0.02 80)"); LA(c, x, F, z, [[0.6, 0], [0.6, 0.4], [0.42, 0.55], [0.38, 1], [0.34, H - 1.8], [0.45, H - 1.4], [0.6, H - 1.1], [0.6, H - 0.5]], lod <= 1 ? 14 : 8, true); } }
  // gallery: west and back full, east from z 0 (the stair arrives there)
  paint(c, OAK, WOOD); const gx = 9.6, gz = 4.6;
  BX(c, -W + T, GY - 0.3, -D + T, -gx, GY, D - T); BX(c, -gx, GY - 0.3, gz, gx, GY, D - T); BX(c, gx, GY - 0.3, -0.4, W - T, GY, D - T);
  flatc(c, "oklch(0.78 0.13 80)"); BX(c, -gx - 0.05, GY - 0.45, -D + T, -gx + 0.05, GY - 0.3, gz); BX(c, -gx, GY - 0.45, gz - 0.05, gx, GY - 0.3, gz + 0.05);
  paint(c, OAK, "oklch(0.7 0.06 40)"); const rail = (a, b) => { SEG(c, [a[0], GY + 1.0, a[1]], [b[0], GY + 1.0, b[1]], 0.12, 0.1); const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(2, Math.round(L / 0.6));
    if (lod <= 1) for (let i = 0; i <= n; i++) { const t = i / n; SEG(c, [a[0] + (b[0] - a[0]) * t, GY, a[1] + (b[1] - a[1]) * t], [a[0] + (b[0] - a[0]) * t, GY + 1.0, a[1] + (b[1] - a[1]) * t], 0.06, 0.06); } };
  rail([-gx, -D + T], [-gx, gz]); rail([-gx, gz], [gx, gz]); rail([gx, gz], [gx, -0.4]); rail([gx, -0.4], [W - T - 1.9, -0.4]);
  // the stair up the east wall: 29 risers from z -8.4 to -0.4
  paint(c, OAK, WOOD); const N = 29, rise = (GY - F) / N, run = 8 / N, sx0 = W - T - 1.8, sx1 = W - T;
  for (let i = 0; i < N; i++) BX(c, sx0, F, -8.4 + i * run, sx1, F + rise * (i + 1), -8.4 + (i + 1) * run);
  rail([sx0, -8.4], [sx0, -0.4].map((v, j) => v)); // newel rail at walking height of gallery (approximate)
  return { H, RH, tp };
}
// ---------------- per-guild interiors and silhouettes ----------------
const K = {
  fighters(c, p, lod) { const S = STY.fighters, { H, RH } = hall(c, p, "fighters", lod), mid = lod <= 3, inner = lod <= 2;
    // two front corner towers with lead cones and gold finials
    for (const s of [-1, 1]) { const x = s * (W + 0.6), z = -D - 0.6, R = 2.6, th = H + 5, n = lod <= 2 ? 12 : 8;
      paint(c, ASH, S.wt); LA(c, x, F - 0.7, z, [[R + 0.3, 0], [R + 0.3, 1.6], [R, 2], [R, th + 0.7]], n, true, "y", false);
      flatc(c, S.trim); LA(c, x, th + 0.7, z, [[R, 0], [R + 0.45, 0.4], [R + 0.45, 1.1], [R, 1.1]], n, false, "y", false);
      if (mid) { for (let i = 0; i < 3; i++) { const a = (s < 0 ? 0.25 : 0.75) * Math.PI * 2 * 0 + (i - 1) * 0.6 - Math.PI / 2, wx = x + Math.cos(a) * (R + 0.02), wz = z + Math.sin(a) * (R + 0.02);
        glow(c, "oklch(0.72 0.1 70)", WARM); RB(c, wx, th - 2.2, wz, 0.55, 1.4, 0.12, -a * 180 / Math.PI + 90); c.emissive(null); } }
      TOWERROOF(c, x, th + 1.8, z, R, 7.4, n, lod, { roof: (c) => paint(c, LEAD, S.rt), trim: (c) => flatc(c, S.trim), gold: (c) => flatc(c, "oklch(0.8 0.14 82)") });
      if (mid) { paint(c, CLOTH, S.cloth); HX(c, [[x, th + 9.9, z - 0.02], [x + s * 1.6, th + 9.6, z - 0.02], [x + s * 1.6, th + 9.6, z + 0.02], [x, th + 9.9, z + 0.02], [x, th + 10.6, z - 0.02], [x + s * 1.6, th + 10.2, z - 0.02], [x + s * 1.6, th + 10.2, z + 0.02], [x, th + 10.6, z + 0.02]]); } }
    if (!inner) return;
    // the training ring: raked sand in a low timber fence
    paint(c, SAND, "oklch(0.9 0.04 80)"); LA(c, 0, F, 0.5, [[4.6, 0], [4.6, 0.06], [0.001, 0.06]], 24, false, "y", false);
    paint(c, OAK, WOOD); for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; if (Math.abs(a - Math.PI * 1.5) < 0.3) continue; SEG(c, [Math.cos(a) * 4.8, F, 0.5 + Math.sin(a) * 4.8], [Math.cos(a) * 4.8, F + 1.0, 0.5 + Math.sin(a) * 4.8], 0.14, 0.14); }
    flatc(c, "oklch(0.65 0.06 70)"); TORUS(c, 0, F + 0.85, 0.5, 4.8, 0.04, 32, 4); TORUS(c, 0, F + 0.5, 0.5, 4.8, 0.04, 32, 4);
    // training dummies
    for (const [x, z] of [[-1.6, 1.4], [1.8, -0.4]]) { paint(c, OAK, WOOD); SEG(c, [x, F, z], [x, F + 1.9, z], 0.12); SEG(c, [x - 0.6, F + 1.4, z], [x + 0.6, F + 1.4, z], 0.1);
      paint(c, "cdn/texture-hay-bale-straw.png", "oklch(0.9 0.05 85)"); LA(c, x, F + 0.9, z, [[0.24, 0], [0.32, 0.3], [0.3, 0.75], [0.001, 0.8]], 8, true); LA(c, x, F + 1.7, z, [[0.001, 0], [0.18, 0.08], [0.18, 0.3], [0.001, 0.4]], 8, true); }
    // weapon racks on the west wall: swords, spears, shields
    for (const z of [-6.5, -2.5, 1.5]) { const x = -W + T; paint(c, OAK, WOOD); BX(c, x, F, z - 1.4, x + 0.5, F + 0.2, z + 1.4); BX(c, x, F + 1.5, z - 1.4, x + 0.35, F + 1.65, z + 1.4); for (const zz of [z - 1.4, z + 1.4]) BX(c, x, F, zz - 0.06, x + 0.5, F + 1.9, zz + 0.06);
      for (let i = 0; i < 6; i++) { const zz = z - 1.1 + i * 0.44; flatc(c, "oklch(0.85 0.01 250)"); BX(c, x + 0.2, F + 0.2, zz - 0.03, x + 0.26, F + (i % 2 ? 1.5 : 1.95), zz + 0.03); flatc(c, "oklch(0.75 0.12 80)"); BX(c, x + 0.15, F + 1.62, zz - 0.15, x + 0.31, F + 1.68, zz + 0.15); } }
    for (const z of [-7, -3, 1, 5]) { const x = W - T - 2.0 - 0.1; if (z < 0) continue; paint(c, OAK, "oklch(0.6 0.12 30)"); LA(c, x + 1.9, 1.8, z, [[0.55, 0], [0.55, 0.06], [0.001, 0.1]], 12, true, "x"); }
    for (const z of [-6, 6]) BRAZIER(c, z < 0 ? -6 : 6, z < 0 ? -1 : 0.5, lod);
    BRAZIER(c, -6, 6, lod); BRAZIER(c, 6, -5.5, lod);
    // inside banners over the gallery, crossed swords
    for (const x of [-6, 0, 6]) BANNER(c, x, H - 0.8, D - T - 0.15, -1, S.cloth, "swords", 1.4, 3.6);
    // a long table and benches on the gallery for the chapter
    paint(c, OAK, WOOD); BX(c, -4, GY, 7, 4, GY + 0.8, 8); for (const z of [6.3, 8.6]) BX(c, -4, GY, z - 0.2, 4, GY + 0.45, z + 0.2);
  },
  mages(c, p, lod) { const S = STY.mages, { H, RH } = hall(c, p, "mages", lod), mid = lod <= 3, inner = lod <= 2;
    // the slender tower on the rear east corner: octagonal, 34 m shaft, needle roof to 40, orb floating at 41.5
    const tx = W - 1.5, tz = D - 1.5, R = 3.4, TH = 34, n = 8, rot = Math.PI / 8;
    const la = (y0, prof, nn = n) => { const P = (i, kk) => { const a = (kk % nn) / nn * Math.PI * 2 + rot; return [tx + prof[i][0] * Math.cos(a), y0 + prof[i][1], tz + prof[i][0] * Math.sin(a)]; };
      for (let i = 0; i < prof.length - 1; i++) for (let kk = 0; kk < nn; kk++) c.quad(...P(i, kk + 1), ...P(i, kk), ...P(i + 1, kk), ...P(i + 1, kk + 1)); };
    paint(c, ASH, S.wt); la(-0.7, [[R + 0.5, 0], [R + 0.5, 2.0], [R, 2.4], [R, TH], [R + 0.6, TH + 0.4], [R + 0.6, TH + 1.4], [0.01, TH + 1.4]]);
    flatc(c, S.band); la(H + 3, [[R + 0.05, 0], [R + 0.05, 0.4]]); la(TH - 6, [[R + 0.05, 0], [R + 0.05, 0.4]]);
    if (mid) { for (const [y, a] of [[H + 5, 3], [H + 5, 5], [H + 11, 4], [H + 11, 6], [TH - 4, 3], [TH - 4, 5], [TH - 4, 7], [TH - 4, 1]]) { const ang = a / 8 * Math.PI * 2 + rot + Math.PI / 8, x = tx + (R * 0.93) * Math.cos(ang), z = tz + (R * 0.93) * Math.sin(ang);
        glow(c, "oklch(0.6 0.12 300)", VIO); RB(c, x + Math.cos(ang) * 0.08, y, z + Math.sin(ang) * 0.08, 0.7, 2.2, 0.15, -ang * 180 / Math.PI + 90); c.emissive(null); }
      flatc(c, "oklch(0.88 0.02 80)"); for (let kk = 0; kk < 8; kk++) { const a = kk / 8 * Math.PI * 2 + rot + Math.PI / 8; BX(c, tx + (R + 0.3) * Math.cos(a) - 0.3, TH + 1.4, tz + (R + 0.3) * Math.sin(a) - 0.3, tx + (R + 0.3) * Math.cos(a) + 0.3, TH + 2.2, tz + (R + 0.3) * Math.sin(a) + 0.3); } }
    paint(c, VSL, S.rt); la(TH + 1.6, [[R + 0.7, 0], [R * 0.6, 1.6], [R * 0.3, 4.5], [0.03, 6.6]]);
    flatc(c, "oklch(0.8 0.14 82)"); LA(c, tx, TH + 8.0, tz, [[0.05, 0], [0.12, 0.2], [0.04, 0.4], [0.03, 1.4]], 6, true);
    glow(c, "oklch(0.85 0.12 300)", [2.2, 1.2, 4.2]); LA(c, tx, TH + 9.8, tz, [[0.001, 0], [0.5, 0.15], [0.85, 0.5], [0.95, 1.0], [0.85, 1.5], [0.5, 1.85], [0.001, 2.0]], lod <= 2 ? 16 : 8, true); c.emissive(null);
    if (mid) { flatc(c, "oklch(0.8 0.14 82)"); TORUS(c, tx, TH + 10.8, tz, 1.35, 0.05, 24, 4, "y"); TORUS(c, tx, TH + 10.8, tz, 1.35, 0.05, 24, 4, "x"); }
    // a rose window in each gable
    if (mid) for (const s of [-1, 1]) roseX(c, s * (W + 0.02), H + 3.2, s, 1.5, "oklch(0.6 0.12 300)", VIO, "oklch(0.86 0.02 80)", TORUS);
    if (!inner) return;
    // library shelves on the walls, ground and gallery
    const books = ["oklch(0.45 0.12 27)", "oklch(0.4 0.08 260)", "oklch(0.45 0.09 150)", "oklch(0.55 0.1 70)", "oklch(0.35 0.06 300)", "oklch(0.5 0.05 40)"];
    const shelf = (x0, x1, z, sz, y0, h) => { paint(c, OAK, WOOD); BX(c, x0, y0, Math.min(z, z + sz * 0.45), x1, y0 + h, Math.max(z, z + sz * 0.45));
      const rows = Math.floor(h / 0.55); if (lod > 1) return;
      for (let r = 0; r < rows; r++) { const y = y0 + 0.1 + r * 0.55; let x = x0 + 0.08, i = r * 3 + Math.round(x0 * 7);
        while (x < x1 - 0.1) { const bw = 0.06 + ((i * 37) % 7) * 0.012, bh = 0.32 + ((i * 13) % 5) * 0.03; flatc(c, books[i % books.length]);
          BX(c, x, y, Math.min(z + sz * 0.46, z + sz * 0.5), x + bw, y + bh, Math.max(z + sz * 0.46, z + sz * 0.5)); x += bw + 0.01; i++; } } };
    for (const [a, b] of [[-W + T + 0.2, -9.8], [-1.5, 4], [-6.5, -2.6]]) shelf(a, b, D - T, -1, F, 3.6);
    for (const [a, b] of [[-W + T + 0.2, -10], [-9, -2], [2, 9]]) shelf(a, b, D - T, -1, GY, 3.2);
    for (const z0 of [-8.4, -3.5]) { paint(c, OAK, WOOD); BX(c, -W + T, F, z0, -W + T + 0.45, F + 3.6, z0 + 3.5); }
    // reading desks
    for (const x of [-6, 6]) { paint(c, OAK, WOOD); BX(c, x - 1.5, F + 0.75, -6.4, x + 1.5, F + 0.85, -5.4); for (const sx of [-1.35, 1.35]) BX(c, x + sx - 0.07, F, -6.3, x + sx + 0.07, F + 0.75, -5.5);
      flatc(c, "oklch(0.9 0.03 85)"); RB(c, x, F + 0.88, -5.9, 0.6, 0.03, 0.4, 15); glow(c, "oklch(0.85 0.1 75)", WARM); LA(c, x + 1.1, F + 0.85, -5.9, [[0.08, 0], [0.08, 0.25], [0.001, 0.3]], 6, true); c.emissive(null); }
    // the enchanting table: a stone altar, a glowing rune ring, a floating crystal
    paint(c, ASH, "oklch(0.8 0.02 280)"); LA(c, 0, F, 0, [[1.3, 0], [1.3, 0.2], [0.8, 0.35], [0.7, 0.85], [1.4, 0.95], [1.4, 1.1], [0.001, 1.1]], 12, true);
    glow(c, "oklch(0.8 0.13 300)", VIO); TORUS(c, 0, F + 1.12, 0, 1.0, 0.04, 24, 4); TORUS(c, 0, F + 0.04, 0, 2.4, 0.06, 32, 4);
    for (let kk = 0; kk < 8; kk++) { const a = kk / 8 * Math.PI * 2; RB(c, Math.cos(a) * 2.4, F + 0.06, Math.sin(a) * 2.4, 0.35, 0.03, 0.12, -a * 180 / Math.PI); }
    glow(c, "oklch(0.88 0.12 300)", [2, 1, 3.8]); LA(c, 0, F + 1.7, 0, [[0.001, 0], [0.28, 0.45], [0.001, 1.1]], 6, true); c.emissive(null);
    for (const [x, z] of [[-3.5, 2.5], [3.5, 2.5], [-3.5, -2.5], [3.5, -2.5]]) { paint(c, IR, IRONC); SEG(c, [x, F, z], [x, F + 1.6, z], 0.08); glow(c, "oklch(0.75 0.12 300)", VIO); LA(c, x, F + 1.6, z, [[0.001, 0], [0.18, 0.18], [0.001, 0.36]], 8, true); c.emissive(null); }
    for (const x of [-6, 0, 6]) BANNER(c, x, H - 0.8, D - T - 0.6, -1, S.cloth, "star", 1.4, 3.4);
  },
  explorers(c, p, lod) { const S = STY.explorers, { H, RH, tp } = hall(c, p, "explorers", lod), mid = lod <= 3, inner = lod <= 2;
    // the copper lantern over the skylight
    const hx = 3, hz = 2.5, yh = RH - hz * tp;
    paint(c, TARP, S.trim); for (const x of [-hx, hx]) for (const z of [-hz, hz]) BX(c, x - 0.15, yh, z - 0.15, x + 0.15, RH + 2.4, z + 0.15);
    c.albedo(null); c.color("oklch(0.7 0.05 220)", 0.55); c.emissive(0.2, 0.3, 0.4); for (const z of [-hz, hz]) BX(c, -hx, yh + 0.3, z - 0.03, hx, RH + 2.4, z + 0.03); for (const x of [-hx, hx]) BX(c, x - 0.03, yh + 0.3, -hz, x + 0.03, RH + 2.4, hz); c.emissive(null);
    paint(c, COPPER, "oklch(0.9 0.03 170)"); ROOF(c, -hx - 0.5, hx + 0.5, -hz - 0.5, hz + 0.5, RH + 2.3, RH + 4.3, 0.15); LA(c, 0, RH + 4.3, 0, [[0.06, 0], [0.06, 1.5], [0.001, 1.6]], 6, true);
    if (mid) { flatc(c, "oklch(0.8 0.12 75)"); for (let kk = 0; kk < 4; kk++) RB(c, 0, RH + 5.4, 0, kk % 2 ? 0.05 : 1.0, 0.05, kk % 2 ? 1.0 : 0.05, kk * 45); }
    // a crane arm with a crate on the west gable, river-trade style
    if (mid) { paint(c, TARP, S.trim); SEG(c, [-W - 0.2, H + 3, -2], [-W - 3.5, H + 3, -2], 0.3, 0.3); SEG(c, [-W - 0.2, H + 0.5, -2], [-W - 2.6, H + 3, -2], 0.22, 0.22);
      flatc(c, "oklch(0.6 0.04 70)"); SEG(c, [-W - 3.3, H + 3, -2], [-W - 3.3, H - 1.5, -2], 0.04, 0.04); paint(c, OAK, WOOD); BX(c, -W - 3.9, H - 2.6, -2.6, -W - 2.7, H - 1.5, -1.4); }
    if (!inner) return;
    // map tables
    for (const [x, z, a] of [[-6, -4.5, 0], [6, -5, 10], [-6, 2.5, -8]]) { paint(c, OAK, WOOD); RB(c, x, F + 0.85, z, 3.2, 0.12, 1.8, a); for (const sx of [-1.4, 1.4]) for (const sz of [-0.7, 0.7]) { const r = a * Math.PI / 180; RB(c, x + sx * Math.cos(r) + sz * Math.sin(r), F + 0.4, z - sx * Math.sin(r) + sz * Math.cos(r), 0.12, 0.8, 0.12, a); }
      paint(c, MAP, "oklch(0.95 0.04 85)"); RB(c, x, F + 0.93, z, 2.8, 0.02, 1.5, a + 3); flatc(c, "oklch(0.75 0.13 80)"); LA(c, x + 1.0, F + 0.92, z + 0.3, [[0.05, 0], [0.05, 0.25], [0.001, 0.3]], 6, true);
      glow(c, "oklch(0.85 0.1 75)", WARM); LA(c, x - 1.2, F + 0.92, z - 0.4, [[0.09, 0], [0.09, 0.28], [0.001, 0.34]], 6, true); c.emissive(null); }
    // the big globe on a brass stand
    const gx = 4.5, gz = 2.5; paint(c, OAK, WOOD); for (let kk = 0; kk < 3; kk++) { const a = kk / 3 * Math.PI * 2; SEG(c, [gx + Math.cos(a) * 1.0, F, gz + Math.sin(a) * 1.0], [gx + Math.cos(a) * 0.3, F + 1.1, gz + Math.sin(a) * 0.3], 0.12); }
    flatc(c, "oklch(0.75 0.12 80)"); TORUS(c, gx, F + 2.4, gz, 1.45, 0.05, 32, 4, "z"); TORUS(c, gx, F + 2.4, gz, 1.5, 0.06, 32, 4, "y");
    paint(c, MAP, "oklch(0.8 0.08 200)"); LA(c, gx, F + 1.0, gz, [[0.001, 0], [0.7, 0.2], [1.1, 0.6], [1.3, 1.0], [1.35, 1.4], [1.3, 1.8], [1.1, 2.2], [0.7, 2.6], [0.001, 2.8]], 20, true);
    // expedition crates, barrels, rope coils, a canvas pile
    paint(c, OAK, WOOD); for (const [x, z, s, y] of [[-12, -7.5, 1.1, 0], [-10.7, -7.6, 0.9, 0], [-11.8, -7.4, 0.8, 1.1], [11, 7, 1.2, 0], [9.6, 7.3, 1.0, 0], [-12.2, 7.3, 1.0, 0]]) { BX(c, x - s / 2, F + y, z - s / 2, x + s / 2, F + y + s, z + s / 2);
      paint(c, IR, IRONC); BX(c, x - s / 2 - 0.01, F + y + s * 0.15, z - s / 2 - 0.01, x + s / 2 + 0.01, F + y + s * 0.22, z + s / 2 + 0.01); paint(c, OAK, WOOD); }
    flatc(c, "oklch(0.7 0.06 75)"); TORUS(c, -9.3, F + 0.12, -7.3, 0.4, 0.1, 12, 4); TORUS(c, -9.3, F + 0.32, -7.3, 0.36, 0.1, 12, 4);
    // the airship model hung from the ridge: envelope, gondola, fins, a propeller
    const ay = H + 0.8, ax0 = -4.5; paint(c, "cdn/texture-canvas-weathered.png", "oklch(0.92 0.04 80)");
    LA(c, ax0, ay, 0, [[0.001, -3.2], [0.55, -2.8], [0.95, -1.8], [1.1, -0.5], [1.1, 0.8], [0.95, 2], [0.55, 2.8], [0.001, 3.3]].map(([r, h]) => [r, h]), 14, true, "x");
    flatc(c, "oklch(0.55 0.13 27)"); TORUS(c, ax0, ay, 0, 1.12, 0.04, 20, 4, "x"); paint(c, OAK, WOOD); BX(c, ax0 - 1.1, ay - 1.75, -0.35, ax0 + 1.1, ay - 1.25, 0.35);
    flatc(c, "oklch(0.6 0.04 70)"); for (const x of [-0.9, 0.9]) for (const z of [-0.3, 0.3]) SEG(c, [ax0 + x, ay - 1.25, z], [ax0 + x * 0.8, ay - 0.95, z * 2.5], 0.02, 0.02);
    for (const [y, z] of [[0, 0.9], [0, -0.9], [0.9, 0], [-0.9, 0]]) { flatc(c, "oklch(0.55 0.09 195)"); RB(c, ax0 + 2.7, ay + y * 0.8, z * 0.8, 0.8, Math.abs(y) > 0 ? 0.6 : 0.04, Math.abs(z) > 0 ? 0.6 : 0.04); }
    flatc(c, "oklch(0.75 0.12 80)"); RB(c, ax0 + 1.25, ay - 1.5, 0, 0.04, 0.9, 0.12, 0, 0, 0); RB(c, ax0 + 1.25, ay - 1.5, 0, 0.04, 0.12, 0.9, 0, 0, 0);
    flatc(c, "oklch(0.6 0.04 70)"); for (const x of [-2, 2]) SEG(c, [ax0 + x, ay + 1.0, 0], [ax0 + x * 0.6, RH - 0.6, 0], 0.025, 0.025);
    // hearth corner seating, a wall map, two banners inside
    paint(c, MAP, "oklch(0.95 0.04 85)"); BX(c, 2, 2.2, D - T - 0.05, 9, 4.6, D - T); paint(c, OAK, WOOD); for (const s of [0, 1]) BX(c, 2 - 0.1 + s * 7.1, 2.1, D - T - 0.08, 2.1 + s * 7.1, 4.7, D - T);
    for (const x of [-10, 10]) BANNER(c, x, H - 0.8, D - T - 0.15, -1, S.cloth, "compass", 1.4, 3.4);
  },
  street(c, p, lod) { const w = p.w ?? 140, d = p.d ?? 26; paint(c, FLAG, "oklch(0.9 0.02 80)"); BX(c, -w / 2, -0.4, -d / 2, w / 2, 0.06, d / 2);
    paint(c, ASH, "oklch(0.6 0.025 70)"); if (lod <= 3) for (const s of [-1, 1]) BX(c, -w / 2, -0.4, s * d / 2 - 0.35, w / 2, 0.16, s * d / 2 + 0.35);
    if (lod <= 3) { paint(c, FS, "oklch(0.7 0.02 60)"); for (let x = -w / 2 + 6; x < w / 2; x += 6) BX(c, x - 0.15, -0.4, -d / 2 + 0.4, x + 0.15, 0.075, d / 2 - 0.4); } },
  statue(c, p, lod) { const n = lod <= 2 ? 24 : 12; paint(c, ASH, "oklch(0.9 0.02 80)");
    LA(c, 0, 0, 0, [[4.4, 0], [4.4, 0.75], [4.0, 0.75], [4.0, 0.25]], n, false, "y", false); LA(c, 0, 0.7, 0, [[4.55, 0], [4.55, 0.12], [3.9, 0.12], [3.9, 0]], n, false, "y", false);
    c.albedo(null); c.color("oklch(0.45 0.07 220)"); c.emissive(0.02, 0.05, 0.09); LA(c, 0, 0.55, 0, [[4.0, 0], [0.001, 0]], n, false, "y", false); c.emissive(null);
    paint(c, ASH, "oklch(0.88 0.02 80)"); BX(c, -1.1, 0, -1.1, 1.1, 3.2, 1.1); BX(c, -1.35, 0, -1.35, 1.35, 0.9, 1.35); BX(c, -1.3, 3.2, -1.3, 1.3, 3.5, 1.3);
    flatc(c, "oklch(0.78 0.13 80)"); BX(c, -1.13, 2.6, -1.13, 1.13, 2.8, 1.13);
    // a bronze champion: legs, mailed body, cloak, raised sword, shield
    const B = "oklch(0.55 0.07 160)"; flatc(c, B); const y0 = 3.5;
    for (const s of [-1, 1]) PIPE(c, [s * 0.22, y0, s * 0.1], [s * 0.18, y0 + 1.0, 0], 0.15, 0.13, 8);
    LA(c, 0, y0 + 0.95, 0, [[0.38, 0], [0.42, 0.3], [0.45, 0.75], [0.48, 1.0], [0.25, 1.12], [0.001, 1.12]], 10, true);
    LA(c, 0, y0 + 2.1, 0, [[0.001, 0], [0.13, 0.03], [0.16, 0.15], [0.15, 0.3], [0.001, 0.38]], 10, true);
    HX(c, [[-0.45, y0 + 0.4, 0.3], [0.45, y0 + 0.4, 0.3], [0.45, y0 + 0.4, 0.45], [-0.45, y0 + 0.4, 0.45], [-0.4, y0 + 2.0, 0.2], [0.4, y0 + 2.0, 0.2], [0.4, y0 + 2.0, 0.3], [-0.4, y0 + 2.0, 0.3]]);
    PIPE(c, [0.45, y0 + 1.95, 0], [0.62, y0 + 2.7, -0.05], 0.1, 0.08, 6); PIPE(c, [-0.45, y0 + 1.95, 0], [-0.55, y0 + 1.4, -0.3], 0.1, 0.08, 6);
    flatc(c, "oklch(0.75 0.09 85)"); RB(c, 0.66, y0 + 3.6, -0.08, 0.1, 1.9, 0.03); RB(c, 0.65, y0 + 2.72, -0.07, 0.5, 0.08, 0.1);
    flatc(c, B); LA(c, -0.6, y0 + 1.3, -0.45, [[0.6, 0], [0.62, 0.06], [0.001, 0.14]], 12, true, "z");
    if (lod <= 2) { glow(c, "oklch(0.88 0.1 75)", WARM); for (let k = 0; k < 4; k++) { const a = k / 4 * Math.PI * 2 + Math.PI / 4; BX(c, Math.cos(a) * 4.2 - 0.12, 0.82, Math.sin(a) * 4.2 - 0.12, Math.cos(a) * 4.2 + 0.12, 1.1, Math.sin(a) * 4.2 + 0.12); } c.emissive(null); } },
  lamp(c, p, lod) { lampPost(c, { paint, flatc, glow, BX, LA, SEG }, "guildhall", { lod }); },
};
export function geometry(c) { const p = c.params ?? {}, hallKind = !['street', 'statue', 'lamp'].includes(p.kind); (K[p.kind] ?? K.fighters)(c, p, hallKind ? Math.max(3, c.lod ?? 1) : (c.lod ?? 1)); c.albedo(null); c.color(null); c.emissive(null); }
export function collider(c) { const p = c.params ?? {}, k = p.kind ?? "fighters", L = [];
  const b = (x0, y0, z0, x1, y1, z1) => L.push({ kind: "box", width: Math.abs(x1 - x0), height: Math.abs(y1 - y0), depth: Math.abs(z1 - z0), center: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2] });
  if (k === "street") { b(-(p.w ?? 140) / 2, -0.4, -(p.d ?? 26) / 2, (p.w ?? 140) / 2, 0.06, (p.d ?? 26) / 2); return L; }
  if (k === "statue") { b(-4.4, 0, -4.4, 4.4, 0.8, 4.4); b(-1.35, 0, -1.35, 1.35, 3.5, 1.35); return L; }
  if (k === "lamp") { b(-0.3, 0, -0.3, 0.3, 4.2, 0.3); return L; }
  const H = STY[k].H, dw = 1.25;
  b(-W - 0.4, -0.7, -D - 0.4, W + 0.4, F, D + 0.4); b(-3.2, -0.7, -D - 1.3, 3.2, 0.0, -D - 0.4); b(-2.9, -0.7, -D - 0.85, 2.9, F - 0.15, -D - 0.4);
  b(-W, F, -D, -dw, H, -D + T); b(dw, F, -D, W, H, -D + T); b(-dw, F, -D, dw, H, -D + T);   // the doorway is shut: the hall's room is its own place
  b(-W, F, -D, W, H, D); b(-W, H, -D, W, H + 1, D);
  if (k === 'mages') b(W - 1.5 - 3.9, -0.7, D - 1.5 - 3.9, W - 1.5 + 3.9, 36, D - 1.5 + 3.9);
  if (k === 'fighters') for (const s of [-1, 1]) b(s * (W + 0.6) - 2.9, -0.7, -D - 3.5, s * (W + 0.6) + 2.9, H + 6, -D + 2.0);
  return L;
  b(-W, F, D - T, W, H, D); b(-W, F, -D + T, -W + T, H, D - T); b(W - T, F, -D + T, W, H, D - T);
  b(-W, H, -D, W, H + 1, D);
  for (const x of [-9, -3, 3, 9]) for (const z of [-4, 4]) { if (Math.abs(x) === 3 && z === -4) continue; b(x - 0.45, F, z - 0.45, x + 0.45, H - 0.5, z + 0.45); }
  const gx = 9.6, gz = 4.6; b(-W + T, GY - 0.3, -D + T, -gx, GY, D - T); b(-gx, GY - 0.3, gz, gx, GY, D - T); b(gx, GY - 0.3, -0.4, W - T, GY, D - T);
  b(-gx - 0.06, GY, -D + T, -gx + 0.06, GY + 1.05, gz); b(-gx, GY, gz - 0.06, gx, GY + 1.05, gz + 0.06); b(gx - 0.06, GY, -0.4, gx + 0.06, GY + 1.05, gz); b(gx, GY, -0.46, W - T - 1.9, GY + 1.05, -0.34);
  const N = 29, rise = (GY - F) / N, run = 8 / N; for (let i = 0; i < N; i++) b(W - T - 1.8, F, -8.4 + i * run, W - T, F + rise * (i + 1), -8.4 + (i + 1) * run);
  b(-8, F, D - T - 1.0, -4, 3.6, D - T);
  if (k === "fighters") { for (const s of [-1, 1]) b(s * (W + 0.6) - 2.9, -0.7, -D - 3.5, s * (W + 0.6) + 2.9, H + 6, -D + 2.0); for (const z of [-6.5, -2.5, 1.5]) b(-W + T, F, z - 1.45, -W + T + 0.5, F + 1.9, z + 1.45); }
  if (k === "mages") { b(W - 1.5 - 3.9, -0.7, D - 1.5 - 3.9, W - 1.5 + 3.9, 36, D - 1.5 + 3.9); b(-1.4, F, -1.4, 1.4, F + 1.1, 1.4); for (const x of [-6, 6]) b(x - 1.5, F, -6.4, x + 1.5, F + 0.85, -5.4); b(-W + T, F, D - T - 0.5, 4, F + 3.6, D - T); b(-W + T, F, -8.4, -W + T + 0.45, F + 3.6, 0); }
  if (k === "explorers") { for (const [x, z] of [[-6, -4.5], [6, -5], [-6, 2.5]]) b(x - 1.65, F, z - 1.0, x + 1.65, F + 0.92, z + 1.0); b(4.5 - 1.3, F, 2.5 - 1.3, 4.5 + 1.3, F + 3.8, 2.5 + 1.3); b(-12.7, F, -8.1, -10.2, F + 2.0, -6.9); b(9.0, F, 6.3, 11.6, F + 1.2, 7.8); b(-12.7, F, 6.8, -11.7, F + 1.0, 7.8); }
  return L; }
