// wilds kit · Lamp
import { useWilds, row, xyz, placed } from "./_shared.mjs";

// Lamp({ name, at, color, intensity, distance }): a light burning out here
export function Lamp({ name, at, color, intensity, distance, why }) {
  const w = useWilds(), id = `${w.id}/${name}`;
  return row(id, { feetPosition: xyz(placed(w, at)), id, light: { color, distance, intensity, kind: "point" }, parent: w.id }, why);
}

// the card: what this component means, for picking and reasoning (contract: lib/meta.mjs)
export const meta = {
  layer: "light",
  is: "a light burning out in the country (a lantern in a ruin, a glow by a camp) that a player sees from a distance",
  tags: ["lamp", "light", "lantern", "glow", "night", "outdoors"],
  props: { name: "suffix: the row is <wilds id>/<name>", at: "[x, y, z] m in the Wilds root's frame (y is ground height there: read it off the terrain)", color: "light colour", intensity: "brightness", distance: "reach m", why: "a note of why it stands here (shown in the design view)" },
  footprint: { kind: "point" },
  topology: { under: ["Wilds", "Site"], takes: [], joins: [], emits: ["row", "light"] },
  twins: ["hall/Lamp", "seacave/Lantern", "sewer/Torch", "seacave/Brazier"],
  pitfalls: ["not common/Light: it emits a placed row in metres for regions, not a dungeon light row", "no defaults: leave color/intensity/distance out and it is dark", "only the light, no lamp mesh", "every one is a live point light"],
};

Lamp.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
