// The ruined watchtower: a round fieldstone tower, walls 0.8 m thick, broken to jagged crowns from 8 m
// down to 2 m, a breach from the ground at the front (−Z) to walk in by, a corbel band, arrow slits, a
// flagstone floor, rubble spilled through the breach, ivy climbing the north side.
import { G, rng, TEX, mossyRock } from "../lib/geo.js";
const RO = 3.4, RI = 2.6, N = 36, GAP = [270 - 26, 270 + 26]; // angle from +X toward +Z; −Z is 270
const crown = (i) => { const a = (i / N) * 360; if (a > GAP[0] && a < GAP[1]) return 0; const R = rng(i * 7 + 3); const d = Math.min(Math.abs(a - GAP[0]), Math.abs(a - GAP[1])); const ramp = Math.min(1, d / 70); return Math.max(1.4, 1.8 + 6.2 * ramp * (0.8 + 0.2 * Math.cos((a - 90) * Math.PI / 180)) - (R() < 0.3 ? R() * 1.2 : 0)); };
const P = (a, r, y) => [Math.cos(a) * r, y, Math.sin(a) * r];
function walls(g, ctx, solidTop) {
  const lod = ctx.lod || 1, base = -1.6;
  for (let i = 0; i < N; i++) {
    const h = crown(i); if (!h) continue;
    const a0 = (i / N) * 2 * Math.PI, a1 = ((i + 1) / N) * 2 * Math.PI;
    g.quad(P(a0, RO, base), P(a0, RO, h), P(a1, RO, h), P(a1, RO, base));
    g.quad(P(a1, RI, base), P(a1, RI, h), P(a0, RI, h), P(a0, RI, base));
    if (!solidTop) continue;
    g.quad(P(a0, RI, h), P(a1, RI, h), P(a1, RO, h), P(a0, RO, h));
    const hp = crown((i + N - 1) % N), hn = crown((i + 1) % N);
    if (hp < h) g.quad(P(a0, RI, hp > 0 ? hp : base), P(a0, RI, h), P(a0, RO, h), P(a0, RO, hp > 0 ? hp : base));
    if (hn < h) g.quad(P(a1, RO, hn > 0 ? hn : base), P(a1, RO, h), P(a1, RI, h), P(a1, RI, hn > 0 ? hn : base));
  }
}
export function geometry(ctx) {
  const g = new G(ctx), lod = ctx.lod || 1, R = rng(42);
  ctx.albedo(TEX.fieldstone); ctx.color("oklch(0.94 0.01 80)");
  walls(g, ctx, true);
  if (lod <= 3) {
    // corbel band at 3.2 m, and the arrow-slit reveals
    ctx.color("oklch(0.9 0.01 80)");
    for (let i = 0; i < N; i++) { if (crown(i) < 3.5) continue; const a0 = i / N * 6.283, a1 = (i + 1) / N * 6.283, y = 3.1; g.quad(P(a0, RO + 0.15, y), P(a0, RO + 0.15, y + 0.25), P(a1, RO + 0.15, y + 0.25), P(a1, RO + 0.15, y)); g.quad(P(a0, RO, y + 0.25), P(a1, RO, y + 0.25), P(a1, RO + 0.15, y + 0.25), P(a0, RO + 0.15, y + 0.25)); g.quad(P(a1, RO, y), P(a1, RO + 0.15, y), P(a0, RO + 0.15, y), P(a0, RO, y)); }
    ctx.albedo(null); ctx.color("oklch(0.12 0.01 60)");
    for (const deg of [20, 120, 160, 60]) { const a = deg * Math.PI / 180, i = Math.floor(deg / 360 * N); if (crown(i) < 5.5) continue; const d = 0.07; g.quad(P(a - d, RO + 0.01, 4.2), P(a - d, RO + 0.01, 5.2), P(a + d, RO + 0.01, 5.2), P(a + d, RO + 0.01, 4.2)); }
  }
  // floor
  ctx.albedo(TEX.flag); ctx.color("oklch(0.9 0.01 80)");
  for (let i = 0; i < 24; i++) { const a0 = i / 24 * 6.283, a1 = (i + 1) / 24 * 6.283; g.tri([0, 0.06, 0], P(a1, RI + 0.02, 0.06), P(a0, RI + 0.02, 0.06)); }
  // rubble: spilled through the breach and fallen inside
  const nr = lod <= 1 ? 22 : lod <= 3 ? 10 : 4;
  for (let i = 0; i < nr; i++) {
    const inside = i % 3 === 0, a = (270 + (R() - 0.5) * (inside ? 300 : 80)) * Math.PI / 180, r = inside ? 1.2 + R() * 1.2 : RO + 0.3 + R() * 3.2, s = 0.18 + R() * (inside ? 0.25 : 0.45);
    mossyRock(g, [Math.cos(a) * r, s * 0.3, Math.sin(a) * r], [s * 1.3, s, s], lod <= 2 ? 1 : 0, i + 11, { rock: TEX.fieldstone, moss: TEX.moss, mossAt: 0.7, amp: 0.2 });
  }
  // fallen blocks: dressed stones at the foot of the breach
  ctx.albedo(TEX.fieldstone); ctx.color("oklch(0.92 0.01 80)");
  for (let i = 0; i < (lod <= 2 ? 9 : 3); i++) { const a = (250 + R() * 70) * Math.PI / 180, r = RO + 0.6 + R() * 2.8; const yaw = R() * 90; g.at({ m: [Math.cos(yaw), 0, Math.sin(yaw), 0, 1, 0, -Math.sin(yaw), 0, Math.cos(yaw)], t: [Math.cos(a) * r, 0.18, Math.sin(a) * r] }, () => g.box(0, 0, 0, 0.6, 0.36, 0.4)); }
  // ivy: leafy mats hugging the north and east wall
  if (lod <= 3) {
    ctx.albedo(TEX.leaves); ctx.color("oklch(0.9 0.08 135)");
    for (let i = 0; i < (lod <= 1 ? 26 : 12); i++) {
      const deg = 30 + R() * 130, a = deg * Math.PI / 180, ci = Math.floor(deg / 360 * N), y = 0.4 + R() * Math.max(0.5, crown(ci) - 0.8);
      const n = [Math.cos(a), 0, Math.sin(a)], t = [-Math.sin(a), 0, Math.cos(a)];
      const c = P(a, RO + 0.05, y), w = 0.5 + R() * 0.5, h = 0.6 + R() * 0.9;
      g.at({ m: [t[0], 0, n[0], t[1], 1, n[1], t[2], 0, n[2]], t: c }, () => { for (const tr of g.blob([0, 0, 0], [w, h, 0.14], 1, 0.35, 2, i, null)) g.tri(tr[0], tr[1], tr[2]); });
    }
  }
  ctx.albedo(null); ctx.color(null);
}
export function collider(ctx) { const g = new G(ctx); walls(g, ctx, true); for (let i = 0; i < 24; i++) { const a0 = i / 24 * 6.283, a1 = (i + 1) / 24 * 6.283; g.tri([0, 0.06, 0], P(a1, RI + 0.02, 0.06), P(a0, RI + 0.02, 0.06)); } }
