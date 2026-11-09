// seacave kit · SeaGate
import { h, Fragment } from "../../lib/react.mjs";
import { Barrier as CommonBarrier } from "../common/Barrier.mjs";

// SeaGate({ id, a, b, where, side, at, what, act, name, barred, opened, taught }): ship's-timber gate on the way a→b, barred from
// a's side (the sea side): it lifts only from a. where is the room that sees it shut (the side you meet it from first).
export const SeaGate = ({ id, a, b, where = b, side, at, act = "Unbar", name = "the sea-gate", ...lk }) => CommonBarrier({ id, a, b, side, at, how: "sea-gate", tag: "seagate", where, act, name, key_lives: a, opens_from: a, ...lk });

// meta card (lib/meta.mjs)
export const meta = {
  layer: "relation",
  is: "a ship's-timber sea-gate barred from the sea side: shut when you first meet it, it lifts only once you come round to the water side, then stands as a shortcut",
  tags: ["seacave", "gate", "shortcut", "barred", "one-way", "lock", "door"],
  props: {"id": "lock id", "a": "room on the sea side (the only side it lifts from)", "b": "room on the other side", "where": "room that sees it shut first (default b)", "side": "a's wall", "at": "coordinate in cells along that wall", "act": "verb on the prompt (Unbar)", "name": "its name (the sea-gate)", "what": "what it is", "opener": "what opens it", "taught": "where the player learns it", "barred": "text while shut", "opened": "text once open"},
  footprint: { kind: "edge" },
  topology: { under: ["Cove", "Tide"], takes: [], joins: ["Grotto"], emits: ["link", "lock"] },
  twins: ["common/Barrier", "plan/Gate", "cave/OneWayGate", "sewer/Sluice", "plan/Barrier"],
  pitfalls: ["a must be reachable by another route or b's side is a dead end forever", "key_lives is set to a: don't pass key_lives", "it writes its own link: don't also link a and b"],
};

SeaGate.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
