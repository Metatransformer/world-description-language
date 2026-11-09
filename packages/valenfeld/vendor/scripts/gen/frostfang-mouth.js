// FROSTFANG MOUTH: a cave torn into a grey granite crag at the foot of the Hrothspine, snow on every ledge,
// icicles along a split rock lintel carved with a wolf's head, a dressed-stone inner frame holding the portal,
// two iron braziers. Origin = the threshold on the prepared pad; -Z = out of the cave.
// params.part: "mouth" (default) or "sign" (the oak board by the path; its words ride as vector children).
import { kit } from "./barrow-kit.js";
import { brazier_frostfangMouth } from "../lib/pieces/brazier.js";   // shared brazier piece, drawn in this building's palette
const TX = {
  granite: "cdn/texture-grey-granite-cliff-face.png", snow: "cdn/texture-fresh-packed-snow.png", flag: "cdn/texture-worn-flagstone-floor-dungeon.png",
  carved: "cdn/texture-carved-granite-blocks.png", iron: "cdn/texture-wrought-iron.png", oak: "cdn/texture-dark-oak-planks-weathered.png",
};
export const BRAZIERS = [[-3.4, 0, -2.2], [3.4, 0, -2.2]];
const OPEN = (y) => (y < 3 ? 2.4 : y >= 4.6 ? 0 : 2.4 * Math.sqrt(Math.max(0, 1 - ((y - 3) / 1.6) ** 2)));
function ice(ctx, col, a = 1) { if (col) return; ctx.albedo(null); ctx.color("#d6efff", a); ctx.roughness(0.08); ctx.metalness(0); ctx.emissive("#0a2236"); }
function snowcap(K, x, y, z, rx, rz, t = 0.18) { K.rock(x, y, z, rx, t, rz, 9, 4, 0.18); }
function mouth(ctx, col) {
  const K = kit(ctx, col), lod = col ? 4 : ctx.lod;
  const ytop = (x) => 10.5 + 2.2 * ctx.noise2d(x * 0.22 + 7, 3.1) - 0.035 * x * x;
  const fz = (x, y) => 0.022 * x * x + Math.max(0, y - 7) * 0.2 + 0.55 * ctx.noise2d(x * 0.33, y * 0.33) + 0.18 * ctx.noise2d(x * 1.2 + 9, y * 1.2);
  if (col) {
    K.box(-11, -1.5, -0.3, -2.4, 10, 9); K.box(2.4, -1.5, -0.3, 11, 10, 9); K.box(-2.4, 4.4, -0.3, 2.4, 10, 9);
  } else {
    // ---- the granite face: a noise-carved sheet, receding at the sides and leaning back up top, the mouth cut out
    const step = lod <= 2 ? 0.55 : 1.1, NY = lod <= 2 ? 22 : 11, NX = Math.round(22 / step);
    const V = (i, j) => { const x = -11 + i * step, yt = ytop(x), y = -1.5 + ((yt + 1.5) * j) / NY; return [x, y, fz(x, y)]; };
    K.paint(TX.granite, "oklch(0.92 0.01 250)", 0.92); ctx.smooth();
    for (let i = 0; i < NX; i++) for (let j = 0; j < NY; j++) {
      const a = V(i, j), b = V(i + 1, j), c = V(i + 1, j + 1), d = V(i, j + 1);
      const cx = (a[0] + c[0]) / 2, cy = (a[1] + c[1]) / 2;
      if (Math.abs(cx) < OPEN(cy) + 0.15 && cy < 4.9) continue;
      K.quad(a, b, c, d, [cx, cy, 8]);
    }
    ctx.flat();
    // ---- the snow ledge along the crown, running back into the hill
    K.paint(TX.snow, "#ffffff", 0.95); ctx.smooth();
    for (let i = 0; i < NX; i++) {
      const a = V(i, NY), b = V(i + 1, NY);
      K.quad(a, b, [b[0], b[1] + 0.5, b[2] + 4], [a[0], a[1] + 0.5, a[2] + 4], [(a[0] + b[0]) / 2, a[1] - 3, a[2] + 1.5]);
    }
    ctx.flat();
    for (let x = -10.5; x < 10.6; x += 1.4) { const y = ytop(x); snowcap(K, x, y + 0.1, fz(x, y) + 0.4, 0.95, 0.7, 0.22); }
    // ---- ragged rim stones around the opening: the mouth reads torn, not cut
    K.paint(TX.granite, "oklch(0.88 0.01 250)", 0.92);
    const rim = [];
    for (let y = 0.3; y < 3; y += 0.65) { rim.push([-2.45, y]); rim.push([2.45, y]); }
    for (let t = 0; t <= 1.001; t += 1 / 7) { const a = Math.PI * t; rim.push([Math.cos(a) * 2.45, 3 + Math.sin(a) * 1.65]); }
    for (const [x, y] of rim) K.rock(x, y, -0.15 + ctx.random() * 0.2, 0.42 + ctx.random() * 0.25, 0.4 + ctx.random() * 0.25, 0.5, 7, 5, 0.25);
  }
  // ---- the mass behind the face and the two buttress boulders framing the pad
  K.paint(TX.granite, "oklch(0.86 0.01 250)", 0.92);
  if (!col) for (let k = 0; k < 13; k++) {
    const x = -10 + (20 * k) / 12 + (ctx.random() - 0.5) * 1.5, z = 2.5 + ctx.random() * 5, y = ytop(x) - 1.2 - ctx.random() * 2.5;
    const rx = 2.4 + ctx.random() * 1.2, ry = 1.8 + ctx.random() * 0.9, rz = 2.4 + ctx.random() * 1.1;
    K.paint(TX.granite, "oklch(0.86 0.01 250)", 0.92); K.rock(x, y, z, rx, ry, rz, 9, 6, 0.2);
    K.paint(TX.snow, "#ffffff", 0.95); snowcap(K, x, y + ry * 0.78, z, rx * 0.85, rz * 0.85, 0.32);
  }
  for (const s of [-1, 1]) {
    K.paint(TX.granite, "oklch(0.88 0.01 250)", 0.92);
    K.rock(s * 9.6, 1.8, -1.0, 2.4, 2.8, 2.2, 10, 7, 0.16); K.rock(s * 7.1, 0.7, -2.6, 1.5, 1.2, 1.4, 8, 5, 0.2);
    if (!col) { K.paint(TX.snow, "#ffffff", 0.95); snowcap(K, s * 9.6, 4.15, -1.0, 2.0, 1.8, 0.3); snowcap(K, s * 7.1, 1.65, -2.6, 1.25, 1.15, 0.2); }
  }
  // ---- the passage: flagged floor, granite walls and roof, back wall; the dressed inner frame holds the glass at z = 2.6
  K.paint(TX.flag, "oklch(0.9 0.01 240)", 0.85); K.box(-2.5, -0.4, -2.2, 2.5, 0.04, 3.9);
  K.paint(TX.granite, "oklch(0.78 0.01 250)", 0.95);
  K.box(-3.1, 0, -0.4, -2.3, 4.2, 3.9); K.box(2.3, 0, -0.4, 3.1, 4.2, 3.9);
  K.box(-3.1, 4.0, -0.3, 3.1, 4.8, 4.5); K.box(-3.1, 0, 3.8, 3.1, 4.8, 4.5);
  K.paint(TX.carved, "oklch(0.9 0.01 240)", 0.8);
  K.bbox(-2.3, 0, 2.3, -1.2, 3.0, 2.9, 0.04); K.bbox(1.2, 0, 2.3, 2.3, 3.0, 2.9, 0.04); K.bbox(-2.35, 3.0, 2.25, 2.35, 4.0, 2.95, 0.04);
  if (!col) {
    K.bbox(-2.45, 0, 2.2, -1.1, 0.3, 3.0, 0.03); K.bbox(1.1, 0, 2.2, 2.45, 0.3, 3.0, 0.03); // plinths
    K.bbox(-0.35, 2.9, 2.15, 0.35, 3.55, 3.0, 0.03); // keystone
    K.paint(TX.snow, "#ffffff", 0.95); for (let x = -2.2; x < 2.3; x += 0.75) snowcap(K, x, 0.08, -0.2 - ctx.random() * 1.6, 0.5, 0.4, 0.09);
  }
  // ---- the split lintel and the wolf's head carved above it
  if (!col) {
    K.paint(TX.granite, "oklch(0.84 0.01 250)", 0.9);
    K.at(() => K.bbox(-3.7, 0, -0.55, -0.07, 0.85, 0.5, 0.06), 0, 4.55, -0.55, 0, 0, -3);
    K.at(() => K.bbox(0.07, 0, -0.55, 3.7, 0.85, 0.5, 0.06), 0, 4.46, -0.55, 0, 0, 4);
    K.paint(null, "#0c0d10", 1); K.box(-0.09, 4.4, -0.9, 0.09, 5.45, -0.2);
    K.paint(TX.carved, "oklch(0.86 0.01 250)", 0.85); K.bbox(-1.7, 5.35, -0.8, 1.7, 7.9, 0.2, 0.06);
    K.paint(TX.granite, "oklch(0.9 0.01 250)", 0.85); ctx.smooth();
    K.rock(0, 6.55, -0.98, 0.62, 0.55, 0.42, 10, 7, 0.04);
    for (let k = 0; k < 9; k++) { const a = Math.PI * (0.1 + (0.8 * k) / 8) + Math.PI; const r = 0.75; K.rock(Math.cos(a) * r * -1, 6.5 - Math.sin(a) * r * 0.9, -0.85, 0.22, 0.28, 0.18, 6, 4, 0.2); }
    K.seg([0, 6.38, -1.15], [0, 6.1, -1.95], 0.3, 0.17, 9, true);
    K.seg([0, 6.02, -1.1], [0, 5.88, -1.72], 0.2, 0.1, 7, true);
    for (const s of [-1, 1]) K.seg([s * 0.36, 6.95, -0.98], [s * 0.6, 7.68, -0.88], 0.21, 0.02, 5, true);
    K.seg([-0.46, 6.8, -1.22], [0.46, 6.8, -1.22], 0.09, 0.09, 6, true);
    ctx.flat();
    K.paint(null, "#15161a", 1); K.rock(0, 6.14, -2.0, 0.1, 0.08, 0.07, 6, 4, 0.1);
    K.paint(null, "#e8e1cf", 0.6); for (const s of [-1, 1]) { K.seg([s * 0.12, 6.0, -1.82], [s * 0.12, 5.7, -1.84], 0.04, 0.004, 5, true); K.seg([s * 0.18, 5.95, -1.6], [s * 0.18, 5.78, -1.62], 0.03, 0.004, 5, true); }
    ctx.albedo(null); ctx.color("#9fdcff"); ctx.emissive("#7fd4ff"); ctx.roughness(0.2);
    for (const s of [-1, 1]) K.rock(s * 0.25, 6.64, -1.32, 0.075, 0.05, 0.04, 6, 4, 0.05);
    ctx.emissive(null);
    K.paint(TX.snow, "#ffffff", 0.95); snowcap(K, -1.9, 5.48, -0.4, 1.9, 0.55, 0.13); snowcap(K, 1.9, 5.42, -0.4, 1.9, 0.55, 0.13); snowcap(K, 0, 7.95, -0.3, 1.8, 0.55, 0.15);
    // ---- icicles along the lintel lip and the crown of the mouth
    ice(ctx, col);
    const n = lod <= 1 ? 34 : lod <= 2 ? 18 : 0;
    for (let k = 0; k < n; k++) {
      const x = -3.5 + (7 * k) / Math.max(1, n - 1) + (ctx.random() - 0.5) * 0.12, y = 4.5 + (x < 0 ? 0.05 : -0.04), z = -0.95 + ctx.random() * 0.25;
      const len = 0.18 + Math.pow(ctx.random(), 1.6) * (Math.abs(x) < 2.2 ? 0.9 : 0.6);
      K.seg([x, y, z], [x, y - len, z], 0.035 + ctx.random() * 0.03, 0.004, 5);
    }
    for (let k = 0; k < (lod <= 2 ? 10 : 0); k++) { const x = -1.6 + 0.35 * k; K.seg([x, 5.36, -0.82], [x, 5.36 - 0.15 - ctx.random() * 0.4, -0.84], 0.03, 0.004, 5); }
  }
  for (const [x, y, z] of BRAZIERS) brazier(K, ctx, col, x, y, z);
}
function sign(ctx, col) {
  const K = kit(ctx, col);
  if (col) { K.box(-1.65, 0, -0.12, 1.65, 2.45, 0.12); return; }
  K.paint(TX.oak, "oklch(0.88 0.03 65)", 0.9);
  K.bbox(-1.58, -0.3, -0.09, -1.4, 2.45, 0.09, 0.02); K.bbox(1.4, -0.3, -0.09, 1.58, 2.45, 0.09, 0.02);
  K.bbox(-1.48, 1.12, -0.045, 1.48, 2.18, 0.045, 0.015);
  K.bbox(-1.66, 2.18, -0.08, 1.66, 2.3, 0.08, 0.02);
  K.paint(TX.iron, "oklch(0.85 0 0)", 0.55, 0.7);
  for (const s of [-1, 1]) { K.box(s * 1.5 - 0.11, 1.3, -0.06, s * 1.5 + 0.11, 1.36, 0.06); K.box(s * 1.5 - 0.11, 1.95, -0.06, s * 1.5 + 0.11, 2.01, 0.06); }
  K.paint(TX.snow, "#ffffff", 0.95); K.rock(0, 2.32, 0, 1.6, 0.06, 0.1, 12, 4, 0.12); for (const s of [-1, 1]) K.rock(s * 1.49, 2.47, 0, 0.12, 0.05, 0.12, 6, 3, 0.1);
  K.paint(TX.granite, "oklch(0.86 0.01 250)", 0.92); for (const s of [-1, 1]) for (let k = 0; k < 4; k++) { const a = k * 1.7; K.rock(s * 1.49 + Math.cos(a) * 0.22, 0.05, Math.sin(a) * 0.22, 0.16, 0.12, 0.14, 6, 4, 0.2); }
  ice(ctx, col); for (let k = 0; k < 9; k++) { const x = -1.4 + k * 0.35; K.seg([x, 2.18, -0.07], [x, 2.18 - 0.08 - ctx.random() * 0.22, -0.07], 0.018, 0.003, 5); }
}
export function geometry(ctx) { return (ctx.params?.part === "sign" ? sign : mouth)(ctx, false); }
export function collider(ctx) { return (ctx.params?.part === "sign" ? sign : mouth)(ctx, true); }
const brazier = brazier_frostfangMouth({ TX });
