import * as React from "react";
import { Group, type Vec3 } from "@generative-world-studio/core";
import { Geometry } from "./components.js";
import type { SpawnPalette } from "./capture.js";
export type KitProps = { palette: SpawnPalette; at?: Vec3; rotation?: Vec3; scale?: Vec3; seed?: number; params?: Record<string, unknown> };
import * as genAdmin from "../vendor/scripts/gen/admin.js";
export function Admin(props: KitProps) { return <Group key="root" name="Admin" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genAdmin} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genAdmiraltyRuin from "../vendor/scripts/gen/admiralty-ruin.js";
export function AdmiraltyRuin(props: KitProps) { return <Group key="root" name="AdmiraltyRuin" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genAdmiraltyRuin} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genAgave from "../vendor/scripts/gen/agave.js";
export function Agave(props: KitProps) { return <Group key="root" name="Agave" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genAgave} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genAirship from "../vendor/scripts/gen/airship.js";
export function Airship(props: KitProps) { return <Group key="root" name="Airship" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genAirship} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genAppleTree from "../vendor/scripts/gen/apple-tree.js";
export function AppleTree(props: KitProps) { return <Group key="root" name="AppleTree" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genAppleTree} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genArmorPiece from "../vendor/scripts/gen/armor-piece.js";
export function ArmorPiece(props: KitProps) { return <Group key="root" name="ArmorPiece" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genArmorPiece} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genArrow from "../vendor/scripts/gen/arrow.js";
export function Arrow(props: KitProps) { return <Group key="root" name="Arrow" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genArrow} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genAurelith from "../vendor/scripts/gen/aurelith.js";
export function Aurelith(props: KitProps) { return <Group key="root" name="Aurelith" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genAurelith} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genAxe from "../vendor/scripts/gen/axe.js";
export function Axe(props: KitProps) { return <Group key="root" name="Axe" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genAxe} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genBannerCloth from "../vendor/scripts/gen/banner-cloth.js";
export function BannerCloth(props: KitProps) { return <Group key="root" name="BannerCloth" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genBannerCloth} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genBarrowHalls from "../vendor/scripts/gen/barrow-halls.js";
export function BarrowHalls(props: KitProps) { return <Group key="root" name="BarrowHalls" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genBarrowHalls} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genBarrowMouth from "../vendor/scripts/gen/barrow-mouth.js";
export function BarrowMouth(props: KitProps) { return <Group key="root" name="BarrowMouth" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genBarrowMouth} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genBirch from "../vendor/scripts/gen/birch.js";
export function Birch(props: KitProps) { return <Group key="root" name="Birch" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genBirch} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genBird from "../vendor/scripts/gen/bird.js";
export function Bird(props: KitProps) { return <Group key="root" name="Bird" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genBird} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genBoulder from "../vendor/scripts/gen/boulder.js";
export function Boulder(props: KitProps) { return <Group key="root" name="Boulder" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genBoulder} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genBow from "../vendor/scripts/gen/bow.js";
export function Bow(props: KitProps) { return <Group key="root" name="Bow" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genBow} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genBramble from "../vendor/scripts/gen/bramble.js";
export function Bramble(props: KitProps) { return <Group key="root" name="Bramble" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genBramble} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genButterfly from "../vendor/scripts/gen/butterfly.js";
export function Butterfly(props: KitProps) { return <Group key="root" name="Butterfly" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genButterfly} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genCairn from "../vendor/scripts/gen/cairn.js";
export function Cairn(props: KitProps) { return <Group key="root" name="Cairn" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genCairn} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genCampprop from "../vendor/scripts/gen/campprop.js";
export function Campprop(props: KitProps) { return <Group key="root" name="Campprop" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genCampprop} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genCampus from "../vendor/scripts/gen/campus.js";
export function Campus(props: KitProps) { return <Group key="root" name="Campus" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genCampus} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genCat from "../vendor/scripts/gen/cat.js";
export function Cat(props: KitProps) { return <Group key="root" name="Cat" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genCat} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genChest from "../vendor/scripts/gen/chest.js";
export function Chest(props: KitProps) { return <Group key="root" name="Chest" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genChest} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genChicken from "../vendor/scripts/gen/chicken.js";
export function Chicken(props: KitProps) { return <Group key="root" name="Chicken" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genChicken} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genClutter from "../vendor/scripts/gen/clutter.js";
export function Clutter(props: KitProps) { return <Group key="root" name="Clutter" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genClutter} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genCoach from "../vendor/scripts/gen/coach.js";
export function Coach(props: KitProps) { return <Group key="root" name="Coach" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genCoach} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genCog from "../vendor/scripts/gen/cog.js";
export function Cog(props: KitProps) { return <Group key="root" name="Cog" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genCog} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genCrowfootMine from "../vendor/scripts/gen/crowfoot-mine.js";
export function CrowfootMine(props: KitProps) { return <Group key="root" name="CrowfootMine" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genCrowfootMine} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genCrowfootMouth from "../vendor/scripts/gen/crowfoot-mouth.js";
export function CrowfootMouth(props: KitProps) { return <Group key="root" name="CrowfootMouth" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genCrowfootMouth} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genCrownHall from "../vendor/scripts/gen/crown-hall.js";
export function CrownHall(props: KitProps) { return <Group key="root" name="CrownHall" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genCrownHall} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genCurtainWall from "../vendor/scripts/gen/curtain-wall.js";
export function CurtainWall(props: KitProps) { return <Group key="root" name="CurtainWall" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genCurtainWall} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genDatePalm from "../vendor/scripts/gen/date-palm.js";
export function DatePalm(props: KitProps) { return <Group key="root" name="DatePalm" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genDatePalm} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genDeadtree from "../vendor/scripts/gen/deadtree.js";
export function Deadtree(props: KitProps) { return <Group key="root" name="Deadtree" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genDeadtree} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genDeer from "../vendor/scripts/gen/deer.js";
export function Deer(props: KitProps) { return <Group key="root" name="Deer" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genDeer} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genDenLair from "../vendor/scripts/gen/den-lair.js";
export function DenLair(props: KitProps) { return <Group key="root" name="DenLair" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genDenLair} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genDenMouth from "../vendor/scripts/gen/den-mouth.js";
export function DenMouth(props: KitProps) { return <Group key="root" name="DenMouth" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genDenMouth} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genDen from "../vendor/scripts/gen/den.js";
export function Den(props: KitProps) { return <Group key="root" name="Den" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genDen} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genDesertHouse from "../vendor/scripts/gen/desert-house.js";
export function DesertHouse(props: KitProps) { return <Group key="root" name="DesertHouse" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genDesertHouse} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genDomedHall from "../vendor/scripts/gen/domed-hall.js";
export function DomedHall(props: KitProps) { return <Group key="root" name="DomedHall" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genDomedHall} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genDoor from "../vendor/scripts/gen/door.js";
export function Door(props: KitProps) { return <Group key="root" name="Door" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genDoor} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genDragon from "../vendor/scripts/gen/dragon.js";
export function Dragon(props: KitProps) { return <Group key="root" name="Dragon" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genDragon} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genDragonfly from "../vendor/scripts/gen/dragonfly.js";
export function Dragonfly(props: KitProps) { return <Group key="root" name="Dragonfly" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genDragonfly} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genDriftwood from "../vendor/scripts/gen/driftwood.js";
export function Driftwood(props: KitProps) { return <Group key="root" name="Driftwood" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genDriftwood} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genDrownedHalls from "../vendor/scripts/gen/drowned-halls.js";
export function DrownedHalls(props: KitProps) { return <Group key="root" name="DrownedHalls" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genDrownedHalls} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genDrownedTemple from "../vendor/scripts/gen/drowned-temple.js";
export function DrownedTemple(props: KitProps) { return <Group key="root" name="DrownedTemple" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genDrownedTemple} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genDryMill from "../vendor/scripts/gen/dry-mill.js";
export function DryMill(props: KitProps) { return <Group key="root" name="DryMill" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genDryMill} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genDunegrass from "../vendor/scripts/gen/dunegrass.js";
export function Dunegrass(props: KitProps) { return <Group key="root" name="Dunegrass" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genDunegrass} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genDungeonKit from "../vendor/scripts/gen/dungeon-kit.js";
export function DungeonKit(props: KitProps) { return <Group key="root" name="DungeonKit" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genDungeonKit} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genEqHumanoid from "../vendor/scripts/gen/eq-humanoid.js";
export function EqHumanoid(props: KitProps) { return <Group key="root" name="EqHumanoid" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genEqHumanoid} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genExciseHouse from "../vendor/scripts/gen/excise-house.js";
export function ExciseHouse(props: KitProps) { return <Group key="root" name="ExciseHouse" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genExciseHouse} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genFarmhouseRoom from "../vendor/scripts/gen/farmhouse-room.js";
export function FarmhouseRoom(props: KitProps) { return <Group key="root" name="FarmhouseRoom" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genFarmhouseRoom} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genFarmstead from "../vendor/scripts/gen/farmstead.js";
export function Farmstead(props: KitProps) { return <Group key="root" name="Farmstead" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genFarmstead} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genFern from "../vendor/scripts/gen/fern.js";
export function Fern(props: KitProps) { return <Group key="root" name="Fern" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genFern} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genFerrowArch from "../vendor/scripts/gen/ferrow-arch.js";
export function FerrowArch(props: KitProps) { return <Group key="root" name="FerrowArch" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genFerrowArch} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genFightersGuild from "../vendor/scripts/gen/fighters-guild.js";
export function FightersGuild(props: KitProps) { return <Group key="root" name="FightersGuild" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genFightersGuild} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genFightersHall from "../vendor/scripts/gen/fighters-hall.js";
export function FightersHall(props: KitProps) { return <Group key="root" name="FightersHall" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genFightersHall} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genFightersRing from "../vendor/scripts/gen/fighters-ring.js";
export function FightersRing(props: KitProps) { return <Group key="root" name="FightersRing" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genFightersRing} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genFist from "../vendor/scripts/gen/fist.js";
export function Fist(props: KitProps) { return <Group key="root" name="Fist" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genFist} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genFlowerbed from "../vendor/scripts/gen/flowerbed.js";
export function Flowerbed(props: KitProps) { return <Group key="root" name="Flowerbed" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genFlowerbed} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genFootprintTaxHouse from "../vendor/scripts/gen/footprint-tax-house.js";
export function FootprintTaxHouse(props: KitProps) { return <Group key="root" name="FootprintTaxHouse" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genFootprintTaxHouse} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genFowlEyrie from "../vendor/scripts/gen/fowl-eyrie.js";
export function FowlEyrie(props: KitProps) { return <Group key="root" name="FowlEyrie" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genFowlEyrie} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genFox from "../vendor/scripts/gen/fox.js";
export function Fox(props: KitProps) { return <Group key="root" name="Fox" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genFox} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genFrostfangMouth from "../vendor/scripts/gen/frostfang-mouth.js";
export function FrostfangMouth(props: KitProps) { return <Group key="root" name="FrostfangMouth" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genFrostfangMouth} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genFrostfang from "../vendor/scripts/gen/frostfang.js";
export function Frostfang(props: KitProps) { return <Group key="root" name="Frostfang" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genFrostfang} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genFurnish from "../vendor/scripts/gen/furnish.js";
export function Furnish(props: KitProps) { return <Group key="root" name="Furnish" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genFurnish} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genGaol from "../vendor/scripts/gen/gaol.js";
export function Gaol(props: KitProps) { return <Group key="root" name="Gaol" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genGaol} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genGlowcap from "../vendor/scripts/gen/glowcap.js";
export function Glowcap(props: KitProps) { return <Group key="root" name="Glowcap" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genGlowcap} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genGorseInn from "../vendor/scripts/gen/gorse-inn.js";
export function GorseInn(props: KitProps) { return <Group key="root" name="GorseInn" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genGorseInn} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genGreataxe from "../vendor/scripts/gen/greataxe.js";
export function Greataxe(props: KitProps) { return <Group key="root" name="Greataxe" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genGreataxe} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genGrottoMouth from "../vendor/scripts/gen/grotto-mouth.js";
export function GrottoMouth(props: KitProps) { return <Group key="root" name="GrottoMouth" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genGrottoMouth} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genGrotto from "../vendor/scripts/gen/grotto.js";
export function Grotto(props: KitProps) { return <Group key="root" name="Grotto" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genGrotto} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genGroundpatch from "../vendor/scripts/gen/groundpatch.js";
export function Groundpatch(props: KitProps) { return <Group key="root" name="Groundpatch" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genGroundpatch} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genGullShrine from "../vendor/scripts/gen/gull-shrine.js";
export function GullShrine(props: KitProps) { return <Group key="root" name="GullShrine" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genGullShrine} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genGullspiteMoorings from "../vendor/scripts/gen/gullspite-moorings.js";
export function GullspiteMoorings(props: KitProps) { return <Group key="root" name="GullspiteMoorings" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genGullspiteMoorings} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genHagHut from "../vendor/scripts/gen/hag-hut.js";
export function HagHut(props: KitProps) { return <Group key="root" name="HagHut" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genHagHut} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genHangingOakShrine from "../vendor/scripts/gen/hanging-oak-shrine.js";
export function HangingOakShrine(props: KitProps) { return <Group key="root" name="HangingOakShrine" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genHangingOakShrine} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genHarbour from "../vendor/scripts/gen/harbour.js";
export function Harbour(props: KitProps) { return <Group key="root" name="Harbour" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genHarbour} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genHarbourhall from "../vendor/scripts/gen/harbourhall.js";
export function Harbourhall(props: KitProps) { return <Group key="root" name="Harbourhall" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genHarbourhall} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genHarbourprop from "../vendor/scripts/gen/harbourprop.js";
export function Harbourprop(props: KitProps) { return <Group key="root" name="Harbourprop" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genHarbourprop} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genHare from "../vendor/scripts/gen/hare.js";
export function Hare(props: KitProps) { return <Group key="root" name="Hare" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genHare} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genHbArcade from "../vendor/scripts/gen/hb-arcade.js";
export function HbArcade(props: KitProps) { return <Group key="root" name="HbArcade" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genHbArcade} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genHbCastle from "../vendor/scripts/gen/hb-castle.js";
export function HbCastle(props: KitProps) { return <Group key="root" name="HbCastle" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genHbCastle} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genHbColiseum from "../vendor/scripts/gen/hb-coliseum.js";
export function HbColiseum(props: KitProps) { return <Group key="root" name="HbColiseum" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genHbColiseum} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genHbCrowd from "../vendor/scripts/gen/hb-crowd.js";
export function HbCrowd(props: KitProps) { return <Group key="root" name="HbCrowd" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genHbCrowd} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genHbGreen from "../vendor/scripts/gen/hb-green.js";
export function HbGreen(props: KitProps) { return <Group key="root" name="HbGreen" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genHbGreen} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genHbGuildhall from "../vendor/scripts/gen/hb-guildhall.js";
export function HbGuildhall(props: KitProps) { return <Group key="root" name="HbGuildhall" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genHbGuildhall} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genHbOldquarter from "../vendor/scripts/gen/hb-oldquarter.js";
export function HbOldquarter(props: KitProps) { return <Group key="root" name="HbOldquarter" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genHbOldquarter} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genHbQuay from "../vendor/scripts/gen/hb-quay.js";
export function HbQuay(props: KitProps) { return <Group key="root" name="HbQuay" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genHbQuay} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genHbSpan from "../vendor/scripts/gen/hb-span.js";
export function HbSpan(props: KitProps) { return <Group key="root" name="HbSpan" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genHbSpan} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genHbStreet from "../vendor/scripts/gen/hb-street.js";
export function HbStreet(props: KitProps) { return <Group key="root" name="HbStreet" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genHbStreet} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genHbTerrace from "../vendor/scripts/gen/hb-terrace.js";
export function HbTerrace(props: KitProps) { return <Group key="root" name="HbTerrace" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genHbTerrace} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genHbWall from "../vendor/scripts/gen/hb-wall.js";
export function HbWall(props: KitProps) { return <Group key="root" name="HbWall" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genHbWall} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genHeadlandLight from "../vendor/scripts/gen/headland-light.js";
export function HeadlandLight(props: KitProps) { return <Group key="root" name="HeadlandLight" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genHeadlandLight} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genHeather from "../vendor/scripts/gen/heather.js";
export function Heather(props: KitProps) { return <Group key="root" name="Heather" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genHeather} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genHedgebush from "../vendor/scripts/gen/hedgebush.js";
export function Hedgebush(props: KitProps) { return <Group key="root" name="Hedgebush" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genHedgebush} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genHelmet from "../vendor/scripts/gen/helmet.js";
export function Helmet(props: KitProps) { return <Group key="root" name="Helmet" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genHelmet} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genHerb from "../vendor/scripts/gen/herb.js";
export function Herb(props: KitProps) { return <Group key="root" name="Herb" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genHerb} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genHermitCave from "../vendor/scripts/gen/hermit-cave.js";
export function HermitCave(props: KitProps) { return <Group key="root" name="HermitCave" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genHermitCave} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genHighkingCastle from "../vendor/scripts/gen/highking-castle.js";
export function HighkingCastle(props: KitProps) { return <Group key="root" name="HighkingCastle" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genHighkingCastle} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genHorse from "../vendor/scripts/gen/horse.js";
export function Horse(props: KitProps) { return <Group key="root" name="Horse" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genHorse} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genHouse from "../vendor/scripts/gen/house.js";
export function House(props: KitProps) { return <Group key="root" name="House" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genHouse} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genInnHall from "../vendor/scripts/gen/inn-hall.js";
export function InnHall(props: KitProps) { return <Group key="root" name="InnHall" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genInnHall} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genInn from "../vendor/scripts/gen/inn.js";
export function Inn(props: KitProps) { return <Group key="root" name="Inn" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genInn} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genInterior from "../vendor/scripts/gen/interior.js";
export function Interior(props: KitProps) { return <Group key="root" name="Interior" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genInterior} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genJail from "../vendor/scripts/gen/jail.js";
export function Jail(props: KitProps) { return <Group key="root" name="Jail" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genJail} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genJuniper from "../vendor/scripts/gen/juniper.js";
export function Juniper(props: KitProps) { return <Group key="root" name="Juniper" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genJuniper} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genKaldmoor from "../vendor/scripts/gen/kaldmoor.js";
export function Kaldmoor(props: KitProps) { return <Group key="root" name="Kaldmoor" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genKaldmoor} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genKeepNorthRange from "../vendor/scripts/gen/keep-north-range.js";
export function KeepNorthRange(props: KitProps) { return <Group key="root" name="KeepNorthRange" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genKeepNorthRange} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genKelp from "../vendor/scripts/gen/kelp.js";
export function Kelp(props: KitProps) { return <Group key="root" name="Kelp" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genKelp} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genLanternRock from "../vendor/scripts/gen/lantern-rock.js";
export function LanternRock(props: KitProps) { return <Group key="root" name="LanternRock" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genLanternRock} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genLensStand from "../vendor/scripts/gen/lens-stand.js";
export function LensStand(props: KitProps) { return <Group key="root" name="LensStand" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genLensStand} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genLighthouse from "../vendor/scripts/gen/lighthouse.js";
export function Lighthouse(props: KitProps) { return <Group key="root" name="Lighthouse" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genLighthouse} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genLog from "../vendor/scripts/gen/log.js";
export function Log(props: KitProps) { return <Group key="root" name="Log" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genLog} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genLonghall from "../vendor/scripts/gen/longhall.js";
export function Longhall(props: KitProps) { return <Group key="root" name="Longhall" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genLonghall} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genMace from "../vendor/scripts/gen/mace.js";
export function Mace(props: KitProps) { return <Group key="root" name="Mace" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genMace} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genMagesAnnex from "../vendor/scripts/gen/mages-annex.js";
export function MagesAnnex(props: KitProps) { return <Group key="root" name="MagesAnnex" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genMagesAnnex} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genMagesGuild from "../vendor/scripts/gen/mages-guild.js";
export function MagesGuild(props: KitProps) { return <Group key="root" name="MagesGuild" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genMagesGuild} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genMagesHall from "../vendor/scripts/gen/mages-hall.js";
export function MagesHall(props: KitProps) { return <Group key="root" name="MagesHall" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genMagesHall} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genMarketStall from "../vendor/scripts/gen/market-stall.js";
export function MarketStall(props: KitProps) { return <Group key="root" name="MarketStall" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genMarketStall} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genMarshEdge from "../vendor/scripts/gen/marsh-edge.js";
export function MarshEdge(props: KitProps) { return <Group key="root" name="MarshEdge" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genMarshEdge} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genMasonry from "../vendor/scripts/gen/masonry.js";
export function Masonry(props: KitProps) { return <Group key="root" name="Masonry" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genMasonry} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genMastMarker from "../vendor/scripts/gen/mast-marker.js";
export function MastMarker(props: KitProps) { return <Group key="root" name="MastMarker" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genMastMarker} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genMerged from "../vendor/scripts/gen/merged.js";
export function Merged(props: KitProps) { return <Group key="root" name="Merged" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genMerged} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genMilestone from "../vendor/scripts/gen/milestone.js";
export function Milestone(props: KitProps) { return <Group key="root" name="Milestone" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genMilestone} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genMosswatchCastle from "../vendor/scripts/gen/mosswatch-castle.js";
export function MosswatchCastle(props: KitProps) { return <Group key="root" name="MosswatchCastle" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genMosswatchCastle} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genMudWall from "../vendor/scripts/gen/mud-wall.js";
export function MudWall(props: KitProps) { return <Group key="root" name="MudWall" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genMudWall} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genOak from "../vendor/scripts/gen/oak.js";
export function Oak(props: KitProps) { return <Group key="root" name="Oak" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genOak} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genOasisPool from "../vendor/scripts/gen/oasis-pool.js";
export function OasisPool(props: KitProps) { return <Group key="root" name="OasisPool" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genOasisPool} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genOldThalorDocks from "../vendor/scripts/gen/old-thalor-docks.js";
export function OldThalorDocks(props: KitProps) { return <Group key="root" name="OldThalorDocks" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genOldThalorDocks} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genPalisade from "../vendor/scripts/gen/palisade.js";
export function Palisade(props: KitProps) { return <Group key="root" name="Palisade" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genPalisade} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genPalm from "../vendor/scripts/gen/palm.js";
export function Palm(props: KitProps) { return <Group key="root" name="Palm" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genPalm} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genPieceLamppost from "../vendor/scripts/gen/piece-lamppost.js";
export function PieceLamppost(props: KitProps) { return <Group key="root" name="PieceLamppost" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genPieceLamppost} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genPieceMound from "../vendor/scripts/gen/piece-mound.js";
export function PieceMound(props: KitProps) { return <Group key="root" name="PieceMound" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genPieceMound} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genPieceRoof from "../vendor/scripts/gen/piece-roof.js";
export function PieceRoof(props: KitProps) { return <Group key="root" name="PieceRoof" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genPieceRoof} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genPieceTripod from "../vendor/scripts/gen/piece-tripod.js";
export function PieceTripod(props: KitProps) { return <Group key="root" name="PieceTripod" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genPieceTripod} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genPieceWindow from "../vendor/scripts/gen/piece-window.js";
export function PieceWindow(props: KitProps) { return <Group key="root" name="PieceWindow" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genPieceWindow} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genPieces from "../vendor/scripts/gen/pieces.js";
export function Pieces(props: KitProps) { return <Group key="root" name="Pieces" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genPieces} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genPine from "../vendor/scripts/gen/pine.js";
export function Pine(props: KitProps) { return <Group key="root" name="Pine" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genPine} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genProp from "../vendor/scripts/gen/prop.js";
export function Prop(props: KitProps) { return <Group key="root" name="Prop" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genProp} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genQuad from "../vendor/scripts/gen/quad.js";
export function Quad(props: KitProps) { return <Group key="root" name="Quad" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genQuad} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genQuarry from "../vendor/scripts/gen/quarry.js";
export function Quarry(props: KitProps) { return <Group key="root" name="Quarry" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genQuarry} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genReedSteading from "../vendor/scripts/gen/reed-steading.js";
export function ReedSteading(props: KitProps) { return <Group key="root" name="ReedSteading" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genReedSteading} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genReeds from "../vendor/scripts/gen/reeds.js";
export function Reeds(props: KitProps) { return <Group key="root" name="Reeds" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genReeds} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genRidgeOverlook from "../vendor/scripts/gen/ridge-overlook.js";
export function RidgeOverlook(props: KitProps) { return <Group key="root" name="RidgeOverlook" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genRidgeOverlook} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genRock from "../vendor/scripts/gen/rock.js";
export function Rock(props: KitProps) { return <Group key="root" name="Rock" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genRock} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genRuinTower from "../vendor/scripts/gen/ruin-tower.js";
export function RuinTower(props: KitProps) { return <Group key="root" name="RuinTower" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genRuinTower} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genSaltFarms from "../vendor/scripts/gen/salt-farms.js";
export function SaltFarms(props: KitProps) { return <Group key="root" name="SaltFarms" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genSaltFarms} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genSaltRoadFort from "../vendor/scripts/gen/salt-road-fort.js";
export function SaltRoadFort(props: KitProps) { return <Group key="root" name="SaltRoadFort" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genSaltRoadFort} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genSandtombMouth from "../vendor/scripts/gen/sandtomb-mouth.js";
export function SandtombMouth(props: KitProps) { return <Group key="root" name="SandtombMouth" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genSandtombMouth} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genSandtomb from "../vendor/scripts/gen/sandtomb.js";
export function Sandtomb(props: KitProps) { return <Group key="root" name="Sandtomb" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genSandtomb} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genScorpion from "../vendor/scripts/gen/scorpion.js";
export function Scorpion(props: KitProps) { return <Group key="root" name="Scorpion" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genScorpion} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genScrub from "../vendor/scripts/gen/scrub.js";
export function Scrub(props: KitProps) { return <Group key="root" name="Scrub" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genScrub} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genSeaFort from "../vendor/scripts/gen/sea-fort.js";
export function SeaFort(props: KitProps) { return <Group key="root" name="SeaFort" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genSeaFort} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genSentinelHead from "../vendor/scripts/gen/sentinel-head.js";
export function SentinelHead(props: KitProps) { return <Group key="root" name="SentinelHead" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genSentinelHead} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genSerpent from "../vendor/scripts/gen/serpent.js";
export function Serpent(props: KitProps) { return <Group key="root" name="Serpent" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genSerpent} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genSettlement from "../vendor/scripts/gen/settlement.js";
export function Settlement(props: KitProps) { return <Group key="root" name="Settlement" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genSettlement} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genShed from "../vendor/scripts/gen/shed.js";
export function Shed(props: KitProps) { return <Group key="root" name="Shed" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genShed} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genSheep from "../vendor/scripts/gen/sheep.js";
export function Sheep(props: KitProps) { return <Group key="root" name="Sheep" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genSheep} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genShepherdShelter from "../vendor/scripts/gen/shepherd-shelter.js";
export function ShepherdShelter(props: KitProps) { return <Group key="root" name="ShepherdShelter" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genShepherdShelter} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genShield from "../vendor/scripts/gen/shield.js";
export function Shield(props: KitProps) { return <Group key="root" name="Shield" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genShield} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genShrine from "../vendor/scripts/gen/shrine.js";
export function Shrine(props: KitProps) { return <Group key="root" name="Shrine" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genShrine} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genSignBoard from "../vendor/scripts/gen/sign-board.js";
export function SignBoard(props: KitProps) { return <Group key="root" name="SignBoard" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genSignBoard} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genSignpost from "../vendor/scripts/gen/signpost.js";
export function Signpost(props: KitProps) { return <Group key="root" name="Signpost" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genSignpost} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genSilentClearing from "../vendor/scripts/gen/silent-clearing.js";
export function SilentClearing(props: KitProps) { return <Group key="root" name="SilentClearing" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genSilentClearing} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genSkyIsland from "../vendor/scripts/gen/sky-island.js";
export function SkyIsland(props: KitProps) { return <Group key="root" name="SkyIsland" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genSkyIsland} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genSmithyGear from "../vendor/scripts/gen/smithy-gear.js";
export function SmithyGear(props: KitProps) { return <Group key="root" name="SmithyGear" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genSmithyGear} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genSmithy from "../vendor/scripts/gen/smithy.js";
export function Smithy(props: KitProps) { return <Group key="root" name="Smithy" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genSmithy} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genSmugglersGibbet from "../vendor/scripts/gen/smugglers-gibbet.js";
export function SmugglersGibbet(props: KitProps) { return <Group key="root" name="SmugglersGibbet" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genSmugglersGibbet} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genSnowpine from "../vendor/scripts/gen/snowpine.js";
export function Snowpine(props: KitProps) { return <Group key="root" name="Snowpine" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genSnowpine} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genSongbird from "../vendor/scripts/gen/songbird.js";
export function Songbird(props: KitProps) { return <Group key="root" name="Songbird" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genSongbird} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genSpider from "../vendor/scripts/gen/spider.js";
export function Spider(props: KitProps) { return <Group key="root" name="Spider" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genSpider} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genSpire from "../vendor/scripts/gen/spire.js";
export function Spire(props: KitProps) { return <Group key="root" name="Spire" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genSpire} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genSquirrel from "../vendor/scripts/gen/squirrel.js";
export function Squirrel(props: KitProps) { return <Group key="root" name="Squirrel" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genSquirrel} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genStaff from "../vendor/scripts/gen/staff.js";
export function Staff(props: KitProps) { return <Group key="root" name="Staff" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genStaff} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genStandingStone from "../vendor/scripts/gen/standing-stone.js";
export function StandingStone(props: KitProps) { return <Group key="root" name="StandingStone" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genStandingStone} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genStoreSign from "../vendor/scripts/gen/store-sign.js";
export function StoreSign(props: KitProps) { return <Group key="root" name="StoreSign" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genStoreSign} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genStormBeacon from "../vendor/scripts/gen/storm-beacon.js";
export function StormBeacon(props: KitProps) { return <Group key="root" name="StormBeacon" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genStormBeacon} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genSultanaPalace from "../vendor/scripts/gen/sultana-palace.js";
export function SultanaPalace(props: KitProps) { return <Group key="root" name="SultanaPalace" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genSultanaPalace} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genSunscarProp from "../vendor/scripts/gen/sunscar-prop.js";
export function SunscarProp(props: KitProps) { return <Group key="root" name="SunscarProp" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genSunscarProp} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genSword from "../vendor/scripts/gen/sword.js";
export function Sword(props: KitProps) { return <Group key="root" name="Sword" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genSword} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genTavern from "../vendor/scripts/gen/tavern.js";
export function Tavern(props: KitProps) { return <Group key="root" name="Tavern" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genTavern} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genTent from "../vendor/scripts/gen/tent.js";
export function Tent(props: KitProps) { return <Group key="root" name="Tent" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genTent} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genThalorArsenal from "../vendor/scripts/gen/thalor-arsenal.js";
export function ThalorArsenal(props: KitProps) { return <Group key="root" name="ThalorArsenal" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genThalorArsenal} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genTideCrab from "../vendor/scripts/gen/tide-crab.js";
export function TideCrab(props: KitProps) { return <Group key="root" name="TideCrab" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genTideCrab} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genTideSaint from "../vendor/scripts/gen/tide-saint.js";
export function TideSaint(props: KitProps) { return <Group key="root" name="TideSaint" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genTideSaint} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genTollHut from "../vendor/scripts/gen/toll-hut.js";
export function TollHut(props: KitProps) { return <Group key="root" name="TollHut" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genTollHut} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genTower from "../vendor/scripts/gen/tower.js";
export function Tower(props: KitProps) { return <Group key="root" name="Tower" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genTower} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genTownGate from "../vendor/scripts/gen/town-gate.js";
export function TownGate(props: KitProps) { return <Group key="root" name="TownGate" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genTownGate} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genTownTemple from "../vendor/scripts/gen/town-temple.js";
export function TownTemple(props: KitProps) { return <Group key="root" name="TownTemple" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genTownTemple} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genTownWall from "../vendor/scripts/gen/town-wall.js";
export function TownWall(props: KitProps) { return <Group key="root" name="TownWall" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genTownWall} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genTrainingDummy from "../vendor/scripts/gen/training-dummy.js";
export function TrainingDummy(props: KitProps) { return <Group key="root" name="TrainingDummy" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genTrainingDummy} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genTravelTower from "../vendor/scripts/gen/travel-tower.js";
export function TravelTower(props: KitProps) { return <Group key="root" name="TravelTower" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genTravelTower} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genTroll from "../vendor/scripts/gen/troll.js";
export function Troll(props: KitProps) { return <Group key="root" name="Troll" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genTroll} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genUnpaidShip from "../vendor/scripts/gen/unpaid-ship.js";
export function UnpaidShip(props: KitProps) { return <Group key="root" name="UnpaidShip" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genUnpaidShip} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genVaelCascade from "../vendor/scripts/gen/vael-cascade.js";
export function VaelCascade(props: KitProps) { return <Group key="root" name="VaelCascade" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genVaelCascade} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genValenfeldKeepFloors from "../vendor/scripts/gen/valenfeld-keep-floors.js";
export function ValenfeldKeepFloors(props: KitProps) { return <Group key="root" name="ValenfeldKeepFloors" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genValenfeldKeepFloors} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genValenfeldKeepHall from "../vendor/scripts/gen/valenfeld-keep-hall.js";
export function ValenfeldKeepHall(props: KitProps) { return <Group key="root" name="ValenfeldKeepHall" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genValenfeldKeepHall} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genValenfeldKeep from "../vendor/scripts/gen/valenfeld-keep.js";
export function ValenfeldKeep(props: KitProps) { return <Group key="root" name="ValenfeldKeep" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genValenfeldKeep} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genVineRow from "../vendor/scripts/gen/vine-row.js";
export function VineRow(props: KitProps) { return <Group key="root" name="VineRow" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genVineRow} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genWallCasemate from "../vendor/scripts/gen/wall-casemate.js";
export function WallCasemate(props: KitProps) { return <Group key="root" name="WallCasemate" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genWallCasemate} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genWallTower from "../vendor/scripts/gen/wall-tower.js";
export function WallTower(props: KitProps) { return <Group key="root" name="WallTower" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genWallTower} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genWarhammer from "../vendor/scripts/gen/warhammer.js";
export function Warhammer(props: KitProps) { return <Group key="root" name="Warhammer" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genWarhammer} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genWayshrine from "../vendor/scripts/gen/wayshrine.js";
export function Wayshrine(props: KitProps) { return <Group key="root" name="Wayshrine" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genWayshrine} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genWell from "../vendor/scripts/gen/well.js";
export function Well(props: KitProps) { return <Group key="root" name="Well" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genWell} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genWheelbrookCrossing from "../vendor/scripts/gen/wheelbrook-crossing.js";
export function WheelbrookCrossing(props: KitProps) { return <Group key="root" name="WheelbrookCrossing" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genWheelbrookCrossing} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genWheelbrookMill from "../vendor/scripts/gen/wheelbrook-mill.js";
export function WheelbrookMill(props: KitProps) { return <Group key="root" name="WheelbrookMill" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genWheelbrookMill} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genWheelbrookWheel from "../vendor/scripts/gen/wheelbrook-wheel.js";
export function WheelbrookWheel(props: KitProps) { return <Group key="root" name="WheelbrookWheel" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genWheelbrookWheel} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genWildflowers from "../vendor/scripts/gen/wildflowers.js";
export function Wildflowers(props: KitProps) { return <Group key="root" name="Wildflowers" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genWildflowers} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genWindmill from "../vendor/scripts/gen/windmill.js";
export function Windmill(props: KitProps) { return <Group key="root" name="Windmill" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genWindmill} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genWitnessCove from "../vendor/scripts/gen/witness-cove.js";
export function WitnessCove(props: KitProps) { return <Group key="root" name="WitnessCove" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genWitnessCove} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genWolf from "../vendor/scripts/gen/wolf.js";
export function Wolf(props: KitProps) { return <Group key="root" name="Wolf" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genWolf} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genWraith from "../vendor/scripts/gen/wraith.js";
export function Wraith(props: KitProps) { return <Group key="root" name="Wraith" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genWraith} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genWreckHull from "../vendor/scripts/gen/wreck-hull.js";
export function WreckHull(props: KitProps) { return <Group key="root" name="WreckHull" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genWreckHull} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
import * as genWreckersKirkyard from "../vendor/scripts/gen/wreckers-kirkyard.js";
export function WreckersKirkyard(props: KitProps) { return <Group key="root" name="WreckersKirkyard" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={genWreckersKirkyard} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }
