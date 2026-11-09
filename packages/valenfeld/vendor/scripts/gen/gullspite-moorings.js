// Gullspite Moorings (concept: art-gullspite-moorings): where the crews moor who aren't welcome in Corsaire.
// A tarred plank net shed with a turf-patched roof and a smoking stovepipe on the east bank of a salt-marsh tidal channel,
// a rickety plank jetty on leaning piles out to a T-head, a red-sailed lugger and a skiff tied up, nets drying on poles,
// crab pots, a brazier, an upturned rowboat on trestles, a lantern pole, a mooring bollard, a beached hulk rotting in the reeds.
// Local frame: +X east, +Z south. Pad ground at local y=0 (world 0.7); sea level at local y=-0.7. Shed door on the south (+Z) wall.
import { G, rng, TEX } from "../lib/geo.js";
const TAR = "oklch(0.3 0.015 60)", TARL = "oklch(0.38 0.02 60)", PLANK = "oklch(0.55 0.03 70)", PILE = "oklch(0.33 0.03 55)",
  TURF = "oklch(0.48 0.07 130)", IRON = "oklch(0.26 0.01 60)", NET = "oklch(0.5 0.03 80)", SAILR = "oklch(0.48 0.13 32)",
  HULL = "oklch(0.36 0.03 45)", HULLP = "oklch(0.52 0.06 220)", ROPE = "oklch(0.62 0.04 80)", MUD = "oklch(0.42 0.03 70)", REED = "oklch(0.62 0.07 95)";
const SW = 7, SD = 5, SH = 2.6, RP = 1.6, DECK = 0.5, WL = -0.7, JX0 = -5, JX1 = -24, TZ = 7;
const both = (g, a, b, c, d) => { g.quad(a, b, c, d); g.quad(a, d, c, b); };
function pile(g, x, z, top, lean, seg) {
  g.tube([[x + lean, -2.6, z + lean * 0.5, 0.15], [x, top, z, 0.13]], seg, { capB: true });
}
// a clinker boat hull along +X, keel at y, length l, beam b, depth d; open on top; rim at y+d
function hull(g, ctx, x, y, z, l, b, d, yaw, paint, seg) {
  const c = Math.cos(yaw), s = Math.sin(yaw), P = (u, v, w) => [x + u * c - w * s, y + v, z + u * s + w * c];
  const N = seg, M = 5, ring = [];
  for (let i = 0; i <= N; i++) { const t = i / N, u = (t - 0.5) * l, wid = Math.pow(Math.sin(Math.PI * t), 0.6) * b / 2 + 0.02, sh = 0.15 * Math.pow(Math.abs(t - 0.5) * 2, 2) * d;
    const r = []; for (let k = 0; k <= M; k++) { const a = (k / M) * Math.PI, w = -Math.cos(a) * wid, v = sh + d * (1 - Math.pow(Math.sin(a), 1.4)) * 0 + d * (1 - Math.sin(a)) ; r.push(P(u, Math.max(0, v * 1) , w)); } ring.push(r); }
  ctx.albedo(TEX.oak); ctx.color(HULL);
  for (let i = 0; i < N; i++) for (let k = 0; k < M; k++) both(g, ring[i][k], ring[i + 1][k], ring[i + 1][k + 1], ring[i][k + 1]);
  ctx.albedo(null); ctx.color(paint); // a painted strake under the gunwale
  for (const k of [0, M]) for (let i = 0; i < N; i++) { const a = ring[i][k], b2 = ring[i + 1][k]; both(g, a, b2, [b2[0], b2[1] - 0.18, b2[2]], [a[0], a[1] - 0.18, a[2]]); }
  ctx.albedo(TEX.oak); ctx.color(PLANK); // thwarts
  for (const f of [-0.25, 0.05, 0.3]) { const u = f * l; g.at({ m: [c, 0, -s, 0, 1, 0, s, 0, c], t: [x, y, z] }, () => g.box(u, d * 0.72, 0, 0.22, 0.05, b * 0.8)); }
  return P;
}
function pot(g, ctx, x, y, z, lod) {
  ctx.albedo(null); ctx.color("oklch(0.5 0.05 70)");
  g.tube([[x, y, z, 0.28], [x, y + 0.3, z, 0.3], [x, y + 0.42, z, 0.15]], lod <= 2 ? 8 : 6, { capA: true, capB: true });
}
export function geometry(ctx) {
  const g = new G(ctx), lod = ctx.lod || 1, R = rng(2375), seg = lod <= 2 ? 8 : 6;
  if (lod >= 5) { ctx.color(TAR); g.box(0, SH / 2, 0, SW, SH, SD); g.box((JX0 + JX1) / 2, DECK, 0, JX0 - JX1, 0.2, 1.6); ctx.color(null); return; }
  // ---- ground: the trodden mud yard, a slip of planks down to the water
  ctx.albedo(null); ctx.color(MUD); g.box(-1, 0.012, 3.5, 14, 0.02, 7); g.box(-4, 0.014, 0, 3, 0.02, 2.4);
  // ---- net shed: tarred weatherboard on a sill of stones
  ctx.albedo(TEX.fieldstone); ctx.color("oklch(0.6 0.02 90)"); g.box(0, 0.12, 0, SW + 0.3, 0.24, SD + 0.3);
  ctx.albedo(TEX.oak); ctx.color(TAR);
  const DX = 1.2, DW = 1.1, DH = 2;
  g.box(0, 0.24 + SH / 2, -SD / 2 + 0.06, SW, SH, 0.12);
  g.box(-SW / 2 + 0.06, 0.24 + SH / 2, 0, 0.12, SH, SD);
  g.box(SW / 2 - 0.06, 0.24 + SH / 2, 0, 0.12, SH, SD);
  const lw = DX - DW / 2 + SW / 2, rw = SW / 2 - (DX + DW / 2);
  g.box(-SW / 2 + lw / 2, 0.24 + SH / 2, SD / 2 - 0.06, lw, SH, 0.12);
  g.box(SW / 2 - rw / 2, 0.24 + SH / 2, SD / 2 - 0.06, rw, SH, 0.12);
  g.box(DX, 0.24 + DH + (SH - DH) / 2, SD / 2 - 0.06, DW, SH - DH, 0.12);
  ctx.color(TARL); for (let y = 0.5; y < SH; y += 0.32) for (const z of [-1, 1]) g.box(0, 0.24 + y, z * (SD / 2 + 0.005), SW + 0.02, 0.04, 0.03); // weatherboard laps
  // door: ledged and braced, ajar
  ctx.color("oklch(0.4 0.04 50)"); g.at({ m: [Math.cos(0.5), 0, Math.sin(0.5), 0, 1, 0, -Math.sin(0.5), 0, Math.cos(0.5)], t: [DX - DW / 2, 0.24, SD / 2] }, () => { g.box(DW / 2, DH / 2, 0.03, DW, DH, 0.05); ctx.color(PILE); g.box(DW / 2, 0.4, 0.07, DW, 0.12, 0.04); g.box(DW / 2, 1.6, 0.07, DW, 0.12, 0.04); });
  ctx.albedo(null); ctx.color("oklch(0.12 0.01 60)"); g.box(DX, 0.24 + DH / 2, SD / 2 - 0.13, DW - 0.05, DH - 0.05, 0.02);
  // gables and the roof: tarred boards, turf patched where the wind took them
  ctx.albedo(TEX.oak); ctx.color(TAR);
  for (const x of [-SW / 2, SW / 2]) { const y0 = 0.24 + SH; g.tri([x, y0, -SD / 2], [x, y0 + RP, 0], [x, y0, SD / 2]); g.tri([x, y0, -SD / 2], [x, y0, SD / 2], [x, y0 + RP, 0]); }
  const ry = 0.24 + SH, ov = 0.45;
  for (const sz of [-1, 1]) {
    const e = [0, ry + RP + 0.05, 0], o = [0, ry - 0.2, sz * (SD / 2 + ov)];
    ctx.albedo(TEX.oak); ctx.color("oklch(0.27 0.015 60)"); both(g, [-SW / 2 - ov, e[1], 0], [SW / 2 + ov, e[1], 0], [SW / 2 + ov, o[1], o[2]], [-SW / 2 - ov, o[1], o[2]]);
    ctx.albedo(TEX.moss); ctx.color(TURF);
    for (let i = 0; i < (lod <= 2 ? 5 : 2); i++) { const x = -SW / 2 + 0.5 + R() * (SW - 1.4), t = 0.25 + R() * 0.5, w = 0.8 + R() * 1, h = 0.5 + R() * 0.5;
      const yA = e[1] + (o[1] - e[1]) * t + 0.04, zA = o[2] * t, yB = e[1] + (o[1] - e[1]) * Math.min(1, t + h / 2.8) + 0.04, zB = o[2] * Math.min(1, t + h / 2.8);
      g.quad([x, yA, zA], sz > 0 ? [x, yB, zB] : [x + w, yA, zA], [x + w, yB, zB], sz > 0 ? [x + w, yA, zA] : [x, yB, zB]); }
  }
  ctx.albedo(TEX.oak); ctx.color(PILE); g.box(0, ry + RP + 0.08, 0, SW + 2 * ov, 0.1, 0.16);
  // stovepipe, crooked, with a rain hat
  ctx.albedo(TEX.iron); ctx.color(IRON); g.tube([[2.4, ry + 0.9, -0.9, 0.12], [2.45, ry + 1.9, -0.9, 0.12], [2.6, ry + 2.5, -0.85, 0.12]], 8, { capB: false }); g.box(2.6, ry + 2.62, -0.85, 0.4, 0.04, 0.4);
  // shuttered window on the west, a lit chink
  ctx.albedo(null); ctx.color("oklch(0.55 0.1 70)"); ctx.emissive && ctx.emissive("oklch(0.7 0.14 70)"); g.box(-SW / 2 - 0.01, 1.6, 0.6, 0.02, 0.5, 0.06); ctx.emissive && ctx.emissive(null);
  ctx.albedo(TEX.oak); ctx.color("oklch(0.4 0.04 50)"); for (const z of [0.3, 0.9]) g.box(-SW / 2 - 0.05, 1.6, z, 0.05, 0.75, 0.55);
  // ---- the jetty: planks on leaning piles out across the mud to a T-head
  ctx.albedo(TEX.oak); ctx.color(PILE);
  for (let x = JX0; x >= JX1; x -= 2.5) for (const z of [-0.9, 0.9]) pile(g, x, z, DECK + 0.25, (R() - 0.5) * 0.4, seg);
  for (let z = -TZ; z <= TZ; z += 2.3) for (const x of [JX1 - 1.1, JX1 + 1.1]) pile(g, x, z, DECK + (Math.abs(z) > TZ - 1 ? 0.9 : 0.25), (R() - 0.5) * 0.4, seg);
  ctx.color(PLANK);
  for (let x = JX0 + 0.5; x > JX1 + 1.2; x -= 0.32) { if (R() < 0.06) continue; g.box(x, DECK + (R() - 0.5) * 0.04, (R() - 0.5) * 0.08, 0.28, 0.06, 1.9 + R() * 0.15); }
  for (let z = -TZ - 0.4; z <= TZ + 0.4; z += 0.32) { if (R() < 0.05) continue; g.box(JX1, DECK + (R() - 0.5) * 0.04, z, 2.6 + R() * 0.15, 0.06, 0.28); }
  ctx.color(PILE); g.box((JX0 + JX1) / 2, DECK - 0.12, -0.9, JX0 - JX1, 0.14, 0.14); g.box((JX0 + JX1) / 2, DECK - 0.12, 0.9, JX0 - JX1, 0.14, 0.14);
  // the slip down from the yard to the deck
  ctx.color(PLANK); for (let x = -3.6; x > JX0 + 0.4; x -= 0.3) g.box(x, 0.06 + (-3.6 - x) * 0.3, 0, 0.26, 0.06, 1.8);
  // bollard and rope coils on the T-head
  ctx.color(PILE); g.tube([[JX1 + 0.6, DECK, 3, 0.18], [JX1 + 0.6, DECK + 0.6, 3, 0.18], [JX1 + 0.6, DECK + 0.7, 3, 0.22]], seg, { capB: true });
  ctx.albedo(null); ctx.color(ROPE); for (let i = 0; i < 3; i++) g.tube([[JX1 + 0.3, DECK + 0.05 + i * 0.05, -2, 0.3 - i * 0.04]].concat([...Array(9)].map((_, k) => { const a = k / 8 * 6.283; return [JX1 + 0.3 + Math.cos(a) * (0.3 - i * 0.04), DECK + 0.06 + i * 0.05, -2 + Math.sin(a) * (0.3 - i * 0.04), 0.035]; })).slice(1), 5);
  // ---- the lugger, red sail half-brailed, tied off the T-head's west face
  const lp = hull(g, ctx, JX1 - 3.4, WL - 0.6, -2, 8, 2.6, 1.6, 0.06, SAILR, lod <= 2 ? 12 : 8);
  ctx.albedo(TEX.oak); ctx.color(PILE); g.tube([[JX1 - 3.2, WL + 0.4, -2.6, 0.1], [JX1 - 3.15, WL + 7, -2.6, 0.07]], 6, { capB: true });
  ctx.albedo(TEX.canvas); ctx.color(SAILR);
  both(g, [JX1 - 3.15, WL + 6.6, -2.6], [JX1 - 3.3, WL + 2.6, -2.6], [JX1 - 6.3, WL + 2.2, -2.2], [JX1 - 5.6, WL + 5.6, -2.3]);
  ctx.albedo(null); ctx.color(ROPE); g.tube([[JX1 - 0.4, WL + 1.0, -4.4, 0.03], [JX1 - 0.9, DECK + 0.3, -4.4, 0.03], [JX1 + 0, DECK + 0.6, -4.6, 0.03]], 4);
  // ---- the skiff on the south side, a pair of oars inboard
  hull(g, ctx, JX1 - 2.2, WL - 0.25, 5, 4.2, 1.4, 0.6, -0.1, HULLP, lod <= 2 ? 10 : 7);
  ctx.albedo(TEX.oak); ctx.color(PLANK); g.box(JX1 - 2.3, WL + 0.3, 4.9, 3.2, 0.05, 0.1); g.box(JX1 - 2.1, WL + 0.32, 5.15, 3.0, 0.05, 0.1);
  // ---- nets drying on poles, west of the shed
  ctx.albedo(TEX.oak); ctx.color(PILE);
  const NP = [[-4.5, -4.5], [-1.5, -4.8], [1.5, -4.5]];
  for (const [x, z] of NP) g.tube([[x, 0, z, 0.07], [x, 2.3, z, 0.06]], 6, { capB: true });
  ctx.albedo(TEX.canvas); ctx.color(NET);
  for (let i = 0; i < NP.length - 1; i++) { const [ax, az] = NP[i], [bx, bz] = NP[i + 1], k = lod <= 2 ? 6 : 3;
    for (let j = 0; j < k; j++) { const t0 = j / k, t1 = (j + 1) / k, s0 = Math.sin(Math.PI * t0) * 0.35, s1 = Math.sin(Math.PI * t1) * 0.35;
      both(g, [ax + (bx - ax) * t0, 2.2 - s0, az + (bz - az) * t0], [ax + (bx - ax) * t1, 2.2 - s1, az + (bz - az) * t1], [ax + (bx - ax) * t1, 0.7 - s1 * 0.4, az + (bz - az) * t1 + 0.05], [ax + (bx - ax) * t0, 0.7 - s0 * 0.4, az + (bz - az) * t0 + 0.05]); } }
  // ---- crab pots stacked by the door, a pile on the jetty
  for (const [x, z, y] of [[3.2, 3.4, 0], [3.8, 3.2, 0], [3.5, 3.3, 0.42], [-6.5, 0.4, DECK + 0.03], [-7.1, 0.5, DECK + 0.03]]) pot(g, ctx, x, y, z, lod);
  // ---- brazier in the yard, the crews' fire
  ctx.albedo(TEX.iron); ctx.color(IRON); g.tube([[-1.6, 0.6, 4.2, 0.35], [-1.6, 0.9, 4.2, 0.42]], 8, { capA: true });
  for (let i = 0; i < 3; i++) { const a = i * 2.09; g.tube([[-1.6 + Math.cos(a) * 0.38, 0, 4.2 + Math.sin(a) * 0.38, 0.03], [-1.6 + Math.cos(a) * 0.3, 0.62, 4.2 + Math.sin(a) * 0.3, 0.03]], 4); }
  ctx.albedo(TEX.oak); ctx.color(PILE); for (const [x, z, r] of [[-3.2, 4, 0.2], [-0.2, 5.4, -0.6], [-2.4, 5.9, 0.9]]) g.at({ m: [Math.cos(r), 0, Math.sin(r), 0, 1, 0, -Math.sin(r), 0, Math.cos(r)], t: [x, 0, z] }, () => g.box(0, 0.22, 0, 1.4, 0.36, 0.35)); // log seats
  // ---- upturned rowboat on trestles, east of the shed
  ctx.albedo(TEX.oak); ctx.color(PILE); for (const x of [5.4, 7.8]) { g.box(x, 0.4, 2.5, 0.08, 0.8, 1.2); g.box(x, 0.8, 2.5, 0.12, 0.08, 1.4); }
  { const c = 1, Q = []; const N = 8, l = 3.6, b = 1.3; const P = (u, w, v) => [6.6 + u, 0.84 + 0.55 - v, 2.5 + w];
    ctx.albedo(TEX.oak); ctx.color(HULL);
    for (let i = 0; i < N; i++) for (let k = 0; k < 4; k++) { const f = (t, kk) => { const u = (t - 0.5) * l, wid = Math.pow(Math.sin(Math.PI * t), 0.6) * b / 2 + 0.02, a = kk / 4 * Math.PI; return P(u, -Math.cos(a) * wid, 0.55 * (1 - Math.sin(a))); };
      both(g, f(i / N, k), f((i + 1) / N, k), f((i + 1) / N, k + 1), f(i / N, k + 1)); } }
  // ---- lantern pole at the jetty foot
  ctx.albedo(TEX.oak); ctx.color(PILE); g.tube([[-4.6, 0, -1.4, 0.08], [-4.6, 3.2, -1.4, 0.07]], 6, { capB: true }); g.box(-4.3, 3.1, -1.4, 0.7, 0.07, 0.07);
  ctx.albedo(TEX.iron); ctx.color(IRON); g.box(-4.05, 2.75, -1.4, 0.22, 0.32, 0.22);
  ctx.albedo(null); ctx.color("oklch(0.9 0.12 80)"); ctx.emissive && ctx.emissive("oklch(0.85 0.16 75)"); g.box(-4.05, 2.75, -1.4, 0.16, 0.24, 0.16); ctx.emissive && ctx.emissive(null);
  // ---- the hulk: a beached half-hull rotting in the reeds to the north, ribs showing
  if (lod <= 3) { ctx.albedo(TEX.oak); ctx.color("oklch(0.3 0.02 50)");
    for (let i = 0; i < 9; i++) { const x = -12 + i * 0.9, h = 1.4 + Math.sin(i * 0.7) * 0.4 - (i > 6 ? 0.6 : 0);
      for (const sz of [-1, 1]) g.tube([[x, -0.6, -11, 0.08], [x, 0.2, -11 + sz * 1.3, 0.07], [x, h, -11 + sz * 1.5, 0.06]], 5); }
    g.tube([[-12.5, -0.3, -11, 0.14], [-4, -0.3, -11, 0.14]], 6);
    ctx.color(HULL); for (let i = 0; i < 4; i++) g.box(-10 + i * 0.5, 0.1 + i * 0.12, -12.3, 4 - i * 0.6, 0.18, 0.06); }
  // ---- reeds along the bank
  if (lod <= 3) { ctx.albedo(null); ctx.color(REED);
    for (let i = 0; i < (lod <= 2 ? 70 : 28); i++) { const z = -10 + R() * 22, x = JX0 - 1.5 - R() * 4 + (Math.abs(z) < 1.5 ? -6 : 0), h = 0.9 + R() * 1.1, lx = (R() - 0.5) * 0.4;
      bothT0(g, x, z, h, lx); } }
  ctx.albedo(null); ctx.color(null); ctx.emissive && ctx.emissive(null);
}
function bothT0(g, x, z, h, lx) { g.tri([x - 0.04, -0.3, z], [x + 0.04, -0.3, z], [x + lx, h, z]); g.tri([x - 0.04, -0.3, z], [x + lx, h, z], [x + 0.04, -0.3, z]); }
export function collider() {
  const L = JX0 - JX1;
  return [
    { kind: "box", width: SW + 0.3, height: SH + 0.24, depth: 0.3, center: [0, (SH + 0.24) / 2, -SD / 2] },
    { kind: "box", width: 0.3, height: SH + 0.24, depth: SD, center: [-SW / 2, (SH + 0.24) / 2, 0] },
    { kind: "box", width: 0.3, height: SH + 0.24, depth: SD, center: [SW / 2, (SH + 0.24) / 2, 0] },
    { kind: "box", width: 2.3, height: SH + 0.24, depth: 0.3, center: [-SW / 2 + 1.15, (SH + 0.24) / 2, SD / 2] },
    { kind: "box", width: 3.6, height: SH + 0.24, depth: 0.3, center: [SW / 2 - 1.8, (SH + 0.24) / 2, SD / 2] },
    { kind: "box", width: SW + 0.6, height: RP + 0.4, depth: SD + 0.6, center: [0, SH + 0.24 + RP / 2, 0] },
    { kind: "box", width: L, height: 0.2, depth: 2, center: [(JX0 + JX1) / 2, DECK - 0.07, 0] },
    { kind: "box", width: 2.7, height: 0.2, depth: 2 * TZ + 1, center: [JX1, DECK - 0.07, 0] },
    { kind: "box", width: 1.6, height: 0.2, depth: 2, center: [-4.3, 0.25, 0] },
    { kind: "box", width: 8, height: 1.2, depth: 2.6, center: [JX1 - 3.4, WL + 0.2, -2] },
    { kind: "box", width: 3.4, height: 1, depth: 1.4, center: [6.6, 0.7, 2.5] },
  ];
}
