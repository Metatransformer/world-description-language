// hall kit · ExitDoor
import { h } from "../../lib/react.mjs";
import { useHall, row, pos } from "./_shared.mjs";

// ExitDoor({ id, at, to, prompt, w, h, yaw }): the door back out
export function ExitDoor({ id, at, y, to, prompt, w = 2, h: dh = 2.736, yaw = 0, hinge = -1, leaf = 1.375, why }) {
  const hall = useHall();
  return row(id, { children: [{ castShadow: true, feetPosition: { x: 0, y: 0, z: leaf }, id: "leaf", material: { pbr: true }, physics: "static", primitive: { params: { h: dh, hinge, w } },
    receiveShadow: true, template: `${hall.kits}#door` }], feetPosition: pos(hall, at, y), id, rotation: { yaw }, state: { link: to, prompt }, tags: ["door", "interactable"] }, why);
}

// the card: what this component means, for picking and reasoning (contract: lib/meta.mjs)
export const meta = {
  layer: "relation",
  is: "the door a player uses to leave the building and arrive back outside at its front door",
  tags: ["door", "exit", "leave", "portal", "out", "entrance"],
  props: { id: "row id", at: "[x, z] m: the doorway", y: "height m (default the floor)", to: "where it leads: an address, +main#<door id> (the outside door to arrive by)", prompt: "what E says (\"Leave to Valenfeld\")", w: "leaf width m (default 2)", h: "leaf height m (default 2.736)", yaw: "facing, degrees", hinge: "-1 or 1: hinge side", leaf: "m the leaf stands along local z from the spot (default 1.375)", why: "a note of why it stands here (shown in the design view)" },
  footprint: { kind: "edge", cells: [1, 1], height: 2.7 },
  topology: { under: ["Interior", "Wing"], takes: [], joins: ["the outside door named in to"], emits: ["row"] },
  twins: ["wilds/Entrance", "mine/Adit", "crypt/Shaft", "masonry/Door"],
  pitfalls: ["to must name an exit id that exists outside or the player lands at the place's spawn", "the leaf's offset (leaf, w, h) must match the shell's door hole or it floats in the wall"],
};

ExitDoor.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
