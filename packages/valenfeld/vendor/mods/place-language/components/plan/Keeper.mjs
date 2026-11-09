// plan kit · Keeper
import { h } from "../../lib/react.mjs";

// Keeper({ kind, at, lv, why }): the one foe the dungeon belongs to, standing in its boss room; its roster slot is its kind.
export const Keeper = ({ kind, at, lv, why, slot = kind }) => h("foe", { kind, at, slot, lv, boss: true, why });

export const meta = {
  layer: "encounter",
  is: "the dungeon's master: the boss foe standing where the final fight starts, with the reason it is there",
  tags: ["boss", "keeper", "master", "foe", "final fight", "encounter", "slot"],
  props: {
    kind: "creature kind (also its roster slot)",
    at: "where it stands: a Loc in the boss room (court.at(0.5, 0.45), near(\"solar/rise#0\").side(\"s\", 1.6))",
    lv: "level",
    why: "why it is there",
    slot: "roster slot (default: the kind)",
  },
  footprint: { kind: "point" },
  topology: { under: ["Plan", "Boss", "In"], takes: [], joins: [], emits: ["foe"] },
  twins: ["mine/Foe", "cave/Lair", "plan/Boss", "seacave/Crew"],
  pitfalls: [
    "one per place: the slot is the kind, so two Keepers of one kind share a roster slot",
    "renaming the kind renames the slot and respawns it",
    "write it in the encounters layer after the room's other foes, so foe order (and ids) hold",
  ],
};

Keeper.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
