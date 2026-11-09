// HIGHBRIDGE walls, gates and the Temple Close: one generator, params.kind:
//  curtain { pts:[[x,y,z]..] (y = top-reference ground), out:[ox,oz], H, T, trims:[[a,b]..], bases:[..], gaps:[[seg,u0,u1]..], low, ban }
//  tower   { R, walk, top, roof, base, doors:[[dx,dz]..], win }   round drum, lead-blue cone, walk-through passage at `walk`
//  gate    { aw, ah, hw, dep, Hb, R, tx, tH, roof, towers, base }  gatehouse, front (outside) on local -z, open arch
//  stair   { H, w }   a flight along +x, wall on local z<0
//  cloister{ runs:[[[x,z]..]..], H, T, lych:[[x,z,yaw]..] }   precinct wall with roofed lych gates
//  belfry  { s, H, spire }  square bell tower, door on -z, a room inside
//  grave   { w, d, n, yews, seed }   headstones, tombs and yews
//  lamp    { h }   iron street lamp, lantern at h
// Royal Annvyr palette: cream ashlar, crimson band, lead-blue slate, gold finials, gold lion banners.
import { paint, flatc, glow, HX, BX, RB, LA, SEG, PIPE, OAK, IR, FLAG, TOWERROOF } from "../lib/buildkit.js";
import { lantern_hbWall } from "../lib/pieces/lantern.js";   // shared lantern piece, drawn in this building's palette
import { banner_hbWall } from "../lib/pieces/banner.js";   // shared banner piece, drawn in this building's palette
import { lampPost } from "../lib/pieces/lamppost.js";   // shared lamp post, the walls look
const ASH = "cdn/texture-ashlar-cream-limestone-two-courses-big-dressed-blocks-thin-pale-mortar-subtle-weathering.png", SLATE = "cdn/texture-blue-grey-lead-slate-roof-tiles.png";
const YEW = "cdn/texture-dark-yew-foliage-needles.png", GRASS = "cdn/texture-short-dark-grass-turf.png";
const BAN = "/cdn/value.21cdc4f22271947196130a7d74021630b1afaa6e1f9440ddb614e6551b8ae76f.png";
const CREAM = "oklch(0.99 0.012 240)", CREAM2 = "oklch(0.93 0.014 240)", CREAM3 = "oklch(0.8 0.018 230)", BLUE = "oklch(0.86 0.05 255)";
const CRIM = "oklch(0.42 0.15 25)", GOLD = "oklch(0.78 0.14 85)", IRC = "oklch(0.45 0.01 60)", SLIT = "oklch(0.16 0.01 60)", WARM = [2.4, 1.5, 0.6];
const DEG = Math.PI / 180;
function rng(s) { let a = (s | 0) * 2654435761 >>> 0 || 1; return () => { a ^= a << 13; a >>>= 0; a ^= a >> 17; a ^= a << 5; a >>>= 0; return a / 4294967296; }; }
// an emitter over ctx that writes triplanar uvs (S tiles per metre) or a card's own uvs (banners)
function wrap(ctx) { const uv = []; let S = 0.4, card = null;
  const W = { uv,
    tri(ax, ay, az, bx, by, bz, cx, cy, cz) { ctx.tri(ax, ay, az, bx, by, bz, cx, cy, cz); const V = [[ax, ay, az], [bx, by, bz], [cx, cy, cz]];
      if (card) { for (const [x, y, z] of V) uv.push(((x - card.o[0]) * card.u[0] + (z - card.o[2]) * card.u[1]) / card.w, (y - card.o[1]) / card.h); return; }
      const ux = bx - ax, uy = by - ay, uz = bz - az, vx = cx - ax, vy = cy - ay, vz = cz - az;
      const nx = Math.abs(uy * vz - uz * vy), ny = Math.abs(uz * vx - ux * vz), nz = Math.abs(ux * vy - uy * vx);
      for (const [x, y, z] of V) { if (ny >= nx && ny >= nz) uv.push(x * S, z * S); else if (nx >= nz) uv.push(z * S, y * S); else uv.push(x * S, y * S); } },
    quad(ax, ay, az, bx, by, bz, cx, cy, cz, dx, dy, dz) { W.tri(ax, ay, az, bx, by, bz, cx, cy, cz); W.tri(ax, ay, az, cx, cy, cz, dx, dy, dz); },
    albedo: (t) => ctx.albedo(t), color: (...a) => ctx.color(...a), emissive: (...a) => ctx.emissive(...a), smooth: () => ctx.smooth(), flat: () => ctx.flat(),
    scale(s) { S = s; }, card(c) { card = c; } };
  return W; }
// a banner card hung with its top centre at (x, yt, z), facing f = [fx, fz], swallowtailed, on an iron rod
// a lantern: iron cage with a warm glowing glass
// ---------- round drum tower ----------
function drum(W, p, L, coll) {
  const R = p.R ?? 5.5, walk = p.walk ?? 11, top = p.top ?? walk + 6, roof = p.roof ?? 10, base = p.base ?? -3, cx = p.cx ?? 0, cz = p.cz ?? 0;
  const doors = (p.doors ?? []).map((d) => Math.atan2(d[1], d[0])), N = L <= 2 ? 24 : 16, n = L <= 2 ? 24 : L <= 3 ? 16 : 10;
  const th = 0.8, rr = R - th / 2, pw = 2 * Math.PI * rr / N * 1.06, dh = 2.7;
  if (!coll) { paint(W, ASH, CREAM3); W.scale(0.35); }
  LA(W, cx, base, cz, [[R + 0.9, 0], [R + 0.9, -base + 0.3], [R + 0.15, -base + 2.2], [R, -base + 2.6], [R, -base + walk]], n, true);   // battered drum, capped at the floor
  if (!coll) paint(W, ASH, CREAM);
  for (let k = 0; k < N; k++) { const t = (k + 0.5) / N * 2 * Math.PI, x = cx + rr * Math.cos(t), z = cz + rr * Math.sin(t), Y = -(t + Math.PI / 2) / DEG;
    const isDoor = doors.some((a) => Math.abs(Math.atan2(Math.sin(t - a), Math.cos(t - a))) < 0.27);
    const y0 = isDoor ? walk + dh : walk; RB(W, x, (y0 + top) / 2, z, pw, top - y0, th, Y);
    if (!coll && L <= 2 && !isDoor && k % 6 === 2 && p.win !== false) { // a lit arched window, out of the drum
      const xo = cx + (R + 0.02) * Math.cos(t), zo = cz + (R + 0.02) * Math.sin(t);
      glow(W, "oklch(0.85 0.12 70)", WARM); RB(W, xo, walk + 2.2, zo, 0.7, 1.4, 0.06, Y); RB(W, xo, walk + 2.9, zo, 0.45, 0.25, 0.06, Y);
      paint(W, ASH, CREAM3); RB(W, cx + (R + 0.08) * Math.cos(t), walk + 1.45, cz + (R + 0.08) * Math.sin(t), 1.0, 0.14, 0.2, Y); paint(W, ASH, CREAM); }
    if (!coll && L <= 2 && !isDoor && k % 6 === 5) { flatc(W, SLIT); RB(W, cx + (R + 0.01) * Math.cos(t), walk - 4, cz + (R + 0.01) * Math.sin(t), 0.18, 1.5, 0.05, Y); paint(W, ASH, CREAM); }
  }
  if (!coll && L <= 2 && walk > 7) { const a = (doors[0] ?? 0) + Math.PI / 2; lantern(W, cx + (rr - 0.7) * Math.cos(a), walk + 2.3, cz + (rr - 0.7) * Math.sin(a), 0.9); paint(W, ASH, CREAM); }
  // ceiling of the passage room
  if (!coll) paint(W, OAK, "oklch(0.7 0.04 50)");
  LA(W, cx, top - 0.5, cz, [[rr, 0], [rr, 0.3]], n, true);
  if (coll) return;
  // machicolated crown: corbels, crimson band, crenellated breastwork
  paint(W, ASH, CREAM2);
  if (L <= 2) for (let k = 0; k < 20; k++) { const t = k / 20 * 2 * Math.PI; RB(W, cx + (R + 0.3) * Math.cos(t), top - 0.45, cz + (R + 0.3) * Math.sin(t), 0.45, 0.9, 0.7, -(t + Math.PI / 2) / DEG); }
  LA(W, cx, top, cz, [[R + 0.7, 0], [R + 0.7, 1.9]], n, true);
  flatc(W, CRIM); LA(W, cx, top + 0.25, cz, [[R + 0.74, 0], [R + 0.74, 0.45]], n, false);
  flatc(W, GOLD); if (L <= 3) LA(W, cx, top + 0.7, cz, [[R + 0.76, 0], [R + 0.76, 0.08]], n, false);
  if (L <= 3) { paint(W, ASH, CREAM); for (let k = 0; k < 16; k++) { const t = (k + 0.5) / 16 * 2 * Math.PI; RB(W, cx + (R + 0.45) * Math.cos(t), top + 2.35, cz + (R + 0.45) * Math.sin(t), 1.0, 0.9, 0.5, -(t + Math.PI / 2) / DEG); } }
  // the lead-blue cone with a flared eave, gold finial and an Annvyr pennant
  W.scale(0.5); TOWERROOF(W, cx, top + 1.7, cz, R, roof * 1.15, n, L, { roof: (c) => paint(c, SLATE, BLUE), trim: (c) => paint(c, ASH, CREAM2), gold: (c) => flatc(c, GOLD), light: WARM });
  W.flat(); W.scale(0.4); const ap = top + 1.7 + roof * 1.15 + 1.2 * Math.max(0.8, R / 2.6);
  if (L <= 3) { paint(W, IR, IRC); PIPE(W, [cx, ap + 1.4, cz], [cx, ap + 3.6, cz], 0.04, 0.04, 5); flatc(W, CRIM);
    const a = p.flag ?? 0, fx = Math.cos(a), fz = Math.sin(a); W.tri(cx, ap + 3.5, cz, cx, ap + 2.6, cz, cx + fx * 2.4, ap + 3.1, cz + fz * 2.4); W.tri(cx, ap + 3.5, cz, cx + fx * 2.4, ap + 3.1, cz + fz * 2.4, cx, ap + 2.6, cz); }
  if (p.ban) { const t = p.ban, f = [Math.cos(t), Math.sin(t)]; banner(W, cx + f[0] * (R + 0.08), top - 1.2, cz + f[1] * (R + 0.08), f, 2.0, 5.2); }
  if (p.lamp !== false && L <= 3) for (const a of doors) lantern(W, cx + Math.cos(a + 0.5) * (rr - 0.6), walk + 2.2, cz + Math.sin(a + 0.5) * (rr - 0.6), 0.7);
}
// ---------- curtain wall ----------
function curtain(W, p, L, coll) {
  const pts = p.pts ?? [], H = p.H ?? 11, T = p.T ?? 3.4, out = p.out ?? [0, -1], low = !!p.low;
  for (let i = 0; i < pts.length - 1; i++) {
    const A = pts[i], B = pts[i + 1], dx = B[0] - A[0], dz = B[2] - A[2], len = Math.hypot(dx, dz); if (len < 0.3) continue;
    const d = [dx / len, dz / len], n0 = [-d[1], d[0]], s = n0[0] * out[0] + n0[1] * out[1] >= 0 ? 1 : -1, N = [n0[0] * s, n0[1] * s];
    const flip = d[1] * N[0] - d[0] * N[1] > 0;                       // (u, v) handed against (x, z): mirror the hexes
    const [ta, tb] = (p.trims ?? [])[i] ?? [0, 0], u0 = ta, u1 = len - tb, base = (p.bases ?? [])[i] ?? Math.min(A[1], B[1]) - 3;
    const ya = A[1] + (low ? 0 : H), yb = B[1] + (low ? 0 : H), top = (u) => ya + (yb - ya) * (u - u0) / Math.max(0.01, u1 - u0);
    const gy = (u) => A[1] + (B[1] - A[1]) * (u - u0) / Math.max(0.01, u1 - u0);
    const P = (u, v, y) => [A[0] + d[0] * u + N[0] * v, y, A[2] + d[1] * u + N[1] * v];
    const OB = (a, b, v0, v1, y0a, y0b, y1a, y1b) => { const q = [P(a, v0, y0a), P(b, v0, y0b), P(b, v1, y0b), P(a, v1, y0a), P(a, v0, y1a), P(b, v0, y1b), P(b, v1, y1b), P(a, v1, y1a)];
      HX(W, flip ? [q[0], q[3], q[2], q[1], q[4], q[7], q[6], q[5]] : q); };
    const OT = (a, b, v0, v1, y0, h) => OB(a, b, v0, v1, top(a) + y0, top(b) + y0, top(a) + y0 + h, top(b) + y0 + h);
    if (low) {   // the gorge breastwork: a battered plinth, a coped wall to chest height, merlons
      if (!coll) { paint(W, ASH, CREAM3); W.scale(0.35); OB(u0, u1, -T / 2 - 0.4, T / 2 + 0.9, base, base, gy(u0) + 0.3, gy(u1) + 0.3); paint(W, ASH, CREAM); }
      OB(u0, u1, -T / 2, T / 2, base, base, top(u0) + 1.15, top(u1) + 1.15);
      if (coll) continue;
      paint(W, ASH, CREAM2); OT(u0, u1, -T / 2 - 0.08, T / 2 + 0.08, 1.15, 0.12);
      if (L <= 3) { paint(W, ASH, CREAM); const nm = Math.floor((u1 - u0) / 2.6); for (let k = 0; k < nm; k++) { const a = u0 + (k + 0.25) * (u1 - u0) / nm; OT(a, a + 1.3, -T / 2 + 0.05, T / 2 - 0.05, 1.27, 0.75); if (L <= 2) { paint(W, ASH, CREAM2); OT(a - 0.06, a + 1.36, -T / 2, T / 2, 2.02, 0.1); paint(W, ASH, CREAM); } } }
      continue; }
    // footing, body, string course, walk, corbel table, parapets
    if (!coll) { paint(W, ASH, CREAM3); W.scale(0.3); OB(u0, u1, -T / 2 - 0.8, T / 2 + 0.8, base, base, gy(u0) + 1.0, gy(u1) + 1.0);
      OB(u0, u1, -T / 2 - 0.25, T / 2 + 0.25, gy(u0) + 1.0, gy(u1) + 1.0, gy(u0) + 1.9, gy(u1) + 1.9); paint(W, ASH, CREAM); }
    OB(u0, u1, -T / 2, T / 2, base, base, top(u0), top(u1));
    const pv0 = T / 2 - 0.6, pv1 = T / 2 + 0.45;
    OT(u0, u1, pv0, pv1, 0, coll ? 2.2 : 1.15);                              // outer parapet over the corbels
    const gaps = (p.gaps ?? []).filter((g) => g[0] === i).map((g) => [g[1], g[2]]).sort((a, b) => a[0] - b[0]);
    let a = u0; for (const g of [...gaps, [u1, u1]]) { if (g[0] > a + 0.2) OT(a, Math.min(g[0], u1), -T / 2, -T / 2 + 0.45, 0, 0.95); a = Math.max(a, g[1]); }
    if (coll) continue;
    paint(W, FLAG, "oklch(0.85 0.02 70)"); W.scale(0.5); OT(u0, u1, -T / 2 + 0.45, pv0, 0, 0.03); W.scale(0.4);
    flatc(W, CRIM); OT(u0, u1, pv1 - 0.01, pv1 + 0.02, -0.55, 0.32);                             // the crimson band under the merlons
    paint(W, ASH, CREAM2); OB(u0, u1, T / 2 - 0.02, T / 2 + 0.15, top(u0) - H * 0.55, top(u1) - H * 0.55, top(u0) - H * 0.55 + 0.3, top(u1) - H * 0.55 + 0.3);
    OT(u0, u1, -T / 2 - 0.06, -T / 2 + 0.5, 0.95, 0.1);
    if (L <= 3) { paint(W, ASH, CREAM); const nm = Math.max(1, Math.floor((u1 - u0) / 2.6));
      for (let k = 0; k < nm; k++) { const m = u0 + (k + 0.25) * (u1 - u0) / nm; OT(m, m + 1.35, pv0 + 0.05, pv1, 1.15, 1.0);
        if (L <= 2) { paint(W, ASH, CREAM2); OT(m - 0.06, m + 1.41, pv0, pv1 + 0.06, 2.15, 0.12); flatc(W, SLIT); OT(m + 0.6, m + 0.75, pv1 + 0.005, pv1 + 0.02, 1.3, 0.7); paint(W, ASH, CREAM); } } }
    if (L <= 2) { paint(W, ASH, CREAM2); for (let m = u0 + 0.6; m < u1 - 0.4; m += 1.3) OT(m, m + 0.42, T / 2, pv1 - 0.02, -0.95, 0.95);      // corbels
      flatc(W, SLIT); for (let m = u0 + 4; m < u1 - 3; m += 7) { const y = gy(m) + H * 0.5; OB(m, m + 0.2, T / 2, T / 2 + 0.03, y, y, y + 1.6, y + 1.6); } }
    if (p.ban && L <= 3) for (let m = u0 + p.ban / 2; m < u1 - 3; m += p.ban) { const q = P(m, pv1 + 0.05, 0); banner(W, q[0], top(m) - 1.1, q[2], N, 2.2, 5.5); }
  } }
// ---------- gatehouse ----------
function gate(W, p, L, coll) {
  const aw = p.aw ?? 6, ah = p.ah ?? 8, hw = p.hw ?? 6.5, dep = p.dep ?? 12, Hb = p.Hb ?? 15, R = p.R ?? 6.5, tx = p.tx ?? 11.5, tH = p.tH ?? 19, base = p.base ?? -3, z0 = -dep / 2, z1 = dep / 2;
  const sy = ah - aw / 2, n = L <= 2 ? 16 : 8, arc = (k) => { const f = Math.PI - k / n * Math.PI; return [aw / 2 * Math.cos(f), sy + aw / 2 * Math.sin(f)]; };
  if (coll) { const b = (x0, y0, za, x1, y1, zb) => ({ kind: "box", width: x1 - x0, height: y1 - y0, depth: zb - za, center: [(x0 + x1) / 2, (y0 + y1) / 2, (za + zb) / 2] });
    const L2 = [b(-hw, base, z0, -aw / 2, Hb + 2, z1), b(aw / 2, base, z0, hw, Hb + 2, z1), b(-aw / 2, ah, z0, aw / 2, Hb + 2, z1)];
    if (p.towers !== false) for (const s of [-1, 1]) L2.push({ kind: "cylinder", radiusTop: R, radiusBottom: R + 0.9, height: tH - base, center: [s * tx, (tH + base) / 2, 0] });
    return L2; }
  paint(W, ASH, CREAM3); W.scale(0.3); BX(W, -hw - 0.6, base, z0 - 0.6, hw + 0.6, 1.4, z1 + 0.6 - 0.01);
  paint(W, ASH, CREAM); W.scale(0.35);
  BX(W, -hw, 1.4, z0, -aw / 2, Hb, z1); BX(W, aw / 2, 1.4, z0, hw, Hb, z1); BX(W, -aw / 2, ah, z0, aw / 2, Hb, z1);
  // the barrel vault and the spandrels between arch and lintel, front and back
  W.smooth(); for (let k = 0; k < n; k++) { const a = arc(k), b = arc(k + 1); W.quad(a[0], a[1], z1, b[0], b[1], z1, b[0], b[1], z0, a[0], a[1], z0); } W.flat();
  for (const z of [z0, z1]) for (let k = 0; k < n; k++) { const a = arc(k), b = arc(k + 1), C = [a[0] + b[0] < 0 ? -aw / 2 : aw / 2, ah];
    if (z === z0) W.tri(a[0], a[1], z, C[0], C[1], z, b[0], b[1], z); else W.tri(a[0], a[1], z, b[0], b[1], z, C[0], C[1], z); }
  paint(W, FLAG, "oklch(0.8 0.02 70)"); W.scale(0.5); BX(W, -aw / 2, -0.2, z0 - 1.5, aw / 2, 0.05, z1 + 1.5); W.scale(0.4);
  if (L <= 2) { paint(W, ASH, CREAM2); for (const [z, s] of [[z0, -1], [z1, 1]]) for (let k = 0; k < 13; k++) { const f = Math.PI - (k + 0.5) / 13 * Math.PI, r = aw / 2 + 0.45;
      RB(W, r * Math.cos(f), sy + r * Math.sin(f), z + s * 0.12, k === 6 ? 1.0 : 0.85, k === 6 ? 1.3 : 0.95, 0.3, 0, 0, (f - Math.PI / 2) / DEG); }
    // the raised portcullis: its teeth hang under the arch, front
    paint(W, IR, IRC); for (let x = -aw / 2 + 0.4; x < aw / 2 - 0.2; x += 0.5) { const y = sy + Math.sqrt(Math.max(0, (aw / 2) ** 2 - x * x)); SEG(W, [x, y + 0.2, z0 + 1.2], [x, y - 0.75, z0 + 1.2], 0.09); LA(W, x, y - 0.95, z0 + 1.2, [[0.001, 0], [0.06, 0.2]], 4); }
    // the open leaves against the passage walls, oak and strap iron
    for (const s of [-1, 1]) { paint(W, OAK, "oklch(0.55 0.12 30)"); BX(W, s * (aw / 2 - 0.02), 0.05, z0 + 1.6, s * (aw / 2 - 0.24), sy, z0 + 1.6 + aw / 2);
      paint(W, IR, IRC); for (const y of [0.8, sy / 2, sy - 0.8]) BX(W, s * (aw / 2 - 0.23), y, z0 + 1.65, s * (aw / 2 - 0.28), y + 0.14, z0 + 1.5 + aw / 2); } }
  // machicolated crown, crimson band, gold line, merlons
  paint(W, ASH, CREAM2); if (L <= 2) for (let x = -hw + 0.4; x < hw - 0.3; x += 1.2) { BX(W, x, Hb - 1.1, z0 - 0.5, x + 0.45, Hb, z0); BX(W, x, Hb - 1.1, z1, x + 0.45, Hb, z1 + 0.5); }
  BX(W, -hw - 0.5, Hb, z0 - 0.5, hw + 0.5, Hb + 1.2, z1 + 0.5);
  flatc(W, CRIM); BX(W, -hw - 0.53, Hb + 0.2, z0 - 0.53, hw + 0.53, Hb + 0.65, z1 + 0.53); flatc(W, GOLD); BX(W, -hw - 0.55, Hb + 0.7, z0 - 0.55, hw + 0.55, Hb + 0.78, z1 + 0.55);
  if (p.roof === "pyramid") { paint(W, ASH, CREAM2); BX(W, -hw - 0.7, Hb + 1.2, z0 - 0.7, hw + 0.7, Hb + 1.45, z1 + 0.7);
    paint(W, SLATE, BLUE); W.scale(0.5); const yb = Hb + 1.45, yt = yb + (hw + dep / 2) * 0.9, e = 0.9, Q = [[-hw - e, z0 - e], [hw + e, z0 - e], [hw + e, z1 + e], [-hw - e, z1 + e]];
    for (let k = 0; k < 4; k++) { const a = Q[k], b = Q[(k + 1) % 4]; W.tri(a[0], yb, a[1], 0, yt, 0, b[0], yb, b[1]); }
    flatc(W, GOLD); LA(W, 0, yt - 0.2, 0, [[0.2, 0], [0.28, 0.3], [0.05, 0.6], [0.05, 1.3], [0.001, 1.8]], 8); W.scale(0.4);
  } else if (L <= 3) { paint(W, ASH, CREAM); for (let x = -hw; x < hw - 0.5; x += 2.4) for (const z of [z0 - 0.5, z1 + 0.05]) BX(W, x, Hb + 1.2, z, x + 1.3, Hb + 2.2, z + 0.45);
    for (let z = z0 - 0.5; z < z1; z += 2.4) for (const x of [-hw - 0.5, hw + 0.05]) BX(W, x, Hb + 1.2, z, x + 0.45, Hb + 2.2, Math.min(z + 1.3, z1 + 0.5)); }
  // the arms over the arch and the lamps either side
  const bh = Math.min(5, Hb - ah - 1.8); if (bh > 1.5) banner(W, 0, Hb - 0.5, z0 - 0.05, [0, -1], Math.min(2.8, aw * 0.5), bh);
  if (p.ban2 && bh > 1.5) banner(W, 0, Hb - 0.5, z1 + 0.05, [0, 1], Math.min(2.8, aw * 0.5), bh);
  for (const s of [-1, 1]) { paint(W, IR, IRC); SEG(W, [s * (aw / 2 + 1.0), 4.2, z0], [s * (aw / 2 + 1.0), 4.2, z0 - 0.6], 0.07); lantern(W, s * (aw / 2 + 1.0), 3.55, z0 - 0.6, 0.9); }
  if (L <= 3) lantern(W, 0, sy - 1.2, 0, 0.9);
  if (p.towers !== false) for (const s of [-1, 1]) drum(W, { R, walk: tH - 6, top: tH, roof: p.roof ?? 12, base, cx: s * tx, cz: 0, doors: [], win: true, ban: -Math.PI / 2, lamp: false, flag: s > 0 ? 0 : Math.PI }, L, false);
}
// ---------- stair to the wall-walk ----------
function stair(W, p, L, coll) { const B = p.base ?? -2, H = p.H ?? 11, w = p.w ?? 2.3, run = H / 0.18 * 0.28, nst = Math.round(H / 0.18);
  const q = [[0, 0, 0], [run + 2, 0, 0], [run + 2, 0, w], [0, 0, w], [0, 0.05, 0], [run + 2, H, 0], [run + 2, H, w], [0, 0.05, w]];
  if (coll) { HX(W, [[0, B, 0], [run, B, 0], [run, B, w], [0, B, w], [0, 0, 0], [run, H, 0], [run, H, w], [0, 0, w]]); BX(W, run, B, 0, run + 2.2, H, w); BX(W, -0.3, B, w, run + 2.2, 0, w + 0.4); return; }
  paint(W, ASH, CREAM3); W.scale(0.35);
  HX(W, [[0, B, 0], [run, B, 0], [run, B, w + 0.4], [0, B, w + 0.4], [0, B + 0.01, 0], [run, H - 0.18, 0], [run, H - 0.18, w + 0.4], [0, B + 0.01, w + 0.4]]);
  BX(W, run, B, 0, run + 2.2, H - 0.01, w + 0.4);
  paint(W, FLAG, "oklch(0.86 0.02 75)"); W.scale(0.6); const st = L <= 2 ? 1 : 3;
  for (let i = 0; i < nst; i += st) BX(W, i * 0.28, Math.min(H, (i + st) * 0.18) - 0.18 * st - 0.02, 0, i * 0.28 + 0.28 * st + 0.04, Math.min(H, (i + st) * 0.18), w);
  paint(W, ASH, CREAM2); W.scale(0.4); HX(W, [[0, 0, w], [run + 2.2, H, w], [run + 2.2, H, w + 0.4], [0, 0, w + 0.4], [0, 0.95, w], [run + 2.2, H + 0.95, w], [run + 2.2, H + 0.95, w + 0.4], [0, 0.95, w + 0.4]].map((v, i) => i === 1 || i === 2 || i === 5 || i === 6 ? v : v)); }
// ---------- Temple Close ----------
function cloister(W, p, L, coll) { const H = p.H ?? 3.6, T = p.T ?? 0.8;
  for (const run of p.runs ?? []) for (let i = 0; i < run.length - 1; i++) { const [ax, az] = run[i], [bx, bz] = run[i + 1], len = Math.hypot(bx - ax, bz - az), yaw = -Math.atan2(bz - az, bx - ax) / DEG, mx = (ax + bx) / 2, mz = (az + bz) / 2;
    if (coll) { RB(W, mx, (H - 0.6) / 2, mz, len, H + 0.6, T, yaw); continue; }
    paint(W, ASH, CREAM3); W.scale(0.35); RB(W, mx, -0.1, mz, len + T, 1.0, T + 0.3, yaw); paint(W, ASH, CREAM); RB(W, mx, H / 2, mz, len, H, T, yaw);
    paint(W, SLATE, BLUE); W.scale(0.6); RB(W, mx, H + 0.12, mz, len + 0.2, 0.24, T + 0.4, yaw);
    if (L <= 3) { paint(W, ASH, CREAM2); W.scale(0.35); const nb = Math.floor(len / 5.5); const c = Math.cos(yaw * DEG), s = -Math.sin(yaw * DEG);
      for (let k = 0; k <= nb; k++) { const t = -len / 2 + len * k / Math.max(1, nb); RB(W, mx + c * t, (H + 0.5) / 2, mz + s * t, 0.9, H + 0.5, T + 0.5, yaw); if (L <= 2) { paint(W, SLATE, BLUE); RB(W, mx + c * t, H + 0.62, mz + s * t, 1.05, 0.2, T + 0.65, yaw); paint(W, ASH, CREAM2); } } } }
  if (coll) return;
  for (const [x, z, yw] of p.lych ?? []) { const c = Math.cos(yw * DEG), s = -Math.sin(yw * DEG), at = (u, v) => [x + c * u - s * v, z + s * u + c * v];
    paint(W, ASH, CREAM2); for (const u of [-2.4, 2.4]) { const q = at(u, 0); RB(W, q[0], 2.4, q[1], 1.2, 4.8, 1.3, yw); }
    paint(W, OAK, "oklch(0.55 0.12 30)"); RB(W, x, 4.75, z, 6.2, 0.35, 1.5, yw);
    paint(W, SLATE, BLUE); W.scale(0.5); for (const sgn of [-1, 1]) { const q = at(0, sgn * 1.05); RB(W, q[0], 5.55, q[1], 6.6, 0.18, 2.5, yw, sgn * 35); }
    flatc(W, GOLD); LA(W, x, 6.2, z, [[0.12, 0], [0.2, 0.25], [0.04, 0.5], [0.001, 1.1]], 8); W.scale(0.4); lantern(W, x, 4.0, z, 0.8); } }
function belfry(W, p, L, coll) { const s = p.s ?? 7, H = p.H ?? 24, h = s / 2, t = 0.9, dw = 0.7, dh = 2.6, b1 = H - 7.5, b2 = H - 2.2;
  if (coll) { const b = (x0, y0, z0, x1, y1, z1) => ({ kind: "box", width: x1 - x0, height: y1 - y0, depth: z1 - z0, center: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2] });
    return [b(-h, 0, -h, -dw, 4.6, -h + t), b(dw, 0, -h, h, 4.6, -h + t), b(-dw, dh, -h, dw, 4.6, -h + t), b(-h, 0, h - t, h, 4.6, h), b(-h, 0, -h, -h + t, 4.6, h), b(h - t, 0, -h, h, 4.6, h), b(-h, 4.6, -h, h, H, h), b(-h + t, 0, -h + t, h - t, 0.62, h - t), b(-dw, 0, -h - 1.3, dw, 0.2, -h + t), b(-dw, 0, -h - 0.6, dw, 0.41, -h + t)]; }
  paint(W, ASH, CREAM3); W.scale(0.35); BX(W, -h - 0.4, -1.2, -h - 0.4, -dw, 0.6, h + 0.4); BX(W, dw, -1.2, -h - 0.4, h + 0.4, 0.6, h + 0.4); BX(W, -dw, -1.2, -h + t, dw, 0.6, h + 0.4); BX(W, -dw, -1.2, -h - 1.3, dw, 0.2, -h + t); BX(W, -dw, 0.2, -h - 0.6, dw, 0.41, -h + t);
  paint(W, ASH, CREAM);
  BX(W, -h, 0.6, -h, -dw, b1, -h + t); BX(W, dw, 0.6, -h, h, b1, -h + t); BX(W, -dw, dh, -h, dw, b1, -h + t);
  BX(W, -h, 0.6, h - t, h, b1, h); BX(W, -h, 0.6, -h + t, -h + t, b1, h - t); BX(W, h - t, 0.6, -h + t, h, b1, h - t);
  paint(W, FLAG, "oklch(0.82 0.02 70)"); BX(W, -h + t, 0, -h + t, h - t, 0.62, h - t); BX(W, -dw, 0, -h - 0.01, dw, 0.15, -h + t);
  paint(W, OAK, "oklch(0.7 0.04 50)"); BX(W, -h + t, 4.6, -h + t, h - t, 4.9, h - t);
  // a stair rising round the room, a bench, a lit sconce
  if (L <= 2) { paint(W, OAK, "oklch(0.75 0.05 55)"); for (let i = 0; i < 12; i++) BX(W, h - t - 1.0, 0.62 + i * 0.33, -h + t + 0.3 + i * 0.36, h - t, 0.62 + i * 0.33 + 0.08, -h + t + 0.62 + i * 0.36);
    BX(W, -h + t, 0.62, h - t - 0.5, -h + t + 2.6, 1.05, h - t); lantern(W, -h + t + 0.3, 2.4, -h + t + 0.4, 0.6); }
  // the door: frame, open leaf, crest over it
  paint(W, ASH, CREAM2); BX(W, -dw - 0.3, 0.6, -h - 0.15, -dw, dh + 0.3, -h); BX(W, dw, 0.6, -h - 0.15, dw + 0.3, dh + 0.3, -h); BX(W, -dw - 0.3, dh, -h - 0.15, dw + 0.3, dh + 0.4, -h);
  paint(W, OAK, "oklch(0.5 0.13 28)"); BX(W, dw, 0.62, -h + t, dw + 0.08, dh, -h + t + 1.3);
  // string courses with crimson and gold, corner buttresses
  for (const y of [5, 11]) { paint(W, ASH, CREAM2); BX(W, -h - 0.15, y, -h - 0.15, h + 0.15, y + 0.35, h + 0.15); }
  flatc(W, CRIM); BX(W, -h - 0.17, b1 - 0.5, -h - 0.17, h + 0.17, b1, h + 0.17); flatc(W, GOLD); BX(W, -h - 0.18, b1 - 0.6, -h - 0.18, h + 0.18, b1 - 0.5, h + 0.18);
  paint(W, ASH, CREAM2); for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { BX(W, sx * h, 0.6, sz * h, sx * (h - 1.2), b2, sz * (h - 1.2)); BX(W, sx * (h + 0.35), 0.6, sz * (h + 0.35), sx * (h - 0.6), 6, sz * (h - 0.6)); }
  // the open belfry: piers between arched openings, the bell
  paint(W, ASH, CREAM); BX(W, -h, b1, -0.4, h, b2, 0.4); BX(W, -0.4, b1, -h, 0.4, b2, h);
  BX(W, -h, b2, -h, h, H, h); paint(W, ASH, CREAM2); BX(W, -h - 0.3, b2 - 0.25, -h - 0.3, h + 0.3, b2 + 0.2, h + 0.3); BX(W, -h - 0.4, H - 0.3, -h - 0.4, h + 0.4, H, h + 0.4);
  BX(W, -h + 0.5, b1, -h + 0.5, h - 0.5, b1 + 0.3, h - 0.5);
  paint(W, OAK, "oklch(0.6 0.04 50)"); BX(W, -h + 1, b2 - 1.3, -0.15, h - 1, b2 - 1.0, 0.15);
  W.smooth(); flatc(W, "oklch(0.62 0.11 65)"); LA(W, 0, b2 - 4.1, 0, [[1.15, 0], [1.05, 0.25], [0.8, 1.0], [0.62, 2.2], [0.5, 2.7], [0.001, 2.8]], L <= 2 ? 16 : 8); W.flat();
  // the spire: lead-blue, gilded finial, lucarnes
  paint(W, SLATE, BLUE); W.scale(0.5); const yt = H + (p.spire ?? 12), e = 0.5, Q = [[-h - e, -h - e], [h + e, -h - e], [h + e, h + e], [-h - e, h + e]];
  for (let k = 0; k < 4; k++) { const a = Q[k], b = Q[(k + 1) % 4]; W.tri(a[0], H, a[1], 0, yt, 0, b[0], H, b[1]); }
  if (L <= 2) for (let k = 0; k < 4; k++) { const f = k * Math.PI / 2, fx = Math.sin(f), fz = -Math.cos(f); paint(W, ASH, CREAM); RB(W, fx * (h - 0.9), H + 1.6, fz * (h - 0.9), 1.4, 2.4, 1.2, -f / DEG);
    glow(W, "oklch(0.85 0.12 70)", WARM); RB(W, fx * (h - 0.28), H + 1.5, fz * (h - 0.28), 0.6, 1.2, 0.05, -f / DEG); paint(W, SLATE, BLUE); RB(W, fx * (h - 0.9), H + 3.0, fz * (h - 0.9), 1.7, 0.2, 1.6, -f / DEG); }
  flatc(W, GOLD); W.scale(0.4); LA(W, 0, yt - 0.3, 0, [[0.25, 0], [0.35, 0.35], [0.06, 0.8], [0.06, 1.8], [0.001, 2.4]], 8); LA(W, 0, yt + 0.7, 0, [[0.001, 0], [0.3, 0.3], [0.001, 0.6]], 8);
  banner(W, 0, b1 - 1.0, -h - 0.05, [0, -1], 2.2, 4.8); }
function grave(W, p, L, coll) { const w = p.w ?? 30, d = p.d ?? 36, R = rng(p.seed ?? 7), yews = p.yews ?? 6, n = p.n ?? 36, out = [];
  const yp = []; for (let i = 0; i < yews; i++) { const a = i / yews * 2 * Math.PI + 0.4; yp.push([Math.cos(a) * (w / 2 - 2.5) * (0.75 + R() * 0.25), Math.sin(a) * (d / 2 - 2.5) * (0.75 + R() * 0.25), 0.8 + R() * 0.45]); }
  if (coll) { for (const [x, z] of yp) out.push({ kind: "cylinder", radiusTop: 0.35, radiusBottom: 0.45, height: 3, center: [x, 1.5, z] }); out.push({ kind: "box", width: 2.4, height: 1.1, depth: 1.2, center: [0, 0.55, 0] }); return out; }
  paint(W, GRASS, "oklch(0.72 0.06 140)"); W.scale(0.5); BX(W, -w / 2, -0.4, -d / 2, w / 2, 0.06, d / 2);
  paint(W, FLAG, "oklch(0.82 0.02 70)"); BX(W, -1.1, -0.3, -d / 2, 1.1, 0.1, d / 2); BX(W, -w / 2, -0.3, -1.1, w / 2, 0.1, 1.1); W.scale(0.4);
  // the central tomb chest with a gold sun disc
  paint(W, ASH, CREAM2); BX(W, -1.3, 0.05, -0.7, 1.3, 0.3, 0.7); paint(W, ASH, CREAM); BX(W, -1.15, 0.3, -0.55, 1.15, 1.0, 0.55); paint(W, ASH, CREAM2); BX(W, -1.25, 1.0, -0.65, 1.25, 1.15, 0.65);
  flatc(W, GOLD); LA(W, 0, 1.15, 0, [[0.3, 0], [0.3, 0.05]], 12);
  const STC = ["oklch(0.8 0.015 80)", "oklch(0.7 0.015 90)", "oklch(0.86 0.02 75)", "oklch(0.62 0.02 110)"];
  for (let i = 0; i < n; i++) { const q = i % 4, cx = (q % 2 ? 1 : -1) * (3 + R() * (w / 2 - 5)), cz = (q > 1 ? 1 : -1) * (3 + R() * (d / 2 - 5));
    if (yp.some(([x, z]) => Math.hypot(x - cx, z - cz) < 2.2)) continue;
    const hh = 0.7 + R() * 0.5, ww = 0.5 + R() * 0.25, tilt = (R() - 0.5) * 12, yw = (R() - 0.5) * 8;
    paint(W, ASH, STC[i % 4]); RB(W, cx, hh / 2 - 0.1, cz, ww, hh + 0.2, 0.16, yw, tilt * 0.4, tilt);
    if (L <= 2) { if (i % 3 === 0) LA(W, cx, hh - 0.1, cz - 0.08, [[ww / 2, 0], [ww / 2, 0.16]], 10, true, "z"); paint(W, GRASS, "oklch(0.62 0.07 140)"); BX(W, cx - 0.45, 0.04, cz + 0.12, cx + 0.45, 0.16, cz + 1.9); } }
  // yews: dark, dense, softly lumpy
  for (const [x, z, s] of yp) { paint(W, OAK, "oklch(0.5 0.05 40)"); PIPE(W, [x, 0, z], [x, 1.4 * s, z], 0.3 * s, 0.22 * s, 6);
    paint(W, YEW, "oklch(0.55 0.07 150)"); W.scale(0.8); W.smooth();
    LA(W, x, 0.8 * s, z, [[0.3 * s, 0], [1.7 * s, 0.6 * s], [2.0 * s, 1.6 * s], [1.75 * s, 2.8 * s], [1.2 * s, 4.0 * s], [0.5 * s, 5.0 * s], [0.001, 5.6 * s]], L <= 2 ? 11 : 7, true);
    W.flat(); W.scale(0.4); } }
function lamp(W, p, L, coll) { const h = p.h ?? 3.4; if (coll) return [{ kind: "cylinder", radiusTop: 0.1, radiusBottom: 0.2, height: h, center: [0, h / 2, 0] }];
  lampPost(W, { paint, flatc, glow, BX, LA, SEG, PIPE }, "wall", { h, heads: lampHeads }); }
const KINDS = { curtain, tower: drum, gate, stair, cloister, belfry, grave, lamp };
export function geometry(ctx) { const p = ctx.params?.kind ? ctx.params : { kind: "tower", ...(ctx.params ?? {}) }, L = ctx.lod ?? 1, W = wrap(ctx); (KINDS[p.kind] ?? curtain)(W, p, L, false); return { uvs: W.uv }; }
export function collider(ctx) { const p = ctx.params?.kind ? ctx.params : { kind: "tower", ...(ctx.params ?? {}) }, k = p.kind; const r = (KINDS[k] ?? curtain)(ctx, p, 1, true); return r ?? undefined; }
const banner = banner_hbWall({ BAN, GOLD, IR, IRC, LA, SEG, flatc, paint });
const lantern = lantern_hbWall({ BX, IR, IRC, LA, WARM, glow, paint });

export const lampHeads = { lantern: (...a) => lantern(...a) };
