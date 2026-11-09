// Highbridge coliseum crowd: one sector of seated spectators along the stand rows, all facing the sand.
// Feet at the arena centre. params: rows [[radius, seatTopY]...], a0/a1 (degrees, atan2(z,x)), seed, fill (0..1).
import { G, X, rng } from "../lib/geo.js";
const TUNICS = ["oklch(0.45 0.12 30)", "oklch(0.5 0.08 140)", "oklch(0.42 0.07 250)", "oklch(0.62 0.1 85)", "oklch(0.38 0.03 60)", "oklch(0.55 0.04 70)", "oklch(0.35 0.08 300)", "oklch(0.7 0.03 90)", "oklch(0.5 0.13 50)"];
const SKIN = ["oklch(0.82 0.05 60)", "oklch(0.7 0.07 55)", "oklch(0.55 0.07 50)", "oklch(0.42 0.05 45)", "oklch(0.78 0.04 70)"];
const HAIR = ["oklch(0.25 0.02 50)", "oklch(0.45 0.07 60)", "oklch(0.7 0.08 85)", "oklch(0.2 0.01 0)", "oklch(0.6 0.02 60)"];
const pick = (R, a) => a[Math.floor(R() * a.length)];
export function geometry(ctx) {
  const g = new G(ctx), P = ctx.params ?? {}, R = rng(7100 + (P.seed ?? 1) * 13), lod = ctx.lod || 1;
  const rows = P.rows ?? [[42, 1.35]], a0 = P.a0 ?? 0, a1 = P.a1 ?? 22.5, fill = (P.fill ?? 0.75) * (lod >= 3 ? 0.5 : 1);
  for (const [r, top] of rows) {
    const span = (a1 - a0) * Math.PI / 180 * r, n = Math.floor(span / 0.95);
    for (let i = 0; i < n; i++) {
      if (R() > fill) continue;
      const th = a0 + (a1 - a0) * (i + 0.5 + (R() - 0.5) * 0.35) / n, t = th * Math.PI / 180;
      const rr = r + (R() - 0.5) * 0.4, x = Math.cos(t) * rr, z = Math.sin(t) * rr;
      const s = 0.88 + R() * 0.22, cheer = R() < 0.3, stand = R() < 0.15;
      const tunic = pick(R, TUNICS), skin = pick(R, SKIN), hair = pick(R, HAIR);
      g.at(X([x, top, z], 90 - th + (R() - 0.5) * 20, 0, 0, s), () => {
        const hip = stand ? 0.85 : 0.45;
        ctx.color("oklch(0.3 0.02 60)");
        if (stand) { g.box(-0.12, 0.42, 0, 0.15, 0.85, 0.18); g.box(0.12, 0.42, 0, 0.15, 0.85, 0.18); }
        else { g.box(0, 0.22, -0.2, 0.4, 0.18, 0.45); g.box(0, 0.08, -0.42, 0.36, 0.3, 0.14); }
        ctx.color(tunic);
        g.box(0, hip + 0.3, 0, 0.44, 0.62, 0.26);
        if (cheer) { g.box(-0.3, hip + 0.82, 0, 0.12, 0.6, 0.12); g.box(0.3, hip + 0.82, 0, 0.12, 0.6, 0.12); }
        else { g.box(-0.28, hip + 0.28, -0.08, 0.11, 0.5, 0.12); g.box(0.28, hip + 0.28, -0.08, 0.11, 0.5, 0.12); }
        ctx.color(skin);
        g.box(0, hip + 0.78, 0, 0.24, 0.27, 0.24);
        if (cheer) { g.box(-0.3, hip + 1.15, 0, 0.1, 0.1, 0.1); g.box(0.3, hip + 1.15, 0, 0.1, 0.1, 0.1); }
        ctx.color(hair);
        g.box(0, hip + 0.94, 0.03, 0.26, 0.07, 0.26);
      });
    }
  }
  ctx.color(null);
}
