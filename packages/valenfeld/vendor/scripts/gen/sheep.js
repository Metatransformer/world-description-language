// A hill ewe, ~1.1 m nose to rump, 0.75 m at the back, feet at the origin, facing -Z.
// Lumpy cream fleece, black face and legs (Swaledale-ish). params.graze = true drops the head to the grass.
// params.tint = [r,g,b] fleece multiplier (a dirty or grey ewe in the flock).
import { mesher, smooth as ss, mix, hex } from "../lib/mesh.js";

const C = { wool: [0.86, 0.82, 0.72], shade: [0.62, 0.58, 0.5], face: [0.08, 0.07, 0.06], muzzle: [0.82, 0.8, 0.76], leg: [0.1, 0.09, 0.08], hoof: [0.05, 0.04, 0.04] };
const SIDES = [0, 14, 10, 8, 6, 5];

export function geometry(ctx) {
  const lod = ctx.lod ?? 1, n = SIDES[lod] ?? 8, fine = lod <= 2;
  const graze = !!ctx.params?.graze, tint = ctx.params?.tint ?? [1, 1, 1];
  const m = mesher(ctx, { vertexColors: true });
  const nz = (p, f) => Math.max(-1, Math.min(1, ctx.noise3d(p[0] * f, p[1] * f, p[2] * f)));
  const W = (c) => [c[0] * tint[0], c[1] * tint[1], c[2] * tint[2]];
  const S = (z, y, rx, ry) => ({ p: [0, y, z], rx, ry });
  ctx.smooth();
  ctx.roughness(0.97);

  // FLEECE: a fat barrel, lumpy, shaded darker underneath
  m.tube([
    S(-0.42, 0.58, 0.08, 0.08), S(-0.36, 0.58, 0.19, 0.18), S(-0.25, 0.58, 0.25, 0.23), S(-0.08, 0.57, 0.27, 0.25),
    S(0.1, 0.57, 0.27, 0.25), S(0.26, 0.58, 0.24, 0.22), S(0.36, 0.58, 0.17, 0.16), S(0.42, 0.57, 0.06, 0.06),
  ], {
    sides: n, k: fine ? 2 : 1, capStart: 0.04, capEnd: 0.04,
    bump: fine ? (p) => 1 + 0.07 * nz(p, 11) + 0.03 * nz(p, 27) : null,
    colorOf: (p, d) => hex(W(mix(C.shade, C.wool, ss(-0.7, 0.1, d[1]))), 1 + (fine ? 0.08 * nz(p, 15) : 0)),
  });

  // LEGS: thin black legs under the fleece
  for (const [x, z] of [[-0.11, -0.25], [0.11, -0.25], [-0.11, 0.24], [0.11, 0.24]]) {
    m.tube([{ p: [x, 0.42, z], rx: 0.04 }, { p: [x, 0.2, z], rx: 0.03 }, { p: [x, 0.05, z], rx: 0.026 }, { p: [x, 0.003, z - 0.01], rx: 0.03 }],
      { sides: Math.max(n - 4, 5), ref: [0, 0, -1], capStart: 0.01, capEnd: 0.004, colorOf: (p) => hex(p[1] < 0.05 ? C.hoof : C.leg), capColEnd: hex(C.hoof) });
  }

  // HEAD: black face on a woolly neck, pale muzzle; grazing drops it to the turf
  const hy = graze ? 0.22 : 0.78, hz = graze ? -0.58 : -0.56;
  m.tube([S(-0.34, 0.62, 0.12, 0.13), S((-0.34 + hz) / 2, (0.62 + hy) / 2 + 0.03, 0.09, 0.1), S(hz + 0.06, hy + 0.04, 0.075, 0.08)],
    { sides: n, capStart: 0.02, capEnd: 0.02, colorOf: (p, d) => hex(W(mix(C.shade, C.wool, ss(-0.5, 0.3, d[1])))) });
  const dz = graze ? -0.05 : -0.08, dy = graze ? -0.07 : -0.02;
  m.tube([
    { p: [0, hy + 0.04, hz + 0.05], rx: 0.065, ry: 0.075 }, { p: [0, hy + 0.02, hz], rx: 0.07, ry: 0.075 },
    { p: [0, hy + dy * 0.5, hz + dz * 0.6], rx: 0.055, ry: 0.06 }, { p: [0, hy + dy, hz + dz * 1.4], rx: 0.04, ry: 0.045 },
  ], { sides: n, capStart: 0.01, capEnd: 0.02, colorOf: (p, d, t) => hex(mix(C.face, C.muzzle, ss(0.75, 1, t) * 0.6)), capColEnd: hex(C.face) });
  // ears: flat, sticking out sideways
  if (lod <= 4) for (const sx of [-1, 1]) {
    m.tube([{ p: [sx * 0.05, hy + 0.05, hz + 0.03], rx: 0.02, ry: 0.012 }, { p: [sx * 0.13, hy + 0.04, hz + 0.04], rx: 0.03, ry: 0.012 }, { p: [sx * 0.17, hy + 0.03, hz + 0.045], rx: 0.01, ry: 0.005 }],
      { sides: 5, ref: [0, 0, -1], capStart: 0.003, capEnd: 0.005, colorOf: () => hex(C.face), capColEnd: hex(C.face) });
  }
  // tail: a short woolly stub
  m.tube([S(0.4, 0.55, 0.05, 0.05), S(0.46, 0.45, 0.04, 0.04), S(0.47, 0.36, 0.025, 0.025)], { sides: Math.max(n - 4, 5), capStart: 0.01, capEnd: 0.01, colorOf: () => hex(W(C.shade)) });
  return m.done();
}

export function collider() {
  return { kind: "box", width: 0.55, height: 0.8, depth: 1.0, center: [0, 0.4, 0] };
}
