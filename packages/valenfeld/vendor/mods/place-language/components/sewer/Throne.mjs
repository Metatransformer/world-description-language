// sewer kit · Throne
import { h } from "../../lib/react.mjs";

// Throne({ at, face, meaning }): casks lashed into a seat, a drain grate for its back, bent spoons for a crown above it
export const Throne = ({ at, face = 0, meaning = "a throne of barrels and drain grates" }) => h("place", { kind: "throne", at, face, meaning });

// card: Throne: casks lashed into a seat, a drain grate for its back, bent spoons for a crown above.
export const meta = {
  "layer": "dressing",
  "is": "a throne built of barrels and drain grates with a crown of bent spoons, where a sewer king sits",
  "tags": [
    "throne",
    "seat",
    "boss",
    "king",
    "set piece",
    "sewer",
    "court"
  ],
  "props": {
    "at": "spot it stands on",
    "face": "yaw degrees it faces (0 = south toward the door when at the north)",
    "meaning": "whose throne"
  },
  "footprint": {
    "kind": "point",
    "cells": [
      2,
      2
    ],
    "height": 3
  },
  "topology": {
    "under": [
      "In",
      "RatHall",
      "Vault"
    ],
    "takes": [],
    "joins": [],
    "emits": [
      "prop"
    ]
  },
  "twins": [],
  "pitfalls": [
    "at is required; place it against the far wall from the way in",
    "face is degrees: a throne facing the wall reads as a pile of barrels",
    "it is the seat only: the boss is a foe row"
  ]
};

Throne.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
