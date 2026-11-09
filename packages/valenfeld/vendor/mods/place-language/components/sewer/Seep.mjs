// sewer kit · Seep
import { h } from "../../lib/react.mjs";

// Seep({ in, mist, mistEvery, dripEvery, drips, mists, meaning }): the drips off a wet vault and the mist on its water, spaced along
// the run (ddl seep()). Used by: prison. Replaces hand drip/mist rows anywhere water stands.
export const Seep = (p) => h("seep", p);

// card: Seep: drips and mist spaced evenly down a wet room's length (ddl seep()).
export const meta = {
  "layer": "procedural",
  "is": "water seeping through a wet vault: drips spaced down the run and mist lying on its water",
  "tags": [
    "seep",
    "drip",
    "mist",
    "wet",
    "damp",
    "water",
    "sewer",
    "procedural"
  ],
  "props": {
    "in": "room id it seeps in (else the nearest room)",
    "mist": "true/false; default on when the room has a channel or pool",
    "mistEvery": "metres between mist rows (8)",
    "mistY": "mist height, m (-0.49 on a channel, -0.25 on a pool)",
    "dripEvery": "metres between drips (12)",
    "drips": "exact drip count (overrides dripEvery)",
    "mists": "exact mist count",
    "along": "x | z; default the room's long side",
    "meaning": "why it is wet"
  },
  "footprint": {
    "kind": "line"
  },
  "topology": {
    "under": [
      "Tunnel",
      "Channel",
      "Cistern",
      "FloodedRun",
      "In"
    ],
    "takes": [],
    "joins": [],
    "emits": [
      "prop"
    ]
  },
  "twins": [],
  "pitfalls": [
    "mist only defaults on if the room carries a channel or pool row: in a plain Space pass mist explicitly",
    "drips alternate either side of the centre line, so a 1-cell-wide room puts them in its walls",
    "do not also hand-place Drip/Wet rows in the same room: double drips"
  ]
};

Seep.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
