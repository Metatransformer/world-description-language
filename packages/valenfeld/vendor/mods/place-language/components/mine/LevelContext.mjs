// mine kit · LevelContext
import { createContext } from "../../lib/react.mjs";

// the level a working sits on flows down the tree: its number, its floor, its vein
export const LevelContext = createContext({ n: 1, floor: 0, vein: null }, "mine-level");

// meta card (lib/meta.mjs)
export const meta = {
  layer: "context",
  is: "the mine level a working stands on, passed down the tree: its number, floor height and the vein being followed",
  tags: ["mine", "context", "level", "floor", "vein"],
  props: { n: "level number", floor: "floor height m", vein: "the vein's name or null" },
  footprint: { kind: "none" },
  topology: { under: [], takes: [], joins: [], emits: [] },
  twins: ["plan/LevelContext", "crypt/TierContext", "cave/ShelfContext"],
  pitfalls: ["provided by Mine, Dig and Level; read it with useContext, never write rows from it", "default is level 1, floor 0, no vein when no provider stands above"],
};
