// wilds kit · BanditCamp: a stockaded camp around a fire: palisade ring with its ways in, tents behind the fire, log seats
// facing it, a cart and loot crates by the north-west gap, a weapon rack on the east side. Every piece is in camp metres from
// the fire (+x east, -z north). The default arrangement is the Greywood camp's; pass `layout` to rearrange, `fire` for the
// fire row (an fx program), children for anything extra. Reusable for any outlaw, raider or hunter camp.
import { h, Fragment } from "../../lib/react.mjs";
import { Site } from "./Site.mjs";
import { CampProp } from "./CampProp.mjs";
import { Palisade } from "./Palisade.mjs";
import { Tent } from "./Tent.mjs";
export const CAMP = {
  radius: 12.5, gaps: [[90, 28], [215, 16], [330, 10]],
  cart: [[-6.5, 0, 8.20001220703125, 25]],
  crates: [[-8, 0, 3.5, 12], [-8.400001525878906, 0, 4.79998779296875, -20], [9, 0, -2.5, 40]],
  racks: [[8.5, 0, 2, -90]],
  seats: [[-2, 0, -4.29998779296875, 0], [-4.299999237060547, 0, -1.399993896484375, 80], [0.20000076293945312, 0, -0.399993896484375, -55]],
  tents: [[-6, 0, -8, 200], [6, 0, -7.5, 155]],
};
export function BanditCamp({ id, at, layout = CAMP, prefix = "camp", fire, children }) {
  const L = { ...CAMP, ...layout }, P = (a) => [a[0], a[1], a[2]];
  return h(Site, { id, at }, h(Fragment, null,
    ...L.cart.map((c, i) => h(CampProp, { name: `${prefix}-cart${L.cart.length > 1 ? `-${i + 1}` : ""}`, kind: "cart", at: P(c), yaw: c[3] })),
    ...L.crates.map((c, i) => h(CampProp, { name: `${prefix}-crate-${i + 1}`, kind: "crate", at: P(c), yaw: c[3], search: true })),
    fire ?? null,
    h(Palisade, { name: `${prefix}-palisade`, at: [0, 0, 0], radius: L.radius, gaps: L.gaps }),
    ...L.racks.map((c, i) => h(CampProp, { name: `${prefix}-rack${L.racks.length > 1 ? `-${i + 1}` : ""}`, kind: "rack", at: P(c), yaw: c[3] })),
    ...L.seats.map((c, i) => h(CampProp, { name: `${prefix}-seat-${i + 1}`, kind: "seat", at: P(c), yaw: c[3] })),
    ...L.tents.map((c, i) => h(Tent, { name: `${prefix}-tent-${i + 1}`, at: P(c), yaw: c[3] })),
    children ?? null));
}
export const meta = {
  layer: "meaning",
  is: "a stockaded outlaw camp around a fire: palisade ring with gaps, tents, log seats facing the fire, a cart, searchable loot crates and a weapon rack",
  tags: ["camp", "bandit", "outlaw", "raider", "palisade", "tent", "campfire", "loot", "site", "wilds"],
  props: { id: "content/site id", at: "[x, y, z] of the fire in the Wilds frame", layout: "override any of radius, gaps, cart, crates, racks, seats, tents ([x, y, z, yaw] in camp metres)", prefix: "row name prefix (default camp)", fire: "the fire element (a Keep of its fx row)", children: "extra pieces in camp metres" },
  footprint: { kind: "area", cells: [13, 13], height: 3 },
  topology: { under: ["Wilds"], takes: ["fire", "pieces"], joins: ["a path to the nearest road through a palisade gap"], emits: ["row"] },
  twins: ["wilds/Site"],
  pitfalls: ["`at` is the fire; y is the ground there and every piece shares it, so keep the camp on a flat pad"],
};
BanditCamp.meta = meta;
