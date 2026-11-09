// crypt kit · RobbersSap
import { h, Fragment } from "../../lib/react.mjs";

// RobbersSap({ id, from, to, opener, ...lock }): a robbers' crawl tunnel from `from` to `to`, barred on the top side and only knocked through from below.
export const RobbersSap = ({ from, to, id, opener, ...lk }) => h(Fragment, null,
  h("lock", { key: `lock-${id}`, id, where: to, opens_from: from, ...lk, ...(opener != null ? { key: opener } : {}) }),
  h("link", { key: `sap-${id}`, a: from, b: to, how: "crawl", lock: id, oneway: true }));

export const meta = {
  "layer": "relation",
  "is": "a crawl tunnel grave-robbers dug into a tomb, boarded from one side so it only opens from below: a one-way shortcut back",
  "tags": [
    "tunnel",
    "crawl",
    "shortcut",
    "one-way",
    "robbers",
    "sap",
    "barrow",
    "crypt",
    "loop"
  ],
  "props": {
    "id": "lock id",
    "from": "room the crawl starts in (where it opens from)",
    "to": "room it comes out in (where it is seen barred)",
    "opener": "text saying what opens it",
    "name": "its name",
    "what": "what the player sees shut"
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
      "Vault"
    ],
    "emits": [
      "lock",
      "link"
    ]
  },
  "twins": [
    "plan/Gate",
    "cave/OneWayGate",
    "seacave/SeaGate",
    "sewer/Sluice"
  ],
  "pitfalls": [
    "it is one-way: if `from` is only reachable through `to` the player is sealed out",
    "both rooms must already exist",
    "a two-way crawl is a plan/Passage with how=\"crawl\", not this"
  ]
};

RobbersSap.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
