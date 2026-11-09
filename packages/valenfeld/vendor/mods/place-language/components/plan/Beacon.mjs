// plan kit · Beacon
import { h } from "../../lib/react.mjs";
import { the } from "../../lib/ddl.mjs";

const END = { n: [0.5, 0.1], s: [0.5, 0.9], w: [0.1, 0.5], e: [0.9, 0.5] };

// Beacon({ room, end, y, meaning }): a lamp by a room's far door, lit so it is seen from across the dungeon: the shortcut home, promised.
export const Beacon = ({ room, end = "n", y = 1.6, kind = "lamp", meaning }) =>
  h("light", { kind, at: the(room).at(...END[end]), y, ...(meaning ? { meaning } : {}) });

export const meta = {
  layer: "light",
  is: "a lamp burning by a far door, seen from across the dungeon, so the player knows there is another way back before they reach it",
  tags: ["lamp", "beacon", "shortcut", "promise", "far door", "sightline", "light", "way home"],
  props: {
    room: "room id the lamp hangs in (usually the shortcut Gate's b room)",
    end: "which end of the room: n s e w (default n: the door at its north end)",
    y: "lamp height, m (default 1.6: door height)",
    kind: "light kind (default lamp)",
    meaning: "what the light promises",
  },
  footprint: { kind: "point", height: 1.6 },
  topology: { under: ["Plan", "Level", "In"], takes: [], joins: ["Gate"], emits: ["light"] },
  twins: ["wilds/Lamp", "hall/Lamp", "cave/Glow"],
  pitfalls: [
    "only a beacon if a sightline reaches it: put it where the room before the shortcut can see it",
    "end is the room's end, not the door's wall: check the Gate's side sits at that end",
  ],
};

Beacon.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
