// FROSTFANG HOLLOW: an ice cave under the Hrothspine. Blue-white glacial rock, glazed tunnels, a frozen waterfall,
// a wolf den of bones, a collapsed draugr shrine and the jarl's barrow-hall. Place coordinates, floor y = 0, root at origin.
// Rooms are closed boxes for the body (collider); the eye gets the cave over them: sunk boulders, ice glaze, icicles, frost.
import { kit } from "./barrow-kit.js";
// PARAMS (Codex Kits; {} = as built): entry, tunnel, cavern, den, shrine, boss = false strips that room's dressing (the frozen falls, the
// bones, the pillars, the throne) and its props' colliders; the cave shell, ice skin and braziers always stand.
let P = {}; const on = (k) => P[k] !== false;
const T = 0.8;
const TX = {
  rock: "cdn/texture-blue-white-glacial-rock.png", floor: "cdn/texture-frosted-cave-floor-stone.png", ice: "cdn/texture-clear-blue-glacier-ice.png",
  snow: "cdn/texture-fresh-packed-snow.png", carved: "cdn/texture-carved-granite-blocks.png", iron: "cdn/texture-wrought-iron.png",
  oak: "cdn/texture-dark-oak-planks-weathered.png", leather: "cdn/texture-worn-brown-leather.png",
};
// x0..x1, z0..z1 (z0 the deeper, -Z end), h ceiling; open.N / open.S: [a, b, top] cuts in that wall; corridors are "full" at both ends
export const ROOMS = [
  { id: "entry", x0: -4.5, x1: 4.5, z0: -8, z1: 0, h: 4.5, open: { S: [[-1.8, 1.8, 3.4]] } },
  { id: "tunnel", x0: -1.8, x1: 1.8, z0: -21, z1: -8, h: 3.4, full: true },
  { id: "cavern", x0: -9, x1: 9, z0: -39, z1: -21, h: 9, open: { N: [[-1.8, 1.8, 3.4]], S: [[3, 6.6, 3.4]] } },
  { id: "c2", x0: 3, x1: 6.6, z0: -44, z1: -39, h: 3.4, full: true },
  { id: "den", x0: -1, x1: 12, z0: -57, z1: -44, h: 5, open: { N: [[3, 6.6, 3.4]], S: [[0, 3.6, 3.4]] } },
  { id: "c3", x0: 0, x1: 3.6, z0: -61, z1: -57, h: 3.4, full: true },
  { id: "shrine", x0: -6, x1: 8, z0: -75, z1: -61, h: 6, open: { N: [[0, 3.6, 3.4]], S: [[-1.8, 1.8, 3.6]] } },
  { id: "c4", x0: -1.8, x1: 1.8, z0: -80, z1: -75, h: 3.6, full: true },
  { id: "boss", x0: -11, x1: 11, z0: -100, z1: -80, h: 8, open: { N: [[-1.8, 1.8, 3.6]] } },
];
// lights: fire = brazier flame at (x, y, z); cold = blue spectral brazier flame; crystal = an ice-crystal glow; shaft = cold daylight from a ceiling crack
export const LIGHTS = [
  { id: "entry-brazier", kind: "fire", x: 3.2, y: 1.25, z: -5.6 },
  { id: "tunnel-crystal", kind: "crystal", x: -1.2, y: 0.9, z: -14.6 },
  { id: "cavern-falls", kind: "crystal", x: -5.5, y: 3.5, z: -30, li: 34, ld: 16 },
  { id: "cavern-torch", kind: "fire", x: 8.6, y: 2.6, z: -35.5 },
  { id: "den-shaft", kind: "shaft", x: 6, y: 4.6, z: -50.5 },
  { id: "shrine-brazier", kind: "cold", x: 5, y: 1.25, z: -68.5 },
  { id: "boss-brazier-w", kind: "cold", x: -5, y: 1.25, z: -92 },
  { id: "boss-brazier-e", kind: "cold", x: 5, y: 1.25, z: -92 },
];
const BRAZIERS = [[3.2, -5.6], [5, -68.5], [-5, -92], [5, -92]];
// a deterministic hash: geometry and collider see the same scatter
const H = (a, b, c = 0) => { const s = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453; return s - Math.floor(s); };
function build(ctx, col) {
  P = ctx.params ?? {};
  const K = kit(ctx, col), lod = col ? 4 : ctx.lod;
  const rock = (l = 0.92) => K.paint(TX.rock, `oklch(${l} 0.02 235)`, 0.88);
  const floorP = () => K.paint(TX.floor, "oklch(0.93 0.015 235)", 0.85);
  const snow = () => K.paint(TX.snow, "#ffffff", 0.95);
  const carved = (l = 0.88) => K.paint(TX.carved, `oklch(${l} 0.015 240)`, 0.8);
  const ice = (glow = "#06182a") => { if (col) return; ctx.albedo(TX.ice); ctx.color("#eef8ff"); ctx.roughness(0.1); ctx.metalness(0); ctx.emissive(glow); };
  const crystalP = () => { if (col) return; ctx.albedo(null); ctx.color("#bfe6ff"); ctx.roughness(0.05); ctx.metalness(0); ctx.emissive("#1b6fa8"); };
  const boneP = () => K.paint(null, "#d9cfb6", 0.85);
  // ---------- the shell: floor, ceiling and walls of every room, openings cut
  for (const r of ROOMS) {
    const full = !!r.full, top = r.h + 0.6;
    const fz0 = r.z0 - (full ? 0 : T), fz1 = r.z1 + (full ? 0 : T);
    floorP(); K.box(r.x0 - T, -0.5, fz0, r.x1 + T, 0, fz1);
    rock(0.8); K.box(r.x0 - T, r.h, fz0, r.x1 + T, top, fz1);
    rock(); K.box(r.x0 - T, -0.5, fz0, r.x0, top, fz1); K.box(r.x1, -0.5, fz0, r.x1 + T, top, fz1);
    if (full) continue;
    for (const side of ["N", "S"]) {
      const za = side === "N" ? r.z1 : r.z0 - T, zb = side === "N" ? r.z1 + T : r.z0;
      let cur = r.x0;
      for (const [a, b, oh] of (r.open[side] || []).slice().sort((p, q) => p[0] - q[0])) {
        K.box(cur, -0.5, za, a, top, zb); K.box(a, oh, za, b, top, zb); cur = b;
      }
      K.box(cur, -0.5, za, r.x1, top, zb);
    }
  }
  // ---------- the cave over the boxes (eye only past lod 3): boulders sunk at the wall foot, bulges up the walls, frost on every ledge
  if (!col && lod <= 3) for (const [ri, r] of ROOMS.entries()) {
    const narrow = r.full, opens = (side, x) => (r.open?.[side] || []).some(([a, b]) => x > a - 0.9 && x < b + 0.9);
    const walls = [["W", r.z0, r.z1], ["E", r.z0, r.z1]]; if (!narrow) walls.push(["N", r.x0, r.x1], ["S", r.x0, r.x1]);
    for (const [side, lo, hi] of walls) {
      const step = narrow ? 1.3 : 1.7;
      for (let u = lo + 0.5, k = 0; u < hi - 0.3; u += step * (0.8 + 0.4 * H(ri, u, 1)), k++) {
        if ((side === "N" || side === "S") && opens(side, u)) continue;
        const h1 = H(ri, u, 2), h2 = H(ri, u, 3), s = narrow ? 0.45 : 1;
        const P = (inset, y) => side === "W" ? [r.x0 + inset, y, u] : side === "E" ? [r.x1 - inset, y, u] : side === "N" ? [u, y, r.z1 - inset] : [u, y, r.z0 + inset];
        const rx = (0.55 + 0.4 * h1) * s, ry = (0.45 + 0.45 * h2) * s;
        rock(0.86 + 0.08 * h2); const p = P(0.12 * s, 0.1); K.rock(p[0], p[1], p[2], rx, ry, rx, 8, 5, 0.25);
        snow(); K.rock(p[0], p[1] + ry * 0.82, p[2], rx * 0.72, 0.07, rx * 0.72, 7, 3, 0.2);
        if (!narrow && lod <= 2) { // a bulge higher up the wall, frost on its shelf
          const y = 1.6 + (r.h - 2.4) * H(ri, u, 4); rock(0.82); const q = P(0, y); K.rock(q[0], q[1], q[2], 0.5 + 0.5 * h2, 0.4 + 0.3 * h1, 0.5 + 0.5 * h2, 7, 5, 0.3);
          snow(); K.rock(q[0], q[1] + 0.32 + 0.24 * h1, q[2], 0.4 + 0.3 * h2, 0.05, 0.4 + 0.3 * h2, 6, 3, 0.2);
        }
      }
    }
    // icicles and ice teeth from the ceiling
    const area = (r.x1 - r.x0) * (r.z1 - r.z0), n = Math.round(area * (lod <= 1 ? 0.32 : lod <= 2 ? 0.16 : 0.05));
    ice();
    for (let k = 0; k < n; k++) {
      const x = r.x0 + 0.2 + (r.x1 - r.x0 - 0.4) * H(ri, k, 5), z = r.z0 + 0.2 + (r.z1 - r.z0 - 0.4) * H(ri, k, 6);
      const len = 0.2 + Math.pow(H(ri, k, 7), 2) * Math.min(1.6, r.h * 0.22), rr = 0.03 + 0.06 * H(ri, k, 8);
      K.seg([x, r.h + 0.02, z], [x, r.h - len, z], rr, 0.004, 5);
    }
  }
  // an ice crystal cluster: hex shards fanning from a point
  const crystal = (x, y, z, s, n = 6, seed = 0) => {
    if (col) return; crystalP();
    for (let k = 0; k < n; k++) {
      const a = (k / n) * 6.283 + H(seed, k, 9) * 1.2, lean = 0.25 + 0.55 * H(seed, k, 10), len = s * (0.5 + 0.8 * H(seed, k, 11));
      const d = [Math.cos(a) * Math.sin(lean), Math.cos(lean), Math.sin(a) * Math.sin(lean)], w = s * (0.09 + 0.06 * H(seed, k, 12));
      const m = [x + d[0] * len * 0.82, y + d[1] * len * 0.82, z + d[2] * len * 0.82];
      K.seg([x, y - 0.05, z], m, w * 0.7, w, 6, true); K.seg(m, [x + d[0] * len, y + d[1] * len, z + d[2] * len], w, 0.005, 6);
    }
    ctx.emissive(null);
  };
  const bone = (p, q, r = 0.025) => K.seg(p, q, r, r * 0.8, 5, true);
  const scatterBones = (x0, x1, z0, z1, n, seed) => {
    if (col || lod > 3) return; boneP();
    for (let k = 0; k < n; k++) {
      const x = x0 + (x1 - x0) * H(seed, k, 13), z = z0 + (z1 - z0) * H(seed, k, 14), a = H(seed, k, 15) * 6.283, l = 0.25 + 0.35 * H(seed, k, 16);
      bone([x - Math.cos(a) * l / 2, 0.03, z - Math.sin(a) * l / 2], [x + Math.cos(a) * l / 2, 0.03, z + Math.sin(a) * l / 2], 0.02 + 0.015 * H(seed, k, 17));
      K.rock(x - Math.cos(a) * l / 2, 0.04, z - Math.sin(a) * l / 2, 0.04, 0.035, 0.04, 5, 3, 0.2);
    }
  };
  // an animal skull: brow dome, long snout, eye pits, fangs
  const beastSkull = (x, z, yaw) => { if (col || lod > 3) return; K.at(() => {
    boneP(); K.rock(0, 0.1, 0, 0.11, 0.09, 0.12, 8, 5, 0.06); K.seg([0, 0.08, -0.08], [0, 0.05, -0.32], 0.07, 0.035, 7, true);
    K.paint(null, "#1a1714", 1); for (const s of [-1, 1]) K.rock(s * 0.065, 0.13, -0.09, 0.03, 0.025, 0.03, 5, 3, 0.1);
    boneP(); for (const s of [-1, 1]) K.seg([s * 0.03, 0.03, -0.27], [s * 0.03, -0.03, -0.28], 0.012, 0.002, 5);
  }, x, 0, z, yaw); };
  const ribcage = (x, z, yaw, s = 1) => { if (col || lod > 3) return; K.at(() => {
    boneP(); bone([0, 0.12 * s, 0.5 * s], [0, 0.14 * s, -0.5 * s], 0.03 * s);
    for (let k = 0; k < 7; k++) { const zz = -0.4 * s + k * 0.13 * s, w = (0.26 - Math.abs(k - 3) * 0.03) * s; for (const sd of [-1, 1]) { bone([0, 0.14 * s, zz], [sd * w, 0.3 * s, zz + 0.03], 0.016 * s); bone([sd * w, 0.3 * s, zz + 0.03], [sd * (w + 0.02), 0.02, zz + 0.08], 0.014 * s); } }
  }, x, 0, z, yaw); };
  const brazier = (x, z, cold) => {
    if (col) { K.box(x - 0.45, 0, z - 0.45, x + 0.45, 1.15, z + 0.45); return; }
    K.paint(TX.iron, "oklch(0.9 0.01 60)", 0.55, 0.7);
    for (let k = 0; k < 3; k++) { const a = (k / 3) * 6.283 + 0.5; K.seg([x + Math.cos(a) * 0.5, 0, z + Math.sin(a) * 0.5], [x + Math.cos(a) * 0.24, 0.92, z + Math.sin(a) * 0.24], 0.035, 0.028, 5); }
    K.seg([x, 0.84, z], [x, 1.15, z], 0.26, 0.5, 12, true); K.seg([x, 1.13, z], [x, 1.17, z], 0.52, 0.52, 12);
    K.paint(null, cold ? "#0d1a24" : "#2a120a", 1); ctx.emissive(cold ? "#1d6fb0" : "#ff5a14");
    for (let k = 0; k < 7; k++) K.rock(x + (H(x, z, k) - 0.5) * 0.5, 1.15, z + (H(z, x, k) - 0.5) * 0.5, 0.1, 0.06, 0.09, 5, 3, 0.3);
    ctx.emissive(null);
  };
  if (on("entry")) {
  // ================= ENTRY: the return gate in a dressed-granite frame, iron brazier, frost
  carved(0.9);
  K.bbox(-1.9, 0, -1.95, -1.2, 3.0, -1.05, 0.04); K.bbox(1.2, 0, -1.95, 1.9, 3.0, -1.05, 0.04); K.bbox(-2.15, 3.0, -2.0, 2.15, 3.7, -1.0, 0.04);
  if (!col) {
    K.bbox(-2.05, 0, -2.05, -1.05, 0.3, -0.95, 0.03); K.bbox(1.05, 0, -2.05, 2.05, 0.3, -0.95, 0.03);
    K.bbox(-0.32, 2.9, -2.1, 0.32, 3.55, -0.95, 0.03); // keystone
    snow(); K.rock(0, 3.72, -1.5, 2.1, 0.08, 0.5, 10, 3, 0.15);
    ice(); for (let k = 0; k < 14; k++) { const x = -2 + k * 0.31; K.seg([x, 3.0, -2.02], [x, 3.0 - 0.1 - H(k, 1, 20) * 0.45, -2.03], 0.025, 0.003, 5); }
    crystal(-3.6, 0, -6.9, 0.9, 7, 1); crystal(-4.0, 0, -4.2, 0.55, 5, 2);
  }
  brazier(3.2, -5.6, false);
  }
  if (on("tunnel")) {
  // ================= TUNNEL: walls glazed in flowing ice, the dead adventurer
  if (!col && lod <= 3) {
    ice("#0a2238");
    for (const x of [-1.8, 1.8]) for (let z = -20.6; z < -8.2; z += 0.55) {
      const h = H(x, z, 21), y = 0.4 + 2.6 * H(z, x, 22);
      K.rock(x - Math.sign(x) * 0.06, y, z, 0.12, 0.6 + 0.9 * h, 0.4 + 0.3 * h, 7, 5, 0.2);
    }
    ice(); K.rock(0, 3.36, -14.5, 1.7, 0.08, 6.4, 10, 4, 0.1); // the glazed ceiling
    crystal(-1.3, 0, -14.6, 0.7, 7, 3); crystal(1.4, 0, -18.8, 0.5, 5, 4); crystal(1.35, 2.4, -11, 0.35, 4, 5);
    // the dead adventurer, slumped against the west wall, pack beside him
    K.at(() => K.skeleton(false), -1.15, 0.02, -16.4, 80, 0, 4);
    K.paint(TX.leather, "oklch(0.75 0.06 55)", 0.9); K.bbox(-1.65, 0, -17.6, -1.05, 0.62, -17.15, 0.04); K.bbox(-1.6, 0.62, -17.55, -1.1, 0.7, -17.2, 0.03);
    K.paint(null, "#5b4a3a", 1); K.seg([-1.7, 0.78, -17.38], [-1.0, 0.78, -17.38], 0.11, 0.11, 8, true); // bedroll
    K.paint(TX.iron, "oklch(0.85 0 0)", 0.4, 0.8); K.box(-0.7, 0.02, -15.7, -0.66, 0.035, -14.8); K.box(-0.78, 0.02, -15.75, -0.58, 0.05, -15.7);
    K.paint(TX.oak, "oklch(0.8 0.03 60)"); K.seg([-0.68, 0.035, -15.75], [-0.68, 0.035, -16.0], 0.02, 0.02, 5, true);
    K.paint(null, "#3a2a1c", 1); K.cyl(-0.9, 0, -17.9, 0.08, 0.06, 0.2, 7); // a lantern long dead
    snow(); K.rock(-1.35, 0.72, -17.4, 0.32, 0.04, 0.22, 6, 3, 0.1);
  }
  }
  if (on("cavern")) {
  // ================= CAVERN: the frozen waterfall on the west wall, stalagmites, a frozen pool
  if (!col) {
    rock(0.84); K.box(-9, 7.6, -34, -7.8, 9, -26); // the lip it pours from
    ice("#0d2c48"); ctx.smooth();
    const cols = lod <= 1 ? 26 : lod <= 2 ? 16 : 8;
    for (let k = 0; k < cols; k++) {
      const z = -33.4 + 6.8 * H(k, 2, 30), x = -8.85 + 1.0 * H(k, 3, 31), r0 = 0.25 + 0.35 * H(k, 4, 32), len = 3 + 5.2 * H(k, 5, 33);
      K.seg([x, 7.7, z], [x + 0.25 + 0.3 * H(k, 6, 34), 7.7 - len, z], r0, len > 7 ? r0 * 0.9 : 0.02, 9, true);
    }
    for (let k = 0; k < 7; k++) K.rock(-8.4 + 0.5 * H(k, 7, 35), 0.9 + 1.2 * H(k, 8, 36), -33 + k * 1.0, 0.8, 1.2 + 0.6 * H(k, 9, 37), 0.7, 9, 6, 0.15); // the frozen plunge
    ctx.flat();
    ice("#0a2238"); K.seg([-5.4, 0, -30], [-5.4, 0.08, -30], 3.2, 3.0, 20, true); // the frozen pool
    crystal(-7.2, 0.1, -26.4, 1.2, 8, 6); crystal(-6.8, 0.1, -34.2, 1.0, 7, 7); crystal(7.6, 0, -23.2, 0.8, 6, 8);
  } else { K.box(-9, 0, -34, -7.4, 7.7, -26); K.box(-8.6, 0, -33.5, -2.3, 0.08, -26.5); }
  // stalagmites (collide) with frost caps
  for (const [x, z, s] of [[4.5, -27.5, 1.2], [-2.5, -36, 1.5], [6.8, -31, 0.9], [-1.2, -25.2, 0.7]]) {
    if (col) { K.box(x - 0.45 * s, 0, z - 0.45 * s, x + 0.45 * s, 2.6 * s, z + 0.45 * s); continue; }
    rock(0.86); ctx.smooth(); K.seg([x, 0, z], [x + 0.1, 1.2 * s, z], 0.6 * s, 0.38 * s, 9, true); K.seg([x + 0.1, 1.2 * s, z], [x - 0.05, 2.7 * s, z + 0.05], 0.38 * s, 0.04, 9); ctx.flat();
    snow(); K.rock(x + 0.08, 1.2 * s, z, 0.42 * s, 0.05, 0.42 * s, 7, 3, 0.15);
  }
  // hanging stalactites in the cavern's high vault
  if (!col && lod <= 2) { rock(0.8); ctx.smooth(); for (let k = 0; k < 12; k++) { const x = -7 + 14 * H(k, 1, 40), z = -37 + 14 * H(k, 2, 41), len = 1 + 2.4 * H(k, 3, 42); K.seg([x, 9.05, z], [x, 9 - len, z], 0.3 + 0.3 * H(k, 4, 43), 0.03, 8); } ctx.flat(); }
  }
  if (on("den")) {
  // ================= DEN: bones, a deer's carcass, wolf beds of trampled fur, a crack of daylight
  if (!col) {
    for (const [x, z, rx] of [[2, -54.5, 1.4], [9, -54, 1.6], [9.5, -47.5, 1.3]]) { K.paint(null, "#4a4440", 1); K.seg([x, 0, z], [x, 0.05, z], rx, rx * 0.9, 12, true); K.paint(null, "#8a8076", 1); K.seg([x, 0.05, z], [x, 0.08, z], rx * 0.7, rx * 0.5, 10, true); }
    scatterBones(-0.5, 11.5, -56.5, -44.5, lod <= 1 ? 70 : 36, 50);
    ribcage(7, -51.5, 30, 1.25); ribcage(1.5, -48, -60, 0.8); ribcage(10.5, -55.5, 120, 0.9);
    beastSkull(6.2, -50.2, 200); beastSkull(3.4, -55.2, 40); beastSkull(10.8, -46.6, 300); beastSkull(-0.2, -50.5, 90);
    K.at(() => K.skeleton(true), 1.2, 0.02, -45.5, 150, 0, 10); // a man the pack dragged in
    K.paint(null, "#1c1e22", 1); ctx.emissive("#9fc4e8"); K.box(5.2, 4.98, -51.4, 6.8, 5.0, -50.0); ctx.emissive(null); // the crack in the roof
    snow(); for (let k = 0; k < 5; k++) K.rock(5.6 + 0.9 * H(k, 1, 51), 0.04, -51 + 1.2 * H(k, 2, 52), 0.45, 0.06, 0.4, 7, 3, 0.2); // snow sifted down
    crystal(11.3, 0, -44.8, 0.7, 6, 9);
  }
  }
  if (on("shrine")) {
  // ================= SHRINE: carved stone floor, pillars two standing two fallen, roof collapsed in the north-west, the altar dais
  carved(0.85); if (!col) K.box(-6, 0, -75, 8, 0.02, -61);
  const pillar = (x, z) => { carved(0.86); K.bbox(x - 0.55, 0, z - 0.55, x + 0.55, 0.4, z + 0.55, 0.04); if (col) K.box(x - 0.4, 0, z - 0.4, x + 0.4, 6, z + 0.4); else { ctx.smooth(); K.cyl(x, 0.4, z, 0.4, 0.36, 5.2, 12); ctx.flat(); K.bbox(x - 0.55, 5.5, z - 0.55, x + 0.55, 6, z + 0.55, 0.04); } };
  pillar(-3, -71); pillar(6, -64.5);
  for (const [x, z, yaw] of [[5.5, -72.5, 70], [-3.2, -64.8, -20]]) K.at(() => { // toppled drums
    if (col) { K.box(-2.4, 0, -0.42, 2.4, 0.8, 0.42); return; }
    carved(0.82); ctx.smooth(); K.seg([-2.4, 0.4, 0], [-0.2, 0.4, 0], 0.4, 0.4, 12, true); K.seg([0.05, 0.38, 0.05], [2.3, 0.38, 0.1], 0.38, 0.38, 12, true); ctx.flat();
    snow(); K.rock(0, 0.8, 0, 2.2, 0.05, 0.25, 9, 3, 0.15);
  }, x, 0, z, yaw);
  rock(0.8); // the collapse: rubble mounded into the NW corner up to the broken roof
  for (const [x, y, z, a, b, c] of [[-5, 0.6, -63, 1.4, 1, 1.5], [-3.6, 0.4, -62.4, 1.1, 0.6, 1.0], [-5.2, 1.8, -64.5, 1.1, 1.0, 1.3], [-4.6, 3.0, -62.6, 1.0, 1.2, 1.0], [-5.3, 4.4, -63.2, 0.9, 1.2, 1.2], [-2.6, 0.3, -64, 0.6, 0.35, 0.7], [-4.2, 0.35, -66.2, 0.8, 0.4, 0.7]]) K.rock(x, y, z, a, b, c, 8, 5, 0.22);
  if (!col) { carved(0.8); K.at(() => K.bbox(-1.4, 0, -0.3, 1.4, 0.55, 0.3, 0.04), -2.4, 1.4, -63.4, 25, 0, 28); snow(); K.rock(-4.6, 4.4, -63.2, 1.0, 0.1, 1.0, 7, 3, 0.2); }
  // the altar dais (east, off the route): three 0.18 steps, a broken altar and the draugr idol
  carved(0.84); K.box(3, 0, -74.6, 7.6, 0.18, -70.2); K.box(3, 0, -74.6, 7.6, 0.36, -70.48); K.box(3, 0, -74.6, 7.6, 0.54, -70.76);
  carved(0.8); K.bbox(4.2, 0.54, -74.2, 6.4, 1.5, -73.0, 0.05);
  if (!col) {
    K.at(() => K.bbox(-0.8, 0, -0.5, 0.8, 0.25, 0.5, 0.04), 5.9, 1.5, -73.6, 12, 0, -14); // the split top slab
    // the idol: a draugr's horned helm on a stone post
    carved(0.75); K.bbox(5.1, 1.5, -74.1, 5.5, 2.4, -73.7, 0.03);
    K.paint(TX.iron, "oklch(0.7 0.01 240)", 0.5, 0.8); ctx.smooth(); K.rock(5.3, 2.62, -73.9, 0.28, 0.26, 0.3, 10, 6, 0.04);
    for (const s of [-1, 1]) { K.seg([5.3 + s * 0.24, 2.66, -73.9], [5.3 + s * 0.48, 2.95, -73.85], 0.07, 0.04, 7); K.seg([5.3 + s * 0.48, 2.95, -73.85], [5.3 + s * 0.52, 3.3, -73.95], 0.04, 0.005, 7); }
    ctx.flat(); K.paint(null, "#05090c", 1); ctx.emissive("#3fb6ff"); for (const s of [-1, 1]) K.box(5.3 + s * 0.11 - 0.05, 2.6, -74.21, 5.3 + s * 0.11 + 0.05, 2.65, -74.19); ctx.emissive(null);
    K.paint(null, "#2a2622", 1); for (let k = 0; k < 5; k++) K.cyl(4.4 + k * 0.4, 1.5, -73.25, 0.04, 0.035, 0.08 + 0.12 * H(k, 1, 60), 6); // dead candle stubs
    scatterBones(-5.5, 7.5, -74.5, -66, 14, 61); K.at(() => K.skeleton(false), 1.8, 0.02, -72, -30);
    crystal(7.4, 0, -61.6, 0.8, 6, 10); crystal(-5.5, 0, -74.4, 1.1, 8, 11);
  }
  brazier(5, -68.5, true);
  }
  if (on("boss")) {
  // ================= BOSS: pillared hall, the jarl's dais and throne of ice and stone, braziers of cold fire, bones of the fallen
  for (const x of [-8.5, 8.5]) for (const z of [-84, -90, -96]) {
    carved(0.84); K.bbox(x - 0.6, 0, z - 0.6, x + 0.6, 0.45, z + 0.6, 0.04);
    if (col) K.box(x - 0.45, 0, z - 0.45, x + 0.45, 8, z + 0.45); else { ctx.smooth(); K.cyl(x, 0.45, z, 0.45, 0.4, 7.2, 12); ctx.flat(); K.bbox(x - 0.62, 7.4, z - 0.62, x + 0.62, 8, z + 0.62, 0.04); }
  }
  carved(0.82); K.box(-4.5, 0, -100, 4.5, 0.18, -95.06); K.box(-4.5, 0, -100, 4.5, 0.36, -95.34); K.box(-4.5, 0, -100, 4.5, 0.54, -95.62);
  // the throne
  if (col) K.box(-1.1, 0.54, -99.6, 1.1, 3.4, -98.0);
  else {
    carved(0.78); K.bbox(-1.1, 0.54, -99.0, 1.1, 1.05, -97.9, 0.04); K.bbox(-1.1, 0.54, -99.6, 1.1, 3.0, -99.0, 0.05);
    for (const s of [-1, 1]) K.bbox(s * 1.1 - 0.18, 0.54, -99.6, s * 1.1 + 0.18, 1.6, -97.9, 0.04);
    ice("#0f3456"); ctx.smooth(); for (let k = 0; k < 9; k++) { const x = -1.2 + k * 0.3, len = 0.8 + 1.6 * (1 - Math.abs(k - 4) / 4) + 0.3 * H(k, 1, 70); K.seg([x, 2.9, -99.35], [x + (H(k, 2, 71) - 0.5) * 0.3, 2.9 + len, -99.45], 0.12, 0.01, 7); } ctx.flat();
    K.paint(null, "#d9cfb6", 0.85); K.rock(-0.9, 1.68, -98.2, 0.1, 0.09, 0.12, 8, 5, 0.06); K.rock(0.9, 1.68, -98.2, 0.1, 0.09, 0.12, 8, 5, 0.06);
    scatterBones(-10, 10, -99, -82, lod <= 1 ? 50 : 24, 72);
    K.at(() => K.skeleton(false), -3.5, 0.02, -88, 60); K.at(() => K.skeleton(true), 4.2, 0.02, -85.5, -130); K.at(() => K.skeleton(false), -6.4, 0.02, -95.5, 10);
    K.paint(TX.iron, "oklch(0.8 0 0)", 0.4, 0.8); K.at(() => { K.box(-0.03, 0.02, -0.5, 0.03, 0.04, 0.45); K.box(-0.15, 0.02, 0.45, 0.15, 0.06, 0.5); }, -2.6, 0, -87.2, 35); // dropped blades
    K.at(() => { K.box(-0.03, 0.02, -0.5, 0.03, 0.04, 0.45); K.box(-0.15, 0.02, 0.45, 0.15, 0.06, 0.5); }, 3.4, 0, -86.4, -70);
    K.paint(TX.oak, "oklch(0.75 0.03 60)"); K.at(() => { ctx.smooth(); K.seg([0, 0.32, 0], [0, 0.32, 0.06], 0.32, 0.32, 14, true); ctx.flat(); }, 5.5, 0, -88.4, 20, 80); // a split shield
    crystal(-10.3, 0, -80.8, 1.4, 9, 12); crystal(10.3, 0, -80.8, 1.2, 8, 13); crystal(-10.3, 0, -99.3, 1.6, 9, 14); crystal(10.3, 0, -99.3, 1.5, 9, 15);
    // banners of rotted hide behind the throne
    for (const x of [-3.2, 3.2]) { K.paint(null, "oklch(0.3 0.04 240)", 1); K.box(x - 0.7, 2.6, -99.95, x + 0.7, 6.2, -99.9); K.tri([x - 0.7, 2.6, -99.9], [x + 0.7, 2.6, -99.9], [x, 2.0, -99.9], [x, 3, -99]); K.paint(TX.oak, "oklch(0.8 0.02 60)"); K.seg([x - 0.9, 6.25, -99.85], [x + 0.9, 6.25, -99.85], 0.04, 0.04, 5, true); }
  }
  }
  for (const [x, z] of BRAZIERS.slice(2)) brazier(x, z, true);
}
export function geometry(ctx) { build(ctx, false); }
export function collider(ctx) { build(ctx, true); }
