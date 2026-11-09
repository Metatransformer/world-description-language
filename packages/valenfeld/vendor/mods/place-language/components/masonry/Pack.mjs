// masonry kit · Pack
import { h } from "../../lib/react.mjs";
import { Squad } from "../common/Squad.mjs";

// Pack({ kind, slots: [[slot, u, v, why?]], why }): foes that stand together for one reason. Harvested: prison kitchen/root cave.
export const Pack = (p) => Squad({ ...p, by: "uv" });

export const meta = {
  layer: "encounter",
  is: "a few foes of one kind standing together for one reason, each at a fraction across its room",
  tags: ["foe", "pack", "group", "rats", "encounter", "slots"],
  props: { kind: "creature kind", slots: "[[slot id, u, v, why?], ...]: u, v are fractions across the room", why: "shared reason", in: "room id (defaults to the parent room)" },
  footprint: { kind: "area" },
  topology: { under: ["Chamber"], takes: [], joins: [], emits: ["foe"] },
  twins: ["common/Squad", "sewer/RatRun", "sewer/RatPack", "cave/Beasts", "sewer/Rats", "seacave/Crew", "mine/Foe"],
  pitfalls: ["slot ids are roster identity: renaming one respawns that foe", "creator rule: 2-3 per pack, not 4", "outside a room uv has nothing to measure against: give in="],
};

Pack.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
