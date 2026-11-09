// cave kit · FeedingFloor
import { h, Fragment } from "../../lib/react.mjs";
import { StoneRing } from "./StoneRing.mjs";
import { Perch } from "./Perch.mjs";

// FeedingFloor({ carcass, pillars, perch }): the grand-fight room of a beast den: a kill in the middle, columns round it, a lookout's rise.
export const FeedingFloor = ({ carcass, pillars = {}, perch = {} }) => h(Fragment, null,
  carcass && h("place", { kind: "carcass", at: (r) => r.center, meaning: carcass }),
  h(StoneRing, pillars),
  h(Perch, perch));

export const meta = {
  layer: "meaning",
  is: "the pack's feeding floor: a big room with a kill in the middle, columns round it and a rise where the watcher stands",
  tags: ["feeding", "carcass", "grand fight", "pillars", "rise", "watcher", "den", "brood"],
  props: { carcass: "meaning of the kill at the room's centre (omit for none)", pillars: "StoneRing props { radius, n, phase, meaning }", perch: "Perch props { corner, meaning }" },
  footprint: { kind: "area", cells: [12, 11] },
  topology: { under: ["In", "Hollow", "NaturalCavern"], takes: [], joins: [], emits: ["place"] },
  twins: ["sewer/RatHall", "cave/Perch", "cave/StoneRing"],
  pitfalls: ["the feeders and the watcher are encounter-layer rows: ring(near(\"<room>/carcass#0\"), r, n) and near(\"<room>/rise#0\")", "emits carcass, pillar, rise in that order: a room that already holds a carcass makes this carcass#1"],
};
FeedingFloor.meta = meta;
