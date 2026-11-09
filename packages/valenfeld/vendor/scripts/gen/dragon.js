// A great sky dragon: ~22 m snout to tail, ~18 m wingspan, origin at the body's centre, facing -Z.
// Dark slate-green scales over a pale belly, swept horns, a dorsal ridge, membrane wings on two bones each, a long spade tail.
// Bones: body neck head jaw wingL wingTipL wingR wingTipR tail tail2. Clips: scripts/dragon-flight.js (flap / glide), roll in degrees.
import { bk } from "../lib/beastkit.js";
import { hex } from "../lib/mesh.js";
const C = {
  scale: [0.15, 0.21, 0.19], back: [0.09, 0.13, 0.12], belly: [0.7, 0.66, 0.52], membrane: [0.2, 0.17, 0.15],
  bone: [0.8, 0.75, 0.62], claw: [0.12, 0.11, 0.1], eye: [1.0, 0.62, 0.12],
};
export function skeleton() {
  return {
    body: { pivot: [0, 0, 0] },
    neck: { parent: "body", pivot: [0, 0.3, -3.0] },
    head: { parent: "neck", pivot: [0, 1.6, -6.6] },
    jaw: { parent: "head", pivot: [0, 1.45, -7.0] },
    wingL: { parent: "body", pivot: [-0.9, 0.6, -1.6] },
    wingTipL: { parent: "wingL", pivot: [-5.0, 0.95, -1.3] },
    wingR: { parent: "body", pivot: [0.9, 0.6, -1.6] },
    wingTipR: { parent: "wingR", pivot: [5.0, 0.95, -1.3] },
    tail: { parent: "body", pivot: [0, 0, 3.0] },
    tail2: { parent: "tail", pivot: [0, -0.3, 7.4] },
  };
}
export function geometry(ctx) {
  const K = bk(ctx), fine = K.lod <= 2, mid = K.lod <= 3;
  const P = (c) => hex(c);
  const spike = (a, b, r) => K.limb(a, b, r, r * 0.08);
  // BODY: a deep chest tapering to the hips, a pale keel of belly scales under it
  K.bone("body"); K.paint(P(C.scale), 0.7);
  K.chain([[0, 0.3, -3.6], [0, 0.2, -2.0], [0, 0, 0], [0, -0.05, 2.0], [0, 0, 3.4]], [[0.8, 0.85], [1.2, 1.3], [1.25, 1.3], [1.0, 1.05], [0.7, 0.72]]);
  K.paint(P(C.belly), 0.6);
  K.chain([[0, -0.15, -3.3], [0, -0.4, -2.0], [0, -0.45, 0], [0, -0.38, 2.0], [0, -0.2, 3.2]], [[0.6, 0.6], [0.95, 0.95], [1.0, 0.95], [0.8, 0.75], [0.5, 0.5]]);
  if (mid) { K.paint(P(C.back), 0.6); for (let i = 0; i < 6; i++) { const z = -3 + i * 1.2; spike([0, 1.1 - Math.abs(z) * 0.04, z], [0, 1.75 - Math.abs(z) * 0.06, z + 0.55], 0.16); } }
  // legs tucked up for flight: thighs, shins, curled claws
  K.paint(P(C.scale), 0.7);
  for (const s of [-1, 1]) {
    K.limb([s * 0.85, -0.3, 1.6], [s * 1.0, -1.1, 2.6], 0.45, 0.3); K.limb([s * 1.0, -1.1, 2.6], [s * 0.85, -1.0, 3.7], 0.28, 0.18);
    K.limb([s * 0.75, -0.4, -2.3], [s * 0.85, -1.2, -1.7], 0.3, 0.2); K.limb([s * 0.85, -1.2, -1.7], [s * 0.75, -1.05, -1.0], 0.19, 0.12);
    if (fine) { K.paint(P(C.claw), 0.4); for (const c of [-0.12, 0, 0.12]) { spike([s * 0.85 + c, -1.0, 3.7], [s * 0.85 + c, -1.25, 4.05], 0.06); spike([s * 0.75 + c, -1.05, -1.0], [s * 0.75 + c, -1.25, -0.75], 0.05); } K.paint(P(C.scale), 0.7); }
  }
  // NECK: a long serpentine reach, pale underneath
  K.bone("neck"); K.paint(P(C.scale), 0.7);
  K.chain([[0, 0.3, -3.0], [0, 0.75, -4.4], [0, 1.3, -5.7], [0, 1.6, -6.7]], [0.78, 0.62, 0.5, 0.44]);
  K.paint(P(C.belly), 0.6); K.chain([[0, 0.0, -3.2], [0, 0.45, -4.5], [0, 1.05, -5.8], [0, 1.33, -6.6]], [0.55, 0.45, 0.36, 0.3]);
  if (mid) { K.paint(P(C.back), 0.6); for (let i = 0; i < 4; i++) spike([0, 1.0 + i * 0.32, -3.6 - i * 0.85], [0, 1.45 + i * 0.32, -3.2 - i * 0.85], 0.11); }
  // HEAD: a long wedge skull, brow ridges, swept-back horns, amber eyes
  K.bone("head"); K.paint(P(C.scale), 0.65);
  K.chain([[0, 1.65, -6.4], [0, 1.78, -7.2], [0, 1.66, -8.2], [0, 1.5, -8.9]], [[0.5, 0.46], [0.47, 0.4], [0.32, 0.27], [0.17, 0.14]]);
  K.paint(P(C.back), 0.6);
  for (const s of [-1, 1]) K.chain([[s * 0.28, 1.98, -7.7], [s * 0.36, 2.02, -7.2], [s * 0.38, 1.95, -6.7]], [0.1, 0.12, 0.08]);
  K.paint(P(C.bone), 0.45);
  for (const s of [-1, 1]) {
    K.chain([[s * 0.3, 1.95, -6.9], [s * 0.5, 2.3, -6.1], [s * 0.62, 2.4, -5.3], [s * 0.66, 2.3, -4.7]], [0.16, 0.12, 0.07, 0.015], { capEnd: 0.01 });
    if (fine) K.chain([[s * 0.45, 1.6, -6.6], [s * 0.75, 1.6, -6.0], [s * 0.85, 1.5, -5.6]], [0.08, 0.05, 0.01], { capEnd: 0.01 });
  }
  K.eyes([[-0.37, 1.86, -7.45], [0.37, 1.86, -7.45]], 0.08, P(C.eye));
  K.bone("jaw"); K.paint(P(C.scale), 0.65);
  K.chain([[0, 1.38, -6.8], [0, 1.25, -7.8], [0, 1.3, -8.7]], [[0.34, 0.2], [0.24, 0.14], [0.12, 0.08]]);
  if (fine) { K.paint(P(C.bone), 0.4); for (const s of [-1, 1]) for (let i = 0; i < 4; i++) spike([s * (0.2 - i * 0.03), 1.42, -7.6 - i * 0.3], [s * (0.2 - i * 0.03), 1.58, -7.62 - i * 0.3], 0.035); }
  // WINGS: arm and forearm with the inner membrane, then the finger fan on the tip bone, its trailing edge scalloped
  for (const [w, t, s] of [["wingL", "wingTipL", -1], ["wingR", "wingTipR", 1]]) {
    const root = [s * 0.9, 0.6, -1.6], elbow = [s * 3.2, 1.25, -0.6], wrist = [s * 5.0, 0.95, -1.3];
    K.bone(w); K.paint(P(C.scale), 0.7);
    K.limb(root, elbow, 0.38, 0.24); K.limb(elbow, wrist, 0.24, 0.17);
    K.paint(P(C.membrane), 0.85);
    K.sheet([[s * 0.9, 0.5, -1.4], elbow, wrist, [s * 4.6, 0.55, 2.4], [s * 3.2, 0.5, 2.0], [s * 2.0, 0.45, 2.6], [s * 0.8, 0.35, 1.9]]);
    K.bone(t); K.paint(P(C.scale), 0.7);
    const tips = [[s * 9.0, 0.7, -0.6], [s * 8.4, 0.45, 1.6], [s * 6.9, 0.35, 2.9], [s * 4.6, 0.55, 2.4]];
    for (const tp of tips.slice(0, 3)) K.limb(wrist, tp, 0.13, 0.03);
    if (fine) { K.paint(P(C.bone), 0.4); spike(wrist, [s * 5.2, 1.25, -1.9], 0.1); }
    K.paint(P(C.membrane), 0.85);
    K.sheet([wrist, tips[0], [s * 8.0, 0.5, 0.75], tips[1], [s * 7.1, 0.4, 1.95], tips[2], [s * 5.6, 0.45, 2.15], tips[3]]);
  }
  // TAIL: a long taper, ridged, ending in a bone spade
  K.bone("tail"); K.paint(P(C.scale), 0.7);
  K.chain([[0, 0, 3.0], [0, -0.1, 5.0], [0, -0.3, 7.6]], [0.7, 0.5, 0.36]);
  if (mid) { K.paint(P(C.back), 0.6); for (let i = 0; i < 4; i++) spike([0, 0.55 - i * 0.12, 3.8 + i * 1.0], [0, 0.95 - i * 0.14, 4.3 + i * 1.0], 0.1); }
  K.bone("tail2"); K.paint(P(C.scale), 0.7);
  K.chain([[0, -0.3, 7.4], [0, -0.4, 10.0], [0, -0.45, 12.4], [0, -0.45, 13.6]], [0.37, 0.24, 0.12, 0.04]);
  K.paint(P(C.bone), 0.5);
  K.sheet([[0, -0.45, 13.2], [-0.55, -0.45, 13.9], [0, -0.45, 14.8], [0.55, -0.45, 13.9]]);
}
export function collider() { return { kind: "box", width: 3, height: 3, depth: 14, center: [0, 0, 0] }; }
