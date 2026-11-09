import { grown, growBoxes } from "../lib/roomy.js";
import { BARREL, BXR, CB, CY, HX, LA, RB, ROOF, flatc, glow, paint } from "../lib/buildkit.js";   // the shared building toolkit
// ---- Valenfeld building kit (shared verbatim by scripts/gen/*): textures, boxes, lathes, roofs ----
import BK from "../lib/data/building-kit.json";
import { openShed, openShedColliders, openShedFront, shedFrame } from "../lib/shells/open-shed.js";   // the open-front lean-to shell kit   // textures and tints: scripts/lib/data/building-kit.yml
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
// THE SMITHY: 10 × 10 m, open to -z under a mono-pitch slate roof on four oak posts; fieldstone back and
// side walls. Stone forge with a hood and chimney at the back (coals fx child), anvil on a stump, quench
// barrel, grindstone, a tool board on the west wall, bellows, coal bin, workbench. The smith's spot,
// local (0, -2), is left clear.
const SHED = { pal: { FS, OAK, SL, FLAG, STONE, WOOD, PL, WHITE, IR, IRONC, BX, HX, RB, paint } };   // the smithy is the shell kit's golden case (10 × 10, defaults)
const { yR } = shedFrame(SHED); // roof underside height over z
// params.enclosed: a fieldstone-and-plaster front closes the open side, a doorway in its middle (a door object fills it)
// and two shuttered windows; the side half-walls rise to the roof.
function geometry0(c) {
  const D = c.lod;
  if (c.params?.enclosed) openShedFront(c, SHED);
  openShed(c, SHED);   // the shell: scripts/lib/shells/open-shed.js
  // forge: stone base, coal bed, hood, chimney through the roof
  paint(c, FS, STONE); BX(c, -1.5, 0.06, 2.4, 1.5, 0.95, 4.4);
  paint(c, FS, "oklch(0.9 0.012 80)"); BX(c, -1.6, 0.95, 2.3, 1.6, 1.1, 2.55); BX(c, -1.6, 0.95, 2.55, -1.35, 1.1, 4.4); BX(c, 1.35, 0.95, 2.55, 1.6, 1.1, 4.4);
  glow(c, "#2a120a", [0.9, 0.25, 0.05]); BX(c, -1.35, 0.95, 2.55, 1.35, 1.0, 4.4);
  paint(c, FS, STONE);
  HX(c, [[-1.6, 2.0, 2.2], [1.6, 2.0, 2.2], [1.6, 2.0, 4.4], [-1.6, 2.0, 4.4], [-0.6, 3.6, 3.3], [0.6, 3.6, 3.3], [0.6, 3.6, 4.4], [-0.6, 3.6, 4.4]]);
  BX(c, -0.6, 3.6, 3.3, 0.6, 6.5, 4.6); if (D <= 3) BX(c, -0.72, 6.35, 3.18, 0.72, 6.5, 4.72);
  paint(c, IR, IRONC); BX(c, -1.62, 1.95, 2.18, 1.62, 2.05, 2.24);
  // bellows
  if (D <= 3) { flatc(c, "#5a3a24"); HX(c, [[1.6, 0.9, 2.7], [2.6, 0.9, 2.7], [2.6, 0.9, 3.5], [1.6, 0.9, 3.5], [1.6, 1.0, 2.95], [2.6, 1.2, 2.6], [2.6, 1.2, 3.6], [1.6, 1.0, 3.25]]);
    paint(c, OAK, WOOD); BX(c, 1.6, 0.06, 2.75, 2.6, 0.9, 3.45); }
  // anvil on its stump at (-1.6, -1.2)
  paint(c, OAK, WOOD); LA(c, -1.6, 0.06, -1.2, [[0.34, 0], [0.32, 0.5]], 10, true);
  paint(c, IR, "oklch(0.8 0.01 250)"); c.metalness(0.6); c.roughness(0.45);
  BX(c, -1.85, 0.56, -1.4, -1.35, 0.66, -1.0); BX(c, -1.72, 0.66, -1.3, -1.48, 0.8, -1.1); BX(c, -1.95, 0.8, -1.32, -1.3, 0.94, -1.08);
  HX(c, [[-1.3, 0.8, -1.3], [-0.95, 0.9, -1.22], [-0.95, 0.9, -1.18], [-1.3, 0.8, -1.1], [-1.3, 0.94, -1.3], [-0.95, 0.94, -1.22], [-0.95, 0.94, -1.18], [-1.3, 0.94, -1.1]]);
  if (D <= 2) { RB(c, -1.6, 0.97, -1.15, 0.32, 0.05, 0.05, 25); RB(c, -1.75, 0.96, -1.25, 0.1, 0.05, 0.05, 25); }
  c.metalness(null); c.roughness(null);
  // quench barrel with dark water
  BARREL(c, 2.4, 0.06, 1.0, 0.42, 0.85, D); flatc(c, "#1b2629"); c.roughness(0.08); CY(c, 2.4, 0.06, 1.0, 0.37, 0.8, 12); c.roughness(null);
  // grindstone in its frame at (3.5, -2.7)
  paint(c, OAK, WOOD); for (const x of [3.15, 3.85]) { RB(c, x, 0.45, -2.95, 0.1, 0.95, 0.1, 0, 20); RB(c, x, 0.45, -2.45, 0.1, 0.95, 0.1, 0, -20); }
  BX(c, 3.1, 0.75, -2.75, 3.9, 0.82, -2.65);
  paint(c, FS, "oklch(0.93 0.01 80)"); LA(c, 3.38, 0.82, -2.7, [[0.36, 0], [0.36, 0.14]], D <= 2 ? 16 : 10, true, "x");
  paint(c, IR, IRONC); LA(c, 3.0, 0.82, -2.7, [[0.03, 0], [0.03, 1.0]], 6, true, "x"); BX(c, 3.96, 0.62, -2.72, 4.0, 0.84, -2.68);
  // tool board on the west wall
  paint(c, OAK, "oklch(0.88 0.03 60)"); BX(c, -4.4, 1.1, 0.6, -4.34, 2.4, 3.4);
  if (D <= 3) for (let i = 0; i < 6; i++) { const z = 0.85 + i * 0.47;
    paint(c, OAK, WOOD); BX(c, -4.34, 1.45, z - 0.02, -4.3, 2.15, z + 0.02);
    paint(c, IR, "oklch(0.8 0.01 250)"); if (i % 2) { BX(c, -4.34, 1.38, z - 0.09, -4.27, 1.48, z + 0.09); } else { RB(c, -4.31, 1.6, z - 0.05, 0.03, 0.5, 0.025, 0, 0, 0); RB(c, -4.31, 1.6, z + 0.05, 0.03, 0.5, 0.025, 0, 0, 0); }
    if (D <= 2) LA(c, -4.33, 2.2, z, [[0.07, 0], [0.07, 0.02]], 8, true, "x"); }
  // workbench and coal bin
  paint(c, OAK, WOOD); BX(c, 3.7, 0.86, 2.0, 4.38, 0.94, 4.3); for (const z of [2.1, 4.2]) BX(c, 3.75, 0.06, z - 0.05, 4.33, 0.86, z + 0.05);
  BX(c, -2.85, 0.06, 3.3, -1.75, 0.65, 4.38); flatc(c, "#141210"); c.roughness(0.95); BX(c, -2.78, 0.6, 3.37, -1.82, 0.7, 4.31); c.roughness(null);
  if (D <= 2) { paint(c, IR, "oklch(0.8 0.01 250)"); for (let i = 0; i < 4; i++) RB(c, 3.9 + i * 0.1, 0.96, 2.4 + i * 0.35, 0.3, 0.03, 0.05, 20 * i); }
}
function collider0(c) {
  const b = CB();
  openShedColliders(b, SHED, "walls");
  b(-1.6, 0.06, 2.2, 1.6, 1.1, 4.4); b(-1.6, 2.0, 2.2, 1.6, 3.6, 4.4); b(-0.6, 3.6, 3.3, 0.6, 6.5, 4.6); b(1.6, 0.06, 2.6, 2.6, 1.2, 3.6);
  b(-1.95, 0.06, -1.55, -1.25, 0.94, -0.85); b(1.98, 0.06, 0.58, 2.82, 0.91, 1.42); b(3.0, 0.06, -3.15, 4.0, 1.2, -2.25);
  b(3.7, 0.06, 2.0, 4.38, 0.94, 4.3); b(-2.85, 0.06, 3.3, -1.75, 0.7, 4.38);
  openShedColliders(b, SHED, "roof");
  if (c.params?.enclosed) { b(-5, 0, -4.97, -0.75, 3.3, -4.73); b(0.75, 0, -4.97, 5, 3.3, -4.73); b(-0.75, 2.45, -4.97, 0.75, 3.3, -4.73); b(-5, 1.0, -4.73, -4.4, 3.6, -0.6); b(4.4, 1.0, -4.73, 5, 3.6, -0.6); }
  return b.list;
}

// roomy interiors: params.grow widens the shell and lifts the ceilings, furniture keeps human height (scripts/lib/roomy.js)
export function geometry(ctx) { return geometry0(grown(ctx, ctx.params?.grow)); }
export function collider(ctx) { return growBoxes(collider0(ctx), ctx.params?.grow); }
