// seacave kit · Wreck
import { h, Fragment } from "../../lib/react.mjs";
import { Kept } from "./Kept.mjs";

// Wreck({ at, pieces, ribs }): a ship wedged on the shingle: its held pieces as [id, dx, dz, y, why?], and the broken stern's ribs
export const Wreck = ({ at, pieces, ribs = [] }) => h(Fragment, null,
  pieces.map(([id, dx, dz, y, why]) => h(Kept, { key: id, id, at: (r) => at(r).by(dx, dz), y, ...(why ? { why } : {}) })),
  ribs.map(([id, dx, dz], i) => h(Kept, { key: id, id, at: (r) => at(r).by(dx, dz), why: "the broken stern's ribs on the shingle" })));

// meta card (lib/meta.mjs)
export const meta = {
  layer: "dressing",
  is: "a ship wedged on the shingle inside a sea cave: its held hull, deck, mast and lantern pieces seated around one spot, with the broken stern's ribs",
  tags: ["seacave", "wreck", "ship", "hull", "ribs", "set-piece", "boat"],
  props: {"at": "the wreck's centre: a room-spot function (r) => r.center", "pieces": "[[id, dx, dz, y, why?]]: held rows offset from at in m", "ribs": "[[id, dx, dz]]: held rib rows offset from at in m"},
  footprint: { kind: "area", cells: [6, 6] },
  topology: { under: ["In"], takes: [], joins: [], emits: ["thing"] },
  twins: [],
  pitfalls: ["every id must exist as a held row: it is Kept many times over", "at must be a function returning a Loc (it calls .by)", "offsets are metres, not cells"],
};

Wreck.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
