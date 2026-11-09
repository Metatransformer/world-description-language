// A hedgerow bush (1.7-2.4 m): a low, wide mound of oak-spray cards on a few stubby stems, laid in rows
// along field edges where a hedge grows. params.seed shapes it. Builder: scripts/lib/treeform.js.
import { tree } from "../lib/treeform.js";
export function geometry(ctx) { return tree(ctx, "hedge"); }
export function collider() { return { kind: "box", width: 2.2, height: 1.6, depth: 2.2, center: [0, 0.8, 0] }; }
