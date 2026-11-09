import BK from "../lib/data/building-kit.json";
import { shutDoor, shutCollider } from "../lib/pieces/shutdoor.js";   // shared closed door: params.closed swaps the walk-in rooms for a portal interior
import { brazier_crownHall } from "../lib/pieces/brazier.js";   // shared brazier piece, drawn in this building's palette
import { rack_crownHall } from "../lib/pieces/rack.js";   // shared rack piece, drawn in this building's palette
import { table_crownHall } from "../lib/pieces/table.js";   // shared table piece, drawn in this building's palette
import { banner_crownHall } from "../lib/pieces/banner.js";   // shared banner piece, drawn in this building's palette
import { bench_crownHall } from "../lib/pieces/bench.js";   // shared bench piece, drawn in this building's palette
import { BXR, HX, ROOF, flatc, paint } from "../lib/buildkit.js";   // the shared building toolkit
// THE CROWN'S REEVE HALL: Valenfeld's great-house seat for House Annvyr. 24 x 16 m, walk-in, four rooms on the ground floor:
//   great hall (centre, x -5..5) with the reeve's chair on a dais at the back, a long table and Crown banners
//   west: the reeve's office (front) and the armoury (back); east: the guard barracks (front) and the strongroom (back)
// Front door on +z (centre). Interior doors in the x = ±5 walls at z = ±4. A square tower rises at the back-west corner.
const { fieldstone: FS, oak: OAK, plaster: PL, slate: SL, iron: IR } = BK.textures;
const { stone: STONE, wood: WOOD, white: WHITE, iron: IRONC } = BK.tints;
const NAVY = "oklch(0.32 0.08 260)", GOLD = "oklch(0.78 0.13 85)", RED = "oklch(0.45 0.14 28)";
const W = 12, D = 8, T = 0.5, G = 5, F = 0.3; // half width, half depth, wall thickness, ground storey height, floor height
const BX = BXR;
// a wall along x at z (from x0 to x1) with door gaps [cx, w, h]; along z at x likewise
function wallX(z, x0, x1, gaps, y0, y1) { const out = []; let x = x0; for (const [cx, w, h] of [...gaps].sort((a, b) => a[0] - b[0])) { out.push([x, y0, z - T / 2, cx - w / 2, y1, z + T / 2]); out.push([cx - w / 2, y0 + h, z - T / 2, cx + w / 2, y1, z + T / 2]); x = cx + w / 2; } out.push([x, y0, z - T / 2, x1, y1, z + T / 2]); return out; }
function wallZ(x, z0, z1, gaps, y0, y1) { return wallX(0, z0, z1, gaps, y0, y1).map(([a, b, c0, d, e, f]) => [x - T / 2, b, a, x + T / 2, e, d]); }
const DOORH = 2.8;
const SHUT = { x0: -1.2, x1: 1.2, y0: F, y1: F + 3.2, zOut: D + T / 2, s: 1 };
export function walls() { const y0 = F, y1 = G;
  return [
    ...wallX(D, -W, W, [[0, 2.4, 3.2]], y0, y1),              // front, the great door
    ...wallX(-D, -W, W, [], y0, y1),                           // back
    ...wallZ(-W, -D, D, [], y0, y1), ...wallZ(W, -D, D, [], y0, y1),
    ...wallZ(-5, -D, D, [[-4, 1.4, DOORH], [4, 1.4, DOORH]], y0, y1), ...wallZ(5, -D, D, [[-4, 1.4, DOORH], [4, 1.4, DOORH]], y0, y1),
    ...wallX(0, -W, -5, [], y0, y1), ...wallX(0, 5, W, [], y0, y1),
  ].filter(b => b[3] - b[0] > 0.01 && b[5] - b[2] > 0.01); }
// warm window: a lit pane set into an outer wall face; s = outward sign, axis "x" (pane on a z-face) or "z"
function windowPane(c, axis, at, along, y, s, w = 1.1, h = 1.6) { c.albedo(null); c.color("oklch(0.7 0.08 75)"); c.emissive(1.5, 0.8, 0.3);
  const o = at + s * (T / 2 + 0.02); if (axis === "x") BX(c, along - w / 2, y, Math.min(o, o + s * 0.02), along + w / 2, y + h, Math.max(o, o + s * 0.02)); else BX(c, Math.min(o, o + s * 0.02), y, along - w / 2, Math.max(o, o + s * 0.02), y + h, along + w / 2);
  c.emissive(null); paint(c, OAK, WOOD); if (axis === "x") { BX(c, along - 0.04, y, Math.min(o, o + s * 0.06), along + 0.04, y + h, Math.max(o, o + s * 0.06)); BX(c, along - w / 2 - 0.12, y - 0.12, Math.min(o, o + s * 0.1), along + w / 2 + 0.12, y, Math.max(o, o + s * 0.1)); }
  else { BX(c, Math.min(o, o + s * 0.06), y, along - 0.04, Math.max(o, o + s * 0.06), y + h, along + 0.04); BX(c, Math.min(o, o + s * 0.1), y - 0.12, along - w / 2 - 0.12, Math.max(o, o + s * 0.1), y, along + w / 2 + 0.12); } }
function chest(c, x, z, yaw = 0) { paint(c, OAK, "oklch(0.75 0.04 50)"); BX(c, x - 0.45, F, z - 0.3, x + 0.45, F + 0.5, z + 0.3); paint(c, IR, IRONC); BX(c, x - 0.47, F + 0.5, z - 0.32, x + 0.47, F + 0.56, z + 0.32); for (const dx of [-0.3, 0.3]) BX(c, x + dx - 0.03, F, z - 0.32, x + dx + 0.03, F + 0.56, z + 0.32); }
function bunk(c, x, z) { paint(c, OAK, WOOD); for (const [dx, dz] of [[-0.5, -1], [0.45, -1], [-0.5, 0.95], [0.45, 0.95]]) BX(c, x + dx, F, z + dz, x + dx + 0.06, F + 1.9, z + dz + 0.06); for (const y of [0.45, 1.45]) { BX(c, x - 0.5, F + y, z - 1, x + 0.51, F + y + 0.1, z + 1.01); flatc(c, "oklch(0.55 0.05 60)"); BX(c, x - 0.45, F + y + 0.1, z - 0.95, x + 0.46, F + y + 0.22, z + 0.96); flatc(c, NAVY); BX(c, x - 0.46, F + y + 0.22, z - 0.2, x + 0.47, F + y + 0.26, z + 0.96); paint(c, OAK, WOOD); } }
export function geometry(c) { const lod = c.lod ?? 1;
  // plinth and floor
  paint(c, FS, "oklch(0.75 0.02 80)"); BX(c, -W - 0.4, -5, -D - 0.4, W + 0.4, F, D + 0.4);
  BX(c, -2, -5, D + 0.4, 2, F - 0.15, D + 1.4); BX(c, -2, -5, D + 1.4, 2, F - 0.3, D + 2.2); // front steps
  paint(c, FS, STONE); for (const b of walls()) BX(c, ...b);
  // the great door's oak leaves stand open against the wall, iron-strapped
  paint(c, OAK, WOOD); BX(c, -1.2 - 0.08, F, D - T / 2 - 1.1, -1.2, F + 3.1, D - T / 2); BX(c, 1.2, F, D - T / 2 - 1.1, 1.28, F + 3.1, D - T / 2);
  paint(c, FS, "oklch(0.8 0.02 80)"); BX(c, -1.7, F + 3.2, D, 1.7, F + 3.7, D + 0.45); // lintel
  // ceiling of the ground storey; inside face lime-washed
  paint(c, PL, WHITE); BX(c, -W, G, -D, W, G + 0.25, D);
  paint(c, OAK, WOOD); for (let x = -W + 1.5; x < W; x += 3) BX(c, x - 0.15, G - 0.3, -D, x + 0.15, G, D);
  // upper storey: timber-framed plaster over the stone, jettied 0.3 m
  const J = 0.3, U = 9;
  paint(c, PL, WHITE); BX(c, -W - J, G + 0.25, -D - J, W + J, U, D + J);
  if (lod <= 3) { paint(c, OAK, "oklch(0.55 0.03 50)"); for (const s of [-1, 1]) { const z = s * (D + J); for (let x = -W - J; x <= W + J + 0.01; x += 3) BX(c, x - 0.12, G + 0.25, Math.min(z, z + s * 0.08), x + 0.12, U, Math.max(z, z + s * 0.08));
        BX(c, -W - J, G + 0.25, Math.min(z, z + s * 0.08), W + J, G + 0.5, Math.max(z, z + s * 0.08)); BX(c, -W - J, U - 0.25, Math.min(z, z + s * 0.08), W + J, U, Math.max(z, z + s * 0.08)); }
    for (const s of [-1, 1]) { const x = s * (W + J); for (let z = -D - J; z <= D + J + 0.01; z += 2.6) BX(c, Math.min(x, x + s * 0.08), G + 0.25, z - 0.12, Math.max(x, x + s * 0.08), U, z + 0.12); } }
  // windows: ground floor on the outer walls, upper floor in each bay
  if (lod <= 3) { for (const x of [-9.5, -7, 7, 9.5, -3, 3]) { windowPane(c, "x", D, x, F + 1.4, 1); windowPane(c, "x", -D, x, F + 1.4, -1); }
    for (const z of [-4, 4]) { windowPane(c, "z", W, z, F + 1.4, 1); windowPane(c, "z", -W, z, F + 1.4, -1); }
    for (let x = -W - J + 1.5; x < W; x += 3) { windowPane(c, "x", D + J - T / 2 + 0.05, x, 6.2, 1, 1, 1.5); windowPane(c, "x", -D - J + T / 2 - 0.05, x, 6.2, -1, 1, 1.5); } }
  // the roof: steep slate, a ridge crest, two chimneys, gables
  paint(c, SL, "oklch(0.7 0.04 255)"); ROOF(c, -W - 0.8, W + 0.8, -D - 1.2, D + 1.2, U - 0.3, U + 6.5, 0.3);
  paint(c, PL, WHITE); for (const x of [-W - J, W + J]) HX(c, [[x - 0.1, U, -D - J], [x + 0.1, U, -D - J], [x + 0.1, U, D + J], [x - 0.1, U, D + J], [x - 0.1, U + 6.3, 0], [x + 0.1, U + 6.3, 0], [x + 0.1, U + 6.3, 0], [x - 0.1, U + 6.3, 0]]);
  paint(c, FS, STONE); BX(c, -8, U + 2, 2, -7, U + 7.6, 3); BX(c, 7, U + 2, -3, 8, U + 7.6, -2);
  paint(c, IR, IRONC); BX(c, -W, U + 6.7, -0.06, W, U + 6.95, 0.06);
  // the tower at the back-west corner: 6 m square, 19 m, crenellated, a Crown pennant
  const tx = -W + 1, tz = -D + 1, TH = 19;
  paint(c, FS, STONE); BX(c, tx - 3, -5, tz - 3, tx + 3, TH, tz + 3);
  paint(c, FS, "oklch(0.8 0.02 80)"); BX(c, tx - 3.3, TH - 0.4, tz - 3.3, tx + 3.3, TH, tz + 3.3);
  for (let i = 0; i < 4; i++) for (const s of [-1, 1]) { const a = -2.6 + i * 1.75; BX(c, tx + a - 0.4, TH, tz + s * 3.3 - 0.35, tx + a + 0.4, TH + 0.9, tz + s * 3.3 + 0.35); BX(c, tx + s * 3.3 - 0.35, TH, tz + a - 0.4, tx + s * 3.3 + 0.35, TH + 0.9, tz + a + 0.4); }
  if (lod <= 3) for (const y of [11, 15]) { windowPane(c, "x", tz + 3 - T / 2, tx, y, 1, 0.7, 1.4); windowPane(c, "z", tx - 3 + T / 2, tz, y, -1, 0.7, 1.4); }
  paint(c, IR, IRONC); BX(c, tx - 0.06, TH, tz - 0.06, tx + 0.06, TH + 5, tz + 0.06);
  flatc(c, NAVY); HX(c, [[tx + 0.06, TH + 3.2, tz - 0.03], [tx + 2.6, TH + 4.1, tz - 0.03], [tx + 2.6, TH + 4.1, tz + 0.03], [tx + 0.06, TH + 3.2, tz + 0.03], [tx + 0.06, TH + 4.9, tz - 0.03], [tx + 2.6, TH + 4.3, tz - 0.03], [tx + 2.6, TH + 4.3, tz + 0.03], [tx + 0.06, TH + 4.9, tz + 0.03]]);
  flatc(c, GOLD); BX(c, tx - 0.15, TH + 5, tz - 0.15, tx + 0.15, TH + 5.3, tz + 0.15);
  // outside banners flanking the door
  banner(c, -3.4, F + 4.4, D + T / 2, 1); banner(c, 3.4, F + 4.4, D + T / 2, 1);
  if (c.params?.closed) { shutDoor(c, { BX, paint, flatc, OAK, IR, WOOD, IRONC }, SHUT); c.albedo(null); c.color(null); c.emissive(null); return; }
  if (lod > 2) return;
  // ---- interiors ----
  // great hall: dais and the reeve's chair, the long table, braziers, banners, a red runner
  paint(c, FS, "oklch(0.7 0.02 80)"); BX(c, -4.5, F, -D + T / 2, 4.5, F + 0.4, -D + 2.6);
  paint(c, OAK, "oklch(0.7 0.04 50)"); BX(c, -0.7, F + 0.4, -D + 0.6, 0.7, F + 0.95, -D + 1.6); BX(c, -0.7, F + 0.95, -D + 0.6, 0.7, F + 3.0, -D + 0.85);
  flatc(c, NAVY); BX(c, -0.55, F + 0.96, -D + 0.85, 0.55, F + 1.02, -D + 1.55); flatc(c, GOLD); for (const dx of [-0.45, 0, 0.45]) BX(c, dx - 0.07, F + 3.0, -D + 0.6, dx + 0.07, F + 3.4, -D + 0.85);
  flatc(c, RED); BX(c, -0.8, F + 0.005, -D + 2.6, 0.8, F + 0.02, D - T / 2);
  table(c, -1.1, -3, 1.1, 4); bench(c, -2, -3, -1.6, 4); bench(c, 1.6, -3, 2, 4);
  brazier(c, -3.8, -D + 3.2); brazier(c, 3.8, -D + 3.2);
  banner(c, -2.6, F + 4.4, -D + T / 2, 1); banner(c, 2.6, F + 4.4, -D + T / 2, 1);
  // office (west front): desk, chair, shelves of ledgers
  table(c, -10.5, 3.5, -7.5, 5); paint(c, OAK, WOOD); BX(c, -9.4, F, 5.6, -8.6, F + 0.45, 6.4); BX(c, -9.4, F + 0.45, 6.3, -8.6, F + 1.3, 6.4);
  paint(c, OAK, WOOD); BX(c, -W + T / 2, F, 1, -W + T / 2 + 0.5, F + 2.6, 5); flatc(c, "oklch(0.45 0.08 40)"); for (let i = 0; i < 4; i++) BX(c, -W + T / 2 + 0.05, F + 0.3 + i * 0.6, 1.1, -W + T / 2 + 0.45, F + 0.75 + i * 0.6, 4.9);
  flatc(c, "oklch(0.92 0.02 85)"); BX(c, -9.8, F + 0.8, 4, -9.2, F + 0.82, 4.5);
  // armoury (west back): racks and a target dummy post
  rack(c, -8.5, -D + T / 2, 1); rack(c, -W + T / 2 + 0.2, -4, 1); chest(c, -6.2, -1); chest(c, -6.2, -2.2);
  // barracks (east front): bunks and a footlocker each
  for (const x of [6.5, 8.5, 10.5]) { bunk(c, x, 5.5); chest(c, x, 3.6); }
  table(c, 7.5, 1, 10, 2.2);
  // strongroom (east back): an iron grille, chests and a coin table
  paint(c, IR, IRONC); for (let z = -D + T / 2; z < -0.5; z += 0.3) BX(c, 8.5 - 0.03, F, z, 8.5 + 0.03, G, z + 0.06); BX(c, 8.45, F + 2.2, -D + T / 2, 8.55, F + 2.3, -0.5);
  chest(c, 10, -6.5); chest(c, 10.6, -4.5); chest(c, 10, -2.5); table(c, 6, -6.5, 7.6, -5); flatc(c, GOLD); for (let i = 0; i < 5; i++) BX(c, 6.4 + i * 0.2, F + 0.8, -5.9, 6.5 + i * 0.2, F + 0.8 + 0.04 * (i + 1), -5.8);
  c.albedo(null); c.color(null); c.emissive(null);
}
export function collider(c) {
  const box = (x0, y0, z0, x1, y1, z1) => ({ kind: "box", width: x1 - x0, height: y1 - y0, depth: z1 - z0, center: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2] });
  const out = walls().map(b => box(...b));
  out.push(box(-W - 0.4, -5, -D - 0.4, W + 0.4, F, D + 0.4), box(-2, -5, D + 0.4, 2, F - 0.15, D + 1.4), box(-2, -5, D + 1.4, 2, F - 0.3, D + 2.2));
  out.push(box(-W - 0.6, G, -D - 0.6, W + 0.6, 16, D + 0.6)); // the upper storey and roof, solid
  out.push(box(-W - 2, -5, -D - 2, -W + 4, 20, -D + 4)); // tower
  if (c.params?.closed) { out.push(shutCollider(box, SHUT)); return out; }
  out.push(box(-4.5, F, -D, 4.5, F + 0.4, -D + 2.6)); // dais
  out.push(box(-1.1, F, -3, 1.1, F + 0.8, 4)); // long table
  out.push(box(8.45, F, -D, 8.55, G, -0.5)); // strongroom grille
  return out;
}
const bench = bench_crownHall({ BX, F, OAK, WOOD, paint });
const banner = banner_crownHall({ BX, GOLD, HX, IR, IRONC, NAVY, flatc, paint });
const table = table_crownHall({ BX, F, OAK, WOOD, paint });
const rack = rack_crownHall({ BX, F, IR, OAK, WOOD, paint });
const brazier = brazier_crownHall({ BX, F, IR, IRONC, paint });
