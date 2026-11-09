// VALENFELD KEEP, the whole two-storey interior (place valenfeld-keep), place coordinates, floor y = 0, north = -z. 
// GREAT HALL x -8..8, z -14..12.4, open to an oak-trussed roof (eaves 10, ridge 12.6); GALLERY 2.2 m wide W/N/E at y 4.8;
// two stone flights in the hall's south corners rising north to it. Ground wings: W chapel | kitchen | guardroom,
// E armoury+strongroom | storeroom | steward's office, N map room. Upper: W linen | barracks, E steward's room | Reeve's
// chamber, N two guest rooms. One plan (K + shell()) feeds both geometry and collider; every fixture is an exported
// function (stair flight, balustrade, door frame, bed, desk, wardrobe, hearth, ...) so other keeps reuse them.
import { paint, flatc, BX, RB, LA, SEG, TORUS, BARREL, HX as HEX, FS, OAK, PL, FLAG, IR, HAY, CANVAS, STONE, WOOD, IRONC } from "../lib/buildkit.js";
import { candle_valenfeldKeepFloors as candle } from "../lib/pieces/candle.js";   // the shared candle pieces

export const K = { X0: -19.06, X1: 19.06, Z0: -20, Z1: 12.9, T: 0.5, PT: 0.3, F1: 4.6, F2: 4.8, TOP: 8.6, ROOF: 8.8, HW: 8, HZ0: -14,
  EAVE: 10, RIDGE: 12.6, GW: 2.2, GZ: 3.4, DW: 1.7, DH: 3.1, SW: 1.4, STEPS: 27, RUN: 0.3, FOOT: 11.5, TRUSS: [-8, -1, 6], RINGS: [-8, -1, 6] };
export const C = { stone: "oklch(0.82 0.015 80)", plaster: "oklch(0.95 0.02 85)", oak: "oklch(0.7 0.04 55)", dark: "oklch(0.42 0.03 50)",
  gold: "#c9a45a", wine: "#5a1a22", blue: "#2f3d52", iron: "oklch(0.5 0.01 250)", soot: "oklch(0.16 0.01 50)", linen: "oklch(0.88 0.02 85)" };

// ---- the collider sink: geometry and collider run the same build; solids record only in the collider pass ----
let SK = null;
const NOOP = new Proxy({}, { get: (_, k) => (k === "lod" ? 2 : () => {}) });
export function solid(x0, y0, z0, x1, y1, z1) { if (!SK) return; if (x0 > x1) [x0, x1] = [x1, x0]; if (y0 > y1) [y0, y1] = [y1, y0]; if (z0 > z1) [z0, z1] = [z1, z0];
  if (x1 - x0 < 0.01 || y1 - y0 < 0.01 || z1 - z0 < 0.01) return; SK.push({ kind: "box", width: x1 - x0, height: y1 - y0, depth: z1 - z0, center: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2] }); }
export function B(c, x0, y0, z0, x1, y1, z1, s) { BX(c, x0, y0, z0, x1, y1, z1); if (s) solid(x0, y0, z0, x1, y1, z1); }
// a local frame o = { x, y, z, yaw }: u right, v up, w back; the front faces local -w (yaw 0 = faces north, 180 south, -90 east, 90 west)
export const at = (x, y, z, yaw = 0) => ({ x, y, z, yaw });
export function rot(o, u, w) { const Y = o.yaw * Math.PI / 180, co = Math.cos(Y), si = Math.sin(Y); return [o.x + u * co + w * si, o.z - u * si + w * co]; }
export function PS(o, u0, v0, w0, u1, v1, w1) { const a = rot(o, u0, w0), b = rot(o, u1, w1); solid(a[0], o.y + v0, a[1], b[0], o.y + v1, b[1]); }
export function P(c, o, u0, v0, w0, u1, v1, w1, s) { const [cx, cz] = rot(o, (u0 + u1) / 2, (w0 + w1) / 2);
  RB(c, cx, o.y + (v0 + v1) / 2, cz, Math.abs(u1 - u0), Math.abs(v1 - v0), Math.abs(w1 - w0), o.yaw); if (s) PS(o, u0, v0, w0, u1, v1, w1); }
export function PL_(c, o, u, v, w, prof, n = 8, caps = true) { const [x, z] = rot(o, u, w); LA(c, x, o.y + v, z, prof, n, caps); }
const wood = (c, k = C.oak) => paint(c, OAK, k), stone = (c) => paint(c, FS, C.stone), iron = (c) => paint(c, IR, IRONC);

// ---- the plan: walls (with their door openings) and slabs, as data ----
export function shell(k = K) {
  const W = [], D = [], S = [];
  const { X0, X1, Z0, Z1, T, PT, F1, F2, TOP, ROOF, HW, HZ0, EAVE, GW, GZ } = k;
  const wall = (m, ax, pos, a0, a1, y0, y1, doors = [], t = T) => {
    const put = (s0, s1, h0, h1) => { if (s1 - s0 < 0.01 || h1 - h0 < 0.01) return; W.push(ax === "x" ? [m, s0, h0, pos - t / 2, s1, h1, pos + t / 2] : [m, pos - t / 2, h0, s0, pos + t / 2, h1, s1]); };
    let s = a0;
    for (const d of [...doors].sort((p, q) => p.at - q.at)) { const w = d.w ?? k.DW, h = d.h ?? k.DH;
      put(s, d.at - w / 2, y0, y1); put(d.at - w / 2, d.at + w / 2, y0 + h, y1); s = d.at + w / 2; D.push({ ax, pos, c: d.at, y: y0, w, h, t }); }
    put(s, a1, y0, y1);
  };
  const ix0 = X0 + T, ix1 = X1 - T, iz0 = Z0 + T, iz1 = Z1 - T, hw = HW + T / 2, dd = (...z) => z.map((a) => ({ at: a }));
  // outer shell: fieldstone below the floor line, lime plaster above
  wall("stone", "x", Z1 - T / 2, X0, X1, 0, F2, [{ at: 0, w: 2.6, h: 3.5 }]); wall("plaster", "x", Z1 - T / 2, X0, X1, F2, ROOF);
  wall("stone", "x", Z0 + T / 2, X0, X1, 0, F2); wall("plaster", "x", Z0 + T / 2, X0, X1, F2, ROOF);
  for (const s of [-1, 1]) { wall("stone", "z", s * (X1 - T / 2), Z0, Z1, 0, F2); wall("plaster", "z", s * (X1 - T / 2), Z0, Z1, F2, ROOF); }
  W.push(["plaster", -hw - T / 2, ROOF, iz1, hw + T / 2, EAVE, Z1]);
  // the great hall's side walls: ground doors into the wings, upper doors off the gallery
  for (const s of [-1, 1]) {
    wall("stone", "z", s * hw, iz0, iz1, 0, F2, dd(2.4, -1, -12.5, -17));
    wall("plaster", "z", s * hw, iz0, iz1, F2, ROOF, dd(-11, -2));
    W.push(["plaster", s * hw - T / 2, ROOF, HZ0 - T, s * hw + T / 2, EAVE, iz1]);
  }
  wall("stone", "x", HZ0 - T / 2, -HW, HW, 0, F2, dd(-6.5, 6.5)); wall("plaster", "x", HZ0 - T / 2, -HW, HW, F2, EAVE, dd(-4, 4));
  // wing partitions
  wall("stone", "x", -9, ix0, -hw, 0, F2, dd(-13), PT); wall("stone", "x", 1, ix0, -hw, 0, F2, dd(-13.5), PT);
  wall("stone", "x", -6, hw, ix1, 0, F2, [], PT); wall("stone", "x", 1, hw, ix1, 0, F2, dd(13.5), PT);
  wall("stone", "x", -14.5, 14, ix1, 0, F2, [], PT); wall("stone", "z", 14, iz0, -14.5, 0, F2, [{ at: -17, w: 1.7 }], PT);
  wall("plaster", "x", -8, ix0, -hw, F2, TOP, dd(-13), PT); wall("plaster", "x", -8, hw, ix1, F2, TOP, [], PT);
  wall("plaster", "z", 0, iz0, HZ0 - T, F2, TOP, [], PT);
  // slabs: the flagged ground, the oak upper floor, the wing ceilings, the gallery
  S.push(["flag", X0, -0.3, Z0, X1, 0, Z1]);
  for (const r of [[ix0, iz0, -hw, iz1], [hw, iz0, ix1, iz1], [-hw, iz0, hw, HZ0 - T]]) { S.push(["floor", r[0], F1, r[1], r[2], F2, r[3]], ["ceil", r[0], TOP, r[1], r[2], ROOF, r[3]]); }
  S.push(["floor", -HW, F1, HZ0, -HW + GW, F2, GZ], ["floor", HW - GW, F1, HZ0, HW, F2, GZ], ["floor", -HW + GW, F1, HZ0, HW - GW, F2, HZ0 + GW]);
  return { W, D, S };
}

// ---- fixtures ----
export function doorFrame(c, d) { const j = 0.14, p = 0.05, t0 = d.pos - d.t / 2 - p, t1 = d.pos + d.t / 2 + p; wood(c, C.dark);
  const box = (a0, a1, y0, y1) => (d.ax === "x" ? BX(c, a0, y0, t0, a1, y1, t1) : BX(c, t0, y0, a0, t1, y1, a1));
  box(d.c - d.w / 2 - j, d.c - d.w / 2, d.y, d.y + d.h); box(d.c + d.w / 2, d.c + d.w / 2 + j, d.y, d.y + d.h); box(d.c - d.w / 2 - j, d.c + d.w / 2 + j, d.y + d.h, d.y + d.h + 0.2);
  iron(c); box(d.c - d.w / 2 - j - 0.02, d.c - d.w / 2 + 0.02, d.y + 0.5, d.y + 0.56); }
// a straight stone flight: n solid treads rising toward dir (-1 = north) from zFoot, x0..x1 wide
export function stairFlight(c, x0, x1, zFoot, n, rise, run, dir = -1) {
  for (let i = 0; i < n; i++) { const za = zFoot + dir * i * run, zb = zFoot + dir * (i + 1) * run, y = (i + 1) * rise;
    stone(c); B(c, x0, 0, za, x1, y - 0.04, zb, true); paint(c, FLAG, C.stone); B(c, x0, y - 0.04, za - dir * 0.03, x1, y, zb, true); } }
// the oak rail on a flight's open side at x
export function stairRail(c, lod, x, zFoot, n, rise, run, dir = -1) {
  const yAt = (i) => (i + 1) * rise; wood(c, C.dark);
  BX(c, x - 0.09, 0, zFoot - 0.18, x + 0.09, 1.25, zFoot); PL_(c, at(x, 1.25, zFoot - 0.09), 0, 0, 0, [[0.07, 0], [0.09, 0.06], [0.01, 0.16]], 8);
  SEG(c, [x, yAt(0) + 0.95, zFoot - 0.09], [x, yAt(n - 1) + 0.95, zFoot + dir * n * run], 0.09, 0.07);
  for (let i = 0; i < n; i++) { const zc = zFoot + dir * (i + 0.5) * run, y = yAt(i);
    if (lod <= 2) BX(c, x - 0.022, y, zc - 0.022, x + 0.022, y + 0.95, zc + 0.022);
    solid(x - 0.05, y, zFoot + dir * i * run, x + 0.05, y + 1.0, zFoot + dir * (i + 1) * run); } }
// a waist-high gallery balustrade along an axis line at y, turned balusters every step
export function balustrade(c, lod, ax, pos, a0, a1, y, h = 1.0, step = 0.25) {
  const box = (p0, p1, y0, y1, w) => (ax === "x" ? BX(c, p0, y0, pos - w, p1, y1, pos + w) : BX(c, pos - w, y0, p0, pos + w, y1, p1));
  wood(c, C.dark); box(a0, a1, y, y + 0.08, 0.06); box(a0, a1, y + h - 0.07, y + h, 0.08);
  ax === "x" ? solid(a0, y, pos - 0.06, a1, y + h, pos + 0.06) : solid(pos - 0.06, y, a0, pos + 0.06, y + h, a1);
  const n = Math.max(1, Math.round((a1 - a0) / step)), news = Math.max(1, Math.round((a1 - a0) / 3));
  for (let i = 0; i <= news; i++) { const p = a0 + (a1 - a0) * i / news; box(p - 0.08, p + 0.08, y, y + h + 0.12, 0.08); }
  if (lod > 2) return;
  for (let i = 1; i < n; i++) { const p = a0 + (a1 - a0) * i / n, [x, z] = ax === "x" ? [p, pos] : [pos, p];
    if (lod <= 1) LA(c, x, y + 0.08, z, [[0.035, 0], [0.05, 0.08], [0.028, 0.22], [0.045, 0.42], [0.06, 0.52], [0.03, 0.74], [0.04, h - 0.15]], 6, false);
    else BX(c, x - 0.03, y + 0.08, z - 0.03, x + 0.03, y + h - 0.07, z + 0.03); } }
export function sconce(c, o, v = 2.2) { iron(c); P(c, o, -0.04, v - 0.3, -0.1, 0.04, v, 0); P(c, o, -0.1, v, -0.3, 0.1, v + 0.04, -0.1); const [x, z] = rot(o, 0, -0.2); candle(c, x, o.y + v + 0.04, z, 0.25); }
export function candleRing(c, lod, x, y, z, r, top) { iron(c); TORUS(c, x, y, z, r, 0.045, lod <= 1 ? 20 : 10, 5);
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.785; SEG(c, [x + Math.cos(a) * r, y, z + Math.sin(a) * r], [x, y + 1.4, z], 0.025); }
  SEG(c, [x, y + 1.4, z], [x, top, z], 0.035); if (lod > 2) return;
  for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2, px = x + Math.cos(a) * r, pz = z + Math.sin(a) * r; iron(c); BX(c, px - 0.06, y + 0.03, pz - 0.06, px + 0.06, y + 0.06, pz + 0.06); candle(c, px, y + 0.06, pz, 0.24); } }
export function crown(c, o, v, w, s = 1) { flatc(c, C.gold); P(c, o, -0.3 * s, v, w, 0.3 * s, v + 0.1 * s, w - 0.01);
  for (const u of [-0.27, 0, 0.27]) { P(c, o, (u - 0.05) * s, v + 0.1 * s, w, (u + 0.05) * s, v + (u ? 0.28 : 0.36) * s, w - 0.01); P(c, o, (u - 0.04) * s, v + (u ? 0.3 : 0.38) * s, w, (u + 0.04) * s, v + (u ? 0.36 : 0.44) * s, w - 0.01); } }
// a crown banner hung on a wall face (o at the face, front toward -w)
export function banner(c, o, v0, v1, w = 1.2, col = C.wine) { wood(c, C.dark); P(c, o, -w / 2 - 0.12, v1, -0.1, w / 2 + 0.12, v1 + 0.07, -0.03);
  flatc(c, col); P(c, o, -w / 2, v0 + 0.35, -0.06, w / 2, v1, -0.04); P(c, o, -w / 2, v0, -0.06, -0.06, v0 + 0.35, -0.04); P(c, o, 0.06, v0, -0.06, w / 2, v0 + 0.35, -0.04);
  flatc(c, C.gold); P(c, o, -w / 2, v1 - 0.12, -0.065, w / 2, v1 - 0.08, -0.06); P(c, o, -w / 2, v0 + 0.4, -0.065, w / 2, v0 + 0.44, -0.06);
  crown(c, o, (v0 + v1) / 2, -0.067, w / 1.4); }
export function windowGlow(c, o, v0, w, h, glass = [0.3, 0.42, 0.8], col = "oklch(0.55 0.05 250)") { stone(c);
  P(c, o, -w / 2 - 0.2, v0 - 0.12, -0.12, w / 2 + 0.2, v0, 0); P(c, o, -w / 2 - 0.15, v0 + h, -0.08, w / 2 + 0.15, v0 + h + 0.2, 0);
  c.albedo(null); c.color(col); c.emissive(glass[0], glass[1], glass[2]); P(c, o, -w / 2, v0, -0.02, w / 2, v0 + h, -0.005); c.emissive(null);
  wood(c, C.dark); P(c, o, -0.04, v0, -0.05, 0.04, v0 + h, -0.02); for (let i = 1; i < 3; i++) P(c, o, -w / 2, v0 + h * i / 3 - 0.03, -0.05, w / 2, v0 + h * i / 3 + 0.03, -0.02);
  for (const s of [-1, 1]) P(c, o, s * w / 2 - 0.06, v0, -0.06, s * w / 2 + 0.06, v0 + h, -0.01); }
export function hearth(c, lod, o, big = 1) { const hw = 1.3 * big, ow = 0.8 * big; stone(c);
  P(c, o, -hw - 0.2, 0, -1.1, hw + 0.2, 0.14, 0); P(c, o, -hw, 0, -0.85, -ow, 1.5, 0, true); P(c, o, ow, 0, -0.85, hw, 1.5, 0, true);
  P(c, o, -hw - 0.1, 1.5, -0.95, hw + 0.1, 1.9, 0, true); PS(o, -ow, 0, -0.8, ow, 1.5, -0.7);
  P(c, o, -hw + 0.1, 1.9, -0.75, hw - 0.1, 3.0, 0); P(c, o, -hw + 0.4, 3.0, -0.55, hw - 0.4, K.F1, 0);
  wood(c, C.dark); P(c, o, -hw - 0.25, 1.9, -1.05, hw + 0.25, 2.0, 0);
  flatc(c, C.soot); P(c, o, -ow, 0.14, -0.2, ow, 1.5, -0.02); P(c, o, -ow, 1.35, -0.85, ow, 1.5, -0.2);
  crown(c, o, 2.3, -0.76, 1.1); if (lod > 2) return;
  iron(c); for (const u of [-0.45, 0.45]) { P(c, o, u - 0.03, 0.14, -0.7, u + 0.03, 0.5, -0.64); P(c, o, u - 0.03, 0.14, -0.7, u + 0.03, 0.2, -0.25); }
  wood(c, "oklch(0.3 0.02 50)"); for (const [u, v] of [[-0.25, 0.26], [0.2, 0.28], [0, 0.4]]) { const [x, z] = rot(o, u, -0.45); SEG(c, [x - (o.yaw ? 0 : 0.5), o.y + v, z - (o.yaw ? 0.5 : 0)], [x + (o.yaw ? 0 : 0.5), o.y + v, z + (o.yaw ? 0.5 : 0)], 0.12); } }
export function table(c, lod, o, L, D = 1.0, items = true) { wood(c);
  P(c, o, -L / 2, 0.72, -D / 2, L / 2, 0.79, D / 2, true); wood(c, C.dark);
  const legs = Math.max(2, Math.round(L / 3) + 1); for (let i = 0; i < legs; i++) { const u = -L / 2 + 0.3 + (L - 0.6) * i / (legs - 1);
    P(c, o, u - 0.07, 0, -D / 2 + 0.1, u + 0.07, 0.72, -D / 2 + 0.22); P(c, o, u - 0.07, 0, D / 2 - 0.22, u + 0.07, 0.72, D / 2 - 0.1); P(c, o, u - 0.06, 0, -D / 2 + 0.05, u + 0.06, 0.08, D / 2 - 0.05); }
  P(c, o, -L / 2 + 0.3, 0.3, -0.05, L / 2 - 0.3, 0.4, 0.05);
  if (!items || lod > 1) return;
  for (let u = -L / 2 + 0.6; u < L / 2 - 0.3; u += 1.1) for (const s of [-1, 1]) { const [x, z] = rot(o, u, s * D * 0.28);
    flatc(c, "oklch(0.62 0.01 240)"); LA(c, x, o.y + 0.79, z, [[0.13, 0], [0.15, 0.02], [0.01, 0.02]], 10); LA(c, x + 0.2, o.y + 0.79, z, [[0.04, 0], [0.045, 0.12], [0.001, 0.12]], 8); }
  for (let u = -L / 2 + 1.2; u < L / 2; u += 2.8) { const [x, z] = rot(o, u, 0); candle(c, x, o.y + 0.79, z, 0.22); flatc(c, "oklch(0.6 0.08 70)"); LA(c, x + 0.35, o.y + 0.79, z, [[0.12, 0], [0.13, 0.05], [0.07, 0.11], [0.001, 0.12]], 8); } }
export function bench(c, o, L) { wood(c); P(c, o, -L / 2, 0.42, -0.17, L / 2, 0.47, 0.17, true); wood(c, C.dark);
  for (const u of [-L / 2 + 0.25, 0, L / 2 - 0.25]) P(c, o, u - 0.05, 0, -0.13, u + 0.05, 0.42, 0.13); PS(o, -L / 2, 0, -0.17, L / 2, 0.42, 0.17); }
export function stool(c, x, y, z) { wood(c); LA(c, x, y + 0.42, z, [[0.18, 0], [0.18, 0.05]], 10); wood(c, C.dark); for (let i = 0; i < 3; i++) { const a = i * 2.09; SEG(c, [x + Math.cos(a) * 0.15, y, z + Math.sin(a) * 0.15], [x + Math.cos(a) * 0.1, y + 0.43, z + Math.sin(a) * 0.1], 0.04); } }
export function rug(c, x, y, z, w, d, col = C.wine, edge = C.gold) { flatc(c, edge); BX(c, x - w / 2, y, z - d / 2, x + w / 2, y + 0.012, z + d / 2); flatc(c, col); BX(c, x - w / 2 + 0.12, y, z - d / 2 + 0.12, x + w / 2 - 0.12, y + 0.018, z + d / 2 - 0.12);
  flatc(c, C.blue); BX(c, x - w / 4, y, z - d / 4, x + w / 4, y + 0.022, z + d / 4); }
// beds: head against local -w; a cot, a wider guest bed, the Reeve's canopy bed
export function bed(c, lod, o, kind = "cot") { const wd = kind === "cot" ? 0.9 : kind === "guest" ? 1.3 : 1.8, L = kind === "canopy" ? 2.3 : 2.05, a = wd / 2, l = L / 2;
  wood(c, kind === "canopy" ? C.dark : C.oak); P(c, o, -a, 0.22, -l, a, 0.34, l); PS(o, -a, 0, -l, a, 0.6, l);
  for (const u of [-a + 0.04, a - 0.04]) for (const w of [-l + 0.04, l - 0.04]) P(c, o, u - 0.05, 0, w - 0.05, u + 0.05, 0.34, w + 0.05);
  P(c, o, -a, 0, -l, a, kind === "cot" ? 0.85 : 1.35, -l + 0.07); P(c, o, -a, 0, l - 0.06, a, 0.6, l);
  paint(c, kind === "cot" ? HAY : CANVAS, kind === "cot" ? "oklch(0.9 0.04 85)" : C.linen); P(c, o, -a + 0.04, 0.34, -l + 0.08, a - 0.04, 0.5, l - 0.07);
  flatc(c, kind === "cot" ? C.blue : C.wine); P(c, o, -a + 0.01, 0.42, -l + 0.6, a - 0.01, 0.53, l - 0.04);
  if (kind !== "cot") { flatc(c, C.gold); P(c, o, -a, 0.42, -l + 0.58, a, 0.535, -l + 0.64); }
  flatc(c, C.linen); for (const u of kind === "cot" ? [0] : [-a / 2, a / 2]) P(c, o, u - 0.28, 0.5, -l + 0.1, u + 0.28, 0.62, -l + 0.42);
  if (kind !== "canopy") return;
  wood(c, C.dark); for (const u of [-a, a]) for (const w of [-l, l]) PL_(c, o, u, 0, w, [[0.07, 0], [0.07, 0.6], [0.05, 0.7], [0.08, 0.8], [0.045, 1.0], [0.05, 2.3], [0.07, 2.45]], 8);
  P(c, o, -a - 0.06, 2.4, -l - 0.06, a + 0.06, 2.5, l + 0.06); flatc(c, C.wine); P(c, o, -a, 2.5, -l, a, 2.53, l);
  for (const [u0, u1, w0, w1] of [[-a - 0.07, a + 0.07, -l - 0.08, -l - 0.06], [-a - 0.07, a + 0.07, l + 0.06, l + 0.08], [-a - 0.08, -a - 0.06, -l, l], [a + 0.06, a + 0.08, -l, l]]) P(c, o, u0, 2.1, w0, u1, 2.48, w1);
  for (const u of [-a, a]) P(c, o, u - 0.09, 0.4, -l + 0.02, u + 0.09, 2.1, -l + 0.35);
  flatc(c, C.gold); P(c, o, -a - 0.08, 2.08, -l - 0.09, a + 0.08, 2.12, -l - 0.07); crown(c, at(...rot(o, 0, 0).slice(0, 1), o.y, rot(o, 0, -l + 0.07)[1], o.yaw + 180), 0.9, -0.01, 1.2); }
export function desk(c, lod, o) { wood(c); P(c, o, -0.75, 0.74, -0.38, 0.75, 0.8, 0.38, true); wood(c, C.dark);
  P(c, o, 0.2, 0, -0.34, 0.72, 0.74, 0.34, true); for (const u of [-0.7, -0.6]) for (const w of [-0.3, 0.3]) P(c, o, u, 0, w - 0.04, u + 0.08, 0.74, w + 0.04);
  iron(c); for (const v of [0.2, 0.45, 0.62]) P(c, o, 0.42, v, -0.36, 0.5, v + 0.03, -0.34);
  const [x, z] = rot(o, -0.4, 0.1); candle(c, x, o.y + 0.8, z, 0.18); if (lod > 1) return;
  flatc(c, C.linen); P(c, o, -0.2, 0.8, -0.2, 0.15, 0.805, 0.05); flatc(c, C.wine); P(c, o, 0.3, 0.8, -0.1, 0.62, 0.86, 0.15); flatc(c, C.blue); P(c, o, 0.32, 0.86, -0.08, 0.6, 0.91, 0.13);
  flatc(c, C.soot); const [ix, iz] = rot(o, 0.05, 0.15); LA(c, ix, o.y + 0.8, iz, [[0.03, 0], [0.035, 0.05], [0.01, 0.06]], 6); }
export function wardrobe(c, lod, o, w = 1.3) { const a = w / 2; wood(c, C.dark); P(c, o, -a, 0.08, -0.32, a, 2.1, 0.3, true); P(c, o, -a - 0.06, 2.1, -0.38, a + 0.06, 2.22, 0.34);
  for (const u of [-a + 0.05, a - 0.05]) P(c, o, u - 0.05, 0, -0.3, u + 0.05, 0.08, -0.2); wood(c);
  for (const s of [-1, 1]) P(c, o, s > 0 ? 0.02 : -a + 0.06, 0.2, -0.34, s > 0 ? a - 0.06 : -0.02, 1.98, -0.32);
  iron(c); for (const s of [-1, 1]) P(c, o, s * 0.06 - 0.015, 1.0, -0.37, s * 0.06 + 0.015, 1.2, -0.34); flatc(c, C.gold); P(c, o, -0.2, 2.12, -0.39, 0.2, 2.18, -0.38); }
export function chestBox(c, o, w = 0.9) { const a = w / 2; wood(c); P(c, o, -a, 0, -0.27, a, 0.45, 0.27, true); wood(c, C.dark); P(c, o, -a - 0.02, 0.45, -0.29, a + 0.02, 0.56, 0.29, true);
  iron(c); for (const u of [-a + 0.12, a - 0.12]) P(c, o, u - 0.03, 0, -0.3, u + 0.03, 0.57, 0.3); P(c, o, -0.06, 0.3, -0.31, 0.06, 0.46, -0.28); }
export function shelf(c, lod, o, L = 1.8, h = 2.0) { wood(c, C.dark); for (const u of [-L / 2, L / 2 - 0.06]) P(c, o, u, 0, -0.35, u + 0.06, h, 0, true);
  for (let v = 0.1; v < h; v += 0.5) P(c, o, -L / 2, v, -0.35, L / 2, v + 0.04, 0); PS(o, -L / 2, 0, -0.35, L / 2, h, 0); if (lod > 1) return;
  const cols = [C.wine, C.blue, "oklch(0.55 0.06 140)", "oklch(0.6 0.08 60)", C.linen]; let k = 0;
  for (let v = 0.14; v < h - 0.3; v += 0.5) for (let u = -L / 2 + 0.15; u < L / 2 - 0.2; u += 0.13 + (k % 3) * 0.04) { k++;
    if (k % 4 === 0) { flatc(c, "oklch(0.7 0.05 60)"); PL_(c, o, u + 0.05, v, -0.17, [[0.06, 0], [0.07, 0.12], [0.03, 0.2], [0.035, 0.24]], 6); u += 0.06; }
    else { flatc(c, cols[k % 5]); P(c, o, u, v, -0.3, u + 0.06 + (k % 2) * 0.02, v + 0.24 + (k % 3) * 0.04, -0.08); } } }
export function rack(c, lod, o, L = 2.4) { wood(c, C.dark); P(c, o, -L / 2, 0, -0.3, L / 2, 0.1, 0, true); P(c, o, -L / 2, 1.5, -0.3, L / 2, 1.6, 0); PS(o, -L / 2, 0, -0.3, L / 2, 1.9, 0);
  for (const u of [-L / 2, L / 2 - 0.1]) P(c, o, u, 0, -0.3, u + 0.1, 1.9, 0); if (lod > 2) return;
  for (let i = 0; i < Math.floor(L / 0.38); i++) { const u = -L / 2 + 0.25 + i * 0.38;
    if (i % 2) { wood(c); P(c, o, u - 0.02, 0.1, -0.17, u + 0.02, 2.4, -0.13); paint(c, IR, "oklch(0.8 0.01 250)"); P(c, o, u - 0.07, 2.3, -0.16, u + 0.07, 2.55, -0.14); }
    else { paint(c, IR, "oklch(0.8 0.01 250)"); P(c, o, u - 0.035, 0.1, -0.16, u + 0.035, 1.35, -0.14); wood(c); P(c, o, u - 0.12, 1.33, -0.18, u + 0.12, 1.38, -0.12); P(c, o, u - 0.02, 1.38, -0.17, u + 0.02, 1.6, -0.13); } } }
export function pew(c, o, L) { wood(c, C.dark); P(c, o, -L / 2, 0.42, -0.22, L / 2, 0.48, 0.22); P(c, o, -L / 2, 0.48, 0.18, L / 2, 1.0, 0.24); for (const u of [-L / 2, L / 2 - 0.08]) P(c, o, u, 0, -0.24, u + 0.08, 1.0, 0.24); PS(o, -L / 2, 0, -0.24, L / 2, 1.0, 0.24); }
export function throne(c, lod, o) { wood(c, C.dark); P(c, o, -0.55, 0, -0.45, 0.55, 0.5, 0.4, true); P(c, o, -0.55, 0.5, 0.25, 0.55, 2.6, 0.42, true);
  for (const s of [-1, 1]) { P(c, o, s * 0.55 - 0.08, 0.5, -0.45, s * 0.55 + 0.08, 0.85, 0.3); PL_(c, o, s * 0.55, 2.6, 0.34, [[0.07, 0], [0.09, 0.1], [0.001, 0.22]], 8); }
  flatc(c, C.wine); P(c, o, -0.45, 0.5, -0.4, 0.45, 0.62, 0.25); P(c, o, -0.42, 0.65, 0.2, 0.42, 2.2, 0.25); flatc(c, C.gold); P(c, o, -0.47, 0.62, -0.42, 0.47, 0.64, -0.39);
  for (const s of [-1, 1]) { flatc(c, C.gold); PL_(c, o, s * 0.55, 2.82, 0.34, [[0.05, 0], [0.06, 0.05], [0.001, 0.1]], 6); }
  crown(c, at(o.x, o.y, o.z, o.yaw), 2.25, 0.195, 0.9); }
export function warTable(c, lod, o) { table(c, lod, o, 3.6, 1.8, false); flatc(c, "oklch(0.72 0.06 80)"); P(c, o, -1.7, 0.79, -0.82, 1.7, 0.8, 0.82);
  flatc(c, "oklch(0.5 0.06 140)"); P(c, o, -1.5, 0.8, -0.7, 0.4, 0.805, 0.5); P(c, o, 0.6, 0.8, -0.3, 1.5, 0.805, 0.7); flatc(c, C.blue); P(c, o, 0.4, 0.8, -0.8, 0.6, 0.808, 0.8); P(c, o, -1.6, 0.8, 0.5, 1.6, 0.806, 0.78);
  flatc(c, "oklch(0.45 0.03 60)"); for (const [u, w] of [[-0.9, -0.3], [-0.3, 0.1], [1.0, 0.2], [0.9, -0.1]]) P(c, o, u - 0.06, 0.8, w - 0.06, u + 0.06, 0.9, w + 0.06);
  flatc(c, C.wine); for (const [u, w] of [[-1.2, 0.2], [1.2, 0.4]]) { P(c, o, u - 0.01, 0.8, w - 0.01, u + 0.01, 1.0, w + 0.01); P(c, o, u, 0.92, w - 0.005, u + 0.12, 0.99, w + 0.005); } }
export function wallMap(c, o, v0 = 1.2, w = 3.2, h = 2.0) { wood(c, C.dark); P(c, o, -w / 2 - 0.08, v0 - 0.08, -0.06, w / 2 + 0.08, v0 + h + 0.08, 0);
  paint(c, CANVAS, "oklch(0.88 0.05 80)"); P(c, o, -w / 2, v0, -0.07, w / 2, v0 + h, -0.06);
  flatc(c, "oklch(0.55 0.06 140)"); P(c, o, -w / 2 + 0.2, v0 + 0.3, -0.075, 0.2, v0 + h - 0.3, -0.07); P(c, o, 0.5, v0 + 0.5, -0.075, w / 2 - 0.3, v0 + 1.5, -0.07);
  flatc(c, C.blue); P(c, o, 0.2, v0 + 0.15, -0.078, 0.38, v0 + h - 0.1, -0.075); flatc(c, C.wine); P(c, o, -0.6, v0 + 1.0, -0.08, -0.45, v0 + 1.15, -0.075); crown(c, o, v0 + h - 0.45, -0.08, 0.5); }
function altar(c, o) { stone(c); P(c, o, -2, 0, -1.1, 2, 0.3, 1.1, true); P(c, o, -1.2, 0.3, -0.45, 1.2, 1.2, 0.45, true); flatc(c, C.wine); P(c, o, -1.25, 1.2, -0.5, 1.25, 1.23, 0.5); flatc(c, C.gold); P(c, o, -0.9, 1.0, -0.51, 0.9, 1.23, -0.5);
  flatc(c, C.gold); PL_(c, o, 0, 1.23, 0, [[0.22, 0], [0.22, 0.06], [0.06, 0.1], [0.06, 0.55], [0.2, 0.6], [0.24, 1.0], [0.08, 1.12], [0.01, 1.2]], 8);
  c.color("oklch(0.92 0.12 85)"); c.emissive(5, 3, 1); PL_(c, o, 0, 1.88, 0, [[0.15, 0], [0.15, 0.33], [0.01, 0.33]], 8); c.emissive(null);
  for (const u of [-0.9, 0.9]) { const [x, z] = rot(o, u, 0); candle(c, x, o.y + 1.23, z, 0.3); } }
function sacks(c, x, z, n = 3) { paint(c, CANVAS, "oklch(0.85 0.04 80)"); for (let i = 0; i < n; i++) LA(c, x + (i % 2) * 0.5, 0, z + i * 0.35, [[0.2, 0], [0.26, 0.2], [0.22, 0.5], [0.08, 0.62], [0.001, 0.64]], 8); }

// ---- the great hall's dressing and roof ----
function hallRoof(c, lod) { const { HW, T, EAVE, RIDGE, HZ0, Z1 } = K, xe = HW + T + 0.25, ye = EAVE - 0.15, za = HZ0 - T, zb = Z1, th = 0.3;
  const yr = (x) => ye + (RIDGE - ye) * (1 - Math.abs(x) / xe);
  wood(c, C.dark); for (const s of [-1, 1]) HEX(c, [[s * xe, ye, za], [0, RIDGE, za], [0, RIDGE, zb], [s * xe, ye, zb], [s * xe, ye + th, za], [0, RIDGE + th, za], [0, RIDGE + th, zb], [s * xe, ye + th, zb]]);
  paint(c, PL, C.plaster); for (const z of [HZ0 - T, HZ0, Z1 - T, Z1]) { c.tri(-xe, ye, z, xe, ye, z, 0, RIDGE + 0.05, z); c.tri(xe, ye, z, -xe, ye, z, 0, RIDGE + 0.05, z); }
  wood(c, C.dark); BX(c, -0.15, RIDGE - 0.4, za, 0.15, RIDGE - 0.05, zb);
  for (const s of [-1, 1]) { const x = s * 4.2; BX(c, x - 0.12, yr(x) - 0.42, za, x + 0.12, yr(x) - 0.12, zb); BX(c, s * HW - 0.25, EAVE - 0.35, za, s * HW + 0.25 * s, EAVE - 0.05, zb); }
  for (const z of K.TRUSS) { BX(c, -HW, 9.4, z - 0.17, HW, 9.74, z + 0.17); BX(c, -0.13, 9.74, z - 0.13, 0.13, RIDGE - 0.3, z + 0.13);
    for (const s of [-1, 1]) { SEG(c, [s * HW, 9.6, z], [0, RIDGE - 0.25, z], 0.28, 0.24); SEG(c, [0, 9.9, z], [s * 3.6, yr(3.6) - 0.3, z], 0.16);
      BX(c, s * HW - 0.22 * s, 7.4, z - 0.15, s * HW, 9.4, z + 0.15); SEG(c, [s * HW, 8.3, z], [s * (HW - 1.4), 9.42, z], 0.16);
      stone(c); BX(c, s * HW - 0.35 * s, 7.05, z - 0.2, s * HW, 7.4, z + 0.2); wood(c, C.dark); } }
  if (lod > 1) return; for (let z = za + 0.6; z < zb - 0.3; z += 1.0) for (const s of [-1, 1]) SEG(c, [s * (xe - 0.3), yr(xe - 0.3) - 0.08, z], [0, RIDGE - 0.08, z], 0.11); }
function gallery(c, lod) { const { HW, GW, GZ, HZ0, F1, F2, SW } = K, e = HW - GW;
  wood(c, C.dark);
  for (const s of [-1, 1]) { BX(c, s * e - 0.15, F1 - 0.35, HZ0 + GW, s * e + 0.15, F1, GZ); BX(c, s * HW, F1 - 0.3, HZ0, s * (HW - 0.22), F1, GZ);
    for (const z of [GZ - 0.15, -1.9, -7.0, HZ0 + GW]) { B(c, s * e - 0.15, 0, z - 0.15, s * e + 0.15, F1 - 0.35, z + 0.15, true); stone(c); BX(c, s * e - 0.22, 0, z - 0.22, s * e + 0.22, 0.25, z + 0.22); wood(c, C.dark);
      if (lod <= 2) for (const d of [-1, 1]) if (HZ0 + GW <= z + d * 0.8 && z + d * 0.8 <= GZ) SEG(c, [s * e, 3.5, z], [s * e, F1 - 0.3, z + d * 0.8], 0.13); }
    balustrade(c, lod, "z", s * (e + 0.06), HZ0 + GW, GZ, F2); balustrade(c, lod, "x", GZ - 0.06, Math.min(s * (HW - SW), s * e), Math.max(s * (HW - SW), s * e), F2);
    if (lod <= 2) for (let z = HZ0 + 0.6; z < GZ; z += 1.2) { BX(c, s * HW, F1 - 0.22, z - 0.08, s * e, F1, z + 0.08); stone(c); BX(c, s * HW, F1 - 0.6, z - 0.14, s * (HW - 0.3), F1 - 0.3, z + 0.14); wood(c, C.dark); } }
  BX(c, -e, F1 - 0.35, HZ0 + GW - 0.15, e, F1, HZ0 + GW + 0.15); BX(c, -HW, F1 - 0.3, HZ0, HW, F1, HZ0 + 0.22);
  for (const x of [-2.9, 2.9]) B(c, x - 0.15, 0, HZ0 + GW - 0.15, x + 0.15, F1 - 0.35, HZ0 + GW + 0.15, true);
  balustrade(c, lod, "x", HZ0 + GW - 0.06, -e, e, F2);
  if (lod <= 2) for (let x = -e + 0.6; x < e; x += 1.2) BX(c, x - 0.08, F1 - 0.22, HZ0, x + 0.08, F1, HZ0 + GW);
  for (const [x, col] of [[-3.6, C.blue], [0, C.wine], [3.6, C.blue]]) banner(c, at(x, 0, HZ0 + GW - 0.08, 180), 2.6, F2 + 0.05, 1.1, col); }
function greatHall(c, lod) { const { HW, HZ0, Z1, T, F2 } = K;
  flatc(c, C.wine); BX(c, -0.95, 0, -10.4, 0.95, 0.012, Z1 - T); flatc(c, C.gold); for (const s of [-1, 1]) BX(c, s * 0.85 - 0.04, 0, -10.4, s * 0.85 + 0.04, 0.015, Z1 - T);
  stone(c); B(c, -4.5, 0, HZ0, 4.5, 0.38, -11, true); wood(c); B(c, -4.55, 0.38, HZ0, 4.55, 0.45, -10.95, true);
  stone(c); B(c, -2.2, 0, -11, 2.2, 0.3, -10.7, true); B(c, -2.2, 0, -10.7, 2.2, 0.15, -10.4, true);
  rug(c, 0, 0.45, -12.5, 5, 2.6); throne(c, lod, at(0, 0.45, -13.25, 180));
  for (const s of [-1, 1]) { wood(c, C.dark); PL_(c, at(s * 2.2, 0.45, -12.9), 0, 0, 0, [[0.28, 0], [0.3, 0.1], [0.14, 0.2], [0.14, 1.0], [0.2, 1.05]], 8); iron(c); LA(c, s * 2.2, 1.5, -12.9, [[0.12, 0], [0.32, 0.25], [0.34, 0.32]], 10); flatc(c, C.soot); BX(c, s * 2.2 - 0.25, 1.72, -13.15, s * 2.2 + 0.25, 1.78, -12.65); }
  banner(c, at(0, 0, HZ0, 180), 1.2, 4.2, 1.6); for (const s of [-1, 1]) banner(c, at(s * 3.4, 0, HZ0, 180), 1.6, 4.0, 0.9, C.blue);
  for (const s of [-1, 1]) { const o = at(s * 3.4, 0, -1.5, 90); table(c, lod, o, 13, 1.0); for (const w of [-0.78, 0.78]) bench(c, at(...[rot(o, 0, w)[0]], 0, rot(o, 0, w)[1], 90), 12.4);
    hearth(c, lod, at(s * HW, 0, -6, 90 * s)); for (const z of [-6.8, 0.6]) banner(c, at(s * HW, 0, z, 90 * s), F2 + 0.8, 9.2, 1.3, z < 0 ? C.wine : C.blue); }
  for (const z of K.RINGS) candleRing(c, lod, 0, 6.3, z, 1.15, 9.4);
  windowGlow(c, at(0, 0, Z1 - T, 0), 5.8, 2.6, 3.3); for (const s of [-1, 1]) banner(c, at(s * 3.6, 0, Z1 - T, 0), 5.0, 9.0, 1.4); }
function stairs(c, lod) { const { HW, SW, FOOT, STEPS, RUN, F2 } = K, rise = F2 / STEPS;
  for (const s of [-1, 1]) { stairFlight(c, s * HW, s * (HW - SW), FOOT, STEPS, rise, RUN); stairRail(c, lod, s * (HW - SW + 0.04), FOOT, STEPS, rise, RUN); } }
// ---- the wings: one function per room ----
const ROOMS = {
  chapel(c, lod) { altar(c, at(-13.5, 0, -18.4)); for (let i = 0; i < 4; i++) { const z = -16 + i * 1.5; pew(c, at(-16.1, 0, z), 3.6); pew(c, at(-11.2, 0, z), 3.0); }
    flatc(c, C.wine); BX(c, -13.95, 0, -17.2, -13.05, 0.01, -9.3); windowGlow(c, at(-13.5, 0, -19.5, 180), 1.8, 1.6, 2.4, [1.3, 0.85, 0.35], "oklch(0.6 0.12 70)");
    sconce(c, at(-18.56, 0, -13, -90)); sconce(c, at(-8.5, 0, -16, 90)); },
  kitchen(c, lod) { hearth(c, lod, at(-18.56, 0, -4, -90), 1.15); table(c, lod, at(-13.5, 0, -4.2, 0), 2.6, 1.1, false); shelf(c, lod, at(-16.2, 0, -8.85, 180), 2.6, 2.2);
    if (lod <= 1) { iron(c); for (let i = 0; i < 4; i++) { const z = -5.2 + i * 0.7; SEG(c, [-17.1, 3.2, z], [-17.1, 2.4, z], 0.02); LA(c, -17.1, 2.1, z, [[0.18, 0], [0.2, 0.25], [0.18, 0.3]], 8); }
      flatc(c, "oklch(0.6 0.08 60)"); LA(c, -14, 0.79, -4, [[0.15, 0], [0.16, 0.06], [0.08, 0.12], [0.001, 0.13]], 8); flatc(c, "oklch(0.55 0.1 30)"); LA(c, -12.8, 0.79, -4.4, [[0.1, 0], [0.12, 0.08], [0.001, 0.12]], 8); }
    BARREL(c, -17.6, 0, -7.6); BARREL(c, -16.9, 0, -7.9); sacks(c, -11, -8.2); },
  guardroom(c, lod) { table(c, lod, at(-13.5, 0, 7, 90), 4, 1.0); for (const w of [-0.78, 0.78]) bench(c, at(-13.5 + w, 0, 7, 90), 3.6);
    rack(c, lod, at(-18.56, 0, 6, -90), 3); rack(c, lod, at(-14, 0, 12.4, 0), 2.4); chestBox(c, at(-17.8, 0, 2.2, -90)); BARREL(c, -9.3, 0, 11.5); },
  armoury(c, lod) { rack(c, lod, at(11.5, 0, -6.15, 0), 3); rack(c, lod, at(8.5, 0, -9.5, -90), 2.4); rack(c, lod, at(11.5, 0, -19.5, 180), 3);
    table(c, lod, at(11.5, 0, -11, 0), 2.0, 0.9, false); stool(c, 11, 0, -10);
    iron(c); for (let i = 0; i < 9; i++) BX(c, 13.95, 0, -17.55 + i * 0.13, 14.05, 2.4, -17.53 + i * 0.13); chestBox(c, at(16, 0, -18.8, 180), 1.0); BARREL(c, 15, 0, -15.3); },
  storeroom(c, lod) { for (let i = 0; i < 4; i++) BARREL(c, 17.8, 0, -5.2 + i * 0.75); sacks(c, 15.4, -5.2, 4); shelf(c, lod, at(13, 0, -5.85, 180), 3, 2.2); wood(c); B(c, 9.2, 0, -0.2, 10.2, 0.8, 0.8, true); B(c, 9.3, 0.8, -0.1, 10.0, 1.4, 0.6, true); },
  steward(c, lod) { desk(c, lod, at(14.6, 0, 8, 90)); stool(c, 15.6, 0, 8.2); shelf(c, lod, at(18.56, 0, 5, 90), 2.4, 2.4); shelf(c, lod, at(18.56, 0, 10.5, 90), 2.4, 2.4);
    chestBox(c, at(11, 0, 12, 0), 0.8); rug(c, 13.5, 0, 7.5, 3.4, 2.4, C.blue, C.gold); },
  maproom(c, lod) { warTable(c, lod, at(0, 0, -17.2)); wallMap(c, at(0, 0, -19.5, 180)); shelf(c, lod, at(-5, 0, -19.5, 180), 2.4); shelf(c, lod, at(5, 0, -19.5, 180), 2.4);
    for (const [x, z] of [[-1.2, -16], [1.2, -16], [0, -18.4]]) stool(c, x, 0, z); },
  linen(c, lod) { const y = K.F2; shelf(c, lod, at(-16, y, -19.5, 180), 3, 2.2); for (const z of [-17, -15]) chestBox(c, at(-18, y, z, -90)); sacks(c, -11, -18.6); },
  barracks(c, lod) { const y = K.F2; for (const z of [3.75, 7, 10.25, -1.5, -4.75]) { bed(c, lod, at(-17.125, y, z, 90), "cot"); chestBox(c, at(-15.7, y, z, 90), 0.7); }
    rack(c, lod, at(-8.65, y, 8, 90), 3); table(c, lod, at(-12.5, y, 4, 0), 1.6, 0.9); stool(c, -12.5, y, 3.1); windowGlow(c, at(-18.56, y, 1.3, -90), 1.2, 1.0, 1.6); },
  stewardRoom(c, lod) { const y = K.F2; bed(c, lod, at(17.4, y, -17.6, -90), "guest"); desk(c, lod, at(10, y, -18.9, 0)); stool(c, 10, y, -18.1); chestBox(c, at(15.8, y, -19.1, 0));
    wardrobe(c, lod, at(18.56, y, -10.5, 90)); rug(c, 14, y, -14.5, 3, 2, C.blue); windowGlow(c, at(18.56, y, -14, 90), 1.2, 1.0, 1.6); },
  reeve(c, lod) { const y = K.F2; bed(c, lod, at(17.2, y, 3, -90), "canopy"); rug(c, 14, y, 3, 4.2, 3.4); desk(c, lod, at(11.2, y, 10.2, 180)); stool(c, 11.2, y, 9.4);
    wardrobe(c, lod, at(14.5, y, -7.8, 180), 1.5); chestBox(c, at(15.4, y, 3, 90), 1.1); shelf(c, lod, at(9.6, y, 12.4, 0), 2.0, 2.2);
    windowGlow(c, at(18.56, y, 8.2, 90), 1.1, 1.3, 2.0); windowGlow(c, at(18.56, y, -3, 90), 1.1, 1.3, 2.0); banner(c, at(18.56, y, 3, 90), 2.8, 3.6, 1.6); },
  guests(c, lod) { const y = K.F2; for (const s of [-1, 1]) { bed(c, lod, at(s * 6.4, y, -18.4, 0), "guest"); chestBox(c, at(s * 6.4, y, -16.9, 0), 0.9);
    wood(c); B(c, s * 4.4, y, -19.4, s * 4.4 + 0.6 * s, y + 0.7, -18.8, true); candle(c, s * 4.7, y + 0.7, -19.1, 0.22); stool(c, s * 3, y, -17); rug(c, s * 4.5, y, -16.8, 2.8, 1.8, s < 0 ? C.blue : C.wine);
    windowGlow(c, at(s * 2.5, y, -19.5, 180), 1.2, 1.0, 1.6); } },
};
export function build(c) { const lod = c.lod ?? 1, sh = shell();
  for (const [m, ...b] of sh.W) { m === "stone" ? stone(c) : paint(c, PL, C.plaster); B(c, ...b, true); }
  for (const [m, ...b] of sh.S) { m === "flag" ? paint(c, FLAG, C.stone) : wood(c, m === "ceil" ? C.dark : C.oak); B(c, ...b, true); }
  stairs(c, lod); gallery(c, lod); hallRoof(c, lod);
  wood(c, C.dark); BX(c, -K.HW, K.F2 - 0.12, K.HZ0, -K.HW + 0.08, K.F2 + 0.14, K.Z1 - K.T); BX(c, K.HW - 0.08, K.F2 - 0.12, K.HZ0, K.HW, K.F2 + 0.14, K.Z1 - K.T);
  for (const d of sh.D) doorFrame(c, d);
  if (lod > 2) return;
  greatHall(c, lod); for (const r of Object.values(ROOMS)) r(c, lod);
  if (lod <= 1) { wood(c, C.dark); for (const [x0, x1] of [[K.X0 + K.T, -K.HW - K.T], [K.HW + K.T, K.X1 - K.T]]) for (let z = -19; z < 12.4; z += 2.2) { BX(c, x0, K.F1 - 0.25, z - 0.1, x1, K.F1, z + 0.1); BX(c, x0, K.TOP - 0.22, z - 0.1, x1, K.TOP, z + 0.1); } }
  for (const [x, z, yaw] of [[-K.HW, -5, -90], [0, K.HZ0, 180], [K.HW, -5, 90]]) sconce(c, at(x, K.F2, z, yaw === 180 ? 180 : yaw === -90 ? -90 : 90), 1.6);
}
export function geometry(c) { SK = null; build(c); c.albedo(null); c.color(null); c.emissive(null); }
export function collider(c) { SK = []; build(NOOP); const out = SK; SK = null; return out; }
