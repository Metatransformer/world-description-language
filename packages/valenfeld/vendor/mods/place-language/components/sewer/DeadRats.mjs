// sewer kit · DeadRats
import { h } from "../../lib/react.mjs";

// DeadRats({ at, n, meaning }): rats laid out in a row (something here hunts them)
export const DeadRats = ({ at, n = 4, meaning = "dead rats laid in a row" }) => h("place", { kind: "dead-rat", at, n, meaning });

// card: DeadRats: rats laid out in a row: something here hunts them.
export const meta = {
  "layer": "dressing",
  "is": "a row of dead rats laid out neatly, the sign that something down here hunts them",
  "tags": [
    "dead rats",
    "rats",
    "corpses",
    "sign",
    "hunter",
    "sewer",
    "clue"
  ],
  "props": {
    "at": "spot the row starts at (it runs east)",
    "n": "how many (4)",
    "meaning": "who laid them out"
  },
  "footprint": {
    "kind": "line"
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
  "twins": [],
  "pitfalls": [
    "the row runs +x from at, 0.45 m per rat: start it far enough from an east wall",
    "at is required"
  ]
};

DeadRats.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
