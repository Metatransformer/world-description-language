// crypt kit · DoorWard
import { h, Fragment } from "../../lib/react.mjs";

// DoorWard({ door, depth, spread, sides, kind, lv, why, watch }): two guards standing either side of a door, a step in from it
export const DoorWard = ({ door, depth = 1.5, spread = 1.5, sides = ["w", "e"], kind = "skeleton", lv, why, watch }) => h(Fragment, null,
  ...sides.map((s, i) => { const w = { kind, lv, why, ...(watch?.[i] ?? {}) };
    return h("foe", { key: `ward-${door}-${s}`, kind: w.kind, at: (r) => r.door(door, depth).side(s, spread), lv: w.lv, why: w.why, ...(w.slot ? { slot: w.slot } : {}) }); }));

export const meta = {
  layer: "encounter",
  is: "a pair of guards standing watch either side of the door they keep, so you meet both at once",
  tags: ["guards", "door", "pair", "flank", "watch", "huscarl", "sentry", "ambush"],
  props: {
    door: "id of the room the guarded door leads to",
    depth: "how far in from that door they stand, metres (1.5)",
    spread: "how far each stands off the door's line, metres (1.5)",
    sides: "the two sides they stand on, across the door ([\"w\", \"e\"] for a north or south door)",
    kind: "foe kind for both guards, unless watch says otherwise",
    lv: "level or [min, max] for both",
    why: "why they stand here",
    watch: "per-side overrides [{ kind, lv, why }, { ... }] when the two guards differ",
  },
  footprint: { kind: "edge", cells: [3, 2] },
  topology: { under: ["In", "Burial", "Vault"], takes: [], joins: ["the guarded door"], emits: ["foe"] },
  twins: ["sewer/Rats", "sewer/RatPack", "cave/Ledges", "mine/Guard"],
  pitfalls: [
    "sides must run across the door: a north/south door wants w/e, an east/west door wants n/s, or both guards stand in line",
    "door must name a room linked to this one, or the spot cannot be found",
    "the guarded door should be the one the player must take: on a side door the guards are never met",
  ],
};
DoorWard.meta = meta;
