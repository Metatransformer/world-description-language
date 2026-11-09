import { BXR, HX, RB, ROOF, flatc, paint } from "../lib/buildkit.js";   // the shared building toolkit
import BK from "../lib/data/building-kit.json";   // textures and tints: scripts/lib/data/building-kit.yml
// FARMSTEAD kit: what stands on a working farm and at a town's stables. params.kind:
//   barn (12 x 8 m, door on its -z face), stable (14 x 5 m open-fronted, -z open), fence (params.len m of post-and-rail along x),
//   field (params.len x params.wid m of ridged crop rows, params.crop: wheat | cabbage), scarecrow, trough, bucket, fork, rail (saddle on a stand)
const { fieldstone: FS, oak: OAK, plaster: PL, slate: SL, iron: IR, hay: HAY } = BK.textures;
const { stone: STONE, wood: WOOD, white: WHITE, iron: IRONC } = BK.tints;
const BX = BXR;
function LA(c, cx, y0, cz, prof, n = 10) { const P = (i, k) => { const a = (k % n) / n * Math.PI * 2; return [cx + prof[i][0] * Math.cos(a), y0 + prof[i][1], cz + prof[i][0] * Math.sin(a)]; };
  c.smooth(); for (let i = 0; i < prof.length - 1; i++) for (let k = 0; k < n; k++) c.quad(...P(i, k + 1), ...P(i, k), ...P(i + 1, k), ...P(i + 1, k + 1)); c.flat();
  const l = prof.length - 1, A = [cx, y0 + prof[l][1], cz]; for (let k = 0; k < n; k++) c.tri(...A, ...P(l, k + 1), ...P(l, k)); }
function rng(s) { return () => (s = (s * 16807) % 2147483647) / 2147483647; }
// gable roof, ridge along x, eaves at z0/z1
// vertical boards between x0..x1 on the plane z (thickness th), heights y0..y1, a gap and a wobble so no two boards line up
function BOARDS(c, x0, x1, z, th, y0, y1, R, D) { if (D > 2) return BX(c, x0, y0, z - th / 2, x1, y1, z + th / 2);
  for (let x = x0; x < x1 - 0.01; x += 0.3) { const w = Math.min(0.29, x1 - x), d = (R() - 0.5) * 0.03; BX(c, x, y0, z - th / 2 + d, x + w, y1 - R() * 0.05, z + th / 2 + d); } }
function BOARDSZ(c, z0, z1, x, th, y0, y1, R, D) { if (D > 2) return BX(c, x - th / 2, y0, z0, x + th / 2, y1, z1);
  for (let z = z0; z < z1 - 0.01; z += 0.3) { const w = Math.min(0.29, z1 - z), d = (R() - 0.5) * 0.03; BX(c, x - th / 2 + d, y0, z, x + th / 2 + d, y1 - R() * 0.05, z + w); } }
function HAYBALE(c, x, y, z, yaw) { paint(c, HAY, "oklch(0.92 0.06 90)"); RB(c, x, y + 0.25, z, 1.0, 0.5, 0.55, yaw); flatc(c, "oklch(0.35 0.03 60)"); RB(c, x, y + 0.25, z, 0.04, 0.52, 0.57, yaw); }

const K = {
  barn(c, p, D) { const R = rng(p.seed ?? 11), W = 6, Dp = 4, H = 4.4, RH = 8.2;
    paint(c, FS, STONE); BX(c, -W - 0.2, -1, -Dp - 0.2, W + 0.2, 0.6, Dp + 0.2);                 // footing
    paint(c, OAK, "oklch(0.62 0.07 40)");                                                    // ox-blood boards
    BOARDS(c, -W, -1.8, -Dp, 0.12, 0.6, H, R, D); BOARDS(c, 1.8, W, -Dp, 0.12, 0.6, H, R, D); BOARDS(c, -1.8, 1.8, -Dp, 0.12, 3.6, H, R, D);
    BOARDS(c, -W, W, Dp, 0.12, 0.6, H, R, D); BOARDSZ(c, -Dp, Dp, -W, 0.12, 0.6, H, R, D); BOARDSZ(c, -Dp, Dp, W, 0.12, 0.6, H, R, D);
    // gable ends
    for (const x of [-W, W]) HX(c, [[x - 0.06, H, -Dp], [x + 0.06, H, -Dp], [x + 0.06, H, Dp], [x - 0.06, H, Dp], [x - 0.06, RH, 0], [x + 0.06, RH, 0], [x + 0.06, RH, 0], [x - 0.06, RH, 0]]);
    paint(c, OAK, WOOD); for (const x of [-W, -1.9, 1.9, W]) BX(c, x - 0.15, 0.6, -Dp - 0.15, x + 0.15, H, -Dp + 0.15);  // corner posts and door jambs
    BX(c, -2.0, 3.45, -Dp - 0.2, 2.0, 3.7, -Dp + 0.1);                                       // lintel
    // the doors stand open, swung flat against the front
    for (const s of [-1, 1]) { const x0 = s < 0 ? -3.9 : 2.1, x1 = s < 0 ? -2.1 : 3.9; paint(c, OAK, "oklch(0.55 0.07 40)"); BX(c, x0, 0.65, -Dp - 0.32, x1, 3.4, -Dp - 0.2);
      if (D <= 2) { paint(c, OAK, WOOD); RB(c, (x0 + x1) / 2, 2.0, -Dp - 0.36, 2.3, 0.14, 0.05, 0, 0, s * 52); BX(c, x0, 0.8, -Dp - 0.36, x1, 0.95, -Dp - 0.32); BX(c, x0, 3.1, -Dp - 0.36, x1, 3.25, -Dp - 0.32); } }
    // roof: thatch over slate battens, a ridge cap
    paint(c, HAY, "oklch(0.78 0.05 80)"); ROOF(c, -W - 0.6, W + 0.6, -Dp - 0.9, Dp + 0.9, H - 0.25, RH, 0.35);
    paint(c, HAY, "oklch(0.6 0.05 70)"); BX(c, -W - 0.6, RH + 0.15, -0.35, W + 0.6, RH + 0.5, 0.35);
    // floor of the barn: packed straw; inside, bales and a cart
    paint(c, HAY, "oklch(0.85 0.05 85)"); BX(c, -W + 0.1, 0.55, -Dp + 0.1, W - 0.1, 0.62, Dp - 0.1);
    if (D <= 3) { for (let i = 0; i < 6; i++) HAYBALE(c, -W + 1 + (i % 3) * 1.1, 0.62 + Math.floor(i / 3) * 0.5, Dp - 0.8, 0);
      for (let i = 0; i < 4; i++) HAYBALE(c, W - 1.2, 0.62 + Math.floor(i / 2) * 0.5, Dp - 1 - (i % 2) * 1.2, 90); }
  },
  stable(c, p, D) { const R = rng(p.seed ?? 5), W = 7, Dp = 2.5, Hf = 3.4, Hb = 2.6, stalls = p.stalls ?? 4;
    paint(c, FS, STONE); BX(c, -W - 0.2, -0.8, -Dp - 0.2, W + 0.2, 0.25, Dp + 0.2);
    paint(c, HAY, "oklch(0.85 0.05 85)"); BX(c, -W + 0.1, 0.25, -Dp + 0.1, W - 0.1, 0.3, Dp - 0.1);
    paint(c, OAK, WOOD); BOARDS(c, -W, W, Dp, 0.12, 0.25, Hb, R, D); BOARDSZ(c, -Dp, Dp, -W, 0.12, 0.25, Hb, R, D); BOARDSZ(c, -Dp, Dp, W, 0.12, 0.25, Hb, R, D);
    for (let i = 0; i <= stalls; i++) { const x = -W + i * 2 * W / stalls; BX(c, x - 0.13, 0.25, -Dp - 0.13, x + 0.13, Hf, -Dp + 0.13); }       // front posts
    BX(c, -W - 0.2, Hf - 0.25, -Dp - 0.18, W + 0.2, Hf, -Dp + 0.12);                                                           // front beam
    for (let i = 1; i < stalls; i++) { const x = -W + i * 2 * W / stalls; BOARDSZ(c, -Dp + 0.8, Dp, x, 0.08, 0.25, 1.6, R, D); }    // stall partitions
    for (let i = 0; i < stalls; i++) { const x0 = -W + i * 2 * W / stalls + 0.4, x1 = x0 + 2 * W / stalls - 0.8;                 // half doors, every other one open
      if (i % 2) RB(c, x0 - 0.1, 0.95, -Dp - 0.55, 0.06, 1.1, 1.0, 0, 0, 0); else BX(c, x0, 0.4, -Dp - 0.04, x1, 1.45, -Dp + 0.04);
      if (D <= 3) { BX(c, x0 + 0.1, 0.3, Dp - 0.6, x1 - 0.1, 0.7, Dp - 0.12); paint(c, HAY, "oklch(0.88 0.06 88)"); BX(c, x0 + 0.15, 0.6, Dp - 0.55, x1 - 0.15, 0.78, Dp - 0.17); paint(c, OAK, WOOD); } }
    // lean-to roof falling back, slate
    paint(c, SL, "oklch(0.92 0.01 250)"); const t = 0.18;
    HX(c, [[-W - 0.5, Hf, -Dp - 0.7], [W + 0.5, Hf, -Dp - 0.7], [W + 0.5, Hb - 0.15, Dp + 0.6], [-W - 0.5, Hb - 0.15, Dp + 0.6], [-W - 0.5, Hf + t, -Dp - 0.7], [W + 0.5, Hf + t, -Dp - 0.7], [W + 0.5, Hb - 0.15 + t, Dp + 0.6], [-W - 0.5, Hb - 0.15 + t, Dp + 0.6]]);
    paint(c, OAK, WOOD); for (const x of [-W, W]) HX(c, [[x - 0.06, Hb, -Dp], [x + 0.06, Hb, -Dp], [x + 0.06, Hb, Dp], [x - 0.06, Hb, Dp], [x - 0.06, Hf, -Dp], [x + 0.06, Hf, -Dp], [x + 0.06, Hb, Dp], [x - 0.06, Hb, Dp]]);
    // tack: a saddle on the end partition, a lantern on the middle post
    if (D <= 2) { flatc(c, "oklch(0.38 0.07 45)"); RB(c, -W + 2 * W / stalls, 1.75, 0.6, 0.5, 0.25, 0.75); paint(c, IR, IRONC); BX(c, -0.05, 2.4, -Dp - 0.3, 0.05, 2.75, -Dp - 0.2);
      c.albedo(null); c.color("#ffd9a0"); c.emissive(1.7, 0.95, 0.38); BX(c, -0.1, 2.0, -Dp - 0.4, 0.1, 2.35, -Dp - 0.2); c.emissive(null); }
  },
  // tack and tools for a stable: bucket (params.full: water), fork (a manure fork leaning, tines down), rail (a saddle and blanket on a stand)
  bucket(c, p, D) { paint(c, OAK, "oklch(0.78 0.04 60)"); LA(c, 0, 0, 0, [[0.0, 0], [0.15, 0], [0.18, 0.32], [0.17, 0.34], [0.0, 0.34]], D <= 2 ? 12 : 7);
    paint(c, IR, IRONC); for (const y of [0.06, 0.26]) LA(c, 0, y, 0, [[0.16 + y * 0.09, 0], [0.165 + y * 0.09, 0.035], [0, 0.035]], D <= 2 ? 12 : 7);
    if (p.full !== false) { flatc(c, "oklch(0.45 0.06 220)"); c.roughness(0.1); LA(c, 0, 0.28, 0, [[0.165, 0], [0, 0.005]], 10); c.roughness(null); }
    if (D <= 2) { paint(c, IR, IRONC); for (let i = 0; i < 8; i++) { const a = Math.PI * i / 7; RB(c, Math.cos(a) * 0.17, 0.34 + Math.sin(a) * 0.12, 0, 0.02, 0.05, 0.02, 0, 0, 90 - a * 57.3); } } },
  fork(c, p, D) { paint(c, OAK, "oklch(0.72 0.04 60)"); RB(c, 0, 0.85, 0, 0.035, 1.5, 0.035, 0, 0, 0); RB(c, 0, 0.12, 0, 0.26, 0.04, 0.04);
    paint(c, IR, IRONC); for (const x of [-0.11, -0.04, 0.04, 0.11]) RB(c, x, 0.02 + 0.03, 0.0, 0.018, 0.12, 0.018); RB(c, 0, 1.62, 0, 0.12, 0.035, 0.035); },
  rail(c, p, D) { paint(c, OAK, WOOD); for (const x of [-0.55, 0.55]) { BX(c, x - 0.05, 0, -0.3, x + 0.05, 0.04, 0.3); BX(c, x - 0.04, 0, -0.04, x + 0.04, 1.05, 0.04); }
    RB(c, 0, 1.05, 0, 1.3, 0.1, 0.1);
    flatc(c, "oklch(0.42 0.09 25)"); BX(c, -0.32, 0.72, -0.04, 0.32, 1.1, 0.04); BX(c, -0.32, 1.1, -0.22, 0.32, 1.11, 0.22); BX(c, -0.32, 0.72, -0.22, 0.32, 1.1, -0.21); BX(c, -0.32, 0.72, 0.21, 0.32, 1.1, 0.22);
    flatc(c, "oklch(0.36 0.07 45)"); c.roughness(0.6); LA(c, 0, 1.08, 0, [[0.27, 0], [0.26, 0.07], [0.14, 0.11], [0, 0.1]], D <= 2 ? 14 : 8); RB(c, 0, 1.18, -0.24, 0.12, 0.12, 0.08, 0, 20); RB(c, 0, 1.18, 0.25, 0.14, 0.1, 0.08, 0, -15);
    for (const z of [-0.12, 0.12]) RB(c, 0.24, 0.8, z, 0.025, 0.55, 0.05); paint(c, IR, IRONC); for (const z of [-0.12, 0.12]) RB(c, 0.25, 0.5, z, 0.04, 0.05, 0.13); c.roughness(null); },
  fence(c, p, D) { const L = p.len ?? 8, R = rng(p.seed ?? 3); paint(c, OAK, "oklch(0.8 0.03 60)"); const n = Math.max(1, Math.round(L / 2.4));
    for (let i = 0; i <= n; i++) { const x = -L / 2 + i * L / n; RB(c, x, 0.55, 0, 0.14, 1.4 - R() * 0.15, 0.14, R() * 20, (R() - 0.5) * 6); }
    for (let i = 0; i < n; i++) { const x0 = -L / 2 + i * L / n, x1 = x0 + L / n; for (const y of [0.45, 0.95]) { const dy = (R() - 0.5) * 0.08; RB(c, (x0 + x1) / 2, y + dy, 0.08, L / n + 0.1, 0.1, 0.07, 0, 0, Math.atan2(dy * 2, L / n) * 57); } } },
  field(c, p, D) { const L = p.len ?? 20, Wd = p.wid ?? 12, crop = p.crop ?? "wheat", R = rng(p.seed ?? 9), rows = Math.round(Wd / 1.1);
    for (let r = 0; r < rows; r++) { const z = -Wd / 2 + (r + 0.5) * Wd / rows;
      flatc(c, "oklch(0.36 0.04 55)"); HX(c, [[-L / 2, -0.1, z - 0.42], [L / 2, -0.1, z - 0.42], [L / 2, -0.1, z + 0.42], [-L / 2, -0.1, z + 0.42], [-L / 2, 0.22, z - 0.12], [L / 2, 0.22, z - 0.12], [L / 2, 0.22, z + 0.12], [-L / 2, 0.22, z + 0.12]]);
      if (D > 3) continue; const step = D <= 2 ? 0.55 : 1.1;
      for (let x = -L / 2 + 0.3; x < L / 2 - 0.2; x += step) {
        if (crop === "cabbage") { flatc(c, `oklch(${0.55 + R() * 0.1} 0.12 ${130 + R() * 15})`); LA(c, x, 0.18, z, [[0.05, 0], [0.26, 0.1], [0.24, 0.22], [0.0, 0.3]], D <= 2 ? 8 : 5); }
        else { flatc(c, `oklch(${0.74 + R() * 0.08} 0.11 ${82 + R() * 10})`); for (let k = 0; k < (D <= 2 ? 3 : 1); k++) RB(c, x + (R() - 0.5) * 0.3, 0.2 + 0.45, z + (R() - 0.5) * 0.25, 0.05, 0.9 + R() * 0.25, 0.05, R() * 90, (R() - 0.5) * 14, (R() - 0.5) * 14);
          if (D <= 2) { flatc(c, "oklch(0.82 0.1 85)"); RB(c, x, 1.12, z, 0.09, 0.2, 0.09, R() * 90); } } } } },
  scarecrow(c, p, D) { paint(c, OAK, WOOD); BX(c, -0.06, 0, -0.06, 0.06, 2.2, 0.06); BX(c, -0.9, 1.6, -0.05, 0.9, 1.7, 0.05);
    flatc(c, "oklch(0.45 0.08 30)"); RB(c, 0, 1.45, 0, 0.7, 0.75, 0.32); RB(c, -0.55, 1.62, 0, 0.5, 0.22, 0.22); RB(c, 0.55, 1.62, 0, 0.5, 0.22, 0.22);
    paint(c, HAY, "oklch(0.88 0.06 88)"); LA(c, 0, 1.85, 0, [[0.18, 0], [0.22, 0.2], [0.14, 0.38], [0, 0.42]], 8); RB(c, -0.82, 1.62, 0, 0.12, 0.3, 0.12, 0, 0, 30); RB(c, 0.82, 1.62, 0, 0.12, 0.3, 0.12, 0, 0, -30);
    flatc(c, "oklch(0.3 0.03 60)"); LA(c, 0, 2.18, 0, [[0.42, 0], [0.42, 0.04], [0.16, 0.08], [0.15, 0.3], [0, 0.32]], 10); },
  bale(c, p, D) { paint(c, HAY, "oklch(0.9 0.05 88)"); RB(c, 0, 0.23, 0, 1.0, 0.46, 0.5, 0, 0, 0);
    if (D <= 2) { flatc(c, "oklch(0.55 0.06 70)"); for (const x of [-0.25, 0.25]) RB(c, x, 0.23, 0, 0.03, 0.475, 0.515, 0, 0, 0); } },
  trough(c, p, D) { paint(c, OAK, WOOD); BX(c, -1.1, 0.35, -0.35, 1.1, 0.4, 0.35); BX(c, -1.1, 0.35, -0.35, 1.1, 0.75, -0.29); BX(c, -1.1, 0.35, 0.29, 1.1, 0.75, 0.35); BX(c, -1.1, 0.35, -0.35, -1.04, 0.75, 0.35); BX(c, 1.04, 0.35, -0.35, 1.1, 0.75, 0.35);
    for (const x of [-0.9, 0.9]) BX(c, x - 0.08, 0, -0.3, x + 0.08, 0.35, 0.3); flatc(c, "oklch(0.42 0.05 220)"); c.roughness(0.1); BX(c, -1.04, 0.4, -0.29, 1.04, 0.66, 0.29); c.roughness(null); },
};
export function geometry(c) { const p = c.params ?? {}; (K[p.kind] ?? K.barn)(c, p, c.lod); c.albedo(null); c.color(null); c.flat(); }
export function collider(c) { const p = c.params ?? {}, k = p.kind ?? "barn";
  const box = (x0, y0, z0, x1, y1, z1) => ({ kind: "box", width: x1 - x0, height: y1 - y0, depth: z1 - z0, center: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2] });
  if (k === "barn") return [box(-6.2, 0, -4.2, -1.8, 4.4, -3.9), box(1.8, 0, -4.2, 6.2, 4.4, -3.9), box(-6.2, 0, 3.9, 6.2, 4.4, 4.2), box(-6.2, 0, -4.2, -5.9, 4.4, 4.2), box(5.9, 0, -4.2, 6.2, 4.4, 4.2), box(-6.6, 4.4, -4.9, 6.6, 8.4, 4.9)];
  if (k === "stable") return [box(-7.1, 0, 2.4, 7.1, 2.6, 2.6), box(-7.1, 0, -2.6, -6.9, 2.6, 2.6), box(6.9, 0, -2.6, 7.1, 2.6, 2.6), box(-7.5, 2.6, -3.2, 7.5, 3.6, 3.1)];
  if (k === "fence") { const L = p.len ?? 8; return box(-L / 2, 0, -0.1, L / 2, 1.2, 0.15); }
  if (k === "field") return [];
  if (k === "scarecrow") return box(-0.15, 0, -0.15, 0.15, 2.2, 0.15);
  if (k === "rail") return box(-0.6, 0, -0.3, 0.6, 1.1, 0.3);
  if (k === "bucket") return box(-0.18, 0, -0.18, 0.18, 0.34, 0.18);
  if (k === "bale") return box(-0.5, 0, -0.25, 0.5, 0.46, 0.25);
  if (k === "trough") return box(-1.1, 0, -0.35, 1.1, 0.75, 0.35);
  return []; }
