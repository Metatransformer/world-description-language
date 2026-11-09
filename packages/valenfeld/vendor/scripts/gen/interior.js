// THE INTERIOR KIT's mesh: lays a building recipe into rooms with furniture (scripts/lib/interior.js reads
// scripts/lib/data/interiors.yml). params { recipe, w, d, storeys, seed, trade, cut }. Origin = the inner face of the
// entrance wall at floor level, rooms run toward -z. Drawn inside a warp-in place (places/int-*), never in a city shell.
import { draw, collide } from "../lib/interior.js";
export function geometry(ctx) { draw(ctx, ctx.params ?? {}, ctx.lod ?? 1); }
export function collider(ctx) { collide(ctx, ctx.params ?? {}); }
