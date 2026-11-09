// hall kit · HallContext
import { createContext } from "../../lib/react.mjs";

// HallContext: what every hall piece reads: place, floor height, origin [x, z], kits module
export const HallContext = createContext({ place: null, floor: 0.12, at: [0, 0], kits: "templates/kits.js" }, "hall");

// the card: what this component means, for picking and reasoning (contract: lib/meta.mjs)
export const meta = {
  layer: "context",
  is: "the shared frame of a building interior (its place, floor height and origin) that every hall piece reads",
  tags: ["context", "hall", "interior"],
  props: {},
  footprint: { kind: "none" },
  topology: { under: [], takes: [], joins: [], emits: [] },
  twins: ["wilds/WildsContext"],
  pitfalls: ["provide it through Interior and Wing, not by hand"],
};
