// crypt kit · BurialNiche
import { h, Fragment } from "../../lib/react.mjs";

// BurialNiche({ sides, count, every, occupant, size, height, meaning }, GraveGoods…): the dead laid in slabs along the room's walls (shared verb niches()).
export const BurialNiche = ({ children, ...p }) => h(Fragment, null, h("niches", { key: "niches", ...p }), children);

export const meta = {
  "layer": "placement",
  "is": "the dead laid in niches and slabs along a crypt room's walls, each carrying who lies there",
  "tags": [
    "niche",
    "loculus",
    "slab",
    "sarcophagus",
    "grave",
    "wall",
    "bones",
    "crypt",
    "burial"
  ],
  "props": {
    "sides": "walls to line: [\"e\",\"w\"] (default) of n s e w",
    "count": "niches per wall (overrides every)",
    "every": "spacing m between niches (default 3)",
    "off": "m out from the wall (default 1)",
    "occupant": "who lies there: a string, or a list cycled per niche",
    "size": "[w, d] m of each slab (default [1.2, 0.8])",
    "height": "m slab height (default 0.8)",
    "meaning": "one line said of every niche",
    "children": "GraveGoods and other rows standing in the same room"
  },
  "footprint": {
    "kind": "edge",
    "cells": [
      1,
      1
    ],
    "height": 0.8
  },
  "topology": {
    "under": [
      "Burial",
      "Vault",
      "Heart",
      "Space"
    ],
    "takes": [
      "GraveGoods"
    ],
    "joins": [],
    "emits": [
      "niches",
      "place"
    ]
  },
  "twins": [],
  "pitfalls": [
    "outside a room (no parent space, no room prop) it has nowhere to stand",
    "slabs are solid rises 1 m off the wall: on a narrow room (under ~4 m) both walls' niches close the floor",
    "niches ignore doorways: a niche can land in front of a door on that wall; pick sides without doors"
  ]
};

BurialNiche.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
