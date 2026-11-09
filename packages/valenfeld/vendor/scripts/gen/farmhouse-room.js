// FARMHOUSE ROOM kit: the inside of a Valenfeld farmhouse, one lived-in kitchen and living room, 9 x 7 m, ceiling 3 m.
// Origin = floor centre (floor top y 0.05); the door gap is in the -Z wall at x 0 (the exit door stands in it), the hearth
// on the +Z wall left of centre, a window in the +X wall and one in the -Z wall. Fixed furnishing is drawn here:
// hearth, long table and benches, cups (one half full), rug, shelves of jars, hanging herbs and onions, grain sacks,
// butter churn, bed, loft ladder. Containers, the fire, lights and people are their own rows in the place's cell.
import BK from "../lib/data/building-kit.json";
const T = BK.textures, C = BK.tints;
const W = 4.5, D = 3.5, H = 3.0, WT = 0.3, F = 0.05;
function rng(s) { return () => (s = (s * 16807) % 2147483647) / 2147483647; }
// PARAMS (Codex Kits; {} = the room as built): table (rug, table, benches, the cups), larder (jar shelves, hanging herbs,
// grain sacks, churn), bed, ladder, tools = false leaves that part out; seed varies the board wear. The shell and hearth always stand.
let P = {}; const on = (k) => P[k] !== false;
export function geometry(c) {
  P = c.params ?? {};
  const L = c.lod ?? 1, R = rng((c.params ?? {}).seed ?? 7);
  const tex = (t, col) => { c.albedo(t); c.color(col); c.emissive(null); };
  const flat = (col) => { c.albedo(null); c.color(col); c.emissive(null); };
  const glow = (col, e) => { c.albedo(null); c.color(col); c.emissive(...e); };
  const HX = (p) => { const q = (a, b, d, e) => c.quad(...p[a], ...p[b], ...p[d], ...p[e]); q(2, 1, 5, 6); q(0, 3, 7, 4); q(3, 2, 6, 7); q(1, 0, 4, 5); q(7, 6, 5, 4); q(0, 1, 2, 3); };
  const BX = (x0, y0, z0, x1, y1, z1) => HX([[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]]);
  const RB = (cx, cy, cz, w, h, d, yaw = 0, roll = 0) => { const Y = yaw * Math.PI / 180, Rr = roll * Math.PI / 180;
    const t = (x, y, z) => { const x1 = x * Math.cos(Rr) - y * Math.sin(Rr), y1 = x * Math.sin(Rr) + y * Math.cos(Rr); return [cx + x1 * Math.cos(Y) + z * Math.sin(Y), cy + y1, cz - x1 * Math.sin(Y) + z * Math.cos(Y)]; };
    const a = w / 2, b = h / 2, e = d / 2; HX([t(-a, -b, -e), t(a, -b, -e), t(a, -b, e), t(-a, -b, e), t(-a, b, -e), t(a, b, -e), t(a, b, e), t(-a, b, e)]); };
  const LA = (cx, y0, cz, prof, n = L <= 2 ? 12 : 7) => { const P = (i, k) => { const a = (k % n) / n * Math.PI * 2; return [cx + prof[i][0] * Math.cos(a), y0 + prof[i][1], cz + prof[i][0] * Math.sin(a)]; };
    c.smooth(); for (let i = 0; i < prof.length - 1; i++) for (let k = 0; k < n; k++) c.quad(...P(i, k + 1), ...P(i, k), ...P(i + 1, k), ...P(i + 1, k + 1)); c.flat?.();
    const l = prof.length - 1, A = [cx, y0 + prof[l][1], cz]; for (let k = 0; k < n; k++) c.tri(...A, ...P(l, k + 1), ...P(l, k)); };

  // ---- floor: wide oak boards, flagstones before the hearth
  tex(T.oak, "oklch(0.86 0.03 65)");
  for (let x = -W; x < W - 0.01; x += 0.36) BX(x, -0.2, -D, Math.min(W, x + 0.35), F - (R() * 0.008), D);
  tex(T.flagstone, C.stone); BX(-3.0, F, 1.9, -0.2, F + 0.03, D);
  // ---- walls: stone base course, lime plaster, oak posts and a plate
  const wallZ = (z, x0, x1, holes) => { // a wall along x at inner face z (outer side away from room), holes [[x0,x1,y0,y1]]
    const s = Math.sign(z), z0 = s > 0 ? z : z - WT, z1 = s > 0 ? z + WT : z;
    let cut = [x0]; holes.forEach(h => cut.push(h[0], h[1])); cut.push(x1);
    tex(T.plaster, "oklch(0.8 0.03 75)");
    for (let i = 0; i < cut.length; i += 2) BX(cut[i], 0.35, z0, cut[i + 1], H, z1);
    holes.forEach(h => { BX(h[0], 0.35, z0, h[1], h[2], z1); BX(h[0], h[3], z0, h[1], H, z1); });
    tex(T.fieldstone, C.stone); BX(x0, F, s > 0 ? z - 0.04 : z - WT, x1, 0.35, s > 0 ? z + WT : z + 0.04); };
  const wallX = (x, z0, z1, holes) => { const s = Math.sign(x), x0 = s > 0 ? x : x - WT, x1 = s > 0 ? x + WT : x;
    let cut = [z0]; holes.forEach(h => cut.push(h[0], h[1])); cut.push(z1);
    tex(T.plaster, "oklch(0.8 0.03 75)");
    for (let i = 0; i < cut.length; i += 2) BX(x0, 0.35, cut[i], x1, H, cut[i + 1]);
    holes.forEach(h => { BX(x0, 0.35, h[0], x1, h[2], h[1]); BX(x0, h[3], h[0], x1, H, h[1]); });
    tex(T.fieldstone, C.stone); BX(s > 0 ? x - 0.04 : x - WT, F, z0, s > 0 ? x + WT : x + 0.04, 0.35, z1); };
  wallZ(-D, -W - WT, W + WT, [[-0.7, 0.7, 0.35, 2.35], [-3.1, -2.1, 1.05, 2.0]]);
  wallZ(D, -W - WT, W + WT, []);
  wallX(W, -D, D, [[-1.1, -0.1, 1.0, 2.05]]);
  wallX(-W, -D, D, []);
  // door gap: oak frame and a dark board backing behind the leaf
  tex(T.oak, C.wood); BX(-0.85, F, -D - 0.06, -0.7, 2.5, -D + 0.04); BX(0.7, F, -D - 0.06, 0.85, 2.5, -D + 0.04); BX(-0.85, 2.35, -D - 0.06, 0.85, 2.5, -D + 0.04);
  flat("oklch(0.18 0.02 50)"); BX(-0.7, F, -D - WT, 0.7, 2.35, -D - WT + 0.03);
  // posts and wall plate
  tex(T.oak, "oklch(0.7 0.04 55)");
  for (const [x, z] of [[-W, -D], [W, -D], [-W, D], [W, D]]) BX(x - 0.12, F, z - 0.12, x + 0.12, H, z + 0.12);
  for (const x of [-2.25, 2.25]) { BX(x - 0.1, 0.35, -D - 0.02, x + 0.1, H, -D + 0.1); BX(x - 0.1, 0.35, D - 0.1, x + 0.1, H, D + 0.02); }
  BX(-W, H - 0.22, -D, W, H, -D + 0.14); BX(-W, H - 0.22, D - 0.14, W, H, D); BX(-W, H - 0.22, -D, -W + 0.14, H, D); BX(W - 0.14, H - 0.22, -D, W, H, D);
  // ---- ceiling: plaster between smoke-dark beams, a loft hatch over the ladder
  tex(T.plaster, "oklch(0.6 0.03 65)"); BX(-W - WT, H, -D - WT, W + WT, H + 0.15, D + WT);
  tex(T.oak, "oklch(0.55 0.04 50)");
  for (let x = -3.6; x <= 3.7; x += 1.2) BX(x - 0.1, H - 0.24, -D, x + 0.1, H, D);
  BX(-W, H - 0.3, -0.12, W, H - 0.24, 0.12);
  flat("oklch(0.12 0.01 50)"); BX(-4.35, H - 0.005, 1.7, -3.65, H + 0.001, 2.6);
  tex(T.oak, "oklch(0.6 0.04 50)"); BX(-4.4, H - 0.06, 1.65, -3.6, H - 0.005, 1.72); BX(-4.4, H - 0.06, 2.58, -3.6, H - 0.005, 2.65);
  // ---- windows: deep reveals, oak sill and mullion cross, glass lit by the day outside
  const pane = (pts) => { glow("#dfe8f0", [0.85, 0.92, 1.05]); BX(...pts); };
  pane([W + 0.18, 1.0, -1.1, W + 0.2, 2.05, -0.1]);
  tex(T.oak, C.wood); BX(W - 0.06, 0.94, -1.2, W + 0.05, 1.0, 0); BX(W + 0.1, 1.0, -0.63, W + 0.18, 2.05, -0.57); BX(W + 0.1, 1.5, -1.1, W + 0.18, 1.56, -0.1);
  pane([-3.1, 1.05, -D - 0.2, -2.1, 2.0, -D - 0.18]);
  tex(T.oak, C.wood); BX(-3.2, 0.99, -D - 0.05, -2.0, 1.05, -D + 0.06); BX(-2.63, 1.05, -D - 0.18, -2.57, 2.0, -D - 0.1); BX(-3.1, 1.5, -D - 0.18, -2.1, 1.56, -D - 0.1);
  if (L <= 2) { flat("oklch(0.55 0.12 30)"); for (let i = 0; i < 3; i++) LA(-2.9 + i * 0.4, 1.05, -D + 0.02, [[0.05, 0], [0.065, 0.05], [0.05, 0.12], [0.055, 0.13]]);
    flat("oklch(0.6 0.13 140)"); for (let i = 0; i < 3; i++) LA(-2.9 + i * 0.4, 1.18, -D + 0.02, [[0.03, 0], [0.09, 0.08], [0.06, 0.16], [0.0, 0.2]], 6); }
  // ---- hearth: fieldstone chimney breast, firebox, hearthstone, oak mantel, logs, a pot on a crane
  const HXc = -1.6;
  tex(T.fieldstone, C.stone);
  BX(HXc - 1.1, F, D - 0.7, HXc - 0.45, H, D); BX(HXc + 0.45, F, D - 0.7, HXc + 1.1, H, D); BX(HXc - 0.45, 1.25, D - 0.7, HXc + 0.45, H, D);
  BX(HXc - 1.2, F, D - 1.15, HXc + 1.2, 0.22, D - 0.6);                                   // raised hearthstone
  flat("oklch(0.16 0.01 40)"); BX(HXc - 0.45, 0.22, D - 0.25, HXc + 0.45, 1.25, D); BX(HXc - 0.45, 0.22, D - 0.7, HXc + 0.45, 0.23, D - 0.25);
  flat("oklch(0.2 0.01 40)"); BX(HXc - 0.46, 1.1, D - 0.7, HXc + 0.46, 1.25, D - 0.25);   // soot under the lintel
  tex(T.oak, "oklch(0.6 0.04 50)"); BX(HXc - 1.25, 1.35, D - 0.85, HXc + 1.25, 1.5, D - 0.55);
  tex(T.oak, "oklch(0.55 0.05 50)"); RB(HXc - 0.1, 0.32, D - 0.45, 0.7, 0.13, 0.13, 25); RB(HXc + 0.1, 0.32, D - 0.48, 0.7, 0.13, 0.13, -30); RB(HXc, 0.43, D - 0.45, 0.6, 0.11, 0.11, 90);
  glow("#ff8a3a", [2.4, 0.9, 0.25]); BX(HXc - 0.35, 0.23, D - 0.6, HXc + 0.35, 0.27, D - 0.3);
  tex(T.iron, C.iron); BX(HXc + 0.38, 0.23, D - 0.32, HXc + 0.42, 1.05, D - 0.28); BX(HXc - 0.05, 1.0, D - 0.32, HXc + 0.42, 1.04, D - 0.28); BX(HXc - 0.01, 0.82, D - 0.31, HXc + 0.01, 1.0, D - 0.29);
  flat("oklch(0.22 0.005 250)"); LA(HXc, 0.58, D - 0.3, [[0.0, 0], [0.13, 0.03], [0.17, 0.12], [0.16, 0.22], [0.14, 0.24]]);
  if (L <= 2) { // mantel: a candle, a crock, a plate standing
    flat("oklch(0.93 0.03 90)"); LA(HXc - 0.9, 1.5, D - 0.7, [[0.03, 0], [0.03, 0.16]], 6); glow("#ffcc77", [2.2, 1.4, 0.5]); LA(HXc - 0.9, 1.66, D - 0.7, [[0.01, 0], [0.012, 0.02], [0, 0.05]], 5);
    flat("oklch(0.55 0.08 50)"); LA(HXc + 0.8, 1.5, D - 0.7, [[0.07, 0], [0.09, 0.08], [0.07, 0.18], [0.05, 0.2]]);
    flat("oklch(0.75 0.03 220)"); RB(HXc + 0.2, 1.65, D - 0.62, 0.3, 0.3, 0.02, 0); }
  if (on("table")) {
  // ---- rug under the table
  flat("oklch(0.42 0.1 30)"); BX(-1.0, F, -1.15, 2.2, F + 0.012, 1.55);
  flat("oklch(0.7 0.1 80)"); BX(-0.85, F + 0.012, -1.0, 2.05, F + 0.016, 1.4);
  flat("oklch(0.38 0.08 30)"); BX(-0.7, F + 0.016, -0.85, 1.9, F + 0.02, 1.25);
  flat("oklch(0.5 0.07 150)"); BX(0.4, F + 0.02, -0.2, 0.8, F + 0.023, 0.6);
  // ---- long table, trestles, two benches
  const TX0 = -0.6, TX1 = 1.8, TZ0 = -0.25, TZ1 = 0.65, TY = 0.78;
  tex(T.oak, "oklch(0.78 0.04 60)"); BX(TX0, TY - 0.06, TZ0, TX1, TY, TZ1);
  tex(T.oak, "oklch(0.66 0.04 55)");
  for (const x of [TX0 + 0.25, TX1 - 0.25]) { BX(x - 0.06, F, TZ0 + 0.1, x + 0.06, TY - 0.06, TZ0 + 0.22); BX(x - 0.06, F, TZ1 - 0.22, x + 0.06, TY - 0.06, TZ1 - 0.1); BX(x - 0.07, TY - 0.14, TZ0 + 0.05, x + 0.07, TY - 0.06, TZ1 - 0.05); BX(x - 0.07, F, TZ0 + 0.05, x + 0.07, F + 0.08, TZ1 - 0.05); }
  BX(TX0 + 0.25, 0.3, 0.17, TX1 - 0.25, 0.38, 0.23);
  for (const z of [-0.65, 1.05]) { BX(TX0 + 0.1, 0.41, z - 0.15, TX1 - 0.1, 0.46, z + 0.15);
    for (const x of [TX0 + 0.3, TX1 - 0.3]) BX(x - 0.05, F, z - 0.12, x + 0.05, 0.41, z + 0.12); }
  // on the table: two pewter cups (one half full of ale, one drained), a loaf, cheese, a board, a candle
  const cup = (x, z, fill) => { flat("oklch(0.68 0.01 250)"); LA(x, TY, z, [[0.0, 0], [0.045, 0], [0.047, 0.11], [0.042, 0.11], [0.04, 0.012]].map(([r, y]) => [r, y]), 12);
    BX(x + 0.045, TY + 0.03, z - 0.01, x + 0.075, TY + 0.09, z + 0.01);
    if (fill > 0) { glow("#8a5a1a", [0.18, 0.1, 0.02]); LA(x, TY + 0.011, z, [[0.041, 0], [0.042, fill * 0.098], [0, fill * 0.098]], 12);
      flat("oklch(0.92 0.03 90)"); LA(x, TY + 0.011 + fill * 0.098, z, [[0.042, 0], [0.03, 0.004], [0, 0.005]], 12); }
    else { flat("oklch(0.25 0.01 250)"); LA(x, TY + 0.012, z, [[0.04, 0], [0, 0.001]], 10); } };
  cup(0.15, 0.05, 0.5); cup(1.25, 0.4, 0);
  tex(T.oak, "oklch(0.75 0.05 60)"); BX(0.45, TY, 0.05, 0.95, TY + 0.025, 0.4);
  flat("oklch(0.62 0.12 60)"); LA(0.62, TY + 0.025, 0.22, [[0.11, 0], [0.12, 0.04], [0.09, 0.09], [0.0, 0.11]]);
  flat("oklch(0.86 0.12 90)"); HX([[0.8, TY + 0.025, 0.15], [0.92, TY + 0.025, 0.15], [0.92, TY + 0.025, 0.32], [0.8, TY + 0.025, 0.32], [0.8, TY + 0.1, 0.15], [0.86, TY + 0.1, 0.15], [0.86, TY + 0.1, 0.32], [0.8, TY + 0.1, 0.32]]);
  flat("oklch(0.4 0.02 60)"); LA(1.6, TY, 0.1, [[0.05, 0], [0.05, 0.02], [0.02, 0.025]], 8);
  flat("oklch(0.93 0.03 90)"); LA(1.6, TY + 0.02, 0.1, [[0.022, 0], [0.022, 0.12]], 6); glow("#ffcc77", [2.4, 1.5, 0.5]); LA(1.6, TY + 0.14, 0.1, [[0.008, 0], [0.01, 0.015], [0, 0.04]], 5);
  }
  if (on("larder")) {
  // ---- shelves of jars on the -X wall
  const SX = -W + 0.02, SZ0 = -1.9, SZ1 = 0.7;
  tex(T.oak, "oklch(0.7 0.04 55)");
  for (const y of [0.95, 1.5, 2.05]) { BX(SX, y - 0.04, SZ0, SX + 0.34, y, SZ1); for (const z of [SZ0 + 0.15, SZ1 - 0.15]) RB(SX + 0.06, y - 0.15, z, 0.1, 0.22, 0.04, 0, -30); }
  if (L <= 3) { const JC = ["oklch(0.72 0.14 70)", "oklch(0.55 0.12 30)", "oklch(0.6 0.1 130)", "oklch(0.6 0.06 50)", "oklch(0.8 0.05 90)", "oklch(0.45 0.08 20)"];
    for (const y of [0.95, 1.5, 2.05]) for (let z = SZ0 + 0.12; z < SZ1 - 0.1; z += 0.17 + R() * 0.1) {
      const h = 0.12 + R() * 0.16, r = 0.05 + R() * 0.03, x = SX + 0.17, crock = R() < 0.35;
      flat(JC[Math.floor(R() * JC.length)]);
      if (crock) LA(x, y, z, [[r * 0.8, 0], [r, h * 0.4], [r * 0.85, h * 0.85], [r * 0.6, h], [r * 0.65, h * 1.05], [0, h * 1.06]]);
      else { LA(x, y, z, [[r, 0], [r, h * 0.85], [r * 0.7, h * 0.95], [0, h * 0.96]]); flat("oklch(0.88 0.03 85)"); LA(x, y + h * 0.95, z, [[r * 0.8, 0], [r * 0.85, 0.03], [0, 0.04]], 8); } } }
  // ---- hanging herbs from the beam by the hearth, onion strings by the window
  const rope = (x, y0, y1, z) => { flat("oklch(0.6 0.05 70)"); BX(x - 0.008, y1, z - 0.008, x + 0.008, y0, z + 0.008); };
  if (L <= 3) {
    const HC = ["oklch(0.5 0.09 135)", "oklch(0.58 0.08 110)", "oklch(0.55 0.1 85)", "oklch(0.45 0.06 140)", "oklch(0.6 0.12 320)"];
    for (let i = 0; i < 9; i++) { const x = -3.6 + i * 0.33, z = -0.02 + (i % 2 ? 0.08 : -0.08), y1 = 2.38 - R() * 0.15; rope(x, H - 0.3, y1, z);
      flat(HC[i % HC.length]); LA(x, y1 - 0.38, z, [[0.0, 0], [0.07 + R() * 0.03, 0.18], [0.04, 0.34], [0.015, 0.4]], 7); }
    for (const [x, z] of [[2.55, -1.2], [3.2, 1.0], [3.75, -1.6]]) { rope(x, H - 0.24, 1.75, z);
      for (let k = 0; k < 7; k++) { const y = 1.8 + k * 0.1, s = k % 2 ? 1 : -1; flat(k % 3 ? "oklch(0.72 0.11 70)" : "oklch(0.6 0.12 40)");
        LA(x + s * 0.04, y, z + (k % 3 - 1) * 0.03, [[0.0, -0.02], [0.05, 0.03], [0.04, 0.07], [0.0, 0.11]], 7); } }
    flat("oklch(0.4 0.02 60)"); rope(1.6, H - 0.24, 2.2, 0.2); tex(T.iron, C.iron); LA(1.6, 2.08, 0.2, [[0.0, 0], [0.08, 0.02], [0.1, 0.12], [0.06, 0.16], [0, 0.17]], 8); glow("#ffcc80", [2.0, 1.3, 0.5]); LA(1.6, 2.1, 0.2, [[0.05, 0], [0.06, 0.08], [0.0, 0.1]], 8);
  }
  // ---- grain sacks and an open sack in the front +X corner
  const sack = (x, z, h, col, open) => { flat(col); LA(x, F, z, [[0.18, 0], [0.24, 0.08], [0.25, h * 0.5], [0.21, h * 0.85], open ? [0.2, h] : [0.08, h], open ? [0.0, h * 0.97] : [0.04, h + 0.1]], 9);
    if (open) { flat("oklch(0.8 0.1 85)"); LA(x, F + h * 0.97, z, [[0.19, 0], [0.1, 0.05], [0, 0.07]], 9); } };
  sack(3.85, -2.95, 0.7, "oklch(0.72 0.05 80)", false); sack(3.35, -3.0, 0.62, "oklch(0.68 0.05 75)", false); sack(3.85, -2.35, 0.6, "oklch(0.74 0.05 82)", true);
  if (L <= 2) { flat("oklch(0.72 0.05 80)"); RB(3.6, F + 0.84, -2.95, 0.7, 0.24, 0.4, 20); }
  // ---- butter churn beside the hearth
  tex(T.oak, "oklch(0.8 0.04 65)"); LA(0.05, F, 2.9, [[0.0, 0], [0.22, 0], [0.2, 0.45], [0.16, 0.85], [0.17, 0.88], [0.0, 0.88]]);
  tex(T.iron, C.iron); for (const [y, r] of [[0.1, 0.222], [0.5, 0.195], [0.8, 0.168]]) LA(0.05, F + y, 2.9, [[r, 0], [r, 0.04], [0, 0.04]], 12);
  tex(T.oak, "oklch(0.7 0.04 60)"); BX(0.03, F + 0.88, 2.88, 0.07, F + 1.4, 2.92); BX(-0.07, F + 1.4, 2.88, 0.17, F + 1.44, 2.92);
  }
  if (on("bed")) {
  // ---- bed in the back +X corner: oak frame, straw tick, wool blanket, pillow; a stool beside it
  const BX0 = 3.3, BX1 = W - 0.05, BZ0 = 1.25, BZ1 = D - 0.05;
  tex(T.oak, "oklch(0.68 0.04 55)"); BX(BX0, 0.2, BZ0, BX1, 0.32, BZ1);
  for (const [x, z] of [[BX0, BZ0], [BX1 - 0.1, BZ0], [BX0, BZ1 - 0.1], [BX1 - 0.1, BZ1 - 0.1]]) BX(x, F, z, x + 0.1, z > 3 ? 1.0 : 0.55, z + 0.1);
  BX(BX0, 0.5, BZ1 - 0.08, BX1, 0.92, BZ1 - 0.02);
  flat("oklch(0.85 0.04 85)"); BX(BX0 + 0.05, 0.32, BZ0 + 0.05, BX1 - 0.05, 0.47, BZ1 - 0.1);
  flat("oklch(0.45 0.09 255)"); BX(BX0 + 0.02, 0.47, BZ0 + 0.02, BX1 - 0.02, 0.53, BZ0 + 1.35); BX(BX0 - 0.03, 0.2, BZ0 + 0.02, BX0 + 0.02, 0.53, BZ0 + 1.35);
  flat("oklch(0.7 0.1 70)"); BX(BX0 + 0.02, 0.531, BZ0 + 0.25, BX1 - 0.02, 0.535, BZ0 + 0.35); BX(BX0 + 0.02, 0.531, BZ0 + 0.9, BX1 - 0.02, 0.535, BZ0 + 1.0);
  flat("oklch(0.93 0.02 85)"); RB((BX0 + BX1) / 2, 0.55, BZ1 - 0.35, 0.75, 0.13, 0.35);
  tex(T.oak, "oklch(0.72 0.04 60)"); LA(2.85, F, 3.0, [[0.16, 0.38], [0.17, 0.42], [0.0, 0.43]], 10); for (const a of [0, 2.1, 4.2]) RB(2.85 + Math.cos(a) * 0.1, F + 0.19, 3.0 + Math.sin(a) * 0.1, 0.04, 0.38, 0.04);
  }
  if (on("ladder")) {
  // ---- ladder up to the loft hatch
  tex(T.oak, "oklch(0.7 0.04 60)");
  for (const z of [1.8, 2.5]) RB(-4.15, 1.55, z, 0.07, 3.1, 0.07, 0, -9);
  for (let i = 0; i < 9; i++) { const y = 0.3 + i * 0.32; BX(-4.18 + (y - 1.55) * Math.tan(9 * Math.PI / 180) - 0.025, y, 1.8, -4.18 + (y - 1.55) * Math.tan(9 * Math.PI / 180) + 0.025, y + 0.05, 2.5); }
  }
  if (on("tools")) {
  // ---- tools by the door: a broom and a pitchfork leaning
  tex(T.oak, "oklch(0.72 0.04 60)"); RB(-1.05, 0.75, -D + 0.12, 0.035, 1.5, 0.035, 0, 6); flat("oklch(0.75 0.09 85)"); LA(-1.13, F, -D + 0.14, [[0.12, 0], [0.06, 0.32], [0.02, 0.38]], 8);
  tex(T.oak, "oklch(0.72 0.04 60)"); RB(1.15, 0.8, -D + 0.12, 0.035, 1.6, 0.035, 0, -5); tex(T.iron, C.iron); for (const d of [-0.07, 0, 0.07]) RB(1.08 + d, 1.72, -D + 0.12, 0.015, 0.32, 0.015, 0, -5); RB(1.08, 1.56, -D + 0.12, 0.18, 0.025, 0.025, 0, -5);
  }
}
export function collider(c) {
  P = c?.params ?? {};
  const b = (x0, y0, z0, x1, y1, z1) => ({ kind: "box", width: x1 - x0, height: y1 - y0, depth: z1 - z0, center: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2] });
  return [
    b(-W - WT, -0.4, -D - WT, W + WT, F, D + WT),                 // floor
    b(-W - WT, F, -D - WT, W + WT, H, -D), b(-W - WT, F, D, W + WT, H, D + WT), b(W, F, -D, W + WT, H, D), b(-W - WT, F, -D, -W, H, D),
    b(-W - WT, H, -D - WT, W + WT, H + 0.3, D + WT),              // ceiling
    b(-2.7, F, D - 0.7, -0.5, H, D), b(-2.8, F, D - 1.15, -0.4, 0.22, D - 0.6),   // hearth
    ...(on("table") ? [b(-0.6, 0.0, -0.25, 1.8, 0.78, 0.65), b(-0.5, 0, -0.8, 1.7, 0.46, -0.5), b(-0.5, 0, 0.9, 1.7, 0.46, 1.2)] : []),   // table, benches
    ...(on("bed") ? [b(3.3, 0, 1.25, W, 0.55, D)] : []),
    ...(on("larder") ? [b(-W, 0, -1.9, -W + 0.36, 2.1, 0.7), b(-0.17, 0, 2.68, 0.27, 0.95, 3.12), b(3.1, 0, -3.3, W, 0.75, -2.1)] : []),   // shelves, churn, sacks
  ];
}
