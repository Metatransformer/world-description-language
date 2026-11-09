// common · NaturalRoom: a room nature cut, rough ground unless it says built
import { h } from "../../lib/react.mjs";
import { Space } from "../plan/index.mjs";
// NaturalRoom({ style, natural, bumps, mound, rough, ...space }): a plan Space plus rough mounds clear of doors and the walking line
export const NaturalRoom = ({ style, natural = true, bumps = 3, mound = 0.35, rough, children, ...p }) => h(Space, p,
  natural && h("natural", { room: p.id, style, ...(rough ? { rough: true } : {}), bumps, height: mound, seed: p.id }), children);
export const meta = {
  layer: "space",
  is: "a room cut by water or sea rather than built, its floor rough with mounds of rock that keep clear of every door",
  tags: ["room", "natural", "cave", "grotto", "hollow", "rock", "rough", "common"],
  props: { style: "the natural kit's skin: cave | seacave", natural: "false = flat built floor", bumps: "mounds on the floor", mound: "mound height m (0.35)", height: "ceiling height m", rough: "true = jagged ground between the mounds", id: "room id", rect: "[x, z, w, d] cells (2 m)", name: "shown name", kind: "room kind", floor: "floor y m (defaults to its Level)", from: "room it opens from", side: "wall of from", at: "cell along it", how: "link kind" },
  footprint: { kind: "room", cells: [6, 6], height: 5 },
  topology: { under: ["Level"], takes: [], joins: ["Passage", "Barrier"], emits: ["room", "link", "natural"] },
  twins: ["cave/Hollow", "seacave/Grotto", "plan/Space"],
  pitfalls: ["no from= and no Passage into it = an unreachable room", "its JSX children do not seat things in it: use In", "height is the ceiling; the mounds take mound=", "a flooded or bridged room wants natural={false} (Grotto does this by kind)", "mine/NaturalCavern is NOT this: it is a masonry Chamber shell in rock, no natural row"],
};
NaturalRoom.meta = meta;
