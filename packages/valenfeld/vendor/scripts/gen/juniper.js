// A common juniper (1.2-2.1 m): a dense blue-green needle mound on hill shoulders and heath, in clumps with brambles and
// hedge bushes (the wild-shrubs beds). params.seed shapes it. Builder: scripts/lib/treeform.js (crossed cards from lod 3).
import { tree } from "../lib/treeform.js";
export function geometry(ctx) { return tree(ctx, "juniper"); }
export function collider() { return { kind: "box", width: 1.4, height: 1.8, depth: 1.4, center: [0, 0.9, 0] }; }
