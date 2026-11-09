// A first-person fist and forearm: knuckles forward (-Z), back of the hand up (+Y), the wrist at the origin, the sleeve running back toward the eye.
// params.side = "l" | "r" mirrors it; params.skin = an oklch tint for the hand, params.sleeve for the cloth.
// Built finger by finger (chubigans Nov 1: "need to do a better job with hands"): four curled fingers with three phalanges each,
// knuckle heads on the back, the thumb locked across the index and middle, tendons on the back of the hand, a wrist that narrows, a rolled cuff.
import { G } from "../lib/geo.js";
export function geometry(ctx) {
  const g = new G(ctx), p = ctx.params ?? {}, m = p.side === "l" ? -1 : 1;
  const skin = p.skin ?? "oklch(0.70 0.07 52)", knuck = "oklch(0.64 0.085 38)", crease = "oklch(0.55 0.07 40)";
  const sleeve = p.sleeve ?? "oklch(0.40 0.05 62)", cuff = "oklch(0.32 0.045 58)", strap = "oklch(0.30 0.05 45)";
  const X = (x) => x * m, emit = (list) => { for (const t of list) g.tri(t[0], t[1], t[2]); };
  const fine = ctx.lod <= 2, mid = ctx.lod <= 3;
  ctx.smooth();
  ctx.color(skin);
  // palm and back of the hand: wide, flat, a touch higher on the knuckle line
  emit(g.blob([X(0.002), -0.004, -0.048], [0.043, 0.024, 0.044], fine ? 3 : 2, 0.04, 1.3, 3));
  // the heel of the palm under the little-finger side, the thenar pad under the thumb
  emit(g.blob([X(0.026), -0.02, -0.03], [0.018, 0.016, 0.026], 2, 0.05, 1.5, 4));
  emit(g.blob([X(-0.03), -0.02, -0.036], [0.02, 0.018, 0.028], 2, 0.05, 1.5, 5));
  // four curled fingers: index (thumb side, -X) to little; each runs knuckle → forward → down → back under the palm
  const F = [
    { x: -0.029, r: 0.0108, l: 1.0, y: 0.0 },
    { x: -0.0095, r: 0.0114, l: 1.06, y: 0.002 },
    { x: 0.0105, r: 0.0106, l: 1.0, y: 0.0 },
    { x: 0.0285, r: 0.0091, l: 0.86, y: -0.004 },
  ];
  for (let i = 0; i < 4; i++) {
    const f = F[i], x = X(f.x), r = f.r, L = f.l, kz = -0.088 + Math.abs(i - 1.3) * 0.004 * (i === 3 ? 2 : 1);
    const ky = 0.012 + f.y;
    // proximal phalanx: from the knuckle head forward and slightly down
    const k0 = [x, ky, kz], k1 = [x, ky - 0.01 * L, kz - 0.026 * L];
    // middle phalanx: turns straight down
    const k2 = [x, ky - 0.036 * L, kz - 0.03 * L];
    // distal phalanx: tucks back toward the palm
    const k3 = [x, ky - 0.05 * L, kz - 0.012 * L];
    ctx.color(skin);
    g.tube([[...k0, r * 1.05], [...k1, r], [...k2, r * 0.94], [...k3, r * 0.86]], mid ? 9 : 6, { capA: true, capB: true });
    // the knuckle head and the second joint, faintly redder where the skin stretches over bone
    ctx.color(knuck);
    emit(g.blob([x, ky + 0.003, kz + 0.002], [r * 1.12, r * 0.95, r * 1.05], fine ? 2 : 1, 0.03, 2, 11 + i));
    if (mid) emit(g.blob([k1[0], k1[1] - 0.002, k1[2] - 0.003], [r * 1.02, r * 0.98, r * 0.9], 1, 0.02, 2, 21 + i));
    // the crease between neighbours where the curled fingers press together
    if (fine && i < 3) { ctx.color(crease); g.tube([[X(f.x + 0.0098), ky - 0.008, kz - 0.022, 0.0016], [X(f.x + 0.0098), ky - 0.034, kz - 0.028, 0.0016]], 4); }
  }
  // the thumb: from the thenar pad out, then locked across the middle phalanges of the index and middle fingers
  ctx.color(skin);
  g.tube([[X(-0.036), -0.018, -0.042, 0.0135], [X(-0.046), -0.024, -0.072, 0.0128], [X(-0.04), -0.034, -0.1, 0.0118]], mid ? 9 : 6, { capA: true });
  g.tube([[X(-0.04), -0.034, -0.1, 0.0118], [X(-0.022), -0.04, -0.118, 0.0108], [X(-0.004), -0.04, -0.121, 0.0098]], mid ? 9 : 6, { capB: true });
  ctx.color(knuck);
  emit(g.blob([X(-0.041), -0.034, -0.1], [0.0125, 0.012, 0.012], 1, 0.03, 2, 31));
  // the thumbnail, a flat pale oval on the thumb's tip
  if (fine) { ctx.color("oklch(0.80 0.04 40)"); emit(g.blob([X(-0.007), -0.034, -0.124], [0.0062, 0.0022, 0.0055], 1, 0, 1, 32)); }
  // tendons fanning from the wrist to each knuckle across the back of the hand
  if (fine) {
    ctx.color(skin);
    for (let i = 0; i < 4; i++) g.tube([[X(F[i].x * 0.35), 0.014, -0.012, 0.0028], [X(F[i].x * 0.8), 0.019, -0.05, 0.0032], [X(F[i].x), 0.018, -0.078, 0.0026]], 5);
  }
  // wrist (narrower and flatter than the hand), then the forearm swelling toward the elbow
  ctx.color(skin);
  g.tube([[0, -0.004, -0.03, 0.03], [0, -0.004, -0.004, 0.0265], [0, -0.005, 0.03, 0.029], [0, -0.006, 0.09, 0.035]], 12);
  emit(g.blob([X(0.022), -0.006, -0.002], [0.007, 0.007, 0.007], 1, 0, 1, 41)); // the wrist bone on the little-finger side
  // the sleeve: coarse linen with a rolled cuff and a leather wrap, folds bunched behind it
  ctx.color(sleeve);
  g.tube([[0, -0.006, 0.085, 0.043], [0, -0.007, 0.15, 0.05], [0, -0.008, 0.25, 0.055], [0, -0.009, 0.4, 0.06]], 12, { capA: true });
  if (mid) for (let k = 0; k < 3; k++) { const z = 0.15 + k * 0.07; g.tube([[0, -0.007 - k * 0.001, z, 0.051 + k * 0.002], [0, -0.007 - k * 0.001, z + 0.025, 0.053 + k * 0.002]], 12); }
  ctx.color(cuff);
  g.tube([[0, -0.006, 0.078, 0.045], [0, -0.006, 0.088, 0.048], [0, -0.006, 0.104, 0.048], [0, -0.006, 0.114, 0.045]], 12);
  if (fine) { ctx.color(strap); g.tube([[0, -0.006, 0.124, 0.0475], [0, -0.006, 0.136, 0.0475]], 12); }
  ctx.color(null); ctx.flat();
}
