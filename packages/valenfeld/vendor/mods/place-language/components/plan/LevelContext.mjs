// plan kit · LevelContext
import { createContext } from "../../lib/react.mjs";

// the level a space sits on flows down the tree: its number and its top floor
export const LevelContext = createContext({ n: 1, floor: 0 }, "plan-level");
