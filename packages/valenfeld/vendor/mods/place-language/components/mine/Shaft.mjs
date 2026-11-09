// mine kit · Shaft
import { h, Fragment } from "../../lib/react.mjs";

// Shaft({ head, foot, winch: { id, name, barred, opened }, t, bt }): a lift shaft between levels. The cage drops you head → foot
// (one way); the climb back is the cage on its winch, jammed until it is freed from the foot. The winch stands at the head.
export const Shaft = ({ head, foot, winch, side = "n", t = 0.3, rt = 0.7 }) => h(Fragment, null,
  h("place", { key: "winch-head", in: head, kind: "winch", at: (r) => r.wall(side, t, 1.2), meaning: "the winding gear over the shaft" }),
  h("link", { key: `drop-${head}`, a: head, b: foot, side, t, how: "drop", oneway: true }),
  winch && h("lock", { key: `lock-${winch.id}`, id: winch.id, where: foot, opens_from: foot, act: "Free", ...winch }),
  h("link", { key: `cage-${foot}`, a: head, b: foot, side, t: rt, how: "cage", lock: winch?.id }));

// meta card (lib/meta.mjs)
export const meta = {
  layer: "relation",
  is: "a lift shaft between two mine levels: a one-way drop down plus a cage on a winch that only winds you back up once it is freed from the bottom",
  tags: ["mine", "shaft", "lift", "cage", "winch", "drop", "levels", "shortcut", "lock"],
  props: { head: "room id at the top (the winch stands here)", foot: "room id at the bottom", winch: "{ id, name, what, key, key_lives, taught, barred, opened }: the lock jamming the cage, freed from the foot (omit: cage runs free)", side: "wall of head the shaft opens on (n default)", t: "fraction along that wall for the drop (0.3)", rt: "fraction for the cage (0.7)" },
  footprint: { kind: "edge" },
  topology: { under: ["Mine", "Level"], takes: [], joins: ["Working", "Adit"], emits: ["prop", "link", "lock"] },
  twins: ["cave/OneWayGate", "plan/Gate", "sewer/GrateShaft"],
  pitfalls: ["not crypt/Shaft: a lift between levels, not an exit room", "the drop is one way: without the winch lock opened (or another route) the foot is a trap", "t and rt must differ or the drop and the cage share a doorway", "head and foot must be different levels/floors"],
};

Shaft.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
