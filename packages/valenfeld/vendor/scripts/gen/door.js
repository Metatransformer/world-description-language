// One door leaf of Valenfeld: smoke-dark oak planks on ledges and a brace, three worn-iron strap hinges
// ending in spear points, clout nails, a ring pull on a round boss. Shared by every building door.
// Origin = bottom centre of the leaf, front (straps, ring) faces -Z. params: w (width), h (height), hinge (-1 left / 1 right, seen from the front).
const OAKT = "cdn/texture-dark-oak-planks-weathered.png", IRT = "cdn/texture-wrought-iron.png";
const V = (x, y, z) => ({ x, y, z });
const add = (a, b) => V(a.x + b.x, a.y + b.y, a.z + b.z);
const mul = (a, s) => V(a.x * s, a.y * s, a.z * s);
const crs = (a, b) => V(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);
const nrm = (a) => { const l = Math.hypot(a.x, a.y, a.z) || 1; return mul(a, 1 / l); };
const X = V(1, 0, 0), Y = V(0, 1, 0), Z = V(0, 0, 1);
const Q = (c, a, b, d, e) => c.quad(a.x, a.y, a.z, b.x, b.y, b.z, d.x, d.y, d.z, e.x, e.y, e.z);
const T = (c, a, b, d) => c.tri(a.x, a.y, a.z, b.x, b.y, b.z, d.x, d.y, d.z);
function obox(c, ctr, U, Vv, hu, hv, hw) {
  U = nrm(U); Vv = nrm(Vv); const W = nrm(crs(U, Vv));
  const p = (a, b, d) => add(add(add(ctr, mul(U, a * hu)), mul(Vv, b * hv)), mul(W, d * hw));
  Q(c, p(-1, -1, 1), p(1, -1, 1), p(1, 1, 1), p(-1, 1, 1));
  Q(c, p(1, -1, -1), p(-1, -1, -1), p(-1, 1, -1), p(1, 1, -1));
  Q(c, p(1, -1, 1), p(1, -1, -1), p(1, 1, -1), p(1, 1, 1));
  Q(c, p(-1, -1, -1), p(-1, -1, 1), p(-1, 1, 1), p(-1, 1, -1));
  Q(c, p(-1, 1, 1), p(1, 1, 1), p(1, 1, -1), p(-1, 1, -1));
  Q(c, p(-1, -1, -1), p(1, -1, -1), p(1, -1, 1), p(-1, -1, 1));
}
const box = (c, x0, y0, z0, x1, y1, z1) => obox(c, V((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2), X, Y, Math.abs(x1 - x0) / 2, Math.abs(y1 - y0) / 2, Math.abs(z1 - z0) / 2);
// a ring lying in the door's plane (normal ±Z), centre c
function torus(c, ctr, R, r, nu = 18, nv = 6) {
  const P = (i, j) => { const u = i / nu * Math.PI * 2, v = j / nv * Math.PI * 2, k = R + r * Math.cos(v);
    return V(ctr.x + k * Math.cos(u), ctr.y + k * Math.sin(u), ctr.z + r * Math.sin(v)); };
  c.smooth();
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) Q(c, P(i, j), P(i + 1, j), P(i + 1, j + 1), P(i, j + 1));
  c.flat();
}
// a short cylinder along an axis: the hinge knuckles and the ring's boss
function cyl(c, ctr, axis, r, len, n = 10) {
  const A = nrm(axis), U = nrm(Math.abs(A.y) > 0.9 ? crs(A, X) : crs(A, Y)), W = crs(A, U);
  const P = (i, s) => add(add(ctr, mul(A, s * len / 2)), add(mul(U, r * Math.cos(i / n * Math.PI * 2)), mul(W, r * Math.sin(i / n * Math.PI * 2))));
  c.smooth(); for (let i = 0; i < n; i++) Q(c, P(i + 1, -1), P(i, -1), P(i, 1), P(i + 1, 1)); c.flat();
  const top = add(ctr, mul(A, len / 2)), bot = add(ctr, mul(A, -len / 2));
  for (let i = 0; i < n; i++) { T(c, top, P(i, 1), P(i + 1, 1)); T(c, bot, P(i + 1, -1), P(i, -1)); }
}
const OAK = "oklch(0.86 0.035 55)", IRON = "oklch(0.86 0.005 250)";
function oak(c, k = 0) { c.albedo(OAKT); c.color(`oklch(${0.84 + k} 0.035 ${52 + k * 60})`); c.metalness(0); c.roughness(0.85); c.emissive(null); }
function iron(c) { c.albedo(IRT); c.color(IRON); c.metalness(0.65); c.roughness(0.55); c.emissive(null); }

export function geometry(c) {
  const w = c.params.w ?? 1.5, h = c.params.h ?? 2.4, hs = c.params.hinge ?? -1, L = c.lod;
  const t = 0.09, zf = -t / 2, zb = t / 2;
  // the dark core seen through the plank joints
  c.albedo(null); c.color("#120c08"); c.roughness(1); box(c, -w / 2 + 0.01, 0.01, -0.02, w / 2 - 0.01, h - 0.01, 0.02);
  // vertical planks, each its own width, height and lean of colour
  const n = Math.max(4, Math.round(w / 0.19)), pw = w / n, gap = L <= 2 ? 0.007 : 0;
  for (let i = 0; i < n; i++) {
    const x0 = -w / 2 + i * pw + gap, x1 = -w / 2 + (i + 1) * pw - gap, k = ((i * 37) % 7) / 7 * 0.08 - 0.04, dh = ((i * 53) % 5) * 0.006;
    oak(c, k); box(c, x0, 0, zf - (i % 2) * 0.004, x1, h - dh, zb);
  }
  if (L >= 4) { c.albedo(null); c.metalness(null); c.roughness(null); return; }
  // the back: three ledges and a Z brace rising from the hinge side
  oak(c, -0.03);
  const ly = [0.32, h / 2, h - 0.38];
  for (const y of ly) box(c, -w / 2 + 0.05, y - 0.07, zb, w / 2 - 0.05, y + 0.07, zb + 0.035);
  for (let s = 0; s < 2; s++) {
    const a = V(hs * (w / 2 - 0.12), ly[s] + 0.07, zb + 0.0175), b = V(-hs * (w / 2 - 0.12), ly[s + 1] - 0.07, zb + 0.0175);
    const d = V(b.x - a.x, b.y - a.y, 0), len = Math.hypot(d.x, d.y);
    obox(c, mul(add(a, b), 0.5), nrm(d), Z, len / 2, 0.06, 0.016);
  }
  // front: strap hinges from the hinge edge, spear-tipped
  iron(c);
  const sl = w * 0.78, hx = -hs * w / 2;
  for (const y of ly) {
    const x1 = hx + hs * sl, zz = zf - 0.006;   // the strap runs from the hinge edge across the leaf, never out past it (#799: straps stuck out like arrows)
    box(c, Math.min(hx, x1), y - 0.035, zz - 0.008, Math.max(hx, x1), y + 0.035, zz);
    // spear point
    const tip = V(x1 + hs * 0.12, y, zz - 0.004);
    T(c, V(x1, y + 0.06, zz - 0.008), tip, V(x1, y - 0.06, zz - 0.008));
    T(c, V(x1, y - 0.06, zz - 0.008), V(x1, y + 0.06, zz - 0.008), tip); // keep both windings facing out
    box(c, x1 - 0.02, y - 0.06, zz - 0.008, x1 + 0.02, y + 0.06, zz);
    if (L <= 1) for (let k = 0; k < 6; k++) { const nx = hx + hs * (0.09 + k * (sl - 0.12) / 5); box(c, nx - 0.012, y - 0.012, zz - 0.016, nx + 0.012, y + 0.012, zz - 0.008); }
    // hinge knuckle on the edge
    if (L <= 2) cyl(c, V(hx, y, 0), Y, 0.028, 0.16, 8);
    // clout nails through the ledges, seen on the front
    if (L <= 1) for (let k = 0; k < n; k++) { const nx = -w / 2 + (k + 0.5) * pw; if (Math.abs(nx - x1) < 0.05) continue; box(c, nx - 0.009, y + 0.05, zf - 0.012, nx + 0.009, y + 0.068, zf); box(c, nx - 0.009, y - 0.068, zf - 0.012, nx + 0.009, y - 0.05, zf); }
  }
  // ring pull on a round boss, both faces, on the latch side
  const rx = hs * (w / 2 - 0.2), ry = 1.05;
  for (const side of [-1, 1]) {
    const zs = side < 0 ? zf : zb + 0.035;
    cyl(c, V(rx, ry, zs + side * 0.012), Z, 0.07, 0.024, 12);
    cyl(c, V(rx, ry, zs + side * 0.034), Z, 0.018, 0.022, 8);
    torus(c, V(rx, ry - 0.09, zs + side * 0.03), 0.085, 0.013, L <= 2 ? 20 : 12, L <= 2 ? 7 : 5);
  }
  // keyhole escutcheon on the front
  box(c, rx - 0.035, ry - 0.3, zf - 0.008, rx + 0.035, ry - 0.18, zf);
  c.albedo(null); c.color("#050403"); c.metalness(null); box(c, rx - 0.008, ry - 0.27, zf - 0.009, rx + 0.008, ry - 0.21, zf - 0.008);
  c.albedo(null); c.color(null); c.metalness(null); c.roughness(null);
}
export function collider(c) {
  const w = c.params.w ?? 1.5, h = c.params.h ?? 2.4;
  return { kind: "box", width: w, height: h, depth: 0.12, center: [0, h / 2, 0] };
}
