// crypt kit · Barrow
import { h } from "../../lib/react.mjs";
import { TierContext } from "./TierContext.mjs";

// Barrow({ heart, kit }, children): the whole burial mound; its Tiers ring the heart chamber and every Burial under it is measured from that heart.
export const Barrow = ({ heart, kit = "barrow", children }) => h(TierContext.Provider, { value: { n: 1, floor: 0, heart, kit } }, children);

export const meta = {
  "layer": "context",
  "is": "a burial mound as a whole: the root of a barrow dungeon, whose rings of graves are laid around one central tomb",
  "tags": [
    "barrow",
    "mound",
    "crypt",
    "tomb",
    "root",
    "plan",
    "rings",
    "burial"
  ],
  "props": {
    "heart": "room id of the central chamber (the Heart) every ring is measured from",
    "kit": "visual kit style every Burial under it wears (default \"barrow\")",
    "children": "its Heart, then its Tiers"
  },
  "footprint": {
    "kind": "tree"
  },
  "topology": {
    "under": [],
    "takes": [
      "Heart",
      "Tier",
      "Burial",
      "GraveDoor",
      "RobbersSap"
    ],
    "joins": [],
    "emits": []
  },
  "twins": [
    "plan/Plan",
    "cave/Cave",
    "sewer/Drains",
    "seacave/Cove",
    "mine/Mine"
  ],
  "pitfalls": [
    "heart must name the Heart's id, and the Heart must be laid before any Burial using ring (ring rooms are solved round an existing room)",
    "it writes no level row of its own: give each depth a Tier",
    "a ring-plan place only: for a corridor-and-rooms crypt use plan/Plan with crypt/Vault spaces"
  ]
};

Barrow.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
