// THE TOWN-WORKS GEN: arcades, bridge spans, quays, curtain walls, arena stands, paving, stall frames, signs, court dressing.
// One placement = one part (params f/w/h/d/tex/col…) or a cluster (params.parts). Feet at the bottom centre, like a box.
import { drawPart, partColliders, partsOf } from "../lib/masonry.js";
export function geometry(ctx) { for (const p of partsOf(ctx.params)) drawPart(ctx, p); }
export function collider(ctx) { return partColliders(partsOf(ctx.params)); }
