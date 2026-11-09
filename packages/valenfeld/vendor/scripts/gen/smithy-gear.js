import { BARREL, BXR, CB, CY, HX, LA, RB, ROOF, flatc, glow, paint } from "../lib/buildkit.js";   // the shared building toolkit
// ---- Valenfeld building kit (shared verbatim by scripts/gen/*): textures, boxes, lathes, roofs ----
import { forgeGear } from "../lib/pieces/forge.js";   // shared forge gear
import BK from "../lib/data/building-kit.json";   // textures and tints: scripts/lib/data/building-kit.yml
const { fieldstone: FS, oak: OAK, plaster: PL, slate: SL, iron: IR, flagstone: FLAG, hay: HAY } = BK.textures;
const { stone: STONE, wood: WOOD0, white: WHITE, iron: IRONC } = BK.tints;
let WOOD = WOOD0;   // re-tinted per draw by params.wood
// hexahedron: b0 b1 b2 b3 (bottom: x0z0 x1z0 x1z1 x0z1) then t0..t3 above them
const BX = BXR;
// box by centre and size, turned: roll (about z), then pitch (about x, + tips -z up), then yaw (about y), degrees
// lathe: prof [[r, h]…] swept round the y axis (or the x axis: h runs along +x), smooth sides
// gable roof, ridge along x over z mid, eaves at z0/z1 at height ye, ridge yr, slab thickness t
function MERL(c, x0, z0, x1, z1, y, th, h = 0.9, w = 0.9, gap = 0.9) {
  for (let x = x0; x + w <= x1 + 1e-6; x += w + gap) { BX(c, x, y, z0, x + w, y + h, z0 + th); BX(c, x, y, z1 - th, x + w, y + h, z1); }
  for (let z = z0 + th + gap; z + w <= z1 - th + 1e-6; z += w + gap) { BX(c, x0, y, z, x0 + th, y + h, z + w); BX(c, x1 - th, y, z, x1, y + h, z + w); } }
// SMITHY GEAR: the working clutter of Hroald's shop, room-space metres (walls at x ±5.5, back wall z +5.5, door at z −5.9).
// West wall: shield wall and a sword rack. East wall: two armour stands and a polearm rack. Front corners: ingot pallet,
// scrap heap, coal sacks, a barrel of blade blanks. Overhead: a beam with chains, tongs and a hanging lantern.
let STEEL = "oklch(0.78 0.012 250)", DARK = "oklch(0.42 0.01 250)"; const STEEL0 = STEEL, DARK0 = DARK; const LEATHER = "#6a4429", BRASS = "oklch(0.72 0.11 80)";
function metal(c, col = STEEL) { paint(c, IR, col); c.metalness(0.65); c.roughness(0.42); }
function plain(c) { c.metalness(null); c.roughness(null); }
function SWORD(c, x, y, z, yaw = 0, len = 0.95, lean = 0) { metal(c); RB(c, x, y + len * 0.42, z, 0.055, len * 0.72, 0.012, yaw, 0, lean);
  metal(c, DARK); RB(c, x, y + len * 0.06, z, 0.2, 0.035, 0.04, yaw, 0, lean); flatc(c, LEATHER); RB(c, x, y - len * 0.06, z, 0.035, 0.2, 0.035, yaw, 0, lean); plain(c); }
function AXE(c, x, y, z, yaw = 0) { paint(c, OAK, WOOD); RB(c, x, y + 0.5, z, 0.045, 1.0, 0.045, yaw); metal(c); RB(c, x + 0.1 * Math.cos(yaw * Math.PI / 180), y + 0.88, z - 0.1 * Math.sin(yaw * Math.PI / 180), 0.2, 0.18, 0.025, yaw); plain(c); }
function SPEAR(c, x, y, z, yaw = 0) { paint(c, OAK, WOOD); RB(c, x, y + 1.0, z, 0.04, 2.0, 0.04, yaw); metal(c); RB(c, x, y + 2.13, z, 0.07, 0.26, 0.018, yaw); plain(c); }
function SHIELD(c, x, y, z, ax, col) { flatc(c, col); LA(c, x, y, z, [[0.36, 0], [0.36, 0.04]], 14, true, ax); metal(c, DARK);
  LA(c, x + (ax === "x" ? 0.035 : 0), y, z, [[0.37, 0], [0.37, 0.02]], 14, false, ax); LA(c, x + (ax === "x" ? 0.04 : 0), y, z, [[0.08, 0], [0.06, 0.06]], 8, true, ax); plain(c); }
function STAND(c, x, z, yaw, D) { paint(c, OAK, WOOD); BX(c, x - 0.25, 0.06, z - 0.25, x + 0.25, 0.12, z + 0.25); RB(c, x, 0.8, z, 0.07, 1.4, 0.07); RB(c, x, 1.4, z, 0.6, 0.06, 0.06, yaw);
  metal(c); LA(c, x, 0.95, z, [[0.2, 0], [0.25, 0.2], [0.27, 0.42], [0.24, 0.52]], D <= 2 ? 12 : 8, true);   // breastplate
  LA(c, x, 1.55, z, [[0.13, 0], [0.14, 0.12], [0.12, 0.22], [0.05, 0.27]], D <= 2 ? 12 : 8, true);         // helm
  if (D <= 2) { metal(c, DARK); RB(c, x, 1.47, z, 0.62, 0.08, 0.18, yaw); flatc(c, LEATHER); RB(c, x, 0.98, z, 0.52, 0.06, 0.52, yaw); } plain(c); }
function INGOTS(c, x, z, D) { paint(c, OAK, WOOD); BX(c, x - 0.45, 0.06, z - 0.35, x + 0.45, 0.16, z + 0.35);
  metal(c, "oklch(0.62 0.03 50)"); for (let l = 0; l < (D <= 2 ? 4 : 2); l++) for (let i = 0; i < 4 - (l % 2); i++) for (let j = 0; j < 2; j++)
    RB(c, x - 0.3 + i * 0.2 + (l % 2) * 0.1, 0.2 + l * 0.07, z - 0.13 + j * 0.26, 0.17, 0.065, 0.24); plain(c); }
function SACK(c, x, z, s = 1) { paint(c, HAY, "oklch(0.62 0.04 70)"); LA(c, x, 0.06, z, [[0.24 * s, 0], [0.3 * s, 0.15 * s], [0.27 * s, 0.45 * s], [0.12 * s, 0.6 * s], [0.06 * s, 0.68 * s]], 9, true);
  flatc(c, "#141210"); LA(c, x, 0.06 + 0.6 * s, z, [[0.12 * s, 0], [0.04 * s, 0.05 * s]], 7, true); }
// PARAMS (Codex Kits: all optional, {} draws Hroald's shop exactly): forge, weapons, armour (bools, default on);
// swords 0..6, shields 0..4, hammers 1..7 (counts); wood: oak | dark | pale; iron: steel | black | bronze.
const WOODS = { dark: "oklch(0.36 0.04 45)", pale: "oklch(0.72 0.05 75)" };
const IRONS = { black: ["oklch(0.5 0.01 250)", "oklch(0.28 0.01 250)"], bronze: ["oklch(0.7 0.09 65)", "oklch(0.45 0.07 55)"] };
const knobs = (P = {}) => ({ forge: P.forge !== false, weapons: P.weapons !== false, armour: P.armour !== false,
  swords: Math.max(0, Math.min(6, Math.round(P.swords ?? 6))), shields: Math.max(0, Math.min(4, Math.round(P.shields ?? 4))), hammers: Math.max(1, Math.min(7, Math.round(P.hammers ?? 5))) });
export function geometry(c) {
  const D = c.lod, K = knobs(c.params);
  WOOD = WOODS[c.params?.wood] ?? WOOD0; [STEEL, DARK] = IRONS[c.params?.iron] ?? [STEEL0, DARK0];
  // WEST WALL: shield wall on a plank, sword rack below
  paint(c, OAK, "oklch(0.86 0.03 60)"); BX(c, -5.5, 1.5, -4.6, -5.42, 2.5, -1.2);
  const cols = ["#7a2a20", "#2f3d52", "#4f6b4a", "#a8452e"];
  for (let i = 0; i < K.shields; i++) SHIELD(c, -5.38, 2.0, -4.2 + i * 0.85, "x", cols[i]);
  if (K.weapons) { paint(c, OAK, WOOD); BX(c, -5.5, 0.06, -4.5, -5.0, 0.18, -1.3); BX(c, -5.5, 0.9, -4.5, -5.1, 0.98, -1.3);
  for (const z of [-4.5, -1.4]) BX(c, -5.45, 0.06, z, -5.35, 1.0, z + 0.1);
  for (let i = 0; i < K.swords; i++) SWORD(c, -5.27, 0.32, -4.25 + i * 0.5, 90, 0.95, -6); }
  // EAST WALL: two armour stands and a polearm rack
  if (K.armour) { STAND(c, 4.75, -1.7, 90, D); STAND(c, 4.75, -0.2, 90, D); }
  if (K.weapons) { paint(c, OAK, WOOD); BX(c, 5.2, 0.06, 0.7, 5.5, 0.2, 2.2); BX(c, 5.2, 1.6, 0.7, 5.5, 1.68, 2.2);
  for (let i = 0; i < 4; i++) (i % 2 ? AXE : SPEAR)(c, 5.33, 0.2, 0.85 + i * 0.4, 90); }
  // FRONT CORNERS: ingot pallet, scrap heap, coal sacks, blade blanks
  INGOTS(c, -4.5, -5.0, D);
  metal(c, DARK); for (let i = 0; i < (D <= 2 ? 14 : 6); i++) { const a = i * 2.4, r = 0.1 + (i % 5) * 0.09;
    RB(c, -3.3 + Math.cos(a) * r, 0.1 + (i % 3) * 0.06, -5.1 + Math.sin(a) * r, 0.5 - (i % 4) * 0.08, 0.03, 0.06 + (i % 3) * 0.04, i * 37, (i % 3) * 12 - 10, (i % 4) * 9 - 12); } plain(c);
  for (const [x, z, s] of [[4.9, -5.1, 1], [4.35, -5.2, 0.9], [4.95, -4.5, 0.85]]) SACK(c, x, z, s);
  BARREL(c, 3.4, 0.06, -5.0, 0.3, 0.75, D); for (let i = 0; i < 5; i++) SWORD(c, 3.4 + Math.cos(i * 1.3) * 0.12, 0.6, -5.0 + Math.sin(i * 1.3) * 0.12, i * 40, 0.85, (i - 2) * 5);
  // OVERHEAD: beam across the room with chains, tongs and a lantern
  paint(c, OAK, WOOD); BX(c, -5.5, 3.3, -2.6, 5.5, 3.5, -2.35);
  if (D <= 2) { metal(c, DARK); for (const x of [-3.5, 2.6]) for (let k = 0; k < 9; k++) RB(c, x, 3.25 - k * 0.11, -2.47, 0.05, 0.1, 0.02, k % 2 ? 90 : 0);
    for (const x of [-1.8, -1.5, 1.2]) { RB(c, x, 2.85, -2.47, 0.025, 0.85, 0.025, 0, 0, 4); RB(c, x + 0.05, 2.85, -2.47, 0.025, 0.85, 0.025, 0, 0, -4); } plain(c); }
  metal(c, DARK); RB(c, 0, 3.05, -2.47, 0.02, 0.5, 0.02); BX(c, -0.14, 2.5, -2.61, 0.14, 2.82, -2.33); glow(c, "#ffcf80", [2.2, 1.3, 0.5]); BX(c, -0.1, 2.54, -2.57, 0.1, 2.78, -2.37);
  // FORGE GEAR (shared pieces): quench trough by the west wall, worktable mid-room, bar stock in the back-east corner,
  // ore bin by the shield wall, buckets, a bick stump beside the table, a hammer rail over the trough
  const G = forgeGear({ BX, RB, LA, CY, paint, flatc, metal, plain, OAK, FS, WOOD, STONE, DARK, LEATHER });
  if (K.forge) { G.trough(c, -4.95, 2.9, 0.06, 1.6, D); G.bucket(c, -4.35, 1.85, 0.06, D); G.bucket(c, -4.05, 2.1, 0.06, D);
  G.hammerRail(c, -5.42, -0.3, 1.7, 90, K.hammers, D);
  G.worktable(c, 1.4, 0.9, 0, D); G.bickStump(c, -0.3, 1.2, 30, D);
  G.barRack(c, 5.0, 3.3, 90, D); G.oreBin(c, -4.95, -0.3, 90, D); }
  // a horseshoe pile and a hammer on the floor by the forge
  if (D <= 2) { metal(c, DARK); for (let i = 0; i < 6; i++) RB(c, -3.7 + (i % 3) * 0.14, 0.08 + Math.floor(i / 3) * 0.03, 2.2 + (i % 2) * 0.12, 0.13, 0.025, 0.13, i * 50); plain(c); }
}
export function collider(c) {
  const b = CB(), K = knobs(c.params);
  if (K.weapons) b(-5.5, 0, -4.6, -5.0, 1.0, -1.2); if (K.armour) b(4.45, 0, -2.05, 5.1, 1.7, 0.15); if (K.weapons) b(5.15, 0, 0.7, 5.5, 2.2, 2.2);
  b(-4.95, 0, -5.35, -4.05, 0.45, -4.65); b(4.1, 0, -5.45, 5.3, 0.75, -4.2); b(3.1, 0, -5.3, 3.7, 0.8, -4.7);
  if (K.forge) { b(-5.3, 0, 2.1, -4.6, 0.7, 3.7); b(0.55, 0, 0.5, 2.25, 0.9, 1.3); b(-0.56, 0, 0.94, -0.04, 0.8, 1.46);
  b(4.6, 0, 2.7, 5.5, 1.4, 3.9); b(-5.35, 0, -0.75, -4.6, 0.6, 0.15); }
  return b.list;
}
