// A farmyard hen, ~0.42 m tall, facing -Z, feet at the origin. params.colors = [feathers, comb, beak/legs].
// Bones: root body head legL legR tail. The manager pecks by pitching head, and bobs body.
import { bk } from "../lib/beastkit.js";
export function skeleton() {
  return { root: { pivot: [0, 0, 0] }, body: { parent: "root", pivot: [0, 0.22, 0] }, head: { parent: "body", pivot: [0, 0.3, -0.1] },
    legL: { parent: "root", pivot: [-0.045, 0.16, 0] }, legR: { parent: "root", pivot: [0.045, 0.16, 0] }, tail: { parent: "body", pivot: [0, 0.27, 0.12] } };
}
export function geometry(ctx) {
  const K = bk(ctx), [fe, comb, beak] = K.P.colors ?? ["#e9dcc4", "#b8322a", "#d9a23a"];
  ctx.smooth();
  K.bone("body"); K.paint(fe, 0.9);
  K.blob([0, 0.24, 0.01], 0.11, 0.1, 0.15);                       // the round body
  K.blob([0, 0.2, -0.02], 0.085, 0.07, 0.1);                     // the breast, low and full
  for (const s of [-1, 1]) K.blob([s * 0.095, 0.25, 0.02], 0.025, 0.06, 0.11);   // folded wings
  K.bone("tail"); K.paint(fe, 0.85);
  for (const a of [-0.35, 0, 0.35]) K.limb([Math.sin(a) * 0.02, 0.28, 0.12], [Math.sin(a) * 0.06, 0.4, 0.17], 0.035, 0.012);
  K.bone("head"); K.paint(fe, 0.9);
  K.chain([[0, 0.28, -0.08], [0, 0.35, -0.12], [0, 0.39, -0.13]], [0.05, 0.045, 0.04]);
  K.paint(comb, 0.6);
  K.chain([[0, 0.42, -0.11], [0, 0.44, -0.13], [0, 0.43, -0.16]], [0.012, 0.016, 0.01]);   // comb
  K.blob([0, 0.355, -0.17], 0.012, 0.022, 0.012);                // wattle
  K.paint(beak, 0.4);
  K.chain([[0, 0.385, -0.165], [0, 0.378, -0.2]], [0.014, 0.003]);
  K.eyes([[-0.03, 0.4, -0.145], [0.03, 0.4, -0.145]], 0.008, "#1a1410");
  ctx.flat();
  for (const [b, s] of [["legL", -1], ["legR", 1]]) {
    K.bone(b); K.paint(beak, 0.5);
    K.limb([s * 0.045, 0.17, 0.01], [s * 0.045, 0.01, 0], 0.012, 0.008);
    for (const a of [-0.5, 0, 0.5]) K.limb([s * 0.045, 0.01, 0], [s * 0.045 + Math.sin(a) * 0.05, 0.004, -Math.cos(a) * 0.05], 0.006, 0.003);
    K.limb([s * 0.045, 0.01, 0], [s * 0.045, 0.004, 0.035], 0.005, 0.003);
  }
}
