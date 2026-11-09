// A straw training dummy on an oak post: front (-Z) wears a rust target patch. Origin = foot of the post.
const Q = (c, a, b, d, e) => c.quad(a[0], a[1], a[2], b[0], b[1], b[2], d[0], d[1], d[2], e[0], e[1], e[2]);
function box(c, x0, y0, z0, x1, y1, z1) {
  const p = (x, y, z) => [x ? x1 : x0, y ? y1 : y0, z ? z1 : z0];
  Q(c, p(0, 0, 1), p(1, 0, 1), p(1, 1, 1), p(0, 1, 1)); Q(c, p(1, 0, 0), p(0, 0, 0), p(0, 1, 0), p(1, 1, 0));
  Q(c, p(1, 0, 1), p(1, 0, 0), p(1, 1, 0), p(1, 1, 1)); Q(c, p(0, 0, 0), p(0, 0, 1), p(0, 1, 1), p(0, 1, 0));
  Q(c, p(0, 1, 1), p(1, 1, 1), p(1, 1, 0), p(0, 1, 0)); Q(c, p(0, 0, 0), p(1, 0, 0), p(1, 0, 1), p(0, 0, 1));
}
function lathe(c, prof, n, axis = "y", off = 0) {
  c.smooth();
  const P = (r, h, q) => axis === "y" ? [Math.cos(q) * r, h, Math.sin(q) * r] : [h, off + Math.cos(q) * r, Math.sin(q) * r];
  for (let j = 0; j < prof.length - 1; j++) for (let i = 0; i < n; i++) {
    const q0 = (i / n) * Math.PI * 2, q1 = ((i + 1) / n) * Math.PI * 2;
    const a = P(prof[j][0], prof[j][1], q0), b = P(prof[j + 1][0], prof[j + 1][1], q0), d = P(prof[j + 1][0], prof[j + 1][1], q1), e = P(prof[j][0], prof[j][1], q1);
    if (axis === "y") Q(c, a, b, d, e); else Q(c, a, e, d, b);
  }
  c.flat();
}
const band = (c, y, r, n, h = 0.035) => lathe(c, [[r, y - h / 2], [r, y + h / 2]], n);
export function geometry(ctx) {
  const L = ctx.lod, n = L <= 1 ? 16 : L <= 3 ? 10 : 6;
  const BODY = [[0.1, 0.62], [0.22, 0.68], [0.28, 0.85], [0.3, 1.05], [0.28, 1.28], [0.2, 1.41], [0.09, 1.47]];
  const HEAD = [[0.04, 1.45], [0.13, 1.5], [0.17, 1.6], [0.16, 1.7], [0.1, 1.77], [0.0, 1.8]];
  ctx.albedo("cdn/texture-dark-oak-planks-weathered.png"); ctx.color("oklch(0.93 0.02 70)");
  box(ctx, -0.45, 0, -0.07, 0.45, 0.1, 0.07); box(ctx, -0.07, 0, -0.45, 0.07, 0.1, 0.45);
  box(ctx, -0.06, 0.1, -0.06, 0.06, 1.5, 0.06);
  ctx.albedo("cdn/texture-straw-hay-bundled.png"); ctx.color("oklch(0.97 0.03 90)");
  lathe(ctx, BODY, n);
  lathe(ctx, [[0.065, -0.52], [0.075, -0.4], [0.075, 0.4], [0.065, 0.52]], L <= 1 ? 10 : 6, "x", 1.27);
  ctx.albedo("cdn/texture-burlap-sack.png"); ctx.color("oklch(0.95 0.03 80)");
  lathe(ctx, HEAD, n);
  if (L <= 2) {
    ctx.albedo(null); ctx.color("oklch(0.55 0.05 70)");
    band(ctx, 0.8, 0.29, n); band(ctx, 1.06, 0.31, n); band(ctx, 1.34, 0.255, n); band(ctx, 1.475, 0.1, n, 0.03);
    for (const s of [-1, 1]) lathe(ctx, [[0.082, s * 0.42 - 0.02], [0.082, s * 0.42 + 0.02]], 8, "x", 1.27);
    // target patch on the chest, front -Z
    ctx.color("#a8452e"); const cy = 1.1, z = -0.305, R = 0.11;
    for (let i = 0; i < 12; i++) { const a = (i / 12) * 6.283, b = ((i + 1) / 12) * 6.283; ctx.tri(0, cy, z, Math.cos(b) * R, cy + Math.sin(b) * R, z, Math.cos(a) * R, cy + Math.sin(a) * R, z); }
    ctx.color("#c9a45a"); const r2 = 0.045;
    for (let i = 0; i < 10; i++) { const a = (i / 10) * 6.283, b = ((i + 1) / 10) * 6.283; ctx.tri(0, cy, z - 0.004, Math.cos(b) * r2, cy + Math.sin(b) * r2, z - 0.004, Math.cos(a) * r2, cy + Math.sin(a) * r2, z - 0.004); }
  }
  if (L <= 1) { // straw tufts out of the arm ends and skirt
    ctx.albedo(null); ctx.color("oklch(0.8 0.1 85)");
    for (let i = 0; i < 18; i++) {
      const s = i % 2 ? 1 : -1, a = i * 2.4, dy = Math.sin(a) * 0.05, dz = Math.cos(a) * 0.05;
      ctx.quad(s * 0.5, 1.27 + dy, dz - 0.01, s * 0.62, 1.27 + dy * 2.2, dz * 2.2 - 0.01, s * 0.62, 1.27 + dy * 2.2, dz * 2.2 + 0.01, s * 0.5, 1.27 + dy, dz + 0.01);
    }
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * 6.283, c = Math.cos(a), s = Math.sin(a), l = 0.07 + (i % 3) * 0.02;
      ctx.quad(c * 0.1 - s * 0.012, 0.63, s * 0.1 + c * 0.012, c * 0.1 + s * 0.012, 0.63, s * 0.1 - c * 0.012, c * (0.14 + l * 0.5), 0.63 - l, s * (0.14 + l * 0.5), c * (0.14 + l * 0.5), 0.63 - l, s * (0.14 + l * 0.5));
    }
  }
  ctx.albedo(null); ctx.color(null);
}
export function collider() { return { kind: "capsule", radius: 0.5, halfHeight: 0.4, center: [0, 0.9, 0] }; }
