// mine kit · Foe
import { h } from "../../lib/react.mjs";

// Foe({ kind, slot, uv | at, why }): one foe placed with its reason
export const Foe = ({ kind, slot, ...p }) => h("foe", { key: `foe-${slot}`, kind, slot, ...p });

// meta card (lib/meta.mjs)
export const meta = {
  layer: "encounter",
  is: "one foe standing in a room, placed with the reason it is there",
  tags: ["foe", "enemy", "as-built", "spawn", "guard"],
  props: { kind: "foe kind (bandit, mine-spider ...)", slot: "unique slot name in the room (keys the row)", in: "room id: required (Cut passes no room down; only a room host like Working does)", at: "spot fn, { u, v } or [x, z]", uv: "{ u, v } spot", lv: "foe level", why: "design reason" },
  footprint: { kind: "point" },
  topology: { under: ["Cut", "Working"], takes: [], joins: [], emits: ["foe"] },
  twins: ["seacave/Crew", "sewer/Rats", "cave/Beasts"],
  pitfalls: ["not common/Band or common/Squad: one foe row by itself, the mine's single-sentry word", "slot must be unique in its room or two foes share a key", "a single row: for a pack use the kit's group component", "a Cut does not hand its room down: give in= or the build fails 'give in: or a Loc'"],
};

Foe.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
