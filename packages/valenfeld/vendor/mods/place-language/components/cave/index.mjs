// CAVE: a natural cave nobody built: water cut it, beasts live in it. Harvested from the Greywood Den (Nov 6): its shelves
// stepping down, the limestone shell, fungus-glow instead of torches, the boulder-and-rockfall puzzle, the shepherd's one-way
// hurdle, an abandoned camp, packs of beasts. Used by: greywood-den.
// Cave → Shelf → Hollow({ from }) / Lair, with Rockfall and OneWayGate between hollows; the dressing pass is In({ room }) per hollow.
// Compiles to the DDL host primitives (level, room, kit, link, lock, place, light, loot, foe). A spot is a function of the room handle.
// Kit index: one component per file in this folder; import from here.
export { ShelfContext } from "./ShelfContext.mjs";
export { Cave } from "./Cave.mjs";
export { Shelf } from "./Shelf.mjs";
export { Hollow } from "./Hollow.mjs";
export { Lair } from "./Lair.mjs";
export { Rockfall } from "./Rockfall.mjs";
export { OneWayGate } from "./OneWayGate.mjs";
export { Locks } from "./Locks.mjs";
export { Fungus } from "./Fungus.mjs";
export { Glow } from "./Glow.mjs";
export { Daylight } from "./Daylight.mjs";
export { Boulder } from "./Boulder.mjs";
export { Lure } from "./Lure.mjs";
export { RockfallSeal } from "./RockfallSeal.mjs";
export { Camp } from "./Camp.mjs";
export { Beasts } from "./Beasts.mjs";
export { Passage, In } from "../plan/index.mjs";
export { Perch } from "./Perch.mjs";
export { StoneRing } from "./StoneRing.mjs";
export { FeedingFloor } from "./FeedingFloor.mjs";
export { Ledges } from "./Ledges.mjs";
export { Strew } from "./Strew.mjs";
export { Cobweb } from "./Cobweb.mjs";
export { SpiderNest } from "./SpiderNest.mjs";
