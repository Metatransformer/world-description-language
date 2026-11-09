// THE GREYWOOD DEN MOUTH: a wolf den dug under a lichen outcrop on the hillside. Low black mouth (front −Z) between
// two mossy cheeks, a slab lintel, the earth beneath worn bare and dark where the pack comes and goes, gnawed deer bones
// and a ribcage strewn on the apron, tufts of grey fur caught on the rock, a fallen pine limb across the left flank.
// Origin = ground at the mouth's lip; the walk-in passage reaches z ≈ 1.6 where the door frame stands. Params: seed.
import { G, TEX, mossyRock, bone, rng } from "../lib/geo.js";
const BONE = "oklch(0.83 0.03 85)", FUR = "oklch(0.58 0.01 250)";
export function geometry(ctx) {
  ctx.roughness?.(1); ctx.metalness?.(0);
  const g = new G(ctx), lod = ctx.lod || 1, det = lod <= 1 ? 3 : lod <= 3 ? 2 : 1, R = rng((ctx.params?.seed ?? 7) * 977);
  const rk = { rock: TEX.rock, moss: TEX.moss, mossTint: "oklch(0.6 0.045 128)", rockTint: "oklch(0.95 0.012 80)" };
  // the outcrop: a long back mass sunk into the slope, two cheeks, a slab lintel, a shoulder stone each side
  mossyRock(g, [-3.7, 0.4, 4.4], [3.0, 4.0, 3.6], det, 31, { ...rk, mossAt: 0.5 });
  mossyRock(g, [3.8, 0.3, 4.6], [3.1, 3.8, 3.6], det, 37, { ...rk, mossAt: 0.5 });
  mossyRock(g, [0, 3.5, 4.6], [2.6, 1.2, 3.4], det, 38, { ...rk, mossAt: 0.45, floor: -0.9 });
  mossyRock(g, [-3.0, 0.1, 1.5], [1.5, 2.5, 1.7], det, 32, rk);
  mossyRock(g, [3.15, 0.0, 1.6], [1.7, 2.3, 1.8], det, 33, rk);
  mossyRock(g, [0.1, 2.85, 1.7], [3.0, 0.75, 1.6], det, 34, { ...rk, mossAt: 0.4 });
  if (lod <= 3) { mossyRock(g, [-4.3, -0.1, 2.6], [1.3, 1.2, 1.4], det - 1 || 1, 35, rk); mossyRock(g, [4.4, -0.2, 2.9], [1.5, 1.0, 1.3], det - 1 || 1, 36, rk); }
  // the dark: a recessed throat, not a flat card: floor, walls, roof falling away into black
  ctx.albedo(null); ctx.color("oklch(0.06 0.01 50)");
  g.quad([-1.15, 0.02, 0.9], [1.15, 0.02, 0.9], [0.9, 0.02, 4.2], [-0.9, 0.02, 4.2]);
  g.quad([-1.15, 2.3, 0.9], [-0.9, 2.0, 4.2], [0.9, 2.0, 4.2], [1.15, 2.3, 0.9]);
  g.quad([-1.15, 0, 0.9], [-0.9, 0, 4.2], [-0.9, 2.0, 4.2], [-1.15, 2.3, 0.9]);
  g.quad([1.15, 0, 0.9], [1.15, 2.3, 0.9], [0.9, 2.0, 4.2], [0.9, 0, 4.2]);
  g.quad([-0.9, 0, 4.2], [0.9, 0, 4.2], [0.9, 2.0, 4.2], [-0.9, 2.0, 4.2]);
  // worn earth: a dark trodden fan spilling down from the lip
  ctx.color("oklch(0.34 0.04 48)"); g.tris(g.blob([0, -0.06, -0.4], [1.8, 0.05, 2.0], 1, 0.25, 1.2, 41, -0.03));
  // gnawed bones: long bones, a deer ribcage, a skull
  ctx.color(BONE);
  const nb = lod <= 1 ? 11 : lod <= 3 ? 6 : 2;
  for (let i = 0; i < nb; i++) {
    const x = (R() - 0.5) * 3.4, z = -0.3 - R() * 2.6, a = R() * 6.283, L = 0.25 + R() * 0.3;
    bone(g, [x, 0.04, z], [x + Math.cos(a) * L, 0.04, z + Math.sin(a) * L], 0.02 + R() * 0.012);
  }
  if (lod <= 3) {
    const rx = 1.3, rz = -1.4;
    for (let i = 0; i < 6; i++) { const z = rz + i * 0.13, s = 0.32 - Math.abs(i - 2.5) * 0.04; g.tube([[rx - s, 0.03, z, 0.018], [rx - s * 0.6, 0.2, z, 0.018], [rx, 0.27, z, 0.02], [rx + s * 0.6, 0.2, z, 0.018], [rx + s, 0.03, z, 0.018]], 4); }
    g.tube([[rx, 0.27, rz - 0.15, 0.03], [rx, 0.27, rz + 0.8, 0.03]], 5);
    g.tris(g.blob([-1.5, 0.11, -0.9], [0.13, 0.1, 0.19], 1, 0.15, 2, 44));
    ctx.color("oklch(0.12 0.01 60)"); g.box(-1.55, 0.13, -1.06, 0.04, 0.04, 0.02); g.box(-1.45, 0.13, -1.06, 0.04, 0.04, 0.02);
  }
  // fur tufts snagged at shoulder height on the cheeks and the apron
  ctx.color(FUR);
  if (lod <= 3) for (const [x, y, z, s] of [[-1.25, 0.55, 0.45, 0.09], [1.3, 0.7, 0.5, 0.08], [-1.2, 0.3, 0.6, 0.06], [0.6, 0.03, -1.9, 0.08], [-0.4, 0.03, -2.6, 0.07]]) g.tris(g.blob([x, y, z], [s, s * 0.6, s], 1, 0.4, 3, 50 + x * 10));
  // a fallen pine limb across the left flank, bark side up, a stub branch
  ctx.albedo(TEX.bark); ctx.color("oklch(0.55 0.03 55)");
  g.tube([[-5.2, 0.12, -0.6, 0.17], [-3.9, 0.2, -0.9, 0.15], [-2.6, 0.18, -1.5, 0.12], [-1.9, 0.12, -2.1, 0.08]], lod <= 1 ? 8 : 5, { capA: true, capB: true });
  if (lod <= 3) g.tube([[-3.9, 0.24, -0.95, 0.05], [-3.6, 0.6, -0.6, 0.03], [-3.5, 0.8, -0.5, 0.015]], 4);
  // the killer's torch, jammed in a crack of the left cheek: someone uses this den who isn't a wolf
  ctx.albedo(null); ctx.color("oklch(0.3 0.03 50)");
  g.tube([[-1.55, 0.9, 0.2, 0.035], [-1.35, 1.75, -0.05, 0.03]], 5);
  ctx.color("oklch(0.2 0.01 50)"); g.box(-1.33, 1.82, -0.07, 0.11, 0.14, 0.11);
  ctx.color("oklch(0.9 0.15 65)"); ctx.emissive?.("oklch(0.8 0.17 55)", 3); g.tris(g.blob([-1.32, 1.98, -0.08], [0.07, 0.13, 0.07], 1, 0.3, 3, 61)); ctx.emissive?.(null);
  ctx.albedo(null); ctx.color(null);
}
export function collider() { return [
  { kind: "box", width: 11, height: 5, depth: 4.4, center: [0, 2.5, 4.6] },
  { kind: "box", width: 2.4, height: 3.2, depth: 2.6, center: [-3.05, 1.6, 1.5] },
  { kind: "box", width: 2.6, height: 3.0, depth: 2.6, center: [3.2, 1.5, 1.6] },
  { kind: "box", width: 3.2, height: 1, depth: 2.4, center: [0, 3.0, 1.7] },
]; }
