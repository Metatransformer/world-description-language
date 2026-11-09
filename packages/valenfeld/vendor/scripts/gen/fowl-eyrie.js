// The Drowned Fowling (wildfowlers, tier 5) and the Teeth Eyrie (gull-egg-gatherers, tier 6): one script, params.part picks.
//  punt: a flat-bottomed fowler's punt, tarred planks, a pole, a duck-gun and a dead decoy; params.sunk tips it half under.
//  smokehouse: the fowlers' fish-and-fowl smoke-house on stilts, door hanging off one hinge, racks of blackened ducks.
//  rack: a drying frame of split reed poles with ducks and nets hung on it.
//  ladder: a tarred rope-ladder pinned to the rock with iron, a plank ledge at its head (the egg-climbers' old work).
//  lookout: the corsairs' plank lookout platform on posts, a rail, a spyglass stand and a lashed water barrel.
//  tent: a sailcloth tent stitched from a stolen Aurenmar sail (the gilded trident still on it).
//  fire: the signal-fire cage of iron on a stone ring, tar-black logs stacked inside.
// Frame: -Z forward, origin at the feet; posts run 1.6 m below the feet so sloped ground never shows a gap.
import { G, X, rng, TEX } from "../lib/geo.js";
const TAR = "oklch(0.32 0.02 60)", ROPE = "oklch(0.78 0.05 80)", REED = "oklch(0.8 0.07 90)", SOOT = "oklch(0.25 0.01 50)", SAIL = "oklch(0.93 0.02 85)";
function post(g, ctx, x, z, top, r = 0.09) { ctx.smooth(); ctx.albedo(TEX.log); ctx.color("oklch(0.8 0.02 60)"); g.tube([[x, -1.6, z, r * 1.1], [x, top, z, r]], 6, { capB: true }); }
function planks(g, ctx, w, d, y, n, tint = "oklch(0.86 0.03 65)") {   // a deck of n planks along x, gaps between
  ctx.flat(); ctx.albedo(TEX.oak); ctx.color(tint);
  const pw = d / n; for (let i = 0; i < n; i++) g.box(0, y, -d / 2 + pw * (i + 0.5), w + (i % 2) * 0.08, 0.06, pw - 0.025);
}
function duck(g, ctx, x, y, z, k) {   // a hung duck: body, neck down, a dark head
  ctx.smooth(); ctx.albedo(null); ctx.color(k % 2 ? "oklch(0.42 0.04 60)" : "oklch(0.36 0.05 150)");
  g.tris(g.blob([x, y, z], [0.12, 0.2, 0.1], 1, 0.08, 1, k, null));
  ctx.color("oklch(0.3 0.02 60)"); g.tube([[x, y - 0.18, z, 0.03], [x, y - 0.34, z + 0.02, 0.025]], 5, { capB: true });
  ctx.color(ROPE); g.tube([[x, y + 0.18, z, 0.008], [x, y + 0.34, z, 0.008]], 3);
}
function punt(g, ctx, lod) {
  const sunk = ctx.params.sunk ? 1 : 0;
  g.at(X([0, sunk ? -0.25 : 0.05, 0], 0, 0, sunk ? 14 : 0), () => {
    ctx.flat(); ctx.albedo(TEX.oak); ctx.color("oklch(0.62 0.03 55)");
    g.box(0, 0.06, 0, 1.2, 0.08, 4.6);                                  // the flat bottom
    for (const s of [-1, 1]) g.at(X([s * 0.62, 0.26, 0], 0, 0, s * 8), () => g.box(0, 0, 0, 0.06, 0.36, 4.6));   // the sides, flared
    for (const z of [-2.3, 2.3]) g.at(X([0, 0.22, z], 0, z < 0 ? 22 : -22, 0), () => g.box(0, 0, 0, 1.24, 0.3, 0.06));   // the raked ends
    for (const z of [-1.2, 0.2, 1.4]) g.box(0, 0.36, z, 1.2, 0.05, 0.26);   // the thwarts
    ctx.color(TAR); g.box(0, 0.12, 0, 1.22, 0.02, 4.62);                // tar line at the waterline
    ctx.smooth(); ctx.albedo(TEX.log); ctx.color("oklch(0.85 0.03 70)");
    g.tube([[-0.3, 0.42, -2.0, 0.03], [0.35, 0.44, 2.6, 0.028]], 5, { capA: true, capB: true });   // the pole, lying along
    if (lod <= 2) {                                                     // the long duck-gun and a decoy
      ctx.albedo(TEX.iron); ctx.color("oklch(0.6 0.01 240)"); g.tube([[0.25, 0.44, -1.6, 0.025], [0.25, 0.46, 0.6, 0.022]], 6, { capA: true, capB: true });
      ctx.albedo(TEX.oak); ctx.color("oklch(0.7 0.04 60)"); g.box(0.25, 0.44, 0.8, 0.07, 0.09, 0.4);
      duck(g, ctx, -0.3, 0.52, 0.9, 3);
    }
  });
}
function smokehouse(g, ctx, lod) {
  const W = 3.6, D = 3.0, F = 1.1, H = 2.4;                           // floor 1.1 m up on stilts, walls 2.4
  for (const x of [-W / 2, W / 2]) for (const z of [-D / 2, D / 2]) post(g, ctx, x, z, F, 0.11);
  planks(g, ctx, W + 0.3, D + 0.3, F, 10);
  ctx.flat(); ctx.albedo(TEX.oak); ctx.color("oklch(0.55 0.02 50)");   // soot-dark board walls, a door gap on -z
  for (let i = 0; i < 9; i++) { const x = -W / 2 + (i + 0.5) * W / 9; g.box(x, F + H / 2, D / 2, W / 9 - 0.02, H, 0.05); }
  for (let i = 0; i < 8; i++) { const z = -D / 2 + (i + 0.5) * D / 8; for (const s of [-1, 1]) g.box(s * W / 2, F + H / 2, z, 0.05, H - (i % 3) * 0.06, D / 8 - 0.02); }
  for (const x of [-W / 2 + 0.6, W / 2 - 0.6]) g.box(x, F + H / 2, -D / 2, 1.1, H, 0.05);
  g.box(0, F + H - 0.2, -D / 2, 1.3, 0.4, 0.05);                       // lintel over the door gap
  g.at(X([0.62, F + 1.05, -D / 2 - 0.45], 0, -58, 0), () => g.box(-0.5, 0, 0, 1.0, 2.0, 0.05));   // the door, hanging off its top hinge
  ctx.albedo(TEX.slate); ctx.color("oklch(0.72 0.02 80)");             // a reed-thatch roof gone grey, a gap where the smoke came out
  for (const s of [-1, 1]) g.at(X([s * W / 4 * 1.15, F + H + 0.55, 0], 0, 0, -s * 32), () => g.box(0, 0, 0, W / 2 * 1.25, 0.12, D + 0.6));
  ctx.color(SOOT); ctx.albedo(null); g.box(0, F + H + 1.05, 0, 0.5, 0.08, 0.8);
  if (lod <= 2) for (let i = 0; i < 6; i++) duck(g, ctx, -1.2 + i * 0.48, F + 1.6, 0.4, i);   // blackened ducks still on the rack inside
  ctx.flat(); ctx.albedo(TEX.oak); ctx.color("oklch(0.8 0.03 60)");   // the steps up to the door
  for (let i = 0; i < 4; i++) g.box(0, F - 0.25 - i * 0.27, -D / 2 - 0.35 - i * 0.28, 1.0, 0.06, 0.3);
  for (const s of [-1, 1]) g.at(X([s * 0.5, F / 2 - 0.3, -D / 2 - 0.8], 0, 44, 0), () => g.box(0, 0, 0, 0.06, 0.12, 2.0));
}
function rack(g, ctx, lod) {
  const R = rng(77);
  ctx.smooth(); ctx.albedo(TEX.log); ctx.color(REED);
  for (const x of [-1.8, 0, 1.8]) for (const z of [-0.3, 0.3]) g.tube([[x, -0.8, z * 0.3, 0.05], [x + z * 0.4, 1.9, z, 0.04]], 5, { capB: true });
  for (const y of [1.2, 1.75]) g.tube([[-2.1, y, 0, 0.035], [2.1, y + 0.05, 0, 0.035]], 5, { capA: true, capB: true });
  if (lod <= 2) for (let i = 0; i < 8; i++) duck(g, ctx, -1.7 + i * 0.48, 1.2 - 0.25 + R() * 0.05, 0, i);
  ctx.flat(); ctx.albedo(TEX.canvas); ctx.color("oklch(0.55 0.03 70)");   // a torn net hung on the top rail
  for (let i = 0; i < 6; i++) g.quad([-1.6 + i * 0.5, 1.8, 0.02], [-1.6 + i * 0.5, 1.0 + (i % 2) * 0.3, 0.05], [-1.15 + i * 0.5, 1.1, 0.05], [-1.15 + i * 0.5, 1.8, 0.02]);
}
function ladder(g, ctx, lod) {
  const L = 7;
  ctx.smooth(); ctx.albedo(null); ctx.color(TAR);
  for (const s of [-0.28, 0.28]) g.tube([[s, 0, 0, 0.025], [s, L, -0.4, 0.025]], 4);
  ctx.flat(); ctx.albedo(TEX.oak); ctx.color("oklch(0.7 0.03 60)");
  for (let i = 1; i < L / 0.35; i++) { const t = i * 0.35 / L; g.box(0, i * 0.35, -0.4 * t, 0.62, 0.04, 0.06); }
  ctx.albedo(TEX.iron); ctx.color("oklch(0.55 0.02 40)");
  for (const y of [L * 0.5, L]) for (const s of [-0.34, 0.34]) g.box(s, y, -0.42 * y / L - 0.02, 0.06, 0.06, 0.22);
  g.at(X([0, L, -1.2], 0), () => { planks(g, ctx, 2.2, 1.6, 0, 6, "oklch(0.75 0.03 60)"); for (const x of [-1, 1]) post(g, ctx, x, 0.7, 0.9, 0.06); });
}
function lookout(g, ctx, lod) {
  const W = 4.2, D = 3.2, F = 1.4;
  for (const x of [-W / 2, 0, W / 2]) for (const z of [-D / 2, D / 2]) post(g, ctx, x, z, F + 1.0, 0.1);
  planks(g, ctx, W + 0.2, D + 0.2, F, 12, "oklch(0.72 0.03 55)");
  ctx.smooth(); ctx.albedo(TEX.log); ctx.color("oklch(0.8 0.02 60)");
  for (const z of [-D / 2, D / 2]) g.tube([[-W / 2, F + 0.95, z, 0.04], [W / 2, F + 0.95, z, 0.04]], 5);
  g.tube([[-W / 2, F + 0.95, -D / 2, 0.04], [-W / 2, F + 0.95, D / 2, 0.04]], 5);
  ctx.flat(); ctx.albedo(TEX.oak); ctx.color("oklch(0.75 0.03 60)");   // the ramp up from the open +x side
  for (let i = 0; i < 7; i++) g.box(W / 2 + 0.3 + i * 0.3, F - 0.1 - i * 0.2, 0, 0.3, 0.06, 1.0);
  if (lod <= 2) {
    ctx.smooth(); ctx.albedo(TEX.iron); ctx.color("oklch(0.75 0.05 80)"); g.tube([[-1.2, F + 1.3, -1.1, 0.04], [-1.2, F + 1.36, -1.7, 0.03]], 8, { capA: true, capB: true });   // brass spyglass on its fork
    ctx.albedo(TEX.log); ctx.color("oklch(0.8 0.02 60)"); g.tube([[-1.2, F, -1.1, 0.03], [-1.2, F + 1.25, -1.1, 0.03]], 5);
    ctx.albedo(TEX.oak); ctx.color("oklch(0.7 0.04 60)"); g.tube([[1.4, F + 0.03, 1.0, 0.32], [1.4, F + 0.5, 1.0, 0.36], [1.4, F + 0.95, 1.0, 0.32]], 10, { capA: true, capB: true });   // lashed water barrel
    ctx.flat(); ctx.albedo(TEX.iron); ctx.color("oklch(0.4 0.01 240)"); for (const y of [0.15, 0.8]) g.tube([[1.4, F + y, 1.0, 0.345], [1.4, F + y + 0.05, 1.0, 0.345]], 10);
  }
}
function tent(g, ctx, lod) {
  const W = 3.4, D = 4.4, H = 2.3;
  ctx.smooth(); ctx.albedo(TEX.log); ctx.color("oklch(0.8 0.02 60)");
  for (const z of [-D / 2, D / 2]) g.tube([[0, -0.5, z, 0.05], [0, H, z, 0.045]], 5, { capB: true });
  g.tube([[0, H, -D / 2 - 0.2, 0.04], [0, H, D / 2 + 0.2, 0.04]], 5, { capA: true, capB: true });
  ctx.flat(); ctx.albedo(TEX.canvas); ctx.color(SAIL);
  for (const s of [-1, 1]) { g.quad([0, H, -D / 2], [s * W / 2, 0.05, -D / 2], [s * W / 2, 0.05, D / 2], [0, H, D / 2]); g.quad([0, H, D / 2], [s * W / 2, 0.05, D / 2], [s * W / 2, 0.05, -D / 2], [0, H, -D / 2]); }
  g.tri([0, H, D / 2], [-W / 2, 0.05, D / 2], [W / 2, 0.05, D / 2]); g.tri([0, H, D / 2], [W / 2, 0.05, D / 2], [-W / 2, 0.05, D / 2]);   // closed back; front (-z) open
  if (lod <= 2) { ctx.albedo(null); ctx.color("oklch(0.75 0.13 85)");   // the gilded trident of Aurenmar on the stolen sail
    const tx = W / 4 + 0.02, ty = H / 2;
    g.at(X([tx + 0.01, ty, 0], 0, 0, -56), () => { g.box(0, 0, 0, 0.02, 1.1, 0.07); for (const z of [-0.22, 0, 0.22]) g.box(0, 0.6, z, 0.02, 0.3, 0.05); g.box(0, 0.45, 0, 0.02, 0.05, 0.5); }); }
  ctx.albedo(TEX.canvas); ctx.color("oklch(0.6 0.04 40)"); g.box(0.3, 0.1, 0.8, 0.8, 0.2, 1.8);   // a bedroll
  ctx.color(ROPE); ctx.smooth(); ctx.albedo(null); for (const s of [-1, 1]) g.tube([[0, H, -D / 2], [s * 1.6, -0.1, -D / 2 - 1.2]].map((p) => [...p, 0.012]), 3);
}
function fire(g, ctx, lod) {
  ctx.flat(); ctx.albedo(TEX.fieldstone); ctx.color("oklch(0.85 0.01 70)");
  for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; g.tris(g.blob([Math.cos(a) * 1.1, 0.05, Math.sin(a) * 1.1], [0.3, 0.22, 0.26], 1, 0.2, 1, i, -0.3)); }
  ctx.smooth(); ctx.albedo(TEX.iron); ctx.color("oklch(0.45 0.01 40)");
  for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283; g.tube([[Math.cos(a) * 0.7, -0.3, Math.sin(a) * 0.7, 0.04], [Math.cos(a) * 0.95, 1.6, Math.sin(a) * 0.95, 0.035]], 5, { capB: true }); }
  for (const y of [0.6, 1.5]) { const r = 0.78 + y * 0.12; for (let i = 0; i < 6; i++) { const a0 = i / 6 * 6.283, a1 = (i + 1) / 6 * 6.283; g.tube([[Math.cos(a0) * r, y, Math.sin(a0) * r, 0.03], [Math.cos(a1) * r, y, Math.sin(a1) * r, 0.03]], 4); } }
  ctx.albedo(TEX.log); ctx.color(SOOT);
  for (let i = 0; i < 7; i++) { const a = i / 7 * 6.283; g.tube([[Math.cos(a) * 0.55, 0.1, Math.sin(a) * 0.55, 0.09], [Math.cos(a + 2.6) * 0.3, 1.1, Math.sin(a + 2.6) * 0.3, 0.07]], 6, { capA: true, capB: true }); }
}
const PARTS = { punt, smokehouse, rack, ladder, lookout, tent, fire };
export function geometry(ctx) { const g = new G(ctx); PARTS[ctx.params.part ?? "punt"](g, ctx, ctx.lod || 1); ctx.albedo(null); ctx.color(null); ctx.flat(); }
export function collider(ctx) {
  const p = ctx.params.part ?? "punt";
  if (p === "punt") return [{ kind: "box", width: 1.3, height: 0.5, depth: 4.6, center: [0, 0.25, 0] }];
  if (p === "smokehouse") return [{ kind: "box", width: 3.9, height: 0.12, depth: 3.3, center: [0, 1.1, 0] }, { kind: "box", width: 3.7, height: 2.4, depth: 0.1, center: [0, 2.3, 1.5] },
    { kind: "box", width: 0.1, height: 2.4, depth: 3.0, center: [-1.8, 2.3, 0] }, { kind: "box", width: 0.1, height: 2.4, depth: 3.0, center: [1.8, 2.3, 0] },
    { kind: "box", width: 1.1, height: 2.4, depth: 0.1, center: [-1.2, 2.3, -1.5] }, { kind: "box", width: 1.1, height: 2.4, depth: 0.1, center: [1.2, 2.3, -1.5] },
    { kind: "box", width: 1.0, height: 0.1, depth: 1.6, center: [0, 0.55, -2.1], rotation: { pitch: -44 } }];
  if (p === "rack") return [{ kind: "box", width: 4.2, height: 1.9, depth: 0.3, center: [0, 0.95, 0] }];
  if (p === "lookout") return [{ kind: "box", width: 4.4, height: 0.12, depth: 3.4, center: [0, 1.4, 0] }, { kind: "box", width: 2.2, height: 0.1, depth: 1.0, center: [3.2, 0.75, 0], rotation: { roll: 33 } }];
  if (p === "tent") return [{ kind: "box", width: 3.2, height: 2.0, depth: 0.1, center: [0, 1.0, 2.2] }];
  if (p === "fire") return [{ kind: "cylinder", radiusTop: 1.0, radiusBottom: 1.0, height: 1.6, center: [0, 0.8, 0] }];
  if (p === "ladder") return [{ kind: "box", width: 2.2, height: 0.1, depth: 1.6, center: [0, 7, -1.2] }];
  return [];
}
