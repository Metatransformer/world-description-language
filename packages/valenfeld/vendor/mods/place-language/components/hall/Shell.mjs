// hall kit · Shell
import { row } from "./_shared.mjs";
import { fires } from "./fires.mjs";

const XYZ = ([x, z], y) => ({ x, y, z });
// Shell({ id, kit, grow, enclosed, gen, shadows, tags, lights, flames, at, why }): the building's own walls, floors, stairs and roof, drawn by a kit template,
// with the light that lives in it. lights: [[id|null, [x, z], y, color, intensity, distance]]; flames: [[id|null, [x, z], y, fireName]] (fires.mjs).
// grow: { knots, sx, sz } the storey growth curve; enclosed: walls on every side; gen: { script, params } when the kit's primitive is swapped whole.
export function Shell({ id, kit, grow, enclosed, gen, shadows = true, tags, lights = [], flames = [], glow, at = [0, 0], y = 0, why }) {
  const children = [];
  const flame = ([cid, p, fy, fire]) => ({ feetPosition: XYZ(p, fy), fx: { script: "@fire/" + fire }, ...(cid ? { id: cid } : {}) });
  const lamp = ([cid, p, ly, color, intensity, distance]) => ({ feetPosition: XYZ(p, ly), ...(cid ? { id: cid } : {}), light: { color, distance, intensity, kind: "point" } });
  if (glow) for (const g of glow) children.push(g.length === 4 ? flame(g) : lamp(g));   // glow: lights and fires in one list, in the order they stand
  for (const [cid, p, fy, fire] of flames) children.push({ feetPosition: XYZ(p, fy), fx: { script: "@fire/" + fire }, ...(cid ? { id: cid } : {}) });
  for (const [cid, p, ly, color, intensity, distance] of lights) children.push({ feetPosition: XYZ(p, ly), ...(cid ? { id: cid } : {}), light: { color, distance, intensity, kind: "point" } });
  const params = { ...(enclosed ? { enclosed: true } : {}), ...(grow ? { grow } : {}) };
  const overrides = {
    ...(shadows !== null ? { castShadow: shadows } : {}), children, feetPosition: XYZ(at, y), material: { pbr: true }, physics: "static",
    ...(gen ? { primitive: { kind: "scripted", params: gen.params ?? {}, script: gen.script } } : Object.keys(params).length ? { primitive: { params } } : {}),
    ...(shadows !== null ? { receiveShadow: true } : {}), ...(tags ? { tags } : {}),
  };
  return row(id, fires({ overrides, template: `templates/kits.js#${kit}` }), why, "shell");
}

export const meta = {
  layer: "space",
  is: "the building itself seen from inside (walls, floors, stairs, roof) drawn by a kit template, with its lamps and fires: the frame every room of an interior stands in",
  tags: ["shell", "building", "interior", "walls", "hall", "storeys", "lights", "hearth"],
  props: { id: "row id", kit: "templates/kits.js export (fightersHall, innHall, magesHall, smithy, farmhouseRoom, valenfeldKeepFloors)", grow: "{ knots, sx, sz } storey growth", enclosed: "true: walls on every side",
    gen: "{ script, params }: a scripted primitive in place of the kit's", shadows: "true (default) casts and takes shadows; false casts none; null leaves both to the kit", tags: "row tags",
    lights: "[[id|null, [x, z], y, color, intensity, distance]] point lights", flames: "[[id|null, [x, z], y, fire]] a fire from fires.mjs", glow: "lights and flames mixed in one ordered list (a 4-entry row is a flame, 6 a light)", at: "[x, z] origin", y: "floor height" },
  footprint: { kind: "room" },
  topology: { under: ["Interior"], takes: [], joins: [], emits: ["row"] },
  twins: ["architecture/House"],
  pitfalls: ["light ids ride the shell: a Lamp parented to it is <shell>/<id>", "a light with no id is fine but cannot be addressed by a later Lamp or script"],
};
Shell.meta = meta;
