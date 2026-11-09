// masonry kit · Door
import { h } from "../../lib/react.mjs";

// Door({ id, at, why }): a door row the hand layer owns (dungeon-panel doors, iron doors).
//   uv: [u, v] stands it by fraction across its room; lock: { id, key } names how it opens (its panel or key)
export const Door = ({ id, at, uv, lock, why = lock ? `a locked door: ${lock.key}` : "a door" }) => h("hold", { key: id, id, at, uv, why });

export const meta = {
  layer: "relation",
  is: "a door that stands where it was built (a panel door, an iron door), carried whole, saying how it opens",
  tags: ["door", "held", "locked", "panel", "iron", "authored"],
  props: { id: "id of the authored door row", at: "semantic spot", uv: "[u, v] fraction across its room", lock: "{ id, key, note }: how it opens (null key = never from this side)", why: "reason (defaults from lock)" },
  footprint: { kind: "edge" },
  topology: { under: ["Chamber"], takes: [], joins: [], emits: ["hold"] },
  twins: ["hall/ExitDoor", "crypt/GraveDoor"],
  pitfalls: ["lock is description only: it writes no lock row and no link; the barrier itself is a lock/Barrier row", "the id must exist in the live build"],
};

Door.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
