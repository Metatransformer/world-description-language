import BK from "../lib/data/building-kit.json";
import { shutDoor, shutCollider } from "../lib/pieces/shutdoor.js";   // shared closed door: params.closed swaps the walk-in rooms for a portal interior
import { table_tavern } from "../lib/pieces/table.js";   // shared table piece, drawn in this building's palette
import { BXR, HX, flatc, paint } from "../lib/buildkit.js";   // the shared building toolkit
// A walk-in tavern in Valenfeld's second style: ox-blood timber frame over a low fieldstone sill, a deep straw-gold
// thatch with a rolled ridge, a bay window and a hanging sign bracket. 14 x 10 m, one storey + loft. Door on +z (x = -3).
// Inside: a bar counter along the back with kegs and bottle shelves, a stone hearth on the west wall, four tables,
// lamps on the posts. params.wall (plaster tint), params.frame (timber tint), params.thatch.
const { fieldstone: FS, oak: OAK, plaster: PL, slate: SL, iron: IR, hay: HAY } = BK.textures;
const { stone: STONE, wood: WOOD, white: WHITE, iron: IRONC } = BK.tints;
const W = 7, D = 5, T = 0.35, H = 3.6, F = 0.25;
const BX = BXR;
function LA(c, cx, y0, cz, prof, n = 10) { const P = (i, k) => { const a = (k % n) / n * Math.PI * 2; return [cx + prof[i][0] * Math.cos(a), y0 + prof[i][1], cz + prof[i][0] * Math.sin(a)]; };
  for (let i = 0; i < prof.length - 1; i++) for (let k = 0; k < n; k++) c.quad(...P(i, k + 1), ...P(i, k), ...P(i + 1, k), ...P(i + 1, k + 1)); }
const DOOR = [-3, 1.5, 2.6];
const SHUT = { x0: DOOR[0] - DOOR[1] / 2, x1: DOOR[0] + DOOR[1] / 2, y0: F, y1: F + DOOR[2], zOut: D, s: 1 };
export function walls() { const y0 = F, y1 = H, out = [];
  const [dx, dw, dh] = DOOR;
  out.push([-W, y0, D - T, dx - dw / 2, y1, D], [dx + dw / 2, y0, D - T, W, y1, D], [dx - dw / 2, y0 + dh, D - T, dx + dw / 2, y1, D]);
  out.push([-W, y0, -D, W, y1, -D + T], [-W, y0, -D, -W + T, y1, D], [W - T, y0, -D, W, y1, D]);
  return out; }
function lamp(c, x, y, z) { paint(c, IR, IRONC); BX(c, x - 0.12, y, z - 0.12, x + 0.12, y + 0.05, z + 0.12); c.albedo(null); c.color("oklch(0.9 0.1 80)"); c.emissive(3, 1.5, 0.45); BX(c, x - 0.09, y + 0.05, z - 0.09, x + 0.09, y + 0.32, z + 0.09); c.emissive(null); paint(c, IR, IRONC); BX(c, x - 0.13, y + 0.32, z - 0.13, x + 0.13, y + 0.38, z + 0.13); }
function keg(c, x, y, z) { paint(c, OAK, "oklch(0.7 0.05 55)"); LA(c, x, y, z, [[0.3, 0], [0.38, 0.35], [0.3, 0.7], [0.01, 0.7]], 10); paint(c, IR, IRONC); LA(c, x, y + 0.12, z, [[0.35, 0], [0.35, 0.05]], 10); LA(c, x, y + 0.53, z, [[0.35, 0], [0.35, 0.05]], 10); }
export function geometry(c) { const p = c.params ?? {}, lod = c.lod ?? 1;
  const WALL = p.wall ?? "oklch(0.9 0.04 70)", FRAME = p.frame ?? "oklch(0.42 0.1 25)", THATCH = p.thatch ?? "oklch(0.82 0.08 85)";
  // sill and floor
  paint(c, FS, STONE); BX(c, -W - 0.2, -3, -D - 0.2, W + 0.2, F, D + 0.2); BX(c, DOOR[0] - 1, -3, D + 0.2, DOOR[0] + 1, F - 0.12, D + 0.9);
  paint(c, OAK, "oklch(0.75 0.03 60)"); BX(c, -W + T, F, -D + T, W - T, F + 0.02, D - T);
  // walls: plaster panels, a stone knee-wall outside
  paint(c, PL, WALL); for (const b of walls()) BX(c, ...b);
  paint(c, FS, STONE); for (const b of walls()) { const [x0, y0, z0, x1, , z1] = b; if (y0 > F + 0.1) continue; BX(c, x0 - 0.05 * (x0 <= -W + 0.01), y0, z0 - 0.05 * (z0 <= -D + 0.01), x1 + 0.05 * (x1 >= W - 0.01), 1.0, z1 + 0.05 * (z1 >= D - 0.01)); }
  // ox-blood timbers: posts, rails, braces on the outer faces
  if (lod <= 3) { paint(c, OAK, FRAME);
    for (const z of [D + 0.01, -D - 0.06]) { for (let x = -W; x <= W + 0.01; x += 2) if (Math.abs(x - DOOR[0]) > 0.9 || z < 0) BX(c, x - 0.1, F, z, x + 0.1, H, z + 0.06); BX(c, -W, H - 0.2, z, W, H, z + 0.06); BX(c, -W, 1.0, z, W, 1.15, z + 0.06);
      for (let x = -W; x < W - 0.1; x += 4) { const a = [x + 0.1, 1.15], b = [x + 1.9, H - 0.2]; const t = 0.09; HX(c, [[a[0], a[1], z], [a[0] + t * 2, a[1], z], [a[0] + t * 2, a[1], z + 0.06], [a[0], a[1], z + 0.06], [b[0] - t * 2, b[1], z], [b[0], b[1], z], [b[0], b[1], z + 0.06], [b[0] - t * 2, b[1], z + 0.06]]); } }
    for (const x of [W + 0.01, -W - 0.06]) { for (let z = -D; z <= D + 0.01; z += 2.5) BX(c, x, F, z - 0.1, x + 0.06, H, z + 0.1); BX(c, x, H - 0.2, -D, x + 0.06, H, D); } }
  // windows: warm panes, and a bay window east of the door
  c.albedo(null); c.color("oklch(0.72 0.09 70)"); c.emissive(1.5, 0.8, 0.3);
  for (const x of [-5.5, 3, 5.3]) BX(c, x - 0.55, 1.4, -D - 0.08, x + 0.55, 2.7, -D - 0.02);
  for (const z of [-2.5, 2.5]) { BX(c, W + 0.02, 1.4, z - 0.55, W + 0.08, 2.7, z + 0.55); }
  BX(c, -5.5 - 0.55, 1.4, D + 0.02, -5.5 + 0.55, 2.7, D + 0.08);
  c.emissive(null); paint(c, OAK, FRAME); BX(c, 0.5, 0.9, D, 4.5, 1.15, D + 0.8); BX(c, 0.5, 2.9, D, 4.5, 3.1, D + 0.8);
  c.albedo(null); c.color("oklch(0.72 0.09 70)"); c.emissive(1.6, 0.85, 0.32); BX(c, 0.6, 1.15, D + 0.7, 4.4, 2.9, D + 0.76); c.emissive(null);
  paint(c, OAK, FRAME); for (const x of [0.55, 1.8, 3.2, 4.45]) BX(c, x - 0.06, 1.15, D + 0.66, x + 0.06, 2.9, D + 0.8);
  // thatch: deep, steep, eaves overhanging 0.9 m, rolled ridge
  paint(c, HAY, THATCH); const ye = H - 0.1, yr = H + 4.2, o = 0.9, th = 0.45;
  HX(c, [[-W - o, ye - 0.4, -D - o], [W + o, ye - 0.4, -D - o], [W + o, yr, 0], [-W - o, yr, 0], [-W - o, ye - 0.4 + th, -D - o], [W + o, ye - 0.4 + th, -D - o], [W + o, yr + th, 0], [-W - o, yr + th, 0]]);
  HX(c, [[-W - o, yr, 0], [W + o, yr, 0], [W + o, ye - 0.4, D + o], [-W - o, ye - 0.4, D + o], [-W - o, yr + th, 0], [W + o, yr + th, 0], [W + o, ye - 0.4 + th, D + o], [-W - o, ye - 0.4 + th, D + o]]);
  BX(c, -W - o, yr + 0.15, -0.35, W + o, yr + 0.75, 0.35);
  paint(c, PL, WALL); for (const x of [-W, W]) HX(c, [[x - 0.1, H, -D], [x + 0.1, H, -D], [x + 0.1, H, D], [x - 0.1, H, D], [x - 0.1, yr, 0], [x + 0.1, yr, 0], [x + 0.1, yr, 0], [x - 0.1, yr, 0]]);
  // chimney over the hearth, west
  paint(c, FS, STONE); BX(c, -W - 0.6, -3, -1.2, -W + 0.6, yr + 1.4, 1.2);
  // the hanging sign bracket by the door, a foaming tankard on the board
  paint(c, IR, IRONC); BX(c, DOOR[0] - 1.1, 3.0, D, DOOR[0] - 1.0, 3.1, D + 1.4);
  paint(c, OAK, "oklch(0.6 0.06 60)"); BX(c, DOOR[0] - 1.13, 1.95, D + 0.45, DOOR[0] - 0.97, 2.95, D + 1.35);
  flatc(c, "oklch(0.8 0.13 80)"); for (const s of [-1, 1]) BX(c, DOOR[0] - 1.05 + s * 0.09, 2.2, D + 0.7, DOOR[0] - 1.05 + s * 0.1, 2.65, D + 1.05); flatc(c, "oklch(0.95 0.02 90)"); for (const s of [-1, 1]) BX(c, DOOR[0] - 1.05 + s * 0.1, 2.62, D + 0.68, DOOR[0] - 1.05 + s * 0.11, 2.75, D + 1.07);
  lamp(c, DOOR[0] + 1.1, 2.4, D + 0.15);
  if (p.closed) { shutDoor(c, { BX, paint, flatc, OAK, IR, WOOD, IRONC }, SHUT); c.albedo(null); c.color(null); c.emissive(null); return; }
  if (lod > 2) { c.albedo(null); c.color(null); return; }
  // ---- inside ----
  // ceiling beams and loft floor
  paint(c, OAK, "oklch(0.55 0.04 50)"); for (let x = -W + 1; x < W; x += 2) BX(c, x - 0.12, H - 0.3, -D, x + 0.12, H - 0.05, D);
  paint(c, OAK, WOOD); BX(c, -W, H - 0.05, -D, W, H + 0.05, D);
  // hearth
  paint(c, FS, STONE); BX(c, -W + T, F, -1.3, -W + T + 0.8, H - 0.3, 1.3); flatc(c, "oklch(0.15 0.01 40)"); BX(c, -W + T + 0.79, F + 0.2, -0.7, -W + T + 0.82, 1.3, 0.7);
  c.albedo(null); c.color("oklch(0.85 0.15 55)"); c.emissive(5, 2, 0.4); BX(c, -W + T + 0.4, F + 0.2, -0.45, -W + T + 0.78, F + 0.45, 0.45); c.emissive(null);
  // the bar: counter along the back, kegs on a rack, bottle shelves
  paint(c, OAK, "oklch(0.6 0.05 45)"); BX(c, -1.5, F, -D + 1.6, 5.5, F + 1.05, -D + 2.2); paint(c, OAK, WOOD); BX(c, -1.6, F + 1.05, -D + 1.5, 5.6, F + 1.12, -D + 2.3);
  for (let i = 0; i < 4; i++) keg(c, -0.6 + i * 1.1, F + 0.6, -D + T + 0.45);
  paint(c, OAK, WOOD); BX(c, -1.2, F, -D + T, 4, F + 0.6, -D + T + 0.9);
  for (const y of [1.9, 2.5]) { BX(c, 4.2, F + y, -D + T, 6.4, F + y + 0.05, -D + T + 0.3); for (let i = 0; i < 7; i++) { flatc(c, ["oklch(0.4 0.1 150)", "oklch(0.45 0.1 30)", "oklch(0.55 0.08 80)"][i % 3]); LA(c, 4.35 + i * 0.3, F + y + 0.05, -D + T + 0.15, [[0.07, 0], [0.07, 0.22], [0.03, 0.3], [0.025, 0.36]], 6); } paint(c, OAK, WOOD); }
  for (const x of [-0.5, 1.5, 3.5]) LA(c, x, F, -D + 2.9, [[0.06, 0], [0.06, 0.75], [0.2, 0.75], [0.2, 0.8], [0.01, 0.8]], 8);
  table(c, -3.8, -1.8); table(c, -3.8, 2.2); table(c, 1.2, 0.8); table(c, 4.5, 2.4);
  for (const [x, z] of [[-2, 0], [3, -0.5], [-5.6, -3.5]]) lamp(c, x, H - 0.75, z);
  // a rug before the hearth
  flatc(c, "oklch(0.45 0.12 30)"); BX(c, -W + 1.3, F + 0.02, -1.2, -W + 2.6, F + 0.035, 1.2);
  c.albedo(null); c.color(null); c.emissive(null);
}
export function collider(c) {
  const box = (x0, y0, z0, x1, y1, z1) => ({ kind: "box", width: x1 - x0, height: y1 - y0, depth: z1 - z0, center: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2] });
  const out = walls().map(b => box(...b));
  out.push(box(-W - 0.2, -3, -D - 0.2, W + 0.2, F, D + 0.2), box(DOOR[0] - 1, -3, D + 0.2, DOOR[0] + 1, F - 0.12, D + 0.9));
  out.push(box(-W - 1, H - 0.05, -D - 1, W + 1, H + 4.5, D + 1));
  if (c.params?.closed) { out.push(shutCollider(box, SHUT), box(0.5, F, D, 4.5, 3.1, D + 0.8)); return out; }
  out.push(box(-1.6, F, -D + 1.5, 5.6, F + 1.12, -D + 2.3), box(-W + T, F, -1.3, -W + T + 0.8, H, 1.3), box(0.5, F, D, 4.5, 3.1, D + 0.8));
  for (const [x, z] of [[-3.8, -1.8], [-3.8, 2.2], [1.2, 0.8], [4.5, 2.4]]) out.push(box(x - 0.7, F, z - 0.7, x + 0.7, F + 0.78, z + 0.7));
  return out;
}
const table = table_tavern({ F, LA, OAK, WOOD, flatc, paint });
