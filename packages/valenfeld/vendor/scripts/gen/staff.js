// A gnarled oak mage staff, ~1.5 m: origin at the grip 0.45 m up the shaft, along +Y. A crooked knotted shaft swells into three
// oak tines cradling a glowing blue crystal, bound by two iron bands below and an iron ring round the tines. Levels: 1 bark knots … 5 a hull.
import { mesher, mix, hex } from "../lib/mesh.js";

const BARK = [0.34, 0.25, 0.17], DEEP = [0.18, 0.13, 0.09], WORN = [0.5, 0.39, 0.27], IRON = [0.3, 0.3, 0.31];
const SIDES = [0, 14, 10, 8, 6, 5];

export function geometry(ctx) {
  const lod = ctx.lod ?? 1, n = SIDES[lod] ?? 8, fine = lod <= 2, k = lod <= 1 ? 3 : lod <= 2 ? 2 : 1;
  const m = mesher(ctx, { vertexColors: true });
  const nz = (p, f) => Math.max(-1, Math.min(1, ctx.noise3d(p[0] * f, p[1] * f, p[2] * f)));
  const bark = (p) => {
    let c = mix(BARK, DEEP, 0.5 + 0.5 * nz([p[0] * 3, p[1] * 0.4, p[2] * 3], 30));
    if (p[1] > -0.12 && p[1] < 0.12) c = mix(c, WORN, 0.55); // hand-polished at the grip
    return hex(c, 1 + (fine ? 0.15 * nz(p, 70) : 0));
  };
  ctx.smooth(); ctx.metalness(0); ctx.roughness(0.9);

  // SHAFT: crooked, knotted, swelling to the head
  const sp = [], segs = lod <= 2 ? 24 : 10;
  for (let i = 0; i <= segs; i++) {
    const t = i / segs, y = -0.45 + t * 1.3;
    const wob = Math.sin(t * 9.4) * 0.008 + Math.sin(t * 23 + 1) * 0.004;
    sp.push({ p: [wob, y, Math.cos(t * 7.1) * 0.007], rx: 0.021 + 0.004 * Math.sin(t * 31) * (fine ? 1 : 0) + 0.012 * Math.max(0, (t - 0.85) / 0.15) + (i === 0 ? -0.004 : 0) });
  }
  m.tube(sp, { sides: n, capStart: 0.008, capEnd: 0.01, bump: fine ? (p) => 1 + 0.1 * nz(p, 22) + 0.18 * Math.max(0, nz(p, 6) - 0.45) : null, colorOf: bark });

  // TINES: three oak claws curling round the crystal
  const top = 0.85;
  for (let f = 0; f < 3; f++) {
    const a = (f / 3) * Math.PI * 2 + 0.3, ca = Math.cos(a), sa = Math.sin(a), tw = 0.35;
    const P = (r, y, s) => [r * Math.cos(a + s * tw), y, r * Math.sin(a + s * tw)];
    m.tube([{ p: P(0.012, top - 0.02, 0), rx: 0.014 }, { p: P(0.034, top + 0.04, 0.3), rx: 0.012 }, { p: P(0.046, top + 0.11, 0.6), rx: 0.0095 },
      { p: P(0.04, top + 0.18, 0.9), rx: 0.007 }, { p: P(0.02, top + 0.225, 1.2), rx: 0.004 }],
      { sides: Math.max(5, n - 4), k, capStart: 0, capEnd: 0.01, bump: fine ? (p) => 1 + 0.12 * nz(p, 40) : null, colorOf: bark });
  }

  // IRON: two bands on the shaft, a ring binding the tines
  ctx.metalness(0.5); ctx.roughness(0.55);
  const iron = (p) => hex(fine && nz(p, 45) > 0.4 ? mix(IRON, [0.4, 0.22, 0.12], 0.6) : IRON, 1 + (fine ? 0.2 * nz(p, 60) : 0));
  for (const [yc, r] of [[0.79, 0.031], [0.84, 0.035]]) m.lathe([[r - 0.003, yc - 0.012], [r, yc - 0.008], [r, yc + 0.008], [r - 0.003, yc + 0.012]], { sides: n + 2, capStart: 0, capEnd: 0, colorOf: iron });
  if (lod <= 4) {
    const ring = [], RN = lod <= 2 ? 20 : 10;
    for (let i = 0; i < RN; i++) { const a = (i / RN) * Math.PI * 2; ring.push({ p: [0.054 * Math.cos(a), top + 0.1, 0.047 * Math.sin(a)], rx: 0.005, ry: 0.008 }); }
    m.tube(ring, { sides: 6, closed: true, colorOf: iron });
  }

  // CRYSTAL: a six-sided shard of cold blue light
  ctx.flat(); ctx.metalness(0); ctx.roughness(0.12);
  ctx.emissive(0.12, 0.42, 1.5);
  const hx = (r, y, rot) => Array.from({ length: 6 }, (_, i) => { const a = (i / 6) * Math.PI * 2 + rot; return [r * Math.cos(a), y, r * Math.sin(a)]; });
  const cr = (r, y, rot) => ({ pts: hx(r, y, rot), c: [0, y, 0], t: [0, 1, 0], r });
  m.color("#2f6fd8");
  m.loft([cr(0.018, top + 0.04, 0), cr(0.028, top + 0.08, 0.08), cr(0.03, top + 0.16, 0.12), cr(0.022, top + 0.2, 0.16)], { capStart: 0.025, capEnd: 0.05 });
  ctx.emissive(null);
  return m.done();
}
