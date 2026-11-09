import { BARREL, BXR, CB, CY, HX, LA, RB, ROOF, flatc, glow, paint } from "../lib/buildkit.js";   // the shared building toolkit
import BK from "../lib/data/building-kit.json";   // textures and tints: scripts/lib/data/building-kit.yml
// ---- Valenfeld building kit (shared verbatim by scripts/gen/*): textures, boxes, lathes, roofs ----
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
// THE WELL in the square: a fieldstone ring with a capstone lip, dark water, two oak posts carrying a
// rope drum and iron crank, a bucket on its rope, a little slate gable roof.
export function geometry(c) {
  const P = c.params ?? {}, rim = P.rim ?? "oklch(0.9 0.012 80)", water = P.water ?? "#16201f", rope = P.rope ?? "#8a7350", roof = P.roof ?? "oklch(0.95 0.01 200)";
  const D = c.lod, n = D <= 2 ? 18 : 10;
  paint(c, FS, STONE); LA(c, 0, 0, 0, [[1.0, -0.3], [0.97, 0.8]], n, false); LA(c, 0, 0, 0, [[0.7, 0.8], [0.7, -0.3]], n, false);
  paint(c, FS, rim); LA(c, 0, 0, 0, [[0.66, 0.8], [0.66, 0.93], [1.05, 0.93], [1.05, 0.8]], n, false, "y", false);
  flatc(c, water); c.roughness(0.06); LA(c, 0, 0, 0, [[0.7, 0.2], [0.0, 0.2]], n, false, "y", false); c.roughness(null);
  paint(c, OAK, WOOD); for (const s of [-1, 1]) { BX(c, s * 1.12 - 0.09, 0, -0.09, s * 1.12 + 0.09, 2.5, 0.09); if (D <= 2) RB(c, s * 1.12, 0.35, 0, 0.12, 0.7, 0.12, 0, 0, 0); }
  LA(c, -1.25, 1.55, 0, [[0.05, 0], [0.05, 2.5]], 8, true, "x");
  flatc(c, rope); c.roughness(0.95); LA(c, -0.45, 1.55, 0, [[0.11, 0], [0.11, 0.9]], 10, true, "x"); BX(c, -0.015, 1.0, -0.015, 0.015, 1.47, 0.015); c.roughness(null);
  paint(c, IR, IRONC); BX(c, 1.25, 1.25, -0.03, 1.31, 1.6, 0.03); BX(c, 1.31, 1.22, -0.03, 1.5, 1.28, 0.03);
  BARREL(c, 0, 0.62, 0, 0.17, 0.36, D); paint(c, IR, IRONC); LA(c, 0, 1.0, 0, [[0.16, 0], [0.16, 0.012]], 8, false);
  paint(c, OAK, WOOD); BX(c, -1.3, 2.4, -0.1, 1.3, 2.55, 0.1);
  paint(c, SL, roof); ROOF(c, -1.45, 1.45, -1.05, 1.05, 2.45, 3.15, 0.08);
  paint(c, OAK, WOOD); for (const x of [-1.2, 1.2]) c.tri(x, 2.5, -0.9, x, 2.5, 0.9, x, 3.08, 0); BX(c, -1.5, 3.18, -0.07, 1.5, 3.26, 0.07);
}
export function collider() {
  return [{ kind: "cylinder", radiusTop: 1.05, radiusBottom: 1.05, height: 1.0, center: [0, 0.45, 0] },
    { kind: "box", width: 0.18, height: 2.5, depth: 0.18, center: [1.12, 1.25, 0] }, { kind: "box", width: 0.18, height: 2.5, depth: 0.18, center: [-1.12, 1.25, 0] }];
}
