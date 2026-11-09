// mine kit · Adit
import { h } from "../../lib/react.mjs";
import { Working } from "./Working.mjs";

// Adit({ ...working, exit }): the mouth: daylight at your back, a cart line running in
export const Adit = ({ exit, children, ...p }) => h(Working, { kind: "entry", ...p },
  exit && h("exit", { to: exit.to, at: exit.at }), h("light", { kind: "daylight", at: (r) => r.wall("s", "middle", 1.5), y: 3.6, meaning: "the sky behind you; the last real light" }), children);

// meta card (lib/meta.mjs)
export const meta = {
  layer: "space",
  is: "the mine's mouth: the level tunnel you walk in by from the hillside, grey daylight at your back and the way out to the world",
  tags: ["mine", "entrance", "mouth", "adit", "entry", "daylight", "exit"],
  props: { id: "room id", rect: "[x, z, w, d] cells", name: "player-facing name", height: "ceiling m", exit: "{ to: address \"+main#door\", at: cell along the south wall }: the door back to the overworld", purpose: "design note", sightline: "first sight" },
  footprint: { kind: "room", cells: [6, 10], height: 5 },
  topology: { under: ["Level"], takes: ["TramLine", "foe", "loot", "place"], joins: ["Gallery", "Stope", "FloodedDrift"], emits: ["room", "shell", "kit", "exit", "light"] },
  twins: ["cave/Daylight", "wilds/Entrance", "crypt/Shaft"],
  pitfalls: ["the daylight hangs on the south wall: the exit and the mouth should face south (+z)", "without exit the mouth lights but leads nowhere", "one per mine: a second Adit writes a second exit"],
};

Adit.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
