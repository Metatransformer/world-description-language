// seacave kit · SeaGlow
import { h } from "../../lib/react.mjs";
import { Light } from "../common/Light.mjs";

// SeaGlow({ at, y, meaning }): green light from under the water
export const SeaGlow = ({ at = (r) => r.center, y = 0.4, meaning }) => Light({ kind: "seaglow", at, y, meaning });

// meta card (lib/meta.mjs)
export const meta = {
  layer: "light",
  is: "sea-glow: cold green light rising from under the water of a flooded grotto or blowhole",
  tags: ["seacave", "glow", "water", "green", "light", "eerie", "pool"],
  props: {"at": "spot (default the room's centre)", "y": "height above the floor m (default 0.4)", "meaning": "why this light is here, in a player's words"},
  footprint: { kind: "point", height: 0.4 },
  topology: { under: ["In"], takes: [], joins: [], emits: ["light"] },
  twins: ["common/Light", "cave/Glow", "cave/Fungus"],
  pitfalls: ["it belongs over water: on dry shingle it reads as a bug", "y stays low (under 0.5) or it floats"],
};

SeaGlow.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
