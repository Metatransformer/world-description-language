// Shared emitters for the Drowned Temple (the seabed ruin in main and the halls in place drowned): pale weathered
// limestone and green-black bronze. Columns, fallen drums, kneeling faceless statues, pediment shards, barnacle crust,
// kelp ribbons, sand drifts, bronze braziers. Built on barrow-kit's K; chunky, flat-faced, PSX budget.
import { kit } from "../gen/barrow-kit.js";
import KD from "./data/kit-drowned.json";   // textures, finishes, part sizes: scripts/lib/data/kit-drowned.yml
export const TX = KD.tex;
const FIN = KD.finish;
export function dk(ctx, col) {
  const K = kit(ctx, col), R = () => ctx.random(), lod = ctx.lod ?? 1;
  const D = { K, R };
  D.lime = (l = FIN.lime.l) => K.paint(TX.lime, `oklch(${l} ${FIN.lime.ch})`, FIN.lime.rough);
  D.floor = () => K.paint(TX.floor, FIN.floor.tint, FIN.floor.rough);
  D.bronze = () => K.paint(TX.bronze, FIN.bronze.tint, FIN.bronze.rough, FIN.bronze.metal);
  D.sand = () => K.paint(TX.sand, FIN.sand.tint, FIN.sand.rough);
  D.dark = () => K.paint(null, FIN.dark.tint, FIN.dark.rough);
  // a crust of barnacles round a post of radius r at (x, z), between heights
  D.barn = (x, y0, y1, z, r, n) => {
    if (col || lod > 2) return;
    K.paint(null, "oklch(0.78 0.02 90)", 0.95);
    for (let k = 0; k < n; k++) {
      const a = R() * 6.283, y = y0 + R() * (y1 - y0), c = Math.cos(a), s = Math.sin(a), sz = 0.04 + R() * 0.05;
      K.seg([x + c * r, y, z + s * r], [x + c * (r + sz), y, z + s * (r + sz)], sz, sz * 0.45, 5, true);
    }
  };
  // a fluted column standing at (x, y, z): base, drums, capital (none when broken: a jagged top)
  D.column = (x, y, z, h, broken = false, r = KD.column.r) => {
    D.lime();
    if (col) return K.box(x - r - 0.15, y, z - r - 0.15, x + r + 0.15, y + h + (broken ? 0 : 0.42), z + r + 0.15);
    K.box(x - r - 0.18, y, z - r - 0.18, x + r + 0.18, y + 0.28, z + r + 0.18);
    const drums = Math.max(1, Math.round(h / 1.3)), dh = (h - 0.28) / drums; let yy = y + 0.28;
    for (let i = 0; i < drums; i++) {
      const top = broken && i === drums - 1, h1 = top ? dh * (0.55 + R() * 0.3) : dh;
      D.lime(0.88 + R() * 0.08);
      K.seg([x, yy, z], [x + (top ? (R() - 0.5) * 0.12 : 0), yy + h1, z], r * (1 - i * 0.015), r * (1 - (i + 1) * 0.015), 8, true);
      yy += dh;
    }
    if (!broken) { D.lime(); K.box(x - r - 0.04, yy, z - r - 0.04, x + r + 0.04, yy + 0.16, z + r + 0.04); K.box(x - r - 0.22, yy + 0.16, z - r - 0.22, x + r + 0.22, yy + 0.42, z + r + 0.22); }
    D.barn(x, y + 0.3, y + Math.min(h, 2.6), z, r, 10);
  };
  // a column fallen along yaw: drums strewn with gaps, the capital at the far end
  D.fallen = (x, y, z, yaw, n = KD.fallen.drums, r = KD.fallen.r) => K.at(() => {
    D.lime(0.86);
    if (col) return K.box(-r, 0, 0, r, r * 2, n * 1.3);
    for (let i = 0; i < n; i++) { const z0 = i * 1.3 + R() * 0.15, dx = (R() - 0.5) * 0.3; K.seg([dx, r, z0], [dx + (R() - 0.5) * 0.2, r, z0 + 1.1], r, r * 0.97, 8, true); }
    K.at(() => K.box(-r - 0.22, -r - 0.2, 0, r + 0.22, r + 0.2, 0.3), 0, r + 0.02, n * 1.3 + 0.1, 0, 0, 18);
    D.barn(0, 0.2, 0.7, n * 0.6, r, 8);
  }, x, y, z, yaw);
  // a kneeling bronze figure facing -z on a limestone pedestal: hands on thighs, the face worn away
  // a statue's head round (x, y, z): the bronze skull and its worn-flat face toward -z
  D.head = (x, y, z) => {
    D.bronze(); K.rock(x, y, z, 0.16, 0.19, 0.17, 6, 4, 0.05);
    K.paint(null, "oklch(0.62 0.05 168)", 0.9, 0.2); K.box(x - 0.12, y - 0.08, z - 0.175, x + 0.12, y + 0.08, z - 0.14);
  };
  D.statue = (x, y, z, yaw, s = 1, headless = false) => K.at(() => {   // headless: the head is a live object of its own (a sentinel that watches)
    D.lime(0.9);
    if (col) return K.box(-0.62, 0, -0.75, 0.62, 2.25, 0.75);
    K.box(-0.62, 0, -0.75, 0.62, 0.5, 0.75); K.box(-0.7, 0, -0.83, 0.7, 0.14, 0.83);
    D.bronze();
    for (const sd of [-1, 1]) {
      K.box(sd * 0.32 - 0.12, 0.5, -0.32, sd * 0.32 + 0.12, 0.72, 0.5);                     // shin on the pedestal
      K.seg([sd * 0.3, 0.66, -0.3], [sd * 0.2, 1.02, 0.3], 0.14, 0.15, 6, true);            // thigh up to the hip
      K.seg([sd * 0.33, 1.7, 0.28], [sd * 0.4, 1.28, 0.08], 0.09, 0.08, 6, true);           // upper arm
      K.seg([sd * 0.4, 1.28, 0.08], [sd * 0.28, 0.98, -0.18], 0.08, 0.07, 6, true);         // forearm to the knee
      K.box(sd * 0.28 - 0.07, 0.88, -0.32, sd * 0.28 + 0.07, 0.98, -0.12);                  // mitt hand
    }
    K.seg([0, 1.0, 0.3], [0, 1.72, 0.28], 0.26, 0.32, 7, true);                               // torso
    K.box(-0.42, 1.62, 0.12, 0.42, 1.8, 0.42);                                                  // shoulders
    K.seg([0, 1.78, 0.28], [0, 1.88, 0.26], 0.09, 0.09, 6);                                     // neck
    if (!headless) D.head(0, 2.04, 0.24);
    D.barn(0, 0.55, 1.6, 0.3, 0.3, 7);
  }, x, y, z, yaw, 0, 0);
  // a shard of a triangular pediment: the slice of its profile from xa to xb, w wide, h tall, d deep, its own frame
  D.pediment = (tx, ty, tz, yaw, pitch, roll, w, h, d, xa, xb) => K.at(() => {
    D.lime(0.9);
    const hy = (x) => Math.max(0.15, h * (1 - Math.abs(x) / (w / 2)));
    if (col) return K.box(xa, 0, 0, xb, Math.max(hy(xa), hy(xb), xa < 0 && xb > 0 ? h : 0), d);
    const xs = [xa]; if (xa < 0 && xb > 0) xs.push(0); xs.push(xb);
    const I = [(xa + xb) / 2, h * 0.3, d / 2];
    for (let i = 0; i < xs.length - 1; i++) {
      const a = xs[i], b = xs[i + 1];
      K.quad([a, 0, 0], [b, 0, 0], [b, hy(b), 0], [a, hy(a), 0], I); K.quad([a, 0, d], [b, 0, d], [b, hy(b), d], [a, hy(a), d], I);
      K.quad([a, hy(a), 0], [b, hy(b), 0], [b, hy(b), d], [a, hy(a), d], I); K.quad([a, 0, 0], [b, 0, 0], [b, 0, d], [a, 0, d], I);
    }
    for (const x of [xa, xb]) K.quad([x, 0, 0], [x, hy(x), 0], [x, hy(x), d], [x, 0, d], I);
    D.bronze(); const m = (xa + xb) / 2; K.rock(m, hy(m) * 0.45, -0.04, 0.3, 0.3, 0.06, 6, 3, 0.1); // a bronze roundel set in the tympanum
    D.lime(0.84); K.box(xa - 0.1, -0.35, -0.15, xb + 0.1, 0, d + 0.15);                             // the cornice under it
  }, tx, ty, tz, yaw, pitch, roll);
  // a sand drift heaped against stone
  D.drift = (x, y, z, rx, ry, rz) => { D.sand(); K.rock(x, y, z, rx, ry, rz, 8, 4, 0.12); };
  // kelp: n ribbons rooted at (x, y, z), each len tall, waving
  D.kelp = (x, y, z, n, len, force = false) => {
    if (col || (lod > 2 && !force)) return;
    if (lod > 2) n = Math.max(2, n >> 1);
    for (let k = 0; k < n; k++) {
      K.paint(null, `oklch(${0.34 + R() * 0.08} 0.07 ${110 + R() * 25})`, 0.5);
      const ox = x + (R() - 0.5) * 0.8, oz = z + (R() - 0.5) * 0.8, yaw = R() * 360, L = len * (0.6 + R() * 0.6), ph = R() * 6;
      K.at(() => {
        let prev = null; const N = 6;
        for (let i = 0; i <= N; i++) {
          const t = i / N, w = 0.16 * (1 - t * 0.55), bx = Math.sin(t * 4 + ph) * 0.25 * t;
          const cur = [[bx - w, L * t, Math.cos(t * 3 + ph) * 0.15 * t], [bx + w, L * t, Math.cos(t * 3 + ph) * 0.15 * t]];
          if (prev) K.quad(prev[0], prev[1], cur[1], cur[0]);
          prev = cur;
        }
      }, ox, y, oz, yaw);
    }
  };
  // a bronze tripod brazier (its flame is the scene's fx)
  D.brazier = (x, y, z) => {
    D.bronze();
    if (col) return K.box(x - 0.4, y, z - 0.4, x + 0.4, y + 1.1, z + 0.4);
    for (let k = 0; k < 3; k++) { const a = k * 2.094; K.seg([x + Math.cos(a) * 0.38, y, z + Math.sin(a) * 0.38], [x + Math.cos(a) * 0.2, y + 0.85, z + Math.sin(a) * 0.2], 0.04, 0.035, 5, true); }
    K.seg([x, y + 0.8, z], [x, y + 1.1, z], 0.22, 0.45, 8, true);
    D.dark(); K.box(x - 0.3, y + 1.08, z - 0.3, x + 0.3, y + 1.11, z + 0.3);
  };
  return D;
}
