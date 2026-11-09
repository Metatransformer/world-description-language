// wilds kit · RuinedWatchtower: a broken stone watchtower with a lamp burning at its top and a chest at its foot.
import { h, Fragment } from "../../lib/react.mjs";
import { Site } from "./Site.mjs";
import { Tower } from "./Tower.mjs";
import { Lamp } from "./Lamp.mjs";
import { Chest } from "./Chest.mjs";
export function RuinedWatchtower({ id, at, yaw = 0, prefix = "ruin", chest = { gold: 25, tier: 1, level: 10, table: "chest-roadside", at: [0, 0.31624959914203595, 1.3] }, lamp = { color: "oklch(0.82 0.11 70)", intensity: 6, distance: 9, at: [0, 2.6, 0] }, children }) {
  return h(Site, { id, at }, h(Fragment, null,
    chest ? h(Chest, { name: `${prefix}-chest`, ...chest }) : null,
    lamp ? h(Lamp, { name: `${prefix}-lamp`, ...lamp }) : null,
    h(Tower, { name: `${prefix}-tower`, at: [0, 0, 0], yaw }), children ?? null));
}
export const meta = {
  layer: "meaning",
  is: "a ruined stone watchtower in the wilds with a warm lamp at its top that reads from afar and a loot chest at its foot",
  tags: ["tower", "watchtower", "ruin", "landmark", "lamp", "chest", "loot", "site", "wilds"],
  props: { id: "content/site id", at: "[x, y, z] of the tower's foot in the Wilds frame", yaw: "degrees", chest: "Chest props (at in tower metres) or null", lamp: "Lamp props (at in tower metres) or null", children: "extra pieces in tower metres" },
  footprint: { kind: "point", cells: [3, 3], height: 8 },
  topology: { under: ["Wilds"], takes: ["pieces"], joins: ["a path to the nearest road"], emits: ["row"] },
  twins: ["things/RuinTower"], pitfalls: [],
};
RuinedWatchtower.meta = meta;
