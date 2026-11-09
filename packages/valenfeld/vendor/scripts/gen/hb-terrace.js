// HIGHBRIDGE TERRACES: the retaining walls and stairs that hold the city's four levels (scripts/lib/data/highbridge.yml terraces).
// params.kind:
//  wall  { len, H, T, gaps:[[u0,u1]..], clear:[[u0,u1]..], plain, seed }  runs local +x 0..len, face (low side) toward -z,
//        body on the high side z 0..T; y 0 = low ground, H = high ground. Plinth, buttresses ~8 m, drains, ivy, coping, parapet.
//  stair { H, w, cheek }  a flight rising toward local -z from y 0 at z 0 to y H; ashlar cheeks with a sloped balustrade.
import { paint, flatc, HX, BX, IR } from "../lib/buildkit.js";
const ASH = "cdn/texture-ashlar-cream-limestone-two-courses-big-dressed-blocks-thin-pale-mortar-subtle-weathering.png";
const FLAGS = "cdn/texture-worn-grey-cobblestone-street-setts.png", IVY = "cdn/texture-dense-dark-green-ivy-leaves-on-stone.png";
const CREAM = "oklch(0.97 0.012 80)", CREAM2 = "oklch(0.9 0.015 80)", CREAM3 = "oklch(0.8 0.02 75)", STAIN = "oklch(0.32 0.02 70)", IVYC = "oklch(0.92 0.04 140)", IRC = "oklch(0.4 0.01 60)";
function rng(s) { let a = (s | 0) * 2654435761 >>> 0 || 1; return () => { a ^= a << 13; a >>>= 0; a ^= a >> 17; a ^= a << 5; a >>>= 0; return a / 4294967296; }; }
// emitter with triplanar uvs (S tiles per metre)
function wrap(ctx) { const uv = []; let S = 0.4;
  const W = { uv,
    tri(ax, ay, az, bx, by, bz, cx, cy, cz) { ctx.tri(ax, ay, az, bx, by, bz, cx, cy, cz);
      const ux = bx - ax, uy = by - ay, uz = bz - az, vx = cx - ax, vy = cy - ay, vz = cz - az;
      const nx = Math.abs(uy * vz - uz * vy), ny = Math.abs(uz * vx - ux * vz), nz = Math.abs(ux * vy - uy * vx);
      for (const [x, y, z] of [[ax, ay, az], [bx, by, bz], [cx, cy, cz]]) { if (ny >= nx && ny >= nz) uv.push(x * S, z * S); else if (nx >= nz) uv.push(z * S, y * S); else uv.push(x * S, y * S); } },
    quad(ax, ay, az, bx, by, bz, cx, cy, cz, dx, dy, dz) { W.tri(ax, ay, az, bx, by, bz, cx, cy, cz); W.tri(ax, ay, az, cx, cy, cz, dx, dy, dz); },
    albedo: (t) => ctx.albedo(t), color: (...a) => ctx.color(...a), emissive: (...a) => ctx.emissive(...a), smooth: () => ctx.smooth?.(), flat: () => ctx.flat?.(),
    scale(s) { S = s; } };
  return W; }
// solid runs of [0,len] minus gaps
function runs(len, gaps) { const g = [...(gaps ?? [])].sort((a, b) => a[0] - b[0]); const out = []; let u = 0;
  for (const [a, b] of g) { if (a > u + 0.05) out.push([u, Math.min(a, len)]); u = Math.max(u, b); } if (u < len - 0.05) out.push([u, len]); return out; }
const inside = (u, list) => (list ?? []).some(([a, b]) => u > a - 0.8 && u < b + 0.8);
function wall(W, p, L, coll) { const len = p.len ?? 20, H = p.H ?? 5, T = p.T ?? 1.4, R = rng(p.seed ?? 1), solid = runs(len, p.gaps), blocked = [...(p.gaps ?? []), ...(p.clear ?? [])];
  if (coll) { for (const [a, b] of solid) { BX(W, a, -1, 0, b, H + 0.3, T); BX(W, a, H + 0.3, 0, b, H + 1.15, 0.5); } return; }
  for (const [a, b] of solid) {
    // body, its face battered in a hand's width toward the top
    paint(W, ASH, CREAM2); W.scale(0.32);
    HX(W, [[a, -1, -0.08], [b, -1, -0.08], [b, -1, T], [a, -1, T], [a, H, 0.06], [b, H, 0.06], [b, H, T], [a, H, T]]);
    if (!p.plain) { // plinth: a chamfered footing course
      paint(W, ASH, CREAM3); W.scale(0.45);
      for (const [u0, u1] of runs(b - a, (p.clear ?? []).map(([c, d]) => [c - a, d - a]))) {
        const x0 = a + u0, x1 = a + u1; if (x1 - x0 < 0.1) continue;
        HX(W, [[x0, -0.6, -0.55], [x1, -0.6, -0.55], [x1, -0.6, 0], [x0, -0.6, 0], [x0, 0.55, -0.55], [x1, 0.55, -0.55], [x1, 0.55, 0], [x0, 0.55, 0]]);
        if (L <= 2) HX(W, [[x0, 0.55, -0.55], [x1, 0.55, -0.55], [x1, 0.55, 0], [x0, 0.55, 0], [x0, 0.85, -0.12], [x1, 0.85, -0.12], [x1, 0.85, 0], [x0, 0.85, 0]]); }
      // string course at mid height
      if (H >= 7 && L <= 2) { paint(W, ASH, CREAM); BX(W, a, H * 0.5 - 0.15, -0.22, b, H * 0.5 + 0.12, 0.1); }
    }
    // coping and parapet with its own capping
    paint(W, ASH, CREAM); W.scale(0.5);
    BX(W, a - (a > 0 ? 0 : 0.1), H - 0.02, -0.32, b + (b < len ? 0 : 0.1), H + 0.3, T + 0.05);
    paint(W, ASH, CREAM2); W.scale(0.4); BX(W, a, H + 0.3, 0.02, b, H + 1.0, 0.48);
    paint(W, ASH, CREAM); W.scale(0.5); BX(W, a, H + 1.0, -0.06, b, H + 1.18, 0.56);
    if (L <= 2) for (let u = a + 2.2; u < b - 1; u += 4.4) BX(W, u - 0.3, H + 1.18, -0.02, u + 0.3, H + 1.42, 0.52); // capstones
    // newel blocks at run ends that meet a gap (stair heads)
    for (const e of [a, b]) if (e > 0.05 && e < len - 0.05) { paint(W, ASH, CREAM3); BX(W, e - 0.4 + (e === a ? 0.4 : -0.4) + 0.4 * (e === a ? 0 : 0), H + 0.3, -0.1, e + (e === a ? 0.8 : 0) - (e === a ? 0 : 0.8) + 0.8 * (e === a ? -1 : 1) * 0 , H + 1.6, 0.6); }
  }
  if (p.plain) return;
  // buttresses: stepped ashlar spurs on the face, one every ~8 m, never in a gap or clear run
  const n = Math.max(1, Math.round(len / 8)), step = len / n;
  for (let i = 0; i <= n; i++) { const u = Math.min(len - 0.7, Math.max(0.7, i * step)); if (inside(u, blocked)) continue;
    paint(W, ASH, CREAM3); W.scale(0.38);
    const h1 = H * 0.55, h2 = H - 0.4;
    HX(W, [[u - 0.65, -0.8, -1.05], [u + 0.65, -0.8, -1.05], [u + 0.65, -0.8, 0], [u - 0.65, -0.8, 0], [u - 0.65, h1, -0.85], [u + 0.65, h1, -0.85], [u + 0.65, h1, 0], [u - 0.65, h1, 0]]);
    HX(W, [[u - 0.55, h1, -0.85], [u + 0.55, h1, -0.85], [u + 0.55, h1, 0], [u - 0.55, h1, 0], [u - 0.55, h1 + 0.35, -0.55], [u + 0.55, h1 + 0.35, -0.55], [u + 0.55, h1 + 0.35, 0], [u - 0.55, h1 + 0.35, 0]]);
    HX(W, [[u - 0.5, h1 + 0.35, -0.55], [u + 0.5, h1 + 0.35, -0.55], [u + 0.5, h1 + 0.35, 0], [u - 0.5, h1 + 0.35, 0], [u - 0.5, h2, -0.4], [u + 0.5, h2, -0.4], [u + 0.5, h2, 0], [u - 0.5, h2, 0]]);
    HX(W, [[u - 0.5, h2, -0.4], [u + 0.5, h2, -0.4], [u + 0.5, h2, 0], [u - 0.5, h2, 0], [u - 0.5, h2 + 0.3, -0.05], [u + 0.5, h2 + 0.3, -0.05], [u + 0.5, h2 + 0.3, 0], [u - 0.5, h2 + 0.3, 0]]);
  }
  // drains: a stone spout mid-bay with a dark weep stain under it; ivy hangs from the coping in some bays
  for (let i = 0; i < n; i++) { const u = (i + 0.5) * step; if (inside(u, blocked)) continue;
    const r = R();
    if (i % 2 === 0) { const y = Math.max(1.4, H * 0.4);
      paint(W, ASH, CREAM3); W.scale(0.8); BX(W, u - 0.16, y - 0.1, -0.55, u + 0.16, y + 0.12, -0.05);
      flatc(W, "oklch(0.12 0.01 60)"); BX(W, u - 0.08, y + 0.02, -0.56, u + 0.08, y + 0.1, -0.5);
      flatc(W, STAIN); const sw = 0.28 + r * 0.25; W.quad(u - sw * 0.5, 0.6, -0.105, u + sw * 0.5, 0.6, -0.105, u + 0.12, y - 0.1, -0.105 + 0.14 * (1 - (y - 0.1) / H) * 0, u - 0.12, y - 0.1, -0.105); }
    if (L <= 2 && r > 0.35) { // ivy: overlapping leaf mats tumbling from the coping
      paint(W, IVY, IVYC); W.scale(0.7); const c = u + (R() - 0.5) * step * 0.4, wd = 1.4 + R() * 2.4, dn = H * (0.35 + R() * 0.55);
      for (let k = 0; k < 4; k++) { const cx = c + (R() - 0.5) * wd * 0.6, hw = wd * (0.3 + R() * 0.3), top = H + 0.28, bot = Math.max(0.4, top - dn * (0.5 + R() * 0.5)), zz = -0.36 - k * 0.012 - (H - bot) * 0.004;
        const sk = (R() - 0.5) * 0.5;
        W.quad(cx - hw * 0.75 + sk, bot, zz, cx + hw * 0.6 + sk, bot + 0.3, zz, cx + hw, top, -0.34, cx - hw, top, -0.34); }
    }
  }
}
function stair(W, p, L, coll) { const H = p.H ?? 5, w = p.w ?? 4, c = p.cheek ?? 0.5, n = Math.max(1, Math.round(H / 0.18)), rise = H / n, tr = 0.28, run = n * tr, hw = w / 2, X = hw + c, land = p.land ?? 0;
  if (coll) { // a smooth incline the body walks, the cheeks and balustrades
    HX(W, [[-hw, -0.5, 0.3], [hw, -0.5, 0.3], [hw, -0.5, -run], [-hw, -0.5, -run], [-hw, 0, 0.3], [hw, 0, 0.3], [hw, H, -run], [-hw, H, -run]].map(([x, y, z], i) => i >= 4 ? [x, i < 6 ? 0.02 : H, z] : [x, y, z]));
    for (const s of [-1, 1]) { const x0 = s * hw, x1 = s * X; HX(W, [[x0, -0.5, 0], [x1, -0.5, 0], [x1, -0.5, -run], [x0, -0.5, -run], [x0, 1.1, 0], [x1, 1.1, 0], [x1, H + 1.1, -run], [x0, H + 1.1, -run]]); }
    BX(W, -X, H - 1.5, -run + 0.05, X, H, -run - land - 0.1);
    return; }
  paint(W, ASH, CREAM3); W.scale(0.35); // the mass under the flight
  HX(W, [[-hw, -0.6, 0], [hw, -0.6, 0], [hw, -0.6, -run], [-hw, -0.6, -run], [-hw, -0.59, 0], [hw, -0.59, 0], [hw, H - rise, -run], [-hw, H - rise, -run]]);
  paint(W, FLAGS, "oklch(0.88 0.02 75)"); W.scale(0.6); const st = L <= 2 ? 1 : 2;
  for (let i = 0; i < n; i += st) { const y1 = Math.min(H, (i + st) * rise); BX(W, -hw, y1 - rise * st - 0.04, -i * tr, hw, y1, -(i + st) * tr - 0.03); }
  if (land > 0) { paint(W, FLAGS, "oklch(0.88 0.02 75)"); W.scale(0.6); BX(W, -X, H - 1.5, -run + 0.05, X, H, -run - land); }
  if (L <= 2) { paint(W, ASH, CREAM); W.scale(0.6); for (let i = 0; i < n; i++) BX(W, -hw + 0.02, (i + 1) * rise - 0.06, -i * tr + 0.02, hw - 0.02, (i + 1) * rise + 0.005, -i * tr - 0.06); } // worn nosings
  for (const s of [-1, 1]) { const x0 = s * hw, x1 = s * X; // cheeks with a sloped capping rail and newels
    paint(W, ASH, CREAM2); W.scale(0.35);
    HX(W, [[x0, -0.6, 0], [x1, -0.6, 0], [x1, -0.6, -run], [x0, -0.6, -run], [x0, 0.95, 0], [x1, 0.95, 0], [x1, H + 0.95, -run], [x0, H + 0.95, -run]]);
    paint(W, ASH, CREAM); W.scale(0.5); const xa = s * (hw - 0.06), xb = s * (X + 0.06);
    HX(W, [[xa, 0.95, 0.05], [xb, 0.95, 0.05], [xb, H + 0.95, -run], [xa, H + 0.95, -run], [xa, 1.15, 0.05], [xb, 1.15, 0.05], [xb, H + 1.15, -run], [xa, H + 1.15, -run]]);
    paint(W, ASH, CREAM3); BX(W, Math.min(x0, x1) - 0.1, -0.6, 0.4, Math.max(x0, x1) + 0.1, 1.45, -0.35); // foot newel
    if (L <= 2) { flatc(W, "oklch(0.75 0.13 85)"); BX(W, s * (hw + c / 2) - 0.12, 1.45, 0.14, s * (hw + c / 2) + 0.12, 1.7, -0.1); }
    if (L <= 2 && H > 6) { paint(W, IR, IRC); for (let t = 0.33; t < 0.9; t += 0.33) { const z = -run * t, y = H * t; BX(W, s * (hw + c / 2) - 0.04, y + 1.15, z - 0.04, s * (hw + c / 2) + 0.04, y + 1.6, z + 0.04); } }
  }
}
const KINDS = { wall, stair };
// far levels: the outline as a few blocks (body + coping for a wall, one wedge mass for a stair)
function far(W, p) { paint(W, ASH, CREAM2); W.scale(0.32);
  if (p.kind === "stair") { const H = p.H ?? 5, run = Math.max(1, Math.round(H / 0.18)) * 0.28 + (p.land ?? 0), X = (p.w ?? 4) / 2 + (p.cheek ?? 0.5);
    HX(W, [[-X, -0.6, 0], [X, -0.6, 0], [X, -0.6, -run], [-X, -0.6, -run], [-X, 0.4, 0], [X, 0.4, 0], [X, H, -run], [-X, H, -run]]); return; }
  const H = p.H ?? 5, T = p.T ?? 1.4; for (const [a, b] of runs(p.len ?? 20, p.gaps)) { BX(W, a, -1, 0, b, H, T); BX(W, a, H, 0, b, H + 1.1, 0.5); } }
export function geometry(ctx) { const p = ctx.params ?? {}, W = wrap(ctx), L = ctx.lod ?? 1; if (L >= 4) far(W, p); else (KINDS[p.kind] ?? wall)(W, p, L, false); return { uvs: W.uv }; }
export function collider(ctx) { const p = ctx.params ?? {}; (KINDS[p.kind] ?? wall)(ctx, p, 1, true); }
