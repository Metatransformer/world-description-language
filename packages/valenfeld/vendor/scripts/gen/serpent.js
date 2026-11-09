// A segmented burrower standing up out of its root (feet) point: a ringed body, a round maw of teeth.
// form "wurm" (2.6 m tall at scale 1, a glowing gullet), form "leech" (the same rig laid flat by its clips, a sucker mouth).
// params.colors = [hide, belly ring, maw]. Bones: seg0(root, on the ground) seg1 seg2 seg3 head. Clips: scripts/lib/beast-clips.js#wurm, #leech.
import { bk } from "../lib/beastkit.js";
export function skeleton() {
  return { seg0: { pivot: [0, 0, 0] }, seg1: { parent: "seg0", pivot: [0, 0.6, 0] }, seg2: { parent: "seg1", pivot: [0, 1.2, 0] },
    seg3: { parent: "seg2", pivot: [0, 1.8, 0] }, head: { parent: "seg3", pivot: [0, 2.3, 0] } };
}
export function geometry(ctx) {
  const K = bk(ctx), P = K.P, [hide, ring, maw] = P.colors ?? ["#a8875a", "#d4b98a", "#ff8a3a"], R = 0.3;
  const bones = ["seg0", "seg1", "seg2", "seg3"];
  bones.forEach((b, i) => {
    K.bone(b); K.paint(hide, 0.7);
    K.chain([[0, i * 0.6 - 0.06, 0], [0, i * 0.6 + 0.3, -0.01], [0, i * 0.6 + 0.66, 0]], [R * (1.08 - i * 0.07), R * (1.12 - i * 0.07), R * (1.02 - i * 0.08)]);
    if (K.lod <= 3) { K.paint(ring, 0.6); for (const y of [0.15, 0.45]) K.chain([[0, i * 0.6 + y - 0.03, 0], [0, i * 0.6 + y + 0.03, 0]], [R * (1.12 - i * 0.07), R * (1.12 - i * 0.07)]); }
  });
  K.bone("head"); K.paint(hide, 0.6);
  K.chain([[0, 2.25, 0], [0, 2.45, -0.02], [0, 2.6, -0.05]], [R * 0.85, R * 0.95, R * 0.8], { capEnd: 0 });
  K.glow(maw); K.blob([0, 2.6, -0.05], R * 0.62, 0.04, R * 0.62);                // the gullet
  K.paint("#efe4c8", 0.3);
  const teeth = P.form === "leech" ? 6 : 12;
  for (let i = 0; i < teeth; i++) { const a = (i / teeth) * Math.PI * 2, c = Math.cos(a) * R * 0.72, s = Math.sin(a) * R * 0.72; K.limb([c, 2.6, s - 0.05], [c * 0.55, 2.72, s * 0.55 - 0.05], 0.03, 0.004); }
  if (P.form !== "leech") { K.paint(ring, 0.5); for (let i = 0; i < 3; i++) { const a = i * 2.1; K.limb([Math.cos(a) * R * 0.7, 2.5, Math.sin(a) * R * 0.7], [Math.cos(a) * R * 1.4, 2.95, Math.sin(a) * R * 1.4], 0.06, 0.01); } }
}
// a leech lies flat along its local -z (seg0 pitched -88 by every leech clip): its box lies with it, head to tail (creator Nov 4: "saltmarch leech hitbox doesnt work")
export function collider(c) { return c?.params?.form === "leech" ? { kind: "box", width: 0.8, height: 0.7, depth: 2.8, center: [0, 0.35, -1.3] } : { kind: "box", width: 0.9, height: 1.6, depth: 0.9, center: [0, 0.8, 0] }; }
