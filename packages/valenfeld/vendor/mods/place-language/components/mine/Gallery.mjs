// mine kit · Gallery
import { h, useContext } from "../../lib/react.mjs";
import { Way } from "./_shared.mjs";
import { LevelContext } from "./LevelContext.mjs";
import { Working } from "./Working.mjs";
import { TramLine } from "./TramLine.mjs";

// Gallery({ ...working, vein, tram: [fromUV, toUV], cart, from, how }): a level drift driven along the vein, a tram line down it
export function Gallery({ vein, tram, cart, from, how, side, t, children, ...p }) {
  const lv = useContext(LevelContext);
  return h(Working, { kind: "hall", feature: `follows the ${vein ?? lv.vein ?? "vein"}`, ...p },
    tram && h(TramLine, { from: tram[0], to: tram[1], cart }), h(Way, { from, to: p.id, how, side, t }), children);
}

// meta card (lib/meta.mjs)
export const meta = {
  layer: "space",
  is: "a long level drift driven along the ore vein, often with a tram line and an ore cart down it: the mine's corridors and spine",
  tags: ["mine", "gallery", "drift", "corridor", "haulage", "vein", "rails", "tram"],
  props: { id: "room id", rect: "[x, z, w, d] cells; long and narrow (2-3 wide)", vein: "vein it follows (default: the Mine's)", tram: "[fromUV, toUV]: rails from one { u, v } spot to another", cart: "0..1 where the ore cart stands on the rails", from: "room it opens off (lays the link)", how: "link kind (tunnel default)", side: "from's wall", t: "fraction along that wall", height: "ceiling m" },
  footprint: { kind: "room", cells: [3, 12], height: 3.5 },
  topology: { under: ["Level"], takes: ["TramLine", "foe", "loot", "place"], joins: ["Stope", "CaveIn", "Gallery", "NaturalCavern"], emits: ["room", "shell", "kit", "link", "rails"] },
  twins: ["sewer/Tunnel", "sewer/Channel", "plan/Space"],
  pitfalls: ["tram spots are { u, v } fractions of this room, not cells", "a cart without tram does nothing", "a Gallery with no from is cut off unless another link reaches it"],
};

Gallery.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
