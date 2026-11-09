// cave kit · Cave
import { h } from "../../lib/react.mjs";
import { Plan } from "../plan/index.mjs";

// Cave({ style }, children): the whole cave; children are its Shelves (the shell style is the dungeon's own)
export const Cave = ({ children }) => h(Plan, null, children);

export const meta = {
  layer: "context",
  is: "a whole natural cave that water cut and beasts live in, the root a cave dungeon's shelves stand under",
  tags: ["cave", "root", "dungeon", "natural", "den", "whole-place"],
  props: { style: "the shell style word (the dungeon's own style decides; kept for reading)", children: "its Shelves, then Locks and the In dressing pass" },
  footprint: { kind: "tree" },
  topology: { under: [], takes: ["Shelf", "Rockfall", "OneWayGate", "Locks", "In", "Passage"], joins: [], emits: [] },
  twins: ["plan/Plan", "seacave/Cove", "mine/Mine", "mine/Dig", "crypt/Barrow"],
  pitfalls: ["writes nothing itself: a Cave with no Shelf gives every Hollow level 1, floor 0", "style is ignored: the dungeon() opts style is what dresses the shell"],
};

Cave.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
