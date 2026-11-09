import { BARREL, BXR, CY, HX, RB, ROOF, flatc, glow, paint } from "../lib/buildkit.js";   // the shared building toolkit
import BK from "../lib/data/building-kit.json";   // textures and tints: scripts/lib/data/building-kit.yml
// ---- Valenfeld building kit (shared verbatim by scripts/gen/*): textures, boxes, lathes, roofs ----
const { fieldstone: FS, oak: OAK, plaster: PL, slate: SL, iron: IR, flagstone: FLAG, hay: HAY } = BK.textures;
const { stone: STONE, wood: WOOD, white: WHITE, iron: IRONC } = BK.tints;
// hexahedron: b0 b1 b2 b3 (bottom: x0z0 x1z0 x1z1 x0z1) then t0..t3 above them
const BX = BXR;
// box by centre and size, turned: roll (about z), then pitch (about x, + tips -z up), then yaw (about y), degrees
// lathe: prof [[r, h]…] swept round the y axis (or the x axis: h runs along +x), smooth sides
function LA(c, cx, y0, cz, prof, n = 12, caps = true, ax = "y", sm = true) {
  const P = (i, k) => { const a = (k % n) / n * Math.PI * 2, r = prof[i][0], h = prof[i][1];
    return ax === "x" ? [cx + h, y0 + r * Math.cos(a), cz + r * Math.sin(a)] : [cx + r * Math.cos(a), y0 + h, cz + r * Math.sin(a)]; };
  if (sm) c.smooth();
  for (let i = 0; i < prof.length - 1; i++) for (let k = 0; k < n; k++) c.quad(...P(i, k + 1), ...P(i, k), ...P(i + 1, k), ...P(i + 1, k + 1));
  c.flat();
  if (caps) { const l = prof.length - 1;
    const A = ax === "x" ? [cx + prof[l][1], y0, cz] : [cx, y0 + prof[l][1], cz], B = ax === "x" ? [cx + prof[0][1], y0, cz] : [cx, y0 + prof[0][1], cz];
    for (let k = 0; k < n; k++) { c.tri(...A, ...P(l, k + 1), ...P(l, k)); c.tri(...B, ...P(0, k), ...P(0, k + 1)); } }
}
// gable roof, ridge along x over z mid, eaves at z0/z1 at height ye, ridge yr, slab thickness t
function MERL(c, x0, z0, x1, z1, y, th, h = 0.9, w = 0.9, gap = 0.9) {
  for (let x = x0; x + w <= x1 + 1e-6; x += w + gap) { BX(c, x, y, z0, x + w, y + h, z0 + th); BX(c, x, y, z1 - th, x + w, y + h, z1); }
  for (let z = z0 + th + gap; z + w <= z1 - th + 1e-6; z += w + gap) { BX(c, x0, y, z, x0 + th, y + h, z + w); BX(c, x1 - th, y, z, x1, y + h, z + w); } }
function CB() { const L = []; const f = (x0, y0, z0, x1, y1, z1) => { L.push({ kind: "box", width: Math.abs(x1 - x0), height: Math.abs(y1 - y0), depth: Math.abs(z1 - z0), center: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2] }); }; f.list = L; return f; }
// ---- end kit ----
// STREET PROPS of Valenfeld, one script, params.kind picks: lamppost (lantern hangs toward local -z),
// barrel, crate (params.s size), hay, cart, stall (awning stripes params.a / params.b), bench,
// bed (2.0 x 1.0, long axis local x, headboard at -x; params.col = the wool blanket tint).
export function geometry(c) {
  const p = c.params, D = c.lod, k = p.kind === "box" ? "crate" : p.kind;   // dungeon loot rows ask for "box": it drew nothing (Nov 8, den saddlebag invisible)
  if (k === "barrel") BARREL(c, 0, 0, 0, 0.33, 0.9, D);
  else if (k === "crate") crate(c, p.s ?? 0.7, D, 0, 0, 0);
  else if (k === "hay") hay(c, D, 0, 0, 0, 0);
  else if (k === "bench") { paint(c, OAK, WOOD); BX(c, -0.8, 0.42, -0.17, 0.8, 0.49, 0.17); for (const s of [-1, 1]) BX(c, s * 0.66 - 0.04, 0, -0.15, s * 0.66 + 0.04, 0.42, 0.15); if (D <= 2) BX(c, -0.66, 0.15, -0.03, 0.66, 0.22, 0.03); }
  else if (k === "bed") bed(c, p.col ?? "#7a3a30", D);
  // ---- trade pieces (critic r1 hamlets: "no visible trade"): what a hamlet makes, out in its yard. Placed by the town dresser's trades table ----
  else if (k === "kiln") {   // a beehive charcoal/lime kiln: fieldstone dome, soot-black mouth, a stub flue
    paint(c, FS, "oklch(0.78 0.015 60)"); LA(c, 0, 0, 0, [[1.25, 0], [1.3, 0.6], [1.15, 1.3], [0.75, 1.9], [0.3, 2.2], [0.22, 2.25]], D <= 2 ? 14 : 8, true);
    flatc(c, "#141210"); c.roughness(1); BX(c, -0.38, 0, -1.33, 0.38, 0.75, -1.05);
    paint(c, FS, "oklch(0.45 0.01 60)"); CY(c, 0, 2.2, 0, 0.26, 0.55, 8);
    if (D <= 2) { flatc(c, "#1c1a18"); c.roughness(1); LA(c, 0, 1.55, 0, [[0.85, 0], [0.55, 0.5], [0.3, 0.7]], 10, false); for (let i = 0; i < 5; i++) { paint(c, OAK, WOOD); RB(c, 1.6 + (i % 2) * 0.1, 0.12 + Math.floor(i / 2) * 0.22, -0.6 + (i % 3) * 0.35, 0.18, 0.18, 1.1, 90, 0, 0); } } }
  else if (k === "millstones") {   // a pair of dressed millstones leaned on a sledge, flour sacks at their foot
    paint(c, FS, "oklch(0.86 0.01 80)"); LA(c, 0, 0.62, 0, [[0.62, -0.11], [0.62, 0.11]], D <= 2 ? 18 : 10, true, "x"); LA(c, 0.32, 0.62, 0.15, [[0.62, -0.11], [0.62, 0.11]], D <= 2 ? 18 : 10, true, "x");
    flatc(c, "#3a3632"); LA(c, -0.12, 0.62, 0, [[0.12, 0], [0.12, 0.02]], 8, true, "x");
    paint(c, OAK, WOOD); BX(c, -0.4, 0, -0.75, 0.75, 0.08, 0.75);
    if (D <= 2) { flatc(c, "#d8ccb0"); c.roughness(0.95); RB(c, 0.9, 0.3, -0.7, 0.42, 0.55, 0.32, 15); RB(c, 1.0, 0.27, -0.25, 0.4, 0.5, 0.3, -10); } }
  else if (k === "dipping-rack") {   // a chandler's rack: a beam on two trestles, pairs of tallow candles hung by their wicks, a wax pot under
    paint(c, OAK, WOOD); for (const x of [-1.1, 1.1]) { RB(c, x, 0.8, -0.3, 0.07, 1.65, 0.07, 0, 0, 12); RB(c, x, 0.8, 0.3, 0.07, 1.65, 0.07, 0, 0, -12); }
    BX(c, -1.25, 1.55, -0.05, 1.25, 1.65, 0.05);
    flatc(c, "#efe4c8"); c.roughness(0.5); if (D <= 2) for (let i = 0; i < 9; i++) { const x = -0.95 + i * 0.24; for (const z of [-0.06, 0.06]) BX(c, x - 0.022, 1.08 + (i % 3) * 0.04, z - 0.022, x + 0.022, 1.52, z + 0.022); }
    paint(c, IR, IRONC); LA(c, 0, 0, 0.75, [[0.28, 0], [0.32, 0.38], [0.3, 0.42]], 10, false); flatc(c, "#d9c58a"); LA(c, 0, 0.36, 0.75, [[0.29, 0], [0, 0]], 10, false); }
  else if (k === "polestack") {   // coppiced hazel poles stood in a cone to season, bound near the top
    paint(c, OAK, "oklch(0.82 0.04 70)"); const n = D <= 2 ? 14 : 7;
    for (let i = 0; i < n; i++) { const a = i / n * 360; RB(c, Math.sin(a * Math.PI / 180) * 0.55, 1.45, Math.cos(a * Math.PI / 180) * 0.55, 0.06, 2.9, 0.06, a, -11, 0); }
    if (D <= 2) { paint(c, HAY, "oklch(0.7 0.05 70)"); LA(c, 0, 2.3, 0, [[0.13, 0], [0.13, 0.12]], 8, true); } }
  else if (k === "drying-rack") {   // an herb-drier's A-frame rack, bunches hung head-down along three rails
    paint(c, OAK, WOOD); for (const x of [-1.0, 1.0]) { RB(c, x, 0.85, -0.35, 0.06, 1.8, 0.06, 0, 18, 0); RB(c, x, 0.85, 0.35, 0.06, 1.8, 0.06, 0, -18, 0); }
    for (const [y, z] of [[1.6, 0], [1.1, -0.18], [1.1, 0.18]]) BX(c, -1.05, y, z - 0.03, 1.05, y + 0.05, z + 0.03);
    if (D <= 2) { const C = ["#5f7a45", "#7a8a4a", "#8a6a8a", "#a89048"]; let j = 0; for (const [y, z] of [[1.6, 0], [1.1, -0.18], [1.1, 0.18]]) for (let x = -0.85; x <= 0.86; x += 0.28) { flatc(c, C[j++ % 4]); c.roughness(0.95); LA(c, x, y - 0.38, z, [[0.0, 0], [0.08, 0.12], [0.05, 0.36]], 6, true); } } }
  else if (k === "lamppost") {
    paint(c, FS, "oklch(0.9 0.012 80)"); BX(c, -0.26, -0.2, -0.26, 0.26, 0.35, 0.26);
    paint(c, OAK, WOOD); BX(c, -0.08, 0.35, -0.08, 0.08, 3.1, 0.08); BX(c, -0.05, 2.85, -0.9, 0.05, 2.97, 0.06); if (D <= 2) RB(c, 0, 2.6, -0.25, 0.06, 0.06, 0.62, 0, 45);
    paint(c, IR, IRONC); BX(c, -0.01, 2.6, -0.76, 0.01, 2.85, -0.74);
    BX(c, -0.15, 2.22, -0.9, 0.15, 2.27, -0.6); BX(c, -0.16, 2.55, -0.91, 0.16, 2.6, -0.59); LA(c, 0, 2.6, -0.75, [[0.17, 0], [0.03, 0.13]], 4, true);
    if (D <= 2) for (const [x, z] of [[-0.13, -0.88], [0.13, -0.88], [-0.13, -0.62], [0.13, -0.62]]) BX(c, x - 0.012, 2.27, z - 0.012, x + 0.012, 2.55, z + 0.012);
    glow(c, "#ffd9a0", [1.7, 0.95, 0.38]); BX(c, -0.11, 2.27, -0.86, 0.11, 2.55, -0.64);
  } else if (k === "cart") {
    paint(c, OAK, WOOD); BX(c, -0.65, 0.72, -1.2, 0.65, 0.82, 1.2);
    BX(c, -0.69, 0.82, -1.2, -0.62, 1.2, 1.2); BX(c, 0.62, 0.82, -1.2, 0.69, 1.2, 1.2); BX(c, -0.62, 0.82, 1.14, 0.62, 1.15, 1.2); BX(c, -0.62, 0.82, -1.2, 0.62, 1.0, -1.14);
    if (D <= 2) for (const z of [-1.0, 0, 1.0]) for (const s of [-1, 1]) BX(c, s * 0.7 - 0.03, 0.75, z - 0.05, s * 0.7 + 0.03, 1.25, z + 0.05);
    for (const s of [-1, 1]) RB(c, s * 0.5, 0.42, -2.1, 0.09, 0.09, 1.95, 0, -21);
    paint(c, IR, IRONC); LA(c, -0.9, 0.55, 0.15, [[0.05, 0], [0.05, 1.8]], 6, true, "x");
    for (const s of [-1, 1]) wheel(c, s * 0.8, 0.55, 0.15, 0.56, D);
    hay(c, D, -0.05, 0.82, -0.5, 8); hay(c, D, 0.05, 0.82, 0.55, -6); if (D <= 2) { flatc(c, "#b49a6a"); c.roughness(0.95); RB(c, 0.25, 1.5, 0.1, 0.45, 0.35, 0.3, 30); RB(c, -0.2, 1.45, -0.1, 0.4, 0.32, 0.3, -20); c.roughness(null); }
  } else if (k === "stall") {
    paint(c, OAK, WOOD);
    for (const x of [-1.44, 1.44]) { BX(c, x - 0.06, 0, -0.81, x + 0.06, 2.3, -0.69); BX(c, x - 0.06, 0, 0.69, x + 0.06, 2.75, 0.81); }
    paint(c, OAK, "oklch(0.9 0.03 65)"); BX(c, -1.55, 0.85, -0.9, 1.55, 0.92, -0.15); paint(c, OAK, WOOD); BX(c, -1.45, 0, -0.84, 1.45, 0.85, -0.76); BX(c, -1.45, 0.6, 0.2, 1.45, 0.66, 0.75);
    const A = p.a ?? "#a8452e", B = p.b ?? "#e6dcc4", n = 8;
    c.roughness(0.9);
    for (let i = 0; i < n; i++) { const x0 = -1.7 + i * 3.4 / n, x1 = x0 + 3.4 / n; flatc(c, i % 2 ? B : A);
      HX(c, [[x0, 2.25, -1.15], [x1, 2.25, -1.15], [x1, 2.75, 0.95], [x0, 2.75, 0.95], [x0, 2.28, -1.15], [x1, 2.28, -1.15], [x1, 2.78, 0.95], [x0, 2.78, 0.95]]);
      if (D <= 2) BX(c, x0 + 0.02, 2.05, -1.16, x1 - 0.02, 2.25, -1.13); }
    c.roughness(null);
    if (D <= 2) { const goods = p.goods ?? ["#a8452e", "#c9a45a", "#4f6b4a"];
      for (let j = 0; j < 3; j++) { const x = -0.95 + j * 0.95; flatc(c, "#8a6a40"); c.roughness(0.95); LA(c, x, 0.92, -0.5, [[0.2, 0], [0.26, 0.14]], 10, true); c.roughness(null);
        flatc(c, goods[j % goods.length]); for (let q = 0; q < 9; q++) { const a = c.random() * 6.28, r = c.random() * 0.17; RB(c, x + Math.cos(a) * r, 1.08 + c.random() * 0.05, -0.5 + Math.sin(a) * r, 0.085, 0.085, 0.085, c.random() * 90, c.random() * 40, 0); } }
      crate(c, 0.45, D, -0.9, 0.66, 0.45); crate(c, 0.45, D, 0.6, 0.66, 0.45); }
  }
}
function crate(c, s, D, x, y, z) {
  paint(c, OAK, "oklch(0.64 0.03 62)"); BX(c, x - s / 2, y, z - s / 2, x + s / 2, y + s, z + s / 2);
  if (D <= 2) { paint(c, OAK, WOOD); const e = s / 2 + 0.012, t = 0.06;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) BX(c, x + (sx > 0 ? s / 2 - t : -e), y, z + (sz > 0 ? s / 2 - t : -e), x + (sx > 0 ? e : -s / 2 + t), y + s, z + (sz > 0 ? e : -s / 2 + t));
    BX(c, x - e, y + s - t, z - e, x + e, y + s, z + e); BX(c, x - e, y, z - e, x + e, y + t, z + e);
    const ang = Math.atan2(s - 2 * t, s - 2 * t) * 180 / Math.PI, L = Math.hypot(s - 2 * t, s - 2 * t);
    RB(c, x, y + s / 2, z - e + 0.006, L, 0.07, 0.02, 0, 0, ang); RB(c, x, y + s / 2, z + e - 0.006, L, 0.07, 0.02, 0, 0, -ang); }
}
function hay(c, D, x, y, z, yaw) {
  paint(c, HAY, "oklch(0.68 0.035 80)"); RB(c, x, y + 0.25, z, 1.0, 0.5, 0.55, yaw);
  if (D <= 2) { flatc(c, "#6b5232"); for (const o of [-0.25, 0.25]) { const a = yaw * Math.PI / 180; RB(c, x + o * Math.cos(a), y + 0.25, z - o * Math.sin(a), 0.04, 0.52, 0.57, yaw); } }
}
function wheel(c, x, cy, cz, R, D) {
  const n = D <= 2 ? 16 : 8;
  paint(c, OAK, WOOD);
  for (let i = 0; i < n; i++) { const a0 = i / n * 6.2832, a1 = (i + 1) / n * 6.2832, P = (a, r) => [cy + Math.cos(a) * r, cz + Math.sin(a) * r];
    const [yi0, zi0] = P(a0, R - 0.08), [yi1, zi1] = P(a1, R - 0.08), [yo0, zo0] = P(a0, R), [yo1, zo1] = P(a1, R), xa = x - 0.05, xb = x + 0.05;
    HX(c, [[xa, yi0, zi0], [xb, yi0, zi0], [xb, yi1, zi1], [xa, yi1, zi1], [xa, yo0, zo0], [xb, yo0, zo0], [xb, yo1, zo1], [xa, yo1, zo1]]); }
  for (let i = 0; i < 4; i++) RB(c, x, cy, cz, 0.04, 2 * R - 0.1, 0.05, 0, i * 45);
  LA(c, x - 0.09, cy, cz, [[0.09, 0], [0.09, 0.18]], 8, true, "x");
}
function bed(c, col, D) {
  paint(c, OAK, WOOD); BX(c, -1.0, 0.18, -0.5, 1.0, 0.32, -0.44); BX(c, -1.0, 0.18, 0.44, 1.0, 0.32, 0.5); BX(c, -0.94, 0.28, -0.44, 0.94, 0.32, 0.44);
  for (const [x, h] of [[-0.96, 1.15], [0.96, 0.75]]) for (const z of [-0.47, 0.47]) BX(c, x - 0.05, 0, z - 0.05, x + 0.05, h, z + 0.05);
  BX(c, -0.98, 0.45, -0.44, -0.94, 1.02, 0.44); BX(c, 0.94, 0.4, -0.44, 0.98, 0.66, 0.44);
  if (D <= 2) { BX(c, -0.99, 1.02, -0.47, -0.93, 1.08, 0.47); BX(c, 0.93, 0.66, -0.47, 0.99, 0.71, 0.47); for (const z of [-0.2, 0, 0.2]) BX(c, -0.97, 0.45, z - 0.04, -0.95, 1.02, z + 0.04);
    for (const [x, h] of [[-0.96, 1.15], [0.96, 0.75]]) for (const z of [-0.47, 0.47]) LA(c, x, h, z, [[0.055, 0], [0.03, 0.05], [0.001, 0.08]], 6, false); }
  paint(c, HAY, "oklch(0.92 0.03 85)"); BX(c, -0.92, 0.32, -0.43, 0.92, 0.5, 0.43);
  flatc(c, col); c.roughness(0.95); BX(c, -0.4, 0.5, -0.46, 0.92, 0.55, 0.46); BX(c, -0.4, 0.3, -0.46, 0.92, 0.5, -0.44); BX(c, -0.4, 0.3, 0.44, 0.92, 0.5, 0.46); BX(c, 0.9, 0.3, -0.46, 0.94, 0.55, 0.46);
  if (D <= 2) { flatc(c, "#d8cdb4"); BX(c, -0.48, 0.5, -0.46, -0.38, 0.565, 0.46); }
  flatc(c, "#e2dac6"); if (D <= 2) LA(c, -0.72, 0.56, 0, [[0.11, 0], [0.13, 0.17], [0.11, 0.34]], 8, true, "z", true); else BX(c, -0.84, 0.5, -0.34, -0.6, 0.6, 0.34);
  c.roughness(null);
}
export function collider(c) {
  const p = c.params, k = p.kind, b = CB();
  if (k === "barrel") return [{ kind: "cylinder", radiusTop: 0.31, radiusBottom: 0.31, height: 0.9, center: [0, 0.45, 0] }];
  if (k === "crate") { const s = p.s ?? 0.7; b(-s / 2, 0, -s / 2, s / 2, s, s / 2); }
  if (k === "hay") b(-0.5, 0, -0.28, 0.5, 0.5, 0.28);
  if (k === "bed") { b(-1.0, 0, -0.5, 1.0, 0.55, 0.5); b(-1.0, 0.55, -0.5, -0.9, 1.15, 0.5); }
  if (k === "bench") b(-0.8, 0, -0.17, 0.8, 0.49, 0.17);
  if (k === "lamppost") { b(-0.26, -0.2, -0.26, 0.26, 0.35, 0.26); b(-0.08, 0.35, -0.08, 0.08, 3.1, 0.08); }
  if (k === "cart") b(-0.86, 0, -1.25, 0.86, 1.3, 1.25);
  if (k === "stall") { b(-1.55, 0, -0.9, 1.55, 0.92, -0.15); b(-1.5, 0, 0.69, 1.5, 0.75, 0.81); }
  if (k === "kiln") b(-1.2, 0, -1.2, 1.2, 1.9, 1.2);
  if (k === "millstones") b(-0.4, 0, -0.75, 0.75, 1.24, 0.75);
  if (k === "dipping-rack") b(-1.25, 0, -0.4, 1.25, 1.65, 0.4);
  if (k === "polestack") b(-0.6, 0, -0.6, 0.6, 2.5, 0.6);
  if (k === "drying-rack") b(-1.05, 0, -0.45, 1.05, 1.7, 0.45);
  return b.list;
}
