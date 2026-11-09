import { grown, growBoxes } from "../lib/roomy.js";
// ---- Valenfeld building kit (shared verbatim by scripts/gen/*): textures, boxes, lathes, roofs ----
import BK from "../lib/data/building-kit.json";
import { BARREL, BXR, CB, CY, HX, LA, RB, ROOF, flatc, glow, paint } from "../lib/buildkit.js";   // the shared building toolkit
import { kitDef } from "../lib/kits.js";   // colour defaults: the inn row in scripts/lib/data/kits.yml
const KP = () => kitDef("inn").params ?? {};   // textures and tints: scripts/lib/data/building-kit.yml
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
// THE DROWNED LANTERN inn: 14 × 12 m, fieldstone ground storey (one room, 3.6 m ceiling under oak beams),
// a jettied lime-plaster upper storey in smoke-dark oak framing, mossy slate gable roof, west chimney.
// Door 1.5 × 2.5 m in the north wall at local (0, -6). Inside: bar counter along the back (z 1.65–2.45),
// shelves of bottles, barrels, three tables with benches, a hearth on the west wall, an iron candle ring.
// The innkeeper's spot, local (0, 3.5), is left clear behind the counter.
function geometry0(c) {
  const D = c.lod, H1 = 3.6;
  paint(c, OAK, WOOD); BX(c, -6.4, -0.3, -5.4, 6.4, 0.12, 5.4); BX(c, -0.75, -0.3, -6, 0.75, 0.12, -5.4);
  paint(c, FS, STONE);
  BX(c, -7, -0.5, -6, -0.75, H1, -5.4); BX(c, 0.75, -0.5, -6, 7, H1, -5.4); BX(c, -0.75, 2.5, -6, 0.75, H1, -5.4);
  BX(c, -7, -0.5, 5.4, 7, H1, 6); BX(c, -7, -0.5, -5.4, -6.4, H1, 5.4); BX(c, 6.4, -0.5, -5.4, 7, H1, 5.4);
  BX(c, -1.0, -0.2, -6.7, 1.0, 0.12, -6.0); // step
  // hearth breast on the west wall, firebox opening to +x
  BX(c, -6.4, 0.12, -2.2, -5.5, 1.45, -1.55); BX(c, -6.4, 0.12, -0.45, -5.5, 1.45, 0.2); BX(c, -6.4, 1.45, -2.2, -5.55, H1, 0.2);
  BX(c, -6.4, 0.12, -2.5, -5.15, 0.22, 0.5);
  BX(c, -7.9, -0.5, -1.7, -7.0, 11, -0.3);
  if (D <= 3) { BX(c, -8.0, 10.75, -1.8, -6.9, 10.95, -0.2);
    // quoins
    paint(c, FS, "oklch(0.9 0.012 80)");
    for (let y = 0; y < H1 - 0.3; y += 0.6) { const l = (Math.round(y / 0.6) % 2) ? 0.7 : 0.45;
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const x = 7 * sx, z = 6 * sz;
        BX(c, Math.min(x, x - sx * l) - 0.03 * (sx < 0), y, sz < 0 ? z - 0.03 : z - 0.35, Math.max(x, x - sx * l) + 0.03 * (sx > 0), y + 0.55, sz < 0 ? z + 0.35 : z + 0.03); } } }
  flatc(c, "#1a1612"); BX(c, -6.41, 0.22, -1.55, -6.3, 1.45, -0.45);
  paint(c, OAK, WOOD); BX(c, -6.45, 1.45, -2.35, -5.38, 1.62, 0.35);
  if (D <= 2) { flatc(c, "#3a2a1c"); RB(c, -5.95, 0.3, -1.0, 0.12, 0.12, 0.9, 20, 0, 0); RB(c, -5.9, 0.3, -1.0, 0.12, 0.12, 0.9, -25, 0, 0); RB(c, -5.95, 0.42, -1.0, 0.11, 0.11, 0.8, 90, 0, 0); }
  // upper floor slab (the ceiling) and beams
  paint(c, OAK, WOOD); BX(c, -6.4, H1, -5.4, 6.4, H1 + 0.25, 5.4);
  if (D <= 2) for (let x = -5.6; x <= 5.61; x += 1.4) BX(c, x - 0.12, H1 - 0.28, -5.4, x + 0.12, H1, 5.4);
  // jettied plaster upper storey
  const ex = 7.2, ez = 6.2, H2 = 6.8;
  paint(c, PL, WHITE); BX(c, -ex, H1, -ez, ex, H2, ez);
  if (D <= 3) {
    paint(c, OAK, WOOD); const o = 0.05;
    BX(c, -ex - o, H1, -ez - o, ex + o, H1 + 0.24, ez + o); BX(c, -ex - o, H2 - 0.2, -ez - o, ex + o, H2, ez + o);
    for (const x of [-7.1, -6, -3, 0, 3, 6, 7.1]) { BX(c, x - 0.11, H1, -ez - o, x + 0.11, H2, -ez + 0.02); BX(c, x - 0.11, H1, ez - 0.02, x + 0.11, H2, ez + o); }
    for (const z of [-6.1, -3, 0, 3, 6.1]) { BX(c, -ex - o, H1, z - 0.11, -ex + 0.02, H2, z + 0.11); BX(c, ex - 0.02, H1, z - 0.11, ex + o, H2, z + 0.11); }
    if (D <= 2) { for (const s of [-1, 1]) { const zf = s * (ez + 0.02);
        RB(c, -6.6, 5.2, zf, 1.6, 0.13, 0.06, 0, 0, -48); RB(c, 6.6, 5.2, zf, 1.6, 0.13, 0.06, 0, 0, 48); }
      for (let x = -6.9; x <= 6.91; x += 0.6) BX(c, x - 0.07, H1 - 0.02, -6.25, x + 0.07, H1 + 0.16, -5.95); }
  }
  const win = (x, y0, y1, zf, s) => { // a window on a z face (outward sign s)
    glow(c, "#2a2620", [0.42, 0.26, 0.1]); BX(c, x - 0.45, y0, zf - 0.03 * s, x + 0.45, y1, zf + 0.03 * s);
    if (D <= 2) { paint(c, OAK, WOOD); BX(c, x - 0.04, y0, zf + 0.02 * s, x + 0.04, y1, zf + 0.06 * s); BX(c, x - 0.45, (y0 + y1) / 2 - 0.04, zf + 0.02 * s, x + 0.45, (y0 + y1) / 2 + 0.04, zf + 0.06 * s);
      flatc(c, "#a8452e"); BX(c, x - 0.95, y0, zf + 0.04 * s, x - 0.5, y1, zf + 0.09 * s); BX(c, x + 0.5, y0, zf + 0.04 * s, x + 0.95, y1, zf + 0.09 * s); } };
  for (const x of [-4.5, -1.5, 1.5, 4.5]) { win(x, 4.6, 5.8, -ez, -1); win(x, 4.6, 5.8, ez, 1); }
  // ground windows through the stone, both faces glow
  for (const x of [-4, 4]) { glow(c, "#2a2620", [0.42, 0.26, 0.1]); BX(c, x - 0.5, 1.0, -6.03, x + 0.5, 2.3, -5.37);
    paint(c, OAK, WOOD); BX(c, x - 0.65, 2.3, -6.1, x + 0.65, 2.45, -5.95); BX(c, x - 0.04, 1.0, -6.07, x + 0.04, 2.3, -6.0);
    paint(c, FS, "oklch(0.9 0.012 80)"); BX(c, x - 0.65, 0.88, -6.14, x + 0.65, 1.0, -5.9); }
  glow(c, "#2a2620", [0.42, 0.26, 0.1]); BX(c, 6.37, 1.0, -0.5, 7.03, 2.3, 0.5);
  // roof
  paint(c, c.params?.roofTex ?? SL, c.params?.roofCol ?? KP().roofCol); ROOF(c, -7.7, 7.7, -6.9, 6.9, 6.7, 9.7, 0.22); BX(c, -7.75, 9.78, -0.2, 7.75, 10.0, 0.2);
  paint(c, PL, WHITE); for (const x of [-ex, ex]) { c.tri(x, H2, -ez, x, H2, ez, x, 9.65, 0); }
  if (D <= 2) { paint(c, OAK, WOOD); for (const s of [-1, 1]) { const x = s * (ex + 0.03); BX(c, x - 0.04, H2, -0.11, x + 0.04, 9.5, 0.11); BX(c, x - 0.04, 7.9, -3.4, x + 0.04, 8.08, 3.4); } }
  // door: jambs, lintel, the leaf swung in against the jamb
  paint(c, OAK, WOOD);
  BX(c, -0.9, 0, -6.08, -0.75, 2.5, -5.32); BX(c, 0.75, 0, -6.08, 0.9, 2.5, -5.32); BX(c, -0.95, 2.5, -6.1, 0.95, 2.72, -5.3);
  if (!c.params?.closed) paint(c, OAK, c.params?.doorCol ?? KP().doorCol), BX(c, 0.75, 0.13, -5.35, 0.83, 2.48, -3.9);
  if (D <= 2 && !c.params?.closed) { paint(c, IR, IRONC); for (const y of [0.5, 2.0]) BX(c, 0.83, y, -5.3, 0.85, y + 0.09, -4.0); }
  // sign bracket, board and lantern hanging over the street at local x 2.3
  paint(c, IR, IRONC); BX(c, 2.22, 2.95, -6.06, 2.38, 3.55, -6.0); BX(c, 2.27, 3.38, -7.85, 2.33, 3.46, -6.0); RB(c, 2.3, 3.12, -6.45, 0.04, 0.04, 0.95, 0, 33, 0);
  for (const z of [-6.85, -7.35]) BX(c, 2.29, 3.12, z - 0.01, 2.31, 3.38, z + 0.01);
  paint(c, OAK, "oklch(0.85 0.03 60)"); BX(c, 2.26, 2.35, -7.45, 2.34, 3.12, -6.75);
  BX(c, 2.29, 3.0, -7.67, 2.31, 3.38, -7.63);
  paint(c, IR, IRONC); BX(c, 2.16, 2.78, -7.79, 2.44, 2.83, -7.51); BX(c, 2.14, 3.15, -7.81, 2.46, 3.2, -7.49);
  LA(c, 2.3, 3.2, -7.65, [[0.15, 0], [0.04, 0.12]], 4, true);
  glow(c, "#ffd9a0", [1.8, 1.0, 0.4]); BX(c, 2.19, 2.83, -7.76, 2.41, 3.15, -7.54);
  // --- the room ---
  if (D <= 3) {
    // counter
    paint(c, OAK, WOOD); BX(c, -3.5, 0.12, 1.75, 3.2, 1.05, 2.35); paint(c, OAK, "oklch(0.88 0.03 60)"); BX(c, -3.62, 1.05, 1.62, 3.32, 1.13, 2.47);
    if (D <= 2) { paint(c, OAK, WOOD); for (let x = -3.4; x <= 3.11; x += 0.9) BX(c, x - 0.05, 0.12, 1.7, x + 0.05, 1.05, 1.76); }
    // back cabinet and shelves
    paint(c, OAK, WOOD); BX(c, -3, 0.12, 4.85, 3, 0.95, 5.4);
    for (const y of [1.4, 1.9, 2.4]) BX(c, -3, y, 4.95, 3, y + 0.05, 5.4);
    for (const x of [-3, -1, 1, 3]) BX(c, x - 0.04, 0.95, 4.95, x + 0.04, 2.5, 5.4);
    if (D <= 2) { const cols = ["#3d5a3a", "#6b4a1e", "#2f3d52", "#7a2e22", "#c9a45a"];
      for (const y of [0.95, 1.45, 1.95, 2.45]) for (let x = -2.8; x < 2.85; x += 0.27) { if (c.random() < 0.25) continue;
        glow(c, cols[Math.floor(c.random() * cols.length)], [0.02, 0.015, 0.01]); c.roughness(0.15); const h = 0.22 + c.random() * 0.12;
        CY(c, x, y, 5.15 + (c.random() - 0.5) * 0.15, 0.05, h, 6); CY(c, x, y + h, 5.15, 0.018, 0.07, 5); c.roughness(null); }
      paint(c, IR, "oklch(0.85 0.01 250)"); for (let x = -2.4; x < 2.6; x += 0.8) LA(c, x, 1.13, 2.05 + (c.random() - 0.5) * 0.2, [[0.05, 0], [0.055, 0.14]], 8, true); }
    // barrels at the counter's east end
    for (const [x, y, z] of [[5.6, 0.12, 4.6], [4.85, 0.12, 4.75], [5.7, 0.12, 3.85], [5.25, 1.02, 4.7]]) BARREL(c, x, y, z, 0.33, 0.9, D);
    // tables and benches
    const table = (x, z, yaw) => { paint(c, OAK, "oklch(0.9 0.03 65)"); RB(c, x, 0.8, z, 1.6, 0.07, 0.9, yaw);
      paint(c, OAK, WOOD); for (const [lx, lz] of [[-0.65, -0.32], [0.65, -0.32], [-0.65, 0.32], [0.65, 0.32]]) { const a = yaw * Math.PI / 180;
        RB(c, x + lx * Math.cos(a) + lz * Math.sin(a), 0.46, z - lx * Math.sin(a) + lz * Math.cos(a), 0.09, 0.68, 0.09, yaw); }
      for (const s of [-1, 1]) { const a = yaw * Math.PI / 180, bx = x + s * 0.75 * Math.sin(a), bz = z + s * 0.75 * Math.cos(a);
        RB(c, bx, 0.5, bz, 1.5, 0.06, 0.3, yaw); RB(c, bx + 0.6 * Math.cos(a), 0.3, bz - 0.6 * Math.sin(a), 0.06, 0.36, 0.26, yaw); RB(c, bx - 0.6 * Math.cos(a), 0.3, bz + 0.6 * Math.sin(a), 0.06, 0.36, 0.26, yaw); }
      if (D <= 2) { paint(c, IR, "oklch(0.85 0.01 250)"); LA(c, x + 0.3, 0.835, z + 0.1, [[0.05, 0], [0.055, 0.13]], 8, true); LA(c, x - 0.35, 0.835, z - 0.15, [[0.05, 0], [0.055, 0.13]], 8, true);
        glow(c, "#efe3c8", [0, 0, 0]); CY(c, x, 0.835, z, 0.035, 0.14, 6); glow(c, "#ffcf80", [2.2, 1.2, 0.4]); RB(c, x, 1.0, z, 0.025, 0.05, 0.025); } };
    table(-3.0, -2.8, 0); table(3.3, -2.8, 0); table(4.9, 0.0, 90);
    // candle ring on chains
    paint(c, IR, IRONC); const n = 10;
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; RB(c, 0.6 * Math.cos(a), 2.75, -1 + 0.6 * Math.sin(a), 0.05, 0.05, 0.4, -a * 180 / Math.PI); }
    for (const a of [0, 2.09, 4.19]) RB(c, 0.3 * Math.cos(a), 3.04, -1 + 0.3 * Math.sin(a), 0.02, 0.62, 0.02, -a * 180 / Math.PI, 0, 25);
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2, x = 0.6 * Math.cos(a), z = -1 + 0.6 * Math.sin(a);
      glow(c, "#efe3c8", [0, 0, 0]); CY(c, x, 2.78, z, 0.03, 0.14, 6); glow(c, "#ffcf80", [2.4, 1.3, 0.45]); RB(c, x, 2.96, z, 0.025, 0.055, 0.025); }
  }
}
function collider0(c) {
  const b = CB();
  b(-6.4, -0.3, -5.4, 6.4, 0.12, 5.4);
  b(-7, -0.5, -6, -0.75, 3.6, -5.4); b(0.75, -0.5, -6, 7, 3.6, -5.4); b(-0.75, 2.5, -6, 0.75, 3.6, -5.4);
  b(-7, -0.5, 5.4, 7, 3.6, 6); b(-7, -0.5, -5.4, -6.4, 3.6, 5.4); b(6.4, -0.5, -5.4, 7, 3.6, 5.4);
  b(-7.2, 3.6, -6.2, 7.2, 6.8, 6.2); b(-7.7, 6.8, -4.5, 7.7, 9.0, 4.5); b(-7.9, -0.5, -1.7, -7.0, 11, -0.3);
  b(-6.4, 0.12, -2.2, -5.5, 3.6, -1.55); b(-6.4, 0.12, -0.45, -5.5, 3.6, 0.2); b(-6.4, 1.45, -2.2, -5.5, 3.6, 0.2);
  b(-3.62, 0.12, 1.62, 3.32, 1.13, 2.47); b(-3, 0.12, 4.85, 3, 2.5, 5.4); b(4.45, 0.12, 3.45, 6.05, 1.95, 5.1);
  b(-3.8, 0.12, -3.25, -2.2, 0.83, -2.35); b(2.5, 0.12, -3.25, 4.1, 0.83, -2.35); b(4.45, 0.12, -0.8, 5.35, 0.83, 0.8);
  if (!c.params?.closed) b(0.75, 0.12, -5.35, 0.83, 2.48, -3.9);
  return b.list;
}

// roomy interiors: params.grow widens the shell and lifts the ceilings, furniture keeps human height (scripts/lib/roomy.js)
export function geometry(ctx) { return geometry0(grown(ctx, ctx.params?.grow)); }
export function collider(ctx) { return growBoxes(collider0(ctx), ctx.params?.grow); }
