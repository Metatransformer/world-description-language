// SMUGGLERS' GROTTO: one shell of wet black basalt under the Saltmarch shore. Root at the place origin, floor y = 0,
// the entry wall at z = 0, the route running -z: entry → tidal tunnel (plank walk over pools) → storeroom →
// sea chasm (rope bridge) → the drowned captain's cavern (wrecked hull) → boss chamber.
import { kit } from "./barrow-kit.js";
import { sea, TX, rng } from "./grotto-kit.js";
// PARAMS (Codex Kits; {} = as built): entry, tunnel, storeroom, cavern (the wreck and camp), boss = false strips that room's props;
// dress = false strips them all. The cave, the sea, the rope bridge and the lights always stand.
let P = {}; const on = (k) => P[k] !== false;
const T = 0.8, DOOR = 1.6, DH = 3.2;
export const ROOMS = [
  { id: "entry",  x0: -4,  x1: 4,  z0: -7,  z1: 0,     h: 4.5 },
  { id: "tunnel", x0: -3,  x1: 3,  z0: -27, z1: -7.8,  h: 4 },
  { id: "store",  x0: -7,  x1: 7,  z0: -40, z1: -27.8, h: 4.6 },
  { id: "chasm",  x0: -6,  x1: 6,  z0: -56, z1: -40.8, h: 9 },
  { id: "cavern", x0: -11, x1: 11, z0: -78, z1: -56.8, h: 8 },
  { id: "boss",   x0: -9,  x1: 9,  z0: -96, z1: -78.8, h: 7.5 },
];
export const POOL = [-25, -9.8], PIT = [-52.5, -43.5], PIT_Y = -9, SEA_Y = -7;
export const WALK = [[0, -7.6], [0, -10.2], [0.7, -14], [-0.9, -19.5], [0.3, -24.6], [0, -27.2]];
// wall lanterns: wall-face point (x, flame y, z) and the inward normal; braziers and fire: feet
export const LANTERNS = [[-4, 2.7, -3.5, 1, 0], [3, 2.6, -17, -1, 0], [7, 2.8, -34, -1, 0], [-6, 2.8, -42.2, 1, 0], [6, 2.8, -54.6, -1, 0], [-6, 3.2, -78, 0, 1]];
export const FIRES = [[4.5, 0, -61]];
export const BRAZIERS = [[-4.5, 0, -89], [4.5, 0, -89]];
export const GATE = { x: 0, z: -1.6 };

function shell(K, ctx, col) {
  const rock = () => K.paint(TX.rock, "oklch(0.93 0.01 220)", 0.42);
  const floor = () => K.paint(TX.floor, "oklch(0.92 0.01 200)", 0.5);
  ROOMS.forEach((r, i) => {
    const next = ROOMS[i + 1], top = r.h + 0.5;
    // floor (the chasm's around its pit, the tunnel's sunk under its pools)
    floor();
    if (r.id === "chasm") { K.box(r.x0 - T, PIT_Y, PIT[1], r.x1 + T, 0, r.z1); K.box(r.x0 - T, PIT_Y, r.z0 - T, r.x1 + T, 0, PIT[0]); }
    else if (r.id === "tunnel") { K.box(r.x0 - T, -0.6, POOL[1], r.x1 + T, 0, r.z1); K.box(r.x0 - T, -0.6, r.z0 - T, r.x1 + T, 0, POOL[0]); K.box(r.x0 - T, -0.6, POOL[0], r.x1 + T, -0.3, POOL[1]); }
    else K.box(r.x0 - T, -0.6, r.z0 - T, r.x1 + T, 0, r.z1);
    // ceiling
    rock(); K.box(r.x0 - T, r.h, r.z0 - T, r.x1 + T, top, r.z1);
    // side walls (the chasm's run down into the pit)
    const yb = r.id === "chasm" ? PIT_Y : -0.6;
    K.box(r.x0 - T, yb, r.z0 - T, r.x0, top, r.z1); K.box(r.x1, yb, r.z0 - T, r.x1 + T, top, r.z1);
    // the north wall of the entry: the gate's back
    if (i === 0) K.box(r.x0 - T, -0.6, r.z1, r.x1 + T, top, r.z1 + T);
    // the south wall: spans both rooms, one door at x = 0 (the last room's is solid)
    const sx0 = Math.min(r.x0, next ? next.x0 : r.x0) - T, sx1 = Math.max(r.x1, next ? next.x1 : r.x1) + T, sTop = Math.max(top, next ? next.h + 0.5 : 0);
    const z0 = r.z0 - T, z1 = r.z0;
    if (!next) K.box(sx0, -0.6, z0, sx1, sTop, z1);
    else {
      K.box(sx0, -0.6, z0, -DOOR, sTop, z1); K.box(DOOR, -0.6, z0, sx1, sTop, z1); K.box(-DOOR, DH, z0, DOOR, sTop, z1);
      if (!col && ctx.lod <= 2) { // a doorway propped with smugglers' timber
        K.paint(TX.oak, "oklch(0.78 0.03 60)", 0.85);
        for (const s of [-1, 1]) K.box(s * DOOR - 0.14, 0, z0 - 0.1, s * DOOR + 0.14, DH, z1 + 0.1);
        K.box(-DOOR - 0.2, DH - 0.05, z0 - 0.1, DOOR + 0.2, DH + 0.25, z1 + 0.1);
      }
    }
  });
}

// the cave's own skin: lumps along the walls, stalactites, wet boulders: drawn only
function skin(K, ctx, S) {
  const lod = ctx.lod; if (lod > 3) return;
  const rock = () => K.paint(TX.rock, "oklch(0.9 0.01 220)", 0.38);
  for (const r of ROOMS) {
    rock();
    const per = lod <= 2 ? 1.6 : 3.2;
    for (const s of [-1, 1]) {
      const x = s < 0 ? r.x0 : r.x1;
      for (let z = r.z1 - 0.6; z > r.z0 + 0.4; z -= per * (0.7 + ctx.random() * 0.6)) {
        const pit = r.id === "chasm" && z < PIT[1] && z > PIT[0];
        const y = pit ? -3 - ctx.random() * 4 : ctx.random() * r.h * 0.7;
        K.rock(x, y, z, 0.5 + ctx.random() * 0.6, 0.6 + ctx.random() * 1.1, 0.7 + ctx.random() * 0.7, 7, 5, 0.3);
        if (!pit && ctx.random() < 0.6) K.rock(x - s * 0.15, 0.1, z + 0.5, 0.45 + ctx.random() * 0.4, 0.35 + ctx.random() * 0.3, 0.5, 6, 4, 0.3);
      }
    }
    for (const zz of [r.z0, r.z1]) for (let x = r.x0 + 0.5; x < r.x1; x += per * 1.2) {
      if (Math.abs(x) < DOOR + 0.6) continue;
      K.rock(x, ctx.random() * r.h * 0.6, zz, 0.7 + ctx.random() * 0.5, 0.8 + ctx.random(), 0.45, 7, 5, 0.3);
    }
    // stalactites, dripping
    const n = Math.round(((r.x1 - r.x0) * (r.z1 - r.z0)) / (lod <= 2 ? 6 : 14));
    for (let k = 0; k < n; k++) {
      const x = r.x0 + 0.4 + ctx.random() * (r.x1 - r.x0 - 0.8), z = r.z0 + 0.4 + ctx.random() * (r.z1 - r.z0 - 0.8), L = 0.3 + ctx.random() * Math.min(1.4, r.h * 0.18);
      K.seg([x, r.h + 0.05, z], [x + (ctx.random() - 0.5) * 0.1, r.h - L, z], 0.14 + L * 0.1, 0.012, 6);
    }
  }
  // barnacle crusts on the tunnel's tide line, kelp in its pools
  for (let z = -9; z > -26; z -= 1.3) for (const s of [-1, 1]) { S.barnacles(s * 2.9, -0.2, 0.7, z, 0.12, 6); if (ctx.random() < 0.7) S.kelp(s * (1.2 + ctx.random() * 1.5), -0.29, z, 0.8 + ctx.random(), ctx.random() * 360); }
  ctx.smooth();
  // water: the tunnel's pools and the sea in the chasm
  ctx.albedo(null); ctx.color("#0d3b3c", 0.78); ctx.roughness(0.04); ctx.metalness(0.2); ctx.emissive(0.0, 0.025, 0.03);
  K.quad([-3, -0.12, POOL[1]], [3, -0.12, POOL[1]], [3, -0.12, POOL[0]], [-3, -0.12, POOL[0]], [0, -1, -15]);
  K.quad([-6, SEA_Y, PIT[1]], [6, SEA_Y, PIT[1]], [6, SEA_Y, PIT[0]], [-6, SEA_Y, PIT[0]], [0, -9, -48]);
  ctx.emissive(null); ctx.flat();
  // foam rocks breaking the sea below the bridge
  K.paint(TX.rock, "oklch(0.85 0.01 220)", 0.3);
  for (let k = 0; k < 7; k++) K.rock(-5 + ctx.random() * 10, SEA_Y + 0.1, PIT[0] + 0.6 + ctx.random() * 7.8, 0.4 + ctx.random() * 0.6, 0.5 + ctx.random() * 0.7, 0.5, 7, 4, 0.35);
}

function dress(K, ctx, col) {
  const S = sea(K, ctx, col), R = rng(7);
  const draw = !col, lod = col ? 4 : ctx.lod;
  if (on("entry")) {
  // ---------- ENTRY: the gate's timber frame, a coil of rope, a hand cart's worth of goods
  K.paint(TX.oak, "oklch(0.75 0.03 60)", 0.85);
  for (const s of [-1, 1]) K.box(s * 1.55 - 0.17, 0, GATE.z - 0.22, s * 1.55 + 0.17, 3.4, GATE.z + 0.22);
  K.box(-1.95, 3.2, GATE.z - 0.25, 1.95, 3.55, GATE.z + 0.25);
  if (draw && lod <= 2) { for (const s of [-1, 1]) K.seg([s * 1.55, 2.6, GATE.z], [s * 2.3, 3.4, GATE.z], 0.08, 0.08, 5, true); }
  S.crate(-3.1, 0, -5.2, 0.8, 12); S.crate(-3.0, 0.8, -5.1, 0.6, -20); S.barrel(3.1, 0, -5.4); S.barrel(2.5, 0, -6.0, 0.28, 0.8);
  if (draw) { K.paint(null, "oklch(0.6 0.05 75)", 0.95); for (let k = 0; k < 5; k++) K.seg([2.9, 0.06 + k * 0.08, -2.6], [2.9, 0.12 + k * 0.08, -2.6], 0.38 - k * 0.02, 0.38 - k * 0.02, 10); }
  }
  if (on("tunnel")) {
  // ---------- TIDAL TUNNEL: the plank walk over the pools, a net on the wall, an old pot
  S.walk(WALK, 0, 1.5, 0.7);
  S.net([-2.95, 0.6, -12], [0, 0, -3.5], [0, 2.4, 0], [1, 0, 0], 0.18);
  S.pot(2.1, -0.3, -21.5, 30); S.pot(-2.2, -0.3, -16, -70);
  }
  if (on("storeroom")) {
  // ---------- STOREROOM: stacks of crates and barrels down both walls, a wrecked longboat on its side
  for (const [x, z, s, y] of [[-5.9, -29.2, 1, 0], [-5.8, -30.4, 1, 0], [-5.9, -29.6, 0.9, 1], [-4.6, -29.0, 0.8, 0], [5.8, -36.8, 1, 0], [5.8, -38.0, 1, 0], [5.9, -37.4, 0.8, 1], [4.6, -38.6, 0.7, 0], [-5.6, -38.6, 0.9, 0], [-4.5, -38.9, 0.6, 0]])
    S.crate(x, y, z, s, (R() - 0.5) * 30);
  for (const [x, z] of [[-6.2, -32.6], [-6.2, -33.3], [-5.6, -32.9], [-6.2, -34.0], [6.2, -29.4], [5.6, -29.0], [6.2, -30.1]]) S.barrel(x, 0, z);
  S.barrel(-5.9, 0.9, -32.95, 0.3, 0.9);
  K.at(() => S.hull(5.2, 1.5, 0.7, 1), 4.9, 0.05, -33.6, 8, 0, -72);
  if (draw) { K.paint(TX.oak, "oklch(0.8 0.03 60)", 0.85); K.at(() => K.box(-0.07, 0, -1.5, 0.07, 0.04, 1.5), 3.1, 0, -31.8, 70); K.at(() => K.box(-0.07, 0, -1.5, 0.07, 0.04, 1.5), 3.5, 0, -31.2, 54); }
  S.net([-6.95, 0.8, -35.5], [0, 0, 2.2], [0, 2.6, 0], [1, 0, 0], 0.2);
  }
  // ---------- SEA CHASM: the rope bridge
  S.bridge(PIT[1], PIT[0], 1.4, 0.3);
  if (on("cavern")) {
  // ---------- THE DROWNED CAPTAIN'S CAVERN: the wrecked hull heeled over, a camp at its fire
  K.at(() => S.hull(10, 3.2, 1.6, -1), -6.4, -0.25, -67, -14, 4, 28);
  if (draw && lod <= 2) {
    K.paint(TX.oak, "oklch(0.7 0.03 60)", 0.85); K.seg([-6.9, 1.2, -66], [-1.8, 6.8, -68.5], 0.13, 0.09, 8, true); // the broken mast
    K.seg([-4.0, 4.2, -67.1], [-2.6, 3.2, -67.8], 0.06, 0.05, 5, true);
    S.rope([-1.8, 6.6, -68.5], [-10.6, 5.5, -60], 0.6); S.rope([-1.8, 6.6, -68.5], [3.5, 7.9, -74], 0.4);
    K.paint(null, "oklch(0.55 0.03 85)", 1); // a rag of sail
    K.quad([-3.6, 5.0, -67.6], [-2.4, 6.2, -68.2], [-2.0, 4.3, -69.6], [-3.2, 3.6, -69.0]);
  }
  S.campfire(FIRES[0][0], FIRES[0][2]);
  for (const [x, z, y] of [[2.8, -60.5, 0], [6.3, -61.8, 30], [5.0, -63.2, 80]]) S.crate(x, 0, z, 0.55, y);
  S.barrel(7.5, 0, -59.2); S.barrel(8.1, 0, -60.0); S.barrel(9.6, 0, -73.5, 0.32, 0.95);
  S.net([10.95, 0.5, -64], [0, 0, -4], [0, 3, 0], [-1, 0, 0], 0.25);
  for (const [x, z, a] of [[8.4, -70.5, 20], [9.2, -71.2, 110], [-9.5, -59.5, 200]]) S.pot(x, 0, z, a);
  if (draw && lod <= 2) for (let k = 0; k < 14; k++) S.kelp(-10 + R() * 8, 0, -58 - R() * 19, 0.6 + R() * 1.2, R() * 360);
  }
  if (on("boss")) {
  // ---------- BOSS CHAMBER: an anchor driven into the floor, the captain's sea chests, gallows of chain
  if (draw) {
    S.iron();
    K.seg([0, 0, -93.6], [0, 4.2, -93.6], 0.14, 0.12, 8, true);
    K.seg([-0.5, 3.7, -93.6], [0.5, 3.7, -93.6], 0.09, 0.09, 6, true);
    const arm = []; for (let k = 0; k <= 8; k++) { const a = Math.PI * (1 + k / 8); arm.push([Math.cos(a) * 1.4, 1.4 + Math.sin(a) * 1.4, -93.6]); } S.line(arm, 0.12, 6);
    for (const s of [-1, 1]) K.seg([s * 1.4, 1.4, -93.6], [s * 1.7, 1.9, -93.6], 0.12, 0.02, 6, true);
    K.paint(null, "oklch(0.45 0.05 50)", 0.6, 0.6); for (let k = 0; k < 10; k++) K.seg([0.1 * Math.sin(k), 4.2 + k * 0.32, -93.6], [0.1 * Math.sin(k + 1), 4.52 + k * 0.32, -93.6], 0.07, 0.07, 5);
    if (lod <= 2) { for (let k = 0; k < 12; k++) S.kelp(-8 + R() * 16, 0, -80 - R() * 15, 0.6 + R(), R() * 360); for (let x = -8.5; x < 9; x += 1.4) S.barnacles(x, 0, 1.2, -95.9, 0.05, 5); }
  }
  K.at(() => K.box(-0.5, 0, -0.5, 0.5, 0.4, 0.5), 0, 0, -93.6);
  S.crate(-6.8, 0, -93.6, 0.9, 10); S.crate(-7.6, 0, -92.4, 0.7, -15); S.barrel(7.6, 0, -93.8); S.barrel(6.9, 0, -94.6, 0.28, 0.8);
  S.net([-8.95, 1, -86], [0, 0, -4], [0, 3, 0], [1, 0, 0], 0.25);
  }
  // ---------- light fittings
  for (const l of LANTERNS) S.lantern(...l);
  for (const b of BRAZIERS) S.brazier(...b);
}

function build(ctx, col) {
  const K = kit(ctx, col);
  P = ctx.params ?? {};
  shell(K, ctx, col);
  if (on("dress")) dress(K, ctx, col);
  if (!col) skin(K, ctx, sea(K, ctx, col));
}
export function geometry(ctx) { build(ctx, false); }
export function collider(ctx) { build(ctx, true); }
