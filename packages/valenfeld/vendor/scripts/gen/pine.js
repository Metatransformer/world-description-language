// A Greywood spruce (16-24 m at scale 1): a straight bark trunk under drooping tiers of spruce-bough cards.
// params.seed shapes one tree. Builder: scripts/lib/treeform.js.
import { tree } from "../lib/treeform.js";
import TREES from "../lib/data/trees.json";
export function geometry(ctx) { return tree(ctx, "pine"); }
export function collider() { const T = TREES.pine; return { ...T.collider, center: [...T.collider.center] }; }
