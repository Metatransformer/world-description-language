// THE ANNVYR CASTLE, Highbridge's crown on the west bluff. One generator, params.kind:
//   keep      the great keep on its podium (72 x 72 m crown terrace, top at +0.1): 26 x 22 m ashlar block, four corner
//             turrets, a main tower to ~42 m, and an enterable THRONE HALL (door on +x, columns, dais, hearth, side chamber)
//   stair     the Castle Steps: three flights of 15 steps (0.18 / 0.28) with landings, statues, braziers; top at local x 0
//             (+8.1 m), foot at x 17.6 (0 m), width params.w (default 14)
//   curtain   a straight curtain wall along local x, params.len, h (12), foot (30); outer face on local -z; params.ban banners
//   tower     a round wall tower, params.r, h, foot; lead cone roof over a crimson-timbered gallery, gilded finial, flag
//   gatehouse the east gate: passage along local x (floor +0.2 = the Span deck), twin round towers at z +-9.5
//   chapel    enterable royal chapel, 9 x 18 m, door on -z, stained glass, rear steeple
//   barracks  closed two-storey ashlar hall 24 x 8 m, door on -z
//   stables   open stable range 16 x 7 m, open on -z
//   garden    the garden court 18 x 14 m: hedged parterre, yews, a well, benches
//   well      a roofed draw well
//   lamp      a lamp post whose lantern sits at the origin (the row carries the light); params.h post height
// Styles: hb-royal (cream ashlar, lead-blue roofs, gold, crimson). Detail branches on c.lod.
import { paint, flatc, glow, HX, BX, RB, LA, CY, SEG, PIPE, CB, OAK, IR, IRONC, WOOD, TOWERROOF } from "../lib/buildkit.js";
import { lampPost } from "../lib/pieces/lamppost.js";
import { castleWindow } from "../lib/pieces/window.js";   // shared window, the castle look   // shared lamp post, the castle look
const ASH = "cdn/texture-ashlar-cream-limestone-two-courses-big-dressed-blocks-thin-pale-mortar-subtle-weathering.png", LEAD = "cdn/texture-blue-grey-lead-slate-roof-tiles.png",
  CLOTH = "cdn/texture-faded-red-cloth-weave.png", FLAGT = "cdn/texture-flagstone-floor-worn.png";
const CREAM = "oklch(0.94 0.05 78)", TRIM = "oklch(0.99 0.012 90)", LEADC = "oklch(0.9 0.05 255)", RED = "oklch(0.96 0.04 25)",
  GOLDC = "oklch(0.8 0.14 85)", DARK = "oklch(0.18 0.01 60)", YEW = "oklch(0.36 0.08 145)", TIMBER = "oklch(0.42 0.14 25)";
const WARM = [1.7, 0.9, 0.34], FIRE = [3.2, 1.4, 0.35];
const SGC = [[0.25, 0.45, 1.7], [1.7, 0.22, 0.18], [1.8, 1.15, 0.3], [0.25, 0.9, 0.5]];
const ash = (c, col = CREAM) => paint(c, ASH, col), lead = (c) => paint(c, LEAD, LEADC);
const gold = (c) => { flatc(c, GOLDC); c.metalness(0.75); c.roughness(0.35); }, ungold = (c) => { c.metalness(null); c.roughness(null); };
const cloth = (c) => paint(c, CLOTH, RED);
const yawOf = (dx, dz) => Math.atan2(-dz, dx) * 180 / Math.PI;
// a wall plane: origin (ox, oz), outward normal (nx, nz); u runs along t = (-nz, nx), o outward
const plane = (ox, oz, nx, nz) => (u, y, o) => [ox - nz * u + nx * o, y, oz + nx * u + nz * o];
const Q = (c, P, u0, y0, u1, y1, o) => c.quad(...P(u0, y0, o), ...P(u1, y0, o), ...P(u1, y1, o), ...P(u0, y1, o));
const BP = (c, P, u0, y0, o0, u1, y1, o1) => HX(c, [P(u0, y0, o0), P(u1, y0, o0), P(u1, y0, o1), P(u0, y0, o1), P(u0, y1, o0), P(u1, y1, o0), P(u1, y1, o1), P(u0, y1, o1)]);
const seg2 = (c, P, u0, v0, u1, v1, th, o) => { const dx = u1 - u0, dy = v1 - v0, L = Math.hypot(dx, dy) || 1, px = -dy / L * th / 2, py = dx / L * th / 2;
  c.quad(...P(u0 + px, v0 + py, o), ...P(u0 - px, v0 - py, o), ...P(u1 - px, v1 - py, o), ...P(u1 + px, v1 + py, o)); };
const disc2 = (c, P, u, v, r, o, n = 10) => { for (let k = 0; k < n; k++) { const a = k / n * 6.2832, b = (k + 1) / n * 6.2832; c.tri(...P(u, v, o), ...P(u + r * Math.cos(a), v + r * Math.sin(a), o), ...P(u + r * Math.cos(b), v + r * Math.sin(b), o)); } };
// House Annvyr's rampant lion, crowned, in gold, s = its width
function LION(c, P, uc, vc, s, o) { const S = (a) => a * s, L = (a, b, d, e, t) => seg2(c, P, uc + S(a), vc + S(b), uc + S(d), vc + S(e), S(t), o);
  gold(c); disc2(c, P, uc + S(0.1), vc + S(0.24), S(0.17), o, 10); disc2(c, P, uc + S(0.16), vc + S(0.26), S(0.1), o + 0.005, 8);
  L(0.08, 0.14, -0.06, -0.2, 0.22); L(-0.06, -0.18, -0.2, -0.44, 0.08); L(-0.02, -0.22, 0.12, -0.46, 0.08); L(0.1, 0.06, 0.3, 0.2, 0.07); L(0.08, -0.02, 0.32, 0.02, 0.07);
  L(-0.12, -0.18, -0.3, 0.02, 0.05); L(-0.3, 0.02, -0.24, 0.2, 0.05); disc2(c, P, uc + S(-0.24), vc + S(0.22), S(0.05), o, 6);
  L(0.02, 0.4, 0.24, 0.4, 0.06); for (const k of [0.03, 0.13, 0.23]) c.tri(...P(uc + S(k - 0.03), vc + S(0.42), o), ...P(uc + S(k + 0.03), vc + S(0.42), o), ...P(uc + S(k), vc + S(0.5), o));
  ungold(c); }
// a crimson banner hung from a gold rod on wall plane P at u, rod height yt
function BAN(c, P, u, yt, w, h, lod) { const o = 0.18;
  cloth(c); BP(c, P, u - w / 2, yt - h, o, u + w / 2, yt, o + 0.05);
  c.tri(...P(u - w / 2, yt - h, o + 0.05), ...P(u, yt - h, o + 0.05), ...P(u - w / 2, yt - h - w * 0.45, o + 0.05));
  c.tri(...P(u, yt - h, o + 0.05), ...P(u + w / 2, yt - h, o + 0.05), ...P(u + w / 2, yt - h - w * 0.45, o + 0.05));
  gold(c); PIPE(c, P(u - w / 2 - 0.2, yt + 0.05, o + 0.03), P(u + w / 2 + 0.2, yt + 0.05, o + 0.03), 0.05, 0.05, 6);
  if (lod <= 3) { BP(c, P, u - w / 2, yt - h, o + 0.05, u - w / 2 + 0.08, yt, o + 0.07); BP(c, P, u + w / 2 - 0.08, yt - h, o + 0.05, u + w / 2, yt, o + 0.07); BP(c, P, u - w / 2, yt - 0.18, o + 0.05, u + w / 2, yt - 0.1, o + 0.07); }
  ungold(c); if (lod <= 4) LION(c, P, u - w * 0.04, yt - h * 0.45, w * 0.78, o + 0.075); }
// a lit window: the shared Highbridge window, castle look (lib/pieces/window.js)
const WIN = (c, P, u, y0, w, h, lod) => castleWindow(c, P, u, y0, w, h, lod);
// a stained-glass lancet: coloured lozenges, lead cames, a pointed head
function SG(c, P, u, y0, w, h, lod, o = 0.05) {
  const rows = Math.max(2, Math.round(h / 0.55)), cols = lod <= 2 ? 3 : 1, cw = w / cols, rh = h / rows;
  for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) { const col = SGC[(i * 2 + j + (i % 2)) % SGC.length]; c.albedo(null); c.color("oklch(0.5 0.1 260)"); c.emissive(...col);
    Q(c, P, u - w / 2 + j * cw, y0 + i * rh, u - w / 2 + (j + 1) * cw, y0 + (i + 1) * rh, o); }
  c.emissive(...SGC[2]); c.tri(...P(u - w / 2, y0 + h, o), ...P(u + w / 2, y0 + h, o), ...P(u, y0 + h + w * 0.9, o)); c.emissive(null);
  if (lod <= 2) { flatc(c, DARK); for (let j = 1; j < cols; j++) BP(c, P, u - w / 2 + j * cw - 0.025, y0, o, u - w / 2 + j * cw + 0.025, y0 + h, o + 0.03); for (let i = 1; i < rows; i++) BP(c, P, u - w / 2, y0 + i * rh - 0.02, o, u + w / 2, y0 + i * rh + 0.02, o + 0.03); }
  if (lod <= 3) { ash(c, TRIM); BP(c, P, u - w / 2 - 0.25, y0 - 0.3, 0, u + w / 2 + 0.25, y0, 0.22); BP(c, P, u - w / 2 - 0.25, y0, 0, u - w / 2, y0 + h + 0.2, 0.14); BP(c, P, u + w / 2, y0, 0, u + w / 2 + 0.25, y0 + h + 0.2, 0.14); } }
// merlons along a line at height y
function MERL(c, x0, z0, x1, z1, y, mh = 1.2, th = 0.7, mw = 0.9, gap = 0.75) { const L = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.floor(L / (mw + gap))), Y = yawOf(x1 - x0, z1 - z0);
  for (let i = 0; i < n; i++) { const t = (i + 0.5) / n; RB(c, x0 + (x1 - x0) * t, y + mh / 2, z0 + (z1 - z0) * t, mw, mh, th, Y); } }
function RMERL(c, x, z, r, y, mh = 1.1, n = 12) { for (let k = 0; k < n; k++) { const a = k / n * 6.2832; RB(c, x + r * Math.cos(a), y + mh / 2, z + r * Math.sin(a), Math.min(1, r * 2.6 / n), mh, 0.55, yawOf(-Math.sin(a), Math.cos(a))); } }
function FINIAL(c, x, y, z, s = 1) { gold(c); LA(c, x, y, z, [[0.07 * s, 0], [0.26 * s, 0.3 * s], [0.07 * s, 0.62 * s], [0.12 * s, 0.8 * s], [0.02 * s, 1.9 * s]], 8); ungold(c); }
function CONE(c, x, y, z, r, h, n, lod) { TOWERROOF(c, x, y, z, r, h * 1.15, n, lod, { roof: lead, trim: (c) => ash(c, TRIM), gold, light: WARM }); ungold(c); }
function FLAG(c, x, y, z, s = 1) { flatc(c, DARK); PIPE(c, [x, y, z], [x, y + 4 * s, z], 0.05 * s, 0.04 * s, 5); cloth(c);
  c.quad(x, y + 4 * s, z, x, y + 3 * s, z, x + 2.4 * s, y + 3.3 * s, z + 0.15 * s, x + 2.4 * s, y + 3.7 * s, z + 0.15 * s); }
// a round tower from y0 (may be deep in the ground) to h, gallery and cone above; slits face every way
function RTOWER(c, x, z, r, y0, h, lod, opt = {}) { const n = lod <= 2 ? 16 : lod <= 3 ? 12 : 8;
  ash(c); LA(c, x, y0, z, [[r + 0.6, 0], [r + 0.6, 0.5], [r, 2.2], [r, h - y0 - 1.2], [r + 0.45, h - y0 - 0.4], [r + 0.45, h - y0]], n, true);
  if (lod <= 3) { ash(c, TRIM); for (const yb of opt.bands ?? []) LA(c, x, yb, z, [[r + 0.12, 0], [r + 0.12, 0.35]], n, false);
    for (let k = 0; k < (opt.slits ?? 4); k++) { const a = k / (opt.slits ?? 4) * 6.2832 + 0.4; for (let yy = Math.max(1.5, y0 + 3); yy < h - 3; yy += opt.slitStep ?? 5) {
      const P = plane(x + Math.cos(a) * r, z + Math.sin(a) * r, Math.cos(a), Math.sin(a)); if (opt.lit) { glow(c, "oklch(0.7 0.1 70)", WARM); Q(c, P, -0.18, yy, 0.18, yy + 1.1, 0.03); c.emissive(null); } else { flatc(c, DARK); Q(c, P, -0.09, yy, 0.09, yy + 1.0, 0.03); } } } }
  if (opt.cone === false) { ash(c); RMERL(c, x, z, r + 0.2, h, 1.1, Math.round(r * 3)); return; }
  // crimson-timbered gallery with warm windows
  const g = opt.gal ?? 2.4; ash(c); LA(c, x, h, z, [[r + 0.35, 0], [r + 0.35, g]], n, false);
  if (lod <= 3) { const m = Math.max(6, Math.round(r * 2.5)); for (let k = 0; k < m; k++) { const a = (k + 0.5) / m * 6.2832, P = plane(x + Math.cos(a) * (r + 0.35), z + Math.sin(a) * (r + 0.35), Math.cos(a), Math.sin(a));
    glow(c, "oklch(0.7 0.1 70)", WARM); Q(c, P, -0.3, h + 0.6, 0.3, h + g - 0.5, 0.04); c.emissive(null); flatc(c, TIMBER); const a2 = k / m * 6.2832; RB(c, x + Math.cos(a2) * (r + 0.42), h + g / 2, z + Math.sin(a2) * (r + 0.42), 0.22, g, 0.14, yawOf(-Math.sin(a2), Math.cos(a2))); }
    flatc(c, TIMBER); LA(c, x, h + g - 0.25, z, [[r + 0.5, 0], [r + 0.5, 0.25]], n, false); LA(c, x, h, z, [[r + 0.5, 0], [r + 0.5, 0.2]], n, false); }
  CONE(c, x, z === undefined ? 0 : h + g, z, r + 0.3, opt.roof ?? (r + 0.3) * 2.8, n, lod);
  if (opt.flag && lod <= 3) FLAG(c, x, h + g + (opt.roof ?? (r + 0.3) * 2.8) * 1.15 + 2.4 * Math.max(0.8, (r + 0.3) / 2.6), z, Math.max(1, r / 3)); }
function YEWS(c, x, y, z, s = 1) { flatc(c, YEW); LA(c, x, y, z, [[0.12, 0], [0.55 * s, 0.4 * s], [0.62 * s, 1.2 * s], [0.38 * s, 2.3 * s], [0.03, 3.1 * s]], 8); ash(c, TRIM); LA(c, x, y - 0.6, z, [[0.55, 0], [0.62, 0.15], [0.5, 0.6]], 8); }
function BRAZIER(c, x, y, z) { ash(c, TRIM); LA(c, x, y, z, [[0.5, 0], [0.5, 0.25], [0.28, 0.4], [0.22, 1.0], [0.4, 1.15]], 10); paint(c, IR, IRONC); LA(c, x, y + 1.15, z, [[0.4, 0], [0.62, 0.35], [0.66, 0.45]], 10, false);
  glow(c, "oklch(0.7 0.15 50)", FIRE); LA(c, x, y + 1.3, z, [[0.58, 0], [0.3, 0.25], [0.05, 0.4]], 8); c.emissive(null); }
function STATUE(c, x, y, z, yaw = 0) { ash(c, TRIM); BX(c, x - 0.8, y, z - 0.8, x + 0.8, y + 1.3, z + 0.8); BX(c, x - 0.95, y + 1.3, z - 0.95, x + 0.95, y + 1.5, z + 0.95);
  const s = 1.35, Y = y + 1.5; paint(c, ASH, "oklch(0.86 0.01 80)");
  LA(c, x, Y, z, [[0.5 * s, 0], [0.46 * s, 0.9 * s], [0.34 * s, 1.35 * s], [0.4 * s, 1.55 * s], [0.18 * s, 1.68 * s], [0.13 * s, 1.72 * s], [0.15 * s, 1.85 * s], [0.13 * s, 1.98 * s], [0.0, 2.02 * s]], 10);
  LA(c, x, Y + 1.98 * s, z, [[0.15 * s, 0], [0.17 * s, 0.14 * s], [0.0, 0.14 * s]], 8, true);
  const dx = Math.cos(yaw * Math.PI / 180), dz = -Math.sin(yaw * Math.PI / 180); PIPE(c, [x + dx * 0.42 * s, Y + 0.05, z + dz * 0.42 * s], [x + dx * 0.42 * s, Y + 1.3 * s, z + dz * 0.42 * s], 0.05 * s, 0.05 * s, 5);
  RB(c, x + dx * 0.42 * s, Y + 1.15 * s, z + dz * 0.42 * s, 0.5 * s, 0.06 * s, 0.08 * s, yaw + 90); }
function LANTERN(c, x, y, z) { paint(c, IR, IRONC); BX(c, x - 0.18, y + 0.42, z - 0.18, x + 0.18, y + 0.5, z + 0.18); glow(c, "oklch(0.85 0.1 75)", [3, 1.7, 0.6]); BX(c, x - 0.14, y, z - 0.14, x + 0.14, y + 0.42, z + 0.14); c.emissive(null); }
// ---------------------------------------------------------------- kinds
const K = {
  keep(c, p, lod) { const n = lod <= 2 ? 16 : lod <= 3 ? 12 : 8, PR = p.pod ?? 36, gap = p.gap ?? 7.6;
    // the crown podium: battered ashlar terrace over the slope, string course, paved top
    ash(c); BX(c, -PR, -16, -PR, PR, 0.05, PR); BX(c, -PR - 0.8, -16, -PR - 0.8, PR + 0.8, -6, PR + 0.8);
    if (lod <= 3) { ash(c, TRIM); BX(c, -PR - 0.25, -0.75, -PR - 0.25, PR + 0.25, -0.35, PR + 0.25);
      if (lod <= 2) for (let t = -PR + 6; t < PR - 3; t += 9) for (const s of [-1, 1]) { BX(c, t - 0.6, -6, s * PR - 0.5, t + 0.6, -0.75, s * PR + 0.5); BX(c, s * PR - 0.5, -6, t - 0.6, s * PR + 0.5, -0.75, t + 0.6); } }
    paint(c, FLAGT, "oklch(0.93 0.02 80)"); c.quad(-PR, 0.1, -PR, -PR, 0.1, PR, PR, 0.1, PR, PR, 0.1, -PR);
    // balustrade on the terrace edge, open at the steps (east, |z| < gap)
    ash(c, TRIM); const rail = (x0, z0, x1, z1) => { if (lod <= 2) { BX(c, Math.min(x0, x1) - 0.25, 0.1, Math.min(z0, z1) - 0.25, Math.max(x0, x1) + 0.25, 0.3, Math.max(z0, z1) + 0.25); BX(c, Math.min(x0, x1) - 0.22, 0.9, Math.min(z0, z1) - 0.22, Math.max(x0, x1) + 0.22, 1.05, Math.max(z0, z1) + 0.22);
        const L = Math.hypot(x1 - x0, z1 - z0); for (let t = 0.3; t < L; t += 0.45) { const px = x0 + (x1 - x0) * t / L, pz = z0 + (z1 - z0) * t / L; LA(c, px, 0.3, pz, [[0.08, 0], [0.13, 0.2], [0.07, 0.45], [0.09, 0.6]], 6, false, "y", true); } }
      else BX(c, Math.min(x0, x1) - 0.25, 0.1, Math.min(z0, z1) - 0.25, Math.max(x0, x1) + 0.25, 1.05, Math.max(z0, z1) + 0.25); };
    rail(-PR + 0.3, -PR + 0.3, PR - 0.3, -PR + 0.3); rail(-PR + 0.3, PR - 0.3, PR - 0.3, PR - 0.3); rail(-PR + 0.3, -PR + 0.3, -PR + 0.3, PR - 0.3);
    rail(PR - 0.3, -PR + 0.3, PR - 0.3, -gap); rail(PR - 0.3, gap, PR - 0.3, PR - 0.3);
    // forecourt yews in planters and two statues on the terrace by the steps
    if (lod <= 3) { for (const z of [-9, -5.5, 5.5, 9]) YEWS(c, 20, 0.7, z, 1); for (const z of [-PR + 6, PR - 6]) for (const x of [24, 30]) YEWS(c, x, 0.7, z, 1.2); }
    // ---- the keep block: hall walls (door on +x), solid storeys above
    const X = 13, Z = 11, HH = 8.5, TOP = 19;
    ash(c); BX(c, -X, 0, -Z, X, HH, -Z + 1); BX(c, -X, 0, Z - 1, X, HH, Z); BX(c, -X, 0, -Z, -X + 1, HH, Z);
    BX(c, X - 1, 0, -Z, X, HH, -1.3); BX(c, X - 1, 0, 1.3, X, HH, Z); BX(c, X - 1, 4.1, -1.3, X, HH, 1.3);
    BX(c, -X, HH, -Z, X, TOP, Z);
    ash(c, TRIM); for (const s of [-1, 1]) { BX(c, -X - 0.35, 0, s * Z - 0.35, X + 0.35, 0.9, s * Z + 0.35); BX(c, s * X - 0.35, 0, -Z - 0.35, s * X + 0.35, 0.9, s > 0 ? -1.3 : Z + 0.35); } BX(c, X - 0.35, 0, 1.3, X + 0.35, 0.9, Z + 0.35);
    gold(c); BX(c, -X - 0.12, HH, -Z - 0.12, X + 0.12, HH + 0.3, Z + 0.12); ungold(c); ash(c, TRIM);
    for (const yb of [12.3, 15.8]) BX(c, -X - 0.1, yb, -Z - 0.1, X + 0.1, yb + 0.25, Z + 0.1);
    BX(c, -X - 0.5, TOP - 0.6, -Z - 0.5, X + 0.5, TOP + 0.2, Z + 0.5); // corbelled parapet base
    if (lod <= 2) for (let t = -X; t <= X; t += 1.3) for (const s of [-1, 1]) { BX(c, t - 0.2, TOP - 1.3, s * Z, t + 0.2, TOP - 0.6, s * (Z + 0.45)); }
    if (lod <= 4) { ash(c); MERL(c, -X - 0.3, -Z - 0.3, X + 0.3, -Z - 0.3, TOP + 0.2); MERL(c, X + 0.3, Z + 0.3, -X - 0.3, Z + 0.3, TOP + 0.2); MERL(c, -X - 0.3, Z + 0.3, -X - 0.3, -Z - 0.3, TOP + 0.2); MERL(c, X + 0.3, -Z - 0.3, X + 0.3, Z + 0.3, TOP + 0.2); }
    // upper windows on every face, ground-floor stained glass on the long faces (outside and in)
    if (lod <= 4) for (const [P, half] of [[plane(0, -Z, 0, -1), X], [plane(0, Z, 0, 1), X], [plane(X, 0, 1, 0), Z], [plane(-X, 0, -1, 0), Z]])
      for (let u = -half + 2.4; u <= half - 2.3; u += 3.3) for (const y of [9.4, 12.9, 16.4]) WIN(c, P, u, y, 1.0, 1.7, lod);
    for (const s of [-1, 1]) { const Po = plane(0, s * Z, 0, s), Pi = plane(0, s * (Z - 1), 0, -s);
      for (const x of [-7, -3, 1, 5, 10]) { if (x === 10 && s > 0) continue; const u = s < 0 ? -x : x; SG(c, Po, u, 2.2, 1.3, 3.6, lod); if (lod <= 3) SG(c, Pi, s < 0 ? x : -x, 2.2, 1.3, 3.6, lod, 0.03); } }
    // the east door: arched portal, open oak leaves, crest, lanterns, banners
    { const P = plane(X, 0, 1, 0); ash(c, TRIM); BP(c, P, -2.1, 0.1, 0, -1.3, 4.1, 0.45); BP(c, P, 1.3, 0.1, 0, 2.1, 4.1, 0.45);
      for (let k = 0; k < 9; k++) { const a0 = k / 9 * Math.PI, a1 = (k + 1) / 9 * Math.PI, r0 = 1.3, r1 = 2.1, yc = 4.1;
        HX(c, [P(r0 * Math.cos(a0), yc + r0 * Math.sin(a0), 0), P(r1 * Math.cos(a0), yc + r1 * Math.sin(a0), 0), P(r1 * Math.cos(a1), yc + r1 * Math.sin(a1), 0), P(r0 * Math.cos(a1), yc + r0 * Math.sin(a1), 0),
          P(r0 * Math.cos(a0), yc + r0 * Math.sin(a0), 0.45), P(r1 * Math.cos(a0), yc + r1 * Math.sin(a0), 0.45), P(r1 * Math.cos(a1), yc + r1 * Math.sin(a1), 0.45), P(r0 * Math.cos(a1), yc + r0 * Math.sin(a1), 0.45)]); }
      ash(c); for (let k = 0; k < 8; k++) { const a0 = k / 8 * Math.PI, a1 = (k + 1) / 8 * Math.PI; c.quad(...P(1.3 * Math.cos(a0), 4.1 + 1.3 * Math.sin(a0), -0.02), ...P(1.3 * Math.cos(a1), 4.1 + 1.3 * Math.sin(a1), -0.02), ...P(1.3 * Math.cos(a1), 4.1 + 1.3 * Math.sin(a1), -1.0), ...P(1.3 * Math.cos(a0), 4.1 + 1.3 * Math.sin(a0), -1.0)); }
      paint(c, OAK, "oklch(0.6 0.12 25)"); BP(c, P, -1.25, 0.1, -1.0, -1.15, 3.9, -2.3); BP(c, P, 1.15, 0.1, -1.0, 1.25, 3.9, -2.3);
      if (lod <= 3) { gold(c); for (let k = 0; k < 8; k++) { const a = k / 8 * 6.2832, b = (k + 1) / 8 * 6.2832; c.tri(...P(0, 6.9, 0.5), ...P(0.7 * Math.cos(a), 6.9 + 0.85 * Math.sin(a), 0.5), ...P(0.7 * Math.cos(b), 6.9 + 0.85 * Math.sin(b), 0.5)); } ungold(c); cloth(c); BP(c, P, -0.45, 6.4, 0.5, 0.45, 7.4, 0.55); LION(c, P, 0, 6.85, 0.75, 0.57); }
      LANTERN(c, X + 0.5, 3.0, -2.6); LANTERN(c, X + 0.5, 3.0, 2.6); paint(c, IR, IRONC); BX(c, X, 3.45, -2.65, X + 0.55, 3.55, -2.55); BX(c, X, 3.45, 2.55, X + 0.55, 3.55, 2.65);
      BAN(c, P, -4.2, 7.6, 1.6, 4.6, lod); BAN(c, P, 4.2, 7.6, 1.6, 4.6, lod); BAN(c, P, -7.2, TOP - 0.8, 2.0, 7.5, lod); BAN(c, P, 7.2, TOP - 0.8, 2.0, 7.5, lod); }
    // the east roof (hip abutting the main tower) with dormers
    lead(c); HX(c, [[-1, TOP + 0.2, -Z + 0.6], [X - 0.6, TOP + 0.2, -Z + 0.6], [X - 0.6, TOP + 0.2, Z - 0.6], [-1, TOP + 0.2, Z - 0.6], [-1, TOP + 5.6, 0], [6.2, TOP + 5.6, 0], [6.2, TOP + 5.6, 0], [-1, TOP + 5.6, 0]]);
    gold(c); BX(c, -1, TOP + 5.55, -0.1, 6.2, TOP + 5.8, 0.1); ungold(c); FINIAL(c, 6.2, TOP + 5.7, 0, 1.2);
    // the main tower to ~42 m
    { const x0 = -11, x1 = -1, z0 = -5, z1 = 5, T2 = 30; ash(c); BX(c, x0, TOP, z0, x1, T2, z1); ash(c, TRIM); BX(c, x0 - 0.45, T2 - 0.6, z0 - 0.45, x1 + 0.45, T2 + 0.2, z1 + 0.45); BX(c, x0 - 0.1, 24.6, z0 - 0.1, x1 + 0.1, 24.85, z1 + 0.1);
      if (lod <= 4) { ash(c); MERL(c, x0 - 0.25, z0 - 0.25, x1 + 0.25, z0 - 0.25, T2 + 0.2); MERL(c, x1 + 0.25, z1 + 0.25, x0 - 0.25, z1 + 0.25, T2 + 0.2); MERL(c, x0 - 0.25, z1 + 0.25, x0 - 0.25, z0 - 0.25, T2 + 0.2); MERL(c, x1 + 0.25, z0 - 0.25, x1 + 0.25, z1 + 0.25, T2 + 0.2);
        for (const [P, cu] of [[plane(-6, z0, 0, -1), 0], [plane(-6, z1, 0, 1), 0], [plane(x0, 0, -1, 0), 0], [plane(x1, 0, 1, 0), 0]]) { for (const u of [-2.2, 2.2]) { WIN(c, P, cu + u, 21.2, 1.1, 2.0, lod); WIN(c, P, cu + u, 26.0, 1.1, 2.0, lod); } }
        BAN(c, plane(-6, z0, 0, -1), 0, T2 - 1.0, 2.4, 8, lod); BAN(c, plane(-6, z1, 0, 1), 0, T2 - 1.0, 2.4, 8, lod); BAN(c, plane(x1, 0, 1, 0), 0, T2 - 1.0, 2.2, 3.4, lod); }
      lead(c); HX(c, [[x0 + 0.3, T2 + 0.2, z0 + 0.3], [x1 - 0.3, T2 + 0.2, z0 + 0.3], [x1 - 0.3, T2 + 0.2, z1 - 0.3], [x0 + 0.3, T2 + 0.2, z1 - 0.3], [-6, 42, 0], [-6, 42, 0], [-6, 42, 0], [-6, 42, 0]]);
      FINIAL(c, -6, 41.7, 0, 1.6); if (lod <= 3) FLAG(c, -6, 44.4, 0, 1.3);
      if (lod <= 3) for (const [bx, bz] of [[x0, z0], [x1, z0], [x1, z1], [x0, z1]]) { ash(c); LA(c, bx, 25.5, bz, [[0.2, 0], [0.95, 1.2], [0.95, 4.7]], 10, true); CONE(c, bx, 30.2, bz, 0.95, 3.8, 10, lod); } }
    // four corner turrets
    for (const [tx, tz] of [[-14.2, -12.2], [14.2, -12.2], [14.2, 12.2], [-14.2, 12.2]]) {
      ash(c); LA(c, tx, 0, tz, [[3.1, 0], [3.1, 0.8], [2.6, 1.4], [2.6, 22.4], [3.0, 23.2]], n, true);
      if (lod <= 3) { ash(c, TRIM); for (const yb of [8.5, 15.5]) LA(c, tx, yb, tz, [[2.72, 0], [2.72, 0.3]], n, false);
        for (const y of [5, 11, 18]) { const a = Math.atan2(tz, tx), P = plane(tx + Math.cos(a) * 2.6, tz + Math.sin(a) * 2.6, Math.cos(a), Math.sin(a)); WIN(c, P, 0, y, 0.7, 1.4, lod); } }
      CONE(c, tx, 23.2, tz, 2.75, 9.5, n, lod); }
    // ---- the throne hall inside
    paint(c, CLOTH, "oklch(0.8 0.08 25)"); c.quad(-8.4, 0.12, -1.1, -8.4, 0.12, 1.1, X - 1, 0.12, 1.1, X - 1, 0.12, -1.1);
    ash(c, TRIM); BX(c, -12, 0.1, -4, -7.84, 0.28, 4); BX(c, -12, 0.28, -3.7, -8.12, 0.46, 3.7); BX(c, -12, 0.46, -3.4, -8.4, 0.64, 3.4);
    paint(c, CLOTH, "oklch(0.8 0.08 25)"); c.quad(-11.8, 0.65, -2.6, -11.8, 0.65, 2.6, -8.5, 0.65, 2.6, -8.5, 0.65, -2.6);
    for (const z of [-4.6, 4.6]) for (const x of [-5, -1, 3, 7]) { ash(c, TRIM); BX(c, x - 0.6, 0.1, z - 0.6, x + 0.6, 0.5, z + 0.6); LA(c, x, 0.5, z, [[0.45, 0], [0.4, 0.3], [0.4, 7.2], [0.5, 7.4], [0.7, 7.9], [0.7, 8.0]], lod <= 2 ? 12 : 8, false); if (lod <= 2) { gold(c); LA(c, x, 7.1, z, [[0.44, 0], [0.44, 0.15]], 12, false); ungold(c); } }
    // the throne: gilded, crimson-cushioned, high-backed, facing the door
    { const tx = -10.6, ty = 0.64; gold(c); BX(c, tx - 0.55, ty, -0.75, tx + 0.55, ty + 0.55, 0.75); BX(c, tx - 0.75, ty, -0.85, tx - 0.45, ty + 3.3, 0.85); BX(c, tx - 0.55, ty + 0.55, -0.85, tx + 0.5, ty + 1.1, -0.68); BX(c, tx - 0.55, ty + 0.55, 0.68, tx + 0.5, ty + 1.1, 0.85);
      FINIAL(c, tx - 0.6, ty + 3.3, -0.7, 0.5); FINIAL(c, tx - 0.6, ty + 3.3, 0.7, 0.5); FINIAL(c, tx - 0.6, ty + 3.45, 0, 0.7); ungold(c);
      cloth(c); BX(c, tx - 0.45, ty + 0.55, -0.62, tx + 0.5, ty + 0.68, 0.62); BX(c, tx - 0.45, ty + 0.7, -0.6, tx - 0.4, ty + 2.9, 0.6); }
    // behind the throne a great banner, braziers either side of the dais
    BAN(c, plane(-12, 0, 1, 0), 0, 7.6, 2.6, 5.6, lod); for (const z of [-3.2, 3.2]) BRAZIER(c, -8.0, 0.28, z);
    for (const s of [-1, 1]) { const P = plane(0, s * 10, 0, -s); for (const x of [-9, -5, -1, 3]) BAN(c, P, s > 0 ? -x : x, 7.2, 1.2, 3.4, lod); }
    // the hearth on the south wall
    { ash(c, TRIM); BX(c, 0.4, 0.1, 8.7, 3.6, 3.2, 10); BX(c, 0.8, 3.2, 9.1, 3.2, HH, 10); flatc(c, DARK); BX(c, 1.0, 0.1, 8.65, 3.0, 1.9, 9.2); glow(c, "oklch(0.7 0.15 50)", FIRE); BX(c, 1.2, 0.1, 8.62, 2.8, 0.7, 9.0); c.emissive(null); }
    // the royal bedchamber in the north-east corner: partition with a doorway, the bed
    { ash(c); BX(c, 8.5, 0.1, -10, 8.9, 3.6, -5.5); BX(c, 8.5, 0.1, -5.9, 9.6, 3.6, -5.5); BX(c, 11.0, 0.1, -5.9, 12, 3.6, -5.5); BX(c, 9.6, 2.5, -5.9, 11.0, 3.6, -5.5); ash(c, TRIM); BX(c, 8.4, 3.6, -10, 12, 3.8, -5.4);
      paint(c, OAK, "oklch(0.55 0.08 30)"); BX(c, 9.4, 0.1, -10, 11.4, 0.55, -7.6); BX(c, 9.3, 0.1, -10, 11.5, 1.8, -9.75); for (const [bx, bz] of [[9.35, -7.65], [11.45, -7.65]]) BX(c, bx - 0.08, 0.1, bz - 0.08, bx + 0.08, 2.4, bz + 0.08);
      cloth(c); BX(c, 9.45, 0.55, -9.75, 11.35, 0.72, -7.65); paint(c, CLOTH, "oklch(0.98 0.01 90)"); BX(c, 9.7, 0.72, -9.7, 11.1, 0.86, -9.2); gold(c); BX(c, 9.3, 2.3, -10, 11.5, 2.42, -7.6); ungold(c); }
  },
  stair(c, p, lod) { const W = (p.w ?? 14) / 2, N = 15, R = 0.18, T = 0.28, LAND = 2.5, L = 3 * N * T + 2 * LAND;
    // steps rise toward -x; foot at x = L, top at x = 0 (+8.1)
    const steps = []; let x = L, y = 0; for (let f = 0; f < 3; f++) { for (let i = 0; i < N; i++) { y += R; steps.push([x - T, x, y]); x -= T; } if (f < 2) { steps.push([x - LAND, x, y, 1]); x -= LAND; } }
    for (const [a, b, top, land] of steps) { ash(c, land ? CREAM : TRIM); BX(c, a, -0.6, -W, b, top, W); }
    // cheek walls rising with the flights, landing piers with statues, braziers top and foot
    ash(c); let x0 = L, y0 = 0; for (let f = 0; f < 3; f++) { const x1 = x0 - N * T, y1 = y0 + N * R; for (const s of [-1, 1]) HX(c, [[x0, -0.6, s * W], [x1, -0.6, s * W], [x1, -0.6, s * (W + 0.9)], [x0, -0.6, s * (W + 0.9)], [x0, y0 + 1.05, s * W], [x1, y1 + 1.05, s * W], [x1, y1 + 1.05, s * (W + 0.9)], [x0, y0 + 1.05, s * (W + 0.9)]].map((v, i) => s < 0 ? v : v));
      x0 = x1 - (f < 2 ? LAND : 0); y0 = y1; if (f < 2) for (const s of [-1, 1]) { ash(c); BX(c, x1 - LAND, -0.6, s * W, x1, y1 + 1.05, s * (W + 0.9)); } }
    ash(c, TRIM); for (const [px, py] of [[L, 0], [L - N * T, N * R], [L - N * T - LAND, N * R], [L - 2 * N * T - LAND, 2 * N * R], [L - 2 * N * T - 2 * LAND, 2 * N * R], [0, 3 * N * R]]) for (const s of [-1, 1]) BX(c, px - 0.55, -0.6, s * (W + 0.45) - 0.55, px + 0.55, py + 1.5, s * (W + 0.45) + 0.55);
    if (lod <= 3) for (const f of [0, 1]) { const lx = L - (f + 1) * N * T - f * LAND - LAND / 2, ly = (f + 1) * N * R; for (const s of [-1, 1]) STATUE(c, lx, ly, s * (W - 1.3), 0); }
    for (const s of [-1, 1]) { BRAZIER(c, L - 0.2, 1.5, s * (W + 0.45)); BRAZIER(c, 0.2, 3 * N * R + 1.5, s * (W + 0.45)); }
    if (lod <= 3) for (const s of [-1, 1]) BAN(c, plane(L - 2 * N * T - 2 * LAND + 1.2, s * (W + 0.9), 0, s), 0, 2 * N * R + 4.2, 1.2, 3.2, lod);
    if (lod <= 3) for (const s of [-1, 1]) { gold(c); PIPE(c, [L - 2 * N * T - 2 * LAND + 1.2, 2 * N * R - 0.6, s * (W + 1.1)], [L - 2 * N * T - 2 * LAND + 1.2, 2 * N * R + 4.4, s * (W + 1.1)], 0.07, 0.07, 6); ungold(c); }
  },
  curtain(c, p, lod) { const L = p.len ?? 30, h = p.h ?? 12, F = p.foot ?? 30, th = 3, hl = L / 2;
    ash(c); BX(c, -hl, -F, -th / 2, hl, h, th / 2); BX(c, -hl, -F, -th / 2 - 1.2, hl, -2, th / 2 + 0.4);
    ash(c, TRIM); BX(c, -hl, h - 1.1, -th / 2 - 0.45, hl, h, th / 2 + 0.1);
    if (lod <= 2) for (let t = -hl + 0.6; t < hl; t += 1.4) BX(c, t - 0.18, h - 1.8, -th / 2 - 0.4, t + 0.18, h - 1.1, -th / 2);
    if (lod <= 4) { ash(c); MERL(c, -hl, -th / 2 - 0.15, hl, -th / 2 - 0.15, h, 1.3, 0.6); MERL(c, -hl, th / 2 - 0.2, hl, th / 2 - 0.2, h, 0.7, 0.4, 1.4, 0.1); }
    if (lod <= 3) { const P = plane(0, -th / 2, 0, -1); flatc(c, DARK); for (let u = -hl + 3; u < hl - 2; u += 6) Q(c, P, u - 0.1, h - 5, u + 0.1, h - 3.6, 0.02);
      const nb = p.ban ?? 0; for (let i = 0; i < nb; i++) BAN(c, P, -hl + L * (i + 0.5) / nb, h - 1.3, 2.0, 6.5, lod); } },
  tower(c, p, lod) { const r = p.r ?? 4.5, h = p.h ?? 18, F = p.foot ?? 30;
    RTOWER(c, 0, 0, r, -F, h, lod, { bands: [h - 6, h - 12], slits: 5, lit: true, slitStep: 4.5, flag: p.flag !== false, roof: p.roof });
    if (lod <= 3 && p.ban) { const a = (p.banAt ?? 0) * Math.PI / 180, P = plane(Math.cos(a) * r, -Math.sin(a) * r, Math.cos(a), -Math.sin(a)); BAN(c, P, 0, h - 1.4, 2.0, 7, lod); } },
  gatehouse(c, p, lod) { const X = 7, Z = 9, H = 14, PW = 3, AR = 3, SP = 4.2;
    ash(c); BX(c, -X, -30, -Z, X, H, -PW); BX(c, -X, -30, PW, X, H, Z); BX(c, -X, SP + AR, -PW, X, H, PW); BX(c, -X, -30, -PW, X, 0.2, PW);
    // the arch vault through the passage, the arch rings on both faces
    ash(c); for (let k = 0; k < 10; k++) { const a0 = k / 10 * Math.PI, a1 = (k + 1) / 10 * Math.PI; c.quad(-X, SP + AR * Math.sin(a0), AR * Math.cos(a0), X, SP + AR * Math.sin(a0), AR * Math.cos(a0), X, SP + AR * Math.sin(a1), AR * Math.cos(a1), -X, SP + AR * Math.sin(a1), AR * Math.cos(a1));
      c.quad(-X, SP + AR * Math.sin(a0), AR * Math.cos(a0), -X, SP + AR * Math.sin(a1), AR * Math.cos(a1), -X, SP + AR, AR * Math.cos(a1), -X, SP + AR, AR * Math.cos(a0));
      c.quad(X, SP + AR * Math.sin(a0), AR * Math.cos(a0), X, SP + AR, AR * Math.cos(a0), X, SP + AR, AR * Math.cos(a1), X, SP + AR * Math.sin(a1), AR * Math.cos(a1)); }
    ash(c, TRIM); for (const s of [-1, 1]) { const P = plane(s * X, 0, s, 0); for (let k = 0; k < 9; k++) { const a0 = k / 9 * Math.PI, a1 = (k + 1) / 9 * Math.PI, r0 = AR, r1 = AR + 0.9;
      HX(c, [P(r0 * Math.cos(a0), SP + r0 * Math.sin(a0), 0), P(r1 * Math.cos(a0), SP + r1 * Math.sin(a0), 0), P(r1 * Math.cos(a1), SP + r1 * Math.sin(a1), 0), P(r0 * Math.cos(a1), SP + r0 * Math.sin(a1), 0), P(r0 * Math.cos(a0), SP + r0 * Math.sin(a0), 0.35), P(r1 * Math.cos(a0), SP + r1 * Math.sin(a0), 0.35), P(r1 * Math.cos(a1), SP + r1 * Math.sin(a1), 0.35), P(r0 * Math.cos(a1), SP + r0 * Math.sin(a1), 0.35)]); }
      BP(c, P, -AR - 0.9, 0.2, 0, -AR, SP, 0.35); BP(c, P, AR, 0.2, 0, AR + 0.9, SP, 0.35); }
    paint(c, FLAGT, "oklch(0.9 0.02 80)"); c.quad(-X - 4, 0.25, -PW, -X - 4, 0.25, PW, X, 0.25, PW, X, 0.25, -PW); ash(c, TRIM); BX(c, -X - 4, -0.6, -PW, -X, 0.24, PW);
    // the portcullis drawn up into its slot, oak leaves open against the passage walls
    paint(c, IR, IRONC); for (let z = -PW + 0.3; z < PW; z += 0.42) BX(c, 1.9, SP + 0.9, z - 0.05, 2.0, SP + AR, z + 0.05); for (let y = SP + 1.1; y < SP + AR; y += 0.5) BX(c, 1.88, y, -AR * Math.sqrt(Math.max(0, 1 - ((y - SP) / AR) ** 2)), 2.02, y + 0.08, AR * Math.sqrt(Math.max(0, 1 - ((y - SP) / AR) ** 2)));
    paint(c, OAK, "oklch(0.6 0.12 25)"); BX(c, -4.8, 0.2, -PW, -2.0, 4.4, -PW + 0.14); BX(c, -4.8, 0.2, PW - 0.14, -2.0, 4.4, PW);
    ash(c, TRIM); BX(c, -X - 0.4, H - 0.8, -Z - 0.1, X + 0.4, H, Z + 0.1); if (lod <= 4) { ash(c); MERL(c, X + 0.25, -Z, X + 0.25, Z, H); MERL(c, -X - 0.25, Z, -X - 0.25, -Z, H); }
    if (lod <= 2) for (let t = -Z + 0.6; t < Z; t += 1.3) for (const s of [-1, 1]) BX(c, s * X, H - 1.5, t - 0.18, s * (X + 0.4), H - 0.8, t + 0.18);
    // crest over the outer arch, banners, lanterns, the house name over the gate
    for (const s of [-1, 1]) { const P = plane(s * X, 0, s, 0); BAN(c, P, -5.6, H - 1.2, 1.6, 5.5, lod); BAN(c, P, 5.6, H - 1.2, 1.6, 5.5, lod); LANTERN(c, s * (X + 0.5), 3.4, -AR - 1.4); LANTERN(c, s * (X + 0.5), 3.4, AR + 1.4);
      if (lod <= 3) { cloth(c); BP(c, P, -0.8, SP + AR + 1.3, 0.35, 0.8, SP + AR + 3.3, 0.42); gold(c); BP(c, P, -0.9, SP + AR + 3.3, 0.35, 0.9, SP + AR + 3.45, 0.45); ungold(c); LION(c, P, 0, SP + AR + 2.25, 1.3, 0.44); } }
    for (const s of [-1, 1]) RTOWER(c, 0.5, s * 9.5, 4, -30, 18, lod, { bands: [7, 12], slits: 5, lit: true, slitStep: 4, flag: true, roof: 11 });
  },
  chapel(c, p, lod) { const W = 4.5, D = 9, H = 8, RH = 15.5;
    ash(c); BX(c, -W, -1.5, -D, W, 0.1, D);
    BX(c, -W, 0, -D, -W + 0.9, H, D); BX(c, W - 0.9, 0, -D, W, H, D); BX(c, -W, 0, D - 0.9, W, H, D); BX(c, -W, 0, -D, -1.1, H, -D + 0.9); BX(c, 1.1, 0, -D, W, H, -D + 0.9); BX(c, -1.1, 3.4, -D, 1.1, H, -D + 0.9);
    paint(c, FLAGT, "oklch(0.93 0.02 80)"); c.quad(-W, 0.11, -D, -W, 0.11, D, W, 0.11, D, W, 0.11, -D);
    // gables, buttresses, roof
    ash(c); for (const z of [-D, D - 0.9]) HX(c, [[-W, H, z], [W, H, z], [W, H, z + 0.9], [-W, H, z + 0.9], [0, RH, z], [0, RH, z], [0, RH, z + 0.9], [0, RH, z + 0.9]]);
    for (const s of [-1, 1]) for (const z of [-D + 0.4, -3, 3, D - 0.4]) HX(c, [[s * W, 0, z - 0.4], [s * (W + 1.3), 0, z - 0.4], [s * (W + 1.3), 0, z + 0.4], [s * W, 0, z + 0.4], [s * W, H - 0.5, z - 0.4], [s * (W + 0.3), H - 0.5, z - 0.4], [s * (W + 0.3), H - 0.5, z + 0.4], [s * W, H - 0.5, z + 0.4]]);
    lead(c); for (const s of [-1, 1]) HX(c, [[s * (W + 0.7), H - 0.6, -D - 0.5], [0, RH, -D - 0.5], [0, RH, D + 0.5], [s * (W + 0.7), H - 0.6, D + 0.5], [s * (W + 0.7), H - 0.35, -D - 0.5], [0, RH + 0.25, -D - 0.5], [0, RH + 0.25, D + 0.5], [s * (W + 0.7), H - 0.35, D + 0.5]]);
    gold(c); BX(c, -0.1, RH + 0.2, -D - 0.5, 0.1, RH + 0.45, D + 0.5); ungold(c); FINIAL(c, 0, RH + 0.2, -D - 0.5, 1);
    // stained glass: lancets on both long walls (outside and in), a rose over the door
    for (const s of [-1, 1]) { const Po = plane(s * W, 0, s, 0), Pi = plane(s * (W - 0.9), 0, -s, 0); for (const z of [-6, 0, 6]) { SG(c, Po, s * z, 2.0, 1.2, 4.0, lod); if (lod <= 3) SG(c, Pi, -s * z, 2.0, 1.2, 4.0, lod, 0.03); } }
    { const P = plane(0, -D, 0, -1); const n = 12, r = 1.5, cy = 6.0; for (let k = 0; k < n; k++) { const a = k / n * 6.2832, b = (k + 1) / n * 6.2832; c.albedo(null); c.color("oklch(0.5 0.1 260)"); c.emissive(...SGC[k % 3]); c.tri(...P(0, cy, 0.05), ...P(r * Math.cos(a), cy + r * Math.sin(a), 0.05), ...P(r * Math.cos(b), cy + r * Math.sin(b), 0.05)); }
      c.emissive(null); ash(c, TRIM); for (let k = 0; k < 16; k++) { const a = k / 16 * 6.2832, b = (k + 1) / 16 * 6.2832; seg2(c, P, r * Math.cos(a), cy + r * Math.sin(a), r * Math.cos(b), cy + r * Math.sin(b), 0.3, 0.12); }
      BP(c, P, -1.5, 0.1, 0, -1.1, 3.4, 0.35); BP(c, P, 1.1, 0.1, 0, 1.5, 3.4, 0.35); BP(c, P, -1.5, 3.4, 0, 1.5, 4.2, 0.35); gold(c); BP(c, P, -0.25, 3.55, 0.36, 0.25, 4.05, 0.42); ungold(c);
      paint(c, OAK, "oklch(0.6 0.12 25)"); BP(c, P, -1.1, 0.1, -0.9, -1.0, 3.3, -1.9); BP(c, P, 1.0, 0.1, -0.9, 1.1, 3.3, -1.9); LANTERN(c, 1.9, 2.8, -D - 0.4); BAN(c, P, -3.0, 7.3, 1.2, 3.6, lod); BAN(c, P, 3.0, 7.3, 1.2, 3.6, lod); }
    // the steeple at the rear
    { ash(c); BX(c, -2, 0, D - 0.9, 2, 17, D + 3.1); ash(c, TRIM); BX(c, -2.3, 16.6, D - 1.2, 2.3, 17.2, D + 3.4); if (lod <= 3) for (const [P] of [[plane(0, D + 3.1, 0, 1)], [plane(-2, D + 1.1, -1, 0)], [plane(2, D + 1.1, 1, 0)]]) { flatc(c, DARK); Q(c, P, -0.6, 13, 0.6, 15.5, 0.02); }
      TOWERROOF(c, 0, 17.2, D + 1.1, 1.8, 10.5, 8, lod, { roof: lead, trim: (c) => ash(c, TRIM), gold, light: WARM }); ungold(c); }
    // inside: pews, the altar, banners
    if (lod <= 3) { paint(c, OAK, WOOD); for (let z = -6.5; z <= 3.5; z += 1.25) for (const s of [-1, 1]) { BX(c, s * 0.9, 0.1, z, s * 3.4, 0.5, z + 0.4); BX(c, s * 0.9, 0.5, z + 0.32, s * 3.4, 1.0, z + 0.42); } }
    ash(c, TRIM); BX(c, -3.6, 0.1, 5.4, 3.6, 0.46, D - 0.9); BX(c, -1.4, 0.46, 6.4, 1.4, 1.5, 7.4); cloth(c); BX(c, -1.45, 1.0, 6.35, 1.45, 1.55, 7.45); gold(c); BX(c, -0.08, 1.55, 6.8, 0.08, 2.6, 7.0); BX(c, -0.4, 2.25, 6.8, 0.4, 2.37, 7.0); ungold(c);
    for (const x of [-1.1, 1.1]) { gold(c); PIPE(c, [x, 1.55, 6.9], [x, 2.0, 6.9], 0.04, 0.04, 5); glow(c, "oklch(0.9 0.1 80)", [3, 1.8, 0.6]); PIPE(c, [x, 2.0, 6.9], [x, 2.12, 6.9], 0.03, 0.01, 5); c.emissive(null); }
    BAN(c, plane(0, D - 0.9, 0, -1), 0, 7.4, 2.0, 4.6, lod); },
  barracks(c, p, lod) { const W = 12, D = 4, H = 7, RH = 11.5;
    ash(c); BX(c, -W - 0.3, -2, -D - 0.3, W + 0.3, 0.7, D + 0.3); BX(c, -W, 0.7, -D, W, H, D); ash(c, TRIM); BX(c, -W - 0.1, 3.4, -D - 0.1, W + 0.1, 3.65, D + 0.1);
    for (const x of [-W, W]) { ash(c); HX(c, [[x - 0.01, H, -D], [x + 0.01, H, -D], [x + 0.01, H, D], [x - 0.01, H, D], [x - 0.01, RH, 0], [x + 0.01, RH, 0], [x + 0.01, RH, 0], [x - 0.01, RH, 0]]); }
    lead(c); for (const s of [-1, 1]) HX(c, [[-W - 0.5, H - 0.3, s * (D + 0.8)], [W + 0.5, H - 0.3, s * (D + 0.8)], [W + 0.5, RH, 0], [-W - 0.5, RH, 0], [-W - 0.5, H - 0.05, s * (D + 0.8)], [W + 0.5, H - 0.05, s * (D + 0.8)], [W + 0.5, RH + 0.25, 0], [-W - 0.5, RH + 0.25, 0]]);
    gold(c); BX(c, -W - 0.5, RH + 0.15, -0.08, W + 0.5, RH + 0.4, 0.08); ungold(c); FINIAL(c, -W - 0.3, RH + 0.2, 0); FINIAL(c, W + 0.3, RH + 0.2, 0);
    ash(c); for (const x of [-6, 6]) BX(c, x - 0.6, RH - 2, 0.8, x + 0.6, RH + 1.6, 2.0);
    if (lod <= 4) for (const s of [-1, 1]) { const P = plane(0, s * D, 0, s); for (let u = -W + 1.6; u <= W - 1.5; u += 2.85) { if (s < 0 && Math.abs(u) < 1.5) continue; WIN(c, P, u, 1.4, 0.9, 1.4, lod); WIN(c, P, u, 4.4, 0.9, 1.4, lod); } }
    { const P = plane(0, -D, 0, -1); ash(c, TRIM); BP(c, P, -1.2, 0.7, 0, 1.2, 3.4, 0.3); paint(c, OAK, "oklch(0.6 0.12 25)"); BP(c, P, -0.75, 0.7, 0.3, 0.75, 3.0, 0.38); LANTERN(c, -1.5, 2.6, -D - 0.4); LANTERN(c, 1.5, 2.6, -D - 0.4); BAN(c, P, -3.0, 6.6, 1.2, 3.2, lod); BAN(c, P, 3.0, 6.6, 1.2, 3.2, lod);
      ash(c, TRIM); for (const x of [-0.6, 0.6]) BX(c, x - 0.6, 0, -D - 1.5 + (x > 0 ? 0 : 0), x + 0.6, 0.35, -D - 0.3); BX(c, -1.2, 0, -D - 1.1, 1.2, 0.35, -D); BX(c, -1.2, 0.35, -D - 0.6, 1.2, 0.7, -D); } },
  stables(c, p, lod) { const W = 8, D = 3.5;
    ash(c); BX(c, -W, -1.5, -D, W, 0.15, D); BX(c, -W, 0, D - 0.6, W, 5.2, D); BX(c, -W, 0, -D, -W + 0.6, 5.2, D); BX(c, W - 0.6, 0, -D, W, 5.2, D);
    paint(c, HAYT, "oklch(0.95 0.03 85)"); c.quad(-W + 0.6, 0.17, -D, -W + 0.6, 0.17, D - 0.6, W - 0.6, 0.17, D - 0.6, W - 0.6, 0.17, -D);
    paint(c, OAK, WOOD); for (let x = -W + 4; x < W; x += 4) { BX(c, x - 0.1, 0, -D + 0.3, x + 0.1, 1.6, D - 0.6); PIPE(c, [x, 0, -D + 0.3], [x, 3.6, -D + 0.3], 0.14, 0.14, 6); } for (const x of [-W + 0.3, W - 0.3]) PIPE(c, [x, 0, -D + 0.3], [x, 3.6, -D + 0.3], 0.16, 0.16, 6);
    flatc(c, TIMBER); BX(c, -W, 3.5, -D + 0.1, W, 3.8, -D + 0.5);
    paint(c, "cdn/texture-terracotta-roof-tiles-weathered.png", LEADC); lead(c); HX(c, [[-W - 0.5, 3.75, -D - 0.9], [W + 0.5, 3.75, -D - 0.9], [W + 0.5, 5.4, D + 0.3], [-W - 0.5, 5.4, D + 0.3], [-W - 0.5, 3.95, -D - 0.9], [W + 0.5, 3.95, -D - 0.9], [W + 0.5, 5.6, D + 0.3], [-W - 0.5, 5.6, D + 0.3]]);
    if (lod <= 3) { paint(c, HAYT, "oklch(0.95 0.03 85)"); for (const x of [-W + 2, 2.1, -2.2, W - 1.8]) BX(c, x - 0.6, 0.15, D - 1.6, x + 0.6, 0.75, D - 0.65); paint(c, OAK, WOOD); for (const x of [-6, -2, 2, 6]) BX(c, x - 0.8, 0.15, D - 0.65 - 0.5, x + 0.8, 0.7, D - 0.65); BAN(c, plane(0, D, 0, 1), 0, 4.8, 1.4, 3.4, lod); } },
  garden(c, p, lod) { const W = p.w ?? 9, D = p.d ?? 7;
    paint(c, "cdn/texture-pale-gravel-path.png", "oklch(0.95 0.02 85)"); c.quad(-W, 0.06, -D, -W, 0.06, D, W, 0.06, D, W, 0.06, -D);
    ash(c, TRIM); const kerb = (x0, z0, x1, z1) => BX(c, x0, 0, z0, x1, 0.55, z1);
    kerb(-W, -D, -1.5, -D + 0.4); kerb(1.5, -D, W, -D + 0.4); kerb(-W, D - 0.4, -1.5, D); kerb(1.5, D - 0.4, W, D); kerb(-W, -D, -W + 0.4, -1.5); kerb(-W, 1.5, -W + 0.4, D); kerb(W - 0.4, -D, W, -1.5); kerb(W - 0.4, 1.5, W, D);
    flatc(c, YEW); for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const x0 = sx * 1.8, x1 = sx * (W - 1.2), z0 = sz * 1.8, z1 = sz * (D - 1.2); BX(c, Math.min(x0, x1), 0, Math.min(z0, z1), Math.max(x0, x1), 0.7, Math.min(z0, z1) + 0.5); BX(c, Math.min(x0, x1), 0, Math.max(z0, z1) - 0.5, Math.max(x0, x1), 0.7, Math.max(z0, z1)); BX(c, Math.min(x0, x1), 0, Math.min(z0, z1), Math.min(x0, x1) + 0.5, 0.7, Math.max(z0, z1));
      if (lod <= 3) { paint(c, "cdn/texture-flower-bed-red-roses.png", "oklch(0.9 0.04 30)"); BX(c, Math.min(x0, x1) + 0.5, 0, Math.min(z0, z1) + 0.5, Math.max(x0, x1), 0.35, Math.max(z0, z1) - 0.5); flatc(c, YEW); } }
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) YEWS(c, sx * (W - 0.9), 0.6, sz * (D - 0.9), 1.3);
    K.well(c, p, lod); if (lod <= 3) { paint(c, OAK, WOOD); for (const s of [-1, 1]) { BX(c, s * 4 - 0.9, 0.4, -0.3 - s * 0, s * 4 + 0.9, 0.5, 0.3); ash(c, TRIM); for (const d of [-0.7, 0.7]) BX(c, s * 4 + d - 0.12, 0, -0.25, s * 4 + d + 0.12, 0.4, 0.25); paint(c, OAK, WOOD); } } },
  well(c, p, lod) { ash(c, TRIM); LA(c, 0, 0, 0, [[1.25, 0], [1.25, 0.85], [1.4, 0.95], [1.0, 0.95], [1.0, 0.3]], lod <= 2 ? 14 : 10, false); LA(c, 0, 0, 0, [[1.4, 0.95], [1.4, 1.0], [0.0, 1.0]], 4, false);
    flatc(c, "oklch(0.25 0.04 230)"); c.quad(-1, 0.4, -1, -1, 0.4, 1, 1, 0.4, 1, 1, 0.4, -1);
    paint(c, OAK, WOOD); for (const s of [-1, 1]) BX(c, s * 1.15 - 0.1, 0.9, -0.1, s * 1.15 + 0.1, 3.0, 0.1); PIPE(c, [-1.2, 2.5, 0], [1.2, 2.5, 0], 0.1, 0.1, 6);
    lead(c); for (const s of [-1, 1]) HX(c, [[-1.6, 2.9, s * 1.3], [1.6, 2.9, s * 1.3], [1.6, 3.7, 0], [-1.6, 3.7, 0], [-1.6, 3.05, s * 1.3], [1.6, 3.05, s * 1.3], [1.6, 3.85, 0], [-1.6, 3.85, 0]]);
    FINIAL(c, 0, 3.8, 0, 0.6); paint(c, OAK, WOOD); LA(c, 0.3, 1.6, 0, [[0.18, 0], [0.22, 0.35], [0.0, 0.35]], 8); },
  lamp(c, p, lod) { lampPost(c, LK, "castle", { h: p.h, heads: lampHeads }); },
};
const HAYT = "cdn/texture-hay-bale-straw.png";
export function geometry(c) { const p = c.params ?? {}; (K[p.kind] ?? K.tower)(c, p, c.lod ?? 1); c.albedo(null); c.color(null); c.emissive(null); c.metalness(null); c.roughness(null); }
export function collider(c) { const p = c.params ?? {}, k = p.kind ?? "tower", f = CB(), cyl = (x, y0, z, r, h) => ({ kind: "cylinder", radiusTop: r, radiusBottom: r, height: h, center: [x, y0 + h / 2, z] });
  if (k === "keep") { const PR = p.pod ?? 36, X = 13, Z = 11, gap = p.gap ?? 7.6; f(-PR, -16, -PR, PR, 0.1, PR);
    f(-PR, 0.1, -PR, PR, 1.05, -PR + 0.6); f(-PR, 0.1, PR - 0.6, PR, 1.05, PR); f(-PR, 0.1, -PR, -PR + 0.6, 1.05, PR); f(PR - 0.6, 0.1, -PR, PR, 1.05, -gap); f(PR - 0.6, 0.1, gap, PR, 1.05, PR);
    f(-X, 0, -Z, X, 8.5, -Z + 1); f(-X, 0, Z - 1, X, 8.5, Z); f(-X, 0, -Z, -X + 1, 8.5, Z); f(X - 1, 0, -Z, X, 8.5, -1.3); f(X - 1, 0, 1.3, X, 8.5, Z); f(X - 1, 4.1, -1.3, X, 8.5, 1.3);
    f(-X, 8.5, -Z, X, 21, Z); f(-11, 19, -5, -1, 42, 5);
    f(-12, 0.1, -4, -7.84, 0.28, 4); f(-12, 0.28, -3.7, -8.12, 0.46, 3.7); f(-12, 0.46, -3.4, -8.4, 0.64, 3.4); f(-11.35, 0.64, -0.85, -10.05, 1.8, 0.85);
    for (const z of [-4.6, 4.6]) for (const x of [-5, -1, 3, 7]) f(x - 0.45, 0.1, z - 0.45, x + 0.45, 8.5, z + 0.45);
    f(0.4, 0.1, 8.7, 3.6, 3.2, 10); f(8.5, 0.1, -10, 8.9, 3.6, -5.5); f(8.5, 0.1, -5.9, 9.6, 3.6, -5.5); f(11.0, 0.1, -5.9, 12, 3.6, -5.5); f(9.4, 0.1, -10, 11.4, 0.6, -7.6);
    for (const z of [-3.2, 3.2]) f(-8.5, 0.28, z - 0.5, -7.5, 1.6, z + 0.5);
    for (const z of [-9, -5.5, 5.5, 9]) f(19.4, 0.1, z - 0.6, 20.6, 1.5, z + 0.6);
    return [...f.list, ...[[-14.2, -12.2], [14.2, -12.2], [14.2, 12.2], [-14.2, 12.2]].map(([x, z]) => cyl(x, 0, z, 2.9, 24))]; }
  if (k === "stair") { const W = (p.w ?? 14) / 2, N = 15, R = 0.18, T = 0.28, LAND = 2.5, L = 3 * N * T + 2 * LAND; let x = L, y = 0;
    for (let fl = 0; fl < 3; fl++) { for (let i = 0; i < N; i++) { y += R; f(x - T, -0.6, -W, x, y, W); x -= T; } if (fl < 2) { f(x - LAND, -0.6, -W, x, y, W); x -= LAND; } }
    for (const s of [-1, 1]) f(0, -0.6, s * W, L, 9.6, s * (W + 1.0)); return f.list; }
  if (k === "curtain") { const L = p.len ?? 30, h = p.h ?? 12, F = p.foot ?? 30; f(-L / 2, -F, -1.7, L / 2, h + 1.3, 1.5); return f.list; }
  if (k === "tower") { const r = p.r ?? 4.5, h = p.h ?? 18, F = p.foot ?? 30; return [cyl(0, -F, 0, r + 0.3, F + h + 2.4)]; }
  if (k === "gatehouse") { const X = 7, Z = 9, H = 14; f(-X, -30, -Z, X, H + 1.2, -3); f(-X, -30, 3, X, H + 1.2, Z); f(-X, 7.2, -3, X, H + 1.2, 3); f(-X - 4, -30, -3, X, 0.2, 3);
    return [...f.list, cyl(0.5, -30, -9.5, 4.2, 50), cyl(0.5, -30, 9.5, 4.2, 50)]; }
  if (k === "chapel") { const W = 4.5, D = 9, H = 8; f(-W, -1.5, -D, W, 0.1, D); f(-W, 0, -D, -W + 0.9, H, D); f(W - 0.9, 0, -D, W, H, D); f(-W, 0, D - 0.9, W, H, D); f(-W, 0, -D, -1.1, H, -D + 0.9); f(1.1, 0, -D, W, H, -D + 0.9); f(-1.1, 3.4, -D, 1.1, H, -D + 0.9);
    f(-W - 0.7, H, -D, W + 0.7, 15.5, D); f(-2, 0, D - 0.9, 2, 17, D + 3.1); f(-3.6, 0.1, 5.4, 3.6, 0.46, D - 0.9); f(-1.45, 0.46, 6.35, 1.45, 1.55, 7.45);
    for (let z = -6.5; z <= 3.5; z += 1.25) for (const s of [-1, 1]) f(Math.min(s * 0.9, s * 3.4), 0.1, z, Math.max(s * 0.9, s * 3.4), 0.5, z + 0.42); return f.list; }
  if (k === "barracks") { f(-12.3, -2, -4.3, 12.3, 7, 4.3); f(-12.5, 7, -4.8, 12.5, 11.5, 4.8); f(-1.2, 0, -5.1, 1.2, 0.7, -4); return f.list; }
  if (k === "stables") { const W = 8, D = 3.5; f(-W, -1.5, -D, W, 0.15, D); f(-W, 0, D - 0.6, W, 5.2, D); f(-W, 0, -D, -W + 0.6, 5.2, D); f(W - 0.6, 0, -D, W, 5.2, D); for (let x = -W + 4; x < W; x += 4) f(x - 0.15, 0, -D + 0.1, x + 0.15, 1.6, D - 0.6); f(-W - 0.5, 3.75, -D - 0.9, W + 0.5, 5.6, D + 0.3); return f.list; }
  if (k === "garden") { const W = p.w ?? 9, D = p.d ?? 7; for (const [a, b, d, e] of [[-W, -D, -1.5, -D + 0.4], [1.5, -D, W, -D + 0.4], [-W, D - 0.4, -1.5, D], [1.5, D - 0.4, W, D], [-W, -D, -W + 0.4, -1.5], [-W, 1.5, -W + 0.4, D], [W - 0.4, -D, W, -1.5], [W - 0.4, 1.5, W, D]]) f(a, 0, b, d, 0.55, e);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const x0 = sx * 1.8, x1 = sx * (W - 1.2), z0 = sz * 1.8, z1 = sz * (D - 1.2); f(Math.min(x0, x1), 0, Math.min(z0, z1), Math.max(x0, x1), 0.7, Math.max(z0, z1)); }
    f(-1.4, 0, -1.4, 1.4, 1.0, 1.4); return f.list; }
  if (k === "well") { f(-1.4, 0, -1.4, 1.4, 1.0, 1.4); return f.list; }
  return null; }

const LK = { paint, flatc, glow, BX, LA, SEG, PIPE };
export const lampHeads = { lantern: LANTERN, finial: FINIAL };
