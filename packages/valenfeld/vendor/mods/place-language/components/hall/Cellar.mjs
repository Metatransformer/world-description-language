// hall kit · Cellar
import { h } from "../../lib/react.mjs";
import { Room } from "./Room.mjs";
import { Stock } from "./Stock.mjs";

// Cellar({ floor, prefix, from, stock }): the store room under (or behind) a house: a Room of purpose stores with its stock
export function Cellar({ name = "cellar", purpose = "stores", area, floor, at, prefix, from, named, stock, children }) {
  return h(Room, { name, purpose, area, floor, at }, stock ? h(Stock, { prefix, from, named, items: stock }) : null, children);
}

// the card: what this component means, for picking and reasoning (contract: lib/meta.mjs)
export const meta = {
  layer: "meaning",
  is: "the store room below or behind a house where the barrels, crates and chests are kept, and where people meet who would rather not be seen",
  tags: ["cellar", "storeroom", "stores", "basement", "undercroft", "pantry", "barrels", "crates", "den"],
  props: { name: "what it is called (default cellar)", purpose: "stores (default)", area: "[[x0, z0], [x1, z1]] m it covers (optional)", floor: "m: the cellar floor (below the hall's, e.g. -3.4)", at: "[x, z] m origin (default [0, 0])", prefix: "the stock's id stem", from: "the stock's first number", named: "stock ids carry their kind (default true)", stock: "Stock's items: [[kind, [x, z], yaw], …]", children: "who and what else is down here (a Crowd, a fence)" },
  footprint: { kind: "area", cells: [6, 6], height: 2.6 },
  topology: { under: ["Interior", "Room"], takes: ["Stock", "Crowd", "Resident", "Container", "Coffer"], joins: [], emits: ["row"] },
  twins: ["plan/Stores", "verbs/storey", "hall/Room"],
  pitfalls: ["floor must be the cellar's own: left out, the stock stands on the hall floor above", "the stair down is part of the shell; nothing here makes the cellar reachable"],
};

Cellar.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
