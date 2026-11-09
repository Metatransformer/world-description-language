// A brown hare: ~0.45 m crouched nose to scut, long black-tipped ears, big hind feet; feet at the origin, facing -Z.
// Bones: body (root), head, legF, legB, tail. Clips: scripts/lib/wildkin.js CLIPS.hare. Far lods drop to ~5-sided tubes (beastkit).
import { bk } from "../lib/beastkit.js";
export function skeleton() {
  return { body: { pivot: [0, 0.12, 0.05] }, head: { parent: "body", pivot: [0, 0.19, -0.11] }, legF: { parent: "body", pivot: [0, 0.11, -0.1] },
    legB: { parent: "body", pivot: [0, 0.12, 0.08] }, tail: { parent: "body", pivot: [0, 0.15, 0.17] } };
}
export function geometry(ctx) {
  const K = bk(ctx), fur = "#82674a", deep = "#5a4632", pale = "#cdbb9c", dark = "#16110c";
  K.bone("body"); K.paint(fur, 0.95);
  K.blob([0, 0.15, 0.02], 0.085, 0.1, 0.15);
  K.paint(pale); K.blob([0, 0.11, -0.06], 0.06, 0.06, 0.07);
  K.paint(deep); for (const s of [-1, 1]) K.blob([s * 0.06, 0.11, 0.08], 0.05, 0.075, 0.085);
  K.bone("legB"); K.paint(deep);
  for (const s of [-1, 1]) K.limb([s * 0.065, 0.04, 0.1], [s * 0.055, 0.01, -0.04], 0.022, 0.013);
  K.bone("legF"); K.paint(fur);
  for (const s of [-1, 1]) K.limb([s * 0.03, 0.11, -0.1], [s * 0.03, 0.005, -0.13], 0.016, 0.011);
  K.bone("head"); K.paint(fur);
  K.blob([0, 0.22, -0.13], 0.048, 0.052, 0.068);
  K.paint(pale); K.blob([0, 0.205, -0.188], 0.03, 0.03, 0.032);
  for (const s of [-1, 1]) {
    K.paint(deep); K.limb([s * 0.02, 0.26, -0.11], [s * 0.04, 0.39, -0.065], 0.019, 0.013);
    K.paint(dark); K.limb([s * 0.04, 0.39, -0.065], [s * 0.043, 0.425, -0.055], 0.013, 0.004);
    K.paint(dark, 0.3); K.blob([s * 0.044, 0.232, -0.15], 0.011, 0.012, 0.011);
  }
  K.bone("tail"); K.paint(pale); K.blob([0, 0.15, 0.18], 0.03, 0.032, 0.026);
}
