// plan kit · Seal
import { h } from "../../lib/react.mjs";
import { Barrier } from "./Barrier.mjs";

// Seal({ id, a, b, side, at, what, key_lives, barred, opened, look }): a face of stone with nothing to press; only its key (a Touchstone) far off opens it.
export const Seal = (p) => h(Barrier, { how: "seal", style: "seal", ...p });

export const meta = {
  "layer": "relation",
  "is": "a sealed face across a way with nothing on it to press: it opens only when its key is touched somewhere else",
  "tags": [
    "seal",
    "sealed door",
    "magic door",
    "puzzle",
    "lock",
    "barrier",
    "boss door"
  ],
  "props": {
    "id": "lock id (a Touchstone's opens names it)",
    "a": "room it is met from",
    "b": "room behind it",
    "side": "wall of a",
    "at": "cell along it",
    "what": "what the player sees shut",
    "opener": "text of what opens it",
    "key_lives": "room id where the Touchstone stands",
    "taught": "how the player learns of it",
    "look": "how it is drawn: iron, ice, stone",
    "barred": "line while shut",
    "opened": "line once open"
  },
  "footprint": {
    "kind": "edge",
    "cells": [
      1,
      1
    ]
  },
  "topology": {
    "under": [
      "Plan",
      "Level"
    ],
    "takes": [],
    "joins": [
      "Space",
      "Boss",
      "Touchstone"
    ],
    "emits": [
      "link",
      "lock"
    ]
  },
  "twins": [
    "crypt/GraveDoor",
    "mine/Seal",
    "cave/RockfallSeal"
  ],
  "pitfalls": [
    "without a Touchstone (or other place row) whose opens is this id nothing opens it",
    "mine/Seal is a bare lock row with no link: different shape, same name"
  ]
};

Seal.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
