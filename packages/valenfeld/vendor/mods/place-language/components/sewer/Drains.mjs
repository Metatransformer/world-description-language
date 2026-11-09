// sewer kit · Drains
import { h } from "../../lib/react.mjs";
import { Plan } from "../plan/index.mjs";

// Drains({ children }): the whole drain network; children are its Depths
export const Drains = ({ children }) => h(Plan, null, children);

// card: Drains: the whole drain network, the root a sewer dungeon's Depths stand under.
export const meta = {
  "layer": "space",
  "is": "a town's whole sewer network, laid out as courses of brickwork stepping down",
  "tags": [
    "sewer",
    "drains",
    "root",
    "network",
    "dungeon",
    "plan"
  ],
  "props": {
    "children": "its Depths (or Vaults directly)"
  },
  "footprint": {
    "kind": "tree"
  },
  "topology": {
    "under": [],
    "takes": [
      "Depth",
      "Vault",
      "RatHall",
      "Culvert",
      "Sluice"
    ],
    "joins": [],
    "emits": [
      "room",
      "link"
    ]
  },
  "twins": [
    "plan/Plan",
    "cave/Cave",
    "mine/Mine",
    "seacave/Cove",
    "crypt/Barrow"
  ],
  "pitfalls": [
    "it takes no props: name and style live on the dungeon() call",
    "it is plan/Plan under a sewer name: rooms only, dress each vault with <In>",
    "one per program"
  ]
};

Drains.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
