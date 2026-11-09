// wilds kit · Tower
import { piece } from "./_shared.mjs";

// Tower({ name, at, yaw }): a broken stone tower
export const Tower = ({ name, at, yaw, why }) => piece("tower", name, { at, yaw, why });

// the card: what this component means, for picking and reasoning (contract: lib/meta.mjs)
export const meta = {
  layer: "space",
  is: "a ruined stone watchtower standing broken in the wilds, a landmark with something left inside",
  tags: ["tower", "ruin", "watchtower", "landmark", "stone", "broken"],
  props: { name: "suffix: the row is <wilds id>/<name>", at: "[x, y, z] m in the Wilds root's frame (y is ground height there: read it off the terrain)", yaw: "facing, degrees", why: "a note of why it stands here (shown in the design view)" },
  footprint: { kind: "point", cells: [3, 3] },
  topology: { under: ["Wilds", "Site"], takes: [], joins: [], emits: ["row"] },
  twins: [],
  pitfalls: ["its loot and light are separate rows (Chest, Lamp) placed inside its walls by hand", "it is one shape: no floors to climb"],
};

Tower.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
