// sewer kit · Channel
import { h } from "../../lib/react.mjs";
import { Chamber } from "../masonry/index.mjs";

// Channel({ id, table|rect, walkway, water }, children): a Tunnel named for its water (the prison's runs). Harvested: gaol.js tunnelA/B.
export function Channel({ water = "foul", walkway = "both", children, ...o }) {
  return h(Chamber, { kind: "corridor", wall: "brick", ground: "wet", ...o, feature: `channel (${water}), walkway ${walkway}` }, h("channel", { walkway }), children);
}

// card: Channel: a sewer run named for its water, usually read off a generator table (the prison's mains).
export const meta = {
  "layer": "space",
  "is": "a stretch of the town's sewer where foul water runs in a channel between brick walkways",
  "tags": [
    "channel",
    "sewer",
    "drain",
    "tunnel",
    "water",
    "brick",
    "walkway",
    "prison"
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
    "water": "what runs in it, for the record: foul (default) | clean | silt ...",
    "walkway": "which sides keep a walkway: both (default) | none | w | e"
  },
  "footprint": {
    "kind": "room",
    "cells": [
      2,
      10
    ],
    "height": 3
  },
  "topology": {
    "under": [
      "Drains",
      "Depth"
    ],
    "takes": [
      "RatRun",
      "Rats",
      "Seep",
      "Wet",
      "hold",
      "link"
    ],
    "joins": [
      "Junction",
      "link"
    ],
    "emits": [
      "room",
      "shell",
      "channel"
    ]
  },
  "twins": [
    "mine/Gallery",
    "masonry/Chamber"
  ],
  "pitfalls": [
    "its channel row carries no `along`: without table it runs along the generator default (z), not the long axis; use Tunnel for a free-laid x run",
    "in table mode the table decides the water: the channel row and wall/ground are ignored",
    "with table, an id missing from the table throws",
    "cuts no way in: add Junction/link rows"
  ]
};

Channel.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
