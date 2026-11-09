// wilds kit · Palisade
import { piece } from "./_shared.mjs";

// Palisade({ name, at, radius, gaps: [[bearing, width], …] }): a stake ring with its ways in
export const Palisade = ({ name, at, yaw = 0, radius, gaps, why }) => piece("palisade", name, { at, yaw, prim: { primitive: { params: { gaps, radius } } }, why });

// the card: what this component means, for picking and reasoning (contract: lib/meta.mjs)
export const meta = {
  layer: "space",
  is: "a ring of sharpened stakes fencing a camp, with gaps where a player can walk in",
  tags: ["palisade", "stakes", "fence", "wall", "camp", "ring", "defence"],
  props: { name: "suffix: the row is <wilds id>/<name>", at: "[x, y, z] m in the Wilds root's frame (y is ground height there: read it off the terrain)", yaw: "turns the ring and its gaps, degrees", radius: "ring radius m", gaps: "[[bearing°, width°], …]: the openings, bearings measured round the ring", why: "a note of why it stands here (shown in the design view)" },
  footprint: { kind: "area", cells: [12, 12] },
  topology: { under: ["Wilds", "Site"], takes: [], joins: [], emits: ["row"] },
  twins: [],
  pitfalls: ["no gap = a sealed camp nobody can reach", "gaps are angles, not metres: a 10° gap on a 12.5 m ring is ~2 m", "a gap that faces no path leaves the camp off the navigable web"],
};

Palisade.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
