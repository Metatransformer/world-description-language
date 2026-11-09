// A spider on one rig: eight jointed legs, cephalothorax, swollen abdomen, fangs, a cluster of glowing eyes. ~1.3 m leg span at
// scale 1, feet at the origin, facing -Z. params.colors = [carapace, abdomen marking, eye]. params.form "queen" adds a crown of spines.
// Bones: body(root) abdomen fangs leg{L,R}{1..4}. Clips: scripts/lib/beast-clips.js#spider.
import { bk } from "../lib/beastkit.js";
const LZ = [-0.13, -0.045, 0.045, 0.13];
export function skeleton() {
  const s = { body: { pivot: [0, 0.32, 0] }, abdomen: { parent: "body", pivot: [0, 0.36, 0.14] }, fangs: { parent: "body", pivot: [0, 0.28, -0.2] } };
  LZ.forEach((z, i) => { s["legL" + (i + 1)] = { parent: "body", pivot: [-0.1, 0.34, z] }; s["legR" + (i + 1)] = { parent: "body", pivot: [0.1, 0.34, z] }; });
  return s;
}
export function geometry(ctx) {
  const K = bk(ctx), P = K.P, [shell, mark, eye] = P.colors ?? ["#231d18", "#8a2a1a", "#ff3a1a"];
  K.bone("body"); K.paint(shell, 0.5);
  K.blob([0, 0.33, -0.04], 0.13, 0.09, 0.17);                                    // cephalothorax
  K.eyes([[-0.04, 0.4, -0.19], [0.04, 0.4, -0.19], [-0.07, 0.38, -0.16], [0.07, 0.38, -0.16], [-0.025, 0.43, -0.15], [0.025, 0.43, -0.15]], 0.018, eye);
  K.bone("abdomen"); K.paint(shell, 0.45);
  K.blob([0, 0.42, 0.32], 0.2, 0.17, 0.24);                                       // abdomen
  K.paint(mark, 0.4); K.blob([0, 0.565, 0.3], 0.07, 0.035, 0.13); K.blob([0, 0.55, 0.45], 0.05, 0.03, 0.05);
  if (P.form === "queen") { K.paint("#d8c8a0", 0.4); for (let i = 0; i < 5; i++) K.limb([0, 0.55, 0.2 + i * 0.07], [0, 0.72 - i * 0.02, 0.24 + i * 0.08], 0.022, 0.003); }
  for (let side of [-1, 1]) LZ.forEach((z, i) => {
    K.bone((side < 0 ? "legL" : "legR") + (i + 1)); K.paint(shell, 0.55);
    const fan = (z * 3.2), hip = [side * 0.1, 0.34, z], knee = [side * 0.36, 0.56, z + fan * 0.25], foot = [side * 0.62, 0.0, z + fan * 0.55];
    K.limb(hip, knee, 0.03, 0.024); K.limb(knee, foot, 0.024, 0.008);
    K.paint(mark); K.blob(knee, 0.03, 0.03, 0.03);
  });
  K.bone("fangs"); K.paint("#120e0c", 0.3);
  for (const s of [-1, 1]) { K.limb([s * 0.04, 0.3, -0.2], [s * 0.05, 0.24, -0.26], 0.026, 0.02); K.paint("#d8d0b8", 0.3); K.limb([s * 0.05, 0.24, -0.26], [s * 0.025, 0.16, -0.27], 0.014, 0.003); K.paint("#120e0c", 0.3); }
}
export function collider() { return { kind: "box", width: 0.9, height: 0.6, depth: 0.9, center: [0, 0.3, 0.05] }; }
