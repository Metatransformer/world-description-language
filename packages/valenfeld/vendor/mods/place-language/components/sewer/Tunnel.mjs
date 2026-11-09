// sewer kit · Tunnel
import { h } from "../../lib/react.mjs";
import { Chamber } from "../masonry/index.mjs";

// Tunnel({ id, rect, ..., walkway }, children): a brick barrel-vault with the foul channel down its length.
export const Tunnel = ({ children, walkway = "both", ...p }) =>
  h(Chamber, { kind: "corridor", wall: "brick", ground: "wet", ...p }, h("channel", { along: p.rect[2] > p.rect[3] ? "x" : "z", walkway }), children);

// card: Tunnel: a brick barrel-vault run with the foul channel down its long axis and walkways either side.
export const meta = {
  "layer": "space",
  "is": "a long brick sewer tunnel with a channel of foul water down its middle and walkways along the sides",
  "tags": [
    "tunnel",
    "sewer",
    "drain",
    "corridor",
    "channel",
    "brick",
    "barrel-vault",
    "walkway"
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
    "walkway": "which sides keep a dry walkway: both (default) | w | e | n | s | none"
  },
  "footprint": {
    "kind": "room",
    "cells": [
      2,
      8
    ],
    "height": 3
  },
  "topology": {
    "under": [
      "Drains",
      "Depth"
    ],
    "takes": [
      "Rats",
      "RatRun",
      "Gutter",
      "Seep",
      "Wet",
      "Drip",
      "Torch"
    ],
    "joins": [
      "link",
      "Junction",
      "Culvert"
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
    "it needs rect: called with only table it throws reading rect[2] (use Channel for table-driven rooms)",
    "the channel runs along the longer side of rect; a square rect gets a z-running channel",
    "it cuts no way in: add a link/Junction or wrap rooms in a plan Space",
    "not the same as mine/Tunnel, which is a LINK between two rooms, not a room",
    "near-duplicate of Channel (which takes table= and names its water); pick Tunnel when you lay the rect yourself"
  ]
};

Tunnel.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
