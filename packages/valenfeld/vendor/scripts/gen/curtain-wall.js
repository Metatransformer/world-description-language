// A castle curtain wall along a polyline, built from the Valenfeld kit's fieldstone: battered footing, buttresses on the
// outer face, a string course, a wall walk, crenellated outer parapet, a low inner parapet, and square towers at the corners.
// params: { pts: [[x, groundY, z]…] local to the feet, H: wall height, T: thickness, towers: true, steps?: per pts-segment [[uEnd, groundY, baseY]…] for a level-stepped top }
import { paint, HX, BX, FS, FLAG, STONE } from "../lib/buildkit.js";
const STONE2 = "oklch(0.82 0.015 80)", STONE3 = "oklch(0.66 0.02 75)", MOSS = "oklch(0.6 0.05 125)";
export function geometry(ctx) {
  const c = ctx, L = ctx.lod ?? 1, p = ctx.params ?? {}, pts = p.pts ?? [], H = p.H ?? 7, T = p.T ?? 2.2;
  if (pts.length < 2) return;
  let cx = 0, cz = 0; for (const q of pts) { cx += q[0]; cz += q[2]; } cx /= pts.length; cz /= pts.length;
  const segs = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const A = pts[i], B = pts[i + 1], dx = B[0] - A[0], dz = B[2] - A[2], len = Math.hypot(dx, dz); if (len < 0.2) continue;
    const d = [dx / len, dz / len], n = [-d[1], d[0]], mx = (A[0] + B[0]) / 2, mz = (A[2] + B[2]) / 2;
    const s = ((mx - cx) * n[0] + (mz - cz) * n[1]) > 0 ? 1 : -1;     // +1: the frame's +v points out of the ward
    const st = p.steps?.[i];   // stepped run: [[uEnd, groundY, baseY]…] along A→B, each piece level-topped, base sunk into the hill
    if (st?.length) { let u0 = 0;
      for (const [u1, gy, by] of st) { const a = [A[0] + d[0] * u0, gy, A[2] + d[1] * u0], b = [A[0] + d[0] * u1, gy, A[2] + d[1] * u1];
        segs.push({ A: a, B: b, d, n, len: u1 - u0, s, base: by, ya: gy, yb: gy }); u0 = u1; }
    } else segs.push({ A, B, d, n, len, s, base: Math.min(A[1], B[1]) - 2.5, ya: A[1], yb: B[1] });
  }
  // a hexahedron in a segment's frame: u along A→B, v across, y up; the top may slope from ua to ub
  const P = (g, u, v, y) => [g.A[0] + g.d[0] * u + g.n[0] * v, y, g.A[2] + g.d[1] * u + g.n[1] * v];
  const OB = (g, u0, u1, v0, v1, y0, y1a, y1b = y1a, y0b = y0) => { if (v0 > v1) [v0, v1] = [v1, v0];
    HX(c, [P(g, u0, v0, y0), P(g, u1, v0, y0b), P(g, u1, v1, y0b), P(g, u0, v1, y0), P(g, u0, v0, y1a), P(g, u1, v0, y1b), P(g, u1, v1, y1b), P(g, u0, v1, y1a)]); };
  for (const g of segs) {
    const ta = g.ya + H, tb = g.yb + H, top = (u) => ta + (tb - ta) * u / g.len, o = g.s * T / 2, ext = T * 0.5;   // ext: run into the neighbour so corners close
    // footing: a battered course, wider at the bottom
    paint(c, FS, STONE3);
    HX(c, [P(g, -ext, -T / 2 - 0.7, g.base), P(g, g.len + ext, -T / 2 - 0.7, g.base), P(g, g.len + ext, T / 2 + 0.7, g.base), P(g, -ext, T / 2 + 0.7, g.base),
           P(g, -ext, -T / 2 - 0.15, g.ya + 1.1), P(g, g.len + ext, -T / 2 - 0.15, g.yb + 1.1), P(g, g.len + ext, T / 2 + 0.15, g.yb + 1.1), P(g, -ext, T / 2 + 0.15, g.ya + 1.1)]);
    // the body
    paint(c, FS, STONE); OB(g, -ext, g.len + ext, -T / 2, T / 2, g.base, ta, tb);
    // string course two thirds up, proud of both faces
    paint(c, FS, STONE2); OB(g, -ext, g.len + ext, -T / 2 - 0.14, T / 2 + 0.14, g.ya + H * 0.62, g.ya + H * 0.62 + 0.28, g.yb + H * 0.62 + 0.28, g.yb + H * 0.62);
    // wall walk flags
    paint(c, FLAG, STONE3); OB(g, -ext, g.len + ext, -T / 2 + 0.5, T / 2 - 0.5, ta - 0.02, ta + 0.04, tb + 0.04, tb - 0.02);
    // buttresses on the outer face, sloped caps
    if (L <= 3) { paint(c, FS, STONE3); const nb = Math.floor(g.len / 7);
      for (let k = 1; k <= nb; k++) { const u = g.len * k / (nb + 1), y1 = top(u) - 1.6, w = 0.7;
        HX(c, [P(g, u - w, o, g.base), P(g, u + w, o, g.base), P(g, u + w, o + g.s * 1.1, g.base), P(g, u - w, o + g.s * 1.1, g.base),
               P(g, u - w, o, y1), P(g, u + w, o, y1), P(g, u + w, o + g.s * 0.15, y1 - 1.4), P(g, u - w, o + g.s * 0.15, y1 - 1.4)].map((q, i) => q)); } }
    // outer parapet with merlons, coped; inner low parapet
    paint(c, FS, STONE2); const pv0 = o - g.s * 0.5, pv1 = o;
    OB(g, -ext, g.len + ext, pv0, pv1, ta, ta + 0.95, tb + 0.95, tb);
    const nm = Math.max(1, Math.round(g.len / 1.7));
    for (let k = 0; k < nm; k++) { const u0 = g.len * k / nm + 0.25, u1 = g.len * (k + 0.55) / nm + 0.25, y = top((u0 + u1) / 2) + 0.95;
      paint(c, FS, STONE2); OB(g, u0, u1, pv0, pv1, y - 0.02, y + 0.95);
      if (L <= 2) { paint(c, FS, STONE3); OB(g, u0 - 0.06, u1 + 0.06, pv0 - g.s * 0.07, pv1 + g.s * 0.07, y + 0.95, y + 1.08); } }
    paint(c, FS, STONE2); OB(g, -ext, g.len + ext, -o, -o + g.s * 0.4, ta, ta + 0.55, tb + 0.55, tb);
    // damp and moss at the foot of the outer face
    if (L <= 2) { paint(c, FS, MOSS); OB(g, 0, g.len, o, o + g.s * 0.03, g.base + 2.4, g.ya + 1.5, g.yb + 1.5); }
  }
  // corner towers where the line turns
  if (p.towers !== false) for (let i = 1; i < segs.length; i++) { const a = segs[i - 1], b = segs[i];
    if (a.d[0] * b.d[0] + a.d[1] * b.d[1] > 0.7) continue;
    const [x, gy, z] = b.A, r = 2.6, y0 = Math.min(a.base, b.base), y1 = gy + H + 3;
    paint(c, FS, STONE3); BX(c, x - r - 0.5, y0, z - r - 0.5, x + r + 0.5, gy + 1.4, z + r + 0.5);
    paint(c, FS, STONE); BX(c, x - r, y0, z - r, x + r, y1, z + r);
    paint(c, FS, STONE2); BX(c, x - r - 0.25, y1 - 0.3, z - r - 0.25, x + r + 0.25, y1, z + r + 0.25);
    BX(c, x - r - 0.15, gy + H * 0.62, z - r - 0.15, x + r + 0.15, gy + H * 0.62 + 0.28, z + r + 0.15);
    for (let k = 0; k < 4; k++) for (let j = 0; j < 3; j++) { const t = -r + 0.15 + j * (2 * r - 0.3) / 2.5, w = 0.9;
      const [mx0, mz0, mx1, mz1] = k === 0 ? [x + t, z - r - 0.25, x + t + w, z - r + 0.35] : k === 1 ? [x + t, z + r - 0.35, x + t + w, z + r + 0.25] : k === 2 ? [x - r - 0.25, z + t, x - r + 0.35, z + t + w] : [x + r - 0.35, z + t, x + r + 0.25, z + t + w];
      BX(c, mx0, y1, mz0, mx1, y1 + 1.1, mz1); }
    paint(c, FLAG, STONE3); BX(c, x - r + 0.3, y1 - 0.02, z - r + 0.3, x + r - 0.3, y1 + 0.04, z + r - 0.3);
    if (L <= 2) { c.albedo(null); c.color("#15120f"); c.emissive(null);   // arrow slits on all four faces
      for (const [sx, sz] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) { const hx = sx ? 0.04 : 0.09, hz = sz ? 0.04 : 0.09, fx = x + sx * (r + 0.01), fz = z + sz * (r + 0.01);
        BX(c, fx - hx, gy + H * 0.4, fz - hz, fx + hx, gy + H * 0.4 + 1.3, fz + hz); BX(c, fx - hx, gy + H + 0.6, fz - hz, fx + hx, gy + H + 1.9, fz + hz); } }
  }
}
