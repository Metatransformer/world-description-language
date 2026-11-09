// The store sign: a wrought-iron post with a scrolled arm, two chains, an oak-framed board in the store type's
// board colour, and the type's icon raised on both faces in its colour. params: board, color, icon
// (anvil | mortar | breastplate | three-balls | sack | bow | star | book). Board faces -Z (the street).
// mount: "wall" = no post: an iron wall plate at local x -0.6 (the wall), the arm juts out along +x; yaw the row so +x points away from the wall.
import { G, TEX } from "../lib/geo.js";
const circ = (cx, cy, r, n = 14) => Array.from({ length: n }, (_, i) => [cx + Math.cos(i / n * 6.283) * r, cy + Math.sin(i / n * 6.283) * r]);
const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
const quadOf = (ax, ay, bx, by, w) => { const dx = bx - ax, dy = by - ay, l = Math.hypot(dx, dy) || 1, nx = -dy / l * w / 2, ny = dx / l * w / 2; return [[ax + nx, ay + ny], [ax - nx, ay - ny], [bx - nx, by - ny], [bx + nx, by + ny]]; };
const arc = (cx, cy, r, a0, a1, w, n = 8) => { const o = []; for (let i = 0; i < n; i++) { const a = a0 + (a1 - a0) * i / n, b = a0 + (a1 - a0) * (i + 1) / n; o.push(quadOf(cx + Math.cos(a) * r, cy + Math.sin(a) * r, cx + Math.cos(b) * r, cy + Math.sin(b) * r, w)); } return o; };
const star = (cx, cy, R, r) => Array.from({ length: 10 }, (_, i) => { const a = Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r : R; return [cx + Math.cos(a) * q, cy + Math.sin(a) * q]; });
// each icon: convex or centre-star-shaped polygons in board metres (x right, y up), board is 0.8 x 0.6
const ICONS = {
  anvil: [rect(-0.24, 0.03, 0.2, 0.11), [[-0.24, 0.11], [-0.24, 0.03], [-0.36, 0.09]], rect(-0.07, -0.1, 0.07, 0.03), [[-0.19, -0.19], [0.19, -0.19], [0.11, -0.1], [-0.11, -0.1]], rect(0.2, 0.06, 0.25, 0.11)],
  mortar: [[...circ(0, 0, 0.19, 16).filter((p) => p[1] <= 0.001)], rect(-0.2, -0.01, 0.2, 0.03), rect(-0.1, -0.24, 0.1, -0.18), quadOf(0.04, 0.0, 0.24, 0.22, 0.06), circ(0.24, 0.22, 0.045, 8)],
  breastplate: [[[-0.17, 0.17], [-0.05, 0.13], [0.05, 0.13], [0.17, 0.17], [0.2, 0.0], [0.12, -0.2], [-0.12, -0.2], [-0.2, 0.0]], rect(-0.26, 0.1, -0.15, 0.2), rect(0.15, 0.1, 0.26, 0.2), rect(-0.14, -0.26, 0.14, -0.21)],
  "three-balls": [circ(-0.14, -0.1, 0.085), circ(0.14, -0.1, 0.085), circ(0, 0.08, 0.085), rect(-0.2, 0.2, 0.2, 0.24), quadOf(0, 0.2, 0, 0.16, 0.02)],
  sack: [[[-0.16, -0.2], [0.16, -0.2], [0.21, -0.08], [0.17, 0.06], [0.07, 0.12], [-0.07, 0.12], [-0.17, 0.06], [-0.21, -0.08]], rect(-0.06, 0.12, 0.06, 0.17), [[-0.07, 0.17], [0.07, 0.17], [0.13, 0.25], [-0.13, 0.25]]],
  bow: [...arc(0.12, 0, 0.26, 2.0, 4.28, 0.04, 9), quadOf(-0.0, 0.235, -0.0, -0.235, 0.012), quadOf(-0.02, 0, 0.3, 0, 0.022), [[0.3, 0.045], [0.38, 0], [0.3, -0.045]], [[-0.04, 0.03], [0.0, 0], [-0.04, -0.03], [-0.08, 0]]],
  star: [star(0, 0, 0.22, 0.09), star(0.24, 0.17, 0.06, 0.025), star(-0.25, -0.15, 0.05, 0.02)],
  horse: [...arc(0, 0.0, 0.17, -0.75, Math.PI + 0.75, 0.075, 12), rect(-0.2, -0.2, -0.1, -0.15), rect(0.1, -0.2, 0.2, -0.15)],
  book: [[[-0.3, -0.16], [-0.02, -0.2], [-0.02, 0.16], [-0.3, 0.2]], [[0.02, -0.2], [0.3, -0.16], [0.3, 0.2], [0.02, 0.16]], rect(-0.02, -0.22, 0.02, 0.18)],
};
// a flat polygon slab on the board face: z0 = face plane, s = -1 front (-Z) or +1 back
function slab(g, pts, z0, t, s) {
  const c = pts.reduce((a, p) => [a[0] + p[0] / pts.length, a[1] + p[1] / pts.length], [0, 0]), zo = z0 + s * t;
  const P = s < 0 ? pts : [...pts].reverse(); // wind outward
  for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; g.tri([c[0], c[1] + 2.25, zo], [b[0], b[1] + 2.25, zo], [a[0], a[1] + 2.25, zo]); g.quad([a[0], a[1] + 2.25, z0], [a[0], a[1] + 2.25, zo], [b[0], b[1] + 2.25, zo], [b[0], b[1] + 2.25, z0]); }
}
export function geometry(ctx) {
  const g = new G(ctx), p = ctx.params ?? {}, lod = ctx.lod ?? 1;
  // iron: post on a stone foot, the arm, a scroll brace, chains
  const wall = p.mount === "wall";
  if (!wall) { ctx.albedo("cdn/texture-fieldstone-wall.png"); ctx.color("oklch(0.92 0.01 90)"); g.box(-0.55, 0.12, 0, 0.34, 0.24, 0.34); }
  ctx.albedo(TEX.iron); ctx.color("oklch(0.8 0 0)");
  if (wall) { g.box(-0.58, 2.76, 0, 0.05, 0.62, 0.26); for (const y of [2.52, 3.0]) g.box(-0.55, y, 0, 0.04, 0.05, 0.05); } // wall plate, two bolt heads
  else { g.box(-0.55, 1.6, 0, 0.09, 3.0, 0.09); g.box(-0.55, 3.14, 0, 0.15, 0.08, 0.15); }
  g.box(0.02, 2.96, 0, 1.2, 0.06, 0.06); g.box(0.6, 2.96, 0, 0.08, 0.1, 0.08);
  g.tube([[-0.51, 2.55, 0, 0.022], [-0.3, 2.62, 0, 0.022], [-0.12, 2.8, 0, 0.022], [-0.05, 2.93, 0, 0.022]], 6);
  if (lod <= 2) for (const x of [-0.3, 0.34]) for (let k = 0; k < 4; k++) g.box(x, 2.9 - k * 0.07, 0, k % 2 ? 0.012 : 0.035, 0.06, k % 2 ? 0.035 : 0.012);
  // board: oak frame, painted panel
  ctx.albedo(TEX.oak); ctx.color("oklch(0.9 0.03 65)");
  g.box(0.02, 2.6, 0, 0.9, 0.06, 0.08); g.box(0.02, 1.9, 0, 0.9, 0.06, 0.08); g.box(-0.42, 2.25, 0, 0.06, 0.76, 0.08); g.box(0.46, 2.25, 0, 0.06, 0.76, 0.08);
  ctx.albedo(null); ctx.color(p.board ?? "#3b3a36");
  g.box(0.02, 2.25, 0, 0.82, 0.64, 0.05);
  // icon, raised on both faces
  ctx.color(p.color ?? "#c9a45a");
  for (const s of [-1, 1]) for (const poly of ICONS[p.icon] ?? ICONS.sack) slab(g, poly.map((q) => [q[0] + 0.02, q[1]]), s * 0.025, 0.012, s);
  ctx.color(null);
}
export function collider(ctx) { return ctx?.params?.mount === "wall" ? null : { kind: "box", width: 1.25, height: 3.2, depth: 0.2 }; }
