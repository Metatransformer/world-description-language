// A wild bramble clump (0.9-1.4 m): a low, wide, dark tangle of leaf-spray cards, laid in clumps of 3-7 at meadow and
// forest edges (the wild-shrubs beds). params.seed shapes it. Builder: scripts/lib/treeform.js (crossed cards from lod 3).
import { tree } from "../lib/treeform.js";
export function geometry(ctx) { return tree(ctx, "bramble"); }
export function collider() { return { kind: "box", width: 1.6, height: 1, depth: 1.6, center: [0, 0.5, 0] }; }
