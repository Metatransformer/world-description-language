// cave kit · Daylight
import { h } from "../../lib/react.mjs";
import { Light } from "../common/Light.mjs";

// Daylight({ at, y }): the sky behind you at the mouth; the last real light
export const Daylight = ({ at = (r) => r.center.side("s", 1), y = 3.6, meaning = "the sky behind you; the last real light" }) => Light({ kind: "daylight", at, y, meaning });

export const meta = {
  layer: "light",
  is: "grey sky light falling in at a cave mouth or a roof crack: the last real light before the dark",
  tags: ["light", "daylight", "sky", "mouth", "entrance", "shaft"],
  props: { at: "spot (default 1 cell south of centre: the mouth side)", y: "light height metres (3.6)", meaning: "why it is here" },
  footprint: { kind: "point", height: 3.6 },
  topology: { under: ["In"], takes: [], joins: [], emits: ["light"] },
  twins: ["common/Light", "seacave/Skylight", "sewer/GrateShaft"],
  pitfalls: ["the default spot assumes the mouth opens south; give at for any other side", "in a deep room it reads as a lamp, so keep it to mouths and roof cracks"],
};

Daylight.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
