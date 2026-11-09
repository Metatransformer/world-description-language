// wilds kit · Rock
import { piece } from "./_shared.mjs";

// Rock({ n, at, yaw, scale, seed }): a lichened boulder
export const Rock = ({ n, at, yaw, scale, seed, why }) => piece("rock", `boulder-${n}`, { at, yaw, scale, shade: false, prim: { "primitive.params.seed": seed }, why });

// the card: what this component means, for picking and reasoning (contract: lib/meta.mjs)
export const meta = {
  layer: "dressing",
  is: "a big lichened boulder sitting in the open country",
  tags: ["rock", "boulder", "stone", "dressing", "landmark", "cover"],
  props: { n: "its number: the row is <wilds id>/boulder-<n>", at: "[x, y, z] m in the Wilds root's frame (y is ground height there: read it off the terrain)", yaw: "facing, degrees", scale: "size multiplier", seed: "shape seed", why: "a note of why it stands here (shown in the design view)" },
  footprint: { kind: "point", cells: [1, 1] },
  topology: { under: ["Wilds", "Site"], takes: [], joins: [], emits: ["row"] },
  twins: [],
  pitfalls: ["two Rocks with one n collide", "a static collider: one on a path blocks it"],
};

Rock.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
