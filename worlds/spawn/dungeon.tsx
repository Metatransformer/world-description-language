import { Group, Space } from "../../src/wdl/index.js";
import { DungeonArchitecture } from "../../src/dungeon/components.js";
import { createDungeonPlan } from "../../src/dungeon/plan.js";
import { action, defineStore, local, read } from "../../src/runtime/contract.js";
import { Gate, Lever, Portal } from "../rpg-kit.js";
import { TreasureChest } from "./components.js";
import type { SpawnPalette } from "./capture.js";

export const barrowPlan = createDungeonPlan({
  seed: "valenfeld-founders-barrow", theme: "crypt", roomCount: 16,
  levels: 1, loopCount: 4, corridorWidth: 4,
});
barrowPlan.metadata.builders = "Valenfeld's founding families carved a burial complex beneath the north road.";
barrowPlan.metadata.destination = "The Founders' Vault: release its seals from the entrance hall and recover an heirloom.";
const names = ["Threshold of Names", "Bellkeeper's Crossing", "Lantern Gallery", "Masons' Rest", "Hall of Offerings", "The Quiet Archive", "Ash Chapel", "Wardens' Stores", "Pilgrims' Niche", "Broken Reliquary", "Memorial Walk", "Candle Court", "Old Ossuary", "Stonekeepers' Refuge", "Processional Hall", "Founders' Vault"];
barrowPlan.rooms.forEach((room, index) => { room.name = room.id === barrowPlan.goalRoom ? "Founders' Vault" : names[index]!; });

export function FoundersBarrow({ palette }: { palette: SpawnPalette }) {
  const vault = barrowPlan.rooms.find(room => room.id === barrowPlan.goalRoom)!;
  const seal = defineStore({ open: false }, { toggle: { steps: [{ op: "toggle", field: "open" }] } });
  return <Space key="dungeon" name="Founders' Barrow" properties={{ kind: "dungeon", dungeonPlan: barrowPlan }}>
    <Group key="barrow" name="Founders' burial complex" properties={{ wdl: { scope: local(seal, "valenfeld-barrow-seal") } }}>
      <DungeonArchitecture key="architecture" plan={barrowPlan} />
      <Portal key="exit" position={[0, 0, 5]} to="town" arrival={[12, 1, -15]} label="Return to Valenfeld square" />
      <Lever key="seal" position={[-3, 0, 0]} onInteract={action("toggle")} label="Release the founders' seals" />
      {(vault.doors ?? []).filter(door => door.kind === "passage").map(door =>
        <Group key={door.id} position={door.position} rotation={[0, door.side === "east" || door.side === "west" ? Math.PI / 2 : 0, 0]}>
          <Gate key="seal" position={[0, 1.5, 0]} open={read("open")} />
        </Group>)}
      <TreasureChest key="heirloom" palette={palette} at={vault.position} persistenceKey="valenfeld-barrow-heirloom" />
    </Group>
  </Space>;
}
