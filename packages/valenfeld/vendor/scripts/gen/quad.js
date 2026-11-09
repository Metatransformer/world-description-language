// A four-legged beast on one rig, its kind by params.form: rat | boar | bear | elk | cat | lizard. ~1.2 m nose to rump at scale 1,
// feet at the origin, facing -Z; rows scale it (a gutter rat 0.45, a moor bear 1.5). params.colors = [coat, belly/accent, eye].
// Bones: body(root) head jaw tail legFL legFR legBL legBR. Clips: scripts/lib/beast-clips.js#quad.
import { bk } from "../lib/beastkit.js";
export function skeleton() {
  return {
    body: { pivot: [0, 0.45, 0] }, head: { parent: "body", pivot: [0, 0.52, -0.4] }, jaw: { parent: "head", pivot: [0, 0.46, -0.5] },
    tail: { parent: "body", pivot: [0, 0.5, 0.4] },
    legFL: { parent: "body", pivot: [-0.14, 0.42, -0.26] }, legFR: { parent: "body", pivot: [0.14, 0.42, -0.26] },
    legBL: { parent: "body", pivot: [-0.14, 0.42, 0.28] }, legBR: { parent: "body", pivot: [0.14, 0.42, 0.28] },
  };
}
const FORMS = {
  //       body rx, ry, hump, leg r, head len, head r, snout, ear, tail len, tail r
  rat:    { bx: 0.17, by: 0.17, hump: 0.11, earC: "#e0a2a0", footC: "#e6aaa2", lr: 0.035, hl: 0.24, hr: 0.1, sn: 0.04, ear: "round", tl: 0.75, tr: 0.03, tailC: "#c79a8e" },
  boar:   { bx: 0.21, by: 0.25, hump: 0.12, lr: 0.05, hl: 0.26, hr: 0.14, sn: 0.08, ear: "point", tl: 0.18, tr: 0.02, tusk: true, ridge: true },
  bear:   { bx: 0.27, by: 0.27, hump: 0.12, lr: 0.08, hl: 0.2, hr: 0.15, sn: 0.07, ear: "round", tl: 0.08, tr: 0.05 },
  elk:    { bx: 0.16, by: 0.2, hump: 0.08, lr: 0.034, hl: 0.3, hr: 0.1, sn: 0.07, ear: "point", tl: 0.1, tr: 0.035, antler: true, tailC: "#e8dcc0" },
  cat:    { bx: 0.15, by: 0.16, hump: 0.0, lr: 0.04, hl: 0.16, hr: 0.11, sn: 0.05, ear: "tuft", tl: 0.6, tr: 0.045 },
  lizard: { bx: 0.2, by: 0.12, hump: -0.12, lr: 0.05, hl: 0.26, hr: 0.1, sn: 0.07, ear: null, tl: 0.9, tr: 0.09, low: true, spines: true },
};
export function geometry(ctx) {
  const K = bk(ctx), P = K.P, F = FORMS[P.form] ?? FORMS.rat, [coat, belly, eye] = P.colors ?? ["#5a4a3a", "#8a7a66", "#ffcc33"];
  const by = 0.48 + F.hump * 0.5 - (F.low ? 0.1 : 0);
  K.bone("body"); K.paint(coat);
  K.chain([[0, by - 0.02, 0.42], [0, by + F.hump * 0.4, 0.15], [0, by + F.hump, -0.15], [0, by + F.hump * 0.6, -0.36]],
    [[F.bx * 0.7, F.by * 0.75], [F.bx, F.by], [F.bx * 1.02, F.by * 1.05], [F.bx * 0.75, F.by * 0.8]], { capStart: 0.08, capEnd: 0.04 });
  K.paint(belly); K.blob([0, by - F.by * 0.55, 0.0], F.bx * 0.7, F.by * 0.4, 0.3);
  if (F.ridge) { K.paint("#1e1812"); for (let i = 0; i < 7; i++) { const z = -0.32 + i * 0.1; K.limb([0, by + F.hump * 0.7 + F.by * 0.85, z], [0, by + F.hump + F.by + 0.1 - i * 0.012, z + 0.04], 0.03, 0.005); } }
  if (F.spines) { K.paint(belly); for (let i = 0; i < 6; i++) { const z = -0.3 + i * 0.12; K.limb([0, by + F.by * 0.8, z], [0, by + F.by + 0.08, z + 0.05], 0.025, 0.004); } }
  // legs: hip to paw, lizard legs splay outward
  const legY = F.low ? 0.32 : 0.42;
  for (const [b, x, z] of [["legFL", -1, -0.26], ["legFR", 1, -0.26], ["legBL", -1, 0.28], ["legBR", 1, 0.28]]) {
    K.bone(b); K.paint(coat);
    const hx = x * F.bx * 0.75, out = F.low ? x * 0.18 : 0;
    K.chain([[hx, legY + 0.1, z], [hx + out * 0.8, legY - 0.12, z + 0.02], [hx + out, 0.04, z - 0.03]], [F.lr * 1.5, F.lr, F.lr * 0.85], { capEnd: 0.03 });
    K.paint(F.footC ?? (F.low || P.form === "bear" ? "#1a1612" : belly)); K.blob([hx + out, 0.035, z - 0.06], F.lr * 1.1, 0.03, F.lr * 1.4);
  }
  // head: skull, snout, ears, eyes
  K.bone("head"); K.paint(coat);
  const hy = by + F.hump * 0.6 + 0.05 - (F.low ? 0.02 : 0), hz = -0.4;
  K.chain([[0, hy, hz + 0.05], [0, hy + 0.02, hz - F.hl * 0.4], [0, hy - 0.01, hz - F.hl * 0.8], [0, hy - 0.03, hz - F.hl - F.sn]],
    [F.hr * 0.9, F.hr, F.hr * 0.75, F.hr * 0.4], { capEnd: 0.03 });
  K.paint(P.form === "boar" ? "#c99a8a" : "#141010"); K.blob([0, hy - 0.03, hz - F.hl - F.sn - 0.01], F.hr * 0.42, F.hr * 0.36, 0.03);
  K.paint(coat);
  if (F.ear) for (const s of [-1, 1]) {
    const e0 = [s * F.hr * 0.6, hy + F.hr * 0.7, hz - F.hl * 0.25];
    if (F.ear === "round") { if (F.earC) K.paint(F.earC); K.blob([e0[0] * 1.15, e0[1] + 0.04, e0[2]], F.hr * (F.earC ? 0.5 : 0.38), F.hr * (F.earC ? 0.5 : 0.38), 0.02); K.paint(coat); }
    else { K.limb(e0, [e0[0] * 1.2, e0[1] + F.hr * (F.ear === "tuft" ? 0.9 : 0.75), e0[2] + 0.03], F.hr * 0.35, 0.008); if (F.ear === "tuft") { K.paint("#141010"); K.limb([e0[0] * 1.2, e0[1] + F.hr * 0.85, e0[2] + 0.03], [e0[0] * 1.25, e0[1] + F.hr * 1.25, e0[2] + 0.03], 0.012, 0.002); K.paint(coat); } }
  }
  if (F.tusk) { K.paint("#e8dcc0"); for (const s of [-1, 1]) K.limb([s * 0.06, hy - 0.06, hz - F.hl - 0.02], [s * 0.1, hy + 0.06, hz - F.hl - 0.04], 0.018, 0.004); }
  if (F.antler) { K.paint("#d8c8a8", 0.7); for (const s of [-1, 1]) {   // a bull's rack: beam up and back, four tines forward
    const b0 = [s * F.hr * 0.45, hy + F.hr * 0.8, hz - F.hl * 0.3], b1 = [s * 0.2, hy + 0.3, hz + 0.02], b2 = [s * 0.32, hy + 0.55, hz + 0.12];
    K.chain([b0, b1, b2], [0.022, 0.017, 0.01], { capEnd: 0.01 });
    for (const t of [0.25, 0.5, 0.75, 1]) { const p = t < 0.5 ? b0.map((v, i) => v + (b1[i] - v) * t * 2) : b1.map((v, i) => v + (b2[i] - v) * (t - 0.5) * 2); K.limb(p, [p[0] + s * 0.03, p[1] + 0.1, p[2] - 0.12], 0.012, 0.003); }
  } }
  K.eyes([[-F.hr * 0.62, hy + F.hr * 0.35, hz - F.hl * 0.45], [F.hr * 0.62, hy + F.hr * 0.35, hz - F.hl * 0.45]], Math.max(0.014, F.hr * 0.16), eye);
  K.bone("jaw"); K.paint(belly);
  K.chain([[0, hy - F.hr * 0.55, hz - F.hl * 0.3], [0, hy - F.hr * 0.6, hz - F.hl - F.sn * 0.6]], [F.hr * 0.55, F.hr * 0.3], { capEnd: 0.02 });
  K.paint("#efe6d0"); for (const s of [-1, 1]) K.limb([s * F.hr * 0.22, hy - F.hr * 0.45, hz - F.hl - F.sn * 0.4], [s * F.hr * 0.22, hy - F.hr * 0.15, hz - F.hl - F.sn * 0.4], 0.012, 0.003);
  K.bone("tail"); K.paint(F.tailC ?? coat);
  if (F.tl > 0.1) K.chain([[0, by + 0.02, 0.38], [0, by - 0.02 - (F.low ? 0.08 : 0), 0.38 + F.tl * 0.4], [0, by - 0.12 - (F.low ? 0.1 : 0), 0.38 + F.tl * 0.8], [0, by - 0.2 - (F.low ? 0.1 : 0), 0.4 + F.tl]], [F.tr, F.tr * 0.85, F.tr * 0.6, F.tr * 0.25], { capEnd: 0.02 });
  else K.blob([0, by + 0.03, 0.44], F.tr * 1.5, F.tr * 1.5, F.tr * 2);
}
export function collider() { return { kind: "box", width: 0.5, height: 0.8, depth: 1.2, center: [0, 0.4, -0.05] }; }
