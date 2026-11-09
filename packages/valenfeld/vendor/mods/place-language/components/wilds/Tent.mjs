// wilds kit · Tent
import { piece } from "./_shared.mjs";

// Tent({ name, at, yaw }): a canvas tent pitched in a camp
export const Tent = ({ name, at, yaw, why }) => piece("tent", name, { at, yaw, why });

// the card: what this component means, for picking and reasoning (contract: lib/meta.mjs)
export const meta = {
  layer: "dressing",
  is: "a canvas tent pitched in a camp, where its people sleep",
  tags: ["tent", "camp", "canvas", "shelter", "bandit"],
  props: { name: "suffix: the row is <wilds id>/<name>", at: "[x, y, z] m in the Wilds root's frame (y is ground height there: read it off the terrain)", yaw: "the way its flap faces, degrees", why: "a note of why it stands here (shown in the design view)" },
  footprint: { kind: "point", cells: [2, 2], height: 2 },
  topology: { under: ["Wilds", "Site"], takes: [], joins: [], emits: ["row"] },
  twins: [],
  pitfalls: ["no bed or loot inside: add them as rows", "pitch it inside the Palisade, clear of its gaps"],
};

Tent.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
