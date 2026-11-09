// A south-shore palm: a ringed trunk that leans and curves up out of the sand, a crown of arching
// fronds with hanging leaflets, a few dead fronds and a cluster of nuts. params.seed shapes one palm.
import { G, rng } from "../lib/geo.js";
const BARK = "cdn/texture-palm-tree-trunk-bark-ringed.png", LEAF = "cdn/texture-palm-frond-leaf-green.png";
function frond(g, top, ang, L, segs, R, lift, droop, dead) {
  const dx = Math.cos(ang), dz = Math.sin(ang), sx = -dz, sz = dx;
  const sp = (t) => [top[0] + dx * L * t, top[1] + L * (lift * t - droop * t * t), top[2] + dz * L * t];
  for (let k = 0; k < segs; k++) {
    const t0 = k / segs, t1 = (k + 1) / segs, a = sp(t0), b = sp(t1);
    const w0 = (0.08 + 0.55 * Math.sin(Math.PI * Math.min(1, t0 * 1.15))) * (dead ? 0.5 : 1), w1 = (0.08 + 0.55 * Math.sin(Math.PI * Math.min(1, t1 * 1.15))) * (dead ? 0.5 : 1);
    const hang0 = w0 * (dead ? 0.9 : 0.45), hang1 = w1 * (dead ? 0.9 : 0.45);
    const la = [a[0] + sx * w0, a[1] - hang0, a[2] + sz * w0], lb = [b[0] + sx * w1, b[1] - hang1, b[2] + sz * w1];
    const ra = [a[0] - sx * w0, a[1] - hang0, a[2] - sz * w0], rb = [b[0] - sx * w1, b[1] - hang1, b[2] - sz * w1];
    g.quad(la, lb, b, a); g.quad(a, b, rb, ra);
  }
}
export function geometry(ctx) {
  ctx.roughness?.(1); ctx.metalness?.(0); // matte: bark and stone never shine
  const g = new G(ctx), lod = ctx.lod || 1, R = rng(7000 + (ctx.params.seed ?? 1) * 53);
  const H = 6.5 + R() * 3.5, la = R() * 6.28, lean = 1.2 + R() * 1.8, nk = lod <= 2 ? 14 : lod <= 3 ? 6 : 3, path = [];
  const at = (f) => { const b = lean * (f * 0.6 + 0.4 * f * f) * (1 - 0.3 * f); return [Math.cos(la) * b, -0.4 + (H + 0.4) * f, Math.sin(la) * b]; };
  for (let k = 0; k <= nk; k++) { const f = k / nk; path.push([...at(f), (0.24 - 0.08 * f) * (lod <= 2 && k % 2 ? 1.07 : 1) + (k === 0 ? 0.08 : 0)]); }
  ctx.smooth(); ctx.albedo(BARK); ctx.color("oklch(0.9 0.025 70)");
  g.tube(path, lod <= 2 ? 9 : 6);
  const top = at(1);
  ctx.albedo(LEAF);
  if (lod >= 5) { ctx.color("oklch(0.85 0.06 130)"); for (let j = 0; j < 5; j++) frond(g, top, j * 1.257, 3.2, 2, R, 0.4, 0.9, false); ctx.albedo(null); ctx.color(null); return; }
  const nf = [0, 11, 9, 7, 6][lod], segs = [0, 7, 5, 4, 3][lod], off = R() * 6.28;
  for (let j = 0; j < nf; j++) {
    const up = j % 3 === 0 ? 0.9 : 0.45;
    ctx.color(`oklch(${(0.8 + R() * 0.12).toFixed(3)} 0.07 ${(122 + R() * 18).toFixed(1)})`);
    frond(g, top, off + (j / nf) * 6.283 + (R() - 0.5) * 0.3, 2.8 + R() * 1.3, segs, R, up, up + 0.55 + R() * 0.3, false);
  }
  if (lod <= 2) {
    ctx.color("oklch(0.78 0.06 70)");
    for (let j = 0; j < 3; j++) frond(g, [top[0], top[1] - 0.25, top[2]], R() * 6.28, 1.9, 4, R, -0.2, 0.9, true);
    ctx.albedo(null); ctx.color("oklch(0.42 0.06 60)");
    for (let j = 0; j < 4; j++) { const a = j * 1.57 + R(); for (const t of g.blob([top[0] + Math.cos(a) * 0.22, top[1] - 0.3, top[2] + Math.sin(a) * 0.22], [0.13, 0.15, 0.13], 1, 0.1, 2, j)) g.tri(t[0], t[1], t[2]); }
  }
  ctx.albedo(null); ctx.color(null); ctx.flat();
}
export function collider() { return { kind: "cylinder", radiusTop: 0.18, radiusBottom: 0.28, height: 4, center: [0, 2, 0] }; }
