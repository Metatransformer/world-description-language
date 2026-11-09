// seacave kit · Strongbox
import { h } from "../../lib/react.mjs";

// Strongbox({ at, name, table, prop, why }): a container the crew keeps something in
export const Strongbox = ({ at, name, table = "box-dungeon-sack", prop = "box", why }) => h("loot", { kind: "container", at, prop, name, table, why });

// meta card (lib/meta.mjs)
export const meta = {
  layer: "loot",
  is: "a strongbox, sea chest or ledger box the crew keep their take in, searchable for loot",
  tags: ["seacave", "loot", "chest", "strongbox", "container", "treasure", "box"],
  props: {"at": "spot", "name": "its name on the prompt", "table": "loot table (box-dungeon-sack)", "prop": "container prop (box)", "why": "why it is here"},
  footprint: { kind: "point" },
  topology: { under: ["In"], takes: [], joins: [], emits: ["loot"] },
  twins: ["masonry/Cache", "hall/Coffer", "hall/GuildChest", "wilds/Chest", "crypt/GraveGoods"],
  pitfalls: ["it is a loot container, not a held quest chest: a quest-named chest is Kept", "the default table is a sack's worth: name a richer table for a boss's chest"],
};

Strongbox.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
