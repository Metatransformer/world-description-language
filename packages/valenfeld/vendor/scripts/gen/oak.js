// A frontier oak (12-17 m at scale 1): flared trunk, heavy limbs, a broad domed crown of oak-spray cards.
// params.seed shapes it; params.autumn browns it. Builder: scripts/lib/treeform.js.
import { tree } from "../lib/treeform.js";
import TREES from "../lib/data/trees.json";
export function geometry(ctx) { return tree(ctx, "oak", ctx.params.autumn ? { hue: 70, chroma: 0.08 } : {}); }
export function collider() { const T = TREES.oak; return { ...T.collider, center: [...T.collider.center] }; }
