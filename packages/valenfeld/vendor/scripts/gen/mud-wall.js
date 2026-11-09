// A SUNSCAR TOWN WALL: a battered mudbrick ring on a sandstone footing, rounded merlons, buttresses, and
// gates cut where params.gates say: { a: degrees (atan2(z, x) from the centre), w: opening, big: pylon
// gate with a pointed arch, banners, lanterns and open teal leaves; else a lintel gate }.
// params: r (centre-line radius), h, gates. Origin at the town's centre.
import { TX, TINT, paint, flatc, glow, HX, BX, LA, CY, ARCHFILL, frame, tri } from "../lib/desert-kit.js";
const MUD = "oklch(0.93 0.035 50)", SAND = "oklch(0.94 0.02 68)";
const P = (a, r, y) => [Math.cos(a) * r, y, Math.sin(a) * r];
function open(p, a) { const r = p.r ?? 56; for (const g of p.gates ?? []) { let d = a - g.a * Math.PI / 180; d = Math.atan2(Math.sin(d), Math.cos(d)); if (Math.abs(d) < (g.w / 2 + (g.big ? 1.6 : 1.2)) / r) return true; } return false; }
function seg(c, a0, a1, r, y0, y1, bi, bo, ti, to) { HX(c, [P(a0, r - bi, y0), P(a1, r - bi, y0), P(a1, r + bo, y0), P(a0, r + bo, y0), P(a0, r - ti, y1), P(a1, r - ti, y1), P(a1, r + to, y1), P(a0, r + to, y1)]); }
function gate(c, g, D, coll) {
  const w = g.w, hw = w / 2, big = !!g.big, py = big ? 5.4 : 3.8, pw = big ? 1.6 : 1.2;
  if (!coll) paint(c, TX.sand, SAND);
  for (const s of [-1, 1]) { const x0 = s < 0 ? -hw - pw : hw, x1 = s < 0 ? -hw : hw + pw, k = 0.15;
    HX(c, [[x0, -0.5, -1.0], [x1, -0.5, -1.0], [x1, -0.5, 1.0], [x0, -0.5, 1.0], [x0 + (s < 0 ? k : 0), py, -1.0 + k], [x1 - (s > 0 ? k : 0), py, -1.0 + k], [x1 - (s > 0 ? k : 0), py, 1.0 - k], [x0 + (s < 0 ? k : 0), py, 1.0 - k]]); }
  if (big) { if (coll) BX(c, -hw, 3.6, -0.85, hw, py, 0.85); else ARCHFILL(c, hw, 3.5, 4.7, py, -0.85, 0.85, D <= 2 ? 12 : 4); }
  else BX(c, -hw - 0.2, 3.25, -0.8, hw + 0.2, 3.8, 0.8);
  if (coll || D > 3) return;
  for (let x = -hw - pw + 0.1; x < hw + pw - 0.4; x += 0.85) { paint(c, TX.mud, MUD); BX(c, x, py, -0.75, x + 0.5, py + 0.45, 0.75); }
  if (!big || D > 2) return;
  paint(c, TX.tile, TINT.white); BX(c, -hw - 0.3, 4.85, 0.85, hw + 0.3, 5.1, 0.89); BX(c, -hw - 0.3, 4.85, -0.89, hw + 0.3, 5.1, -0.85);
  for (const s of [-1, 1]) { const x = s * (hw + pw / 2);
    // a faded red banner on the outer face, notched at the foot
    paint(c, TX.red, TINT.cloth); BX(c, x - 0.45, 1.9, 0.88, x + 0.45, 4.6, 0.9);
    tri(c, [x - 0.45, 1.9, 0.9], [x, 2.25, 0.9], [x - 0.45, 1.5, 0.9]); tri(c, [x + 0.45, 1.9, 0.9], [x + 0.45, 1.5, 0.9], [x, 2.25, 0.9]);
    paint(c, TX.oak, TINT.wood); LA(c, x - 0.55, 4.62, 0.95, [[0.04, 0], [0.04, 1.1]], 6, true, "x");
    // an iron lantern on the inner face
    paint(c, TX.iron, TINT.iron); BX(c, x - 0.04, 3.3, -1.55, x + 0.04, 3.38, -0.85); BX(c, x - 0.15, 2.75, -1.65, x + 0.15, 2.8, -1.35); LA(c, x, 3.12, -1.5, [[0.2, 0], [0, 0.18]], 4, false);
    glow(c, "#4a3218", [2.2, 1.2, 0.4]); BX(c, x - 0.12, 2.8, -1.62, x + 0.12, 3.12, -1.38);
    // the open gate leaf, swung in against the pylon line
    flatc(c, "oklch(0.5 0.075 215)"); BX(c, s * hw - (s > 0 ? 0.12 : 0), 0, -1.0 - hw + 0.1, s * hw + (s < 0 ? 0.12 : 0), 3.4, -1.0);
    paint(c, TX.iron, TINT.iron); for (const y of [0.5, 2.8]) BX(c, s * hw - (s > 0 ? 0.15 : 0.03) * 1 + (s < 0 ? 0.12 : 0) - (s < 0 ? 0.12 : 0), y, -1.0 - hw + 0.15, s * hw + (s < 0 ? 0.15 : 0.03), y + 0.1, -1.05);
  }
}
const gyaw = (a) => Math.atan2(Math.cos(a), Math.sin(a)) * 180 / Math.PI;
export function geometry(c) {
  const p = c.params, D = c.lod, r = p.r ?? 56, h = p.h ?? 2.8, N = D <= 2 ? 150 : D <= 3 ? 100 : D <= 4 ? 60 : 28;
  for (let i = 0; i < N; i++) { const a0 = i / N * 6.2832, a1 = (i + 1) / N * 6.2832, am = (a0 + a1) / 2; if (open(p, am)) continue;
    if (D <= 2) { paint(c, TX.sand, SAND); seg(c, a0, a1, r, -0.4, 0.45, 0.62, 0.62, 0.58, 0.58); }
    paint(c, TX.mud, MUD); seg(c, a0, a1, r, D <= 2 ? 0.45 : -0.4, h, 0.55, 0.55, 0.38, 0.38);
    if (D <= 2) { if (i % 2 === 0) { const b0 = a0 + (a1 - a0) * 0.18, b1 = a1 - (a1 - a0) * 0.18; seg(c, b0, b1, r, h, h + 0.4, 0.3, 0.3, 0.26, 0.26); seg(c, b0 + 0.002, b1 - 0.002, r, h + 0.4, h + 0.55, 0.22, 0.22, 0.12, 0.12); } }
    else if (D <= 3) seg(c, a0, a1, r, h, h + 0.3, 0.3, 0.3, 0.3, 0.3);
    if (D <= 3 && i % 10 === 5) { paint(c, TX.mud, MUD); seg(c, a0 - 0.004, a1 + 0.004, r + 0.4, -0.4, h + 0.5, 0.2, 0.75, 0.2, 0.3); if (D <= 2) { paint(c, TX.sand, SAND); seg(c, a0 - 0.005, a1 + 0.005, r + 0.4, h + 0.5, h + 0.62, 0.22, 0.38, 0.22, 0.38); } } }
  if (D >= 5) return;
  for (const g of p.gates ?? []) { const a = g.a * Math.PI / 180; frame([Math.cos(a) * r, 0, Math.sin(a) * r], gyaw(a), () => gate(c, g, D, false)); }
}
export function collider(c) {
  const p = c.params, r = p.r ?? 56, h = p.h ?? 2.8, N = 100;
  for (let i = 0; i < N; i++) { const a0 = i / N * 6.2832, a1 = (i + 1) / N * 6.2832; if (open(p, (a0 + a1) / 2)) continue; seg(c, a0, a1, r, -0.4, h + 0.4, 0.55, 0.55, 0.3, 0.3); }
  for (const g of p.gates ?? []) { const a = g.a * Math.PI / 180; frame([Math.cos(a) * r, 0, Math.sin(a) * r], gyaw(a), () => gate(c, g, 5, true)); }
}
