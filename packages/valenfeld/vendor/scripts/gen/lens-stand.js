// A scrying lens on its stand: turned stone pedestal, a brass fork, the lens held upright in a brass ring facing -Z.
// params.glow = the lens's faint light (null for a dead lens).
import { G } from "../lib/geo.js";
export function geometry(ctx) {
  const g = new G(ctx), P = ctx.params ?? {}, seg = ctx.lod > 2 ? 8 : 16;
  ctx.albedo("cdn/texture-fieldstone-wall-mossy.png"); ctx.color("oklch(0.92 0.01 240)"); ctx.roughness(0.95);
  const prof = [[0, 0.2], [0.06, 0.2], [0.09, 0.17], [0.12, 0.11], [0.3, 0.085], [0.65, 0.075], [0.84, 0.1], [0.9, 0.14], [0.95, 0.14]];
  ctx.smooth(); g.tube(prof.map(([y, r]) => [0, y, 0, r]), seg, { capA: true, capB: true }); ctx.flat();
  ctx.albedo(null); ctx.color("oklch(0.68 0.11 75)"); ctx.metalness(0.85); ctx.roughness(0.35); ctx.smooth();
  const R = 0.17, cy = 1.2;
  g.tube([[0, 0.94, 0, 0.03], [0, 1.0, 0, 0.022], [0, 1.03, 0, 0.03]], seg);              // collar
  for (const s of [-1, 1]) g.tube([[0, 1.02, 0, 0.016], [s * 0.1, 1.05, 0, 0.014], [s * (R + 0.02), 1.12, 0, 0.013], [s * (R + 0.02), cy, 0, 0.013]], 6, { capB: true });  // fork
  const ring = []; for (let i = 0; i <= 28; i++) { const a = i / 28 * Math.PI * 2; ring.push([Math.cos(a) * R, cy + Math.sin(a) * R, 0, 0.018]); }
  g.tube(ring, 8);                                                                          // the brass ring
  for (const s of [-1, 1]) g.tube([[s * (R + 0.035), cy, 0, 0.022], [s * (R - 0.005), cy, 0, 0.022]], 6, { capA: true });  // pivots
  ctx.flat(); ctx.metalness(0.1); ctx.roughness(0.05);
  ctx.color("oklch(0.82 0.06 220)"); if (P.glow !== null) ctx.emissive(P.glow ?? "oklch(0.55 0.1 220)");
  const n = 24, L = (i, z) => { const a = i / n * Math.PI * 2; return [Math.cos(a) * (R - 0.01), cy + Math.sin(a) * (R - 0.01), z]; };
  for (let i = 0; i < n; i++) { g.tri([0, cy, -0.012], L(i, -0.004), L(i + 1, -0.004)); g.tri([0, cy, 0.012], L(i + 1, 0.004), L(i, 0.004)); g.quad(L(i, -0.004), L(i, 0.004), L(i + 1, 0.004), L(i + 1, -0.004)); }
  ctx.emissive(null); ctx.color(null); ctx.metalness(null); ctx.roughness(null);
}
export function collider() { return { kind: "cylinder", radiusTop: 0.14, radiusBottom: 0.2, height: 0.95, center: [0, 0.475, 0] }; }
