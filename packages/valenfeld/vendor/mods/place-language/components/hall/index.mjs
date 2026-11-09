// HALL: the inside of a building people live and work in. Harvested from the Valenfeld Fighters Guild hall (Nov 6): its
// residents at their posts, a bunk room laid as a row, the training dummies, the guild's members' chest, the house containers
// a thief can search, the lamp over the anvil, the door back out. Grown on the Mages Guild (glass, arcane lamps), the inn (patrons,
// rented beds) and the smithy. Used by: valenfeld-fighters-guild, valenfeld-mages-guild, valenfeld-inn, valenfeld-smithy.
// Interior({ place, floor }) → Wing({ name, at }) → Resident / Bed / BunkRow / Dummy / Container / Coffer / GuildChest / Lamp /
// ExitDoor / Keep. Each renders one <row> host (a standing scene row); a spot is [x, z] in the hall's metres, or relative to
// the Wing it stands in (Wing at + spot). y defaults to the hall's floor.
// Kit index: one component per file in this folder; import from here.
export { HallContext } from "./HallContext.mjs";
export { Interior } from "./Interior.mjs";
export { Wing } from "./Wing.mjs";
export { Keep } from "./Keep.mjs";
export { Resident } from "./Resident.mjs";
export { Patron } from "./Patron.mjs";
export { InnBed } from "./InnBed.mjs";
export { Sack } from "./Sack.mjs";
export { StainedGlass } from "./StainedGlass.mjs";
export { ArcaneLamp } from "./ArcaneLamp.mjs";
export { Bed } from "./Bed.mjs";
export { BunkRow } from "./BunkRow.mjs";
export { Dummy } from "./Dummy.mjs";
export { Container } from "./Container.mjs";
export { Coffer } from "./Coffer.mjs";
export { GuildChest } from "./GuildChest.mjs";
export { Lamp } from "./Lamp.mjs";
export { ExitDoor } from "./ExitDoor.mjs";
export { Room } from "./Room.mjs";
export { CommonRoom } from "./CommonRoom.mjs";
export { Bunkroom } from "./Bunkroom.mjs";
export { Cellar } from "./Cellar.mjs";
export { Crowd } from "./Crowd.mjs";
export { Stock } from "./Stock.mjs";
export { Lectern } from "./Lectern.mjs";
export { CacheNote } from "./CacheNote.mjs";
export { FIRES, fires } from "./fires.mjs";
export { Shell } from "./Shell.mjs";
export { Fixture } from "./Fixture.mjs";
export { Hearth } from "./Hearth.mjs";
export { RecipeRoom } from "./RecipeRoom.mjs";
