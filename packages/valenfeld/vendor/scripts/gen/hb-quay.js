// The Riverside Quay under the Annvyr Span. params.kind:
//  quay   the stone wharf (origin = wharf top at x1097, z-500; +x toward the quay wall): jetties, cranes, warehouses, cargo,
//         two stone stairs up the quay wall to the city (params.stairs: [{ z, dir }], jetties: [z], cranes: [[x,z]], sheds: [z0])
//  barge  a moored river boat (origin = waterline centre, bow on -x); params.cog = a castled river cog
import { paint, flatc, glow, HX, BX, RB, LA, CY, SEG, PIPE, ROPE, TORUS, LOFT, BARREL, CB, OAK, IR, FLAG, CANVAS, NET, DRIFT, DRIFTC, IRONC, WOOD } from "../lib/buildkit.js";
const TEAL = "cdn/texture-teal-painted-weatherboard-planks.png", TERRA = "cdn/texture-terracotta-roof-tiles-weathered.png", TARB = "cdn/texture-tarred-planks-black.png";
const COP = "cdn/texture-verdigris-copper-roof-sheets.png", BST = "cdn/texture-grey-ashlar-stone-wall.png", ASH = "cdn/texture-ashlar-cream-limestone-two-courses-big-dressed-blocks-thin-pale-mortar-subtle-weathering.png", RED = "cdn/texture-faded-red-cloth-weave.png";
const LIT = ["oklch(0.86 0.11 72)", [2.6, 1.45, 0.5]], LAMP = ["oklch(0.9 0.12 75)", [5, 2.8, 1]];
const rnd = (s) => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
function lantern(c, x, y, z) { glow(c, ...LAMP); BX(c, x - 0.18, y, z - 0.18, x + 0.18, y + 0.45, z + 0.18); paint(c, IR, IRONC); LA(c, x, y + 0.45, z, [[0.28, 0], [0.01, 0.28]], 4, true, "y", false); BX(c, x - 0.22, y - 0.06, z - 0.22, x + 0.22, y, z + 0.22); }
function crate(c, x, y, z, s, r) { paint(c, OAK, r() < 0.5 ? "oklch(0.85 0.05 70)" : "oklch(0.75 0.06 55)"); BX(c, x - s / 2, y, z - s / 2, x + s / 2, y + s, z + s / 2);
  paint(c, OAK, "oklch(0.6 0.05 50)"); BX(c, x - s / 2 - 0.03, y + s * 0.42, z - s / 2 - 0.03, x + s / 2 + 0.03, y + s * 0.58, z + s / 2 + 0.03); }
function craneAt(c, cx, cz, lod, col, r) { paint(c, OAK, WOOD); BX(c, cx - 1.6, 0, cz - 1.6, cx + 1.6, 0.5, cz + 1.6); col && col(cx - 1.6, 0, cz - 1.6, cx + 1.6, 0.5, cz + 1.6);
    PIPE(c, [cx, 0.5, cz], [cx, 8, cz], 0.28, 0.24, 8); SEG(c, [cx + 0.6, 6.8, cz], [cx - 8, 9.3, cz], 0.32, 0.4); SEG(c, [cx, 3.2, cz], [cx - 4, 7.6, cz], 0.2);
    for (const s of [-1, 1]) SEG(c, [cx + 1.4 * s, 0.5, cz + 1.4], [cx, 5, cz], 0.18);
    TORUS(c, cx + 1.4, 2.6, cz, 2.0, 0.09, 22, 6, "x"); TORUS(c, cx + 2.2, 2.6, cz, 2.0, 0.09, 22, 6, "x");
    if (lod <= 2) for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; SEG(c, [cx + 1.8, 2.6, cz], [cx + 1.8, 2.6 + 2 * Math.sin(a), cz + 2 * Math.cos(a)], 0.08); for (const xx of [cx + 1.4, cx + 2.2]) SEG(c, [xx, 2.6 + 2 * Math.sin(a), cz + 2 * Math.cos(a)], [xx, 2.6 + 2 * Math.sin(a + 0.785), cz + 2 * Math.cos(a + 0.785)], 0.06); }
    paint(c, CANVAS, "oklch(0.75 0.04 70)"); PIPE(c, [cx - 7.9, 9.2, cz], [cx - 7.9, 3.6, cz], 0.03, 0.03, 4); crate(c, cx - 7.9, 2.6, cz, 1.0, r); }
const K = {};
// crane  one treadwheel crane standing alone on a quay edge (jib reaches over local -x)
K.crane = (c, p, lod, col) => craneAt(c, 0, 0, lod, col, rnd(p.seed ?? 3));
K.quay = (c, p, lod, col) => { const r = rnd(7), X0 = -9, X1 = 10.5, Z = p.Z ?? 120, B = p.B ?? -13;
  paint(c, BST, "oklch(0.8 0.035 75)"); BX(c, X0, B, -Z, X1, -0.15, Z); col && col(X0, B, -Z, X1, 0, Z);
  paint(c, FLAG, "oklch(0.88 0.03 75)"); BX(c, -1, -0.15, -Z, X1, 0, Z); paint(c, DRIFT, DRIFTC); BX(c, X0, -0.15, -Z, -1, 0, Z);
  if (lod <= 3) { paint(c, TARB, "oklch(0.7 0.01 60)"); for (let z = -Z + 1.5; z < Z; z += 3) BX(c, X0 - 0.3, -3.6, z - 0.15, X0, 0.35, z + 0.15); BX(c, X0 - 0.3, -0.3, -Z, X0, -0.05, Z);
    paint(c, BST, "oklch(0.55 0.05 140)"); BX(c, X0 - 0.05, -2.2, -Z, X0 + 0.02, -1.0, Z); }
  if (lod <= 2) { paint(c, IR, "oklch(0.55 0.01 250)"); for (let z = -Z + 6; z < Z; z += 12) LA(c, X0 + 0.7, 0, z, [[0.22, 0], [0.18, 0.5], [0.26, 0.6], [0.2, 0.75], [0.01, 0.78]], 8, true); }
  // jetties into the river
  for (const jz of p.jetties ?? []) { const x1 = -37; paint(c, DRIFT, DRIFTC); BX(c, x1, -0.3, jz - 2, X0, 0, jz + 2); col && col(x1, -0.4, jz - 2, X0, 0, jz + 2);
    paint(c, TARB, "oklch(0.7 0.01 60)"); for (let x = X0 - 1; x > x1; x -= 4) for (const s of [-1, 1]) PIPE(c, [x, B, jz + s * 2.1], [x, 0.5, jz + s * 2.1], 0.2, 0.18, 6);
    if (lod <= 2) for (let x = X0 - 1; x > x1 + 4; x -= 4) for (const s of [-1, 1]) SEG(c, [x, -3.4, jz + s * 2.1], [x - 4, -0.6, jz + s * 2.1], 0.12);
    paint(c, IR, IRONC); PIPE(c, [x1 + 1, 0, jz], [x1 + 1, 3.6, jz], 0.08); SEG(c, [x1 + 1, 3.5, jz], [x1 + 0.3, 3.5, jz], 0.05); lantern(c, x1 + 0.3, 2.8, jz);
    if (lod <= 2) { paint(c, OAK, "oklch(0.8 0.05 60)"); for (let x = X0 - 5; x > x1 + 3; x -= 9) { LA(c, x, 0, jz - 1.6, [[0.2, 0], [0.2, 0.5], [0.28, 0.55], [0.01, 0.6]], 8, true); LA(c, x, 0, jz + 1.6, [[0.2, 0], [0.2, 0.5], [0.28, 0.55], [0.01, 0.6]], 8, true); }
      BARREL(c, X0 - 3, 0, jz + 1.2); BARREL(c, X0 - 3.7, 0, jz + 1.3); crate(c, x1 + 4, 0, jz - 1, 1.0, r); } }
  // treadwheel cranes at the edge
  for (const [cx, cz] of p.cranes ?? []) craneAt(c, cx, cz, lod, col, r);
  // warehouses against the quay wall
  for (const z0 of p.sheds ?? []) { const x0 = 0.6, x1 = 10.45, z1 = z0 + 15, g = 4.2, top = 7.8, xm = (x0 + x1) / 2, yr = top + 5.4;
    paint(c, ASH, "oklch(0.84 0.03 70)"); BX(c, x0, 0, z0, x1, g, z1); col && col(x0, 0, z0, x1, top, z1);
    paint(c, TEAL, "oklch(0.94 0.04 190)"); BX(c, x0 - 0.3, g, z0 - 0.3, x1, top, z1 + 0.3);
    paint(c, TARB, "oklch(0.72 0.01 60)"); BX(c, x0 - 0.45, g - 0.3, z0 - 0.45, x1, g, z1 + 0.45); for (const z of [z0 - 0.3, (z0 + z1) / 2, z1 + 0.3]) BX(c, x0 - 0.42, g, z - 0.12, x0 - 0.2, top, z + 0.12);
    paint(c, COP, "#7fb08a"); BX(c, x0 - 0.4, top - 0.35, z0 - 0.4, x1, top - 0.15, z1 + 0.4);
    paint(c, TEAL, "oklch(0.94 0.04 190)"); for (const z of [z0 - 0.3, z1 + 0.2]) { c.tri(x0 - 0.3, top, z, x1, top, z, xm, yr - 0.3, z); c.tri(x0 - 0.3, top, z + 0.1, x1, top, z + 0.1, xm, yr - 0.3, z + 0.1); }
    paint(c, TERRA, "oklch(0.9 0.04 45)"); HX(c, [[x0 - 1, top - 0.4, z0 - 0.8], [xm, yr, z0 - 0.8], [xm, yr, z1 + 0.8], [x0 - 1, top - 0.4, z1 + 0.8], [x0 - 1, top - 0.2, z0 - 0.8], [xm, yr + 0.2, z0 - 0.8], [xm, yr + 0.2, z1 + 0.8], [x0 - 1, top - 0.2, z1 + 0.8]]);
    HX(c, [[xm, yr, z0 - 0.8], [x1 + 0.6, top - 0.4 + (x1 + 0.6 - x1) * 0, z0 - 0.8], [x1 + 0.6, top - 0.4, z1 + 0.8], [xm, yr, z1 + 0.8], [xm, yr + 0.2, z0 - 0.8], [x1 + 0.6, top - 0.2, z0 - 0.8], [x1 + 0.6, top - 0.2, z1 + 0.8], [xm, yr + 0.2, z1 + 0.8]]);
    const dz = (z0 + z1) / 2; paint(c, OAK, "oklch(0.7 0.06 45)"); BX(c, x0 - 0.08, 0, dz - 1.6, x0, 3.4, dz + 1.6); paint(c, IR, IRONC); for (const y of [0.6, 1.7, 2.8]) BX(c, x0 - 0.12, y, dz - 1.5, x0 - 0.08, y + 0.1, dz + 1.5); BX(c, x0 - 0.12, 0, dz - 0.03, x0 - 0.08, 3.4, dz + 0.03);
    paint(c, ASH, "oklch(0.8 0.03 70)"); BX(c, x0 - 0.2, 3.4, dz - 1.9, x0, 3.75, dz + 1.9);
    paint(c, OAK, "oklch(0.7 0.06 45)"); BX(c, x0 - 0.42, g + 0.6, dz - 0.9, x0 - 0.32, g + 2.8, dz + 0.9); paint(c, OAK, WOOD); SEG(c, [x0 - 0.3, top - 0.6, dz], [x0 - 2.2, top - 0.6, dz], 0.28); PIPE(c, [x0 - 2.0, top - 0.7, dz], [x0 - 2.0, g - 0.5, dz], 0.025, 0.025, 4);
    for (const z of [z0 + 2, z1 - 2]) { glow(c, ...LIT); BX(c, x0 - 0.36, g + 1, z - 0.45, x0 - 0.32, g + 2.3, z + 0.45); paint(c, TARB, "oklch(0.7 0.01 60)"); BX(c, x0 - 0.45, g + 0.88, z - 0.55, x0 - 0.3, g + 1, z + 0.55); }
    paint(c, IR, IRONC); SEG(c, [x0, 3.0, dz + 2.2], [x0 - 0.7, 3.0, dz + 2.2], 0.05); lantern(c, x0 - 0.7, 2.35, dz + 2.2);
    crate(c, x0 - 1.5, 0, dz - 3, 1.1, r); crate(c, x0 - 1.4, 1.1, dz - 3.1, 0.9, r); crate(c, x0 - 2.7, 0, dz - 3.4, 1.0, r); BARREL(c, x0 - 1.4, 0, dz + 3.4); BARREL(c, x0 - 2.1, 0, dz + 3.8); }
  // the stone stairs up the quay wall to the plateau
  for (const st of p.stairs ?? []) { const N = 67, rise = 12 / N, t = 0.28, xa = 7.2, xb = 10.5, d = st.dir;
    paint(c, ASH, "oklch(0.86 0.03 75)");
    for (let i = 0; i < N; i++) { const za = st.z + d * i * t, zb = st.z + d * (i + 1) * t, top = (i + 1) * rise; if (lod <= 2) BX(c, xa, Math.max(0, top - 1.2), za, xb, top, zb); col && col(xa, 0, za, xb, top, zb); }
    if (lod <= 2) { paint(c, BST, "oklch(0.78 0.035 75)"); HX(c, [[xa, 0, st.z], [xb, 0, st.z], [xb, 0, st.z + d * N * t], [xa, 0, st.z + d * N * t], [xa, 0, st.z], [xb, 0, st.z], [xb, 12 - 1.2, st.z + d * N * t], [xa, 12 - 1.2, st.z + d * N * t]]); }
    else { paint(c, ASH, "oklch(0.86 0.03 75)"); HX(c, [[xa, 0, st.z], [xb, 0, st.z], [xb, 0, st.z + d * N * t], [xa, 0, st.z + d * N * t], [xa, 0.1, st.z], [xb, 0.1, st.z], [xb, 12, st.z + d * N * t], [xa, 12, st.z + d * N * t]]); }
    const zl = st.z + d * N * t; paint(c, FLAG, "oklch(0.85 0.03 75)"); BX(c, xa, 0, zl, 13.5, 12, zl + d * 3.2); col && col(xa, 0, zl, 13.5, 12, zl + d * 3.2);
    paint(c, ASH, "oklch(0.8 0.03 75)"); const M = 8; for (let j = 0; j < M; j++) { const zA = st.z + d * N * t * j / M, zB = st.z + d * N * t * (j + 1) / M, yA = 12 * j / M, yB = 12 * (j + 1) / M;
      HX(c, [[xa - 0.45, 0, zA], [xa, 0, zA], [xa, 0, zB], [xa - 0.45, 0, zB], [xa - 0.45, yA + 1.0, zA], [xa, yA + 1.0, zA], [xa, yB + 1.0, zB], [xa - 0.45, yB + 1.0, zB]]); col && col(xa - 0.45, 0, zA, xa, Math.max(yA, yB) + 1.0, zB); }
    BX(c, xa - 0.45, 12, zl, xa, 13.0, zl + d * 3.2); col && col(xa - 0.45, 12, zl, xa, 13.0, zl + d * 3.2);
    paint(c, IR, IRONC); PIPE(c, [xa - 0.9, 0, st.z - d * 0.8], [xa - 0.9, 3.4, st.z - d * 0.8], 0.08); SEG(c, [xa - 0.9, 3.3, st.z - d * 0.8], [xa - 0.9, 3.3, st.z - d * 0.1], 0.05); lantern(c, xa - 0.9, 2.6, st.z - d * 0.1); }
  // cargo: stacks, barrels, sacks, drying nets
  if (lod <= 3) for (let z = -Z + 10; z < Z - 10; z += 13) { if ((p.clear ?? []).some(([a, b]) => z > a && z < b)) continue; const x = -4 + r() * 6, k = Math.floor(r() * 3);
    if (k === 0) { crate(c, x, 0, z, 1.2, r); crate(c, x + 1.25, 0, z + 0.1, 1.2, r); crate(c, x + 0.6, 1.2, z, 1.1, r); }
    else if (k === 1) { for (let i = 0; i < 5; i++) BARREL(c, x + (i % 3) * 0.75, i < 3 ? 0 : 0.9, z + (i < 3 ? 0 : 0.35) + (i % 3) * 0.1, 0.33, 0.9, lod); }
    else { paint(c, IR, IRONC); for (const zz of [z - 2, z + 2]) PIPE(c, [x, 0, zz], [x, 2.6, zz], 0.06); SEG(c, [x, 2.55, z - 2], [x, 2.55, z + 2], 0.06);
      paint(c, NET, "oklch(0.75 0.05 60)"); BX(c, x - 0.02, 0.6, z - 1.9, x + 0.02, 2.5, z + 1.9);
      paint(c, CANVAS, "oklch(0.8 0.04 75)"); for (let i = 0; i < 3; i++) LA(c, x + 1.2 + i * 0.6, 0, z + 0.5, [[0.01, 0], [0.3, 0.1], [0.32, 0.5], [0.2, 0.7], [0.01, 0.75]], 8, true); } }
};
// ---- a moored river boat ----
K.barge = (c, p, lod, col) => { const L = p.L ?? 20, Bm = (p.beam ?? 6) / 2, H = L / 2, r = rnd(p.seed ?? 3), N = lod <= 2 ? 16 : 8;
  const hb = (x) => Bm * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(x) / H, 2.4)), 0.5), sh = (x) => 1.4 + 0.9 * Math.pow(x / H, 2);
  const rows = []; for (let i = 0; i <= N; i++) { const x = -H + L * i / N, b = Math.max(0.02, hb(x)), s = sh(x); rows.push([[x, s, -b], [x, 0.3, -b * 0.96], [x, -0.8, -b * 0.7], [x, -1.2, 0], [x, -0.8, b * 0.7], [x, 0.3, b * 0.96], [x, s, b]]); }
  paint(c, TARB, "oklch(0.8 0.02 50)"); c.smooth(); LOFT(c, rows); c.flat();
  paint(c, RED, p.cog ? "oklch(0.45 0.15 25)" : "oklch(0.5 0.08 190)"); for (let i = 0; i < N; i++) { const a = rows[i], b = rows[i + 1]; for (const [k, s] of [[6, 1], [0, -1]]) HX(c, [[a[k][0], a[k][1] - 0.35, a[k][2]], [b[k][0], b[k][1] - 0.35, b[k][2]], [b[k][0], b[k][1] - 0.35, b[k][2] + s * 0.06], [a[k][0], a[k][1] - 0.35, a[k][2] + s * 0.06], [a[k][0], a[k][1] - 0.15, a[k][2]], [b[k][0], b[k][1] - 0.15, b[k][2]], [b[k][0], b[k][1] - 0.15, b[k][2] + s * 0.06], [a[k][0], a[k][1] - 0.15, a[k][2] + s * 0.06]]); }
  paint(c, DRIFT, DRIFTC); for (let i = 0; i < N; i++) { const xa = rows[i][0][0], xb = rows[i + 1][0][0], ba = hb(xa) * 0.97, bb = hb(xb) * 0.97; c.quad(xa, 1.0, ba, xb, 1.0, bb, xb, 1.0, -bb, xa, 1.0, -ba); }
  col && col(-H * 0.8, -1.2, -Bm * 0.9, H * 0.8, 1.0, Bm * 0.9);
  paint(c, OAK, WOOD); for (let i = 0; i <= N; i += 2) for (const k of [0, 6]) { const q = rows[i][k]; SEG(c, [q[0], 1.0, q[2] * 0.95], [q[0], q[1] + 0.25, q[2] * 0.97], 0.1); }
  const mx = p.cog ? -1.5 : -3; PIPE(c, [mx, 0.9, 0], [mx, p.cog ? 15 : 10, 0], 0.22, 0.14, 8); const yy = p.cog ? 12.5 : 8.5;
  SEG(c, [mx + 0.25, yy, -4.2], [mx + 0.25, yy, 4.2], 0.14); paint(c, CANVAS, p.cog ? "oklch(0.88 0.05 80)" : "oklch(0.8 0.08 40)"); PIPE(c, [mx + 0.35, yy - 0.15, -4], [mx + 0.35, yy - 0.15, 4], 0.32, 0.32, 8);
  if (lod <= 2) { paint(c, OAK, "oklch(0.6 0.05 60)"); ROPE(c, [mx, yy + 1.5, 0], [-H + 0.3, sh(-H) + 0.2, 0], 0.4, 0.025); ROPE(c, [mx, yy + 1.5, 0], [H - 0.5, sh(H) + 0.2, 0], 0.4, 0.025); for (const s of [-1, 1]) ROPE(c, [mx, yy - 1, 0], [mx + 1.5, 1.4, s * hb(mx + 1.5)], 0.1, 0.02); }
  if (p.cog) { const x0 = H * 0.45; paint(c, OAK, "oklch(0.75 0.05 55)"); BX(c, x0, 1.0, -hb(x0) * 0.9, H * 0.92, 3.4, hb(x0) * 0.9); col && col(x0, 1.0, -hb(x0) * 0.9, H * 0.92, 3.4, hb(x0) * 0.9);
    paint(c, RED, "oklch(0.45 0.15 25)"); BX(c, x0 - 0.05, 3.4, -hb(x0) * 0.92, H * 0.94, 3.9, hb(x0) * 0.92);
    for (const z of [-1, 1]) { glow(c, ...LIT); BX(c, x0 - 0.06, 1.7, z - 0.4, x0, 2.6, z + 0.4); }
    paint(c, IR, IRONC); PIPE(c, [H * 0.9, 3.9, 0], [H * 0.9, 6, 0], 0.05); paint(c, RED, "oklch(0.45 0.16 25)"); RB(c, H * 0.9 - 0.8, 5.5, 0, 1.6, 0.9, 0.04);
    paint(c, IR, IRONC); SEG(c, [x0 - 0.1, 3.0, 0], [x0 - 0.8, 3.0, 0], 0.05); lantern(c, x0 - 0.8, 2.3, 0); }
  else { paint(c, CANVAS, "oklch(0.8 0.06 70)"); const xa = 0.5, xb = H * 0.8; HX(c, [[xa, 2.4, -2.4], [xb, 2.4, -2.4], [xb, 3.2, 0], [xa, 3.2, 0], [xa, 2.5, -2.4], [xb, 2.5, -2.4], [xb, 3.3, 0], [xa, 3.3, 0]]); HX(c, [[xa, 3.2, 0], [xb, 3.2, 0], [xb, 2.4, 2.4], [xa, 2.4, 2.4], [xa, 3.3, 0], [xb, 3.3, 0], [xb, 2.5, 2.4], [xa, 2.5, 2.4]]);
    paint(c, OAK, WOOD); for (const x of [xa, xb]) for (const s of [-1, 1]) PIPE(c, [x, 1, s * 2.3], [x, 2.45, s * 2.3], 0.06); lantern(c, xb, 1.0, 0); }
  if (lod <= 2) { for (let i = 0; i < 4; i++) crate(c, -H * 0.5 + i * 1.3, 1.0, -1 + r() * 2, 1.0, r); for (let i = 0; i < 3; i++) BARREL(c, mx - 1.3, 1.0, -1.2 + i * 0.8); }
};
export function geometry(c) { const p = c.params ?? {}; (K[p.kind] ?? K.quay)(c, p, c.lod ?? 1, null); c.albedo(null); c.color(null); c.emissive(null); }
export function collider(c) { const p = c.params ?? {}, f = CB();
  const geo = { albedo() {}, color() {}, emissive() {}, metalness() {}, roughness() {}, quad() {}, tri() {}, smooth() {}, flat() {}, lod: 4, params: p };
  K[p.kind ?? "quay"](geo, p, 4, (x0, y0, z0, x1, y1, z1) => f(Math.min(x0, x1), Math.min(y0, y1), Math.min(z0, z1), Math.max(x0, x1), Math.max(y0, y1), Math.max(z0, z1)));
  return f.list; }
