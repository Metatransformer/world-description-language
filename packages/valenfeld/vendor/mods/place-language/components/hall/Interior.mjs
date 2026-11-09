// hall kit · Interior
import { h } from "../../lib/react.mjs";
import { HallContext } from "./HallContext.mjs";

// Interior({ place, floor, kits }, children): the inside of one building; every hall piece under it stands in its metres
export const Interior = ({ place, floor = 0.12, kits = "templates/kits.js", children }) =>
  h(HallContext.Provider, { value: { place, floor, at: [0, 0], kits } }, children);

// the card: what this component means, for picking and reasoning (contract: lib/meta.mjs)
export const meta = {
  layer: "context",
  is: "the inside of one building (a guild hall, an inn, a smithy): the frame every piece in it is placed in",
  tags: ["interior", "building", "hall", "root", "house", "indoors"],
  props: { place: "the place id the interior compiles into (\"inn\", \"fighters-guild\")", floor: "the floor's height, m (default 0.12): every piece's y unless it says", kits: "the templates module the pieces stamp from (default templates/kits.js)", children: "the Wings and pieces standing inside" },
  footprint: { kind: "tree" },
  topology: { under: [], takes: ["Wing", "Resident", "Patron", "Bed", "BunkRow", "InnBed", "Coffer", "Container", "Sack", "GuildChest", "Dummy", "Lamp", "ArcaneLamp", "StainedGlass", "ExitDoor", "Keep"], joins: [], emits: [] },
  twins: ["wilds/Wilds", "plan/Plan", "cave/Cave", "mine/Mine", "sewer/Drains"],
  pitfalls: ["it writes no row itself: the building shell is a Keep (or the town's scene), not this", "spots are [x, z] metres from the hall's origin, not 2 m grid cells", "a piece outside an Interior falls back to place null, floor 0.12, origin 0,0"],
};

Interior.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
