// cave kit · OneWayGate
import { h } from "../../lib/react.mjs";
import { Barrier } from "../plan/index.mjs";

// OneWayGate({ id, a, b, how, side, at, what, opener, taught }): a barrier lashed from the far side: it lifts only from b
export const OneWayGate = ({ how = "gate", ...p }) => h(Barrier, { how, key_lives: p.b, ...p });

export const meta = {
  layer: "relation",
  is: "a gate lashed shut from the far side, so it only opens from b: a shortcut back you find from the other end",
  tags: ["gate", "one-way", "shortcut", "hurdle", "barrier", "lock", "loop"],
  props: { id: "lock id", a: "room it is shut against", b: "room it opens from", how: "link kind (gate, hurdle-gate)", side: "wall of a", at: "cell along that wall", what: "what the player sees", opener: "why it will not open from a", taught: "where the player sees it first" },
  footprint: { kind: "edge" },
  topology: { under: ["Shelf", "Cave"], takes: [], joins: ["Hollow"], emits: ["link", "lock"] },
  twins: ["plan/Gate", "seacave/SeaGate", "sewer/Sluice"],
  pitfalls: ["b must be reachable another way, or the gate's far side is never met", "sets key_lives only: unlike plan/Gate it does not write opens_from, pass opens_from={b} if the lock reader needs it"],
};

OneWayGate.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
