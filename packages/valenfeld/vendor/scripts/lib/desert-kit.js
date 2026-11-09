// The Sunscar building kit (Qasreth and the south coast): Valenfeld's boxes and lathes routed through a
// local frame (frame(t, yaw, fn) turns everything emitted inside it), plus desert pieces: striped cloth
// awnings, pointed arches, amphorae, crates. No engine state here; every gen passes its ctx in.
import KS from "./data/kit-desert.json";   // textures and tints: scripts/lib/data/kit-desert.yml
export const TX = KS.tex;
export const TINT = KS.tint;
let XF = null;
const T = (x, y, z) => (XF ? XF(x, y, z) : [x, y, z]);
// everything emitted inside fn is turned by yaw (degrees, about +Y, the engine's sense) and moved to t
export function frame(t, yawDeg, fn) {
  const P = XF, a = yawDeg * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a);
  const mine = (x, y, z) => [t[0] + x * ca + z * sa, t[1] + y, t[2] - x * sa + z * ca];
  XF = P ? (x, y, z) => P(...mine(x, y, z)) : mine;
  try { fn(); } finally { XF = P; }
}
export function tri(c, a, b, d) { const A = T(a[0], a[1], a[2]), B = T(b[0], b[1], b[2]), C = T(d[0], d[1], d[2]); c.tri(A[0], A[1], A[2], B[0], B[1], B[2], C[0], C[1], C[2]); }
export function quad(c, a, b, d, e) { tri(c, a, b, d); tri(c, a, d, e); }
export function paint(c, tex, col) { c.albedo(tex); c.color(col); c.emissive(null); }
export function flatc(c, col) { c.albedo(null); c.color(col); c.emissive(null); }
export function glow(c, col, em) { c.albedo(null); c.color(col); c.emissive(em[0], em[1], em[2]); }
// hexahedron: b0 b1 b2 b3 (bottom: x0z0 x1z0 x1z1 x0z1) then t0..t3 above them
export function HX(c, p) { const q = (a, b, d, e) => quad(c, p[a], p[b], p[d], p[e]); q(2, 1, 5, 6); q(0, 3, 7, 4); q(3, 2, 6, 7); q(1, 0, 4, 5); q(7, 6, 5, 4); q(0, 1, 2, 3); }
export function BX(c, x0, y0, z0, x1, y1, z1) { HX(c, [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]]); }
// box by centre and size, turned: roll (about z), then pitch (about x), then yaw (about y), degrees
export function RB(c, cx, cy, cz, w, h, d, yaw = 0, pitch = 0, roll = 0) {
  const Y = yaw * Math.PI / 180, P = pitch * Math.PI / 180, R = roll * Math.PI / 180;
  const t = (x, y, z) => { const x1 = x * Math.cos(R) - y * Math.sin(R), y1 = x * Math.sin(R) + y * Math.cos(R);
    const y2 = y1 * Math.cos(P) - z * Math.sin(P), z2 = y1 * Math.sin(P) + z * Math.cos(P);
    return [cx + x1 * Math.cos(Y) + z2 * Math.sin(Y), cy + y2, cz - x1 * Math.sin(Y) + z2 * Math.cos(Y)]; };
  const a = w / 2, b = h / 2, e = d / 2;
  HX(c, [t(-a, -b, -e), t(a, -b, -e), t(a, -b, e), t(-a, -b, e), t(-a, b, -e), t(a, b, -e), t(a, b, e), t(-a, b, e)]);
}
// lathe: prof [[r, h]…] swept round the y axis (or x / z: h runs along that axis)
export function LA(c, cx, y0, cz, prof, n = 12, caps = true, ax = "y", sm = true) {
  const P = (i, k) => { const a = (k % n) / n * Math.PI * 2, r = prof[i][0], h = prof[i][1];
    if (ax === "x") return [cx + h, y0 + r * Math.cos(a), cz + r * Math.sin(a)];
    if (ax === "z") return [cx + r * Math.cos(a), y0 + r * Math.sin(a), cz + h];
    return [cx + r * Math.cos(a), y0 + h, cz + r * Math.sin(a)]; };
  if (sm) c.smooth();
  for (let i = 0; i < prof.length - 1; i++) for (let k = 0; k < n; k++) quad(c, P(i, k + 1), P(i, k), P(i + 1, k), P(i + 1, k + 1));
  c.flat();
  if (caps) { const l = prof.length - 1;
    const at = (h) => ax === "x" ? [cx + h, y0, cz] : ax === "z" ? [cx, y0, cz + h] : [cx, y0 + h, cz];
    const A = at(prof[l][1]), B = at(prof[0][1]);
    for (let k = 0; k < n; k++) { tri(c, A, P(l, k + 1), P(l, k)); tri(c, B, P(0, k), P(0, k + 1)); } }
}
export function CY(c, cx, y0, cz, r, h, n = 10) { LA(c, cx, y0, cz, [[r, 0], [r, h]], n, true); }
export function CB() { const L = []; const f = (x0, y0, z0, x1, y1, z1) => { L.push({ kind: "box", width: Math.abs(x1 - x0), height: Math.abs(y1 - y0), depth: Math.abs(z1 - z0), center: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2] }); }; f.list = L; return f; }
// a pointed (Sunscar) arch: the intrados height at x across a half-span s, spring sp, apex ap
export function archY(x, s, sp, ap) { return sp + (ap - sp) * Math.pow(Math.max(0, 1 - Math.abs(x) / s), 0.55); }
// fill between a pointed arch and a flat top yt, through depth z0..z1
export function ARCHFILL(c, s, sp, ap, yt, z0, z1, K = 10) {
  for (let i = 0; i < K; i++) { const x0 = -s + 2 * s * i / K, x1 = -s + 2 * s * (i + 1) / K, a0 = archY(x0, s, sp, ap), a1 = archY(x1, s, sp, ap);
    HX(c, [[x0, a0, z0], [x1, a1, z0], [x1, a1, z1], [x0, a0, z1], [x0, yt, z0], [x1, yt, z0], [x1, yt, z1], [x0, yt, z1]]); }
}
// a striped cloth awning from a wall at z = zw out toward -z by dep, sloping yb → yf, sagging between battens
export function AWN(c, x0, x1, zw, dep, yb, yf, A, B, D, o = {}) {
  const n = Math.max(1, Math.round((x1 - x0) / 0.55)), rows = D <= 2 ? 3 : 1, sag = rows > 1 ? 0.1 : 0, base = o.base ?? 0;
  for (let i = 0; i < n; i++) { const xa = x0 + (x1 - x0) * i / n, xb = x0 + (x1 - x0) * (i + 1) / n;
    paint(c, D <= 2 && i % 2 ? B : A, TINT.cloth);
    for (let r = 0; r < rows; r++) { const P = (x, t) => [x, yb + (yf - yb) * t - sag * Math.sin(Math.PI * t), zw - dep * t]; quad(c, P(xa, r / rows), P(xb, r / rows), P(xb, (r + 1) / rows), P(xa, (r + 1) / rows)); }
    if (D <= 2) { const zf = zw - dep, k = 2; for (let j = 0; j < k; j++) { const u0 = xa + (xb - xa) * j / k, u1 = xa + (xb - xa) * (j + 1) / k; tri(c, [u0, yf, zf], [u1, yf, zf], [(u0 + u1) / 2, yf - 0.22, zf - 0.01]); } }
  }
  paint(c, TX.oak, TINT.wood);
  if (D <= 3) LA(c, x0 - 0.05, yf - 0.03, zw - dep, [[0.04, 0], [0.04, x1 - x0 + 0.1]], 6, true, "x");
  if (o.poles !== false) for (const x of [x0 + 0.08, x1 - 0.08]) { CY(c, x, base, zw - dep + 0.03, 0.05, yf - base, D <= 2 ? 7 : 5); if (o.back) CY(c, x, base, zw - 0.05, 0.05, yb - base, D <= 2 ? 7 : 5); }
  if (D <= 2 && !o.back) BX(c, x0, yb - 0.08, zw - 0.06, x1, yb + 0.04, zw + 0.02);
}
// an amphora / water jar, s = its height
export function POT(c, x, y, z, s, D, tone = "oklch(0.93 0.03 50)") {
  paint(c, TX.clay, tone);
  const pr = [[0.13, 0], [0.22, 0.08], [0.3, 0.32], [0.27, 0.52], [0.14, 0.68], [0.1, 0.8], [0.13, 0.86], [0.1, 0.86]].map(([r, h]) => [r * s, h * s]);
  LA(c, x, y, z, D <= 2 ? pr : [pr[0], pr[2], pr[4], pr[6]], D <= 2 ? 12 : 6, true);
}
export function CRATE(c, x, y, z, s, D) {
  paint(c, TX.oak, "oklch(0.94 0.03 70)"); BX(c, x - s / 2, y, z - s / 2, x + s / 2, y + s, z + s / 2);
  if (D <= 2) { paint(c, TX.oak, "oklch(0.86 0.03 60)"); const o = 0.025;
    for (const yy of [y + 0.04, y + s - 0.04]) { BX(c, x - s / 2 - o, yy - 0.05, z - s / 2 - o, x + s / 2 + o, yy + 0.05, z - s / 2 + 0.02); BX(c, x - s / 2 - o, yy - 0.05, z + s / 2 - 0.02, x + s / 2 + o, yy + 0.05, z + s / 2 + o); }
    for (const xx of [x - s / 2 + 0.05, x + s / 2 - 0.05]) { BX(c, xx - 0.05, y, z - s / 2 - o, xx + 0.05, y + s, z - s / 2 + 0.02); BX(c, xx - 0.05, y, z + s / 2 - 0.02, xx + 0.05, y + s, z + s / 2 + o); } }
}
