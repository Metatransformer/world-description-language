// cave kit · Glow
import { h } from "../../lib/react.mjs";
import { Fungus } from "./Fungus.mjs";

// Glow({ spots: [[corner, y], ...] }): fungus at a hollow's corners: [["nw", 1.4], ["se", 1]]
export const Glow = ({ spots }) => spots.map(([c, y], i) => h(Fungus, { key: `glow-${c}-${i}`, at: (r) => r.corner(c), y }));

export const meta = {
  layer: "light",
  is: "fungus glowing in a few corners of a hollow, the standard way to light a wild cave room",
  tags: ["light", "fungus", "glow", "corners", "cave"],
  props: { spots: "[[corner nw|ne|sw|se, y metres], ...]: one Fungus per corner" },
  footprint: { kind: "area", height: 1.5 },
  topology: { under: ["In"], takes: [], joins: [], emits: ["light"] },
  twins: ["seacave/SeaGlow"],
  pitfalls: ["must stand in a room (In or a Hollow's children): corners are read from that room", "each spot is a light: more than 3 per room costs frame time"],
};

Glow.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
