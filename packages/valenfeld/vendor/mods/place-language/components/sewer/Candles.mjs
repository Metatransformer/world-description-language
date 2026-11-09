// sewer kit · Candles
import { h } from "../../lib/react.mjs";

// Candles({ at, n, y, meaning }): a cluster of stolen candles burning on the brick, their own light with them
export const Candles = ({ at, n = 5, y = 0, meaning = "stolen church candles" }) => h("place", { kind: "candles", at, n, y, meaning });

// card: Candles: a cluster of stolen candles burning on the brick, carrying their own light.
export const meta = {
  "layer": "light",
  "is": "a cluster of stolen candles burning on a ledge, the light of someone who lives down here",
  "tags": [
    "candles",
    "light",
    "shrine",
    "warm",
    "sewer",
    "ledge",
    "court"
  ],
  "props": {
    "at": "spot or spots",
    "n": "candles in the cluster (5)",
    "y": "height above the floor, metres (0)",
    "meaning": "whose candles"
  },
  "footprint": {
    "kind": "point",
    "cells": [
      1,
      1
    ]
  },
  "topology": {
    "under": [
      "In",
      "Vault",
      "Tunnel",
      "Channel",
      "Cistern"
    ],
    "takes": [],
    "joins": [],
    "emits": [
      "prop"
    ]
  },
  "twins": [
    "seacave/Lantern",
    "hall/Lamp",
    "wilds/Lamp"
  ],
  "pitfalls": [
    "at is required",
    "y is metres above the room floor: a ledge is ~1",
    "many clusters in one room means many lights: keep it to a few"
  ]
};

Candles.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
