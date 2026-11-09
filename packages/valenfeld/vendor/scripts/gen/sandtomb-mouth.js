// The Tomb of the Sand Kings' mouth: a sandstone facade cut into the Sunscar cliff east of Qasreth.
// Local frame: the facade's face is the plane z = 0 facing -Z, the cliff behind it is +Z; y = 0 is the plaza.
// Steps climb 6 × 0.18 m to a landing at y = 1.08; the gate glass (2.4 × 3) stands at z = 0.6 in a recess.
// params.part: "mouth" (default) or "sign" (the wooden board by the path; its name is a vector child).
import { kit } from "./barrow-kit.js";
import { TX, TINT, LAPIS, OCHRE, RED, king, sunDisc, archInfill, brazier, sandPile, urn } from "./sandtomb.js";
// outdoors the mouth wears the Sunscar terrain's own rock and dune sand, so the knoll and drifts read as the land, not toy-red props.
const OUT = { cliff: "cdn/texture-terrain-red-sandstone-layered-cliff-realistic-albedo.png", sand: "cdn/texture-terrain-golden-desert-sand-fine-ripples-realistic-albedo.png" };
const W = 10, H = 16, LAND = 1.08, OW = 2.2, OH = 5.6;
export const BRAZIERS = [[-2.7, 0, -3.9], [2.7, 0, -3.9]];

function mouth(K, ctx, col) {
  const lod = col ? 4 : ctx.lod;
  // cliff mass behind and above the facade, so the hill reads carved
  // critic Nov 4 r2: from the square the knoll read toy-red against the pale pink ridges; tint it down toward the ridge rock.
  K.paint(OUT.cliff, "oklch(0.92 0.02 60)", 1);
  // critic Nov 4 (Qasreth): the mass stands on open sand, not in a cliff, so a 26 x 23 m slab read as a flat red box.
  // Now a knoll: a lower core stepping back, and boulders heaped round it so the silhouette slopes and breaks.
  if (col) K.box(-W - 3, -1, 2, W + 3, H + 6, 10);
  else {
    K.box(-W - 1, -1, 2, W + 1, H + 1, 6); K.box(-W + 2, -1, 6, W - 2, H - 4, 10); K.box(-W + 5, -1, 10, W - 5, H - 9, 13);
    for (let k = 0; k < 26; k++) { const t = ctx.random(), x = (ctx.random() * 2 - 1) * (W + 3 - t * 6), z = 2 + t * 12, top = (H + 3) * (1 - t * 0.75);
      const y = top * (0.35 + ctx.random() * 0.65), r = 2.2 + ctx.random() * 2.6;
      K.rock(x, y, z, r, r * (0.7 + ctx.random() * 0.4), r, 7, 4, 0.3); }
  }
  if (!col) { for (let k = 0; k < 9; k++) { const x = -W - 2 + ctx.random() * (2 * W + 4); K.rock(x, H + 0.5 + ctx.random(), 3 + ctx.random() * 3, 2 + ctx.random() * 2, 1.5 + ctx.random(), 2 + ctx.random() * 2, 7, 4, 0.3); }
    for (const sx of [-1, 1]) for (let k = 0; k < 5; k++) K.rock(sx * (W + 1.5 + ctx.random() * 1.5), ctx.random() * H, 1 + ctx.random() * 2, 1.8, 2.5, 2, 7, 4, 0.3); }
  // facade body, minus the door recess
  K.paint(TX.block, TINT, 0.95);
  K.box(-W, -1, 0, -OW, H, 3); K.box(OW, -1, 0, W, H, 3); K.box(-OW, OH, 0, OW, H, 3); K.box(-OW, -1, 0, OW, LAND, 3);
  K.paint(TX.wall, "oklch(0.7 0.04 60)"); K.box(-OW, LAND, 1.6, OW, OH, 3);
  // cavetto cornice and torus roll along the top; a lower band
  K.paint(TX.block, TINT);
  K.bbox(-W - 0.3, H - 2.6, -0.35, W + 0.3, H - 2.2, 0.2, 0.06);
  if (!col) {
    for (let i = 0; i < 6; i++) { const y = H - 2.2 + i * 0.36, o = 0.35 + 0.9 * Math.pow(i / 5, 2); K.box(-W - 0.3 - o * 0.3, y, -o, W + 0.3 + o * 0.3, y + 0.36, 0.2); }
    if (lod <= 2) for (let i = -9; i <= 9; i++) { K.paint(null, i % 2 ? LAPIS : OCHRE, 0.95); K.box(i - 0.38, H - 1.9, -0.36 - 0.08, i + 0.38, H - 0.7, -0.33 - 0.08); }
    K.paint(TX.block, TINT); ctx.smooth(); K.seg([-W - 0.4, H - 2.4, -0.4], [W + 0.4, H - 2.4, -0.4], 0.22, 0.22, 8, true);
    for (const sx of [-1, 1]) K.seg([sx * (W + 0.1), 0, -0.1], [sx * (W + 0.1), H - 2.4, -0.1], 0.22, 0.22, 8, true); ctx.flat();
  } else K.box(-W - 1.5, H - 2.2, -1.3, W + 1.5, H, 0.2);
  // the doorway surround: stepped jambs and a deep lintel bearing the winged sun
  K.paint(TX.block, TINT);
  for (const sx of [-1, 1]) { K.bbox(Math.min(sx * OW, sx * (OW + 0.9)), LAND, -0.45, Math.max(sx * OW, sx * (OW + 0.9)), OH + 0.6, 0, 0.05); K.bbox(Math.min(sx * (OW + 0.9), sx * (OW + 1.4)), LAND, -0.2, Math.max(sx * (OW + 0.9), sx * (OW + 1.4)), OH + 1.0, 0, 0.05); }
  K.bbox(-OW - 1.6, OH + 0.6, -0.55, OW + 1.6, OH + 2.6, 0, 0.05);
  if (!col) {
    sunDisc(K, ctx, 0, OH + 1.6, -0.56, 0.62, 3.4);
    // the gate's own frame in the recess: jambs, lintel and the stone round the arch
    K.paint(TX.block, TINT);
    for (const sx of [-1, 1]) K.box(Math.min(sx * 1.2, sx * OW), LAND, 0.35, Math.max(sx * 1.2, sx * OW), OH, 0.95);
    K.box(-OW, LAND + 3, 0.35, OW, OH, 0.95);
    archInfill(K, 2.4, 3, 0, 0); K.at(() => archInfill(K, 2.4, 3, 0.35, 0.95), 0, LAND, 0);
    K.paint(null, "#0d0906", 1); K.box(-1.2, LAND, 1.5, 1.2, LAND + 3, 1.6);
    if (lod <= 2) { // painted columns of glyph bands on the jambs
      for (const sx of [-1, 1]) for (let k = 0; k < 8; k++) { K.paint(null, [LAPIS, OCHRE, RED][k % 3], 0.95); const y = LAND + 0.4 + k * 0.6; K.box(Math.min(sx * (OW + 0.15), sx * (OW + 0.75)), y, -0.46, Math.max(sx * (OW + 0.15), sx * (OW + 0.75)), y + 0.32, -0.45); }
    }
  }
  // steps: six risers of 0.18, treads 0.28, wide as the surround, then the landing
  K.paint(TX.floor, TINT, 0.9);
  for (let i = 0; i < 6; i++) { const z0 = -0.45 - 1.68 + i * 0.28 - 0.6; K.bbox(-OW - 1.4, -0.4, z0, OW + 1.4, 0.18 * (i + 1), -0.45, 0.02); }
  K.box(-OW - 1.4, -0.4, -0.45, OW + 1.4, LAND, 0.35);
  K.box(-OW, -0.4, 0.35, OW, LAND, 1.6);
  // the plaza flags before the steps
  K.box(-W, -0.6, -9, W, 0.02, -0.45 - 1.68 - 0.6);
  // the seated kings, colossal, weathered; one has lost his forearm and nose
  K.at(() => king(K, ctx, col, 2.55, 0), -6.5, 0, -2.4, 0);
  K.at(() => king(K, ctx, col, 2.55, 1), 6.5, 0, -2.4, 0);
  for (const [x, y, z] of BRAZIERS) brazier(K, ctx, col, x, y, z);
  if (!col) {
    // red sand drifted up the steps, round the kings' feet and on the plaza
    for (const [x, y, z, rx, ry, rz] of [[-3.2, 0.2, -2.8, 0.8, 0.3, 0.7], [3.1, 0.4, -2.3, 0.6, 0.3, 0.5], [-2.6, 1.1, -0.2, 0.7, 0.2, 0.4], [-1.4, 0.05, -3.5, 0.9, 0.14, 0.5], [-6.5, 0, -5.4, 2.4, 0.5, 0.9], [6.5, 0, -5.6, 2.6, 0.6, 1.0], [-9.5, 0, -1.5, 1.2, 1.6, 1.6], [9.6, 0, -0.8, 1.0, 2.2, 1.4], [0, 0, -7, 3.0, 0.15, 1.5]]) sandPile(K, ctx, x, y, z, rx, ry, rz, OUT.sand, "oklch(0.95 0.02 75)");
    urn(K, ctx, -3.6, 0, -6.4, 0.8, true, 70); urn(K, ctx, 8.6, 0, -4.5, 0.9);
    // a fallen block of cornice in the sand
    K.paint(TX.block, TINT); K.at(() => K.bbox(-1.2, 0, -0.6, 1.2, 0.8, 0.6, 0.05), 4.2, -0.1, -7.6, 22, 0, 6);
  } else K.at(() => K.box(-1.2, 0, -0.6, 1.2, 0.8, 0.6), 4.2, -0.1, -7.6, 22, 0, 6);
}
// a weathered plank board on two posts; its face is -Z at y 1.1..2.3
function sign(K, ctx, col) {
  K.paint(TX.wood, "oklch(0.78 0.05 55)", 0.95);
  for (const sx of [-1, 1]) K.bbox(sx * 1.55 - 0.08, -0.4, -0.08, sx * 1.55 + 0.08, 2.55, 0.08, 0.02);
  if (col) return K.box(-1.7, 1.05, -0.06, 1.7, 2.35, 0.1);
  for (let k = 0; k < 4; k++) { const y = 1.05 + k * 0.32; K.bbox(-1.75 + (k % 2) * 0.06, y, -0.12, 1.72, y + 0.3, -0.06, 0.012); }
  K.paint(TX.iron, "oklch(0.8 0.01 60)", 0.6, 0.6); for (const sx of [-1, 1]) for (const y of [1.2, 2.2]) K.box(sx * 1.55 - 0.1, y, -0.14, sx * 1.55 + 0.1, y + 0.05, -0.12);
  K.paint(TX.wood, "oklch(0.7 0.05 55)"); K.bbox(-1.8, 2.35, -0.14, 1.8, 2.45, 0.1, 0.01);
}
function build(ctx, col) { const K = kit(ctx, col); (ctx.params?.part === "sign" ? sign : mouth)(K, ctx, col); }
export function geometry(ctx) { build(ctx, false); }
export function collider(ctx) { build(ctx, true); }
