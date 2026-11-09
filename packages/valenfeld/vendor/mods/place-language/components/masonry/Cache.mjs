// masonry kit · Cache
import { h } from "../../lib/react.mjs";
import { Hold } from "./Hold.mjs";

// Cache({ id, at, why }): a chest the place left for someone, held as authored.
export const Cache = ({ id, at, why = "a cache" }) => h(Hold, { id, at, why });

export const meta = {
  layer: "loot",
  is: "a chest the place left for someone, kept exactly as authored",
  tags: ["cache", "chest", "loot", "held", "stash"],
  props: { id: "id of the live chest row", at: "semantic spot", why: "who left it and why" },
  footprint: { kind: "point" },
  topology: { under: ["Chamber"], takes: [], joins: [], emits: ["hold"] },
  twins: ["seacave/Strongbox", "hall/Coffer", "wilds/Chest", "crypt/GraveGoods"],
  pitfalls: ["it is a held row, not a loot table: for a fresh rolled chest use a loot row (seacave/Strongbox, crypt/GraveGoods)", "the id must already stand in the live build"],
};

Cache.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
