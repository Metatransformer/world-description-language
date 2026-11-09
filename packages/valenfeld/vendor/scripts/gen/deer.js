// A red deer, roe-sized: ~1.3 m nose to rump, 0.9 m at the shoulder, feet at the origin, facing -Z.
// Rigged: skeleton() bones body (root), neck, head, tail, legFL/legFR/legBL/legBR, each part a smooth loft bound whole.
// params.stag = true grows small forked antlers. Animation contract (degrees): neck.pitch -70 + head.pitch -30 grazes,
// legs.pitch ±40 bound (front pair together, hind pair together), tail.pitch -50 flags the white rump.
import { mesher, smooth as ss, mix, hex } from "../lib/mesh.js";

const C = {
  back: [0.42, 0.25, 0.13], red: [0.56, 0.34, 0.18], tan: [0.66, 0.47, 0.3], dark: [0.2, 0.13, 0.08],
  cream: [0.9, 0.85, 0.74], black: [0.05, 0.04, 0.04], hoof: [0.12, 0.1, 0.08], antler: [0.56, 0.47, 0.35], tip: [0.86, 0.8, 0.68], pink: [0.5, 0.3, 0.28],
};
const FX = 0.075, BX = 0.08;

export function skeleton() {
  return {
    body: { pivot: [0, 0.72, 0] },
    neck: { parent: "body", pivot: [0, 0.8, -0.42] },
    head: { parent: "neck", pivot: [0, 1.12, -0.58] },
    tail: { parent: "body", pivot: [0, 0.8, 0.46] },
    legFL: { parent: "body", pivot: [-FX, 0.72, -0.32] },
    legFR: { parent: "body", pivot: [FX, 0.72, -0.32] },
    legBL: { parent: "body", pivot: [-BX, 0.74, 0.3] },
    legBR: { parent: "body", pivot: [BX, 0.74, 0.3] },
  };
}

const SIDES = [0, 14, 10, 8, 6, 5], SUB = [0, 3, 2, 1, 1, 1];

export function geometry(ctx) {
  const lod = ctx.lod ?? 1, n = SIDES[lod] ?? 8, k = SUB[lod] ?? 1, fine = lod <= 2;
  const stag = !!ctx.params?.stag;
  const m = mesher(ctx, { vertexColors: true });
  const nz = (p, f) => { const v = ctx.noise3d(p[0] * f, p[1] * f, p[2] * f); return v < -1 ? -1 : v > 1 ? 1 : v; };
  const fur = (c, p) => hex(c, 1 + (fine ? 0.09 * nz(p, 19) : 0));
  const S = (z, y, rx, ry) => ({ p: [0, y, z], rx, ry });
  ctx.smooth();
  ctx.roughness(0.92);

  // coat: dark saddle, warm red flanks, cream belly, cream rump patch around the tail
  const bodyC = (p, d) => {
    const up = d[1];
    let c = mix(C.cream, C.tan, ss(-0.75, -0.35, up));
    c = mix(c, C.red, ss(-0.35, 0.2, up));
    c = mix(c, C.back, ss(0.45, 0.95, up));
    const rump = ss(0.3, 0.44, p[2]) * ss(0.75, 0.35, Math.abs(d[0])) * ss(-0.6, -0.1, up);
    return mix(c, C.cream, Math.max(rump, ss(0.42, 0.5, p[2]) * ss(0.9, 0.5, Math.abs(d[0]))));
  };
  ctx.bone("body");
  m.tube([
    S(-0.53, 0.75, 0.05, 0.07), S(-0.48, 0.74, 0.11, 0.15), S(-0.39, 0.725, 0.135, 0.18), S(-0.26, 0.72, 0.138, 0.175),
    S(-0.1, 0.725, 0.13, 0.16), S(0.06, 0.735, 0.128, 0.15), S(0.2, 0.75, 0.14, 0.16), S(0.33, 0.76, 0.138, 0.158),
    S(0.43, 0.765, 0.105, 0.12), S(0.49, 0.77, 0.045, 0.055),
  ], {
    sides: n, k, capStart: 0.03, capEnd: 0.03,
    bump: fine ? (p, d) => 1 + 0.025 * nz(p, 8) + 0.04 * ss(-0.2, -0.8, d[1]) * ss(-0.05, -0.35, p[2]) : null,
    colorOf: (p, d) => fur(bodyC(p, d), p),
  });

  // LEGS: muscled tops tucked into the body, long thin cannons, black cloven hooves
  const legCol = (x) => (p, d) => {
    let c = mix(C.tan, C.red, ss(0.3, 0.55, p[1]));
    c = mix(c, C.cream, 0.5 * ss(0.1, 0.9, -d[0] * Math.sign(x)) * ss(0.65, 0.4, p[1]));
    c = mix(c, bodyC(p, d), ss(0.55, 0.7, p[1]));
    if (p[1] < 0.065) c = C.hoof;
    return fur(c, p);
  };
  for (const [bone, x] of [["legFL", -FX], ["legFR", FX]]) {
    ctx.bone(bone);
    m.tube([
      { p: [x, 0.8, -0.32], rx: 0.055, ry: 0.1 }, { p: [x, 0.6, -0.31], rx: 0.048, ry: 0.07 }, { p: [x, 0.46, -0.305], rx: 0.028, ry: 0.036 },
      { p: [x, 0.4, -0.305], rx: 0.026, ry: 0.032 }, { p: [x, 0.2, -0.31], rx: 0.017, ry: 0.02 }, { p: [x, 0.08, -0.315], rx: 0.016, ry: 0.019 },
      { p: [x, 0.05, -0.322], rx: 0.02, ry: 0.024 }, { p: [x, 0.004, -0.335], rx: 0.019, ry: 0.026 },
    ], { sides: n, k, ref: [0, 0, -1], capStart: 0.02, capEnd: 0.004, colorOf: legCol(x), capColEnd: hex(C.hoof) });
  }
  for (const [bone, x] of [["legBL", -BX], ["legBR", BX]]) {
    ctx.bone(bone);
    m.tube([
      { p: [x, 0.8, 0.3], rx: 0.065, ry: 0.11 }, { p: [x, 0.6, 0.27], rx: 0.062, ry: 0.105 }, { p: [x, 0.45, 0.3], rx: 0.034, ry: 0.045 },
      { p: [x, 0.36, 0.36], rx: 0.025, ry: 0.03 }, { p: [x, 0.2, 0.34], rx: 0.017, ry: 0.02 }, { p: [x, 0.08, 0.32], rx: 0.016, ry: 0.019 },
      { p: [x, 0.05, 0.318], rx: 0.02, ry: 0.024 }, { p: [x, 0.004, 0.31], rx: 0.019, ry: 0.026 },
    ], { sides: n, k, ref: [0, 0, -1], capStart: 0.02, capEnd: 0.004, colorOf: legCol(x), capColEnd: hex(C.hoof) });
  }

  // NECK: long and upright, pale throat
  ctx.bone("neck");
  m.tube([S(-0.38, 0.76, 0.085, 0.12), S(-0.46, 0.86, 0.075, 0.095), S(-0.52, 0.97, 0.06, 0.07), S(-0.56, 1.07, 0.052, 0.058), S(-0.58, 1.14, 0.048, 0.05)], {
    sides: n, k, capStart: 0.02, capEnd: 0.02,
    colorOf: (p, d) => fur(mix(mix(C.cream, C.red, ss(-0.2, 0.25, -d[2] * -1 + d[1] * 0.4 + 0.1)), C.back, ss(0.5, 0.95, d[2] * 0.6 + d[1] * 0.6)), p),
  });

  // HEAD: rounded brow tapering to a fine muzzle, dark nose, pale chin and eye-ring
  ctx.bone("head");
  const headCol = (p, d) => {
    const up = d[1];
    let c = mix(C.cream, C.tan, ss(-0.6, -0.15, up));
    c = mix(c, C.red, ss(-0.1, 0.5, up));
    c = mix(c, C.dark, 0.35 * ss(0.6, 1, up) * ss(-0.62, -0.7, p[2]));
    c = mix(c, C.cream, 0.7 * ss(-0.75, -0.8, p[2]) * ss(-0.1, -0.5, up));
    c = mix(c, C.black, ss(-0.795, -0.81, p[2]) * ss(-0.4, 0.1, up));
    return fur(c, p);
  };
  m.tube([
    S(-0.55, 1.16, 0.04, 0.045), S(-0.58, 1.175, 0.06, 0.066), S(-0.63, 1.17, 0.062, 0.064), S(-0.68, 1.15, 0.05, 0.055),
    S(-0.73, 1.125, 0.038, 0.045), S(-0.78, 1.105, 0.03, 0.036), S(-0.81, 1.095, 0.024, 0.028),
  ], { sides: n, k, capStart: 0.02, capEnd: 0.012, colorOf: headCol, capColEnd: hex(C.black) });
  // ears: big, cupped, dark rims, pale inside
  if (lod <= 4) for (const sx of [-1, 1]) {
    m.tube([
      { p: [sx * 0.04, 1.2, -0.585], rx: 0.022, ry: 0.012 }, { p: [sx * 0.085, 1.25, -0.58], rx: 0.04, ry: 0.016 },
      { p: [sx * 0.125, 1.29, -0.575], rx: 0.032, ry: 0.012 }, { p: [sx * 0.15, 1.31, -0.572], rx: 0.012, ry: 0.006 },
    ], {
      sides: Math.max(n - 4, 5), ref: [0, 0, -1], capStart: 0.004, capEnd: 0.01,
      colorOf: (p, d) => hex(d[2] < -0.35 ? mix(C.cream, C.pink, 0.25) : mix(C.red, C.dark, ss(0.11, 0.15, Math.abs(p[0])))),
      capColEnd: hex(C.dark),
    });
  }
  // eyes: large, dark, glossy
  if (lod <= 3) for (const sx of [-1, 1]) {
    const nrm = [sx * 0.8, 0.25, -0.55], p = [sx * 0.052, 1.18, -0.645];
    m.tube([{ p: [p[0] - nrm[0] * 0.008, p[1] - nrm[1] * 0.008, p[2] - nrm[2] * 0.008], rx: 0.014, ry: 0.011 },
      { p: [p[0] + nrm[0] * 0.003, p[1] + nrm[1] * 0.003, p[2] + nrm[2] * 0.003], rx: 0.014, ry: 0.011 }],
      { sides: 8, capStart: 0, capEnd: 0.005, colorOf: () => hex(C.black), capColEnd: hex([0.02, 0.02, 0.02]) });
  }
  // antlers (stag): a short beam, a brow tine forward, a forked top, pale points
  if (stag && lod <= 4) for (const sx of [-1, 1]) {
    const ant = (t) => hex(mix(C.antler, C.tip, ss(0.6, 1, t)));
    const beam = [[sx * 0.035, 1.2, -0.6], [sx * 0.05, 1.27, -0.595], [sx * 0.065, 1.35, -0.6], [sx * 0.075, 1.42, -0.61]];
    m.tube(beam.map((p, i) => ({ p, rx: 0.014 - i * 0.002 })), { sides: Math.max(n - 6, 5), capStart: 0.003, capEnd: 0.01, colorOf: (p, d, t) => ant(t * 0.7), capColEnd: ant(1) });
    m.tube([{ p: [sx * 0.055, 1.3, -0.598], rx: 0.009 }, { p: [sx * 0.06, 1.34, -0.645], rx: 0.007 }, { p: [sx * 0.062, 1.36, -0.68], rx: 0.004 }],
      { sides: 5, capStart: 0, capEnd: 0.008, colorOf: (p, d, t) => ant(0.5 + t * 0.5), capColEnd: ant(1) });
    m.tube([{ p: [sx * 0.075, 1.42, -0.61], rx: 0.008 }, { p: [sx * 0.08, 1.47, -0.64], rx: 0.005 }],
      { sides: 5, capStart: 0, capEnd: 0.008, colorOf: () => ant(0.9), capColEnd: ant(1) });
    m.tube([{ p: [sx * 0.075, 1.42, -0.61], rx: 0.008 }, { p: [sx * 0.09, 1.46, -0.575], rx: 0.005 }],
      { sides: 5, capStart: 0, capEnd: 0.008, colorOf: () => ant(0.9), capColEnd: ant(1) });
  }

  // TAIL: a short cream-edged flag
  ctx.bone("tail");
  m.tube([S(0.45, 0.8, 0.035, 0.028), S(0.5, 0.775, 0.04, 0.026), S(0.535, 0.735, 0.032, 0.02), S(0.55, 0.7, 0.015, 0.012)], {
    sides: Math.max(n - 4, 5), k, capStart: 0.005, capEnd: 0.01,
    colorOf: (p, d) => fur(d[1] > 0.3 && d[2] < 0.6 ? C.red : C.cream, p), capColEnd: hex(C.cream),
  });
  return m.done();
}

export function collider() {
  return { kind: "box", width: 0.35, height: 1.1, depth: 1.2, center: [0, 0.55, -0.05] };
}
