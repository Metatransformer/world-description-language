// seacave kit · Lantern
import { h } from "../../lib/react.mjs";
import { Light } from "../common/Light.mjs";

// Lantern({ at, y, meaning }): a lantern on a hook
export const Lantern = ({ at, y = 2.4, meaning }) => Light({ kind: "lamp", at, y, meaning });

// meta card (lib/meta.mjs)
export const meta = {
  layer: "light",
  is: "a lantern hung on an iron hook by the people who use the cave: warm, steady work light",
  tags: ["seacave", "lantern", "lamp", "light", "hook", "warm"],
  props: {"at": "spot: a room-spot function (r) => r.center, a Loc or { u, v }", "y": "height above the floor m (default 2.4)", "meaning": "why this light is here, in a player's words"},
  footprint: { kind: "point", height: 2.4 },
  topology: { under: ["In"], takes: [], joins: [], emits: ["light"] },
  twins: ["common/Light", "sewer/Torch", "sewer/Candles", "hall/Lamp", "wilds/Lamp"],
  pitfalls: ["a lantern is people's light: a wild grotto wants SeaGlow or Skylight", "y is above the floor, not world height"],
};

Lantern.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
