// mine kit · Dig
import { h } from "../../lib/react.mjs";
import { LevelContext } from "./LevelContext.mjs";

// Dig({ children }): a mine re-described as it already stands, no vein to follow; children are Cuts, Tunnels, Seals, Kept and Foe rows
export const Dig = ({ children }) => h(LevelContext.Provider, { value: { n: 1, floor: 0, vein: null } }, children);

// meta card (lib/meta.mjs)
export const meta = {
  layer: "context",
  is: "a dig that already stands, re-described room by room: the as-built root for a mine or den cut straight with no vein, level 1, floor 0",
  tags: ["mine", "as-built", "dig", "root", "harvest", "existing"],
  props: { children: "Cut, Tunnel, Seal, Kept, Foe rows" },
  footprint: { kind: "tree" },
  topology: { under: [], takes: ["Cut", "Tunnel", "Seal", "Kept", "Foe", "Level"], joins: [], emits: [] },
  twins: ["plan/Plan", "seacave/Cove"],
  pitfalls: ["emits nothing itself", "its rooms get no shell or kit: the program's kits layer must dress them", "for a new mine along a vein, use Mine"],
};

Dig.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
