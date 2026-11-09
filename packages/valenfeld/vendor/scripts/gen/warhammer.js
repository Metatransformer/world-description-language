// A two-handed warhammer, 1.15 m: origin at the upper grip, haft along +Y. A long ash haft wrapped in two leather grips,
// iron langets up the neck, a squared striking head (a crowned face one side, a curved spike the other), a top spike.
// Same frame as mace.js and sword.js (grip at origin, +Y up the weapon) so every hold and grip that reads one reads this.
import { mesher, mix, hex } from "../lib/mesh.js";

const IRON = [0.48, 0.48, 0.47], EDGE = [0.7, 0.7, 0.68], DARK = [0.3, 0.29, 0.28], ASH = [0.42, 0.3, 0.19], LEATHER = [0.28, 0.17, 0.1], GROOVE = [0.14, 0.08, 0.05];
const SIDES = [0, 14, 10, 8, 6, 5];

export function geometry(ctx) {
  const lod = ctx.lod ?? 1, n = SIDES[lod] ?? 8, fine = lod <= 2, steel = !!ctx.params?.steel;
  const metal = steel ? [0.62, 0.63, 0.65] : IRON, dark = steel ? [0.4, 0.41, 0.43] : DARK;
  const m = mesher(ctx, { vertexColors: true });
  const nz = (p, f) => Math.max(-1, Math.min(1, ctx.noise3d(p[0] * f, p[1] * f, p[2] * f)));
  const worn = (c, p, a = 0.2, f = 37) => hex(c, 1 + (fine ? a * nz(p, f) : 0));
  ctx.smooth();

  // HAFT: ash, -0.5 (pommel end) to +0.62 (into the head)
  ctx.metalness(0); ctx.roughness(0.8);
  m.lathe([[0.019, -0.5], [0.018, -0.2], [0.017, 0.2], [0.018, 0.62]], { sides: n, colorOf: (p) => worn(ASH, p, 0.25, 23) });
  // two leather grips: the lower hand at -0.4, the upper at 0
  const wrap = (p, a) => Math.abs(Math.sin((p[1] * 40 + a / (2 * Math.PI)) * Math.PI));
  for (const [y0, y1] of [[-0.47, -0.3], [-0.08, 0.1]]) {
    const gl = [], gs = lod <= 1 ? 16 : lod <= 2 ? 8 : 3;
    for (let i = 0; i <= gs; i++) gl.push([0.021, y0 + (i / gs) * (y1 - y0)]);
    m.lathe(gl, { sides: n, bump: fine ? (p, d, t, a) => 1 + 0.1 * wrap(p, a) : null, colorOf: (p, d, t, a) => worn(fine ? mix(GROOVE, LEATHER, wrap(p, a)) : LEATHER, p, 0.12, 60) });
  }
  // pommel cap and collars
  ctx.metalness(0.6); ctx.roughness(0.45);
  m.lathe([[0.019, -0.5], [0.027, -0.505], [0.028, -0.53], [0.016, -0.55], [0, -0.555]], { sides: n, capStart: 0, colorOf: (p) => worn(dark, p) });
  for (const yc of [-0.3, 0.1, 0.5]) m.lathe([[0.02, yc - 0.01], [0.024, yc - 0.004], [0.024, yc + 0.004], [0.02, yc + 0.01]], { sides: n, capStart: 0, capEnd: 0, colorOf: (p) => worn(dark, p) });

  ctx.flat();
  // langets: iron straps up the neck
  for (const s of [-1, 1]) m.box([s * 0.019 - 0.004, 0.42, -0.012], [s * 0.019 + 0.004, 0.64, 0.012], worn(dark, [s, 0.5, 0]));
  // the head is drawn along X, then turned so its striking face points forward (-Z), the spike back (+Z)
  const R = (p) => [p[2], p[1], -p[0]];
  const hbox = (mn, mx, c) => { const a = R(mn), b = R(mx); m.box([Math.min(a[0], b[0]), a[1], Math.min(a[2], b[2])], [Math.max(a[0], b[0]), b[1], Math.max(a[2], b[2])], c); };
  const htri = (p, q, r, ins, c1, c2, c3) => m.triIn(R(p), R(q), R(r), R(ins), c1, c2, c3);
  // HEAD: a block across +X/-X at y 0.6..0.72
  const y0 = 0.6, y1 = 0.72;
  hbox([-0.05, y0, -0.042], [0.05, y1, 0.042], worn(metal, [0, y0, 0]));
  // the striking face (+X): a flared square with a crowned rim
  hbox([0.05, y0 - 0.012, -0.054], [0.11, y1 + 0.012, 0.054], worn(metal, [0.08, y0, 0], 0.15));
  hbox([0.11, y0 - 0.004, -0.046], [0.125, y1 + 0.004, 0.046], worn(EDGE, [0.12, y0, 0], 0.1));
  if (fine) for (const [a, b] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) hbox([0.125, (y0 + y1) / 2 + a * 0.03 - 0.012, b * 0.024 - 0.012], [0.138, (y0 + y1) / 2 + a * 0.03 + 0.012, b * 0.024 + 0.012], worn(EDGE, [a, b, 0]));
  // the back spike (-X): a curved beak tapering down
  const beak = [[-0.05, 0.0, 0.03], [-0.11, -0.01, 0.022], [-0.17, -0.03, 0.012], [-0.21, -0.06, 0.004]];
  for (let i = 0; i < beak.length - 1; i++) {
    const [xa, ya, ra] = beak[i], [xb, yb, rb] = beak[i + 1], cy = (y0 + y1) / 2;
    const fa = [[xa, cy + ya - ra * 1.6, -ra], [xa, cy + ya + ra * 1.6, -ra], [xa, cy + ya + ra * 1.6, ra], [xa, cy + ya - ra * 1.6, ra]];
    const fb = [[xb, cy + yb - rb * 1.6, -rb], [xb, cy + yb + rb * 1.6, -rb], [xb, cy + yb + rb * 1.6, rb], [xb, cy + yb - rb * 1.6, rb]];
    const ins = [(xa + xb) / 2, cy + (ya + yb) / 2, 0]; for (let k = 0; k < 4; k++) { const j = (k + 1) % 4, c = worn(k % 2 ? EDGE : metal, fa[k], 0.12); htri(fa[k], fb[k], fb[j], ins, c, c, c); htri(fa[k], fb[j], fa[j], ins, c, c, c); }
  }
  // top spike
  ctx.smooth();
  m.lathe([[0.022, y1], [0.018, y1 + 0.03], [0.008, y1 + 0.1], [0, y1 + 0.13]], { sides: Math.max(4, n >> 1), capStart: 0, colorOf: (p) => worn(EDGE, p, 0.1) });
  return m.done();
}
