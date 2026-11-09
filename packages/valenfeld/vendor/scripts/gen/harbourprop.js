// GULLHAVEN's dockside props, params.kind: netrack (params.l length) with a net draped to dry, fishframe
// (rails of hanging split fish under a plank cap), rowboat (upturned on chocks, oars beside), pots (params.n
// lobster pots stacked with a rope coil and a buoy), sign (an inn's hanging sign: iron bracket out along
// local -z from a wall at z 0, gull painted on both faces), brazier (iron tripod and bowl of coals).
import { paint, flatc, glow, BX, RB, LA, CY, SEG, PIPE, PATH, ROPE, TORUS, LOFT, CB, OAK, IR, NET, TAR, DRIFT, WOOD, IRONC, DRIFTC } from "../lib/buildkit.js";
import { rng } from "../lib/geo.js";
import { brazier_harbourprop as brazier } from "../lib/pieces/brazier.js";   // the shared brazier pieces
function netrack(c, D, p) {
  const l = p.l ?? 5, h = l / 2, R = rng(p.seed ?? 3);
  paint(c, DRIFT, DRIFTC);
  for (const x of [-h, 0, h]) for (const s of [-1, 1]) SEG(c, [x, -0.1, s * 0.75], [x, 2.42, 0], 0.11, 0.11);
  PIPE(c, [-h - 0.25, 2.38, 0], [h + 0.25, 2.38, 0], 0.065, 0.065, 6);
  const nx = D <= 2 ? 16 : 4, rows = [];
  for (let i = 0; i <= nx; i++) { const x = -h + 0.12 + (l - 0.24) * i / nx, f = ((x + h) / h) % 1, sag = Math.sin(Math.PI * f) * 0.28, w1 = (R() - 0.5) * 0.18, w2 = (R() - 0.5) * 0.18;
    rows.push([[x, 0.5 + sag + w1, -0.82], [x, 1.5 + sag * 0.4, -0.45], [x, 2.36, -0.08], [x, 2.47, 0], [x, 2.36, 0.08], [x, 1.45 + sag * 0.4, 0.42], [x, 0.62 + sag + w2, 0.78]]); }
  paint(c, NET, "oklch(0.8 0.04 70)"); LOFT(c, rows);
  if (D <= 2) { flatc(c, "oklch(0.7 0.07 65)"); for (let i = 0; i <= nx; i += 2) for (const k of [0, 6]) { const [x, y, z] = rows[i][k]; CY(c, x, y - 0.06, z, 0.065, 0.12, 6); } }
}
function fishframe(c, D, p) {
  const w = 1.6, R = rng(p.seed ?? 5);
  paint(c, DRIFT, DRIFTC); for (const x of [-w, w]) for (const z of [-0.35, 0.35]) BX(c, x - 0.07, 0, z - 0.07, x + 0.07, 2.45, z + 0.07);
  for (const z of [-0.35, 0.35]) SEG(c, [-w, 2.4, z], [w, 2.4, z], 0.1, 0.1);
  if (D <= 2) { paint(c, TAR, "oklch(0.9 0.01 60)"); RB(c, 0, 2.62, -0.28, 3.7, 0.05, 0.75, 0, -22); RB(c, 0, 2.62, 0.28, 3.7, 0.05, 0.75, 0, 22); }
  paint(c, DRIFT, "oklch(0.82 0.02 65)"); const rails = [2.2, 1.65, 1.1]; for (const y of rails) PIPE(c, [-w, y, 0], [w, y, 0], 0.035, 0.035, 5);
  const n = D <= 1 ? 11 : D <= 2 ? 7 : 0;
  if (n) { const fish = (col, pick) => { flatc(c, col); for (const y0 of rails) for (let i = 0; i < n; i++) { if ((R() < 0.4) !== pick) continue; const x = -w + 0.2 + (2 * w - 0.4) * (i + 0.5) / n + (R() - 0.5) * 0.08, z = (R() - 0.5) * 0.06, s = 0.85 + R() * 0.3, y = y0 - 0.04;
        c.quad(x, y, z, x - 0.075 * s, y - 0.2 * s, z, x, y - 0.42 * s, z, x + 0.075 * s, y - 0.2 * s, z);
        c.tri(x, y - 0.4 * s, z, x - 0.07 * s, y - 0.5 * s, z, x + 0.07 * s, y - 0.5 * s, z); } };
    fish("oklch(0.7 0.035 75)", false); fish("oklch(0.6 0.04 55)", true); }
  else { flatc(c, "oklch(0.66 0.035 70)"); for (const y of rails) BX(c, -w + 0.15, y - 0.45, -0.02, w - 0.15, y - 0.05, 0.02); }
}
function rowboat(c, D, p) {
  const Lh = 2.1, Bh = 0.72, N = D <= 2 ? 12 : 5, ts = []; for (let i = 0; i <= N; i++) ts.push(-1 + 2 * i / N);
  const Bt = (t) => Bh * Math.sqrt(Math.max(0, 1 - Math.pow(Math.abs(t), 2.2))), G = (t) => 0.6 + 0.15 * t * t;
  const S = (t, u) => [t * Lh, 0.9 - G(t) * (1 - u), Math.max(0.05, Bt(t) * (1 - Math.pow(u, 1.8)))];
  const band = (u0, u1, m) => { for (const s of [-1, 1]) LOFT(c, ts.map((t) => { const r = []; for (let k = 0; k <= m; k++) { const [x, y, w] = S(t, u0 + (u1 - u0) * k / m); r.push([x, y, s * w]); } return r; })); };
  paint(c, OAK, p.col ?? "oklch(0.62 0.12 35)"); band(0, 0.22, 1);
  paint(c, TAR, "oklch(0.88 0.01 60)"); band(0.22, 1, D <= 2 ? 3 : 1);
  paint(c, OAK, "oklch(0.7 0.03 50)"); SEG(c, [-Lh - 0.05, 0.3, 0], [Lh + 0.05, 0.3, 0].map((v, i) => i === 1 ? 0.3 : v), 0.01, 0.01);
  SEG(c, [-Lh, 0.92, 0], [Lh, 0.92, 0], 0.09, 0.07);
  if (D <= 3) { paint(c, DRIFT, DRIFTC); for (const x of [-1.1, 1.1]) PIPE(c, [x, 0.1, -0.8], [x, 0.1, 0.8], 0.11, 0.11, 6); }
  if (D <= 2) { paint(c, DRIFT, "oklch(0.85 0.03 70)"); for (const z of [1.0, 1.15]) { SEG(c, [-1.4, 0.04, z], [1.1, 0.04, z + 0.05], 0.05, 0.05); RB(c, 1.35, 0.03, z + 0.06, 0.55, 0.02, 0.16); } }
}
function pot(c, D, x, y, z, yaw) {
  const cs = Math.cos(yaw * Math.PI / 180), sn = Math.sin(yaw * Math.PI / 180), T = (a, b, h) => [x + a * cs + b * sn, y + h, z - a * sn + b * cs];
  paint(c, OAK, "oklch(0.75 0.04 60)"); RB(c, x, y + 0.03, z, 0.72, 0.06, 0.46, yaw);
  const n = D <= 2 ? 8 : 4, arch = (a, k) => { const r = []; for (let i = 0; i <= n; i++) { const t = Math.PI * i / n; r.push(T(a, Math.cos(t) * 0.22 * k, 0.06 + Math.sin(t) * 0.3 * k)); } return r; };
  if (D <= 2) for (const a of [-0.33, 0, 0.33]) PATH(c, arch(a, 1.02), 0.018, 4);
  paint(c, NET, "oklch(0.75 0.05 75)"); LOFT(c, [arch(-0.34, 1), arch(0.34, 1)]);
  for (const a of [-0.34, 0.34]) { const r = arch(a, 1), ctr = T(a, 0, 0.06); for (let i = 0; i < r.length - 1; i++) c.tri(...ctr, ...r[i], ...r[i + 1]); }
}
function pots(c, D, p) {
  const n = p.n ?? 4, R = rng(p.seed ?? 9), spots = [[-0.4, 0, 0], [0.4, 0, 0.06], [0, 0, 0.55], [0.02, 0.37, 0.03], [-0.4, 0, 1.0]];
  for (let i = 0; i < Math.min(n, spots.length); i++) { const [x, y, z] = spots[i]; pot(c, D, x, y, z, (R() - 0.5) * 30); }
  if (D <= 2) { flatc(c, "oklch(0.62 0.05 75)"); for (let i = 0; i < 3; i++) TORUS(c, 0.95, 0.06 + i * 0.07, 0.7, 0.3 - i * 0.04, 0.045, 12, 4);
    flatc(c, "oklch(0.58 0.15 30)"); LA(c, -0.9, 0, 0.55, [[0.01, 0], [0.16, 0.05], [0.18, 0.18], [0.12, 0.33], [0.01, 0.38]], 8, true);
    flatc(c, "oklch(0.92 0.02 90)"); LA(c, -0.9, 0.15, 0.55, [[0.185, 0], [0.185, 0.07]], 8, false); }
}
function sign(c, D) {
  paint(c, IR, IRONC); BX(c, -0.035, 3.48, -1.55, 0.035, 3.56, 0.02); SEG(c, [0, 2.75, -0.02], [0, 3.5, -0.95], 0.05, 0.05);
  BX(c, -0.1, 2.6, -0.04, 0.1, 3.7, 0.02);
  if (D <= 2) { LA(c, 0, 3.47, -1.55, [[0.05, 0], [0.05, 0.1]], 6, true); for (const z of [-1.3, -0.4]) { BX(c, -0.012, 3.24, z - 0.012, 0.012, 3.48, z + 0.012); } }
  paint(c, OAK, "oklch(0.62 0.05 40)"); BX(c, -0.04, 2.35, -1.38, 0.04, 3.24, -0.32);
  flatc(c, "oklch(0.72 0.11 85)"); for (const [z0, z1, y0, y1] of [[-1.42, -0.28, 3.2, 3.27], [-1.42, -0.28, 2.32, 2.39], [-1.42, -1.35, 2.32, 3.27], [-0.35, -0.28, 2.32, 3.27]]) BX(c, -0.055, y0, z0, 0.055, y1, z1);
  for (const x of [-0.047, 0.047]) { // the gull, white on the board's both faces
    flatc(c, "oklch(0.96 0.01 90)"); const g = [[-0.85, 2.82], [-1.25, 3.06], [-1.02, 2.86], [-0.45, 3.06], [-0.68, 2.86], [-0.97, 2.8], [-0.73, 2.8], [-0.85, 2.7]];
    const P = (i) => [x, g[i][1], g[i][0]]; c.tri(...P(0), ...P(1), ...P(2)); c.tri(...P(0), ...P(4), ...P(3)); c.tri(...P(5), ...P(6), ...P(7)); c.tri(...P(5), ...P(0), ...P(6));
    flatc(c, "oklch(0.75 0.03 230)"); c.quad(x, 2.58, -1.12, x, 2.52, -0.85, x, 2.58, -0.58, x, 2.64, -0.85); c.tri(x, 2.58, -0.58, x, 2.64, -0.5, x, 2.52, -0.5); }
}
export function geometry(c) { const p = c.params, D = c.lod, k = p.kind;
  if (k === "netrack") netrack(c, D, p); else if (k === "fishframe") fishframe(c, D, p); else if (k === "rowboat") rowboat(c, D, p);
  else if (k === "pots") pots(c, D, p); else if (k === "sign") sign(c, D); else brazier(c, D); }
export function collider(c) { const p = c.params, k = p.kind, b = CB();
  if (k === "netrack") { const h = (p.l ?? 5) / 2; b(-h, 0, -0.75, h, 2.4, 0.75); }
  else if (k === "fishframe") b(-1.7, 0, -0.4, 1.7, 2.5, 0.4);
  else if (k === "rowboat") b(-2.1, 0, -0.72, 2.1, 0.92, 0.72);
  else if (k === "pots") b(-0.8, 0, -0.25, 0.8, 0.7, 1.25);
  else if (k === "brazier") b(-0.45, 0, -0.45, 0.45, 1.15, 0.45);
  else return []; return b.list; }
