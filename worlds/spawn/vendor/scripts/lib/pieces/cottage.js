// COTTAGE ARCHITECTURE: the parts every Valenfeld-style house is composed from, one function a part.
// A house generator calls them in order: plinth → storey → timberFrame → windows → door → roof → porch → chimney.
// Frame: the house's own metres, front faces -z, x across. Every part takes c (the geometry ctx) and one options object.
// Materials come from the building kit (scripts/lib/data/building-kit.yml via buildkit.js).
import { BXR as BX, HX, LA, CY, RB, paint, flatc, glow, FS, OAK, PL, SL, IR, STONE, WOOD, WHITE, IRONC } from "../buildkit.js";
export const FOOT = 2.5;   // metres a plinth runs below the feet (creator Nov 4: no daylight under a house on a slope)

// a fieldstone ground storey that runs FOOT m into the slope
export function plinth(c, { hw, hd, top }) { paint(c, FS, STONE); BX(c, -hw, -FOOT, -hd, hw, top, hd); }
// a lime-plaster storey box (jettied out when ex/ez > the plinth)
export function storey(c, { ex, ez, y0, y1 }) { paint(c, PL, WHITE); BX(c, -ex, y0, -ez, ex, y1, ez); }
// oak framing over a storey: rails, posts per bay, corner and mid posts, braces (lod ≤ 2) and jetty joist ends
export function timberFrame(c, { ex, ez, hd, y0, y1, bays, lod, joists }) {
  if (lod > 3) return;
  const np = bays, bay = (i) => -ex + 2 * ex * (i + 0.5) / np, o = 0.05;
  paint(c, OAK, WOOD);
  BX(c, -ex - o, y0, -ez - o, ex + o, y0 + 0.2, ez + o); BX(c, -ex - o, y1 - 0.2, -ez - o, ex + o, y1, ez + o);
  for (let i = 0; i <= np; i++) { const x = -ex + 2 * ex * i / np; BX(c, x - 0.1, y0, -ez - o, x + 0.1, y1, -ez + 0.02); BX(c, x - 0.1, y0, ez - 0.02, x + 0.1, y1, ez + o); }
  for (const z of [-ez + 0.1, 0, ez - 0.1]) { BX(c, -ex - o, y0, z - 0.1, -ex + 0.02, y1, z + 0.1); BX(c, ex - 0.02, y0, z - 0.1, ex + o, y1, z + 0.1); }
  if (lod <= 2) { const bw = 2 * ex / np, bh = y1 - y0 - 0.4, len = Math.hypot(bw, bh) - 0.15, ang = Math.atan2(bh, bw) * 180 / Math.PI, yc = (y0 + y1) / 2;
    for (const zf of [-ez - 0.02, ez + 0.02]) { RB(c, bay(0), yc, zf, len, 0.13, 0.06, 0, 0, -ang); RB(c, bay(np - 1), yc, zf, len, 0.13, 0.06, 0, 0, ang); }
    if (joists) for (let x = -ex + 0.2; x <= ex - 0.1; x += 0.6) BX(c, x - 0.07, y0 - 0.02, -ez - 0.03, x + 0.07, y0 + 0.15, -hd + 0.01); }
}
// a glowing casement in a wall at zf (s = -1 front, +1 back): mullion, transom, sill, two shutters, an optional flower box
export function casement(c, { x, y0, y1, zf, s, lod, glass, glowRGB, shut, box, boxCol, flowers }) {
  glow(c, glass, glowRGB); BX(c, x - 0.38, y0, zf - 0.03 * s, x + 0.38, y1, zf + 0.03 * s);
  if (lod > 2) return;
  paint(c, OAK, WOOD); BX(c, x - 0.035, y0, zf + 0.02 * s, x + 0.035, y1, zf + 0.06 * s); BX(c, x - 0.38, (y0 + y1) / 2 - 0.035, zf + 0.02 * s, x + 0.38, (y0 + y1) / 2 + 0.035, zf + 0.06 * s);
  BX(c, x - 0.48, y0 - 0.08, zf, x + 0.48, y0, zf + 0.1 * s);
  flatc(c, shut); BX(c, x - 0.8, y0, zf + 0.04 * s, x - 0.42, y1, zf + 0.09 * s); BX(c, x + 0.42, y0, zf + 0.04 * s, x + 0.8, y1, zf + 0.09 * s);
  if (box) flowerBox(c, { x, y0, zf, s, boxCol, flowers });
}
// a planted window box under a sill
export function flowerBox(c, { x, y0, zf, s, boxCol, flowers }) {
  paint(c, OAK, WOOD); BX(c, x - 0.5, y0 - 0.32, zf + 0.02 * s, x + 0.5, y0 - 0.1, zf + 0.3 * s);
  flatc(c, boxCol); BX(c, x - 0.47, y0 - 0.1, zf + 0.05 * s, x + 0.47, y0 - 0.04, zf + 0.27 * s);
  for (let k = 0; k < 9; k++) { flatc(c, flowers[Math.floor(c.random() * flowers.length)]); const fx = x - 0.42 + k * 0.105, fz = zf + (0.1 + c.random() * 0.13) * s; RB(c, fx, y0 - 0.0 + c.random() * 0.06, fz, 0.07, 0.07, 0.07, c.random() * 90, 30, 20); }
}
// a closed plank door in the front wall at z = -hd: oak frame, leaf, iron straps and ring (lod ≤ 2), a stone step
export function plankDoor(c, { x, hd, lod, doorCol, stepCol }) {
  paint(c, OAK, WOOD); BX(c, x - 0.72, 0, -hd - 0.1, x - 0.6, 2.35, -hd + 0.02); BX(c, x + 0.6, 0, -hd - 0.1, x + 0.72, 2.35, -hd + 0.02); BX(c, x - 0.78, 2.3, -hd - 0.12, x + 0.78, 2.5, -hd + 0.02);
  paint(c, OAK, doorCol); BX(c, x - 0.6, 0, -hd - 0.05, x + 0.6, 2.3, -hd + 0.02);
  if (lod <= 2) { paint(c, IR, IRONC); for (const y of [0.4, 1.9]) BX(c, x - 0.55, y, -hd - 0.08, x + 0.45, y + 0.08, -hd - 0.04); LA(c, x + 0.35, 1.05, -hd - 0.09, [[0.06, 0], [0.06, 0.015]], 8, true, "y"); }
  paint(c, FS, stepCol); BX(c, x - 0.85, -0.2, -hd - 0.55, x + 0.85, 0.14, -hd);
}
export const ROOF_SHAPES = ["gable", "hip", "steep", "saltbox"];
// the ridge height a roof shape rises to over walls topping at y with half-depth ez
export function ridgeOf(shape, y, ez) { return shape === "steep" ? y + ez * 1.35 : y + ez * 0.9; }
// a slate roof along x over walls ex × ez topping at y: gable | hip | steep | saltbox, plaster gable ends and oak bargeboards
export function cottageRoof(c, { shape, ex, ez, y, lod, roofTex, roofCol }) {
  const ry = ridgeOf(shape, y, ez), zr = shape === "saltbox" ? -ez * 0.35 : 0, X0 = -ex - 0.45, X1 = ex + 0.45, Z0 = -ez - 0.6, Z1 = ez + 0.6, ye = y - 0.1, t = 0.2;
  paint(c, roofTex ?? SL, roofCol);
  if (shape === "hip") { const ri = Math.min(ez + 0.6, ex * 0.8), xa = X0 + ri, xb = X1 - ri;
    HX(c, [[X0, ye, Z0], [X1, ye, Z0], [xb, ry, 0], [xa, ry, 0], [X0, ye + t, Z0], [X1, ye + t, Z0], [xb, ry + t, 0], [xa, ry + t, 0]]);
    HX(c, [[xa, ry, 0], [xb, ry, 0], [X1, ye, Z1], [X0, ye, Z1], [xa, ry + t, 0], [xb, ry + t, 0], [X1, ye + t, Z1], [X0, ye + t, Z1]]);
    for (const [xe, xi] of [[X0, xa], [X1, xb]]) { c.tri(xe, ye + t, Z0, xe, ye + t, Z1, xi, ry + t, 0); c.tri(xe, ye + t, Z1, xe, ye + t, Z0, xi, ry + t, 0); }
    BX(c, xa, ry + 0.1, -0.16, xb, ry + 0.3, 0.16);
  } else {
    const zm = zr;
    HX(c, [[X0, ye, Z0], [X1, ye, Z0], [X1, ry, zm], [X0, ry, zm], [X0, ye + t, Z0], [X1, ye + t, Z0], [X1, ry + t, zm], [X0, ry + t, zm]]);
    HX(c, [[X0, ry, zm], [X1, ry, zm], [X1, ye, Z1], [X0, ye, Z1], [X0, ry + t, zm], [X1, ry + t, zm], [X1, ye + t, Z1], [X0, ye + t, Z1]]);
    BX(c, X0 - 0.05, ry + 0.1, zm - 0.16, X1 + 0.05, ry + 0.3, zm + 0.16);
    paint(c, PL, WHITE); for (const x of [-ex, ex]) { c.tri(x, y, -ez, x, y, ez, x, ry - 0.05, zm); c.tri(x, y, ez, x, y, -ez, x, ry - 0.05, zm); }
    if (lod <= 2) { paint(c, OAK, WOOD); for (const s of [-1, 1]) { const x = s * (ex + 0.03); BX(c, x - 0.04, y, zm - 0.1, x + 0.04, ry - 0.15, zm + 0.1); } }
  }
  return ry;
}
// a lean-to over a door at x on two oak posts
export function porch(c, { x, hd, roofTex, roofCol }) {
  paint(c, OAK, WOOD); for (const px of [x - 1.1, x + 1.1]) BX(c, px - 0.09, 0, -hd - 1.5, px + 0.09, 2.6, -hd - 1.32);
  BX(c, x - 1.25, 2.55, -hd - 1.55, x + 1.25, 2.7, -hd - 1.3);
  paint(c, roofTex ?? SL, roofCol); HX(c, [[x - 1.45, 2.7, -hd - 1.8], [x + 1.45, 2.7, -hd - 1.8], [x + 1.45, 3.2, -hd], [x - 1.45, 3.2, -hd], [x - 1.45, 2.84, -hd - 1.8], [x + 1.45, 2.84, -hd - 1.8], [x + 1.45, 3.34, -hd], [x - 1.45, 3.34, -hd]]);
}
// a fieldstone stack from below the feet to top, a cap and a clay pot (lod ≤ 3)
export function chimney(c, { x, z, top, lod, capCol, potCol }) {
  paint(c, FS, STONE); BX(c, x - 0.45, -FOOT, z - 0.5, x + 0.45, top, z + 0.5);
  if (lod <= 3) { paint(c, FS, capCol); BX(c, x - 0.55, top - 0.15, z - 0.6, x + 0.55, top, z + 0.6); flatc(c, potCol); CY(c, x, top, z, 0.14, 0.3, 8); }
}

// ---- ARCANE parts: harvested from the Mages Guild tower (scripts/gen/mages-guild.js) ----
// a tall pointed lancet of glowing glass in a dressed-stone surround, in a wall at zf (s = -1 front, +1 back)
export function lancet(c, { x, y0, y1, zf, s, lod, glass, glowRGB }) {
  const hw = 0.22, ya = y1 - hw * 1.6;
  paint(c, FS, STONE); BX(c, x - hw - 0.12, y0 - 0.12, zf - 0.02 * s, x + hw + 0.12, ya, zf + 0.07 * s);
  c.tri(x - hw - 0.12, ya, zf + 0.07 * s, x + hw + 0.12, ya, zf + 0.07 * s, x, y1 + 0.18, zf + 0.07 * s);
  glow(c, glass, glowRGB); BX(c, x - hw, y0, zf + 0.07 * s, x + hw, ya, zf + 0.1 * s);
  c.tri(x - hw, ya, zf + 0.1 * s, x + hw, ya, zf + 0.1 * s, x, y1, zf + 0.1 * s); c.tri(x + hw, ya, zf + 0.1 * s, x - hw, ya, zf + 0.1 * s, x, y1, zf + 0.1 * s);
  if (lod <= 2) { paint(c, IR, IRONC); BX(c, x - 0.015, y0, zf + 0.1 * s, x + 0.015, ya, zf + 0.12 * s); }
  c.emissive(null);
}
// an iron spike with a glowing hexagonal crystal, at (x, y, z): the guild tower's finial at house scale (s = size)
export function crystalFinial(c, { x, y, z, s = 0.6, lod, crystal, glowRGB }) {
  paint(c, IR, IRONC); CY(c, x, y, z, 0.1 * s, 0.6 * s, 8);
  c.albedo(null); c.color(crystal); c.emissive(...glowRGB);
  const lo = y + 0.55 * s, mid = y + 0.9 * s, hi = y + 1.9 * s, r = 0.26 * s;
  for (let k = 0; k < 6; k++) { const a = (k * 60 + 30) * Math.PI / 180, b = a + Math.PI / 3, pa = [x + r * Math.sin(a), mid, z + r * Math.cos(a)], pb = [x + r * Math.sin(b), mid, z + r * Math.cos(b)];
    c.tri(...pa, ...pb, x, hi, z); c.tri(...pb, ...pa, x, lo, z); }
  c.emissive(null);
}
