// sewer kit · Wet
import { h } from "../../lib/react.mjs";

// Drips({ why }): the drip/mist/outfall dressing every wet room wears.
export const Wet = ({ kinds = ["drip"], why = "water coming through" }) => h("dress", { kinds, why });

// card: Wet: names the wet dressing (drip, mist, outfall) a room wears, resolved into hand rows at build.
export const meta = {
  "layer": "dressing",
  "is": "the drip, mist and outfall that every wet sewer room wears, listed once for the room",
  "tags": [
    "wet",
    "drip",
    "mist",
    "outfall",
    "damp",
    "sewer",
    "dressing"
  ],
  "props": {
    "kinds": "dress kinds to resolve: drip | mist | outfall (default [\"drip\"])",
    "why": "the reason it is wet, written on the rows",
    "room": "room id when not nested in one"
  },
  "footprint": {
    "kind": "area"
  },
  "topology": {
    "under": [
      "Tunnel",
      "Channel",
      "Cistern",
      "In"
    ],
    "takes": [],
    "joins": [],
    "emits": [
      "dress"
    ]
  },
  "twins": [
    "masonry/Dressing"
  ],
  "pitfalls": [
    "a dress entry is only a list on the room: the rows appear when the as-built compile resolves them (tools/dungeon/from-asbuilt), not in the DDL program itself",
    "kinds outside the sewer piece set draw nothing",
    "for evenly spaced drips and mist computed from the room's length, use Seep"
  ]
};

Wet.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
