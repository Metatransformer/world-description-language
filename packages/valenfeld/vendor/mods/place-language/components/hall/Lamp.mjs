// hall kit · Lamp
import { useHall, row, pos } from "./_shared.mjs";

// Lamp({ id, at, y, color, intensity, distance }): a light hung in the hall
export function Lamp({ id, at, y = 2, color = "oklch(0.82 0.12 60)", intensity = 26, distance = 6, parent, why }) {
  // parent: the lamp rides that row (a shell); at and y are then in the parent's own metres
  const fp = parent ? { x: at[0], y, z: at[1] } : pos(useHall(), at, y);
  return row(parent ? `${parent}/${id}` : id, { feetPosition: fp, id: parent ? `${parent}/${id}` : id, light: { color, distance, intensity, kind: "point" }, ...(parent ? { parent } : {}) }, why);
}

// the card: what this component means, for picking and reasoning (contract: lib/meta.mjs)
export const meta = {
  layer: "light",
  is: "a warm light hanging in a room (over an anvil, a table, the common room) that lights what is near it",
  tags: ["lamp", "light", "lantern", "warm", "point", "interior"],
  props: { id: "row id", at: "[x, z] m", y: "height m (default 2, absolute, not floor-relative)", color: "light colour (default warm oklch(0.82 0.12 60))", intensity: "brightness (default 26)", distance: "reach m (default 6)", parent: "a row id the lamp rides (its id becomes <parent>/<id>, at local)", why: "a note of why it stands here (shown in the design view)" },
  footprint: { kind: "point", height: 2 },
  topology: { under: ["Interior", "Wing"], takes: [], joins: [], emits: ["row", "light"] },
  twins: ["wilds/Lamp", "seacave/Lantern", "sewer/Torch", "seacave/Brazier", "sewer/Candles"],
  pitfalls: ["not common/Light: it emits a placed row in metres for interiors, not a dungeon light row", "it is only the light: no lamp mesh is drawn (ArcaneLamp is the standing lamp)", "y is absolute: a lamp in a cellar needs its own y", "every lamp is a live point light: a few per room, phones pay for each"],
};

Lamp.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
