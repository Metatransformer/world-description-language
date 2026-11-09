// PIECE SET KIT: any furniture from the interior kit (scripts/lib/data/interiors.yml pieces) laid freely in a dungeon or yard.
// params { items: [{ piece, x, z, y?, rot? (0-3 quarter turns), w?, d?, h?, chairs? }], trade? }. Sizes default to the kit's.
import D from "../lib/data/interiors.json";
import { drawPiece } from "../lib/interior.js";
const full = (P) => (P.items ?? []).filter((it) => D.pieces[it.piece]).map((it) => ({ y: 0, rot: 0, ...D.pieces[it.piece], ...it }));
export function geometry(ctx) { const P = ctx.params ?? {}; for (const it of full(P)) if ((ctx.lod ?? 1) < 4 || !it.walk) drawPiece(ctx, it, ctx.lod ?? 1, P.trade ?? null); }
export function collider(ctx) { return full(ctx.params ?? {}).filter((it) => !it.walk).map((it) => { const sw = it.rot % 2 ? it.d : it.w, sd = it.rot % 2 ? it.w : it.d, hh = Math.min(it.h, 2.2);
  return { kind: "box", width: sw, height: hh, depth: sd, center: [it.x, it.y + hh / 2, it.z] }; }); }
