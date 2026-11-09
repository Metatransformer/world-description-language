// common · Level: one storey of a dungeon, its rooms sharing its number and floor through the kit's context
import { h, Fragment, useContext } from "../../lib/react.mjs";
// Level({ context, n, name, floor: y | [top, bottom], note }, children): a level row, and context carries n and the top floor down
export function Level({ context, n, name, floor, note, children }) {
  const up = useContext(context), f = Array.isArray(floor) ? floor : [floor, floor];
  return h(Fragment, null, h("level", { key: `level-${n}`, n, name, floor: f, note }),
    h(context.Provider, { value: { ...up, n, floor: f[0] } }, children));
}
export const meta = {
  layer: "space",
  is: "one storey or step down of a dungeon (a shelf, a tide level, a ring of the mound): its rooms share its number and floor height",
  tags: ["level", "storey", "floor", "depth", "tier", "shelf", "common"],
  props: { context: "the kit's level context (plan LevelContext, mine LevelContext, crypt TierContext): what its rooms read", n: "level number (1 = top)", name: "name on the map", floor: "floor m: one y or [top, bottom]; rooms stand on top", note: "designer's note" },
  footprint: { kind: "none" },
  topology: { under: ["Plan", "Mine", "Barrow"], takes: ["Space", "Working", "Burial", "In"], joins: [], emits: ["level"] },
  twins: ["plan/Level", "mine/Level", "crypt/Tier", "cave/Shelf", "seacave/Tide", "sewer/Depth"],
  pitfalls: ["the context must be the one the kit's rooms read, or they keep the outer floor", "two Levels with the same n write two level rows"],
};
Level.meta = meta;
