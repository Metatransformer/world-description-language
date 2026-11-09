// PIECES: mound. The hill a dungeon door is dug into: a dome clipped flat by the facade plane and skirted down into
// the ground, and the facade wall whose top follows the dome's edge with the doorway cut through it.
// The barrow mouth (a grass burial mound) and the Crowfoot mine mouth (a rock-and-turf knoll) both draw it.
// o: { R, H, exp, CX, FX, nt(lod, col), ns(lod, col), noise: [freq, amp, offsetX], skirt: [out, y] }
export function moundHeight(o) { return (r) => (r >= o.R ? 0 : o.H * Math.pow(1 - (r / o.R) * (r / o.R), o.exp)); }
export function moundDome(K, ctx, col, lod, o) {
  const { R, CX, FX } = o, hd = moundHeight(o), NT = o.nt(lod, col), NS = o.ns(lod, col), [nf, na, nx] = o.noise, grid = [];
  if (!col) ctx.smooth();
  for (let t = 0; t <= NT; t++) {
    const th = (2 * Math.PI * t) / NT, c = Math.cos(th), s = Math.sin(th);
    const clip = c < 0 && (FX - CX) / c < R, rmax = clip ? (FX - CX) / c : R, row = [];
    for (let i = 0; i <= NS; i++) {
      const r = (rmax * i) / NS, bump = col ? 0 : ctx.noise2d(c * r * nf + nx, s * r * nf) * na * Math.sin((Math.PI * i) / NS);
      row.push([CX + c * r, hd(r) + bump, s * r]);
    }
    row.push(clip ? [CX + c * rmax, hd(rmax), s * rmax] : [CX + c * (R + o.skirt[0]), o.skirt[1], s * (R + o.skirt[0])]);
    grid.push(row);
  }
  const C0 = [CX, -2, 0];
  for (let t = 0; t < NT; t++) for (let i = 0; i <= NS; i++) K.quad(grid[t][i], grid[t + 1][i], grid[t + 1][i + 1], grid[t][i + 1], C0);
  if (!col) ctx.flat();
}
// f: { z: [from, to], step, rise, door: [halfWidth, lintelY], base, back, front }: courses of wall along the facade plane
export function moundFacade(K, col, o, f) {
  const hd = moundHeight(o), d = o.FX - o.CX;
  for (let z = f.z[0]; z < f.z[1]; z += f.step) {
    const z1 = z + f.step, top = hd(Math.hypot(d, Math.abs(z) < Math.abs(z1) ? z : z1)) + f.rise;
    const lo = z1 > -f.door[0] && z < f.door[0] ? f.door[1] : f.base;
    if (top > lo) K.box(o.FX - f.back, lo, z, o.FX + f.front, top, z1);
  }
}
