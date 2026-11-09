// cave kit · StoneRing
import { h } from "../../lib/react.mjs";
import { ring } from "../../lib/ddl.mjs";

// StoneRing({ radius, n, phase, kind, meaning }): columns (or stacks, props) standing in a ring round a room's centre: cover that breaks a rush.
export const StoneRing = ({ radius = 3.4, n = 3, phase = 0, kind = "pillar", meaning }) =>
  h("place", { kind, at: (r) => ring(r.center, radius, n, phase), ...(meaning ? { meaning } : {}) });

export const meta = {
  layer: "placement",
  is: "a few stone columns standing round the middle of a big cave room, cover to fight around",
  tags: ["pillar", "column", "ring", "cover", "flowstone", "sea-stack", "centre"],
  props: { radius: "metres from the room's centre", n: "how many, default 3", phase: "turn of the ring, radians", kind: "place kind, default pillar", meaning: "what the columns are" },
  footprint: { kind: "area", cells: [4, 4] },
  topology: { under: ["In", "Hollow", "Cut", "NaturalCavern"], takes: [], joins: [], emits: ["place"] },
  twins: ["verbs/ring", "cave/FeedingFloor"],
  pitfalls: ["radius under ~2.5 m crowds whatever stands at the centre (a carcass, a lamp)", "a room under 5x5 cells pushes the ring into the walls"],
};
StoneRing.meta = meta;
