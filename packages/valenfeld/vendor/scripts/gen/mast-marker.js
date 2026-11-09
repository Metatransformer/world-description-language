// A wreck's mast standing up out of the sea over the Drowned Temple: origin on the seabed, leaning 9°, its stub
// breaking the surface by ~3 m with a broken yard and a torn sail rag a swimmer can see from the shore.
import { kit } from "./barrow-kit.js";
const TX = { wood: "cdn/texture-rotting-ship-hull-planks.png", sail: "cdn/texture-torn-faded-red-sailcloth.png" };
function build(ctx, col) {
  const K = kit(ctx, col), R = () => ctx.random(), L = (ctx.params?.depth ?? 21.5) + 3.2;
  K.at(() => {
    K.paint(TX.wood, "oklch(0.78 0.03 60)", 0.95);
    if (col) return K.box(-0.25, 0, -0.25, 0.25, L, 0.25);
    K.seg([0, 0, 0], [0, L - 0.4, 0], 0.32, 0.2, 6, true);
    K.seg([0, L - 0.4, 0], [0.08, L, 0.03], 0.2, 0.12, 6, true);                       // the snapped top
    K.at(() => K.seg([-1.6, 0, 0], [1.1, 0, 0], 0.1, 0.08, 5, true), 0, L - 1.6, 0, 0, 0, -14); // the broken yard, askew
    K.box(-0.3, L - 2.0, -0.3, 0.3, L - 1.8, 0.3);                                        // a band where it hung
    // the rag: two torn panels hanging from the yard, ragged lower edge
    K.paint(TX.sail, "oklch(0.72 0.11 35)", 1);
    const yardY = (x) => L - 1.6 + x * Math.tan(-14 * Math.PI / 180);
    const xs = [-1.5, -1.0, -0.55, -0.1], bot = [0.9, 1.6, 0.7, 1.3];
    for (let i = 0; i < xs.length - 1; i++) {
      const a = xs[i], b = xs[i + 1], ya = yardY(a) - 0.1, yb = yardY(b) - 0.1, sag = 0.12 * Math.sin(i * 2);
      K.quad([a, ya, 0.12], [b, yb, 0.12], [b + 0.1, yb - bot[i + 1], 0.2 + sag], [a + 0.05, ya - bot[i], 0.25]);
    }
    K.tri([0.25, yardY(0.25) - 0.1, 0.12], [0.8, yardY(0.8) - 0.1, 0.12], [0.55, yardY(0.5) - 1.1, 0.3]);
    // rigging: a dangling line, barnacles at the waterline, weed below it
    K.paint(null, "oklch(0.5 0.04 80)", 1); K.seg([1.0, yardY(1.0), 0], [1.25, L - 4.2, 0.2], 0.02, 0.02, 3);
    K.paint(null, "oklch(0.78 0.02 90)", 0.95);
    for (let k = 0; k < 18; k++) { const a = R() * 6.283, y = L - 3.6 - R() * 2.4, r = 0.27; K.seg([Math.cos(a) * r, y, Math.sin(a) * r], [Math.cos(a) * (r + 0.06), y, Math.sin(a) * (r + 0.06)], 0.05, 0.02, 5, true); }
    K.paint(null, "oklch(0.36 0.07 125)", 0.5);
    for (let k = 0; k < 6; k++) { const a = k * 1.05, y = L - 4.5 - k * 1.7; K.quad([Math.cos(a) * 0.3, y, Math.sin(a) * 0.3], [Math.cos(a) * 0.3, y - 1.2, Math.sin(a) * 0.3], [Math.cos(a) * 0.7, y - 1.5, Math.sin(a) * 0.7], [Math.cos(a) * 0.5, y + 0.1, Math.sin(a) * 0.5]); }
  }, 0, -0.5, 0, 0, 0, 9);
}
export function geometry(ctx) { build(ctx, false); }
export function collider(ctx) { build(ctx, true); }
