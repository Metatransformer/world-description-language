// crypt kit · Tier
import { h, Fragment, useContext } from "../../lib/react.mjs";
import { TierContext } from "./TierContext.mjs";
import { Level as CommonLevel } from "../common/Level.mjs";

// Tier({ n, name, floor: [top, bottom] | y, note }, children): one ring of the mound; its Burials take its level number and top floor.
export const Tier = (p) => CommonLevel({ ...p, context: TierContext });

export const meta = {
  "layer": "space",
  "is": "one ring or depth of a burial mound: every grave chamber inside it stands on the same level and floor",
  "tags": [
    "tier",
    "level",
    "ring",
    "depth",
    "floor",
    "barrow",
    "storey"
  ],
  "props": {
    "n": "level number (1 = top)",
    "name": "the level's name on the map",
    "floor": "floor height m: one y, or [top, bottom] when the tier slopes; its rooms stand on top",
    "note": "designer's note for the level row"
  },
  "footprint": {
    "kind": "none"
  },
  "topology": {
    "under": [
      "Barrow"
    ],
    "takes": [
      "Burial",
      "Heart",
      "GraveDoor",
      "RobbersSap"
    ],
    "joins": [],
    "emits": [
      "level"
    ]
  },
  "twins": ["common/Level", 
    "plan/Level",
    "cave/Shelf",
    "sewer/Depth",
    "seacave/Tide",
    "mine/Level"
  ],
  "pitfalls": [
    "two Tiers with the same n write two level rows for one level",
    "a Burial with its own floor prop overrides the tier's floor (fine for a sunk room, wrong by accident)",
    "it carries the Barrow's heart and kit down; outside a Barrow they fall back to null / \"barrow\" and ring rooms fail"
  ]
};

Tier.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
