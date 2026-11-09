// PIECES: shelf. Every shelf the hand-built generators drew, lifted verbatim into one library so any building,
// interior or kit case can draw any of them. shelf_<home> is the one that home drew; STYLES maps a style name to it.
import { BX, IR, IRONC, OAK, WOOD, paint } from "../buildkit.js";

export function shelf_valenfeldKeepHall(c, ax, f, u0, u1, ys, s, d = 0.35) {     // plank shelves on brackets against a wall
  for (const y of ys) { paint(c, OAK, WOOD); ax === "z" ? BX(c, u0, y, f, u1, y + 0.05, f + s * d) : BX(c, f, y, u0, f + s * d, y + 0.05, u1);
    paint(c, IR, IRONC); for (const u of [u0 + 0.15, u1 - 0.15]) ax === "z" ? BX(c, u - 0.02, y - 0.22, f, u + 0.02, y, f + s * 0.2) : BX(c, f, y - 0.22, u - 0.02, f + s * 0.2, y, u + 0.02); }
}
export const STYLES = { "valenfeld-keep-hall": shelf_valenfeldKeepHall };

export function shelf_magesGuild(pal) {
  const { BOOKS, RI, TX, at, box, frame, mat } = pal;
  return function shelf(ctx, a, lod) {
  const f = frame(a, RI - 0.21);
  mat(ctx, TX.oak, "oklch(0.9 0.02 60)");
  box(ctx, at(f, 0, 0.19, 0), f.t, f.n, 1.5, 2.6, 0.04, true);
  box(ctx, at(f, -0.73, 0, 0), f.t, f.n, 0.05, 2.6, 0.42, true);
  box(ctx, at(f, 0.73, 0, 0), f.t, f.n, 0.05, 2.6, 0.42, true);
  box(ctx, at(f, 0, -0.01, 2.6), f.t, f.n, 1.62, 0.07, 0.48);
  box(ctx, at(f, 0, 0, 0), f.t, f.n, 1.45, 0.1, 0.4, true);
  const boards = [0.1, 0.74, 1.38, 2.02];
  for (const y of boards) box(ctx, at(f, 0, 0, y), f.t, f.n, 1.42, 0.035, 0.4);
  ctx.albedo(null); ctx.roughness(0.85);
  for (const y0 of boards) {
    const yb = y0 + 0.035;
    if (lod >= 2) { ctx.color(BOOKS[(a + y0 * 10) % BOOKS.length | 0]); box(ctx, at(f, 0, 0.04, yb), f.t, f.n, 1.36, 0.36, 0.26, true); continue; }
    let x = -0.68;
    while (x < 0.66) {
      if (ctx.random() < 0.07) { x += 0.1 + ctx.random() * 0.1; continue; }
      const bw = 0.035 + ctx.random() * 0.045, bh = 0.26 + ctx.random() * 0.22, bd = 0.2 + ctx.random() * 0.1;
      if (x + bw > 0.68) break;
      ctx.color(BOOKS[(ctx.random() * BOOKS.length) | 0]);
      box(ctx, at(f, x + bw / 2, 0.17 - bd / 2, yb), f.t, f.n, bw, bh, bd, true);
      x += bw + 0.004;
    }
  }
}
}

export function shelf_magesHall(pal) {
  const { BOOKS, OAK, brass, gb, gsolid, m, rng } = pal;
  return function shelf(c, g, w, h, rows, seed, L, f) {
  if (f) return gsolid(f, g, -w / 2, 0, -0.42, w / 2, h, 0);
  const r = rng(seed); m(c, OAK, "oklch(0.75 0.03 60)");
  gb(c, g, -w / 2, 0, -0.42, -w / 2 + 0.06, h, 0); gb(c, g, w / 2 - 0.06, 0, -0.42, w / 2, h, 0); gb(c, g, -w / 2, h - 0.08, -0.45, w / 2, h, 0);
  gb(c, g, -w / 2, 0, -0.04, w / 2, h, 0); gb(c, g, -w / 2, 0, -0.42, w / 2, 0.12, 0);
  const step = (h - 0.25) / rows;
  for (let i = 0; i < rows; i++) {
    const y = 0.12 + i * step; m(c, OAK, "oklch(0.75 0.03 60)"); gb(c, g, -w / 2 + 0.06, y, -0.4, w / 2 - 0.06, y + 0.04, -0.04);
    if (L >= 3) { c.albedo(null); c.color(BOOKS[i % BOOKS.length]); gb(c, g, -w / 2 + 0.08, y + 0.04, -0.34, w / 2 - 0.08, y + step * 0.75, -0.06); continue; }
    let x = -w / 2 + 0.08;
    while (x < w / 2 - 0.14) {
      const bw = 0.04 + r() * 0.05, bh = step * (0.55 + r() * 0.3), d = 0.2 + r() * 0.1;
      if (r() < 0.06) { x += 0.12; continue; }
      m(c, null, BOOKS[(r() * BOOKS.length) | 0], 0.8);
      const lean = r() < 0.08 && x > -w / 2 + 0.3 ? 12 : 0;
      gb(c, g, x, y + 0.04, -0.06 - d, x + bw, y + 0.04 + bh, -0.06, 0, lean);
      if (r() < 0.3) { brass(c); gb(c, g, x - 0.002, y + 0.04 + bh * 0.8, -0.059, x + bw + 0.002, y + 0.04 + bh * 0.84, -0.057); }
      x += bw + 0.004;
    }
  }
}
}

Object.assign(STYLES, { "mages-guild": shelf_magesGuild, "mages-hall": shelf_magesHall });
