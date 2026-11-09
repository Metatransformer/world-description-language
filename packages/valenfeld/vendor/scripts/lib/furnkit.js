// Valenfeld furniture kit: beds, bunks, chests, tables, racks, shields, banners, trophies, hearth gear.
// Every piece draws in its own local frame (front -Z, feet y 0) through XF(ctx, x, z, yaw, y), and names the boxes
// a body bumps with w.solid(...): geometry() runs the layout on the real ctx (solids ignored), collider() runs the same
// layout on SOLIDS() (faces ignored) and returns its box list, so the shell can never drift from the mesh.
import { paint, flatc, glow, BX, RB, LA, CY, HX, PIPE, ROPE, TORUS, BARREL, OAK, IR, HAY, WOOD, IRONC } from "./buildkit.js";
import KF from "./data/kit-furniture.json";   // textures, colours, piece sizes: scripts/lib/data/kit-furniture.yml
export const WOOLG = KF.tex.WOOLG, WOOLR = KF.tex.WOOLR, LEATH = KF.tex.LEATH, FUR = KF.tex.FUR, SAND = KF.tex.SAND, GRIT = KF.tex.GRIT;
export const RED = KF.col.RED, IRON = KF.col.IRON, STEEL = KF.col.STEEL, LINEN = KF.col.LINEN, PAPER = KF.col.PAPER, GOLD = KF.col.GOLD;
const TAU = Math.PI * 2;
export function XF(c, ox, oz, yaw = 0, oy = 0) {
  const Y = yaw * Math.PI / 180, co = Math.round(Math.cos(Y) * 1e9) / 1e9, si = Math.round(Math.sin(Y) * 1e9) / 1e9;
  const p = (x, y, z) => [ox + x * co + z * si, oy + y, oz - x * si + z * co];
  return { lod: c.lod ?? 1,
    solid: (x0, y0, z0, x1, y1, z1) => { if (!c.solid) return; const a = p(x0, y0, z0), b = p(x1, y1, z1); c.solid(a[0], a[1], a[2], b[0], b[1], b[2]); },
    quad: (ax, ay, az, bx, by, bz, cx, cy, cz, dx, dy, dz) => c.quad(...p(ax, ay, az), ...p(bx, by, bz), ...p(cx, cy, cz), ...p(dx, dy, dz)),
    tri: (ax, ay, az, bx, by, bz, cx, cy, cz) => c.tri(...p(ax, ay, az), ...p(bx, by, bz), ...p(cx, cy, cz)),
    albedo: (t) => c.albedo(t), color: (...a) => c.color(...a), emissive: (...a) => c.emissive(...a), smooth: () => c.smooth(), flat: () => c.flat() };
}
export function SOLIDS() { const L = [], n = () => {};
  const S = { lod: 1, quad: n, tri: n, albedo: n, color: n, emissive: n, smooth: n, flat: n, list: L,
    solid(x0, y0, z0, x1, y1, z1) { L.push({ kind: "box", width: Math.max(KF.minBox, Math.abs(x1 - x0)), height: Math.max(KF.minBox, Math.abs(y1 - y0)), depth: Math.max(KF.minBox, Math.abs(z1 - z0)), center: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2] }); } };
  return S; }
// a box that is drawn and bumped
export function SB(w, tex, col, x0, y0, z0, x1, y1, z1) { if (tex) paint(w, tex, col); else flatc(w, col); BX(w, x0, y0, z0, x1, y1, z1); w.solid(x0, y0, z0, x1, y1, z1); }
// a hexahedron swept along z from centre a (half sizes sa) to centre b (sb): snouts, tapers
export function FR(w, a, sa, b, sb) { HX(w, [[a[0] - sa[0], a[1] - sa[1], a[2]], [a[0] + sa[0], a[1] - sa[1], a[2]], [b[0] + sb[0], b[1] - sb[1], b[2]], [b[0] - sb[0], b[1] - sb[1], b[2]],
  [a[0] - sa[0], a[1] + sa[1], a[2]], [a[0] + sa[0], a[1] + sa[1], a[2]], [b[0] + sb[0], b[1] + sb[1], b[2]], [b[0] - sb[0], b[1] + sb[1], b[2]]]); }
// a disc facing -z: prof [[r, depth]...] like LA but round the z axis
export function LZ(w, cx, cy, cz, prof, n = 12) { const P = (i, k) => { const a = (k % n) / n * TAU; return [cx + prof[i][0] * Math.cos(a), cy + prof[i][0] * Math.sin(a), cz - prof[i][1]]; };
  for (let i = 0; i < prof.length - 1; i++) for (let k = 0; k < n; k++) w.quad(...P(i, k + 1), ...P(i, k), ...P(i + 1, k), ...P(i + 1, k + 1)); }
const hash = (i, s = 1) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };

// ---- bedding: a straw tick, a wool blanket turned back, a pillow (head at z0) ----
export function bedding(w, x0, x1, z0, z1, y, blanket = WOOLG, bcol = KF.bedding.blanketTint, seed = 1) {
  paint(w, HAY, "oklch(0.97 0.03 85)"); BX(w, x0, y, z0, x1, y + 0.15, z1);
  const zb = z0 + (z1 - z0) * 0.34, sk = (hash(seed) - 0.5) * 0.06;
  paint(w, blanket, bcol); BX(w, x0 - 0.03, y + 0.06, zb, x1 + 0.03, y + 0.2, z1 + 0.03);
  if (w.lod <= 3) { BX(w, x0 - 0.035, y + 0.2, zb + sk, x1 + 0.035, y + 0.245, zb + 0.13 + sk); // the turn-back
    flatc(w, LINEN); RB(w, (x0 + x1) / 2 + sk, y + 0.21, z0 + 0.2, (x1 - x0) * 0.72, 0.12, 0.3, sk * 60, 0, sk * 40); }
}
// ---- a two-tier bunk, 1.0 x 2.1, head at -z ----
export function bunk(w, seed = 1) { const hw = KF.bunk.hw, hl = KF.bunk.hl; w.solid(-hw, 0, -hl, hw, 1.95, hl);
  paint(w, OAK, WOOD);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) BX(w, sx * hw - 0.05, 0, sz * hl - 0.05, sx * hw + 0.05, 1.95, sz * hl + 0.05);
  for (const y of [0.3, 1.4]) {
    for (const sx of [-1, 1]) BX(w, sx * hw - 0.04, y, -hl, sx * hw + 0.04, y + 0.15, hl);
    for (const sz of [-1, 1]) BX(w, -hw, y, sz * hl - 0.04, hw, y + 0.15, sz * hl + 0.04);
    if (w.lod <= 2) for (let i = 0; i < 6; i++) { const z = -hl + 0.2 + i * (2 * hl - 0.4) / 5; BX(w, -hw + 0.04, y + 0.1, z - 0.05, hw - 0.04, y + 0.13, z + 0.05); }
    bedding(w, -hw + 0.06, hw - 0.06, -hl + 0.06, hl - 0.06, y + 0.13, y > 1 ? WOOLR : WOOLG, y > 1 ? "oklch(0.95 0.02 40)" : "oklch(0.95 0.01 80)", seed + y * 7);
  }
  BX(w, -hw, 0.55, -hl - 0.03, hw, 0.9, -hl + 0.03); BX(w, -hw, 1.65, -hl - 0.03, hw, 1.9, -hl + 0.03); // head boards
  BX(w, -hw - 0.03, 1.75, -hl, -hw + 0.03, 1.85, 0.3); // the top bunk's guard rail
  for (let i = 0; i < 4; i++) BX(w, hw + 0.02, 0.5 + i * 0.3, hl - 0.5, hw + 0.06, 0.54 + i * 0.3, hl - 0.06); // ladder rungs on the post side
  BX(w, hw + 0.02, 0, hl - 0.56, hw + 0.07, 1.6, hl - 0.48);
}
// ---- a proper bed, 1.5 x 2.15, posts, head and foot boards, red wool and a fur throw ----
export function bed(w) { const hw = KF.bed.hw, hl = KF.bed.hl; w.solid(-hw, 0, -hl, hw, 0.62, hl); w.solid(-hw, 0, -hl - 0.06, hw, 1.55, -hl + 0.06);
  paint(w, OAK, WOOD);
  for (const sx of [-1, 1]) { BX(w, sx * hw - 0.07, 0, -hl - 0.07, sx * hw + 0.07, 1.6, -hl + 0.07); BX(w, sx * hw - 0.07, 0, hl - 0.07, sx * hw + 0.07, 1.0, hl + 0.07);
    BX(w, sx * hw - 0.045, 0.25, -hl, sx * hw + 0.045, 0.45, hl); RB(w, sx * hw, 1.66, -hl, 0.1, 0.1, 0.1, 45); RB(w, sx * hw, 1.05, hl, 0.1, 0.1, 0.1, 45); }
  BX(w, -hw, 0.5, -hl - 0.04, hw, 1.35, -hl + 0.04); BX(w, -hw - 0.05, 1.35, -hl - 0.07, hw + 0.05, 1.47, -hl + 0.07);
  BX(w, -hw, 0.3, hl - 0.04, hw, 0.8, hl + 0.04); BX(w, -hw - 0.04, 0.8, hl - 0.06, hw + 0.04, 0.88, hl + 0.06);
  if (w.lod <= 2) { paint(w, IR, IRONC); for (const x of [-0.45, 0, 0.45]) BX(w, x - 0.025, 0.55, -hl - 0.06, x + 0.025, 1.3, -hl - 0.04); }
  paint(w, OAK, WOOD); for (let i = 0; i < 7; i++) { const z = -hl + 0.15 + i * 0.3; BX(w, -hw + 0.04, 0.4, z - 0.06, hw - 0.04, 0.44, z + 0.06); }
  bedding(w, -hw + 0.05, hw - 0.05, -hl + 0.06, hl - 0.06, 0.44, WOOLR, "oklch(0.96 0.02 40)", 4);
  flatc(w, LINEN); RB(w, 0.28, 0.67, -hl + 0.3, 0.5, 0.13, 0.32, 8, 0, 4);
  paint(w, FUR, "oklch(0.95 0.02 70)"); BX(w, -hw - 0.08, 0.6, hl - 0.6, hw + 0.08, 0.66, hl - 0.15); BX(w, -hw - 0.08, 0.3, hl - 0.6, -hw - 0.03, 0.66, hl - 0.15); BX(w, hw + 0.03, 0.3, hl - 0.6, hw + 0.08, 0.66, hl - 0.15);
}
// ---- a footlocker (0.8 x 0.45), iron bands; heavy = the strongbox ----
export function chest(w, heavy = false) { const C = heavy ? KF.chest.heavy : KF.chest.light, hw = C.hw, hd = C.hd, h = C.h; w.solid(-hw, 0, -hd, hw, h + 0.07, hd);
  paint(w, heavy ? IR : OAK, heavy ? "oklch(0.75 0.01 250)" : WOOD); BX(w, -hw, 0.03, -hd, hw, h, hd);
  paint(w, OAK, WOOD); BX(w, -hw - 0.02, h, -hd - 0.02, hw + 0.02, h + 0.07, hd + 0.02);
  paint(w, IR, IRONC); for (const x of heavy ? [-hw + 0.06, -0.12, 0.12, hw - 0.06] : [-hw + 0.1, hw - 0.1]) BX(w, x - 0.03, 0.02, -hd - 0.015, x + 0.03, h + 0.08, hd + 0.015);
  BX(w, -hw - 0.01, 0, -hd - 0.01, hw + 0.01, 0.04, hd + 0.01);
  BX(w, -0.06, h - 0.14, -hd - 0.04, 0.06, h + 0.02, -hd - 0.01); if (heavy) { flatc(w, "oklch(0.25 0.01 60)"); BX(w, -0.02, h - 0.11, -hd - 0.045, 0.02, h - 0.05, -hd - 0.035); }
}
// ---- trestle table along z (L long, 0.95 wide) and a bench along z ----
export function table(w, L = KF.table.L, W = KF.table.W, H = KF.table.H) { w.solid(-W / 2, 0, -L / 2, W / 2, H, L / 2);
  paint(w, OAK, WOOD); for (let i = 0; i < 4; i++) { const x = -W / 2 + i * W / 4; BX(w, x + 0.005, H - 0.08, -L / 2, x + W / 4 - 0.005, H, L / 2); }
  for (const s of [-1, 1]) { const z = s * (L / 2 - 0.45); BX(w, -0.06, 0, z - 0.06, 0.06, H - 0.08, z + 0.06); BX(w, -W / 2 + 0.08, 0, z - 0.08, W / 2 - 0.08, 0.1, z + 0.08); BX(w, -W / 2 + 0.06, H - 0.16, z - 0.05, W / 2 - 0.06, H - 0.08, z + 0.05);
    RB(w, 0, (H - 0.1) / 2, z, 0.06, 0.9, 0.05, 0, 0, 40); RB(w, 0, (H - 0.1) / 2, z, 0.06, 0.9, 0.05, 0, 0, -40); }
  BX(w, -0.05, 0.3, -L / 2 + 0.45, 0.05, 0.4, L / 2 - 0.45);
}
export function bench(w, L = KF.bench.L, H = KF.bench.H) { w.solid(-0.18, 0, -L / 2, 0.18, H, L / 2);
  paint(w, OAK, WOOD); BX(w, -0.18, H - 0.07, -L / 2, 0.18, H, L / 2);
  for (const s of [-1, 1]) { const z = s * (L / 2 - 0.3); BX(w, -0.15, 0, z - 0.04, 0.15, H - 0.07, z + 0.04); }
  BX(w, -0.04, 0.15, -L / 2 + 0.3, 0.04, 0.24, L / 2 - 0.3);
}
export function stool(w) { w.solid(-0.2, 0, -0.2, 0.2, 0.48, 0.2); paint(w, OAK, WOOD); CY(w, 0, 0.42, 0, 0.2, 0.06, 8);
  for (let i = 0; i < 3; i++) { const a = i / 3 * TAU; PIPE(w, [Math.cos(a) * 0.08, 0.42, Math.sin(a) * 0.08], [Math.cos(a) * 0.17, 0, Math.sin(a) * 0.17], 0.025, 0.025, 5); } }
// a chair facing -z: seat, a tall back with a carved crest; arms when grand
export function chair(w, grand = false) { const CH = grand ? KF.chair.grand : KF.chair.plain, hw = CH.hw, bh = CH.bh; w.solid(-hw, 0, -hw, hw, 0.5, hw);
  paint(w, OAK, WOOD); BX(w, -hw, 0.42, -hw, hw, 0.5, hw);
  for (const sx of [-1, 1]) { BX(w, sx * hw - 0.05 * sx - 0.025, 0, -hw, sx * hw - 0.05 * sx + 0.025, 0.42, -hw + 0.05); BX(w, sx * hw - 0.05 * sx - 0.03, 0, hw - 0.06, sx * hw - 0.05 * sx + 0.03, bh, hw); }
  BX(w, -hw + 0.03, 0.55, hw - 0.05, hw - 0.03, bh - 0.12, hw - 0.01);
  BX(w, -hw - 0.04, bh - 0.12, hw - 0.07, hw + 0.04, bh, hw + 0.01);
  if (grand) { for (const sx of [-1, 1]) { BX(w, sx * hw - 0.05, 0.5, -hw, sx * hw + 0.05, 0.78, -hw + 0.06); BX(w, sx * hw - 0.06, 0.78, -hw - 0.04, sx * hw + 0.06, 0.84, hw); RB(w, sx * (hw + 0.02), bh + 0.07, hw - 0.03, 0.13, 0.13, 0.13, 45, 0, 0); }
    paint(w, FUR, "oklch(0.95 0.02 70)"); BX(w, -hw + 0.02, 0.5, -hw - 0.05, hw - 0.02, 0.56, hw - 0.06); BX(w, -hw + 0.02, 0.56, hw - 0.08, hw - 0.02, 1.35, hw - 0.05);
    flatc(w, RED); BX(w, -0.12, bh - 0.55, hw - 0.075, 0.12, bh - 0.2, hw - 0.06); }
}
// ---- weapons, upright, drawn standing at (x, y, z) ----
export function sword(w, x, y, z, len = 0.85, roll = 0) { const t = (a) => [x + Math.sin(-roll * Math.PI / 180) * a, y + Math.cos(roll * Math.PI / 180) * a, z];
  paint(w, IR, "oklch(0.97 0.005 250)"); const b = t(len * 0.5); RB(w, b[0], b[1], b[2], 0.055, len, 0.012, 0, 0, roll);
  const g = t(len + 0.02); paint(w, IR, IRONC); RB(w, g[0], g[1], g[2], 0.24, 0.035, 0.04, 0, 0, roll);
  const h = t(len + 0.12); paint(w, LEATH, "oklch(0.9 0.02 60)"); RB(w, h[0], h[1], h[2], 0.035, 0.17, 0.035, 0, 0, roll);
  const p = t(len + 0.23); paint(w, IR, IRONC); RB(w, p[0], p[1], p[2], 0.06, 0.06, 0.06, 45, 0, roll); }
export function spear(w, x, y, z, len = 2.2) { paint(w, OAK, WOOD); PIPE(w, [x, y, z], [x, y + len, z], 0.022, 0.02, 5);
  paint(w, IR, "oklch(0.97 0.005 250)"); FR(w, [x, y + len - 0.02, z], [0.05, 0.012], [x, y + len + 0.2, z], [0.004, 0.004]); BX(w, x - 0.03, y + len - 0.08, z - 0.03, x + 0.03, y + len - 0.02, z + 0.03); }
export function axe(w, x, y, z, len = 0.9) { paint(w, OAK, WOOD); PIPE(w, [x, y, z], [x, y + len, z], 0.024, 0.024, 5);
  paint(w, IR, "oklch(0.95 0.005 250)"); HX(w, [[x, y + len - 0.22, z - 0.025], [x + 0.2, y + len - 0.26, z - 0.02], [x + 0.2, y + len - 0.26, z + 0.02], [x, y + len - 0.22, z + 0.025],
    [x, y + len - 0.04, z - 0.025], [x + 0.2, y + len + 0.02, z - 0.02], [x + 0.2, y + len + 0.02, z + 0.02], [x, y + len - 0.04, z + 0.025]]); }
// ---- a weapon rack against a wall, L along x, back at z 0 ----
export function rack(w, L = 2.4, seed = 1) { w.solid(-L / 2, 0, -0.42, L / 2, 1.9, 0);
  paint(w, OAK, WOOD); for (const s of [-1, 1]) { BX(w, s * L / 2 - 0.06, 0, -0.42, s * L / 2 + 0.06, 1.9, -0.3); BX(w, s * L / 2 - 0.06, 0, -0.42, s * L / 2 + 0.06, 0.1, 0); RB(w, s * (L / 2), 0.95, -0.15, 0.08, 1.4, 0.06, 0, -20, 0); }
  BX(w, -L / 2, 0.06, -0.42, L / 2, 0.16, -0.26); BX(w, -L / 2, 1.42, -0.44, L / 2, 1.52, -0.32); BX(w, -L / 2, 0.42, -0.4, L / 2, 0.5, -0.3);
  const n = Math.round(L / 0.3); for (let i = 0; i < n; i++) { const x = -L / 2 + 0.2 + i * (L - 0.4) / (n - 1), k = hash(i, seed);
    if (w.lod > 2 && i % 2) continue;
    if (k < 0.45) sword(w, x, 0.16, -0.36, 0.85 + k * 0.2, (k - 0.2) * 8); else if (k < 0.8) spear(w, x, 0.16, -0.36, 2.05 + k * 0.2); else axe(w, x, 0.16, -0.36, 0.95); }
}
// ---- a round shield facing -z, quartered red and oak, iron rim and boss ----
export function shield(w, cx, cy, cz, r = 0.36, k = 0) { const n = KF.shield.sides, t = KF.shield.t;
  const P = (a, rr, d) => [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, cz - d];
  for (let i = 0; i < n; i++) { const a0 = i / n * TAU + k, a1 = (i + 1) / n * TAU + k;
    if (Math.floor(i / 3) % 2) paint(w, OAK, WOOD); else flatc(w, RED);
    w.tri(...P(0, 0, t), ...P(a1, r - 0.03, t), ...P(a0, r - 0.03, t));
    paint(w, IR, IRONC); w.quad(...P(a0, r - 0.03, t), ...P(a1, r - 0.03, t), ...P(a1, r, t), ...P(a0, r, t)); w.quad(...P(a0, r, t), ...P(a1, r, t), ...P(a1, r, 0), ...P(a0, r, 0)); }
  paint(w, IR, IRONC); LZ(w, cx, cy, cz - t, [[0.1, 0], [0.09, 0.04], [0.04, 0.07], [0, 0.075]], 8);
}
// ---- a banner hung on a wall (back z 0, facing -z): iron rod, red cloth, swallowtail, iron trim, crossed swords ----
export function banner(w, x, ytop, bw = 1.4, bh = 3, emblem = true) { const z = -0.06, yb = ytop - bh, yt = yb + 0.45, hw = bw / 2;
  paint(w, IR, IRONC); PIPE(w, [x - hw - 0.14, ytop + 0.06, z], [x + hw + 0.14, ytop + 0.06, z], 0.025, 0.025, 5); for (const s of [-1, 1]) { RB(w, x + s * (hw + 0.16), ytop + 0.06, z, 0.07, 0.07, 0.07, 45, 45, 0); BX(w, x + s * (hw + 0.1) - 0.02, ytop + 0.04, z, x + s * (hw + 0.1) + 0.02, ytop + 0.1, 0); }
  paint(w, WOOLR, "oklch(0.98 0.03 35)"); const S = 4, wav = (i) => (i % 2 ? 0.035 : -0.015);
  for (let i = 0; i < S; i++) { const x0 = x - hw + i * bw / S, x1 = x0 + bw / S, z0 = z + wav(i), z1 = z + wav(i + 1);
    w.quad(x0, yt, z0, x1, yt, z1, x1, ytop, z1, x0, ytop, z0); }
  w.quad(x - hw, yb, z + wav(0), x, yt - 0.02, z + wav(2), x, yt, z + wav(2), x - hw, yt, z + wav(0)); w.tri(x - hw, yb, z + wav(0), x - hw * 0.5, yt, z + wav(1), x - hw, yt, z + wav(0));
  w.tri(x - hw, yb, z + wav(0), x, yt, z + wav(2), x - hw * 0.5, yt, z + wav(1));
  w.tri(x + hw, yb, z + wav(4), x, yt, z + wav(2), x + hw * 0.5, yt, z + wav(3)); w.tri(x + hw, yb, z + wav(4), x + hw * 0.5, yt, z + wav(3), x + hw, yt, z + wav(4));
  if (w.lod > 3) return;
  flatc(w, IRON); for (const yy of [ytop - 0.16, yt + 0.12]) for (let i = 0; i < S; i++) { const x0 = x - hw + i * bw / S, x1 = x0 + bw / S; w.quad(x0, yy, z + wav(i) - 0.006, x1, yy, z + wav(i + 1) - 0.006, x1, yy + 0.07, z + wav(i + 1) - 0.006, x0, yy + 0.07, z + wav(i) - 0.006); }
  if (!emblem) return;
  const cy = yt + (ytop - yt) * 0.52, s = Math.min(bw, bh) * 0.32, zf = z - 0.03;
  flatc(w, IRON); w.quad(x - s * 0.62, cy + s * 0.55, zf, x + s * 0.62, cy + s * 0.55, zf, x + s * 0.62, cy - s * 0.1, zf, x - s * 0.62, cy - s * 0.1, zf); w.tri(x - s * 0.62, cy - s * 0.1, zf, x + s * 0.62, cy - s * 0.1, zf, x, cy - s * 0.85, zf);
  for (const r of [-38, 38]) { paint(w, IR, "oklch(0.97 0.005 250)"); RB(w, x, cy, zf - 0.03, s * 0.12, s * 1.9, 0.015, 0, 0, r); paint(w, IR, GOLD); const a = r * Math.PI / 180;
    RB(w, x + Math.sin(a) * s * 0.7, cy - Math.cos(a) * s * 0.7, zf - 0.045, s * 0.45, s * 0.08, 0.02, 0, 0, r); }
}
// ---- a boar's head on an oak plaque (back z 0, facing -z), centre height y ----
export function boarHead(w, y) { paint(w, OAK, WOOD); w.solid(-0.4, y - 0.5, -0.75, 0.4, y + 0.5, 0);
  HX(w, [[-0.38, y - 0.25, 0], [0.38, y - 0.25, 0], [0.38, y - 0.25, -0.05], [-0.38, y - 0.25, -0.05], [-0.38, y + 0.42, 0], [0.38, y + 0.42, 0], [0.38, y + 0.42, -0.05], [-0.38, y + 0.42, -0.05]]);
  HX(w, [[-0.06, y - 0.52, 0], [0.06, y - 0.52, 0], [0.06, y - 0.52, -0.05], [-0.06, y - 0.52, -0.05], [-0.38, y - 0.25, 0], [0.38, y - 0.25, 0], [0.38, y - 0.25, -0.05], [-0.38, y - 0.25, -0.05]]);
  paint(w, FUR, "oklch(0.92 0.02 60)"); FR(w, [0, y, -0.05], [0.26, 0.27], [0, y - 0.02, -0.34], [0.21, 0.22]); FR(w, [0, y - 0.02, -0.34], [0.21, 0.22], [0, y - 0.1, -0.6], [0.12, 0.12]);
  flatc(w, "oklch(0.55 0.05 30)"); FR(w, [0, y - 0.1, -0.6], [0.12, 0.12], [0, y - 0.11, -0.66], [0.11, 0.1]);
  flatc(w, "oklch(0.15 0.01 30)"); for (const s of [-1, 1]) { BX(w, s * 0.05 - 0.025, y - 0.12, -0.665, s * 0.05 + 0.025, y - 0.07, -0.66); BX(w, s * 0.17 - 0.03, y + 0.06, -0.36, s * 0.17 + 0.03, y + 0.1, -0.3); }
  flatc(w, "oklch(0.92 0.03 85)"); for (const s of [-1, 1]) { RB(w, s * 0.12, y - 0.13, -0.56, 0.035, 0.035, 0.12, s * 10, 0, 0); RB(w, s * 0.14, y - 0.04, -0.6, 0.03, 0.15, 0.03, 0, -20, s * -25); }
  paint(w, FUR, "oklch(0.8 0.02 60)"); for (const s of [-1, 1]) RB(w, s * 0.22, y + 0.3, -0.1, 0.13, 0.2, 0.05, s * -20, 0, s * -30);
  if (w.lod <= 2) for (let i = 0; i < 5; i++) RB(w, 0, y + 0.27 - i * 0.012, -0.08 - i * 0.07, 0.04, 0.09, 0.05, 0, -25, 0);
}
// ---- hearth gear and table things ----
export function cauldron(w, x, y, z, r = 0.38) { paint(w, IR, "oklch(0.6 0.01 250)");
  LA(w, x, y, z, [[0.05, 0], [r * 0.8, 0.04], [r, r * 0.6], [r * 0.96, r * 1.15], [r * 0.86, r * 1.38], [r * 0.92, r * 1.45]], 12, false);
  LA(w, x, y, z, [[r * 0.82, r * 1.45], [r * 0.8, r * 1.38], [r * 0.9, r * 1.05]], 12, false);
  glow(w, "oklch(0.5 0.08 55)", [0.12, 0.05, 0.01]); LA(w, x, y + r * 1.08, z, [[r * 0.9, 0], [0, 0.01]], 12, false, "y", false);
  paint(w, IR, IRONC); TORUS(w, x, y + r * 1.48, z, r * 0.92, 0.018, 12, 4, "z"); }
export function tankard(w, x, y, z, yaw = 0) { paint(w, OAK, WOOD); LA(w, x, y, z, [[0.05, 0], [0.055, 0.15], [0.048, 0.155], [0.047, 0.03]], 8, true);
  paint(w, IR, IRONC); LA(w, x, y + 0.03, z, [[0.057, 0], [0.057, 0.02]], 8, false); LA(w, x, y + 0.12, z, [[0.058, 0], [0.058, 0.02]], 8, false);
  const a = yaw * Math.PI / 180; paint(w, OAK, WOOD); RB(w, x + Math.cos(a) * 0.075, y + 0.08, z - Math.sin(a) * 0.075, 0.035, 0.1, 0.02, yaw); }
export function bowl(w, x, y, z) { paint(w, OAK, WOOD); LA(w, x, y, z, [[0.04, 0], [0.1, 0.05], [0.09, 0.06], [0.03, 0.02]], 8, true); flatc(w, "oklch(0.5 0.07 60)"); LA(w, x, y + 0.045, z, [[0.085, 0], [0, 0.005]], 8, false, "y", false); }
export function candle(w, x, y, z, h = 0.14) { flatc(w, "oklch(0.92 0.03 90)"); CY(w, x, y, z, 0.025, h, 6); glow(w, "oklch(0.95 0.12 80)", [3, 1.8, 0.6]); RB(w, x, y + h + 0.03, z, 0.02, 0.05, 0.02, 45); }
export function bucket(w, x, y, z) { w.solid?.(x - 0.2, y, z - 0.2, x + 0.2, y + 0.38, z + 0.2); paint(w, OAK, WOOD); LA(w, x, y, z, [[0.15, 0], [0.19, 0.36], [0.17, 0.36], [0.13, 0.03]], 10, true);
  paint(w, IR, IRONC); LA(w, x, y + 0.05, z, [[0.162, 0], [0.165, 0.03]], 10, false); LA(w, x, y + 0.3, z, [[0.186, 0], [0.19, 0.03]], 10, false);
  for (let i = 0; i < 5; i++) { const a = i / 4 * Math.PI; PIPE(w, [x - Math.cos(a) * 0.19, y + 0.36 + Math.sin(a) * 0.22, z], [x - Math.cos(a + Math.PI / 4) * 0.19, y + 0.36 + Math.sin(a + Math.PI / 4) * 0.22, z], 0.008, 0.008, 4, false); if (i === 3) break; }
  flatc(w, "oklch(0.32 0.03 220)"); LA(w, x, y + 0.27, z, [[0.18, 0], [0, 0.002]], 10, false, "y", false); }
export function lantern(w, x, y, z, hang = 0.6) { paint(w, IR, IRONC); PIPE(w, [x, y + 0.3, z], [x, y + 0.3 + hang, z], 0.01, 0.01, 4);
  BX(w, x - 0.14, y + 0.22, z - 0.14, x + 0.14, y + 0.3, z + 0.14); BX(w, x - 0.14, y - 0.12, z - 0.14, x + 0.14, y - 0.06, z + 0.14);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) BX(w, x + sx * 0.13 - 0.015, y - 0.06, z + sz * 0.13 - 0.015, x + sx * 0.13 + 0.015, y + 0.22, z + sz * 0.13 + 0.015);
  glow(w, "oklch(0.95 0.1 75)", [2.6, 1.5, 0.5]); BX(w, x - 0.09, y - 0.06, z - 0.09, x + 0.09, y + 0.2, z + 0.09); }
export function chandelier(w, x, y, z, R = 0.9, top = 8.7) { paint(w, IR, IRONC); TORUS(w, x, y, z, R, 0.035, 16, 4);
  for (let i = 0; i < 3; i++) { const a = i / 3 * TAU; PIPE(w, [x + Math.cos(a) * R, y, z + Math.sin(a) * R], [x, y + 0.9, z], 0.01, 0.01, 4, false); }
  PIPE(w, [x, y + 0.9, z], [x, top, z], 0.014, 0.014, 4); RB(w, x, y + 0.9, z, 0.08, 0.08, 0.08, 45, 45);
  for (let i = 0; i < 8; i++) { const a = (i + 0.5) / 8 * TAU; paint(w, IR, IRONC); CY(w, x + Math.cos(a) * R, y + 0.02, z + Math.sin(a) * R, 0.05, 0.03, 6); candle(w, x + Math.cos(a) * R, y + 0.05, z + Math.sin(a) * R, 0.12 + hash(i) * 0.08); } }
export function sconce(w, y) { paint(w, IR, IRONC); BX(w, -0.06, y - 0.15, -0.03, 0.06, y + 0.15, 0); PIPE(w, [0, y - 0.05, -0.02], [0, y + 0.15, -0.3], 0.018, 0.018, 4);
  paint(w, OAK, WOOD); PIPE(w, [0, y + 0.02, -0.22], [0, y + 0.42, -0.34], 0.03, 0.04, 6); glow(w, "oklch(0.8 0.15 60)", [3.2, 1.5, 0.35]); RB(w, 0, y + 0.47, -0.35, 0.09, 0.1, 0.09, 30, -15); RB(w, 0, y + 0.55, -0.36, 0.05, 0.09, 0.05, 15, -15); }
// ---- a grindstone: a sandstone wheel on an oak frame, a trough, a crank and a treadle; wheel turns about x ----
export function grindstone(w) { w.solid(-0.5, 0, -0.45, 0.5, 1.05, 0.45);
  paint(w, OAK, WOOD); for (const s of [-1, 1]) { RB(w, s * 0.3, 0.42, -0.25, 0.08, 0.95, 0.08, 0, 22, 0); RB(w, s * 0.3, 0.42, 0.25, 0.08, 0.95, 0.08, 0, -22, 0); BX(w, s * 0.3 - 0.05, 0.82, -0.08, s * 0.3 + 0.05, 0.92, 0.08); }
  BX(w, -0.34, 0.12, -0.44, 0.34, 0.2, -0.36); BX(w, -0.34, 0.12, 0.36, 0.34, 0.2, 0.44);
  paint(w, GRIT, "oklch(0.95 0.02 80)"); LA(w, -0.07, 0.87, 0, [[0, 0], [0.4, 0], [0.4, 0.14], [0, 0.14]], 14, false, "x", false);
  paint(w, IR, IRONC); PIPE(w, [-0.42, 0.87, 0], [0.42, 0.87, 0], 0.025, 0.025, 6); BX(w, 0.42, 0.85, -0.02, 0.46, 0.87, 0.2); PIPE(w, [0.46, 0.87, 0.2], [0.58, 0.87, 0.2], 0.02, 0.02, 5);
  paint(w, OAK, WOOD); BX(w, -0.2, 0.2, -0.15, 0.2, 0.42, 0.15); flatc(w, "oklch(0.35 0.04 220)"); BX(w, -0.17, 0.4, -0.12, 0.17, 0.41, 0.12);
  paint(w, OAK, WOOD); RB(w, 0, 0.12, 0.6, 0.16, 0.04, 0.5, 0, 12, 0); }
// ---- an armour stand: a post, a crossbar, a mail shirt, a helm ----
export function armorStand(w, helmOnly = false) { w.solid(-0.3, 0, -0.25, 0.3, 1.8, 0.25);
  paint(w, OAK, WOOD); BX(w, -0.3, 0, -0.08, 0.3, 0.06, 0.08); BX(w, -0.08, 0, -0.3, 0.08, 0.06, 0.3); BX(w, -0.04, 0, -0.04, 0.04, 1.55, 0.04); BX(w, -0.3, 1.38, -0.035, 0.3, 1.45, 0.035);
  if (!helmOnly) { paint(w, IR, "oklch(0.85 0.005 250)"); FR(w, [0, 1.42, -0.12], [0.24, 0.02], [0, 0.82, -0.14], [0.22, 0.02]); HX(w, [[-0.22, 0.82, -0.14], [0.22, 0.82, -0.14], [0.22, 0.82, 0.12], [-0.22, 0.82, 0.12], [-0.25, 1.42, -0.12], [0.25, 1.42, -0.12], [0.25, 1.42, 0.12], [-0.25, 1.42, 0.12]]);
    paint(w, LEATH, "oklch(0.9 0.02 60)"); BX(w, -0.235, 0.95, -0.15, 0.235, 1.02, 0.13); for (const s of [-1, 1]) RB(w, s * 0.3, 1.25, 0, 0.12, 0.34, 0.2, 0, 0, s * 12); }
  paint(w, IR, IRONC); LA(w, 0, 1.52, 0, [[0.14, 0], [0.145, 0.1], [0.12, 0.2], [0.05, 0.26], [0, 0.27]], 8, true); BX(w, -0.02, 1.4, -0.16, 0.02, 1.62, -0.12); }
// ---- a sock, a shirt: laundry pegged on a line point p, hanging down ----
export function sock(w, p, yaw, k = 0) { paint(w, WOOLG, k ? "oklch(0.9 0.02 70)" : "oklch(0.97 0.01 80)"); RB(w, p[0], p[1] - 0.15, p[2], 0.1, 0.3, 0.03, yaw);
  const a = yaw * Math.PI / 180, f = k ? 1 : -1; RB(w, p[0] + Math.cos(a) * 0.06 * f, p[1] - 0.32, p[2] - Math.sin(a) * 0.06 * f, 0.18, 0.08, 0.035, yaw);
  flatc(w, RED); RB(w, p[0] + Math.cos(a) * 0.1 * f, p[1] - 0.32, p[2] - Math.sin(a) * 0.1 * f, 0.07, 0.081, 0.036, yaw); }
export function shirt(w, p, yaw, col = LINEN) { flatc(w, col); RB(w, p[0], p[1] - 0.32, p[2], 0.5, 0.62, 0.02, yaw); const a = yaw * Math.PI / 180;
  for (const s of [-1, 1]) RB(w, p[0] + Math.cos(a) * 0.32 * s, p[1] - 0.18, p[2] - Math.sin(a) * 0.32 * s, 0.18, 0.32, 0.02, yaw, 0, s * 35); }
export { BARREL };
