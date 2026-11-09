import BK from "../lib/data/building-kit.json";
import { BXR, HX } from "../lib/buildkit.js";   // the shared building toolkit
// WINDMILL kit (creator, Oct 29: "farms with big windmills valley of the wind style"). params.kind:
//   tower: a tall tapered fieldstone tower (params.h m, default 16) with door, windows, a gallery and a slate cap; its hub sits at (0, h + 1.2, -(top radius + 0.9))
//   sails: four lattice arms with canvas, radius params.r (default 10), hub at the origin, facing -z; the row turns by rotation.roll
// params.style: valley (default, the originals) | coastal (whitewashed shaft, tarred cap, white canvas) | desert (sandstone, clay cap, ochre canvas)
const STYLES = {
  valley: { tex: BK.textures, tint: BK.tints, cap: "oklch(0.8 0.02 240)", canvas: "oklch(0.86 0.04 85)", patch: "oklch(0.62 0.1 40)" },
  coastal: { tex: { ...BK.textures, fieldstone: BK.textures.plaster, slate: "cdn/texture-tarred-black-weatherboard-planks.png" }, tint: { ...BK.tints, stone: "oklch(0.97 0.01 230)" }, cap: "oklch(0.75 0.01 250)", canvas: "oklch(0.95 0.01 90)", patch: "oklch(0.55 0.06 240)" },
  desert: { tex: { ...BK.textures, fieldstone: "cdn/texture-sandstone-blocks-weathered.png", slate: "cdn/texture-sun-baked-clay-roof-tiles.png", plaster: "cdn/texture-sandstone-blocks-weathered.png" }, tint: { ...BK.tints, white: "oklch(0.9 0.04 75)" }, cap: "oklch(0.92 0.03 60)", canvas: "oklch(0.8 0.08 75)", patch: "oklch(0.55 0.12 35)" },
};
let FS, OAK, SL, IR, PL, STONE, WOOD, IRONC, WHITE, ST;
function useStyle(name) { ST = STYLES[name] ?? STYLES.valley;
  ({ fieldstone: FS, oak: OAK, slate: SL, iron: IR, plaster: PL } = ST.tex); ({ stone: STONE, wood: WOOD, iron: IRONC, white: WHITE } = ST.tint); }
const paint = (c, t, col) => { c.albedo(t); c.color(col); };
const flat = (c, col) => { c.albedo(null); c.color(col); };
const BX = BXR;
// a box along an arm: centre (x,y) in the sail plane, length along angle a, width w, depth d, at z
function ARM(c, a, r0, r1, w, d, z, off = 0) { const ca = Math.cos(a), sa = Math.sin(a), nx = -sa, ny = ca;
  const P = (r, s, zz) => [ca * r + nx * (s + off), sa * r + ny * (s + off), zz];
  HX(c, [P(r0, -w / 2, z - d / 2), P(r1, -w / 2, z - d / 2), P(r1, -w / 2, z + d / 2), P(r0, -w / 2, z + d / 2), P(r0, w / 2, z - d / 2), P(r1, w / 2, z - d / 2), P(r1, w / 2, z + d / 2), P(r0, w / 2, z + d / 2)]); }
// a lathe: profile [[radius, y]], n sides
function LA(c, prof, n, y0 = 0) { const P = (i, k) => { const a = (k % n) / n * Math.PI * 2; return [prof[i][0] * Math.cos(a), y0 + prof[i][1], prof[i][0] * Math.sin(a)]; };
  for (let i = 0; i < prof.length - 1; i++) for (let k = 0; k < n; k++) c.quad(...P(i, k + 1), ...P(i, k), ...P(i + 1, k), ...P(i + 1, k + 1)); }
const K = {
  tower(c, p, D) { const h = p.h ?? 16, rb = 3.4, rt = 2.2, n = D <= 2 ? 16 : 8;
    paint(c, FS, STONE); c.repeat?.([3, 6]);
    LA(c, [[rb + 0.35, -0.6], [rb + 0.35, 0.5], [rb, 0.6], [rt, h]], n);                     // footing then the tapered shaft
    paint(c, OAK, WOOD); LA(c, [[rt + 0.05, h], [rt + 1.1, h + 0.05], [rt + 1.1, h + 0.25], [rt + 0.05, h + 0.25]], n);   // gallery deck
    if (D <= 3) for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2, x = Math.cos(a) * (rt + 1.0), z = Math.sin(a) * (rt + 1.0); BX(c, x - 0.05, h + 0.25, z - 0.05, x + 0.05, h + 1.15, z + 0.05); }
    if (D <= 3) LA(c, [[rt + 0.95, h + 1.1], [rt + 1.05, h + 1.1], [rt + 1.05, h + 1.2], [rt + 0.95, h + 1.2]], n);
    paint(c, PL, WHITE); LA(c, [[rt, h + 0.25], [rt - 0.1, h + 2.2]], n);                     // the cap's drum
    paint(c, SL, ST.cap); LA(c, [[rt + 0.45, h + 2.0], [rt + 0.45, h + 2.25], [rt * 0.55, h + 3.6], [0.3, h + 4.4], [0.0, h + 4.6]], n);
    // door and frame on +z (the lee side), windows climbing the shaft
    const r = (y) => rb + (rt - rb) * (y / h);
    paint(c, OAK, "oklch(0.7 0.03 60)"); BX(c, -0.65, 0.5, r(1) - 0.05, 0.65, 2.7, r(1) + 0.25);
    flat(c, "oklch(0.3 0.03 60)"); BX(c, -0.8, 2.7, r(2.7) - 0.1, 0.8, 2.95, r(2.7) + 0.35);
    paint(c, IR, IRONC); if (D <= 2) for (const y of [1.0, 2.2]) BX(c, -0.6, y, r(y) + 0.24, 0.3, y + 0.07, r(y) + 0.3);
    for (const [y, a] of [[5.5, 1.2], [9, -1.9], [12.5, 0.6]]) { const rr = r(y), x = Math.cos(a) * rr, z = Math.sin(a) * rr, tx = -Math.sin(a), tz = Math.cos(a);
      flat(c, "oklch(0.92 0.09 80)"); c.emissive?.("oklch(0.6 0.12 70)"); c.quad(x - tx * 0.35 + Math.cos(a) * 0.03, y, z - tz * 0.35 + Math.sin(a) * 0.03, x + tx * 0.35 + Math.cos(a) * 0.03, y, z + tz * 0.35 + Math.sin(a) * 0.03, x + tx * 0.35 + Math.cos(a) * 0.03, y + 0.9, z + tz * 0.35 + Math.sin(a) * 0.03, x - tx * 0.35 + Math.cos(a) * 0.03, y + 0.9, z - tz * 0.35 + Math.sin(a) * 0.03); c.emissive?.(null); }
    // windshaft out of the cap toward -z, to the hub
    paint(c, OAK, WOOD); BX(c, -0.28, h + 0.95, -(rt + 0.9), 0.28, h + 1.45, -0.5);
    paint(c, IR, IRONC); BX(c, -0.4, h + 0.8, -(rt + 0.95), 0.4, h + 1.6, -(rt + 0.6));
  },
  sails(c, p, D) { const R = p.r ?? 10, z = 0;
    paint(c, IR, IRONC); BX(c, -0.55, -0.55, -0.75, 0.55, 0.55, 0.35); BX(c, -0.3, -0.3, -0.95, 0.3, 0.3, -0.75); // iron hub box facing -z, with its boss
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + 0.2;
      paint(c, OAK, WOOD); ARM(c, a, 0.3, R, 0.32, 0.32, -0.4);                                // the stock
      // lattice: rails either side and bars across, canvas on the trailing side
      const r0 = R * 0.22, w = R * 0.2;
      ARM(c, a, r0, R, 0.1, 0.1, -0.55, w); ARM(c, a, r0, R, 0.08, 0.08, -0.55, -0.12);
      if (D <= 3) for (let i = 0; i <= (D <= 2 ? 10 : 5); i++) { const rr = r0 + (R - r0) * i / (D <= 2 ? 10 : 5); ARM(c, a, rr - 0.04, rr + 0.04, 0.08, 0.08, -0.55, 0); const ca = Math.cos(a), sa = Math.sin(a), nx = -sa, ny = ca;
        const P = (s, zz) => [ca * rr + nx * s, sa * rr + ny * s, zz]; const A = P(-0.12, -0.55), B = P(w, -0.55); const dx = B[0] - A[0], dy = B[1] - A[1];
        HX(c, [[A[0] - 0.04 * ca, A[1] - 0.04 * sa, -0.59], [B[0] - 0.04 * ca, B[1] - 0.04 * sa, -0.59], [B[0] - 0.04 * ca, B[1] - 0.04 * sa, -0.51], [A[0] - 0.04 * ca, A[1] - 0.04 * sa, -0.51], [A[0] + 0.04 * ca, A[1] + 0.04 * sa, -0.59], [B[0] + 0.04 * ca, B[1] + 0.04 * sa, -0.59], [B[0] + 0.04 * ca, B[1] + 0.04 * sa, -0.51], [A[0] + 0.04 * ca, A[1] + 0.04 * sa, -0.51]]); }
      // canvas, weathered cream with a russet patch now and then
      flat(c, k === 2 ? ST.patch : ST.canvas); c.roughness?.(0.95);
      const ca = Math.cos(a), sa = Math.sin(a), nx = -sa, ny = ca, P = (r, s) => [ca * r + nx * s, sa * r + ny * s, -0.5];
      const q = [P(r0, -0.05), P(R - 0.2, -0.05), P(R - 0.2, w - 0.05), P(r0, w - 0.05)];
      c.quad(...q[0], ...q[1], ...q[2], ...q[3]); c.quad(...q[3], ...q[2], ...q[1], ...q[0]); c.roughness?.(null);
    }
  },
};
export function geometry(c) { const p = c.params ?? {}; useStyle(p.style); (K[p.kind] ?? K.tower)(c, p, c.lod ?? 1); c.albedo(null); c.color(null); }
export function collider(c) { const p = c.params ?? {}; if (p.kind === "sails") return [];
  const h = p.h ?? 16; return [{ kind: "cylinder", radiusBottom: 3.5, radiusTop: 2.2, height: h, center: [0, h * 0.5, 0] }]; }
