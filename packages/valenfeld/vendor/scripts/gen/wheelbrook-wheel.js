// The Wheelbrook waterwheel: 4.6 m oak overshot wheel, two rims, 8 spokes a side, 20 paddles, iron hub.
// Axle along local Z so scripts/spin.js (roll) turns it. Origin = hub centre.
import { kit } from "./barrow-kit.js";
export function geometry(ctx) {
  const K = kit(ctx, false), R = 2.3, n = 20, w = 0.55;
  const P = (a, r, z) => [Math.cos(a) * r, Math.sin(a) * r, z];
  K.paint("cdn/texture-dark-oak-planks-weathered.png", "oklch(0.62 0.04 55)");
  for (const z of [-w, w]) for (let k = 0; k < n; k++) K.seg(P((k / n) * 6.283, R, z), P(((k + 1) / n) * 6.283, R, z), 0.09, 0.09, 5);
  for (const z of [-w, w]) for (let k = 0; k < 8; k++) K.seg([0, 0, z], P((k / 8) * 6.283, R, z), 0.06, 0.05, 5);
  for (let k = 0; k < n; k++) {
    const a = (k / n) * 6.283;
    K.at(() => K.box(-0.25, -0.04, -w, 0.25, 0.04, w), Math.cos(a) * (R - 0.25), Math.sin(a) * (R - 0.25), 0, 0, 0, a * 57.2958);
  }
  K.paint("cdn/texture-wrought-iron.png", "oklch(0.45 0 0)", 0.6, 0.8);
  K.seg([0, 0, -w - 0.5], [0, 0, w + 0.5], 0.13, 0.13, 10, true);
  K.seg([0, 0, -w - 0.05], [0, 0, w + 0.05], 0.3, 0.3, 10, true);
}
