// seacave kit · SluiceWheel
import { h } from "../../lib/react.mjs";

export const SluiceWheel = ({ at, opens, meaning, said, name = "the tide-sluice wheel" }) => h("place", { kind: "winch", at, opens, meaning, act: "Wind", name, ...(said ? { said } : {}) });

// meta card (lib/meta.mjs)
export const meta = {
  layer: "mechanism",
  is: "a tide-sluice wheel a player winds to drain a flooded sump elsewhere in the cave",
  tags: ["seacave", "wheel", "sluice", "winch", "drain", "lever", "mechanism"],
  props: {"at": "spot: room-spot function, Loc or { u, v }", "opens": "the Sump's lock id it drains", "name": "its name (the tide-sluice wheel)", "meaning": "why it is here", "said": "line shown when wound"},
  footprint: { kind: "point" },
  topology: { under: ["In"], takes: [], joins: ["Sump"], emits: ["prop"] },
  twins: ["sewer/Sluice"],
  pitfalls: ["opens must match a Sump id exactly", "stand it in the Sump's wheel_lives room or the lock's clue points wrong", "keep it off the walking line: at a wall"],
};

SluiceWheel.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
