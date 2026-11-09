// wilds kit · Campfire: a ring of stones and a live fire (coals, flame, embers, smoke, a warm light), the heart of any camp
import { piece } from "./_shared.mjs";
import { FIRES } from "../hall/fires.mjs";

export const Campfire = ({ name = "camp-fire", at, fire = "campfire", why }) =>
  piece("campprop", name, { at, cast: false, prim: { primitive: { params: { kind: "fire" } } }, extra: { fx: { script: FIRES[fire] } }, why });

export const meta = {
  layer: "dressing",
  is: "an outdoor campfire: a stone ring with a burning fire in it that lights the clearing at night",
  tags: ["campfire", "fire", "camp", "light", "smoke", "bandit", "hunter", "outdoors"],
  props: { name: "suffix of its row (default camp-fire)", at: "[x, y, z] m in the Wilds root's frame", fire: "hall/fires name (default campfire)", why: "design note" },
  footprint: { kind: "point", cells: [1, 1], height: 1 },
  topology: { under: ["Wilds", "Site", "BanditCamp"], takes: [], joins: [], emits: ["row"] },
  twins: ["hall/Hearth (the indoor fire)", "wilds/CampProp"],
  pitfalls: ["as BanditCamp's fire prop its `at` is in the camp's metres (the camp sets the origin), not the wood's"],
};
Campfire.meta = meta;
