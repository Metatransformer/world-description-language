// GULLHAVEN's harbour works, params.kind:
//  town: the root's ground. The Kingsway's flagged street from the coach stand (local x 46) west to the
//        harbour square (x -57..-38, z -6..26), kerbed; the harbour wall along x = -58 facing the sea (-x),
//        battered fieldstone with a parapet, buttresses and round bastions, gap z 8..22 for the pier.
//  pier: origin at its root, runs -x: landing stage 6 m wide (x 0..-16, deck 0.1), ramp down 1.6 m
//        (x -16..-30), head (x -30..-44, T 10 m wide over x -36..-44, deck -1.5); piles to -9.
//  lighthouse: on its own rock mound; door on -z up stone steps; lantern room at 17..19 m.
import { paint, flatc, glow, BX, RB, LA, CY, HX, SEG, PIPE, ROPE, TORUS, CB, FS, OAK, FLAG, IR, PL, ROCK, DRIFT, STONE, WOOD, WHITE, IRONC, DRIFTC } from "../lib/buildkit.js";
import { rng } from "../lib/geo.js";
const WX = -58, SEGS = [[-36, 8], [22, 56]], BAST = [-36, 8, 22, 56];
const STREET = [-46, 46, -3.2, 3.2], SQUARE = [-57.3, -38, -6, 26];
function blob(c, cx, cy, cz, rx, ry, rz, R, n, m) {
  const J = []; for (let j = 0; j <= m; j++) { const r = []; for (let i = 0; i < n; i++) r.push(0.8 + 0.38 * R()); r.push(r[0]); J.push(r); }
  const P = (i, j) => { const a = i / n * Math.PI * 2, f = -0.35 * Math.PI + j / m * 0.85 * Math.PI, k = J[j][i];
    return [cx + Math.cos(f) * Math.cos(a) * rx * k, cy + Math.sin(f) * ry * k, cz + Math.cos(f) * Math.sin(a) * rz * k]; };
  for (let j = 0; j < m; j++) for (let i = 0; i < n; i++) c.quad(...P(i, j), ...P(i, j + 1), ...P(i + 1, j + 1), ...P(i + 1, j));
}
function flags(c, D, R, [x0, x1, z0, z1]) {
  const tA = "oklch(0.93 0.01 80)", tB = "oklch(0.86 0.015 70)", A = [], B = [];
  if (D >= 3) { A.push([x0, z0, x1, z1, 0.05]); }
  else { const s = D <= 1 ? 1.3 : 2.6;
    for (let z = z0; z < z1 - 0.05; z += s * 0.75) { const zb = Math.min(z1, z + s * 0.75); let x = x0 - R() * s;
      while (x < x1) { const len = s * (0.7 + R() * 0.6), xa = Math.max(x0, x), xb = Math.min(x1, x + len);
        if (xb - xa > 0.1) (R() < 0.5 ? A : B).push([xa + 0.03, z + 0.03, xb - 0.03, zb - 0.03, 0.035 + R() * 0.035]); x += len; } } }
  const top = (r) => c.quad(r[0], r[4], r[3], r[2], r[4], r[3], r[2], r[4], r[1], r[0], r[4], r[1]);
  paint(c, FLAG, tA); for (const r of A) top(r); if (B.length) { paint(c, FLAG, tB); for (const r of B) top(r); }
}
function town(c, D) {
  const R = rng(11);
  flags(c, D, R, STREET); flags(c, D, R, SQUARE);
  // kerbs along the street, lane to the square
  paint(c, FS, "oklch(0.9 0.01 80)");
  for (const zk of [-3.35, 3.35]) {
    if (D >= 3) { BX(c, -38, 0, zk - 0.14, 46, 0.1, zk + 0.14); continue; }
    for (let x = -38; x < 46;) { const l = 0.7 + R() * 0.7, xb = Math.min(46, x + l); BX(c, x + 0.02, 0, zk - 0.14, xb - 0.02, 0.08 + R() * 0.05, zk + 0.14); x = xb; } }
  // the harbour wall
  const xo = (y) => WX - 1.0 - 0.6 * (0.15 - y) / 6.15;
  for (const [za, zb] of SEGS) {
    paint(c, FS, STONE);
    HX(c, [[WX + 0.6, -6, za], [WX - 1.6, -6, za], [WX - 1.6, -6, zb], [WX + 0.6, -6, zb], [WX + 0.6, 0.15, za], [WX - 1.0, 0.15, za], [WX - 1.0, 0.15, zb], [WX + 0.6, 0.15, zb]]);
    paint(c, FS, "oklch(0.97 0.008 85)"); BX(c, WX - 1.12, 0.15, za, WX + 0.7, 0.35, zb);
    if (D <= 4) { paint(c, FS, STONE); BX(c, WX - 1.0, 0.35, za, WX - 0.45, 1.0, zb); paint(c, FS, "oklch(0.97 0.008 85)"); BX(c, WX - 1.06, 1.0, za, WX - 0.39, 1.12, zb); }
    if (D <= 2) { paint(c, FS, "oklch(0.86 0.02 110)");
      for (let z = za + 3; z < zb - 2; z += 5) HX(c, [[WX - 1.0, -6, z - 0.45], [WX - 2.3, -6, z - 0.45], [WX - 2.3, -6, z + 0.45], [WX - 1.0, -6, z + 0.45], [WX - 1.05, -0.3, z - 0.45], [WX - 1.25, -0.3, z - 0.45], [WX - 1.25, -0.3, z + 0.45], [WX - 1.05, -0.3, z + 0.45]]);
      if (D <= 1) for (const y of [-1.5, -3.0]) { const x = xo(y); BX(c, x - 0.07, y, za, x + 0.1, y + 0.13, zb); }
      paint(c, IR, IRONC); for (const z of [za + 2, zb - 2]) if (Math.abs(z - 8) < 3 || Math.abs(z - 22) < 3) TORUS(c, xo(-0.5) - 0.05, -0.5, z, 0.16, 0.025, 10, 4, "x"); }
  }
  for (const z of BAST) { const n = D <= 2 ? 14 : 7; paint(c, FS, STONE); CY(c, WX - 0.4, -6, z, 1.7, 7.2, n);
    paint(c, FS, "oklch(0.97 0.008 85)"); LA(c, WX - 0.4, 1.2, z, [[1.85, 0], [1.85, 0.2]], n, true);
    if (D <= 2) { paint(c, FS, STONE); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; RB(c, WX - 0.4 + Math.cos(a) * 1.6, 1.6, z + Math.sin(a) * 1.6, 0.6, 0.4, 0.35, -a * 180 / Math.PI); } } }
}
const PY = (x) => x > -16 ? 0.1 : x > -30 ? 0.1 + (x + 16) / 14 * 1.6 : -1.5;
const PW = (x) => x > -16 ? 3 : x > -36 ? 1.8 : 5;
function pier(c, D) {
  const R = rng(7), tA = DRIFTC, tB = "oklch(0.82 0.02 65)";
  if (D <= 2) { const A = [], B = [];
    for (let x = 0; x > -44; x -= 0.32) { const xm = x - 0.16; (R() < 0.6 ? A : B).push([x, PY(xm), PW(xm) - (R() < 0.15 ? 0.3 : 0)]); }
    paint(c, DRIFT, tA); for (const [x, y, w] of A) BX(c, x - 0.29, y - 0.07, -w, x, y, w);
    paint(c, DRIFT, tB); for (const [x, y, w] of B) BX(c, x - 0.29, y - 0.07, -w, x, y, w);
  } else { paint(c, DRIFT, tA); BX(c, -16, -0.15, -3, 0, 0.1, 3);
    HX(c, [[-16, -0.15, -1.8], [-30, -1.75, -1.8], [-30, -1.75, 1.8], [-16, -0.15, 1.8], [-16, 0.1, -1.8], [-30, -1.5, -1.8], [-30, -1.5, 1.8], [-16, 0.1, 1.8]]);
    BX(c, -36, -1.75, -1.8, -30, -1.5, 1.8); BX(c, -44, -1.75, -5, -36, -1.5, 5); }
  paint(c, OAK, "oklch(0.8 0.02 60)");
  const posts = []; for (let x = -1.5; x > -44; x -= 3) { const w = PW(x) - 0.2; posts.push([x, -w], [x, w]); if (w > 2) posts.push([x, 0]); }
  posts.push([-43.8, -4.8], [-43.8, 4.8], [-43.8, 0]);
  if (D <= 3) {
    for (const [x, z] of posts) PIPE(c, [x, PY(x) - 0.08, z], [x, -9, z], 0.17, 0.2, D <= 2 ? 7 : 5);
    for (const s of [-1, 1]) { SEG(c, [0, -0.2, s * 2.85], [-16, -0.2, s * 2.85], 0.22, 0.3); SEG(c, [-16, -0.2, s * 1.65], [-30, -1.8, s * 1.65], 0.22, 0.3);
      SEG(c, [-30, -1.8, s * 1.65], [-36, -1.8, s * 1.65], 0.22, 0.3); SEG(c, [-36, -1.8, s * 4.85], [-44, -1.8, s * 4.85], 0.22, 0.3); }
    for (let x = -1.5; x > -44; x -= 3) { const w = PW(x), y = PY(x) - 0.38; SEG(c, [x, y, -w], [x, y, w], 0.26, 0.24);
      if (D <= 2) { SEG(c, [x, y - 0.1, -w + 0.2], [x, -3.6, w - 0.2], 0.12, 0.12); SEG(c, [x, y - 0.1, w - 0.2], [x, -3.6, -w + 0.2], 0.12, 0.12); } }
    // weed and wet at the tide line
    if (D <= 2) { flatc(c, "oklch(0.32 0.04 140)"); for (const [x, z] of posts) if (PY(x) < 0) CY(c, x, -0.5, z, 0.215, 0.7, 7); }
  } else if (D === 4) for (const [x, z] of [[-1.5, -2.8], [-1.5, 2.8], [-43.8, -4.8], [-43.8, 4.8]]) BX(c, x - 0.17, -9, z - 0.17, x + 0.17, PY(x), z + 0.17);
  if (D <= 2) {
    // rope rail down the ramp
    paint(c, OAK, WOOD); for (const s of [-1, 1]) { let prev = null;
      for (let x = -16; x >= -30; x -= 3.5) { const y = PY(x), z = s * 1.72; BX(c, x - 0.07, y, z - 0.07, x + 0.07, y + 1.0, z + 0.07); const top = [x, y + 0.95, z];
        if (prev) { flatc(c, "oklch(0.62 0.05 75)"); ROPE(c, prev, top, 0.14, 0.022, 4); paint(c, OAK, WOOD); } prev = top; } }
    // bollards, coiled rope, a ladder down to the water
    for (const [x, z] of [[-37, -4.7], [-43.4, -4.7], [-37, 4.7], [-43.4, 4.7], [-43.4, 0]]) { paint(c, OAK, "oklch(0.75 0.02 60)"); LA(c, x, -1.5, z, [[0.2, 0], [0.18, 0.45], [0.24, 0.5], [0.24, 0.58]], 9, true); }
    flatc(c, "oklch(0.62 0.05 75)"); for (let i = 0; i < 3; i++) TORUS(c, -40, -1.43 + i * 0.07, 3.2, 0.36 - i * 0.05, 0.05, 12, 4);
    paint(c, OAK, WOOD); for (const z of [1.5, 2.1]) BX(c, -44.15, -4, z - 0.04, -44.05, -1.3, z + 0.04); for (let y = -3.7; y < -1.5; y += 0.35) BX(c, -44.12, y, 1.5, -44.08, y + 0.05, 2.1);
  }
}
function lighthouse(c, D) {
  const R = rng(31); paint(c, ROCK, "oklch(0.9 0.015 80)");
  const rocks = [[0, -1, 0, 6.2, 3.0, 5.6], [4.6, -1.4, 3, 3.4, 2.2, 3], [-4.8, -1.8, 2.2, 3.2, 2.3, 3.4], [1.5, -2, 5, 4, 2.4, 2.6], [-3.4, -2.2, -4.6, 2.8, 2.1, 2.6], [3.5, -2.2, -4.2, 2.6, 1.8, 2.4]];
  const use = D <= 2 ? rocks : D <= 3 ? rocks.slice(0, 3) : rocks.slice(0, 1);
  for (const r of use) blob(c, ...r, R, D <= 2 ? 11 : 6, D <= 2 ? 5 : 3);
  if (D <= 2) { flatc(c, "oklch(0.5 0.07 130)"); blob(c, -1.5, 1.35, 2.5, 1.8, 0.5, 1.4, R, 7, 2); blob(c, 2.8, 0.6, 3.6, 1.2, 0.4, 1.1, R, 7, 2); }
  const n = D <= 2 ? 18 : D <= 3 ? 10 : 7;
  // steps from the ground up to the door on -z
  paint(c, FS, "oklch(0.93 0.01 85)");
  if (D <= 3) for (let i = 0; i < 13; i++) { const z = -3.3 - i * 0.28, h = 2.6 - i * 0.2; BX(c, -0.9, -0.6, z - 0.28, 0.9, h, z); }
  else HX(c, [[-0.9, -0.6, -3.3], [0.9, -0.6, -3.3], [0.9, -0.6, -6.9], [-0.9, -0.6, -6.9], [-0.9, 2.6, -3.3], [0.9, 2.6, -3.3], [0.9, 0, -6.9], [-0.9, 0, -6.9]]);
  paint(c, FS, STONE); CY(c, 0, 1.0, 0, 3.35, 1.6, n);
  paint(c, PL, WHITE); LA(c, 0, 2.6, 0, [[2.95, 0], [2.6, 6.5], [2.25, 13]], n, false);
  if (D <= 4) { paint(c, PL, "oklch(0.62 0.12 35)"); LA(c, 0, 10.6, 0, [[2.44, 0], [2.36, 2.2]], n, false); }
  paint(c, FS, STONE); if (D <= 3) LA(c, 0, 8.3, 0, [[2.68, 0], [2.68, 0.45]], n, false);
  LA(c, 0, 15.2, 0, [[2.26, 0], [2.9, 0.75], [3.25, 1.0], [3.25, 1.3]], n, true);
  // lantern room
  CY(c, 0, 16.5, 0, 1.75, 0.7, n);
  glow(c, "#ffdca8", [2.4, 1.5, 0.6]); CY(c, 0, 17.2, 0, 1.5, 2.0, D <= 2 ? 12 : 8);
  paint(c, IR, IRONC);
  if (D <= 3) for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; RB(c, Math.cos(a) * 1.55, 18.2, Math.sin(a) * 1.55, 0.09, 2.0, 0.09, -a * 180 / Math.PI); }
  CY(c, 0, 19.2, 0, 1.9, 0.2, n);
  flatc(c, "oklch(0.3 0.02 230)"); LA(c, 0, 19.4, 0, [[1.95, 0], [0.25, 1.5], [0.08, 1.7]], n, true);
  paint(c, IR, IRONC); LA(c, 0, 21.0, 0, [[0.01, 0], [0.16, 0.1], [0.18, 0.2], [0.12, 0.32], [0.01, 0.38]], 8, true);
  if (D <= 2) { BX(c, -0.02, 21.3, -0.02, 0.02, 22.1, 0.02); RB(c, 0.15, 21.9, 0, 0.5, 0.12, 0.02); BX(c, -0.3, 21.75, -0.012, 0.3, 21.77, 0.012); BX(c, -0.012, 21.75, -0.3, 0.012, 21.77, 0.3); }
  // gallery railing
  if (D <= 3) { const m = D <= 2 ? 20 : 10; for (let i = 0; i < m; i++) { const a = i / m * Math.PI * 2; BX(c, Math.cos(a) * 3.1 - 0.03, 16.5, Math.sin(a) * 3.1 - 0.03, Math.cos(a) * 3.1 + 0.03, 17.5, Math.sin(a) * 3.1 + 0.03); }
    TORUS(c, 0, 17.5, 0, 3.1, 0.04, m, 4); if (D <= 2) TORUS(c, 0, 17.0, 0, 3.1, 0.025, m, 4); }
  // door, surround, slit windows
  paint(c, FS, "oklch(0.97 0.008 85)"); BX(c, -0.85, 2.55, -3.1, 0.85, 5.1, -2.75);
  paint(c, OAK, "oklch(0.7 0.03 50)"); BX(c, -0.6, 2.6, -3.16, 0.6, 4.75, -3.05);
  if (D <= 2) { paint(c, IR, IRONC); for (const y of [3.0, 4.3]) BX(c, -0.58, y, -3.2, 0.58, y + 0.08, -3.15); BX(c, 0.32, 3.6, -3.24, 0.4, 3.75, -3.16); }
  for (const [a, y, lit] of [[-Math.PI / 2, 7, 1], [0, 9.5, 0], [-Math.PI / 2, 12, 1], [Math.PI, 13.5, 0]]) { const r = 2.95 - (y - 2.6) / 13 * 0.7;
    if (lit) glow(c, "#ffc98a", [1.2, 0.7, 0.28]); else flatc(c, "oklch(0.22 0.01 250)"); RB(c, Math.cos(a) * r, y, Math.sin(a) * r, 0.28, 0.9, 0.12, -a * 180 / Math.PI - 90); }
}
export function geometry(c) { const k = c.params.kind, D = c.lod; if (k === "pier") pier(c, D); else if (k === "lighthouse") lighthouse(c, D); else town(c, D); }
export function collider(c) {
  const k = c.params.kind, b = CB();
  if (k === "pier") { b(-16, -0.5, -3, 0, 0.1, 3); for (let i = 0; i < 14; i++) { const xa = -16 - i, top = PY(xa - 0.5); b(xa - 1, top - 0.4, -1.8, xa, top, 1.8); }
    b(-36, -1.9, -1.8, -30, -1.5, 1.8); b(-44, -1.9, -5, -36, -1.5, 5); }
  else if (k === "lighthouse") { b(-6, -1, -5.5, 6, 1.0, 6); for (let i = 0; i < 13; i++) { const z = -3.3 - i * 0.28; b(-0.9, -0.6, z - 0.28, 0.9, 2.6 - i * 0.2, z); } b(-3.35, 1.0, -3.35, 3.35, 2.6, 3.35); b(-2.7, 2.6, -2.7, 2.7, 16.5, 2.7); }
  else { for (const [za, zb] of SEGS) { b(WX - 1.0, -6, za, WX + 0.6, 0.35, zb); b(WX - 1.0, 0.35, za, WX - 0.45, 1.12, zb); }
    for (const z of BAST) b(WX - 2.1, -6, z - 1.7, WX + 1.3, 1.4, z + 1.7); }
  return b.list;
}
