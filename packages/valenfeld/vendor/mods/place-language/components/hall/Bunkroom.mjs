// hall kit · Bunkroom
import { h } from "../../lib/react.mjs";
import { Room } from "./Room.mjs";
import { BunkRow } from "./BunkRow.mjs";

// Bunkroom({ floor, beds }): the room people sleep in: a Room of purpose sleep and its rows of beds
export function Bunkroom({ name = "bunk room", purpose = "sleep", area, floor, at, beds, children }) {
  const rows = beds == null ? [] : Array.isArray(beds) ? beds : [beds];
  return h(Room, { name, purpose, area, floor, at }, ...rows.map((b, i) => h(BunkRow, { key: b.prefix ?? i, ...b })), children);
}

// the card: what this component means, for picking and reasoning (contract: lib/meta.mjs)
export const meta = {
  layer: "meaning",
  is: "the room people sleep in (a dormitory, a barracks, an inn's rented rooms): beds in rows, with whoever is asleep or keeps them",
  tags: ["bunk room", "dormitory", "barracks", "bedroom", "rented rooms", "sleep", "beds", "bunks"],
  props: { name: "what it is called (default bunk room)", purpose: "sleep (default)", area: "[[x0, z0], [x1, z1]] m it covers (optional)", floor: "m its beds stand at (an upstairs dormitory 5)", at: "[x, z] m origin (default [0, 0])", beds: "one BunkRow's props, or a list of them: each a row of beds", children: "anything else here: odd beds, a sleeper, a footlocker" },
  footprint: { kind: "area", cells: [4, 6], height: 3 },
  topology: { under: ["Interior", "Room"], takes: ["BunkRow", "Bed", "InnBed", "Resident", "Coffer", "Container"], joins: [], emits: ["row"] },
  twins: ["hall/Room", "verbs/grid"],
  pitfalls: ["two rows need two prefixes or a from: the second row's ids otherwise collide with the first", "the beds are sleep spots: frames stand in the shell"],
};

Bunkroom.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
