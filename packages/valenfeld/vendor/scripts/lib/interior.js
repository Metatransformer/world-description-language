// THE INTERIOR KIT: one module lays a building recipe (scripts/lib/data/interiors.yml) into rooms, places every
// piece of furniture by its rule, and draws + collides the result. Used by scripts/gen/interior.js (the mesh),
// scripts/interior-place.js (the warp-in places: lights, fires, the exit door) and the admin gallery.
// Frame: the entrance (front) wall's inner face is z = 0, rooms run toward -z, x spans -w/2..w/2, floor y = 0.
// params: { recipe, w, d, storeys, seed, trade, cut }  cut = gallery dollhouse (no ceilings/front wall, upper storey set beside).
import D from "./data/interiors.json";
import { paint, flatc, glow, BX, RB, LA, CY, BARREL, SEG, PIPE, TORUS, OAK, IR, FLAG, FS, HAY, PL, CANVAS, WOOD, IRONC, STONE, WHITE } from "./buildkit.js";

const CRIMSON = "oklch(0.42 0.15 25)", GOLD = "oklch(0.76 0.13 85)", LEAD = "oklch(0.46 0.05 250)", IRONB = "oklch(0.3 0.01 250)";
const FURN = "cdn/texture-honey-oak-planks-worn.png";   // critic r1: the dark-oak texture read as black silhouettes indoors
const FW = "oklch(0.82 0.05 60)";   // furniture a step darker than the floorboards
const DARKW = "oklch(0.66 0.04 55)", LIGHTW = "oklch(0.97 0.02 75)", LINEN = "oklch(0.9 0.02 85)", SOOT = "oklch(0.25 0.01 60)";
const GOODS = { general: ["oklch(0.6 0.08 60)", "oklch(0.55 0.1 140)", "oklch(0.7 0.05 85)"], apothecary: ["oklch(0.55 0.15 150)", "oklch(0.5 0.14 300)", "oklch(0.6 0.15 25)"], "mage-supply": ["oklch(0.5 0.15 270)", "oklch(0.6 0.12 220)", GOLD], tailor: [CRIMSON, LEAD, "oklch(0.55 0.1 140)"], jeweller: [GOLD, "oklch(0.8 0.02 250)", "oklch(0.5 0.15 25)"], bookseller: ["oklch(0.45 0.1 30)", "oklch(0.4 0.06 150)", "oklch(0.4 0.06 260)"] };

export const RECIPES = D.recipes;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function rng(seed) { let s = (seed | 0) * 2654435761 >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }

// which recipe a building gets: trade first, then size (area m²)
export function pickRecipe({ trade, w = 7, d = 6 } = {}) {
  const area = w * d; let best = null;
  for (const [id, r] of Object.entries(D.recipes)) { const p = r.pick ?? {};
    if (p.trades && !(trade && p.trades.includes(trade))) continue;
    if (p.minArea && area < p.minArea) continue; if (p.maxArea && area > p.maxArea) continue;
    if (p.trades) return id; best ??= id; }
  return best ?? "house-small";
}

// ---------- layout ----------
// THE FURNISHER: one room (any rect: x0 x1 zf zb, y, h, level, i, def = a room template, furniture? = rows overriding the template's)
// gets its furniture by the placement rules, never overlapping occ. Recipes use it; so does any floorplan (scripts/gen/furnish.js).
export function makeFurnisher(L, rnd, occ) {
  const st = L.stair, block = (level, ax, az, bx, bz) => occ.push({ level, ax: Math.min(ax, bx), bx: Math.max(ax, bx), az: Math.min(az, bz), bz: Math.max(az, bz) });
  const P2 = D.pieces, fits = (lv, r, ax, az, bx, bz) => {
    if (ax < r.x0 + 0.02 || bx > r.x1 - 0.02 || bz > r.zf - (r.i ? 0.1 : 0.02) || az < r.zb + 0.1) return false;
    for (const o of occ) if (o.level === lv && ax < o.bx - 0.05 && bx > o.ax + 0.05 && az < o.bz - 0.05 && bz > o.az + 0.05) return false; return true; };
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  return (r) => {
    const def = r.def, rw = r.x1 - r.x0, rd = r.zf - r.zb, cx = (r.x0 + r.x1) / 2, cz = (r.zf + r.zb) / 2;
    const entZ = r.i ? r.zf : 0, ent = r.i ? L.doors.find((q) => q.level === r.level && Math.abs(q.z - r.zf) < 0.01)?.x ?? 0 : (r.level ? (st ? st.sx0 - 0.6 : 0) : 0);
    for (const f of r.furniture ?? def.furniture) for (let k = 0; k < (f.n ?? 1); k++) {
      const pd = P2[f.piece]; let pw = pd.w, pdd = pd.d;
      if (f.place === "across") pw = clamp(rw * 0.55, 1.8, 4.2);
      const chairs = f.chairs ?? 0, pad = chairs ? 0.62 : 0;
      const cands = [];   // [x, z, rot]  rot: 0 back to -z, 1 back to -x, 2 back to +z, 3 back to +x
      const along = (wall) => { const out = [];
        if (wall === "back" || wall === "front") { const z = wall === "back" ? r.zb + 0.1 + pdd / 2 + 0.02 : r.zf - (r.i ? 0.1 : 0) - pdd / 2 - 0.02; for (let x = r.x0 + pw / 2 + 0.05; x <= r.x1 - pw / 2 - 0.05; x += 0.25) out.push([x, z, wall === "back" ? 0 : 2]); }
        else { const x = wall === "left" ? r.x0 + pdd / 2 + 0.02 : r.x1 - pdd / 2 - 0.02; for (let z = r.zb + 0.1 + pw / 2 + 0.05; z <= r.zf - 0.15 - pw / 2; z += 0.25) out.push([x, z, wall === "left" ? 1 : 3]); }
        return shuffle(out); };
      const pl = f.place;
      if (pl === "wall-back") cands.push(...along("back").sort((a, b) => Math.abs(a[0] - cx) - Math.abs(b[0] - cx) + (rnd() - 0.5) * 1.5));
      else if (pl === "wall-side") cands.push(...shuffle([...along("left"), ...along("right")]));
      else if (pl === "wall") cands.push(...along("back"), ...shuffle([...along("left"), ...along("right")]), ...along("front"));
      else if (pl === "corner") { const e = 0.12; cands.push(...shuffle([[r.x0 + pw / 2 + e, r.zb + 0.1 + pdd / 2 + e, 0], [r.x1 - pw / 2 - e, r.zb + 0.1 + pdd / 2 + e, 0], [r.x0 + pdd / 2 + e, r.zf - 0.15 - pw / 2 - e, 1], [r.x1 - pdd / 2 - e, r.zf - 0.15 - pw / 2 - e, 3]])); }
      else if (pl === "by-door") cands.push(...along("front").sort((a, b) => Math.abs(a[0] - ent) - Math.abs(b[0] - ent)), ...shuffle([...along("left"), ...along("right")]).sort((a, b) => Math.abs(a[1] - entZ) - Math.abs(b[1] - entZ)));
      else if (pl === "across") { const z = r.zf - rd * 0.5, side = rnd() < 0.5 ? -1 : 1; cands.push([cx + side * (rw - pw) / 2 - side * 1.0, z, 0], [cx - side * (rw - pw) / 2 + side * 1.0, z, 0], [cx, z, 0]); }
      else { const rot = (pw > pdd) === (rw >= rd) ? 0 : 1; for (let t = 0; t < 30; t++) cands.push([cx + (rnd() - 0.5) * rw * (t < 3 ? 0.15 : r.spread ?? 0.6), cz + (rnd() - 0.5) * rd * (t < 3 ? 0.15 : r.spread ?? 0.6), rot]); }
      for (const [x, z, rot] of cands) { const sw = rot % 2 ? pdd : pw, sd = rot % 2 ? pw : pdd, ex = rot % 2 ? pad : 0, ez = rot % 2 ? 0 : pad;
        const ax = x - sw / 2 - ex, bx = x + sw / 2 + ex, az = z - sd / 2 - ez, bz = z + sd / 2 + ez;
        if (!pd.walk && !fits(r.level, r, ax, az, bx, bz)) continue;
        if (pd.walk && f.piece === "rug" && L.items.some((q) => q.piece === "rug" && q.level === r.level && Math.abs(q.x - x) < 1.5 && Math.abs(q.z - z) < 1.5)) continue;
        const it = { piece: f.piece, x, z, y: r.y, level: r.level, rot, w: pw, d: pdd, h: pd.h, goods: !!f.goods, chairs, walk: !!pd.walk, roomH: r.h, s: Math.floor(rnd() * 1e6) };
        if (!pd.walk) block(r.level, ax, az, bx, bz);
        L.items.push(it); break; } }
  };
}
export function layout(P = {}) {
  const rid = D.recipes[P.recipe] ? P.recipe : (P.recipe === "auto" || !P.recipe ? pickRecipe(P) : "house-small");
  const R = { ...D.recipes[rid], ...(Array.isArray(P.ground) && P.ground.length ? { ground: P.ground } : {}), ...(Array.isArray(P.upper) ? { upper: P.upper } : {}) }, rnd = rng(P.seed ?? 1);   // a program may name its own rooms floor by floor (place-language rooms kit)
  const w = clamp(P.w ?? R.w, 4.5, 22), d = clamp(P.d ?? R.d, 4.5, 22), H = R.h, S = D.upper.slab, UH = D.upper.h, T = D.walls.t;
  const two = (P.storeys ?? (R.upper.length ? 2 : 1)) >= 2 && R.upper.length > 0;
  const x0 = -w / 2, x1 = w / 2, L = { recipe: rid, name: R.name, w, d, H, S, UH, T, two, x0, x1, rooms: [], walls: [], doors: [], items: [], lights: [], fires: [], windows: [], trade: P.trade ?? null, cut: !!P.cut };
  L.top = two ? H + S + UH : H;
  // the stair: up the right wall, bottom near the front, climbing toward the back
  if (two) { const sw = D.stair.width, n = Math.ceil((H + S) / D.stair.rise), zb = -1.3; let tread = D.stair.tread;
    if (n * tread > d - 2.4) tread = Math.max(D.stair.minTread, (d - 2.4) / n);
    L.stair = { sx0: x1 - sw, sx1: x1, zb, zt: zb - n * tread, n, tread, rise: (H + S) / n }; }
  const st = L.stair;
  // rooms: front to back, depth shared by each template's middle depth
  const split = (list, level) => { const y = level ? H + S : 0, h = level ? UH : H;
    const wt = list.map((t) => { const s = D.rooms[t].size.d; return (s[0] + s[1]) / 2; }), sum = wt.reduce((a, b) => a + b, 0);
    let z = 0; return list.map((t, i) => { const dz = d * wt[i] / sum, r = { tpl: t, def: D.rooms[t], level, y, h, x0, x1, zf: z, zb: z - dz, i }; z -= dz; return r; }); };
  const ground = split(R.ground, 0), upper = two ? split(R.upper, 1) : [];
  L.rooms = [...ground, ...upper];
  if (Array.isArray(P.as)) L.rooms.forEach((r, i) => { const t = P.as[i]; if (t && D.rooms[t]) r.furniture = D.rooms[t].furniture; });   // cross: this floorplan, another room's furniture rules
  // walls between rooms: a doorway each, a gap where the stair passes
  const occ = [];   // { level, ax, az, bx, bz, soft }
  const block = (level, ax, az, bx, bz) => occ.push({ level, ax: Math.min(ax, bx), bx: Math.max(ax, bx), az: Math.min(az, bz), bz: Math.max(az, bz) });
  for (const rooms of [ground, upper]) for (let i = 0; i < rooms.length - 1; i++) { const a = rooms[i], z = a.zb, lv = a.level;
    const hi = (st && z < st.zb + 0.3 && z > st.zt - 0.3) || (st && lv === 1 && z > st.zt - 0.3) ? st.sx0 - 0.15 : x1 - 0.2;
    const dx = clamp(x0 + 1.0 + rnd() * Math.max(0, hi - x0 - 2.2), x0 + 0.9, hi - 0.9);
    L.walls.push({ level: lv, y: a.y, h: a.h, z, gaps: [[dx - D.walls.inner[0] / 2, dx + D.walls.inner[0] / 2]], cutTo: hi, doorH: D.walls.inner[1] });
    L.doors.push({ level: lv, x: dx, z });
    block(lv, dx - 0.8, z - 1.0, dx + 0.8, z + 1.0); }
  block(0, -0.95, -1.7, 0.95, 0);                        // the entrance stays clear
  if (st) { block(0, st.sx0 - 0.15, st.zt, x1, 0); block(1, st.sx0 - 0.25, st.zt - 1.1, x1, 0); }
  // furniture
  const furnish = makeFurnisher(L, rnd, occ);
  for (const r of L.rooms) { furnish(r); const def = r.def, rw = r.x1 - r.x0, rd = r.zf - r.zb, cx = (r.x0 + r.x1) / 2, cz = (r.zf + r.zb) / 2;
    // the room's light
    const lg = def.light, at = L.items.find((q) => q.piece === lg.at && q.level === r.level && q.z <= r.zf + 0.01 && q.z >= r.zb - 0.01);
    const lp = at && lg.at !== "centre" ? { x: at.x + fwd(at.rot)[0] * (at.d / 2 + 0.5), y: r.y + Math.min(r.h - 0.5, at.piece === "hearth" || at.piece === "forge" || at.piece === "stove" ? 1.0 : 1.9), z: at.z + fwd(at.rot)[1] * (at.d / 2 + 0.5) } : { x: cx, y: r.y + r.h - 0.55, z: cz };
    L.lights.push({ ...lp, color: lg.color, intensity: lg.intensity * (D.lightScale ?? 10), distance: lg.distance * 1.4, room: r.tpl });
    // windows: side + back walls, every few metres where nothing stands against the wall
    const W = D.window;
    for (const side of ["left", "right", "back"]) { if (side === "back" && r.zb > -d + 0.01) continue;
      const len = side === "back" ? rw : rd, n = Math.floor(len / W.every);
      for (let k = 0; k < n; k++) { const u = (k + 0.5) * len / n;
        const p = side === "back" ? { x: r.x0 + u, z: r.zb } : { x: side === "left" ? r.x0 : r.x1, z: r.zf - u };
        const clear = !L.items.some((q) => !q.walk && q.level === r.level && (side === "back" ? Math.abs(q.x - p.x) < (q.rot % 2 ? q.d : q.w) / 2 + W.w / 2 && q.z - r.zb < 1.2 : Math.abs(q.z - p.z) < (q.rot % 2 ? q.w : q.d) / 2 + W.w / 2 && Math.abs(q.x - p.x) < 1.2));
        const stairHit = st && side === "right" && p.z < st.zb + 0.6 && p.z > st.zt - 0.6;
        if (clear && !stairHit) L.windows.push({ side, level: r.level, y: r.y, ...p }); } } }
  for (const q of L.items) if (q.piece === "hearth" || q.piece === "forge" || q.piece === "stove") { const f = fwd(q.rot), o = q.piece === "forge" ? 0 : q.d / 2 - 0.25;
    L.fires.push({ kind: q.piece, x: q.x + f[0] * (q.piece === "forge" ? 0 : o - q.d / 2 + 0.25), y: q.y + (q.piece === "forge" ? 0.92 : q.piece === "stove" ? 0.3 : 0.18), z: q.z + f[1] * (q.piece === "forge" ? 0 : o - q.d / 2 + 0.25) }); }
  return L;
}
function fwd(rot) { return [[0, 1], [1, 0], [0, -1], [-1, 0]][rot]; }   // the way a piece's front faces

// a ctx whose faces are moved: offset (ox, oy, oz) and quarter turn rot about y (local -z back)
function moved(c, ox, oy, oz, rot = 0) {
  const tf = (x, y, z) => rot === 0 ? [ox + x, oy + y, oz + z] : rot === 1 ? [ox + z, oy + y, oz - x] : rot === 2 ? [ox - x, oy + y, oz - z] : [ox - z, oy + y, oz + x];
  const m = Object.create(c);
  m.quad = (...a) => c.quad(...tf(a[0], a[1], a[2]), ...tf(a[3], a[4], a[5]), ...tf(a[6], a[7], a[8]), ...tf(a[9], a[10], a[11]));
  m.tri = (...a) => c.tri(...tf(a[0], a[1], a[2]), ...tf(a[3], a[4], a[5]), ...tf(a[6], a[7], a[8]));
  for (const k of ["albedo", "color", "emissive", "smooth", "flat"]) m[k] = (...a) => c[k](...a);
  return m;
}

// ---------- the pieces: local frame, centred, back at -d/2, front +d/2, floor y 0 ----------
const legs = (c, w, d, h, s = 0.07, i = 0.06) => { for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) BX(c, sx * (w / 2 - i) - s / 2, 0, sz * (d / 2 - i) - s / 2, sx * (w / 2 - i) + s / 2, h, sz * (d / 2 - i) + s / 2); };
const top = (c, w, d, h, t = 0.05) => { BX(c, -w / 2, h - t, -d / 2, w / 2, h, d / 2); };
const candle = (c, x, y, z, det) => { flatc(c, LINEN); CY(c, x, y, z, 0.025, 0.12, 6); if (det < 3) { glow(c, "oklch(0.9 0.12 80)", [3, 1.9, 0.6]); LA(c, x, y + 0.12, z, [[0.012, 0], [0.018, 0.025], [0, 0.06]], 5, false); } };
const tankard = (c, x, y, z) => { paint(c, FURN, DARKW); CY(c, x, y, z, 0.045, 0.13, 8); flatc(c, IRONB); TORUS(c, x, y + 0.03, z, 0.047, 0.006, 8, 3); };
const book = (c, x, y, z, w, h, d, col, tilt = 0) => { flatc(c, col); RB(c, x, y + h / 2, z, w, h, d, 0, 0, tilt); flatc(c, "oklch(0.9 0.03 85)"); BX(c, x - w / 2 + 0.005, y + 0.01, z + d / 2, x + w / 2 - 0.005, y + h - 0.01, z + d / 2 + 0.002); };
function chairAt(c, x, z, yawRot, det) { const m = moved(c, x, 0, z, yawRot); PIECES.chair(m, D.pieces.chair, det); }
export const PIECES = {
  table(c, p, det) { paint(c, FURN, FW); top(c, p.w, p.d, p.h); legs(c, p.w, p.d, p.h - 0.05); BX(c, -p.w / 2 + 0.08, p.h - 0.15, -p.d / 2 + 0.09, p.w / 2 - 0.08, p.h - 0.05, -p.d / 2 + 0.12); BX(c, -p.w / 2 + 0.08, p.h - 0.15, p.d / 2 - 0.12, p.w / 2 - 0.08, p.h - 0.05, p.d / 2 - 0.09);
    BX(c, -p.w / 2 + 0.1, 0.15, -0.02, p.w / 2 - 0.1, 0.2, 0.02);
    if (det < 3) { tankard(c, -p.w * 0.22, p.h, 0.1); candle(c, 0.05, p.h, -0.05, det); flatc(c, "oklch(0.8 0.03 80)"); CY(c, p.w * 0.25, p.h, -0.1, 0.13, 0.03, 10); flatc(c, "oklch(0.7 0.12 60)"); LA(c, p.w * 0.25, p.h + 0.03, -0.1, [[0.07, 0], [0.06, 0.05], [0, 0.07]], 8, false); } },
  "round-table"(c, p, det) { paint(c, FURN, FW); LA(c, 0, p.h - 0.05, 0, [[p.w / 2, 0], [p.w / 2, 0.05]], 16, true, "y", false); LA(c, 0, 0, 0, [[0.32, 0], [0.3, 0.05], [0.07, 0.1], [0.06, p.h - 0.15], [0.12, p.h - 0.05]], 10, false);
    if (det < 3) { tankard(c, 0.18, p.h, 0.1); tankard(c, -0.2, p.h, -0.05); candle(c, 0, p.h, -0.15, det); } },
  "long-table"(c, p, det) { paint(c, FURN, FW); top(c, p.w, p.d, p.h, 0.07); for (const x of [-p.w / 2 + 0.15, 0, p.w / 2 - 0.15]) { BX(c, x - 0.05, 0, -p.d / 2 + 0.1, x + 0.05, p.h - 0.07, -p.d / 2 + 0.2); BX(c, x - 0.05, 0, p.d / 2 - 0.2, x + 0.05, p.h - 0.07, p.d / 2 - 0.1); BX(c, x - 0.04, 0.1, -p.d / 2 + 0.1, x + 0.04, 0.17, p.d / 2 - 0.1); }
    BX(c, -p.w / 2 + 0.15, 0.25, -0.03, p.w / 2 - 0.15, 0.32, 0.03);
    if (det < 3) { for (let i = 0; i < 4; i++) tankard(c, -p.w / 2 + 0.4 + i * (p.w - 0.8) / 3, p.h, (i % 2 ? 0.2 : -0.2)); candle(c, -0.3, p.h, 0, det); candle(c, 0.4, p.h, 0.05, det); flatc(c, CRIMSON); BX(c, -p.w / 2 + 0.3, p.h, -0.18, p.w / 2 - 0.3, p.h + 0.005, 0.18); } },
  desk(c, p, det) { PIECES.table(c, { ...p }, 9); paint(c, FURN, DARKW); BX(c, p.w / 2 - 0.45, 0.05, -p.d / 2 + 0.05, p.w / 2 - 0.05, p.h - 0.06, p.d / 2 - 0.05); paint(c, FURN, FW); for (let i = 0; i < 3; i++) { BX(c, p.w / 2 - 0.42, 0.1 + i * 0.21, p.d / 2 - 0.05, p.w / 2 - 0.08, 0.27 + i * 0.21, p.d / 2 - 0.03); flatc(c, GOLD); CY(c, p.w / 2 - 0.25, 0.18 + i * 0.21, p.d / 2 - 0.03, 0.015, 0.02, 6); paint(c, FURN, FW); }
    if (det < 3) { for (let i = 0; i < 4; i++) book(c, -p.w / 2 + 0.2, p.h + i * 0.05, -0.15, 0.24, 0.05, 0.18, ["oklch(0.4 0.1 30)", LEAD, "oklch(0.4 0.08 140)", CRIMSON][i]); flatc(c, LINEN); RB(c, 0, p.h + 0.003, 0.08, 0.32, 0.006, 0.24, 12); candle(c, p.w / 2 - 0.2, p.h, -0.2, det); flatc(c, SOOT); CY(c, 0.25, p.h, -0.15, 0.03, 0.05, 6); flatc(c, LINEN); SEG(c, [0.25, p.h + 0.04, -0.15], [0.3, p.h + 0.2, -0.12], 0.01, 0.03); } },
  chair(c, p, det) { paint(c, FURN, FW); const s = 0.45; BX(c, -0.22, s - 0.04, -0.22, 0.22, s, 0.22); for (const [x, z] of [[-0.19, 0.19], [0.19, 0.19]]) BX(c, x - 0.025, 0, z - 0.025, x + 0.025, s - 0.04, z + 0.025);
    for (const x of [-0.19, 0.19]) BX(c, x - 0.03, 0, -0.22, x + 0.03, p.h, -0.16); for (let i = 0; i < 3; i++) BX(c, -0.16, s + 0.12 + i * 0.13, -0.21, 0.16, s + 0.19 + i * 0.13, -0.17); BX(c, -0.19, 0.12, -0.19, 0.19, 0.16, 0.19 - 0.38 + 0.38); },
  bench(c, p) { paint(c, FURN, FW); BX(c, -p.w / 2, p.h - 0.05, -p.d / 2, p.w / 2, p.h, p.d / 2); for (const x of [-p.w / 2 + 0.15, p.w / 2 - 0.15]) BX(c, x - 0.04, 0, -p.d / 2 + 0.04, x + 0.04, p.h - 0.05, p.d / 2 - 0.04); BX(c, -p.w / 2 + 0.15, 0.12, -0.03, p.w / 2 - 0.15, 0.18, 0.03); },
  "high-seat"(c, p, det) { paint(c, FURN, DARKW); BX(c, -0.5, 0.45, -0.4, 0.5, 0.55, 0.35); for (const x of [-0.46, 0.46]) { BX(c, x - 0.05, 0, -0.4, x + 0.05, p.h, -0.3); BX(c, x - 0.05, 0, 0.25, x + 0.05, 0.85, 0.35); BX(c, x - 0.05, 0.8, -0.35, x + 0.05, 0.86, 0.35); }
    BX(c, -0.42, 0.55, -0.4, 0.42, p.h - 0.08, -0.34); flatc(c, CRIMSON); BX(c, -0.4, 0.55, 0.3 - 0.65, 0.4, 0.62, 0.3); BX(c, -0.36, 0.7, -0.34, 0.36, p.h - 0.2, -0.3);
    flatc(c, GOLD); for (const x of [-0.46, 0.46]) LA(c, x, p.h, -0.35, [[0.06, 0], [0.07, 0.04], [0, 0.12]], 8, false); if (det < 3) LA(c, 0, p.h - 0.45, -0.29, [[0.12, 0], [0.12, 0.015]], 10, true, "z"); },
  hearth(c, p, det) { const h = p.roomH ?? 3, w = p.w, d = p.d; paint(c, FS, STONE);
    BX(c, -w / 2, 0, -d / 2, -w / 2 + 0.35, 1.2, d / 2); BX(c, w / 2 - 0.35, 0, -d / 2, w / 2, 1.2, d / 2); BX(c, -w / 2, 0.9, -d / 2, w / 2, 1.2, d / 2); BX(c, -w / 2 + 0.35, 0, -d / 2, w / 2 - 0.35, 0.9, -d / 2 + 0.2);
    BX(c, -w / 2 - 0.15, 0, d / 2, w / 2 + 0.15, 0.08, d / 2 + 0.45);   // hearthstone
    BX(c, -w / 2 + 0.1, 1.2, -d / 2, w / 2 - 0.1, h, d / 2 - 0.25);       // chimney breast to the ceiling
    paint(c, FURN, DARKW); BX(c, -w / 2 - 0.1, 1.2, -d / 2, w / 2 + 0.1, 1.3, d / 2 + 0.08);   // mantel
    flatc(c, SOOT); BX(c, -w / 2 + 0.35, 0.02, -d / 2 + 0.2, w / 2 - 0.35, 0.9, -d / 2 + 0.21);
    paint(c, FURN, "oklch(0.55 0.04 50)"); PIPE(c, [-0.4, 0.14, -0.05], [0.35, 0.14, 0.05], 0.06, 0.06, 6); PIPE(c, [-0.3, 0.12, 0.12], [0.4, 0.16, -0.08], 0.05, 0.05, 6); PIPE(c, [-0.2, 0.22, 0.03], [0.25, 0.25, 0.02], 0.045, 0.045, 6);
    glow(c, "oklch(0.6 0.2 40)", [2.6, 0.8, 0.15]); BX(c, -0.45, 0.04, -0.15, 0.45, 0.07, 0.2);
    flatc(c, IRONB); for (const x of [-0.5, 0.5]) { BX(c, x - 0.02, 0.04, -0.1, x + 0.02, 0.3, -0.06); BX(c, x - 0.02, 0.04, -0.1, x + 0.02, 0.07, 0.25); }
    if (det < 3) { flatc(c, IRONB); SEG(c, [0.55, 0.9, -0.2], [0.1, 0.85, -0.2], 0.025); LA(c, 0.1, 0.4, -0.15, [[0.08, 0], [0.16, 0.1], [0.17, 0.22], [0.14, 0.3]], 10, false);
      paint(c, FURN, FW); for (let i = 0; i < 3; i++) { flatc(c, ["oklch(0.6 0.08 60)", "oklch(0.55 0.05 250)", "oklch(0.7 0.05 85)"][i]); LA(c, -0.6 + i * 0.5, 1.3, 0.05, [[0.05, 0], [0.07, 0.1], [0.04, 0.2], [0.03, 0.24]], 8, false); }
      candle(c, 0.75, 1.3, 0.05, det); flatc(c, CRIMSON); BX(c, -0.3, 1.6, d / 2 - 0.26, 0.3, 2.05, d / 2 - 0.24); flatc(c, GOLD); RB(c, 0, 1.83, d / 2 - 0.235, 0.18, 0.18, 0.01, 0, 0, 45); } },
  stove(c, p, det) { const h = p.roomH ?? 3, w = p.w, d = p.d; paint(c, FS, STONE); BX(c, -w / 2, 0, -d / 2, w / 2, 0.82, d / 2); flatc(c, SOOT); BX(c, -0.3, 0.12, d / 2, 0.3, 0.5, d / 2 + 0.005); glow(c, "oklch(0.6 0.2 40)", [2.4, 0.7, 0.12]); BX(c, -0.25, 0.14, d / 2 + 0.006, 0.25, 0.22, d / 2 + 0.008);
    flatc(c, IRONB); BX(c, -w / 2 + 0.05, 0.82, -d / 2 + 0.05, w / 2 - 0.05, 0.86, d / 2 - 0.05); paint(c, PL, WHITE); const hy = 1.75;
    c.quad(-w / 2 - 0.1, hy, d / 2 + 0.05, w / 2 + 0.1, hy, d / 2 + 0.05, w / 2 - 0.1, hy + 0.7, -d / 2 + 0.25, -w / 2 + 0.1, hy + 0.7, -d / 2 + 0.25); BX(c, -w / 2 + 0.1, hy + 0.7, -d / 2, w / 2 - 0.1, h, -d / 2 + 0.25); BX(c, -w / 2 - 0.1, hy - 0.08, -d / 2, w / 2 + 0.1, hy, d / 2 + 0.05);
    flatc(c, IRONB); LA(c, -0.3, 0.86, 0, [[0.12, 0], [0.16, 0.12], [0.15, 0.2]], 10, false); if (det < 3) { flatc(c, "oklch(0.6 0.12 55)"); LA(c, 0.32, 0.86, 0, [[0.11, 0], [0.13, 0.04]], 10, true); for (let i = 0; i < 4; i++) { flatc(c, i % 2 ? "oklch(0.55 0.05 60)" : IRONB); SEG(c, [-0.45 + i * 0.3, hy - 0.08, d / 2], [-0.45 + i * 0.3, hy - 0.4, d / 2 + 0.02], 0.02); } } },
  forge(c, p, det) { const h = p.roomH ?? 3, w = p.w, d = p.d; paint(c, FS, STONE); BX(c, -w / 2, 0, -d / 2, w / 2, 0.85, d / 2); BX(c, -w / 2, 0.85, -d / 2, w / 2, 0.95, -d / 2 + 0.15); BX(c, -w / 2, 0.85, -d / 2, -w / 2 + 0.15, 0.95, d / 2); BX(c, w / 2 - 0.15, 0.85, -d / 2, w / 2, 0.95, d / 2);
    flatc(c, SOOT); BX(c, -w / 2 + 0.15, 0.85, -d / 2 + 0.15, w / 2 - 0.15, 0.88, d / 2); glow(c, "oklch(0.62 0.21 40)", [3.2, 1.0, 0.18]); LA(c, 0, 0.86, 0.05, [[0.35, 0], [0.25, 0.05], [0, 0.07]], 10, false);
    paint(c, IR, IRONC); const hy = 1.9; c.quad(-w / 2, hy, d / 2, w / 2, hy, d / 2, 0.3, hy + 0.7, 0.1, -0.3, hy + 0.7, 0.1); c.quad(w / 2, hy, -d / 2, -w / 2, hy, -d / 2, -0.3, hy + 0.7, -0.2, 0.3, hy + 0.7, -0.2);
    c.quad(-w / 2, hy, -d / 2, -w / 2, hy, d / 2, -0.3, hy + 0.7, 0.1, -0.3, hy + 0.7, -0.2); c.quad(w / 2, hy, d / 2, w / 2, hy, -d / 2, 0.3, hy + 0.7, -0.2, 0.3, hy + 0.7, 0.1); BX(c, -0.3, hy + 0.7, -0.2, 0.3, h, 0.1);
    paint(c, FURN, DARKW); RB(c, w / 2 + 0.25, 0.75, 0, 0.4, 0.14, 0.7, 0, 8); flatc(c, "oklch(0.4 0.06 50)"); RB(c, w / 2 + 0.25, 0.83, 0, 0.36, 0.06, 0.62, 0, 8); flatc(c, IRONB); for (let i = 0; i < 2; i++) SEG(c, [-0.3 + i * 0.2, 0.95, d / 2 - 0.1], [-0.1 + i * 0.25, 0.97, d / 2 + 0.35], 0.025); },
  anvil(c, p) { paint(c, FURN, DARKW); LA(c, 0, 0, 0, [[0.3, 0], [0.27, 0.05], [0.26, 0.48], [0.25, 0.5]], 10, true); flatc(c, IRONB); BX(c, -0.16, 0.5, -0.12, 0.16, 0.6, 0.12); BX(c, -0.07, 0.6, -0.07, 0.07, 0.7, 0.07); BX(c, -0.22, 0.7, -0.1, 0.22, 0.85, 0.1); PIPE(c, [0.22, 0.79, 0], [0.45, 0.82, 0], 0.07, 0.01, 8); BX(c, -0.3, 0.75, -0.08, -0.22, 0.85, 0.08);
    paint(c, FURN, FW); SEG(c, [-0.1, 0.86, 0.05], [0.2, 0.87, 0.2], 0.03); flatc(c, IRONB); RB(c, -0.12, 0.89, 0.04, 0.12, 0.06, 0.06, 30); },
  // smithing gear: what a working forge keeps within arm's reach (the Valenfeld smithy's kit, made recipe pieces)
  "quench-trough"(c, p, det) { const w = p.w, d = p.d, h = p.h; paint(c, FURN, DARKW); BX(c, -w / 2, 0, -d / 2, w / 2, 0.08, d / 2); BX(c, -w / 2, 0, -d / 2, -w / 2 + 0.07, h, d / 2); BX(c, w / 2 - 0.07, 0, -d / 2, w / 2, h, d / 2); BX(c, -w / 2, 0, -d / 2, w / 2, h, -d / 2 + 0.07); BX(c, -w / 2, 0, d / 2 - 0.07, w / 2, h, d / 2);
    flatc(c, IRONB); for (const x of [-w / 2 + 0.2, w / 2 - 0.2]) { BX(c, x - 0.03, 0.08, -d / 2 - 0.01, x + 0.03, h, -d / 2 + 0.005); BX(c, x - 0.03, 0.08, d / 2 - 0.005, x + 0.03, h, d / 2 + 0.01); }
    glow(c, "oklch(0.32 0.04 230)", [0.02, 0.03, 0.05]); BX(c, -w / 2 + 0.07, h - 0.1, -d / 2 + 0.07, w / 2 - 0.07, h - 0.08, d / 2 - 0.07);
    if (det < 3) { flatc(c, IRONB); SEG(c, [w / 2 - 0.3, h - 0.09, 0], [w / 2 + 0.05, h + 0.35, 0.05], 0.018); SEG(c, [w / 2 - 0.25, h - 0.09, 0.04], [w / 2 + 0.08, h + 0.33, 0.1], 0.018); } },
  grindstone(c, p, det) { paint(c, FURN, FW); BX(c, -0.4, 0, -0.25, 0.4, 0.08, 0.25); for (const x of [-0.2, 0.2]) { RB(c, x, 0.4, 0, 0.07, 0.8, 0.07); }
    paint(c, FS, "oklch(0.7 0.02 80)"); LA(c, 0, 0.62, 0, [[0.34, -0.05], [0.34, 0.05]], 16, true, "x"); flatc(c, IRONB); SEG(c, [-0.28, 0.62, 0], [0.32, 0.62, 0], 0.025); SEG(c, [0.32, 0.62, 0], [0.32, 0.45, 0.15], 0.02);
    if (det < 3) { paint(c, FURN, DARKW); BX(c, -0.38, 0.08, 0.05, -0.12, 0.3, 0.24); flatc(c, "oklch(0.35 0.04 230)"); BX(c, -0.36, 0.28, 0.07, -0.14, 0.29, 0.22); } },
  "armor-stand"(c, p, det) { paint(c, FURN, FW); BX(c, -0.3, 0, -0.22, 0.3, 0.07, 0.22); RB(c, 0, 0.85, 0, 0.06, 1.6, 0.06); RB(c, 0, 1.45, 0, 0.55, 0.06, 0.06);
    paint(c, IR, "oklch(0.62 0.012 250)"); c.metalness(0.65); c.roughness(0.42); LA(c, 0, 0.95, 0, [[0.16, 0], [0.22, 0.12], [0.24, 0.35], [0.2, 0.48], [0.08, 0.52]], 12, true); BX(c, -0.3, 1.38, -0.1, -0.16, 1.5, 0.1); BX(c, 0.16, 1.38, -0.1, 0.3, 1.5, 0.1);
    if (det < 3) { LA(c, 0, 1.58, 0, [[0.13, 0], [0.14, 0.12], [0.1, 0.22], [0, 0.25]], 12, true); flatc(c, "oklch(0.4 0.06 50)"); BX(c, -0.2, 0.92, -0.17, 0.2, 0.97, 0.17); } c.metalness(null); c.roughness(null); },
  "bar-stock"(c, p, det) { paint(c, FURN, FW); const w = p.w, d = p.d; for (const x of [-w / 2 + 0.06, w / 2 - 0.06]) { BX(c, x - 0.05, 0, -d / 2, x + 0.05, p.h, -d / 2 + 0.08); BX(c, x - 0.05, 0, -d / 2, x + 0.05, 0.08, d / 2); }
    for (const y of [0.35, 0.75]) BX(c, -w / 2, y, -d / 2, w / 2, y + 0.05, -d / 2 + 0.3);
    flatc(c, IRONB); if (det < 3) for (const y of [0.4, 0.8]) for (let i = 0; i < 7; i++) SEG(c, [-w / 2 + 0.05, y + 0.03, -d / 2 + 0.05 + i * 0.035], [w / 2 - 0.05, y + 0.03, -d / 2 + 0.05 + i * 0.035], 0.012);
    paint(c, FURN, DARKW); BX(c, -w / 2 + 0.1, 0.08, -d / 2 + 0.1, w / 2 - 0.1, 0.22, d / 2 - 0.05); if (det < 3) { flatc(c, "oklch(0.15 0.01 60)"); BX(c, -w / 2 + 0.14, 0.2, -d / 2 + 0.14, w / 2 - 0.14, 0.24, d / 2 - 0.09); } },
  workbench(c, p, det) { paint(c, FURN, FW); BX(c, -p.w / 2, p.h - 0.09, -p.d / 2, p.w / 2, p.h, p.d / 2); legs(c, p.w, p.d, p.h - 0.09, 0.09); BX(c, -p.w / 2 + 0.08, 0.15, -p.d / 2 + 0.08, p.w / 2 - 0.08, 0.19, p.d / 2 - 0.08);
    paint(c, FURN, DARKW); BX(c, -p.w / 2, p.h - 0.4, -p.d / 2 - 0.02, p.w / 2, p.h + 0.45, -p.d / 2 + 0.03);   // tool board
    if (det < 3) { for (let i = 0; i < 5; i++) { paint(c, FURN, FW); SEG(c, [-0.7 + i * 0.32, p.h + 0.1, -p.d / 2 + 0.06], [-0.7 + i * 0.32, p.h + 0.38, -p.d / 2 + 0.06], 0.025); flatc(c, IRONB); BX(c, -0.76 + i * 0.32, p.h + 0.35, -p.d / 2 + 0.04, -0.64 + i * 0.32, p.h + 0.4, -p.d / 2 + 0.09); }
      flatc(c, IRONB); BX(c, p.w / 2 - 0.25, p.h, p.d / 2 - 0.15, p.w / 2 - 0.05, p.h + 0.12, p.d / 2); paint(c, FURN, LIGHTW); for (let i = 0; i < 3; i++) BX(c, -p.w / 2 + 0.15, 0.19 + i * 0.04, -0.2, p.w / 2 - 0.4, 0.23 + i * 0.04, 0.05); RB(c, -0.2, p.h + 0.03, 0.1, 0.8, 0.05, 0.15, 8); } },
  shelves(c, p, det) { paint(c, FURN, FW); const w = p.w, d = p.d, h = p.h; BX(c, -w / 2, 0, -d / 2, -w / 2 + 0.04, h, d / 2); BX(c, w / 2 - 0.04, 0, -d / 2, w / 2, h, d / 2); paint(c, FURN, DARKW); BX(c, -w / 2, 0, -d / 2, w / 2, h, -d / 2 + 0.02); paint(c, FURN, FW);
    const rows = [0.08, 0.55, 1.02, 1.49, h - 0.03]; for (const y of rows) BX(c, -w / 2 + 0.04, y - 0.03, -d / 2, w / 2 - 0.04, y, d / 2);
    if (det >= 3) return; const R = rng(p.s ?? 3), pal = GOODS[p.trade] ?? GOODS.general;
    for (let ri = 0; ri < 4; ri++) { const y = rows[ri]; let x = -w / 2 + 0.1; while (x < w / 2 - 0.15) { const k = Math.floor(R() * (p.goods ? 5 : 3)), col = pal[Math.floor(R() * pal.length)];
      if (k === 0) { flatc(c, col); LA(c, x + 0.06, y, 0, [[0.06, 0], [0.065, 0.12], [0.03, 0.16], [0.035, 0.2]], 8, true); x += 0.15; }
      else if (k === 1) { paint(c, FURN, DARKW); BX(c, x, y, -0.12, x + 0.22, y + 0.16, 0.1); x += 0.26; }
      else if (k === 2) { flatc(c, "oklch(0.82 0.03 80)"); CY(c, x + 0.07, y, 0, 0.07, 0.11, 8); flatc(c, LINEN); CY(c, x + 0.07, y + 0.11, 0, 0.074, 0.02, 8); x += 0.17; }
      else if (k === 3) { flatc(c, col); PIPE(c, [x, y + 0.08, 0], [x + 0.3, y + 0.08, 0], 0.08, 0.08, 8); x += 0.34; }
      else { flatc(c, col); for (let b = 0; b < 3; b++) LA(c, x + 0.04 + b * 0.07, y, 0.02, [[0.03, 0], [0.032, 0.14], [0.01, 0.18], [0.012, 0.22]], 6, true); x += 0.25; } x += R() * 0.08; } } },
  bookcase(c, p, det) { paint(c, FURN, DARKW); const w = p.w, d = p.d, h = p.h; BX(c, -w / 2, 0, -d / 2, -w / 2 + 0.05, h, d / 2); BX(c, w / 2 - 0.05, 0, -d / 2, w / 2, h, d / 2); BX(c, -w / 2, 0, -d / 2, w / 2, h, -d / 2 + 0.02); BX(c, -w / 2 - 0.04, h - 0.08, -d / 2, w / 2 + 0.04, h, d / 2 + 0.04); BX(c, -w / 2, 0, -d / 2, w / 2, 0.1, d / 2);
    const rows = [0.1, 0.5, 0.9, 1.3, 1.7]; for (const y of rows.slice(1)) BX(c, -w / 2 + 0.05, y - 0.03, -d / 2, w / 2 - 0.05, y, d / 2); if (det >= 3) return;
    const R = rng(p.s ?? 5), cols = ["oklch(0.4 0.1 30)", "oklch(0.35 0.06 150)", LEAD, "oklch(0.45 0.08 60)", CRIMSON, "oklch(0.3 0.03 60)"];
    for (const y of rows) { let x = -w / 2 + 0.07; while (x < w / 2 - 0.1) { const bw = 0.03 + R() * 0.035, bh = 0.24 + R() * 0.1; if (R() < 0.07) { x += 0.1; continue; } book(c, x + bw / 2, y, -0.02, bw, bh, 0.22, cols[Math.floor(R() * cols.length)], R() < 0.08 ? 10 : 0); x += bw + 0.004; } } },
  cupboard(c, p, det) { paint(c, FURN, FW); const w = p.w, d = p.d; BX(c, -w / 2, 0, -d / 2, w / 2, 0.9, d / 2); paint(c, FURN, DARKW); for (const s of [-1, 1]) { BX(c, s * 0.03, 0.1, d / 2, s * (w / 2 - 0.05), 0.82, d / 2 + 0.02); flatc(c, IRONB); CY(c, s * 0.1, 0.5, d / 2 + 0.02, 0.015, 0.03, 6); paint(c, FURN, DARKW); }
    paint(c, FURN, FW); BX(c, -w / 2, 0.9, -d / 2, w / 2, 0.95, d / 2 + 0.03); BX(c, -w / 2, 0.95, -d / 2, -w / 2 + 0.04, p.h, -d / 2 + 0.3); BX(c, w / 2 - 0.04, 0.95, -d / 2, w / 2, p.h, -d / 2 + 0.3); BX(c, -w / 2, 0.95, -d / 2, w / 2, p.h, -d / 2 + 0.02); for (const y of [1.35, p.h - 0.03]) BX(c, -w / 2, y - 0.03, -d / 2, w / 2, y, -d / 2 + 0.3);
    if (det < 3) { for (let i = 0; i < 4; i++) { flatc(c, i % 2 ? "oklch(0.75 0.05 230)" : "oklch(0.85 0.03 80)"); LA(c, -0.42 + i * 0.28, 0.95 + 0.17, -d / 2 + 0.06, [[0.13, 0], [0.13, 0.015]], 12, true, "z"); } for (let i = 0; i < 3; i++) { flatc(c, "oklch(0.62 0.1 50)"); LA(c, -0.35 + i * 0.35, 1.35, -d / 2 + 0.15, [[0.06, 0], [0.08, 0.08], [0.04, 0.16], [0.045, 0.19]], 8, true); } } },
  wardrobe(c, p) { paint(c, FURN, DARKW); const w = p.w, d = p.d, h = p.h; BX(c, -w / 2, 0.08, -d / 2, w / 2, h - 0.1, d / 2); BX(c, -w / 2 - 0.04, h - 0.1, -d / 2, w / 2 + 0.04, h, d / 2 + 0.04); for (const [x, z] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) LA(c, x * (w / 2 - 0.06), 0, z * (d / 2 - 0.06), [[0.04, 0], [0.05, 0.04], [0.04, 0.08]], 6, false);
    paint(c, FURN, FW); for (const s of [-1, 1]) { BX(c, s * 0.01, 0.15, d / 2, s * (w / 2 - 0.05), h - 0.18, d / 2 + 0.02); BX(c, s * 0.08, 0.3, d / 2 + 0.02, s * (w / 2 - 0.12), h * 0.45, d / 2 + 0.035); BX(c, s * 0.08, h * 0.5, d / 2 + 0.02, s * (w / 2 - 0.12), h - 0.32, d / 2 + 0.035); flatc(c, GOLD); CY(c, s * 0.05, h * 0.47, d / 2 + 0.02, 0.018, 0.035, 6); paint(c, FURN, FW); } },
  chest(c, p) { const w = p.w, d = p.d; paint(c, FURN, FW); BX(c, -w / 2, 0, -d / 2, w / 2, 0.42, d / 2); LA(c, -w / 2, 0.42, 0, [[d / 2, 0], [d / 2, w]], 12, true, "x"); BX(c, -w / 2, 0.36, -d / 2 - 0.005, w / 2, 0.42, d / 2 + 0.005);
    paint(c, IR, IRONC); for (const x of [-w / 2 + 0.12, w / 2 - 0.12]) { BX(c, x - 0.03, 0, -d / 2 - 0.01, x + 0.03, 0.42, d / 2 + 0.01); LA(c, x - 0.03, 0.42, 0, [[d / 2 + 0.012, 0], [d / 2 + 0.012, 0.06]], 12, false, "x"); }
    flatc(c, GOLD); BX(c, -0.06, 0.28, d / 2, 0.06, 0.44, d / 2 + 0.025); },
  counter(c, p, det) { const w = p.w, d = p.d, h = p.h; paint(c, FURN, DARKW); BX(c, -w / 2, 0, -d / 2 + 0.05, w / 2, h - 0.06, d / 2); paint(c, FURN, FW); BX(c, -w / 2 - 0.05, h - 0.06, -d / 2, w / 2 + 0.05, h, d / 2 + 0.06);
    for (let x = -w / 2; x <= w / 2 + 0.01; x += w / Math.max(2, Math.round(w / 0.7))) BX(c, x - 0.04, 0.05, d / 2, x + 0.04, h - 0.06, d / 2 + 0.03); BX(c, -w / 2, 0, d / 2, w / 2, 0.08, d / 2 + 0.035); BX(c, -w / 2, h - 0.16, d / 2, w / 2, h - 0.1, d / 2 + 0.03);
    BX(c, -w / 2 + 0.05, 0.4, -d / 2 + 0.05, w / 2 - 0.05, 0.44, -d / 2 + 0.06 - 0.01 + 0.3);
    if (det < 3) { flatc(c, GOLD); CY(c, -w / 4, h, 0, 0.02, 0.32, 6); SEG(c, [-w / 4 - 0.22, h + 0.32, 0], [-w / 4 + 0.22, h + 0.32, 0], 0.012); for (const s of [-1, 1]) LA(c, -w / 4 + s * 0.2, h + 0.12, 0, [[0.09, 0], [0.07, 0.02]], 10, true);
      for (let i = 0; i < 6; i++) { flatc(c, GOLD); CY(c, 0.15 + (i % 3) * 0.035, h + Math.floor(i / 3) * 0.01, 0.1 + (i % 2) * 0.03, 0.016, 0.006, 8); } flatc(c, "oklch(0.4 0.1 30)"); RB(c, w / 4, h + 0.025, -0.05, 0.36, 0.05, 0.26, -8); flatc(c, LINEN); RB(c, w / 4, h + 0.052, -0.05, 0.33, 0.004, 0.24, -8); candle(c, w / 2 - 0.15, h, -0.15, det); } },
  bar(c, p, det) { PIECES.counter(c, p, 9); if (det < 3) { for (let i = 0; i < 5; i++) tankard(c, -p.w / 2 + 0.3 + i * 0.32, p.h, 0.15); paint(c, FURN, FW); LA(c, p.w / 2 - 0.45, p.h + 0.22, 0, [[0.17, -0.25], [0.21, 0], [0.17, 0.25]], 10, true, "x"); flatc(c, IRONB); SEG(c, [p.w / 2 - 0.45, p.h + 0.18, 0.2], [p.w / 2 - 0.45, p.h + 0.12, 0.28], 0.025); candle(c, -0.2, p.h, -0.15, det); } },
  "cask-rack"(c, p) { const w = p.w, d = p.d; paint(c, FURN, DARKW); for (const x of [-w / 2 + 0.05, w / 2 - 0.05]) { BX(c, x - 0.05, 0, -d / 2, x + 0.05, p.h, -d / 2 + 0.1); BX(c, x - 0.05, 0, d / 2 - 0.1, x + 0.05, p.h, d / 2); BX(c, x - 0.05, 0.12, -d / 2, x + 0.05, 0.2, d / 2); BX(c, x - 0.05, 0.85, -d / 2, x + 0.05, 0.93, d / 2); }
    for (const y of [0.16, 0.89]) for (const z of [-d / 2 + 0.15, d / 2 - 0.15]) BX(c, -w / 2, y - 0.04, z - 0.04, w / 2, y + 0.04, z + 0.04);
    for (const y of [0.55, 1.28]) { const n = Math.max(1, Math.floor((w - 0.1) / 0.72)); for (let i = 0; i < n; i++) { const x = -w / 2 + 0.05 + (i + 0.5) * (w - 0.1) / n; paint(c, FURN, FW); LA(c, x, y - 0.03, -d / 2 + 0.05, [[0.29, 0], [0.34, d * 0.45], [0.29, d - 0.1]], 12, true, "z"); paint(c, IR, IRONC); for (const t of [0.1, d - 0.2]) LA(c, x, y - 0.03, -d / 2 + 0.05 + t, [[0.315, 0], [0.315, 0.05]], 12, false, "z"); flatc(c, "oklch(0.55 0.05 60)"); PIPE(c, [x, y - 0.12, d / 2 - 0.05], [x, y - 0.12, d / 2 + 0.06], 0.025, 0.02, 6); } } },
  barrels(c, p) { BARREL(c, -0.38, 0, 0, 0.33, 0.9, 1, FURN, FW); BARREL(c, 0.36, 0, 0.05, 0.3, 0.8, 1, FURN, FW); paint(c, FURN, DARKW); LA(c, 0.32, 0.8, 0.05, [[0.3, 0], [0.3, 0.025]], 12, true); BARREL(c, 0.32, 0.825, 0.05, 0.16, 0.34, 1, FURN, FW); },   // critic r2: corner casks were the last black silhouettes
  crates(c, p) { const cr = (x, y, z, s, r) => { const m = moved(c, x, y, z, r); paint(m, FURN, LIGHTW); BX(m, -s / 2, 0, -s / 2, s / 2, s, s / 2); paint(m, FURN, DARKW); for (const sx of [-1, 1]) for (const sz of [-1, 1]) BX(m, sx * s / 2 - 0.035, 0, sz * s / 2 - 0.035, sx * s / 2 + 0.035, s, sz * s / 2 + 0.035); for (const y of [0, s - 0.06]) { BX(m, -s / 2 - 0.01, y, s / 2, s / 2 + 0.01, y + 0.06, s / 2 + 0.015); BX(m, -s / 2 - 0.01, y, -s / 2 - 0.015, s / 2 + 0.01, y + 0.06, -s / 2); } SEG(m, [-s / 2, 0.05, s / 2 + 0.01], [s / 2, s - 0.05, s / 2 + 0.01], 0.06, 0.02); };
    cr(-0.33, 0, 0, 0.6, 0); cr(0.36, 0, 0.05, 0.55, 1); cr(-0.3, 0.6, 0.02, 0.5, 1); },
  sacks(c, p) { for (let i = 0; i < 3; i++) { const x = -0.4 + i * 0.4, r = 0.2 - (i % 2) * 0.02, s = i % 2 ? 0.95 : 1; paint(c, CANVAS, "oklch(0.88 0.04 80)"); LA(c, x, 0, 0, [[r * 0.8, 0], [r * 1.1, 0.12 * s], [r * 1.05, 0.35 * s], [r * 0.6, 0.48 * s], [0.04, 0.52 * s], [0.06, 0.6 * s], [0, 0.61 * s]], 10, false); flatc(c, "oklch(0.55 0.06 70)"); TORUS(c, x, 0.52 * s, 0, 0.045, 0.012, 8, 3); } },
  "weapon-rack"(c, p, det) { const w = p.w; paint(c, FURN, DARKW); for (const x of [-w / 2 + 0.05, w / 2 - 0.05]) BX(c, x - 0.04, 0, -0.15, x + 0.04, p.h, -0.08); BX(c, -w / 2, 0.15, -0.18, w / 2, 0.22, 0.12); BX(c, -w / 2, 1.3, -0.15, w / 2, 1.38, -0.05); BX(c, -w / 2, 0.15, 0.05, w / 2, 0.3, 0.12);
    if (det >= 3) return; for (let i = 0; i < 4; i++) { const x = -w / 2 + 0.25 + i * (w - 0.5) / 3; if (i % 2) { paint(c, FURN, FW); SEG(c, [x, 0.22, 0.08], [x, 1.75, -0.1], 0.035); flatc(c, IRONC); PIPE(c, [x, 1.72, -0.1], [x, 1.98, -0.13], 0.035, 0.002, 6); }
      else { flatc(c, "oklch(0.82 0.01 250)"); RB(c, x, 0.85, 0.06, 0.05, 1.0, 0.008, 0, -6); flatc(c, IRONB); RB(c, x, 0.32, 0.075, 0.22, 0.03, 0.04, 0, -6); flatc(c, "oklch(0.35 0.05 50)"); RB(c, x, 0.21, 0.085, 0.03, 0.18, 0.03, 0, -6); } }
    flatc(c, CRIMSON); LA(c, 0, 1.05, -0.06, [[0.3, 0], [0.3, 0.03]], 14, true, "z"); flatc(c, GOLD); LA(c, 0, 1.05, -0.03, [[0.07, 0], [0.04, 0.04]], 10, true, "z"); TORUS(c, 0, 1.05, -0.04, 0.29, 0.015, 16, 4, "z"); },
  rug(c, p) { const w = p.w, d = p.d; flatc(c, GOLD); BX(c, -w / 2, 0, -d / 2, w / 2, 0.012, d / 2); flatc(c, CRIMSON); BX(c, -w / 2 + 0.1, 0.012, -d / 2 + 0.1, w / 2 - 0.1, 0.016, d / 2 - 0.1); flatc(c, "oklch(0.32 0.1 25)"); BX(c, -w / 2 + 0.3, 0.016, -d / 2 + 0.3, w / 2 - 0.3, 0.019, d / 2 - 0.3); flatc(c, GOLD); RB(c, 0, 0.0195, 0, Math.min(w, d) * 0.3, 0.002, Math.min(w, d) * 0.3, 45);
    flatc(c, LINEN); for (let x = -w / 2 + 0.05; x < w / 2; x += 0.08) for (const s of [-1, 1]) BX(c, x - 0.012, 0, s * d / 2, x + 0.012, 0.008, s * (d / 2 + 0.07)); },
  banner(c, p) { const h = p.roomH ?? 3, t = h - 0.35; paint(c, FURN, DARKW); PIPE(c, [-0.6, t, -0.02], [0.6, t, -0.02], 0.025, 0.025, 6); flatc(c, GOLD); for (const s of [-1, 1]) LA(c, s * 0.62, t, -0.02, [[0.04, 0], [0, 0.05]], 6, false, "x");
    flatc(c, CRIMSON); const b = t - 1.9; c.quad(-0.5, t, 0, 0.5, t, 0, 0.5, b + 0.2, 0, -0.5, b + 0.2, 0); c.tri(-0.5, b + 0.2, 0, 0.5, b + 0.2, 0, 0, b, 0); flatc(c, GOLD); c.quad(-0.45, t - 0.1, 0.004, 0.45, t - 0.1, 0.004, 0.45, t - 0.16, 0.004, -0.45, t - 0.16, 0.004);
    RB(c, 0, t - 0.85, 0.006, 0.36, 0.36, 0.004, 0, 0, 45); flatc(c, CRIMSON); RB(c, 0, t - 0.85, 0.009, 0.2, 0.2, 0.004, 0, 0, 45); },
  "candle-stand"(c, p, det) { flatc(c, IRONB); for (let i = 0; i < 3; i++) { const a = i * 2.094; SEG(c, [0, 0.25, 0], [Math.cos(a) * 0.2, 0, Math.sin(a) * 0.2], 0.025); } PIPE(c, [0, 0.2, 0], [0, 1.35, 0], 0.018, 0.014, 6); LA(c, 0, 1.33, 0, [[0.03, 0], [0.16, 0.03], [0.17, 0.05]], 10, false);
    for (let i = 0; i < 3; i++) { const a = i * 2.094 + 0.5; candle(c, Math.cos(a) * 0.09, 1.36, Math.sin(a) * 0.09, det); } },
  bed(c, p, det) { const w = p.w, d = p.d; paint(c, FURN, DARKW); for (const [x, z, hh] of [[-1, -1, 1.15], [1, -1, 1.15], [1, 1, 0.75], [-1, 1, 0.75]]) BX(c, x * w / 2 - 0.05 * (x + 1) / 1, 0, z * d / 2 - 0.05 * (z + 1), x * w / 2 - 0.05 * (x + 1) + 0.1 * (x < 0 ? 1 : 1), hh, z * d / 2 - 0.05 * (z + 1) + 0.1);
    BX(c, -w / 2, 0.55, -d / 2, w / 2, 1.05, -d / 2 + 0.06); BX(c, -w / 2, 0.45, d / 2 - 0.06, w / 2, 0.7, d / 2); BX(c, -w / 2, 0.22, -d / 2, -w / 2 + 0.06, 0.38, d / 2); BX(c, w / 2 - 0.06, 0.22, -d / 2, w / 2, 0.38, d / 2);
    paint(c, HAY, "oklch(0.95 0.03 85)"); BX(c, -w / 2 + 0.06, 0.32, -d / 2 + 0.06, w / 2 - 0.06, 0.48, d / 2 - 0.06);
    flatc(c, LINEN); LA(c, 0, 0.56, -d / 2 + 0.28, [[0.08, -w * 0.35], [0.11, -w * 0.25], [0.11, w * 0.25], [0.08, w * 0.35]], 10, true, "x");
    flatc(c, CRIMSON); BX(c, -w / 2 + 0.03, 0.47, -d / 2 + 0.6, w / 2 - 0.03, 0.55, d / 2 - 0.08); BX(c, -w / 2 + 0.02, 0.3, -d / 2 + 0.6, -w / 2 + 0.05, 0.55, d / 2 - 0.08); BX(c, w / 2 - 0.05, 0.3, -d / 2 + 0.6, w / 2 - 0.02, 0.55, d / 2 - 0.08); flatc(c, GOLD); BX(c, -w / 2 + 0.03, 0.55, -d / 2 + 0.6, w / 2 - 0.03, 0.556, -d / 2 + 0.7); },
  bunk(c, p, det) { const w = p.w, d = p.d; paint(c, FURN, DARKW); legs(c, w, d, p.h, 0.08, 0.04); for (const y of [0.3, 1.15]) { BX(c, -w / 2, y, -d / 2, w / 2, y + 0.1, -d / 2 + 0.05); BX(c, -w / 2, y, d / 2 - 0.05, w / 2, y + 0.1, d / 2); BX(c, -w / 2, y, -d / 2, -w / 2 + 0.05, y + 0.1, d / 2); BX(c, w / 2 - 0.05, y, -d / 2, w / 2, y + 0.1, d / 2);
      paint(c, HAY, "oklch(0.92 0.03 85)"); BX(c, -w / 2 + 0.05, y + 0.08, -d / 2 + 0.05, w / 2 - 0.05, y + 0.2, d / 2 - 0.05); flatc(c, LEAD); BX(c, -w / 2 + 0.04, y + 0.2, -d / 2 + 0.55, w / 2 - 0.04, y + 0.25, d / 2 - 0.05); flatc(c, LINEN); BX(c, -w / 2 + 0.15, y + 0.2, -d / 2 + 0.1, w / 2 - 0.15, y + 0.3, -d / 2 + 0.45); paint(c, FURN, DARKW); }
    for (let i = 0; i < 4; i++) BX(c, w / 2 - 0.05, 0.5 + i * 0.22, d / 2 - 0.35, w / 2 + 0.01, 0.54 + i * 0.22, d / 2 - 0.05); },
};

// ---------- draw ----------
export function drawPiece(c, it, det, trade) { const f = PIECES[it.piece]; if (!f) return; const m = moved(c, it.x, it.y, it.z, it.rot); f(m, { ...it, trade }, det);
  if (it.chairs) { const pw = it.piece === "round-table" ? 0 : it.w; for (let k = 0; k < it.chairs; k++) { let lx, lz, r;
      if (it.piece === "round-table") { const a = k / it.chairs * 6.283 + 0.4; lx = Math.sin(a) * 0.78; lz = Math.cos(a) * 0.78; r = [2, 3, 0, 1][Math.round(((a % 6.283) / 1.5708)) % 4]; }
      else { const per = Math.ceil(it.chairs / 2), side = k < per ? 1 : -1, j = k < per ? k : k - per, cnt = side > 0 ? per : it.chairs - per; lx = -pw / 2 + (j + 0.5) * pw / cnt; lz = side * (it.d / 2 + 0.3); r = side > 0 ? 2 : 0; }
      const [wx, wz] = it.rot === 0 ? [lx, lz] : it.rot === 1 ? [lz, -lx] : it.rot === 2 ? [-lx, -lz] : [-lz, lx];
      const mm = moved(c, it.x + wx, it.y, it.z + wz, (r + it.rot) % 4); PIECES.chair(mm, D.pieces.chair, det); } } }

const MAT = (c, id) => { const m = D.materials[id] ?? D.materials.plaster; paint(c, m.tex, m.tint); };
function frontWall(c, L, y, h, hole) { const t = L.T, { x0, x1 } = L; if (!hole) return BX(c, x0 - t, y, 0, x1 + t, y + h, t); const hw = D.walls.door[0] / 2, dh = D.walls.door[1];
  BX(c, x0 - t, y, 0, -hw, y + h, t); BX(c, hw, y, 0, x1 + t, y + h, t); BX(c, -hw, y + dh, 0, hw, y + h, t); }
function innerWall(c, L, w) { const t = 0.2, a = L.x0, b = L.x1, z = w.z, y = w.y, h = w.h; let x = a; const gaps = [...w.gaps]; if (w.cutTo < b - 0.21) gaps.push([w.cutTo, b]);
  gaps.sort((p, q) => p[0] - q[0]); for (const [g0, g1] of gaps) { if (g0 > x) BX(c, x, y, z - t / 2, g0, y + h, z + t / 2); if (g1 < b) BX(c, g0, y + (g1 >= b - 0.01 ? h : w.doorH), z - t / 2, g1, y + h, z + t / 2); x = g1; } if (x < b) BX(c, x, y, z - t / 2, b, y + h, z + t / 2); }
function slabRects(L) { const st = L.stair, { x0, x1, d } = L; if (!st) return [[x0, -d, x1, 0]]; return [[x0, -d, st.sx0, 0], [st.sx0, -d, x1, st.zt], [st.sx0, st.zb, x1, 0]]; }
// the whole interior as faces on c
export function draw(c, P, det = 1) {
  const L = typeof P.recipe === "string" && P.rooms ? P : layout(P), t = L.T, { x0, x1, d, H, S } = L, st = L.stair;
  const off = (lv) => L.cut && lv ? [L.w + 3, -(H + S), 0] : [0, 0, 0];
  for (const lv of L.two ? [0, 1] : [0]) { const [ox, oy] = off(lv), c2 = moved(c, ox, oy, 0, 0), rooms = L.rooms.filter((r) => r.level === lv), y = lv ? H + S : 0, h = lv ? L.UH : H;
    // floors, by room material
    for (const r of rooms) { MAT(c2, r.def.floor); const rects = lv ? slabRects(L).map(([a, b, cc, e]) => [Math.max(a, r.x0), Math.max(b, r.zb), Math.min(cc, r.x1), Math.min(e, r.zf)]).filter(([a, b, cc, e]) => cc > a + 0.01 && e > b + 0.01) : [[r.x0, r.zb, r.x1, r.zf]];
      for (const [a, b, cc, e] of rects) BX(c2, a, y - (lv ? S : 0.3), b, cc, y, e); }
    // outer walls per room (material), skirting, posts
    for (const r of rooms) { MAT(c2, r.def.wall); const top = y + h + (lv || !L.two ? 0.25 : S);
      BX(c2, x0 - t, y, r.zb - (r.zb <= -d + 0.01 ? t : 0), x0, top, r.zf + (r.i ? 0 : t)); BX(c2, x1, y, r.zb - (r.zb <= -d + 0.01 ? t : 0), x1 + t, top, r.zf + (r.i ? 0 : t));
      if (r.zb <= -d + 0.01) BX(c2, x0, y, -d - t, x1, top, -d);
      if (!r.i && !L.cut) frontWall(c2, L, y, top - y, lv === 0);
      paint(c2, FURN, DARKW); BX(c2, x0, y, r.zb, x0 + 0.03, y + 0.14, r.zf); BX(c2, x1 - 0.03, y, r.zb, x1, y + 0.14, r.zf); if (r.zb <= -d + 0.01) BX(c2, x0, y, -d, x1, y + 0.14, -d + 0.03);
      if (r.def.wall === "plaster" && det < 3) { for (const x of [x0, x1 - 0.18]) for (const z of [r.zf - 0.18, r.zb + 0.0]) BX(c2, x, y, z, x + 0.18, y + h, z + 0.18); BX(c2, x0, y + h - 0.2, r.zb, x0 + 0.12, y + h, r.zf); BX(c2, x1 - 0.12, y + h - 0.2, r.zb, x1, y + h, r.zf); } }
    // inner walls with doorways (+ oak door frames)
    for (const w of L.walls.filter((q) => q.level === lv)) { const r = rooms.find((q) => Math.abs(q.zb - w.z) < 0.01); MAT(c2, r?.def.wall ?? "plaster"); innerWall(c2, L, w);
      paint(c2, FURN, DARKW); for (const [g0, g1] of w.gaps) { BX(c2, g0 - 0.08, y, w.z - 0.13, g0, y + w.doorH, w.z + 0.13); BX(c2, g1, y, w.z - 0.13, g1 + 0.08, y + w.doorH, w.z + 0.13); BX(c2, g0 - 0.08, y + w.doorH, w.z - 0.13, g1 + 0.08, y + w.doorH + 0.12, w.z + 0.13); } }
    // the entrance door frame
    if (lv === 0 && !L.cut) { paint(c2, FURN, DARKW); const hw = D.walls.door[0] / 2, dh = D.walls.door[1]; BX(c2, -hw - 0.12, 0, -0.04, -hw, dh, 0.02); BX(c2, hw, 0, -0.04, hw + 0.12, dh, 0.02); BX(c2, -hw - 0.12, dh, -0.04, hw + 0.12, dh + 0.14, 0.02); }
    // ceiling + joists
    if (!L.cut) { const cy = y + h; paint(c2, FURN, FW); BX(c2, x0 - t, cy, -d - t, x1 + t, cy + 0.06, t); paint(c2, FURN, DARKW); if (det < 3) for (let z = -0.6; z > -d + 0.3; z -= 1.15) { if (lv === 0 && st && z < st.zb && z > st.zt) { BX(c2, x0, cy - 0.2, z - 0.08, st.sx0, cy, z + 0.08); continue; } BX(c2, x0, cy - 0.2, z - 0.08, x1, cy, z + 0.08); } }
    if (lv === 0 && st && !L.cut) { paint(c2, FURN, DARKW); BX(c2, st.sx0 - 0.12, H - 0.2, st.zt, st.sx0, H, st.zb); }
    // windows: oak frame, sill, mullions, a glowing pane of day
    const W = D.window; for (const wi of L.windows.filter((q) => q.level === lv)) { const n = wi.side === "left" ? 1 : wi.side === "right" ? -1 : 0, s0 = y + W.sill, s1 = s0 + W.h;
      const box = (u0, v0, u1, v1, e0, e1) => wi.side === "back" ? BX(c2, wi.x + u0, v0, wi.z + e0, wi.x + u1, v1, wi.z + e1) : BX(c2, wi.x + n * e0, v0, wi.z + u0, wi.x + n * e1, v1, wi.z + u1);
      glow(c2, W.glass, [1.1, 1.0, 0.75]); box(-W.w / 2, s0, W.w / 2, s1, 0.005, 0.015); paint(c2, FURN, DARKW); box(-W.w / 2 - 0.08, s0 - 0.06, W.w / 2 + 0.08, s0, 0, 0.12); box(-W.w / 2 - 0.08, s1, W.w / 2 + 0.08, s1 + 0.08, 0, 0.06);
      box(-W.w / 2 - 0.08, s0, -W.w / 2, s1, 0, 0.06); box(W.w / 2, s0, W.w / 2 + 0.08, s1, 0, 0.06); box(-0.02, s0, 0.02, s1, 0, 0.04); box(-W.w / 2, s0 + W.h * 0.5 - 0.02, W.w / 2, s0 + W.h * 0.5 + 0.02, 0, 0.04); }
    // furniture
    for (const it of L.items.filter((q) => q.level === lv)) if (det < 4 || !D.pieces[it.piece].walk) drawPiece(c2, { ...it, y: it.y }, det, L.trade);
    // the upper floor's rail round the stairwell
    if (lv === 1 && st) { paint(c2, FURN, DARKW); const yy = y; SEG(c2, [st.sx0, yy + 0.95, st.zt], [st.sx0, yy + 0.95, st.zb], 0.07); SEG(c2, [st.sx0, yy + 0.95, st.zb], [x1, yy + 0.95, st.zb], 0.07);
      for (let z = st.zt; z <= st.zb + 0.01; z += 0.3) BX(c2, st.sx0 - 0.025, yy, z - 0.025, st.sx0 + 0.025, yy + 0.95, z + 0.025); for (let x = st.sx0 + 0.3; x < x1; x += 0.3) BX(c2, x - 0.025, yy, st.zb - 0.025, x + 0.025, yy + 0.95, st.zb + 0.025); } }
  // the stair: solid oak flight, nosed treads, a handrail on its open side
  if (st) { for (let k = 0; k < st.n; k++) { const zf = st.zb - k * st.tread, y1 = (k + 1) * st.rise; paint(c, FURN, DARKW); BX(c, st.sx0, Math.max(0, y1 - 0.5), zf - st.tread, st.sx1, y1 - 0.04, zf); paint(c, FURN, FW); BX(c, st.sx0, y1 - 0.04, zf - st.tread, st.sx1, y1, zf + 0.025); }
    paint(c, FURN, DARKW); const r0 = [st.sx0 + 0.04, 0.95 + st.rise, st.zb], r1 = [st.sx0 + 0.04, 0.95 + st.n * st.rise, st.zt]; SEG(c, r0, r1, 0.06); for (let k = 0; k < st.n; k += 2) { const z = st.zb - (k + 0.5) * st.tread, yb = (k + 1) * st.rise; BX(c, st.sx0 + 0.02, yb, z - 0.02, st.sx0 + 0.06, yb + 0.95, z + 0.02); }
    PIPE(c, [st.sx0 + 0.04, 0, st.zb + 0.02], [st.sx0 + 0.04, 1.2, st.zb + 0.02], 0.05, 0.05, 6); }
  return L;
}
// the shell a body touches: floors, walls (doorways open), upper slab round the stairwell, the stair as a ramp, every standing piece
export function collide(c, P) {
  const L = layout(P), t = L.T, { x0, x1, d, H, S } = L, st = L.stair;
  const off = (lv) => L.cut && lv ? [L.w + 3, -(H + S)] : [0, 0];
  for (const lv of L.two ? [0, 1] : [0]) { const [ox, oy] = off(lv), c2 = moved(c, ox, oy, 0, 0), y = lv ? H + S : 0, h = lv ? L.UH : H;
    if (lv === 0) BX(c2, x0 - t, -0.3, -d - t, x1 + t, 0, t); else for (const [a, b, cc, e] of slabRects(L)) BX(c2, a, y - S, b, cc, y, e);
    BX(c2, x0 - t, y, -d - t, x0, y + h + 0.3, t); BX(c2, x1, y, -d - t, x1 + t, y + h + 0.3, t); BX(c2, x0, y, -d - t, x1, y + h + 0.3, -d);
    if (!L.cut) { BX(c2, x0, y, 0, x1, y + h + 0.3, t); BX(c2, x0 - t, y + h, -d - t, x1 + t, y + h + 0.3, t); }
    for (const w of L.walls.filter((q) => q.level === lv)) innerWall(c2, L, w);
    if (lv === 1 && st) { BX(c2, st.sx0 - 0.05, y, st.zt, st.sx0, y + 1.0, st.zb); BX(c2, st.sx0, y, st.zb, x1, y + 1.0, st.zb + 0.05); }
    for (const it of L.items.filter((q) => q.level === lv && !q.walk)) { const sw = it.rot % 2 ? it.d : it.w, sd = it.rot % 2 ? it.w : it.d, hh = it.piece === "hearth" || it.piece === "forge" || it.piece === "stove" ? it.roomH : Math.min(it.h, 2.2);
      BX(c2, it.x - sw / 2, y, it.z - sd / 2, it.x + sw / 2, y + hh, it.z + sd / 2); } }
  if (st) { const top = st.n * st.rise; c.quad(st.sx0, 0, st.zb, st.sx1, 0, st.zb, st.sx1, top, st.zt, st.sx0, top, st.zt);
  }
  return L;
}
