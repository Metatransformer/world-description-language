// plan kit · Hold: THE one way any family carries an authored row whole into a re-described place.
// Harvested Nov 7 from five copies (masonry/Hold, mine/Kept, seacave/Kept and the hall/wilds Keep idea): each kit now
// re-exports this under its own word, so a fix to how held rows land is made once.
import { h } from "../../lib/react.mjs";

// Hold({ id, at | uv, y, in, why, keyAs }): the live row `id`, carried whole and re-seated at a spot. keyAs = the tree key (default id).
export const Hold = ({ id, keyAs, ...p }) => h("hold", { key: keyAs ?? id, id, ...p });

export const meta = {
  layer: "placement",
  is: "an authored thing (a quest object, a set piece, a wreck's hull) carried whole by id from what already stands and re-seated at a named spot",
  tags: ["hold", "kept", "keep", "as-built", "authored", "set-piece", "quest", "carry", "shared"],
  props: { id: "the existing row's id", at: "spot: a room-spot function, Loc, { u, v } or [x, z]", uv: "{ u, v } spot", y: "height m override", in: "room id when no room is handed down", why: "why it is held by hand", keyAs: "tree key (kits keep their own: masonry id, mine/seacave kept-<id>)" },
  footprint: { kind: "point" },
  topology: { under: ["In", "Space", "Chamber", "Cut", "Working"], takes: [], joins: [], emits: ["hold"] },
  twins: ["masonry/Hold", "mine/Kept", "seacave/Kept", "hall/Keep", "wilds/Keep"],
  pitfalls: ["the id must match a row in the place's hand file, or the build carries nothing", "two Holds with one id write two rows", "with no room handed down and no in=, it lands at the origin", "for a fresh prop use a kit piece, not Hold"],
};

Hold.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
