// wilds kit · CampProp
import { piece } from "./_shared.mjs";

// CampProp({ name, kind: cart|crate|rack|seat, at, yaw, search }): camp gear; search makes it a container
export const CampProp = ({ name, kind, at, yaw, search, why }) => piece("campprop", name, { at, yaw, prim: { primitive: { params: { kind } } },
  ...(search ? { state: { act: "Search", name: kind[0].toUpperCase() + kind.slice(1), table: `box-${kind}` }, tags: ["interactable"] } : {}), why });

// the card: what this component means, for picking and reasoning (contract: lib/meta.mjs)
export const meta = {
  layer: "dressing",
  is: "a piece of gear left about a camp (a cart, a crate, a weapon rack, a log seat), searchable when it holds something",
  tags: ["camp", "cart", "crate", "rack", "seat", "bandit", "gear", "search"],
  props: { name: "suffix: the row is <wilds id>/<name>", kind: "cart | crate | rack | seat", at: "[x, y, z] m in the Wilds root's frame (y is ground height there: read it off the terrain)", yaw: "facing, degrees", search: "true: a player can Search it (table box-<kind>)", why: "a note of why it stands here (shown in the design view)" },
  footprint: { kind: "point", cells: [1, 1] },
  topology: { under: ["Wilds", "Site"], takes: [], joins: [], emits: ["row"] },
  twins: ["hall/Container", "seacave/Prop", "sewer/Crates", "sewer/Barrels"],
  pitfalls: ["search on a kind with no box-<kind> table opens empty", "the campfire itself is not a CampProp (still a Keep)"],
};

CampProp.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
