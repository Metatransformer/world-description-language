// seacave kit · Drowned
import { Boss } from "../plan/index.mjs";

// Drowned({ ...space, dais, phase2 }): the boss's pool at the bottom of the cove
export const Drowned = Boss;

// meta card (lib/meta.mjs)
export const meta = {
  layer: "space",
  is: "the drowned boss's pool at the bottom of a sea cave: the set-piece room where the dead captain rises from the water",
  tags: ["seacave", "boss", "pool", "drowned", "captain", "lair", "arena"],
  props: {"id": "room id", "rect": "[x, z, w, d] in 2 m cells", "name": "player-facing name", "floor": "floor height m", "height": "ceiling m", "from": "room it opens off (lays the way in)", "how": "link kind (tunnel, ramp, crawl, bridge ...)", "side": "from's wall n/s/e/w", "at": "where on that wall: a coordinate in cells along it", "purpose": "design note", "sightline": "first sight", "dais": "{ at, back }: where the boss stands", "phase2": "{ at_hp: 0..1, say, adds: [{ kind, at, lv }] }: what comes at that health"},
  footprint: { kind: "room", cells: [14, 14], height: 9 },
  topology: { under: ["Tide"], takes: ["In"], joins: ["Grotto"], emits: ["room", "link"] },
  twins: ["plan/Boss", "cave/Lair", "sewer/Throne", "crypt/Heart", "mine/NaturalCavern"],
  pitfalls: ["it is plan/Boss: the boss foe itself is a Crew boss row in an In room=, not made by the room", "no rough natural floor (unlike Grotto)", "the water and glow come from the kits layer and SeaGlow, not this"],
};

Drowned.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
