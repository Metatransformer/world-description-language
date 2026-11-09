// A meadow butterfly, ~9 cm across: a slim dark body and four painted wing panels; hovers at its feet point, facing -Z.
// params.colors = [wing, edge]. Bones: body (root), wingL, wingR (roll beats them). Clips: scripts/lib/wildkin.js CLIPS.butterfly.
import { bk } from "../lib/beastkit.js";
export function skeleton() { return { body: { pivot: [0, 0, 0] }, wingL: { parent: "body", pivot: [-0.003, 0, 0] }, wingR: { parent: "body", pivot: [0.003, 0, 0] } }; }
export function geometry(ctx) {
  const K = bk(ctx), [wing, edge] = K.P.colors ?? ["#d9c65a", "#5a4a2a"];
  K.bone("body"); K.paint("#241c16", 0.7); K.limb([0, 0, -0.014], [0, 0, 0.02], 0.0035, 0.002);
  for (const [b, s] of [["wingL", -1], ["wingR", 1]]) {
    K.bone(b); K.paint(wing, 0.7);
    K.sheet([[s * 0.003, 0, -0.004], [s * 0.03, 0.001, -0.022], [s * 0.048, 0.001, -0.016], [s * 0.046, 0, 0.0], [s * 0.02, 0, 0.006]]);
    K.sheet([[s * 0.003, -0.001, 0.003], [s * 0.032, -0.001, 0.01], [s * 0.026, -0.001, 0.03], [s * 0.008, -0.001, 0.022]]);
    K.paint(edge, 0.7); K.sheet([[s * 0.03, 0.002, -0.022], [s * 0.048, 0.002, -0.016], [s * 0.046, 0.002, -0.006], [s * 0.038, 0.002, -0.014]]);
  }
}
