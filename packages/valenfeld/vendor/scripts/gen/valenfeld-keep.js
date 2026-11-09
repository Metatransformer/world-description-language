// VALENFELD KEEP, the outside: a square fieldstone keep (15.6 m) on a stone plinth against the north town wall,
// a squat crenellated tower at its NE corner, a forward gatehouse on the south face with the door, cross-shaped
// arrow slits, two hanging banners of the Reeve (slate blue, gold chevron, red seal), torch brackets by the door.
// Local origin = footprint centre on the ground; the door faces +Z (south, down townstreet2). Plinth top y = 1.
import { paint, flatc, glow, BX, RB, LA, SEG, PIPE, CB, FS, OAK, FLAG, IR, SL, STONE, WOOD, IRONC } from "../lib/buildkit.js";
import { banner_valenfeldKeep } from "../lib/pieces/banner.js";   // shared banner piece, drawn in this building's palette
const P = 1, H = 11, W = 7.8, TOP = P + H;               // plinth top, wall height, half width, wall top
const DARK = "#14110d", BLUE = "#2f3d52", GOLD = "#c9a45a", RED = "#a8452e";
const STONE2 = "oklch(0.82 0.015 80)", STONE3 = "oklch(0.7 0.02 75)";

// a crenellated parapet ring round a rectangle at y, merlons m tall, every `step` m
function parapet(c, x0, z0, x1, z1, y, t = 0.5, lod = 1) {
  paint(c, FS, STONE2);
  // corbel band below
  BX(c, x0 - 0.05, y - 0.45, z0 - 0.05, x1 + 0.05, y, z0 + t); BX(c, x0 - 0.05, y - 0.45, z1 - t, x1 + 0.05, y, z1 + 0.05);
  BX(c, x0 - 0.05, y - 0.45, z0 + t, x0 + t, y, z1 - t); BX(c, x1 - t, y - 0.45, z0 + t, x1 + 0.05, y, z1 - t);
  if (lod <= 2) { paint(c, FS, STONE3);
    const corb = (ax, a0, a1, fixed, out) => { for (let a = a0 + 0.5; a < a1 - 0.3; a += 1.1) ax === "x" ? BX(c, a - 0.18, y - 0.95, fixed, a + 0.18, y - 0.45, fixed + out) : BX(c, fixed, y - 0.95, a - 0.18, fixed + out, y - 0.45, a + 0.18); };
    corb("x", x0, x1, z0 + 0.4, -0.4); corb("x", x0, x1, z1 - 0.4, 0.4); corb("z", z0, z1, x0 + 0.4, -0.4); corb("z", z0, z1, x1 - 0.4, 0.4); }
  paint(c, FS, STONE);
  // the low wall
  BX(c, x0, y, z0, x1, y + 0.55, z0 + t); BX(c, x0, y, z1 - t, x1, y + 0.55, z1);
  BX(c, x0, y, z0 + t, x0 + t, y + 0.55, z1 - t); BX(c, x1 - t, y, z0 + t, x1, y + 0.55, z1 - t);
  // merlons
  const mer = (len) => { const n = Math.max(2, Math.round(len / 1.45)); return Array.from({ length: n }, (_, i) => (i + 0.5) / n * len); };
  for (const u of mer(x1 - x0)) { BX(c, x0 + u - 0.42, y + 0.55, z0, x0 + u + 0.42, y + 1.45, z0 + t); BX(c, x0 + u - 0.42, y + 0.55, z1 - t, x0 + u + 0.42, y + 1.45, z1); }
  for (const u of mer(z1 - z0 - 2 * t)) { BX(c, x0, y + 0.55, z0 + t + u - 0.42, x0 + t, y + 1.45, z0 + t + u + 0.42); BX(c, x1 - t, y + 0.55, z0 + t + u - 0.42, x1, y + 1.45, z0 + t + u + 0.42); }
}
// a cross arrow slit on a face: axis "z+"/"z-" (face at z = f, facing ±z) or "x+"/"x-"; u along the face, y its centre
function slit(c, face, f, u, y) {
  const s = face[1] === "+" ? 1 : -1, ax = face[0];
  const box = (a0, y0, a1, y1, d0, d1) => ax === "z" ? BX(c, a0, y0, f + s * d0, a1, y1, f + s * d1) : BX(c, f + s * d0, y0, a0, f + s * d1, y1, a1);
  paint(c, FS, STONE2);                                       // dressed surround, proud
  box(u - 0.34, y - 0.95, u - 0.09, y + 0.95, 0, 0.07); box(u + 0.09, y - 0.95, u + 0.34, y + 0.95, 0, 0.07);
  box(u - 0.09, y + 0.75, u + 0.09, y + 0.95, 0, 0.07); box(u - 0.09, y - 0.95, u + 0.09, y - 0.75, 0, 0.07);
  flatc(c, DARK);                                             // the slit itself and the cross bar
  box(u - 0.09, y - 0.75, u + 0.09, y + 0.75, -0.01, 0.02); box(u - 0.3, y + 0.05, u + 0.3, y + 0.17, -0.01, 0.075);
}
// a lit lancet window (warm) on the south face
function lancet(c, x, y) {
  paint(c, FS, STONE2); BX(c, x - 0.5, y - 1.0, W, x + 0.5, y - 0.85, W + 0.18);
  BX(c, x - 0.5, y - 0.85, W, x - 0.3, y + 0.8, W + 0.1); BX(c, x + 0.3, y - 0.85, W, x + 0.5, y + 0.8, W + 0.1);
  BX(c, x - 0.5, y + 0.8, W, x + 0.5, y + 1.05, W + 0.12);
  glow(c, "#ffb45a", [1.6, 0.8, 0.25]); BX(c, x - 0.3, y - 0.85, W - 0.01, x + 0.3, y + 0.8, W + 0.02);
  paint(c, IR, IRONC); BX(c, x - 0.02, y - 0.85, W + 0.02, x + 0.02, y + 0.8, W + 0.05); BX(c, x - 0.3, y - 0.05, W + 0.02, x + 0.3, y - 0.01, W + 0.05);
}
// a banner hanging from y0 on the south face at x, w wide, h long: cloth with a gentle ripple, swallowtail hem

export function geometry(ctx) {
  const c = ctx, L = ctx.lod ?? 1;
  // ---- plinth: the rise the keep stands on ----
  paint(c, FS, STONE3); BX(c, -9.6, -2, -8.1, 9.6, P - 0.1, 11.4);
  paint(c, FS, STONE2); BX(c, -9.7, P - 0.1, -8.15, 9.7, P, 11.5);
  paint(c, FLAG, STONE); BX(c, -9.5, P, -8.0, 9.5, P + 0.01, 11.35);
  // steps down to townstreet2: 6 risers of 1/6 m on 0.3 m treads, stone cheeks
  for (let i = 0; i < 6; i++) { const y = P - (i + 1) / 6; paint(c, FS, i % 2 ? STONE : STONE2); BX(c, -2.2, -0.5, 11.4 + i * 0.3, 2.2, y + 1 / 6, 11.4 + (i + 1) * 0.3); }
  paint(c, FS, STONE3); for (const s of [-1, 1]) { BX(c, s * 2.2, -0.5, 11.4, s * 2.75, P + 0.35, 11.75); c.quad(s * 2.2, P + 0.35, 11.75, s * 2.2, 0.35, 13.2, s * 2.75, 0.35, 13.2, s * 2.75, P + 0.35, 11.75);
    BX(c, s * 2.2, -0.5, 11.75, s * 2.75, 0.35, 13.2); }
  // ---- the keep body ----
  paint(c, FS, STONE); BX(c, -W, P, -W, W, TOP - 0.45, W);
  paint(c, FS, STONE3); BX(c, -W - 0.3, P, -W - 0.3, W + 0.3, P + 0.7, W + 0.3);     // battered footing course
  c.quad(-W - 0.3, P + 0.7, W + 0.3, W + 0.3, P + 0.7, W + 0.3, W, P + 0.95, W, -W, P + 0.95, W);
  paint(c, FS, STONE2); BX(c, -W - 0.12, 6.6, -W - 0.12, W + 0.12, 6.85, W + 0.12);  // string course
  if (L <= 2) { paint(c, FS, STONE2); for (const sx of [-1, 1]) for (const sz of [-1, 1]) {   // corner quoin pilasters
    const xa = sx > 0 ? W - 0.9 : -W - 0.15, xb = sx > 0 ? W + 0.15 : -W + 0.9, za = sz > 0 ? W - 0.9 : -W - 0.15, zb = sz > 0 ? W + 0.15 : -W + 0.9;
    for (let y = P + 0.95; y < TOP - 1; y += 0.9) BX(c, xa - (y % 1.8 < 0.9 ? 0.1 * sx : 0), y, za, xb, y + 0.85, zb); } }
  parapet(c, -W - 0.35, -W - 0.35, W + 0.35, W + 0.35, TOP, 0.5, L);
  paint(c, FLAG, STONE3); BX(c, -W, TOP - 0.45, -W, W, TOP - 0.3, W);                 // the wall walk
  paint(c, SL, STONE);                                                                    // low hipped slate roof inside the parapet
  { const a = 6.6, y0 = TOP - 0.3, yA = TOP + 2.6;
    c.quad(-a, y0, a, a, y0, a, 0.6, yA, 0.6, -0.6, yA, 0.6); c.quad(a, y0, -a, -a, y0, -a, -0.6, yA, -0.6, 0.6, yA, -0.6);
    c.quad(a, y0, a, a, y0, -a, 0.6, yA, -0.6, 0.6, yA, 0.6); c.quad(-a, y0, -a, -a, y0, a, -0.6, yA, 0.6, -0.6, yA, -0.6);
    paint(c, SL, STONE2); BX(c, -0.6, yA, -0.6, 0.6, yA + 0.12, 0.6); }
  // ---- the squat tower, NE corner ----
  const TX0 = 2.6, TX1 = 8.6, TZ0 = -8.0, TZ1 = -2.0, TT = 16.6;
  paint(c, FS, STONE); BX(c, TX0, P, TZ0, TX1, TT - 0.45, TZ1);
  paint(c, FS, STONE2); BX(c, TX0 - 0.12, 6.6, TZ0 - 0.12, TX1 + 0.12, 6.85, TZ1 + 0.12); BX(c, TX0 - 0.12, TOP + 1.2, TZ0 - 0.12, TX1 + 0.12, TOP + 1.45, TZ1 + 0.12);
  parapet(c, TX0 - 0.35, TZ0 - 0.35, TX1 + 0.35, TZ1 + 0.35, TT, 0.5, L);
  paint(c, FLAG, STONE3); BX(c, TX0, TT - 0.45, TZ0, TX1, TT - 0.3, TZ1);
  // flag on the tower: oak pole, iron cap, a red pennant
  paint(c, OAK, WOOD); PIPE(c, [5.6, TT - 0.3, -5], [5.6, TT + 4.2, -5], 0.08, 0.06, 6);
  paint(c, IR, IRONC); LA(c, 5.6, TT + 4.2, -5, [[0.12, 0], [0.05, 0.2], [0, 0.3]], 6);
  flatc(c, RED); for (let j = 0; j < 4; j++) { const x0 = 5.68 + j * 0.5, x1 = x0 + 0.5, hh = (x) => 0.6 * (1 - (x - 5.68) / 2.3), w = (x) => 0.1 * Math.sin(x * 2.5), yT = TT + 4.0;
    const A = [x0, yT, -5 + w(x0)], B = [x0, yT - 2 * hh(x0), -5 + w(x0)], C = [x1, yT - 2 * hh(x1), -5 + w(x1)], D = [x1, yT, -5 + w(x1)];
    c.quad(...A, ...B, ...C, ...D); c.quad(...D, ...C, ...B, ...A); }
  // ---- the gatehouse, forward of the south face ----
  const GX = 3.2, GZ0 = W - 0.1, GZ1 = 10.0, GT = 8.6, DW = 0.85, DH = 2.55;
  paint(c, FS, STONE); BX(c, -GX, P, GZ0, GX, GT - 0.45, GZ1 - 1.0);                    // solid core behind the door leaf
  BX(c, -GX, P, GZ1 - 1.0, -DW, GT - 0.45, GZ1); BX(c, DW, P, GZ1 - 1.0, GX, GT - 0.45, GZ1); BX(c, -DW, P + DH, GZ1 - 1.0, DW, GT - 0.45, GZ1);
  paint(c, FS, STONE3); BX(c, -GX - 0.25, P, GZ0, GX + 0.25, P + 0.6, GZ1 + 0.25);
  parapet(c, -GX - 0.3, GZ0, GX + 0.3, GZ1 + 0.3, GT, 0.45, L);
  paint(c, FLAG, STONE3); BX(c, -GX, GT - 0.45, GZ0, GX, GT - 0.3, GZ1);
  // door reveal: dressed jambs, oak lintel, a voussoir arch of nine stones above, a dark slot for the portcullis
  paint(c, FS, STONE2); BX(c, -DW - 0.35, P + 0.6, GZ1, -DW, P + DH, GZ1 + 0.1); BX(c, DW, P + 0.6, GZ1, DW + 0.35, P + DH, GZ1 + 0.1);
  paint(c, OAK, WOOD); BX(c, -DW - 0.35, P + DH, GZ1 - 1.0, DW + 0.35, P + DH + 0.3, GZ1 + 0.12);
  paint(c, FS, STONE3); for (let k = 0; k < 9; k++) { const a = Math.PI * (k + 0.5) / 9, r = 1.25;
    RB(c, Math.cos(a) * r, P + DH + 0.3 + Math.sin(a) * r * 0.7, GZ1 + 0.08, 0.38, 0.55, 0.16, 0, 0, (a * 180 / Math.PI) - 90); }
  flatc(c, DARK); BX(c, -DW, P + DH, GZ1 - 0.62, DW, P + DH + 0.02, GZ1 - 0.5);
  paint(c, FLAG, STONE3); BX(c, -DW, P, GZ1 - 1.0, DW, P + 0.02, GZ1);
  // machicolation box over the door
  paint(c, FS, STONE2); BX(c, -1.5, GT - 2.0, GZ1, 1.5, GT - 0.45, GZ1 + 0.55);
  paint(c, FS, STONE3); for (const x of [-1.2, 0, 1.2]) BX(c, x - 0.16, GT - 2.6, GZ1, x + 0.16, GT - 2.0, GZ1 + 0.5);
  flatc(c, DARK); for (const x of [-0.6, 0.6]) BX(c, x - 0.25, GT - 2.01, GZ1 + 0.05, x + 0.25, GT - 2.0, GZ1 + 0.5);
  // torch brackets either side of the door (the flames are the row's fx children)
  for (const s of [-1, 1]) { const x = s * 1.55;
    paint(c, IR, IRONC); BX(c, x - 0.1, P + 2.35, GZ1, x + 0.1, P + 2.75, GZ1 + 0.05); SEG(c, [x, P + 2.5, GZ1 + 0.03], [x, P + 2.7, GZ1 + 0.38], 0.04);
    LA(c, x, P + 2.62, GZ1 + 0.38, [[0.07, 0], [0.1, 0.12]], 6, true);
    paint(c, OAK, WOOD); PIPE(c, [x, P + 2.45, GZ1 + 0.38], [x, P + 2.95, GZ1 + 0.38], 0.035, 0.05, 5);
    glow(c, "#3a1a08", [1.2, 0.35, 0.05]); LA(c, x, P + 2.9, GZ1 + 0.38, [[0.065, 0], [0.05, 0.08]], 6, true); }
  // ---- arrow slits and lit windows ----
  if (L <= 3) {
    for (const u of [-5.2, -1.8, 1.8, 5.2]) slit(c, "z-", -W, u, 9.0);                              // north (over the town wall)
    for (const u of [-5.2, 0, 5.2]) slit(c, "x-", -W, u, 4.2), slit(c, "x-", -W, u, 9.0);           // west
    for (const u of [0.5, 5.2]) slit(c, "x+", W, u, 4.2), slit(c, "x+", W, u, 9.0);               // east
    for (const u of [-5.4, 5.4]) slit(c, "z+", W, u, 4.2);                                          // south, low
    slit(c, "z+", GZ1, -2.2, 5.6); slit(c, "z+", GZ1, 2.2, 5.6);                                   // gatehouse
    slit(c, "z+", TZ1, 5.6, TOP + 2.6); slit(c, "x+", TX1, -5, 10.2); slit(c, "x+", TX1, -5, TOP + 2.6); // tower
    lancet(c, -4.6, 9.4); lancet(c, 4.6, 9.4); lancet(c, 0, 10.1);
  }
  // ---- the Reeve's banners on the south face ----
  banner(c, -5.6, TOP - 1.3, W, 1.5, 4.4); banner(c, 5.9, TOP - 1.3, W, 1.5, 4.4);
}

export function collider(ctx) {
  const b = CB();
  b(-9.6, -2, -8.1, 9.6, P, 11.4);
  for (let i = 0; i < 6; i++) b(-2.2, -0.5, 11.4 + i * 0.3, 2.2, P - i / 6, 11.4 + (i + 1) * 0.3);
  b(-2.75, -0.5, 11.4, -2.2, P + 0.35, 13.2); b(2.2, -0.5, 11.4, 2.75, P + 0.35, 13.2);
  b(-W - 0.3, P, -W - 0.3, W + 0.3, TOP + 1.5, W + 0.3);
  b(2.6, P, -8.0, 8.6, 18, -2.0);
  b(-3.45, P, W - 0.1, 3.45, 9.6, 9.0); b(-3.45, P, 9.0, -0.85, 9.6, 10.3); b(0.85, P, 9.0, 3.45, 9.6, 10.3); b(-0.85, P + 2.55, 9.0, 0.85, 9.6, 10.3);
  return b.list;
}
const banner = banner_valenfeldKeep({ BLUE, BX, GOLD, IR, IRONC, LA, OAK, PIPE, RED, SEG, WOOD, flatc, paint });
