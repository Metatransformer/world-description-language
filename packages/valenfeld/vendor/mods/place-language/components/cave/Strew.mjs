// cave kit · Strew
import { h, Fragment } from "../../lib/react.mjs";

// Strew({ rows, kind, seed }): a place's seeded scatter as one table: [room, count, seed?, kind?, meaning?] per line, run in order.
export const Strew = ({ rows, kind = "bones", seed = 1 }) => h(Fragment, null,
  ...rows.map(([room, count, s = seed, k = kind, meaning], i) =>
    h("scatter", { kind: k, key: `strew-${i}`, in: room, count, seed: s, ...(meaning ? { meaning } : {}) })));

export const meta = {
  layer: "dressing",
  is: "the bones, fleece and rubble lying about a whole dungeon, room by room, the same every build",
  tags: ["scatter", "bones", "fleece", "rubble", "dressing", "seeded", "table", "clutter"],
  props: { rows: "[[room, count, seed?, kind?, meaning?], ...] in the order they run", kind: "default kind, bones", seed: "default seed, 1" },
  footprint: { kind: "none" },
  topology: { under: ["a scatter layer"], takes: [], joins: [], emits: ["scatter"] },
  twins: ["verbs/scatter", "masonry/Dressing"],
  pitfalls: ["order matters: each row keeps clear of what earlier rows dropped, so reordering moves things", "it runs after the story: a row in an empty room lands differently than one after its placements", "touch-up move() ids (room/bones#n) count across rows in the same room"],
};
Strew.meta = meta;
