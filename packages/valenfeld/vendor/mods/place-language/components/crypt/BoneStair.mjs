// crypt kit · BoneStair
import { h } from "../../lib/react.mjs";
import { Vault } from "./Vault.mjs";

// BoneStair({ id, rect, ...room }): a crypt vault that is a stair going down, bones underfoot.
export const BoneStair = ({ children, ...p }) => h(Vault, { kind: "stair", ...p }, children);

export const meta = {
  "layer": "space",
  "is": "a vaulted stair going down into the crypt, the way from the living rooms to the dead's",
  "tags": [
    "stair",
    "stairs",
    "descent",
    "crypt",
    "vault",
    "bones",
    "down"
  ],
  "props": {
    "id": "room id",
    "rect": "[x, z, w, d] cells (or table)",
    "floor": "m",
    "height": "m",
    "name": "map name",
    "purpose": "why the room exists",
    "table": "generator room table (prison gaol.js ROOMS)"
  },
  "footprint": {
    "kind": "room",
    "cells": [
      3,
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
      "light",
      "place"
    ],
    "joins": [
      "link"
    ],
    "emits": [
      "room",
      "shell"
    ]
  },
  "twins": [
    "mine/Shaft"
  ],
  "pitfalls": [
    "it is a room of kind stair: the drop between levels comes from the floors of the rooms it links, not from this",
    "writes no link of its own"
  ]
};

BoneStair.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
