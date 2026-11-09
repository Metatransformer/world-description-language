// PIECES: banner. Each banner a hand-built generator drew, kept verbatim as a palette factory: banner_<home>(pal) hands back
// that home's banner drawing in whatever colours, textures and helpers pal carries. The home passes its own (it draws as
// it always did); a kit case or another building passes its palette to draw the same shape its way.
export function banner_crownHall(pal) {
  const { BX, GOLD, HX, IR, IRONC, NAVY, flatc, paint } = pal;
  return function banner(c, x, y, z, s, w = 1.1, h = 2.6) { // a Crown banner hanging flat on a z-facing wall (s = which way it faces)
  const z0 = z + s * 0.02, z1 = z + s * 0.06; flatc(c, NAVY); BX(c, x - w / 2, y - h, Math.min(z0, z1), x + w / 2, y, Math.max(z0, z1));
  HX(c, [[x - w / 2, y - h, Math.min(z0, z1)], [x + w / 2, y - h, Math.min(z0, z1)], [x + w / 2, y - h, Math.max(z0, z1)], [x - w / 2, y - h, Math.max(z0, z1)], [x, y - h - 0.45, Math.min(z0, z1)], [x, y - h - 0.45, Math.min(z0, z1)], [x, y - h - 0.45, Math.max(z0, z1)], [x, y - h - 0.45, Math.max(z0, z1)]]);
  const z2 = z + s * 0.08; flatc(c, GOLD); BX(c, x - w / 2, y - 0.25, Math.min(z1, z2), x + w / 2, y - 0.12, Math.max(z1, z2));
  // the crown: three points over a band
  BX(c, x - 0.3, y - 1.25, Math.min(z1, z2), x + 0.3, y - 1.1, Math.max(z1, z2)); for (const dx of [-0.25, 0, 0.25]) BX(c, x + dx - 0.05, y - 1.1, Math.min(z1, z2), x + dx + 0.05, y - (dx ? 0.85 : 0.75), Math.max(z1, z2));
  paint(c, IR, IRONC); BX(c, x - w / 2 - 0.1, y - 0.04, Math.min(z, z2) - 0.03, x + w / 2 + 0.1, y + 0.04, Math.max(z, z2) + 0.03); }
}

export function banner_fightersGuild(pal) {
  const { OCHRE, Q, TX, WHITE, Y, add, cyl, metal, mul, paint } = pal;
  return function banner(c, P, Nb, Wb, w, h, wave, emblem = true) {
  const f = (u, v) => {
    const he = h - 0.22 * h * (1 - Math.abs(2 * u - 1)) * (v > 0.8 ? 1 : 0) * ((v - 0.8) / 0.2);
    return add(add(add(P, mul(Wb, (u - 0.5) * w)), mul(Y, -v * h * (v > 0.8 ? he / h : 1))), mul(Nb, wave * Math.sin(v * 5 + u * 2.2) * (0.3 + v)));
  };
  const cols = 4, rows = 8;
  paint(c, TX.cloth, WHITE);
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const u0 = i / cols, u1 = (i + 1) / cols, v0 = j / rows, v1 = (j + 1) / rows;
    Q(c, f(u0, v1), f(u1, v1), f(u1, v0), f(u0, v0));
  }
  if (emblem) {
    paint(c, null, OCHRE);
    const g = (u, v) => add(f(u, v), mul(Nb, 0.012));
    const band = (ua, va, ub, vb, t) => { const dx = ub - ua, dy = vb - va, l = Math.hypot(dx, dy), px = (-dy / l) * t, py = (dx / l) * t; Q(c, g(ua - px, va - py), g(ub - px, vb - py), g(ub + px, vb + py), g(ua + px, va + py)); };
    band(0.08, 0.1, 0.92, 0.1, 0.025); band(0.08, 0.16, 0.92, 0.16, 0.012);
    band(0.25, 0.28, 0.75, 0.62, 0.035); band(0.75, 0.28, 0.25, 0.62, 0.035);
    Q(c, g(0.5, 0.36), g(0.6, 0.45), g(0.5, 0.56), g(0.4, 0.45));
  }
  paint(c, TX.iron, "oklch(0.8 0.01 240)"); metal(c, true);
  cyl(c, add(add(P, mul(Wb, -(w / 2 + 0.08))), mul(Y, 0.03)), add(add(P, mul(Wb, w / 2 + 0.08)), mul(Y, 0.03)), 0.022, 6);
  metal(c, false);
}
}

export function banner_hbOldquarter(pal) {
  const { BX, CRIM, GOLD, OAK, PIPE, RED, WOOD, flatc, lion, paint } = pal;
  return function banner(c, x, z, ytop, len, D) { paint(c, RED, CRIM); BX(c, x - 0.06, ytop - len, z - 1.2, x - 0.02, ytop, z + 1.2);
  flatc(c, GOLD); BX(c, x - 0.08, ytop - len - 0.12, z - 1.2, x - 0.05, ytop - len, z + 1.2); paint(c, OAK, WOOD); PIPE(c, [x - 0.15, ytop + 0.05, z - 1.4], [x - 0.15, ytop + 0.05, z + 1.4], 0.06, 0.06, 6);
  if (D <= 2) lion(c, x - 0.06, z, ytop - len * 0.7, len * 0.32); }
}

export function banner_hbWall(pal) {
  const { BAN, GOLD, IR, IRC, LA, SEG, flatc, paint } = pal;
  return function banner(W, x, yt, z, f, w, h) { const r = [f[1], -f[0]], o = [x - r[0] * w / 2 + f[0] * 0.02, yt - h, z - r[1] * w / 2 + f[1] * 0.02];
  const P = (a, b) => [o[0] + r[0] * a, o[1] + b, o[2] + r[1] * a];
  paint(W, BAN, "oklch(1 0 0)"); W.card({ o, u: r, w, h });
  const bl = P(0, 0), br = P(w, 0), cm = P(w / 2, h * 0.14), tr = P(w, h), tl = P(0, h);
  W.tri(...bl, ...cm, ...tl); W.tri(...cm, ...tr, ...tl); W.tri(...cm, ...br, ...tr); W.card(null);
  paint(W, IR, IRC); SEG(W, [P(-0.15, h + 0.05)[0] + f[0] * 0.05, yt + 0.05, P(-0.15, h)[2] + f[1] * 0.05], [P(w + 0.15, h)[0] + f[0] * 0.05, yt + 0.05, P(w + 0.15, h)[2] + f[1] * 0.05], 0.07);
  flatc(W, GOLD); for (const a of [-0.2, w + 0.2]) { const q = P(a, h + 0.05); LA(W, q[0] + f[0] * 0.05, q[1] - 0.09, q[2] + f[1] * 0.05, [[0.001, 0], [0.09, 0.09], [0.001, 0.18]], 6); } }
}

export function banner_magesHall(pal) {
  const { CANVAS, G, PIPE, SEG, SLATE, brass, gb, gp, m } = pal;
  return function banner(c, x, z, yaw, L) {
  const g = G(x, 0, z, yaw);
  brass(c); PIPE(c, gp(g, -0.75, 6.0, 0.08), gp(g, 0.75, 6.0, 0.08), 0.03, 0.03, 6);
  m(c, CANVAS, SLATE, 0.95); c.albedo(null); c.color(SLATE);
  const rows = []; for (let i = 0; i <= 6; i++) { const t = i / 6, y = 6.0 - t * 3.0; rows.push([gp(g, -0.65, y, 0.06 + Math.sin(t * 5) * 0.02), gp(g, 0.65, y, 0.06 + Math.sin(t * 5 + 1) * 0.02)]); }
  for (let i = 0; i < 6; i++) c.quad(...rows[i][0], ...rows[i][1], ...rows[i + 1][1], ...rows[i + 1][0]);
  c.tri(...rows[6][0], ...rows[6][1], ...gp(g, 0, 2.6, 0.06));
  brass(c); // the guild's eye, in brass thread
  gb(c, g, -0.42, 4.42, 0.03, 0.42, 4.5, 0.05); gb(c, g, -0.06, 4.1, 0.03, 0.06, 4.82, 0.05);
  const eye = []; for (let k = 0; k <= 12; k++) { const a = k / 12 * 2 * Math.PI; eye.push([Math.sin(a) * 0.32, 4.46 + Math.cos(a) * 0.32]); }
  for (let k = 0; k < 12; k++) { const a = eye[k], b = eye[k + 1]; SEG(c, gp(g, a[0], a[1], 0.04), gp(g, b[0], b[1], 0.04), 0.035, 0.02); }
  for (let i = 0; i < 4; i++) gb(c, g, -0.65 + i * 0.38, 2.9, 0.03, -0.55 + i * 0.38 + 0.08, 3.0, 0.07);
}
}

export function banner_valenfeldKeep(pal) {
  const { BLUE, BX, GOLD, IR, IRONC, LA, OAK, PIPE, RED, SEG, WOOD, flatc, paint } = pal;
  return function banner(c, x, y0, z, w, h) {
  paint(c, OAK, WOOD); PIPE(c, [x - w / 2 - 0.25, y0, z + 0.25], [x + w / 2 + 0.25, y0, z + 0.25], 0.05, 0.05, 6);
  paint(c, IR, IRONC); for (const s of [-1, 1]) { SEG(c, [x + s * (w / 2 + 0.2), y0, z], [x + s * (w / 2 + 0.2), y0, z + 0.3], 0.05);
    LA(c, x + s * (w / 2 + 0.33), y0 - 0.06, z + 0.25, [[0.07, 0], [0.07, 0.12]], 6); }
  const N = 6, M = 10, zz = (u, v) => z + 0.27 + 0.06 * Math.sin(u * 5 + v * 3) * v;
  const hem = (u) => h * (1 - 0.18 * (1 - Math.abs(u - 0.5) * 2));           // swallowtail: centre shorter
  const pt = (i, j) => { const u = i / N, v = j / M; return [x - w / 2 + u * w, y0 - v * hem(u), zz(u, v)]; };
  for (let i = 0; i < N; i++) for (let j = 0; j < M; j++) {
    const u = (i + 0.5) / N, v = (j + 0.5) / M;
    const border = u < 0.12 || u > 0.88 || v < 0.06;
    const chev = Math.abs(v - (0.42 + Math.abs(u - 0.5) * -0.5 + 0.25)) < 0.07;
    flatc(c, border || chev ? GOLD : BLUE);
    c.quad(...pt(i, j), ...pt(i, j + 1), ...pt(i + 1, j + 1), ...pt(i + 1, j));
    c.quad(...pt(i + 1, j), ...pt(i + 1, j + 1), ...pt(i, j + 1), ...pt(i, j));
  }
  // the red seal: a disc on the cloth's face
  flatc(c, RED); const cy = y0 - h * 0.32, cz = zz(0.5, 0.32) + 0.03;
  for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2, b = (k + 1) / 10 * Math.PI * 2, r = w * 0.17;
    c.tri(x, cy, cz, x + Math.cos(a) * r, cy + Math.sin(a) * r, cz, x + Math.cos(b) * r, cy + Math.sin(b) * r, cz); }
  flatc(c, GOLD); BX(c, x - 0.04, cy - 0.12, cz, x + 0.04, cy + 0.12, cz + 0.02); BX(c, x - 0.1, cy + 0.02, cz, x + 0.1, cy + 0.08, cz + 0.02);
}
}

export const STYLES = { "crown-hall": banner_crownHall, "fighters-guild": banner_fightersGuild, "hb-oldquarter": banner_hbOldquarter, "hb-wall": banner_hbWall, "mages-hall": banner_magesHall, "valenfeld-keep": banner_valenfeldKeep };
