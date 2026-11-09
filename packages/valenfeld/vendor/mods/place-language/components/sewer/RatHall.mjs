// sewer kit · RatHall
import { Boss } from "../plan/index.mjs";

// RatHall({ ...vault, phase2 }): whoever rules the drain holds court here (the boss's vault)
export const RatHall = Boss;

// card: RatHall: the vault where whoever rules the drain holds court: the boss's room.
export const meta = {
  "layer": "meaning",
  "is": "the court of the drain's king, the vault where the sewer's boss waits for the final fight",
  "tags": [
    "boss",
    "throne room",
    "court",
    "lair",
    "sewer",
    "arena",
    "rat king",
    "final"
  ],
  "props": {
    "id": "room id",
    "rect": "[x, z, w, d] in 2 m cells, north -z",
    "name": "name shown on the map",
    "kind": "entry | hall | flooded | treasury | archive ... (dresses the floor to match)",
    "floor": "floor y, metres (defaults to the Depth's top floor)",
    "height": "ceiling height, metres",
    "purpose": "why the vault exists, in a designer's words",
    "sightline": "what a player sees walking in",
    "from": "id of the vault the way in opens off",
    "how": "the way's kind: steps | tunnel | crawl | door ...",
    "side": "wall of `from` it leaves by: n s e w",
    "at": "metres along that wall where the way opens",
    "secret": "true = the way is hidden (loose bricks)",
    "dais": "raised dais the boss stands on",
    "phase2": "{ at_hp, say, adds } the second phase at that health fraction"
  },
  "footprint": {
    "kind": "room",
    "cells": [
      12,
      12
    ],
    "height": 7
  },
  "topology": {
    "under": [
      "Depth",
      "Drains"
    ],
    "takes": [
      "In",
      "Throne",
      "Rats",
      "Candles"
    ],
    "joins": [
      "Vault",
      "Sluice",
      "Culvert"
    ],
    "emits": [
      "room",
      "link"
    ]
  },
  "twins": [
    "plan/Boss",
    "cave/Lair",
    "crypt/Heart",
    "seacave/Drowned",
    "mine/NaturalCavern"
  ],
  "pitfalls": [
    "it is only the room: the boss is a foe you place inside with <In room=id>",
    "children are not seated in it: a foe/place with at inside it throws 'give in:'",
    "one per dungeon",
    "phase2 adds need spots inside the hall"
  ]
};

RatHall.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
