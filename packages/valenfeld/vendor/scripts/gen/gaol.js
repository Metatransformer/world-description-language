// THE GAOL UNDERCROFT AND THE OLD SEWERS: Valenfeld's cellblock (floor y = 0) and the brick drains under the town (walkways y = -3).
// part: "shell" (everything, static), "celldoor" (one barred leaf, 1 m along -z, hinge at its +z edge),
// "frontdoor" (the oak door at the stair head, decorative), "grate" (a street drain cover for main).
// North is -z. Rooms are axis boxes; a side in `skip` belongs to its neighbour, an opening is [from, to, top].
import { kit } from "./barrow-kit.js";
import { layRooms } from "../lib/room-plan.js";
import { CB } from "../lib/buildkit.js";
import { channelFloor } from "../lib/channel.js";
import { vaultArc, vaultShell, vaultEnd, FLAT } from "../lib/vault.js";
import { drawPart, partColliders } from "../lib/masonry.js";
const T = 0.5;
const TX = {
  fs: "cdn/texture-fieldstone-wall-mossy.png", flag: "cdn/texture-flagstone-floor-worn.png", oak: "cdn/texture-dark-oak-planks-weathered.png",
  iron: "cdn/texture-wrought-iron.png", hay: "cdn/texture-hay-bale-straw.png", brick: "cdn/texture-ancient-stone-vault-blocks.png", rib: "cdn/texture-fieldstone-wall-mossy.png",
  wet: "cdn/texture-wet-cobblestone-sewer-floor-slimy.png", vault: "cdn/texture-ancient-stone-vault-blocks.png", earth: "cdn/texture-root-laced-earth-ceiling.png",
  slime: "cdn/texture-green-black-sewer-sludge.png",
};
// every room laid against an earlier one (scripts/lib/room-plan.js); spans, pools and channels are local to the room's north-west corner
export const ROOMS = layRooms([
  { id: "cellblock", at: [-5,-11.5], size: [10,12], y: 0, h: 3.2, wall: "fs", floor: "flag", ceil: "oak", open: {N: [[3.5,6.5,2.6]]} },   // the old walk-down is walled up: the way out is the grate in the end cell
  { id: "guardroom", northOf: "cellblock", gap: 0.5, shift: -2.5, size: [15,6], y: 0, h: 4.6, wall: "fs", floor: "flag", ceil: "oak", open: {N: [[6.3,8.7,3.4]],S: [[2,13,3.6]]} },   // roomy: 15 x 6 m, 4.6 m up; its S wall only closes above and beside the cellblock's N wall
  { id: "stair", northOf: "guardroom", gap: 0.5, shift: 6.3, size: [2.4,4], y: 0, h: 3.6, wall: "fs", floor: "flag", ceil: "oak", skip: ["S"] },
  { id: "drain", westOf: "cellblock", gap: 0.5, shift: 1, size: [6.5,2], y: -3, h: 3, wall: "fs", floor: "wet", ceil: "earth", skip: ["W"], open: {S: [[2.5,4.5,2.4]]} },
  { id: "breach", southOf: "drain", shift: 2.5, size: [2,10], y: -3, h: 2.4, wall: "fs", floor: "wet", ceil: "earth", skip: ["N", "S"] },
  { id: "tutorial", southOf: "breach", gap: 0.5, shift: -2.5, size: [8,8], y: -3, h: 3.4, wall: "vault", floor: "flag", ceil: "vault", skip: ["W"], open: {N: [[2.5,4.5,2.4]]} },
  { id: "tunnelA", westOf: "drain", gap: 0.5, shift: -39, size: [7,59.5], y: -3, h: 2.2, wall: "brick", floor: "wet", vault: "z", chan: {c: 3.5, w: 2.4, a: 7.5, b: 45.5}, open: {E: [[55,58,2.2], [26.5,31,2.2], [0,7,2.2]],W: [[21.5,25.5,2.2]]} },
  { id: "tunnelB", eastOf: "tunnelA", gap: 0.5, size: [26,7], y: -3, h: 2.2, wall: "brick", floor: "wet", vault: "x", skip: ["W"], chan: {c: 3.5, w: 2.4, a: 3, b: 25}, open: {N: [[7.5,12.5,2], [20,22.5,2]],S: [[7,10,2]]} },
  { id: "warren", northOf: "tunnelB", gap: 0.5, shift: 4, size: [11,8], y: -3, h: 2.1, wall: "brick", floor: "wet", ceil: "earth", skip: ["S"] },
  { id: "conduit", northOf: "tunnelB", gap: 0.5, shift: 20, size: [2.5,22], y: -3, h: 2.4, wall: "brick", floor: "wet", vault: "z", skip: ["S", "N"], open: {W: [[4.5,7.5,2.2]]} },
  { id: "rootcave", westOf: "conduit", gap: 0.5, shift: 2, size: [11.5,10], y: -3, h: 2.8, wall: "fs", floor: "wet", ceil: "earth", skip: ["E"] },
  { id: "cistern", northOf: "conduit", gap: 0.5, shift: -6, size: [20,19.5], y: -3, h: 8, wall: "fs", floor: "wet", ceil: "vault", pool: {x0: 2, x1: 18, z0: 1.8, z1: 17.7, d: 1.2}, open: {S: [[6,8.5,2.4]],E: [[8,11,2.6]],W: [[7,10,2.4]]} },
  { id: "overflow", westOf: "cistern", gap: 0.5, shift: 4, size: [7.5,9], y: -3, h: 2.6, wall: "brick", floor: "wet", ceil: "earth", skip: ["E"] },
  { id: "culvert", eastOf: "cistern", gap: 0.5, shift: 8, size: [13,3], y: -3, h: 3, wall: "brick", floor: "wet", ceil: "vault", skip: ["W", "E"] },
  { id: "den", eastOf: "culvert", gap: 0.5, shift: -8, size: [18,18], y: -2.1, h: 4.4, wall: "brick", floor: "flag", ceil: "oak", open: {W: [[8,11,2.2]],E: [[7,9.5,2.2]],S: [[4.5,8,2.6]]} },
  { id: "crawl", eastOf: "den", gap: 0.5, shift: 7, size: [11.5,2.5], y: -2.1, h: 2.3, wall: "brick", floor: "wet", vault: "x", skip: ["W", "E"], pool: {x0: 2.5, x1: 8.5, z0: -0.5, z1: 3, d: 0.6} },
  { id: "winch", eastOf: "crawl", gap: 0.5, shift: -4, size: [5.5,11], y: -2.1, h: 3.6, wall: "fs", floor: "flag", ceil: "oak", open: {W: [[4,6.5,2.2]],S: [[0.5,3.5,2.4]]} },
  { id: "spillway", southOf: "winch", gap: 0.5, shift: 0.5, size: [3,8.5], y: -2.1, h: 3.4, wall: "brick", floor: "wet", vault: "z", skip: ["N"], open: {W: [[5.5,8.5,2.4]]} },
  { id: "backway", westOf: "spillway", gap: 0.5, shift: 5.5, size: [22,3], y: -2.1, h: 2.4, wall: "brick", floor: "wet", vault: "x", skip: ["W", "E"], open: {N: [[12.5,15.5,2.2]],S: [[8.5,11.5,2.2]]} },
  { id: "gatehall", southOf: "den", gap: 0.5, shift: 4.5, size: [3.5,13.5], y: -2.1, h: 3.2, wall: "fs", floor: "flag", vault: "z", skip: ["N"], open: {E: [[1.5,4.5,2.4]],W: [[10,13,2.6]]} },
  { id: "bonestair", westOf: "gatehall", gap: 0.5, shift: 10, size: [9.5,3], y: -3.4, h: 3.8, wall: "vault", floor: "flag", ceil: "vault", skip: ["W", "E"] },
  { id: "ossuary", westOf: "bonestair", gap: 0.5, shift: -7.5, size: [15.5,16.5], y: -3.4, h: 5.6, wall: "vault", floor: "flag", ceil: "vault", open: {E: [[7.5,10.5,3.6]],S: [[-0.5,16,5]]} },   // S: only the band above the crypt's N wall (top 1.6) up to the vault: it stood open to the void (creator Oct 30)
  { id: "crypt", eastOf: "tunnelB", gap: 0.5, shift: -4.5, size: [15.5,16], y: -3.4, h: 4.6, wall: "vault", floor: "flag", ceil: "vault", open: {N: [[6,7.5,4]],E: [[6.8,9.2,4]],W: [[4.5,11.5,2.6]]} },   // W walled either side of the tunnel mouth: its two corners stood open to the void
  { id: "exit", eastOf: "crypt", gap: 0.5, shift: 6.8, size: [8.5,2.4], y: -3.4, h: 6, wall: "fs", floor: "flag", ceil: "iron", skip: ["W"] },
  { id: "sluice", westOf: "tunnelA", gap: 0.5, shift: 19.5, size: [6.5,8], y: -3, h: 3.2, wall: "fs", floor: "wet", ceil: "earth", pool: {x0: 1, x1: 5.5, z0: 1, z1: 4, d: 0.7}, open: {E: [[2,6,2.2]]} },   // the old sluice: a stone basin, the gate wheel rusted solid
  { id: "ratnest", eastOf: "tunnelA", gap: 0.5, shift: 24.5, size: [5.5,8], y: -3, h: 2.4, wall: "brick", floor: "wet", ceil: "earth", open: {W: [[2,6.5,2.2]]} },   // low, rooty, littered: where the rats come from
  { id: "cavein", southOf: "tunnelB", gap: 0.5, shift: 5.5, size: [6,5], y: -3, h: 2.3, wall: "fs", floor: "wet", ceil: "earth", open: {N: [[1.5,4.5,2]]} },   // a pocket the street above fell into
  { id: "drowned", northOf: "backway", gap: 0.5, shift: 10.5, size: [9,6.5], y: -2.1, h: 3, wall: "brick", floor: "wet", ceil: "vault", pool: {x0: 1, x1: 8, z0: 1, z1: 4, d: 0.8}, open: {S: [[2,5,2.2]]} },   // a flooded cellar, the smugglers' overflow
  { id: "store", southOf: "backway", gap: 0.5, shift: 6.5, size: [8,5.5], y: -2.1, h: 2.8, wall: "fs", floor: "flag", ceil: "oak", open: {N: [[2,5,2.2]]} },   // the smugglers' dry store: shelves, sacks, a strongbox
]);
export const STEPS = { drain: { x0: -5.5, x1: -11.5, n: 17, top: 0, bot: -3 }, stair: { z0: -18.5, n: 5, rise: 0.18, run: 0.3 }, exit: { x0: 31, n: 19, rise: 0.18, run: 0.3, y: -3.4 } };
// flights between floor levels: a box [x0..x1] × [z0..z1] cut into n steps from lo to hi, rising toward +ax (up 1) or -ax (up -1)
export const FLIGHTS = [
  { x0: 33, x1: 35.5, z0: -84, z1: -81, ax: "x", up: 1, n: 5, lo: -3, hi: -2.1 },          // culvert up into the den
  { x0: 36.5, x1: 40, z0: -92, z1: -90.4, ax: "x", up: 1, n: 13, lo: -2.1, hi: 0.3 },     // den: up to the catwalk
  { x0: 37.6, x1: 40, z0: -63.5, z1: -60.5, ax: "x", up: 1, n: 7, lo: -3.4, hi: -2.1 },   // bone stair
  { x0: 14.5, x1: 17, z0: -60, z1: -56, ax: "z", up: -1, n: 11, lo: -3.4, hi: -1.4 },      // ossuary: up to the bowmen's ledge
  { x0: 3.9, x1: 6.3, z0: -83.5, z1: -81.5, ax: "x", up: -1, n: 6, lo: -4.2, hi: -3 },     // cistern: wade-in steps, west
  { x0: 17.7, x1: 20.1, z0: -83.5, z1: -81.5, ax: "x", up: 1, n: 6, lo: -4.2, hi: -3 },    // cistern: east
  { x0: 56.9, x1: 58.4, z0: -85, z1: -82.5, ax: "x", up: -1, n: 3, lo: -2.7, hi: -2.1 },   // the flooded crawl
  { x0: 61.6, x1: 63.1, z0: -85, z1: -82.5, ax: "x", up: 1, n: 3, lo: -2.7, hi: -2.1 },
];
export const PLATS = [   // raised walking slabs: [x0, z0, x1, z1, top, thick]
  [40, -92, 54, -89.5, 0.3, 0.3],        // den catwalk
  [14.5, -70, 17, -60, -1.4, 0.4],       // ossuary bowmen's ledge
];
// inner walls that cut the big halls into rooms under 12 m (issues #147, #148): [axis, at, from, to, floorY, height, gaps [[a, b, doorH]]]
export const DIVIDERS = [
  ["x", 22, -71, -54.5, -3.4, 5.6, [[-63, -60.3, 2.8]]],               // ossuary: east and west wings, one door (creator Nov 6: the west wall's end split it into two tiny doors; the north one is walled, the ledge room keeps its own door)
  ["z", -67, 22, 30, -3.4, 5.6, [[25, 27.5, 2.8]]],                    // ossuary east: the bone niche
  ["z", -63, 17, 22, -3.4, 5.6, [[18.5, 20.5, 2.8]]],                  // ossuary west, under the bowmen's ledge
  ["z", -45.5, 14.5, 30, -3.4, 4.6, [[20.3, 22.9, 2.8], [26.8, 30, 4.0]]], // crypt: fore-tomb and inner tomb (creator Nov 6: the x 23.3 wall ended inside this door and left a 0.7 m slit; the door now stops short of it)
  ["x", 23.3, -45.5, -38, -3.4, 4.6, [[-44.5, -42, 2.8]]],
  ["x", 26.3, -54, -45.5, -3.4, 4.6, [[-50, -47.5, 2.8]]],
  ["z", -6, -19.5, -12.5, -3, 3.4, [[-18.3, -13.7, 2.5]]],             // tunnel A (#150): squat brick ribs break the long outflow run
  ["z", -34, -19.5, -12.5, -3, 3.4, [[-18.3, -13.7, 2.5]]],
  ["z", -80.5, 2, 22, -4.3, 9.3, [[7, 17, 5.3]]],                       // cistern (#146): an arched water gate splits the drowned hall in two
  ["x", 45, -89.5, -74, -2.1, 4.4, [[-84, -81, 2.4]]],                 // den: smugglers' hall and their stores
  ["z", -80.5, 36, 54, -2.1, 4.4, [[39, 41.5, 2.4], [49, 51.5, 2.4]]],
];
export const BEAM = [3, -86.8, 21, -86.1, -2.95];   // the fallen beam over the cistern pool
export const SARC = [[17, -53, 0], [25, -53, 0], [17, -39, 0], [21.5, -39, 0], [28.5, -51, 1]];
export const GATE = { x: 42.25, y: -2.1, z: -66.5, w: 3.5, h: 3.1 };

function walls(B, r, paintW) {
  const skip = r.skip ?? [], op = r.open ?? {}, y0 = r.y - 0.4, top = r.y + r.h + (r.vault ? 0 : 0.4);
  for (const side of ["N", "S", "W", "E"]) {
    if (skip.includes(side)) continue;
    const alongX = side === "N" || side === "S", lo = alongX ? r.x0 - T : r.z0, hi = alongX ? r.x1 + T : r.z1;
    const piece = (a, b, ya, yb) => {
      if (b - a < 0.001 || yb - ya < 0.001) return; paintW && paintW();
      if (side === "N") B(a, ya, r.z0 - T, b, yb, r.z0); if (side === "S") B(a, ya, r.z1, b, yb, r.z1 + T);
      if (side === "W") B(r.x0 - T, ya, a, r.x0, yb, b); if (side === "E") B(r.x1, ya, a, r.x1 + T, yb, b);
    };
    const gaps = [...(op[side] ?? [])].sort((p, q) => p[0] - q[0]); let at = lo;
    for (const [a, b, t] of gaps) { piece(at, a, y0, top); piece(a, b, r.y + t, top); at = b; }
    piece(at, hi, y0, top);
  }
}
function floors(B, r, paintF, paintC) {
  const x0 = r.x0 - T, x1 = r.x1 + T, z0 = r.z0 - T, z1 = r.z1 + T, c = r.chan;
  paintF && paintF();
  const q = r.pool;
  if (q) {   // a sunken pool: the floor rings it, the bed lies d down
    const R = (ax, ay, az, bx, by, bz) => { if (bx - ax > 0.01 && bz - az > 0.01) B(ax, ay, az, bx, by, bz); };   // a rim strip the pool fills edge to edge is skipped
    R(x0, r.y - 0.4, z0, x1, r.y, q.z0); R(x0, r.y - 0.4, q.z1, x1, r.y, z1);
    R(x0, r.y - 0.4, q.z0, q.x0, r.y, q.z1); R(q.x1, r.y - 0.4, q.z0, x1, r.y, q.z1);
    B(q.x0, r.y - q.d - 0.4, q.z0, q.x1, r.y - q.d, q.z1);
  } else if (!c) B(x0, r.y - 0.4, z0, x1, r.y, z1);
  else channelFloor(B, { along: r.vault === "z", x0, x1, z0, z1, c: c.c, w: c.w, a: c.a, b: c.b, top: r.y, slab: 1.4, bedTop: r.y - 1.0, bedBot: r.y - 1.4, bedFull: r.vault === "z" });   // the shared channel (scripts/lib/channel.js)
  if (!r.vault) { paintC && paintC(); B(x0, r.y + r.h, z0, x1, r.y + r.h + 0.4, z1); }
}
function vault(ctx, r) {   // a brick barrel vault springing from the wall heads: the shared vault (scripts/lib/vault.js), half-ellipse profile
  const n = ctx.lod <= 2 ? 10 : 6, s = r.y + r.h;
  const along = r.vault === "z", a0 = along ? r.x0 - T : r.z0 - T, a1 = along ? r.x1 + T : r.z1 + T, L0 = along ? r.z0 - T : r.x0 - T, L1 = along ? r.z1 + T : r.x1 + T;
  const half = (a1 - a0) / 2, mid = (a0 + a1) / 2, arc = vaultArc({ profile: "ellipse", mid, half, spring: s, n });
  const q = (...p) => ctx.quad(...p);
  vaultShell(q, along, arc, L0, L1, FLAT);
  const sk = r.skip ?? [], ends = along ? [["N", L0], ["S", L1]] : [["W", L0], ["E", L1]];
  for (const [side, l] of ends) if (!sk.includes(side)) vaultEnd(q, along, arc, l, [mid, s], FLAT);
}
function steps(B) {
  const d = STEPS.drain, run = (d.x0 - d.x1) / d.n, rise = (d.top - d.bot) / d.n;
  if (false) for (let k = 0; k < d.n; k++) B(d.x0 - (k + 1) * run, d.bot - 0.4, -10.5, d.x0 - k * run, d.top - (k + 1) * rise, -8.5);
  const s = STEPS.stair; for (let k = 0; k < s.n; k++) B(-1.2, -0.1, s.z0 - s.run * (k + 1), 1.2, s.rise * (k + 1), s.z0 - s.run * k);
  B(-1.2, -0.1, -22.5, 1.2, s.rise * s.n, s.z0 - s.run * s.n);
  const e = STEPS.exit; for (let k = 0; k < e.n; k++) B(e.x0 + e.run * k, e.y - 0.1, -47.2, e.x0 + e.run * (k + 1), e.y + e.rise * (k + 1), -44.8);
  B(e.x0 + e.run * e.n, e.y - 0.1, -47.2, 39, e.y + e.rise * e.n, -44.8);
  for (const f of FLIGHTS) for (let k = 0; k < f.n; k++) {
    const t = f.lo + (f.hi - f.lo) * (k + 1) / f.n, L = f.ax === "x" ? f.x1 - f.x0 : f.z1 - f.z0, a = (f.up > 0 ? k : f.n - 1 - k) * L / f.n, b2 = a + L / f.n;
    if (f.ax === "x") B(f.x0 + a, f.lo - 0.1, f.z0, f.x0 + b2, t, f.z1); else B(f.x0, f.lo - 0.1, f.z0 + a, f.x1, t, f.z0 + b2);
  }
  for (const [x0, z0, x1, z1, top, th] of PLATS) B(x0, top - th, z0, x1, top, z1);
  B(BEAM[0], BEAM[4] - 0.35, BEAM[1], BEAM[2], BEAM[4], BEAM[3]);
  for (const [ax, at, lo, hi, y, h, gaps] of DIVIDERS) {
    const piece = (a, b, ya, yb) => { if (b - a < 0.001 || yb - ya < 0.001) return; if (ax === "x") B(at - T / 2, ya, a, at + T / 2, yb, b); else B(a, ya, at - T / 2, b, yb, at + T / 2); };
    let a0 = lo; for (const [a, b, t] of [...gaps].sort((p, q) => p[0] - q[0])) { piece(a0, a, y - 0.1, y + h); piece(a, b, y + t, y + h); a0 = b; } piece(a0, hi, y - 0.1, y + h);
  }
}
const BARS_X = [1.5, -1.5], CELLS = [-1.5, -5.5, -9.5];
function bars(B, col) {   // cell fronts: a bar slab per side, gaps where a door stands open (east 1: the player's leaf; west 3: hanging off)
  for (const x of BARS_X) {
    const gaps = x > 0 ? [[-2, -1]] : [[-10, -9]]; let at = -11.5;
    for (const [a, b] of [...gaps].sort((p, q) => p[0] - q[0])) { B(x - 0.05, 0, at, x + 0.05, 3.2, a); at = b; } B(x - 0.05, 0, at, x + 0.05, 3.2, 0.5);
  }
  for (const z of [-3.5, -7.5]) { B(1.5, 0, z - 0.15, 5, 3.2, z + 0.15); B(-5, 0, z - 0.15, -1.5, 3.2, z + 0.15); }
}
function rubble(B, x0, z0, x1, z1, y, hgt) { B(x0, y, z0, x1, y + hgt, z1); }
// creator: walkways stay clear, scatter hugs the walls: heaps in tunnels A/B keep to the wall half (>= 1.2 m lane by the channel)
export const COLLAPSE = [[-13.6, -9, -12.5, -6.5, -3, 1.1], [60.5, -72, 62.8, -70.4, -2.1, 1.1], [-11.6, -24.6, -9.6, -22.6, -3, 0.8], [-1.6, -41.6, -0.5, -39, -3, 1.4], [-19.5, -34, -18.4, -29, -3, 1.6], [2, -43.6, 6, -42.5, -3, 1.4], [25, -71, 30, -66.5, -3.4, 1.8], [-7, -70, -2.5, -66, -3, 1.6], [3.5, -62, 7.5, -60, -3, 1.2]];

// solid props that block (shared by the drawn decor and the collider): [x0, y0, z0, x1, y1, z1]
export const PROPBOX = [
  [44, -2.1, -91.6, 45.4, -1.0, -90.2], [45.6, -2.1, -91.6, 46.8, -1.2, -90.4], [44.3, -1.0, -91.4, 45.3, -0.2, -90.4],   // den: crate stack under the catwalk
  [50, -2.1, -80, 52.4, -1.3, -78.8],                                                                                       // den: the smugglers' table
  [52.6, -2.1, -77, 53.8, -0.9, -75.8],                                                                                     // den: barrels
  [70.3, -2.1, -86.4, 72, -0.4, -84.2],                                                                                   // winch: the drum frame
];
const BARRELS = [[53.2, -76.4], [52.4, -75.2], [37.4, -76], [-7, -57], [52.2, -64.2], [53.1, -63.9], [56.6, -64.1], [63.3, -73.3], [-11.4, -17.7], [-21, -29.3]];
// side-chamber crates: drawn as the den's, and solid
export const CRATES = [[57.6, -2.1, -68.3, 58.8, -1.1, -67.1], [57.7, -2.1, -66.9, 58.7, -1.3, -65.9], [57.8, -1.1, -68.2, 58.6, -0.3, -67.3], [-26.2, -3, -25.4, -25.2, -2.2, -24.4], [-7.7, -3, -24.6, -6.8, -2.45, -23.5], [61.8, -2.1, -73.4, 62.8, -1.3, -72.9]];
const HOFF = (x) => (x > 30 ? -2.1 : -3);   // the floor under a prop: the den side sits at -2.1, the old drains at -3
function sewerDecor(ctx, K, B, lod) {
  // the smugglers' den: crates, a table with a lantern stub and cards, barrels, sacks
  K.paint(TX.oak, "oklch(0.66 0.04 60)");
  for (const b of PROPBOX.slice(0, 3)) { B(...b); K.paint(TX.oak, "oklch(0.5 0.03 55)"); B(b[0] - 0.02, b[4] - 0.08, b[2] - 0.02, b[3] + 0.02, b[4] - 0.02, b[5] + 0.02); K.paint(TX.oak, "oklch(0.66 0.04 60)"); }
  B(50, -1.4, -80, 52.4, -1.3, -78.8); for (const [x, z] of [[50.1, -79.9], [52.3, -79.9], [50.1, -78.9], [52.3, -78.9]]) B(x - 0.05, -2.1, z - 0.05, x + 0.05, -1.4, z + 0.05);
  K.paint(null, "oklch(0.9 0.02 90)"); for (let i = 0; i < 5; i++) B(50.6 + i * 0.25, -1.3, -79.5 + (i % 2) * 0.15, 50.75 + i * 0.25, -1.29, -79.3 + (i % 2) * 0.15);
  K.paint(TX.oak, "oklch(0.58 0.05 50)"); for (const [x, z] of BARRELS) { const y = HOFF(x); K.cyl(x, y, z, 0.38, 0.42, 1.0, lod <= 2 ? 12 : 7); K.paint(TX.iron, "oklch(0.42 0.02 250)", 0.6, 0.6); K.cyl(x, y + 0.2, z, 0.43, 0.43, 0.06, lod <= 2 ? 12 : 7); K.cyl(x, y + 0.75, z, 0.43, 0.43, 0.06, lod <= 2 ? 12 : 7); K.paint(TX.oak, "oklch(0.58 0.05 50)"); }
  K.paint(TX.hay, "oklch(0.5 0.045 70)", 1); for (const [x, z] of [[47, -90.8], [47.8, -91], [38, -80], [-7.4, -55.6], [54.5, -67.9], [55.3, -68], [52.6, -66.4]]) K.rock(x, HOFF(x), z, 0.4, 0.35, 0.3, 7, 3, 0.2);   // sacks
  // SIDE CHAMBERS
  K.paint(TX.oak, "oklch(0.66 0.04 60)");
  for (const b of CRATES) { B(...b); K.paint(TX.oak, "oklch(0.5 0.03 55)"); B(b[0] - 0.02, b[4] - 0.08, b[2] - 0.02, b[3] + 0.02, b[4] - 0.02, b[5] + 0.02); K.paint(TX.oak, "oklch(0.66 0.04 60)"); }
  // the store: two plank shelves along the south wall, legs, jars on them
  K.paint(TX.oak, "oklch(0.55 0.04 55)");
  for (const y of [-1.35, -0.6]) B(51.4, y, -63.55, 56, y + 0.06, -63.05);
  for (const x of [51.5, 53.7, 55.9]) B(x - 0.04, -2.1, -63.5, x + 0.04, -0.54, -63.1);
  K.paint(null, "oklch(0.55 0.08 40)"); for (let i = 0; i < 7; i++) K.cyl(51.8 + i * 0.6, i % 2 ? -0.54 : -1.29, -63.3, 0.09, 0.11, 0.24, 6);
  // the sluice: a rusted gate wheel on its post, the gate slab sunk in the basin
  K.paint(TX.iron, "oklch(0.52 0.09 45)", 0.8, 0.5);
  { const N = 10, R = 0.55, cx = -26.3; for (let i = 0; i < N; i++) { const a = i / N * 6.283, b = (i + 1) / N * 6.283; K.seg([cx, -1.5 + Math.sin(a) * R, -27.5 + Math.cos(a) * R], [cx, -1.5 + Math.sin(b) * R, -27.5 + Math.cos(b) * R], 0.05, 0.05, 5, true); }
    for (let i = 0; i < 3; i++) { const a = i / 3 * 3.1416 + 0.3; K.seg([cx, -1.5 + Math.sin(a) * R, -27.5 + Math.cos(a) * R], [cx, -1.5 - Math.sin(a) * R, -27.5 - Math.cos(a) * R], 0.03, 0.03, 4, true); }
    K.seg([cx - 0.08, -1.5, -27.5], [cx + 0.08, -1.5, -27.5], 0.1, 0.1, 8, true); }   // the gate wheel: a rusted rim, three spokes, a hub
  K.paint(TX.oak, "oklch(0.45 0.03 50)"); K.seg([-26.4, -1.5, -27.5], [-25.4, -1.5, -27.5], 0.08, 0.08, 6, true);
  K.paint(TX.iron, "oklch(0.35 0.04 45)", 0.8, 0.5); B(-23.4, -3.7, -29, -23.2, -2.4, -26);
  // the rat nest: a heap of straw and rag in the corner, gnawed bones around it
  K.paint(TX.hay, "oklch(0.52 0.05 75)", 1); for (const [x, z, r] of [[-11, -24, 0.7], [-10.2, -24.3, 0.5], [-11.3, -23.2, 0.45]]) K.rock(x, -3, z, r, 0.28, r * 0.9, 7, 3, 0.35);
  K.paint(null, "oklch(0.6 0.04 70)", 0.95); for (let i = 0; i < 9; i++) { const a = i * 0.7, x = -10.5 + Math.cos(a) * (1 + (i % 3) * 0.4), z = -23.6 + Math.sin(a) * (1 + (i % 3) * 0.4); K.seg([x, -2.96, z], [x + Math.cos(a * 3) * 0.3, -2.96, z + Math.sin(a * 3) * 0.3], 0.025, 0.025, 4, true); }
  // the drowned cellar: planks afloat, a sunk cart wheel
  K.paint(TX.oak, "oklch(0.42 0.04 55)"); B(57.5, -2.15, -76.6, 59.6, -2.08, -76.3); B(60.4, -2.14, -77.4, 61.1, -2.08, -75.8);
  K.paint(TX.oak, "oklch(0.38 0.03 55)"); K.seg([62, -2.4, -77.2], [62, -2.3, -76.4], 0.5, 0.5, lod <= 2 ? 12 : 7, true);
  // the winch room: a timber frame and a drum wound with chain
  // gauntlet critic Nov 4: "two black boxes mid-room" -> it stands against the east wall: posts, braces, a drum with iron bands, a crank wheel, chain coiled at its foot
  K.paint(TX.oak, "oklch(0.62 0.045 58)"); B(70.3, -2.1, -86.4, 70.55, -0.4, -86.15); B(70.3, -2.1, -84.45, 70.55, -0.4, -84.2); B(71.75, -2.1, -86.4, 72, -0.4, -86.15); B(71.75, -2.1, -84.45, 72, -0.4, -84.2);
  B(70.3, -0.55, -86.4, 72, -0.4, -84.2); B(70.3, -2.1, -86.4, 72, -1.95, -86.15); B(70.3, -2.1, -84.45, 72, -1.95, -84.2);
  K.seg([70.42, -2.0, -86.28], [70.42, -0.6, -84.32], 0.05, 0.05, 5, true); K.seg([71.88, -2.0, -84.32], [71.88, -0.6, -86.28], 0.05, 0.05, 5, true);
  K.paint(TX.oak, "oklch(0.5 0.04 55)"); K.seg([71.15, -1.2, -86.15], [71.15, -1.2, -84.45], 0.36, 0.36, lod <= 2 ? 14 : 8, true);
  K.paint(TX.iron, "oklch(0.5 0.02 250)", 0.7, 0.5); for (const z of [-86.0, -85.3, -84.6]) K.seg([71.15, -1.2, z - 0.05], [71.15, -1.2, z + 0.05], 0.38, 0.38, lod <= 2 ? 14 : 8, true);
  K.seg([71.15, -1.2, -84.45], [71.15, -1.2, -83.95], 0.05, 0.05, 6, true);
  for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; K.seg([71.15, -1.2, -83.98], [71.15 + Math.cos(a) * 0.5, -1.2 + Math.sin(a) * 0.5, -83.98], 0.025, 0.025, 4, true); }
  K.seg([71.15, -0.7, -84.0], [71.15, -0.68, -83.96], 0.5, 0.5, lod <= 2 ? 16 : 8, true);
  K.paint(TX.iron, "oklch(0.42 0.03 50)", 0.8, 0.4); for (let i = 0; i < 9; i++) K.seg([71.15, -1.55 + i * 0.36, -85.3 - (i % 2) * 0.04], [71.15, -1.2 + i * 0.36, -85.3 + (i % 2) * 0.04], 0.03, 0.03, 4, true);
  for (let i = 0; i < 14; i++) { const a = i * 0.9, r = 0.18 + (i % 3) * 0.06; K.seg([70.75 + Math.cos(a) * r, -2.07, -87.0 + Math.sin(a) * r], [70.75 + Math.cos(a + 0.9) * r, -2.07, -87.0 + Math.sin(a + 0.9) * r], 0.03, 0.03, 4, true); }
  // the ossuary: three stone shelves down the east wall carry the bones and skulls; skulls line the bowmen's ledge
  // (creator, Oct 29: bones hung in the air with nothing under them; every bone now rests on stone)
  // gauntlet critic Nov 4: "bare beige slabs floating on the wall with no supports" -> the vault's own dressed stone, darker, on corbels
  K.paint(TX.vault ?? null, "oklch(0.46 0.025 65)", 0.95);
  for (const y of [-2.75, -1.85, -0.95]) for (const z of [-70.2, -67.6, -65, -59.6, -57.4, -55.4]) { K.box(29.55, y - 0.42, z - 0.1, 30, y - 0.1, z + 0.1); K.box(29.75, y - 0.62, z - 0.08, 30, y - 0.42, z + 0.08); }   // a stepped corbel under the slab every 2.5 m
  // (chubigans Nov 4: "this shelf that goes through a doorway": the east door is z -63.5..-60.5, so each shelf runs in two lengths beside it)
  const RUNS = [[-70.6, -63.8], [-60.2, -55]];
  for (const y of [-2.75, -1.85, -0.95]) for (const [a, b] of RUNS) { K.box(29.3, y - 0.1, a, 30, y, b); K.box(29.25, y - 0.16, a, 29.32, y - 0.1, b); }   // the slab and its worn lip
  // a bone is a shaft with a knuckle at each end, old ivory going brown where it lay; a skull is a cranium, a brow and a jaw
  const bone = (x, y, z, yaw, L) => { const dx = Math.sin(yaw) * L / 2, dz = Math.cos(yaw) * L / 2;
    K.seg([x - dx, y + 0.025, z - dz], [x + dx, y + 0.025, z + dz], 0.018, 0.022, 5, true);
    for (const k of [-1, 1]) { K.rock(x + k * dx - 0.02, y + 0.03, z + k * dz, 0.035, 0.03, 0.03, 5, 2, 0.15); K.rock(x + k * dx + 0.02, y + 0.03, z + k * dz, 0.03, 0.028, 0.03, 5, 2, 0.15); } };
  const skull = (x, y, z, turn) => { K.rock(x, y + 0.09, z, 0.085, 0.08, 0.1, 7, 4, 0.06); K.rock(x - 0.01, y + 0.05, z + turn * 0.07, 0.06, 0.04, 0.05, 6, 3, 0.1);
    K.paint(null, "oklch(0.2 0.02 60)", 1); for (const k of [-1, 1]) K.rock(x - 0.07, y + 0.1, z + k * 0.035, 0.022, 0.02, 0.022, 5, 2, 0); K.paint(null, "oklch(0.64 0.045 75)", 0.9); };
  K.paint(null, "oklch(0.66 0.045 75)", 0.9);
  for (let i = 0; i < (lod <= 2 ? 42 : 14); i++) {
    const y = [-2.75, -1.85, -0.95][i % 3], z = -70.2 + ((i * 1.37) % 14.8), x = 29.45 + (i % 4) * 0.09;
    if (z > -63.9 && z < -60.1) continue;   // nothing on the doorway
    K.paint(null, ["oklch(0.66 0.045 75)", "oklch(0.55 0.05 65)", "oklch(0.72 0.04 85)", "oklch(0.48 0.04 60)"][(i * 7) % 4], 0.92);   // old bone: dust, brown where it lay, never bright white
    bone(x, y, z, 0.15 + (i % 7) * 0.4, 0.3 + (i % 3) * 0.08);
    if (i % 3 === 0 && z + 0.35 < -63.9 || i % 3 === 0 && z > -60.1) skull(x + 0.12, y, z + 0.3, i % 2 ? 1 : -1);
  }
  for (let i = 0; i < (lod <= 2 ? 9 : 4); i++) skull(16.6, -1.4, -69.5 + i * 1.1, i % 2 ? 1 : -1);
  // the crypt (gauntlet critic Nov 4: pale slivers littered the walk): the bones lie drifted against the wall feet, out of the walking line
  for (let i = 0; i < (lod <= 2 ? 22 : 8); i++) {
    const side = i % 3, t = (i * 0.618) % 1, x = side === 0 ? 16 + t * 12.5 : 29.55 - (i % 2) * 0.12, z = side === 0 ? -38.45 - (i % 2) * 0.14 : (side === 1 ? -40 - t * 2.2 : -49.8 - t * 3.6);
    K.paint(null, ["oklch(0.62 0.045 75)", "oklch(0.52 0.05 65)", "oklch(0.68 0.04 85)", "oklch(0.46 0.04 60)"][(i * 5) % 4], 0.92);
    bone(x, -3.4, z, side === 0 ? 1.2 + (i % 5) * 0.3 : (i % 5) * 0.35, 0.3 + (i % 3) * 0.08);
    if (i % 4 === 0) skull(x + (side === 0 ? 0.1 : -0.12), -3.4, z + (side === 0 ? -0.05 : 0.15), i % 2 ? 1 : -1);
  }
  // the bone stair (critic: a bare tube): a charnel ledge on corbels down its north wall, skulls in a row and long bones stacked under them
  K.paint(TX.vault, "oklch(0.46 0.025 65)", 0.95);
  K.box(31, -2.05, -63.5, 39.5, -1.93, -63.08); for (let x = 31.4; x < 39.5; x += 2) K.box(x - 0.1, -2.35, -63.5, x + 0.1, -2.05, -63.25);
  for (let i = 0; i < (lod <= 2 ? 14 : 5); i++) { const x = 31.3 + i * (lod <= 2 ? 0.58 : 1.6);
    K.paint(null, ["oklch(0.62 0.045 75)", "oklch(0.52 0.05 65)", "oklch(0.68 0.04 85)"][i % 3], 0.92);
    if (i % 3 === 1) bone(x, -1.93, -63.28, 1.57, 0.36); else skull(x, -1.93, -63.28, 1); }
}
// THE SEWER KIT, laid over every drain room: dressed ribs and pilasters marking the bays, kerbs on the channel,
// the slime line where the water has ridden for a century, roots through the earth ceilings. Drawn only: the collider is the rooms'.
const SEWER = (r) => r.y < 0 && (r.wall === "brick" || r.ceil === "earth");
function gapsOn(r, side) { return [...((r.open ?? {})[side] ?? [])].map(([a, b]) => [a - 0.3, b + 0.3]); }
function freeAt(r, side, u) { return !(r.skip ?? []).includes(side) && !gapsOn(r, side).some(([a, b]) => u > a && u < b); }
function rib(ctx, K, r, l, n) {   // one stone arch band 0.36 m wide hugging the barrel 0.14 m in, at l along the vault's axis
  const along = r.vault === "z", a0 = along ? r.x0 - T : r.z0 - T, a1 = along ? r.x1 + T : r.z1 + T, R = (a1 - a0) / 2, m = (a0 + a1) / 2, s = r.y + r.h;
  const P = (i, rr, ll) => { const t = Math.PI * i / n, u = m - Math.cos(t) * rr * (1 - 0.0001), y = s + Math.sin(t) * rr * 0.75; return along ? [u, y, ll] : [ll, y, u]; };
  const ri = R - 0.14, w = 0.18, c = along ? [m, s, l] : [l, s, m];
  for (let i = 0; i < n; i++) {
    K.quad(P(i, ri, l - w), P(i + 1, ri, l - w), P(i + 1, ri, l + w), P(i, ri, l + w), c);                  // the soffit
    for (const e of [l - w, l + w]) K.quad(P(i, R, e), P(i + 1, R, e), P(i + 1, ri, e), P(i, ri, e), along ? [m, s - 1, e + (e < l ? -1 : 1)] : [e + (e < l ? -1 : 1), s - 1, m]);
  }
}
function cisternKit(K, B, lod) {
  const r = ROOMS.find((q) => q.id === "cistern"); if (!r) return;
  const y = r.y, top = r.y + r.h, XS = [7, 17], ZS = [-79, -86];
  K.paint(TX.rib, "oklch(0.8 0.018 80)", 0.85);
  // the roof's bones: two heavy transverse ribs and two longitudinal ones, resting on the four pillars, deep enough to read from the water
  for (const z of ZS) B(r.x0, top - 0.7, z - 0.32, r.x1, top, z + 0.32);
  for (const x of XS) B(x - 0.32, top - 0.55, r.z0, x + 0.32, top, r.z1);
  // pilasters where each rib lands on a wall, with a springer block under the rib
  for (const z of ZS) for (const sd of ["W", "E"]) { if (!freeAt(r, sd, z)) continue; const xa = sd === "W" ? r.x0 : r.x1 - 0.3, xb = sd === "W" ? r.x0 + 0.3 : r.x1; B(xa, y - 1.2, z - 0.4, xb, top - 0.7, z + 0.4); B(sd === "W" ? r.x0 : r.x1 - 0.45, top - 0.95, z - 0.5, sd === "W" ? r.x0 + 0.45 : r.x1, top - 0.7, z + 0.5); }
  for (const x of XS) for (const sd of ["N", "S"]) { if (!freeAt(r, sd, x)) continue; const za = sd === "N" ? r.z0 : r.z1 - 0.3, zb = sd === "N" ? r.z0 + 0.3 : r.z1; B(x - 0.4, y - 1.2, za, x + 0.4, top - 0.55, zb); B(x - 0.5, top - 0.8, sd === "N" ? r.z0 : r.z1 - 0.45, x + 0.5, top - 0.55, sd === "N" ? r.z0 + 0.45 : r.z1); }
  // a string course 3.2 m up all round: the line the old builders stepped the wall in at
  const sc = y + 3.2;
  for (const sd of ["N", "S", "W", "E"]) {
    const alongX = sd === "N" || sd === "S", lo = alongX ? r.x0 : r.z0, hi = alongX ? r.x1 : r.z1;
    let at = lo; const run = (a, b) => { if (b - a < 0.05) return;
      if (sd === "N") B(a, sc, r.z0, b, sc + 0.22, r.z0 + 0.14); if (sd === "S") B(a, sc, r.z1 - 0.14, b, sc + 0.22, r.z1);
      if (sd === "W") B(r.x0, sc, a, r.x0 + 0.14, sc + 0.22, b); if (sd === "E") B(r.x1 - 0.14, sc, a, r.x1, sc + 0.22, b); };
    for (const [a, b] of gapsOn(r, sd).filter(([, , h]) => true).map(([a, b]) => [a, b]).sort((p, q) => p[0] - q[0])) { if (sc < y + 2.7) { run(at, a); at = b; } } run(at, hi);
  }
  // the waterline: a century of the pool riding high left a dark band a metre up every wall
  K.paint(TX.slime, "oklch(0.55 0.05 135)", 0.4);
  for (const sd of ["N", "S", "W", "E"]) {
    if (sd === "N") B(r.x0, y - 1.2, r.z0, r.x1, y + 1.0, r.z0 + 0.02); if (sd === "S") B(r.x0, y - 1.2, r.z1 - 0.02, r.x1, y + 1.0, r.z1);
    if (sd === "W") B(r.x0, y - 1.2, r.z0, r.x0 + 0.02, y + 1.0, r.z1); if (sd === "E") B(r.x1 - 0.02, y - 1.2, r.z0, r.x1, y + 1.0, r.z1);
  }
}
function sewerKit(ctx, K, B, lod) {
  const n = lod <= 2 ? 10 : 6;
  cisternKit(K, B, lod);   // harsh critic Nov 6: the cistern read as a bare 8 m box: flat walls, flat lid, nothing carrying the roof
  for (const r of ROOMS) {
    if (!SEWER(r)) continue;
    const y = r.y, top = r.y + r.h;
    // the slime line: a dark green band 0.45 m up every wall face
    K.paint(TX.slime, "oklch(0.75 0.05 135)", 0.35);
    for (const side of ["N", "S", "W", "E"]) {
      if ((r.skip ?? []).includes(side)) continue;
      const alongX = side === "N" || side === "S", lo = alongX ? r.x0 : r.z0, hi = alongX ? r.x1 : r.z1;
      let at = lo; const run = (a, b) => { if (b - a < 0.05) return;
        if (side === "N") B(a, y, r.z0, b, y + 0.45, r.z0 + 0.02); if (side === "S") B(a, y, r.z1 - 0.02, b, y + 0.45, r.z1);
        if (side === "W") B(r.x0, y, a, r.x0 + 0.02, y + 0.45, b); if (side === "E") B(r.x1 - 0.02, y, a, r.x1, y + 0.45, b); };
      for (const [a, b] of [...((r.open ?? {})[side] ?? [])].sort((p, q) => p[0] - q[0])) { run(at, a); at = b; } run(at, hi);
    }
    if (r.vault) {
      // a bay every 3.5 m: a pilaster on each wall and a rib over the barrel between them
      const along = r.vault === "z", L0 = along ? r.z0 : r.x0, L1 = along ? r.z1 : r.x1, sides = along ? ["W", "E"] : ["N", "S"];
      for (let l = L0 + 1.2; l < L1 - 0.8; l += 3.5) {
        K.paint(TX.rib, "oklch(0.86 0.015 85)", 0.85);
        rib(ctx, K, r, l, n);
        for (const sd of sides) {
          if (!freeAt(r, sd, l)) continue;
          if (sd === "W") B(r.x0, y, l - 0.25, r.x0 + 0.16, top, l + 0.25); if (sd === "E") B(r.x1 - 0.16, y, l - 0.25, r.x1, top, l + 0.25);
          if (sd === "N") B(l - 0.25, y, r.z0, l + 0.25, top, r.z0 + 0.16); if (sd === "S") B(l - 0.25, y, r.z1 - 0.16, l + 0.25, top, r.z1);
          // the springer: a moulded impost block where the rib lands
          if (sd === "W") B(r.x0, top - 0.12, l - 0.3, r.x0 + 0.24, top + 0.04, l + 0.3); if (sd === "E") B(r.x1 - 0.24, top - 0.12, l - 0.3, r.x1, top + 0.04, l + 0.3);
          if (sd === "N") B(l - 0.3, top - 0.12, r.z0, l + 0.3, top + 0.04, r.z0 + 0.24); if (sd === "S") B(l - 0.3, top - 0.12, r.z1 - 0.24, l + 0.3, top + 0.04, r.z1);
          K.paint(TX.slime, "oklch(0.7 0.05 135)", 0.35);
          if (sd === "W") B(r.x0 + 0.16, y, l - 0.26, r.x0 + 0.18, y + 0.5, l + 0.26); if (sd === "E") B(r.x1 - 0.18, y, l - 0.26, r.x1 - 0.16, y + 0.5, l + 0.26);
          if (sd === "N") B(l - 0.26, y, r.z0 + 0.16, l + 0.26, y + 0.5, r.z0 + 0.18); if (sd === "S") B(l - 0.26, y, r.z1 - 0.18, l + 0.26, y + 0.5, r.z1 - 0.16);
          K.paint(TX.rib, "oklch(0.86 0.015 85)", 0.85);
        }
      }
    }
    const c = r.chan;
    if (c) {
      // kerbstones along both lips of the channel, a hand's height proud, and the channel walls slimed to the waterline
      const kz = r.vault === "z";
      K.paint(TX.rib, "oklch(0.6 0.02 75)", 0.8);
      for (const e of [-1, 1]) {
        const lip = c.c + e * c.w / 2;
        for (let a = c.a; a < c.b - 0.01; a += 0.9) {
          const b = Math.min(c.b, a + 0.9);   // butted tight: the old 4 cm joints showed bright floor through as white dashes
          if (kz) B(e < 0 ? lip - 0.32 : lip, y, a, e < 0 ? lip : lip + 0.32, y + 0.07, b); else B(a, y, e < 0 ? lip - 0.32 : lip, b, y + 0.07, e < 0 ? lip : lip + 0.32);
        }
        K.paint(TX.slime, "oklch(0.62 0.06 135)", 0.25);
        if (kz) B(e < 0 ? lip : lip - 0.02, y - 1.0, c.a, e < 0 ? lip + 0.02 : lip, y - 0.02, c.b); else B(c.a, y - 1.0, e < 0 ? lip : lip - 0.02, c.b, y - 0.02, e < 0 ? lip + 0.02 : lip);
        K.paint(TX.rib, "oklch(0.6 0.02 75)", 0.8);
      }
    }
    if (r.ceil === "earth" && lod <= 3) {
      // roots through the earth (critic Nov 4: "a regular row of spikes"): hashed clumps, each a few kinked strands with side shoots, hugging the walls more than the middle
      const area = (r.x1 - r.x0) * (r.z1 - r.z0), nC = Math.min(12, Math.max(3, Math.round(area / 9)));
      const H = (n) => { const v = Math.sin(n * 127.1 + r.x0 * 3.7 + r.z0 * 1.3) * 43758.5453; return v - Math.floor(v); };
      for (let c = 0; c < nC; c++) {
        const edge = H(c * 7 + 1) < 0.6, ex = H(c * 7 + 2), ez = H(c * 7 + 3), side = Math.floor(H(c * 7 + 4) * 4);
        let cx = r.x0 + 0.5 + ex * (r.x1 - r.x0 - 1), cz = r.z0 + 0.5 + ez * (r.z1 - r.z0 - 1);
        if (edge) { if (side === 0) cx = r.x0 + 0.35; else if (side === 1) cx = r.x1 - 0.35; else if (side === 2) cz = r.z0 + 0.35; else cz = r.z1 - 0.35; }
        K.paint(null, ["oklch(0.34 0.045 55)", "oklch(0.28 0.035 50)", "oklch(0.4 0.04 65)"][c % 3], 0.95);
        const nS = 3 + Math.floor(H(c * 7 + 5) * 4);
        for (let s = 0; s < nS; s++) {
          let p = [cx + (H(c * 31 + s) - 0.5) * 0.7, top + 0.02, cz + (H(c * 37 + s) - 0.5) * 0.7], rad = 0.03 + H(c * 41 + s) * 0.03;
          const len = (0.35 + H(c * 43 + s) * 0.9) * (edge ? 1 : 0.6), segs = 3;
          for (let k = 0; k < segs; k++) {
            const q = [p[0] + (H(c * 53 + s * 5 + k) - 0.5) * 0.22, p[1] - len / segs, p[2] + (H(c * 59 + s * 5 + k) - 0.5) * 0.22];
            K.seg(p, q, rad, rad * 0.65, 4, true);
            if (k === 1 && H(c * 61 + s) < 0.5) K.seg(q, [q[0] + (H(c * 67 + s) - 0.5) * 0.4, q[1] - 0.18, q[2] + (H(c * 71 + s) - 0.5) * 0.4], rad * 0.5, 0.004, 3, true);
            p = q; rad *= 0.65;
          }
        }
      }
    }
  }
}
function portcullis(ctx) {   // local: centred on x, bottom at y 0, in the z = 0 plane
  const K = kit(ctx, false), w = GATE.w, h = GATE.h; K.paint(TX.iron, "oklch(0.5 0.02 250)", 0.6, 0.6);
  for (let x = -w / 2 + 0.12; x <= w / 2 - 0.1; x += 0.24) { K.box(x - 0.03, 0.12, -0.03, x + 0.03, h, 0.03); K.seg([x, 0.12, 0], [x, -0.02, 0], 0.03, 0.005, 4, true); }
  for (let y = 0.5; y < h; y += 0.6) K.box(-w / 2, y - 0.04, -0.05, w / 2, y + 0.04, 0.05);
  K.paint(TX.iron, "oklch(0.38 0.03 50)", 0.8, 0.4); K.box(-w / 2, h - 0.12, -0.07, w / 2, h, 0.07);
}
function lever(ctx) {   // a wall lever: plate, pivot, a handle pointing up (pull: rotate the object)
  const K = kit(ctx, false); K.paint(TX.oak, "oklch(0.55 0.04 55)"); K.box(-0.25, 0.9, -0.06, 0.25, 1.6, 0.04);
  K.paint(TX.iron, "oklch(0.45 0.02 250)", 0.6, 0.6); K.cyl(0, 1.25, 0.04, 0.06, 0.06, 0.08, 8); const dn = ctx.params?.pulled ? -1 : 1;
  K.seg([0, 1.25, 0.1], [0, 1.25 + 0.6 * dn, 0.16], 0.035, 0.03, 6, true);
  K.paint(TX.oak, "oklch(0.4 0.03 55)"); K.seg([0, 1.25 + 0.55 * dn, 0.15], [0, 1.25 + 0.73 * dn, 0.17], 0.05, 0.05, 6, true);
}

function shell(ctx) {
  const K = kit(ctx, false), lod = ctx.lod, B = (...a) => K.box(...a);
  const P = (k, c = "oklch(0.92 0.01 80)", r = 0.9) => () => K.paint(TX[k], c, r);
  for (const r of ROOMS) { walls(B, r, P(r.wall)); floors(B, r, P(r.floor), P(r.ceil, "oklch(0.8 0.02 60)")); if (r.vault) { K.paint(TX.brick, "oklch(0.85 0.02 40)"); vault(ctx, r); } }
  K.paint(TX.fs, "oklch(0.9 0.01 80)"); steps(B);
  // the cell fronts: iron bars, rails top and bottom
  K.paint(TX.iron, "oklch(0.7 0.01 250)", 0.6, 0.6);
  for (const x of BARS_X) {
    const gaps = x > 0 ? [[-2, -1]] : [[-10, -9]];
    for (let z = 0.45; z > -11.5; z -= 0.16) { if (gaps.some(([a, b]) => z > a && z < b)) continue; if (lod <= 2) K.seg([x, 0, z], [x, 3.2, z], 0.022, 0.022, 5, false); else B(x - 0.02, 0, z - 0.02, x + 0.02, 3.2, z + 0.02); }
    for (const y of [0.08, 1.15, 2.4, 3.1]) {   // rails stop at a doorway; only the head rail (3.1, above the leaf) runs across it
      if (y >= 3) { B(x - 0.04, y - 0.04, -11.5, x + 0.04, y + 0.04, 0.5); continue; }
      let at = -11.5; for (const [a, b] of gaps) { B(x - 0.04, y - 0.04, at, x + 0.04, y + 0.04, a); at = b; } B(x - 0.04, y - 0.04, at, x + 0.04, y + 0.04, 0.5);
    }
  }
  K.paint(TX.iron, "oklch(0.55 0.04 50)", 0.8, 0.4); K.box(-1.55, 0.05, -10.0, -1.45, 2.3, -9.95);   // west 3's door leaf, torn off one hinge
  K.seg([-1.6, 0.05, -10], [-2.4, 0.2, -10.6], 0.02, 0.02, 4, true);
  K.paint(TX.fs, "oklch(0.9 0.01 80)"); for (const z of [-3.5, -7.5]) { B(1.5, 0, z - 0.15, 5, 3.2, z + 0.15); B(-5, 0, z - 0.15, -1.5, 3.2, z + 0.15); }
  // straw in every cell, a bucket, chains, a plank bunk
  for (const x of [3.3, -3.3]) for (const z of CELLS) {
    K.paint(TX.hay, "oklch(0.4 0.025 90)"); { const sx = x + (x > 0 ? 0.7 : -0.7); K.rock(sx, 0, z + 0.6, 0.75, 0.28, 0.85, 8, 4, 0.35); K.rock(sx + (x > 0 ? 0.35 : -0.35), 0, z + 1.05, 0.4, 0.18, 0.45, 7, 3, 0.4); K.rock(sx - 0.3, 0, z + 0.15, 0.3, 0.12, 0.3, 6, 3, 0.4); }
    K.paint(null, "oklch(0.42 0.04 40)", 0.95); K.seg([x > 0 ? 4.6 : -4.6, 0.62, z - 1.45], [x > 0 ? 4.6 : -4.6, 0.62, z - 0.75], 0.11, 0.11, 8, true);   // a rolled wool blanket on the bunk
    K.paint(TX.oak, "oklch(0.7 0.03 60)"); B(x > 0 ? 4.2 : -5, 0.45, z - 1.6, x > 0 ? 5 : -4.2, 0.53, z + 0.4);
    K.paint(TX.iron, "oklch(0.55 0.02 250)", 0.6, 0.6);
    const wx = x > 0 ? 4.96 : -4.96; for (const dz of [-0.6, 0.6]) { K.cyl(wx, 1.6, z + dz, 0.06, 0.06, 0.12); for (let i = 0; i < 6; i++) K.seg([wx - Math.sign(wx) * 0.03 * i, 1.6 - i * 0.14, z + dz], [wx - Math.sign(wx) * 0.03 * (i + 1), 1.6 - (i + 1) * 0.14, z + dz], 0.025, 0.025, 4, true); }
  }
  K.paint(TX.oak, "oklch(0.72 0.03 60)"); K.cyl(4.4, 0, -2.9, 0.2, 0.24, 0.4, 10); K.paint(TX.iron, "oklch(0.5 0.02 250)", 0.6, 0.6); K.cyl(4.4, 0.32, -2.9, 0.245, 0.245, 0.04, 10);
  // the broken west wall of west 3: fallen stones
  K.paint(TX.fs, "oklch(0.9 0.01 80)"); for (let i = 0; i < 6; i++) K.rock(-4.5 + (i % 3) * 0.35, 0, -10.6 + i * 0.4, 0.25, 0.18, 0.22, 6, 3, 0.25);
  // the guard's table: candle, dice, the heel of bread; a stool; a key board by the stair
  K.paint(TX.oak, "oklch(0.74 0.03 60)"); B(1.6, 0.74, -15.4, 3.4, 0.8, -13.8); for (const [x, z] of [[1.7, -15.3], [3.3, -15.3], [1.7, -13.9], [3.3, -13.9]]) B(x - 0.04, 0, z - 0.04, x + 0.04, 0.74, z + 0.04);
  K.cyl(1.2, 0, -14.6, 0.2, 0.2, 0.45, 8); K.cyl(-3.8, 0, -16.8, 0.25, 0.25, 0.75, 8); B(-7.45, 0.9, -17, -7.4, 2.2, -14);
  K.paint(null, "oklch(0.9 0.03 90)", 0.8); K.cyl(2.2, 0.8, -14.3, 0.035, 0.035, 0.16, 8); K.paint(null, "oklch(0.35 0.02 60)"); K.cyl(2.2, 0.8, -14.3, 0.07, 0.07, 0.02, 8);
  K.paint(null, "oklch(0.92 0.02 90)"); B(2.6, 0.8, -14.6, 2.63, 0.83, -14.57); B(2.7, 0.8, -14.5, 2.73, 0.83, -14.47);
  K.paint(null, "oklch(0.58 0.09 65)"); K.rock(3.0, 0.8, -14.9, 0.11, 0.05, 0.07, 6, 3, 0.15);
  K.paint(TX.iron, "oklch(0.5 0.02 250)", 0.6, 0.6); for (const [x, z] of [[-4.95, -2], [4.95, -7.5], [-7.45, -13], [1.15, -20.5]]) B(x - 0.05, 1.7, z - 0.05, x + 0.05, 1.8, z + 0.05);
  // the sewers: a ledge kerb, culvert mouths, the collapse, ceiling grates
  K.paint(TX.fs, "oklch(0.75 0.02 60)");
  for (const [x0, z0, x1, z1, y, hgt] of COLLAPSE) { const rs = Math.max(0.45, Math.min(1, Math.min(x1 - x0, z1 - z0) / 2.2)); for (let i = 0; i < (lod <= 2 ? 9 : 4); i++) K.rock(x0 + (x1 - x0) * ((i * 0.37) % 1), y, z0 + (z1 - z0) * ((i * 0.61) % 1), (0.55 + (i % 3) * 0.2) * rs, hgt * (0.25 + (i % 3) * 0.1), (0.5 + (i % 2) * 0.3) * rs, 7, 4, 0.35); }   // broad tumbled blocks, never cones
  K.paint(TX.iron, "oklch(0.45 0.05 50)", 0.8, 0.4);
  for (const [x, z] of [[-19.4, -14], [-12.6, -24], [-19.4, -38], [6, -49.4]]) { const w = Math.abs(x) > 12 ? "x" : "z"; K.seg(w === "x" ? [x, -2.3, z] : [x, -2.3, z], w === "x" ? [x + Math.sign(-x) * 0.3, -2.3, z] : [x, -2.3, z + 0.3], 0.45, 0.45, 10, true); }
  for (const [x, z, y] of [[-16, -26, 1.1], [-2, -46, 1.1], [37.8, -46, 2.55]]) { for (let i = -3; i <= 3; i++) B(x - 0.7, y, z + i * 0.2 - 0.025, x + 0.7, y + 0.06, z + i * 0.2 + 0.025); }
  // the crypt: pillars, sarcophagi, the wall the drain-diggers broke through
  K.paint(TX.vault, "oklch(0.88 0.01 80)");
  for (const x of [18.5, 26]) for (const z of [-50, -42]) { K.cyl(x, -3.4, z, 0.45, 0.45, 4.6, lod <= 2 ? 12 : 6); B(x - 0.55, -3.4, z - 0.55, x + 0.55, -3.1, z + 0.55); }
  for (const [x, z, rot] of SARC) { const hx = rot ? 0.5 : 1.1, hz = rot ? 1.1 : 0.5; B(x - hx, -3.4, z - hz, x + hx, -2.65, z + hz); K.paint(TX.vault, "oklch(0.8 0.01 80)"); B(x - hx - 0.05, -2.65, z - hz - 0.05, x + hx + 0.05, -2.5, z + hz + 0.05); K.paint(TX.vault, "oklch(0.88 0.01 80)"); }
  sewerDecor(ctx, K, B, lod);
  sewerKit(ctx, K, B, lod);
}
function shellCollider() {
  const B = CB();
  for (const r of ROOMS) { walls(B, r); floors(B, r); if (r.vault) B(r.x0 - T, r.y + r.h + 1.5, r.z0 - T, r.x1 + T, r.y + r.h + 2, r.z1 + T); }
  steps(B); bars(B);
  for (const [x0, z0, x1, z1, y, hgt] of COLLAPSE) rubble(B, x0, z0, x1, z1, y, hgt * 0.45);   // matches the lowered heaps
  B(1.6, 0, -15.4, 3.4, 0.8, -13.8);
  for (const b of PROPBOX) B(...b);
  for (const b of CRATES) B(...b);
  for (const [x, z, rot] of SARC) { const hx = rot ? 0.55 : 1.15, hz = rot ? 1.15 : 0.55; B(x - hx, -3.4, z - hz, x + hx, -2.5, z + hz); }
  for (const x of [18.5, 26]) for (const z of [-50, -42]) B(x - 0.5, -3.4, z - 0.5, x + 0.5, 1.2, z + 0.5);
  return B.list;
}
function celldoor(ctx) {
  const K = kit(ctx, false); K.paint(TX.iron, "oklch(0.62 0.01 250)", 0.6, 0.6);
  for (let z = -0.06; z > -0.98; z -= 0.16) K.seg([0, 0.05, z], [0, 3.05, z], 0.024, 0.024, 5, false);
  for (const y of [0.08, 1.15, 2.2, 3.05]) K.box(-0.04, y - 0.04, -1, 0.04, y + 0.04, 0);
  K.paint(TX.iron, "oklch(0.4 0.02 250)", 0.5, 0.7); K.box(-0.07, 1.0, -0.98, 0.07, 1.3, -0.82);
}
function frontdoor(ctx) {
  const K = kit(ctx, false); K.paint(TX.oak, "oklch(0.62 0.03 55)"); K.box(-0.8, 0, -0.08, 0.8, 2.4, 0.08);
  K.paint(TX.iron, "oklch(0.45 0.02 250)", 0.6, 0.6); for (const y of [0.4, 1.2, 2.0]) K.box(-0.78, y, 0.08, 0.78, y + 0.1, 0.11);
  K.cyl(0.55, 1.05, 0.11, 0.07, 0.07, 0.04, 8); K.box(-0.95, 2.4, -0.1, 0.95, 2.6, 0.12);
}
function grate(ctx) {
  // a street drain set flush in the cobbles: a two-step fieldstone kerb, a pitch-black throat, the top rungs of an iron ladder, heavy rusted bars on a hinge
  const K = kit(ctx, false);
  K.paint("cdn/texture-worn-grey-cobblestone-street-setts.png", "#b8b0a2");
  K.box(-1.35, -0.2, -1.35, 1.35, 0.05, -1.0); K.box(-1.35, -0.2, 1.0, 1.35, 0.05, 1.35); K.box(-1.35, -0.2, -1.0, -1.0, 0.05, 1.0); K.box(1.0, -0.2, -1.0, 1.35, 0.05, 1.0);
  K.paint("cdn/texture-worn-grey-cobblestone-street-setts.png", "#9a9284");
  K.box(-1.0, -0.2, -1.0, 1.0, 0.14, -0.78); K.box(-1.0, -0.2, 0.78, 1.0, 0.14, 1.0); K.box(-1.0, -0.2, -0.78, -0.78, 0.14, 0.78); K.box(0.78, -0.2, -0.78, 1.0, 0.14, 0.78);
  K.paint(TX.slime, "#4a5a3c", 1, 0); K.box(-0.78, 0.01, -0.78, 0.78, 0.035, -0.7); K.box(-0.78, 0.01, 0.7, 0.78, 0.035, 0.78);
  K.paint(null, "#050505"); K.box(-0.78, -0.2, -0.78, 0.78, 0.02, 0.78);
  K.paint(TX.iron, "#5a4a3c", 0.7, 0.5);
  for (const y of [0.03, 0.045]) K.box(-0.3, y, -0.74, 0.3, y + 0.012, -0.68);
  K.box(-0.32, -0.2, -0.76, -0.27, 0.06, -0.68); K.box(0.27, -0.2, -0.76, 0.32, 0.06, -0.68);
  K.paint(TX.iron, "#54473a", 0.7, 0.5);
  K.box(-0.8, 0.1, -0.8, 0.8, 0.17, -0.7); K.box(-0.8, 0.1, 0.7, 0.8, 0.17, 0.8); K.box(-0.8, 0.1, -0.7, -0.7, 0.17, 0.7); K.box(0.7, 0.1, -0.7, 0.8, 0.17, 0.7);
  for (let i = -4; i <= 4; i++) K.box(i * 0.155 - 0.028, 0.1, -0.7, i * 0.155 + 0.028, 0.165, 0.7);
  K.box(-0.7, 0.11, -0.03, 0.7, 0.16, 0.03);
  K.paint(TX.iron, "#45392f", 0.7, 0.5);
  for (const z of [-0.45, 0.45]) K.box(-0.92, 0.1, z - 0.09, -0.78, 0.2, z + 0.09);
  K.box(0.78, 0.12, -0.12, 0.9, 0.19, 0.12);
}
export function geometry(ctx) {
  const part = ctx.params?.part ?? "shell";
  if (part === "celldoor") return celldoor(ctx); if (part === "frontdoor") return frontdoor(ctx); if (part === "grate") return grate(ctx);
  if (part === "portcullis") return portcullis(ctx); if (part === "lever") return lever(ctx);
  if (part === "dress") { for (const p of ctx.params.parts ?? []) drawPart(ctx, p); return; } // the overworld gaol's bars, posts and plinths: params.parts
  return shell(ctx);
}
export function collider(ctx) {
  const part = ctx.params?.part ?? "shell";
  if (part === "celldoor") { const B = CB(); B(-0.05, 0, -1, 0.05, 3.1, 0); return B.list; }
  if (part === "frontdoor") { const B = CB(); B(-0.8, 0, -0.1, 0.8, 2.4, 0.1); return B.list; }
  if (part === "grate") { const B = CB(); B(-1.35, -0.6, -1.35, 1.35, 0.17, 1.35); return B.list; }   // chubigans Nov 4: fell through: a solid cover over the throat; the way down is the Climb down prompt
  if (part === "lever") return [];
  if (part === "dress") return partColliders(ctx.params?.parts ?? []);
  if (part === "portcullis") { const B = CB(); B(-GATE.w / 2, 0, -0.08, GATE.w / 2, GATE.h, 0.08); return B.list; }
  return shellCollider();
}
