// TIDE CRAB: a knee-high low-poly crab, ~0.9 m across, facing -z, feet at the origin. Shell, eight legs, two claws (one big).
import { kit } from "./barrow-kit.js";
export function geometry(ctx) {
  const K = kit(ctx, false), shell = (l) => K.paint(null, `oklch(${l} 0.11 38)`, 0.6);
  shell(0.5); K.rock(0, 0.36, 0, 0.42, 0.15, 0.32, 7, 4, 0.1);               // carapace
  shell(0.42); K.box(-0.32, 0.22, -0.2, 0.32, 0.3, 0.24);                   // underbody
  K.paint(null, "oklch(0.8 0.02 90)", 0.9); for (let k = 0; k < 6; k++) K.seg([-0.2 + k * 0.08, 0.46, 0.05 + (k % 2) * 0.1], [-0.2 + k * 0.08, 0.5, 0.05 + (k % 2) * 0.1], 0.035, 0.015, 4, true);
  shell(0.55); for (const s of [-1, 1]) {
    for (let i = 0; i < 4; i++) {                                                // legs: hip, knee up, foot down
      const z = -0.12 + i * 0.13, hip = [s * 0.34, 0.3, z], knee = [s * 0.58, 0.42, z + (i - 1.5) * 0.08], foot = [s * 0.72, 0.0, z + (i - 1.5) * 0.14];
      K.seg(hip, knee, 0.04, 0.035, 4, true); K.seg(knee, foot, 0.035, 0.012, 4, true);
    }
    const big = s > 0 ? 1.35 : 1;                                              // claws: arm, palm, pincer
    K.seg([s * 0.25, 0.32, -0.25], [s * 0.38, 0.4, -0.48], 0.05 * big, 0.06 * big, 5, true);
    K.rock(s * 0.4, 0.42, -0.6, 0.1 * big, 0.08 * big, 0.14 * big, 6, 3, 0.1);
    K.seg([s * 0.37, 0.46, -0.7], [s * 0.33, 0.48, -0.84 * (0.9 + big * 0.1)], 0.045 * big, 0.01, 4, true);
    K.seg([s * 0.44, 0.38, -0.7], [s * 0.4, 0.34, -0.8 * (0.9 + big * 0.1)], 0.04 * big, 0.01, 4, true);
    K.paint(null, "#101010", 0.3); K.seg([s * 0.1, 0.44, -0.26], [s * 0.12, 0.56, -0.3], 0.015, 0.015, 4); K.rock(s * 0.12, 0.57, -0.3, 0.03, 0.03, 0.03, 5, 3, 0); shell(0.55);
  }
}
