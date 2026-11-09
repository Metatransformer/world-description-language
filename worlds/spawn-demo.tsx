import { Space, World } from "../src/wdl/index.js";
import { Block, Portal, Tree, materials } from "./rpg-kit.js";
import { SpawnPalette, Pine, Boulder } from "@generative-world-studio/valenfeld";
import { CottageInterior, WorkshopInterior } from "./spawn/interiors.js";
import { FoundersBarrow } from "./spawn/dungeon.js";
import { dungeonMaterials } from "../src/dungeon/kits.js";
import { House, Storey, Roof, Windows, Chimney, Well, MarketStall, Tavern, DrownedLantern, TreasureChest } from "./spawn/components.js";

/** Original house placements and architectural parts from Valenfeld's JSX source. */
export function ValenfeldHouses({ palette }: { palette: SpawnPalette }) {
  const slate = "oklch(0.95 0.01 200)", thatch = "cdn/texture-hay-bale-straw.png";
  return <>
    <House key="house-1" palette={palette} at={[-32, 0, -10]} yaw={180} w={7}><Roof color={slate} /><Windows shutters="#2f3d52" /><Chimney side={1} /></House>
    <House key="house-2" palette={palette} at={[-32, 0, 10]} w={7}><Roof color="oklch(0.72 0.11 40)" /><Windows shutters="#2f3d52" /><Chimney side={-1} /></House>
    <House key="house-3" palette={palette} at={[-32, 2.1, 27]} w={6}><Storey two={false} /><Roof color="oklch(0.85 0.07 85)" texture={thatch} /><Windows shutters="#4f6b4a" /><Chimney side={1} /></House>
    <House key="house-4" palette={palette} at={[-14, 0, 32]} w={8}><Roof color="oklch(0.75 0.05 160)" /><Windows shutters="#a8452e" /><Chimney side={1} /></House>
    <House key="house-5" palette={palette} at={[30, 0, 10]} w={7}><Roof color={slate} /><Windows shutters="#4f6b4a" /><Chimney side={1} /></House>
    <House key="house-6" palette={palette} at={[31, 0, -10]} yaw={180} w={7}><Roof color="oklch(0.68 0.12 35)" /><Windows shutters="#c9a45a" /><Chimney side={-1} /></House>
    <House key="house-7" palette={palette} at={[32, 0, 27]} w={6}><Storey two={false} /><Roof color="oklch(0.8 0.08 80)" texture={thatch} /><Windows shutters="#2f3d52" /><Chimney side={-1} /></House>
    <House key="house-8" palette={palette} at={[14, 0, 31]} w={7} d={5}><Roof color="oklch(0.82 0.07 85)" texture={thatch} /><Windows shutters="#a8452e" /><Chimney side={-1} /></House>
  </>;
}
export default function SpawnDemo() {
  const palette = new SpawnPalette();
  palette.materials.push(...materials, ...dungeonMaterials);
  return <World key="valenfeld" name="Valenfeld · Spawn component port" materials={palette.materials}
    metadata={{ start: { space: "town", position: [0, 1, 14] }, tour: [
      { space: "town", label: "Market square", position: [0, 1, 14] },
      { space: "inn", label: "Drowned Lantern inn", position: [0, 1, -5] },
      { space: "cottage", label: "West lane cottage", position: [0, 1, 3] },
      { space: "workshop", label: "East lane workshop", position: [0, 1, 4] },
      { space: "dungeon", label: "Founders' Barrow dungeon", position: [0, 1, 3] },
    ], behavior: {
      version: 1, stores: {}, capabilities: { "world.travel": { space: "string", x: "number", y: "number", z: "number" }, "inventory.grant": { item: "string" } },
    }, port: { source: "Valenfeld/Spawn", scope: "eight JSX houses, well, market stalls, tavern, Drowned Lantern interior, chest",
      textures: "Spawn CDN references replaced with local procedural materials", excluded: ["NPC AI", "quests", "smoke", "emissive lights", "multiplayer"] } }}>
    <Space key="town" name="Valenfeld · Architectural quarter">
      <Block key="ground" size={[100, 0.5, 100]} position={[0, -0.25, 0]} material="grass" />
      <Block key="square" size={[28, 0.04, 28]} position={[0, 0.02, 5]} />
      <ValenfeldHouses key="houses" palette={palette} />
      <Well key="well" palette={palette} at={[0, 0, 0]} />
      <Pine key="barrow-pine" palette={palette} at={[18, 0, -19]} scale={[0.45, 0.45, 0.45]} />
      <Boulder key="barrow-stone" palette={palette} at={[9, 0, -20]} scale={[0.6, 0.6, 0.6]} />
      <MarketStall key="produce" palette={palette} at={[-9, 0, 3]} goods="produce" />
      <MarketStall key="wares" palette={palette} at={[9, 0, 3]} goods="arms" />
      <Tavern key="tavern" palette={palette} at={[0, 0, -23]} />
      <Portal key="inn-door" position={[-3, 0, -17.5]} to="inn" arrival={[0, 1, -5]} label="Enter the Drowned Lantern" />
      <Portal key="barrow-door" position={[12, 0, -18]} to="dungeon" arrival={[0, 1, 3]} label="Descend into Founders' Barrow" />
      <Portal key="cottage-door" position={[-32, 0, 6.5]} to="cottage" arrival={[0, 1, 3]} label="Enter the west lane cottage" />
      <Portal key="workshop-door" position={[30, 0, 6.5]} to="workshop" arrival={[0, 1, 4]} label="Enter the east lane workshop" />
      <TreasureChest key="town-chest" palette={palette} at={[4, 0, 7]} persistenceKey="spawn-town-chest" />
      {[-44, 44].flatMap(x => [-32, -12, 12, 32].map(z => <Tree key={x + ":" + z} position={[x, 0, z]} />))}
    </Space>
    <Space key="inn" name="The Drowned Lantern · Original procedural interior">
      <DrownedLantern key="shell" palette={palette} />
      <Portal key="exit" position={[0, 0, -6.6]} to="town" arrival={[-3, 1, -14]} label="Return to Valenfeld" />
      <TreasureChest key="guest-chest" palette={palette} at={[5, 0, -5]} persistenceKey="spawn-inn-chest" />
    </Space>
    <Space key="cottage" name="West lane cottage"><CottageInterior key="interior" palette={palette} /></Space>
    <Space key="workshop" name="East lane workshop"><WorkshopInterior key="interior" palette={palette} /></Space>
    <FoundersBarrow key="barrow" palette={palette} />
  </World>;
}
