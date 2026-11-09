// VALENFELD KEEP, the north range (place valenfeld-keep), in place coordinates (scale 1, floor y = 0).
// Behind the great hall's north wall (outer face z = -7.81). Three rooms, z -20..-7.81:
//   CHAPEL OF THE LANTERN  x -19..-5   entered from the kitchen (door at x -10.6) : pews, altar, lantern glass
//   MAP ROOM               x  -5..5    doors west and east at z -14         : the war table, a painted map, shelves
//   ARMOURY & STRONGROOM   x   5..19   entered from the Reeve's chambers (x 13.75) : racks, a strongbox, a grille
import { paint, flatc, BX, LA, SEG, FS, OAK, FLAG, IR, CANVAS, STONE, WOOD, IRONC } from "../lib/buildkit.js";
import { rack_keepNorthRange } from "../lib/pieces/rack.js";   // shared rack piece, drawn in this building's palette
const Z0 = -20, Z1 = -7.81, X0 = -19.06, X1 = 19.06, H = 4.8, T = 0.25, DH = 2.7, DW = 0.8;
const STONE2 = "oklch(0.8 0.015 80)", WOOD2 = "oklch(0.55 0.04 50)", GOLD = "#c9a45a", WINE = "#5a1a22", BLUE = "#2f3d52";
// walls: [x0, y0, z0, x1, y1, z1]
export function walls() {
  const w = [];
  w.push([X0, 0, Z0 - T, X1, H, Z0 + T]);                                       // north
  w.push([X0 - T, 0, Z0, X0 + T, H, Z1], [X1 - T, 0, Z0, X1 + T, H, Z1]);       // ends
  for (const x of [-5, 5]) { w.push([x - T, 0, Z0, x + T, H, -14 - DW], [x - T, 0, -14 + DW, x + T, H, Z1], [x - T, DH, -14 - DW, x + T, H, -14 + DW]); }
  return w;
}
const candle = (c, x, y, z, h = 0.2) => { flatc(c, "oklch(0.92 0.03 90)"); BX(c, x - 0.03, y, z - 0.03, x + 0.03, y + h, z + 0.03); c.color("oklch(0.9 0.12 80)"); c.emissive(5, 2.6, 0.8); BX(c, x - 0.015, y + h, z - 0.015, x + 0.015, y + h + 0.05, z + 0.015); c.emissive(null); };
const sconce = (c, x, y, z) => { paint(c, IR, IRONC); BX(c, x - 0.1, y, z - 0.1, x + 0.1, y + 0.05, z + 0.1); c.albedo(null); c.color("oklch(0.9 0.12 75)"); c.emissive(4, 2, 0.5); BX(c, x - 0.06, y + 0.05, z - 0.06, x + 0.06, y + 0.3, z + 0.06); c.emissive(null); };
function pew(c, x0, x1, z) { paint(c, OAK, WOOD2); BX(c, x0, 0.42, z - 0.22, x1, 0.48, z + 0.22); BX(c, x0, 0.48, z + 0.18, x1, 1.0, z + 0.24); for (const x of [x0, x1 - 0.08]) BX(c, x, 0, z - 0.24, x + 0.08, 1.0, z + 0.24); }
export function geometry(c) { const lod = c.lod ?? 1;
  paint(c, FLAG, STONE); BX(c, X0 - T, -0.3, Z0 - T, X1 + T, 0, Z1);
  paint(c, FS, STONE2); for (const b of walls()) BX(c, ...b);
  paint(c, OAK, "oklch(0.35 0.03 50)"); BX(c, X0 - T, H, Z0 - T, X1 + T, H + 0.3, Z1); for (let x = X0 + 1.5; x < X1; x += 2.2) BX(c, x - 0.12, H - 0.3, Z0, x + 0.12, H, Z1);
  // door frames on the dividing walls
  paint(c, OAK, WOOD); for (const x of [-5, 5]) { BX(c, x - T - 0.05, DH, -14 - DW - 0.1, x + T + 0.05, DH + 0.2, -14 + DW + 0.1); }
  if (lod > 2) { c.albedo(null); c.color(null); return; }
  // ---- CHAPEL ----
  for (let i = 0; i < 4; i++) { const z = -11 - i * 1.6; pew(c, -17.8, -13.3, z); pew(c, -10.7, -6.2, z); }
  paint(c, FS, STONE2); BX(c, -14, 0, -19.75, -10, 0.3, -17.6); BX(c, -13.2, 0.3, -19.5, -10.8, 1.2, -18.6);   // dais + altar
  flatc(c, WINE); BX(c, -13.25, 1.2, -19.55, -10.75, 1.23, -18.55); flatc(c, GOLD); BX(c, -12.9, 1.23, -18.62, -11.1, 1.25, -18.5);
  // the lantern: a tall gilt lamp on the altar, lit
  flatc(c, GOLD); LA(c, -12, 1.23, -19.05, [[0.22, 0], [0.22, 0.06], [0.06, 0.1], [0.06, 0.55], [0.2, 0.6], [0.24, 1.0], [0.08, 1.12], [0.01, 1.2]], 8);
  c.color("oklch(0.92 0.12 85)"); c.emissive(5, 3, 1); LA(c, -12, 1.88, -19.05, [[0.16, 0], [0.16, 0.35], [0.01, 0.35]], 8); c.emissive(null);
  for (const x of [-13, -11]) candle(c, x, 1.23, -19.0, 0.3);
  // a tall stained window over the altar, glowing amber and blue
  c.albedo(null); c.color("oklch(0.6 0.12 70)"); c.emissive(1.4, 0.9, 0.35); BX(c, -12.8, 1.8, Z0 + T, -11.2, 4.2, Z0 + T + 0.03); c.color("oklch(0.45 0.1 250)"); c.emissive(0.3, 0.45, 1.1); BX(c, -12.3, 2.1, Z0 + T + 0.02, -11.7, 3.9, Z0 + T + 0.05); c.emissive(null);
  flatc(c, WINE); BX(c, -12.2, 0.002, -17.5, -11.8, 0.012, -8); BX(c, -12.6, 0.002, -17.5, -11.4, 0.01, -8.2);
  sconce(c, X0 + T, 2.2, -12); sconce(c, -5 - T - 0.1, 2.2, -10);
  // ---- MAP ROOM ----
  paint(c, OAK, WOOD); BX(c, -2.2, 0.85, -15.4, 2.2, 0.95, -12.6); for (const [x, z] of [[-2, -15.2], [1.9, -15.2], [-2, -12.8], [1.9, -12.8]]) BX(c, x, 0, z, x + 0.15, 0.85, z + 0.15);
  flatc(c, "oklch(0.82 0.05 85)"); BX(c, -2, 0.95, -15.2, 2, 0.96, -12.8);                               // the map on the table
  flatc(c, "oklch(0.55 0.08 145)"); BX(c, -1.6, 0.96, -14.8, 0.2, 0.965, -13.5); flatc(c, "oklch(0.5 0.06 240)"); BX(c, 0.2, 0.96, -14.1, 0.35, 0.966, -12.9); BX(c, -1.2, 0.96, -13.4, 1.6, 0.966, -13.25);
  for (const [x, z, col] of [[-1, -14.2, RED()], [0.8, -13.8, BLUE], [1.4, -14.9, RED()], [-0.4, -13.1, GOLD]]) { flatc(c, col); LA(c, x, 0.965, z, [[0.05, 0], [0.05, 0.08], [0.02, 0.14], [0.01, 0.16]], 6); }
  candle(c, -1.9, 0.95, -15.1); candle(c, 1.9, 0.95, -12.9);
  // a painted wall map of Valen on the north wall
  paint(c, OAK, WOOD); BX(c, -2.6, 1.3, Z0 + T, 2.6, 3.9, Z0 + T + 0.06); c.albedo(CANVAS ?? null); c.color("oklch(0.86 0.05 85)"); BX(c, -2.45, 1.45, Z0 + T + 0.06, 2.45, 3.75, Z0 + T + 0.08);
  flatc(c, "oklch(0.6 0.07 150)"); HXP(c, [[-2, 1.8], [-0.4, 1.6], [1.6, 2.1], [2.1, 3.1], [0.8, 3.6], [-1.5, 3.3], [-2.2, 2.6]], Z0 + T + 0.085);
  flatc(c, "oklch(0.55 0.08 240)"); BX(c, -0.2, 1.7, Z0 + T + 0.09, -0.08, 3.4, Z0 + T + 0.095);
  // shelves of ledgers on the side walls
  for (const s of [-1, 1]) { const x = s * (5 - T - 0.2); paint(c, OAK, WOOD2); for (const y of [0.4, 1.1, 1.8]) BX(c, x - 0.2, y, -19.4, x + 0.2, y + 0.05, -16.4);
    for (let i = 0; i < 18; i++) { const y = [0.45, 1.15, 1.85][i % 3], z = -19.3 + Math.floor(i / 3) * 0.48; flatc(c, [WINE, BLUE, "oklch(0.4 0.06 60)", "oklch(0.35 0.05 145)"][i % 4]); BX(c, x - 0.14, y, z, x + 0.14, y + 0.42 - (i % 2) * 0.08, z + 0.2); } }
  sconce(c, -3.5, 2.4, Z0 + T); sconce(c, 3.5, 2.4, Z0 + T);
  // ---- ARMOURY & STRONGROOM ----
  rack(c, 9, Z0 + T + 0.4, 1); rack(c, 15, Z0 + T + 0.4, 1);
  for (let i = 0; i < 4; i++) { const z = -17 + i * 1.6; paint(c, OAK, WOOD2); BX(c, X1 - T - 0.5, 0, z - 0.1, X1 - T - 0.4, 1.8, z + 0.1); paint(c, IR, "oklch(0.6 0.01 250)"); LA(c, X1 - T - 0.75, 0.9, z, [[0.18, 0], [0.26, 0.15], [0.28, 0.55], [0.2, 0.75], [0.12, 0.85], [0.01, 0.9]], 8); } // mail on stands
  for (let i = 0; i < 3; i++) { flatc(c, [GOLD, "oklch(0.45 0.1 30)", BLUE][i]); LA(c, 6.2, 1.2 + i * 0.05, -16.5 + i * 1.3, [[0.45, 0], [0.45, 0.06], [0.01, 0.08]], 12); } // round shields on the wall... laid flat on pegs
  // the strongroom: an iron grille cage in the NE corner with a banded chest
  paint(c, IR, IRONC); for (let x = 12.2; x < X1 - T; x += 0.25) BX(c, x - 0.02, 0, -16.02, x + 0.02, 2.6, -15.98); BX(c, 12.1, 2.55, -16.05, X1 - T, 2.65, -15.95); BX(c, 12.1, 0, Z0 + T, 12.15, 2.65, -16);
  for (let z = Z0 + T + 0.2; z < -16; z += 0.25) BX(c, 12.1, 0, z - 0.02, 12.15, 2.6, z + 0.02);
  paint(c, OAK, WOOD); BX(c, 15.2, 0, -19.4, 16.8, 0.7, -18.5); paint(c, IR, IRONC); for (const x of [15.4, 16.6]) BX(c, x - 0.04, 0, -19.42, x + 0.04, 0.72, -18.48); flatc(c, GOLD); BX(c, 15.95, 0.35, -18.5, 16.05, 0.5, -18.46);
  flatc(c, GOLD); for (let i = 0; i < 7; i++) LA(c, 13.3 + (i % 3) * 0.3, 0, -18.4 + Math.floor(i / 3) * 0.3, [[0.1, 0], [0.1, 0.05 + (i % 2) * 0.03], [0.01, 0.06 + (i % 2) * 0.03]], 6); // coin stacks
  sconce(c, 8, 2.4, -7.81 - 0.2); sconce(c, X1 - T, 2.4, -12);
  c.albedo(null); c.color(null); c.emissive(null);
}
function RED() { return "#a8452e"; }
function HXP(c, pts, z) { const n = pts.length, cx = pts.reduce((a, p) => a + p[0], 0) / n, cy = pts.reduce((a, p) => a + p[1], 0) / n; for (let i = 0; i < n; i++) { const a = pts[i], b = pts[(i + 1) % n]; c.quad(cx, cy, z, cx, cy, z, b[0], b[1], z, a[0], a[1], z); } }
export function collider(c) {
  const box = (x0, y0, z0, x1, y1, z1) => ({ kind: "box", width: x1 - x0, height: y1 - y0, depth: z1 - z0, center: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2] });
  const out = walls().map((b) => box(...b));
  out.push(box(X0 - T, -0.3, Z0 - T, X1 + T, 0, Z1), box(X0 - T, H, Z0 - T, X1 + T, H + 0.3, Z1));
  for (let i = 0; i < 4; i++) { const z = -11 - i * 1.6; out.push(box(-17.8, 0, z - 0.24, -13.3, 1.0, z + 0.24), box(-10.7, 0, z - 0.24, -6.2, 1.0, z + 0.24)); }
  out.push(box(-14, 0, -19.75, -10, 0.3, -17.6), box(-13.2, 0, -19.5, -10.8, 1.25, -18.6), box(-2.2, 0, -15.4, 2.2, 0.95, -12.6));
  out.push(box(12.1, 0, -16.05, X1 - T, 2.65, -15.95), box(12.1, 0, Z0 + T, 12.15, 2.65, -16));
  return out;
}
const rack = rack_keepNorthRange({ BX, IR, OAK, SEG, WOOD, WOOD2, paint });
