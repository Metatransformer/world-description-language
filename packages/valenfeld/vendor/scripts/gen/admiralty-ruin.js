// The burnt Thalor admiralty (concept: art-admiralty-cellars): the entrance to the Admiralty Cellars dungeon.
// A raised stone plinth (PH m) carries the roofless hall shell: lichen-black fieldstone walls with arched window holes and
// a broken gable, charred beams fallen across the floor, a square tower stump at the NW corner, an iron flagpole with a rag
// of the navy gull banner. In the plinth's south face a vault stair (STW wide) drops to the sunken well at ground level,
// where a round arch with a torn-open iron grate leads below; black water pools in the well. Local: +Z south (sea). y=0 ground.
import { G, rng, TEX, mossyRock } from "../lib/geo.js";
export const PH = 2.4, W = 22, D = 15, WH = 6.5, T = 0.8, STW = 2.6, SX = 3;
const SOOT = "oklch(0.34 0.012 60)", STONE = "oklch(0.52 0.012 80)", CHAR = "oklch(0.18 0.01 40)", IRON = "oklch(0.26 0.01 50)";
// a wall run along x from x0 to x1 at z, with arch-topped holes at xs (width hw, sill sy, height hh); top may step (ragged)
function wallX(g, x0, x1, z, y0, h, holes, R) {
  let x = x0; const segs = [];
  for (const [cx, hw, sy, hh] of holes) { segs.push([x, cx - hw / 2]); g.box(cx, y0 + sy / 2, z, hw, sy, T); g.box(cx, y0 + sy + hh + (h - sy - hh) / 2, z, hw, h - sy - hh, T); x = cx + hw / 2; }
  segs.push([x, x1]);
  for (const [a, b] of segs) if (b - a > 0.05) { const n = Math.max(1, Math.round((b - a) / 2)); for (let i = 0; i < n; i++) { const s = a + (b - a) * i / n, e = a + (b - a) * (i + 1) / n, hh = h - R() * 1.6 * (R() < 0.4 ? 1 : 0.2); g.box((s + e) / 2, y0 + hh / 2, z, e - s, hh, T); } }
}
function wallZ(g, z0, z1, x, y0, h, holes, R) { g.at({ m: [0, 0, -1, 0, 1, 0, 1, 0, 0], t: [x, 0, 0] }, () => wallX(g, z0, z1, 0, y0, h, holes, R)); }
export function geometry(ctx) {
  const g = new G(ctx), lod = ctx.lod || 1, R = rng(2186);
  if (lod >= 5) { ctx.color(SOOT); g.box(0, (PH + WH) / 2, 0, W, PH + WH, D); ctx.color(null); return; }
  // plinth: a fieldstone base with a stair cut in its south face
  ctx.albedo(TEX.fieldstone); ctx.color(STONE);
  const sz0 = D / 2 - 5.2; // stair well spans z sz0..D/2 at x SX±STW/2
  g.box(0, PH / 2, -D / 4 + sz0 / 2 - D / 8 + D / 8, W, PH, sz0 + D / 2); // north block (z -D/2..sz0)
  g.box((-W / 2 + SX - STW / 2) / 2, PH / 2, (sz0 + D / 2) / 2, SX - STW / 2 + W / 2, PH, D / 2 - sz0);
  g.box((SX + STW / 2 + W / 2) / 2, PH / 2, (sz0 + D / 2) / 2, W / 2 - SX - STW / 2, PH, D / 2 - sz0);
  // the stair: from plinth top (north, z=sz0+0.2) down to the well floor at y=0 (south)... the arch sits in the well's north wall
  ctx.color("oklch(0.46 0.015 90)"); const n = 8;
  for (let i = 0; i < n; i++) { const y = PH * (1 - (i + 1) / n), z = D / 2 - 0.35 - i * 0.42; g.box(SX, y / 2, z, STW, Math.max(0.05, y), 0.42); }
  // well walls stand proud as a parapet
  ctx.color(SOOT); g.box(SX - STW / 2 - 0.3, PH + 0.45, (sz0 + D / 2) / 2, 0.6, 0.9, D / 2 - sz0); g.box(SX + STW / 2 + 0.3, PH + 0.45, (sz0 + D / 2) / 2, 0.6, 0.9, D / 2 - sz0);
  // the cellar arch at the well's foot (in the north face of the well, under the plinth) — flush with z = sz0
  ctx.color(SOOT); g.box(SX, PH + 0.2, sz0 + 0.3, STW + 1.4, 0.5, 0.7);
  ctx.albedo(null); ctx.color("oklch(0.06 0.01 60)"); g.box(SX, 1.15, sz0 - 0.02, STW - 0.3, 2.3, 0.1);
  ctx.albedo(TEX.iron); ctx.color(IRON); for (let i = 0; i < 6; i++) g.at({ m: [1, 0, 0, 0, 1, 0, 0, 0, 1], t: [0, 0, 0] }, () => g.box(SX - STW / 2 + 0.25 + i * 0.42 + (i > 3 ? 0.3 : 0), 1.2 - (i > 3 ? 0.5 : 0), sz0 + 0.12 + (i > 3 ? 0.7 : 0), 0.06, 2.3, 0.06));
  g.box(SX - 0.4, 2.1, sz0 + 0.12, STW * 0.55, 0.08, 0.08);
  // black water pooled at the foot
  ctx.albedo(null); ctx.color("oklch(0.16 0.02 220)"); g.box(SX, 0.06, sz0 + 1.1, STW, 0.05, 1.8);
  // hall shell on the plinth
  ctx.albedo(TEX.fieldstone); ctx.color(SOOT);
  const holes = (len, k) => Array.from({ length: k }, (_, i) => [-len / 2 + len * (i + 0.5) / k, 1.4, 1.4, 2.8]);
  wallX(g, -W / 2, W / 2, -D / 2 + T / 2, PH, WH, holes(W, 4), R);
  wallX(g, -W / 2, W / 2, D / 2 - T / 2, PH, WH * 0.8, [[-6, 1.4, 1.4, 2.8], [SX, STW + 0.6, 0.01, 0.01], [8, 1.4, 1.4, 2.8]], R);
  wallZ(g, -D / 2, D / 2, -W / 2 + T / 2, PH, WH, holes(D, 3), R);
  wallZ(g, -D / 2, 2, W / 2 - T / 2, PH, WH * 0.9, holes(9, 2), R);
  // a broken gable over the west end
  g.at({ m: [0, 0, -1, 0, 1, 0, 1, 0, 0], t: [-W / 2 + T / 2, PH + WH, 0] }, () => { for (let i = 0; i < 5; i++) { const w = D * (1 - i / 5) * 0.8; g.box(-1.2, 0.4 + i * 0.8, 0, w, 0.8, T); } });
  // tower stump NW
  ctx.color("oklch(0.4 0.012 70)"); g.box(-W / 2 + 2, PH + 5.5, -D / 2 + 2, 4.6, 11, 4.6);
  ctx.color(SOOT); for (const [dx, dz] of [[-1.6, -1.6], [1.6, -1.6], [-1.6, 1.6]]) g.box(-W / 2 + 2 + dx, PH + 11.5, -D / 2 + 2 + dz, 1.2, 1 + R(), 1.2);
  ctx.albedo(null); ctx.color("oklch(0.07 0.01 60)"); g.box(-W / 2 + 2, PH + 7.5, -D / 2 + 4.32, 0.5, 1.2, 0.05);
  // fallen charred beams and rubble on the floor; one beam still spanning
  ctx.albedo(TEX.log); ctx.color(CHAR);
  g.box(0, PH + WH - 0.4, -1, 0.4, 0.4, D - 1);
  for (let i = 0; i < 7; i++) { const a = R() * 3.14, L = 4 + R() * 5, x = -7 + R() * 14, z = -5 + R() * 6, tilt = 0.25 * R();
    g.at({ m: [Math.cos(a), 0, Math.sin(a), 0, 1, 0, -Math.sin(a), 0, Math.cos(a)], t: [x, PH + 0.25 + tilt * 2, z] }, () => g.at({ m: [1, 0, 0, 0, Math.cos(tilt), -Math.sin(tilt), 0, Math.sin(tilt), Math.cos(tilt)], t: [0, 0, 0] }, () => g.box(0, 0, 0, 0.35, 0.35, L))); }
  if (lod <= 3) for (let i = 0; i < 10; i++) mossyRock(g, [-9 + R() * 18, PH, -5.5 + R() * 9], [0.4 + R() * 0.6, 0.3 + R() * 0.4, 0.4 + R() * 0.5], 1, 40 + i, { rock: TEX.fieldstone, moss: TEX.moss, rockTint: "oklch(0.55 0.01 80)", mossTint: "oklch(0.6 0.08 125)" });
  // rubble spilled down the slope outside the east breach
  if (lod <= 3) for (let i = 0; i < 8; i++) mossyRock(g, [W / 2 + 0.5 + R() * 3, 0.2, 2 + R() * 6], [0.5 + R() * 0.7, 0.4 + R() * 0.5, 0.5 + R() * 0.6], 1, 60 + i, { rock: TEX.fieldstone, moss: TEX.moss, rockTint: "oklch(0.5 0.01 80)" });
  // flagpole and the rag of the navy gull banner
  ctx.albedo(TEX.iron); ctx.color("oklch(0.38 0.07 45)"); g.tube([[W / 2 - 1.5, PH, -D / 2 + 1.5, 0.09], [W / 2 - 1.5, PH + 12, -D / 2 + 1.5, 0.06]], 6, { capB: true });
  ctx.albedo(TEX.canvas); ctx.color("oklch(0.32 0.06 255)");
  const fx = W / 2 - 1.5, fz = -D / 2 + 1.5, fy = PH + 11.6;
  g.quad([fx, fy, fz], [fx + 1.6, fy - 0.2, fz + 0.2], [fx + 1.2, fy - 1.4, fz + 0.3], [fx, fy - 1.3, fz]); g.quad([fx, fy, fz], [fx, fy - 1.3, fz], [fx + 1.2, fy - 1.4, fz + 0.3], [fx + 1.6, fy - 0.2, fz + 0.2]);
  ctx.color("oklch(0.85 0.01 90)"); g.box(fx + 0.7, fy - 0.65, fz + 0.12, 0.5, 0.14, 0.02);
  ctx.albedo(null); ctx.color(null);
}
export function collider() {
  const sz0 = D / 2 - 5.2, out = [
    { kind: "box", width: W, height: PH, depth: sz0 + D / 2, center: [0, PH / 2, (sz0 - D / 2) / 2] },
    { kind: "box", width: SX - STW / 2 + W / 2, height: PH, depth: D / 2 - sz0, center: [(-W / 2 + SX - STW / 2) / 2, PH / 2, (sz0 + D / 2) / 2] },
    { kind: "box", width: W / 2 - SX - STW / 2, height: PH, depth: D / 2 - sz0, center: [(SX + STW / 2 + W / 2) / 2, PH / 2, (sz0 + D / 2) / 2] },
    { kind: "box", width: W, height: WH, depth: T, center: [0, PH + WH / 2, -D / 2 + T / 2] },
    { kind: "box", width: T, height: WH, depth: D, center: [-W / 2 + T / 2, PH + WH / 2, 0] },
    { kind: "box", width: T, height: WH, depth: 9.5, center: [W / 2 - T / 2, PH + WH / 2, -2.75] },
    { kind: "box", width: SX + W / 2 - STW / 2 - 0.3, height: WH * 0.8, depth: T, center: [(-W / 2 + SX - STW / 2 - 0.3) / 2, PH + WH * 0.4, D / 2 - T / 2] },
    { kind: "box", width: W / 2 - SX - STW / 2 - 0.3, height: WH * 0.8, depth: T, center: [(SX + STW / 2 + 0.3 + W / 2) / 2, PH + WH * 0.4, D / 2 - T / 2] },
    { kind: "box", width: 4.6, height: 11, depth: 4.6, center: [-W / 2 + 2, PH + 5.5, -D / 2 + 2] },
  ];
  for (let i = 0; i < 8; i++) { const y = PH * (1 - (i + 1) / 8); if (y > 0.05) out.push({ kind: "box", width: STW, height: y, depth: 0.42, center: [SX, y / 2, D / 2 - 0.35 - i * 0.42] }); }
  return out;
}
