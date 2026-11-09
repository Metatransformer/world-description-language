import BK from "../lib/data/building-kit.json";
import { BARREL, BXR, CB, CY, HX, LA, RB, ROOF, flatc, glow, paint } from "../lib/buildkit.js";   // the shared building toolkit
import { kitDef } from "../lib/kits.js";
import { FOOT, plinth, storey, timberFrame, casement, lancet, crystalFinial, plankDoor, cottageRoof, porch as porchPart, chimney, ROOF_SHAPES } from "../lib/pieces/cottage.js";   // the shared cottage architecture parts   // size and colour defaults: the house row in scripts/lib/data/kits.yml   // textures and tints: scripts/lib/data/building-kit.yml
// ---- Valenfeld building kit (shared verbatim by scripts/gen/*): textures, boxes, lathes, roofs ----
const { fieldstone: FS, oak: OAK, plaster: PL, slate: SL, iron: IR, flagstone: FLAG, hay: HAY } = BK.textures;
const { stone: STONE, wood: WOOD, white: WHITE, iron: IRONC } = BK.tints;
// hexahedron: b0 b1 b2 b3 (bottom: x0z0 x1z0 x1z1 x0z1) then t0..t3 above them
const BX = BXR;
// box by centre and size, turned: roll (about z), then pitch (about x, + tips -z up), then yaw (about y), degrees
// lathe: prof [[r, h]…] swept round the y axis (or the x axis: h runs along +x), smooth sides
// gable roof, ridge along x over z mid, eaves at z0/z1 at height ye, ridge yr, slab thickness t
function MERL(c, x0, z0, x1, z1, y, th, h = 0.9, w = 0.9, gap = 0.9) {
  for (let x = x0; x + w <= x1 + 1e-6; x += w + gap) { BX(c, x, y, z0, x + w, y + h, z0 + th); BX(c, x, y, z1 - th, x + w, y + h, z1); }
  for (let z = z0 + th + gap; z + w <= z1 - th + 1e-6; z += w + gap) { BX(c, x0, y, z, x0 + th, y + h, z + w); BX(c, x1 - th, y, z, x1, y + h, z + w); } }
// ---- end kit ----
// A GREYHOLLOW HOUSE: fieldstone ground storey, jettied lime-plaster upper storey in oak framing (or one
// plaster storey on a stone plinth when two: false), mossy slate gable roof along x, a side chimney,
// a closed plank door on the front (-z), shuttered glowing windows, flower boxes.
// params: w, d (footprint), two, windowKind (casement | lancet), finial (crystal on the ridge), chimney (false = none), chim (+1 / -1 side), shut (shutter colour), doorX, roofTex/roofCol (default mossy slate).
// The chimney top (for a smoke fx child) stands at x = chim*(w/2+J+0.4), y = ridge+1.35, z = d*0.12.
// this placement's params over the kit row's (a null/undefined param keeps the row's value)
function params(c) { const p = { ...(kitDef("house").params ?? {}) }; for (const [k, v] of Object.entries(c.params ?? {})) if (v != null) p[k] = v; return p; }
export function geometry(c) {
  const p = params(c), D = c.lod, w = p.w, d = p.d, hw = w / 2, hd = d / 2, two = p.two !== false, J = two ? p.jetty : 0;
  const [H1, H2] = two ? p.storey2 : p.storey1, ex = hw + J, ez = hd + J, ridge = H2 + ez * 0.9;
  const shut = p.shut, dx = p.doorX, ch = p.chim;
  // #357 the house kit: a roof shape and a porch rolled per house from its own numbers, so no two neighbours match; a param pins one
  const hk = [...`${c.seed ?? 0}|${w}|${d}|${dx}|${ch}|${shut}|${two}`].reduce((h, k) => Math.imul(h ^ k.charCodeAt(0), 16777619), 2166136261) >>> 0;
  const roof = p.roof ?? ROOF_SHAPES[hk % 4], porch = p.porch ?? ((hk >>> 3) % 3 === 0);
  plinth(c, { hw, hd, top: H1 });
  storey(c, { ex, ez, y0: H1, y1: H2 });
  const np = Math.max(3, Math.round(w / 1.8)), bay = (i) => -ex + 2 * ex * (i + 0.5) / np;
  timberFrame(c, { ex, ez, hd, y0: H1, y1: H2, bays: np, lod: D, joists: two });
  const arc = p.windowKind === "lancet";   // the arcane style's windows (mages guild): no shutters, no flower boxes
  const win = (x, y0, y1, zf, s, box) => arc ? lancet(c, { x, y0, y1, zf, s, lod: D, glass: p.glass, glowRGB: p.glow }) : casement(c, { x, y0, y1, zf, s, lod: D, glass: p.glass, glowRGB: p.glow, shut, box, boxCol: p.boxCol, flowers: p.flowers });
  const uy0 = two ? H1 + 0.75 : 1.15, uy1 = two ? H2 - 0.6 : 2.3;
  for (let i = 1; i < np - 1; i++) { const x = bay(i); if (!two && Math.abs(x - dx) < 1.3) continue; win(x, uy0, uy1, -ez, -1, two); win(x, uy0, uy1, ez, 1, false); }
  if (two) for (const x of [dx - 2.0, dx + 2.0]) if (Math.abs(x) < hw - 0.8) win(x, 0.9, 2.0, -hd, -1, false);
  plankDoor(c, { x: dx, hd, lod: D, doorCol: p.doorCol, stepCol: p.stepCol });
  const ry = cottageRoof(c, { shape: roof, ex, ez, y: H2, lod: D, roofTex: p.roofTex, roofCol: p.roofCol });
  if (porch) porchPart(c, { x: dx, hd, roofTex: p.roofTex, roofCol: p.roofCol });
  if (p.chimney !== false) chimney(c, { x: ch * (ex + 0.4), z: d * 0.12, top: ry + 1.0, lod: D, capCol: p.stepCol, potCol: p.potCol });
  if (p.finial) for (const fx of roof === "hip" ? [0] : [-ex - 0.3, ex + 0.3]) crystalFinial(c, { x: fx, y: ry + 0.25, z: roof === "saltbox" ? -ez * 0.35 : 0, lod: D, crystal: p.crystal ?? "oklch(0.85 0.09 225)", glowRGB: p.crystalGlow ?? [0.55, 1.6, 3.6] });
}
export function collider(c) {
  const p = params(c), w = p.w, d = p.d, hw = w / 2, hd = d / 2, two = p.two !== false, J = two ? p.jetty : 0;
  const [H1, H2] = two ? p.storey2 : p.storey1, ex = hw + J, ez = hd + J, ridge = H2 + ez * 0.9, ch = p.chim, cx = ch * (ex + 0.4), cz = d * 0.12;
  const b = CB(); b(-hw, -FOOT, -hd, hw, H1, hd); b(-ex, H1, -ez, ex, H2, ez); b(-ex, H2, -ez * 0.55, ex, ridge - 0.2, ez * 0.55); b(cx - 0.45, -FOOT, cz - 0.5, cx + 0.45, ridge + 1.0, cz + 0.5);
  return b.list;
}
