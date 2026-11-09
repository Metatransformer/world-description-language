// CROWFOOT MINE: an abandoned silver working in the hills NE of Valenfeld. Root at the place origin, floor y = 0,
// the gate wall at z = 0, the route running -z: entry → timbered adit → ore hall (winch over the old shaft) →
// flooded gallery (plank walk) → collapsed lower drift → the Brood Mother's nest.
import { kit } from "./barrow-kit.js";
import { sea, rng } from "./grotto-kit.js";
// PARAMS (Codex Kits; {} = as built): entry, adit, hall, gallery, drift, nest = false strips that stretch's props, carts and webs;
// dress = false strips them all, leaving the mine shell.
// params.room = one stretch drawn alone (its shell and its dressing): entry | adit | hall | gallery | drift | nest
let P = {}; const on = (k) => (P.room ? k === "dress" || k === P.room : true) && P[k] !== false;
const solo = (r) => !P.room || r.id === (P.room === "gallery" ? "flood" : P.room);
const inZ = (z) => { if (!P.room) return true; const r = ROOMS.find(solo); return !r || (z <= r.z1 + 0.9 && z >= r.z0 - 0.9); };
export const TX = { rock: "cdn/texture-grey-schist-mine-rock.png", floor: "cdn/texture-packed-gravel-mine-floor.png", oak: "cdn/texture-dark-oak-planks-weathered.png", iron: "cdn/texture-wrought-iron.png", plank: "cdn/texture-weathered-grey-dock-planks.png" };
const T = 0.8, DOOR = 1.5, DH = 3.0;
export const ROOMS = [
  { id: "entry", x0: -3, x1: 3, z0: -8, z1: 0, h: 4 },
  { id: "adit", x0: -2.4, x1: 2.4, z0: -24, z1: -8.8, h: 3.6 },
  { id: "hall", x0: -9, x1: 9, z0: -40, z1: -24.8, h: 6.5 },
  { id: "flood", x0: -4, x1: 4, z0: -62, z1: -40.8, h: 4 },
  { id: "drift", x0: -6, x1: 6, z0: -76, z1: -62.8, h: 4.5 },
  { id: "nest", x0: -11, x1: 11, z0: -98, z1: -76.8, h: 8 },
];
export const WET = [-59, -43.5];
const WET_Y = -0.45, WATER_Y = -0.14, WALK = [1.5, 3.3];
export const GATE = { x: 0, z: -1.6 };
export const LAMPS = [[-3, 2.6, -5, 1, 0], [2.4, 2.4, -16, -1, 0], [-9, 3, -30, 1, 0], [9, 3, -36, -1, 0], [-4, 2.6, -47, 1, 0], [-4, 2.6, -57, 1, 0], [6, 2.8, -70, -1, 0]];

function shell(K, ctx, col) {
  const rock = () => K.paint(TX.rock, "oklch(0.92 0.01 70)", 0.8);
  const floor = () => K.paint(TX.floor, "oklch(0.9 0.015 70)", 0.9);
  ROOMS.forEach((r, i) => {
    if (P.room && !solo(r) && ROOMS[i + 1] && solo(ROOMS[i + 1])) return endWall(K, col, r, ROOMS[i + 1]); // a solo room keeps the doorway wall it is entered by
    if (!solo(r)) return;
    const next = ROOMS[i + 1], top = r.h + 0.5;
    floor();
    if (r.id === "flood") {
      K.box(r.x0 - T, -0.6, WET[1], r.x1 + T, 0, r.z1); K.box(r.x0 - T, -0.6, r.z0 - T, r.x1 + T, 0, WET[0]);
      K.box(r.x0 - T, -1.0, WET[0], r.x1 + T, WET_Y, WET[1]);
      K.paint(TX.plank, "oklch(0.85 0.02 70)", 0.85); K.box(WALK[0], -0.06, WET[0] - 0.2, WALK[1], 0, WET[1] + 0.2);
      if (col) K.box(WALK[0], WET_Y, WET[0], WALK[1], 0, WET[1]);
    } else K.box(r.x0 - T, -0.6, r.z0 - T, r.x1 + T, 0, r.z1);
    rock(); K.box(r.x0 - T, r.h, r.z0 - T, r.x1 + T, top, r.z1);
    const yb = r.id === "flood" ? -1 : -0.6;
    K.box(r.x0 - T, yb, r.z0 - T, r.x0, top, r.z1); K.box(r.x1, yb, r.z0 - T, r.x1 + T, top, r.z1);
    if (i === 0) K.box(r.x0 - T, -0.6, r.z1, r.x1 + T, top, r.z1 + T);
    endWall(K, col, r, next);
  });
}
function endWall(K, col, r, next) {
    const top = r.h + 0.5; K.paint(TX.rock, "oklch(0.92 0.01 70)", 0.8);
    const sx0 = Math.min(r.x0, next ? next.x0 : r.x0) - T, sx1 = Math.max(r.x1, next ? next.x1 : r.x1) + T, sTop = Math.max(top, next ? next.h + 0.5 : 0);
    const z0 = r.z0 - T, z1 = r.z0;
    if (!next) K.box(sx0, -0.6, z0, sx1, sTop, z1);
    else {
      K.box(sx0, -0.6, z0, -DOOR, sTop, z1); K.box(DOOR, -0.6, z0, sx1, sTop, z1); K.box(-DOOR, DH, z0, DOOR, sTop, z1);
      if (!col) { // every doorway is a full timber set
        K.paint(TX.oak, "oklch(0.72 0.03 55)", 0.85);
        for (const s of [-1, 1]) K.bbox(s * DOOR - 0.16, 0, z0 - 0.12, s * DOOR + 0.16, DH, z1 + 0.12);
        K.bbox(-DOOR - 0.3, DH - 0.05, z0 - 0.14, DOOR + 0.3, DH + 0.3, z1 + 0.14);
      }
    }
}

// a timber set across a drift: two props, a cap, lagging over it
function set(K, ctx, col, r, z, y0 = 0) {
  const a = r.x0 + 0.16, b = r.x1 - 0.16, cap = r.h - 0.4;
  K.paint(TX.oak, "oklch(0.7 0.03 55)", 0.85);
  K.bbox(a - 0.14, y0, z - 0.14, a + 0.14, cap, z + 0.14); K.bbox(b - 0.14, y0, z - 0.14, b + 0.14, cap, z + 0.14);
  if (col) return;
  K.bbox(r.x0, cap, z - 0.16, r.x1, cap + 0.3, z + 0.16);
  for (const s of [-1, 1]) K.seg([s > 0 ? b : a, cap - 0.7, z], [(s > 0 ? b : a) - s * 0.55, cap + 0.02, z], 0.07, 0.07, 5, true);
  if (ctx.lod <= 2) { K.paint(TX.plank, "oklch(0.6 0.02 60)", 0.9); for (let x = r.x0 + 0.2; x < r.x1 - 0.1; x += 0.42) K.box(x, cap + 0.3, z - 1.1, x + 0.34, cap + 0.36, z + 1.1); }
}

const railY = (z) => (z < WET[1] + 0.2 && z > WET[0] - 0.2 ? WET_Y : 0);
function rails(K, ctx, col, z0, z1, yAt) {
  if (col) return;
  K.paint(TX.oak, "oklch(0.55 0.03 50)", 0.9);
  for (let z = z0; z > z1; z -= 0.8) { if (!inZ(z)) continue; const y = yAt(z); K.box(-0.85, y, z - 0.11, 0.85, y + 0.08, z + 0.11); }
  K.paint(TX.iron, "oklch(0.6 0.01 60)", 0.45, 0.8);
  for (const x of [-0.55, 0.55]) for (let z = z0; z > z1; z -= 2) { if (!inZ(z) || !inZ(z - 2)) continue; const y = yAt(z - 1); K.box(x - 0.035, y + 0.08, z - 2, x + 0.035, y + 0.18, z); }
}

export function cart(K, ctx, col, S, x, y, z, yaw = 0, roll = 0, ore = true) {
  K.at(() => {
    if (col) return K.box(-0.55, 0, -0.8, 0.55, 1.05, 0.8);
    K.paint(TX.plank, "oklch(0.75 0.03 55)", 0.8);
    K.bbox(-0.5, 0.32, -0.75, 0.5, 0.4, 0.75);
    for (const s of [-1, 1]) { K.bbox(s * 0.5 - 0.04, 0.32, -0.75, s * 0.5 + 0.04, 1.02, 0.75); K.bbox(-0.5, 0.32, s * 0.75 - 0.04, 0.5, 1.02, s * 0.75 + 0.04); }
    S.iron();
    for (const zz of [-0.77, -0.25, 0.25, 0.77]) for (const s of [-1, 1]) K.box(s * 0.5 - 0.06 * (s < 0 ? 1 : 0), 0.32, zz - 0.04, s * 0.5 + 0.06 * (s > 0 ? 1 : 0), 1.04, zz + 0.04);
    for (const zz of [-0.48, 0.48]) { K.seg([-0.62, 0.2, zz], [0.62, 0.2, zz], 0.03, 0.03, 5, true); for (const s of [-1, 1]) K.seg([s * 0.55, 0.2, zz], [s * 0.62, 0.2, zz], 0.2, 0.2, ctx.lod <= 2 ? 12 : 8, true); }
    K.seg([0, 0.42, 0.79], [0, 0.42, 0.98], 0.03, 0.03, 4, true);
    if (ore) { K.paint(TX.rock, "oklch(0.8 0.01 250)", 0.35, 0.6); for (let k = 0; k < 7; k++) K.rock(-0.3 + ctx.random() * 0.6, 0.95, -0.5 + ctx.random() * 1, 0.18, 0.12, 0.16, 6, 4, 0.3); }
  }, x, y, z, yaw, 0, roll);
}

function veins(K, ctx, x, z0, z1, h, s) {
  K.paint(null, "oklch(0.88 0.01 240)", 0.22, 1);
  for (let z = z0; z > z1; z -= 2.6) {
    let y = 1 + ctx.random() * (h - 2.5), zz = z, pts = [[x, y, zz]];
    for (let k = 0; k < 5; k++) { zz -= 0.3 + ctx.random() * 0.4; y += (ctx.random() - 0.45) * 0.6; pts.push([x - s * 0.02, y, zz]); }
    for (let k = 0; k < pts.length - 1; k++) K.seg(pts[k], pts[k + 1], 0.045, 0.03, 4);
  }
}

function skin(K, ctx) {
  const lod = ctx.lod; if (lod > 3) return;
  K.paint(TX.rock, "oklch(0.85 0.01 70)", 0.75);
  for (const r of ROOMS) {
    if (!solo(r)) continue;
    const per = lod <= 2 ? 1.7 : 3.4, yb = r.id === "flood" ? WET_Y : 0;
    for (const s of [-1, 1]) {
      const x = s < 0 ? r.x0 : r.x1;
      for (let z = r.z1 - 0.7; z > r.z0 + 0.4; z -= per * (0.7 + ctx.random() * 0.6)) {
        K.rock(x, yb + ctx.random() * r.h * 0.7, z, 0.4 + ctx.random() * 0.5, 0.5 + ctx.random() * 0.8, 0.6 + ctx.random() * 0.6, 7, 5, 0.3);
        if (ctx.random() < 0.5) K.rock(x - s * 0.2, yb + 0.1, z + 0.4, 0.35 + ctx.random() * 0.3, 0.22 + ctx.random() * 0.2, 0.45, 6, 4, 0.35);
      }
    }
  }
  // one vein run per stretch; a solo room keeps only its own (the runs share ctx.random, so the full build draws all four in order)
  for (const [x, z0, z1, h, sd] of [[-9, -25.5, -39, 6.5, -1], [9, -26, -39.5, 6.5, 1], [-4, -42, -61, 4, -1], [6, -64, -75, 4.5, 1]]) if (inZ(z0) && inZ(z1)) veins(K, ctx, x, z0, z1, h, sd);
  if (P.room && P.room !== "gallery") return;
  ctx.smooth();
  ctx.albedo(null); ctx.color("#1d2a26", 0.8); ctx.roughness(0.04); ctx.metalness(0.2); ctx.emissive(0.0, 0.012, 0.012);
  K.quad([-4, WATER_Y, WET[1]], [4, WATER_Y, WET[1]], [4, WATER_Y, WET[0]], [-4, WATER_Y, WET[0]], [0, -1, -50]);
  ctx.emissive(null); ctx.flat();
}

function dress(K, ctx, col) {
  const S = sea(K, ctx, col), R = rng(11), draw = !col, lod = col ? 4 : ctx.lod;
  const [entry, adit, hall, flood, drift, nest] = ROOMS;
  if (on("entry")) {
  // ENTRY: the gate's frame, tool rack, a dead man's lunch pail
  K.paint(TX.oak, "oklch(0.72 0.03 55)", 0.85);
  for (const s of [-1, 1]) K.bbox(s * 1.55 - 0.17, 0, GATE.z - 0.22, s * 1.55 + 0.17, 3.3, GATE.z + 0.22);
  K.bbox(-1.95, 3.1, GATE.z - 0.25, 1.95, 3.45, GATE.z + 0.25);
  set(K, ctx, col, entry, -5.5);
  S.crate(-2.3, 0, -6.8, 0.7, 14); S.barrel(2.4, 0, -6.9); S.barrel(2.3, 0, -3.3, 0.26, 0.75);
  if (draw) { S.iron(); for (let k = 0; k < 3; k++) { K.seg([-2.85, 0.05, -3 - k * 0.5], [-2.95, 1.5, -3.2 - k * 0.5], 0.025, 0.025, 4, true); K.seg([-3.0, 1.45, -3.05 - k * 0.5], [-2.7, 1.62, -3.35 - k * 0.5], 0.03, 0.01, 4, true); } }
  }
  if (on("adit")) {
  // ADIT: timber sets every 2.5 m, the rails start
  for (let z = -10; z > -23.5; z -= 2.5) set(K, ctx, col, adit, z);
  if (!P.room) rails(K, ctx, col, -1, -74, railY);
  cart(K, ctx, col, S, 0, 0, -14.5, 0, 0, true);
  }
  if (on("hall")) {
  // HALL: two rows of great props, a winch over the boarded shaft, a spilled cart, stacked timber
  for (const x of [-4.5, 4.5]) for (const z of [-28.5, -36]) { K.paint(TX.oak, "oklch(0.66 0.03 55)", 0.85); K.bbox(x - 0.22, 0, z - 0.22, x + 0.22, 6.1, z + 0.22); if (draw) K.bbox(x - 1.4, 6.0, z - 0.25, x + 1.4, 6.5, z + 0.25); }
  if (draw) { K.paint(TX.plank, "oklch(0.7 0.02 60)", 0.85); for (let k = 0; k < 7; k++) if (k !== 3 && k !== 4) K.box(-6.8 + k * 0.45, 0, -34.5, -6.42 + k * 0.45, 0.07, -31.2); S.oak(); K.box(-7.0, 0, -34.7, -3.6, 0.12, -34.5); K.box(-7.0, 0, -31.2, -3.6, 0.12, -31.0); K.paint(null, "#050404", 1); K.box(-5.45, 0.005, -34.4, -4.6, 0.01, -31.3); }
  S.oak(); for (const s of [-1, 1]) { K.seg([-5.2 + s * 2, 0, -33.7], [-5.2 + s * 2, 3.4, -32.85], 0.11, 0.09, 6, true); K.seg([-5.2 + s * 2, 0, -32], [-5.2 + s * 2, 3.4, -32.85], 0.11, 0.09, 6, true); }
  if (draw) { K.seg([-7.3, 3.3, -32.85], [-3.1, 3.3, -32.85], 0.22, 0.22, 10, true); S.iron(); K.seg([-3.1, 3.3, -32.85], [-2.6, 3.3, -32.85], 0.04, 0.04, 5, true); K.seg([-2.6, 3.3, -32.85], [-2.6, 2.7, -32.85], 0.035, 0.035, 5, true); S.rope([-5.1, 3.1, -32.85], [-5.0, 0.3, -32.9], 0.02, 0.025); }
  cart(K, ctx, col, S, 6.4, 0, -27.5, 70, 0, true); cart(K, ctx, col, S, 6.8, 0, -38.2, 15, 88, false);
  if (draw) { K.paint(TX.rock, "oklch(0.78 0.01 250)", 0.4, 0.5); for (let k = 0; k < 9; k++) K.rock(5.9 + R() * 1.5, 0.08, -36.9 + R() * 1.2, 0.18, 0.12, 0.16, 6, 4, 0.35); }
  S.oak(); for (let k = 0; k < 4; k++) K.at(() => K.bbox(-0.13, 0, -1.8, 0.13, 0.26, 1.8), -7.9, k * 0.26, -27.5 + (k % 2) * 0.1, 0); for (let k = 0; k < 3; k++) K.at(() => K.bbox(-0.13, 0, -1.8, 0.13, 0.26, 1.8), -7.6, k * 0.26, -27.5, 0);
  S.crate(7.8, 0, -31.5, 0.8, 10); S.crate(7.9, 0.8, -31.4, 0.55, -25); S.barrel(-8.1, 0, -38.9); S.barrel(-7.4, 0, -39.1, 0.28, 0.8);
  }
  if (on("gallery")) {
  // FLOODED GALLERY: sets standing in the water, the plank walk on posts, a drowned cart
  for (let z = -42.5; z > -61.5; z -= 2.6) set(K, ctx, col, flood, z, z < WET[1] && z > WET[0] ? WET_Y : 0);
  if (draw) { S.oak(); for (let z = WET[1]; z >= WET[0]; z -= 1.5) for (const x of WALK) K.seg([x, WET_Y, z], [x, 0, z], 0.07, 0.07, 5, true); }
  cart(K, ctx, col, S, -0.2, WET_Y, -51.5, 8, 0, true);
  }
  if (on("drift")) {
  // DRIFT: the fall that closed the lower level; props snapped and leaning
  for (const z of [-64.5, -67, -74.5]) set(K, ctx, col, drift, z);
  K.paint(TX.oak, "oklch(0.6 0.03 55)", 0.85);
  K.at(() => K.bbox(-0.14, 0, -0.14, 0.14, 4.4, 0.14), -3.6, 0, -70.2, 0, 0, -52);
  K.at(() => K.bbox(-3, -0.15, -0.16, 3, 0.15, 0.16), -2.2, 1.2, -71.4, -12, 0, 18);
  K.paint(TX.rock, "oklch(0.82 0.01 70)", 0.8);
  for (let k = 0; k < (col ? 4 : 16); k++) K.rock(-5.2 + R() * 3.4, R() * 1.1, -68.5 - R() * 5.5, 0.4 + R() * 0.5, 0.3 + R() * 0.4, 0.4 + R() * 0.5, 7, 5, 0.3);
  cart(K, ctx, col, S, 4.1, 0, -68.8, -20, -84, false);
  S.barrel(5.2, 0, -75.2);
  }
  if (on("nest")) {
  // NEST: webs over everything, egg sacs, the wrapped dead
  if (draw && lod <= 2) {
    const nw = [[-11, 8, -77, 1, -1], [11, 8, -77, -1, -1], [-11, 8, -98, 1, 1], [11, 8, -98, -1, 1]];
    for (const [x, y, z, sx, sz] of nw) { K.web([x, y, z], [sx, 0, 0], [0, -1, 0], 4.5); K.web([x, y, z], [0, 0, sz], [0, -1, 0], 4.5); K.web([x, y, z], [sx, 0, 0], [0, 0, sz], 5); }
    K.web([-1.5, 3, -76.95], [1, 0, 0], [0, 1, 0], 1.6); K.web([1.5, 3, -76.95], [-1, 0, 0], [0, 1, 0], 1.6);
    K.web([-6, 8, -87], [1, 0, 0], [0, -1, 0.3], 4); K.web([6, 8, -90], [-1, 0, 0], [0, -1, -0.3], 4);
    for (let k = 0; k < 10; k++) { const x = -10 + R() * 20, z = -79 - R() * 18; K.seg([x, 8, z], [x + (R() - 0.5), 0.5 + R() * 3, z + (R() - 0.5)], 0.006, 0.006, 3); }
  }
  if (draw) {
    for (const [cx, cz, n] of [[-8, -94, 9], [7.5, -95, 8], [-8.5, -81, 6], [0, -97, 5]]) for (let k = 0; k < n; k++) {
      ctx.albedo(null); ctx.color("oklch(0.86 0.04 110)"); ctx.roughness(0.6); ctx.metalness(0); ctx.emissive(0.05, 0.09, 0.02);
      K.rock(cx + (R() - 0.5) * 2.2, 0.2 + R() * 0.3, cz + (R() - 0.5) * 2, 0.22 + R() * 0.12, 0.3 + R() * 0.12, 0.22, 7, 5, 0.08);
    }
    ctx.emissive(null);
    for (const [x, z, a] of [[-9.5, -86, 10], [9.8, -84, -8], [4, -79.5, 60]]) K.at(() => { K.paint(null, "oklch(0.82 0.02 90)", 1); K.seg([0, 0, 0], [0, 1.9, 0], 0.22, 0.12, 8, true); K.seg([0, 0.3, 0], [0, 1.4, 0], 0.27, 0.27, 8); }, x, 0, z, a, 0, a * 0.3);
    for (const [x, z, a] of [[3, -88, 30], [-4, -91, -60]]) K.at(() => K.skeleton(true), x, 0, z, a);
    K.paint(null, "oklch(0.8 0.02 85)", 0.9); for (let k = 0; k < 18; k++) { const x = -3 + R() * 6, z = -92 + R() * 6; K.seg([x, 0.04, z], [x + (R() - 0.5) * 0.6, 0.04, z + (R() - 0.5) * 0.6], 0.025, 0.02, 4, true); }
    S.iron(); K.at(() => { K.seg([0, 0.05, -0.6], [0, 0.05, 0.6], 0.03, 0.03, 4, true); K.seg([-0.35, 0.05, -0.6], [0.35, 0.05, -0.6], 0.04, 0.01, 4, true); }, 5.5, 0, -82, 40);
  }
  K.paint(TX.rock, "oklch(0.78 0.01 70)", 0.8);
  for (const [x, z, s] of [[-9.6, -90, 1.2], [9.4, -92, 1.4], [8.8, -79, 0.9], [-3, -97, 1]]) K.rock(x, s * 0.5, z, s, s * 0.8, s * 0.9, 8, 5, 0.3);
  if (!P.room) for (const l of LAMPS) S.lantern(...l);
  }
  if (P.room) { if (P.room !== "nest" && P.room !== "entry") rails(K, ctx, col, -1, -74, railY); else if (P.room === "entry") rails(K, ctx, col, -1, -74, railY); for (const l of LAMPS) if (inZ(l[2])) S.lantern(...l); }
}

function build(ctx, col) {
  P = ctx.params ?? {};
  const K = kit(ctx, col);
  shell(K, ctx, col);
  if (on("dress")) dress(K, ctx, col);
  if (!col) skin(K, ctx);
}
export function geometry(ctx) { build(ctx, false); }
export function collider(ctx) { build(ctx, true); }
