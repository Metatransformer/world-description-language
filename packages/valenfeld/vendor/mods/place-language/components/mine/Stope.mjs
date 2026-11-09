// mine kit · Stope
import { h } from "../../lib/react.mjs";
import { Way } from "./_shared.mjs";
import { Working } from "./Working.mjs";

// Stope({ ...working, from, how, worked }): a chamber hollowed out above or beside a gallery where the ore was taken; a dead end
// unless something else breaks into it. worked: "out" leaves rubble and spent stulls.
export const Stope = ({ from, how = "tunnel", side, t, worked = "out", children, ...p }) => h(Working, { kind: "cavern", timbered: 4, ...p },
  h(Way, { from, to: p.id, how, side, t }),
  worked === "out" && h("place", { kind: "rubble", at: { u: 0.5, v: 0.25 }, meaning: "the worked-out face: spoil left where the vein gave out" }),
  worked === "out" && h("place", { kind: "rubble", at: { u: 0.25, v: 0.7 }, meaning: "waste rock nobody hauled" }),
  worked === "out" && h("rough", { bumps: 3, height: 0.3, seed: p.id, meaning: "spoil underfoot: the floor of a stope is never level" }), children);

// meta card (lib/meta.mjs)
export const meta = {
  layer: "space",
  is: "a worked-out stope: the tall ragged chamber left where miners took the ore out above or beside a drift, spoil heaped and stulls left standing; usually a dead end that pays",
  tags: ["mine", "stope", "worked-out", "chamber", "dead-end", "spoil", "rubble", "cache"],
  props: { id: "room id", rect: "[x, z, w, d] cells", height: "ceiling m (stopes run tall, 6-8)", from: "room it opens off (lays the way in)", how: "link kind (tunnel default)", side: "from's wall", t: "fraction along that wall", worked: "\"out\" (default) heaps two rubble piles and rough spoil underfoot; anything else leaves it clean", name: "player-facing name", purpose: "design note", sightline: "first sight" },
  footprint: { kind: "room", cells: [6, 8], height: 7 },
  topology: { under: ["Level"], takes: ["foe", "loot", "place"], joins: ["Gallery"], emits: ["room", "shell", "kit", "link", "prop", "rough"] },
  twins: ["cave/Hollow", "sewer/Vault"],
  pitfalls: ["rubble sits at fixed spots (u .5 v .25, u .25 v .7): keep loot and doors off them", "the rough floor bumps a walking line: a stope meant as a through-route wants worked other than \"out\"", "timber sets come only from Timbering"],
};

Stope.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
