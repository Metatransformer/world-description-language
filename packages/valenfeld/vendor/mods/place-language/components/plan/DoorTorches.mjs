// plan kit · DoorTorches
import { h, Fragment } from "../../lib/react.mjs";
import { Loc } from "../../lib/ddl.mjs";

// a spot `inset` cells in from the door to `to`, stepped `off` cells along its wall (sign picks the side)
const beside = (r, to, inset, off) => { const a = r.door(to, inset), b = r.door(to, inset + 1);
  return new Loc(a.room, () => { const [x, z] = a.xy(), [x2, z2] = b.xy(), dx = x2 - x, dz = z2 - z; return [x - dz * off, z + dx * off]; }, `${a.label}.beside(${off})`); };

// DoorTorches({ to, gap, y, kind, why }): a pair of torches either side of the doorway that leads to `to`
export const DoorTorches = ({ to, gap = 1.25, y = 2.6, kind = "torch", why = "torches kept lit either side of the door" }) => h(Fragment, null,
  ...[-1, 1].map((s) => h("light", { key: `door-torch-${to}-${s < 0 ? "a" : "b"}`, kind, at: (r) => beside(r, to, 0.3, s * gap), y, meaning: why })));

export const meta = {
  layer: "light",
  is: "a pair of torches burning either side of a doorway, marking the way on (or the door somebody guards)",
  tags: ["torch", "torches", "door", "doorway", "pair", "flank", "light", "entrance", "wall"],
  props: { to: "id of the room the lit door leads to", gap: "how far each torch stands off the door's middle, cells (1.25 = 2.5 m)", y: "height on the wall, metres (2.6)", kind: "light kind (torch; lamp)", why: "who keeps them lit" },
  footprint: { kind: "edge", cells: [3, 1], height: 2.6 },
  topology: { under: ["In"], takes: [], joins: ["the lit door"], emits: ["light"] },
  twins: ["crypt/DoorWard", "sewer/Torch", "common/Light", "hall/Lamp", "seacave/Lantern"],
  pitfalls: ["needs a link from this room to `to`: no door, no torches", "a gap wider than half the wall puts a torch round the corner", "torches say someone lives here: an abandoned door wants none"],
};
DoorTorches.meta = meta;
