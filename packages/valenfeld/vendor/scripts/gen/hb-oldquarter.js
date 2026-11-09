// HIGHBRIDGE OLD QUARTER: Rainstairs and Masons Bend hero pieces (hb-oldquarter style: mossy fieldstone, ochre/rose wash,
// black timber, mossy slate, woad cloth). Layout rows: scripts/lib/data/hb/oldquarter.yml. params.kind:
//   terrace { L, top, rise, half, lanes, lw, basins, niches, lines, bastion, gaps, cut, shelves: [[x1, z0, z1]] }: one stepped band of the Rainstairs.
//            origin = band's west edge at its paved top (y 0); x 0..L east, z -half..half. Its slab reaches down to world y 84.
//            rise > 0: a ten-step flight per lane at x 0..2.8 climbing to the band above (landing = the rest of the band).
//            bastion: the top band's tall west face (buttresses, crenels, Annvyr banners); gaps [[z0,z1]] in its parapet;
//            cut [x0,z0,x1,z1] an opening in the paving (the den stairwell).
//   grand   { n }: the bastion stair: 8 flights of 10 steps up +z with landings, 3.5 m wide, foot at origin.
//   den     { }: the Leaky Gutter's stair shed and the vaulted cellar under it (the Thieves Guild den), floor at origin.
//   wayshrine, stables { }, stoneyard { }, works { }: Masons Bend yards; front on -z.
import { paint, flatc, glow, HX, BX, RB, LA, CY, ROOF, BARREL, SEG, PIPE, ROPE, LOFT, FS, OAK, PL, SL, IR, FLAG, HAY, CANVAS, STONE, WOOD, WHITE, IRONC } from "../lib/buildkit.js";
import { lantern_hbOldquarter } from "../lib/pieces/lantern.js";   // shared lantern piece, drawn in this building's palette
import { banner_hbOldquarter } from "../lib/pieces/banner.js";   // shared banner piece, drawn in this building's palette
const ASH = "cdn/texture-grey-ashlar-stone-wall.png", BLK = "cdn/texture-black-charred-timber-planks.png", RED = "cdn/texture-faded-red-cloth-weave.png";
const OCH = "cdn/texture-faded-ochre-cloth-weave.png", CREAM = "cdn/texture-ashlar-cream-limestone-two-courses-big-dressed-blocks-thin-pale-mortar-subtle-weathering.png", MOSS = "cdn/texture-slate-roof-tiles-mossy.png";
const WARM = [2.4, 1.2, 0.4], CANDLE = [3.2, 1.7, 0.55], GOLD = "oklch(0.8 0.14 85)", CRIM = "oklch(0.55 0.17 25)", WASH = "oklch(0.93 0.06 70)", ROSE = "oklch(0.9 0.06 25)";
const CLOTH = ["oklch(0.96 0.02 90)", "oklch(0.62 0.15 25)", "oklch(0.55 0.11 255)", "oklch(0.82 0.12 85)", "oklch(0.75 0.08 150)", "oklch(0.85 0.07 20)"];
const FLOW = ["oklch(0.65 0.2 15)", "oklch(0.86 0.16 90)", "oklch(0.66 0.17 330)", "oklch(0.95 0.03 90)", "oklch(0.7 0.15 50)"];
function rng(seed) { let a = (Math.floor((seed || 1) * 2654435761) >>> 0) || 1;
  return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function box(L, x0, y0, z0, x1, y1, z1) { if (x0 > x1) [x0, x1] = [x1, x0]; if (y0 > y1) [y0, y1] = [y1, y0]; if (z0 > z1) [z0, z1] = [z1, z0];
  if (x1 - x0 < 0.01 || y1 - y0 < 0.01 || z1 - z0 < 0.01) return; L.push({ kind: "box", width: x1 - x0, height: y1 - y0, depth: z1 - z0, center: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2] }); }
// a rectangle minus an optional hole, as up to four boxes (draw = BX or collider box)
function holed(f, x0, y0, z0, x1, y1, z1, cut) { if (!cut) return f(x0, y0, z0, x1, y1, z1); const [a, b, e, g] = cut;
  f(x0, y0, z0, a, y1, z1); f(e, y0, z0, x1, y1, z1); f(a, y0, z0, e, y1, b); f(a, y0, g, e, y1, z1); }
// spans along z between gaps: calls f(z0, z1) for each run of [lo, hi] outside the gaps
function runs(lo, hi, gaps, f) { const g = [...gaps].sort((p, q) => p[0] - q[0]); let s = lo; for (const [a, b] of g) { if (a > s) f(s, Math.min(a, hi)); s = Math.max(s, b); } if (s < hi) f(s, hi); }
function post(c, x, y, z, h, D) { paint(c, IR, IRONC); PIPE(c, [x, y, z], [x, y + h, z], 0.06, 0.05, 6); lantern(c, x, y + h, z, D); }
function candles(c, x, y, z, n, r) { for (let i = 0; i < n; i++) { const h = 0.12 + r() * 0.16, dx = (r() - 0.5) * 0.3, dz = (r() - 0.5) * 0.18;
  flatc(c, "oklch(0.93 0.03 90)"); BX(c, x + dx - 0.025, y, z + dz - 0.025, x + dx + 0.025, y + h, z + dz + 0.025); glow(c, "oklch(0.92 0.12 80)", CANDLE); BX(c, x + dx - 0.015, y + h, z + dz - 0.015, x + dx + 0.015, y + h + 0.05, z + dz + 0.015); } }
function planter(c, x, y, z, len, ax, r) { paint(c, OAK, WOOD); if (ax === "z") BX(c, x - 0.18, y, z - len / 2, x + 0.18, y + 0.28, z + len / 2); else BX(c, x - len / 2, y, z - 0.18, x + len / 2, y + 0.28, z + 0.18);
  flatc(c, "oklch(0.5 0.12 140)"); if (ax === "z") BX(c, x - 0.16, y + 0.28, z - len / 2 + 0.03, x + 0.16, y + 0.4, z + len / 2 - 0.03); else BX(c, x - len / 2 + 0.03, y + 0.28, z - 0.16, x + len / 2 - 0.03, y + 0.4, z + 0.16);
  const n = Math.round(len * 5); for (let i = 0; i < n; i++) { const t = (i + 0.5) / n - 0.5, s = 0.08 + r() * 0.06; flatc(c, FLOW[Math.floor(r() * FLOW.length)]);
    const px = ax === "z" ? x + (r() - 0.5) * 0.24 : x + t * len, pz = ax === "z" ? z + t * len : z + (r() - 0.5) * 0.24; RB(c, px, y + 0.44 + r() * 0.08, pz, s, s * 0.8, s, r() * 90); } }
// a washing line from a to b with cloths
function line(c, a, b, r) { paint(c, OAK, WOOD); ROPE(c, a, b, 0.22, 0.015, 6); const n = 3 + Math.floor(r() * 3);
  for (let i = 0; i < n; i++) { const t = (i + 0.7) / (n + 0.4), x = a[0] + (b[0] - a[0]) * t, z = a[2] + (b[2] - a[2]) * t, y = a[1] + (b[1] - a[1]) * t - 0.22 * 4 * t * (1 - t);
    const w = 0.45 + r() * 0.35, h = 0.5 + r() * 0.5, alongX = Math.abs(b[0] - a[0]) > Math.abs(b[2] - a[2]); paint(c, r() < 0.5 ? OCH : RED, CLOTH[Math.floor(r() * CLOTH.length)]);
    if (alongX) BX(c, x - w / 2, y - h, z - 0.01, x + w / 2, y, z + 0.01); else BX(c, x - 0.01, y - h, z - w / 2, x + 0.01, y, z + w / 2); } }
function lion(c, x, z, y, s) { // a blocky rampant lion on a plane facing -x at x, centred z, base y
  flatc(c, GOLD); c.emissive(0.12, 0.08, 0.01); const P = (z0, y0, z1, y1) => BX(c, x - 0.05, y + y0 * s, z + z0 * s, x, y + y1 * s, z + z1 * s);
  P(-0.25, 0.45, 0.25, 1.15); P(-0.05, 1.05, 0.45, 1.5); P(0.2, 1.3, 0.55, 1.6); P(0.25, 0.9, 0.6, 1.0); P(0.3, 1.15, 0.65, 1.25); P(-0.25, 0, -0.08, 0.5); P(0.05, 0, 0.22, 0.5); P(-0.55, 0.4, -0.25, 0.5); P(-0.62, 0.5, -0.5, 0.85); c.emissive(null); }

// ---------- terrace band ----------
function terrace(c, p, D) {
  const L = p.L ?? 8, top = p.top ?? 92, depth = top - 84, half = p.half ?? 55, rise = p.rise ?? 0, lw = p.lw ?? 4, lanes = p.lanes ?? [-33, 0, 33], r = rng(p.seed ?? top);
  // the slab: fieldstone body, flag paving on top, an opening for the stairwell
  paint(c, FS, STONE); holed((a, b, e, f, g, h) => BX(c, a, b, e, f, g, h), 0, -depth, -half, L, -0.12, half, p.cut);
  paint(c, FLAG, "oklch(0.86 0.02 80)"); holed((a, b, e, f, g, h) => BX(c, a, b, e, f, g, h), 0, -0.12, -half, L, 0, half, p.cut);
  if (D >= 5) return;
  // coping on the east drop, parapets on the drop and the outer edges; lanes stay open
  const laneGaps = lanes.map((z) => [z - lw / 2, z + lw / 2]);
  paint(c, ASH, "oklch(0.88 0.02 80)"); BX(c, L - 0.05, -0.18, -half, L + 0.12, 0.02, half);
  if (L > 3) runs(-half, half, laneGaps, (a, b) => { paint(c, FS, STONE); BX(c, L - 0.4, 0, a, L, 0.85, b); paint(c, ASH, "oklch(0.88 0.02 80)"); BX(c, L - 0.46, 0.85, a, L + 0.06, 0.97, b); });
  paint(c, FS, STONE); for (const s of [-1, 1]) { BX(c, 0, 0, s * half - (s > 0 ? 0.4 : -0.4), L, 0.85, s * half); paint(c, ASH, "oklch(0.88 0.02 80)"); BX(c, 0, 0.85, s * half - (s > 0 ? 0.46 : -0.46), L, 0.97, s * half + (s > 0 ? 0.06 : -0.06)); paint(c, FS, STONE); }
  // flights: ten steps of rise/10 on 0.28 treads climbing west to the band above
  if (rise > 0) for (const z of lanes) { const st = rise / 10;
    paint(c, ASH, "oklch(0.8 0.015 80)"); for (let i = 0; i < 9; i++) BX(c, 0.28 * i, -0.1, z - lw / 2, 0.28 * (i + 1), rise - st * (i + 1), z + lw / 2);
    if (D <= 2) { paint(c, IR, IRONC); for (const s of [-1, 1]) { const zz = z + s * (lw / 2 - 0.12); PIPE(c, [0.05, rise + 0.9, zz], [2.6, 0.9 + st, zz], 0.035, 0.035, 5);
      for (const t of [0.1, 1.3, 2.5]) PIPE(c, [t, rise - st * (t / 0.28) + 0.02, zz], [t, rise - st * (t / 0.28) + 0.92, zz], 0.025, 0.025, 4); } }
    if (D <= 3 && L > 3) for (const s of [-1, 1]) post(c, L - 0.25, 0.97, z + s * (lw / 2 + 0.2), 1.6, D);
    if (D <= 2 && L > 3) { planter(c, L - 0.9, 0, z - lw / 2 + 0.25, 1.1, "x", r); planter(c, L - 0.9, 0, z + lw / 2 - 0.25, 1.1, "x", r); } }
  // shelves: a strip of the band raised to the band above (x 0..x1, z0..z1), closing a slot between the riser and what stands on the landing
  for (const [x1, z0, z1] of p.shelves ?? []) { paint(c, FS, STONE); BX(c, 0, 0, z0, x1, rise - 0.12, z1); paint(c, FLAG, "oklch(0.86 0.02 80)"); BX(c, 0, rise - 0.12, z0, x1, rise, z1); }
  // candle niches in the riser above (court sides), basins, washing lines over lanes and courts
  if (D <= 3 && rise > 0) for (const z of p.niches ?? []) { paint(c, ASH, "oklch(0.86 0.02 80)"); BX(c, 0, 0.3, z - 0.7, 0.45, 0.45, z + 0.7); BX(c, 0, 0.45, z - 0.7, 0.4, 1.7, z - 0.5); BX(c, 0, 0.45, z + 0.5, 0.4, 1.7, z + 0.7);
    BX(c, 0, 1.4, z - 0.7, 0.45, 1.75, z + 0.7); flatc(c, "oklch(0.3 0.03 60)"); BX(c, 0, 0.45, z - 0.5, 0.06, 1.4, z + 0.5); candles(c, 0.22, 0.45, z, 4, r);
    if (D <= 2) { flatc(c, FLOW[0]); RB(c, 0.3, 0.42, z - 0.4, 0.1, 0.1, 0.1); flatc(c, FLOW[1]); RB(c, 0.3, 0.42, z + 0.4, 0.1, 0.1, 0.1); } }
  for (const z of p.basins ?? []) { const x = L * 0.55; paint(c, ASH, "oklch(0.85 0.02 80)"); BX(c, x - 1.4, 0, z - 0.8, x + 1.4, 0.75, z - 0.65); BX(c, x - 1.4, 0, z + 0.65, x + 1.4, 0.75, z + 0.8);
    BX(c, x - 1.4, 0, z - 0.65, x - 1.25, 0.75, z + 0.65); BX(c, x + 1.25, 0, z - 0.65, x + 1.4, 0.75, z + 0.65); BX(c, x - 1.25, 0, z - 0.65, x + 1.25, 0.3, z + 0.65);
    glow(c, "oklch(0.5 0.07 215)", [0.04, 0.07, 0.09]); BX(c, x - 1.25, 0.3, z - 0.65, x + 1.25, 0.62, z + 0.65);
    paint(c, FS, STONE); BX(c, x - 0.3, 0, z - 1.3, x + 0.3, 1.9, z - 0.8); flatc(c, GOLD); BX(c, x - 0.12, 1.25, z - 0.85, x + 0.12, 1.45, z - 0.6); paint(c, IR, IRONC); PIPE(c, [x, 1.3, z - 0.6], [x, 1.2, z - 0.35], 0.03, 0.03, 4);
    if (D <= 2) { paint(c, OAK, WOOD); RB(c, x + 1.0, 0.85, z - 0.6, 0.5, 0.6, 0.06, 0, 15); BARREL(c, x - 1.9, 0, z + 0.4, 0.3, 0.6, D); } }
  if (D <= 2 && p.lines !== false && L > 3) for (const z of lanes) for (const t of [0.3, 0.72]) line(c, [L * t, 5.1 + r() * 0.4, z - 2.55], [L * t, 5.0 + r() * 0.4, z + 2.55], r);
  if (D <= 2) for (const z of p.courtLines ?? []) line(c, [L * 0.5, 4.4, z - 6.8], [L * 0.5, 4.2, z + 6.8], r);
  // the bastion: buttresses, crenels and banners on the tall west face
  if (p.bastion) { paint(c, FS, STONE); for (let z = -half + 4; z < half - 2; z += 9) BX(c, -0.9, -depth, z - 0.7, 0, -1.2, z + 0.7);
    runs(-half, half, p.gaps ?? [], (a, b) => { paint(c, FS, STONE); BX(c, 0, 0, a, 0.5, 0.95, b); paint(c, ASH, "oklch(0.88 0.02 80)"); BX(c, -0.08, 0.95, a, 0.58, 1.08, b);
      if (D <= 3) for (let z = a + 0.4; z < b - 0.6; z += 1.6) BX(c, 0, 1.08, z, 0.5, 1.5, z + 0.8); });
    paint(c, ASH, "oklch(0.88 0.02 80)"); BX(c, -0.35, -1.2, -half, 0, -0.8, half);
    if (D <= 3) for (const z of p.banners ?? []) banner(c, -0.9, z, -1.5, 7, D); }
}
function terraceCol(c, p) { const L = p.L ?? 8, top = p.top ?? 92, depth = top - 84, half = p.half ?? 55, rise = p.rise ?? 0, lw = p.lw ?? 4, lanes = p.lanes ?? [-33, 0, 33], o = [];
  const f = (a, b, e, g, h, i) => box(o, a, b, e, g, h, i); holed(f, 0, Math.max(-depth, -3), -half, L, 0, half, p.ccut ?? p.cut); for (const q of p.cfill ?? []) f(...q);
  if (p.bastion) { f(0, -depth, -half, 1, -3, half); runs(-half, half, p.gaps ?? [], (a, b) => f(0, 0, a, 0.5, 1.1, b)); }
  if (L > 3) runs(-half, half, lanes.map((z) => [z - lw / 2, z + lw / 2]), (a, b) => f(L - 0.4, 0, a, L, 1, b));
  f(0, 0, -half, L, 1, -half + 0.4); f(0, 0, half - 0.4, L, 1, half);
  if (rise > 0) for (const z of lanes) for (let i = 0; i < 9; i++) f(0.28 * i, 0, z - lw / 2, 0.28 * (i + 1), rise - rise / 10 * (i + 1), z + lw / 2);
  for (const [x1, z0, z1] of p.shelves ?? []) f(0, 0, z0, x1, rise, z1);
  for (const z of p.basins ?? []) f(L * 0.55 - 1.4, 0, z - 1.3, L * 0.55 + 1.4, 0.75, z + 0.8);
  return o; }

// ---------- the bastion stair: up +z from the origin ----------
function grand(c, p, D) { const n = p.n ?? 8, st = 0.18, w = 1.75; let z = 0, y = 0; const r = rng(7);
  paint(c, ASH, "oklch(0.82 0.015 80)");
  for (let f = 0; f < n; f++) { for (let i = 0; i < 10; i++) { y += st; BX(c, -w, -0.3, z, w, y, z + 0.28); z += 0.28; }
    const lz = f === n - 1 ? 4 : 1.5; BX(c, -w, -0.3, z, w, y, z + lz);
    if (D <= 3) { paint(c, FS, STONE); const y0 = y - 10 * st; SEG(c, [-w - 0.15, y0 + 0.55, z - 2.8], [-w - 0.15, y + 0.55, z], 0.32, 1.1); BX(c, -w - 0.32, y - 0.3, z, -w + 0.02, y + 1.0, z + lz);
      if (f % 2 === 1) post(c, -w - 0.15, y + 1.0, z + lz / 2, 1.1, D); else if (D <= 2) planter(c, -w + 0.3, y, z + lz / 2, 0.9, "z", r); paint(c, ASH, "oklch(0.82 0.015 80)"); }
    z += lz; }
  paint(c, FS, STONE); BX(c, -w - 0.3, -0.3, 0, -w, Math.max(0.2, y - 0.6), z - 4); }
function grandCol(c, p) { const n = p.n ?? 8, st = 0.18, w = 1.75, o = []; let z = 0, y = 0;
  for (let f = 0; f < n; f++) { for (let i = 0; i < 10; i++) { y += st; box(o, -w, -0.3, z, w, y, z + 0.28); z += 0.28; } const lz = f === n - 1 ? 4 : 1.5; box(o, -w, -0.3, z, w, y, z + lz);
    box(o, -w - 0.32, y - 2, z - 2.8, -w + 0.02, y + 1.0, z + lz); z += lz; } return o; }

// ---------- the den: stair shed on the bastion (paving at y 3.9) and the vaulted cellar ----------
const DEN = { X: 6, Z: 4, top: 3.9, spring: 2.4, crown: 3.3, steps: 21 };
function den(c, p, D) { const { X, Z, top, spring, crown, steps } = DEN, r = rng(31), st = top / steps;
  // floor, walls, vault
  paint(c, FLAG, "oklch(0.7 0.02 70)"); BX(c, -X, -0.3, -Z, X, 0, Z);
  paint(c, ASH, "oklch(0.78 0.02 75)"); BX(c, -X - 0.4, -0.3, -Z - 0.4, -X, crown + 0.3, Z + 0.4); BX(c, X, -0.3, -Z - 0.4, X + 0.4, crown + 0.3, Z + 0.4); BX(c, -X, -0.3, Z, X, spring, Z + 0.4);
  BX(c, -X, -0.3, -Z - 0.4, -1.5, spring, -Z); BX(c, 1.5, -0.3, -Z - 0.4, X, spring, -Z);
  const R = (Z * Z + (crown - spring) ** 2) / (2 * (crown - spring)), cy = crown - R, a0 = Math.asin(Z / R), N = D <= 2 ? 10 : 4, arc = [];
  for (let i = 0; i <= N; i++) { const a = -a0 + 2 * a0 * i / N; arc.push([Math.sin(a) * R, cy + Math.cos(a) * R]); }
  LOFT(c, [arc.map(([z, y]) => [-X, y, z]), arc.map(([z, y]) => [X, y, z])]); LOFT(c, [arc.map(([z, y]) => [X, y + 0.3, z]), arc.map(([z, y]) => [-X, y + 0.3, z])]);
  if (D <= 3) { paint(c, FS, "oklch(0.75 0.02 70)"); for (const x of [-3, 0, 3]) for (let i = 0; i < N; i++) SEG(c, [x, arc[i][1] - 0.12, arc[i][0]], [x, arc[i + 1][1] - 0.12, arc[i + 1][0]], 0.35, 0.25);
    for (const x of [-3, 0, 3]) for (const s of [-1, 1]) BX(c, x - 0.2, 0, s * Z - s * 0.25, x + 0.2, spring, s * Z); }
  // the stair down from the shed: channel walls, 21 steps of top/21 on 0.28 treads
  paint(c, ASH, "oklch(0.8 0.015 80)"); const z0 = -Z - 4.5, T = 4.5 / steps; for (let i = 0; i < steps - 1; i++) BX(c, -1.5, -0.1, z0 + T * i, 1.5, top - st * (i + 1), z0 + T * (i + 1));
  paint(c, FS, STONE); BX(c, -1.9, 0, z0, -1.5, top, -Z); BX(c, 1.5, 0, z0, 1.9, top, -Z); BX(c, -1.9, -0.3, z0 - 1.6, 1.9, top - 0.12, z0);
  // the shed above: fieldstone sill, washed timber walls, door north, mossy slate roof
  const S = 3, sz0 = z0 - 1.5, sz1 = -Z, H = top + 2.8; paint(c, FS, STONE); const wl = (x0, z1, x1, z2, y0, y1) => BX(c, x0, y0, z1, x1, y1, z2);
  wl(-S, sz0, -S + 0.3, sz1, top, top + 0.6); wl(S - 0.3, sz0, S, sz1, top, top + 0.6); wl(-S, sz0, -0.65, sz0 + 0.3, top, top + 0.6); wl(0.65, sz0, S, sz0 + 0.3, top, top + 0.6);
  paint(c, PL, ROSE); wl(-S, sz0, -S + 0.25, sz1, top + 0.6, H); wl(S - 0.25, sz0, S, sz1, top + 0.6, H); wl(-S, sz0, -0.65, sz0 + 0.25, top + 0.6, H); wl(0.65, sz0, S, sz0 + 0.25, top + 0.6, H); wl(-0.65, sz0, 0.65, sz0 + 0.25, top + 2.4, H);
  paint(c, BLK, "oklch(0.7 0.01 60)"); for (const x of [-S, -0.8, 0.8, S - 0.12]) wl(x, sz0 - 0.04, x + 0.14, sz0 + 0.02, top + 0.6, H); wl(-S, sz0 - 0.05, S, sz0 + 0.02, H - 0.15, H);
  paint(c, MOSS, "oklch(0.8 0.03 150)"); const zr = (sz0 + sz1) / 2, w2 = S + 0.4;
  HX(c, [[-w2, H, sz0 - 0.4], [0, H + 1.9, sz0 - 0.4], [0, H + 1.9, sz1], [-w2, H, sz1], [-w2, H + 0.15, sz0 - 0.4], [0, H + 2.05, sz0 - 0.4], [0, H + 2.05, sz1], [-w2, H + 0.15, sz1]]);
  HX(c, [[0, H + 1.9, sz0 - 0.4], [w2, H, sz0 - 0.4], [w2, H, sz1], [0, H + 1.9, sz1], [0, H + 2.05, sz0 - 0.4], [w2, H + 0.15, sz0 - 0.4], [w2, H + 0.15, sz1], [0, H + 2.05, sz1]]);
  paint(c, PL, ROSE); c.tri(-S, H, sz0, S, H, sz0, 0, H + 1.85, sz0); lantern(c, 0.95, top + 2.2, sz0 - 0.25, D); paint(c, OAK, WOOD); RB(c, -1.1, top + 1.2, sz0 - 0.05, 0.1, 2.3, 0.1);
  if (D >= 4) return;
  // the den: map table, stools, stolen goods, a strongbox, candles
  paint(c, OAK, WOOD); BX(c, -1.4, 0.75, -0.8, 1.4, 0.85, 0.8); for (const [x, z] of [[-1.2, -0.6], [1.2, -0.6], [-1.2, 0.6], [1.2, 0.6]]) BX(c, x - 0.06, 0, z - 0.06, x + 0.06, 0.75, z + 0.06);
  flatc(c, "oklch(0.86 0.05 85)"); BX(c, -1.1, 0.85, -0.6, 1.1, 0.862, 0.6); flatc(c, "oklch(0.35 0.06 40)");
  for (let i = 0; i < 9; i++) { const x = -1 + r() * 2, z = -0.5 + r(); RB(c, x, 0.866, z, 0.25 + r() * 0.5, 0.008, 0.02, r() * 180); }
  flatc(c, CRIM); RB(c, 0.3, 0.87, 0.1, 0.06, 0.012, 0.06); RB(c, -0.5, 0.87, -0.2, 0.06, 0.012, 0.06); candles(c, -0.9, 0.85, 0.45, 3, r); candles(c, 0.9, 0.85, -0.45, 2, r);
  paint(c, OAK, WOOD); for (const [x, z] of [[-2, 0], [2, 0], [0, -1.4], [0, 1.4]]) { CY(c, x, 0, z, 0.2, 0.48, 7); BX(c, x - 0.22, 0.45, z - 0.22, x + 0.22, 0.5, z + 0.22); }
  for (let i = 0; i < 7; i++) { const s = 0.5 + r() * 0.3; paint(c, OAK, WOOD); RB(c, -X + 0.5 + (i % 2) * 0.15, s / 2 + (i > 3 ? 0.62 : 0), -Z + 0.8 + (i % 4) * 0.9, s, s, s, r() * 20); }
  for (let i = 0; i < 4; i++) BARREL(c, X - 0.55, 0, -Z + 0.7 + i * 0.75, 0.32, 0.9, D);
  paint(c, OAK, "oklch(0.6 0.06 50)"); BX(c, 2.6, 0, Z - 1.1, 3.8, 0.6, Z - 0.4); glow(c, GOLD, [1.1, 0.75, 0.15]); BX(c, 2.68, 0.6, Z - 1.02, 3.72, 0.7, Z - 0.48);
  for (let i = 0; i < 12; i++) RB(c, 2.4 + r() * 1.6, 0.03, Z - 1.6 + r() * 0.5, 0.06, 0.02, 0.06, 0);
  paint(c, RED, CRIM); for (let i = 0; i < 3; i++) PIPE(c, [-X + 0.5, 0.2 + i * 0.35, Z - 0.5 - i * 0.1], [-X + 3.2, 0.2 + i * 0.35, Z - 0.5 - i * 0.1], 0.17, 0.17, 7);
  paint(c, CANVAS, "oklch(0.75 0.03 80)"); for (let i = 0; i < 4; i++) LA(c, -2 + i * 0.7, 0, Z - 0.6, [[0, 0], [0.28, 0.05], [0.3, 0.45], [0.12, 0.62], [0, 0.66]], 7);
  for (let i = 0; i < 3; i++) { flatc(c, "oklch(0.55 0.1 70)"); RB(c, X - 0.12, 1.3 + (i % 2) * 0.1, -0.6 + i * 1.1, 0.06, 0.8, 0.95, 0, 0, 8); flatc(c, ["oklch(0.45 0.08 150)", "oklch(0.5 0.1 30)", "oklch(0.45 0.08 255)"][i]); RB(c, X - 0.17, 1.3 + (i % 2) * 0.1, -0.6 + i * 1.1, 0.02, 0.62, 0.78, 0, 0, 8); }
  paint(c, IR, "oklch(0.85 0.01 250)"); BX(c, 4.2, 0, -Z + 0.2, 5.6, 1.8, -Z + 0.55); for (let i = 0; i < 6; i++) CY(c, 4.4 + (i % 3) * 0.5, 0.6 + Math.floor(i / 3) * 0.6, -Z + 0.38, 0.06, 0.25, 6);
  for (const [x, z] of [[-X + 0.2, 2], [X - 0.2, -2.4], [-X + 0.2, -2.2]]) { paint(c, ASH, "oklch(0.8 0.02 75)"); BX(c, x - 0.2, 1.35, z - 0.3, x + 0.2, 1.42, z + 0.3); candles(c, x, 1.42, z, 3, r); }
}
function denCol(c) { const { X, Z, top, spring, crown, steps } = DEN, o = [], f = (a, b, e, g, h, i) => box(o, a, b, e, g, h, i), st = top / steps, z0 = -Z - 4.5;
  f(-X - 0.4, -0.3, -Z - 0.4, X + 0.4, 0, Z + 0.4); f(-X - 0.4, 0, -Z - 0.4, -X, crown, Z + 0.4); f(X, 0, -Z - 0.4, X + 0.4, crown, Z + 0.4); f(-X, 0, Z, X, crown, Z + 0.4);
  f(-X, 0, -Z - 0.4, -1.5, crown, -Z); f(1.5, 0, -Z - 0.4, X, crown, -Z); f(-X, crown, -Z - 0.4, X, crown + 0.3, Z + 0.4); f(-1.5, spring + 0.3, -Z - 0.4, 1.5, crown, -Z);
  const T = 4.5 / steps; for (let i = 0; i < steps - 1; i++) f(-1.5, 0, z0 + T * i, 1.5, top - st * (i + 1), z0 + T * (i + 1));
  f(-1.9, 0, z0 - 1.6, -1.5, top, -Z); f(1.5, 0, z0 - 1.6, 1.9, top, -Z); f(-1.9, 0, z0 - 1.6, 1.9, top, z0);
  const S = 3, sz0 = z0 - 1.5, sz1 = -Z, H = top + 2.8; f(-S, top, sz0, -S + 0.3, H, sz1); f(S - 0.3, top, sz0, S, H, sz1); f(-S, top, sz0, -0.65, H, sz0 + 0.3); f(0.65, top, sz0, S, H, sz0 + 0.3); f(-0.65, top + 2.4, sz0, 0.65, H, sz0 + 0.3);
  f(-S, H, sz0, S, H + 0.3, sz1); f(-1.4, 0, -0.8, 1.4, 0.85, 0.8); f(-X, 0, -Z, -X + 1.1, 1.2, Z - 0.3); f(X - 0.9, 0, -Z, X, 1, -Z + 3.4); f(4.2, 0, -Z, 5.6, 1.8, -Z + 0.6); f(2.6, 0, Z - 1.1, 3.8, 0.7, Z - 0.4);
  return o; }

// ---------- wayshrine ----------
function wayshrine(c, p, D) { const r = rng(5); paint(c, FS, STONE); BX(c, -0.9, 0, -0.9, 0.9, 0.3, 0.9); BX(c, -0.65, 0.3, -0.65, 0.65, 0.55, 0.65);
  paint(c, CREAM, "oklch(0.9 0.03 85)"); BX(c, -0.4, 0.55, -0.35, 0.4, 2.0, 0.35); paint(c, ASH, "oklch(0.85 0.02 80)"); BX(c, -0.55, 2.0, -0.5, 0.55, 2.12, 0.5);
  flatc(c, "oklch(0.25 0.03 60)"); BX(c, -0.3, 1.25, -0.37, 0.3, 1.95, -0.3); candles(c, 0, 1.25, -0.25, 5, r);
  paint(c, MOSS, "oklch(0.8 0.03 150)"); ROOF(c, -0.65, 0.65, -0.65, 0.65, 2.12, 2.75, 0.08); paint(c, ASH, "oklch(0.85 0.02 80)"); c.tri(-0.55, 2.12, -0.5, 0.55, 2.12, -0.5, 0, 2.7, -0.5); c.tri(0.55, 2.12, 0.5, -0.55, 2.12, 0.5, 0, 2.7, 0.5);
  flatc(c, CRIM); BX(c, -0.22, 0.75, -0.39, 0.22, 1.15, -0.35); flatc(c, GOLD); BX(c, -0.08, 0.85, -0.41, 0.08, 1.05, -0.38);
  if (D <= 2) { planter(c, -0.6, 0.3, -0.75, 0.5, "x", r); planter(c, 0.6, 0.3, -0.75, 0.5, "x", r); candles(c, 0, 0.55, -0.55, 4, r); } }

// ---------- city stables: 28 x 12, open front on -z, six stalls at the back, hayloft, tack room ----------
function stables(c, p, D) { const W = 14, Dd = 6, E = 4.4, RG = 8.2, r = rng(11);
  paint(c, FLAG, "oklch(0.8 0.02 75)"); BX(c, -W, 0, -Dd, W, 0.1, 0); paint(c, HAY, "oklch(0.9 0.06 85)"); BX(c, -W + 4.4, 0, 0, W, 0.14, Dd);
  paint(c, FS, STONE); BX(c, -W, 0, Dd - 0.5, W, E, Dd); BX(c, -W, 0, -Dd, -W + 0.5, E, Dd); BX(c, W - 0.5, 0, -Dd, W, E, Dd);
  paint(c, PL, WASH); c.tri(-W, E, -Dd - 0.6, -W, E, Dd + 0.6, -W, RG, 0); c.tri(W, E, Dd + 0.6, W, E, -Dd - 0.6, W, RG, 0); c.tri(-W + 0.01, E, Dd + 0.6, -W + 0.01, E, -Dd - 0.6, -W + 0.01, RG, 0); c.tri(W - 0.01, E, -Dd - 0.6, W - 0.01, E, Dd + 0.6, W - 0.01, RG, 0);
  paint(c, BLK, "oklch(0.7 0.01 60)"); for (let x = -W; x <= W + 0.01; x += 4.67) BX(c, x - 0.15, 0, -Dd, x + 0.15, E, -Dd + 0.3); BX(c, -W, E - 0.35, -Dd, W, E, -Dd + 0.3); BX(c, -W, 3.0, -0.15, W, 3.2, Dd);
  paint(c, MOSS, "oklch(0.8 0.03 150)"); ROOF(c, -W - 0.5, W + 0.5, -Dd - 0.9, Dd + 0.9, E - 0.2, RG + 0.1, 0.22); paint(c, FS, STONE); BX(c, W - 3, RG - 1.2, 0.8, W - 2.1, RG + 1.2, 1.7);
  // tack room at the west end, its door on the aisle
  paint(c, OAK, WOOD); BX(c, -W + 4.2, 0, -2.6, -W + 4.4, 3, Dd); BX(c, -W + 0.5, 0, -2.8, -W + 1.6, 3, -2.6); BX(c, -W + 2.9, 0, -2.8, -W + 4.4, 3, -2.6); BX(c, -W + 1.6, 2.4, -2.8, -W + 2.9, 3, -2.6);
  // stalls: oak partitions, mangers, hay
  for (let i = 0; i <= 6; i++) { const x = -W + 4.4 + i * 3.93; paint(c, OAK, WOOD); BX(c, x - 0.08, 0, 0.2, x + 0.08, 1.45, Dd - 0.5); BX(c, x - 0.12, 0, 0.1, x + 0.12, 2.1, 0.35);
    if (i < 6) { BX(c, x + 0.15, 0, 0.1, x + 1.15, 1.1, 0.25); BX(c, x + 2.75, 0, 0.1, x + 3.78, 1.1, 0.25); BX(c, x + 0.6, 0.7, Dd - 1.2, x + 3.3, 1.0, Dd - 0.5); paint(c, HAY, "oklch(0.88 0.08 85)"); BX(c, x + 0.7, 1.0, Dd - 1.1, x + 3.2, 1.25, Dd - 0.6); } }
  paint(c, OAK, WOOD); BX(c, -W + 0.5, 3.0, 0, W - 0.5, 3.2, Dd - 0.5);
  if (D <= 3) { paint(c, HAY, "oklch(0.9 0.08 85)"); for (let i = 0; i < 10; i++) RB(c, -W + 2 + i * 2.5 + r() * 0.5, 3.2 + 0.45 + (i % 3 === 0 ? 0.9 : 0), 2.5 + r() * 1.5, 1.3, 0.9, 0.8, r() * 30);
    for (const x of [-W + 0.4, -W + 9.73, W - 9.73]) lantern(c, x, 3.1, -Dd + 0.3, D);
    paint(c, ASH, "oklch(0.85 0.02 80)"); BX(c, -4, 0, -Dd - 2.2, 4, 0.6, -Dd - 1.4); glow(c, "oklch(0.5 0.07 215)", [0.04, 0.07, 0.09]); BX(c, -3.85, 0.15, -Dd - 2.05, 3.85, 0.55, -Dd - 1.55); }
  if (D <= 2) { paint(c, OAK, WOOD); for (let i = 0; i < 5; i++) { const x = -W + 0.7 + i * 0.7; PIPE(c, [x, 1.6, -2.4], [x, 1.6, -2.1], 0.03, 0.03, 4); paint(c, OAK, "oklch(0.45 0.07 45)"); RB(c, x, 1.35, -2.3, 0.45, 0.5, 0.15); paint(c, OAK, WOOD); }
    paint(c, IR, IRONC); for (let i = 0; i < 4; i++) PIPE(c, [W - 0.55, 1.8, -4 + i * 0.4], [W - 0.4, 1.8, -4 + i * 0.4], 0.02, 0.02, 4);
    paint(c, OAK, WOOD); BX(c, -2.2, E + 0.4, -Dd - 0.35, 2.2, E + 1.3, -Dd - 0.25); }
}
function stablesCol(c) { const W = 14, Dd = 6, E = 4.4, o = [], f = (a, b, e, g, h, i) => box(o, a, b, e, g, h, i);
  f(-W, -0.3, -Dd, W, 0.12, Dd); f(-W, 0, Dd - 0.5, W, E, Dd); f(-W, 0, -Dd, -W + 0.5, E, Dd); f(W - 0.5, 0, -Dd, W, E, Dd); f(-W, E, -Dd - 0.6, W, E + 2.5, Dd + 0.6);
  f(-W + 4.2, 0, -2.6, -W + 4.4, 3, Dd); f(-W + 0.5, 0, -2.8, -W + 1.6, 3, -2.6); f(-W + 2.9, 0, -2.8, -W + 4.4, 3, -2.6); f(-W + 0.5, 3.0, -0.2, W - 0.5, 3.2, Dd);
  for (let i = 0; i <= 6; i++) { const x = -W + 4.4 + i * 3.93; f(x - 0.1, 0, 0.1, x + 0.1, 2.1, Dd - 0.5); if (i < 6) { f(x + 0.15, 0, 0.1, x + 1.15, 1.1, 0.25); f(x + 2.75, 0, 0.1, x + 3.78, 1.1, 0.25); } }
  for (let x = -W; x <= W + 0.01; x += 4.67) f(x - 0.15, 0, -Dd, x + 0.15, E, -Dd + 0.3); f(-4, 0, -Dd - 2.2, 4, 0.6, -Dd - 1.4); return o; }

// ---------- stone-cutters' yard: 34 x 28, yard wall, block stacks, treadwheel crane, half-built house in scaffolding ----------
function stoneyard(c, p, D) { const W = 17, Dd = 14, r = rng(17);
  paint(c, FS, STONE); const gate = [[-4, 4]]; runs(-W, W, [], (a, b) => { BX(c, a, 0, Dd - 0.5, b, 1.3, Dd); });
  runs(-Dd, Dd, gate, (a, b) => BX(c, W - 0.5, 0, a, W, 1.3, b)); BX(c, -W, 0, -Dd, -W + 0.5, 1.3, Dd); runs(-W, W, [[-2, 4]], (a, b) => BX(c, a, 0, -Dd, b, 1.3, -Dd + 0.5));
  paint(c, ASH, "oklch(0.85 0.02 80)"); BX(c, -W - 0.05, 1.3, Dd - 0.55, W + 0.05, 1.42, Dd + 0.05); BX(c, -W - 0.05, 1.3, -Dd - 0.05, -W + 0.55, 1.42, Dd + 0.05);
  paint(c, CREAM, "oklch(0.92 0.03 85)"); BX(c, -W + 0.5, 0, -Dd + 0.5, W - 0.5, 0.05, Dd - 0.5);
  // the half-built house: 9 x 7 rubble walls in ragged courses, a door, joists across
  const hx = -8, hz = -5, HW = 4.5, HD = 3.5, T = 0.5; paint(c, FS, STONE);
  const ragged = (x0, z0, x1, z1, base) => { const n = Math.max(1, Math.round(Math.hypot(x1 - x0, z1 - z0))); for (let i = 0; i < n; i++) { const t0 = i / n, t1 = (i + 1) / n, h = base - (i % 3) * 0.5 - r() * 0.6;
    BX(c, x0 + (x1 - x0) * t0, 0, z0 + (z1 - z0) * t0, x0 + (x1 - x0) * t1 + (z1 === z0 ? 0 : T), h, z0 + (z1 - z0) * t1 + (z1 === z0 ? T : 0)); } };
  ragged(hx - HW, hz + HD - T, hx + HW, hz + HD - T, 5.2); ragged(hx - HW, hz - HD, hx - HW, hz + HD, 4.6); ragged(hx + HW - T, hz - HD, hx + HW - T, hz + HD, 3.8);
  BX(c, hx - HW, 0, hz - HD, hx - 0.65, 3.4, hz - HD + T); BX(c, hx + 0.65, 0, hz - HD, hx + HW, 2.6, hz - HD + T); paint(c, CREAM, "oklch(0.9 0.03 85)"); BX(c, hx - 0.85, 2.4, hz - HD - 0.05, hx + 0.85, 2.7, hz - HD + T + 0.05);
  paint(c, OAK, WOOD); for (let x = hx - HW + 0.6; x < hx + 1; x += 0.9) BX(c, x, 3.2, hz - HD, x + 0.15, 3.45, hz + HD);
  // scaffold: poles, ledgers, plank lifts, a ladder
  if (D <= 3) { const P = [], sx0 = hx - HW - 1.2, sx1 = hx + HW + 1.2, sz0 = hz - HD - 1.2; for (let x = sx0; x <= sx1 + 0.01; x += (sx1 - sx0) / 6) P.push([x, sz0]); for (let z = sz0 + 1.6; z <= hz + HD + 0.01; z += 1.6) P.push([sx0, z]);
    paint(c, OAK, "oklch(0.75 0.04 70)"); for (const [x, z] of P) PIPE(c, [x, 0, z], [x, 6.4, z], 0.06, 0.06, 5);
    for (const y of [2.1, 4.2]) { PIPE(c, [sx0, y, sz0], [sx1, y, sz0], 0.05, 0.05, 4); PIPE(c, [sx0, y, sz0], [sx0, y, hz + HD], 0.05, 0.05, 4);
      paint(c, OAK, WOOD); BX(c, sx0, y, sz0 - 0.1, sx1, y + 0.06, sz0 + 1.05); BX(c, sx0 - 0.1, y, sz0, sx0 + 1.05, y + 0.06, hz + HD); paint(c, OAK, "oklch(0.75 0.04 70)"); }
    if (D <= 2) { for (let i = 0; i < 6; i++) SEG(c, [sx0 + i * 2, 0.2, sz0 - 0.2], [sx0 + i * 2 + 2, 2.1, sz0 - 0.2], 0.04, 0.04); paint(c, OAK, WOOD);
      for (const s of [-0.25, 0.25]) PIPE(c, [sx1 + 0.4 + s, 0, sz0 - 0.4], [sx1 - 0.2 + s, 4.6, sz0 - 0.1], 0.04, 0.04, 4); for (let i = 1; i < 15; i++) { const t = i / 15; PIPE(c, [sx1 + 0.15 - 0.6 * t, 4.6 * t, sz0 - 0.4 + 0.3 * t], [sx1 + 0.65 - 0.6 * t, 4.6 * t, sz0 - 0.4 + 0.3 * t], 0.025, 0.025, 4); } } }
  // treadwheel crane: a mast, a jib over the house, a wheel, a block on the rope
  const cx = 1, cz = -1; paint(c, OAK, WOOD); BX(c, cx - 1.6, 0, cz - 1.6, cx + 1.6, 0.4, cz + 1.6); PIPE(c, [cx, 0.4, cz], [cx, 9.5, cz], 0.22, 0.18, 8);
  for (const [dx, dz] of [[-1.4, 0], [1.4, 0], [0, 1.4], [0, -1.4]]) PIPE(c, [cx + dx, 0.4, cz + dz], [cx + dx * 0.1, 4.2, cz + dz * 0.1], 0.1, 0.1, 6);
  const jx = hx + 1.5, jz = hz + 0.5; PIPE(c, [cx + 1.2, 8.2, cz + 0.2], [jx, 10.2, jz], 0.16, 0.12, 6); PIPE(c, [cx, 9.4, cz], [jx * 0.5 + cx * 0.5, 9.8, jz * 0.5 + cz * 0.5], 0.06, 0.06, 4);
  paint(c, OAK, WOOD); ROPE(c, [jx, 10.1, jz], [jx, 6.4, jz], 0, 0.025, 1); paint(c, CREAM, "oklch(0.92 0.03 85)"); BX(c, jx - 0.5, 5.6, jz - 0.3, jx + 0.5, 6.2, jz + 0.3);
  if (D <= 3) { paint(c, OAK, WOOD); const wx = cx + 2.6, wy = 2.3; for (const z of [cz - 0.9, cz + 0.9]) { const N = D <= 2 ? 16 : 8, R = 2.0;
      for (let i = 0; i < N; i++) { const a = i / N * Math.PI * 2, b = (i + 1) / N * Math.PI * 2; SEG(c, [wx + Math.cos(a) * R, wy + Math.sin(a) * R, z], [wx + Math.cos(b) * R, wy + Math.sin(b) * R, z], 0.14, 0.14); if (i % 2 === 0) SEG(c, [wx, wy, z], [wx + Math.cos(a) * R, wy + Math.sin(a) * R, z], 0.08, 0.08); } }
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; BX(c, wx + Math.cos(a) * 1.95 - 0.08, wy + Math.sin(a) * 1.95 - 0.04, cz - 0.9, wx + Math.cos(a) * 1.95 + 0.08, wy + Math.sin(a) * 1.95 + 0.04, cz + 0.9); }
    PIPE(c, [wx, wy, cz - 1.3], [wx, wy, cz + 1.3], 0.1, 0.1, 6); BX(c, wx - 0.2, 0, cz - 1.25, wx + 0.2, wy, cz - 1.0); BX(c, wx - 0.2, 0, cz + 1.0, wx + 0.2, wy, cz + 1.25); }
  // block stacks, rough stone, a banker with a part-dressed block, a canvas lodge on the south wall
  paint(c, CREAM, "oklch(0.92 0.03 85)"); for (let s = 0; s < 4; s++) { const bx = 6 + (s % 2) * 5, bz = -8 + Math.floor(s / 2) * 8;
    for (let l = 0; l < 3 - (s % 2); l++) for (let i = 0; i < 3 - l; i++) for (let j = 0; j < 2; j++) BX(c, bx + i * 1.25 + l * 0.6, l * 0.62, bz + j * 0.65, bx + i * 1.25 + l * 0.6 + 1.2, l * 0.62 + 0.6, bz + j * 0.65 + 0.6); }
  paint(c, FS, STONE); for (let i = 0; i < 6; i++) RB(c, -14 + r() * 4, 0.45, 6 + r() * 6, 1 + r() * 0.8, 0.8 + r() * 0.4, 1 + r() * 0.6, r() * 90, r() * 8, r() * 8);
  paint(c, OAK, WOOD); for (const x of [2.5, 4.5]) { BX(c, x - 0.6, 0, 7, x + 0.6, 0.8, 7.8); paint(c, CREAM, "oklch(0.92 0.03 85)"); BX(c, x - 0.45, 0.8, 7.05, x + 0.45, 1.3, 7.75); paint(c, OAK, WOOD); }
  paint(c, CANVAS, "oklch(0.85 0.06 75)"); RB(c, 3.5, 3.0, 11.6, 9, 0.08, 4.4, 0, -12); paint(c, OAK, WOOD); for (const x of [-1, 8]) for (const z of [9.6, 13.4]) PIPE(c, [x, 0, z], [x, z < 10 ? 2.55 : 3.45, z], 0.07, 0.07, 5);
  if (D <= 3) for (const [x, z] of [[W - 0.5, -4.4], [W - 0.5, 4.4]]) post(c, x, 1.42, z, 1.5, D);
}
function stoneyardCol(c) { const W = 17, Dd = 14, o = [], f = (a, b, e, g, h, i) => box(o, a, b, e, g, h, i);
  f(-W, 0, Dd - 0.5, W, 1.4, Dd); f(-W, 0, -Dd, -W + 0.5, 1.4, Dd); runs(-Dd, Dd, [[-4, 4]], (a, b) => f(W - 0.5, 0, a, W, 1.4, b)); runs(-W, W, [[-2, 4]], (a, b) => f(a, 0, -Dd, b, 1.4, -Dd + 0.5));
  const hx = -8, hz = -5, HW = 4.5, HD = 3.5, T = 0.5; f(hx - HW, 0, hz + HD - T, hx + HW, 4, hz + HD); f(hx - HW, 0, hz - HD, hx - HW + T, 4, hz + HD); f(hx + HW - T, 0, hz - HD, hx + HW, 3, hz + HD);
  f(hx - HW, 0, hz - HD, hx - 0.65, 3, hz - HD + T); f(hx + 0.65, 0, hz - HD, hx + HW, 2.6, hz - HD + T); f(-0.6, 0, -2.6, 2.6, 4, 0.6); f(2.6, 0, -2.4, 6, 4.4, 0.4);
  for (let s = 0; s < 4; s++) { const bx = 6 + (s % 2) * 5, bz = -8 + Math.floor(s / 2) * 8; f(bx, 0, bz, bx + 3.7, 1.8, bz + 1.25); } f(-14.5, 0, 5.5, -9.5, 1.3, 12.5); f(1.8, 0, 7, 5.2, 1.3, 7.8);
  return o; }

// ---------- bridgewrights' works: 22 x 12 open shed, front on -z, an arch centring with voussoirs set ----------
function works(c, p, D) { const W = 11, Dd = 6, E = 4.6, RG = 8.4, r = rng(23);
  paint(c, FLAG, "oklch(0.78 0.02 75)"); BX(c, -W, 0, -Dd, W, 0.1, Dd);
  paint(c, FS, STONE); BX(c, -W, 0, Dd - 0.5, W, E, Dd); BX(c, -W, 0, -Dd, -W + 0.5, E, Dd); BX(c, W - 0.5, 0, -Dd, W, 1.2, Dd);
  paint(c, PL, ROSE); BX(c, -W, 1.2, Dd - 0.45, W, E, Dd - 0.4); c.tri(-W, E, -Dd - 0.6, -W, E, Dd + 0.6, -W, RG, 0); c.tri(W, E, Dd + 0.6, W, E, -Dd - 0.6, W, RG, 0);
  paint(c, BLK, "oklch(0.7 0.01 60)"); for (const x of [-W + 0.2, -3.7, 3.7, W - 0.2]) BX(c, x - 0.2, 0, -Dd, x + 0.2, E, -Dd + 0.4); BX(c, -W, E - 0.45, -Dd, W, E, -Dd + 0.4);
  for (const z of [-Dd + 0.2, 0, Dd - 0.6]) { SEG(c, [-W + 0.3, E, z], [0, RG - 0.3, z], 0.25, 0.25); SEG(c, [W - 0.3, E, z], [0, RG - 0.3, z], 0.25, 0.25); BX(c, -W, E - 0.2, z - 0.15, W, E + 0.1, z + 0.15); }
  paint(c, BLK, "oklch(0.7 0.01 60)"); BX(c, W - 0.45, 1.2, -Dd, W - 0.3, E, Dd);
  paint(c, MOSS, "oklch(0.8 0.03 150)"); ROOF(c, -W - 0.5, W + 0.5, -Dd - 0.9, Dd + 0.9, E - 0.2, RG + 0.1, 0.22);
  // the centring: two timber ribs, lagging, half its voussoirs laid
  const ax = -2, R = 3.4, N = D <= 2 ? 12 : 6; paint(c, OAK, WOOD); for (const z of [-1.2, 1.2]) { for (let i = 0; i < N; i++) { const a = Math.PI * i / N, b = Math.PI * (i + 1) / N; SEG(c, [ax + Math.cos(a) * R, 1.0 + Math.sin(a) * R, z], [ax + Math.cos(b) * R, 1.0 + Math.sin(b) * R, z], 0.2, 0.3); }
    for (const x of [-R, -R / 2, 0, R / 2, R]) PIPE(c, [ax + x, 0, z], [ax + x, 1.0 + Math.sqrt(Math.max(0, R * R - x * x)) - 0.1, z], 0.08, 0.08, 5); BX(c, ax - R - 0.2, 0.9, z - 0.15, ax + R + 0.2, 1.1, z + 0.15); }
  paint(c, CREAM, "oklch(0.92 0.03 85)"); for (let i = 0; i < 9; i++) { const a = Math.PI * (i + 0.5) / 18, x = ax + Math.cos(Math.PI - a) * (R + 0.35), y = 1.0 + Math.sin(a) * (R + 0.35); RB(c, x, y, 0, 0.7, 0.48, 2.6, 0, 0, (a * 180 / Math.PI) - 90); }
  if (D <= 3) { paint(c, OAK, WOOD); for (let l = 0; l < 4; l++) for (let i = 0; i < 5 - l; i++) PIPE(c, [5 + i * 0.36 + l * 0.18, 0.18 + l * 0.32, -3.5], [5 + i * 0.36 + l * 0.18, 0.18 + l * 0.32, 3.5], 0.17, 0.17, 7);
    BX(c, 6.5, 0, 4.2, 9.5, 0.85, 5.2); paint(c, OAK, "oklch(0.88 0.04 80)"); BX(c, 6.7, 0.85, 4.4, 8.6, 0.88, 5.0); flatc(c, "oklch(0.35 0.06 250)"); for (let i = 0; i < 6; i++) RB(c, 7.0 + r() * 1.4, 0.885, 4.5 + r() * 0.4, 0.4, 0.005, 0.015, r() * 180);
    paint(c, IR, IRONC); BX(c, -9.5, 0, 3.5, -8.0, 1.1, 5.2); paint(c, OAK, WOOD); for (let i = 0; i < 3; i++) LA(c, -6.5 + i * 0.9, 0, 4.6, [[0.35, 0], [0.35, 0.18], [0, 0.18]], 10); }
  if (D <= 3) for (const x of [-3.7, 3.7]) lantern(c, x, 3.4, -Dd + 0.45, D);
  if (D <= 2) { paint(c, OAK, WOOD); BX(c, -2.2, E + 0.45, -Dd - 0.35, 2.2, E + 1.35, -Dd - 0.25); }
}
function worksCol(c) { const W = 11, Dd = 6, E = 4.6, o = [], f = (a, b, e, g, h, i) => box(o, a, b, e, g, h, i);
  f(-W, -0.3, -Dd, W, 0.1, Dd); f(-W, 0, Dd - 0.5, W, E, Dd); f(-W, 0, -Dd, -W + 0.5, E, Dd); f(W - 0.5, 0, -Dd, W, E, Dd); f(-W, E, -Dd - 0.6, W, E + 2.5, Dd + 0.6);
  for (const x of [-3.7, 3.7]) f(x - 0.2, 0, -Dd, x + 0.2, E, -Dd + 0.4); f(-5.6, 0, -1.4, 1.6, 1.1, 1.4); f(4.8, 0, -3.7, 6.8, 1.4, 3.7); f(6.5, 0, 4.2, 9.5, 0.9, 5.2); f(-9.5, 0, 3.5, -8, 1.1, 5.2); return o; }

export function geometry(c) { const p = c.params ?? {}, D = c.lod ?? 1, k = p.kind ?? "terrace";
  if (k === "terrace") return terrace(c, p, D); if (k === "grand") return grand(c, p, D); if (k === "den") return den(c, p, D); if (k === "wayshrine") return wayshrine(c, p, D);
  if (k === "stables") return stables(c, p, D); if (k === "stoneyard") return stoneyard(c, p, D); if (k === "works") return works(c, p, D); }
export function collider(c) { const p = c.params ?? {}, k = p.kind ?? "terrace";
  if (k === "terrace") return terraceCol(c, p); if (k === "grand") return grandCol(c, p); if (k === "den") return denCol(c, p); if (k === "wayshrine") { const o = []; box(o, -0.9, 0, -0.9, 0.9, 2.1, 0.9); return o; }
  if (k === "stables") return stablesCol(c); if (k === "stoneyard") return stoneyardCol(c); if (k === "works") return worksCol(c); return []; }
const banner = banner_hbOldquarter({ BX, CRIM, GOLD, OAK, PIPE, RED, WOOD, flatc, lion, paint });
const lantern = lantern_hbOldquarter({ BX, IR, IRONC, LA, WARM, glow, paint });
