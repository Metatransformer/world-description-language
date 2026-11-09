// THE TOMB OF THE SAND KINGS: carved sandstone halls under the Sunscar, painted in faded ochre and lapis.
// Place coordinates, root at the origin, entry floor y = 0 at z = 0, the route running toward -Z and down a
// sand slope to y = -4. Also exports the shared emitters (king, sun disc, arch infill, urn, sarcophagus,
// torch, brazier) that scripts/gen/sandtomb-mouth.js reuses on the overworld facade.
import { kit } from "./barrow-kit.js";
// PARAMS (Codex Kits; {} = as built): antechamber, burial, slope, treasury, boss = false strips that room's dressing; dress = false
// strips them all. The tomb shell, exit gate, torches and braziers always stand.
let P = {}; const on = (k) => P[k] !== false;
export const TX = {
  wall: "cdn/texture-carved-sandstone-hieroglyph-wall.png", block: "cdn/texture-weathered-sandstone-blocks.png",
  floor: "cdn/texture-worn-sandstone-floor-flagstones.png", stars: "cdn/texture-lapis-blue-ceiling-gold-stars.png",
  sand: "cdn/texture-red-desert-sand-ripples.png", pot: "cdn/texture-cracked-terracotta-pottery.png",
  gold: "cdn/texture-tarnished-hammered-gold.png", linen: "cdn/texture-aged-linen-mummy-wrappings.png",
  iron: "cdn/texture-wrought-iron.png", cliff: "cdn/texture-red-sandstone-cliff-layered.png", wood: "cdn/texture-weathered-wood-planks.png",
};
export const TINT = "oklch(0.94 0.03 75)", LAPIS = "oklch(0.44 0.1 255)", OCHRE = "oklch(0.68 0.12 70)", RED = "oklch(0.52 0.12 35)";
const T = 0.7;
// rooms: half width x, z0 (south/deeper) .. z1 (north); f/c floor and ceiling at z0, fN/cN at z1 when they slope
export const ROOMS = [
  { id: "vest", x: 3, z0: -6, z1: 0, f: 0, c: 4.2 },
  { id: "ante", x: 7.5, z0: -20, z1: -6, f: 0, c: 6 },
  { id: "niche", x: 2.5, z0: -44, z1: -20, f: 0, c: 4.6, stars: true },
  { id: "slope", x: 3, z0: -56, z1: -44, f: -4, fN: 0, c: 3.2, cN: 4.6 },
  { id: "treas", x: 7, z0: -70, z1: -56, f: -4, c: 3 },
  { id: "pass", x: 2, z0: -75, z1: -70, f: -4, c: 0 },
  { id: "boss", x: 10, z0: -96, z1: -75, f: -4, c: 5, stars: true },
];
const fN = (r) => r.fN ?? r.f, cN = (r) => r.cN ?? r.c;
// torches: [x, flame y, z, inward nx, nz]; braziers: feet [x, y, z]
export const TORCHES = [[-3, 2.4, -3.6, 1, 0], [-2.5, 2.55, -26.55, 1, 0], [2.5, 2.55, -35.55, -1, 0], [3, 0.6, -49, -1, 0]];
export const BRAZIERS = [[-5.8, 0, -13], [5.8, 0, -13], [-4.6, -4, -60.5], [-5.5, -4, -86.5], [5.5, -4, -86.5]];
// sand trickling from cracks: [x, ceiling y, z, floor y]
export const TRICKLES = [[1.4, 4.6, -31.5, 0], [-1.2, 4.1, -48.5, -1.5], [5.2, 3, -66.3, -4], [-8.6, 5, -81, -4]];
const pick = (ctx, a) => a[Math.floor(ctx.random() * a.length) % a.length];

export function scaled(K, s, fn) { const prev = K.map; K.map = (x, y, z) => prev(x * s, y * s, z * s); fn(); K.map = prev; }
// the stone around a round-topped gate glass of width w, height h: fills the corners between rect and arch
export function archInfill(K, w, h, z0, z1) {
  const r = w / 2, sp = h - r, N = 16, C = [], R = [];
  for (let i = 0; i <= N; i++) {
    const t = (Math.PI * i) / N, c = Math.cos(t), s = Math.sin(t);
    C.push([r * c, sp + r * s]);
    R.push(t <= Math.PI / 4 + 1e-6 ? [r, sp + r * Math.tan(t)] : t >= (3 * Math.PI) / 4 - 1e-6 ? [-r, sp + r * Math.tan(Math.PI - t)] : [(r * c) / s, h]);
  }
  for (let i = 0; i < N; i++) {
    const a = C[i], b = C[i + 1], ra = R[i], rb = R[i + 1], m = [(a[0] + b[0] + ra[0] + rb[0]) / 4, (a[1] + b[1] + ra[1] + rb[1]) / 4];
    if (Math.hypot(ra[0] - a[0], ra[1] - a[1]) + Math.hypot(rb[0] - b[0], rb[1] - b[1]) < 0.01) continue;
    K.quad([a[0], a[1], z0], [b[0], b[1], z0], [rb[0], rb[1], z0], [ra[0], ra[1], z0], [m[0], m[1], z0 + 1]);
    K.quad([a[0], a[1], z1], [b[0], b[1], z1], [rb[0], rb[1], z1], [ra[0], ra[1], z1], [m[0], m[1], z1 - 1]);
    K.quad([a[0], a[1], z0], [b[0], b[1], z0], [b[0], b[1], z1], [a[0], a[1], z1], [a[0] * 2, sp + (a[1] - sp) * 2, (z0 + z1) / 2]);
  }
}
// a seated king on his throne, facing -Z, origin at the plinth's front centre; s scales him (s = 1: 3.3 m)
export function king(K, ctx, col, s, worn = 0) {
  scaled(K, s, () => {
    if (col) { K.box(-0.95, 0, -1, 0.95, 1.3, 1.55); K.box(-0.62, 1.3, 0.35, 0.62, 3.2, 1.45); return; }
    const b = (x0, y0, z0, x1, y1, z1) => K.bbox(Math.min(x0, x1), y0, z0, Math.max(x0, x1), y1, z1, 0.025);
    K.paint(TX.block, TINT);
    b(-0.95, 0, -1.0, 0.95, 0.3, 1.55); b(-0.78, 0.3, 0, 0.78, 1.3, 1.45); b(-0.78, 1.3, 1.1, 0.78, 2.75, 1.45);
    for (const sx of [-1, 1]) {
      b(sx * 0.07, 0.3, -0.62, sx * 0.37, 1.15, -0.25); b(sx * 0.06, 0.3, -0.92, sx * 0.38, 0.44, -0.25);
      b(sx * 0.07, 1.1, -0.62, sx * 0.37, 1.42, 0.9);
      b(sx * 0.42, 1.55, 0.45, sx * 0.6, 2.42, 0.85);
      if (!(worn && sx > 0)) { b(sx * 0.14, 1.42, -0.48, sx * 0.4, 1.6, 0.6); b(sx * 0.13, 1.36, -0.64, sx * 0.41, 1.62, -0.44); }
      // throne side panel: a lapis-and-ochre feather inlay, faded
      K.paint(null, sx > 0 ? LAPIS : OCHRE, 0.95); K.box(sx * 0.78, 0.45, 0.15, sx * 0.785, 1.15, 1.3); K.paint(TX.block, TINT);
    }
    b(-0.42, 1.4, 0.42, 0.42, 2.3, 0.95); b(-0.62, 2.22, 0.42, 0.62, 2.5, 0.92);
    b(-0.13, 1.12, -0.6, 0.13, 1.45, 0.2);
    b(-0.14, 2.48, 0.55, 0.14, 2.72, 0.82); b(-0.22, 2.66, 0.46, 0.22, 3.1, 0.88);
    if (!worn) b(-0.035, 2.78, 0.39, 0.035, 2.92, 0.46);
    b(-0.05, 2.42, 0.47, 0.05, 2.7, 0.56);
    // nemes: hood, flared wings, lappets on the chest
    b(-0.27, 2.95, 0.44, 0.27, 3.28, 0.95);
    for (const sx of [-1, 1]) { b(sx * 0.22, 2.45, 0.5, sx * 0.42, 3.05, 0.9); b(sx * 0.24, 2.12, 0.38, sx * 0.38, 2.9, 0.48); }
    if (ctx.lod <= 2) {
      for (const sx of [-1, 1]) for (let k = 0; k < 5; k++) { K.paint(null, k % 2 ? OCHRE : LAPIS, 0.95); const y = 2.16 + k * 0.15; K.box(Math.min(sx * 0.24, sx * 0.38), y, 0.372, Math.max(sx * 0.24, sx * 0.38), y + 0.07, 0.38); }
      for (let k = 0; k < 4; k++) { K.paint(null, k % 2 ? OCHRE : LAPIS, 0.95); const y = 2.98 + k * 0.08; K.box(-0.275, y, 0.432, 0.275, y + 0.04, 0.44); }
      K.paint(null, "#2a1d14", 1); for (const sx of [-1, 1]) K.box(sx * 0.11 - 0.05, 2.9, 0.452, sx * 0.11 + 0.05, 2.94, 0.46);
      K.paint(TX.gold, "oklch(0.92 0.06 85)", 0.45, 0.6); K.seg([0, 3.02, 0.45], [0, 3.22, 0.4], 0.03, 0.02, 5, true);
    }
    if (worn) { K.paint(TX.block, TINT); for (let k = 0; k < 5; k++) K.rock(0.5 + (ctx.random() - 0.5) * 0.6, 0.38, -0.7 - ctx.random() * 0.4, 0.12, 0.08, 0.1, 5, 3, 0.3); }
  });
}
// the winged sun disc, protruding toward -Z from the plane z
export function sunDisc(K, ctx, cx, cy, z, R, span) {
  K.paint(TX.gold, "oklch(0.92 0.07 80)", 0.4, 0.6); ctx.smooth(); K.seg([cx, cy, z], [cx, cy, z - 0.14], R, R * 0.96, 20, true); ctx.flat();
  for (const sx of [-1, 1]) {
    for (let j = 0; j < 4; j++) {
      K.paint(null, [LAPIS, OCHRE, RED, LAPIS][j], 0.9);
      const x0 = cx + sx * R * 0.85, x1 = cx + sx * (R + (span - R) * (1 - j * 0.17)), y1 = cy + R * 0.35 - j * R * 0.22;
      K.box(Math.min(x0, x1), y1 - R * 0.2, z - 0.08, Math.max(x0, x1), y1, z);
    }
    K.paint(TX.gold, "oklch(0.92 0.07 80)", 0.4, 0.6); K.seg([cx + sx * R * 1.02, cy - R * 0.9, z - 0.06], [cx + sx * R * 1.05, cy + R * 0.2, z - 0.06], R * 0.09, R * 0.06, 6, true);
    K.rock(cx + sx * R * 1.05, cy + R * 0.28, z - 0.09, R * 0.12, R * 0.14, R * 0.08, 6, 4, 0.1);
  }
}
export function urn(K, ctx, x, y, z, s, tipped = false, yaw = 0) {
  const P = [[0, 0.1], [0.04, 0.17], [0.28, 0.27], [0.52, 0.25], [0.72, 0.13], [0.8, 0.1], [0.9, 0.14], [0.93, 0.13]];
  K.paint(TX.pot, pick(ctx, ["oklch(0.92 0.05 50)", "oklch(0.9 0.06 40)", "oklch(0.93 0.04 70)"]), 0.85);
  ctx.smooth();
  K.at(() => { for (let i = 0; i < P.length - 1; i++) K.seg([0, P[i][0] * s, 0], [0, P[i + 1][0] * s, 0], P[i][1] * s, P[i + 1][1] * s, 10, i === 0); }, x, tipped ? y + 0.26 * s : y, z, yaw, 0, tipped ? 90 : 0);
  ctx.flat();
  if (ctx.lod <= 2) { K.paint(null, pick(ctx, [LAPIS, "#2b2018"]), 0.9); K.at(() => K.seg([0, 0.5 * s, 0], [0, 0.56 * s, 0], 0.255 * s, 0.25 * s, 10), x, tipped ? y + 0.26 * s : y, z, yaw, 0, tipped ? 90 : 0); }
}
export function sarcophagus(K, ctx, col, x, y, z, yaw, ajar = false, s = 1) {
  K.at(() => scaled(K, s, () => {
    K.paint(TX.block, TINT); K.bbox(-0.5, 0, -1.15, 0.5, 0.78, 1.15, 0.04);
    if (col) return;
    K.paint(null, OCHRE, 0.9); K.box(-0.505, 0.55, -1.155, 0.505, 0.65, 1.155);
    K.paint(null, LAPIS, 0.9); K.box(-0.505, 0.1, -1.155, 0.505, 0.18, 1.155);
    K.at(() => {
      K.paint(TX.block, TINT); K.bbox(-0.55, 0, -1.2, 0.55, 0.2, 1.2, 0.04); K.bbox(-0.4, 0.2, -1.05, 0.4, 0.34, 1.05, 0.04);
      K.paint(TX.gold, "oklch(0.92 0.07 80)", 0.45, 0.55); ctx.smooth(); K.rock(0, 0.38, -0.78, 0.2, 0.1, 0.22, 10, 6, 0.04); ctx.flat();
      K.paint(null, LAPIS, 0.9); for (const sx of [-1, 1]) K.box(sx * 0.18 - 0.05, 0.34, -0.68, sx * 0.18 + 0.05, 0.36, -0.2);
      K.paint(null, "#1d140d", 1); for (const sx of [-1, 1]) K.box(sx * 0.07 - 0.03, 0.47, -0.86, sx * 0.07 + 0.03, 0.485, -0.82);
    }, ajar ? 0.32 : 0, 0.78, ajar ? 0.25 : 0, ajar ? 14 : 0);
  }), x, y, z, yaw);
}
export function torch(K, ctx, x, y, z, nx, nz) {
  K.paint(TX.iron, "oklch(0.9 0.01 60)", 0.55, 0.7);
  K.box(x + (nx ? 0 : -0.06), y - 0.75, z + (nz ? 0 : -0.06), x + nx * 0.14 + (nx ? 0 : 0.06), y - 0.45, z + nz * 0.14 + (nz ? 0 : 0.06));
  K.seg([x + nx * 0.12, y - 0.6, z + nz * 0.12], [x + nx * 0.28, y - 0.1, z + nz * 0.28], 0.02, 0.02, 4);
  K.seg([x + nx * 0.29, y - 0.14, z + nz * 0.29], [x + nx * 0.3, y, z + nz * 0.3], 0.05, 0.075, 6);
  K.paint(TX.wood, "oklch(0.8 0.03 60)"); K.seg([x + nx * 0.15, y - 0.72, z + nz * 0.15], [x + nx * 0.3, y - 0.05, z + nz * 0.3], 0.03, 0.04, 5);
  K.paint(null, "#16120f", 1); K.cyl(x + nx * 0.3, y - 0.04, z + nz * 0.3, 0.055, 0.045, 0.07, 6);
}
// a bronze bowl on a carved sandstone pedestal; the flame sits at y + 1.2
export function brazier(K, ctx, col, x, y, z) {
  if (col) return K.box(x - 0.45, y, z - 0.45, x + 0.45, y + 1.15, z + 0.45);
  K.paint(TX.block, TINT); K.bbox(x - 0.42, y, z - 0.42, x + 0.42, y + 0.18, z + 0.42, 0.03);
  ctx.smooth(); K.seg([x, y + 0.18, z], [x, y + 0.85, z], 0.22, 0.17, 12); K.seg([x, y + 0.85, z], [x, y + 0.92, z], 0.26, 0.26, 12, true);
  K.paint(TX.gold, "oklch(0.75 0.06 60)", 0.5, 0.7); K.seg([x, y + 0.9, z], [x, y + 1.15, z], 0.24, 0.5, 14, true); K.seg([x, y + 1.13, z], [x, y + 1.18, z], 0.52, 0.52, 14); ctx.flat();
  K.paint(null, "#2a120a", 1); for (let k = 0; k < 7; k++) K.rock(x + (ctx.random() - 0.5) * 0.5, y + 1.15, z + (ctx.random() - 0.5) * 0.5, 0.1, 0.06, 0.09, 5, 3, 0.3);
}
export function sandPile(K, ctx, x, y, z, rx, ry, rz, tex = TX.sand, tint = "oklch(0.92 0.06 55)") { K.paint(tex, tint, 1); ctx.smooth(); K.rock(x, y - ry * 0.35, z, rx, ry, rz, 10, 5, 0.12); ctx.flat(); }

function pillar(K, ctx, col, x, z, y0, h, r) {
  if (col) return K.box(x - r, y0, z - r, x + r, y0 + h, z + r);
  K.paint(TX.block, TINT); K.bbox(x - r * 1.3, y0, z - r * 1.3, x + r * 1.3, y0 + 0.3, z + r * 1.3, 0.04);
  K.paint(TX.wall, TINT); K.bbox(x - r, y0 + 0.3, z - r, x + r, y0 + h - 0.9, z + r, 0.05);
  K.paint(TX.block, TINT); ctx.smooth(); K.seg([x, y0 + h - 0.9, z], [x, y0 + h - 0.3, z], r * 1.02, r * 1.55, 14, true); ctx.flat();
  K.bbox(x - r * 1.45, y0 + h - 0.3, z - r * 1.45, x + r * 1.45, y0 + h, z + r * 1.45, 0.04);
  if (ctx.lod <= 2) {
    K.paint(null, LAPIS, 0.9); K.box(x - r - 0.01, y0 + h - 1.35, z - r - 0.01, x + r + 0.01, y0 + h - 1.12, z + r + 0.01);
    K.paint(null, OCHRE, 0.9); K.box(x - r - 0.01, y0 + h - 1.08, z - r - 0.01, x + r + 0.01, y0 + h - 0.96, z + r + 0.01); K.box(x - r - 0.01, y0 + 0.42, z - r - 0.01, x + r + 0.01, y0 + 0.58, z + r + 0.01);
  }
}
function shell(K, ctx, col) {
  const lod = col ? 4 : ctx.lod;
  ROOMS.forEach((r, i) => {
    const ylo = Math.min(r.f, fN(r)) - 0.4, yhi = Math.max(r.c, cN(r)) + 0.5, slope = r.fN !== undefined;
    // floor and ceiling
    K.paint(TX.floor, TINT, 0.85);
    if (slope) { const L = Math.hypot(r.z1 - r.z0, fN(r) - r.f), a = (Math.atan2(fN(r) - r.f, r.z1 - r.z0) * 180) / Math.PI; K.at(() => K.box(-r.x - T, -0.4, -L, r.x + T, 0, 0), 0, fN(r), r.z1, 0, -a); }
    else K.box(-r.x - T, r.f - 0.4, r.z0, r.x + T, r.f, r.z1);
    K.paint(r.stars ? TX.stars : TX.block, r.stars ? "oklch(0.93 0.02 250)" : TINT, 1);
    if (slope) { const L = Math.hypot(r.z1 - r.z0, cN(r) - r.c), a = (Math.atan2(cN(r) - r.c, r.z1 - r.z0) * 180) / Math.PI; K.at(() => K.box(-r.x - T, 0, -L, r.x + T, 0.5, 0), 0, cN(r), r.z1, 0, -a); }
    else K.box(-r.x - T, r.c, r.z0, r.x + T, r.c + 0.5, r.z1);
    // side walls (the niche hall's carved loculi replace its plain wall when drawn)
    for (const sx of [-1, 1]) {
      if (r.id === "niche" && !col) { nicheWall(K, ctx, r, sx, lod); continue; }
      K.paint(TX.wall, TINT); K.box(Math.min(sx * r.x, sx * (r.x + T)), ylo, r.z0, Math.max(sx * r.x, sx * (r.x + T)), yhi, r.z1);
      if (!col && lod <= 2 && !slope) { // painted dado and frieze
        const xi = sx * r.x, xo = sx * (r.x - 0.012), a = Math.min(xi, xo), b = Math.max(xi, xo);
        K.paint(null, OCHRE, 0.95); K.box(a, r.f + 0.55, r.z0, b, r.f + 0.7, r.z1);
        K.paint(null, LAPIS, 0.95); K.box(a, r.c - 0.62, r.z0, b, r.c - 0.32, r.z1);
        K.paint(null, RED, 0.95); K.box(a, r.c - 0.74, r.z0, b, r.c - 0.66, r.z1);
      }
    }
    // the wall at this room's north edge (the end wall or the boundary with the room before)
    const A = ROOMS[i - 1], b = r.z1;
    if (!A) { K.paint(TX.wall, TINT); K.box(-r.x - T, ylo, b, r.x + T, yhi, b + T); }
    else {
      const wm = Math.max(A.x, r.x) + T, wo = Math.min(A.x, r.x), fl = fN(r), top = Math.min(A.c, cN(r));
      const lo = Math.min(A.f, fl) - 0.4, hi = Math.max(A.c, cN(r)) + 0.5, z0 = b - 0.35, z1 = b + 0.35;
      K.paint(TX.wall, TINT);
      K.box(-wm, lo, z0, -wo, hi, z1); K.box(wo, lo, z0, wm, hi, z1); if (hi - top > 0.01) K.box(-wo, top, z0, wo, hi, z1);
      if (!col && lod <= 3) { // carved jambs and a lintel framing the way through
        K.paint(TX.block, TINT);
        for (const sx of [-1, 1]) K.bbox(Math.min(sx * wo, sx * (wo - 0.3)), fl, z0 - 0.15, Math.max(sx * wo, sx * (wo - 0.3)), top, z1 + 0.15, 0.04);
        K.bbox(-wo - 0.2, top - 0.4, z0 - 0.2, wo + 0.2, top + 0.1, z1 + 0.2, 0.04);
        if (lod <= 2) { K.paint(null, LAPIS, 0.9); K.box(-wo + 0.3, top - 0.3, z0 - 0.21, wo - 0.3, top - 0.18, z1 + 0.21); }
      }
    }
    if (i === ROOMS.length - 1) { K.paint(TX.wall, TINT); K.box(-r.x - T, ylo, r.z0 - T, r.x + T, yhi, r.z0); }
  });
}
// the burial hall's walls: piers, three tiers of loculi, each holding its dead
function nicheWall(K, ctx, r, sx, lod) {
  const xi = sx * r.x, xb = sx * (r.x + 0.5), xo = sx * (r.x + T + 0.1), X = (a, b) => [Math.min(a, b), Math.max(a, b)];
  const TIERS = [[0.5, 1.2], [1.65, 2.35], [2.8, 3.5]], ylo = -0.4, yhi = r.c + 0.5;
  const segs = []; let z = r.z1;
  for (let k = 0; k < 7; k++) { const a = -21 - 3 * k; segs.push([a, z, false]); segs.push([a - 2.1, a, true]); z = a - 2.1; }
  segs.push([r.z0, z, false]);
  for (const [z0, z1, niche] of segs) {
    K.paint(TX.wall, TINT);
    const [a, b] = X(xi, xo);
    if (!niche) { K.box(a, ylo, z0, b, yhi, z1); continue; }
    let y = ylo;
    for (const [t0, t1] of TIERS) { K.box(a, y, z0, b, t0, z1); y = t1; const [c, d] = X(xb, xo); K.box(c, t0, z0, d, t1, z1); }
    K.box(a, y, z0, b, yhi, z1);
    if (lod > 2) continue;
    for (const [t0] of TIERS) {
      const roll = ctx.random(), cx = sx * (r.x + 0.25), zc = (z0 + z1) / 2;
      if (roll < 0.35) { // a wrapped body
        K.paint(TX.linen, "oklch(0.9 0.03 80)", 1); K.bbox(cx - 0.17, t0, zc - 0.85, cx + 0.17, t0 + 0.24, zc + 0.75, 0.05);
        ctx.smooth(); K.rock(cx, t0 + 0.13, zc - 0.88, 0.14, 0.12, 0.14, 8, 5, 0.06); ctx.flat();
      } else if (roll < 0.6) K.at(() => K.skeleton(ctx.random() > 0.6), cx, t0 + 0.005, zc + 0.1, ctx.random() > 0.5 ? 0 : 180);
      else if (roll < 0.85) { urn(K, ctx, cx, t0, zc - 0.5, 0.55); urn(K, ctx, cx, t0, zc + 0.35, 0.5, ctx.random() > 0.5, ctx.random() * 360); }
      else sandPile(K, ctx, cx, t0, zc, 0.22, 0.2, 0.7);
    }
    // a painted funerary panel over the lowest tier
    K.paint(null, ctx.random() > 0.5 ? LAPIS : OCHRE, 0.95); const [p, q] = X(xi, sx * (r.x - 0.01)); K.box(p, 1.25, z0 + 0.15, q, 1.6, z1 - 0.15);
  }
  if (lod <= 2) { K.paint(null, LAPIS, 0.95); const [p, q] = X(xi, sx * (r.x - 0.012)); K.box(p, 3.75, r.z0, q, 4.05, r.z1); K.paint(null, OCHRE, 0.95); K.box(p, 4.12, r.z0, q, 4.2, r.z1); }
}
function dress(K, ctx, col) {
  const lod = col ? 4 : ctx.lod;
  // ---- the exit gate's frame on the entry wall (glass at z = -0.6, width 2.4, height 3)
  K.paint(TX.block, TINT);
  for (const sx of [-1, 1]) K.bbox(Math.min(sx * 1.2, sx * 1.85), 0, -1.0, Math.max(sx * 1.2, sx * 1.85), 3.0, 0, 0.04);
  K.bbox(-2.05, 3.0, -1.05, 2.05, 3.65, 0, 0.04);
  if (!col) { archInfill(K, 2.4, 3, -0.98, -0.8); K.paint(null, "#120c08", 1); K.box(-1.2, 0, -0.35, 1.2, 3, -0.3); sunDisc(K, ctx, 0, 3.32, -1.05, 0.26, 1.7); }
  if (on("antechamber")) {
  // ---- antechamber: six papyrus columns, offering table, urns, cobwebs
  for (const z of [-9.5, -13, -16.5]) for (const sx of [-1, 1]) pillar(K, ctx, col, sx * 3.8, z, 0, 6, 0.45);
  K.paint(TX.block, TINT); K.bbox(-0.9, 0, -14.2, 0.9, 0.85, -11.8, 0.04);
  if (!col) {
    K.paint(TX.gold, "oklch(0.92 0.07 80)", 0.4, 0.6); ctx.smooth(); K.seg([-0.4, 0.85, -13.4], [-0.4, 0.88, -13.4], 0.22, 0.22, 12, true); K.seg([0.3, 0.85, -12.6], [0.3, 1.05, -12.6], 0.06, 0.09, 8, true); ctx.flat();
    if (lod <= 3) {
      for (const [x, z, s, t] of [[-6.6, -7, 0.9, 0], [-6.7, -8.2, 0.7, 0], [6.6, -7.2, 0.8, 0], [6.4, -18.8, 0.9, 1], [-6.5, -19, 1, 0], [-5.8, -18.6, 0.6, 1], [2.1, -19.2, 0.6, 0]]) urn(K, ctx, x, 0, z, s, !!t, ctx.random() * 360);
      for (const [x, y, z, ux, uz] of [[-7.5, 6, -6, 1, -1], [7.5, 6, -6, -1, -1], [-7.5, 6, -20, 1, 1], [7.5, 6, -20, -1, 1]]) { K.web([x, y, z], [ux, 0, 0], [0, 0, uz], 1.5); K.web([x, y, z], [0, -1, 0], [0, 0, uz], 1.2); }
      for (const z of [-9.5, -16.5]) K.web([-3.35, 5.7, z], [1, 0, 0], [0, -0.6, 0.6], 0.8);
      sandPile(K, ctx, 7.0, 0, -15, 0.8, 0.5, 1.4); sandPile(K, ctx, -2.6, 0, -5.5, 0.6, 0.25, 0.5);
      K.at(() => K.skeleton(false), 4.8, 0.01, -10.6, 130);
    }
  }
  }
  if (on("burial")) {
  // ---- burial hall: webs and a fallen urn on the floor
  if (!col && lod <= 3) {
    for (const [x, z, uz] of [[-2.5, -20.35, -1], [2.5, -20.35, -1], [-2.5, -43.65, 1], [2.5, -43.65, 1]]) K.web([x, 4.6, z], [-Math.sign(x), 0, 0], [0, 0, uz], 1.0);
    urn(K, ctx, 1.6, 0, -33, 0.6, true, 40); sandPile(K, ctx, 1.4, 0, -31.5, 0.7, 0.35, 0.8);
    K.at(() => K.skeleton(true), -1.5, 0.01, -38.5, 200);
  }
  }
  if (on("slope")) {
  // ---- the sand slope: drifts against the walls and a dune at its foot
  if (!col && lod <= 3) {
    for (const [z, sx, w] of [[-46, -1, 0.8], [-50, 1, 1.0], [-53, -1, 0.9], [-48.5, -1, 0.6]]) { const fy = ((z + 56) / 12) * 4 - 4; sandPile(K, ctx, sx * 2.5, fy, z, w, 0.45, 1.6); }
    sandPile(K, ctx, -1.2, -1.6, -48.5, 0.6, 0.3, 0.6);
    K.paint(null, "#1a120b", 1); K.box(-1.6, 4.0, -48.9, -0.8, 4.02, -48.2);
  }
  // treasury dune where the slope empties (walked over: a low ramp in the collider too)
  K.paint(TX.sand, "oklch(0.92 0.06 55)", 1);
  if (col) K.at(() => K.box(-2.5, -0.3, -1.6, 2.5, 0, 0), 0, -4, -56.2, 0, -6); else sandPile(K, ctx, 0, -4, -57.4, 2.6, 0.35, 1.8);
  }
  if (on("treasury")) {
  // ---- treasury: sarcophagi, fallen urns, spilled gold
  sarcophagus(K, ctx, col, -5.9, -4, -66, 0, false); sarcophagus(K, ctx, col, 5.9, -4, -61, 0, true);
  if (!col) {
    for (let k = 0; k < 16; k++) { const x = (ctx.random() > 0.5 ? 1 : -1) * (2.6 + ctx.random() * 3.8), z = -57.5 - ctx.random() * 11.5; urn(K, ctx, x, -4, z, 0.5 + ctx.random() * 0.5, ctx.random() > 0.45, ctx.random() * 360); }
    K.paint(TX.gold, "oklch(0.92 0.08 85)", 0.35, 0.75);
    for (const [x, z, r] of [[4.4, -67.5, 0.7], [-3.2, -62.5, 0.5], [3.4, -58.5, 0.4], [-4.6, -68.6, 0.55]]) { K.rock(x, -4.05, z, r, r * 0.3, r * 0.8, 9, 4, 0.2); for (let k = 0; k < 10; k++) K.cyl(x + (ctx.random() - 0.5) * r * 2.4, -4, z + (ctx.random() - 0.5) * r * 2.4, 0.035, 0.035, 0.008, 7); }
    if (lod <= 3) {
      sandPile(K, ctx, 5.4, -4, -66.3, 1.0, 0.45, 0.9); K.paint(null, "#1a120b", 1); K.box(5.0, 2.98, -66.8, 5.6, 3.0, -65.9);
      for (const [x, z, ux, uz] of [[-7, -56, 1, -1], [7, -56, -1, -1], [-7, -70, 1, 1], [7, -70, -1, 1]]) K.web([x, 3, z], [ux, 0, 0], [0, -0.5, uz * 0.5], 1.3);
      K.at(() => K.skeleton(false), 1.8, -3.99, -64.5, 60);
    }
  }
  }
  if (on("boss")) {
  // ---- boss chamber: four great columns, the dais, the king's sarcophagus and his seated colossus
  for (const z of [-79.5, -86]) for (const sx of [-1, 1]) pillar(K, ctx, col, sx * 6.5, z, -4, 9, 0.75);
  K.paint(TX.block, TINT);
  K.bbox(-7.5, -4, -96, 7.5, -3.82, -88.04, 0.03); K.bbox(-7.2, -4, -96, 7.2, -3.64, -88.32, 0.03); K.bbox(-6.9, -4, -96, 6.9, -3.46, -88.6, 0.03);
  sarcophagus(K, ctx, col, 0, -3.46, -90.6, 90, true, 1.15);
  K.at(() => king(K, ctx, col, 1.55), 0, -3.46, -93.65, 180);
  if (!col) {
    sunDisc(K, ctx, 0, 2.6, -95.95 + 0.0, 0.7, 4.2);
    for (const [x, z, ux, uz] of [[-10, -75, 1, -1], [10, -75, -1, -1], [-10, -96, 1, 1], [10, -96, -1, 1]]) K.web([x, 5, z], [ux, 0, 0], [0, -0.6, uz * 0.6], 2.0);
    for (const [x, z] of [[-8.5, -77], [8.6, -94.5], [-8.8, -94.8], [8.2, -78]]) urn(K, ctx, x, -4, z, 0.9, ctx.random() > 0.6, ctx.random() * 360);
    sandPile(K, ctx, -8.6, -4, -81, 1.1, 0.55, 1.4);
    if (lod <= 3) for (const [x, z] of [[-3.5, -81], [3, -84.5], [-1.5, -87]]) K.at(() => K.skeleton(ctx.random() > 0.5), x, -3.99, z, ctx.random() * 360);
    // rotted banners either side of the colossus
    for (const x of [-4.2, 4.2]) { K.paint(null, "oklch(0.42 0.09 255)", 1); K.box(x - 0.6, -0.5, -95.98, x + 0.6, 3.6, -95.93); K.tri([x - 0.6, -0.5, -95.93], [x + 0.6, -0.5, -95.93], [x, -1.1, -95.93], [x, 0.5, -96.5]); K.paint(TX.gold, "oklch(0.9 0.07 80)", 0.4, 0.6); K.seg([x - 0.75, 3.65, -95.9], [x + 0.75, 3.65, -95.9], 0.04, 0.04, 6, true); }
  }
  }
  for (const [x, y, z, nx, nz] of TORCHES) if (!col) torch(K, ctx, x, y, z, nx, nz);
  for (const [x, y, z] of BRAZIERS) brazier(K, ctx, col, x, y, z);
}
function build(ctx, col) { P = ctx.params ?? {}; const K = kit(ctx, col); shell(K, ctx, col); if (on("dress")) dress(K, ctx, col); }
export function geometry(ctx) { build(ctx, false); }
export function collider(ctx) { build(ctx, true); }
