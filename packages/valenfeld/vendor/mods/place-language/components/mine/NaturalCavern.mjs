// mine kit · NaturalCavern
import { h, useContext } from "../../lib/react.mjs";
import { Chamber } from "../masonry/index.mjs";
import { Way } from "./_shared.mjs";
import { LevelContext } from "./LevelContext.mjs";

// NaturalCavern({ ...room, from, how }): no timbers, no oak: the hollow the miners broke into
export const NaturalCavern = ({ from, how = "breach", side, t, bt, children, ...p }) => {
  const lv = useContext(LevelContext);
  return h(Chamber, { kind: "cavern", wall: "rock", ground: "earth", ceil: "earth", level: lv.n, floor: p.floor ?? lv.floor, ...p },
    h("natural", { style: "cave", bumps: p.bumps ?? 5, height: 0.5, seed: p.id }), h(Way, { from, to: p.id, how, side, t, bt }), children);
};   // natural(): cave kit, rough mounds clear of every door and the walking line; the miners' world stops at the breach

// meta card (lib/meta.mjs)
export const meta = {
  layer: "space",
  is: "a natural cavern the miners holed into: wet raw rock with no timbers or oak, where the dug mine ends and the wild cave begins (often the boss's lair)",
  tags: ["mine", "cave", "cavern", "natural", "breach", "boss", "lair", "raw"],
  props: { id: "room id", rect: "[x, z, w, d] cells", from: "working it is breached from", how: "link kind (breach default)", side: "from's wall", t: "fraction along it", bt: "fraction along the cavern's wall", bumps: "rough floor mounds (default 5)", floor: "floor m (default: level)", height: "ceiling m", kind: "room kind (cavern; boss for a lair)", dais: "boss dais spot, as masonry/Chamber", phase2: "boss phase-two adds, as masonry/Chamber", name: "player-facing name", purpose: "design note", sightline: "first sight" },
  footprint: { kind: "room", cells: [12, 12], height: 9 },
  topology: { under: ["Level"], takes: ["foe", "loot", "place", "light"], joins: ["Working", "Gallery"], emits: ["room", "shell", "natural", "link"] },
  twins: ["cave/Hollow", "cave/Lair", "seacave/Grotto", "plan/Boss"],
  pitfalls: ["not common/NaturalRoom: it is a masonry Chamber shell styled as rock, with no natural mound row", "no mine kit: no rails, timbers or lamps; light it yourself", "the bumps are kept off doors and the walking line, but a tiny rect with many bumps leaves no floor", "a timbered dug room is Working, not this"],
};

NaturalCavern.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
