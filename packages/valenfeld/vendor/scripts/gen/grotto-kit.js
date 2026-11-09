// Shared emitters for the Smugglers' Grotto (cave and mouth): hulls, crates, barrels, ropes, nets, kelp,
// barnacles, lanterns, braziers, lobster pots, plank walks and the rope bridge. Built on barrow-kit's K.
// Anything that reaches the collider takes its numbers from rng() (same in both passes), never ctx.random.
import { tripodBrazier } from "../lib/pieces/brazier.js";
export const TX = {
  rock: "cdn/texture-wet-black-basalt-rock.png", floor: "cdn/texture-wet-shingle-cave-floor.png",
  plank: "cdn/texture-weathered-grey-dock-planks.png", hull: "cdn/texture-rotting-ship-hull-planks.png",
  oak: "cdn/texture-dark-oak-planks-weathered.png", iron: "cdn/texture-wrought-iron.png",
};
export function rng(seed) {
  let s = (seed * 2654435761) >>> 0 || 1;
  return () => { s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export function sea(K, ctx, col) {
  const lod = col ? 4 : ctx.lod, S = {};
  const wood = (tex = TX.plank, c = "oklch(0.92 0.02 70)") => K.paint(tex, c, 0.72);
  const oak = () => K.paint(TX.oak, "oklch(0.82 0.03 60)", 0.8);
  const iron = () => K.paint(TX.iron, "oklch(0.85 0.01 60)", 0.5, 0.7);
  S.wood = wood; S.oak = oak; S.iron = iron;
  S.line = (pts, r = 0.018, n = 4) => { if (col) return; for (let i = 0; i < pts.length - 1; i++) K.seg(pts[i], pts[i + 1], r, r, n); };
  S.rope = (a, b, sag = 0.1, r = 0.018) => {
    if (col) return;
    K.paint(null, "oklch(0.6 0.05 75)", 0.95);
    const n = lod <= 2 ? 6 : 3, pts = [];
    for (let i = 0; i <= n; i++) { const t = i / n; pts.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - sag * Math.sin(Math.PI * t), a[2] + (b[2] - a[2]) * t]); }
    S.line(pts, r);
  };
  // a clinker hull, keel on y = 0 along z, open-topped; hole = +1 / -1 stoves in that side amidships
  S.hull = (L, B, D, hole = 0, tex = TX.hull) => {
    if (col) return K.box(-B / 2, 0, -L / 2, B / 2, D * 0.8, L / 2);
    const NS = lod <= 2 ? 14 : 8, NK = lod <= 2 ? 6 : 4, P = [];
    for (let i = 0; i <= NS; i++) {
      const t = i / NS, z = -L / 2 + L * t, w = (B / 2) * Math.pow(Math.max(0, Math.sin(Math.PI * t)), 0.5), sh = D * (1 + 0.22 * Math.pow(2 * t - 1, 2)), row = [];
      for (let k = 0; k <= NK; k++) { const a = (k / NK) * Math.PI / 2; row.push([w * Math.sin(a), sh * (1 - Math.cos(a))]); }
      P.push({ z, row });
    }
    wood(tex, "oklch(0.9 0.02 70)");
    const h0 = Math.floor(NS * 0.36), h1 = Math.ceil(NS * 0.62);
    for (const s of [-1, 1]) for (let i = 0; i < NS; i++) for (let k = 0; k < NK; k++) {
      if (s === hole && i >= h0 && i < h1 && k >= 1 && k < NK - 1) continue;
      const A = P[i].row[k], B2 = P[i].row[k + 1], C = P[i + 1].row[k + 1], E = P[i + 1].row[k];
      K.quad([s * A[0], A[1], P[i].z], [s * B2[0], B2[1], P[i].z], [s * C[0], C[1], P[i + 1].z], [s * E[0], E[1], P[i + 1].z]);
    }
    oak();
    for (let i = 1; i < NS; i += lod <= 2 ? 1 : 2) for (const s of [-1, 1]) for (let k = 0; k < NK; k++) { const a = P[i].row[k], b = P[i].row[k + 1]; K.seg([s * a[0] * 0.95, a[1] + 0.04, P[i].z], [s * b[0] * 0.95, b[1] + 0.04, P[i].z], 0.045 * D, 0.045 * D, 4); }
    for (const s of [-1, 1]) for (let i = 0; i < NS; i++) { const a = P[i].row[NK], b = P[i + 1].row[NK]; K.seg([s * a[0], a[1], P[i].z], [s * b[0], b[1], P[i + 1].z], 0.05 * D, 0.05 * D, 5); }
    for (let i = 0; i < NS; i++) K.seg([0, 0, P[i].z], [0, 0, P[i + 1].z], 0.06 * D + 0.03, 0.06 * D + 0.03, 5);
    K.seg([0, 0, -L / 2], [0, P[0].row[NK][1] + 0.35 * D, -L / 2 - 0.12 * D], 0.05 * D + 0.03, 0.04 * D + 0.03, 5, true);
    K.seg([0, 0, L / 2], [0, P[NS].row[NK][1] + 0.2 * D, L / 2 + 0.06 * D], 0.05 * D + 0.03, 0.04 * D + 0.03, 5, true);
  };
  S.crate = (x, y, z, s, yaw = 0) => K.at(() => {
    wood(TX.plank, "oklch(0.88 0.03 70)"); K.bbox(-s / 2, 0, -s / 2, s / 2, s, s / 2, 0.02);
    if (col || lod > 2) return;
    oak(); const b = 0.07, e = s / 2 + 0.012;
    for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) K.box(sx * e, 0, sz * e, sx * (e - b), s, sz * (e - b));
    for (const sz of [-1, 1]) { K.box(-e, s - b, sz * e, e, s, sz * (e - b)); K.box(-e, 0, sz * e, e, b, sz * (e - b)); }
    for (const sx of [-1, 1]) { K.box(sx * e, s - b, -e, sx * (e - b), s, e); }
  }, x, y, z, yaw);
  S.barrel = (x, y, z, r = 0.3, h = 0.9) => {
    if (col) return K.box(x - r, y, z - r, x + r, y + h, z + r);
    oak(); const n = lod <= 2 ? 12 : 8;
    K.seg([x, y, z], [x, y + h / 2, z], r * 0.85, r, n); K.seg([x, y + h / 2, z], [x, y + h, z], r, r * 0.85, n);
    K.seg([x, y + h - 0.03, z], [x, y + h - 0.02, z], r * 0.84, r * 0.84, n, true); K.seg([x, y, z], [x, y + 0.01, z], r * 0.84, r * 0.84, n, true);
    iron(); for (const f of [0.1, 0.36, 0.64, 0.9]) { const rr = r * (0.85 + 0.15 * Math.sin(Math.PI * f)) + 0.01; K.seg([x, y + h * f - 0.025, z], [x, y + h * f + 0.025, z], rr, rr, n); }
  };
  S.lanternBody = (fx, y, fz) => {
    if (col) return;
    iron();
    K.seg([fx, y + 0.22, fz], [fx, y + 0.31, fz], 0.12, 0.025, 4, true);
    K.box(fx - 0.1, y - 0.2, fz - 0.1, fx + 0.1, y - 0.16, fz + 0.1);
    for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) K.seg([fx + a * 0.085, y - 0.16, fz + b * 0.085], [fx + a * 0.085, y + 0.22, fz + b * 0.085], 0.012, 0.012, 4);
    K.seg([fx, y + 0.31, fz], [fx, y + 0.4, fz], 0.03, 0.03, 4);
    ctx.albedo(null); ctx.color("#ffd9a0"); ctx.roughness(0.2); ctx.metalness(0); ctx.emissive(2.4, 1.3, 0.45);
    K.box(fx - 0.075, y - 0.16, fz - 0.075, fx + 0.075, y + 0.2, fz + 0.075);
    ctx.emissive(null);
  };
  // a wall lantern: (x, y, z) the wall face at flame height, (nx, nz) the way into the room
  S.lantern = (x, y, z, nx, nz) => {
    if (col) return;
    const fx = x + nx * 0.42, fz = z + nz * 0.42;
    iron();
    K.box(x - (nz ? 0.08 : 0), y + 0.45, z - (nx ? 0.08 : 0), x + (nz ? 0.08 : nx * 0.04), y + 0.78, z + (nx ? 0.08 : nz * 0.04));
    K.seg([x + nx * 0.03, y + 0.62, z + nz * 0.03], [fx, y + 0.62, fz], 0.018, 0.018, 4);
    K.seg([fx, y + 0.62, fz], [fx, y + 0.4, fz], 0.008, 0.008, 4);
    S.lanternBody(fx, y, fz);
  };
  S.brazier = (x, y, z) => tripodBrazier(K, ctx, col, x, y, z, {}, iron);
  S.campfire = (x, z) => {
    if (col) return;
    K.paint(TX.rock, "oklch(0.88 0.01 240)", 0.6);
    for (let k = 0; k < 9; k++) { const a = (k / 9) * 6.283; K.rock(x + Math.cos(a) * 0.62, 0.1, z + Math.sin(a) * 0.62, 0.17, 0.13, 0.15, 6, 4, 0.25); }
    K.paint(null, "#16110d", 1); K.box(x - 0.45, 0, z - 0.45, x + 0.45, 0.03, z + 0.45);
    oak(); for (let k = 0; k < 3; k++) { const a = k * 2.1; K.seg([x + Math.cos(a) * 0.5, 0.05, z + Math.sin(a) * 0.5], [x - Math.cos(a) * 0.15, 0.32, z - Math.sin(a) * 0.15], 0.06, 0.05, 6, true); }
  };
  S.kelp = (x, y, z, len, yaw, hang = false) => {
    if (col || lod > 2) return;
    K.paint(null, "oklch(0.36 0.06 115)", 0.3);
    K.at(() => {
      const n = 7; let prev = null;
      for (let i = 0; i <= n; i++) {
        const t = i / n, w = 0.075 * (1 - t * 0.6), wv = Math.sin(t * 6 + x * 3) * 0.14;
        const cur = hang ? [[wv - w, -len * t, 0.01 * i], [wv + w, -len * t, 0.01 * i]] : [[wv - w, 0.012, -len * t], [wv + w, 0.012, -len * t]];
        if (prev) K.quad(prev[0], prev[1], cur[1], cur[0], hang ? null : [0, -1, -len * t]);
        prev = cur;
      }
    }, x, y, z, yaw);
  };
  // a crust of barnacles round (x, z) between heights, on a post or rock of radius r
  S.barnacles = (x, y0, y1, z, r, n) => {
    if (col || lod > 2) return;
    K.paint(null, "oklch(0.8 0.02 85)", 0.9);
    for (let k = 0; k < n; k++) {
      const a = ctx.random() * 6.283, y = y0 + ctx.random() * (y1 - y0), c = Math.cos(a), s = Math.sin(a), sz = 0.02 + ctx.random() * 0.025;
      K.seg([x + c * r, y, z + s * r], [x + c * (r + sz * 1.3), y, z + s * (r + sz * 1.3)], sz, sz * 0.4, 5, true);
    }
  };
  // a fishing net: o its corner, u and v its edges, sagging along nrm
  S.net = (o, u, v, nrm, sag = 0.15) => {
    if (col || lod > 2) return;
    K.paint(null, "oklch(0.55 0.04 80)", 1);
    const nu = 10, nv = 7, P = (i, j) => { const f = sag * Math.sin((Math.PI * i) / nu) * Math.sin((Math.PI * j) / nv); return [o[0] + u[0] * i / nu + v[0] * j / nv + nrm[0] * f, o[1] + u[1] * i / nu + v[1] * j / nv + nrm[1] * f, o[2] + u[2] * i / nu + v[2] * j / nv + nrm[2] * f]; };
    for (let i = 0; i <= nu; i++) for (let j = 0; j < nv; j++) K.seg(P(i, j), P(i, j + 1), 0.008, 0.008, 3);
    for (let j = 0; j <= nv; j++) for (let i = 0; i < nu; i++) K.seg(P(i, j), P(i + 1, j), 0.008, 0.008, 3);
    K.paint(null, "oklch(0.6 0.13 45)", 0.8); for (let i = 1; i < nu; i += 3) { const p = P(i, nv); K.rock(p[0], p[1], p[2], 0.07, 0.05, 0.07, 6, 3, 0.05); }
  };
  S.pot = (x, y, z, yaw = 0) => K.at(() => {
    if (col) return K.box(-0.36, 0, -0.26, 0.36, 0.3, 0.26);
    K.paint(TX.oak, "oklch(0.75 0.04 60)", 0.85); K.box(-0.36, 0, -0.26, 0.36, 0.04, 0.26);
    const arc = (xx) => { const pts = []; for (let k = 0; k <= 6; k++) { const a = (Math.PI * k) / 6; pts.push([xx, 0.04 + Math.sin(a) * 0.26, Math.cos(a) * 0.25]); } S.line(pts, 0.014); };
    arc(-0.34); arc(0); arc(0.34);
    for (let k = 1; k < 6; k++) { const a = (Math.PI * k) / 6; K.seg([-0.35, 0.04 + Math.sin(a) * 0.26, Math.cos(a) * 0.25], [0.35, 0.04 + Math.sin(a) * 0.26, Math.cos(a) * 0.25], 0.01, 0.01, 3); }
    K.paint(null, "oklch(0.58 0.05 80)", 1); K.seg([0.34, 0.16, 0], [0.12, 0.16, 0], 0.18, 0.05, 8);
  }, x, y, z, yaw);
  // a plank walk through [x, z] points, deck top at y, on posts postDepth deep
  S.walk = (pts, y = 0, w = 1.5, postDepth = 0.8) => {
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, az] = pts[i], [bx, bz] = pts[i + 1], dx = bx - ax, dz = bz - az, L = Math.hypot(dx, dz), yaw = (Math.atan2(-dx, -dz) * 180) / Math.PI;
      K.at(() => {
        if (col) { K.box(-w / 2, y - 0.12, -L - 0.25, w / 2, y, 0.25); return; }
        wood(); const n = Math.max(1, Math.round(L / 0.3));
        for (let k = 0; k < n; k++) { const z0 = (-k * L) / n, jy = -ctx.random() * 0.015, j = ctx.random() * 0.06; K.box(-w / 2 + j, y - 0.06 + jy, z0 - L / n + 0.025, w / 2 - j * 0.5, y + jy, z0); }
        if (lod > 2) return;
        oak();
        for (const s of [-1, 1]) K.box(s * (w / 2 - 0.1), y - 0.2, -L, s * (w / 2 - 0.22), y - 0.06, 0);
        for (let z = 0; z >= -L; z -= 1.5) for (const s of [-1, 1]) K.seg([s * (w / 2 - 0.16), y - 0.06, z], [s * (w / 2 - 0.16), y - postDepth, z], 0.07, 0.08, 6);
      }, ax, 0, az, yaw);
    }
  };
  // a rope bridge running -z from zA to zB at deck y 0, sagging
  S.bridge = (zA, zB, w = 1.4, sag = 0.3) => {
    const L = zA - zB, yAt = (t) => -sag * Math.sin(Math.PI * t), n = 12;
    if (col) {
      for (let i = 0; i < n; i++) {
        const t0 = i / n, t1 = (i + 1) / n, za = zA - L * t0, zb = zA - L * t1, yt = Math.max(yAt(t0), yAt(t1));
        K.box(-w / 2, yt - 0.15, zb - 0.02, w / 2, yt, za + 0.02);
        K.box(-w / 2 - 0.08, yt, zb, -w / 2, yt + 1.1, za); K.box(w / 2, yt, zb, w / 2 + 0.08, yt + 1.1, za);
      }
      for (const z of [zA + 0.3, zB - 0.3]) for (const s of [-1, 1]) K.box(s * (w / 2 + 0.05) - 0.12, 0, z - 0.12, s * (w / 2 + 0.05) + 0.12, 1.35, z + 0.12);
      return;
    }
    wood(); const np = Math.round(L / 0.3);
    for (let k = 0; k < np; k++) { const t = (k + 0.5) / np; K.at(() => K.box(-w / 2, -0.05, -0.12, w / 2, 0, 0.12), (ctx.random() - 0.5) * 0.06, yAt(t), zA - L * t, (ctx.random() - 0.5) * 6); }
    const edge = (x, dy) => { const p = []; for (let i = 0; i <= n; i++) { const t = i / n; p.push([x, yAt(t) + dy + (dy > 0.5 ? sag * 0.4 * Math.sin(Math.PI * t) : 0), zA - L * t]); } return p; };
    K.paint(null, "oklch(0.6 0.05 75)", 0.95);
    for (const s of [-1, 1]) {
      S.line(edge(s * w / 2, -0.03), 0.025); const hand = edge(s * (w / 2 + 0.05), 1.12); hand[0][1] = 1.3; hand[n][1] = 1.3; S.line(hand, 0.025);
      for (let i = 1; i < n; i++) { const t = i / n; S.line([[s * w / 2, yAt(t) - 0.03, zA - L * t], hand[i]], 0.012); }
    }
    oak(); for (const z of [zA + 0.3, zB - 0.3]) for (const s of [-1, 1]) K.seg([s * (w / 2 + 0.05), -0.1, z], [s * (w / 2 + 0.05), 1.35, z], 0.11, 0.1, 7, true);
  };
  return S;
}
