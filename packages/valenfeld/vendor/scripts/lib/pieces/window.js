// THE HIGHBRIDGE WINDOW: one piece, each district's look. Drawn by hb-castle (round-headed ashlar window) and hb-span
// (tar-board casement with shutters); the Codex window kit stages every look and its new combinations.
//   castleWindow(c, P, u, y0, w, h, lod, o)  P = a face plane (u along the face, y up, o out of it), as hb-castle's plane()
//   spanWindow(c, x, y, z, s, w, h, lit, lod, shut, o)  on a face at z, facing s (-1 = -z)
// o (optional) re-colours without changing a vertex: { trim, pane, paneGlow, frame, frameTex, dark, unlit }. Omitted = as built.
import { paint, flatc, glow, HX, BX } from "../buildkit.js";
const ASH = "cdn/texture-ashlar-cream-limestone-two-courses-big-dressed-blocks-thin-pale-mortar-subtle-weathering.png";
const TARB = "cdn/texture-tarred-planks-black.png";
export const WINDOW_LOOKS = {
  castle: { trim: "oklch(0.99 0.012 90)", pane: "oklch(0.7 0.1 70)", paneGlow: [1.7, 0.9, 0.34], dark: "oklch(0.18 0.01 60)" },
  span: { frame: "oklch(0.7 0.01 60)", frameTex: TARB, pane: "oklch(0.86 0.11 72)", paneGlow: [2.6, 1.45, 0.5], unlit: "oklch(0.24 0.03 230)" },
};
const Q = (c, P, u0, y0, u1, y1, o) => c.quad(...P(u0, y0, o), ...P(u1, y0, o), ...P(u1, y1, o), ...P(u0, y1, o));
const BP = (c, P, u0, y0, o0, u1, y1, o1) => HX(c, [P(u0, y0, o0), P(u1, y0, o0), P(u1, y0, o1), P(u0, y0, o1), P(u0, y1, o0), P(u1, y1, o0), P(u1, y1, o1), P(u0, y1, o1)]);
// a lit window: stone surround, warm pane with a round head, mullion
export function castleWindow(c, P, u, y0, w, h, lod, o) { const L = o ? { ...WINDOW_LOOKS.castle, ...o } : WINDOW_LOOKS.castle;
  paint(c, ASH, L.trim);
  if (lod <= 2) { BP(c, P, u - w / 2 - 0.22, y0 - 0.25, 0, u + w / 2 + 0.22, y0, 0.2); BP(c, P, u - w / 2 - 0.2, y0, 0, u - w / 2, y0 + h, 0.12); BP(c, P, u + w / 2, y0, 0, u + w / 2 + 0.2, y0 + h, 0.12); BP(c, P, u - w / 2 - 0.2, y0 + h, 0, u + w / 2 + 0.2, y0 + h + w * 0.5 + 0.2, 0.12); }
  glow(c, L.pane, L.paneGlow); Q(c, P, u - w / 2, y0, u + w / 2, y0 + h, 0.06);
  for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI, b = (k + 1) / 6 * Math.PI; c.tri(...P(u, y0 + h, 0.06), ...P(u + w / 2 * Math.cos(a), y0 + h + w / 2 * Math.sin(a), 0.06), ...P(u + w / 2 * Math.cos(b), y0 + h + w / 2 * Math.sin(b), 0.06)); }
  c.emissive(null); if (lod <= 2) { flatc(c, L.dark); BP(c, P, u - 0.03, y0, 0.06, u + 0.03, y0 + h + w / 2, 0.09); BP(c, P, u - w / 2, y0 + h * 0.5 - 0.03, 0.06, u + w / 2, y0 + h * 0.5 + 0.03, 0.09); } }
// a casement on a face at z, facing s (-1 = -z): tar-board frame, pane lit or dark, glazing bars, shutters when shut is a colour
export function spanWindow(c, x, y, z, s, w, h, lit, lod, shut, o) { const L = o ? { ...WINDOW_LOOKS.span, ...o } : WINDOW_LOOKS.span;
  paint(c, L.frameTex, L.frame); BX(c, x - w / 2 - 0.1, y - 0.12, z, x + w / 2 + 0.1, y + h + 0.1, z + s * 0.1);
  if (lit) glow(c, L.pane, L.paneGlow); else flatc(c, L.unlit); BX(c, x - w / 2, y, z + s * 0.1, x + w / 2, y + h, z + s * 0.13); c.emissive(null);
  if (lod <= 2) { paint(c, L.frameTex, L.frame); BX(c, x - 0.03, y, z + s * 0.1, x + 0.03, y + h, z + s * 0.16); BX(c, x - w / 2, y + h * 0.55, z + s * 0.1, x + w / 2, y + h * 0.55 + 0.05, z + s * 0.16);
    if (shut) { flatc(c, shut); for (const k of [-1, 1]) BX(c, x + k * (w / 2 + 0.12), y, z + s * 0.12, x + k * (w + 0.12), y + h, z + s * 0.18); } }
}
// a glowing lancet through a wall of thickness T (both faces lit): along x at plane z (lancetZ) or along z at plane x (lancetX)
export function lancetZ(c, x, z, so, y0, h, w, em, col, T) { c.albedo(null); c.color(col); c.emissive(...em);
  BX(c, x - w / 2, y0, z - T / 2 - 0.04, x + w / 2, y0 + h, z + T / 2 + 0.04);
  HX(c, [[x - w / 2, y0 + h, z - T / 2 - 0.04], [x + w / 2, y0 + h, z - T / 2 - 0.04], [x + w / 2, y0 + h, z + T / 2 + 0.04], [x - w / 2, y0 + h, z + T / 2 + 0.04], [x, y0 + h + w * 0.7, z - T / 2 - 0.04], [x, y0 + h + w * 0.7, z - T / 2 - 0.04], [x, y0 + h + w * 0.7, z + T / 2 + 0.04], [x, y0 + h + w * 0.7, z + T / 2 + 0.04]]);
  c.emissive(null); }
export function lancetX(c, x, z, so, y0, h, w, em, col, T) { c.albedo(null); c.color(col); c.emissive(...em);
  BX(c, x - T / 2 - 0.04, y0, z - w / 2, x + T / 2 + 0.04, y0 + h, z + w / 2);
  HX(c, [[x - T / 2 - 0.04, y0 + h, z - w / 2], [x + T / 2 + 0.04, y0 + h, z - w / 2], [x + T / 2 + 0.04, y0 + h, z + w / 2], [x - T / 2 - 0.04, y0 + h, z + w / 2], [x - T / 2 - 0.04, y0 + h + w * 0.7, z], [x + T / 2 + 0.04, y0 + h + w * 0.7, z], [x + T / 2 + 0.04, y0 + h + w * 0.7, z], [x - T / 2 - 0.04, y0 + h + w * 0.7, z]]);
  c.emissive(null); }
// a rose window in the plane x, facing s (±x), centred (cy, z = 0) radius r: 16 glowing petals, spokes, a stone ring (TORUS from buildkit)
export function roseX(c, x, cy, s, r, pane, em, ring, TORUS, tracery = false) { glow(c, pane, em);
  for (let kk = 0; kk < 16; kk++) { const a0 = kk / 16 * Math.PI * 2, a1 = (kk + 1) / 16 * Math.PI * 2; BX(c, x - 0.45, cy - 0.05, -0.05, x + 0.45, cy + 0.05, 0.05);
    c.tri(x + s * 0.03, cy, 0, x + s * 0.03, cy + r * Math.sin(s > 0 ? a1 : a0), r * Math.cos(s > 0 ? a1 : a0), x + s * 0.03, cy + r * Math.sin(s > 0 ? a0 : a1), r * Math.cos(s > 0 ? a0 : a1)); }
  c.emissive(null); flatc(c, ring); TORUS(c, x, cy, 0, r, 0.12, 20, 4, "x");
  if (tracery) roseTracery(c, x + s * 0.06, cy, r, TORUS); }
// stone tracery over a rose: a hub, eight spokes, a ring of eight foils between them (opt-in; params.tracery)
function bar(c, x, y0, z0, y1, z1, w, d) { const ly = y1 - y0, lz = z1 - z0, L = Math.hypot(ly, lz) || 1, py = -lz / L * w / 2, pz = ly / L * w / 2;
  const P = [[y0 + py, z0 + pz], [y1 + py, z1 + pz], [y1 - py, z1 - pz], [y0 - py, z0 - pz]], V = (k, xx) => [xx, P[k][0], P[k][1]];
  const quad = (a, b, cc, dd) => { c.tri(...a, ...b, ...cc); c.tri(...a, ...cc, ...dd); c.tri(...a, ...cc, ...b); c.tri(...a, ...dd, ...cc); };
  for (const xx of [x - d / 2, x + d / 2]) quad(V(0, xx), V(1, xx), V(2, xx), V(3, xx));
  for (let k = 0; k < 4; k++) { const k1 = (k + 1) % 4; quad(V(k, x - d / 2), V(k1, x - d / 2), V(k1, x + d / 2), V(k, x + d / 2)); } }
export function roseTracery(c, x, cy, r, TORUS) {
  TORUS(c, x, cy, 0, r * 0.2, 0.07, 14, 4, "x");
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a);
    bar(c, x, cy + sa * r * 0.2, ca * r * 0.2, cy + sa * r * 0.97, ca * r * 0.97, 0.09, 0.12);
    const b = a + Math.PI / 8; TORUS(c, x, cy + Math.sin(b) * r * 0.62, Math.cos(b) * r * 0.62, r * 0.2, 0.05, 12, 4, "x"); } }
