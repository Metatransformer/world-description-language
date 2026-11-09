// An iron flanged mace, 0.7 m: origin at the grip centre, handle along +Y, seven flanges round a cast head with a crown spike.
// Leather grip, iron shaft and collars, worn darkened iron. Levels: 1 every rivet and ridge … 5 a hull.
import { mesher, mix, hex } from "../lib/mesh.js";

const IRON = [0.5, 0.5, 0.5], EDGE = [0.72, 0.72, 0.71], DARK = [0.36, 0.35, 0.34], LEATHER = [0.3, 0.19, 0.11], GROOVE = [0.15, 0.09, 0.05];
const SIDES = [0, 18, 12, 9, 7, 6];

export function geometry(ctx) {
  const lod = ctx.lod ?? 1, n = SIDES[lod] ?? 8, fine = lod <= 2;
  const m = mesher(ctx, { vertexColors: true });
  const nz = (p, f) => Math.max(-1, Math.min(1, ctx.noise3d(p[0] * f, p[1] * f, p[2] * f)));
  const worn = (c, p, a = 0.22, f = 41) => hex(c, 1 + (fine ? a * nz(p, f) : 0));
  ctx.smooth();

  // GRIP: spiral leather
  ctx.metalness(0); ctx.roughness(0.85);
  const gl = [], gs = lod <= 1 ? 22 : lod <= 2 ? 12 : 4;
  for (let i = 0; i <= gs; i++) { const y = -0.1 + (i / gs) * 0.2; gl.push([0.017, y]); }
  const wrap = (p, a) => Math.abs(Math.sin((p[1] * 45 + a / (2 * Math.PI)) * Math.PI));
  m.lathe(gl, { sides: n, bump: fine ? (p, d, t, a) => 1 + 0.12 * wrap(p, a) : null, colorOf: (p, d, t, a) => worn(fine ? mix(GROOVE, LEATHER, wrap(p, a)) : LEATHER, p, 0.15, 60) });

  // SHAFT, collars, knob
  ctx.metalness(0.55); ctx.roughness(0.5);
  m.lathe([[0.0145, 0.09], [0.0135, 0.25], [0.0135, 0.38], [0.016, 0.44]], { sides: n, colorOf: (p) => worn(IRON, p) });
  for (const yc of [0.1, -0.1, 0.32]) m.lathe([[0.017, yc - 0.008], [0.021, yc - 0.004], [0.021, yc + 0.004], [0.017, yc + 0.008]], { sides: n, capStart: 0, capEnd: 0, colorOf: (p) => worn(DARK, p) });
  m.lathe([[0.012, -0.105], [0.022, -0.112], [0.026, -0.125], [0.02, -0.138], [0, -0.142]], { sides: n, k: lod <= 2 ? 2 : 1, capStart: 0, colorOf: (p) => worn(DARK, p) });

  // HEAD: a cast core, seven flanges, a crown spike
  m.lathe([[0.016, 0.43], [0.026, 0.45], [0.03, 0.5], [0.03, 0.56], [0.026, 0.6], [0.018, 0.615], [0.012, 0.64], [0.004, 0.69], [0, 0.7]],
    { sides: n, k: lod <= 2 ? 2 : 1, capStart: 0, colorOf: (p) => worn(DARK, p) });
  ctx.flat();
  const prof = lod <= 3 ? [[0.024, 0.44], [0.05, 0.46], [0.07, 0.5], [0.074, 0.55], [0.062, 0.6], [0.026, 0.62]] : [[0.024, 0.44], [0.072, 0.5], [0.07, 0.58], [0.026, 0.62]];
  const FL = 7, th = 0.0055;
  for (let f = 0; f < FL; f++) {
    const a = (f / FL) * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a), px = -sa, pz = ca;
    const at = (r, y, s, taper) => [r * ca + px * s * taper, y, r * sa + pz * s * taper];
    const tp = (r) => 1 - 0.45 * (r - 0.024) / 0.05; // thinner toward the striking edge
    const front = prof.map(([r, y]) => at(r, y, th, tp(r))), back = prof.map(([r, y]) => at(r, y, -th, tp(r)));
    const inside = prof.reduce((a, [r, y]) => [a[0] + r * ca / prof.length, a[1] + y / prof.length, a[2] + r * sa / prof.length], [0, 0, 0]);
    const nF = front.length;
    for (let i = 1; i < nF - 1; i++) { m.triIn(front[0], front[i], front[i + 1], inside, worn(IRON, front[i])); m.triIn(back[0], back[i], back[i + 1], inside, worn(IRON, back[i])); }
    for (let i = 0; i < nF; i++) {
      const j = (i + 1) % nF, c = i === 0 || i === nF - 1 ? worn(DARK, front[i]) : worn(EDGE, front[i], 0.15);
      m.triIn(front[i], front[j], back[j], inside, c, c, c); m.triIn(front[i], back[j], back[i], inside, c, c, c);
    }
  }
  return m.done();
}
