// The Vael's falls under Highbridge (#227): three rough rock steps with white water sheeting over each lip.
// params.part: "rock" (the stepped stone, walkable mesh) | "water" (the sheets, worn by a water material).
// Local frame: origin at the pool floor at the foot, water flows toward +z (south), x across the gully.
import { G, TEX } from "../lib/geo.js";
const STEPS = [ // lip z, top y
  { z: -12, y: 41.5 }, { z: -6, y: 27.5 }, { z: 0, y: 13.5 },
];
const BACK = -32, HALF = 15;
const h = (a, b) => { const s = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return s - Math.floor(s); };
const n = (x, k) => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return h(i, k) * (1 - u) + h(i + 1, k) * u; };
function profile(x) { // (z, y) down the face at this x, rough lips
  const p = [[BACK, STEPS[0].y + 0.6]];
  STEPS.forEach((s, i) => {
    const j = (n(x * 0.45, i + 1) - 0.5) * 2.4, lip = s.z + j, next = STEPS[i + 1]?.y ?? 0;
    const bulge = (n(x * 0.7, i + 9) - 0.5) * 0.8;
    p.push([lip - 1.4, s.y + 0.15 * n(x, i + 3)], [lip, s.y - 0.3], [lip + 0.4 + bulge, s.y - (s.y - next) * 0.45], [lip + 0.9, next + 0.2]);
  });
  p.push([3.5, -0.5]);
  return p;
}
export function geometry(ctx) {
  const g = new G(ctx), part = ctx.params?.part ?? "rock", step = ctx.lod <= 2 ? 1 : ctx.lod <= 3 ? 2.5 : 6;
  const xs = []; for (let x = -HALF; x <= HALF + 1e-6; x += step) xs.push(x);
  if (part === "rock") {
    ctx.albedo(TEX.rock); ctx.color("oklch(0.88 0.02 80)");
    for (let i = 0; i < xs.length - 1; i++) {
      const a = profile(xs[i]), b = profile(xs[i + 1]);
      for (let k = 0; k < a.length - 1; k++) g.quad([xs[i], a[k][1], a[k][0]], [xs[i + 1], b[k][1], b[k][0]], [xs[i + 1], b[k + 1][1], b[k + 1][0]], [xs[i], a[k + 1][1], a[k + 1][0]]);
    }
    if (ctx.lod <= 3) { // boulders tumbled at each foot
      ctx.color("oklch(0.82 0.02 75)");
      STEPS.forEach((s, i) => { const y = STEPS[i + 1]?.y ?? 0; for (let k = 0; k < 4; k++) { const x = (h(i, k) - 0.5) * 2 * (HALF - 3), r = 0.8 + h(k, i + 5) * 1.4; if (Math.abs(x) > 5) g.blob([x, y + r * 0.4, s.z + 2 + h(k, i) * 2], r, 1, 0.3, 1, i * 7 + k, y); } });
    }
    ctx.albedo(null); ctx.color(null);
    return;
  }
  // water: one sheet per step, over the lip and down to the next pool, narrower than the rock
  const W = (i) => [9, 7.5, 7][i], seg = ctx.lod <= 2 ? 6 : 3;
  STEPS.forEach((s, i) => {
    const next = STEPS[i + 1]?.y ?? 0, w = W(i), cols = []; for (let x = -w; x <= w + 1e-6; x += step) cols.push(x);
    const path = (x) => { const lip = s.z + (n(x * 0.45, i + 1) - 0.5) * 2.4, pts = [[lip - 4, s.y + 0.25]];
      for (let t = 0; t <= seg; t++) { const u = t / seg, dz = 0.3 + 1.3 * Math.sqrt(u), dy = (s.y - next) * u * u; pts.push([lip + dz, s.y + 0.1 - dy + (u === 1 ? 0.35 : 0)]); }
      pts.push([lip + 4, next + 0.45]); return pts; };
    for (let c = 0; c < cols.length - 1; c++) { const a = path(cols[c]), b = path(cols[c + 1]);
      for (let k = 0; k < a.length - 1; k++) g.quad([cols[c], a[k][1], a[k][0]], [cols[c + 1], b[k][1], b[k][0]], [cols[c + 1], b[k + 1][1], b[k + 1][0]], [cols[c], a[k + 1][1], a[k + 1][0]]); }
  });
}
