// A beached wreck, reusable across the coast (concept: art-aur-cove-wrecks).
// part "hull" (default): a keel, stem and sternpost, U-shaped ribs bleached by salt, some
//   missing or snapped where salvagers took them, the bow still planked; heeled over and sunk
//   into the sand. params: len (m, 14), beam (4.2), depth (2.6), roll (deg, 18), sink (0.6),
//   bed (false: no sand bank or weed, for a hull still on its slip), planked (fraction of the hull from the bow still planked, 0.3), picked (0..1, ribs taken, 0.25), seed.
// part "salvage": what the beach-pickers stacked: lashed timber piles, crates, a tally post,
//   a snapped mast lying on the shingle trailing weed, a rusted anchor.
// Local frame: bow toward -Z.
import { G, rng, TEX, mossyRock } from "../lib/geo.js";
const DRIFT = "cdn/texture-driftwood-bleached-grey.png", SAND = "cdn/texture-beach-sand-shingle.png";
const BLEACH = "oklch(0.86 0.015 80)", DARK = "oklch(0.62 0.02 60)", RUST = "oklch(0.6 0.08 45)", WEED = "oklch(0.42 0.06 115)";
function hp(o) { return { len: o.len ?? 14, beam: o.beam ?? 4.2, depth: o.depth ?? 2.6, roll: o.roll ?? 18, sink: o.sink ?? 0.6, planked: o.planked ?? 0.3, picked: o.picked ?? 0.25, seed: o.seed ?? 1, bed: o.bed ?? true }; }
const halfW = (t, B) => (B / 2) * Math.pow(Math.max(0, Math.sin(Math.PI * Math.min(1, 0.06 + t * 0.94))), 0.55) * (t > 0.8 ? 1 - (t - 0.8) * 1.2 : 1);
function rib(P, t, k) { // points of the rib at station t (0 bow .. 1 stern), k = 0..1 of the U, -1..1 across
  const w = halfW(t, P.beam), a = (k * 2 - 1) * Math.PI / 2;
  const sheer = P.depth * (1 + 0.25 * Math.pow(Math.abs(t - 0.45) * 2, 2));
  return [w * Math.sin(a), sheer * (1 - Math.cos(a) * 0.92), -P.len / 2 + t * P.len];
}
function hull(ctx, g, P, lod) {
  const R = rng(1200 + P.seed * 31), rr = P.roll * Math.PI / 180, c = Math.cos(rr), s = Math.sin(rr);
  g.at({ m: [c, -s, 0, s, c, 0, 0, 0, 1], t: [0, -P.sink, 0] }, () => {
    ctx.albedo(DRIFT); ctx.color("oklch(0.97 0.01 80)"); ctx.smooth();
    const seg = lod <= 1 ? 7 : 5;
    // keel, stem and sternpost
    g.tube([[0, 0.05, -P.len / 2 + 0.3, 0.16], [0, 0, 0, 0.18], [0, 0.05, P.len / 2 - 0.4, 0.16]], seg, { capA: true, capB: true });
    const stem = []; for (let i = 0; i <= 8; i++) { const a = i / 8 * Math.PI / 2; stem.push([0, (1 - Math.cos(a)) * 0 + Math.sin(a) * P.depth * 1.45, -P.len / 2 + 0.3 - Math.sin(a) * 0 - (1 - Math.cos(a)) * 1.6, 0.15]); }
    g.tube(stem, seg, { capB: true });
    g.tube([[0, 0, P.len / 2 - 0.4, 0.14], [0, P.depth * 1.25, P.len / 2 + 0.3, 0.13]], seg, { capB: true });
    // ribs
    const n = Math.max(6, Math.round(P.len / 0.85)), steps = lod <= 1 ? 10 : lod <= 2 ? 7 : 5;
    for (let i = 1; i < n; i++) {
      const t = i / n; if (t > P.planked && R() < P.picked) continue;          // taken by the pickers
      const brokeL = R() < 0.25 ? 0.25 + R() * 0.25 : 0, brokeR = R() < 0.25 ? 0.75 - R() * 0.25 : 1;
      const pts = []; for (let k = 0; k <= steps; k++) { const u = k / steps; if (u < brokeL || u > brokeR) continue; const p = rib(P, t, u); pts.push([p[0], p[1], p[2], 0.09 + (1 - Math.abs(u * 2 - 1)) * 0.04]); }
      if (pts.length > 1) g.tube(pts, lod <= 1 ? 6 : 4, { capA: true, capB: true });
    }
    // gunwale stringers where they still hold
    for (const side of [0, 1]) { const pts = []; for (let i = 0; i <= 12; i++) { const t = i / 12 * (side ? 0.55 : 0.9); const p = rib(P, Math.max(0.03, t), side); pts.push([p[0], p[1], p[2], 0.09]); } g.tube(pts, 5, { capA: true, capB: true }); }
    ctx.flat();
    // planking on the bow: strakes between the ribs, darker and weathered
    if (P.planked > 0) {
      ctx.color(DARK); const strakes = lod <= 1 ? 9 : 5, cols = Math.max(2, Math.round(P.planked * (lod <= 1 ? 12 : 6)));
      for (const side of [0, 1]) for (let j = 0; j < strakes; j++) for (let i = 0; i < cols; i++) {
        const t0 = 0.03 + i / cols * P.planked, t1 = 0.03 + (i + 1) / cols * P.planked;
        const k0 = side ? 0.5 + j / strakes * 0.5 : 0.5 - j / strakes * 0.5, k1 = side ? 0.5 + (j + 1) / strakes * 0.5 : 0.5 - (j + 1) / strakes * 0.5;
        if (j === strakes - 1 && R() < 0.4) continue;                           // a sprung top strake
        const a = rib(P, t0, k0), b = rib(P, t1, k0), cc = rib(P, t1, k1), d = rib(P, t0, k1);
        const out = (p) => [p[0] * 1.02, p[1], p[2]];
        if (side) g.quad(out(a), out(b), out(cc), out(d)); else g.quad(out(a), out(d), out(cc), out(b));
        if (side) g.quad(a, d, cc, b); else g.quad(a, b, cc, d);              // inner face
      }
    }
    // weed hanging off the stem
    if (lod <= 2 && P.bed) { ctx.albedo(null); ctx.color(WEED); for (let i = 0; i < 6; i++) { const y = P.depth * (0.6 + R() * 0.8), z = -P.len / 2 - 0.5 - R() * 0.8; g.box((R() - 0.5) * 0.3, y - 0.4, z, 0.06, 0.8 + R() * 0.6, 0.04); } }
  });
  // one long bank of sand drifted along the keel, higher on the low side
  if (lod <= 3 && P.bed) { const lowX = Math.sign(P.roll || 1) * -0.4;
    mossyRock(g, [lowX, 0, 0], [P.beam * 0.62, 0.55, P.len * 0.5], lod <= 1 ? 2 : 1, 40 + P.seed * 13, { rock: SAND, moss: null, rockTint: "oklch(0.97 0.01 85)", amp: 0.18, freq: 1.4, floor: -0.05 });
    if (lod <= 2) for (let i = 0; i < 4; i++) { const k = 0.25 + R() * 0.3; mossyRock(g, [(R() - 0.5) * P.beam * 1.6, 0, (R() - 0.5) * P.len], [k * 1.3, k * 0.6, k], 0, 60 + i + P.seed * 7, { rock: TEX.rock, moss: TEX.moss, mossAt: 0.7, floor: -0.5 }); } }
  ctx.albedo(null); ctx.color(null);
}
function salvage(ctx, g, lod) {
  const R = rng(5150);
  ctx.albedo(TEX.oak);
  // lashed timber piles
  for (const [x, z, yaw, rows] of [[-3, 1.5, 0.1, 4], [-0.2, 3.2, -0.25, 3], [2.8, 1.0, 0.4, 2]]) {
    const c = Math.cos(yaw), s = Math.sin(yaw);
    g.at({ m: [c, 0, s, 0, 1, 0, -s, 0, c], t: [x, 0, z] }, () => {
      ctx.albedo(TEX.oak); ctx.color(DARK);
      for (let r = 0; r < rows; r++) for (let k = 0; k < 4 - (r >> 1); k++) g.box(-0.6 + k * 0.32 + (r % 2) * 0.16, 0.13 + r * 0.25, (R() - 0.5) * 0.3, 0.28, 0.24, 2.6 + R() * 0.6);
      ctx.albedo(TEX.canvas); ctx.color("oklch(0.75 0.05 80)");
      for (const z2 of [-0.8, 0.8]) g.box(-0.6 + 0.5, rows * 0.13, z2, 1.5, rows * 0.25 + 0.04, 0.06);
    });
  }
  // crates
  ctx.albedo(TEX.oak); ctx.color("oklch(0.72 0.03 70)");
  for (const [x, z, sz, yaw] of [[1.5, -1.6, 0.8, 0.3], [2.3, -1.2, 0.6, -0.2], [1.9, -1.4, 0.55, 0.5]]) g.at({ m: [Math.cos(yaw), 0, Math.sin(yaw), 0, 1, 0, -Math.sin(yaw), 0, Math.cos(yaw)], t: [x, x === 1.9 ? 0.8 : 0, z] }, () => g.box(0, sz / 2, 0, sz, sz, sz));
  // the tally post: notches burned in
  ctx.color(DARK); g.box(-4.8, 0.9, -1.2, 0.22, 1.8, 0.22); g.box(-4.8, 1.2, -1.0, 0.7, 0.6, 0.06);
  if (lod <= 2) { ctx.albedo(null); ctx.color("oklch(0.9 0.02 85)"); for (let i = 0; i < 6; i++) g.box(-5.05 + i * 0.09, 1.2, -0.96, 0.025, i === 5 ? 0.02 : 0.4, 0.01); g.box(-4.83, 1.2, -0.96, 0.5, 0.025, 0.01); }
  // the snapped mast, weed hanging off it
  ctx.albedo(DRIFT); ctx.color("oklch(0.97 0.01 80)"); ctx.smooth();
  g.tube([[6, 0.22, -6, 0.22], [-1, 0.2, -3.4, 0.19], [-5.5, 0.18, -1.8, 0.16]], lod <= 1 ? 8 : 5, { capA: true, capB: true }); ctx.flat();
  if (lod <= 2) { ctx.albedo(null); ctx.color(WEED); for (let i = 0; i < 7; i++) { const t = R(); g.box(6 - t * 11.5, 0.22, -6 + t * 4.2, 0.5, 0.05, 0.5); } }
  // a rusted anchor on the shingle
  ctx.albedo(TEX.iron); ctx.color(RUST);
  g.at({ m: [0, -1, 0, 1, 0, 0, 0, 0, 1], t: [-2.6, 0.12, -1.8] }, () => { g.box(0, 0.8, 0, 0.12, 1.6, 0.12); g.box(0, 1.45, 0, 0.1, 0.1, 0.9);
    g.tube(Array.from({ length: 7 }, (_, k) => { const a = -1.1 + k * 0.367; return [Math.sin(a) * 0.6, 0.6 - Math.cos(a) * 0.6, 0, 0.06]; }), 5, { capA: true, capB: true }); });
  // beach stones
  if (lod <= 3) for (let i = 0; i < (lod <= 1 ? 9 : 4); i++) { const k = 0.25 + R() * 0.4; mossyRock(g, [(R() - 0.5) * 12, 0, (R() - 0.5) * 9], [k * 1.2, k * 0.7, k], 0, 700 + i, { rock: TEX.rock, moss: TEX.moss, mossAt: 0.75, floor: -0.5 }); }
  ctx.albedo(null); ctx.color(null);
}
export function geometry(ctx) {
  const g = new G(ctx), lod = ctx.lod || 1, part = ctx.params.part ?? "hull";
  if (part === "salvage") return salvage(ctx, g, lod);
  const P = hp(ctx.params);
  if (lod >= 5) { ctx.color("oklch(0.7 0.015 80)"); g.box(0, P.depth * 0.5 - P.sink, 0, P.beam * 0.8, P.depth, P.len); ctx.color(null); return; }
  hull(ctx, g, P, lod);
}
export function collider(ctx) {
  if ((ctx.params.part ?? "hull") === "salvage") return [
    { kind: "box", width: 1.4, height: 1.0, depth: 3, center: [-3, 0.5, 1.5], rotation: { yaw: 5.7 } },
    { kind: "box", width: 1.4, height: 0.8, depth: 3, center: [-0.2, 0.4, 3.2], rotation: { yaw: -14 } },
    { kind: "box", width: 1.4, height: 0.5, depth: 3, center: [2.8, 0.25, 1.0], rotation: { yaw: 23 } },
    { kind: "box", width: 1.6, height: 1.4, depth: 1.2, center: [1.9, 0.7, -1.4] } ];
  const P = hp(ctx.params);
  return [{ kind: "box", width: P.beam * 0.75, height: Math.max(0.6, P.depth - P.sink), depth: P.len * 0.9, center: [0, (P.depth - P.sink) / 2, 0], rotation: { roll: P.roll } }];
}
