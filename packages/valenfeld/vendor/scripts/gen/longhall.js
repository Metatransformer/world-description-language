// KALDMOOR's JARL'S LONGHALL (Hrothi): a long, low hall of black basalt and tarred staves on a basalt plinth,
// its turf roof buried in snow, crossed gable boards ending in carved serpent-wolf heads. Local origin = centre of the
// footprint on the ground; long axis Z, the door in the south gable (+Z). Floor at PY.
// Inside: the GREAT HALL (fire trench down the middle, sleeping platforms with furs along both walls, trestle tables,
// the jarl's high seat on a dais against the partition) and, behind it, the JARL'S HOLD: three box-beds.
import { paint, flatc, glow, BX, RB, LA, HX, SEG, PIPE, PATH, ROPE, TORUS, CB, OAK, TAR, HAY, IR, STONE, WOOD, TARC, IRONC } from "../lib/buildkit.js";
const BAS = "cdn/texture-wet-black-basalt-rock.png", TURF = "cdn/texture-turf-sod-roof.png", SNOW = "cdn/texture-snow-packed-fresh.png";
const FUR = "cdn/texture-grey-wolf-fur-pelt.png", WOOL = "cdn/texture-rust-red-wool-cloth.png", RED = "cdn/texture-faded-red-cloth-weave.png", FLAGS = "cdn/texture-flagstone-floor-worn.png";
const BASC = "oklch(0.82 0.01 260)", SNOWC = "oklch(0.8 0.018 245)" /* critic r8 Nov 4: 0.99 glared as a solid white slab; matches settlement.js snow */, OCHRE = "#9c3a22", BONE = "#d9cba6";
export const PY = 0.9, WX = 6.2, WZ = 16, IX = 5.6, IZ = 15.4, WTOP = 4.65, EX = 7.6, YE = 3.6, YR = 9.3, PZ = -9; // PZ: partition
const ry = (x) => YR - (YR - YE) * Math.abs(x) / EX;
const hh = (a, b = 0, s = 0) => { const v = Math.sin(a * 127.1 + b * 311.7 + s * 74.7) * 43758.5453; return v - Math.floor(v); };
// a slab from 4 bottom corners, thickness t straight up
function SLAB(c, a, b, d, e, t) { const up = (p) => [p[0], p[1] + t, p[2]]; HX(c, [a, b, d, e, up(a), up(b), up(d), up(e)]); }
// a prism: polygon (x,y) points extruded z0..z1 (convex fan)
function PRISM(c, pts, z0, z1) { const n = pts.length;
  for (let i = 1; i < n - 1; i++) { c.tri(pts[0][0], pts[0][1], z1, pts[i][0], pts[i][1], z1, pts[i + 1][0], pts[i + 1][1], z1); c.tri(pts[0][0], pts[0][1], z0, pts[i + 1][0], pts[i + 1][1], z0, pts[i][0], pts[i][1], z0); }
  for (let i = 0; i < n; i++) { const p = pts[i], q = pts[(i + 1) % n]; c.quad(p[0], p[1], z0, q[0], q[1], z0, q[0], q[1], z1, p[0], p[1], z1); } }
// a carved serpent-wolf head on a curling neck: base point, facing f (+1 = +z, -1 = -z), leaning lx sideways
function HEAD(c, x, y, z, f, lx, D) {
  const yaw = f > 0 ? 0 : 180, P = (u, v, w) => [x + u * lx, y + v, z + w * f];
  paint(c, TAR, TARC); PATH(c, [P(0, 0, 0), P(0.15, 0.55, 0.1), P(0.3, 1.0, 0.35), P(0.32, 1.25, 0.7)], 0.13, 6);
  const h = P(0.32, 1.32, 0.85);
  RB(c, h[0], h[1], h[2], 0.34, 0.3, 0.44, yaw, 0, 0);                         // skull
  RB(c, h[0], h[1] - 0.04, h[2] + 0.36 * f, 0.22, 0.16, 0.38, yaw, -6, 0);         // snout
  RB(c, h[0], h[1] - 0.17, h[2] + 0.3 * f, 0.2, 0.06, 0.36, yaw, 14, 0);           // gaping jaw
  for (const s of [-1, 1]) RB(c, h[0] + s * 0.11, h[1] + 0.22, h[2] - 0.12 * f, 0.07, 0.24, 0.1, yaw, -25, s * 12); // ears laid back
  if (D <= 2) { paint(c, TAR, TARC); for (let i = 0; i < 4; i++) { const p = P(0.12 + i * 0.07, 0.3 + i * 0.28, 0.02 + i * 0.12 - 0.12); RB(c, p[0], p[1], p[2] - 0.08 * f, 0.04, 0.22, 0.16, yaw, -30, 0); } // mane fins
    flatc(c, OCHRE); RB(c, h[0], h[1] + 0.155, h[2], 0.2, 0.012, 0.3, yaw, 0, 0);  // red-painted brow stripe
    glow(c, "#ffb050", [1.6, 0.7, 0.15]); for (const s of [-1, 1]) BX(c, h[0] + s * 0.12 - 0.03, h[1] + 0.03, h[2] + 0.2 * f - 0.03, h[0] + s * 0.12 + 0.03, h[1] + 0.08, h[2] + 0.2 * f + 0.03); // amber eyes
    flatc(c, BONE); for (const s of [-1, 1]) for (const k of [0.4, 0.5]) { const tz = h[2] + k * f; c.tri(h[0] + s * 0.08, h[1] - 0.11, tz, h[0] + s * 0.08 + 0.02, h[1] - 0.11, tz + 0.03 * f, h[0] + s * 0.08, h[1] - 0.2, tz); } }
}
function SHIELD(c, x, y, z, nx, s, D) { // round shield on a wall, facing along x (nx = ±1)
  const cols = [[OCHRE, "#1d1a17"], ["#c9a45a", "#2f3d52"], ["#4f6b4a", "#d9cba6"]][s % 3];
  for (let q = 0; q < 4; q++) { flatc(c, cols[q % 2]); const a0 = q * Math.PI / 2, n = 4;
    for (let k = 0; k < n; k++) { const a = a0 + k / n * Math.PI / 2, b = a0 + (k + 1) / n * Math.PI / 2;
      c.tri(x + nx * 0.06, y, z, x + nx * 0.03, y + Math.sin(a) * 0.42, z + Math.cos(a) * 0.42, x + nx * 0.03, y + Math.sin(b) * 0.42, z + Math.cos(b) * 0.42);
      c.tri(x + nx * 0.06, y, z, x + nx * 0.03, y + Math.sin(b) * 0.42, z + Math.cos(b) * 0.42, x + nx * 0.03, y + Math.sin(a) * 0.42, z + Math.cos(a) * 0.42); } }
  paint(c, IR, IRONC); LA(c, x + nx * 0.03, y, z, [[0.12, 0], [0.08, 0.08 * nx], [0, 0.1 * nx]].map(([r, h]) => [r, h]), 8, true, "x");
  if (D <= 2) TORUS(c, x + nx * 0.035, y, z, 0.42, 0.022, 14, 4, "x");
}
function BED(c, x, z, w, big, D) { // head against the north wall (−z), foot toward +z
  const L = 2.1, y = PY, z0 = z - L / 2, z1 = z + L / 2, x0 = x - w / 2, x1 = x + w / 2;
  paint(c, TAR, TARC); BX(c, x0, y, z0, x1, y + 0.42, z0 + 0.12); BX(c, x0, y, z1 - 0.1, x1, y + 0.55, z1);                // head/foot boards
  BX(c, x0, y + 0.12, z0, x0 + 0.1, y + 0.42, z1); BX(c, x1 - 0.1, y + 0.12, z0, x1, y + 0.42, z1);
  for (const [px, pz] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) BX(c, px - 0.06, y, pz - 0.06, px + 0.06, y + (pz === z0 ? 1.9 : 0.75), pz + 0.06);
  BX(c, x0 - 0.06, y + 1.82, z0 - 0.06, x1 + 0.06, y + 1.94, z0 + 0.5);                                                    // canopy shelf
  paint(c, HAY, WOOD); BX(c, x0 + 0.1, y + 0.3, z0 + 0.12, x1 - 0.1, y + 0.5, z1 - 0.1);                                  // straw mattress
  paint(c, WOOL, "oklch(0.92 0.03 40)"); BX(c, x0 + 0.06, y + 0.5, z0 + 0.75, x1 - 0.06, y + 0.58, z1 - 0.08);            // wool blanket
  BX(c, x0 + 0.04, y + 0.3, z0 + 0.75, x0 + 0.1, y + 0.58, z1 - 0.1); BX(c, x1 - 0.1, y + 0.3, z0 + 0.75, x1 - 0.04, y + 0.58, z1 - 0.1); // its fall
  paint(c, "cdn/texture-canvas-weathered.png", "oklch(0.96 0.02 85)"); RB(c, x, y + 0.6, z0 + 0.4, w - 0.4, 0.14, 0.42, 0, 4, 0); // pillow
  if (big) { paint(c, FUR, "oklch(0.95 0.01 70)"); RB(c, x, y + 0.62, z + 0.45, w + 0.1, 0.06, 1.0, 0, 0, 0); }
  paint(c, OAK, WOOD); BX(c, x - 0.4, y, z1 + 0.08, x + 0.4, y + 0.45, z1 + 0.56); paint(c, IR, IRONC); BX(c, x - 0.42, y + 0.2, z1 + 0.06, x + 0.42, y + 0.25, z1 + 0.58); // chest
}
function geo(c) {
  const D = c.lod;
  // ---- plinth, steps
  paint(c, BAS, BASC); BX(c, -WX - 0.4, -0.6, -WZ - 0.4, WX + 0.4, PY, WZ + 0.4);
  if (D <= 2) { paint(c, BAS, "oklch(0.7 0.01 260)"); BX(c, -WX - 0.5, PY - 0.14, -WZ - 0.5, WX + 0.5, PY + 0.02, WZ + 0.5); } // coping
  paint(c, BAS, BASC); for (let k = 1; k <= 4; k++) BX(c, -1.8, -0.4, WZ + 0.4 + 0.28 * (k - 1), 1.8, PY - 0.18 * k, WZ + 0.4 + 0.28 * k);
  // ---- floor: flagged aisle, plank platforms
  paint(c, FLAGS, "oklch(0.75 0.01 250)"); BX(c, -IX, PY - 0.02, -IZ, IX, PY + 0.01, IZ);
  // ---- walls: a basalt course, tarred staves above
  const wall = (x0, z0, x1, z1) => { paint(c, BAS, BASC); BX(c, x0, PY, z0, x1, PY + 1.4, z1); paint(c, TAR, TARC); BX(c, x0, PY + 1.4, z0, x1, WTOP, z1); };
  for (const s of [-1, 1]) wall(s * IX, -WZ, s * WX, WZ);
  wall(-IX, -WZ, IX, -IZ); wall(-IX, IZ, -0.7, WZ); wall(0.7, IZ, IX, WZ); paint(c, TAR, TARC); BX(c, -0.7, PY + 2.45, IZ, 0.7, WTOP, WZ);
  for (const z of [-WZ, IZ]) PRISM(c, [[-WX, WTOP], [WX, WTOP], [0, YR - 0.05]], z, z + 0.6);                              // gables
  if (D <= 2) { paint(c, TAR, "oklch(0.7 0.01 60)"); for (const s of [-1, 1]) for (let z = -WZ + 0.25; z < WZ; z += 0.55) BX(c, s * WX, PY + 1.4, z - 0.06, s * (WX + 0.06), WTOP - 0.1, z + 0.06); // battens
    paint(c, BAS, "oklch(0.7 0.01 260)"); for (const s of [-1, 1]) BX(c, s * (WX - 0.05), PY + 1.35, -WZ, s * (WX + 0.08), PY + 1.5, WZ); }
  paint(c, TAR, TARC); for (const [x, z] of [[-WX, -WZ], [WX, -WZ], [-WX, WZ], [WX, WZ]]) BX(c, x - 0.25, PY, z - 0.25, x + 0.25, WTOP + 0.2, z + 0.25); // corner posts
  // ---- door: carved frame, two leaves swung in
  paint(c, TAR, TARC); for (const s of [-1, 1]) BX(c, s * 0.7, PY, WZ - 0.05, s * 0.95, PY + 2.7, WZ + 0.18); BX(c, -1.1, PY + 2.45, WZ - 0.05, 1.1, PY + 2.85, WZ + 0.22);
  flatc(c, OCHRE); for (const s of [-1, 1]) for (let k = 0; k < 4; k++) BX(c, s * 0.7 - 0.01, PY + 0.5 + k * 0.55, WZ + 0.17, s * 0.95 + 0.01, PY + 0.6 + k * 0.55, WZ + 0.2);
  paint(c, OAK, "oklch(0.6 0.02 60)"); for (const s of [-1, 1]) { RB(c, s * 0.68, PY + 1.2, IZ - 0.36, 0.08, 2.4, 0.7, s * 90 - s * 90, 0, 0); }
  paint(c, IR, IRONC); for (const s of [-1, 1]) for (const y of [0.4, 1.9]) BX(c, s * 0.72 - 0.05, PY + y, IZ - 0.72, s * 0.72 + 0.05, PY + y + 0.06, IZ - 0.02);
  // porch posts with serpent-wolf heads flanking the steps
  for (const s of [-1, 1]) { paint(c, TAR, TARC); BX(c, s * 2.0 - 0.18, 0, WZ + 0.9, s * 2.0 + 0.18, PY + 2.6, WZ + 1.26); HEAD(c, s * 2.0, PY + 2.6, WZ + 1.08, 1, s * 0.5, D); }
  // ---- roof: turf slabs, snow over them, a smoke louvre, crossed gable boards
  const RZ = WZ + 1.1;
  // the underside first: a smoke-blackened plank lining just under the turf, so the hall's ceiling is boards, not sod
  for (const s of [-1, 1]) { paint(c, TAR, "oklch(0.42 0.02 60)"); SLAB(c, [s * EX, YE - 0.08, -RZ], [0, YR - 0.08, -RZ], [0, YR - 0.08, RZ], [s * EX, YE - 0.08, RZ], 0.06); }
  for (const s of [-1, 1]) { paint(c, TURF, "oklch(0.8 0.03 120)"); SLAB(c, [s * EX, YE, -RZ], [0, YR, -RZ], [0, YR, RZ], [s * EX, YE, RZ], 0.45);
    paint(c, SNOW, SNOWC); SLAB(c, [s * (EX - 0.35), YE + 0.45 + 0.26, -RZ + 0.25], [0, YR + 0.43, -RZ + 0.25], [0, YR + 0.43, RZ - 0.25], [s * (EX - 0.35), YE + 0.45 + 0.26, RZ - 0.25], 0.32);
  }
  if (D <= 2) { paint(c, SNOW, SNOWC); for (const s of [-1, 1]) RB(c, s * (EX - 0.3), YE + 0.82, 0, 0.5, 0.4, 2 * RZ - 0.5, 0, 0, s * 20); RB(c, 0, YR + 0.8, 0, 0.9, 0.35, 2 * RZ - 0.4, 0, 0, 0); }
  paint(c, TAR, TARC); BX(c, -0.9, YR + 0.5, -1.0, 0.9, YR + 1.3, 3.0); paint(c, TURF, "oklch(0.8 0.03 120)"); for (const s of [-1, 1]) RB(c, s * 0.62, YR + 1.5, 1.0, 1.4, 0.16, 4.6, 0, 0, s * 26); // louvre
  paint(c, SNOW, SNOWC); for (const s of [-1, 1]) RB(c, s * 0.62, YR + 1.62, 1.0, 1.3, 0.1, 4.4, 0, 0, s * 26);
  for (const f of [-1, 1]) { const z = f * (RZ - 0.05); paint(c, TAR, TARC);
    for (const s of [-1, 1]) { SEG(c, [s * EX, YE + 0.2, z], [-s * 0.95, YR + 1.25, z], 0.28, 0.12);
      if (D <= 2) { flatc(c, OCHRE); for (let k = 1; k < 6; k++) { const t = k / 6.5, p = [s * EX + (-s * 0.95 - s * EX) * t, YE + 0.2 + (YR + 1.05 - YE) * t, z]; RB(c, p[0], p[1] + 0.07, p[2] + f * 0.07, 0.18, 0.05, 0.02, 0, 0, 0); } } }
    HEAD(c, -0.95, YR + 1.2, z, f, -0.7, D); HEAD(c, 0.95, YR + 1.2, z, f, 0.7, D); }
  // icicles on the eaves
  if (D <= 2) { flatc(c, "oklch(0.93 0.035 225)"); for (const s of [-1, 1]) for (let k = 0; k < 44; k++) { if (hh(k, s) > 0.6) continue; const z = -RZ + 0.4 + k * (2 * RZ - 0.8) / 44, x = s * (EX - 0.05), L = 0.2 + 0.7 * hh(k, 3, s);
    c.tri(x, YE + 0.05, z - 0.05, x, YE + 0.05, z + 0.05, x, YE + 0.05 - L, z); c.tri(x, YE + 0.05, z + 0.05, x, YE + 0.05, z - 0.05, x, YE + 0.05 - L, z); } }
  // snow drifts banked on the plinth (critic r8: tilted boxes read as concrete barriers; now low noisy half-ellipsoid mounds)
  if (D <= 3) { paint(c, SNOW, SNOWC); for (let k = 0; k < 10; k++) { const s = k % 2 ? 1 : -1, z = -14 + (k >> 1) * 6.5 + hh(k, 7) * 2; MOUND(c, s * (WX + 0.9), 0.0, z + 0.5, 1.1 + hh(k, 9) * 0.4, 1.6 + hh(k, 8) * 1.2, 0.45 + hh(k, 10) * 0.25, k, D); } }
  if (D >= 4) return;
  // ---- interior frame: posts, tie beams, rafters, ridge beam
  paint(c, TAR, "oklch(0.75 0.01 60)");
  for (let z = -7; z <= 13; z += 4) for (const s of [-1, 1]) { BX(c, s * 2.8 - 0.18, PY, z - 0.18, s * 2.8 + 0.18, ry(2.8) - 0.1, z + 0.18); }
  for (let z = -7; z <= 13; z += 4) BX(c, -IX, 5.0, z - 0.14, IX, 5.28, z + 0.14);
  if (D <= 2) { for (let z = -IZ + 0.5; z < IZ; z += 1.6) for (const s of [-1, 1]) SEG(c, [s * IX, ry(IX) - 0.12, z], [0, YR - 0.12, z], 0.16, 0.14);
    BX(c, -0.15, YR - 0.4, -IZ, 0.15, YR - 0.05, IZ); for (const s of [-1, 1]) BX(c, s * IX - 0.3 * s, WTOP - 0.05, -IZ, s * IX, WTOP + 0.4, IZ); }
  // ---- partition between the great hall and the jarl's hold, door at x 3.2..4.6
  paint(c, TAR, TARC); BX(c, -IX, PY, PZ - 0.15, 3.2, 5.0, PZ + 0.15); BX(c, 4.6, PY, PZ - 0.15, IX, 5.0, PZ + 0.15); BX(c, 3.2, PY + 2.45, PZ - 0.15, 4.6, 5.0, PZ + 0.15);
  PRISM(c, [[-IX, 5.0], [IX, 5.0], [0, YR - 0.15]], PZ - 0.15, PZ + 0.15);
  if (D <= 2) { for (const s of [3.05, 4.75]) BX(c, s - 0.15, PY, PZ - 0.22, s + 0.15, PY + 2.6, PZ + 0.22); BX(c, 2.9, PY + 2.45, PZ - 0.22, 4.9, PY + 2.7, PZ + 0.22); }
  // ---- fire trench: basalt kerb, coal bed, split logs
  paint(c, BAS, BASC); for (const s of [-1, 1]) BX(c, s * 0.6, PY, -6, s * 0.9, PY + 0.32, 10); BX(c, -0.9, PY, -6.3, 0.9, PY + 0.32, -6); BX(c, -0.9, PY, 10, 0.9, PY + 0.32, 10.3);
  glow(c, "#3a1408", [0.9, 0.25, 0.05]); BX(c, -0.6, PY, -6, 0.6, PY + 0.12, 10);
  if (D <= 2) { for (let k = 0; k < 14; k++) { const z = -5.2 + k * 1.1 + hh(k, 2) * 0.4; paint(c, OAK, "oklch(0.35 0.02 50)"); RB(c, (hh(k, 3) - 0.5) * 0.5, PY + 0.2, z, 0.16, 0.16, 0.9, (hh(k, 4) - 0.5) * 120, 0, 0);
    glow(c, "#ff7a20", [2.0, 0.6, 0.1]); RB(c, (hh(k, 5) - 0.5) * 0.6, PY + 0.14, z + 0.4, 0.14, 0.06, 0.14, k * 30, 0, 0); } }
  // cauldron on a tripod over the north end of the trench
  paint(c, IR, "oklch(0.6 0.005 250)"); for (let k = 0; k < 3; k++) { const a = k * 2.094; SEG(c, [Math.cos(a) * 0.9, PY + 0.3, -4.6 + Math.sin(a) * 0.9], [0, PY + 2.2, -4.6], 0.06); }
  LA(c, 0, PY + 0.75, -4.6, [[0.05, 0], [0.32, 0.08], [0.38, 0.3], [0.34, 0.5]], 10, false); if (D <= 2) ROPE(c, [0, PY + 2.2, -4.6], [0, PY + 1.25, -4.6], 0, 0.015, 2);
  // ---- sleeping platforms with furs along both walls; trestle tables before them
  for (const s of [-1, 1]) { paint(c, OAK, "oklch(0.55 0.02 55)"); BX(c, s * 4.4, PY, -8.6, s * IX, PY + 0.4, 14.6);
    paint(c, OAK, "oklch(0.45 0.02 55)"); BX(c, s * 4.36, PY, -8.6, s * 4.44, PY + 0.44, 14.6);
    for (let k = 0; k < 8; k++) { const z = -7.8 + k * 2.8 + hh(k, s) * 0.5; paint(c, FUR, ["oklch(0.95 0.01 70)", "oklch(0.75 0.03 60)", "oklch(0.55 0.04 50)"][k % 3]); RB(c, s * 5.0, PY + 0.43, z, 1.25, 0.05, 1.5 + hh(k, 9) * 0.5, (hh(k, 6) - 0.5) * 12, 0, s * -3); }
    for (const [z0, z1] of [[-5.5, 0.5], [1.5, 7.5], [8.5, 13.5]]) { paint(c, OAK, WOOD); BX(c, s * 3.3, PY + 0.7, z0, s * 4.2, PY + 0.78, z1);
      paint(c, OAK, "oklch(0.6 0.02 55)"); for (const z of [z0 + 0.4, z1 - 0.4]) { BX(c, s * 3.4, PY, z - 0.05, s * 4.1, PY + 0.7, z + 0.05); } BX(c, s * 3.7, PY + 0.25, z0 + 0.4, s * 3.8, PY + 0.33, z1 - 0.4);
      if (D <= 2) for (let k = 0; k < 4; k++) { const z = z0 + 0.8 + k * (z1 - z0 - 1.6) / 3; if (k % 2) { paint(c, OAK, "oklch(0.7 0.03 60)"); LA(c, s * 3.7, PY + 0.78, z, [[0.1, 0], [0.13, 0.06]], 8, true); }
        else { flatc(c, BONE); PIPE(c, [s * 3.6, PY + 0.82, z], [s * 3.85, PY + 0.95, z + 0.2], 0.05, 0.015, 6); } } } }
  // shields and weapon racks on the long walls, red banners on the tie beams
  if (D <= 2) { for (const s of [-1, 1]) for (let k = 0; k < 7; k++) SHIELD(c, s * (IX - 0.04), PY + 2.0, -6.8 + k * 3.2, -s, k + (s > 0 ? 1 : 0), D);
    paint(c, RED, "oklch(0.9 0.03 30)"); for (const z of [-7, 1, 9]) { BX(c, -1.5, 3.2, z - 0.02, -0.7, 5.0, z + 0.02); BX(c, 0.7, 3.2, z - 0.02, 1.5, 5.0, z + 0.02); }
    glow(c, "#e0c070", [0.0, 0.0, 0.0]); flatc(c, "#c9a45a"); for (const z of [-7, 1, 9]) for (const x of [-1.1, 1.1]) { c.tri(x - 0.4, 3.2, z + 0.025, x, 2.85, z + 0.025, x + 0.4, 3.2, z + 0.025); c.tri(x + 0.4, 3.2, z - 0.025, x, 2.85, z - 0.025, x - 0.4, 3.2, z - 0.025); } }
  // ---- the high seat on its dais
  paint(c, OAK, "oklch(0.5 0.02 55)"); BX(c, -2.4, PY, PZ + 0.15, 2.4, PY + 0.36, -7.15); BX(c, -2.4, PY, -7.15, 2.4, PY + 0.18, -6.85);
  paint(c, FUR, "oklch(0.75 0.02 60)"); RB(c, 0, PY + 0.38, -7.8, 3.6, 0.04, 1.2, 0, 0, 0);
  paint(c, TAR, TARC); BX(c, -0.8, PY + 0.36, -8.75, 0.8, PY + 0.86, -7.95); BX(c, -0.8, PY + 0.86, -8.75, 0.8, PY + 2.9, -8.55);
  for (const s of [-1, 1]) { BX(c, s * 0.8 - 0.1, PY + 0.36, -8.75, s * 0.8 + 0.1, PY + 1.25, -7.9); BX(c, s * 0.95 - 0.13, PY + 0.36, -8.8, s * 0.95 + 0.13, PY + 3.1, -8.5); HEAD(c, s * 0.95, PY + 3.1, -8.65, 1, s * 0.25, D); }
  paint(c, FUR, "oklch(0.95 0.01 70)"); RB(c, 0, PY + 0.9, -8.35, 1.5, 0.05, 0.85, 0, 0, 0); RB(c, 0, PY + 1.8, -8.52, 1.5, 1.6, 0.05, 0, 0, 0);
  if (D <= 2) { flatc(c, OCHRE); BX(c, -0.5, PY + 2.2, -8.53, 0.5, PY + 2.7, -8.5); paint(c, RED, "oklch(0.9 0.03 30)"); BX(c, -1.6, 3.4, PZ + 0.16, -1.25, 7.0, PZ + 0.2); BX(c, 1.25, 3.4, PZ + 0.16, 1.6, 7.0, PZ + 0.2);
    SHIELD(c, -2.6, 3.6, PZ + 0.2, 1, 0, D); }
  // ---- the jarl's hold: three box-beds against the north wall, a rack, a chest
  BED(c, -4.2, -IZ + 1.15, 1.2, false, D); BED(c, -1.9, -IZ + 1.15, 1.2, false, D); BED(c, 0.8, -IZ + 1.15, 1.9, true, D);
  paint(c, FUR, "oklch(0.7 0.03 55)"); RB(c, -1.0, PY + 0.03, -11.3, 3.2, 0.04, 2.0, 8, 0, 0);
  paint(c, OAK, WOOD); BX(c, IX - 0.5, PY, -14.6, IX - 0.1, PY + 1.6, -11.2); paint(c, IR, IRONC);
  if (D <= 2) for (let k = 0; k < 4; k++) { const z = -14.2 + k * 0.85; SEG(c, [IX - 0.35, PY + 0.2, z], [IX - 0.3, PY + 1.9, z], 0.04); BX(c, IX - 0.4, PY + 1.55, z - 0.12, IX - 0.25, PY + 1.6, z + 0.12); }
  SHIELD(c, -IX + 0.04, PY + 2.0, -12.2, 1, 1, D);
}
export function geometry(c) { geo(c); }
export function collider(c) {
  const b = CB();
  b(-WX - 0.4, -0.6, -WZ - 0.4, WX + 0.4, PY, WZ + 0.4);
  for (let k = 1; k <= 4; k++) b(-1.8, -0.4, WZ + 0.4 + 0.28 * (k - 1), 1.8, PY - 0.18 * k, WZ + 0.4 + 0.28 * k);
  for (const s of [-1, 1]) b(s * IX, PY, -WZ, s * WX, 5.4, WZ);
  b(-IX, PY, -WZ, IX, 5.4, -IZ); b(-IX, PY, IZ, -0.7, 5.4, WZ); b(0.7, PY, IZ, IX, 5.4, WZ); b(-0.7, PY + 2.45, IZ, 0.7, 5.4, WZ);
  b(-IX, PY, PZ - 0.15, 3.2, 6, PZ + 0.15); b(4.6, PY, PZ - 0.15, IX, 6, PZ + 0.15); b(3.2, PY + 2.45, PZ - 0.15, 4.6, 6, PZ + 0.15);
  b(-0.9, PY, -6.3, 0.9, PY + 0.7, 10.3);
  for (const s of [-1, 1]) { b(s * 4.4, PY, -8.6, s * IX, PY + 0.4, 14.6); for (const [z0, z1] of [[-5.5, 0.5], [1.5, 7.5], [8.5, 13.5]]) b(s * 3.3, PY, z0, s * 4.2, PY + 0.78, z1);
    for (let z = -7; z <= 13; z += 4) b(s * 2.8 - 0.18, PY, z - 0.18, s * 2.8 + 0.18, 5, z + 0.18); b(s * 2.0 - 0.18, 0, WZ + 0.9, s * 2.0 + 0.18, PY + 2.6, WZ + 1.26); }
  b(-2.4, PY, PZ + 0.15, 2.4, PY + 0.36, -7.15); b(-2.4, PY, -7.15, 2.4, PY + 0.18, -6.85); b(-0.9, PY + 0.36, -8.8, 0.9, PY + 2.9, -7.95);
  for (const [x, w] of [[-4.2, 1.2], [-1.9, 1.2], [0.8, 1.9]]) b(x - w / 2, PY, -IZ, x + w / 2, PY + 0.55, -IZ + 2.3);
  b(IX - 0.5, PY, -14.6, IX - 0.1, PY + 1.6, -11.2);
  return b.list;
}

// MOUND: a low snow drift, a noisy half-ellipsoid (rx across, rz along, h tall) at (x, y, z); its rim sinks 0.15 m so it feathers into the ground
function MOUND(c, x, y, z, rx, rz, h, seed, D) {
  const na = D <= 2 ? 12 : 8, nr = D <= 2 ? 3 : 2, r = (i) => 0.82 + 0.18 * Math.abs(Math.sin(i * 2.17 + seed * 1.37));
  const P = (i, j) => { const a = (i % na) / na * 6.2832, t = j / nr, k = r(i % na) * Math.cos(t * 1.5708);
    return [x + Math.cos(a) * rx * k, y - 0.15 + (h + 0.15) * Math.sin(t * 1.5708), z + Math.sin(a) * rz * k]; };
  for (let i = 0; i < na; i++) for (let j = 0; j < nr; j++) { const A = P(i, j), B = P(i + 1, j), C = P(i + 1, j + 1), E = P(i, j + 1);
    c.tri(...A, ...C, ...B); if (j < nr - 1) c.tri(...A, ...E, ...C); }
}
