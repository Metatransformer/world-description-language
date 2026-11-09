// wilds kit · Chest
import { piece } from "./_shared.mjs";

// Chest({ name, at, yaw, gold, tier, level, table }): a chest left in the wilds
export const Chest = ({ name, at, yaw, gold, tier = 1, level, table, why }) => piece("chest", name, { at, yaw, shade: false,
  state: { act: "Open", container: { kind: "chest", level, tier }, gold, name: "Chest", prompt: "Search", table }, tags: ["interactable", "container"], why });

// the card: what this component means, for picking and reasoning (contract: lib/meta.mjs)
export const meta = {
  layer: "loot",
  is: "a chest left out in the wilds (in a ruin, a camp) whose loot scales to the region's tier",
  tags: ["chest", "loot", "treasure", "container", "gold", "ruin"],
  props: { name: "suffix: the row is <wilds id>/<name>", at: "[x, y, z] m in the Wilds root's frame (y is ground height there: read it off the terrain)", yaw: "facing, degrees", gold: "gold inside", tier: "loot tier (default 1)", level: "lock/loot level", table: "loot table id", why: "a note of why it stands here (shown in the design view)" },
  footprint: { kind: "point", cells: [1, 1] },
  topology: { under: ["Wilds", "Site"], takes: [], joins: [], emits: ["row"] },
  twins: ["hall/Coffer", "masonry/Cache", "seacave/Strongbox", "crypt/GraveGoods"],
  pitfalls: ["it always reads \"Chest\" whatever its name", "tier above the region's makes early loot too rich"],
};

Chest.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
