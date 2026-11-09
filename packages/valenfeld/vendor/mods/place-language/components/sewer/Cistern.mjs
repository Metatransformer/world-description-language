// sewer kit · Cistern
import { h } from "../../lib/react.mjs";
import { Chamber } from "../masonry/index.mjs";

// Cistern({ id, rect, ... }, children): a tall flooded basin; the pool is the generator's.
export const Cistern = ({ children, depth = 1.2, ...p }) => h(Chamber, { kind: "flooded", ...p }, h("pool", { depth }), children);

// card: Cistern: a tall vaulted basin standing over a pool of dark water.
export const meta = {
  "layer": "space",
  "is": "the town's old cistern: a tall vaulted chamber over a deep pool you cross by its rim",
  "tags": [
    "cistern",
    "pool",
    "flooded",
    "basin",
    "sewer",
    "vault",
    "water",
    "set piece"
  ],
  "props": {
    "id": "room id",
    "rect": "[x, z, w, d] 2 m cells (omit when table gives it)",
    "table": "a generator room table (gaol.js ROOMS) the shape, stone and water are read from",
    "name": "map name",
    "level": "level number",
    "floor": "floor y, metres",
    "height": "ceiling, metres",
    "purpose": "what the run is for",
    "wall": "brick (default) | fs | vault",
    "ground": "wet (default) | flag | earth",
    "ceil": "vault | oak | iron",
    "depth": "pool depth, metres (1.2)"
  },
  "footprint": {
    "kind": "room",
    "cells": [
      8,
      8
    ],
    "height": 8
  },
  "topology": {
    "under": [
      "Drains",
      "Depth"
    ],
    "takes": [
      "Rats",
      "Seep",
      "Floodwater",
      "Torch",
      "loot"
    ],
    "joins": [
      "Channel",
      "Tunnel",
      "link"
    ],
    "emits": [
      "room",
      "shell",
      "pool"
    ]
  },
  "twins": [
    "mine/FloodedDrift",
    "seacave/Grotto",
    "seacave/Sump"
  ],
  "pitfalls": [
    "a 1.2 m pool is deeper than knee-wading: give it a rim or beam to cross, or the room reads as a wall of water",
    "in table mode the table's water wins and depth is ignored",
    "cuts no way in by itself",
    "for knee-deep standing water in an ordinary room use Floodwater instead"
  ]
};

Cistern.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
