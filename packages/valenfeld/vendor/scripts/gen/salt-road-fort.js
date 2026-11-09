// The Old Salt Road Fort (concept: art-salt-road-fort): a toll fort from the salt wars, its gate long stolen.
// A square dry-stone enclosure (24 x 24 m) with walls crumbled to a jagged top, an empty gateway on the south face with
// only rusted hinge pins in the jambs, the old road running through it north-south in two muddy ruts. A squat corner
// tower (NW) roofless with its beams fallen in, a toll-house (NE) with half its slate roof collapsed and a chimney still
// standing, a broken toll bar on a post across the road outside the gate with a hanging chain, a salt-cart axle on its
// wheels in the gorse, and a travellers' firepit with log seats inside the walls.
// Local frame: +X east, -Z north; the south gate opens on +Z. Ground (the pad) at y=0.
import { G, X, rng, TEX, mossyRock } from "../lib/geo.js";
const ST = "oklch(0.68 0.015 100)", ST2 = "oklch(0.6 0.02 110)", MOSS = "oklch(0.5 0.08 125)", OAK = "oklch(0.42 0.03 60)", OAKD = "oklch(0.32 0.025 55)",
  SLATE = "oklch(0.4 0.025 250)", RUST = "oklch(0.42 0.08 45)", MUD = "oklch(0.4 0.035 65)", POOL = "oklch(0.55 0.04 235)", GORSE = "oklch(0.55 0.1 130)", BLOOM = "oklch(0.8 0.15 90)", HEATH = "oklch(0.5 0.08 330)";
const H = 12; // half-size of the enclosure
const T = 0.9; // wall thickness
export function wallRun(g, R, a, b, hMin, hMax, gaps = []) {
  const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz), yaw = Math.atan2(dx, dz) * 180 / Math.PI, n = Math.max(1, Math.round(L / 1.1));
  for (let i = 0; i < n; i++) { const t0 = i / n, t1 = (i + 1) / n, tm = (t0 + t1) / 2, s = tm * L;
    if (gaps.some(([g0, g1]) => s > g0 && s < g1)) continue;
    const h = hMin + R() * (hMax - hMin), x = a[0] + dx * tm, z = a[1] + dz * tm;
    g.at(X([x, 0, z], yaw), () => { g.box(0, h / 2, 0, T, h, L / n + 0.02);
      // a capstone or two, the odd dislodged block
      if (R() < 0.5) g.box((R() - 0.5) * 0.2, h + 0.12, 0, T * 0.8, 0.24, L / n * 0.6); }); }
}
export function geometry(ctx) {
  const g = new G(ctx), lod = ctx.lod || 1, R = rng(1811);
  if (lod >= 5) { ctx.color(ST); g.box(0, 1, -H, 2 * H, 2, T); g.box(-H, 1, 0, T, 2, 2 * H); g.box(H, 1, 0, T, 2, 2 * H); g.box(-H + 3, 4, -H + 3, 6, 8, 6); g.box(H - 4, 2, -H + 3.5, 7, 4, 6); ctx.color(null); return; }
  // the road: two muddy ruts through the gate and out the north breach, puddles in them
  ctx.albedo(null); ctx.color(MUD); g.box(0, 0.015, 4, 4.2, 0.03, 2 * H + 22);
  ctx.color("oklch(0.34 0.03 60)"); for (const x of [-0.85, 0.85]) g.box(x, 0.035, 4, 0.5, 0.02, 2 * H + 22);
  ctx.color(POOL); for (const [x, z, l] of [[-0.85, 9, 1.6], [0.85, 14.5, 2.2], [-0.85, 19, 1.2], [0.85, -3, 1.4]]) g.box(x, 0.05, z, 0.42, 0.02, l);
  // the curtain walls, crumbled; south gateway and a north breach where the road leaves
  ctx.albedo(TEX.rock); ctx.color(ST);
  wallRun(g, R, [-H, H], [H, H], 1.4, 3.2, [[H - 2.2, H + 2.2]]);       // south (gate at the middle)
  wallRun(g, R, [-H, -H], [H, -H], 0.6, 2.8, [[H - 3, H + 3.5]]);      // north (breach)
  ctx.color(ST2); wallRun(g, R, [-H, -H], [-H, H], 1.2, 3.4, [[15, 18]]); // west, a slump
  wallRun(g, R, [H, -H], [H, H], 0.9, 3.0);                               // east
  // the gate jambs: squared ashlar piers, rusted hinge pins, no gate
  ctx.color(ST); for (const s of [-1, 1]) { const x = s * 2.6; g.box(x, 1.9, H, 1.3, 3.8, 1.3); g.box(x, 3.9, H, 1.45, 0.25, 1.45);
    ctx.albedo(TEX.iron); ctx.color(RUST); for (const y of [0.9, 2.8]) { g.box(x - s * 0.7, y, H - 0.4, 0.12, 0.12, 0.3); g.box(x - s * 0.7, y + 0.15, H - 0.55, 0.06, 0.3, 0.06); }
    ctx.albedo(TEX.rock); ctx.color(ST); }
  // rubble spilled from the walls
  const rub = lod <= 2 ? 26 : 12;
  for (let i = 0; i < rub; i++) { const side = i % 4, u = (R() * 2 - 1) * H, off = (R() < 0.5 ? -1 : 1) * (0.8 + R() * 1.4), s = 0.2 + R() * 0.3;
    const [x, z] = side === 0 ? [u, H + off] : side === 1 ? [u, -H + off] : side === 2 ? [-H + off, u] : [H + off, u];
    if (Math.abs(x) < 3 && Math.abs(z) > H - 3) continue;
    mossyRock(g, [x, s * 0.35, z], [s * 1.4, s, s * 1.1], 0, 200 + i, { rock: TEX.rock, moss: TEX.moss, mossAt: 0.6 }); }
  // the tower, NW corner: 6 x 6 m, 8 m, roof fallen in, door on its south face, slit windows
  { const cx = -H + 3, cz = -H + 3, W = 6, TH = 8, w = 0.8; ctx.albedo(TEX.rock); ctx.color(ST);
    g.box(cx, TH / 2, cz - W / 2 + w / 2, W, TH, w); g.box(cx - W / 2 + w / 2, TH / 2, cz, w, TH, W);
    g.box(cx + W / 2 - w / 2, TH * 0.45, cz, w, TH * 0.9, W);
    g.box(cx - 1.9, TH / 2, cz + W / 2 - w / 2, 2.2, TH, w); g.box(cx + 1.9, TH * 0.47, cz + W / 2 - w / 2, 2.2, TH * 0.94, w); g.box(cx, 5.4, cz + W / 2 - w / 2, 1.6, TH * 0.95 - 2.8 - 0.8, w);
    // crenel stubs on the top
    for (let i = 0; i < 5; i++) { g.box(cx - W / 2 + 0.6 + i * 1.2, TH + 0.35, cz - W / 2 + w / 2, 0.7, 0.7, w); g.box(cx - W / 2 + w / 2, TH + 0.35, cz - W / 2 + 0.6 + i * 1.2, w, 0.7, 0.7); }
    ctx.albedo(null); ctx.color("oklch(0.15 0.01 60)"); g.box(cx - W / 2 - 0.01, 5.2, cz, 0.04, 1.0, 0.25); g.box(cx, 5.2, cz - W / 2 - 0.01, 0.25, 1.0, 0.04); g.box(cx, 1.15, cz + W / 2 + 0.01, 1.4, 2.3, 0.04);
    // fallen roof beams, poking out of the top and lying across the doorway inside
    ctx.albedo(TEX.oak); ctx.color(OAKD); g.tube([[cx - 2, 3.5, cz - 2, 0.12], [cx + 1.8, 8.6, cz + 1.2, 0.11]], 6); g.tube([[cx + 2, 4.4, cz - 2.2, 0.1], [cx - 0.5, 9.1, cz + 1.8, 0.1]], 6); g.tube([[cx - 2.4, 0.3, cz + 1, 0.12], [cx + 2.2, 1.6, cz - 1.5, 0.12]], 6);
    // ivy-moss on the weather side
    ctx.albedo(TEX.moss); ctx.color(MOSS); g.box(cx - W / 2 - 0.04, 2.4, cz + 0.6, 0.06, 4.8, 2.6); g.box(cx + 0.5, TH - 0.4, cz - W / 2 - 0.04, 3.4, 1.4, 0.06); }
  // the toll-house, NE corner: 7 x 6 m, walls 3 m, west gable chimney, south door, half the slate roof fallen in
  { const cx = H - 4.4, cz = -H + 3.6, W = 7, D = 6, WH = 3.1, w = 0.6; ctx.albedo(TEX.rock); ctx.color(ST2);
    g.box(cx, WH / 2, cz - D / 2 + w / 2, W, WH, w); g.box(cx + W / 2 - w / 2, WH / 2, cz, w, WH, D);
    g.box(cx - W / 2 + w / 2, WH / 2, cz, w, WH, D); g.box(cx - 2.5, WH / 2, cz + D / 2 - w / 2, 2.0, WH, w); g.box(cx + 1.6, WH / 2, cz + D / 2 - w / 2, 3.8, WH, w); g.box(cx - 0.9, WH - 0.35, cz + D / 2 - w / 2, 1.2, 0.7, w);
    // gables
    for (const z of [cz - D / 2 + w / 2, cz + D / 2 - w / 2]) for (let k = 0; k < 4; k++) g.box(cx - W / 2 + w / 2, WH + 0.35 + k * 0.6, z + (z < cz ? 1 : -1) * 0, w, 0.6, Math.max(0.2, D - k * 1.5 - 0.6));
    ctx.color(ST); g.box(cx - W / 2 - 0.2, 3.4, cz, 1.2, 6.8, 1.4); g.box(cx - W / 2 - 0.2, 6.9, cz, 0.9, 0.4, 0.9);
    ctx.albedo(null); ctx.color("oklch(0.14 0.01 60)"); g.box(cx - 0.9, 1.0, cz + D / 2 + 0.01, 1.2, 2.0, 0.04); g.box(cx + 2, 1.7, cz + D / 2 + 0.01, 0.8, 0.8, 0.04);
    // roof: the north pitch still on, the south pitch fallen; bare rafters over the gap
    const ridge = WH + 2.4; ctx.albedo(TEX.slate ?? TEX.rock); ctx.color(SLATE);
    g.at(X([cx + 0.2, (WH + ridge) / 2, cz - D / 4], 0, -Math.atan2(ridge - WH, D / 2) * 180 / Math.PI), () => g.box(0, 0, 0, W + 0.4, 0.14, Math.hypot(D / 2, ridge - WH) + 0.3));
    g.at(X([cx + 2.2, (WH + ridge) / 2, cz + D / 4], 0, Math.atan2(ridge - WH, D / 2) * 180 / Math.PI), () => g.box(0, 0, 0, 2.6, 0.14, Math.hypot(D / 2, ridge - WH) + 0.3));
    ctx.albedo(TEX.oak); ctx.color(OAKD); g.box(cx, ridge, cz, W, 0.18, 0.18);
    for (let i = 0; i < 4; i++) { const x = cx - 2.8 + i * 1.2; g.tube([[x, ridge, cz, 0.06], [x, WH, cz + D / 2, 0.06]], 5); }
    g.tube([[cx - 2.2, 0.2, cz + D / 2 + 0.8, 0.07], [cx - 1.6, WH - 0.2, cz + D / 2 - 0.4, 0.07]], 5);
    ctx.albedo(TEX.slate ?? TEX.rock); ctx.color(SLATE); if (lod <= 3) for (let i = 0; i < 18; i++) g.at(X([cx - 2.5 + R() * 4, 0.05, cz + D / 2 + 0.3 + R() * 1.6], R() * 360, R() * 20 - 10), () => g.box(0, 0, 0, 0.32, 0.03, 0.22));
    ctx.albedo(TEX.oak); ctx.color(OAK); g.tube([[cx + 3.2, 0, cz + D / 2 + 0.6, 0.32], [cx + 3.2, 0.75, cz + D / 2 + 0.6, 0.32]], 8, { capB: true }); }
  // the toll bar outside the gate: a post, the bar snapped and fallen across one rut, a rusted chain hanging
  { const z = H + 4; ctx.albedo(TEX.oak); ctx.color(OAKD); g.box(3.4, 0.7, z, 0.4, 1.4, 0.4); g.box(-3.4, 0.55, z, 0.35, 1.1, 0.35);
    ctx.color(OAK); g.tube([[3.4, 1.3, z, 0.12], [-0.3, 0.75, z + 0.4, 0.11]], 6, { capA: true, capB: true }); g.tube([[-0.6, 0.12, z + 0.9, 0.1], [-2.9, 0.1, z + 1.8, 0.1]], 6, { capA: true, capB: true });
    ctx.albedo(TEX.iron); ctx.color(RUST); for (let i = 0; i < 7; i++) g.at(X([1.2, 1.05 - i * 0.14, z + 0.2], i % 2 ? 90 : 0), () => { const r = []; for (let k = 0; k <= 6; k++) { const a = k / 6 * 6.283; r.push([Math.cos(a) * 0.04, Math.sin(a) * 0.07, 0, 0.012]); } g.tube(r, 3); });
    g.box(2.4, 1.15, z + 0.1, 0.5, 0.06, 0.06); }
  // the salt-cart axle: two iron-rimmed wheels on a broken bed, in the gorse west of the gate
  if (lod <= 3) { const x0 = -7, z0 = H + 3.5; ctx.albedo(TEX.oak); ctx.color(OAKD);
    g.at(X([x0, 0, z0], 20), () => { g.tube([[-1.0, 0.55, 0, 0.06], [1.0, 0.55, 0, 0.06]], 6); g.box(0, 0.7, 0.4, 1.4, 0.08, 1.6); g.at(X([0.3, 0.45, 1.6], 0, 18), () => g.box(0, 0, 0, 1.2, 0.07, 1.2));
      for (const s of [-1, 1]) { ctx.albedo(TEX.iron); ctx.color(RUST); const r = []; for (let k = 0; k <= 14; k++) { const a = k / 14 * 6.283; r.push([s * 1.0, 0.55 + Math.sin(a) * 0.55, Math.cos(a) * 0.55, 0.04]); } g.tube(r, 4);
        ctx.albedo(TEX.oak); ctx.color(OAKD); for (let k = 0; k < 6; k++) { const a = k / 6 * 3.1416; g.tube([[s * 1.0, 0.55 - Math.sin(a) * 0.5, -Math.cos(a) * 0.5, 0.025], [s * 1.0, 0.55 + Math.sin(a) * 0.5, Math.cos(a) * 0.5, 0.025]], 4); } } }); }
  // the travellers' firepit inside the walls: a stone ring, char, log seats, two stumps
  { const fx = 3.5, fz = 3; for (let i = 0; i < 10; i++) { const a = i / 10 * 6.283; mossyRock(g, [fx + Math.cos(a) * 0.75, 0.1, fz + Math.sin(a) * 0.75], [0.26, 0.2, 0.22], 0, 400 + i, { rock: TEX.rock, moss: TEX.moss, mossAt: 0.9 }); }
    ctx.albedo(null); ctx.color("oklch(0.18 0.01 50)"); g.box(fx, 0.03, fz, 1.1, 0.04, 1.1); ctx.color("oklch(0.3 0.02 50)"); for (let i = 0; i < 4; i++) g.at(X([fx, 0.1, fz], i * 47), () => g.box(0, 0, 0, 0.9, 0.09, 0.1));
    ctx.albedo(TEX.oak); ctx.color(OAKD); g.tube([[fx - 1.3, 0.2, fz + 1.9, 0.2], [fx + 1.4, 0.2, fz + 2.0, 0.2]], 8, { capA: true, capB: true });
    for (const [x, z] of [[fx + 2.1, fz - 0.6], [fx - 2.0, fz - 0.9]]) g.tube([[x, 0, z, 0.24], [x, 0.45, z, 0.24]], 8, { capB: true }); }
  // gorse and heather, inside and out
  if (lod <= 3) { ctx.albedo(null); const n = lod <= 2 ? 34 : 14;
    for (let i = 0; i < n; i++) { const x = (R() * 2 - 1) * (H + 6), z = (R() * 2 - 1) * (H + 6); if (Math.abs(x) < 2.6) continue; if (x < -H + 6.5 && z < -H + 6.5 && x > -H - 0.5 && z > -H - 0.5) continue; if (x > H - 8.5 && z < -H + 7 && x < H + 0.5) continue;
      const s = 0.4 + R() * 0.6; if (R() < 0.6) { ctx.smooth(); ctx.color(GORSE); for (let k = 0; k < 3; k++) { const ox = (R() - 0.5) * s, oz = (R() - 0.5) * s, r = s * (0.45 + R() * 0.25); g.tube([[x + ox, 0, z + oz, r * 0.6], [x + ox, r * 0.8, z + oz, r], [x + ox, r * 1.6, z + oz, r * 0.4]], 7, { capB: true, rough: (th, j) => 1 + 0.18 * Math.sin(th * 5 + j * 2 + k) }); }
        ctx.flat(); ctx.color(BLOOM); for (let k = 0; k < 7; k++) { const a = R() * 6.283, r = s * (0.4 + R() * 0.3); g.box(x + Math.cos(a) * r, s * (0.7 + R() * 0.5), z + Math.sin(a) * r, 0.1, 0.07, 0.1); } }
      else { ctx.smooth(); ctx.color(HEATH); g.tube([[x, 0, z, s * 0.6], [x, s * 0.25, z, s * 0.65], [x, s * 0.4, z, s * 0.3]], 7, { capB: true, rough: (th) => 1 + 0.15 * Math.sin(th * 7) }); ctx.flat(); } } }
  ctx.albedo(null); ctx.color(null);
}
export function collider() {
  const c = [], w = 0.9;
  c.push({ kind: "box", width: 2 * H - 4.4, height: 2.5, depth: w, center: [-H / 2 - 1.1, 1.25, H] }, { kind: "box", width: 2 * H - 4.4 - 0.0, height: 2.5, depth: w, center: [H / 2 + 1.1, 1.25, H] });
  c.push({ kind: "box", width: H - 3, height: 2, depth: w, center: [-H / 2 - 1.5, 1, -H] }, { kind: "box", width: H - 3.5, height: 2, depth: w, center: [H / 2 + 1.75, 1, -H] });
  c.push({ kind: "box", width: w, height: 2.4, depth: 2 * H, center: [H, 1.2, 0] }, { kind: "box", width: w, height: 2.4, depth: 14, center: [-H, 1.2, -5] }, { kind: "box", width: w, height: 2.4, depth: 6, center: [-H, 1.2, 9] });
  // tower walls, door gap south
  const tx = -H + 3, tz = -H + 3; c.push({ kind: "box", width: 6, height: 8, depth: 0.8, center: [tx, 4, tz - 2.6] }, { kind: "box", width: 0.8, height: 8, depth: 6, center: [tx - 2.6, 4, tz] }, { kind: "box", width: 0.8, height: 7, depth: 6, center: [tx + 2.6, 3.5, tz] },
    { kind: "box", width: 2.2, height: 8, depth: 0.8, center: [tx - 1.9, 4, tz + 2.6] }, { kind: "box", width: 2.2, height: 7.5, depth: 0.8, center: [tx + 1.9, 3.75, tz + 2.6] });
  // toll-house walls, door gap south
  const hx = H - 4.4, hz = -H + 3.6; c.push({ kind: "box", width: 7, height: 3.1, depth: 0.6, center: [hx, 1.55, hz - 2.7] }, { kind: "box", width: 0.6, height: 3.1, depth: 6, center: [hx + 3.2, 1.55, hz] }, { kind: "box", width: 1.4, height: 6.8, depth: 6, center: [hx - 3.5, 3.4, hz] },
    { kind: "box", width: 2, height: 3.1, depth: 0.6, center: [hx - 2.5, 1.55, hz + 2.7] }, { kind: "box", width: 3.8, height: 3.1, depth: 0.6, center: [hx + 1.6, 1.55, hz + 2.7] });
  for (const s of [-1, 1]) c.push({ kind: "box", width: 1.3, height: 3.8, depth: 1.3, center: [s * 2.6, 1.9, H] });
  c.push({ kind: "box", width: 0.4, height: 1.4, depth: 0.4, center: [3.4, 0.7, H + 4] });
  return c;
}
