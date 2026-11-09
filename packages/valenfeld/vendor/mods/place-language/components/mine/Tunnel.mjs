// mine kit · Tunnel
import { h } from "../../lib/react.mjs";

// Tunnel({ a, b, side, t, how, note }): a way between two cuts, placed by t along a's wall
export const Tunnel = ({ a, b, ...w }) => h("link", { key: `tunnel-${a}-${b}`, a, b, ...w });

// meta card (lib/meta.mjs)
export const meta = {
  layer: "relation",
  is: "a passage between two rooms of an existing dig, placed by how far along the first room's wall it opens",
  tags: ["mine", "as-built", "tunnel", "passage", "link", "corridor"],
  props: { a: "room it leaves from", b: "room it reaches", side: "a's wall n/s/e/w", t: "0..1 along that wall", bt: "0..1 along b's wall", how: "link kind (tunnel, stair, ramp, door ...)", lock: "lock id that bars it", oneway: "true: a to b only", note: "design note" },
  footprint: { kind: "edge" },
  topology: { under: ["Dig", "Mine"], takes: [], joins: ["Cut", "Working"], emits: ["link"] },
  twins: ["plan/Passage", "plan/Way", "sewer/Tunnel", "masonry/Door"],
  pitfalls: ["two Tunnels between the same a and b share a key and collide", "a side that doesn't face b routes a long dog-leg", "for a mine way off its parent use from= on Gallery/Stope instead"],
};

Tunnel.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
