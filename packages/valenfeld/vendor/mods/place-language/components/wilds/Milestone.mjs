// wilds kit · Milestone
import { piece } from "./_shared.mjs";

// Milestone({ n, at, yaw }): a road stone
export const Milestone = ({ n, at, yaw, why }) => piece("milestone", `milestone-${n}`, { at, yaw, why });

// the card: what this component means, for picking and reasoning (contract: lib/meta.mjs)
export const meta = {
  layer: "dressing",
  is: "a carved stone standing at the roadside that marks the way",
  tags: ["milestone", "road", "marker", "waystone", "stone", "path"],
  props: { n: "its number: the row is <wilds id>/milestone-<n>", at: "[x, y, z] m in the Wilds root's frame (y is ground height there: read it off the terrain)", yaw: "facing (toward the road), degrees", why: "a note of why it stands here (shown in the design view)" },
  footprint: { kind: "point", cells: [1, 1], height: 1 },
  topology: { under: ["Wilds", "Site"], takes: [], joins: ["the road it marks"], emits: ["row"] },
  twins: [],
  pitfalls: ["it stands where you put it: on the road's verge, not in the carriageway"],
};

Milestone.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
