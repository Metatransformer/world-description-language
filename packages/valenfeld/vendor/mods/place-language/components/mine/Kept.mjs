// mine kit · Kept
import { Hold } from "../plan/Hold.mjs";

// Kept({ id, uv | at, why }): an authored row held where it stands
export const Kept = ({ id, ...p }) => Hold({ id, keyAs: `kept-${id}`, ...p });   // the shared plan/Hold

// meta card (lib/meta.mjs)
export const meta = {
  layer: "placement",
  is: "an authored thing (a set piece, a quest object, a herb) kept exactly where it already stands when a place is re-described",
  tags: ["as-built", "hold", "kept", "authored", "set-piece", "quest"],
  props: { id: "the existing row's id", in: "room id: required (Cut passes no room down; only a room host like Working does)", at: "where: room spot fn, { u, v } or [x, z]", uv: "{ u, v } spot", y: "height m", why: "why it is held" },
  footprint: { kind: "point" },
  topology: { under: ["Cut", "Working"], takes: [], joins: [], emits: ["thing"] },
  twins: ["plan/Hold", "seacave/Kept", "masonry/Hold"],
  pitfalls: ["the id must match a row that exists in the place's hand file, or the build has nothing to carry", "two Kept with one id write two rows", "under a Cut give in=; the Cut does not hand its room down", "for a fresh prop use place, not Kept"],
};

Kept.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
