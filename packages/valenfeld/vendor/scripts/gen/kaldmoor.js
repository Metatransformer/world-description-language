import BK from "../lib/data/building-kit.json";   // textures and tints: scripts/lib/data/building-kit.yml
// ---- Valenfeld building kit (shared verbatim by scripts/gen/*): textures, boxes, lathes, roofs ----
const { fieldstone: FS, oak: OAK, plaster: PL, slate: SL, iron: IR, flagstone: FLAG, hay: HAY } = BK.textures;
const { stone: STONE, wood: WOOD, white: WHITE, iron: IRONC } = BK.tints;
const BX = BXR;
function MERL(c, x0, z0, x1, z1, y, th, h = 0.9, w = 0.9, gap = 0.9) {
  for (let x = x0; x + w <= x1 + 1e-6; x += w + gap) { BX(c, x, y, z0, x + w, y + h, z0 + th); BX(c, x, y, z1 - th, x + w, y + h, z1); }
  for (let z = z0 + th + gap; z + w <= z1 - th + 1e-6; z += w + gap) { BX(c, x0, y, z, x0 + th, y + h, z + w); BX(c, x1 - th, y, z, x1, y + h, z + w); } }
// ---- end kit ----
// KALDMOOR, the stone hold in the Hrothspine pass: one script, params.kind picks the piece:
// wall (curtain wall + gatehouse + town paving/snow; origin = town centre) | keep | house | tower (Mages Guild)
// | coach (sledge-coach) | brazier | woodpile | well. Every piece faces -z (its door), snow on every roof,
// drifts against every wall, icicles on every eave. lod 4–5 drop to the big forms.
import { G, TEX, sub, cross, dot } from "../lib/geo.js";
import { BXR, CB, CY, HX, LA, RB, ROOF, flatc, glow, paint } from "../lib/buildkit.js";   // the shared building toolkit
const DFS = "cdn/texture-dark-fieldstone-wall-lichen.png", SNOW = "cdn/texture-snow-packed-fresh.png", TURF = "cdn/texture-turf-sod-roof.png", GREY = "cdn/texture-grey-ashlar-stone-wall.png";
const DST = "oklch(0.9 0.01 80)", DST2 = "oklch(0.8 0.012 70)", SNOWC = "oklch(0.8 0.018 245)" /* matches settlement.js / longhall.js snow, critic r8 Nov 4 */, GST = "oklch(0.95 0.006 250)";
const WARM = [0.5, 0.3, 0.1];
const hh = (a, b = 0, s = 0) => { const v = Math.sin(a * 127.1 + b * 311.7 + s * 74.7) * 43758.5453; return v - Math.floor(v); };
function BX2(c, x0, y0, z0, x1, y1, z1) { BX(c, Math.min(x0, x1), Math.min(y0, y1), Math.min(z0, z1), Math.max(x0, x1), Math.max(y0, y1), Math.max(z0, z1)); }
function OT(c, a, b, d, ref) { const n = cross(sub(b, a), sub(d, a)); const m = [(a[0] + b[0] + d[0]) / 3 - ref[0], (a[1] + b[1] + d[1]) / 3 - ref[1], (a[2] + b[2] + d[2]) / 3 - ref[2]];
  if (dot(n, m) < 0) c.tri(...a, ...d, ...b); else c.tri(...a, ...b, ...d); }
const yawOf = (tx, tz) => Math.atan2(-tz, tx) * 180 / Math.PI; // RB yaw whose local +x runs along (tx, tz)
// a snow drift: a noisy half-ellipsoid, long axis at angle ang (radians, in x→z)
function DRIFT(c, cx, cy, cz, ang, rx, rz, h, D, s = 0) {
  if (D > 3) return;
  const nA = D <= 1 ? 12 : D <= 2 ? 9 : 6, nB = D <= 2 ? 3 : 2, ca = Math.cos(ang), sa = Math.sin(ang);
  const P = (i, j) => { i %= nA; const a = i / nA * 6.2832, b = j / nB * 1.5708, k = j === nB ? 1 : 1 + 0.24 * (hh(i, j, s + cx * 0.37 + cz * 0.11) - 0.5);
    const x = rx * Math.cos(a) * Math.cos(b) * k, z = rz * Math.sin(a) * Math.cos(b) * k, y = j === 0 ? -0.1 : h * Math.sin(b);
    return [cx + x * ca - z * sa, cy + y, cz + x * sa + z * ca]; };
  const ref = [cx, cy - h * 2 - 0.3, cz];
  paint(c, SNOW, SNOWC); c.smooth();
  for (let j = 0; j < nB; j++) for (let i = 0; i < nA; i++) { const a = P(i, j), b = P(i + 1, j), d = P(i + 1, j + 1), e = P(i, j + 1); OT(c, a, b, d, ref); if (j < nB - 1) OT(c, a, d, e, ref); }
  c.flat();
}
// icicles hung along the line A→B
function ICE(c, A, B, n, s, maxL, D) {
  if (D > 2) return; flatc(c, "oklch(0.93 0.035 225)");
  for (let k = 0; k < n; k++) { if (hh(k, 1, s) > 0.72) continue;
    const t = (k + 0.2 + 0.6 * hh(k, 2, s)) / n, p = [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t];
    const L = 0.12 + maxL * Math.pow(hh(k, 3, s), 1.5), r = 0.03 + 0.035 * hh(k, 4, s);
    const q = [0, 1, 2].map((m) => { const a = m * 2.094 + k; return [p[0] + Math.cos(a) * r, p[1], p[2] + Math.sin(a) * r]; });
    const tip = [p[0], p[1] - L, p[2]], ref = [p[0], p[1] - L * 0.4, p[2]];
    for (let m = 0; m < 3; m++) OT(c, q[m], q[(m + 1) % 3], tip, ref); }
}
function ICERING(c, x, y, z, r, n, s, maxL, D) { if (D > 2) return; for (let i = 0; i < n; i++) { const a0 = i / n * 6.2832, a1 = (i + 1) / n * 6.2832;
  ICE(c, [x + Math.cos(a0) * r, y, z + Math.sin(a0) * r], [x + Math.cos(a1) * r, y, z + Math.sin(a1) * r], 2, s + i, maxL, D); } }
// snow lying on a ROOF slab (eaves ±EZ, eave ye, ridge yr, slab t), inset from the eave so the roof's edge shows
function SNOWROOF(c, x0, x1, EZ, ye, yr, t, inset, th, D) {
  const z = EZ - inset, yes = ye + t + (yr - ye) * (inset / EZ) - 0.02;
  paint(c, SNOW, SNOWC); ROOF(c, x0, x1, -z, z, yes, yr + t - 0.02, th);
  if (D <= 2) { for (const s of [-1, 1]) LA(c, x0, yes + th * 0.45, s * z, [[th * 0.55, 0], [th * 0.55, x1 - x0]], 8, true, "x");
    LA(c, x0, yr + t + th * 0.55, 0, [[th * 0.75, 0], [th * 0.75, x1 - x0]], 8, true, "x"); }
}
// a glowing window in a wall facing s (-1 = -z face), with stone sill and lintel
function WIN(c, x, y0, y1, zf, s, D, w = 0.3, em = WARM) {
  glow(c, "#2a2620", em); BX2(c, x - w, y0, zf - 0.03, x + w, y1, zf + 0.03);
  if (D <= 2) { paint(c, DFS, "oklch(0.97 0.01 80)"); BX2(c, x - w - 0.15, y0 - 0.16, zf, x + w + 0.15, y0, zf + 0.16 * s); BX2(c, x - w - 0.12, y1, zf, x + w + 0.12, y1 + 0.2, zf + 0.1 * s);
    paint(c, OAK, WOOD); BX2(c, x - 0.03, y0, zf, x + 0.03, y1, zf + 0.05 * s); BX2(c, x - w, (y0 + y1) / 2 - 0.03, zf, x + w, (y0 + y1) / 2 + 0.03, zf + 0.05 * s); }
}

// ---------------- the curtain wall: an octagon, flat sides on the axes, gate in the south (+z) side ----------------
const WA = 40, WR = WA / Math.cos(Math.PI / 8), WT = 2.2, WH = 6.5, GT0 = 9.07, GT1 = 24.07;
const WV = Array.from({ length: 8 }, (_, k) => { const a = Math.PI / 8 + k * Math.PI / 4; return [WR * Math.cos(a), WR * Math.sin(a), a]; });
function side(k) { const a = WV[k], b = WV[(k + 1) % 8], L = Math.hypot(b[0] - a[0], b[1] - a[1]), u = [(b[0] - a[0]) / L, (b[1] - a[1]) / L], v = [-u[1], u[0]];
  return { L, u, v, P: (t, s, y) => [a[0] + u[0] * t + v[0] * s, y, a[1] + u[1] * t + v[1] * s] }; } // v points inward
function OS(c, F, t0, t1, v0, v1, y0, y1) { const P = F.P; HX(c, [P(t0, v0, y0), P(t1, v0, y0), P(t1, v1, y0), P(t0, v1, y0), P(t0, v0, y1), P(t1, v0, y1), P(t1, v1, y1), P(t0, v1, y1)]); }
const spans = (k, L) => (k === 1 ? [[0, GT0 + 0.3], [GT1 - 0.3, L]] : [[0, L]]);
function ARCH(c, r, yc, ytop, z0, z1, N) { for (let i = 0; i < N; i++) { const a0 = Math.PI - i / N * Math.PI, a1 = Math.PI - (i + 1) / N * Math.PI;
  const x0 = r * Math.cos(a0), y0 = yc + r * Math.sin(a0), x1 = r * Math.cos(a1), y1 = yc + r * Math.sin(a1);
  HX(c, [[x0, y0, z0], [x1, y1, z0], [x1, y1, z1], [x0, y0, z1], [x0, ytop, z0], [x1, ytop, z0], [x1, ytop, z1], [x0, ytop, z1]]); } }

function wall(c, D) {
  for (let k = 0; k < 8; k++) { const F = side(k), ang = Math.atan2(F.u[1], F.u[0]);
    for (const [t0, t1] of spans(k, F.L)) {
      paint(c, DFS, DST); OS(c, F, t0, t1, -WT / 2, WT / 2, -0.6, WH);
      if (D > 3) continue;
      paint(c, DFS, DST2); OS(c, F, t0, t1, -WT / 2 - 0.35, WT / 2 + 0.3, -0.6, 0.8);
      for (let t = t0 + 0.7; t + 0.9 <= t1 - 0.4; t += 1.8) { paint(c, DFS, DST); OS(c, F, t, t + 0.9, -WT / 2, -WT / 2 + 0.55, WH, WH + 1.0);
        if (D <= 2) { paint(c, SNOW, SNOWC); OS(c, F, t - 0.03, t + 0.93, -WT / 2 - 0.04, -WT / 2 + 0.59, WH + 1.0, WH + 1.13); } }
      paint(c, SNOW, SNOWC); OS(c, F, t0, t1, -WT / 2 + 0.55, WT / 2 - (D <= 2 ? 0.35 : 0), WH, WH + 0.14);
      if (D <= 2) { paint(c, DFS, DST); OS(c, F, t0, t1, WT / 2 - 0.35, WT / 2, WH, WH + 0.5); paint(c, DFS, DST2); OS(c, F, t0, t1, -WT / 2 - 0.14, -WT / 2, WH - 0.75, WH - 0.5);
        ICE(c, F.P(t0, -WT / 2 - 0.14, WH - 0.75), F.P(t1, -WT / 2 - 0.14, WH - 0.75), Math.round((t1 - t0) * 1.2), k * 13 + t0, 0.45, D); }
      for (let t = t0 + 2.5; t < t1 - 2; t += 5 + 3 * hh(t, k)) { const r = hh(t, k, 2);
        let p = F.P(t, WT / 2 + 0.35, 0); DRIFT(c, p[0], 0, p[2], ang, 1.3 + 1.7 * r, 0.9 + 0.5 * r, 0.45 + 0.6 * r, D, k + t);
        p = F.P(t + 1.7, -WT / 2 - 0.5, 0); DRIFT(c, p[0], 0, p[2], ang, 1.6 + 1.8 * (1 - r), 1.0 + 0.5 * r, 0.55 + 0.7 * (1 - r), D, k + t + 5); }
    } }
  for (const [x, z, a] of WV) cornerTower(c, x, z, a, D);
  gatehouse(c, D);
  if (D <= 4) blanket(c, D);
  if (D <= 3) town(c, D);
}
function cornerTower(c, x, z, a, D) {
  const n = D <= 1 ? 16 : D <= 2 ? 12 : D <= 3 ? 10 : 6;
  paint(c, DFS, DST); LA(c, x, 0, z, D <= 3 ? [[3.5, -0.6], [3.25, 1.4], [3.0, 1.9], [3.0, 8.2], [3.4, 8.5], [3.4, 8.9]] : [[3.2, -0.6], [3.1, 8.9]], n, true);
  paint(c, SL, "oklch(0.9 0.01 220)"); LA(c, x, 0, z, [[3.8, 8.8], [0.04, 13.4]], n, true);
  if (D <= 4) { paint(c, SNOW, SNOWC); LA(c, x, 0, z, [[3.15, 10.05], [0.04, 13.56]], n, false); }
  if (D > 3) return;
  for (const da of [0, -0.75, 0.75]) { const b = a + da; flatc(c, "#141210"); RB(c, x + Math.cos(b) * 3.0, 4.8, z + Math.sin(b) * 3.0, 0.2, 1.3, 0.14, yawOf(-Math.sin(b), Math.cos(b))); }
  DRIFT(c, x + Math.cos(a + 0.6) * 3.4, 0, z + Math.sin(a + 0.6) * 3.4, a + 2.17, 1.8, 1.0, 0.8, D, x);
  DRIFT(c, x + Math.cos(a + 3.3) * 3.2, 0, z + Math.sin(a + 3.3) * 3.2, a + 1.7, 1.5, 0.9, 0.6, D, z);
  if (D <= 2) { paint(c, IR, IRONC); LA(c, x, 13.3, z, [[0.07, 0], [0.025, 1.1]], 6, true); LA(c, x, 13.8, z, [[0.0, -0.12], [0.11, 0], [0.0, 0.12]], 8, false);
    ICERING(c, x, 8.8, z, 3.8, 12, x * 3 + z, 0.6, D); }
}
function gatehouse(c, D) {
  for (const s of [-1, 1]) { const x0 = s < 0 ? -7.5 : 2.5, x1 = s < 0 ? -2.5 : 7.5, xm = (x0 + x1) / 2;
    paint(c, DFS, DST); BX(c, x0, -0.6, 37, x1, 10, 43.6);
    if (D > 3) continue;
    paint(c, DFS, DST2); BX(c, x0 - 0.3, -0.6, 36.7, x1 + 0.3, 1.0, 43.9);
    paint(c, DFS, DST); MERL(c, x0, 37, x1, 43.6, 10, 0.5, 1.0, 0.8, 0.8);
    paint(c, SNOW, SNOWC); BX(c, x0 + 0.5, 10, 37.5, x1 - 0.5, 10.16, 43.1);
    flatc(c, "#141210"); BX(c, xm - 0.11, 4.4, 43.58, xm + 0.11, 5.9, 43.66); BX(c, xm - 0.11, 7.3, 43.58, xm + 0.11, 8.5, 43.66);
    DRIFT(c, xm + s * 1.0, 0, 44.0, 0, 2.0, 1.0, 0.75, D, s * 7); DRIFT(c, xm + s * 1.4, 0, 36.6, 0, 1.6, 0.8, 0.5, D, s * 9);
    ICE(c, [x0, 9.95, 43.66], [x1, 9.95, 43.66], 8, s * 31, 0.5, D);
  }
  paint(c, DFS, DST); BX(c, -2.5, 6.0, 37.4, 2.5, 10, 43.2); ARCH(c, 2.5, 3.5, 6.0, 37.4, 43.2, D <= 2 ? 10 : 5);
  if (D > 3) return;
  BX(c, -2.5, 10, 42.7, 2.5, 10.8, 43.2); BX(c, -2.5, 10, 37.4, 2.5, 10.8, 37.9);
  paint(c, SNOW, SNOWC); BX(c, -2.5, 10, 37.9, 2.5, 10.13, 42.7);
  paint(c, FLAG, "oklch(0.86 0.01 80)"); BX(c, -2.5, -0.2, 37, 2.5, 0.05, 43.6);
  for (const s of [-1, 1]) { const Y = s > 0 ? 110 : 70, dx = Math.cos(Y * Math.PI / 180), dz = -Math.sin(Y * Math.PI / 180), cx = s * 2.4 + dx * 1.25, cz = 37.25 + dz * 1.25;
    paint(c, OAK, "oklch(0.8 0.03 55)"); RB(c, cx, 2.55, cz, 2.5, 5.0, 0.16, Y);
    if (D <= 2) { paint(c, IR, IRONC); for (const y of [0.7, 2.5, 4.3]) RB(c, cx, y, cz, 2.52, 0.12, 0.22, Y); } }
  if (D <= 2) { paint(c, DFS, "oklch(0.97 0.01 80)");
    for (const zf of [43.26, 37.34]) for (let i = 0; i <= 8; i++) { const a = Math.PI - i / 8 * Math.PI, big = i === 4;
      RB(c, 2.78 * Math.cos(a), 3.5 + 2.78 * Math.sin(a), zf, big ? 0.6 : 0.5, big ? 0.7 : 0.55, 0.14, 0, 0, a * 180 / Math.PI - 90); }
    paint(c, IR, "oklch(0.75 0.005 250)"); for (let x = -2.2; x <= 2.21; x += 0.44) { BX(c, x - 0.04, 5.25, 40.25, x + 0.04, 6.05, 40.35); }
    BX(c, -2.4, 5.55, 40.22, 2.4, 5.63, 40.38); }
}
// the hold's snow cover: one ragged disc over the pad, its rim tucked under the ground so it feathers into the pass
function blanket(c, D) {
  const nA = D <= 2 ? 72 : 36, rings = D <= 2 ? [0, 8, 16, 24, 32, 38, 42, 46, 50, 1] : [0, 20, 38, 46, 1];
  const R = (i, j) => { const r = rings[j]; if (r !== 1) return r; return 51 + 6 * hh(i % nA, 5) + 2 * Math.sin(i / nA * 6.283 * 3); };
  const P = (i, j) => { const a = (i % nA) / nA * 6.2832, r = R(i, j), last = j === rings.length - 1;
    return [Math.cos(a) * r, last ? -0.25 : 0.02 + (j > 0 ? 0.03 * hh(i % nA, j) : 0), Math.sin(a) * r]; };
  paint(c, SNOW, SNOWC);
  for (let j = 0; j < rings.length - 1; j++) for (let i = 0; i < nA; i++) { const a = P(i, j), b = P(i + 1, j), d = P(i + 1, j + 1), e = P(i, j + 1);
    if (j === 0) c.tri(...a, ...e, ...d); else { c.tri(...a, ...e, ...d); c.tri(...a, ...d, ...b); } }
}
function town(c, D) {
  paint(c, FLAG, "oklch(0.88 0.012 80)");
  for (let z = 48.2, i = 0; z > -16.6; z -= 1.3, i++) { if (z > 37 && z < 43.6) continue; const j1 = 0.3 * hh(i, 1), j2 = 0.3 * hh(i, 2); BX(c, -1.8 - j1, -0.15, z - 1.24, 1.8 + j2, 0.035, z); }
  for (let x = 1.9, i = 0; x < 17.6; x += 1.3, i++) { const j1 = 0.25 * hh(i, 3), j2 = 0.25 * hh(i, 4); BX(c, x, -0.15, -1.3 - j1, Math.min(x + 1.24, 17.6), 0.035, 1.3 + j2); }
  for (let i = 0; i < 30; i++) { const x = -36 + 72 * hh(i, 7), z = -36 + 72 * hh(i, 8); if (Math.hypot(x, z) > 35 || (Math.abs(x) < 2.8 && z > -18)) continue;
    DRIFT(c, x, 0, z, hh(i, 9) * 3, 2 + 3 * hh(i, 10), 1.4 + 2 * hh(i, 11), 0.06 + 0.12 * hh(i, 12), D, i); }
  for (let i = 0; i < 18; i++) { const a = 0.5 + i / 18 * 6.283 + 0.2 * hh(i, 13), r = 44.5 + 6 * hh(i, 14), x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (Math.abs(x) < 7 && z > 40) continue; DRIFT(c, x, 0, z, a + 1.57, 2.5 + 3 * hh(i, 15), 1.5 + 1.5 * hh(i, 16), 0.15 + 0.5 * hh(i, 17), D, i + 50); }
}
function wallCollider(c) {
  // boxes only: the curtain walls as short axis-aligned steps along each side, round towers as cylinders, the gatehouse piers and lintel; the yard inside stays open
  const b = CB(), L = b.list, STEP = 1.2;
  for (let k = 0; k < 8; k++) { const F = side(k);
    for (const [t0, t1] of spans(k, F.L)) for (let t = t0; t < t1 - 1e-6; t += STEP) { const ta = t, tb = Math.min(t1, t + STEP);
      const q = [F.P(ta, -WT / 2, 0), F.P(tb, -WT / 2, 0), F.P(ta, WT / 2, 0), F.P(tb, WT / 2, 0)];
      const xs = q.map((p) => p[0]), zs = q.map((p) => p[2]);
      b(Math.min(...xs), -0.6, Math.min(...zs), Math.max(...xs), WH + 1, Math.max(...zs)); } }
  for (const [x, z] of WV) L.push({ kind: "cylinder", radiusTop: 3.3, radiusBottom: 3.3, height: 9.6, center: [x, 4.2, z] });
  for (const s of [-1, 1]) b(s < 0 ? -7.5 : 2.5, -0.6, 37, s < 0 ? -2.5 : 7.5, 11, 43.6);
  b(-2.5, 6.0, 37.4, 2.5, 10.8, 43.2);
  return L;
}

// ---------------- the keep: a stone longhall under a steep snow-laden slate roof, squat keep tower on its west end ----------------
const KH = { x0: -11, x1: 11, hz: 6, wh: 5.2, ye: 4.9, ez: 6.9, rt: 0.35 }; KH.yr = KH.ye + KH.ez * 1.45;
function keep(c, D) {
  const { x0, x1, hz, wh, ye, ez, rt, yr } = KH;
  paint(c, DFS, DST); BX(c, x0, -0.6, -hz, x1, wh, hz);
  HX(c, [[10.6, wh, -hz], [11, wh, -hz], [11, wh, hz], [10.6, wh, hz], [10.6, yr - 0.1, 0], [11, yr - 0.1, 0], [11, yr - 0.1, 0], [10.6, yr - 0.1, 0]]);
  paint(c, SL, "oklch(0.88 0.01 220)"); ROOF(c, -9.5, 11.6, -ez, ez, ye, yr, rt);
  if (D <= 4) SNOWROOF(c, -9.5, 11.45, ez, ye, yr, rt, 0.6, 0.32, D);
  paint(c, DFS, DST); BX(c, -16.5, -0.6, -4, -9.5, 13, 4);
  paint(c, DFS, DST); BX(c, 5.4, 9, -0.7, 6.8, yr + 2.2, 0.7);
  if (D <= 4) for (const x of [-7.5, -4.2, 4.2, 7.5]) { WIN(c, x, 1.5, 3.4, -hz, -1, D); WIN(c, x, 1.5, 3.4, hz, 1, D); }
  if (D > 3) return;
  paint(c, DFS, DST2); BX(c, x0 - 0.3, -0.6, -hz - 0.3, x1 + 0.3, 0.9, hz + 0.3); BX(c, -16.8, -0.6, -4.3, -9.2, 1.0, 4.3);
  paint(c, DFS, DST); MERL(c, -16.5, -4, -9.5, 4, 13, 0.55, 1.0, 0.85, 0.75);
  paint(c, SNOW, SNOWC); BX(c, -15.95, 13, -3.45, -10.05, 13.16, 3.45);
  if (D <= 2) for (const [z0, z1] of [[-4, -3.45], [3.45, 4]]) for (let x = -16.5; x + 0.85 <= -9.5 + 1e-6; x += 1.6) BX(c, x - 0.03, 14, z0 - 0.03, x + 0.88, 14.12, z1 + 0.03);
  for (const y of [5.5, 9.0]) { WIN(c, -13, y, y + 1.2, -4, -1, D, 0.14); WIN(c, -13, y, y + 1.2, 4, 1, D, 0.14); }
  glow(c, "#2a2620", WARM); BX(c, -16.53, 9, -0.14, -16.47, 10.2, 0.14);
  paint(c, DFS, DST2); BX(c, 5.25, yr + 2.0, -0.85, 6.95, yr + 2.2, 0.85); paint(c, SNOW, SNOWC); BX(c, 5.3, yr + 2.2, -0.8, 6.9, yr + 2.3, 0.8); flatc(c, "#1a1612"); BX(c, 5.8, yr + 2.2, -0.3, 6.4, yr + 2.34, 0.3);
  // door
  paint(c, DFS, "oklch(0.97 0.01 80)"); BX(c, -1.75, 0, -6.45, -1.2, 3.8, -5.9); BX(c, 1.2, 0, -6.45, 1.75, 3.8, -5.9); BX(c, -1.75, 3.25, -6.45, 1.75, 3.85, -5.9);
  paint(c, OAK, "oklch(0.8 0.03 55)"); BX(c, -1.2, 0, -6.12, -0.02, 3.25, -5.98); BX(c, 0.02, 0, -6.12, 1.2, 3.25, -5.98);
  paint(c, FLAG, "oklch(0.88 0.012 80)"); BX(c, -2.3, -0.2, -7.4, 2.3, 0.15, -6.0); BX(c, -1.9, 0.15, -6.75, 1.9, 0.3, -6.0);
  paint(c, SL, "oklch(0.88 0.01 220)"); RB(c, 0, 4.15, -6.75, 4.4, 0.16, 1.6, 0, -28); paint(c, SNOW, SNOWC); RB(c, 0, 4.3, -6.72, 4.2, 0.12, 1.45, 0, -28);
  paint(c, IR, IRONC); BX(c, 2.25, 2.85, -6.6, 2.35, 2.95, -6.0); paint(c, IR, IRONC); BX(c, 2.13, 2.8, -6.68, 2.47, 2.86, -6.32);
  glow(c, "#ffd59a", [1.8, 1.0, 0.4]); BX(c, 2.17, 2.4, -6.64, 2.43, 2.8, -6.36);
  if (D <= 2) { paint(c, IR, IRONC); for (const y of [0.55, 1.65, 2.75]) BX(c, -1.15, y, -6.17, 1.15, y + 0.1, -6.1);
    for (const x of [-0.25, 0.25]) LA(c, x, 1.55, -6.18, [[0.09, 0], [0.09, 0.02]], 8, true);
    for (const x of [-5.85, 5.85]) { paint(c, DFS, DST2);
      HX(c, [[x - .35, -.6, -hz - .9], [x + .35, -.6, -hz - .9], [x + .35, -.6, -hz], [x - .35, -.6, -hz], [x - .35, 1.2, -hz - .9], [x + .35, 1.2, -hz - .9], [x + .35, 4.4, -hz], [x - .35, 4.4, -hz]]);
      HX(c, [[x - .35, -.6, hz], [x + .35, -.6, hz], [x + .35, -.6, hz + .9], [x - .35, -.6, hz + .9], [x - .35, 4.4, hz], [x + .35, 4.4, hz], [x + .35, 1.2, hz + .9], [x - .35, 1.2, hz + .9]]); }
    ICE(c, [-9.4, ye, -ez], [11.5, ye, -ez], 36, 1, 0.8, D); ICE(c, [-9.4, ye, ez], [11.5, ye, ez], 36, 2, 0.8, D);
    ICE(c, [-2.1, 3.73, -7.45], [2.1, 3.73, -7.45], 10, 3, 0.4, D); ICE(c, [-16.55, 12.95, -4.05], [-9.45, 12.95, -4.05], 9, 4, 0.5, D); }
  for (const [x, z, a, rx, h] of [[-9, -hz - 0.3, 0, 2.2, 0.8], [8.8, -hz - 0.35, 0, 2.6, 0.9], [-4, hz + 0.3, 0, 3, 1.0], [3.5, hz + 0.3, 0, 2.4, 0.8], [9.5, hz + 0.35, 0, 2, 0.7], [-17, -1.5, 1.57, 2.4, 1.0], [-17, 2.6, 1.57, 1.6, 0.7], [-13, 4.4, 0, 2, 0.8], [11.4, 3, 1.57, 2.2, 0.8], [-13.5, -4.4, 0, 2.1, 0.7]])
    DRIFT(c, x, 0, z, a, rx, 1.0, h, D, x + z);
}
function keepCollider() { const { x0, x1, hz, wh, yr } = KH, b = CB();
  b(x0, -0.6, -hz, x1, wh, hz); b(-9.5, wh, -4, 11.6, yr - 1.5, 4); b(-16.5, -0.6, -4, -9.5, 13, 4); b(5.4, 9, -0.7, 6.8, yr + 2.2, 0.7); b(-2.3, -0.2, -7.4, 2.3, 0.15, -6.0); return b.list; }

// ---------------- a turf-and-stone house: drystone walls, oak gables, turf roof under snow ----------------
function hdims(p) { const w = p.w ?? 7, d = p.d ?? 5.5, ez = d / 2 + 0.55, ye = 2.05; return { w, d, hw: w / 2, hd: d / 2, ez, ye, yr: ye + ez * 1.0, wh: 2.55, rt: 0.42, dx: p.doorX ?? 0, ch: p.chim ?? 1, s: p.seed ?? 1 }; }
function house(c, D) {
  const { w, hw, hd, ez, ye, yr, wh, rt, dx, ch, s } = hdims(c.params), st = `oklch(${(0.9 + 0.07 * hh(s, 1)).toFixed(3)} 0.012 ${Math.round(60 + 40 * hh(s, 2))})`;
  paint(c, DFS, st); BX(c, -hw, -0.6, -hd, hw, wh, hd);
  paint(c, TURF, "oklch(0.92 0.03 120)"); ROOF(c, -hw - 0.45, hw + 0.45, -ez, ez, ye, yr, rt);
  if (D <= 4) SNOWROOF(c, -hw - 0.35, hw + 0.35, ez, ye, yr, rt, 0.4 + 0.25 * hh(s, 3), 0.3, D);
  const cx = ch * (hw - 0.6); paint(c, DFS, st); BX(c, cx - 0.4, 1.0, 0.5, cx + 0.4, yr + 0.9, 1.3);
  if (D > 4) return;
  paint(c, OAK, WOOD); for (const g of [-1, 1]) { const a = g * hw - 0.1 * g, b = g * hw + 0.06 * g, xa = Math.min(a, b), xb = Math.max(a, b);
    HX(c, [[xa, wh, -hd], [xb, wh, -hd], [xb, wh, hd], [xa, wh, hd], [xa, yr - 0.15, 0], [xb, yr - 0.15, 0], [xb, yr - 0.15, 0], [xa, yr - 0.15, 0]]); }
  paint(c, OAK, "oklch(0.8 0.03 55)"); BX(c, dx - 0.56, 0, -hd - 0.04, dx + 0.56, 2.0, -hd + 0.02);
  const wx = Math.abs(dx) < 0.5 ? (hh(s, 5) < 0.5 ? -1 : 1) * Math.min(hw - 1.1, 2.0) : -Math.sign(dx) * Math.min(hw - 1.1, 2.0);
  WIN(c, wx, 1.05, 1.65, -hd, -1, D, 0.28); WIN(c, -wx * 0.6, 1.05, 1.65, hd, 1, D, 0.28);
  if (D > 3) return;
  paint(c, DFS, DST2); BX(c, -hw - 0.18, -0.6, -hd - 0.18, hw + 0.18, 0.45, hd + 0.18);
  paint(c, OAK, WOOD); BX(c, dx - 0.68, 0, -hd - 0.08, dx - 0.56, 2.05, -hd + 0.02); BX(c, dx + 0.56, 0, -hd - 0.08, dx + 0.68, 2.05, -hd + 0.02);
  paint(c, DFS, "oklch(0.96 0.01 80)"); BX(c, dx - 0.9, 2.0, -hd - 0.12, dx + 0.9, 2.32, -hd + 0.02);
  paint(c, FLAG, "oklch(0.88 0.012 80)"); BX(c, dx - 0.8, -0.2, -hd - 0.65, dx + 0.8, 0.12, -hd);
  paint(c, DFS, DST2); BX(c, cx - 0.5, yr + 0.75, 0.4, cx + 0.5, yr + 0.9, 1.4); paint(c, SNOW, SNOWC); BX(c, cx - 0.48, yr + 0.9, 0.42, cx + 0.48, yr + 0.98, 1.38); flatc(c, "#1a1612"); BX(c, cx - 0.18, yr + 0.9, 0.72, cx + 0.18, yr + 1.02, 1.08);
  if (D <= 2) { paint(c, IR, IRONC); for (const y of [0.35, 1.6]) BX(c, dx - 0.5, y, -hd - 0.08, dx + 0.42, y + 0.08, -hd - 0.04); LA(c, dx + 0.36, 1.0, -hd - 0.08, [[0.06, 0], [0.06, 0.015]], 8, true);
    paint(c, DFS, st); for (const gx of [-1, 1]) for (const gz of [-1, 1]) for (let y = 0.45, i = 0; y < wh - 0.3; y += 0.42, i++) { const L = i % 2 ? 0.55 : 0.32;
      BX2(c, gx * hw - gx * (i % 2 ? L : 0.06) , y, gz * hd - gz * (i % 2 ? 0.06 : L), gx * (hw + 0.06), y + 0.38, gz * (hd + 0.06)); }
    ICE(c, [-hw - 0.4, ye, -ez], [hw + 0.4, ye, -ez], Math.round(w * 3), s * 3, 0.55, D); ICE(c, [-hw - 0.4, ye, ez], [hw + 0.4, ye, ez], Math.round(w * 3), s * 3 + 1, 0.55, D); }
  DRIFT(c, -hw + 0.4, 0, hd + 0.3, 0.3, 1.8, 0.9, 0.7, D, s); DRIFT(c, hw - 0.6, 0, hd + 0.3, -0.2, 1.6, 0.9, 0.6, D, s + 1);
  DRIFT(c, -ch * (hw + 0.3), 0, -0.6, 1.57, 1.9, 0.9, 0.8, D, s + 2); DRIFT(c, wx * 1.3, 0, -hd - 0.3, 0, 1.2, 0.6, 0.4, D, s + 3);
}
function houseCollider(c) { const { hw, hd, yr, wh, dx, ch } = hdims(c.params), b = CB(), cx = ch * (hw - 0.6);
  b(-hw, -0.6, -hd, hw, wh, hd); b(-hw, wh, -hd * 0.5, hw, yr - 0.5, hd * 0.5); b(cx - 0.4, 1.0, 0.5, cx + 0.4, yr + 0.9, 1.3); b(dx - 0.8, -0.2, -hd - 0.65, dx + 0.8, 0.12, -hd); return b.list; }

// ---------------- the Mages Guild tower: grey ashlar, conical slate roof under snow, blue banner over the door ----------------
function tower(c, D) {
  const n = D <= 1 ? 20 : D <= 2 ? 14 : D <= 3 ? 10 : 6, TOP = 11.0, R = 3.4;
  paint(c, GREY, GST); LA(c, 0, 0, 0, D <= 3 ? [[3.95, -0.6], [3.75, 0.9], [3.4, 1.3], [3.4, TOP], [3.8, TOP + 0.3], [3.8, TOP + 0.75]] : [[3.6, -0.6], [3.5, TOP + 0.75]], n, true);
  paint(c, SL, "oklch(0.86 0.02 240)"); LA(c, 0, 0, 0, [[4.05, TOP + 0.65], [0.04, 17.6]], n, true);
  if (D <= 4) { paint(c, SNOW, SNOWC); LA(c, 0, 0, 0, [[3.3, 13.35], [0.04, 17.75]], n, false); }
  if (D <= 4) { paint(c, OAK, "oklch(0.8 0.03 55)"); BX(c, -0.72, 0, -3.55, 0.72, 2.45, -3.25); }
  const slits = [[-1.57 - 1.1, 4.4], [-1.57 + 1.1, 4.4], [0, 4.4], [3.14, 4.4], [1.57, 4.4], [-1.57 - 0.6, 8.2], [-1.57 + 0.6, 8.2], [1.57 - 0.9, 8.2], [1.57 + 0.9, 8.2]];
  if (D <= 4) for (const [a, y] of slits) { glow(c, "#2a2a35", [0.55, 0.45, 0.35]); RB(c, Math.cos(a) * R, y + 0.55, Math.sin(a) * R, 0.34, 1.1, 0.14, yawOf(-Math.sin(a), Math.cos(a))); }
  if (D > 3) return;
  // door: pilasters, arch, arched oak leaf, steps
  paint(c, GREY, "oklch(0.98 0.006 250)"); BX(c, -1.08, 0, -3.88, -0.72, 3.45, -3.05); BX(c, 0.72, 0, -3.88, 1.08, 3.45, -3.05); ARCH(c, 0.72, 2.45, 3.45, -3.88, -3.05, D <= 2 ? 8 : 4);
  BX(c, -1.2, 3.45, -3.95, 1.2, 3.7, -3.0);
  paint(c, OAK, "oklch(0.8 0.03 55)"); { const N = D <= 2 ? 8 : 4; for (let i = 0; i < N; i++) { const a0 = i / N * Math.PI, a1 = (i + 1) / N * Math.PI;
    OT(c, [0, 2.45, -3.56], [0.72 * Math.cos(a0), 2.45 + 0.72 * Math.sin(a0), -3.56], [0.72 * Math.cos(a1), 2.45 + 0.72 * Math.sin(a1), -3.56], [0, 2.45, 0]); } }
  paint(c, FLAG, "oklch(0.9 0.01 240)"); BX(c, -1.4, -0.2, -4.75, 1.4, 0.16, -3.2); BX(c, -1.1, 0.16, -4.25, 1.1, 0.32, -3.2);
  // the banner
  paint(c, IR, IRONC); BX(c, -0.88, 8.05, -3.97, 0.88, 8.13, -3.89); for (const x of [-0.8, 0.8]) BX(c, x - 0.04, 8.02, -3.95, x + 0.04, 8.14, -3.3);
  flatc(c, "oklch(0.42 0.14 262)"); const bz = -3.9, ref = [0, 6.3, 0];
  OT(c, [-0.72, 8.0, bz], [0.72, 8.0, bz], [0, 5.15, bz], ref); OT(c, [-0.72, 8.0, bz], [0, 5.15, bz], [-0.72, 4.5, bz], ref); OT(c, [0.72, 8.0, bz], [0.72, 4.5, bz], [0, 5.15, bz], ref);
  flatc(c, "#c9a45a"); OT(c, [-0.72, 8.0, bz - 0.01], [0.72, 8.0, bz - 0.01], [0.72, 7.8, bz - 0.01], ref); OT(c, [-0.72, 8.0, bz - 0.01], [0.72, 7.8, bz - 0.01], [-0.72, 7.8, bz - 0.01], ref);
  if (D <= 2) { flatc(c, "oklch(0.9 0.03 240)"); const ey = 6.65, ez2 = bz - 0.012;
    for (let i = 0; i < 8; i++) { const a = i / 8 * 6.2832, L = i % 2 ? 0.26 : 0.45, a0 = a - 0.32, a1 = a + 0.32;
      OT(c, [Math.cos(a) * L, ey + Math.sin(a) * L, ez2], [Math.cos(a0) * 0.1, ey + Math.sin(a0) * 0.1, ez2], [Math.cos(a1) * 0.1, ey + Math.sin(a1) * 0.1, ez2], ref); }
    paint(c, GREY, GST); for (const y of [5.6, 9.6]) LA(c, 0, y, 0, [[3.4, 0], [3.52, 0.02], [3.52, 0.2], [3.4, 0.22]], n, false);
    paint(c, IR, IRONC); for (const y of [0.45, 1.75]) BX(c, -0.66, y, -3.6, 0.66, y + 0.08, -3.55); LA(c, 0.42, 1.2, -3.62, [[0.07, 0], [0.07, 0.02]], 8, true);
    LA(c, 0, 17.5, 0, [[0.08, 0], [0.03, 1.0]], 6, true);
    glow(c, "#7f9cff", [0.35, 0.55, 1.6]); { const cy = 18.85, P = [[0, cy + 0.38, 0], [0, cy - 0.38, 0], [0.17, cy, 0], [-0.17, cy, 0], [0, cy, 0.17], [0, cy, -0.17]], o = [0, cy, 0];
      for (const t of [2, 3]) for (const u of [4, 5]) { OT(c, P[0], P[t], P[u], o); OT(c, P[1], P[t], P[u], o); } }
    ICERING(c, 0, TOP + 0.65, 0, 4.05, 16, 77, 0.6, D); }
  for (const a of [0.2, 1.3, 2.4, 3.4]) DRIFT(c, Math.cos(a) * 3.8, 0, Math.sin(a) * 3.8, a + 1.57, 1.8, 0.9, 0.7, D, a * 10);
}
function towerCollider() { return [{ kind: "cylinder", radiusTop: 3.45, radiusBottom: 3.8, height: 12.2, center: [0, 5.5, 0] }, { kind: "box", width: 2.8, height: 0.36, depth: 1.55, center: [0, -0.02, -3.98] }]; }

// ---------------- the sledge-coach: a box coach on iron-shod runners, driver's bench, lantern, luggage ----------------
function coach(c, D) {
  const g = new G(c);
  paint(c, OAK, "oklch(0.78 0.04 55)"); BX(c, -0.85, 0.7, -0.95, 0.85, 2.2, 1.6);
  paint(c, OAK, WOOD); BX(c, -0.95, 0.58, -1.85, 0.95, 0.7, 1.7); BX(c, -0.98, 2.2, -1.05, 0.98, 2.3, 1.72);
  paint(c, SNOW, SNOWC); BX(c, -0.92, 2.3, -1.0, 0.92, 2.42, 1.66);
  paint(c, IR, IRONC); for (const s of [-1, 1]) { const x = s * 0.8; g.tube([[x, 0.06, 1.75, 0.045], [x, 0.05, 1.1, 0.05], [x, 0.05, -1.3, 0.05], [x, 0.16, -1.85, 0.05], [x, 0.48, -2.12, 0.05], [x, 0.8, -2.02, 0.045]], D <= 2 ? 6 : 4, { capA: true, capB: true }); }
  if (D > 3) return;
  paint(c, OAK, WOOD); for (const s of [-1, 1]) for (const z of [-1.3, -0.2, 0.9]) g.tube([[s * 0.8, 0.06, z, 0.045], [s * 0.8, 0.62, z, 0.045]], 5);
  flatc(c, "oklch(0.45 0.11 35)"); BX(c, -0.88, 0.7, -0.98, 0.88, 0.82, 1.63); BX(c, -0.88, 2.08, -0.98, 0.88, 2.2, 1.63);
  paint(c, OAK, "oklch(0.6 0.03 50)"); for (const x of [-0.86, 0.82]) for (const z of [-0.97, 1.58]) BX(c, x, 0.82, z - 0.02, x + 0.04, 2.08, z + 0.02);
  BX(c, 0.85, 0.85, 0.25, 0.9, 2.0, 1.15);
  glow(c, "#2a2218", [0.35, 0.2, 0.08]); BX(c, 0.89, 1.45, 0.45, 0.92, 1.85, 0.95); BX(c, -0.88, 1.4, -0.6, -0.85, 1.9, 0.0); BX(c, -0.88, 1.4, 0.55, -0.85, 1.9, 1.15); BX(c, -0.45, 1.5, -0.98, 0.45, 1.9, -0.95);
  paint(c, OAK, WOOD); BX(c, -0.82, 1.32, -1.72, 0.82, 1.42, -1.0); for (const x of [-0.75, 0.7]) BX(c, x, 0.7, -1.7, x + 0.08, 1.32, -1.6);
  RB(c, 0, 1.0, -1.88, 1.6, 0.06, 0.55, 0, 60);
  g.tube([[0, 0.62, -1.8, 0.055], [0, 0.35, -3.4, 0.05], [0, 0.1, -4.2, 0.045]], 6, { capB: true }); g.tube([[-0.7, 0.18, -3.95, 0.035], [0.7, 0.18, -3.95, 0.035]], 5, { capA: true, capB: true });
  c.albedo(TEX.canvas); c.color("oklch(0.9 0.03 80)"); c.emissive(null); BX(c, -0.6, 2.42, 0.4, 0.6, 2.8, 1.45); paint(c, SNOW, SNOWC); BX(c, -0.62, 2.8, 0.38, 0.62, 2.9, 1.47);
  paint(c, IR, IRONC); BX(c, 0.85, 2.1, -0.98, 1.12, 2.15, -0.93); BX(c, 0.98, 2.05, -1.05, 1.2, 2.09, -0.86);
  glow(c, "#ffd59a", [1.6, 0.95, 0.4]); BX(c, 1.01, 1.75, -1.03, 1.17, 2.05, -0.88);
  if (D <= 2) { paint(c, IR, IRONC); for (const s of [-1, 1]) g.tube([[s * 0.9, 2.45, -0.95, 0.02], [s * 0.9, 2.45, 1.6, 0.02]], 4); for (const z of [-0.95, 1.6]) g.tube([[-0.9, 2.45, z, 0.02], [0.9, 2.45, z, 0.02]], 4);
    ICE(c, [-0.98, 2.2, -1.06], [0.98, 2.2, -1.06], 6, 91, 0.25, D); ICE(c, [-0.98, 2.2, 1.73], [0.98, 2.2, 1.73], 6, 92, 0.25, D); }
  DRIFT(c, -0.9, 0, 1.6, 0, 0.9, 0.5, 0.25, D, 3); DRIFT(c, 0.9, 0, -1.6, 0.3, 0.8, 0.5, 0.2, D, 4);
}

// ---------------- an iron brazier on a tripod ----------------
function brazier(c, D) {
  const g = new G(c), n = D <= 2 ? 14 : 8;
  paint(c, IR, "oklch(0.8 0.005 60)");
  if (D <= 3) for (let i = 0; i < 3; i++) { const a = i * 2.094 + 0.5; g.tube([[Math.cos(a) * 0.6, 0, Math.sin(a) * 0.6, 0.035], [Math.cos(a) * 0.32, 0.85, Math.sin(a) * 0.32, 0.035], [Math.cos(a) * 0.45, 1.08, Math.sin(a) * 0.45, 0.03]], D <= 2 ? 6 : 4); }
  else CY(c, 0, 0, 0, 0.1, 0.85, 6);
  LA(c, 0, 0, 0, [[0.08, 0.8], [0.35, 0.88], [0.5, 1.0], [0.58, 1.15], [0.62, 1.2]], n, false);
  glow(c, "#3a1a0a", [1.5, 0.45, 0.1]); LA(c, 0, 0, 0, [[0.56, 1.1], [0.0, 1.16]], n, false, "y", false);
  if (D > 3) return;
  flatc(c, "oklch(0.55 0.01 60)"); LA(c, 0, 0, 0, [[0.75, 0.035], [0.0, 0.05]], 12, false, "y", false);
  if (D <= 2) { paint(c, IR, IRONC); LA(c, 0, 0, 0, [[0.6, 1.17], [0.66, 1.17], [0.66, 1.24], [0.6, 1.24]], n, false);
    const R = (i, k) => hh(i, k, 7); for (let i = 0; i < 7; i++) { const a = i * 0.9, r = 0.12 + 0.3 * R(i, 1); glow(c, i % 2 ? "#1a0d06" : "#4a1c08", i % 2 ? [0.3, 0.07, 0.02] : [2.2, 0.7, 0.15]);
      g.tris(g.blob([Math.cos(a) * r, 1.17, Math.sin(a) * r], [0.09, 0.06, 0.08], 0, 0.2, 1, i)); } }
}

// ---------------- a firewood stack under a pent plank roof ----------------
function woodpile(c, D) {
  const n = c.params.n ?? 8, rows = c.params.rows ?? 4, W = n * 0.3 + 0.15, hw = W / 2, top = 0.14 + rows * 0.26;
  if (D >= 4) { c.albedo(TEX.log); c.color(WOOD); c.emissive(null); BX(c, -hw, 0, -0.45, hw, top, 0.45); paint(c, SNOW, SNOWC); BX(c, -hw - 0.2, top + 0.35, -0.65, hw + 0.2, top + 0.5, 0.7); return; }
  const g = new G(c), seg = D <= 2 ? 7 : 5;
  for (let r = 0; r < rows; r++) for (let i = 0; i < n - (r % 2); i++) {
    const x = -hw + 0.15 + (i + 0.5 + (r % 2) * 0.5) * 0.3, rl = 0.115 + 0.03 * hh(i, r), y = 0.13 + r * 0.26, zj = 0.06 * (hh(i, r, 3) - 0.5);
    c.albedo(TEX.log); c.color(`oklch(${(0.75 + 0.2 * hh(i, r, 5)).toFixed(2)} 0.03 55)`); c.emissive(null); g.tube([[x, y, -0.45 + zj, rl], [x, y, 0.45 + zj, rl]], seg);
    flatc(c, `oklch(${(0.66 + 0.1 * hh(i, r, 6)).toFixed(2)} 0.07 68)`);
    for (const ze of [-0.45 + zj, 0.45 + zj]) for (let k = 0; k < seg; k++) { const a0 = k / seg * 6.2832, a1 = (k + 1) / seg * 6.2832;
      OT(c, [x, y, ze], [x + Math.cos(a0) * rl, y + Math.sin(a0) * rl, ze], [x + Math.cos(a1) * rl, y + Math.sin(a1) * rl, ze], [x, y, 0]); } }
  paint(c, OAK, WOOD); for (const s of [-1, 1]) { g.tube([[s * (hw + 0.06), -0.2, -0.38, 0.05], [s * (hw + 0.06), top + 0.55, -0.38, 0.045]], 5); g.tube([[s * (hw + 0.06), -0.2, 0.38, 0.05], [s * (hw + 0.06), top + 0.3, 0.38, 0.045]], 5); }
  if (D <= 3) { paint(c, OAK, "oklch(0.75 0.03 55)"); RB(c, 0, top + 0.47, 0.0, W + 0.45, 0.08, 1.45, 0, 10); paint(c, SNOW, SNOWC); RB(c, 0, top + 0.6, 0.02, W + 0.35, 0.16, 1.35, 0, 10);
    ICE(c, [-hw - 0.2, top + 0.55, -0.72], [hw + 0.2, top + 0.55, -0.72], n, n * 7, 0.3, D); DRIFT(c, hw + 0.4, 0, 0.1, 1.57, 1.0, 0.6, 0.45, D, n); }
}

// ---------------- the frozen well ----------------
function well(c, D) {
  const n = D <= 2 ? 16 : 8;
  paint(c, DFS, "oklch(0.95 0.01 80)"); LA(c, 0, 0, 0, [[1.05, -0.4], [1.05, 0.85]], n, false); LA(c, 0, 0, 0, [[1.05, 0.85], [0.72, 0.85]], n, false, "y", false); LA(c, 0, 0, 0, [[0.72, 0.85], [0.72, 0.3]], n, false);
  flatc(c, "oklch(0.86 0.05 215)"); LA(c, 0, 0, 0, [[0.72, 0.55], [0, 0.56]], n, false, "y", false);
  paint(c, OAK, WOOD); for (const s of [-1, 1]) BX2(c, s * 1.1, -0.3, -0.09, s * 1.26, 2.35, 0.09);
  paint(c, SL, "oklch(0.88 0.01 220)"); ROOF(c, -1.5, 1.5, -1.0, 1.0, 2.25, 2.95, 0.08);
  if (D <= 4) SNOWROOF(c, -1.45, 1.45, 1.0, 2.25, 2.95, 0.08, 0.12, 0.15, D);
  if (D > 3) return;
  c.albedo(TEX.log); c.color(WOOD); c.emissive(null); LA(c, -1.2, 1.85, 0, [[0.09, 0], [0.09, 2.4]], 8, true, "x");
  if (D <= 2) { flatc(c, "#3a3028"); BX(c, -0.02, 0.56, -0.02, 0.02, 1.78, 0.02);
    paint(c, OAK, WOOD); LA(c, 0.88, 0.85, 0.36, [[0.15, 0], [0.19, 0.32]], 10, true); paint(c, IR, IRONC); LA(c, 0.88, 0.85, 0.36, [[0.165, 0.08], [0.17, 0.11]], 10, false);
    BX(c, 1.2, 1.8, -0.03, 1.5, 1.88, 0.03); BX(c, 1.45, 1.5, -0.03, 1.5, 1.85, 0.03);
    flatc(c, "oklch(0.7 0.04 215)"); for (let i = 0; i < 4; i++) { const a = i * 1.7; RB(c, Math.cos(a) * 0.3, 0.565, Math.sin(a) * 0.3, 0.55, 0.005, 0.015, a * 57); }
    ICE(c, [-1.5, 2.25, -1.0], [1.5, 2.25, -1.0], 10, 61, 0.35, D); ICE(c, [-1.5, 2.25, 1.0], [1.5, 2.25, 1.0], 10, 62, 0.35, D);
    for (let i = 0; i < 5; i++) { const a = i * 1.3 + 0.4; DRIFT(c, Math.cos(a) * 0.88, 0.85, Math.sin(a) * 0.88, a + 1.57, 0.32, 0.18, 0.12, D, i); } }
  DRIFT(c, -0.6, 0, 1.1, 0.3, 1.2, 0.6, 0.35, D, 9);
}

const K = { wall, keep, house, tower, coach, brazier, woodpile, well };
export function geometry(c) { (K[c.params.kind] ?? wall)(c, c.lod); }
export function collider(c) {
  const k = c.params.kind ?? "wall", b = CB();
  if (k === "wall") return wallCollider(c);
  if (k === "keep") return keepCollider();
  if (k === "house") return houseCollider(c);
  if (k === "tower") return towerCollider();
  if (k === "coach") { b(-1.0, 0, -2.2, 1.0, 2.9, 1.75); return b.list; }
  if (k === "brazier") return { kind: "cylinder", radiusTop: 0.6, radiusBottom: 0.5, height: 1.2, center: [0, 0.6, 0] };
  if (k === "woodpile") { const n = c.params.n ?? 8, rows = c.params.rows ?? 4, hw = (n * 0.3 + 0.15) / 2; b(-hw - 0.1, 0, -0.5, hw + 0.1, 0.14 + rows * 0.26 + 0.5, 0.5); return b.list; }
  if (k === "well") { b(-1.05, -0.4, -1.05, 1.05, 0.85, 1.05); b(-1.26, 0, -0.09, -1.1, 2.35, 0.09); b(1.1, 0, -0.09, 1.26, 2.35, 0.09); return b.list; }
  return null;
}
