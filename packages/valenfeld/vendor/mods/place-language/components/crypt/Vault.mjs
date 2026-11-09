// crypt kit · Vault
import { h } from "../../lib/react.mjs";
import { Chamber } from "../masonry/index.mjs";

// Vault({ id, rect, kind, ...room }, children): a barrel-vaulted room of dressed vault stone with flagged floor.
export const Vault = ({ children, ...p }) => h(Chamber, { kind: "crypt", wall: "vault", ground: "flag", ceil: "vault", ...p }, children);

export const meta = {
  "layer": "space",
  "is": "a barrel-vaulted burial room of dressed stone with a flagged floor: the basic crypt room",
  "tags": [
    "vault",
    "crypt",
    "burial",
    "room",
    "stone",
    "tomb",
    "catacomb",
    "chamber"
  ],
  "props": {
    "id": "room id",
    "rect": "[x, z, w, d] cells (or size + from + dir)",
    "name": "map name",
    "kind": "room kind (default crypt)",
    "floor": "m",
    "height": "m",
    "level": "level number",
    "purpose": "why the room exists",
    "sightline": "what a player sees walking in",
    "table": "generator room table: shape read from it instead of rect"
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
      "Level",
      "Barrow"
    ],
    "takes": [
      "foe",
      "loot",
      "light",
      "BurialNiche",
      "GraveGoods"
    ],
    "joins": [
      "link",
      "GraveDoor",
      "RobbersSap"
    ],
    "emits": [
      "room",
      "shell"
    ]
  },
  "twins": [
    "crypt/Burial",
    "sewer/Vault",
    "plan/Space",
    "masonry/Chamber",
    "mine/Working",
    "cave/Hollow"
  ],
  "pitfalls": [
    "it writes no link: join it with <link>, a Passage or a GraveDoor or it is unreachable",
    "sewer/Vault is a different thing (a brick room off the one before, with from/how)",
    "no level/floor from context: it is a masonry Chamber, so give level/floor when below level 1"
  ]
};

Vault.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
