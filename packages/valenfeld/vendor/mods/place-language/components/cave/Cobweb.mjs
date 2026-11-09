// cave kit · Cobweb
import { h, Fragment } from "../../lib/react.mjs";

// Cobweb({ corners, size, y, why }): a pale cobweb sheet strung across each named corner of the room it stands in
export const Cobweb = ({ corners = ["nw"], size = 1.8, y, why }) => h(Fragment, null,
  ...(Array.isArray(corners) ? corners : [corners]).map((c) =>
    h("place", { key: `web-${c}`, kind: "web", at: (r) => r.corner(c, 0.4), size, ...(y != null ? { y } : {}), meaning: why ?? "old webs nobody has walked through" })));

export const meta = {
  layer: "dressing",
  is: "a pale cobweb sheet strung across a room's corner: radial threads and rings, the sign that nothing has passed in a long while or that something spins here",
  tags: ["web", "cobweb", "spider", "corner", "dressing", "abandoned", "strands", "dusty"],
  props: { corners: "corner or list of corners it hangs in: nw | ne | sw | se", size: "how far the sheet reaches along each wall, metres (1.8)", y: "top of the sheet above the floor, metres (default: under the ceiling, at most 3.6)", why: "why the webs are here" },
  footprint: { kind: "point", cells: [1, 1], height: 3.6 },
  topology: { under: ["In"], takes: [], joins: [], emits: ["prop"] },
  twins: ["cave/SpiderNest", "sewer/Drip", "masonry/Dressing", "crypt/Ossuary"],
  pitfalls: ["each sheet is ~20 thin strand rows: a few corners per room, not every corner of every room", "a corner with a door in it gets a web across the doorway: pick the corners away from links", "it is dressing only: the spiders are cave/SpiderNest"],
};
Cobweb.meta = meta;
