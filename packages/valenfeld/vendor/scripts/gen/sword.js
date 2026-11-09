// An iron longsword: origin at the grip centre, blade along +Y (0.9 m), cross-guard, leather-wrapped grip, wheel pommel.
// Worn iron with a fuller down the forte; flat-lit blade facets, smooth grip and fittings. Levels: 1 every wrap ridge … 5 a hull.
import { mesher, mix, hex } from "../lib/mesh.js";

const IRON = [0.62, 0.63, 0.64], EDGE = [0.86, 0.87, 0.88], FULL = [0.36, 0.37, 0.38], FIT = [0.4, 0.38, 0.36];
const LEATHER = [0.32, 0.2, 0.11], GROOVE = [0.16, 0.1, 0.06];
const SIDES = [0, 20, 14, 10, 8, 6];

export function geometry(ctx) {
  const lod = ctx.lod ?? 1, n = SIDES[lod] ?? 8, fine = lod <= 2;
  const m = mesher(ctx, { vertexColors: true });
  const nz = (p, f) => Math.max(-1, Math.min(1, ctx.noise3d(p[0] * f, p[1] * f, p[2] * f)));
  const worn = (c, p, a = 0.2, f = 37) => hex(c, 1 + (fine ? a * nz(p, f) : 0));

  // BLADE: lens section with a fuller groove, tapering to a point
  ctx.flat(); ctx.metalness(0.55); ctx.roughness(0.38);
  const y0 = 0.12, L = 0.9, steps = lod <= 1 ? 22 : lod <= 2 ? 12 : lod <= 3 ? 6 : 3;
  const rings = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps, y = y0 + t * (L - 0.02);
    let w = 0.027 - 0.009 * t;
    if (t > 0.86) w *= Math.max(0.06, (1 - t) / 0.14);
    const th = 0.0048 * (1 - 0.5 * t), fd = t < 0.7 ? 0.45 : 1, fw = Math.min(0.0085 * (1 - 0.4 * t), w * 0.35);
    const sec = lod >= 4
      ? [[w, 0, EDGE], [0, th, IRON], [-w, 0, EDGE], [0, -th, IRON]]
      : [[w, 0, EDGE], [w * 0.55, th * 0.8, IRON], [fw + 0.003, th, IRON], [fw, th * fd, FULL], [-fw, th * fd, FULL], [-fw - 0.003, th, IRON], [-w * 0.55, th * 0.8, IRON],
         [-w, 0, EDGE], [-w * 0.55, -th * 0.8, IRON], [-fw - 0.003, -th, IRON], [-fw, -th * fd, FULL], [fw, -th * fd, FULL], [fw + 0.003, -th, IRON], [w * 0.55, -th * 0.8, IRON]];
    const pts = sec.map(([x, z]) => [x, y, z]);
    rings.push({ pts, cols: sec.map(([x, z, c], j) => worn(c, pts[j], 0.22)), c: [0, y, 0], t: [0, 1, 0], r: w });
  }
  m.loft(rings, { capStart: 0, capEnd: 0.02, capColEnd: hex(EDGE) });

  // CROSS-GUARD: a bar sweeping toward the blade, knobbed ends, a langet block at the centre
  ctx.smooth(); ctx.metalness(0.55); ctx.roughness(0.5);
  const gp = [];
  for (let i = 0; i <= 8; i++) { const u = i / 8 * 2 - 1, x = u * 0.115; gp.push({ p: [x, 0.108 + 0.02 * u * u, 0], rx: 0.011 + 0.006 * (1 - u * u) + (Math.abs(u) > 0.9 ? 0.004 : 0), ry: 0.012 + 0.005 * (1 - u * u) }); }
  m.tube(gp, { sides: n, k: lod <= 2 ? 2 : 1, ref: [0, 0, -1], capStart: 0.01, capEnd: 0.01, colorOf: (p) => worn(FIT, p, 0.25, 50) });
  if (lod <= 4) { ctx.flat(); m.box([-0.022, 0.096, -0.011], [0.022, 0.126, 0.011], worn(FIT, [0, 0.1, 0])); ctx.smooth(); }

  // GRIP: leather wrapped in a spiral over a slightly swelled core, iron ferrules
  ctx.metalness(0); ctx.roughness(0.85);
  const gl = [], gs = lod <= 1 ? 26 : lod <= 2 ? 14 : 5;
  for (let i = 0; i <= gs; i++) { const y = -0.098 + (i / gs) * 0.196; gl.push([0.0155 + 0.0022 * Math.sin(Math.PI * (y + 0.098) / 0.196), y]); }
  const wrap = (p, a) => Math.abs(Math.sin((p[1] * 48 + a / (2 * Math.PI)) * Math.PI));
  m.lathe(gl, { sides: n, bump: fine ? (p, d, t, a) => 1 + 0.12 * wrap(p, a) : null, colorOf: (p, d, t, a) => worn(fine ? mix(GROOVE, LEATHER, wrap(p, a)) : LEATHER, p, 0.15, 60) });
  ctx.metalness(0.55); ctx.roughness(0.5);
  for (const yc of [0.092, -0.095]) m.lathe([[0.017, yc - 0.007], [0.0195, yc - 0.004], [0.0195, yc + 0.004], [0.017, yc + 0.007]], { sides: n, capStart: 0, capEnd: 0, colorOf: (p) => worn(FIT, p) });

  // POMMEL: a wheel with a peen
  m.lathe([[0.012, -0.1], [0.02, -0.106], [0.027, -0.117], [0.029, -0.13], [0.025, -0.143], [0.013, -0.151], [0.006, -0.156], [0, -0.158]],
    { sides: n, k: lod <= 2 ? 2 : 1, capStart: 0, colorOf: (p) => worn(FIT, p, 0.25, 50) });
  return m.done();
}
