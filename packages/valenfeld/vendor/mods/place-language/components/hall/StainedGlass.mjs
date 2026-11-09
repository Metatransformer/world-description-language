// hall kit · StainedGlass
import { h, Fragment } from "../../lib/react.mjs";
import { useHall, row, pos } from "./_shared.mjs";

// StainedGlass({ id, at, y, yaw, glow }): a window of coloured glass, and the coloured light it throws into the room (inset 0.9 m)
export function StainedGlass({ id, at, y = 4.6, yaw = 0, color = "oklch(0.7 0.15 280)", intensity = 4, distance = 7, why }) {
  const hall = useHall(), p = pos(hall, at, y), r = yaw * Math.PI / 180, inset = 0.9;   // the light hangs 0.9 m into the room, 0.8 m below the glass
  return h(Fragment, null, row(id, { overrides: { feetPosition: p, rotation: { yaw } }, template: "templates/arcane.js#stainedGlass" }, why),
    row(`${id}-light`, { feetPosition: { x: p.x + Math.sin(r) * inset, y: y - 0.8, z: p.z + Math.cos(r) * inset }, id: `${id}-light`, light: { color, distance, intensity, kind: "point" } }));
}

// the card: what this component means, for picking and reasoning (contract: lib/meta.mjs)
export const meta = {
  layer: "light",
  is: "a stained-glass window high in a wall, and the coloured light it throws into the room below it",
  tags: ["window", "stained-glass", "glass", "light", "chapel", "mages", "colour"],
  props: { id: "row id; the light is <id>-light", at: "[x, z] m: the window, on the wall", y: "window height m (default 4.6); the light hangs 0.8 m lower", yaw: "the way the window faces INTO the room, degrees; the light sits 0.9 m that way", color: "light colour (default violet oklch(0.7 0.15 280))", intensity: "light brightness (default 4)", distance: "light reach m (default 7)", why: "a note of why it stands here (shown in the design view)" },
  footprint: { kind: "edge", height: 4.6 },
  topology: { under: ["Interior", "Wing"], takes: [], joins: [], emits: ["row", "light"] },
  twins: ["seacave/Skylight", "sewer/GrateShaft", "cave/Daylight"],
  pitfalls: ["yaw wrong by 180 puts the light outside the wall", "the glass mesh is the arcane template's; colour only changes the light"],
};

StainedGlass.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
