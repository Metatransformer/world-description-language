// masonry kit · Strewn
import { h } from "../../lib/react.mjs";

// Strewn({ kind, rooms: [[room, count, meaning?]], seed }): the same leavings strewn by the walls of several rooms, one seed each (1, 2, 3 … unless seed is fixed).
export const Strewn = ({ kind = "bones", rooms, seed }) =>
  rooms.map(([room, count, meaning], i) => h("scatter", { key: `${room}-${i}`, kind, in: room, count, seed: seed ?? i + 1, ...(meaning ? { meaning } : {}) }));

export const meta = {
  layer: "dressing",
  is: "the same leavings (bones, fleeces, rubble) strewn along the walls of several rooms, never in a doorway",
  tags: ["scatter", "strewn", "bones", "fleece", "leavings", "clutter", "dressing", "seed"],
  props: {
    kind: "what is strewn (default bones)",
    rooms: "[[room id, count, meaning?], ...] in order",
    seed: "one seed for every room (default: 1, 2, 3 … by order)",
  },
  footprint: { kind: "area" },
  topology: { under: ["Plan", "Level", "In"], takes: [], joins: [], emits: ["prop"] },
  twins: ["verbs/scatter", "verbs/scatterWalls", "sewer/Wet"],
  pitfalls: [
    "seeds follow list order: inserting a room in the middle reseeds every room after it (pass seed to pin them)",
    "scattered rows dodge earlier props: strew after the story layer's hand placements",
  ],
};

Strewn.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
