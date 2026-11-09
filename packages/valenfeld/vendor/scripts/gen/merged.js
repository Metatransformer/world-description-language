// A baked group of plain primitives in one mesh (perf #844): params.parts is the old subtree flattened,
// each part { k: box|cylinder|sphere|cone, t: [x,y,z] feet, r: [yaw,pitch,roll], s: [sx,sy,sz], d: {three.js params}, c: colour, x: texture }
// already composed into the group's frame by tools/build/merge-parts.py. Feet at y = 0 like the group it replaced.
import { G, X } from "../lib/geo.js";
const D = Math.PI / 180;
function ring(g, y, r, n) { const p = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; p.push([Math.cos(a) * r, y, Math.sin(a) * r]); } return p; }
function cyl(g, rt, rb, h, n) {
  const B = ring(g, 0, rb, n), T = ring(g, h, rt, n);
  for (let i = 0; i < n; i++) { const j = (i + 1) % n;
    if (rt > 0) g.quad(B[i], T[i], T[j], B[j]); else g.tri(B[i], [0, h, 0], B[j]);
    g.tri([0, 0, 0], B[i], B[j]); if (rt > 0) g.tri([0, h, 0], T[j], T[i]); }
}
function sph(g, r, n) {
  const m = Math.max(3, n >> 1), P = (i, j) => { const th = i / m * Math.PI, ph = j / n * Math.PI * 2; return [Math.sin(th) * Math.cos(ph) * r, r - Math.cos(th) * r, Math.sin(th) * Math.sin(ph) * r]; };
  for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) { const a = P(i, j), b = P(i + 1, j), c = P(i + 1, j + 1), d = P(i, j + 1); g.tri(a, c, b); if (i > 0) g.tri(a, d, c); }
}
export function geometry(ctx) {
  const g = new G(ctx), lod = ctx.lod ?? 1, seg = lod >= 4 ? 5 : lod >= 3 ? 7 : 10;
  ctx.flat();
  for (const p of ctx.params.parts ?? []) {
    ctx.color(p.c ?? null); ctx.albedo(p.x ?? null);
    const r = p.r ?? [0, 0, 0], d = p.d ?? {};
    g.at(X(p.t, r[0], r[1], r[2], p.s ?? 1), () => {
      if (p.k === "box") g.box(0, (d.height ?? 1) / 2, 0, d.width ?? 1, d.height ?? 1, d.depth ?? 1);
      else if (p.k === "cylinder") cyl(g, d.radiusTop ?? 0.5, d.radiusBottom ?? 0.5, d.height ?? 1, Math.min(seg, d.radialSegments ?? seg));
      else if (p.k === "cone") cyl(g, 0, d.radius ?? 0.5, d.height ?? 1, Math.min(seg, d.radialSegments ?? seg));
      else if (p.k === "sphere") sph(g, d.radius ?? 0.5, seg);
    });
  }
  ctx.albedo(null); ctx.color(null);
}
