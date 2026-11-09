// common · Band: creatures standing together for one reason, at one spot or several
import { h } from "../../lib/react.mjs";
// Band({ kind, at, lv, why, ...foe }): one foe row; at may be one spot, a list or a ring, so one row can stand several
export const Band = ({ kind, at, lv, why, ...f }) => h("foe", { kind, at, lv, why, ...f });
export const meta = {
  layer: "encounter",
  is: "a few creatures of one kind gathered in one place for one reason: wolves at a carcass, rats in a corner, smugglers at work",
  tags: ["foe", "group", "pack", "beasts", "rats", "crew", "encounter", "common"],
  props: { kind: "creature kind", at: "one spot or a list/ring of spots", lv: "level or [min, max]", why: "why they are here", slot: "named roster slot", boss: "true = the boss", key: "distinct identity when several stand in one room" },
  footprint: { kind: "point" },
  topology: { under: ["In"], takes: [], joins: ["Lure"], emits: ["foe"] },
  twins: ["cave/Beasts", "sewer/Rats", "seacave/Crew", "common/Squad"],
  pitfalls: ["creator rule: 2-3 per spawn, never 4 wolves", "several Bands in one room need distinct key= or they collapse to one identity", "placing by named slot and room fraction is common/Squad, not this"],
};
Band.meta = meta;
