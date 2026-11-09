// THE SULTANA'S PALACE, QASRETH (Dar al-Qasr): sun-baked sandstone and turquoise glazed tile on a plinth.
// Front is +Z (a pishtaq portal with a pointed niche), local origin = footprint centre on the ground, floor at FL.
// Courtyard (z 0..20.8): a tiled octagonal fountain with two rills, arcaded galleries both sides, carved lattice
// screens in alternate bays. Main block (z 0..-19.2): the domed throne room in the middle (onion dome on a drum),
// the Sultana's bedchamber west, the vizier's study east with a stair up to the roof terrace (east roof), which
// steps down onto the east gallery roof. Four tiled minarets at the corners.
import { TX as TX0, TINT, paint, flatc, glow, HX, BX, RB, LA, CY, CB, ARCHFILL, archY, frame, AWN, POT, tri } from "../lib/desert-kit.js";
const ST = "oklch(0.96 0.02 70)", ST2 = "oklch(0.88 0.03 62)", BRASS = "oklch(0.8 0.12 85)", TW = "oklch(0.97 0.02 220)", TD = "oklch(0.7 0.06 245)";
const FL = 0.6, H = 7.1, RT = FL + 5.0, RTOP = FL + 5.4, TH = FL + 9.2, THT = FL + 9.6, GR = FL + 4.2, DZ = -8.6;
const BAY = 20.8 / 6, BW = (BAY - 0.5) / 2;
const PL = "cdn/texture-limewash-plaster.png", PLC = "oklch(0.97 0.02 80)", WOOD = "oklch(0.72 0.06 55)", DARK = "oklch(0.16 0.02 50)", DRUMH = 2.8, DUP = DRUMH - 1.7;
export const PLANTERS = [[-9, 3.6, FL], [9, 3.6, FL], [-9, 17.2, FL], [9, 17.2, FL], [-7.6, 25.0, 0], [7.6, 25.0, 0]];
function spec() {
  const gal = (s) => ({ ax: "z", a0: 0, a1: 20.8, b0: s * 12 - 0.25, b1: s * 12 + 0.25, y0: FL, y1: GR,
    holes: [0, 1, 2, 3, 4, 5].map((k) => ({ c: (k + 0.5) * BAY, w: BW, sp: FL + 2.6, ap: FL + 3.6, bot: k === 1 || k === 4 ? FL + 0.35 : 0, lat: k === 1 || k === 4 })) });
  const win = (c, a) => ({ c, w: 0.8, bot: FL + 1.0, sp: FL + 2.6, ap: FL + 3.3, lat: true, ...(a || {}) });
  return [
    { ax: "x", a0: -20, a1: 20, b0: 20.8, b1: 22, y0: FL, y1: H, holes: [{ c: 0, w: 1.6, sp: FL + 3.2, ap: FL + 4.6 }] },
    { ax: "z", a0: -19.2, a1: 20.8, b0: -20, b1: -18.8, y0: FL, y1: H, holes: [win(-9)] },
    { ax: "z", a0: -19.2, a1: 20.8, b0: 18.8, b1: 20, y0: FL, y1: H, holes: [] },
    { ax: "x", a0: -18.8, a1: 18.8, b0: -19.2, b1: -18, y0: FL, y1: H, holes: [] },
    { ax: "x", a0: -18.8, a1: -8.4, b0: -1, b1: 0, y0: FL, y1: RTOP, holes: [win(-13.6)] },
    { ax: "x", a0: 8.4, a1: 18.8, b0: -1, b1: 0, y0: FL, y1: RTOP, holes: [win(13.6)] },
    { ax: "x", a0: -8.4, a1: 8.4, b0: -1, b1: 0, y0: FL, y1: THT, holes: [win(-5), { c: 0, w: 1.3, sp: FL + 2.6, ap: FL + 3.6 }, win(5)] },
    { ax: "z", a0: -18, a1: -1, b0: -8.4, b1: -7.6, y0: FL, y1: THT, holes: [{ c: -5, w: 0.7, sp: FL + 2.4, ap: FL + 3.0 }] },
    { ax: "z", a0: -18, a1: -1, b0: 7.6, b1: 8.4, y0: FL, y1: THT, holes: [{ c: -5, w: 0.7, sp: FL + 2.4, ap: FL + 3.0 }] },
    { ax: "x", a0: -7.6, a1: 7.6, b0: -18, b1: -16.2, y0: FL, y1: THT, holes: [] },
    gal(-1), gal(1),
  ];
}
function walls(S, box, arch, lat) {
  for (const W of S) {
    const seg = (u0, u1, y0, y1) => { if (u1 - u0 < 1e-3 || y1 - y0 < 1e-3) return; W.ax === "x" ? box(u0, y0, W.b0, u1, y1, W.b1) : box(W.b0, y0, u0, W.b1, y1, u1); };
    let p = W.a0;
    for (const h of [...W.holes].sort((a, b) => a.c - b.c)) { seg(p, h.c - h.w, W.y0, W.y1); if (h.bot) seg(h.c - h.w, h.c + h.w, W.y0, h.bot); arch(W, h, seg); if (h.lat && lat) lat(W, h); p = h.c + h.w; }
    seg(p, W.a1, W.y0, W.y1);
  }
}
function inFrame(W, h, fn) { const m = (W.b0 + W.b1) / 2, t = (W.b1 - W.b0) / 2; if (W.ax === "x") frame([h.c, 0, m], 0, () => fn(t)); else frame([m, 0, h.c], 90, () => fn(t)); }
// a carved lattice screen in local plane z=0 across -w..w, y0..y1
function LAT(c, w, y0, y1, D) {
  paint(c, TX.sand, "oklch(0.8 0.04 60)"); const s = 0.32, t = 0.045;
  BX(c, -w, y0, -0.07, w, y0 + 0.08, 0.07); BX(c, -w, y1 - 0.08, -0.07, w, y1, 0.07);
  for (let x = -w + s / 2; x < w; x += s) BX(c, x - t, y0, -t, x + t, y1, t);
  for (let y = y0 + s / 2; y < y1; y += s) BX(c, -w, y - t, -t, w, y + t, t);
  if (D <= 1) for (let x = -w + s; x < w - 0.05; x += s) for (let y = y0 + s; y < y1 - 0.05; y += s) RB(c, x, y, 0, 0.13, 0.13, 0.06, 0, 0, 45);
}
function ARIB(c, s, sp, ap, th, z0, z1, K = 14) {
  for (let i = 0; i < K; i++) { const x0 = -s + 2 * s * i / K, x1 = -s + 2 * s * (i + 1) / K, a0 = archY(x0, s, sp, ap), a1 = archY(x1, s, sp, ap);
    HX(c, [[x0, a0, z0], [x1, a1, z0], [x1, a1, z1], [x0, a0, z1], [x0, a0 + th, z0], [x1, a1 + th, z0], [x1, a1 + th, z1], [x0, a0 + th, z1]]); }
}
function CUSH(c, x, y, z, w, d, h, tex, col) { paint(c, tex, col); BX(c, x - w / 2, y, z - d / 2, x + w / 2, y + h * 0.75, z + d / 2); BX(c, x - w / 2 + 0.06, y + h * 0.75, z - d / 2 + 0.06, x + w / 2 - 0.06, y + h, z + d / 2 - 0.06); }
function LAMP(c, x, y, z, top) {
  flatc(c, BRASS); c.metalness(0.6); BX(c, x - 0.015, y + 0.5, z - 0.015, x + 0.015, top, z + 0.015);
  LA(c, x, y, z, [[0.05, 0], [0.22, 0.12], [0.26, 0.28], [0.18, 0.42], [0.06, 0.5]], 8, true); c.metalness(null);
  glow(c, "#ffcf8a", [1.4, 0.8, 0.3]); LA(c, x, y + 0.14, z, [[0.2, 0], [0.2, 0.18]], 8, false);
}
function MINARET(c, x, z, D) {
  paint(c, TX.sand, ST); LA(c, x, 0, z, [[2.4, 0], [2.4, 1.2], [2.2, 1.4], [2.2, 12.2], [2.6, 12.6], [2.6, 13.0]], D <= 2 ? 16 : 10, true);
  paint(c, TX.tile, TW); for (const y of [4.4, 9.4]) LA(c, x, y, z, [[2.24, 0], [2.24, 0.7]], D <= 2 ? 16 : 10, false);
  LA(c, x, 13.0, z, [[1.7, 0], [1.75, 0.5], [1.95, 1.2], [1.7, 2.1], [1.1, 2.9], [0.45, 3.5], [0.12, 4.0], [0, 4.2]], D <= 2 ? 16 : 10, false);
  if (D <= 2) { flatc(c, BRASS); c.metalness(0.7); LA(c, x, 17.1, z, [[0.12, 0], [0.16, 0.25], [0.05, 0.45], [0.1, 0.65], [0, 1.1]], 8, false); c.metalness(null); }
}
// a lattice grid of square bars in the plane z (x0..x1, y0..y1), or the plane x (z0..z1) when ax = "z"
function GRID(c, ax, a0, a1, y0, y1, k, s, t, D) {
  const B = (u0, v0, u1, v1, w0, w1) => ax === "x" ? BX(c, u0, v0, w0, u1, v1, w1) : BX(c, w0, v0, u0, w1, v1, u1);
  for (let u = a0 + s / 2; u < a1 - 0.02; u += s) B(u - t, y0, u + t, y1, k - t, k + t);
  for (let v = y0 + s / 2; v < y1 - 0.02; v += s) B(a0, v - t, a1, v + t, k - t, k + t);
  if (D <= 1) for (let u = a0 + s; u < a1 - 0.05; u += s) for (let v = y0 + s; v < y1 - 0.05; v += s) ax === "x" ? RB(c, u, v, k, 0.07, 0.07, t * 2.6, 0, 0, 45) : RB(c, k, v, u, t * 2.6, 0.07, 0.07, 0, 45, 0);
}
// a wooden mashrabiya oriel on a wall face at z = 0, standing out toward +z by d: corbels, turned lattice, a hood
function MASH(c, w, y0, y1, d, D) {
  const h = w / 2;
  flatc(c, DARK); BX(c, -h + 0.05, y0, -0.02, h - 0.05, y1, 0.04);
  paint(c, TX.sand, ST2); BX(c, -h - 0.12, y0 - 0.22, 0, h + 0.12, y0, d + 0.06); BX(c, -h + 0.05, y0 - 0.48, 0, h - 0.05, y0 - 0.22, d * 0.65); BX(c, -h + 0.3, y0 - 0.7, 0, h - 0.3, y0 - 0.48, d * 0.3);
  if (D >= 4) { paint(c, TX.oak, WOOD); BX(c, -h, y0, 0.04, h, y1, d); return; }
  paint(c, TX.oak, WOOD);
  for (const x of [-h, h - 0.07]) for (const z of [0.04, d - 0.07]) BX(c, x, y0, z, x + 0.07, y1, z + 0.07);
  BX(c, -h, y0, d - 0.08, h, y0 + 0.42, d); BX(c, -h, y0, 0.04, -h + 0.03, y0 + 0.42, d); BX(c, h - 0.03, y0, 0.04, h, y0 + 0.42, d);
  BX(c, -h, y1 - 0.1, 0.04, h, y1, d);
  if (D <= 3) { const s = D <= 2 ? 0.15 : 0.3, t = 0.022;
    GRID(c, "x", -h + 0.07, h - 0.07, y0 + 0.42, y1 - 0.1, d - 0.035, s, t, D);
    GRID(c, "z", 0.11, d - 0.07, y0 + 0.42, y1 - 0.1, -h + 0.035, s, t, D); GRID(c, "z", 0.11, d - 0.07, y0 + 0.42, y1 - 0.1, h - 0.035, s, t, D);
    paint(c, TX.oak, "oklch(0.6 0.06 50)"); BX(c, -h + 0.1, y0 + 0.12, d, h - 0.1, y0 + 0.16, d + 0.015); BX(c, -h + 0.1, y0 + 0.28, d, h - 0.1, y0 + 0.32, d + 0.015); }
  // hood: a sloped plank roof with a scalloped valance
  paint(c, TX.oak, "oklch(0.62 0.05 50)");
  HX(c, [[-h - 0.15, y1, 0], [h + 0.15, y1, 0], [h + 0.15, y1 - 0.05, d + 0.2], [-h - 0.15, y1 - 0.05, d + 0.2], [-h - 0.15, y1 + 0.42, 0], [h + 0.15, y1 + 0.42, 0], [h + 0.15, y1 + 0.06, d + 0.2], [-h - 0.15, y1 + 0.06, d + 0.2]]);
  if (D <= 2) for (let x = -h - 0.1; x < h + 0.1; x += 0.2) tri(c, [x, y1 - 0.05, d + 0.21], [x + 0.2, y1 - 0.05, d + 0.21], [x + 0.1, y1 - 0.17, d + 0.21]);
}
// a slender front minaret: square-ish foot, a shaft with lancet slits, a corbelled balcony, a lantern stage, a tiled onion and a brass crescent
function SLIM(c, x, z, D) {
  const n = D <= 2 ? 18 : 10;
  paint(c, TX.sand, ST); LA(c, x, 0, z, [[2.05, 0], [2.05, 1.3], [1.75, 1.6], [1.45, 1.9], [1.45, 10.6], [1.75, 10.95], [2.05, 11.25], [2.05, 11.4]], n, true);
  BX(c, x - 1.05, 11.4, z - 1.05, x + 1.05, 11.4, z + 1.05);
  LA(c, x, 11.4, z, [[2.05, 0], [2.05, 0.95], [1.92, 0.95], [1.92, 0]], n, false);
  LA(c, x, 11.4, z, [[1.0, 0], [1.0, 3.6], [1.3, 3.9], [1.3, 4.1], [1.05, 4.1]], n, true);
  paint(c, TX.tile, TW); for (const y of [3.8, 7.6]) LA(c, x, y, z, [[1.48, 0], [1.48, 0.55]], n, false);
  LA(c, x, 11.5, z, [[2.08, 0], [2.08, 0.3]], n, false);
  LA(c, x, 15.5, z, [[1.0, 0], [1.08, 0.35], [1.22, 0.9], [1.02, 1.6], [0.62, 2.2], [0.26, 2.7], [0.08, 3.0], [0, 3.15]], n, false);
  if (D <= 3) { flatc(c, DARK); for (const [y, r, k] of [[5.0, 1.46, 4], [8.8, 1.46, 4], [12.4, 1.01, 6]]) for (let i = 0; i < k; i++) { const a = (i + 0.5) / k * Math.PI * 2; RB(c, x + Math.cos(a) * r, y + 0.6, z + Math.sin(a) * r, 0.06, 1.2, 0.34, -a * 180 / Math.PI, 0, 0); } }
  if (D <= 2) { flatc(c, BRASS); c.metalness(0.7); LA(c, x, 18.6, z, [[0.1, 0], [0.14, 0.2], [0.05, 0.4], [0.1, 0.6], [0, 1.0]], 8, false);
    for (let i = 0; i < 9; i++) { const a = Math.PI * (0.15 + 0.7 * i / 8); RB(c, x + Math.cos(a) * 0.3, 19.95 + Math.sin(a) * 0.3 - 0.22, z, 0.1, 0.06, 0.04, 0, 0, a * 180 / Math.PI + 90); } c.metalness(null); }
}
function PLANTER(c, x, y, z, D) {
  paint(c, TX.sand, ST2); LA(c, x, y, z, [[0.95, 0], [0.95, 0.12], [0.85, 0.16], [0.85, 0.55], [0.98, 0.6], [0.98, 0.7], [0.8, 0.7], [0.8, 0.5]], 8, true, "y", false);
  if (D <= 2) { paint(c, TX.tile, TW); LA(c, x, y + 0.28, z, [[0.86, 0], [0.86, 0.14]], 8, false, "y", false); }
  flatc(c, "oklch(0.32 0.04 55)"); LA(c, x, y + 0.5, z, [[0.8, 0], [0, 0.04]], 8, false, "y", false);
}
// params.style: desert (default, the original) | marble (white veined marble walls, the same tiles)
const TXS = { marble: { sand: "cdn/texture-white-veined-marble-blocks.png" } };
let TX = TX0;
const useStyle = (c) => { TX = { ...TX0, ...(TXS[c.params?.style] ?? {}) }; };
export function geometry(c) {
  useStyle(c);
  const D = c.lod, n = D <= 2 ? 32 : 16;
  if (D >= 5) { paint(c, TX.sand, ST); BX(c, -20, 0, -19.2, 20, H, 22); paint(c, TX.tile, TW); LA(c, 0, THT, DZ, [[8.1, 0], [8.6, 3], [5.6, 7.6], [0, 11.8]], 8, false); return; }
  // plinth and the front steps
  paint(c, TX.sand, ST2); BX(c, -20.6, -0.8, -19.8, 20.6, FL, 22.6);
  for (let i = 0; i < 3; i++) BX(c, -4.5, -0.4, 22.6 + 0.5 * i, 4.5, FL - 0.15 * (i + 1), 23.1 + 0.5 * i);
  paint(c, TX.flag, "oklch(0.95 0.02 75)"); BX(c, -18.8, FL, -18, 18.8, FL + 0.02, 20.8);
  // walls with their arches and lattice screens
  paint(c, TX.sand, ST);
  walls(spec(), (a, b, d, e, f, g) => BX(c, a, b, d, e, f, g),
    (W, h) => { paint(c, TX.sand, ST); if (h.ap) inFrame(W, h, (t) => ARCHFILL(c, h.w, h.sp, h.ap, W.y1, -t, t, D <= 2 ? 12 : 5)); else { /* flat */ } },
    D <= 3 ? (W, h) => inFrame(W, h, () => LAT(c, h.w, h.bot || W.y0, h.sp, D)) : null);
  paint(c, TX.sand, ST);
  // roofs: gallery roofs, side-room roofs (east has the stair hole), throne-room ceiling ring with the dome's oculus
  for (const s of [-1, 1]) BX(c, Math.min(s * 11.75, s * 18.8), GR, 0, Math.max(s * 11.75, s * 18.8), GR + 0.4, 20.8);
  BX(c, -20, RT, -19.2, -8.4, RTOP, 0);
  BX(c, 8.4, RT, -19.2, 20, RTOP, -14.4); BX(c, 8.4, RT, -14.4, 16, RTOP, -6); BX(c, 8.4, RT, -6, 20, RTOP, 0);
  { const N = 32, r = 7.0, h2 = 7.6; for (let k = 0; k < N; k++) { const a0 = k / N * Math.PI * 2, a1 = (k + 1) / N * Math.PI * 2;
      const sq = (a) => { const cx = Math.cos(a), sz = Math.sin(a), m = h2 / Math.max(Math.abs(cx), Math.abs(sz)); return [cx * m, sz * m]; };
      const [o0x, o0z] = sq(a0), [o1x, o1z] = sq(a1);
      HX(c, [[r * Math.cos(a0), TH, DZ + r * Math.sin(a0)], [o0x, TH, DZ + o0z], [o1x, TH, DZ + o1z], [r * Math.cos(a1), TH, DZ + r * Math.sin(a1)],
        [r * Math.cos(a0), THT, DZ + r * Math.sin(a0)], [o0x, THT, DZ + o0z], [o1x, THT, DZ + o1z], [r * Math.cos(a1), THT, DZ + r * Math.sin(a1)]]); } }
  BX(c, -8.4, TH, -18, 8.4, THT, -16.2); BX(c, -8.4, TH, -1, 8.4, THT, 0);
  // the drum, the onion dome, its finial
  paint(c, TX.sand, ST); LA(c, 0, THT, DZ, [[7.9, 0], [7.9, DRUMH], [8.25, DRUMH + 0.2]], n, false);
  paint(c, TX.tile, TW); LA(c, 0, THT + 0.5, DZ, [[7.93, 0], [7.93, 0.7]], n, false);
  LA(c, 0, THT + DRUMH + 0.2, DZ, [[8.1, 0], [8.6, 1.4], [8.6, 3.2], [7.7, 5.4], [5.6, 7.6], [3.0, 9.2], [1.1, 10.4], [0.35, 11.2], [0, 11.8]], n, false);
  if (D <= 3) { flatc(c, BRASS); c.metalness(0.7); LA(c, 0, THT + DRUMH + 0.15, DZ, [[8.3, 0], [8.3, 0.18]], n, false);
    LA(c, 0, THT + 13.6 + DUP, DZ, [[0.25, 0], [0.32, 0.3], [0.1, 0.6], [0.2, 0.9], [0.06, 1.3], [0, 2.4]], 10, false);
    for (let i = 0; i < 11; i++) { const a = Math.PI * (0.12 + 0.76 * i / 10); RB(c, Math.sin(a) * 0.55, THT + 16.6 + DUP - Math.cos(a) * 0.55, DZ, 0.16, 0.1, 0.06, 0, 0, a * 180 / Math.PI); } c.metalness(null);
    for (let k = 0; k < 16; k++) { const a = (k + 0.5) / 16 * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a), yaw = -a * 180 / Math.PI, P = (r, y) => [ca * r, THT + y, DZ + sa * r];
      paint(c, TX.tile, TW); RB(c, ...P(7.96, 1.45), 0.08, 1.75, 1.15, yaw, 0, 0);
      flatc(c, DARK); RB(c, ...P(8.0, 1.35), 0.06, 1.35, 0.75, yaw, 0, 0);
      for (let j = 0; j < 4; j++) { const t = j / 3; RB(c, ...P(8.0, 2.03 + 0.18 * Math.sin(t * Math.PI / 2) ), 0.06, 0.12, 0.75 * (1 - t) * 0.95 + 0.04, yaw, 0, 0); }
      paint(c, TX.oak, WOOD); RB(c, ...P(8.03, 1.35), 0.03, 1.35, 0.05, yaw, 0, 0); RB(c, ...P(8.03, 1.35), 0.03, 0.05, 0.75, yaw, 0, 0); RB(c, ...P(8.03, 1.0), 0.03, 0.05, 0.75, yaw, 0, 0); RB(c, ...P(8.03, 1.7), 0.03, 0.05, 0.75, yaw, 0, 0); } }
  // the pishtaq portal
  paint(c, TX.sand, ST); BX(c, -5, 0, 22, -3.4, 12, 24.2); BX(c, 3.4, 0, 22, 5, 12, 24.2); BX(c, -3.4, H, 21.4, 3.4, 12, 22);
  ARCHFILL(c, 3.4, FL + 6.4, FL + 9.4, 12, 22, 24.2, D <= 2 ? 14 : 6);
  if (D <= 3) { paint(c, TX.tile, TW); BX(c, -4.9, FL + 0.6, 24.2, -3.55, 11.2, 23.27); BX(c, 3.55, FL + 0.6, 24.2, 4.9, 11.2, 23.27); BX(c, -4.9, 10.4, 24.2, 4.9, 11.2, 23.27);
    ARIB(c, 3.4, FL + 6.4, FL + 9.4, 0.45, 24.2, 24.27); BX(c, -3.4, FL + 4.6, 22, 3.4, FL + 6.2, 22.05);
    frame([0, 0, 22], 0, () => ARIB(c, 1.6, FL + 3.2, FL + 4.6, 0.35, 0, 0.06));
    paint(c, TX.sand, ST); for (let x = -4.8; x < 4.8; x += 1.2) { BX(c, x, 12, 22.2, x + 0.7, 12.5, 24.2); BX(c, x + 0.15, 12.5, 22.4, x + 0.55, 12.8, 24.0); } }
  // tile bands and stepped merlons on the curtain
  if (D <= 3) {
    paint(c, TX.tile, TW);
    BX(c, -20.04, H - 0.9, 22, -5, H - 0.5, 22.04); BX(c, 5, H - 0.9, 22, 20.04, H - 0.5, 22.04); BX(c, -20.04, H - 0.9, -19.24, 20.04, H - 0.5, -19.2);
    BX(c, -20.04, H - 0.9, -19.2, -20, H - 0.5, 22); BX(c, 20, H - 0.9, -19.2, 20.04, H - 0.5, 22);
    paint(c, TX.sand, ST);
    const mer = (x, z, ax) => { if (ax === "x") { BX(c, x - 0.4, H, z - 0.3, x + 0.4, H + 0.6, z + 0.3); BX(c, x - 0.2, H + 0.6, z - 0.2, x + 0.2, H + 0.95, z + 0.2); } else { BX(c, x - 0.3, H, z - 0.4, x + 0.3, H + 0.6, z + 0.4); BX(c, x - 0.2, H + 0.6, z - 0.2, x + 0.2, H + 0.95, z + 0.2); } };
    for (let x = -17.5; x <= 17.5; x += 1.5) { if (Math.abs(x) > 5.4) mer(x, 21.4, "x"); mer(x, -18.6, "x"); }
    for (let z = -16.8; z <= 19.5; z += 1.5) { mer(-19.4, z, "z"); mer(19.4, z, "z"); }
    for (let z = 1; z < 20.5; z += 1.5) for (const s of [-1, 1]) mer(s * 12, z, "z");
    // throne-block parapet and its tile band
    paint(c, TX.tile, TW); BX(c, -8.44, THT - 0.9, -0.04 + 0.04, 8.44, THT - 0.5, 0.04);
    paint(c, TX.sand, ST); for (let x = -7.8; x <= 7.8; x += 1.3) BX(c, x - 0.3, THT, -0.6, x + 0.3, THT + 0.6, 0);
  }
  // roof terrace parapets: the facade's top round the step gap, the stair-hole guard
  BX(c, -18.8, RTOP, -1, -16, RTOP + 1, -0.6); BX(c, -13, RTOP, -1, -8.4, RTOP + 1, -0.6);
  BX(c, 16, RTOP, -1, 18.8, RTOP + 1, -0.6); BX(c, 8.4, RTOP, -1, 13, RTOP + 1, -0.6);
  BX(c, 15.7, RTOP, -14.4, 16, RTOP + 1, -5.7); BX(c, 15.7, RTOP, -6, 18.8, RTOP + 1, -5.7);
  for (let i = 0; i < 3; i++) BX(c, 13, GR + 0.4, 0.28 * i, 16, RTOP - 0.2 * (i + 1), 0.28 * (i + 1));
  // the stair to the roof
  paint(c, TX.sand, ST2); for (let i = 0; i < 30; i++) BX(c, 16, FL, -6 - 0.28 * (i + 1), 18.8, FL + 0.18 * (i + 1), -6 - 0.28 * i);
  // minarets
  for (const [x, z] of [[-20, -19.2], [20, -19.2]]) MINARET(c, x, z, D);
  for (const x of [-20, 20]) SLIM(c, x, 22, D);
  // ---- the street facade: pilasters, lime-plaster panels over a sandstone dado, mashrabiya oriels, blind doors under striped awnings ----
  if (D <= 4) for (const s of [-1, 1]) {
    paint(c, PL, PLC); for (const [a, b] of [[5.0, 9.2], [9.8, 13.7], [14.3, 18.5]]) BX(c, Math.min(s * a, s * b), FL + 1.5, 22, Math.max(s * a, s * b), H - 1.05, 22.04);
    paint(c, TX.sand, ST2); BX(c, Math.min(s * 5, s * 18.6), FL, 22, Math.max(s * 5, s * 18.6), FL + 1.5, 22.12);
    for (const x of [9.5, 14]) BX(c, s * x - 0.3, FL, 22, s * x + 0.3, H - 0.9, 22.28);
    for (const x of [7.1, 16.4]) frame([s * x, 0, 22.04], 0, () => MASH(c, 1.8, FL + 3.0, FL + 5.0, 0.62, D));
    frame([s * 11.75, 0, 22.04], 0, () => { paint(c, TX.sand, ST); BX(c, -1.15, FL, 0, -0.85, FL + 2.5, 0.16); BX(c, 0.85, FL, 0, 1.15, FL + 2.5, 0.16);
      ARCHFILL(c, 0.85, FL + 1.9, FL + 2.6, FL + 2.8, 0, 0.16, D <= 2 ? 8 : 4); flatc(c, DARK); BX(c, -0.85, FL, -0.01, 0.85, FL + 2.5, 0.03);
      if (D <= 2) { paint(c, TX.oak, WOOD); BX(c, -0.8, FL, 0.03, 0.8, FL + 1.9, 0.08); flatc(c, BRASS); for (let y = FL + 0.3; y < FL + 1.9; y += 0.4) for (let x = -0.6; x <= 0.61; x += 0.4) RB(c, x, y, 0.09, 0.05, 0.05, 0.03); } });
    frame([s * 11.75, 0, 22.04], 180, () => AWN(c, -1.5, 1.5, 0, 1.5, FL + 3.0, FL + 2.45, TX.red, TX.ochre, D, { base: 0 }));
  }
  if (D <= 3) { // the gate: carved rosettes in the spandrels, a calligraphy band, open studded door leaves against the niche
    paint(c, TX.sand, "oklch(0.8 0.04 60)"); BX(c, -3.3, FL + 9.7, 24.2, 3.3, FL + 10.1, 24.26);
    for (let x = -3.1; x < 3.1; x += 0.22) BX(c, x, FL + 9.75 + (Math.sin(x * 9) * 0.5 + 0.5) * 0.12, 24.26, x + 0.08, FL + 10.05, 24.29);
    flatc(c, BRASS); c.metalness(0.6); for (const s of [-1, 1]) { LA(c, s * 2.75, FL + 8.6, 24.27, [[0.45, 0], [0.45, 0.04], [0.3, 0.07], [0.1, 0.1], [0, 0.1]], 12, false, "z"); } c.metalness(null);
    paint(c, TX.tile, TW); for (const s of [-1, 1]) BX(c, Math.min(s * 3.4, s * 3.36), FL, 22, Math.max(s * 3.4, s * 3.36), FL + 1.6, 24.2);
    for (const s of [-1, 1]) { paint(c, TX.oak, WOOD); BX(c, Math.min(s * 3.36, s * 3.24), FL, 22.15, Math.max(s * 3.36, s * 3.24), FL + 3.9, 23.75);
      if (D <= 2) { flatc(c, BRASS); for (let y = FL + 0.4; y < FL + 3.8; y += 0.45) for (let z = 22.35; z < 23.7; z += 0.4) RB(c, s * 3.22, y, z, 0.04, 0.06, 0.06); } }
    LAMP(c, 0, FL + 5.0, 23.3, FL + 9.3);
  }
  // the throne block's courtyard face: lime plaster above the doorway, two mashrabiya oriels, awnings over the windows
  paint(c, PL, PLC); BX(c, -8.4, FL + 4.2, 0, 8.4, THT - 0.95, 0.03);
  for (const s of [-1, 1]) { frame([s * 4.6, 0, 0.03], 0, () => MASH(c, 2.0, FL + 5.6, FL + 7.7, 0.7, D));
    frame([s * 5, 0, 0], 180, () => AWN(c, -1.2, 1.2, 0, 1.5, FL + 4.0, FL + 3.4, TX.red, TX.ochre, D, { base: FL })); }
  // arcades: slim engaged columns with carved capitals on every pier, brass lamps hung in the open arches
  for (const s of [-1, 1]) { const fx = s * (11.75 - 0.16);
    if (D <= 3) for (let k = 1; k <= 5; k++) { const z = k * BAY; paint(c, TX.sand, ST2); BX(c, fx - 0.2, FL, z - 0.2, fx + 0.2, FL + 0.35, z + 0.2);
      paint(c, TX.sand, ST); CY(c, fx, FL + 0.35, z, 0.13, 2.05, D <= 2 ? 10 : 6);
      paint(c, TX.tile, TW); BX(c, fx - 0.17, FL + 2.4, z - 0.17, fx + 0.17, FL + 2.5, z + 0.17);
      paint(c, TX.sand, ST2); HX(c, [[fx - 0.14, FL + 2.5, z - 0.14], [fx + 0.14, FL + 2.5, z - 0.14], [fx + 0.14, FL + 2.5, z + 0.14], [fx - 0.14, FL + 2.5, z + 0.14], [fx - 0.26, FL + 2.75, z - 0.26], [fx + 0.26, FL + 2.75, z - 0.26], [fx + 0.26, FL + 2.75, z + 0.26], [fx - 0.26, FL + 2.75, z + 0.26]]);
      BX(c, fx - 0.28, FL + 2.75, z - 0.28, fx + 0.28, FL + 2.85, z + 0.28); }
    if (D <= 2) for (const k of [0, 2, 3, 5]) LAMP(c, s * 12, FL + 2.3, (k + 0.5) * BAY, FL + 3.5);
    // the galleries: long runners, cushions in the screened bays, a low brass tray
    if (D <= 2) { const gx = s * 15.4; paint(c, TX.red, TINT.cloth); BX(c, gx - 1.4, FL + 0.02, 1.2, gx + 1.4, FL + 0.045, 19.6);
      paint(c, TX.ochre, TINT.cloth); BX(c, gx - 1.0, FL + 0.045, 1.6, gx + 1.0, FL + 0.06, 19.2);
      for (const k of [1, 4]) { const z = (k + 0.5) * BAY; CUSH(c, s * 12.7, FL + 0.06, z - 0.6, 0.7, 0.9, 0.24, TX.tile, TINT.cloth); CUSH(c, s * 12.7, FL + 0.06, z + 0.6, 0.7, 0.9, 0.24, TX.red, TINT.cloth);
        CUSH(c, s * 12.55, FL + 0.3, z, 0.25, 1.8, 0.45, TX.ochre, TINT.cloth); flatc(c, BRASS); c.metalness(0.6); LA(c, s * 13.9, FL + 0.06, z, [[0.06, 0], [0.06, 0.3], [0.45, 0.32], [0.45, 0.36], [0.0, 0.36]], 12, false); c.metalness(null); } } }
  // planters for the palms (the palms stand as their own objects)
  for (const [x, z, y] of PLANTERS) PLANTER(c, x, y, z, D);
  // a carpet before the throne door with cushions either side
  if (D <= 2) { paint(c, TX.red, TINT.cloth); BX(c, -2.8, FL + 0.02, 1.4, 2.8, FL + 0.045, 5.2); paint(c, TX.tile, "oklch(0.9 0.04 240)"); BX(c, -2.4, FL + 0.045, 1.8, 2.4, FL + 0.055, 4.8);
    paint(c, TX.red, TINT.cloth); BX(c, -1.6, FL + 0.055, 2.4, 1.6, FL + 0.065, 4.2);
    for (const s of [-1, 1]) for (const z of [2.3, 3.3, 4.3]) CUSH(c, s * 2.4, FL + 0.045, z, 0.7, 0.7, 0.22, z === 3.3 ? TX.ochre : TX.red, TINT.cloth); }
  // the fountain and its rills
  { const fz = 10.4; paint(c, TX.tile, TW); LA(c, 0, FL, fz, [[3.2, 0], [3.2, 0.5], [2.85, 0.5], [2.85, 0.12]], 8, true, "y", false);
    paint(c, TX.sand, ST); LA(c, 0, FL + 0.5, fz, [[3.35, 0], [3.35, 0.12], [2.75, 0.12], [2.75, 0]], 8, false, "y", false);
    LA(c, 0, FL + 0.12, fz, [[0.45, 0], [0.3, 0.5], [0.22, 1.0], [1.1, 1.15], [1.15, 1.3], [0.2, 1.3], [0.16, 1.7], [0.55, 1.8], [0.58, 1.9], [0.1, 1.9], [0.08, 2.2]], 12, true);
    paint(c, TX.tile, TD); for (const s of [-1, 1]) { BX(c, Math.min(s * 3.1, s * 11.6), FL, fz - 0.45, Math.max(s * 3.1, s * 11.6), FL + 0.12, fz - 0.3); BX(c, Math.min(s * 3.1, s * 11.6), FL, fz + 0.3, Math.max(s * 3.1, s * 11.6), FL + 0.12, fz + 0.45); BX(c, Math.min(s * 3.1, s * 11.6), FL, fz - 0.3, Math.max(s * 3.1, s * 11.6), FL + 0.03, fz + 0.3); }
    if (D <= 2) { paint(c, TX.tile, TW); BX(c, -12, FL + 0.02, 0.2, 12, FL + 0.04, 0.6); BX(c, -12, FL + 0.02, 20.2, 12, FL + 0.04, 20.6); BX(c, -1.2, FL + 0.02, 0.6, 1.2, FL + 0.04, 7.2); BX(c, -1.2, FL + 0.02, 13.6, 1.2, FL + 0.04, 20.2);
    } }
  if (D > 2) return;
  // ---- the throne room ----
  paint(c, TX.tile, TW);
  BX(c, -7.6, FL, -16.2, -7.57, FL + 1.4, -5.7); BX(c, -7.6, FL, -4.3, -7.57, FL + 1.4, -1); BX(c, 7.57, FL, -16.2, 7.6, FL + 1.4, -5.7); BX(c, 7.57, FL, -4.3, 7.6, FL + 1.4, -1);
  BX(c, -7.6, FL, -16.2, 7.6, FL + 1.4, -16.17);
  paint(c, TX.sand, ST2); BX(c, -4.5, FL, -16.2, 4.5, FL + 0.18, -12.6); BX(c, -3.8, FL + 0.18, -16.2, 3.8, FL + 0.36, -13.2);
  paint(c, TX.tile, TD); BX(c, -4.5, FL + 0.02, -12.63, 4.5, FL + 0.16, -12.6); BX(c, -3.8, FL + 0.2, -13.23, 3.8, FL + 0.34, -13.2);
  // the throne: a cushioned divan under a carved arch-backed slab
  const ty = FL + 0.36;
  paint(c, TX.sand, ST); BX(c, -1.5, ty, -15.7, 1.5, ty + 0.45, -14.3); BX(c, -1.6, ty, -16.1, 1.6, ty + 2.4, -15.7);
  frame([0, 0, -15.7], 0, () => { ARCHFILL(c, 1.6, ty + 2.4, ty + 3.4, ty + 2.4, -0.4, 0, 8); });
  paint(c, TX.tile, TW); frame([0, 0, -15.68], 0, () => ARIB(c, 1.2, ty + 0.9, ty + 2.6, 0.2, 0, 0.04, 10));
  CUSH(c, 0, ty + 0.45, -15.0, 2.8, 1.2, 0.22, TX.red, TINT.cloth); CUSH(c, -1.2, ty + 0.62, -15.4, 0.4, 0.6, 0.45, TX.ochre, TINT.cloth); CUSH(c, 1.2, ty + 0.62, -15.4, 0.4, 0.6, 0.45, TX.ochre, TINT.cloth);
  CUSH(c, 0, ty + 0.67, -15.55, 1.6, 0.3, 0.55, TX.tile, "oklch(0.9 0.04 240)");
  flatc(c, BRASS); c.metalness(0.7); for (const s of [-1, 1]) LA(c, s * 1.55, ty + 2.4, -15.9, [[0.12, 0], [0.16, 0.2], [0.04, 0.45], [0, 0.6]], 8, false); c.metalness(null);
  // rugs, divans, floor cushions, a water pipe, hanging lamps
  paint(c, TX.red, TINT.cloth); BX(c, -2.6, FL + 0.02, -12.4, 2.6, FL + 0.045, -1.6);
  paint(c, TX.ochre, TINT.cloth); BX(c, -2.2, FL + 0.045, -12.0, 2.2, FL + 0.06, -2.0);
  paint(c, TX.red, "oklch(0.8 0.05 30)"); BX(c, -7.4, FL + 0.02, -12.5, -4.4, FL + 0.04, -7.0); BX(c, 4.4, FL + 0.02, -12.5, 7.4, FL + 0.04, -7.0);
  for (const s of [-1, 1]) { paint(c, TX.sand, ST2); BX(c, Math.min(s * 6.4, s * 7.55), FL, -12.2, Math.max(s * 6.4, s * 7.55), FL + 0.4, -7.4);
    CUSH(c, s * 6.95, FL + 0.4, -9.8, 1.1, 4.6, 0.16, TX.tile, "oklch(0.86 0.05 240)");
    for (const z of [-11.4, -9.8, -8.2]) CUSH(c, s * 7.35, FL + 0.56, z, 0.3, 1.2, 0.5, TX.ochre, TINT.cloth);
    for (const z of [-10.6, -8.6]) CUSH(c, s * 5.2, FL + 0.04, z, 0.8, 0.8, 0.24, s > 0 ? TX.red : TX.tile, TINT.cloth); }
  flatc(c, BRASS); c.metalness(0.6); LA(c, 5.4, FL + 0.04, -11.9, [[0.22, 0], [0.26, 0.2], [0.12, 0.42], [0.04, 0.5], [0.04, 0.95], [0.12, 1.0], [0.05, 1.08]], 10, true); c.metalness(null);
  for (const [x, z] of [[-4.2, -4], [4.2, -4], [-4.2, -11], [4.2, -11]]) LAMP(c, x, FL + 4.2, z, TH);
  // ---- the bedchamber (west) ----
  paint(c, TX.tile, TW); BX(c, -18.8, FL, -18, -8.4, FL + 1.0, -17.97); BX(c, -18.8, FL, -18, -18.77, FL + 1.0, -1);
  paint(c, TX.red, "oklch(0.85 0.05 25)"); BX(c, -16.6, FL + 0.02, -13.8, -10.6, FL + 0.04, -5.6);
  { const bx = -13.6, bz = -16.4, y = FL;
    paint(c, TX.oak, TINT.wood); BX(c, bx - 1.5, y, bz - 1.5, bx + 1.5, y + 0.35, bz + 1.5);
    paint(c, TX.canvas, "oklch(0.95 0.02 85)"); BX(c, bx - 1.42, y + 0.35, bz - 1.42, bx + 1.42, y + 0.6, bz + 1.42);
    paint(c, TX.red, TINT.cloth); BX(c, bx - 1.46, y + 0.45, bz - 0.4, bx + 1.46, y + 0.65, bz + 1.46); BX(c, bx - 1.46, y + 0.2, bz + 1.44, bx + 1.46, y + 0.65, bz + 1.5);
    for (const s of [-1, 1]) CUSH(c, bx + s * 0.7, y + 0.6, bz - 1.05, 1.1, 0.5, 0.2, TX.canvas, "oklch(0.98 0.01 85)");
    CUSH(c, bx, y + 0.6, bz - 1.35, 2.6, 0.25, 0.36, TX.tile, "oklch(0.9 0.04 240)");
    flatc(c, BRASS); c.metalness(0.6); for (const sx of [-1, 1]) for (const sz of [-1, 1]) CY(c, bx + sx * 1.45, y, bz + sz * 1.45, 0.06, 2.9, 8); c.metalness(null);
    paint(c, TX.ochre, TINT.cloth); BX(c, bx - 1.55, y + 2.9, bz - 1.55, bx + 1.55, y + 2.98, bz + 1.55);
    BX(c, bx - 1.55, y + 2.55, bz + 1.5, bx + 1.55, y + 2.9, bz + 1.55); BX(c, bx - 1.55, y + 2.55, bz - 1.55, bx - 1.5, y + 2.9, bz + 1.55); BX(c, bx + 1.5, y + 2.55, bz - 1.55, bx + 1.55, y + 2.9, bz + 1.55);
    paint(c, TX.canvas, "oklch(0.97 0.015 80)"); for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const x = bx + sx * 1.52, z = bz + sz * 1.52; c.quad(x, y + 2.9, z, x - sx * 0.55, y + 2.9, z, x - sx * 0.12, y + 0.25, z, x, y + 0.25, z); c.quad(x, y + 2.9, z, x, y + 0.25, z, x, y + 0.25, z - sz * 0.12, x, y + 2.9, z - sz * 0.55); }
    paint(c, TX.canvas, "oklch(0.97 0.015 80)"); c.quad(bx - 1.52, y + 2.9, bz - 1.53, bx + 1.52, y + 2.9, bz - 1.53, bx + 1.52, y + 0.4, bz - 1.53, bx - 1.52, y + 0.4, bz - 1.53);
    paint(c, TX.oak, TINT.wood); BX(c, bx - 0.8, y, bz + 2.0, bx + 0.8, y + 0.55, bz + 2.6); flatc(c, BRASS); BX(c, bx - 0.82, y + 0.42, bz + 1.98, bx + 0.82, y + 0.47, bz + 2.62);
    paint(c, TX.oak, TINT.wood); BX(c, -18.6, y, -4.6, -17.6, y + 0.5, -2.4);
    POT(c, -18.1, y + 0.5, -3.0, 0.45, D, "oklch(0.8 0.08 220)"); POT(c, -18.1, y + 0.5, -3.9, 0.35, D);
    CUSH(c, -10.2, y, -3.2, 0.9, 0.9, 0.28, TX.tile, TINT.cloth); LAMP(c, -11.2, y + 3.4, -10.5, RT); }
  // ---- the vizier's study (east) ----
  paint(c, TX.red, "oklch(0.8 0.05 40)"); BX(c, 9.2, FL + 0.02, -15.5, 14.8, FL + 0.04, -8.5);
  paint(c, TX.oak, TINT.wood); BX(c, 10.6, FL, -12.6, 13.2, FL + 0.08, -11.4); for (const [x, z] of [[10.7, -12.5], [13.1, -12.5], [10.7, -11.5], [13.1, -11.5]]) BX(c, x - 0.05, FL, z - 0.05, x + 0.05, FL + 0.42, z + 0.05);
  BX(c, 10.6, FL + 0.42, -12.6, 13.2, FL + 0.5, -11.4);
  CUSH(c, 11.9, FL, -10.6, 1.0, 0.9, 0.26, TX.tile, TINT.cloth);
  paint(c, TX.canvas, "oklch(0.95 0.03 85)"); for (let i = 0; i < 4; i++) RB(c, 11 + i * 0.5, FL + 0.56, -12.0, 0.12, 0.12, 0.7, 0, 90, 0);
  paint(c, TX.oak, TINT.wood); BX(c, 8.8, FL, -17.95, 15.2, FL + 3.0, -17.4);
  for (let y = 0; y < 3; y += 0.5) BX(c, 8.8, FL + y, -17.4, 15.2, FL + y + 0.05, -17.35);
  for (let x = 8.8; x <= 15.25; x += 0.4) BX(c, x, FL, -17.4, x + 0.04, FL + 3.0, -17.35);
  paint(c, TX.canvas, "oklch(0.93 0.04 85)"); for (let y = 0.05; y < 2.9; y += 0.5) for (let x = 8.9; x < 15.1; x += 0.4) if (c.random() < 0.8) LA(c, x + 0.18, FL + y + 0.12, -17.65, [[0.07, -0.25], [0.07, 0.25]], 6, true, "z", false);
  paint(c, TX.oak, TINT.wood); BX(c, 9.0, FL, -3.0, 10.6, FL + 0.6, -2.0); flatc(c, BRASS); BX(c, 8.98, FL + 0.5, -3.02, 10.62, FL + 0.54, -1.98);
  LAMP(c, 12, FL + 3.4, -8.4, RT);
  // ---- the roof terrace (east roof) ----
  frame([11.8, RTOP, -18.4], 180, () => AWN(c, -3, 3, 0, 2.8, 2.5, 2.1, TX.red, TX.ochre, D, { base: 0 }));
  paint(c, TX.red, TINT.cloth); BX(c, 9.2, RTOP, -17.8, 14.4, RTOP + 0.03, -15.2);
  for (const x of [9.8, 11.2, 12.6, 14.0]) CUSH(c, x, RTOP + 0.03, -17.5, 1.1, 0.6, 0.3, x === 11.2 || x === 14 ? TX.tile : TX.ochre, TINT.cloth);
  paint(c, TX.oak, TINT.wood); BX(c, 11.2, RTOP, -16.7, 12.6, RTOP + 0.35, -16.0); POT(c, 11.9, RTOP + 0.35, -16.35, 0.3, D, "oklch(0.8 0.08 220)");
  POT(c, 9.0, RTOP, -6.0, 0.9, D); POT(c, 9.0, RTOP, -10.0, 0.7, D);
  flatc(c, BRASS); c.metalness(0.7); RB(c, 15.0, RTOP + 1.25, -2.0, 0.08, 0.08, 1.0, 30, 12, 0); BX(c, 14.96, RTOP, -2.04, 15.04, RTOP + 1.2, -1.96); c.metalness(null);
}
export function collider(c) {
  useStyle(c);
  const L = CB();
  L(-20.6, -0.8, -19.8, 20.6, FL, 22.6);
  for (let i = 0; i < 3; i++) L(-4.5, -0.4, 22.6 + 0.5 * i, 4.5, FL - 0.15 * (i + 1), 23.1 + 0.5 * i);
  walls(spec(), (a, b, d, e, f, g) => L(a, b, d, e, f, g), (W, h, seg) => seg(h.c - h.w, h.c + h.w, h.sp, W.y1), (W, h) => {
    const y0 = h.bot || W.y0; if (W.ax === "x") L(h.c - h.w, y0, W.b0, h.c + h.w, h.sp, W.b1); else L(W.b0, y0, h.c - h.w, W.b1, h.sp, h.c + h.w); });
  for (const s of [-1, 1]) L(Math.min(s * 11.75, s * 18.8), GR, 0, Math.max(s * 11.75, s * 18.8), GR + 0.4, 20.8);
  L(-20, RT, -19.2, -8.4, RTOP, 0); L(8.4, RT, -19.2, 20, RTOP, -14.4); L(8.4, RT, -14.4, 16, RTOP, -6); L(8.4, RT, -6, 20, RTOP, 0);
  L(-8.4, TH, -18, 8.4, THT, 0);
  L(-20, H, -19.2, 20, H + 0.95, -18); L(-20, H, 20.8, 20, H + 0.95, 22); L(-20, H, -19.2, -18.8, H + 0.95, 22); L(18.8, H, -19.2, 20, H + 0.95, 22);
  for (const s of [-1, 1]) L(s * 12 - 0.25, GR + 0.4, 0, s * 12 + 0.25, GR + 1.3, 20.8);
  L(-18.8, RTOP, -1, -16, RTOP + 1, -0.6); L(-13, RTOP, -1, -8.4, RTOP + 1, -0.6); L(16, RTOP, -1, 18.8, RTOP + 1, -0.6); L(8.4, RTOP, -1, 13, RTOP + 1, -0.6);
  L(15.7, RTOP, -14.4, 16, RTOP + 1, -5.7); L(15.7, RTOP, -6, 18.8, RTOP + 1, -5.7);
  for (let i = 0; i < 3; i++) L(13, GR + 0.4, 0.28 * i, 16, RTOP - 0.2 * (i + 1), 0.28 * (i + 1));
  for (let i = 0; i < 30; i++) L(16, FL, -6 - 0.28 * (i + 1), 18.8, FL + 0.18 * (i + 1), -6 - 0.28 * i);
  L(-5, 0, 22, -3.4, 12, 24.2); L(3.4, 0, 22, 5, 12, 24.2);
  for (const x of [-20, 20]) { L.list.push({ kind: "cylinder", radiusTop: 2.05, radiusBottom: 2.05, height: 1.6, center: [x, 0.8, 22] }); L.list.push({ kind: "cylinder", radiusTop: 1.5, radiusBottom: 1.5, height: 15.4, center: [x, 7.7, 22] }); }
  for (const [x, z, y] of PLANTERS) L.list.push({ kind: "cylinder", radiusTop: 0.98, radiusBottom: 0.98, height: 0.7, center: [x, y + 0.35, z] });
  for (const [x, z] of [[-20, -19.2], [20, -19.2]]) L.list.push({ kind: "cylinder", radiusTop: 2.4, radiusBottom: 2.4, height: 13, center: [x, 6.5, z] });
  L.list.push({ kind: "cylinder", radiusTop: 3.2, radiusBottom: 3.2, height: 0.62, center: [0, FL + 0.31, 10.4] });
  L(-4.5, FL, -16.2, 4.5, FL + 0.18, -12.6); L(-3.8, FL + 0.18, -16.2, 3.8, FL + 0.36, -13.2);
  L(-1.6, FL + 0.36, -16.1, 1.6, FL + 2.8, -14.3);
  for (const s of [-1, 1]) L(Math.min(s * 6.4, s * 7.55), FL, -12.2, Math.max(s * 6.4, s * 7.55), FL + 0.6, -7.4);
  L(-15.1, FL, -17.9, -12.1, FL + 0.65, -14.9); L(-14.4, FL, -14.4, -12.8, FL + 0.55, -13.8);
  L(10.6, FL, -12.6, 13.2, FL + 0.5, -11.4); L(8.8, FL, -17.95, 15.2, FL + 3.0, -17.35);
  return L.list;
}
