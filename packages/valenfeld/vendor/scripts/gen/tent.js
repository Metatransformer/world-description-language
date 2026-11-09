// A bandit lean-to: two forked poles and a ridge pole at the open front (−Z), patched canvas sagging
// back to the ground, side flaps, staked hem, a bedroll inside.
import { G, TEX } from "../lib/geo.js";
export function geometry(ctx) {
  const g = new G(ctx), W = 3.2, H = 2.1, D = 2.8, lod = ctx.lod || 1;
  ctx.smooth(); ctx.albedo(TEX.log); ctx.color("oklch(0.9 0.02 60)");
  for (const x of [-W / 2, W / 2]) g.tube([[x, -0.3, -D / 2, 0.06], [x, H + 0.15, -D / 2, 0.05]], 6, { capB: true });
  g.tube([[-W / 2 - 0.3, H, -D / 2, 0.055], [W / 2 + 0.3, H, -D / 2, 0.05]], 6, { capA: true, capB: true });
  ctx.flat(); ctx.albedo(TEX.canvas);
  const rows = lod <= 2 ? 6 : 2, cols = lod <= 2 ? 8 : 3, P = [];
  for (let r = 0; r <= rows; r++) { const t = r / rows, row = []; for (let c = 0; c <= cols; c++) { const u = c / cols, x = -W / 2 - 0.15 + (W + 0.3) * u; const sag = Math.sin(Math.PI * u) * Math.sin(Math.PI * t) * 0.18; row.push([x, H * (1 - t) - sag + 0.06, -D / 2 + D * t]); } P.push(row); }
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { ctx.color((r * 3 + c * 5) % 7 === 0 ? "oklch(0.86 0.05 70)" : "oklch(0.95 0.025 85)"); g.quad(P[r][c], P[r][c + 1], P[r + 1][c + 1], P[r + 1][c]); }
  ctx.color("oklch(0.9 0.03 80)");
  for (const s of [-1, 1]) { const x = s * (W / 2 + 0.05); g.tri([x, H - 0.1, -D / 2 + 0.05], [x, 0, -D / 2 + 0.6], [x, 0, D / 2]); }
  // hem flap at the front
  ctx.color("oklch(0.88 0.04 75)");
  for (let c = 0; c < 6; c++) { const x0 = -W / 2 + (W / 6) * c, x1 = x0 + W / 6 - 0.04; g.quad([x0, H + 0.06, -D / 2 - 0.02], [x1, H + 0.06, -D / 2 - 0.02], [x1, H - 0.3, -D / 2 - 0.06], [x0, H - 0.3, -D / 2 - 0.06]); }
  // bedroll and pack
  ctx.albedo(null); ctx.smooth(); ctx.color("oklch(0.42 0.09 35)");
  g.tube([[-0.9, 0.12, 0.2, 0.0], [-0.9, 0.12, 0.25, 0.14], [0.6, 0.12, 0.25, 0.14], [0.6, 0.12, 0.3, 0.0]], 8);
  ctx.color("oklch(0.5 0.06 70)");
  for (const t of g.blob([1.0, 0.25, 0.5], [0.3, 0.28, 0.22], 1, 0.15, 1.5, 2, -0.2)) g.tri(t[0], t[1], t[2]);
  ctx.color(null); ctx.flat();
}
export function collider() { return [{ kind: "cylinder", radiusTop: 0.07, radiusBottom: 0.07, height: 2.2, center: [-1.6, 1.1, -1.4] }, { kind: "cylinder", radiusTop: 0.07, radiusBottom: 0.07, height: 2.2, center: [1.6, 1.1, -1.4] }, { kind: "box", width: 3.2, height: 0.9, depth: 1.0, center: [0, 0.45, 1.0] }]; }
