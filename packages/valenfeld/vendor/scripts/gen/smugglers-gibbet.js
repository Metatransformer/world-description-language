// Smugglers' Gibbet (concept: art-smugglers-gibbet): where House Thalor hangs the smugglers it catches, and the smugglers visit.
// A stone cairn mound under a tall smoke-dark oak gibbet, its arm braced, an iron cage hanging empty on a chain; a second
// cage rusted open on the ground. The smugglers' offerings at the foot: brandy bottles, guttered candles, coins hammered
// into the post, a tarred noose on a peg, a warning board. A drystone wall curls round the back, a broken cart wheel
// leans on it, gorse in the gaps. Down the slope a small fieldstone watch hut with a slate roof and a door (warp-in).
// Local frame: +X east, -Z north. Ground (the pad) at local y=0.
import { G, X, rng, TEX, mossyRock } from "../lib/geo.js";
const WOOD = "oklch(0.5 0.03 60)", DARK = "oklch(0.38 0.03 55)", RUST = "oklch(0.42 0.07 45)", IRON = "oklch(0.35 0.01 60)",
  GLASS = "oklch(0.38 0.07 150)", AMBER = "oklch(0.45 0.08 60)", WAX = "oklch(0.9 0.03 90)", COIN = "oklch(0.75 0.09 85)",
  BOARD = "oklch(0.82 0.02 90)", ROPE = "oklch(0.42 0.04 70)", GORSE = "oklch(0.55 0.1 130)", BLOOM = "oklch(0.78 0.15 85)";
const POST = 6.2, ARM = 2.8, BASE = 0.55, HX = -6, HZ = 12;
function beam(g, a, b, r, seg = 6) { g.tube([[...a, r], [...b, r]], seg); }
// a birdcage of iron bands: round top, flat ring bottom, bars between
function cage(g, ctx, c, r, h, bars, open) {
  ctx.albedo(TEX.iron); ctx.color(RUST);
  for (const y of [0, h * 0.5, h]) { const ring = []; for (let i = 0; i <= 12; i++) { const a = i / 12 * Math.PI * 2; ring.push([c[0] + Math.cos(a) * r, c[1] + y, c[2] + Math.sin(a) * r, 0.025]); } g.tube(ring, 4); }
  for (let i = 0; i < bars; i++) { const a = i / bars * Math.PI * 2, x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (open && i < 2) continue;
    g.tube([[c[0] + x, c[1] - (i % 2 ? 0.12 : 0.05), c[2] + z, 0.02], [c[0] + x, c[1] + h, c[2] + z, 0.022], [c[0] + x * 0.4, c[1] + h + r * 0.55, c[2] + z * 0.4, 0.02], [c[0], c[1] + h + r * 0.7, c[2], 0.02]], 4); }
}
export function geometry(ctx) {
  const g = new G(ctx), lod = ctx.lod || 1, R = rng(1892);
  if (lod >= 5) { ctx.color("oklch(0.6 0.02 90)"); g.box(0, 0.3, 0, 4, 0.6, 4); ctx.color(DARK); g.box(0, POST / 2, 0, 0.4, POST, 0.4); ctx.color("oklch(0.7 0.02 90)"); g.box(HX, 1.4, HZ, 4, 2.8, 3.6); ctx.color(null); return; }
  // the cairn mound the post is footed in
  const stones = lod <= 2 ? 14 : 7;
  for (let i = 0; i < stones; i++) { const a = i / stones * Math.PI * 2 + R(), d = 0.9 + R() * 1.1, s = 0.35 + R() * 0.3;
    mossyRock(g, [Math.cos(a) * d, s * 0.5, Math.sin(a) * d], [s * 1.3, s, s * 1.1], lod <= 2 ? 1 : 0, i + 3, { rock: TEX.rock, moss: TEX.moss }); }
  ctx.albedo(TEX.rock); ctx.color("oklch(0.62 0.01 90)"); g.box(0, BASE / 2, 0, 1.6, BASE, 1.6);
  // the gibbet: post, arm, brace, chain, the hanging cage
  ctx.albedo(TEX.oak); ctx.color(DARK);
  g.box(0, BASE + POST / 2, 0, 0.42, POST, 0.42);
  g.box(ARM / 2 - 0.25, BASE + POST - 0.2, 0, ARM + 0.4, 0.32, 0.3);
  g.at(X([0.75, BASE + POST - 1.05, 0], 0, 0, 45), () => g.box(0, 0, 0, 1.9, 0.2, 0.22));
  if (lod <= 3) for (const y of [BASE + POST - 0.2]) for (const s of [-1, 1]) { ctx.albedo(TEX.iron); ctx.color(IRON); g.box(0, y, s * 0.17, 0.5, 0.36, 0.02); }
  const hx = ARM - 0.25, top = BASE + POST - 0.36;
  ctx.albedo(TEX.iron); ctx.color(IRON);
  const links = lod <= 2 ? 6 : 3, ch = 1.1;
  for (let i = 0; i < links; i++) { const y = top - (i + 0.5) * ch / links; g.at(X([hx, y, 0], i * 90), () => g.tube([[0, ch / links / 2, 0, 0.018], [0.05, 0, 0, 0.018], [0, -ch / links / 2, 0, 0.018], [-0.05, 0, 0, 0.018], [0, ch / links / 2, 0, 0.018]], 4)); }
  cage(g, ctx, [hx, top - ch - 1.95, 0], 0.42, 1.55, lod <= 2 ? 10 : 6, false);
  // the fallen cage, rusted open on its side west of the mound
  g.at(X([-2.3, 0.42, 1.3], 30, 0, 90), () => cage(g, ctx, [0, -0.75, 0], 0.4, 1.4, lod <= 2 ? 10 : 6, true));
  // warning board nailed to the post, facing the road (south): pale board, a black skull-and-bones daub
  ctx.albedo(TEX.oak); ctx.color(BOARD); g.box(0, BASE + 3.2, 0.24, 0.9, 1.0, 0.05);
  ctx.albedo(null); ctx.color("oklch(0.18 0.01 60)");
  g.box(0, BASE + 3.35, 0.27, 0.32, 0.3, 0.01); g.box(0, BASE + 3.17, 0.27, 0.2, 0.1, 0.01);
  for (const s of [-1, 1]) g.at(X([0, BASE + 2.95, 0.27], 0, 0, s * 35), () => g.box(0, 0, 0, 0.62, 0.07, 0.01));
  ctx.color(BOARD); for (const s of [-1, 1]) g.box(s * 0.07, BASE + 3.37, 0.275, 0.08, 0.08, 0.01);
  // coins hammered into the post, thickest at hand height
  if (lod <= 3) { ctx.albedo(null); ctx.color(COIN);
    const n = lod <= 2 ? 46 : 18; for (let i = 0; i < n; i++) { const y = BASE + 0.6 + Math.pow(R(), 1.6) * 2.2, side = Math.floor(R() * 4), o = (R() - 0.5) * 0.34;
      const p = [[o, y, 0.215], [0.215, y, o], [o, y, -0.215], [-0.215, y, o]][side]; g.box(p[0], p[1], p[2], side % 2 ? 0.01 : 0.06, 0.06, side % 2 ? 0.06 : 0.01); } }
  // the tarred noose on its peg
  ctx.albedo(TEX.oak); ctx.color(DARK); beam(g, [-0.21, BASE + 2.6, 0], [-0.45, BASE + 2.62, 0], 0.035);
  ctx.albedo(null); ctx.color(ROPE);
  g.tube([[-0.42, BASE + 2.62, 0, 0.03], [-0.47, BASE + 2.2, 0.02, 0.03], [-0.45, BASE + 1.8, 0, 0.03]], 5);
  if (lod <= 3) { const ring = []; for (let i = 0; i <= 10; i++) { const a = i / 10 * Math.PI * 2; ring.push([-0.45 + Math.sin(a) * 0.14, BASE + 1.6 + Math.cos(a) * 0.2, 0, 0.026]); } g.tube(ring, 4); }
  // offerings on the flat stone at the foot (south side): bottles, candles, coins in a heap
  ctx.albedo(TEX.rock); ctx.color("oklch(0.66 0.01 90)"); g.box(0.2, BASE + 0.05, 1.05, 1.5, 0.12, 0.7);
  if (lod <= 3) {
    const bottles = [[-0.35, 1.0, GLASS, 0.34], [-0.1, 1.15, AMBER, 0.3], [0.5, 0.95, GLASS, 0.26], [0.25, 1.25, GLASS, 0.36]];
    ctx.albedo(null); for (const [x, z, c, h] of bottles) { ctx.color(c); const y = BASE + 0.11;
      g.tube([[x, y, z, 0.045], [x, y + h * 0.7, z, 0.045], [x, y + h * 0.82, z, 0.018], [x, y + h, z, 0.016]], 6, { capA: true, capB: true }); }
    ctx.color(GLASS); g.at(X([0.95, BASE - 0.05, 1.6], 70, 0, 90), () => g.tube([[0, -0.15, 0, 0.045], [0, 0.1, 0, 0.045], [0, 0.18, 0, 0.018]], 6, { capA: true, capB: true }));
    for (const [x, z, h] of [[0.8, 0.85, 0.16], [0.65, 1.25, 0.1], [-0.6, 1.2, 0.13]]) { ctx.color(WAX); g.tube([[x, BASE + 0.11, z, 0.04], [x, BASE + 0.11 + h, z, 0.038]], 6, { capB: true });
      ctx.color("oklch(0.25 0.01 60)"); g.box(x, BASE + 0.13 + h, z, 0.006, 0.03, 0.006); }
    ctx.color(COIN); for (let i = 0; i < 9; i++) g.box(0.05 + (R() - 0.5) * 0.3, BASE + 0.12 + i * 0.012, 0.8 + (R() - 0.5) * 0.15, 0.05, 0.012, 0.05);
  }
  // drystone wall curling round the north side of the rise
  ctx.albedo(TEX.fieldstone); ctx.color("oklch(0.78 0.02 100)");
  const segs = 10; for (let i = 0; i < segs; i++) { const a0 = Math.PI * (0.95 + i * 1.1 / segs), a1 = Math.PI * (0.95 + (i + 1) * 1.1 / segs), r = 4.2 + (i % 3) * 0.15;
    const p0 = [Math.cos(a0) * r, Math.sin(a0) * r], p1 = [Math.cos(a1) * r, Math.sin(a1) * r], mx = (p0[0] + p1[0]) / 2, mz = (p0[1] + p1[1]) / 2;
    const len = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) + 0.1, yaw = -Math.atan2(p1[1] - p0[1], p1[0] - p0[0]) * 180 / Math.PI, h = i === 6 ? 0.45 : 0.9 + (i % 2) * 0.1;
    g.at(X([mx, h / 2, mz], yaw), () => g.box(0, 0, 0, len, h, 0.7)); }
  if (lod <= 2) for (let i = 0; i < 6; i++) { const a = Math.PI * (1.0 + i * 0.18); mossyRock(g, [Math.cos(a) * 4.3, 1.0, Math.sin(a) * 4.3], [0.32, 0.18, 0.28], 0, 40 + i, { rock: TEX.rock, moss: TEX.moss }); }
  // the broken cart wheel leaning on the wall, east end
  { const wc = [2.6, 0.62, -3.1]; g.at(X(wc, -40, 0, 18), () => { ctx.albedo(TEX.oak); ctx.color(WOOD);
      const rim = []; for (let i = 0; i <= 16; i++) { const a = i / 16 * Math.PI * 1.75; rim.push([Math.cos(a) * 0.62, Math.sin(a) * 0.62, 0, 0.05]); } g.tube(rim, 5);
      ctx.color(DARK); g.tube([[0, 0, -0.1, 0.1], [0, 0, 0.1, 0.1]], 8, { capA: true, capB: true });
      ctx.color(WOOD); for (let i = 0; i < (lod <= 2 ? 10 : 5); i++) { if (i === 7) continue; const a = i / 10 * Math.PI * 2; beam(g, [0, 0, 0], [Math.cos(a) * 0.6, Math.sin(a) * 0.6, 0], 0.025, 4); } }); }
  // gorse clumps tucked against the wall and mound
  if (lod <= 3) { const clumps = [[-3.2, -1.8], [-1.5, -3.6], [3.6, -1.4], [-3.6, 1.6], [2.2, 2.6], [1.0, -3.8]];
    for (const [x, z] of clumps) { const s = 0.6 + R() * 0.4; ctx.smooth(); ctx.albedo(TEX.needles); ctx.color(GORSE); g.tris(g.blob([x, s * 0.5, z], [s * 1.2, s * 0.8, s], 1, 0.4, 1.6, x * 3 + z).map((t) => t));
      if (lod <= 2) { ctx.albedo(null); ctx.color(BLOOM); for (let k = 0; k < 7; k++) { const a = R() * 6.28, rr = s * (0.6 + R() * 0.5); g.box(x + Math.cos(a) * rr, s * (0.5 + R() * 0.6), z + Math.sin(a) * rr * 0.85, 0.12, 0.08, 0.12); } }
      ctx.flat(); } }
  // the watch hut down the slope, south-east: fieldstone, slate pyramid roof, chimney, a door facing the gibbet
  { const cx = HX, cz = HZ, w = 4.2, d = 3.8, eave = 2.5, ridge = 4.1, t = 0.45;
    ctx.albedo(TEX.fieldstone); ctx.color("oklch(0.82 0.02 100)");
    g.box(cx, eave / 2, cz + d / 2 - t / 2, w, eave, t); g.box(cx - w / 2 + t / 2, eave / 2, cz, t, eave, d); g.box(cx + w / 2 - t / 2, eave / 2, cz, t, eave, d);
    g.box(cx - 1.25, eave / 2, cz - d / 2 + t / 2, w - 2.5 + 0.05 + 0.75, eave, t); g.box(cx + 1.6, eave / 2, cz - d / 2 + t / 2, 1.0, eave, t); g.box(cx + 0.5, eave - 0.3, cz - d / 2 + t / 2, 1.2, 0.6, t);
    ctx.albedo(TEX.oak); ctx.color(DARK); g.box(cx + 0.5, 1.0, cz - d / 2 + t / 2 + 0.05, 1.0, 2.0, 0.08);
    if (lod <= 3) { ctx.albedo(TEX.iron); ctx.color(IRON); for (const y of [0.45, 1.55]) g.box(cx + 0.3, y, cz - d / 2 + 0.17, 0.6, 0.05, 0.02); ctx.albedo(null); ctx.color("oklch(0.15 0.01 60)"); g.box(cx + w / 2 + 0.01, 1.5, cz, 0.02, 0.5, 0.5); }
    ctx.albedo(TEX.slate); ctx.color("oklch(0.72 0.04 130)");
    const ex = w / 2 + 0.35, ez = d / 2 + 0.35, ap = [cx, ridge, cz];
    g.tri([cx - ex, eave, cz - ez], ap, [cx + ex, eave, cz - ez]); g.tri([cx + ex, eave, cz - ez], ap, [cx + ex, eave, cz + ez]);
    g.tri([cx + ex, eave, cz + ez], ap, [cx - ex, eave, cz + ez]); g.tri([cx - ex, eave, cz + ez], ap, [cx - ex, eave, cz - ez]);
    ctx.albedo(TEX.fieldstone); ctx.color("oklch(0.7 0.02 100)"); g.box(cx - 1.3, ridge - 0.3, cz + 0.9, 0.6, 1.6, 0.6);
    ctx.albedo(TEX.oak); ctx.color(WOOD); g.box(cx + w / 2 + 0.7, 0.5, cz + 0.8, 0.9, 1.0, 1.4); // woodpile
    if (lod <= 2) { ctx.color(DARK); for (let i = 0; i < 4; i++) beam(g, [cx + w / 2 + 0.3, 1.05 + i * 0.03, cz + 0.2 + i * 0.35], [cx + w / 2 + 1.1, 1.05 + i * 0.03, cz + 0.25 + i * 0.35], 0.08); }
  }
  ctx.albedo(null); ctx.color(null);
}
export function collider() {
  return [
    { kind: "box", width: 1.7, height: 0.6, depth: 1.7, center: [0, 0.3, 0] },
    { kind: "box", width: 0.42, height: POST, depth: 0.42, center: [0, BASE + POST / 2, 0] },
    { kind: "box", width: 4.2, height: 2.5, depth: 0.45, center: [HX, 1.25, HZ + 1.9 - 0.225] },
    { kind: "box", width: 0.45, height: 2.5, depth: 3.8, center: [HX - 1.875, 1.25, HZ] },
    { kind: "box", width: 0.45, height: 2.5, depth: 3.8, center: [HX + 1.875, 1.25, HZ] },
    { kind: "box", width: 4.2, height: 2.5, depth: 0.45, center: [HX, 1.25, HZ - 1.9 + 0.225] },
  ];
}
