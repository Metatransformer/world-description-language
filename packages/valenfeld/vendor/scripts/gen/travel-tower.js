// THE TRAVEL COMPANY TOWER: a fieldstone footing, a tarred-oak lattice mast to 26 m, a mooring deck
// with a stair, the company's red pennant and a red lamp you can find on any horizon. Feet at the footing.
import { paint, glow, BX, SEG, CANVAS, OAK, IR, FS, STONE, IRONC } from "../lib/buildkit.js";
// params.style: valley (default, the original) | desert (sandstone footing, sun-bleached mast) | coastal (granite footing, tarred mast)
const STY = { valley: { fs: FS, oak: OAK }, desert: { fs: "cdn/texture-sandstone-blocks-weathered.png", oak: "cdn/texture-sun-bleached-grey-driftwood-planks.png" }, coastal: { fs: "cdn/texture-salt-weathered-grey-granite-blocks.png", oak: "cdn/texture-tarred-black-weatherboard-planks.png" } };
export function geometry(c) {
  const S = STY[c.params?.style] ?? STY.valley;
  const D = c.lod, H = 24, w0 = 3.2, w1 = 1.6;
  paint(c, S.fs, STONE); BX(c, -4, 0, -4, 4, 1.4, 4);
  paint(c, S.oak, "oklch(0.42 0.04 50)");
  const at = (h) => w0 + (w1 - w0) * h / H;
  for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) SEG(c, [sx * w0, 1.4, sz * w0], [sx * w1, H, sz * w1], 0.32, 0.32);
  const rungs = D <= 2 ? 6 : 3;
  for (let i = 1; i <= rungs; i++) { const h0 = 1.4 + (H - 1.4) * (i - 1) / rungs, h1 = 1.4 + (H - 1.4) * i / rungs, a = at(h0), b = at(h1);
    for (const [p, q] of [[[-1, -1], [1, -1]], [[1, -1], [1, 1]], [[1, 1], [-1, 1]], [[-1, 1], [-1, -1]]]) { SEG(c, [p[0] * b, h1, p[1] * b], [q[0] * b, h1, q[1] * b], 0.2, 0.2); if (D <= 2) SEG(c, [p[0] * a, h0, p[1] * a], [q[0] * b, h1, q[1] * b], 0.12, 0.12); } }
  paint(c, S.oak, "oklch(0.6 0.05 55)"); BX(c, -3.4, H, -3.4, 3.4, H + 0.3, 3.4);
  paint(c, S.oak, "oklch(0.45 0.04 50)"); for (const [x0, z0, x1, z1] of [[-3.4, -3.4, 3.4, -3.3], [-3.4, 3.3, 3.4, 3.4], [-3.4, -3.4, -3.3, 3.4], [3.3, -3.4, 3.4, 3.4]]) BX(c, x0, H + 0.3, z0, x1, H + 1.3, z1);
  paint(c, IR, IRONC); SEG(c, [0, H + 0.3, 0], [0, H + 6, 0], 0.18, 0.18); BX(c, -0.5, H + 5.6, -0.5, 0.5, H + 5.8, 0.5);
  paint(c, CANVAS, "oklch(0.5 0.18 28)"); c.quad(0, H + 6, 0, 0, H + 4.6, 0, 3.6, H + 5.1, 0, 3.6, H + 5.5, 0); c.quad(3.6, H + 5.5, 0, 3.6, H + 5.1, 0, 0, H + 4.6, 0, 0, H + 6, 0);
  glow(c, "oklch(0.7 0.2 28)", [3.2, 0.5, 0.3]); BX(c, -0.3, H + 6, -0.3, 0.3, H + 6.6, 0.3);
}
