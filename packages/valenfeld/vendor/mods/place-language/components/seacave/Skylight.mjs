// seacave kit · Skylight
import { h } from "../../lib/react.mjs";
import { Light } from "../common/Light.mjs";

// Skylight({ at, y, meaning }): daylight through a crack in the roof
export const Skylight = ({ at, y = 3, meaning }) => Light({ kind: "daylight", at, y, meaning });

// meta card (lib/meta.mjs)
export const meta = {
  layer: "light",
  is: "a slot of daylight falling through a crack in the cave roof or off the sea's mouth",
  tags: ["seacave", "daylight", "sky", "light", "crack", "mouth"],
  props: {"at": "spot: a room-spot function (r) => r.center, a Loc or { u, v }", "y": "height above the floor m (default 3)", "meaning": "why this light is here, in a player's words"},
  footprint: { kind: "point", height: 3 },
  topology: { under: ["In"], takes: [], joins: [], emits: ["light"] },
  twins: ["common/Light", "cave/Daylight"],
  pitfalls: ["only where the sky or the sea's mouth plausibly reaches: deep tides stay dark", "pair it with the room's entry or opening"],
};

Skylight.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
