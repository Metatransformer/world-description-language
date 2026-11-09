// seacave kit · Tideline
import { h } from "../../lib/react.mjs";

// Tideline({ at, height, width, meaning }): the salt mark the sea leaves on a wall
export const Tideline = ({ at, height = 1.7, width = 3.2, meaning }) => h("place", { kind: "tideline", at, height, width, meaning });

// meta card (lib/meta.mjs)
export const meta = {
  layer: "dressing",
  is: "a tideline: the wet salt-and-weed band the high water leaves on a cave wall, showing how far the sea rises",
  tags: ["seacave", "tideline", "water", "mark", "salt", "clue", "wall"],
  props: {"at": "spot on a wall", "height": "how high the mark runs m (1.7)", "width": "band width m (3.2)", "meaning": "what it tells the player"},
  footprint: { kind: "point", height: 1.7 },
  topology: { under: ["In"], takes: [], joins: [], emits: ["prop"] },
  twins: ["sewer/Seep", "sewer/Wet"],
  pitfalls: ["put it against a wall (r.wall), not the room's middle", "it only dresses: it floods nothing"],
};

Tideline.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
