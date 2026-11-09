// Ferrow's Arch (#231): the three-span fieldstone bridge where the Royal Road crosses the Vael, older than Highbridge.
// Built along local X (-24..24 m), origin at the riverbed centre. A humped deck, a 12 m centre arch and two 11 m side
// arches on pointed cutwaters, parapets with a coping course. Every face is the body: the deck is walked on (mesh collider).
import { G, TEX } from "../lib/geo.js";
const L = 24, W = 5.6, BED = -1.6;
const top = (x) => 3.6 - 1.25 * (x / L) ** 2;
const SPANS = [[0, 6, 2.0], [-13.5, 5.5, 1.6], [13.5, 5.5, 1.6]]; // centre, half-span, rise
const bot = (x) => { for (const [c, s, r] of SPANS) { const u = (x - c) / s; if (Math.abs(u) < 1) return 0.5 + r * Math.sqrt(1 - u * u); } return BED; };
// a long block between z0..z1 whose underside follows yb(x) and top yt(x), cut in slices along x
function strip(g, xs, z0, z1, yb, yt, ends = true) {
  for (let i = 0; i < xs.length - 1; i++) {
    const a = xs[i], b = xs[i + 1], ba = yb(a), bb = yb(b), ta = yt(a), tb = yt(b);
    g.quad([a, ba, z1], [b, bb, z1], [b, tb, z1], [a, ta, z1]);
    g.quad([b, bb, z0], [a, ba, z0], [a, ta, z0], [b, tb, z0]);
    g.quad([a, ta, z0], [a, ta, z1], [b, tb, z1], [b, tb, z0]);
    if (ba < ta - 0.01 || bb < tb - 0.01) g.quad([a, ba, z1], [a, ba, z0], [b, bb, z0], [b, bb, z1]);
  }
  if (!ends) return;
  const a = xs[0], b = xs[xs.length - 1];
  g.quad([a, yb(a), z0], [a, yb(a), z1], [a, yt(a), z1], [a, yt(a), z0]);
  g.quad([b, yb(b), z1], [b, yb(b), z0], [b, yt(b), z0], [b, yt(b), z1]);
}
function cutwater(g, x, side) { // a pointed nose on a pier, up to a little pyramid cap
  const h = W / 2 * side, p = h + 1.6 * side, y0 = BED, y1 = 1.6, y2 = 2.4;
  const A = [x - 1, 0, h], B = [x + 1, 0, h], P = [x, 0, p];
  const at = (v, y) => [v[0], y, v[2]];
  const face = (u, v) => side > 0 ? g.quad(at(u, y0), at(v, y0), at(v, y1), at(u, y1)) : g.quad(at(v, y0), at(u, y0), at(u, y1), at(v, y1));
  face(A, P); face(P, B);
  const C = [x, y2, h];
  if (side > 0) { g.tri(at(A, y1), at(P, y1), C); g.tri(at(P, y1), at(B, y1), C); } else { g.tri(at(P, y1), at(A, y1), C); g.tri(at(B, y1), at(P, y1), C); }
}
export function geometry(ctx) {
  const g = new G(ctx), fine = ctx.lod <= 2, step = fine ? 0.5 : 2;
  const xs = []; for (let x = -L; x <= L + 1e-6; x += step) xs.push(+x.toFixed(3));
  for (const [c, s] of SPANS) for (const k of [-1, 1]) { const e = c + k * s; if (!xs.includes(e)) xs.push(e); } // crisp springings
  xs.sort((a, b) => a - b);
  ctx.albedo(TEX.fieldstone); ctx.color("oklch(0.9 0.015 80)");
  strip(g, xs, -W / 2, W / 2, bot, top); // the body
  for (const x of [-7, 7]) for (const s of [-1, 1]) cutwater(g, x, s);
  ctx.color("oklch(0.86 0.02 75)");
  strip(g, xs, W / 2 - 0.45, W / 2, top, (x) => top(x) + 1.0); // parapets
  strip(g, xs, -W / 2, -W / 2 + 0.45, top, (x) => top(x) + 1.0);
  if (fine) {
    ctx.albedo(TEX.flag); ctx.color("oklch(0.8 0.02 75)");
    strip(g, xs, W / 2 - 0.55, W / 2 + 0.1, (x) => top(x) + 1.0, (x) => top(x) + 1.14); // coping
    strip(g, xs, -W / 2 - 0.1, -W / 2 + 0.55, (x) => top(x) + 1.0, (x) => top(x) + 1.14);
    strip(g, xs, -W / 2 + 0.45, W / 2 - 0.45, top, (x) => top(x) + 0.04, false); // worn flag paving
    // the keystone tablet over the centre arch, both faces: "FERROW" in the old tongue, long since unreadable
    ctx.albedo(TEX.rock); ctx.color("oklch(0.75 0.02 70)");
    for (const s of [-1, 1]) g.box(0, 2.95, s * (W / 2 + 0.06), 1.4, 0.6, 0.12);
  }
  ctx.albedo(null); ctx.color(null);
}
