// A COVERED COACH, forward -z: oak bed on four spoked wheels (rear 0.72 m, front 0.56 m), a canvas
// tilt over oak hoops, the driver's bench and footboard up front, shafts reaching forward, a lantern.
import { paint, flatc, glow, BX, LA, SEG, PIPE, PATH, TORUS, LOFT, CB, OAK, IR, CANVAS, WOOD, IRONC } from "../lib/buildkit.js";
function wheel(c, x, z, r, D) {
  paint(c, OAK, "oklch(0.72 0.04 45)"); TORUS(c, x, r, z, r - 0.045, 0.05, D <= 2 ? 18 : 10, D <= 2 ? 5 : 3, "x");
  const n = D <= 2 ? 10 : D <= 3 ? 6 : 0; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; SEG(c, [x, r, z], [x, r + Math.cos(a) * (r - 0.06), z + Math.sin(a) * (r - 0.06)], 0.045, 0.045); }
  LA(c, x - 0.13 * Math.sign(x), r, z, [[0.09, 0], [0.12, 0.13 * Math.sign(x)], [0.08, 0.26 * Math.sign(x)]], D <= 2 ? 8 : 5, true, "x");
  if (D <= 2) { paint(c, IR, IRONC); TORUS(c, x, r, z, r, 0.025, 18, 3, "x"); }
}
export function geometry(c) {
  const D = c.lod;
  paint(c, OAK, WOOD); BX(c, -0.82, 0.85, -1.55, 0.82, 0.96, 1.6);
  for (const s of [-1, 1]) BX(c, s * 0.82 - 0.05, 0.96, -1.55, s * 0.82 + 0.05, 1.42, 1.6);
  BX(c, -0.82, 0.96, 1.52, 0.82, 1.42, 1.6); BX(c, -0.82, 0.96, -1.6, 0.82, 1.3, -1.52);
  if (D <= 2) { paint(c, OAK, "oklch(0.7 0.03 50)"); for (const s of [-1, 1]) for (const z of [-1.2, -0.3, 0.6, 1.45]) BX(c, s * 0.89 - 0.03, 0.9, z - 0.05, s * 0.89 + 0.03, 1.44, z + 0.05); }
  // canvas tilt
  const n = D <= 2 ? 10 : D <= 3 ? 6 : 3, hoops = [-1.4, -0.45, 0.55, 1.5];
  const arch = (z, k) => { const r = []; for (let i = 0; i <= n; i++) { const a = Math.PI * i / n; r.push([Math.cos(a) * 0.87 * k, 1.42 + Math.sin(a) * 1.05 * k, z]); } return r; };
  const rows = []; for (let h = 0; h < hoops.length; h++) { rows.push(arch(hoops[h], 1)); if (D <= 2 && h < hoops.length - 1) rows.push(arch((hoops[h] + hoops[h + 1]) / 2, 0.965)); }
  paint(c, CANVAS, "oklch(0.93 0.03 85)"); LOFT(c, rows);
  { const back = arch(1.5, 1), ctr = [0, 1.7, 1.42]; for (let i = 0; i < back.length - 1; i++) c.tri(...ctr, ...back[i], ...back[i + 1]); c.tri(...back[0], ...ctr, ...back[n]); }
  flatc(c, "oklch(0.25 0.02 60)"); { const f = arch(-1.25, 0.97); for (let i = 0; i < f.length - 1; i++) c.tri(0, 1.42, -1.25, ...f[i + 1], ...f[i]); }
  if (D <= 2) { paint(c, OAK, WOOD); for (const z of hoops) PATH(c, arch(z, 1.025).filter((_, i) => i % 2 === 0 || i === n), 0.035, 4); }
  // wheels, axles, bench, shafts
  wheel(c, -0.95, 1.0, 0.72, D); wheel(c, 0.95, 1.0, 0.72, D); wheel(c, -0.95, -1.05, 0.56, D); wheel(c, 0.95, -1.05, 0.56, D);
  paint(c, OAK, "oklch(0.7 0.03 50)"); BX(c, -0.95, 0.67, 0.95, 0.95, 0.77, 1.05); BX(c, -0.95, 0.51, -1.1, 0.95, 0.61, -1.0);
  SEG(c, [0, 0.6, -1.05], [0, 0.82, -0.6], 0.14, 0.14); SEG(c, [0, 0.77, 1.0], [0, 0.85, 0.6], 0.14, 0.14);
  paint(c, OAK, WOOD); BX(c, -0.78, 1.5, -2.0, 0.78, 1.58, -1.62); BX(c, -0.78, 1.58, -1.66, 0.78, 1.95, -1.6); BX(c, -0.8, 1.0, -2.35, 0.8, 1.05, -2.0);
  for (const s of [-1, 1]) { SEG(c, [s * 0.7, 0.96, -1.6], [s * 0.7, 1.5, -1.95], 0.07, 0.07); SEG(c, [s * 0.7, 0.9, -1.6], [s * 0.7, 1.02, -2.3], 0.06, 0.06); PIPE(c, [s * 0.55, 0.9, -1.6], [s * 0.6, 0.62, -4.5], 0.055, 0.045, 5); }
  SEG(c, [-0.6, 0.72, -3.4], [0.6, 0.72, -3.4], 0.07, 0.07);
  // cargo glimpsed in the back, the lantern
  if (D <= 2) { paint(c, OAK, "oklch(0.8 0.03 65)"); BX(c, -0.7, 0.96, 0.6, 0.0, 1.5, 1.45); BX(c, 0.05, 0.96, 0.9, 0.7, 1.35, 1.45); }
  paint(c, IR, IRONC); BX(c, 0.84, 1.42, -1.6, 0.88, 2.1, -1.56); BX(c, 0.84, 2.06, -1.8, 0.88, 2.1, -1.56);
  BX(c, 0.74, 1.62, -1.92, 0.98, 1.66, -1.68); LA(c, 0.86, 1.92, -1.8, [[0.13, 0], [0.02, 0.1]], 4, true);
  glow(c, "#ffd9a0", [1.8, 1.0, 0.4]); BX(c, 0.77, 1.66, -1.89, 0.95, 1.92, -1.71);
}
export function collider(c) { const b = CB(); b(-0.95, 0.2, -2.3, 0.95, 2.5, 1.65); return b.list; }
