// masonry kit · Hold
import { Hold as SharedHold } from "../plan/Hold.mjs";

// Hold({ id, at, why }): an authored row carried whole from what stands (a quest object, a door, a set piece), re-anchored semantically.
export const Hold = ({ id, at, why, y }) => SharedHold({ id, at, why, ...(y != null ? { y } : {}) });   // the shared plan/Hold, key = id

export const meta = {
  layer: "placement",
  is: "an authored thing (a quest object, a set piece) kept exactly as it stands and re-anchored at a named spot",
  tags: ["hold", "keep", "authored", "set-piece", "quest", "carry"],
  props: { id: "id of the live row", at: "semantic spot (a function of the room)", why: "why it is kept by hand", y: "height metres override" },
  footprint: { kind: "point" },
  topology: { under: ["Chamber"], takes: [], joins: [], emits: ["hold"] },
  twins: ["mine/Kept", "seacave/Kept", "wilds/Keep", "hall/Keep", "sewer/Grate"],
  pitfalls: ["the spec is copied from the live build by id: a typo carries nothing", "no at and no room = it lands at the origin"],
};

Hold.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
