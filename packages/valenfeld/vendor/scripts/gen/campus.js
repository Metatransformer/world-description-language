// A UNIVERSITY CAMPUS: the walled quad around a university's library hall (the hall itself is its own placement,
// standing at local (0, 0, 18) with its door facing the quad). Local origin = the quad's centre on the ground; front
// (the gatehouse) is -z. Everything here is one style table (scripts/lib/data/campuses.yml rides params):
//   WALL      a 60 x 60 m perimeter, 3.2 m, gatehouse at z -30 (two towers, an arch, the name board above)
//   LECTURE   west, x -27..-13, z -16..6, 6 m to the eaves, door in its east wall: benches, lectern, slate board, lamps
//   DORMS     east, x 15..27, z -18..8, two storeys, doors and lit windows (shut: you lodge at the inn)
//   TOWER     front-left at (-22, -23): bell (Aurelith), observatory (Ilyrath), tide gauge (Pelathyr), forge (Karth Veyra)
//   QUAD      flagstone cross paths, lawn beds with low hedges, a fountain at the centre, benches, lamp posts
// params: wallTex, wallCol, trimTex, trimCol, roofTex, roofCol, floorTex, banner, glass, tower, lawn, hedge
import { paint, flatc, glow, BX, RB, LA, CY, ROOF, CB, BARREL } from "../lib/buildkit.js";
const OAKT = "cdn/texture-dark-oak-planks-weathered.png", IRT = "cdn/texture-wrought-iron.png";
const OAKC = "oklch(0.86 0.03 60)", IRC = "oklch(0.7 0.005 250)";
const S = (p) => ({
  wallTex: p.wallTex ?? "cdn/texture-fieldstone-wall-mossy.png", wallCol: p.wallCol ?? "oklch(0.9 0.01 90)",
  trimTex: p.trimTex ?? "cdn/texture-flagstone-floor-worn.png", trimCol: p.trimCol ?? "oklch(0.95 0.01 90)",
  roofTex: p.roofTex ?? "cdn/texture-slate-roof-tiles-mossy.png", roofCol: p.roofCol ?? "oklch(0.85 0.02 250)",
  floorTex: p.floorTex ?? "cdn/texture-flagstone-floor-worn.png", banner: p.banner ?? "#2f3d52", banner2: p.banner2 ?? "#c9a45a",
  glass: p.glass ?? [1.0, 0.6, 0.22], tower: p.tower ?? "bell", lawn: p.lawn ?? "oklch(0.5 0.09 135)", hedge: p.hedge ?? "oklch(0.4 0.08 140)",
  snow: !!p.snow,
});
const HW = 30, WT = 0.7, WH = 3.2, GW = 2.2;   // half width, wall thickness, height, gate half-width
const LX0 = -27, LX1 = -13, LZ0 = -16, LZ1 = 6, LH = 6, LT = 0.5, LD = [-6.2, -4.2, 3.0];   // lecture hall; door [z0, z1, top] in its east wall
const DX0 = 15, DX1 = 27, DZ0 = -18, DZ1 = 8, DH = 7;
const TX = -22, TZ = -23, TR = 3.2;
const LAMPS = [[-6, -24], [6, -24], [-6, -10], [6, -10], [-6, 8], [6, 8], [-11, -4], [11, -4]];
const BENCHES = [[-4.5, -5, 90], [4.5, -5, -90], [-4.5, 5, 90], [4.5, 5, -90], [-9, -20, 0], [9, -20, 0]];

function wallRuns(fn) {   // the perimeter as boxes, the gate gap left open
  fn(-HW, -6, HW - WT, HW, WH, HW); fn(-HW, -6, -HW, -HW + WT, WH, HW - WT); fn(HW - WT, -6, -HW, HW, WH, HW - WT);
  fn(-HW + WT, -6, -HW, -GW - 1.6, WH, -HW + WT); fn(GW + 1.6, -6, -HW, HW - WT, WH, -HW + WT);
}
function gatehouse(c, s, L, fn) {   // two square towers either side of the gap, an arch over it
  for (const sx of [-1, 1]) { const x0 = sx < 0 ? -GW - 2.6 : GW, x1 = sx < 0 ? -GW : GW + 2.6; fn(x0, -6, -HW - 0.9, x1, 6.4, -HW + WT + 0.9); }
  fn(-GW, 4.2, -HW - 0.9, GW, 6.4, -HW + WT + 0.9);
  if (!c) return;
  paint(c, s.trimTex, s.trimCol);
  for (const sx of [-1, 1]) { const x0 = sx < 0 ? -GW - 2.8 : GW - 0.2, x1 = sx < 0 ? -GW + 0.2 : GW + 2.8; BX(c, x0, 6.4, -HW - 1.1, x1, 6.7, -HW + WT + 1.1);
    if (L <= 3) for (let i = 0; i < 3; i++) { const x = x0 + 0.2 + i * 1.05; BX(c, x, 6.7, -HW - 1.1, x + 0.55, 7.3, -HW - 0.6); BX(c, x, 6.7, -HW + WT + 0.6, x + 0.55, 7.3, -HW + WT + 1.1); } }
  // the arch's soffit: stepped voussoirs under the lintel
  if (L <= 3) for (let i = 0; i < 6; i++) { const t = (i + 0.5) / 6, a = Math.PI * t, x = -GW * Math.cos(a), y = 3.2 + Math.sin(a) * 1.0; BX(c, x - 0.4, y, -HW - 0.95, x + 0.4, 4.25, -HW + WT + 0.95); }
  // banners hanging off the towers' faces
  if (L <= 3) for (const sx of [-1, 1]) { const x = sx * (GW + 1.3);
    flatc(c, s.banner); BX(c, x - 0.55, 2.6, -HW - 0.96, x + 0.55, 5.9, -HW - 0.92);
    flatc(c, s.banner2); BX(c, x - 0.56, 5.6, -HW - 0.98, x + 0.56, 5.75, -HW - 0.9); BX(c, x - 0.12, 3.6, -HW - 0.99, x + 0.12, 4.9, -HW - 0.95); BX(c, x - 0.4, 4.1, -HW - 0.99, x + 0.4, 4.35, -HW - 0.95);
    paint(c, IRT, IRC); BX(c, x - 0.7, 5.9, -HW - 1.05, x + 0.7, 5.98, -HW - 0.9); }
}
function lecture(c, s, L, fn) {   // walls with the door hole and four window slots each long side
  const [d0, d1, dt] = LD, hole = (x0, x1) => { fn(x0, 0, LZ0, x1, LH, LZ0 + LT); };
  fn(LX0, 0, LZ0, LX1, LH, LZ0 + LT); fn(LX0, 0, LZ1 - LT, LX1, LH, LZ1); fn(LX0, 0, LZ0 + LT, LX0 + LT, LH, LZ1 - LT);
  fn(LX1 - LT, 0, LZ0 + LT, LX1, LH, d0); fn(LX1 - LT, 0, d1, LX1, LH, LZ1 - LT); fn(LX1 - LT, dt, d0, LX1, LH, d1);
  void hole;
}
function lectureRoof(c, s, L) {
  paint(c, s.roofTex, s.roofCol);
  // gable runs along z: ROOF slopes in z, so build it in a turned frame: two pitched slabs by RB
  const w = LX1 - LX0 + 1.0, cx = (LX0 + LX1) / 2, cz = (LZ0 + LZ1) / 2, len = LZ1 - LZ0 + 1.0, rise = 3.2, half = w / 2, sl = Math.hypot(half, rise), ang = Math.atan2(rise, half) * 180 / Math.PI;
  RB(c, cx - half / 2, LH + rise / 2, cz, sl, 0.22, len, 0, 0, ang); RB(c, cx + half / 2, LH + rise / 2, cz, sl, 0.22, len, 0, 0, -ang);
  paint(c, s.wallTex, s.wallCol);   // gable ends
  for (const z of [LZ0, LZ1 - LT]) for (let i = 0; i < 6; i++) { const t = i / 6, hw = (LX1 - LX0) / 2 * (1 - t); BX(c, cx - hw, LH + rise * t, z, cx + hw, LH + rise * (t + 1 / 6), z + LT); }
  if (L <= 2) { paint(c, s.trimTex, s.trimCol); BX(c, cx - 0.25, LH + rise - 0.1, LZ0 - 0.6, cx + 0.25, LH + rise + 0.35, LZ1 + 0.6); }
}
function lectureInside(c, s, L) {
  paint(c, s.floorTex, "oklch(0.9 0.015 80)"); BX(c, LX0 + LT, 0, LZ0 + LT, LX1 - LT, 0.04, LZ1 - LT);
  // the dais at the north end, lectern, the slate board on the north wall
  paint(c, OAKT, OAKC); BX(c, LX0 + LT, 0, LZ0 + LT, LX1 - LT, 0.35, LZ0 + 4);
  BX(c, -20.6, 0.35, -13.6, -19.4, 1.45, -13.0); RB(c, -20, 1.5, -13.25, 1.4, 0.06, 0.8, 0, 18, 0);
  flatc(c, "#1f2624"); BX(c, -24, 1.4, LZ0 + LT + 0.01, -16, 3.6, LZ0 + LT + 0.06);
  paint(c, OAKT, OAKC); BX(c, -24.1, 1.3, LZ0 + LT, -15.9, 1.4, LZ0 + LT + 0.15);
  if (L <= 2) { flatc(c, "oklch(0.92 0.01 90)"); for (let i = 0; i < 9; i++) { const x = -23.4 + i * 0.85, y = 2.2 + Math.sin(i * 1.7) * 0.6; BX(c, x, y, LZ0 + LT + 0.065, x + 0.5 + (i % 3) * 0.2, y + 0.04, LZ0 + LT + 0.07); }
    LA(c, -18.2, 2.6, LZ0 + LT + 0.07, [[0.45, 0], [0.42, 0.01], [0, 0.012]], 16, false, "z"); }
  // benches facing the dais: three rows each side of an aisle
  paint(c, OAKT, OAKC);
  for (let r = 0; r < 5; r++) { const z = -9.5 + r * 2.6; for (const [x0, x1] of [[-26, -21], [-19, -14]]) { BX(c, x0, 0.42, z, x1, 0.5, z + 0.45); BX(c, x0, 0.5, z + 0.4, x1, 1.0, z + 0.48);
    BX(c, x0, 0.75, z - 0.75, x1, 0.8, z - 0.3); for (const x of [x0 + 0.15, x1 - 0.25]) { BX(c, x, 0, z, x + 0.1, 0.42, z + 0.45); BX(c, x, 0, z - 0.7, x + 0.1, 0.75, z - 0.6); } } }
  // hanging iron rings of candles
  for (const z of [-8, 0]) { paint(c, IRT, IRC); LA(c, -20, 4.0, z, [[0.9, 0], [0.9, 0.08]], 14, false); BX(c, -20.02, 4.08, z - 0.02, -19.98, LH, z + 0.02);
    glow(c, "oklch(0.95 0.05 85)", [1.4, 0.9, 0.4]); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; BX(c, -20 + Math.cos(a) * 0.9 - 0.03, 4.08, z + Math.sin(a) * 0.9 - 0.03, -20 + Math.cos(a) * 0.9 + 0.03, 4.3, z + Math.sin(a) * 0.9 + 0.03); } }
  // shelves along the back wall, books
  paint(c, OAKT, OAKC); BX(c, LX0 + LT, 0, LZ1 - 0.9, LX1 - LT, 2.4, LZ1 - LT);
  if (L <= 2) { const books = ["#6e2a1e", "#7a5a2a", "#3c5238", "#2a3650", "#4a3a2a", "#8a7448"]; for (const y of [0.3, 1.05, 1.8]) for (let x = LX0 + 0.7; x < LX1 - 0.7; x += 0.12) { flatc(c, books[Math.floor(c.random() * 6)]); BX(c, x, y, LZ1 - 0.95, x + 0.09, y + 0.4 + c.random() * 0.15, LZ1 - 0.6); } }
}
function windows(c, s, L) {   // lit windows on the lecture hall's long walls and the dorm front
  const g = s.glass;
  for (let i = 0; i < 4; i++) { const z = -12 + i * 4.5; if (z > LD[0] - 1 && z < LD[1] + 1) continue;
    glow(c, "#2a2016", [g[0] * 0.5, g[1] * 0.5, g[2] * 0.5]); BX(c, LX0 - 0.03, 1.8, z - 0.5, LX0 + 0.02, 4.2, z + 0.5); BX(c, LX1 - 0.02, 1.8, z - 0.5, LX1 + 0.03, 4.2, z + 0.5);
    paint(c, s.trimTex, s.trimCol); BX(c, LX0 - 0.12, 1.65, z - 0.65, LX0, 1.8, z + 0.65); BX(c, LX1, 1.65, z - 0.65, LX1 + 0.12, 1.8, z + 0.65); }
  for (let fl = 0; fl < 2; fl++) for (let i = 0; i < 6; i++) { const z = DZ0 + 2 + i * 4.2, y = 1.2 + fl * 3.3;
    glow(c, "#2a2016", fl === 1 && i % 2 ? [0.05, 0.04, 0.03] : [g[0] * 0.55, g[1] * 0.55, g[2] * 0.55]); BX(c, DX0 - 0.03, y, z - 0.45, DX0 + 0.02, y + 1.5, z + 0.45);
    paint(c, OAKT, OAKC); BX(c, DX0 - 0.1, y - 0.1, z - 0.55, DX0, y, z + 0.55); }
}
function dorms(c, s, L, fn) {
  fn(DX0, 0, DZ0, DX1, DH, DZ1);
  if (!c) return;
  paint(c, s.wallTex, s.wallCol); BX(c, DX0, 0, DZ0, DX1, DH, DZ1);
  paint(c, s.trimTex, s.trimCol); BX(c, DX0 - 0.1, 3.2, DZ0 - 0.1, DX1 + 0.1, 3.45, DZ1 + 0.1); BX(c, DX0 - 0.15, 0, DZ0 - 0.15, DX1 + 0.15, 0.4, DZ1 + 0.15);
  paint(c, s.roofTex, s.roofCol);
  const half = (DX1 - DX0) / 2 + 0.5, rise = 2.8, sl = Math.hypot(half, rise), ang = Math.atan2(rise, half) * 180 / Math.PI, cx = (DX0 + DX1) / 2, cz = (DZ0 + DZ1) / 2;
  RB(c, cx - half / 2, DH + rise / 2, cz, sl, 0.22, DZ1 - DZ0 + 0.8, 0, 0, ang); RB(c, cx + half / 2, DH + rise / 2, cz, sl, 0.22, DZ1 - DZ0 + 0.8, 0, 0, -ang);
  paint(c, s.wallTex, s.wallCol); for (const z of [DZ0, DZ1 - 0.3]) for (let i = 0; i < 5; i++) { const t = i / 5, hw = (DX1 - DX0) / 2 * (1 - t); BX(c, cx - hw, DH + rise * t, z, cx + hw, DH + rise * (t + 0.2), z + 0.3); }
  // chimneys and three doors with steps
  paint(c, s.trimTex, s.trimCol); for (const z of [DZ0 + 5, DZ1 - 5]) BX(c, cx + 2, DH, z - 0.5, cx + 3, DH + rise + 1.4, z + 0.5);
  for (const z of [DZ0 + 4.2, cz, DZ1 - 4.2]) { paint(c, OAKT, "oklch(0.7 0.04 45)"); BX(c, DX0 - 0.06, 0.4, z - 0.6, DX0, 2.6, z + 0.6);
    paint(c, IRT, IRC); BX(c, DX0 - 0.1, 1.4, z + 0.3, DX0 - 0.06, 1.5, z + 0.42); paint(c, s.trimTex, s.trimCol); BX(c, DX0 - 0.8, 0, z - 0.8, DX0, 0.4, z + 0.8);
    flatc(c, s.banner); BX(c, DX0 - 0.95, 2.8, z - 0.8, DX0, 2.95, z + 0.8); }
}
function tower(c, s, L, fn) {
  const kind = s.tower, H = kind === "observatory" ? 12 : kind === "forge" ? 10 : 15;
  fn(TX - TR, 0, TZ - TR, TX + TR, H, TZ + TR);
  if (!c) return;
  const n = L <= 2 ? 20 : 12;
  paint(c, s.wallTex, s.wallCol); LA(c, TX, 0, TZ, [[TR + 0.25, 0], [TR + 0.25, 0.8], [TR, 1.0], [TR - 0.15, H]], n, false);
  paint(c, s.trimTex, s.trimCol); LA(c, TX, H - 0.6, TZ, [[TR + 0.05, 0], [TR + 0.35, 0.3], [TR + 0.35, 0.7], [0, 0.7]], n, false);
  // slit windows, lit
  glow(c, "#2a2016", [s.glass[0] * 0.6, s.glass[1] * 0.6, s.glass[2] * 0.6]);
  for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + 0.4, y = 3 + k * 2.6; RB(c, TX + Math.cos(a) * (TR - 0.1), y, TZ + Math.sin(a) * (TR - 0.1), 0.35, 1.2, 0.2, 90 - a * 180 / Math.PI); }
  paint(c, OAKT, "oklch(0.7 0.04 45)"); RB(c, TX + 2.4, 1.2, TZ + 2.2, 1.1, 2.4, 0.12, -45);
  const top = H + 0.1;
  if (kind === "bell") {   // a belfry of four piers and a pyramid of slate, the bell inside
    paint(c, s.wallTex, s.wallCol); for (const [px, pz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) BX(c, TX + px * 2.2 - 0.35, top, TZ + pz * 2.2 - 0.35, TX + px * 2.2 + 0.35, top + 3, TZ + pz * 2.2 + 0.35);
    paint(c, s.roofTex, s.roofCol); LA(c, TX, top + 3, TZ, [[3.2, 0], [0, 4.4]], 4, true, "y", false);
    flatc(c, "oklch(0.62 0.09 75)"); c.metalness(0.6); LA(c, TX, top + 0.9, TZ, [[0.75, 0], [0.7, 0.2], [0.5, 0.9], [0.45, 1.5], [0, 1.65]], 14, true); c.metalness(null);
    flatc(c, s.banner2); BX(c, TX - 0.03, top + 7.4, TZ - 0.03, TX + 0.03, top + 8.6, TZ + 0.03); flatc(c, s.banner); BX(c, TX + 0.03, top + 7.9, TZ - 0.01, TX + 1.1, top + 8.5, TZ + 0.01);
  } else if (kind === "observatory") {   // a turquoise dome and an armillary sphere on its crown
    flatc(c, "oklch(0.5 0.075 215)"); paint(c, "cdn/texture-turquoise-blue-glazed-tiles.png", "oklch(0.97 0.01 220)"); LA(c, TX, top + 0.6, TZ, [[3.3, 0], [3.1, 1.2], [2.4, 2.3], [1.3, 3.0], [0, 3.3]], n, false);
    flatc(c, "#141a24"); RB(c, TX, top + 2.2, TZ - 2.0, 0.9, 2.2, 0.4, 0, -30);
    flatc(c, "oklch(0.75 0.11 80)"); c.metalness(0.7); const cy = top + 5.2;
    for (const [ax, rot] of [["y", 0], ["x", 0], ["z", 0]]) { const R = 1.2, m = 22; for (let i = 0; i < m; i++) { const a0 = i / m * Math.PI * 2, a1 = (i + 1) / m * Math.PI * 2;
      const P = (a) => ax === "y" ? [TX + Math.cos(a) * R, cy, TZ + Math.sin(a) * R] : ax === "x" ? [TX, cy + Math.cos(a) * R, TZ + Math.sin(a) * R] : [TX + Math.cos(a) * R, cy + Math.sin(a) * R, TZ];
      const A = P(a0), B = P(a1); RB(c, (A[0] + B[0]) / 2, (A[1] + B[1]) / 2, (A[2] + B[2]) / 2, ax === "x" ? 0.06 : Math.abs(B[0] - A[0]) + 0.06, ax === "y" ? 0.06 : Math.abs(B[1] - A[1]) + 0.06, ax === "z" ? 0.06 : Math.abs(B[2] - A[2]) + 0.06); } void rot; }
    LA(c, TX, top + 3.2, TZ, [[0.1, 0], [0.06, 0.9]], 6, true); LA(c, TX, cy, TZ, [[0.22, 0], [0.22, 0.01]], 8, true); c.metalness(null);
  } else if (kind === "tide") {   // a timber gallery and a lantern cage, a painted gauge board down the side
    paint(c, OAKT, "oklch(0.55 0.02 60)"); LA(c, TX, top, TZ, [[TR + 0.9, 0], [TR + 0.9, 0.2]], n, true);
    for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; BX(c, TX + Math.cos(a) * (TR + 0.8) - 0.05, top + 0.2, TZ + Math.sin(a) * (TR + 0.8) - 0.05, TX + Math.cos(a) * (TR + 0.8) + 0.05, top + 1.2, TZ + Math.sin(a) * (TR + 0.8) + 0.05); }
    paint(c, IRT, IRC); LA(c, TX, top + 0.2, TZ, [[1.4, 0], [1.4, 2.0], [1.6, 2.1], [0.2, 3.0]], 10, false);
    glow(c, "oklch(0.95 0.06 85)", [3.0, 2.0, 0.8]); LA(c, TX, top + 0.5, TZ, [[0.6, 0], [0.6, 1.3], [0, 1.4]], 10, true);
    for (let i = 0; i < 12; i++) { flatc(c, i % 2 ? "oklch(0.95 0.01 90)" : "oklch(0.45 0.15 25)"); BX(c, TX - 0.3, 0.5 + i * 0.9, TZ - TR - 0.12, TX + 0.3, 1.4 + i * 0.9, TZ - TR + 0.2); }
  } else {   // forge: a squat crown of crenels and two iron-banded chimneys glowing at the mouth
    paint(c, s.wallTex, s.wallCol); for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; RB(c, TX + Math.cos(a) * TR, top + 0.45, TZ + Math.sin(a) * TR, 0.9, 0.9, 0.6, 90 - a * 180 / Math.PI); }
    for (const dx of [-1.2, 1.2]) { paint(c, s.trimTex, s.trimCol); BX(c, TX + dx - 0.6, top, TZ - 0.6, TX + dx + 0.6, top + 4.5, TZ + 0.6);
      paint(c, IRT, IRC); for (const y of [1.2, 3.0]) BX(c, TX + dx - 0.65, top + y, TZ - 0.65, TX + dx + 0.65, top + y + 0.12, TZ + 0.65);
      glow(c, "#3a1408", [2.2, 0.7, 0.15]); BX(c, TX + dx - 0.45, top + 4.45, TZ - 0.45, TX + dx + 0.45, top + 4.5, TZ + 0.45); }
  }
  if (s.snow) { flatc(c, "oklch(0.97 0.01 240)"); LA(c, TX, H + 0.7, TZ, [[TR + 0.36, 0], [TR + 0.2, 0.12], [0, 0.14]], n, false); }
}
function quad(c, s, L) {
  // lawn beds in four quarters, the paths left as flagstone
  paint(c, s.floorTex, "oklch(0.92 0.015 80)"); BX(c, -HW + WT, -1, -HW + WT, HW - WT, 0.05, HW - WT); BX(c, -GW, -1, -HW, GW, 0.05, -HW + WT);
  flatc(c, s.lawn); for (const [x0, x1] of [[-11, -2.4], [2.4, 11]]) for (const [z0, z1] of [[-26, -3], [3, 12]]) BX(c, x0, 0.05, z0, x1, 0.09, z1);
  flatc(c, s.hedge); for (const [x0, x1] of [[-11, -2.4], [2.4, 11]]) for (const [z0, z1] of [[-26, -3], [3, 12]]) {
    BX(c, x0, 0.09, z0, x0 + 0.5, 0.75, z1); BX(c, x1 - 0.5, 0.09, z0, x1, 0.75, z1); BX(c, x0 + 0.5, 0.09, z0, x1 - 0.5, 0.75, z0 + 0.5); BX(c, x0 + 0.5, 0.09, z1 - 0.5, x1 - 0.5, 0.75, z1); }
  // the fountain: a round basin, dark water, a column with a stone book on top
  paint(c, s.trimTex, s.trimCol); LA(c, 0, 0.05, 0, [[2.6, 0], [2.6, 0.6], [2.25, 0.62], [2.25, 0.2]], L <= 2 ? 24 : 12, false);
  flatc(c, "#1e2a2c"); c.roughness?.(0.2); LA(c, 0, 0.45, 0, [[2.26, 0], [0, 0]], L <= 2 ? 24 : 12, false); c.roughness?.(null);
  paint(c, s.trimTex, s.trimCol); LA(c, 0, 0.05, 0, [[0.5, 0], [0.4, 0.4], [0.3, 0.5], [0.3, 2.2], [0.55, 2.4], [0.55, 2.55]], 12, true);
  RB(c, -0.3, 2.75, 0, 0.62, 0.12, 0.85, 0, 0, 12); RB(c, 0.3, 2.75, 0, 0.62, 0.12, 0.85, 0, 0, -12);
  // benches and lamp posts with glowing heads
  for (const [x, z, yaw] of BENCHES) { paint(c, OAKT, OAKC); RB(c, x, 0.45, z, 1.8, 0.08, 0.45, yaw); RB(c, x + Math.cos((yaw) * Math.PI / 180) * 0, 0.8, z, 1.8, 0.4, 0.06, yaw);
    paint(c, IRT, IRC); for (const o of [-0.75, 0.75]) RB(c, x + Math.cos(yaw * Math.PI / 180) * o, 0.22, z - Math.sin(yaw * Math.PI / 180) * o, 0.08, 0.45, 0.45, yaw); }
  for (const [x, z] of LAMPS) { paint(c, IRT, IRC); CY(c, x, 0, z, 0.08, 3.0, 6); LA(c, x, 0, z, [[0.22, 0], [0.18, 0.3], [0.09, 0.4]], 6, false); BX(c, x - 0.22, 3.0, z - 0.22, x + 0.22, 3.06, z + 0.22); LA(c, x, 3.55, z, [[0.26, 0], [0, 0.28]], 4, false, "y", false);
    glow(c, "oklch(0.95 0.06 85)", [s.glass[0] * 2.2, s.glass[1] * 2.2, s.glass[2] * 2.2]); BX(c, x - 0.15, 3.06, z - 0.15, x + 0.15, 3.55, z + 0.15); }
  // a notice board by the gate, a cart of crates and barrels by the dorms, a scholar's table outside the lecture door
  paint(c, OAKT, OAKC); BX(c, 5.2, 0, -27.4, 5.32, 2.2, -27.28); BX(c, 7.6, 0, -27.4, 7.72, 2.2, -27.28); BX(c, 5.0, 1.0, -27.5, 7.9, 2.05, -27.38); RB(c, 6.45, 2.25, -27.5, 3.3, 0.06, 0.6, 0, 30);
  if (L <= 2) { for (let i = 0; i < 6; i++) { flatc(c, i % 2 ? "oklch(0.9 0.04 85)" : "oklch(0.95 0.02 90)"); BX(c, 5.2 + (i % 3) * 0.9, 1.15 + Math.floor(i / 3) * 0.45, -27.53, 5.75 + (i % 3) * 0.9, 1.5 + Math.floor(i / 3) * 0.45, -27.51); } }
  paint(c, OAKT, OAKC); for (const [x, z, h] of [[13.2, 10.5, 0.7], [13.0, 11.4, 0.7], [13.1, 10.9, 1.4]]) BX(c, x - 0.35, h - 0.7, z - 0.35, x + 0.35, h, z + 0.35);
  BARREL(c, 12.0, 0, 10.8, 0.33, 0.9, L); BARREL(c, 12.2, 0, 11.7, 0.33, 0.9, L);
  paint(c, OAKT, OAKC); BX(c, -11.8, 0.75, -6.2, -10.0, 0.82, -4.0); for (const [x, z] of [[-11.7, -6.1], [-10.1, -6.1], [-11.7, -4.1], [-10.1, -4.1]]) BX(c, x - 0.05, 0, z - 0.05, x + 0.05, 0.75, z + 0.05);
  if (L <= 2) { flatc(c, "oklch(0.92 0.03 85)"); RB(c, -10.9, 0.84, -5.4, 0.5, 0.01, 0.35, 20); RB(c, -11.2, 0.84, -4.7, 0.4, 0.01, 0.3, -35); flatc(c, "#6e2a1e"); BX(c, -10.6, 0.82, -4.6, -10.3, 0.92, -4.2); }
}
export function geometry(c) {
  const s = S(c.params ?? {}), L = c.lod;
  const fn = (x0, y0, z0, x1, y1, z1) => BX(c, x0, y0, z0, x1, y1, z1);
  if (L >= 5) { paint(c, s.wallTex, s.wallCol); wallRuns(fn); gatehouse(null, s, L, fn); lecture(null, s, L, fn); dorms(null, s, L, fn); paint(c, s.wallTex, s.wallCol); tower(null, s, L, fn); return; }
  paint(c, s.wallTex, s.wallCol); wallRuns(fn); gatehouse(null, s, L, fn); lecture(null, s, L, fn);
  paint(c, s.trimTex, s.trimCol); BX(c, -HW - 0.1, WH, -HW - 0.1, HW + 0.1, WH + 0.25, -HW + WT + 0.1); BX(c, -HW - 0.1, WH, HW - WT - 0.1, HW + 0.1, WH + 0.25, HW + 0.1);
  BX(c, -HW - 0.1, WH, -HW, -HW + WT + 0.1, WH + 0.25, HW); BX(c, HW - WT - 0.1, WH, -HW, HW + 0.1, WH + 0.25, HW);
  if (L <= 3) for (const x of [-HW, HW]) for (let z = -HW + 6; z < HW; z += 8) BX(c, x - 0.3, 0, z - 0.3, x + 0.3, WH + 0.6, z + 0.3);
  if (s.snow) { flatc(c, "oklch(0.97 0.01 240)"); BX(c, -HW - 0.1, WH + 0.25, -HW - 0.1, HW + 0.1, WH + 0.35, -HW + WT + 0.1); BX(c, -HW - 0.1, WH + 0.25, HW - WT - 0.1, HW + 0.1, WH + 0.35, HW + 0.1); }
  gatehouse(c, s, L, fn); lectureRoof(c, s, L);
  paint(c, s.trimTex, s.trimCol); BX(c, LX1 - 0.1, LD[2], LD[0] - 0.4, LX1 + 0.25, LD[2] + 0.4, LD[1] + 0.4); BX(c, LX1, 0, LD[0] - 1, LX1 + 1.2, 0.18, LD[1] + 1);
  dorms(c, s, L, () => {}); tower(c, s, L, () => {}); windows(c, s, L);
  if (L <= 3) quad(c, s, L);
  if (L <= 2) lectureInside(c, s, L);
  c.albedo(null); c.emissive(null);
}
export function collider(c) {
  const s = S(c.params ?? {}), Lb = CB();
  wallRuns(Lb); gatehouse(null, s, 9, Lb); lecture(null, s, 9, Lb); dorms(null, s, 9, Lb); tower(null, s, 9, Lb);
  Lb(-2.6, 0, -2.6, 2.6, 0.6, 2.6); Lb(-HW + WT, -1, -HW + WT, HW - WT, 0.05, HW - WT); Lb(-GW, -1, -HW, GW, 0.05, -HW + WT); Lb(LX0 + LT, 0, LZ0 + LT, LX1 - LT, 0.35, LZ0 + 4); Lb(-6.2, -0.4, -6.2, 6.2, 0.05, 6.2);
  Lb(LX0 - 0.5, LH, LZ0 - 0.5, LX1 + 0.5, LH + 0.3, LZ1 + 0.5);
  return Lb.list;
}
