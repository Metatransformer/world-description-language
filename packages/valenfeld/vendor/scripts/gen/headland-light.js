// Headland Light (concept: art-aur-headland-light). A squat lime-washed fieldstone lighthouse on the
// headland south of Witness Cove, rust weeping from its iron, a glazed lantern room on a corbelled
// gallery; the keeper's slate-roofed cottage leans on its east flank (door on +Z, a warp-in interior);
// a drystone yard in front with a gate, a fish-drying rack, a woodpile and the keeper's clutter.
// Local frame: front +Z (the path comes up to the gate), tower at x -4, cottage x -1.5..8.5.
import { G, rng, TEX, mossyRock } from "../lib/geo.js";
const TW = [-4, 0], R0 = 3.4, R1 = 2.4, TH = 13;                 // tower centre, base / top radius, height (my picks)
const CX0 = -1.5, CX1 = 8.5, CZ = 3, CH = 3.0, RIDGE = 5.3;      // cottage box and roof
const DOOR = { x: 4.5, w: 1.2, h: 2.2 };
const LIME = "oklch(0.97 0.02 90)", STONE = "oklch(0.93 0.01 80)", OAK = "oklch(0.75 0.02 60)", IRON = "oklch(0.55 0.03 60)";
const rotY = (a) => [Math.cos(a), 0, Math.sin(a), 0, 1, 0, -Math.sin(a), 0, Math.cos(a)];
const at = (g, m, t, f) => g.at({ m, t }, f);
const rTower = (y) => R0 + (R1 - R0) * (y / TH);
function loft(g, rings, n) { // rings: [y, r][], a closed surface of revolution round the tower axis
  for (let i = 0; i + 1 < rings.length; i++) for (let k = 0; k < n; k++) {
    const a0 = k / n * 6.2832, a1 = (k + 1) / n * 6.2832, [y0, r0] = rings[i], [y1, r1] = rings[i + 1];
    const P = (a, y, r) => [TW[0] + Math.sin(a) * r, y, TW[1] + Math.cos(a) * r];
    g.quad(P(a0, y0, r0), P(a1, y0, r0), P(a1, y1, r1), P(a0, y1, r1));
  }
}
export function geometry(ctx) {
  const g = new G(ctx), lod = ctx.lod || 1, R = rng(1659);
  if (lod >= 5) { ctx.color(LIME); g.box(TW[0], TH / 2, 0, 5.6, TH, 5.6); g.box(3.5, 2.2, 0, 10, 4.4, 6); ctx.color(null); return; }
  const N = lod <= 1 ? 28 : lod <= 2 ? 18 : 10;
  // ---- the tower: lime-washed fieldstone, a plinth course at its foot
  ctx.smooth(); ctx.albedo(TEX.fieldstone);
  ctx.color(STONE); loft(g, [[-0.6, R0 + 0.35], [0.7, R0 + 0.3], [0.7, R0]], N);
  ctx.albedo("cdn/texture-limewash-plaster-weathered-lichen.png"); ctx.color(LIME); const rings = []; for (let i = 0; i <= 6; i++) rings.push([0.7 + i * (TH - 0.7) / 6, rTower(0.7 + i * (TH - 0.7) / 6)]); loft(g, rings, N);
  ctx.flat();
  // windows climbing the tower, dark panes in stone surrounds, rust weeping from each sill
  for (const [y, a] of [[3.2, 0.25], [6.4, -0.1], [9.6, 0.35]]) {
    const r = rTower(y) + 0.02;
    at(g, rotY(a), [TW[0], 0, TW[1]], () => {
      ctx.albedo(TEX.fieldstone); ctx.color(STONE); g.box(0, y, r, 0.9, 1.25, 0.2);
      ctx.albedo(null); ctx.color("oklch(0.22 0.02 240)"); g.box(0, y + 0.02, r + 0.06, 0.55, 0.85, 0.12);
      ctx.color(OAK); g.box(0, y + 0.02, r + 0.13, 0.06, 0.85, 0.04); g.box(0, y + 0.02, r + 0.13, 0.55, 0.06, 0.04);
      if (lod <= 2) { ctx.color("oklch(0.55 0.11 50)"); g.box(0.12, y - 1.3, r - 0.02 + (rTower(y - 1.3) - rTower(y)) * 0.5, 0.1, 1.6, 0.03); g.box(-0.2, y - 1.0, r - 0.01, 0.07, 1.0, 0.03); }
    });
  }
  // ---- corbelled gallery and iron rail
  ctx.albedo(TEX.fieldstone); ctx.color(STONE); ctx.smooth();
  loft(g, [[TH - 0.3, R1], [TH, R1 + 0.5], [TH + 0.3, R1 + 0.6], [TH + 0.3, 0.01]], N);
  ctx.flat(); ctx.albedo(TEX.iron); ctx.color(IRON);
  const RR = R1 + 0.5, posts = lod <= 1 ? 20 : lod <= 2 ? 12 : 8;
  for (let k = 0; k < posts; k++) { const a = k / posts * 6.2832; g.box(TW[0] + Math.sin(a) * RR, TH + 0.8, TW[1] + Math.cos(a) * RR, 0.06, 1.0, 0.06); }
  { const pts = []; for (let k = 0; k <= posts; k++) { const a = k / posts * 6.2832; pts.push([TW[0] + Math.sin(a) * RR, TH + 1.3, TW[1] + Math.cos(a) * RR, 0.045]); } g.tube(pts, 4); }
  // ---- the lantern room: eight iron mullions, warm glass, a verdigris cap and finial
  const LY0 = TH + 0.3, LY1 = TH + 2.6, LR = 1.45;
  ctx.color("oklch(0.5 0.04 50)"); ctx.albedo(TEX.iron);
  loft(g, [[LY0, LR + 0.05], [LY0 + 0.6, LR + 0.05]], 8);                                        // dwarf wall
  for (let k = 0; k < 8; k++) { const a = (k + 0.5) / 8 * 6.2832; g.box(TW[0] + Math.sin(a) * LR, (LY0 + LY1) / 2 + 0.3, TW[1] + Math.cos(a) * LR, 0.09, LY1 - LY0 - 0.6, 0.09); }
  ctx.albedo(null); ctx.color("oklch(0.93 0.09 85)");
  loft(g, [[LY0 + 0.6, LR - 0.02], [LY1, LR - 0.02]], 8);                                         // the glazing, lit from within
  ctx.color("oklch(0.85 0.14 80)"); ctx.smooth(); g.blob([TW[0], LY0 + 1.3, TW[1]], 0.45, 1, 0.05, 1, 3); ctx.flat();
  ctx.color("oklch(0.6 0.07 170)"); ctx.smooth();
  loft(g, [[LY1, LR + 0.25], [LY1 + 0.25, LR + 0.2], [LY1 + 1.1, 0.5], [LY1 + 1.4, 0.18], [LY1 + 1.45, 0.01]], lod <= 1 ? 16 : 8);
  ctx.color(IRON); g.blob([TW[0], LY1 + 1.7, TW[1]], 0.2, 1, 0.02, 1, 5); g.box(TW[0], LY1 + 2.1, TW[1], 0.05, 0.7, 0.05);
  ctx.flat();
  // ---- the keeper's cottage: fieldstone walls, door and windows, a mossy slate gable roof, chimney
  ctx.albedo(TEX.fieldstone); ctx.color(STONE);
  const cw = CX1 - CX0, cmx = (CX0 + CX1) / 2, T = 0.5;
  g.box(cmx, CH / 2, CZ - T / 2, cw, CH, T); g.box(cmx, CH / 2, -CZ + T / 2, cw, CH, T); g.box(CX1 - T / 2, CH / 2, 0, T, CH, CZ * 2);
  for (const z of [CZ, -CZ]) { const s = Math.sign(z); g.tri([CX1, CH, z], [CX1, RIDGE, 0], [CX1, CH, 0]); g.tri([CX1, CH, 0], [CX1, RIDGE, 0], [CX1, CH, z]); }
  g.quad([CX1, CH, -CZ], [CX1, CH, CZ], [CX1, RIDGE, 0], [CX1, RIDGE, 0]);
  g.box(cmx, 0.15, 0, cw + 0.3, 0.5, CZ * 2 + 0.3);                                              // footing course
  // door: oak leaf in a stone surround, iron strap hinges, a slate hood over it
  ctx.color(STONE); g.box(DOOR.x, DOOR.h / 2 + 0.1, CZ + 0.05, DOOR.w + 0.5, DOOR.h + 0.4, 0.14);
  ctx.albedo(TEX.oak); ctx.color(OAK); g.box(DOOR.x, DOOR.h / 2, CZ + 0.12, DOOR.w, DOOR.h, 0.08);
  ctx.albedo(TEX.iron); ctx.color(IRON); for (const y of [0.5, 1.7]) g.box(DOOR.x - 0.2, y, CZ + 0.17, 0.75, 0.06, 0.02);
  g.box(DOOR.x + 0.4, 1.05, CZ + 0.18, 0.06, 0.06, 0.06);
  ctx.albedo(TEX.slate); ctx.color("oklch(0.92 0.02 200)");
  at(g, [1, 0, 0, 0, 0.9, -0.44, 0, 0.44, 0.9], [DOOR.x, DOOR.h + 0.5, CZ + 0.45], () => g.box(0, 0, 0, DOOR.w + 0.9, 0.08, 1.0));
  ctx.albedo(TEX.oak); ctx.color(OAK); for (const s of [-1, 1]) g.box(DOOR.x + s * (DOOR.w / 2 + 0.3), DOOR.h / 2 + 0.25, CZ + 0.85, 0.1, DOOR.h + 0.5, 0.1);
  // windows front and back
  for (const [x, z] of [[1.6, CZ], [7.1, CZ], [3, -CZ], [6.5, -CZ]]) { const s = Math.sign(z);
    ctx.albedo(TEX.fieldstone); ctx.color(STONE); g.box(x, 1.55, z + s * 0.04, 1.1, 1.2, 0.12); g.box(x, 0.9, z + s * 0.12, 1.2, 0.1, 0.25);
    ctx.albedo(null); ctx.color("oklch(0.28 0.03 240)"); g.box(x, 1.6, z + s * 0.1, 0.75, 0.9, 0.04);
    ctx.color(OAK); g.box(x, 1.6, z + s * 0.13, 0.05, 0.9, 0.03); g.box(x, 1.6, z + s * 0.13, 0.75, 0.05, 0.03); }
  // roof: two slate planes with eaves, a ridge cap
  ctx.albedo(TEX.slate); ctx.color("oklch(0.92 0.03 150)");
  const ov = 0.4, rx0 = CX0 - 0.6, rx1 = CX1 + ov;
  for (const s of [1, -1]) g.quad([rx0, CH - 0.2, s * (CZ + ov)], [rx1, CH - 0.2, s * (CZ + ov)], [rx1, RIDGE + 0.1, 0], [rx0, RIDGE + 0.1, 0]);
  for (const s of [1, -1]) g.quad([rx1, CH - 0.2, s * (CZ + ov)], [rx0, CH - 0.2, s * (CZ + ov)], [rx0, CH - 0.32, s * (CZ + ov)], [rx1, CH - 0.32, s * (CZ + ov)]);
  ctx.albedo(TEX.fieldstone); ctx.color(STONE); g.box((rx0 + rx1) / 2, RIDGE + 0.15, 0, rx1 - rx0, 0.18, 0.3);
  g.box(CX1 - 0.9, RIDGE + 0.4, -0.9, 1.0, 3.2, 0.9);                                               // chimney
  ctx.color("oklch(0.7 0.09 45)"); for (const dx of [-0.2, 0.2]) g.tube([[CX1 - 0.9 + dx, RIDGE + 2.0, -0.9, 0.13], [CX1 - 0.9 + dx, RIDGE + 2.4, -0.9, 0.12]], 6, { capB: true });
  // ---- the drystone yard: walls of laid fieldstone, capstones, a gate in the front run
  const YZ = 11.5, YX0 = -9.5, YX1 = 10.5, GX = [3.6, 5.6];
  const runs = [[YX0, CZ - 0.5, YX0, YZ], [YX0, YZ, GX[0], YZ], [GX[1], YZ, YX1, YZ], [YX1, YZ, YX1, CZ - 0.5]];
  for (const [x0, z0, x1, z1] of runs) {
    const L = Math.hypot(x1 - x0, z1 - z0), ax = Math.abs(x1 - x0) > 0.1, mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
    ctx.albedo(TEX.fieldstone); ctx.color(STONE); g.box(mx, 0.45, mz, ax ? L : 0.75, 1.1, ax ? 0.75 : L);
    if (lod <= 2) { ctx.albedo(TEX.rock); const n = Math.floor(L / (lod <= 1 ? 0.55 : 1.1));
      for (let i = 0; i < n; i++) { const t = (i + 0.5) / n, x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t, h = 0.22 + R() * 0.12;
        ctx.color(R() < 0.3 ? "oklch(0.9 0.05 130)" : "oklch(0.92 0.01 80)");
        at(g, rotY((R() - 0.5) * 0.5), [x, 1.0 + h / 2, z], () => g.box(0, 0, 0, ax ? 0.5 : 0.7, h, ax ? 0.7 : 0.5)); } }
  }
  ctx.albedo(TEX.fieldstone); ctx.color(STONE); for (const x of GX) g.box(x + (x === GX[0] ? -0.3 : 0.3), 0.7, YZ, 0.7, 1.5, 0.85); // gate piers
  ctx.albedo(TEX.oak); ctx.color(OAK);                                                              // the gate, swung half open
  at(g, rotY(-1.0), [GX[0] + 0.1, 0, YZ], () => { for (const y of [0.35, 1.0]) g.box(0.95, y, 0, 1.9, 0.12, 0.06); for (const x of [0.1, 0.95, 1.8]) g.box(x, 0.65, 0, 0.1, 1.1, 0.07); });
  // a worn flag path from the gate to the door
  if (lod <= 3) { ctx.albedo(TEX.flag); ctx.color("oklch(0.9 0.01 80)");
    for (let i = 0; i < 9; i++) { const t = i / 8, x = DOOR.x + (GX[0] + 1 - DOOR.x) * t + (R() - 0.5) * 0.3, z = CZ + 1.3 + (YZ - CZ - 1.6) * t;
      at(g, rotY(R()), [x, 0.03, z], () => g.box(0, 0, 0, 0.8 + R() * 0.3, 0.08, 0.6 + R() * 0.3)); } }
  // fish-drying rack against the west run, salted fish in pairs
  ctx.albedo(TEX.log); ctx.color(OAK);
  const FX = -6, FZ = 7;
  for (const z of [FZ - 1.6, FZ + 1.6]) for (const s of [-1, 1]) at(g, [1, 0, 0, 0, Math.cos(s * 0.3), -Math.sin(s * 0.3), 0, Math.sin(s * 0.3), Math.cos(s * 0.3)], [FX + s * 0.35, 1.05, z], () => g.box(0, 0, 0, 0.1, 2.2, 0.1));
  ctx.smooth(); g.tube([[FX, 2.0, FZ - 1.8, 0.06], [FX, 2.0, FZ + 1.8, 0.06]], 5, { capA: true, capB: true }); ctx.flat();
  if (lod <= 2) { ctx.albedo(null); for (let i = 0; i < 7; i++) { const z = FZ - 1.3 + i * 0.43;
    ctx.color("oklch(0.78 0.03 70)"); g.box(FX, 1.6, z, 0.05, 0.75, 0.22); ctx.color("oklch(0.5 0.02 60)"); g.box(FX, 1.98, z, 0.02, 0.06, 0.02); } }
  // woodpile against the cottage's east gable under a lean-to of slate
  ctx.albedo(TEX.log); ctx.color("oklch(0.85 0.03 60)"); ctx.smooth();
  for (let row = 0; row < (lod <= 2 ? 4 : 2); row++) for (let i = 0; i < 6 - (row % 2); i++) {
    const z = -2 + i * 0.36 + (row % 2) * 0.18, y = 0.18 + row * 0.31; g.tube([[CX1 + 0.3, y, z, 0.16], [CX1 + 1.4, y, z, 0.16]], lod <= 1 ? 7 : 5, { capA: true, capB: true }); }
  ctx.flat(); ctx.albedo(TEX.slate); ctx.color("oklch(0.92 0.03 150)");
  g.quad([CX1, 2.4, -2.5], [CX1, 2.4, 0.4], [CX1 + 1.9, 1.7, 0.4], [CX1 + 1.9, 1.7, -2.5]);
  ctx.albedo(TEX.oak); ctx.color(OAK); for (const z of [-2.4, 0.3]) g.box(CX1 + 1.8, 0.85, z, 0.1, 1.7, 0.1);
  // the keeper's clutter by the door: barrels, a crate, a coil of rope, lobster pots
  ctx.albedo(TEX.oak);
  for (const [x, z] of [[6.4, 4.1], [7.1, 4.4]]) { ctx.color("oklch(0.8 0.03 60)"); ctx.smooth(); g.tube([[x, 0, z, 0.3], [x, 0.45, z, 0.36], [x, 0.9, z, 0.3]], lod <= 1 ? 10 : 6, { capA: true, capB: true }); ctx.flat();
    ctx.albedo(TEX.iron); ctx.color(IRON); for (const y of [0.2, 0.7]) g.tube([[x - 0.001, y, z, 0.35], [x, y + 0.04, z, 0.35]], lod <= 1 ? 10 : 6); ctx.albedo(TEX.oak); }
  ctx.color("oklch(0.8 0.03 60)"); g.box(2.3, 0.3, 4.0, 0.7, 0.6, 0.6);
  ctx.albedo(null); ctx.color("oklch(0.7 0.05 80)"); ctx.smooth();
  { const pts = []; for (let i = 0; i <= 14; i++) { const a = i * 1.2; pts.push([2.5 + Math.cos(a) * 0.35, 0.65 + i * 0.012, 4.0 + Math.sin(a) * 0.3, 0.05]); } if (lod <= 2) g.tube(pts, 4); }
  ctx.flat();
  if (lod <= 2) for (const [x, z] of [[-1, 4.6], [-0.3, 5.4]]) { ctx.albedo(TEX.oak); ctx.color("oklch(0.75 0.04 60)");
    for (let k = 0; k < 6; k++) { const a = k / 6 * 3.1416; g.box(x + Math.cos(a) * 0.4, 0.3 + Math.sin(a) * 0.3, z, 0.04, 0.04, 0.9); } g.box(x, 0.02, z, 0.85, 0.04, 0.9); }
  // ---- headland stones about the yard
  if (lod <= 3) for (let i = 0; i < (lod <= 1 ? 9 : 4); i++) { const a = R() * 6.283, r = 14 + R() * 8, k = 0.5 + R() * 0.8;
    mossyRock(g, [2 + Math.cos(a) * r, 0, 5 + Math.sin(a) * r], [k * 1.3, k * 0.75, k], 0, 1700 + i, { rock: TEX.rock, moss: TEX.moss, mossAt: 0.55, floor: -0.6 }); }
  ctx.albedo(null); ctx.color(null);
}
export function collider() {
  const out = [
    { kind: "cylinder", radiusTop: R1, radiusBottom: R0, height: TH + 0.3, center: [TW[0], (TH + 0.3) / 2, TW[1]] },
    { kind: "box", width: CX1 - CX0, height: CH + 1.2, depth: CZ * 2, center: [(CX0 + CX1) / 2, (CH + 1.2) / 2, 0] },
    { kind: "box", width: 2.0, height: 2.4, depth: 3.2, center: [CX1 + 1.0, 1.2, -1.0] },
  ];
  const YZ = 11.5, YX0 = -9.5, YX1 = 10.5, GX = [3.0, 6.2];
  for (const [x0, z0, x1, z1] of [[YX0, 2.5, YX0, YZ], [YX0, YZ, GX[0], YZ], [GX[1], YZ, YX1, YZ], [YX1, YZ, YX1, 2.5]]) {
    const ax = Math.abs(x1 - x0) > 0.1, L = Math.hypot(x1 - x0, z1 - z0);
    out.push({ kind: "box", width: ax ? L : 0.8, height: 1.3, depth: ax ? 0.8 : L, center: [(x0 + x1) / 2, 0.65, (z0 + z1) / 2] });
  }
  return out;
}
