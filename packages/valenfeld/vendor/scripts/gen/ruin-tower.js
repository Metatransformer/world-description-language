// THE OLD WATCHTOWER: a Crown watchtower gone to ruin. A round fieldstone drum on a raised plinth, its door
// facing north-east up two steps, a stair spiralling up the inside wall to a plank loft at 8 m, the crown
// broken into jagged teeth and slumped to a rubble breach on the north-west. Origin = the ground-floor centre.
import { kit } from "./barrow-kit.js";
const RO = 5, RI = 4.1, LOFT = 8, D = Math.PI / 180;
const DOOR = -45 * D, SEG = 48, DA = (2 * Math.PI) / SEG;           // door faces +x −z (north-east)
const S0 = DOOR + 22 * D, SW = 3.86, STEPS = 44, SR0 = 2.75, SR1 = RI;  // the stair: start angle, sweep, inner/outer radius
const BREACH = -140 * D;
const TX0 = { stone: "cdn/texture-fieldstone-wall-mossy.png", flag: "cdn/texture-flagstone-floor-worn.png", oak: "cdn/texture-dark-oak-planks-weathered.png", iron: "cdn/texture-wrought-iron.png", rock: "cdn/texture-granite-rock-lichen.png" };
// params.style: valley (default, the original) | desert (sun-bleached sandstone, pale rock, grey driftwood) | coastal (salt-grey granite, black tarred oak)
const TXS = { valley: TX0,
  desert: { stone: "cdn/texture-sandstone-blocks-weathered.png", flag: "cdn/texture-sandstone-paving-sand-drifted.png", oak: "cdn/texture-sun-bleached-grey-driftwood-planks.png", iron: TX0.iron, rock: "cdn/texture-pale-desert-sandstone-rock.png" },
  coastal: { stone: "cdn/texture-salt-weathered-grey-granite-blocks.png", flag: TX0.flag, oak: "cdn/texture-tarred-black-weatherboard-planks.png", iron: TX0.iron, rock: "cdn/texture-granite-rock-lichen.png" } };
let TX = TX0;
const angd = (a, b) => { let d = (a - b) % (2 * Math.PI); if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI; return d; };
const P = (r, a, y) => [r * Math.cos(a), y, r * Math.sin(a)];
function topOf(k, rnd) {
  const a = (k + 0.5) * DA, b = Math.abs(angd(a, BREACH));
  let h = 10.4 + (rnd() - 0.5) * 1.6 + (k % 2 ? 0.5 : 0);                       // teeth
  if (b < 40 * D) h = Math.min(h, 8.7 + (b / (40 * D)) * 1.8 + rnd() * 0.3);       // the breach, waist-high over the loft
  return h;
}
function gapsOf(k) { // vertical openings in this wall segment: [y0, y1][]
  const a0 = k * DA, mid = a0 + DA / 2, g = [];
  if (Math.abs(angd(mid, DOOR)) < DA) g.push([0, 2.5]);
  for (const s of [30, 120, 210]) if (Math.abs(angd(mid, s * D)) < DA / 2) g.push([3.1, 4.3]);
  for (const s of [80, 300]) if (Math.abs(angd(mid, s * D)) < DA / 2) g.push([9.0, 9.9]);
  return g;
}
function build(ctx, col) {
  TX = TXS[ctx.params?.style] ?? TX0;
  const K = kit(ctx, col), lod = col ? 4 : ctx.lod, rnd = (() => { let s = 91; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();
  // ---- the plinth: a squat drum of dressed stone the tower stands on, buried into the hill, two steps at the door
  K.paint(TX.stone, "oklch(0.86 0.01 90)");
  K.cyl(0, -1.8, 0, 6.3, 6.1, 1.8, col ? 16 : 32);
  K.paint(TX.flag, "oklch(0.9 0.01 80)");
  K.cyl(0, -0.02, 0, RI + 0.05, RI + 0.05, 0.04, col ? 16 : 32);
  K.paint(TX.stone, "oklch(0.86 0.01 90)");
  K.at(() => { K.bbox(6.0, -0.5, -1.0, 6.75, -0.17, 1.0); K.bbox(6.6, -0.8, -1.0, 7.2, -0.34, 1.0); for (let i = 0; i < 8; i++) K.bbox(7.1 + i * 0.4, -1.6 - i * 0.18, -1.0, 7.6 + i * 0.4, -0.5 - i * 0.18, 1.0); }, 0, 0, 0, 45);
  // ---- the drum: SEG wall segments, each a curved block from the plinth to its own broken top, openings cut
  K.paint(TX.stone, "oklch(0.9 0.012 95)", 0.95);
  for (let k = 0; k < SEG; k++) {
    const a0 = k * DA, a1 = a0 + DA, h = topOf(k, rnd), cuts = gapsOf(k);
    const spans = []; let y = 0;
    for (const [g0, g1] of cuts.sort((p, q) => p[0] - q[0])) { if (g0 > y) spans.push([y, g0]); y = g1; }
    if (h > y) spans.push([y, h]);
    const m = (a0 + a1) / 2, I = (yy) => P((RO + RI) / 2, m, yy);
    for (const [y0, y1] of spans) {
      const c = I((y0 + y1) / 2);
      K.quad(P(RO, a0, y0), P(RO, a1, y0), P(RO, a1, y1), P(RO, a0, y1), c);
      K.quad(P(RI, a0, y0), P(RI, a1, y0), P(RI, a1, y1), P(RI, a0, y1), c);
      K.quad(P(RI, a0, y1), P(RI, a1, y1), P(RO, a1, y1), P(RO, a0, y1), c);
      K.quad(P(RI, a0, y0), P(RI, a1, y0), P(RO, a1, y0), P(RO, a0, y0), c);
      K.quad(P(RI, a0, y0), P(RO, a0, y0), P(RO, a0, y1), P(RI, a0, y1), c);
      K.quad(P(RI, a1, y0), P(RO, a1, y0), P(RO, a1, y1), P(RI, a1, y1), c);
    }
    if (!col && lod <= 2 && rnd() < 0.5) K.rock(...P((RO + RI) / 2 + (rnd() - 0.5) * 0.4, m, h + 0.12), 0.3, 0.14, 0.24, 6, 4, 0.3); // loose stones on the crown
  }
  if (!col) { // a string course and a proud base batter, the old Crown's one vanity
    for (let k = 0; k < SEG; k++) { const a0 = k * DA, a1 = a0 + DA; if (Math.abs(angd(a0 + DA / 2, DOOR)) < DA) continue;
      K.quad(P(RO + 0.35, a0, 0), P(RO + 0.35, a1, 0), P(RO, a1, 1.1), P(RO, a0, 1.1), [0, 0.5, 0]);
      if (topOf(k, () => 0.5) > 6.5) K.quad(P(RO + 0.12, a0, 6.0), P(RO + 0.12, a1, 6.0), P(RO + 0.12, a1, 6.25), P(RO + 0.12, a0, 6.25), [0, 6.1, 0]); }
    // the door: a voussoir arch over the opening, one rotten leaf still on its upper hinge
    K.paint(TX.rock, "oklch(0.85 0.01 90)");
    for (let i = 0; i <= 6; i++) { const t = -0.8 + (1.6 * i) / 6, ya = 2.5 + Math.cos(t * 1.9) * 0.35; K.at(() => K.bbox(-0.15, 0, -0.1, 0.25, 0.45, 0.1), ...P(RO + 0.05, DOOR + t * DA, ya), 0); }
    K.paint(TX.oak, "oklch(0.6 0.04 55)");
    K.at(() => K.bbox(0, 0, -0.05, 1.1, 2.3, 0.05), ...P(RI - 0.2, DOOR + DA * 0.95, 0.1), 45 + 70, 0, 6);
  }
  // ---- the spiral stair: stone treads cantilevered from the wall; a smooth helix underfoot for the body
  if (col) {
    const N = 40;
    for (let i = 0; i < N; i++) {
      const a0 = S0 + (SW * i) / N, a1 = S0 + (SW * (i + 1)) / N, y0 = (LOFT * i) / N, y1 = (LOFT * (i + 1)) / N;
      K.quad(P(SR0, a0, y0), P(SR1, a0, y0), P(SR1, a1, y1), P(SR0, a1, y1), [0, -50, 0]);
      K.quad(P(SR0, a0, y0 - 0.4), P(SR0, a0, y0), P(SR0, a1, y1), P(SR0, a1, y1 - 0.4), [0, y0, 0]);
    }
  } else {
    K.paint(TX.rock, "oklch(0.82 0.01 90)", 0.95);
    for (let i = 0; i < STEPS; i++) {
      const a0 = S0 + (SW * i) / STEPS, a1 = S0 + (SW * (i + 1)) / STEPS, yt = (LOFT * (i + 1)) / STEPS, yb = yt - 0.28, c = P((SR0 + SR1) / 2, (a0 + a1) / 2, yt - 0.14);
      K.quad(P(SR0, a0, yt), P(SR1 + 0.1, a0, yt), P(SR1 + 0.1, a1, yt), P(SR0, a1, yt), c);
      K.quad(P(SR0, a0, yb), P(SR1 + 0.1, a0, yb), P(SR1 + 0.1, a1, yb), P(SR0, a1, yb), c);
      K.quad(P(SR0, a0, yb), P(SR1 + 0.1, a0, yb), P(SR1 + 0.1, a0, yt), P(SR0, a0, yt), c);
      K.quad(P(SR0, a1, yb), P(SR1 + 0.1, a1, yb), P(SR1 + 0.1, a1, yt), P(SR0, a1, yt), c);
      K.quad(P(SR0, a0, yb), P(SR0, a1, yb), P(SR0, a1, yt), P(SR0, a0, yt), c);
    }
  }
  // ---- the loft at 8 m: planks over the middle and the half of the drum the stair does not climb through
  K.paint(TX.oak, "oklch(0.75 0.04 60)", 0.9);
  const fl = (r0, r1, a0, a1, n) => { for (let i = 0; i < n; i++) { const b0 = a0 + ((a1 - a0) * i) / n, b1 = a0 + ((a1 - a0) * (i + 1)) / n, c = P((r0 + r1) / 2, (b0 + b1) / 2, LOFT - 0.1);
    K.quad(P(r0, b0, LOFT), P(r1, b0, LOFT), P(r1, b1, LOFT), P(r0, b1, LOFT), c);
    if (!col) { K.quad(P(r0, b0, LOFT - 0.2), P(r1, b0, LOFT - 0.2), P(r1, b1, LOFT - 0.2), P(r0, b1, LOFT - 0.2), c); } } };
  fl(0.01, SR0, 0, 2 * Math.PI, col ? 12 : 24);
  fl(SR0 - 0.01, RI + 0.05, S0 + SW, S0 + 2 * Math.PI, col ? 8 : 14);
  if (!col) { // the loft's edge beam and the joists under it, and stubs of the lost middle floor at 4 m
    K.paint(TX.oak, "oklch(0.55 0.03 55)");
    for (let i = 0; i < 6; i++) { const a = S0 + SW + 0.2 + i * 0.42; K.seg(P(RI + 0.3, a, LOFT - 0.35), P(0.2, a + Math.PI, LOFT - 0.35), 0.11, 0.11, 6); }
    for (let i = 0; i < 5; i++) { const a = S0 + SW + 0.25 + i * 0.5, len = 0.6 + rnd() * 1.1; K.seg(P(RI + 0.3, a, 4.1), P(RI - len, a + 0.05, 4.0 - rnd() * 0.3), 0.1, 0.09, 6); }
    K.seg([-1.6, 0.12, 1.4], [1.9, 0.6, 0.2], 0.12, 0.11, 6); // a fallen joist across the ground floor
    K.paint(TX.stone, "oklch(0.85 0.01 90)"); for (let k = 0; k < 9; k++) { const a = BREACH + (rnd() - 0.5) * 1.1, r = 1.4 + rnd() * 2.4; K.rock(...P(r, a, 0.12), 0.3 + rnd() * 0.25, 0.18, 0.25, 6, 4, 0.3); }
    K.web(P(RI - 0.05, S0 + SW + 2.4, LOFT - 0.22), [0, -1, 0], [Math.sin(S0 + SW + 2.4), 0, -Math.cos(S0 + SW + 2.4)], 0.6);
  }
  // ---- the rubble slope under the breach, where the wall's top came down outside
  K.paint(TX.stone, "oklch(0.84 0.012 90)", 0.95);
  if (col) { const c = P(7.6, BREACH, 0); K.box(c[0] - 2.2, -0.6, c[2] - 2.2, c[0] + 2.2, 0.9, c[2] + 2.2); }
  else { const n = lod <= 2 ? 40 : 14; for (let k = 0; k < n; k++) { const f = rnd(), a = BREACH + (rnd() - 0.5) * 0.7, r = RO + 0.6 + f * 4.5; K.rock(...P(r, a, (1 - f) * 1.2 - 0.3 + rnd() * 0.3), 0.35 + rnd() * 0.4, 0.25 + rnd() * 0.2, 0.3 + rnd() * 0.35, 7, 5, 0.3); } }
}
export function geometry(ctx) { build(ctx, false); }
export function collider(ctx) { build(ctx, true); }
