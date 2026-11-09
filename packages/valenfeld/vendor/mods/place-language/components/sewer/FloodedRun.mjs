// sewer kit · FloodedRun
import { h } from "../../lib/react.mjs";
import { Chamber } from "../masonry/index.mjs";

// FloodedRun({ id, rect, channel, ...room }): a low tunnel standing in water (crawls, drowned rooms); channel runs foul water down its long axis
export const FloodedRun = ({ children, channel = false, ...p }) =>
  h(Chamber, { kind: "flooded", wall: "brick", ground: "wet", ...p }, h("pool", { depth: 0.6 }), channel && h("channel", { along: p.rect[2] > p.rect[3] ? "x" : "z" }), children);

// card: FloodedRun: a low brick tunnel standing in water, a crawl or a drowned room.
export const meta = {
  "layer": "space",
  "is": "a low sewer tunnel half full of standing water you wade or crawl through",
  "tags": [
    "flooded",
    "crawl",
    "tunnel",
    "sewer",
    "water",
    "wade",
    "drowned",
    "brick"
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
    "channel": "true = a channel also runs down it under the water (along the long axis)"
  },
  "footprint": {
    "kind": "room",
    "cells": [
      2,
      6
    ],
    "height": 2.5
  },
  "topology": {
    "under": [
      "Drains",
      "Depth"
    ],
    "takes": [
      "Rats",
      "Seep",
      "loot"
    ],
    "joins": [
      "Tunnel",
      "Cistern",
      "link"
    ],
    "emits": [
      "room",
      "shell",
      "pool",
      "channel"
    ]
  },
  "twins": [
    "mine/FloodedDrift",
    "seacave/Sump"
  ],
  "pitfalls": [
    "needs rect (reads rect for the channel axis) even with table",
    "the pool is a fixed 0.6 m: no depth prop; use Cistern for a deep basin",
    "unused by the twelve programs so far: check the look before relying on it"
  ]
};

FloodedRun.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
