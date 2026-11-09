// Shared emitters for the barrow's scripted geometry: boxes, rocks, tubes, webs, skeletons.
// Every face is wound outward from a given inside point, through a stack of local transforms.
const D = Math.PI / 180;
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
export function xf(tx, ty, tz, yaw = 0, pitch = 0, roll = 0) {
  const cy = Math.cos(yaw * D), sy = Math.sin(yaw * D), cp = Math.cos(pitch * D), sp = Math.sin(pitch * D), cr = Math.cos(roll * D), sr = Math.sin(roll * D);
  return (x, y, z) => {
    const x1 = x * cr - y * sr, y1 = x * sr + y * cr;
    const y2 = y1 * cp - z * sp, z2 = y1 * sp + z * cp;
    return [x1 * cy + z2 * sy + tx, y2 + ty, -x1 * sy + z2 * cy + tz];
  };
}
export function kit(ctx, col) {
  const K = { col };
  K.map = (x, y, z) => [x, y, z];
  K.at = (fn, tx, ty, tz, yaw = 0, pitch = 0, roll = 0) => {
    const prev = K.map, m = xf(tx, ty, tz, yaw, pitch, roll);
    K.map = (x, y, z) => { const p = m(x, y, z); return prev(p[0], p[1], p[2]); };
    fn(); K.map = prev;
  };
  K.paint = (tex, css, rough = 0.9, metal = 0) => {
    if (col) return;
    ctx.albedo(tex || null); ctx.color(css || "#ffffff"); ctx.roughness(rough); ctx.metalness(metal); ctx.emissive(null);
  };
  K.quad = (a, b, c, d, inside) => {
    const A = K.map(...a), B = K.map(...b), C = K.map(...c), E = K.map(...d);
    if (inside) {
      const I = K.map(...inside), n = cross(sub(C, A), sub(E, B));
      const m = [(A[0] + C[0]) / 2 - I[0], (A[1] + C[1]) / 2 - I[1], (A[2] + C[2]) / 2 - I[2]];
      if (dot(n, m) < 0) { ctx.quad(...A, ...E, ...C, ...B); return; }
    }
    ctx.quad(...A, ...B, ...C, ...E);
  };
  K.tri = (a, b, c, inside) => {
    const A = K.map(...a), B = K.map(...b), C = K.map(...c);
    if (inside) {
      const I = K.map(...inside), n = cross(sub(B, A), sub(C, A));
      const m = [(A[0] + B[0] + C[0]) / 3 - I[0], (A[1] + B[1] + C[1]) / 3 - I[1], (A[2] + B[2] + C[2]) / 3 - I[2]];
      if (dot(n, m) < 0) { ctx.tri(...A, ...C, ...B); return; }
    }
    ctx.tri(...A, ...B, ...C);
  };
  K.box = (x0, y0, z0, x1, y1, z1) => {
    const I = [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2], q = K.quad;
    q([x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], I);
    q([x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1], I);
    q([x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], I);
    q([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], I);
    q([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], I);
    q([x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0], I);
  };
  // a box with chamfered-looking edges: three crossed boxes, each inset b on two axes
  K.bbox = (x0, y0, z0, x1, y1, z1, b = 0.03) => {
    if (col || ctx.lod > 2) return K.box(x0, y0, z0, x1, y1, z1);
    K.box(x0, y0 + b, z0 + b, x1, y1 - b, z1 - b);
    K.box(x0 + b, y0, z0 + b, x1 - b, y1, z1 - b);
    K.box(x0 + b, y0 + b, z0, x1 - b, y1 - b, z1);
  };
  K.rock = (cx, cy, cz, rx, ry, rz, seg = 7, rings = 5, j = 0.22) => {
    if (col) return K.box(cx - rx * 0.85, cy - ry * 0.85, cz - rz * 0.85, cx + rx * 0.85, cy + ry * 0.85, cz + rz * 0.85);
    if (ctx.lod >= 3) { seg = Math.max(5, seg - 2); rings = Math.max(3, rings - 1); }
    const P = [];
    for (let i = 0; i <= rings; i++) {
      const ph = -Math.PI / 2 + (Math.PI * i) / rings, row = [];
      for (let k = 0; k < seg; k++) {
        const th = (2 * Math.PI * k) / seg, s = 1 + j * (ctx.random() * 2 - 1);
        const p = [cx + rx * Math.cos(ph) * Math.cos(th) * s, cy + ry * Math.sin(ph) * s, cz + rz * Math.cos(ph) * Math.sin(th) * s];
        row.push(i === 0 || i === rings ? null : p);
      }
      P.push(row);
    }
    const bot = [cx, cy - ry * (1 - j * 0.5), cz], top = [cx, cy + ry * (1 + j * (ctx.random() - 0.5)), cz], I = [cx, cy, cz];
    for (let i = 1; i < rings - 1; i++) for (let k = 0; k < seg; k++) { const n = (k + 1) % seg; K.quad(P[i][k], P[i][n], P[i + 1][n], P[i + 1][k], I); }
    for (let k = 0; k < seg; k++) { const n = (k + 1) % seg; K.tri(bot, P[1][k], P[1][n], I); K.tri(top, P[rings - 1][k], P[rings - 1][n], I); }
  };
  // a frustum between two points, any direction
  K.seg = (p, q, r0, r1, n = 6, caps = false) => {
    const a = norm(sub(q, p)), up = Math.abs(a[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
    const u = norm(cross(a, up)), v = cross(a, u);
    const ring = (c, r) => { const o = []; for (let k = 0; k < n; k++) { const t = (2 * Math.PI * k) / n; o.push([c[0] + (u[0] * Math.cos(t) + v[0] * Math.sin(t)) * r, c[1] + (u[1] * Math.cos(t) + v[1] * Math.sin(t)) * r, c[2] + (u[2] * Math.cos(t) + v[2] * Math.sin(t)) * r]); } return o; };
    const A = ring(p, r0), B = ring(q, r1), I = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2, (p[2] + q[2]) / 2];
    for (let k = 0; k < n; k++) { const m = (k + 1) % n; K.quad(A[k], A[m], B[m], B[k], I); }
    if (caps) for (let k = 0; k < n; k++) { const m = (k + 1) % n; K.tri(p, A[k], A[m], I); K.tri(q, B[k], B[m], I); }
  };
  K.cyl = (cx, y0, cz, r0, r1, h, n = 8) => K.seg([cx, y0, cz], [cx, y0 + h, cz], r0, r1, n, true);
  // a hanging root: a wandering taper down from (x, y, z)
  K.root = (x, y, z, len) => {
    let p = [x, y + 0.05, z], r = 0.045;
    const steps = 4;
    for (let i = 0; i < steps; i++) {
      const q = [p[0] + (ctx.random() - 0.5) * 0.25, p[1] - len / steps, p[2] + (ctx.random() - 0.5) * 0.25];
      const r1 = r * 0.62; K.seg(p, q, r, r1, 5); p = q; r = r1;
    }
  };
  // a cobweb in a corner: o the corner, u and v the two edges it spans
  K.web = (o, u, v, size) => {
    if (col || ctx.lod > 2) return;
    ctx.albedo(null); ctx.color("#e8e6df", 0.42); ctx.roughness(1); ctx.metalness(0);
    const nrm = norm(cross(u, v)), w = 0.008, R = 6, rings = 5;
    const pt = (t, s) => { const c = Math.cos(t), sn = Math.sin(t); return [o[0] + (u[0] * c + v[0] * sn) * s, o[1] + (u[1] * c + v[1] * sn) * s, o[2] + (u[2] * c + v[2] * sn) * s]; };
    const strip = (a, b) => {
      const d = norm(sub(b, a)), side = cross(d, nrm).map((e) => e * w);
      K.quad([a[0] - side[0], a[1] - side[1], a[2] - side[2]], [a[0] + side[0], a[1] + side[1], a[2] + side[2]], [b[0] + side[0], b[1] + side[1], b[2] + side[2]], [b[0] - side[0], b[1] - side[1], b[2] - side[2]]);
    };
    const ang = (k) => (Math.PI / 2) * (k / R);
    for (let k = 0; k <= R; k++) strip(o, pt(ang(k), size * (0.85 + ctx.random() * 0.15)));
    for (let m = 1; m <= rings; m++) { const s = (size * m) / (rings + 0.6); for (let k = 0; k < R; k++) strip(pt(ang(k), s), pt(ang(k + 1), s * (0.9 + ctx.random() * 0.08))); }
  };
  // a skeleton lying on its back, skull toward -z, on y = 0 of the current frame
  K.skeleton = (partial = false) => {
    if (col) return;
    ctx.albedo(null); ctx.color("#d8cdb0"); ctx.roughness(0.85); ctx.metalness(0);
    const b = (p, q, r = 0.02) => K.seg(p, q, r, r * 0.85, 5, true);
    K.rock(0, 0.1, -0.8, 0.095, 0.09, 0.115, 8, 6, 0.05);
    ctx.color("#1f1b16"); K.box(-0.05, 0.1, -0.9, -0.015, 0.14, -0.885); K.box(0.015, 0.1, -0.9, 0.05, 0.14, -0.885);
    ctx.color("#d8cdb0"); K.box(-0.045, 0.01, -0.86, 0.045, 0.04, -0.72);
    if (!partial) {
      b([0, 0.05, -0.64], [0, 0.05, 0.05], 0.022);
      for (let k = 0; k < 5; k++) { const z = -0.56 + k * 0.1, sp = 0.14 - k * 0.008; for (const s of [-1, 1]) { b([0, 0.06, z], [s * sp, 0.11, z + 0.02], 0.011); b([s * sp, 0.11, z + 0.02], [s * (sp - 0.03), 0.02, z + 0.06], 0.01); } }
      K.rock(0, 0.06, 0.1, 0.13, 0.055, 0.08, 6, 4, 0.15);
    }
    for (const s of [-1, 1]) {
      const fx = ctx.random() * 0.06;
      b([s * 0.18, 0.04, -0.56], [s * (0.21 + fx), 0.03, -0.26]); b([s * (0.21 + fx), 0.03, -0.26], [s * 0.15, 0.03, 0.04], 0.016);
      b([s * 0.08, 0.04, 0.16], [s * (0.1 + fx), 0.04, 0.56], 0.026); b([s * (0.1 + fx), 0.04, 0.56], [s * 0.11, 0.03, 0.92], 0.02);
    }
  };
  return K;
}
