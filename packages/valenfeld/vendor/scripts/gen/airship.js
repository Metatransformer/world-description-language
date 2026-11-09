// THE TRAVEL COMPANY SKY-GALLEON, forward -z, feet at the keel. A 42 m gored canvas envelope on brass hoops
// rides over a carved oak sailing hull: bowsprit and gilded figurehead, sterncastle with lit gallery windows,
// fanned sail-wings on both beams, engine pods, red fins, pennants. params.part = "prop": the great stern
// screw alone (a spinning child), centred on its hub.
import { paint, glow, flatc, BX, RB, LA, SEG, PIPE, PATH, ROPE, TORUS, LOFT, CANVAS, OAK, IR, WOOD, IRONC } from "../lib/buildkit.js";
const RED = "oklch(0.47 0.17 27)", GOLD = "oklch(0.78 0.13 82)", IVORY = "oklch(0.985 0.02 90)", CREAM = "oklch(0.95 0.035 80)",
  TARHULL = "oklch(0.36 0.04 45)", OAKUP = "oklch(0.6 0.07 55)", DECK = "oklch(0.7 0.06 70)", WIN = [1.7, 1.15, 0.5];
const ZB = -9, ZS = 8, DY = 1.25;   // bow tip, stern transom, deck height
export function propeller(c, R, blades, n) {
  paint(c, IR, GOLD); LA(c, 0, 0, 0, [[0.05, -0.55], [0.32, -0.35], [0.42, 0], [0.3, 0.3], [0.05, 0.42]], n, true, "z");
  paint(c, OAK, OAKUP);
  for (let i = 0; i < blades; i++) { const a = i / blades * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a);
    const P = (r, w, tw) => [ca * r - sa * w, sa * r + ca * w, tw];
    const root = 0.3, rows = [[P(root, -0.18, 0.12), P(root, 0.18, -0.12)], [P(R * 0.45, -0.42, 0.22), P(R * 0.45, 0.32, -0.2)], [P(R * 0.85, -0.36, 0.14), P(R * 0.85, 0.26, -0.12)], [P(R, -0.05, 0.02), P(R, 0.06, -0.02)]];
    LOFT(c, rows);
    paint(c, IR, GOLD); const t0 = rows[2], t1 = rows[3]; LOFT(c, [t0, t1]); paint(c, OAK, OAKUP); }
}
function hullAt(u) {   // u 0 bow → 1 stern: half-beam, keel y, gunwale y
  const b = 2.5 * (u < 0.36 ? Math.pow(Math.sin(u / 0.36 * Math.PI / 2), 0.75) : 1 - 0.32 * Math.pow((u - 0.36) / 0.64, 2));
  const yk = (u < 0.3 ? 0.9 * Math.pow(1 - u / 0.3, 2) : 0) + (u > 0.8 ? 0.5 * Math.pow((u - 0.8) / 0.2, 2) : 0);
  const yg = 2.2 + (u < 0.4 ? 1.1 * Math.pow(1 - u / 0.4, 2) : 0) + (u > 0.72 ? 0.7 * Math.pow((u - 0.72) / 0.28, 2) : 0);
  return { b: Math.max(0.02, b), yk, yg };
}
const hp = (u, a) => { const h = hullAt(u); return [h.b * Math.sin(a), h.yk + (h.yg - h.yk) * (1 - Math.cos(a)), ZB + (ZS - ZB) * u]; };
function hullBand(c, a0, a1, S, K) { const rows = [];
  for (let i = 0; i <= S; i++) { const u = i / S, row = []; for (let k = 0; k <= K; k++) row.push(hp(u, a0 + (a1 - a0) * k / K)); rows.push(row); }
  c.smooth(); LOFT(c, rows); c.flat(); }
export function geometry(c) {
  const D = c.lod;
  if (c.params?.part === "prop") { propeller(c, 2.7, 4, D <= 2 ? 14 : 8); return; }
  if (D >= 4) {   // far: the outline only, envelope, hull, wings, fins
    paint(c, null, "oklch(0.93 0.03 85)"); LA(c, 0, 11.0, 0, [[0.3, -17], [3.9, -13], [5.0, -4], [4.7, 4], [2.6, 13], [0.2, 17]], 8, true, "z");
    paint(c, null, RED); LA(c, 0, 11.0, 0, [[5.06, -3.4], [5.06, 1.7]], 8, false, "z");
    for (const [fx, fy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) c.quad(fx * 3.9, 11.3 + fy * 3.9, 9.4, fx * 8.4, 11.3 + fy * 8.4, 14, fx * 5.8, 11.3 + fy * 5.8, 17.6, fx * 1.8, 11.3 + fy * 1.8, 17.5);
    paint(c, OAK, OAKUP); hullBand(c, Math.PI / 2, -Math.PI / 2, 6, 3); BX(c, -1.9, DY, 3.4, 1.9, 3.7, 7.8);
    paint(c, CANVAS, CREAM); for (const s of [-1, 1]) c.tri(s * 2.3, 2.2, -0.6, s * 11.4, 3.8, -2.6, s * 6.5, 1.6, 4.4);
    return; }
  const S = D <= 2 ? 22 : 10, K = D <= 2 ? 5 : 2;
  // ---- the hull: tarred bottom, red-and-gold wale, oak topsides ----
  paint(c, OAK, TARHULL); hullBand(c, 1.12, -1.12, S, K * 3);
  for (const s of [1, -1]) {
    paint(c, OAK, RED); hullBand(c, s * 1.12, s * 1.3, S, 1);
    paint(c, OAK, OAKUP); hullBand(c, s * 1.3, s * Math.PI / 2, S, K);
  }
  // transom, carved and gilded at the edge
  paint(c, OAK, OAKUP); { const ring = []; for (let k = 0; k <= 12; k++) ring.push(hp(1, -Math.PI / 2 + Math.PI * k / 12)); const h = hullAt(1), m = [0, (h.yk + h.yg) / 2, ZS];
    for (let k = 0; k < 12; k++) c.tri(...m, ...ring[k], ...ring[k + 1]);
    if (D <= 2) { paint(c, IR, GOLD); PATH(c, ring, 0.07, 5); } }
  // deck planking, where the hull passes deck height
  paint(c, OAK, DECK); { const L = [], R = [];
    for (let i = 0; i <= S; i++) { const u = i / S, h = hullAt(u); if (DY <= h.yk + 0.05) continue; const a = Math.acos(Math.max(-1, 1 - (DY - h.yk) / (h.yg - h.yk))); const x = h.b * Math.sin(a) * 0.97, z = ZB + (ZS - ZB) * u; L.push([-x, DY, z]); R.push([x, DY, z]); }
    for (let i = 0; i < L.length - 1; i++) c.quad(...L[i], ...L[i + 1], ...R[i + 1], ...R[i]); }
  // rail caps along both gunwales, gilded wale strake
  for (const s of [-1, 1]) { const g = [], w = []; for (let i = 0; i <= S; i++) { g.push(hp(i / S, s * Math.PI / 2)); w.push(hp(i / S, s * 1.21).map((v, j) => j === 0 ? v * 1.012 : v)); }
    paint(c, OAK, "oklch(0.45 0.06 45)"); PATH(c, g, 0.09, 5);
    if (D <= 2) { paint(c, IR, GOLD); PATH(c, w, 0.05, 4);
      // gunport lanterns of the cabin deck, a row of little lit windows under the rail
      for (let i = 4; i < S - 3; i += 2) { const p = hp(i / S, s * 1.42); glow(c, "oklch(0.9 0.12 75)", WIN); RB(c, p[0] * 1.01, p[1], p[2], 0.06, 0.32, 0.42, 0); } } }
  // ---- sterncastle: a carved cabin with a gallery of lit windows ----
  paint(c, OAK, OAKUP); BX(c, -1.85, DY, 3.4, 1.85, 3.55, 7.6);
  paint(c, OAK, "oklch(0.42 0.06 40)"); BX(c, -2.05, 3.55, 3.2, 2.05, 3.75, 7.9);
  paint(c, OAK, RED); BX(c, -2.07, 3.2, 3.2, 2.07, 3.55, 7.92);
  glow(c, "oklch(0.9 0.12 75)", WIN);
  for (const z of [4.1, 5.1, 6.1, 7.0]) for (const s of [-1, 1]) BX(c, s * 1.86 - 0.03, 2.0, z - 0.3, s * 1.86 + 0.03, 2.9, z + 0.3);
  for (const x of [-1.3, -0.45, 0.45, 1.3]) BX(c, x - 0.3, 1.9, 7.6, x + 0.3, 2.95, 7.66);
  if (D <= 2) { paint(c, IR, GOLD); for (const x of [-1.75, -0.88, 0, 0.88, 1.75]) BX(c, x - 0.05, 1.8, 7.6, x + 0.05, 3.15, 7.72);
    // stern gallery balcony
    paint(c, OAK, "oklch(0.45 0.06 45)"); BX(c, -2.0, 1.7, 7.6, 2.0, 1.82, 8.5); PATH(c, [[-2, 2.6, 7.6], [-2, 2.6, 8.5], [2, 2.6, 8.5], [2, 2.6, 7.6]], 0.05, 4);
    for (let x = -2; x <= 2.01; x += 0.5) SEG(c, [x, 1.82, 8.5], [x, 2.6, 8.5], 0.05, 0.05);
    // the roof deck rail
    for (const s of [-1, 1]) PATH(c, [[s * 2.0, 4.45, 3.2], [s * 2.0, 4.45, 7.9]], 0.04, 4);
    for (let z = 3.3; z <= 7.9; z += 0.6) for (const s of [-1, 1]) SEG(c, [s * 2.0, 3.75, z], [s * 2.0, 4.45, z], 0.05, 0.05);
    // the wheel on the roof deck
    paint(c, OAK, OAKUP); TORUS(c, 0, 4.75, 3.7, 0.55, 0.05, 14, 5, "z"); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; SEG(c, [0, 4.75, 3.7], [Math.cos(a) * 0.7, 4.75 + Math.sin(a) * 0.7, 3.7], 0.05, 0.05); }
    SEG(c, [0, 3.75, 3.8], [0, 4.75, 3.8], 0.2, 0.2); }
  // ---- bowsprit, figurehead, jib ----
  const bowTip = hp(0, 0); bowTip[1] = hullAt(0).yg - 0.2;
  paint(c, OAK, "oklch(0.45 0.06 45)"); PIPE(c, [0, bowTip[1] - 0.3, ZB + 0.8], [0, bowTip[1] + 1.6, ZB - 5.2], 0.2, 0.08, 8);
  paint(c, IR, GOLD);   // a gilded winged woman leaning into the wind
  PIPE(c, [0, bowTip[1] - 0.4, ZB + 0.3], [0, bowTip[1] + 0.5, ZB - 0.9], 0.22, 0.12, 8);
  LA(c, 0, bowTip[1] + 0.62, ZB - 1.0, [[0.01, -0.16], [0.13, -0.08], [0.15, 0.02], [0.1, 0.12], [0.01, 0.16]], 8, true, "y");
  for (const s of [-1, 1]) { const r = [s * 0.12, bowTip[1] + 0.3, ZB - 0.6]; c.tri(...r, s * 1.1, bowTip[1] + 1.3, ZB + 0.2, s * 0.7, bowTip[1] - 0.2, ZB + 0.5); c.tri(...r, s * 0.7, bowTip[1] - 0.2, ZB + 0.5, s * 0.2, bowTip[1] - 0.5, ZB - 0.2); }
  paint(c, CANVAS, IVORY); c.tri(0, bowTip[1] + 1.5, ZB - 5.0, 0, 9.3, -1.2, 0, DY + 0.4, ZB + 1.6);
  // ---- foremast with a square sail bellied by the wind, and a crow's nest ----
  paint(c, OAK, "oklch(0.45 0.06 45)"); PIPE(c, [0, DY, -4.6], [0, 5.3, -4.6], 0.16, 0.11, 8);
  for (const [y, w] of [[4.7, 2.0], [2.6, 2.5]]) PIPE(c, [-w, y, -4.75], [w, y, -4.75], 0.07, 0.07, 5);
  paint(c, CANVAS, IVORY); { const rows = []; for (let i = 0; i <= 4; i++) { const v = i / 4, y = 4.65 - v * 2.0, w = 2.0 + 0.5 * v, row = []; for (let k = 0; k <= 6; k++) { const u = k / 6 * 2 - 1; row.push([u * w, y, -4.85 - 0.55 * (1 - u * u) * Math.sin(Math.PI * (0.15 + 0.7 * v))]); } rows.push(row); } c.smooth(); LOFT(c, rows); c.flat(); }
  paint(c, CANVAS, RED); { const y0 = 3.9, y1 = 3.35; c.quad(-2.2, y0, -5.32, 2.2, y0, -5.32, 2.3, y1, -5.34, -2.3, y1, -5.34); }
  if (D <= 2) { paint(c, OAK, OAKUP); LA(c, 0, 5.0, -4.6, [[0.5, 0], [0.55, 0.45]], 10, false); }
  // ---- short ribbed sail-fins on each beam, raked aft like a flying fish's (creator Nov 4: "make the airship actually look good": the long kite wings read as cardboard) ----
  for (const s of [-1, 1]) {
    const root = [s * 2.35, 2.4, -1.4], tips = [[s * 6.6, 4.4, -3.4], [s * 7.6, 3.4, -0.6], [s * 6.9, 2.5, 2.0], [s * 4.6, 2.1, 3.4]];
    for (let i = 0; i < tips.length - 1; i++) { const a = tips[i], b = tips[i + 1], m = [(a[0] + b[0]) / 2 * 0.95, (a[1] + b[1]) / 2 - 0.15, (a[2] + b[2]) / 2];
      paint(c, CANVAS, i % 2 ? CREAM : IVORY); c.tri(...root, ...a, ...m); c.tri(...root, ...m, ...b); }
    paint(c, OAK, "oklch(0.42 0.06 45)"); for (const t2 of tips) PIPE(c, root, t2, 0.1, 0.035, 6);
    if (D <= 2) { paint(c, IR, GOLD); PATH(c, tips, 0.03, 4); TORUS(c, ...root, 0.28, 0.07, 10, 5, "x"); }
  }
  // ---- the envelope: a smooth teardrop of 12 ivory gores, blunt nose, long tapered tail; seams are faint, three brass bands hold it ----
  const Y = 11.0, L = 17, R = 5.0, m = D <= 2 ? 30 : 14, n = 12, sub = D <= 2 ? 4 : 2;
  const rAt = (t) => R * Math.max(0.02, t < 0 ? Math.pow(Math.max(0, 1 - Math.pow(-t / 1, 2.6)), 0.5) : Math.pow(Math.max(0, 1 - Math.pow(t, 1.5)), 0.62));
  const EP = (t, a, k = 1) => [rAt(t) * Math.cos(a) * k, Y + rAt(t) * Math.sin(a) * k * 0.94, t * L];
  for (let g = 0; g < n; g++) { paint(c, null, g % 2 ? "oklch(0.93 0.03 85)" : "oklch(0.89 0.035 82)"); /* plain doped silk: the canvas grain read as sand at this size */ const rows = [];
    for (let i = 0; i <= m; i++) { const t2 = -1 + 2 * i / m, row = []; for (let k = 0; k <= sub; k++) row.push(EP(t2, (g + k / sub) / n * Math.PI * 2)); rows.push(row); }
    c.smooth(); LOFT(c, rows); c.flat(); }
  // a deep red belly band with gold edging where the company's name would be painted
  paint(c, null, RED); { const rows = []; for (let i = 0; i <= 6; i++) { const t2 = -0.2 + 0.3 * i / 6, row = []; for (let k = 0; k <= 32; k++) row.push(EP(t2, k / 32 * Math.PI * 2, 1.008)); rows.push(row); } c.smooth(); LOFT(c, rows); c.flat(); }
  paint(c, IR, GOLD);
  for (const t2 of [-0.2, 0.1]) PATH(c, Array.from({ length: 33 }, (_, k) => EP(t2, k / 32 * Math.PI * 2, 1.012)), 0.09, 4);
  for (const t2 of D <= 2 ? [-0.6, 0.45] : []) { const pts = []; for (let k = 0; k <= 32; k++) pts.push(EP(t2, k / 32 * Math.PI * 2, 1.008)); PATH(c, pts, 0.08, 5); }
  LA(c, 0, Y, -L, [[0.02, -0.35], [0.5, 0.05], [0.75, 0.5]], 14, true, "z");   // brass nose cap
  if (D <= 2) for (let g = 0; g < n; g += 2) { const pts = []; for (let i = 2; i < m - 1; i++) pts.push(EP(-1 + 2 * i / m, g / n * Math.PI * 2, 1.004)); paint(c, null, "oklch(0.8 0.03 75)"); PATH(c, pts, 0.02, 3); }
  // ---- tail: four swept fins, ivory with a hinged red rudder on each trailing edge, framed in dark oak ----
  for (const [fx, fy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
    const P = (t2, out) => { const r = rAt(t2) * 0.94 + out; return [fx * r, Y + fy * r, t2 * L]; };
    const big = fy === -1 ? 0.65 : 1, a = P(0.5, 0), b = P(0.8, 4.4 * big), cc = P(0.9, 4.4 * big), d = P(0.92, 0), rb = P(0.98, 3.6 * big), rd = P(0.99, 0.2);
    paint(c, null, "oklch(0.93 0.03 85)"); c.quad(...a, ...b, ...cc, ...d); c.quad(...d, ...cc, ...b, ...a);
    paint(c, null, RED); c.quad(...d, ...cc, ...rb, ...rd); c.quad(...rd, ...rb, ...cc, ...d);
    paint(c, OAK, "oklch(0.36 0.05 45)"); PATH(c, [a, b, cc, rb, rd], 0.08, 5); SEG(c, d, cc, 0.05, 0.05);
    if (D <= 2) { paint(c, IR, GOLD); SEG(c, P(0.65, 0), P(0.84, 4.3 * big), 0.04, 0.04); }
    if (fy === 1) { const tip = cc; for (let i = 0; i < 4; i++) { paint(c, CANVAS, i % 2 ? GOLD : RED); const z0 = tip[2] + 1 + i * 1.8, sw = Math.sin(i * 1.3) * 0.3;
      c.quad(sw, tip[1] - 0.05 * i, z0, sw, tip[1] - 0.5 + 0.1 * i, z0, Math.sin((i + 1) * 1.3) * 0.3, tip[1] - 0.4 + 0.1 * (i + 1), z0 + 1.8, Math.sin((i + 1) * 1.3) * 0.3, tip[1] - 0.05 * (i + 1), z0 + 1.8); } }
  }
  // ---- load lines: a fan of cables from the envelope's flank down to every rail, the hull hangs, it doesn't float ----
  paint(c, OAK, "oklch(0.3 0.03 45)");
  for (let z = -7; z <= 7; z += 1.75) { const u = (z - ZB) / (ZS - ZB); if (u < 0.02 || u > 0.98) continue; for (const s of [-1, 1]) { const g = hp(u, s * Math.PI / 2), top = EP(z / L * 0.95, s > 0 ? -0.55 : Math.PI + 0.55, 1.0); SEG(c, [g[0], g[1] + 0.05, g[2]], top, 0.025, 0.025); } }
  // ---- the keel-walk under the envelope, struts and rigging down to the rails ----
  const KY = Y - R - 0.35;
  paint(c, OAK, "oklch(0.45 0.06 45)"); BX(c, -0.6, KY - 0.25, -12, 0.6, KY, 12);
  if (D <= 2) { for (let z = -11; z <= 11; z += 3) for (const s of [-1, 1]) SEG(c, [s * 0.55, KY, z], [s * rAt(z / L) * 0.42, Y - rAt(z / L) * 0.9, z], 0.08, 0.08);
    for (const z of [-7, -3.5, 0, 3.5, 6.5]) { const u = (z - ZB) / (ZS - ZB); for (const s of [-1, 1]) { const g = hp(u, s * Math.PI / 2); ROPE(c, g, [s * 0.6, KY - 0.2, z * 1.15], 0.2, 0.03, 4); ROPE(c, g, [s * rAt(z * 1.3 / L) * 0.75, Y - rAt(z * 1.3 / L) * 0.66, z * 1.3], 0.35, 0.03, 4); } } }
  paint(c, OAK, "oklch(0.45 0.06 45)"); for (const z of [-5.5, 0.5, 5.5]) for (const s of [-1, 1]) { const u = (z - ZB) / (ZS - ZB), g = hp(u, s * Math.PI / 2); PIPE(c, g, [s * 0.5, KY - 0.2, z], 0.08, 0.06, 5); }
  // ---- two engine pods slung off the envelope's flanks, brass screws turning aft ----
  for (const s of [-1, 1]) { const px = s * (R * 0.82 + 1.6), py = Y - R * 0.55, pz = 3.5;
    paint(c, OAK, OAKUP); LA(c, px, py, pz, [[0.05, -2.4], [0.7, -1.7], [0.9, 0], [0.75, 1.6], [0.35, 2.2]], D <= 2 ? 12 : 8, true, "z");
    paint(c, IR, GOLD); TORUS(c, px, py, pz - 1.2, 0.84, 0.06, 14, 4, "z"); TORUS(c, px, py, pz + 1.0, 0.86, 0.06, 14, 4, "z");
    paint(c, IR, IRONC); SEG(c, [px, py + 0.5, pz], [s * R * 0.7, Y - R * 0.4, pz], 0.14, 0.14); SEG(c, [px, py + 0.4, pz - 1.4], [s * R * 0.72, Y - R * 0.45, pz - 2.2], 0.1, 0.1);
    const Pz = pz + 2.35;
    paint(c, IR, GOLD); for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI * 2 + 0.4; RB(c, px + Math.cos(a) * 0.65, py + Math.sin(a) * 0.65, Pz, 0.22, 1.3, 0.05, 0, 0, a * 180 / Math.PI - 90); }
    glow(c, "oklch(0.9 0.12 75)", WIN); BX(c, px - 0.12, py - 0.12, pz - 2.5, px + 0.12, py + 0.12, pz - 2.35); }
  // ---- the great stern screw's shaft and bearing; the screw is the spinning child ----
  paint(c, IR, IRONC); PIPE(c, [0, 1.75, ZS - 0.2], [0, 1.75, ZS + 1.5], 0.16, 0.16, 8);
  paint(c, IR, GOLD); TORUS(c, 0, 1.75, ZS + 0.3, 0.3, 0.08, 12, 5, "z");
  // ---- lanterns: bow, stern, keel-walk ----
  glow(c, "oklch(0.92 0.12 75)", [2.2, 1.5, 0.6]);
  BX(c, -0.16, bowTip[1] + 1.2, ZB - 4.6, 0.16, bowTip[1] + 1.55, ZB - 4.3); BX(c, -2.2, 3.8, 7.8, -1.9, 4.2, 8.1); BX(c, 1.9, 3.8, 7.8, 2.2, 4.2, 8.1);
  BX(c, -0.18, KY - 0.65, -12.4, 0.18, KY - 0.25, -12.0); BX(c, -0.18, KY - 0.65, 12.0, 0.18, KY - 0.25, 12.4);
  // company flag at the stern staff
  paint(c, OAK, "oklch(0.45 0.06 45)"); PIPE(c, [0, 3.75, 7.7], [0, 6.4, 8.9], 0.05, 0.04, 5);
  paint(c, CANVAS, RED); c.quad(0, 6.3, 8.85, 0, 5.3, 8.4, 0.15, 5.5, 10.3, 0.2, 6.3, 10.6);
}
