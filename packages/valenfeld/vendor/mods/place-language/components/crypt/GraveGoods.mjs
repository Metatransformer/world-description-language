// crypt kit · GraveGoods
import { h } from "../../lib/react.mjs";

// GraveGoods({ at, uv, name, table, gold, potions, why, chest }): what the dead were buried with, an openable container in its room.
export const GraveGoods = ({ chest, ...p }) => h("loot", { kind: chest ? "chest" : "container", table: "box-dungeon-sack", ...p });

export const meta = {
  "layer": "loot",
  "is": "the things the dead were buried with: an urn, a box or a chest beside the grave that a player can open",
  "tags": [
    "grave goods",
    "loot",
    "container",
    "chest",
    "urn",
    "treasure",
    "burial",
    "crypt"
  ],
  "props": {
    "at": "spot in its room (a function of the room, or a point)",
    "uv": "[u, v] fraction across the room",
    "name": "what the container is called",
    "table": "loot table id (default box-dungeon-sack)",
    "gold": "extra gold",
    "potions": "extra potions",
    "why": "why it is here",
    "chest": "true = a proper chest instead of a small container"
  },
  "footprint": {
    "kind": "point",
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
      "BurialNiche",
      "Space"
    ],
    "takes": [],
    "joins": [],
    "emits": [
      "loot"
    ]
  },
  "twins": [
    "seacave/Strongbox",
    "masonry/Cache",
    "wilds/Chest",
    "hall/Container",
    "hall/Coffer"
  ],
  "pitfalls": [
    "no at/uv: it falls to the loot verb's default spot, likely the room centre",
    "the default table is a dungeon sack: name a richer table for a tomb's hoard"
  ]
};

GraveGoods.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
