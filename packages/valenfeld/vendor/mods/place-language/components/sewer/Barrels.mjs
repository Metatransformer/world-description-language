// sewer kit · Barrels
import { h } from "../../lib/react.mjs";

// Barrels({ at, n, tipped, meaning }): casks someone rolled down here, one stack per spot (a list = several stacks); tipped lays the last over
export const Barrels = ({ at, n = 3, tipped = false, meaning = "casks rolled down out of the town's cellars" }) => h("place", { kind: "barrel", at, n, tipped, meaning });

// card: Barrels: casks rolled down from the cellars, one stack per spot; tipped lays the last over.
export const meta = {
  "layer": "dressing",
  "is": "a few casks someone rolled down here and never came back for",
  "tags": [
    "barrels",
    "casks",
    "barrel",
    "clutter",
    "storage",
    "sewer",
    "smugglers"
  ],
  "props": {
    "at": "a spot or list of spots, one stack each",
    "n": "casks per stack (3)",
    "tipped": "true = the last lies on its side",
    "meaning": "who left them and why"
  },
  "footprint": {
    "kind": "point",
    "cells": [
      1,
      1
    ],
    "height": 1
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
    "plan/Stores",
    "seacave/Prop",
    "hall/Container",
    "wilds/CampProp"
  ],
  "pitfalls": [
    "at is required",
    "place them off the walking line: a stack in a doorway blocks it",
    "they are props, not containers: searchable stock is plan/Stores or a loot row"
  ]
};

Barrels.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
