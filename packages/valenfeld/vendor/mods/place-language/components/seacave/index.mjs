// SEACAVE: a cave the sea cut and people put to use. Harvested from the Smugglers' Grotto (Nov 6): a great chamber with arms off
// it, levels stepping down to the tide, a sea-gate barred from the water side, a wreck wedged on the shingle, sea-glow
// under the water, lanterns on hooks, a crew at work. Used by: grotto.
// Cove → Tide → Grotto({ from }) / Drowned (the boss's pool); SeaGate between grottos; In({ room }) dresses each one.
// Compiles to the DDL host primitives (level, room, link, lock, place, light, hold, loot, foe). A spot is a function of the room.
// Kit index: one component per file in this folder; import from here.
export { Cove } from "./Cove.mjs";
export { Tide } from "./Tide.mjs";
export { Grotto } from "./Grotto.mjs";
export { Drowned } from "./Drowned.mjs";
export { SeaGate } from "./SeaGate.mjs";
export { Sump } from "./Sump.mjs";
export { SluiceWheel } from "./SluiceWheel.mjs";
export { Tideline } from "./Tideline.mjs";
export { Prop } from "./Prop.mjs";
export { Kept } from "./Kept.mjs";
export { Wreck } from "./Wreck.mjs";
export { Lantern } from "./Lantern.mjs";
export { SeaGlow } from "./SeaGlow.mjs";
export { Skylight } from "./Skylight.mjs";
export { Brazier } from "./Brazier.mjs";
export { Strongbox } from "./Strongbox.mjs";
export { Crew } from "./Crew.mjs";
export { Passage, In } from "../plan/index.mjs";
