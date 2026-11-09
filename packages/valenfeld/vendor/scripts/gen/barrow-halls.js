// THE BARROW HALLS: the first dungeon, one shell of fieldstone, root-laced earth and old timber.
// Coordinates below are the place's own (floor y = 0); the root stands at z = -40, so ZO shifts them.
// part: "halls" (the whole dungeon), "portcullis" (the raised iron gate), "stone" (the Barrow Stone).
import { kit } from "./barrow-kit.js";
const ZO = 40, T = 0.7;
const TX = {
  stone: "cdn/texture-fieldstone-wall-mossy.png", floor: "cdn/texture-worn-flagstone-floor-dungeon.png", earth: "cdn/texture-root-laced-earth-ceiling.png",
  oak: "cdn/texture-dark-oak-planks-weathered.png", carved: "cdn/texture-carved-granite-blocks.png", iron: "cdn/texture-wrought-iron.png", vault: "cdn/texture-ancient-stone-vault-blocks.png",
};
const NICHE = [[0.45, 1.15], [1.55, 2.25]];
export const ROOMS = [
  { id: "entry", x0: -5, x1: 5, z0: -10, z1: 0, h: 4, ceil: "earth", open: { S: [[-1.75, 1.75, [[0, 3.2]]]] } },
  { id: "c1", x0: -1.75, x1: 1.75, z0: -25, z1: -10, h: 3.2, ceil: "earth", full: ["N", "S"], open: { W: [[-22, -14, [[0, 3.0]]]], E: [[-21, -17, [[0, 3.2]]], [-15.8, -13.8, NICHE]] } },
  { id: "bay", x0: -4.8, x1: -1.75, z0: -22, z1: -14, h: 3.0, ceil: "earth", full: ["E"], open: { W: [[-21.2, -19.2, NICHE], [-16.8, -14.8, NICHE]] } },
  { id: "crypt", x0: -8, x1: 8, z0: -45, z1: -25, h: 5, ceil: "vault", open: { N: [[-1.75, 1.75, [[0, 3.2]]]], S: [[-1.75, 1.75, [[0, 3.6]]]] } },
  { id: "c2", x0: -1.75, x1: 1.75, z0: -57, z1: -45, h: 3.6, ceil: "earth", full: ["N", "S"] },
  { id: "boss", x0: -11, x1: 11, z0: -79, z1: -57, h: 7, ceil: "vault", open: { N: [[-1.75, 1.75, [[0, 3.6]]]] } },
];
function shell(K, ctx, col) {
  const lod = col ? 4 : ctx.lod;
  for (const r of ROOMS) {
    const full = r.full || [], ext = (s) => (full.includes(s) ? 0 : T), top = r.h + 0.5;
    // floor and ceiling
    const fx0 = r.x0 - ext("W"), fx1 = r.x1 + ext("E"), fz0 = r.z0 - ext("S"), fz1 = r.z1 + ext("N");
    K.paint(TX.floor, "oklch(0.9 0.01 80)", 0.85); K.box(fx0, -0.4, fz0, fx1, 0, fz1);
    K.paint(r.ceil === "earth" ? TX.earth : TX.vault, "oklch(0.92 0.02 70)", 1); K.box(fx0, r.h, fz0, fx1, top, fz1);
    for (const side of ["N", "S", "W", "E"]) {
      if (full.includes(side)) continue;
      const alongX = side === "N" || side === "S";
      const lo = alongX ? r.x0 - ext("W") : r.z0, hi = alongX ? r.x1 + ext("E") : r.z1;
      const solid = (a, b, y0, y1) => {
        if (b - a < 0.001 || y1 - y0 < 0.001) return;
        K.paint(TX.stone, "oklch(0.9 0.01 90)");
        if (side === "N") K.box(a, y0, r.z1, b, y1, r.z1 + T);
        if (side === "S") K.box(a, y0, r.z0 - T, b, y1, r.z0);
        if (side === "W") K.box(r.x0 - T, y0, a, r.x0, y1, b);
        if (side === "E") K.box(r.x1, y0, a, r.x1 + T, y1, b);
        if (col || lod > 2) return;
        const band = (ya, yb, p) => { // a proud course on the inner face
          K.paint(TX.carved, "oklch(0.9 0.01 90)");
          const a2 = Math.max(a, alongX ? r.x0 : r.z0), b2 = Math.min(b, alongX ? r.x1 : r.z1); if (b2 - a2 < 0.05) return;
          if (side === "N") K.box(a2, ya, r.z1 - p, b2, yb, r.z1);
          if (side === "S") K.box(a2, ya, r.z0, b2, yb, r.z0 + p);
          if (side === "W") K.box(r.x0, ya, a2, r.x0 + p, yb, b2);
          if (side === "E") K.box(r.x1 - p, ya, a2, r.x1, yb, b2);
        };
        if (y0 <= 0) band(0, 0.38, 0.1);
        if (y1 >= top - 0.01 && r.h - 0.16 > y0) band(r.h - 0.16, r.h, 0.12);
      };
      const opens = (r.open?.[side] || []).slice().sort((p, q) => p[0] - q[0]);
      let cur = lo;
      for (const [a, b, wins] of opens) {
        solid(cur, a, -0.4, top);
        let yc = -0.4;
        for (const [ylo, yhi] of wins) {
          solid(a, b, yc, ylo);
          if (ylo > 0.01) { // a burial niche: its back wall behind the cut
            K.paint(TX.earth, "oklch(0.9 0.02 70)");
            if (side === "N") K.box(a, ylo, r.z1 + T, b, yhi, r.z1 + T + 0.3);
            if (side === "S") K.box(a, ylo, r.z0 - T - 0.3, b, yhi, r.z0 - T);
            if (side === "W") K.box(r.x0 - T - 0.3, ylo, a, r.x0 - T, yhi, b);
            if (side === "E") K.box(r.x1 + T, ylo, a, r.x1 + T + 0.3, yhi, b);
          }
          yc = yhi;
        }
        solid(a, b, yc, top);
        cur = b;
      }
      solid(cur, hi, -0.4, top);
    }
  }
  // the collapse behind c1's east wall: a closed mass of earth, the hole filled by rubble
  K.paint(TX.earth, "oklch(0.9 0.02 70)"); K.box(2.45, -0.4, -21.6, 3.9, 3.7, -16.4);
}
function dress(K, ctx, col) {
  const lod = col ? 4 : ctx.lod;
  const oak = () => K.paint(TX.oak, "oklch(0.9 0.02 70)", 0.9);
  const stone = () => K.paint(TX.stone, "oklch(0.9 0.01 90)");
  const carved = () => K.paint(TX.carved, "oklch(0.92 0.01 90)", 0.8);
  // ---------- ENTRY HALL: the return gate's stone frame, timber, urns, a bench, bones
  carved();
  K.bbox(-1.85, 0, -1.95, -1.25, 3.2, -1.05, 0.04); K.bbox(1.25, 0, -1.95, 1.85, 3.2, -1.05, 0.04);
  K.bbox(-2.1, 3.05, -2.0, 2.1, 3.6, -1.0, 0.04);
  if (!col && lod <= 3) {
    oak();
    for (const z of [-3.2, -6.8]) { for (const x of [-4.85, 4.6]) K.bbox(x, 0, z - 0.14, x + 0.25, 4, z + 0.14, 0.03); K.bbox(-5, 3.62, z - 0.16, 5, 3.98, z + 0.16, 0.03); }
    K.bbox(-1.9, 2.95, -10.15, 1.9, 3.3, -9.85, 0.03);
  }
  stone(); K.bbox(3.7, 0, -5.4, 4.95, 0.5, -3.6, 0.04);
  if (!col) {
    K.paint(TX.carved, "oklch(0.85 0.03 60)", 0.7);
    for (const [x, z, s] of [[-4.3, -8.9, 1], [-3.7, -9.3, 0.8], [4.3, -8.7, 0.9]]) { K.seg([x, 0, z], [x, 0.35 * s, z], 0.16 * s, 0.24 * s, 10, true); K.seg([x, 0.35 * s, z], [x, 0.62 * s, z], 0.24 * s, 0.12 * s, 10, true); }
    if (lod <= 3) { K.at(() => K.skeleton(false), 4.3, 0.5, -4.5, 180); K.at(() => K.skeleton(true), -3.2, 0.01, -7.6, 35, 0, 6); }
  }
  // ---------- CORRIDOR 1: timber frames, the bay's beam, niche skeletons, the collapse
  if (!col && lod <= 3) {
    oak();
    for (const z of [-11, -12.9, -23.2, -24.6]) { K.bbox(-1.75, 0, z - 0.13, -1.5, 3.2, z + 0.13, 0.03); K.bbox(1.5, 0, z - 0.13, 1.75, 3.2, z + 0.13, 0.03); K.bbox(-1.75, 2.88, z - 0.15, 1.75, 3.2, z + 0.15, 0.03); }
    K.bbox(-1.95, 2.72, -22.1, -1.6, 3.0, -13.9, 0.03); K.bbox(-1.9, 0, -22.1, -1.6, 2.72, -21.8, 0.03); K.bbox(-1.9, 0, -14.2, -1.6, 2.72, -13.9, 0.03);
    // the bay's back-wall frames between niches
    K.bbox(-4.8, 0, -18.2, -4.55, 3.0, -17.8, 0.03);
    // skeletons in the niches
    for (const [z, y] of [[-20.2, 0.45], [-20.2, 1.55], [-15.8, 0.45], [-15.8, 1.55]]) K.at(() => K.skeleton(y > 1), -5.15, y + 0.01, z, (ctx.random() - 0.5) * 16);
    for (const y of [0.45, 1.55]) K.at(() => K.skeleton(y > 1), 2.1, y + 0.01, -14.8, 180 + (ctx.random() - 0.5) * 14);
  }
  // rubble spilling from the collapse (big pieces collide)
  K.paint(TX.stone, "oklch(0.86 0.01 80)");
  const rub = [[1.95, 0.45, -19, 0.7, 0.5, 0.9], [2.2, 1.3, -18, 0.6, 0.55, 0.7], [2.1, 1.25, -20.1, 0.65, 0.6, 0.6], [2.25, 2.2, -19.2, 0.6, 0.6, 0.85], [2.3, 2.95, -18.1, 0.5, 0.35, 0.6], [1.3, 0.3, -18.4, 0.5, 0.3, 0.55], [1.2, 0.25, -20.2, 0.45, 0.25, 0.5]];
  for (const [x, y, z, a, b, c] of rub) K.rock(x, y, z, a, b, c, 8, 5, 0.2);
  if (!col) {
    for (let k = 0; k < (lod <= 2 ? 26 : 8); k++) K.rock(0.6 + ctx.random() * 1.5, 0.08, -21.3 + ctx.random() * 4.6, 0.12 + ctx.random() * 0.12, 0.08, 0.12 + ctx.random() * 0.1, 6, 4, 0.3);
    oak(); K.seg([0.9, 0.15, -21.4], [2.3, 2.6, -17.3], 0.12, 0.11, 6, true);
  }
  // roots hanging from the earth ceilings
  if (!col && lod <= 2) {
    K.paint(TX.oak, "oklch(0.75 0.04 60)", 1);
    for (let k = 0; k < 16; k++) K.root(-4.5 + ctx.random() * 9, 4, -0.8 - ctx.random() * 8.8, 0.5 + ctx.random() * 0.9);
    for (let k = 0; k < 14; k++) K.root(-1.6 + ctx.random() * 3.2, 3.2, -10.3 - ctx.random() * 14.5, 0.3 + ctx.random() * 0.55);
    for (let k = 0; k < 8; k++) K.root(-4.6 + ctx.random() * 2.7, 3.0, -14.3 - ctx.random() * 7.4, 0.3 + ctx.random() * 0.4);
    for (let k = 0; k < 8; k++) K.root(-1.6 + ctx.random() * 3.2, 3.6, -45.3 - ctx.random() * 11.4, 0.3 + ctx.random() * 0.6);
    for (let k = 0; k < 6; k++) K.root(2.5 + ctx.random() * 0.4, 3.2, -21 + ctx.random() * 4, 0.6 + ctx.random() * 0.8);
  }
  // ---------- CRYPT HALL: pillars, vault ribs, sarcophagi, cobwebs, the drip's puddle
  const pillar = (x, z, r, h) => {
    carved(); K.bbox(x - r - 0.12, 0, z - r - 0.12, x + r + 0.12, 0.35, z + r + 0.12, 0.04);
    if (col) K.box(x - r, 0, z - r, x + r, h, z + r); else { K.paint(TX.stone, "oklch(0.9 0.01 90)"); K.cyl(x, 0.35, z, r, r * 0.92, h - 0.75, 10); }
    carved(); K.bbox(x - r - 0.15, h - 0.4, z - r - 0.15, x + r + 0.15, h, z + r + 0.15, 0.04);
  };
  for (const z of [-31, -38]) for (const x of [-5.8, 5.8]) pillar(x, z, 0.45, 4.55);
  if (!col) {
    carved();
    for (const z of [-31, -38]) K.box(-8, 4.55, z - 0.3, 8, 5, z + 0.3);
    for (const x of [-5.8, 5.8]) K.box(x - 0.3, 4.55, -45, x + 0.3, 5, -25);
  }
  const sarc = (cx, cz, yaw, ajar, effigy) => K.at(() => {
    carved(); K.bbox(-0.58, 0, -1.12, 0.58, 0.14, 1.12, 0.03);
    K.bbox(-0.5, 0.14, -1.04, 0.5, 0.8, 1.04, 0.03);
    if (col) return;
    K.at(() => {
      K.bbox(-0.55, 0, -1.09, 0.55, 0.12, 1.09, 0.03);
      K.quad([-0.5, 0.12, -1.05], [0.5, 0.12, -1.05], [0.5, 0.12, 1.05], [-0.5, 0.12, 1.05], [0, -1, 0]);
      K.quad([-0.5, 0.12, -1.05], [0, 0.24, -1.05], [0, 0.24, 1.05], [-0.5, 0.12, 1.05], [0, 0, 0]);
      K.quad([0.5, 0.12, -1.05], [0, 0.24, -1.05], [0, 0.24, 1.05], [0.5, 0.12, 1.05], [0, 0, 0]);
      K.tri([-0.5, 0.12, -1.05], [0.5, 0.12, -1.05], [0, 0.24, -1.05], [0, 0.15, 0]);
      K.tri([-0.5, 0.12, 1.05], [0.5, 0.12, 1.05], [0, 0.24, 1.05], [0, 0.15, 0]);
      if (effigy) { K.rock(0, 0.33, -0.72, 0.13, 0.11, 0.15, 7, 5, 0.06); K.rock(0, 0.3, -0.1, 0.26, 0.1, 0.48, 8, 5, 0.06); K.rock(0, 0.27, 0.6, 0.2, 0.07, 0.36, 7, 4, 0.06); K.paint(TX.iron, "oklch(0.9 0.01 60)", 0.5, 0.7); K.seg([0, 0.4, -0.5], [0, 0.4, 0.75], 0.025, 0.02, 4, true); }
    }, ajar ? 0.22 : 0, 0.8, ajar ? 0.25 : 0, ajar ? 14 : 0);
    if (ajar && lod <= 3) { ctx.albedo(null); ctx.color("#0d0c0b"); K.box(-0.44, 0.78, -0.98, 0.44, 0.79, 0.98); }
  }, cx, 0, cz, yaw);
  for (const z of [-27.5, -34.5, -41.5]) { sarc(-6.9, z, 90, false, z === -34.5); sarc(6.9, z, 90, z === -41.5, false); }
  carved(); K.bbox(-0.9, 0, -35.5, 0.9, 0.22, -32.5, 0.04);
  K.at(() => sarc(0, 0, 0, false, true), 0, 0.22, -34);
  if (!col) {
    // the drip's puddle and the stain above it
    ctx.albedo(null); ctx.color("#14181c"); ctx.roughness(0.05); ctx.metalness(0.2);
    const pc = [2.5, 0.006, -32]; for (let k = 0; k < 12; k++) { const a = (k / 12) * 6.283, b = ((k + 1) / 12) * 6.283, ra = 0.42 + 0.08 * Math.sin(k * 2.1), rb = 0.42 + 0.08 * Math.sin((k + 1) * 2.1); K.tri(pc, [pc[0] + Math.cos(a) * ra, pc[1], pc[2] + Math.sin(a) * ra], [pc[0] + Math.cos(b) * rb, pc[1], pc[2] + Math.sin(b) * rb], [pc[0], -1, pc[2]]); }
    // cobwebs in the crypt's and boss chamber's upper corners and pillar heads
    for (const [x, z, ux, vz] of [[-8, -25, 1, -1], [8, -25, -1, -1], [-8, -45, 1, 1], [8, -45, -1, 1]]) K.web([x, 5, z], [ux, 0, 0], [0, -1, vz * 0], 1.3), K.web([x, 5, z], [0, 0, vz], [0, -1, 0], 1.1);
    for (const [x, z] of [[-5.8, -31], [5.8, -38], [5.8, -31]]) K.web([x + 0.6, 4.55, z], [1, 0, 0], [0, -0.7, 0.7], 0.9);
    for (const [x, z, ux, vz] of [[-11, -57, 1, -1], [11, -57, -1, -1], [-11, -79, 1, 1], [11, -79, -1, 1]]) K.web([x, 7, z], [ux, 0, 0], [0, 0, vz], 1.8);
    if (lod <= 3) { K.at(() => K.skeleton(true), -2.8, 0.01, -27.3, 120); K.at(() => K.skeleton(true), 3.2, 0.01, -43.6, -40, 0, 5); }
  }
  // ---------- CORRIDOR 2: frames and the portcullis's stone jambs and slot
  carved(); K.bbox(-1.75, 0, -51.3, -1.42, 3.6, -50.7, 0.04); K.bbox(1.42, 0, -51.3, 1.75, 3.6, -50.7, 0.04);
  if (!col && lod <= 3) {
    oak(); for (const z of [-46.2, -55.8]) { K.bbox(-1.75, 0, z - 0.13, -1.5, 3.6, z + 0.13, 0.03); K.bbox(1.5, 0, z - 0.13, 1.75, 3.6, z + 0.13, 0.03); K.bbox(-1.75, 3.28, z - 0.15, 1.75, 3.6, z + 0.15, 0.03); }
    carved(); K.bbox(-1.75, 3.3, -51.45, 1.75, 3.6, -50.55, 0.03);
  }
  // ---------- BOSS CHAMBER: great pillars, ribs, the dais and its steps, altar, throne
  for (const z of [-61, -67.5, -74]) for (const x of [-7.6, 7.6]) pillar(x, z, 0.7, 6.4);
  if (!col) { carved(); for (const z of [-61, -67.5, -74]) K.box(-11, 6.4, z - 0.4, 11, 7, z + 0.4); for (const x of [-7.6, 7.6]) K.box(x - 0.4, 6.4, -79, x + 0.4, 7, -57); }
  carved();
  K.bbox(-6.5, 0, -79, 6.5, 0.6, -70.22, 0.05);
  K.bbox(-6.2, 0, -70.22, 6.2, 0.4, -69.94, 0.03);
  K.bbox(-5.9, 0, -69.94, 5.9, 0.2, -69.66, 0.03);
  // altar at (0, 0.6, -75): plinth, body, top slab (top y = 1.62)
  K.bbox(-0.85, 0.6, -75.55, 0.85, 0.76, -74.45, 0.03);
  K.bbox(-0.68, 0.76, -75.4, 0.68, 1.5, -74.6, 0.03);
  K.bbox(-0.78, 1.5, -75.5, 0.78, 1.62, -74.5, 0.03);
  if (!col) { K.paint(null, "#2a2622", 0.4); K.box(-0.3, 1.62, -75.2, 0.3, 1.625, -74.8); }
  // the throne
  stone();
  K.bbox(-0.85, 0.6, -78.5, 0.85, 1.12, -77.35, 0.04);
  K.bbox(-0.95, 0.6, -78.85, 0.95, 3.3, -78.45, 0.04);
  K.bbox(-1.05, 0.6, -78.5, -0.82, 1.55, -77.3, 0.03); K.bbox(0.82, 0.6, -78.5, 1.05, 1.55, -77.3, 0.03);
  if (!col) {
    K.tri([-0.95, 3.3, -78.45], [0.95, 3.3, -78.45], [0, 4.1, -78.45], [0, 3.5, -78.65]);
    K.tri([-0.95, 3.3, -78.85], [0.95, 3.3, -78.85], [0, 4.1, -78.85], [0, 3.5, -78.65]);
    K.quad([-0.95, 3.3, -78.45], [0, 4.1, -78.45], [0, 4.1, -78.85], [-0.95, 3.3, -78.85], [0, 3.5, -78.65]);
    K.quad([0.95, 3.3, -78.45], [0, 4.1, -78.45], [0, 4.1, -78.85], [0.95, 3.3, -78.85], [0, 3.5, -78.65]);
    K.paint(TX.iron, "oklch(0.9 0.01 60)", 0.5, 0.7); K.rock(0, 3.45, -78.42, 0.18, 0.18, 0.04, 8, 4, 0.05);
    // banners of rotted cloth on the back wall
    for (const x of [-4, 4]) { K.paint(null, "oklch(0.32 0.07 30)", 1); K.box(x - 0.7, 2.2, -78.98, x + 0.7, 5.6, -78.93); K.tri([x - 0.7, 2.2, -78.93], [x + 0.7, 2.2, -78.93], [x, 1.6, -78.93], [x, 3, -79.5]); K.paint(TX.oak, "oklch(0.9 0.02 70)"); K.seg([x - 0.9, 5.65, -78.9], [x + 0.9, 5.65, -78.9], 0.04, 0.04, 5, true); }
    if (lod <= 3) for (const [x, z, y] of [[-3, -66, 0], [5.5, -71, 0], [-2.2, -72.5, 0.6], [1.8, -76.6, 0.6]]) K.at(() => K.skeleton(ctx.random() > 0.5), x, y + 0.01, z, ctx.random() * 360);
  }
  // ---------- wall torches and iron braziers (their flames are child fx rows)
  for (const [x, y, z, nx, nz] of TORCHES) {
    if (col) continue;
    K.paint(TX.iron, "oklch(0.9 0.01 60)", 0.55, 0.7);
    K.box(x + (nx ? 0 : -0.06), y - 0.75, z + (nz ? 0 : -0.06), x + nx * 0.14 + (nx ? 0 : 0.06), y - 0.45, z + nz * 0.14 + (nz ? 0 : 0.06));
    K.seg([x + nx * 0.12, y - 0.6, z + nz * 0.12], [x + nx * 0.28, y - 0.1, z + nz * 0.28], 0.02, 0.02, 4);
    K.seg([x + nx * 0.29, y - 0.14, z + nz * 0.29], [x + nx * 0.3, y, z + nz * 0.3], 0.05, 0.075, 6);
    K.paint(TX.oak, "oklch(0.8 0.03 60)"); K.seg([x + nx * 0.15, y - 0.72, z + nz * 0.15], [x + nx * 0.3, y - 0.05, z + nz * 0.3], 0.03, 0.04, 5);
    K.paint(null, "#16120f", 1); K.cyl(x + nx * 0.3, y - 0.04, z + nz * 0.3, 0.055, 0.045, 0.07, 6);
  }
  for (const [x, y, z] of BRAZIERS) {
    if (col) { K.box(x - 0.45, y, z - 0.45, x + 0.45, y + 1.15, z + 0.45); continue; }
    K.paint(TX.iron, "oklch(0.9 0.01 60)", 0.55, 0.7);
    for (let k = 0; k < 3; k++) { const a = (k / 3) * 6.283 + 0.5; K.seg([x + Math.cos(a) * 0.5, y, z + Math.sin(a) * 0.5], [x + Math.cos(a) * 0.24, y + 0.92, z + Math.sin(a) * 0.24], 0.035, 0.028, 5); }
    K.seg([x, y + 0.84, z], [x, y + 1.15, z], 0.26, 0.5, 12, true);
    K.seg([x, y + 1.13, z], [x, y + 1.17, z], 0.52, 0.52, 12);
    K.paint(null, "#2a120a", 1); for (let k = 0; k < 7; k++) K.rock(x + (ctx.random() - 0.5) * 0.5, y + 1.15, z + (ctx.random() - 0.5) * 0.5, 0.1, 0.06, 0.09, 5, 3, 0.3);
  }
}
// torches: wall-face point (x, flame y, z) and the inward normal; braziers: feet
export const TORCHES = [[-5, 2.4, -6, 1, 0], [5, 2.4, -6, -1, 0], [-4.8, 2.5, -18, 1, 0], [-4.5, 2.8, -25, 0, -1], [8, 2.8, -38, -1, 0], [-4.5, 2.8, -45, 0, 1], [-1.75, 2.3, -48, 1, 0]];
export const BRAZIERS = [[-5, 0, -63.5], [5, 0, -63.5], [-4.2, 0.6, -76.5], [4.2, 0.6, -76.5]];
function portcullis(K, ctx, col) {
  if (col) return;
  K.paint(TX.iron, "oklch(0.9 0.01 60)", 0.55, 0.75);
  for (let i = 0; i <= 8; i++) { const x = -1.6 + i * 0.4; K.box(x - 0.035, 0, -0.035, x + 0.035, 3.4, 0.035); K.tri([x - 0.035, 0, 0], [x + 0.035, 0, 0], [x, -0.22, 0], [x, 0.1, 0.5]); K.tri([x, 0, -0.035], [x, 0, 0.035], [x, -0.22, 0], [0.5 + x, 0.1, 0]); }
  for (const y of [0.35, 1.25, 2.15, 3.05]) K.box(-1.7, y - 0.04, -0.06, 1.7, y + 0.04, 0.06);
  K.paint(null, "#5a3220", 0.95, 0.3); for (let k = 0; k < 10; k++) { const x = -1.6 + Math.floor(ctx.random() * 9) * 0.4; const y = ctx.random() * 3; K.box(x - 0.04, y, -0.04, x + 0.04, y + 0.15, 0.04); }
}
function stoneGem(K, ctx) {
  ctx.smooth(); ctx.albedo(null); ctx.color("#1d2a2c"); ctx.roughness(0.35); ctx.metalness(0.1); ctx.emissive(0.02, 0.18, 0.16);
  K.rock(0, 0.05, 0, 0.065, 0.05, 0.055, 12, 8, 0.12);
  ctx.flat(); ctx.color("#bdfff0"); ctx.emissive(0.6, 3.2, 2.6);
  const rune = (z, s) => { const st = (x0, y0, x1, y1) => { const dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy), nx = (-dy / l) * 0.004, ny = (dx / l) * 0.004; K.quad([x0 - nx, y0 - ny, z], [x0 + nx, y0 + ny, z], [x1 + nx, y1 + ny, z], [x1 - nx, y1 - ny, z], [0, 0.05, 0]); }; st(-0.012 * s, 0.02, -0.012 * s, 0.08); st(-0.012 * s, 0.07, 0.02 * s, 0.045); st(-0.012 * s, 0.05, 0.02 * s, 0.025); st(0.02 * s, 0.025, 0.012 * s, 0.075); };
  rune(-0.062, 1); rune(0.058, -1);
  ctx.emissive(null);
}
function build(ctx, col) {
  const part = ctx.params?.part || "halls", K = kit(ctx, col);
  if (part === "portcullis") return portcullis(K, ctx, col);
  if (part === "stone") { if (!col) stoneGem(K, ctx); else K.box(-0.07, 0, -0.06, 0.07, 0.1, 0.06); return; }
  K.at(() => { shell(K, ctx, col); dress(K, ctx, col); }, 0, 0, ZO);
}
export function geometry(ctx) { build(ctx, false); }
export function collider(ctx) { build(ctx, true); }
