// hall kit · ArcaneLamp
import { useHall, row, pos } from "./_shared.mjs";

// ArcaneLamp({ id, at, y }): a standing lamp of the arcane kit
export function ArcaneLamp({ id, at, y = 0, why }) {
  return row(id, { overrides: { feetPosition: pos(useHall(), at, y) }, template: "templates/arcane.js#arcaneLamp" }, why);
}

// the card: what this component means, for picking and reasoning (contract: lib/meta.mjs)
export const meta = {
  layer: "light",
  is: "a mage's standing lamp: a tall arcane lamp on the floor that glows and lights the room around it",
  tags: ["lamp", "arcane", "magic", "mages", "standing", "light"],
  props: { id: "row id", at: "[x, z] m", y: "height m (default 0, not the floor)", why: "a note of why it stands here (shown in the design view)" },
  footprint: { kind: "point", cells: [1, 1], height: 2 },
  topology: { under: ["Interior", "Wing"], takes: [], joins: [], emits: ["row", "light"] },
  twins: ["seacave/Lantern", "seacave/Brazier"],
  pitfalls: ["its look and light are the arcane template's: no colour or intensity props", "y defaults to 0, not the hall floor"],
};

ArcaneLamp.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
