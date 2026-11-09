// hall kit · CommonRoom
import { h } from "../../lib/react.mjs";
import { Room } from "./Room.mjs";
import { Crowd } from "./Crowd.mjs";

// CommonRoom({ name, area, floor, prefix, npc, people }): the public room where guests sit, drink and talk: a Room of purpose gather and its crowd
export function CommonRoom({ name = "common room", purpose = "gather", area, floor, at, prefix, from, npc = "folk-traveler", as, y, post, people, children }) {
  return h(Room, { name, purpose, area, floor, at }, people ? h(Crowd, { prefix, from, npc, as, y, post, people }) : null, children);
}

// the card: what this component means, for picking and reasoning (contract: lib/meta.mjs)
export const meta = {
  layer: "meaning",
  is: "the public room of an inn, hall or keep where people gather to sit, drink, talk or wait their turn",
  tags: ["common room", "taproom", "tavern", "inn", "hall", "gathering", "patrons", "audience", "public"],
  props: { name: "what it is called (default common room)", purpose: "gather (default) | audience (a petitioners' hall)", area: "[[x0, z0], [x1, z1]] m it covers (optional)", floor: "m its people stand at (default the room around it)", at: "[x, z] m origin (default [0, 0])", prefix: "the crowd's id stem (inn-trav)", from: "the crowd's first number", npc: "the crowd's folk record (default folk-traveler)", as: "patron (default) | resident", y: "the crowd's feet height m", post: "residents keep their spot", people: "the crowd, as Crowd's people", children: "who else is here: the keeper, a bard" },
  footprint: { kind: "area", cells: [6, 5], height: 3 },
  topology: { under: ["Interior", "Room"], takes: ["Resident", "Patron", "Crowd", "Lamp"], joins: [], emits: ["row"] },
  twins: ["sewer/RatHall", "hall/Room"],
  pitfalls: ["the tables, benches and hearth stand in the shell (a Keep): CommonRoom places the people", "the keeper is a Resident child, not a crowd member: her record sells and talks", "crowd ids are by order, as Crowd's"],
};

CommonRoom.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
