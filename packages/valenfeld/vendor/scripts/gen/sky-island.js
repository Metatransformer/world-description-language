// A sky island of the Aelari (high elves): an inverted mountain of layered, tilted rock strata tapering
// to a jagged point, roots and vines hanging off its ledges, a grassy crown with white-marble spires
// capped in gold, a few lit windows and a stream that pours off one edge.
// params { seed, size, part }: size = metres across; part "fall" draws only the waterfall ribbon
// (its own child row). Textured rock strata, grass, marble; emissive lit windows.
// Unreachable by design: no collider.
import { rng } from "../lib/geo.js";

const TAU = Math.PI * 2;
// ---- deterministic noise (own seed, so every machine and every level shares the outline) ----
function hash3(i, j, k, s) { let h = (i * 374761393 + j * 668265263 + k * 2147483647 + s * 1274126177) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function vnoise(x, y, z, s) {
  const i = Math.floor(x), j = Math.floor(y), k = Math.floor(z), fx = x - i, fy = y - j, fz = z - k;
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy), w = fz * fz * (3 - 2 * fz); let r = 0;
  for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) for (let c = 0; c < 2; c++)
    r += hash3(i + a, j + b, k + c, s) * (a ? u : 1 - u) * (b ? v : 1 - v) * (c ? w : 1 - w);
  return r * 2 - 1; }
const fbm = (x, y, z, s) => vnoise(x, y, z, s) * 0.6 + vnoise(x * 2.1, y * 2.1, z * 2.1, s + 7) * 0.3 + vnoise(x * 4.3, y * 4.3, z * 4.3, s + 13) * 0.1;

// ---- the island's shape, shared by geometry and the fall ----
export function shape(seed, size) {
  const R = rng(seed + 0.5), S = Math.floor(seed * 7919) % 100000;
  const Rad = size / 2, depth = Rad * (1.25 + R() * 0.45), layers = 6 + Math.floor(R() * 3);
  const ph = [R() * TAU, R() * TAU, R() * TAU], am = [0.09 + R() * 0.06, 0.05 + R() * 0.04, 0.03];
  const rim = (t) => Rad * (0.86 + am[0] * Math.sin(t * 2 + ph[0]) + am[1] * Math.sin(t * 3 + ph[1]) + am[2] * Math.sin(t * 5 + ph[2]));
  const tilt = Rad * (0.04 + R() * 0.05), tiltDir = R() * TAU;
  const fallAng = R() * TAU, tip = [(R() - 0.5) * Rad * 0.25, (R() - 0.5) * Rad * 0.25];
  const crown = (r01, t) => Rad * 0.07 * (1 - r01 * r01) + Rad * 0.018 * fbm(Math.cos(t) * r01 * 3, 0, Math.sin(t) * r01 * 3, S + 3);
  const fallLen = Math.min(260, Math.max(60, depth * 0.85)), fallW = Math.min(14, Math.max(4, size * 0.035));
  return { R, S, Rad, depth, layers, rim, tilt, tiltDir, fallAng, tip, crown, fallLen, fallW };
}
// the fall's foot in island-local metres: where the mist rides
export function fallFoot(seed, size) { const s = shape(seed, size), r = s.rim(s.fallAng) + 6 + s.fallLen * 0.2;
  return { x: Math.cos(s.fallAng) * r, y: -s.fallLen, z: Math.sin(s.fallAng) * r, w: s.fallW }; }

function lathe(c, cx, y0, cz, prof, n) { // prof: [r, h] bottom → top, outward faces
  const P = (i, k) => { const a = (k % n) / n * TAU; return [cx + prof[i][0] * Math.cos(a), y0 + prof[i][1], cz + prof[i][0] * Math.sin(a)]; };
  for (let i = 0; i < prof.length - 1; i++) for (let k = 0; k < n; k++) c.quad(...P(i, k + 1), ...P(i, k), ...P(i + 1, k), ...P(i + 1, k + 1)); }
function box(c, cx, cy, cz, w, h, d, yaw) { // a box turned by yaw (radians) about y
  const co = Math.cos(yaw), si = Math.sin(yaw);
  const T = (x, y, z) => [cx + x * co + z * si, cy + y, cz - x * si + z * co];
  const a = w / 2, b = h / 2, e = d / 2, p = [T(-a, -b, -e), T(a, -b, -e), T(a, -b, e), T(-a, -b, e), T(-a, b, -e), T(a, b, -e), T(a, b, e), T(-a, b, e)];
  const q = (i, j, k, l) => c.quad(...p[i], ...p[j], ...p[k], ...p[l]);
  q(2, 1, 5, 6); q(0, 3, 7, 4); q(3, 2, 6, 7); q(1, 0, 4, 5); q(7, 6, 5, 4); q(0, 1, 2, 3); }
function tube(c, pts, r0, r1, n) { // a tapering tube through a polyline
  const L = pts.length;
  const rings = pts.map((p, i) => { const q = pts[Math.min(L - 1, i + 1)], o = pts[Math.max(0, i - 1)];
    let d = [q[0] - o[0], q[1] - o[1], q[2] - o[2]]; const l = Math.hypot(...d) || 1; d = d.map((v) => v / l);
    const up = Math.abs(d[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0];
    let X = [up[1] * d[2] - up[2] * d[1], up[2] * d[0] - up[0] * d[2], up[0] * d[1] - up[1] * d[0]]; const xl = Math.hypot(...X) || 1; X = X.map((v) => v / xl);
    const Y = [d[1] * X[2] - d[2] * X[1], d[2] * X[0] - d[0] * X[2], d[0] * X[1] - d[1] * X[0]], r = r0 + (r1 - r0) * i / (L - 1);
    const ring = []; for (let k = 0; k < n; k++) { const a = k / n * TAU, co = Math.cos(a) * r, si = Math.sin(a) * r; ring.push([p[0] + X[0] * co + Y[0] * si, p[1] + X[1] * co + Y[1] * si, p[2] + X[2] * co + Y[2] * si]); }
    return ring; });
  for (let i = 0; i < L - 1; i++) for (let k = 0; k < n; k++) { const k1 = (k + 1) % n; c.quad(...rings[i][k], ...rings[i][k1], ...rings[i + 1][k1], ...rings[i + 1][k]); } }

// tints over textures stay at L 0.9+ (the picture carries the darkness)
// the underside is the silhouette against a bright sky: darker strata so it survives 1-2 km of haze
const ROCK = ["oklch(0.62 0.02 70)", "oklch(0.55 0.025 55)", "oklch(0.60 0.02 95)", "oklch(0.52 0.02 250)", "oklch(0.58 0.03 45)"];
const LICHEN = "oklch(0.95 0.06 115)", SOIL = "oklch(0.60 0.03 58)", GRASS = "oklch(0.97 0.03 132)", GRASS2 = "oklch(0.92 0.05 140)";
const MARBLE = "oklch(0.99 0.008 85)", MARBLE2 = "oklch(0.95 0.012 80)", GOLD = "oklch(0.80 0.14 85)", WIN = "oklch(0.92 0.12 80)", DARKWIN = "oklch(0.22 0.02 250)";
const VINE = "oklch(0.45 0.09 138)", ROOT = "oklch(0.38 0.04 55)", WATER = "oklch(0.78 0.06 220)";
const TEX = { 0: "cdn/texture-lichen-fieldstone-cliff.png", 1: "cdn/texture-mossy-meadow-grass.png", 2: "cdn/texture-white-marble.png", 7: "cdn/texture-dark-forest-soil.png" };
// 0 rock, 1 grass, 2 marble, 3 gold, 4 lit window, 5 water, 6 vine/root, 7 soil
function mat(c, m, col) {
  c.albedo(TEX[m] ?? null); c.color(col);
  if (m === 4) c.emissive(3.2, 2.2, 1.1); else if (m === 3) c.emissive(0.18, 0.12, 0.03); else if (m === 5) c.emissive(0.12, 0.18, 0.24); else c.emissive(null);
}

export function geometry(ctx) {
  const p = ctx.params || {}, seed = Number(p.seed ?? 1), size = Number(p.size ?? 200), lod = ctx.lod || 1;
  const s = shape(seed, size);
  if (p.part === "fall") return fall(ctx, s);
  const { Rad, depth, layers, rim, tilt, tiltDir, crown, S } = s, R = rng(seed + 0.25);
  const n = [0, 72, 52, 36, 22, 12][lod], sub = lod <= 2 ? 3 : lod <= 3 ? 2 : 1;
  // ---- the underside: strata from the tip up to the rim ----
  const ang = Array.from({ length: n }, (_, k) => k / n * TAU);
  const rb = ang.map(rim);
  const prof = []; // { y01 (0 rim → 1 tip), f radius fraction, layer }
  const cut = [0]; for (let j = 1; j < layers; j++) cut.push(Math.pow(j / layers, 1.15) + (R() - 0.5) * 0.04); cut.push(1);
  const F = (t) => Math.pow(1 - t, 1.12);
  for (let j = 0; j < layers; j++) {
    const t0 = cut[j], t1 = cut[j + 1], step = j === 0 ? 1 : 0.9 - R() * 0.06, bulge = 1.04 + R() * 0.05;
    prof.push({ t: t0, f: F(t0) * step, j, lip: j > 0 });
    for (let q = 1; q <= sub; q++) { const u = q / (sub + 1), t = t0 + (t1 - t0) * u; prof.push({ t, f: F(t) * (step + (bulge - step) * Math.sin(u * Math.PI / 2)) * (1 + 0.03 * Math.sin(u * 9)), j }); }
    if (j < layers - 1) prof.push({ t: t1 - 0.004, f: F(t1) * bulge, j });
  }
  const tipY = -depth;
  const ringAt = (e) => ang.map((a, k) => {
    const y = -depth * e.t + (e.t < 0.98 ? tilt * Math.cos(a - tiltDir) * (e.t > 0 ? 1 : 0) : 0);
    const jag = 1 + 0.16 * fbm(Math.cos(a) * 3.1, e.t * 7 + e.j * 1.7, Math.sin(a) * 3.1, S) * Math.min(1, e.t * 6 + 0.25);
    const r = rb[k] * e.f * jag, cx = s.tip[0] * e.t * e.t, cz = s.tip[1] * e.t * e.t;
    return [cx + Math.cos(a) * r, y + (e.t > 0 ? 0.03 * depth * vnoise(a * 4, e.t * 11, 0, S + 5) : 0), cz + Math.sin(a) * r]; });
  const rings = [ang.map(() => [s.tip[0], tipY, s.tip[1]])]; const meta = [{ t: 1, j: layers - 1 }];
  for (let i = prof.length - 1; i >= 0; i--) { rings.push(ringAt(prof[i])); meta.push(prof[i]); }
  // rings[] runs tip → rim (bottom → top): outward faces
  ctx.flat();
  for (let i = 0; i < rings.length - 1; i++) {
    const m = meta[i + 1], band = ROCK[(m.j + (S % 5)) % ROCK.length];
    for (let k = 0; k < n; k++) {
      const k1 = (k + 1) % n, a = rings[i][k], b = rings[i][k1], cc = rings[i + 1][k1], d = rings[i + 1][k];
      const lich = vnoise(a[0] * 0.05, a[1] * 0.05, a[2] * 0.05, S + 9) > 0.35;
      if (i === rings.length - 2) mat(ctx, 7, SOIL); else mat(ctx, 0, lich ? LICHEN : band);
      ctx.quad(...b, ...a, ...d, ...cc);
    }
  }
  // hanging jagged spikes under the lower strata
  const spikes = lod <= 3 ? 3 + Math.floor(R() * 4) : lod === 4 ? 2 : 0;
  for (let q = 0; q < spikes; q++) {
    const j = 2 + Math.floor(R() * (layers - 3)), t = cut[j], a = R() * TAU, r = rim(a) * F(t) * (0.45 + R() * 0.3);
    const top = [Math.cos(a) * r, -depth * t + tilt * Math.cos(a - tiltDir), Math.sin(a) * r], len = depth * (0.18 + R() * 0.3), w = rim(a) * F(t) * (0.16 + R() * 0.1);
    const pr = []; const m = 6; for (let i = 0; i <= m; i++) { const u = i / m; pr.push([w * Math.pow(1 - u, 1.3) * (1 + 0.25 * (R() - 0.5)), -len * u]); }
    pr.reverse(); const pp = pr.map(([rr, hh]) => [rr, hh + len]);
    mat(ctx, 0, ROCK[(j + 3) % 5]); lathe(ctx, top[0], top[1] - len + w * 0.5, top[2], pp, lod <= 2 ? 7 : 5);
  }
  // ---- the crown: a soil lip, then grass rolling inward to a low rise ----
  const top = rings[rings.length - 1];
  const cr = lod <= 2 ? [1.025, 0.97, 0.88, 0.74, 0.58, 0.4, 0.22, 0.08] : lod <= 4 ? [1.02, 0.85, 0.55, 0.2] : [1.0, 0.3];
  const crowns = [top];
  cr.forEach((f, i) => crowns.push(ang.map((a, k) => { const y = (i === 0 ? 1.4 : 0.6) + crown(Math.min(1, f), a); return [Math.cos(a) * rb[k] * f, y, Math.sin(a) * rb[k] * f]; })));
  crowns.push(ang.map(() => [0, crown(0, 0) + 0.6, 0]));
  ctx.smooth();
  for (let i = 0; i < crowns.length - 1; i++) for (let k = 0; k < n; k++) {
    const k1 = (k + 1) % n, a = crowns[i][k];
    mat(ctx, i === 0 ? 7 : 1, i === 0 ? SOIL : vnoise(a[0] * 0.03, 0, a[2] * 0.03, S + 2) > 0.1 ? GRASS2 : GRASS);
    ctx.quad(...crowns[i][k1], ...crowns[i][k], ...crowns[i + 1][k], ...crowns[i + 1][k1]);
  }
  ctx.flat();
  const groundAt = (x, z) => { const r = Math.hypot(x, z), a = Math.atan2(z, x); return 0.6 + crown(Math.min(1, r / rim(a)), a); };
  // ---- the stream from a spring to the fall's lip ----
  {
    const fa = s.fallAng, rr = rim(fa), w = s.fallW * 0.8, seg = lod <= 2 ? 12 : 4; const pts = [];
    for (let i = 0; i <= seg; i++) { const u = i / seg, r = rr * (0.25 + 0.77 * u), a = fa + 0.25 * Math.sin(u * 5 + seed) * (1 - u);
      const x = Math.cos(a) * r, z = Math.sin(a) * r; pts.push([x, groundAt(x, z) + 0.25, z]); }
    mat(ctx, 5, WATER);
    for (let i = 0; i < seg; i++) { const a = pts[i], b = pts[i + 1], dx = b[0] - a[0], dz = b[2] - a[2], l = Math.hypot(dx, dz) || 1, nx = -dz / l * w / 2, nz = dx / l * w / 2;
      ctx.quad(a[0] - nx, a[1], a[2] - nz, a[0] + nx, a[1], a[2] + nz, b[0] + nx, b[1], b[2] + nz, b[0] - nx, b[1], b[2] - nz); }
  }
  // ---- roots and vines off the upper ledges ----
  if (lod <= 3) {
    const nr = Math.round((8 + size / 14) * (lod === 1 ? 1 : lod === 2 ? 0.6 : 0.3));
    for (let q = 0; q < nr; q++) {
      const vine = R() < 0.55, ri = rings.length - 2 - Math.floor(R() * Math.min(rings.length - 3, 3 * (sub + 2))), k = Math.floor(R() * n);
      const a0 = rings[ri][k], out = [Math.cos(ang[k]), 0, Math.sin(ang[k])], len = (vine ? 18 + R() * 60 : 10 + R() * 34) * Math.min(1.6, size / 200 + 0.5);
      const pts = []; const m = lod <= 2 ? 6 : 3; const sway = (R() - 0.5) * 0.4;
      for (let i = 0; i <= m; i++) { const u = i / m, o = (vine ? 1.5 : 4) * Math.sin(u * Math.PI) + (vine ? 0 : u * 3);
        pts.push([a0[0] - out[0] * 1.5 + out[0] * o + sway * u * len * 0.2, a0[1] + 1 - len * u, a0[2] - out[2] * 1.5 + out[2] * o]); }
      mat(ctx, 6, vine ? VINE : ROOT);
      tube(ctx, pts, vine ? 0.35 + R() * 0.3 : 0.8 + R() * 0.9, vine ? 0.15 : 0.12, lod <= 2 ? 4 : 3);
    }
  }
  // ---- the Aelari spires ----
  const hmax = 20 + 40 * Math.min(1, Math.max(0, (size - 80) / 300));
  const count = Math.max(2, Math.min(8, Math.round(1.5 + size / 60))), placed = [];
  for (let q = 0; q < count * 4 && placed.length < count; q++) {
    const a = R() * TAU, r = placed.length === 0 ? R() * Rad * 0.15 : Rad * (0.18 + R() * 0.45), x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (Math.abs(((a - s.fallAng + Math.PI * 3) % TAU) - Math.PI) < 0.3) continue;
    if (placed.some((o) => Math.hypot(o[0] - x, o[1] - z) < 14 + size * 0.05)) continue;
    placed.push([x, z, placed.length === 0 ? hmax : hmax * (0.45 + R() * 0.45)]);
  }
  const ns = lod <= 1 ? 12 : lod <= 2 ? 10 : lod <= 3 ? 8 : 6;
  for (const [x, z, H] of placed) {
    const g = groundAt(x, z) - 0.8, rs = Math.max(1.3, H * 0.055);
    spire(ctx, x, g, z, H, rs, ns, lod, R);
    if (H > 34 && lod <= 3) { const a = R() * TAU, h2 = H * (0.4 + R() * 0.15); spire(ctx, x + Math.cos(a) * rs * 2.2, g, z + Math.sin(a) * rs * 2.2, h2, rs * 0.6, Math.max(6, ns - 2), lod, R); }
  }
  // a rotunda on the great islands
  if (size >= 220 && lod <= 3) {
    let a = s.fallAng + Math.PI * (0.6 + R() * 0.8), x = Math.cos(a) * Rad * 0.35, z = Math.sin(a) * Rad * 0.35; const g = groundAt(x, z) - 0.6;
    const rr = 9 + size * 0.02, h = 10 + size * 0.015, cols = lod <= 2 ? 12 : 8;
    mat(ctx, 2, MARBLE2); lathe(ctx, x, g, z, [[rr + 2.5, 0], [rr + 2.5, 1.2], [rr + 1.2, 1.2], [rr + 1.2, 2.2], [0, 2.2]], ns * 2);
    mat(ctx, 2, MARBLE);
    for (let i = 0; i < cols; i++) { const b = i / cols * TAU; lathe(ctx, x + Math.cos(b) * rr, g + 2.2, z + Math.sin(b) * rr, [[0.9, 0], [0.75, 0.4], [0.7, h - 0.6], [0.95, h - 0.2], [0.95, h], [0, h]], lod <= 2 ? 8 : 6); }
    lathe(ctx, x, g + 2.2 + h, z, [[0, -0.01], [rr + 1.4, 0], [rr + 1.4, 1.6], [rr + 0.6, 2.2], [0, 2.2]], ns * 2);
    const dome = []; for (let i = 0; i <= 6; i++) { const u = i / 6 * Math.PI / 2; dome.push([(rr + 0.4) * Math.cos(u), 2.2 + (rr * 0.8) * Math.sin(u)]); } dome.push([0, 2.2 + rr * 0.8]);
    mat(ctx, 3, GOLD); lathe(ctx, x, g + 2.2 + h, z, dome, ns * 2);
    lathe(ctx, x, g + 4.4 + h + rr * 0.8 - 0.3, z, [[0.6, 0], [0.4, 1.5], [0.05, 6], [0, 6]], 6);
  }
  // pale silver trees on the crown
  if (lod <= 2) {
    const nt = Math.round(size / 18);
    for (let q = 0; q < nt; q++) { const a = R() * TAU, r = Rad * (0.2 + R() * 0.62), x = Math.cos(a) * r, z = Math.sin(a) * r;
      if (placed.some((o) => Math.hypot(o[0] - x, o[1] - z) < 8)) continue;
      const g = groundAt(x, z) - 0.3, h = 7 + R() * 9, w = h * (0.28 + R() * 0.1);
      mat(ctx, 2, "oklch(0.86 0.01 90)"); lathe(ctx, x, g, z, [[0.45, 0], [0.3, h * 0.5], [0, h * 0.55]], 5);
      mat(ctx, 1, R() < 0.5 ? "oklch(0.62 0.08 135)" : "oklch(0.70 0.06 120)");
      lathe(ctx, x, g + h * 0.32, z, [[0, 0], [w * 0.7, h * 0.08], [w, h * 0.3], [w * 0.75, h * 0.55], [w * 0.3, h * 0.68], [0, h * 0.7]], 7);
    }
  }
  ctx.albedo(null); ctx.emissive(null);
  return { bounds: { min: [-Rad * 1.2, -depth - 20, -Rad * 1.2], max: [Rad * 1.2, hmax + 20, Rad * 1.2] } };
}

function spire(c, x, g, z, H, rs, n, lod, R) {
  const pr = [[rs * 2.1, 0], [rs * 2.1, 1.6], [rs * 1.6, 2.2], [rs * 1.25, 2.4], [rs * 1.15, H * 0.12]];
  if (lod <= 2) pr.push([rs * 1.32, H * 0.12], [rs * 1.32, H * 0.13], [rs * 1.08, H * 0.135]);
  pr.push([rs * 1.0, H * 0.36]);
  if (lod <= 2) pr.push([rs * 1.18, H * 0.36], [rs * 1.18, H * 0.375], [rs * 0.96, H * 0.38]);
  pr.push([rs * 0.86, H * 0.62]);
  if (lod <= 3) pr.push([rs * 1.55, H * 0.63], [rs * 1.6, H * 0.655], [rs * 0.9, H * 0.665]);
  pr.push([rs * 0.84, H * 0.72], [rs * 1.12, H * 0.73], [rs * 1.12, H * 0.745]);
  mat(c, 2, MARBLE); lathe(c, x, g, z, pr, n);
  // the gold cap: a long needle with a flared skirt and a finial
  mat(c, 3, GOLD);
  lathe(c, x, g, z, [[rs * 1.12, H * 0.745], [rs * 1.25, H * 0.755], [rs * 0.9, H * 0.79], [rs * 0.55, H * 0.87], [rs * 0.22, H * 0.95], [0.12, H * 0.99], [0.25, H * 0.995], [0.04, H * 1.06], [0, H * 1.065]], Math.max(5, n - 2));
  if (lod >= 4) return;
  // windows: tall slits round the shaft, a few lit
  const rows = lod <= 2 ? [0.24, 0.47, 0.69] : [0.47, 0.69], around = lod <= 2 ? 4 : 3, off = R() * TAU;
  for (const hf of rows) for (let i = 0; i < around; i++) {
    const a = off + i / around * TAU + hf * 2, rr = (hf < 0.36 ? rs * 1.08 : hf < 0.62 ? rs * 0.92 : rs * 0.87) + 0.06, lit = R() < 0.4;
    mat(c, lit ? 4 : 6, lit ? WIN : DARKWIN);
    box(c, x + Math.cos(a) * rr, g + H * hf, z + Math.sin(a) * rr, Math.max(0.5, rs * 0.35), Math.max(1.6, H * 0.05), 0.25, Math.PI / 2 - a);
  }
}

// the waterfall: a bowed ribbon off the rim, widening as it falls; uvs u across, v down (0 lip → 1 foot)
function fall(ctx, s) {
  const a = s.fallAng, rr = s.rim(a), out = [Math.cos(a), Math.sin(a)], side = [-Math.sin(a), Math.cos(a)];
  const rows = 18, cols = 6, uvs = [];
  ctx.albedo(null); ctx.color("oklch(0.95 0.03 215)", 0.62); ctx.emissive(0.25, 0.32, 0.4);
  const P = (v, u) => { const w = s.fallW * (1 + 1.6 * v), across = (u - 0.5) * w, bow = s.fallW * 0.25 * (1 - Math.pow(2 * u - 1, 2));
    const o = v === 0 ? -3 : 6 * Math.min(1, v * 8) + s.fallLen * 0.2 * Math.sqrt(v) + bow, r = rr + o, y = v === 0 ? 0.6 : 0.4 - s.fallLen * v;
    return [out[0] * r + side[0] * across, y, out[1] * r + side[1] * across]; };
  for (let i = 0; i < rows; i++) for (let k = 0; k < cols; k++) {
    const v0 = Math.pow(i / rows, 1.3), v1 = Math.pow((i + 1) / rows, 1.3), u0 = k / cols, u1 = (k + 1) / cols;
    ctx.quad(...P(v0, u0), ...P(v0, u1), ...P(v1, u1), ...P(v1, u0));
    uvs.push(u0, v0, u1, v0, u1, v1, u0, v0, u1, v1, u0, v1);
  }
  return { uvs };
}
