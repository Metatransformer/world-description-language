// THE FURNISH KIT: floorplans × furniture rules. Draws a built shell bare (scripts/lib/data/floorplans.yml: the gen and its
// bare params) and fills each of its rooms with any room template's furniture (scripts/lib/data/interiors.yml rooms) by the
// interior kit's own placement rules (scripts/lib/interior.js makeFurnisher). params { plan, as: { <room>: <template> }, seed, trade }.
// {} = the fighters guild hall furnished by its plan's defaults. A room as "none" stays empty.
import PLANS from "../lib/data/floorplans.json";
import D from "../lib/data/interiors.json";
import { makeFurnisher, drawPiece } from "../lib/interior.js";
import * as fightersHall from "./fighters-hall.js";
import * as farmhouseRoom from "./farmhouse-room.js";
import * as innHall from "./inn-hall.js";
import * as magesHall from "./mages-hall.js";
import * as keepHall from "./valenfeld-keep-hall.js";
const GENS = { "scripts/gen/fighters-hall.js": fightersHall, "scripts/gen/farmhouse-room.js": farmhouseRoom, "scripts/gen/inn-hall.js": innHall, "scripts/gen/mages-hall.js": magesHall, "scripts/gen/valenfeld-keep-hall.js": keepHall };
function rng(seed) { let s = (seed | 0) * 2654435761 >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
function plan(P) {
  const id = PLANS[P.plan] ? P.plan : "fighters-hall", F = PLANS[id], rnd = rng(P.seed ?? 1), occ = [], has = new Set(F.has ?? []);
  for (const [ax, az, bx, bz] of F.clear ?? []) for (const level of [0]) occ.push({ level, ax, az, bx, bz });
  const L = { stair: null, doors: [], items: [] }, furnish = makeFurnisher(L, rnd, occ);
  Object.entries(F.rooms).forEach(([name, R], i) => { const tpl = (P.as ?? {})[name] ?? R.as; if (!tpl || tpl === "none" || !D.rooms[tpl]) return;
    furnish({ tpl, def: D.rooms[tpl], furniture: fillOut(D.rooms[tpl], R, P.fill).filter((f) => !has.has(f.piece) && !(R.has ?? []).includes(f.piece)), spread: fillOf(D.rooms[tpl], R, P.fill) > 1 ? 0.85 : 0.6, level: 0, y: R.y ?? 0, h: R.h ?? 3, x0: R.x0, x1: R.x1, zf: R.zf, zb: R.zb, i: 1 }); });
  return { F, gen: GENS[F.gen], items: L.items };
}
const withParams = (ctx, params) => new Proxy(ctx, { get: (t, k) => k === "params" ? params : (typeof t[k] === "function" ? t[k].bind(t) : t[k]) });
export function geometry(ctx) { const P = ctx.params ?? {}, { F, gen, items } = plan(P);
  gen?.geometry(withParams(ctx, F.bare ?? {}));
  for (const it of items) if ((ctx.lod ?? 1) < 4 || !it.walk) drawPiece(ctx, it, ctx.lod ?? 1, P.trade ?? null); }
export function collider(ctx) { const P = ctx.params ?? {}, { F, gen, items } = plan(P), out = [...(gen?.collider(withParams(ctx, F.bare ?? {})) ?? [])];
  for (const it of items) if (!it.walk) { const sw = it.rot % 2 ? it.d : it.w, sd = it.rot % 2 ? it.w : it.d, hh = Math.min(it.h, 2.2);
    out.push({ kind: "box", width: sw, height: hh, depth: sd, center: [it.x, it.y + hh / 2, it.z] }); }
  return out; }
// a room bigger than its template was drawn for repeats its furniture: fill = the room's floor over the template's largest, from 1.25× up
// rounded, 1..4 (params.fill overrides; 1 = as the template lists). One-of pieces (a bar, a hearth, a forge, a stove) never repeat.
const ONCE = new Set(["bar", "hearth", "forge", "stove", "altar", "throne"]);
function fillOf(def, R, over) {
  const w = def.size?.w?.[1] ?? 8, d = def.size?.d?.[1] ?? 6, area = (R.x1 - R.x0) * (R.zf - R.zb);
  return Math.max(1, Math.min(4, over ?? Math.ceil(area / (w * d) - 0.25)));
}
function fillOut(def, R, over) {
  const fill = fillOf(def, R, over);
  return fill === 1 ? def.furniture : def.furniture.map((f) => ONCE.has(f.piece) || f.place === "across" ? f : { ...f, n: (f.n ?? 1) * fill });
}
