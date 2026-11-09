// A sand scorpion: flat plated body, eight legs, two crushing claws, a jointed tail arched forward over its back, a stinger.
// ~1.1 m long at scale 1, feet at the origin, facing -Z. params.colors = [plate, joint, eye].
// Bones: body(root) clawL clawR tail1 tail2 tail3 leg{L,R}{1..4}. Clips: scripts/lib/beast-clips.js#scorpion.
import { bk } from "../lib/beastkit.js";
const LZ = [-0.1, 0.0, 0.1, 0.2];
export function skeleton() {
  const s = { body: { pivot: [0, 0.2, 0] },
    clawL: { parent: "body", pivot: [-0.12, 0.2, -0.2] }, clawR: { parent: "body", pivot: [0.12, 0.2, -0.2] },
    tail1: { parent: "body", pivot: [0, 0.22, 0.3] }, tail2: { parent: "tail1", pivot: [0, 0.45, 0.48] }, tail3: { parent: "tail2", pivot: [0, 0.7, 0.4] } };
  LZ.forEach((z, i) => { s["legL" + (i + 1)] = { parent: "body", pivot: [-0.12, 0.2, z] }; s["legR" + (i + 1)] = { parent: "body", pivot: [0.12, 0.2, z] }; });
  return s;
}
export function geometry(ctx) {
  const K = bk(ctx), [plate, joint, eye] = K.P.colors ?? ["#a07a44", "#5a3e22", "#111111"];
  K.bone("body"); K.paint(plate, 0.45);
  for (let i = 0; i < 6; i++) K.blob([0, 0.21 + i * 0.004, -0.15 + i * 0.08], 0.16 - i * 0.008, 0.07, 0.07);   // plated segments
  K.eyes([[-0.03, 0.27, -0.2], [0.03, 0.27, -0.2]], 0.015, eye);
  for (const side of [-1, 1]) LZ.forEach((z, i) => {
    K.bone((side < 0 ? "legL" : "legR") + (i + 1)); K.paint(joint, 0.5);
    const hip = [side * 0.13, 0.2, z], knee = [side * 0.32, 0.28, z + (i - 1.5) * 0.06], foot = [side * 0.45, 0.0, z + (i - 1.5) * 0.12];
    K.limb(hip, knee, 0.025, 0.02); K.limb(knee, foot, 0.02, 0.006);
  });
  for (const [b, s] of [["clawL", -1], ["clawR", 1]]) {
    K.bone(b); K.paint(joint, 0.5);
    K.limb([s * 0.12, 0.2, -0.2], [s * 0.24, 0.22, -0.38], 0.035, 0.03); K.limb([s * 0.24, 0.22, -0.38], [s * 0.2, 0.22, -0.52], 0.03, 0.035);
    K.paint(plate, 0.4); K.blob([s * 0.2, 0.22, -0.6], 0.06, 0.045, 0.09);
    K.limb([s * 0.17, 0.24, -0.66], [s * 0.16, 0.24, -0.8], 0.03, 0.004); K.limb([s * 0.23, 0.2, -0.66], [s * 0.22, 0.2, -0.78], 0.026, 0.004);
  }
  K.bone("tail1"); K.paint(plate, 0.45);
  K.chain([[0, 0.22, 0.28], [0, 0.3, 0.42], [0, 0.45, 0.5]], [0.06, 0.055, 0.05]);
  K.bone("tail2"); K.chain([[0, 0.42, 0.5], [0, 0.6, 0.5], [0, 0.72, 0.4]], [0.05, 0.045, 0.042]);
  K.bone("tail3"); K.chain([[0, 0.7, 0.42], [0, 0.78, 0.3], [0, 0.76, 0.2]], [0.045, 0.05, 0.035]);
  K.paint("#1a120c", 0.3); K.limb([0, 0.76, 0.2], [0, 0.66, 0.12], 0.025, 0.003);
}
export function collider() { return { kind: "box", width: 0.8, height: 0.6, depth: 1.1, center: [0, 0.3, -0.05] }; }
