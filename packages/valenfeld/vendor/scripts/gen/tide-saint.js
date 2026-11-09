// The Tide Saint (concept: art-tide-saint): a saint's statue that stands on dry land at low tide and waist-deep at high.
// A weathered stone figure, hooded, one hand raised to the sea, the other on a staff, on a low plinth out on the marsh
// flats. Green weed and barnacles crust it to the waist where the tide reaches; sea-glass charms on a cord at the raised
// wrist. A notched tide post beside it, a ring of offering stones, shells and a rusted anchor at its feet, tide pools
// in the mud. On the bank, a driftwood lean-to under old sailcloth with candles in jars, reeds all round.
// Local frame: +X east (sea), -X west (bank), -Z north. Ground (the pad) at local y=0.
import { G, X, rng, TEX, mossyRock } from "../lib/geo.js";
const STONE = "oklch(0.72 0.015 110)", STONE2 = "oklch(0.64 0.02 120)", WEED = "oklch(0.42 0.07 135)", WEED2 = "oklch(0.36 0.06 120)",
  BARN = "oklch(0.86 0.02 90)", POOL = "oklch(0.5 0.04 230)", MUD = "oklch(0.42 0.03 70)", DRIFT = "oklch(0.7 0.015 80)",
  SAIL = "oklch(0.78 0.025 85)", RUST = "oklch(0.45 0.08 45)", GLASS = "oklch(0.72 0.08 170)", WAX = "oklch(0.9 0.03 90)", REED = "oklch(0.7 0.08 85)";
const PL = 0.6; // plinth height
function beam(g, a, b, r, seg = 6) { g.tube([[...a, r], [...b, r]], seg); }
export function geometry(ctx) {
  const g = new G(ctx), lod = ctx.lod || 1, R = rng(2588);
  if (lod >= 5) { ctx.color(STONE); g.box(0, PL / 2, 0, 2.2, PL, 2.2); g.box(0, PL + 1.6, 0, 1.0, 3.2, 0.8); ctx.color(DRIFT); g.box(-12, 1, 3, 3, 2, 2); ctx.color(null); return; }
  const seg = lod <= 2 ? 12 : 8;
  // tide pools and weed-mud around the plinth
  ctx.albedo(null);
  const pools = [[-2.8, 2.6, 2.4, 1.6], [3.4, 1.2, 3, 2], [1.2, -3.4, 2.2, 1.3], [-4.2, -2.2, 1.6, 1.1], [5.8, -2.8, 2.6, 1.4], [-1, 5, 3, 1.2]];
  for (const [x, z, w, d] of pools) { ctx.color(MUD); g.box(x, 0.01, z, w + 0.5, 0.02, d + 0.5); ctx.color(POOL); g.box(x, 0.03, z, w, 0.02, d); }
  if (lod <= 3) { ctx.color(WEED2); for (let i = 0; i < 14; i++) { const a = R() * 6.28, r = 2.5 + R() * 6; g.box(Math.cos(a) * r, 0.025, Math.sin(a) * r, 0.5 + R() * 0.9, 0.03, 0.3 + R() * 0.6); } }
  // the plinth: a worn block, weed-skirted
  ctx.albedo(TEX.rock); ctx.color(STONE2); g.box(0, PL / 2, 0, 2.2, PL, 2.2);
  ctx.color(STONE); g.box(0, PL - 0.05, 0, 2.3, 0.1, 2.3);
  // the saint: a robe swept up from the hem, hood and face, raised right arm, left hand on a staff
  const robe = [[0, PL, 0, 0.62], [0, PL + 0.6, 0, 0.56], [0, PL + 1.3, 0, 0.47], [0, PL + 2.0, 0, 0.4], [0, PL + 2.4, 0, 0.42], [0, PL + 2.62, 0, 0.3]];
  ctx.smooth(); ctx.albedo(TEX.rock); ctx.color(STONE);
  g.tube(robe, seg, { capA: true, rough: (th, k) => 1 + 0.05 * Math.sin(th * 7 + k) });
  // the hood and head
  g.tube([[0, PL + 2.55, 0.02, 0.24], [0, PL + 2.8, 0.0, 0.25], [0, PL + 3.05, 0.05, 0.19], [0, PL + 3.18, 0.08, 0.06]], seg, { capB: true });
  ctx.color("oklch(0.76 0.012 100)"); g.tube([[0, PL + 2.68, 0.14, 0.13], [0, PL + 2.86, 0.16, 0.13], [0, PL + 2.98, 0.13, 0.08]], seg, { capA: true, capB: true });
  // the raised right arm (toward +X, the sea) and its open hand
  ctx.color(STONE);
  g.tube([[0.34, PL + 2.25, 0, 0.13], [0.55, PL + 2.6, 0.02, 0.11], [0.62, PL + 3.05, 0.04, 0.09], [0.64, PL + 3.25, 0.04, 0.07]], seg - 2, { capB: true });
  g.at(X([0.65, PL + 3.42, 0.04], 90), () => { g.box(0, 0, 0, 0.06, 0.24, 0.16); for (let f = 0; f < 4; f++) g.box(0, 0.17, -0.06 + f * 0.04, 0.04, 0.12, 0.03); g.at(X([0, 0.02, 0.1], 0, 0, -40), () => g.box(0, 0, 0, 0.04, 0.12, 0.04)); });
  // left arm down to the staff
  g.tube([[-0.34, PL + 2.25, 0, 0.12], [-0.46, PL + 1.85, 0.12, 0.1], [-0.42, PL + 1.55, 0.3, 0.08]], seg - 2, { capB: true });
  ctx.color(STONE2); g.tube([[-0.42, PL + 0.02, 0.36, 0.05], [-0.42, PL + 2.35, 0.32, 0.05]], 6, { capB: true });
  ctx.flat();
  // the weed and barnacle crust, hem to waist, where the tide reaches
  ctx.albedo(TEX.moss); ctx.color(WEED);
  g.tube([[0, PL - 0.02, 0, 0.66], [0, PL + 0.6, 0, 0.6], [0, PL + 1.15, 0, 0.52]], seg, { rough: (th) => 1 + 0.08 * Math.sin(th * 11) });
  if (lod <= 3) { ctx.color(WEED2); const strands = lod <= 2 ? 22 : 10;
    for (let i = 0; i < strands; i++) { const a = i / strands * 6.283 + R() * 0.2, top = PL + 1.0 + R() * 0.35, r0 = 0.53 + R() * 0.03, r1 = 0.62;
      g.tube([[Math.cos(a) * r0, top, Math.sin(a) * r0, 0.04], [Math.cos(a) * r1, top - 0.5, Math.sin(a) * r1, 0.035], [Math.cos(a) * (r1 + 0.03), top - 0.9, Math.sin(a) * (r1 + 0.03), 0.02]], 4); }
    ctx.albedo(null); ctx.color(BARN); const nb = lod <= 2 ? 60 : 24;
    for (let i = 0; i < nb; i++) { const a = R() * 6.283, y = PL + 0.05 + Math.pow(R(), 1.4) * 0.9, r = 0.64 - (y - PL) * 0.1; g.box(Math.cos(a) * r, y, Math.sin(a) * r, 0.07, 0.05, 0.07); }
    // sea-glass charms on a cord round the raised wrist
    ctx.color("oklch(0.4 0.03 70)"); const cord = []; for (let i = 0; i <= 8; i++) { const a = i / 8 * 6.283; cord.push([0.62 + Math.cos(a) * 0.1, PL + 3.12, 0.04 + Math.sin(a) * 0.1, 0.012]); } g.tube(cord, 4);
    for (let i = 0; i < 5; i++) { const a = i / 5 * 6.283; ctx.color(i % 2 ? GLASS : "oklch(0.65 0.06 140)"); g.box(0.62 + Math.cos(a) * 0.11, PL + 2.98 - (i % 3) * 0.05, 0.04 + Math.sin(a) * 0.11, 0.04, 0.07, 0.03); } }
  // offering ring: stones, shells, a rusted anchor
  const stones = lod <= 2 ? 12 : 6;
  for (let i = 0; i < stones; i++) { const a = i / stones * 6.283 + 0.3, r = 1.55 + R() * 0.2, s = 0.18 + R() * 0.14;
    mossyRock(g, [Math.cos(a) * r, s * 0.4, Math.sin(a) * r], [s * 1.3, s, s * 1.1], 0, 60 + i, { rock: TEX.rock, moss: TEX.moss, mossAt: 0.7 }); }
  if (lod <= 3) { ctx.albedo(null); ctx.color("oklch(0.9 0.03 75)");
    for (let i = 0; i < 7; i++) { const a = R() * 6.283, r = 1.25 + R() * 0.5; g.at(X([Math.cos(a) * r, 0.05, Math.sin(a) * r], R() * 360, -15), () => { for (let k = 0; k < 5; k++) g.at(X([0, 0, 0], -40 + k * 20), () => g.box(0, 0, 0.07, 0.035, 0.03, 0.15)); }); }
    ctx.albedo(TEX.iron); ctx.color(RUST); g.at(X([1.3, 0.1, 1.15], 35, 0, 80), () => { beam(g, [0, -0.5, 0], [0, 0.45, 0], 0.04); g.tube([[-0.38, -0.25, 0, 0.035], [-0.3, -0.48, 0, 0.04], [0, -0.55, 0, 0.045], [0.3, -0.48, 0, 0.04], [0.38, -0.25, 0, 0.035]], 5); beam(g, [-0.2, 0.3, 0], [0.2, 0.3, 0], 0.03);
      const ring = []; for (let i = 0; i <= 8; i++) { const a = i / 8 * 6.283; ring.push([Math.cos(a) * 0.09, 0.56 + Math.sin(a) * 0.09, 0, 0.018]); } g.tube(ring, 4); }); }
  // the tide post, north-west of the statue: a weathered oak post notched in feet, weed to the high mark, an iron ring
  { const px = -2.6, pz = -1.6, H = 3.2; ctx.albedo(TEX.oak); ctx.color(DRIFT); g.box(px, H / 2, pz, 0.32, H, 0.32);
    ctx.albedo(TEX.moss); ctx.color(WEED); g.box(px, 0.75, pz, 0.36, 1.5, 0.36);
    if (lod <= 3) { ctx.albedo(null); ctx.color("oklch(0.2 0.01 60)"); for (let i = 0; i < 9; i++) g.box(px + 0.17, 0.4 + i * 0.3, pz, 0.01, 0.03, i % 3 === 0 ? 0.2 : 0.11);
      ctx.albedo(TEX.iron); ctx.color(RUST); const ring = []; for (let i = 0; i <= 8; i++) { const a = i / 8 * 6.283; ring.push([px + 0.19, 2.1 + Math.sin(a) * 0.1, pz + Math.cos(a) * 0.1, 0.02]); } g.tube(ring, 4); } }
  // the driftwood lean-to on the bank (west): poles, a ridge, sailcloth, a plank shelf of candles in jars
  { const sx = -11, sz = 2.5; ctx.albedo(TEX.oak); ctx.color(DRIFT);
    beam(g, [sx - 1.6, 0, sz - 1.2], [sx - 1.4, 2.2, sz - 1.0], 0.08); beam(g, [sx - 1.6, 0, sz + 1.4], [sx - 1.4, 2.25, sz + 1.2], 0.08);
    beam(g, [sx - 1.4, 2.2, sz - 1.3], [sx - 1.4, 2.25, sz + 1.5], 0.07);
    for (const z of [sz - 1.0, sz + 1.2]) beam(g, [sx - 1.4, 2.2, z], [sx + 1.5, 0, z + 0.1], 0.06);
    ctx.albedo(TEX.canvas); ctx.color(SAIL);
    { const a = [sx - 1.4, 2.28, sz - 1.25], b = [sx - 1.4, 2.32, sz + 1.45], c = [sx + 1.55, 0.15, sz + 1.5], d = [sx + 1.55, 0.12, sz - 1.2]; g.quad(a, b, c, d); g.quad(a, d, c, b); }
    ctx.albedo(TEX.oak); ctx.color("oklch(0.55 0.02 70)"); g.box(sx - 0.9, 0.55, sz + 0.1, 0.5, 0.06, 2.0); for (const z of [sz - 0.8, sz + 1.0]) g.box(sx - 0.9, 0.27, z, 0.08, 0.54, 0.08);
    if (lod <= 3) { ctx.albedo(null); for (let i = 0; i < 5; i++) { const z = sz - 0.7 + i * 0.4, h = 0.12 + R() * 0.12;
        ctx.color("oklch(0.85 0.03 90 / 0.6)"); g.tube([[sx - 0.9, 0.58, z, 0.07], [sx - 0.9, 0.58 + h + 0.06, z, 0.07]], 6, { capA: true });
        ctx.color(WAX); g.tube([[sx - 0.9, 0.59, z, 0.035], [sx - 0.9, 0.59 + h, z, 0.033]], 6, { capB: true }); } }
    // a coil of rope and a lobster pot by the shelter
    if (lod <= 2) { ctx.color("oklch(0.5 0.04 70)"); for (let k = 0; k < 3; k++) { const ring = []; for (let i = 0; i <= 10; i++) { const a = i / 10 * 6.283; ring.push([sx + 0.2 + Math.cos(a) * 0.3, 0.05 + k * 0.05, sz - 1.9 + Math.sin(a) * 0.3, 0.03]); } g.tube(ring, 4); } }
  }
  // reed beds round the flats and along the bank
  if (lod <= 3) { ctx.albedo(null); const beds = [[-9, -4, 2.5], [-13, 6, 2], [-7, 7, 1.8], [7, 6, 1.5], [-10, -1, 1.5], [8.5, -5, 1.2]];
    for (const [bx, bz, br] of beds) { const n = lod <= 2 ? 22 : 9; for (let i = 0; i < n; i++) { const a = R() * 6.283, r = Math.sqrt(R()) * br, x = bx + Math.cos(a) * r, z = bz + Math.sin(a) * r, h = 0.9 + R() * 0.8, lean = (R() - 0.5) * 0.3;
        ctx.color(i % 3 ? REED : "oklch(0.6 0.07 110)"); g.tube([[x, 0, z, 0.02], [x + lean, h, z + lean * 0.5, 0.008]], 3);
        if (i % 4 === 0) { ctx.color("oklch(0.4 0.05 60)"); g.tube([[x + lean * 0.9, h * 0.9, z + lean * 0.45, 0.025], [x + lean, h + 0.12, z + lean * 0.5, 0.025]], 4, { capA: true, capB: true }); } } } }
  ctx.albedo(null); ctx.color(null);
}
export function collider() {
  return [
    { kind: "box", width: 2.2, height: PL, depth: 2.2, center: [0, PL / 2, 0] },
    { kind: "box", width: 1.2, height: 2.7, depth: 1.2, center: [0, PL + 1.35, 0] },
    { kind: "box", width: 0.32, height: 3.2, depth: 0.32, center: [-2.6, 1.6, -1.6] },
    { kind: "box", width: 0.5, height: 0.6, depth: 2.0, center: [-11.9, 0.3, 2.6] },
  ];
}
