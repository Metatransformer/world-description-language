// cave kit · ShelfContext
import { LevelContext } from "../plan/index.mjs";

// the cave's words for the shared plan kit (./plan.mjs): a shelf is a level, a hollow a space, a lair the boss's space
export const ShelfContext = LevelContext;

export const meta = {
  layer: "context",
  is: "the current cave shelf (level number and floor) that every hollow under it reads",
  tags: ["cave", "level", "context", "provider"],
  props: { value: "{ n, floor }: level number and floor y metres" },
  footprint: { kind: "none" },
  topology: { under: [], takes: ["Hollow", "Lair"], joins: [], emits: [] },
  twins: ["plan/LevelContext", "mine/LevelContext", "crypt/TierContext"],
  pitfalls: ["provide it through Shelf, not by hand: Shelf also writes the level row the map needs"],
};
