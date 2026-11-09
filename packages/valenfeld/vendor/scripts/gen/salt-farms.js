// Corsaire Salt Farms (concept: art-corsaire-salt-farms): the evaporation pans that feed the capital's fish trade.
// A grid of shallow pans behind low earth bunds edged in plank, some still silver with brine, some crusted white, one
// raked into rows; a plank flume on trestles carries brine from a creaking windpump along the north edge, a sluice board
// dropping into each pan. West, by the road: an open-fronted salt shed of fieldstone and oak under mossy slate, sacks
// stacked inside; salt heaps in the yard, one under a thatch cover; long wooden rakes leaning on their rack.
// Local frame: +X east (pans), -X west (road side), -Z north. Ground (the pad) at local y=0.
import { G, X, rng, TEX } from "../lib/geo.js";
const SALT = "cdn/texture-salt-crust-white-crystalline.png", THATCH = "cdn/texture-thatch-straw-weathered.png";
const WHITE = "oklch(0.97 0.01 90)", BRINE = "oklch(0.62 0.05 230)", BRINE2 = "oklch(0.7 0.04 210)", MUD = "oklch(0.45 0.04 70)",
  BUND = "oklch(0.5 0.05 75)", WOOD = "oklch(0.62 0.03 70)", DARK = "oklch(0.45 0.03 60)", CANVAS = "oklch(0.86 0.03 85)", RUST = "oklch(0.5 0.09 45)";
const COLS = 4, ROWS = 3, PW = 6, PD = 4.6, BW = 0.7, X0 = -5, Z0 = -9;   // pan grid: col i at X0 + i*(PW+BW), row j at Z0 + j*(PD+BW)
const KIND = ["brine", "crust", "brine", "raked", "crust", "brine", "mud", "crust", "brine", "raked", "brine", "crust"];
function beam(g, a, b, r) { g.tube([[...a, r], [...b, r]], 6); }
const panAt = (i, j) => [X0 + i * (PW + BW) + PW / 2, Z0 + j * (PD + BW) + PD / 2];
export function geometry(ctx) {
  const g = new G(ctx), lod = ctx.lod || 1, R = rng(1336);
  const gw = COLS * (PW + BW) + BW, gd = ROWS * (PD + BW) + BW, gx = X0 - BW + gw / 2, gz = Z0 - BW + gd / 2;
  if (lod >= 5) { ctx.color(WHITE); g.box(gx, 0.15, gz, gw, 0.3, gd); ctx.color(WOOD); g.box(-17, 1.8, 0, 6, 3.6, 8); ctx.color(null); return; }
  // bunds: a raised earth grid, plank-faced at close range
  ctx.albedo(TEX.moss); ctx.color(BUND);
  for (let j = 0; j <= ROWS; j++) g.box(gx, 0.17, Z0 - BW / 2 + j * (PD + BW), gw, 0.34, BW);
  for (let i = 0; i <= COLS; i++) g.box(X0 - BW / 2 + i * (PW + BW), 0.17, gz, BW, 0.34, gd);
  if (lod <= 2) { ctx.albedo(TEX.oak); ctx.color(WOOD);
    for (let j = 0; j <= ROWS; j++) for (const s of [-1, 1]) g.box(gx, 0.2, Z0 - BW / 2 + j * (PD + BW) + s * (BW / 2 + 0.02), gw, 0.3, 0.05);
    for (let i = 0; i <= COLS; i++) for (let j = 0; j <= ROWS; j++) g.box(X0 - BW / 2 + i * (PW + BW), 0.32, Z0 - BW / 2 + j * (PD + BW), 0.22, 0.6, 0.22); }
  // the pans
  for (let i = 0; i < COLS; i++) for (let j = 0; j < ROWS; j++) {
    const [cx, cz] = panAt(i, j), k = KIND[j * COLS + i];
    ctx.albedo(null); ctx.color(MUD); g.box(cx, 0.02, cz, PW, 0.04, PD);
    if (k === "brine") { ctx.color((i + j) % 2 ? BRINE : BRINE2); g.box(cx, 0.1, cz, PW, 0.02, PD);
      if (lod <= 3) { ctx.albedo(SALT); ctx.color(WHITE); for (const s of [-1, 1]) { g.box(cx, 0.115, cz + s * (PD / 2 - 0.2), PW, 0.01, 0.4); g.box(cx + s * (PW / 2 - 0.2), 0.115, cz, 0.4, 0.01, PD); } } }
    else if (k === "crust") { ctx.albedo(SALT); ctx.color(WHITE); g.box(cx, 0.08, cz, PW, 0.06, PD); }
    else if (k === "raked") { ctx.albedo(SALT); ctx.color(WHITE); g.box(cx, 0.06, cz, PW, 0.04, PD);
      for (let r = 0; r < 5; r++) { const z = cz - PD / 2 + 0.5 + r * ((PD - 1) / 4); g.tube([[cx - PW / 2 + 0.4, 0.06, z, 0.18], [cx, 0.12, z, 0.22], [cx + PW / 2 - 0.4, 0.06, z, 0.18]], 6); } }
    else if (lod <= 3) { ctx.albedo(null); ctx.color("oklch(0.38 0.04 70)"); for (let n = 0; n < 6; n++) g.box(cx - PW / 2 + 0.6 + R() * (PW - 1.2), 0.05, cz - PD / 2 + 0.5 + R() * (PD - 1), 0.6 + R(), 0.02, 0.4 + R() * 0.6); }
  }
  // the brine flume along the north bund, on trestles, a sluice into each first-row pan
  { const z = Z0 - BW - 0.9, xa = 24, xb = X0 - 1, y = (x) => 1.0 + (x - xb) * 0.008;
    ctx.albedo(TEX.oak); ctx.color(WOOD);
    const L = xa - xb, mx = (xa + xb) / 2, a = Math.atan2(y(xa) - y(xb), L);
    g.at(X([mx, y(mx), z], 0, 0, a * 180 / Math.PI), () => { g.box(0, 0, 0, L, 0.06, 0.7); for (const s of [-1, 1]) g.box(0, 0.18, s * 0.33, L, 0.36, 0.05); });
    ctx.color(BRINE); ctx.albedo(null); g.at(X([mx, y(mx) + 0.2, z], 0, 0, a * 180 / Math.PI), () => g.box(0, 0, 0, L, 0.02, 0.6));
    ctx.albedo(TEX.oak); ctx.color(DARK);
    for (let x = xb + 1; x <= xa; x += 3) for (const s of [-1, 1]) beam(g, [x, 0, z + s * 0.5], [x, y(x) - 0.05, z + s * 0.3], 0.07);
    for (let i = 0; i < COLS; i++) { const [cx] = panAt(i, 0); ctx.color(WOOD); g.box(cx, y(cx) - 0.25, z + 0.7, 0.3, 0.06, 1.2); ctx.color(DARK); g.box(cx, y(cx) + 0.3, z + 0.38, 0.4, 0.5, 0.05); g.box(cx, y(cx) + 0.6, z + 0.38, 0.06, 0.4, 0.06); }
  }
  // the windpump at the north-east corner: a tapering lattice, a canvas-sailed wheel turned to the sea wind, a brine tank
  { const px = 26, pz = Z0 - BW - 1.6, H = 7.5;
    ctx.albedo(TEX.oak); ctx.color(WOOD);
    const legs = [[-1.3, -1.3], [1.3, -1.3], [1.3, 1.3], [-1.3, 1.3]];
    for (const [lx, lz] of legs) beam(g, [px + lx, 0, pz + lz], [px + lx * 0.3, H, pz + lz * 0.3], 0.1);
    if (lod <= 3) for (let n = 0; n < 4; n++) { const [ax, az] = legs[n], [bx, bz] = legs[(n + 1) % 4];
      for (const [h0, h1] of [[0.3, 3.2], [3.2, 6.2]]) { const f0 = 1 - 0.7 * h0 / H, f1 = 1 - 0.7 * h1 / H;
        beam(g, [px + ax * f0, h0, pz + az * f0], [px + bx * f1, h1, pz + bz * f1], 0.05); beam(g, [px + bx * f0, h0, pz + bz * f0], [px + ax * f1, h1, pz + az * f1], 0.05); } }
    ctx.color(DARK); g.box(px, H + 0.25, pz, 1.2, 0.5, 1.4); g.box(px, H + 0.35, pz + 1.6, 0.06, 0.06, 2.6); ctx.albedo(TEX.canvas); ctx.color(CANVAS); g.box(px, H + 0.5, pz + 2.9, 0.04, 1.2, 1.4);
    ctx.albedo(TEX.oak); ctx.color(DARK); beam(g, [px, H + 0.35, pz - 0.7], [px, H + 0.35, pz - 1.1], 0.12);
    const blades = lod <= 2 ? 8 : 4;
    for (let b = 0; b < blades; b++) { const ang = b / blades * 360 + 7;
      g.at(X([px, H + 0.35, pz - 1.1], 0, 0, ang), () => { ctx.albedo(TEX.oak); ctx.color(DARK); g.box(0, 1.5, 0, 0.08, 3, 0.08); ctx.albedo(TEX.canvas); ctx.color(b % 3 === 2 ? "oklch(0.7 0.03 80)" : CANVAS); g.box(0.22, 1.9, 0, 0.42, 2.1, 0.03); }); }
    ctx.albedo(null); ctx.color(RUST); g.box(px, H / 2, pz, 0.05, H, 0.05);
    ctx.albedo(TEX.oak); ctx.color(WOOD); g.box(px - 2.4, 0.6, pz + 0.5, 2.2, 1.2, 1.6); ctx.albedo(null); ctx.color(BRINE); g.box(px - 2.4, 1.15, pz + 0.5, 2.0, 0.02, 1.4);
  }
  // the salt shed: fieldstone back and ends, oak posts across the open east front, mossy slate
  { const cx = -17, cz = 0, w = 6.6, d = 8.6, eave = 2.6, ridge = 4.3;
    ctx.albedo(TEX.fieldstone); ctx.color("oklch(0.82 0.02 100)");
    g.box(cx - w / 2 + 0.3, eave / 2, cz, 0.6, eave, d); for (const s of [-1, 1]) g.box(cx, eave / 2, cz + s * (d / 2 - 0.3), w, eave, 0.6);
    for (const s of [-1, 1]) { const zz = cz + s * (d / 2 - 0.3); g.tri([cx - w / 2, eave, zz + 0.31 * s], [cx + w / 2, eave, zz + 0.31 * s], [cx, ridge, zz + 0.31 * s]); g.tri([cx + w / 2, eave, zz - 0.31 * s], [cx - w / 2, eave, zz - 0.31 * s], [cx, ridge, zz - 0.31 * s]); }
    ctx.albedo(TEX.oak); ctx.color(DARK);
    for (const z of [-d / 2 + 0.6, -1.4, 1.4, d / 2 - 0.6]) beam(g, [cx + w / 2 - 0.2, 0, cz + z], [cx + w / 2 - 0.2, eave, cz + z], 0.13);
    g.box(cx + w / 2 - 0.2, eave, cz, 0.25, 0.25, d); g.box(cx, ridge, cz, 0.2, 0.2, d + 0.6);
    const run = w / 2 + 0.4, a = Math.atan2(ridge - eave, w / 2) * 180 / Math.PI, sl = Math.hypot(run, (ridge - eave) * run / (w / 2));
    ctx.albedo(TEX.slate); ctx.color("oklch(0.74 0.05 130)");
    for (const s of [-1, 1]) g.at(X([cx + s * run / 2, (ridge + eave) / 2 + 0.05 - 0.2 * 0.4 / run, cz], 0, 0, -s * a), () => g.box(0, 0, 0, sl, 0.14, d + 0.8));
    // sacks and a tally board inside
    ctx.albedo(TEX.canvas); ctx.color(CANVAS);
    for (let r = 0; r < 3; r++) for (let n = 0; n < 5 - r; n++) { const sx = cx - 2.2 + R() * 0.2, sz = cz - 2.6 + n * 1.1 + r * 0.55, sy = 0.32 + r * 0.55;
      if (lod <= 2) g.tris(g.blob([sx, sy, sz], [0.45, 0.3, 0.5], 1, 0.15, 1.3, n + r * 7)); else g.box(sx, sy, sz, 0.85, 0.55, 0.9); }
    ctx.albedo(TEX.oak); ctx.color(WOOD); g.box(cx - 0.4, 0.45, cz + 2.6, 1.8, 0.9, 1.2); ctx.albedo(SALT); ctx.color(WHITE); g.tube([[cx - 0.4, 0.9, cz + 2.6, 0.6], [cx - 0.4, 1.3, cz + 2.6, 0.1]], 8, { capB: true });
    if (lod <= 2) { ctx.albedo(TEX.oak); ctx.color("oklch(0.55 0.04 70)"); g.box(cx - w / 2 + 0.62, 1.6, cz + 1.5, 0.04, 0.8, 1.1); ctx.albedo(null); ctx.color("oklch(0.3 0.02 60)"); for (let t = 0; t < 7; t++) g.box(cx - w / 2 + 0.65, 1.35 + (t % 4) * 0.12, cz + 1.1 + Math.floor(t / 4) * 0.4 + (t % 4) * 0.06, 0.01, 0.08, 0.02); }
  }
  // salt heaps in the yard, the eastmost under a thatch cover
  ctx.albedo(SALT); ctx.color(WHITE);
  for (const [x, z, r, h] of [[-10, -6.5, 1.8, 1.9], [-9.5, 6.8, 1.5, 1.6], [-11.8, 3.6, 1.1, 1.1]]) g.tube([[x, 0, z, r], [x, h * 0.55, z, r * 0.55], [x, h, z, 0.12]], lod <= 2 ? 12 : 7, { capB: true });
  { const x = -10, z = -6.5; ctx.albedo(TEX.oak); ctx.color(DARK);
    for (const [dx, dz] of [[-2, -2], [2, -2], [2, 2], [-2, 2]]) beam(g, [x + dx, 0, z + dz], [x + dx, 2.5, z + dz], 0.09);
    ctx.albedo(THATCH); ctx.color("oklch(0.68 0.06 85)");
    for (const s of [-1, 1]) g.at(X([x, 2.9, z + s * 1.15], 0, s * 30, 0), () => g.box(0, 0, 0, 5, 0.25, 2.6)); }
  // the rake rack by the shed corner
  { const x = -12.4, z = -4.6; ctx.albedo(TEX.oak); ctx.color(DARK); for (const dx of [-1.2, 1.2]) beam(g, [x + dx, 0, z], [x + dx, 1.3, z], 0.07); g.box(x, 1.25, z, 2.6, 0.1, 0.1);
    ctx.color(WOOD); for (let n = 0; n < 4; n++) { const rx = x - 0.9 + n * 0.6; beam(g, [rx, 0.1, z + 0.9], [rx + 0.1, 2.3, z - 0.1], 0.03); g.box(rx, 0.12, z + 0.95, 0.12, 0.08, 0.7); } }
  // barrels and a cart wheel at the shed front
  if (lod <= 3) { ctx.albedo(TEX.oak); ctx.color(WOOD);
    for (const [x, z] of [[-12.6, 1.4], [-12.9, 2.4], [-12.1, 2.0]]) g.tube([[x, 0, z, 0.36], [x, 0.45, z, 0.42], [x, 0.9, z, 0.36]], 8, { capB: true });
    ctx.color(DARK); g.at(X([-13.2, 0.75, -1.6], 0, 0, 78), () => { g.tube([[0, -0.04, 0, 0.72], [0, 0.04, 0, 0.72]], 12); }); }
  ctx.albedo(null); ctx.color(null);
}
export function collider() {
  return [
    { kind: "box", width: 0.6, height: 2.6, depth: 8.6, center: [-20, 1.3, 0] },
    { kind: "box", width: 6.6, height: 2.6, depth: 0.6, center: [-17, 1.3, -4] }, { kind: "box", width: 6.6, height: 2.6, depth: 0.6, center: [-17, 1.3, 4] },
    { kind: "box", width: 2.2, height: 1.2, depth: 1.6, center: [23.6, 0.6, -10.8] }, { kind: "box", width: 2.6, height: 1.6, depth: 2.6, center: [26, 0.8, -11.3] },
    { kind: "box", width: 2.6, height: 1.4, depth: 2.6, center: [-10, 0.7, -6.5] }, { kind: "box", width: 2.2, height: 1.2, depth: 2.2, center: [-9.5, 0.6, 6.8] },
  ];
}
