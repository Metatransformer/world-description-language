// seacave kit · Brazier
import { h } from "../../lib/react.mjs";

// Brazier({ at, y, meaning }): a fire in an iron basket
export const Brazier = ({ at, y = 1, meaning }) => h("light", { kind: "brazier", at, y, ...(meaning ? { meaning } : {}) });

// meta card (lib/meta.mjs)
export const meta = {
  layer: "light",
  is: "a brazier: a fire burning in an iron basket where the crew stand guard",
  tags: ["seacave", "brazier", "fire", "light", "guard", "warm"],
  props: {"at": "spot: a room-spot function (r) => r.center, a Loc or { u, v }", "y": "height above the floor m (default 1)", "meaning": "why this light is here, in a player's words"},
  footprint: { kind: "point", height: 1 },
  topology: { under: ["In"], takes: [], joins: [], emits: ["light"] },
  twins: ["sewer/Torch", "hall/Lamp"],
  pitfalls: ["a floor fire: keep it off the walking line and out of doorways", "one per guard room reads right; more turns it into a camp"],
};

Brazier.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
