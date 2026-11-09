// mine kit · Working
import { h, useContext } from "../../lib/react.mjs";
import { Chamber } from "../masonry/index.mjs";
import { LevelContext } from "./LevelContext.mjs";

// Working({ id, rect | size+from+dir, name, kind, floor, sightline, purpose }, children): a room cut in rock, oak-capped,
// dressed with the mine kit. The primitive every mine room composes. Its timber sets come after every way is cut: Timbering.
export function Working({ timbered, children, floor, ...p }) {
  const lv = useContext(LevelContext);
  return h(Chamber, { kind: "chamber", wall: "rock", ground: "earth", ceil: "oak", level: lv.n, floor: floor ?? lv.floor, ...p },
    h("kit", { style: "mine" }), children);
}

// meta card (lib/meta.mjs)
export const meta = {
  layer: "space",
  is: "a room hewn out of rock by miners, earth floor and oak-capped roof, dressed with the mine kit: the plain mine room every other working builds on",
  tags: ["mine", "room", "chamber", "working", "hewn", "rock", "timbered"],
  props: { id: "room id", rect: "[x, z, w, d] in 2 m cells", name: "player-facing name", kind: "room kind (chamber, entry, hall, cavern, boss, flooded, shaft ...)", floor: "floor height m (default: its Level's top)", height: "ceiling height m", purpose: "what the room is for in the design", sightline: "what a player sees on entering", wall: "override wall material (default rock)", ground: "override floor material (default earth)", ceil: "override ceiling (default oak)" },
  footprint: { kind: "room", cells: [4, 6], height: 3.5 },
  topology: { under: ["Level", "Mine"], takes: ["TramLine", "foe", "loot", "light", "place", "In"], joins: ["Tunnel", "CaveIn", "Shaft"], emits: ["room", "shell", "kit"] },
  twins: ["masonry/Chamber", "plan/Space", "seacave/Grotto", "cave/Hollow", "sewer/Vault", "crypt/Vault"],
  pitfalls: ["has no way in of its own: link it (or use Gallery/Stope/FloodedDrift which take from)", "the timbered prop is swallowed: timber sets come only from Timbering, laid after every link", "a natural, untimbered hollow is NaturalCavern, not a Working"],
};

Working.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
