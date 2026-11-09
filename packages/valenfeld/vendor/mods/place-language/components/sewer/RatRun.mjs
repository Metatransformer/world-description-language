// sewer kit · RatRun
import { h } from "../../lib/react.mjs";
import { Squad } from "../common/Squad.mjs";

// RatRun({ slots: [[slot, u, v]], why, kind }): vermin by uv, the first fights a sewer teaches.
export const RatRun = ({ kind = "sewer-rat", slots, why, in: room }) => Squad({ kind, slots: slots.map((s) => s.slice(0, 3)), why, in: room, by: "uv" });

// card: RatRun: rats placed by room fraction, the first fights a sewer teaches.
export const meta = {
  "layer": "encounter",
  "is": "a few sewer rats standing along a run, the first easy fights a new character meets",
  "tags": [
    "rats",
    "vermin",
    "foe",
    "sewer",
    "tutorial",
    "lesson",
    "first fight"
  ],
  "props": {
    "slots": "[[slot id, u, v]] one rat each; u west->east, v north->south, 0..1 of the room",
    "why": "why they are here",
    "kind": "foe kind (sewer-rat)",
    "in": "room id when not nested in one"
  },
  "footprint": {
    "kind": "area"
  },
  "topology": {
    "under": [
      "Channel",
      "Tunnel",
      "In",
      "Space"
    ],
    "takes": [],
    "joins": [],
    "emits": [
      "foe"
    ]
  },
  "twins": ["common/Squad", 
    "masonry/Pack",
    "cave/Beasts"
  ],
  "pitfalls": [
    "u, v are fractions of the room's rect, not metres: 0.95 hugs the east wall",
    "slot ids are the foe's identity: keep them stable",
    "without in= it needs a room ancestor"
  ]
};

RatRun.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
