// MINE: workings that follow an ore vein down through levels. Harvested from Crowfoot Mine (Nov 6): its timber sets, tram rails,
// ore carts, cave-ins, the cage lift and its winch, the flooded drift, the natural cavern the miners broke into. Used by: crowfoot-mine.
// Mine → Level → Gallery({ vein }) → Stope / CaveIn / TramLine. Each compiles to the DDL host primitives (room, shell, link, lock,
// rails, timbers, place, pool, light); semantic spots are functions of the room handle: at: (r) => r.corner("ne", 1), or { u, v }.
// Kit index: one component per file in this folder; import from here.
export { LevelContext } from "./LevelContext.mjs";
export { Mine } from "./Mine.mjs";
export { Level } from "./Level.mjs";
export { Working } from "./Working.mjs";
export { Timbering } from "./Timbering.mjs";
export { Adit } from "./Adit.mjs";
export { Gallery } from "./Gallery.mjs";
export { TramLine } from "./TramLine.mjs";
export { Stope } from "./Stope.mjs";
export { FloodedDrift } from "./FloodedDrift.mjs";
export { NaturalCavern } from "./NaturalCavern.mjs";
export { CaveIn } from "./CaveIn.mjs";
export { Shaft } from "./Shaft.mjs";
export { Dig } from "./Dig.mjs";
export { Cut } from "./Cut.mjs";
export { Tunnel } from "./Tunnel.mjs";
export { Seal } from "./Seal.mjs";
export { Kept } from "./Kept.mjs";
export { Foe } from "./Foe.mjs";
export { In } from "../plan/index.mjs";
