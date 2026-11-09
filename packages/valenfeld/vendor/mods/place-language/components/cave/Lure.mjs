// cave kit · Lure
import { h } from "../../lib/react.mjs";

// Lure({ at, lands, meaning, radius, seconds }): meat at a drop's edge; tipped over, it lands at the far end of \`lands\` and the beasts there
//   leave their post to feed, heads down, seeing a third as far (scripts/enemies.js lureFor). A choice, not a lock: sneak past, or fight them fed
//   laid: a meal already down that the pack is at from the start (a teach: feeding wolves do not look up); radius 8 unless said
export const Lure = ({ at, lands, meaning, radius, seconds, name, laid }) => h("place", { kind: "lure", at, lands, meaning, ...(laid ? { laid: true } : {}), ...(radius ? { radius } : {}), ...(seconds ? { seconds } : {}), ...(name ? { name } : {}) });

export const meta = {
  layer: "mechanism",
  is: "meat left at a drop's edge: tip it over and the beasts below leave their post to feed, heads down, a choice to sneak past or fight them fed",
  tags: ["lure", "bait", "stealth", "wolves", "puzzle", "meat", "distraction"],
  props: { at: "where the meat rests", lands: "room it falls into (it lands at that room's far end)", meaning: "why it is there", radius: "metres of beasts drawn to feed (8)", seconds: "how long they feed", name: "prompt name (the cached ewe)", laid: "already down at the start: a teach, the pack is at it" },
  footprint: { kind: "point" },
  topology: { under: ["In"], takes: [], joins: ["Beasts"], emits: ["place"] },
  twins: [],
  pitfalls: ["lands must be a room reachable by a drop from here, or the meat falls nowhere", "only non-boss beasts within radius feed: a boss ignores it", "a laid lure is not interactable"],
};

Lure.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
