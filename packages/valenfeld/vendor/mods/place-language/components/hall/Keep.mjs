// hall kit · Keep
import { row } from "./_shared.mjs";
import { fires } from "./fires.mjs";

// Keep({ id, spec, why }): a one-of-a-kind row carried whole (a hall shell, a fire, a book with its text)
export const Keep = ({ id, spec, why }) => row(id, fires(spec), why, "hold");   // "@fire/<name>" fx resolve from fires.mjs

// the card: what this component means, for picking and reasoning (contract: lib/meta.mjs)
export const meta = {
  layer: "dressing",
  is: "a one-of-a-kind thing kept exactly as it was built (the hall's shell, the hearth fire, a book with its text) because no word in the kit says it yet",
  tags: ["keep", "hold", "held", "authored", "one-off", "set-piece", "book", "shell"],
  props: { id: "the row's id (stays the scene id)", spec: "the whole scene row, as it stands (usually from <place>.held.json)", why: "a note of why it stands here (shown in the design view)" },
  footprint: { kind: "point" },
  topology: { under: ["Interior", "Wing"], takes: [], joins: [], emits: ["row"] },
  twins: ["wilds/Keep", "masonry/Hold", "mine/Kept", "seacave/Kept"],
  pitfalls: ["the spec is not re-seated: Wing at and Interior floor do not move it", "two Keeps of the same thing are the sign a component is missing: write the component instead", "editing the held json, not the tree, is the only way to change it"],
};

Keep.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
