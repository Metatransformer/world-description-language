// A bearded war axe: origin at the grip centre, haft along +Y, the blade flaring toward +X with a hooked beard, a back spike on the great axe.
// Ash haft with a leather wrap, a dark forged head with a bright honed edge. Shared by axe.js (one hand) and greataxe.js (two hands).
import { mesher, mix, hex } from "../lib/mesh.js";

const ASH = [0.46, 0.33, 0.2], ASH_DARK = [0.3, 0.2, 0.12], LEATHER = [0.28, 0.17, 0.1], GROOVE = [0.14, 0.08, 0.05];
const IRON = [0.42, 0.42, 0.42], DARK = [0.27, 0.26, 0.25], EDGE = [0.8, 0.8, 0.78];
const SIDES = [0, 16, 12, 8, 6, 5];

export function buildAxe(ctx, o) {
  const lod = ctx.lod ?? 1, n = SIDES[lod] ?? 8, fine = lod <= 2;
  const m = mesher(ctx, { vertexColors: true });
  const nz = (p, f) => Math.max(-1, Math.min(1, ctx.noise3d(p[0] * f, p[1] * f, p[2] * f)));
  const worn = (c, p, a = 0.22, f = 37) => hex(c, 1 + (fine ? a * nz(p, f) : 0));
  const L = o.length, top = L * 0.78, r = o.haft;
  ctx.smooth();

  // HAFT: ash, a little swell at the butt, grain stripes
  ctx.metalness(0); ctx.roughness(0.8);
  const grain = (p) => 0.5 + 0.5 * Math.sin(p[1] * 90 + nz(p, 9) * 3);
  m.lathe([[r * 1.25, -L * 0.22], [r * 1.1, -L * 0.2], [r, -L * 0.1], [r * 0.95, top * 0.6], [r * 0.9, top + 0.05]], { sides: n, colorOf: (p) => worn(fine ? mix(ASH_DARK, ASH, grain(p)) : ASH, p, 0.12) });
  // GRIP: spiral leather
  const gl = [], gs = lod <= 1 ? 20 : lod <= 2 ? 10 : 3, gh = o.grip;
  for (let i = 0; i <= gs; i++) gl.push([r * 1.12, -gh / 2 + (i / gs) * gh]);
  const wrap = (p, a) => Math.abs(Math.sin((p[1] * 48 + a / (2 * Math.PI)) * Math.PI));
  m.lathe(gl, { sides: n, bump: fine ? (p, d, t, a) => 1 + 0.1 * wrap(p, a) : null, colorOf: (p, d, t, a) => worn(fine ? mix(GROOVE, LEATHER, wrap(p, a)) : LEATHER, p, 0.15, 60) });

  // HEAD: socket collar, cheek, flaring blade with beard, honed edge
  ctx.metalness(0.6); ctx.roughness(0.45); ctx.flat();
  const H = o.head, y0 = top - H * 0.15, th = o.thick;
  const sock = [[-r * 1.6, y0 - H * 0.1], [r * 1.6, y0 - H * 0.1], [r * 1.6, y0 + H * 0.55], [-r * 1.6, y0 + H * 0.55]];
  const slab = (pts, t, col, colS) => {
    const cx = pts.reduce((a, p) => a + p[0], 0) / pts.length, cy = pts.reduce((a, p) => a + p[1], 0) / pts.length;
    m.prism(pts.map(([x, y]) => [x, y, t]), pts.map(([x, y]) => [x, y, -t]), [cx, cy, 0], col, col, colS ?? col);
  };
  slab(sock, r * 1.4, worn(DARK, [0, y0, 0]));
  const W = H * o.reach;
  // cheek: from the socket out to where the flare begins
  slab([[r * 1.5, y0 + H * 0.02], [W * 0.45, y0 + H * 0.08], [W * 0.45, y0 + H * 0.5], [r * 1.5, y0 + H * 0.52]], th, worn(IRON, [W * 0.3, y0, 0]), worn(DARK, [W * 0.3, y0, 0]));
  // blade fan: upper horn up, beard hooking down (split in two convex halves)
  const tipU = [W, y0 + H * 0.95], tipD = [W * 0.92, y0 - H * o.beard], mid = [W * 1.02, y0 + H * 0.3];
  slab([[W * 0.45, y0 + H * 0.28], [W * 0.45, y0 + H * 0.5], tipU, mid], th * 0.85, worn(IRON, [W, y0 + H, 0]));
  slab([[W * 0.45, y0 + H * 0.08], [W * 0.45, y0 + H * 0.28], mid, tipD], th * 0.85, worn(IRON, [W, y0, 0]));
  // honed edge: a thin bright bevel strip along the arc
  const arc = [tipD, [W * 1.0, y0 + H * 0.05], mid, [W * 1.03, y0 + H * 0.62], tipU];
  for (let i = 0; i < arc.length - 1; i++) {
    const [a, b] = [arc[i], arc[i + 1]];
    slab([[a[0] - H * 0.09, a[1]], [b[0] - H * 0.09, b[1]], [b[0], b[1]], [a[0], a[1]]], th * 0.35, worn(EDGE, [a[0], a[1], 0], 0.1));
  }
  // back: a hammer poll on the hand axe, a curved spike on the great axe
  if (o.spike) slab([[-r * 1.5, y0 + H * 0.12], [-r * 1.5, y0 + H * 0.45], [-H * 0.6, y0 + H * 0.2]], th * 1.2, worn(DARK, [-H * 0.3, y0, 0]));
  else slab([[-r * 1.5, y0 + H * 0.1], [-r * 1.5, y0 + H * 0.45], [-H * 0.22, y0 + H * 0.42], [-H * 0.22, y0 + H * 0.13]], r * 1.3, worn(DARK, [-H * 0.2, y0, 0]));
  return m.done();
}
