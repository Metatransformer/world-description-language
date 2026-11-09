import BK from "../lib/data/building-kit.json";
import { shutDoor, shutCollider } from "../lib/pieces/shutdoor.js";   // shared closed door: params.closed swaps the walk-in rooms for a portal interior
import { BXR, HX, flatc, paint } from "../lib/buildkit.js";   // the shared building toolkit
// THE REEVE'S JAIL: a squat fieldstone lock-up, 12 x 8 m, flat leaded roof behind crenels, arrow-slit windows.
// Walk-in: door on +z at x = 3 into the warden's room (desk, keys on a hook, a brazier), and a corridor along +z;
// three barred cells along the back (-z), each with a straw pallet, a bucket and a chain on the wall.
const { fieldstone: FS, oak: OAK, iron: IR, hay: HAY, flagstone: FLAG } = BK.textures;
const { stone: STONE, wood: WOOD, iron: IRONC } = BK.tints;
const W = 6, D = 4, T = 0.5, H = 3.4, F = 0.25;
const BX = BXR;
const DX = 3, DW = 1.4, DH = 2.5, CELLZ = -0.4;
const SHUT = { x0: DX - DW / 2, x1: DX + DW / 2, y0: F, y1: F + DH, zOut: D, s: 1 }; // door; cells run from the back wall to z = CELLZ
export function walls() { return [
  [-W, F, D - T, DX - DW / 2, H, D], [DX + DW / 2, F, D - T, W, H, D], [DX - DW / 2, F + DH, D - T, DX + DW / 2, H, D],
  [-W, F, -D, W, H, -D + T], [-W, F, -D, -W + T, H, D], [W - T, F, -D, W, H, D],
  [1.5, F, CELLZ, 1.8, H, D - T], // warden's room wall, a doorway cut below
].flatMap(b => b[0] === 1.5 ? [[1.5, F, CELLZ, 1.8, H, 1.2], [1.5, F, 2.4, 1.8, H, D - T], [1.5, F + 2.4, 1.2, 1.8, H, 2.4]] : [b]); }
function bars(c, x0, x1, z, doorAt) { paint(c, IR, IRONC); for (let x = x0 + 0.12; x < x1; x += 0.22) BX(c, x - 0.025, F, z - 0.025, x + 0.025, H - 0.4, z + 0.025);
  BX(c, x0, H - 0.5, z - 0.05, x1, H - 0.4, z + 0.05); BX(c, x0, F + 1.1, z - 0.04, x1, F + 1.18, z + 0.04); if (doorAt != null) BX(c, doorAt - 0.06, F + 0.9, z - 0.1, doorAt + 0.06, F + 1.1, z + 0.1); }
export function geometry(c) { const lod = c.lod ?? 1;
  paint(c, FS, STONE); BX(c, -W - 0.2, -3, -D - 0.2, W + 0.2, F, D + 0.2); BX(c, DX - 0.9, -3, D + 0.2, DX + 0.9, F - 0.12, D + 0.8);
  paint(c, FS, "oklch(0.78 0.02 250)"); for (const b of walls()) BX(c, ...b);
  // roof slab, a band and crenels
  paint(c, FS, "oklch(0.7 0.02 250)"); BX(c, -W - 0.15, H, -D - 0.15, W + 0.15, H + 0.4, D + 0.15);
  if (lod <= 2) for (let x = -W + 0.3; x < W; x += 1.4) for (const z of [-D - 0.15, D - 0.35]) BX(c, x, H + 0.4, z, x + 0.7, H + 1.1, z + 0.5);
  if (lod <= 2) for (let z = -D + 0.6; z < D - 0.5; z += 1.4) for (const x of [-W - 0.15, W - 0.35]) BX(c, x, H + 0.4, z, x + 0.5, H + 1.1, z + 0.7);
  // iron-bound oak door, open inward, and slits
  const shut = c.params?.closed; if (shut) shutDoor(c, { BX, paint, flatc, OAK, IR, WOOD, IRONC }, SHUT); else { paint(c, OAK, WOOD); BX(c, DX - DW / 2, F, D - T - 1.3, DX - DW / 2 + 0.08, F + DH, D - T); }
  flatc(c, "oklch(0.12 0.01 250)"); for (const x of [-4.5, -2, 0.5, 5]) { BX(c, x - 0.07, 1.4, D - 0.02, x + 0.07, 2.6, D + 0.01); BX(c, x - 0.07, 1.4, -D - 0.01, x + 0.07, 2.6, -D + 0.02); }
  // a lamp over the door and a painted board: a black key on yellow
  c.albedo(null); c.color("oklch(0.9 0.1 80)"); c.emissive(3, 1.5, 0.45); BX(c, DX + 0.95, 2.5, D + 0.05, DX + 1.2, 2.85, D + 0.3); c.emissive(null);
  flatc(c, "oklch(0.75 0.13 90)"); BX(c, DX - 0.7, 2.95, D, DX + 0.7, 3.3, D + 0.06); flatc(c, "oklch(0.15 0.01 90)"); BX(c, DX - 0.4, 3.08, D + 0.06, DX + 0.25, 3.15, D + 0.08); BX(c, DX + 0.2, 3.03, D + 0.06, DX + 0.4, 3.2, D + 0.08);
  if (lod > 2 || shut) { c.albedo(null); c.color(null); c.emissive(null); return; }
  paint(c, FLAG ?? FS, "oklch(0.7 0.02 250)"); BX(c, -W + T, F, -D + T, W - T, F + 0.02, D - T);
  // three cells along the back, x -5.5..1.5, split by stone walls, barred fronts at z = CELLZ
  paint(c, FS, "oklch(0.78 0.02 250)"); for (const x of [-3.2, -0.9]) BX(c, x - 0.15, F, -D + T, x + 0.15, H, CELLZ);
  const cells = [[-W + T, -3.35], [-3.05, -1.05], [-0.75, 1.5]];
  for (const [x0, x1] of cells) { bars(c, x0, x1, CELLZ, x1 - 0.3);
    paint(c, HAY, "oklch(0.8 0.06 85)"); BX(c, x0 + 0.15, F, -D + T + 0.1, x0 + 1.1, F + 0.18, -D + T + 2.0);
    paint(c, OAK, WOOD); BX(c, x1 - 0.5, F, -D + T + 0.2, x1 - 0.2, F + 0.35, -D + T + 0.5);
    paint(c, IR, IRONC); for (let i = 0; i < 5; i++) BX(c, (x0 + x1) / 2 - 0.04, F + 1.8 - i * 0.16, -D + T, (x0 + x1) / 2 + 0.04, F + 1.9 - i * 0.16, -D + T + 0.05); }
  // warden's room, east: desk, stool, a brazier, keys on a hook
  paint(c, OAK, WOOD); BX(c, 3, F + 0.72, -2.5, 5, F + 0.8, -1.5); for (const [x, z] of [[3.1, -2.4], [4.8, -2.4], [3.1, -1.7], [4.8, -1.7]]) BX(c, x, F, z, x + 0.1, F + 0.72, z + 0.1);
  BX(c, 3.8, F, -0.9, 4.2, F + 0.45, -0.5);
  paint(c, IR, IRONC); BX(c, W - T - 0.05, F + 1.7, 0.5, W - T, F + 1.75, 0.6); flatc(c, "oklch(0.75 0.12 85)"); for (const dz of [0.48, 0.56, 0.62]) BX(c, W - T - 0.08, F + 1.45, dz, W - T - 0.05, F + 1.7, dz + 0.04);
  paint(c, IR, IRONC); BX(c, 2.4, F, 2.6, 2.5, F + 0.9, 2.7); BX(c, 2.15, F + 0.9, 2.35, 2.75, F + 1.05, 2.95); c.albedo(null); c.color("oklch(0.85 0.15 60)"); c.emissive(4, 1.8, 0.4); BX(c, 2.25, F + 1.05, 2.45, 2.65, F + 1.1, 2.85); c.emissive(null);
  c.albedo(null); c.color(null);
}
export function collider(c) {
  const box = (x0, y0, z0, x1, y1, z1) => ({ kind: "box", width: x1 - x0, height: y1 - y0, depth: z1 - z0, center: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2] });
  const out = walls().map(b => box(...b));
  out.push(box(-W - 0.2, -3, -D - 0.2, W + 0.2, F, D + 0.2), box(DX - 0.9, -3, D + 0.2, DX + 0.9, F - 0.12, D + 0.8), box(-W - 0.2, H, -D - 0.2, W + 0.2, H + 1.1, D + 0.2));
  if (c.params?.closed) { out.push(shutCollider(box, SHUT)); return out; }
  out.push(box(-W + T, F, CELLZ - 0.05, 1.5, H, CELLZ + 0.05)); // the cell bars
  for (const x of [-3.2, -0.9]) out.push(box(x - 0.15, F, -D + T, x + 0.15, H, CELLZ));
  out.push(box(3, F, -2.5, 5, F + 0.8, -1.5));
  return out;
}
