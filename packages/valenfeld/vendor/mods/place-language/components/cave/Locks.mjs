// cave kit · Locks
import { h, Fragment } from "../../lib/react.mjs";

// the cave's locks in the order the program names them
export const Locks = ({ children }) => h(Fragment, null, children);

export const meta = {
  layer: "context",
  is: "a plain group that keeps a cave's barriers together in the order the program names them",
  tags: ["cave", "locks", "group", "barriers"],
  props: { children: "Rockfall, OneWayGate or other barriers" },
  footprint: { kind: "none" },
  topology: { under: ["Cave"], takes: ["Rockfall", "OneWayGate"], joins: [], emits: [] },
  twins: [],
  pitfalls: ["writes nothing: order only matters to the reader, the rooms each barrier names must already exist"],
};

Locks.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
