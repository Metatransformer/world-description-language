// Valenfeld tree kit: an emitter that carries explicit uvs (bark tubes tile by metre, foliage cards map their
// painted picture once), and the shared builders every tree generator uses: bark trunks with root flare,
// spruce boughs of chained crossed cards, hanging leaf-spray cards for broadleaves. No engine state here.
import { rng, add, sub, scl, dot, cross, norm } from "./geo.js";
export { rng, add, sub, scl, dot, cross, norm };
export const CARD = {
  spruce: "/cdn/value.74eb45eacdda2089daddc0c3e1046cb9d1677e3ed3735fcef48ebcc4c494e969.png",
  birch: "/cdn/value.9e16796f0e308f63f2f850a8da0c7f732d0f1896f95e9000661b8bab9e2abf88.png",
  oak: "/cdn/value.f2cb8f9555bd2bf21fe2e229fdbf68ed4ff9224ccc92865e204cfa8e990055b0.png", oakSpray: "/cdn/value.20b7ce540319b0382d9e4b738f70d5297cc5fac0dad924c1bda18b4c5d84e5b8.png",
};
export const BARK = { pine: "cdn/texture-pine-bark.png", birch: "cdn/texture-birch-bark.png", oak: "cdn/texture-oak-bark.png" };
export const HULL = { needles: "cdn/texture-evergreen-fir-foliage-dark-green.png", leaves: "cdn/texture-birch-leaves-dense.png", snow: "cdn/texture-fresh-snow-powder.png" };
const UP = [0, 1, 0];
export class TK {
  constructor(ctx) { this.ctx = ctx; this.uv = []; this.n = 0; this.poly = null; }
  shape(card) { this.poly = null; }   // cards draw whole; the engine's alpha cut trims them to the leaf
  tri(a, b, c, ua, ub, uc) {
    this.ctx.tri(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
    this.uv.push(ua[0], ua[1], ub[0], ub[1], uc[0], uc[1]); this.n++;
  }
  quad(a, b, c, d, ua, ub, uc, ud) { this.tri(a, b, c, ua, ub, uc); this.tri(a, c, d, ua, uc, ud); }
  // swept bark tube through [[x,y,z,r]]: u wraps uRep times round, v runs one per vPer metres along
  tube(path, seg, o = {}) {
    const N = path.length, rings = [], vs = [], uRep = o.uRep ?? 2, vPer = o.vPer ?? 1.4;
    let nPrev = null, acc = 0;
    for (let k = 0; k < N; k++) {
      const a = path[Math.max(0, k - 1)], b = path[Math.min(N - 1, k + 1)], t = norm(sub(b, a));
      let n;
      if (!nPrev) n = norm(cross(Math.abs(t[1]) < 0.9 ? UP : [1, 0, 0], t));
      else { n = sub(nPrev, scl(t, dot(nPrev, t))); if (Math.hypot(...n) < 1e-4) n = nPrev; n = norm(n); }
      nPrev = n;
      const bb = cross(t, n), r = path[k][3], ring = [];
      for (let i = 0; i <= seg; i++) {
        const th = (i / seg) * Math.PI * 2, rr = r * (o.rough ? o.rough(th, k) : 1), c = Math.cos(th) * rr, s = Math.sin(th) * rr;
        ring.push([path[k][0] + c * n[0] + s * bb[0], path[k][1] + c * n[1] + s * bb[1], path[k][2] + c * n[2] + s * bb[2]]);
      }
      if (k) acc += Math.hypot(path[k][0] - path[k - 1][0], path[k][1] - path[k - 1][1], path[k][2] - path[k - 1][2]);
      rings.push(ring); vs.push(acc / vPer);
    }
    for (let k = 0; k < N - 1; k++) for (let i = 0; i < seg; i++) {
      const u0 = (i / seg) * uRep, u1 = ((i + 1) / seg) * uRep;
      this.quad(rings[k][i], rings[k][i + 1], rings[k + 1][i + 1], rings[k + 1][i], [u0, vs[k]], [u1, vs[k]], [u1, vs[k + 1]], [u0, vs[k + 1]]);
    }
    if (o.capB) { const c = path[N - 1].slice(0, 3), R = rings[N - 1], v = vs[N - 1]; for (let i = 0; i < seg; i++) this.tri(c, R[i], R[i + 1], [0.5, v + 0.1], [i / seg, v], [(i + 1) / seg, v]); }
  }
  // a card whose picture's stem sits on its left edge at height vStem: p0 the stem, u the reach (length = |u|), side unit v
  stemCard(p0, u, v, wid, vStem) {
    const a = add(p0, scl(v, -wid * vStem)), d = add(p0, scl(v, wid * (1 - vStem)));
    const S = this.poly; if (!S) { this.quad(a, add(a, u), add(d, u), d, [0, 0], [1, 0], [1, 1], [0, 1]); return; }
    this.fan(S, (q) => add(add(a, scl(u, q[0])), scl(sub(d, a), q[1])));
  }
  // a silhouette fan: centre to each rim pair, uv as painted, at(uv) gives the position
  fan(S, at) { const c = at(S.c), p = S.p, n = p.length; for (let i = 0; i < n; i++) { const q0 = p[i], q1 = p[(i + 1) % n]; this.tri(c, at(q0), at(q1), S.c, q0, q1); } }
  // a card centred on c: right r and up w unit vectors, s metres square
  card(c, r, w, s) {
    const h = s / 2, A = add(c, add(scl(r, -h), scl(w, -h))), B = add(c, add(scl(r, h), scl(w, -h)));
    const C = add(c, add(scl(r, h), scl(w, h))), D = add(c, add(scl(r, -h), scl(w, h)));
    const S = this.poly; if (!S) { this.quad(A, B, C, D, [0, 0], [1, 0], [1, 1], [0, 1]); return; }
    this.fan(S, (q) => add(A, add(scl(sub(B, A), q[0]), scl(sub(D, A), q[1]))));
  }
  done() { return { uvs: this.uv }; }
}
// a trunk path from below grade up to height top: radius r(y) = r0·taper plus a root flare that dies out by ~1.2 m
export function trunkPath(at, H, r0, top, nk, flare = 0.9, tip = 0.03) {
  const ys = [-0.6, 0, 0.3, 0.8, 1.6];
  for (let k = 1; k <= nk; k++) ys.push(1.6 + (top - 1.6) * (k / nk));
  return ys.map((y) => [...at(y), r0 * Math.max(0, 1 - Math.max(0, y) / H) ** 0.95 + tip + r0 * flare * Math.exp(-Math.max(0, y) / 0.45)]);
}
// buttress lobes on the flare rings, plain above
export function flareRough(ph, lobes = 5) { return (th, k) => (k <= 3 ? 1 + (0.34 - 0.08 * k) * Math.max(0, Math.sin(th * lobes + ph)) ** 2 - 0.06 : 1); }
// one spruce bough: chained crossed cards along a drooping, tip-raised curve. Returns the curve's samples (for snow).
export function sprucebough(tk, ctx, base, ang, L, f, o) {
  const R = o.R, d = [Math.cos(ang), 0, Math.sin(ang)], w = [-d[2], 0, d[0]];
  const rise = L * (o.rise0 + o.rise1 * f), droop = L * o.droop * (1 - 0.7 * f);
  const P = (s) => { const t = s / L; return add(add(base, scl(d, s)), [0, rise * t - droop * t * t + o.tipUp * L * t ** 4, 0]); };
  const n = Math.max(1, Math.ceil(L / o.segLen)), cl = Math.min(L, (L / n) * 1.45), out = [];
  for (let k = 0; k < n; k++) {
    const s0 = Math.max(0.05, (k / n) * L * 0.94 - 0.15), s1 = Math.min(L * 1.05, s0 + cl);
    const p0 = P(s0), p1 = P(s1), jy = (R() - 0.5) * 0.35 + (k % 2 ? 0.12 : -0.12);
    let u = sub(p1, p0); const ul = Math.hypot(...u), uh = norm(u);
    const side = norm(add(scl(w, Math.cos(jy)), scl(d, Math.sin(jy) * 0.3)));
    const nup = norm(cross(side, uh)), ul2 = ul * (1.0 + R() * 0.12);
    u = scl(norm(add(uh, scl(side, Math.sin(jy) * 0.5))), ul2);
    const wid = ul2 * o.aspect, sh = (s0 / L);
    ctx.color(`oklch(${(o.tintL + 0.14 * sh + 0.05 * f + (R() - 0.5) * 0.04).toFixed(3)} ${o.tintC} ${(o.tintH + R() * 12).toFixed(1)})`);
    for (const roll of o.rolls) {
      const r = (roll + (R() - 0.5) * 10) * Math.PI / 180, v = norm(add(scl(side, Math.cos(r)), scl(nup, Math.sin(r))));
      tk.stemCard(p0, u, v, wid, 0.43);
    }
    out.push({ p0, p1, wid, side });
  }
  return out;
}
// a conifer: bark trunk, dead stubs under the crown, whorls of card boughs, a leader; lod 5 is a hull (no uvs)
export function conifer(ctx, C) {
  const tk = new TK(ctx), lod = ctx.lod || 1, R = C.R, H = C.H, lx = (R() - 0.5) * C.lean, lz = (R() - 0.5) * C.lean;
  const at = (y) => [lx * (y / H) ** 2, y, lz * (y / H) ** 2];
  const yc = C.crownBase, Rc = (f) => C.Rmax * (1 - f) ** C.shape + 0.35, ph = R() * 6;
  ctx.roughness(0.92);
  if (lod >= 5) {
    ctx.flat(); const raw = (a, b, c) => ctx.tri(...a, ...b, ...c);
    ctx.albedo(C.bark); ctx.color("oklch(0.8 0.02 60)");
    const ring = (y, r, n, o = 0) => Array.from({ length: n }, (_, i) => { const a = (i + o) / n * 6.283, p = at(y); return [p[0] + Math.cos(a) * r, y, p[2] + Math.sin(a) * r]; });
    const t0 = ring(0, C.r0 * 1.5, 4), t1 = ring(yc, C.r0 * 0.7, 4);
    for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; raw(t0[i], t1[j], t0[j]); raw(t0[i], t1[i], t1[j]); }
    ctx.albedo(HULL.needles); ctx.color(C.hullTint);
    const lv = [[yc - 0.6, Rc(0) * 0.95], [yc + (H - yc) * 0.35, Rc(0.35) * 0.95], [yc + (H - yc) * 0.7, Rc(0.7)]], top = at(H + 0.3), n = 7;
    const rs = lv.map(([y, r], k) => ring(y, r, n, k * 0.5));
    const bot = at(yc - 1.2);
    for (let i = 0; i < n; i++) { const j = (i + 1) % n; raw(bot, rs[0][i], rs[0][j]); }
    for (let k = 0; k < rs.length - 1; k++) for (let i = 0; i < n; i++) { const j = (i + 1) % n; raw(rs[k][i], rs[k + 1][j], rs[k][j]); raw(rs[k][i], rs[k + 1][i], rs[k + 1][j]); }
    for (let i = 0; i < n; i++) raw(rs[2][i], top, rs[2][(i + 1) % n]);
    if (C.snow > 0.3) { ctx.albedo(HULL.snow); ctx.color("oklch(0.97 0.01 240)"); const s = rs.map((r, k) => r.map((p) => [p[0] * 0.9, p[1] + 0.25, p[2] * 0.9])); for (let i = 0; i < n; i++) { const j = (i + 1) % n; raw(s[0][i], s[1][j], s[0][j]); raw(s[0][i], s[1][i], s[1][j]); } }
    ctx.albedo(null); ctx.color(null); ctx.roughness(null); return;
  }
  // trunk
  ctx.smooth(); ctx.albedo(C.bark); ctx.color(C.barkTint);
  const seg = [0, 12, 9, 6, 5][lod], nk = [0, 7, 5, 3, 1][lod];
  const path = lod <= 3 ? trunkPath(at, H, C.r0, H * 0.96, nk) : [[...at(-0.4), C.r0 * 1.6], [...at(H * 0.75), 0.08]];
  tk.tube(path, seg, { uRep: lod <= 2 ? 3 : 2, vPer: 1.6, rough: lod <= 2 ? flareRough(ph) : null });
  if (lod <= 1) for (let i = 0; i < C.stubs; i++) {
    const y = 1.8 + R() * (yc - 1.6), a = R() * 6.28, b = at(y), l = 0.4 + R() * 0.9;
    ctx.color("oklch(0.62 0.01 60)");
    tk.tube([[...b, 0.05], [b[0] + Math.cos(a) * l, y - 0.1 - R() * 0.3, b[2] + Math.sin(a) * l, 0.01]], 4, { uRep: 1, vPer: 1 });
  }
  ctx.flat(); ctx.albedo(CARD.spruce); tk.shape(CARD.spruce); ctx.roughness(0.8);
  const whorls = [0, C.whorls, Math.round(C.whorls * 0.62), Math.round(C.whorls * 0.36), 4][lod];
  const o = { R, rise0: C.rise0, rise1: C.rise1, droop: C.droop, tipUp: C.tipUp, segLen: [0, 1.7, 2.5, 99, 99][lod], aspect: lod >= 3 ? 1.0 : 0.85,
    rolls: lod >= 3 ? [30, -30] : [28, -32], tintL: C.tintL, tintC: C.tintC, tintH: C.tintH };
  const snowList = [];
  for (let i = 0; i < whorls; i++) {
    const f = whorls > 1 ? i / (whorls - 1) : 0, y = yc + f * (H - 1.6 - yc) + (R() - 0.5) * 0.25;
    const nb = lod <= 1 ? Math.round(C.boughs + 2.5 * (1 - f)) : lod === 2 ? Math.round(C.boughs - 1 + 1.5 * (1 - f)) : lod === 3 ? 4 : 3, off = R() * 6.28;
    for (let j = 0; j < nb; j++) {
      const L = Rc(f) * (0.85 + R() * 0.3) * (lod >= 4 ? 1.15 : 1);
      const segs = sprucebough(tk, ctx, at(y), off + (j / nb) * 6.283 + (R() - 0.5) * 0.4, L, f, o);
      if (C.snow && R() < C.snow * (1.1 - 0.45 * f)) snowList.push(segs);
    }
  }
  // the leader: crossed upright sprays
  ctx.color(`oklch(${(C.tintL + 0.16).toFixed(3)} ${C.tintC} ${C.tintH})`);
  const lt = at(H - 1.9), lh = 2.2;
  for (const s of lod <= 2 ? [[1, 0, 0], [0, 0, 1]] : [[1, 0, 0]]) tk.stemCard(lt, [0, lh, 0], s, lh * 0.7, 0.43);
  if (lod <= 2) for (let j = 0; j < 4; j++) sprucebough(tk, ctx, at(H - 1.6), j * 1.571 + 0.4, 0.8, 1, o);
  // snow pillows along the chosen boughs, planar uvs
  if (snowList.length) {
    tk.shape(null); ctx.albedo(HULL.snow); ctx.color("oklch(0.84 0.012 235)"); ctx.roughness(0.95); // #art-critic: dimmer, cooler snow so pillows sit in the bough shade instead of glaring as paper
    const suv = (p) => [p[0] / 1.3, p[2] / 1.3], keep = 0.35 + 0.25 * C.snow;
    for (const segs of snowList) {
      const ns = Math.max(1, Math.round(segs.length * keep));
      for (let k = 0; k < ns; k++) {
        const { p0, p1, wid, side } = segs[k], t = k / segs.length, ww0 = wid * 0.2 * (1 - 0.6 * t) * (0.6 + 0.4 * C.snow), ww1 = ww0 * 0.7;
        const a = [p0[0], p0[1] + 0.12, p0[2]], b = [p1[0] - (p1[0] - p0[0]) * 0.25, p1[1] + 0.06 - (p1[1] - p0[1]) * 0.25, p1[2] - (p1[2] - p0[2]) * 0.25];
        const aL = add(a, scl(side, -ww0)), aR = add(a, scl(side, ww0)), bL = add(b, scl(side, -ww1)), bR = add(b, scl(side, ww1));
        const ac = [a[0], a[1] + 0.07, a[2]], bc = [b[0], b[1] + 0.05, b[2]];
        aL[1] -= 0.04; aR[1] -= 0.04; bL[1] -= 0.04; bR[1] -= 0.04;
        tk.quad(aL, bL, bc, ac, suv(aL), suv(bL), suv(bc), suv(ac)); tk.quad(ac, bc, bR, aR, suv(ac), suv(bc), suv(bR), suv(aR));
      }
    }
  }
  ctx.albedo(null); ctx.color(null); ctx.roughness(null);
  return tk.done();
}
// a broadleaf: trunk with flare, limbs (and twigs) as bark tubes, hanging crossed leaf-spray cards round the limb ends
export function broadleaf(ctx, B) {
  const tk = new TK(ctx), lod = ctx.lod || 1, R = B.R;
  const path = B.trunk, H = B.H;
  const trunkAt = (y) => { let k = 0; while (k < path.length - 2 && path[k + 1][1] < y) k++; const a = path[k], b = path[k + 1], t = Math.max(0, Math.min(1, (y - a[1]) / (b[1] - a[1] || 1))); return [a[0] + (b[0] - a[0]) * t, y, a[2] + (b[2] - a[2]) * t, a[3] + (b[3] - a[3]) * t]; };
  ctx.roughness(0.9);
  // limbs: computed at every level so the crown keeps its place
  const limbs = [];
  for (let b = 0; b < B.limbs; b++) {
    const fy = B.limbs > 1 ? b / (B.limbs - 1) : 0.5, y = H * (B.limbLo + (B.limbHi - B.limbLo) * fy) + (R() - 0.5) * 0.4;
    const a = R() * 0.6 + b * 2.39996, len = B.limbLen * (1 - B.limbFall * fy) * (0.8 + R() * 0.4), up = B.limbUp + (R() - 0.5) * 0.25 + fy * 0.25;
    const s = trunkAt(y), d = [Math.cos(a), 0, Math.sin(a)];
    const m = [s[0] + d[0] * len * 0.5, y + len * up * 0.6, s[2] + d[2] * len * 0.5], e = [s[0] + d[0] * len, y + len * up * (0.9 - B.arch), s[2] + d[2] * len];
    limbs.push({ s, m, e, d, r: Math.max(0.05, s[3] * B.limbR), len });
  }
  if (lod >= 5) {
    ctx.flat(); const raw = (a, b, c) => ctx.tri(...a, ...b, ...c);
    ctx.albedo(B.bark); ctx.color(B.barkTint);
    const t0 = path[1], t1 = trunkAt(H * B.limbLo);
    for (let i = 0; i < 4; i++) { const q = (k) => [Math.cos(k * 1.571), Math.sin(k * 1.571)], A = q(i), C = q(i + 1), r0 = t0[3], r1 = t1[3];
      raw([t0[0] + A[0] * r0, t0[1], t0[2] + A[1] * r0], [t1[0] + C[0] * r1, t1[1], t1[2] + C[1] * r1], [t0[0] + C[0] * r0, t0[1], t0[2] + C[1] * r0]);
      raw([t0[0] + A[0] * r0, t0[1], t0[2] + A[1] * r0], [t1[0] + A[0] * r1, t1[1], t1[2] + A[1] * r1], [t1[0] + C[0] * r1, t1[1], t1[2] + C[1] * r1]); }
    ctx.albedo(HULL.leaves); ctx.color(B.hullTint);
    const g = { ctx }, cx = limbs.reduce((s, l) => s + l.e[0], 0) / limbs.length, cz = limbs.reduce((s, l) => s + l.e[2], 0) / limbs.length;
    const cy = B.crownY, rr = B.crownR;
    const t = (1 + Math.sqrt(5)) / 2, V = [[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]].map((v) => { const l = Math.hypot(...v); return [cx + v[0] / l * rr[0], cy + v[1] / l * rr[1], cz + v[2] / l * rr[0]]; });
    const F = [0, 11, 5, 0, 5, 1, 0, 1, 7, 0, 7, 10, 0, 10, 11, 1, 5, 9, 5, 11, 4, 11, 10, 2, 10, 7, 6, 7, 1, 8, 3, 9, 4, 3, 4, 2, 3, 2, 6, 3, 6, 8, 3, 8, 9, 4, 9, 5, 2, 4, 11, 6, 2, 10, 8, 6, 7, 9, 8, 1];
    for (let i = 0; i < F.length; i += 3) raw(V[F[i]], V[F[i + 2]], V[F[i + 1]]);
    ctx.albedo(null); ctx.color(null); ctx.roughness(null); return;
  }
  ctx.smooth(); ctx.albedo(B.bark); ctx.color(B.barkTint);
  const seg = [0, B.seg, Math.max(6, B.seg - 3), 6, 5][lod];
  tk.tube(lod <= 3 ? path : [path[1], [...trunkAt(H * 0.85).slice(0, 3), 0.06]], seg, { uRep: B.uRep, vPer: B.vPer, rough: lod <= 2 ? flareRough(R() * 6, B.lobes) : null });
  const nl = [0, B.limbs, B.limbs, Math.ceil(B.limbs * 0.6), 0][lod];
  const twigs = [];
  for (let i = 0; i < nl; i++) {
    const l = limbs[i];
    tk.tube([[...l.s.slice(0, 3), l.r], [...l.m, l.r * 0.6], [...l.e, l.r * 0.25]], lod <= 2 ? 6 : 4, { uRep: 1, vPer: B.vPer });
    if (lod <= 1) for (let k = 0; k < B.twigs; k++) {
      const t = 0.45 + R() * 0.4, p = l.m.map((v, q) => l.s[q] + (l.e[q] - l.s[q]) * t), a = R() * 6.28, tl = l.len * (0.3 + R() * 0.25);
      const e = [p[0] + Math.cos(a) * tl, p[1] + tl * (0.35 - B.arch), p[2] + Math.sin(a) * tl];
      tk.tube([[...p, l.r * 0.35], [...e, 0.012]], 3, { uRep: 1, vPer: B.vPer }); twigs.push(e);
    }
  }
  // leaf sprays
  ctx.flat(); ctx.albedo(B.card); tk.shape(B.card); ctx.roughness(0.75);
  const pts = [];
  const per = [0, B.sprayStep, B.sprayStep * 1.5, B.sprayStep * 2.4, 0][lod];
  if (lod <= 3) {
    for (const l of limbs) { const n = Math.max(2, Math.round(l.len * 0.65 / per)); for (let k = 0; k < n; k++) { const t = 0.35 + 0.75 * (k / Math.max(1, n - 1)); const q = t <= 0.5 ? l.s.map((v, i) => i < 3 ? v + (l.m[i] - v) * t * 2 : 0) : l.m.map((v, i) => v + (l.e[i] - v) * (t - 0.5) * 2); pts.push([q[0] + (R() - 0.5) * 1.2, q[1] + (R() - 0.3) * 1.0, q[2] + (R() - 0.5) * 1.2]); } }
    for (const e of twigs) pts.push(e);
    const top = trunkAt(H - 0.5); for (let k = 0; k < [0, 6, 4, 2][lod]; k++) pts.push([top[0] + (R() - 0.5) * B.crownR[0], top[1] - R() * 2.5, top[2] + (R() - 0.5) * B.crownR[0]]);
  } else {
    for (let k = 0; k < 8; k++) { const a = k * 0.785 + R() * 0.3, r = B.crownR[0] * (k % 2 ? 0.45 : 0.75); pts.push([Math.cos(a) * r, B.crownY + (k % 2 ? 1.2 : -0.6) * B.crownR[1] * 0.5, Math.sin(a) * r]); }
  }
  const cards = [0, B.cardsPer, Math.max(2, B.cardsPer - 1), 2, 2][lod], size = B.cardSize * [0, 1, 1.25, 1.7, 2.4][lod];
  for (const p of pts) {
    const inner = Math.min(1, Math.hypot(p[0], p[2]) / B.crownR[0]);
    ctx.color(`oklch(${(B.tintL - 0.1 + 0.12 * inner + (R() - 0.5) * 0.05).toFixed(3)} ${B.tintC} ${(B.tintH + (R() - 0.5) * 10).toFixed(1)})`);
    const a0 = R() * 6.28;
    for (let c = 0; c < cards; c++) {
      const a = a0 + (c / cards) * Math.PI, r = [Math.cos(a), 0, Math.sin(a)];
      const tilt = (R() - 0.5) * B.hang, w = norm([Math.sin(tilt) * r[2], Math.cos(tilt), -Math.sin(tilt) * r[0]]);
      tk.card(p, norm(sub(r, scl(w, dot(r, w)))), w, size * (0.85 + R() * 0.3));
    }
  }
  ctx.albedo(null); ctx.color(null); ctx.roughness(null);
  return tk.done();
}
