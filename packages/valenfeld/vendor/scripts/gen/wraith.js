// A spirit: a hooded, tattered shroud floating over the ground, long clawed arms, two eyes burning in an empty hood.
// ~2 m tall at scale 1, facing -Z. Grave wraith, ice wraith and dust haunt differ by params.colors = [shroud, hem/claw, eye glow].
// Translucent faces; enemies.js flickers it out of sight (row flicker: true). Bones: root body armL armR head. Clips: beast-clips.js#wraith.
import { bk } from "../lib/beastkit.js";
export function skeleton() {
  return { root: { pivot: [0, 0, 0] }, body: { parent: "root", pivot: [0, 1.1, 0] }, head: { parent: "body", pivot: [0, 1.62, 0] },
    armL: { parent: "body", pivot: [-0.22, 1.5, 0] }, armR: { parent: "body", pivot: [0.22, 1.5, 0] } };
}
export function geometry(ctx) {
  const K = bk(ctx), [shroud, hem, eye] = K.P.colors ?? ["#2a2e34", "#8a9298", "#9fe8ff"];
  K.bone("body"); ctx.color(shroud, 0.82); ctx.emissive(null);
  K.m.tube([{ p: [0, 1.62, 0], rx: 0.14 }, { p: [0, 1.45, 0.02], rx: 0.24 }, { p: [0, 1.1, 0.06], rx: 0.27 }, { p: [0, 0.7, 0.1], rx: 0.31 }, { p: [0, 0.35, 0.16], rx: 0.36 }],
    { sides: K.n + 2, k: K.lod <= 2 ? 2 : 1, capStart: 0.05, ref: [0, 0, -1] });
  ctx.color(hem, 0.6);                                                          // tatters trailing off the hem
  for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2, r = 0.33, x = Math.cos(a) * r, z = Math.sin(a) * r + 0.16; K.limb([x, 0.4, z], [x * 1.2, 0.02 + (i % 3) * 0.08, z * 1.1 + 0.08], 0.06, 0.004); }
  K.bone("head"); ctx.color(shroud, 0.9);
  K.m.tube([{ p: [0, 1.58, 0.06], rx: 0.15 }, { p: [0, 1.74, 0.02], rx: 0.16 }, { p: [0, 1.86, 0.06], rx: 0.1 }, { p: [0, 1.93, 0.14], rx: 0.03 }], { sides: K.n, capStart: 0, capEnd: 0.02 });
  ctx.color("#050505"); K.blob([0, 1.72, -0.08], 0.11, 0.12, 0.05);             // the hollow of the hood
  K.eyes([[-0.045, 1.74, -0.12], [0.045, 1.74, -0.12]], 0.022, eye);
  for (const [b, s] of [["armL", -1], ["armR", 1]]) {
    K.bone(b); ctx.color(shroud, 0.85); ctx.emissive(null);
    K.limb([s * 0.22, 1.5, 0], [s * 0.36, 1.12, -0.12], 0.075, 0.05); K.limb([s * 0.36, 1.12, -0.12], [s * 0.4, 0.86, -0.3], 0.05, 0.03);
    K.paint(hem, 0.4); for (let f = -1; f <= 1; f++) K.limb([s * 0.4, 0.86, -0.3], [s * (0.42 + f * 0.03), 0.66, -0.4 + f * 0.02], 0.014, 0.002);
  }
}
export function collider() { return { kind: "box", width: 0.7, height: 2.0, depth: 0.7, center: [0, 1.0, 0] }; }
