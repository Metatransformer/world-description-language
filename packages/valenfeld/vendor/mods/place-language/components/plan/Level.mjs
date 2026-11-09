// plan kit · Level
import { h, Fragment, useContext } from "../../lib/react.mjs";
import { LevelContext } from "./LevelContext.mjs";
import { Level as CommonLevel } from "../common/Level.mjs";

// Level({ n, name, floor: [top, bottom] | y, note }, children): one step down; every space under it stands on it.
export function Level(p) { return CommonLevel({ ...p, context: LevelContext }); }

export const meta = {
  "layer": "space",
  "is": "one storey or step down of a dungeon: every room inside it shares its level number and floor height",
  "tags": [
    "level",
    "storey",
    "floor",
    "depth",
    "step down",
    "tier"
  ],
  "props": {
    "n": "level number (1 = top)",
    "name": "the level's name on the map",
    "floor": "floor height m: one y, or [top, bottom] for a sloping level; its spaces stand on top",
    "note": "designer's note for the level row"
  },
  "footprint": {
    "kind": "none"
  },
  "topology": {
    "under": [
      "Plan"
    ],
    "takes": [
      "Space",
      "Boss",
      "Passage",
      "Gate",
      "Barrier",
      "Seal",
      "In"
    ],
    "joins": [],
    "emits": [
      "level"
    ]
  },
  "twins": ["common/Level", 
    "crypt/Tier",
    "cave/Shelf",
    "sewer/Depth",
    "seacave/Tide",
    "mine/Level"
  ],
  "pitfalls": [
    "it changes the floor of Spaces only: a raw <room> or masonry Chamber inside it ignores it",
    "two Levels with the same n write two level rows",
    "floor [top, bottom] seats rooms on top; a deeper room gives its own floor"
  ]
};

Level.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
