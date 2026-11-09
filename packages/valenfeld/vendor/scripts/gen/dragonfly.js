// A hawker dragonfly, ~7 cm long, 10 cm across: a long blue-green abdomen and four glassy wings; hovers at its feet point, facing -Z.
// Bones: body (root), wingL, wingR (each carries a fore and hind wing). Clips: scripts/lib/wildkin.js CLIPS.dragonfly.
import { bk } from "../lib/beastkit.js";
export function skeleton() { return { body: { pivot: [0, 0, 0] }, wingL: { parent: "body", pivot: [-0.003, 0.003, -0.008] }, wingR: { parent: "body", pivot: [0.003, 0.003, -0.008] } }; }
export function geometry(ctx) {
  const K = bk(ctx), body = K.P.color ?? "#2c6e74";
  K.bone("body"); K.paint(body, 0.35);
  K.chain([[0, 0, -0.028], [0, 0, -0.004], [0, 0, 0.03], [0, 0, 0.055]], [0.006, 0.005, 0.0035, 0.002]);
  K.paint("#1e3a2c", 0.3); K.blob([0, 0.001, -0.033], 0.0065, 0.006, 0.006);
  for (const [b, s] of [["wingL", -1], ["wingR", 1]]) {
    K.bone(b); K.paint("#cfdcdc", 0.2);
    K.sheet([[s * 0.003, 0.003, -0.014], [s * 0.05, 0.003, -0.019], [s * 0.052, 0.003, -0.012], [s * 0.003, 0.003, -0.007]]);
    K.sheet([[s * 0.003, 0.003, -0.004], [s * 0.046, 0.003, -0.002], [s * 0.046, 0.003, 0.006], [s * 0.003, 0.003, 0.002]]);
  }
}
