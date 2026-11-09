// sewer kit · Crates
import { h } from "../../lib/react.mjs";

// Crates({ at, n, meaning }): crates, stacked where hands left them
export const Crates = ({ at, n = 2, meaning = "crates nobody came back for" }) => h("place", { kind: "crate", at, n, meaning });

// card: Crates: crates stacked where hands left them.
export const meta = {
  "layer": "dressing",
  "is": "crates stacked where someone left them and never came back for them",
  "tags": [
    "crates",
    "crate",
    "boxes",
    "clutter",
    "storage",
    "sewer",
    "smugglers"
  ],
  "props": {
    "at": "a spot or list of spots",
    "n": "crates per stack (2)",
    "meaning": "who left them"
  },
  "footprint": {
    "kind": "point",
    "cells": [
      1,
      1
    ],
    "height": 1.4
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
    "not searchable: a crate with loot is a loot row with prop crate",
    "stacks in doorways block the way"
  ]
};

Crates.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
