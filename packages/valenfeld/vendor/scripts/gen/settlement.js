// The settlement kit's one generator. params.kind:
//  house  { b: forest|alpine|desert|coast, w, d, h, pitch, two, inn, chim, v, seed }: front (door) on -z, centred at origin.
//         forest: stone plinth, lime plaster in an oak frame, jettied upper floor, mossy slate. alpine: low dark-stone
//         longhouse, turf or slab roof, snow on it. desert: mud-brick / sandstone, flat roof, parapet, vigas, awning.
//         coast: tarred planks on drift stilts, porch and steps, net hung to dry. inn: an OPEN doorway and a room inside.
//         shop: <store type> (general|apothecary|smith|armorer|pawnshop|fletcher|bookseller|mage-supply): an OPEN doorway, counter, shelves of its goods; keeper at shopLayout().
//  square { b, r, sl, sw, stalls, seed }: the paved square + street to +x, well, market stalls.
//  wall   { b, R, gw, h, gates?: [deg], wob?, towers? }: palisade / stone / mud ring, a gap per gate (default one on +x) with towers unless towers: false.
//  gatehouse { b, gw, h }: the two gate towers and the walkway lintel at the origin, road along x.
//  props  { b, items: [[type, x, z, yaw, s]] }: barrel crate cart fence lamp hay trough wood pot rack bench bed line board sack.
//  sign   { }: the town's signpost (the name board is a ui child).
//  deck   { segs: [[ax, ay, az, bx, by, bz, w]], pile }: plank walkways on piles (stilt towns, rafts, piers, moat bridges): walk on them (mesh collider).
//  retain { segs: [[ax, az, bx, bz, h]] }: dry-stone retaining walls (terraces, crater rings), top at y = h.
import STY from "../lib/data/building-styles.json";
import { shopLayout } from "../lib/shop-layout.js";
export { shopLayout } from "../lib/shop-layout.js";
import { paint, flatc, glow, BX, RB, LA, CY, HX, SEG, PIPE, ROPE, TORUS, LOFT, ROOF, BARREL, CB, FS, OAK, PL, SL, IR, FLAG, HAY, TAR, DRIFT, CANVAS, NET, ROCK, STONE, WOOD, WHITE, IRONC, TARC, DRIFTC } from "../lib/buildkit.js";
const DFS = "cdn/texture-dark-fieldstone-wall-lichen.png", SNOW = "cdn/texture-snow-packed-fresh.png", TURF = "cdn/texture-turf-sod-roof.png", GREY = "cdn/texture-grey-ashlar-stone-wall.png";
const SAND = "cdn/texture-sandstone-blocks-weathered.png", MUD = "cdn/texture-mudbrick-adobe-wall.png", RED = "cdn/texture-faded-red-cloth-weave.png", OCHRE = "cdn/texture-faded-ochre-cloth-weave.png";
const SFLAG = "cdn/texture-sandstone-flagstone-paving.png", CLAY = "cdn/texture-terracotta-clay-pottery.png", DRW = "cdn/texture-weathered-driftwood-planks.png";
const SNOWC = "oklch(0.8 0.018 245)" /* critic r8 Nov 4 Kaldmoor: 0.9 glared as a white slab on the great hall from the aerial */, DST = "oklch(0.9 0.01 80)", GLASS = "oklch(0.22 0.03 240)", SHUT = "oklch(0.93 0.05 35)";
function rng(seed) { let a = (Math.floor((seed || 1) * 2654435761) >>> 0) || 1;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const TAN = (deg) => Math.tan(deg * Math.PI / 180);
// NETRACK: two driftwood poles on the ground at x, z0..z1, a rope between their tops, a net draped over it in soft folds (sagging hem, cork floats on the rope).
// Reusable for any harbour dressing: (c, x, y, z0, z1, seed).
function NETRACK(c, x, y, z0, z1, seed) { const R = rng(seed * 7 + 3), top = y + 2.2 + R() * 0.3, L = z1 - z0;
  paint(c, DRW, "oklch(0.8 0.03 70)"); for (const z of [z0, z1]) { BX(c, x - 0.06, y - 0.3, z - 0.06, x + 0.06, top + 0.15, z + 0.06); SEG(c, [x, top - 0.05, z], [x + 0.5, y, z], 0.05, 0.05); }
  paint(c, CANVAS, "oklch(0.7 0.04 70)"); ROPE(c, [x, top, z0], [x, top, z1], 0.12, 0.02, 6);
  paint(c, NET, "oklch(0.62 0.05 55)"); const n = Math.max(6, Math.round(L / 0.35)), drop = 1.1 + R() * 0.5, rows = [];
  for (const [f, dy] of [[0, 0], [0.5, drop * 0.55], [1, drop]]) { const row = [];
    for (let i = 0; i <= n; i++) { const t = i / n, sag = 0.12 * 4 * t * (1 - t), fold = (i % 2 ? 0.09 : -0.09) * f + f * 0.12, hem = f * (0.25 * Math.sin(t * 6.3 + seed) + 0.2 * 4 * t * (1 - t));
      row.push([x + fold, top - 0.03 - sag - dy - hem, z0 + t * L]); } rows.push(row); }
  LOFT(c, rows); LOFT(c, rows.map((r) => r.slice().reverse()));
  flatc(c, "oklch(0.62 0.12 50)"); for (let i = 1; i < 5; i++) { const t = i / 5; LA(c, x, top - 0.12 * 4 * t * (1 - t) - 0.06, z0 + t * L, [[0.001, -0.07], [0.07, 0], [0.001, 0.07]], 6, false, "z"); } }

// ---------- house ----------
function dims(p) {
  const b = p.b ?? "forest", w = p.w ?? 8, d = p.d ?? 6, inn = !!p.inn, shop = inn ? null : (p.shop || null), open = inn || !!shop, two = !!p.two;
  const stilts = b === "coast" && !open && !p.dry,   /* p.dry: the house stands on dry ground (Nov 4 critic: stilts over flat sand read as floating) */ y0 = open ? 0.3 : stilts ? 1.3 : b === "desert" ? 0.15 : 0.5;
  const h = p.h ?? (b === "alpine" ? 2.6 : 3), t = b === "alpine" ? 0.6 : b === "desert" ? 0.45 : 0.3;
  const J = b === "forest" && two ? 0.35 : 0, H1 = y0 + h, H = two ? H1 + 2.7 : H1;
  const pitch = p.pitch ?? 38, o = b === "alpine" ? 0.8 : 0.5, ez = d / 2 + J, ridge = H + ez * TAN(pitch);
  const dw = open ? 1.5 : 1.15, dh = open ? Math.min(2.5, h - 0.25) : 2.2, dx = p.dx ?? 0;
  return { b, w, d, inn, shop, open, two, stilts, y0, h, t, J, H1, H, pitch, o, ez, ridge, dw, dh, dx, hw: w / 2, hd: d / 2 };
}
// four walls, the front (-z) cut by the door
function walls(c, x0, x1, z0, z1, ya, yb, t, door) {
  if (door) { BX(c, x0, ya, z0, door.x - door.w / 2, yb, z0 + t); BX(c, door.x + door.w / 2, ya, z0, x1, yb, z0 + t); BX(c, door.x - door.w / 2, ya + door.h, z0, door.x + door.w / 2, yb, z0 + t); }
  else BX(c, x0, ya, z0, x1, yb, z0 + t);
  BX(c, x0, ya, z1 - t, x1, yb, z1); BX(c, x0, ya, z0 + t, x0 + t, yb, z1 - t); BX(c, x1 - t, ya, z0 + t, x1, yb, z1 - t);
}
// a window on side f of the box e, centre u along the wall, sill at y
let BARN = false; // a stable's openings are board shutters, never lamplit glass (Nov 4 critic: "a red cottage with a carport")
function win(c, e, f, u, y, ww, wh, fr, frc, shut) {
  const box = (a0, a1, b0, b1, y0, y1) => f === "f" ? BX(c, a0, y0, e.z0 - b1, a1, y1, e.z0 - b0) : f === "b" ? BX(c, a0, y0, e.z1 + b0, a1, y1, e.z1 + b1)
    : f === "l" ? BX(c, e.x0 - b1, y0, a0, e.x0 - b0, y1, a1) : BX(c, e.x1 + b0, y0, a0, e.x1 + b1, y1, a1);
  { const hsh = Math.abs(Math.sin(u * 12.9898 + y * 78.233 + (e.x0 + e.z1) * 3.71 + (f.charCodeAt(0)) * 1.37) * 43758.5453) % 1;   // a few panes dark, most lamplit, some dim: a lived-in facade at night
    c.albedo(null); if (BARN) { c.color("oklch(0.28 0.03 45)"); } else if (hsh < 0.5) { c.color(GLASS); c.emissive(0.05, 0.03, 0.01); } else { c.color("oklch(0.72 0.12 70)"); if (hsh < 0.68) c.emissive(0.9, 0.5, 0.2); else c.emissive(2.0, 1.15, 0.45); } }
  box(u - ww / 2, u + ww / 2, -0.02, 0.02, y, y + wh); c.emissive(null);
  paint(c, fr, frc); const k = 0.09;
  box(u - ww / 2 - k, u - ww / 2, -0.07, 0.03, y, y + wh); box(u + ww / 2, u + ww / 2 + k, -0.07, 0.03, y, y + wh);
  box(u - ww / 2 - k, u + ww / 2 + k, -0.07, 0.03, y + wh, y + wh + k); box(u - 0.025, u + 0.025, -0.05, 0.03, y, y + wh);
  box(u - ww / 2 - k - 0.05, u + ww / 2 + k + 0.05, -0.14, 0.03, y - 0.1, y);
  if (shut) { paint(c, OAK, typeof shut === "string" ? shut : SHUT); box(u - ww / 2 - k - ww / 2, u - ww / 2 - k - 0.02, -0.1, -0.03, y, y + wh); box(u + ww / 2 + k + 0.02, u + ww / 2 + k + ww / 2, -0.1, -0.03, y, y + wh); }
}
function gable(c, xa, xb, z0, z1, ht, R) { const zm = (z0 + z1) / 2;
  HX(c, [[xa, ht, z0], [xb, ht, z0], [xb, ht, z1], [xa, ht, z1], [xa, R, zm], [xb, R, zm], [xb, R, zm], [xa, R, zm]]); }
/* critic Nov 4 r5 (Ashford stable-45): "a townhouse with a garage". Kit rule: role "stable" is a barn, not a house: one storey, tall plank walls in barn-red oak, a low pitch, no chimney, no shop or upper floor */
function stableize(p) { if (p.role !== "stable") return p;
  return { ...p, two: false, chim: 0, shop: null, inn: false, h: Math.max(p.h ?? 3, 3.6), pitch: 32, st: null, var: { roofTint: "oklch(0.42 0.03 50)", shutterTint: "#4a3a2c", wallTint: "oklch(0.63 0.09 38)" }, barn: true }; }
/* critic Nov 4 (Skarn/Kaldmoor 3/10 "repeated cottages"): style massing: { two, h, pitch, tint } re-rolls storeys, eave height, roof pitch and wash per house from its seed
   (its own hash, so walls/windows keep their roll); geometry and collider read the same p. Footprint never changes: lots stay where the planner put them. p.massing: false opts a house out. */
/* critic round 6 (Kaldmoor "a dense mat of pale, same-value roofs"): massing.roof = [{ roof, roofTint, snow: full|ridge|patchy|none, w }] rolls a cover, its tint and how much snow it holds
   per house (rolled last, so the storey/eave/pitch/wash rolls above stay as they were). A style with no massing of its own reads its form's (alpine form: no st falls back to b). */
function massing(p) { const M = (p.st && STY.styles?.[p.st]?.massing) || (!p.st && STY.styles?.[p.b]?.massing); if (!M || p.massing === false || p.barn || p.inn) return p;
  let a = ((Math.abs(Math.round(p.seed ?? 1)) * 2246822519) ^ 0x5bd1e995) >>> 0; const R = () => { a = (Math.imul(a ^ (a >>> 15), 2654435761) + 0x6d2b79f5) >>> 0; return a / 4294967296; };
  const two = p.two || R() < (M.two ?? 0), h = M.h ? Math.round((M.h[0] + (M.h[1] - M.h[0]) * R()) * 10) / 10 : p.h, pitch = M.pitch ? Math.round(M.pitch[0] + (M.pitch[1] - M.pitch[0]) * R()) : p.pitch;
  const tint = M.tint?.length ? M.tint[Math.floor(R() * M.tint.length)] : null;
  let rf = null; if (M.roof?.length) { const tot = M.roof.reduce((a, r) => a + (r.w ?? 1), 0); let u = R() * tot; rf = M.roof.find((r) => (u -= (r.w ?? 1)) < 0) ?? M.roof[M.roof.length - 1]; }
  const vr = tint || rf ? { ...(p.var || {}), ...(tint ? { wallTint: tint } : {}), ...(rf?.roof ? { roof: rf.roof } : {}), ...(rf?.roofTint ? { roofTint: rf.roofTint } : {}) } : p.var;
  return { ...p, two, h: two ? Math.min(h, (M.h?.[1] ?? h) - 0.2) : h, pitch: two ? Math.max(M.pitch?.[0] ?? pitch, pitch - 6) : pitch, var: vr, ...(rf?.snow ? { snow: rf.snow } : {}) }; }
function house(c, p, D) { p = massing(stableize(p)); BARN = !!p.barn;
  const g = dims(p), R = rng(p.seed ?? 1), { b, w, d, hw, hd, t, y0, H1, H, J, two, inn, shop, open, stilts, dw, dh, dx } = g, v = p.v ?? 0;
  const fine = D <= 2, mid = D <= 3, door = { x: dx, w: dw, h: dh };
  let wallT = b === "forest" ? PL : b === "alpine" ? DFS : b === "desert" ? (v < 0.5 ? MUD : SAND) : TAR;
  let wallC = b === "forest" ? WHITE : b === "alpine" ? DST : b === "desert" ? WHITE : TARC;
  let frameT = b === "desert" ? SAND : b === "alpine" ? GREY : b === "coast" ? DRW : OAK, frameC = b === "coast" ? DRIFTC : WOOD;
  // the building grammar's style (content/grammar/kit/architecture.yml -> building-styles.json): trim over the form's massing; no st = the form as before
  const S = (p.st || p.var) ? { ...((p.st && STY.styles?.[p.st]) || {}), ...(p.var || {}) } : null;   // var: the town dresser's per-house colour over the style
  if (S?.walls) wallT = Array.isArray(S.walls) ? S.walls[(Math.abs(Math.round(p.seed ?? 1)) >>> 1) % S.walls.length] : S.walls;   /* a list: one per house by seed (critic, Skarn Nov 4: one house stamped 20 times) */ if (S?.wallTint) wallC = Array.isArray(S.wallTint) ? S.wallTint[Math.abs(Math.round(p.seed ?? 1)) % S.wallTint.length] : S.wallTint; if (S?.frame) frameT = S.frame; if (S?.frameTint) frameC = S.frameTint;
  if (p.barn) { wallT = DRW; wallC = p.var.wallTint; frameT = OAK; frameC = "oklch(0.34 0.04 50)"; }
  if (S?.wash && typeof wallC === "string") { const m = wallC.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/); if (m) wallC = `oklch(${Math.min(+m[1], S.wash.l)} ${Math.max(+m[2] * S.wash.c, S.wash.min)} ${m[3]})`; }   // style wash: a lime-wash deep enough to read as colour, each house's own hue kept
  // critic Nov 4 (Hollowmere/Ashford): baked crown-ashlar roofs read as toy blue/teal/red. Kit rule: an oklch roof tint is weathered at draw, chroma <= ROOF_C, lightness <= ROOF_L, hue kept; hex culture roofs (thalor copper) untouched
  if (S?.roofTint && typeof S.roofTint === "string") { const m = S.roofTint.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/); if (m) S.roofTint = `oklch(${Math.min(+m[1], 0.64)} ${Math.min(+m[2], 0.045)} ${m[3]})`; }
  const RT = (t) => S?.roof ?? t, RC = (c0) => S?.roofTint ?? c0, OV = S?.overhang ?? g.o;
  if (p.yard && D <= 3) for (const it of p.yard) prop(c, it, b, D);   // the town dresser's yard, in the house's own frame
  /* critic Nov 4 (Ashford stable-45): a stable read as one more house. Kit rule: role "stable" = wide braced stall doors on the front beside the house door, hay stacked at the side, a trough out front */
  if (p.role === "stable" && D <= 4) { const sw = Math.min(3.2, w * 0.38), su = dx > 0 ? -hw + sw / 2 + 0.5 : hw - sw / 2 - 0.5, sh = Math.min(2.6, (H1 ?? 3) - 0.3);
    c.albedo(null); c.color("oklch(0.12 0.01 60)"); BX(c, su - sw / 2, 0, -hd - 0.03, su + sw / 2, sh, -hd);
    paint(c, OAK, "oklch(0.62 0.05 55)"); for (const sx of [-1, 1]) { const a = su + sx * sw / 4; BX(c, a - sw / 4 + 0.03, 0.05, -hd - 0.12, a + sw / 4 - 0.03, sh * 0.55, -hd - 0.04);
      if (D <= 3) { SEG(c, [a - sw / 4 + 0.1, 0.12, -hd - 0.14], [a + sw / 4 - 0.1, sh * 0.5, -hd - 0.14], 0.06, 0.06); BX(c, a - sw / 4, sh * 0.53, -hd - 0.15, a + sw / 4, sh * 0.58, -hd - 0.12); } }
    paint(c, OAK, WOOD); BX(c, su - sw / 2 - 0.15, 0, -hd - 0.16, su - sw / 2, sh + 0.15, -hd); BX(c, su + sw / 2, 0, -hd - 0.16, su + sw / 2 + 0.15, sh + 0.15, -hd); BX(c, su - sw / 2 - 0.15, sh, -hd - 0.16, su + sw / 2 + 0.15, sh + 0.18, -hd);
    if (D <= 3) { prop(c, ["hay", (dx > 0 ? -1 : 1) * (hw + 0.9), -hd + 1.4, 90, 2], b, D); prop(c, ["hay", (dx > 0 ? -1 : 1) * (hw + 0.9), -hd + 2.9, 84, 1], b, D); prop(c, ["trough", su, -hd - 1.3, 0, 1], b, D); }
    /* a lean-to over the stall doors on three posts, a hayloft door high in the gable with a hoist beam, and a railed paddock on the open side */
    const lx0 = su - sw / 2 - 0.6, lx1 = su + sw / 2 + 0.6, lz = -hd - 2.0, ly0 = sh + 0.55, ly1 = sh - 0.15;
    paint(c, OAK, "oklch(0.4 0.04 50)"); for (const px of [lx0 + 0.1, (lx0 + lx1) / 2, lx1 - 0.1]) BX(c, px - 0.09, 0, lz - 0.09, px + 0.09, ly1, lz + 0.09);
    BX(c, lx0, ly1 - 0.12, lz - 0.1, lx1, ly1 + 0.02, lz + 0.1);
    paint(c, OAK, "oklch(0.62 0.04 60)"); HX(c, [[lx0 - 0.2, ly1, lz - 0.3], [lx1 + 0.2, ly1, lz - 0.3], [lx1 + 0.2, ly1 + 0.08, lz - 0.3], [lx0 - 0.2, ly1 + 0.08, lz - 0.3], [lx0 - 0.2, ly0, -hd], [lx1 + 0.2, ly0, -hd], [lx1 + 0.2, ly0 + 0.08, -hd], [lx0 - 0.2, ly0 + 0.08, -hd]]);
    if (D <= 3) { const gx = dx > 0 ? -hw : hw, gs = dx > 0 ? -1 : 1, gy = H1 + 0.5;
      c.albedo(null); c.color("oklch(0.14 0.01 60)"); BX(c, gx + gs * 0.01, gy, -0.6, gx + gs * 0.05, gy + 1.3, 0.6);
      paint(c, OAK, "oklch(0.55 0.05 50)"); BX(c, gx + gs * 0.04, gy, -0.65, gx + gs * 0.12, gy + 1.3, -0.55); BX(c, gx + gs * 0.04, gy, 0.55, gx + gs * 0.12, gy + 1.3, 0.65);
      paint(c, OAK, WOOD); BX(c, gx, gy + 1.55, -0.08, gx + gs * 1.1, gy + 1.7, 0.08); c.albedo(null); c.color("oklch(0.3 0.02 60)"); BX(c, gx + gs * 1.0, gy + 0.6, -0.02, gx + gs * 1.03, gy + 1.55, 0.02);
      const px = gs * (hw + 3.3), ex = px + gs * 2.3; for (const [fx, fz, fy, fl] of [[px, -hd + 0.2, 0, 4.6], [px, hd - 0.2, 0, 4.6], [ex, 0, 90, d - 0.4]]) prop(c, ["fence", fx, fz, fy, fl], b, D); } }
  if (D >= 5) { paint(c, wallT, wallC); BX(c, -hw, 0, -hd, hw, H, hd);
    /* critic Nov 4 (Ashford temple-38): the level-5 box read as a blank windowless wall up close; a lit pane per bay and a dark sill band, a few dozen faces */
    if (b !== "desert") { paint(c, OAK, WOOD); BX(c, -hw - 0.04, H1 - 0.1, -hd - 0.04, hw + 0.04, H1 + 0.1, hd + 0.04); }
    { c.albedo(null); c.color("oklch(0.72 0.12 70)"); c.emissive(1.4, 0.8, 0.3); const ww5 = 0.85, wh5 = 1.1, sy5 = Math.min(1.0, g.h * 0.35) + (g.y0 ?? 0), nb5 = Math.max(2, Math.floor(w / 3));
      for (let i = 0; i < nb5; i++) { const u = -hw + w * (i + 0.5) / nb5; if (Math.abs(u - dx) < dw / 2 + 0.9) continue; BX(c, u - ww5 / 2, sy5, -hd - 0.03, u + ww5 / 2, sy5 + wh5, -hd); BX(c, u - ww5 / 2, sy5, hd, u + ww5 / 2, sy5 + wh5, hd + 0.03); if (two) { BX(c, u - ww5 / 2, H1 + 0.9, -hd - 0.03, u + ww5 / 2, H1 + 0.9 + wh5, -hd); BX(c, u - ww5 / 2, H1 + 0.9, hd, u + ww5 / 2, H1 + 0.9 + wh5, hd + 0.03); } }
      BX(c, -hw - 0.03, sy5, -ww5 / 2, -hw, sy5 + wh5, ww5 / 2); BX(c, hw, sy5, -ww5 / 2, hw + 0.03, sy5 + wh5, ww5 / 2); c.emissive(null); } if (b !== "desert") { paint(c, RT(b === "alpine" ? TURF : b === "coast" && v < 0.5 ? TAR : SL), RC(STONE)); ROOF(c, -hw - g.o, hw + g.o, -hd - g.o, hd + g.o, H - g.o * TAN(g.pitch), g.ridge, 0.3); } return; }
  // footing
  if (stilts) {
    paint(c, DRW, DRIFTC); const nx = Math.max(2, Math.round(w / 2.4)), nz = Math.max(2, Math.round(d / 2.4));
    for (let i = 0; i <= nx; i++) for (const zz of [-hd - 1.5, -hd + 0.15, hd - 0.15]) PIPE(c, [-hw + 0.15 + (w - 0.3) * i / nx, -0.6, zz], [-hw + 0.15 + (w - 0.3) * i / nx, y0 - 0.15, zz], 0.13, 0.12, fine ? 7 : 5);
    for (let k = 1; k < nz; k++) for (const xx of [-hw + 0.15, hw - 0.15]) PIPE(c, [xx, -0.6, -hd + d * k / nz], [xx, y0 - 0.15, -hd + d * k / nz], 0.13, 0.12, fine ? 7 : 5);
    paint(c, DRIFT, DRIFTC); BX(c, -hw - 0.3, y0 - 0.18, -hd - 1.7, hw + 0.3, y0, hd + 0.3);
    // steps down from the porch, rails
    paint(c, DRW, DRIFTC); const n = Math.ceil(y0 / 0.2);
    for (let i = 0; i < n; i++) BX(c, dx - 0.65, y0 - (i + 1) * 0.2 - 0.06, -hd - 1.7 - (i + 1) * 0.3, dx + 0.65, y0 - (i + 1) * 0.2 + 0.0, -hd - 1.7 - i * 0.3);
    if (mid) { for (const xx of [-hw - 0.2, hw + 0.2, dx - 0.8, dx + 0.8]) BX(c, xx - 0.06, y0, -hd - 1.66, xx + 0.06, y0 + 1, -hd - 1.54);
      BX(c, -hw - 0.25, y0 + 0.92, -hd - 1.66, dx - 0.75, y0 + 1.02, -hd - 1.54); BX(c, dx + 0.75, y0 + 0.92, -hd - 1.66, hw + 0.25, y0 + 1.02, -hd - 1.54);
      for (const xx of [-hw - 0.2, hw + 0.2]) BX(c, xx - 0.05, y0 + 0.92, -hd - 1.6, xx + 0.05, y0 + 1.02, -hd); }
  } else if (b !== "desert") { paint(c, b === "alpine" ? DFS : FS, STONE); BX(c, -hw - 0.08, -0.6, -hd - 0.08, hw + 0.08, y0, hd + 0.08);
    // footing (Nov 4 critic: oak stilts read as a house hovering over the slope): a fieldstone footing runs down past the low corner, stepped out once like a dry-stone batter; buried on a level pad, a wall where the slope falls away
    if (D <= 4) { const PD = -Math.max(4.2, (p.lift ?? 0) + 0.8); /* p.lift: metres the floor stands over its lowest corner (tools/checks/floating.live.js) */
      BX(c, -hw - 0.14, -1.6, -hd - 0.14, hw + 0.14, -0.55, hd + 0.14);
      BX(c, -hw - 0.3, PD, -hd - 0.3, hw + 0.3, -1.6, hd + 0.3);
      if (mid) { paint(c, OAK, WOOD); BX(c, -hw - 0.16, -0.62, -hd - 0.16, hw + 0.16, -0.5, hd + 0.16); paint(c, b === "alpine" ? DFS : FS, STONE); } }
    if (open || y0 > 0.3) BX(c, dx - dw / 2 - 0.3, -0.3, -hd - 0.75, dx + dw / 2 + 0.3, y0 / 2, -hd - 0.08); }
  else { paint(c, SAND, STONE); BX(c, -hw - 0.12, -0.5, -hd - 0.12, hw + 0.12, y0, hd + 0.12); }
  // ground floor walls (forest two-storey: stone below, the frame above)
  const lowT = S?.low && two ? S.low.tex : b === "forest" && two && !S?.walls ? FS : wallT, lowC = S?.low && two ? S.low.tint : b === "forest" && two && !S?.walls ? STONE : wallC;   // style low: a stone ground floor under the wash
  paint(c, lowT, lowC); walls(c, -hw, hw, -hd, hd, y0, H1, t, door);
  if (two) { paint(c, wallT, wallC); if (J) paint(c, OAK, WOOD), BX(c, -hw - J, H1 - 0.05, -hd - J, hw + J, H1 + 0.18, hd + J), paint(c, wallT, wallC);
    if (b === "desert") { const ux0 = -hw + w * (v < 0.5 ? 0 : 0.3), ux1 = ux0 + w * 0.7; walls(c, ux0, ux1, -hd + d * 0.35, hd, H1 + 0.25, H, t, null); }
    else walls(c, -hw - J, hw + J, -hd - J, hd + J, H1 + 0.18, H, t, null); }
  if (S?.band && mid) { paint(c, S.band.tex, S.band.tint); const bj = two && b !== "desert" ? J : 0; BX(c, -hw - bj - 0.07, H1 - 0.32, -hd - bj - 0.07, hw + bj + 0.07, H1 - 0.12, hd + bj + 0.07); }
  // door: frame, leaf (shut) or the room inside (inn)
  const z0 = -hd;
  paint(c, frameT, frameC); BX(c, dx - dw / 2 - 0.18, y0, z0 - 0.08, dx - dw / 2, y0 + dh, z0 + t); BX(c, dx + dw / 2, y0, z0 - 0.08, dx + dw / 2 + 0.18, y0 + dh, z0 + t);
  BX(c, dx - dw / 2 - 0.3, y0 + dh, z0 - 0.1, dx + dw / 2 + 0.3, y0 + dh + 0.24, z0 + t);
  if (!open) { paint(c, OAK, "oklch(0.88 0.03 60)"); BX(c, dx - dw / 2, y0, z0 + t * 0.4, dx + dw / 2, y0 + dh, z0 + t * 0.4 + 0.08);
    if (fine) { paint(c, IR, IRONC); for (const yy of [0.4, dh - 0.5]) BX(c, dx - dw / 2 + 0.05, y0 + yy, z0 + t * 0.4 - 0.02, dx + dw / 2 - 0.2, y0 + yy + 0.07, z0 + t * 0.4); BX(c, dx + dw / 2 - 0.2, y0 + 1, z0 + t * 0.4 - 0.05, dx + dw / 2 - 0.12, y0 + 1.15, z0 + t * 0.4); } }
  else if (inn && mid) { // the taproom
    paint(c, OAK, WOOD); BX(c, -hw + t, y0 - 0.02, -hd + t, hw - t, y0 + 0.02, hd - t);
    BX(c, -hw + t, Math.min(H1, y0 + 3.3) - 0.1, -hd + t, hw - t, Math.min(H1, y0 + 3.3) + 0.15, hd - t);
    for (let i = 1; i < Math.round(w / 2.2); i++) BX(c, -hw + w * i / Math.round(w / 2.2) - 0.12, Math.min(H1, y0 + 3.3) - 0.38, -hd + t, -hw + w * i / Math.round(w / 2.2) + 0.12, Math.min(H1, y0 + 3.3) - 0.1, hd - t);
    BX(c, -hw + t + 0.6, y0, -hd + 2.2, -hw + t + 1.2, y0 + 1.1, hd - 1.6); BX(c, -hw + t + 0.45, y0 + 1.1, -hd + 2.1, -hw + t + 1.3, y0 + 1.18, hd - 1.5);
    for (const [tx, tz] of [[1.2, -0.6], [hw - 2.2, hd - 2.4]]) { BX(c, tx - 0.8, y0 + 0.72, tz - 0.5, tx + 0.8, y0 + 0.8, tz + 0.5); for (const sx of [-0.65, 0.65]) for (const sz of [-0.38, 0.38]) BX(c, tx + sx - 0.05, y0, tz + sz - 0.05, tx + sx + 0.05, y0 + 0.72, tz + sz + 0.05);
      for (const sz of [-0.9, 0.9]) BX(c, tx - 0.8, y0 + 0.42, tz + sz - 0.15, tx + 0.8, y0 + 0.48, tz + sz + 0.15); }
    if (fine) for (let i = 0; i < 3; i++) BARREL(c, -hw + t + 0.45, y0, hd - t - 0.45 - i * 0.75, 0.32, 0.85, D);
    paint(c, b === "desert" ? SAND : FS, STONE); const hx = hw * 0.35; BX(c, hx - 1, y0, hd - t - 0.8, hx + 1, y0 + 1.6, hd - t); BX(c, hx - 1.15, y0 + 1.6, hd - t - 0.95, hx + 1.15, y0 + 1.8, hd - t);
    c.albedo(null); c.color("oklch(0.12 0.01 40)"); BX(c, hx - 0.6, y0 + 0.15, hd - t - 0.82, hx + 0.6, y0 + 1.1, hd - t - 0.3);
    glow(c, "oklch(0.5 0.12 45)", [4, 1.5, 0.3]); BX(c, hx - 0.5, y0 + 0.15, hd - t - 0.75, hx + 0.5, y0 + 0.3, hd - t - 0.35); c.emissive(null);
  }
  if (shop && mid) shopRoom(c, g, fine);
  // windows: front bays clear of the door, one or two each side, the upper floor too
  const ww = S?.window?.[0] ?? (b === "desert" ? 0.6 : 0.85), wh = S?.window?.[1] ?? (b === "desert" ? 0.8 : b === "alpine" ? 0.7 : 1.1), shut = S?.shutters != null ? (S.shutters && (S.shutterTint ?? true)) : b === "forest" || b === "coast";
  if (mid) {
    const E1 = { x0: -hw, x1: hw, z0: -hd, z1: hd }, sy = y0 + Math.min(1.0, g.h * 0.35);
    const nb = Math.max(2, Math.floor(w / 2.6));
    for (let i = 0; i < nb; i++) { const u = -hw + w * (i + 0.5) / nb; if (Math.abs(u - dx) < dw / 2 + ww / 2 + 0.6 || Math.abs(u) > hw - 0.7) continue; win(c, E1, "f", u, sy, ww, wh, frameT, frameC, shut); win(c, E1, "b", u, sy, ww, wh, frameT, frameC, shut); }
    const ns = d > 6.5 ? 2 : 1; for (let i = 0; i < ns; i++) { const u = -hd + d * (i + 0.5) / ns; win(c, E1, "l", u, sy, ww, wh, frameT, frameC, shut); win(c, E1, "r", u, sy, ww, wh, frameT, frameC, shut); }
    if (two) { const E2 = b === "desert" ? { x0: -hw + w * (v < 0.5 ? 0 : 0.3), x1: -hw + w * (v < 0.5 ? 0.7 : 1), z0: -hd + d * 0.35, z1: hd } : { x0: -hw - J, x1: hw + J, z0: -hd - J, z1: hd + J };
      const uy = H1 + 0.9, nb2 = Math.max(2, Math.floor((E2.x1 - E2.x0) / 2.4));
      for (let i = 0; i < nb2; i++) { const u = E2.x0 + (E2.x1 - E2.x0) * (i + 0.5) / nb2; win(c, E2, "f", u, uy, ww, wh, frameT, frameC, shut); win(c, E2, "b", u, uy, ww, wh, frameT, frameC, shut); }
      win(c, E2, "l", (E2.z0 + E2.z1) / 2, uy, ww, wh, frameT, frameC, shut); win(c, E2, "r", (E2.z0 + E2.z1) / 2, uy, ww, wh, frameT, frameC, shut); }
  } else if (D <= 5) {   // far: the panes alone (2 faces each), so a distant house never reads as a blank box (critic r8, Brinewall inn)
    const E1 = { x0: -hw, x1: hw, z0: -hd, z1: hd }, sy = y0 + Math.min(1.0, g.h * 0.35), nb = Math.max(2, Math.floor(w / 2.6));
    const pane = (e, f, u, y) => { c.albedo(null); c.color("oklch(0.72 0.12 70)"); c.emissive(1.4, 0.8, 0.3);
      if (f === "f") BX(c, u - ww / 2, y, e.z0 - 0.03, u + ww / 2, y + wh, e.z0); else if (f === "b") BX(c, u - ww / 2, y, e.z1, u + ww / 2, y + wh, e.z1 + 0.03);
      else if (f === "l") BX(c, e.x0 - 0.03, y, u - ww / 2, e.x0, y + wh, u + ww / 2); else BX(c, e.x1, y, u - ww / 2, e.x1 + 0.03, y + wh, u + ww / 2); c.emissive(null); };
    for (let i = 0; i < nb; i++) { const u = -hw + w * (i + 0.5) / nb; if (Math.abs(u - dx) < dw / 2 + ww / 2 + 0.6 || Math.abs(u) > hw - 0.7) continue; pane(E1, "f", u, sy); pane(E1, "b", u, sy); if (two) { pane(E1, "f", u, H1 + 0.9); pane(E1, "b", u, H1 + 0.9); } }
    pane(E1, "l", 0, sy); pane(E1, "r", 0, sy);
  }
  // the frame (forest timber, coast corner posts)
  if (mid && (b === "forest" || b === "coast")) {
    paint(c, S?.frame ?? (b === "coast" ? DRW : OAK), S?.frameTint ?? (b === "coast" ? DRIFTC : "oklch(0.85 0.03 60)"));
    const bands = b === "forest" && two ? [[H1 + 0.18, H, J]] : [[y0, H1, 0]];
    for (const [ya, yb, j] of bands) { const X = hw + j + 0.04, Z = hd + j + 0.04;
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) BX(c, sx * X - 0.13, ya, sz * Z - 0.13, sx * X + 0.13, yb, sz * Z + 0.13);
      if (b === "forest") {
        for (const yy of [ya, yb - 0.2, (ya + yb) / 2 + 0.2]) { if (yy === ya && !two) continue; BX(c, -X, yy, -Z, X, yy + 0.18, -Z + 0.06); BX(c, -X, yy, Z - 0.06, X, yy + 0.18, Z); BX(c, -X, yy, -Z, -X + 0.06, yy + 0.18, Z); BX(c, X - 0.06, yy, -Z, X, yy + 0.18, Z); }
        if (fine) for (const sx of [-1, 1]) { SEG(c, [sx * X, ya + 0.1, -Z + 0.3], [sx * X, yb - 0.2, -Z + Math.min(1.8, Z)], 0.14, 0.12); SEG(c, [sx * X, ya + 0.1, Z - 0.3], [sx * X, yb - 0.2, Z - Math.min(1.8, Z)], 0.14, 0.12);
          const xs = two ? [-X / 2, X / 2] : [-X * 0.62, X * 0.62]; for (const xx of xs) { if (!two && Math.abs(xx - dx) < dw) continue; SEG(c, [xx - sx * 0.6, ya + 0.1, sx > 0 ? -Z : Z], [xx + sx * 0.6, yb - 0.2, sx > 0 ? -Z : Z], 0.12, 0.12); } }
      } } }
  // roof
  const ex = hw + J, ez = g.ez;
  if (b === "desert") {
    const top = (x0, x1, z0b, z1b, y) => { paint(c, SAND, STONE); BX(c, x0 - 0.05, y, z0b - 0.05, x1 + 0.05, y + 0.25, z1b + 0.05);
      paint(c, S?.walls ?? (v < 0.5 ? MUD : SAND), S?.wallTint ?? WHITE); const pt = 0.22, py = y + 0.25, ph = 0.6; BX(c, x0, py, z0b, x1, py + ph, z0b + pt); BX(c, x0, py, z1b - pt, x1, py + ph, z1b); BX(c, x0, py, z0b + pt, x0 + pt, py + ph, z1b - pt); BX(c, x1 - pt, py, z0b + pt, x1, py + ph, z1b - pt);
      if (fine) { paint(c, OAK, WOOD); for (let xx = x0 + 0.6; xx < x1 - 0.3; xx += 0.95) { PIPE(c, [xx, y - 0.12, z0b + 0.3], [xx, y - 0.12, z0b - 0.45], 0.09, 0.09, 6); PIPE(c, [xx, y - 0.12, z1b - 0.3], [xx, y - 0.12, z1b + 0.45], 0.09, 0.09, 6); } } };
    if (two) { top(-hw, hw, -hd, hd, H1); const ux0 = -hw + w * (v < 0.5 ? 0 : 0.3); top(ux0, ux0 + w * 0.7, -hd + d * 0.35, hd, H); } else top(-hw, hw, -hd, hd, H);
    // the awning on two poles before the door
    const aw = Math.min(w - 1, 3.6), ax0 = Math.max(-hw + 0.3, dx - aw / 2), ax1 = Math.min(hw - 0.3, dx + aw / 2), ay = Math.min(H1 - 0.3, y0 + 2.8);
    paint(c, OAK, WOOD); for (const xx of [ax0, ax1]) PIPE(c, [xx, 0, -hd - 1.9], [xx, ay - 0.45, -hd - 1.9], 0.06, 0.05, 6);
    SEG(c, [ax0, ay - 0.45, -hd - 1.9], [ax1, ay - 0.45, -hd - 1.9], 0.09, 0.09);
    paint(c, (p.seed ?? 1) % 2 ? RED : OCHRE, WHITE); const sl = Math.atan2(0.45, 1.9) * 180 / Math.PI;
    RB(c, (ax0 + ax1) / 2, ay - 0.2, -hd - 0.95, ax1 - ax0 + 0.3, 0.04, 2.0, 0, -sl, 0);
    if (fine) for (let xx = ax0; xx < ax1; xx += 0.5) RB(c, xx + 0.25, ay - 0.6, -hd - 1.97, 0.46, 0.3, 0.02, 0, 0, 0);
  } else {
    const o = OV, x0 = -ex - (b === "alpine" ? 0.3 : 0.45), x1 = ex + (b === "alpine" ? 0.3 : 0.45), zz0 = -ez - o, zz1 = ez + o, ye = H - o * TAN(g.pitch), yr = g.ridge + (b !== "alpine" && (((p.seed ?? 1) >>> 2) % 3 === 0) ? (g.ridge - H) * 0.5 : 0), th = b === "alpine" ? 0.35 : 0.22;
    { const pl = b === "forest" && !two && !S?.walls && !p.barn; paint(c, pl ? PL : wallT, pl ? WHITE : wallC); }
    gable(c, -ex, -ex + t, -ez, ez, H, yr - 0.05); gable(c, ex - t, ex, -ez, ez, H, yr - 0.05);
    if (b === "forest" && mid) { paint(c, OAK, "oklch(0.85 0.03 60)"); for (const sx of [-1, 1]) { const X = sx * (ex + 0.05); SEG(c, [X, H, 0], [X, yr - 0.15, 0], 0.16, 0.14); SEG(c, [X, H + 0.1, -ez * 0.8], [X, yr - 0.4, 0], 0.12, 0.12); SEG(c, [X, H + 0.1, ez * 0.8], [X, yr - 0.4, 0], 0.12, 0.12); BX(c, X - 0.05, H - 0.05, -ez, X + 0.05, H + 0.15, ez); } }
    const roofT = b === "alpine" ? (v < 0.55 ? TURF : GREY) : b === "coast" ? (v < 0.6 ? TAR : SL) : SL;
    paint(c, RT(roofT), RC(b === "coast" && roofT === TAR ? "oklch(0.85 0.01 60)" : STONE)); ROOF(c, x0, x1, zz0, zz1, ye, yr, th);
    if (p.patched && mid && b !== "alpine") { // #1587: a poor quarter's roof: mismatched slates, nailed oak boards and a tar smear over old leaks
      const PR = rng((p.seed ?? 1) + 77), n = 5 + Math.floor(PR() * 3), run = Math.hypot(ez + o, yr - ye), ang = Math.atan2(yr - ye, ez + o) * 180 / Math.PI;
      for (let i = 0; i < n; i++) {
        const side = PR() < 0.5 ? -1 : 1, u = 0.2 + PR() * 0.55, x = x0 + 0.9 + PR() * (x1 - x0 - 1.8), pw = 1.2 + PR() * 1.0, pd = 0.9 + PR() * 0.8, kind = PR();
        const z = side * (ez + o) * (1 - u), y = ye + (yr - ye) * u + th + 0.04, tilt = side * ang, lift = (dy) => y + dy;
        if (kind < 0.45) { paint(c, OAK, "oklch(0.62 0.05 60)"); const nb = 3 + Math.floor(PR() * 2); for (let k = 0; k < nb; k++) RB(c, x - pw / 2 + (k + 0.5) * pw / nb, lift(0.01 + (k % 2) * 0.012), z, pw / nb - 0.04, 0.05, pd + (k % 2 ? 0.12 : 0), (PR() - 0.5) * 6, tilt, 0);
          paint(c, OAK, "oklch(0.45 0.04 50)"); RB(c, x, lift(0.05), z, pw + 0.15, 0.04, 0.09, 0, tilt, 0); }
        else if (kind < 0.8) { paint(c, SL, PR() < 0.5 ? "oklch(0.72 0.05 70)" : "oklch(0.5 0.03 240)"); for (let k = 0; k < 4; k++) RB(c, x + ((k % 2) - 0.5) * pw * 0.5, lift(0.005 + k * 0.006), z + (k < 2 ? -0.5 : 0.5) * pd * 0.5 * side, pw * 0.52, 0.035, pd * 0.52, (PR() - 0.5) * 10, tilt, 0); }
        else { paint(c, TAR, "oklch(0.3 0.01 60)"); RB(c, x, lift(0), z, pw * 1.1, 0.025, pd * 1.2, (PR() - 0.5) * 20, tilt, 0); }
      }
    }
    if (mid) { paint(c, S?.ridge ?? (b === "alpine" ? GREY : RT(roofT)), S?.ridge ? WHITE : RC(STONE)); RB(c, 0, yr + th + 0.04, 0, x1 - x0 + 0.1, 0.16, 0.42); // ridge cap
      if (fine && b !== "alpine") { paint(c, OAK, WOOD); for (const sx of [-1, 1]) { const X = sx * (x1 - 0.02); SEG(c, [X, ye - 0.05, zz0], [X, yr + 0.05, 0], 0.08, 0.26); SEG(c, [X, yr + 0.05, 0], [X, ye - 0.05, zz1], 0.08, 0.26); } } }
    if (!shop && !inn && !open && (((p.seed ?? 1) >>> 4) % 3 === 0)) { // alpine too (#317601: cloned Frostwatch rows) // #357: a lean-to porch over the door on two oak posts, ~1 in 3 houses
      const pw = 2.6, pz = -hd - 1.5, py = Math.min(H1 - 0.2, y0 + 2.9), sl = Math.atan2(0.5, 1.6) * 180 / Math.PI;
      paint(c, OAK, WOOD); for (const xx of [dx - pw / 2 + 0.1, dx + pw / 2 - 0.1]) PIPE(c, [xx, 0, pz], [xx, py - 0.5, pz], 0.09, 0.08, 6);
      SEG(c, [dx - pw / 2, py - 0.5, pz], [dx + pw / 2, py - 0.5, pz], 0.12, 0.12);
      paint(c, RT(roofT), RC(STONE)); RB(c, dx, py - 0.22, (pz - hd) / 2, pw + 0.4, 0.12, 1.85, 0, -sl, 0); }
    const snow = b === "alpine" ? (p.snow ?? "full") : "none";   // massing.roof's roll: full | ridge | patchy | none sets how far down the slope the sheet reaches
    // critic round 7 + Savi's steer (snow read as hard white tiles, some roofs bare): EVERY alpine roof wears one continuous sheet per slope, deepest at the
    // ridge, thinning toward a ragged lower edge; the roll only moves that edge (full: near the eaves, none: a ridge cap), so slate always shows below it
    if (b === "alpine") SNOWSHEET(c, x0 + 0.1, x1 - 0.1, ez + o, ye, yr, th, { full: 0.05, ridge: 0.35, patchy: 0.2, none: 0.72 }[snow] ?? 0.2, (p.seed ?? 1) + 517, fine ? 2 : mid ? 1 : 0);
    // chimney through the gable end (alpine: a smoke hole stack at the ridge)
    const ch = p.chim ?? 1;
    if (ch && b !== "alpine") { paint(c, S?.chimney ?? FS, S?.chimney ? WHITE : STONE); const cx = ch * (ex + 0.35), cz = d * 0.12; BX(c, cx - 0.5, -0.3, cz - 0.5, cx + 0.5, yr + 0.9, cz + 0.5); BX(c, cx - 0.6, yr + 0.9, cz - 0.6, cx + 0.6, yr + 1.08, cz + 0.6); }
    if (b === "alpine") { const sx = (p.chim ?? 1) * w * 0.22; paint(c, S?.chimney ?? DFS, DST); BX(c, sx - 0.4, yr - 0.5, -0.4, sx + 0.4, yr + 0.9, 0.4); paint(c, SNOW, SNOWC); BX(c, sx - 0.48, yr + 0.9, -0.48, sx + 0.48, yr + 1.02, 0.48);
      if (mid && !shop && (((p.seed ?? 1) >>> 6) % 2 === 0)) { const side = (((p.seed ?? 1) >>> 7) % 2) ? 1 : -1, X0 = side * (hw + 0.1), X1 = side * (hw + 0.95), lz = Math.min(hd * 0.7, 2.6), lh = 1.1 + (((p.seed ?? 1) >>> 8) % 3) * 0.2; // a winter's firewood stacked under the eave on one gable wall
        paint(c, OAK, WOOD); BX(c, Math.min(X0, X1), 0, -lz, Math.max(X0, X1), lh, lz); paint(c, SNOW, SNOWC); BX(c, Math.min(X0, X1) - 0.05, lh, -lz - 0.05, Math.max(X0, X1) + 0.05, lh + 0.1, lz + 0.05); } }
  }
  // coast: nets drying on a pole rack beside the right gable, never pinned flat on the wall (Nov 4 critic: a flat net panel on a wall read as chain-link fencing)
  if (b === "coast" && fine && !open) NETRACK(c, hw + 1.1, 0, -Math.min(hd * 0.75, 2.6), Math.min(hd * 0.75, 2.6), p.seed ?? 1);
  // inn: a hanging sign on a bracket by the door
  if (inn && mid) { const sx = dx + dw / 2 + 0.9, sy = y0 + 3.0; paint(c, IR, IRONC); SEG(c, [sx, sy, -hd], [sx, sy, -hd - 1.1], 0.06, 0.06); SEG(c, [sx, sy - 0.6, -hd], [sx, sy, -hd - 0.7], 0.05, 0.05);
    ROPE(c, [sx, sy, -hd - 0.3], [sx, sy - 0.35, -hd - 0.3], 0, 0.015, 1); ROPE(c, [sx, sy, -hd - 1.0], [sx, sy - 0.35, -hd - 1.0], 0, 0.015, 1);
    paint(c, OAK, "oklch(0.9 0.04 50)"); BX(c, sx - 0.04, sy - 1.1, -hd - 1.1, sx + 0.04, sy - 0.35, -hd - 0.2);
    glow(c, "oklch(0.75 0.13 80)", [1.6, 1.0, 0.25]); BX(c, sx - 0.06, sy - 0.85, -hd - 0.8, sx + 0.06, sy - 0.6, -hd - 0.5); c.emissive(null); }
}
// a store's room: plank floor, a counter across it with the keeper's side behind, shelves of the trade's goods on the back wall,
// one piece of the trade by the side wall, a lamp over the counter. The keeper stands at shopLayout(g).kz (local), facing the door (-z).
const WARES = { general: ["oklch(0.62 0.07 70)", "oklch(0.55 0.1 40)", "oklch(0.7 0.05 95)"], apothecary: ["oklch(0.55 0.12 150)", "oklch(0.5 0.13 25)", "oklch(0.6 0.1 280)"],
  smith: ["oklch(0.6 0.01 250)", "oklch(0.45 0.01 250)", "oklch(0.55 0.06 60)"], armorer: ["oklch(0.62 0.015 240)", "oklch(0.45 0.06 50)", "oklch(0.5 0.01 240)"],
  pawnshop: ["oklch(0.72 0.12 85)", "oklch(0.5 0.1 20)", "oklch(0.55 0.08 250)"], fletcher: ["oklch(0.6 0.08 65)", "oklch(0.85 0.02 90)", "oklch(0.5 0.12 30)"],
  bookseller: ["oklch(0.42 0.1 25)", "oklch(0.4 0.08 150)", "oklch(0.42 0.09 260)"], "mage-supply": ["oklch(0.6 0.16 290)", "oklch(0.65 0.12 220)", "oklch(0.7 0.14 330)"] };
function shopRoom(c, g, fine) {
  const { hw, hd, t, y0, H1, w, shop } = g, L = shopLayout(g), ceil = Math.min(H1, y0 + 3.3), cols = WARES[shop] ?? WARES.general;
  paint(c, OAK, WOOD); BX(c, -hw + t, y0 - 0.02, -hd + t, hw - t, y0 + 0.02, hd - t);
  BX(c, -hw + t, ceil - 0.1, -hd + t, hw - t, ceil + 0.15, hd - t);
  for (let i = 1; i < Math.round(w / 2.2); i++) BX(c, -hw + w * i / Math.round(w / 2.2) - 0.12, ceil - 0.38, -hd + t, -hw + w * i / Math.round(w / 2.2) + 0.12, ceil - 0.1, hd - t);
  // the counter: plank front, a worn darker top
  BX(c, L.cx0, y0, L.cz - 0.25, L.cx1, y0 + 0.95, L.cz + 0.25); paint(c, OAK, "oklch(0.72 0.04 55)"); BX(c, L.cx0 - 0.05, y0 + 0.95, L.cz - 0.32, L.cx1 + 0.05, y0 + 1.05, L.cz + 0.32);
  // back shelves, three boards of goods
  paint(c, OAK, WOOD); const sz0 = hd - t - 0.45, sz1 = hd - t; BX(c, -hw + t + 0.1, y0, sz0, -hw + t + 0.2, y0 + 2.4, sz1); BX(c, hw - t - 0.2, y0, sz0, hw - t - 0.1, y0 + 2.4, sz1);
  const n = fine ? Math.floor((w - 2 * t - 0.6) / 0.32) : 0;
  for (let k = 0; k < 3; k++) { const sy = y0 + 0.55 + k * 0.7; paint(c, OAK, WOOD); BX(c, -hw + t + 0.1, sy - 0.04, sz0, hw - t - 0.1, sy, sz1);
    for (let i = 0; i < n; i++) { const x = -hw + t + 0.45 + i * 0.32, h0 = 0.18 + ((i * 7 + k * 3) % 5) * 0.05; c.albedo(null); c.color(cols[(i + k) % 3]);
      if (shop === "bookseller") BX(c, x - 0.07, sy, sz0 + 0.05, x + 0.07, sy + h0 + 0.1, sz1 - 0.05);
      else if (shop === "apothecary" || shop === "mage-supply") CY(c, x, sy, (sz0 + sz1) / 2, 0.08, h0, 8);
      else BX(c, x - 0.12, sy, sz0 + 0.08, x + 0.12, sy + h0, sz1 - 0.08); } }
  if (shop === "mage-supply" && fine) { glow(c, "oklch(0.75 0.15 290)", [1.2, 0.8, 2.4]); for (const x of [-0.6, 0.6]) CY(c, x, y0 + 1.05, L.cz, 0.11, 0.22, 10); c.emissive(null); }
  // the trade by the side wall (customer side, left of the door)
  const fx = -hw + t + 0.7, fz = -hd + t + 0.9;
  if (shop === "smith" || shop === "armorer") { paint(c, IR, IRONC); BX(c, fx - 0.2, y0, fz - 0.15, fx + 0.2, y0 + 0.55, fz + 0.15); BX(c, fx - 0.4, y0 + 0.55, fz - 0.18, fx + 0.35, y0 + 0.78, fz + 0.18); }
  else if (shop === "general" || shop === "pawnshop") { if (fine) { BARREL(c, fx, y0, fz, 0.32, 0.85, 2); BARREL(c, fx, y0, fz + 0.8, 0.32, 0.85, 2); } }
  else if (shop === "fletcher") { paint(c, OAK, WOOD); BX(c, fx - 0.3, y0, fz - 0.2, fx + 0.3, y0 + 1.4, fz - 0.12); for (let i = 0; i < 4; i++) SEG(c, [fx - 0.22 + i * 0.15, y0 + 0.1, fz - 0.05], [fx - 0.22 + i * 0.15, y0 + 1.5, fz - 0.05], 0.025, 0.025); }
  else { paint(c, OAK, WOOD); BX(c, fx - 0.35, y0, fz - 0.35, fx + 0.35, y0 + 0.75, fz + 0.35); }
  // the lamp over the counter
  paint(c, IR, IRONC); SEG(c, [0, ceil - 0.1, L.cz], [0, ceil - 0.7, L.cz], 0.02, 0.02); glow(c, "oklch(0.8 0.12 75)", [2.4, 1.6, 0.6]); BX(c, -0.1, ceil - 0.95, L.cz - 0.1, 0.1, ceil - 0.7, L.cz + 0.1); c.emissive(null);
}
function houseCol(c, p) { p = massing(stableize(p));
  if (p.yard) propsCol(c, { items: p.yard });
  const g = dims(p), { b, hw, hd, t, y0, H1, H, J, two, inn, shop, open, stilts, dw, dh, dx, ez } = g, box = CB();
  if (open) { box(-hw, -0.5, -hd, hw, y0, hd); box(dx - dw / 2 - 0.3, -0.3, -hd - 0.75, dx + dw / 2 + 0.3, y0 / 2, -hd);
    const door = { x: dx, w: dw, h: dh }; box(-hw, y0, -hd, door.x - door.w / 2, H, -hd + t); box(door.x + door.w / 2, y0, -hd, hw, H, -hd + t); box(door.x - door.w / 2, y0 + dh, -hd, door.x + door.w / 2, H, -hd + t);
    box(-hw, y0, hd - t, hw, H, hd); box(-hw, y0, -hd, -hw + t, H, hd); box(hw - t, y0, -hd, hw, H, hd);
    if (inn) { box(-hw + t + 0.45, y0, -hd + 2.1, -hw + t + 1.3, y0 + 1.18, hd - 1.5); box(hw * 0.35 - 1, y0, hd - t - 0.8, hw * 0.35 + 1, y0 + 1.6, hd - t); }
    else { const L = shopLayout(g); box(L.cx0, y0, L.cz - 0.3, L.cx1, y0 + 1.05, L.cz + 0.3); box(-hw + t, y0, hd - t - 0.45, hw - t, y0 + 2.4, hd - t); }
    box(-hw, Math.min(H1, y0 + 3.3) - 0.1, -hd, hw, H, hd);
  } else if (stilts) { box(-hw - 0.3, y0 - 0.18, -hd - 1.7, hw + 0.3, y0, hd + 0.3); box(-hw, y0, -hd, hw, H, hd); const n = Math.ceil(y0 / 0.2);
    for (let i = 0; i < n; i++) box(dx - 0.65, -0.3, -hd - 1.7 - (i + 1) * 0.3, dx + 0.65, y0 - (i + 1) * 0.2, -hd - 1.7 - i * 0.3);
  } else { box(-hw - 0.1, -0.5, -hd - 0.1, hw + 0.1, two ? H1 : H, hd + 0.1); if (two) box(-hw - J, H1, -hd - J, hw + J, H, hd + J); }
  if (b !== "desert") box(-hw - J, H, -ez * 0.55, hw + J, g.ridge - 0.3, ez * 0.55); else box(-hw, H, -hd, hw, H + 0.85, hd);
  return box.list;
}

// ---------- square: paving, street, well, stalls ----------
const sqPave = (b) => b === "desert" ? [SFLAG, STONE] : [FLAG, STONE];
function square(c, p, D) {
  const b = p.b ?? "forest", r = p.r ?? 10, sl = p.sl ?? 30, sw = p.sw ?? 2.6, R = rng(p.seed ?? 3), fine = D <= 2, mid = D <= 3;
  const [pt, pc] = sqPave(b); paint(c, pt, pc); const n = D <= 3 ? 28 : 12;
  for (let i = 0; i < n; i++) { const a0 = i / n * Math.PI * 2, a1 = (i + 1) / n * Math.PI * 2;
    c.tri(0, 0.07, 0, Math.cos(a1) * r, 0.07, Math.sin(a1) * r, Math.cos(a0) * r, 0.07, Math.sin(a0) * r);
    c.quad(Math.cos(a0) * r, 0.07, Math.sin(a0) * r, Math.cos(a1) * r, 0.07, Math.sin(a1) * r, Math.cos(a1) * r, -0.4, Math.sin(a1) * r, Math.cos(a0) * r, -0.4, Math.sin(a0) * r); }
  BX(c, r * 0.8, -0.4, -sw, sl, 0.06, sw);
  if (mid) { paint(c, b === "alpine" ? DFS : b === "desert" ? SAND : FS, STONE); BX(c, r * 0.95, -0.3, -sw - 0.3, sl, 0.14, -sw); BX(c, r * 0.95, -0.3, sw, sl, 0.14, sw + 0.3);
    for (let i = 0; i < n; i++) { const a0 = i / n * Math.PI * 2, a1 = (i + 1) / n * Math.PI * 2, am = (a0 + a1) / 2; if (Math.abs(Math.sin(am) * r) < sw + 0.3 && Math.cos(am) > 0) continue;
      RB(c, Math.cos(am) * (r + 0.15), -0.1, Math.sin(am) * (r + 0.15), 2 * Math.PI * r / n + 0.05, 0.4, 0.3, -am * 180 / Math.PI + 90); } }
  // critic Nov 4 r9 (Hollowmere/Brinewall): a big square read as one flat disc of one paving. A ring of darker worn setts round the well,
  // and trodden mud where feet go (the street mouth, before each stall), each patch a ragged seeded blob, all a hair above the flags
  if (b !== "alpine") { const CB = FLAG, GV = DFS, m = 24;  // r9 re-look: the terrain albedos drew near-black on objects; the kit's own flag and fieldstone, tinted
    paint(c, b === "desert" ? SFLAG : CB, b === "desert" ? "oklch(0.86 0.05 70)" : "oklch(0.8 0.035 65)"); const r0 = 1.9, r1 = Math.min(4.4, r * 0.4);
    for (let i = 0; i < m; i++) { const a0 = i / m * Math.PI * 2, a1 = (i + 1) / m * Math.PI * 2;
      c.quad(Math.cos(a0) * r1, 0.078, Math.sin(a0) * r1, Math.cos(a1) * r1, 0.078, Math.sin(a1) * r1, Math.cos(a1) * r0, 0.078, Math.sin(a1) * r0, Math.cos(a0) * r0, 0.078, Math.sin(a0) * r0); }
    const blob = (x, z, rad, k) => { const Rb = rng((p.seed ?? 3) * 31 + k), q = 9, pts = [];
      for (let i = 0; i < q; i++) { const a = i / q * Math.PI * 2, rr = rad * (0.6 + Rb() * 0.55); pts.push([x + Math.cos(a) * rr, z + Math.sin(a) * rr]); }
      for (let i = 0; i < q; i++) { const A = pts[i], B = pts[(i + 1) % q]; c.tri(x, 0.076, z, B[0], 0.076, B[1], A[0], 0.076, A[1]); } };
    /* r9 re-look: trodden fieldstone blobs read as black holes at night; dropped, blob() kept for a lighter material */ }
  // the well
  const stoneT = b === "alpine" ? DFS : b === "desert" ? SAND : FS;
  paint(c, stoneT, STONE); LA(c, 0, 0, 0, [[1.25, 0], [1.25, 0.85], [1.0, 0.85], [1.0, 0.1]], D <= 2 ? 18 : 10, false, "y", false);
  LA(c, 0, 0.85, 0, [[1.32, 0], [1.32, 0.12], [0.95, 0.12], [0.95, 0]], D <= 2 ? 18 : 10, false, "y", false);
  c.albedo(null); c.color("oklch(0.25 0.04 230)"); LA(c, 0, 0.35, 0, [[1.0, 0], [0.001, 0]], 14, false, "y", false);
  if (mid) {
    if (b === "desert") { paint(c, SAND, STONE); for (const s of [-1, 1]) BX(c, s * 1.15 - 0.2, 0.85, -0.2, s * 1.15 + 0.2, 2.6, 0.2); BX(c, -1.45, 2.6, -0.28, 1.45, 2.95, 0.28);
      paint(c, OAK, WOOD); PIPE(c, [-1, 2.3, 0], [1, 2.3, 0], 0.06, 0.06, 6); paint(c, CLAY, WHITE); LA(c, 0.3, 1.2, 0, [[0.001, 0], [0.18, 0.1], [0.2, 0.3], [0.12, 0.42]], 8, true);
    } else { paint(c, OAK, WOOD); for (const s of [-1, 1]) SEG(c, [s * 1.1, 0.85, 0], [s * 1.1, 2.8, 0], 0.18, 0.18);
      PIPE(c, [-1.2, 2.0, 0], [1.2, 2.0, 0], 0.1, 0.1, 8); SEG(c, [1.2, 2.0, 0], [1.4, 2.0, 0], 0.05, 0.05); SEG(c, [1.4, 2.0, 0], [1.4, 1.7, 0], 0.05, 0.05);
      paint(c, b === "alpine" ? TURF : b === "coast" ? TAR : SL, STONE); ROOF(c, -1.5, 1.5, -1.2, 1.2, 2.55, 3.35, 0.12);
      if (b === "alpine") { paint(c, SNOW, SNOWC); ROOF(c, -1.4, 1.4, -1.05, 1.05, 2.72, 3.47, 0.08); }
      if (fine) { paint(c, OAK, WOOD); LA(c, 0.2, 1.1, 0, [[0.14, 0], [0.18, 0.3]], 8, true); paint(c, IR, IRONC); ROPE(c, [0.2, 1.4, 0], [0.2, 2.0, 0], 0, 0.015, 1); } }
  }
  // market stalls round the square, clear of the street
  const ns = nStalls(p);
  for (let i = 0; i < ns; i++) { const a = Math.PI * 0.35 + (i + 0.5) / ns * Math.PI * 1.3 + (R() - 0.5) * 0.2, rr = r * 0.66, sx = Math.cos(a) * rr, sz = Math.sin(a) * rr, yaw = -a * 180 / Math.PI - 90;
    if (stallBlocked(p, a)) continue; stall(c, sx, sz, yaw, b, i, D, R); }
  if (mid) for (const it of squareDress(p)) prop(c, it, b, D);
}
// the square's furniture (critic Nov 4: a well and three stalls on 40 m read empty): benches round the well, a trough, a notice board,
// lamps either side of the street mouth, goods between stalls. dress: false opts a square out; all seeded, clear of the street (+x) and the gap
function squareDress(p) { if (p.dress === false) return []; const r = p.r ?? 10, sw = p.sw ?? 2.6, ns = nStalls(p), R = rng((p.seed ?? 3) + 101), out = [], deg = (a) => -a * 180 / Math.PI;
  for (const a of [Math.PI * 0.5, Math.PI, Math.PI * 1.5]) out.push(["bench", Math.cos(a) * 2.9, Math.sin(a) * 2.9, deg(a) + 90]);
  const ta = Math.PI * 0.25 + (R() - 0.5) * 0.3; out.push(["trough", Math.cos(ta) * 3.4, Math.sin(ta) * 3.4, deg(ta) + 90]);
  for (const sd of [-1, 1]) out.push(["lamp", r * 0.9, sd * (sw + 0.9), sd > 0 ? 90 : -90]);
  const ba = -Math.PI * 0.22; if (!stallBlocked(p, ba)) out.push(["board", Math.cos(ba) * r * 0.82, Math.sin(ba) * r * 0.82, deg(ba) - 90]);
  for (let i = 0; i <= ns; i++) { const a = Math.PI * 0.35 + i / ns * Math.PI * 1.3, rr = r * 0.86; if (stallBlocked(p, a)) continue;
    const x = Math.cos(a) * rr, z = Math.sin(a) * rr, k = R(); if (Math.abs(z) < sw + 1.5 && x > 0) continue;
    if (k < 0.35) { out.push(["barrel", x, z]); out.push(["barrel", x + 0.75, z + 0.2]); } else if (k < 0.65) out.push(["sack", x, z, deg(a), 1]); else out.push(["crate", x, z, R() * 40, 1]); }
  return out; }
// gap: a heading in degrees (0 = +x, 90 = +z) kept clear of stalls, the side a main hall's door faces the square from
// critic Nov 4 r9 (Brinewall): four stalls on an 18 m square read as an empty plaza. A square holds a stall per ~3 m of radius, never fewer than authored
function nStalls(p) { return Math.max(p.stalls ?? 3, Math.round((p.r ?? 10) / 3)); }
function stallBlocked(p, a) { if (p.gap == null) return false; const d = Math.abs(((a * 180 / Math.PI - p.gap) % 360 + 540) % 360 - 180); return d < 45; }
function rot(cx, cz, yaw, x, z) { const Y = yaw * Math.PI / 180; return [cx + x * Math.cos(Y) + z * Math.sin(Y), cz - x * Math.sin(Y) + z * Math.cos(Y)]; }
function stall(c, cx, cz, yaw, b, i, D, R) {
  const P = (x, y, z) => { const [a, bb] = rot(cx, cz, yaw, x, z); return [a, y, bb]; }, mid = true;  // r9: a whole square is one object, so it sits at a coarse level from 20 m; goods are a few boxes, always drawn
  // critic Nov 4 r9: coast driftwood read bleached pink at night; stalls are oak everywhere but the desert
  const CW = b === "coast" ? DRW : OAK, CT = b === "coast" ? "oklch(0.6 0.045 60)" : WOOD;  // r9: coast oak read as black cubes at night, raw driftwood as pink: driftwood in a warm grey-brown
  paint(c, CW, CT);
  for (const [x, z, h] of [[-1.2, -0.8, 2.3], [1.2, -0.8, 2.3], [-1.2, 0.8, 2.6], [1.2, 0.8, 2.6]]) PIPE(c, P(x, 0, z), P(x, h, z), 0.06, 0.05, 6);
  // critic Nov 4 (Qasreth square): dark-oak counters under awnings read as pitch-black cubes on pale paving; desert counters are lime-plastered, others keep oak
  paint(c, b === "desert" ? PL : CW, b === "desert" ? "oklch(0.92 0.04 80)" : CT); RB(c, ...P(0, 0.85, -0.2), 2.4, 0.08, 1.1, yaw);
  paint(c, b === "desert" ? PL : CW, b === "desert" ? "oklch(0.8 0.07 60)" : CT); RB(c, ...P(0, 0.42, -0.2), 2.3, 0.84, 1.0, yaw);
  paint(c, b === "desert" ? (i % 2 ? RED : OCHRE) : CANVAS, b === "desert" ? WHITE : ["oklch(0.92 0.06 30)", "oklch(0.95 0.05 85)", "oklch(0.9 0.04 150)"][i % 3]);
  RB(c, ...P(0, 2.48, 0), 2.7, 0.04, 2.0, yaw, 8.5, 0);
  if (mid) { const cols = ["oklch(0.6 0.16 40)", "oklch(0.7 0.14 95)", "oklch(0.55 0.13 140)", "oklch(0.5 0.12 20)"];
    // critic Nov 4 Ashford r2: goods were flat untextured boxes. Now a woven tray of produce, a grain sack, a cloth bolt, a hay-bound bundle, all textured
    for (let k = 0; k < 4; k++) { const g = (k + i) % 4, gx = -0.85 + k * 0.56, gy = (R() - 0.5) * 20;
      if (g === 0 || g === 2) { paint(c, HAY, "oklch(0.78 0.06 75)"); RB(c, ...P(gx, 0.93, -0.35), 0.44, 0.1, 0.4, yaw + gy);   // woven tray
        flatc(c, cols[(k + i) % 4]); for (let m = 0; m < 5; m++) { const ox = (m % 3 - 1) * 0.11, oz = (m < 3 ? -0.07 : 0.07); RB(c, ...P(gx + ox, 0.99, -0.35 + oz), 0.1, 0.09, 0.1, yaw + m * 23); } }
      else if (g === 1) { paint(c, CANVAS, "oklch(0.86 0.04 80)"); RB(c, ...P(gx, 0.89, -0.35), 0.34, 0.36, 0.28, yaw + gy, 0, 4); paint(c, HAY, "oklch(0.75 0.08 85)"); RB(c, ...P(gx, 1.08, -0.35), 0.26, 0.05, 0.2, yaw + gy); }   // open grain sack
      else { paint(c, CANVAS, ["oklch(0.55 0.13 25)", "oklch(0.5 0.1 250)", "oklch(0.6 0.12 140)"][i % 3]); RB(c, ...P(gx, 0.98, -0.35), 0.44, 0.13, 0.17, yaw + gy); RB(c, ...P(gx, 0.98, -0.18), 0.44, 0.13, 0.17, yaw + gy); } }   // cloth bolts
    paint(c, OAK, WOOD); RB(c, ...P(1.6, 0.25, 0.3), 0.5, 0.5, 0.5, yaw + 15); RB(c, ...P(1.65, 0.7, 0.3), 0.4, 0.4, 0.4, yaw - 10); }
}
function squareCol(c, p) { const b = p.b ?? "forest", r = p.r ?? 10, ns = nStalls(p), R = rng(p.seed ?? 3);
  CY(c, 0, 0, 0, 1.3, 1.0, 10); if (b !== "desert") { RB(c, 0, 1.8, 0, 2.4, 2, 0.2); }
  for (let i = 0; i < ns; i++) { const a = Math.PI * 0.35 + (i + 0.5) / ns * Math.PI * 1.3 + (R() - 0.5) * 0.2, rr = r * 0.66; if (stallBlocked(p, a)) continue; RB(c, Math.cos(a) * rr, 0.45, Math.sin(a) * rr, 2.4, 0.9, 1.6, -a * 180 / Math.PI - 90); }
  propsCol(c, { items: squareDress(p) }); }

// ---------- wall ring ----------
// gates: degrees round the ring (0 = +x, the legacy single gate); wob: 0..0.25 radial wobble so no wall is a compass circle
function wallR(p) { const R = p.R ?? 45, w = p.wob ?? 0, s = (p.seed ?? 7) * 1.37;
  return (a) => R * (1 + w * (0.5 * Math.sin(3 * a + s) + 0.3 * Math.sin(5 * a + s * 2.1) + 0.2 * Math.sin(2 * a + s * 0.7))); }
function wallSegs(p) { const R = p.R ?? 45, gw = p.gw ?? 5, rf = wallR(p), n = Math.max(16, Math.round(Math.PI * 2 * R / 7)), gap = Math.asin(Math.min(0.9, (gw / 2 + 2.4) / R)), out = [];
  const gates = (p.gates ?? [0]).map((d) => d * Math.PI / 180), w0 = (a) => Math.atan2(Math.sin(a), Math.cos(a));
  const inGap = (a) => gates.some((g) => Math.abs(w0(a - g)) < gap);
  for (let i = 0; i < n; i++) { let a0 = i / n * Math.PI * 2, a1 = (i + 1) / n * Math.PI * 2;
    if (inGap((a0 + a1) / 2)) continue;
    for (const g of gates) { if (Math.abs(w0(a0 - g)) < gap) a0 = g + gap; if (Math.abs(w0(a1 - g)) < gap) a1 = g - gap; }
    out.push([Math.cos(a0) * rf(a0), Math.sin(a0) * rf(a0), Math.cos(a1) * rf(a1), Math.sin(a1) * rf(a1)]); }
  return { R, gw, gap, segs: out, gx: Math.cos(gap) * rf(0) }; }
const PALC = "oklch(0.6 0.035 55)"; // forest palisade tint over driftwood: weathered grey-brown, between black oak and bare drift
function wall(c, p, D) {
  const b = p.b ?? "forest", h = p.h ?? (b === "alpine" ? 4.5 : 5.5), W = wallSegs(p), R = rng(p.seed ?? 7), fine = D <= 2, mid = D <= 3;
  for (const [x0, z0, x1, z1] of W.segs) { const L = Math.hypot(x1 - x0, z1 - z0), yaw = -Math.atan2(z1 - z0, x1 - x0) * 180 / Math.PI, mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
    if (b === "forest" || b === "coast") {
      // critic Nov 4 (Hollowmere/Ashford): oak stakes read as one black slab, by day and night; weathered drift-grey timber keeps their rhythm readable
      // critic r8 Nov 4 (Hollowmere eye): the whole ring takes one lod from the town centre, so a player at the wall saw the far slab + sawtooth, "a flat plank fence".
      // Kit rule: the far ring is still single logs (3-sided, no rails), uneven heights and points, so it reads as stakes from any distance
      if (!mid) { paint(c, DRW, b === "coast" ? DRIFTC : PALC); const k = Math.max(2, Math.round(L / 0.55));
        for (let i = 0; i < k; i++) { const t = (i + 0.5) / k, x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t, hh = h + (R() - 0.5) * 0.7, r = 0.29 + R() * 0.04;
          PIPE(c, [x, -0.5, z], [x, hh, z], r, r * 0.95, 3, false); PIPE(c, [x, hh, z], [x, hh + 0.5 + R() * 0.2, z], r * 0.95, 0.02, 3, false); }
        continue; }
      paint(c, DRW, b === "coast" ? DRIFTC : PALC); const k = Math.max(2, Math.round(L / 0.46));
      for (let i = 0; i < k; i++) { const t = (i + 0.5) / k, x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t, hh = h + (R() - 0.5) * 0.6, r = 0.21 + R() * 0.04;
        PIPE(c, [x, -0.5, z], [x, hh, z], r, r * 0.95, fine ? 7 : 5, false); PIPE(c, [x, hh, z], [x, hh + 0.55, z], r * 0.95, 0.02, fine ? 7 : 5, false); }
      const ix = -mx / W.R * 0.35, iz = -mz / W.R * 0.35; for (const yy of [1.1, h - 1.3]) SEG(c, [x0 + ix, yy, z0 + iz], [x1 + ix, yy, z1 + iz], 0.14, 0.22);
    } else {
      const th = b === "alpine" ? 1.3 : 1.1, tex = b === "alpine" ? DFS : MUD; paint(c, tex, b === "alpine" ? DST : WHITE);
      RB(c, mx, h / 2 - 0.4, mz, L + 0.3, h + 0.8, th, yaw); RB(c, mx, 0.2, mz, L + 0.3, 1.2, th + 0.5, yaw);
      if (mid) { const k = Math.max(2, Math.floor(L / 1.5)); for (let i = 0; i < k; i++) { const t = (i + 0.5) / k; RB(c, x0 + (x1 - x0) * t, h + 0.4, z0 + (z1 - z0) * t, 0.8, 0.8, th, yaw); }
        if (b === "alpine") { paint(c, SNOW, SNOWC); RB(c, mx, h + 0.05, mz, L + 0.3, 0.12, th + 0.1, yaw); } }
    } }
  if (p.towers !== false) gateTowers(c, b, h, W.gx, W.gw / 2 + 2.4, D);
}
// gate towers either side of the gap, a beam over it (gatehouse kind: the same at the origin, the road along +x)
function gateTowers(c, b, h, gx, gz, D) { const th2 = h + 4, fine = D <= 2, mid = D <= 3;
  for (const s of [-1, 1]) { const tz = s * gz;
    if (b === "forest" || b === "coast") { paint(c, FS, STONE); BX(c, gx - 2, -0.5, tz - 2, gx + 2, 1.2, tz + 2); paint(c, b === "coast" ? DRW : OAK, WOOD);
      for (const [px, pz] of [[-1.7, -1.7], [1.7, -1.7], [1.7, 1.7], [-1.7, 1.7]]) BX(c, gx + px - 0.18, 1.2, tz + pz - 0.18, gx + px + 0.18, th2, tz + pz + 0.18);
      paint(c, b === "coast" ? DRIFT : OAK, WOOD); BX(c, gx - 1.9, th2 - 2.6, tz - 1.9, gx + 1.9, th2 - 2.4, tz + 1.9);
      BX(c, gx - 1.9, th2 - 2.4, tz - 1.9, gx + 1.9, th2 - 1.4, tz - 1.75); BX(c, gx - 1.9, th2 - 2.4, tz + 1.75, gx + 1.9, th2 - 1.4, tz + 1.9); BX(c, gx + 1.75, th2 - 2.4, tz - 1.9, gx + 1.9, th2 - 1.4, tz + 1.9); BX(c, gx - 1.9, th2 - 2.4, tz - 1.9, gx - 1.75, th2 - 1.4, tz + 1.9);
      if (mid) for (const yy of [2.4, th2 - 4]) for (const sz of [-1, 1]) SEG(c, [gx - 1.7, yy, tz + sz * 1.75], [gx + 1.7, yy + 1.4, tz + sz * 1.75], 0.14, 0.14);
      paint(c, b === "coast" ? TAR : SL, STONE); const ty = th2, top = th2 + 2.6;
      for (const [a, bb, cc, dd] of [[[-2.3, -2.3], [2.3, -2.3]], [[2.3, -2.3], [2.3, 2.3]], [[2.3, 2.3], [-2.3, 2.3]], [[-2.3, 2.3], [-2.3, -2.3]]].map(([u, v2]) => [u, v2, 0, 0])) {
        c.tri(gx + a[0], ty, tz + a[1], gx, top, tz, gx + bb[0], ty, tz + bb[1]); c.tri(gx + a[0], ty, tz + a[1], gx + bb[0], ty, tz + bb[1], gx, ty, tz); }
    } else if (b === "alpine") { paint(c, DFS, DST); LA(c, gx, -0.5, tz, [[2.6, 0], [2.3, th2 + 0.5]], D <= 2 ? 16 : 10, true);
      if (mid) for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; RB(c, gx + Math.cos(a) * 2.1, th2 + 0.9, tz + Math.sin(a) * 2.1, 0.9, 0.8, 0.5, -a * 180 / Math.PI + 90); }
      paint(c, GREY, STONE); LA(c, gx, th2 + 1.3, tz, [[2.7, 0], [0.05, 3.2]], 12, true); paint(c, SNOW, SNOWC); LA(c, gx, th2 + 2.1, tz, [[2.05, 0], [0.05, 2.45]], 12, true);
    } else { paint(c, MUD, WHITE); HX(c, [[gx - 2.6, -0.5, tz - 2.6], [gx + 2.6, -0.5, tz - 2.6], [gx + 2.6, -0.5, tz + 2.6], [gx - 2.6, -0.5, tz + 2.6], [gx - 2.1, th2, tz - 2.1], [gx + 2.1, th2, tz - 2.1], [gx + 2.1, th2, tz + 2.1], [gx - 2.1, th2, tz + 2.1]]);
      if (mid) { for (let k = 0; k < 3; k++) for (const sd of [[-1, 0], [1, 0], [0, -1], [0, 1]]) { const off = -1.4 + k * 1.4; RB(c, gx + (sd[0] ? sd[0] * 1.85 : off), th2 + 0.4, tz + (sd[1] ? sd[1] * 1.85 : off), 0.7, 0.8, 0.7); }
        paint(c, OAK, WOOD); for (let k = 0; k < 4; k++) PIPE(c, [gx - 2.6, th2 - 0.4, tz - 1.5 + k], [gx - 1.9, th2 - 0.4, tz - 1.5 + k], 0.09, 0.09, 6); } } }
  // the gateway lintel, a walkable bridge between the towers
  paint(c, b === "alpine" ? DFS : b === "desert" ? MUD : OAK, b === "alpine" ? DST : WOOD); BX(c, gx - 1.4, h + 1.2, -gz + 1.6, gx + 1.4, h + 2.2, gz - 1.6);
  if (b === "forest" || b === "coast") { BX(c, gx - 1.4, h + 2.2, -gz + 1.6, gx - 1.25, h + 3.1, gz - 1.6); BX(c, gx + 1.25, h + 2.2, -gz + 1.6, gx + 1.4, h + 3.1, gz - 1.6); }
}
function wallCol(c, p) { const b = p.b ?? "forest", h = p.h ?? (b === "alpine" ? 4.5 : 5.5), W = wallSegs(p);
  for (const [x0, z0, x1, z1] of W.segs) RB(c, (x0 + x1) / 2, h / 2, (z0 + z1) / 2, Math.hypot(x1 - x0, z1 - z0) + 0.3, h + 1.2, 1.1, -Math.atan2(z1 - z0, x1 - x0) * 180 / Math.PI);
  if (p.towers === false) return; const gz = W.gw / 2 + 2.4; for (const s of [-1, 1]) RB(c, W.gx, (h + 4) / 2, s * gz, 4.6, h + 4.5, 4.6); }
function gatehouseCol(c, p) { const b = p.b ?? "forest", h = p.h ?? (b === "alpine" ? 4.5 : 5.5), gz = (p.gw ?? 5.5) / 2 + 2.4; for (const s of [-1, 1]) RB(c, 0, (h + 4) / 2, s * gz, 4.6, h + 4.5, 4.6); }

// ---------- props ----------
function prop(c, it, b, D) {
  const [ty, x, z, yaw = 0, s = 1] = it, P = (lx, y, lz) => { const [a, bb] = rot(x, z, yaw, lx, lz); return [a, y, bb]; }, fine = D <= 2, mid = D <= 3;
  if (ty === "barrel") BARREL(c, x, 0, z, 0.34, 0.92, D);
  else if (ty === "pot") { paint(c, CLAY, WHITE); LA(c, x, 0, z, [[0.12, 0], [0.32, 0.25], [0.34, 0.45], [0.22, 0.75], [0.16, 0.8], [0.2, 0.9]], fine ? 12 : 8, true); }
  else if (ty === "crate") { paint(c, OAK, WOOD); RB(c, x, 0.36 * s, z, 0.72 * s, 0.72 * s, 0.72 * s, yaw); if (mid) { paint(c, OAK, "oklch(0.8 0.03 60)"); RB(c, ...P(0, 0.36 * s, 0), 0.76 * s, 0.1, 0.76 * s, yaw); RB(c, ...P(0, 0.36 * s, 0), 0.1, 0.76 * s, 0.76 * s, yaw); } }
  /* critic Nov 4 (Ashford r4): hay read as two yellow cubes. Kit rule: hay = real straw bales (1.0 x 0.45 x 0.5) in a stack, weathered straw tint, two dark twine bands each, a skew per bale; s>1 is a taller stack */
  else if (ty === "hay") { const bales = s > 1 ? [[-0.53, 0, 0, 3], [0.53, 0, 0, -2], [0, 0.46, 0, 7], [-0.53, 0, 0.55, -4], [0.53, 0, 0.55, 2], [0.1, 0.46, 0.55, -6]] : [[-0.53, 0, 0, 3], [0.53, 0, 0, -2], [0.05, 0.46, 0, 8]];
    for (const [bx, by, bz, sk] of bales) { paint(c, HAY, "oklch(0.74 0.06 82)"); RB(c, ...P(bx, by + 0.23, bz), 1.0, 0.45, 0.5, yaw + sk);
      if (mid) { c.albedo(null); c.color("oklch(0.32 0.03 60)"); for (const tx of [-0.25, 0.25]) RB(c, ...P(bx + tx, by + 0.23, bz), 0.04, 0.47, 0.52, yaw + sk);
        /* critic Nov 4 r5: bales read as cardboard. loose straw: thin stalks fanning out of each bale's ends and top, so the edge is ragged, not a clean box */
        const ya = (yaw + sk) * Math.PI / 180, ca = Math.cos(ya), sa = Math.sin(ya);
        for (let k = 0; k < 9; k++) { const h = Math.sin(k * 12.9898 + bx * 78.2 + bz * 3.1) * 43758.5, f = h - Math.floor(h), side = k % 3 === 2 ? 0 : (k % 2 ? 1 : -1);
          const lx = side ? side * 0.5 : (f - 0.5) * 0.9, ly = side ? 0.08 + f * 0.32 : 0.45, lz = (((f * 7) % 1) - 0.5) * 0.4;
          const ox = side ? side * (0.12 + f * 0.1) : (f - 0.5) * 0.15, oy = side ? (f - 0.4) * 0.1 : 0.1 + f * 0.08, oz = (f - 0.5) * 0.12;
          const W = (x, y, z) => P(bx + x * ca + z * sa, by + y, bz - x * sa + z * ca); const A = W(lx, ly, lz - 0.012), B = W(lx, ly, lz + 0.012), T = W(lx + ox, ly + oy, lz + oz);
          c.color(f < 0.5 ? "oklch(0.78 0.08 85)" : "oklch(0.64 0.06 75)"); c.tri(...A, ...B, ...T); c.tri(...B, ...A, ...T); } } } }
  else if (ty === "trough") { paint(c, OAK, WOOD); RB(c, ...P(0, 0.3, -0.33), 2, 0.6, 0.1, yaw); RB(c, ...P(0, 0.3, 0.33), 2, 0.6, 0.1, yaw); RB(c, ...P(-0.95, 0.3, 0), 0.1, 0.6, 0.6, yaw); RB(c, ...P(0.95, 0.3, 0), 0.1, 0.6, 0.6, yaw); RB(c, ...P(0, 0.08, 0), 2, 0.12, 0.66, yaw);
    c.albedo(null); c.color("oklch(0.3 0.04 220)"); RB(c, ...P(0, 0.45, 0), 1.8, 0.02, 0.56, yaw); }
  else if (ty === "bench") { paint(c, OAK, WOOD); RB(c, ...P(0, 0.45, 0), 1.8, 0.08, 0.4, yaw); for (const sx of [-0.75, 0.75]) RB(c, ...P(sx, 0.22, 0), 0.1, 0.45, 0.36, yaw); }
  else if (ty === "wood") { paint(c, OAK, "oklch(0.92 0.04 70)"); for (let r = 0; r < 4; r++) for (let k = 0; k < 6 - r; k++) { const a = P(-0.9, 0.14 + r * 0.24, -0.6 + (k + r * 0.5) * 0.25), bb = P(0.9, 0.14 + r * 0.24, -0.6 + (k + r * 0.5) * 0.25); PIPE(c, a, bb, 0.12, 0.12, fine ? 7 : 5); } }
  else if (ty === "fence") { const L = s, n = Math.max(1, Math.round(L / 1.8)); paint(c, b === "coast" ? DRW : OAK, WOOD);
    for (let i = 0; i <= n; i++) RB(c, ...P(-L / 2 + L * i / n, 0.55, 0), 0.13, 1.3, 0.13, yaw + (i % 3 - 1) * 2);
    for (const yy of [0.45, 0.95]) RB(c, ...P(0, yy, 0.08), L, 0.09, 0.05, yaw); }
  else if (ty === "lamp") { paint(c, b === "desert" ? SAND : FS, STONE); RB(c, x, 0.2, z, 0.55, 0.4, 0.55, yaw); paint(c, OAK, WOOD); PIPE(c, [x, 0.4, z], [x, 3.4, z], 0.09, 0.07, 7);
    SEG(c, P(0, 3.2, 0), P(0.75, 3.2, 0), 0.08, 0.08); SEG(c, P(0, 2.75, 0), P(0.45, 3.2, 0), 0.05, 0.05);
    paint(c, IR, IRONC); ROPE(c, P(0.7, 3.2, 0), P(0.7, 2.95, 0), 0, 0.015, 1); RB(c, ...P(0.7, 2.93, 0), 0.32, 0.05, 0.32, yaw); RB(c, ...P(0.7, 2.55, 0), 0.28, 0.05, 0.28, yaw);
    for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) RB(c, ...P(0.7 + sx * 0.13, 2.74, sz * 0.13), 0.035, 0.38, 0.035, yaw);
    glow(c, "oklch(0.85 0.12 80)", [5, 2.6, 0.7]); RB(c, ...P(0.7, 2.74, 0), 0.2, 0.32, 0.2, yaw); c.emissive(null); }
  else if (ty === "bed") { const w = 1.1 * s, L = 2.4 * s; paint(c, OAK, WOOD); for (const sz of [-w / 2, w / 2]) RB(c, ...P(0, 0.12, sz), L, 0.24, 0.08, yaw); for (const sx of [-L / 2, L / 2]) RB(c, ...P(sx, 0.12, 0), 0.08, 0.24, w, yaw);
    c.albedo(null); c.color("oklch(0.32 0.05 50)"); RB(c, ...P(0, 0.14, 0), L - 0.1, 0.2, w - 0.1, yaw);
    if (mid) { const R = rng(Math.round(x * 31 + z * 17) || 5), cols = ["oklch(0.55 0.14 135)", "oklch(0.62 0.16 140)", "oklch(0.7 0.17 85)", "oklch(0.6 0.19 25)", "oklch(0.65 0.15 330)"];
      for (let k = 0; k < Math.round(7 * s); k++) { const ux = -L / 2 + 0.3 + (L - 0.6) * (k + 0.5) / Math.round(7 * s), uz = (R() - 0.5) * (w - 0.4); c.color(cols[k % 2 ? 0 : 1]); RB(c, ...P(ux, 0.36, uz), 0.26, 0.3, 0.26, yaw + k * 23);
        if (R() < 0.6) { c.color(cols[2 + Math.floor(R() * 3)]); RB(c, ...P(ux, 0.55, uz), 0.13, 0.1, 0.13, yaw + k * 40); } } } }
  else if (ty === "line") { const L = 3.2 * s; paint(c, OAK, WOOD); for (const sx of [-L / 2, L / 2]) RB(c, ...P(sx, 1.05, 0), 0.1, 2.1, 0.1, yaw); ROPE(c, P(-L / 2, 1.95, 0), P(L / 2, 1.95, 0), 0.12, 0.012, 8);
    if (mid) { const R = rng(Math.round(x * 13 + z * 7) || 3), cols = ["oklch(0.92 0.02 90)", "oklch(0.55 0.12 30)", "oklch(0.5 0.08 240)", "oklch(0.75 0.1 85)", "oklch(0.88 0.03 60)"];
      for (let k = 0; k < 4; k++) { const ux = -L / 2 + 0.45 + k * (L - 0.9) / 3, wd = 0.45 + R() * 0.35, hh = 0.5 + R() * 0.45; c.albedo(CANVAS); c.color(cols[Math.floor(R() * cols.length)]); RB(c, ...P(ux, 1.88 - hh / 2, 0), wd, hh, 0.02, yaw, 0, (R() - 0.5) * 6); } } }
  else if (ty === "board") { paint(c, OAK, WOOD); for (const sx of [-0.85, 0.85]) RB(c, ...P(sx, 1.1, 0), 0.14, 2.2, 0.14, yaw); RB(c, ...P(0, 1.55, 0), 1.9, 1.1, 0.08, yaw); RB(c, ...P(0, 2.2, -0.12), 2.2, 0.08, 0.5, yaw, 18);
    if (mid) { const R = rng(Math.round(x * 7 + z * 5) || 9); c.albedo(null); for (let k = 0; k < 6; k++) { c.color(k % 3 ? "oklch(0.9 0.03 85)" : "oklch(0.82 0.05 75)"); RB(c, ...P(-0.6 + (k % 3) * 0.6 + (R() - 0.5) * 0.15, 1.3 + Math.floor(k / 3) * 0.5, -0.05), 0.42, 0.36 + R() * 0.12, 0.01, yaw, 0, (R() - 0.5) * 10); } } }
  else if (ty === "sack") { paint(c, CANVAS, "oklch(0.78 0.05 75)"); for (let k = 0; k < Math.max(1, Math.round(s * 3)); k++) { const [a, , bb] = P((k % 2) * 0.55 - 0.25, 0, Math.floor(k / 2) * 0.5); LA(c, a, 0, bb, [[0.05, 0], [0.26, 0.08], [0.3, 0.3], [0.24, 0.55], [0.08, 0.66], [0.04, 0.72]], mid ? 8 : 5, true); } }
  else if (ty === "rack") { paint(c, DRW, DRIFTC); for (const sx of [-1.4, 1.4]) { SEG(c, P(sx, 0, -0.6), P(sx, 2, 0), 0.09, 0.09); SEG(c, P(sx, 0, 0.6), P(sx, 2, 0), 0.09, 0.09); } SEG(c, P(-1.6, 1.95, 0), P(1.6, 1.95, 0), 0.07, 0.07);
    if (mid) { flatc(c, "oklch(0.62 0.04 80)"); for (let k = 0; k < 9; k++) RB(c, ...P(-1.2 + k * 0.3, 1.6, 0), 0.1, 0.5, 0.04, yaw); } }
  else if (ty === "cart") { const wy = 0.6; paint(c, OAK, WOOD); RB(c, ...P(0, 0.95, 0), 1.4, 0.1, 2.4, yaw); for (const sx of [-0.7, 0.7]) RB(c, ...P(sx, 1.2, 0), 0.07, 0.45, 2.4, yaw); RB(c, ...P(0, 1.2, 1.2), 1.4, 0.45, 0.07, yaw);
    SEG(c, P(-0.5, 0.92, -1.1), P(-0.55, 0.05, -2.9), 0.08, 0.08); SEG(c, P(0.5, 0.92, -1.1), P(0.55, 0.05, -2.9), 0.08, 0.08); PIPE(c, P(-0.85, wy, 0.2), P(0.85, wy, 0.2), 0.05, 0.05, 6);
    if (mid) for (const sx of [-0.82, 0.82]) { const ctr = P(sx, wy, 0.2), Y = yaw * Math.PI / 180;
      paint(c, OAK, WOOD); for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2, dzl = Math.cos(a) * 0.55, dy = Math.sin(a) * 0.55; SEG(c, ctr, [ctr[0] + dzl * Math.sin(Y), ctr[1] + dy, ctr[2] + dzl * Math.cos(Y)], 0.04, 0.04); }
      paint(c, IR, IRONC); const rings = 18; for (let k = 0; k < rings; k++) { const a0 = k / rings * Math.PI * 2, a1 = (k + 1) / rings * Math.PI * 2, f = (a) => [ctr[0] + Math.cos(a) * 0.58 * Math.sin(Y), ctr[1] + Math.sin(a) * 0.58, ctr[2] + Math.cos(a) * 0.58 * Math.cos(Y)]; SEG(c, f(a0), f(a1), 0.08, 0.07); } }
    if (s > 1 && mid) { BARREL(c, ...P(-0.3, 1.0, 0.5), 0.3, 0.8, D); paint(c, HAY, WHITE); RB(c, ...P(0.2, 1.3, -0.4), 1.0, 0.6, 0.9, yaw + 8); } }
}
function props(c, p, D) { const b = p.b ?? "forest"; for (const it of p.items ?? []) prop(c, it, b, D); }
function propsCol(c, p) { for (const [ty, x, z, yaw = 0, s = 1] of p.items ?? []) {
  const box = { barrel: [0.7, 0.92, 0.7], pot: [0.7, 0.9, 0.7], crate: [0.72 * s, 0.72 * s, 0.72 * s], hay: [2.1, 0.92, s > 1 ? 1.05 : 0.5], trough: [2, 0.6, 0.7], bench: [1.8, 0.5, 0.4], wood: [1.8, 1, 1.4], fence: [s, 1.2, 0.15], lamp: [0.3, 3.4, 0.3], bed: [2.4 * s, 0.3, 1.1 * s], board: [1.9, 2.2, 0.2], sack: [1, 0.7, 0.9], rack: [3, 2, 1.2], cart: [1.6, 1.4, 2.6] }[ty];
  if (box) RB(c, x, box[1] / 2, z, box[0], box[1], box[2], yaw); } }

// ---------- waystone: a lichened fieldstone at a town's crossroads, an oak post on it, one finger per next town (p.f: [{ a: bearing deg, world atan2(z, x) }])
function waystone(c, p, D) { paint(c, FS, STONE); RB(c, 0, 0.18, 0, 1.3, 0.36, 1.1, 8); RB(c, 0, 0.9, 0, 0.62, 1.1, 0.5, 14, 2, -3); RB(c, 0.02, 1.55, 0, 0.5, 0.3, 0.42, 20, -2, 2);
  paint(c, OAK, WOOD); BX(c, -0.09, 1.6, -0.09, 0.09, 3.55, 0.09); RB(c, 0, 3.6, 0, 0.26, 0.12, 0.26, 45);
  if (D > 3) return; (p.f ?? []).forEach((f, i) => { const y = 3.25 - i * 0.34, a = f.a * Math.PI / 180, cx = Math.cos(a) * 0.72, cz = Math.sin(a) * 0.72;
    RB(c, cx, y, cz, 1.25, 0.24, 0.05, -f.a); RB(c, Math.cos(a) * 1.36, y, Math.sin(a) * 1.36, 0.17, 0.17, 0.05, -f.a, 0, 45); });
  if (D <= 2) { paint(c, IR, IRONC); RB(c, 0, 3.32, 0, 0.22, 0.05, 0.22); } }

// ---------- signpost ----------
function sign(c, p, D) { paint(c, FS, STONE); RB(c, 0, 0.25, 0, 0.8, 0.5, 0.8); paint(c, OAK, WOOD); BX(c, -0.12, 0.5, -0.12, 0.12, 3.6, 0.12); BX(c, -1.4, 3.3, -0.1, 1.4, 3.48, 0.1);
  SEG(c, [-0.1, 2.6, 0], [-0.9, 3.3, 0], 0.08, 0.08); SEG(c, [0.1, 2.6, 0], [0.9, 3.3, 0], 0.08, 0.08); RB(c, 0, 3.7, 0, 0.3, 0.2, 0.3);
  paint(c, IR, IRONC); for (const sx of [-1.15, 1.15]) ROPE(c, [sx, 3.3, 0], [sx, 3.0, 0], 0, 0.014, 1);
  if (D <= 3) { paint(c, OAK, WOOD); RB(c, 0.95, 1.9, 0, 1.4, 0.32, 0.06, 0, 0, 0); RB(c, 1.78, 1.9, 0, 0.3, 0.22, 0.06, 0, 0, 45); } }


// ---------- deck: boardwalks on piles ----------
function deck(c, p, D) { const R = rng(p.seed ?? 7), pile = p.pile ?? 3;
  for (const [ax, ay, az, bx, by, bz, w = 3] of p.segs ?? []) { const L = Math.hypot(bx - ax, bz - az); if (L < 0.2) continue;
    const yaw = Math.atan2(bx - ax, bz - az) * 180 / Math.PI, tx = (bx - ax) / L, tz = (bz - az) / L, nx = tz, nz = -tx, n = Math.max(1, Math.round(L / 0.55));
    for (let k = 0; k < n; k++) { const t = (k + 0.5) / n, x = ax + (bx - ax) * t, z = az + (bz - az) * t, y = ay + (by - ay) * t;   // a plank across, each its own shade and a little skew
      paint(c, DRW, `oklch(${0.62 + R() * 0.14} 0.03 ${60 + R() * 20})`); RB(c, x, y - 0.05, z, w, 0.1, 0.5, yaw + (R() - 0.5) * 2); }
    const pit = -Math.atan2(by - ay, L) * 180 / Math.PI;   // stringers and rails follow the deck's own rise, never level bars poking out of a humped span
    paint(c, OAK, WOOD);
    for (const sd of [-1, 1]) RB(c, (ax + bx) / 2 + nx * sd * (w / 2 - 0.2), (ay + by) / 2 - 0.2, (az + bz) / 2 + nz * sd * (w / 2 - 0.2), 0.18, 0.2, L, yaw, pit);   // stringers
    if (D <= 3) for (let u = 0; u <= L; u += 2.6) for (const sd of [-1, 1]) { const x = ax + tx * u + nx * sd * (w / 2 - 0.15), z = az + tz * u + nz * sd * (w / 2 - 0.15), y = ay + (by - ay) * (u / L);
      paint(c, TAR, TARC); RB(c, x, y - 0.1 - pile / 2, z, 0.22, pile, 0.22, R() * 40, (R() - 0.5) * 6); }
    // critic r8 (Hollowmere): rails clamp to the deck: inset 0.15 m from each plank end, pitched with the span, held up by posts (ends + every ~2.4 m)
    if (p.rail && D <= 2) { const e0 = Math.min(0.15, L * 0.1), Lr = L - 2 * e0, np = Math.max(1, Math.round(Lr / 2.4)); paint(c, DRW, DRIFTC);
      for (const sd of [-1, 1]) { const ox = nx * sd * (w / 2 - 0.1), oz = nz * sd * (w / 2 - 0.1);
        RB(c, (ax + bx) / 2 + ox, (ay + by) / 2 + 0.85, (az + bz) / 2 + oz, 0.08, 0.08, Lr, yaw, pit);
        for (let k = 0; k <= np; k++) { const u = e0 + Lr * k / np, f = u / L; RB(c, ax + tx * u + ox, ay + (by - ay) * f + 0.4, az + tz * u + oz, 0.1, 0.9, 0.1, yaw); } } } } }
// ---------- retain: terrace walls ----------
// critic round 7: every wall caps at p.capH (1.2 m) over its foot so none stands across a street sightline; gaps come from p.clear (townforms cuts one where a street crosses)
/* critic round 6 (Kaldmoor terraces): dry fieldstone, not sawn ashlar: courses of rough stones of mixed length and height laid without mortar, staggered, each a value of its own,
   the face battered back a little, a course of flat cap slabs on top. Draw only: the terrain step is the body (no collider). LOD: D<=2 stones, 3 long courses, 4+ one face. */
function retain(c, p, D) { const R = rng(p.seed ?? 3), clear = p.clear ?? [], open = (x, z) => clear.some(([cx, cz, r]) => Math.hypot(x - cx, z - cz) < r);
  for (const [ax, az, bx, bz, h0 = 1.2, ay = 0] of p.segs ?? []) { const h = Math.min(h0, p.capH ?? 1.2), L = Math.hypot(bx - ax, bz - az); if (L < 0.5) continue;
    const yaw = Math.atan2(bx - ax, bz - az) * 180 / Math.PI, ux = (bx - ax) / L, uz = (bz - az) / L, H = h + 1, y0 = ay - 1, at = (s) => [ax + ux * s, az + uz * s];
    if (D >= 4) { paint(c, DFS, "oklch(0.8 0.012 80)"); const n = Math.max(1, Math.round(L / 6)); for (let k = 0; k < n; k++) { const [x, z] = at((k + 0.5) * L / n); if (!open(x, z)) RB(c, x, y0 + H / 2, z, 0.8, H, L / n, yaw); } continue; }
    const rows = Math.max(2, Math.round(H / 0.42)), rh = H / rows;
    for (let r = 0; r < rows; r++) { const yc = y0 + (r + 0.5) * rh, bat = (r / rows) * 0.12; let s = r % 2 ? -0.35 * R() : 0;
      while (s < L) { const len = D <= 2 ? 0.45 + R() * 0.75 : 3 + R() * 2, s0 = Math.max(0, s), s1 = Math.min(L, s + len), [x, z] = at((s0 + s1) / 2); s = s1 + (D <= 2 ? 0.03 : 0);
        if (s1 - s0 < 0.15 || open(x, z)) continue;
        paint(c, DFS, `oklch(${0.66 + R() * 0.24} ${0.008 + R() * 0.02} ${60 + R() * 50})`);
        RB(c, x - uz * bat, yc + (R() - 0.5) * rh * 0.12, z + ux * bat, 0.72 + R() * 0.16, rh * (0.82 + R() * 0.16), (s1 - s0) * (D <= 2 ? 0.96 : 1), yaw + (R() - 0.5) * (D <= 2 ? 6 : 1), (R() - 0.5) * (D <= 2 ? 3 : 0), 0); } }
    if (D <= 3) { let s = 0; while (s < L) { const len = D <= 2 ? 0.7 + R() * 0.6 : 4, s1 = Math.min(L, s + len), [x, z] = at((s + s1) / 2); s = s1 + 0.02; if (open(x, z)) continue;   // the cap course: flat slabs a little proud of the face
        paint(c, DFS, `oklch(${0.74 + R() * 0.14} 0.01 80)`); RB(c, x - uz * 0.1, y0 + H + 0.06, z + ux * 0.1, 0.95, 0.14, (s1 - s) * 0.97, yaw + (R() - 0.5) * 4); } } } }

// SNOWSHEET: one continuous snow sheet over each slope of a gable roof (ridge along x at z=0, eaves at z=±run, heights ye..yr, roof slab th).
// Columns across x each end at their own ragged lower edge (uEdge ± two sines and a jitter; u = 0 eave, 1 ridge); depth swells from 0.03 m at that edge
// to 0.2 m at the ridge, both slopes meeting in one rounded crest. q: 0 coarse (4 columns), 1 mid, 2 fine. Geometry only: snow is never in the collider.
function SNOWSHEET(c, x0, x1, run, ye, yr, th, uEdge, seed, q) {
  const R = rng(seed), nx = q === 2 ? 18 : q === 1 ? 9 : 4, nu = q === 2 ? 5 : q === 1 ? 3 : 1, s1 = R() * 6.28, s2 = R() * 6.28, tR = 0.2;
  paint(c, SNOW, SNOWC); if (q) c.smooth();
  for (const side of [-1, 1]) {
    const ue = [], xs = [];
    for (let i = 0; i <= nx; i++) { ue.push(Math.max(0.05, Math.min(0.88, uEdge + 0.03 * Math.sin(i * 0.7 + s1 + side) + 0.02 * Math.sin(i * 0.31 + s2 * side) + (R() - 0.5) * (q ? 0.03 : 0)  /* critic r8 Nov 4: 0.18-amplitude lobes read as jagged white stickers from above; snow settles in an even blanket */)));
      xs.push(x0 + (x1 - x0) * i / nx + (i === 0 ? R() * 0.25 : i === nx ? -R() * 0.25 : 0)); }
    const V = (i, j) => { const u = ue[i] + (1 - ue[i]) * j / nu, k = j / nu, tk = 0.03 + (tR - 0.03) * Math.pow(k, 0.6);
      return [xs[i], ye + (yr - ye) * u + th - 0.01 + tk, side * run * (1 - u)]; };
    for (let i = 0; i < nx; i++) for (let j = 0; j < nu; j++) { const A = V(i, j), B = V(i + 1, j), C = V(i + 1, j + 1), D = V(i, j + 1);
      c.tri(...A, ...B, ...C); c.tri(...A, ...C, ...D); }
    for (let i = 0; i < nx; i++) { const A = V(i, 0), B = V(i + 1, 0); c.tri(A[0], A[1] - 0.04, A[2], B[0], B[1] - 0.04, B[2], ...B); c.tri(A[0], A[1] - 0.04, A[2], ...B, ...A); }   // the thin lip at the edge
  }
  if (q) { RB(c, (x0 + x1) / 2, yr + th + 0.17, 0, x1 - x0 - 0.3, 0.1, 0.5); c.flat(); }   // the crest: snow over the ridge cap, the two sheets meet in one line
}
export function geometry(c) { const p = c.params, D = c.lod, k = p.kind;
  if (k === "house") house(c, p, D); else if (k === "square") square(c, p, D); else if (k === "wall") wall(c, p, D); else if (k === "gatehouse") gateTowers(c, p.b ?? "forest", p.h ?? ((p.b ?? "forest") === "alpine" ? 4.5 : 5.5), 0, (p.gw ?? 5.5) / 2 + 2.4, D); else if (k === "props") props(c, p, D); else if (k === "sign") sign(c, p, D); else if (k === "waystone") waystone(c, p, D); else if (k === "deck") deck(c, p, D); else if (k === "retain") retain(c, p, D); }
export function collider(c) { const p = c.params, k = p.kind;
  if (k === "house") return houseCol(c, p); if (k === "square") return squareCol(c, p); if (k === "wall") return wallCol(c, p); if (k === "gatehouse") return gatehouseCol(c, p); if (k === "props") return propsCol(c, p);
  if (k === "sign") return [{ kind: "box", width: 0.8, height: 3.6, depth: 0.8, center: [0, 1.8, 0] }];
  if (k === "waystone") return [{ kind: "box", width: 1.2, height: 1.6, depth: 1.0, center: [0, 0.8, 0] }, { kind: "box", width: 0.2, height: 2.0, depth: 0.2, center: [0, 2.6, 0] }];
  if (k === "deck") { for (const [ax, ay, az, bx, by, bz, w = 3] of p.segs ?? []) { const L = Math.hypot(bx - ax, bz - az); if (L < 0.2) continue;   // the walking surface: the plank tops as a sheet, a lip down each side
      const nx = (bz - az) / L * w / 2, nz = -(bx - ax) / L * w / 2;
      c.quad(ax - nx, ay, az - nz, bx - nx, by, bz - nz, bx + nx, by, bz + nz, ax + nx, ay, az + nz);
      for (const sd of [-1, 1]) c.quad(ax + sd * nx, ay, az + sd * nz, bx + sd * nx, by, bz + sd * nz, bx + sd * nx, by - 0.3, bz + sd * nz, ax + sd * nx, ay - 0.3, az + sd * nz); }
    return; }
  return null; }
