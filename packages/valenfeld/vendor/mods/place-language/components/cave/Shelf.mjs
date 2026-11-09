// cave kit · Shelf
import { LevelContext } from "../plan/index.mjs";
import { Level as CommonLevel } from "../common/Level.mjs";

// Shelf({ n, name, floor: [top, bottom], note }, children): one step down the cave
export const Shelf = (p) => CommonLevel({ ...p, context: LevelContext });
Shelf.displayName = "Level";   // same tree segment as the plan Level it used to alias: row ids hold

export const meta = {
  layer: "context",
  is: "one step down a cave: a level of hollows standing at about the same depth",
  tags: ["cave", "level", "floor", "depth", "storey", "step"],
  props: { n: "level number, 1 at the mouth", name: "the level's name", floor: "[top, bottom] metres, or one y: the floor its hollows stand on unless they say", note: "why this level exists, for the design page" },
  footprint: { kind: "none" },
  topology: { under: ["Cave"], takes: ["Hollow", "Lair", "Rockfall", "OneWayGate"], joins: [], emits: ["level"] },
  twins: ["common/Level", "plan/Level", "mine/Level", "seacave/Tide", "sewer/Depth", "crypt/Tier"],
  pitfalls: ["a Hollow whose floor is outside [top, bottom] still builds: the range is advisory", "reuse of n across Shelves merges them on the map"],
};

Shelf.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
