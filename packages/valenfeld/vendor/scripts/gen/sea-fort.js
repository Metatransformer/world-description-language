// sea-fort: a harbour town's sea wall as ONE scripted primitive, reusable for any coastal town by params.
// Frame: origin = the gate's centre at ground, -Z = seaward (the quay side), +X along the wall. Feet sit on the town pad.
// params { span: [x0, x1] wall ends (tower centres), h: wall height, t: thickness, foot: depth below ground,
//   tower: { r, h, roof: true }, gate: { x, w, gh, W, D, H }, returns: length of the wall legs running inland (+z) from each tower,
//   quay: { depth, x0, x1, drop, stair: { x, landing } } | null, seed }
import { paint, flatc, glow, BX, RB, LA, CB, SEG, CY, TORUS, IR, SL, OAK, IRONC, WOOD } from "../lib/buildkit.js";
const GREY = "cdn/texture-grey-ashlar-stone-wall.png", FLAGS = "cdn/texture-grey-flagstone-paving.png";
const STONEC = "oklch(0.85 0.016 80)", QUAYC = "oklch(0.66 0.02 90)", SLATEC = "oklch(0.5 0.025 250)", SLIT = "oklch(0.16 0.01 250)";
function P(p) { const g = p.gate ?? {}, tw = p.tower ?? {}, q = p.quay === null ? null : (p.quay ?? {});
  return { x0: (p.span ?? [-60, 60])[0], x1: (p.span ?? [-60, 60])[1], h: p.h ?? 8, t: p.t ?? 2.6, foot: p.foot ?? 2.5, ret: p.returns ?? 12,
    r: tw.r ?? 5, th: tw.h ?? 13, roof: tw.roof !== false, gx: g.x ?? 0, gw: g.w ?? 4.2, gh: g.gh ?? 5, W: g.W ?? 11, D: g.D ?? 10, H: g.H ?? 12.5,
    q: q && { depth: q.depth ?? 14, x0: q.x0 ?? -40, x1: q.x1 ?? 40, drop: q.drop ?? 9.5, sx: q.stair?.x ?? (g.x ?? 0), land: q.stair?.landing ?? -3.7 } }; }
const stone = (c) => paint(c, GREY, STONEC);
// a straight run of curtain along x (z = 0 centre) or along z (x = 0 centre): body, batter, string course, seaward crenels, slits
function run(c, a, b, o, along, side, D) { // along "x": from x=a to x=b at z=o; "z": from z=a to z=b at x=o; side: -1/+1 which face is outward
  const S = (u0, y0, v0, u1, y1, v1) => along === "x" ? BX(c, u0, y0, o + v0, u1, y1, o + v1) : BX(c, o + v0, y0, u0, o + v1, y1, u1);
  const { h, t, foot } = D.g, hw = t / 2, out = side * hw; if (b - a < 0.3) return;
  stone(c); S(a, -foot, -hw, b, h, hw);
  S(a, -foot, Math.min(out, out + side * 0.6), b, 1.4, Math.max(out, out + side * 0.6)); // battered plinth
  if (D.lod <= 3) S(a, h - 1.5, Math.min(out, out + side * 0.18), b, h - 1.25, Math.max(out, out + side * 0.18)); // string course
  // parapet: outward a full breastwork with merlons, inward a low rail
  const po = side > 0 ? [hw - 0.6, hw] : [-hw, -hw + 0.6], pi = side > 0 ? [-hw, -hw + 0.35] : [hw - 0.35, hw];
  S(a, h, po[0], b, h + (D.lod <= 4 ? 1.0 : 1.6), po[1]);
  if (D.lod <= 3) { S(a, h, pi[0], b, h + 0.7, pi[1]);
    const n = Math.max(1, Math.floor((b - a) / 2.1)), st = (b - a) / n;
    for (let i = 0; i < n; i++) { const m = a + st * (i + 0.5); S(m - 0.6, h + 1.0, po[0], m + 0.6, h + 1.95, po[1]); S(m - 0.55, h + 0.7, pi[0], m + 0.55, h + 1.45, pi[1]); }   // critic r8: the town side crenellates too
    // the town face: buttresses every ~6 m, a string course, so the landward face reads as a built wall, not a slab
    const inn = -out, iv = [Math.min(inn, inn - side * 0.55), Math.max(inn, inn - side * 0.55)], nb = Math.max(1, Math.round((b - a) / 6));
    for (let i = 0; i <= nb; i++) { const m = a + (b - a) * i / nb, m0 = Math.max(a, m - 0.55), m1 = Math.min(b, m + 0.55); S(m0, -foot, iv[0], m1, h - 2.2, iv[1]); S(m0, h - 2.2, iv[0] + (side > 0 ? 0.25 : 0), m1, h - 1.6, iv[1] - (side > 0 ? 0 : 0.25)); }
    S(a, h - 1.5, Math.min(inn, inn - side * 0.18), b, h - 1.25, Math.max(inn, inn - side * 0.18)); }
  if (D.lod <= 2 && b - a > 18) { const m = (a + b) / 2 + 3, inn = -out, f = inn - side * 0.04;   // a postern on the town face: dark door, oak leaf, stone lintel, a lamp
    flatc(c, SLIT); S(m - 0.75, 0, Math.min(inn, f), m + 0.75, 2.3, Math.max(inn, f));
    paint(c, OAK, WOOD); S(m - 0.65, 0, Math.min(inn, inn - side * 0.08), m + 0.65, 2.2, Math.max(inn, inn - side * 0.08));
    stone(c); S(m - 1.05, 2.3, Math.min(inn, inn - side * 0.3), m + 1.05, 2.75, Math.max(inn, inn - side * 0.3));
    glow(c, "oklch(0.78 0.12 75)", [2.2, 1.3, 0.45]); S(m + 1.3, 2.4, Math.min(inn, inn - side * 0.3), m + 1.7, 2.95, Math.max(inn, inn - side * 0.3)); }
  if (D.lod <= 2) { flatc(c, SLIT); const n = Math.floor((b - a) / 7); for (let i = 1; i <= n; i++) { const m = a + (b - a) * i / (n + 1); S(m - 0.12, h - 4.2, out - side * 0.02, m + 0.12, h - 2.8, out + side * 0.03); } }
}
function tower(c, x, z, D) { const { r, th, foot, roof } = D.g, n = D.lod <= 2 ? 22 : D.lod <= 3 ? 14 : 8;
  stone(c); LA(c, x, 0, z, [[r + 0.9, -foot], [r + 0.75, 0], [r + 0.1, 2.6], [r, 3.0], [r, th]], n, true);
  if (D.lod <= 3) { LA(c, x, th, z, [[r, 0], [r + 0.45, 0.45], [r + 0.45, 1.3]], n, false); LA(c, x, th + 0.45, z, [[r + 0.45, 0], [r - 0.2, 0]], n, false);
    LA(c, x, th + 0.45, z, [[r - 0.2, 0], [r - 0.2, 0.85]], n, false);
    const k = Math.round(n * 0.6); for (let i = 0; i < k; i++) { const A = (i + 0.5) / k * Math.PI * 2; RB(c, x + Math.cos(A) * (r + 0.2), th + 1.3 + 0.45, z + Math.sin(A) * (r + 0.2), 1.0, 0.9, 0.5, -A * 180 / Math.PI + 90); }
    if (D.lod <= 2) { stone(c); for (let i = 0; i < k; i++) { const A = (i + 0.5) / k * Math.PI * 2; RB(c, x + Math.cos(A) * (r + 0.22), th + 0.2, z + Math.sin(A) * (r + 0.22), 0.4, 0.45, 0.45, -A * 180 / Math.PI + 90); } // corbels
      flatc(c, SLIT); for (let i = 0; i < 6; i++) { const A = i / 6 * Math.PI * 2 + 0.3, yy = 4.5 + (i % 2) * 3.5; RB(c, x + Math.cos(A) * (r - 0.02), yy, z + Math.sin(A) * (r - 0.02), 0.25, 1.3, 0.12, -A * 180 / Math.PI + 90); } } }
  if (roof) { paint(c, SL, SLATEC); LA(c, x, th + 0.45, z, [[r - 0.1, 0], [r * 0.5, r * 0.75], [0.04, r * 1.6]], n, true);
    if (D.lod <= 2) { paint(c, IR, IRONC); SEG(c, [x, th + 0.45 + r * 1.55, z], [x, th + 0.45 + r * 1.6 + 2.2, z], 0.07, 0.07); } }
  else { stone(c); LA(c, x, th, z, [[r, 0.44], [0.01, 0.44]], n, false); }
}
function gate(c, D) { const { gx, gw, gh, W, D: dp, H, foot } = D.g, z0 = -dp / 2 - 1, z1 = dp / 2, xa = gx - W / 2, xb = gx + W / 2, hw = gw / 2, sp = gh - hw;
  stone(c); BX(c, xa, -foot, z0, gx - hw, H, z1); BX(c, gx + hw, -foot, z0, xb, H, z1); BX(c, gx - hw, gh, z0, gx + hw, H, z1);
  BX(c, xa - 0.5, -foot, z0 - 0.5, xb + 0.5, 1.3, z0); // plinth on the sea face
  const k = D.lod <= 2 ? 10 : 5, A = (i) => { const a = Math.PI - i / k * Math.PI; return [gx + Math.cos(a) * hw, sp + Math.sin(a) * hw]; };
  for (let i = 0; i < k; i++) { const [ax, ay] = A(i), [bx, by] = A(i + 1);
    c.quad(ax, ay, z0, bx, by, z0, bx, gh, z0, ax, gh, z0); c.quad(bx, by, z1, ax, ay, z1, ax, gh, z1, bx, gh, z1); // spandrels front/back
    c.quad(bx, by, z0, ax, ay, z0, ax, ay, z1, bx, by, z1); } // soffit
  if (D.lod <= 2) { paint(c, GREY, "oklch(0.97 0.012 80)"); for (let i = 0; i <= 8; i++) { const a = Math.PI - i / 8 * Math.PI; RB(c, gx + Math.cos(a) * (hw + 0.35), sp + Math.sin(a) * (hw + 0.35), z0 - 0.06, 0.55, 0.7, 0.14, 0, 0, (a - Math.PI / 2) * 180 / Math.PI); } }
  // machicolated parapet on the sea face, crenels round the top
  stone(c); BX(c, xa - 0.2, H - 0.9, z0 - 0.7, xb + 0.2, H + 1.1, z0);
  if (D.lod <= 3) { for (let x = xa + 0.4; x < xb; x += 1.3) BX(c, x, H - 1.6, z0 - 0.65, x + 0.4, H - 0.9, z0);
    for (let x = xa; x + 1 <= xb + 0.21; x += 2.1) BX(c, x, H + 1.1, z0 - 0.7, x + 1.0, H + 2.0, z0 - 0.15);
    BX(c, xa, H, z1 - 0.5, xb, H + 1.0, z1); for (let x = xa + 0.3; x + 1 <= xb; x += 2.1) BX(c, x, H + 1.0, z1 - 0.5, x + 1.0, H + 1.9, z1);   /* town-side crenels */ BX(c, xa, H, z0, xa + 0.5, H + 1.0, z1); BX(c, xb - 0.5, H, z0, xb, H + 1.0, z1);
    for (let z = z0 + 0.6; z + 1 <= z1; z += 2.1) { BX(c, xa, H + 1.0, z, xa + 0.5, H + 1.9, z + 1); BX(c, xb - 0.5, H + 1.0, z, xb, H + 1.9, z + 1); } }
  // flanking turrets on the sea corners
  if (D.lod <= 4) for (const sx of [xa, xb]) { const tr = 1.9, n = D.lod <= 2 ? 14 : 8; stone(c); LA(c, sx, 0, z0 + 0.6, [[tr + 0.5, -foot], [tr + 0.3, 1.4], [tr, 2.2], [tr, H + 2.4]], n, true);
    paint(c, SL, SLATEC); LA(c, sx, H + 2.4, z0 + 0.6, [[tr + 0.35, 0], [0.03, tr * 2.1]], n, true); }
  if (D.lod <= 2) { // portcullis half raised, oak leaves folded back, a lit lamp over the arch
    paint(c, IR, IRONC); const pz = z0 + 1.2; for (let x = gx - hw + 0.25; x < gx + hw; x += 0.42) BX(c, x - 0.05, gh - 1.6, pz - 0.05, x + 0.05, gh + 0.05, pz + 0.05);
    for (const yy of [gh - 1.45, gh - 0.8, gh - 0.15]) BX(c, gx - hw, yy - 0.05, pz - 0.05, gx + hw, yy + 0.05, pz + 0.05);
    paint(c, OAK, WOOD); BX(c, gx - hw, 0, z0 + 2.0, gx - hw + 0.14, gh - 0.4, z0 + 2.0 + hw * 0.95); BX(c, gx + hw - 0.14, 0, z0 + 2.0, gx + hw, gh - 0.4, z0 + 2.0 + hw * 0.95);
    glow(c, "oklch(0.78 0.12 75)", [2.2, 1.3, 0.45]); BX(c, gx - 0.3, gh + 1.0, z0 - 0.12, gx + 0.3, gh + 1.7, z0 - 0.02);
    flatc(c, SLIT); for (const sx of [gx - W / 2 + 1.6, gx + W / 2 - 1.6]) BX(c, sx - 0.13, gh + 2.2, z0 - 0.03, sx + 0.13, gh + 3.8, z0); 
    // the town face of the gate (critic r8: "plugged" arch): a voussoir ring, a lamp each side, a slit pair, the passage floor in flags
    paint(c, GREY, "oklch(0.97 0.012 80)"); for (let i = 0; i <= 8; i++) { const a = Math.PI - i / 8 * Math.PI; RB(c, gx + Math.cos(a) * (hw + 0.35), sp + Math.sin(a) * (hw + 0.35), z1 + 0.06, 0.55, 0.7, 0.14, 0, 0, (a - Math.PI / 2) * 180 / Math.PI); }
    glow(c, "oklch(0.78 0.12 75)", [2.2, 1.3, 0.45]); for (const s of [-1, 1]) BX(c, gx + s * (hw + 1.2) - 0.25, gh - 1.6, z1 + 0.02, gx + s * (hw + 1.2) + 0.25, gh - 1.0, z1 + 0.2);
    flatc(c, SLIT); for (const sx of [gx - W / 2 + 1.6, gx + W / 2 - 1.6]) BX(c, sx - 0.13, gh + 2.2, z1, sx + 0.13, gh + 3.8, z1 + 0.03);
    paint(c, FLAGS, QUAYC); BX(c, gx - hw, 0, z0, gx + hw, 0.06, z1 + 1.5); }
}
function quay(c, D) { const q = D.g.q, z1 = -D.g.t / 2, z0 = z1 - q.depth;
  stone(c); BX(c, q.x0, -q.drop, z0, q.x1, -0.12, z1 - 0.6);
  paint(c, FLAGS, QUAYC); BX(c, q.x0, -0.12, z0, q.x1, 0, z1 - 0.6);
  if (D.lod <= 3) { stone(c); BX(c, q.x0, -0.12, z0, q.x1, 0.25, z0 + 0.7); } // coping kerb
  // the water stair: down off the quay edge, cheek walls each side, a landing at the bottom
  const sx = q.sx, n = Math.max(2, Math.round(-q.land / 0.185)), rise = -q.land / n, tr = 0.3, L = n * tr;
  stone(c); for (let i = 0; i < n; i++) BX(c, sx - 1.5, -q.drop, z0 - (i + 1) * tr, sx + 1.5, -(i + 1) * rise, z0 - i * tr);
  BX(c, sx - 2.1, -q.drop, z0 - L - 3, sx + 2.1, q.land, z0 - L);
  for (const s of [-1, 1]) BX(c, sx + s * 1.5, -q.drop, z0 - L, sx + s * 2.1, 0.25, z0);
  if (D.lod <= 2) { paint(c, IR, IRONC); for (let x = q.x0 + 4; x < q.x1 - 2; x += 8) { if (Math.abs(x - sx) < 3) continue; LA(c, x, 0.25, z0 + 0.45, [[0.22, 0], [0.26, 0.3], [0.16, 0.55], [0.24, 0.7]], 10, true); } }
}
export function geometry(c) { const g = P(c.params ?? {}), D = { g, lod: c.lod ?? 1 }, { x0, x1, r, gx, W, ret, t } = g;
  run(c, x0 + r * 0.7, gx - W / 2, 0, "x", -1, D); run(c, gx + W / 2, x1 - r * 0.7, 0, "x", -1, D);
  if (ret > 0) { run(c, r * 0.7, r * 0.7 + ret, x0, "z", -1, D); run(c, r * 0.7, r * 0.7 + ret, x1, "z", 1, D); }
  tower(c, x0, 0, D); tower(c, x1, 0, D); gate(c, D); if (g.q) quay(c, D);
}
export function collider(c) { const g = P(c.params ?? {}), box = CB(), { x0, x1, r, gx, gw, gh, W, D: dp, H, h, t, ret, foot } = g, hw = t / 2;
  box(x0 + r * 0.7, -foot, -hw - 0.6, gx - W / 2, h + 1, hw); box(gx + W / 2, -foot, -hw - 0.6, x1 - r * 0.7, h + 1, hw);
  if (ret > 0) { box(x0 - hw - 0.6, -foot, r * 0.7, x0 + hw, h + 1, r * 0.7 + ret); box(x1 - hw, -foot, r * 0.7, x1 + hw + 0.6, h + 1, r * 0.7 + ret); }
  for (const x of [x0, x1]) box(x - r - 0.3, -foot, -r - 0.3, x + r + 0.3, g.th + 1.3, r + 0.3);
  const z0 = -dp / 2 - 1, z1 = dp / 2; box(gx - W / 2 - 2.4, -foot, z0 - 0.7, gx - gw / 2, H + 1, z1); box(gx + gw / 2, -foot, z0 - 0.7, gx + W / 2 + 2.4, H + 1, z1); box(gx - gw / 2, gh - 0.4, z0, gx + gw / 2, H + 1, z1);
  if (g.q) { const q = g.q, qz1 = -hw, qz0 = qz1 - q.depth, n = Math.max(2, Math.round(-q.land / 0.185)), rise = -q.land / n, L = n * 0.3;
    box(q.x0, -q.drop, qz0, q.x1, 0, qz1); box(q.x0, 0, qz0, q.sx - 2.1, 0.25, qz0 + 0.7); box(q.sx + 2.1, 0, qz0, q.x1, 0.25, qz0 + 0.7);
    for (let i = 0; i < n; i++) box(q.sx - 1.5, -q.drop, qz0 - (i + 1) * 0.3, q.sx + 1.5, -(i + 1) * rise, qz0 - i * 0.3);
    box(q.sx - 2.1, -q.drop, qz0 - L - 3, q.sx + 2.1, q.land, qz0 - L); for (const s of [-1, 1]) box(q.sx + s * 1.5, -q.drop, qz0 - L, q.sx + s * 2.1, 0.25, qz0); }
  return box.list;
}
