// hall kit · RecipeRoom
// RecipeRoom({ place, recipe, prompt, to }): a whole generic interior in one tag: the room drawn by scripts/gen/interior.js from a named recipe
// (barracks, barn, chapel, house-small, house-two-storey, noble-house, shop, smithy, tavern) and the door back out. Every town door of that kind
// opens a copy of the same place, so one tag stands for every barracks, barn and cottage in the world.
import { h, Fragment } from "../../lib/react.mjs";
import { Building } from "../rooms/Building.mjs";
import { ExitDoor } from "./ExitDoor.mjs";

export function RecipeRoom({ place, recipe, prompt = "Leave", to = "+main", door = { w: 1.15, h: 2.3, at: [0, 0.12] }, why }) {
  const id = place;
  return h(Fragment, null,
    h(ExitDoor, { id: `${id}-exit`, at: door.at, y: 0, to, prompt, w: door.w, h: door.h, hinge: -1, leaf: 0, yaw: 0 }),
    // the room itself is the rooms kit's Building: one component for every walk-in interior, generic or named
    h(Building, { id: `${id}-room`, recipe, why }));
}

export const meta = {
  layer: "space",
  is: "a complete generic interior from a named recipe (barracks, barn, chapel, cottage, two-storey house, noble house, shop, smithy, tavern) with its exit door: the shared inside of every ordinary building of that kind",
  tags: ["interior", "room", "recipe", "generic", "barracks", "barn", "chapel", "cottage", "house", "noble house", "shop", "smithy", "tavern", "inside", "building"],
  props: { place: "the interior place id (int-barracks); rows are <place>-room and <place>-exit", recipe: "scripts/gen/interior.js recipe name", prompt: "the exit's E prompt (default Leave)", to: "where the exit leads (default +main: back to the door you came in by)", door: "{ w, h, at } the exit leaf" },
  footprint: { kind: "area", cells: [6, 6], height: 3 },
  topology: { under: ["Interior"], takes: [], joins: ["every outside door whose link names this place"], emits: ["row"] },
  twins: ["rooms/Building (the room it stands)", "hall/Shell (a named building's own kit)", "hall/ExitDoor"],
  pitfalls: ["one place serves every door of its kind: a named building with its own story wants its own Interior + Shell, not a recipe"],
};
RecipeRoom.meta = meta;
