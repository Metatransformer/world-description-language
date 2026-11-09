// The bandit camp's palisade: sharpened logs in a ring, lashed with two rails, broken by gaps
// (params.gaps: [[centreDeg, widthDeg]], angle from +X toward +Z), seated on the ground log by log.
import { G, rng, TEX } from "../lib/geo.js";
const inGap = (a, gaps) => gaps.some(([c, w]) => { let d = ((a - c + 540) % 360) - 180; return Math.abs(d) < w / 2; });
function logs(ctx) {
  const R = ctx.params.radius ?? 12.5, gaps = ctx.params.gaps ?? [[90, 28]], rnd = rng(77), out = [];
  const n = Math.round((2 * Math.PI * R) / 0.44);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * 360;
    const g = inGap(a, gaps), edge = !g && inGap(a, gaps.map(([c, w]) => [c, w + 9]));
    const x = Math.cos((a * Math.PI) / 180) * R, z = Math.sin((a * Math.PI) / 180) * R;
    out.push({ a, x, z, g, edge, h: (edge ? 1.2 + rnd() * 1.1 : 2.7 + rnd() * 0.6), r: 0.17 + rnd() * 0.05, lean: (rnd() - 0.5) * 6, fall: g && ctx.params.fallen !== false && rnd() < 0.12 });   // fallen: false = a wide open side (a town's sea or cliff side) stays clean, no logs littered across it
  }
  return out;
}
export function geometry(ctx) {
  const g = new G(ctx), L = logs(ctx), lod = ctx.lod || 1, sides = lod >= 4 ? 3 : lod >= 3 ? 4 : 6;
  ctx.albedo(TEX.log); ctx.color("oklch(0.92 0.02 65)"); ctx.smooth();
  for (const l of L) {
    if (l.g && !l.fall) continue;
    const y0 = ctx.groundY(l.x, l.z);
    if (l.fall) { const yaw = -l.a + 90 + (l.lean * 8); g.at({ m: [1, 0, 0, 0, 1, 0, 0, 0, 1], t: [l.x, y0 + l.r, l.z] }, () => { const c = Math.cos(yaw * Math.PI / 180), s = Math.sin(yaw * Math.PI / 180); g.tube([[-c * 1.4, 0, s * 1.4, l.r], [c * 1.4, 0, -s * 1.4, l.r * 0.8], [c * 1.75, 0, -s * 1.75, 0.02]], 6, { capA: true }); }); continue; }
    const ox = Math.cos(l.a * Math.PI / 180) * Math.sin(l.lean * Math.PI / 180), oz = Math.sin(l.a * Math.PI / 180) * Math.sin(l.lean * Math.PI / 180);
    const top = l.h, tip = top + 0.45;
    g.tube([[l.x, y0 - 0.5, l.z, l.r], [l.x + ox * top, y0 + top, l.z + oz * top, l.r * 0.95], [l.x + ox * tip, y0 + tip, l.z + oz * tip, 0.015]], sides, {});
  }
  // two lashing rails, run by run
  ctx.color("oklch(0.9 0.02 60)");
  for (const hy of lod >= 4 ? [] : [0.8, 2.0]) {
    let run = [];
    const flush = () => { if (run.length > 2) g.tube(run, 5, { capA: true, capB: true }); run = []; };
    for (const l of L) { if (l.g || (l.edge && hy > l.h - 0.2)) { flush(); continue; } const R2 = (ctx.params.radius ?? 12.5) - l.r - 0.08; run.push([Math.cos(l.a * Math.PI / 180) * R2, ctx.groundY(l.x, l.z) + hy, Math.sin(l.a * Math.PI / 180) * R2, 0.06]); }
    flush();
  }
  ctx.albedo(null); ctx.color(null); ctx.flat();
}
export function collider(ctx) {
  const g = new G(ctx), L = logs(ctx);
  for (let i = 0; i < L.length; i++) {
    const a = L[i], b = L[(i + 1) % L.length];
    if (a.g || b.g) continue;
    const ya = ctx.groundY(a.x, a.z), yb = ctx.groundY(b.x, b.z);
    g.quad([a.x, ya - 0.6, a.z], [b.x, yb - 0.6, b.z], [b.x, yb + Math.min(a.h, b.h), b.z], [a.x, ya + Math.min(a.h, b.h), a.z]);
  }
}
