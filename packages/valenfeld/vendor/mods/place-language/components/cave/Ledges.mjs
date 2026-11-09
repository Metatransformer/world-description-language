// cave kit · Ledges
import { h, Fragment } from "../../lib/react.mjs";
import { near } from "../../lib/ddl.mjs";

// Ledges({ north, south, size, height, inset, holes }): a pair of rock ledges on the north and south walls of a boss cave, maybe a hole beside each.
export const Ledges = ({ north, south, size = [6, 1.6], height = 1.6, inset = 1.4, holes }) => h(Fragment, null,
  ...[["n", north], ["s", south]].map(([side, meaning]) =>
    h("place", { kind: "ledge", key: `ledge-${side}`, at: (r) => r.wall(side, "middle", inset), size, height, ...(meaning ? { meaning } : {}) })),
  ...(holes ? [0, 1].map((i) => h("place", { kind: holes.kind ?? "whelp-hole", key: `hole-${i}`,
    at: (r) => near(`${r.id}/ledge#${i}`).side(holes.side ?? "e", holes.off ?? 2.9), ...(holes.meaning ? { meaning: holes.meaning } : {}) })) : []));

export const meta = {
  layer: "placement",
  is: "two high rock ledges facing each other across a boss cave, where its archers or young wait, sometimes with a hole beside each that more come out of",
  tags: ["ledge", "perch", "boss", "arena", "flank", "whelp-hole", "brood hole", "archers"],
  props: { north: "meaning of the north ledge", south: "meaning of the south ledge", size: "[w, d] metres, default [6, 1.6]", height: "metres, default 1.6", inset: "metres off the wall, default 1.4", holes: "{ kind, side, off, meaning }: a hole beside each ledge (default whelp-hole, 2.9 m east)" },
  footprint: { kind: "edge", cells: [3, 1], height: 1.6 },
  topology: { under: ["In", "Lair", "NaturalCavern", "Drowned"], takes: [], joins: [], emits: ["place"] },
  twins: ["verbs/gallery", "seacave/Drowned"],
  pitfalls: ["the ledge ids are ledge#0 (north) and ledge#1 (south) only if no ledge stands in the room before it", "foes on the ledges and adds out of the holes are encounter rows: near(\"<room>/ledge#0\"), near(\"<room>/whelp-hole#1\")", "a room under ~10 cells wide puts the holes into the wall"],
};
Ledges.meta = meta;
