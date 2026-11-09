// fighters-ring kit: a small octagonal ring on packed sand, fieldstone kerb, oak posts with hemp rope,
// an open gate to the south between two banner posts and braziers, plank benches east and west.
// Every number lives in scripts/lib/data/kit-ring.yml. Local frame: centre at origin, feet y 0, gate +z.
import K from "../lib/data/kit-ring.json";
import { paint, BX, RB, CY, LA, PIPE, ROPE } from "../lib/buildkit.js";
import { XF, SOLIDS } from "../lib/furnkit.js";
const T = K.tex, C = K.col, TAU = Math.PI * 2;
const corner = (i, r) => { const a = (i + 0.5) / 8 * TAU; return [Math.sin(a) * r, Math.cos(a) * r]; }; // corners straddle the axes: a flat side faces each way
function octFan(w, r, y) { for (let i = 0; i < 8; i++) { const a = corner(i, r), b = corner(i + 1, r); w.tri(0, y, 0, a[0], y, a[1], b[0], y, b[1]); } }
function layout(w) {
  const R = K.R, fy = K.floorY;
  // plinth: kerb ring of stone, sand inside
  paint(w, T.stone, C.stone);
  for (let i = 0; i < 8; i++) { const a = corner(i, K.kerbOut), b = corner(i + 1, K.kerbOut), c = corner(i + 1, R), d = corner(i, R), y1 = K.kerbH, y0 = -K.sink;
    w.quad(a[0], y1, a[1], b[0], y1, b[1], c[0], y1, c[1], d[0], y1, d[1]);            // top
    w.quad(b[0], y0, b[1], a[0], y0, a[1], a[0], y1, a[1], b[0], y1, b[1]);            // outer face
    w.quad(d[0], fy, d[1], c[0], fy, c[1], c[0], y1, c[1], d[0], y1, d[1]); }          // inner lip above the sand
  paint(w, T.sand, C.sand); octFan(w, R + 0.01, fy);
  w.solid(-K.kerbOut * 0.92, -K.sink, -K.kerbOut * 0.92, K.kerbOut * 0.92, fy, K.kerbOut * 0.92);
  // old blood worked into the sand
  if (w.lod <= 3) { w.albedo(null); w.color(C.stain, 0.75); for (const [x, z, s] of K.stains) for (let i = 0; i < 7; i++) { const a = i / 7 * TAU, b = (i + 1) / 7 * TAU, k = 0.7 + 0.3 * Math.sin(i * 2.3 + x);
      w.tri(x, fy + 0.006, z, x + Math.cos(b) * s * k, fy + 0.006, z + Math.sin(b) * s * k, x + Math.cos(a) * s, fy + 0.006, z + Math.sin(a) * s); } w.color(C.stain); }
  // posts and ropes: the side between corners 7 and 0 (facing +z... corner 0 sits at +z+x) stays open as the gate
  const tops = [];
  for (let i = 0; i < 8; i++) { const [x, z] = corner(i, R);
    paint(w, T.oak, C.oak); CY(w, x, -0.2, z, K.postR, K.postH + 0.2, 8); w.solid(x - K.postR, 0, z - K.postR, x + K.postR, K.postH, z + K.postR);
    paint(w, T.iron, C.iron); LA(w, x, K.postH, z, [[K.postR + 0.02, 0], [K.postR + 0.02, 0.05], [0.04, 0.16]], 8, true);
    for (const y of K.ropes) LA(w, x, y - 0.04, z, [[K.postR + 0.015, 0], [K.postR + 0.015, 0.08]], 8, false);
    tops.push([x, z]); }
  paint(w, T.rope, C.rope);
  for (let i = 0; i < 8; i++) { if (i === 7) continue; const a = tops[i], b = tops[(i + 1) % 8];
    for (const y of K.ropes) ROPE(w, [a[0], y, a[1]], [b[0], y, b[1]], K.ropeSag, 0.03, 5); }
  // the gate: two taller banner posts just outside the open side, red cloth hanging
  const g0 = tops[7], g1 = tops[0];
  for (const g of [g0, g1]) { const x = g[0] * 1.12, z = g[1] * 1.12 + 0.3;
    paint(w, T.oak, C.oak); CY(w, x, -0.2, z, 0.11, 3.2, 8); w.solid(x - 0.11, 0, z - 0.11, x + 0.11, 3.2, z + 0.11);
    BX(w, x - 0.5 * Math.sign(x), 2.85, z - 0.05, x, 2.95, z + 0.05);
    paint(w, T.cloth, C.cloth); const bx = x - 0.32 * Math.sign(x); RB(w, bx, 2.2, z, 0.48, 1.3, 0.03); w.tri(bx - 0.24, 1.55, z, bx + 0.24, 1.55, z, bx, 1.3, z); w.tri(bx + 0.24, 1.55, z, bx - 0.24, 1.55, z, bx, 1.3, z); }
  // braziers at the gate: iron bowl on three legs, coals glowing
  for (const [x, z] of K.braziers) { paint(w, T.iron, C.iron);
    for (let k = 0; k < 3; k++) { const a = k / 3 * TAU; PIPE(w, [x + Math.cos(a) * 0.32, 0, z + Math.sin(a) * 0.32], [x + Math.cos(a) * 0.2, 0.8, z + Math.sin(a) * 0.2], 0.025, 0.025, 4); }
    LA(w, x, 0.78, z, [[0.12, 0], [0.38, 0.18], [0.42, 0.26], [0.38, 0.27]], 10, false); w.solid(x - 0.35, 0, z - 0.35, x + 0.35, 1, z + 0.35);
    w.albedo(null); w.color(C.coal); w.emissive(3, 1.2, 0.3); LA(w, x, 0.9, z, [[0.36, 0], [0.25, 0.06], [0, 0.08]], 10, false); w.emissive(null); }
  // plank benches, east and west, stepped
  const S = K.stands;
  for (const side of [-1, 1]) for (let r = 0; r < S.rows; r++) { const x0 = side * (S.x + r * S.depth), x1 = x0 + side * S.depth, h = (r + 1) * S.rise;
    paint(w, T.oak, C.oak); BX(w, x0, h - 0.07, -S.len / 2, x1, h, S.len / 2); w.solid(x0, 0, -S.len / 2, x1, h, S.len / 2);
    for (const z of [-S.len / 2 + 0.3, 0, S.len / 2 - 0.3]) BX(w, x0 + side * 0.08, -0.2, z - 0.06, x1 - side * 0.08, h - 0.07, z + 0.06); }
}
export function geometry(c) { const w = XF(c, 0, 0); w.params = c.params; layout(w); }
export function collider(c) { const w = SOLIDS(); w.params = c.params; layout(w); return w.list; }
