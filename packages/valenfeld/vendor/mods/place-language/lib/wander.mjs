// WANDER: the ways between rooms bent like the rooms are (creator Nov 7: "flexbox generates layouts that are a bit too...
// blocky. so we need to combine those primitives with natural layouts"). A Flex or Grid with organic on hands every Way
// under it a wander = { amount, seed } (WanderContext); the link row carries it into the plan, and linkPath (tools/dungeon/
// plan-lib.mjs) asks wanderPath for the corridor's centre line: 2–4 seeded bends on the 2 m grid, lateral offset up to
// amount × 3 m, tested against every other room (a bend that would cut one is halved, then dropped: the way falls back to its
// drafted dogleg). The walls along it go rough: every ~1 m node gets its own seeded half-width each side, and a long way gets
// 1–2 one-cell (2 m) alcoves. Same seed, same way; no wander on the row, nothing changes. A locked way keeps its dogleg so its
// plug seats mid-run. The dungeon kit (scripts/gen/dungeon-kit.js bentCorridor) draws the nodes; plan-map draws pts.
import { createContext } from "./react.mjs";

export const WanderContext = createContext(null, "wander");
// organic prop (number | { amount, seed, ways }) → the wander a layout hands its ways, or null (organic off, or ways: false)
export function wanderOf(organic) {
  const o = typeof organic === "number" ? { amount: organic } : organic ?? null;
  if (!o || !(o.amount > 0) || o.ways === false) return null;
  const w = typeof o.ways === "object" ? o.ways : {};
  return { amount: Math.min(1, w.amount ?? o.amount), seed: w.seed ?? o.seed ?? 1, ...(w.alcoves != null ? { alcoves: w.alcoves } : {}), ...(w.rough != null ? { rough: w.rough } : {}), ...((w.shape ?? o.shape) ? { shape: w.shape ?? o.shape } : {}) };
}
export const WANDER_HOWS = new Set(["tunnel", "crawl", "ramp", "passage", undefined]);

function hash(str) { let h = 2166136261 >>> 0; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h; }
function rng(n) { let a = n >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

const HW = 1.5, CLEAR = HW + 0.4 + 0.6;   // corridor half-width (kit CW/2), + wall, + rough: what must stay out of other rooms

// SHAPES: a passage is a spatial thing with a shape (creator Nov 7: "squiggles is ONE type of wandering… we need spatial
// components"). Each shape says, for t 0..1 along the run: where the centre line sits across (off, in units of the lateral
// budget), how wide it is (wid, × the hall's half-width) and how rough its walls are. The passage kit
// (components/passage/*) names one per component; wanderPath draws whichever a way carries.
const tri = (x) => 1 - 4 * Math.abs(((x % 1) + 1) % 1 - 0.5);   // -1..1 triangle wave, sharp turns
export const SHAPES = {
  // one or two long lazy lobes: a dug passage following softer rock
  meander:    { pick: 0.36, prep: (r) => ({ lobes: 1 + (r() < 0.45 ? 0.5 : 0) + (r() < 0.2 ? 0.5 : 0), ph: r() * 0.3 }),
                off: (t, k) => Math.sin(Math.PI * (t * k.lobes * 2 + k.ph)) * Math.sin(Math.PI * t) ** 0.4, wid: () => 1, rough: 0.35, alcoves: true },
  // hard zigzag legs, the turn of a climbing path folded on itself
  switchback: { pick: 0.12, min: 12, prep: (r) => ({ legs: 3 + Math.floor(r() * 2) }),
                off: (t, k) => tri(t * k.legs / 2 + 0.25) * Math.min(1, t * 6, (1 - t) * 6), wid: () => 0.9, rough: 0.15, alcoves: false },
  // a narrow crack: nearly straight, jagged jogs, tight and very rough
  fissure:    { pick: 0.16, prep: (r) => ({ jog: Array.from({ length: 64 }, () => r() * 2 - 1) }),
                off: (t, k) => 0.22 * k.jog[Math.floor(t * 9)] * Math.min(1, t * 8, (1 - t) * 8), wid: (t) => 0.62 + 0.08 * Math.sin(t * 23), rough: 1.0, alcoves: false },
  // the run swells into a chamber-like belly midway, gentle drift
  gallery:    { pick: 0.18, prep: (r) => ({ at: 0.4 + r() * 0.2, ph: r() < 0.5 ? -1 : 1 }),
                off: (t, k) => k.ph * 0.35 * Math.sin(Math.PI * t), wid: (t, k) => 1 + 1.15 * Math.exp(-(((t - k.at) / 0.2) ** 2)), rough: 0.55, alcoves: false },
  // a fallen-rock pinch: the way shoulders down to a squeeze then opens again
  choke:      { pick: 0.14, prep: (r) => ({ at: 0.35 + r() * 0.3, ph: r() < 0.5 ? -1 : 1 }),
                off: (t, k) => k.ph * 0.3 * Math.exp(-(((t - k.at) / 0.18) ** 2)), wid: (t, k) => 1 - 0.48 * Math.exp(-(((t - k.at) / 0.1) ** 2)), rough: 0.7, alcoves: true },
  // the old many-bend wiggle, kept as one choice among many, never the default
  squiggle:   { pick: 0.04, prep: (r) => ({ n: 3 + Math.floor(r() * 2) }),
                off: (t, k) => Math.sin(Math.PI * t * k.n) * Math.min(1, t * 5, (1 - t) * 5), wid: () => 1, rough: 0.4, alcoves: true },
};
export const SHAPE_NAMES = Object.keys(SHAPES);
function pickShape(r, len) { const ok = SHAPE_NAMES.filter((n) => len >= (SHAPES[n].min ?? 0)), tot = ok.reduce((s, n) => s + SHAPES[n].pick, 0); let x = r() * tot; for (const n of ok) { x -= SHAPES[n].pick; if (x <= 0) return n; } return ok[0]; }

// base: linkPath's { axis, u0, u1, la, lb, stub }; others: the other rooms' rects { x0, x1, z0, z1 } in metres; G: grid metres
// → { nodes: [[u, l, wl, wr]…], shape, bends, alcoves, pinch? } or null (too short to wander, or every try cut a room)
export function wanderPath(base, w, others, G, key) {
  if (!w || !(w.amount > 0)) return null;
  const { axis, u0, u1, la, lb, stub } = base, r = rng(hash(`${w.seed}|${key}`)), a = w.amount;
  const xz = (u, l) => axis === "z" ? [l, u] : [u, l];
  const s0 = u0 + stub, s1 = u1 - stub, run = s1 - s0;
  if (run < G * 2) return null;
  const name = w.shape && SHAPES[w.shape] ? w.shape : pickShape(r, run), S = SHAPES[name], k = S.prep(r);
  const budget = Math.max(G, a * Math.min(4, run * 0.28)) * (r() < 0.5 ? -1 : 1);
  const blocked = (pts, pad) => { for (let i = 0; i + 1 < pts.length; i++) { const [x0, z0] = pts[i], [x1, z1] = pts[i + 1], n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, z1 - z0) / 0.5));
    for (let j = 0; j <= n; j++) { const x = x0 + (x1 - x0) * j / n, z = z0 + (z1 - z0) * j / n;
      for (const q of others) if (x > q.x0 - pad && x < q.x1 + pad && z > q.z0 - pad && z < q.z1 + pad) return true; } } return false; };
  const N = Math.max(4, Math.round(run / 0.9)), rough = (w.rough ?? S.rough) * a * 0.5;
  let nodes = null;
  for (const scale of [1, 0.6, 0.3]) {
    const mid = [];
    for (let i = 0; i <= N; i++) { const t = i / N, ease = t * t * (3 - 2 * t), l0 = la + (lb - la) * ease, wd = HW * S.wid(t, k);
      mid.push([s0 + run * t, l0 + S.off(t, k) * budget * scale, wd, wd]); }
    const maxW = Math.max(...mid.map((m) => m[2]));
    if (!blocked(mid.map(([u, l]) => xz(u, l)), CLEAR + (maxW - HW))) { nodes = [[u0, la, HW, HW], ...mid, [u1, lb, HW, HW]]; break; }
  }
  if (!nodes) return null;
  const M = nodes.length;
  for (let i = 2; i < M - 2; i++) { nodes[i][2] = Math.max(0.8, nodes[i][2] + (r() * 2 - 1) * rough); nodes[i][3] = Math.max(0.8, nodes[i][3] + (r() * 2 - 1) * rough); }
  // alcoves: one cell deep, two nodes wide, never within 3 nodes of a door, never into a room; only shapes that take them
  const alcoves = [], nA = !S.alcoves || w.alcoves === 0 ? 0 : M >= 14 ? Math.min(w.alcoves ?? 2, 1 + Math.floor(r() * 2)) : M >= 9 ? Math.min(w.alcoves ?? 1, 1) : 0;
  for (let t = 0; t < nA * 4 && alcoves.length < nA; t++) {
    const i = 3 + Math.floor(r() * (M - 7)), side = r() < 0.5 ? 2 : 3;
    if (alcoves.some((q) => Math.abs(q.i - i) < 4)) continue;
    const [ua, lA] = nodes[i], [ub, lB] = nodes[i + 1], du = ub - ua, dl = lB - lA, m = Math.hypot(du, dl) || 1, sg = side === 3 ? 1 : -1;
    const deep = HW + G, tip = xz((ua + ub) / 2 + (-dl / m) * sg * deep, (lA + lB) / 2 + (du / m) * sg * deep);
    if (blocked([tip, tip], 0.6)) continue;
    const mid = xz((ua + ub) / 2 + (-dl / m) * sg * (HW + G / 2), (lA + lB) / 2 + (du / m) * sg * (HW + G / 2));
    nodes[i][side] = nodes[i + 1][side] = deep; alcoves.push({ i, side: side === 3 ? "right" : "left", at: mid.map((v) => Math.round(v * 100) / 100) });
  }
  let bends = 0; for (let i = 2; i < M - 1; i++) { const d1 = nodes[i][1] - nodes[i - 1][1], d0 = nodes[i - 1][1] - nodes[i - 2][1]; if (Math.sign(d1) !== Math.sign(d0) && Math.abs(d1) + Math.abs(d0) > 0.05) bends++; }
  const r2 = (v) => Math.round(v * 100) / 100, out = { nodes: nodes.map((n) => n.map(r2)), shape: name, bends, alcoves };
  if (name === "choke") { let mi = 1; for (let i = 1; i < M - 1; i++) if (nodes[i][2] + nodes[i][3] < nodes[mi][2] + nodes[mi][3]) mi = i; out.pinch = xz(nodes[mi][0], nodes[mi][1]).map(r2); }
  return out;
}
