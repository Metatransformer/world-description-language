// GULLHAVEN's HARBOURMASTER'S HALL: a tall driftwood hall standing on tarred piles over the strand, a steep roof of
// salt-bleached shingles, a lookout lantern tower on its own legs off the north-east corner, nets and buoys everywhere.
// Local origin = centre of the footprint on the ground; long axis Z, door in the south gable (+Z) on a railed porch,
// stairs and a rope-railed boardwalk running south from it. Deck (floor) at DY.
// Inside: the CHART ROOM (map table, benches, nets, oars, a figurehead) and behind its partition the COUNTING ROOM
// (east: desk, ledger shelves, strongbox, scales) and the CREW LOFT (west: three hammocks, sea chests).
import { paint, flatc, glow, BX, RB, LA, HX, SEG, PIPE, ROPE, TORUS, CB, OAK, TAR, IR, NET, CANVAS, WOOD, TARC, IRONC, DRIFT, DRIFTC } from "../lib/buildkit.js";
const SHG = "cdn/texture-salt-bleached-cedar-shingles.png", CHART = "cdn/texture-antique-nautical-sea-chart.png", WOOL = "cdn/texture-rust-red-wool-cloth.png";
const GREY = "oklch(0.86 0.012 230)", PALE = "oklch(0.95 0.01 90)", WEED = "#34452e", ROPEC = "#a08a62", RED = "#a8452e", BRASS = "#c9a45a";
export const DY = 2.6, WX = 7, WZ0 = -9, WZ1 = 7, T = 0.25, IX = WX - T, IZ0 = WZ0 + T, IZ1 = WZ1 - T, WT = DY + 4.85, EX = 7.8, YE = DY + 4.2, YR = DY + 10;
export const PZ = -1.5, CEIL = DY + 3.4, DOORS = [[-3.9, -2.6], [2.6, 3.9]], NSTEP = 13, SR = (DY - 0.3) / NSTEP, ST = 0.28;
const PZ1 = 10.4, BW0 = PZ1 + NSTEP * ST, BW1 = BW0 + 9; // porch front edge, stairs foot, boardwalk end
const ry = (x) => YR - (YR - YE) * Math.abs(x) / EX;
const hh = (a, b = 0, s = 0) => { const v = Math.sin(a * 127.1 + b * 311.7 + s * 74.7) * 43758.5453; return v - Math.floor(v); };
function SLAB(c, a, b, d, e, t) { const up = (p) => [p[0], p[1] + t, p[2]]; HX(c, [a, b, d, e, up(a), up(b), up(d), up(e)]); }
function PRISM(c, pts, z0, z1) { const n = pts.length;
  for (let i = 1; i < n - 1; i++) { c.tri(pts[0][0], pts[0][1], z1, pts[i][0], pts[i][1], z1, pts[i + 1][0], pts[i + 1][1], z1); c.tri(pts[0][0], pts[0][1], z0, pts[i + 1][0], pts[i + 1][1], z0, pts[i][0], pts[i][1], z0); }
  for (let i = 0; i < n; i++) { const p = pts[i], q = pts[(i + 1) % n]; c.quad(p[0], p[1], z0, q[0], q[1], z0, q[0], q[1], z1, p[0], p[1], z1); } }
// a fishing buoy: banded float, hung on a rope from (x, y) top
function BUOY(c, x, y, z, r, k) { flatc(c, ROPEC); PIPE(c, [x, y, z], [x, y - 0.4, z], 0.015, 0.015, 4);
  const cols = [[RED, PALE], [PALE, "#2f3d52"], ["#c9a45a", RED]][k % 3];
  flatc(c, cols[0]); LA(c, x, y - 0.4 - 2 * r, z, [[0.02, 0], [r * 0.7, r * 0.3], [r, r * 0.8]], 10, true);
  flatc(c, cols[1]); LA(c, x, y - 0.4 - 1.2 * r, z, [[r, 0], [r, r * 0.5]], 10, false);
  flatc(c, cols[0]); LA(c, x, y - 0.4 - 0.7 * r, z, [[r, 0], [r * 0.6, r * 0.5], [0.02, r * 0.7]], 10, true); }
// a draped net: a sagging sheet between two hooks, hanging dy
function NETS(c, a, b, dy, n = 6) { paint(c, NET, "oklch(0.92 0.02 80)", 0.9); const rows = [];
  for (let j = 0; j <= 3; j++) { const r = []; for (let i = 0; i <= n; i++) { const t = i / n, s = Math.sin(t * Math.PI) * (0.25 + j * 0.12);
    r.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - j * dy / 3 - s, a[2] + (b[2] - a[2]) * t]); } rows.push(r); }
  for (let j = 0; j < 3; j++) for (let i = 0; i < n; i++) { c.quad(...rows[j][i], ...rows[j + 1][i], ...rows[j + 1][i + 1], ...rows[j][i + 1]); c.quad(...rows[j][i + 1], ...rows[j + 1][i + 1], ...rows[j + 1][i], ...rows[j][i]); } }
// a hammock slung along x from x0 to x1 at height y, centred on z
function HAMMOCK(c, x0, x1, y, z, D) { const L = x1 - x0, m = 8, w = 0.45, sag = 0.42, pts = [];
  for (let i = 0; i <= m; i++) { const t = i / m; pts.push([x0 + 0.5 + (L - 1) * t, y - sag * 4 * t * (1 - t)]); }
  paint(c, CANVAS, "oklch(0.95 0.025 85)"); for (let i = 0; i < m; i++) { const [xa, ya] = pts[i], [xb, yb] = pts[i + 1];
    c.quad(xa, ya, z - w, xa, ya, z + w, xb, yb, z + w, xb, yb, z - w); c.quad(xa, ya - 0.03, z - w, xb, yb - 0.03, z - w, xb, yb - 0.03, z + w, xa, ya - 0.03, z + w);
    for (const s of [-1, 1]) c.quad(xa, ya, z + s * w, xb, yb, z + s * w, xb, yb + 0.12, z + s * (w + 0.04), xa, ya + 0.12, z + s * (w + 0.04)); }
  paint(c, WOOL, "oklch(0.9 0.03 40)"); for (let i = 2; i < m - 1; i++) { const [xa, ya] = pts[i], [xb, yb] = pts[i + 1]; c.quad(xa, ya + 0.04, z - w + 0.04, xa, ya + 0.04, z + w - 0.04, xb, yb + 0.04, z + w - 0.04, xb, yb + 0.04, z - w + 0.04); }
  paint(c, CANVAS, "oklch(0.98 0.02 85)"); RB(c, pts[1][0] + 0.15, pts[1][1] + 0.1, z, 0.35, 0.12, 0.6, 0, 0, -12); // pillow
  flatc(c, ROPEC); for (const [xe, xs] of [[x0, pts[0][0]], [x1, pts[m][0]]]) for (const s of [-1, 0, 1]) PIPE(c, [xe, y + 0.25, z], [xs, pts[0][1] + 0.02, z + s * w], 0.012, 0.012, 4);
  paint(c, IR, IRONC); for (const xe of [x0, x1]) TORUS(c, xe, y + 0.25, z, 0.05, 0.012, 8, 4, "z");
}
function CHEST(c, x, z, rot) { const y = DY; paint(c, OAK, WOOD); if (rot) { BX(c, x - 0.3, y, z - 0.45, x + 0.3, y + 0.45, z + 0.45); paint(c, IR, IRONC); for (const k of [-0.3, 0.3]) BX(c, x - 0.32, y, z + k - 0.03, x + 0.32, y + 0.47, z + k + 0.03); }
  else { BX(c, x - 0.45, y, z - 0.3, x + 0.45, y + 0.45, z + 0.3); paint(c, IR, IRONC); for (const k of [-0.3, 0.3]) BX(c, x + k - 0.03, y, z - 0.32, x + k + 0.03, y + 0.47, z + 0.32); } }
function LANTERN(c, x, y, z, D) { paint(c, IR, IRONC); BX(c, x - 0.13, y, z - 0.13, x + 0.13, y + 0.04, z + 0.13); BX(c, x - 0.15, y + 0.34, z - 0.15, x + 0.15, y + 0.38, z + 0.15);
  LA(c, x, y + 0.38, z, [[0.15, 0], [0.02, 0.14]], 4, true, "y", false); for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) BX(c, x + a * 0.13 - 0.015, y, z + b * 0.13 - 0.015, x + a * 0.13 + 0.015, y + 0.36, z + b * 0.13 + 0.015);
  glow(c, "#ffcf80", [2.2, 1.3, 0.45]); BX(c, x - 0.1, y + 0.04, z - 0.1, x + 0.1, y + 0.32, z + 0.1); }
function WINDOW(c, x, y, z, s) { // a shuttered window in a side wall facing s (+1 = +x)
  paint(c, DRIFT, "oklch(0.75 0.015 70)"); BX(c, x - 0.06 * s, y - 0.1, z - 0.6, x + 0.2 * s, y, z + 0.6); BX(c, x + 0.02 * s, y + 1.1, z - 0.6, x + 0.16 * s, y + 1.2, z + 0.6);
  for (const k of [-1, 1]) BX(c, x + 0.02 * s, y, z + k * 0.5, x + 0.14 * s, y + 1.1, z + k * 0.5 + k * 0.08);
  glow(c, "#4a3a22", [1.1, 0.7, 0.3]); BX(c, x + 0.01 * s, y, z - 0.5, x + 0.03 * s, y + 1.1, z + 0.5); BX(c, x - T - 0.03 * s, y, z - 0.5, x - T - 0.01 * s, y + 1.1, z + 0.5);
  flatc(c, "#2a2620"); BX(c, x + 0.035 * s, y + 0.53, z - 0.5, x + 0.05 * s, y + 0.57, z + 0.5); BX(c, x + 0.035 * s, y, z - 0.02, x + 0.05 * s, y + 1.1, z + 0.02);
  paint(c, DRIFT, "oklch(0.8 0.03 210)"); for (const k of [-1, 1]) RB(c, x + 0.45 * s, y + 0.55, z + k * 0.95, 0.06, 1.15, 0.5, k * s * 60, 0, 0); } // shutters, swung open
function geo(c) {
  const D = c.lod;
  // ---- piles: tarred posts, weed-dark feet, X braces
  const PX = [-7.6, -2.6, 2.6, 7.6], PZS = [-9.4, -4.6, 0.2, 5, 10];
  for (const x of PX) for (const z of PZS) { paint(c, TAR, TARC); PIPE(c, [x, -0.6, z], [x, DY - 0.2, z], 0.2, 0.17, 8); if (D <= 2) { flatc(c, WEED); PIPE(c, [x, -0.6, z], [x, 0.55, z], 0.215, 0.205, 8); } }
  if (D <= 2) { paint(c, TAR, TARC); for (const x of [-7.6, 7.6]) for (let i = 0; i < PZS.length - 1; i++) { SEG(c, [x, 0.4, PZS[i]], [x, DY - 0.35, PZS[i + 1]], 0.1, 0.18); SEG(c, [x, DY - 0.35, PZS[i]], [x, 0.4, PZS[i + 1]], 0.1, 0.18); }
    for (const z of [-9.4, 10]) for (let i = 0; i < 3; i++) SEG(c, [PX[i], 0.4, z], [PX[i + 1], DY - 0.35, z], 0.18, 0.1); }
  paint(c, TAR, TARC); for (const z of PZS) BX(c, -8.0, DY - 0.5, z - 0.17, 8.0, DY - 0.2, z + 0.17);                         // joists
  // ---- deck
  paint(c, DRIFT, DRIFTC); BX(c, -8.2, DY - 0.2, -9.7, 8.2, DY, PZ1);
  if (D <= 2) { flatc(c, "#5a5550"); for (let x = -8; x < 8.2; x += 0.42) BX(c, x - 0.01, DY - 0.005, WZ1, x + 0.01, DY + 0.003, PZ1); }
  paint(c, DRIFT, "oklch(0.8 0.01 70)"); BX(c, -IX, DY - 0.01, IZ0, IX, DY + 0.02, IZ1);                                  // floor boards, darker
  // ---- walls: grey driftwood boards with door hole, cover battens
  const wall = (x0, z0, x1, z1, y1 = WT) => { paint(c, DRIFT, GREY); BX(c, x0, DY, z0, x1, y1, z1); };
  for (const s of [-1, 1]) wall(s * IX, WZ0, s * WX, WZ1);
  wall(-IX, WZ0, IX, IZ0); wall(-IX, IZ1, -0.68, WZ1); wall(0.68, IZ1, IX, WZ1); wall(-0.68, DY + 2.45, IZ1, 0.68, WT, WZ1);
  paint(c, DRIFT, GREY); for (const z of [WZ0, IZ1]) PRISM(c, [[-WX, WT - 0.05], [WX, WT - 0.05], [0, YR - 0.05]], z, z + T);   // gables
  if (D <= 2) { paint(c, DRIFT, "oklch(0.72 0.012 230)"); for (const s of [-1, 1]) for (let z = WZ0 + 0.3; z < WZ1; z += 0.6) BX(c, s * WX, DY, z - 0.04, s * (WX + 0.04), WT - 0.1, z + 0.04);
    for (const z of [WZ0, WZ1]) for (let x = -WX + 0.3; x < WX; x += 0.6) { if (z > 0 && Math.abs(x) < 1.1) continue; const top = Math.min(WT + (YR - WT) * (1 - Math.abs(x) / WX) - 0.2, YR - 0.4); BX(c, x - 0.04, DY, z + (z > 0 ? 0 : -0.04), x + 0.04, top, z + (z > 0 ? 0.04 : 0)); } }
  paint(c, TAR, TARC); for (const [x, z] of [[-WX, WZ0], [WX, WZ0], [-WX, WZ1], [WX, WZ1]]) BX(c, x - 0.18, DY, z - 0.18, x + 0.18, WT + 0.1, z + 0.18); // corner posts
  for (const s of [-1, 1]) for (const z of [-5.4, 3.2]) WINDOW(c, s * WX, DY + 1.2, z, s);
  // door: frame, lintel with painted gull, leaf swung in
  paint(c, OAK, "oklch(0.65 0.02 60)"); for (const s of [-1, 1]) BX(c, s * 0.68, DY, WZ1 - 0.05, s * 0.88, DY + 2.6, WZ1 + 0.14); BX(c, -1.0, DY + 2.45, WZ1 - 0.05, 1.0, DY + 2.75, WZ1 + 0.16);
  paint(c, OAK, "oklch(0.55 0.02 60)"); RB(c, -0.66, DY + 1.2, IZ1 - 0.62, 0.07, 2.4, 1.25, 0, 0, 0);
  paint(c, IR, IRONC); for (const y of [0.4, 1.9]) BX(c, -0.72, DY + y, IZ1 - 1.15, -0.6, DY + y + 0.06, IZ1 - 0.05);
  // the gull figurehead over the door
  flatc(c, PALE); RB(c, 0, DY + 3.15, WZ1 + 0.35, 0.36, 0.3, 0.6, 0, -10, 0); RB(c, 0, DY + 3.4, WZ1 + 0.68, 0.22, 0.22, 0.26, 0, 0, 0);
  for (const s of [-1, 1]) RB(c, s * 0.55, DY + 3.25, WZ1 + 0.28, 0.8, 0.06, 0.34, s * -14, 0, s * -18);
  flatc(c, BRASS); RB(c, 0, DY + 3.37, WZ1 + 0.88, 0.07, 0.07, 0.2, 0, 10, 0); flatc(c, "#1d1a17"); for (const s of [-1, 1]) BX(c, s * 0.11 - 0.02, DY + 3.43, WZ1 + 0.7, s * 0.11 + 0.02, DY + 3.47, WZ1 + 0.76);
  // ---- roof: steep, salt-bleached shingles in courses, a ridge cap
  const RZ0 = WZ0 - 0.9, RZ1 = WZ1 + 1.1;
  for (const s of [-1, 1]) { paint(c, SHG, "oklch(0.95 0.01 90)"); SLAB(c, [s * EX, YE, RZ0], [0, YR, RZ0], [0, YR, RZ1], [s * EX, YE, RZ1], 0.3);
    if (D <= 2) { paint(c, SHG, "oklch(0.8 0.012 90)"); for (let k = 0; k < 15; k++) { const t = k / 15, x = s * EX * (1 - t), y = YE + (YR - YE) * t + 0.3; SEG(c, [x, y, RZ0 - 0.02], [x, y, RZ1 + 0.02], 0.08, 0.06); } } }
  paint(c, TAR, TARC); BX(c, -0.25, YR + 0.15, RZ0 - 0.1, 0.25, YR + 0.45, RZ1 + 0.1);
  for (const z of [RZ0, RZ1]) for (const s of [-1, 1]) SEG(c, [s * EX, YE + 0.05, z], [0, YR + 0.35, z], 0.3, 0.12);         // barge boards
  if (D <= 2) { flatc(c, "oklch(0.97 0.005 90)"); for (let k = 0; k < 10; k++) { const s = k % 2 ? 1 : -1, z = RZ0 + 1 + k * 1.6 + hh(k) * 0.6; RB(c, s * (EX - 1.2 - 2 * hh(k, 2)), YE + 1.2 + 1.5 * hh(k, 3) + 0.34, z, 0.4, 0.02, 0.3, k * 37, 0, 0); } } // gull droppings, honestly
  // ---- porch railing, rope between posts; crab pots, nets, buoys
  paint(c, TAR, TARC); const rail = [[-8.1, WZ1 + 0.2], [-8.1, PZ1 - 0.1], [-1.3, PZ1 - 0.1], null, [1.3, PZ1 - 0.1], [8.1, PZ1 - 0.1], [8.1, WZ1 + 0.2]];
  for (const p of rail) if (p) BX(c, p[0] - 0.09, DY, p[1] - 0.09, p[0] + 0.09, DY + 1.15, p[1] + 0.09);
  for (let i = 0; i < rail.length - 1; i++) { const a = rail[i], b = rail[i + 1]; if (!a || !b) continue; flatc(c, ROPEC);
    ROPE(c, [a[0], DY + 1.05, a[1]], [b[0], DY + 1.05, b[1]], 0.12, 0.025, 6); ROPE(c, [a[0], DY + 0.55, a[1]], [b[0], DY + 0.55, b[1]], 0.1, 0.02, 6); }
  for (const s of [-1, 1]) { paint(c, TAR, TARC); BX(c, s * 4.6 - 0.09, DY, PZ1 - 0.19, s * 4.6 + 0.09, DY + 1.15, PZ1 - 0.01); }
  if (D <= 2) { NETS(c, [-8.1, DY + 1.05, WZ1 + 0.3], [-8.1, DY + 1.05, PZ1 - 0.2], 1.2);  NETS(c, [4.7, DY + 1.05, PZ1], [8.0, DY + 1.05, PZ1], 1.1);
    for (const [x, z, k] of [[5.8, 8.2, 0], [6.6, 9.3, 1], [-6.0, 9.4, 2]]) { paint(c, OAK, "oklch(0.6 0.03 60)"); LA(c, x, DY, z, [[0.38, 0], [0.38, 0.5], [0.2, 0.62]], 8, true, "y", false); paint(c, NET, "oklch(0.8 0.03 80)", 0.9); LA(c, x, DY + 0.03, z, [[0.41, 0], [0.41, 0.52]], 8, false, "y", false); }
    for (let k = 0; k < 7; k++) BUOY(c, -6.5 + k * 2.15, YE - 0.05, WZ1 + 0.9, 0.2 + hh(k, 4) * 0.08, k);
    for (const s of [-1, 1]) for (let k = 0; k < 4; k++) BUOY(c, s * (EX - 0.2), YE - 0.1, -6.5 + k * 3.6, 0.22, k + (s > 0 ? 1 : 0)); }
  LANTERN(c, 1.2, DY + 2.2, WZ1 + 0.3, D); paint(c, IR, IRONC); BX(c, 1.17, DY + 2.58, WZ1 + 0.02, 1.23, DY + 2.64, WZ1 + 0.32);
  // ---- stairs and the rope-railed boardwalk to the strand
  paint(c, DRIFT, DRIFTC); for (let k = 0; k < NSTEP; k++) { const y = DY - (k + 1) * SR, z = PZ1 + k * ST; BX(c, -1.1, Math.max(0, y - 0.25), z, 1.1, y, z + ST); }
  paint(c, TAR, TARC); for (const s of [-1, 1]) SEG(c, [s * 1.15, DY - 0.1, PZ1], [s * 1.15, 0.1, BW0], 0.12, 0.3);
  paint(c, DRIFT, DRIFTC); BX(c, -1.2, 0.08, BW0, 1.2, 0.3, BW1);
  if (D <= 2) { flatc(c, "#5a5550"); for (let z = BW0 + 0.3; z < BW1; z += 0.3) BX(c, -1.21, 0.295, z - 0.01, 1.21, 0.305, z + 0.01); }
  const posts = []; for (const s of [-1, 1]) { posts.push([[s * 1.3, DY, PZ1], [s * 1.3, 0.3, BW0], [s * 1.3, 0.3, BW0 + 3], [s * 1.3, 0.3, BW0 + 6], [s * 1.3, 0.3, BW1]]); }
  for (const row of posts) { paint(c, TAR, TARC); for (const p of row) BX(c, p[0] - 0.08, p[1] - (p[1] > 1 ? 0 : 0.6), p[2] - 0.08, p[0] + 0.08, p[1] + 1.1, p[2] + 0.08);
    flatc(c, ROPEC); for (let i = 0; i < row.length - 1; i++) { const a = row[i], b = row[i + 1]; ROPE(c, [a[0], a[1] + 1.0, a[2]], [b[0], b[1] + 1.0, b[2]], 0.15, 0.025, 6); } }
  // ---- the lookout lantern tower, on its own legs off the north-east corner
  const TX = 10, TZ = -6.4, TH = 15.2, tw = 1.6;
  paint(c, TAR, TARC); for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) PIPE(c, [TX + a * (tw + 0.5), -0.6, TZ + b * (tw + 0.5)], [TX + a * tw, TH, TZ + b * tw], 0.2, 0.16, 8);
  if (D <= 2) for (let k = 0; k < 4; k++) { const y0 = 0.6 + k * 3.4, y1 = y0 + 3.4, f0 = tw + 0.5 - 0.5 * y0 / TH, f1 = tw + 0.5 - 0.5 * y1 / TH;
    for (const [a, b, d, e] of [[-1, -1, 1, -1], [1, -1, 1, 1], [1, 1, -1, 1], [-1, 1, -1, -1]]) SEG(c, [TX + a * f0, y0, TZ + b * f0], [TX + d * f1, y1, TZ + e * f1], 0.1, 0.1); }
  paint(c, DRIFT, GREY); BX(c, TX - tw, TH - 5, TZ - tw, TX + tw, TH, TZ + tw);                                           // the watch room
  paint(c, DRIFT, DRIFTC); BX(c, TX - tw - 0.8, TH, TZ - tw - 0.8, TX + tw + 0.8, TH + 0.2, TZ + tw + 0.8);                 // gallery
  paint(c, TAR, TARC); for (const a of [-1, 1]) for (const b of [-1, 0, 1]) { BX(c, TX + a * (tw + 0.7) - 0.06, TH + 0.2, TZ + b * (tw + 0.7) - 0.06, TX + a * (tw + 0.7) + 0.06, TH + 1.2, TZ + b * (tw + 0.7) + 0.06); BX(c, TX + b * (tw + 0.7) - 0.06, TH + 0.2, TZ + a * (tw + 0.7) - 0.06, TX + b * (tw + 0.7) + 0.06, TH + 1.2, TZ + a * (tw + 0.7) + 0.06); }
  flatc(c, ROPEC); for (const a of [-1, 1]) { ROPE(c, [TX - tw - 0.7, TH + 1.1, TZ + a * (tw + 0.7)], [TX + tw + 0.7, TH + 1.1, TZ + a * (tw + 0.7)], 0.08, 0.025, 4); ROPE(c, [TX + a * (tw + 0.7), TH + 1.1, TZ - tw - 0.7], [TX + a * (tw + 0.7), TH + 1.1, TZ + tw + 0.7], 0.08, 0.025, 4); }
  paint(c, IR, IRONC); for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) BX(c, TX + a * 1.1 - 0.06, TH + 0.2, TZ + b * 1.1 - 0.06, TX + a * 1.1 + 0.06, TH + 2.4, TZ + b * 1.1 + 0.06);
  glow(c, "#ffd890", [3.2, 2.0, 0.7]); BX(c, TX - 1.0, TH + 0.25, TZ - 1.0, TX + 1.0, TH + 2.3, TZ + 1.0);                  // the lantern's glass
  paint(c, SHG, "oklch(0.95 0.01 90)"); HX(c, [[TX - 1.6, TH + 2.4, TZ - 1.6], [TX + 1.6, TH + 2.4, TZ - 1.6], [TX + 1.6, TH + 2.4, TZ + 1.6], [TX - 1.6, TH + 2.4, TZ + 1.6], [TX, TH + 4.4, TZ], [TX, TH + 4.4, TZ], [TX, TH + 4.4, TZ], [TX, TH + 4.4, TZ]]);
  paint(c, IR, IRONC); PIPE(c, [TX, TH + 4.3, TZ], [TX, TH + 5.6, TZ], 0.04, 0.03, 5); flatc(c, BRASS);                // weathervane: a fish, naturally
  RB(c, TX, TH + 5.3, TZ, 0.9, 0.24, 0.05, 0, 0, 0); c.tri(TX + 0.45, TH + 5.3, TZ, TX + 0.75, TH + 5.55, TZ, TX + 0.75, TH + 5.05, TZ); c.tri(TX + 0.45, TH + 5.3, TZ, TX + 0.75, TH + 5.05, TZ, TX + 0.75, TH + 5.55, TZ);
  if (D <= 2) for (const s of [-1, 1]) WINDOW(c, TX + s * tw, TH - 3.2, TZ, s);
  if (D >= 4) return;
  // ---- interior frame: posts, tie beams, rafters
  paint(c, TAR, "oklch(0.8 0.01 60)"); for (const z of [1.6, 4.4]) { BX(c, -IX, WT - 0.4, z - 0.14, IX, WT - 0.1, z + 0.14); for (const s of [-1, 1]) BX(c, s * IX - s * 0.25, DY, z - 0.14, s * IX, WT - 0.1, z + 0.14); }
  if (D <= 2) { for (let z = IZ0 + 0.6; z < IZ1; z += 1.4) for (const s of [-1, 1]) SEG(c, [s * IX, ry(IX) - 0.2, z], [0, YR - 0.2, z], 0.14, 0.14); BX(c, -0.14, YR - 0.5, IZ0, 0.14, YR - 0.15, IZ1); }
  // ---- partition, back rooms' ceiling, the wall between them
  paint(c, DRIFT, "oklch(0.8 0.012 230)"); let x = -IX; for (const [a, b] of DOORS) { BX(c, x, DY, PZ - 0.1, a, CEIL, PZ + 0.1); BX(c, a, DY + 2.4, PZ - 0.1, b, CEIL, PZ + 0.1); x = b; } BX(c, x, DY, PZ - 0.1, IX, CEIL, PZ + 0.1);
  PRISM(c, [[-IX, CEIL], [IX, CEIL], [IX, ry(IX) - 0.1], [0, YR - 0.1], [-IX, ry(IX) - 0.1]], PZ - 0.1, PZ + 0.1);
  BX(c, -0.1, DY, IZ0, 0.1, CEIL, PZ - 0.1);
  paint(c, DRIFT, "oklch(0.7 0.01 70)"); BX(c, -IX, CEIL, IZ0, IX, CEIL + 0.15, PZ - 0.1);
  paint(c, TAR, "oklch(0.8 0.01 60)"); for (const z of [-7.2, -4.6, -2.6]) BX(c, -IX, CEIL - 0.22, z - 0.1, IX, CEIL, z + 0.1);
  paint(c, OAK, "oklch(0.6 0.02 60)"); for (const [a, b] of DOORS) { for (const e of [a, b]) BX(c, e - 0.1, DY, PZ - 0.16, e + 0.1, DY + 2.5, PZ + 0.16); BX(c, a - 0.1, DY + 2.4, PZ - 0.16, b + 0.1, DY + 2.55, PZ + 0.16); }
  // ---- CHART ROOM: the map table, benches, a chart cabinet, nets and oars on the walls, a stove
  const my = DY + 0.86; paint(c, OAK, "oklch(0.55 0.02 55)"); BX(c, -1.7, my - 0.08, 1.4, 1.7, my, 3.6);
  for (const s of [-1, 1]) { BX(c, s * 1.2 - 0.12, DY, 1.6, s * 1.2 + 0.12, my - 0.08, 3.4); BX(c, s * 1.2 - 0.1, DY + 0.08, 2.0, s * 1.2 + 0.1, DY + 0.16, 3.0); }
  BX(c, -1.2, DY + 0.25, 2.45, 1.2, DY + 0.35, 2.55);
  paint(c, CHART, "oklch(0.97 0.02 85)"); BX(c, -1.55, my, 1.52, 1.55, my + 0.012, 3.48);
  flatc(c, "#d8c8a0"); for (const s of [-1, 1]) LA(c, s * 1.5, my + 0.02, 2.5, [[0.07, 0], [0.07, 0.04]], 6, true, "x"); // curled edges
  for (let k = 0; k < 9; k++) { flatc(c, k % 3 ? RED : "#1d1a17"); const px = -1.3 + 2.6 * hh(k, 11), pz = 1.7 + 1.6 * hh(k, 12); PIPE(c, [px, my, pz], [px, my + 0.07, pz], 0.008, 0.008, 4); BX(c, px - 0.022, my + 0.07, pz - 0.022, px + 0.022, my + 0.11, pz + 0.022); }
  flatc(c, BRASS); PIPE(c, [0.6, my + 0.01, 2.1], [0.85, my + 0.18, 2.3], 0.01, 0.01, 4); PIPE(c, [1.1, my + 0.01, 2.2], [0.85, my + 0.18, 2.3], 0.01, 0.01, 4);  // dividers
  LA(c, -0.7, my, 3.1, [[0.11, 0], [0.11, 0.04], [0.08, 0.05]], 10, true); flatc(c, "#1d1a17"); BX(c, -0.71, my + 0.05, 3.03, -0.69, my + 0.055, 3.17); // compass
  paint(c, IR, IRONC); LANTERN(c, 0.1, my, 2.0, D);
  for (const s of [-1, 1]) { paint(c, OAK, "oklch(0.5 0.02 55)"); BX(c, s * 2.4 - 0.18, DY + 0.42, 1.3, s * 2.4 + 0.18, DY + 0.48, 3.7); for (const z of [1.5, 3.5]) BX(c, s * 2.4 - 0.14, DY, z - 0.05, s * 2.4 + 0.14, DY + 0.42, z + 0.05); }
  paint(c, OAK, "oklch(0.55 0.02 55)"); BX(c, IX - 0.6, DY, -0.9, IX - 0.05, DY + 1.1, 1.2);                               // chart cabinet, its drawers
  if (D <= 2) { flatc(c, "#2a2620"); for (let k = 0; k < 4; k++) BX(c, IX - 0.62, DY + 0.15 + k * 0.24, -0.8, IX - 0.6, DY + 0.33 + k * 0.24, 1.1); flatc(c, BRASS); for (let k = 0; k < 4; k++) BX(c, IX - 0.66, DY + 0.22 + k * 0.24, 0.1, IX - 0.62, DY + 0.26 + k * 0.24, 0.2);
    paint(c, CHART, "oklch(0.95 0.02 85)"); for (let k = 0; k < 3; k++) LA(c, IX - 0.35, DY + 1.18, -0.6 + k * 0.4, [[0.06, 0], [0.06, 0.7]], 6, true, "x"); }
  // a stove against the west wall, its pipe through the roof
  paint(c, IR, "oklch(0.55 0.005 250)"); BX(c, -IX + 0.15, DY, 0.6, -IX + 1.05, DY + 0.8, 1.5); PIPE(c, [-IX + 0.6, DY + 0.8, 1.05], [-IX + 0.6, ry(IX - 0.6) + 0.8, 1.05], 0.11, 0.11, 8);
  glow(c, "#ff8a30", [2.2, 0.8, 0.15]); BX(c, -IX + 1.05, DY + 0.2, 0.8, -IX + 1.07, DY + 0.5, 1.3);
  if (D <= 2) { paint(c, OAK, "oklch(0.7 0.03 60)"); for (let k = 0; k < 6; k++) RB(c, -IX + 0.35 + 0.18 * (k % 3), DY + 0.08 + 0.15 * Math.floor(k / 3), 2.1, 0.15, 0.15, 0.6, 0, 0, 0); // kindling
    NETS(c, [-IX + 0.05, WT - 0.6, 2.3], [-IX + 0.05, WT - 0.6, 6.3], 2.0, 6); NETS(c, [IX - 0.05, WT - 0.6, 2.0], [IX - 0.05, WT - 0.6, 6.0], 2.2, 6);
    paint(c, OAK, "oklch(0.75 0.03 60)"); for (const a of [-1, 1]) { SEG(c, [IX - 0.08, DY + 1.5, 4.0 - a * 1.4], [IX - 0.08, DY + 4.4, 4.0 + a * 1.4], 0.06, 0.06); RB(c, IX - 0.08, DY + 4.4 + 0.05, 4.0 + a * 1.4 + a * 0.25, 0.04, 0.6, 0.22, 0, a * 26, 0); }
    for (let k = 0; k < 4; k++) BUOY(c, -IX + 0.3, WT - 0.5, 2.6 + k * 1.0, 0.18, k);
    paint(c, "cdn/texture-faded-red-cloth-weave.png", "oklch(0.92 0.03 30)"); RB(c, 0, DY + 0.02, 2.5, 4.4, 0.02, 3.2, 0, 0, 0); // rug under the table
    paint(c, OAK, "oklch(0.6 0.03 60)"); for (const [bx, bz] of [[-5.6, 5.6], [-5.0, 6.1], [-5.95, 6.15]]) LA(c, bx, DY, bz, [[0.3, 0], [0.36, 0.45], [0.3, 0.9]], 10, true);
    paint(c, IR, IRONC); for (const [bx, bz] of [[-5.6, 5.6], [-5.0, 6.1], [-5.95, 6.15]]) for (const y of [0.15, 0.75]) TORUS(c, bx, DY + y, bz, 0.32, 0.015, 10, 3); }
  // ---- COUNTING ROOM (east): desk and stool, ledger shelves, strongbox, scales, key board
  paint(c, OAK, "oklch(0.5 0.02 55)"); BX(c, 1.6, DY + 0.95, -5.6, 3.6, DY + 1.03, -4.4); BX(c, 1.6, DY, -5.6, 1.75, DY + 0.95, -4.4); BX(c, 3.45, DY, -5.6, 3.6, DY + 0.95, -4.4);
  BX(c, 1.6, DY + 1.03, -5.6, 3.6, DY + 1.25, -5.45);                                                                     // slanted desk's back rail
  LA(c, 2.6, DY, -3.75, [[0.2, 0.7], [0.2, 0.76]], 8, true); for (let k = 0; k < 3; k++) { const a = k * 2.094; SEG(c, [2.6 + Math.cos(a) * 0.15, DY + 0.7, -3.75 + Math.sin(a) * 0.15], [2.6 + Math.cos(a) * 0.24, DY, -3.75 + Math.sin(a) * 0.24], 0.04, 0.04); }
  paint(c, CHART, "oklch(0.97 0.02 85)"); RB(c, 2.4, DY + 1.05, -4.95, 0.7, 0.03, 0.5, 8, 0, 0); paint(c, WOOL, "oklch(0.5 0.05 30)"); RB(c, 3.1, DY + 1.08, -5.1, 0.32, 0.08, 0.42, -6, 0, 0);
  flatc(c, "#1d1a17"); LA(c, 1.95, DY + 1.03, -5.2, [[0.05, 0], [0.04, 0.08]], 6, true); flatc(c, PALE); SEG(c, [1.95, DY + 1.1, -5.2], [1.9, DY + 1.35, -5.3], 0.01, 0.06); // inkwell, quill
  paint(c, OAK, "oklch(0.55 0.02 55)"); BX(c, 0.3, DY, IZ0, 6.5, DY + 2.6, IZ0 + 0.4);
  for (let k = 0; k < 4; k++) BX(c, 0.3, DY + 0.2 + k * 0.62, IZ0 + 0.02, 6.5, DY + 0.24 + k * 0.62, IZ0 + 0.42);
  if (D <= 2) for (let k = 0; k < 3; k++) for (let i = 0; i < 26; i++) { if (hh(i, k, 1) > 0.85) continue; const bx = 0.45 + i * 0.235, h = 0.38 + 0.15 * hh(i, k, 2);
    paint(c, WOOL, ["oklch(0.5 0.06 30)", "oklch(0.55 0.04 140)", "oklch(0.45 0.04 250)", "oklch(0.6 0.05 70)"][(i + k) % 4]); BX(c, bx, DY + 0.24 + k * 0.62, IZ0 + 0.06, bx + 0.19, DY + 0.24 + k * 0.62 + h, IZ0 + 0.36); }
  paint(c, OAK, "oklch(0.5 0.02 55)"); BX(c, IX - 1.0, DY, -3.0, IX - 0.1, DY + 0.65, -2.0); paint(c, IR, IRONC); for (const z of [-2.9, -2.5, -2.1]) BX(c, IX - 1.03, DY, z - 0.03, IX - 0.07, DY + 0.68, z + 0.03);
  BX(c, IX - 1.06, DY + 0.25, -2.6, IX - 1.0, DY + 0.45, -2.4);                                                          // strongbox and lock
  flatc(c, BRASS); PIPE(c, [5.0, DY + 1.03, -5.0], [5.0, DY + 1.5, -5.0], 0.015, 0.015, 4); SEG(c, [4.7, DY + 1.5, -5.0], [5.3, DY + 1.5, -5.0], 0.02, 0.02);
  for (const s of [-1, 1]) LA(c, 5.0 + s * 0.3, DY + 1.25, -5.0, [[0.01, 0], [0.12, 0.02], [0.13, 0.05]], 8, true);
  paint(c, OAK, "oklch(0.5 0.02 55)"); BX(c, 4.4, DY, -5.5, 5.6, DY + 1.03, -4.5);
  paint(c, OAK, "oklch(0.6 0.02 55)"); BX(c, IX - 0.05, DY + 1.4, -7.4, IX, DY + 2.2, -5.8); paint(c, IR, IRONC); for (let k = 0; k < 8; k++) { const kz = -7.25 + (k % 4) * 0.4, ky = DY + 1.95 - Math.floor(k / 4) * 0.4; PIPE(c, [IX - 0.05, ky, kz], [IX - 0.12, ky, kz], 0.01, 0.01, 4); BX(c, IX - 0.13, ky - 0.2, kz - 0.015, IX - 0.11, ky, kz + 0.015); }
  // ---- CREW LOFT (west): three hammocks slung from the wall to a post, sea chests, a peg rail of oilskins
  paint(c, TAR, "oklch(0.8 0.01 60)"); for (const z of [-7.6, -5.4, -3.2]) BX(c, -2.2, DY, z - 0.1, -2.0, CEIL, z + 0.1);
  for (const z of [-7.6, -5.4, -3.2]) HAMMOCK(c, -IX, -2.1, DY + 1.25, z, D);
  CHEST(c, -1.0, -7.6, true); CHEST(c, -1.0, -5.4, true); CHEST(c, -1.0, -3.2, true);
  if (D <= 2) { paint(c, OAK, "oklch(0.6 0.02 55)"); BX(c, -6.4, DY + 1.85, IZ0, -1.0, DY + 1.95, IZ0 + 0.1); for (let k = 0; k < 4; k++) { const px = -5.8 + k * 1.3;
      paint(c, CANVAS, ["oklch(0.85 0.12 95)", "oklch(0.7 0.1 60)"][k % 2]); RB(c, px, DY + 1.3, IZ0 + 0.16, 0.55, 1.0, 0.12, 0, 0, (hh(k, 5) - 0.5) * 8); } }
}
export function geometry(c) { geo(c); }
export function collider(c) {
  const b = CB();
  b(-8.2, DY - 0.5, -9.7, 8.2, DY, PZ1);
  for (const x of [-7.6, -2.6, 2.6, 7.6]) for (const z of [-9.4, -4.6, 0.2, 5, 10]) b(x - 0.2, -0.6, z - 0.2, x + 0.2, DY - 0.5, z + 0.2);
  for (const s of [-1, 1]) b(s * IX, DY, WZ0, s * WX, WT, WZ1);
  b(-IX, DY, WZ0, IX, WT, IZ0); b(-IX, DY, IZ1, -0.68, WT, WZ1); b(0.68, DY, IZ1, IX, WT, WZ1); b(-0.68, DY + 2.45, IZ1, 0.68, WT, WZ1);
  let x = -IX; for (const [a, d] of DOORS) { b(x, DY, PZ - 0.1, a, CEIL, PZ + 0.1); b(a, DY + 2.4, PZ - 0.1, d, CEIL, PZ + 0.1); x = d; } b(x, DY, PZ - 0.1, IX, CEIL, PZ + 0.1);
  b(-0.1, DY, IZ0, 0.1, CEIL, PZ - 0.1);
  // porch rails (gap for the stairs)
  b(-8.2, DY, WZ1, -8.0, DY + 1.15, PZ1); b(8.0, DY, WZ1, 8.2, DY + 1.15, PZ1); b(-8.2, DY, PZ1 - 0.2, -1.3, DY + 1.15, PZ1); b(1.3, DY, PZ1 - 0.2, 8.2, DY + 1.15, PZ1);
  for (let k = 0; k < NSTEP; k++) { const y = DY - (k + 1) * SR, z = PZ1 + k * ST; b(-1.1, 0, z, 1.1, y, z + ST); }
  b(-1.2, 0, BW0, 1.2, 0.3, BW1); for (const s of [-1, 1]) { b(s * 1.3 - 0.1, 0, PZ1, s * 1.3 + 0.1, DY + 1.1, BW0); b(s * 1.3 - 0.1, 0, BW0, s * 1.3 + 0.1, 1.4, BW1); }
  // furniture
  b(-1.7, DY, 1.4, 1.7, DY + 0.86, 3.6); for (const s of [-1, 1]) b(s * 2.4 - 0.18, DY, 1.3, s * 2.4 + 0.18, DY + 0.48, 3.7);
  b(IX - 0.6, DY, -0.9, IX, DY + 1.1, 1.2); b(-IX, DY, 0.6, -IX + 1.05, DY + 0.8, 1.5); b(-6.3, DY, 5.2, -4.6, DY + 0.9, 6.5);
  b(1.6, DY, -5.6, 3.6, DY + 1.03, -4.4); b(4.4, DY, -5.5, 5.6, DY + 1.03, -4.5); b(0.3, DY, IZ0, 6.5, DY + 2.6, IZ0 + 0.4); b(IX - 1.0, DY, -3.0, IX, DY + 0.65, -2.0);
  for (const z of [-7.6, -5.4, -3.2]) { b(-2.2, DY, z - 0.1, -2.0, CEIL, z + 0.1); b(-1.3, DY, z - 0.45, -0.7, DY + 0.45, z + 0.45); }
  // the tower
  b(10 - 2.1, -0.6, -6.4 - 2.1, 10 + 2.1, 15.2, -6.4 + 2.1);
  return b.list;
}
