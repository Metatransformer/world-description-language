// wilds kit · Log
import { piece } from "./_shared.mjs";

// Log({ n, at, yaw, len, seed }): a fallen trunk
export const Log = ({ n, at, yaw, len, seed, why }) => piece("log", `log-${n}`, { at, yaw, prim: { primitive: { params: { len, seed } } }, why });

// the card: what this component means, for picking and reasoning (contract: lib/meta.mjs)
export const meta = {
  layer: "dressing",
  is: "a fallen tree trunk lying on the forest floor",
  tags: ["log", "trunk", "fallen", "tree", "wood", "dressing", "forest"],
  props: { n: "its number: the row is <wilds id>/log-<n>", at: "[x, y, z] m in the Wilds root's frame (y is ground height there: read it off the terrain)", yaw: "the way it lies, degrees", len: "length m", seed: "bark/shape seed", why: "a note of why it stands here (shown in the design view)" },
  footprint: { kind: "line", cells: [3, 1] },
  topology: { under: ["Wilds", "Site"], takes: [], joins: [], emits: ["row"] },
  twins: [],
  pitfalls: ["a log across a path blocks it (static collider)", "on a slope it rests on one end: pick flat ground or lower y"],
};

Log.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
