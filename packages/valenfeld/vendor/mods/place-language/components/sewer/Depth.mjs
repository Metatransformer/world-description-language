// sewer kit · Depth
import { LevelContext } from "../plan/index.mjs";
import { Level as CommonLevel } from "../common/Level.mjs";

// Depth({ n, name, floor: [top, bottom], note }): one course of brickwork down; older and wetter the deeper it goes
export const Depth = (p) => CommonLevel({ ...p, context: LevelContext });
Depth.displayName = "Level";   // same tree segment as the plan Level it used to alias: row ids hold

// card: Depth: one course of brickwork down; every vault in it shares its level and floor.
export const meta = {
  "layer": "space",
  "is": "one level of the sewer, a course of older and wetter brickwork below the one above",
  "tags": [
    "level",
    "depth",
    "floor",
    "sewer",
    "storey",
    "course"
  ],
  "props": {
    "n": "level number (1 = top)",
    "name": "the level's name",
    "floor": "[top, bottom] floor heights, metres; vaults default to top",
    "note": "what this level is"
  },
  "footprint": {
    "kind": "area"
  },
  "topology": {
    "under": [
      "Drains"
    ],
    "takes": [
      "Vault",
      "RatHall",
      "Culvert",
      "Sluice"
    ],
    "joins": [],
    "emits": [
      "level",
      "room"
    ]
  },
  "twins": ["common/Level", 
    "plan/Level",
    "cave/Shelf",
    "mine/Level",
    "seacave/Tide",
    "crypt/Tier"
  ],
  "pitfalls": [
    "vaults inherit the top floor: give floor= on a vault meant to sit lower",
    "a way between two depths still needs from/how on the vault (steps)",
    "it is plan/Level under a sewer name"
  ]
};

Depth.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
