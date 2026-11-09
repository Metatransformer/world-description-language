// plan kit · Space
import { h, Fragment, useContext } from "../../lib/react.mjs";
import { LevelContext } from "./LevelContext.mjs";
import { Way } from "./Way.mjs";

// Space({ id, rect, name, kind, floor, height, purpose, sightline, from, how, side, at, bat, oneway, lock, secret }): a room on
// its level; from/how/side/at is the way in from the space it opens off (side: from's wall; at: the cell along it)
// Space({ id, rect, name, kind, floor, height, purpose, sightline, from, how, side, at, bat, oneway, lock, secret }, children): a room on its level, with the way in from the space it opens off.
export function Space({ id, from, how, side, at, bat, oneway, lock, secret, kind = "chamber", floor, children, ...room }) {
  const lv = useContext(LevelContext);
  return h(Fragment, null,
    h("room", { key: id, id, kind, level: lv.n, floor: floor ?? lv.floor, ...room }),
    h(Way, { from, to: id, how, side, at, bat, oneway, lock, secret }), children);
}

export const meta = {
  "layer": "space",
  "is": "one room of a dungeon on its level, opened off the room before it by a way in",
  "tags": [
    "room",
    "space",
    "chamber",
    "plan",
    "dungeon",
    "area"
  ],
  "props": {
    "id": "room id",
    "rect": "[x, z, w, d] cells",
    "size": "[w, d] cells with from/dir or northOf/... relational placement",
    "shift": "with northOf/southOf/eastOf/westOf: cells along the shared edge from its west / north end (overrides align)",
    "name": "map name",
    "kind": "room kind: chamber (default) entry corridor hall boss shrine treasury storeroom camp flooded ...",
    "floor": "m, overrides the level's",
    "height": "m",
    "purpose": "why the room exists",
    "sightline": "what a player sees walking in",
    "from": "room id the way in comes from",
    "how": "the way's kind: tunnel (default) arch stair door crawl ramp gate",
    "side": "wall of `from` the way leaves by (n s e w)",
    "at": "cell along that wall",
    "bat": "cell along this room's wall for its end",
    "oneway": "true = the way only goes from → this",
    "lock": "lock id barring the way",
    "secret": "true = a hidden way"
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
      "Level",
      "Plan"
    ],
    "takes": [
      "foe",
      "loot",
      "light",
      "place",
      "In",
      "Stores"
    ],
    "joins": [
      "Space",
      "Passage",
      "Gate",
      "Barrier",
      "Seal"
    ],
    "emits": [
      "room",
      "link"
    ]
  },
  "twins": [
    "cave/Hollow",
    "sewer/Vault",
    "seacave/Grotto",
    "mine/Working",
    "crypt/Burial",
    "crypt/Vault",
    "masonry/Chamber"
  ],
  "pitfalls": [
    "its children are NOT seated in the room: a foe/loot/place inside it with at/uv throws \"give in:\"; wrap them in <In room=\"id\"> (or give in=)",
    "from must name a room already laid above it in the tree",
    "no from = no way in: it needs a Passage or it is unreachable",
    "it draws no shell: the dungeon style's kit builds walls; use a family wrapper (Hollow, Vault, Working) or masonry Chamber for a given stone",
    "side/at left out: the link guesses a shared wall, and doglegs a corridor when the rooms share none"
  ]
};

Space.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
