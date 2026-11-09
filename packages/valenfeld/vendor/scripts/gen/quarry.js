// Worked stone quarry. Origin = rim centre, y 0 = the surrounding ground (a flatten mark holds it there and a
// hole mark of outline(params) cuts the terrain away inside the rim, so the rim meets the ground flush).
// params: benches [[width, depth, drop], ...] outer→inner (drop from rim to that bench's floor), seed.
// Each bench outline is a seeded jittered polygon on shared rays (so floors are quads between rings); faces are
// split into protruding fresh-cut blocks on bedding rows with drill lines; floors and block caps are weathered.
// A haul ramp per bench runs along its +z wall, chained rim → floor. Spoil heaps lie outside the -x rim.
const FACE = "cdn/texture-fresh-cut-grey-limestone-quarry-wall-vertical-drill-scars-no-courses.png", OLDFACE = "cdn/texture-pale-split-limestone-quarry-face.png", TOP = "cdn/texture-granite-rock-lichen.png";
const RUBBLE = "cdn/texture-grey-limestone-quarry-rubble-scree.png", ASHLAR = "cdn/texture-ashlar-cream-limestone-two-courses-big-dressed-blocks-thin-pale-mortar-subtle-weathering.png";
const WOOD = "cdn/texture-weathered-driftwood-planks.png";
const TAU = Math.PI * 2;
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = Math.imul(s ^ (s >>> 15), 2246822507) ^ Math.imul(s ^ (s >>> 13), 3266489909)) >>> 0) / 4294967296; }
// a quad wound so its normal agrees with n (outward)
function Q(c, a, b, d, e, n) {
  const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = d[0] - a[0], vy = d[1] - a[1], vz = d[2] - a[2];
  const cx = uy * vz - uz * vy, cy = uz * vx - ux * vz, cz = ux * vy - uy * vx;
  if (cx * n[0] + cy * n[1] + cz * n[2] < 0) c.quad(...e, ...d, ...b, ...a); else c.quad(...a, ...b, ...d, ...e);
}
function B(c, x0, y0, z0, x1, y1, z1) {
  Q(c, [x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1], [0, 1, 0]);
  Q(c, [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [0, 0, 1]);
  Q(c, [x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [0, 0, -1]);
  Q(c, [x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0], [1, 0, 0]);
  Q(c, [x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [-1, 0, 0]);
}
// oriented box: centre, half sizes, yaw (deg about y), roll (deg, tilts local x up)
function OB(c, cx, cy, cz, hx, hy, hz, yaw = 0, roll = 0) {
  const cy_ = Math.cos(yaw * Math.PI / 180), sy = Math.sin(yaw * Math.PI / 180), cr = Math.cos(roll * Math.PI / 180), sr = Math.sin(roll * Math.PI / 180);
  const P = (x, y, z) => { const x1 = x * cr - y * sr, y1 = x * sr + y * cr; return [cx + x1 * cy_ + z * sy, cy + y1, cz - x1 * sy + z * cy_]; };
  const v = [P(-hx, -hy, -hz), P(hx, -hy, -hz), P(hx, hy, -hz), P(-hx, hy, -hz), P(-hx, -hy, hz), P(hx, -hy, hz), P(hx, hy, hz), P(-hx, hy, hz)];
  const q = (a, b, d, e) => c.quad(...v[a], ...v[b], ...v[d], ...v[e]);
  q(7, 6, 2, 3); q(4, 5, 6, 7); q(1, 0, 3, 2); q(5, 1, 2, 6); q(0, 4, 7, 3); q(0, 1, 5, 4);
}
function benches(p) { return p.benches ?? [[44, 28, 2.5], [32, 20, 5], [20, 12, 7.5]]; }

// ---- layout: outlines, ramps, heaps; deterministic from params alone (every lod and the collider agree) ----
const cache = new Map();
function layout(p) {
  const key = JSON.stringify([p.benches, p.seed]); if (cache.has(key)) return cache.get(key);
  const bs = benches(p), R = rng((p.seed ?? 7) * 104729 + 3), N = 24;
  const tops = bs.map((b, i) => (i ? -bs[i - 1][2] : 0)), bots = bs.map(b => -b[2]);
  // ramps: along each bench's +z wall, chained so the foot of one meets the head of the next
  const ramps = []; let dir = 1, prevBot = null;
  for (let i = 0; i < bs.length; i++) {
    const a = bs[i][0] / 2, b = bs[i][1] / 2, dh = tops[i] - bots[i], L = Math.min(dh * 4.6, 2 * a - 9), lim = a - 3.5;
    let xTop = prevBot == null ? a - 5 : prevBot - dir, xBot = xTop - dir * L;
    if (Math.abs(xBot) > lim || Math.abs(xTop) > lim) { dir = -dir; xTop = prevBot; xBot = xTop - dir * L; }
    const wid = Math.min(2.6, (b - (bs[i + 1] ? bs[i + 1][1] / 2 : 0)) - 1.6), zc = b - 0.45 - wid / 2, s = Math.sign(xTop - xBot);
    ramps.push({ i, xTop, xBot, land: xTop + s * 1.3, top: tops[i], bot: bots[i], zc, wid, s, b });
    prevBot = xBot;
  }
  const ang = []; for (let k = 0; k < N; k++) ang.push((k + (R() - 0.5) * 0.55) / N * TAU);
  const polys = [];
  for (let i = 0; i < bs.length; i++) {
    const a = bs[i][0] / 2, b = bs[i][1] / 2, n = 3, out = polys[i - 1], r = ramps[i];
    const lo = Math.min(r.xTop, r.xBot, r.land) - 2.5, hi = Math.max(r.xTop, r.xBot, r.land) + 2.5;
    polys.push(ang.map((t, k) => {
      const ct = Math.cos(t), st = Math.sin(t);
      let rad = Math.pow(Math.pow(Math.abs(ct / a), n) + Math.pow(Math.abs(st / b), n), -1 / n);
      let s = 0.86 + R() * 0.13; if (R() < 0.18) s -= 0.07;
      rad *= s;
      if (out) { const ro = Math.hypot(out[k][0], out[k][1]); rad = Math.min(rad, ro - 2.2); }
      let x = rad * ct, z = rad * st;
      if (st > 0.15 && x > lo && x < hi) z = b;                       // the straight ramp wall
      const pr = ramps[i - 1]; if (pr && x > Math.min(pr.xTop, pr.xBot, pr.land) - 1 && x < Math.max(pr.xTop, pr.xBot, pr.land) + 1) z = Math.min(z, pr.zc - pr.wid / 2 - 0.5);
      return [x, z];
    }));
  }
  // bedding rows per bench, shared round the whole face (strata)
  const rows = bs.map((bb, i) => { const H = tops[i] - bots[i], n = Math.max(1, Math.round(H / 1.05)), ys = [bots[i]];
    for (let k = 1; k < n; k++) ys.push(bots[i] + H * (k + (R() - 0.5) * 0.35) / n); ys.push(tops[i]); return ys; });
  const a0 = bs[0][0] / 2;
  const heaps = [[-a0 - 8, -6, 5.6, 3.1], [-a0 - 12.5, 4.5, 4.6, 2.4], [-a0 - 5.5, 9.5, 3.6, 1.8]].map(([x, z, r, h]) => {
    const ring = (f, y) => { const pts = []; for (let k = 0; k < 12; k++) { const t = k / 12 * TAU, rr = r * f * (0.82 + R() * 0.3); pts.push([x + Math.cos(t) * rr, y, z + Math.sin(t) * rr]); } return pts; };
    return { x, z, r, h, rings: [ring(1, -0.5), ring(0.62, h * 0.55), ring(0.25, h * (0.9 + R() * 0.1))], peak: [x + (R() - 0.5) * 0.6, h, z + (R() - 0.5) * 0.6] };
  });
  const L = { bs, tops, bots, polys, ramps, rows, heaps, N }; cache.set(key, L); return L;
}
export function outline(p) { return layout(p).polys[0]; }   // the rim, object-local [x, z]: the terrain hole mark

// floors and wall backings, shared by geometry and collider
function floors(c, Lt) {
  const { polys, bots, N } = Lt;
  for (let i = 0; i < polys.length; i++) { const P = polys[i], In = polys[i + 1], y = bots[i];
    for (let k = 0; k < N; k++) { const k1 = (k + 1) % N;
      if (In) Q(c, [P[k][0], y, P[k][1]], [P[k1][0], y, P[k1][1]], [In[k1][0], y, In[k1][1]], [In[k][0], y, In[k][1]], [0, 1, 0]);
      else Q(c, [0, y, 0], [P[k][0], y, P[k][1]], [P[k1][0], y, P[k1][1]], [0, y, 0], [0, 1, 0]); } }
}
function walls(c, Lt) {
  const { polys, tops, bots, N } = Lt;
  for (let i = 0; i < polys.length; i++) { const P = polys[i];
    for (let k = 0; k < N; k++) { const A = P[k], Bp = P[(k + 1) % N], mx = (A[0] + Bp[0]) / 2, mz = (A[1] + Bp[1]) / 2;
      Q(c, [A[0], bots[i] - 0.05, A[1]], [Bp[0], bots[i] - 0.05, Bp[1]], [Bp[0], tops[i], Bp[1]], [A[0], tops[i], A[1]], [-mx, 0, -mz]); } }
}
function rampSolid(c, r) {   // the wedge's walkable top, landing and open side
  const z0 = r.zc - r.wid / 2, z1 = r.zc + r.wid / 2;
  Q(c, [r.xBot, r.bot, z0], [r.xTop, r.top, z0], [r.xTop, r.top, z1], [r.xBot, r.bot, z1], [0, 1, 0]);
  Q(c, [r.xTop, r.top, z0], [r.land, r.top, z0], [r.land, r.top, z1], [r.xTop, r.top, z1], [0, 1, 0]);
  Q(c, [r.xBot, r.bot, z0], [r.xTop, r.top, z0], [r.land, r.top, z0], [r.land, r.bot, z0], [0, 0, -1]);
  Q(c, [r.land, r.bot, z0], [r.land, r.bot, z1], [r.land, r.top, z1], [r.land, r.top, z0], [r.s, 0, 0]);
}
function heapMesh(c, h) {
  const [r0, r1, r2] = h.rings;
  for (const [A, Bq] of [[r0, r1], [r1, r2]]) for (let k = 0; k < 12; k++) { const k1 = (k + 1) % 12, m = A[k];
    Q(c, A[k], A[k1], Bq[k1], Bq[k], [m[0] - h.x, 0.6, m[2] - h.z]); }
  for (let k = 0; k < 12; k++) { const k1 = (k + 1) % 12; Q(c, r2[k], r2[k1], h.peak, h.peak, [0, 1, 0]); }
}

// ---- dressing ----
// critic r8: shared bedding rows + one small tiled texture read as running-bond brick. Now every column of the face
// splits on its own joints (no course lines carry across), blocks stand proud by their own depth with broken top
// edges, each face segment gets its own tint, and the texture (vertical drill scars) is laid big with a per-block offset.
function faceBlocks(c, Lt, R, lod, uv) {
  const { polys, tops, bots, ramps, N } = Lt, drill = [];
  for (let i = 0; i < polys.length; i++) { const P = polys[i], r = ramps[i], bot = bots[i], topY = tops[i], H = topY - bot;
    for (let k = 0; k < N; k++) {
      const A = P[k], Bp = P[(k + 1) % N], dx = Bp[0] - A[0], dz = Bp[1] - A[1], L = Math.hypot(dx, dz); if (L < 0.4) continue;
      const tx = dx / L, tz = dz / L; let nx = -tz, nz = tx; if (nx * -(A[0] + Bp[0]) + nz * -(A[1] + Bp[1]) < 0) { nx = -nx; nz = -nz; }
      const rampWall = Math.abs(A[1] - r.b) < 0.01 && Math.abs(Bp[1] - r.b) < 0.01;
      // this face's own stone: cool blue-grey or a warmer buff bed, lighter or darker
      const fL = 0.84 + R() * 0.12, fC = 0.004 + R() * 0.012, fH = R() < 0.75 ? 222 + R() * 38 : 75 + R() * 25;   // mostly cool grey faces, a few buff-stained ones
      let a = lod >= 3 ? 0 : -R() * 0.5;
      while (a < L - 0.05) {
        const seg = lod >= 3 ? 2.6 + R() * 1.8 : lod === 2 ? 1.3 + R() * 1.9 : (R() < 0.3 ? 0.5 + R() * 0.6 : 1.0 + R() * 1.8);
        const u0 = Math.max(0, a) + 0.03, u1 = Math.min(L, a + seg) - 0.03; a += seg;
        if (u1 - u0 < 0.25) continue;
        // the column's own joints: random lift heights, so no bedding line runs on into the next column
        const cuts = [bot]; if (lod <= 2) { let y = bot; for (;;) { y += (lod === 1 ? 0.45 + R() * 1.0 : 0.8 + R() * 1.2); if (y > topY - 0.4) break; cuts.push(y); } }
        cuts.push(topY);
        for (let w = 0; w < cuts.length - 1; w++) { const top = w === cuts.length - 2;
          const sl = top ? (R() - 0.5) * 0.3 : (R() - 0.5) * 0.1;            // a lip or joint that runs off level
          const y0 = cuts[w] + (w ? 0.03 + R() * 0.05 : -0.04);
          const yt = top ? topY + (R() < 0.3 ? R() * 0.2 : -R() * 0.35) : cuts[w + 1] - 0.03 - R() * 0.06;
          const y1a = yt + sl, y1b = yt - sl;
          const toe = 1 - (cuts[w] - bot) / H, pMax = rampWall ? 0.3 : 0.7;
          const p = 0.05 + R() * R() * (pMax - 0.05) + (rampWall ? 0 : toe * 0.12), j = () => (R() - 0.5) * 0.28;
          const at = (u, d, y) => [A[0] + tx * u + nx * d, y, A[1] + tz * u + nz * d];
          const pb0 = p + j(), pb1 = p + j(), pt0 = Math.max(0.03, p + j() - (top ? 0.08 : 0)), pt1 = Math.max(0.03, p + j() - (top ? 0.08 : 0));
          const ch = lod === 1 ? 0.05 + R() * 0.12 : 0;                         // a spalled top arris
          const bl0 = at(u0, -0.02, y0), br0 = at(u1, -0.02, y0), bl1 = at(u0, -0.02, y1a), br1 = at(u1, -0.02, y1b);
          const fl0 = at(u0, pb0, y0), fr0 = at(u1, pb1, y0), fl1 = at(u0, pt0, y1a - ch), fr1 = at(u1, pt1, y1b - ch);
          const el = at(u0, Math.max(0.01, pt0 - ch), y1a), er = at(u1, Math.max(0.01, pt1 - ch), y1b);
          const n = [nx, 0, nz], t = [tx, 0, tz], mt = [-tx, 0, -tz];
          const wx = R(), L0 = Math.min(0.99, fL + (R() - 0.5) * 0.07);
          c.albedo(FACE); uv.off(R() * 7, R() * 7); c.color(wx < 0.12 ? `oklch(${L0 - 0.1} 0.01 240)` : `oklch(${L0} ${fC} ${fH + (R() - 0.5) * 16})`);
          Q(c, fl0, fr0, fr1, fl1, n);
          if (ch) { Q(c, fl1, fr1, er, el, [nx, 0.7, nz]); Q(c, bl0, fl0, fl1, bl1, mt); c.tri(...fl1, ...el, ...bl1); Q(c, fr0, br0, br1, fr1, t); c.tri(...fr1, ...br1, ...er); }
          else { Q(c, bl0, fl0, fl1, bl1, mt); Q(c, fr0, br0, br1, fr1, t); }
          if (lod <= 3) Q(c, bl0, br0, fr0, fl0, [0, -1, 0]);
          if (top) { c.albedo(TOP); c.color(`oklch(${0.86 + R() * 0.08} 0.01 ${220 + R() * 40})`); }
          Q(c, bl1, br1, ch ? er : fr1, ch ? el : fl1, [0, 1, 0]);
          if (lod === 1 && R() < 0.4 && u1 - u0 > 0.7 && yt - y0 > 0.5) drill.push({ fl0, fr0, fl1, fr1, n });
        } }
      // a loose slab or two lying on the lip above
      if (lod === 1 && !rampWall && R() < 0.35) { const u = 0.4 + R() * (L - 0.8), s = 0.3 + R() * 0.4, q = at2(A, tx, tz, nx, nz, u, -0.3 - R() * 0.6);
        c.albedo(FACE); uv.off(R() * 5, R() * 5); c.color(`oklch(${fL} ${fC} ${fH})`); OB(c, q[0], topY + 0.07, q[1], s * 1.4, 0.08 + R() * 0.06, s, Math.atan2(tx, tz) * 180 / Math.PI + (R() - 0.5) * 40, (R() - 0.5) * 10); }
    } }
  // drill scars: half-bores left by the plug-and-feather split, darker, standing just off the block face
  if (drill.length) { c.albedo(null); c.color("oklch(0.52 0.01 240)");
    const lerp = (P0, P1, g) => [P0[0] + (P1[0] - P0[0]) * g, P0[1] + (P1[1] - P0[1]) * g, P0[2] + (P1[2] - P0[2]) * g];
    for (const d of drill) { const n = d.n, tx = d.fr0[0] - d.fl0[0], tz = d.fr0[2] - d.fl0[2], tl = Math.hypot(tx, tz) || 1, cnt = Math.floor((tl - 0.2) / 0.32), hw = 0.03;
      for (let m = 1; m <= cnt; m++) { const f = m / (cnt + 1), b = lerp(d.fl0, d.fr0, f), t = lerp(d.fl1, d.fr1, f);
        const o = (P, s, dy) => [P[0] + tx / tl * hw * s + n[0] * 0.015, P[1] + dy, P[2] + tz / tl * hw * s + n[2] * 0.015];
        Q(c, o(b, -1, 0.05), o(b, 1, 0.05), o(t, 1, -0.03), o(t, -1, -0.03), n); } } }
}
function at2(A, tx, tz, nx, nz, u, d) { return [A[0] + tx * u + nx * d, A[1] + tz * u + nz * d]; }
// scree aprons at every bench toe: a concave talus of rubble up the foot of the face, with loose blocks on it
function scree(c, Lt, p, R, lod, uv) {
  const { polys, bots, ramps, N } = Lt;
  for (let i = 0; i < polys.length; i++) { const P = polys[i], r = ramps[i], y = bots[i], Rs = rng((p.seed ?? 7) * 613 + i * 97);
    const h = [], d = []; for (let k = 0; k < N; k++) { h.push(0.25 + Rs() * 0.75); d.push(0.8 + Rs() * 1.0); }
    for (let k = 0; k < N; k++) { const k1 = (k + 1) % N, A = P[k], Bp = P[k1];
      if (Math.abs(A[1] - r.b) < 0.01 || Math.abs(Bp[1] - r.b) < 0.01) continue;
      const ia = Math.hypot(A[0], A[1]) || 1, ib = Math.hypot(Bp[0], Bp[1]) || 1;
      const W = (Pt, il, hh, f, yy) => [Pt[0] * (1 - f / il), yy, Pt[1] * (1 - f / il)];
      const a0 = W(A, ia, h[k], -0.05, y + h[k] + 0.25), b0 = W(Bp, ib, h[k1], -0.05, y + h[k1] + 0.25);
      const a1 = W(A, ia, 0, d[k] * 0.35 + 0.15, y + h[k] * 0.32 + 0.08), b1 = W(Bp, ib, 0, d[k1] * 0.35 + 0.15, y + h[k1] * 0.32 + 0.08);
      const a2 = W(A, ia, 0, d[k] + 0.15, y - 0.03), b2 = W(Bp, ib, 0, d[k1] + 0.15, y - 0.03);
      c.albedo(RUBBLE); uv.off(Rs() * 9, Rs() * 9); c.color(`oklch(${0.9 + Rs() * 0.08} 0.008 ${230 + Rs() * 30})`);
      Q(c, a0, b0, b1, a1, [-A[0], 1.4, -A[1]]); Q(c, a1, b1, b2, a2, [-A[0], 2.5, -A[1]]);
      if (lod > 2) continue;
      const nb = lod === 1 ? 1 + Math.floor(R() * 3) : (R() < 0.5 ? 1 : 0);
      c.albedo(FACE);
      for (let m = 0; m < nb; m++) { const u = 0.15 + R() * 0.7, f = R(), x0 = A[0] + (Bp[0] - A[0]) * u, z0 = A[1] + (Bp[1] - A[1]) * u, il = Math.hypot(x0, z0) || 1, dd = 0.3 + f * (d[k] + 0.2);
        const s = 0.18 + R() * (R() < 0.25 ? 0.5 : 0.25), hy = Math.max(0, (h[k] + 0.25) * (1 - dd / (d[k] + 0.15)) * 0.8);
        uv.off(R() * 5, R() * 5); rough(c, R, x0 * (1 - dd / il), y + hy - s * 0.3, z0 * (1 - dd / il), s); }
    } }
}
function rampDress(c, r, R, lod) {
  const z0 = r.zc - r.wid / 2, z1 = r.zc + r.wid / 2;
  c.albedo(RUBBLE); c.color("oklch(0.9 0.02 70)"); rampSolid(c, r);
  if (lod > 2) return;
  // cart track: sleepers and two rails down the slope
  const len = Math.hypot(r.xTop - r.xBot, r.top - r.bot), ang = Math.atan2(r.top - r.bot, r.xTop - r.xBot) * 180 / Math.PI, n = Math.round(len / 0.9);
  c.albedo(WOOD); c.color("oklch(0.62 0.04 60)");
  for (let k = 0; k <= n; k++) { const t = k / n, x = r.xBot + (r.xTop - r.xBot) * t, y = r.bot + (r.top - r.bot) * t; OB(c, x, y + 0.04, r.zc, 0.11, 0.05, 0.72, (R() - 0.5) * 6, ang); }
  c.color("oklch(0.5 0.035 55)");
  for (const s of [-0.5, 0.5]) OB(c, (r.xTop + r.xBot) / 2, (r.top + r.bot) / 2 + 0.12, r.zc + s, len / 2, 0.05, 0.05, 0, ang);
  if (lod > 1) return;
  // dry-stone kerb along the open side
  c.albedo(OLDFACE);
  for (let x = Math.min(r.xBot, r.land) + 0.3; x < Math.max(r.xBot, r.land) - 0.2; x += 0.75 + R() * 0.4) {
    const t = Math.min(1, Math.max(0, (x - r.xBot) / (r.xTop - r.xBot))), y = r.bot + (r.top - r.bot) * t, s = 0.22 + R() * 0.12;
    c.color(`oklch(${0.84 + R() * 0.1} 0.012 ${70 + R() * 30})`); OB(c, x, y + s * 0.5, z0 + 0.18, s * 1.3, s, s, R() * 30, (R() - 0.5) * 14); }
}
function stack(c, R, x, y, z, nx, ny, yaw) {
  c.albedo(ASHLAR);
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx - (j % 2); i++) {
    c.color(`oklch(${0.93 + R() * 0.06} 0.012 85)`);
    OB(c, x + Math.cos(yaw) * (i * 1.3 + (j % 2) * 0.65), y + 0.33 + j * 0.66, z - Math.sin(yaw) * (i * 1.3 + (j % 2) * 0.65), 0.62, 0.32, 0.4, yaw * 180 / Math.PI + (R() - 0.5) * 4, 0);
  }
}
function rough(c, R, x, y, z, s) { c.color(`oklch(${0.8 + R() * 0.16} 0.012 ${70 + R() * 40})`); OB(c, x, y + s * 0.35, z, s * (0.9 + R() * 0.6), s * (0.5 + R() * 0.3), s * (0.7 + R() * 0.4), R() * 180, (R() - 0.5) * 30); }

// explicit uvs: the face picture laid big (one tile per 2.2 m) with a per-block offset so no two blocks show the same
// patch; others at their old one-tile-per-metre. Every emit goes through tri() so uvs stay in vertex order.
function uvCtx(c0) {
  const uvs = [], tri0 = (...v) => c0.tri(...v); let s = 1, ou = 0, ov = 0;
  const proj = (V) => { let nx = 0, ny = 0, nz = 0;
    for (let m = 0; m < V.length; m++) { const a = V[m], b = V[(m + 1) % V.length]; nx += (a[1] - b[1]) * (a[2] + b[2]); ny += (a[2] - b[2]) * (a[0] + b[0]); nz += (a[0] - b[0]) * (a[1] + b[1]); }
    const l = Math.hypot(nx, ny, nz) || 1; ny /= l;
    if (Math.abs(ny) > 0.72) return V.map(q => [q[0] * s + ou, q[2] * s + ov]);
    const hl = Math.hypot(nx, nz) || 1, tx = -nz / hl, tz = nx / hl; return V.map(q => [(q[0] * tx + q[2] * tz) * s + ou, q[1] * s + ov]); };
  const c = { params: c0.params, lod: c0.lod,
    color: (...a) => c0.color(...a), smooth: () => c0.smooth(), flat: () => c0.flat(),
    albedo: (t) => { c0.albedo(t); s = t === FACE ? 1 / 3.6 : t === RUBBLE ? 0.6 : 1; ou = ov = 0; },
    tri: (ax, ay, az, bx, by, bz, cx, cy, cz) => { const U = proj([[ax, ay, az], [bx, by, bz], [cx, cy, cz]]); tri0(ax, ay, az, bx, by, bz, cx, cy, cz); uvs.push(...U[0], ...U[1], ...U[2]); },
    quad: (ax, ay, az, bx, by, bz, cx, cy, cz, dx, dy, dz) => { const U = proj([[ax, ay, az], [bx, by, bz], [cx, cy, cz], [dx, dy, dz]]);
      tri0(ax, ay, az, bx, by, bz, cx, cy, cz); tri0(ax, ay, az, cx, cy, cz, dx, dy, dz); uvs.push(...U[0], ...U[1], ...U[2], ...U[0], ...U[2], ...U[3]); } };
  return { c, uvs, off: (u, v) => { ou = u; ov = v; } };
}
export function geometry(c0) {
  const uv = uvCtx(c0), c = uv.c;
  const p = c.params, Lt = layout(p), { bs, polys, bots, ramps, heaps } = Lt, R = rng((p.seed ?? 7) * 7919), lod = c.lod;
  // weathered bench floors
  c.albedo(RUBBLE); c.color("oklch(0.97 0.012 80)"); floors(c, Lt);   // critic r7: dark lichen floors made the pit read as a hole; quarry floors are pale stone dust
  // the rock behind the blocks: fresh stone a shade deeper, so the splits between blocks read as lines, not holes
  c.albedo(FACE); c.color("oklch(0.74 0.008 235)"); walls(c, Lt);
  if (lod <= 4) faceBlocks(c, Lt, R, lod, uv);
  if (lod <= 3) scree(c, Lt, p, R, lod, uv);
  // spalls and spoil chips on the bench floors
  if (lod === 1) { c.albedo(FACE);
    for (let m = 0; m < 90; m++) { const i = Math.floor(R() * bs.length), k = Math.floor(R() * Lt.N), P = polys[i], In = polys[i + 1], k1 = (k + 1) % Lt.N, u = R(), f = 0.05 + R() * (R() < 0.6 ? 0.25 : 0.85);
      const ox = P[k][0] + (P[k1][0] - P[k][0]) * u, oz = P[k][1] + (P[k1][1] - P[k][1]) * u, ix = In ? In[k][0] + (In[k1][0] - In[k][0]) * u : 0, iz = In ? In[k][1] + (In[k1][1] - In[k][1]) * u : 0;
      const x = ox + (ix - ox) * f, z = oz + (iz - oz) * f;
      if (ramps.some(r => Math.abs(z - r.zc) < r.wid / 2 + 0.5 && x > Math.min(r.xBot, r.land) - 0.5 && x < Math.max(r.xBot, r.land) + 0.5)) continue;
      rough(c, R, x, bots[i], z, 0.12 + R() * 0.3); } }
  for (const r of ramps) rampDress(c, r, R, lod);
  // spoil heaps west of the rim: rubble mounds with rough-split blocks on and round them
  c.albedo(RUBBLE); c.color("oklch(0.88 0.012 80)"); c.smooth(); for (const h of heaps) heapMesh(c, h); c.flat();
  if (lod <= 3) { c.albedo(FACE); for (const h of heaps) { const n = lod === 1 ? 12 : lod === 2 ? 6 : 2;
    for (let m = 0; m < n; m++) { const t = R() * TAU, f = 0.25 + R() * 0.95, rr = h.r * f, y = f > 1 ? -0.1 : h.h * (1 - f) * 0.85;
      rough(c, R, h.x + Math.cos(t) * rr, y - 0.15, h.z + Math.sin(t) * rr, 0.35 + R() * 0.55); } } }
  // cut ashlar waiting for carting: on the quarry floor under the hoist, and on the rim
  const deep = bs[bs.length - 1], fy = bots[bots.length - 1];
  stack(c, R, -deep[0] / 4, fy, -deep[1] / 2 + 3.4, 4, lod > 2 ? 1 : 3, 0);
  stack(c, R, deep[0] / 4 - 0.5, fy, -deep[1] / 2 + 4.6, 3, lod > 2 ? 1 : 2, 0.35);
  stack(c, R, bs[0][0] / 2 + 4, 0, -bs[0][1] / 2 + 3, 5, lod > 2 ? 1 : 3, Math.PI / 2);
  if (lod <= 2) stack(c, R, bs[0][0] / 2 + 6.5, 0, -bs[0][1] / 2 + 3.5, 4, 2, Math.PI / 2);
  // timber hoist on the -z rim, boom out over the quarry floor, a block on the rope coming down to the stack
  const hx = -deep[0] / 4 + 1.9, hz = -bs[0][1] / 2 - 2.8, H = 9, tipZ = -deep[1] / 2 + 3.4;
  c.albedo(WOOD); c.color("oklch(0.75 0.04 60)");
  B(c, hx - 0.22, 0, hz - 0.22, hx + 0.22, H, hz + 0.22);
  B(c, hx - 1.4, 0, hz - 1.4, hx + 1.4, 0.3, hz + 1.4);
  if (lod <= 2) for (const [dx, dz] of [[-1.2, 0], [1.2, 0], [0, -1.3]]) { const L = Math.hypot(dx, 5), a = Math.atan2(dx || dz, 5);
    const yaw = dx ? 0 : 90; OB(c, hx + dx / 2, 2.5, hz + dz / 2, 0.11, L / 2, 0.11, yaw, dx ? -a * 180 / Math.PI : a * 180 / Math.PI); }
  const by = H - 2.2, bLen = tipZ - hz, bAng = Math.atan2(1.5, bLen) * 180 / Math.PI;
  OB(c, hx, by + 0.75, hz + bLen / 2, 0.16, 0.16, Math.hypot(bLen, 1.5) / 2, 0, 0);
  c.color("oklch(0.7 0.04 60)"); OB(c, hx, by + 0.75, hz + bLen / 2, Math.hypot(bLen, 1.5) / 2, 0.16, 0.16, 90, bAng);
  OB(c, hx, (H + by + 1.5) / 2 + 0.3, hz + bLen / 2, Math.hypot(bLen, H - by) / 2 * 1.02, 0.05, 0.05, 90, -Math.atan2(H - by - 1.5, bLen) * 180 / Math.PI);
  c.albedo(null); c.color("oklch(0.55 0.05 70)"); const ty = by + 1.5, hang = fy + 3.6;
  B(c, hx - 0.03, hang + 0.7, tipZ - 0.03, hx + 0.03, ty, tipZ + 0.03);
  c.albedo(ASHLAR); c.color("oklch(0.95 0.01 85)"); B(c, hx - 0.62, hang - 0.32, tipZ - 0.4, hx + 0.62, hang + 0.32, tipZ + 0.4);
  c.albedo(WOOD); c.color("oklch(0.6 0.04 60)"); B(c, hx - 0.8, hang + 0.32, tipZ - 0.06, hx + 0.8, hang + 0.47, tipZ + 0.06);
  if (lod <= 2) { B(c, hx + 0.6, 0, hz - 0.7, hx + 0.75, 1.1, hz + 0.7); B(c, hx + 2.0, 0, hz - 0.7, hx + 2.15, 1.1, hz + 0.7);
    const N = 8; for (let k = 0; k < N; k++) { const a0 = k / N * TAU, a1 = (k + 1) / N * TAU, r = 0.38, y = 0.85, z = hz;
      c.quad(hx + 0.75, y + Math.sin(a0) * r, z + Math.cos(a0) * r, hx + 0.75, y + Math.sin(a1) * r, z + Math.cos(a1) * r, hx + 2.0, y + Math.sin(a1) * r, z + Math.cos(a1) * r, hx + 2.0, y + Math.sin(a0) * r, z + Math.cos(a0) * r); } }
  // a stone cart at the foot of the last ramp
  const rf = ramps[ramps.length - 1]; if (rf && lod <= 3) { const cx = rf.xBot - rf.s * 1.6, cz = rf.zc - 0.2, y0 = rf.bot;
    c.albedo(WOOD); c.color("oklch(0.72 0.04 60)"); B(c, cx - 1.2, y0 + 0.55, cz - 0.7, cx + 1.2, y0 + 1.15, cz + 0.7);
    c.color("oklch(0.45 0.03 60)"); for (const s of [-1, 1]) B(c, cx - 0.45, y0, cz + s * 0.78 - 0.07, cx + 0.45, y0 + 0.9, cz + s * 0.78 + 0.07);
    c.albedo(ASHLAR); c.color("oklch(0.93 0.01 85)"); B(c, cx - 0.9, y0 + 1.15, cz - 0.5, cx + 0.5, y0 + 1.6, cz + 0.5); }
  c.albedo(null); c.color(null);
  return { uvs: uv.uvs };
}
export function collider(c) {
  const p = c.params, Lt = layout(p), { bs, ramps, heaps, bots } = Lt;
  floors(c, Lt); walls(c, Lt);
  for (const r of ramps) { rampSolid(c, r);   // a bridge over the block ledge from the ramp head to the bench above
    const z1 = r.zc + r.wid / 2, xa = r.land, xb = r.xTop - r.s * 1.2;
    Q(c, [Math.min(xa, xb), r.top, z1], [Math.max(xa, xb), r.top, z1], [Math.max(xa, xb), r.top, r.b + 0.3], [Math.min(xa, xb), r.top, r.b + 0.3], [0, 1, 0]); }
  for (const h of heaps) heapMesh(c, h);
  const deep = bs[bs.length - 1], fy = bots[bots.length - 1], hx = -deep[0] / 4 + 1.9, hz = -bs[0][1] / 2 - 2.8;
  return [{ kind: "box", width: 0.5, height: 9, depth: 0.5, center: [hx, 4.5, hz] },
    { kind: "box", width: 5.2, height: 2, depth: 0.85, center: [-deep[0] / 4 + 1.95, fy + 1, -deep[1] / 2 + 3.4] },
    { kind: "box", width: 0.85, height: 2, depth: 6.6, center: [bs[0][0] / 2 + 4, 1, -bs[0][1] / 2 + 5.6] }];
}
