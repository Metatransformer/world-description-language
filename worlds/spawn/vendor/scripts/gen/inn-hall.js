// THE DROWNED LANTERN, interior hall (place `inn`): taproom with a central fire ring, bar on the south, four trestle tables,
// an east wing of six rooms for rent off a corridor, and the Lowcellar (cask store, meeting room, old supplies, the fence's back room)
// under the taproom, down a stair along the west wall. Floor top 0.12, cellar floor -3.4. Beds are scene rows (prop.js kind bed).
// ---- Valenfeld building kit (shared verbatim by scripts/gen/*): textures, boxes, lathes, roofs ----
import BK from "../lib/data/building-kit.json";
import { candle_innHall } from "../lib/pieces/candle.js";   // shared candle piece, drawn in this building's palette
import { lantern_innHall } from "../lib/pieces/lantern.js";   // shared lantern piece, drawn in this building's palette
import { table_innHall } from "../lib/pieces/table.js";   // shared table piece, drawn in this building's palette
import { bench_innHall } from "../lib/pieces/bench.js";   // shared bench piece, drawn in this building's palette
import { BARREL, BXR, CB, CY, HX, LA, RB, ROOF, flatc, glow, paint } from "../lib/buildkit.js";   // the shared building toolkit
import { kitDef } from "../lib/kits.js";   // colour defaults: the inn-hall row in scripts/lib/data/kits.yml
const KP = () => kitDef("inn-hall").params ?? {};   // textures and tints: scripts/lib/data/building-kit.yml
const { fieldstone: FS, oak: OAK, plaster: PL, slate: SL, iron: IR, flagstone: FLAG, hay: HAY } = BK.textures;
const { stone: STONE, wood: WOOD, white: WHITE, iron: IRONC } = BK.tints;
// hexahedron: b0 b1 b2 b3 (bottom: x0z0 x1z0 x1z1 x0z1) then t0..t3 above them
const BX = BXR;
// box by centre and size, turned: roll (about z), then pitch (about x, + tips -z up), then yaw (about y), degrees
// lathe: prof [[r, h]…] swept round the y axis (or the x axis: h runs along +x), smooth sides
// gable roof, ridge along x over z mid, eaves at z0/z1 at height ye, ridge yr, slab thickness t
function MERL(c, x0, z0, x1, z1, y, th, h = 0.9, w = 0.9, gap = 0.9) {
  for (let x = x0; x + w <= x1 + 1e-6; x += w + gap) { BX(c, x, y, z0, x + w, y + h, z0 + th); BX(c, x, y, z1 - th, x + w, y + h, z1); }
  for (let z = z0 + th + gap; z + w <= z1 - th + 1e-6; z += w + gap) { BX(c, x0, y, z, x0 + th, y + h, z + w); BX(c, x1 - th, y, z, x1, y + h, z + w); } }
// ---- end kit ----
const F = 0.12, CH = 4.4, CF = -3.4, CC = -0.2;           // taproom floor top, taproom ceiling, cellar floor, cellar ceiling
const OAKD = "oklch(0.72 0.03 55)", OAKL = "oklch(0.88 0.03 65)", DRESS = "oklch(0.9 0.012 80)";
const BRASS = "oklch(0.78 0.11 80)", COPPER = "oklch(0.72 0.1 50)", PEWTER = "oklch(0.8 0.01 250)";
const ROOMS = [9.4, 12.2, 15.0];                          // rooms for rent: west x of each, 2.6 wide, doors at u 0.95..1.85
// a turned view of the context: every quad and tri passes f; flip keeps a mirror's faces outward
function XF(c, f, flip) {
  return new Proxy(c, { get(t, k) {
    if (k === "quad") return (...a) => { const p = [0, 3, 6, 9].map((i) => f(a[i], a[i + 1], a[i + 2])); t.quad(...(flip ? [p[0], p[3], p[2], p[1]] : p).flat()); };
    if (k === "tri") return (...a) => { const p = [0, 3, 6].map((i) => f(a[i], a[i + 1], a[i + 2])); t.tri(...(flip ? [p[0], p[2], p[1]] : p).flat()); };
    const v = t[k]; return typeof v === "function" ? v.bind(t) : v; } });
}
const mirrorZ = (c) => XF(c, (x, y, z) => [x, y, -z], true);
const turn90 = (c, px, pz) => XF(c, (x, y, z) => [px - (z - pz), y, pz + (x - px)], false);   // +x becomes +z about (px, pz)
// ---- small dressing, shared by every room ----
function mug(c, x, y, z) { paint(c, IR, PEWTER); LA(c, x, y, z, [[0.045, 0], [0.05, 0.12], [0.053, 0.13]], 8, true); RB(c, x + 0.066, y + 0.065, z, 0.018, 0.08, 0.016); }
function trencher(c, x, y, z) { paint(c, OAK, "oklch(0.95 0.03 70)"); LA(c, x, y, z, [[0.15, 0], [0.17, 0.025]], 10, true);
  flatc(c, "#b07a3e"); c.roughness(0.9); LA(c, x + 0.02, y + 0.02, z, [[0.09, 0], [0.085, 0.04], [0.05, 0.07], [0.001, 0.08]], 8, false); c.roughness(null); }
function crateG(c, x, y, z, s, D) { paint(c, OAK, "oklch(0.95 0.03 75)"); BX(c, x - s / 2, y, z - s / 2, x + s / 2, y + s, z + s / 2);
  if (D <= 2) { paint(c, OAK, WOOD); const e = s / 2 + 0.012; BX(c, x - e, y + s - 0.06, z - e, x + e, y + s, z + e); BX(c, x - e, y, z - e, x + e, y + 0.06, z + e);
    for (const a of [-1, 1]) for (const b of [-1, 1]) BX(c, x + a * (s / 2 - 0.03) - 0.04, y, z + b * (s / 2 - 0.03) - 0.04, x + a * (s / 2 - 0.03) + 0.04, y + s, z + b * (s / 2 - 0.03) + 0.04); } }
function sack(c, x, y, z, s = 1) { flatc(c, "#9c8660"); c.roughness(0.95); LA(c, x, y, z, [[0.2 * s, 0], [0.26 * s, 0.14 * s], [0.23 * s, 0.38 * s], [0.08 * s, 0.52 * s], [0.1 * s, 0.6 * s]], 9, true); c.roughness(null); }
function caskX(c, x0, y, z, r, L, D) { // a cask lying along +x from x0, axis at height y
  const n = D <= 2 ? 12 : 8; paint(c, OAK, WOOD); LA(c, x0, y, z, [[r * 0.84, 0], [r * 0.96, L * 0.25], [r, L * 0.5], [r * 0.96, L * 0.75], [r * 0.84, L]], n, true, "x");
  if (D <= 2) { paint(c, IR, IRONC); for (const [t, k] of [[0.1, 0.89], [0.33, 0.985], [0.67, 0.985], [0.9, 0.89]]) LA(c, x0 + L * t - 0.025, y, z, [[r * k + 0.012, 0], [r * k + 0.012, 0.05]], n, false, "x"); } }
function tableSet(c, x, z, y, w, d, bz, bl, D, fill = true) {
  table(c, x, z, y, w, d, D); for (const s of [-1, 1]) bench(c, x, z + s * bz, y, bl, D);
  if (fill && D <= 2) { const top = y + 0.78, n = 2 + Math.floor(c.random() * 3);
    for (let i = 0; i < n; i++) mug(c, x - w / 2 + 0.25 + (i + c.random() * 0.5) * (w - 0.5) / n, top, z + (i % 2 ? 0.22 : -0.22) + (c.random() - 0.5) * 0.08);
    trencher(c, x + (c.random() - 0.5) * 0.6, top, z + (c.random() - 0.5) * 0.15); candle(c, x - 0.1 + (c.random() - 0.5) * 0.4, top, z + 0.02, 0.06 + c.random() * 0.05); } }
function tableBoxes(b, x, z, y, w, d, bz, bl) { b(x - w / 2, y, z - d / 2, x + w / 2, y + 0.78, z + d / 2); for (const s of [-1, 1]) b(x - bl / 2, y, z + s * bz - 0.175, x + bl / 2, y + 0.46, z + s * bz + 0.175); }
// a round stone arch head in the y-z plane between xa and xb (voussoirs only; the fill is the wall's)
function ARCHZ(c, xa, xb, zc, ys, r, D) { const n = D <= 2 ? 9 : 5; paint(c, FS, DRESS);
  for (let i = 0; i < n; i++) { const am = Math.PI * (i + 0.5) / n; RB(c, (xa + xb) / 2, ys + (r + 0.13) * Math.sin(am), zc + (r + 0.13) * Math.cos(am), xb - xa + 0.06, 0.26, Math.PI * (r + 0.13) / n - 0.02, 0, 90 - am * 180 / Math.PI); } }
function spandrel(c, xa, xb, zc, ys, r, ytop, D) { const n = D <= 2 ? 10 : 5;
  for (let i = 0; i < n; i++) { const a0 = Math.PI * (1 - i / n), a1 = Math.PI * (1 - (i + 1) / n), z0 = zc + r * Math.cos(a0), y0 = ys + r * Math.sin(a0), z1 = zc + r * Math.cos(a1), y1 = ys + r * Math.sin(a1);
    HX(c, [[xa, y0, z0], [xb, y0, z0], [xb, y1, z1], [xa, y1, z1], [xa, ytop, z0], [xb, ytop, z0], [xb, ytop, z1], [xa, ytop, z1]]); } }
function cobweb(c, x, y, z, sx, sz) { flatc(c, "#c9c4b8"); c.tri(x, y, z, x + sx * 0.6, y, z, x, y - 0.5, z); c.tri(x, y, z, x, y - 0.5, z, x, y, z + sz * 0.6); c.tri(x, y, z, x, y, z + sz * 0.55, x + sx * 0.55, y, z); }
function damp(c, x0, z0, x1, z1, y0, y1) { flatc(c, "#262d22"); c.roughness(0.3); BX(c, x0, y0, z0, x1, y1, z1); c.roughness(null); }
// ---- the taproom ----
function taproom(c, D) {
  paint(c, FLAG, STONE);
  BX(c, -7.3, -0.2, -6.75, 8.75, F, 6.75); BX(c, -8.75, -0.2, -6.75, -7.3, F, -6.4); BX(c, -8.75, -0.2, -0.4, -7.3, F, 6.75); BX(c, -8.75, -0.2, -6.4, -8.7, F, -0.4);
  BX(c, -0.8, -0.2, -7.25, 0.8, F, -6.75); BX(c, 8.75, -0.2, -0.8, 9.25, F, 0.8);
  paint(c, FS, STONE);
  BX(c, -9.25, -0.2, -7.25, -0.8, CH, -6.75); BX(c, 0.8, -0.2, -7.25, 9.25, CH, -6.75); BX(c, -0.8, 2.72, -7.25, 0.8, CH, -6.75);
  BX(c, -9.25, -0.2, 6.75, 9.25, CH, 7.25); BX(c, -9.25, -0.2, -6.75, -8.75, CH, 6.75);
  BX(c, 8.75, -0.2, -6.75, 9.25, CH, -0.8); BX(c, 8.75, -0.2, 0.8, 9.25, CH, 6.75); BX(c, 8.75, 2.72, -0.8, 9.25, CH, 0.8);
  if (D <= 4) spandrel(c, 8.75, 9.25, 0, 1.92, 0.8, 2.72, D);
  paint(c, OAK, OAKD); BX(c, -8.75, CH, -6.75, 8.75, CH + 0.3, 6.75);
  if (D >= 4) return;
  if (D <= 3) ARCHZ(c, 8.72, 9.28, 0, 1.92, 0.8, D);
  // beams every 2 m, a summer beam on two posts (broken round the flue)
  paint(c, OAK, OAKD);
  for (let x = -8; x <= 8.01; x += 2) BX(c, x - 0.16, CH - 0.36, -6.75, x + 0.16, CH, 6.75);
  BX(c, -8.75, CH - 0.64, -0.2, -0.45, CH - 0.36, 0.2); BX(c, 0.45, CH - 0.64, -0.2, 8.75, CH - 0.36, 0.2);
  for (const x of [-2.6, 2.6]) { BX(c, x - 0.16, F, -0.16, x + 0.16, CH - 0.64, 0.16); BX(c, x - 0.22, F, -0.22, x + 0.22, F + 0.25, 0.22);
    if (D <= 2) for (const s of [-1, 1]) RB(c, x + s * 0.42, CH - 0.92, 0, 0.12, 0.9, 0.12, 0, 0, -s * 45); }
  // the door frame, its step, and shuttered windows (night beyond)
  BX(c, -0.95, F, -7.3, -0.8, 2.72, -6.7); BX(c, 0.8, F, -7.3, 0.95, 2.72, -6.7); BX(c, -1.05, 2.72, -7.3, 1.05, 2.95, -6.7);
  const win = (x, z, s, ax) => { // a window recess on a wall face, ax: "z" (north/south) or "x"
    const box = (a0, y0, a1, y1, d0, d1) => ax === "z" ? BX(c, x + a0, y0, z + d0 * s, x + a1, y1, z + d1 * s) : BX(c, z + d0 * s, y0, x + a0, z + d1 * s, y1, x + a1);
    glow(c, "#1a2232", [0.05, 0.07, 0.13]); box(-0.4, 1.5, 0.4, 2.5, -0.02, 0.01);
    paint(c, OAK, OAKD); box(-0.5, 2.5, 0.5, 2.62, -0.04, 0.03); box(-0.04, 1.5, 0.04, 2.5, -0.04, 0.0); box(-0.4, 1.96, 0.4, 2.04, -0.04, 0.0);
    paint(c, FS, DRESS); box(-0.55, 1.38, 0.55, 1.5, -0.12, 0.03); };
  // win(x, z-face, s=+1 means room is toward -z)
  const wz = (x, zf, s) => { glow(c, "#1a2232", [0.05, 0.07, 0.13]); BX(c, x - 0.4, 1.5, Math.min(zf, zf - s * 0.02), x + 0.4, 2.5, Math.max(zf, zf - s * 0.02));
    paint(c, OAK, OAKD); BX(c, x - 0.5, 2.5, zf - 0.04, x + 0.5, 2.62, zf + 0.04); BX(c, x - 0.04, 1.5, zf - 0.04, x + 0.04, 2.5, zf + 0.04); BX(c, x - 0.4, 1.96, zf - 0.04, x + 0.4, 2.04, zf + 0.04);
    if (D <= 2) { paint(c, OAK, "#7a3a2a"); BX(c, x - 0.95, 1.45, zf - 0.05, x - 0.52, 2.55, zf + 0.05); BX(c, x + 0.52, 1.45, zf - 0.05, x + 0.95, 2.55, zf + 0.05); }
    paint(c, FS, DRESS); BX(c, x - 0.6, 1.38, zf - 0.12, x + 0.6, 1.5, zf + 0.12); };
  wz(-4.5, -6.75, -1); wz(4.5, -6.75, -1);
  const wx = (z, xf) => { glow(c, "#1a2232", [0.05, 0.07, 0.13]); BX(c, xf - 0.02, 1.5, z - 0.4, xf + 0.02, 2.5, z + 0.4);
    paint(c, OAK, OAKD); BX(c, xf - 0.04, 2.5, z - 0.5, xf + 0.04, 2.62, z + 0.5); BX(c, xf - 0.04, 1.5, z - 0.04, xf + 0.04, 2.5, z + 0.04);
    paint(c, FS, DRESS); BX(c, xf - 0.12, 1.38, z - 0.6, xf + 0.12, 1.5, z + 0.6); };
  wx(3.6, -8.75); wx(-4.2, 8.75); wx(4.2, 8.75);
  // stairwell rail and trim
  paint(c, OAK, OAKD);
  BX(c, -7.36, F, -5.8, -7.24, 1.1, -0.34); BX(c, -8.75, 0.98, -0.46, -7.24, 1.1, -0.34);
  for (let z = -5.8; z <= -0.39; z += 1.08) BX(c, -7.38, F, z - 0.05, -7.22, 1.14, z + 0.05); BX(c, -8.75, F, -0.46, -8.6, 1.14, -0.34);
  if (D <= 2) { BX(c, -7.34, 0.58, -5.8, -7.26, 0.64, -0.4); BX(c, -8.7, 0.58, -0.44, -7.3, 0.64, -0.36);
    BX(c, -7.36, F - 0.02, -6.4, -7.24, F + 0.02, -0.4); BX(c, -8.7, F - 0.02, -6.46, -7.3, F + 0.02, -6.34); }
  // hearth, bar, tables, lamps
  hearth(c, D); if (on("bar")) bar(c, D);
  if (on("tables")) for (const [x, z] of [[-5, -3.2], [5, -3.2], [-5.2, 2.2], [5.2, 2.2]]) tableSet(c, x, z, F, 2.4, 0.9, 0.75, 2.2, D);
  for (const [x, z] of [[-5, -0.5], [5, -0.5]]) lantern(c, x, CH - 0.36, z, D, 1.1);
  lantern(c, 0, CH - 0.36, 5.0, D, 0.85);
  // a stack of kegs and a crate or two by the east end of the bar
  if (on("kegs")) { for (const [x, z] of [[6.6, 6.3], [7.4, 6.2], [8.2, 6.3]]) BARREL(c, x, F, z, 0.33, 0.9, D); BARREL(c, 7.0, F + 0.9, 6.3, 0.33, 0.9, D);
  crateG(c, -7.8, F, 6.2, 0.7, D); crateG(c, -7.0, F, 6.25, 0.55, D); }
}
function hearth(c, D) {
  const n = D <= 2 ? 22 : 12;
  paint(c, FS, STONE); LA(c, 0, F, 0, [[1.25, 0], [1.25, 0.5], [1.0, 0.5], [1.0, 0.1]], n, false, "y", false);
  flatc(c, "#3a3632"); c.roughness(1); CY(c, 0, F, 0, 1.0, 0.3, n); c.roughness(null);
  if (D <= 2) { paint(c, FS, DRESS); for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; RB(c, 1.125 * Math.cos(a), F + 0.53, 1.125 * Math.sin(a), 0.44 + c.random() * 0.06, 0.07, 0.3, -(a * 180 / Math.PI + 90)); } }
  flatc(c, "#211912"); for (const [y, yaw] of [[0.47, 20], [0.47, 100], [0.56, 60], [0.56, 150], [0.64, 10]]) RB(c, 0, y, 0, 1.3, 0.15, 0.15, yaw, 0, 0);
  glow(c, "#5a2a10", [1.4, 0.45, 0.08]); for (let i = 0; i < 9; i++) { const a = c.random() * 6.28, r = 0.2 + c.random() * 0.6; RB(c, r * Math.cos(a), 0.425, r * Math.sin(a), 0.12, 0.02, 0.1, c.random() * 180); }
  paint(c, IR, IRONC); for (const a of [45, 135, 225, 315]) { const x = 1.12 * Math.cos(a * Math.PI / 180), z = 1.12 * Math.sin(a * Math.PI / 180); BX(c, x - 0.035, F + 0.5, z - 0.035, x + 0.035, 2.66, z + 0.035); }
  paint(c, IR, COPPER); LA(c, 0, 2.5, 0, [[1.4, 0], [0.4, 0.7]], n, false);
  paint(c, IR, IRONC); LA(c, 0, 2.44, 0, [[1.43, 0], [1.43, 0.08]], n, false); if (D <= 2) LA(c, 0, 2.86, 0, [[0.92, 0], [0.88, 0.05]], n, false);
  paint(c, IR, "oklch(0.62 0.01 250)"); BX(c, -0.4, 3.2, -0.4, 0.4, CH, 0.4);
  if (D <= 2) { paint(c, IR, IRONC); for (const y of [3.5, 3.95]) BX(c, -0.43, y, -0.43, 0.43, y + 0.06, 0.43); }
}
function bar(c, D) {
  paint(c, OAK, OAKD); BX(c, -4, F, 4.66, 4, 1.12, 5.4);
  paint(c, OAK, OAKL); BX(c, -4.1, 1.12, 4.55, 4.1, 1.2, 5.5);
  if (D <= 2) { paint(c, OAK, OAKD); for (let x = -3.9; x <= 3.91; x += 0.4) BX(c, x - 0.05, F + 0.14, 4.61, x + 0.05, 1.08, 4.66); BX(c, -4, F, 4.6, 4, F + 0.14, 4.66);
    paint(c, IR, BRASS); LA(c, -4, F + 0.24, 4.42, [[0.03, 0], [0.03, 8]], 8, true, "x"); for (const x of [-3.5, 0, 3.5]) BX(c, x - 0.02, F + 0.2, 4.42, x + 0.02, F + 0.28, 4.66);
    for (const [x, z] of [[-3.3, 4.8], [-2.95, 4.95], [1.2, 4.82], [2.1, 4.9], [3.2, 4.8]]) mug(c, x, 1.2, z);
    flatc(c, "#b9b3a2"); c.roughness(0.35); RB(c, 0.5, 1.208, 4.95, 0.4, 0.014, 0.28, 18); RB(c, 0.62, 1.2, 4.6, 0.12, 0.016, 0.1, 18); c.roughness(null); }
  // cask rack on the back wall: six casks on their sides, brass taps
  paint(c, OAK, OAKD); BX(c, -3.7, F, 6.45, 3.7, 0.85, 6.75); BX(c, -3.7, 0.79, 6.2, 3.7, 0.85, 6.45);
  for (const x of [-3.0, -1.8, -0.6, 0.6, 1.8, 3.0]) { caskX(turn90(c, x, 6.45), x - 0.28, 1.17, 6.45, 0.31, 0.56, D);
    paint(c, IR, BRASS); BX(c, x - 0.03, 1.0, 6.04, x + 0.03, 1.06, 6.2); BX(c, x - 0.025, 0.93, 6.04, x + 0.025, 1.0, 6.09); BX(c, x - 0.012, 1.06, 6.1, x + 0.012, 1.17, 6.13); }
  paint(c, OAK, OAKD); for (const y of [1.9, 2.45, 3.0]) BX(c, -3.7, y, 6.45, 3.7, y + 0.05, 6.75);
  for (const x of [-3.7, -1.2, 1.2, 3.7]) BX(c, x - 0.04, 1.55, 6.45, x + 0.04, 3.05, 6.75);
  if (D <= 2) { const cols = ["#3d5a3a", "#6b4a1e", "#2f3d52", "#7a2e22", "#c9a45a"];
    for (const y of [1.95, 2.5]) for (let x = -3.5; x < 3.55; x += 0.26) { if (c.random() < 0.25) continue;
      glow(c, cols[Math.floor(c.random() * cols.length)], [0.02, 0.015, 0.01]); c.roughness(0.15); const h = 0.22 + c.random() * 0.12;
      CY(c, x, y, 6.6 + (c.random() - 0.5) * 0.1, 0.05, h, 6); CY(c, x, y + h, 6.6, 0.018, 0.07, 5); c.roughness(null); }
    for (let x = -3.4; x < 3.5; x += 0.35) mug(c, x, 3.05, 6.6); }
}
// ---- the east wing: corridor and six rooms ----
function wing(c, D) {
  paint(c, OAK, "oklch(0.85 0.03 60)"); BX(c, 9.25, -0.2, -4.4, 17.7, F, 4.4);
  paint(c, FS, STONE); BX(c, 9.25, -0.2, -4.8, 18.1, 3.32, -4.4); BX(c, 9.25, -0.2, 4.4, 18.1, 3.32, 4.8); BX(c, 17.7, -0.2, -4.4, 18.1, 3.32, 4.4);
  paint(c, OAK, OAKD); BX(c, 9.25, 3.12, -4.4, 17.7, 3.32, 4.4);
  if (D >= 5) return;
  paint(c, PL, WHITE);
  for (const [z0, z1] of [[-0.88, -0.72], [0.72, 0.88]]) { let x = 9.25; for (const r of ROOMS) { BX(c, x, F, z0, r + 0.95, 3.12, z1); BX(c, r + 0.95, 2.32, z0, r + 1.85, 3.12, z1); x = r + 1.85; } BX(c, x, F, z0, 17.7, 3.12, z1); }
  for (const xp of [12.0, 14.8]) { BX(c, xp, F, -4.4, xp + 0.2, 3.12, -0.88); BX(c, xp, F, 0.88, xp + 0.2, 3.12, 4.4); }
  if (D >= 4) return;
  paint(c, OAK, OAKD); for (let x = 9.9; x < 17.7; x += 1.4) BX(c, x - 0.1, 2.9, -4.4, x + 0.1, 3.12, 4.4);
  for (const r of ROOMS) { room(c, r, D); room(mirrorZ(c), r, D); }
  // sconces on the north corridor wall, the notice frame on the south one
  for (const x of [12.1, 14.9]) { paint(c, IR, IRONC); BX(c, x - 0.06, 1.7, -0.72, x + 0.06, 1.95, -0.69); BX(c, x - 0.015, 1.8, -0.69, x + 0.015, 1.83, -0.5); LA(c, x, 1.83, -0.52, [[0.06, 0], [0.08, 0.05]], 8, true); candle(c, x, 1.88, -0.52, 0.12); }
  paint(c, OAK, OAKD); BX(c, 11.84, 1.3, 0.66, 12.56, 1.9, 0.72); flatc(c, "#d9c9a0"); BX(c, 11.9, 1.36, 0.655, 12.5, 1.84, 0.661);
}
function room(c, x0, D) { // drawn as a south room (corridor at z 0.8, outer wall at 4.4); mirrorZ makes the north one
  const wx = x0 < 10 ? 9.25 : x0;
  paint(c, OAK, OAKD); BX(c, x0 + 0.87, F, 0.66, x0 + 0.95, 2.32, 0.94); BX(c, x0 + 1.85, F, 0.66, x0 + 1.93, 2.32, 0.94); BX(c, x0 + 0.82, 2.32, 0.64, x0 + 1.98, 2.44, 0.96);
  paint(c, IR, IRONC); BX(c, x0 + 0.9, 2.26, 0.95, x0 + 1.9, 2.28, 0.98);
  flatc(c, "#6b3a2e"); c.roughness(0.95); for (let i = 0; i < 5; i++) RB(c, x0 + 1.0 + i * 0.085, F + 1.17, 0.99 + (i % 2) * 0.035, 0.1, 2.08, 0.02, i % 2 ? 22 : -22);
  flatc(c, "#5e4636"); BX(c, x0 + 0.6, F, 1.55, x0 + 2.0, F + 0.012, 2.9); if (D <= 2) { flatc(c, "#8a3a2a"); BX(c, x0 + 0.68, F, 1.63, x0 + 1.92, F + 0.016, 1.7); BX(c, x0 + 0.68, F, 2.75, x0 + 1.92, F + 0.016, 2.82); }
  c.roughness(null);
  paint(c, OAK, WOOD); BX(c, x0 + 1.75, F, 2.5, x0 + 2.45, F + 0.36, 2.95); paint(c, OAK, OAKL); BX(c, x0 + 1.73, F + 0.36, 2.48, x0 + 2.47, F + 0.42, 2.97);
  if (D <= 2) { paint(c, IR, IRONC); for (const u of [1.82, 2.38]) BX(c, x0 + u - 0.025, F, 2.47, x0 + u + 0.025, F + 0.43, 2.98); BX(c, x0 + 2.07, F + 0.24, 2.46, x0 + 2.13, F + 0.36, 2.48); }
  paint(c, OAK, WOOD); CY(c, x0 + 0.35, F + 0.42, 2.7, 0.17, 0.05, 8); for (const a of [0, 2.09, 4.19]) RB(c, x0 + 0.35 + 0.1 * Math.cos(a), F + 0.21, 2.7 + 0.1 * Math.sin(a), 0.04, 0.44, 0.04, -a * 57.3, 0, 8);
  candle(c, x0 + 0.35, F + 0.47, 2.7, 0.09);
  paint(c, OAK, OAKD); BX(c, wx, F + 1.68, 1.45, wx + 0.12, F + 1.72, 1.5);
  flatc(c, ["#3f4a3a", "#4a3a30", "#3a4050"][Math.round(x0) % 3]); c.roughness(0.95);
  HX(c, [[wx + 0.02, F + 0.62, 1.2], [wx + 0.1, F + 0.62, 1.2], [wx + 0.1, F + 0.62, 1.78], [wx + 0.02, F + 0.62, 1.78], [wx + 0.02, F + 1.7, 1.38], [wx + 0.08, F + 1.7, 1.38], [wx + 0.08, F + 1.7, 1.57], [wx + 0.02, F + 1.7, 1.57]]); c.roughness(null);
  glow(c, "#2a2a30", [0.35, 0.22, 0.1]); BX(c, x0 + 1.0, 1.5, 4.36, x0 + 1.6, 2.0, 4.4);
  paint(c, OAK, OAKD); BX(c, x0 + 0.98, 1.5, 4.33, x0 + 1.28, 2.0, 4.37); BX(c, x0 + 1.32, 1.5, 4.33, x0 + 1.62, 2.0, 4.37); BX(c, x0 + 0.92, 2.0, 4.3, x0 + 1.68, 2.08, 4.4); BX(c, x0 + 0.92, 1.42, 4.28, x0 + 1.68, 1.5, 4.4);
}
// ---- the Lowcellar ----
function cellar(c, D) {
  paint(c, FLAG, "oklch(0.78 0.015 90)"); BX(c, -9.4, CF - 0.3, -7.4, 10.4, CF, 7.4);
  paint(c, FS, "oklch(0.82 0.02 100)");
  BX(c, -9.4, CF, -7.4, -9.0, CC, 7.4); BX(c, 10.0, CF, -7.4, 10.4, CC, 7.4); BX(c, -9.0, CF, -7.4, 10.0, CC, -7.0); BX(c, -9.0, CF, 7.0, 10.0, CC, 7.4);
  if (D >= 5) return;
  BX(c, -3.2, CF, -7.0, -2.8, CC, 2.0); BX(c, -3.2, CF, 3.4, -2.8, CC, 7.0); BX(c, -3.2, -1.2, 2.0, -2.8, CC, 3.4);
  BX(c, 4.8, CF, -1.8, 5.2, CC, 4.0); BX(c, 4.8, CF, 5.4, 5.2, CC, 7.0); BX(c, 4.8, -1.2, 4.0, 5.2, CC, 5.4);
  BX(c, -2.8, CF, -2.2, 0, CC, -1.8); BX(c, 1.4, CF, -2.2, 10.0, CC, -1.8); BX(c, 0, -1.2, -2.2, 1.4, CC, -1.8);
  paint(c, OAK, OAKD); BX(c, 9.25, CC, -7.0, 10.0, 0.1, -4.4); BX(c, 9.25, CC, 4.4, 10.0, 0.1, 7.0);
  // the stair: stone mass under oak treads
  for (let i = 0; i < 20; i++) { const top = F - 0.176 * (i + 1), z0 = -6.4 + 0.3 * i;
    if (top - 0.05 > CF + 0.01) { paint(c, FS, STONE); BX(c, -8.7, CF, z0, -7.3, top - 0.05, z0 + 0.31); }
    paint(c, OAK, OAKL); BX(c, -8.72, top - 0.05, z0 - 0.03, -7.28, top, z0 + 0.31); }
  if (D >= 4) return;
  paint(c, OAK, OAKD); for (let x = -7; x <= 9.01; x += 2) BX(c, x - 0.15, CC - 0.32, -7.0, x + 0.15, CC, 7.0);
  // door frames
  for (const [a, b] of [[2.0, 3.4]]) { BX(c, -3.26, CF, a - 0.1, -2.74, -1.2, a); BX(c, -3.26, CF, b, -2.74, -1.2, b + 0.1); BX(c, -3.28, -1.2, a - 0.15, -2.72, -1.05, b + 0.15); }
  BX(c, 4.74, CF, 3.9, 5.26, -1.2, 4.0); BX(c, 4.74, CF, 5.4, 5.26, -1.2, 5.5); BX(c, 4.72, -1.2, 3.85, 5.28, -1.05, 5.55);
  BX(c, -0.1, CF, -2.26, 0, -1.2, -1.74); BX(c, 1.4, CF, -2.26, 1.5, -1.2, -1.74); BX(c, -0.15, -1.2, -2.28, 1.55, -1.05, -1.72);
  // damp and cobwebs
  if (D <= 2) { damp(c, -9.0, -5.2, -8.99, -3.6, CF, -2.3); damp(c, -8.2, 6.99, -6.4, 7.0, CF, -2.6); damp(c, 9.99, 1.0, 10.0, 3.2, CF, -2.0); damp(c, 2.0, -7.0, 3.6, -6.99, CF, -2.8); damp(c, -2.8, 6.99, -1.6, 7.0, -1.6, CC - 0.32);
    for (const [x, z, sx, sz] of [[-9, 7, 1, -1], [-3.2, 7, -1, -1], [-9, -7, 1, 1], [10, 7, -1, -1], [10, -7, -1, 1], [-2.8, -7, 1, 1], [5.2, 7, 1, -1], [-2.8, 7, 1, -1]]) cobweb(c, x + sx * 0.01, CC - 0.33, z + sz * 0.01, sx, sz); }
  if (!on("cellar")) return;
  // a) cask store and landing
  for (const z of [-6.2, -5.0, -3.8]) { paint(c, OAK, OAKD); for (const x of [-4.2, -3.6]) BX(c, x - 0.06, CF, z - 0.45, x + 0.06, CF + 0.2, z + 0.45); caskX(c, -4.45, CF + 0.58, z, 0.5, 1.15, D); }
  caskX(c, -4.35, CF + 1.52, -5.6, 0.42, 0.95, D); caskX(c, -4.35, CF + 1.52, -4.4, 0.42, 0.95, D);
  crateG(c, -3.75, CF, 0.4, 0.75, D); crateG(c, -3.75, CF + 0.75, 0.4, 0.7, D); crateG(c, -3.75, CF, 1.25, 0.7, D); crateG(c, -4.6, CF, 0.5, 0.6, D);
  for (const [x, z, s] of [[-8.4, 6.4, 1], [-7.85, 6.5, 0.9], [-8.5, 5.85, 0.95], [-8.1, 6.2, 0.8]]) sack(c, x, CF + (s === 0.8 ? 0.5 : 0), z, s);
  paint(c, OAK, "#5a4a36"); RB(c, -8.85, CF + 0.75, 3.0, 0.035, 1.5, 0.035, 0, 0, -9); flatc(c, "#5a4a2e"); RB(c, -8.75, CF + 0.12, 3.0, 0.12, 0.26, 0.24, 0, 0, -9);
  lantern(c, -5, CC - 0.32, 2.5, D, 0.55); lantern(c, -7, CC - 0.32, -3.5, D, 0.45);
  // b) the meeting room
  tableSet(c, 1, 3.5, CF, 3.6, 1.1, 0.8, 3.2, D, false);
  const top = CF + 0.78;
  flatc(c, "#cdb88a"); c.roughness(0.9); BX(c, -0.4, top, 3.05, 2.2, top + 0.006, 3.95);
  if (D <= 2) { flatc(c, "#3b2a1a"); let px = -0.3, pz = 3.2; for (let i = 0; i < 12; i++) { const nx = px + 0.2, nz = 3.2 + c.random() * 0.25; RB(c, (px + nx) / 2, top + 0.007, (pz + nz) / 2, Math.hypot(nx - px, nz - pz), 0.002, 0.012, -Math.atan2(nz - pz, nx - px) * 57.3); px = nx; pz = nz; }
    flatc(c, "#2f3d52"); RB(c, 0.6, top + 0.007, 3.6, 1.1, 0.002, 0.014, -12); RB(c, 1.5, top + 0.007, 3.5, 0.8, 0.002, 0.012, 20);
    flatc(c, "#4f6b4a"); for (const [x, z] of [[0.1, 3.75], [0.3, 3.8], [1.9, 3.3]]) CY(c, x, top + 0.006, z, 0.06, 0.002, 6);
    flatc(c, "#a8452e"); for (const [x, z] of [[0.9, 3.45], [1.7, 3.75], [0.2, 3.35]]) CY(c, x, top + 0.006, z, 0.025, 0.05, 6); }
  c.roughness(null);
  flatc(c, "#e6dcc4"); RB(c, 2.45, top + 0.017, 3.25, 0.034, 0.034, 0.034, 25); RB(c, 2.53, top + 0.017, 3.3, 0.034, 0.034, 0.034, 70);
  paint(c, IR, BRASS); for (const [x, z, n] of [[2.4, 3.7, 4], [2.55, 3.55, 2], [-0.6, 3.4, 3]]) for (let k = 0; k < n; k++) CY(c, x + (c.random() - 0.5) * 0.01, top + k * 0.005, z, 0.02, 0.005, 6);
  flatc(c, "#5a2e22"); RB(c, -0.55, top + 0.025, 3.8, 0.3, 0.05, 0.22, 8); flatc(c, "#e6dcc4"); RB(c, -0.55, top + 0.025, 3.8, 0.29, 0.04, 0.215, 8);
  for (const [x, z] of [[-0.5, 3.2], [2.3, 3.9], [1.05, 3.08]]) candle(c, x, top, z, 0.08 + c.random() * 0.06);
  lantern(c, 1, CC - 0.32, 3.5, D, 0.5);
  paint(c, OAK, OAKD); BX(c, 3.2, CF + 0.42, 3.25, 3.7, CF + 0.48, 3.75); BX(c, 3.64, CF, 3.25, 3.72, CF + 1.35, 3.75); BX(c, 3.6, CF + 1.28, 3.2, 3.76, CF + 1.38, 3.8);
  for (const z of [3.28, 3.72]) BX(c, 3.23, CF, z - 0.03, 3.29, CF + 0.42, z + 0.03);
  flatc(c, "#22261f"); BX(c, 4.74, -2.6, 0.2, 4.8, -1.5, 1.8); paint(c, OAK, OAKD); BX(c, 4.72, -2.66, 0.14, 4.8, -2.6, 1.86); BX(c, 4.72, -1.5, 0.14, 4.8, -1.44, 1.86);
  if (D <= 2) { flatc(c, "#d8d4c8"); for (let row = 0; row < 3; row++) for (let g = 0; g < 3 + row; g++) { const y = -1.75 - row * 0.28, z0 = 0.35 + g * 0.3; for (let t = 0; t < 4; t++) BX(c, 4.735, y - 0.09, z0 + t * 0.045, 4.74, y + 0.09, z0 + t * 0.045 + 0.012); RB(c, 4.737, y, z0 + 0.075, 0.004, 0.012, 0.22, 0, 35); } }
  crateG(c, -2.3, CF, 6.4, 0.7, D); BARREL(c, 4.2, CF, 6.4, 0.33, 0.9, D);
  // c) old supplies
  paint(c, OAK, OAKD); for (const y of [0.1, 0.75, 1.4, 2.05, 2.7]) BX(c, 9.45, CF + y, -1.5, 10.0, CF + y + 0.04, 6.5); for (let z = -1.5; z <= 6.51; z += 1.6) BX(c, 9.45, CF, z - 0.04, 10.0, CF + 2.9, z + 0.04);
  if (D <= 2) { const jc = ["#6a6a58", "#7a6a4a", "#556055", "#8a7a5a"];
    for (const y of [0.75, 1.4, 2.05, 2.7]) for (let z = -1.3; z < 6.4; z += 0.22) { if (c.random() < 0.35) continue; flatc(c, jc[Math.floor(c.random() * 4)]); const h = 0.14 + c.random() * 0.14;
      LA(c, 9.72, CF + y + 0.04, z, [[0.06, 0], [0.075, h * 0.6], [0.05, h], [0.055, h + 0.03]], 7, true); }
    paint(c, IR, IRONC); for (const z of [-0.6, 0.2, 1.1]) RB(c, 9.7, CF + 0.5, z, 0.04, 0.8, 0.04, 0, 12, 0); }
  for (let i = 0; i < 4; i++) crateG(c, 6.0, CF + i * 0.75, -1.15, 0.72, D);
  for (let i = 0; i < 3; i++) crateG(c, 6.8, CF + i * 0.75, -1.2, 0.72, D);
  for (let i = 0; i < 3; i++) BARREL(c, 8.0, CF + i * 0.9, -1.2, 0.33, 0.9, D);
  for (const [x, z, s] of [[5.8, 6.3, 1], [6.35, 6.55, 0.9], [5.9, 5.75, 0.85]]) sack(c, x, CF, z, s);
  paint(c, OAK, WOOD); RB(c, 7.4, CF + 0.2, 4.2, 0.45, 0.05, 0.45, 30, 0, 8); RB(c, 7.2, CF + 0.04, 4.6, 0.04, 0.45, 0.04, 0, 0, 80); RB(c, 7.65, CF + 0.35, 3.95, 0.04, 0.7, 0.04, 30, 0, 40);
  RB(c, 8.4, CF + 0.42, 5.8, 0.42, 0.05, 0.42, 10); for (const [a, b] of [[-1, -1], [1, -1], [-1, 1]]) RB(c, 8.4 + a * 0.17, CF + 0.21, 5.8 + b * 0.17, 0.04, 0.42, 0.04); RB(c, 8.6, CF + 0.04, 6.1, 0.04, 0.04, 0.42, 50);
  { const n = D <= 2 ? 16 : 8, R = 0.62, cy = CF + 0.64, cz = 1.6, xa = 5.22, xb = 5.32; paint(c, OAK, WOOD);
    for (let i = 0; i < n; i++) { const a0 = i / n * 6.2832, a1 = (i + 1) / n * 6.2832, P = (a, r) => [cy + Math.cos(a) * r, cz + Math.sin(a) * r];
      const [yi0, zi0] = P(a0, R - 0.08), [yi1, zi1] = P(a1, R - 0.08), [yo0, zo0] = P(a0, R), [yo1, zo1] = P(a1, R);
      HX(c, [[xa, yi0, zi0], [xb, yi0, zi0], [xb, yi1, zi1], [xa, yi1, zi1], [xa, yo0, zo0], [xb, yo0, zo0], [xb, yo1, zo1], [xa, yo1, zo1]]); }
    for (let i = 0; i < 4; i++) RB(c, 5.27, cy, cz, 0.04, 2 * R - 0.1, 0.05, 0, i * 45); CY(c, 5.27, cy - 0.1, cz, 0.09, 0.2, 8); }
  paint(c, IR, IRONC); BX(c, 6.98, CC - 0.6, 2.48, 7.02, CC - 0.32, 2.52); lantern(c, 7, CC - 0.6, 2.5, D, 0.12);
  // d) the fence's back room
  paint(c, OAK, OAKD); BX(c, 1.5, CF, -5.6, 4.5, CF + 0.95, -5.0); paint(c, OAK, OAKL); BX(c, 1.42, CF + 0.95, -5.68, 4.58, CF + 1.01, -4.92);
  { const t = CF + 1.01; paint(c, IR, BRASS); BX(c, 2.17, t, -5.33, 2.23, t + 0.42, -5.27); BX(c, 1.95, t + 0.4, -5.32, 2.45, t + 0.42, -5.28);
    for (const x of [1.97, 2.43]) { BX(c, x - 0.004, t + 0.18, -5.302, x + 0.004, t + 0.4, -5.298); LA(c, x, t + 0.16, -5.3, [[0.09, 0], [0.1, 0.025]], 8, true); } LA(c, 2.2, t, -5.3, [[0.08, 0], [0.06, 0.03]], 8, true);
    paint(c, IR, "oklch(0.6 0.01 250)"); BX(c, 3.6, t, -5.5, 4.1, t + 0.26, -5.15); paint(c, IR, BRASS); BX(c, 3.82, t + 0.12, -5.15, 3.88, t + 0.2, -5.13);
    flatc(c, "#c9a45a"); for (let k = 0; k < 4; k++) CY(c, 3.1 + k * 0.01, t + k * 0.005, -5.35, 0.02, 0.005, 6); candle(c, 2.8, t, -5.5, 0.07); }
  for (const x of [-1.85, 3.0, 5.4]) { paint(c, OAK, WOOD); BX(c, x - 0.95, CF, -3.05, x + 0.95, CF + 0.28, -2.25);
    paint(c, HAY, "oklch(0.9 0.03 85)"); BX(c, x - 0.9, CF + 0.28, -3.0, x + 0.9, CF + 0.4, -2.3); flatc(c, "#4e4a3c"); c.roughness(0.95); BX(c, x - 0.2, CF + 0.4, -3.02, x + 0.9, CF + 0.43, -2.28); c.roughness(null); }
  paint(c, OAK, OAKD); BX(c, -2.4, CF + 0.3, -7.0, -0.4, CF + 0.38, -6.75); BX(c, -2.4, CF + 1.5, -7.0, -0.4, CF + 1.58, -6.85);
  for (let i = 0; i < 5; i++) { const x = -2.2 + i * 0.4; paint(c, IR, "oklch(0.7 0.01 250)"); RB(c, x, CF + 1.0, -6.88, 0.05, 1.2, 0.01, 0, 0, (i % 2 ? 4 : -4));
    paint(c, OAK, "#4a3020"); RB(c, x, CF + 1.72, -6.88, 0.035, 0.22, 0.035); paint(c, IR, IRONC); RB(c, x, CF + 1.6, -6.88, 0.18, 0.03, 0.04); }
  { const zc = -4.6, ys = -1.9, r = 0.8; flatc(c, "#6a4a3a");
    for (let y = CF, row = 0; y < ys + r; y += 0.1, row++) { const hw = y + 0.05 < ys ? r : Math.sqrt(Math.max(0, r * r - (y + 0.05 - ys) ** 2)); if (hw < 0.05) continue;
      for (let z = zc - hw + (row % 2) * 0.12; z < zc + hw; z += 0.24) { flatc(c, (row + Math.floor(z * 4)) % 3 ? "#6a4a3a" : "#5a3e30"); BX(c, 9.96, y + 0.005, Math.max(z, zc - hw), 10.0, y + 0.095, Math.min(z + 0.23, zc + hw)); } }
    paint(c, FS, DRESS); BX(c, 9.9, CF, zc - r - 0.22, 10.0, ys, zc - r); BX(c, 9.9, CF, zc + r, 10.0, ys, zc + r + 0.22); ARCHZ(c, 9.9, 9.98, zc, ys, r, D); }
  lantern(c, 3, CC - 0.32, -4.5, D, 0.5);
}
// PARAMS (Codex Kits; {} = the inn as built): tables (taproom table sets), bar (bar and cask rack), kegs (kegs and crates
// by the bar), cellar (the Lowcellar's stores, meeting table, shelves and the fence's room) = false leaves them out.
// Walls, hearth, stairs, lamps and the six rented rooms always stand.
let P = {}; const on = (k) => P[k] !== false;
export function geometry(c) { P = c.params ?? {}; const D = c.lod; taproom(c, D); wing(c, D); cellar(c, D); }
export function collider(c) {
  P = c?.params ?? {}; const b = CB();
  b(-7.3, -0.2, -6.75, 8.75, F, 6.75); b(-8.75, -0.2, -6.75, -7.3, F, -6.4); b(-8.75, -0.2, -0.4, -7.3, F, 6.75);
  b(-0.8, -0.2, -7.25, 0.8, F, -6.75); b(8.75, -0.2, -0.8, 9.25, F, 0.8);
  b(-9.25, -0.2, -7.25, -0.8, CH, -6.75); b(0.8, -0.2, -7.25, 9.25, CH, -6.75); b(-0.8, 2.72, -7.25, 0.8, CH, -6.75);
  b(-9.25, -0.2, 6.75, 9.25, CH, 7.25); b(-9.25, -0.2, -6.75, -8.75, CH, 6.75);
  b(8.75, -0.2, -6.75, 9.25, CH, -0.8); b(8.75, -0.2, 0.8, 9.25, CH, 6.75); b(8.75, 2.72, -0.8, 9.25, CH, 0.8);
  b(-8.75, CH, -6.75, 8.75, CH + 0.3, 6.75);
  for (const x of [-2.6, 2.6]) b(x - 0.22, F, -0.22, x + 0.22, CH - 0.36, 0.22);
  b.list.push({ kind: "cylinder", radiusTop: 1.25, radiusBottom: 1.25, height: 0.5, center: [0, F + 0.25, 0] });
  if (on("bar")) { b(-4.1, F, 4.55, 4.1, 1.2, 5.5); b(-3.7, F, 6.45, 3.7, 3.05, 6.75); }
  b(-7.36, F, -5.8, -7.24, 1.14, -0.34); b(-8.75, F, -0.46, -7.24, 1.14, -0.34);
  if (on("tables")) for (const [x, z] of [[-5, -3.2], [5, -3.2], [-5.2, 2.2], [5.2, 2.2]]) tableBoxes(b, x, z, F, 2.4, 0.9, 0.75, 2.2);
  if (on("kegs")) { b(6.25, F, 5.9, 8.6, 1.8, 6.7); b(-8.2, F, 5.85, -6.7, 0.82, 6.6); }
  // wing
  b(9.25, -0.2, -4.4, 17.7, F, 4.4); b(9.25, -0.2, -4.8, 18.1, 3.32, -4.4); b(9.25, -0.2, 4.4, 18.1, 3.32, 4.8); b(17.7, -0.2, -4.4, 18.1, 3.32, 4.4); b(9.25, 3.12, -4.4, 17.7, 3.32, 4.4);
  for (const [z0, z1] of [[-0.88, -0.72], [0.72, 0.88]]) { let x = 9.25; for (const r of ROOMS) { b(x, F, z0, r + 0.95, 3.12, z1); b(r + 0.95, 2.32, z0, r + 1.85, 3.12, z1); x = r + 1.85; } b(x, F, z0, 17.7, 3.12, z1); }
  for (const xp of [12.0, 14.8]) { b(xp, F, -4.4, xp + 0.2, 3.12, -0.88); b(xp, F, 0.88, xp + 0.2, 3.12, 4.4); }
  for (const r of ROOMS) for (const s of [-1, 1]) b(r + 1.73, F, s > 0 ? 2.48 : -2.97, r + 2.47, F + 0.42, s > 0 ? 2.97 : -2.48);
  // cellar
  b(-9.4, CF - 0.3, -7.4, 10.4, CF, 7.4);
  b(-9.4, CF, -7.4, -9.0, CC, 7.4); b(10.0, CF, -7.4, 10.4, CC, 7.4); b(-9.0, CF, -7.4, 10.0, CC, -7.0); b(-9.0, CF, 7.0, 10.0, CC, 7.4);
  b(-3.2, CF, -7.0, -2.8, CC, 2.0); b(-3.2, CF, 3.4, -2.8, CC, 7.0); b(-3.2, -1.2, 2.0, -2.8, CC, 3.4);
  b(4.8, CF, -1.8, 5.2, CC, 4.0); b(4.8, CF, 5.4, 5.2, CC, 7.0); b(4.8, -1.2, 4.0, 5.2, CC, 5.4);
  b(-2.8, CF, -2.2, 0, CC, -1.8); b(1.4, CF, -2.2, 10.0, CC, -1.8); b(0, -1.2, -2.2, 1.4, CC, -1.8);
  b(9.25, CC, -7.0, 10.0, 0.1, -4.4); b(9.25, CC, 4.4, 10.0, 0.1, 7.0);
  for (let i = 0; i < 20; i++) { const top = F - 0.176 * (i + 1), z0 = -6.4 + 0.3 * i; if (top > CF + 0.01) b(-8.7, CF, z0, -7.3, top, z0 + 0.31); }
  if (on("cellar")) { b(-4.95, CF, -6.7, -3.2, CF + 2.0, -3.3); b(-4.6, CF, 0.05, -3.35, CF + 1.45, 1.6); b(-8.75, CF, 5.6, -7.55, CF + 0.6, 6.8);
  tableBoxes(b, 1, 3.5, CF, 3.6, 1.1, 0.8, 3.2); b(-2.65, CF, 6.05, -1.95, CF + 0.7, 6.75);
  b(9.45, CF, -1.5, 10.0, CF + 2.9, 6.5); b(5.64, CF, -1.56, 8.33, CC, -0.8); b(5.5, CF, 5.5, 6.6, CF + 0.55, 6.8);
  b(1.42, CF, -5.68, 4.58, CF + 1.01, -4.92); for (const x of [-1.85, 3.0, 5.4]) b(x - 0.95, CF, -3.05, x + 0.95, CF + 0.4, -2.25); }
  return b.list;
}
const bench = bench_innHall({ BX, OAK, OAKD, OAKL, paint });
const table = table_innHall({ BX, OAK, OAKD, OAKL, RB, paint });
const lantern = lantern_innHall({ BX, IR, IRONC, LA, glow, paint });
const candle = candle_innHall({ CY, IR, IRONC, LA, RB, glow, paint });
