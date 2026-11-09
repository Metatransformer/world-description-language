// Old Thalor Docks: House Thalor's abandoned shipyard on the Aurenmar coast (concept: art-old-thalor-docks).
// Three timber slipways run down the shingle into the sea; on two, the bare-ribbed hulls (scripts/gen/wreck-hull.js,
// placed as children) still sit in their cradles. Around them: a collapsed timber-and-stone shed under a broken mossy
// slate roof, a sheerlegs crane of two leaning masts with its block hanging, stacks of seasoned timber gone grey,
// mooring posts in the surf, a rusted anchor, and the house banner (deep blue, a silver ship) rotting on its pole.
// Local frame: the sea is -Z. Slips run level on the hard (y HARD) from z=+12 to z=BREAK, then fall at SLOPE to z=-24. Ground at local y=0.
import { G, rng, TEX, mossyRock } from "../lib/geo.js";
export const SLOPE = 0.14, HARD = 0.3, BREAK = -8, SLIPS = [-9, 0, 9];
const DRIFT = "cdn/texture-driftwood-bleached-grey.png";
const GREY = "oklch(0.78 0.015 80)", DARK = "oklch(0.55 0.02 60)", RUST = "oklch(0.55 0.1 45)", BLUE = "oklch(0.38 0.09 260)", SILVER = "oklch(0.88 0.01 240)", WEED = "oklch(0.42 0.06 115)";
const rotX = (a) => [1, 0, 0, 0, Math.cos(a), -Math.sin(a), 0, Math.sin(a), Math.cos(a)];
const rotZ = (a) => [Math.cos(a), -Math.sin(a), 0, Math.sin(a), Math.cos(a), 0, 0, 0, 1];
const yAt = (z) => (z >= BREAK ? HARD : HARD + (z - BREAK) * SLOPE);   // slip top: level on the hard, then down into the channel
const SEGS = [[BREAK, 12, 0], [-24, BREAK, Math.atan(SLOPE)]];      // [z0, z1, pitch]
function beam(g, a, b, r) { g.tube([[...a, r], [...b, r]], 6); }
export function geometry(ctx) {
  const g = new G(ctx), lod = ctx.lod || 1, R = rng(4242);
  if (lod >= 5) { ctx.color(GREY); for (const x of SLIPS) for (const [z0, z1, p] of SEGS) g.at({ m: rotX(-p), t: [x, (yAt(z0) + yAt(z1)) / 2, (z0 + z1) / 2] }, () => g.box(0, 0, 0, 4, 0.4, z1 - z0)); g.box(-17, 2, 6, 9, 4, 7); ctx.color(null); return; }
  // slipways: two ground-ways on sleepers, greened below the tide line
  for (const x of SLIPS) {
    ctx.albedo(DRIFT); ctx.color(GREY);
    for (const [z0, z1, p] of SEGS) { const L = z1 - z0, n = Math.max(3, Math.round(L / (lod <= 2 ? 1.5 : 3.5)));
      g.at({ m: rotX(-p), t: [x, (yAt(z0) + yAt(z1)) / 2, (z0 + z1) / 2] }, () => {
        ctx.albedo(DRIFT); ctx.color(GREY);
        for (const sd of [-1, 1]) g.box(sd * 1.1, -0.15, 0, 0.45, 0.3, L + 0.05);
        for (let i = 0; i < n; i++) g.box(0, -0.35, -L / 2 + (i + 0.5) * (L / n), 3.6, 0.18, 0.35);
        if (lod <= 3 && p) { ctx.albedo(null); ctx.color(WEED); for (const sd of [-1, 1]) g.box(sd * 1.1, 0.01, -L * 0.15, 0.47, 0.03, L * 0.7); }
      }); }
    // under-props where the ground falls away
    ctx.albedo(DRIFT); ctx.color(DARK);
    for (let z = -22; z <= -6; z += 4) for (const s of [-1, 1]) beam(g, [x + s * 1.1, yAt(z) - 0.3, z], [x + s * 1.1, yAt(z) - 3.5, z], 0.12);
  }
  // cradles and shores on the two occupied slips (hull children sit at y = slip + 0.9)
  for (const x of [SLIPS[0], SLIPS[1]]) {
    ctx.albedo(DRIFT); ctx.color(GREY);
    for (let z = -6; z <= 6; z += 3) { g.box(x, yAt(z) + 0.45, z, 3.2, 0.3, 0.4); for (const s of [-1, 1]) g.box(x + s * 1.3, yAt(z) + 0.75, z, 0.25, 0.6, 0.35); }
    if (lod <= 3) for (let z = -6; z <= 6; z += 3) for (const s of [-1, 1]) {
      const top = [x + s * 2.0, yAt(z) + 2.2, z], foot = [x + s * 3.6, yAt(z) + 0.05, z + (R() - 0.5)];
      beam(g, foot, top, 0.09);
    }
    // a ladder against the hull side
    if (lod <= 2) { ctx.color(DARK); const z = 1.5; for (const d of [-0.3, 0.3]) beam(g, [x + 3.4, yAt(z), z + d], [x + 2.2, yAt(z) + 3.2, z + d], 0.05); for (let k = 1; k < 8; k++) { const f = k / 8; g.box(x + 3.4 - 1.2 * f, yAt(z) + 3.2 * f, z, 0.06, 0.06, 0.6); } }
  }
  // the third slip holds only a laid keel and a few frames
  { const x = SLIPS[2]; ctx.albedo(DRIFT); ctx.color(GREY); g.box(x, yAt(0) + 0.2, 0, 0.35, 0.4, 14);
    for (let z = -4; z <= 4; z += 2.5) { const y0 = yAt(z) + 0.35; for (const s of [-1, 1]) g.tube([[x, y0, z, 0.1], [x + s * 1.3, y0 + 0.5, z, 0.09], [x + s * 1.7, y0 + 1.8, z, 0.08]], 5); } }
  // the shed: fieldstone back and gable, oak posts, a roof half fallen
  { const cx = -19, cz = 7;
    ctx.albedo(TEX.fieldstone); ctx.color("oklch(0.8 0.02 100)");
    g.box(cx, 1.4, cz + 3.4, 9, 2.8, 0.6); g.box(cx - 4.4, 1.4, cz, 0.6, 2.8, 7.4);
    g.tri([cx - 4.7, 2.8, cz - 3.6], [cx - 4.7, 2.8, cz + 3.6], [cx - 4.7, 5, cz]); g.tri([cx - 4.1, 2.8, cz + 3.6], [cx - 4.1, 2.8, cz - 3.6], [cx - 4.1, 5, cz]);
    ctx.albedo(TEX.oak); ctx.color("oklch(0.55 0.02 60)");
    for (const x of [cx - 1.5, cx + 1.5, cx + 4.3]) beam(g, [x, 0, cz - 3.4], [x, 2.8, cz - 3.4], 0.14);
    g.box(cx, 2.85, cz - 3.4, 9, 0.2, 0.2); g.box(cx, 5, cz, 9.2, 0.2, 0.2);
    for (let i = 0; i < 6; i++) { const x = cx - 4 + i * 1.6, broke = i >= 4; beam(g, [x, 2.85, cz - 3.4], broke ? [x + 0.3, 1.2, cz + 0.5] : [x, 5, cz], 0.08); beam(g, [x, 2.85, cz + 3.4], [x, 5, cz], 0.08); }
    ctx.albedo(TEX.slate); ctx.color("oklch(0.72 0.05 130)");
    const a = Math.atan2(2.15, 3.5);
    g.at({ m: rotX(-a), t: [cx - 1.6, 3.95, cz + 1.75] }, () => g.box(0, 0, 0, 6, 0.12, 4.2));            // back slope, mostly whole
    g.at({ m: rotX(a), t: [cx - 2.4, 3.95, cz - 1.75] }, () => g.box(0, 0, 0, 4.4, 0.12, 4.2));            // front slope, only the west half
    g.at({ m: [...rotZ(0.5)].map((v, i) => v), t: [cx + 3, 0.6, cz - 1] }, () => g.box(0, 0, 0, 3, 0.12, 3.4)); // the fallen piece
    if (lod <= 2) { ctx.albedo(TEX.slate); for (let i = 0; i < 14; i++) g.box(cx + 1 + R() * 4, 0.04, cz - 4 + R() * 5, 0.35, 0.03, 0.25); }
    // inside: a sawpit and a workbench
    ctx.albedo(TEX.oak); ctx.color(DARK); g.box(cx - 2, 0.8, cz + 2.4, 3, 0.12, 0.8); for (const s of [-1, 1]) g.box(cx - 2 + s * 1.3, 0.4, cz + 2.4, 0.12, 0.8, 0.7);
  }
  // sheerlegs: two leaning masts lashed at the head, a block and hook hanging over the first slip
  { const bx = 4.5, bz = 4;
    ctx.albedo(DRIFT); ctx.color(GREY);
    beam(g, [bx + 1.5, 0, bz + 2.5], [bx - 2.2, 9.5, bz], 0.22); beam(g, [bx + 1.5, 0, bz - 2.5], [bx - 2.2, 9.5, bz], 0.22);
    beam(g, [bx + 7, 0, bz], [bx - 2.2, 9.5, bz], 0.06);
    ctx.albedo(null); ctx.color("oklch(0.35 0.02 60)"); g.box(bx - 2.4, 6.5, bz, 0.03, 6, 0.03); g.box(bx - 2.0, 6.5, bz, 0.03, 6, 0.03);
    ctx.color(DARK); g.box(bx - 2.2, 3.4, bz, 0.4, 0.6, 0.3); ctx.color(RUST); g.box(bx - 2.2, 2.9, bz, 0.08, 0.4, 0.08); g.box(bx - 2.1, 2.7, bz, 0.25, 0.08, 0.08);
  }
  // timber stacks gone grey
  ctx.albedo(DRIFT); ctx.color(GREY);
  for (const [x, z, n] of [[-16, -2, 4], [-14, 13, 3], [15, 8, 4]]) for (let r = 0; r < n; r++) for (let k = 0; k < n - r; k++) g.box(x + (k - (n - r - 1) / 2) * 0.62, 0.3 + r * 0.55, z, 0.55, 0.5, 6 - r * 0.4);
  // mooring posts in the surf, weed at their feet
  for (let i = 0; i < 7; i++) { const x = -16 + i * 5.5 + (R() - 0.5), z = -27 - R() * 3, h = 1 + R() * 1.4; ctx.albedo(DRIFT); ctx.color(DARK); g.tube([[x, yAt(z) - 2.5, z, 0.22], [x, yAt(z) + h, z, 0.19]], 6); }
  // the house banner on its pole by the shed
  { const x = -24, z = -1; ctx.albedo(DRIFT); ctx.color(GREY); beam(g, [x, 0, z], [x, 7.5, z], 0.13); g.box(x + 1.1, 7.2, z, 2.4, 0.1, 0.1);
    ctx.albedo(TEX.canvas); ctx.color(BLUE); g.box(x + 1.1, 5.6, z, 1.8, 3.0, 0.03);
    if (lod <= 2) { ctx.albedo(null); ctx.color(SILVER); g.box(x + 1.1, 5.2, z - 0.02, 1.0, 0.18, 0.02); g.tri([x + 0.6, 5.3, z - 0.025], [x + 1.6, 5.3, z - 0.025], [x + 1.1, 6.3, z - 0.025]); g.box(x + 1.1, 5.7, z - 0.02, 0.05, 1.1, 0.02); }
  }
  // a rusted anchor on the shingle
  if (lod <= 3) { ctx.albedo(null); ctx.color(RUST); const x = -12, z = -12; g.at({ m: rotZ(1.3), t: [x, 0.25, z] }, () => { g.box(0, 0, 0, 0.18, 2.4, 0.18); g.box(0, 1.1, 0, 1, 0.14, 0.14); g.tube([[-0.8, -1.4, 0, 0.1], [-0.5, -1.15, 0, 0.11], [0, -1.2, 0, 0.12], [0.5, -1.15, 0, 0.11], [0.8, -1.4, 0, 0.1]], 6); }); }
  // shore rocks, weeded at the waterline
  if (lod <= 3) for (let i = 0; i < (lod <= 1 ? 16 : 7); i++) { const x = -28 + R() * 50, z = -30 + R() * 46; if (Math.abs(((x + 13.5) % 9 + 9) % 9 - 4.5) > 2.5 && z < 10 && x > -14 && x < 14) continue; const k = 0.4 + R() * 0.8;
    mossyRock(g, [x, z < -14 ? yAt(z) - 0.4 : 0, z], [k * 1.4, k * 0.7, k], R() * 3, 500 + i, { rock: TEX.rock, moss: TEX.moss, floor: -0.5 }); }
  ctx.albedo(null); ctx.color(null);
}
export function collider() {
  const out = [];
  for (const x of SLIPS) for (const [z0, z1, p] of SEGS) out.push({ kind: "box", width: 3.6, height: 0.3, depth: z1 - z0, center: [x, (yAt(z0) + yAt(z1)) / 2 - 0.15, (z0 + z1) / 2], rotation: { pitch: -p * 180 / Math.PI } });
  out.push({ kind: "box", width: 9, height: 2.8, depth: 0.6, center: [-19, 1.4, 10.4] }, { kind: "box", width: 0.6, height: 2.8, depth: 7.4, center: [-23.4, 1.4, 7] });
  return out;
}
