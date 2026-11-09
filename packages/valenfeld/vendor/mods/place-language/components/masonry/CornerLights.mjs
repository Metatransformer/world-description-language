// masonry kit · CornerLights
import { h } from "../../lib/react.mjs";
import { the } from "../../lib/ddl.mjs";

// CornerLights({ room, corners, off, y, kind, meaning }): one light tucked into each named corner of a room.
export const CornerLights = ({ room, corners = ["nw", "se"], off, y, kind = "lamp", meaning }) =>
  h("light", { kind, at: corners.map((c) => the(room).corner(c, off)), ...(y != null ? { y } : {}), ...(meaning ? { meaning } : {}) });

export const meta = {
  layer: "light",
  is: "lamps, candles or fungus set in a room's corners, so its whole floor reads and its middle stays the stage",
  tags: ["lamp", "light", "corners", "candles", "fungus", "rig", "pair", "cross-light"],
  props: {
    room: "room id",
    corners: "which corners, in order: nw ne sw se (default [nw, se]: cross-lit)",
    off: "how far in from the corner, m (default the corner spot's own inset)",
    y: "height, m",
    kind: "light kind: lamp, fungus, embers ... (default lamp)",
    meaning: "what the lights are",
  },
  footprint: { kind: "area" },
  topology: { under: ["Plan", "Level", "In", "Chamber"], takes: [], joins: [], emits: ["light"] },
  twins: ["cave/Glow", "sewer/Candles", "hall/Lamp"],
  pitfalls: [
    "corners name the room's own corners: in a long narrow room nw and ne sit close together",
    "a corner light behind a tall prop in that corner lights nothing: dress corners after lighting them",
  ],
};

CornerLights.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
