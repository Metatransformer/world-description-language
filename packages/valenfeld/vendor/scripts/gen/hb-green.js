// Highbridge greenery & wayfinding kit (kit id hbGreen): params.kind =
//  pit      stone tree-pit kerb with soil and moss       { s }
//  bed      raised ashlar flower bed                       { w, d, h, colors: [hue,…], seed }
//  bench    oak-slat bench on stone feet                   { w }
//  winbox   oak window box with flowers and trailing ivy   { w, colors, seed }
//  post     carved oak district signpost (arms are child rows, kind arm) { h }
//  arm      one pointing arm board, text rides as a vector child   { len }
//  plaque   carved stone street-name plaque on a wall      { w, h }
// Tuning lives in scripts/lib/data/hb/green.yml; placed by scripts/lib/hb-green.js.
import { G, X, rng, TEX } from "../lib/geo.js";
const STONE = "cdn/texture-grey-ashlar-stone-wall.png", SOIL = "cdn/texture-dark-garden-soil.png";
const FLOWER = { red: 25, gold: 85, blue: 255, white: 100, violet: 305, pink: 0 };
const hueOf = (c) => (typeof c === "number" ? c : FLOWER[c] ?? 25);

function flowers(ctx, g, R, x0, z0, w, d, y, colors, per) {
  ctx.albedo(null); const lod = ctx.lod || 1, n = Math.max(3, Math.round(w * d * per / lod));
  for (let i = 0; i < n; i++) {
    const x = x0 + R() * w, z = z0 + R() * d, h = 0.18 + R() * 0.22, hue = hueOf(colors[Math.floor(R() * colors.length)]);
    ctx.color(`oklch(${0.42 + R() * 0.12} 0.11 ${130 + R() * 15})`);
    for (let k = 0; k < 3; k++) { const a = R() * 6.283, l = 0.1 + R() * 0.08; g.tri([x, y, z], [x + Math.cos(a) * l, y + 0.1 + R() * 0.06, z + Math.sin(a) * l], [x + Math.cos(a + 0.5) * l * 0.6, y + 0.04, z + Math.sin(a + 0.5) * l * 0.6]); g.tri([x, y, z], [x + Math.cos(a + 0.5) * l * 0.6, y + 0.04, z + Math.sin(a + 0.5) * l * 0.6], [x + Math.cos(a) * l, y + 0.1 + R() * 0.06, z + Math.sin(a) * l]); }
    const heads = lod >= 3 ? 1 : 3;
    for (let j = 0; j < heads; j++) {
      const bx = x + (R() - 0.5) * 0.14, bz = z + (R() - 0.5) * 0.14, by = y + h * (0.75 + R() * 0.3), r = 0.045 + R() * 0.025;
      ctx.color("oklch(0.45 0.1 135)"); g.tri([x - 0.006, y, z], [x + 0.006, y, z], [bx, by, bz]); g.tri([x + 0.006, y, z], [x - 0.006, y, z], [bx, by, bz]);
      ctx.color(`oklch(${hue > 60 && hue < 110 ? 0.82 : 0.6} 0.19 ${hue + (R() - 0.5) * 14})`);
      for (let p = 0; p < 5; p++) { const a = p / 5 * 6.283 + R(), b = a + 0.62; const A = [bx + Math.cos(a) * r, by + 0.012, bz + Math.sin(a) * r], B = [bx + Math.cos(b) * r, by + 0.012, bz + Math.sin(b) * r]; g.tri([bx, by, bz], A, B); g.tri([bx, by, bz], B, A); }
      ctx.color("oklch(0.85 0.15 90)"); g.tri([bx - 0.012, by + 0.016, bz], [bx + 0.012, by + 0.016, bz - 0.01], [bx, by + 0.016, bz + 0.013]);
    }
  }
  ctx.color(null);
}

function rim(ctx, g, w, d, h, t, cap) { // a hollow stone kerb w×d, wall t, coping cap
  ctx.albedo(STONE); ctx.color("oklch(0.93 0.02 75)");
  g.box(0, h / 2, -d / 2 + t / 2, w, h, t); g.box(0, h / 2, d / 2 - t / 2, w, h, t);
  g.box(-w / 2 + t / 2, h / 2, 0, t, h, d - 2 * t); g.box(w / 2 - t / 2, h / 2, 0, t, h, d - 2 * t);
  if (cap && (ctx.lod || 1) <= 2) { ctx.color("oklch(0.97 0.015 80)"); const c = 0.04, o = t + 0.04; g.box(0, h + c / 2, -d / 2 + t / 2, w + 0.06, c, o); g.box(0, h + c / 2, d / 2 - t / 2, w + 0.06, c, o); g.box(-w / 2 + t / 2, h + c / 2, 0, o, c, d - t); g.box(w / 2 - t / 2, h + c / 2, 0, o, c, d - t); }
  ctx.color(null);
}
function soil(ctx, g, w, d, y) { ctx.albedo(SOIL); ctx.color("oklch(0.9 0.02 60)"); g.quad([-w / 2, y, d / 2], [w / 2, y, d / 2], [w / 2, y, -d / 2], [-w / 2, y, -d / 2]); ctx.color(null); }

const KINDS = {
  pit(ctx, g, p) {
    const s = p.s ?? 1.5; rim(ctx, g, s, s, 0.16, 0.16, true); soil(ctx, g, s - 0.3, s - 0.3, 0.1);
    const R = rng(77 + (p.seed ?? 1)); flowers(ctx, g, R, -s / 2 + 0.17, -s / 2 + 0.17, s - 0.34, s - 0.34, 0.1, p.colors ?? ["white", "violet"], 12);
  },
  bed(ctx, g, p) {
    const w = p.w ?? 2.2, d = p.d ?? 2.2, h = p.h ?? 0.45, t = 0.2; rim(ctx, g, w, d, h, t, true); soil(ctx, g, w - 2 * t, d - 2 * t, h - 0.08);
    const R = rng(300 + (p.seed ?? 1) * 7); flowers(ctx, g, R, -w / 2 + t, -d / 2 + t, w - 2 * t, d - 2 * t, h - 0.08, p.colors ?? ["red"], 16);
    if ((ctx.lod || 1) <= 2) { ctx.albedo(TEX.moss); ctx.color("oklch(0.85 0.06 135)"); for (const [x, z] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) g.box(x * (w / 2 - t - 0.12), h - 0.02, z * (d / 2 - t - 0.12), 0.22, 0.14, 0.22); ctx.color(null); }
  },
  bench(ctx, g, p) {
    const w = p.w ?? 1.8;
    ctx.albedo(STONE); ctx.color("oklch(0.9 0.02 75)"); for (const x of [-w / 2 + 0.2, w / 2 - 0.2]) { g.box(x, 0.21, 0, 0.16, 0.42, 0.46); g.box(x, 0.66, 0.2, 0.12, 0.5, 0.08); }
    ctx.albedo(TEX.oak); ctx.color("oklch(0.98 0.03 70)");
    for (let i = 0; i < 4; i++) g.box(0, 0.45, -0.18 + i * 0.12, w, 0.05, 0.1);
    for (let i = 0; i < 2; i++) g.box(0, 0.68 + i * 0.16, 0.24, w, 0.11, 0.04);
    ctx.color(null);
  },
  winbox(ctx, g, p) {
    const w = p.w ?? 1.2, d = 0.3, h = 0.24; ctx.albedo(TEX.oak); ctx.color("oklch(0.98 0.04 65)");
    g.box(0, h / 2, -d / 2 + 0.02, w, h, 0.04); g.box(0, h / 2, d / 2 - 0.02, w, h, 0.04); g.box(-w / 2 + 0.02, h / 2, 0, 0.04, h, d); g.box(w / 2 - 0.02, h / 2, 0, 0.04, h, d); g.box(0, 0.02, 0, w, 0.04, d);
    for (const x of [-w / 2 + 0.12, w / 2 - 0.12]) { ctx.albedo(TEX.iron); ctx.color("oklch(0.7 0.01 60)"); g.box(x, -0.08, d / 2 - 0.03, 0.03, 0.2, 0.03); }
    soil(ctx, g, w - 0.08, d - 0.08, h - 0.03);
    const R = rng(900 + (p.seed ?? 1) * 5); flowers(ctx, g, R, -w / 2 + 0.06, -d / 2 + 0.06, w - 0.12, d - 0.12, h - 0.03, p.colors ?? ["red", "gold"], 26);
    // trailing ivy over the front lip (front = -Z, away from the wall)
    ctx.albedo(null); const n = Math.round(w * 6 / (ctx.lod || 1));
    for (let i = 0; i < n; i++) { const x = -w / 2 + 0.05 + R() * (w - 0.1), l = 0.15 + R() * 0.3; ctx.color(`oklch(${0.38 + R() * 0.12} 0.1 ${135 + R() * 10})`); g.quad([x - 0.04, h, -d / 2 - 0.01], [x + 0.04, h, -d / 2 - 0.01], [x + 0.03, h - l, -d / 2 - 0.04], [x - 0.03, h - l, -d / 2 - 0.04]); g.quad([x - 0.03, h - l, -d / 2 - 0.04], [x + 0.03, h - l, -d / 2 - 0.04], [x + 0.04, h, -d / 2 - 0.01], [x - 0.04, h, -d / 2 - 0.01]); }
    ctx.color(null);
  },
  post(ctx, g, p) {
    const h = p.h ?? 3.3, r = 0.09, lod = ctx.lod || 1;
    ctx.albedo(STONE); ctx.color("oklch(0.92 0.02 75)"); g.box(0, 0.15, 0, 0.6, 0.3, 0.6); g.box(0, 0.36, 0, 0.42, 0.12, 0.42);
    ctx.albedo(TEX.oak); ctx.color("oklch(0.98 0.04 65)");
    // chamfered octagonal post
    g.tube([[0, 0.3, 0, r * 1.25], [0, 0.6, 0, r * 1.1], [0, 0.62, 0, r * 1.3], [0, 0.72, 0, r * 1.3], [0, 0.74, 0, r], [0, h - 0.3, 0, r], [0, h - 0.28, 0, r * 1.3], [0, h - 0.2, 0, r * 1.3], [0, h - 0.18, 0, r * 0.9]], 8, { capB: true });
    if (lod <= 2) for (let k = 0; k < 4; k++) { const y = 0.95 + k * 0.08; g.tube([[0, y, 0, r * 1.06], [0, y + 0.03, 0, r * 1.06]], 8); }
    // carved finial: a crowned lantern-cap and a gilt orb
    ctx.color("oklch(0.85 0.06 60)"); g.tube([[0, h - 0.18, 0, 0.16], [0, h - 0.1, 0, 0.17], [0, h + 0.02, 0, 0.02]], 4, { capA: true, capB: true });
    ctx.albedo(null); ctx.color("oklch(0.78 0.14 85)"); g.tube([[0, h + 0.03, 0, 0.012], [0, h + 0.06, 0, 0.065], [0, h + 0.12, 0, 0.065], [0, h + 0.16, 0, 0.012]], 8, { capA: true, capB: true });
    ctx.color(null);
  },
  arm(ctx, g, p) {
    const L = p.len ?? 1.5, H = 0.3, t = 0.05, x0 = 0.08, tip = 0.22;
    ctx.albedo(TEX.oak); ctx.color("oklch(0.98 0.05 65)");
    g.box(x0 + (L - tip) / 2, 0, 0, L - tip, H, t);
    // arrow tip as a wedge (both faces + edges)
    const a = x0 + L - tip, b = x0 + L, T = t / 2;
    for (const z of [T, -T]) { const P = [[a, H / 2, z], [b, 0, z], [a, -H / 2, z]]; if (z > 0) g.tri(P[2], P[1], P[0]); else g.tri(P[0], P[1], P[2]); }
    g.quad([a, H / 2, -T], [b, 0, -T], [b, 0, T], [a, H / 2, T]); g.quad([a, -H / 2, T], [b, 0, T], [b, 0, -T], [a, -H / 2, -T]);
    // carved border bead and a gilt rivet into the post
    if ((ctx.lod || 1) <= 2) { ctx.color("oklch(0.7 0.07 55)"); for (const z of [T + 0.005, -T - 0.005]) { g.box(x0 + (L - tip) / 2, H / 2 - 0.025, z, L - tip - 0.04, 0.018, 0.01); g.box(x0 + (L - tip) / 2, -H / 2 + 0.025, z, L - tip - 0.04, 0.018, 0.01); } }
    ctx.albedo(TEX.iron); ctx.color("oklch(0.6 0.01 60)"); g.box(0.04, 0, 0, 0.1, 0.36, 0.08);
    ctx.color(null);
  },
  plaque(ctx, g, p) {
    const w = p.w ?? 1.4, h = p.h ?? 0.42, t = 0.06;
    ctx.albedo(STONE); ctx.color("oklch(0.4 0.03 250)"); g.box(0, h / 2, -t / 2, w, h, t);
    ctx.albedo(null); ctx.color("oklch(0.72 0.13 80)"); const f = 0.03;
    g.box(0, h - f / 2, -t - 0.005, w, f, 0.012); g.box(0, f / 2, -t - 0.005, w, f, 0.012); g.box(-w / 2 + f / 2, h / 2, -t - 0.005, f, h, 0.012); g.box(w / 2 - f / 2, h / 2, -t - 0.005, f, h, 0.012);
    ctx.color(null);
  },
};

// #844: many small pieces (pits, window boxes) drawn as one object: params.items = [{ k, p, x, y, z, yaw }], local to the batch's feet
KINDS.batch = (ctx, g, p) => { for (const it of p.items ?? []) g.at(X([it.x, it.y, it.z], it.yaw ?? 0), () => (KINDS[it.k] ?? KINDS.pit)(ctx, g, it.p ?? {})); };

export function geometry(ctx) {
  ctx.roughness?.(1); ctx.metalness?.(0);
  const g = new G(ctx), p = ctx.params ?? {};
  (KINDS[p.kind] ?? KINDS.pit)(ctx, g, p);
  ctx.albedo(null);
}

export function collider(ctx) {
  const p = ctx.params ?? {};
  if (p.kind === "bed") { const h = p.h ?? 0.45; return { kind: "box", width: p.w ?? 2.2, height: h, depth: p.d ?? 2.2, center: [0, h / 2, 0] }; }
  if (p.kind === "bench") return { kind: "box", width: p.w ?? 1.8, height: 0.5, depth: 0.5, center: [0, 0.25, 0] };
  if (p.kind === "post") return { kind: "box", width: 0.6, height: p.h ?? 3.3, depth: 0.6, center: [0, (p.h ?? 3.3) / 2, 0] };
  return null;
}
