// crypt kit · Heart
import { h } from "../../lib/react.mjs";
import { Burial } from "./Burial.mjs";

// Heart({ id, rect, ...room }, children): the mound's central tomb, a vault-stone boss chamber; the rings are measured from it.
export const Heart = ({ children, ...p }) => h(Burial, { kind: "boss", wall: "vault", ground: "flag", ceil: "vault", ...p }, children);

export const meta = {
  "layer": "space",
  "is": "the central tomb at the heart of a burial mound, where the barrow's lord lies and the final fight happens",
  "tags": [
    "heart",
    "tomb",
    "boss",
    "barrow",
    "crypt",
    "central",
    "chamber",
    "lord"
  ],
  "props": {
    "id": "room id (the Barrow's heart names it)",
    "rect": "[x, z, w, d] cells: give it exact numbers, the rings hang off it",
    "level": "level number",
    "floor": "m",
    "height": "m (a domed tomb runs tall)",
    "name": "map name",
    "purpose": "why the room exists",
    "sightline": "what a player sees walking in",
    "dais": "raised bier/dais for the boss",
    "phase2": "{ at_hp, say, adds } the boss's second phase",
    "from": "room it opens off (rare: usually the rings link in)",
    "how": "way in from `from`"
  },
  "footprint": {
    "kind": "room",
    "cells": [
      14,
      12
    ],
    "height": 9
  },
  "topology": {
    "under": [
      "Barrow",
      "Tier"
    ],
    "takes": [
      "foe",
      "loot",
      "light",
      "place"
    ],
    "joins": [
      "Burial",
      "GraveDoor"
    ],
    "emits": [
      "room",
      "shell",
      "kit",
      "link"
    ]
  },
  "twins": [
    "plan/Boss",
    "cave/Lair",
    "sewer/RatHall",
    "seacave/Drowned"
  ],
  "pitfalls": [
    "its id must equal the Barrow's heart, and it must come before any ring Burial",
    "it is kind boss: put exactly one per mound",
    "give rect, not ring: it is the origin the rings measure from"
  ]
};

Heart.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
