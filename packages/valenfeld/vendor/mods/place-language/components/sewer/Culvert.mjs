// sewer kit · Culvert
import { Passage } from "../plan/index.mjs";

// Culvert({ a, b, how, side, at, secret }): one more pipe between two vaults (a loop; secret = behind loose bricks)
export const Culvert = Passage;

// card: Culvert: one more pipe between two vaults that already stand: a loop or a secret way.
export const meta = {
  "layer": "relation",
  "is": "an extra pipe joining two sewer rooms, making a loop or a hidden way round",
  "tags": [
    "culvert",
    "pipe",
    "passage",
    "loop",
    "secret",
    "shortcut",
    "tunnel",
    "sewer"
  ],
  "props": {
    "a": "room it leaves",
    "b": "room it reaches",
    "how": "tunnel | crawl | steps ...",
    "side": "wall of a it leaves by",
    "at": "metres along that wall",
    "secret": "true = hidden behind loose bricks"
  },
  "footprint": {
    "kind": "edge"
  },
  "topology": {
    "under": [
      "Depth",
      "Drains"
    ],
    "takes": [],
    "joins": [
      "Vault",
      "RatHall"
    ],
    "emits": [
      "link"
    ]
  },
  "twins": [
    "plan/Passage",
    "plan/Way",
    "crypt/RobbersSap"
  ],
  "pitfalls": [
    "it is plan/Passage under a sewer name: no lock; a gated way is Sluice",
    "both rooms must exist and share the wall at `at`",
    "a secret culvert with nothing to find behind it wastes the player's search"
  ]
};

Culvert.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
