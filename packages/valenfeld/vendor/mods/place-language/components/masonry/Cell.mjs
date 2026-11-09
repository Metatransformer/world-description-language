// masonry kit · Cell
import { h } from "../../lib/react.mjs";

// Cell({ id, uv, note }): one cell of a block, held as it stands (its bars, light and glimmer ride with it). Harvested: prison cellblock.
export const Cell = ({ id, uv, note = "a cell" }) => h("hold", { key: id, id, uv, note });

export const meta = {
  layer: "placement",
  is: "one prison cell of a block, carried whole as it stands with its bars, lamp and glimmer",
  tags: ["cell", "prison", "gaol", "held", "bars", "authored"],
  props: { id: "id of the authored row in the live build", uv: "[u, v] fraction across its room", note: "what this cell is" },
  footprint: { kind: "area", cells: [2, 2] },
  topology: { under: ["Chamber"], takes: [], joins: [], emits: ["hold"] },
  twins: ["sewer/Grate", "mine/Kept", "seacave/Kept"],
  pitfalls: ["it builds nothing new: the id must already stand in the live build, or the compiled cell is empty", "uv needs a room: put it inside a Chamber"],
};

Cell.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
