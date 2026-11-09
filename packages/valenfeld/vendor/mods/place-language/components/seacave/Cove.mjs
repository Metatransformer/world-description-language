// seacave kit · Cove
import { h } from "../../lib/react.mjs";
import { Plan } from "../plan/index.mjs";

// the sea cave's words for the shared plan kit: a tide is a level (the land way at the top, the low water at the bottom)
export const Cove = ({ children }) => h(Plan, null, children);

// meta card (lib/meta.mjs)
export const meta = {
  layer: "context",
  is: "a whole sea cave the sea cut and smugglers put to use: the root its tides step down under, from the land way in at the top to the low water at the bottom",
  tags: ["seacave", "cove", "root", "smugglers", "sea", "grotto", "dungeon"],
  props: {"children": "its Tides (then SeaGate, Sump rows between grottos)"},
  footprint: { kind: "tree" },
  topology: { under: [], takes: ["Tide", "SeaGate", "Sump"], joins: [], emits: [] },
  twins: ["plan/Plan", "mine/Mine", "mine/Dig", "cave/Cave", "crypt/Barrow"],
  pitfalls: ["it is plan/Plan under a sea name: it emits nothing itself", "rooms outside any Tide sit on level 1"],
};

Cove.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
