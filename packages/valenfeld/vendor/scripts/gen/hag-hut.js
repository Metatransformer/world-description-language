// Briar's Hollow (briars-hollow): Old Mother Briar's hut in a dark hollow of the Greywood. One scripted geometry.
//  Local frame: origin the yard's centre, +z toward the foot-path in (the gap in the pale-stone ring),
//  the hut stands at -z with its door facing the yard; the cauldron hangs over the smoulder at SPOTS.fire.
//  Parameterised by params: { seed, ringR, stones } so another hag's yard is a data row.
import { G, X, rng, TEX, mossyRock, bone } from "../lib/geo.js";
const T = { ...TEX, daub: "cdn/texture-wattle-and-daub-plaster-weathered.png", wattle: "cdn/texture-woven-wattle-hazel-sticks.png", thatch: "cdn/texture-thatch-straw-old-mossy.png" };
const BONE = "oklch(0.9 0.025 90)", PALE = "oklch(0.93 0.015 95)", SOOT = "oklch(0.2 0.01 50)", STRING = "oklch(0.42 0.03 60)";
export const SPOTS = { hut: [0, -5.2], fire: [0.4, 1.6], rack: [4.6, -1.2], gallows: [-4.4, 0.8], arch: [0, 9.6], wood: [-3.8, -2.6] };
export const HUT = { rx: 2.7, rz: 2.3, wall: 2.0, apex: 4.3, door: 0.27 };
const N = 14;
function ringPts(R, seed) {   // the wall's crooked ring: N+1 vertices, the open span is the door (+z)
  const out = [];
  for (let i = 0; i <= N; i++) { const a = Math.PI / 2 + HUT.door + i * (2 * Math.PI - 2 * HUT.door) / N, j = 1 + (R() - 0.5) * 0.08;
    out.push({ a, x: Math.cos(a) * HUT.rx * j, z: Math.sin(a) * HUT.rz * j, h: HUT.wall + (R() - 0.5) * 0.3 + Math.sin(a * 2 + seed) * 0.12 }); }
  return out;
}
function hut(g, ctx, lod, R) {
  const P = ringPts(R, 3), lean = (y) => [y * 0.06, y * 0.025];   // the whole hut leans a little east and south
  const W = (p, y, k = 1) => { const [lx, lz] = lean(y); return [p.x * k + lx, y, p.z * k + lz]; };
  g.at(X([SPOTS.hut[0], 0, SPOTS.hut[1]], -6), () => {
    // the walls: daub outside, a dark inside, bare wattle where the daub fell away
    for (let i = 0; i < N; i++) { const a = P[i], b = P[i + 1], bare = (i * 7 + 3) % 5 === 0;
      ctx.smooth(); ctx.albedo(bare ? T.wattle : T.daub); ctx.color(bare ? "oklch(0.74 0.04 70)" : "oklch(0.83 0.03 80)");
      const segs = lod <= 1 ? 3 : 1;
      for (let s = 0; s < segs; s++) { const y0 = -0.3 + (a.h + 0.3) * s / segs, y1 = -0.3 + (a.h + 0.3) * (s + 1) / segs, yb0 = -0.3 + (b.h + 0.3) * s / segs, yb1 = -0.3 + (b.h + 0.3) * (s + 1) / segs;
        const bulge = (y) => 1 + 0.04 * Math.sin(y * 2.3 + i);
        g.quad(W(a, y0, bulge(y0)), W(b, yb0, bulge(yb0)), W(b, yb1, bulge(yb1)), W(a, y1, bulge(y1)));
        ctx.albedo(null); ctx.color("oklch(0.24 0.02 55)");
        g.quad(W(a, y1, 0.9), W(b, yb1, 0.9), W(b, yb0, 0.9), W(a, y0, 0.9));
        ctx.albedo(bare ? T.wattle : T.daub); ctx.color(bare ? "oklch(0.74 0.04 70)" : "oklch(0.83 0.03 80)"); }
      ctx.flat(); ctx.color("oklch(0.5 0.03 70)"); g.quad(W(a, a.h, 0.9), W(b, b.h, 0.9), W(b, b.h), W(a, a.h));
      ctx.color("oklch(0.48 0.04 120)"); ctx.albedo(T.moss);   // mud splash and moss creeping up the footing
      g.quad(W(a, -0.3, 1.03), W(b, -0.3, 1.03), W(b, 0.35 + (i % 3) * 0.1, 1.02), W(a, 0.3 + ((i + 1) % 3) * 0.1, 1.02)); }
    // smoke-dark oak posts at every bend, crooked and over-tall at the door
    ctx.smooth(); ctx.albedo(T.log); ctx.color("oklch(0.45 0.02 50)");
    for (let i = 0; i <= N; i += (lod <= 1 ? 2 : 7)) { const p = P[i], door = i === 0 || i === N, top = door ? p.h + 0.25 : p.h;
      g.tube([[...W(p, -0.3, 1.02), 0.09], [...W(p, top * 0.5, 1.03), 0.08], [...W(p, top, 1.02), 0.07]], 6, { capB: true }); }
    const d0 = P[0], d1 = P[N];   // the lintel, sagging
    g.tube([[...W(d1, 1.72, 1.02), 0.08], [(d0.x + d1.x) / 2 + 0.1, 1.64, (d0.z + d1.z) / 2 + 0.05, 0.08], [...W(d0, 1.72, 1.02), 0.08]], 6, { capA: true, capB: true });
    ctx.albedo(T.daub); ctx.color("oklch(0.78 0.03 80)");   // daub over the door up to the eave
    g.quad(W(d1, 1.75, 1.0), W(d0, 1.75, 1.0), W(d0, d0.h, 1.0), W(d1, d1.h, 1.0));
    g.quad(W(d1, d1.h, 0.9), W(d0, d0.h, 0.9), W(d0, 1.75, 0.9), W(d1, 1.75, 0.9));
    ctx.flat(); ctx.albedo(null); ctx.color("oklch(0.1 0.01 40)");   // the black of the doorway and floor inside
    for (let i = 0; i < N; i++) g.tri([0, 0.02, 0], W(P[i + 1], 0.02, 0.88), W(P[i], 0.02, 0.88));
    g.tri([0, 0.02, 0], W(P[0], 0.02, 0.88), W(P[N], 0.02, 0.88));
    ctx.color("oklch(0.3 0.04 40)"); g.at(X([(d0.x + d1.x) / 2 * 0.95, 0, (d0.z + d1.z) / 2 * 0.95], 0, 0, 4), () => g.box(0, 0.75, 0.04, 0.85, 1.5, 0.03));   // a hide curtain, half drawn
    // the sagging thatch: rings from a drooping ragged eave to a crooked apex
    const RINGS = lod <= 1 ? 6 : 3, SEG = lod <= 1 ? 22 : 12, apex = [0.35, HUT.apex, -0.2];
    const ring = (t) => { const out = []; for (let s = 0; s <= SEG; s++) { const a = s / SEG * 6.283, k = 1.32 * (1 - t), sag = 0.32 * Math.sin(Math.PI * t) * (1 + 0.5 * Math.sin(a * 3 + 1)), dip = Math.max(0, Math.cos(a - 0.6)) * 0.25 * (1 - t);
        const y = HUT.wall - 0.25 + (apex[1] - HUT.wall + 0.25) * Math.pow(t, 1.25) - sag - dip, [lx, lz] = lean(y);
        out.push([Math.cos(a) * HUT.rx * k + apex[0] * t + lx, y, Math.sin(a) * HUT.rz * k + apex[2] * t + lz]); } return out; };
    const rings = []; for (let r = 0; r <= RINGS; r++) rings.push(ring(r / RINGS));
    for (let r = 0; r < RINGS; r++) for (let s = 0; s < SEG; s++) { const A = rings[r][s], B = rings[r][s + 1], C = rings[r + 1][s + 1], D = rings[r + 1][s];
      const n = ctx.noise3d(A[0] * 0.9, A[1] * 0.9, A[2] * 0.9), mossy = n > 0.05 || (r >= RINGS - 2 && n > -0.25);
      ctx.smooth(); ctx.albedo(mossy ? T.moss : T.thatch); ctx.color(mossy ? "oklch(0.7 0.07 128)" : "oklch(0.72 0.04 78)");
      g.quad(A, D, C, B);
      ctx.albedo(null); ctx.color("oklch(0.2 0.02 55)"); g.quad(A, B, C, D); }
    ctx.albedo(T.thatch); ctx.color("oklch(0.62 0.04 75)");   // the ragged straw fringe hanging off the eave
    for (let s = 0; s < SEG; s++) { const A = rings[0][s], B = rings[0][s + 1], h1 = 0.22 + 0.18 * Math.abs(Math.sin(s * 2.7)), h2 = 0.22 + 0.18 * Math.abs(Math.sin((s + 1) * 2.7));
      g.quad([A[0], A[1] - h1, A[2]], [B[0], B[1] - h2, B[2]], B, A); g.quad(A, B, [B[0], B[1] - h2, B[2]], [A[0], A[1] - h1, A[2]]); }
    ctx.albedo(T.log); ctx.color("oklch(0.4 0.02 50)");   // the bound stick crown poking out of the smoke-hole
    for (let j = 0; j < 7; j++) { const a = j * 0.9; g.tube([[apex[0] + Math.cos(a) * 0.1, apex[1] - 0.3, apex[2] + Math.sin(a) * 0.1, 0.035], [apex[0] + Math.cos(a) * 0.35, apex[1] + 0.45 + (j % 3) * 0.12, apex[2] + Math.sin(a) * 0.35, 0.015]], 5, { capB: true }); }
    // a skull nailed over the door, string charms off the eave all round
    ctx.flat(); ctx.albedo(null); ctx.color(BONE);
    const mid = [(d0.x + d1.x) / 2 + 0.1, 1.95, (d0.z + d1.z) / 2 + 0.1];
    g.tris(g.blob(mid, [0.13, 0.12, 0.15], 1, 0.12, 1.4, 9)); ctx.color(SOOT); g.box(mid[0] - 0.05, mid[1] + 0.01, mid[2] + 0.13, 0.04, 0.035, 0.02); g.box(mid[0] + 0.05, mid[1] + 0.01, mid[2] + 0.13, 0.04, 0.035, 0.02);
    for (let s = 1; s < SEG; s += (lod <= 1 ? 2 : 4)) { const A = rings[0][s]; if (A[2] > 1.3 && Math.abs(A[0]) < 1.2) continue; charm(g, ctx, [A[0] * 0.96, A[1] - 0.1, A[2] * 0.96], 0.45 + (s % 4) * 0.15, s, lod); }
    // herb bundles drying under the eave by the door
    for (let j = 0; j < 4; j++) herbs(g, ctx, [-1.3 + j * 0.28 + (j > 1 ? 2.1 : 0), 1.72, HUT.rz + 0.3 - Math.abs(j - 1.5) * 0.1], j);
  });
}
function charm(g, ctx, top, len, k, lod) {   // a string, then a bone, a knucklebone cluster, a feather or a little twig-man
  ctx.flat(); ctx.albedo(null); ctx.color(STRING);
  const end = [top[0], top[1] - len, top[2]];
  g.tube([[...top, 0.006], [...end, 0.006]], 3);
  const kind = k % 4;
  if (kind === 0) { ctx.color(BONE); g.at(X(end, k * 37, 0, 80), () => bone(g, [0, -0.11, 0], [0, 0.11, 0], 0.018, 4)); }
  else if (kind === 1) { ctx.color(BONE); for (let j = 0; j < (lod <= 1 ? 3 : 1); j++) g.tris(g.blob([end[0] + (j - 1) * 0.04, end[1] - j * 0.05, end[2]], [0.03, 0.035, 0.03], 0, 0.1, 1, k + j)); }
  else if (kind === 2) { ctx.color("oklch(0.25 0.01 260)"); g.at(X(end, k * 53), () => { g.tri([0, 0, 0], [0.025, -0.2, 0], [-0.025, -0.2, 0]); g.tri([0, 0, 0], [-0.025, -0.2, 0], [0.025, -0.2, 0]); }); }
  else { ctx.color("oklch(0.4 0.03 60)"); g.at(X(end, k * 29), () => { g.box(0, -0.1, 0, 0.02, 0.2, 0.02); g.box(0, -0.06, 0, 0.14, 0.02, 0.02); g.box(-0.03, -0.24, 0, 0.015, 0.1, 0.015); g.box(0.03, -0.24, 0, 0.015, 0.1, 0.015); }); }
}
function herbs(g, ctx, top, k) {   // a hung bundle: tied stems up, heads drooping down
  ctx.flat(); ctx.albedo(null); ctx.color(STRING); g.tube([[...top, 0.006], [top[0], top[1] - 0.12, top[2], 0.006]], 3);
  const cols = ["oklch(0.52 0.08 130)", "oklch(0.58 0.06 95)", "oklch(0.46 0.07 150)", "oklch(0.55 0.09 30)"];
  ctx.color(cols[k % 4]);
  g.tube([[top[0], top[1] - 0.1, top[2], 0.03], [top[0], top[1] - 0.22, top[2], 0.06], [top[0], top[1] - 0.42, top[2], 0.1], [top[0], top[1] - 0.48, top[2], 0.04]], 6, { capB: true, rough: (th) => 0.7 + 0.4 * Math.abs(Math.sin(th * 3 + k)) });
}
function pole(g, ctx, a, b, r = 0.06) { ctx.smooth(); ctx.albedo(T.log); ctx.color("oklch(0.48 0.02 50)"); const m = [(a[0] + b[0]) / 2 + 0.06, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2 - 0.05]; g.tube([[...a, r], [...m, r * 0.9], [...b, r * 0.75]], 6, { capA: true, capB: true }); }
function yard(g, ctx, lod, R, p) {
  const [fx, fz] = SPOTS.fire;
  // the smoulder: a ring of sooted stones, charred brands, a bed of ash
  ctx.flat(); ctx.albedo(null); ctx.color("oklch(0.3 0.01 60)");
  g.tris(g.blob([fx, -0.05, fz], [0.7, 0.08, 0.7], 1, 0.1, 1, 2));
  for (let j = 0; j < (lod <= 1 ? 9 : 6); j++) { const a = j / (lod <= 1 ? 9 : 6) * 6.283; mossyRock(g, [fx + Math.cos(a) * 0.82, 0.02, fz + Math.sin(a) * 0.82], [0.17, 0.13, 0.15], 1, j + 40, { rock: T.rock, rockTint: "oklch(0.5 0.01 70)" }); }
  ctx.smooth(); ctx.albedo(T.log); ctx.color("oklch(0.18 0.01 40)");
  for (let j = 0; j < 4; j++) { const a = j * 1.6 + 0.3; g.tube([[fx + Math.cos(a) * 0.6, 0.05, fz + Math.sin(a) * 0.6, 0.07], [fx + Math.cos(a) * 0.08, 0.16, fz + Math.sin(a) * 0.08, 0.05]], 6, { capA: true, capB: true }); }
  // the tripod of crooked poles, a chain, the cauldron hung low over the coals
  const top = [fx, 2.25, fz];
  for (let j = 0; j < 3; j++) { const a = j * 2.094 + 0.4; pole(g, ctx, [fx + Math.cos(a) * 1.15, -0.2, fz + Math.sin(a) * 1.15], [top[0] + Math.cos(a) * 0.12, top[1] + 0.25, top[2] + Math.sin(a) * 0.12], 0.055); }
  ctx.flat(); ctx.albedo(T.iron); ctx.color("oklch(0.35 0.01 250)");
  for (let j = 0; j < 7; j++) g.at(X([fx, 2.15 - j * 0.1, fz], j * 90), () => g.box(0, 0, 0, 0.05, 0.09, 0.015));
  const cy = 0.45, seg = lod <= 1 ? 16 : 10;
  ctx.smooth(); ctx.albedo(T.iron); ctx.color("oklch(0.3 0.01 60)");
  g.tube([[fx, cy, fz, 0.02], [fx, cy + 0.02, fz, 0.25], [fx, cy + 0.15, fz, 0.42], [fx, cy + 0.38, fz, 0.48], [fx, cy + 0.62, fz, 0.42], [fx, cy + 0.7, fz, 0.38], [fx, cy + 0.74, fz, 0.42]], seg);
  g.tube([[fx, cy + 0.74, fz, 0.42], [fx, cy + 0.7, fz, 0.36], [fx, cy + 0.4, fz, 0.34]], seg);   // rim lip folded in
  ctx.flat(); ctx.albedo(null); ctx.color("oklch(0.45 0.12 135)");   // the brew
  for (let j = 0; j < seg; j++) { const a0 = j / seg * 6.283, a1 = (j + 1) / seg * 6.283; g.tri([fx, cy + 0.6, fz], [fx + Math.cos(a1) * 0.37, cy + 0.6, fz + Math.sin(a1) * 0.37], [fx + Math.cos(a0) * 0.37, cy + 0.6, fz + Math.sin(a0) * 0.37]); }
  ctx.color("oklch(0.3 0.01 250)"); g.tube([[fx - 0.45, cy + 0.72, fz, 0.012], [fx - 0.3, cy + 1.25, fz, 0.012], [fx, cy + 1.42, fz, 0.012], [fx + 0.3, cy + 1.25, fz, 0.012], [fx + 0.45, cy + 0.72, fz, 0.012]], 4);
  ctx.color(BONE); g.at(X([fx + 0.2, cy + 0.68, fz - 0.1], 30, 0, 50), () => bone(g, [0, 0, -0.35], [0, 0, 0.35], 0.02, 4));   // a ladle-bone stirred in
  // the drying rack: two forked posts, a pole, a row of hung bundles
  const [rx, rz] = SPOTS.rack;
  g.at(X([rx, 0, rz], 70), () => {
    pole(g, ctx, [-1.3, -0.2, 0], [-1.25, 2.0, 0.05]); pole(g, ctx, [1.3, -0.2, 0], [1.32, 1.92, -0.04]);
    pole(g, ctx, [-1.5, 1.86, 0.03], [1.5, 1.8, -0.02], 0.045);
    for (let j = 0; j < (lod <= 1 ? 8 : 4); j++) herbs(g, ctx, [-1.1 + j * (lod <= 1 ? 0.31 : 0.62), 1.8, 0], j + 1);
  });
  // the charm gallows: a crooked post and arm hung thick with bones over the yard
  const [gx, gz] = SPOTS.gallows;
  g.at(X([gx, 0, gz], -30), () => {
    pole(g, ctx, [0, -0.2, 0], [0.12, 2.7, 0.05], 0.08); pole(g, ctx, [-0.1, 2.55, 0], [1.6, 2.35, 0.1], 0.05);
    for (let j = 0; j < (lod <= 1 ? 6 : 3); j++) charm(g, ctx, [0.2 + j * 0.24, 2.4 - j * 0.03, 0.05], 0.5 + (j % 3) * 0.25, j + 2, lod);
    ctx.flat(); ctx.color(BONE); g.tris(g.blob([0.13, 2.82, 0.05], [0.14, 0.15, 0.17], 1, 0.15, 1.3, 21));   // an elk skull capping it
    ctx.color(BONE); g.tube([[0.05, 2.9, 0.05, 0.03], [-0.25, 3.25, 0.1, 0.02], [-0.45, 3.35, 0.05, 0.01]], 4); g.tube([[0.2, 2.9, 0.05, 0.03], [0.5, 3.25, 0.1, 0.02], [0.7, 3.33, 0.05, 0.01]], 4);
  });
  // the gate of charms where the foot-path enters: two leaning poles, a bough across, strings of bone
  const [ax, az] = SPOTS.arch;
  g.at(X([ax, 0, az]), () => {
    pole(g, ctx, [-1.1, -0.2, 0], [-0.8, 2.6, 0.1], 0.07); pole(g, ctx, [1.1, -0.2, 0], [0.85, 2.5, -0.05], 0.07);
    pole(g, ctx, [-1.2, 2.45, 0.05], [1.25, 2.38, -0.02], 0.05);
    for (let j = 0; j < (lod <= 1 ? 7 : 3); j++) charm(g, ctx, [-0.9 + j * 0.3, 2.38, 0.02], 0.35 + ((j * 3) % 4) * 0.12, j, lod);
  });
  // a woodpile against the hut's side and a few clay pots
  const [wx, wz] = SPOTS.wood;
  g.at(X([wx, 0, wz], 30), () => { ctx.smooth(); ctx.albedo(T.log); ctx.color("oklch(0.55 0.02 55)");
    for (let r = 0; r < 3; r++) for (let j = 0; j < 4 - r; j++) g.tube([[-0.6, 0.12 + r * 0.2, -0.45 + j * 0.24 + r * 0.12, 0.1], [0.6, 0.12 + r * 0.2, -0.45 + j * 0.24 + r * 0.12, 0.1]], 6, { capA: true, capB: true }); });
  ctx.smooth(); ctx.albedo(null);
  for (const [px, pz, s, c] of [[1.9, -2.6, 1, "oklch(0.5 0.07 45)"], [2.3, -2.3, 0.7, "oklch(0.42 0.05 50)"], [-1.6, 2.6, 0.8, "oklch(0.48 0.06 40)"]]) { ctx.color(c);
    g.tube([[px, 0, pz, 0.12 * s], [px, 0.18 * s, pz, 0.22 * s], [px, 0.4 * s, pz, 0.18 * s], [px, 0.48 * s, pz, 0.1 * s], [px, 0.52 * s, pz, 0.12 * s]], 8, { capA: true }); }
  // scattered bones and the ring of pale stones, open where the path comes in
  ctx.flat(); ctx.color(BONE);
  if (lod <= 2) for (let j = 0; j < 10; j++) { const a = R() * 6.283, r = 3 + R() * 4; g.at(X([Math.cos(a) * r, 0.03, Math.sin(a) * r], R() * 180), () => bone(g, [-0.15, 0, 0], [0.15, 0, 0], 0.02, 4)); }
  for (const [x, z, sx, sy, k] of STONES(p)) g.at(X([x, 0, z], k * 360, (k - 0.5) * 14, (k - 0.5) * 10), () => mossyRock(g, [0, sy * 0.6, 0], [sx, sy, sx * 0.8], 1, Math.floor(k * 100), { rock: T.rock, moss: T.moss, mossAt: 0.75, rockTint: PALE, mossTint: "oklch(0.85 0.06 125)" }));
}
export function STONES(p = {}) { const R = rng(p.seed ?? 707), n = p.stones ?? 13, rr = p.ringR ?? 9, out = [];
  for (let i = 0; i < n; i++) { const a = Math.PI / 2 + 0.42 + i * (2 * Math.PI - 0.84) / (n - 1), r = rr + (R() - 0.5) * 0.8;
    out.push([Math.cos(a) * r, Math.sin(a) * r * 0.92, 0.32 + R() * 0.12, 0.6 + R() * 0.55, R()]); } return out; }
export function geometry(ctx) { const g = new G(ctx), lod = ctx.lod || 1, p = ctx.params || {}, R = rng(p.seed ?? 707);
  hut(g, ctx, lod, R); yard(g, ctx, lod, R, p); ctx.albedo(null); ctx.color(null); ctx.flat(); }
export function collider(ctx) {
  const p = ctx.params || {}, out = [], [hx, hz] = SPOTS.hut;
  for (let i = 0; i < N; i++) { const a0 = Math.PI / 2 + HUT.door + i * (2 * Math.PI - 2 * HUT.door) / N, a1 = a0 + (2 * Math.PI - 2 * HUT.door) / N, am = (a0 + a1) / 2;
    const x0 = Math.cos(a0) * HUT.rx, z0 = Math.sin(a0) * HUT.rz, x1 = Math.cos(a1) * HUT.rx, z1 = Math.sin(a1) * HUT.rz, L = Math.hypot(x1 - x0, z1 - z0);
    out.push({ kind: "box", width: L + 0.1, height: 2.4, depth: 0.3, center: [hx + (x0 + x1) / 2, 1.0, hz + (z0 + z1) / 2], rotation: { yaw: -Math.atan2(z1 - z0, x1 - x0) * 57.2958 } }); }
  out.push({ kind: "cylinder", radiusTop: 0.6, radiusBottom: 0.7, height: 1.3, center: [SPOTS.fire[0], 0.6, SPOTS.fire[1]] });
  out.push({ kind: "box", width: 0.5, height: 2, depth: 2.8, center: [SPOTS.rack[0], 1, SPOTS.rack[1]], rotation: { yaw: 70 - 90 } });
  out.push({ kind: "box", width: 1.4, height: 1, depth: 1.2, center: [SPOTS.wood[0], 0.5, SPOTS.wood[1]], rotation: { yaw: 30 } });
  for (const [x, z, sx, sy] of STONES(p)) out.push({ kind: "cylinder", radiusTop: sx * 0.7, radiusBottom: sx, height: sy * 1.4, center: [x, sy * 0.5, z] });
  return out;
}
