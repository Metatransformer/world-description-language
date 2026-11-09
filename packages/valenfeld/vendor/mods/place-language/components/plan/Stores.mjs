// plan kit · Stores
import { h, Fragment } from "../../lib/react.mjs";

// Stores({ set, per, scale, seed }): what people left along the walls, room by room. The shared storage rule (Nov 7):
// stock hugs the walls in ones and pairs, never piles in open floor, and how much depends on the room's job.
// `per` = { room: density } in pieces per grid cell (measure it off a hand-placed place); `scale` turns grid cells into
// the clutter host's units (G² for a 2 m grid). `set` names a CLUTTER_SETS kit: "gaol-stores", "cellar", "mine", "camp".
// First used by the Valenfeld gaol (134 crates and barrels, replacing 150 hand rows); any dungeon, cellar or yard reuses it.
// Stores({ set, per, scale, seed }): what people left along the walls, room by room: crates and barrels in ones and pairs, never mid-floor.
export const Stores = ({ set = "cellar", per = {}, scale = 1, seed = 1 }) =>
  h(Fragment, null, ...Object.entries(per).map(([room, density]) => h("clutter", { key: `stores-${room}`, room, set, density: density * scale, seed })));

export const meta = {
  "layer": "procedural",
  "is": "the crates, barrels and stock people left along a place's walls, room by room, by how much each room keeps",
  "tags": [
    "stores",
    "clutter",
    "crates",
    "barrels",
    "storage",
    "stock",
    "dressing",
    "cellar"
  ],
  "props": {
    "set": "clutter set: cellar (default) gaol-stores mine camp sewer crypt cave",
    "per": "{ roomId: density } pieces per grid cell",
    "scale": "grid cells to the clutter host's units (4 for a 2 m grid)",
    "seed": "random seed: same seed, same stock"
  },
  "footprint": {
    "kind": "area"
  },
  "topology": {
    "under": [
      "Plan"
    ],
    "takes": [],
    "joins": [],
    "emits": [
      "clutter",
      "place"
    ]
  },
  "twins": [
    "sewer/Barrels",
    "sewer/Crates"
  ],
  "pitfalls": [
    "forgetting scale (4 on a 2 m grid) gives a quarter of the stock",
    "every room in per must exist",
    "it adds to the automatic clutter layer: set the dungeon's clutter: false if Stores is the only stock you want"
  ]
};

Stores.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
