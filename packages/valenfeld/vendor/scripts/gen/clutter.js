// SMALL FLOOR THINGS, one scripted geometry, params.kind picks. Feet on the floor at the origin, textured from the building kit.
// Quest clues (wick-clue-*) and the scatter clutter both draw here, so nothing small stands as a raw primitive.
//   scrap  : a strip of red hood wool torn off on a rusted bolt in a fallen wall block
//   pail   : a tin pail kicked onto its side, hoops and handle, a wet spill running out of it
//   purse  : a leather purse slit open, drawstring loose, two coins left in the dirt
//   prints : a trail of muddy bootprints, sole and heel pressed in, mud kicked up (runs along local -z)
//   coins  : a few coins dropped in a smear of mud, one on edge
//   bucket : an oak bucket on its side, iron hoops        skulls : a heap of old skulls, brown where they lay
import { CANVAS, FS, IR, OAK, ROCK, CY, LA, RB, TORUS, PIPE, ROPE, paint, flatc, CB } from "../lib/buildkit.js";
const MUD = "cdn/texture-wet-cobblestone-sewer-floor-slimy.png";
function rnd(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
// a lumpy ellipsoid: n around, m up, jitter j
function lump(c, x, y, z, rx, ry, rz, n, m, j, R) {
  const P = []; for (let i = 0; i <= m; i++) { const v = i / m * Math.PI, row = []; for (let k = 0; k < n; k++) { const u = k / n * Math.PI * 2, f = 1 + (R() - 0.5) * j * (i > 0 && i < m ? 1 : 0);
    row.push([x + Math.cos(u) * Math.sin(v) * rx * f, y + ry - Math.cos(v) * ry * f, z + Math.sin(u) * Math.sin(v) * rz * f]); } P.push(row); }
  c.smooth(); for (let i = 0; i < m; i++) for (let k = 0; k < n; k++) { const a = P[i][k], b = P[i][(k + 1) % n], d = P[i + 1][k], e = P[i + 1][(k + 1) % n]; c.quad(...b, ...a, ...d, ...e); } c.flat();
}
function coin(c, x, z, y = 0, tilt = 0) { paint(c, IR, "oklch(0.82 0.12 82)"); c.metalness?.(0.85); c.roughness?.(0.35); RB(c, x, y + 0.006, z, 0.05, 0.01, 0.05, 25 + x * 300, tilt, 0); RB(c, x, y + 0.006, z, 0.05, 0.01, 0.05, 70 + x * 300, tilt, 0); c.metalness?.(0); c.roughness?.(0.9); }
function smear(c, x, z, rx, rz, R, col = "oklch(0.46 0.04 62)") { paint(c, MUD, col); lump(c, x, -0.012, z, rx, 0.022, rz, 9, 2, 0.35, R); }
export function geometry(c) {
  const p = c.params ?? {}, k = p.kind, R = rnd(p.seed ?? 7), lo = (c.lod ?? 1) <= 2;
  if (k === "scrap") {
    paint(c, FS, "oklch(0.7 0.02 70)"); RB(c, 0, 0.13, 0, 0.42, 0.26, 0.32, 12, 0, 4); RB(c, 0.3, 0.07, 0.12, 0.2, 0.14, 0.18, -30, 6, 0);   // a fallen wall block and a shard
    paint(c, IR, "oklch(0.5 0.08 45)"); PIPE(c, [0.02, 0.24, 0], [0.05, 0.42, -0.03], 0.018, 0.012, 6); RB(c, 0.05, 0.43, -0.03, 0.05, 0.02, 0.05, 20);   // the rusted bolt
    paint(c, CANVAS, "oklch(0.4 0.12 26)");   // hood wool: a torn strip draped off the bolt to the floor, folded twice
    const W = 0.07, pts = [[0.05, 0.41, -0.03], [0.12, 0.33, 0.02], [0.2, 0.2, 0.08], [0.3, 0.11, 0.2], [0.4, 0.02, 0.3], [0.56, 0.008, 0.36]];
    for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1], w0 = W * (0.7 + i * 0.12), w1 = W * (0.7 + (i + 1) * 0.12);
      c.quad(a[0] - w0, a[1], a[2] + w0 * 0.5, a[0] + w0, a[1], a[2] - w0 * 0.5, b[0] + w1, b[1], b[2] - w1 * 0.5, b[0] - w1, b[1], b[2] + w1 * 0.5);
      c.quad(b[0] - w1, b[1], b[2] + w1 * 0.5, b[0] + w1, b[1], b[2] - w1 * 0.5, a[0] + w0, a[1], a[2] - w0 * 0.5, a[0] - w0, a[1], a[2] + w0 * 0.5); }
    paint(c, CANVAS, "oklch(0.34 0.1 24)"); RB(c, 0.6, 0.012, 0.36, 0.16, 0.022, 0.12, 30, 0, 3);   // the frayed end
    for (let i = 0; i < 3; i++) PIPE(c, [0.66, 0.02, 0.33 + i * 0.03], [0.74 + R() * 0.04, 0.008, 0.3 + i * 0.05], 0.006, 0.003, 4);
  } else if (k === "pail") {
    smear(c, 0.05, -0.45, 0.32, 0.5, R, "oklch(0.42 0.04 110)");   // the spill runs out of its mouth
    paint(c, IR, "oklch(0.62 0.01 240)"); c.metalness?.(0.6);
    LA(c, 0, 0.17, 0.05, [[0.15, 0.17], [0.19, -0.15]].map(([r, h]) => [r, h]), lo ? 14 : 8, false, "x");   // body on its side, axis along x... mouth toward -z via the spill
    LA(c, 0, 0.17, 0.05, [[0.001, 0.17], [0.15, 0.17]], lo ? 14 : 8, false, "x");   // the bottom
    paint(c, IR, "oklch(0.42 0.02 60)"); TORUS(c, 0.1, 0.17, 0.05, 0.158, 0.01, lo ? 14 : 8, 4, "x"); TORUS(c, -0.12, 0.17, 0.05, 0.183, 0.01, lo ? 14 : 8, 4, "x");
    ROPE(c, [-0.14, 0.02, -0.12], [-0.14, 0.02, 0.22], -0.18, 0.006, 6);   // the bail handle lying flat
    c.metalness?.(0);
  } else if (k === "purse") {
    smear(c, 0, 0, 0.28, 0.22, R);
    paint(c, CANVAS, "oklch(0.36 0.05 48)");   // oiled leather
    LA(c, 0, 0, 0, [[0.02, 0], [0.12, 0.02], [0.15, 0.07], [0.11, 0.13], [0.05, 0.16], [0.06, 0.2]], lo ? 12 : 7, true);
    flatc(c, "oklch(0.12 0.01 40)"); RB(c, 0.1, 0.08, 0.02, 0.05, 0.08, 0.012, 60, 0, 0);   // the knife slit, black inside
    paint(c, CANVAS, "oklch(0.55 0.04 70)"); TORUS(c, 0, 0.17, 0, 0.055, 0.008, 8, 4); ROPE(c, [0.05, 0.17, 0], [0.24, 0.006, 0.12], 0.05, 0.006, 5);   // the drawstring, cut
    coin(c, 0.22, -0.08); coin(c, -0.17, 0.12, 0, 8);
  } else if (k === "prints") {
    for (let i = 0; i < 4; i++) { const s = i % 2 ? 1 : -1, x = s * 0.11, z = 0.5 - i * 0.42, yaw = s * 6;
      paint(c, MUD, "oklch(0.42 0.04 60)"); RB(c, x, 0.004, z - 0.04, 0.11, 0.008, 0.2, yaw); RB(c, x, 0.004, z + 0.11, 0.09, 0.008, 0.08, yaw);   // sole and heel
      paint(c, MUD, "oklch(0.52 0.05 65)"); for (const e of [-1, 1]) RB(c, x + e * 0.065, 0.012, z, 0.03, 0.024, 0.28, yaw + e * 4);   // the mud squeezed up round the edge
      RB(c, x - s * 0.02, 0.016, z - 0.17, 0.12, 0.03, 0.05, yaw + 10); }   // toe dug in, mud thrown forward
    smear(c, 0.05, -1.1, 0.18, 0.12, R);
  } else if (k === "coins") {
    smear(c, 0, 0, 0.2, 0.16, R); coin(c, 0, 0); coin(c, 0.08, 0.05, 0, 10); coin(c, -0.07, -0.04);
    paint(c, IR, "oklch(0.8 0.12 82)"); c.metalness?.(0.85); CY(c, 0.13, 0, -0.06, 0.025, 0.006, 10); RB(c, 0.13, 0.025, -0.06, 0.05, 0.05, 0.008, 40); c.metalness?.(0);   // one stood on edge in the mud
  } else if (k === "bucket") {
    paint(c, OAK, "oklch(0.72 0.03 60)"); LA(c, 0, 0.16, 0, [[0.13, -0.16], [0.17, 0.16]], lo ? 12 : 8, false, "x"); LA(c, 0, 0.16, 0, [[0.001, -0.16], [0.13, -0.16]], lo ? 12 : 8, false, "x");
    paint(c, IR, "oklch(0.45 0.02 60)"); TORUS(c, -0.08, 0.16, 0, 0.145, 0.009, lo ? 12 : 8, 4, "x"); TORUS(c, 0.1, 0.16, 0, 0.166, 0.009, lo ? 12 : 8, 4, "x");
  } else if (k === "skulls") {
    const pile = [[0, 0, 0], [0.18, 0, 0.05], [0.08, 0, 0.17], [0.09, 0.13, 0.07]];
    pile.forEach(([x, y, z], i) => { paint(c, ROCK, ["oklch(0.72 0.04 80)", "oklch(0.6 0.05 68)", "oklch(0.66 0.045 75)", "oklch(0.55 0.05 62)"][i]);
      lump(c, x, y, z, 0.085, 0.075, 0.1, 9, 5, 0.12, R); lump(c, x - 0.01, y, z + 0.07, 0.055, 0.04, 0.045, 7, 3, 0.15, R);
      flatc(c, "oklch(0.16 0.02 50)"); for (const e of [-1, 1]) lump(c, x + e * 0.035, y + 0.07, z + 0.085, 0.022, 0.02, 0.012, 6, 2, 0, R); });
  }
}
export function collider(c) {
  const k = (c.params ?? {}).kind, b = CB();
  if (k === "scrap") b(-0.22, 0, -0.17, 0.4, 0.3, 0.2);
  else if (k === "pail") b(-0.2, 0, -0.15, 0.2, 0.34, 0.25);
  else if (k === "purse") b(-0.15, 0, -0.15, 0.15, 0.2, 0.15);
  else if (k === "prints") b(-0.22, 0, -0.75, 0.22, 0.03, 0.65);
  else if (k === "coins") b(-0.12, 0, -0.1, 0.16, 0.05, 0.1);
  return b.list;
}
