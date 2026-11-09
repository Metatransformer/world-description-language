// plan kit · In
import { h } from "../../lib/react.mjs";

// In({ room }, children): what stands in one space; spots inside are functions of that space, at={(r) => r.corner("ne")}.
export const In = ({ room, children }) => h("in", { key: `in-${room}`, room }, children);

export const meta = {
  "layer": "placement",
  "is": "a way of saying 'these things stand in that room', for filling a room after the plan is laid",
  "tags": [
    "in",
    "inside",
    "room",
    "contents",
    "fill",
    "placement",
    "dressing pass"
  ],
  "props": {
    "room": "room id the children stand in",
    "children": "foe, loot, light, place rows; their at may be a function of the room"
  },
  "footprint": {
    "kind": "area"
  },
  "topology": {
    "under": [
      "Plan",
      "Level"
    ],
    "takes": [
      "foe",
      "loot",
      "light",
      "place",
      "Touchstone",
      "hold"
    ],
    "joins": [],
    "emits": [
      "in"
    ]
  },
  "twins": [],
  "pitfalls": [
    "the room must already be laid (a later layer, or after it in the tree)",
    "it emits no row itself: an empty In does nothing"
  ]
};

In.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
