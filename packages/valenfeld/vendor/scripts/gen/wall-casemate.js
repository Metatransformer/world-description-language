import BK from "../lib/data/building-kit.json";
import { BXR, HX, flatc, paint } from "../lib/buildkit.js";   // the shared building toolkit
// A WALL CASEMATE: the town wall's own guard barracks, a vaulted stone room built against the wall's inner face.
// Local frame: the wall face is z = 0, the room runs into town along +z (0..4.2), x -7..7. Its flat roof is the
// wall's inner walk extended, at y = params.top (the wall-walk rail height above this ground). A stone stair runs
// up the outside of the -x end (x -13.2..-7.2, z 0.2..1.6), climbing toward the room, onto the roof, then the walk.
// Door: +z face at x = 3. Inside: four bunks, a weapon rack, a table with dice, a brazier, a barrel.
const { fieldstone: FS, oak: OAK, iron: IR, hay: HAY, flagstone: FLAG } = BK.textures;
const { stone: STONE, wood: WOOD, iron: IRONC } = BK.tints;
let X0 = -7, X1 = 7, DX = 3, WINS = [-4.5, -1];
const Z1 = 4.2, T = 0.45, DW = 0.7, DH = 2.4;
// params.hx: half the room's length along the wall (default 7); the door sits 4 m in from the +x end
function size(c) { const hx = c.params?.hx ?? 7; X0 = -hx; X1 = hx; DX = hx - 4; WINS = [X0 + 2.5, X0 + 6].filter((x) => x < DX - DW - 0.5); }
const BX = BXR;
const top = (c) => (size(c), c.params?.top ?? 5.4);
function steps(TOP) { const n = Math.ceil(TOP / 0.27), rise = TOP / n, run = 6 / n, out = []; for (let i = 0; i < n; i++) out.push([X0 - 6.2 + i * run, -3, 0.2, X0 - 6.2 + (i + 1) * run + 0.02, rise * (i + 1), 1.6]); return out; }
function walls(TOP) { const H = TOP - 0.35; return [
  [X0, 0, 0, X0 + T, H, Z1], [X1 - T, 0, 0, X1, H, Z1],
  [X0, 0, Z1 - T, DX - DW, H, Z1], [DX + DW, 0, Z1 - T, X1, H, Z1], [DX - DW, DH, Z1 - T, DX + DW, H, Z1],
]; }
export function geometry(c) { const TOP = top(c), H = TOP - 0.35, lod = c.lod ?? 1;
  paint(c, FS, STONE); BX(c, X0 - 0.2, -3, -0.1, X1 + 0.2, 0, Z1 + 0.2);
  for (const b of walls(TOP)) BX(c, ...b);
  BX(c, X0 - 0.1, H, -0.1, X1 + 0.1, TOP, Z1 + 0.1);                       // roof slab = walk
  if (lod <= 2) { for (let x = X0 + 0.2; x < X1; x += 1.6) BX(c, x, TOP, Z1 - 0.5, x + 0.8, TOP + 0.9, Z1 + 0.1); BX(c, X0, TOP, Z1 - 0.5, X1, TOP + 0.35, Z1 + 0.1); }   // parapet to the town side
  for (const s of steps(TOP)) BX(c, ...s);
  if (lod <= 2) { BX(c, X0 - 6.2, 0, 1.6, X0 + 0.1, 0.0001, 1.75); for (let i = 0; i < 6; i++) { const x = X0 - 6 + i, y = TOP * (i + 1) / 6.2; BX(c, x, y, 1.55, x + 0.2, y + 0.9, 1.75); } } // a low stepped kerb on the open side
  // windows: two barred slits to the street, and lamplight in them
  flatc(c, "oklch(0.7 0.1 70)"); c.emissive(1.3, 0.7, 0.25); for (const x of WINS) BX(c, x - 0.25, 1.5, Z1 + 0.01, x + 0.25, 2.3, Z1 + 0.03); c.emissive(null);
  paint(c, IR, IRONC); for (const x of WINS) for (const d of [-0.12, 0, 0.12]) BX(c, x + d - 0.02, 1.5, Z1 + 0.03, x + d + 0.02, 2.3, Z1 + 0.06);
  // the door: iron-studded oak, stood open
  paint(c, OAK, WOOD); BX(c, DX + DW - 0.08, 0, Z1 - T - 1.3, DX + DW, DH, Z1 - T); BX(c, DX - DW - 0.15, DH, Z1, DX + DW + 0.15, DH + 0.2, Z1 + 0.15);
  // a lamp by the door and a Crown shield over it
  flatc(c, "oklch(0.9 0.1 80)"); c.emissive(3, 1.5, 0.45); BX(c, DX + 1.1, 2.0, Z1 + 0.05, DX + 1.35, 2.35, Z1 + 0.3); c.emissive(null);
  flatc(c, "#2f3d52"); BX(c, DX - 0.4, DH + 0.35, Z1 + 0.02, DX + 0.4, DH + 1.15, Z1 + 0.08); flatc(c, "#c9a45a"); BX(c, DX - 0.25, DH + 0.65, Z1 + 0.08, DX + 0.25, DH + 0.8, Z1 + 0.1); BX(c, DX - 0.07, DH + 0.45, Z1 + 0.08, DX + 0.07, DH + 1.0, Z1 + 0.1);
  if (lod > 2) { c.albedo(null); c.color(null); return; }
  // ---- inside ----
  paint(c, FLAG, STONE); BX(c, X0 + T, 0, 0, X1 - T, 0.02, Z1 - T);
  paint(c, OAK, "oklch(0.45 0.03 50)"); for (let x = X0 + 1.2; x < X1; x += 1.8) BX(c, x - 0.12, H - 0.3, 0, x + 0.12, H, Z1 - T);
  // bunks against the wall face, two tiers
  for (const bx0 of [X0 + T + 0.1, X0 + T + 2.2]) { paint(c, OAK, WOOD); for (const [dx, dz] of [[0, 0.1], [1.9, 0.1], [0, 1.0], [1.9, 1.0]]) BX(c, bx0 + dx, 0, dz, bx0 + dx + 0.1, 1.9, dz + 0.1);
    for (const y of [0.4, 1.4]) { BX(c, bx0, y, 0.1, bx0 + 2, y + 0.08, 1.1); paint(c, HAY, "oklch(0.75 0.06 85)"); BX(c, bx0 + 0.05, y + 0.08, 0.15, bx0 + 1.95, y + 0.2, 1.05); flatc(c, "oklch(0.45 0.08 30)"); BX(c, bx0 + 0.9, y + 0.2, 0.15, bx0 + 1.95, y + 0.24, 1.05); paint(c, OAK, WOOD); } }
  // table, two stools, dice and a jug
  paint(c, OAK, WOOD); { const tx = X1 - 6.4; BX(c, tx, 0.75, 1.2, tx + 1.8, 0.82, 2.2); for (const [x, z] of [[0.1, 1.3], [1.6, 1.3], [0.1, 2.0], [1.6, 2.0]]) BX(c, tx + x, 0, z, tx + x + 0.1, 0.75, z + 0.1);
  for (const x of [-0.5, 2.3]) BX(c, tx + x - 0.2, 0, 1.5, tx + x + 0.2, 0.45, 1.9);
  flatc(c, "oklch(0.92 0.02 90)"); BX(c, tx + 0.7, 0.82, 1.6, tx + 0.76, 0.88, 1.66); BX(c, tx + 0.85, 0.82, 1.7, tx + 0.91, 0.88, 1.76); flatc(c, "oklch(0.6 0.08 50)"); BX(c, tx + 1.3, 0.82, 1.5, tx + 1.45, 1.05, 1.65); }
  // weapon rack at the east end, a barrel, a brazier
  paint(c, OAK, WOOD); BX(c, X1 - T - 0.3, 0, 0.4, X1 - T - 0.2, 1.8, 2.8); BX(c, X1 - T - 0.5, 1.2, 0.4, X1 - T - 0.2, 1.3, 2.8);
  paint(c, IR, "oklch(0.75 0.01 250)"); for (let z = 0.6; z < 2.7; z += 0.35) BX(c, X1 - T - 0.45, 0.1, z - 0.015, X1 - T - 0.38, 2.2, z + 0.015);
  paint(c, OAK, "oklch(0.6 0.05 55)"); BX(c, X1 - T - 0.8, 0, Z1 - T - 0.8, X1 - T - 0.1, 0.9, Z1 - T - 0.1);
  paint(c, IR, IRONC); const bz = X0 + 1.2; BX(c, bz - 0.1, 0, 2.8, bz + 0.1, 0.7, 3.0); BX(c, bz - 0.35, 0.7, 2.55, bz + 0.35, 0.85, 3.25);
  c.albedo(null); c.color("oklch(0.85 0.15 55)"); c.emissive(4, 1.7, 0.35); BX(c, bz - 0.25, 0.85, 2.65, bz + 0.25, 0.95, 3.15); c.emissive(null);
  c.albedo(null); c.color(null);
}
export function collider(c) { const TOP = top(c), H = TOP - 0.35;
  const box = (x0, y0, z0, x1, y1, z1) => ({ kind: "box", width: x1 - x0, height: y1 - y0, depth: z1 - z0, center: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2] });
  const out = walls(TOP).map(b => box(...b));
  out.push(box(X0 - 0.2, -3, -0.1, X1 + 0.2, 0, Z1 + 0.2), box(X0 - 0.1, H, -0.1, X1 + 0.1, TOP, Z1 + 0.1), box(X0, TOP, Z1 - 0.5, X1, TOP + 0.9, Z1 + 0.1));
  for (const s of steps(TOP)) out.push(box(...s));
  out.push(box(X0 + T + 0.1, 0, 0.1, X0 + T + 4.2, 1.9, 1.1), box(X1 - 6.4, 0, 1.2, X1 - 4.6, 0.82, 2.2), box(X1 - T - 0.8, 0, 0.4, X1 - T, 1.8, Z1 - T - 0.1));
  return out;
}
