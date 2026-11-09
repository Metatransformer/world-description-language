// Shared mesh helpers for scripted geometry (creatures, weapons): rings, lofts, tubes, lathes, prisms,
// per-vertex colours. mesher(ctx, { vertexColors }) wraps ctx.tri; m.done() returns { colors } for geometry().
import KB from "./data/kit-build.json";   // tube defaults: scripts/lib/data/kit-build.yml (mesh)
const M = KB.mesh;
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a) => Math.hypot(a[0], a[1], a[2]);
const norm = (a) => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
export const v3 = { sub, add, mul, dot, cross, len, norm };
export const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
export const smooth = (e0, e1, x) => { const t = clamp01((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); };
export const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
export const hex = (c, k = 1) => "#" + c.map((v) => Math.round(clamp01(v * k) * 255).toString(16).padStart(2, "0")).join("");
export const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);

const cr = (p0, p1, p2, p3, t) => { const t2 = t * t, t3 = t2 * t; return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3); };
// Catmull-Rom resample of a path of { p, rx, ry }: k samples per span.
export function resample(path, k) {
  if (!k || k <= 1 || path.length < 3) return path;
  const out = [], n = path.length;
  for (let i = 0; i < n - 1; i++) {
    const P0 = path[Math.max(i - 1, 0)], P1 = path[i], P2 = path[i + 1], P3 = path[Math.min(i + 2, n - 1)];
    for (let s = 0; s < k; s++) {
      const t = s / k;
      out.push({
        p: [0, 1, 2].map((j) => cr(P0.p[j], P1.p[j], P2.p[j], P3.p[j], t)),
        rx: cr(P0.rx, P1.rx, P2.rx, P3.rx, t),
        ry: cr(P0.ry ?? P0.rx, P1.ry ?? P1.rx, P2.ry ?? P2.rx, P3.ry ?? P3.rx, t),
      });
    }
  }
  out.push(path[n - 1]);
  return out;
}

export function mesher(ctx, { vertexColors = false } = {}) {
  const colors = vertexColors ? [] : null;
  let cur = "#ffffff", xf = null;
  const m = {};
  m.color = (c) => { cur = c; };
  m.transform = (f) => { xf = f; };
  const raw = (a, b, c, ca, cb, cc) => {
    if (xf) { a = xf(a); b = xf(b); c = xf(c); }
    ctx.tri(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
    if (colors) colors.push(ca ?? cur, cb ?? cur, cc ?? cur);
  };
  m.raw = raw;
  // tri facing `want` (a direction); triIn faces away from `inside` (a point)
  m.tri = (a, b, c, want, ca, cb, cc) => {
    if (want && dot(cross(sub(b, a), sub(c, a)), want) < 0) return raw(a, c, b, ca, cc, cb);
    raw(a, b, c, ca, cb, cc);
  };
  m.triIn = (a, b, c, inside, ca, cb, cc) => m.tri(a, b, c, sub(mul(add(add(a, b), c), 1 / 3), inside), ca, cb, cc);
  const cap = (R, sgn, l, col, o) => {
    const n = R.pts.length, T = mul(R.t, sgn), tip = add(R.c, mul(T, l));
    const inside = sub(R.c, mul(T, R.r * 0.5 + 1e-4));
    const ct = col ?? (o.colorOf ? o.colorOf(tip, T, sgn > 0 ? 1 : 0, 0) : undefined);
    for (let i = 0; i < n; i++) { const j = (i + 1) % n; m.triIn(tip, R.pts[i], R.pts[j], inside, ct, R.cols?.[i], R.cols?.[j]); }
  };
  // rings: [{ pts, cols?, c (centre), t (tangent), r }]; winding is chosen once for the whole loft (outward)
  m.loft = (rings, o = {}) => {
    const n = rings[0].pts.length, R = o.closed ? [...rings, rings[0]] : rings;
    let score = 0;
    for (let r = 0; r < R.length - 1; r++) {
      const A = R[r], B = R[r + 1], ins = mul(add(A.c, B.c), 0.5);
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n, a = A.pts[i], b = A.pts[j], c = B.pts[j], d = B.pts[i];
        const nr = cross(sub(c, a), sub(d, b)), mid = mul(add(add(a, b), add(c, d)), 0.25);
        score += dot(nr, norm(sub(mid, ins)));
      }
    }
    const flip = score < 0;
    for (let r = 0; r < R.length - 1; r++) {
      const A = R[r], B = R[r + 1];
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n, a = A.pts[i], b = A.pts[j], c = B.pts[j], d = B.pts[i];
        const ca = A.cols?.[i], cb = A.cols?.[j], cc = B.cols?.[j], cd = B.cols?.[i];
        if (flip) { raw(a, d, c, ca, cd, cc); raw(a, c, b, ca, cc, cb); } else { raw(a, b, c, ca, cb, cc); raw(a, c, d, ca, cc, cd); }
      }
    }
    if (!o.closed) {
      if (o.capStart != null) cap(rings[0], -1, o.capStart, o.capColStart, o);
      if (o.capEnd != null) cap(rings[rings.length - 1], 1, o.capEnd, o.capColEnd, o);
    }
  };
  // path: [{ p, rx, ry? }]; o: sides, k (resample), ref/alt (frame), axis (fixed tangent), bump(p, dir, t, ang) → radius ×,
  // colorOf(p, dir, t, ang) → colour, capStart/capEnd (length; 0 = flat), closed, phase
  m.tube = (path0, o = {}) => {
    const path = o.closed ? path0 : resample(path0, o.k ?? M.k);
    const n = o.sides ?? M.sides, L = path.length;
    const rings = path.map((s, idx) => {
      let T;
      if (o.axis) T = o.axis;
      else {
        const pi = o.closed ? (idx - 1 + L) % L : Math.max(idx - 1, 0), ni = o.closed ? (idx + 1) % L : Math.min(idx + 1, L - 1);
        T = norm(sub(path[ni].p, path[pi].p));
      }
      let ref = o.ref ?? [0, 1, 0];
      if (Math.abs(dot(ref, T)) > M.parallel) ref = o.alt ?? [0, 0, -1];
      const N = norm(cross(ref, T)), B = cross(T, N);
      const rx = s.rx, ry = s.ry ?? s.rx, t = L > 1 ? idx / (L - 1) : 0;
      const pts = [], cols = o.colorOf ? [] : null;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + (o.phase ?? 0), ca = Math.cos(a), sa = Math.sin(a);
        const dir = add(mul(N, ca), mul(B, sa));
        let off = add(mul(N, ca * rx), mul(B, sa * ry));
        if (o.bump) off = mul(off, o.bump(add(s.p, off), dir, t, a));
        const p = add(s.p, off);
        pts.push(p);
        if (cols) cols.push(o.colorOf(p, dir, t, a));
      }
      return { pts, cols, c: s.p, t: T, r: Math.max(rx, ry) };
    });
    m.loft(rings, o);
  };
  // profile [[r, y], ...] turned about +Y
  m.lathe = (prof, o = {}) => m.tube(prof.map(([r, y]) => ({ p: [0, y, 0], rx: r })), { ref: [0, 0, -1], axis: [0, 1, 0], ...o });
  // two convex polygons of equal count joined: a slab
  m.prism = (front, back, inside, colF, colB, colS) => {
    const n = front.length;
    for (let i = 1; i < n - 1; i++) { m.triIn(front[0], front[i], front[i + 1], inside, colF, colF, colF); m.triIn(back[0], back[i], back[i + 1], inside, colB ?? colF, colB ?? colF, colB ?? colF); }
    const cs = colS ?? colF;
    for (let i = 0; i < n; i++) { const j = (i + 1) % n; m.triIn(front[i], front[j], back[j], inside, cs, cs, cs); m.triIn(front[i], back[j], back[i], inside, cs, cs, cs); }
  };
  m.box = (mn, mx, col) => {
    const f = [[mn[0], mn[1], mn[2]], [mx[0], mn[1], mn[2]], [mx[0], mx[1], mn[2]], [mn[0], mx[1], mn[2]]];
    const b = f.map((p) => [p[0], p[1], mx[2]]);
    m.prism(f, b, mul(add(mn, mx), 0.5), col);
  };
  m.done = () => (colors ? { colors } : undefined);
  return m;
}
