// plan kit · Touchstone
import { h } from "../../lib/react.mjs";

// Touchstone({ at, opens, name, act, said, meaning }): a key that is a place (a warm step, a carved hand): touch it and its seal opens far off.
export const Touchstone = ({ at, opens, meaning, ...p }) => h("place", { kind: "touchstone", at, opens, meaning, ...p });

export const meta = {
  "layer": "mechanism",
  "is": "a spot a player touches (a warm step, a carved hand, a bell rope) that opens a seal somewhere else",
  "tags": [
    "touchstone",
    "key",
    "switch",
    "lever",
    "puzzle",
    "opener",
    "seal",
    "press"
  ],
  "props": {
    "at": "spot in its room (function of the room or point)",
    "uv": "[u, v] fraction across the room",
    "opens": "lock id of the Seal/Barrier it opens",
    "name": "its name in the prompt",
    "act": "the verb on E (Touch, Ring ...)",
    "said": "line said when used",
    "meaning": "what it is"
  },
  "footprint": {
    "kind": "point",
    "cells": [
      1,
      1
    ]
  },
  "topology": {
    "under": [
      "Space",
      "In"
    ],
    "takes": [],
    "joins": [
      "Seal",
      "Barrier"
    ],
    "emits": [
      "place"
    ]
  },
  "twins": [
    "cave/Boulder",
    "seacave/SluiceWheel",
    "cave/Lure"
  ],
  "pitfalls": [
    "inside a plan Space it is not seated in the room: wrap it in <In room=\"id\">",
    "opens must match a lock id exactly",
    "outside a room it has no in to stand in",
    "placed behind its own seal it can never be reached"
  ]
};

Touchstone.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
