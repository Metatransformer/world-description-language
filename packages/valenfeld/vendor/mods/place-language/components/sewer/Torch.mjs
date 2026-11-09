// sewer kit · Torch
import { h } from "../../lib/react.mjs";
import { Light } from "../common/Light.mjs";

// Torch({ at, y }): a brand jammed in the brickwork by whoever lives down here
export const Torch = ({ at, y = 2, meaning = "a torch somebody keeps lit" }) => Light({ kind: "torch", at, y, meaning });

// card: Torch: a brand jammed in the brickwork by whoever lives down here.
export const meta = {
  "layer": "light",
  "is": "a torch jammed into the sewer wall, kept lit by somebody who lives down here",
  "tags": [
    "torch",
    "light",
    "fire",
    "wall",
    "sewer",
    "inhabited"
  ],
  "props": {
    "at": "spot on a wall (r.wall(side, where))",
    "y": "height, metres (2)",
    "meaning": "who keeps it lit"
  },
  "footprint": {
    "kind": "point"
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
      "light"
    ]
  },
  "twins": ["common/Light", 
    "seacave/Lantern",
    "seacave/Brazier",
    "hall/Lamp",
    "wilds/Lamp",
    "cave/Glow"
  ],
  "pitfalls": [
    "at must be on a wall: a centre spot leaves a torch hanging in the air",
    "a torch says someone lives here: in an empty drain use GrateShaft or nothing"
  ]
};

Torch.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
