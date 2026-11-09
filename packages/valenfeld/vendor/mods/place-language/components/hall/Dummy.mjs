// hall kit · Dummy
import { useHall, row, pos } from "./_shared.mjs";

// Dummy({ id, at, yaw }): a training dummy to swing at
export function Dummy({ id, at, yaw = 180, why }) {
  const hall = useHall();
  return row(id, { overrides: { castShadow: true, feetPosition: pos(hall, at, 0), material: { pbr: true }, physics: "static", rotation: { yaw }, tags: ["dummy"] }, template: `${hall.kits}#trainingDummy` }, why);
}

// the card: what this component means, for picking and reasoning (contract: lib/meta.mjs)
export const meta = {
  layer: "mechanism",
  is: "a straw training dummy in a yard or hall that a player practises their swings on",
  tags: ["dummy", "training", "practice", "target", "yard", "fighters"],
  props: { id: "row id", at: "[x, z] m (always on the ground, y 0)", yaw: "facing, degrees (default 180)", why: "a note of why it stands here (shown in the design view)" },
  footprint: { kind: "point", cells: [1, 1], height: 1.8 },
  topology: { under: ["Interior", "Wing"], takes: [], joins: [], emits: ["row"] },
  twins: [],
  pitfalls: ["y is pinned to 0, not the hall floor", "needs room to swing round it: keep 1.5 m clear"],
};

Dummy.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
