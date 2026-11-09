// mine kit · TramLine
import { h } from "../../lib/react.mjs";

// TramLine({ from, to, cart }): sleepered rails between two spots of the room it stands in, an ore cart on it at fraction `cart`
export const TramLine = ({ from, to, cart }) => h("rails", { from, to, ...(cart != null ? { cart } : {}) });

// meta card (lib/meta.mjs)
export const meta = {
  layer: "placement",
  is: "a mine tram line: sleepered rails laid between two spots of a room, with an ore cart left on it",
  tags: ["mine", "rails", "tram", "track", "cart", "ore", "line"],
  props: { from: "start spot: { u, v } fraction, Loc or [x, z] cells", to: "end spot", cart: "0..1 along the line where an ore cart stands (omit: no cart)" },
  footprint: { kind: "line" },
  topology: { under: ["Working", "Gallery", "Adit", "In"], takes: [], joins: [], emits: ["rails"] },
  twins: [],
  pitfalls: ["must stand inside a room (it takes the room of its parent)", "rails run straight: a bend needs two TramLines", "lay it down the walking line, not across a doorway"],
};

TramLine.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
