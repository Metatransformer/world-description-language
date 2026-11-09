// crypt kit · Posts
import { h } from "../../lib/react.mjs";
import { ring as circle } from "../../lib/ddl.mjs";

// Posts({ at, ring, around, kind, meaning }): the posts or piers holding a roof up: given spots, or a ring round a centre (cover to fight round)
export const Posts = ({ at, ring, around, kind = "pillar", meaning, ...p }) => h("place", { kind,
  at: !ring ? at : around && typeof around !== "function" ? circle(around, ring.r, ring.n ?? 4, ring.phase ?? 0)
    : (r) => circle(around ? around(r) : r.center, ring.r, ring.n ?? 4, ring.phase ?? 0),
  ...(meaning ? { meaning } : {}), ...p });

export const meta = {
  layer: "placement",
  is: "the posts or brick piers holding a roof up: a row down a gallery or a ring round a great room, cover to break a rush",
  tags: ["pillar", "posts", "piers", "columns", "ring", "row", "cover", "roof"],
  props: {
    at: "spot or list of spots for the posts (r.at(u, v) rows), when not a ring",
    ring: "{ r: radius m, n: count (4), phase: turn 0..1 (0) } posts standing in a circle",
    around: "centre of the ring (a Loc or (r) => Loc; the room's centre)",
    kind: "what stands (pillar)",
    meaning: "what the posts are and why they stand",
  },
  footprint: { kind: "area", cells: [6, 6] },
  topology: { under: ["In", "Burial", "Vault", "Cistern"], takes: [], joins: [], emits: ["prop"] },
  twins: ["cave/StoneRing", "mine/Props", "hall/Pillars", "seacave/Stacks"],
  pitfalls: [
    "a ring wider than half the room puts posts in the walls",
    "foes laid near(\"room/pillar#n\") count posts in the order they were placed: adding a post earlier renumbers them",
  ],
};
Posts.meta = meta;
