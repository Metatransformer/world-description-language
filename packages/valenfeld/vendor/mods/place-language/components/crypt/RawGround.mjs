// crypt kit · RawGround
import { h, Fragment } from "../../lib/react.mjs";

// RawGround({ rooms, style, bumps, height }): rooms nobody laid (a robbers' dig, a fallen arc, a rat-nest, roots through the vault): raw rock and a lumpy floor
export const RawGround = ({ rooms, style = "cave", bumps = 3, height = 0.35 }) => h(Fragment, null,
  ...[].concat(rooms).map((room) => h("in", { room, key: `raw-${room}` }, h("natural", { style, bumps, height, seed: room }))));

export const meta = {
  layer: "meaning",
  is: "rooms nobody built: dug earth, fallen spoil or broken-through rock, with raw walls and a lumpy floor among the laid stone",
  tags: ["natural", "raw", "dug", "cave", "rough floor", "collapse", "tunnel", "spoil", "unbuilt"],
  props: {
    rooms: "room id or list of room ids that were dug or broke open, not built",
    style: "the visual kit of the raw walls (cave)",
    bumps: "low mounds on the floor per room (3)",
    height: "how high the floor mounds rise, metres (0.35)",
  },
  footprint: { kind: "room", cells: [4, 10] },
  topology: { under: ["Barrow", "In", "dungeon layer"], takes: [], joins: [], emits: ["kit", "rough"] },
  twins: ["verbs/natural", "verbs/rough", "cave/Hollow", "mine/Drift"],
  pitfalls: [
    "the seed is the room id: renaming the room reshapes its floor",
    "a raw room keeps no straight-line clutter: lay rows of barrels or posts in a built room instead",
    "listing a room twice dresses it twice",
  ],
};
RawGround.meta = meta;
