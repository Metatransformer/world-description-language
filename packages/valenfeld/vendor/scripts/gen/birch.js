// A Greywood birch (13-18 m at scale 1): a slim white trunk, a narrow airy crown of birch-spray cards.
// params.seed shapes it; params.gold turns it to early autumn. Builder: scripts/lib/treeform.js.
import { tree } from "../lib/treeform.js";
import TREES from "../lib/data/trees.json";
export function geometry(ctx) { return tree(ctx, "birch", ctx.params.gold ? { hue: 90, chroma: 0.1 } : {}); }
export function collider() { const T = TREES.birch; return { ...T.collider, center: [...T.collider.center] }; }
