// plan kit · Barrier
import { h, Fragment } from "../../lib/react.mjs";
import { Barrier as CommonBarrier } from "../common/Barrier.mjs";

// Barrier({ id, a, b, how, side, at, what, opener, key_lives, taught, opens_from, barred, opened, act, name }): the way from a
// to b is shut until something opens it: the lock row and the barred link, together. opener is the lock's key (JSX keeps
// `key` as identity). The thing that opens it (a winch, a boulder) is placed where the key lives, naming this id.
// Barrier({ id, a, b, how, side, at, what, opener, key_lives, taught, opens_from, barred, opened, act, name }): the way from a to b, shut until something opens it: the barred link and its lock row together.
export const Barrier = (p) => CommonBarrier(p);

export const meta = {
  "layer": "relation",
  "is": "a way between two rooms that is shut until something somewhere opens it: a gate, a fall of rock, a portcullis",
  "tags": [
    "barrier",
    "lock",
    "gate",
    "blocked",
    "barred",
    "puzzle",
    "key",
    "door"
  ],
  "props": {
    "id": "lock id",
    "a": "room the barrier is met from (the lock's where)",
    "b": "room behind it",
    "how": "link kind (default gate)",
    "side": "wall of a",
    "at": "cell along it",
    "what": "what the player sees shut",
    "opener": "what opens it (text; JSX keeps `key`)",
    "key_lives": "room id where the opener is found",
    "taught": "how the player learns how to open it",
    "opens_from": "room it can be opened from",
    "barred": "line shown while shut",
    "opened": "line shown once open",
    "act": "verb on the opener",
    "name": "its name",
    "look": "how it is drawn (iron, ice ...)",
    "style": "lock style"
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
      "Touchstone"
    ],
    "emits": [
      "link",
      "lock"
    ]
  },
  "twins": ["common/Barrier", 
    "cave/Rockfall",
    "mine/CaveIn",
    "seacave/Sump",
    "crypt/GraveDoor"
  ],
  "pitfalls": [
    "it writes its own link: don't also give b a from to a, or there are two ways and one is open",
    "it places no opener: put the thing that opens it (Touchstone, Boulder, winch) in key_lives naming this id",
    "write opener, never key"
  ]
};

Barrier.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
