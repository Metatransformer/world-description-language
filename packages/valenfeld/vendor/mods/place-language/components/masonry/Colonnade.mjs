// masonry kit · Colonnade
import { h } from "../../lib/react.mjs";
import { the } from "../../lib/ddl.mjs";

// Colonnade({ room, u, v, kind, meaning }): posts standing in rows across a room, at every u × v fraction (rows by v, then across by u).
export const Colonnade = ({ room, u = [0.25, 0.75], v = [0.3, 0.7], kind = "pillar", meaning }) =>
  h("place", { kind, at: v.flatMap((b) => u.map((a) => the(room).at(a, b))), ...(meaning ? { meaning } : {}) });

export const meta = {
  layer: "placement",
  is: "stone columns or posts standing in rows across a hall, cover to fight round and the bones of the roof",
  tags: ["pillar", "column", "post", "colonnade", "piers", "cover", "rows", "hall"],
  props: {
    room: "room id",
    u: "fractions west to east where each row's posts stand (default [0.25, 0.75])",
    v: "fractions north to south of each row (default [0.3, 0.7]); one value = a single pair",
    kind: "what stands (default pillar)",
    meaning: "what the posts are",
  },
  footprint: { kind: "area", cells: [6, 6], height: 4 },
  topology: { under: ["Plan", "Level", "In", "Chamber"], takes: [], joins: [], emits: ["prop"] },
  twins: ["cave/StoneRing", "cave/FeedingFloor", "verbs/grid", "layout/Grid"],
  pitfalls: [
    "posts are numbered row by row (v outer, u inner): reordering u or v renumbers <room>/pillar#i",
    "a post on the walk line between doors blocks the way: keep u off a doorway's line",
  ],
};

Colonnade.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
