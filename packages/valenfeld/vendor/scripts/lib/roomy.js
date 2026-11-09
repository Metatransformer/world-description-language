// ROOMY: grows a building's room shell without growing the people in it.
// params.grow = { sx, sz, knots: [[yOld, yNew], …] }: the plan scales by sx/sz about the local origin; heights map
// piecewise-linearly through the knots (a 1:1 band keeps tables, bars, beds at human height; a steeper band lifts
// walls, door heads and ceilings), past the last knot at slope 1. Old shorthand { y0, k } still reads.
// geometry: grown(ctx, g) is a ctx whose quad/tri/solid land warped; collider: growBoxes(list, g) warps a box list.
// No params.grow = identity, so the same generator still draws its old exterior in the town.
import KB from "./data/kit-build.json";   // scripts/lib/data/kit-build.yml (roomy)
export function warpY(g, y) {
  const K = g.knots ?? [[0, 0], [g.y0, g.y0], [g.y0 + 1, g.y0 + g.k]];
  if (y <= K[0][0]) return y - K[0][0] + K[0][1];
  for (let i = 1; i < K.length; i++) if (y <= K[i][0]) { const [a, A] = K[i - 1], [b, B] = K[i]; return A + (y - a) * (B - A) / (b - a); }
  const [l, L] = K[K.length - 1]; return L + (y - l);
}
export function warpP(g, p) { return { x: (p.x ?? 0) * g.sx, y: warpY(g, p.y ?? 0), z: (p.z ?? 0) * g.sz }; }
export function grown(ctx, g) {
  if (!g) return ctx;
  const P = (x, y, z) => [x * g.sx, warpY(g, y), z * g.sz];
  const over = {
    quad: (ax, ay, az, bx, by, bz, cx, cy, cz, dx, dy, dz) => ctx.quad(...P(ax, ay, az), ...P(bx, by, bz), ...P(cx, cy, cz), ...P(dx, dy, dz)),
    tri: (ax, ay, az, bx, by, bz, cx, cy, cz) => ctx.tri(...P(ax, ay, az), ...P(bx, by, bz), ...P(cx, cy, cz)),
  };
  if (ctx.solid) over.solid = (x0, y0, z0, x1, y1, z1) => { const a = P(x0, y0, z0), b = P(x1, y1, z1); ctx.solid(a[0], a[1], a[2], b[0], b[1], b[2]); };
  return new Proxy(ctx, { get(t, k) { if (k in over) return over[k]; const v = t[k]; return typeof v === "function" ? v.bind(t) : v; },
    has(t, k) { return k in over || k in t; } });
}
export function growBoxes(list, g) {
  if (!g || !Array.isArray(list)) return list;
  return list.map((b) => {
    if (b.kind !== "box" || !b.center) return b;
    const [cx, cy, cz] = b.center, ya = warpY(g, cy - b.height / 2), yb = warpY(g, cy + b.height / 2);
    return { ...b, width: b.width * g.sx, depth: b.depth * g.sz, height: Math.max(KB.roomy.minHeight, yb - ya), center: [cx * g.sx, (ya + yb) / 2, cz * g.sz] };
  });
}
