// cave kit · Rockfall
import { h } from "../../lib/react.mjs";
import { Barrier } from "../plan/index.mjs";

// Rockfall({ id, a, b, side, at, what, opener, key_lives, taught }): the way from a down to b is choked by fallen rock until
// something heavy comes through it (a Boulder placed where the key lives)
export const Rockfall = (p) => h(Barrier, { how: "rockfall", ...p });

export const meta = {
  layer: "relation",
  is: "a way between two hollows choked by fallen rock until something heavy comes through it",
  tags: ["cave", "rockfall", "barrier", "lock", "blocked", "puzzle", "collapse"],
  props: { id: "lock id (a Boulder or lever names it)", a: "room on the near side", b: "room past the fall", side: "wall of a the way leaves by", at: "cell along that wall", what: "what the player sees", opener: "what breaks it (the lock's key)", key_lives: "room where the opener stands", taught: "where the player learned the trick", barred: "line when tried shut", opened: "line when it gives" },
  footprint: { kind: "edge" },
  topology: { under: ["Shelf", "Cave"], takes: [], joins: ["Hollow", "Lair", "Boulder"], emits: ["link", "lock"] },
  twins: ["mine/CaveIn", "plan/Barrier"],
  pitfalls: ["a rockfall with no Boulder (or other opener placed in key_lives) can never open", "it adds a link: do not also give b a from= to a, or two ways are cut"],
};

Rockfall.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
