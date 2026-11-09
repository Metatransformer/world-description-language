// common · Squad: foes with named roster slots, one row each, sharing one reason
import { h, Fragment } from "../../lib/react.mjs";
// Squad({ kind, slots, why, in, by }): by "uv" = slots [[slot, u, v, why?]] as room fractions; by "at" = [[slot, at, kind?]] spots
export const Squad = ({ kind, slots, why, in: room, by = "uv" }) => by === "at"
  ? h(Fragment, null, slots.map(([slot, at, k]) => h("foe", { key: slot, kind: k ?? kind, slot, at, why })))
  : slots.map(([slot, u, v, w]) => h("foe", { key: slot, kind, slot, uv: [u, v], why: w ?? why, ...(room ? { in: room } : {}) }));
export const meta = {
  layer: "encounter",
  is: "a named handful of foes who live in one room, each with its own roster slot so the game remembers which one died",
  tags: ["foe", "pack", "slots", "roster", "rats", "group", "encounter", "common"],
  props: { kind: "creature kind (by at: a slot's third entry overrides it)", slots: "by uv: [[slot, u, v, why?]]; by at: [[slot, at, kind?]]", why: "shared reason", in: "room id (by uv only; defaults to the parent room)", by: "uv (fractions across the room) | at (spots)" },
  footprint: { kind: "area" },
  topology: { under: ["In", "Chamber"], takes: [], joins: [], emits: ["foe"] },
  twins: ["masonry/Pack", "sewer/RatRun", "sewer/RatPack", "common/Band"],
  pitfalls: ["slot ids are roster identity: renaming one respawns that foe", "creator rule: 2-3 per pack, not 4", "by uv outside a room has nothing to measure against: give in=", "by at ignores in="],
};
Squad.meta = meta;
