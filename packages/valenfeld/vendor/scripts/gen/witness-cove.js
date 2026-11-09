// Witness Cove (concept: art-aur-witness-cove). A smugglers' landing nobody admits to: a stone boathouse
// with a mossy slate roof and a lantern by its door, a crooked tarred jetty out over the shingle, a rock
// shoulder behind with a cask-stacked cave mouth, a rope-and-plank stair up it, barrels and crates under
// oiled canvas, kelp on the stones. Local frame: front +Z faces the sea (the jetty runs out along +Z).
import { G, rng, TEX, mossyRock } from "../lib/geo.js";
const BX0 = -4, BX1 = 4, BZ0 = -3, BZ1 = 3, BH = 3.0, RIDGE = 5.4;   // boathouse box (my picks)
const DOOR = { x: 1.2, w: 1.2, h: 2.2 };
const JX = 5.5, JW = 2.4, JZ0 = 1, JZ1 = 34, DECK = 0.6;             // jetty: centre x, width, run, deck height
const STONE = "oklch(0.93 0.01 80)", OAK = "oklch(0.75 0.02 60)", TAR = "oklch(0.62 0.02 60)", IRON = "oklch(0.55 0.03 60)";
const rotY = (a) => [Math.cos(a), 0, Math.sin(a), 0, 1, 0, -Math.sin(a), 0, Math.cos(a)];
const at = (g, m, t, f) => g.at({ m, t }, f);
function barrel(g, ctx, x, z, lod, y = 0) {
  ctx.albedo(TEX.oak); ctx.color("oklch(0.8 0.03 60)"); ctx.smooth();
  g.tube([[x, y, z, 0.3], [x, y + 0.45, z, 0.36], [x, y + 0.9, z, 0.3]], lod <= 1 ? 10 : 6, { capA: true, capB: true }); ctx.flat();
  if (lod <= 2) { ctx.albedo(TEX.iron); ctx.color(IRON); for (const h of [0.18, 0.72]) g.tube([[x, y + h, z, 0.35], [x, y + h + 0.05, z, 0.35]], lod <= 1 ? 10 : 6); }
}
export function geometry(ctx) {
  const g = new G(ctx), lod = ctx.lod || 1, R = rng(1826);
  if (lod >= 5) { ctx.color(STONE); g.box(0, 2.2, 0, 8, 4.4, 6); g.box(-6, 4, -10, 16, 8, 8); ctx.color(OAK); g.box(JX, DECK, (JZ0 + JZ1) / 2, JW, 0.3, JZ1 - JZ0); ctx.color(null); return; }
  // ---- the rock shoulder behind: a heaped mass of lichened granite with a cave mouth in its face
  const rocks = lod <= 1 ? 16 : lod <= 2 ? 10 : 6;
  for (let i = 0; i < rocks; i++) { const a = -2.6 + (i / rocks) * 2.2, r = 10 + R() * 4, k = 2.2 + R() * 2.6;
    mossyRock(g, [-3 + Math.cos(a) * r, 0, -4 + Math.sin(a) * r], [k * 1.4, k * (0.9 + R() * 0.6), k], lod <= 1 ? 3 : 2, 1830 + i, { rock: TEX.rock, moss: TEX.moss, mossAt: 0.78, floor: -1 }); }
  // the cave: a dark arch with a timber frame, casks stacked within, a lantern hung on the lintel
  const CX = -9, CZ = -6.5;
  mossyRock(g, [CX, 0, CZ - 2.6], [4.6, 4.2, 3.0], lod <= 1 ? 3 : 2, 1899, { rock: TEX.rock, moss: TEX.moss, mossAt: 0.8, floor: -0.3 });
  ctx.albedo(null); ctx.color("oklch(0.12 0.01 60)");
  { const n = lod <= 1 ? 12 : 6; for (let k = 0; k < n; k++) { const a0 = k / n * Math.PI, a1 = (k + 1) / n * Math.PI;
    g.quad([CX + Math.cos(a1) * 2.1, 0, CZ + 0.1], [CX + Math.cos(a0) * 2.1, 0, CZ + 0.1], [CX + Math.cos(a0) * 2.1, 1.3 + Math.sin(a0) * 1.6, CZ + 0.1], [CX + Math.cos(a1) * 2.1, 1.3 + Math.sin(a1) * 1.6, CZ + 0.1]); } }
  ctx.albedo(TEX.log); ctx.color(OAK);
  for (const s of [-1, 1]) g.box(CX + s * 1.9, 1.35, CZ + 0.35, 0.22, 2.7, 0.22); g.box(CX, 2.8, CZ + 0.35, 4.3, 0.24, 0.26);
  ctx.albedo(TEX.iron); ctx.color(IRON); g.box(CX + 0.8, 2.55, CZ + 0.55, 0.05, 0.4, 0.05);
  ctx.albedo(null); ctx.color("oklch(0.9 0.12 80)"); g.box(CX + 0.8, 2.2, CZ + 0.55, 0.22, 0.32, 0.22);
  if (lod <= 2) for (const [x, z, y] of [[CX - 1.2, CZ - 0.4, 0], [CX - 0.5, CZ - 0.6, 0], [CX - 0.85, CZ - 0.5, 0.92], [CX + 0.6, CZ - 0.8, 0]]) barrel(g, ctx, x, z, lod, y);
  // a rope-and-plank stair climbing the shoulder beside the boathouse
  if (lod <= 3) { ctx.albedo(TEX.oak); ctx.color(OAK);
    for (let i = 0; i < 12; i++) { const t = i / 11, x = -4.8 - t * 1.2, z = -3.6 - t * 6.5, y = 0.2 + t * 5.2;
      g.box(x, y, z, 1.2, 0.08, 0.32); if (i % 3 === 0) for (const s of [-1, 1]) g.box(x + s * 0.65, y + 0.5, z, 0.08, 1.0, 0.08); }
    ctx.albedo(null); ctx.color("oklch(0.7 0.05 80)");
    for (const s of [-1, 1]) g.tube([[-4.8 + s * 0.65, 1.15, -3.6, 0.025], [-5.4 + s * 0.65, 3.8, -6.8, 0.03], [-6 + s * 0.65, 6.4, -10.1, 0.025]], 4); }
  // ---- the boathouse: fieldstone, a slate gable roof, chimney, oak door with a lantern beside it
  ctx.albedo(TEX.fieldstone); ctx.color(STONE);
  const W = BX1 - BX0, T = 0.5;
  g.box(0, BH / 2, BZ1 - T / 2, W, BH, T); g.box(0, BH / 2, BZ0 + T / 2, W, BH, T);
  for (const x of [BX0 + T / 2, BX1 - T / 2]) { g.box(x, BH / 2, 0, T, BH, BZ1 - BZ0); }
  for (const x of [BX0, BX1]) { g.tri([x, BH, BZ0], [x, RIDGE, 0], [x, BH, BZ1]); g.tri([x, BH, BZ1], [x, RIDGE, 0], [x, BH, BZ0]); }
  g.box(0, 0.12, 0, W + 0.3, 0.45, BZ1 - BZ0 + 0.3);
  ctx.color(STONE); g.box(DOOR.x, DOOR.h / 2 + 0.1, BZ1 + 0.05, DOOR.w + 0.5, DOOR.h + 0.4, 0.14);
  ctx.albedo(TEX.oak); ctx.color(OAK); g.box(DOOR.x, DOOR.h / 2, BZ1 + 0.12, DOOR.w, DOOR.h, 0.08);
  ctx.albedo(TEX.iron); ctx.color(IRON); for (const y of [0.5, 1.7]) g.box(DOOR.x - 0.2, y, BZ1 + 0.17, 0.75, 0.06, 0.02);
  g.box(DOOR.x + 1.05, 2.3, BZ1 + 0.3, 0.05, 0.05, 0.5);                                   // lantern bracket
  ctx.albedo(null); ctx.color("oklch(0.92 0.12 80)"); g.box(DOOR.x + 1.05, 1.95, BZ1 + 0.5, 0.24, 0.36, 0.24);
  for (const [x, z] of [[-2.2, BZ1], [3.0, BZ1], [-1, BZ0]]) { const s = Math.sign(z);
    ctx.albedo(TEX.fieldstone); ctx.color(STONE); g.box(x, 1.55, z + s * 0.04, 1.0, 1.1, 0.12);
    ctx.albedo(null); ctx.color("oklch(0.55 0.08 75)"); g.box(x, 1.6, z + s * 0.1, 0.65, 0.8, 0.04);
    ctx.color(OAK); g.box(x, 1.6, z + s * 0.13, 0.05, 0.8, 0.03); g.box(x, 1.6, z + s * 0.13, 0.65, 0.05, 0.03); }
  ctx.albedo(TEX.slate); ctx.color("oklch(0.92 0.03 150)");
  const ov = 0.4, rz = BZ1 + ov, rx0 = BX0 - ov, rx1 = BX1 + ov;
  for (const s of [1, -1]) { g.quad([rx0, BH - 0.2, s * rz], [rx1, BH - 0.2, s * rz], [rx1, RIDGE + 0.1, 0], [rx0, RIDGE + 0.1, 0]);
    g.quad([rx1, BH - 0.2, s * rz], [rx0, BH - 0.2, s * rz], [rx0, BH - 0.32, s * rz], [rx1, BH - 0.32, s * rz]); }
  ctx.albedo(TEX.fieldstone); ctx.color(STONE); g.box(0, RIDGE + 0.15, 0, rx1 - rx0, 0.18, 0.3);
  g.box(BX0 + 1.2, RIDGE + 0.3, -0.8, 0.9, 2.6, 0.9);
  ctx.color("oklch(0.7 0.09 45)"); g.tube([[BX0 + 1.2, RIDGE + 1.6, -0.8, 0.14], [BX0 + 1.2, RIDGE + 2.0, -0.8, 0.13]], 6, { capB: true });
  // ---- stone landing in front, then the tarred jetty on crooked piles, mooring posts, a ladder at its end
  ctx.albedo(TEX.flag); ctx.color("oklch(0.9 0.01 80)"); g.box(2.5, 0.15, BZ1 + 1.6, 7.5, 0.5, 2.6);
  ctx.albedo(TEX.oak); ctx.color(TAR);
  const planks = lod <= 1 ? 66 : lod <= 2 ? 33 : 11, pl = (JZ1 - JZ0) / planks;
  for (let i = 0; i < planks; i++) { const z = JZ0 + 3 + (i + 0.5) * pl * ((JZ1 - JZ0 - 3) / (JZ1 - JZ0)), j = lod <= 1 ? (R() - 0.5) * 0.08 : 0;
    at(g, rotY(j), [JX + Math.sin(z * 0.04) * 0.6, DECK + (R() - 0.5) * 0.03, z], () => g.box(0, 0, 0, JW + (R() - 0.5) * 0.2, 0.1, pl * 0.92)); }
  ctx.albedo(TEX.log); ctx.color(TAR);
  for (let z = JZ0 + 4; z <= JZ1; z += 3.6) for (const s of [-1, 1]) { const x = JX + Math.sin(z * 0.04) * 0.6 + s * (JW / 2 + 0.05), lean = (R() - 0.5) * 0.12;
    at(g, [1, 0, 0, 0, Math.cos(lean), -Math.sin(lean), 0, Math.sin(lean), Math.cos(lean)], [x, DECK - 3.5, z], () => g.box(0, 0, 0, 0.28, 8.2 + R() * 0.8, 0.28)); }
  for (let z = JZ0 + 4; z <= JZ1; z += 3.6) g.box(JX + Math.sin(z * 0.04) * 0.6, DECK - 0.15, z, JW + 0.4, 0.16, 0.2);
  ctx.albedo(null); ctx.color("oklch(0.7 0.05 80)");
  if (lod <= 2) for (const z of [JZ1 - 1, JZ1 - 8, JZ1 - 15]) { const x = JX + Math.sin(z * 0.04) * 0.6 + JW / 2 + 0.05;
    ctx.smooth(); g.tube([[x - 0.2, DECK + 0.62, z, 0.04], [x + 0.25, DECK + 0.6, z - 0.15, 0.04], [x + 0.2, DECK + 0.6, z + 0.2, 0.04]], 4); ctx.flat(); }
  ctx.albedo(TEX.oak); ctx.color(OAK);
  { const x = JX + Math.sin(JZ1 * 0.04) * 0.6; for (const s of [-1, 1]) g.box(x + s * 0.3, DECK - 1.4, JZ1 + 0.3, 0.08, 3.2, 0.08);
    for (let i = 0; i < 8; i++) g.box(x, DECK - 2.8 + i * 0.4, JZ1 + 0.3, 0.6, 0.06, 0.06); }
  // ---- contraband under oiled canvas, barrels, crates, kelp strewn on the shingle
  barrel(g, ctx, -2.6, BZ1 + 1.4, lod); barrel(g, ctx, -1.9, BZ1 + 1.9, lod); barrel(g, ctx, 6.0, BZ1 + 2.3, lod);
  ctx.albedo(TEX.oak); ctx.color("oklch(0.8 0.03 60)"); g.box(4.6, 0.35, BZ1 + 1.8, 0.8, 0.7, 0.7); g.box(4.7, 0.95, BZ1 + 1.75, 0.6, 0.5, 0.6);
  ctx.albedo(TEX.canvas); ctx.color("oklch(0.75 0.05 130)");                                // the tarp heap over the run goods
  { const x0 = -7.5, z0 = 1.5; for (const [x, z, w, h] of [[0, 0, 3.0, 1.2], [0.4, 1.3, 2.4, 0.9]]) { g.box(x0 + x, h / 2, z0 + z, w, h, 1.3);
      g.quad([x0 + x - w / 2 - 0.25, 0, z0 + z + 0.9], [x0 + x + w / 2 + 0.25, 0, z0 + z + 0.9], [x0 + x + w / 2, h, z0 + z + 0.65], [x0 + x - w / 2, h, z0 + z + 0.65]); } }
  if (lod <= 2) { ctx.albedo(null); ctx.color("oklch(0.35 0.05 95)");
    for (let i = 0; i < (lod <= 1 ? 26 : 12); i++) { const x = -10 + R() * 24, z = 6 + R() * 20; if (Math.abs(x - JX) < 2) continue;
      at(g, rotY(R() * 6.28), [x, 0.02, z], () => g.box(0, 0, 0, 0.9 + R() * 0.8, 0.04, 0.18 + R() * 0.15)); } }
  ctx.albedo(null); ctx.color(null);
}
export function collider() {
  const out = [
    { kind: "box", width: BX1 - BX0, height: BH + 1.4, depth: BZ1 - BZ0, center: [0, (BH + 1.4) / 2, 0] },
    { kind: "box", width: 7.5, height: 0.5, depth: 2.6, center: [2.5, 0.15, BZ1 + 1.6] },
    { kind: "box", width: 3.2, height: 1.2, depth: 2.6, center: [-7.3, 0.6, 2.1] },
  ];
  for (let z = JZ0 + 3; z < JZ1; z += 4) out.push({ kind: "box", width: JW, height: 0.2, depth: 4.05, center: [JX + Math.sin((z + 2) * 0.04) * 0.6, DECK, z + 2] });
  return out;
}
