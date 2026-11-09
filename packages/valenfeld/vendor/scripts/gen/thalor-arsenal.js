// Thalor Arsenal (concept: art-thalor-arsenal): the house's naval arsenal on the clifftop above the Aurenmar sea,
// guarded by marines who never set sail. A square fieldstone curtain wall with four squat corner towers and a gatehouse to the
// south (seaward), inside a long open timber mast shed with pine masts on trestles, a slate-roofed stone barracks on the north
// wall (its door the way in), cannon on carriages and pyramids of shot, a heap of rusting anchors, cable coils, and a flagpole
// flying the navy gull. Local frame: +X east, +Z south. Pad ground at local y=0.
import { G, rng, TEX } from "../lib/geo.js";
const STONE = "oklch(0.72 0.015 90)", DARK = "oklch(0.5 0.015 90)", OAK = "oklch(0.38 0.03 55)", PINE = "oklch(0.62 0.06 70)",
  SLATE = "oklch(0.55 0.02 240)", IRON = "oklch(0.25 0.01 60)", RUST = "oklch(0.42 0.08 45)", NAVY = "oklch(0.32 0.08 260)",
  WHITE = "oklch(0.95 0.01 90)", ROPE = "oklch(0.62 0.04 80)", YARD = "oklch(0.6 0.02 85)";
const HW = 18, HD = 14, WH = 5, WT = 1.2, TS = 4.4, TH = 7.5, GW = 4;
// barracks
const BX = -2, BZ = -HD + WT + 3.5, BL = 14, BW = 6, BH = 3.6, BDX = -5;
const both = (g, a, b, c, d) => { g.quad(a, b, c, d); g.quad(a, d, c, b); };
function merlons(g, x0, z0, x1, z1, y) {
  const L = Math.hypot(x1 - x0, z1 - z0), n = Math.floor(L / 1.6);
  for (let i = 0; i < n; i++) { const t = (i + 0.5) / n; if (i % 2) continue; const ux = (x1 - x0) / L, uz = (z1 - z0) / L;
    g.box(x0 + (x1 - x0) * t, y + 0.45, z0 + (z1 - z0) * t, Math.abs(ux) * 0.8 + Math.abs(uz) * WT, 0.9, Math.abs(uz) * 0.8 + Math.abs(ux) * WT); }
}
function tower(g, ctx, x, z, lod) {
  ctx.albedo(TEX.fieldstone); ctx.color(STONE); g.box(x, TH / 2, z, TS, TH, TS);
  ctx.color(DARK); g.box(x, 0.4, z, TS + 0.5, 0.8, TS + 0.5); g.box(x, TH - 0.15, z, TS + 0.3, 0.3, TS + 0.3);
  ctx.color(STONE); for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, -1], [0, 1], [-1, 0], [1, 0]]) if ((dx + dz) % 2 === 0 || lod <= 2) g.box(x + dx * (TS / 2 - 0.35), TH + 0.45, z + dz * (TS / 2 - 0.35), 0.7, 0.9, 0.7);
  ctx.albedo(null); ctx.color("oklch(0.12 0.01 60)"); for (const [dx, dz] of [[0, 1], [1, 0], [-1, 0], [0, -1]]) g.box(x + dx * (TS / 2 + 0.01), TH * 0.62, z + dz * (TS / 2 + 0.01), dz ? 0.2 : 0.03, 0.9, dx ? 0.2 : 0.03);
}
function cannon(g, ctx, x, z, yaw, seg) {
  const c = Math.cos(yaw), s = Math.sin(yaw);
  g.at({ m: [c, 0, s, 0, 1, 0, -s, 0, c], t: [x, 0, z] }, () => {
    ctx.albedo(TEX.oak); ctx.color(OAK); for (const sx of [-0.35, 0.35]) g.box(sx, 0.4, 0, 0.12, 0.5, 1.4); g.box(0, 0.25, 0, 0.8, 0.12, 1.3);
    ctx.albedo(TEX.iron); ctx.color(IRON); for (const zz of [-0.5, 0.5]) for (const sx of [-0.45, 0.45]) g.tube([[sx, 0.22, zz, 0.22], [sx + Math.sign(sx) * 0.08, 0.22, zz, 0.22]], seg, { capA: true, capB: true });
    g.tube([[0, 0.72, 0.75, 0.24], [0, 0.72, 0.5, 0.26], [0, 0.74, -1.3, 0.17], [0, 0.74, -1.45, 0.2]], seg, { capA: true, capB: true });
  });
}
function shot(g, ctx, x, z, lod) {
  ctx.albedo(TEX.iron); ctx.color(IRON); const r = 0.13;
  for (let k = 0; k < 3; k++) for (let i = 0; i < 3 - k; i++) for (let j = 0; j < 3 - k; j++) {
    const px = x + (i - (2 - k) / 2) * 2 * r, pz = z + (j - (2 - k) / 2) * 2 * r, py = r + k * r * 1.41;
    if (lod <= 2) g.tris(g.blob([px, py, pz], [r, r, r], 0, 0, 1, 0)); else g.box(px, py, pz, r * 1.7, r * 1.7, r * 1.7); }
}
function anchor(g, ctx, x, z, yaw, s) {
  const c = Math.cos(yaw), sn = Math.sin(yaw);
  g.at({ m: [c, 0, sn, 0, 1, 0, -sn, 0, c], t: [x, 0, z] }, () => { ctx.albedo(TEX.iron); ctx.color(RUST);
    g.tube([[0, 0.12, -1.4 * s, 0.09 * s], [0, 0.14, 1.2 * s, 0.09 * s]], 6);
    g.tube([[-0.9 * s, 0.14, 1.0 * s, 0.07 * s], [-0.5 * s, 0.14, 1.35 * s, 0.08 * s], [0, 0.14, 1.45 * s, 0.09 * s], [0.5 * s, 0.14, 1.35 * s, 0.08 * s], [0.9 * s, 0.14, 1.0 * s, 0.07 * s]], 6);
    g.tube([[-0.8 * s, 0.1, -1.2 * s, 0.06 * s], [0.8 * s, 0.1, -1.2 * s, 0.06 * s]], 6);
    g.tube([[0, 0.12, -1.5 * s, 0.03], [0.18 * s, 0.12, -1.7 * s, 0.03], [0, 0.12, -1.9 * s, 0.03], [-0.18 * s, 0.12, -1.7 * s, 0.03], [0, 0.12, -1.5 * s, 0.03]], 5); });
}
export function geometry(ctx) {
  const g = new G(ctx), lod = ctx.lod || 1, R = rng(1928), seg = lod <= 2 ? 10 : 7;
  if (lod >= 5) { ctx.color(STONE); g.box(0, WH / 2, -HD, 2 * HW, WH, WT); g.box(0, WH / 2, HD, 2 * HW, WH, WT); g.box(-HW, WH / 2, 0, WT, WH, 2 * HD); g.box(HW, WH / 2, 0, WT, WH, 2 * HD); ctx.color(null); return; }
  // ---- the yard: packed gravel, a flagged path from the gate to the barracks door, the approach track outside
  ctx.albedo(TEX.flag); ctx.color(YARD); g.box(0, 0.015, 0, 2 * HW - 1, 0.03, 2 * HD - 1);
  ctx.color("oklch(0.66 0.02 85)"); g.box(BDX + BX, 0.03, 2, 2.2, 0.03, 2 * HD - 8); g.box(0, 0.025, HD + 5, GW, 0.03, 10);
  // ---- curtain wall, wall-walk, merlons
  ctx.albedo(TEX.fieldstone); ctx.color(STONE);
  g.box(0, WH / 2, -HD, 2 * HW, WH, WT); g.box(-HW, WH / 2, 0, WT, WH, 2 * HD); g.box(HW, WH / 2, 0, WT, WH, 2 * HD);
  const sw = HW - GW / 2; g.box(-HW + sw / 2, WH / 2, HD, sw, WH, WT); g.box(HW - sw / 2, WH / 2, HD, sw, WH, WT);
  ctx.color(DARK); g.box(0, 0.35, -HD, 2 * HW + 0.4, 0.7, WT + 0.4); g.box(-HW, 0.35, 0, WT + 0.4, 0.7, 2 * HD); g.box(HW, 0.35, 0, WT + 0.4, 0.7, 2 * HD);
  ctx.color(STONE); merlons(g, -HW, -HD, HW, -HD, WH); merlons(g, -HW, -HD, -HW, HD, WH); merlons(g, HW, -HD, HW, HD, WH); merlons(g, -HW, HD, -GW / 2 - 2, HD, WH); merlons(g, GW / 2 + 2, HD, HW, HD, WH);
  // ---- gatehouse: two flanking towers and an arch lintel, the gate itself long gone to a bar of oak on chains, propped open
  for (const sx of [-1, 1]) { ctx.albedo(TEX.fieldstone); ctx.color(STONE); g.box(sx * (GW / 2 + 1.4), (WH + 2) / 2, HD + 0.3, 2.8, WH + 2, 3.2); ctx.color(DARK); g.box(sx * (GW / 2 + 1.4), WH + 2.15, HD + 0.3, 3, 0.3, 3.4); }
  ctx.color(STONE); g.box(0, WH + 0.6, HD + 0.3, GW, 2.8, 3.2);
  ctx.albedo(TEX.oak); ctx.color(OAK); for (const sx of [-1, 1]) g.at({ m: [Math.cos(sx * 1.4), 0, Math.sin(sx * 1.4), 0, 1, 0, -Math.sin(sx * 1.4), 0, Math.cos(sx * 1.4)], t: [sx * GW / 2, 0, HD - 1.4] }, () => { g.box(-sx * GW / 4, 1.7, 0, GW / 2, 3.4, 0.16); ctx.albedo(TEX.iron); ctx.color(IRON); for (const y of [0.6, 1.7, 2.8]) g.box(-sx * GW / 4, y, 0.1, GW / 2, 0.1, 0.04); ctx.albedo(TEX.oak); ctx.color(OAK); });
  // the house arms over the gate: a white gull on a navy shield
  ctx.albedo(null); ctx.color(NAVY); g.box(0, WH + 0.9, HD + 1.92, 1.2, 1.4, 0.06); ctx.color(WHITE);
  g.tri([-0.45, WH + 1.0, HD + 1.96], [0, WH + 0.8, HD + 1.96], [0, WH + 1.15, HD + 1.96]); g.tri([0.45, WH + 1.0, HD + 1.96], [0, WH + 1.15, HD + 1.96], [0, WH + 0.8, HD + 1.96]);
  // ---- corner towers
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) tower(g, ctx, sx * HW, sz * HD, lod);
  // ---- inner stair up to the wall-walk on the east wall
  ctx.albedo(TEX.fieldstone); ctx.color(DARK); for (let i = 0; i < 12; i++) g.box(HW - WT / 2 - 0.8, (i + 0.5) * (WH / 12), -2 + i * 0.5, 1.4, WH / 12 * (i + 1), 0.5);
  // ---- barracks: stone, slate roof, a door to the yard
  ctx.albedo(TEX.fieldstone); ctx.color(STONE); g.box(BX, BH / 2, BZ, BL, BH, BW);
  ctx.albedo(TEX.slate); ctx.color(SLATE);
  for (const sz of [-1, 1]) both(g, [BX - BL / 2 - 0.4, BH + 2.4, BZ], [BX + BL / 2 + 0.4, BH + 2.4, BZ], [BX + BL / 2 + 0.4, BH - 0.15, BZ + sz * (BW / 2 + 0.5)], [BX - BL / 2 - 0.4, BH - 0.15, BZ + sz * (BW / 2 + 0.5)]);
  ctx.albedo(TEX.fieldstone); ctx.color(STONE); for (const x of [BX - BL / 2, BX + BL / 2]) { g.tri([x, BH, BZ - BW / 2], [x, BH + 2.4, BZ], [x, BH, BZ + BW / 2]); g.tri([x, BH, BZ - BW / 2], [x, BH, BZ + BW / 2], [x, BH + 2.4, BZ]); }
  g.box(BX + BL / 2 - 1.2, BH + 2.6, BZ - 0.6, 0.9, 2.4, 0.9);
  ctx.albedo(TEX.oak); ctx.color("oklch(0.35 0.05 40)"); g.box(BX + BDX, 1.1, BZ + BW / 2 + 0.04, 1.2, 2.2, 0.1);
  ctx.albedo(TEX.iron); ctx.color(IRON); g.box(BX + BDX + 0.4, 1.1, BZ + BW / 2 + 0.11, 0.08, 0.08, 0.06);
  ctx.albedo(null); ctx.color("oklch(0.7 0.12 75)"); ctx.emissive && ctx.emissive("oklch(0.65 0.13 70)");
  for (const x of [BX - 1, BX + 2.5, BX + 5]) g.box(x, 2, BZ + BW / 2 + 0.03, 0.7, 0.9, 0.04); ctx.emissive && ctx.emissive(null);
  ctx.albedo(TEX.oak); ctx.color(OAK); for (const x of [BX - 1, BX + 2.5, BX + 5]) { g.box(x, 2, BZ + BW / 2 + 0.06, 0.08, 0.95, 0.04); g.box(x, 2, BZ + BW / 2 + 0.06, 0.75, 0.08, 0.04); }
  // a bench by the door, a marine's helmet left on it
  g.box(BX + BDX + 2.2, 0.45, BZ + BW / 2 + 0.5, 1.8, 0.08, 0.4); for (const dx of [-0.75, 0.75]) g.box(BX + BDX + 2.2 + dx, 0.22, BZ + BW / 2 + 0.5, 0.08, 0.45, 0.36);
  ctx.albedo(TEX.iron); ctx.color("oklch(0.55 0.02 240)"); g.tris(g.blob([BX + BDX + 2.6, 0.58, BZ + BW / 2 + 0.5], [0.16, 0.13, 0.18], 1, 0, 1, 0, 0.5));
  // ---- mast shed: open timber, slate pentice roof against the west wall, masts on trestles
  const MX = -HW + WT / 2 + 2.6, MZ0 = -4, MZ1 = HD - 3;
  ctx.albedo(TEX.oak); ctx.color(OAK);
  for (let z = MZ0; z <= MZ1 + 0.01; z += (MZ1 - MZ0) / 4) { g.box(MX + 2.2, 1.9, z, 0.3, 3.8, 0.3); g.box(MX - 2.2, 2.4, z, 0.3, 4.8, 0.3); g.box(MX, 4, z, 4.8, 0.22, 0.22); }
  g.box(MX + 2.2, 3.85, (MZ0 + MZ1) / 2, 0.24, 0.24, MZ1 - MZ0 + 0.4);
  ctx.albedo(TEX.slate); ctx.color(SLATE); both(g, [MX - 2.8, 4.95, MZ0 - 0.6], [MX - 2.8, 4.95, MZ1 + 0.6], [MX + 2.9, 3.95, MZ1 + 0.6], [MX + 2.9, 3.95, MZ0 - 0.6]);
  ctx.albedo(TEX.oak); ctx.color(OAK); for (const z of [MZ0 + 0.8, (MZ0 + MZ1) / 2, MZ1 - 0.8]) for (const x of [MX - 1, MX + 1]) g.box(x, 0.4, z, 0.3, 0.8, 0.3);
  ctx.albedo(TEX.log); ctx.color(PINE);
  for (const [x, y, r] of [[MX - 1.1, 1.0, 0.32], [MX - 0.4, 1.0, 0.3], [MX + 0.3, 1.0, 0.28], [MX + 1.0, 0.98, 0.26], [MX - 0.75, 1.55, 0.28], [MX - 0.05, 1.52, 0.26], [MX + 0.65, 1.5, 0.24]])
    g.tube([[x, y, MZ0 - 0.4, r], [x, y, MZ1 + 0.4, r * 0.8]], seg, { capA: true, capB: true });
  ctx.albedo(TEX.oak); ctx.color("oklch(0.5 0.04 65)"); for (let i = 0; i < 6; i++) g.box(MX + 1.6, 0.1 + i * 0.12, 4 + (i % 2) * 0.1, 0.9, 0.1, 5);
  // a mast half-shaped on the yard floor, adze chips round it
  ctx.albedo(TEX.log); ctx.color(PINE); g.tube([[MX + 4.5, 0.42, -2, 0.36], [MX + 4.5, 0.4, 8, 0.3]], 8, { capA: true, capB: true });
  ctx.albedo(null); ctx.color("oklch(0.78 0.06 80)"); for (let i = 0; i < (lod <= 2 ? 30 : 10); i++) g.box(MX + 4.5 + (R() - 0.5) * 2.4, 0.04, -2 + R() * 10, 0.12, 0.02, 0.06);
  // ---- gun line: cannon on carriages facing the sea, shot pyramids between
  for (let i = 0; i < 4; i++) cannon(g, ctx, 6 + i * 2.6, HD - 3, Math.PI, seg);
  for (const x of [7.3, 12.5]) shot(g, ctx, x, HD - 5.6, lod);
  // powder store: a squat vaulted magazine in the north-east corner, iron door
  ctx.albedo(TEX.fieldstone); ctx.color(DARK); g.box(HW - 5.5, 1.5, -HD + WT / 2 + 3, 5, 3, 4.4);
  g.tube([[HW - 8, 3, -HD + WT / 2 + 3, 2.2], [HW - 3, 3, -HD + WT / 2 + 3, 2.2]], 10, {}); 
  ctx.albedo(TEX.iron); ctx.color(IRON); g.box(HW - 5.5, 1, -HD + WT / 2 + 5.22, 1, 2, 0.06);
  // ---- anchor heap and cable coils by the gate
  anchor(g, ctx, -7, HD - 4, 0.3, 1.1); anchor(g, ctx, -9.5, HD - 3.5, -0.8, 0.9); anchor(g, ctx, -8, HD - 6, 1.6, 1);
  ctx.albedo(null); ctx.color(ROPE);
  for (const [cx, cz] of [[-3.5, HD - 3], [-4.6, HD - 5]]) for (let i = 0; i < 4; i++) { const r = 0.7 - i * 0.12, pts = [];
    for (let k = 0; k <= 12; k++) { const a = k / 12 * 6.283; pts.push([cx + Math.cos(a) * r, 0.08 + i * 0.12, cz + Math.sin(a) * r, 0.06]); } g.tube(pts, 5); }
  // ---- flagpole and the navy gull
  ctx.albedo(TEX.oak); ctx.color(OAK); g.tube([[3, 0, 0, 0.14], [3, 12, 0, 0.08]], 8, { capB: true }); g.box(3, 12.1, 0, 0.25, 0.2, 0.25);
  ctx.albedo(TEX.fieldstone); ctx.color(DARK); g.box(3, 0.3, 0, 1.4, 0.6, 1.4);
  ctx.albedo(TEX.canvas); ctx.color(NAVY); const fw = lod <= 2 ? 6 : 3;
  for (let i = 0; i < fw; i++) { const t0 = i / fw, t1 = (i + 1) / fw, w0 = Math.sin(t0 * 5) * 0.25 * t0, w1 = Math.sin(t1 * 5) * 0.25 * t1;
    both(g, [3 + t0 * 3, 11.8, w0], [3 + t1 * 3, 11.8 - t1 * 0.2, w1], [3 + t1 * 3, 10.0 + t1 * 0.2, w1], [3 + t0 * 3, 10.0, w0]); }
  ctx.albedo(null); ctx.color(WHITE); for (const sz of [0.03, -0.03]) { g.tri([4.0, 11.0, sz], [4.5, 10.8, sz], [4.5, 11.15, sz]); g.tri([5.0, 11.0, sz], [4.5, 11.15, sz], [4.5, 10.8, sz]); }
  // ---- outside: a gibbet-straight track down toward the cliff, a weathered milestone
  ctx.albedo(TEX.rock); ctx.color("oklch(0.68 0.01 90)"); g.box(GW / 2 + 1, 0.5, HD + 8, 0.45, 1, 0.3);
  ctx.albedo(null); ctx.color(null); ctx.emissive && ctx.emissive(null);
}
export function collider() {
  const sw = HW - GW / 2;
  return [
    { kind: "box", width: 2 * HW, height: WH, depth: WT, center: [0, WH / 2, -HD] },
    { kind: "box", width: WT, height: WH, depth: 2 * HD, center: [-HW, WH / 2, 0] },
    { kind: "box", width: WT, height: WH, depth: 2 * HD, center: [HW, WH / 2, 0] },
    { kind: "box", width: sw, height: WH, depth: WT, center: [-HW + sw / 2, WH / 2, HD] },
    { kind: "box", width: sw, height: WH, depth: WT, center: [HW - sw / 2, WH / 2, HD] },
    { kind: "box", width: 2.8, height: WH + 2, depth: 3.2, center: [-(GW / 2 + 1.4), (WH + 2) / 2, HD + 0.3] },
    { kind: "box", width: 2.8, height: WH + 2, depth: 3.2, center: [GW / 2 + 1.4, (WH + 2) / 2, HD + 0.3] },
    ...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz]) => ({ kind: "box", width: TS, height: TH, depth: TS, center: [sx * HW, TH / 2, sz * HD] })),
    { kind: "box", width: BL, height: BH + 2.4, depth: BW, center: [BX, (BH + 2.4) / 2, BZ] },
    { kind: "box", width: 5, height: 3.5, depth: 4.4, center: [HW - 5.5, 1.75, -HD + WT / 2 + 3] },
    { kind: "box", width: 3, height: 1.8, depth: MZ1() - MZ0() + 1, center: [-HW + WT / 2 + 2.6, 0.9, (MZ0() + MZ1()) / 2] },
    { kind: "box", width: 0.4, height: 12, depth: 0.4, center: [3, 6, 0] },
    { kind: "box", width: 11, height: 1.2, depth: 2.2, center: [9.9, 0.6, HD - 3] },
  ];
}
function MZ0() { return -4; } function MZ1() { return HD - 3; }
