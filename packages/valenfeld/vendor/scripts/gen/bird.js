// A carrion bird hovering ~1.7 m over its feet point: body, broad wings that beat, a hooked beak, a fanned tail.
// ~1.6 m wingspan at scale 1, facing -Z. The root bone sits on the ground, so pitching it swings the whole bird down in a dive.
// params.colors = [plumage, beak/legs, eye]. Bones: root body wingL wingR head tail. Clips: scripts/lib/beast-clips.js#bird.
import { bk } from "../lib/beastkit.js";
const Y = 1.7;
export function skeleton() {
  return { root: { pivot: [0, 0, 0.4] }, body: { parent: "root", pivot: [0, Y, 0] }, wingL: { parent: "body", pivot: [-0.08, Y + 0.05, -0.04] },
    wingR: { parent: "body", pivot: [0.08, Y + 0.05, -0.04] }, head: { parent: "body", pivot: [0, Y + 0.05, -0.2] }, tail: { parent: "body", pivot: [0, Y, 0.18] } };
}
export function geometry(ctx) {
  const K = bk(ctx), [plum, beak, eye] = K.P.colors ?? ["#1c1a1c", "#c9a24a", "#ffd23a"];
  K.bone("body"); K.paint(plum, 0.8);
  K.blob([0, Y, 0], 0.09, 0.09, 0.22);
  K.paint(beak); for (const s of [-1, 1]) { K.limb([s * 0.04, Y - 0.06, 0.04], [s * 0.04, Y - 0.2, 0.1], 0.012, 0.008); K.limb([s * 0.04, Y - 0.2, 0.1], [s * 0.04, Y - 0.22, 0.04], 0.01, 0.004); }
  for (const [b, s] of [["wingL", -1], ["wingR", 1]]) {
    K.bone(b); K.paint(plum, 0.85);
    const r = [s * 0.08, Y + 0.05, -0.08], e = [s * 0.42, Y + 0.08, -0.06], t = [s * 0.82, Y + 0.02, 0.06];
    K.limb(r, e, 0.035, 0.025); K.limb(e, t, 0.025, 0.01);
    K.sheet([r, e, t, [s * 0.72, Y, 0.2], [s * 0.45, Y + 0.01, 0.22], [s * 0.15, Y + 0.02, 0.16]]);   // the membrane of flight feathers
    for (let i = 0; i < 4; i++) K.limb([s * (0.55 + i * 0.08), Y + 0.02, 0.04 + i * 0.01], [s * (0.62 + i * 0.1), Y, 0.22 - i * 0.03], 0.012, 0.004); // primaries
  }
  K.bone("head"); K.paint(plum);
  K.chain([[0, Y + 0.02, -0.16], [0, Y + 0.07, -0.26], [0, Y + 0.08, -0.32]], [0.055, 0.05, 0.035]);
  K.paint(beak, 0.4); K.chain([[0, Y + 0.08, -0.34], [0, Y + 0.06, -0.42], [0, Y + 0.02, -0.45]], [0.025, 0.014, 0.006]);
  K.eyes([[-0.035, Y + 0.1, -0.3], [0.035, Y + 0.1, -0.3]], 0.011, eye);
  K.bone("tail"); K.paint(plum);
  K.sheet([[0, Y, 0.16], [-0.12, Y - 0.02, 0.42], [0, Y - 0.01, 0.46], [0.12, Y - 0.02, 0.42]]);
}
export function collider() { return { kind: "box", width: 0.8, height: 2.0, depth: 0.8, center: [0, 1.0, 0] }; }
