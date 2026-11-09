// crypt kit · Shaft
import { h } from "../../lib/react.mjs";
import { Chamber } from "../masonry/index.mjs";

// Shaft({ table, id, name, purpose, ladder, grate, extra }): the way up and out of the dungeon: a table room with its held ladder and grate and the exit row.
export function Shaft({ table, id, ladder, grate, extra = [], purpose, name }) {
  return h(Chamber, { table, id, name, kind: "exit", purpose },
    h("hold", { key: "grate", id: grate.id, uv: grate.uv }), h("hold", { key: "ladder", id: ladder.id, uv: ladder.uv }),
    extra.map(([eid, u, v]) => h("hold", { key: eid, id: eid, uv: [u, v] })),
    h("exit", { at: ladder.uv, rows: [ladder.id, grate.id], to: ladder.to }));
}

export const meta = {
  "layer": "space",
  "is": "the shaft and ladder up to the street: the dungeon's way out, a grate overhead and a ladder that leaves the place",
  "tags": [
    "exit",
    "shaft",
    "ladder",
    "grate",
    "way out",
    "escape",
    "street",
    "up"
  ],
  "props": {
    "table": "generator room table (required): the shaft's shape",
    "id": "room id in that table",
    "name": "map name",
    "purpose": "why the room exists",
    "ladder": "{ id, uv: [u, v], to: \"+place#door\" } the held ladder row and where it leads",
    "grate": "{ id, uv } the held grate row",
    "extra": "[[id, u, v]] more held rows standing in the shaft"
  },
  "footprint": {
    "kind": "room",
    "cells": [
      2,
      2
    ],
    "height": 6
  },
  "topology": {
    "under": [
      "Plan",
      "Level"
    ],
    "takes": [],
    "joins": [
      "link"
    ],
    "emits": [
      "room",
      "shell",
      "hold",
      "exit"
    ]
  },
  "twins": [
    "sewer/GrateShaft",
    "mine/Adit", "mine/Shaft"
  ],
  "pitfalls": ["not mine/Shaft: this is an exit room with held rows; mine/Shaft is a lift relation between two levels", 
    "needs table: there is no rect form, it throws without a matching row",
    "ladder and grate are both required objects",
    "it writes the dungeon's single exit: a second exit row replaces the first",
    "mine/Shaft is a lift between levels, not a way out"
  ]
};

Shaft.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
