// PIECES: table. Each table a hand-built generator drew, kept verbatim as a palette factory: table_<home>(pal) hands back
// that home's table drawing in whatever colours, textures and helpers pal carries. The home passes its own (it draws as
// it always did); a kit case or another building passes its palette to draw the same shape its way.
export function table_crownHall(pal) {
  const { BX, F, OAK, WOOD, paint } = pal;
  return function table(c, x0, z0, x1, z1, y = F) { paint(c, OAK, WOOD); BX(c, x0, y + 0.72, z0, x1, y + 0.8, z1); for (const [x, z] of [[x0 + 0.1, z0 + 0.1], [x1 - 0.2, z0 + 0.1], [x0 + 0.1, z1 - 0.2], [x1 - 0.2, z1 - 0.2]]) BX(c, x, y, z, x + 0.1, y + 0.72, z + 0.1); }
}

export function table_innHall(pal) {
  const { BX, OAK, OAKD, OAKL, RB, paint } = pal;
  return function table(c, x, z, y, w, d, D) {
  paint(c, OAK, OAKL); BX(c, x - w / 2, y + 0.72, z - d / 2, x + w / 2, y + 0.78, z + d / 2);
  paint(c, OAK, OAKD);
  for (const s of [-1, 1]) { const ex = x + s * (w / 2 - 0.3);
    BX(c, ex - 0.05, y + 0.64, z - d / 2 + 0.06, ex + 0.05, y + 0.72, z + d / 2 - 0.06); BX(c, ex - 0.06, y, z - d / 2 + 0.04, ex + 0.06, y + 0.08, z + d / 2 - 0.04);
    RB(c, ex, y + 0.36, z - 0.12, 0.08, 0.6, 0.08, 0, -16); RB(c, ex, y + 0.36, z + 0.12, 0.08, 0.6, 0.08, 0, 16); }
  BX(c, x - w / 2 + 0.3, y + 0.24, z - 0.04, x + w / 2 - 0.3, y + 0.32, z + 0.04);
  if (D <= 2) { paint(c, OAK, OAKD); for (let k = 1; k < 4; k++) BX(c, x - w / 2, y + 0.781, z - d / 2 + d * k / 4 - 0.004, x + w / 2, y + 0.785, z - d / 2 + d * k / 4 + 0.004); } }
}

export function table_magesGuild(pal) {
  const { CANDLES, Q, TABLE, TX, UP, add, at, box, candle, frame, lathe, mat } = pal;
  return function table(ctx, lod) {
  const f = frame(TABLE.a, TABLE.r);
  mat(ctx, TX.oak, "oklch(0.9 0.02 60)");
  box(ctx, at(f, 0, 0, 0.78), f.t, f.n, 2.0, 0.07, 0.95);
  for (const [x, z] of [[-0.88, -0.38], [0.88, -0.38], [-0.88, 0.38], [0.88, 0.38]]) box(ctx, at(f, x, z, 0), f.t, f.n, 0.08, 0.78, 0.08, true);
  box(ctx, at(f, 0, 0, 0.18), f.t, f.n, 1.7, 0.06, 0.06);
  // stools
  for (const x of [-0.5, 0.45]) { mat(ctx, TX.oak, "oklch(0.9 0.02 60)"); lathe(ctx, at(f, x, -0.85, 0), [[0.16, 0], [0.05, 0.05], [0.05, 0.42], [0.2, 0.44], [0.2, 0.5], [0, 0.5]], 10); }
  if (lod > 1) return;
  // open book, a stack, inkwell, quill
  ctx.albedo(null); ctx.color("#5a2430"); ctx.roughness(0.8);
  box(ctx, at(f, -0.05, -0.12, 0.85), f.t, f.n, 0.64, 0.02, 0.44);
  ctx.color("oklch(0.88 0.04 85)");
  const bp = (tx, tilt) => { const c = at(f, tx, -0.12, 0.87); box(ctx, c, f.t, f.n, 0.29, 0.025 + tilt, 0.4); };
  bp(-0.2, 0.01); bp(0.1, 0.01);
  ctx.color("#3a2a1e"); box(ctx, at(f, -0.05, -0.12, 0.87), f.t, f.n, 0.02, 0.045, 0.4);
  let y = 0.85;
  for (const [c, w, h] of [["#2a3650", 0.36, 0.07], ["#3c5238", 0.32, 0.06], ["#7a5a2a", 0.28, 0.05]]) { ctx.color(c); box(ctx, at(f, 0.35, 0.22, y), f.t, f.n, w, h, 0.25); y += h; }
  ctx.color("#1a1a1e"); ctx.roughness(0.3); lathe(ctx, at(f, 0.3, -0.3, 0.85), [[0.035, 0], [0.04, 0.04], [0.015, 0.06], [0.015, 0.075], [0, 0.075]], 8);
  ctx.color("oklch(0.93 0.02 90)"); ctx.roughness(0.9);
  const q0 = at(f, 0.3, -0.3, 0.92), q1 = add(q0, f.t, 0.18); q1[1] += 0.12;
  Q(ctx, q0, q1, add(q1, f.n, 0.03), add(q0, f.n, 0.01), UP);
  for (const [tx, nz, h] of CANDLES) candle(ctx, at(f, tx, nz, 0.85), h, lod);
}
}

export function table_tavern(pal) {
  const { F, LA, OAK, WOOD, flatc, paint } = pal;
  return function table(c, x, z) { paint(c, OAK, WOOD); LA(c, x, F, z, [[0.12, 0], [0.12, 0.7], [0.7, 0.7], [0.7, 0.78], [0.01, 0.78]], 10);
  for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const sx = x + a * 1.05, sz = z + b * 1.05; LA(c, sx, F, sz, [[0.08, 0], [0.08, 0.42], [0.25, 0.42], [0.25, 0.48], [0.01, 0.48]], 8); }
  flatc(c, "oklch(0.8 0.05 70)"); LA(c, x + 0.25, F + 0.78, z - 0.1, [[0.07, 0], [0.07, 0.16], [0.01, 0.16]], 8); LA(c, x - 0.3, F + 0.78, z + 0.2, [[0.07, 0], [0.07, 0.16], [0.01, 0.16]], 8); }
}

export function table_valenfeldKeepHall(pal) {
  const { BX, OAK, WOOD, WOOD2, paint } = pal;
  return function table(c, x0, z0, x1, z1, h = 0.78) {
  paint(c, OAK, WOOD); BX(c, x0, h - 0.08, z0, x1, h, z1);
  paint(c, OAK, WOOD2); for (const [x, z] of [[x0 + 0.1, z0 + 0.1], [x1 - 0.18, z0 + 0.1], [x0 + 0.1, z1 - 0.18], [x1 - 0.18, z1 - 0.18]]) BX(c, x, 0, z, x + 0.08, h - 0.08, z + 0.08);
  if (Math.abs(z1 - z0) > 2.5) BX(c, (x0 + x1) / 2 - 0.04, 0.15, z0 + 0.15, (x0 + x1) / 2 + 0.04, 0.23, z1 - 0.15);
  if (Math.abs(x1 - x0) > 2.5) BX(c, x0 + 0.15, 0.15, (z0 + z1) / 2 - 0.04, x1 - 0.15, 0.23, (z0 + z1) / 2 + 0.04);
}
}

export const STYLES = { "crown-hall": table_crownHall, "inn-hall": table_innHall, "mages-guild": table_magesGuild, "tavern": table_tavern, "valenfeld-keep-hall": table_valenfeldKeepHall };
