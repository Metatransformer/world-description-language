// The Reed-cutters' Steading (concept: art-reed-steading): a marsh family's holding on the salt flats, Aurenmar.
// A low fieldstone longhouse under a deep reed thatch, smoke from a hole at the ridge; a reed-stook yard and an A-frame
// drying rack hung with bundles; a plank walk on posts out west to a tidal channel where a flat-bottomed punt is tied;
// wicker eel traps stacked by the jetty; a little plank smokehouse for eels; a chopping block, a sickle on it.
// Local frame: +X east (land), -X west (the channel), -Z north. Ground (the pad) at local y=0. Door on the south (+Z) wall.
import { G, X, rng, TEX, mossyRock } from "../lib/geo.js";
const STONE = "oklch(0.66 0.02 95)", THATCH = "oklch(0.66 0.07 80)", THATCH2 = "oklch(0.56 0.06 75)", OAK = "oklch(0.42 0.03 60)",
  DRIFT = "oklch(0.66 0.02 80)", REED = "oklch(0.74 0.08 88)", REEDG = "oklch(0.6 0.09 120)", MUD = "oklch(0.4 0.03 70)",
  WATER = "oklch(0.48 0.04 220)", WICKER = "oklch(0.55 0.06 70)", SOOT = "oklch(0.25 0.01 60)";
const L = 12, W = 6, WH = 2.2, RH = 5.2, OV = 0.6; // longhouse length (x), width (z), wall height, ridge height, eave overhang
function beam(g, a, b, r, seg = 6) { g.tube([[...a, r], [...b, r]], seg); }
function stook(g, x, z, h, r) { g.tube([[x, 0, z, r], [x, h * 0.55, z, r * 0.55], [x, h * 0.8, z, r * 0.7], [x, h, z, 0.02]], 7, { capA: true, rough: (th) => 1 + 0.12 * Math.sin(th * 9) }); }
export function geometry(ctx) {
  const g = new G(ctx), lod = ctx.lod || 1, R = rng(2275);
  if (lod >= 5) { ctx.color(STONE); g.box(0, WH / 2, 0, L, WH, W); ctx.color(THATCH); g.box(0, WH + 1.4, 0, L + 1, 2.8, W - 1); ctx.color(WATER); g.box(-24, 0.02, 0, 5, 0.04, 40); ctx.color(null); return; }
  const seg = lod <= 2 ? 10 : 7;
  // the tidal channel and its mud banks, west
  ctx.albedo(null); ctx.color(MUD); g.box(-23.5, 0.01, 0, 9, 0.02, 44);
  ctx.color(WATER); g.box(-24.5, 0.03, 0, 5.5, 0.02, 44);
  // packed-mud yard and a worn path to the door
  ctx.color("oklch(0.47 0.04 75)"); g.box(0, 0.015, 6.5, 6, 0.02, 7); g.box(-6, 0.015, 4.5, 6, 0.02, 2.2);
  // reed beds fringing the channel
  if (lod <= 3) { const n = lod <= 2 ? 140 : 60;
    for (let i = 0; i < n; i++) { const z = -21 + R() * 42, x = -20.5 - R() * 1.6 + (R() < 0.3 ? -6.5 : 0), h = 1.4 + R() * 1.1, lean = (R() - 0.5) * 0.3;
      ctx.color(R() < 0.6 ? REEDG : REED); g.tube([[x, 0, z, 0.03], [x + lean, h, z + lean * 0.5, 0.01]], 3);
      if (R() < 0.4) { ctx.color("oklch(0.4 0.06 50)"); g.box(x + lean, h + 0.08, z + lean * 0.5, 0.05, 0.2, 0.05); } } }
  // ---- the longhouse: fieldstone walls
  ctx.albedo(TEX.fieldstone); ctx.color(STONE);
  g.box(0, WH / 2, -W / 2 + 0.3, L, WH, 0.6);                         // north wall
  g.box(-L / 2 + 0.3, WH / 2, 0, 0.6, WH, W - 1.2);                    // west wall
  g.box(L / 2 - 0.3, WH / 2, 0, 0.6, WH, W - 1.2);                     // east wall
  g.box(-L / 4 - 0.35, WH / 2, W / 2 - 0.3, L / 2 - 0.7, WH, 0.6);     // south wall, west of door
  g.box(L / 4 + 0.35, WH / 2, W / 2 - 0.3, L / 2 - 0.7, WH, 0.6);      // south wall, east of door
  g.box(0, WH - 0.2, W / 2 - 0.3, 1.4, 0.4, 0.6);                       // over the door
  // gable ends up into the thatch
  for (const sx of [-1, 1]) { const x = sx * (L / 2 - 0.3), o = sx * 0.3;
    g.quad([x + o, WH, -W / 2], [x + o, WH, W / 2], [x + o, RH - 0.6, 0.0001], [x + o, RH - 0.6, 0]);
    g.quad([x - o, WH, W / 2], [x - o, WH, -W / 2], [x - o, RH - 0.6, 0], [x - o, RH - 0.6, 0.0001]); }
  // footing stones along the base
  if (lod <= 3) for (let i = 0; i < 10; i++) { const s = 0.25 + R() * 0.2, along = -L / 2 + R() * L, side = R() < 0.5 ? -1 : 1;
    mossyRock(g, [along, s * 0.3, side * (W / 2 + 0.15)], [s * 1.4, s, s], 0, 300 + i, { rock: TEX.rock, moss: TEX.moss, mossAt: 0.6 }); }
  // the door: oak planks in a frame, iron strap hinges on the west side
  ctx.albedo(TEX.oak); ctx.color(OAK);
  g.box(0, 0.95, W / 2 - 0.02, 1.1, 1.9, 0.08);
  ctx.color("oklch(0.34 0.03 55)"); g.box(-0.62, 1.0, W / 2, 0.14, 2.0, 0.14); g.box(0.62, 1.0, W / 2, 0.14, 2.0, 0.14); g.box(0, 2.02, W / 2, 1.38, 0.14, 0.14);
  ctx.albedo(TEX.iron); ctx.color("oklch(0.3 0.01 60)"); g.box(-0.2, 1.5, W / 2 + 0.03, 0.7, 0.06, 0.02); g.box(-0.2, 0.45, W / 2 + 0.03, 0.7, 0.06, 0.02); g.box(0.4, 1.0, W / 2 + 0.04, 0.08, 0.08, 0.04);
  // small shuttered windows
  ctx.albedo(TEX.oak); ctx.color("oklch(0.38 0.03 60)");
  for (const x of [-3.6, 3.6]) { g.box(x, 1.35, W / 2 + 0.01, 0.8, 0.6, 0.06); ctx.color(SOOT); g.box(x, 1.35, W / 2 - 0.02, 0.6, 0.45, 0.06); ctx.color("oklch(0.38 0.03 60)"); }
  // ---- the reed thatch: two deep slopes, thick at the eaves, a bound ridge
  ctx.albedo(null);
  const eY = WH - 0.25, eZ = W / 2 + OV, x0 = -L / 2 - OV, x1 = L / 2 + OV;
  for (const sz of [-1, 1]) { ctx.color(sz < 0 ? THATCH2 : THATCH);
    const a = [x0, eY, sz * eZ], b = [x1, eY, sz * eZ], c = [x1, RH, 0], d = [x0, RH, 0];
    if (sz > 0) { g.quad(a, b, c, d); g.quad([x0, eY - 0.35, eZ], [x0, RH - 0.35, 0], [x1, RH - 0.35, 0], [x1, eY - 0.35, eZ]); }
    else { g.quad(a, d, c, b); g.quad([x0, eY - 0.35, -eZ], [x1, eY - 0.35, -eZ], [x1, RH - 0.35, 0], [x0, RH - 0.35, 0]); }
    ctx.color(THATCH2); g.box(0, eY - 0.18, sz * eZ, x1 - x0, 0.36, 0.12);              // the thick cut eave
    if (lod <= 3) { ctx.color(sz < 0 ? "oklch(0.52 0.055 75)" : "oklch(0.6 0.065 80)");    // course lines in the reed
      for (let k = 1; k < 5; k++) { const t = k / 5, y = eY + (RH - eY) * t + 0.03, z = sz * eZ * (1 - t);
        g.box(0, y, z, x1 - x0, 0.06, 0.18); } }
    ctx.color(null); }
  // gable-end thatch caps (hipped a little so the roof reads as reed, not board)
  for (const sx of [-1, 1]) { ctx.color(THATCH2); const x = sx * (L / 2 + OV);
    if (sx > 0) g.tri([x, eY, -eZ], [x, eY, eZ], [x - sx * 0.9, RH, 0]); else g.tri([x, eY, eZ], [x, eY, -eZ], [x - sx * 0.9, RH, 0]); }
  ctx.color("oklch(0.45 0.05 70)"); g.tube([[x0 + 0.3, RH + 0.05, 0, 0.22], [x1 - 0.3, RH + 0.05, 0, 0.22]], 6, { capA: true, capB: true });
  if (lod <= 3) { ctx.color("oklch(0.35 0.03 60)"); for (let i = 0; i < 9; i++) { const x = x0 + 0.8 + i * (x1 - x0 - 1.6) / 8; g.tube([[x, RH - 0.15, -0.25, 0.03], [x, RH + 0.3, 0, 0.03], [x, RH - 0.15, 0.25, 0.03]], 4); } }
  // smoke hole: a soot-dark louvre at the ridge, east end
  ctx.color(SOOT); g.box(3.2, RH + 0.3, 0, 0.9, 0.35, 0.9); ctx.color(THATCH2); g.box(3.2, RH + 0.55, 0, 1.2, 0.12, 1.2);
  // ---- reed stook yard, east of the house
  ctx.color(REED); const sk = lod <= 2 ? 14 : 7;
  for (let i = 0; i < sk; i++) { const x = L / 2 + 2.5 + (i % 4) * 1.6 + R() * 0.3, z = -3 + Math.floor(i / 4) * 1.8 + R() * 0.3; stook(g, x, z, 1.7 + R() * 0.4, 0.42 + R() * 0.08); }
  // drying rack: an A-frame of poles, a ridge pole, bundles hung on it, south-east
  { ctx.albedo(TEX.log); ctx.color(OAK); const rx = 4.5, rz = 7, RL = 6;
    for (const ex of [-RL / 2, RL / 2]) { beam(g, [rx + ex, 0, rz - 0.9], [rx + ex, 2.2, rz], 0.06); beam(g, [rx + ex, 0, rz + 0.9], [rx + ex, 2.2, rz], 0.06); }
    beam(g, [rx - RL / 2 - 0.2, 2.15, rz], [rx + RL / 2 + 0.2, 2.15, rz], 0.05);
    ctx.albedo(null); ctx.color(REED); const nb = lod <= 2 ? 10 : 5;
    for (let i = 0; i < nb; i++) { const x = rx - RL / 2 + 0.4 + i * (RL - 0.8) / (nb - 1), side = i % 2 ? 0.18 : -0.18;
      g.tube([[x, 2.1, rz + side, 0.05], [x, 1.6, rz + side * 1.6, 0.16], [x, 0.7 + R() * 0.2, rz + side * 2.2, 0.12]], 6, { capB: true });
      ctx.color("oklch(0.4 0.05 60)"); g.box(x, 1.95, rz + side, 0.2, 0.06, 0.2); ctx.color(REED); } }
  // ---- the plank walk on posts out to the channel, and its little jetty
  { ctx.albedo(TEX.oak); ctx.color(DRIFT); const z = 4.5, xa = -6.5, xb = -24;
    for (let x = xa; x > xb; x -= 0.5) g.box(x - 0.25, 0.32 + (R() - 0.5) * 0.03, z, 0.46, 0.06, 1.3 - R() * 0.15);
    ctx.color(OAK); for (let x = xa - 1; x > xb; x -= 2.2) for (const s of [-0.6, 0.6]) beam(g, [x, -0.4, z + s], [x, 0.3, z + s], 0.07);
    ctx.color(DRIFT); g.box(-24.5, 0.34, z, 3, 0.07, 3.2);                                   // the jetty head
    ctx.color(OAK); for (const [px, pz] of [[-23.2, z - 1.5], [-23.2, z + 1.5], [-25.8, z - 1.5], [-25.8, z + 1.5]]) beam(g, [px, -0.5, pz], [px, 0.9, pz], 0.09); }
  // ---- the punt, tied off the jetty: a flat-bottomed boat with raked ends and a quant pole across it
  g.at(X([-25.2, 0.05, 9.2], 8), () => { const PL2 = 6, PW = 1.2;
    ctx.albedo(TEX.oak); ctx.color("oklch(0.36 0.03 55)");
    g.box(0, 0.08, 0, PL2 - 1, 0.1, PW);
    for (const s of [-1, 1]) { g.box(0, 0.3, s * PW / 2, PL2 - 1, 0.4, 0.07);
      g.quad([s * (PL2 / 2 - 0.5), 0.05, -PW / 2], [s * (PL2 / 2 - 0.5), 0.05, PW / 2], [s * PL2 / 2, 0.5, PW / 2], [s * PL2 / 2, 0.5, -PW / 2]); }
    g.box(0.6, 0.35, 0, 0.3, 0.06, PW - 0.1);
    ctx.albedo(TEX.log); ctx.color(DRIFT); g.at(X([0, 0.45, 0.1], 0, 0, 4), () => beam(g, [-3.6, 0, 0], [3.8, 0, 0], 0.035));
    ctx.albedo(null); ctx.color(REED); for (let i = 0; i < 3; i++) stook(g, -1.4 + i * 0.5, 0, 0.0001, 0.01), g.tube([[-1.9 + i * 0.45, 0.3, -0.25, 0.14], [-0.6 + i * 0.45, 0.3, -0.2, 0.14]], 6, { capA: true, capB: true }); });
  ctx.albedo(null); ctx.color("oklch(0.5 0.04 70)"); g.tube([[-25.8, 0.75, 6, 0.015], [-25.6, 0.3, 7.4, 0.015], [-25.3, 0.15, 8.2, 0.015]], 3);  // the mooring rope
  // ---- eel traps: tapered wicker baskets stacked on the walk and by the water
  { ctx.color(WICKER); const traps = [[-12, 0.35, 5.6, 0], [-12.6, 0.35, 5.8, 20], [-12.3, 0.8, 5.7, 10], [-22.6, 0.4, 2.6, 80], [-21.8, 0.05, -1, 60]];
    for (const [x, y, z, yaw] of traps) g.at(X([x, y + 0.3, z], yaw), () => {
      g.tube([[-0.6, 0, 0, 0.3], [-0.1, 0, 0, 0.32], [0.45, 0, 0, 0.18], [0.7, 0, 0, 0.05]], 8, { capB: true, rough: (th, k) => 1 + 0.04 * Math.sin(th * 14 + k * 3) });
      if (lod <= 3) { ctx.color("oklch(0.45 0.05 65)"); for (const rx of [-0.45, -0.05, 0.35]) g.tube([[rx, 0.31 - Math.abs(rx) * 0.1, 0, 0.02], [rx, 0, 0.31 - Math.abs(rx) * 0.1, 0.02], [rx, -0.31 + Math.abs(rx) * 0.1, 0, 0.02], [rx, 0, -0.31 + Math.abs(rx) * 0.1, 0.02], [rx, 0.31 - Math.abs(rx) * 0.1, 0, 0.02]], 3); ctx.color(WICKER); } }); }
  // ---- the eel smokehouse: a plank box, lapped boards, a turf lid with a smoke vent, north-west of the house
  g.at(X([-9.5, 0, -4.5], 12), () => { ctx.albedo(TEX.oak); ctx.color("oklch(0.34 0.025 55)");
    g.box(0, 1.0, 0, 2.4, 2.0, 2.2);
    if (lod <= 3) { ctx.color("oklch(0.3 0.02 55)"); for (let y = 0.25; y < 2; y += 0.35) g.box(0, y, 1.12, 2.44, 0.05, 0.04); }
    ctx.color(SOOT); g.box(0, 2.2, 0, 2.7, 0.3, 2.5);
    ctx.albedo(TEX.moss); ctx.color("oklch(0.45 0.07 130)"); g.box(0, 2.4, 0, 2.6, 0.12, 2.4);
    ctx.albedo(null); ctx.color(SOOT); g.box(0.5, 2.6, -0.3, 0.45, 0.4, 0.45);
    ctx.color("oklch(0.3 0.02 55)"); g.box(0, 0.8, 1.12, 0.8, 1.5, 0.05); });
  // ---- chopping block and sickle, by the door; a water butt
  ctx.albedo(TEX.log); ctx.color(OAK); g.tube([[2.2, 0, 4.4, 0.32], [2.2, 0.55, 4.4, 0.3]], 8, { capB: true });
  ctx.albedo(TEX.iron); ctx.color("oklch(0.5 0.01 60)"); g.tube([[2.05, 0.58, 4.3, 0.015], [2.25, 0.58, 4.15, 0.015], [2.45, 0.58, 4.3, 0.015], [2.5, 0.58, 4.5, 0.012]], 3);
  ctx.albedo(TEX.oak); ctx.color("oklch(0.4 0.03 55)"); g.tube([[-5.3, 0, 3.7, 0.38], [-5.3, 0.5, 3.7, 0.42], [-5.3, 0.95, 3.7, 0.38]], 10, { capA: true, capB: true });
  ctx.albedo(null); ctx.color(WATER); g.box(-5.3, 0.97, 3.7, 0.55, 0.02, 0.55);
  ctx.color(null); ctx.albedo(null);
}
export function collider() {
  return [
    { kind: "box", width: L, height: WH, depth: 0.6, center: [0, WH / 2, -W / 2 + 0.3] },
    { kind: "box", width: 0.6, height: WH, depth: W, center: [-L / 2 + 0.3, WH / 2, 0] },
    { kind: "box", width: 0.6, height: WH, depth: W, center: [L / 2 - 0.3, WH / 2, 0] },
    { kind: "box", width: L, height: WH, depth: 0.6, center: [0, WH / 2, W / 2 - 0.3] },
    { kind: "box", width: L + 1, height: RH - WH, depth: W, center: [0, WH + (RH - WH) / 2, 0] },
    { kind: "box", width: 2.6, height: 2.4, depth: 2.4, center: [-9.5, 1.2, -4.5] },
    { kind: "box", width: 17.5, height: 0.36, depth: 1.3, center: [-15.25, 0.18, 4.5] },
    { kind: "box", width: 3, height: 0.37, depth: 3.2, center: [-24.5, 0.185, 4.5] },
    { kind: "box", width: 6.2, height: 2.2, depth: 2, center: [4.5, 1.1, 7] },
  ];
}
