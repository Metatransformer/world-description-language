// THE DROWNED TEMPLE, inside: one shell of pale limestone under the sea. Root at the place origin, floor y = 0, the
// entry wall at z = 0, the route running -z: vestibule → flooded colonnade → drowned court → the sunken shrine (a
// stepped pool round a bronze idol) → reliquary passage → the Drowned Priest's sanctum. Water is the scene's planes.
import { dk } from "../lib/drowned-kit.js";
// PARAMS (Codex Kits; {} = as built): vestibule, colonnade, court, shrine, reliquary, sanctum = false strips that hall's
// statues, columns and relics; dress = false strips them all, leaving the flooded shell.
// params.room = one hall drawn alone (its shell and its dressing): vestibule | colonnade | court | shrine | reliquary | sanctum
let P = {}; const on = (k) => (P.room ? k === "dress" || k === P.room : true) && P[k] !== false;
const solo = (r) => !P.room || r.id === P.room;
const inZ = (z) => { if (!P.room) return true; const r = ROOMS.find((q) => q.id === P.room); return !r || (z <= r.z1 + 0.9 && z >= r.z0 - 0.9); };
const T = 0.8, DOOR = 1.6, DH = 3.4;
export const ROOMS = [
  { id: "vestibule", name: "Vestibule", x0: -4, x1: 4, z0: -8, z1: 0, h: 5 },
  { id: "colonnade", name: "Colonnade", x0: -5, x1: 5, z0: -24, z1: -8.8, h: 6.5, flooded: true },
  { id: "court", name: "Court", x0: -7, x1: 7, z0: -38, z1: -24.8, h: 7, flooded: true },
  { id: "shrine", name: "Shrine", x0: -9, x1: 9, z0: -58, z1: -38.8, h: 9.5 },
  { id: "reliquary", name: "", x0: -3, x1: 3, z0: -70, z1: -58.8, h: 5 },
  { id: "sanctum", name: "Sanctum", x0: -8, x1: 8, z0: -88, z1: -70.8, h: 8.5, flooded: true },
];
export const SHRINE = { z: -48.4, steps: [4.6, 3.8, 3.0, 2.2], rise: 0.3 };      // the pool's square half-sizes, ring by ring
export const WATER_Y = 0.45;                                                       // knee-deep, drawn by the scene
export const BRAZIERS = [[-3, 0, -6], [3, 0, -6], [-5.6, 0, -26.5], [5.6, 0, -26.5], [-7.5, 0, -40.5], [7.5, 0, -40.5], [-7.5, 0, -56.3], [7.5, 0, -56.3], [-5, 0, -86.4], [5, 0, -86.4]];
export const GATE = { x: 0, z: -1.6 };
function shell(D, ctx, col) {
  const K = D.K;
  ROOMS.forEach((r, i) => {
    if (P.room && !solo(r) && ROOMS[i + 1] && solo(ROOMS[i + 1])) return endWall(D, col, r, ROOMS[i + 1]); // a solo hall keeps the doorway wall it is entered by
    if (!solo(r)) return;
    const next = ROOMS[i + 1], top = r.h + 0.5;
    D.floor();
    if (r.id === "shrine") { // the floor round the pool, then the pool's rings stepping down
      const z = SHRINE.z, S = SHRINE.steps, P = S[0];
      K.box(r.x0 - T, -0.6, z + P, r.x1 + T, 0, r.z1); K.box(r.x0 - T, -0.6, r.z0 - T, r.x1 + T, 0, z - P);
      K.box(r.x0 - T, -0.6, z - P, -P, 0, z + P); K.box(P, -0.6, z - P, r.x1 + T, 0, z + P);
      S.forEach((o, k) => {
        const inn = S[k + 1] ?? 0, yt = -SHRINE.rise * (k + 1), yb = -SHRINE.rise * S.length - 0.6;
        D.lime(0.86 - k * 0.04);
        if (!inn) K.box(-o, yb, z - o, o, yt, z + o);
        else { K.box(-o, yb, z - o, o, yt, z - inn); K.box(-o, yb, z + inn, o, yt, z + o); K.box(-o, yb, z - inn, -inn, yt, z + inn); K.box(inn, yb, z - inn, o, yt, z + inn); }
      });
    } else K.box(r.x0 - T, -0.6, r.z0 - T, r.x1 + T, 0, r.z1);
    D.lime(0.8); K.box(r.x0 - T, r.h, r.z0 - T, r.x1 + T, top, r.z1);
    D.lime(); K.box(r.x0 - T, -0.6, r.z0 - T, r.x0, top, r.z1); K.box(r.x1, -0.6, r.z0 - T, r.x1 + T, top, r.z1);
    if (i === 0) K.box(r.x0 - T, -0.6, r.z1, r.x1 + T, top, r.z1 + T);
    endWall(D, col, r, next);
    if (!col && ctx.lod <= 3) { // a plinth course and a cornice on every wall
      D.lime(0.82);
      K.box(r.x0, 0, r.z0, r.x0 + 0.18, 0.4, r.z1); K.box(r.x1 - 0.18, 0, r.z0, r.x1, 0.4, r.z1);
      K.box(r.x0, r.h - 0.35, r.z0, r.x0 + 0.25, r.h, r.z1); K.box(r.x1 - 0.25, r.h - 0.35, r.z0, r.x1, r.h, r.z1);
    }
  });
}
function endWall(D, col, r, next) {
  const K = D.K, top = r.h + 0.5; D.lime();
  const sx0 = Math.min(r.x0, next ? next.x0 : r.x0) - T, sx1 = Math.max(r.x1, next ? next.x1 : r.x1) + T, sTop = Math.max(top, next ? next.h + 0.5 : 0);
  const z0 = r.z0 - T, z1 = r.z0;
  if (!next) K.box(sx0, -0.6, z0, sx1, sTop, z1);
  else {
    K.box(sx0, -0.6, z0, -DOOR, sTop, z1); K.box(DOOR, -0.6, z0, sx1, sTop, z1); K.box(-DOOR, DH, z0, DOOR, sTop, z1);
    if (!col) { D.bronze(); for (const s of [-1, 1]) K.box(s * DOOR - 0.12, 0, z0 - 0.08, s * DOOR + 0.12, DH, z1 + 0.08); K.box(-DOOR - 0.25, DH - 0.02, z0 - 0.1, DOOR + 0.25, DH + 0.3, z1 + 0.1); }
  }
}
function dress(D, ctx, col) {
  const K = D.K, R = D.R;
  if (on("vestibule")) {
  // vestibule: the inside of the temple's door, two statues
  D.statue(-2.6, 0, -1.6, 180, 1); D.statue(2.6, 0, -1.6, 180, 1);
  }
  if (on("colonnade")) {
  // the colonnade: two rows of five, one broken, one fallen
  for (let k = 0; k < 5; k++) for (const s of [-1, 1]) {
    const z = -10.6 - k * 3.2, x = s * 3.4;
    if (k === 3 && s > 0) { D.fallen(1.0, 0, z + 0.5, 250, 3); D.lime(); K.box(x - 0.6, 0, z - 0.6, x + 0.6, 0.28, z + 0.6); continue; }
    D.column(x, 0, z, 6.5 - 0.42, k === 1 && s < 0);
  }
  }
  if (on("court")) {
  // the court: four great piers, a fallen architrave, a drift of sand through a broken wall
  for (const [x, z] of [[-4.5, -27.5], [4.5, -27.5], [-4.5, -35], [4.5, -35]]) D.column(x, 0, z, 7 - 0.42, false, 0.55);
  D.lime(0.84); K.at(() => K.bbox(-3.2, 0, -0.35, 3.2, 0.7, 0.35, 0.04), 1.5, 0, -31, 22, 0, 6);
  D.drift(-6.2, 0, -31, 1.6, 1.2, 3.2);
  }
  if (on("shrine")) {
  // the shrine: the bronze idol on its drum in the pool, kneeling mourners on the rim, columns at the corners
  D.lime(0.9); K.cyl(0, -SHRINE.rise * 4, SHRINE.z, 1.3, 1.1, 1.6, 10);
  D.statue(0, 0.4, SHRINE.z, 180, 1);
  if (!col) { D.bronze(); K.seg([-0.4, 2.1, SHRINE.z - 0.25], [-0.7, 3.0, SHRINE.z - 0.4], 0.08, 0.06, 6, true); K.seg([0.4, 2.1, SHRINE.z - 0.25], [0.7, 3.0, SHRINE.z - 0.4], 0.08, 0.06, 6, true); K.seg([0, 2.25, SHRINE.z - 0.24], [0, 2.7, SHRINE.z - 0.24], 0.3, 0.02, 6, true); }
  for (const [x, z, y] of [[0, -41.8, 180], [0, -55, 0], [-6.3, -48.4, 90], [6.3, -48.4, 270]]) D.statue(x, 0, z, y, 1);
  for (const [x, z] of [[-6.8, -41.4], [6.8, -41.4], [-6.8, -55.4], [6.8, -55.4]]) D.column(x, 0, z, 9.5 - 0.42, x > 0 && z < -50);
  }
  if (on("reliquary")) {
  // the reliquary: niches of skulls and bronze urns
  if (!col) for (let k = 0; k < 4; k++) for (const s of [-1, 1]) { D.bronze(); K.cyl(s * 2.6, 0.5, -60.5 - k * 2.5, 0.18, 0.12, 0.45, 7); D.lime(0.8); K.box(s * 3 - (s > 0 ? 0.6 : 0), 0, -61 - k * 2.5, s * 3 + (s < 0 ? 0.6 : 0), 0.5, -60 - k * 2.5); }
  
  }
  if (on("sanctum")) {
  // the sanctum: a stepped dais at the back, two broken columns, fallen drums, the priest's lectern
  D.lime(0.88); K.bbox(-4.5, 0, -87.8, 4.5, 0.3, -82.2, 0.04); K.bbox(-3.5, 0.3, -87.8, 3.5, 0.6, -83.4, 0.04);
  D.bronze(); K.box(-0.35, 0.6, -86.4, 0.35, 1.6, -85.9); K.at(() => K.box(-0.5, 0, -0.3, 0.5, 0.08, 0.3), 0, 1.6, -86.15, 0, 20, 0);
  D.column(-5.5, 0, -74, 3.1, true, 0.5); D.column(5.5, 0, -80, 8.5 - 0.42, false, 0.5); D.fallen(4.2, 0, -73.5, 200, 3, 0.5);
  if (!col) {
    D.lime(0.78);
    for (let k = 0; k < 40; k++) { const r = ROOMS[k % ROOMS.length], x = r.x0 + 0.6 + R() * (r.x1 - r.x0 - 1.2), z = r.z0 + 0.6 + R() * (r.z1 - r.z0 - 1.2); if (Math.abs(x) < 1.8 || (r.id === "shrine" && Math.abs(z - SHRINE.z) < 5) || !solo(r)) continue; K.rock(x, 0.05, z, 0.15 + R() * 0.25, 0.1 + R() * 0.15, 0.15 + R() * 0.25, 6, 3, 0.3); }
    for (const [x, z, n, l] of [[-4.2, -12, 4, 3], [4.3, -21, 5, 4], [-6, -36.5, 5, 4.5], [6, -25.6, 3, 3], [-7.4, -86.5, 6, 5], [7.3, -72, 4, 4], [-2.5, -50, 3, 1.5], [2.6, -46.5, 3, 1.4]]) if (inZ(z)) D.kelp(x, 0, z, n, l);
    for (const r of ROOMS.filter(solo)) for (let x = r.x0 + 1; x < r.x1; x += 2.3) { D.barn(x, 0.05, 0.9, r.z0 + 0.05, 0.02, 4); }
  }
  for (const b of BRAZIERS) if (inZ(b[2])) D.brazier(...b);
  }
  if (on("reliquary")) { // the reliquary's dressing rolls last, so every hall before it keeps its dice
  let hs = 7; const H = () => (hs = (hs * 16807) % 2147483647) / 2147483647; // its own dice, so the halls after it roll as before
  // a second tier of niches above, skulls on each ledge, a corbel under it; ribs across the vault, pilasters down the walls
  if (!col) for (let k = 0; k < 4; k++) for (const s of [-1, 1]) {
    const z = -60.5 - k * 2.5, xi = s * 3 - s * 0.55;
    D.lime(0.78); K.box(Math.min(s * 3, xi), 1.9, z - 0.55, Math.max(s * 3, xi), 2.02, z + 0.55);
    K.box(Math.min(s * 3, s * 2.8), 1.65, z - 0.15, Math.max(s * 3, s * 2.8), 1.9, z + 0.15);
    K.paint(null, "oklch(0.86 0.025 85)", 0.9);
    for (const dz of [-0.28, 0.02, 0.3]) { if (H() < 0.2) continue; const sx = s * (2.68 + H() * 0.06); K.seg([sx, 2.13, z + dz], [sx - s * 0.05, 2.19, z + dz], 0.11, 0.1, 6, true); K.box(sx - 0.05, 2.02, z + dz - 0.06, sx + 0.05, 2.08, z + dz + 0.06); }
    D.lime(0.84); K.box(Math.min(s * 3, s * 2.82), 0, z - 1.35, Math.max(s * 3, s * 2.82), 5, z - 1.1);
    D.barn(s * 2.85, 0.1, 1.4, z - 1.22, 0.05, 5);
  }
  if (!col) for (let k = 0; k < 5; k++) { D.lime(0.8); K.box(-3, 4.55, -59.4 - k * 2.5, 3, 5, -59.1 - k * 2.5); }
  // two bronze sentinels flank the sanctum door, watching the passage
  D.statue(-2.3, 0, -69.1, 180, 1, !!P.liveHeads); D.statue(2.3, 0, -69.1, 180, 1, !!P.liveHeads); // liveHeads: place drowned stands watching heads on them
  // what the sea knocked down: toppled urns rolled off the ledges, shards, sand banked in the corners, kelp at the walls
  if (!col) {
    for (const [x, z, yaw] of [[-1.9, -62.2, 30], [2.1, -66.4, -70], [0.9, -64.1, 110]]) { D.bronze(); const a = yaw * Math.PI / 180, c = Math.cos(a) * 0.4, sn = Math.sin(a) * 0.4; K.seg([x, 0.16, z], [x + c, 0.14, z + sn], 0.17, 0.11, 7, true); }
    D.lime(0.7); for (let k = 0; k < 9; k++) { const x = (H() - 0.5) * 4.6, z = -59.6 - H() * 9.6, w = 0.06 + H() * 0.1; K.box(x - w, 0, z - w * 0.7, x + w, 0.04 + H() * 0.04, z + w * 0.7); }
  }
  for (const [x, z] of [[-2.6, -59.4], [2.6, -59.4], [-2.7, -66.8], [2.6, -63.6]]) D.drift(x, 0, z, 0.55 + H() * 0.3, 0.16, 0.6 + H() * 0.3);
  D.kelp(-2.5, 0, -64.6, 3, 2.2); D.kelp(2.5, 0, -61.2, 3, 1.8);
  }
}
function build(ctx, col) { P = ctx.params ?? {}; const D = dk(ctx, col); shell(D, ctx, col); if (on("dress")) dress(D, ctx, col); }
export function geometry(ctx) { build(ctx, false); }
export function collider(ctx) { build(ctx, true); }
