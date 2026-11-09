import { grown, growBoxes } from "../lib/roomy.js";
// VALENFELD KEEP, the inside (place valenfeld-keep). Floor y = 0, origin = middle of the great hall's south half.
// GREAT HALL x -7..7, z -6..10: timber king-post roof (ridge 9.6 m), two long tables, the dais and the Reeve's chair,
// tapestries, a hearth in each long wall. West wing: KITCHEN (z -6..2) and GUARD ROOM (z 2..10). East wing: the
// REEVE'S CHAMBERS (z -6..2) and the STEWARD'S OFFICE (z 2..10). The way out is the south door at z = 10.
import { paint, flatc, glow, BX, RB, LA, SEG, PIPE, CB, BARREL, FS, OAK, PL, FLAG, IR, HAY, CANVAS, STONE, WOOD, WHITE, IRONC } from "../lib/buildkit.js";
import { sconce_valenfeldKeepHall } from "../lib/pieces/sconce.js";   // shared sconce piece, drawn in this building's palette
import { rack_valenfeldKeepHall } from "../lib/pieces/rack.js";   // shared rack piece, drawn in this building's palette
import { table_valenfeldKeepHall } from "../lib/pieces/table.js";   // shared table piece, drawn in this building's palette
import { bench_valenfeldKeepHall } from "../lib/pieces/bench.js";   // shared bench piece, drawn in this building's palette
import { candle_valenfeldKeepHall as candle } from "../lib/pieces/candle.js";   // the shared candle pieces
import { shelf_valenfeldKeepHall as shelf } from "../lib/pieces/shelf.js";   // the shared shelf pieces
const T = 0.25, HH = 6.5, WH = 3.9, RIDGE = 9.6, DW = 0.65, DH = 2.4;    // half wall, hall wall top, wing ceiling, door half width/height
const DARK = "#14110d", BLUE = "#2f3d52", GOLD = "#c9a45a", RED = "#a8452e", GREEN = "#4f6b4a", WINE = "#5a1a22";
const STONE2 = "oklch(0.82 0.015 80)", STONE3 = "oklch(0.7 0.02 75)", WOOD2 = "oklch(0.75 0.03 60)";
export const ROOMS = { hall: [-7, -6, 7, 10], kitchen: [-15, -6, -7, 2], guard: [-15, 2, -7, 10], reeve: [7, -6, 15, 2], steward: [7, 2, 15, 10] };

// every wall as [axis, fixed, a0, a1, top, doors[centre]]; "x" walls run along x at z = fixed
const WALLS = [
  ["x", -6, -15.25, 15.25, null, [-8.5, 11]],   // north (hall part rises to HH, wings to WH: split below); kitchen and chambers open into the north range
  ["x", 10, -15.25, 15.25, null, [0]],         // south, the way out
  ["z", -15, -6, 10, WH + 0.3, []], ["z", 15, -6, 10, WH + 0.3, []],
  ["z", -7, -6, 10, HH, [-2, 6]], ["z", 7, -6, 10, HH, [-2, 6]],
  ["x", 2, -15, -7, WH, []], ["x", 2, 7, 15, WH, []],
];
// lay a wall with door holes through any box sink B(x0,y0,z0,x1,y1,z1)
function wall(B, ax, f, a0, a1, top, doors) {
  const box = (u0, y0, u1, y1) => ax === "x" ? B(u0, y0, f - T, u1, y1, f + T) : B(f - T, y0, u0, f + T, y1, u1);
  let u = a0;
  for (const d of [...doors].sort((p, q) => p - q)) { box(u, 0, d - DW, top); box(d - DW, DH, d + DW, top); u = d + DW; }
  box(u, 0, a1, top);
}
function allWalls(B) {
  for (const [ax, f, a0, a1, top, doors] of WALLS) {
    if (top === null) { wall(B, ax, f, a0, -7 - T, WH + 0.3, doors.filter((d) => d < -7)); wall(B, ax, f, 7 + T, a1, WH + 0.3, doors.filter((d) => d > 7)); wall(B, ax, f, -7 - T, 7 + T, HH, doors.filter((d) => Math.abs(d) < 7)); }
    else wall(B, ax, f, a0, a1, top, doors);
  }
}
// a hearth: chimney breast against wall x = wx projecting toward the room by s (±1), centred on z
function hearth(c, wx, z, s, top, big = true) {
  const d = 0.9, hw = big ? 1.3 : 1.1, ow = big ? 0.85 : 0.7, oh = 1.25, fx = wx + s * T, bx = fx + s * d;
  const B = (x0, y0, z0, x1, y1, z1) => BX(c, Math.min(x0, x1), y0, z0, Math.max(x0, x1), y1, z1);
  paint(c, FS, STONE2); B(fx, 0, z - hw, bx, top, z - ow); B(fx, 0, z + ow, bx, top, z + hw); B(fx, oh, z - ow, bx, top, z + ow);
  paint(c, FS, STONE3); B(bx, oh, z - hw - 0.1, bx + s * 0.18, oh + 0.3, z + hw + 0.1);           // mantel shelf
  B(fx, 0, z - hw - 0.15, bx + s * 0.6, 0.12, z + hw + 0.15);                                       // hearthstone
  flatc(c, DARK); B(fx, 0.12, z - ow, fx + s * 0.02, oh, z + ow);                                    // sooted back
  flatc(c, "#1c1712"); B(fx, oh - 0.02, z - ow, bx, oh, z + ow);
  paint(c, IR, IRONC); for (const k of [-0.4, 0.4]) { SEG(c, [fx + s * 0.25, 0.12, z + k], [fx + s * 0.25, 0.35, z + k], 0.04); }    // firedogs
  SEG(c, [fx + s * 0.25, 0.3, z - 0.45], [fx + s * 0.25, 0.3, z + 0.45], 0.04);
  paint(c, OAK, WOOD2); for (const k of [-0.18, 0, 0.18]) RB(c, fx + s * (0.3 + Math.abs(k)), 0.38, z + k, 0.14, 0.14, 0.9, 0, 0, 0);   // logs
  glow(c, "#3a1a08", [1.3, 0.4, 0.06]); BX(c, Math.min(fx, fx + s * 0.6), 0.12, z - 0.5, Math.max(fx, fx + s * 0.6), 0.16, z + 0.5);  // coal bed
  return [fx + s * 0.35, z];
}
function chest(c, x, z, w, d, yaw = 0, h = 0.55) {
  paint(c, OAK, WOOD); RB(c, x, h / 2, z, w, h, d, yaw); paint(c, OAK, WOOD2); RB(c, x, h + 0.06, z, w + 0.04, 0.12, d + 0.04, yaw);
  paint(c, IR, IRONC); for (const k of [-0.35, 0.35]) { const r = yaw * Math.PI / 180, ox = Math.cos(r) * k * w, oz = -Math.sin(r) * k * w; RB(c, x + ox, (h + 0.12) / 2, z + oz, 0.06, h + 0.14, d + 0.06, yaw); }
  RB(c, x + Math.sin(yaw * Math.PI / 180) * (d / 2 + 0.03), h - 0.08, z + Math.cos(yaw * Math.PI / 180) * (d / 2 + 0.03), 0.12, 0.16, 0.04, yaw);
}
// a hanging tapestry on a wall: face axis "z" (on a wall at z = f, hanging toward s) or "x"
function tapestry(c, ax, f, u, y1, w, h, s, col, trim, motif) {
  const P = (uu, yy, o) => ax === "z" ? [uu, yy, f + s * o] : [f + s * o, yy, uu];
  const Q = (u0, y0, u1, y1b, o) => { const a = P(u0, y0, o), b = P(u1, y0, o), d = P(u1, y1b, o), e = P(u0, y1b, o);
    (ax === "z") === (s > 0) ? c.quad(...a, ...b, ...d, ...e) : c.quad(...b, ...a, ...e, ...d); };
  paint(c, OAK, WOOD); ax === "z" ? BX(c, u - w / 2 - 0.15, y1, f + s * 0.02 - 0.05, u + w / 2 + 0.15, y1 + 0.08, f + s * 0.02 + 0.05) : BX(c, f + s * 0.02 - 0.05, y1, u - w / 2 - 0.15, f + s * 0.02 + 0.05, y1 + 0.08, u + w / 2 + 0.15);
  paint(c, CANVAS, col); Q(u - w / 2, y1 - h, u + w / 2, y1, 0.04);
  for (let i = 0; i < 5; i++) Q(u - w / 2 + i * w / 5 + 0.06, y1 - h - 0.25, u - w / 2 + (i + 1) * w / 5 - 0.06, y1 - h, 0.04);   // dagged hem
  flatc(c, trim); Q(u - w / 2 + 0.08, y1 - 0.3, u + w / 2 - 0.08, y1 - 0.2, 0.05); Q(u - w / 2 + 0.08, y1 - h + 0.2, u + w / 2 - 0.08, y1 - h + 0.3, 0.05);
  if (motif === "chevron") { for (let k = 0; k < 2; k++) { const yy = y1 - h * 0.55 + k * 0.5; Q(u - w * 0.34, yy, u, yy + 0.22, 0.055); Q(u, yy, u + w * 0.34, yy + 0.22, 0.055); }
    flatc(c, RED); Q(u - 0.22, y1 - h * 0.32 - 0.22, u + 0.22, y1 - h * 0.32 + 0.22, 0.06); }
  else if (motif === "boar") { flatc(c, trim); Q(u - w * 0.3, y1 - h * 0.6, u + w * 0.25, y1 - h * 0.38, 0.055); Q(u + w * 0.2, y1 - h * 0.58, u + w * 0.34, y1 - h * 0.44, 0.06);
    for (const k of [-0.22, -0.05, 0.08, 0.2]) Q(u + w * k - 0.05, y1 - h * 0.72, u + w * k + 0.05, y1 - h * 0.6, 0.055); }
  else { flatc(c, trim); Q(u - 0.06, y1 - h * 0.8, u + 0.06, y1 - h * 0.3, 0.055); Q(u - w * 0.3, y1 - h * 0.45, u + w * 0.3, y1 - h * 0.38, 0.055); }
}
function rug(c, x0, z0, x1, z1, col, trim) { flatc(c, trim); BX(c, x0, 0, z0, x1, 0.015, z1); paint(c, CANVAS, col); BX(c, x0 + 0.15, 0.015, z0 + 0.15, x1 - 0.15, 0.025, z1 - 0.15); }
function bed(c, x0, z0, x1, z1, opts = {}) {           // head at z0 (or x0 if along x)
  const h = opts.h ?? 0.42, blanket = opts.blanket ?? RED, along = (x1 - x0) > (z1 - z0);
  paint(c, OAK, WOOD); BX(c, x0, 0.18, z0, x1, h - 0.12, z1);                                   // frame rails
  for (const [x, z] of [[x0, z0], [x1 - 0.1, z0], [x0, z1 - 0.1], [x1 - 0.1, z1 - 0.1]]) BX(c, x, 0, z, x + 0.1, h - 0.02, z + 0.1);
  if (along) BX(c, x0 - 0.02, 0, z0, x0 + 0.08, h + 0.45, z1); else BX(c, x0, 0, z0 - 0.02, x1, h + 0.45, z0 + 0.08);   // headboard
  paint(c, HAY, "oklch(0.92 0.04 85)"); BX(c, x0 + 0.06, h - 0.12, z0 + 0.06, x1 - 0.06, h + 0.06, z1 - 0.06);  // straw tick
  paint(c, CANVAS, blanket); along ? BX(c, x0 + 0.6, h + 0.06, z0 + 0.03, x1 - 0.02, h + 0.11, z1 - 0.03) : BX(c, x0 + 0.03, h + 0.06, z0 + 0.6, x1 - 0.03, h + 0.11, z1 - 0.02);
  along ? BX(c, x0 + 0.6, h - 0.18, z0, x1 - 0.02, h + 0.11, z0 + 0.04) : BX(c, x0, h - 0.18, z0 + 0.6, x0 + 0.04, h + 0.11, z1 - 0.02);  // blanket drape
  paint(c, CANVAS, WHITE); along ? RB(c, x0 + 0.33, h + 0.12, (z0 + z1) / 2, 0.4, 0.13, (z1 - z0) * 0.62) : RB(c, (x0 + x1) / 2, h + 0.12, z0 + 0.33, (x1 - x0) * 0.62, 0.13, 0.4);   // pillow
}
function ham(c, x, y, z) {                               // a cured ham hung by its hock from a cord
  paint(c, IR, "oklch(0.6 0.03 70)"); SEG(c, [x, y, z], [x, y - 0.3, z], 0.012);
  flatc(c, "oklch(0.92 0.02 85)"); LA(c, x, y - 0.42, z, [[0.025, 0], [0.03, 0.12]], 5, true);
  flatc(c, "oklch(0.42 0.09 40)"); LA(c, x, y - 0.95, z, [[0.0, 0], [0.12, 0.06], [0.17, 0.2], [0.15, 0.35], [0.07, 0.5], [0.035, 0.55]], 7, true);
}
function books(c, ax, f, u0, u1, y, s, seed) {         // a run of ledgers on a shelf
  let u = u0, k = seed; const cols = [WINE, BLUE, "#5a4a2a", GREEN, "#3a2a1a", RED];
  while (u < u1 - 0.06) { k = (k * 9301 + 49297) % 233280; const w = 0.05 + (k % 5) * 0.012, h = 0.24 + (k % 7) * 0.02; flatc(c, cols[k % cols.length]);
    ax === "z" ? BX(c, u, y, f + s * 0.03, u + w, y + h, f + s * 0.28) : BX(c, f + s * 0.03, y, u, f + s * 0.28, y + h, u + w); u += w + 0.008; }
}

// PARAMS (Codex Kits; {} = the keep as built): hall, kitchen, guard, reeve, steward = false leaves that room bare
// (furniture and its boxes go together; hearths, sconces and walls stay). grow = roomy knots (an object, per placement).
let P = {}; const on = (k) => P[k] !== false;
function geometry0(ctx) {
  const c = ctx, L = ctx.lod ?? 1;
  // ---- floors ----
  paint(c, FLAG, STONE); BX(c, -15.25, -0.3, -6.25, 15.25, 0, 10.25);
  paint(c, OAK, WOOD); BX(c, 7.25, 0, -5.75, 14.75, 0.03, 9.75);                     // boarded east wing
  // ---- walls: fieldstone hall, limewash wings over an oak dado ----
  paint(c, FS, STONE); allWalls((x0, y0, z0, x1, y1, z1) => BX(c, x0, y0, z0, x1, y1, z1));
  paint(c, PL, WHITE);                                                               // plaster skins inside the wings
  for (const [x0, z0, x1, z1] of [ROOMS.kitchen, ROOMS.guard, ROOMS.reeve, ROOMS.steward]) {
    if (z0 === 2 && x0 === -15) continue;                                             // the guard room stays bare stone
    const dz = (z0 + z1) / 2, sk = (xa, xb, d) => { const segs = d ? [[z0 + T, dz - DW - 0.12, 1.1], [dz + DW + 0.12, z1 - T, 1.1], [dz - DW - 0.12, dz + DW + 0.12, DH + 0.2]] : [[z0 + T, z1 - T, 1.1]];
      for (const [a, bb, y] of segs) BX(c, xa, y, a, xb, WH, bb); };
    sk(x0 + T, x0 + T + 0.02, x0 === 7); sk(x1 - T - 0.02, x1 - T, x1 === -7);
    BX(c, x0 + T, 1.1, z0 + T, x1 - T, WH, z0 + T + 0.02); BX(c, x0 + T, 1.1, z1 - T - 0.02, x1 - T, WH, z1 - T);
    paint(c, OAK, WOOD2); BX(c, x0 + T, 1.0, z0 + T, x1 - T, 1.12, z0 + T + 0.06); BX(c, x0 + T, 1.0, z1 - T - 0.06, x1 - T, 1.12, z1 - T); paint(c, PL, WHITE);
  }
  // re-cut the plaster where doors pass: oak door frames over every opening
  paint(c, OAK, WOOD);
  for (const z of [-2, 6]) for (const x of [-7, 7]) { BX(c, x - T - 0.06, 0, z - DW - 0.12, x + T + 0.06, DH + 0.15, z - DW); BX(c, x - T - 0.06, 0, z + DW, x + T + 0.06, DH + 0.15, z + DW + 0.12); BX(c, x - T - 0.06, DH, z - DW - 0.12, x + T + 0.06, DH + 0.2, z + DW + 0.12); }
  // hall dado: a darker plinth course
  paint(c, FS, STONE3); BX(c, -7 + T, 0, -6 + T, -7 + T + 0.08, 0.5, 10 - T); BX(c, 7 - T - 0.08, 0, -6 + T, 7 - T, 0.5, 10 - T);
  // ---- hall roof: gables, king-post trusses, purlins, plank roof ----
  paint(c, FS, STONE);
  for (const z of [-6, 10]) { const a = [-7.25, HH, z - T], b = [7.25, HH, z - T], e = [0, RIDGE + 0.2, z - T], a2 = [-7.25, HH, z + T], b2 = [7.25, HH, z + T], e2 = [0, RIDGE + 0.2, z + T];
    c.quad(...a, ...b, ...e, ...e); c.quad(...b2, ...a2, ...e2, ...e2); c.quad(...b, ...e, ...e2, ...b2); c.quad(...e, ...a, ...a2, ...e2); }
  paint(c, OAK, "oklch(0.6 0.03 60)");
  { const t = 0.12; for (const s of [-1, 1]) { const A = [s * 7.5, HH - 0.1, -6.3], B = [0, RIDGE, -6.3], C2 = [0, RIDGE, 10.3], D = [s * 7.5, HH - 0.1, 10.3];
      const up = (p) => [p[0], p[1] + t, p[2]];
      s < 0 ? c.quad(...A, ...D, ...C2, ...B) : c.quad(...B, ...C2, ...D, ...A); s < 0 ? c.quad(...up(B), ...up(C2), ...up(D), ...up(A)) : c.quad(...up(A), ...up(D), ...up(C2), ...up(B)); } }
  paint(c, OAK, WOOD2);
  BX(c, -0.14, RIDGE - 0.3, -6, 0.14, RIDGE, 10);                                    // ridge beam
  for (const s of [-1, 1]) for (const f of [0.33, 0.66]) { const x = s * 7 * (1 - f), y = HH + (RIDGE - HH) * f - 0.25; BX(c, x - 0.1, y - 0.22, -6, x + 0.1, y, 10); }  // purlins
  for (const s of [-1, 1]) BX(c, s * 7 - 0.12 - s * 0.15, HH - 0.3, -6, s * 7 + 0.12 - s * 0.15, HH, 10);   // wall plates
  for (const z of [-4.5, -0.8, 3, 6.6]) {                                            // trusses
    BX(c, -7, HH - 0.55, z - 0.16, 7, HH - 0.2, z + 0.16);                           // tie beam
    BX(c, -0.15, HH - 0.2, z - 0.15, 0.15, RIDGE - 0.25, z + 0.15);                  // king post
    for (const s of [-1, 1]) { SEG(c, [s * 6.9, HH - 0.2, z], [s * 0.1, RIDGE - 0.25, z], 0.28, 0.24);    // principal rafters
      SEG(c, [0, HH + 0.2, z], [s * 3.4, HH + (RIDGE - HH) * 0.48 - 0.25, z], 0.18, 0.16);                  // braces
      SEG(c, [s * 6.9, HH - 1.8, z], [s * 6.0, HH - 0.55, z], 0.2, 0.2); }                                   // wall knees
    paint(c, IR, IRONC); BX(c, -0.2, HH - 0.6, z - 0.18, 0.2, HH - 0.15, z + 0.18); paint(c, OAK, WOOD2);
  }
  // iron ring chandelier over the tables
  if (L <= 2) for (const z of [1.1, 4.8]) { paint(c, IR, IRONC); SEG(c, [0, HH - 0.55, z], [0, 4.2, z], 0.03);
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 4; SEG(c, [0, 4.2, z], [Math.cos(a) * 0.9, 3.6, z + Math.sin(a) * 0.9], 0.015); }
    for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4, b = (k + 1) * Math.PI / 4; SEG(c, [Math.cos(a) * 0.9, 3.6, z + Math.sin(a) * 0.9], [Math.cos(b) * 0.9, 3.6, z + Math.sin(b) * 0.9], 0.05, 0.05); }
    for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; candle(c, Math.cos(a) * 0.9, 3.63, z + Math.sin(a) * 0.9, 0.18); } }
  // ---- wing ceilings: boards on joists ----
  for (const [x0, z0, x1, z1] of Object.values(ROOMS).slice(1)) {
    paint(c, OAK, "oklch(0.7 0.03 60)"); BX(c, x0, WH, z0, x1, WH + 0.12, z1);
    paint(c, OAK, WOOD2); for (let x = x0 + 1.2; x < x1 - 0.6; x += 1.4) BX(c, x - 0.1, WH - 0.22, z0 + T, x + 0.1, WH, z1 - T);
  }
  // ---- GREAT HALL ----
  if (on("hall")) {
  // the dais: two steps of 0.18 m up to a boarded platform
  paint(c, FS, STONE2); BX(c, -4.6, 0, -5.75, 4.6, 0.18, -2.9); BX(c, -4.3, 0.18, -5.75, 4.3, 0.36, -3.18);
  paint(c, OAK, WOOD); BX(c, -4.3, 0.36, -5.75, 4.3, 0.38, -3.18);
  rug(c, -1.3, -3.1, 1.3, 7.8, RED, GOLD);                                           // the long red runner to the chair
  // the Reeve's chair: high-backed oak, a blue cushion, finials
  { const y = 0.38, z = -4.9; paint(c, OAK, WOOD);
    BX(c, -0.45, y, z - 0.3, 0.45, y + 0.48, z + 0.3); BX(c, -0.5, y + 0.48, z - 0.35, 0.5, y + 0.56, z + 0.35);
    BX(c, -0.5, y + 0.56, z - 0.35, 0.5, y + 2.0, z - 0.23);
    for (const s of [-1, 1]) { BX(c, s * 0.5 - 0.06, y + 0.56, z - 0.35, s * 0.5 + 0.06, y + 0.9, z + 0.35); LA(c, s * 0.47, y + 2.0, z - 0.29, [[0.07, 0], [0.09, 0.1], [0, 0.24]], 6, true); }
    paint(c, CANVAS, BLUE); BX(c, -0.42, y + 0.56, z - 0.22, 0.42, y + 0.64, z + 0.3); BX(c, -0.38, y + 0.9, z - 0.23, 0.38, y + 1.85, z - 0.2);
    flatc(c, GOLD); BX(c, -0.14, y + 1.3, z - 0.2, 0.14, y + 1.58, z - 0.19); }
  // the high table on the dais: a quill, an inkpot, a goblet, the Reeve's papers
  table(c, -2.6, -4.2, 2.6, -3.45);
  flatc(c, "oklch(0.9 0.03 85)"); RB(c, -1.0, 0.8, -3.85, 0.3, 0.01, 0.4, 12); RB(c, -0.65, 0.81, -3.8, 0.3, 0.01, 0.4, -8);
  flatc(c, DARK); LA(c, -0.2, 0.78, -3.75, [[0.04, 0], [0.04, 0.06], [0.02, 0.08]], 6, true);
  flatc(c, "oklch(0.95 0.01 90)"); SEG(c, [-0.2, 0.82, -3.75], [-0.1, 1.05, -3.9], 0.01, 0.03);
  paint(c, IR, GOLD); LA(c, 1.1, 0.78, -3.8, [[0.05, 0], [0.015, 0.02], [0.015, 0.1], [0.06, 0.16], [0.05, 0.2]], 7, true);
  candle(c, -2.2, 0.78, -3.8); candle(c, 2.2, 0.78, -3.8);
  // two long tables down the hall, benches either side, trenchers and cups
  for (const s of [-1, 1]) { const x = s * 3.3; table(c, x - 0.55, -1.4, x + 0.55, 7.4);
    bench(c, x - 1.15, -1.2, x - 0.8, 7.2); bench(c, x + 0.8, -1.2, x + 1.15, 7.2);
    if (L <= 2) for (let z = -0.8; z < 7; z += 1.2) { flatc(c, "oklch(0.5 0.04 60)"); LA(c, x - 0.3, 0.78, z, [[0.12, 0], [0.13, 0.02]], 8, true); LA(c, x + 0.3, 0.78, z + 0.5, [[0.12, 0], [0.13, 0.02]], 8, true);
      paint(c, IR, "oklch(0.7 0.02 70)"); LA(c, x - 0.15, 0.78, z + 0.35, [[0.04, 0], [0.045, 0.12]], 6, true); }
    paint(c, IR, IRONC); LA(c, x, 0.78, 3, [[0.0, 0], [0.22, 0.01], [0.24, 0.06]], 10, true);                      // a platter of bones
    flatc(c, "oklch(0.85 0.03 80)"); for (const k of [-0.1, 0.05, 0.12]) SEG(c, [x - 0.12, 0.83, 3 + k], [x + 0.12, 0.85, 3 + k * 0.5], 0.03);
    candle(c, x, 0.78, 0.5); candle(c, x, 0.78, 5.5); }
  BARREL(c, -6.1, 0, 8.9, 0.36, 0.95, L); BARREL(c, -5.3, 0, 9.2, 0.33, 0.85, L); BARREL(c, 6.1, 0, 8.9, 0.36, 0.95, L);
  // tapestries: the Reeve's chevron behind the dais, the boar and the tree on the long walls
  tapestry(c, "z", -6 + T, -3.0, 5.2, 1.8, 3.4, 1, BLUE, GOLD, "chevron"); tapestry(c, "z", -6 + T, 3.0, 5.2, 1.8, 3.4, 1, BLUE, GOLD, "chevron");
  tapestry(c, "x", -7 + T, 4.6, 5.6, 1.6, 2.4, 1, "#6a2a1e", GOLD, "boar"); tapestry(c, "x", 7 - T, 4.6, 5.6, 1.6, 2.4, -1, GREEN, "oklch(0.85 0.05 85)", "tree");
  tapestry(c, "x", -7 + T, -4.4, 5.6, 1.4, 2.2, 1, GREEN, "oklch(0.85 0.05 85)", "tree"); tapestry(c, "x", 7 - T, -4.4, 5.6, 1.4, 2.2, -1, "#6a2a1e", GOLD, "boar");
  }
  // the hearths, west and east
  hearth(c, -7, 2, 1, HH); hearth(c, 7, 2, -1, HH);
  paint(c, OAK, WOOD); for (const s of [-1, 1]) { const x = s * 5.35; BX(c, x - 0.08, 0.95, 4.0, x + 0.08, 1.75, 4.1); }   // pokers' stand stubs
  for (const [x, z, s] of [[-7 + T, 8.2, 1], [7 - T, 8.2, -1], [-7 + T, -1, 1], [7 - T, -1, -1]]) sconce(c, x, 2.4, z, "x", s);
  // ---- KITCHEN (x -15..-7, z -6..2) ----
  { const [cx, cz] = hearth(c, -15, -2, 1, WH, true);
    paint(c, IR, IRONC); SEG(c, [-14.4, 0.12, -2.9], [-14.4, 0.9, -2.9], 0.04); SEG(c, [-14.4, 0.12, -1.1], [-14.4, 0.9, -1.1], 0.04);   // spit
    SEG(c, [-14.4, 0.9, -3.0], [-14.4, 0.9, -1.0], 0.03);
    flatc(c, "oklch(0.4 0.09 45)"); LA(c, -14.4, 0.9, -2.0, [[0, -0.15], [0.12, -0.1], [0.14, 0.05], [0.08, 0.15], [0, 0.18]], 7, true);  // a joint turning
    paint(c, IR, "oklch(0.5 0.01 60)"); LA(c, -13.5, 0.12, -2.0, [[0.12, 0], [0.24, 0.1], [0.26, 0.3], [0.22, 0.42], [0.24, 0.45]], 10, true);   // cauldron
    flatc(c, "oklch(0.45 0.06 90)"); LA(c, -13.5, 0.4, -2.0, [[0.21, 0], [0.21, 0.01]], 10, true); }
  if (on("kitchen")) {
  table(c, -11.6, -4.0, -9.4, -2.9, 0.86); flatc(c, "oklch(0.86 0.03 85)"); RB(c, -10.9, 0.88, -3.4, 0.5, 0.06, 0.35);                // dough on the board
  flatc(c, "oklch(0.5 0.12 40)"); for (const k of [0, 0.15, 0.3]) LA(c, -10.0 + k, 0.86, -3.6, [[0.05, 0], [0.06, 0.04], [0, 0.08]], 6, true);   // onions
  paint(c, IR, IRONC); RB(c, -9.8, 0.89, -3.2, 0.3, 0.01, 0.05, 30); paint(c, OAK, WOOD); RB(c, -9.62, 0.9, -3.3, 0.12, 0.03, 0.03, 30);       // cleaver
  for (const x of [-12.6, -11.4, -10.2, -9.0]) for (const z of [-1.2, 0.2]) ham(c, x + (z > 0 ? 0.6 : 0), WH - 0.22, z);                       // hams from the joists
  paint(c, OAK, WOOD2); BX(c, -13.2, WH - 0.4, -1.25, -8.4, WH - 0.22, -1.15); BX(c, -13.2, WH - 0.4, 0.15, -8.4, WH - 0.22, 0.25);            // ham poles
  shelf(c, "z", -6 + T, -13.6, -9.2, [1.2, 1.8], 1);
  for (let i = 0; i < 9; i++) { const x = -13.4 + i * 0.48, y = i % 2 ? 1.25 : 1.85; flatc(c, i % 3 ? "oklch(0.55 0.08 50)" : "oklch(0.7 0.04 80)"); LA(c, x, y, -5.55, [[0.08, 0], [0.11, 0.08], [0.06, 0.2], [0.07, 0.24]], 7, true); }
  BARREL(c, -8.0, 0, -5.2, 0.36, 0.95, L); BARREL(c, -8.1, 0, -4.3, 0.33, 0.85, L); BARREL(c, -8.0, 0.95, -5.2, 0.3, 0.7, L);
  paint(c, CANVAS, "oklch(0.85 0.04 85)"); RB(c, -14.3, 0.35, 1.2, 0.6, 0.7, 0.5, 15); RB(c, -13.7, 0.3, 1.4, 0.55, 0.6, 0.45, -10);   // flour sacks
  }
  // ---- GUARD ROOM (x -15..-7, z 2..10) ----
  if (on("guard")) {
  for (const z of [3.0, 5.6, 8.2]) { bed(c, -14.7, z - 0.45, -12.7, z + 0.45, { blanket: z === 5.6 ? "#4a4a3a" : "#5a4632", h: 0.38 }); chest(c, -12.35, z, 0.5, 0.42, 90, 0.42); }
  BARREL(c, -10.3, 0, 6.0, 0.4, 0.92, L);
  paint(c, OAK, WOOD); BX(c, -10.75, 0.92, 5.55, -9.85, 0.95, 6.45);                                                 // board on the barrel
  flatc(c, "oklch(0.92 0.02 85)"); RB(c, -10.4, 0.99, 5.85, 0.07, 0.07, 0.07, 20); RB(c, -10.15, 0.99, 6.05, 0.07, 0.07, 0.07, 55); RB(c, -10.5, 0.99, 6.2, 0.07, 0.07, 0.07, -10);
  flatc(c, DARK); for (const [x, z] of [[-10.4, 5.81], [-10.15, 6.01], [-10.5, 6.16]]) BX(c, x - 0.012, 1.03, z, x + 0.012, 1.031, z + 0.012);
  paint(c, IR, GOLD); for (const [x, z] of [[-10.0, 5.75], [-9.98, 5.78], [-10.65, 6.35]]) LA(c, x, 0.95, z, [[0.02, 0], [0.02, 0.008]], 6, true);   // coins wagered
  paint(c, IR, "oklch(0.7 0.02 70)"); LA(c, -10.6, 0.95, 5.7, [[0.04, 0], [0.045, 0.12]], 6, true);
  for (const [x, z] of [[-11.2, 5.6], [-9.4, 6.5]]) { paint(c, OAK, WOOD2); LA(c, x, 0, z, [[0.2, 0], [0.18, 0.45], [0.2, 0.47]], 8, true); }  // stools
  rack(c, -10.0, 10 - T, 3.0, -1);
  paint(c, IR, IRONC); for (const x of [-13.8, -12.6]) { LA(c, x, 1.6, 2 + T + 0.2, [[0.0, -0.05], [0.18, 0.05], [0.2, 0.18], [0.0, 0.32]], 8, true); }   // helms on pegs
  sconce(c, -15 + T, 2.3, 6.9, "x", 1);
  }
  // ---- REEVE'S CHAMBERS (x 7..15, z -6..2) ----
  if (on("reeve")) {
  rug(c, 9.0, -4.0, 13.0, 0.6, WINE, GOLD);
  { const x0 = 12.0, x1 = 14.6, z0 = -5.7, z1 = -3.4;                                                                // canopied bed, head to the north wall
    bed(c, x0, z0, x1, z1, { blanket: BLUE, h: 0.55 });
    paint(c, OAK, WOOD); for (const [x, z] of [[x0, z0], [x1 - 0.12, z0], [x0, z1 - 0.12], [x1 - 0.12, z1 - 0.12]]) { BX(c, x, 0, z, x + 0.12, 2.6, z + 0.12); LA(c, x + 0.06, 2.6, z + 0.06, [[0.06, 0], [0, 0.15]], 6, true); }
    BX(c, x0, 2.45, z0, x1, 2.6, z0 + 0.1); BX(c, x0, 2.45, z1 - 0.1, x1, 2.6, z1); BX(c, x0, 2.45, z0, x0 + 0.1, 2.6, z1); BX(c, x1 - 0.1, 2.45, z0, x1, 2.6, z1);
    paint(c, CANVAS, WINE); BX(c, x0, 2.6, z0, x1, 2.64, z1);                                                           // canopy
    for (let i = 0; i < 6; i++) BX(c, x0 + i * (x1 - x0) / 6, 2.15 + (i % 2) * 0.08, z1 - 0.02, x0 + (i + 1) * (x1 - x0) / 6, 2.45, z1 + 0.02);   // valance
    for (const x of [x0 - 0.02, x1 - 0.02]) BX(c, x, 0.3, z0 + 0.12, x + 0.04, 2.45, z0 + 0.9);                        // curtains, tied back
    flatc(c, GOLD); for (const x of [x0, x1]) BX(c, x - 0.03, 1.2, z0 + 0.86, x + 0.07, 1.26, z0 + 0.98); }
  chest(c, 13.3, -2.9, 1.1, 0.55, 0, 0.5);                                                                             // the foot chest
  // writing desk under the sconce, quill and ink, letters, a wine jug and a cup
  { paint(c, OAK, WOOD); table(c, 8.0, -5.6, 9.9, -4.7, 0.8);
    BX(c, 8.0, 0.8, -5.62, 9.9, 1.2, -5.5); BX(c, 8.0, 1.12, -5.62, 9.9, 1.17, -5.25);                                // pigeonhole back + shelf
    for (let i = 0; i < 5; i++) { flatc(c, "oklch(0.88 0.04 85)"); RB(c, 8.25 + i * 0.36, 0.95, -5.45, 0.2, 0.18, 0.1, 0, 90, 0); }   // rolled letters
    flatc(c, "oklch(0.9 0.03 85)"); RB(c, 8.7, 0.81, -5.0, 0.32, 0.01, 0.42, 6); RB(c, 9.05, 0.812, -4.95, 0.3, 0.01, 0.4, -14);
    flatc(c, DARK); LA(c, 9.45, 0.8, -5.1, [[0.04, 0], [0.045, 0.05], [0.02, 0.07]], 6, true);
    flatc(c, "oklch(0.95 0.01 90)"); SEG(c, [9.45, 0.84, -5.1], [9.55, 1.1, -5.25], 0.008, 0.035);
    flatc(c, RED); LA(c, 8.95, 0.81, -4.85, [[0.035, 0], [0.035, 0.015]], 8, true);                                   // the seal wax
    flatc(c, "oklch(0.55 0.08 55)"); LA(c, 8.35, 0.8, -4.9, [[0.06, 0], [0.09, 0.08], [0.09, 0.16], [0.05, 0.24], [0.04, 0.3], [0.055, 0.32]], 8, true);   // clay wine jug
    BX(c, 8.42, 0.95, -4.91, 8.46, 1.08, -4.89);
    paint(c, IR, "oklch(0.75 0.03 80)"); LA(c, 8.6, 0.8, -4.85, [[0.035, 0], [0.012, 0.02], [0.012, 0.07], [0.045, 0.12]], 6, true);
    candle(c, 9.7, 0.8, -5.3, 0.14);
    paint(c, OAK, WOOD); BX(c, 8.65, 0, -4.1, 9.25, 0.46, -3.6); BX(c, 8.65, 0.46, -3.66, 9.25, 1.1, -3.6); }
  tapestry(c, "x", 15 - T, -1.8, 3.4, 2.2, 2.0, -1, BLUE, GOLD, "chevron");
  paint(c, IR, IRONC); LA(c, 13.6, 0, 0.9, [[0.18, 0], [0.12, 0.1], [0.05, 0.12], [0.05, 0.6], [0.0, 0.62]], 6, true);   // a sword stand by the door
  RB(c, 13.6, 0.95, 0.9, 0.06, 0.9, 0.015); paint(c, OAK, WOOD); RB(c, 13.6, 1.45, 0.9, 0.3, 0.04, 0.06);
  sconce(c, 7 + T, 2.3, -4.4, "x", 1);
  }
  // ---- STEWARD'S OFFICE (x 7..15, z 2..10) ----
  if (on("steward")) {
  table(c, 10.2, 4.6, 12.0, 5.8, 0.8);                                                                                  // the counting table
  for (let i = 0; i < 3; i++) { flatc(c, [WINE, "#3a2a1a", BLUE][i]); RB(c, 10.6 + i * 0.05, 0.84 + i * 0.07, 5.1, 0.42, 0.07, 0.32, 8 - i * 9); }   // a stack of ledgers
  flatc(c, "oklch(0.9 0.03 85)"); RB(c, 11.2, 0.81, 5.3, 0.5, 0.03, 0.36, 0); flatc(c, "#3a2a1a"); RB(c, 11.2, 0.82, 5.3, 0.02, 0.02, 0.36);   // open ledger
  paint(c, IR, GOLD); for (let k = 0; k < 4; k++) LA(c, 11.75, 0.8 + k * 0.012, 4.9, [[0.025, 0], [0.025, 0.01]], 6, true);
  for (let k = 0; k < 6; k++) LA(c, 11.62, 0.8 + k * 0.012, 5.0, [[0.025, 0], [0.025, 0.01]], 6, true);
  paint(c, IR, "oklch(0.8 0.05 80)"); SEG(c, [11.5, 0.8, 5.6], [11.5, 1.15, 5.6], 0.015); SEG(c, [11.25, 1.12, 5.6], [11.75, 1.12, 5.6], 0.012);     // balance scales
  LA(c, 11.25, 0.95, 5.6, [[0.0, 0], [0.08, 0.02]], 8, true); LA(c, 11.75, 0.95, 5.6, [[0.0, 0], [0.08, 0.02]], 8, true);
  candle(c, 10.4, 0.8, 5.6);
  paint(c, OAK, WOOD); BX(c, 12.3, 0, 4.95, 12.8, 0.46, 5.45); BX(c, 12.74, 0.46, 4.95, 12.8, 1.1, 5.45);                 // steward's stool-chair, his back to the wall
  shelf(c, "x", 15 - T, 3.0, 8.2, [0.4, 1.0, 1.6, 2.2], -1, 0.38);
  for (const [y, sd] of [[0.45, 3], [1.05, 7], [1.65, 11], [2.25, 19]]) books(c, "x", 15 - T, 3.1, 8.1, y, -1, sd);
  chest(c, 8.2, 9.2, 1.0, 0.6, 0, 0.55); chest(c, 9.5, 9.2, 1.0, 0.6, 0, 0.55); chest(c, 8.85, 9.2, 0.9, 0.55, 0, 0.5);   // three tax chests (the third sits on top below)
  paint(c, OAK, WOOD); RB(c, 8.85, 0.98, 9.2, 0.8, 0.4, 0.5, 6); paint(c, IR, IRONC); RB(c, 8.85, 0.98, 9.2, 0.84, 0.06, 0.54, 6);
  flatc(c, "oklch(0.3 0.04 60)"); for (const [x, z] of [[10.8, 9.4], [11.3, 9.5], [11.05, 9.0]]) LA(c, x, 0, z, [[0.12, 0], [0.18, 0.12], [0.15, 0.3], [0.05, 0.36], [0.08, 0.4]], 7, true);   // coin sacks
  paint(c, CANVAS, "oklch(0.92 0.02 85)"); BX(c, 7 + T + 0.01, 1.4, 3.6, 7 + T + 0.03, 2.4, 4.6);                       // a posted tax roll
  flatc(c, "#3a2a1a"); for (let k = 0; k < 7; k++) BX(c, 7 + T + 0.035, 2.25 - k * 0.11, 3.75, 7 + T + 0.04, 2.27 - k * 0.11, 3.75 + 0.5 + (k * 37 % 5) * 0.07);
  sconce(c, 15 - T, 2.3, 9.0, "x", -1);
  }
}

function collider0(ctx) {
  const b = CB();
  b(-15.25, -0.3, -6.25, 15.25, 0, 10.25);
  allWalls(b);
  // hall hearths and the kitchen's
  for (const [wx, z, s, hw] of [[-7, 2, 1, 1.3], [7, 2, -1, 1.3], [-15, -2, 1, 1.1]]) { const x0 = wx + s * T, x1 = x0 + s * 0.9; b(Math.min(x0, x1), 0, z - hw, Math.max(x0, x1), 3.8, z + hw); }
  // dais steps
  if (on("hall")) { b(-4.6, 0, -5.75, 4.6, 0.18, -2.9); b(-4.3, 0.18, -5.75, 4.3, 0.38, -3.18);
  b(-0.5, 0.38, -5.25, 0.5, 2.4, -4.55); b(-2.6, 0, -4.2, 2.6, 0.78, -3.45);
  for (const s of [-1, 1]) { const x = s * 3.3; b(x - 0.55, 0, -1.4, x + 0.55, 0.78, 7.4); b(x - 1.15, 0, -1.2, x - 0.8, 0.46, 7.2); b(x + 0.8, 0, -1.2, x + 1.15, 0.46, 7.2); } }
  // kitchen
  if (on("kitchen")) b(-11.6, 0, -4.0, -9.4, 0.86, -2.9); if (on("kitchen")) b(-8.4, 0, -5.6, -7.25, 1.65, -3.95);
  // guard room: cots, chests, barrel, rack
  if (on("guard")) { for (const z of [3.0, 5.6, 8.2]) { b(-14.75, 0, z - 0.45, -12.1, 0.42, z + 0.45); }
  b(-10.7, 0, 5.6, -9.9, 0.95, 6.4); b(-11.5, 0, 9.3, -8.5, 1.6, 9.75); }
  // reeve's chambers
  if (on("reeve")) { b(12.0, 0, -5.7, 14.6, 0.6, -3.4); b(12.75, 0, -3.2, 13.85, 0.56, -2.6); b(8.0, 0, -5.6, 9.9, 0.8, -4.7); }
  // steward's office
  if (on("steward")) { b(10.2, 0, 4.6, 12.0, 0.8, 5.8); b(14.37, 0, 3.0, 14.75, 2.3, 8.2); b(7.7, 0, 8.9, 10.0, 1.2, 9.5); }
  return b.list;
}

// roomy interiors: params.grow widens the shell and lifts the ceilings, furniture keeps human height (scripts/lib/roomy.js)
export function geometry(ctx) { P = ctx.params ?? {}; return geometry0(grown(ctx, ctx.params?.grow)); }
export function collider(ctx) { P = ctx.params ?? {}; return growBoxes(collider0(ctx), ctx.params?.grow); }
const bench = bench_valenfeldKeepHall({ BX, OAK, WOOD2, paint });
const table = table_valenfeldKeepHall({ BX, OAK, WOOD, WOOD2, paint });
const rack = rack_valenfeldKeepHall({ BX, IR, IRONC, LA, OAK, PIPE, RB, WOOD, WOOD2, paint });
const sconce = sconce_valenfeldKeepHall({ IR, IRONC, LA, SEG, candle, paint });
