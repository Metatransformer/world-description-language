// seacave kit · Tide
import { LevelContext } from "../plan/index.mjs";
import { Level as CommonLevel } from "../common/Level.mjs";

// Tide({ n, name, floor: [top, bottom], note }): one tide level of the cove; every grotto under it stands on it
export const Tide = (p) => CommonLevel({ ...p, context: LevelContext });
Tide.displayName = "Level";   // same tree segment as the plan Level it used to alias: row ids hold

// meta card (lib/meta.mjs)
export const meta = {
  layer: "space",
  is: "one tide level of a sea cave, a floor of grottos at one height above or below the water line; deeper tides lie nearer the sea",
  tags: ["seacave", "tide", "level", "depth", "floor", "storey"],
  props: {"n": "level number, 1 = top (the land way)", "name": "the level's name", "floor": "[top, bottom] floor heights m", "note": "one line on what this tide holds"},
  footprint: { kind: "none", height: 0 },
  topology: { under: ["Cove"], takes: ["Grotto", "Drowned", "SeaGate", "Sump"], joins: [], emits: ["level"] },
  twins: ["common/Level", "plan/Level", "mine/Level", "cave/Shelf", "sewer/Depth", "crypt/Tier"],
  pitfalls: ["it is plan/Level: a Grotto still needs its own floor= when it differs from the tide's top", "a tide joins the next only through a from= or link you lay"],
};

Tide.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
