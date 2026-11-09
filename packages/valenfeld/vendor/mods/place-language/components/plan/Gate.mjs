// plan kit · Gate
import { h } from "../../lib/react.mjs";
import { Barrier } from "./Barrier.mjs";

// Gate({ id, a, b, what, opener, taught }): a gate barred on b's side: it lifts only from b, a shortcut back once you've gone round.
export const Gate = ({ b, ...p }) => h(Barrier, { b, how: "gate", key_lives: b, opens_from: b, ...p });

export const meta = {
  "layer": "relation",
  "is": "a gate that only opens from the far side: a shortcut back that unlocks once you have come round to it",
  "tags": [
    "gate",
    "shortcut",
    "one-way",
    "loop",
    "latch",
    "door",
    "winch"
  ],
  "props": {
    "id": "lock id",
    "a": "room it is first seen from (shut)",
    "b": "room it lifts from",
    "side": "wall of a",
    "at": "cell along it",
    "what": "what the player sees shut",
    "opener": "what lifts it, on b's side",
    "taught": "how the player learns of it",
    "how": "link kind (gate)",
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
      "Space"
    ],
    "emits": [
      "link",
      "lock"
    ]
  },
  "twins": [
    "cave/OneWayGate",
    "seacave/SeaGate",
    "sewer/Sluice",
    "crypt/RobbersSap"
  ],
  "pitfalls": [
    "b must be reachable some other way, or the gate is a wall forever",
    "the key lives in b by default: nothing to place unless the opener is a separate object"
  ]
};

Gate.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
