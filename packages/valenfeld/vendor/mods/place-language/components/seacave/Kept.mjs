// seacave kit · Kept
import { Hold } from "../plan/Hold.mjs";

// Kept({ id, at, y, why }): a standing set piece carried whole by id and re-seated (a wreck's hull, a quest chest)
export const Kept = ({ id, ...p }) => Hold({ id, keyAs: `kept-${id}`, ...p });   // the shared plan/Hold

// meta card (lib/meta.mjs)
export const meta = {
  layer: "placement",
  is: "an authored set piece (a wreck's hull, a quest chest) carried whole by id from what already stands and re-seated at a spot in the room",
  tags: ["seacave", "as-built", "hold", "kept", "authored", "set-piece", "quest"],
  props: {"id": "the existing row's id", "at": "spot: room-spot function, Loc or { u, v }", "y": "height m", "why": "why it is held"},
  footprint: { kind: "point" },
  topology: { under: ["In"], takes: [], joins: [], emits: ["thing"] },
  twins: ["plan/Hold", "mine/Kept", "masonry/Hold"],
  pitfalls: ["the id must exist in the place's hand rows or nothing is carried", "outside an In room= it needs in="],
};

Kept.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
