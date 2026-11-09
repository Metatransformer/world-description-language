// wilds kit · Entrance
import { h, Fragment } from "../../lib/react.mjs";
import { row } from "./_shared.mjs";

// Entrance({ id, at, yaw, dungeon, name, seed, door }): a dungeon's mouth in the hillside and the door you enter by.
// at is where you stand to enter; the rock mouth sits `back` metres behind the door along its facing. Both stand free in the
// world (no parent): a mouth belongs to the ground it is cut into, not to whatever wilds root it is listed under.
export function Entrance({ id, at, yaw = 0, dungeon, name, seed = 7, back = 1.6, door = { width: 2.3, height: 2.3, depth: 0.3, color: "#2a211a" }, why }) {
  const [x, y, z] = at, r = (yaw * Math.PI) / 180, mx = +(x - Math.sin(r) * back).toFixed(2), mz = +(z - Math.cos(r) * back).toFixed(2);
  return h(Fragment, null,
    row(`${id}-door`, { behavior: "scripts/gate.js", feetPosition: { x, y, z }, id: `${id}-door`, material: { color: door.color, metalness: 0, roughness: 0.95 },
      physics: { body: "static", trigger: true }, primitive: { depth: door.depth, height: door.height, kind: "arch", width: door.width }, rotation: yaw,
      state: { act: "Enter", name, to: `+${dungeon}#${dungeon}-exit` }, tags: ["portal", "interactable", "door"] }, why),
    row(`${id}-mouth`, { feetPosition: { x: mx, y, z: mz }, id: `${id}-mouth`, physics: "static",
      primitive: { kind: "scripted", params: { seed }, script: "scripts/gen/den-mouth.js" }, rotation: yaw, tags: ["dungeon-mouth"] }, why));
}

// the card: what this component means, for picking and reasoning (contract: lib/meta.mjs)
export const meta = {
  layer: "relation",
  is: "the way into a dungeon from the open country: a rock mouth in the hillside with a dark door a player walks through",
  tags: ["entrance", "dungeon", "mouth", "cave", "door", "portal", "enter", "hillside"],
  props: { id: "id stem: rows <id>-door and <id>-mouth", at: "[x, y, z] WORLD m: where you stand to enter (the door)", yaw: "facing, degrees: the mouth sits behind the door along it", dungeon: "the place id it leads to; you arrive at <dungeon>#<dungeon>-exit", name: "the shown name (\"the Greywood Den\")", seed: "rock mouth shape seed (default 7)", back: "m the mouth sits behind the door (default 1.6)", door: "{ width, height, depth, color } of the arch (default 2.3 × 2.3 × 0.3, dark)", why: "a note of why it stands here (shown in the design view)" },
  footprint: { kind: "edge", cells: [3, 2], height: 2.3 },
  topology: { under: ["Wilds", "Site"], takes: [], joins: ["the dungeon's <id>-exit"], emits: ["row"] },
  twins: ["hall/ExitDoor", "mine/Adit", "crypt/Shaft"],
  pitfalls: ["at is WORLD metres, unlike every other wilds piece (the mouth is not parented to the root)", "the dungeon must define an exit with id <dungeon>-exit or you arrive at its spawn", "yaw facing into the hill buries the door in the mouth"],
};

Entrance.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
