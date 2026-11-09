// Greywood's geometry kit: a transform stack over ctx.tri, boxes, swept tubes, noisy blobs, seeded
// randomness. Every scripts/gen/* file in the Greywood builds on these; no engine state here.
const D = Math.PI / 180;
export function rng(seed) {
  let a = (Math.floor(seed * 2654435761) >>> 0) || 1;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const mul = (a, b) => { const r = new Array(9); for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) r[i * 3 + j] = a[i * 3] * b[j] + a[i * 3 + 1] * b[3 + j] + a[i * 3 + 2] * b[6 + j]; return r; };
const mv = (m, p) => [m[0] * p[0] + m[1] * p[1] + m[2] * p[2], m[3] * p[0] + m[4] * p[1] + m[5] * p[2], m[6] * p[0] + m[7] * p[1] + m[8] * p[2]];
export const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const scl = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
export const lerp3 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
// a transform: translate t, then yaw (about +Y), pitch (about +X, nose up), roll (about Z), scale s, degrees
export function X(t = [0, 0, 0], yaw = 0, pitch = 0, roll = 0, s = 1) {
  const c = Math.cos, n = Math.sin, y = yaw * D, p = pitch * D, r = roll * D;
  const Ry = [c(y), 0, n(y), 0, 1, 0, -n(y), 0, c(y)];
  const Rx = [1, 0, 0, 0, c(p), -n(p), 0, n(p), c(p)];
  const Rz = [c(r), -n(r), 0, n(r), c(r), 0, 0, 0, 1];
  const sv = Array.isArray(s) ? s : [s, s, s];
  return { m: mul(mul(mul(Ry, Rx), Rz), [sv[0], 0, 0, 0, sv[1], 0, 0, 0, sv[2]]), t };
}
const ICO_V = (() => { const t = (1 + Math.sqrt(5)) / 2; return [[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]].map(norm); })();
const ICO_F = [0, 11, 5, 0, 5, 1, 0, 1, 7, 0, 7, 10, 0, 10, 11, 1, 5, 9, 5, 11, 4, 11, 10, 2, 10, 7, 6, 7, 1, 8, 3, 9, 4, 3, 4, 2, 3, 2, 6, 3, 6, 8, 3, 8, 9, 4, 9, 5, 2, 4, 11, 6, 2, 10, 8, 6, 7, 9, 8, 1];
const icoCache = {};
export function icosphere(detail) {
  if (icoCache[detail]) return icoCache[detail];
  let v = ICO_V.slice(), f = ICO_F.slice();
  for (let d = 0; d < detail; d++) {
    const mid = {}, nf = [];
    const m = (a, b) => { const k = a < b ? a + "_" + b : b + "_" + a; if (mid[k] === undefined) { mid[k] = v.length; v.push(norm(lerp3(v[a], v[b], 0.5))); } return mid[k]; };
    for (let i = 0; i < f.length; i += 3) { const a = f[i], b = f[i + 1], c = f[i + 2], ab = m(a, b), bc = m(b, c), ca = m(c, a); nf.push(a, ab, ca, b, bc, ab, c, ca, bc, ab, bc, ca); }
    f = nf;
  }
  return (icoCache[detail] = { v, f });
}
export class G {
  constructor(ctx) { this.ctx = ctx; this.T = { m: [1, 0, 0, 0, 1, 0, 0, 0, 1], t: [0, 0, 0] }; }
  at(T, fn) { const P = this.T; this.T = { m: mul(P.m, T.m), t: add(mv(P.m, T.t), P.t) }; fn(); this.T = P; }
  p(v) { const r = mv(this.T.m, v); return [r[0] + this.T.t[0], r[1] + this.T.t[1], r[2] + this.T.t[2]]; }
  tri(a, b, c) { a = this.p(a); b = this.p(b); c = this.p(c); this.ctx.tri(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]); }
  quad(a, b, c, d) { this.tri(a, b, c); this.tri(a, c, d); }
  box(cx, cy, cz, w, h, d) {
    const e = [w / 2, h / 2, d / 2];
    const F = [[[1, 0, 0], [0, 1, 0], [0, 0, 1]], [[0, 1, 0], [0, 0, 1], [1, 0, 0]], [[0, 0, 1], [1, 0, 0], [0, 1, 0]]];
    for (const [n, u, v] of F) for (const s of [1, -1]) {
      const U = s > 0 ? u : v, V = s > 0 ? v : u;
      const N = n.map((k, i) => k * s * e[i]), UU = U.map((k, i) => k * e[i]), VV = V.map((k, i) => k * e[i]);
      const P = (a, b) => [cx + N[0] + a * UU[0] + b * VV[0], cy + N[1] + a * UU[1] + b * VV[1], cz + N[2] + a * UU[2] + b * VV[2]];
      this.quad(P(-1, -1), P(1, -1), P(1, 1), P(-1, 1));
    }
  }
  // a swept tube through path [[x,y,z,r],...]; o.capA / o.capB close the ends; o.rough(theta, k) scales a ring's radius
  tube(path, seg = 8, o = {}) {
    const N = path.length, rings = [];
    let nPrev = null;
    for (let k = 0; k < N; k++) {
      const a = path[Math.max(0, k - 1)], b = path[Math.min(N - 1, k + 1)];
      const t = norm(sub(b, a));
      let n;
      if (!nPrev) { const ref = Math.abs(t[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0]; n = norm(cross(ref, t)); }
      else { n = sub(nPrev, scl(t, dot(nPrev, t))); if (Math.hypot(n[0], n[1], n[2]) < 1e-4) n = nPrev; n = norm(n); }
      nPrev = n;
      const bb = cross(t, n), ring = [], r = path[k][3];
      for (let i = 0; i < seg; i++) {
        const th = (i / seg) * Math.PI * 2, rr = r * (o.rough ? o.rough(th, k) : 1), c = Math.cos(th) * rr, s = Math.sin(th) * rr;
        ring.push([path[k][0] + c * n[0] + s * bb[0], path[k][1] + c * n[1] + s * bb[1], path[k][2] + c * n[2] + s * bb[2]]);
      }
      rings.push(ring);
    }
    for (let k = 0; k < N - 1; k++) for (let i = 0; i < seg; i++) { const j = (i + 1) % seg; this.quad(rings[k][i], rings[k][j], rings[k + 1][j], rings[k + 1][i]); }
    if (o.capA) { const c = path[0].slice(0, 3); for (let i = 0; i < seg; i++) this.tri(c, rings[0][(i + 1) % seg], rings[0][i]); }
    if (o.capB) { const c = path[N - 1].slice(0, 3), R = rings[N - 1]; for (let i = 0; i < seg; i++) this.tri(c, R[i], R[(i + 1) % seg]); }
  }
  // a noisy closed blob: returns its triangles (local), outward-wound, for the caller to paint and emit
  blob(c, r, detail = 2, amp = 0.25, freq = 1, seed = 0, floorY = null) {
    const { v, f } = icosphere(detail), ctx = this.ctx, P = [];
    for (const u of v) {
      const nz = ctx.noise3d(u[0] * freq + seed * 7.13, u[1] * freq + seed * 3.7, u[2] * freq - seed * 5.1) + 0.35 * ctx.noise3d(u[0] * freq * 3.1 + seed, u[1] * freq * 3.1, u[2] * freq * 3.1);
      const k = 1 + amp * nz;
      let y = u[1] * r[1] * k;
      if (floorY !== null) y = Math.max(c[1] + y, floorY) - c[1]; // floorY is a world height in the mesh's frame
      P.push([c[0] + u[0] * r[0] * k, c[1] + y, c[2] + u[2] * r[2] * k]);
    }
    const out = [];
    for (let i = 0; i < f.length; i += 3) {
      let a = P[f[i]], b = P[f[i + 1]], d = P[f[i + 2]];
      const nrm = cross(sub(b, a), sub(d, a)), cen = scl(add(add(a, b), d), 1 / 3);
      if (dot(nrm, sub(cen, c)) < 0) { const t = b; b = d; d = t; }
      out.push([a, b, d, norm(cross(sub(b, a), sub(d, a)))]);
    }
    return out;
  }
  tris(list) { for (const t of list) this.tri(t[0], t[1], t[2]); }
}
// a mossy rock: sides take the rock picture, up-facing faces the moss
export function mossyRock(g, c, r, detail, seed, { rock, moss, mossAt = 0.55, amp = 0.28, freq = 0.9, floor = -0.4, rockTint = "oklch(0.93 0.01 90)", mossTint = "oklch(0.92 0.05 130)" } = {}) {
  const tris = g.blob(c, r, detail, amp, freq, seed, c[1] + floor * r[1]);
  const top = [], side = [];
  for (const t of tris) (moss && t[3][1] > mossAt + 0.15 * g.ctx.noise3d(t[0][0] * 1.7, t[0][1] * 1.7, t[0][2] * 1.7) ? top : side).push(t);
  g.ctx.smooth();
  g.ctx.albedo(rock); g.ctx.color(rockTint); g.tris(side);
  if (top.length) { g.ctx.albedo(moss); g.ctx.color(mossTint); g.tris(top); }
  g.ctx.albedo(null); g.ctx.color(null); g.ctx.flat();
}
// a bone: a shaft with knobbed ends, from a to b
export function bone(g, a, b, r = 0.025, seg = 5) {
  g.tube([[...a, r * 1.6], [...lerp3(a, b, 0.12), r], [...lerp3(a, b, 0.88), r], [...b, r * 1.6]], seg, { capA: true, capB: true });
}
export const TEX = {
  bark: "cdn/texture-pine-bark-rough.png",
  needles: "cdn/texture-evergreen-fir-foliage-dark-green.png",
  birch: "cdn/texture-birch-bark-white.png",
  leaves: "cdn/texture-birch-leaves-dense.png",
  rock: "cdn/texture-granite-rock-lichen.png",
  moss: "cdn/texture-moss-ground-dense.png",
  oak: "cdn/texture-dark-oak-planks-weathered.png",
  fieldstone: "cdn/texture-fieldstone-wall-mossy.png",
  flag: "cdn/texture-flagstone-floor-worn.png",
  iron: "cdn/texture-wrought-iron.png",
  canvas: "cdn/texture-canvas-weathered.png",
  slate: "cdn/texture-slate-roof-tiles-mossy.png",
  log: "cdn/texture-dark-oak-bark.png",
};
