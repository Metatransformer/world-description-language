// THE HIGH KING'S CASTLE, HIGHBRIDGE: pale limestone and blue slate, tucked into the city's north-west corner.
// Local origin = footprint centre on the ground; x east, z south (+Z). Footprint x -30..30, z -19..19.
// Curtain wall round a flagged court, the gatehouse on the EAST side (two round towers, a raised portcullis),
// the keep in the west: a pillared throne hall (door east, throne west on a dais, red runner, hearth on the north
// wall), the royal bedchamber (south-west) and the regent's solar (south-east) off the hall's south wall.
import { paint, flatc, glow, BX, LA, CY, CB, OAK, IR, FLAG, WOOD, IRONC } from "../lib/buildkit.js";
const LIME = "cdn/texture-pale-limestone-ashlar-blocks.png", BSL = "cdn/texture-blue-slate-roof-shingles.png";
const RUN = "cdn/texture-red-wool-carpet-gold-border.png", BLUE = "cdn/texture-royal-blue-wool-cloth.png", HAY = "cdn/texture-hay-bale-straw.png";
const LC = "oklch(0.97 0.01 85)", LC2 = "oklch(0.9 0.015 80)", SLC = "oklch(0.85 0.04 250)", GOLD = "oklch(0.82 0.13 85)";
const CF = 0.15, KF = 0.45, CH = 7.5, KH = 15, HALL = KF + 8, LOW = KF + 4.5;
// a wall run along x (ax "x": a = x, b = z) or along z, with holes { c, w, top, bot }
function run(B, ax, a0, a1, b0, b1, y0, y1, holes = []) {
  const box = (s0, s1, h0, h1) => ax === "x" ? B(s0, h0, b0, s1, h1, b1) : B(b0, h0, s0, b1, h1, s1);
  let s = a0; for (const h of [...holes].sort((p, q) => p.c - q.c)) { const l = h.c - h.w / 2, r = h.c + h.w / 2;
    if (l > s) box(s, l, y0, y1); box(l, r, h.top, y1); if (h.bot) box(l, r, y0, h.bot); s = r; }
  if (a1 > s) box(s, a1, y0, y1);
}
function shell(B) { // everything a body meets: the same boxes in mesh and collider
  B(-30, -0.6, -19, 30, CF, 19, "flag");
  run(B, "x", -30, 30, 17, 19, CF, CH); run(B, "x", -30, 30, -19, -17, CF, CH);
  run(B, "z", -17, 17, -30, -28, CF, CH); run(B, "z", -17, 17, 28, 30, CF, CH, [{ c: 0, w: 3.6, top: 4.2 }]);
  B(27, CF, -4.2, 33, 11, -1.8); B(27, CF, 1.8, 33, 11, 4.2); B(27, 4.2, -1.8, 33, 11, 1.8);
  // keep
  B(-26, CF, -15, -2, KF, 13, "flag");
  run(B, "x", -26, -2, -15, -13.8, KF, KH); run(B, "x", -26, -2, 11.8, 13, KF, KH);
  run(B, "z", -13.8, 11.8, -26, -24.8, KF, KH);
  run(B, "z", -13.8, 11.8, -3.2, -2, KF, KH, [{ c: -6.4, w: 1.8, top: KF + 3.2 }]);
  run(B, "x", -24.8, -3.2, 1, 2.2, KF, HALL, [{ c: -18, w: 1.3, top: KF + 2.4 }, { c: -7.5, w: 1.3, top: KF + 2.4 }]);
  run(B, "z", 2.2, 11.8, -13, -11.8, KF, LOW);
  B(-24.8, HALL, -13.8, -3.2, HALL + 0.5, 1, "ceil"); B(-24.8, LOW, 2.2, -3.2, LOW + 0.4, 11.8, "ceil");
  B(-26, KH - 0.4, -15, -2, KH, 13);
  for (let i = 0; i < 2; i++) B(-2 + 0.3 * i, CF, -7.6, -1.4 + 0.3 * i, KF - 0.15 * i, -5.2, "flag");
  // dais and throne
  B(-24.8, KF, -10, -21.5, KF + 0.18, -2.8, "dais"); B(-24.8, KF + 0.18, -9.4, -22.2, KF + 0.36, -3.4, "dais");
}
const MER = (c, x0, z0, x1, z1, y) => { const L = Math.hypot(x1 - x0, z1 - z0), n = Math.floor(L / 2); for (let i = 0; i < n; i++) { const t = (i + 0.25) / n, u = (i + 0.75) / n;
  BX(c, x0 + (x1 - x0) * t, y, z0 + (z1 - z0) * t, x0 + (x1 - x0) * u + (z1 === z0 ? 0 : 0.8), y + 1, z0 + (z1 - z0) * u + (x1 === x0 ? 0 : 0.8)); } };
function TOWER(c, x, z, r, h, D, pen) { const n = D <= 2 ? 16 : 10;
  paint(c, LIME, LC); LA(c, x, CF - 0.3, z, [[r + 0.3, 0], [r + 0.3, 1.2], [r, 1.6], [r, h], [r + 0.35, h + 0.3], [r + 0.35, h + 1.1]], n, true, "y", false);
  paint(c, BSL, SLC); LA(c, x, h + 1.1, z, [[r + 0.6, 0], [r * 0.55, r * 1.3], [0.02, r * 2.6]], n, false, "y", false);
  flatc(c, "oklch(0.18 0.01 60)"); for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + 0.4, y = h * (0.45 + 0.15 * (k % 2));
    const px = x + Math.cos(a) * (r + 0.02), pz = z + Math.sin(a) * (r + 0.02); BX(c, px - 0.12, y, pz - 0.12, px + 0.12, y + 1.1, pz + 0.12); }
  if (pen && D <= 3) { const top = h + 1.1 + r * 2.6; flatc(c, IRONC); BX(c, x - 0.04, top - 0.2, z - 0.04, x + 0.04, top + 2.2, z + 0.04);
    paint(c, BLUE, "oklch(0.75 0.12 255)"); c.quad(x, top + 2.15, z, x, top + 1.35, z, x + 1.6, top + 1.75, z + 0.05, x + 1.6, top + 1.75, z + 0.05);
    c.quad(x + 1.6, top + 1.75, z + 0.05, x, top + 1.35, z, x, top + 2.15, z, x + 1.6, top + 1.75, z + 0.05); } }
function BED(c, bx, bz, D) { const y = KF; // head against the south wall (+z)
  paint(c, OAK, WOOD); BX(c, bx - 1.1, y, bz - 1.3, bx + 1.1, y + 0.4, bz + 1.3); BX(c, bx - 1.15, y, bz + 1.3, bx + 1.15, y + 1.4, bz + 1.45);
  paint(c, HAY, "oklch(0.95 0.03 85)"); BX(c, bx - 1.0, y + 0.4, bz - 1.2, bx + 1.0, y + 0.62, bz + 1.25);
  paint(c, BLUE, "oklch(0.85 0.08 255)"); BX(c, bx - 1.05, y + 0.5, bz - 1.25, bx + 1.05, y + 0.68, bz + 0.6); BX(c, bx - 1.05, y + 0.15, bz - 1.28, bx + 1.05, y + 0.68, bz - 1.25);
  paint(c, "cdn/texture-canvas-weathered.png", "oklch(0.98 0.01 85)"); BX(c, bx - 0.8, y + 0.62, bz + 0.75, bx + 0.8, y + 0.82, bz + 1.2);
  paint(c, OAK, WOOD); for (const sx of [-1, 1]) for (const sz of [-1, 1]) BX(c, bx + sx * 1.1 - 0.07, y, bz + sz * 1.37 - 0.07, bx + sx * 1.1 + 0.07, y + 3.0, bz + sz * 1.37 + 0.07);
  paint(c, RUN, "oklch(0.8 0.12 25)"); BX(c, bx - 1.2, y + 3.0, bz - 1.45, bx + 1.2, y + 3.12, bz + 1.45);
  for (const sx of [-1, 1]) BX(c, bx + sx * 1.18 - 0.02, y + 1.0, bz - 1.45, bx + sx * 1.18 + 0.02, y + 3.0, bz - 0.9);
  BX(c, bx - 1.2, y + 2.6, bz - 1.47, bx + 1.2, y + 3.0, bz - 1.43);
  paint(c, OAK, WOOD); BX(c, bx - 0.7, y, bz - 2.2, bx + 0.7, y + 0.55, bz - 1.6); flatc(c, IRONC); BX(c, bx - 0.72, y + 0.42, bz - 2.22, bx + 0.72, y + 0.47, bz - 1.58); }
export function geometry(c) {
  const D = c.lod;
  if (D >= 5) { paint(c, LIME, LC); BX(c, -30, 0, -19, 30, CH, 19); BX(c, -26, 0, -15, -2, KH, 13); return; }
  const B = (x0, y0, z0, x1, y1, z1, k) => {
    if (k === "flag") paint(c, FLAG, "oklch(0.92 0.01 80)"); else if (k === "ceil") paint(c, OAK, WOOD); else if (k === "dais") paint(c, LIME, LC2); else paint(c, LIME, LC);
    BX(c, x0, y0, z0, x1, y1, z1); };
  shell(B);
  paint(c, LIME, LC2);
  if (D <= 3) { MER(c, -30, 18.2, 30, 18.2, CH); MER(c, -30, -18.6, 30, -18.6, CH); MER(c, -29.6, -17, -29.6, 17, CH); MER(c, 29.6, -17, 29.6, -4.2, CH); MER(c, 29.6, 4.2, 29.6, 17, CH);
    MER(c, -26, -15, -2, -15, KH); MER(c, -26, 12.6, -2, 12.6, KH); MER(c, -25.6, -15, -25.6, 13, KH); MER(c, -2.4, -15, -2.4, 13, KH); MER(c, 32.6, -4.2, 32.6, 4.2, 11); }
  // plinth course on the keep and the curtain
  BX(c, -26.2, CF, -15.2, -1.8, CF + 0.6, -15); BX(c, -26.2, CF, 13, -1.8, CF + 0.6, 13.2); BX(c, -2, CF, -15.2, -1.8, CF + 0.6, -7.6); BX(c, -2, CF, -5.2, -1.8, CF + 0.6, 13.2);
  BX(c, -26.2, KH - 1.6, -15.2, -1.8, KH - 1.3, -15); BX(c, -26.2, KH - 1.6, 13, -1.8, KH - 1.3, 13.2); BX(c, -26.2, KH - 1.6, -15.2, -26, KH - 1.3, 13.2); BX(c, -2, KH - 1.6, -15.2, -1.8, KH - 1.3, 13.2);
  // towers
  for (const [x, z] of [[-29, -18], [-29, 18], [29, -18], [29, 18]]) TOWER(c, x, z, 2.8, 10, D, false);
  for (const z of [-4.4, 4.4]) TOWER(c, 31, z, 3.0, 12.5, D, true);
  for (const [x, z] of [[-26, -15], [-2, -15], [-26, 13], [-2, 13]]) TOWER(c, x, z, 2.5, 19, D, true);
  // keep doorway frame, gate lintel and the royal arms over the gate
  paint(c, LIME, LC2); BX(c, -1.95, KF, -7.6, -1.8, KF + 3.6, -7.3); BX(c, -1.95, KF, -5.5, -1.8, KF + 3.6, -5.2); BX(c, -1.95, KF + 3.2, -7.6, -1.8, KF + 3.7, -5.2);
  paint(c, OAK, WOOD); BX(c, -3.15, KF, -7.3, -1.95, KF + 0.04, -5.5);
  paint(c, LIME, LC2); BX(c, 33, 4.2, -2.2, 33.3, 4.8, 2.2); paint(c, BLUE, "oklch(0.75 0.12 255)"); BX(c, 33.05, 5.4, -1.0, 33.15, 8.4, 1.0); flatc(c, GOLD); BX(c, 33.12, 6.2, -0.5, 33.2, 7.6, 0.5);
  // the portcullis, raised: its teeth hang 3.2 m up in the passage
  flatc(c, "oklch(0.35 0.01 250)"); c.metalness(0.6);
  for (let z = -1.6; z <= 1.65; z += 0.4) { BX(c, 31.45, 3.25, z - 0.05, 31.55, 4.4, z + 0.05); if (D <= 3) { c.tri(31.5, 3.0, z, 31.5, 3.25, z - 0.05, 31.5, 3.25, z + 0.05); c.tri(31.5, 3.0, z, 31.5, 3.25, z + 0.05, 31.5, 3.25, z - 0.05); } }
  for (const y of [3.4, 3.9]) BX(c, 31.42, y, -1.8, 31.58, y + 0.1, 1.8); c.metalness(null);
  // gate leaves, swung open against the passage walls
  paint(c, OAK, WOOD); BX(c, 28.4, CF, -1.8, 30.1, 4.0, -1.68); BX(c, 28.4, CF, 1.68, 30.1, 4.0, 1.8);
  // slit windows round the keep
  flatc(c, "oklch(0.15 0.01 60)"); for (const x of [-20, -14, -8]) for (const y of [5, 10]) { BX(c, x, KF + y, -15.05, x + 0.3, KF + y + 1.6, -15); BX(c, x, KF + y, 13, x + 0.3, KF + y + 1.6, 13.05); }
  if (D >= 4) return;
  // ---- the throne hall ----
  glow(c, "oklch(0.9 0.04 220)", [0.5, 0.55, 0.6]); for (const x of [-21, -16, -11, -6]) BX(c, x - 0.35, KF + 4.5, -13.79, x + 0.35, KF + 7, -13.77);
  paint(c, RUN, "oklch(0.85 0.1 25)"); BX(c, -22.2, KF + 0.36, -7.2, -21.5, KF + 0.38, -5.6); BX(c, -21.5, KF + 0.18, -7.2, -3.2, KF + 0.2, -5.6); BX(c, -22.2, KF, -7.2, -21.5, KF + 0.2, -7.15);
  BX(c, -21.5, KF, -7.2, -3.2, KF + 0.02, -5.6);
  for (const z of [-10.6, -2.2]) for (const x of [-19.5, -15, -10.5, -6]) { paint(c, LIME, LC2); BX(c, x - 0.7, KF, z - 0.7, x + 0.7, KF + 0.5, z + 0.7); BX(c, x - 0.7, HALL - 0.6, z - 0.7, x + 0.7, HALL, z + 0.7);
    paint(c, LIME, LC); CY(c, x, KF + 0.5, z, 0.5, HALL - KF - 1.1, D <= 2 ? 12 : 8); }
  paint(c, OAK, WOOD); for (let x = -23.8; x < -3.5; x += 2.2) BX(c, x, HALL - 0.45, -13.8, x + 0.35, HALL, 1);
  // the throne
  const ty = KF + 0.36; paint(c, OAK, "oklch(0.8 0.03 60)"); BX(c, -24.4, ty, -7.2, -23.0, ty + 0.5, -5.6); BX(c, -24.8, ty, -7.4, -24.3, ty + 3.6, -5.4);
  BX(c, -24.4, ty + 0.5, -7.4, -23.0, ty + 0.9, -7.2); BX(c, -24.4, ty + 0.5, -5.6, -23.0, ty + 0.9, -5.4);
  flatc(c, GOLD); c.metalness(0.6); BX(c, -24.82, ty + 3.6, -7.5, -24.3, ty + 3.9, -5.3); for (const z of [-7.3, -6.4, -5.5]) LA(c, -24.55, ty + 3.9, z, [[0.12, 0], [0.04, 0.35]], 6, true); c.metalness(null);
  paint(c, BLUE, "oklch(0.8 0.1 255)"); BX(c, -24.3, ty + 0.5, -7.1, -23.05, ty + 0.62, -5.7);
  // banners on the west wall
  for (const z of [-11.8, -6.4, -1.0]) { const big = z === -6.4, w = big ? 1.1 : 0.8, top = HALL - 0.6, bot = big ? KF + 4.9 : KF + 2.8;
    paint(c, BLUE, "oklch(0.75 0.12 255)"); c.quad(-24.75, top, z - w, -24.75, top, z + w, -24.75, bot + 0.5, z + w, -24.75, bot + 0.5, z - w); c.tri(-24.75, bot + 0.5, z - w, -24.75, bot + 0.5, z + w, -24.75, bot, z);
    flatc(c, GOLD); BX(c, -24.78, bot + 1.0, z - 0.12, -24.73, top - 0.6, z + 0.12); BX(c, -24.8, top - 0.05, z - w - 0.1, -24.7, top + 0.05, z + w + 0.1); }
  // braziers flanking the dais
  for (const z of [-9.2, -3.6]) { flatc(c, "oklch(0.35 0.01 250)"); c.metalness(0.5); CY(c, -20.6, KF, z, 0.05, 0.9, 6); LA(c, -20.6, KF + 0.9, z, [[0.1, 0], [0.4, 0.25], [0.42, 0.3]], 10, true); c.metalness(null);
    glow(c, "oklch(0.8 0.15 55)", [1.8, 0.8, 0.25]); BX(c, -20.85, KF + 1.1, z - 0.25, -20.35, KF + 1.18, z + 0.25); }
  // the hearth on the north wall
  paint(c, LIME, LC2); BX(c, -16, KF, -13.8, -15.5, KF + 2.2, -12.8); BX(c, -12.5, KF, -13.8, -12, KF + 2.2, -12.8); BX(c, -16.2, KF + 2.2, -13.8, -11.8, KF + 2.7, -12.6); BX(c, -15.7, KF + 2.7, -13.8, -12.3, KF + 6.2, -13.1);
  flatc(c, "oklch(0.12 0.01 40)"); BX(c, -15.5, KF, -13.79, -12.5, KF + 2.2, -13.7); paint(c, OAK, WOOD); for (const x of [-14.6, -13.4]) BX(c, x - 0.6, KF + 0.05, -13.4, x + 0.6, KF + 0.25, -13.2);
  // long table and benches on the south side for petitioners
  paint(c, OAK, WOOD); BX(c, -17.5, KF + 0.75, -0.6, -8.5, KF + 0.85, 0.4); for (const x of [-17.2, -8.8]) BX(c, x - 0.1, KF, -0.4, x + 0.1, KF + 0.75, 0.2); BX(c, -17.5, KF + 0.42, -1.4, -8.5, KF + 0.5, -1.0); BX(c, -17.3, KF, -1.3, -17.1, KF + 0.42, -1.1); BX(c, -8.9, KF, -1.3, -8.7, KF + 0.42, -1.1);
  // ---- the royal bedchamber ----
  paint(c, RUN, "oklch(0.8 0.08 25)"); BX(c, -23.5, KF, 3.5, -15, KF + 0.025, 8.5);
  BED(c, -21, 9.9, D);
  paint(c, OAK, WOOD); BX(c, -24.8, KF, 3.0, -24.1, KF + 2.4, 5.0); BX(c, -24.12, KF + 0.2, 3.95, -24.05, KF + 2.2, 4.05); BX(c, -16, KF, 10.9, -14.6, KF + 0.8, 11.8); flatc(c, GOLD); CY(c, -15.3, KF + 0.8, 11.35, 0.06, 0.25, 6);
  glow(c, "oklch(0.9 0.04 220)", [0.5, 0.55, 0.6]); BX(c, -19, KF + 1.6, 11.77, -18.4, KF + 3.4, 11.8);
  // ---- the regent's solar ----
  paint(c, OAK, WOOD); BX(c, -9.4, KF + 0.8, 6, -5.8, KF + 0.9, 8); for (const [x, z] of [[-9.2, 6.2], [-6, 6.2], [-9.2, 7.8], [-6, 7.8]]) BX(c, x - 0.07, KF, z - 0.07, x + 0.07, KF + 0.8, z + 0.07);
  paint(c, "cdn/texture-canvas-weathered.png", "oklch(0.93 0.04 85)"); BX(c, -9.0, KF + 0.9, 6.3, -6.2, KF + 0.92, 7.7);
  paint(c, OAK, WOOD); BX(c, -7.9, KF, 8.6, -7.1, KF + 0.45, 9.3); BX(c, -7.9, KF + 0.45, 9.2, -7.1, KF + 1.4, 9.3);
  BX(c, -11.75, KF, 3.0, -11.4, KF + 2.6, 10.5); for (let y = 0.5; y < 2.6; y += 0.6) BX(c, -11.4, KF + y, 3.0, -11.1, KF + y + 0.05, 10.5);
  paint(c, "cdn/texture-canvas-weathered.png", "oklch(0.85 0.06 60)"); for (let y = 0.55; y < 2.5; y += 0.6) for (let z = 3.1; z < 10.4; z += 0.32) if (c.random() < 0.75) BX(c, -11.38, KF + y, z, -11.16, KF + y + 0.4 + c.random() * 0.12, z + 0.2);
  paint(c, BLUE, "oklch(0.8 0.1 255)"); BX(c, -9.5, KF, 3.4, -5.5, KF + 0.025, 5.4);
  // the court: barrels, a mounting block
  paint(c, OAK, WOOD); for (const [x, z] of [[24, 15.4], [25, 15.6], [24.5, 14.6]]) LA(c, x, CF, z, [[0.3, 0], [0.36, 0.45], [0.3, 0.9]], 8, true);
}
export function collider(c) {
  const L = CB(); shell((x0, y0, z0, x1, y1, z1) => L(x0, y0, z0, x1, y1, z1));
  for (const [x, z, r, h] of [[-29, -18, 2.8, 10], [-29, 18, 2.8, 10], [29, -18, 2.8, 10], [29, 18, 2.8, 10], [31, -4.4, 3, 12.5], [31, 4.4, 3, 12.5], [-26, -15, 2.5, 19], [-2, -15, 2.5, 19], [-26, 13, 2.5, 19], [-2, 13, 2.5, 19]]) L(x - r, CF, z - r, x + r, h, z + r);
  for (const z of [-10.6, -2.2]) for (const x of [-19.5, -15, -10.5, -6]) L(x - 0.55, KF, z - 0.55, x + 0.55, HALL, z + 0.55);
  L(-24.8, KF, -7.4, -23.0, KF + 0.9, -5.4); L(-16.2, KF, -13.8, -11.8, KF + 2.7, -12.6);
  L(-17.5, KF, -0.6, -8.5, KF + 0.85, 0.4); L(-22.1, KF, 8.5, -19.9, KF + 0.7, 11.8); L(-21.7, KF, 7.7, -20.3, KF + 0.55, 8.3); L(-9.4, KF, 6, -5.8, KF + 0.9, 8);
  L(-11.8, KF, 3.0, -11.1, KF + 2.6, 10.5); L(-24.8, KF, 3.0, -24.1, KF + 2.4, 5.0);
  return L.list;
}
