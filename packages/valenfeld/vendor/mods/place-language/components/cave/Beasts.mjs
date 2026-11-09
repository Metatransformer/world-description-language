// cave kit · Beasts
import { h } from "../../lib/react.mjs";
import { Band } from "../common/Band.mjs";

// Beasts({ kind, at, lv, why }): animals standing together for one reason; at may be one spot or several (a ring, a list)
export const Beasts = ({ kind = "wolf", ...p }) => Band({ kind, ...p });

export const meta = {
  layer: "encounter",
  is: "animals standing together for one reason (feeding, guarding, asleep), one foe row per spot",
  tags: ["foe", "beasts", "wolves", "pack", "animals", "encounter", "boss"],
  props: { kind: "creature kind (wolf)", at: "one spot or a list/ring of spots", lv: "level or [min, max]", why: "why they are here", slot: "named roster slot (for a boss)", boss: "true = the boss" },
  footprint: { kind: "point" },
  topology: { under: ["In"], takes: [], joins: ["Lure"], emits: ["foe"] },
  twins: ["common/Band", "masonry/Pack", "sewer/Rats", "sewer/RatPack", "sewer/RatRun", "seacave/Crew", "mine/Foe"],
  pitfalls: ["creator rule: packs of 2-3, never 4 wolves per spawn", "repeated Beasts in one room need distinct key= or they collapse to one identity"],
};

Beasts.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
