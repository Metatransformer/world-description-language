// wilds kit · Den
import { piece } from "./_shared.mjs";

// Den({ name, at, yaw, seed }): a wolf den in the bank
export const Den = ({ name, at, yaw, seed, why }) => piece("den", `den-${name}`, { at, yaw, prim: { "primitive.params.seed": seed }, why });

// the card: what this component means, for picking and reasoning (contract: lib/meta.mjs)
export const meta = {
  layer: "meaning",
  is: "a wolf den dug into a bank: a dark hollow where a pack lives",
  tags: ["den", "wolf", "lair", "burrow", "beasts", "hollow", "pack"],
  props: { name: "suffix: the row is <wilds id>/den-<name>", at: "[x, y, z] m in the Wilds root's frame (y is ground height there: read it off the terrain)", yaw: "the way the opening faces, degrees", seed: "shape seed", why: "a note of why it stands here (shown in the design view)" },
  footprint: { kind: "point", cells: [2, 2] },
  topology: { under: ["Wilds", "Site"], takes: [], joins: [], emits: ["row"] },
  twins: [],
  pitfalls: ["only the hollow: no wolves come with it (the wildlife/encounter data spawns them)", "not a way in: a den you can enter is an Entrance"],
};

Den.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
