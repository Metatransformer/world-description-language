// rooms kit · Building: a walk-in building interior, its rooms named floor by floor.
// <Building id="int-tavern-room" recipe="tavern" seed={3}><Ground><TavernHall/><Kitchen/></Ground><Upper><Bedroom/><Bedroom/></Upper></Building>
// Folds into ONE scripted row drawn by scripts/gen/interior.js (shell, stair, walls, doors, windows, lights, furniture by the
// interior kit's placement rules: wall, wall-back, wall-side, corner, centre, by-door, across). No children: the recipe's own rooms.
import { h } from "../../lib/react.mjs";
const kids = (c) => (Array.isArray(c) ? c.flat(Infinity) : c ? [c] : []).filter(Boolean);
const roomsOf = (el) => kids(el?.props?.children).map((r) => r.type?.room).filter(Boolean);
export const Ground = () => null; Ground.floor = "ground";
export const Upper = () => null; Upper.floor = "upper";
export function Building({ id, recipe = "auto", w, d, storeys, seed, trade, at = [0, 0, 0], yaw, parent, why, children }) {
  const ks = kids(children), g = ks.find((k) => k.type === Ground), u = ks.find((k) => k.type === Upper);
  const params = Object.fromEntries(Object.entries({ recipe, w, d, storeys, seed, trade, ground: g ? roomsOf(g) : undefined, upper: u ? roomsOf(u) : undefined }).filter(([, v]) => v !== undefined));
  return h("row", { key: "@" + id, via: "row", ...(why ? { why } : {}), spec: { id, feetPosition: { x: at[0], y: at[1], z: at[2] }, ...(yaw != null ? { rotation: { yaw } } : {}), ...(parent ? { parent } : {}),
    material: { pbr: true }, physics: "static", tags: ["building", "interior"], primitive: { kind: "scripted", script: "scripts/gen/interior.js", params } } });
}
export const meta = {
  layer: "space",
  is: "a walk-in building interior: a shell with stair, walls, doors, windows, lights and furniture, its rooms named front to back on each floor",
  tags: ["building", "interior", "house", "rooms", "floor", "storey", "stair", "furniture", "furnished"],
  props: { id: "row id", recipe: "house-small | house-two-storey | shop | tavern | smithy | noble-house | chapel | barn | barracks | auto (picked by trade and size)", w: "width m", d: "depth m", storeys: "1 or 2", seed: "furniture roll", trade: "what the place sells (stock on shelves)", at: "[x,y,z]", yaw: "degrees", children: "<Ground> and <Upper>, each holding room components front (door) to back" },
  footprint: { kind: "room", cells: [5, 5], height: 3.2 },
  topology: { under: ["Interior", "place root"], takes: ["Ground", "Upper"], joins: ["ExitDoor"], emits: ["row"] },
  twins: ["hall/Interior", "things/Furnish"],
  pitfalls: ["rooms share the depth front to back: three rooms in a 6 m deep house are cramped", "the stair climbs the right wall: keep the right wall free in the front room"],
};
Building.meta = meta;
Ground.meta = { layer: "relation", is: "the ground floor of a Building: its rooms front (door) to back", tags: ["ground", "floor", "storey"], footprint: { kind: "none" }, topology: { under: ["Building"], takes: ["rooms"], joins: [], emits: ["params"] } };
Upper.meta = { layer: "relation", is: "the upper floor of a Building, reached by its stair: its rooms front to back", tags: ["upper", "floor", "storey", "upstairs"], footprint: { kind: "none" }, topology: { under: ["Building"], takes: ["rooms"], joins: [], emits: ["params"] } };
