// wilds kit · WildsContext
import { createContext } from "../../lib/react.mjs";

// WildsContext: what every wilds piece reads: the root id (its parent), kits module, current site
export const WildsContext = createContext({ id: null, kits: "templates/kits.js", site: null }, "wilds");

// the card: what this component means, for picking and reasoning (contract: lib/meta.mjs)
export const meta = {
  layer: "context",
  is: "the shared frame of a wilds region (its root id and kits) that every wilds piece reads",
  tags: ["context", "wilds", "region"],
  props: {},
  footprint: { kind: "none" },
  topology: { under: [], takes: [], joins: [], emits: [] },
  twins: ["hall/HallContext"],
  pitfalls: ["provide it through Wilds and Site, not by hand"],
};
