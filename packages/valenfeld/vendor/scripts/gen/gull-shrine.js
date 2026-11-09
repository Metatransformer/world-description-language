// The Gull Shrine: a sea shrine on the Gullhaven shore where the gulls take the offerings and the temple calls it accepted
// (concept: art-gull-shrine). A slate-roofed fieldstone niche holding a carved gull idol, a lichened offering table with
// a stone basin and fish heads, a plank sign painted ACCEPTED, driftwood rag-poles hung with bleached cloth and bones,
// guano streaks everywhere, a flagstone path up from the beach, and gulls perched on every post.
// Local frame: the niche opens to -Z; the path comes up from -Z.
import { G, rng, TEX, mossyRock } from "../lib/geo.js";
const STONE = "oklch(0.86 0.02 100)", WHITE = "oklch(0.96 0.005 90)", GREY = "oklch(0.7 0.01 240)", BEAK = "oklch(0.8 0.15 85)";
const yawM = (a) => [Math.cos(a), 0, Math.sin(a), 0, 1, 0, -Math.sin(a), 0, Math.cos(a)];
function gull(g, ctx, x, y, z, yaw, s = 1) {   // a perched gull, ~0.45 m long
  g.at({ m: yawM(yaw).map((v) => v * s), t: [x, y, z] }, () => {
    ctx.albedo(null); ctx.color(WHITE); ctx.smooth?.();
    g.tube([[0, 0.14, 0.22, 0.01], [0, 0.15, 0.12, 0.07], [0, 0.17, -0.04, 0.09], [0, 0.2, -0.14, 0.06], [0, 0.22, -0.18, 0.001]], 6);
    g.tube([[0, 0.24, -0.12, 0.001], [0, 0.27, -0.16, 0.055], [0, 0.29, -0.22, 0.05], [0, 0.29, -0.26, 0.001]], 6);
    ctx.color(GREY); for (const sd of [-1, 1]) g.box(sd * 0.075, 0.2, 0.06, 0.03, 0.08, 0.3);
    ctx.color("oklch(0.25 0.01 240)"); g.box(0, 0.2, 0.22, 0.08, 0.03, 0.1);
    ctx.color(BEAK); g.box(0, 0.285, -0.3, 0.025, 0.025, 0.08);
    ctx.color("oklch(0.7 0.1 50)"); for (const sd of [-1, 1]) g.box(sd * 0.03, 0.05, 0, 0.015, 0.1, 0.015);
    ctx.flat?.();
  });
}
export function geometry(ctx) {
  const g = new G(ctx), lod = ctx.lod || 1, R = rng(9127);
  if (lod >= 5) { ctx.color(STONE); g.box(0, 1.4, 1.2, 2.2, 2.8, 1.8); g.box(0, 0.5, -1.6, 2.4, 1, 1); ctx.color(null); return; }
  // the niche: three fieldstone walls, open to -Z, under a mossy slate gable
  ctx.albedo(TEX.fieldstone); ctx.color(STONE);
  g.box(0, 0.35, 1.2, 2.4, 0.7, 2.0);                               // plinth
  g.box(-0.95, 1.6, 1.2, 0.4, 1.9, 1.8); g.box(0.95, 1.6, 1.2, 0.4, 1.9, 1.8); g.box(0, 1.6, 1.95, 1.5, 1.9, 0.3);
  for (const s of [-1, 1]) { const x = s * 1.2; g.tri([x, 2.55, 0.25], [x, 2.55, 2.15], [x, 3.3, 1.2]); g.tri([x, 2.55, 2.15], [x, 2.55, 0.25], [x, 3.3, 1.2]); }
  ctx.albedo(TEX.slate); ctx.color("oklch(0.78 0.04 130)");
  for (const [sd, zc] of [[-1, 0.66], [1, 1.74]]) { const a = sd * 0.67, c = Math.cos(a), sn = Math.sin(a);
    g.at({ m: [1, 0, 0, 0, c, -sn, 0, sn, c], t: [0, 2.94, zc] }, () => g.box(0, 0, 0, 2.7, 0.1, 1.35)); }
  ctx.albedo(TEX.oak); ctx.color("oklch(0.6 0.02 60)"); g.box(0, 2.55, 0.2, 2.2, 0.16, 0.16); g.box(0, 3.36, 1.2, 2.8, 0.14, 0.14);
  // the idol: a stone gull, wings half folded, crusted white
  ctx.albedo(TEX.rock); ctx.color("oklch(0.75 0.01 90)"); ctx.smooth?.();
  g.tube([[0, 0.7, 1.4, 0.24], [0, 1.05, 1.35, 0.32], [0, 1.45, 1.2, 0.28], [0, 1.75, 1.05, 0.17], [0, 1.95, 0.95, 0.15], [0, 2.1, 0.92, 0.001]], 8);
  g.box(0, 1.92, 0.75, 0.08, 0.06, 0.22);
  for (const s of [-1, 1]) g.box(s * 0.3, 1.25, 1.3, 0.1, 0.55, 0.5);
  ctx.flat?.();
  // offering bones and fish heads on the niche ledge
  ctx.albedo(null);
  for (let i = 0; i < (lod <= 1 ? 8 : 3); i++) { ctx.color(i % 2 ? "oklch(0.88 0.02 90)" : "oklch(0.6 0.05 40)"); g.box(-0.5 + R() * 1.0, 0.74, 0.35 + R() * 0.3, 0.12, 0.05, 0.06); }
  // the offering table on two stone legs, with its basin
  ctx.albedo(TEX.fieldstone); ctx.color(STONE);
  g.box(-0.85, 0.42, -1.6, 0.5, 0.84, 0.8); g.box(0.85, 0.42, -1.6, 0.5, 0.84, 0.8); g.box(0, 0.94, -1.6, 2.6, 0.22, 1.0);
  ctx.albedo(TEX.rock); ctx.color("oklch(0.55 0.01 240)");
  g.tube([[0, 1.05, -1.6, 0.18], [0, 1.1, -1.6, 0.34], [0, 1.24, -1.6, 0.4], [0, 1.2, -1.6, 0.3], [0, 1.1, -1.6, 0.001]], 10);
  ctx.albedo(null);
  if (lod <= 2) { for (let i = 0; i < 7; i++) { ctx.color(i % 3 ? "oklch(0.62 0.06 45)" : "oklch(0.7 0.03 230)"); const a = R() * 6.28; g.box(Math.cos(a) * (0.5 + R() * 0.6), 1.08, -1.6 + Math.sin(a) * 0.3, 0.16, 0.06, 0.08); } }
  // the sign under the table edge: ACCEPTED, white letters on grey plank (strokes)
  ctx.albedo(TEX.oak); ctx.color("oklch(0.62 0.02 70)"); g.box(0, 0.6, -2.13, 1.5, 0.36, 0.05);
  if (lod <= 2) { ctx.albedo(null); ctx.color(WHITE); ctx.emissive?.("oklch(0.5 0 0)", 0.1);
    const L = { A: [[0, 0, 0.5, 1], [1, 0, 0.5, 1], [0.25, 0.45, 0.75, 0.45]], C: [[1, 1, 0, 1], [0, 1, 0, 0], [0, 0, 1, 0]], E: [[1, 1, 0, 1], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0.5, 0.8, 0.5]], P: [[0, 0, 0, 1], [0, 1, 1, 1], [1, 1, 1, 0.5], [1, 0.5, 0, 0.5]], T: [[0, 1, 1, 1], [0.5, 1, 0.5, 0]], D: [[0, 0, 0, 1], [0, 1, 0.8, 0.8], [0.8, 0.8, 0.8, 0.2], [0.8, 0.2, 0, 0]] };
    const W = 0.13, H = 0.2, gap = 0.04, word = "ACCEPTED", x0 = -(word.length * (W + gap)) / 2;
    [...word].forEach((ch, i) => { for (const [a, b, c, d] of L[ch]) { const ax = -(x0 + i * (W + gap) + a * W), ay = 0.5 + b * H, bx = -(x0 + i * (W + gap) + c * W), by = 0.5 + d * H;
      const len = Math.hypot(bx - ax, by - ay), ang = Math.atan2(by - ay, bx - ax);
      g.at({ m: [Math.cos(ang), -Math.sin(ang), 0, Math.sin(ang), Math.cos(ang), 0, 0, 0, 1], t: [(ax + bx) / 2, (ay + by) / 2, -2.16] }, () => g.box(0, 0, 0, len + 0.02, 0.025, 0.01)); } });
    ctx.emissive?.(null); }
  // guano: white streaks down the plinth, table and walls
  if (lod <= 2) { ctx.albedo(null); ctx.color(WHITE);
    for (let i = 0; i < 14; i++) { const onT = i < 6, x = (R() - 0.5) * (onT ? 2.4 : 2.2), h = 0.15 + R() * 0.4;
      if (onT) g.box(x, 1.05 - h / 2, -2.11, 0.04 + R() * 0.04, h, 0.01); else g.box(x, 0.7 - h / 2, 0.19, 0.04 + R() * 0.05, h, 0.01); } }
  // driftwood rag-poles with crossbars, bleached cloth and strung bones
  const POLES = [[-2.6, 0.2, 4.2], [-2.0, 2.6, 4.8], [2.4, 1.6, 3.9], [2.9, -1.0, 3.4]];
  for (const [x, z, h] of POLES) {
    ctx.albedo(TEX.log); ctx.color("oklch(0.85 0.01 80)"); g.tube([[x, -0.3, z, 0.13], [x + 0.05, h * 0.5, z, 0.11], [x - 0.04, h, z, 0.08]], 6);
    g.box(x, h - 0.4, z, 0.9, 0.08, 0.08);
    ctx.albedo(TEX.canvas); ctx.color("oklch(0.9 0.01 90)"); g.box(x - 0.25, h - 1.1, z, 0.35, 1.3, 0.02); g.box(x + 0.25, h - 0.9, z, 0.3, 0.9, 0.02);
    ctx.albedo(null); ctx.color("oklch(0.9 0.02 90)"); for (let k = 0; k < 4; k++) g.box(x + 0.4, h - 0.6 - k * 0.2, z, 0.04, 0.12, 0.04);
    gull(g, ctx, x - 0.04, h, z, R() * 6.28);
  }
  // gulls squabbling on the table and roof
  gull(g, ctx, 0.75, 1.05, -1.5, 2.5); gull(g, ctx, -0.9, 1.05, -1.75, -0.4, 1.1); gull(g, ctx, 0, 3.3, 1.2, 1.2);
  if (lod <= 2) { gull(g, ctx, -1.6, 0, -3.1, 0.8); gull(g, ctx, 1.9, 0, -2.6, -2.0); }
  // the flagstone path down toward the beach, and shore rocks around
  ctx.albedo(TEX.flag); ctx.color("oklch(0.82 0.02 90)");
  for (let i = 0; i < 9; i++) { const z = -2.8 - i * 0.9, x = Math.sin(i * 0.6) * 0.6; g.box(x + (R() - 0.5) * 0.2, 0.03, z, 0.9 + R() * 0.3, 0.1, 0.6 + R() * 0.2); }
  if (lod <= 3) for (let i = 0; i < (lod <= 1 ? 12 : 5); i++) { const a = R() * 6.28, r = 3.6 + R() * 3, k = 0.35 + R() * 0.55;
    if (Math.abs(Math.cos(a)) < 0.35 && Math.sin(a) < 0) continue;
    mossyRock(g, [Math.cos(a) * r, 0, Math.sin(a) * r * 0.9], [k * 1.3, k * 0.7, k], R() * 3, 300 + i, { rock: TEX.rock, moss: TEX.moss, floor: -0.4 }); }
  ctx.albedo(null); ctx.color(null);
}
export function collider() {
  return [
    { kind: "box", width: 2.4, height: 3.0, depth: 2.0, center: [0, 1.5, 1.2] },
    { kind: "box", width: 2.6, height: 1.05, depth: 1.0, center: [0, 0.52, -1.6] },
  ];
}
