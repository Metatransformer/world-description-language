// Cairns, one kit. params.kind picks the piece:
//  (none)  a wayfarer's cairn: flat fieldstones stacked smaller toward the top. params.seed, params.n (stones).
//  "great" a town's great cairn: dry-stone courses laid round a rubble core, a cone params.h tall (6) on a params.r base radius (2.6),
//          staggered joints, moss on the low ledges, a pointed capstone, tumbled stones round the foot. ~3k tris at lod 1.
//  "pole"  a prayer-rag pole: a leaning ash pole params.h tall (3.4) with a cross-arm and faded rags streaming downwind (+z).
// Pair "great" with scripts/gen/standing-stone.js and a few "pole"s as children, each set on its own ground.
import { G, X, rng, TEX } from "../lib/geo.js";
const RAGS = ["oklch(0.52 0.12 35)", "oklch(0.74 0.09 85)", "oklch(0.9 0.02 90)", "oklch(0.45 0.06 250)", "oklch(0.55 0.07 140)", "oklch(0.6 0.1 20)"];

export function geometry(ctx) {
  const k = ctx.params.kind;
  if (k === "great") return great(ctx);
  if (k === "pole") return pole(ctx);
  const g = new G(ctx), lod = ctx.lod || 1, s = ctx.params.seed ?? 1, R = rng(8300 + s * 7), n = ctx.params.n ?? 5;
  ctx.albedo(TEX.rock); ctx.color("oklch(0.86 0.01 90)");
  let y = 0, r = 0.55;
  for (let i = 0; i < n; i++) {
    const h = r * (0.38 + R() * 0.15), ox = (R() - 0.5) * r * 0.25, oz = (R() - 0.5) * r * 0.25;
    g.tris(g.blob([ox, y + h, oz], [r * (0.9 + R() * 0.2), h, r * (0.8 + R() * 0.2)], lod >= 3 ? 0 : 1, 0.18, 1.2, s * 10 + i));
    y += h * 1.8; r *= 0.74;
  }
  ctx.albedo(null); ctx.color(null);
}

function great(ctx) {
  const g = new G(ctx), lod = ctx.lod || 1, s = ctx.params.seed ?? 1, R = rng(4100 + s * 13);
  const H = ctx.params.h ?? 6, R0 = ctx.params.r ?? 2.6, TOP = H * 0.9;
  const rAt = (y) => Math.max(0.24, R0 * Math.pow(Math.max(0, 1 - y / H), 0.78));
  // the rubble core: a frustum stack, dark so the joints between laid stones read as shadow; sunk 1.2 m for a sloped foot
  const sides = lod <= 2 ? 14 : 10, inset = lod <= 2 ? 0.84 : 0.98;
  const ys = [-1.2, 0, TOP * 0.25, TOP * 0.5, TOP * 0.75, TOP];
  const ring = (y) => { const r = (y < 0 ? R0 * 1.02 : rAt(y)) * inset, out = []; for (let i = 0; i < sides; i++) { const a = (i / sides) * Math.PI * 2; out.push([Math.cos(a) * r, y, Math.sin(a) * r]); } return out; };
  const rings = ys.map(ring);
  ctx.albedo(TEX.rock); ctx.color(lod <= 2 ? "oklch(0.5 0.01 80)" : "oklch(0.8 0.012 85)");
  for (let k = 0; k < rings.length - 1; k++) for (let i = 0; i < sides; i++) { const j = (i + 1) % sides; g.quad(rings[k][i], rings[k + 1][i], rings[k + 1][j], rings[k][j]); }
  const apex = [0, TOP + 0.15, 0], last = rings[rings.length - 1];
  for (let i = 0; i < sides; i++) g.tri(apex, last[(i + 1) % sides], last[i]);
  if (lod >= 4) { ctx.albedo(null); ctx.color(null); return; }
  // the laid courses: flat stones, joints staggered course to course, each a little different in size and grey
  const ch = lod <= 1 ? 0.36 : 0.62, L = lod <= 1 ? 0.8 : 1.3, det = 0, stones = [];
  let course = 0;
  for (let y = 0; y < TOP - ch * 0.5; y += ch, course++) {
    const r = rAt(y + ch * 0.5), n = Math.max(3, Math.round((Math.PI * 2 * r) / L)), len = ((Math.PI * 2 * r) / n) * 1.08;
    for (let i = 0; i < n; i++) {
      const th = ((i + (course % 2) * 0.5 + (R() - 0.5) * 0.25) / n) * Math.PI * 2;
      const dep = 0.3 + R() * 0.14, rr = r - dep * 0.7;
      const yaw = (Math.atan2(-Math.cos(th), -Math.sin(th)) * 180) / Math.PI;
      stones.push({
        T: X([Math.cos(th) * rr, y + ch * 0.5, Math.sin(th) * rr], yaw, (R() - 0.5) * 6, (R() - 0.5) * 8),
        tris: g.blob([0, 0, 0], [len * (0.46 + R() * 0.08), ch * (0.5 + R() * 0.12), dep], det, 0.22, 1.4, s * 100 + stones.length),
        tint: `oklch(${(0.78 + R() * 0.16).toFixed(3)} ${(0.008 + R() * 0.012).toFixed(3)} ${Math.round(60 + R() * 50)})`,
        moss: course < 6 && R() < 0.55,
      });
    }
  }
  // the capstone: an upright pointed slab crowning the cone
  stones.push({ T: X([0, TOP + 0.35, 0], R() * 180, 0, (R() - 0.5) * 6), tris: g.blob([0, 0, 0], [0.34, 0.62, 0.22], lod <= 1 ? 1 : 0, 0.15, 1.1, s * 100 + 999), tint: "oklch(0.84 0.01 80)", moss: false });
  // tumbled stones round the foot, half buried
  if (lod <= 2) {
    const m = lod <= 1 ? 16 : 9;
    for (let i = 0; i < m; i++) {
      const th = (i / m) * Math.PI * 2 + R() * 0.3, rr = R0 + 0.15 + R() * 0.6, q = 0.22 + R() * 0.22;
      stones.push({ T: X([Math.cos(th) * rr, q * 0.25, Math.sin(th) * rr], R() * 360, (R() - 0.5) * 20, (R() - 0.5) * 20), tris: g.blob([0, 0, 0], [q * 1.4, q, q * 1.1], 0, 0.25, 1.3, s * 100 + 500 + i), tint: `oklch(${(0.74 + R() * 0.14).toFixed(3)} 0.012 80)`, moss: R() < 0.7 });
    }
  }
  ctx.albedo(TEX.rock);
  for (const st of stones) { ctx.color(st.tint); g.at(st.T, () => g.tris(st.moss ? st.tris.filter((t) => t[3][1] <= 0.55) : st.tris)); }
  if (lod <= 2) {
    ctx.albedo(TEX.moss); ctx.color("oklch(0.7 0.015 100)");
    for (const st of stones) if (st.moss) g.at(st.T, () => g.tris(st.tris.filter((t) => t[3][1] > 0.55)));
  }
  ctx.albedo(null); ctx.color(null);
}

function pole(ctx) {
  const g = new G(ctx), lod = ctx.lod || 1, s = ctx.params.seed ?? 1, R = rng(5200 + s * 17), H = ctx.params.h ?? 3.4;
  const seg = lod <= 1 ? 6 : 4, lean = (R() - 0.5) * 0.25, top = [lean, H, (R() - 0.5) * 0.12];
  ctx.albedo(TEX.bark); ctx.color("oklch(0.82 0.02 70)");
  g.tube([[0, -0.4, 0, 0.065], [lean * 0.5, H * 0.5, top[2] * 0.5, 0.055], [...top, 0.04]], seg, { capB: true });
  const ay = H - 0.35, arm = 0.55 + R() * 0.3, a0 = [lean * 0.9 - arm, ay, top[2] * 0.9], a1 = [lean * 0.9 + arm, ay + 0.06, top[2] * 0.9];
  g.tube([[...a0, 0.03], [...a1, 0.03]], seg, { capA: true, capB: true });
  if (lod >= 4) { ctx.albedo(null); ctx.color(null); return; }
  // rags: knotted along the arm and down the pole, each a strip bellied downwind
  ctx.albedo(TEX.canvas);
  const ties = [];
  const nArm = lod <= 2 ? 5 : 3;
  for (let i = 0; i < nArm; i++) { const t = (i + 0.5) / nArm; ties.push([a0[0] + (a1[0] - a0[0]) * t, a0[1] + (a1[1] - a0[1]) * t - 0.03, a0[2]]); }
  if (lod <= 2) for (let i = 0; i < 2; i++) { const t = 0.55 + i * 0.15; ties.push([lean * t, H * t, top[2] * t + 0.05]); }
  const segs = lod <= 1 ? 4 : 2;
  for (const p of ties) {
    const len = 0.45 + R() * 0.45, w = 0.09 + R() * 0.07, sway = 0.12 + R() * 0.2, tw = (R() - 0.5) * 0.6;
    ctx.color(RAGS[Math.floor(R() * RAGS.length)]);
    let prev = null;
    for (let k = 0; k <= segs; k++) {
      const t = k / segs, y = p[1] - len * t, z = p[2] + 0.04 + sway * Math.pow(t, 1.4), cx = p[0] + Math.sin(t * 3 + tw) * 0.04, a = tw * t;
      const hw = (w / 2) * (1 - 0.25 * t), L = [cx - Math.cos(a) * hw, y, z - Math.sin(a) * hw], Rr = [cx + Math.cos(a) * hw, y, z + Math.sin(a) * hw];
      if (prev) g.quad(prev[0], L, Rr, prev[1]);
      prev = [L, Rr];
    }
  }
  // packing stones at the foot
  if (lod <= 2) {
    ctx.albedo(TEX.rock); ctx.color("oklch(0.82 0.01 85)");
    for (let i = 0; i < 3; i++) { const th = (i / 3) * 6.283 + R(), q = 0.14 + R() * 0.08; g.tris(g.blob([Math.cos(th) * 0.2, q * 0.3, Math.sin(th) * 0.2], [q * 1.3, q, q * 1.1], 0, 0.25, 1.3, s * 40 + i)); }
  }
  ctx.albedo(null); ctx.color(null);
}

export function collider(ctx) {
  const P = ctx?.params ?? {}, k = P.kind;
  if (k === "great") {
    const H = P.h ?? 6, R0 = P.r ?? 2.6, TOP = H * 0.9, rAt = (y) => Math.max(0.24, R0 * Math.pow(Math.max(0, 1 - y / H), 0.78));
    return [0, 1, 2].map((i) => { const y0 = (i / 3) * TOP, y1 = ((i + 1) / 3) * TOP; return { kind: "cylinder", radiusBottom: rAt(y0), radiusTop: rAt(y1), height: y1 - y0, center: [0, (y0 + y1) / 2, 0] }; })
      .concat([{ kind: "cylinder", radiusBottom: R0 * 1.02, radiusTop: R0 * 1.02, height: 1.2, center: [0, -0.6, 0] }]);
  }
  if (k === "pole") { const H = P.h ?? 3.4; return { kind: "cylinder", radiusTop: 0.06, radiusBottom: 0.07, height: H, center: [0, H / 2, 0] }; }
  return { kind: "box", width: 1.0, height: 1.4, depth: 1.0 };
}
