// hall kit · InnBed
import { useHall, row, pos } from "./_shared.mjs";

// InnBed({ id, inn, keeper, at, yaw, col }): a bed you rent from the keeper for the night
export function InnBed({ id, inn, keeper, at, y, yaw = 0, col = "#7a3a30", name = "Bed", why }) {
  const hall = useHall();
  return row(id, { overrides: { feetPosition: pos(hall, at, y), physics: "static", primitive: { kind: "scripted", params: { col, kind: "bed" }, script: "scripts/gen/prop.js" }, rotation: yaw,
    "state.act": "Sleep", "state.bed": true, "state.inn": inn, "state.name": name, "state.rent": true, "state.rentFrom": keeper, tags: ["interactable", "bed"] }, template: `${hall.kits}#prop` }, why);
}

// the card: what this component means, for picking and reasoning (contract: lib/meta.mjs)
export const meta = {
  layer: "mechanism",
  is: "an inn's bed a player rents from the keeper for the night, drawn with its own coloured blanket",
  tags: ["bed", "inn", "rent", "sleep", "room", "tavern", "paid"],
  props: { id: "row id", inn: "the inn's name (\"the Drowned Lantern\")", keeper: "the name of who you pay", at: "[x, z] m", y: "height m (default the floor)", yaw: "facing, degrees", col: "blanket colour, hex", name: "prompt name (default Bed)", why: "a note of why it stands here (shown in the design view)" },
  footprint: { kind: "point", cells: [1, 1] },
  topology: { under: ["Interior", "Wing"], takes: [], joins: [], emits: ["row"] },
  twins: [],
  pitfalls: ["keeper must match the npc who sells the room, or the bed can never be rented", "it draws its own frame (gen/prop bed): don't stand it on a bed already in the shell"],
};

InnBed.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
