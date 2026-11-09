// HORSE: a draught/riding horse on one rig, ~2.4 m nose to tail, withers 1.55 m, feet at the origin, facing -Z.
// params.coat: bay | chestnut | grey | black (coats table below). Bones: body(root) neck head tail.
// Idle clips (graze, flick) come from scripts/horse-idle.js; the stall's floor is the feet.
import { bk } from "../lib/beastkit.js";
export function skeleton() {
  return {
    body: { pivot: [0, 1.15, 0] },
    neck: { parent: "body", pivot: [0, 1.38, -0.62] },
    head: { parent: "neck", pivot: [0, 1.96, -1.05] },
    tail: { parent: "body", pivot: [0, 1.32, 0.84] },
    legFL: { parent: "body", pivot: [-0.17, 1.1, -0.62] },
    legFR: { parent: "body", pivot: [0.17, 1.1, -0.62] },
    legHL: { parent: "body", pivot: [-0.18, 1.12, 0.6] },
    legHR: { parent: "body", pivot: [0.18, 1.12, 0.6] },
  };
}
const COATS = {
  //          coat,       belly,     mane/tail, lower legs, muzzle,   blaze
  bay:      ["#6a3a1f", "#7d4a2a", "#1a1311", "#1c1512", "#2a1d16", null],
  chestnut: ["#8f4c22", "#a05e30", "#b7743a", "#7c3f1c", "#4a2a18", "#efe6d6"],
  grey:     ["#b9b5ad", "#cfcbc3", "#ece8df", "#8d8880", "#5a5652", null],
  dun:      ["#a7865a", "#b89a6e", "#3a2c20", "#3a2c20", "#3a2c22", null],
  palomino: ["#d4a54e", "#e0ba6a", "#f1e6c8", "#c79a48", "#6a4a2a", "#f3ead6"],
  black:    ["#1f1b1a", "#2a2523", "#121010", "#141111", "#2a2220", "#efe6d6"],
};
export function geometry(ctx) {
  const K = bk(ctx), P = K.P, [coat, belly, mane, sock, muzzle, blaze] = COATS[P.coat] ?? COATS.bay;
  // body: chest, barrel, loins, croup
  K.bone("body"); K.paint(coat);
  K.chain([[0, 1.16, -0.86], [0, 1.2, -0.55], [0, 1.18, -0.05], [0, 1.24, 0.45], [0, 1.22, 0.82]],
    [[0.24, 0.3], [0.3, 0.36], [0.33, 0.37], [0.31, 0.35], [0.24, 0.27]], { capStart: 0.12, capEnd: 0.14 });
  K.paint(belly); K.blob([0, 0.94, -0.05], 0.25, 0.14, 0.45);
  K.paint(coat); K.blob([0, 1.48, -0.55], 0.12, 0.1, 0.22);                         // withers
  for (const s of [-1, 1]) K.blob([s * 0.17, 1.27, 0.62], 0.16, 0.2, 0.26);        // haunches
  // legs: forearm, knee, cannon, fetlock, hoof; hind with a hock
  for (const s of [-1, 1]) {
    const fx = s * 0.17;
    K.bone(s < 0 ? "legFL" : "legFR"); K.paint(coat); K.chain([[fx, 1.12, -0.62], [fx, 0.82, -0.64], [fx, 0.55, -0.63]], [0.1, 0.075, 0.06], { capStart: 0.05 });
    K.paint(sock); K.chain([[fx, 0.56, -0.63], [fx, 0.3, -0.63], [fx, 0.13, -0.66]], [0.055, 0.045, 0.055]);
    K.paint("#2a2420"); K.blob([fx, 0.06, -0.67], 0.065, 0.06, 0.07);
    const hx = s * 0.18;
    K.bone(s < 0 ? "legHL" : "legHR"); K.paint(coat); K.chain([[hx, 1.15, 0.6], [hx, 0.84, 0.74], [hx, 0.58, 0.82]], [0.15, 0.11, 0.065], { capStart: 0.06 });
    K.paint(sock); K.chain([[hx, 0.58, 0.82], [hx, 0.32, 0.74], [hx, 0.13, 0.72]], [0.055, 0.045, 0.055]);
    K.paint("#2a2420"); K.blob([hx, 0.06, 0.71], 0.065, 0.06, 0.07);
  }
  // a ridden horse (params.saddle): blanket, leather seat with cantle and pommel, stirrups on their leathers
  if (P.saddle) {
    K.bone("body");
    K.paint(P.cloth ?? "#7a2e22"); K.blob([0, 1.46, -0.18], 0.36, 0.05, 0.36);
    K.paint("#4a3020"); K.blob([0, 1.53, -0.2], 0.24, 0.07, 0.3);
    K.blob([0, 1.6, 0.06], 0.17, 0.07, 0.06); K.blob([0, 1.62, -0.46], 0.09, 0.08, 0.07);
    for (const s of [-1, 1]) { K.paint("#3a2618"); K.limb([s * 0.3, 1.48, -0.22], [s * 0.36, 1.0, -0.2], 0.02, 0.02);
      K.paint("#8a8478"); K.blob([s * 0.36, 0.96, -0.2], 0.06, 0.035, 0.05); }
    K.paint("#3a2618"); K.limb([0, 1.36, -0.24], [0, 0.98, -0.2], 0.27, 0.02);   // girth
  }
  // neck and mane
  K.bone("neck"); K.paint(coat);
  K.chain([[0, 1.3, -0.62], [0, 1.58, -0.86], [0, 1.84, -1.0], [0, 1.98, -1.06]], [[0.2, 0.28], [0.15, 0.22], [0.12, 0.16], [0.1, 0.12]], { capStart: 0.06 });
  K.paint(mane);
  if (K.lod <= 3) for (let i = 0; i < 9; i++) { const t = i / 8, y = 1.66 + t * 0.44, z = -0.6 - t * 0.46;
    K.limb([0, y + 0.06, z], [(i % 2 ? 0.1 : -0.1), y - 0.16, z + 0.05], 0.05, 0.012); }
  // head: poll to muzzle, angled down; ears, eyes, nostrils, forelock
  K.bone("head"); K.paint(coat);
  K.chain([[0, 2.02, -1.04], [0, 1.94, -1.2], [0, 1.78, -1.4], [0, 1.64, -1.56]], [[0.1, 0.13], [0.11, 0.13], [0.085, 0.1], [0.075, 0.085]], { capStart: 0.05 });
  K.paint(muzzle); K.blob([0, 1.6, -1.6], 0.085, 0.08, 0.08);
  K.paint("#0e0b0a"); for (const s of [-1, 1]) K.blob([s * 0.045, 1.6, -1.67], 0.018, 0.022, 0.018);
  if (blaze) { K.paint(blaze); K.chain([[0, 2.1, -1.16], [0, 1.97, -1.36], [0, 1.8, -1.55]], [[0.045, 0.02], [0.035, 0.02], [0.05, 0.02]], {}); }
  K.paint(coat); for (const s of [-1, 1]) K.limb([s * 0.06, 2.06, -1.04], [s * 0.08, 2.24, -1.0], 0.035, 0.008);
  K.paint("#0b0908"); for (const s of [-1, 1]) K.blob([s * 0.1, 1.97, -1.2], 0.022, 0.026, 0.026);
  K.paint(mane); K.limb([0, 2.06, -1.08], [0, 1.95, -1.2], 0.05, 0.015);
  // tail: dock and long hair
  K.bone("tail"); K.paint(mane);
  K.chain([[0, 1.3, 0.84], [0, 1.16, 1.0], [0, 0.85, 1.06], [0, 0.48, 1.02]], [0.06, 0.09, 0.1, 0.05], { capEnd: 0.03 });
}
export function collider() { return [{ kind: "box", width: 0.64, height: 1.6, depth: 1.95, center: [0, 0.8, -0.03] }]; }
