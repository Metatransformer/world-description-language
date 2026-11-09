// cave kit · Fungus
import { h } from "../../lib/react.mjs";
import { Light } from "../common/Light.mjs";

// ---- the dressing pass ------------------------------------------------------------------------------------------------------
// Fungus({ at, y, meaning }): pale cave-fungus glow where the wet runs down: the light a cave has when nobody lives in it
export const Fungus = ({ at, y = 1.2, meaning }) => Light({ kind: "fungus", at, y, meaning });

export const meta = {
  layer: "light",
  is: "a pale patch of cave fungus glowing where the wet runs down, the only light in a cave nobody lives in",
  tags: ["light", "fungus", "glow", "cave", "natural", "dim"],
  props: { at: "spot: a function of the room or a near() handle", y: "height metres on the wall (1.2)", meaning: "why it is here" },
  footprint: { kind: "point", height: 1.2 },
  topology: { under: ["In"], takes: [], joins: [], emits: ["light"] },
  twins: ["common/Light", "seacave/SeaGlow"],
  pitfalls: ["no at = no position: unlike Daylight it has no default spot", "for several corner patches use Glow"],
};

Fungus.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
