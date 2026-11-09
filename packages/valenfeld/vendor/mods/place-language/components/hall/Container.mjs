// hall kit · Container
import { useHall, row, pos } from "./_shared.mjs";

// Container({ id, kind: barrel|crate|sack, at, yaw, table, name }): a house container a thief can search
export function Container({ id, kind, at, y, yaw = 0, table = `box-${kind}`, name = kind[0].toUpperCase() + kind.slice(1), act = "Search", why }) {
  const hall = useHall();
  return row(id, { overrides: { feetPosition: pos(hall, at, y), physics: "static", primitive: { kind: "scripted", params: { kind }, script: "scripts/gen/prop.js" },
    rotation: yaw, "state.act": act, "state.name": name, "state.table": table, tags: ["interactable", "container"] }, template: `${hall.kits}#prop` }, why);
}

// the card: what this component means, for picking and reasoning (contract: lib/meta.mjs)
export const meta = {
  layer: "loot",
  is: "an ordinary barrel, crate or sack in a house that a player can search for small things",
  tags: ["barrel", "crate", "sack", "container", "search", "storage", "loot", "steal"],
  props: { id: "row id", kind: "barrel | crate | sack (also its mesh and default table box-<kind>)", at: "[x, z] m", y: "height m (default the floor; a cellar is below it)", yaw: "facing, degrees", table: "loot table (default box-<kind>)", name: "prompt name (default the kind, capitalised)", act: "prompt verb (default Search)", why: "a note of why it stands here (shown in the design view)" },
  footprint: { kind: "point", cells: [1, 1], height: 1 },
  topology: { under: ["Interior", "Wing"], takes: [], joins: [], emits: ["row"] },
  twins: ["wilds/CampProp", "seacave/Prop", "sewer/Barrels", "sewer/Crates"],
  pitfalls: ["kind is required (its name and table come from it)", "a cellar container needs its negative y written, the floor default puts it upstairs", "sewer Barrels/Crates are dungeon dressing on the grid; this is one searchable row in metres"],
};

Container.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
