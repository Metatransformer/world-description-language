// seacave kit · Grotto
import { h } from "../../lib/react.mjs";
import { Space } from "../plan/index.mjs";
import { WET } from "./_shared.mjs";
import { NaturalRoom } from "../common/NaturalRoom.mjs";

// Grotto({ ...space, natural, bumps }): one sea-cut room of the cove: rough natural ground unless it floods, bridges or says natural={false}
export const Grotto = ({ natural, rough = true, ...p }) => NaturalRoom({ ...p, style: "seacave", rough, mound: 0.3, natural: natural ?? !WET.has(p.kind) });

// meta card (lib/meta.mjs)
export const meta = {
  layer: "space",
  is: "a grotto: one sea-cut rock room of a sea cave, rough shingle floor unless it is flooded, bridged or the smugglers' worked room",
  tags: ["seacave", "grotto", "room", "cave", "sea", "chamber", "natural", "smugglers"],
  props: {"id": "room id", "rect": "[x, z, w, d] in 2 m cells", "name": "player-facing name", "kind": "room kind (entry, cavern, hall, flooded, bridge, treasury ...); flooded/bridge drop the rough floor", "floor": "floor height m", "height": "ceiling m", "from": "room it opens off (lays the way in)", "how": "link kind (tunnel, ramp, crawl, bridge ...)", "side": "from's wall n/s/e/w", "at": "where on that wall: a coordinate in cells along it", "secret": "true: a hidden way", "natural": "true/false forces the rough sea-cut floor on or off", "bumps": "rough floor mounds (default 3)", "purpose": "design note", "sightline": "first sight"},
  footprint: { kind: "room", cells: [8, 8], height: 6 },
  topology: { under: ["Tide"], takes: ["In", "foe", "loot", "light", "place"], joins: ["SeaGate", "Sump", "Passage", "Drowned"], emits: ["room", "link", "natural"] },
  twins: ["common/NaturalRoom", "plan/Space", "mine/Working", "mine/NaturalCavern", "cave/Hollow", "masonry/Chamber"],
  pitfalls: ["at is a coordinate along from's wall (plan kit), not a 0..1 fraction like mine's t", "dressing goes in a separate In room= block, not as children", "a worked room (counting house) still bumps unless natural={false}"],
};

Grotto.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
