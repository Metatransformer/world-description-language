// PIECES: bench. Each bench a hand-built generator drew, kept verbatim as a palette factory: bench_<home>(pal) hands back
// that home's bench drawing in whatever colours, textures and helpers pal carries. The home passes its own (it draws as
// it always did); a kit case or another building passes its palette to draw the same shape its way.
export function bench_crownHall(pal) {
  const { BX, F, OAK, WOOD, paint } = pal;
  return function bench(c, x0, z0, x1, z1, y = F) { paint(c, OAK, WOOD); BX(c, x0, y + 0.42, z0, x1, y + 0.48, z1); BX(c, x0 + 0.1, y, z0, x0 + 0.18, y + 0.42, z1); BX(c, x1 - 0.18, y, z0, x1 - 0.1, y + 0.42, z1); }
}

export function bench_hbStreet(pal) {
  const { ASH, BX, IR, IRONC, OAK, RB, WOOD, paint } = pal;
  return function bench(c, D) { // a stone-footed oak bench, rain-dark slats, iron straps
  paint(c, ASH, "oklch(0.8 0.02 80)"); for (const x of [-0.75, 0.75]) BX(c, x - 0.12, 0, -0.22, x + 0.12, 0.4, 0.22);
  paint(c, OAK, WOOD); for (let i = 0; i < 3; i++) BX(c, -0.95, 0.4, -0.22 + i * 0.15, 0.95, 0.46, -0.1 + i * 0.15);
  for (const x of [-0.75, 0.75]) BX(c, x - 0.05, 0.46, 0.16, x + 0.05, 0.92, 0.22);
  for (let i = 0; i < 2; i++) RB(c, 0, 0.62 + i * 0.2, 0.22, 1.9, 0.12, 0.04, 0, -8);
  if (D <= 2) { paint(c, IR, IRONC); for (const x of [-0.75, 0.75]) BX(c, x - 0.02, 0.38, -0.24, x + 0.02, 0.47, 0.24); }
}
}

export function bench_innHall(pal) {
  const { BX, OAK, OAKD, OAKL, paint } = pal;
  return function bench(c, x, z, y, L, D) {
  paint(c, OAK, OAKL); BX(c, x - L / 2, y + 0.4, z - 0.175, x + L / 2, y + 0.46, z + 0.175);
  paint(c, OAK, OAKD); for (const s of [-1, 1]) BX(c, x + s * (L / 2 - 0.2) - 0.035, y, z - 0.15, x + s * (L / 2 - 0.2) + 0.035, y + 0.4, z + 0.15);
  if (D <= 2) BX(c, x - L / 2 + 0.2, y + 0.14, z - 0.03, x + L / 2 - 0.2, y + 0.2, z + 0.03); }
}

export function bench_magesGuild(pal) {
  const { BENCH, P, TX, add, at, box, candle, flameTip, frame, lathe, mat } = pal;
  return function bench(ctx, lod) {
  const f = frame(BENCH.a, BENCH.r);
  mat(ctx, TX.oak, "oklch(0.88 0.02 55)");
  box(ctx, at(f, 0, 0, 0.88), f.t, f.n, 2.2, 0.07, 0.75);
  for (const [x, z] of [[-1.02, -0.3], [1.02, -0.3], [-1.02, 0.3], [1.02, 0.3]]) box(ctx, at(f, x, z, 0), f.t, f.n, 0.09, 0.88, 0.09, true);
  box(ctx, at(f, 0, 0, 0.24), f.t, f.n, 2.0, 0.04, 0.62);
  // shelf of jars on the wall above
  box(ctx, at(f, 0, 0.22, 1.55), f.t, f.n, 1.8, 0.04, 0.24);
  if (lod > 1) return;
  // clay jars below
  for (const [x, r, h] of [[-0.7, 0.11, 0.24], [-0.4, 0.09, 0.2], [0.5, 0.12, 0.26], [0.78, 0.08, 0.18]]) {
    mat(ctx, null, "#8a5a3a", 0.9);
    lathe(ctx, at(f, x, 0.05, 0.28), [[0, 0], [r * 0.8, 0], [r, h * 0.4], [r * 0.75, h * 0.9], [r * 0.5, h], [0, h]], 10);
  }
  // glowing bottles
  const B = [
    [-0.9, 0.1, 0.07, 0.2, "oklch(0.6 0.15 150)", [0.05, 0.6, 0.2]], [-0.72, -0.05, 0.05, 0.26, "oklch(0.55 0.15 300)", [0.4, 0.08, 0.7]],
    [-0.55, 0.15, 0.09, 0.16, "oklch(0.7 0.14 70)", [0.7, 0.35, 0.05]], [-0.2, 0.12, 0.06, 0.22, "oklch(0.65 0.12 220)", [0.08, 0.35, 0.8]],
    [0.05, 0.18, 0.05, 0.18, "oklch(0.6 0.16 20)", [0.7, 0.1, 0.06]], [0.9, 0.05, 0.07, 0.24, "oklch(0.65 0.14 160)", [0.05, 0.55, 0.35]],
    [0.75, 0.2, 0.05, 0.15, "oklch(0.6 0.15 300)", [0.45, 0.1, 0.75]],
  ];
  for (const [x, z, r, h, c, e] of B) {
    ctx.albedo(null); ctx.color(c, 0.82); ctx.roughness(0.08); ctx.emissive(...e);
    lathe(ctx, at(f, x, z, 0.95), [[0, 0], [r, 0], [r, h * 0.62], [r * 0.35, h * 0.8], [0.022, h * 0.85], [0.022, h + 0.07], [0, h + 0.07]], 10);
    ctx.emissive(null); ctx.color("#6a4a30", 1); ctx.roughness(0.9);
    lathe(ctx, at(f, x, z, 0.95 + h + 0.06), [[0.026, 0], [0.026, 0.035], [0, 0.035]], 6);
  }
  // alembic on an iron tripod
  mat(ctx, TX.iron, "oklch(0.9 0 0)", 0.5); ctx.metalness(0.6);
  const ac = at(f, 0.4, 0, 0.95);
  for (const a of [0, 120, 240]) { const g = add(ac, P(0.13, a, 0)); box(ctx, g, [1, 0, 0], [0, 0, 1], 0.025, 0.2, 0.025, true); }
  lathe(ctx, add(ac, [0, 0.2, 0]), [[0.16, 0], [0.16, 0.02], [0, 0.02]], 10);
  ctx.albedo(null); ctx.color("oklch(0.7 0.1 200)", 0.6); ctx.roughness(0.05); ctx.emissive(0.05, 0.35, 0.55);
  lathe(ctx, add(ac, [0, 0.22, 0]), [[0, 0], [0.1, 0.02], [0.16, 0.12], [0.12, 0.25], [0.03, 0.3], [0.03, 0.45], [0, 0.45]], 12);
  ctx.emissive(null); ctx.color("oklch(0.9 0.01 90)", 1);
  // mortar and pestle
  mat(ctx, TX.stone, "oklch(0.93 0.01 90)");
  lathe(ctx, at(f, -0.35, -0.15, 0.95), [[0, 0], [0.09, 0], [0.11, 0.1], [0.07, 0.1], [0, 0.04]], 10);
  // jars on the wall shelf
  for (const [x, c, e] of [[-0.6, "oklch(0.6 0.12 120)", [0.1, 0.3, 0.05]], [-0.2, "oklch(0.65 0.1 40)", null], [0.3, "oklch(0.6 0.13 260)", [0.15, 0.15, 0.6]], [0.65, "oklch(0.7 0.05 90)", null]]) {
    ctx.albedo(null); ctx.color(c, e ? 0.8 : 1); ctx.roughness(e ? 0.08 : 0.8); if (e) ctx.emissive(...e); else ctx.emissive(null);
    lathe(ctx, at(f, x, 0.22, 1.59), [[0, 0], [0.07, 0], [0.07, 0.17], [0.05, 0.2], [0, 0.2]], 8);
  }
  ctx.emissive(null);
  candle(ctx, at(f, -0.95, -0.2, 0.95), 0.1, lod); flameTip(ctx, at(f, -0.95, -0.2, 0.95 + 0.14), 0.022);
}
}

export function bench_magesHall(pal) {
  const { OAK, WOODC, gb, m } = pal;
  return function bench(c, g) { m(c, OAK, WOODC); gb(c, g, -0.2, 0.42, -0.9, 0.2, 0.48, 0.9); for (const z of [-0.75, 0.75]) gb(c, g, -0.16, 0, z - 0.05, 0.16, 0.42, z + 0.05); gb(c, g, -0.03, 0.15, -0.75, 0.03, 0.22, 0.75); }
}

export function bench_valenfeldKeepHall(pal) {
  const { BX, OAK, WOOD2, paint } = pal;
  return function bench(c, x0, z0, x1, z1) { paint(c, OAK, WOOD2); BX(c, x0, 0.4, z0, x1, 0.46, z1);
  const along = x1 - x0 > z1 - z0; for (const t of [0.12, 0.88]) along ? BX(c, x0 + (x1 - x0) * t - 0.04, 0, z0 + 0.04, x0 + (x1 - x0) * t + 0.04, 0.4, z1 - 0.04) : BX(c, x0 + 0.04, 0, z0 + (z1 - z0) * t - 0.04, x1 - 0.04, 0.4, z0 + (z1 - z0) * t + 0.04); }
}

export const STYLES = { "crown-hall": bench_crownHall, "hb-street": bench_hbStreet, "inn-hall": bench_innHall, "mages-guild": bench_magesGuild, "mages-hall": bench_magesHall, "valenfeld-keep-hall": bench_valenfeldKeepHall };
