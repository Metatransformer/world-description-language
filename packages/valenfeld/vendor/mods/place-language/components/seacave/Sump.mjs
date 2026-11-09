// seacave kit · Sump
import { h, Fragment } from "../../lib/react.mjs";

// Sump({ id, a, b, side, at, what, wheel_lives, name, barred, opened }): a passage flooded to the roof until a sluice wheel drains it
export const Sump = ({ id, a, b, side, at, wheel_lives, ...lk }) => h(Fragment, null, h("link", { a, b, side, at, how: "sump", lock: id }), h("lock", { id, style: "sump", key_lives: wheel_lives, ...lk }));

// meta card (lib/meta.mjs)
export const meta = {
  layer: "relation",
  is: "a sump: a passage flooded to the roof that cannot be passed until a sluice wheel somewhere else is turned and the water drains",
  tags: ["seacave", "sump", "flooded", "drain", "lock", "passage", "water", "sluice"],
  props: {"id": "lock id; the SluiceWheel names it with opens=", "a": "room on one side", "b": "room on the other", "side": "a's wall", "at": "coordinate in cells along that wall", "wheel_lives": "room id where the SluiceWheel stands", "what": "what the player sees", "name": "its name", "barred": "text while flooded", "opened": "text once drained", "taught": "where the player learns it"},
  footprint: { kind: "edge" },
  topology: { under: ["Cove", "Tide"], takes: [], joins: ["Grotto", "SluiceWheel"], emits: ["link", "lock"] },
  twins: ["sewer/Sluice", "sewer/FloodedRun", "mine/FloodedDrift", "plan/Barrier"],
  pitfalls: ["same idea as common/Barrier, kept apart: its link and lock carry no keys (ids by position) and the lock has no where, so folding it would rename saved rows", "without a SluiceWheel whose opens= is this id the sump never drains", "wheel_lives behind the sump softlocks", "teach it with a Tideline on a sump already drained"],
};

Sump.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
