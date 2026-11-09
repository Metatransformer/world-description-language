// sewer kit · Rats
import { h } from "../../lib/react.mjs";
import { Band } from "../common/Band.mjs";

// Rats({ kind, at, lv, why }): vermin together for one reason; at may be one spot or several
export const Rats = ({ kind = "sewer-rat", lv = [1, 2], ...p }) => Band({ kind, lv, ...p });

// card: Rats: one group of vermin standing together for one reason, at one spot or several.
export const meta = {
  "layer": "encounter",
  "is": "a group of rats gathered somewhere for one reason (feeding, guarding, crossing)",
  "tags": [
    "rats",
    "vermin",
    "foe",
    "group",
    "sewer",
    "swarm"
  ],
  "props": {
    "kind": "foe kind (sewer-rat | giant-rat ...)",
    "at": "a spot, a list of spots, or (r) => spots: one rat per spot",
    "lv": "[min, max] level (1-2)",
    "why": "the reason they are here",
    "...": "any other foe field (slot, in) passes through"
  },
  "footprint": {
    "kind": "area"
  },
  "topology": {
    "under": [
      "In",
      "Space",
      "Tunnel"
    ],
    "takes": [],
    "joins": [],
    "emits": [
      "foe"
    ]
  },
  "twins": ["common/Band", 
    "cave/Beasts",
    "mine/Foe",
    "masonry/Pack"
  ],
  "pitfalls": [
    "at is required: one foe row per spot, none if empty",
    "no slot ids: use RatPack when each rat needs a stable identity",
    "a function at needs a room (In or nesting)"
  ]
};

Rats.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
