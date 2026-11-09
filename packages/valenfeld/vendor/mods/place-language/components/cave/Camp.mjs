// cave kit · Camp
import { h, Fragment } from "../../lib/react.mjs";

// Camp({ fire, bed, journal, pack, crook, embers }): someone's last camp: a fire ring at its centre, the rest round it.
//   each is a { meaning, at?, lore?, flag? } row or omitted; journal stands beside the bedroll
export const Camp = ({ fire, bed, journal, pack, crook, embers }) => h(Fragment, null,
  fire && h("place", { kind: "firering", at: (r) => r.center, ...fire }),
  bed && h("place", { kind: "bedroll", at: (r) => r.wall("s", "quarter"), ...bed }),
  journal && h("place", { kind: "journal", ...journal }),
  pack && h("place", { kind: "pack", at: (r) => r.corner("ne"), ...pack }),
  crook && h("place", { kind: "crook", at: (r) => r.corner("nw"), ...crook }),
  embers && h("light", { kind: "embers", y: 0.3, ...embers }));

export const meta = {
  layer: "meaning",
  is: "someone's abandoned last camp: a fire ring in the middle, bedroll, journal, pack and crook round it, maybe embers still warm",
  tags: ["camp", "story", "clue", "firering", "bedroll", "journal", "abandoned"],
  props: { fire: "{ meaning, at?, lore? } fire ring (room centre)", bed: "{ meaning, at? } bedroll (south wall)", journal: "{ meaning, at, lore, flag } a readable journal (give at)", pack: "{ meaning } pack (ne corner)", crook: "{ meaning } crook (nw corner)", embers: "{ at, meaning } a low ember light" },
  footprint: { kind: "area", cells: [4, 4] },
  topology: { under: ["In"], takes: [], joins: [], emits: ["place", "light"] },
  twins: ["wilds/CampProp", "wilds/Tent"],
  pitfalls: ["journal has no default spot: omit at and it stands at the room's origin", "embers need at too", "a room under 4x4 cells crowds the corners into the fire"],
};

Camp.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
