// hall kit · Bed
import { useHall, row, pos } from "./_shared.mjs";

// Bed({ id, at, y, name }): a bed you can sleep in
export function Bed({ id, at, y, name, why }) {
  return row(id, { feetPosition: pos(useHall(), at, y), id, state: { act: "Sleep in", bed: true, name }, tags: ["interactable"] }, why);
}

// the card: what this component means, for picking and reasoning (contract: lib/meta.mjs)
export const meta = {
  layer: "mechanism",
  is: "a bed a player may sleep in for free (their own, or one in a hall they belong to)",
  tags: ["bed", "sleep", "rest", "bunk", "free", "furniture"],
  props: { id: "row id", at: "[x, z] m", y: "height m (default the floor; an upper bunk sits higher)", name: "what the prompt calls it (\"Brannoc's bed (he won't notice)\")", why: "a note of why it stands here (shown in the design view)" },
  footprint: { kind: "point", cells: [1, 1] },
  topology: { under: ["Interior", "Wing", "BunkRow"], takes: [], joins: [], emits: ["row"] },
  twins: [],
  pitfalls: ["it is only the sleep spot (no mesh): the bed frame must already stand in the shell or a Keep", "free sleep: a bed someone sells is InnBed"],
};

Bed.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
