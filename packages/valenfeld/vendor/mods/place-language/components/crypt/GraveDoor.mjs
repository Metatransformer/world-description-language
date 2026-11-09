// crypt kit · GraveDoor
import { h, Fragment } from "../../lib/react.mjs";

// GraveDoor({ id, a, b, key: { in, at, name, said, kind }, ...lock }): a sealed door and the thing that opens it, wherever it lives.
// opener: what opens it ({ in, at, name, said, kind } places the thing; a string only describes it). `key` is React's own word, so JSX keeps it for itself.
// GraveDoor({ id, a, b, how, opener, ...lock }): a sealed grave door from a to b, the lock row, and the thing that opens it placed where it lives.
export const GraveDoor = ({ id, a, b, how = "grave-seal", opener, key = opener, ...lk }) => h(Fragment, null,
  h("lock", { key: `lock-${id}`, id, ...lk, ...(typeof key === "string" ? { key } : {}) }),
  b && h("link", { key: `door-${id}`, a, b, how, lock: id }),
  key && h("place", { key: `key-${id}`, kind: key.kind ?? "boulder", in: key.in, at: key.at, opens: id, name: key.name, act: key.act ?? "Set", meaning: key.meaning, said: key.said }));

export const meta = {
  "layer": "relation",
  "is": "a sealed grave door between two crypt rooms, with the object that opens it (a seal-stone, a key) set somewhere else in the tomb",
  "tags": [
    "door",
    "seal",
    "grave seal",
    "lock",
    "key",
    "crypt",
    "barrow",
    "puzzle"
  ],
  "props": {
    "id": "lock id",
    "a": "room the door is met from",
    "b": "room behind it (omit to write the lock alone)",
    "how": "link kind (default grave-seal; kings-door etc.)",
    "opener": "what opens it: { in, at, name, said, kind, act, meaning } places that thing in room `in`; a string only describes it",
    "name": "the door's name",
    "what": "what the player sees shut",
    "where": "room id where it is seen shut",
    "taught": "how the player learns how to open it",
    "barred": "line shown while shut",
    "opened": "line shown once open"
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
      "Barrow",
      "Tier",
      "Plan"
    ],
    "takes": [],
    "joins": [
      "Burial",
      "Heart",
      "Vault"
    ],
    "emits": [
      "lock",
      "link",
      "place"
    ]
  },
  "twins": [
    "plan/Seal",
    "plan/Barrier",
    "cave/Rockfall",
    "mine/CaveIn",
    "seacave/Sump"
  ],
  "pitfalls": [
    "write opener, never key: JSX swallows `key` as identity",
    "both rooms must already exist (put it after them in the tree)",
    "an opener object without `in` places the opening thing nowhere sensible; a string opener places nothing, so the door is decorative unless something else names its id",
    "if b is already joined by a Burial's from, a second link doubles the way: let one of them own it"
  ]
};

GraveDoor.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
