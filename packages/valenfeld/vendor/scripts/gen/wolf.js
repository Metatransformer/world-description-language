// A grey timber wolf: ~1.65 m nose to tail tip, 0.85 m at the withers, feet at the origin, facing -Z.
// Rigged: skeleton() bones body (root), neck, head, jaw, tail, legFL/legFR/legBL/legBR. Each part is its own
// smooth loft bound whole to its bone, its root tucked inside its parent so a pose never opens a seam.
// Animation contract: self.bones.<leg>.pitch ±30 trot, bones.jaw.pitch -25 bite, bones.head.pitch, bones.tail.yaw (degrees).
import { mesher, smooth as ss, mix, hex } from "../lib/mesh.js";

const C = {
  dark: [0.22, 0.2, 0.18], back: [0.34, 0.31, 0.28], grey: [0.55, 0.53, 0.5], tan: [0.6, 0.5, 0.38],
  cream: [0.87, 0.83, 0.75], black: [0.06, 0.05, 0.05], pink: [0.45, 0.22, 0.22], amber: [0.8, 0.55, 0.16],
};
const FX = 0.09, BX = 0.085; // leg x offsets (front, back)

export function skeleton() {
  return {
    body: { pivot: [0, 0.66, 0] },
    neck: { parent: "body", pivot: [0, 0.7, -0.4] },
    head: { parent: "neck", pivot: [0, 0.84, -0.55] },
    jaw: { parent: "head", pivot: [0, 0.81, -0.62] },
    tail: { parent: "body", pivot: [0, 0.68, 0.42] },
    legFL: { parent: "body", pivot: [-FX, 0.68, -0.3] },
    legFR: { parent: "body", pivot: [FX, 0.68, -0.3] },
    legBL: { parent: "body", pivot: [-BX, 0.68, 0.3] },
    legBR: { parent: "body", pivot: [BX, 0.68, 0.3] },
  };
}

const SIDES = [0, 14, 10, 8, 6, 5], SUB = [0, 3, 2, 1, 1, 1];

export function geometry(ctx) {
  const lod = ctx.lod ?? 1, n = SIDES[lod] ?? 8, k = SUB[lod] ?? 1, fine = lod <= 2;
  const m = mesher(ctx, { vertexColors: true });
  const nz = (p, f) => { const v = ctx.noise3d(p[0] * f, p[1] * f, p[2] * f); return v < -1 ? -1 : v > 1 ? 1 : v; };
  const fur = (c, p) => hex(c, 1 + (fine ? 0.13 * nz(p, 17) : 0));
  const shag = (amt, f) => (fine ? (p) => 1 + amt * nz(p, f) : null);
  const S = (z, y, rx, ry) => ({ p: [0, y, z], rx, ry });
  ctx.smooth();
  ctx.roughness(0.95);

  const bodyC = (p, d) => {
    const up = d[1];
    let c = mix(C.cream, C.grey, ss(-0.8, -0.15, up));
    c = mix(c, C.tan, 0.45 * Math.exp(-up * up * 5));
    c = mix(c, C.back, ss(0.3, 0.85, up));
    return mix(c, C.dark, 0.6 * ss(0.8, 1, up) * ss(0.25, -0.3, p[2]));
  };
  // BODY: chest deep, waist tucked, haunch round
  ctx.bone("body");
  m.tube([
    S(-0.53, 0.67, 0.06, 0.08), S(-0.47, 0.655, 0.13, 0.17), S(-0.38, 0.64, 0.17, 0.215), S(-0.26, 0.645, 0.172, 0.21),
    S(-0.12, 0.66, 0.158, 0.18), S(0.02, 0.675, 0.132, 0.14), S(0.16, 0.675, 0.138, 0.135), S(0.3, 0.665, 0.152, 0.155),
    S(0.42, 0.665, 0.12, 0.13), S(0.5, 0.67, 0.05, 0.06),
  ], {
    sides: n, k, capStart: 0.03, capEnd: 0.03,
    bump: fine ? (p, d) => 1 + 0.05 * nz(p, 9) + 0.06 * ss(0.55, 0.95, d[1]) * (0.5 + 0.5 * nz(p, 23)) + 0.08 * ss(-0.3, -0.9, d[1]) * ss(-0.1, -0.35, p[2]) * (0.5 + 0.5 * nz(p, 19)) : null,
    colorOf: (p, d) => fur(bodyC(p, d), p),
  });

  // LEGS: shoulder/thigh tucked into the body, slim cannon, a paw with black pads
  const legCol = (x) => (p, d) => {
    let c = mix(C.tan, C.grey, ss(0.25, 0.6, p[1]));
    c = mix(c, C.cream, 0.45 * ss(0.1, 0.9, -d[0] * Math.sign(x)));
    c = mix(c, C.cream, 0.35 * ss(0.2, 0.8, -d[2]) * ss(0.45, 0.15, p[1]));
    c = mix(c, bodyC(p, d), ss(0.5, 0.64, p[1]));
    return fur(c, p);
  };
  const pawCol = (p, d) => (d[1] < -0.55 ? hex(C.black) : fur(mix(C.tan, C.cream, 0.35), p));
  const paw = (x, z0) => {
    if (lod >= 5) return;
    m.tube([{ p: [x, 0.036, z0], rx: 0.03, ry: 0.032 }, { p: [x, 0.036, z0 - 0.04], rx: 0.042, ry: 0.036 }, { p: [x, 0.03, z0 - 0.08], rx: 0.038, ry: 0.028 }],
      { sides: n, k, capStart: 0.015, capEnd: 0.025, colorOf: pawCol });
  };
  for (const [bone, x] of [["legFL", -FX], ["legFR", FX]]) {
    ctx.bone(bone);
    m.tube([
      { p: [x, 0.73, -0.3], rx: 0.06, ry: 0.1 }, { p: [x, 0.55, -0.29], rx: 0.052, ry: 0.07 }, { p: [x, 0.4, -0.285], rx: 0.038, ry: 0.046 },
      { p: [x, 0.22, -0.3], rx: 0.029, ry: 0.032 }, { p: [x, 0.09, -0.305], rx: 0.026, ry: 0.03 }, { p: [x, 0.045, -0.315], rx: 0.028, ry: 0.031 },
    ], { sides: n, k, ref: [0, 0, -1], capStart: 0.02, capEnd: 0, bump: shag(0.06, 21), colorOf: legCol(x) });
    paw(x, -0.29);
  }
  for (const [bone, x] of [["legBL", -BX], ["legBR", BX]]) {
    ctx.bone(bone);
    m.tube([
      { p: [x, 0.7, 0.3], rx: 0.06, ry: 0.09 }, { p: [x, 0.56, 0.26], rx: 0.062, ry: 0.095 }, { p: [x, 0.42, 0.25], rx: 0.042, ry: 0.052 },
      { p: [x, 0.3, 0.32], rx: 0.032, ry: 0.036 }, { p: [x, 0.18, 0.37], rx: 0.029, ry: 0.033 }, { p: [x, 0.08, 0.35], rx: 0.026, ry: 0.028 },
      { p: [x, 0.045, 0.335], rx: 0.028, ry: 0.031 },
    ], { sides: n, k, ref: [0, 0, -1], capStart: 0.02, capEnd: 0, bump: shag(0.06, 21), colorOf: legCol(x) });
    paw(x, 0.35);
  }

  // NECK: a thick ruff
  ctx.bone("neck");
  m.tube([S(-0.36, 0.66, 0.12, 0.15), S(-0.45, 0.73, 0.115, 0.135), S(-0.52, 0.8, 0.088, 0.098), S(-0.565, 0.85, 0.07, 0.075)], {
    sides: n, k, capStart: 0.02, capEnd: 0.02, bump: shag(0.14, 13),
    colorOf: (p, d) => fur(mix(mix(C.cream, C.grey, ss(-0.6, 0.1, d[1])), C.back, ss(0.4, 0.9, d[1])), p),
  });

  // HEAD: broad skull, stop, long muzzle, black nose
  ctx.bone("head");
  const headCol = (p, d) => {
    const up = d[1], side = Math.abs(d[0]);
    let c = mix(C.cream, C.grey, ss(-0.35, 0.35, up));
    c = mix(c, C.back, ss(0.5, 0.95, up));
    if (p[2] < -0.68) c = mix(c, C.tan, 0.5 * ss(0.2, 0.8, up));
    c = mix(c, C.cream, 0.65 * Math.exp(-(((p[2] + 0.66) / 0.05) ** 2)) * ss(0.4, 0.85, side) * ss(0.45, -0.1, up));
    c = mix(c, C.dark, 0.85 * ss(-0.15, -0.45, up) * ss(-0.66, -0.72, p[2]) * ss(0.2, 0.5, side));
    c = mix(c, C.black, ss(-0.84, -0.86, p[2]));
    return fur(c, p);
  };
  m.tube([
    S(-0.5, 0.88, 0.05, 0.05), S(-0.54, 0.888, 0.085, 0.078), S(-0.6, 0.888, 0.1, 0.082), S(-0.66, 0.876, 0.08, 0.068),
    S(-0.71, 0.86, 0.055, 0.054), S(-0.77, 0.85, 0.042, 0.042), S(-0.83, 0.849, 0.035, 0.036), S(-0.865, 0.851, 0.027, 0.027),
  ], { sides: n, k, capStart: 0.02, capEnd: 0.012, bump: fine ? (p, d) => 1 + 0.07 * nz(p, 15) * ss(-0.68, -0.58, p[2]) : null, colorOf: headCol });
  // ears: pointed, dark backs, pale insides
  if (lod <= 4) for (const sx of [-1, 1]) {
    m.tube([{ p: [sx * 0.055, 0.925, -0.56], rx: 0.036, ry: 0.016 }, { p: [sx * 0.066, 0.995, -0.553], rx: 0.024, ry: 0.011 }], {
      sides: Math.max(n - 4, 5), ref: [0, 0, -1], capStart: 0.005, capEnd: 0.04,
      colorOf: (p, d) => hex(d[2] < -0.3 ? mix(C.cream, C.pink, 0.3) : C.dark),
      capColEnd: hex(C.black),
    });
  }
  // eyes: amber with a dark pupil
  if (lod <= 3) for (const sx of [-1, 1]) {
    const nrm = [sx * 0.62, 0.33, -0.71], p = [sx * 0.057, 0.905, -0.675];
    m.tube([{ p: [p[0] - nrm[0] * 0.008, p[1] - nrm[1] * 0.008, p[2] - nrm[2] * 0.008], rx: 0.013, ry: 0.009 },
      { p: [p[0] + nrm[0] * 0.002, p[1] + nrm[1] * 0.002, p[2] + nrm[2] * 0.002], rx: 0.013, ry: 0.009 }],
      { sides: 8, capStart: 0, capEnd: 0.004, colorOf: () => hex(C.amber), capColEnd: hex(C.black) });
  }
  // upper canines
  if (fine) for (const sx of [-1, 1]) {
    m.tube([{ p: [sx * 0.022, 0.83, -0.815], rx: 0.006 }, { p: [sx * 0.022, 0.812, -0.815], rx: 0.005 }],
      { sides: 5, ref: [0, 0, -1], capStart: 0, capEnd: 0.016, colorOf: () => "#e8e2d0" });
  }

  // JAW
  ctx.bone("jaw");
  m.tube([S(-0.62, 0.812, 0.045, 0.03), S(-0.7, 0.806, 0.04, 0.025), S(-0.78, 0.808, 0.032, 0.02), S(-0.845, 0.811, 0.022, 0.014)], {
    sides: n, k, capStart: 0.01, capEnd: 0.01,
    colorOf: (p, d) => hex(d[1] > 0.45 ? C.pink : mix(C.cream, C.dark, 0.8 * ss(-0.2, 0.3, d[1]) * ss(0.3, 0.6, Math.abs(d[0])))),
  });
  if (fine) for (const sx of [-1, 1]) {
    m.tube([{ p: [sx * 0.02, 0.81, -0.8], rx: 0.005 }, { p: [sx * 0.02, 0.822, -0.8], rx: 0.004 }],
      { sides: 5, ref: [0, 0, -1], capStart: 0, capEnd: 0.012, colorOf: () => "#e8e2d0" });
  }

  // TAIL: bushy, black-tipped
  ctx.bone("tail");
  m.tube([S(0.4, 0.675, 0.04, 0.04), S(0.52, 0.64, 0.065, 0.07), S(0.63, 0.56, 0.08, 0.085), S(0.71, 0.46, 0.075, 0.075), S(0.76, 0.37, 0.055, 0.055), S(0.78, 0.31, 0.03, 0.03)], {
    sides: n, k, capStart: 0.01, capEnd: 0.03, bump: shag(0.16, 16),
    colorOf: (p, d, t) => {
      let c = mix(mix(C.cream, C.grey, ss(-0.8, -0.1, -d[2] * 0.3 + d[1] * 0.7 + 0.1)), C.back, ss(0.3, 0.9, d[1]));
      c = mix(c, C.black, ss(0.72, 0.92, t));
      return fur(c, p);
    },
    capColEnd: hex(C.black),
  });
  return m.done();
}

export function collider() {
  return { kind: "box", width: 0.5, height: 0.8, depth: 1.4, center: [0, 0.4, -0.03] };
}
