// plan kit · Plan
import { h } from "../../lib/react.mjs";
import { LevelContext } from "./LevelContext.mjs";

// Plan({ children }): the whole place; children are its Levels, starting level 1 at floor 0.
export const Plan = ({ children }) => h(LevelContext.Provider, { value: { n: 1, floor: 0 } }, children);

export const meta = {
  "layer": "context",
  "is": "a whole dungeon laid out as levels stepping down, the root every dungeon family's plan stands on",
  "tags": [
    "plan",
    "dungeon",
    "root",
    "layout",
    "levels",
    "whole place"
  ],
  "props": {
    "children": "its Levels, Spaces and the ways between them"
  },
  "footprint": {
    "kind": "tree"
  },
  "topology": {
    "under": [],
    "takes": [
      "Level",
      "Space",
      "Boss",
      "Passage",
      "Gate",
      "Barrier",
      "Seal",
      "In"
    ],
    "joins": [],
    "emits": []
  },
  "twins": [
    "cave/Cave",
    "sewer/Drains",
    "seacave/Cove",
    "mine/Mine",
    "crypt/Barrow"
  ],
  "pitfalls": [
    "it emits nothing itself: without Levels every Space stands on level 1, floor 0",
    "it resets the level context, so nesting a Plan inside a Level starts again at level 1"
  ]
};

Plan.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
