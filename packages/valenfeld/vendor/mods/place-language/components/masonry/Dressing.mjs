// masonry kit · Dressing
import { h } from "../../lib/react.mjs";

// Dressing({ kinds, why }): what this room is dressed with; the build checks each kind stands inside it.
export const Dressing = ({ kinds, why }) => h("dress", { kinds, why });

export const meta = {
  layer: "dressing",
  is: "the list of what a room is dressed with (straw, chains, drips), checked to stand inside it at build",
  tags: ["dressing", "clutter", "props", "check", "kinds"],
  props: { kinds: "prop kinds expected in this room", why: "why the room holds them" },
  footprint: { kind: "none" },
  topology: { under: ["Chamber"], takes: [], joins: [], emits: ["dress"] },
  twins: ["sewer/Wet", "sewer/Drip"],
  pitfalls: ["it places nothing: it names kinds the clutter/hand layers must place, and the build flags kinds that do not stand inside"],
};

Dressing.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
