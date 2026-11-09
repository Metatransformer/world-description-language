import { grown, growBoxes } from "../lib/roomy.js";
// The Mages Guild interior of Valenfeld (place mages-guild): a slate-and-brass guildhall behind the tower door.
// Local origin = the atrium's floor centre; north is -z. Door in the atrium's south wall (z 5.2).
//   ATRIUM   x -6..6,    z -5..5.2, ceiling 7.5 — the summoning circle at (0, 0.3), a brass chandelier, banners.
//   LIBRARY  x -15..-6.4 (west), ceiling 6 — tall shelves, ladders, reading desks, the chained book.
//   ALCHEMY  x 6.4..13.4, z -5..1.8 (east, ground) — bench, retorts, cauldron, drying herbs, the scorch mark.
//   STAIR    x 6.4..13.4, z 2.2..5.2 — two switchback flights per storey, 0.18 rise / 0.28 tread.
//   DORM     over the alchemy room at y 3.96 — four narrow beds, wardrobes, the unread scroll pile.
//   STUDY    the top, y 7.92 — Ilsevel's big bed, star chart, telescope at the east window, a locked chest.
import { paint, flatc, glow, BX, RB, LA, SEG, PIPE, CB, OAK, PL, IR, HAY, CANVAS } from "../lib/buildkit.js";
import { shelf_magesHall } from "../lib/pieces/shelf.js";   // shared shelf piece, drawn in this building's palette
import { sconce_magesHall } from "../lib/pieces/sconce.js";   // shared sconce piece, drawn in this building's palette
import { banner_magesHall } from "../lib/pieces/banner.js";   // shared banner piece, drawn in this building's palette
import { bench_magesHall } from "../lib/pieces/bench.js";   // shared bench piece, drawn in this building's palette

export const F1 = 3.96, F2 = 7.92;
const FLAG = "cdn/texture-worn-flagstone-floor.png", FST = "cdn/texture-fieldstone-wall-mossy.png";
const STONEC = "oklch(0.92 0.01 90)", WOODC = "oklch(0.9 0.02 70)", PLAST = "oklch(0.8 0.045 250)", CEILC = "oklch(0.9 0.02 240)";
const BRASS = "#c9a45a", SLATE = "#2f3d52", PARCH = "oklch(0.88 0.045 85)", WAX = "oklch(0.93 0.03 90)", IRONC = "oklch(0.85 0.005 250)";
const BOOKS = ["#6e2a1e", "#7a5a2a", "#3c5238", "#2a3650", "#4a3a2a", "#5a2430", "#8a7448", "#3b3a36", "#2f3d52"];
const D = Math.PI / 180;

// ---------- the plan: walls (shared by mesh and collider), holes = [l0, l1, y0, y1] along the wall ----------
const H_EXIT = [-0.85, 0.85, 0, 2.75], H_LIB = [-0.7, 0.7, 0, 2.45], H_ALC = [-2.0, -0.6, 0, 2.4], H_STAIR = [3.75, 5.1, 0, 2.45];
const H_DORM = [6.5, 7.7, F1, F1 + 2.4], H_STUDY = [6.5, 7.7, F2, F2 + 2.4];
const W_ALC = [-3.0, -2.2, 1.8, 2.8], W_DORM = [-2.0, -1.0, F1 + 1.2, F1 + 2.4], W_STUDY = [-2.2, -0.6, F2 + 1.0, F2 + 2.6];
const WALLS = [
  { ax: "x", a: [5.2, 5.6], l: [-15.4, -6], y: 6.3 }, { ax: "x", a: [5.2, 5.6], l: [-6, 6], y: 7.8, h: [H_EXIT] }, { ax: "x", a: [5.2, 5.6], l: [6, 13.8], y: 11.8 },
  { ax: "x", a: [-5.4, -5], l: [-15.4, -6], y: 6.3 }, { ax: "x", a: [-5.4, -5], l: [-6, 6], y: 7.8 }, { ax: "x", a: [-5.4, -5], l: [6, 13.8], y: 11.8 },
  { ax: "z", a: [-15.4, -15], l: [-5, 5.2], y: 6.3 },
  { ax: "z", a: [-6.4, -6], l: [-5, 5.2], y: 7.8, h: [H_LIB] },
  { ax: "z", a: [6, 6.4], l: [-5, 5.2], y: 11.8, h: [H_ALC, H_STAIR] },
  { ax: "z", a: [13.4, 13.8], l: [-5, 5.2], y: 11.8, h: [W_ALC, W_DORM, W_STUDY] },
  { ax: "x", a: [1.8, 2.2], l: [6.4, 13.4], y: 11.5, h: [H_DORM, H_STUDY] },
];
// a wall slab split around its holes; out(x0,y0,z0,x1,y1,z1)
function wall(out, ax, a0, a1, l0, l1, y0, y1, holes = []) {
  const B = (p0, p1, q0, q1) => { if (p1 - p0 < 1e-3 || q1 - q0 < 1e-3) return; ax === "x" ? out(p0, q0, a0, p1, q1, a1) : out(a0, q0, p0, a1, q1, p1); };
  // cut along the wall at every hole edge; each strip stands solid between the openings stacked over it
  const cuts = [...new Set([l0, l1, ...holes.flatMap((h) => [h[0], h[1]]).filter((v) => v > l0 && v < l1)])].sort((a, b) => a - b);
  for (let i = 0; i < cuts.length - 1; i++) {
    const s0 = cuts[i], s1 = cuts[i + 1], mid = (s0 + s1) / 2;
    const open = holes.filter((h) => h[0] < mid && h[1] > mid).map((h) => [Math.max(h[2], y0), Math.min(h[3], y1)]).filter((h) => h[1] > h[0]).sort((a, b) => a[0] - b[0]);
    let y = y0; for (const [o0, o1] of open) { B(s0, s1, y, o0); y = Math.max(y, o1); } B(s0, s1, y, y1);
  }
}
const ROOMS = {
  atrium: { x: [-6, 6], z: [-5, 5.2], y: 0, h: 7.5, holes: { S: [H_EXIT], W: [H_LIB], E: [H_ALC, H_STAIR] }, base: "stone" },
  library: { x: [-15, -6.4], z: [-5, 5.2], y: 0, h: 6, holes: { E: [H_LIB] }, base: "oak" },
  alchemy: { x: [6.4, 13.4], z: [-5, 1.8], y: 0, h: 3.6, holes: { W: [H_ALC], E: [W_ALC] }, base: "stone" },
  stair: { x: [6.4, 13.4], z: [2.2, 5.2], y: 0, h: 11.5, holes: { W: [H_STAIR], N: [H_DORM, H_STUDY] }, base: "stone" },
  dorm: { x: [6.4, 13.4], z: [-5, 1.8], y: F1, h: 3.54, holes: { S: [H_DORM], E: [W_DORM] }, base: "oak" },
  study: { x: [6.4, 13.4], z: [-5, 1.8], y: F2, h: 3.58, holes: { S: [H_STUDY], E: [W_STUDY] }, base: "oak" },
};
// stairs: steps k = 1..44, tops k*0.18; A/C run +x on the south half, B/D run -x on the north half
const SX0 = 7.8, SX1 = 10.6, ZS = [3.75, 5.2], ZN = [2.2, 3.65];
function stairBoxes(out) {
  for (let k = 1; k <= 10; k++) out(SX0 + (k - 1) * 0.28, 0, ZS[0], SX0 + k * 0.28, k * 0.18, ZS[1]);           // A, solid
  out(SX1, 0, 2.2, 13.4, 11 * 0.18, 5.2);                                                                      // landing 1, solid
  for (let k = 12; k <= 21; k++) out(SX1 - (k - 11) * 0.28, 0, ZN[0], SX1 - (k - 12) * 0.28, k * 0.18, ZN[1]); // B, solid
  out(6.4, F1 - 0.3, 2.2, SX0, F1, 5.2);                                                                       // first-floor landing (a slab, the ground passes under)
  for (let k = 23; k <= 32; k++) out(SX0 + (k - 23) * 0.28, k * 0.18 - 0.3, ZS[0], SX0 + (k - 22) * 0.28, k * 0.18, ZS[1]); // C
  out(SX1, 33 * 0.18 - 0.3, 2.2, 13.4, 33 * 0.18, 5.2);                                                        // landing 2
  for (let k = 34; k <= 43; k++) out(SX1 - (k - 33) * 0.28, k * 0.18 - 0.3, ZN[0], SX1 - (k - 34) * 0.28, k * 0.18, ZN[1]); // D
  out(6.4, F2 - 0.3, 2.2, SX0, F2, ZN[1]);                                                                     // top landing
}
function slabs(out) {
  out(-15.4, -0.25, -5.4, 13.8, 0, 5.6);
  out(-15, 6, -5, -6.4, 6.3, 5.2); out(-6, 7.5, -5, 6, 7.8, 5.2);
  out(6.4, 3.6, -5, 13.4, F1, 1.8); out(6.4, 7.5, -5, 13.4, F2, 1.8); out(6.4, 11.5, -5, 13.4, 11.8, 5.2);
  out(6.4, F2, 3.65, SX0, F2 + 1.0, 3.75);                // top-landing rail
  out(SX0, 0, 3.65, SX1, 11.5, 3.75);                     // the spine wall between the flights
}

// ---------- local frames for furniture ----------
const G = (ox, oy, oz, yaw = 0) => ({ ox, oy, oz, c: Math.cos(yaw * D), s: Math.sin(yaw * D), yaw });
const gp = (g, x, y, z) => [g.ox + x * g.c + z * g.s, g.oy + y, g.oz - x * g.s + z * g.c];
function gb(c, g, x0, y0, z0, x1, y1, z1, pitch = 0, roll = 0) {
  const p = gp(g, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  RB(c, p[0], p[1], p[2], Math.abs(x1 - x0), Math.abs(y1 - y0), Math.abs(z1 - z0), g.yaw, pitch, roll);
}
function gsolid(f, g, x0, y0, z0, x1, y1, z1) { const a = gp(g, x0, y0, z0), b = gp(g, x1, y1, z1); f(a[0], a[1], a[2], b[0], b[1], b[2]); }
function m(c, tex, col, rough = 0.85, metal = 0) { c.albedo(tex ?? null); c.color(col); c.emissive(null); c.roughness(rough); c.metalness(metal); }
const brass = (c) => m(c, null, BRASS, 0.35, 0.65);
const rng = (seed) => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

// ---------- shell ----------
function shell(c, L) {
  m(c, PL, PLAST, 0.9);
  for (const w of WALLS) wall((...a) => BX(c, ...a), w.ax, w.a[0], w.a[1], w.l[0], w.l[1], 0, w.y, w.h);
  // floors
  m(c, FLAG, STONEC); BX(c, -6, -0.25, -5, 6, 0, 5.2); BX(c, 6.4, -0.25, -5, 13.4, 0, 5.2);
  BX(c, -6.4, -0.25, -0.7, -6, 0.0, 0.7); BX(c, 6, -0.25, -2, 6.4, 0, -0.6); BX(c, 6, -0.25, 3.75, 6.4, 0, 5.1); BX(c, -0.85, -0.25, 5.2, 0.85, 0, 5.6);
  m(c, OAK, WOODC); BX(c, -15, -0.25, -5, -6.4, 0, 5.2);
  BX(c, 6.4, 3.62, -5, 13.4, F1, 1.8); BX(c, 6.4, 7.58, -5, 13.4, F2, 1.8);
  // ceilings
  m(c, PL, CEILC, 0.95);
  BX(c, -15, 6, -5, -6.4, 6.3, 5.2); BX(c, -6, 7.5, -5, 6, 7.8, 5.2);
  BX(c, 6.4, 3.6, -5, 13.4, 3.62, 1.8); BX(c, 6.4, 7.5, -5, 13.4, 7.58, 1.8); BX(c, 6.4, 11.5, -5, 13.4, 11.8, 5.2);
  if (L >= 4) return;
  // ceiling beams, smoke-dark oak
  m(c, OAK, "oklch(0.7 0.03 60)");
  for (let x = -14.2; x < -6.5; x += 1.7) BX(c, x - 0.12, 5.72, -5, x + 0.12, 6, 5.2);
  for (const [y, top] of [[3.32, 3.6], [7.22, 7.5], [11.22, 11.5]]) for (let z = -4.2; z < 1.8; z += 1.6) BX(c, 6.4, y, z - 0.12, 13.4, top, z + 0.12);
  for (let x = -4.5; x <= 4.6; x += 3) BX(c, x - 0.16, 7.1, -5, x + 0.16, 7.5, 5.2);
  for (let z = -3.4; z <= 4; z += 2.6) BX(c, -6, 7.18, z - 0.13, 6, 7.5, z + 0.13);
  // trims per room: wainscot band, brass-capped rail, cornice; door frames
  for (const r of Object.values(ROOMS)) trim(c, r);
  m(c, OAK, WOODC);
  frameHole(c, "x", 5.2, 5.6, H_EXIT); frameHole(c, "z", -6.4, -6, H_LIB); frameHole(c, "z", 6, 6.4, H_ALC); frameHole(c, "z", 6, 6.4, H_STAIR);
  frameHole(c, "x", 1.8, 2.2, H_DORM); frameHole(c, "x", 1.8, 2.2, H_STUDY);
  for (const w of [W_ALC, W_DORM, W_STUDY]) { frameHole(c, "z", 13.4, 13.8, w, true); }
}
function trim(c, r) {
  const [x0, x1] = r.x, [z0, z1] = r.z, y = r.y, H = r.holes, t = 0.06;
  const faces = [["x", z0, z0 + t, x0, x1, H.N], ["x", z1 - t, z1, x0, x1, H.S], ["z", x0, x0 + t, z0, z1, H.W], ["z", x1 - t, x1, z0, z1, H.E]];
  for (const [ax, a0, a1, l0, l1, holes] of faces) {
    if (r.base === "stone") m(c, FST, STONEC); else m(c, OAK, "oklch(0.78 0.03 60)");
    wall((...a) => BX(c, ...a), ax, a0, a1, l0, l1, y, y + 1.1, holes);
    m(c, OAK, "oklch(0.72 0.03 60)");
    const wide = (b0, b1) => ax === "x" ? [a0 - (a0 === z0 ? 0 : 0.03), a1 + (a0 === z0 ? 0.03 : 0)] : [a0 - (a0 === x0 ? 0 : 0.03), a1 + (a0 === x0 ? 0.03 : 0)];
    const [w0, w1] = wide();
    wall((...a) => BX(c, ...a), ax, w0, w1, l0, l1, y + 1.1, y + 1.2, holes);
    wall((...a) => BX(c, ...a), ax, w0, w1, l0, l1, y + r.h - 0.2, y + r.h, holes);
    brass(c); wall((...a) => BX(c, ...a), ax, w0, w1, l0, l1, y + 1.2, y + 1.23, holes);
  }
}
function frameHole(c, ax, a0, a1, [h0, h1, y0, y1], win) {
  const o = (p0, q0, p1, q1, e = 0.06) => ax === "x" ? BX(c, p0, q0, a0 - e, p1, q1, a1 + e) : BX(c, a0 - e, q0, p0, a1 + e, q1, p1);
  m(c, OAK, "oklch(0.75 0.03 60)");
  o(h0 - 0.16, y0, h0, y1 + 0.02); o(h1, y0, h1 + 0.16, y1 + 0.02); o(h0 - 0.22, y1, h1 + 0.22, y1 + 0.24);
  if (win) { o(h0 - 0.1, y0 - 0.1, h1 + 0.1, y0, 0.12); m(c, IR, IRONC, 0.5, 0.5); o((h0 + h1) / 2 - 0.025, y0, (h0 + h1) / 2 + 0.025, y1, -0.15); o(h0, (y0 + y1) / 2 - 0.025, h1, (y0 + y1) / 2 + 0.025, -0.15); }
  else { brass(c); o((h0 + h1) / 2 - 0.12, y1 + 0.06, (h0 + h1) / 2 + 0.12, y1 + 0.2, 0.09); }
}
function stairsMesh(c, L) {
  m(c, FST, STONEC); stairBoxes((...a) => BX(c, ...a));
  m(c, OAK, "oklch(0.78 0.03 60)"); // oak treads nosed over the stone
  const tread = (x0, x1, y, z0, z1) => BX(c, x0 - 0.03, y - 0.04, z0, x1 + 0.03, y + 0.01, z1);
  for (let k = 1; k <= 43; k++) {
    if (k === 11 || k === 22 || k === 33) continue;
    const up = k <= 10 || (k >= 23 && k <= 32), i = up ? (k <= 10 ? k - 1 : k - 23) : (k <= 21 ? k - 12 : k - 34);
    const x0 = up ? SX0 + i * 0.28 : SX1 - (i + 1) * 0.28; tread(x0, x0 + 0.28, k * 0.18, up ? ZS[0] : ZN[0], up ? ZS[1] : ZN[1]);
  }
  m(c, FST, "oklch(0.86 0.015 250)"); BX(c, SX0, 0, 3.65, SX1, 11.5, 3.75);
  m(c, OAK, WOODC); BX(c, 6.4, F2 + 0.9, 3.65, SX0, F2 + 1.0, 3.75);
  for (let x = 6.55; x < SX0; x += 0.3) BX(c, x - 0.03, F2, 3.67, x + 0.03, F2 + 0.9, 3.73);
  if (L >= 3) return;
  brass(c); // brass handrail along the spine, both sides, both storeys
  for (const [z, s] of [[3.6, -1], [3.8, 1]]) for (const base of [0, F1]) {
    const yA = s > 0 ? base + 0.18 : base + 12 * 0.18, yB = s > 0 ? base + 10 * 0.18 : base + 21 * 0.18;
    const xa = s > 0 ? SX0 : SX1, xb = s > 0 ? SX1 : SX0;
    PIPE(c, [xa, yA + 0.9, z], [xb, yB + 0.9, z], 0.03, 0.03, 6);
  }
}

// ---------- the atrium ----------
function ring(c, cx, cz, y, r0, r1, n = 48, a0 = 0, a1 = 360) {
  for (let k = 0; k < n; k++) { const a = (a0 + (a1 - a0) * k / n) * D, b = (a0 + (a1 - a0) * (k + 1) / n) * D;
    c.quad(cx + r0 * Math.sin(a), y, cz + r0 * Math.cos(a), cx + r1 * Math.sin(a), y, cz + r1 * Math.cos(a), cx + r1 * Math.sin(b), y, cz + r1 * Math.cos(b), cx + r0 * Math.sin(b), y, cz + r0 * Math.cos(b)); }
}
function flatLine(c, a, b, y, w) { const dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1, nx = -dz / l * w / 2, nz = dx / l * w / 2;
  c.quad(a[0] + nx, y, a[1] + nz, b[0] + nx, y, b[1] + nz, b[0] - nx, y, b[1] - nz, a[0] - nx, y, a[1] - nz); }
function summoningCircle(c, L) {
  const cz = 0.3;
  m(c, FST, "oklch(0.72 0.03 250)"); LA(c, 0, 0, cz, [[2.05, 0], [2.05, 0.04], [1.85, 0.06]], 24, false, "y", false);
  m(c, null, "oklch(0.25 0.03 250)", 0.6); ring(c, 0, cz, 0.061, 0, 1.85, 32);
  glow(c, "oklch(0.35 0.08 250)", [0.45, 1.15, 3.2]); c.roughness(0.4);
  ring(c, 0, cz, 0.07, 1.62, 1.7); ring(c, 0, cz, 0.07, 1.36, 1.4); ring(c, 0, cz, 0.07, 0.5, 0.55, 24);
  const pts = []; for (let k = 0; k < 7; k++) { const a = k * 360 / 7 * D; pts.push([1.36 * Math.sin(a), cz + 1.36 * Math.cos(a)]); }
  for (let k = 0; k < 7; k++) flatLine(c, pts[k], pts[(k + 3) % 7], 0.072, 0.05);
  if (L <= 2) for (let k = 0; k < 28; k++) { // runes between the rings
    const a = (k + 0.5) * 360 / 28, r = 1.52, g = G(r * Math.sin(a * D), 0.07, cz + r * Math.cos(a * D), a), s = (k * 7) % 5;
    gb(c, g, -0.05, 0, -0.012, 0.05, 0.004, 0.012); gb(c, g, (s - 2) * 0.02 - 0.01, 0, -0.07, (s - 2) * 0.02 + 0.01, 0.004, 0.07);
    if (s % 2) gb(c, g, -0.04, 0, 0.04, 0.04, 0.004, 0.06);
  }
  // seven brass candle-posts at the heptagram's points
  for (const [x, z] of pts) { const px = x * 1.38, pz = cz + (z - cz) * 1.38; brass(c); PIPE(c, [px, 0, pz], [px, 0.62, pz], 0.035, 0.025, 6); LA(c, px, 0.62, pz, [[0.07, 0], [0.07, 0.03], [0, 0.03]], 8);
    m(c, null, WAX, 0.7); LA(c, px, 0.65, pz, [[0.03, 0], [0.03, 0.1], [0.025, 0.12], [0, 0.12]], 6); glow(c, "oklch(0.95 0.08 80)", [3.2, 1.7, 0.5]); RB(c, px, 0.8, pz, 0.025, 0.05, 0.025); }
}
function chandelier(c) {
  const y = 5.3; brass(c);
  for (let k = 0; k < 16; k++) { const a = k / 16 * 2 * Math.PI, b = (k + 1) / 16 * 2 * Math.PI; SEG(c, [1.1 * Math.sin(a), y, 1.1 * Math.cos(a)], [1.1 * Math.sin(b), y, 1.1 * Math.cos(b)], 0.07, 0.06); }
  for (let k = 0; k < 4; k++) { const a = (k / 4 + 0.125) * 2 * Math.PI; SEG(c, [1.1 * Math.sin(a), y, 1.1 * Math.cos(a)], [0, 7.5, 0], 0.025, 0.025); SEG(c, [1.1 * Math.sin(a), y, 1.1 * Math.cos(a)], [0, y - 0.2, 0], 0.03, 0.03); }
  LA(c, 0, y - 0.45, 0, [[0, 0], [0.12, 0.1], [0.08, 0.3], [0, 0.4]], 8);
  for (let k = 0; k < 8; k++) { const a = k / 8 * 2 * Math.PI, x = 1.1 * Math.sin(a), z = 1.1 * Math.cos(a); brass(c); LA(c, x, y + 0.03, z, [[0.06, 0], [0.06, 0.02], [0, 0.02]], 6);
    m(c, null, WAX, 0.7); LA(c, x, y + 0.05, z, [[0.035, 0], [0.035, 0.16], [0, 0.17]], 6); glow(c, "oklch(0.95 0.08 80)", [3.2, 1.7, 0.5]); RB(c, x, y + 0.25, z, 0.03, 0.06, 0.03); }
}
function atrium(c, L) {
  summoningCircle(c, L); chandelier(c);
  // runner from the door to the circle
  m(c, CANVAS, "oklch(0.55 0.08 25)", 0.95); BX(c, -0.8, 0, 2.1, 0.8, 0.015, 5.1); m(c, null, BRASS, 0.6); BX(c, -0.8, 0.002, 2.1, -0.7, 0.017, 5.1); BX(c, 0.7, 0.002, 2.1, 0.8, 0.017, 5.1);
  // pilasters
  for (const x of [-4.5, 4.5]) for (const z of [-4.99, 5.19]) { const s = z < 0 ? 1 : -1; m(c, FST, STONEC); BX(c, x - 0.35, 0, z, x + 0.35, 7.1, z + s * 0.25); brass(c); BX(c, x - 0.4, 6.9, z, x + 0.4, 7.1, z + s * 0.3); BX(c, x - 0.4, 1.1, z, x + 0.4, 1.2, z + s * 0.29); }
  banner(c, -2.4, -4.98, 0, L); banner(c, 2.4, -4.98, 0, L);
  if (L >= 3) return;
  // the guild seal over the north wall
  const g = G(0, 0, -4.98, 0); brass(c);
  for (let k = 0; k < 24; k++) { const a = k / 24 * 2 * Math.PI, b = (k + 1) / 24 * 2 * Math.PI; SEG(c, gp(g, Math.sin(a) * 1.1, 5.6 + Math.cos(a) * 1.1, 0.06), gp(g, Math.sin(b) * 1.1, 5.6 + Math.cos(b) * 1.1, 0.06), 0.09, 0.08); }
  glow(c, "oklch(0.4 0.1 250)", [0.3, 0.75, 2.2]); LA(c, 0, 5.6, -4.92, [[0.32, 0], [0.22, 0.08], [0, 0.1]], 10, false, "y");
  m(c, FST, STONEC); BX(c, -0.9, 5.45, -5, 0.9, 5.75, -4.9);
  // benches against the east and west walls, sconces above
  for (const [x, yaw] of [[-5.55, 90], [5.55, -90]]) for (const z of [-3.2, 2.0]) { if (x > 0 && z > 1) continue; bench(c, G(x, 0, z, yaw)); }
  for (const [x, z, yaw] of [[-5.98, -2.5, 90], [-5.98, 2.6, 90], [5.98, 1.6, -90], [5.98, -3.6, -90]]) sconce(c, G(x, 0, z, yaw));
  // Ilsevel's lectern before the circle
  lectern(c, G(0, 0, -3.9, 0), false);
}
function lectern(c, g, chained) {
  m(c, OAK, WOODC); gb(c, g, -0.3, 0, -0.25, 0.3, 0.08, 0.25); gb(c, g, -0.07, 0.08, -0.07, 0.07, 1.0, 0.07);
  gb(c, g, -0.34, 1.0, -0.24, 0.34, 1.06, 0.24, 20); gb(c, g, -0.34, 1.0, 0.2, 0.34, 1.12, 0.26, 20);
  // an open book on the slope
  m(c, null, chained ? "#4a2a1e" : SLATE, 0.8); gb(c, g, -0.3, 1.07, -0.2, 0.3, 1.1, 0.18, 20);
  m(c, null, PARCH, 0.9); gb(c, g, -0.28, 1.1, -0.18, -0.01, 1.14, 0.16, 20, -4); gb(c, g, 0.01, 1.1, -0.18, 0.28, 1.14, 0.16, 20, 4);
  if (!chained) return;
  m(c, IR, IRONC, 0.45, 0.6); // the chain: from the spine down to a ring bolted on the post
  const a = gp(g, 0.3, 1.1, 0.0), b = gp(g, 0.07, 0.6, 0.0);
  for (let i = 0; i < 9; i++) { const t0 = i / 9, t1 = (i + 1) / 9, sag = (t) => Math.sin(t * Math.PI) * 0.12;
    const p0 = [a[0] + (b[0] - a[0]) * t0, a[1] + (b[1] - a[1]) * t0 - sag(t0), a[2] + (b[2] - a[2]) * t0 + sag(t0) * 0.4], p1 = [a[0] + (b[0] - a[0]) * t1, a[1] + (b[1] - a[1]) * t1 - sag(t1), a[2] + (b[2] - a[2]) * t1 + sag(t1) * 0.4];
    SEG(c, p0, p1, i % 2 ? 0.035 : 0.012, i % 2 ? 0.012 : 0.035); }
  gb(c, g, 0.06, 0.55, -0.04, 0.1, 0.65, 0.04); gb(c, g, 0.28, 1.05, -0.06, 0.34, 1.15, 0.06, 20);
}

// ---------- the library ----------
function ladder(c, g, h) { m(c, OAK, WOODC); const lean = 0.5;
  for (const s of [-0.22, 0.22]) SEG(c, gp(g, s, 0, lean), gp(g, s, h, 0.02), 0.06, 0.04);
  for (let y = 0.3; y < h - 0.1; y += 0.32) { const zz = lean * (1 - y / h) + 0.02 * (y / h); SEG(c, gp(g, -0.22, y, zz), gp(g, 0.22, y, zz), 0.035, 0.035); }
  m(c, IR, IRONC, 0.5, 0.5); gb(c, g, -0.26, h - 0.05, -0.06, 0.26, h + 0.02, 0.04); }
function desk(c, g, L, f, papers = true) {
  if (f) return gsolid(f, g, -0.8, 0, -0.45, 0.8, 0.8, 0.45);
  m(c, OAK, WOODC); gb(c, g, -0.8, 0.74, -0.45, 0.8, 0.8, 0.45);
  for (const [x, z] of [[-0.72, -0.37], [0.72, -0.37], [-0.72, 0.37], [0.72, 0.37]]) gb(c, g, x - 0.04, 0, z - 0.04, x + 0.04, 0.74, z + 0.04);
  gb(c, g, -0.7, 0.62, -0.38, 0.7, 0.74, 0.38); brass(c); gb(c, g, -0.06, 0.66, 0.38, 0.06, 0.69, 0.4);
  if (!papers || L >= 3) return;
  m(c, null, PARCH, 0.9); gb(c, g, -0.5, 0.8, -0.2, -0.1, 0.806, 0.1, 0, 0); gb(c, g, -0.42, 0.806, -0.25, -0.04, 0.81, 0.05);
  m(c, null, "#5a2430", 0.8); gb(c, g, 0.05, 0.8, -0.25, 0.4, 0.86, 0.02); m(c, null, "#2a3650", 0.8); gb(c, g, 0.08, 0.86, -0.22, 0.38, 0.9, 0.0);
  m(c, null, "#1c1a18", 0.4); const ink = gp(g, -0.6, 0.8, 0.25); LA(c, ink[0], ink[1], ink[2], [[0.035, 0], [0.04, 0.05], [0.02, 0.07], [0, 0.07]], 6);
  m(c, null, "oklch(0.95 0.01 90)", 0.9); SEG(c, gp(g, -0.6, 0.86, 0.25), gp(g, -0.52, 1.05, 0.22), 0.01, 0.03);
}
function chair(c, g) { m(c, OAK, WOODC); gb(c, g, -0.22, 0.44, -0.22, 0.22, 0.48, 0.22); for (const [x, z] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) gb(c, g, x - 0.025, 0, z - 0.025, x + 0.025, 0.44, z + 0.025);
  gb(c, g, -0.22, 0.48, 0.18, -0.17, 1.0, 0.22); gb(c, g, 0.17, 0.48, 0.18, 0.22, 1.0, 0.22); gb(c, g, -0.2, 0.78, 0.19, 0.2, 0.96, 0.21); }
function candleStick(c, p, h = 0.14) { brass(c); LA(c, p[0], p[1], p[2], [[0.06, 0], [0.06, 0.015], [0.02, 0.03], [0.02, 0.06], [0.04, 0.07], [0, 0.07]], 8);
  m(c, null, WAX, 0.7); LA(c, p[0], p[1] + 0.07, p[2], [[0.022, 0], [0.022, h], [0.018, h + 0.01], [0, h + 0.01]], 6); m(c, null, WAX, 0.7); RB(c, p[0] + 0.022, p[1] + 0.07 + h * 0.5, p[2], 0.01, h * 0.5, 0.012); }
export const CANDLE_SPOTS = []; // filled as candles are laid; the scene's flames sit on these (feet = wick)
function library(c, L) {
  // tall shelves: west wall (4), north & south walls (3 each), plus a free-standing double stack
  let s = 1;
  for (const z of [-3.6, -1.2, 1.4, 3.8]) shelf(c, G(-14.98, 0, z, -90), 2.2, 4.6, 8, s++, L);
  for (const x of [-13.0, -10.7, -8.4]) { shelf(c, G(x, 0, -4.98, 0), 2.1, 4.6, 8, s++, L); shelf(c, G(x, 0, 5.18, 180), 2.1, 4.6, 8, s++, L); }
  shelf(c, G(-11.6, 0, -1.6, 90), 2.4, 2.4, 4, s++, L); shelf(c, G(-11.6, 0, -1.6, -90), 2.4, 2.4, 4, s++, L);
  if (L >= 4) return;
  ladder(c, G(-14.56, 0, -2.4, -90), 4.4); ladder(c, G(-10.0, 0, -4.56, 0), 4.4); ladder(c, G(-9.0, 0, 4.76, 180), 4.4);
  // a rail along the west shelves the ladders hook onto
  brass(c); BX(c, -14.6, 4.35, -4.9, -14.54, 4.4, 5.0);
  // reading desks with chairs and candles
  desk(c, G(-9.0, 0, 0.9, 0), L); chair(c, G(-9.0, 0, 1.6, 0)); candleStick(c, [-8.4, 0.8, 0.7]);
  desk(c, G(-9.0, 0, 3.2, 180), L); chair(c, G(-9.0, 0, 2.5, 180)); candleStick(c, [-9.6, 0.8, 3.4]);
  // Corvane's desk by the door: a ledger, a bell he never rings, a sign
  desk(c, G(-7.6, 0, -2.7, 90), L, null, false); chair(c, G(-8.3, 0, -2.7, -90));
  m(c, null, "#3b3a36", 0.8); BX(c, -7.85, 0.8, -3.2, -7.35, 0.84, -2.6); m(c, null, PARCH, 0.9); BX(c, -7.82, 0.84, -3.18, -7.38, 0.86, -2.62);
  brass(c); LA(c, -7.55, 0.8, -2.15, [[0.07, 0], [0.06, 0.06], [0.03, 0.1], [0, 0.11]], 8); candleStick(c, [-7.45, 0.8, -3.4]);
  m(c, OAK, WOODC); SEG(c, [-7.8, 0.8, -2.4], [-7.8, 1.05, -2.4], 0.03, 0.03); m(c, null, PARCH, 0.9); RB(c, -7.8, 1.12, -2.4, 0.03, 0.16, 0.36, 90, 0, 0);
  m(c, null, "#5a2430", 0.9); for (const z of [-2.52, -2.42, -2.32]) RB(c, -7.83, 1.12, z, 0.01, 0.05, 0.06, 90);
  // the chained book on its lectern, a circle of brass inlay around it
  lectern(c, G(-12.8, 0, 2.4, 90), true);
  brass(c); ring(c, -12.8, 2.4, 0.006, 0.9, 0.95, 24);
  // rug
  m(c, CANVAS, SLATE, 0.95); c.albedo(null); BX(c, -10.6, 0, 0.0, -7.4, 0.012, 4.2); m(c, null, BRASS, 0.7); BX(c, -10.5, 0.002, 0.1, -7.5, 0.014, 0.2); BX(c, -10.5, 0.002, 4.0, -7.5, 0.014, 4.1);
  // a book left open on the floor, which Corvane has noticed
  m(c, null, "#7a5a2a", 0.8); RB(c, -12.3, 0.02, -3.8, 0.4, 0.03, 0.28, 30); m(c, null, PARCH, 0.9); RB(c, -12.3, 0.045, -3.8, 0.36, 0.02, 0.25, 30);
}

// ---------- the alchemy room ----------
function flask(c, x, y, z, r, h, col, em) { c.albedo(null); c.color(col, 0.8); c.roughness(0.08); c.metalness(0); c.emissive(...em);
  LA(c, x, y, z, [[0, 0], [r * 0.7, 0], [r, r * 0.6], [r * 0.9, r * 1.4], [r * 0.3, r * 1.8], [0.02, h * 0.8], [0.025, h], [0, h]], 10); c.emissive(null); }
function retort(c, x, y, z, yaw, col, em) { const g = G(x, y, z, yaw);
  m(c, IR, IRONC, 0.5, 0.6); for (const a of [0, 120, 240]) SEG(c, gp(g, 0.12 * Math.sin(a * D), 0, 0.12 * Math.cos(a * D)), gp(g, 0.07 * Math.sin(a * D), 0.18, 0.07 * Math.cos(a * D)), 0.02, 0.02);
  LA(c, x, y + 0.18, z, [[0.1, 0], [0.1, 0.015], [0, 0.015]], 8);
  c.albedo(null); c.color(col, 0.75); c.roughness(0.06); c.emissive(...em);
  LA(c, x, y + 0.19, z, [[0, 0], [0.09, 0.02], [0.12, 0.1], [0.09, 0.2], [0.03, 0.24], [0, 0.24]], 10);
  c.color("oklch(0.85 0.03 200)", 0.6); c.emissive(0.02, 0.06, 0.08);
  PIPE(c, gp(g, 0, 0.42, 0), gp(g, 0.45, 0.25, 0), 0.025, 0.012, 6); c.emissive(null);
  // a coal pan under it
  m(c, IR, IRONC, 0.5, 0.5); LA(c, x, y, z, [[0.07, 0], [0.08, 0.04], [0, 0.04]], 8); glow(c, "oklch(0.5 0.15 40)", [1.6, 0.4, 0.08]); LA(c, x, y + 0.035, z, [[0.06, 0], [0, 0.012]], 8, false);
}
function herbs(c, L) {
  m(c, OAK, WOODC); BX(c, 7.0, 3.08, -2.3, 12.8, 3.16, -2.22); BX(c, 7.0, 3.08, -0.7, 12.8, 3.16, -0.62);
  m(c, null, "oklch(0.6 0.04 70)"); for (const z of [-2.26, -0.66]) for (const x of [7.4, 12.4]) SEG(c, [x, 3.16, z], [x, 3.6, z], 0.015, 0.015);
  const r = rng(77), cols = ["oklch(0.5 0.08 130)", "oklch(0.55 0.07 110)", "oklch(0.45 0.06 145)", "oklch(0.55 0.06 80)", "oklch(0.5 0.09 30)"];
  if (L >= 3) return;
  for (const z of [-2.26, -0.66]) for (let x = 7.3; x < 12.7; x += 0.32 + r() * 0.12) {
    const len = 0.35 + r() * 0.3, top = 3.06; m(c, null, "oklch(0.75 0.04 80)"); SEG(c, [x, 3.12, z], [x, top - 0.04, z], 0.012, 0.012);
    m(c, null, cols[(r() * cols.length) | 0], 0.95);
    PIPE(c, [x, top - 0.04, z], [x + (r() - 0.5) * 0.05, top - len, z + (r() - 0.5) * 0.05], 0.025, 0.07 + r() * 0.04, 5);
    if (r() < 0.4) { const a = r() * 6; PIPE(c, [x, top - 0.08, z], [x + Math.cos(a) * 0.1, top - len * 0.8, z + Math.sin(a) * 0.1], 0.015, 0.04, 4); }
  }
}
function scorch(c) { // one blast, on the ceiling above the bench: a jagged black star with a brown fringe
  const cx = 10.4, cz = -3.9, y = 3.595, r = rng(13), N = 22;
  for (const [R, col, dy] of [[1.15, "oklch(0.32 0.03 60)", 0], [0.85, "oklch(0.16 0.01 60)", -0.002], [0.4, "oklch(0.08 0 0)", -0.004]]) {
    m(c, null, col, 1); const pts = [];
    for (let k = 0; k < N; k++) { const a = k / N * 2 * Math.PI, rr = R * (k % 2 ? 0.45 + r() * 0.25 : 0.8 + r() * 0.45); pts.push([cx + Math.sin(a) * rr, cz + Math.cos(a) * rr]); }
    for (let k = 0; k < N; k++) { const a = pts[k], b = pts[(k + 1) % N]; c.tri(cx, y + dy, cz, a[0], y + dy, a[1], b[0], y + dy, b[1]); }
  }
  // soot licking down the north wall behind it
  m(c, null, "oklch(0.2 0.01 60)", 1); for (const [x, w, h] of [[10.1, 0.5, 0.9], [10.7, 0.35, 0.6], [9.7, 0.25, 0.45]]) c.quad(x - w / 2, 3.59, -4.99, x + w / 2, 3.59, -4.99, x + w * 0.1, 3.59 - h, -4.99, x - w * 0.1, 3.59 - h, -4.99);
}
function alchemy(c, L) {
  // the long bench along the north wall
  m(c, OAK, WOODC); BX(c, 7.0, 0.88, -5.0, 12.8, 0.96, -4.2);
  for (const x of [7.1, 9.0, 10.9, 12.7]) BX(c, x - 0.06, 0, -4.9, x + 0.06, 0.88, -4.8), BX(c, x - 0.06, 0, -4.36, x + 0.06, 0.88, -4.26);
  BX(c, 7.0, 0.2, -4.9, 12.8, 0.24, -4.3);
  m(c, FST, STONEC); BX(c, 7.0, 0.96, -5.0, 12.8, 1.02, -4.8);
  // wall shelves of jars above the bench
  m(c, OAK, WOODC); BX(c, 7.2, 1.7, -5.0, 9.6, 1.74, -4.72); BX(c, 11.2, 1.7, -5.0, 12.7, 1.74, -4.72); BX(c, 7.2, 2.3, -5.0, 9.6, 2.34, -4.72);
  const jar = [["oklch(0.6 0.12 120)", [0.1, 0.3, 0.05]], ["oklch(0.65 0.1 40)", [0, 0, 0]], ["oklch(0.6 0.13 260)", [0.15, 0.15, 0.6]], ["oklch(0.7 0.05 90)", [0, 0, 0]], ["oklch(0.55 0.15 300)", [0.35, 0.06, 0.55]]];
  if (L <= 2) { let k = 0; for (const [x0, x1, y] of [[7.3, 9.5, 1.74], [11.3, 12.6, 1.74], [7.3, 9.5, 2.34]]) for (let x = x0 + 0.1; x < x1; x += 0.26) { const [col, em] = jar[k++ % jar.length], h = 0.14 + (k % 3) * 0.04;
    c.albedo(null); c.color(col, em[0] ? 0.8 : 1); c.roughness(em[0] ? 0.08 : 0.7); c.emissive(...em); LA(c, x, y, -4.86, [[0, 0], [0.07, 0], [0.07, h], [0.05, h + 0.03], [0, h + 0.03]], 8);
    m(c, null, "#6a4a30", 0.9); LA(c, x, y + h + 0.03, -4.86, [[0.04, 0], [0.04, 0.03], [0, 0.03]], 6); } }
  // on the bench: three retorts on coal pans, flasks, a mortar, a scorched book
  retort(c, 8.0, 0.96, -4.6, 0, "oklch(0.6 0.15 150)", [0.05, 0.6, 0.2]);
  retort(c, 10.4, 0.96, -4.6, 0, "oklch(0.6 0.16 20)", [0.7, 0.1, 0.06]);
  retort(c, 11.9, 0.96, -4.6, 180, "oklch(0.65 0.12 220)", [0.08, 0.35, 0.8]);
  flask(c, 9.0, 0.96, -4.5, 0.08, 0.26, "oklch(0.55 0.15 300)", [0.4, 0.08, 0.7]); flask(c, 9.25, 0.96, -4.65, 0.06, 0.2, "oklch(0.7 0.14 70)", [0.7, 0.35, 0.05]);
  m(c, FST, STONEC); LA(c, 9.6, 0.96, -4.45, [[0, 0], [0.1, 0], [0.12, 0.11], [0.08, 0.11], [0, 0.04]], 10); m(c, OAK, WOODC); SEG(c, [9.6, 1.0, -4.45], [9.7, 1.2, -4.4], 0.03, 0.03);
  m(c, null, "#2a1a14", 0.9); RB(c, 10.95, 0.99, -4.45, 0.32, 0.05, 0.24, 15); m(c, null, "oklch(0.45 0.05 70)", 1); RB(c, 10.95, 1.02, -4.45, 0.28, 0.02, 0.2, 15);
  candleStick(c, [12.5, 0.96, -4.4], 0.08);
  // the cauldron on its hearth-stones, mid-room
  m(c, FST, STONEC); for (let k = 0; k < 8; k++) { const a = k / 8 * 2 * Math.PI; RB(c, 9.9 + Math.sin(a) * 0.62, 0.1, -1.5 + Math.cos(a) * 0.62, 0.3, 0.2, 0.22, k * 45); }
  m(c, IR, "oklch(0.55 0.005 250)", 0.6, 0.6);
  LA(c, 9.9, 0.32, -1.5, [[0.2, 0], [0.45, 0.12], [0.52, 0.35], [0.48, 0.6], [0.44, 0.66], [0.48, 0.68]], 14, false);
  for (const a of [0, 120, 240]) SEG(c, [9.9 + Math.sin(a * D) * 0.35, 0.0, -1.5 + Math.cos(a * D) * 0.35], [9.9 + Math.sin(a * D) * 0.3, 0.4, -1.5 + Math.cos(a * D) * 0.3], 0.06, 0.06);
  glow(c, "oklch(0.55 0.15 150)", [0.15, 0.8, 0.25]); ring(c, 9.9, -1.5, 0.92, 0, 0.45, 14);
  glow(c, "oklch(0.5 0.15 40)", [1.8, 0.45, 0.08]); for (let k = 0; k < 6; k++) RB(c, 9.9 + Math.sin(k) * 0.18, 0.06, -1.5 + Math.cos(k * 1.7) * 0.18, 0.14, 0.08, 0.1, k * 37);
  m(c, OAK, WOODC); SEG(c, [9.9, 0.9, -1.5], [10.3, 1.5, -1.3], 0.04, 0.04);
  // stools, a barrel of something that smells of pears and regret, the drying herbs, the blast mark
  for (const [x, z] of [[8.2, -3.6], [11.0, -3.7]]) { m(c, OAK, WOODC); LA(c, x, 0.6, z, [[0.2, 0], [0.2, 0.05], [0, 0.05]], 10); for (const a of [0, 120, 240]) SEG(c, [x + Math.sin(a * D) * 0.16, 0, z + Math.cos(a * D) * 0.16], [x + Math.sin(a * D) * 0.1, 0.6, z + Math.cos(a * D) * 0.1], 0.04, 0.04); }
  m(c, OAK, WOODC); LA(c, 12.8, 0, 1.1, [[0.28, 0], [0.33, 0.4], [0.28, 0.8]], 10); m(c, IR, IRONC, 0.5, 0.5); for (const y of [0.1, 0.7]) LA(c, 12.8, y, 1.1, [[0.31, 0], [0.31, 0.04]], 10, false);
  herbs(c, L); scorch(c);
}

// ---------- beds, wardrobes, chests ----------
function bed(c, g, w, len, blanket, big, L, f) {
  if (f) return gsolid(f, g, -w / 2 - 0.05, 0, -0.05, w / 2 + 0.05, big ? 0.6 : 0.5, len + 0.05);
  m(c, OAK, WOODC); const post = big ? 0.09 : 0.06, ph = big ? 2.2 : 0.95;
  for (const [x, z, h] of [[-w / 2, 0, ph], [w / 2, 0, ph], [-w / 2, len, big ? ph : 0.6], [w / 2, len, big ? ph : 0.6]]) gb(c, g, x - post, 0, z - post, x + post, h, z + post);
  gb(c, g, -w / 2, 0.22, 0, -w / 2 + 0.05, 0.38, len); gb(c, g, w / 2 - 0.05, 0.22, 0, w / 2, 0.38, len);
  gb(c, g, -w / 2, 0.38, -0.03, w / 2, ph * 0.8, 0.03); gb(c, g, -w / 2, 0.3, len - 0.03, w / 2, 0.55, len + 0.03);
  gb(c, g, -w / 2, 0.24, 0, w / 2, 0.28, len);
  m(c, HAY, "oklch(0.92 0.04 85)", 1); gb(c, g, -w / 2 + 0.05, 0.28, 0.04, w / 2 - 0.05, 0.46, len - 0.04);
  // blanket over the lower two thirds, folded back at the top, hanging past the edges
  m(c, CANVAS, blanket, 0.95); gb(c, g, -w / 2 - 0.02, 0.46, len * 0.32, w / 2 + 0.02, 0.5, len + 0.0); gb(c, g, -w / 2 - 0.03, 0.2, len * 0.32, -w / 2 + 0.0, 0.5, len); gb(c, g, w / 2, 0.2, len * 0.32, w / 2 + 0.03, 0.5, len);
  m(c, CANVAS, "oklch(0.92 0.03 85)", 0.95); gb(c, g, -w / 2 - 0.01, 0.5, len * 0.32, w / 2 + 0.01, 0.53, len * 0.32 + 0.18);
  m(c, CANVAS, "oklch(0.95 0.02 85)", 0.95); gb(c, g, -w / 2 + 0.12, 0.46, 0.08, (big ? -0.05 : w / 2 - 0.12), 0.6, 0.42, -6);
  if (big) { gb(c, g, 0.05, 0.46, 0.08, w / 2 - 0.12, 0.6, 0.42, -6);
    brass(c); for (const x of [-w / 2, w / 2]) for (const z of [0, len]) { const p = gp(g, x, ph, z); LA(c, p[0], p[1], p[2], [[0.08, 0], [0.1, 0.08], [0, 0.16]], 8); }
    m(c, OAK, WOODC); gb(c, g, -w / 2, ph - 0.1, -0.06, w / 2, ph, 0.06); gb(c, g, -w / 2, ph - 0.1, len - 0.06, w / 2, ph, len + 0.06); gb(c, g, -w / 2 - 0.06, ph - 0.1, 0, -w / 2 + 0.06, ph, len); gb(c, g, w / 2 - 0.06, ph - 0.1, 0, w / 2 + 0.06, ph, len);
    m(c, CANVAS, SLATE, 0.95); c.albedo(null); c.color(SLATE); gb(c, g, -w / 2 + 0.06, ph - 0.12, 0.06, w / 2 - 0.06, ph - 0.1, len - 0.06); for (const x of [-w / 2 - 0.04, w / 2 + 0.02]) gb(c, g, x, ph - 1.3, -0.04, x + 0.02, ph - 0.1, 0.5); }
}
function wardrobe(c, g, f) {
  if (f) return gsolid(f, g, -0.55, 0, 0, 0.55, 2.1, 0.62);
  m(c, OAK, "oklch(0.75 0.03 60)"); gb(c, g, -0.55, 0.08, 0, 0.55, 2.0, 0.6); gb(c, g, -0.6, 2.0, -0.02, 0.6, 2.12, 0.66); gb(c, g, -0.52, 0, 0.04, 0.52, 0.08, 0.58);
  m(c, OAK, WOODC); gb(c, g, -0.5, 0.15, 0.6, -0.015, 1.93, 0.63); gb(c, g, 0.015, 0.15, 0.6, 0.5, 1.93, 0.63);
  for (const s of [-1, 1]) { gb(c, g, s * 0.42 - 0.04, 0.3, 0.63, s * 0.1 + 0.04 * s, 0.9, 0.645); gb(c, g, s * 0.42 - 0.04, 1.1, 0.63, s * 0.1 + 0.04 * s, 1.8, 0.645); }
  brass(c); for (const s of [-1, 1]) gb(c, g, s * 0.06 - 0.015, 1.0, 0.63, s * 0.06 + 0.015, 1.12, 0.67);
}
function chest(c, g, locked, f) {
  if (f) return gsolid(f, g, -0.5, 0, -0.3, 0.5, 0.62, 0.3);
  m(c, OAK, WOODC); gb(c, g, -0.5, 0, -0.3, 0.5, 0.42, 0.3); gb(c, g, -0.52, 0.42, -0.32, 0.52, 0.56, 0.32); gb(c, g, -0.5, 0.56, -0.26, 0.5, 0.62, 0.26);
  m(c, IR, IRONC, 0.5, 0.6); for (const x of [-0.36, 0.36]) { gb(c, g, x - 0.04, -0.005, -0.33, x + 0.04, 0.625, -0.29); gb(c, g, x - 0.04, -0.005, 0.29, x + 0.04, 0.625, 0.33); gb(c, g, x - 0.04, 0.6, -0.29, x + 0.04, 0.63, 0.29); }
  if (!locked) return;
  gb(c, g, -0.08, 0.3, 0.3, 0.08, 0.5, 0.34); brass(c); gb(c, g, -0.07, 0.18, 0.34, 0.07, 0.32, 0.38); PIPE(c, gp(g, -0.045, 0.32, 0.36), gp(g, -0.045, 0.4, 0.36), 0.012, 0.012, 5); PIPE(c, gp(g, 0.045, 0.32, 0.36), gp(g, 0.045, 0.4, 0.36), 0.012, 0.012, 5); PIPE(c, gp(g, -0.045, 0.4, 0.36), gp(g, 0.045, 0.4, 0.36), 0.012, 0.012, 5);
  m(c, null, "#1c1a18", 0.5); gb(c, g, -0.012, 0.22, 0.38, 0.012, 0.27, 0.385);
}
function scrollPile(c, cx, y, cz, n, seed) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const ring_ = i < 9 ? 0 : i < 15 ? 1 : 2, a = r() * Math.PI * 2, rad = (2 - ring_) * 0.18 * r() + 0.05, yy = y + 0.05 + ring_ * 0.09 + r() * 0.03;
    const px = cx + Math.cos(a) * rad, pz = cz + Math.sin(a) * rad, yaw = r() * Math.PI, len = 0.32 + r() * 0.2, R = 0.035 + r() * 0.015;
    const dx = Math.cos(yaw) * len / 2, dz = Math.sin(yaw) * len / 2, tilt = (r() - 0.5) * 0.08;
    m(c, null, r() < 0.3 ? "oklch(0.82 0.05 80)" : PARCH, 0.9); PIPE(c, [px - dx, yy - tilt, pz - dz], [px + dx, yy + tilt, pz + dz], R, R, 7);
    if (r() < 0.5) { m(c, null, r() < 0.5 ? "#a8452e" : SLATE, 0.8); PIPE(c, [px - dx * 0.1, yy - tilt * 0.1, pz - dz * 0.1], [px + dx * 0.1, yy + tilt * 0.1, pz + dz * 0.1], R + 0.005, R + 0.005, 7, false); }
    if (r() < 0.3) { brass(c); PIPE(c, [px - dx * 1.08, yy, pz - dz * 1.08], [px - dx, yy, pz - dz], R * 0.5, R * 0.5, 5); }
  }
  m(c, null, PARCH, 0.9); RB(c, cx + 0.5, y + 0.005, cz + 0.2, 0.3, 0.01, 0.4, 20); // one unrolled, abandoned after the first line
}
function dorm(c, L) {
  const y = F1, blankets = ["oklch(0.55 0.08 25)", "oklch(0.5 0.06 250)", "oklch(0.55 0.06 140)", "oklch(0.6 0.05 70)"];
  BEDS_DORM.forEach(([x, z], i) => { bed(c, G(x, y, z, 0), 0.85, 1.95, blankets[i], false, L); chest(c, G(x, y, z + 2.35, 0), false); });
  wardrobe(c, G(13.38, y, 0.6, -90)); wardrobe(c, G(13.38, y, -3.6, -90)); wardrobe(c, G(6.42, y, -3.9, 90)); wardrobe(c, G(6.42, y, -0.6, 90));
  // a shared study table, the unread scroll pile beside bed four
  desk(c, G(9.9, y, 1.15, 0), L); chair(c, G(9.4, y, 0.5, 180)); chair(c, G(10.4, y, 0.5, 180)); candleStick(c, [10.5, y + 0.8, 1.3]);
  scrollPile(c, 12.55, y, -1.2, 22, 5);
  m(c, CANVAS, "oklch(0.5 0.07 30)", 0.95); c.albedo(null); BX(c, 7.6, y, -2.4, 12.2, y + 0.012, 0.0); m(c, null, BRASS, 0.7); BX(c, 7.7, y + 0.002, -2.3, 12.1, y + 0.014, -2.22);
  // a sock on a wardrobe, a boot under a bed, a slate with "STUDY" written on it, underlined twice
  m(c, CANVAS, "oklch(0.85 0.03 85)", 1); RB(c, 13.0, y + 2.14, 0.6, 0.08, 0.04, 0.3, 10);
  m(c, null, "#4a3a2a", 0.8); RB(c, 9.0, y + 0.08, -3.0, 0.12, 0.16, 0.28, 30);
  m(c, OAK, WOODC); BX(c, 7.3, y + 1.6, 1.74, 8.5, y + 2.4, 1.8); m(c, null, "#2b2f33", 0.6); BX(c, 7.36, y + 1.66, 1.73, 8.44, y + 2.34, 1.74);
  m(c, null, "oklch(0.92 0 0)", 1); for (const [x0, x1, yy] of [[7.5, 8.3, 2.1], [7.55, 8.25, 1.9], [7.55, 8.25, 1.84]]) BX(c, x0, y + yy, 1.725, x1, y + yy + 0.03, 1.73);
}
function starChart(c) {
  const x = 6.43, y0 = F2 + 1.0, z0 = -3.8, z1 = -0.6, y1 = F2 + 2.9;
  m(c, OAK, WOODC); BX(c, 6.4, y0 - 0.08, z0 - 0.08, 6.5, y1 + 0.08, z1 + 0.08);
  m(c, null, "oklch(0.24 0.05 255)", 0.8); BX(c, 6.5, y0, z0, 6.52, y1, z1);
  brass(c); const cy = (y0 + y1) / 2, cz = (z0 + z1) / 2;
  for (const R of [0.85, 0.55]) for (let k = 0; k < 32; k++) { const a = k / 32 * 2 * Math.PI, b = (k + 1) / 32 * 2 * Math.PI; SEG(c, [6.53, cy + Math.cos(a) * R, cz + Math.sin(a) * R], [6.53, cy + Math.cos(b) * R, cz + Math.sin(b) * R], 0.01, 0.025); }
  for (let k = 0; k < 12; k++) { const a = k / 12 * 2 * Math.PI; SEG(c, [6.53, cy + Math.cos(a) * 0.85, cz + Math.sin(a) * 0.85], [6.53, cy + Math.cos(a) * 0.95, cz + Math.sin(a) * 0.95], 0.01, 0.02); }
  const r = rng(31), stars = []; for (let i = 0; i < 46; i++) stars.push([cy + (r() - 0.5) * 1.75, cz + (r() - 0.5) * 3.0, r()]);
  glow(c, "oklch(0.95 0.05 85)", [1.6, 1.4, 0.9]);
  for (const [sy, sz, b] of stars) { const s = 0.012 + b * 0.022; BX(c, 6.525, sy - s, sz - s, 6.535, sy + s, sz + s); }
  glow(c, "oklch(0.75 0.08 80)", [0.5, 0.38, 0.15]);
  for (const [a, b] of [[0, 3], [3, 7], [7, 12], [12, 4], [20, 21], [21, 25], [25, 22], [30, 31], [31, 35], [35, 33], [40, 41], [41, 44]]) { const p = stars[a], q = stars[b]; SEG(c, [6.532, p[0], p[1]], [6.532, q[0], q[1]], 0.004, 0.008); }
}
function telescope(c, L) {
  const base = [12.3, F2, -1.4], top = [12.3, F2 + 1.25, -1.4];
  m(c, OAK, WOODC); for (const a of [0, 120, 240]) SEG(c, [base[0] + Math.sin(a * D) * 0.4, F2, base[2] + Math.cos(a * D) * 0.4], top, 0.045, 0.045);
  brass(c); LA(c, top[0], top[1] - 0.04, top[2], [[0.08, 0], [0.08, 0.08], [0, 0.08]], 8);
  const a = [11.6, F2 + 1.15, -1.35], b = [13.15, F2 + 1.75, -1.45];
  PIPE(c, a, b, 0.055, 0.1, 10); PIPE(c, [a[0] - 0.12, a[1] - 0.05, a[2]], a, 0.03, 0.03, 6);
  for (const t of [0.2, 0.55, 0.95]) { const p = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t], q = [p[0] + 0.03, p[1] + 0.012, p[2]]; m(c, null, "#5a3a22", 0.6); PIPE(c, p, q, 0.06 + t * 0.045, 0.06 + t * 0.045, 10); }
  glow(c, "oklch(0.6 0.05 250)", [0.15, 0.2, 0.35]); LA(c, b[0], b[1], b[2], [[0.095, 0], [0, 0.005]], 10, false, "x");
}
function study(c, L) {
  const y = F2;
  bed(c, G(9.9, y, -4.95, 0), 1.9, 2.2, "oklch(0.42 0.07 255)", true, L);
  chest(c, G(9.9, y, -2.25, 0), true);
  starChart(c); telescope(c, L);
  desk(c, G(7.4, y, -1.2, 90), L); chair(c, G(8.1, y, -1.2, -90)); candleStick(c, [7.2, y + 0.8, -1.6]);
  shelf(c, G(12.0, y, 1.78, 180), 2.2, 2.4, 4, 41, L); shelf(c, G(13.38, y, -4.0, -90), 1.4, 2.4, 4, 42, L);
  m(c, CANVAS, "oklch(0.55 0.08 25)", 0.95); c.albedo(null); BX(c, 8.0, y, -2.0, 12.0, y + 0.012, 0.6); m(c, null, BRASS, 0.7); BX(c, 8.1, y + 0.002, -1.9, 11.9, y + 0.014, -1.8); BX(c, 8.1, y + 0.002, 0.4, 11.9, y + 0.014, 0.5);
  // a goblet, a wine jug, a crystal on a stand: the archmage's nightstand
  m(c, OAK, WOODC); BX(c, 11.2, y, -4.9, 11.7, y + 0.6, -4.4); brass(c); LA(c, 11.35, y + 0.6, -4.65, [[0.04, 0], [0.01, 0.02], [0.01, 0.08], [0.04, 0.1], [0.045, 0.16], [0, 0.16]], 8);
  glow(c, "oklch(0.55 0.1 250)", [0.3, 0.7, 1.8]); LA(c, 11.55, y + 0.62, -4.6, [[0, 0], [0.05, 0.06], [0, 0.18]], 6);
}
function nightSky(c) { // what the east windows look out on: a deep blue night, stars and a waning moon
  m(c, null, "oklch(0.13 0.04 260)", 1); c.emissive(0.01, 0.02, 0.05); BX(c, 15.2, -1, -6, 15.3, 14, 4);
  const r = rng(99); glow(c, "oklch(0.95 0.02 250)", [1.6, 1.7, 2.0]);
  for (let i = 0; i < 140; i++) { const yy = r() * 14, zz = -6 + r() * 10, s = 0.015 + r() * r() * 0.05; BX(c, 15.18, yy - s, zz - s, 15.2, yy + s, zz + s); }
  glow(c, "oklch(0.95 0.03 90)", [2.4, 2.3, 1.9]); LA(c, 15.17, F2 + 2.4, -1.0, [[0.45, 0], [0, 0.01]], 16, false, "x");
  m(c, null, "oklch(0.13 0.04 260)", 1); c.emissive(0.01, 0.02, 0.05); LA(c, 15.16, F2 + 2.5, -0.85, [[0.42, 0], [0, 0.01]], 16, false, "x");
}

const BEDS_DORM = [[7.25, -4.95], [8.85, -4.95], [10.95, -4.95], [12.55, -4.95]];

// PARAMS (Codex Kits; {} = the guild as built): atrium, library, alchemy, dorm, study = false leaves that room bare
// (its furniture and the boxes a body bumps into go together); sky = false drops the night outside the east windows.
let P = {}; const on = (k) => P[k] !== false;
function geometry0(ctx) {
  const L = ctx.lod;
  shell(ctx, L); stairsMesh(ctx, L);
  if (L <= 4) { if (on("atrium")) atrium(ctx, L); if (on("library")) library(ctx, L); if (on("alchemy")) alchemy(ctx, L); if (on("dorm")) dorm(ctx, L); if (on("study")) study(ctx, L); if (on("sky")) nightSky(ctx); }
  ctx.albedo(null); ctx.emissive(null);
}
function collider0(ctx) {
  const f = CB();
  for (const w of WALLS) wall(f, w.ax, w.a[0], w.a[1], w.l[0], w.l[1], 0, w.y, w.h);
  slabs(f); stairBoxes(f);
  // furniture a body bumps into
  if (on("library")) { f(-15, 0, -5, -14.56, 4.6, 5.2); f(-14.1, 0, -5, -7.35, 4.6, -4.56); f(-14.1, 0, 4.76, -7.35, 4.6, 5.2); f(-12.03, 0, -2.8, -11.17, 2.4, -0.4);
  desk(null, G(-9.0, 0, 0.9, 0), 1, f); desk(null, G(-9.0, 0, 3.2, 180), 1, f); desk(null, G(-7.6, 0, -2.7, 90), 1, f);
  f(-13.1, 0, 2.1, -12.5, 1.1, 2.7); } if (on("atrium")) f(-0.3, 0, -4.2, 0.3, 1.1, -3.6);
  if (on("alchemy")) { f(7.0, 0, -5, 12.8, 1.0, -4.2); f(9.2, 0, -2.2, 10.6, 0.95, -0.8); }
  if (on("dorm")) { for (const [x, z] of BEDS_DORM) { bed(null, G(x, F1, z, 0), 0.85, 1.95, 0, false, 1, f); chest(null, G(x, F1, z + 2.35, 0), false, f); }
  wardrobe(null, G(13.38, F1, 0.6, -90), f); wardrobe(null, G(13.38, F1, -3.6, -90), f); wardrobe(null, G(6.42, F1, -3.9, 90), f); wardrobe(null, G(6.42, F1, -0.6, 90), f);
  desk(null, G(9.9, F1, 1.15, 0), 1, f); }
  if (on("study")) { bed(null, G(9.9, F2, -4.95, 0), 1.9, 2.2, 0, true, 1, f); chest(null, G(9.9, F2, -2.25, 0), true, f); desk(null, G(7.4, F2, -1.2, 90), 1, f); }
  return f.list;
}

// roomy interiors: params.grow widens the shell and lifts the ceilings, furniture keeps human height (scripts/lib/roomy.js)
export function geometry(ctx) { P = ctx.params ?? {}; return geometry0(grown(ctx, ctx.params?.grow)); }
export function collider(ctx) { P = ctx.params ?? {}; return growBoxes(collider0(ctx), ctx.params?.grow); }
const bench = bench_magesHall({ OAK, WOODC, gb, m });
const banner = banner_magesHall({ CANVAS, G, PIPE, SEG, SLATE, brass, gb, gp, m });
const sconce = sconce_magesHall({ IR, IRONC, LA, RB, WAX, gb, glow, gp, m });
const shelf = shelf_magesHall({ BOOKS, OAK, brass, gb, gsolid, m, rng });
