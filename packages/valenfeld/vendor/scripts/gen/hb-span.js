// The Annvyr Span: Highbridge's inhabited bridge. One generator, params.kind:
//  deck     the 22 m deck on three piers, two great arches, cutwaters, voussoirs (origin = deck top centre)
//  row      a row of tall jettied River Trade houses; lane face at z=0, houses run +x, bodies +z (door on -z)
//           params.houses: [{ w, n (storeys), seed, shop?, lamp? }]
//  passage  the house bridging the lane, open below (origin = lane centre, deck top)
//  tower    a Royal gate tower straddling the lane (gate runs along x); params.H, base
//  lion     a gilded Annvyr lion on a plinth (faces -z)
//  head     Span Head paving, lamp posts and the span-steps down east; statue: the founding king
import { paint, flatc, glow, HX, BX, RB, LA, CY, SEG, PIPE, ROPE, TORUS, LOFT, BARREL, CB, OAK, IR, FLAG, FS, PL, IRONC, WOOD } from "../lib/buildkit.js";
import { roofZ, gableFill } from "../lib/pieces/roof.js";
import { lampPost } from "../lib/pieces/lamppost.js";
import { spanWindow } from "../lib/pieces/window.js";
const ASH = "cdn/texture-ashlar-cream-limestone-two-courses-big-dressed-blocks-thin-pale-mortar-subtle-weathering.png", LEAD = "cdn/texture-blue-grey-lead-slate-roof-tiles.png";
const TEAL = "cdn/texture-teal-painted-weatherboard-planks.png", TERRA = "cdn/texture-terracotta-roof-tiles-weathered.png";
const TARB = "cdn/texture-tarred-planks-black.png", COP = "cdn/texture-verdigris-copper-roof-sheets.png", RED = "cdn/texture-faded-red-cloth-weave.png";
const BST = "cdn/texture-grey-ashlar-stone-wall.png";
const LIT = ["oklch(0.86 0.11 72)", [2.6, 1.45, 0.5]], LAMP = ["oklch(0.9 0.12 75)", [5, 2.8, 1]];
const GOLD = "oklch(0.8 0.13 85)", CRIM = "oklch(0.42 0.16 25)";
const rnd = (s) => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const gold = (c) => { flatc(c, GOLD); c.metalness(0.9); c.roughness(0.35); };
const unmetal = (c) => { c.metalness(null); c.roughness(null); };
// gable roof with its ridge along z (gables face the lane and the water)
const RZ = roofZ;   // shared roof pieces (lib/pieces/roof.js)
const GABLE = gableFill;
// a window on a face at z, facing s (-1 = -z): the shared Highbridge window, span look (lib/pieces/window.js)
const WIN = (c, x, y, z, s, w, h, lit, lod, shut) => spanWindow(c, x, y, z, s, w, h, lit, lod, shut);
const WALLS = [[TEAL, "oklch(0.95 0.04 195)"], [TEAL, "oklch(0.97 0.05 160)"], [PL, "oklch(0.93 0.09 82)"], [TEAL, "oklch(0.9 0.05 230)"], [PL, "oklch(0.9 0.08 28)"], [TEAL, "oklch(0.96 0.03 190)"], [PL, "oklch(0.95 0.03 95)"]];
const SHUT = ["oklch(0.45 0.09 185)", "oklch(0.4 0.1 250)", "oklch(0.45 0.12 30)", "oklch(0.5 0.1 150)"];
const G = 3.4, S = 3.1;
function house(c, L, h, x0, lod, col) { const r = rnd(h.seed ?? 1), w = h.w, x1 = x0 + w, xc = (x0 + x1) / 2, n = h.n ?? 3;
  const wl = WALLS[Math.floor(r() * WALLS.length)], sh = SHUT[Math.floor(r() * SHUT.length)], pitch = 42 + r() * 14, top = G + (n - 1) * S;
  const F = (k) => -0.45 * k, B = (k) => 7.9 + 0.4 * (k - 1);
  // ground floor: cream-grey stone
  paint(c, ASH, "oklch(0.86 0.03 70)");
  if (h.shop) { const d0 = x0 + 0.85, d1 = x0 + 2.15;
    BX(c, x0, 0, 0, d0, G, 0.3); BX(c, d1, 0, 0, x1, G, 0.3); BX(c, d0, 2.4, 0, d1, G, 0.3); BX(c, x0, 0, 6.7, x1, G, 7); BX(c, x0, 0, 0.3, x0 + 0.3, G, 6.7); BX(c, x1 - 0.3, 0, 0.3, x1, G, 6.7);
    col && [[x0, 0, 0, d0, G, 0.3], [d1, 0, 0, x1, G, 0.3], [d0, 2.4, 0, d1, G, 0.3], [x0, 0, 6.7, x1, G, 7], [x0, 0, 0.3, x0 + 0.3, G, 6.7], [x1 - 0.3, 0, 0.3, x1, G, 6.7], [x0 + 2.4, 0, 3.2, x1 - 1.2, 1.0, 3.8]].forEach((b) => col(...b));
    paint(c, OAK, WOOD); BX(c, x0 + 0.3, 0, 0.3, x1 - 0.3, 0.08, 6.7); BX(c, x0 + 0.3, G - 0.25, 0.3, x1 - 0.3, G - 0.05, 6.7);
    paint(c, OAK, "oklch(0.8 0.04 60)"); BX(c, d0 - 0.12, 0, -0.08, d0, 2.52, 0.38); BX(c, d1, 0, -0.08, d1 + 0.12, 2.52, 0.38); BX(c, d0 - 0.12, 2.4, -0.08, d1 + 0.12, 2.56, 0.38);
    BX(c, d0 + 0.02, 0, 0.35, d0 + 0.1, 2.38, 1.6); // the door stands open inward
    glow(c, ...LIT); BX(c, d1 + 0.6, 0.9, -0.04, x1 - 0.7, 2.4, 0.34); c.emissive(null);
    paint(c, TARB, "oklch(0.7 0.01 60)"); for (let x = d1 + 0.6; x <= x1 - 0.69; x += (x1 - 0.7 - d1 - 0.6) / 3) BX(c, x - 0.04, 0.9, -0.08, x + 0.04, 2.4, 0.38);
    if (lod <= 2) { paint(c, OAK, WOOD); BX(c, x0 + 2.4, 0, 3.2, x1 - 1.2, 1.0, 3.8); BX(c, x0 + 2.3, 1.0, 3.1, x1 - 1.1, 1.08, 3.9);
      for (const y of [0.9, 1.6, 2.3]) BX(c, x0 + 0.5, y, 6.25, x1 - 0.5, y + 0.05, 6.7);
      const goods = ["oklch(0.5 0.15 25)", "oklch(0.55 0.1 200)", "oklch(0.75 0.12 85)", "oklch(0.45 0.1 300)", "oklch(0.6 0.12 140)"];
      for (const y of [0.95, 1.65, 2.35]) for (let x = x0 + 0.7; x < x1 - 0.8; x += 0.55) { flatc(c, goods[Math.floor(r() * 5)]); BX(c, x, y, 6.3, x + 0.42, y + 0.3 + r() * 0.2, 6.65); }
      BARREL(c, x0 + 0.8, 0.08, 5.6); BARREL(c, x1 - 0.8, 0.08, 1.2);
      glow(c, ...LAMP); BX(c, xc - 0.15, G - 0.9, 3.35, xc + 0.15, G - 0.55, 3.65); paint(c, IR, IRONC); SEG(c, [xc, G - 0.55, 3.5], [xc, G - 0.25, 3.5], 0.03);
      // the trade sign on its iron arm
      paint(c, IR, IRONC); SEG(c, [d1 + 0.4, 3.0, 0], [d1 + 0.4, 3.0, -1.3], 0.06); paint(c, OAK, "oklch(0.75 0.06 60)"); BX(c, d1 + 0.38, 2.15, -1.25, d1 + 0.42, 2.9, -0.35); }
  } else { BX(c, x0 + 0.02, 0, 0, x1 - 0.02, G, 7); col && col(x0, 0, 0, x1, G, 7);
    const dx = x0 + 1.2 + r() * (w - 2.4 - 1.5);
    paint(c, OAK, "oklch(0.72 0.06 50)"); BX(c, dx - 0.6, 0, -0.06, dx + 0.6, 2.3, 0); paint(c, OAK, WOOD); BX(c, dx - 0.75, 0, -0.12, dx - 0.6, 2.45, 0); BX(c, dx + 0.6, 0, -0.12, dx + 0.75, 2.45, 0); BX(c, dx - 0.75, 2.3, -0.12, dx + 0.75, 2.5, 0);
    const wx = dx < xc ? (dx + x1) / 2 + 0.4 : (x0 + dx) / 2 - 0.4; WIN(c, wx, 1.0, 0, -1, 1.2, 1.1, r() < 0.7, lod, null); }
  if (lod <= 3) { paint(c, ASH, "oklch(0.78 0.03 70)"); BX(c, x0, 0, -0.12, x1, 0.35, 0); }
  // upper storeys, each jettied out over the lane and the water
  for (let k = 1; k < n; k++) { const y0 = G + (k - 1) * S, y1 = y0 + S, f = F(k), b = B(k);
    paint(c, wl[0], wl[1]); BX(c, x0 + 0.03, y0, f, x1 - 0.03, y1, b); col && col(x0, y0, f, x1, y1, b);
    paint(c, TARB, "oklch(0.72 0.01 60)"); BX(c, x0, y0 - 0.3, f - 0.12, x1, y0, b + 0.12); // jetty floor beam
    if (lod <= 3) for (const x of [x0 + 0.1, x1 - 0.1]) { BX(c, x - 0.12, y0, f - 0.06, x + 0.12, y1, f + 0.1); BX(c, x - 0.12, y0, b - 0.1, x + 0.12, y1, b + 0.06); }
    if (lod <= 2) { for (let x = x0 + 0.4; x < x1 - 0.2; x += 0.6) BX(c, x - 0.08, y0 - 0.26, f - 0.2, x + 0.08, y0 - 0.06, f); BX(c, x0, y0 + 1.0, f - 0.04, x1, y0 + 1.1, f + 0.05); }
    const nw = w >= 7.5 ? 2 : 1 + (r() < 0.5 ? 1 : 0); for (let i = 0; i < nw; i++) { const x = x0 + w * (i + 0.5) / nw; WIN(c, x, y0 + 1.0, f, -1, 0.85, 1.35, r() < 0.55, lod, sh); if (lod <= 3) WIN(c, x, y0 + 1.0, b, 1, 0.85, 1.35, r() < 0.4, 4, null); }
    if (lod <= 3 && k === 1) { paint(c, TARB, "oklch(0.72 0.01 60)"); for (const x of [x0 + 0.5, xc, x1 - 0.5]) { SEG(c, [x, -2.6, 7], [x, G - 0.15, b - 0.1], 0.24); SEG(c, [x, G - 1.0, 0.05], [x, G - 0.2, f - 0.1], 0.16); } }
  }
  // copper band under the eaves, then the roof
  const ft = F(n - 1), bt = B(n - 1); if (lod <= 3) { paint(c, COP, "#7fb08a"); BX(c, x0, top - 0.35, ft - 0.08, x1, top - 0.15, bt + 0.08); }
  const ov = 0.4, yr = top + (w / 2 + ov) * Math.tan(pitch * Math.PI / 180);
  if (h.ridgeX) { paint(c, TERRA, "oklch(0.9 0.04 45)"); const rr = top + ((bt - ft) / 2 + ov) * Math.tan(pitch * Math.PI / 180) * 0.6; HX(c, [[x0 - 0.1, top, ft - ov], [x1 + 0.1, top, ft - ov], [x1 + 0.1, rr, (ft + bt) / 2], [x0 - 0.1, rr, (ft + bt) / 2], [x0 - 0.1, top + 0.18, ft - ov], [x1 + 0.1, top + 0.18, ft - ov], [x1 + 0.1, rr + 0.18, (ft + bt) / 2], [x0 - 0.1, rr + 0.18, (ft + bt) / 2]]);
    HX(c, [[x0 - 0.1, rr, (ft + bt) / 2], [x1 + 0.1, rr, (ft + bt) / 2], [x1 + 0.1, top, bt + ov], [x0 - 0.1, top, bt + ov], [x0 - 0.1, rr + 0.18, (ft + bt) / 2], [x1 + 0.1, rr + 0.18, (ft + bt) / 2], [x1 + 0.1, top + 0.18, bt + ov], [x0 - 0.1, top + 0.18, bt + ov]]);
    paint(c, wl[0], wl[1]); for (const [x, s] of [[x0 + 0.03, 1], [x1 - 0.03, -1]]) { c.tri(x, top, ft, x, top, bt, x, rr, (ft + bt) / 2); }
    if (lod <= 2) { paint(c, TERRA, "oklch(0.9 0.04 45)"); RZ(c, xc - 1.1, xc + 1.1, ft - 0.6, (ft + bt) / 2 - 1, top + 0.3, top + 1.6, 0.12); paint(c, wl[0], wl[1]); BX(c, xc - 1, top, ft - 0.5, xc + 1, top + 0.4, ft + 1); GABLE(c, xc - 1, xc + 1, ft - 0.5, top + 0.35, top + 1.5, 0.05); WIN(c, xc, top + 0.35, ft - 0.5, -1, 0.6, 0.7, r() < 0.6, lod, null); }
  } else { paint(c, wl[0], wl[1]); GABLE(c, x0 + 0.03, x1 - 0.03, ft, top, yr - ov * Math.tan(pitch * Math.PI / 180) - 0.05, 0.1); GABLE(c, x0 + 0.03, x1 - 0.03, bt - 0.1, top, yr - ov * Math.tan(pitch * Math.PI / 180) - 0.05, 0.1);
    paint(c, TERRA, "oklch(0.9 0.04 45)"); RZ(c, x0 - ov, x1 + ov, ft - 0.55, bt + 0.55, top - ov * Math.tan(pitch * Math.PI / 180), yr, 0.18);
    if (lod <= 2) { WIN(c, xc, top + 0.6, ft - 0.02, -1, 0.7, 0.9, r() < 0.6, lod, null); paint(c, TARB, "oklch(0.7 0.01 60)"); for (const s of [-1, 1]) SEG(c, [xc + s * (w / 2 + ov), top - ov * Math.tan(pitch * Math.PI / 180), ft - 0.6], [xc, yr + 0.1, ft - 0.6], 0.2, 0.3);
      paint(c, TERRA, "oklch(0.75 0.05 40)"); SEG(c, [xc, yr + 0.12, ft - 0.55], [xc, yr + 0.12, bt + 0.55], 0.28); } }
  if (r() < 0.6 && lod <= 3) { const cx = r() < 0.5 ? x0 + 0.7 : x1 - 0.7, cz = bt - 1.4; paint(c, FS, "oklch(0.8 0.03 40)"); BX(c, cx - 0.45, top, cz - 0.45, cx + 0.45, yr + 1.0, cz + 0.45); BX(c, cx - 0.55, yr + 1.0, cz - 0.55, cx + 0.55, yr + 1.2, cz + 0.55); paint(c, TERRA, "oklch(0.7 0.06 40)"); CY(c, cx, yr + 1.2, cz, 0.16, 0.45, 6); }
  if (h.lamp && lod <= 3) { paint(c, IR, IRONC); SEG(c, [xc, 3.0, -0.05], [xc, 3.0, -1.15], 0.06); SEG(c, [xc, 2.4, -0.05], [xc, 3.0, -0.8], 0.04);
    glow(c, ...LAMP); BX(c, xc - 0.17, 2.3, -1.32, xc + 0.17, 2.75, -0.98); paint(c, IR, IRONC); LA(c, xc, 2.75, -1.15, [[0.26, 0], [0.01, 0.25]], 4, true, "y", false); BX(c, xc - 0.2, 2.22, -1.35, xc + 0.2, 2.3, -0.95); }
}
const K = {};
K.row = (c, p, lod, col) => { let x = 0; for (const h of p.houses) { house(c, null, h, x, lod, col); x += h.w; } };
// ---- the deck: one lofted masonry hull ----
const SP = -15.5, ARCH = [{ c: -14, r: 12.5 }, { c: 17.5, r: 12 }], PIERS = [-30, 2, 33], HW = 11, BOT = -48;
function profile() { const P = [[-50, BOT], [-26.5, BOT]]; for (const a of ARCH) { const N = 28; P.push([a.c - a.r, BOT]); for (let i = 0; i <= N; i++) { const t = Math.PI * (1 - i / N); P.push([a.c + a.r * Math.cos(t), SP + a.r * Math.sin(t)]); } P.push([a.c + a.r, BOT]); } P.push([50, BOT]); return P; }
function cutwater(c, xc, s, lod) { const y0 = BOT, y1 = SP + 1.2, z0 = s * HW, zt = s * (HW + 5);
  const A = [xc - 3.5, z0], B = [xc + 3.5, z0], T = [xc, zt];
  for (const [p, q] of [[A, T], [T, B]]) c.quad(p[0], y0, p[1], q[0], y0, q[1], q[0], y1, q[1], p[0], y1, p[1]);
  const ap = [xc, y1 + 3.2, z0 + s * 0.6]; c.tri(A[0], y1, A[1], T[0], y1, T[1], ...ap); c.tri(T[0], y1, T[1], B[0], y1, B[1], ...ap);
  if (lod <= 2) { paint(c, BST, "oklch(0.7 0.03 70)"); for (const yy of [-28.6, SP]) { const e = 0.25; c.quad(A[0] - e, yy, A[1], T[0], yy, T[1] + s * e, T[0], yy + 0.5, T[1] + s * e, A[0] - e, yy + 0.5, A[1]); c.quad(T[0], yy, T[1] + s * e, B[0] + e, yy, B[1], B[0] + e, yy + 0.5, B[1], T[0], yy + 0.5, T[1] + s * e); } }
}
K.deck = (c, p, lod, col) => {
  const P = profile(), TOP = -0.12;
  paint(c, BST, "oklch(0.86 0.035 75)");
  for (let i = 0; i < P.length - 1; i++) { const [xa, ya] = P[i], [xb, yb] = P[i + 1];
    if (Math.abs(xb - xa) > 1e-6) { c.quad(xa, ya, HW, xb, yb, HW, xb, TOP, HW, xa, TOP, HW); c.quad(xb, yb, -HW, xa, ya, -HW, xa, TOP, -HW, xb, TOP, -HW); }
    const arch = ya > BOT + 1 && yb > BOT + 1; if (arch) c.smooth(); c.quad(xa, ya, -HW, xb, yb, -HW, xb, yb, HW, xa, ya, HW); c.flat(); }
  for (const x of [-50, 50]) c.quad(x, BOT, -HW, x, BOT, HW, x, TOP, HW, x, TOP, -HW);
  for (const xc of [PIERS[0], PIERS[1]]) for (const s of [-1, 1]) { paint(c, BST, "oklch(0.82 0.035 75)"); cutwater(c, xc + 0, s, lod); }
  paint(c, FLAG, "oklch(0.9 0.03 75)"); BX(c, -50, TOP, -HW, 50, 0, HW);
  if (lod <= 3) { paint(c, BST, "oklch(0.74 0.03 70)"); for (const s of [-1, 1]) BX(c, -50, -1.7, s * HW, 50, -1.2, s * (HW + 0.4)); // string course
    paint(c, FLAG, "oklch(0.7 0.03 70)"); for (const s of [-1, 1]) BX(c, -50, 0, s * 3.75, 50, 0.04, s * 4.0); }
  if (lod <= 2) for (const a of ARCH) { const NV = 29, R = a.r + 0.85; for (let i = 0; i < NV; i++) { const t = Math.PI * (i + 0.5) / NV, key = i === (NV - 1) / 2;
      paint(c, BST, i % 2 ? "oklch(0.8 0.035 70)" : "oklch(0.9 0.03 80)"); for (const s of [-1, 1]) RB(c, a.c + R * Math.cos(t), SP + R * Math.sin(t), s * (HW + 0.15), key ? 2.2 : 1.7, Math.PI * R / NV * 0.93, 0.32, 0, 0, t * 180 / Math.PI); } }
  if (lod <= 2) { paint(c, BST, "oklch(0.62 0.04 140)"); for (const x0 of [-26.5, 5.5]) BX(c, x0 - 7, -29.2, -HW - 0.3, x0, -27.6, HW + 0.3); } // wet, mossy pier footings at the waterline
};
// ---- the passage: a house bridging the lane ----
K.passage = (c, p, lod, col) => { const W = 4.1, Z = 3.6, y0 = G, y1 = G + 2 * S, wl = WALLS[p.wall ?? 1];
  paint(c, OAK, WOOD); BX(c, -W, y0 - 0.35, -4.1, W, y0, 4.1); col && col(-W, y0 - 0.35, -4.1, W, y1, 4.1);
  paint(c, wl[0], wl[1]); BX(c, -W + 0.05, y0, -Z, W - 0.05, y1, Z);
  paint(c, TARB, "oklch(0.72 0.01 60)"); for (const x of [-W, W]) { for (const z of [-Z, 0, Z]) BX(c, x - 0.12, y0, z - 0.12, x + 0.12, y1, z + 0.12); BX(c, x - 0.14, y0 + S - 0.15, -Z, x + 0.14, y0 + S + 0.1, Z); }
  for (const x of [-W, W]) for (const z of [-1.8, 1.8]) for (const yy of [y0 + 0.9, y0 + S + 0.9]) WIN(c, x, yy, z - 0.45, Math.sign(x), 0.0001, 0.0001, false, 5, null);
  for (const x of [-W, W]) { const s = Math.sign(x); for (const z of [-1.8, 1.8]) for (const yy of [y0 + 0.9, y0 + S + 0.9]) { glow(c, ...LIT); BX(c, x + s * 0.02, yy, z - 0.45, x + s * 0.12, yy + 1.3, z + 0.45); paint(c, TARB, "oklch(0.7 0.01 60)"); BX(c, x + s * 0.02, yy - 0.12, z - 0.55, x + s * 0.16, yy, z + 0.55); } }
  paint(c, TERRA, "oklch(0.88 0.05 40)"); const yr = y1 + (W + 0.4) * Math.tan(48 * Math.PI / 180); RZ(c, -W - 0.4, W + 0.4, -3.3, 3.3, y1 - 0.36, yr, 0.18);
  paint(c, COP, "#7fb08a"); BX(c, -W - 0.05, y1 - 0.35, -Z, W + 0.05, y1 - 0.15, Z);
  if (lod <= 3) { paint(c, TARB, "oklch(0.72 0.01 60)"); for (const x of [-W + 0.3, -1.4, 1.4, W - 0.3]) BX(c, x - 0.15, y0 - 0.65, -4, x + 0.15, y0 - 0.35, 4);
    for (const x of [-W + 0.3, W - 0.3]) for (const s of [-1, 1]) { const pts = []; for (let i = 0; i <= 6; i++) { const t = i / 6 * Math.PI / 2; pts.push([x, y0 - 0.35 - 1.6 * (1 - Math.sin(t)), s * (4 - 1.6 * (1 - Math.cos(t)) * 0 - (1.6 * Math.sin(t)))]); }
      for (let i = 0; i < 6; i++) SEG(c, pts[i], pts[i + 1], 0.22); } }
  if (lod <= 2) { paint(c, IR, IRONC); SEG(c, [0, y0 - 0.35, 0], [0, y0 - 1.0, 0], 0.03); glow(c, ...LAMP); BX(c, -0.2, y0 - 1.55, -0.2, 0.2, y0 - 1.0, 0.2); paint(c, IR, IRONC); BX(c, -0.25, y0 - 1.6, -0.25, 0.25, y0 - 1.55, 0.25); LA(c, 0, y0 - 1.0, 0, [[0.3, 0], [0.01, 0.25]], 4, true, "y", false); }
};
// ---- a Royal gate tower: gate along x, drums at ±z ----
K.tower = (c, p, lod, col) => { const H = p.H ?? 16, D = 4.5, Wz = 7, gw = 3, gs = 4.6, base = p.base ?? -1, dz = 9.6, dr = 3.3, dh = H + 4;
  paint(c, ASH, "oklch(0.8 0.04 78)");
  BX(c, -D, base, -Wz, D, H, -gw); BX(c, -D, base, gw, D, H, Wz); BX(c, -D, gs + gw, -gw, D, H, gw);
  col && [[-D, base, -Wz, D, H, -gw], [-D, base, gw, D, H, Wz], [-D, gs + gw - 0.4, -gw, D, H, gw]].forEach((b) => col(...b));
  const N = 14, arc = (i) => { const t = Math.PI * i / N; return [gw * Math.cos(t), gs + gw * Math.sin(t)]; };
  for (let i = 0; i < N; i++) { const [za, ya] = arc(i), [zb, yb] = arc(i + 1);
    for (const x of [-D, D]) c.quad(x, ya, za, x, yb, zb, x, gs + gw, zb, x, gs + gw, za);
    c.smooth(); c.quad(-D, ya, za, D, ya, za, D, yb, zb, -D, yb, zb); c.flat(); }
  // dressed arch: voussoir ring proud of each face, gilded keystone, impost blocks, hood moulding
  if (lod <= 3) for (const x of [-D, D]) { const sx = Math.sign(x), NV = 11;
    for (let k = 0; k < NV; k++) { const t = (k + 0.5) / NV * Math.PI, key = k === (NV - 1) / 2, r = gw + (key ? 0.45 : 0.36);
      if (key) gold(c); else paint(c, ASH, k % 2 ? "oklch(0.9 0.03 82)" : "oklch(0.8 0.04 75)");
      RB(c, x + sx * 0.13, gs + r * Math.sin(t), r * Math.cos(t), 0.26, key ? 0.95 : 0.72, key ? 0.62 : 0.78, 0, 90 - t * 180 / Math.PI, 0); if (key) unmetal(c); }
    paint(c, ASH, "oklch(0.78 0.035 75)"); for (const z of [-gw - 0.35, gw + 0.35]) BX(c, x, gs - 0.35, z - 0.45, x + sx * 0.3, gs + 0.05, z + 0.45);
    if (lod <= 2) { const NH = 18; for (let k = 0; k < NH; k++) { const a0 = k / NH * Math.PI, a1 = (k + 1) / NH * Math.PI, rr = gw + 0.85;
      SEG(c, [x + sx * 0.1, gs + rr * Math.sin(a0), rr * Math.cos(a0)], [x + sx * 0.1, gs + rr * Math.sin(a1), rr * Math.cos(a1)], 0.2, 0.16); } } }
  for (const s of [-1, 1]) { paint(c, ASH, "oklch(0.8 0.04 78)"); LA(c, 0, base, s * dz, [[dr + 0.5, 0], [dr, 3], [dr, dh]], 20, true);
    paint(c, LEAD, "oklch(0.9 0.02 250)"); LA(c, 0, dh, s * dz, [[dr + 0.5, 0], [dr * 0.7, 2.5], [0.05, 8]], 20, true);
    gold(c); LA(c, 0, dh + 7.8, s * dz, [[0.06, 0], [0.3, 0.3], [0.06, 0.6], [0.04, 1.6]], 8, true); unmetal(c);
    paint(c, RED, CRIM); LA(c, 0, dh - 1.6, s * dz, [[dr + 0.06, 0], [dr + 0.06, 0.5]], 20, false); gold(c); LA(c, 0, dh - 1.1, s * dz, [[dr + 0.08, 0], [dr + 0.08, 0.15]], 20, false); unmetal(c);
    col && col(-dr, base, s * dz - dr, dr, dh, s * dz + dr);
    for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2 + 0.3, yy = 4 + (k % 3) * 5; glow(c, ...LIT); RB(c, Math.cos(a) * (dr + 0.02), yy, s * dz + Math.sin(a) * (dr + 0.02), 0.25, 1.4, 0.25, -a * 180 / Math.PI); } }
  paint(c, RED, CRIM); BX(c, -D - 0.08, H - 2.2, -Wz - 0.08, D + 0.08, H - 1.6, Wz + 0.08); gold(c); BX(c, -D - 0.1, H - 1.6, -Wz - 0.1, D + 0.1, H - 1.45, Wz + 0.1); unmetal(c);
  paint(c, ASH, "oklch(0.88 0.03 80)"); BX(c, -D - 0.3, H, -Wz - 0.3, D + 0.3, H + 0.4, Wz + 0.3);
  if (lod <= 3) for (let z = -Wz; z <= Wz - 0.5; z += 1.25) for (const x of [-D - 0.2, D - 0.5]) BX(c, x, H + 0.4, z, x + 0.7, H + 1.5, z + 0.7);
  if (lod <= 3) for (let x = -D + 0.6; x <= D - 1; x += 1.25) for (const z of [-Wz - 0.2, Wz - 0.5]) BX(c, x, H + 0.4, z, x + 0.7, H + 1.5, z + 0.7);
  paint(c, LEAD, "oklch(0.8 0.02 250)"); BX(c, -D + 0.2, H + 0.3, -Wz + 0.2, D - 0.2, H + 0.45, Wz - 0.2);
  paint(c, IR, IRONC); PIPE(c, [0, H + 0.4, 0], [0, H + 9, 0], 0.08, 0.06, 6); paint(c, RED, CRIM); RB(c, 1.3, H + 8.1, 0, 2.6, 1.2, 0.04);
  for (const x of [-D, D]) { const s = Math.sign(x); paint(c, ASH, "oklch(0.88 0.03 80)"); BX(c, x, gs + gw + 0.2, -gw - 0.4, x + s * 0.25, gs + gw + 0.6, gw + 0.4);
    glow(c, ...LIT); BX(c, x + s * 0.02, H - 5.6, -0.8, x + s * 0.12, H - 3.4, 0.8); paint(c, ASH, "oklch(0.85 0.03 80)"); BX(c, x + s * 0.02, H - 5.75, -1.0, x + s * 0.3, H - 5.6, 1.0);
    if (lod <= 2) for (const z of [-gw - 0.7, gw + 0.7]) { paint(c, IR, IRONC); SEG(c, [x, 3.6, z], [x + s * 0.6, 3.6, z], 0.06); glow(c, ...LAMP); BX(c, x + s * 0.45, 2.9, z - 0.17, x + s * 0.79, 3.4, z + 0.17); paint(c, IR, IRONC); LA(c, x + s * 0.62, 3.4, z, [[0.26, 0], [0.01, 0.25]], 4, true, "y", false); } }
  if (lod <= 2) { paint(c, IR, "oklch(0.5 0.01 250)"); for (let z = -gw + 0.4; z < gw; z += 0.45) BX(c, -0.05, gs + gw - 0.9, z - 0.04, 0.05, gs + gw - 0.05, z + 0.04); BX(c, -0.05, gs + gw - 0.95, -gw, 0.05, gs + gw - 0.85, gw); }
};
// ---- Span Head: paving, lamp posts, the span-steps ----
K.head = (c, p, lod, col) => { paint(c, FLAG, "oklch(0.9 0.035 75)"); BX(c, -25, -0.5, -32, 25, 0.06, 32); col && col(-25, -0.5, -32, 25, 0.06, 32);
  // the west retaining mass: the gorge falls away under the plaza's edge, so dressed ashlar carries it down to the bank
  paint(c, ASH, "oklch(0.8 0.03 75)"); BX(c, -25, -38, -32, -9, -0.5, 32); col && col(-25, -38, -32, -9, -0.5, 32);
  if (lod <= 3) { paint(c, ASH, "oklch(0.72 0.03 70)"); BX(c, -25.4, -1.6, -32.4, -9, -0.9, 32.4); for (const z of [-24, -8, 8, 24]) BX(c, -26.2, -38, z - 1.5, -25, -2, z + 1.5); }
  if (lod <= 3) { paint(c, FLAG, "oklch(0.72 0.05 40)"); LA(c, 0, 0.06, 0, [[9.6, 0], [9.6, 0.03], [8.8, 0.03]], 40, false, "y", false); LA(c, 0, 0.06, 0, [[5.4, 0], [5.4, 0.03], [4.8, 0.03]], 32, false, "y", false); }
  for (const [x, z] of p.lamps ?? []) lampPost(c, { paint, flatc, glow, BX, LA, SEG }, "span", { at: [x, 0, z], light: LAMP });   // shared lamp post, the span look
  // the span-steps: 0.18 m risers down to the market, a balustrade each side
  const x0 = 25, x1 = 60, drop = 15, N = Math.round(drop / 0.18), t = (x1 - x0) / N, rise = drop / N, Z = 10;
  paint(c, BST, "oklch(0.74 0.025 70)");   // worn grey treads under cream balustrades, a crimson runner up the middle
  if (lod <= 2) { for (let i = 0; i < N; i++) { const top = -(i + 0.5) * rise; BX(c, x0 + i * t, top - 0.7, -Z, x0 + (i + 1) * t, top, Z); }
    paint(c, RED, CRIM); for (let i = 0; i < N; i++) { const top = -(i + 0.5) * rise; BX(c, x0 + i * t - 0.01, top, -1.6, x0 + (i + 1) * t + 0.01, top + 0.025, 1.6); } }
  else { const a = Math.atan2(drop, x1 - x0) * 180 / Math.PI, L = Math.hypot(drop, x1 - x0); RB(c, (x0 + x1) / 2, -drop / 2 - 0.3, 0, L, 0.6, 2 * Z, 0, 0, -a); }
  paint(c, ASH, "oklch(0.82 0.03 75)"); for (const s of [-1, 1]) { const M = 8; for (let j = 0; j < M; j++) { const xa = x0 + (x1 - x0) * j / M, xb = x0 + (x1 - x0) * (j + 1) / M, ya = -drop * j / M, yb = -drop * (j + 1) / M;
      HX(c, [[xa, ya - 1, s * Z], [xb, yb - 1, s * Z], [xb, yb - 1, s * (Z + 0.6)], [xa, ya - 1, s * (Z + 0.6)], [xa, ya + 1.0, s * Z], [xb, yb + 1.0, s * Z], [xb, yb + 1.0, s * (Z + 0.6)], [xa, ya + 1.0, s * (Z + 0.6)]].map((q) => q));
      col && col(xa, Math.min(ya, yb) - 0.2, s * Z, xb, Math.max(ya, yb) + 1.0, s * (Z + 0.6)); }
    BX(c, x0 - 0.6, -0.5, s * Z, x0 + 0.6, 1.6, s * (Z + 0.6)); col && col(x0 - 0.6, -0.5, s * Z, x0 + 0.6, 1.6, s * (Z + 0.6)); }
};
// ---- the founding king ----
K.statue = (c, p, lod, col) => { paint(c, ASH, "oklch(0.78 0.035 75)");
  BX(c, -4, -0.4, -4, 4, 0.4, 4); BX(c, -3.3, 0.4, -3.3, 3.3, 0.8, 3.3); BX(c, -2.6, 0.8, -2.6, 2.6, 1.2, 2.6); BX(c, -1.9, 1.2, -1.9, 1.9, 4.2, 1.9); BX(c, -2.2, 4.2, -2.2, 2.2, 4.6, 2.2);
  col && [[-4, -0.4, -4, 4, 0.8, 4], [-1.9, 0.8, -1.9, 1.9, 4.6, 1.9]].forEach((b) => col(...b));
  paint(c, RED, CRIM); BX(c, -1.95, 3.6, -1.95, 1.95, 3.85, 1.95); gold(c); BX(c, -1.2, 1.8, -1.98, 1.2, 3.0, -1.9);
  const Y = 4.6, br = () => { flatc(c, "oklch(0.5 0.07 165)"); c.metalness(0.6); c.roughness(0.45); };
  br(); LA(c, 0, Y, 0.1, [[1.25, 0], [1.15, 0.6], [0.95, 2.0], [0.75, 2.9], [0.01, 2.95]], 18, true);
  LA(c, 0, Y + 2.9, 0, [[0.75, 0], [0.85, 0.8], [0.92, 1.4], [0.55, 1.8], [0.01, 1.85]], 18, true);
  RB(c, 0, Y + 2.5, 0.75, 2.1, 4.4, 0.22, 0, -7); for (const s of [-1, 1]) LA(c, s * 0.85, Y + 4.25, 0, [[0.01, 0], [0.38, 0.12], [0.42, 0.35], [0.3, 0.55], [0.01, 0.6]], 10, true);
  CY(c, 0, Y + 4.6, 0, 0.26, 0.4, 10); LA(c, 0, Y + 4.85, 0, [[0.01, 0], [0.33, 0.08], [0.44, 0.4], [0.38, 0.7], [0.01, 0.92]], 14, true); RB(c, 0, Y + 4.95, -0.33, 0.5, 0.55, 0.25, 0, 10);
  SEG(c, [0.95, Y + 4.4, 0], [1.35, Y + 5.2, -0.25], 0.36); SEG(c, [1.35, Y + 5.2, -0.25], [1.2, Y + 6.15, -0.35], 0.3); LA(c, 1.2, Y + 6.1, -0.35, [[0.01, 0], [0.2, 0.08], [0.2, 0.3], [0.01, 0.38]], 8, true);
  SEG(c, [-0.95, Y + 4.4, 0], [-1.25, Y + 3.4, -0.3], 0.36); SEG(c, [-1.25, Y + 3.4, -0.3], [-1.05, Y + 2.7, -0.75], 0.3);
  RB(c, -1.15, Y + 1.9, -1.0, 1.3, 1.9, 0.16, 0, 0, -4);
  gold(c); SEG(c, [1.2, Y + 6.35, -0.36], [1.12, Y + 9.2, -0.42], 0.17, 0.05); SEG(c, [0.75, Y + 6.4, -0.36], [1.65, Y + 6.4, -0.36], 0.12); LA(c, 1.21, Y + 5.95, -0.35, [[0.01, 0], [0.12, 0.08], [0.01, 0.18]], 8, true);
  LA(c, 0, Y + 5.55, 0, [[0.43, 0], [0.45, 0.22]], 14, false); for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI * 2, x = Math.cos(a) * 0.44, z = Math.sin(a) * 0.44; c.tri(x - Math.sin(a) * 0.1, Y + 5.77, z + Math.cos(a) * 0.1, x + Math.sin(a) * 0.1, Y + 5.77, z - Math.cos(a) * 0.1, x, Y + 6.05, z); }
  LA(c, -1.15, Y + 2.05, -1.1, [[0.01, 0], [0.32, 0.05], [0.01, 0.1]], 10, true, "z"); BX(c, -1.85, Y + 1.0, -1.1, -0.45, Y + 1.1, -1.06);
  unmetal(c);
  if (lod <= 2) for (const [x, z] of [[2.9, -2.9], [2.9, 2.9], [-2.9, -2.9], [-2.9, 2.9]]) { paint(c, IR, IRONC); LA(c, x, 0.8, z, [[0.12, 0], [0.08, 0.9], [0.35, 1.2], [0.4, 1.35]], 8, true); glow(c, ...LAMP); LA(c, x, 2.15, z, [[0.3, 0], [0.12, 0.35], [0.01, 0.4]], 8, true); }
};
// ---- an Annvyr lion couchant on a plinth, gilded; faces -z ----
K.lion = (c, p, lod, col) => { paint(c, ASH, "oklch(0.86 0.03 80)");
  BX(c, -1.05, 0, -1.65, 1.05, 0.3, 1.65); BX(c, -0.9, 0.3, -1.5, 0.9, 1.4, 1.5); BX(c, -1.0, 1.4, -1.6, 1.0, 1.6, 1.6);
  col && col(-1.05, 0, -1.65, 1.05, 3.0, 1.65);
  paint(c, RED, CRIM); BX(c, -0.6, 0.55, -1.52, 0.6, 1.2, -1.5); gold(c); BX(c, -0.66, 1.2, -1.53, 0.66, 1.26, -1.49); BX(c, -0.66, 0.49, -1.53, 0.66, 0.55, -1.49);
  const Y = 1.6, n = lod <= 2 ? 14 : 8;
  LA(c, 0, Y + 0.5, 0.35, [[0.01, -1.0], [0.42, -0.85], [0.52, -0.3], [0.48, 0.4], [0.4, 0.85], [0.01, 1.0]], n, true, "z");
  LA(c, 0, Y + 0.95, -0.55, [[0.01, -0.45], [0.58, -0.3], [0.64, 0.1], [0.45, 0.4], [0.01, 0.5]], n, true, "z");
  LA(c, 0, Y + 1.1, -0.95, [[0.01, -0.35], [0.31, -0.25], [0.34, 0.05], [0.26, 0.25], [0.01, 0.3]], n, true, "z");
  RB(c, 0, Y + 0.98, -1.27, 0.3, 0.26, 0.3); for (const s of [-1, 1]) { RB(c, s * 0.2, Y + 1.42, -0.95, 0.14, 0.18, 0.08, 0, 0, s * -20);
    SEG(c, [s * 0.25, Y + 0.05, -1.35], [s * 0.25, Y + 0.65, -0.55], 0.22); RB(c, s * 0.25, Y + 0.08, -1.42, 0.27, 0.16, 0.32);
    RB(c, s * 0.38, Y + 0.42, 0.95, 0.22, 0.78, 0.92); RB(c, s * 0.36, Y + 0.08, 0.55, 0.26, 0.16, 0.42); }
  if (lod <= 2) { SEG(c, [0, Y + 0.5, 1.3], [0.5, Y + 0.12, 1.65], 0.1); SEG(c, [0.5, Y + 0.12, 1.65], [0.78, Y + 0.18, 1.25], 0.08); LA(c, 0.8, Y + 0.18, 1.2, [[0.01, 0], [0.12, 0.08], [0.01, 0.22]], 6, true); }
  unmetal(c);
};
export function geometry(c) { const p = c.params ?? {}; (K[p.kind] ?? K.deck)(c, p, c.lod ?? 1, null); c.albedo(null); c.color(null); c.emissive(null); c.metalness(null); c.roughness(null); }
export function collider(c) { const p = c.params ?? {}, f = CB(), k = p.kind ?? "deck";
  if (k === "deck") { f(-50, -2, -HW, 50, 0, HW); for (const x of PIERS) f(x - 3.5, BOT, -HW, x + 3.5, -2, HW); return f.list; }
  const geo = { albedo() {}, color() {}, emissive() {}, metalness() {}, roughness() {}, quad() {}, tri() {}, smooth() {}, flat() {}, lod: 4, params: p };
  if (typeof K[k] !== "function") return f.list;
  K[k](geo, p, 4, (x0, y0, z0, x1, y1, z1) => f(Math.min(x0, x1), Math.min(y0, y1), Math.min(z0, z1), Math.max(x0, x1), Math.max(y0, y1), Math.max(z0, z1)));
  return f.list; }
