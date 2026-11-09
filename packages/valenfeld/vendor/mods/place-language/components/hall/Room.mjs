// hall kit · Room
import { h } from "../../lib/react.mjs";
import { useHall } from "./_shared.mjs";
import { HallContext } from "./HallContext.mjs";

// Room({ name, purpose, area, floor, at }): one named room of a building, what it is FOR, and the floor its pieces stand on
export function Room({ name, purpose = "living", area, floor, at = [0, 0], children }) {
  const up = useHall();
  return h(HallContext.Provider, { value: { ...up, wing: name, room: { name, purpose, area: area ?? null }, at: [up.at[0] + at[0], up.at[1] + at[1]], floor: floor ?? up.floor } }, children);
}

// the card: what this component means, for picking and reasoning (contract: lib/meta.mjs)
export const meta = {
  layer: "meaning",
  is: "a named room of a building and what it is for (where people eat, sleep, keep stores, train or hold court), on its own floor",
  tags: ["room", "purpose", "storey", "floor", "upstairs", "cellar", "chamber", "interior", "meaning"],
  props: { name: "what the room is called (\"common room\", \"guard barracks\")", purpose: "what it is for: gather | sleep | stores | audience | training | work | living (default living)", area: "[[x0, z0], [x1, z1]] m in the hall: the floor it covers (optional; a note for layouts and the design view)", floor: "m: the height its pieces stand at unless they say (an upper storey 4.8, a cellar -3.4); default the room around it", at: "[x, z] m: an origin its pieces' spots add to (default [0, 0]: spots stay in hall metres)", children: "what stands in the room" },
  footprint: { kind: "area", cells: [5, 4], height: 3 },
  topology: { under: ["Interior", "Room", "Wing"], takes: ["Resident", "Patron", "Crowd", "Bed", "BunkRow", "InnBed", "Stock", "Container", "Coffer", "Lamp", "Keep", "Room"], joins: [], emits: [] },
  twins: ["verbs/room", "verbs/storey", "hall/Wing", "plan/In"],
  pitfalls: ["it draws no walls: the shell (a Keep) stands the room, Room names it and sets its floor", "floor is inherited: a room nested in an upper storey stands upstairs unless it says floor", "a piece written with its own y ignores the room's floor", "at adds like Wing's: leave it [0, 0] when the spots are already hall metres"],
};

Room.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
