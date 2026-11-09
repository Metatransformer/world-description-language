// mine kit · Level
import { h, Fragment, useContext } from "../../lib/react.mjs";
import { LevelContext } from "./LevelContext.mjs";
import { Level as CommonLevel } from "../common/Level.mjs";

// Level({ n, name, floor: [top, bottom], note }, children): a level row; every working under it sits on it unless it says
export function Level(p) { return CommonLevel({ ...p, context: LevelContext }); }

// meta card (lib/meta.mjs)
export const meta = {
  layer: "space",
  is: "one level of a mine, a floor of workings at one depth: everything cut under it stands on its floor and carries its number",
  tags: ["mine", "level", "depth", "floor", "storey", "tier"],
  props: { n: "level number, 1 = top", name: "the level's name as a player hears it", floor: "[top, bottom] floor heights in m (or one number); workings default to top", note: "one line on what this level holds" },
  footprint: { kind: "none", height: 0 },
  topology: { under: ["Mine", "Dig"], takes: ["Working", "Adit", "Gallery", "Stope", "FloodedDrift", "NaturalCavern", "Cut"], joins: ["Shaft"], emits: ["level"] },
  twins: ["common/Level", "plan/Level", "seacave/Tide", "cave/Shelf", "sewer/Depth", "crypt/Tier"],
  pitfalls: ["floor is metres, not cells: a working with no floor of its own takes the level's top", "two Levels with the same n write two level rows", "levels join only through links you lay (Shaft, Way/from, Tunnel): a Level is not a connection"],
};

Level.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
