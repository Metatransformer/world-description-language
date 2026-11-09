// seacave kit · Crew
import { h } from "../../lib/react.mjs";
import { Band } from "../common/Band.mjs";

// Crew({ kind, at, lv, why }): people at work, caught at it
export const Crew = ({ kind = "smuggler", lv = [1, 2], ...p }) => Band({ kind, lv, ...p });

// meta card (lib/meta.mjs)
export const meta = {
  layer: "encounter",
  is: "the smuggler crew caught at work: one or more people standing where they were doing their job when you came in",
  tags: ["seacave", "foe", "crew", "smugglers", "people", "enemy", "boss"],
  props: {"kind": "foe kind (smuggler; grotto-captain for the boss)", "at": "a spot or an array of spots (one foe each), or a ring()", "lv": "level or [min, max] (default [1, 2])", "why": "what they were doing", "slot": "fixed slot name (the boss)", "boss": "true: this is the boss"},
  footprint: { kind: "point" },
  topology: { under: ["In"], takes: [], joins: [], emits: ["foe"] },
  twins: ["common/Band", "mine/Foe", "sewer/Rats", "sewer/RatPack", "cave/Beasts", "hall/Resident"],
  pitfalls: ["why should say the job they were caught at: it is shown", "a boss needs a fixed slot and boss", "many spots in one room crowd the fight: 2-3 is the house style"],
};

Crew.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
