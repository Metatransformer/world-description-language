// plan kit · Boss
import { h } from "../../lib/react.mjs";
import { Space } from "./Space.mjs";

// Boss({ ...space, dais, phase2 }): the boss's space, a Space of kind boss.
export const Boss = (p) => h(Space, { kind: "boss", ...p });

export const meta = {
  "layer": "meaning",
  "is": "the room where the dungeon's boss waits: the final fight's arena",
  "tags": [
    "boss",
    "arena",
    "lair",
    "final",
    "fight",
    "throne room"
  ],
  "props": {
    "id": "room id",
    "rect": "[x, z, w, d] cells",
    "from": "room the way in comes from",
    "how": "the way's kind",
    "side": "wall of `from`",
    "at": "cell along it",
    "floor": "m",
    "height": "m",
    "name": "map name",
    "purpose": "why the room exists",
    "sightline": "what a player sees walking in",
    "dais": "raised dais the boss stands on",
    "phase2": "{ at_hp, say, adds } second phase at that health fraction"
  },
  "footprint": {
    "kind": "room",
    "cells": [
      14,
      12
    ],
    "height": 8
  },
  "topology": {
    "under": [
      "Level",
      "Plan"
    ],
    "takes": [
      "foe",
      "loot",
      "light",
      "In"
    ],
    "joins": [
      "Space",
      "Seal",
      "Gate",
      "Passage"
    ],
    "emits": [
      "room",
      "link"
    ]
  },
  "twins": [
    "cave/Lair",
    "sewer/RatHall",
    "seacave/Drowned",
    "crypt/Heart"
  ],
  "pitfalls": [
    "its children are NOT seated in the room: a foe/loot/place inside it with at/uv throws \"give in:\"; wrap them in <In room=\"id\"> (or give in=)",
    "it is only the room: the boss is a foe row you still place inside",
    "one per dungeon: two boss rooms confuse the map and the clear check",
    "a boss room with no way in (no from and no Passage/Seal) is unreachable"
  ]
};

Boss.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
