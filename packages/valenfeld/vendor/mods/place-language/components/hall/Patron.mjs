// hall kit · Patron
import { useHall, row, pos } from "./_shared.mjs";

// Patron({ id, npc, name, race, sex, at, y, yaw, pose }): a guest at a table, dressed by their kind and posed (harvested: the inn)
export function Patron({ id, npc, name, race, sex, at, y, yaw = 0, pose = "sit", why }) {
  return row(id, { behavior: ["scripts/body-dress.js", "scripts/patron.js"], feetPosition: pos(useHall(), at, y), id, physics: { body: "static", collider: "capsule" },
    rotation: { yaw }, state: { act: "Talk to", eq: false, name, npc, pose, race, sex }, tags: ["npc", "interactable", "patron"] }, why);
}

// the card: what this component means, for picking and reasoning (contract: lib/meta.mjs)
export const meta = {
  layer: "encounter",
  is: "a guest passing time in a public room (drinking, laughing, at a table), held in one pose and willing to talk",
  tags: ["npc", "patron", "guest", "inn", "tavern", "drinker", "crowd", "seated"],
  props: { id: "row id", npc: "content/npc record id; a generic folk record (folk-thief, folk-traveler) for crowd", name: "shown name", race: "body race", sex: "m or f", at: "[x, z] m", y: "feet height m (default the floor; a seat sits lower than a bench top)", yaw: "facing, degrees", pose: "sit | talk | laugh | idle (default sit)", why: "a note of why it stands here (shown in the design view)" },
  footprint: { kind: "point", cells: [1, 1], height: 1.8 },
  topology: { under: ["Interior", "Wing"], takes: [], joins: [], emits: ["row"] },
  twins: [],
  pitfalls: ["a patron never walks: use Resident for someone who works the room", "pose sit needs a seat under them at the right y or they sit on air", "a static capsule: it blocks the aisle it sits in"],
};

Patron.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
