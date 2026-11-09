// sewer kit · Floodwater
import { h } from "../../lib/react.mjs";

// Floodwater({ depth, current }): the vault stands in water to that depth (m); current = it pulls, the mist drifts with it
export const Floodwater = ({ depth = 0.35, current = false, meaning }) => h("place", { kind: "floodwater", at: (r) => r.center, depth, current, meaning });

// card: Floodwater: the room stands in water to a depth; current makes it pull and the mist drift.
export const meta = {
  "layer": "dressing",
  "is": "standing water filling a room to the shins or knees, sometimes pulling with a current",
  "tags": [
    "flood",
    "water",
    "wade",
    "flooded",
    "current",
    "sewer",
    "knee-deep"
  ],
  "props": {
    "depth": "water depth, metres (0.35)",
    "current": "true = the water pulls and its mist drifts",
    "meaning": "what this water is"
  },
  "footprint": {
    "kind": "area"
  },
  "topology": {
    "under": [
      "In",
      "Vault",
      "Tunnel",
      "Channel",
      "Cistern"
    ],
    "takes": [],
    "joins": [],
    "emits": [
      "prop"
    ]
  },
  "twins": [
    "mine/FloodedDrift"
  ],
  "pitfalls": [
    "one sheet over the whole room at its floor: rooms at different floors need their own",
    "over ~0.8 m the player is swimming, not wading",
    "for a deep basin use Cistern; for a flooded room shape use FloodedRun"
  ]
};

Floodwater.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
