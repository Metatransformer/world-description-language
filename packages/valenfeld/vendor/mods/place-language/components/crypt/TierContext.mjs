// crypt kit · TierContext
import { createContext } from "../../lib/react.mjs";

export const TierContext = createContext({ n: 1, floor: 0, heart: null, kit: "barrow" }, "barrow-tier");
