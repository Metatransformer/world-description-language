// common · Light: one light the place itself gives off; each kit's light word is this with its own kind, height and reason
import { h } from "../../lib/react.mjs";
// Light({ kind, at, y, meaning }): a light row of one kind at one spot; meaning rides only when given
export const Light = ({ kind, at, y, meaning }) => h("light", { kind, at, y, ...(meaning ? { meaning } : {}) });
export const meta = {
  layer: "light",
  is: "one source of light in a room (fungus, a lantern, a torch, daylight through a crack), the kit choosing which",
  tags: ["light", "glow", "lamp", "torch", "daylight", "fungus", "lantern", "common"],
  props: { kind: "host light kind: fungus | seaglow | lamp | torch | daylight | grate", at: "spot: a function of the room or a near() handle", y: "height metres", meaning: "why it is here (optional)" },
  footprint: { kind: "point", height: 2 },
  topology: { under: ["In"], takes: [], joins: [], emits: ["light"] },
  twins: ["cave/Fungus", "cave/Daylight", "seacave/SeaGlow", "seacave/Skylight", "seacave/Lantern", "sewer/Torch"],
  pitfalls: ["no at = no position: the kit words give defaults, this does not", "kind is the host's light kind, not a word: an unknown kind draws the default lamp", "sewer/GrateShaft is NOT this: it also places the grate it shines through", "hall/Lamp and wilds/Lamp emit placed rows in metres, not dungeon light rows: a different family"],
};
Light.meta = meta;
