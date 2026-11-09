// hall kit · Stock
import { h, Fragment } from "../../lib/react.mjs";
import { nth } from "./_shared.mjs";
import { Container } from "./Container.mjs";
import { Coffer } from "./Coffer.mjs";

// Stock({ prefix, from, named, items }): the house's numbered barrels, crates, sacks and chests a thief can search, where they were set down
export function Stock({ prefix, from = 1, named = true, y, items = [] }) {
  return h(Fragment, null, items.map((it, i) => {
    const { kind, ...p } = Array.isArray(it) ? { kind: it[0], at: it[1], yaw: it[2] } : it;
    const id = nth(prefix, from + i, named ? kind : null);
    return kind === "chest" ? h(Coffer, { key: id, id, y, ...p }) : h(Container, { key: id, id, kind, y, ...p });
  }));
}

// the card: what this component means, for picking and reasoning (contract: lib/meta.mjs)
export const meta = {
  layer: "loot",
  is: "the household's stores: barrels, crates, sacks and chests set down about the place, each one searchable",
  tags: ["stock", "stores", "barrels", "crates", "sacks", "chest", "storage", "containers", "search", "thief"],
  props: { prefix: "id stem", from: "the first number (default 1)", named: "true (default): ids are <prefix>-<kind>-<n>; false: <prefix>-<n>", y: "height m for all (default the room's floor)", items: "[[kind, [x, z], yaw], …] or [{ kind, at, yaw, y, name, table }, …]; kind barrel | crate | sack | chest" },
  footprint: { kind: "area", cells: [4, 4] },
  topology: { under: ["Interior", "Room", "Cellar", "Wing"], takes: [], joins: [], emits: ["row"] },
  twins: ["plan/Stores", "sewer/Barrels", "sewer/Crates", "verbs/clutter", "hall/Container", "hall/Coffer"],
  pitfalls: ["numbers run in list order across kinds (chest-1, barrel-2, crate-3): reorder the list and the ids move", "hand-placed spots: nothing keeps them off a wall or a door; check them in the hall", "a members-only chest is GuildChest, not stock"],
};

Stock.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
