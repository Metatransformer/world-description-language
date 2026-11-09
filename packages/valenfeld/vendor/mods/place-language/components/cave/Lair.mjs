// cave kit · Lair
import { Boss } from "../plan/index.mjs";

// Lair({ ...hollow, dais, phase2 }): the boss's hollow
export const Lair = Boss;

export const meta = {
  layer: "meaning",
  is: "the boss's hollow at the bottom of the cave, where the pack's mother or the den's master waits",
  tags: ["boss", "cave", "lair", "den", "arena", "finale"],
  props: { id: "room id", rect: "[x, z, w, d] cells", floor: "floor y metres", height: "ceiling metres", from: "room it opens off", how: "the way in", side: "wall of from", at: "cell on that wall", dais: "where the boss stands", phase2: "{ at_hp, say, adds }: what happens at half health" },
  footprint: { kind: "room", cells: [12, 12], height: 9 },
  topology: { under: ["Shelf"], takes: [], joins: ["Hollow", "Passage"], emits: ["room", "link"] },
  twins: ["plan/Boss", "seacave/Drowned", "sewer/RatHall", "crypt/Heart"],
  pitfalls: ["it is plain plan/Boss: no natural mounds, unlike Hollow; add them by hand if wanted", "the boss itself is a Beasts row with boss and slot inside a sibling <In room={id}>: children of the Lair get no room"],
};

Lair.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
