// A red fox: ~0.95 m nose to brush tip, 0.38 m at the shoulder, black socks, white throat and tail tip; feet at the origin, facing -Z.
// Bones: body (root), head, tail, legFL/legFR/legBL/legBR. Clips: scripts/lib/wildkin.js CLIPS.fox.
import { bk } from "../lib/beastkit.js";
export function skeleton() {
  return { body: { pivot: [0, 0.32, 0] }, head: { parent: "body", pivot: [0, 0.37, -0.24] }, tail: { parent: "body", pivot: [0, 0.34, 0.22] },
    legFL: { parent: "body", pivot: [-0.055, 0.3, -0.18] }, legFR: { parent: "body", pivot: [0.055, 0.3, -0.18] },
    legBL: { parent: "body", pivot: [-0.06, 0.3, 0.16] }, legBR: { parent: "body", pivot: [0.06, 0.3, 0.16] } };
}
export function geometry(ctx) {
  const K = bk(ctx), coat = "#a9521f", deep = "#7a3a17", cream = "#e6ddcc", sock = "#231812";
  K.bone("body"); K.paint(coat, 0.95);
  K.chain([[0, 0.35, -0.25], [0, 0.34, -0.08], [0, 0.34, 0.1], [0, 0.34, 0.22]], [[0.068, 0.085], [0.08, 0.095], [0.078, 0.09], [0.055, 0.065]]);
  K.paint(cream); K.blob([0, 0.31, -0.24], 0.05, 0.06, 0.055);
  for (const [b, x, z] of [["legFL", -0.055, -0.18], ["legFR", 0.055, -0.18], ["legBL", -0.06, 0.16], ["legBR", 0.06, 0.16]]) {
    K.bone(b); K.paint(z > 0 ? coat : deep); K.limb([x, 0.32, z], [x, 0.15, z + (z > 0 ? 0.03 : 0)], z > 0 ? 0.035 : 0.025, 0.018);
    K.paint(sock); K.limb([x, 0.15, z + (z > 0 ? 0.03 : 0)], [x, 0.0, z - 0.02], 0.017, 0.013);
  }
  K.bone("head"); K.paint(coat);
  K.blob([0, 0.41, -0.31], 0.062, 0.058, 0.068);
  K.chain([[0, 0.4, -0.35], [0, 0.385, -0.42], [0, 0.375, -0.46]], [0.038, 0.022, 0.012]);
  K.paint(cream); K.blob([0, 0.375, -0.37], 0.035, 0.022, 0.04);
  K.paint(sock, 0.3); K.blob([0, 0.378, -0.465], 0.012, 0.011, 0.01);
  for (const s of [-1, 1]) {
    K.paint(deep); K.limb([s * 0.035, 0.45, -0.3], [s * 0.05, 0.54, -0.3], 0.028, 0.004);
    K.paint(sock, 0.3); K.blob([s * 0.033, 0.425, -0.36], 0.009, 0.009, 0.008);
  }
  K.bone("tail"); K.paint(coat);
  K.chain([[0, 0.34, 0.22], [0, 0.3, 0.36], [0, 0.24, 0.5], [0, 0.2, 0.6]], [0.03, 0.058, 0.062, 0.03]);
  K.paint(cream); K.blob([0, 0.2, 0.615], 0.028, 0.028, 0.035);
}
