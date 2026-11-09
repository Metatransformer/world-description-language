// mine kit · Cut
import { h, Fragment, useContext } from "../../lib/react.mjs";
import { LevelContext } from "./LevelContext.mjs";

// Cut({ id, rect, name, kind, purpose, level?, floor? }): one room as it already stands, no shell of its own
export function Cut({ id, level, children, ...p }) {
  const lv = useContext(LevelContext);
  return h(Fragment, null, h("room", { key: id, id, level: level ?? lv.n, ...p }), children);
}

// meta card (lib/meta.mjs)
export const meta = {
  layer: "space",
  is: "one room of an existing dig as it already stands: a bare room row on the current level with no shell or dressing of its own",
  tags: ["mine", "as-built", "room", "cut", "bare", "harvest"],
  props: { id: "room id", rect: "[x, z, w, d] cells", name: "player-facing name", kind: "room kind (entry, hall, flooded, boss ...)", purpose: "design note", level: "level number (default: context)", floor: "floor m", height: "ceiling m" },
  footprint: { kind: "room", cells: [8, 8], height: 4 },
  topology: { under: ["Dig", "Level"], takes: [], joins: ["Tunnel", "Seal"], emits: ["room"] },
  twins: ["plan/Space", "masonry/Chamber"],
  pitfalls: ["no shell, walls or kit: without a kits layer it is an empty box", "floor does not default to the Level's floor (only level does)", "children are not placed in it: Kept/Foe rows need in= naming the cut", "for a new dressed mine room use Working"],
};

Cut.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
