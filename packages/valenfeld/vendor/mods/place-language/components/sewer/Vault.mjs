// sewer kit · Vault
import { Space } from "../plan/index.mjs";

// Vault({ id, rect, name, kind, floor, height, purpose, sightline, from, how, side, at, secret }): a brick room off the one before
export const Vault = Space;

// card: Vault: one brick room of the sewer, opened off the vault before it.
export const meta = {
  "layer": "space",
  "is": "one brick room of the sewer, opened off the room before it by steps, a tunnel or a crawl",
  "tags": [
    "vault",
    "room",
    "sewer",
    "brick",
    "space",
    "chamber"
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
    "secret": "true = the way is hidden (loose bricks)"
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
      "Depth",
      "Drains"
    ],
    "takes": [
      "In"
    ],
    "joins": [
      "Culvert",
      "Sluice",
      "RatHall"
    ],
    "emits": [
      "room",
      "link"
    ]
  },
  "twins": [
    "plan/Space",
    "crypt/Vault",
    "cave/Hollow",
    "mine/Working",
    "seacave/Grotto",
    "masonry/Chamber"
  ],
  "pitfalls": [
    "it is plan/Space under a sewer name: its children are not seated, put dressing in <In room=id>",
    "without from (and no Culvert/link) the vault is unreachable",
    "side/at must land on a wall the two rects share or the way opens into rock"
  ]
};

Vault.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
