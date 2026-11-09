// hall kit · Coffer
import { useHall, row, pos } from "./_shared.mjs";

// Coffer({ id, at, yaw, table, name }): a chest that belongs to the house
export function Coffer({ id, at, y, yaw = 0, table = "box-house-chest", name = "Chest", why }) {
  return row(id, { feetPosition: pos(useHall(), at, y), id, physics: "static", primitive: { kind: "scripted", params: {}, script: "scripts/gen/chest.js" },
    rotation: yaw, state: { act: "Open", name, table }, tags: ["interactable", "container"] }, why);
}

// the card: what this component means, for picking and reasoning (contract: lib/meta.mjs)
export const meta = {
  layer: "loot",
  is: "a chest that belongs to whoever lives here: anyone can open it, and what is in it is theirs to steal",
  tags: ["chest", "coffer", "container", "loot", "house", "steal", "owned"],
  props: { id: "row id", at: "[x, z] m", y: "height m (default the floor)", yaw: "facing, degrees", table: "loot table id (default box-house-chest)", name: "prompt name (default Chest)", why: "a note of why it stands here (shown in the design view)" },
  footprint: { kind: "point", cells: [1, 1] },
  topology: { under: ["Interior", "Wing"], takes: [], joins: [], emits: ["row"] },
  twins: ["wilds/Chest", "masonry/Cache", "seacave/Strongbox", "crypt/GraveGoods"],
  pitfalls: ["it opens for anyone: a chest only members may open is GuildChest", "table must exist in the loot tables or it opens empty"],
};

Coffer.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
