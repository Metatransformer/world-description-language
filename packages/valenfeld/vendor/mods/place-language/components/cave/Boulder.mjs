// cave kit · Boulder
import { h } from "../../lib/react.mjs";

// Boulder({ at, rolls }): a loose boulder at a chute's top; the puzzle's key. rolls: what it smashes when pushed
export const Boulder = ({ at, meaning }) => h("place", { kind: "boulder", at, meaning });

export const meta = {
  layer: "mechanism",
  is: "a loose boulder at a chute's top that a player shoves down to smash a rockfall open",
  tags: ["boulder", "puzzle", "rockfall", "push", "key", "mechanism"],
  props: { at: "where it rests (the room where the Rockfall's key lives)", meaning: "why it is there" },
  footprint: { kind: "point", height: 2.2 },
  topology: { under: ["In"], takes: [], joins: ["Rockfall"], emits: ["place"] },
  twins: [],
  pitfalls: ["it opens the lock named rockfall unless the built row says otherwise: name your Rockfall id rockfall or the push does nothing", "the rolls prop in the old doc is not read"],
};

Boulder.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
