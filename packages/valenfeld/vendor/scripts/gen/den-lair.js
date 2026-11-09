// Lair litter for a monster's pit: params.kind = bones | skull | ribs | shield | fungus. Small, no collider; facing -Z.
import { bk } from "../lib/beastkit.js";
export function geometry(ctx) {
  const K = bk(ctx), k = K.P.kind ?? "bones", bone = "#cdbf9c", old = "#9c8f70", near = K.lod <= 2;
  const femur = (a, b, r) => { K.paint(bone, 0.7); K.limb(a, b, r, r * 0.9); K.blob(a, r * 1.7, r * 1.4, r * 1.6); K.blob(b, r * 1.6, r * 1.3, r * 1.5); };
  if (k === "bones") {          // a scatter of long bones, one big enough to be from something like a horse
    femur([-0.5, 0.06, 0.1], [0.45, 0.07, -0.2], 0.05); femur([-0.2, 0.05, 0.35], [0.35, 0.05, 0.42], 0.035); femur([0.1, 0.04, -0.45], [0.3, 0.12, 0.05], 0.03);
    if (near) { K.paint(old, 0.8); for (let i = 0; i < 5; i++) K.blob([-0.4 + i * 0.18, 0.03, -0.1 + (i % 2) * 0.3], 0.05, 0.03, 0.04); }
  } else if (k === "skull") {   // a man's skull and jaw, cracked
    K.paint(bone, 0.6); K.blob([0, 0.13, 0.02], 0.12, 0.12, 0.14); K.blob([0, 0.07, -0.1], 0.08, 0.06, 0.06);
    K.paint("#1a1712", 1); for (const s of [-1, 1]) K.blob([s * 0.045, 0.13, -0.11], 0.03, 0.028, 0.02); K.blob([0, 0.08, -0.15], 0.015, 0.02, 0.01);
    K.paint(old, 0.7); K.blob([0.18, 0.03, 0.05], 0.07, 0.025, 0.06);
  } else if (k === "ribs") {    // a picked ribcage on its side
    K.paint(bone, 0.7); K.chain([[0, 0.1, 0.5], [0, 0.12, 0], [0, 0.1, -0.5]], [0.05, 0.05, 0.04]);
    for (let i = 0; i < (near ? 7 : 4); i++) { const z = -0.4 + i * (0.8 / ((near ? 7 : 4) - 1)), w = 0.32 - Math.abs(z) * 0.2;
      for (const s of [-1, 1]) K.chain([[0, 0.12, z], [s * w * 0.8, 0.32, z - 0.03], [s * w, 0.12, z - 0.06]], [0.022, 0.02, 0.014]); }
  } else if (k === "shield") {  // a round wooden shield, stoved in and buckled across its middle, the boss torn askew
    K.paint("#6a4e34", 0.85);
    ctx.color("#6a4e34"); K.m.tube([{ p: [-0.02, 0.05, 0.0], rx: 0.44, ry: 0.42 }, { p: [0.02, 0.09, 0.0], rx: 0.43, ry: 0.4 }], { sides: K.n + 6, capStart: 0.01, capEnd: 0.01, ref: [0, 0, -1] });
    K.paint("#8c2f22", 0.8); K.blob([0.05, 0.11, -0.02], 0.3, 0.02, 0.06); K.blob([-0.1, 0.11, 0.1], 0.05, 0.02, 0.3);   // faded red cross
    K.paint("#5a5a58", 0.45); K.blob([0.12, 0.14, -0.06], 0.1, 0.08, 0.05);                 // the dented boss
    if (near) { K.paint("#3a2a1e", 1); K.limb([-0.38, 0.12, 0.1], [0.2, 0.18, 0.3], 0.03, 0.02); K.limb([0.2, 0.18, 0.3], [0.4, 0.1, -0.05], 0.025, 0.02); }  // the split
  } else if (k === "fungus") {  // a clump of pale-green glowing caps on a rock lip: the pit's only light source
    K.paint("#3b3a36", 0.95); K.blob([0, 0.12, 0], 0.4, 0.14, 0.32);
    for (let i = 0; i < (near ? 9 : 4); i++) { const a = i * 2.4, r = 0.08 + (i % 3) * 0.1, x = Math.cos(a) * r * 2.4, z = Math.sin(a) * r * 1.6, h = 0.18 + (i % 4) * 0.07;
      K.paint("#b8c49a", 0.8); K.limb([x, 0.1, z], [x, h, z], 0.018, 0.014); K.glow("#9cff7a"); K.blob([x, h + 0.02, z], 0.05 + (i % 2) * 0.03, 0.022, 0.05 + (i % 2) * 0.03); }
  } else if (k === "nest") {    // a wolf's bed: a trodden oval of grey-brown fur and old straw, a hollow pressed in its middle
    K.paint("#6b5a44", 0.95); K.blob([0, 0.05, 0], 0.75, 0.07, 0.55);
    K.paint("#57534c", 1); for (let i = 0; i < (near ? 12 : 6); i++) { const a = i * 0.52, r = 0.55 + (i % 3) * 0.08; K.blob([Math.cos(a) * r, 0.08, Math.sin(a) * r * 0.72], 0.18, 0.07, 0.12); }
    K.paint("#8a7650", 0.95); if (near) for (let i = 0; i < 9; i++) { const a = i * 0.7 + 0.3, r = 0.35 + (i % 4) * 0.12; K.limb([Math.cos(a) * r, 0.09, Math.sin(a) * r * 0.7], [Math.cos(a + 0.5) * (r + 0.2), 0.07, Math.sin(a + 0.5) * (r + 0.2) * 0.7], 0.012, 0.01); }
    K.paint("#3c362e", 1); K.blob([0, 0.075, 0], 0.4, 0.02, 0.3);   // the pressed hollow, darker
  } else if (k === "carcass") { // a deer half-eaten: the hide and haunch still on, the ribs stripped, a leg flung out
    K.paint("#7a5638", 0.85); K.blob([0.35, 0.16, 0], 0.38, 0.16, 0.24); K.blob([0.62, 0.12, 0.08], 0.16, 0.12, 0.13);
    K.paint("#6e2a22", 0.6); K.blob([0.05, 0.12, 0], 0.16, 0.1, 0.2);   // the torn wet edge
    K.paint(bone, 0.7); K.chain([[0.05, 0.14, 0], [-0.35, 0.14, 0], [-0.62, 0.16, 0.02]], [0.04, 0.035, 0.03]);
    for (let i = 0; i < (near ? 6 : 3); i++) { const x = -0.05 - i * (0.5 / ((near ? 6 : 3) - 1)), w = 0.24 - i * 0.025;
      for (const s of [-1, 1]) K.chain([[x, 0.14, 0], [x - 0.03, 0.34, s * w * 0.7], [x - 0.06, 0.05, s * w]], [0.018, 0.016, 0.012]); }
    K.paint("#7a5638", 0.85); K.limb([0.6, 0.1, 0.12], [0.95, 0.04, 0.45], 0.04, 0.025); K.paint("#2a2420", 0.6); K.blob([0.97, 0.04, 0.47], 0.035, 0.03, 0.03);
    K.paint(bone, 0.7); K.limb([0.45, 0.06, -0.15], [0.7, 0.03, -0.55], 0.03, 0.02);
    if (near) { K.paint(old, 0.8); K.blob([-0.75, 0.08, 0.05], 0.09, 0.07, 0.1); K.limb([-0.78, 0.12, 0.04], [-0.95, 0.35, -0.08], 0.015, 0.01); K.limb([-0.78, 0.12, 0.08], [-0.92, 0.33, 0.2], 0.015, 0.01); }   // skull, two antler stubs
  } else if (k === "fur") {     // shed tufts and a dragged trail of hair caught on the rock
    K.paint("#6d6860", 1); for (let i = 0; i < (near ? 8 : 4); i++) { const x = -0.6 + i * 0.17, z = Math.sin(i * 1.7) * 0.25; K.blob([x, 0.03, z], 0.08 + (i % 3) * 0.03, 0.03, 0.06); }
    K.paint("#4a4540", 1); K.blob([0.2, 0.04, 0.1], 0.12, 0.04, 0.08);
  } else if (k === "gnawed") {  // a pile of cracked marrow bones, chewed ends splintered, a few teeth-scored
    for (let i = 0; i < (near ? 7 : 4); i++) { const a = i * 0.9, r = 0.1 + (i % 3) * 0.1, x = Math.cos(a) * r, z = Math.sin(a) * r;
      femur([x - 0.18, 0.04 + (i % 2) * 0.04, z], [x + 0.18, 0.05, z + 0.1 * Math.sin(a * 2)], 0.025 + (i % 2) * 0.01); }
    K.paint("#5a2a20", 0.7); K.blob([0, 0.015, 0], 0.4, 0.008, 0.3);   // old stain under them
  }
}
