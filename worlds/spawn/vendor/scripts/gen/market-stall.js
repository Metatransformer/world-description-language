import BK from "../lib/data/building-kit.json";
import { BARREL, BXR, CB, CY, HX, LA, RB, ROOF, flatc, glow, paint } from "../lib/buildkit.js";   // the shared building toolkit
import { kitDef } from "../lib/kits.js";   // colour and stripe defaults: the market-stall row in scripts/lib/data/kits.yml   // textures and tints: scripts/lib/data/building-kit.yml
// ---- Valenfeld building kit (shared verbatim by scripts/gen/*): textures, boxes, lathes, roofs ----
const { fieldstone: FS, oak: OAK, plaster: PL, slate: SL, iron: IR, flagstone: FLAG, hay: HAY } = BK.textures;
const { stone: STONE, wood: WOOD, white: WHITE, iron: IRONC } = BK.tints;
// hexahedron: b0 b1 b2 b3 (bottom: x0z0 x1z0 x1z1 x0z1) then t0..t3 above them
const BX = BXR;
// box by centre and size, turned: roll (about z), then pitch (about x, + tips -z up), then yaw (about y), degrees
// lathe: prof [[r, h]…] swept round the y axis (or the x axis: h runs along +x), smooth sides
// gable roof, ridge along x over z mid, eaves at z0/z1 at height ye, ridge yr, slab thickness t
function MERL(c, x0, z0, x1, z1, y, th, h = 0.9, w = 0.9, gap = 0.9) {
  for (let x = x0; x + w <= x1 + 1e-6; x += w + gap) { BX(c, x, y, z0, x + w, y + h, z0 + th); BX(c, x, y, z1 - th, x + w, y + h, z1); }
  for (let z = z0 + th + gap; z + w <= z1 - th + 1e-6; z += w + gap) { BX(c, x0, y, z, x0 + th, y + h, z + w); BX(c, x1 - th, y, z, x1, y + h, z + w); } }
// ---- end kit ----
// MARKET STALL of Valenfeld: oak frame, striped canvas awning (params.a / params.b), crates, a hanging lantern,
// and counter goods by params.goods: general | alchemist | butcher | fletcher | pawn. Front (customer side) is local -z.
// this placement's params over the kit row's (a null/undefined param keeps the row's value)
function params(c) { const p = { ...(kitDef("market-stall").params ?? {}) }; for (const [k, v] of Object.entries(c.params ?? {})) if (v != null) p[k] = v; return p; }
export function geometry(c) {
  const p = params(c), D = c.lod, g = p.goods;
  paint(c, OAK, WOOD);
  for (const x of [-1.44, 1.44]) { BX(c, x - 0.07, 0, -0.82, x + 0.07, 2.3, -0.68); BX(c, x - 0.07, 0, 0.68, x + 0.07, 2.75, 0.82); BX(c, x - 0.05, 2.0, -0.8, x + 0.05, 2.1, 0.8); }
  BX(c, -1.5, 2.2, -0.82, 1.5, 2.3, -0.7);
  paint(c, OAK, p.counter); BX(c, -1.55, 0.85, -0.92, 1.55, 0.93, -0.15);
  paint(c, OAK, WOOD); BX(c, -1.45, 0, -0.84, 1.45, 0.85, -0.78); BX(c, -1.45, 0.6, 0.45, 1.45, 0.66, 0.78);
  if (D <= 2) for (const x of [-1.0, -0.33, 0.33, 1.0]) BX(c, x - 0.04, 0.05, -0.86, x + 0.04, 0.8, -0.83);
  // awning: alternating canvas stripes, scalloped valance
  const A = p.a, B = p.b, n = p.stripes; c.roughness(0.92);
  for (let i = 0; i < n; i++) { const x0 = -1.7 + i * 3.4 / n, x1 = x0 + 3.4 / n; flatc(c, i % 2 ? B : A);
    HX(c, [[x0, 2.25, -1.2], [x1, 2.25, -1.2], [x1, 2.75, 0.95], [x0, 2.75, 0.95], [x0, 2.28, -1.2], [x1, 2.28, -1.2], [x1, 2.78, 0.95], [x0, 2.78, 0.95]]);
    if (D <= 2) HX(c, [[x0 + 0.02, 2.0, -1.21], [x1 - 0.02, 2.0, -1.21], [x1 - 0.02, 2.0, -1.18], [x0 + 0.02, 2.0, -1.18], [x0, 2.27, -1.21], [x1, 2.27, -1.21], [x1, 2.27, -1.18], [x0, 2.27, -1.18]]); }
  c.roughness(null);
  // lantern on an iron bracket at the front right post
  paint(c, IR, IRONC); BX(c, 1.44, 2.08, -0.79, 1.46, 2.12, -1.15); BX(c, 1.43, 1.88, -1.17, 1.47, 2.08, -1.13);
  BX(c, 1.31, 1.62, -1.29, 1.59, 1.66, -1.01); BX(c, 1.31, 1.86, -1.29, 1.59, 1.9, -1.01); LA(c, 1.45, 1.9, -1.15, [[0.15, 0], [0.03, 0.1]], 8, true);
  glow(c, p.lamp, p.lampGlow); BX(c, 1.34, 1.66, -1.26, 1.56, 1.86, -1.04);
  crate(c, 0.5, D, -1.0, 0, 0.95, p.crate); crate(c, 0.42, D, -1.0, 0.5, 0.95, p.crate); crate(c, 0.5, D, 1.05, 0, 1.0, p.crate);
  if (D > 2) return;
  const Y = 0.93, Z = -0.55;
  const sack = (x, z, col) => { paint(c, HAY, col); LA(c, x, Y, z, [[0.14, 0], [0.19, 0.12], [0.17, 0.3], [0.08, 0.36], [0.05, 0.42]], 10, true); };
  const bottle = (x, z, col, h = 0.22) => { flatc(c, col); c.roughness(0.15); LA(c, x, Y, z, [[0.055, 0], [0.06, h * 0.55], [0.022, h * 0.75], [0.02, h]], 8, true); c.roughness(null); flatc(c, "#6b5232"); CY(c, x, Y + h, z, 0.024, 0.035, 6); };
  if (g === "general") {
    sack(-1.05, Z, "oklch(0.9 0.04 85)"); sack(-0.65, Z - 0.1, "oklch(0.85 0.05 80)");
    paint(c, HAY, "oklch(0.8 0.06 75)"); for (let k = 0; k < 3; k++) LA(c, -0.1, Y + k * 0.05, Z, [[0.16, 0], [0.16, 0.045]], 12, true); // rope coil
    flatc(c, "#c9a45a"); for (let k = 0; k < 4; k++) RB(c, 0.45 + k * 0.08, Y + 0.12, Z, 0.06, 0.24, 0.18, 0, 0, (k - 1.5) * 6); // books
    flatc(c, "#a8452e"); RB(c, 0.45, Y + 0.12, Z, 0.06, 0.24, 0.18, 0, 0, -9); flatc(c, "#2f3d52"); RB(c, 0.69, Y + 0.12, Z, 0.06, 0.24, 0.18, 0, 0, 9);
    paint(c, OAK, WOOD); for (let k = 0; k < 4; k++) RB(c, 1.05, Y + 0.03, Z - 0.2 + k * 0.12, 0.5, 0.05, 0.05, 90, 0, 0); flatc(c, "#3b3a36"); for (let k = 0; k < 4; k++) RB(c, 1.05, Y + 0.03, Z - 0.2 + k * 0.12 - 0.27, 0.07, 0.07, 0.07); // torches
    flatc(c, "oklch(0.88 0.08 85)"); LA(c, 0.15, Y, Z - 0.22, [[0.13, 0], [0.13, 0.07], [0.09, 0.09]], 12, true); // cheese wheel
  } else if (g === "alchemist") {
    const C = p.potions;
    for (let k = 0; k < 7; k++) bottle(-1.2 + k * 0.17, Z - (k % 2) * 0.12, C[k], 0.18 + (k % 3) * 0.05);
    paint(c, OAK, "oklch(0.85 0.03 60)"); BX(c, 0.15, Y, -0.75, 1.3, Y + 0.15, -0.6); BX(c, 0.15, Y + 0.15, -0.6, 1.3, Y + 0.3, -0.45); // step rack
    for (let k = 0; k < 5; k++) bottle(0.25 + k * 0.24, -0.68, C[(k + 2) % 7], 0.12); for (let k = 0; k < 4; k++) bottle(0.35 + k * 0.26, -0.52 + 0, C[(k + 4) % 7], 0.1);
    // herb bundles hanging from the awning bar
    for (let k = 0; k < 5; k++) { const x = -1.1 + k * 0.5; flatc(c, "#6b5232"); BX(c, x - 0.005, 1.75, -0.76, x + 0.005, 2.2, -0.74); flatc(c, k % 2 ? "#4f6b4a" : "#7a8a4a"); LA(c, x, 1.45, -0.75, [[0.02, 0], [0.09, 0.15], [0.05, 0.3]], 7, true); }
    flatc(c, "oklch(0.75 0.03 70)"); LA(c, -0.2, Y, -0.35, [[0.1, 0], [0.12, 0.1]], 12, true); flatc(c, "#3b3a36"); RB(c, -0.2, Y + 0.17, -0.35, 0.03, 0.2, 0.03, 0, 0, 25); // mortar
  } else if (g === "butcher") {
    for (let k = 0; k < 4; k++) { const x = -1.0 + k * 0.62; paint(c, IR, IRONC); BX(c, x - 0.01, 1.7, -0.76, x + 0.01, 2.2, -0.74);
      flatc(c, k % 2 ? "#8a3a2a" : "#a8452e"); LA(c, x, 1.25, -0.75, [[0.05, 0], [0.13, 0.12], [0.11, 0.33], [0.03, 0.45]], 10, true); } // hams
    flatc(c, "#8a4a2a"); for (let k = 0; k < 6; k++) RB(c, -0.85 + k * 0.09, 1.75, -0.6, 0.05, 0.3, 0.05, 0, 0, (k - 2.5) * 4); // sausage string
    flatc(c, "oklch(0.88 0.1 85)"); LA(c, -0.95, Y, Z, [[0.17, 0], [0.17, 0.1], [0.12, 0.12]], 14, true); LA(c, -0.95, Y + 0.12, Z, [[0.14, 0], [0.14, 0.09], [0.1, 0.11]], 14, true); // cheese
    flatc(c, "oklch(0.7 0.11 65)"); for (let k = 0; k < 3; k++) LA(c, -0.35 + k * 0.28, Y, Z, [[0.12, 0], [0.13, 0.06], [0.09, 0.12], [0.02, 0.14]], 10, true); // loaves
    paint(c, OAK, WOOD); BX(c, 0.4, Y, -0.75, 1.3, Y + 0.06, -0.3); flatc(c, "#b0503a"); RB(c, 0.7, Y + 0.1, -0.52, 0.35, 0.08, 0.25, 15); flatc(c, "oklch(0.92 0.03 30)"); RB(c, 0.7, Y + 0.145, -0.52, 0.3, 0.01, 0.2, 15);
    flatc(c, "#c0c4c8"); c.metalness(0.8); RB(c, 1.08, Y + 0.075, -0.5, 0.3, 0.01, 0.1, -20); c.metalness(null); flatc(c, "#a0a8b0"); LA(c, 1.0, Y + 0.06, -0.62, [[0.11, 0], [0.11, 0.03]], 10, true); // cleaver, fish plate
    flatc(c, "#8a96a0"); for (let k = 0; k < 3; k++) RB(c, 1.0, Y + 0.11, -0.62 + (k - 1) * 0.05, 0.2, 0.03, 0.05, 10 * k);
  } else if (g === "fletcher") {
    // bows leaning on the back rail, arrows in quivers, hides over the counter
    paint(c, OAK, "oklch(0.85 0.06 60)"); for (let k = 0; k < 3; k++) { const x = -1.1 + k * 0.4; for (let s = 0; s < 6; s++) { const a0 = -0.9 + s * 0.3, a1 = a0 + 0.3, r = 0.75;
      RB(c, x + Math.sin((a0 + a1) / 2) * 0.12, 1.4 + Math.sin((a0 + a1) / 2) * r, 0.62 - Math.cos((a0 + a1) / 2) * 0.15, 0.035, 0.24, 0.035, 0, 0, 0); }
      flatc(c, "#e6dcc4"); BX(c, x - 0.004, 0.75, 0.47, x + 0.004, 2.05, 0.48); }
    for (let k = 0; k < 2; k++) { const x = 0.2 + k * 0.35; paint(c, OAK, "oklch(0.6 0.07 50)"); LA(c, x, Y, Z, [[0.08, 0], [0.09, 0.42]], 10, true);
      for (let q = 0; q < 8; q++) { const a = q * 0.8, r = 0.05; flatc(c, "#7a6a55"); RB(c, x + Math.cos(a) * r, Y + 0.55, Z + Math.sin(a) * r, 0.012, 0.3, 0.012); flatc(c, q % 2 ? "#e6dcc4" : "#a8452e"); RB(c, x + Math.cos(a) * r, Y + 0.68, Z + Math.sin(a) * r, 0.04, 0.08, 0.005, a * 57); } }
    flatc(c, "oklch(0.5 0.06 55)"); c.roughness(0.95); HX(c, [[-1.45, Y + 0.01, -0.85], [-0.4, Y + 0.01, -0.85], [-0.4, Y + 0.01, -0.3], [-1.45, Y + 0.01, -0.3], [-1.45, Y + 0.03, -0.85], [-0.4, Y + 0.03, -0.85], [-0.4, Y + 0.03, -0.3], [-1.45, Y + 0.03, -0.3]]);
    HX(c, [[-1.3, 0.35, -0.94], [-0.55, 0.35, -0.94], [-0.55, 0.35, -0.92], [-1.3, 0.35, -0.92], [-1.3, Y, -0.94], [-0.55, Y, -0.94], [-0.55, Y, -0.92], [-1.3, Y, -0.92]]); c.roughness(null); // hide over the front
    flatc(c, "#6b4a2e"); RB(c, 1.05, Y + 0.18, Z, 0.4, 0.36, 0.2); flatc(c, "#4a3220"); RB(c, 1.05, Y + 0.37, Z - 0.02, 0.42, 0.04, 0.22); // leather cuirass folded
  } else {
    // pawnbroker: a jumble of other people's lives
    paint(c, IR, IRONC); c.metalness(0.6); LA(c, -1.0, Y, Z, [[0.13, 0], [0.15, 0.15], [0.14, 0.24], [0.02, 0.27]], 12, true); BX(c, -1.02, Y + 0.05, Z - 0.16, -0.98, Y + 0.2, Z - 0.13); // helm
    flatc(c, "#c9a45a"); for (const x of [-0.5, -0.3]) LA(c, x, Y, Z, [[0.06, 0], [0.03, 0.03], [0.02, 0.28], [0.04, 0.3]], 8, true); c.metalness(null); // candlesticks
    paint(c, OAK, "oklch(0.75 0.06 50)"); BX(c, 0.05, Y, -0.75, 0.55, Y + 0.25, -0.45); paint(c, IR, IRONC); BX(c, 0.04, Y + 0.12, -0.76, 0.56, Y + 0.15, -0.44); flatc(c, "#c9a45a"); BX(c, 0.27, Y + 0.08, -0.77, 0.33, Y + 0.16, -0.75); // strongbox
    flatc(c, "oklch(0.8 0.12 85)"); c.metalness(0.9); for (let k = 0; k < 5; k++) LA(c, 0.8 + (k % 3) * 0.12, Y, -0.65 + Math.floor(k / 3) * 0.12, [[0.04, 0], [0.04, 0.012]], 8, true); c.metalness(null); // coins
    flatc(c, "#2f3d52"); BX(c, 0.7, Y, -0.4, 1.3, Y + 0.02, -0.2); flatc(c, "#c0c4c8"); RB(c, 1.0, Y + 0.035, -0.3, 0.55, 0.02, 0.05, 8); // a sword on a cloth
    paint(c, IR, IRONC); RB(c, 0.0, 1.55, 0.6, 0.6, 0.6, 0.04); flatc(c, "#a8452e"); RB(c, 0.0, 1.55, 0.58, 0.45, 0.45, 0.02); // a pawned shield on the back
  }
}
function crate(c, s, D, x, y, z, col) {
  paint(c, OAK, col); BX(c, x - s / 2, y, z - s / 2, x + s / 2, y + s, z + s / 2);
  if (D <= 2) { paint(c, OAK, WOOD); const e = s / 2 + 0.012, t = 0.06; BX(c, x - e, y + s - t, z - e, x + e, y + s, z + e); BX(c, x - e, y, z - e, x + e, y + t, z + e); }
}
export function collider(c) {
  const b = CB(); b(-1.55, 0, -0.92, 1.55, 0.93, -0.15); b(-1.51, 0, -0.82, -1.37, 2.3, -0.68); b(1.37, 0, -0.82, 1.51, 2.3, -0.68);
  return b.list;
}
