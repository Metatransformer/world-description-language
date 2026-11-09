// wilds kit · Wilds
import { h, Fragment } from "../../lib/react.mjs";
import { row } from "./_shared.mjs";
import { WildsContext } from "./WildsContext.mjs";
import { FrameContext } from "../common/Thing.mjs";

// Wilds({ id, spec, kits, why }, children): the root of a stretch of country; it carries the tree and fern beds, every piece stands under it
export const Wilds = ({ id, spec, kits = "templates/kits.js", why, children }) =>
  h(Fragment, null, row(id, spec, why ?? "the wilds root: its tree and fern beds ride it as scatter children", "hold"),
    h(WildsContext.Provider, { value: { id, kits, site: null } }, h(FrameContext.Provider, { value: { id, kits } }, children)));

// the card: what this component means, for picking and reasoning (contract: lib/meta.mjs)
export const meta = {
  layer: "context",
  is: "a stretch of country between towns (a forest, a moor): one root that carries its trees and ferns, with every rock, ruin and camp in it standing under it",
  tags: ["wilds", "region", "forest", "outdoors", "country", "root", "biome"],
  props: { id: "the root row's id; every piece's id is <id>/<name> and its parent", spec: "the root's scene row whole (its feetPosition and scatter children)", kits: "templates module pieces stamp from (default templates/kits.js)", why: "a note of why it stands here (shown in the design view)", children: "Sites and pieces" },
  footprint: { kind: "tree" },
  topology: { under: [], takes: ["Site", "Rock", "Log", "Milestone", "Den", "Tower", "Chest", "Lamp", "CampProp", "Tent", "Palisade", "Entrance", "Keep"], joins: [], emits: ["row"] },
  twins: ["hall/Interior", "plan/Plan", "cave/Cave", "mine/Mine", "sewer/Drains"],
  pitfalls: ["children are in the ROOT's metres: move the root and every piece moves with it", "the root's scatter beds are its spec, not components: paths and clearings must be carved in that spec or the land program", "at y is not snapped to terrain: a wrong y floats or buries a piece"],
};

Wilds.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
