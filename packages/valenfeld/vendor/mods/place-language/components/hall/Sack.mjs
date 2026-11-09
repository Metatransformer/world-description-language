// hall kit · Sack
import { useHall, row, pos } from "./_shared.mjs";

// Sack({ id, at, y, yaw }): a canvas sack to search
export function Sack({ id, at, y = 0, yaw = 0, table = "box-sack", why }) {
  return row(id, { feetPosition: pos(useHall(), at, y), id, material: { color: "oklch(0.62 0.05 75)", texture: "cdn/texture-canvas-weathered.png" }, primitive: { kind: "sphere", radius: 0.35 },
    rotation: yaw, scale: { x: 1, y: 1.2, z: 0.9 }, state: { act: "Search", name: "Sack", table }, tags: ["interactable", "container"] }, why);
}

// the card: what this component means, for picking and reasoning (contract: lib/meta.mjs)
export const meta = {
  layer: "loot",
  is: "a lumpy canvas sack on the floor a player can search",
  tags: ["sack", "bag", "container", "search", "loot", "storage"],
  props: { id: "row id", at: "[x, z] m", y: "height m (default 0, NOT the floor)", yaw: "facing, degrees", table: "loot table (default box-sack)", why: "a note of why it stands here (shown in the design view)" },
  footprint: { kind: "point", cells: [1, 1], height: 0.8 },
  topology: { under: ["Interior", "Wing"], takes: [], joins: [], emits: ["row"] },
  twins: ["seacave/Prop", "wilds/CampProp"],
  pitfalls: ["y defaults to 0, not the hall floor: on a raised floor it sinks", "it is a squashed sphere with no collider; Container kind=sack is the kit-mesh sack"],
};

Sack.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
