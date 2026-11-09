// The Gorse Inn (concept: art-gorse-inn): a heath coaching inn above the Aurenmar salt-marsh where salt carters swap gossip for gin.
// Two storeys: a lime-washed fieldstone ground floor, a half-timbered upper floor, a mossy slate roof, a chimney at each gable.
// A porch hood over the door, the gorse-sprig sign on an iron bracket, benches and barrels at the front, a stone trough and a
// mounting block, an open cart shed on the west with a salt cart loaded with sacks, dry-stone walls, gorse in yellow flower all round.
// Local frame: +X east, +Z south (the track side). Ground (the pad) at local y=0. Door on the south (+Z) wall at x=DX.
import { G, X, rng, TEX, mossyRock } from "../lib/geo.js";
const LIME = "oklch(0.99 0.015 90)", PLASTER = "oklch(0.9 0.025 88)", STONE = "oklch(0.7 0.02 90)", OAK = "oklch(0.36 0.03 55)", SLATE = "oklch(0.62 0.02 120)",
  SHUT = "oklch(0.42 0.09 35)", GLASS = "oklch(0.3 0.03 230)", GORSE = "oklch(0.8 0.15 88)", GORSEG = "oklch(0.5 0.09 130)",
  DIRT = "oklch(0.55 0.05 75)", IRON = "oklch(0.28 0.01 60)", SACK = "oklch(0.78 0.04 85)", WATER = "oklch(0.45 0.04 220)";
const L = 13, W = 8, H1 = 3, H2 = 2.7, EH = H1 + H2, RH = EH + 3.2, OV = 0.6, DX = 1.5;
const both = (g, a, b, c, d) => { g.quad(a, b, c, d); g.quad(a, d, c, b); };
const bothT = (g, a, b, c) => { g.tri(a, b, c); g.tri(a, c, b); };
function gorse(g, ctx, x, z, s, seed, lod) {
  ctx.albedo(null); ctx.color(GORSEG); g.tris(g.blob([x, s * 0.45, z], [s * 1.1, s * 0.6, s], lod <= 2 ? 1 : 0, 0.35, 1.3, seed, 0));
  if (lod <= 3) { ctx.albedo(null); ctx.color(GORSE); const R = rng(seed);
    for (let i = 0; i < (lod <= 2 ? 9 : 4); i++) { const a = R() * 6.283, r = s * (0.5 + R() * 0.5), y = s * (0.5 + R() * 0.55);
      g.box(x + Math.cos(a) * r, y, z + Math.sin(a) * r * 0.9, 0.22 * s, 0.16 * s, 0.22 * s); } }
}
function barrel(g, ctx, x, z, lod) {
  ctx.albedo(TEX.oak); ctx.color("oklch(0.45 0.04 60)");
  g.tube([[x, 0, z, 0.3], [x, 0.45, z, 0.36], [x, 0.9, z, 0.3]], lod <= 2 ? 10 : 7, { capA: true, capB: true });
  ctx.albedo(TEX.iron); ctx.color(IRON); for (const y of [0.18, 0.72]) g.tube([[x, y, z, 0.345], [x, y + 0.05, z, 0.35]], lod <= 2 ? 10 : 7);
}
function bench(g, ctx, x, z) {
  ctx.albedo(TEX.oak); ctx.color("oklch(0.42 0.04 60)");
  g.box(x, 0.45, z, 1.8, 0.07, 0.4); g.box(x, 0.85, z - 0.2, 1.8, 0.3, 0.05);
  for (const sx of [-0.75, 0.75]) { g.box(x + sx, 0.22, z, 0.08, 0.45, 0.36); g.box(x + sx, 0.65, z - 0.2, 0.06, 0.45, 0.06); }
}
export function geometry(ctx) {
  const g = new G(ctx), lod = ctx.lod || 1, R = rng(1688);
  if (lod >= 5) { ctx.color(LIME); g.box(0, EH / 2, 0, L, EH, W); ctx.color(SLATE); g.box(0, EH + 1.5, 0, L + 1, 3, W - 2); ctx.color(null); return; }
  const seg = lod <= 2 ? 10 : 7;
  // ---- ground: the packed track running past, the yard before the door, a rut-worn turn into the cart shed
  ctx.albedo(null); ctx.color(DIRT); g.box(0, 0.015, 11, 60, 0.02, 4.2); g.box(DX, 0.016, 6.8, 7, 0.02, 4.6); g.box(-10, 0.017, 6.5, 6, 0.02, 5);
  ctx.color("oklch(0.47 0.05 70)"); for (const z of [10.1, 11.9]) g.box(0, 0.025, z, 60, 0.012, 0.35);
  // ---- ground floor: lime-washed fieldstone
  ctx.albedo(TEX.fieldstone); ctx.color(LIME);
  g.box(0, H1 / 2, -W / 2 + 0.3, L, H1, 0.6);
  g.box(-L / 2 + 0.3, H1 / 2, 0, 0.6, H1, W - 1.2);
  g.box(L / 2 - 0.3, H1 / 2, 0, 0.6, H1, W - 1.2);
  const wL = (DX - 0.65) - (-L / 2), wR = L / 2 - (DX + 0.65);
  g.box(-L / 2 + wL / 2, H1 / 2, W / 2 - 0.3, wL, H1, 0.6);
  g.box(L / 2 - wR / 2, H1 / 2, W / 2 - 0.3, wR, H1, 0.6);
  g.box(DX, H1 - 0.4, W / 2 - 0.3, 1.3, 0.8, 0.6);
  // a stone plinth course
  ctx.color(STONE); g.box(0, 0.25, W / 2 - 0.25, L + 0.1, 0.5, 0.62); g.box(0, 0.25, -W / 2 + 0.25, L + 0.1, 0.5, 0.62);
  // ---- upper floor: plaster between oak beams, jettied a little over the street
  const J = 0.25; ctx.albedo(null); ctx.color(PLASTER);
  g.box(0, H1 + H2 / 2, W / 2 - 0.15 + J, L, H2, 0.3); g.box(0, H1 + H2 / 2, -W / 2 + 0.15, L, H2, 0.3);
  g.box(-L / 2 + 0.15, H1 + H2 / 2, J / 2, 0.3, H2, W + J); g.box(L / 2 - 0.15, H1 + H2 / 2, J / 2, 0.3, H2, W + J);
  ctx.albedo(TEX.oak); ctx.color(OAK);
  for (const zf of [W / 2 + J + 0.01, -W / 2 - 0.01]) {
    g.box(0, H1 + 0.1, zf, L + 0.2, 0.22, 0.12); g.box(0, EH - 0.08, zf, L + 0.2, 0.18, 0.12);
    for (let i = 0; i <= 6; i++) g.box(-L / 2 + i * L / 6, H1 + H2 / 2, zf, 0.18, H2, 0.12);
    if (lod <= 3) for (const [a, b] of [[0, 1], [5, 6]]) { const x0 = -L / 2 + a * L / 6, x1 = -L / 2 + b * L / 6;
      g.at(X([(x0 + x1) / 2, H1 + H2 / 2, zf], 0, 0, Math.atan2(H2, x1 - x0) * 57.3), () => g.box(0, 0, 0, Math.hypot(H2, x1 - x0), 0.14, 0.1)); }
  }
  g.box(0, H1 + 0.02, W / 2 + J / 2, L, 0.16, J + 0.3); // jetty sill
  // ---- the door, the porch hood, windows with red shutters
  ctx.color("oklch(0.4 0.04 55)"); g.box(DX, 1.05, W / 2 - 0.05, 1.2, 2.1, 0.1);
  ctx.color(OAK); g.box(DX - 0.7, 1.15, W / 2 + 0.02, 0.16, 2.3, 0.16); g.box(DX + 0.7, 1.15, W / 2 + 0.02, 0.16, 2.3, 0.16); g.box(DX, 2.3, W / 2 + 0.02, 1.56, 0.16, 0.16);
  ctx.albedo(TEX.iron); ctx.color(IRON); g.box(DX - 0.25, 1.6, W / 2 + 0.01, 0.7, 0.06, 0.02); g.box(DX - 0.25, 0.5, W / 2 + 0.01, 0.7, 0.06, 0.02); g.box(DX + 0.42, 1.05, W / 2 + 0.03, 0.07, 0.07, 0.05);
  ctx.albedo(TEX.oak); ctx.color(OAK);
  for (const sx of [-1, 1]) { g.box(DX + sx * 0.95, 1.4, W / 2 + 1.0, 0.14, 2.8, 0.14); g.box(DX + sx * 0.95, 2.9, W / 2 + 0.5, 0.12, 0.12, 1.1); }
  ctx.albedo(TEX.slate); ctx.color(SLATE);
  both(g, [DX - 1.25, 2.85, W / 2 + 1.25], [DX + 1.25, 2.85, W / 2 + 1.25], [DX + 1.25, 3.35, W / 2], [DX - 1.25, 3.35, W / 2]);
  // stone step
  ctx.albedo(TEX.flag); ctx.color(STONE); g.box(DX, 0.1, W / 2 + 0.45, 1.6, 0.2, 0.7);
  const win = (x, y, z, f) => { ctx.albedo(null); ctx.color(GLASS); g.box(x, y, z, 0.8, 1.0, 0.06);
    ctx.albedo(TEX.oak); ctx.color(OAK); g.box(x, y - 0.55, z + f * 0.04, 1.0, 0.1, 0.16); g.box(x, y + 0.55, z, 1.0, 0.1, 0.1); g.box(x, y, z + f * 0.02, 0.06, 1.0, 0.04); g.box(x, y, z + f * 0.02, 0.8, 0.06, 0.04);
    ctx.color(SHUT); g.box(x - 0.62, y, z + f * 0.05, 0.38, 1.0, 0.05); g.box(x + 0.62, y, z + f * 0.05, 0.38, 1.0, 0.05); };
  for (const x of [-4.2, 4.6]) win(x, 1.55, W / 2 + 0.01, 1);
  for (const x of [-4.2, DX, 4.6]) win(x, H1 + 1.35, W / 2 + J + 0.02, 1);
  for (const x of [-3.5, 3.5]) win(x, H1 + 1.35, -W / 2 - 0.02, -1);
  // ---- roof: mossy slate, a bound ridge, gables
  const eZ = W / 2 + OV + J / 2, x0 = -L / 2 - 0.4, x1 = L / 2 + 0.4;
  ctx.albedo(TEX.slate); ctx.color(SLATE);
  both(g, [x0, EH, eZ], [x1, EH, eZ], [x1, RH, J / 2], [x0, RH, J / 2]);
  both(g, [x0, EH, -eZ + J], [x1, EH, -eZ + J], [x1, RH, J / 2], [x0, RH, J / 2]);
  ctx.color("oklch(0.45 0.02 100)"); g.tube([[x0, RH + 0.06, J / 2, 0.14], [x1, RH + 0.06, J / 2, 0.14]], 6, { capA: true, capB: true });
  ctx.albedo(null); ctx.color(PLASTER);
  for (const sx of [-1, 1]) bothT(g, [sx * (L / 2 - 0.15), EH, W / 2 + J], [sx * (L / 2 - 0.15), EH, -W / 2], [sx * (L / 2 - 0.15), RH - 0.05, J / 2]);
  ctx.albedo(TEX.oak); ctx.color(OAK);
  for (const sx of [-1, 1]) { const x = sx * (L / 2 + 0.38);
    g.at(X([x, (EH + RH) / 2, (eZ + J / 2) / 2], 0, Math.atan2(RH - EH, eZ - J / 2) * 57.3), () => g.box(0, 0, 0, 0.12, 0.22, Math.hypot(RH - EH, eZ - J / 2) + 0.3));
    g.at(X([x, (EH + RH) / 2, (-eZ + J + J / 2) / 2], 0, -Math.atan2(RH - EH, eZ - J / 2) * 57.3), () => g.box(0, 0, 0, 0.12, 0.22, Math.hypot(RH - EH, eZ - J / 2) + 0.3)); }
  // two chimneys at the gables
  ctx.albedo(TEX.fieldstone); ctx.color(STONE);
  for (const sx of [-1, 1]) { const x = sx * (L / 2 - 1.0); g.box(x, (RH + 1.4) / 2 + 2, J / 2, 1.1, RH - 2.6, 1.1); ctx.color("oklch(0.5 0.02 90)"); g.box(x, RH + 1.1, J / 2, 1.3, 0.2, 1.3); ctx.color(STONE); }
  // ---- the sign: iron bracket off the south-east corner, a painted board with the gorse sprig
  { const bx = L / 2 - 0.4, bz = W / 2 + J + 0.1, by = H1 + 1.6;
    ctx.albedo(TEX.iron); ctx.color(IRON);
    g.tube([[bx, by, bz, 0.04], [bx + 1.5, by, bz + 0.0, 0.035]], 5, { capB: true });
    g.tube([[bx, by - 0.7, bz, 0.03], [bx + 0.9, by - 0.05, bz, 0.03]], 4);
    if (lod <= 3) g.tube([[bx + 0.3, by + 0.05, bz, 0.02], [bx + 0.5, by + 0.3, bz, 0.02], [bx + 0.75, by + 0.2, bz, 0.02], [bx + 0.7, by + 0.05, bz, 0.02]], 3);
    for (const dx of [0.75, 1.35]) g.box(bx + dx, by - 0.12, bz, 0.03, 0.24, 0.03);
    ctx.albedo(TEX.oak); ctx.color("oklch(0.3 0.03 50)"); g.box(bx + 1.05, by - 0.75, bz, 0.95, 1.05, 0.08);
    ctx.albedo(null); ctx.color(GORSE);
    for (const s of [1, -1]) { g.box(bx + 1.05, by - 0.75, bz + s * 0.05, 0.06, 0.6, 0.01);
      for (let i = 0; i < 4; i++) { const y = by - 1.0 + i * 0.14; g.box(bx + 1.05 - 0.13, y + 0.04, bz + s * 0.05, 0.16, 0.08, 0.01); g.box(bx + 1.05 + 0.13, y + 0.04, bz + s * 0.05, 0.16, 0.08, 0.01); }
      ctx.color("oklch(0.75 0.12 85)"); g.box(bx + 1.05, by - 0.75, bz + s * 0.045, 0.85, 0.95, 0.005); ctx.color(GORSE); } }
  // ---- front: benches, barrels, a lantern by the door
  bench(g, ctx, -2.2, W / 2 + 0.6); bench(g, ctx, 4.6, W / 2 + 0.6);
  barrel(g, ctx, 3.0, W / 2 + 0.55, lod); barrel(g, ctx, 3.75, W / 2 + 0.75, lod); barrel(g, ctx, -0.4, W / 2 + 0.55, lod);
  ctx.albedo(TEX.iron); ctx.color(IRON); g.box(DX + 0.85, 2.1, W / 2 + 0.3, 0.05, 0.05, 0.5); g.box(DX + 0.85, 1.85, W / 2 + 0.55, 0.22, 0.32, 0.22);
  ctx.albedo(null); ctx.color("oklch(0.85 0.12 75)"); g.box(DX + 0.85, 1.85, W / 2 + 0.55, 0.16, 0.24, 0.24);
  // ---- trough and mounting block in the yard
  ctx.albedo(TEX.fieldstone); ctx.color(STONE);
  g.box(-5.5, 0.35, 8.2, 2.6, 0.7, 0.18); g.box(-5.5, 0.35, 9.3, 2.6, 0.7, 0.18); g.box(-6.75, 0.35, 8.75, 0.18, 0.7, 1.2); g.box(-4.25, 0.35, 8.75, 0.18, 0.7, 1.2); g.box(-5.5, 0.08, 8.75, 2.4, 0.16, 1.0);
  ctx.albedo(null); ctx.color(WATER); g.box(-5.5, 0.58, 8.75, 2.3, 0.02, 0.92);
  ctx.albedo(TEX.flag); ctx.color(STONE); g.box(5.8, 0.2, 8.4, 1.2, 0.4, 1.0); g.box(5.8, 0.55, 8.15, 1.2, 0.3, 0.5); g.box(5.8, 0.8, 7.95, 1.2, 0.2, 0.3);
  // ---- the cart shed, west: four posts, an open front, a lean-to slate roof onto the inn's gable
  { const cx = -L / 2 - 3.2, cw = 6.2, cd = 6.4, hf = 3.0, hb = 3.8;
    ctx.albedo(TEX.log); ctx.color(OAK);
    for (const px of [cx - cw / 2 + 0.2, cx + cw / 2 - 0.4]) for (const pz of [-cd / 2 + 0.2, cd / 2 - 0.2]) g.box(px, (px < cx ? hf : hb) / 2, pz, 0.22, px < cx ? hf : hb, 0.22);
    g.box(cx - cw / 2 + 0.2, hf, 0, 0.24, 0.24, cd); g.box(cx, (hf + hb) / 2 + 0.1, cd / 2 - 0.2, cw, 0.2, 0.2);
    ctx.albedo(TEX.oak); ctx.color("oklch(0.38 0.03 55)"); g.box(cx, 1.4, -cd / 2 + 0.15, cw, 2.8, 0.12); g.box(cx - cw / 2 + 0.15, 1.3, -1, 0.12, 2.6, cd - 2.2);
    ctx.albedo(TEX.slate); ctx.color(SLATE);
    both(g, [cx - cw / 2 - 0.5, hf, -cd / 2 - 0.3], [cx - cw / 2 - 0.5, hf, cd / 2 + 0.4], [cx + cw / 2, hb + 0.2, cd / 2 + 0.4], [cx + cw / 2, hb + 0.2, -cd / 2 - 0.3]);
    // the salt cart, shafts out to the yard, loaded with sacks
    g.at(X([cx + 0.2, 0, 0.6], -12), () => { ctx.albedo(TEX.oak); ctx.color("oklch(0.45 0.04 60)");
      g.box(0, 0.85, 0, 1.6, 0.1, 3.0); for (const s of [-1, 1]) g.box(s * 0.8, 1.1, 0, 0.08, 0.45, 3.0); g.box(0, 1.1, -1.5, 1.6, 0.45, 0.08);
      for (const s of [-1, 1]) g.tube([[s * 0.35, 0.8, 1.4, 0.05], [s * 0.4, 0.55, 3.4, 0.04]], 5, { capB: true });
      ctx.color("oklch(0.38 0.03 55)");
      for (const s of [-1, 1]) { g.tube([[s * 0.92, 0.55, 0.1, 0.55], [s * 1.0, 0.55, 0.1, 0.55]], lod <= 2 ? 14 : 9, { capA: true, capB: true });
        if (lod <= 3) for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; g.box(s * 0.97, 0.55 + Math.sin(a) * 0.25, 0.1 + Math.cos(a) * 0.25, 0.1, 0.06, 0.06); } }
      g.tube([[-1.0, 0.55, 0.1, 0.06], [1.0, 0.55, 0.1, 0.06]], 5);
      ctx.albedo(TEX.canvas); ctx.color(SACK);
      for (let i = 0; i < (lod <= 2 ? 7 : 4); i++) { const sx = -0.4 + (i % 2) * 0.8, sz = -1.1 + Math.floor(i / 2) * 0.75, sy = i >= 6 ? 1.55 : 1.15;
        g.tris(g.blob([sx, sy, sz], [0.36, 0.22, 0.32], 1, 0.12, 1.5, 40 + i, 0.9)); } });
    // stacked sacks against the back wall
    ctx.albedo(TEX.canvas); ctx.color(SACK);
    for (let i = 0; i < (lod <= 2 ? 5 : 2); i++) g.tris(g.blob([cx + 1.8 - i * 0.7, 0.25 + (i === 4 ? 0.4 : 0), -cd / 2 + 0.7], [0.38, 0.25, 0.3], 1, 0.12, 1.5, 60 + i, 0));
  }
  // ---- dry-stone walls: a field wall east, a yard wall west of the track
  if (lod <= 4) { ctx.albedo(TEX.fieldstone); ctx.color("oklch(0.72 0.02 95)");
    for (const [ax, az, bx, bz] of [[L / 2 + 1.5, 7.5, L / 2 + 14, 7.5], [L / 2 + 14, 7.5, L / 2 + 14, -10], [-L / 2 - 6.5, 8.5, -L / 2 - 16, 8.5], [-L / 2 - 16, 8.5, -L / 2 - 16, -6]]) {
      const len = Math.hypot(bx - ax, bz - az), yaw = -Math.atan2(bz - az, bx - ax) * 57.3;
      g.at(X([(ax + bx) / 2, 0, (az + bz) / 2], yaw), () => { g.box(0, 0.45, 0, len, 0.9, 0.7); ctx.color("oklch(0.6 0.02 95)");
        if (lod <= 3) for (let x = -len / 2 + 0.3; x < len / 2; x += 0.55 + R() * 0.2) g.box(x, 0.98, 0, 0.42, 0.18 + R() * 0.1, 0.22 + R() * 0.2);
        ctx.color("oklch(0.72 0.02 95)"); }); }
    // a waymark post at the track bend, pointing to Aurenmar and the Saint
    ctx.albedo(TEX.log); ctx.color(OAK); g.box(L / 2 + 16, 1.2, 13.5, 0.2, 2.4, 0.2);
    ctx.albedo(TEX.oak); ctx.color("oklch(0.5 0.04 65)"); g.box(L / 2 + 16.5, 2.1, 13.5, 1.1, 0.22, 0.05); g.box(L / 2 + 15.5, 1.75, 13.5, 1.1, 0.22, 0.05); }
  // ---- footing rocks and gorse all round
  if (lod <= 3) for (let i = 0; i < 6; i++) { const s = 0.4 + R() * 0.5, a = R() * 6.283, r = 15 + R() * 8;
    mossyRock(g, [Math.cos(a) * r, s * 0.3, Math.sin(a) * r * 0.8 - 2], [s * 1.5, s, s * 1.2], 1, 700 + i, { rock: TEX.rock, moss: TEX.moss, mossAt: 0.55 }); }
  const bushes = [[-3, 8.6, 1.0], [8.2, 6.2, 1.2], [9.8, 8.4, 0.9], [-14.5, 5, 1.3], [-17, 2, 1.1], [12.5, -6, 1.4], [15, -2, 1.0], [-12, -6.5, 1.2],
    [3, -7.5, 1.0], [-4, -8.5, 1.3], [18, 9.5, 1.1], [-20, 12, 1.4], [22, 14.5, 1.0], [-8, 14.5, 1.2], [6, 15, 1.3], [-24, 3, 1.2], [24, 0, 1.4], [0, -12, 1.5]];
  for (let i = 0; i < (lod <= 2 ? bushes.length : lod === 3 ? 10 : 5); i++) gorse(g, ctx, bushes[i][0], bushes[i][1], bushes[i][2], 900 + i, lod);
  // gorse climbing the west front of the inn, as in the painting
  if (lod <= 3) gorse(g, ctx, -L / 2 + 0.9, W / 2 + 0.6, 0.9, 990, lod);
  ctx.color(null); ctx.albedo(null);
}
export function collider() {
  return [
    { kind: "box", width: L, height: H1, depth: 0.6, center: [0, H1 / 2, -W / 2 + 0.3] },
    { kind: "box", width: 0.6, height: H1, depth: W, center: [-L / 2 + 0.3, H1 / 2, 0] },
    { kind: "box", width: 0.6, height: H1, depth: W, center: [L / 2 - 0.3, H1 / 2, 0] },
    { kind: "box", width: L, height: H1, depth: 0.6, center: [0, H1 / 2, W / 2 - 0.3] },
    { kind: "box", width: L, height: RH - H1, depth: W, center: [0, H1 + (RH - H1) / 2, 0] },
    { kind: "box", width: 2.8, height: 0.7, depth: 1.4, center: [-5.5, 0.35, 8.75] },
    { kind: "box", width: 1.2, height: 0.9, depth: 1.0, center: [5.8, 0.45, 8.2] },
    { kind: "box", width: 6.2, height: 2.8, depth: 0.3, center: [-L / 2 - 3.2, 1.4, -3.05] },
    { kind: "box", width: 2.2, height: 1.6, depth: 3.4, center: [-L / 2 - 3.0, 0.8, 0.6] },
  ];
}
