// Valenfeld building kit as a module: the same textures, boxes, lathes and roofs scripts/gen/house.js
// carries verbatim, plus the harbour's extras (tarred planks, driftwood, canvas, net) and swept parts:
// SEG (a square beam between two points), PIPE (a round one), TORUS (rings, coils, wheel rims), LOFT.
import KB from "./data/kit-build.json";   // textures and tints: scripts/lib/data/kit-build.yml
export const FS = KB.tex.FS, OAK = KB.tex.OAK, PL = KB.tex.PL, SL = KB.tex.SL, IR = KB.tex.IR, FLAG = KB.tex.FLAG, HAY = KB.tex.HAY, TAR = KB.tex.TAR, DRIFT = KB.tex.DRIFT, CANVAS = KB.tex.CANVAS, NET = KB.tex.NET, ROCK = KB.tex.ROCK;
export const STONE = KB.tint.STONE, WOOD = KB.tint.WOOD, WHITE = KB.tint.WHITE, IRONC = KB.tint.IRONC, TARC = KB.tint.TARC, DRIFTC = KB.tint.DRIFTC;
export function paint(c, tex, col, a) { c.albedo(tex); if (a === undefined) c.color(col); else c.color(col, a); c.emissive(null); }
export function flatc(c, col) { c.albedo(null); c.color(col); c.emissive(null); }
export function glow(c, col, em) { c.albedo(null); c.color(col); c.emissive(em[0], em[1], em[2]); }
export function HX(c, p) { const q = (a, b, d, e) => c.quad(...p[a], ...p[b], ...p[d], ...p[e]); q(2, 1, 5, 6); q(0, 3, 7, 4); q(3, 2, 6, 7); q(1, 0, 4, 5); q(7, 6, 5, 4); q(0, 1, 2, 3); }
export function BX(c, x0, y0, z0, x1, y1, z1) {
  if (x0 > x1) [x0, x1] = [x1, x0]; if (y0 > y1) [y0, y1] = [y1, y0]; if (z0 > z1) [z0, z1] = [z1, z0];
  HX(c, [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]]); }
// BXR: the town gens' raw box: corners as given, no reorder (an inverted range draws inside-out, as they always have)
export function BXR(c, x0, y0, z0, x1, y1, z1) { HX(c, [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]]); }
export function RB(c, cx, cy, cz, w, h, d, yaw = 0, pitch = 0, roll = 0) {
  const Y = yaw * Math.PI / 180, P = pitch * Math.PI / 180, R = roll * Math.PI / 180;
  const t = (x, y, z) => { const x1 = x * Math.cos(R) - y * Math.sin(R), y1 = x * Math.sin(R) + y * Math.cos(R);
    const y2 = y1 * Math.cos(P) - z * Math.sin(P), z2 = y1 * Math.sin(P) + z * Math.cos(P);
    return [cx + x1 * Math.cos(Y) + z2 * Math.sin(Y), cy + y2, cz - x1 * Math.sin(Y) + z2 * Math.cos(Y)]; };
  const a = w / 2, b = h / 2, e = d / 2;
  HX(c, [t(-a, -b, -e), t(a, -b, -e), t(a, -b, e), t(-a, -b, e), t(-a, b, -e), t(a, b, -e), t(a, b, e), t(-a, b, e)]);
}
export function LA(c, cx, y0, cz, prof, n = 12, caps = true, ax = "y", sm = true) {
  const P = (i, k) => { const a = (k % n) / n * Math.PI * 2, r = prof[i][0], h = prof[i][1];
    return ax === "x" ? [cx + h, y0 + r * Math.cos(a), cz + r * Math.sin(a)] : ax === "z" ? [cx + r * Math.cos(a), y0 + r * Math.sin(a), cz + h] : [cx + r * Math.cos(a), y0 + h, cz + r * Math.sin(a)]; };
  if (sm) c.smooth();
  for (let i = 0; i < prof.length - 1; i++) for (let k = 0; k < n; k++) c.quad(...P(i, k + 1), ...P(i, k), ...P(i + 1, k), ...P(i + 1, k + 1));
  c.flat();
  if (caps) { const l = prof.length - 1;
    const A = ax === "z" ? [cx, y0, cz + prof[l][1]] : ax === "x" ? [cx + prof[l][1], y0, cz] : [cx, y0 + prof[l][1], cz], B = ax === "z" ? [cx, y0, cz + prof[0][1]] : ax === "x" ? [cx + prof[0][1], y0, cz] : [cx, y0 + prof[0][1], cz];
    for (let k = 0; k < n; k++) { c.tri(...A, ...P(l, k + 1), ...P(l, k)); c.tri(...B, ...P(0, k), ...P(0, k + 1)); } }
}
export function CY(c, cx, y0, cz, r, h, n = 10) { LA(c, cx, y0, cz, [[r, 0], [r, h]], n, true); }
export function ROOF(c, x0, x1, z0, z1, ye, yr, t) { const zm = (z0 + z1) / 2;
  HX(c, [[x0, ye, z0], [x1, ye, z0], [x1, yr, zm], [x0, yr, zm], [x0, ye + t, z0], [x1, ye + t, z0], [x1, yr + t, zm], [x0, yr + t, zm]]);
  HX(c, [[x0, yr, zm], [x1, yr, zm], [x1, ye, z1], [x0, ye, z1], [x0, yr + t, zm], [x1, yr + t, zm], [x1, ye + t, z1], [x0, ye + t, z1]]); }
export function BARREL(c, x, y, z, r = 0.33, h = 0.9, D = 1, tex = OAK, col = WOOD) { const n = D <= 2 ? 12 : 8;   // tex/col: indoor kits pass their own oak (dark OAK reads black under hearth light)
  paint(c, tex, col); LA(c, x, y, z, [[r * 0.84, 0], [r * 0.96, h * 0.25], [r, h * 0.5], [r * 0.96, h * 0.75], [r * 0.84, h]], n, true);
  if (D <= 2) { paint(c, IR, IRONC); for (const [t, k] of [[0.1, 0.89], [0.33, 0.985], [0.67, 0.985], [0.9, 0.89]]) LA(c, x, y + h * t - 0.025, z, [[r * k + 0.012, 0], [r * k + 0.012, 0.05]], n, false); } }
export function CB() { const L = []; const f = (x0, y0, z0, x1, y1, z1) => { if (Math.abs(x1 - x0) < 0.01 || Math.abs(y1 - y0) < 0.01 || Math.abs(z1 - z0) < 0.01) return; L.push({ kind: "box", width: Math.abs(x1 - x0), height: Math.abs(y1 - y0), depth: Math.abs(z1 - z0), center: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2] }); }; f.list = L; return f; }
// ---- swept parts ----
const nrm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const crs = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
function frame(a, b) { const d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], L = Math.hypot(d[0], d[1], d[2]) || 1e-6, Z = [d[0] / L, d[1] / L, d[2] / L];
  const up = Math.abs(Z[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0], X = nrm(crs(up, Z)), Y = crs(Z, X); return { d, L, X, Y, Z }; }
// a square beam w × h from a to b
export function SEG(c, a, b, w, h = w) { const { d, X, Y } = frame(a, b);
  const p = (sx, sy, t) => [a[0] + X[0] * sx * w / 2 + Y[0] * sy * h / 2 + d[0] * t, a[1] + X[1] * sx * w / 2 + Y[1] * sy * h / 2 + d[1] * t, a[2] + X[2] * sx * w / 2 + Y[2] * sy * h / 2 + d[2] * t];
  HX(c, [p(-1, -1, 0), p(1, -1, 0), p(1, -1, 1), p(-1, -1, 1), p(-1, 1, 0), p(1, 1, 0), p(1, 1, 1), p(-1, 1, 1)]); }
// a round pole from a (radius r0) to b (r1), n sides, smooth
export function PIPE(c, a, b, r0, r1 = r0, n = 6, caps = true) { const { d, X, Y } = frame(a, b);
  const P = (i, k) => { const t = i, r = i ? r1 : r0, an = (k % n) / n * Math.PI * 2, co = Math.cos(an) * r, si = -Math.sin(an) * r;
    return [a[0] + X[0] * co + Y[0] * si + d[0] * t, a[1] + X[1] * co + Y[1] * si + d[1] * t, a[2] + X[2] * co + Y[2] * si + d[2] * t]; };
  c.smooth(); for (let k = 0; k < n; k++) c.quad(...P(0, k + 1), ...P(0, k), ...P(1, k), ...P(1, k + 1)); c.flat();
  if (caps) for (let k = 0; k < n; k++) { c.tri(...b, ...P(1, k + 1), ...P(1, k)); c.tri(...a, ...P(0, k), ...P(0, k + 1)); } }
// a pole through a polyline of points
export function PATH(c, pts, r, n = 5) { for (let i = 0; i < pts.length - 1; i++) PIPE(c, pts[i], pts[i + 1], r, r, n, i === 0 || i === pts.length - 2); }
// a hanging rope from a to b sagging s metres at the middle
export function ROPE(c, a, b, s, r = 0.025, seg = 4) { const pts = [];
  for (let i = 0; i <= seg; i++) { const t = i / seg; pts.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - s * 4 * t * (1 - t), a[2] + (b[2] - a[2]) * t]); }
  PATH(c, pts, r, 4); }
// a ring of radius R, tube r, round the axis "y" | "z" | "x"
export function TORUS(c, cx, cy, cz, R, r, n = 16, m = 6, ax = "y") {
  const P = (i, j) => { const a = i / n * Math.PI * 2, b = j / m * Math.PI * 2, u = (R + r * Math.cos(b)) * Math.cos(a), v = r * Math.sin(b), w = (R + r * Math.cos(b)) * Math.sin(a);
    return ax === "z" ? [cx + w, cy + u, cz + v] : ax === "x" ? [cx + v, cy + w, cz + u] : [cx + u, cy + v, cz + w]; };
  c.smooth(); for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) c.quad(...P(i, j), ...P(i, j + 1), ...P(i + 1, j + 1), ...P(i + 1, j)); c.flat(); }
// rows[i][k]: quads between consecutive rows; outward = (row step) × (point step)
export function LOFT(c, rows) { for (let i = 0; i < rows.length - 1; i++) for (let k = 0; k < rows[i].length - 1; k++) c.quad(...rows[i][k], ...rows[i + 1][k], ...rows[i + 1][k + 1], ...rows[i][k + 1]); }
// a tower roof that reads from the street: a bell-flared skirt over the drum, an open lantern stage that glows at night,
// an ogee cap and a gilded finial. r = drum radius, h = whole height to the finial's foot. m: { roof(c), trim(c), gold(c), light? }
export function TOWERROOF(c, x, y, z, r, h, n, lod, m) {
  const ys = h * 0.42, yl = h * 0.17, rl = Math.max(0.6, r * 0.42);
  m.roof(c); LA(c, x, y, z, [[r + 1.0, 0], [r + 0.78, 0.22], [r * 0.9, h * 0.08], [r * 0.7, h * 0.2], [rl * 1.22, ys - 0.15], [rl * 1.22, ys]], n, true);
  if (lod <= 3) {
    m.trim(c); LA(c, x, y + ys, z, [[rl * 1.3, 0], [rl * 1.3, 0.22]], n, false);
    glow(c, "oklch(0.78 0.11 75)", m.light ?? [2.4, 1.4, 0.5]); LA(c, x, y + ys, z, [[rl * 0.82, 0], [rl * 0.82, yl]], n, true);
    m.trim(c); const k = Math.max(6, Math.min(10, Math.round(n / 1.5)));
    for (let i = 0; i < k; i++) { const a = i / k * Math.PI * 2; RB(c, x + Math.cos(a) * rl, y + ys + yl / 2, z + Math.sin(a) * rl, 0.22, yl, 0.22, -a * 180 / Math.PI + 90); }
    LA(c, x, y + ys + yl, z, [[rl * 1.35, 0], [rl * 1.35, 0.28]], n, false);
  } else { m.roof(c); LA(c, x, y + ys, z, [[rl, 0], [rl, yl]], n, false); }
  const yc = ys + yl + 0.28, hc = h - yc;
  m.roof(c); LA(c, x, y + yc, z, [[rl * 1.4, 0], [rl * 1.3, hc * 0.1], [rl * 0.95, hc * 0.3], [rl * 0.42, hc * 0.62], [rl * 0.14, hc * 0.86], [0.05, hc]], n, true);
  const s = Math.max(0.8, r / 2.6); m.gold(c);
  LA(c, x, y + h - 0.1, z, [[0.08 * s, 0], [0.3 * s, 0.32 * s], [0.08 * s, 0.66 * s], [0.12 * s, 0.86 * s], [0.04 * s, 1.5 * s], [0.12 * s, 1.62 * s], [0.02 * s, 2.3 * s]], 8, true);
}
