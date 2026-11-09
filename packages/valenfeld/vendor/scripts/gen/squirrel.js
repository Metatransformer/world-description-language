// A red squirrel: ~0.35 m nose to haunch, a big bushy tail curled up over its back, tufted ears, feet at the origin, facing -Z.
// Rigged: skeleton() bones body (root), head, tail, legFL/legFR/legBL/legBR.
// Animation contract (degrees): legB pitch ±40 hop, body.pitch -12 crouch, head.pitch nibble, tail.pitch/yaw flick.
import { mesher, smooth as ss, mix, hex } from "../lib/mesh.js";

const C = {
  russet: [0.62, 0.27, 0.09], deep: [0.42, 0.17, 0.06], ginger: [0.78, 0.42, 0.16], cream: [0.93, 0.88, 0.78],
  black: [0.03, 0.03, 0.03], dark: [0.2, 0.08, 0.03], pink: [0.55, 0.32, 0.3],
};

export function skeleton() {
  return {
    body: { pivot: [0, 0.09, 0] },
    head: { parent: "body", pivot: [0, 0.13, -0.1] },
    tail: { parent: "body", pivot: [0, 0.09, 0.1] },
    legFL: { parent: "body", pivot: [-0.028, 0.09, -0.07] },
    legFR: { parent: "body", pivot: [0.028, 0.09, -0.07] },
    legBL: { parent: "body", pivot: [-0.04, 0.1, 0.05] },
    legBR: { parent: "body", pivot: [0.04, 0.1, 0.05] },
  };
}

const SIDES = [0, 12, 9, 7, 6, 5], SUB = [0, 3, 2, 1, 1, 1];

export function geometry(ctx) {
  const lod = ctx.lod ?? 1, n = SIDES[lod] ?? 8, k = SUB[lod] ?? 1, fine = lod <= 2;
  const m = mesher(ctx, { vertexColors: true });
  const nz = (p, f) => { const v = ctx.noise3d(p[0] * f, p[1] * f, p[2] * f); return v < -1 ? -1 : v > 1 ? 1 : v; };
  const fur = (c, p) => hex(c, 1 + (fine ? 0.12 * nz(p, 70) : 0));
  const S = (z, y, rx, ry) => ({ p: [0, y, z], rx, ry });
  ctx.smooth();
  ctx.roughness(0.95);

  const coat = (p, d) => {
    let c = mix(C.cream, C.ginger, ss(-0.55, -0.1, d[1]));
    c = mix(c, C.russet, ss(-0.05, 0.4, d[1]));
    return mix(c, C.deep, 0.5 * ss(0.6, 1, d[1]));
  };
  // BODY: a hunched pear, chest narrow, haunch round
  ctx.bone("body");
  m.tube([
    S(-0.115, 0.125, 0.02, 0.022), S(-0.095, 0.115, 0.036, 0.042), S(-0.05, 0.1, 0.044, 0.05), S(0.0, 0.095, 0.05, 0.054),
    S(0.05, 0.095, 0.056, 0.06), S(0.09, 0.09, 0.048, 0.05), S(0.115, 0.09, 0.02, 0.02),
  ], { sides: n, k, capStart: 0.012, capEnd: 0.012, bump: fine ? (p) => 1 + 0.05 * nz(p, 45) : null, colorOf: (p, d) => fur(coat(p, d), p) });

  // LEGS: slim forelegs with little hands, big hind haunches folding to long feet
  const legC = (p, d) => fur(p[1] < 0.02 ? C.deep : mix(C.ginger, C.russet, ss(0.03, 0.08, p[1])), p);
  for (const [bone, x] of [["legFL", -0.028], ["legFR", 0.028]]) {
    ctx.bone(bone);
    m.tube([{ p: [x, 0.1, -0.07], rx: 0.016 }, { p: [x, 0.05, -0.08], rx: 0.011 }, { p: [x, 0.012, -0.088], rx: 0.009 }, { p: [x, 0.006, -0.1], rx: 0.009, ry: 0.006 }],
      { sides: Math.max(n - 4, 5), ref: [0, 0, -1], capStart: 0.006, capEnd: 0.006, colorOf: legC });
  }
  for (const [bone, x] of [["legBL", -0.04], ["legBR", 0.04]]) {
    ctx.bone(bone);
    m.tube([{ p: [x, 0.105, 0.05], rx: 0.026, ry: 0.034 }, { p: [x, 0.06, 0.06], rx: 0.03, ry: 0.034 }, { p: [x, 0.025, 0.04], rx: 0.014 },
      { p: [x, 0.008, 0.02], rx: 0.011, ry: 0.007 }, { p: [x, 0.006, -0.025], rx: 0.01, ry: 0.006 }],
      { sides: Math.max(n - 3, 5), ref: [0, 0, -1], capStart: 0.008, capEnd: 0.006, colorOf: legC });
  }

  // HEAD: round skull, short blunt muzzle, dark nose, pale cheeks
  ctx.bone("head");
  m.tube([S(-0.09, 0.135, 0.022, 0.024), S(-0.11, 0.145, 0.034, 0.034), S(-0.14, 0.145, 0.034, 0.031), S(-0.165, 0.138, 0.025, 0.023), S(-0.185, 0.13, 0.014, 0.013)], {
    sides: n, k, capStart: 0.008, capEnd: 0.006,
    colorOf: (p, d) => fur(mix(mix(C.cream, C.ginger, ss(-0.35, 0.1, d[1])), C.russet, ss(0.3, 0.8, d[1])), p),
    capColEnd: hex(C.black),
  });
  // ears with long dark tufts
  if (lod <= 4) for (const sx of [-1, 1]) {
    m.tube([{ p: [sx * 0.018, 0.168, -0.12], rx: 0.011, ry: 0.006 }, { p: [sx * 0.024, 0.195, -0.117], rx: 0.009, ry: 0.005 }, { p: [sx * 0.026, 0.205, -0.116], rx: 0.004, ry: 0.003 }],
      { sides: 5, ref: [0, 0, -1], capStart: 0.002, capEnd: 0.002, colorOf: (p, d) => hex(d[2] < -0.3 ? C.pink : C.russet) });
    if (lod <= 3) m.tube([{ p: [sx * 0.025, 0.198, -0.116], rx: 0.006 }, { p: [sx * 0.029, 0.222, -0.113], rx: 0.005 }, { p: [sx * 0.031, 0.238, -0.11], rx: 0.0015 }],
      { sides: 5, capStart: 0.002, capEnd: 0.002, colorOf: (p) => fur(C.dark, p) });
  }
  // eyes: big black beads with a pale ring
  if (lod <= 3) for (const sx of [-1, 1]) {
    const nrm = [sx * 0.85, 0.3, -0.4], p = [sx * 0.03, 0.152, -0.14];
    m.tube([{ p: [p[0] - nrm[0] * 0.004, p[1] - nrm[1] * 0.004, p[2] - nrm[2] * 0.004], rx: 0.0085 }, { p: [p[0] + nrm[0] * 0.002, p[1] + nrm[1] * 0.002, p[2] + nrm[2] * 0.002], rx: 0.0085 }],
      { sides: 8, capStart: 0, capEnd: 0.004, colorOf: () => hex(C.cream), capColEnd: hex(C.black) });
  }

  // TAIL: as long as the body, thick and shaggy, an S curling up over the back
  ctx.bone("tail");
  m.tube([
    { p: [0, 0.095, 0.1], rx: 0.016 }, { p: [0, 0.12, 0.15], rx: 0.04 }, { p: [0, 0.18, 0.19], rx: 0.058 }, { p: [0, 0.26, 0.19], rx: 0.066 },
    { p: [0, 0.33, 0.15], rx: 0.06 }, { p: [0, 0.365, 0.1], rx: 0.048 }, { p: [0, 0.37, 0.06], rx: 0.03 }, { p: [0, 0.36, 0.035], rx: 0.012 },
  ], {
    sides: n, k, ref: [1, 0, 0], capStart: 0.006, capEnd: 0.012,
    bump: fine ? (p) => 1 + 0.22 * nz(p, 55) + 0.1 * nz(p, 130) : null,
    colorOf: (p) => fur(mix(C.deep, C.ginger, 0.35 + 0.5 * (0.5 + 0.5 * nz(p, 30))), p),
  });
  return m.done();
}

export function collider() {
  return { kind: "box", width: 0.14, height: 0.4, depth: 0.4, center: [0, 0.2, 0] };
}
