// sewer kit · GrateShaft
import { h, Fragment } from "../../lib/react.mjs";

// GrateShaft({ at, meaning }): a street grate high overhead; a shaft of daylight and dust comes down through its bars
export const GrateShaft = ({ at, meaning = "a street grate overhead: daylight, and feet going over" }) => h(Fragment, null,
  h("place", { kind: "grate-shaft", at, meaning }), h("light", { kind: "grate", at, y: 4, meaning: "daylight through the grate" }));

// card: GrateShaft: a street grate high overhead and the shaft of daylight and dust coming down through it.
export const meta = {
  "layer": "light",
  "is": "a street grate far overhead letting a shaft of daylight and dust down into the sewer",
  "tags": [
    "grate",
    "daylight",
    "shaft",
    "light",
    "street",
    "sewer",
    "overhead",
    "dust"
  ],
  "props": {
    "at": "spot on the floor the light lands on",
    "meaning": "what is up there"
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
      "In",
      "Vault",
      "Tunnel",
      "Channel",
      "Cistern"
    ],
    "takes": [],
    "joins": [],
    "emits": [
      "prop",
      "light"
    ]
  },
  "twins": [
    "cave/Daylight",
    "seacave/Skylight"
  ],
  "pitfalls": ["not common/Light alone: it also places the grate it shines through; a bare light is sewer/Torch or common/Light kind=grate", 
    "the light hangs at 4 m: in a room lower than ~4.5 m it pokes through the ceiling",
    "it is a light, not a way out: an exit by grate and ladder is crypt/Shaft",
    "at is required"
  ]
};

GrateShaft.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
