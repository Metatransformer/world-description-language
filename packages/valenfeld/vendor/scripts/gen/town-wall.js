import { BARREL, BXR, CB, CY, HX, LA, RB, ROOF, flatc, glow, paint } from "../lib/buildkit.js";   // the shared building toolkit
import BK from "../lib/data/building-kit.json";   // textures and tints: scripts/lib/data/building-kit.yml
// ---- Valenfeld building kit (shared verbatim by scripts/gen/*): textures, boxes, lathes, roofs ----
const { fieldstone: FS, oak: OAK, plaster: PL, slate: SL, iron: IR, flagstone: FLAG, hay: HAY } = BK.textures;
const { stone: STONE, wood: WOOD, white: WHITE, iron: IRONC } = BK.tints;
// hexahedron: b0 b1 b2 b3 (bottom: x0z0 x1z0 x1z1 x0z1) then t0..t3 above them
const BX = BXR;
// box by centre and size, turned: roll (about z), then pitch (about x, + tips -z up), then yaw (about y), degrees
// lathe: prof [[r, h]…] swept round the y axis (or the x axis: h runs along +x), smooth sides
// gable roof, ridge along x over z mid, eaves at z0/z1 at height ye, ridge yr, slab thickness t
function MERL(c, x0, z0, x1, z1, y, th, h = 0.9, w = 0.9, gap = 0.9) {
  for (let x = x0; x + w <= x1 + 1e-6; x += w + gap) { BX(c, x, y, z0, x + w, y + h, z0 + th); BX(c, x, y, z1 - th, x + w, y + h, z1); }
  for (let z = z0 + th + gap; z + w <= z1 - th + 1e-6; z += w + gap) { BX(c, x0, y, z, x0 + th, y + h, z + w); BX(c, x1 - th, y, z, x1, y + h, z + w); } }
// ---- end kit ----
// THE TOWN WALL of Valenfeld: four fieldstone curtains on x/z = ±40 (1.5 m thick, 5 m tall, footing
// sunk 3 m so it meets the ground everywhere), square corner towers, and the east GATEHOUSE at (40, 0):
// an elliptical arch 4 m wide, 4.5 m tall, oak leaves standing open against its inner face, a banner,
// two torch brackets (the flames are fx children of the town root).
const GX0 = 37.5, GX1 = 43, GH = 8.5;
// three gates: east (the Kingsway), south (the farm road), west (the woods road)
const GATES = [(x, y, z) => [x, y, z], (x, y, z) => [-z, y, x], (x, y, z) => [-x, y, -z], (x, y, z) => [z - 14, y, -x]]; // east, south, west, north (north sits at x -14, clear of the keep)
function xf(c, T) { if (T === GATES[0]) return c;
  const P = (a) => { const o = []; for (let i = 0; i < a.length; i += 3) o.push(...T(a[i], a[i + 1], a[i + 2])); return o; };
  return new Proxy(c, { get(t, k) { if (k === "quad" || k === "tri") return (...a) => t[k](...P(a)); const v = t[k]; return typeof v === "function" ? v.bind(t) : v; } }); }
export function geometry(c) {
  if (c.params?.razed) { paint(c, FS, STONE); BX(c, -0.2, -3, -0.2, 0.2, -2.8, 0.2); return; }   // razed (a buried stub keeps the mesh alive): the square ring is gone, the town opens into the outer curtain
  const D = c.lod;
  paint(c, FS, STONE);
  const runs = [["z", -40, -37, -20], ["z", -40, -8, 37], ["z", 40, -37, -6], ["z", 40, 6, 37], ["x", -40, -37, -6], ["x", -40, 6, 37], ["x", 40, -37, -6], ["x", 40, 6, 37]];
  const bx = (a, f, u0, u1, y0, y1, t0, t1) => a === "z" ? BX(c, u0, y0, f + t0, u1, y1, f + t1) : BX(c, f + t0, y0, u0, f + t1, y1, u1);
  const DK = "oklch(0.72 0.02 75)", LT = "oklch(0.86 0.015 82)", MS = "oklch(0.62 0.05 125)";
  for (const [a, f, u0, u1] of runs) {
    const s = Math.sign(f), ob = (i0, i1) => s > 0 ? [i0, i1] : [-i1, -i0];
    paint(c, FS, STONE); bx(a, f, u0, u1, -3, 5, -0.75, 0.75);
    if (D <= 3) {
      paint(c, FS, DK); bx(a, f, u0, u1, -3, 0.55, -1.15, 1.15); bx(a, f, u0, u1, 0.55, 1.0, -0.95, 0.95);   // battered footing, two courses
      paint(c, FS, LT); bx(a, f, u0, u1, 3.1, 3.32, -0.88, 0.88); bx(a, f, u0, u1, 4.9, 5.12, -0.92, 0.92);    // string course, coping
      paint(c, FS, DK); for (let u = u0 + 5; u + 1.2 < u1 - 2; u += 7) { bx(a, f, u, u + 1.2, -3, 2.6, ...ob(0.75, 1.75)); bx(a, f, u + 0.05, u + 1.15, 2.6, 4.2, ...ob(0.75, 1.25)); }   // buttresses, stepped
      paint(c, FS, LT); for (let u = u0 + 0.35; u + 1.0 <= u1; u += 1.9) bx(a, f, u, u + 1.0, 5.12, 6.15, ...ob(0.32, 0.92));   // merlons
      bx(a, f, u0, u1, 5.12, 5.45, ...ob(0.32, 0.92));   // breastwork under the crenels
      bx(a, f, u0, u1, 5.12, 5.6, ...ob(-0.92, -0.6));   // inner parapet
    }
    if (D <= 2) {
      paint(c, FS, DK); for (let u = u0 + 0.3; u + 1.1 <= u1; u += 1.9) bx(a, f, u, u + 1.1, 6.15, 6.28, ...ob(0.27, 0.97));   // merlon caps
      paint(c, FS, MS); bx(a, f, u0, u1, 1.0, 1.9, ...ob(0.75, 0.78));   // damp and moss at the outer foot
      flatc(c, "#16140f"); for (let u = u0 + 8.6; u < u1 - 2; u += 7) bx(a, f, u - 0.06, u + 0.06, 2.0, 3.0, ...ob(0.74, 0.77));   // arrow loops between buttresses
    }
  }
  // FLANKING TOWERS (#119): every long curtain is broken by square towers standing proud of its outer face,
  // each hung with the Annvyr banner; an oak notice board on the inner face of each run.
  for (const [a, f, u0, u1] of runs) {
    const s = Math.sign(f), ob = (i0, i1) => s > 0 ? [i0, i1] : [-i1, -i0], L = u1 - u0, n = Math.floor((L - 6) / 14);
    for (let k = 1; k <= n; k++) {
      const m = u0 + L * k / (n + 1) + (((k * 7 + Math.round(f)) % 3) - 1) * 0.8, tw = 2 + ((k + Math.round(u0)) % 2) * 0.4, pr = 2.4 + (k % 2) * 0.6, th = 6.6 + ((k * 3) % 2) * 0.8;
      paint(c, FS, STONE); bx(a, f, m - tw, m + tw, -3, th, ...ob(0.6, 0.75 + pr));
      if (D <= 3) { paint(c, FS, DK); bx(a, f, m - tw - 0.25, m + tw + 0.25, -3, 0.7, ...ob(0.75, 1.0 + pr)); paint(c, FS, LT); bx(a, f, m - tw - 0.15, m + tw + 0.15, th - 0.35, th, ...ob(0.6, 0.9 + pr)); }
      if (D <= 2) {
        paint(c, FS, LT); for (let u = m - tw - 0.15; u + 0.8 <= m + tw + 0.15 + 1e-6; u += 1.4) bx(a, f, u, u + 0.8, th, th + 0.9, ...ob(0.6 + pr - 0.2, 0.9 + pr));
        flatc(c, "#16140f"); bx(a, f, m - 0.07, m + 0.07, 2.4, 3.6, ...ob(0.74 + pr, 0.77 + pr));
        flatc(c, "#7a2a22"); bx(a, f, m - 0.75, m + 0.75, th - 3.6, th - 0.6, ...ob(0.78 + pr, 0.84 + pr));        // banner: Annvyr red
        flatc(c, "#c9a45a"); bx(a, f, m - 0.75, m + 0.75, th - 1.0, th - 0.82, ...ob(0.84 + pr, 0.86 + pr)); bx(a, f, m - 0.12, m + 0.12, th - 3.2, th - 1.2, ...ob(0.84 + pr, 0.86 + pr));   // gold band, gold pale
        flatc(c, "#3b3a36"); bx(a, f, m - 0.9, m + 0.9, th - 0.62, th - 0.52, ...ob(0.78 + pr, 0.95 + pr));     // iron hanging bar
      }
    }
    if (D <= 2 && L > 12) {   // a notice board on the inner face, mid-run
      const m = u0 + L * 0.5;
      paint(c, OAK, WOOD); bx(a, f, m - 0.9, m + 0.9, 1.3, 2.5, ...ob(-0.86, -0.78)); bx(a, f, m - 1.0, m + 1.0, 2.5, 2.62, ...ob(-0.95, -0.75));
      flatc(c, "oklch(0.88 0.03 85)"); bx(a, f, m - 0.7, m - 0.15, 1.6, 2.3, ...ob(-0.88, -0.86)); bx(a, f, m + 0.05, m + 0.65, 1.5, 2.1, ...ob(-0.88, -0.86));
    }
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const cx = 40 * sx, cz = 40 * sz;
    paint(c, FS, STONE);
    BX(c, cx - 3, -3, cz - 3, cx + 3, 8.2, cz + 3);
    if (D <= 3) { BX(c, cx - 3.3, -3, cz - 3.3, cx + 3.3, 0.7, cz + 3.3); BX(c, cx - 3.3, 7.8, cz - 3.3, cx + 3.3, 8.2, cz + 3.3); }
    if (D <= 2) {
      MERL(c, cx - 3.3, cz - 3.3, cx + 3.3, cz + 3.3, 8.2, 0.5, 0.95, 0.9, 0.75);
      flatc(c, "#16140f");
      for (const y of [3.8, 6.0]) { for (const xf of [cx - 3, cx + 3]) BX(c, xf - 0.03, y, cz - 0.08, xf + 0.03, y + 1.2, cz + 0.08);
        for (const zf of [cz - 3, cz + 3]) BX(c, cx - 0.08, y, zf - 0.03, cx + 0.08, y + 1.2, zf + 0.03); }
    }
  }
  for (const T of GATES) gatehouse(xf(c, T), D);
}
// one gatehouse drawn at the east gate; GATES turns it to the south and west gates too
function gatehouse(c, D) {
  // gatehouse: two piers and a vault of strips over the passage
  paint(c, FS, STONE);
  BX(c, GX0, -3, -6, GX1, GH, -2); BX(c, GX0, -3, 2, GX1, GH, 6);
  const N = D <= 2 ? 16 : 6, arc = (t, r1, r2) => [-Math.cos(t) * r1, 2.7 + Math.sin(t) * r2];
  for (let i = 0; i < N; i++) {
    const [z0, y0] = arc(Math.PI * i / N, 2, 1.8), [z1, y1] = arc(Math.PI * (i + 1) / N, 2, 1.8);
    HX(c, [[GX0, y0, z0], [GX1, y0, z0], [GX1, y1, z1], [GX0, y1, z1], [GX0, GH, z0], [GX1, GH, z0], [GX1, GH, z1], [GX0, GH, z1]]);
  }
  if (D <= 3) { BX(c, GX0 - 0.3, -3, -6.3, GX1 + 0.3, 0.6, -2); BX(c, GX0 - 0.3, -3, 2, GX1 + 0.3, 0.6, 6.3); BX(c, GX0 - 0.3, 7.9, -6.3, GX1 + 0.3, GH, 6.3); }
  if (D <= 2) {
    MERL(c, GX0 - 0.3, -6.3, GX1 + 0.3, 6.3, GH, 0.5, 1.0, 0.9, 0.8);
    // voussoir ring on both faces, keystone proud
    paint(c, FS, "oklch(0.9 0.012 80)");
    const M = 11;
    for (let i = 0; i < M; i++) {
      const ta = Math.PI * i / M + 0.012, tb = Math.PI * (i + 1) / M - 0.012, key = i === 5 ? 0.25 : 0;
      const [zi0, yi0] = arc(ta, 2, 1.8), [zi1, yi1] = arc(tb, 2, 1.8), [zo0, yo0] = arc(ta, 2.5 + key, 2.3 + key), [zo1, yo1] = arc(tb, 2.5 + key, 2.3 + key);
      for (const [xa, xb] of [[GX0 - 0.16 - key * 0.4, GX0], [GX1, GX1 + 0.16 + key * 0.4]])
        HX(c, [[xa, yi0, zi0], [xb, yi0, zi0], [xb, yi1, zi1], [xa, yi1, zi1], [xa, yo0, zo0], [xb, yo0, zo0], [xb, yo1, zo1], [xa, yo1, zo1]]);
    }
    for (const s of [-1, 1]) for (const x of [GX0 - 0.12, GX1]) BX(c, x, 2.45, s * 2.0 - 0.3, x + 0.12, 2.7, s * 2.0 + 0.3); // imposts
  }
  // the gate leaves, swung open flat against the gatehouse's inner face
  for (const s of [-1, 1]) {
    const z0 = s > 0 ? 2.05 : -4.05, z1 = s > 0 ? 4.05 : -2.05;
    paint(c, OAK, WOOD);
    if (D <= 2) for (let k = 0; k < 5; k++) { const pz = z0 + k * 0.4; BX(c, 37.24, 0.05, pz + 0.008, 37.46, 4.1 - Math.abs(k - (s > 0 ? 0 : 4)) * 0.05, pz + 0.392); }
    else BX(c, 37.24, 0.05, z0, 37.46, 4.0, z1);
    if (D <= 3) { paint(c, IR, IRONC); for (const y of [0.5, 2.0, 3.5]) BX(c, 37.19, y, z0 + 0.05, 37.24, y + 0.12, z1 - 0.05);
      for (const y of [0.55, 3.55]) BX(c, 37.3, y, s * 2.0 - 0.05, 37.5, y + 0.1, s * 2.0 + 0.05); }
  }
  // banner over the arch: rust cloth, ochre lantern-diamond
  if (D <= 3) {
    paint(c, OAK, WOOD); LA(c, 37.33, 7.95, -0.9, [[0.035, 0], [0.035, 1.8]], 6, true, "x");
    flatc(c, "#a8452e"); c.roughness(0.9); BX(c, 37.41, 5.3, -0.7, 37.44, 7.92, 0.7);
    flatc(c, "#c9a45a"); BX(c, 37.4, 5.3, -0.7, 37.445, 5.45, 0.7); RB(c, 37.405, 6.75, 0, 0.03, 0.6, 0.6, 0, 45, 0);
    flatc(c, "#2f3d52"); RB(c, 37.4, 6.75, 0, 0.03, 0.3, 0.3, 0, 45, 0); c.roughness(null);
  }
  // torch brackets either side of the arch
  for (const s of [-1, 1]) {
    const z = 5 * s;
    paint(c, IR, IRONC); BX(c, 37.42, 2.85, z - 0.1, 37.5, 3.45, z + 0.1); RB(c, 37.27, 3.17, z, 0.46, 0.05, 0.05, 0, 0, -15);
    LA(c, 37.05, 3.18, z, [[0.035, 0], [0.09, 0.13]], 8, true);
    paint(c, OAK, WOOD); CY(c, 37.05, 3.1, z, 0.035, 0.25, 6);
    flatc(c, "#2b2016"); CY(c, 37.05, 3.33, z, 0.052, 0.12, 6);
  }
}
export function collider(c) {
  const b = CB();
  if (c.params?.razed) return b.list;
  b(-37, -3, -40.75, -20, 6, -39.25); b(-8, -3, -40.75, 37, 6, -39.25); b(-37, -3, 39.25, -6, 6, 40.75); b(6, -3, 39.25, 37, 6, 40.75); b(-40.75, -3, -37, -39.25, 6, -6); b(-40.75, -3, 6, -39.25, 6, 37);
  b(39.25, -3, -37, 40.75, 6, -6); b(39.25, -3, 6, 40.75, 6, 37);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) b(40 * sx - 3.3, -3, 40 * sz - 3.3, 40 * sx + 3.3, 9.2, 40 * sz + 3.3);
  for (const T of GATES) { const g = (x0, y0, z0, x1, y1, z1) => { const p = T(x0, y0, z0), q = T(x1, y1, z1); b(Math.min(p[0], q[0]), y0, Math.min(p[2], q[2]), Math.max(p[0], q[0]), y1, Math.max(p[2], q[2])); };
    g(GX0 - 0.3, -3, -6.3, GX1 + 0.3, 9.5, -2); g(GX0 - 0.3, -3, 2, GX1 + 0.3, 9.5, 6.3); g(GX0, 4.5, -2, GX1, 9.5, 2);
    g(37.19, 0, 2.05, 37.46, 4.1, 4.05); g(37.19, 0, -4.05, 37.46, 4.1, -2.05); }
  return b.list;
}
