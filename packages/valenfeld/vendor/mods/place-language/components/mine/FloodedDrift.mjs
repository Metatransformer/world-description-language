// mine kit · FloodedDrift
import { h } from "../../lib/react.mjs";
import { Way } from "./_shared.mjs";
import { Working } from "./Working.mjs";

// FloodedDrift({ ...working, depth, from }): an old drift the water took when the pumps stopped
export const FloodedDrift = ({ depth = 0.7, from, how = "ramp", children, ...p }) => h(Working, { kind: "flooded", timbered: 3, ...p },
  h("pool", { depth }), h(Way, { from, to: p.id, how }), children);

// meta card (lib/meta.mjs)
export const meta = {
  layer: "space",
  is: "an old drift the water took when the pumps stopped: a mine working standing in dark water you wade through",
  tags: ["mine", "flooded", "water", "drift", "pool", "wade", "drowned"],
  props: { id: "room id", rect: "[x, z, w, d] cells", depth: "water depth m (default 0.7)", from: "room it opens off", how: "link kind (ramp default: the floor dips into the flood)", floor: "floor height m (set it below its neighbour)", height: "ceiling m", name: "player-facing name", purpose: "design note", sightline: "first sight" },
  footprint: { kind: "room", cells: [4, 12], height: 4 },
  topology: { under: ["Level"], takes: ["foe", "loot", "place", "TramLine"], joins: ["Adit", "Gallery"], emits: ["room", "shell", "kit", "pool", "link"] },
  twins: ["sewer/FloodedRun", "sewer/Cistern", "sewer/Floodwater"],
  pitfalls: ["depth past ~1.2 m drowns the walking line: players expect to wade, not swim", "set its floor lower than from or the ramp runs up into water", "its own side/t are not passed to the way: it opens from from's default wall"],
};

FloodedDrift.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
