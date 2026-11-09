// crypt kit · Ossuary
import { h } from "../../lib/react.mjs";
import { Vault } from "./Vault.mjs";

// Ossuary({ id, rect, ...room }, children): a crypt vault where the parish stacked the bones: skull piles dressed in.
export const Ossuary = ({ children, ...p }) => h(Vault, { kind: "ossuary", ...p }, h("dress", { kinds: ["skullPile"], why: "the bones stacked by the parish when the yard was full" }), children);

export const meta = {
  "layer": "meaning",
  "is": "a bone-house: a vault where the bones were stacked when the graveyard was full, skulls piled along the walls",
  "tags": [
    "ossuary",
    "bones",
    "skulls",
    "charnel",
    "crypt",
    "vault",
    "dead"
  ],
  "props": {
    "id": "room id",
    "rect": "[x, z, w, d] cells (or table)",
    "name": "map name",
    "floor": "m",
    "height": "m",
    "purpose": "why the room exists",
    "table": "generator room table"
  },
  "footprint": {
    "kind": "room",
    "cells": [
      6,
      6
    ],
    "height": 4
  },
  "topology": {
    "under": [
      "Plan",
      "Level"
    ],
    "takes": [
      "foe",
      "loot",
      "light"
    ],
    "joins": [
      "link"
    ],
    "emits": [
      "room",
      "shell",
      "dress"
    ]
  },
  "twins": [
    "sewer/DeadRats"
  ],
  "pitfalls": [
    "the skullPile dress is a promise the build checks: a skull-pile prop must end up standing in the room",
    "writes no link of its own"
  ]
};

Ossuary.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
