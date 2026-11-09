// Lantern Rock (concept: art-lantern-rock): a tier 2 wreckers' light on the tidal flats south of Aurenmar, "a light the
// wreckers dim on stormy nights". A black sea rock with a flagged top, a squat tarred-stone tower with an iron fire-basket,
// a plank shutter on a swinging arm and chain that blinds the light, a driftwood lean-to hut (its door the way in), a causeway
// of slick stepping stones down to the shingle (+Z), and on the shingle: a drawn-up rowing boat, salvaged barrels and a crate
// under a tarp, a grapnel, rope coils; a wrecked mast and ribs in the shallows. Local: +X east, +Z south (shore). Ground y=0.
import { G, rng, TEX, mossyRock } from "../lib/geo.js";
const TAR = "oklch(0.36 0.012 70)", DRIFT = "oklch(0.55 0.03 70)", IRON = "oklch(0.24 0.01 60)", RUST = "oklch(0.42 0.08 45)",
  ROPE = "oklch(0.62 0.04 80)", TARP = "oklch(0.45 0.05 120)", KELP = "oklch(0.45 0.08 105)", SHINGLE = "oklch(0.52 0.01 80)";
export const TOP = 4.6, TX = -1, TZ = -1, HX = 2.4, HZ = 1.4;
const yawM = (a) => ({ m: [Math.cos(a), 0, Math.sin(a), 0, 1, 0, -Math.sin(a), 0, Math.cos(a)], t: [0, 0, 0] });
function boat(g, ctx, x, z, yaw) {
  g.at({ ...yawM(yaw), t: [x, 0, z] }, () => {
    ctx.albedo(TEX.oak); ctx.color("oklch(0.42 0.04 55)");
    const L = 4.4, B = 0.75, H = 0.6, n = 8;
    for (let i = 0; i < n; i++) { const t0 = i / n, t1 = (i + 1) / n, w = (t) => B * Math.sin(Math.PI * (0.08 + 0.84 * t)), z0 = -L / 2 + t0 * L, z1 = -L / 2 + t1 * L;
      for (const s of [-1, 1]) { const a = [s * w(t0), H + 0.12, z0], b = [s * w(t1), H + 0.12, z1], c = [s * w(t1) * 0.4, 0.05, z1], d = [s * w(t0) * 0.4, 0.05, z0];
        g.quad(a, b, c, d); g.quad(a, d, c, b); } }
    g.box(0, 0.06, 0, 0.5, 0.06, L * 0.85); g.box(0, H * 0.7, 0.3, B * 1.6, 0.06, 0.3); g.box(0, H * 0.7, -0.8, B * 1.5, 0.06, 0.3);
    ctx.color(DRIFT); g.box(0.4, H + 0.15, 0.6, 0.06, 0.06, 2.6);
  });
}
function barrel(g, ctx, x, y, z, side) {
  ctx.albedo(TEX.oak); ctx.color("oklch(0.45 0.05 60)");
  const p = side ? [[x - 0.4, y + 0.3, z, 0.26], [x, y + 0.3, z, 0.31], [x + 0.4, y + 0.3, z, 0.26]] : [[x, y, z, 0.26], [x, y + 0.4, z, 0.31], [x, y + 0.8, z, 0.26]];
  g.tube(p, 9, { capA: true, capB: true }); ctx.albedo(TEX.iron); ctx.color(IRON);
  const h = side ? [[x - 0.25, y + 0.3, z, 0.3], [x - 0.22, y + 0.3, z, 0.3]] : [[x, y + 0.2, z, 0.3], [x, y + 0.23, z, 0.3]]; g.tube(h, 9);
}
export function geometry(ctx) {
  const g = new G(ctx), lod = ctx.lod || 1, R = rng(3489), seg = lod <= 2 ? 12 : 8;
  if (lod >= 5) { ctx.color("oklch(0.45 0.01 80)"); g.box(0, TOP / 2, 0, 11, TOP, 10); ctx.color(TAR); g.box(TX, TOP + 4.5, TZ, 4, 9, 4); ctx.color(null); return; }
  // ---- the rock: a big lichen-black mass, the flagged cap, outlying boulders and kelp
  mossyRock(g, [0, 0.6, 0], [7.5, 4.6, 6.6], lod <= 2 ? 3 : 2, 11, { rock: TEX.rock, moss: TEX.moss, mossAt: 0.75, amp: 0.22, floor: -0.2, rockTint: "oklch(0.55 0.01 80)", mossTint: "oklch(0.7 0.06 120)" });
  if (lod <= 3) for (let i = 0; i < 9; i++) { const a = R() * 6.283, d = 6.5 + R() * 4; mossyRock(g, [Math.cos(a) * d, 0.2, Math.sin(a) * d * 0.9 - 1], [0.8 + R() * 1.4, 0.6 + R() * 0.9, 0.8 + R() * 1.2], 1, 20 + i, { rock: TEX.rock, moss: TEX.moss, mossAt: 0.6, rockTint: "oklch(0.5 0.01 80)", mossTint: "oklch(0.6 0.09 105)" }); }
  ctx.albedo(TEX.flag); ctx.color("oklch(0.5 0.01 80)"); g.box(0, TOP - 0.2, 0, 9.2, 0.4, 8.6);
  // ---- the tower: tapered tarred stone, a door slot, two arrow-slit windows, a corbel ring, the fire basket
  ctx.albedo(TEX.fieldstone); ctx.color(TAR); g.tube([[TX, TOP - 0.1, TZ, 2.5], [TX, TOP + 3, TZ, 2.25], [TX, TOP + 8.4, TZ, 1.85]], seg, { capB: true });
  ctx.color("oklch(0.3 0.01 70)"); g.tube([[TX, TOP + 8.3, TZ, 2.15], [TX, TOP + 8.75, TZ, 2.15]], seg, { capA: true, capB: true });
  ctx.albedo(null); ctx.color("oklch(0.1 0.01 60)");
  g.box(TX, TOP + 1.1, TZ + 2.42, 0.9, 2.0, 0.12); g.box(TX + 1.6, TOP + 4.6, TZ + 1.45, 0.2, 0.8, 0.12); g.box(TX - 2.0, TOP + 6.2, TZ - 0.2, 0.12, 0.8, 0.2);
  ctx.albedo(TEX.oak); ctx.color("oklch(0.32 0.03 50)"); g.box(TX, TOP + 1.1, TZ + 2.48, 0.85, 1.95, 0.06);
  // the iron basket: ring bands and uprights, coals inside
  ctx.albedo(TEX.iron); ctx.color(IRON); const BY = TOP + 8.75, br = 1.15, nb = lod <= 2 ? 14 : 8;
  for (const y of [BY + 0.05, BY + 0.7, BY + 1.4]) { const pts = []; for (let k = 0; k <= 16; k++) { const a = k / 16 * 6.283, r = br + (y - BY) * 0.18; pts.push([TX + Math.cos(a) * r, y, TZ + Math.sin(a) * r, 0.05]); } g.tube(pts, 5); }
  for (let k = 0; k < nb; k++) { const a = k / nb * 6.283; g.box(TX + Math.cos(a) * (br + 0.12), BY + 0.72, TZ + Math.sin(a) * (br + 0.12), 0.07, 1.45, 0.07); }
  ctx.albedo(null); ctx.color("oklch(0.35 0.1 40)"); ctx.emissive && ctx.emissive("oklch(0.55 0.18 45)"); g.tris(g.blob([TX, BY + 0.35, TZ], [0.95, 0.35, 0.95], 1, 0.3, 2, 3)); ctx.emissive && ctx.emissive(null);
  // the shutter: a post up the tower's seaward side, a swinging arm, a plank board on a chain
  ctx.albedo(TEX.oak); ctx.color(DRIFT); const PX = TX + 2.0, PZ = TZ - 1.2;
  g.box(PX, TOP + 5.6, PZ, 0.22, 11.2, 0.22); g.box(PX - 0.6, TOP + 11.0, PZ, 2.2, 0.18, 0.18);
  ctx.color("oklch(0.4 0.03 55)"); g.box(PX - 1.5, TOP + 9.2, PZ - 0.3, 0.08, 1.9, 1.6);
  ctx.color(DRIFT); for (const y of [TOP + 8.6, TOP + 9.8]) g.box(PX - 1.45, y, PZ - 0.3, 0.06, 0.12, 1.65);
  ctx.albedo(TEX.iron); ctx.color(IRON); g.box(PX - 1.5, TOP + 10.6, PZ - 0.3, 0.04, 0.85, 0.04); g.box(PX - 0.2, TOP + 7, PZ, 0.04, 8, 0.04);
  // ---- the driftwood lean-to hut against the tower
  ctx.albedo(TEX.oak); ctx.color(DRIFT); const hw = 2.6, hd = 2.6, hh = 2.3;
  g.box(HX + hw / 2, hh / 2, HZ, 0.15, hh, hd); g.box(HX - 0.15, hh / 2 + 0.2, HZ - hd / 2 + 0.08, hw - 0.3, hh + 0.4, 0.15);
  g.at({ m: [1, 0, 0, 0, 1, 0, 0, 0, 1], t: [0, TOP, 0] }, () => {
    g.box(HX + hw / 2, hh / 2, HZ, 0.15, hh, hd); g.box(HX, hh / 2 + 0.3, HZ - hd / 2, hw, hh + 0.6, 0.15);
    for (let i = 0; i < 6; i++) g.box(HX - hw / 2 + 0.25 + i * 0.44, hh / 2, HZ + hd / 2, 0.38, hh - (i < 3 && i > 0 ? 0 : 0), 0.1);
    ctx.color("oklch(0.47 0.03 60)"); for (let i = 0; i < 7; i++) g.at({ m: [1, 0, 0, 0, 0.96, 0.28, 0, -0.28, 0.96], t: [HX, hh + 0.45, HZ] }, () => g.box(-hw / 2 - 0.2 + i * 0.47, 0, 0, 0.44, 0.07, hd + 0.6));
    ctx.albedo(null); ctx.color("oklch(0.12 0.01 60)"); g.box(HX + 0.1, 0.95, HZ + hd / 2 + 0.06, 0.85, 1.9, 0.04);
    ctx.albedo(TEX.oak); ctx.color("oklch(0.35 0.03 50)"); g.box(HX + 0.1, 0.95, HZ + hd / 2 + 0.09, 0.8, 1.85, 0.05);
    ctx.albedo(TEX.canvas); ctx.color(TARP); g.quad([HX + hw / 2 + 0.1, hh + 0.2, HZ - hd / 2], [HX + hw / 2 + 0.1, hh + 0.2, HZ + hd / 2], [HX + hw / 2 + 0.6, 0.3, HZ + hd / 2 + 0.3], [HX + hw / 2 + 0.6, 0.3, HZ - hd / 2]);
    barrel(g, ctx, HX - 1.2, 0, HZ + hd / 2 + 0.6, false);
    ctx.albedo(TEX.oak); ctx.color(DRIFT); for (let i = 0; i < 5; i++) g.box(-3.4 + R() * 0.3, 0.12 + i * 0.16, 2.6 + (i % 2) * 0.12, 0.13, 0.13, 1.6 + R());
  });
  // ---- causeway: slick stepping stones from the shingle up to the cap (+Z)
  for (let i = 0; i < 12; i++) { const z = 15.6 - i * 0.92, y = Math.min(TOP - 0.05, 0.25 + i * 0.4);
    ctx.albedo(TEX.rock); ctx.color(i < 5 ? "oklch(0.42 0.03 110)" : "oklch(0.5 0.01 80)"); g.box((R() - 0.5) * 0.3, y / 2, z, 2.2 + R() * 0.4, y, 1.0); }
  // ---- the shingle: a bank of pebbles, kelp windrows, the boat, salvage under a tarp, grapnel, rope
  ctx.albedo(TEX.rock); ctx.color(SHINGLE); g.box(2, 0.06, 21, 22, 0.12, 9);
  ctx.albedo(null); ctx.color(KELP); for (let i = 0; i < (lod <= 2 ? 40 : 14); i++) g.box(-9 + R() * 22, 0.14, 16.8 + R() * 1.2, 0.5 + R() * 0.8, 0.04, 0.12);
  boat(g, ctx, 6.5, 19.5, 0.35);
  for (const [x, z] of [[9.6, 22.3], [10.3, 21.4]]) barrel(g, ctx, x, 0.1, z, false); barrel(g, ctx, 9.2, 0.1, 23.2, true);
  ctx.albedo(TEX.oak); ctx.color("oklch(0.4 0.04 60)"); g.box(11.6, 0.55, 22.5, 1.4, 0.9, 1.1);
  ctx.albedo(TEX.canvas); ctx.color(TARP); g.quad([9, 1.2, 21], [12.4, 1.3, 21.4], [12.6, 0.15, 23.6], [8.8, 0.15, 23.3]); g.quad([9, 1.2, 21], [8.8, 0.15, 23.3], [12.6, 0.15, 23.6], [12.4, 1.3, 21.4]);
  ctx.albedo(TEX.iron); ctx.color(RUST); g.at({ ...yawM(0.6), t: [3.6, 0.15, 22.4] }, () => { g.tube([[0, 0, -0.8, 0.06], [0, 0, 0.5, 0.06]], 6);
    for (let k = 0; k < 4; k++) { const a = k * 1.571; g.tube([[0, 0, 0.5, 0.05], [Math.cos(a) * 0.35, Math.sin(a) * 0.15 + 0.1, 0.75, 0.05], [Math.cos(a) * 0.5, 0.2, 0.55, 0.045]], 5); } });
  ctx.albedo(null); ctx.color(ROPE); for (const [cx, cz] of [[5, 23.5], [2.2, 22.8]]) for (let i = 0; i < 3; i++) { const r = 0.6 - i * 0.14, pts = [];
    for (let k = 0; k <= 12; k++) { const a = k / 12 * 6.283; pts.push([cx + Math.cos(a) * r, 0.18 + i * 0.1, cz + Math.sin(a) * r, 0.05]); } g.tube(pts, 5); }
  g.tube([[4.4, 0.2, 23.2], [3.9, 0.15, 22.8], [3.6, 0.15, 22.0]].map((p) => [...p, 0.04]), 4);
  // ---- the wreck in the shallows: a broken mast leaning out of black ribs
  ctx.albedo(TEX.log); ctx.color("oklch(0.35 0.02 60)"); g.tube([[-13, 0, 3, 0.3], [-10.6, 6.5, 0.8, 0.22]], 8, { capB: true });
  g.box(-11.3, 4.8, 1.4, 2.6, 0.14, 0.14);
  for (let i = 0; i < 6; i++) { const z = -1 + i * 1.3; g.tube([[-15.5, 0, z, 0.16], [-15.2, 1.3 + R() * 0.6, z + 0.1, 0.12], [-14.4, 2 + R(), z, 0.09]], 6, { capB: true });
    g.tube([[-11, 0, z, 0.16], [-11.3, 1.2 + R() * 0.6, z + 0.1, 0.12], [-12, 1.8 + R(), z, 0.09]], 6, { capB: true }); }
  ctx.albedo(null); ctx.color(null); ctx.emissive && ctx.emissive(null);
}
export function collider() {
  const out = [
    { kind: "box", width: 9.2, height: TOP, depth: 8.6, center: [0, TOP / 2, 0] },
    { kind: "cylinder", radiusTop: 1.9, radiusBottom: 2.5, height: 9, center: [TX, TOP + 4.5, TZ] },
    { kind: "box", width: 2.6, height: 2.6, depth: 2.6, center: [HX, TOP + 1.3, HZ] },
    { kind: "box", width: 3, height: 1.2, depth: 2.4, center: [10.6, 0.6, 22.3] },
    { kind: "box", width: 1.6, height: 0.9, depth: 4.4, center: [6.5, 0.45, 19.5] },
  ];
  for (let i = 0; i < 12; i++) { const y = Math.min(TOP - 0.05, 0.25 + i * 0.4); out.push({ kind: "box", width: 2.2, height: y, depth: 1.0, center: [0, y / 2, 15.6 - i * 0.92] }); }
  return out;
}
