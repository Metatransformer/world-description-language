// sewer kit · RatPack
import { h, Fragment } from "../../lib/react.mjs";
import { Squad } from "../common/Squad.mjs";

// RatPack({ slots: [[slot, at, kind?]], why }): rats that live here, one foe row each, the why shared.
export const RatPack = ({ slots, why, kind = "sewer-rat" }) => Squad({ kind, slots, why, by: "at" });

// card: RatPack: a nest of rats, one foe row per named slot, sharing one reason.
export const meta = {
  "layer": "encounter",
  "is": "the rats that live in this spot, each at its own place, all there for the same reason",
  "tags": [
    "rats",
    "vermin",
    "pack",
    "foe",
    "sewer",
    "nest",
    "swarm"
  ],
  "props": {
    "slots": "[[slot id, at spot, kind?]] one rat each; at = a spot or (r) => spot",
    "why": "why they are here (shared)",
    "kind": "foe kind when a slot gives none (sewer-rat)"
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
  "twins": ["common/Squad", 
    "cave/Beasts",
    "masonry/Pack",
    "seacave/Crew"
  ],
  "pitfalls": [
    "slots need stable ids: renaming one makes a new foe in saved rooms",
    "at must be inside its room or the build throws",
    "use RatRun when you think in room fractions (u, v), Rats for one group without slot ids"
  ]
};

RatPack.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
