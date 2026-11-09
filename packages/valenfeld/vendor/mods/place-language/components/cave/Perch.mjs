// cave kit · Perch
import { h } from "../../lib/react.mjs";

// Perch({ corner, inset, size, height, meaning }): a raised rock rise in a corner of a big room: where the lookout stands and shouts.
export const Perch = ({ corner = "ne", inset = 2, size = [3, 2.5], height = 1.2, meaning }) =>
  h("place", { kind: "rise", at: (r) => r.corner(corner, inset), size, height, ...(meaning ? { meaning } : {}) });

export const meta = {
  layer: "placement",
  is: "a rock rise or spoil heap in a corner of a big room where a lookout stands above the fight",
  tags: ["rise", "perch", "lookout", "watcher", "high ground", "corner", "spoil heap"],
  props: { corner: "nw|ne|sw|se, default ne", inset: "metres in from the corner, default 2", size: "[w, d] metres, default [3, 2.5]", height: "metres, default 1.2", meaning: "what the rise is in this place" },
  footprint: { kind: "point", cells: [2, 2], height: 1.2 },
  topology: { under: ["In", "Hollow", "Cut", "NaturalCavern"], takes: [], joins: [], emits: ["place"] },
  twins: ["cave/FeedingFloor", "verbs/gallery"],
  pitfalls: ["the watcher foe is not part of it: put one at near(\"<room>/rise#0\") in the encounter layer", "a second Perch in the same room is rise#1: near() ids count in order", "a dais (low, by a wall) is a plain place kind=rise, not a Perch"],
};
Perch.meta = meta;
