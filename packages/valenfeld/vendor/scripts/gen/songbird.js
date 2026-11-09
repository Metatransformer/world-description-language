// A small ground-feeding bird (finch ~0.13 m; scaled ~2.6x it is a crow): round body, folded wings, short tail; feet at the origin, facing -Z.
// params.colors = [back, breast, beak]. Bones: body (root), head, wingL, wingR, tail. Wings are built spread along x;
// the perch/peck clips fold them back (yaw ±80), the flap clips beat them (roll). Clips: scripts/lib/wildkin.js CLIPS.bird.
import { bk } from "../lib/beastkit.js";
export function skeleton() {
  return { body: { pivot: [0, 0.05, 0] }, head: { parent: "body", pivot: [0, 0.08, -0.035] }, tail: { parent: "body", pivot: [0, 0.065, 0.04] },
    wingL: { parent: "body", pivot: [-0.028, 0.082, -0.02] }, wingR: { parent: "body", pivot: [0.028, 0.082, -0.02] } };
}
export function geometry(ctx) {
  const K = bk(ctx), [back, breast, beak] = K.P.colors ?? ["#6b5a44", "#b88a63", "#3a3430"];
  K.bone("body"); K.paint(beak, 0.6);
  for (const s of [-1, 1]) K.limb([s * 0.012, 0.045, 0.0], [s * 0.012, 0.0, 0.006], 0.004, 0.003);
  K.paint(back, 0.85); K.blob([0, 0.067, 0.005], 0.031, 0.031, 0.05);
  K.paint(breast, 0.85); K.blob([0, 0.06, -0.018], 0.027, 0.027, 0.032);
  K.bone("head"); K.paint(back, 0.85); K.blob([0, 0.09, -0.045], 0.023, 0.023, 0.025);
  K.paint(beak, 0.5); K.chain([[0, 0.089, -0.066], [0, 0.086, -0.084]], [0.008, 0.0015]);
  K.paint("#0c0a09", 0.3); for (const s of [-1, 1]) K.blob([s * 0.017, 0.095, -0.054], 0.005, 0.005, 0.005);
  K.bone("tail"); K.paint(back, 0.85); K.sheet([[0, 0.07, 0.04], [-0.022, 0.058, 0.11], [0, 0.06, 0.115], [0.022, 0.058, 0.11]]);
  for (const [b, s] of [["wingL", -1], ["wingR", 1]]) {
    K.bone(b); K.paint(back, 0.9);
    K.sheet([[s * 0.028, 0.082, -0.03], [s * 0.1, 0.086, -0.022], [s * 0.15, 0.082, 0.0], [s * 0.13, 0.08, 0.035], [s * 0.07, 0.08, 0.05], [s * 0.028, 0.08, 0.03]]);
  }
}
