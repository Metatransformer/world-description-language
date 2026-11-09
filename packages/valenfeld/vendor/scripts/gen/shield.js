// A round oak shield, 0.6 m across: front faces -Z, origin at the handle grip behind it. A shallow-domed plank board under
// worn rust-red paint, an iron boss, an iron rim and rivets; two battens and a leather-wrapped grip on the back.
// Built about +Y and turned so +Y becomes -Z (mesher transform). Levels: 1 rivets and wear … 5 a hull.
import { mesher, mix, hex } from "../lib/mesh.js";

const PAINT = [0.66, 0.27, 0.18], WOOD = [0.62, 0.48, 0.34], BACKW = [0.55, 0.42, 0.3], IRON = [0.3, 0.3, 0.31], RUST = [0.42, 0.24, 0.13], LEATHER = [0.3, 0.19, 0.11];
const SIDES = [0, 40, 28, 18, 12, 8];
const R = 0.3, BACK = 0.045, FRONT = 0.065, DOME = 0.02;

export function geometry(ctx) {
  const lod = ctx.lod ?? 1, n = SIDES[lod] ?? 12, fine = lod <= 2;
  const m = mesher(ctx, { vertexColors: true });
  const nz = (p, f) => Math.max(-1, Math.min(1, ctx.noise3d(p[0] * f, p[1] * f, p[2] * f)));
  m.transform((p) => [p[0], p[2], -p[1]]);
  const dome = (r) => FRONT + DOME * (1 - (r / (R - 0.01)) ** 2);
  const iron = (p) => hex(fine && nz(p, 35) > 0.35 ? mix(IRON, RUST, 0.7) : IRON, 1 + (fine ? 0.2 * nz(p, 55) : 0));

  // BOARD: oak planks, painted face worn through at the edge and in scuffs
  ctx.smooth(); ctx.metalness(0); ctx.roughness(0.85);
  ctx.albedo("cdn/texture-weathered-oak-planks.png");
  const rs = lod <= 2 ? [0.29, 0.26, 0.23, 0.2, 0.17, 0.14, 0.11, 0.085] : [0.29, 0.22, 0.14, 0.085];
  const prof = [[0, BACK], [0.15, BACK], [R - 0.01, BACK], [R, (BACK + FRONT) / 2], ...rs.map((r) => [r, dome(r)])];
  m.lathe(prof, {
    sides: n, capEnd: 0,
    colorOf: (p) => {
      const r = Math.hypot(p[0], p[2]);
      if (p[1] < BACK + 0.004) return hex(BACKW, 1 + (fine ? 0.1 * nz(p, 20) : 0));
      const wear = fine ? 0.5 + 0.5 * nz(p, 9) + 0.6 * Math.max(0, (r - 0.24) / 0.06) : 0.3;
      return hex(mix(PAINT, WOOD, wear > 0.85 ? 1 : wear > 0.65 ? 0.4 : 0), 1 + (fine ? 0.12 * nz(p, 40) : 0));
    },
  });
  ctx.albedo(null);

  // RIM: an iron band clasping the edge
  ctx.metalness(0.5); ctx.roughness(0.55);
  const rim = [];
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; rim.push({ p: [R * Math.cos(a), (BACK + FRONT) / 2 + 0.002, R * Math.sin(a)], rx: 0.011, ry: 0.017 }); }
  m.tube(rim, { sides: lod <= 2 ? 8 : 5, closed: true, colorOf: iron });

  // BOSS: a domed iron cup on a flange, rivets round its flange and the rim
  m.lathe([[0.088, dome(0.088) - 0.004], [0.09, dome(0.088) + 0.004], [0.072, dome(0.072) + 0.008], [0.064, dome(0.064) + 0.022], [0.05, dome(0.05) + 0.045], [0.026, dome(0) + 0.06], [0, dome(0) + 0.064]],
    { sides: n, k: lod <= 2 ? 2 : 1, capStart: 0, colorOf: iron });
  if (fine) {
    const rivet = (r, a, s) => { const x = r * Math.cos(a), z = r * Math.sin(a), y = dome(r); m.tube([{ p: [x, y - 0.002, z], rx: s }, { p: [x, y + s * 0.5, z], rx: s * 0.7 }], { sides: 6, axis: [0, 1, 0], ref: [0, 0, -1], capStart: 0, capEnd: s * 0.5, colorOf: iron }); };
    for (let i = 0; i < 16; i++) rivet(0.27, (i / 16) * Math.PI * 2 + 0.2, 0.007);
    for (let i = 0; i < 6; i++) rivet(0.08, (i / 6) * Math.PI * 2, 0.006);
  }

  // BACK: two battens across the planks, a wrapped grip bar standing off them at the origin
  ctx.flat(); ctx.metalness(0); ctx.roughness(0.8);
  if (lod <= 4) for (const z of [-0.14, 0.14]) { const w = Math.sqrt(R * R - z * z) - 0.03; m.box([-w, BACK - 0.016, z - 0.025], [w, BACK, z + 0.025], hex(mix(BACKW, [0.3, 0.22, 0.15], 0.4))); }
  ctx.smooth();
  m.tube([{ p: [-0.075, BACK, 0], rx: 0.014, ry: 0.016 }, { p: [-0.06, 0.012, 0], rx: 0.014 }, { p: [-0.035, 0, 0], rx: 0.015 }, { p: [0.035, 0, 0], rx: 0.015 }, { p: [0.06, 0.012, 0], rx: 0.014 }, { p: [0.075, BACK, 0], rx: 0.014, ry: 0.016 }],
    { sides: lod <= 2 ? 10 : 6, k: lod <= 2 ? 3 : 1, capStart: 0, capEnd: 0, colorOf: (p) => hex(LEATHER, 1 + (fine ? 0.25 * Math.abs(Math.sin(p[0] * 160)) - 0.12 : 0)) });
  m.transform(null);
  return m.done();
}
