// mine kit · Mine
import { h } from "../../lib/react.mjs";
import { LevelContext } from "./LevelContext.mjs";

// Mine({ vein }, children): the whole working; children are its Levels, then its Ways
export const Mine = ({ vein, children }) => h(LevelContext.Provider, { value: { n: 1, floor: 0, vein } }, children);

// meta card (lib/meta.mjs)
export const meta = {
  layer: "context",
  is: "a whole mine dug along one ore vein: the root a mine dungeon's levels stand under, naming the vein every gallery follows",
  tags: ["mine", "root", "vein", "workings", "dungeon", "silver", "ore"],
  props: { vein: "the ore vein's name (\"Crowfoot silver vein\"); Galleries below read it for their feature text", children: "its Levels (then the cross-level Shaft, CaveIn, Timbering rows)" },
  footprint: { kind: "tree" },
  topology: { under: [], takes: ["Level", "Shaft", "CaveIn", "Timbering"], joins: [], emits: [] },
  twins: ["plan/Plan", "seacave/Cove", "cave/Cave", "crypt/Barrow"],
  pitfalls: ["emits nothing itself: rooms only appear through Level/Working children", "rooms outside any Level sit on level 1, floor 0", "for a mine re-described as it already stands (no vein) use Dig instead"],
};

Mine.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
