// HIGHBRIDGE STREET FURNITURE: the benches, handcarts and planted trees along the connecting streets (scripts/lib/data/hb/streets.yml).
// params.kind: bench { } | cart { seed } | tree { seed, s }. Origin = feet on the paving; front faces -z.
import { paint, flatc, BX, RB, LA, CY, PIPE, SEG, BARREL, FS, OAK, IR, CANVAS, HAY, STONE, WOOD, IRONC } from "../lib/buildkit.js";
import { bench_hbStreet } from "../lib/pieces/bench.js";   // shared bench piece, drawn in this building's palette
const ASH = "cdn/texture-grey-ashlar-stone-wall.png";
const LEAF = ["oklch(0.46 0.1 138)", "oklch(0.52 0.11 128)", "oklch(0.42 0.09 145)", "oklch(0.56 0.1 120)"];
function rng(seed) { let a = (Math.floor((seed || 1) * 2654435761) >>> 0) || 1;
  return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

function cart(c, p, D) { // a two-wheeled handcart, tipped on its shafts, a load of sacks or barrels
  const r = rng(p.seed ?? 2);
  paint(c, OAK, WOOD); RB(c, 0, 0.75, 0, 1.3, 0.08, 2.0, 0, 6); for (const x of [-0.62, 0.62]) RB(c, x, 0.98, 0, 0.06, 0.4, 2.0, 0, 6);
  RB(c, 0, 0.98, 0.98, 1.3, 0.4, 0.06, 0, 6);
  for (const x of [-0.45, 0.45]) SEG(c, [x, 0.7, -0.9], [x, 0.18, -2.1], 0.08, 0.08);
  for (const x of [-0.78, 0.78]) { paint(c, OAK, "oklch(0.55 0.05 60)"); LA(c, x, 0.55, 0.15, [[0, -0.06], [0.55, -0.06], [0.55, 0.06], [0, 0.06]], D <= 2 ? 14 : 8, true, "x");
    if (D <= 2) { paint(c, IR, IRONC); LA(c, x, 0.55, 0.15, [[0.53, -0.07], [0.58, -0.07], [0.58, 0.07], [0.53, 0.07]], 14, true, "x"); } }
  if (D >= 4) return;
  if (r() < 0.5) { paint(c, CANVAS, "oklch(0.78 0.04 80)"); for (let i = 0; i < 4; i++) RB(c, (r() - 0.5) * 0.7, 1.0 + r() * 0.15, (r() - 0.5) * 1.3, 0.45, 0.35, 0.6, r() * 40, 0, (r() - 0.5) * 20); }
  else { for (let i = 0; i < 2; i++) BARREL(c, i ? 0.28 : -0.28, 0.82, i ? 0.4 : -0.3, 0.26, 0.7, D); paint(c, HAY, "oklch(0.8 0.1 85)"); RB(c, 0, 0.9, 0.55, 0.9, 0.2, 0.5, 10); }
}
function tree(c, p, D) { // a street lime in a stone-kerbed bed: grey bark, a rounded crown
  const r = rng(p.seed ?? 1), s = p.s ?? 1;
  paint(c, ASH, "oklch(0.8 0.02 80)"); BX(c, -0.9, 0, -0.9, 0.9, 0.35, -0.72); BX(c, -0.9, 0, 0.72, 0.9, 0.35, 0.9); BX(c, -0.9, 0, -0.72, -0.72, 0.35, 0.72); BX(c, 0.72, 0, -0.72, 0.9, 0.35, 0.72);
  flatc(c, "oklch(0.34 0.05 60)"); BX(c, -0.72, 0, -0.72, 0.72, 0.28, 0.72);
  const h = (3.4 + r() * 0.8) * s; paint(c, OAK, "oklch(0.62 0.03 70)");
  PIPE(c, [0, 0.2, 0], [0.1 * s, h, 0.05 * s], 0.2 * s, 0.12 * s, D <= 2 ? 8 : 5);
  if (D <= 2) for (let i = 0; i < 4; i++) { const a = i * 1.57 + r(); PIPE(c, [0.05 * s, h * 0.75, 0], [Math.cos(a) * 1.2 * s, h + 0.6 * s, Math.sin(a) * 1.2 * s], 0.08 * s, 0.04 * s, 5); }
  const n = D <= 2 ? 11 : D <= 4 ? 5 : 2;
  for (let i = 0; i < n; i++) { const a = r() * 6.283, d = i === 0 ? 0 : (0.6 + r() * 0.9) * s, w = (1.3 + r() * 0.8) * s; flatc(c, LEAF[Math.floor(r() * LEAF.length)]);
    const y0 = h - 0.1 * s + (r() - 0.3) * 0.9 * s, k = D <= 2 ? 7 : 5;
    LA(c, Math.cos(a) * d, y0, Math.sin(a) * d, [[0.05, 0], [w * 0.42, w * 0.14], [w * 0.52, w * 0.42], [w * 0.4, w * 0.7], [0.05, w * 0.86]], k, true, "y", false); }
}
export function geometry(c) { const p = c.params ?? {}, D = c.lod ?? 1, k = p.kind ?? "bench";
  if (k === "bench") return bench(c, D); if (k === "cart") return cart(c, p, D); if (k === "tree") return tree(c, p, D); }
export function collider(c) { const p = c.params ?? {}, k = p.kind ?? "bench", s = p.s ?? 1;
  const b = (w, h, d, y = 0) => ({ kind: "box", width: w, height: h, depth: d, center: [0, y + h / 2, 0] });
  if (k === "bench") return [b(1.9, 0.9, 0.45)]; if (k === "cart") return [b(1.7, 1.3, 2.1)]; if (k === "tree") return [b(1.8, 0.35, 1.8), b(0.4 * s, 3.4 * s, 0.4 * s)]; return []; }
const bench = bench_hbStreet({ ASH, BX, IR, IRONC, OAK, RB, WOOD, paint });
