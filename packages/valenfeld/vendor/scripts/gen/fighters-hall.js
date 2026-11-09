import { grown, growBoxes } from "../lib/roomy.js";
// The Fighters Guild of Valenfeld, inside: a timber-roofed TRAINING HALL (18 x 14.6 m, eaves 7, ridge 9.8) on sand,
// with a rope-post sparring ring, racks, banners and two iron chandeliers; four wings off its long walls:
// west: BARRACKS (north) and ARMORY (south); east: MESS HALL (north, hearth on the east wall) and BRANNOC'S QUARTERS (south).
// Local origin = world origin of place fighters-guild, floor top y 0.12, north -z. The exit door stands in the south wall at x 0.
// One layout drives both the mesh (geometry) and the shell (collider): furniture names its own bump boxes via furnkit.
import { FS, OAK, PL, IR, FLAG, HAY, WOOD, WHITE, IRONC, STONE, paint, flatc, glow, BX, RB, HX, SEG, ROPE, PIPE, CY, LA, BARREL } from "../lib/buildkit.js";
import { forgeGear } from "../lib/pieces/forge.js";   // shared forge gear (Hroald's smithy uses the same pieces)
import { XF, SOLIDS, SB, bunk, bed, chest, table, bench, stool, chair, rack, shield, banner, boarHead, cauldron, tankard, bowl, candle, bucket, lantern, chandelier, sconce, grindstone, armorStand, sock, shirt, sword, spear,
  WOOLR, WOOLG, LEATH, SAND, RED, IRON, LINEN, PAPER, GOLD } from "../lib/furnkit.js";
const BOARDS = "cdn/texture-oak-floorboards-worn.png";
const F = 0.12, HW = 3.6, HH = 7, HR = 9.8, T = 0.5;
export const ROOMS = { hall: [-9, 9, -9, 5.6], barracks: [-17, -9, -9, -1], armory: [-17, -9, -1, 5.6], mess: [9, 17, -9, 0], quarters: [9, 17, 0, 5.6] };
const DOORS = { west: [[-5.65, -4.35, 2.4], [1.65, 2.95, 2.4]], east: [[-5.65, -4.35, 2.4], [1.65, 2.95, 2.4]], south: [[-0.85, 0.85, 2.5]] };

function slab(c, ax, f, t, lo, hi, ya, yb) { if (hi - lo < 1e-3 || yb - ya < 1e-3) return;
  if (ax === "x") BX(c, lo, ya, f - t / 2, hi, yb, f + t / 2); else BX(c, f - t / 2, ya, lo, f + t / 2, yb, hi); }
function solid(c, ax, f, t, lo, hi, ya, yb) { if (!c.solid || hi - lo < 1e-3) return;
  if (ax === "x") c.solid(lo, ya, f - t / 2, hi, yb, f + t / 2); else c.solid(f - t / 2, ya, lo, f + t / 2, yb, hi); }
function cut(c, ax, f, t, a0, a1, ya, yb, holes, isSolid) { const put = isSolid ? solid : slab; let a = a0;
  for (const [h0, h1, hy] of [...holes].sort((p, q) => p[0] - q[0])) { if (ya < hy) put(c, ax, f, t, a, h0, ya, yb); if (hy < yb) put(c, ax, f, t, h0, h1, Math.max(ya, hy), yb); a = h1; }
  put(c, ax, f, t, a, a1, ya, yb); }
// a wall: lime plaster core, fieldstone plinth, oak top plate, oak door frames; holes = [[from, to, top]]
function wall(c, ax, f, a0, a1, y1, holes = [], stoneH = 1.1) {
  paint(c, PL, WHITE); cut(c, ax, f, T, a0, a1, 0, y1, holes);
  paint(c, FS, STONE); cut(c, ax, f, T + 0.1, a0, a1, 0, F + stoneH, holes);
  paint(c, OAK, WOOD); cut(c, ax, f, T + 0.12, a0, a1, y1 - 0.28, y1, holes);
  if (c.lod <= 3) cut(c, ax, f, T + 0.13, a0, a1, F + stoneH, F + stoneH + 0.1, holes);
  for (const [h0, h1, hy] of holes) { slab(c, ax, f, T + 0.16, h0 - 0.16, h0, 0, hy + 0.2); slab(c, ax, f, T + 0.16, h1, h1 + 0.16, 0, hy + 0.2); slab(c, ax, f, T + 0.2, h0 - 0.26, h1 + 0.26, hy, hy + 0.24);
    paint(c, IR, IRONC); slab(c, ax, f, T + 0.22, (h0 + h1) / 2 - 0.12, (h0 + h1) / 2 + 0.12, hy + 0.02, hy + 0.22); paint(c, OAK, WOOD); }
  cut(c, ax, f, T, a0, a1, 0, y1, holes, true); }
const W = (c, x, z, yaw = 0, y = 0) => XF(c, x, z, yaw, y);

function shell(c) {
  // floors: flagstone hall, oak boards in the wings, a sand training floor in an oak kerb
  paint(c, FLAG, STONE); BX(c, -9, -0.3, -9, 9, F, 5.6);
  paint(c, BOARDS, WOOD); BX(c, -17, -0.3, -9, -9, F, 5.6); BX(c, 9, -0.3, -9, 17, F, 5.6);
  // creator Nov 6: the great hall is a longhouse (living quarters, the feast tables, the fire): sand only under the sparring corner
  paint(c, SAND, "oklch(0.97 0.02 80)"); BX(c, 1.9, F, -8.6, 7.5, F + 0.012, 0.9);
  paint(c, OAK, WOOD); BX(c, 1.75, F, -8.75, 7.65, F + 0.03, -8.6); BX(c, 1.75, F, 0.9, 7.65, F + 0.03, 1.05); BX(c, 1.75, F, -8.6, 1.9, F + 0.03, 0.9); BX(c, 7.5, F, -8.6, 7.65, F + 0.03, 0.9);
  c.solid?.(-17.3, -0.3, -9.3, 17.3, F, 5.9);
  // hall walls (eaves 7), wing walls (3.8), the inner long walls with two doorways each
  wall(c, "x", 5.6, -9.25, 9.25, HH, DOORS.south, 2.4); wall(c, "x", -9, -9.25, 9.25, HH, [], 2.4);
  wall(c, "z", -9, -9.25, 5.85, HH, DOORS.west, 2.4); wall(c, "z", 9, -9.25, 5.85, HH, DOORS.east, 2.4);
  for (const [a, b] of [[-17.25, -9], [9, 17.25]]) { wall(c, "x", 5.6, a, b, HW + 0.2); wall(c, "x", -9, a, b, HW + 0.2); }
  wall(c, "z", -17, -9.25, 5.85, HW + 0.2); wall(c, "z", 17, -9.25, 5.85, HW + 0.2);
  wall(c, "x", -1, -17, -9, HW); wall(c, "x", 0, 9, 17, HW);
  // wing ceilings: oak boards on joists
  paint(c, OAK, "oklch(0.8 0.02 70)"); for (const [a, b] of [[-17, -9], [9, 17]]) { BX(c, a, HW, -9, b, HW + 0.2, 5.6); c.solid?.(a, HW, -9, b, HW + 0.2, 5.6);
    if (c.lod <= 3) for (let z = -8.1; z < 5.2; z += 1.35) BX(c, a + 0.25, HW - 0.22, z - 0.09, b - 0.25, HW, z + 0.09); }
  // hall gables, roof planes, rafters, three trusses on oak posts
  paint(c, PL, WHITE); for (const f of [-9, 5.6]) HX(c, [[-9.25, HH, f - 0.25], [9.25, HH, f - 0.25], [9.25, HH, f + 0.25], [-9.25, HH, f + 0.25], [0, HR, f - 0.25], [0, HR, f - 0.25], [0, HR, f + 0.25], [0, HR, f + 0.25]]);
  paint(c, OAK, "oklch(0.75 0.02 70)");
  HX(c, [[-9.7, HH - 0.12, -9.5], [0, HR, -9.5], [0, HR, 6.1], [-9.7, HH - 0.12, 6.1], [-9.7, HH + 0.13, -9.5], [0, HR + 0.25, -9.5], [0, HR + 0.25, 6.1], [-9.7, HH + 0.13, 6.1]]);
  HX(c, [[0, HR, -9.5], [9.7, HH - 0.12, -9.5], [9.7, HH - 0.12, 6.1], [0, HR, 6.1], [0, HR + 0.25, -9.5], [9.7, HH + 0.13, -9.5], [9.7, HH + 0.13, 6.1], [0, HR + 0.25, 6.1]]);
  paint(c, OAK, WOOD); BX(c, -0.15, HR - 0.3, -8.75, 0.15, HR, 5.35);
  if (c.lod <= 3) for (let z = -8.2; z < 5.2; z += 1.6) for (const s of [-1, 1]) SEG(c, [s * 8.75, HH - 0.05, z], [0, HR - 0.15, z], 0.16, 0.2);
  for (const z of [-7, -1.5, 4]) { BX(c, -8.75, 6.4, z - 0.18, 8.75, 6.78, z + 0.18); BX(c, -0.14, 6.78, z - 0.14, 0.14, HR - 0.2, z + 0.14);
    for (const s of [-1, 1]) { SEG(c, [0, 8.6, z], [s * 4.4, 6.78, z], 0.2, 0.2); SEG(c, [s * 7.9, 5.3, z], [s * 6.5, 6.42, z], 0.2, 0.2);
      paint(c, FS, STONE); BX(c, s * 7.9 - 0.3, 0, z - 0.3, s * 7.9 + 0.3, F + 0.4, z + 0.3); paint(c, OAK, WOOD); BX(c, s * 7.9 - 0.19, F + 0.4, z - 0.19, s * 7.9 + 0.19, 6.42, z + 0.19);
      c.solid?.(s * 7.9 - 0.3, 0, z - 0.3, s * 7.9 + 0.3, 6.4, z + 0.3);
      if (c.lod <= 3) { paint(c, IR, IRONC); for (const y of [1.4, 4.6]) BX(c, s * 7.9 - 0.21, y, z - 0.21, s * 7.9 + 0.21, y + 0.1, z + 0.21); }
      sconce(W(c, s * 7.9 - s * 0.19, z, s < 0 ? -90 : 90), 2.3); paint(c, OAK, WOOD); } }
}

function hall(c) {
  // the sparring ring: eight posts, two courses of rope, a scuffed darker floor
  const R = [2.4, 7.0, -8.0, -3.8], posts = [];
  paint(c, SAND, "oklch(0.82 0.03 70)"); BX(c, R[0], F + 0.012, R[2], R[1], F + 0.02, R[3]);
  for (const x of [R[0], (R[0] + R[1]) / 2, R[1]]) for (const z of [R[2], (R[2] + R[3]) / 2, R[3]]) if (!(x === (R[0] + R[1]) / 2 && z === (R[2] + R[3]) / 2)) posts.push([x, z]);
  for (const [x, z] of posts) { paint(c, OAK, WOOD); BX(c, x - 0.08, 0, z - 0.08, x + 0.08, 1.25, z + 0.08); RB(c, x, 1.28, z, 0.12, 0.12, 0.12, 45, 35); paint(c, IR, IRONC); BX(c, x - 0.09, 0.45, z - 0.09, x + 0.09, 0.52, z + 0.09); BX(c, x - 0.09, 1.0, z - 0.09, x + 0.09, 1.07, z + 0.09);
    c.solid?.(x - 0.1, 0, z - 0.1, x + 0.1, 1.3, z + 0.1); }
  const ring = [[R[0], R[2]], [(R[0] + R[1]) / 2, R[2]], [R[1], R[2]], [R[1], (R[2] + R[3]) / 2], [R[1], R[3]], [(R[0] + R[1]) / 2, R[3]], [R[0], R[3]], [R[0], (R[2] + R[3]) / 2], [R[0], R[2]]];
  paint(c, HAY, "oklch(0.8 0.05 70)"); for (let i = 0; i < 8; i++) { if (i === 5) continue; for (const y of [0.5, 1.03]) ROPE(c, [ring[i][0], y, ring[i][1]], [ring[i + 1][0], y, ring[i + 1][1]], 0.08, 0.025, 4);
    const [ax, az] = ring[i], [bx, bz] = ring[i + 1]; c.solid?.(Math.min(ax, bx) - 0.06, 0, Math.min(az, bz) - 0.06, Math.max(ax, bx) + 0.06, 1.15, Math.max(az, bz) + 0.06); } // the ropes are a fence: only the open bay lets you in // the south-middle bay is open: the way in
  // racks on the long walls, a barrel of practice staves, a bench of shields
  rack(W(c, -8.75, -1.3, -90), 2.4, 3); rack(W(c, -8.75, 4.25, -90), 1.6, 7); rack(W(c, 8.75, -1.3, 90), 2.4, 11);
  BARREL(c, 7.8, F, -8.2, 0.35, 0.95); paint(c, OAK, WOOD); for (let i = 0; i < 6; i++) PIPE(c, [7.8 + Math.cos(i) * 0.15, F + 0.4, -8.2 + Math.sin(i) * 0.15], [7.8 + Math.cos(i) * 0.24, F + 1.9, -8.2 + Math.sin(i) * 0.24], 0.025, 0.02, 5);
  c.solid?.(7.4, 0, -8.6, 8.2, 1.1, -7.8);
  BARREL(c, -7.9, F, -8.1, 0.35, 0.95); BARREL(c, -7.3, F, -8.3, 0.3, 0.8); c.solid?.(-8.3, 0, -8.6, -6.9, 1.1, -7.7);
  for (const s of [-1, 1]) { bench(W(c, s * 4.3, 4.9, 90), 3.4); for (let i = 0; i < (s < 0 ? 3 : 2); i++) shield(W(c, s * (3.2 + i * 1.0), 5.35, 0), s * (3.2 + i * 1.0), 1.55, 5.35 - 0.0 - 0.0, 0.36, i); }
  // banners: the great one behind Brannoc, two flanking, two over each pair of side doors
  banner(W(c, 0, -8.75, 0), 0, 6.3, 2.0, 4.4); for (const s of [-1, 1]) banner(W(c, 0, -8.75, 0), s * 4.6, 5.8, 1.3, 3.0, false);
  for (const z of [-5, 2.3]) { banner(W(c, -8.75, z, -90), 0, 6.2, 1.3, 2.6); banner(W(c, 8.75, z, 90), 0, 6.2, 1.3, 2.6); }
  for (const s of [-1, 1]) { shield(W(c, 0, -8.75, 0), s * 2.2, 2.0, 0, 0.42, s); sword(W(c, 0, -8.75, 0), s * 2.2, 2.35, -0.07, 0.9, s * 30); }
  chandelier(c, 0, 4.4, -1.5, 1.0, 6.4); chandelier(c, 0, 4.4, -7, 0.9, 6.4);
  longhouse(c);
}

// THE LONGHOUSE (creator Nov 6, "like the companions longhouse"): the west half of the great hall is where the guild eats and drinks.
// A long sunken fire pit runs north-south with the feast table beside it, the captain's chair at its head; a second table across
// the south-west corner; kegs, a serving trestle, meat on the board, bones on the floor, shields hung on the hall posts.
function longhouse(c) {
  // the fire pit: a fieldstone kerb, a black ash bed, split logs (its flames are the scene's hall-firepit fx)
  const px0 = -2.95, px1 = -1.85, pz0 = -7.1, pz1 = -2.3;
  paint(c, FS, STONE); BX(c, px0, F, pz0, px1, F + 0.32, pz0 + 0.22); BX(c, px0, F, pz1 - 0.22, px1, F + 0.32, pz1);
  BX(c, px0, F, pz0, px0 + 0.22, F + 0.32, pz1); BX(c, px1 - 0.22, F, pz0, px1, F + 0.32, pz1);
  c.solid?.(px0, 0, pz0, px1, F + 0.32, pz1);
  if (c.lod <= 3) { paint(c, FS, "oklch(0.75 0.01 60)"); for (let z = pz0 + 0.3; z < pz1 - 0.2; z += 0.55) for (const x of [px0 + 0.11, px1 - 0.11]) RB(c, x, F + 0.32, z, 0.13, 0.05, 0.12, 0, 0, z * 40); }
  flatc(c, "oklch(0.16 0.01 50)"); BX(c, px0 + 0.22, F, pz0 + 0.22, px1 - 0.22, F + 0.06, pz1 - 0.22);
  paint(c, OAK, "oklch(0.45 0.03 50)"); for (const [z, r] of [[-6.4, 12], [-5.6, -8], [-4.7, 20], [-3.9, -15], [-3.1, 6]]) RB(c, -2.4, F + 0.14, z, 0.12, 0.12, 0.62, 0, 0, r);
  // a spit across the middle with a boar on it
  paint(c, IR, IRONC); for (const z of [-5.2, -4.0]) { BX(c, px0 - 0.06, F, z - 0.03, px0, F + 0.95, z + 0.03); BX(c, px1, F, z - 0.03, px1 + 0.06, F + 0.95, z + 0.03); }
  PIPE(c, [px0 - 0.1, F + 0.9, -4.6], [px1 + 0.1, F + 0.9, -4.6], 0.02, 0.02, 5);
  paint(c, LEATH, "oklch(0.62 0.08 40)"); LA(c, -2.4, F + 0.72, -4.6, [[0.02, 0], [0.18, 0.06], [0.22, 0.2], [0.16, 0.34], [0.02, 0.38]], 8, true);
  // the feast table, west of the fire, the captain's chair at its head
  table(W(c, -5.0, -4.6, 0), 5.4, 1.1); bench(W(c, -5.9, -4.6, 0), 5.0); bench(W(c, -4.1, -4.6, 0), 5.0); chair(W(c, -5.0, -7.75, 180, F), true);
  for (const [x, z, y] of [[-5.25, -6.6, 15], [-4.75, -6.0, 80], [-5.2, -4.9, 200], [-4.8, -3.6, -40], [-5.25, -2.6, 120], [-4.75, -2.3, 60]]) tankard(c, x, F + 0.78, z, y);
  for (const [x, z] of [[-5.25, -6.2], [-4.75, -5.4], [-5.25, -4.2], [-4.75, -3.0], [-5.2, -2.1]]) bowl(c, x, F + 0.78, z);
  paint(c, OAK, WOOD); BX(c, -5.35, F + 0.78, -5.05, -4.65, F + 0.82, -4.35);   // the carving board, a haunch on it
  paint(c, LEATH, "oklch(0.65 0.09 40)"); LA(c, -5.0, F + 0.82, -4.7, [[0.03, 0], [0.16, 0.05], [0.13, 0.14], [0.03, 0.17]], 7, true);
  paint(c, HAY, "oklch(0.75 0.08 60)"); RB(c, -5.0, F + 0.84, -3.3, 0.24, 0.1, 0.16, 25); RB(c, -4.9, F + 0.84, -5.9, 0.2, 0.09, 0.14, -10);   // loaves
  candle(c, -5.0, F + 0.78, -6.9, 0.18); candle(c, -5.0, F + 0.78, -2.9, 0.12);
  // the second table across the south-west corner, a fur under it, a game of knucklebones left mid-throw
  paint(c, WOOLR, "oklch(0.72 0.04 50)"); BX(c, -7.3, F, 0.4, -2.2, F + 0.012, 3.4);
  table(W(c, -4.75, 1.9, 90), 3.6, 1.0); bench(W(c, -4.75, 1.0, 90), 3.4); bench(W(c, -4.75, 2.8, 90), 3.4);
  for (const [x, z, y] of [[-6.0, 1.75, 30], [-4.2, 2.1, 140], [-3.4, 1.7, 270]]) tankard(c, x, F + 0.78, z, y);
  flatc(c, LINEN); for (const [x, z, r] of [[-5.1, 1.8, 20], [-5.0, 1.95, 55], [-4.85, 1.75, 5], [-4.95, 2.05, 80]]) RB(c, x, F + 0.8, z, 0.035, 0.035, 0.035, r);
  bowl(c, -5.6, F + 0.78, 2.05); candle(c, -4.3, F + 0.78, 1.7, 0.1);
  // kegs and a serving trestle on the north wall by the barrels, a cask racked on its side with a tap
  // the members' supply chest stands at x -2.7 on this wall (scene: fg-supply-chest); a coil of rope and a spare shield beside it
  paint(c, HAY, "oklch(0.75 0.05 70)"); for (let i = 0; i < 3; i++) RB(c, -1.55, F + 0.05 + i * 0.07, -8.4, 0.28 - i * 0.03, 0.04, 0.28 - i * 0.03);
  shield(W(c, -3.6, -8.75, 0), 0, 0.42, 0.05, 0.36, 2);
  paint(c, OAK, WOOD); for (const x of [-6.1, -5.1]) BX(c, x - 0.05, F, -8.75, x + 0.05, F + 0.42, -8.05);
  paint(c, OAK, "oklch(0.7 0.04 60)"); LA(c, -5.6, F + 0.42, -8.4, [[0.2, -0.5], [0.33, -0.25], [0.35, 0], [0.33, 0.25], [0.2, 0.5]].map(([r, y]) => [r, y]), 10, true);
  c.solid?.(-6.2, 0, -8.8, -5.0, F + 0.8, -8.0);
  paint(c, IR, IRONC); PIPE(c, [-5.6, F + 0.42 + 0.28, -8.0], [-5.6, F + 0.42 + 0.28, -7.85], 0.025, 0.02, 5);
  // gnawed bones under the benches (Wenn blames the dog; there is no dog)
  flatc(c, "oklch(0.88 0.03 85)"); for (const [x, z, r] of [[-6.3, -3.2, 30], [-3.7, -5.8, -60], [-6.4, -6.1, 80], [-3.6, 2.9, 10]]) RB(c, x, F + 0.03, z, 0.035, 0.035, 0.22, 0, r, 0);
  // shields on the inner faces of the west posts, the guild's old campaigns
  for (const [z, k] of [[-7, 0], [-1.5, 1], [4, 2]]) shield(W(c, -7.7, z, 90), 0, 3.4, 0, 0.42, k);
  boarHead(W(c, -6.6, -8.75, 0), 3.1);
  chandelier(c, -4.75, 4.0, 1.9, 0.8, 6.4);
}

function barracks(c) {
  [-7.6, -5, -2.4].forEach((z, i) => { bunk(W(c, -15.65, z, 90), i + 1); chest(W(c, -14.25, z, -90));
    if (c.lod <= 2) { paint(c, IR, IRONC); BX(c, -16.75, 2.0, z + 0.35, -16.7, 2.06, z + 0.55); } });
  // laundry line across the north-east corner, two odd socks and a shirt nobody claims
  const a = [-12.6, 2.25, -8.7], b = [-9.3, 2.25, -6.3]; paint(c, IR, IRONC); BX(c, -12.65, 2.15, -8.75, -12.55, 2.3, -8.65); BX(c, -9.3, 2.15, -6.35, -9.2, 2.3, -6.25);
  paint(c, HAY, "oklch(0.8 0.05 70)"); ROPE(c, a, b, 0.22, 0.012, 6);
  const at = (t) => [a[0] + (b[0] - a[0]) * t, a[1] - 0.22 * 4 * t * (1 - t), a[2] + (b[2] - a[2]) * t], yaw = -36;
  sock(c, at(0.22), yaw, 0); sock(c, at(0.34), yaw, 1); shirt(c, at(0.62), yaw); sock(c, at(0.85), yaw, 0);
  bucket(c, -10.6, F, -7.6); paint(c, OAK, WOOD); PIPE(c, [-10.55, F + 0.3, -7.55], [-10.1, F + 1.45, -8.3], 0.02, 0.02, 5); paint(c, HAY, "oklch(0.75 0.04 70)"); RB(c, -10.62, F + 0.25, -7.6, 0.18, 0.2, 0.18);
  // a dice table between the bunks and the door
  paint(c, OAK, WOOD); BX(c, -12.2, F + 0.66, -2.9, -11.2, F + 0.72, -2.0); for (const [x, z] of [[-12.1, -2.8], [-11.3, -2.8], [-12.1, -2.1], [-11.3, -2.1]]) BX(c, x - 0.04, F, z - 0.04, x + 0.04, F + 0.66, z + 0.04);
  c.solid?.(-12.2, 0, -2.9, -11.2, F + 0.72, -2.0); stool(W(c, -12.7, -2.4, 0, F)); stool(W(c, -10.8, -2.6, 0, F));
  flatc(c, LINEN); for (const [x, z, r] of [[-11.8, -2.5, 20], [-11.65, -2.35, 55], [-11.5, -2.6, 5]]) RB(c, x, F + 0.745, z, 0.05, 0.05, 0.05, r);
  tankard(c, -11.45, F + 0.72, -2.25, 30); candle(c, -11.95, F + 0.72, -2.15, 0.1);
  paint(c, WOOLR, "oklch(0.8 0.03 40)"); BX(c, -14.0, F, -6.5, -11.6, F + 0.01, -3.5);
  lantern(c, -13, 2.6, -5, 0.8);
}

function armory(c) {
  rack(W(c, -16.75, 0.9, -90), 2.4, 5); rack(W(c, -16.75, 3.75, -90), 2.4, 9);
  for (let i = 0; i < 4; i++) shield(W(c, -14.6 + i * 1.05, -0.75, 180), 0, 1.75, 0, 0.36, i * 0.4);
  // Orla's counter: a trestle with a ledger, a whetstone and a helm someone owes money on
  table(W(c, -12.8, 3.6, 90, F - 0.12 + 0.12), 2.8, 0.8, 0.95); paint(c, LEATH, "oklch(0.7 0.04 50)"); RB(c, -13.4, F + 0.97, 3.6, 0.42, 0.04, 0.3, 8);
  flatc(c, PAPER); RB(c, -13.4, F + 0.995, 3.6, 0.38, 0.01, 0.27, 8); paint(c, IR, IRONC); LA(c, -12.3, F + 0.95, 3.55, [[0.14, 0], [0.15, 0.1], [0.12, 0.2], [0.05, 0.26], [0, 0.27]], 8, true);
  flatc(c, "oklch(0.55 0.02 80)"); RB(c, -11.9, F + 0.98, 3.7, 0.22, 0.05, 0.07, 30);
  grindstone(W(c, -13.6, 0.4, 90, F)); armorStand(W(c, -10.1, 4.55, 180, F)); armorStand(W(c, -10.1, -0.1, 0, F)); armorStand(W(c, -11.0, 4.7, 180, F), true);
  BARREL(c, -16.2, F, 5.0, 0.32, 0.9); for (let i = 0; i < 4; i++) spear(c, -16.2 + Math.cos(i * 1.7) * 0.12, F + 0.3, 5.0 + Math.sin(i * 1.7) * 0.12, 1.9); c.solid?.(-16.6, 0, 4.6, -15.8, 1.0, 5.4);
  chest(W(c, -14.5, 5.05, 180)); paint(c, LEATH, "oklch(0.8 0.03 50)"); BX(c, -13.7, F, 4.7, -13.1, F + 0.35, 5.25); c.solid?.(-13.7, 0, 4.7, -13.1, F + 0.35, 5.25);
  // smithing corner (shared forge pieces): a bick anvil on its stump, quench buckets, a hammer rail on the north wall
  const G = forgeGear({ BX, RB, LA, CY, paint, flatc, metal: (c, col = "oklch(0.78 0.012 250)") => { paint(c, IR, col); c.metalness?.(0.65); c.roughness?.(0.42); }, plain: (c) => { c.metalness?.(null); c.roughness?.(null); },
    OAK, FS, WOOD, STONE, DARK: "oklch(0.42 0.01 250)", LEATHER: "#6a4429" });
  if (P.forge !== false) { G.bickStump(c, -11.7, 1.2, 60); c.solid?.(-12.0, 0, 0.9, -11.4, 0.9, 1.5);
  G.bucket(c, -15.65, 1.55, F); G.bucket(c, -14.3, -0.05, F);
  G.hammerRail(c, -10.6, -0.92, 1.75, 0, 4); }
  lantern(c, -13, 2.6, 2.3, 0.8);
}

function mess(c) {
  // the hearth: a fieldstone breast on the east wall, a smoke-black throat, an oak mantel, the cauldron on its chain
  paint(c, FS, STONE); BX(c, 15.5, F, -6.2, 16.8, HW, -5.3); BX(c, 15.5, F, -3.7, 16.8, HW, -2.8); BX(c, 15.5, 1.5, -5.3, 16.8, HW, -3.7);
  c.solid?.(15.5, 0, -6.2, 16.8, HW, -5.3); c.solid?.(15.5, 0, -3.7, 16.8, HW, -2.8); c.solid?.(15.5, 1.5, -5.3, 16.8, HW, -3.7); c.solid?.(16.3, 0, -5.3, 16.8, 1.5, -3.7);
  flatc(c, "oklch(0.18 0.01 50)"); BX(c, 16.3, F, -5.32, 16.8, 1.52, -3.68);
  paint(c, FS, "oklch(0.7 0.01 60)"); BX(c, 15.0, F, -5.7, 16.3, F + 0.16, -3.3); c.solid?.(15.0, 0, -5.7, 16.3, F + 0.16, -3.3);
  paint(c, OAK, WOOD); BX(c, 15.3, 1.5, -6.4, 15.62, 1.74, -2.6);
  paint(c, IR, IRONC); for (const z of [-5.0, -4.0]) BX(c, 15.95, F + 0.16, z - 0.3, 16.1, F + 0.26, z + 0.3); // fire dogs
  paint(c, OAK, "oklch(0.5 0.03 50)"); for (const [z, r] of [[-4.75, 8], [-4.3, -12], [-4.5, 80]]) RB(c, 16.0, F + 0.32, z, 0.13, 0.13, 0.9, 0, 0, r);
  paint(c, IR, IRONC); PIPE(c, [16.0, 1.5, -4.5], [16.0, 0.95, -4.5], 0.012, 0.012, 4); cauldron(c, 16.0, 0.55, -4.5, 0.3);
  for (const [z, k] of [[-6.0, 0], [-5.6, 1], [-3.3, 2], [-2.95, 3]]) tankard(c, 15.45, 1.74, z, 90 + k * 30); candle(c, 15.45, 1.74, -4.5, 0.18);
  // a hanging ham and a string of onions from the joists (Pip says the ham is load-bearing)
  paint(c, HAY, "oklch(0.8 0.05 70)"); PIPE(c, [14.6, HW - 0.2, -6.9], [14.6, 2.75, -6.9], 0.01, 0.01, 4); PIPE(c, [14.2, HW - 0.2, -2.0], [14.2, 2.6, -2.0], 0.01, 0.01, 4);
  paint(c, LEATH, "oklch(0.75 0.08 35)"); LA(c, 14.6, 2.2, -6.9, [[0.05, 0], [0.16, 0.12], [0.14, 0.4], [0.05, 0.55]], 8, true);
  flatc(c, "oklch(0.78 0.08 70)"); for (let i = 0; i < 5; i++) RB(c, 14.2 + (i % 2 ? 0.05 : -0.05), 2.5 - i * 0.12, -2.0, 0.1, 0.1, 0.1, i * 30, 20);
  // the long oak table, two benches, a grand chair at the head for whoever shouts loudest
  table(W(c, 12.2, -5, 0), 5.2, 1.0); bench(W(c, 11.3, -5, 0), 4.8); bench(W(c, 13.1, -5, 0), 4.8); chair(W(c, 12.2, -8.1, 180, F)); stool(W(c, 12.2, -1.6, 0, F));
  for (const [x, z, y] of [[11.9, -6.8, 15], [12.5, -6.1, 80], [11.95, -4.4, 200], [12.45, -3.9, -40], [12.2, -2.9, 120]]) tankard(c, x, F + 0.78, z, y);
  for (const [x, z] of [[12.4, -7.3], [11.95, -5.6], [12.45, -4.9], [11.95, -3.1]]) bowl(c, x, F + 0.78, z);
  paint(c, HAY, "oklch(0.75 0.08 60)"); RB(c, 12.2, F + 0.84, -5.2, 0.3, 0.12, 0.18, 10); candle(c, 12.2, F + 0.78, -6.3, 0.16); candle(c, 12.2, F + 0.78, -4.0, 0.12);
  // plate shelf on the north wall, barrels in the corner
  paint(c, OAK, WOOD); for (const y of [1.35, 1.85]) { BX(c, 10.5, y, -8.75, 13.8, y + 0.05, -8.45); for (let i = 0; i < 5; i++) bowl(c, 10.8 + i * 0.7, y + 0.05, -8.6); }
  for (const x of [10.7, 13.5]) BX(c, x - 0.03, 1.15, -8.75, x + 0.03, 1.35, -8.5);
  BARREL(c, 16.2, F, -8.2, 0.35, 0.95); BARREL(c, 15.5, F, -8.3, 0.33, 0.9); BARREL(c, 16.25, F + 0.95, -8.2, 0.28, 0.7, 3); c.solid?.(15.1, 0, -8.7, 16.65, 1.1, -7.8);
  lantern(c, 12.2, 2.6, -5, 0.8);
}

function quarters(c) {
  bed(W(c, 15.6, 3.6, -90, F - 0.0)); boarHead(W(c, 16.75, 3.6, 90), 2.6); chest(W(c, 16.25, 1.0, 90), true);
  paint(c, WOOLR, "oklch(0.95 0.02 40)"); BX(c, 11.0, F, 2.0, 14.2, F + 0.012, 4.6); paint(c, LEATH, "oklch(0.6 0.04 60)"); BX(c, 11.15, F + 0.012, 2.15, 14.05, F + 0.016, 4.45);
  // the desk against the north wall, contracts pinned above it, a guild sword over it all
  const d = W(c, 12.6, 0.62, 0, F); d.solid(-0.75, 0, -0.38, 0.75, 0.8, 0.38);
  paint(d, OAK, WOOD); BX(d, -0.78, 0.74, -0.38, 0.78, 0.8, 0.38); for (const s of [-1, 1]) { BX(d, s * 0.55 - 0.2, 0, -0.34, s * 0.55 + 0.2, 0.74, 0.34);
    for (const y of [0.12, 0.36, 0.58]) { paint(d, OAK, "oklch(0.8 0.03 60)"); BX(d, s * 0.55 - 0.17, y, 0.34, s * 0.55 + 0.17, y + 0.18, 0.36); paint(d, IR, IRONC); BX(d, s * 0.55 - 0.04, y + 0.07, 0.36, s * 0.55 + 0.04, y + 0.1, 0.39); } paint(d, OAK, WOOD); }
  flatc(d, PAPER); RB(d, -0.15, 0.81, 0.05, 0.42, 0.01, 0.3, 12); RB(d, 0.1, 0.815, -0.05, 0.4, 0.01, 0.28, -7); flatc(d, "oklch(0.15 0.01 60)"); CY(d, 0.42, 0.8, -0.15, 0.04, 0.07, 6);
  flatc(d, LINEN); RB(d, 0.45, 0.93, -0.12, 0.012, 0.22, 0.012, 0, 0, 20); candle(d, -0.6, 0.8, -0.2, 0.12); tankard(d, 0.62, 0.8, 0.18, 200);
  paint(d, IR, GOLD); for (const [x, z] of [[0.25, 0.2], [0.29, 0.22], [0.22, 0.25]]) CY(d, x, 0.8, z, 0.025, 0.012, 6);
  chair(W(c, 12.6, 1.45, 0, F));
  const b = W(c, 12.6, 0.25, 180); paint(b, OAK, WOOD); BX(b, -0.85, 1.35, -0.04, 0.85, 2.45, 0); paint(b, LEATH, "oklch(0.62 0.05 55)"); BX(b, -0.78, 1.42, -0.06, 0.78, 2.38, -0.04);
  [[-0.5, 2.1, 6], [-0.08, 2.15, -4], [0.38, 2.05, 9], [-0.4, 1.68, -10], [0.12, 1.7, 3], [0.55, 1.65, -6]].forEach(([x, y, r], i) => { flatc(b, PAPER); RB(b, x, y, -0.07, 0.34, 0.42, 0.006, 0, 0, r);
    if (b.lod <= 2) { flatc(b, "oklch(0.3 0.02 60)"); for (let k = 0; k < 4; k++) RB(b, x - Math.sin(r * Math.PI / 180) * (0.1 - k * 0.07), y + 0.1 - k * 0.07, -0.075, 0.22 - (k % 2) * 0.06, 0.012, 0.004, 0, 0, r); }
    flatc(b, i % 3 ? RED : "oklch(0.3 0.02 60)"); RB(b, x, y + 0.17, -0.078, 0.035, 0.035, 0.01, 0, 0, 45); });
  sword(W(c, 12.6, 0.25, 180), 0, 2.62, -0.05, 1.0, 90);
  banner(W(c, 12.6, 5.35, 0), 0, 3.3, 1.2, 2.3); shield(W(c, 10.4, 5.35, 0), 0, 1.8, 0, 0.4, 0.3);
  armorStand(W(c, 9.9, 4.8, 180, F)); stool(W(c, 14.3, 5.0, 0, F)); paint(c, OAK, WOOD); BX(c, 13.9, F, 4.95, 14.7, F + 0.04, 5.25);
  lantern(c, 13, 2.6, 2.8, 0.8);
}

// PARAMS (Codex Kits; {} = the guild as built): hall, barracks, armory, mess, quarters = false leaves that room an empty shell;
// forge = false drops the armoury's smithing corner (stump, buckets, hammer rail). grow = roomy knots (an object, set per placement).
let P = {};
function layout(c) { shell(c); for (const [k, f] of [["hall", hall], ["barracks", barracks], ["armory", armory], ["mess", mess], ["quarters", quarters]]) if (P[k] !== false) f(c); }
function geometry0(ctx) {
  const G = { lod: ctx.lod ?? 1, quad: (...a) => ctx.quad(...a), tri: (...a) => ctx.tri(...a), albedo: (t) => ctx.albedo(t), color: (...a) => ctx.color(...a), emissive: (...a) => ctx.emissive(...a), smooth: () => ctx.smooth(), flat: () => ctx.flat() };
  layout(G);
}
function collider0(ctx) { const S = SOLIDS(); layout(S); return S.list; }

// roomy interiors: params.grow widens the shell and lifts the ceilings, furniture keeps human height (scripts/lib/roomy.js)
export function geometry(ctx) { P = ctx.params ?? {}; return geometry0(grown(ctx, ctx.params?.grow)); }
export function collider(ctx) { P = ctx.params ?? {}; return growBoxes(collider0(ctx), ctx.params?.grow); }
