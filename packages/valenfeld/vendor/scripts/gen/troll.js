// The Pit Troll: a hunched, long-armed brute, ~2.6 m at scale 1 (the den's sits at 1.08 ≈ 2.8 m), facing -Z.
// Mossy grey-green hide, a small head slung low under a shoulder hump, two lower tusks, a crude knotted club in the right hand.
// params.colors = [hide, moss, belly, tusk, club, eye]. Bones: root body head armL armR legL legR. Clips: beast-clips.js#troll.
import { bk } from "../lib/beastkit.js";
export function skeleton() {
  return { root: { pivot: [0, 0, 0] }, body: { parent: "root", pivot: [0, 1.05, 0.05] }, head: { parent: "body", pivot: [0, 2.32, -0.5] },
    armL: { parent: "body", pivot: [-0.62, 2.12, -0.25] }, armR: { parent: "body", pivot: [0.62, 2.12, -0.25] },
    legL: { parent: "root", pivot: [-0.32, 1.05, 0.05] }, legR: { parent: "root", pivot: [0.32, 1.05, 0.05] } };
}
export function geometry(ctx) {
  const K = bk(ctx), [hide, moss, belly, tusk, club, eye] = K.P.colors ?? ["#5d6752", "#4f6b4a", "#7d7a62", "#d9cfae", "#5a4430", "#e8b840"];
  const near = K.lod <= 2, mid = K.lod <= 3;
  // legs: thick, short, bowed
  for (const [b, s] of [["legL", -1], ["legR", 1]]) {
    K.bone(b); K.paint(hide, 0.85);
    K.chain([[s * 0.32, 1.08, 0.05], [s * 0.4, 0.58, -0.1], [s * 0.36, 0.12, 0.02]], [0.25, 0.2, 0.15]);
    K.paint(belly, 0.9); K.blob([s * 0.37, 0.09, -0.1], 0.16, 0.09, 0.24);                    // broad flat foot
    if (near) { K.paint(tusk, 0.6); for (const t of [-1, 0, 1]) K.limb([s * 0.37 + t * 0.07, 0.07, -0.3], [s * 0.37 + t * 0.08, 0.03, -0.38], 0.03, 0.01); }
  }
  // trunk: pelvis, pot belly, barrel chest leaning far forward, shoulder hump
  K.bone("body"); K.paint(hide, 0.85);
  K.chain([[0, 0.95, 0.12], [0, 1.45, 0.12], [0, 1.95, -0.02], [0, 2.22, -0.28], [0, 2.33, -0.48]], [[0.46, 0.4], [0.58, 0.52], [0.64, 0.56], [0.5, 0.46], [0.26, 0.24]], { ref: [0, 0, -1] });
  K.blob([0, 2.12, 0.12], 0.5, 0.36, 0.4);                                                    // the hump
  K.paint(belly, 0.9); K.blob([0, 1.4, -0.22], 0.44, 0.42, 0.3);                              // sagging belly
  K.paint("#3a3226", 0.95); K.blob([0, 1.02, -0.05], 0.48, 0.2, 0.42);                        // hide loincloth
  if (mid) {                                                                                   // moss grown over the back and shoulders
    K.paint(moss, 1);
    for (const [x, y, z, r] of [[0, 2.36, 0.12, 0.3], [-0.38, 2.24, -0.08, 0.22], [0.4, 2.26, -0.1, 0.2], [0.12, 1.9, 0.42, 0.24], [-0.22, 1.6, 0.48, 0.18]]) K.blob([x, y, z], r, r * 0.45, r);
    if (near) { K.paint("#6f8a4a", 1); for (let i = 0; i < 7; i++) { const a = i * 0.9; K.blob([Math.sin(a) * 0.3, 2.3 + Math.cos(a * 1.7) * 0.12, 0.05 + Math.cos(a) * 0.25], 0.08, 0.05, 0.08); } }
  }
  // head: small, slung low, heavy brow, underbite with two tusks
  K.bone("head"); K.paint(hide, 0.85);
  K.blob([0, 2.42, -0.7], 0.2, 0.19, 0.22);
  K.paint(belly, 0.85); K.blob([0, 2.28, -0.76], 0.22, 0.11, 0.17);                            // jaw
  K.paint(hide, 0.85); K.blob([0, 2.52, -0.86], 0.19, 0.06, 0.07);                             // brow ridge
  K.blob([0, 2.42, -0.92], 0.06, 0.07, 0.07);                                                  // lump of a nose
  if (mid) for (const s of [-1, 1]) K.limb([s * 0.17, 2.46, -0.68], [s * 0.32, 2.56, -0.62], 0.06, 0.01);  // ragged ears
  K.paint(tusk, 0.5);
  for (const s of [-1, 1]) K.limb([s * 0.11, 2.28, -0.88], [s * 0.14, 2.47, -0.97], mid ? 0.04 : 0.05, 0.008);
  K.eyes([[-0.08, 2.47, -0.9], [0.08, 2.47, -0.9]], 0.026, eye);
  // arms: long enough to drag the knuckles near the knees
  for (const [b, s] of [["armL", -1], ["armR", 1]]) {
    K.bone(b); K.paint(hide, 0.85);
    K.blob([s * 0.62, 2.12, -0.22], 0.24, 0.22, 0.24);                                         // shoulder
    K.limb([s * 0.64, 2.1, -0.25], [s * 0.8, 1.5, -0.35], 0.2, 0.16);
    K.limb([s * 0.8, 1.5, -0.35], [s * 0.83, 0.78, -0.45], 0.19, 0.13);                        // heavy forearm
    K.blob([s * 0.84, 0.62, -0.48], 0.15, 0.14, 0.16);                                         // fist
    if (near && s < 0) { K.paint(tusk, 0.6); for (const t of [-1, 0, 1]) K.limb([s * 0.84 + t * 0.06, 0.54, -0.58], [s * 0.84 + t * 0.07, 0.46, -0.62], 0.025, 0.008); }
    if (mid) { K.paint(moss, 1); K.blob([s * 0.68, 2.3, -0.2], 0.16, 0.07, 0.16); }
  }
  // the club, gripped in the right fist, head forward and low
  K.bone("armR"); K.paint(club, 0.9);
  K.chain([[0.84, 0.82, -0.36], [0.85, 0.6, -0.5], [0.88, 0.3, -1.0], [0.9, 0.12, -1.45]], [0.055, 0.06, 0.12, 0.17], { capEnd: 0.1 });
  if (mid) {
    K.paint("#3e2f22", 0.95);
    for (const [x, y, z, r] of [[0.98, 0.24, -1.24, 0.08], [0.8, 0.16, -1.36, 0.07], [0.92, 0.04, -1.3, 0.07], [0.88, 0.3, -1.12, 0.06]]) K.blob([x, y, z], r, r, r);
    if (near) { K.paint("#8a8a86", 0.4); for (const [a, b] of [[[0.95, 0.2, -1.4], [1.08, 0.22, -1.44]], [[0.84, 0.18, -1.32], [0.72, 0.22, -1.36]], [[0.9, 0.06, -1.42], [0.9, -0.04, -1.5]]]) K.limb(a, b, 0.02, 0.004); }  // nails hammered through
  }
}
export function collider() { return { kind: "box", width: 1.2, height: 2.5, depth: 1.1, center: [0, 1.25, -0.1] }; }
