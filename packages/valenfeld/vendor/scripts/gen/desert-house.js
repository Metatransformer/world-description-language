// A SUNSCAR HOUSE: battered mudbrick walls on a sandstone plinth, flat roof behind a parapet with rounded
// corner merlons, protruding palm-beam vigas, lattice windows, a closed teal plank door under a striped
// cloth awning. params: w, d, h, doorX, awn ("red" | "ochre"), tone, two (a rooftop room), stair (+1/-1 side
// steps to the roof, walkable), side (+1/-1 a second awning on that side). Front is -z.
import { TX, TINT, paint, flatc, glow, HX, BX, LA, CY, CB, AWN, POT, frame } from "../lib/desert-kit.js";
const DOOR = "oklch(0.5 0.075 215)", DOOR2 = "oklch(0.42 0.06 215)";
function dims(p) { const w = p.w ?? 8, d = p.d ?? 7, h = p.h ?? 3.4, b = 0.12; return { w, d, h, hw: w / 2, hd: d / 2, b, e: w / 2 - b, f: d / 2 - b, ph: 0.55, pt: 0.28 }; }
function stairs(p, k) { const n = Math.ceil(k.h / 0.27), rise = k.h / n, z0 = -k.hd + 0.5, s = p.stair; const out = [];
  for (let i = 0; i < n; i++) out.push([s > 0 ? k.hw : -k.hw - 1.0, s > 0 ? k.hw + 1.0 : -k.hw, z0 + i * 0.3, z0 + i * 0.3 + 0.3, (i + 1) * rise]);
  return { out, zTop: z0 + n * 0.3 - 0.15 }; }
function parapets(p, k, emit) {
  const { e, f, h, ph, pt } = k, y1 = h + ph; emit(-e, h, -f, e, y1, -f + pt); emit(-e, h, f - pt, e, y1, f);
  for (const s of [-1, 1]) { const x0 = s < 0 ? -e : e - pt, x1 = s < 0 ? -e + pt : e;
    if (p.stair === s) { const z = stairs(p, k).zTop; emit(x0, h, -f + pt, x1, y1, z - 0.55); emit(x0, h, z + 0.55, x1, y1, f - pt); } else emit(x0, h, -f + pt, x1, y1, f - pt); }
}
export function geometry(c) {
  const p = c.params, D = c.lod, k = dims(p), { w, d, h, hw, hd, b, e, f, ph, pt } = k, dx = p.doorX ?? 0;
  const A = p.awn === "ochre" ? TX.ochre : TX.red, B = A === TX.red ? TX.ochre : TX.red, tone = typeof p.tone === "string" ? p.tone : ["oklch(0.95 0.03 55)", "oklch(0.93 0.045 45)", "oklch(0.96 0.025 75)"][(p.tone ?? 0) % 3];
  if (D >= 5) { paint(c, TX.mud, tone); BX(c, -hw, -0.6, -hd, hw, h + 0.5, hd); if (p.two) BX(c, -hw * 0.55, h, -hd * 0.3, hw * 0.45, h + 2.6, hd * 0.75); paint(c, A, TINT.cloth); BX(c, dx - 1.6, 2.2, -hd - 1.6, dx + 1.6, 2.3, -hd); return; }
  const zAt = (y, half = hd) => -half + b * Math.max(0, y - 0.35) / (h - 0.35);
  paint(c, TX.sand, TINT.stone); BX(c, -hw - 0.12, -0.6, -hd - 0.12, hw + 0.12, 0.35, hd + 0.12);
  paint(c, TX.mud, tone);
  HX(c, [[-hw, 0.35, -hd], [hw, 0.35, -hd], [hw, 0.35, hd], [-hw, 0.35, hd], [-e, h, -f], [e, h, -f], [e, h, f], [-e, h, f]]);
  if (D <= 3) parapets(p, k, (...a) => BX(c, ...a)); else BX(c, -e, h, -f, e, h + ph, f);
  if (D <= 2) { // coping and the rounded corner merlons
    paint(c, TX.sand, "oklch(0.93 0.015 70)"); const y = h + ph;
    parapets(p, k, (x0, y0, z0, x1, y1, z1) => BX(c, x0 - 0.03, y, z0 - 0.03, x1 + 0.03, y + 0.06, z1 + 0.03));
    paint(c, TX.mud, tone); for (const sx of [-1, 1]) for (const sz of [-1, 1]) LA(c, sx * (e - pt / 2), y, sz * (f - pt / 2), [[0.24, 0], [0.22, 0.2], [0.12, 0.42], [0, 0.5]], 8, false);
    // vigas: palm-beam ends through the front and back walls, and two drain spouts
    paint(c, TX.oak, "oklch(0.86 0.03 60)");
    for (let x = -e + 0.6; x <= e - 0.5; x += 0.95) { LA(c, x, h - 0.3, -f + 0.1, [[0.085, 0], [0.085, -0.42]], 7, true, "z"); LA(c, x, h - 0.3, f - 0.1, [[0.085, 0], [0.085, 0.42]], 7, true, "z"); }
    for (const sx of [-1, 1]) BX(c, sx * (e + 0.5) - 0.09, h + 0.02, f * 0.3 - 0.09, sx * (e - 0.1) + 0.09, h + 0.16, f * 0.3 + 0.09);
  }
  // windows on any face: a recess, sandstone sill and lintel, a lattice
  const win = (face, u, y0, y1, lit, ww = 0.75) => {
    const yaw = { "-z": 0, "+z": 180, "-x": 90, "+x": -90 }[face], half = face[1] === "z" ? hd : hw;
    frame([0, 0, 0], yaw, () => { const z = zAt((y0 + y1) / 2, half);
      if (lit) glow(c, "#2a2016", [0.55, 0.32, 0.1]); else flatc(c, "#1f1913");
      BX(c, u - ww / 2, y0, z - 0.02, u + ww / 2, y1, z + 0.04);
      if (D <= 3) { paint(c, TX.sand, "oklch(0.93 0.015 70)"); BX(c, u - ww / 2 - 0.12, y0 - 0.1, z - 0.12, u + ww / 2 + 0.12, y0, z + 0.06); BX(c, u - ww / 2 - 0.15, y1, z - 0.1, u + ww / 2 + 0.15, y1 + 0.14, z + 0.06); }
      if (D <= 2) { paint(c, TX.oak, "oklch(0.82 0.03 55)"); const n = 4;
        for (let i = 1; i < n; i++) { const x = u - ww / 2 + ww * i / n; BX(c, x - 0.022, y0, z - 0.05, x + 0.022, y1, z - 0.01); }
        for (let i = 1; i < 5; i++) { const y = y0 + (y1 - y0) * i / 5; BX(c, u - ww / 2, y - 0.022, z - 0.05, u + ww / 2, y + 0.022, z - 0.01); } } }); };
  const wy0 = 1.35, wy1 = Math.min(2.35, h - 0.7);
  for (const u of [-hw * 0.55, hw * 0.55]) if (Math.abs(u - dx) > 1.5) win("-z", u, wy0, wy1, u > 0);
  win("+z", -hw * 0.35, wy0, wy1, false); win("+z", hw * 0.4, wy0, wy1, true);
  win("-x", 0, wy0, wy1, false); if (!p.stair) win("+x", 0.3, wy0, wy1, true);
  // the door: sandstone jambs and lintel, teal planks, iron, a step
  const zd = zAt(1.4);
  paint(c, TX.sand, "oklch(0.93 0.015 70)");
  if (D <= 3) { BX(c, dx - 0.86, 0.35, zd - 0.12, dx - 0.64, 2.55, zd + 0.1); BX(c, dx + 0.64, 0.35, zd - 0.12, dx + 0.86, 2.55, zd + 0.1); BX(c, dx - 0.98, 2.55, zd - 0.14, dx + 0.98, 2.85, zd + 0.1); }
  BX(c, dx - 0.95, -0.1, zd - 0.65, dx + 0.95, 0.33, zd - 0.05);
  flatc(c, DOOR); BX(c, dx - 0.64, 0.35, zd - 0.02, dx + 0.64, 2.55, zd + 0.06);
  if (D <= 2) { flatc(c, DOOR2); for (let i = 1; i < 5; i++) { const x = dx - 0.64 + 1.28 * i / 5; BX(c, x - 0.015, 0.4, zd - 0.04, x + 0.015, 2.5, zd); }
    paint(c, TX.iron, TINT.iron); for (const y of [0.6, 2.1]) BX(c, dx - 0.6, y, zd - 0.06, dx + 0.5, y + 0.07, zd - 0.02);
    LA(c, dx + 0.4, 1.2, zd - 0.06, [[0.07, 0], [0.07, -0.02]], 10, true, "z"); }
  AWN(c, dx - 1.7, dx + 1.7, zAt(2.8), 1.8, 2.85, 2.35, A, B, D);
  if (p.side) frame([0, 0, 0], p.side > 0 ? -90 : 90, () => AWN(c, -1.6, 1.6, zAt(2.7, hw), 1.5, 2.7, 2.25, B, A, D));
  // the rooftop room and its cloth shade
  if (p.two) { const ux0 = -e + pt, ux1 = w * 0.08, uz0 = -f * 0.1, uz1 = f - pt, H = h + 2.5;
    paint(c, TX.mud, "oklch(0.93 0.035 60)"); BX(c, ux0, h, uz0, ux1, H, uz1);
    if (D <= 3) { BX(c, ux0 - 0.05, H, uz0 - 0.05, ux1 + 0.05, H + 0.35, uz1 + 0.05); flatc(c, DOOR); BX(c, ux1 - 1.6, h, uz0 - 0.04, ux1 - 0.6, h + 2.0, uz0); }
    if (D <= 2) { glow(c, "#2a2016", [0.5, 0.3, 0.1]); BX(c, ux0 + 0.8, h + 1.0, uz0 - 0.04, ux0 + 1.4, h + 1.7, uz0);
      AWN(c, ux1 + 0.3, e - pt - 0.1, uz1 - 0.1, uz1 - 0.1 - (-f + pt + 0.3), h + 2.25, h + 2.0, B, A, D, { base: h, back: true });
      POT(c, -e + pt + 0.4, h, -f + pt + 0.4, 0.75, D); POT(c, -e + pt + 0.95, h, -f + pt + 0.35, 0.6, D, "oklch(0.9 0.04 45)"); }
  } else if (D <= 2) { POT(c, e - pt - 0.45, h, f - pt - 0.45, 0.7, D); paint(c, TX.red, TINT.cloth); LA(c, -e + pt + 0.3, h + 0.17, f - pt - 0.5, [[0.17, 0], [0.17, 1.8]], 8, true, "x"); }
  if (p.stair) { paint(c, TX.mud, tone); for (const [x0, x1, z0, z1, y] of stairs(p, k).out) BX(c, x0, 0, z0, x1, y, z1);
    if (D <= 2) { paint(c, TX.sand, "oklch(0.93 0.015 70)"); for (const [x0, x1, z0, z1, y] of stairs(p, k).out) BX(c, x0 - 0.03, y, z0, x1 + 0.03, y + 0.05, z1); } }
  if (D <= 2) { POT(c, dx + 1.35, 0, zd - 0.45, 0.8, D); POT(c, dx + 1.85, 0, zd - 0.3, 0.55, D, "oklch(0.9 0.04 45)"); }
}
export function collider(c) {
  const p = c.params, k = dims(p), L = CB(); L(-k.hw, -0.6, -k.hd, k.hw, k.h, k.hd); parapets(p, k, L);
  if (p.two) L(-k.e + k.pt, k.h, -k.f * 0.1, k.w * 0.08, k.h + 2.85, k.f - k.pt);
  if (p.stair) for (const [x0, x1, z0, z1, y] of stairs(p, k).out) L(x0, 0, z0, x1, y, z1);
  return L.list;
}
