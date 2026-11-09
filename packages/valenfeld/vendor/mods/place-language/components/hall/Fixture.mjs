// hall kit · Fixture
import { row, useHall, pos } from "./_shared.mjs";

// Fixture({ id, gen, params, at, y, yaw, tags, solid, why }): a piece built into the room (forge, anvil bench, bar counter, shelving)
// drawn by one scripts/gen generator, standing at a spot in the hall's metres. solid (default) gives it a static collider.
export function Fixture({ id, gen, params = {}, at = [0, 0], y, yaw, tags = ["decor"], solid = true, shadows = true, why }) {
  const hall = useHall();
  const spec = {
    ...(shadows ? { castShadow: true, receiveShadow: true } : {}), feetPosition: pos(hall, at, y), id, material: { pbr: true },
    ...(solid ? { physics: "static" } : {}), primitive: { kind: "scripted", params, script: gen.startsWith("scripts/") ? gen : `scripts/gen/${gen}.js` },
    ...(yaw != null ? { rotation: { yaw } } : {}), tags,
  };
  return row(id, spec, why);
}

export const meta = {
  layer: "dressing",
  is: "a fitted piece of a room drawn by one generator (the smithy's forge and racks, a bar, shelving): fixed in place, solid, lit by the room",
  tags: ["fixture", "fitting", "forge", "gear", "workshop", "furniture", "built-in", "generator", "interior"],
  props: { id: "row id", gen: "generator name in scripts/gen (smithy-gear) or a full scripts/ path", params: "the generator's params", at: "[x, z] in the hall's metres", y: "height (default the hall's floor)", yaw: "degrees",
    tags: "row tags (default decor)", solid: "static collider (default true)", shadows: "casts and takes shadows (default true)" },
  footprint: { kind: "point", cells: [2, 2], height: 2 },
  topology: { under: ["Interior", "Wing"], takes: [], joins: [], emits: ["row"] },
  twins: ["things/SmithyGear (the same generator as a kit template outdoors)", "common/Thing"],
  pitfalls: ["a generator whose mesh is laid in room coordinates stands at [0, 0]: its own drawing places the parts"],
};
Fixture.meta = meta;
