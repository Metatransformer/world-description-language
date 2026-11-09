// sewer kit · Grate
import { h } from "../../lib/react.mjs";

// Grate({ id, uv }): an iron grate row held as it stands.
export const Grate = ({ id, uv }) => h("hold", { key: id, id, uv });

// card: Grate: an iron grate already standing in the scene, held by id at a room fraction.
export const meta = {
  "layer": "dressing",
  "is": "an iron drain grate that was built by hand and is kept exactly as it stands",
  "tags": [
    "grate",
    "iron",
    "hold",
    "authored",
    "sewer",
    "drain",
    "kept"
  ],
  "props": {
    "id": "the held scene row's id (kept exactly)",
    "uv": "[u, v] fraction of the room it is re-anchored at"
  },
  "footprint": {
    "kind": "point"
  },
  "topology": {
    "under": [
      "Channel",
      "Tunnel",
      "In"
    ],
    "takes": [],
    "joins": [],
    "emits": [
      "row"
    ]
  },
  "twins": [
    "masonry/Hold",
    "mine/Kept",
    "seacave/Kept",
    "hall/Keep",
    "wilds/Keep"
  ],
  "pitfalls": [
    "it only holds an existing row: an id not in the place's hand rows draws nothing in game",
    "it is a thin wrapper over <hold>: for anything that is not a grate use masonry/Hold",
    "for a daylight grate overhead use GrateShaft"
  ]
};

Grate.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
