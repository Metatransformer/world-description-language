import BK from "../lib/data/building-kit.json";
import { BXR, HX, ROOF, flatc, paint } from "../lib/buildkit.js";   // the shared building toolkit
// MAGES ANNEX: the Mages Guild's grown wings. params.kind:
//   hall  (18 x 9 m library wing: buttressed fieldstone, tall violet-lit lancets, steep slate roof with dormers; its +z face looks at the street)
//   spire (octagonal observatory tower, r 3.2 m, 19 m to the roof foot, a needle roof and a floating violet orb)
//   bridge (params.len m covered stone bridge along x at 6 m, joining tower to wing)
const { fieldstone: FS, oak: OAK, plaster: PL, slate: SL, iron: IR } = BK.textures;
const { stone: STONE, wood: WOOD, white: WHITE, iron: IRONC } = BK.tints;
const GLOW = [0.9, 0.55, 2.2], WARM = [1.6, 0.85, 0.32];
const BX = BXR;
// gable end triangle on the plane x, from z0..z1, eave ye to ridge yr
function GABLE(c, x, z0, z1, ye, yr, th) { const zm = (z0 + z1) / 2;
  HX(c, [[x - th, ye, z0], [x + th, ye, z0], [x + th, ye, z1], [x - th, ye, z1], [x - th, yr, zm], [x + th, yr, zm], [x + th, yr, zm], [x - th, yr, zm]]); }
function LA(c, cx, y0, cz, prof, n = 8, rot = Math.PI / 8) { const P = (i, k) => { const a = (k % n) / n * Math.PI * 2 + rot; return [cx + prof[i][0] * Math.cos(a), y0 + prof[i][1], cz + prof[i][0] * Math.sin(a)]; };
  for (let i = 0; i < prof.length - 1; i++) for (let k = 0; k < n; k++) c.quad(...P(i, k + 1), ...P(i, k), ...P(i + 1, k), ...P(i + 1, k + 1));
  const l = prof.length - 1; if (prof[l][0] > 0.001) { const A = [cx, y0 + prof[l][1], cz]; for (let k = 0; k < n; k++) c.tri(...A, ...P(l, k + 1), ...P(l, k)); } }
// a lancet: a tall window with a pointed head, glowing, on a wall plane facing ±z (s = sign) at z
function LANCET(c, x, z, s, y0, h, w) { const t = 0.05, zf = z + s * t;
  c.albedo(null); c.color("oklch(0.55 0.1 300)"); c.emissive(...GLOW);
  BX(c, x - w / 2, y0, Math.min(z, zf), x + w / 2, y0 + h, Math.max(z, zf));
  HX(c, [[x - w / 2, y0 + h, Math.min(z, zf)], [x + w / 2, y0 + h, Math.min(z, zf)], [x + w / 2, y0 + h, Math.max(z, zf)], [x - w / 2, y0 + h, Math.max(z, zf)], [x, y0 + h + w * 0.8, Math.min(z, zf)], [x, y0 + h + w * 0.8, Math.min(z, zf)], [x, y0 + h + w * 0.8, Math.max(z, zf)], [x, y0 + h + w * 0.8, Math.max(z, zf)]]);
  c.emissive(null); paint(c, FS, "oklch(0.8 0.02 80)"); const zs = z + s * 0.12;
  BX(c, x - w / 2 - 0.15, y0 - 0.2, Math.min(z, zs), x + w / 2 + 0.15, y0, Math.max(z, zs));
  flatc(c, "oklch(0.25 0.01 60)"); BX(c, x - 0.03, y0, Math.min(z, zs), x + 0.03, y0 + h + w * 0.7, Math.max(z, zs)); }
const K = {
  hall(c, p, lod) { const W = p.w ?? 9, D = p.d ?? 4.5, H = p.h ?? 7, RH = p.rh ?? 12.6, k = W / 9, doorOn = p.door ?? true, blind = p.blindEnd;   // Nov 7: sized (w/d/h/rh half-extents); the 18 m library and the tower's little side halls are one wing; blindEnd: -1/+1, the gable end built into the tower, no rose window
    paint(c, FS, STONE); BX(c, -W, 0, -D, W, H, D);
    paint(c, FS, "oklch(0.72 0.02 80)"); BX(c, -W - 0.2, 0, -D - 0.2, W + 0.2, 0.7, D + 0.2); BX(c, -W - 0.1, H - 0.4, -D - 0.15, W + 0.1, H, D + 0.15);
    const J = p.join, hid = (x, s) => J && s > 0 && Math.abs(x - J.x) < J.r;   // creator Nov 6: the wing is built into the tower's side: what the tower swallows on the +z face is not drawn
    for (const x of [-W, -W / 2, 0, W / 2, W]) for (const s of [-1, 1]) { if (hid(x, s) || (blind && x === blind * W)) continue; paint(c, FS, STONE); HX(c, [[x - 0.4, 0, s * D], [x + 0.4, 0, s * D], [x + 0.4, 0, s * (D + 1.1)], [x - 0.4, 0, s * (D + 1.1)], [x - 0.4, H - 0.6, s * D], [x + 0.4, H - 0.6, s * D], [x + 0.4, H - 0.6, s * (D + 0.25)], [x - 0.4, H - 0.6, s * (D + 0.25)]].map((v, i) => v).sort(() => 0)); }
    if (lod <= 3) for (const x of [-0.75, -0.25, 0.25, 0.75].map((f) => f * W)) for (const s of [-1, 1]) if (!hid(x, s) && !(doorOn && s > 0 && Math.abs(x) < 1.6)) LANCET(c, x, s * D, s, Math.min(2.0, H * 0.28), Math.min(3.2, H * 0.45), Math.min(1.0, 0.45 + k * 0.6));
    for (const x of [-W, W]) { paint(c, FS, STONE); GABLE(c, x, -D, D, H, RH, 0.2); if (lod <= 3) LANCET({ ...c, quad: c.quad.bind(c) }.quad ? c : c, 0, 0, 1, 0, 0, 0); }
    // a rose window in each gable, as a glowing disc of segments
    if (lod <= 3) for (const x of [-W - 0.05, W + 0.05]) { const s = Math.sign(x); if (blind === s) continue; c.albedo(null); c.color("oklch(0.55 0.1 300)"); c.emissive(...GLOW); const n = 12, r = Math.min(1.1, (RH - H) * 0.25), cy = H + (RH - H) * 0.36;
      for (let k = 0; k < n; k++) { const a0 = k / n * Math.PI * 2, a1 = (k + 1) / n * Math.PI * 2; c.tri(x + s * 0.1, cy, 0, x + s * 0.1, cy + r * Math.sin(s > 0 ? a1 : a0), r * Math.cos(s > 0 ? a1 : a0), x + s * 0.1, cy + r * Math.sin(s > 0 ? a0 : a1), r * Math.cos(s > 0 ? a0 : a1)); }
      c.emissive(null); paint(c, FS, "oklch(0.8 0.02 80)"); for (let k = 0; k < 4; k++) { const a = k * Math.PI / 4; BX(c, x - 0.12, cy - 0.05, -r * Math.cos(a) * 0 - 0.05, x + 0.12, cy + 0.05, 0.05); } }
    paint(c, SL, "oklch(0.78 0.03 280)"); ROOF(c, -W - 0.5, W + 0.5, -D - 0.8, D + 0.8, H - 0.3, RH, 0.25);
    // dormers on both slopes
    if (lod <= 3) for (const x of W >= 6 ? [-4.5, 4.5] : []) for (const s of [-1, 1]) { const z0 = s * 2.4, z1 = s * 4.2, y0 = 8.4;
      paint(c, PL, WHITE); BX(c, x - 0.9, y0, Math.min(z0, z1), x + 0.9, y0 + 1.6, Math.max(z0, z1));
      c.albedo(null); c.color("oklch(0.6 0.08 70)"); c.emissive(...WARM); BX(c, x - 0.45, y0 + 0.3, Math.min(z1, z1 + s * 0.03), x + 0.45, y0 + 1.25, Math.max(z1, z1 + s * 0.03)); c.emissive(null);
      paint(c, SL, "oklch(0.78 0.03 280)"); HX(c, [[x - 1.1, y0 + 1.6, Math.min(z0, z1 + s * 0.3)], [x + 1.1, y0 + 1.6, Math.min(z0, z1 + s * 0.3)], [x + 1.1, y0 + 1.6, Math.max(z0, z1 + s * 0.3)], [x - 1.1, y0 + 1.6, Math.max(z0, z1 + s * 0.3)], [x, y0 + 2.5, Math.min(z0, z1 + s * 0.3)], [x, y0 + 2.5, Math.min(z0, z1 + s * 0.3)], [x, y0 + 2.5, Math.max(z0, z1 + s * 0.3)], [x, y0 + 2.5, Math.max(z0, z1 + s * 0.3)]]); }
    // iron ridge crest and finials
    paint(c, IR, IRONC); BX(c, -W, RH + 0.2, -0.06, W, RH + 0.45, 0.06); for (const x of [-W, W]) { if (blind && x === blind * W) continue; BX(c, x - 0.07, RH, -0.07, x + 0.07, RH + 1.4, 0.07); c.albedo(null); c.color("oklch(0.7 0.15 300)"); c.emissive(...GLOW); BX(c, x - 0.18, RH + 1.4, -0.18, x + 0.18, RH + 1.76, 0.18); c.emissive(null); paint(c, IR, IRONC); }
    // chimney
    if (W >= 6) { paint(c, FS, STONE); BX(c, 5.6, 9, -1.8, 6.6, RH + 1.2, -0.8); }
    // a door on the street face, oak under a stone hood, with a hanging lamp
    if (!doorOn) return; paint(c, OAK, WOOD); BX(c, -0.8, 0.7, D, 0.8, 3.1, D + 0.08); paint(c, FS, "oklch(0.8 0.02 80)"); BX(c, -1.2, 3.1, D, 1.2, 3.5, D + 0.5);
    c.albedo(null); c.color("oklch(0.9 0.08 80)"); c.emissive(3, 1.6, 0.5); BX(c, 1.25, 2.6, D + 0.25, 1.5, 2.95, D + 0.5); c.emissive(null);
  },
  spire(c, p, lod) { const R = 3.2, H = 19, n = lod <= 2 ? 8 : 6;
    paint(c, FS, STONE); LA(c, 0, 0, 0, [[R + 0.35, 0], [R + 0.35, 0.8], [R, 1.1], [R, H - 0.6], [R + 0.4, H - 0.4], [R + 0.4, H], [0.01, H]], n);
    // corbelled gallery ring and crenels
    paint(c, FS, "oklch(0.8 0.02 80)"); for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2 + Math.PI / 8, x = (R + 0.3) * Math.cos(a), z = (R + 0.3) * Math.sin(a); BX(c, x - 0.3, H, z - 0.3, x + 0.3, H + 0.8, z + 0.3); }
    // lancets climbing the tower
    if (lod <= 3) for (const [y, a] of [[3, 0], [7.5, 2], [11.5, 4], [15, 6], [15, 2]]) { const ang = a / 8 * Math.PI * 2 + Math.PI / 8 + Math.PI / 8; const x = (R + 0.02) * Math.cos(ang), z = (R + 0.02) * Math.sin(ang);
      c.albedo(null); c.color("oklch(0.55 0.1 300)"); c.emissive(...GLOW); const tx = -Math.sin(ang), tz = Math.cos(ang), nx = Math.cos(ang) * 0.08, nz = Math.sin(ang) * 0.08, w = 0.45, h = 1.9;
      c.quad(x - tx * w + nx, y, z - tz * w + nz, x + tx * w + nx, y, z + tz * w + nz, x + tx * w + nx, y + h, z + tz * w + nz, x - tx * w + nx, y + h, z - tz * w + nz);
      c.tri(x - tx * w + nx, y + h, z - tz * w + nz, x + tx * w + nx, y + h, z + tz * w + nz, x + nx, y + h + 0.5, z + nz); c.emissive(null); }
    // needle roof of slate, flared
    paint(c, SL, "oklch(0.72 0.05 285)"); LA(c, 0, H + 0.6, 0, [[R + 0.9, 0], [R * 0.75, 1.2], [R * 0.35, 5.5], [0.05, 9.5]], n);
    paint(c, IR, IRONC); BX(c, -0.05, H + 9.4, -0.05, 0.05, H + 11.2, 0.05);
    // the floating orb: a soft violet-white lamp ringed by an iron hoop
    c.albedo(null); c.color("oklch(0.9 0.06 300)"); c.emissive(2.4, 1.6, 4.2); LA(c, 0, H + 11.4, 0, [[0.01, 0], [0.3, 0.12], [0.42, 0.42], [0.3, 0.72], [0.01, 0.84]], 10, 0); c.emissive(null);
    paint(c, IR, IRONC); for (let k = 0; k < 10; k++) { const a0 = k / 10 * Math.PI * 2, a1 = (k + 1) / 10 * Math.PI * 2, r = 0.75, y = H + 11.8;
      BX(c, Math.min(r * Math.cos(a0), r * Math.cos(a1)) - 0.03, y - 0.03, Math.min(r * Math.sin(a0), r * Math.sin(a1)) - 0.03, Math.max(r * Math.cos(a0), r * Math.cos(a1)) + 0.03, y + 0.03, Math.max(r * Math.sin(a0), r * Math.sin(a1)) + 0.03); }
  },
  bridge(c, p, lod) { const L = p.len ?? 6, y = 6;
    paint(c, FS, STONE); BX(c, -L / 2, y, -1.4, L / 2, y + 0.6, 1.4);
    for (const s of [-1, 1]) { paint(c, PL, WHITE); BX(c, -L / 2, y + 0.6, s * 1.4 - 0.12, L / 2, y + 3, s * 1.4 + 0.12);
      paint(c, OAK, WOOD); for (let x = -L / 2; x <= L / 2 + 0.01; x += L / 3) BX(c, x - 0.12, y + 0.6, s * 1.4 - 0.16, x + 0.12, y + 3, s * 1.4 + 0.16);
      if (lod <= 3) { c.albedo(null); c.color("oklch(0.6 0.08 70)"); c.emissive(...WARM); for (let x = -L / 2 + L / 6; x < L / 2; x += L / 3) BX(c, x - 0.4, y + 1.4, s * 1.4 - 0.14, x + 0.4, y + 2.3, s * 1.4 + 0.14); c.emissive(null); } }
    // corbel arch under it
    paint(c, FS, "oklch(0.8 0.02 80)"); for (let i = 0; i < 6; i++) { const t = i / 5, w = (L / 2) * (1 - t * t) * 0.9; BX(c, -L / 2, y - 0.4 * (6 - i) / 6 * 2 + 0, -1.2, -L / 2 + (L / 2 - w), y, 1.2); BX(c, L / 2 - (L / 2 - w), y - 0.4 * (6 - i) / 6 * 2, -1.2, L / 2, y, 1.2); }
    paint(c, SL, "oklch(0.78 0.03 280)"); ROOF(c, -L / 2 - 0.2, L / 2 + 0.2, -1.8, 1.8, y + 3, y + 4.4, 0.2);
  },
};
export function geometry(c) { const p = c.params ?? {}; (K[p.kind] ?? K.hall)(c, p, c.lod ?? 1); c.albedo(null); c.color(null); c.emissive(null); }
export function collider(c) { const p = c.params ?? {}, k = p.kind ?? "hall";
  const box = (x0, y0, z0, x1, y1, z1) => ({ kind: "box", width: x1 - x0, height: y1 - y0, depth: z1 - z0, center: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2] });
  if (k === "hall") return [box(-9.2, 0, -5.6, 9.2, 8, p.join ? 4.6 : 5.6)];
  if (k === "spire") return [box(-3.6, 0, -3.6, 3.6, 20, 3.6)];
  if (k === "bridge") { const L = p.len ?? 6; return [box(-L / 2, 5.4, -1.6, L / 2, 10.5, 1.6)]; }
  return []; }
