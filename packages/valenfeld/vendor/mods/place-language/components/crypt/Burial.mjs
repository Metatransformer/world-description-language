// crypt kit · Burial
import { h, useContext } from "../../lib/react.mjs";
import { Chamber } from "../masonry/index.mjs";
import { TierContext } from "./TierContext.mjs";

// Burial({ id, ring, dir, size, from, how, ...room }): a chamber on its tier's ring round the heart (or rect/from+dir as any room),
//   joined to `from` by `how` (stair, arch, door, crawl); a lock on the way rides `lock`.
// Burial({ id, ring, dir, size, from, how, lock, side, t, bt, wall, ground, ceil, ...room }, children): a grave chamber on its tier's ring round the heart, joined to `from` by `how`.
export const Burial = ({ id, ring, dir, from, how = "arch", lock, side, t, bt, wall = "fs", ground = "earth", ceil = "earth", children, ...p }) => {
  const tr = useContext(TierContext), place = ring != null ? { around: tr.heart, ring, dir } : !p.rect && from ? { from, dir } : {};
  return h(Chamber, { id, kind: "chamber", wall, ground, ceil, level: tr.n, floor: p.floor ?? tr.floor, ...place, ...p },
    h("kit", { style: tr.kit }), from && h("link", { key: `way-${from}`, a: from, b: id, how, ...(lock ? { lock } : {}), ...(side ? { side } : {}), ...(t != null ? { t } : {}), ...(bt != null ? { bt } : {}) }), children);
};

export const meta = {
  "layer": "space",
  "is": "a grave chamber in a burial mound, set on its ring round the central tomb and reached from the chamber before it",
  "tags": [
    "burial",
    "grave",
    "chamber",
    "crypt",
    "barrow",
    "tomb",
    "room",
    "ring"
  ],
  "props": {
    "id": "room id",
    "ring": "cells out from the heart's centre toward dir (ring placement)",
    "dir": "compass direction n s e w ne nw se sw from the heart (ring) or from `from` (beside placement)",
    "size": "[w, d] cells",
    "rect": "[x, z, w, d] cells: exact placement instead of ring/from",
    "from": "room id it opens off; also writes the link",
    "how": "what the way in is: arch (default), stair, door, crawl",
    "lock": "lock id barring the way in",
    "side": "wall of `from` the way leaves by",
    "t": "fraction 0..1 along from's wall for the doorway",
    "bt": "fraction along this room's wall for its end of the doorway",
    "wall": "masonry: fs fieldstone (default) | brick | vault",
    "ground": "earth (default) | flag | wet",
    "ceil": "earth (default) | vault | oak | iron",
    "floor": "m, overrides the tier's floor",
    "height": "m",
    "kind": "room kind (chamber)",
    "name": "map name",
    "purpose": "why the room exists",
    "sightline": "what a player sees walking in"
  },
  "footprint": {
    "kind": "room",
    "cells": [
      6,
      5
    ],
    "height": 3.5
  },
  "topology": {
    "under": [
      "Tier",
      "Barrow"
    ],
    "takes": [
      "BurialNiche",
      "GraveGoods",
      "foe",
      "light",
      "place"
    ],
    "joins": [
      "Burial",
      "Heart",
      "GraveDoor",
      "RobbersSap"
    ],
    "emits": [
      "room",
      "shell",
      "kit",
      "link"
    ]
  },
  "twins": [
    "crypt/Vault",
    "plan/Space",
    "cave/Hollow",
    "sewer/Vault",
    "mine/Working",
    "seacave/Grotto",
    "masonry/Chamber"
  ],
  "pitfalls": [
    "ring with no Barrow heart (or a heart not yet laid) throws: room needs rect, or size + from + dir",
    "ring rooms on the same tier can overlap: nothing pushes them apart, so pick distinct dirs/rings",
    "from + dir places it flush against from with no gap; use ring or rect for a mound layout",
    "a lock named here must exist as a GraveDoor/lock row or the way is barred by nothing"
  ]
};

Burial.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
