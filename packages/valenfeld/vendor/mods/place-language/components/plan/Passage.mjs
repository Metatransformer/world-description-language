// plan kit · Passage
import { h } from "../../lib/react.mjs";
import { Way } from "./Way.mjs";

// Passage({ a, b, how, side, at, bat, oneway, lock, secret }): one more way between two spaces already cut (a loop, a back door).
export const Passage = ({ a, b, ...w }) => h(Way, { from: a, to: b, ...w });

export const meta = {
  "layer": "relation",
  "is": "an extra way between two rooms that already exist: a loop, a back door, a secret tunnel",
  "tags": [
    "passage",
    "loop",
    "back door",
    "shortcut",
    "secret",
    "link",
    "tunnel",
    "corridor"
  ],
  "props": {
    "a": "room it leaves",
    "b": "room it reaches",
    "how": "tunnel (default) arch stair door crawl ramp",
    "side": "wall of a it leaves by",
    "at": "cell along that wall",
    "bat": "cell along b's wall",
    "oneway": "only a → b",
    "lock": "lock id barring it",
    "secret": "hidden"
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
      "Boss"
    ],
    "emits": [
      "link"
    ]
  },
  "twins": [
    "sewer/Culvert",
    "mine/Tunnel",
    "sewer/Junction", "sewer/Tunnel", "mine/Tunnel"
  ],
  "pitfalls": [
    "both rooms must already be laid, so put it after them",
    "rooms that share no wall get a dogleg corridor guessed from their centres; give side/at to control it",
    "a lock named here needs a lock row (Barrier/Seal) or it bars nothing"
  ]
};

Passage.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
