// The Hollin Spire, inside: a ruined round tower four floors high. Stairs hug the wall in half-turns,
// each landing cut through the floor above; the crown is open to the sky, its wall broken on the north.
// Local metres around the tower's centre, y up. Angle a: x = cos a · r, z = sin a · r (90° is south, the door).
import { G, TEX } from "../lib/geo.js";
export const SPIRE = { rin: 8, rout: 9.2, levels: [0, 6, 12, 18], top: 23, door: [80, 100], stairR: [5.2, 7.9], steps: 20, sweep: 180, start: 110, gap: 30 };
const D = Math.PI / 180;
export const flightStart = (k) => SPIRE.start + k * (SPIRE.sweep + SPIRE.gap);
function slab(g, a0, a1, r0, r1, y0, y1) {   // a solid annular sector
  const P = (a, r, y) => [Math.cos(a * D) * r, y, Math.sin(a * D) * r];
  const A = P(a0, r0, y0), B = P(a1, r0, y0), C = P(a1, r1, y0), E = P(a0, r1, y0);
  const A2 = P(a0, r0, y1), B2 = P(a1, r0, y1), C2 = P(a1, r1, y1), E2 = P(a0, r1, y1);
  g.quad(A2, B2, C2, E2); g.quad(E, C, B, A);           // top, bottom
  g.quad(E, E2, C2, C); if (r0 > 0.01) g.quad(B, B2, A2, A);  // outer, inner
  g.quad(A, A2, E2, E); g.quad(C, C2, B2, B);           // ends
}
const inArc = (a, lo, hi) => { const m = (x) => ((x % 360) + 360) % 360; const d = m(a - lo); return d <= m(hi - lo) || m(hi - lo) === 0; };
export function geometry(ctx) {
  const g = new G(ctx), S = SPIRE, lo = ctx.lod >= 4, N = lo ? 16 : 36, da = 360 / N;
  // walls: a band per floor; windows every few segments; the door at the south; a ragged, broken crown
  ctx.albedo(TEX.fieldstone); ctx.color("oklch(0.82 0.02 80)");
  for (let i = 0; i < N; i++) {
    const a0 = i * da, a1 = a0 + da, mid = a0 + da / 2;
    const ragged = S.top - ((i * 37) % 7) * 0.45 - (inArc(mid, 240, 300) ? 4.5 : 0);   // the north side fell in
    for (let k = 0; k < S.levels.length; k++) {
      const y0 = S.levels[k], y1 = k + 1 < S.levels.length ? S.levels[k + 1] : ragged;
      if (k === 0 && inArc(mid, S.door[0], S.door[1])) { slab(g, a0, a1, S.rin, S.rout, 3.4, y1); continue; }
      const win = !lo && k > 0 && i % 6 === 2 && y1 - y0 > 4;
      if (win) { slab(g, a0, a1, S.rin, S.rout, y0, y0 + 1.5); slab(g, a0, a1, S.rin, S.rout, y0 + 3.3, y1); }
      else slab(g, a0, a1, S.rin, S.rout, y0, y1);
    }
  }
  // floors: flagstone discs, each with the landing hole where the flight below comes up through it
  ctx.albedo(TEX.flag); ctx.color("oklch(0.78 0.02 80)");
  const FN = lo ? 12 : 24, fa = 360 / FN;
  for (let k = 0; k < S.levels.length; k++) {
    const y = S.levels[k];
    for (let i = 0; i < FN; i++) {
      const a0 = i * fa, a1 = a0 + fa, mid = a0 + fa / 2;
      const s = k > 0 ? flightStart(k - 1) : null;
      const hole = s != null && inArc(mid, s + S.sweep / 2 - 6, s + S.sweep + 4);
      if (hole) slab(g, a0, a1, 0, S.stairR[0] - 0.2, y - 0.4, y);
      else slab(g, a0, a1, 0, S.rin + 0.05, y - 0.4, y);
    }
  }
  // stairs: solid blocks rising along the wall, each from the flight's floor to its tread
  ctx.albedo(TEX.fieldstone); ctx.color("oklch(0.7 0.02 80)");
  for (let k = 0; k + 1 < S.levels.length; k++) {
    const s = flightStart(k), base = S.levels[k], rise = (S.levels[k + 1] - base) / S.steps, sd = S.sweep / S.steps;
    for (let j = 0; j < S.steps; j++) slab(g, s + j * sd, s + (j + 1) * sd + 0.3, S.stairR[0], S.stairR[1] + 0.12, base, base + (j + 1) * rise);
  }
  // rubble where the north crown came down, on the top floor
  if (!lo) { ctx.albedo(TEX.rock); ctx.color("oklch(0.65 0.02 80)"); for (let i = 0; i < 9; i++) { const a = (250 + i * 6) * D, r = 5 + (i % 3) * 0.9; g.blob([Math.cos(a) * r, S.levels[3] + 0.2, Math.sin(a) * r], 0.5 + (i % 4) * 0.2, 1, 0.35, 1.3, i, S.levels[3]); } }
  ctx.albedo(null); ctx.color(null);
}
